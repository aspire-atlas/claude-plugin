// Run with: claude plugin test plugins/aspire
import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const PLUGIN = 'aspire'
const STATUS_TOOL = 'mcp__Aspire_Atlas__get_status'
const PROGRESS_TOOL = 'mcp__aspire__aspire_progress'
const band = { hasSurvey: false, isWorking: false, maxRows: 4, bodyColumns: 120, scroll: { offset: 0, bodyRows: 4 }, view: {} } as const
const pane = { title: '', isFocused: false, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} } as const

const ORGS = { selected: { id: 'org_1', name: 'Sample Brand', role: 'owner' }, all: [{ id: 'org_1', name: 'Sample Brand' }] }
const PROFILES = [{ id: 'p1', name: 'Sample', channels: [{ network: 'instagram' }] }]
const CREDITS = {
  estimate: true,
  organizationId: 'org_z54dtf9al5vg5v92',
  period: { start: '2026-10-01T00:00:00.000Z', end: '2026-11-01T00:00:00.000Z' },
  thisPeriod: { consumed: 3.8, newPosts: { count: 25, rate: 0.1, credits: 2.5 }, retrievedPosts: { count: 26, rate: 0.05, credits: 1.3 } },
  balance: { granted: 1000, consumed: 3.8, remaining: 996.2, overage: 0 },
  grants: [{ kind: 'trial', credits: 1000, startsAt: '2026-07-07T20:59:42.673Z', expiresAt: null }],
}

const WITH_COSTS = {
  organizations: { ...ORGS, selected: { ...ORGS.selected, tokenCosts: { used: 12400, limit: 50000, unit: 'tokens' } } },
  profiles: PROFILES,
}
const WITHOUT_COSTS = { organizations: ORGS, profiles: PROFILES }

const mcpResult = (body: unknown) => {
  const text = JSON.stringify(body)
  return { result: { content: [{ type: 'text', text }] }, text }
}

// The world beneath the plugin: a clock, prompts, the skill's own prompt, the
// Skill tool, an Atlas get_status that answers `status()`, another connector,
// and subagents that start on Opus.
let clock: ReturnType<typeof mock.clock>
const world = (on: On, status: () => unknown, opened: string[] = []) => {
  clock = mock.clock(on, { now: Date.parse('2026-10-14T09:00:00Z') })
  on('ui.open', (_$, e) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('ui.panes', () => ({ value: opened.map(id => ({ id })) }) as never)
  on('ui.close', () => ({ value: undefined }) as never)
  on('prompt.submit', (_$, e) => ({ text: e.text }) as never)
  on('skill.prompt', (_$, e) => ({ text: e.text }))
  // Another band beneath the mod's (Claude Code's own, or another mod's).
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>band beneath</Text>
  })
  on('turn.complete', () => ({ text: '' }) as never)
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('tool.call', { tool: STATUS_TOOL }, () => mcpResult(status()) as never)
  on('tool.call', { tool: 'mcp__linear__get_status' }, () => mcpResult({ tokenCosts: { used: 999, limit: 1000 } }) as never)
  on('tool.call', { tool: 'mcp__linear__list_issues' }, () => mcpResult({ issues: [] }) as never)
  on('tool.call', { tool: 'Skill' }, () => ({ result: { success: true, commandName: 'x' }, text: 'Launching skill' }) as never)
  on('agent.spawn', (_$, e) => ({ model: 'claude-opus-5-5', agentId: `agent-${e.description.replace(/\W+/g, '-')}` }))
}

const typeAspire = ($: Engine, text = '/aspire:aspire') => ($.prompt.submit as (e: unknown) => Promise<unknown>)({ text, wait: false })
const runSkill = ($: Engine) => $.skill.prompt({ skill: 'aspire:aspire', text: 'The aspire skill.' })
const getStatus = ($: Engine, extra: Record<string, unknown> = {}) => $.tool.call({ tool: STATUS_TOOL, context: 'Checking the session.', ...extra } as never)
const report = ($: Engine, input: Record<string, unknown>) => $.tool.call({ tool: PROGRESS_TOOL, ...input } as never)
const spawn = ($: Engine, subagentType: string, description: string) =>
  $.agent.spawn({ tool_use_id: `t-${description}`, prompt: 'p', description, subagentType, provider: { plugin: 'engine', tier: 'core' }, parentModel: 'claude-opus-5-5', background: false, fork: false } as never)
const status = async ($: Engine) => String(((await $.command.run({ command: 'aspire-agents-info', args: 'status' } as never)) as { text?: string }).text)

