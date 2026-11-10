import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ATLAS_READS, ATLAS_WRITES, barChecks, compareRuns, extractPageCheckScript, fencedBlocks, fill, findJsonWithKey,
  findPage, forBaseline, normalizeResult, parsePageCheck, parseStream, renderRun, rIds, rResult, stripDataUris,
  parseConnectorList, summarizeTurn, toolPrefix, visibleTextLength, type PageChecks, type QuestionResult, type RunResults,
} from './lib'

const ROOT = join(import.meta.dir, '../..')
const line = (event: unknown) => JSON.stringify(event)

function stream(): string {
  return [
    line({ type: 'system', subtype: 'init', session_id: 's1', scratchpad_path: '/tmp/s', model: 'm', mcp_servers: [{ name: 'Aspire_Atlas_Dev', status: 'needs-auth' }] }),
    line({ type: 'assistant', message: { content: [{ type: 'text', text: 'Launching.' }, { type: 'tool_use', id: 't1', name: 'Task', input: {} }], usage: { input_tokens: 10, cache_read_input_tokens: 90, output_tokens: 5 } } }),
    line({ type: 'assistant', parent_tool_use_id: 't1', message: { content: [{ type: 'tool_use', id: 'w1', name: 'Write', input: { file_path: '/tmp/s/draft.html' } }], usage: { input_tokens: 999999 } } }),
    line({ type: 'assistant', parent_tool_use_id: 't1', message: { content: [{ type: 'tool_use', id: 'a1', name: 'Artifact', input: { file_path: '/tmp/s/page.html', icon: 'chart' } }] } }),
    line({ type: 'user', parent_tool_use_id: 't1', message: { content: [{ type: 'tool_result', tool_use_id: 'a1', content: [{ type: 'text', text: 'Published at https://claude.ai/artifact/AbC123 (private).' }] }] } }),
    line({ type: 'system', subtype: 'compact_boundary' }),
    line({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: 'Done.\n```result-packet\n{"page": "https://claude.ai/artifact/AbC123"}\n```' }] } }),
    line({ type: 'assistant', message: { content: [{ type: 'text', text: 'Here is the page.' }], usage: { input_tokens: 20, cache_creation_input_tokens: 30, cache_read_input_tokens: 400, output_tokens: 50 } } }),
    line({ type: 'result', session_id: 's1', result: 'Here is the page.', is_error: false, total_cost_usd: 0.5, usage: { input_tokens: 1000, output_tokens: 200 } }),
    '{"type": "assist',
  ].join('\n')
}

test('a turn is read from the stream: session, sizes, and the page it published', () => {
  const turn = summarizeTurn(parseStream(stream()))
  expect(turn.sessionId).toBe('s1')
  expect(turn.model).toBe('m')
  expect(turn.connectors).toEqual({ 'Aspire_Atlas_Dev': 'needs-auth' })
  expect(toolPrefix('Aspire_Atlas_Dev')).toBe('mcp__Aspire_Atlas_Dev__')
  expect(turn.failed).toBe(false)
  expect(turn.contextTokens).toBe(500) // the main thread's last message, never a subagent's
  expect(turn.billedTokens).toBe(1200)
  expect(turn.compactions).toBe(1)
  expect(turn.text).toContain('Launching.')
  expect(findPage(turn)).toEqual({ link: 'https://claude.ai/artifact/AbC123', file: '/tmp/s/page.html' })
})

test('a page link is read from the result packet when the publish call is not in the stream', () => {
  const turn = summarizeTurn(parseStream(stream().split('\n').filter(l => !l.includes('"a1"')).join('\n')))
  expect(findPage(turn)).toEqual({ link: 'https://claude.ai/artifact/AbC123', file: '/tmp/s/draft.html' })
})

test('a failed publish, an asset upload, and a read are not a published page', () => {
  const events = [
    { type: 'assistant', message: { content: [
      { type: 'tool_use', id: 'x', name: 'Artifact', input: { file_path: '/a.html' } },
      { type: 'tool_use', id: 'y', name: 'Artifact', input: { file_path: '/b.png', asset: true, url: 'u' } },
      { type: 'tool_use', id: 'z', name: 'Artifact', input: { action: 'read', url: 'https://claude.ai/artifact/Other1' } },
    ] } },
    { type: 'user', message: { content: [
      { type: 'tool_result', tool_use_id: 'x', is_error: true, content: 'refused https://claude.ai/artifact/Nope' },
      { type: 'tool_result', tool_use_id: 'z', content: 'https://claude.ai/artifact/Other1' },
    ] } },
  ]
  // The main thread saw the read's result text, but only a publish or a result packet names the run's page.
  expect(findPage(summarizeTurn(events))).toEqual({ link: null, file: null })
})

