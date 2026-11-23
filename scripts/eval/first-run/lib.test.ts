import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ATLAS_READS, ATLAS_WRITES, TURN_START_EVENT, toolPrefix } from '../lib'
import {
  FIRST_RUN_REFUSED, FIRST_RUN_WRITES, compareRuns, creditsUsed, firstValue, forBaseline, measure, median, reachedValue,
  readStatus, renderRun, startProblems, type FirstRunResults, type ScenarioResult,
} from './lib'

const PREFIX = toolPrefix('Aspire_Atlas_Dev')
const VALUE = ['search_creators', 'search_posts', 'lookup_creators']

const use = (id: string, name: string, input: Record<string, unknown> = {}, parent?: string) =>
  ({ type: 'assistant', ...(parent ? { parent_tool_use_id: parent } : {}), message: { content: [{ type: 'tool_use', id, name, input }] } })
const result = (id: string, t: number, error = false, text = '{}') =>
  ({ type: 'user', _t: t, message: { content: [{ type: 'tool_result', tool_use_id: id, content: text, is_error: error }] } })
const end = (t: number, tokens: number) => ({ type: 'result', _t: t, session_id: 's', result: 'ok', is_error: false, total_cost_usd: 0.1, usage: { input_tokens: tokens } })

// Turn 1: get_status, a two-question picker, then the turn ends asking in text. Turn 2: create_profile, a failed
// search, then a successful search from a subagent, then more work.
const turns = () => [
  [
    { type: TURN_START_EVENT, _t: 0 },
    { ...use('a', PREFIX + 'get_status'), _t: 1000 }, result('a', 2000),
    { ...use('q', 'AskUserQuestion', { questions: [{ question: 'Role?' }, { question: 'Goal?' }] }), _t: 3000 }, result('q', 4000),
    end(10_000, 500),
  ],
  [
    { type: TURN_START_EVENT, _t: 100_000 },
    { ...use('p', PREFIX + 'create_profile'), _t: 101_000 }, result('p', 102_000),
    { ...use('s1', PREFIX + 'search_posts'), _t: 103_000 }, result('s1', 104_000, true),
    { ...use('t', 'Task'), _t: 105_000 },
    { ...use('s2', PREFIX + 'search_creators', {}, 't'), _t: 106_000 }, { ...result('s2', 130_000), parent_tool_use_id: 't' },
    { ...use('x', PREFIX + 'search_posts'), _t: 131_000 }, result('x', 132_000),
    end(160_000, 2000),
  ],
]

test('a first run writes what onboarding writes and refuses the rest of the Atlas writes', () => {
  expect(FIRST_RUN_REFUSED.every(tool => ATLAS_WRITES.includes(tool))).toBe(true)
  expect([...FIRST_RUN_WRITES, ...FIRST_RUN_REFUSED].sort()).toEqual([...ATLAS_WRITES].sort())
  expect(FIRST_RUN_WRITES).toContain('create_profile')
  expect(FIRST_RUN_REFUSED).toContain('delete_profile')
  // Linking needs a browser sign-in, so a scenario that needs a link starts with one.
  expect(FIRST_RUN_REFUSED).toContain('connect_channel')
})

test('value is the first successful value tool result, from any thread', () => {
  const point = firstValue(turns(), VALUE, PREFIX)
  expect(point).toMatchObject({ turn: 1, tool: 'search_creators', at: 130_000 })
  expect(reachedValue(turns()[0], VALUE, PREFIX)).toBe(false)
  expect(reachedValue(turns()[1], VALUE, PREFIX)).toBe(true)
  // A value tool on another connector does not count: only the test connector's tools are measured.
  expect(reachedValue([use('o', 'mcp__Other__search_posts'), result('o', 1)], VALUE, PREFIX)).toBe(false)
})

test('a scenario measures time, questions, calls, tokens and errors up to value', () => {
  const m = measure(turns(), VALUE, PREFIX)
  expect(m.reachedValue).toBe(true)
  expect(m.valueTool).toBe('search_creators')
  // All of turn 1 (10 s) plus 30 s into turn 2.
  expect(m.secondsToValue).toBe(40)
  // Two picker questions, and one typed reply that started turn 2.
  expect(m.questionsToValue).toBe(3)
  // get_status, the picker, create_profile, the failed search, Task and the value search itself.
  expect(m.toolCallsToValue).toBe(6)
  expect(m.atlasCallsToValue).toBe(4)
  expect(m.tokensToValue).toBe(2500)
  expect(m.atlasCalls).toBe(5)
  expect(m.atlasErrors).toBe(1)
  expect(m.createdProfile).toBe(true)
  expect(m.seconds).toBe(70)
  expect(m.turns).toBe(2)
})