const bandShows = async ($: Engine, surface: 'terminal' | 'desktop', text: RegExp) => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'AbovePrompt', props: band as never })
  const found = await ui.find({ type: 'Text', text })
  await ui.unmount()
  return found !== undefined
}

/** The progress bar's row: the terminal's texts, or the desktop's one Svg (its alt and source). */
const barShows = async ($: Engine, surface: 'terminal' | 'desktop', text: string) => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'AbovePrompt', props: band as never })
  try {
    if (surface === 'terminal') return (await ui.find({ type: 'Text', text: new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`) })) !== undefined
    const drawn = (await ui.findAll({ type: 'Svg' })).map(el => `${String(el.props.alt)}\n${String(el.props.source)}`).join('\n')
    return drawn.includes(text)
  } finally {
    await ui.unmount()
  }
}

const panelShows = async ($: Engine, text: RegExp) => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const found = await ui.find({ type: 'Text', text })
  await ui.unmount()
  return found !== undefined
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: inert until an Aspire event, then the bar appears`, async ($, on) => {
    const opened: string[] = []
    world(on, () => WITH_COSTS, opened)

    // Before /aspire: unrelated prompts, skills, tools, and agents switch nothing on.
    await typeAspire($, 'what is /aspire for?')
    await typeAspire($, '/aspire-agents-info')
    await $.skill.prompt({ skill: 'commit', text: 'Commit.' })
    await $.tool.call({ tool: 'Skill', skill: 'commit' } as never)
    await $.tool.call({ tool: 'mcp__linear__get_status' } as never)
    await $.tool.call({ tool: 'mcp__linear__list_issues' } as never)
    await spawn($, 'general-purpose', 'Unrelated work')
    expect(await bandShows($, surface, /Atlas/)).toBe(false)
    expect(await barShows($, surface, 'Aspire')).toBe(false)
    expect(await $.command.run({ command: 'aspire-agents-info', args: '' } as never)).toMatchObject({
      text: 'The Aspire agents panel starts once /aspire runs in this session.',
    })
    expect(await status($)).toMatch(/^Aspire mod: loaded, off\./)
    expect(await status($)).toMatch(/Seen: 0 \/aspire prompts, 0 skill\.prompt, 0 Skill tool calls, 0 progress reports, 0 Atlas results, 0 agents\./)
    expect(opened).toEqual([])

    // A typed /aspire switches it on: the bar shows at once, before any get_status.
    await typeAspire($)
    expect(await barShows($, surface, 'Aspire')).toBe(true)
    expect(await barShows($, surface, 'Initializing…')).toBe(true)
    expect(await barShows($, surface, '0%')).toBe(true)
    // The band has no stats row; the panel's summary carries the Atlas figure, none made up.
    expect(await bandShows($, surface, /^Atlas tokens$/)).toBe(false)
    expect(await panelShows($, /^run \/aspire to refresh$/)).toBe(true)
    expect(await panelShows($, /Unrelated work/)).toBe(false)
    expect(await status($)).toMatch(/^Aspire mod: on since 0s ago, switched on by a typed \/aspire \(\/aspire:aspire\)\./)
  })

  test(`${surface}: get_status names the organization and sets the baseline; the skill's report wins`, async ($, on) => {
    let body: unknown = WITH_COSTS
    world(on, () => body)
    await typeAspire($)

    const result = await getStatus($)
    // The call's result passes through untouched.
    expect(result).toMatchObject({ text: JSON.stringify(WITH_COSTS) })
    expect(await barShows($, surface, 'Aspire: Sample Brand')).toBe(true)
    // Atlas answered, but only the skill's report moves the bar.
    expect(await barShows($, surface, 'Initializing…')).toBe(true)
    expect(await barShows($, surface, '0%')).toBe(true)
    expect(await panelShows($, /^12k \/ 50k$/)).toBe(true)

    // The skill reports: its count wins.
    expect(await report($, { title: 'Onboarding', total: 6, done: 4, phase: 'Brand context' })).toMatchObject({ result: `ok: Brand context 4/6, 67%; band: visible on ${surface}` })
    expect(await barShows($, surface, 'Brand context 4/6')).toBe(true)
    await report($, { done: 5, phase: 'First insights' })
    expect(await barShows($, surface, 'First insights 5/6')).toBe(true)
    expect(await barShows($, surface, '83%')).toBe(true)
    await report($, { finished: true })
    expect(await barShows($, surface, 'Awaiting next assignment')).toBe(true)
    expect(await barShows($, surface, '100%')).toBe(true)

    // A later get_status without token costs clears the figure rather than keep a stale one.
    body = WITHOUT_COSTS
    await getStatus($)
    expect(await panelShows($, /12k/)).toBe(false)
    expect(await panelShows($, /^run \/aspire to refresh$/)).toBe(true)
  })
}

test('desktop: the bar is one Svg with the crab', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await getStatus($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const svgs = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source))
  const bar = svgs.find(s => s.includes('Aspire: Sample Brand'))
  expect(bar).toBeDefined()
  expect(bar).toContain('#3B8A82')
  // The crab is a pressable glyph beside the count, not part of the drawing.
  expect(bar).not.toContain('c-other')
  expect(await ui.find({ type: 'Text', text: /🦀/ })).toBeDefined()
  expect(bar).not.toContain('undefined')
  expect(bar).not.toContain('NaN')
  expect(svgs.length).toBeGreaterThanOrEqual(1)
  await ui.unmount()
})

