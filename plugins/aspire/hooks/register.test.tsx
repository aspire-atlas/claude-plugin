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
    const drawn = [...(await ui.findAll({ type: 'Button' })).map(el => el.props.label), ...(await ui.findAll({ type: 'Svg' })).map(el => el.props.alt)]
    return drawn.some(d => String(d).includes(text))
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
    // Atlas answered: with no report from the skill, the bar follows what get_status shows.
    expect(await barShows($, surface, 'Channel linked 4/6')).toBe(true)
    expect(await barShows($, surface, '67%')).toBe(true)
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

test('desktop: the bar is a row of Buttons with the dithered meter Svg between them, and no overlays', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await getStatus($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const svgs = await ui.findAll({ type: 'Svg' })
  // The title's dot, the dithered meter, and the one animated crab: three Svgs, none lying over another.
  expect(svgs).toHaveLength(3)
  const sources = svgs.map(s => String(s.props.source))
  const dot = sources.find(s => s.includes('class="dt"'))
  expect(dot).toContain('#3B8A82')
  expect(dot).toContain('#5fb5ab')
  expect(sources.some(s => s.includes('#3B8A82') && s.includes('class="t0"'))).toBe(true)
  const crabs = svgs.filter(s => s.props.alt === 'Aspire crab')
  expect(crabs).toHaveLength(1)
  expect(String(crabs[0].props.source)).toContain('animation')
  // The title Button holds just the title: the dot is the Svg before it.
  expect(String((await ui.find({ key: 'aspire-org' }))?.props.label)).toBe('Aspire: Sample Brand')
  const agents = String((await ui.find({ key: 'aspire-agents' }))?.props.label)
  expect(agents).not.toContain('🦀')
  expect(agents).not.toContain('×')
  expect(String((await ui.find({ key: 'aspire-agent-count' }))?.props.label)).toBe('×0')
  expect(agents).not.toContain('undefined')
  expect(agents).not.toContain('NaN')
  expect(await ui.find({ key: 'aspire-open-panel' })).toBeDefined()
  // One line: the row is full width and the meter Svg fills what the other items leave (a 120-column band, not the old 360px cap).
  const meter = svgs.find(s => String(s.props.source).includes('class="t0"'))
  expect(Number(meter?.props.width)).toBeGreaterThan(360)
  const rows = await ui.findAll({ type: 'Box' })
  expect(rows.some(r => r.props.width === '100%' && r.props.flexDirection === 'row')).toBe(true)
  // The percent, crab and count sit together in one right group that ends at the panel icon.
  const group = rows.find(r => r.props.flexDirection === 'row' && r.props.flexShrink === 0)
  expect(group).toBeDefined()
  await ui.unmount()
})

test('desktop: the dot turns done-green when finished; the terminal keeps the text bullet and crab glyph', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await getStatus($)
  await report($, { title: 'Onboarding', total: 6, done: 6, finished: true })
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const dot = (await ui.findAll({ type: 'Svg' })).map(s => String(s.props.source)).find(s => s.includes('<circle'))
  expect(dot).toContain('#4caf6e')
  expect(dot).not.toContain('class="dt"')
  await ui.unmount()
  const term = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: band as never })
  expect(await term.findAll({ type: 'Svg' })).toHaveLength(0)
  expect(String((await term.find({ key: 'aspire-org' }))?.props.label)).toBe('● Aspire: Sample Brand')
  expect(String((await term.find({ key: 'aspire-agents' }))?.props.label)).toContain('🦀 ×0')
  expect(await term.find({ key: 'aspire-agent-count' })).toBeUndefined()
  await term.unmount()
})

test('several organizations: no name until the call picks one', async ($, on) => {
  const several = { organizations: { selected: { id: 'org_1', name: 'Default Org' }, all: [{ id: 'org_1' }, { id: 'org_2' }] }, profiles: [] }
  let body: unknown = several
  world(on, () => body)
  await typeAspire($)
  await getStatus($)
  expect(await barShows($, 'terminal', 'Aspire')).toBe(true)
  expect(await barShows($, 'terminal', 'Atlas connected 1/6')).toBe(true)
  body = { ...several, organizations: { ...several.organizations, selected: { id: 'org_2', name: 'Picked Org' } } }
  await getStatus($, { asOrganizationId: 'org_2' })
  expect(await barShows($, 'terminal', 'Aspire: Picked Org')).toBe(true)
  expect(await barShows($, 'terminal', 'Organization picked 2/6')).toBe(true)
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
  const cardLabel = async (key: string) => {
    const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
    const label = String((await ui.find({ key }))?.props.label)
    await ui.unmount()
    return label
  }
  expect(await cardLabel('card-running')).toMatch(/^▾ Running · 3/)
  expect(opened).toEqual(['aspire-agents'])

  // A finished run moves under Finished, with no cost figure anywhere.
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ agentId: 'agent-Brief-for-next-week', reason: 'answer', answer: 'ok' })
  expect(await cardLabel('card-running')).toMatch(/^▾ Running · 2/)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect((await ui.find({ key: 'card-finished' }))?.props.label).toBe('▾ Finished · 1')
  await ui.unmount()
  expect(await panelShows($, /\$/)).toBe(false)

  // The bar is on, too, with its agents count, and the band beneath it kept.
  expect(await barShows($, 'terminal', 'Aspire')).toBe(true)
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: band as never })
  expect(String((await bar.find({ key: 'aspire-agents' }))?.props.label)).toMatch(/×3$/)
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

