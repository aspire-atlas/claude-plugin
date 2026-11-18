import { expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ATLAS_READS, ATLAS_WRITES, barChecks, compareRuns, extractPageCheckScript, fencedBlocks, fill, findJsonWithKey, configuredQuestions, skippedLine,
  findPage, forBaseline, normalizeResult, codesForChanges, readerResult, regressions, renderComment, renderSkipped, renderSlack, COMMENT_MARKER, renderStopped, stripTitlePrefix, checkNames, parsePageCheck, parseStream, renderRun, rIds, rResult, stripDataUris,
  aResult, assertionNotes, assertionRefs, cell, fixtureProblems, fixturesForChanges, hasLandedAssertion, passesWhen, planInputFiles, resolveQuestion, rows, safeFileName,
  parseConnectorList, summarizeTurn, toolPrefix, visibleTextLength, askText, chatCodes, chatFailures, chatLine, chatMessages, checkChat, countChat, noChat, normalizeRun, CHAT_CHECK,
  type Assertion, type AssertionRef, type PageChecks, type QuestionResult, type RunResults,
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
  expect(findPage(turn)).toEqual({ link: 'https://claude.ai/artifact/AbC123', file: '/tmp/s/page.html', finished: true })
})

test('a page link is read from the result packet when the publish call is not in the stream', () => {
  const turn = summarizeTurn(parseStream(stream().split('\n').filter(l => !l.includes('"a1"')).join('\n')))
  expect(findPage(turn)).toEqual({ link: 'https://claude.ai/artifact/AbC123', file: '/tmp/s/draft.html', finished: true })
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
  expect(findPage(summarizeTurn(events))).toEqual({ link: null, file: null, finished: false })
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
  const script = extractPageCheckScript(readFileSync(join(ROOT, 'plugins/aspire/skills/page-standard/page-check.md'), 'utf8'))
  expect(script.startsWith('# Page standard self-check')).toBe(true)
  expect(script.trimEnd().endsWith('sys.exit(show(pages) if "--text" in args else main(pages))')).toBe(true)
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
  const checks = (scripted: Record<string, string>, graded: Record<string, any>): PageChecks => ({ scripted, graded, e: {}, asserted: {}, reasons: {}, notes: [] })
  expect(rResult(checks({ R1: 'pass' }, { R1: 'fail' }), 'R1')).toBe('fail')
  expect(rResult(checks({ R1: 'fail' }, { R1: 'pass' }), 'R1')).toBe('fail')
  expect(rResult(checks({ R1: 'unmarked' }, { R1: 'pass' }), 'R1')).toBe('pass')
  expect(rResult(checks({ R1: 'unmarked' }, {}), 'R1')).toBe('not run')
  expect(rResult(checks({ R2: 'n/a' }, {}), 'R2')).toBe('n/a')
  expect(rResult(null, 'R1')).toBe('not run')
})

const E_CHECKS = [{ id: 'E1', name: 'Answers the real question' }, { id: 'E6', name: 'Reads like an editor checked it', waitsFor: 'ASP-5300' }]

function run(overrides: Partial<QuestionResult> = {}, date = '2026-11-10'): RunResults {
  const page: PageChecks = { scripted: { R1: 'pass' }, graded: { R1: 'pass', R3: 'fail' }, e: { E1: 'pass' }, asserted: {}, reasons: { R3: 'Headline says "Acme overview"' }, notes: ['a note naming Acme'] }
  const question: QuestionResult = {
    code: 'I4', example: 'Holiday creator plan', setsBarFor: [5, 6], barChecks: ['E1', 'R3'],
    page: { link: 'https://claude.ai/artifact/AbC123', captured: true }, rounds: 2, transcriptTokens: 123456, billedTokens: 1, compactions: 1, costUsd: 1,
    new: page, approved: { ...page, graded: { R1: 'pass', R3: 'pass' } }, chat: noChat(), problems: ['Approved page for Acme'], assertions: [], ...overrides,
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
  expect(rIds(results.questions).at(-1)).toBe('R14')
  results.questions[0].new!.graded.R15 = 'pass'
  expect(rIds(results.questions).at(-1)).toBe('R15')
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

test('every question\'s reader has a row in the result table the judge is handed', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'questions.json'), 'utf8'))
  const lens = readFileSync(join(ROOT, 'plugins/aspire/skills/aspire/references/recipient-lens.md'), 'utf8')
  for (const question of config.questions) expect(readerResult(lens, question.reader)?.result).toBeTruthy()
  expect(readerResult(lens, 'performance')).toEqual({ result: 'Sign-ups, sales, and cost per result', standIn: 'Engagement per 1,000 views' })
  expect(readerResult(lens, 'nobody')).toBeNull()
  expect(readerResult('no table here', 'team')).toBeNull()
})

