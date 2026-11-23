import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { answersFor } from '../answers'
import { ANSWER_EVENT, ATLAS_READS, ATLAS_WRITES, TURN_START_EVENT, toolPrefix } from '../lib'
import {
  FIRST_RUN_REFUSED, FIRST_RUN_WRITES, compareRuns, creditsUsed, endsOnQuestion, firstValue, forBaseline, measure, median, reachedValue,
  readStatus, renderRun, scenarioAnswers, startProblems, unfilled, withCalibrations, type FirstRunResults, type ScenarioResult,
} from './lib'

const PREFIX = toolPrefix('Aspire_Atlas_Dev')
const VALUE = ['search_creators', 'search_posts', 'lookup_creators']

const use = (id: string, name: string, input: Record<string, unknown> = {}, parent?: string) =>
  ({ type: 'assistant', ...(parent ? { parent_tool_use_id: parent } : {}), message: { content: [{ type: 'tool_use', id, name, input }] } })
const result = (id: string, t: number, error = false, text = '{}') =>
  ({ type: 'user', _t: t, message: { content: [{ type: 'tool_result', tool_use_id: id, content: text, is_error: error }] } })
const end = (t: number, tokens: number, reply = 'ok') => ({ type: 'result', _t: t, session_id: 's', result: reply, is_error: false, total_cost_usd: 0.1, usage: { input_tokens: tokens } })
const answered = (id: string, ...questions: string[]) =>
  ({ type: ANSWER_EVENT, tool_use_id: id, answers: Object.fromEntries(questions.map(question => [question, { answer: 'x', by: 'list' }])) })

// Turn 1: get_status, the organization picker, a picker with two questions of which the harness answered one, then
// the turn ends without asking anything, so the reply that starts turn 2 is a nudge. Turn 2: create_profile, a failed
// search, then a successful search from a subagent, then more work.
const turns = () => [
  [
    { type: TURN_START_EVENT, _t: 0 },
    { ...use('a', PREFIX + 'get_status'), _t: 1000 }, result('a', 2000),
    { ...use('o', 'AskUserQuestion', { questions: [{ header: 'Organization', question: 'Which organization?' }] }), _t: 2500 }, answered('o', 'Which organization?'), result('o', 2600),
    { ...use('q', 'AskUserQuestion', { questions: [{ question: 'Role?' }, { question: 'Goal?' }] }), _t: 3000 }, answered('q', 'Role?'), result('q', 4000),
    end(10_000, 500, 'Setup is done. Say continue when you are ready.'),
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
  // The one answered question; the organization picker and the unanswered question are left out.
  expect(m.questionsToValue).toBe(1)
  // Turn 1 ended on no question, so the reply that started turn 2 was a nudge.
  expect(m.nudgesToValue).toBe(1)
  // get_status, both pickers, create_profile, the failed search, Task and the value search itself.
  expect(m.toolCallsToValue).toBe(7)
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
  expect(m.questionsToValue).toBe(2)
  expect(m.nudgesToValue).toBe(1)
})

test('a turn that ends on a question in text counts it as a question, not a nudge', () => {
  const asking = [{ type: TURN_START_EVENT, _t: 0 }, end(1000, 10, 'Which brand should I set up?')]
  const m = measure([asking, turns()[1]], VALUE, PREFIX)
  expect(m.questionsToValue).toBe(1)
  expect(m.nudgesToValue).toBe(0)
  expect(endsOnQuestion('Want me to go ahead?)')).toBe(true)
  expect(endsOnQuestion('Run /aspire:aspire when you are ready.')).toBe(false)
})

const status = (profiles: unknown[], consumed = 12, extra: Record<string, unknown> = {}) => JSON.stringify({
  organizations: { selected: { id: 'org_test', name: 'Eval One' } }, profiles,
  credits: { organizationId: 'org_test', coveredByAspire: false, thisPeriod: { consumed } }, setup: { done: 0, total: 7 },
  work: { programs: [], campaigns: [] }, firstRun: { organization: { invited: false } }, ...extra,
})
const LINKED = { profile: true, instagram: true, invited: false }
const NO_RECORDS = JSON.stringify({ records: [] })
/** A status reading with its calibrations read, as the probe makes it. */
const read = (text: string, calibrations: string | null = NO_RECORDS) => withCalibrations(readStatus(text)!, calibrations)