test("the right-panel icon at the bar's far right opens the panel, on desktop and in the terminal", async ($, on) => {
  const opened: string[] = []
  world(on, () => WITH_COSTS, opened)
  await typeAspire($)
  for (const surface of ['desktop', 'terminal'] as const) {
    const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'AbovePrompt', props: band as never })
    expect(await ui.find({ key: 'aspire-open-panel' })).toBeTruthy()
    await ui.press({ key: 'aspire-open-panel' })
    await ui.unmount()
  }
  expect(opened).toEqual(['aspire-agents', 'aspire-agents'])
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

const GROUP_KEYS = ['insights', 'discover', 'create', 'program', 'measure']
const openGroups = async (ui: { press: (q: { key: string }) => Promise<unknown> }, surface: 'desktop' | 'terminal') => {
  for (const g of GROUP_KEYS) await ui.press({ key: surface === 'desktop' ? `group:${g}-0` : `card-group:${g}` })
}

test('the agent roster is a collapsed card per group; opening them shows a crab row for every agent type', async ($, on) => {
  world(on, () => WITH_COSTS)
  await spawn($, 'aspire:atlas-market-signal', 'Signal for the week')
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const sources = async () => (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source))
  // Collapsed: no crab rows yet, and no tabs or dotted grid.
  expect((await sources()).some(c => c.includes('Creator vetting'))).toBe(false)
  expect(await ui.find({ key: 'tab-agents' })).toBeUndefined()
  expect((await ui.findAll({ type: 'Svg' })).some(el => el.props.alt === 'dotted grid')).toBe(false)
  await openGroups(ui, 'desktop')
  const rows = (await sources()).filter(c => c.includes('class="ln"') || true)
  expect(rows.filter(c => c.includes('breathe') || c.includes('idle') || c.includes('running')).length).toBeGreaterThanOrEqual(25)
  expect(rows.filter(c => c.includes('Market signal'))[0]).toContain('running')
  expect(rows.join('')).not.toContain('undefined')
  await ui.unmount()
})

test('each card opens and closes with its header, on the desktop and in the terminal', async ($, on) => {
  world(on, () => ({ ...WITH_COSTS, credits: CREDITS }))
  await typeAspire($)
  await getStatus($)
  const terminal = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect((await terminal.find({ key: 'card-progress' }))?.props.label).toMatch(/^▾ Progress/)
  expect(await terminal.find({ type: 'Text', text: /^996\.2$/ })).toBeDefined()
  expect(await terminal.find({ type: 'Text', text: /Channel linked 4\/6/ })).toBeDefined()
  await terminal.press({ key: 'card-progress' })
  expect((await terminal.find({ key: 'card-progress' }))?.props.label).toMatch(/^▸ Progress/)
  expect(await terminal.find({ type: 'Text', text: /Channel linked 4\/6/ })).toBeUndefined()
  // The credits stay: that card does not collapse.
  expect(await terminal.find({ type: 'Text', text: /^996\.2$/ })).toBeDefined()
  await terminal.press({ key: 'card-progress' })
  await terminal.unmount()

  const desktop = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const alts = async () => (await desktop.findAll({ type: 'Svg' })).map(el => String(el.props.alt))
  expect((await alts()).some(a => /^Progress, .*open$/.test(a))).toBe(true)
  await desktop.press({ key: 'card-progress-0' })
  expect((await alts()).some(a => /^Progress, .*collapsed$/.test(a))).toBe(true)
  await desktop.unmount()
})

test('the roster on the terminal lists every agent type once its group is open', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect(await ui.find({ type: 'Text', text: /Creator vetting/ })).toBeUndefined()
  await openGroups(ui, 'terminal')
  expect(await ui.find({ type: 'Text', text: /Creator vetting/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Orchestrator/ })).toBeDefined()
  await ui.unmount()
})

test('pressing an agent drafts its start in the prompt without sending it', async ($, on) => {
  world(on, () => WITH_COSTS)
  const drafts: { text?: string; mode?: string }[] = []
  on('prompt.fill', (_$, e) => {
    drafts.push(e as never)
    return { isFilled: true, text: (e as { text: string }).text, cursor: 0 } as never
  })
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await openGroups(ui, 'terminal')
  await ui.press({ key: 'aspire:atlas-creator-vetting' })
  await ui.unmount()
  expect(drafts).toHaveLength(1)
  expect(drafts[0]).toMatchObject({ text: '/aspire:aspire run atlas-creator-vetting', mode: 'replace' })
})

test('pressing an agent toasts that it is queued in the prompt box', async ($, on) => {
  world(on, () => WITH_COSTS)
  const toasts: { text?: string; timeoutMs?: number }[] = []
  on('ui.toast', (_$, e) => {
    toasts.push(e as never)
    return { value: undefined } as never
  })
  on('prompt.fill', () => ({ isFilled: true, text: '', cursor: 0 }) as never)
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await openGroups(ui, 'terminal')
  await ui.press({ key: 'aspire:atlas-creator-vetting' })
  await ui.unmount()
  expect(toasts).toHaveLength(1)
  expect(toasts[0].text).toMatch(/^◆ Aspire · .+ is queued in the prompt box\. Press Enter to run it\.$/)
})

