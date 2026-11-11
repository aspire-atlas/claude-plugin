// Pure helpers for the page eval harness (scripts/eval/README.md). No process, network or file calls here,
// so `bun test scripts/eval` covers them without running Claude.

export type Result = 'pass' | 'fail' | 'n/a' | 'not run'

export type Event = Record<string, any>

export type ToolUse = { id: string; name: string; input: Record<string, any>; main: boolean }

export type Turn = {
  sessionId: string | null
  scratchpad: string | null
  model: string | null
  /** Connector name to its state at the start of the turn (connected, needs-auth, failed). */
  connectors: Record<string, string>
  /** Text the main thread wrote, plus what its subagents returned to it. */
  text: string
  /** The final reply of the turn, as `claude -p` reports it. */
  reply: string
  toolUses: ToolUse[]
  /** tool_use id to the text of its result and whether it failed. */
  toolResults: Record<string, { text: string; error: boolean }>
  /** Size of the main thread's context at its last message: what the next message would carry. */
  contextTokens: number
  /** Every token billed in the turn, subagents included. */
  billedTokens: number
  costUsd: number
  compactions: number
  failed: boolean
}

export type PageChecks = {
  /** R1, R2, R6, R11 and R13 from the page-check script: pass, fail, n/a or unmarked. */
  scripted: Record<string, string>
  /** R rows from the quality review's grade mode. */
  graded: Record<string, Result>
  /** E rows from the judge. */
  e: Record<string, Result>
  reasons: Record<string, string>
  notes: string[]
}

export type QuestionResult = {
  code: string
  example: string
  setsBarFor: number[]
  barChecks: string[]
  page: { link: string | null; captured: boolean }
  rounds: number
  transcriptTokens: number
  billedTokens: number
  compactions: number
  costUsd: number
  new: PageChecks | null
  approved: PageChecks | null
  problems: string[]
}

export type RunResults = {
  harness: number
  date: string
  commit: string
  model: string
  judgeModel: string
  eChecksVersion: string
  questions: QuestionResult[]
}

export const HARNESS_VERSION = 1

// Atlas tools a rerun may call. Everything else on the Atlas connector is refused, so a rerun reads the test
// organization and never changes it. lookup_* may refresh what Atlas holds, which the page standard asks for;
// mint_run_id and report_checkpoint change no Atlas record. lib.test.ts fails when the contract gains a tool
// that is in neither list.
export const ATLAS_READS = [
  'calculate_creator_fee', 'get_brand_context', 'get_brand_instruction', 'get_brand_theme', 'get_cas_briefs',
  'get_cas_campaign', 'get_cas_rates', 'get_cas_results', 'get_cas_selection', 'get_cas_setup_form', 'get_creator',
  'get_dashboard', 'get_fee_rate_card', 'get_job_status', 'get_more_tools', 'get_onboarding_form',
  'get_onboarding_report', 'get_profile', 'get_shop_analytics', 'get_status', 'list_ad_accounts',
  'list_ad_search_fields', 'list_available_hashtags', 'list_channels', 'list_creator_marketplace_labels',
  'list_creator_search_fields', 'list_hashtag_posts', 'list_hashtags', 'list_insight_search_fields',
  'list_my_organizations', 'list_my_profiles', 'list_post_search_fields', 'lookup_creators', 'lookup_posts',
  'mint_run_id', 'report_checkpoint', 'search_ads', 'search_calibrations', 'search_creator_marketplace',
  'search_creators', 'search_insights', 'search_partnership_content', 'search_posts', 'show_ads',
  'show_partnership_content',
]
export const ATLAS_WRITES = [
  'add_hashtags', 'append_calibration', 'append_insights', 'connect_channel', 'create_profile', 'delete_profile',
  'remove_hashtags', 'retract_calibration', 'set_brand_instruction', 'start_business_discovery',
  'supersede_calibration', 'switch_billing_account', 'unlink_channel', 'update_profile',
]

export function parseStream(text: string): Event[] {
  const events: Event[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('{')) continue
    try {
      events.push(JSON.parse(trimmed))
    } catch {
      // A cut-off last line: the run was stopped. What came before still counts.
    }
  }
  return events
}