test('get_status gives the starting state and the credits consumed', () => {
  const linked = readStatus(status([{ channels: [{ network: 'instagram', authorization: 'live' }] }]))
  expect(linked).toEqual({
    organizationId: 'org_test', organizationName: 'Eval One', creditsConsumed: 12, coveredByAspire: false, profiles: 1, instagram: true,
    invited: false, setupDone: 0, savedWork: 0, brandRecords: null, lastRuns: null,
  })
  expect(readStatus(status([{ channels: [{ network: 'instagram', authorization: 'expired' }] }]))?.instagram).toBe(false)
  expect(readStatus('Atlas is connected. You have one profile.')).toBeNull()

  expect(startProblems(LINKED, read(status([{ channels: [{ network: 'instagram', authorization: 'live' }] }])), 'Eval One')).toEqual([])
  expect(startProblems({ profile: false, instagram: false, invited: false }, read(status([{ channels: [{ network: 'instagram' }] }])))).toHaveLength(2)
  expect(startProblems(LINKED, read(status([])))).toHaveLength(2)
  expect(startProblems(LINKED, null)[0]).toContain('unknown')
  // The reading must be of the scenario's own organization.
  expect(startProblems(LINKED, read(status([{ channels: [{ network: 'instagram', authorization: 'live' }] }])), 'Eval Two')[0]).toContain('another organization')
  // A run leaves brand context behind; the next run on that organization would skip the first run.
  const ig = [{ channels: [{ network: 'instagram' }] }]
  expect(startProblems(LINKED, read(status(ig, 0, { setup: { done: 3 } })))[0]).toContain('reset it')
  expect(startProblems(LINKED, read(status(ig, 0, { work: { programs: [{ name: 'p' }], campaigns: [] } })))[0]).toContain('saved programs')
  // The invited first turn needs an invited organization, and only the invited scenarios may have one.
  const invited = read(status(ig, 0, { firstRun: { organization: { invited: true } }, setup: { done: 2 } }))
  expect(startProblems({ ...LINKED, invited: true }, invited)).toEqual([])
  expect(startProblems(LINKED, invited)[0]).toContain('invited first turn')
  expect(startProblems({ ...LINKED, invited: true }, read(status(ig)))[0]).toContain('invited to')

  // Records an earlier run leaves behind, which the brand questions' count does not show.
  const records = (...kinds: [string, string][]) => JSON.stringify({ records: kinds.map(([kind, key]) => ({ kind, key })) })
  const used = read(status(ig), records(['user_fact', 'user:usr-1'], ['insight', 'lastrun:readout']))
  expect(used.brandRecords).toBe(2)
  expect(startProblems(LINKED, used)[0]).toContain('fresh organization')
  expect(startProblems(LINKED, read(status(ig), records(['insight', 'post:1'])))).toEqual([])
  // An invited organization holds the site's answers; only a last-run record stops it.
  expect(startProblems({ ...LINKED, invited: true }, withCalibrations(invited!, records(['brand_fact', 'brand:summary'])))).toEqual([])
  expect(startProblems({ ...LINKED, invited: true }, withCalibrations(invited!, records(['insight', 'lastrun:readout'])))[0]).toContain('repeat run')
  // Calibrations that were not read leave the state unknown; an organization with no Profile has none to read.
  expect(startProblems(LINKED, read(status(ig), null))[0]).toContain('could not be read')
  expect(startProblems(LINKED, read(status(ig), 'not json'))[0]).toContain('could not be read')
  expect(read(status([]), null).brandRecords).toBe(0)
  expect(creditsUsed(readStatus(status([], 10)), readStatus(status([], 13.456)))).toBe(3.46)
  // A new billing period between the readings: the run's credits are unknown, never negative.
  expect(creditsUsed(readStatus(status([], 10)), readStatus(status([], 2)))).toBeNull()
  expect(creditsUsed(null, readStatus(status([], 2)))).toBeNull()
  // Aspire pays for a covered organization, and its count leaves that work out: unknown, not zero.
  const covered = { credits: { coveredByAspire: true, thisPeriod: { consumed: 5 } } }
  expect(creditsUsed(readStatus(status([], 5, covered)), readStatus(status([], 5, covered)))).toBeNull()
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
  expect(renderRun(run('x', [scenario('FR1', 9, 6)]))).toContain('| 9 min | 6 | 1 |')
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

test('answer rules are filled from local.json, and a rule naming a missing value is dropped', () => {
  const rules = scenarioAnswers(
    [{ question: 'competitors', text: '{competitor}' }], [{ question: 'competitors', pick: '^Not sure' }, { pick: '^{brand} only' }],
    { brand: 'A+B (Co)' }, 'Eval One',
  )
  // The organization is picked by its whole name, or typed when the picker does not show it.
  expect(new RegExp(rules[0].pick!).test('Eval One (current)')).toBe(true)
  expect(new RegExp(rules[0].pick!).test('Eval One Invited')).toBe(false)
  expect(rules[1]).toEqual({ header: 'Organization', text: 'Eval One' })
  expect(rules).toHaveLength(4)
  expect(new RegExp(rules[3].pick!).test('A+B (Co) only')).toBe(true)
  expect(unfilled('against {competitor} and @{handle}')).toEqual(['competitor', 'handle'])
  expect(unfilled('against rival')).toEqual([])
  expect(rules.some(rule => rule.text === '{competitor}')).toBe(false)
})

// The option sets of the pickers a first run meets, as onboarding-questions.md and invited-first-turn.md word them.
function onboardingPickers(): { question: string; options: string[] }[] {
  const text = readFileSync(join(import.meta.dir, '../../../plugins/aspire/skills/aspire/references/onboarding-questions.md'), 'utf8')
  // The extended set is asked only after "Yes, continue", which the answer list never picks.
  const pickers: { question: string; options: string[] }[] = [
    { question: 'Continue with 4 optional questions on cadence, voice, KPIs, and team?', options: ['Yes, continue', 'Finish setup now'] },
    // onboarding.md 4.2, when no account was linked, and the two offers at the end of Phase 5 (offers.md).
    { question: 'Instagram is not connected yet. What next?', options: ['Try connecting again (Recommended)', 'Connect later'] },
    { question: "Put Atlas's pages in Brand's colors? It takes about two minutes.", options: ['Set it up now (Recommended)', 'Not now', "Don't ask again"] },
    { question: "Set Brand's creator rates? Fees on creator profiles will use them.", options: ['Set them up now (Recommended)', 'Later', "Don't ask again"] },
  ]
  for (const line of text.split('## Extended set')[0].split('\n')) {
    const cells = line.split('|').map(cell => cell.trim())
    const options = cells.find(cell => /^1\) /.test(cell))
    const question = cells.find(cell => /\?/.test(cell) && !/^1\) /.test(cell))
    if (!options || !question) continue
    pickers.push({ question, options: options.split(/;\s*\d\)\s*/).map(option => option.replace(/^1\)\s*/, '').split(':')[0].trim()) })
  }
  return pickers
}