test('desktop: pressing an agent shows the branded notice with its crab above the bar, clears after 6s, and does not also toast', async ($, on) => {
  world(on, () => WITH_COSTS)
  const toasts: string[] = []
  on('ui.toast', (_$, e) => {
    toasts.push((e as { text: string }).text)
    return { value: undefined } as never
  })
  on('prompt.fill', () => ({ isFilled: true, text: '', cursor: 0 }) as never)
  await typeAspire($)
  await getStatus($)
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  expect(await bar.findAll({ type: 'Svg' })).toHaveLength(3)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await openGroups(ui, 'desktop')
  await ui.press({ key: 'start-aspire:atlas-creator-vetting-0' })
  await clock.advance(1000)
  await ui.unmount()
  const svgs = await bar.findAll({ type: 'Svg' })
  expect(svgs).toHaveLength(4)
  const source = String(svgs[0].props.source)
  expect(source).toContain('is queued in the prompt box. Press Enter to run it.')
  expect(source).toContain('prefers-color-scheme: dark')
  expect(source).toContain('prefers-reduced-motion')
  expect(source).toContain('#3B8A82')
  expect(source).not.toContain('◆')
  expect(toasts).toHaveLength(0)
  await clock.advance(6100)
  expect(await bar.findAll({ type: 'Svg' })).toHaveLength(3)
  await bar.unmount()
})

test('desktop: the notice clears when the prompt is submitted', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('ui.toast', () => ({ value: undefined }) as never)
  on('prompt.fill', () => ({ isFilled: true, text: '', cursor: 0 }) as never)
  await typeAspire($)
  await getStatus($)
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await openGroups(ui, 'desktop')
  await ui.press({ key: 'start-aspire:atlas-creator-vetting-0' })
  await clock.advance(1000)
  await ui.unmount()
  expect(await bar.findAll({ type: 'Svg' })).toHaveLength(4)
  await $.prompt.submit({ text: '/aspire:aspire run atlas-creator-vetting' } as never)
  expect(await bar.findAll({ type: 'Svg' })).toHaveLength(3)
  await bar.unmount()
})

const coachSvgs = async (ui: Awaited<ReturnType<Engine['ui']['mount']>>) =>
  (await ui.findAll({ type: 'Svg' })).filter(el => String(el.props.alt).startsWith('Aspire prompt coach'))

test('coach: desktop draws a branded Svg row above the bar; terminal draws one Text line', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  await report($, { title: 'Ad reuse', total: 3, coach: { verdict: '3 of 6 inputs for Ad reuse: missing window, reader, save', step: 'Round 1 of 3' } })
  const desktop = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const rows = await coachSvgs(desktop)
  expect(rows).toHaveLength(1)
  const source = String(rows[0].props.source)
  expect(source).toContain('Round 1 of 3 · 3 of 6 inputs for Ad reuse')
  expect(source).not.toContain('◆')
  expect(source).toContain('c-coach run')
  expect(source).toContain('prefers-color-scheme: dark')
  expect(source).toContain('prefers-reduced-motion')
  await desktop.unmount()
  expect(await bandShows($, 'terminal', /^Prompt coach: 3 of 6 inputs for Ad reuse: missing window, reader, save$/)).toBe(true)
})

test('coach: shows above the queued notice when both are up', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('ui.toast', () => ({ value: undefined }) as never)
  on('prompt.fill', () => ({ isFilled: true, text: '', cursor: 0 }) as never)
  await typeAspire($)
  await getStatus($)
  await report($, { title: 'Ad reuse', coach: { verdict: 'Missing the window' } })
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await openGroups(ui, 'desktop')
  await ui.press({ key: 'start-aspire:atlas-creator-vetting-0' })
  await clock.advance(1000)
  await ui.unmount()
  const svgs = await bar.findAll({ type: 'Svg' })
  expect(svgs).toHaveLength(5)
  expect(String(svgs[0].props.alt)).toContain('prompt coach')
  expect(String(svgs[1].props.source)).toContain('is queued in the prompt box')
  await bar.unmount()
})

test('coach: finished, null, a new title and /clear clear it; so does the five-minute timeout', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('session.end', () => ({ sessionId: 's1' }) as never)
  await typeAspire($)
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const coachCount = async () => (await coachSvgs(bar)).length
  await report($, { title: 'Ad reuse', total: 3, coach: { verdict: 'one' } })
  expect(await coachCount()).toBe(1)
  await report($, { done: 1 })
  expect(await coachCount()).toBe(1)
  await report($, { finished: true })
  expect(await coachCount()).toBe(0)
  await report($, { title: 'Ad reuse', total: 3, coach: { verdict: 'two' } })
  await report($, { coach: null })
  expect(await coachCount()).toBe(0)
  await report($, { title: 'Ad reuse', coach: { verdict: 'three' } })
  await report($, { title: 'Another flow' })
  expect(await coachCount()).toBe(0)
  await report($, { title: 'Another flow', coach: { verdict: 'four' }, finished: true })
  expect(await coachCount()).toBe(0)
  await report($, { title: 'Third flow', coach: { verdict: 'five' } })
  await clock.advance(4 * 60 * 1000)
  expect(await coachCount()).toBe(1)
  await clock.advance(61 * 1000)
  expect(await coachCount()).toBe(0)
  await report($, { title: 'Third flow', coach: { verdict: 'six' } })
  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } } as never)
  expect(await coachCount()).toBe(0)
  await bar.unmount()
})

test('coach: text is cleaned and bounded; a malformed or empty coach changes nothing', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  const messy = `a\u0000b\u001b[31m\nc\td ${'x'.repeat(300)}`
  await report($, { title: 'Ad reuse', coach: { verdict: messy, step: `Round\u0007 ${'y'.repeat(80)}` } })
  const [row] = await coachSvgs(bar)
  const alt = String(row.props.alt)
  expect(alt).not.toMatch(/[\u0000-\u001f]/)
  expect(alt).toContain('a b [31m c d xxx')
  const [step, verdict] = alt.replace('Aspire prompt coach: ', '').split(' · ')
  expect(step.length).toBeLessThanOrEqual(30)
  expect(verdict.length).toBeLessThanOrEqual(140)
  await report($, { coach: { verdict: '\u0000\u0001  ' } })
  await report($, { coach: 'nope' })
  await report($, { coach: { step: 'Round 2' } })
  expect(String((await coachSvgs(bar))[0].props.alt)).toContain('a b')
  await bar.unmount()
})