test('the question set, the checks, and the Atlas tool lists hold together', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'questions.json'), 'utf8'))
  const eChecks = JSON.parse(readFileSync(join(import.meta.dir, 'e-checks.json'), 'utf8')).checks
  expect(config.questions.map((q: any) => q.code)).toEqual(['I4', 'I11', 'O1', 'O2', 'O3', 'I1', 'P1', 'CR1', 'AR1'])
  expect(eChecks.map((c: any) => c.id)).toEqual(['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'])
  for (const question of config.questions) {
    expect(question.ask).toContain('{brand}')
    // A question sets the bar for a change of the first review, or carries assertions of its own.
    expect(barChecks(question.setsBarFor, config.changes).length + (question.assertions?.length ?? 0)).toBeGreaterThan(0)
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

test('a result packet with no page means the flow finished without one', () => {
  const events = [{ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't', content: '```result-packet\n{"page": null}\n```' }] } }]
  expect(findPage(summarizeTurn(events))).toEqual({ link: null, file: null, finished: true })
})

test('a storyline draft packet with no page is not the end of the run', () => {
  const events = [{ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't', content: '```result-packet\n{"page": null, "storyline": {"pass": "draft", "bullets": []}}\n```' }] } }]
  expect(findPage(summarizeTurn(events))).toEqual({ link: null, file: null, finished: false })
})

test('a feeder agent packet beside a storyline draft does not end the run', () => {
  const feeder = '```result-packet\n{"page": null, "storyline": {"pass": "none", "bullets": []}}\n```'
  const draft = '```result-packet\n{"page": null, "storyline": {"pass": "draft", "bullets": []}}\n```'
  const events = [{ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't', content: `${feeder}\n${draft}` }] } }]
  expect(findPage(summarizeTurn(events))).toEqual({ link: null, file: null, finished: false })
})

test('a build packet after a storyline draft ends the run', () => {
  const draft = '```result-packet\n{"page": null, "storyline": {"pass": "draft", "bullets": []}}\n```'
  const build = '```result-packet\n{"page": "https://claude.ai/artifact/AbC123", "storyline": {"pass": "build", "bullets": []}}\n```'
  const events = [{ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't', content: `${draft}\n${build}` }] } }]
  expect(findPage(summarizeTurn(events))).toEqual({ link: 'https://claude.ai/artifact/AbC123', file: null, finished: true })
})

test('a build packet with no page ends the run, storyline or not', () => {
  const events = [{ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't', content: '```result-packet\n{"page": null, "storyline": {"pass": "build", "bullets": []}}\n```' }] } }]
  expect(findPage(summarizeTurn(events))).toEqual({ link: null, file: null, finished: true })
})

test('a file path in the result packet is the page on a host that cannot publish', () => {
  const events = [{ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't', content: '```result-packet\n{"page": "/tmp/work/brief.html"}\n```' }] } }]
  expect(findPage(summarizeTurn(events))).toEqual({ link: null, file: '/tmp/work/brief.html', finished: true })
})

test('a pull request reruns the questions its changed agents and flow files answer', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'questions.json'), 'utf8'))
  const pick = (changed: string[]) => codesForChanges(changed, config.questions, config.sharedPaths).codes
  expect(pick(['README.md', 'docs/STANDARD.md'])).toEqual([])
  expect(pick(['plugins/aspire/agents/atlas-market-signal.md'])).toEqual(['O2', 'O3', 'CR1'])
  expect(pick(['plugins/aspire/agents/atlas-ad-reuse.md'])).toEqual(['P1'])
  expect(pick(['plugins/aspire/skills/aspire/references/ad-reuse.md'])).toEqual(['P1'])
  expect(pick(['plugins/aspire/skills/aspire/references/affiliate.md'])).toEqual(['AR1'])
  expect(pick(['plugins/aspire/agents/atlas-affiliate-manager.md'])).toEqual(['AR1'])
  expect(pick(['plugins/aspire/skills/aspire/references/creator-vetting.md', 'plugins/aspire/agents/atlas-creator-brief.md'])).toEqual(['I4', 'I1'])
  // A watched file no question answers reruns nothing; a file every flow reads reruns every question.
  expect(pick(['plugins/aspire/agents/atlas-shops.md'])).toEqual([])
  expect(pick(['plugins/aspire/skills/aspire/references/reader-standard.md'])).toEqual(['I4', 'I11', 'O1', 'O2', 'O3', 'I1', 'P1', 'CR1', 'AR1'])
  // The page standard and the router shape every page, so a change to either reruns every question.
  expect(pick(['plugins/aspire/skills/page-standard/SKILL.md'])).toEqual(['I4', 'I11', 'O1', 'O2', 'O3', 'I1', 'P1', 'CR1', 'AR1'])
  expect(pick(['plugins/aspire/skills/aspire/SKILL.md'])).toEqual(['I4', 'I11', 'O1', 'O2', 'O3', 'I1', 'P1', 'CR1', 'AR1'])
  expect(pick(['plugins/aspire/skills/org-admin/SKILL.md'])).toEqual([])
  // Every path a question names exists, so a renamed agent cannot silently stop rerunning its question.
  for (const path of [...config.questions.flatMap((q: any) => q.paths), ...config.sharedPaths]) {
    expect(existsSync(join(ROOT, path))).toBe(true)
  }
})

test('only a check the approved page passes and the new page fails is a regression', () => {
  expect(regressions(run(), E_CHECKS, {})).toEqual([{ kind: 'page', code: 'I4', id: 'R3', was: 'pass', now: 'fail' }])
  // The approved page failing too, or not having run, is not a regression.
  const both = run()
  both.questions[0].approved!.graded.R3 = 'fail'
  expect(regressions(both, E_CHECKS, {})).toEqual([])
  expect(regressions(run({ approved: null }), E_CHECKS, {})).toEqual([])
  // No page at all regresses every check the approved page passes.
  expect(regressions(run({ new: null }), E_CHECKS, {}).map(r => r.id)).toEqual(['E1', 'R1', 'R3'])
})