function contentText(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map(block => (block && block.type === 'text' ? String(block.text ?? '') : '')).join('\n')
}

function usageTotal(usage: Record<string, any> | undefined): number {
  if (!usage) return 0
  return (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) +
    (usage.cache_read_input_tokens ?? 0) + (usage.output_tokens ?? 0)
}

export function summarizeTurn(events: Event[]): Turn {
  const turn: Turn = {
    sessionId: null, scratchpad: null, model: null, connectors: {}, text: '', reply: '', toolUses: [], toolResults: {},
    contextTokens: 0, billedTokens: 0, costUsd: 0, compactions: 0, failed: true,
  }
  const parts: string[] = []
  for (const event of events) {
    const main = !event.parent_tool_use_id
    if (event.type === 'system' && event.subtype === 'init') {
      turn.sessionId = event.session_id ?? turn.sessionId
      turn.scratchpad = event.scratchpad_path ?? null
      turn.model = event.model ?? null
      for (const server of event.mcp_servers ?? []) turn.connectors[server.name] = server.status
    } else if (event.type === 'system' && event.subtype === 'compact_boundary') {
      turn.compactions += 1
    } else if (event.type === 'assistant') {
      for (const block of event.message?.content ?? []) {
        if (block.type === 'text' && main) parts.push(block.text)
        if (block.type === 'tool_use') turn.toolUses.push({ id: block.id, name: block.name, input: block.input ?? {}, main })
      }
      if (main) turn.contextTokens = usageTotal(event.message?.usage) || turn.contextTokens
    } else if (event.type === 'user') {
      for (const block of Array.isArray(event.message?.content) ? event.message.content : []) {
        if (block.type !== 'tool_result') continue
        const text = contentText(block.content)
        turn.toolResults[block.tool_use_id] = { text, error: block.is_error === true }
        if (main) parts.push(text)
      }
    } else if (event.type === 'result') {
      turn.sessionId = event.session_id ?? turn.sessionId
      turn.reply = typeof event.result === 'string' ? event.result : ''
      turn.billedTokens = usageTotal(event.usage)
      turn.costUsd = event.total_cost_usd ?? 0
      turn.failed = event.is_error === true
    }
  }
  turn.text = parts.join('\n')
  return turn
}

const ARTIFACT_LINK = /https:\/\/claude\.ai\/(?:code\/)?artifact\/[A-Za-z0-9-]+/