test('several organizations: no name until the call picks one', async ($, on) => {
  const several = { organizations: { selected: { id: 'org_1', name: 'Default Org' }, all: [{ id: 'org_1' }, { id: 'org_2' }] }, profiles: [] }
  let body: unknown = several
  world(on, () => body)
  await typeAspire($)
  await getStatus($)
  expect(await barShows($, 'terminal', 'Aspire')).toBe(true)
  expect(await barShows($, 'terminal', 'Initializing…')).toBe(true)
  body = { ...several, organizations: { ...several.organizations, selected: { id: 'org_2', name: 'Picked Org' } } }
  await getStatus($, { asOrganizationId: 'org_2' })
  expect(await barShows($, 'terminal', 'Aspire: Picked Org')).toBe(true)
  expect(await barShows($, 'terminal', 'Initializing…')).toBe(true)
})

test('each Aspire event switches the mod on and says which', async ($, on) => {
  const cases: [string, ($: Engine) => Promise<unknown>, RegExp][] = [
    ['prompt', $ => typeAspire($, '/aspire agents'), /a typed \/aspire \(\/aspire\)/],
    ['skill.prompt', runSkill, /the aspire skill \(skill\.prompt\) \(aspire:aspire\)/],
    ['Skill tool', $ => $.tool.call({ tool: 'Skill', skill: 'aspire:aspire' } as never), /the Skill tool running the aspire skill \(aspire:aspire\)/],
    ['progress', $ => report($, { title: 'Onboarding', total: 6, done: 0 }), /a progress report from the skill/],
    ['get_status', getStatus, /an Atlas tool result \(get_status\)/],
    ['agent', $ => spawn($, 'aspire:atlas-creator-brief', 'Brief'), /an aspire agent starting \(aspire:atlas-creator-brief\)/],
  ]
  world(on, () => WITH_COSTS)
  on('session.end', () => ({ sessionId: 's1' }) as never)
  for (const [, fire, says] of cases) {
    await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } } as never)
    expect(await status($)).toMatch(/^Aspire mod: loaded, off\./)
    await fire($)
    const text = await status($)
    expect(text).toMatch(says)
    expect(await barShows($, 'terminal', 'Aspire') || (await barShows($, 'terminal', 'Aspire: Sample Brand'))).toBe(true)
  }
})

test('status: counts, the last get_status, the bar, and the version line', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await runSkill($)
  await getStatus($)
  await spawn($, 'aspire:atlas-market-signal', 'Market signal')
  const text = await status($)
  expect(text).toMatch(/Seen: 1 \/aspire prompt, 1 skill\.prompt, 0 Skill tool calls, 0 progress reports, 1 Atlas result, 1 agent\./)
  expect(text).toMatch(/Last get_status 0s ago: 12k \/ 50k Atlas tokens, organization Sample Brand\./)
  expect(text).toMatch(/Bar: Aspire: Sample Brand, market signal 0\/1, 0% \(from the running agents\)\./)
  expect(text).toMatch(/^Claude Code .+ on .+\.$/m)
  expect(text.split('\n')).toHaveLength(6)
})

test('a subagent cannot report the progress', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await report($, { title: 'Onboarding', total: 6, done: 2, phase: 'Organization' })
  expect(await report($, { agentId: 'a1', title: 'Hijacked', total: 9, done: 9, finished: true })).toMatchObject({
    result: 'ignored: only the main session reports Aspire progress',
  })
  expect(await barShows($, 'desktop', 'Organization 2/6')).toBe(true)
  expect(await barShows($, 'desktop', 'Hijacked')).toBe(false)
  expect(await barShows($, 'desktop', 'Awaiting next assignment')).toBe(false)
})