test('the PR comment carries the marker, the regressions, and the table, and a skip says why', () => {
  const comment = renderComment(run(), E_CHECKS, { R3: 'Answer first' }, 'the baseline of 2026-11-10', 'https://example.test/run/1')
  expect(comment.startsWith(COMMENT_MARKER)).toBe(true)
  expect(comment).toContain('**1 regression**')
  expect(comment).toContain('- I4 R3 Answer first: approved pass, new fail')
  expect(comment).toContain('| R3 Answer first | fail | pass | yes |')
  expect(comment).toContain('Confirmation rounds: 2')
  expect(renderComment(run({ approved: null }), E_CHECKS, {}, null, null)).toContain('No approved results for I4')
  expect(renderSkipped('docs only')).toBe(`${COMMENT_MARKER}\n## Page eval\n\nskipped: docs only\n`)
  expect(renderStopped(null)).toContain('stopped before any question finished')
  expect(renderStopped(null).startsWith(COMMENT_MARKER)).toBe(true)
})

test('the Slack message names each question and its regressions, and no page link', () => {
  const text = renderSlack(run(), E_CHECKS, {}, null)
  expect(text).toContain('1 regression')
  expect(text).toContain('• I4 Holiday creator plan: 2/3 checks pass; regressed R3')
  expect(text).not.toContain('claude.ai')
})

test('the CI title prefix is removed before grading, and nothing else is', () => {
  const page = '<title>CI eval · Holiday plan</title><h1>CI eval: Holiday plan</h1><p>CI is fine here.</p>'
  expect(stripTitlePrefix(page, 'CI eval')).toBe('<title>Holiday plan</title><h1>Holiday plan</h1><p>CI is fine here.</p>')
  expect(stripTitlePrefix(page, null)).toBe(page)
})

test('check names come from e-checks and the reader standard table', () => {
  const names = checkNames([{ id: 'E1', name: 'Answers the real question' }], '| R1 | Reader and scope | x |\n| R13 | Required metrics | y |')
  expect(names).toEqual({ E1: 'Answers the real question', R1: 'Reader and scope', R13: 'Required metrics', C5: 'Chat wording' })
})

test('a question local.json names no brand for is skipped while no baseline grades it, and stops the run once one does', () => {
  const questions = [{ code: 'O2' }, { code: 'O3' }]
  const local = { questions: { O3: { brand: 'Acme' }, O2: { brand: '' } } }
  const none = () => false
  expect(configuredQuestions(questions, local, false, none)).toEqual({ run: [{ code: 'O3' }], skipped: ['O2'], missing: [] })
  expect(configuredQuestions(questions, {}, false, none)).toEqual({ run: [], skipped: ['O2', 'O3'], missing: [] })
  expect(configuredQuestions(questions, {}, false, code => code === 'O3')).toEqual({ run: [], skipped: ['O2'], missing: ['O3'] })
  expect(configuredQuestions(questions, {}, true, () => true)).toEqual({ run: questions, skipped: [], missing: [] })
})

test('every report names the skipped questions, and a run with none left posts a skip that passes', () => {
  expect(skippedLine([])).toBeNull()
  expect(skippedLine(['O2'])).toBe('Skipped: O2 (no brand in local.json), so it was not graded and cannot regress.')
  const withSkip = { ...run(), skipped: ['O2'] }
  expect(renderComment(withSkip, E_CHECKS, {}, null, null)).toContain('Skipped: O2')
  expect(renderSlack(withSkip, E_CHECKS, {}, null)).toContain('Skipped: O2')
  expect(renderRun(withSkip, E_CHECKS, {})).toContain('Skipped: O2')
  const nothing = { ...run(), questions: [], skipped: ['O2'] }
  const comment = renderComment(nothing, E_CHECKS, {}, null, 'https://example.test/run/2')
  expect(comment).toContain('skipped: no question ran. Skipped: O2')
  expect(comment).toContain('Run: https://example.test/run/2')
  expect(regressions(nothing, E_CHECKS, {})).toEqual([])
})

// One turn of a run: what the main thread asked with AskUserQuestion, and the reply the turn ended on.
function chatTurn(reply: string, asks: { header: string; question: string; options?: string[] }[] = [], extra: unknown[] = []): ReturnType<typeof summarizeTurn> {
  return summarizeTurn(parseStream([
    ...asks.map((ask, i) => line({ type: 'assistant', message: { content: [{ type: 'tool_use', id: `q${i}`, name: 'AskUserQuestion', input: { questions: [{ header: ask.header, question: ask.question, options: (ask.options ?? ['Yes, run it (Recommended)']).map(label => ({ label, description: '' })) }] } }] } })),
    ...extra.map(line),
    line({ type: 'result', session_id: 's1', result: reply, is_error: false }),
  ].join('\n')))
}