/** The page a turn published: its link and the HTML file it was published from. */
export function findPage(turn: Turn): { link: string | null; file: string | null; finished: boolean } {
  let link: string | null = null
  let file: string | null = null
  let written: string | null = null
  for (const use of turn.toolUses) {
    const result = turn.toolResults[use.id]
    if (result?.error) continue
    const path = typeof use.input.file_path === 'string' ? use.input.file_path : null
    if (use.name === 'Write' && path && /\.html?$/i.test(path)) written = path
    if (use.name === 'Artifact' && (use.input.action ?? 'publish') === 'publish' && path && !use.input.asset) {
      file = path
      link = result?.text.match(ARTIFACT_LINK)?.[0] ?? link
    }
  }
  // An agent's result packet names the page it published, when the publish call itself was not in the stream.
  // A result packet also means an agent finished its run, page or no page: there is nothing left to confirm.
  const packets = fencedBlocks(turn.text, 'result-packet')
  // On a host that cannot publish, the packet's page is the path of the file the page was saved to.
  let saved: string | null = null
  for (const packet of packets) {
    const value = parseJsonLoose(packet)?.page
    const page = Array.isArray(value) ? value[0] : value
    if (typeof page !== 'string' || page.length === 0) continue
    if (/^https?:\/\//.test(page)) link = link ?? page
    else saved = saved ?? page
  }
  return { link, file: file ?? saved ?? written, finished: packets.length > 0 }
}

export function fencedBlocks(text: string, label: string): string[] {
  const blocks: string[] = []
  const pattern = new RegExp('```' + label + '[^\\n]*\\n([\\s\\S]*?)```', 'g')
  for (const match of text.matchAll(pattern)) blocks.push(match[1])
  return blocks
}

function parseJsonLoose(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** The first JSON object in `text` that has `key` at its top level. Reads past prose and code fences. */
export function findJsonWithKey(text: string, key: string): any {
  for (let start = text.indexOf('{'); start !== -1; start = text.indexOf('{', start + 1)) {
    let depth = 0
    let inString = false
    for (let i = start; i < text.length; i++) {
      const ch = text[i]
      if (inString) {
        if (ch === '\\') i++
        else if (ch === '"') inString = false
      } else if (ch === '"') inString = true
      else if (ch === '{') depth++
      else if (ch === '}' && --depth === 0) {
        const value = parseJsonLoose(text.slice(start, i + 1))
        if (value && typeof value === 'object' && key in value) return value
        break
      }
    }
  }
  return null
}

/** The page-check script, cut from the page-standard skill the way the skill tells agents to cut it. */
export function extractPageCheckScript(skillMarkdown: string): string {
  const lines = skillMarkdown.split('\n')
  const from = lines.indexOf('<!-- page-check -->')
  const to = lines.indexOf('<!-- /page-check -->')
  if (from === -1 || to === -1 || to - from < 4) throw new Error('page-standard/page-check.md has no page-check script')
  return lines.slice(from + 2, to - 1).join('\n') + '\n'
}

export function parsePageCheck(stdout: string): { results: Record<string, string>; problems: Record<string, string> } {
  const results: Record<string, string> = {}
  const problems: Record<string, string> = {}
  for (const event of parseStream(stdout)) {
    if (typeof event.check !== 'string' || typeof event.result !== 'string') continue
    results[event.check] = event.result
    if (Array.isArray(event.problems) && event.problems.length) problems[event.check] = event.problems.join('; ')
  }
  return { results, problems }
}

/** Embedded images are most of a page's bytes and none of what the checks read. */
export function stripDataUris(html: string): string {
  return html.replace(/data:[a-z0-9.+-]+\/[a-z0-9.+-]+(?:;[a-z0-9=-]+)*,[A-Za-z0-9+/=%_.~-]*/gi, 'data:,')
}

export function visibleTextLength(html: string): number {
  return html
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}

export function normalizeResult(value: unknown): Result {
  const text = String(value ?? '').trim().toLowerCase()
  if (text === 'pass' || text === 'fixed') return 'pass'
  if (text === 'fail') return 'fail'
  if (text === 'n/a' || text === 'na') return 'n/a'
  return 'not run'
}

/** One R row: the script and the grade must both pass. A script result of `unmarked` leaves it to the grade. */
export function rResult(checks: PageChecks | null, id: string): Result {
  if (!checks) return 'not run'
  const scripted = checks.scripted[id]
  const graded = checks.graded[id]
  if (scripted === 'fail' || graded === 'fail') return 'fail'
  if (graded) return graded
  if (scripted === 'pass') return 'pass'
  if (scripted === 'n/a') return 'n/a'
  return 'not run'
}

export function eResult(checks: PageChecks | null, id: string): Result {
  return checks?.e[id] ?? 'not run'
}

const R_FLOOR = 13

/** R ids to show: R1 to R13 always, and any later ones a grade or the page check returned (the reader standard grows). */
export function rIds(results: QuestionResult[]): string[] {
  let top = R_FLOOR
  for (const question of results) {
    for (const checks of [question.new, question.approved]) {
      for (const id of [...Object.keys(checks?.graded ?? {}), ...Object.keys(checks?.scripted ?? {})]) {
        const n = Number(id.slice(1))
        if (/^R\d+$/.test(id) && n > top) top = n
      }
    }
  }
  return Array.from({ length: top }, (_, i) => `R${i + 1}`)
}

export type CheckDef = { id: string; name: string; judgedBy?: string; waitsFor?: string }

const cell = (result: Result) => (result === 'not run' ? '–' : result)

export function rows(question: QuestionResult, eChecks: CheckDef[], rList: string[]): { id: string; new: Result; approved: Result; bar: boolean }[] {
  const bar = new Set(question.barChecks)
  return [
    ...eChecks.map(check => ({ id: check.id, new: eResult(question.new, check.id), approved: eResult(question.approved, check.id), bar: bar.has(check.id) })),
    ...rList.map(id => ({ id, new: rResult(question.new, id), approved: rResult(question.approved, id), bar: bar.has(id) })),
  ]
}

/** One question's table, as markdown that reads in a terminal and pastes into a pull request. */
export function renderQuestion(question: QuestionResult, eChecks: CheckDef[], rList: string[], names: Record<string, string>): string {
  const lines: string[] = []
  lines.push(`### ${question.code} · ${question.example}`)
  lines.push('')
  lines.push('| Check | New page | Approved page | Sets the bar |')
  lines.push('| ----- | -------- | ------------- | ------------ |')
  for (const row of rows(question, eChecks, rList)) {
    const name = names[row.id] ? ` ${names[row.id]}` : ''
    lines.push(`| ${row.id}${name} | ${cell(row.new)} | ${cell(row.approved)} | ${row.bar ? 'yes' : ''} |`)
  }
  lines.push('')
  const compactions = question.compactions ? `, compacted ${question.compactions} time${question.compactions === 1 ? '' : 's'}` : ''
  lines.push(`Transcript: ${question.transcriptTokens.toLocaleString('en-US')} tokens${compactions} · ` +
    `Confirmation rounds: ${question.rounds} · New page: ${question.page.link ?? (question.page.captured ? 'captured, no link' : 'none published')}`)
  const notes = [...question.problems, ...(question.new?.notes ?? []).map(n => `New page: ${n}`), ...(question.approved?.notes ?? []).map(n => `Approved page: ${n}`)]
  for (const note of notes) lines.push(`- ${note}`)
  const waiting = eChecks.filter(check => check.waitsFor && eResult(question.new, check.id) === 'not run')
  if (waiting.length) lines.push(`- Not run yet: ${waiting.map(check => `${check.id} (${check.waitsFor})`).join(', ')}.`)
  return lines.join('\n')
}

export function renderRun(results: RunResults, eChecks: CheckDef[], names: Record<string, string>): string {
  const rList = rIds(results.questions)
  const head = `## Page eval · ${results.date} · plugin ${results.commit.slice(0, 7)} · ${results.model}` +
    (results.judgeModel === results.model ? '' : ` (judged by ${results.judgeModel})`)
  return [head, ...results.questions.map(question => renderQuestion(question, eChecks, rList, names))].join('\n\n') + '\n'
}

/** What a stored baseline keeps: results and sizes. No page, link, brand, or quoted text. */
export function forBaseline(results: RunResults): RunResults {
  const strip = (checks: PageChecks | null): PageChecks | null =>
    checks && { scripted: checks.scripted, graded: checks.graded, e: checks.e, reasons: {}, notes: [] }
  return {
    ...results,
    questions: results.questions.map(question => ({
      ...question,
      page: { link: null, captured: question.page.captured },
      new: strip(question.new),
      approved: strip(question.approved),
      problems: [],
    })),
  }
}

/** What changed between two runs, question by question. A changed approved-page result is a drifted check. */
export function compareRuns(before: RunResults, after: RunResults, eChecks: CheckDef[]): string {
  const lines: string[] = [`## Page eval compare · ${before.date} (${before.commit.slice(0, 7)}) → ${after.date} (${after.commit.slice(0, 7)})`]
  const rList = rIds([...before.questions, ...after.questions])
  let changes = 0
  for (const next of after.questions) {
    const prev = before.questions.find(question => question.code === next.code)
    lines.push('', `### ${next.code} · ${next.example}`, '')
    if (!prev) {
      lines.push('Not in the first run.')
      continue
    }
    const prevRows = rows(prev, eChecks, rList)
    const changed = rows(next, eChecks, rList)
      .map((row, i) => ({ row, was: prevRows[i] }))
      .filter(({ row, was }) => row.new !== was.new || row.approved !== was.approved)
    if (changed.length) {
      lines.push('| Check | New page | Approved page |', '| ----- | -------- | ------------- |')
      for (const { row, was } of changed) {
        const side = (a: Result, b: Result) => (a === b ? cell(b) : `${cell(a)} → ${cell(b)}`)
        lines.push(`| ${row.id} | ${side(was.new, row.new)} | ${side(was.approved, row.approved)}${was.approved !== row.approved ? ' (drift)' : ''} |`)
      }
      lines.push('')
      changes += changed.length
    } else {
      lines.push('No check changed.', '')
    }
    const delta = (a: number, b: number) => `${a.toLocaleString('en-US')} → ${b.toLocaleString('en-US')}`
    lines.push(`Transcript tokens: ${delta(prev.transcriptTokens, next.transcriptTokens)} · Confirmation rounds: ${delta(prev.rounds, next.rounds)}`)
  }
  for (const prev of before.questions) {
    if (!after.questions.some(question => question.code === prev.code)) lines.push('', `### ${prev.code} · ${prev.example}`, '', 'Not in the second run.')
  }
  lines.push('', `${changes} check result${changes === 1 ? '' : 's'} changed.`)
  return lines.join('\n') + '\n'
}

/** The checks a question sets the bar for, from the doc's change numbers. */
export function barChecks(setsBarFor: number[], changes: Record<string, { checks: string[] }>): string[] {
  const ids = new Set<string>()
  for (const change of setsBarFor) for (const id of changes[String(change)]?.checks ?? []) ids.add(id)
  return [...ids]
}

/** The prefix Claude Code gives a connector's tools: its name with anything but letters, digits, _ and - as _. */
export function toolPrefix(connector: string): string {
  return `mcp__${connector.replace(/[^A-Za-z0-9_-]/g, '_')}__`
}

/** Connector names from the output of `claude mcp list`. A name may itself hold colons (plugin:aspire:Name). */
export function parseConnectorList(output: string): string[] {
  const names: string[] = []
  for (const line of output.split('\n')) {
    const match = line.match(/^(\S.*?): \S+.* - /)
    if (match) names.push(match[1])
  }
  return names
}

export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key) => values[key] ?? whole)
}