test('coach: a subagent cannot set or clear it, and the call changes no other call or result', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const bar = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'AbovePrompt', props: band as never })
  await report($, { title: 'Ad reuse', coach: { verdict: 'mine' } })
  expect(await report($, { agentId: 'a1', coach: { verdict: 'hijacked' } })).toMatchObject({ result: expect.stringMatching(/^ignored/) })
  await report($, { agentId: 'a1', coach: null })
  expect(String((await coachSvgs(bar))[0].props.alt)).toContain('mine')
  // Other tools' results are untouched, and the progress result is the same string with or without a coach.
  expect(await $.tool.call({ tool: 'mcp__linear__list_issues' } as never)).toMatchObject({ result: { content: [{ type: 'text', text: '{"issues":[]}' }] } })
  const withCoach = await report($, { done: 1, coach: { verdict: 'again' } })
  const without = await report($, { done: 1 })
  expect(withCoach).toEqual(without)
  await bar.unmount()
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
  await openGroups(ui, 'desktop')
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

test('the progress card shows the bar, and follows get_status before the skill reports', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const bar = async () => (await ui.findAll({ type: 'Svg' })).find(el => String(el.props.alt).startsWith('Aspire'))
  expect(String((await bar())?.props.alt)).toContain('Initializing…')
  await getStatus($)
  expect(String((await bar())?.props.alt)).toContain('Channel linked 4/6')
  await report($, { title: 'Onboarding', total: 6, done: 5, phase: 'First insights' })
  expect(String((await bar())?.props.alt)).toContain('First insights 5/6')
  await ui.unmount()
})

// The text inside every `@media (prefers-color-scheme: dark){...}` block, braces matched.
const darkBlocks = (source: string): string => {
  const open = '@media (prefers-color-scheme: dark){'
  let out = ''
  for (let i = source.indexOf(open); i !== -1; i = source.indexOf(open, i + 1)) {
    let depth = 1
    let j = i + open.length
    while (j < source.length && depth > 0) depth += source[j] === '{' ? 1 : source[j] === '}' ? -1 : 0, j++
    out += source.slice(i + open.length, j - 1)
  }
  return out
}

test('every colour in the desktop panel has a light and a dark value', async ($, on) => {
  world(on, () => ({ ...WITH_COSTS, credits: CREDITS }))
  await spawn($, 'aspire:atlas-market-signal', 'Signal for the week')
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  for (const tab of ['closed', 'open']) {
    if (tab === 'open') await openGroups(ui, 'desktop')
    for (const el of await ui.findAll({ type: 'Svg' })) {
      const source = String(el.props.source)
      // The classes that paint a surface or text take their value from the light and the dark block alike.
      const used = new Set([...source.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(' ')))
      const themed = ['t', 's', 'm', 'k', 'tk', 'ln', 'cv', 'sw'].filter(c => used.has(c))
      const dark = darkBlocks(source)
      for (const c of themed) {
        const light = new RegExp(`(^|[^\\w-])\\.${c}\\{`).test(source.split('@media (prefers-color-scheme: dark)')[0])
        expect({ tab, class: c, light }).toEqual({ tab, class: c, light: true })
        expect({ tab, class: c, dark: dark.includes(`.${c}{`) }).toEqual({ tab, class: c, dark: true })
      }
    }
  }
  await ui.unmount()
})