// The ids the count runs with in these tests, and one allowed product name.
const RULES = { codes: ['I2', 'I4', 'O2', 'P4', 'R3', 'R9', 'A1', 'D4'], allow: ['Canon R5'] }
const CLEAN = { arrows: 0, vs: 0, codes: 0 }
// The tool result a storyline draft comes back in: it marks the turn as a storyline check-in.
const DRAFT = [{ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: '```result-packet\n{"page": null, "storyline": {"pass": "draft"}}\n```' }] } }]

test('the three chat messages are read from the questions asked and the replies the turns ended on', () => {
  const turns = [
    chatTurn('Is that right?', [{ header: 'Heard', question: 'You asked whether to work with @handle. Is that right?' }]),
    chatTurn('Which should I build?', [{ header: 'Storyline', question: 'Gift posts beat the usual views, across 78 posts from 15 accounts.', options: ['Build (Recommended)', 'Change'] }]),
    chatTurn('The page is here: https://claude.ai/artifact/AbC123. Two saves are waiting for your yes.'),
  ]
  const messages = chatMessages(turns, true)
  expect(messages.setup).toBe('You asked whether to work with @handle. Is that right?\nYes, run it (Recommended)\nIs that right?')
  expect(messages.storyline).toContain('across 78 posts from 15 accounts.\nBuild (Recommended)\nChange\nWhich should I build?')
  expect(messages.closeOut).toContain('Two saves are waiting')
  const checked = checkChat(turns, true, RULES)
  expect(checked.checks).toEqual({ result: 'pass', messages: { setup: CLEAN, storyline: CLEAN, closeOut: CLEAN } })
  expect(checked.messages).toEqual(messages)
  expect(checked.hits).toEqual([])
  // A run of one turn that published holds a close-out and no setup reply.
  expect(chatMessages([chatTurn('Here is the page.')], true)).toEqual({ closeOut: 'Here is the page.' })
  expect(askText({ questions: [{ question: 'Q?', header: 'Heard', options: [{ label: 'A', description: 'why' }] }] })).toBe('Q?\nA\nwhy')
  // A host that refuses the question tool asks in text: a storyline draft packet marks that turn.
  const refused = [chatTurn('I heard I2. Right?'), chatTurn('Storyline: gifts vs deals. Build?', [], DRAFT), chatTurn('Done.')]
  expect(chatMessages(refused, true)).toEqual({ setup: 'I heard I2. Right?', storyline: 'Storyline: gifts vs deals. Build?', closeOut: 'Done.' })
  expect(checkChat([], false, RULES).checks).toEqual({ result: 'not run', messages: {} })
})

test('a run that stopped without publishing has no close-out, and its last reply is graded as what it was', () => {
  // Stopped on the setup question: the reply is the setup reply, and no close-out was sent.
  expect(chatMessages([chatTurn('I heard I2. Right?')], false)).toEqual({ setup: 'I heard I2. Right?' })
  // Stopped on the storyline after the reply limit: the last reply is a check-in, never a close-out.
  const stopped = [chatTurn('Is that right?'), chatTurn('Storyline: gifts vs deals. Build?', [], DRAFT)]
  expect(chatMessages(stopped, false)).toEqual({ setup: 'Is that right?', storyline: 'Storyline: gifts vs deals. Build?' })
  const { checks } = checkChat(stopped, false, RULES)
  expect(checks.messages).toEqual({ setup: CLEAN, storyline: { arrows: 0, vs: 1, codes: 0 } })
  expect(chatLine(checks)).toBe('Chat wording (C5): fail. setup reply clean; storyline check-in has 0 arrows, 1 "vs" and 0 codes; close-out not sent.')
  // Stopped on a later question that is not the storyline: that reply is counted too, in its own part.
  const later = [...stopped, chatTurn('Send it -> Slack?', [{ header: 'Send', question: 'Where should I send the I2 page?' }])]
  expect(chatMessages(later, false).stoppedOn).toBe('Where should I send the I2 page?\nYes, run it (Recommended)\nSend it -> Slack?')
  const stoppedLater = checkChat(later, false, RULES).checks
  expect(stoppedLater.messages.stoppedOn).toEqual({ arrows: 1, vs: 0, codes: 1 })
  expect(chatLine(stoppedLater)).toContain('close-out not sent; question the run stopped on has 1 arrow, 0 "vs" and 1 code.')
  // The same turns, published: the last reply is the close-out and nothing is counted twice.
  expect(chatMessages(later, true).stoppedOn).toBeUndefined()
})

test('every storyline check-in is graded, so a redraft after Change is counted', () => {
  const ask = (question: string) => [{ header: 'Storyline', question, options: ['Build (Recommended)', 'Change'] }]
  const turns = [
    chatTurn('Is that right?', [{ header: 'Heard', question: 'You asked what to post next week. Is that right?' }]),
    chatTurn('Which should I build?', ask('Gift posts beat the usual views across 78 posts.')),
    chatTurn('Which should I build?', ask('Gifts vs deals -> gifts win on views.')),
    chatTurn('The page is ready.'),
  ]
  expect(chatMessages(turns, true).storyline).toContain('Gift posts beat')
  expect(chatMessages(turns, true).storyline).toContain('Gifts vs deals')
  const { checks } = checkChat(turns, true, RULES)
  expect(checks.result).toBe('fail')
  expect(checks.messages.storyline).toEqual({ arrows: 1, vs: 1, codes: 0 })
})