// ---------------------------------------------------------------- CI: which questions a change reruns, and the PR comment

/** The paths CI watches: the agents, the flow files, the router, and the page standard every page is built by. */
export const EVAL_PATHS = [
  'plugins/aspire/agents/', 'plugins/aspire/skills/aspire/references/', 'plugins/aspire/skills/aspire/SKILL.md',
  'plugins/aspire/skills/page-standard/',
]

/** A `sharedPaths` entry ending in "/" covers every file under it. */
const coveredBy = (path: string, entry: string) => (entry.endsWith('/') ? path.startsWith(entry) : path === entry)

export type QuestionPaths = { code: string; paths?: string[] }

/**
 * The question codes a set of changed files reruns: a question whose own `paths` holds a changed file, or every
 * question when a changed file is one of `sharedPaths` (a file every flow reads). Order follows questions.json.
 */
export function codesForChanges(changed: string[], questions: QuestionPaths[], sharedPaths: string[]): { watched: string[]; codes: string[] } {
  const watched = changed.filter(path => EVAL_PATHS.some(prefix => path.startsWith(prefix)))
  if (watched.some(path => sharedPaths.some(entry => coveredBy(path, entry)))) return { watched, codes: questions.map(question => question.code) }
  const codes = questions.filter(question => (question.paths ?? []).some(path => watched.includes(path))).map(question => question.code)
  return { watched, codes }
}