test('a scenario that never reached value has no time or tokens to value and counts every question', () => {
  const m = measure([turns()[0], turns()[0]], VALUE, PREFIX)
  expect(m.reachedValue).toBe(false)
  expect(m.secondsToValue).toBeNull()
  expect(m.tokensToValue).toBeNull()
  expect(m.questionsToValue).toBe(5)
})

const status = (profiles: unknown[], consumed = 12) => JSON.stringify({
  organizations: { selected: { id: 'org_test' } }, profiles, credits: { organizationId: 'org_test', thisPeriod: { consumed } },
})

test('get_status gives the starting state and the credits consumed', () => {
  const linked = readStatus(status([{ channels: [{ network: 'instagram', authorization: 'live' }] }]))
  expect(linked).toEqual({ organizationId: 'org_test', creditsConsumed: 12, profiles: 1, instagram: true })
  expect(readStatus(status([{ channels: [{ network: 'instagram', authorization: 'expired' }] }]))?.instagram).toBe(false)
  expect(readStatus('Atlas is connected. You have one profile.')).toBeNull()

  expect(startProblems({ profile: true, instagram: true }, linked)).toEqual([])
  expect(startProblems({ profile: false, instagram: false }, linked)).toHaveLength(2)
  expect(startProblems({ profile: true, instagram: true }, readStatus(status([])))).toHaveLength(2)
  expect(startProblems({ profile: true, instagram: false }, null)[0]).toContain('unknown')

  expect(creditsUsed(readStatus(status([], 10)), readStatus(status([], 13.456)))).toBe(3.46)
  // A new billing period between the readings: the run's credits are unknown, never negative.
  expect(creditsUsed(readStatus(status([], 10)), readStatus(status([], 2)))).toBeNull()
  expect(creditsUsed(null, readStatus(status([], 2)))).toBeNull()
})

const scenario = (code: string, minutes: number | null, questions: number): ScenarioResult => ({
  code, persona: 'Influencer manager', flow: 'claude', credits: 4,
  metrics: { ...measure(turns(), VALUE, PREFIX), reachedValue: minutes !== null, secondsToValue: minutes === null ? null : minutes * 60, questionsToValue: questions },
  problems: [],
})
const run = (label: string, scenarios: ScenarioResult[]): FirstRunResults =>
  ({ harness: 1, date: '2026-11-23', label, commit: 'abc', model: 'sonnet', scenariosVersion: 'v', scenarios })

test('the table shows each scenario and the medians of those that reached value', () => {
  const results = run('before', [scenario('FR1', 9, 4), scenario('FR2', null, 7), { ...scenario('FR3', 1, 1), metrics: null, problems: ['it needs a brand Profile and the organization has none'] }])
  const text = renderRun(results)
  expect(text).toContain('| FR1 Influencer manager | search_creators | 9 min | 4 |')
  expect(text).toContain('| FR3 Influencer manager | not run |')
  expect(text).toContain('1 of 2 scenarios reached value')
  expect(text).toContain('- FR3: it needs a brand Profile')
  expect(median([3, 1, 2])).toBe(2)
  expect(median([4, 1, 2, 3])).toBe(2.5)
  expect(median([])).toBeNull()
})

test('before and after compare scenario by scenario', () => {
  const text = compareRuns(run('before', [scenario('FR1', 9, 6)]), run('after', [scenario('FR1', 2, 2)]))
  expect(text).toContain('| FR1 | yes → yes | 9 min → 2 min (-7 min) | 6 → 2 (-4) |')
  expect(compareRuns(run('before', []), { ...run('after', []), model: 'opus' })).toContain('different models')
})

test('a baseline keeps numbers and no handles', () => {
  const kept = forBaseline(run('before', [{ ...scenario('FR1', 9, 6), problems: ['lookup of @somebrand failed'] }]))
  expect(kept.scenarios[0].problems[0]).toBe('lookup of @… failed')
})

test('every scenario names a starting state, a first message and a reply, and the value tools are Atlas reads', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'personas.json'), 'utf8'))
  const reads: string[] = ATLAS_READS
  expect(config.valueTools.every((tool: string) => reads.includes(tool))).toBe(true)
  const codes = config.scenarios.map((s: any) => s.code)
  expect(new Set(codes).size).toBe(codes.length)
  expect(config.scenarios.filter((s: any) => s.flow === 'invited')).toHaveLength(2)
  for (const s of config.scenarios) {
    expect(typeof s.start.profile).toBe('boolean')
    expect(typeof s.start.instagram).toBe('boolean')
    expect(s.firstMessage.startsWith('/aspire')).toBe(true)
    expect(s.reply.length).toBeGreaterThan(20)
  }
})