test('a subagent cannot switch the mod on through the progress tool', async ($, on) => {
  world(on, () => WITH_COSTS)
  await report($, { agentId: 'a1', title: 'Hijacked', total: 2 })
  expect(await status($)).toMatch(/^Aspire mod: loaded, off\./)
})

test('a get_status from another connector is never read', async ($, on) => {
  world(on, () => WITHOUT_COSTS)
  await typeAspire($)
  await $.tool.call({ tool: 'mcp__linear__get_status' } as never)
  expect(await bandShows($, 'terminal', /999/)).toBe(false)
  expect(await status($)).toMatch(/0 Atlas results/)
})

test('an aspire agent switches the mod on, lists in the panel, and opens it once', async ($, on) => {
  const opened: string[] = []
  world(on, () => WITH_COSTS, opened)

  await spawn($, 'general-purpose', 'Before aspire')
  await spawn($, 'aspire:atlas-creator-brief', 'Brief for next week')
  await spawn($, 'aspire:atlas-creator-discovery', 'Refill the shortlist')
  // Any subagent started after the mod is on is listed too.
  await spawn($, 'general-purpose', 'Helper after aspire')

  expect(await panelShows($, /Brief for next week/)).toBe(true)
  expect(await panelShows($, /Refill the shortlist/)).toBe(true)
  expect(await panelShows($, /Helper after aspire/)).toBe(true)
  expect(await panelShows($, /Before aspire/)).toBe(false)
  expect(await panelShows($, /Running · 3/)).toBe(true)
  expect(opened).toEqual(['aspire-agents'])

  // A finished run moves under Finished, with no cost figure anywhere.
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ agentId: 'agent-Brief-for-next-week', reason: 'answer', answer: 'ok' })
  expect(await panelShows($, /Running · 2/)).toBe(true)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect((await ui.find({ key: 'done' }))?.props.label).toBe('▾ Finished · 1')
  await ui.unmount()
  expect(await panelShows($, /\$/)).toBe(false)

  // The bar is on, too, with its agents count, and the band beneath it kept.
  expect(await barShows($, 'terminal', 'Aspire')).toBe(true)
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: band as never })
  expect((await bar.find({ key: 'aspire-agents' }))?.props.label).toBe('×3')
  await bar.unmount()
  expect(await bandShows($, 'terminal', /^Atlas tokens$/)).toBe(false)
  expect(await bandShows($, 'terminal', /^band beneath$/)).toBe(true)
})

test("the bar's agents button opens the panel", async ($, on) => {
  const opened: string[] = []
  world(on, () => WITH_COSTS, opened)
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  await ui.press({ key: 'aspire-agents' })
  await ui.unmount()
  expect(opened).toEqual(['aspire-agents'])
})

test('an agent reports its steps; the panel draws them, and the main session cannot', async ($, on) => {
  world(on, () => WITH_COSTS)
  await spawn($, 'aspire:atlas-market-signal', 'Signal for the week')
  const STEP_TOOL = 'mcp__aspire__aspire_step'
  const agentId = 'agent-Signal-for-the-week'
  expect(await $.tool.call({ tool: STEP_TOOL, total: 5, done: 2, note: 'reading posts' } as never)).toMatchObject({ result: 'ignored: only agents report steps' })
  expect(await $.tool.call({ tool: STEP_TOOL, agentId, total: 5, done: 2, note: 'reading posts' } as never)).toMatchObject({ result: 'ok' })
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const drawn = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source)).join('')
  expect(drawn).toContain('2/5 reading posts')
  await ui.unmount()
  // done never passes total; a note left out keeps the last one.
  await $.tool.call({ tool: STEP_TOOL, agentId, done: 99 } as never)
  const again = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect((await again.findAll({ type: 'Svg' })).map(el => String(el.props.source)).join('')).toContain('5/5 reading posts')
})

test('the Agents tab shows a crab card for every agent type, and marks the ones that ran', async ($, on) => {
  world(on, () => WITH_COSTS)
  await spawn($, 'aspire:atlas-market-signal', 'Signal for the week')
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await ui.press({ key: 'tab-agents' })
  const cards = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source))
  // One credits card above the tabs, then a card per agent type.
  expect(cards).toHaveLength(26)
  expect(cards.filter(c => c.includes('Market signal'))[0]).toContain('running')
  expect(cards.filter(c => c.includes('Orchestrator'))[0]).not.toContain('ready')
  expect(cards.join('')).not.toContain('undefined')
  await ui.press({ key: 'tab-live' })
  expect(await ui.find({ type: 'Svg' })).toBeDefined()
  await ui.unmount()
})