export type Regression = { code: string; id: string; was: Result; now: Result | 'no page' }

/**
 * A regression is a check the approved page passes that the new page fails. A question that published no page
 * regresses on every check its approved page passes. A check the new page did not run, or one with no approved
 * result, is never a regression: the job fails on what it saw fail, and only that.
 */
export function regressions(results: RunResults, eChecks: CheckDef[]): Regression[] {
  const rList = rIds(results.questions)
  const found: Regression[] = []
  for (const question of results.questions) {
    for (const row of rows(question, eChecks, rList)) {
      if (row.approved !== 'pass') continue
      if (!question.new) found.push({ code: question.code, id: row.id, was: row.approved, now: 'no page' })
      else if (row.new === 'fail') found.push({ code: question.code, id: row.id, was: row.approved, now: row.new })
    }
  }
  return found
}

/** Marks the one eval comment on a pull request, so later pushes edit it instead of adding another. */
export const COMMENT_MARKER = '<!-- eval:pages -->'

// GitHub refuses a comment body over 65,536 characters.
const COMMENT_LIMIT = 60_000

export function renderComment(results: RunResults, eChecks: CheckDef[], names: Record<string, string>, approvedSource: string | null, runUrl: string | null): string {
  const found = regressions(results, eChecks)
  const missingApproved = results.questions.filter(question => !question.approved).map(question => question.code)
  const lines = [COMMENT_MARKER, `## Page eval · ${results.questions.map(question => question.code).join(', ')}`, '']
  if (found.length) {
    lines.push(`**${found.length} regression${found.length === 1 ? '' : 's'}**: checks the approved page passes that the new page does not.`, '')
    for (const r of found) lines.push(`- ${r.code} ${r.id}${names[r.id] ? ` ${names[r.id]}` : ''}: approved ${r.was}, new ${r.now}`)
  } else {
    lines.push('**No regressions**: every check the approved page passes, the new page passes or did not run.')
  }
  lines.push('')
  if (approvedSource) lines.push(`Approved page results: ${approvedSource}.`)
  if (missingApproved.length) lines.push(`No approved results for ${missingApproved.join(', ')}, so nothing there can count as a regression. Store a baseline (scripts/eval/README.md).`)
  if (runUrl) lines.push(`Run: ${runUrl}`)
  lines.push('', 'How to read this: docs/STANDARD.md, "The eval on a pull request". `–` means the check did not run.')
  const head = lines.join('\n')
  const body = renderRun(results, eChecks, names)
  const full = `${head}\n\n${body}`
  return full.length <= COMMENT_LIMIT ? full : `${full.slice(0, COMMENT_LIMIT)}\n\n…cut to fit a comment. The full table is in the run's log.\n`
}