test('idle crabs breathe at their own rate and start at their own point', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await openGroups(ui, 'desktop')
  const breaths = (await ui.findAll({ type: 'Svg' }))
    .map(el => /--d:-([\d.]+)s;--p:([\d.]+)s/.exec(String(el.props.source)))
    .filter((m): m is RegExpExecArray => m !== null)
    .map(m => ({ delay: Number(m[1]), period: Number(m[2]) }))
  expect(breaths).toHaveLength(26)
  expect(new Set(breaths.map(b => `${b.delay}/${b.period}`)).size).toBe(26)
  expect(new Set(breaths.map(b => b.period)).size).toBeGreaterThanOrEqual(20)
  expect(new Set(breaths.map(b => b.delay)).size).toBeGreaterThanOrEqual(20)
  for (const b of breaths) {
    expect(b.period).toBeGreaterThanOrEqual(2.2)
    expect(b.period).toBeLessThanOrEqual(3.4)
    expect(b.delay).toBeLessThan(3)
  }
  await ui.unmount()
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

test('the bar and band hide and come back with /aspire-agents-info band', async ($, on) => {
  world(on, () => WITH_COSTS)
  await typeAspire($)
  expect(await $.command.run({ command: 'aspire-agents-info', args: 'band' } as never)).toMatchObject({ text: 'Aspire band hidden.' })
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


test('the credits card shows the balance on both surfaces and no agents or time tiles', async ($, on) => {
  world(on, () => ({ ...WITH_COSTS, credits: CREDITS }))
  await typeAspire($)
  await getStatus($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect(await ui.find({ type: 'Text', text: /^996\.2$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /of 1,000 left · estimate · resets Nov 1/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /3\.8 used this period · Trial · no expiry/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^25 new posts · 26 retrieved$/ })).toBeDefined()
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

test("the agent's own task list moves the bar and fills the Progress section, then ends as All done", async ($, on) => {
  world(on, () => WITH_COSTS)
  const PLAN = 'mcp__ccd_turn__update_plan'
  on('tool.call', { tool: PLAN }, () => ({ result: 'ok', text: 'ok' }) as never)
  on('tool.call', { tool: 'Read' }, () => ({ result: 'ok', text: 'ok' }) as never)
  on('tool.call', { tool: 'mcp__ccd_turn__wrap_up' }, () => ({ result: 'ok', text: 'ok' }) as never)
  await typeAspire($, '/aspire:aspire')
  await ($.turn.start as (e: unknown) => Promise<unknown>)({ turnId: 't1', text: 'Onboard the brand\nwith detail' })
  await $.tool.call({ tool: PLAN, items: [{ content: 'Confirm Atlas', status: 'in_progress' }, { content: 'Pick the organization', status: 'pending' }, { content: 'Route', status: 'pending' }] } as never)
  expect(await barShows($, 'terminal', 'Step 1 of 3')).toBe(true)
  await $.tool.call({ tool: 'Read', file_path: '/a/b.ts' } as never)
  await $.tool.call({ tool: PLAN, advance: true } as never)
  expect(await barShows($, 'terminal', 'Step 2 of 3')).toBe(true)
  expect(await barShows($, 'desktop', 'Step 2 of 3')).toBe(true)
  expect(await status($)).toMatch(/Step 2 of 3, 3[0-9]% \(from the agent's own steps\)/)

  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect(await ui.find({ type: 'Text', text: /Onboard the brand/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /✓ Confirm Atlas · Done/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Pick the organization · ~0%/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /○ Route · Next/ })).toBeDefined()
  await ui.unmount()
  const desktop = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const drawn = (await desktop.findAll({ type: 'Svg' })).map(el => String(el.props.source)).join('\n')
  expect(drawn).toContain('Pick the organization')
  expect(drawn).toContain('>Next<')
  expect(drawn).toContain('reading b.ts')
  expect(drawn).not.toContain('NaN')
  await desktop.unmount()

  // The turn ends: wrap_up checks the list off, and the bar and the section say All done.
  await $.tool.call({ tool: 'mcp__ccd_turn__wrap_up', recap: 'x' } as never)
  await ($.turn.complete as (e: unknown) => Promise<unknown>)({ reason: 'answer', answer: 'ok' })
  expect(await barShows($, 'terminal', 'All done')).toBe(true)
  const end = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect(await end.find({ type: 'Text', text: /changed 0 files · read 1 file/ })).toBeDefined()
  await end.unmount()
})

test("the agent's task list is not read before /aspire runs", async ($, on) => {
  world(on, () => WITH_COSTS)
  on('tool.call', { tool: 'mcp__ccd_turn__update_plan' }, () => ({ result: 'ok', text: 'ok' }) as never)
  await $.tool.call({ tool: 'mcp__ccd_turn__update_plan', items: [{ content: 'A', status: 'in_progress' }] } as never)
  await typeAspire($)
  expect(await barShows($, 'terminal', 'Initializing…')).toBe(true)
})

test("an agent's own task list draws its steps on its row, and wins over aspire_step", async ($, on) => {
  world(on, () => WITH_COSTS)
  for (const tool of ['TaskCreate', 'TaskUpdate', 'TodoWrite']) on('tool.call', { tool }, () => ({ result: { task: { id: tool === 'TaskCreate' ? '1' : undefined } }, text: 'ok' }) as never)
  await spawn($, 'aspire:atlas-market-signal', 'Signal for the week')
  const agentId = 'agent-Signal-for-the-week'
  await $.tool.call({ tool: 'TodoWrite', agentId, todos: [{ content: 'Read the posts', status: 'completed' }, { content: 'Compare the competitors', status: 'in_progress' }, { content: 'Publish the page', status: 'pending' }] } as never)
  const drawn = async () => {
    const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
    const out = (await ui.findAll({ type: 'Svg' })).map(el => String(el.props.source)).join('')
    await ui.unmount()
    return out
  }
  expect(await drawn()).toContain('1/3 Compare the competitors')
  // aspire_step does not override the list.
  await $.tool.call({ tool: 'mcp__aspire__aspire_step', agentId, total: 9, done: 8, note: 'other' } as never)
  expect(await drawn()).toContain('1/3 Compare the competitors')
  // A main-session call never touches the agent's row; another agent's does not either.
  await $.tool.call({ tool: 'TodoWrite', todos: [{ content: 'Main task', status: 'pending' }] } as never)
  await $.tool.call({ tool: 'TodoWrite', agentId: 'ghost', todos: [{ content: 'Ghost', status: 'pending' }] } as never)
  expect(await drawn()).not.toContain('Ghost')
  // TaskCreate and TaskUpdate work the same way.
  await spawn($, 'aspire:atlas-ad-reuse', 'Hooks for the month')
  const second = 'agent-Hooks-for-the-month'
  await $.tool.call({ tool: 'TaskCreate', agentId: second, subject: 'Rank the hooks' } as never)
  await $.tool.call({ tool: 'TaskUpdate', agentId: second, taskId: '1', status: 'in_progress' } as never)
  expect(await drawn()).toContain('0/1 Rank the hooks')
})

test('pressing a running agent opens its task list, on desktop and in the terminal', async ($, on) => {
  world(on, () => WITH_COSTS)
  await spawn($, 'aspire:atlas-market-signal', 'Signal for the week')
  const agentId = 'agent-Signal-for-the-week'
  await $.tool.call({ tool: 'mcp__aspire__aspire_step', agentId, total: 3, done: 1, note: 'reading posts' } as never)
  const desktop = await $.ui.mount({ plugin: PLUGIN, surface: 'desktop', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const sources = async () => (await desktop.findAll({ type: 'Svg' })).map(el => String(el.props.source)).join('')
  expect(await sources()).not.toContain('reading posts<')
  await desktop.press({ key: `${agentId}-0` })
  const drawn = await sources()
  expect(drawn).toContain('Step 1')
  expect(drawn).toContain('reading posts')
  expect(drawn).toContain('Step 3')
  await desktop.press({ key: `${agentId}-0` })
  expect(await sources()).not.toContain('Step 3')
  await desktop.unmount()
  const term = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await term.press({ key: `agent-tasks-${agentId}` })
  expect(await term.find({ type: 'Text', text: /reading posts/ })).toBeDefined()
  await term.unmount()
})

test('an open running agent with no task list shows what it is doing', async ($, on) => {
  world(on, () => WITH_COSTS)
  for (const tool of ['Read', 'mcp__aspire__search_posts']) on('tool.call', { tool }, () => ({ result: 'ok', text: 'ok' }) as never)
  await spawn($, 'aspire:atlas-post-analysis', 'Analyze the Instagram post')
  const agentId = 'agent-Analyze-the-Instagram-post'
  await $.tool.call({ tool: 'Read', agentId, file_path: '/tmp/frames/one.png' } as never)
  await $.tool.call({ tool: 'mcp__aspire__search_posts', agentId } as never)
  const term = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  await term.press({ key: `agent-tasks-${agentId}` })
  expect(await term.find({ type: 'Text', text: /No task list from this agent\. Working: using search posts · 2 calls/ })).toBeDefined()
  await term.unmount()
})

// The Artifact card: the transcript's ToolResult row for a published Artifact.
const ARTIFACT_URL = 'https://claude.ai/artifact/abc123'
const publish = ($: Engine, id: string, extra: Record<string, unknown> = {}) =>
  $.tool.call({ tool: 'Artifact', tool_use_id: id, file_path: '/tmp/weekly-readout.html', title: 'Weekly readout', description: 'Last week against the 8-week median.', ...extra } as never)
/** The engine's own row beneath the mod's hook, so a pass-through has something to draw. */
const engineRow = (on: On) =>
  on('ui.render', { component: 'ToolResult' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine row</Text>
  })
const artifactRow = ($: Engine, surface: 'terminal' | 'desktop', id: string, output: unknown, isErrored = false, tool = 'Artifact') =>
  $.ui.mount({ plugin: PLUGIN, surface, component: 'ToolResult', props: { tool_use_id: id, tool, output, isErrored } as never })

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: a published Artifact's result row is a card with the title, description, a reminder, and a link on the icon`, async ($, on) => {
    world(on, () => WITH_COSTS)
    engineRow(on)
    on('tool.call', { tool: 'Artifact' }, () => ({ result: { url: ARTIFACT_URL, path: '/tmp/weekly-readout.html' }, text: 'Published' }) as never)
    await typeAspire($)
    await publish($, 'art-1')
    const ui = await artifactRow($, surface, 'art-1', { url: ARTIFACT_URL, path: '/tmp/weekly-readout.html' })
    expect(await ui.find({ type: 'Text', text: /^Weekly readout$/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /8-week median/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Share this artifact with your team/ })).toBeDefined()
    const links = await ui.findAll({ type: 'Link' })
    expect(links.map(l => l.props.href)).toEqual([ARTIFACT_URL])
    expect((await ui.findAll({ type: 'Button' })).map(b => b.props.label)).toEqual(['Post to Slack'])
    await ui.unmount()
  })
}

test("the Artifact card finds the page link in the tool's plain text and in text blocks, not only in an object", async ($, on) => {
  world(on, () => WITH_COSTS)
  engineRow(on)
  on('tool.call', { tool: 'Artifact' }, () => ({ result: { url: ARTIFACT_URL }, text: 'Published' }) as never)
  await typeAspire($)
  const card = async (id: string, output: unknown) => {
    const ui = await artifactRow($, 'terminal', id, output)
    const links = (await ui.findAll({ type: 'Link' })).map(l => l.props.href)
    await ui.unmount()
    return links
  }
  const text = `Published /tmp/weekly-readout.html at ${ARTIFACT_URL} (Version 2, version id 1792096198-22a2)\n\nLive subscription: already connected.`
  await publish($, 'txt-1')
  expect(await card('txt-1', text)).toEqual([ARTIFACT_URL])
  await publish($, 'txt-2')
  expect(await card('txt-2', [{ type: 'text', text }])).toEqual([ARTIFACT_URL])
  await publish($, 'txt-3')
  expect(await card('txt-3', { content: [{ type: 'text', text }] })).toEqual([ARTIFACT_URL])
  // Text with no Artifact link, or a link to another site, is not a card.
  await publish($, 'txt-4')
  expect(await card('txt-4', 'Published, no link here')).toEqual([])
  await publish($, 'txt-5')
  expect(await card('txt-5', 'See https://example.com/artifact/abc123')).toEqual([])
})

test('Post to Slack only drafts a prompt (with the URL and the ask-first wording) and toasts; nothing is submitted', async ($, on) => {
  world(on, () => WITH_COSTS)
  engineRow(on)
  on('tool.call', { tool: 'Artifact' }, () => ({ result: { url: ARTIFACT_URL }, text: 'Published' }) as never)
  const drafts: { text?: string; mode?: string }[] = []
  const toasts: string[] = []
  on('prompt.fill', (_$, e) => {
    drafts.push(e as never)
    return { isFilled: true, text: '', cursor: 0 } as never
  })
  on('ui.toast', (_$, e) => {
    toasts.push((e as { text: string }).text)
    return { value: undefined } as never
  })
  await typeAspire($)
  await publish($, 'art-2')
  const ui = await artifactRow($, 'terminal', 'art-2', { url: ARTIFACT_URL })
  await ui.press({ key: 'aspire-artifact-slack' })
  await ui.unmount()
  expect(drafts).toHaveLength(1)
  expect(drafts[0].mode).toBe('replace')
  expect(drafts[0].text).toContain(`Share this artifact on Slack: ${ARTIFACT_URL}.`)
  expect(drafts[0].text).toContain('AskUserQuestion')
  expect(drafts[0].text).toContain('post only after I confirm')
  expect(toasts).toHaveLength(1)
})

test('the Artifact card is inert until the mod is on, and only for a published Artifact', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('tool.call', { tool: 'Artifact' }, () => ({ result: { url: ARTIFACT_URL }, text: 'Published' }) as never)
  engineRow(on)
  const cardShown = async (id: string, output: unknown, isErrored = false, tool = 'Artifact') => {
    const ui = await artifactRow($, 'terminal', id, output, isErrored, tool)
    const card = (await ui.find({ type: 'Button' })) !== undefined
    await ui.unmount()
    return card
  }
  // Off: the call is recorded for nothing, and the row is the engine's.
  await publish($, 'off-1')
  expect(await cardShown('off-1', { url: ARTIFACT_URL })).toBe(false)
  await typeAspire($)
  // On: a publish gets the card; an error, an open, a call never seen as a publish, an unrelated tool's result do not.
  await publish($, 'on-1')
  expect(await cardShown('on-1', { url: ARTIFACT_URL })).toBe(true)
  expect(await cardShown('on-1', { url: ARTIFACT_URL }, true)).toBe(false)
  expect(await cardShown('on-1', { opened: true, url: ARTIFACT_URL })).toBe(false)
  expect(await cardShown('on-1', { url: 'http://insecure.example/x' })).toBe(false)
  expect(await cardShown('unseen', { url: ARTIFACT_URL })).toBe(false)
  await publish($, 'list-1', { action: 'list' })
  expect(await cardShown('list-1', { url: ARTIFACT_URL })).toBe(false)
  expect(await cardShown('on-1', { url: ARTIFACT_URL }, false, 'Bash')).toBe(false)
})

// Artifact links from a subagent's hand-back, and the card's plain-text result.
const PLAIN = `Published /tmp/weekly-readout.html at ${ARTIFACT_URL} (Version 1, private)`

for (const [name, output] of [
  ['a plain-text result', PLAIN],
  ['an object with text', { text: PLAIN }],
  ['content blocks', { content: [{ type: 'text', text: PLAIN }] }],
  ['an object with a url', { url: ARTIFACT_URL }],
] as const) {
  test(`the Artifact card reads the link from ${name}`, async ($, on) => {
    world(on, () => WITH_COSTS)
    engineRow(on)
    on('tool.call', { tool: 'Artifact' }, () => ({ result: { url: ARTIFACT_URL }, text: 'Published' }) as never)
    await typeAspire($)
    await publish($, 'plain-1')
    const ui = await artifactRow($, 'terminal', 'plain-1', output)
    expect((await ui.findAll({ type: 'Link' })).map(l => l.props.href)).toEqual([ARTIFACT_URL])
    await ui.unmount()
  })
}

test('a plain-text result keeps the card rules: no card for an open, an error, or a non-artifact link', async ($, on) => {
  world(on, () => WITH_COSTS)
  engineRow(on)
  on('tool.call', { tool: 'Artifact' }, () => ({ result: { url: ARTIFACT_URL }, text: 'Published' }) as never)
  await typeAspire($)
  await publish($, 'plain-2')
  const shown = async (output: unknown, isErrored = false) => {
    const ui = await artifactRow($, 'terminal', 'plain-2', output, isErrored)
    const card = (await ui.find({ type: 'Button' })) !== undefined
    await ui.unmount()
    return card
  }
  expect(await shown(PLAIN)).toBe(true)
  expect(await shown(PLAIN, true)).toBe(false)
  expect(await shown('Published at http://claude.ai/artifact/abc')).toBe(false)
  expect(await shown('Nothing to see')).toBe(false)
  expect(await shown({ opened: true, url: ARTIFACT_URL })).toBe(false)
})

const receive = ($: Engine, kind: string, text: string) =>
  ($.session.receive as (e: unknown) => Promise<unknown>)({ origin: { kind }, text } as never)

test('session.receive: one dim line per new artifact link from a hand-back; the message passes unchanged', async ($, on) => {
  world(on, () => WITH_COSTS)
  const logs: string[] = []
  on('ui.log', (_$, e) => {
    logs.push((e as { text: string }).text)
    return { value: undefined } as never
  })
  const seenText: string[] = []
  on('session.receive', (_$, e) => {
    seenText.push(e.text)
    return { text: e.text } as never
  })
  // Off: nothing logged.
  await receive($, 'task-notification', `Done: ${ARTIFACT_URL}`)
  expect(logs).toEqual([])
  await typeAspire($)
  await receive($, 'task-notification', `Done: ${ARTIFACT_URL} and https://claude.ai/artifact/second-2`)
  expect(logs).toEqual([`◆ Aspire · Artifact published: ${ARTIFACT_URL}`, '◆ Aspire · Artifact published: https://claude.ai/artifact/second-2'])
  // Repeats are not logged again; other origins and links are ignored.
  await receive($, 'task-notification', `Again ${ARTIFACT_URL}`)
  await receive($, 'scheduled-trigger', 'https://claude.ai/artifact/third-3')
  await receive($, 'peer', 'No link here')
  expect(logs).toHaveLength(2)
  await receive($, 'peer', 'https://claude.ai/artifact/fourth-4')
  expect(logs).toHaveLength(3)
  expect(seenText).toHaveLength(6)
  expect(seenText[1]).toContain('second-2')
})

test('progress fallback: the band not drawn sets one status line, replaced as progress moves and cleared at the end', async ($, on) => {
  world(on, () => WITH_COSTS)
  const lines: (string | undefined)[] = []
  on('ui.status', (_$, e) => {
    lines.push((e as { text?: string }).text)
    return { value: undefined } as never
  })
  await typeAspire($)
  await report($, { title: 'Connecting', total: 4, done: 2, phase: 'Get organizations' })
  expect(lines.at(-1)).toBe('Connecting: step 2 of 4, Get organizations ▰▰▱▱ 50%'.replace('▰▰▱▱', '▰▰▱▱'))
  await report($, { done: 3 })
  expect(lines.at(-1)).toContain('step 3 of 4')
  await report($, { finished: true })
  expect(lines.at(-1)).toBeUndefined()
})

test('progress fallback: not called when the band is drawn or hidden by the user', async ($, on) => {
  world(on, () => WITH_COSTS)
  const lines: (string | undefined)[] = []
  on('ui.status', (_$, e) => {
    lines.push((e as { text?: string }).text)
    return { value: undefined } as never
  })
  await typeAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: band as never })
  await report($, { title: 'Connecting', total: 4, done: 1, phase: 'Get organizations' })
  expect(lines.filter(l => l !== undefined)).toEqual([])
  await ui.unmount()
  await $.command.run({ command: 'aspire-agents-info', args: 'band' } as never)
  await report($, { done: 2 })
  expect(lines.filter(l => l !== undefined)).toEqual([])
})

test('the panel command is registered to run while Claude is working', async ($, on) => {
  const registered: unknown[] = []
  on('command.register', (_$, e) => {
    registered.push(e)
    return { value: undefined } as never
  })
  world(on, () => WITH_COSTS)
  on('session.start', (_$, e) => e as never)
  await $.session.start({ cwd: '/tmp' } as never)
  expect(registered.some(r => (r as { name?: string }).name === 'aspire-agents-info' && (r as { immediate?: unknown }).immediate === true)).toBe(true)
})

test('a running row the engine no longer lists is finished on the next turn; listed ones stay running', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('agent.list', () => ({ value: [{ id: 'agent-Keep', description: 'Keep', type: 'aspire:atlas-creator-brief', status: 'running' }] }) as never)
  await typeAspire($)
  await spawn($, 'aspire:atlas-creator-brief', 'Keep')
  await spawn($, 'aspire:atlas-creator-vetting', 'Lost')
  expect(await status($)).toContain('2 agents')
  await $.turn.start({ turnId: 't2', text: 'next' } as never)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  expect(String((await ui.find({ key: 'card-running' }))?.props.label)).toMatch(/^▾ Running · 1/)
  expect(String((await ui.find({ key: 'card-finished' }))?.props.label)).toMatch(/Finished · 1/)
  await ui.unmount()
})

test('an engine without $.agent.list leaves the rows as they are', async ($, on) => {
  world(on, () => WITH_COSTS)
  on('agent.list', () => {
    throw new Error('no agent.list')
  })
  await typeAspire($)
  await spawn($, 'aspire:atlas-creator-brief', 'Keep')
  await $.turn.start({ turnId: 't2', text: 'next' } as never)
  expect(await status($)).toContain('Aspire')
})

// An Atlas tool's row: the animated mark on the left and the call's name on the right, on the desktop only.
const toolRow = ($: Engine, surface: 'terminal' | 'desktop', tool: string, extra: Record<string, unknown> = {}) =>
  $.ui.mount({ plugin: PLUGIN, surface, component: 'ToolUse', props: { tool_use_id: 'tu-1', tool, input: {}, isRunning: false, isErrored: false, isInterrupted: false, ...extra } as never })
const toolEngineRow = (on: On) =>
  on('ui.render', { component: 'ToolUse' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine row</Text>
  })

test('desktop: an Atlas tool row is the animated mark and the call name; the terminal and other tools keep the engine row', async ($, on) => {
  world(on, () => WITH_COSTS)
  toolEngineRow(on)
  await typeAspire($)
  const atlas = await toolRow($, 'desktop', 'mcp__Aspire_Atlas__search_posts', { isRunning: true, input: { context: 'Searching posts for the weekly readout.' } })
  expect(await atlas.find({ type: 'Text', text: /^Searching posts for the weekly readout\.$/ })).toBeDefined()
  expect(await atlas.find({ type: 'Text', text: /^Aspire Atlas$/ })).toBeDefined()
  expect(await atlas.find({ type: 'Text', text: /^search posts$/ })).toBeDefined()
  expect(await atlas.find({ type: 'Text', text: /^running$/ })).toBeDefined()
  const svg = await atlas.find({ type: 'Svg' })
  expect(String(svg.props.source)).toContain('lgtw')
  await atlas.unmount()
  for (const [surface, tool] of [['terminal', 'mcp__Aspire_Atlas__search_posts'], ['desktop', 'Bash'], ['desktop', 'mcp__Aspire_Atlas_Organization_Admin__list_members']] as const) {
    const row = await toolRow($, surface, tool)
    expect(await row.find({ type: 'Text', text: /^engine row$/ })).toBeDefined()
    await row.unmount()
  }
})

test('an Atlas tool row stays the engine row until the mod is on', async ($, on) => {
  world(on, () => WITH_COSTS)
  toolEngineRow(on)
  const row = await toolRow($, 'desktop', 'mcp__Aspire_Atlas__search_posts')
  expect(await row.find({ type: 'Text', text: /^engine row$/ })).toBeDefined()
  await row.unmount()
})