test('the Agents tab on the terminal lists every agent type in text', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await ui.press({ key: 'tab-agents' })
  expect(await ui.find({ type: 'Text', text: /Creator vetting/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Orchestrator/ })).toBeDefined()
  await ui.unmount()
})

test('the tabs read as tabs, and pressing an agent drafts its start in the prompt without sending it', async ($, on) => {
  world(on, () => WITH_COSTS)
  const drafts: { text?: string; mode?: string }[] = []
  on('prompt.fill', (_$, e) => {
    drafts.push(e as never)
    return { isFilled: true, text: (e as { text: string }).text, cursor: 0 } as never
  })
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect((await ui.find({ key: 'tab-live' }))?.props.label).toBe('[ Live ]')
  expect(String((await ui.find({ key: 'tab-agents' }))?.props.label)).toMatch(/^ {2}Agents · \d+ ›$/)
  await ui.press({ key: 'tab-agents' })
  expect(String((await ui.find({ key: 'tab-agents' }))?.props.label)).toMatch(/^\[ Agents · \d+ \]$/)
  await ui.press({ key: 'aspire:atlas-creator-vetting' })
  await ui.unmount()
  expect(drafts).toHaveLength(1)
  expect(drafts[0]).toMatchObject({ text: '/aspire:aspire run atlas-creator-vetting', mode: 'replace' })
})

test('on the desktop the pressed crab walks off its card, then the start is drafted', async ($, on) => {
  world(on, () => WITH_COSTS)
  const drafts: string[] = []
  on('prompt.fill', (_$, e) => {
    drafts.push((e as { text: string }).text)
    return { isFilled: true, text: (e as { text: string }).text, cursor: 0 } as never
  })
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await ui.press({ key: 'tab-agents' })
  const card = async () => (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source)).find(c => c.includes('Creator vetting')) ?? ''
  // Idle crabs breathe; none walks yet.
  expect(await card()).toContain('idle')
  expect(await card()).not.toContain(' go')
  await ui.press({ key: 'start-aspire:atlas-creator-vetting-0' })
  expect(drafts).toEqual([])
  expect(await card()).toContain(' go')
  await clock.advance(1000)
  // The crab is back on its card, breathing, once the start is drafted.
  expect(await card()).toContain('idle')
  expect(await card()).not.toContain(' go')
  await ui.unmount()
  expect(drafts).toEqual(['/aspire:aspire run atlas-creator-vetting'])
})

test('an agent step call from an unknown agent changes nothing and does not switch the mod on', async ($, on) => {
  world(on, () => WITH_COSTS)
  expect(await $.tool.call({ tool: 'mcp__aspire__aspire_step', agentId: 'ghost', total: 3 } as never)).toMatchObject({ result: 'ok' })
  expect(await status($)).toMatch(/Aspire mod: loaded, off/)
})

test('desktop panel draws one Svg per agent', async ($, on) => {
  world(on, () => WITH_COSTS)
  await spawn($, 'aspire:atlas-market-signal', 'Market signal for the week')
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const drawn = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source)).join('')
  expect(drawn).toContain('Market signal for the week')
  expect(drawn).toContain('aspire:atlas-market-signal')
  expect(drawn).not.toContain('undefined')
  expect(drawn).not.toContain('[object')
})

test('the bar and band hide with ✕ and come back with /aspire-agents-info band', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: band as never })
  await ui.press({ key: 'aspire-band-hide' })
  await ui.unmount()
  expect(await barShows($, 'terminal', 'Aspire')).toBe(false)
  expect(await $.command.run({ command: 'aspire-agents-info', args: 'band' } as never)).toMatchObject({ text: 'Aspire band shown.' })
  expect(await barShows($, 'terminal', 'Aspire')).toBe(true)
})