export function renderSkipped(reason: string): string {
  return `${COMMENT_MARKER}\n## Page eval\n\nskipped: ${reason}\n`
}

/** The comment when the run stopped before any question finished, so nothing was checked. */
export function renderStopped(runUrl: string | null): string {
  return `${COMMENT_MARKER}\n## Page eval\n\n**The run stopped before any question finished**, so nothing was checked. ` +
    `The job fails until a run completes.${runUrl ? ` Run: ${runUrl}` : ''}\n`
}

/** Check names: the E names from e-checks.json, and the R names from the reader standard's own table. */
export function checkNames(eChecks: { id: string; name: string }[], readerStandard: string): Record<string, string> {
  const names: Record<string, string> = Object.fromEntries(eChecks.map(check => [check.id, check.name]))
  for (const match of readerStandard.matchAll(/^\| (R\d+) \| ([^|]+) \|/gm)) names[match[1]] = match[2].trim()
  return names
}

/** Remove a test title prefix ("CI eval · ") from a page, so graders see the title the flow would have written. */
export function stripTitlePrefix(html: string, prefix: string | null): string {
  if (!prefix) return html
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.replace(new RegExp(`${escaped}\\s*[·:|-]?\\s*`, 'g'), '')
}

/** The nightly run's Slack message: one line per question, regressions named. Plain text, no page links. */
export function renderSlack(results: RunResults, eChecks: CheckDef[], runUrl: string | null): string {
  const found = regressions(results, eChecks)
  const rList = rIds(results.questions)
  const lines = [`Atlas page eval, nightly on develop (${results.commit.slice(0, 7)}): ${found.length ? `${found.length} regression${found.length === 1 ? '' : 's'}` : 'no regressions'}`]
  for (const question of results.questions) {
    const all = rows(question, eChecks, rList)
    const passed = all.filter(row => row.new === 'pass').length
    const ran = all.filter(row => row.new !== 'not run').length
    const mine = found.filter(r => r.code === question.code).map(r => r.id)
    const state = question.new ? `${passed}/${ran} checks pass` : 'no page'
    lines.push(`• ${question.code} ${question.example}: ${state}${mine.length ? `; regressed ${mine.join(', ')}` : ''}`)
  }
  if (runUrl) lines.push(runUrl)
  return lines.join('\n')
}