test('a turn with no result event counts as failed', () => {
  expect(summarizeTurn(parseStream(line({ type: 'system', subtype: 'init', session_id: 's' }))).failed).toBe(true)
})

test('JSON is found past prose, fences, and braces inside strings', () => {
  const text = 'Notes {not json}\n```json\n{"other": 1}\n```\n{"quality_review_grade": {"checks": [{"id": "R1", "result": "PASS", "reason": "a } in text"}]}}\ntrail'
  expect(findJsonWithKey(text, 'quality_review_grade').quality_review_grade.checks[0].id).toBe('R1')
  expect(findJsonWithKey('nothing here', 'x')).toBeNull()
  expect(fencedBlocks('```page-check\n{"a":1}\n```', 'page-check')).toEqual(['{"a":1}\n'])
})

test('the page-check script is cut from the skill and is the one the fixtures are tested with', () => {
  const script = extractPageCheckScript(readFileSync(join(ROOT, 'plugins/aspire/skills/page-standard/SKILL.md'), 'utf8'))
  expect(script.startsWith('# Page standard self-check')).toBe(true)
  expect(script.trimEnd().endsWith('sys.exit(main(sys.argv[1:]))')).toBe(true)
  expect(script).not.toContain('```')
  expect(() => extractPageCheckScript('no script')).toThrow()
})

test('page-check output is read per check', () => {
  const out = [line({ page: 'p', check: 'R1', result: 'pass', problems: [] }), line({ page: 'p', check: 'R11', result: 'fail', problems: ['a', 'b'] })].join('\n')
  expect(parsePageCheck(out)).toEqual({ results: { R1: 'pass', R11: 'fail' }, problems: { R11: 'a; b' } })
})

test('embedded images are removed and visible text is measured', () => {
  const html = '<img src="data:image/png;base64,AAAA+/=="><style>p{}</style><p>Hello  there</p>'
  expect(stripDataUris(html)).toBe('<img src="data:,"><style>p{}</style><p>Hello  there</p>')
  expect(visibleTextLength(html)).toBe('Hello there'.length)
})

test('results are normalized, and an R row needs the script and the grade to agree on a pass', () => {
  expect(['PASS', 'fixed', 'FAIL', 'N/A', 'unmarked', undefined].map(normalizeResult)).toEqual(['pass', 'pass', 'fail', 'n/a', 'not run', 'not run'])
  const checks = (scripted: Record<string, string>, graded: Record<string, any>): PageChecks => ({ scripted, graded, e: {}, reasons: {}, notes: [] })
  expect(rResult(checks({ R1: 'pass' }, { R1: 'fail' }), 'R1')).toBe('fail')
  expect(rResult(checks({ R1: 'fail' }, { R1: 'pass' }), 'R1')).toBe('fail')
  expect(rResult(checks({ R1: 'unmarked' }, { R1: 'pass' }), 'R1')).toBe('pass')
  expect(rResult(checks({ R1: 'unmarked' }, {}), 'R1')).toBe('not run')
  expect(rResult(checks({ R2: 'n/a' }, {}), 'R2')).toBe('n/a')
  expect(rResult(null, 'R1')).toBe('not run')
})

const E_CHECKS = [{ id: 'E1', name: 'Answers the real question' }, { id: 'E6', name: 'Reads like an editor checked it', waitsFor: 'ASP-5300' }]

function run(overrides: Partial<QuestionResult> = {}, date = '2026-11-10'): RunResults {
  const page: PageChecks = { scripted: { R1: 'pass' }, graded: { R1: 'pass', R3: 'fail' }, e: { E1: 'pass' }, reasons: { R3: 'Headline says "Acme overview"' }, notes: ['a note naming Acme'] }
  const question: QuestionResult = {
    code: 'I4', example: 'Holiday creator plan', setsBarFor: [5, 6], barChecks: ['E1', 'R3'],
    page: { link: 'https://claude.ai/artifact/AbC123', captured: true }, rounds: 2, transcriptTokens: 123456, billedTokens: 1, compactions: 1, costUsd: 1,
    new: page, approved: { ...page, graded: { R1: 'pass', R3: 'pass' } }, problems: ['Approved page for Acme'], ...overrides,
  }
  return { harness: 1, date, commit: 'abcdef1234', model: 'm', judgeModel: 'm', eChecksVersion: '3', questions: [question] }
}