test('arrows, "vs" and codes are counted in chat, and links and ordinary words are not', () => {
  const count = (text: string) => countChat(text, RULES).count
  expect(count('I heard I2: fit vs cost -> profile page. Fixed R3 Answer first; EN2 open.')).toEqual({ arrows: 1, vs: 1, codes: 3 })
  expect(count('Gifts → deals, Instagram vs. TikTok, and O2 => P4')).toEqual({ arrows: 2, vs: 1, codes: 2 })
  expect(count('The page is here: https://example.test/a->b/I2/vs. Canvas saves and pacing are fine, and so is a B2B plan for Q3.')).toEqual(CLEAN)
  expect(countChat('I heard I2.', RULES).hits).toEqual(['codes: …I heard I2.…'])
  // A saved file's path holds the question code (the run folder is named for it); a backticked span and an HTML
  // comment are not chat wording.
  expect(count('The page was saved here: /tmp/eval-run/I4/work/page.html. See `a -> b` and <!-- note -->.')).toEqual(CLEAN)
  expect(count('Fixed R3 before publishing. Then: R9 still fails, and O2 is next ➡ soon. UX14 is open.')).toEqual({ arrows: 1, vs: 0, codes: 4 })
  // A code after a capitalised word is still a code: only a name on the allow list is left out.
  expect(count('Your Heard I2 question is ready.')).toEqual({ arrows: 0, vs: 0, codes: 1 })
  expect(count('She shot it on a Canon R5, and the Sony A1 came second.')).toEqual({ arrows: 0, vs: 0, codes: 1 })
  // Handles and hashtags stay as written, and "VS Code" is a product. "vs" counts in any case.
  expect(count('She posts as @O2 on TikTok under #A1 and #ad. We use VS Code.')).toEqual(CLEAN)
  expect(count('Vs last week, views are up. TIKTOK VS INSTAGRAM.')).toEqual({ arrows: 0, vs: 2, codes: 0 })
  // A finding id counts at any length.
  expect(count('UX104 and EN100 are open.')).toEqual({ arrows: 0, vs: 0, codes: 2 })
  // An empty name on the allow list is skipped: it would hide every count.
  expect(countChat('Fixed R3 and I2 -> done', { ...RULES, allow: ['', ' '] }).count).toEqual({ arrows: 1, vs: 0, codes: 2 })
})

test('quoted words are left out of the chat count only when the quotes balance', () => {
  const count = (text: string) => countChat(text, RULES).count
  expect(count('Her "iPhone vs Pixel" video led the week, and “gifts vs deals” came next.')).toEqual(CLEAN)
  // An inch mark is not a quote: the code after it is counted, and the quoted one is not.
  expect(count('It is a 12" screen. Then I heard I2 and "R3" here.')).toEqual({ arrows: 0, vs: 0, codes: 1 })
  // A stray quote hides nothing.
  expect(count('He said "fine. Then I heard I2 vs R3.')).toEqual({ arrows: 0, vs: 1, codes: 2 })
  // Quotes pair within a line, never across lines.
  expect(count('The "first\nI2 line" ends.')).toEqual({ arrows: 0, vs: 0, codes: 1 })
})

test('the codes the chat count knows come from the files that define them', () => {
  const reference = '| Code | Question |\n| ---- | -------- |\n| I2 | Should we work with @handle? |\n| **O4** | What are people saying? |\n| R15 | A new check |\n'
  expect(chatCodes([reference], ['E9', 'I11'])).toEqual(['E9', 'I11', 'I2', 'O4', 'R15'])
  // An id added to one of those files is counted from the next run on, and one that no file defines is not:
  // a flow's own question ids read as product names ("F1 sponsorship", "BMW X5", "an A4 flyer").
  const rules = { codes: chatCodes([reference], ['E9', 'I11']), allow: [] }
  expect(countChat('R15 and I11 failed, O4 is saved, and E9 is open.', rules).count).toEqual({ arrows: 0, vs: 0, codes: 4 })
  expect(countChat('Your F1 sponsorship, the M1 laptops, a BMW X5, an A4 flyer and the Q3 plan.', rules).count).toEqual(CLEAN)
  // The real files: the question-code map and the reader standard give question codes and R checks only.
  const real = chatCodes(['orchestration.md', 'reader-standard.md'].map(name => readFileSync(join(ROOT, 'plugins/aspire/skills/aspire/references', name), 'utf8')))
  expect(real).toContain('I2')
  expect(real).toContain('R3')
  expect(real.filter(id => !/^(?:[IOP]\d+|A1|R\d+)$/.test(id))).toEqual([])
})

