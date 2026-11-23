// Pure helpers for the first-run eval (scripts/eval/first-run/README.md): what a scenario's transcript measures,
// the starting state it needs, and the tables. No process, network or file calls here, so `bun test scripts/eval`
// covers them without running Claude.

import { ASK_TOOL, ATLAS_WRITES, TURN_START_EVENT, summarizeTurn, type Event } from '../lib'

export const FIRST_RUN_HARNESS_VERSION = 1

// A first run makes the writes onboarding makes (a brand Profile, its calibrations, hashtags), so they are allowed.
// What is refused: anything that removes or replaces a record, sends something to Aspire, moves billing, and
// connect_channel, whose sign-in needs a browser a headless run does not have. A scenario that needs a linked
// account starts from a test organization that already has one (`start`).
export const FIRST_RUN_REFUSED = [
  'connect_channel', 'delete_profile', 'remove_hashtags', 'retract_calibration', 'send_feedback',
  'supersede_calibration', 'switch_billing_account', 'unlink_channel',
]
export const FIRST_RUN_WRITES = ATLAS_WRITES.filter(tool => !FIRST_RUN_REFUSED.includes(tool))

/** What a scenario needs the test organization to hold before it starts. */
export type Start = { profile: boolean; instagram: boolean }

/** What the harness reads from `get_status` before and after a scenario. */
export type StatusRead = { organizationId: string | null; creditsConsumed: number | null; profiles: number; instagram: boolean }

export type Metrics = {
  reachedValue: boolean
  /** The value tool whose result came first, without its connector prefix. */
  valueTool: string | null
  /** Wall-clock seconds from the first message to the first value result. Picker answers take no time here. */
  secondsToValue: number | null
  /** Picker questions answered before the first value result, plus the replies typed to a turn that asked in text. */
  questionsToValue: number
  /** Every tool call before the first value result, subagents' included. */
  toolCallsToValue: number
  /** Atlas tool calls before the first value result: what PostHog counts as calls before value. */
  atlasCallsToValue: number
  /** Billed tokens of every turn up to and including the one that reached value (a turn is billed whole). */
  tokensToValue: number | null
  seconds: number
  tokens: number
  costUsd: number
  toolCalls: number
  atlasCalls: number
  /** Atlas tool results that came back as errors. */
  atlasErrors: number
  createdProfile: boolean
  turns: number
}

/** The Atlas tool a call names, or null for any other tool. Only the test connector's tools are allowed in a run. */
export function atlasTool(name: string, prefix: string): string | null {
  return name.startsWith(prefix) ? name.slice(prefix.length) : null
}

/** Whether the transcript so far holds a value tool result that did not fail: the stop condition of a scenario. */
export function reachedValue(events: Event[], valueTools: string[], prefix: string): boolean {
  return firstValue([events], valueTools, prefix) !== null
}

type ValuePoint = { turn: number; index: number; tool: string; at: number | null }

/** Where the first successful value tool result sits: its turn, its line in that turn, and when it arrived. */
export function firstValue(turns: Event[][], valueTools: string[], prefix: string): ValuePoint | null {
  for (let turn = 0; turn < turns.length; turn++) {
    const names: Record<string, string> = {}
    for (const event of turns[turn]) {
      if (event.type !== 'assistant') continue
      for (const block of event.message?.content ?? []) if (block.type === 'tool_use') names[block.id] = block.name
    }
    for (let index = 0; index < turns[turn].length; index++) {
      const event = turns[turn][index]
      if (event.type !== 'user') continue
      for (const block of Array.isArray(event.message?.content) ? event.message.content : []) {
        if (block.type !== 'tool_result' || block.is_error === true) continue
        const tool = atlasTool(names[block.tool_use_id] ?? '', prefix)
        if (tool && valueTools.includes(tool)) return { turn, index, tool, at: typeof event._t === 'number' ? event._t : null }
      }
    }
  }
  return null
}

const startOf = (events: Event[]) => events.find(event => event.type === TURN_START_EVENT)?._t ?? events[0]?._t ?? null
const endOf = (events: Event[]) => [...events].reverse().find(event => typeof event._t === 'number')?._t ?? null

/**
 * Everything one scenario measures, from its turns' stamped transcripts in order. A turn after the first was started
 * by a typed reply, so every turn before the value turn adds one typed reply to the questions.
 */
