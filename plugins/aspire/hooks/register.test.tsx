// Run with: claude plugin test plugins/aspire
import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'

const PLUGIN = 'aspire'
const STATUS_TOOL = 'mcp__Aspire_Atlas__get_status'
const band = { hasSurvey: false, isWorking: false, maxRows: 4, bodyColumns: 120, scroll: { offset: 0, bodyRows: 4 }, view: {} } as const
const pane = { title: '', isFocused: false, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} } as const

const WITH_COSTS = {
  organizations: { selected: { id: 'org_1', tokenCosts: { used: 12400, limit: 50000, unit: 'tokens' } }, all: [{ id: 'org_1' }] },
  profiles: [],
}
const WITHOUT_COSTS = { organizations: { selected: { id: 'org_1' }, all: [{ id: 'org_1' }] }, profiles: [] }

const mcpResult = (body: unknown) => {
  const text = JSON.stringify(body)
  return { result: { content: [{ type: 'text', text }] }, text }
}

// The world beneath the plugin: a clock, the skill's own prompt, an Atlas
// get_status that answers `status()`, and subagents that start on Opus.
const world = (on: On, status: () => unknown, opened: string[] = []) => {
  mock.clock(on, { now: Date.parse('2026-10-14T09:00:00Z') })
  on('ui.open', (_$, e) => {
    opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('skill.prompt', (_$, e) => ({ text: e.text }))
  // Another band beneath the mod's (Claude Code's own, or another mod's).
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>band beneath</Text>
  })
  on('turn.complete', () => ({ text: '' }) as never)
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('tool.call', { tool: STATUS_TOOL }, () => mcpResult(status()) as never)
  on('agent.spawn', (_$, e) => ({ model: 'claude-opus-5-5', agentId: `agent-${e.description.replace(/\W+/g, '-')}` }))
}

const runAspire = ($: Engine) => $.skill.prompt({ skill: 'aspire:aspire', text: 'The aspire skill.' })
const getStatus = ($: Engine) => $.tool.call({ tool: STATUS_TOOL, context: 'Checking the session.' } as never)
const spawn = ($: Engine, subagentType: string, description: string) =>
  $.agent.spawn({ tool_use_id: `t-${description}`, prompt: 'p', description, subagentType, provider: { plugin: 'engine', tier: 'core' }, parentModel: 'claude-opus-5-5', background: false, fork: false } as never)

const bandShows = async ($: Engine, surface: 'terminal' | 'desktop', text: RegExp) => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface, component: 'AbovePrompt', props: band as never })
  const found = await ui.find({ type: 'Text', text })
  await ui.unmount()
  return found !== undefined
}

const panelShows = async ($: Engine, text: RegExp) => {
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'Pane', requestId: 'aspire-agents', props: pane as never })
  const found = await ui.find({ type: 'Text', text })
  await ui.unmount()
  return found !== undefined
}

for (const surface of ['terminal', 'desktop'] as const) {
  test(`${surface}: inert until /aspire runs`, async ($, on) => {
    const opened: string[] = []
    world(on, () => WITH_COSTS, opened)

    // Before /aspire: no band, no reading, no panel rows, no pane.
    await getStatus($)
    await spawn($, 'general-purpose', 'Unrelated work')
    expect(await bandShows($, surface, /Atlas/)).toBe(false)
    const answer = await $.command.run({ command: 'aspire-agents-info', args: '' } as never)
    expect(answer).toMatchObject({ text: 'The Aspire agents panel starts once /aspire runs in this session.' })
    expect(opened).toEqual([])

    // /aspire switches it on. The get_status before it was not recorded, and
    // the band never makes a figure up: a dash and how to get one.
    await runAspire($)
    expect(await bandShows($, surface, /^Atlas tokens$/)).toBe(true)
    expect(await bandShows($, surface, /^—, run \/aspire to refresh$/)).toBe(true)
    expect(await bandShows($, surface, /12k/)).toBe(false)
    expect(await panelShows($, /Unrelated work/)).toBe(false)
  })

  test(`${surface}: the band shows Atlas token costs from the latest get_status`, async ($, on) => {
    let status: unknown = WITH_COSTS
    world(on, () => status)
    await runAspire($)

    const result = await getStatus($)
    // The call's result passes through untouched.
    expect(result).toMatchObject({ text: JSON.stringify(WITH_COSTS) })
    expect(await bandShows($, surface, /^12k \/ 50k$/)).toBe(true)

    // A later get_status without token costs clears the figure rather than keep a stale one.
    status = WITHOUT_COSTS
    await getStatus($)
    expect(await bandShows($, surface, /12k/)).toBe(false)
    expect(await bandShows($, surface, /^—, run \/aspire to refresh$/)).toBe(true)
  })
}

test('a get_status from another connector is never read', async ($, on) => {
  world(on, () => WITHOUT_COSTS)
  on('tool.call', { tool: 'mcp__linear__get_status' }, () => mcpResult({ tokenCosts: { used: 999, limit: 1000 } }) as never)
  await runAspire($)
  await $.tool.call({ tool: 'mcp__linear__get_status' } as never)
  expect(await bandShows($, 'terminal', /999/)).toBe(false)
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

  // The band is on, too, with the band beneath it kept.
  expect(await bandShows($, 'terminal', /^Atlas tokens$/)).toBe(true)
  expect(await bandShows($, 'terminal', /^band beneath$/)).toBe(true)
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

test('the band hides with × and comes back with /aspire-agents-info band', async ($, on) => {
  world(on, () => WITH_COSTS)
  await runAspire($)
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: band as never })
  await ui.press({ key: 'aspire-band-hide' })
  await ui.unmount()
  expect(await bandShows($, 'terminal', /Atlas/)).toBe(false)
  expect(await $.command.run({ command: 'aspire-agents-info', args: 'band' } as never)).toMatchObject({ text: 'Aspire band shown.' })
  expect(await bandShows($, 'terminal', /Atlas/)).toBe(true)
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
  await runAspire($)
  await getStatus($)
  await spawn($, 'aspire:atlas-creator-brief', 'Brief for next week')
  expect(await bandShows($, 'terminal', /^12k \/ 50k$/)).toBe(true)

  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } } as never)
  expect(await bandShows($, 'terminal', /Atlas/)).toBe(false)
  expect(await panelShows($, /Brief for next week/)).toBe(false)
  expect(await $.command.run({ command: 'aspire-agents-info', args: '' } as never)).toMatchObject({
    text: 'The Aspire agents panel starts once /aspire runs in this session.',
  })
})

test('turns count from the one that ran /aspire', async ($, on) => {
  world(on, () => WITH_COSTS)
  // A typed /aspire: the skill expands before its turn starts.
  await ($.turn.start as (e: unknown) => Promise<unknown>)({ text: 'earlier', turnId: 't0' })
  await runAspire($)
  await ($.turn.start as (e: unknown) => Promise<unknown>)({ text: '/aspire', turnId: 't1' })
  const ui = await $.ui.mount({ plugin: PLUGIN, surface: 'terminal', component: 'AbovePrompt', props: band as never })
  expect(await ui.find({ type: 'Text', text: /^1$/ })).toBeDefined()
  await ui.unmount()
  await ($.turn.start as (e: unknown) => Promise<unknown>)({ text: 'next', turnId: 't2' })
  expect(await bandShows($, 'terminal', /^2$/)).toBe(true)
})