test('a countable rule broken in chat fails the run, with no approved result to compare', () => {
  const { checks: chat, hits } = checkChat([chatTurn('I heard I2: fit vs cost. Right?', [{ header: 'Heard', question: 'I heard I2. Right?' }]), chatTurn('Done -> page.')], true, RULES)
  expect(chat.result).toBe('fail')
  expect(chat.messages).toEqual({ setup: { arrows: 0, vs: 1, codes: 2 }, closeOut: { arrows: 1, vs: 0, codes: 0 } })
  expect(hits).toHaveLength(4)
  const failing = run()
  failing.questions[0].approved!.graded.R3 = 'fail'
  failing.questions[0].chat = chat
  const names = { [CHAT_CHECK.id]: CHAT_CHECK.name }
  expect(chatFailures(failing, names)).toEqual([{ kind: 'chat', code: 'I4', id: 'C5', name: 'Chat wording' }])
  expect(regressions(failing, E_CHECKS, names)).toEqual(chatFailures(failing, names))
  // The chat is a line under the table, not a row of it: it is not a page comparison.
  const table = renderRun(failing, E_CHECKS, names)
  expect(table).not.toContain('| C5')
  expect(table).toContain('- Chat wording (C5): fail. setup reply has 0 arrows, 1 "vs" and 2 codes; storyline check-in not sent; close-out has 1 arrow, 0 "vs" and 0 codes.')
  expect(table).not.toContain('I heard')
  expect(renderComment(failing, E_CHECKS, names, null, null)).toContain("- I4 C5 Chat wording: the run's chat broke a countable rule")
  // A baseline keeps the counts, which hold no chat text; a clean chat never fails.
  expect(forBaseline(failing).questions[0].chat).toEqual(chat)
  failing.questions[0].chat = { result: 'pass', messages: { closeOut: CLEAN } }
  expect(regressions(failing, E_CHECKS, {})).toEqual([])
  expect(chatLine(failing.questions[0].chat)).toBe('Chat wording (C5): pass. setup reply not sent; storyline check-in not sent; close-out clean.')
  expect(regressions(run(), E_CHECKS, {}).map(r => r.id)).toEqual(['R3'])
  expect(chatLine(noChat())).toBeNull()
})

test('a run stored before the chat check reads as chat not run, and adds no change to a compare', () => {
  const stored = run()
  delete (stored.questions[0] as any).chat
  const before = normalizeRun(stored)
  expect(before.questions[0].chat).toEqual(noChat())
  const after = run()
  after.questions[0].chat = { result: 'pass', messages: { closeOut: CLEAN } }
  expect(compareRuns(before, after, E_CHECKS)).toContain('0 check results changed.')
  const failed = run()
  failed.questions[0].chat = { result: 'fail', messages: { closeOut: { arrows: 1, vs: 0, codes: 0 } } }
  const compared = compareRuns(after, failed, E_CHECKS)
  expect(compared).toContain('Chat wording (C5): pass → fail')
  expect(compared).toContain('1 check result changed.')
  expect(compared).not.toContain('No check changed.')
})

// ---------------------------------------------------------------- client cases and their assertions

const SHOP: AssertionRef = { id: 'A1', name: 'Shop posts are their own group', ticket: 'ASP-5976', landed: false }
const MENTIONS: AssertionRef = { id: 'A2', name: 'Mentions count with or without the @', ticket: 'ASP-5977', landed: false }

/** A client case with no approved page: A1 fails and A2 passes on the new page. */
function caseRun(assertions: AssertionRef[] = [SHOP, MENTIONS], asserted: Record<string, any> = { A1: 'fail', A2: 'pass' }): RunResults {
  const results = run({ code: 'CR1', example: 'Competitive read', setsBarFor: [], barChecks: [], approved: null, assertions })
  results.questions[0].new = { ...results.questions[0].new!, graded: { R1: 'pass' }, asserted }
  return results
}