export function measure(turns: Event[][], valueTools: string[], prefix: string): Metrics {
  const summaries = turns.map(summarizeTurn)
  const value = firstValue(turns, valueTools, prefix)
  const duration = (events: Event[]) => {
    const start = startOf(events)
    const end = endOf(events)
    return start !== null && end !== null ? (end - start) / 1000 : 0
  }
  const seconds = turns.reduce((sum, events) => sum + duration(events), 0)

  // Every tool call and picker question, each with whether it came before the value result.
  let toolCallsToValue = 0
  let atlasCallsToValue = 0
  let pickerQuestions = 0
  turns.forEach((events, turn) => {
    events.forEach((event, index) => {
      if (event.type !== 'assistant') return
      const before = !value || turn < value.turn || (turn === value.turn && index < value.index)
      if (!before) return
      for (const block of event.message?.content ?? []) {
        if (block.type !== 'tool_use') continue
        toolCallsToValue += 1
        if (atlasTool(block.name, prefix)) atlasCallsToValue += 1
        if (block.name === ASK_TOOL) pickerQuestions += Array.isArray(block.input?.questions) ? block.input.questions.length : 0
      }
    })
  })
  const typedReplies = value ? value.turn : Math.max(0, turns.length - 1)

  let secondsToValue: number | null = null
  if (value) {
    const earlier = turns.slice(0, value.turn).reduce((sum, events) => sum + duration(events), 0)
    const start = startOf(turns[value.turn])
    secondsToValue = value.at !== null && start !== null ? earlier + (value.at - start) / 1000 : null
  }

  const allUses = summaries.flatMap(summary => summary.toolUses)
  const atlasUses = allUses.filter(use => atlasTool(use.name, prefix))
  const results = Object.assign({}, ...summaries.map(summary => summary.toolResults)) as Record<string, { error: boolean }>
  return {
    reachedValue: value !== null,
    valueTool: value?.tool ?? null,
    secondsToValue: secondsToValue === null ? null : round(secondsToValue),
    questionsToValue: pickerQuestions + typedReplies,
    toolCallsToValue,
    atlasCallsToValue,
    tokensToValue: value ? summaries.slice(0, value.turn + 1).reduce((sum, summary) => sum + summary.billedTokens, 0) : null,
    seconds: round(seconds),
    tokens: summaries.reduce((sum, summary) => sum + summary.billedTokens, 0),
    costUsd: round(summaries.reduce((sum, summary) => sum + summary.costUsd, 0), 4),
    toolCalls: allUses.length,
    atlasCalls: atlasUses.length,
    atlasErrors: atlasUses.filter(use => results[use.id]?.error).length,
    createdProfile: atlasUses.some(use => atlasTool(use.name, prefix) === 'create_profile' && results[use.id] && !results[use.id].error),
    turns: turns.length,
  }
}

const round = (value: number, places = 1) => Math.round(value * 10 ** places) / 10 ** places

// ---------------------------------------------------------------- the starting state

/** The parts of a `get_status` result the harness needs. Null when the text is not the tool's JSON. */
export function readStatus(text: string): StatusRead | null {
  let status: any
  try {
    status = JSON.parse(text)
  } catch {
    return null
  }
  if (!status || typeof status !== 'object' || !Array.isArray(status.profiles)) return null
  const consumed = status.credits?.thisPeriod?.consumed
  return {
    organizationId: status.organizations?.selected?.id ?? status.credits?.organizationId ?? null,
    creditsConsumed: typeof consumed === 'number' ? consumed : null,
    profiles: status.profiles.length,
    instagram: status.profiles.some((profile: any) =>
      (Array.isArray(profile?.channels) ? profile.channels : []).some((channel: any) =>
        String(channel?.network).toLowerCase() === 'instagram' && channel?.authorization !== 'expired')),
  }
}

/** Why the test organization cannot start this scenario, or an empty list when it can. */
export function startProblems(start: Start, status: StatusRead | null): string[] {
  if (!status) return ['get_status could not be read, so the starting state is unknown']
  const problems: string[] = []
  if (start.profile && status.profiles === 0) problems.push('it needs a brand Profile and the organization has none')
  if (!start.profile && status.profiles > 0) problems.push(`it starts with no brand Profile and the organization has ${status.profiles}: delete them first`)
  if (start.instagram && !status.instagram) problems.push('it needs a live Instagram link and the organization has none')
  if (!start.instagram && status.instagram) problems.push('it starts with no Instagram link and the organization has one: use another test organization')
  return problems
}

/** Credits the scenario used, from the readings before and after it. Null when either is missing. */
export function creditsUsed(before: StatusRead | null, after: StatusRead | null): number | null {
  if (before?.creditsConsumed == null || after?.creditsConsumed == null) return null
  // A new billing period between the two readings resets the count; that run's credits are unknown.
  const used = after.creditsConsumed - before.creditsConsumed
  return used >= 0 ? round(used, 2) : null
}

// ---------------------------------------------------------------- results and tables

export type ScenarioResult = {
  code: string
  persona: string
  flow: string
  /** Null when the scenario did not run: the organization was not in its starting state. */
  metrics: Metrics | null
  credits: number | null
  problems: string[]
}

export type FirstRunResults = {
  harness: number
  date: string
  /** What the run measures: "before" or "after" the redesign, or any other name the person gives. */
  label: string
  commit: string
  model: string
  scenariosVersion: string
  scenarios: ScenarioResult[]
}