test('the table shows each check beside the approved page, the sizes, and what did not run', () => {
  const table = renderRun(run(), E_CHECKS, { E1: 'Answers the real question', R3: 'Answer first' })
  expect(table).toContain('## Page eval · 2026-11-10 · plugin abcdef1 · m')
  expect(table).toContain('| E1 Answers the real question | pass | pass | yes |')
  expect(table).toContain('| R3 Answer first | fail | pass | yes |')
  expect(table).toContain('| E6 | – | – |  |')
  expect(table).toContain('| R12 | – | – |  |')
  expect(table).toContain('Transcript: 123,456 tokens, compacted 1 time · Confirmation rounds: 2 · New page: https://claude.ai/artifact/AbC123')
  expect(table).toContain('Not run yet: E6 (ASP-5300).')
})

test('an approved page that was not read shows no result, never a pass', () => {
  const table = renderRun(run({ approved: null }), E_CHECKS, {})
  expect(table).toContain('| E1 | pass | – | yes |')
  expect(table).toContain('| R3 | fail | – | yes |')
})

test('later R checks appear once a grade returns them', () => {
  const results = run()
  expect(rIds(results.questions).at(-1)).toBe('R12')
  results.questions[0].new!.graded.R14 = 'pass'
  expect(rIds(results.questions).at(-1)).toBe('R14')
})

test('a baseline keeps results and sizes, and no link, reason, note, or problem', () => {
  const kept = JSON.stringify(forBaseline(run()))
  expect(kept).not.toContain('claude.ai')
  expect(kept).not.toContain('Acme')
  const question = forBaseline(run()).questions[0]
  expect(question.new!.graded.R3).toBe('fail')
  expect(question.rounds).toBe(2)
  expect(question.transcriptTokens).toBe(123456)
})

test('compare lists only what changed and marks a changed approved result as drift', () => {
  const after = run({ rounds: 1, transcriptTokens: 100000 }, '2026-11-12')
  after.questions[0].new!.graded = { R1: 'pass', R3: 'pass' }
  after.questions[0].approved!.graded = { R1: 'fail', R3: 'pass' }
  const diff = compareRuns(run(), after, E_CHECKS)
  expect(diff).toContain('| R3 | fail → pass | pass |')
  expect(diff).toContain('| R1 | pass | pass → fail (drift) |')
  expect(diff).not.toContain('| E1 |')
  expect(diff).toContain('Transcript tokens: 123,456 → 100,000 · Confirmation rounds: 2 → 1')
  expect(diff).toContain('2 check results changed.')
  expect(compareRuns(run(), run(), E_CHECKS)).toContain('No check changed.')
})

test('the question set, the checks, and the Atlas tool lists hold together', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'questions.json'), 'utf8'))
  const eChecks = JSON.parse(readFileSync(join(import.meta.dir, 'e-checks.json'), 'utf8')).checks
  expect(config.questions.map((q: any) => q.code)).toEqual(['I4', 'I11', 'O1', 'O3', 'I1'])
  expect(eChecks.map((c: any) => c.id)).toEqual(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
  for (const question of config.questions) {
    expect(question.ask).toContain('{brand}')
    expect(barChecks(question.setsBarFor, config.changes).length).toBeGreaterThan(0)
  }
  expect(barChecks([5, 6], config.changes)).toContain('E6')
  expect(fill('For {brand}: {other}', { brand: 'Acme' })).toBe('For Acme: {other}')
  // No customer name in the committed question set: brands live in local.json.
  expect(JSON.stringify(config)).not.toMatch(/claude\.ai\/artifact/)
  // Every tool on the Atlas connector is either allowed or refused, so a new tool forces a choice.
  const contract = JSON.parse(readFileSync(join(ROOT, 'contract/atlas-mcp-tools.json'), 'utf8'))
  const tools = Object.keys(contract.surfaces['/mcp']).sort()
  expect([...ATLAS_READS, ...ATLAS_WRITES].sort()).toEqual(tools)
})

test('connector names are read from the list Claude Code prints', () => {
  const out = [
    'Checking MCP server health...', '',
    'claude.ai Atlas Admin Dev: https://example.test/mcp/admin - ✔ Connected',
    'plugin:aspire:Aspire Atlas: https://example.test/mcp (HTTP) - ! Needs authentication',
    'Aspire_Atlas_Dev: https://example.test/mcp (HTTP) - ✔ Connected',
    'local-tool: npx -y some-server --flag - ✗ Failed to connect',
  ].join('\n')
  expect(parseConnectorList(out)).toEqual(['claude.ai Atlas Admin Dev', 'plugin:aspire:Aspire Atlas', 'Aspire_Atlas_Dev', 'local-tool'])
  expect(toolPrefix('claude.ai Atlas Admin Dev')).toBe('mcp__claude_ai_Atlas_Admin_Dev__')
})