test('a subagent step shows its model, effort and context fill; the stream passes through', async ($, on) => {
  world(on, () => WITH_COSTS)
  const usage = { model: 'claude-opus-5-5', input_tokens: 20_000, output_tokens: 10_000, cache_read_input_tokens: 50_000, cache_creation_input_tokens: 50_000 }
  on('turn.step', async function* () {
    return { turnId: 'turn', index: 0, answer: 'hi', toolUses: [], stopReason: 'end_turn', usage } as never
  })
  await spawn($, 'aspire:atlas-creator-profile', 'Profile for a creator')

  const stream = ($.turn.step as (e: unknown) => AsyncGenerator<unknown, unknown>)({
    turnId: 'turn', index: 0, model: 'claude-opus-5-5', effort: 'high', messageCount: 1, agentId: 'agent-Profile-for-a-creator',
  })
  let step = await stream.next()
  while (!step.done) step = await stream.next()
  expect(step.value).toMatchObject({ answer: 'hi' })

  // 130K tokens of a 1M window.
  expect(await panelShows($, /ctx 13% · 130k/)).toBe(true)
  expect(await panelShows($, /Opus 5\.5 · high/)).toBe(true)
})

test('a /clear puts the mod back to sleep until /aspire runs again', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('session.end', () => ({ sessionId: 's1' }) as never)
  await typeAspire($)
  await getStatus($)
  await report($, { title: 'Onboarding', total: 6, done: 3 })
  await spawn($, 'aspire:atlas-creator-brief', 'Brief for next week')
  expect(await panelShows($, /^12k \/ 50k$/)).toBe(true)

  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } } as never)
  expect(await panelShows($, /^12k/)).toBe(false)
  expect(await barShows($, 'terminal', 'Aspire: Sample Brand')).toBe(false)
  expect(await panelShows($, /Brief for next week/)).toBe(false)
  expect(await $.command.run({ command: 'aspire-agents-info', args: '' } as never)).toMatchObject({
    text: 'The Aspire agents panel starts once /aspire runs in this session.',
  })
  // Back on, the bar starts over: no organization, no reported progress.
  await typeAspire($)
  expect(await barShows($, 'terminal', 'Initializing…')).toBe(true)
})

const mountBand = async ($: Engine, surface: 'terminal' | 'desktop') => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'AbovePrompt', props: band as never })
  await ui.unmount()
}

test('the progress result says the band was not drawn when nothing rendered it', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const out = await report($, { title: 'Onboarding', total: 6, done: 1, phase: 'Organization' })
  expect(String((out as { result?: unknown }).result)).toMatch(/; band: not-drawn$/)
  expect(await status($)).toMatch(/Band: never drawn on this surface\./)
})

test('the progress result says the band is visible once the slot rendered', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await mountBand($, 'terminal')
  const out = await report($, { title: 'Onboarding', total: 6, done: 1, phase: 'Organization' })
  expect(String((out as { result?: unknown }).result)).toMatch(/; band: visible on terminal$/)
  expect(await status($)).toMatch(/Band: drawn 1 times, last on terminal\./)
})

test('the progress result says hidden-by-user after the band is dismissed', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await mountBand($, 'terminal')
  await $.command.run({ command: 'aspire-agents-info', args: 'band' } as never)
  await mountBand($, 'terminal')
  const out = await report($, { title: 'Onboarding', total: 6, done: 1, phase: 'Organization' })
  expect(String((out as { result?: unknown }).result)).toMatch(/; band: hidden-by-user$/)
})

test('renders while the mod is off still count, and /clear resets the count', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('session.end', () => ({ sessionId: 's1' }) as never)
  await mountBand($, 'desktop')
  await mountBand($, 'desktop')
  expect(await status($)).toMatch(/Band: drawn 2 times, last on desktop\./)
  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } } as never)
  expect(await status($)).toMatch(/Band: never drawn on this surface\./)
})


test('one credits card tops the panel on both tabs and replaces the agents and time tiles', async ($, on) => {
  world(on, () => ({ ...WITH_COSTS, credits: CREDITS }))
  await typeAspire($)
  await getStatus($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  for (const tab of ['tab-live', 'tab-agents']) {
    await ui.press({ key: tab })
    expect(await ui.find({ type: 'Text', text: /^996\.2$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /of 1,000 left · estimate · resets Nov 1/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /3\.8 used this period · Trial · no expiry/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^25 new posts · 26 retrieved$/ })).toBeDefined()
  }
  await ui.unmount()
  const desktop = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const drawn = (await desktop.findAll({ type: 'Svg' })).map(el => String(el.props.source)).join('\n')
  expect(drawn).toContain('996.2')
  expect(drawn).toContain('of 1,000 left')
  expect(drawn).not.toContain('>Time<')
  expect(drawn).not.toContain('NaN')
  await desktop.unmount()
  expect(await status($)).toMatch(/996\.2 credits left/)
})