const num = (value: number | null | undefined, unit = '') => (value === null || value === undefined ? '–' : `${value}${unit}`)
const minutes = (seconds: number | null | undefined) => (seconds === null || seconds === undefined ? '–' : `${round(seconds / 60)} min`)

const COLUMNS = ['Scenario', 'Value', 'Time to value', 'Questions', 'Atlas calls', 'Tool calls', 'Tokens to value', 'Credits', 'Atlas errors', 'Profile created']

function row(scenario: ScenarioResult): string[] {
  const m = scenario.metrics
  if (!m) return [`${scenario.code} ${scenario.persona}`, 'not run', '–', '–', '–', '–', '–', '–', '–', '–']
  return [
    `${scenario.code} ${scenario.persona}`, m.reachedValue ? (m.valueTool ?? 'yes') : 'no', minutes(m.secondsToValue),
    String(m.questionsToValue), String(m.atlasCallsToValue), String(m.toolCallsToValue), num(m.tokensToValue), num(scenario.credits),
    `${m.atlasErrors} of ${m.atlasCalls}`, m.createdProfile ? 'yes' : 'no',
  ]
}

const table = (header: string[], rows: string[][]) =>
  [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...rows.map(cells => `| ${cells.join(' | ')} |`)].join('\n')

export function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/** The one-line summary under the table: how many reached value, and the medians of those that did. */
export function summaryLine(results: FirstRunResults): string {
  const ran = results.scenarios.filter(scenario => scenario.metrics)
  const reached = ran.filter(scenario => scenario.metrics!.reachedValue)
  const of = (pick: (m: Metrics) => number | null) => median(reached.map(s => pick(s.metrics!)).filter((v): v is number => v !== null))
  return `${reached.length} of ${ran.length} scenarios reached value. Medians of those that did: ` +
    `${minutes(of(m => m.secondsToValue))} to value, ${num(of(m => m.questionsToValue))} questions, ` +
    `${num(of(m => m.atlasCallsToValue))} Atlas calls, ${num(of(m => m.tokensToValue))} tokens.`
}

export function renderRun(results: FirstRunResults): string {
  const lines = [
    `## First run: ${results.label}, ${results.model}, ${results.date}`, '',
    `Plugin at ${results.commit}. Scenarios ${results.scenariosVersion}.`, '',
    table(COLUMNS, results.scenarios.map(row)), '', summaryLine(results),
  ]
  const problems = results.scenarios.flatMap(scenario => scenario.problems.map(problem => `- ${scenario.code}: ${problem}`))
  if (problems.length) lines.push('', 'Problems:', ...problems)
  return lines.join('\n') + '\n'
}

/** Results with nothing but numbers, for a committed baseline: no brand, link, or transcript text is kept. */
export function forBaseline(results: FirstRunResults): FirstRunResults {
  return {
    ...results,
    scenarios: results.scenarios.map(scenario => ({ ...scenario, problems: scenario.problems.map(problem => problem.replace(/@\S+/g, '@…')) })),
  }
}

const delta = (before: number | null | undefined, after: number | null | undefined, unit = '') =>
  before == null || after == null ? `${num(before, unit)} → ${num(after, unit)}` : `${num(before, unit)} → ${num(after, unit)} (${after - before >= 0 ? '+' : ''}${round(after - before)}${unit})`

/** Before and after, scenario by scenario, for the ticket. Runs on different models compare, but the table says so. */
export function compareRuns(before: FirstRunResults, after: FirstRunResults): string {
  const codes = [...new Set([...before.scenarios, ...after.scenarios].map(scenario => scenario.code))]
  const find = (results: FirstRunResults, code: string) => results.scenarios.find(scenario => scenario.code === code)?.metrics ?? null
  const rows = codes.map(code => {
    const a = find(before, code)
    const b = find(after, code)
    const mins = (m: Metrics | null) => (m?.secondsToValue == null ? null : round(m.secondsToValue / 60))
    return [
      code, `${a ? (a.reachedValue ? 'yes' : 'no') : '–'} → ${b ? (b.reachedValue ? 'yes' : 'no') : '–'}`,
      delta(mins(a), mins(b), ' min'), delta(a?.questionsToValue, b?.questionsToValue), delta(a?.atlasCallsToValue, b?.atlasCallsToValue),
      delta(a?.tokensToValue, b?.tokensToValue),
      delta(before.scenarios.find(s => s.code === code)?.credits, after.scenarios.find(s => s.code === code)?.credits),
    ]
  })
  const models = before.model === after.model ? before.model : `${before.model} → ${after.model} (different models)`
  return [
    `## First run: ${before.label} (${before.date}) → ${after.label} (${after.date}), ${models}`, '',
    table(['Scenario', 'Value', 'Time to value', 'Questions', 'Atlas calls', 'Tokens to value', 'Credits'], rows), '',
    `Before: ${summaryLine(before)}`, `After: ${summaryLine(after)}`,
  ].join('\n') + '\n'
}