test('every client case names a ticket per assertion and has both fixture pages, with placeholder handles and links', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'questions.json'), 'utf8'))
  const cases = config.questions.filter((q: any) => q.assertions)
  expect(cases.map((q: any) => q.code)).toEqual(['CR1', 'AR1'])
  for (const question of cases) {
    const ids = question.assertions.map((a: Assertion) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const a of question.assertions as Assertion[]) {
      expect(a.ticket).toMatch(/^ASP-\d+$/)
      expect(typeof a.landed).toBe('boolean')
      expect(a.passesWhen.length).toBeGreaterThan(20)
      expect(a.failsWhen.length).toBeGreaterThan(20)
      // The first row of "what it covers": the client example the assertion came from.
      expect(a.examples.length).toBeGreaterThan(0)
    }
    for (const role of ['wrong', 'corrected']) {
      const page = readFileSync(join(ROOT, question.fixtures[role]), 'utf8')
      // A handle that could be a real person's, or a link to a real post, never sits beside invented figures.
      expect((page.match(/@\w+/g) ?? []).every(handle => /^@(creator_[a-z]|handle)$/.test(handle))).toBe(true)
      expect((page.match(/https?:\/\/[^"\s<]+/g) ?? []).every(link => link.startsWith('https://example.com/'))).toBe(true)
    }
    // A figure a case expects on the fixture pages names only what the pages invent.
    for (const a of question.assertions as Assertion[]) if (a.whenNamed) expect(passesWhen(a, question.fixtures.values ?? {})).toContain(' at least ')
  }
  // The competitive read is the plugin's own question; the affiliate report has no question code.
  const resolved = config.questions.map(resolveQuestion)
  expect(resolved.map((q: any) => q.question)).toEqual(['I4', 'I11', 'O1', 'O2', 'O3', 'I1', 'P1', 'O3', null])
  expect(resolved.map((q: any) => q.assertions.length)).toEqual([0, 0, 0, 0, 0, 0, 0, 3, 5])
})

test('an expected figure joins an assertion only when local.json names everything it asks about', () => {
  const a: Assertion = { ...MENTIONS, fix: 2, passesWhen: 'Counts name matches.', failsWhen: 'Tags only.', examples: [], whenNamed: 'The count for {competitor} is at least {competitorPosts} posts.' }
  expect(passesWhen(a, {})).toBe('Counts name matches.')
  expect(passesWhen(a, { competitor: 'Lumen Kids' })).toBe('Counts name matches.')
  expect(passesWhen(a, { competitor: 'Lumen Kids', competitorPosts: '20' })).toBe('Counts name matches. The count for Lumen Kids is at least 20 posts.')
})

test('a case shows its assertions first, each with its ticket, and says which still wait on one', () => {
  const results = caseRun()
  expect(rows(results.questions[0], E_CHECKS, [], {}).slice(0, 2).map(row => [row.id, row.new, row.approved, row.bar])).toEqual([['A1', 'fail', 'not run', true], ['A2', 'pass', 'not run', true]])
  const table = renderRun(results, E_CHECKS, {})
  expect(table).toContain('| A1 Shop posts are their own group (ASP-5976) | fail | – | yes |')
  expect(table.indexOf('| A1 ')).toBeLessThan(table.indexOf('| E1 '))
  expect(table).toContain('- Waiting on a ticket, so not a regression: A1 (ASP-5976).')
  expect(table).toContain('- Passes before its ticket is marked as landed: A2 (ASP-5977).')
  expect(assertionNotes(caseRun([{ ...SHOP, landed: true }], { A1: 'pass' }).questions[0])).toEqual([])
  // An assertion the judge did not return, or one the page's data cannot show, is never listed as a failure.
  expect(assertionNotes(caseRun([SHOP, MENTIONS], { A2: 'n/a' }).questions[0])).toEqual([
    'Not judged (the judge returned no row, or an N/A it is told not to give), so nothing is known about: A1 (ASP-5976), A2 (ASP-5977).',
  ])
  expect(aResult(null, 'A1')).toBe('not run')
  expect(assertionRefs([])).toEqual([])
  expect([cell('not run'), cell('fail')]).toEqual(['–', 'fail'])
})

test('an assertion blocks nothing until its ticket lands, and from then on a failure is a regression', () => {
  expect(regressions(caseRun(), E_CHECKS, {})).toEqual([])
  const landed = caseRun([{ ...SHOP, landed: true }, MENTIONS])
  expect(regressions(landed, E_CHECKS, {})).toEqual([{ kind: 'assertion', code: 'CR1', id: 'A1', name: SHOP.name, ticket: 'ASP-5976', now: 'fail' }])
  const comment = renderComment(landed, E_CHECKS, {}, null, null)
  expect(comment).toContain('- CR1 A1 Shop posts are their own group: ASP-5976 landed, new fail')
  expect(renderSlack(landed, E_CHECKS, {}, null)).toContain('regressed A1')
  // No page at all brings the wrong reading back as surely as a failing one.
  const noPage = caseRun([{ ...SHOP, landed: true }])
  noPage.questions[0].new = null
  expect(regressions(noPage, E_CHECKS, {})).toEqual([{ kind: 'assertion', code: 'CR1', id: 'A1', name: SHOP.name, ticket: 'ASP-5976', now: 'no page' }])
  // A landed assertion must pass. A judge that answers n/a, or returns no row, lets the wrong reading back in unseen.
  expect(regressions(caseRun([{ ...SHOP, landed: true }], { A1: 'n/a' }), E_CHECKS, {}).map(r => r.kind === 'assertion' && r.now)).toEqual(['n/a'])
  const unjudged = caseRun([{ ...SHOP, landed: true }], {})
  expect(regressions(unjudged, E_CHECKS, {}).map(r => r.kind === 'assertion' && r.now)).toEqual(['not run'])
  expect(renderComment(unjudged, E_CHECKS, {}, null, null)).toContain('- CR1 A1 Shop posts are their own group: ASP-5976 landed, new not judged')
  expect(regressions(caseRun([{ ...SHOP, landed: true }], { A1: 'pass' }), E_CHECKS, {})).toEqual([])
  // Before its ticket lands, an assertion regresses only against an approved page that passes it.
  const approved = caseRun()
  approved.questions[0].approved = { ...approved.questions[0].new!, asserted: { A1: 'pass', A2: 'pass' } }
  expect(regressions(approved, E_CHECKS, {})).toEqual([{ kind: 'page', code: 'CR1', id: 'A1', name: SHOP.name, was: 'pass', now: 'fail' }])
  expect(renderComment(approved, E_CHECKS, {}, null, null)).toContain('- CR1 A1 Shop posts are their own group: approved pass, new fail')
})

test('a baseline keeps assertion results, and a compare matches them by id when a case gains one', () => {
  const kept = forBaseline(caseRun()).questions[0]
  expect(kept.new!.asserted).toEqual({ A1: 'fail', A2: 'pass' })
  expect(kept.assertions).toEqual([SHOP, MENTIONS])
  // Results stored before assertions read as having none, so no caller handles a missing field.
  const old: any = run()
  delete old.questions[0].assertions
  delete old.questions[0].new.asserted
  expect(normalizeRun(old).questions[0].assertions).toEqual([])
  expect(normalizeRun(old).questions[0].new!.asserted).toEqual({})
  expect(regressions(normalizeRun(old), E_CHECKS, {}).map(r => r.id)).toEqual(['R3'])
  const before = caseRun([MENTIONS], { A2: 'pass' })
  const after = caseRun([SHOP, MENTIONS], { A1: 'fail', A2: 'pass' })
  const diff = compareRuns(before, after, E_CHECKS)
  expect(diff).toContain('| A1 | – → fail | – |')
  expect(diff).not.toContain('| A2 |')
  expect(diff).toContain('1 check result changed.')
})

test('the fixture pages must split every assertion: fail on the wrong reading, pass on the corrected one', () => {
  expect(fixtureProblems([SHOP, MENTIONS], { A1: 'fail', A2: 'fail' }, { A1: 'pass', A2: 'pass' })).toEqual([])
  expect(fixtureProblems([SHOP, MENTIONS], { A1: 'pass', A2: 'fail' }, { A1: 'pass' })).toEqual([
    'A1: the page with the wrong reading got pass, not fail',
    'A2: the corrected page got not run, not pass',
  ])
})

test('a case with a landed assertion stops the run when its brand is lost, and its input file names are made safe', () => {
  const questions = [{ code: 'CR1', assertions: [{ landed: true }] }, { code: 'AR1', assertions: [{ landed: false }] }, { code: 'I4', assertions: [] }]
  const gates = (code: string) => questions.some(question => question.code === code && hasLandedAssertion(question))
  expect(configuredQuestions(questions, { questions: {} }, false, gates)).toEqual({ run: [], skipped: ['AR1', 'I4'], missing: ['CR1'] })
  expect(safeFileName('affiliate sales (Oct).csv')).toBe('affiliate_sales__Oct_.csv')
  expect(safeFileName('../../.env')).toBe('__.._.env')
  expect(safeFileName('..')).toBe('_')
})

test('a question\'s input files are checked before any question runs: a missing one, and two that would share a name', () => {
  const exists = (path: string) => path === 'exports/sales.csv'
  expect(planInputFiles('AR1', [{ name: 'sales export.csv', path: 'exports/sales.csv' }, { name: 'notes.txt', text: 'a' }], exists))
    .toEqual({ names: ['sales_export.csv', 'notes.txt'], problems: [] })
  expect(planInputFiles('AR1', [{ name: 'sales.csv', path: 'laptop/only.csv' }], exists).problems).toEqual(['AR1: the file sales.csv has no text and no path to a file that exists'])
  expect(planInputFiles('AR1', [{ name: 'sales.csv', path: 'exports/sales.csv', text: null as any }], exists).problems).toEqual([])
  expect(planInputFiles('AR1', [{ name: 'sales export.csv', text: 'a' }, { name: 'sales_export.csv', text: 'b' }], exists).problems)
    .toEqual(['AR1: the files sales export.csv and sales_export.csv would both be saved as sales_export.csv'])
  // Most developers' disks ignore case, so two names that differ only in case are one file there.
  expect(planInputFiles('AR1', [{ name: 'Sales.csv', text: 'a' }, { name: 'sales.csv', text: 'b' }], exists).problems)
    .toEqual(['AR1: the files Sales.csv and sales.csv would both be saved as sales.csv'])
  // An empty name would be written to the run's folder itself.
  expect(planInputFiles('AR1', [{ name: '', text: 'a' }], exists).problems).toEqual(['AR1: a file has no name'])
})

test('the fixture check runs for a change to a file questions.json lists, and each listed path exists', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'questions.json'), 'utf8'))
  const needed = (changed: string[]) => fixturesForChanges(changed, config.fixturePaths)
  expect(needed(['scripts/eval/questions.json'])).toBe(true)
  expect(needed(['scripts/fixtures/eval-cases/ar1-wrong.html'])).toBe(true)
  expect(needed(['scripts/eval/lib.ts'])).toBe(true)
  expect(needed(['plugins/aspire/agents/atlas-market-signal.md', 'README.md'])).toBe(false)
  for (const path of config.fixturePaths) expect(existsSync(join(ROOT, path))).toBe(true)
  // The list is complete for the harness itself: where the command is defined, the workflow step that runs it,
  // and every local file run.ts loads, directly or through lib.ts.
  expect(needed(['package.json'])).toBe(true)
  expect(needed(['.github/workflows/validate.yml'])).toBe(true)
  for (const file of ['run.ts', 'lib.ts']) {
    const source = readFileSync(join(import.meta.dir, file), 'utf8')
    for (const match of source.matchAll(/from '(\.{1,2}\/[^']+)'/g)) {
      expect(needed([join('scripts/eval', `${match[1]}.ts`)])).toBe(true)
    }
  }
  // Every case's fixture pages sit under a listed path, so a new case's pages cannot go unjudged.
  for (const question of config.questions) for (const role of ['wrong', 'corrected']) if (question.fixtures) expect(needed([question.fixtures[role]])).toBe(true)
})