test('every scenario answers the onboarding pickers without typing nothing, connecting, or taking the long road', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'personas.json'), 'utf8'))
  const pickers = onboardingPickers()
  expect(pickers.length).toBeGreaterThanOrEqual(9)
  const values = { brand: 'Brand', website: 'brand.example', handle: 'brand', competitor: 'rival' }
  for (const scenario of config.scenarios) {
    const rules = scenarioAnswers(scenario.answers ?? [], config.answers, values, 'Eval One')
    for (const picker of pickers) {
      const input = { questions: [{ header: '', question: picker.question, options: picker.options.map((label: string) => ({ label, description: '' })) }] }
      const answer = answersFor(input, rules)[picker.question]?.answer ?? ''
      // "I'll list them (type them)" with nothing typed brings a follow-up picker; Connect goes to a refused tool.
      expect(`${scenario.code}: ${picker.question} -> ${answer}`).not.toMatch(/type them| -> Try connecting|Yes, continue|Set (it|them) up now|Don't ask again| -> Instagram/)
    }
    // The invited next step, without Instagram, leads with Connect Instagram: the invited scenarios pass it by.
    const next = { questions: [{ header: 'Next step', question: 'What should we do next?', options: [
      { label: 'Connect Instagram (Recommended)', description: '' }, { label: 'Vet a list of creators', description: '' },
      { label: 'Find creators who fit', description: '' }] }] }
    if (scenario.flow === 'invited') expect(answersFor(next, rules)['What should we do next?'].answer).toBe('Find creators who fit')
  }
  // Each persona names its own role, so the flow routes it to its own reader.
  const relationship = (code: string) => config.scenarios.find((s: any) => s.code === code).answers.find((r: any) => r.question === 'relationship to')?.text
  expect(new Set(['FR1', 'FR2', 'FR3', 'FR4'].map(relationship)).size).toBe(4)
})
