// Pure helpers for the page eval harness (scripts/eval/README.md). No process, network or file calls here,
// so `bun test scripts/eval` covers them without running Claude.

import { APPROVALS_CHECK, approvalsLine, noApprovals, type ApprovalChecks } from './approvals'

export type Result = 'pass' | 'fail' | 'n/a' | 'not run'

export type Event = Record<string, any>

export type ToolUse = { id: string; name: string; input: Record<string, any>; main: boolean }

/** How the harness chose an answer: from the answer list, the (Recommended) option, or the first option. */
export type AnswerSource = 'list' | 'recommended' | 'first'

export type Asked = {
  header: string
  question: string
  multiSelect: boolean
  options: { label: string; description: string }[]
  /** Null when the harness did not answer: the run had already finished, or the tool was not answered at all. */
  answer: string | null
  by: AnswerSource | null
}

/** One AskUserQuestion call, as the person met it. */
export type Ask = {
  id: string
  main: boolean
  /** What its thread (the main thread, or the subagent that asked) wrote in this turn before the call, since that thread's call before it. */
  before: string
  /** The end of `before`: the message the picker sits in, written after that thread's last tool result. */
  message: string
  questions: Asked[]
  /** Why the harness left the call unanswered and ended the turn, when it did. */
  declined: Declined | null
}

/** `finished`: the run had its page, so the picker was the flow's offer of more work. `limit`: the harness had answered `--max-asks` pickers. */
export type Declined = 'finished' | 'limit'

export type Turn = {
  sessionId: string | null
  scratchpad: string | null
  model: string | null
  /** Connector name to its state at the start of the turn (connected, needs-auth, failed). */
  connectors: Record<string, string>
  /** Text the main thread wrote, plus what its subagents returned to it. */
  text: string
  /** Only what the main thread wrote itself: no tool result, so no file it read and no agent's output. */
  said: string
  /** The final reply of the turn, as `claude -p` reports it. */
  reply: string
  toolUses: ToolUse[]
  /** Every AskUserQuestion call of the turn, in order, with the answer the harness gave. */
  asks: Ask[]
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
  /** R1, R2, R5 (its cost lines), R6, R7 (its links), R11, R13, R14 and R15 from the page-check script: pass, fail, n/a or unmarked. */
  scripted: Record<string, string>
  /** R rows from the quality review's grade mode. */
  graded: Record<string, Result>
  /** E rows from the judge. */
  e: Record<string, Result>
  /** The question's own assertions, by id. Empty for a question that has none (normalizeRun fills it in older results). */
  asserted: Record<string, Result>
  reasons: Record<string, string>
  notes: string[]
}

export type ChatMessage = 'setup' | 'storyline' | 'closeOut' | 'stoppedOn'

export type ChatCount = { arrows: number; vs: number; codes: number }

/** The countable English rules, counted in the chat messages a run sends (docs/STANDARD.md, C5). */
export type ChatChecks = {
  /** `fail` when any message breaks a countable rule, `not run` when the transcript held none of them. */
  result: Result
  /** One entry per kind of message the run sent. Every storyline check-in adds to the one storyline count. */
  messages: Partial<Record<ChatMessage, ChatCount>>
}

/**
 * One assertion of a client case (questions.json). `ticket` is the work that makes it pass. `landed` is false
 * until that ticket merges: until then a failure is expected and blocks nothing, and from then on a failure
 * is a regression. `examples` are the client examples the assertion covers, with brands as placeholders.
 */
export type Assertion = {
  id: string; name: string; fix: number; ticket: string; landed: boolean
  passesWhen: string; failsWhen: string; examples: string[]
  /** Added to `passesWhen` only when local.json's `values` fill every {placeholder} in it: an expected figure for a named competitor. */
  whenNamed?: string
}

/** What an assertion passes on, with `whenNamed` added when `values` name everything it asks about. */
export function passesWhen(assertion: Assertion, values: Record<string, string>): string {
  const named = assertion.whenNamed ? fill(assertion.whenNamed, values) : ''
  return fill(assertion.passesWhen, values) + (named && !/\{\w+\}/.test(named) ? ` ${named}` : '')
}

/** What a result keeps of an assertion: enough to draw its row and to tell an expected failure from a regression. */
export type AssertionRef = Pick<Assertion, 'id' | 'name' | 'ticket' | 'landed'>

export const assertionRefs = (assertions: Assertion[]): AssertionRef[] =>
  assertions.map(({ id, name, ticket, landed }) => ({ id, name, ticket, landed }))

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
  /** `not run` for a question graded from a file, and for results stored before the chat check (normalizeRun). */
  chat: ChatChecks
  /** `not run` for a question graded from a file, a run that asked no picker, and results stored before the check. */
  approvals: ApprovalChecks
  /** The second run of the same question, when the run was asked for the repeat pair (`--repeat`). */
  repeat?: RepeatChecks
  problems: string[]
  /** The assertions the question was graded on. Empty for a question that has none. */
  assertions: AssertionRef[]
}

/** The repeat pair (docs/STANDARD.md, S4): the same question asked again in the same session. */
export type RepeatChecks = {
  /** FU1, from the transcript: the second run's first message follows up on the first run and asks no setup question. */
  asks: Result
  /** FU2, from a judge that reads both pages: the second page's first section says what changed since the first. */
  leads: Result
  rounds: number
  /** What the second run cost, the close-out answer before it included. The question's own sizes describe the first run. */
  billedTokens: number
  costUsd: number
  compactions: number
  page: { link: string | null; captured: boolean }
}

export type RunResults = {
  harness: number
  date: string
  commit: string
  model: string
  judgeModel: string
  eChecksVersion: string
  questions: QuestionResult[]
  /** Questions chosen for the run that local.json names no brand for, so they were not run or graded. */
  skipped?: string[]
}

// 2: reruns go through the Agent SDK and answer pickers, and `rounds` counts answered pickers as well as text replies.
export const HARNESS_VERSION = 2

// Atlas tools a rerun may call. Everything else on the Atlas connector is refused, so a rerun reads the test
// organization and never changes it. lookup_* may refresh what Atlas holds, which the page standard asks for;
// mint_run_id and report_checkpoint change no Atlas record. lib.test.ts fails when the contract gains a tool
// that is in neither list.
export const ATLAS_READS = [
  'calculate_creator_fee', 'get_brand_context', 'get_brand_instruction', 'get_brand_theme', 'get_card_images', 'get_cas_briefs',
  'get_cas_campaign', 'get_cas_rates', 'get_cas_results', 'get_cas_selection', 'get_cas_setup_form', 'get_creator',
  'get_dashboard', 'get_fee_rate_card', 'get_job_status', 'get_more_tools', 'get_onboarding_form',
  'get_onboarding_report', 'get_profile', 'get_shop_analytics', 'get_status', 'list_ad_accounts',
  'list_ad_search_fields', 'list_applicants', 'list_available_hashtags', 'list_channels', 'list_creator_marketplace_labels',
  'list_creator_search_fields', 'list_hashtag_posts', 'list_hashtags', 'list_insight_search_fields',
  'list_my_organizations', 'list_my_profiles', 'list_post_search_fields', 'lookup_creators', 'lookup_posts',
  'mint_run_id', 'report_checkpoint', 'search_ads', 'search_calibrations', 'search_creator_marketplace',
  'search_creators', 'search_insights', 'search_partnership_content', 'search_posts', 'show_ads',
  'show_partnership_content',
]
export const ATLAS_WRITES = [
  'add_hashtags', 'append_calibration', 'append_insights', 'connect_channel', 'create_profile', 'delete_profile',
  'remove_hashtags', 'retract_calibration', 'send_feedback', 'set_brand_instruction',
  'start_business_discovery',
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

export const ASK_TOOL = 'AskUserQuestion'

/** The type of the line the harness adds to a turn's transcript for each picker it answers or declines. */
export const ANSWER_EVENT = 'eval_answer'

const str = (value: unknown) => (typeof value === 'string' ? value : '')

export function askedQuestions(input: Record<string, any> | undefined): Asked[] {
  return (Array.isArray(input?.questions) ? input.questions : []).map((question: any) => ({
    header: str(question?.header), question: str(question?.question), multiSelect: question?.multiSelect === true,
    options: (Array.isArray(question?.options) ? question.options : []).map((option: any) => ({ label: str(option?.label), description: str(option?.description) })),
    answer: null, by: null,
  }))
}

export function summarizeTurn(events: Event[]): Turn {
  const turn: Turn = {
    sessionId: null, scratchpad: null, model: null, connectors: {}, text: '', said: '', reply: '', toolUses: [], asks: [], toolResults: {},
    contextTokens: 0, billedTokens: 0, costUsd: 0, compactions: 0, failed: true,
  }
  const parts: string[] = []
  // Everything the main thread wrote in the turn.
  const mainSaid: string[] = []
  // Per thread ('' is the main thread, a subagent is its Task call's id): what it has written since its last
  // picker, the text above the next one, and the part of that written since its last tool result, which is the
  // message the next picker sits in.
  const said: Record<string, string[]> = {}
  const message: Record<string, string[]> = {}
  const answers: Event[] = []
  for (const event of events) {
    const main = !event.parent_tool_use_id
    const thread = String(event.parent_tool_use_id ?? '')
    if (event.type === 'system' && event.subtype === 'init') {
      turn.sessionId = event.session_id ?? turn.sessionId
      turn.scratchpad = event.scratchpad_path ?? null
      turn.model = event.model ?? null
      for (const server of event.mcp_servers ?? []) turn.connectors[server.name] = server.status
    } else if (event.type === 'system' && event.subtype === 'compact_boundary') {
      turn.compactions += 1
    } else if (event.type === 'assistant') {
      for (const block of event.message?.content ?? []) {
        if (block.type === 'text') {
          if (main) parts.push(block.text)
          if (main) mainSaid.push(block.text)
          ;(said[thread] ??= []).push(block.text)
          ;(message[thread] ??= []).push(block.text)
        }
        if (block.type === 'tool_use') turn.toolUses.push({ id: block.id, name: block.name, input: block.input ?? {}, main })
        if (block.type === 'tool_use' && block.name === ASK_TOOL) {
          turn.asks.push({
            id: block.id, main, before: (said[thread] ?? []).join('\n').trim(), message: (message[thread] ?? []).join('\n').trim(),
            questions: askedQuestions(block.input), declined: null,
          })
          said[thread] = []
          message[thread] = []
        }
      }
      if (main) turn.contextTokens = usageTotal(event.message?.usage) || turn.contextTokens
    } else if (event.type === 'user') {
      for (const block of Array.isArray(event.message?.content) ? event.message.content : []) {
        if (block.type !== 'tool_result') continue
        const text = contentText(block.content)
        turn.toolResults[block.tool_use_id] = { text, error: block.is_error === true }
        if (main) parts.push(text)
        message[thread] = []
      }
    } else if (event.type === ANSWER_EVENT) {
      answers.push(event)
    } else if (event.type === 'result') {
      turn.sessionId = event.session_id ?? turn.sessionId
      turn.reply = typeof event.result === 'string' ? event.result : ''
      turn.billedTokens = usageTotal(event.usage)
      turn.costUsd = event.total_cost_usd ?? 0
      turn.failed = event.is_error === true
    }
  }
  // The harness's own lines, written beside the stream when it answers a picker (session.ts). They are read
  // last: the handler can write one before the stream's own line for the picker it answers.
  for (const event of answers) {
    const ask = turn.asks.find(candidate => candidate.id === event.tool_use_id)
    if (!ask) continue
    ask.declined = event.declined === 'finished' || event.declined === 'limit' ? event.declined : null
    for (const question of ask.questions) {
      const given = event.answers?.[question.question]
      if (typeof given?.answer !== 'string') continue
      question.answer = given.answer
      question.by = given.by ?? null
    }
  }
  turn.text = parts.join('\n')
  turn.said = mainSaid.join('\n')
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
  // A storyline draft returns a packet marked `pass: "draft"` and no published page: the run waits on the person's answer
  // until a later packet builds or publishes. A feeder agent's packet in the same turn does not end that wait.
  let awaitingStoryline = false
  for (const packet of packets) {
    const parsed = parseJsonLoose(packet)
    const pass = parsed?.storyline?.pass
    if (pass === 'draft') {
      // A draft pass may name its draft file as `page` (orchestration.md, section 6). That file is never the page.
      awaitingStoryline = true
      continue
    }
    if (pass === 'build' || pass === 'state') awaitingStoryline = false
    const value = parsed?.page
    const page = Array.isArray(value) ? value[0] : value
    if (typeof page !== 'string' || page.length === 0) continue
    awaitingStoryline = false
    if (/^https?:\/\//.test(page)) link = link ?? page
    else saved = saved ?? page
  }
  return { link, file: file ?? saved ?? written, finished: packets.length > 0 && !awaitingStoryline }
}

/** Every word of a picker that the person reads: each question, its option labels and their descriptions. */
export function askText(questions: Asked[]): string {
  return questions.flatMap(question => [question.question, ...question.options.flatMap(option => [option.label, option.description])])
    .filter(part => part.trim()).join('\n')
}

const isStorylineAsk = (ask: Ask) => ask.questions.some(question => /storyline/i.test(question.header))

/**
 * The chat messages a run sends, as the person reads them: the setup reply, every storyline check-in (a
 * Change or Widen answer brings a redraft, and each one is read, with the message its picker sits in) and the
 * close-out. The setup reply is the text the main thread wrote above its first picker, and that picker. A question is read from the
 * AskUserQuestion call and, when the turn ended on it, from the turn's reply as well, since a host that
 * refuses the tool asks in text. The last turn's reply is the close-out only when the run `closed`: it
 * published a page or its agent finished. When the harness ended the run at the picker that follows the page,
 * the close-out is the message that picker sits in, and the picker itself is not read. Progress notes written
 * during the build, before the main thread's last tool result, are not part of the close-out. A run that stopped earlier
 * sent no close-out, and its last reply is the question it stopped on: part of the setup reply or of a
 * storyline check-in when it stopped there, and `stoppedOn` when it stopped on any later question, so no reply
 * the person read goes uncounted.
 */
export function chatMessages(turns: Turn[], closed: boolean): Partial<Record<ChatMessage, string>> {
  const found: Partial<Record<ChatMessage, string>> = {}
  if (!turns.length) return found
  // A storyline check-in is read with the message it sits in, where the draft is written above the picker.
  const asks = (turn: Turn, storyline: boolean) =>
    turn.asks.filter(ask => ask.main && !ask.declined && isStorylineAsk(ask) === storyline)
      .flatMap(ask => [...(storyline ? [ask.message] : []), askText(ask.questions)])
  const isStoryline = (turn: Turn) =>
    asks(turn, true).length > 0 || fencedBlocks(turn.text, 'result-packet').some(packet => parseJsonLoose(packet)?.storyline?.pass === 'draft')
  const last = turns.length - 1
  // A turn's reply is a question the person read, unless it is the close-out.
  const asked = (i: number) => (i < last || !closed ? [turns[i].reply] : [])
  // The setup reply is what the main thread wrote above its first picker, which is the text the approval check
  // reads too, and the pickers before the storyline check-in. A picker that comes after the check-in in the
  // same turn (a refresh offer during the build) is not part of it, and when the first picker is the storyline
  // check-in the run sent no setup reply.
  const first = turns[0].asks.filter(ask => ask.main && !ask.declined)
  const check = first.findIndex(isStorylineAsk)
  const before = check === -1 ? first : first.slice(0, check)
  const setup = [before[0]?.before, ...before.map(ask => askText(ask.questions)), ...(isStoryline(turns[0]) ? [] : asked(0))].filter(Boolean)
  if (setup.length) found.setup = setup.join('\n')
  const storyline = turns.flatMap((turn, i) => (isStoryline(turn) ? [...asks(turn, true), ...asked(i)] : [])).filter(Boolean)
  if (storyline.length) found.storyline = storyline.join('\n')
  const after = turns[last].asks.find(ask => ask.main && ask.declined)
  if (closed && after?.message) found.closeOut = after.message
  else if (closed && !turns[last].failed && turns[last].reply) found.closeOut = turns[last].reply
  if (!closed && last > 0 && !isStoryline(turns[last])) {
    const stoppedOn = [...asks(turns[last], false), turns[last].reply].filter(Boolean)
    if (stoppedOn.length) found.stoppedOn = stoppedOn.join('\n')
  }
  return found
}

/** What the count needs from outside this file: the ids that count as codes, and the names that hold one by chance. */
export type ChatRules = { codes: string[]; allow: string[] }

/**
 * The ids the count knows as codes, read from the files that own them: every id that opens a table row in
 * `sources`, and the ids given in `extra`. The caller passes only the two files whose ids are not ordinary
 * words in brand chat, the question-code map and the reader standard, with the E checks and the eval's own
 * question codes as `extra`. A new id added to one of those is counted from the next run on. Each flow's own
 * question ids (F1, M1, S3, X5, about eighty of them) are left out on purpose: they read as product names, and
 * a false count blocks a merge. The English read's and the UX review's finding ids are numbered per run, so
 * countChat knows them by their shape instead.
 */
export function chatCodes(sources: string[], extra: string[] = []): string[] {
  const ids = new Set(extra)
  for (const source of sources) {
    for (const match of source.matchAll(/^\| \*{0,2}([A-Z]{1,2}\d{1,2})\*{0,2} \|/gm)) ids.add(match[1])
  }
  return [...ids].sort()
}

const ARROWS = /[→⇒➜➔➡⟶⟹]|(?<![-<!])->|(?<![<=>!])=>/g
const VS = /\bvs\b\.?/gi
const CODE_SHAPE = /\b[A-Z]{1,2}\d{1,3}\b/g
// Names left out of every count, whatever the brand: "VS Code" is a product, not "versus".
const ALWAYS_ALLOWED = ['VS Code']
const FINDING_ID = /^(?:EN|UX)\d+$/

const CHAT_NAMES: Record<ChatMessage, string> = { setup: 'setup reply', storyline: 'storyline check-in', closeOut: 'close-out', stoppedOn: 'question the run stopped on' }

/**
 * Drops the words inside quotation marks from one line: they are someone else's and never fixed
 * (english-rules.md). Straight quotes are dropped in pairs only when the line's quotes balance. An odd count
 * is first read as an inch mark after a number (12"), and if it still does not balance nothing is dropped, so
 * a stray quote never hides the text after it from the count.
 */
function dropQuoted(line: string): string {
  const straight = (text: string) => (text.match(/"/g) ?? []).length
  let text = line
  if (straight(text) % 2) text = text.replace(/(?<=(?:^|[\s(])\d+(?:\.\d+)?)"/g, ' in')
  if (straight(text) % 2 === 0) text = text.replace(/"[^"]*"/g, ' ')
  return text.replace(/“[^”]*”/g, ' ')
}

/**
 * Counts the countable English rules in one message. Left out of the count, because the rules leave them as
 * written or they hold "->" or a code by chance: backticked spans, links, file paths (a run's own folder is
 * named for its question code), handles and hashtags, quoted words, and the names in `rules.allow` (a product
 * such as "Canon R5").
 */
export function countChat(text: string, rules: ChatRules): { count: ChatCount; hits: string[] } {
  let clean = text
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\S*\/\S*\/\S*/g, ' ')
    .replace(/(^|[^\w])[@#][\w.]+/g, '$1 ')
  // An empty name would split the text into single letters and hide every count.
  for (const name of [...ALWAYS_ALLOWED, ...rules.allow]) if (name.trim()) clean = clean.split(name).join(' ')
  clean = clean.split('\n').map(dropQuoted).join('\n')
  const codes = new Set(rules.codes)
  const count: ChatCount = { arrows: 0, vs: 0, codes: 0 }
  const hits: string[] = []
  const patterns: [keyof ChatCount, RegExp][] = [['arrows', ARROWS], ['vs', VS], ['codes', CODE_SHAPE]]
  for (const [key, pattern] of patterns) {
    for (const match of clean.matchAll(pattern)) {
      if (key === 'codes' && !codes.has(match[0]) && !FINDING_ID.test(match[0])) continue
      count[key] += 1
      const from = Math.max(0, (match.index ?? 0) - 30)
      hits.push(`${key}: …${clean.slice(from, (match.index ?? 0) + match[0].length + 30).replace(/\s+/g, ' ').trim()}…`)
    }
  }
  return { count, hits }
}

/** A question with no chat to grade: one graded from a file, or a result stored before the chat check. */
export const noChat = (): ChatChecks => ({ result: 'not run', messages: {} })

/**
 * The chat check of one rerun. `messages` and `hits` are the text that was read and the words each count
 * matched: they are for the run folder only and are never part of a result.
 */
export function checkChat(turns: Turn[], closed: boolean, rules: ChatRules): { checks: ChatChecks; messages: Partial<Record<ChatMessage, string>>; hits: string[] } {
  const checks = noChat()
  const messages = chatMessages(turns, closed)
  const hits: string[] = []
  for (const kind of Object.keys(CHAT_NAMES) as ChatMessage[]) {
    const text = messages[kind]
    if (text === undefined) continue
    const counted = countChat(text, rules)
    checks.messages[kind] = counted.count
    hits.push(...counted.hits.map(hit => `${CHAT_NAMES[kind]}, ${hit}`))
  }
  const counts = Object.values(checks.messages)
  if (counts.length) checks.result = counts.some(count => count.arrows + count.vs + count.codes > 0) ? 'fail' : 'pass'
  return { checks, messages, hits }
}

/** The repeat pair's two checks, by what each result holds. Their names and wording are in questions.json (repeat.checks). */
export const REPEAT_IDS = { asks: 'FU1', leads: 'FU2' } as const

// The headers of the questions a first run settles, and the header of the one question a repeat run asks.
// They are the contract's own (orchestration.md, 2, and repeat-run.md, The reply): lib.test.ts fails when
// either file stops naming one, so a renamed header cannot leave FU1 looking for the old one.
export const SETUP_HEADERS = ['Heard', 'Scope', 'Save', 'Remember', 'Storyline', 'Role', 'Relationship']
export const SINCE_HEADER = 'Since then'
// What the setup questions say when a host refuses the question tool and the flow asks in text.
const SETUP_WORDS = [/keep these answers for next time/i, /\bpage only\b/i, /\bsave to atlas\b/i, /\byes, run it\b/i]
// The follow-up's first line, allowing for a quote mark or emphasis in front of it.
const OPENING = /^[\s>*_"“]*last time \(/i

/**
 * FU1: the first message of a repeat run. It passes when the message opens the follow-up ("Last time (12 Nov)
 * you asked ..."), asks about what has happened since, and asks none of the setup questions the first run
 * settled. The Credits question is not a setup question: a run that will spend still asks it. Only the main
 * thread's own words are read: a file it opened (the contract's own example opens with "Last time") is not
 * something the person saw. The opening must be a line of its own that comes before any question the message
 * asks, so a setup reply that mentions last time further down, or only inside a question, fails. The reasons
 * name headers and rules only, never the message's words.
 */
export function repeatAsk(turn: Turn): { result: Result; reasons: string[] } {
  const asks = turn.toolUses.filter(use => use.main && use.name === 'AskUserQuestion')
  const questions = asks.flatMap(use => (Array.isArray(use.input?.questions) ? use.input.questions : []))
  const headers = questions.map((question: any) => String(question?.header ?? '').trim().toLowerCase())
  // Everything the main thread wrote in the turn; the reply alone when the stream kept no text blocks.
  const message = turn.said.trim() ? turn.said : turn.reply
  if (!message.trim() && !questions.length) return { result: 'not run', reasons: ['the repeat run sent no message'] }
  const reasons: string[] = []
  const lines = message.split('\n')
  const opening = lines.findIndex(line => OPENING.test(line))
  if (opening < 0 || lines.slice(0, opening).join('\n').includes('?')) reasons.push('the message does not open with "Last time ({date}) you asked"')
  const setup = SETUP_HEADERS.map(header => header.toLowerCase())
  const repeated = headers.filter(header => setup.includes(header))
  if (repeated.length) reasons.push(`it asks setup questions again: ${[...new Set(repeated)].join(', ')}`)
  if (questions.length) {
    if (!headers.includes(SINCE_HEADER.toLowerCase())) reasons.push(`no question is headed "${SINCE_HEADER}"`)
  } else {
    if (!/\bsince\b/i.test(message)) reasons.push('it does not ask what has happened since')
    const said = SETUP_WORDS.filter(pattern => pattern.test(`${turn.said}\n${turn.reply}`))
    if (said.length) reasons.push(`it asks setup questions again in text (${said.length} setup phrase${said.length === 1 ? '' : 's'})`)
  }
  return { result: reasons.length ? 'fail' : 'pass', reasons }
}

/** One line under a question's table for the repeat pair. Null when the pair was not run. */
export function repeatLine(repeat: RepeatChecks | undefined, names: Record<string, string>): string | null {
  if (!repeat) return null
  const part = (id: string, result: Result) => `${names[id] ? `${names[id]} ` : ''}(${id}): ${cell(result)}`
  const page = repeat.page.link ?? (repeat.page.captured ? 'captured, no link' : 'none published')
  const compactions = repeat.compactions ? `, compacted ${repeat.compactions} time${repeat.compactions === 1 ? '' : 's'}` : ''
  return `Repeat run: ${part(REPEAT_IDS.asks, repeat.asks)}; ${part(REPEAT_IDS.leads, repeat.leads)}. ` +
    `Confirmation rounds: ${repeat.rounds} · Second run: ${repeat.billedTokens.toLocaleString('en-US')} tokens billed${compactions} · Second page: ${page}.`
}

/** The questions whose repeat pair failed a check. Like the chat, it has no approved result to compare with. */
export function repeatFailures(results: RunResults): { code: string; id: string }[] {
  return results.questions.flatMap(question =>
    (Object.keys(REPEAT_IDS) as (keyof typeof REPEAT_IDS)[])
      .filter(key => question.repeat?.[key] === 'fail')
      .map(key => ({ code: question.code, id: REPEAT_IDS[key] })))
}

/** The chat item of docs/STANDARD.md that the counts prove. */
export const CHAT_CHECK = { id: 'C5', name: 'Chat wording' }

/**
 * One line under a question's table: what each message held, or that it was not sent. No quoted
 * text, so it can go in a PR comment. Null when the chat was not graded.
 */
export function chatLine(chat: ChatChecks): string | null {
  if (chat.result === 'not run') return null
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
  const parts = (Object.keys(CHAT_NAMES) as ChatMessage[]).map(kind => {
    const count = chat.messages[kind]
    if (!count) return kind === 'stoppedOn' ? null : `${CHAT_NAMES[kind]} not sent`
    if (count.arrows + count.vs + count.codes === 0) return `${CHAT_NAMES[kind]} clean`
    return `${CHAT_NAMES[kind]} has ${plural(count.arrows, 'arrow')}, ${count.vs} "vs" and ${plural(count.codes, 'code')}`
  })
  return `${CHAT_CHECK.name} (${CHAT_CHECK.id}): ${chat.result}. ${parts.filter(Boolean).join('; ')}.`
}

/** Stored results as this version reads them: a run stored before the chat check or the approval check has neither on its questions. */
export function normalizeRun(results: RunResults): RunResults {
  const page = (checks: PageChecks | null) => checks && { ...checks, asserted: checks.asserted ?? {} }
  return {
    ...results,
    questions: results.questions.map(question => ({
      ...question, chat: question.chat ?? noChat(), assertions: question.assertions ?? [], approvals: question.approvals ?? noApprovals(),
      new: page(question.new), approved: page(question.approved),
    })),
  }
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

const R_FLOOR = 15

/** R ids to show: R1 to R15 always, and any later ones a grade or the page check returned (the reader standard grows). */
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

export const cell = (result: Result) => (result === 'not run' ? '–' : result)

export const aResult = (checks: PageChecks | null, id: string): Result => checks?.asserted[id] ?? 'not run'

/** `name` is what a report prints beside the id: an assertion's own name, or the check's name from `names`. */
export type Row = { id: string; name?: string; new: Result; approved: Result; bar: boolean; assertion?: AssertionRef }

/** A question's rows: its own assertions first, since they are what the case is there to show, then E and R. */
export function rows(question: QuestionResult, eChecks: CheckDef[], rList: string[], names: Record<string, string>): Row[] {
  const bar = new Set(question.barChecks)
  return [
    ...question.assertions.map(assertion => ({ id: assertion.id, name: assertion.name, new: aResult(question.new, assertion.id), approved: aResult(question.approved, assertion.id), bar: true, assertion })),
    ...eChecks.map(check => ({ id: check.id, name: names[check.id], new: eResult(question.new, check.id), approved: eResult(question.approved, check.id), bar: bar.has(check.id) })),
    // The run's own approvals, not the page's: an approved page has no run to read, so its column stays empty.
    { id: APPROVALS_CHECK.id, name: APPROVALS_CHECK.name, new: question.approvals.result, approved: 'not run' as Result, bar: false },
    ...rList.map(id => ({ id, name: names[id], new: rResult(question.new, id), approved: rResult(question.approved, id), bar: bar.has(id) })),
  ]
}

/**
 * The lines under a case's table that say where each assertion stands against its ticket: the ones still
 * waiting on a ticket, and the ones that pass before their ticket is marked as landed.
 */
export function assertionNotes(question: QuestionResult): string[] {
  if (!question.new) return []
  const open = question.assertions.filter(assertion => !assertion.landed)
  const label = (assertion: AssertionRef) => `${assertion.id} (${assertion.ticket})`
  const got = (result: Result) => open.filter(assertion => aResult(question.new, assertion.id) === result)
  // The assertion judge is told to answer PASS or FAIL only, so an N/A is no more a result than a missing row.
  const [waiting, early, unjudged] = [got('fail'), got('pass'), [...got('not run'), ...got('n/a')]]
  return [
    ...(waiting.length ? [`Waiting on a ticket, so not a regression: ${waiting.map(label).join(', ')}.`] : []),
    ...(unjudged.length ? [`Not judged (the judge returned no row, or an N/A it is told not to give), so nothing is known about: ${unjudged.map(label).join(', ')}.`] : []),
    ...(early.length ? [`Passes before its ticket is marked as landed: ${early.map(label).join(', ')}. Set "landed" in scripts/eval/questions.json in the ticket's pull request.`] : []),
  ]
}

/** One question's table, as markdown that reads in a terminal and pastes into a pull request. */
export function renderQuestion(question: QuestionResult, eChecks: CheckDef[], rList: string[], names: Record<string, string>): string {
  const lines: string[] = []
  lines.push(`### ${question.code} · ${question.example}`)
  lines.push('')
  lines.push('| Check | New page | Approved page | Sets the bar |')
  lines.push('| ----- | -------- | ------------- | ------------ |')
  for (const row of rows(question, eChecks, rList, names)) {
    const name = row.name ? ` ${row.name}${row.assertion ? ` (${row.assertion.ticket})` : ''}` : ''
    lines.push(`| ${row.id}${name} | ${cell(row.new)} | ${cell(row.approved)} | ${row.bar ? 'yes' : ''} |`)
  }
  lines.push('')
  const compactions = question.compactions ? `, compacted ${question.compactions} time${question.compactions === 1 ? '' : 's'}` : ''
  lines.push(`Transcript: ${question.transcriptTokens.toLocaleString('en-US')} tokens${compactions} · ` +
    `Confirmation rounds: ${question.rounds} · New page: ${question.page.link ?? (question.page.captured ? 'captured, no link' : 'none published')}`)
  const chat = chatLine(question.chat)
  const approvals = approvalsLine(question.approvals)
  const notes = [...question.problems, ...assertionNotes(question), ...(chat ? [chat] : []), ...(approvals ? [approvals] : []), ...(question.new?.notes ?? []).map(n => `New page: ${n}`), ...(question.approved?.notes ?? []).map(n => `Approved page: ${n}`)]
  for (const note of notes) lines.push(`- ${note}`)
  const waiting = eChecks.filter(check => check.waitsFor && eResult(question.new, check.id) === 'not run')
  if (waiting.length) lines.push(`- Not run yet: ${waiting.map(check => `${check.id} (${check.waitsFor})`).join(', ')}.`)
  return lines.join('\n')
}

export function renderRun(results: RunResults, eChecks: CheckDef[], names: Record<string, string>): string {
  const rList = rIds(results.questions)
  const head = `## Page eval · ${results.date} · plugin ${results.commit.slice(0, 7)} · ${results.model}` +
    (results.judgeModel === results.model ? '' : ` (judged by ${results.judgeModel})`)
  const skipped = skippedLine(results.skipped)
  return [head, ...(skipped ? [skipped] : []), ...results.questions.map(question => renderQuestion(question, eChecks, rList, names))].join('\n\n') + '\n'
}

/** What a stored baseline keeps: results and sizes. No page, link, brand, or quoted text. */
export function forBaseline(results: RunResults): RunResults {
  const strip = (checks: PageChecks | null): PageChecks | null =>
    checks && { scripted: checks.scripted, graded: checks.graded, e: checks.e, asserted: checks.asserted, reasons: {}, notes: [] }
  return {
    ...results,
    questions: results.questions.map(question => ({
      ...question,
      page: { link: null, captured: question.page.captured },
      new: strip(question.new),
      approved: strip(question.approved),
      ...(question.repeat ? { repeat: { ...question.repeat, page: { link: null, captured: question.repeat.page.captured } } } : {}),
      problems: [],
    })),
  }
}

/** What changed between two runs, question by question. A changed approved-page result is a drifted check. */
export function compareRuns(before: RunResults, after: RunResults, eChecks: CheckDef[]): string {
  const lines: string[] = [`## Page eval compare · ${before.date} (${before.commit.slice(0, 7)}) → ${after.date} (${after.commit.slice(0, 7)})`]
  if (before.harness !== after.harness) {
    lines.push('', `The runs come from harness versions ${before.harness} and ${after.harness}, which ask the questions differently: ` +
      'confirmation rounds and transcript tokens are not comparable between them.')
  }
  const rList = rIds([...before.questions, ...after.questions])
  let changes = 0
  for (const next of after.questions) {
    const prev = before.questions.find(question => question.code === next.code)
    lines.push('', `### ${next.code} · ${next.example}`, '')
    if (!prev) {
      lines.push('Not in the first run.')
      continue
    }
    // Matched by id, not by position: a case's assertion list can grow between two runs.
    const prevRows = new Map(rows(prev, eChecks, rList, {}).map(row => [row.id, row]))
    const changed = rows(next, eChecks, rList, {})
      .map(row => ({ row, was: prevRows.get(row.id) ?? { ...row, new: 'not run' as Result, approved: 'not run' as Result } }))
      .filter(({ row, was }) => row.new !== was.new || row.approved !== was.approved)
      // A run stored before the approval check, or one that asked no picker, has nothing to compare it with.
      .filter(({ row, was }) => row.id !== APPROVALS_CHECK.id || (row.new !== 'not run' && was.new !== 'not run'))
    if (changed.length) {
      lines.push('| Check | New page | Approved page |', '| ----- | -------- | ------------- |')
      for (const { row, was } of changed) {
        const side = (a: Result, b: Result) => (a === b ? cell(b) : `${cell(a)} → ${cell(b)}`)
        lines.push(`| ${row.id} | ${side(was.new, row.new)} | ${side(was.approved, row.approved)}${was.approved !== row.approved ? ' (drift)' : ''} |`)
      }
      lines.push('')
      changes += changed.length
    }
    // A run stored before the chat check has no chat result, so there is nothing to compare it with.
    const chatChanged = prev.chat.result !== 'not run' && next.chat.result !== 'not run' && prev.chat.result !== next.chat.result
    if (!changed.length && !chatChanged) lines.push('No check changed.', '')
    if (chatChanged) {
      lines.push(`${CHAT_CHECK.name} (${CHAT_CHECK.id}): ${prev.chat.result} → ${next.chat.result}`, '')
      changes += 1
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
/** One reader's row of the result table in recipient-lens.md: what the reader is judged on, and what ranks posts without it. */
export function readerResult(lensMarkdown: string, team: string): { result: string; standIn: string } | null {
  const table = lensMarkdown.match(/<!-- result-judged-on -->([\s\S]*?)<!-- \/result-judged-on -->/)?.[1] ?? ''
  for (const line of table.split('\n')) {
    const cells = line.split('|').map(cell => cell.trim())
    if (cells[1] === `\`${team}\`` && cells[2] && cells[3]) return { result: cells[2], standIn: cells[3] }
  }
  return null
}

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

/**
 * Splits the chosen questions by whether local.json names a brand for them. A question with no brand is skipped
 * only while nothing about it gates a pull request (a question not yet set up). `gates` says when one does: a
 * baseline holds approved results for it, or one of its assertions has landed. Such a question is `missing`,
 * and the run must stop, since a lost or mistyped entry would otherwise drop a gated question. Grading a given
 * page or a dry run needs no brand, so then nothing is skipped.
 */
export function configuredQuestions<Q extends { code: string }>(
  questions: Q[], local: { questions?: Record<string, { brand?: string }> }, needsNoBrand: boolean,
  gates: (code: string) => boolean,
): { run: Q[]; skipped: string[]; missing: string[] } {
  if (needsNoBrand) return { run: questions, skipped: [], missing: [] }
  const unset = questions.filter(question => !local.questions?.[question.code]?.brand).map(question => question.code)
  return {
    run: questions.filter(question => !unset.includes(question.code)),
    skipped: unset.filter(code => !gates(code)),
    missing: unset.filter(code => gates(code)),
  }
}

/** The line every report carries for skipped questions, so a question that did not run is never silent. */
export function skippedLine(skipped: string[] | undefined): string | null {
  if (!skipped?.length) return null
  return `Skipped: ${skipped.join(', ')} (no brand in local.json), so ${skipped.length === 1 ? 'it was' : 'they were'} not graded and cannot regress.`
}

// ---------------------------------------------------------------- local.json

/**
 * The keys of local.json that still hold a value copied from local.example.json: any text with a `{placeholder}`
 * in it. A run with one would ask about a brand named "{brand}", and the flow would pick a brand on its own.
 */
export function placeholderKeys(value: unknown, path = ''): string[] {
  if (typeof value === 'string') return /\{[^{}]+\}/.test(value) ? [path] : []
  if (Array.isArray(value)) return value.flatMap((item, i) => placeholderKeys(item, `${path}[${i}]`))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => placeholderKeys(item, path ? `${path}.${key}` : key))
  }
  return []
}

// ---------------------------------------------------------------- CI: which questions a change reruns, and the PR comment

/** The paths CI watches: the agents, the flow files, the router, and the page standard every page is built by. */
export const EVAL_PATHS = [
  'plugins/aspire/agents/', 'plugins/aspire/skills/aspire/references/', 'plugins/aspire/skills/aspire/SKILL.md',
  'plugins/aspire/skills/page-standard/',
]

/** A `sharedPaths` entry ending in "/" covers every file under it. */
const coveredBy = (path: string, entry: string) => (entry.endsWith('/') ? path.startsWith(entry) : path === entry)

/** True when a changed file is one of `entries`, or sits under one that names a folder. */
const touches = (changed: string[], entries: string[]): boolean => changed.some(path => entries.some(entry => coveredBy(path, entry)))

export type QuestionPaths = { code: string; paths?: string[] }

/** True when a failure of this question can already block a merge with no approved page: one of its assertions has landed. */
export const hasLandedAssertion = (question: { assertions: { landed: boolean }[] }): boolean =>
  question.assertions.some(assertion => assertion.landed)

/** A file name from local.json as the run's folder holds it: no path parts, nothing a shell or a prompt could misread. */
export const safeFileName = (name: string): string => name.replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '_')

/**
 * A questions.json entry as the harness uses it. `question` is the plugin's own question code: the entry's
 * `code` unless it names another, and null for a flow that has no code. `assertions` is empty for a question
 * that is not a client case. Resolved once here, so no caller handles a missing field.
 */
export function resolveQuestion<Q extends { code: string; question?: string | null; assertions?: Assertion[] }>(entry: Q): Q & { question: string | null; assertions: Assertion[] } {
  return { ...entry, question: entry.question === undefined ? entry.code : entry.question, assertions: entry.assertions ?? [] }
}

/** True when a changed file is one the fixture check depends on (`fixturePaths` in questions.json). */
export const fixturesForChanges = (changed: string[], fixturePaths: string[]): boolean => touches(changed, fixturePaths)

export type InputFile = { name: string; path?: string; text?: string }

/**
 * The files local.json hands a question, as the run's folder will hold them, and what is wrong with them.
 * `isFile` says whether a path is a file on this machine (a folder is not). Checked for every question before
 * the first one runs, so a bad entry stops the run before any page is published instead of part way through.
 * Two names that differ only in case count as the same: most developers' disks would save them as one file.
 */
export function planInputFiles(code: string, files: InputFile[], isFile: (path: string) => boolean): { names: string[]; problems: string[] } {
  const names = files.map(file => safeFileName(String(file.name ?? '')))
  const folded = names.map(name => name.toLowerCase())
  const problems: string[] = []
  files.forEach((file, i) => {
    if (!names[i]) problems.push(`${code}: a file has no name`)
    else if (folded.indexOf(folded[i]) !== i) problems.push(`${code}: the files ${files[folded.indexOf(folded[i])].name} and ${file.name} would both be saved as ${names[i]}`)
    if (typeof file.text !== 'string' && !(typeof file.path === 'string' && isFile(file.path))) problems.push(`${code}: the file ${file.name || '(no name)'} has no text and no path to a file that exists`)
  })
  return { names, problems }
}

/**
 * The verdict on a case's two fixture pages (scripts/fixtures/eval-cases/): the page with the wrong reading
 * must fail every assertion and the corrected page must pass every one, or the assertion is worded so that a
 * judge cannot tell the two readings apart. Returns the assertions that did not come out that way.
 */
export function fixtureProblems(assertions: AssertionRef[], wrong: Record<string, Result>, corrected: Record<string, Result>): string[] {
  const problems: string[] = []
  for (const { id } of assertions) {
    if ((wrong[id] ?? 'not run') !== 'fail') problems.push(`${id}: the page with the wrong reading got ${wrong[id] ?? 'not run'}, not fail`)
    if ((corrected[id] ?? 'not run') !== 'pass') problems.push(`${id}: the corrected page got ${corrected[id] ?? 'not run'}, not pass`)
  }
  return problems
}

/**
 * The question codes a set of changed files reruns: a question whose own `paths` holds a changed file, or every
 * question when a changed file is one of `sharedPaths` (a file every flow reads). Order follows questions.json.
 */
export function codesForChanges(changed: string[], questions: QuestionPaths[], sharedPaths: string[]): { watched: string[]; codes: string[] } {
  const watched = changed.filter(path => EVAL_PATHS.some(prefix => path.startsWith(prefix)))
  if (touches(watched, sharedPaths)) return { watched, codes: questions.map(question => question.code) }
  const codes = questions.filter(question => (question.paths ?? []).some(path => watched.includes(path))).map(question => question.code)
  return { watched, codes }
}

/** A page check that got worse, or a run whose chat broke a countable rule, which has no approved result to name. */
export type Regression =
  | { kind: 'page'; code: string; id: string; name?: string; was: Result; now: Result | 'no page' }
  | { kind: 'assertion'; code: string; id: string; name?: string; ticket: string; now: Result | 'no page' }
  | { kind: 'chat'; code: string; id: string; name?: string }

/**
 * The questions whose chat broke a countable English rule. The chat has no approved result to compare with:
 * a broken rule in the run's own chat always counts, and this is the one place that decides it.
 */
export function chatFailures(results: RunResults, names: Record<string, string>): Regression[] {
  return results.questions
    .filter(question => question.chat.result === 'fail')
    .map(question => ({ kind: 'chat', code: question.code, id: CHAT_CHECK.id, name: names[CHAT_CHECK.id] }))
}

/**
 * A regression is a check the approved page passes that the new page fails. A question that published no page
 * regresses on every check its approved page passes. A check the new page did not run, or one with no approved
 * result, is never a regression: the job fails on what it saw fail, and only that. An assertion whose ticket
 * has landed is held to more: the ticket fixed a wrong reading, so the assertion must pass, with no approved
 * result needed. A failure, a judge that answered n/a, and a judge that returned no row all count, since any of
 * them lets the wrong reading back in unseen. One whose ticket has not landed regresses only the usual way,
 * against an approved page that passes it. The chat failures are added after the page checks (chatFailures).
 * `names` (checkNames) gives each regression the name a report prints.
 */
export function regressions(results: RunResults, eChecks: CheckDef[], names: Record<string, string>): Regression[] {
  const rList = rIds(results.questions)
  const found: Regression[] = []
  for (const question of results.questions) {
    for (const row of rows(question, eChecks, rList, names)) {
      const at = { code: question.code, id: row.id, name: row.name }
      if (row.assertion?.landed) {
        if (!question.new || row.new !== 'pass') found.push({ kind: 'assertion', ...at, ticket: row.assertion.ticket, now: question.new ? row.new : 'no page' })
        continue
      }
      if (row.approved !== 'pass') continue
      if (!question.new) found.push({ kind: 'page', ...at, was: row.approved, now: 'no page' })
      else if (row.new === 'fail') found.push({ kind: 'page', ...at, was: row.approved, now: row.new })
    }
  }
  return [...found, ...chatFailures(results, names)]
}

/** Marks the one eval comment on a pull request, so later pushes edit it instead of adding another. */
export const COMMENT_MARKER = '<!-- eval:pages -->'

// GitHub refuses a comment body over 65,536 characters.
const COMMENT_LIMIT = 60_000

export function renderComment(results: RunResults, eChecks: CheckDef[], names: Record<string, string>, approvedSource: string | null, runUrl: string | null): string {
  if (!results.questions.length) {
    return renderSkipped(`no question ran. ${skippedLine(results.skipped) ?? 'None was chosen.'}${runUrl ? ` Run: ${runUrl}` : ''}`)
  }
  const found = regressions(results, eChecks, names)
  const missingApproved = results.questions.filter(question => !question.approved).map(question => question.code)
  const lines = [COMMENT_MARKER, `## Page eval · ${results.questions.map(question => question.code).join(', ')}`, '']
  if (found.length) {
    lines.push(`**${found.length} regression${found.length === 1 ? '' : 's'}**: checks the approved page passes that the new page does not, assertions that do not pass after their ticket landed, and chat wording that breaks a countable rule.`, '')
    for (const r of found) {
      const name = `${r.code} ${r.id}${r.name ? ` ${r.name}` : ''}`
      lines.push(r.kind === 'chat' ? `- ${name}: the run's chat broke a countable rule`
        : r.kind === 'assertion' ? `- ${name}: ${r.ticket} landed, new ${r.now === 'not run' ? 'not judged' : r.now}`
        : `- ${name}: approved ${r.was}, new ${r.now}`)
    }
  } else {
    lines.push('**No regressions**: every check the approved page passes, and every assertion whose ticket landed, the new page passes or did not run.')
  }
  lines.push('')
  if (approvedSource) lines.push(`Approved page results: ${approvedSource}.`)
  if (missingApproved.length) lines.push(`No approved results for ${missingApproved.join(', ')}, so nothing there can count as a regression. Store a baseline (scripts/eval/README.md).`)
  const skipped = skippedLine(results.skipped)
  if (skipped) lines.push(skipped)
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
  names[CHAT_CHECK.id] = CHAT_CHECK.name
  names[APPROVALS_CHECK.id] = APPROVALS_CHECK.name
  return names
}

/** Remove a test title prefix ("CI eval · ") from a page, so graders see the title the flow would have written. */
export function stripTitlePrefix(html: string, prefix: string | null): string {
  if (!prefix) return html
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.replace(new RegExp(`${escaped}\\s*[·:|-]?\\s*`, 'g'), '')
}

/** The nightly run's Slack message: one line per question, regressions named. Plain text, no page links. */
export function renderSlack(results: RunResults, eChecks: CheckDef[], names: Record<string, string>, runUrl: string | null): string {
  const found = regressions(results, eChecks, names)
  const rList = rIds(results.questions)
  const lines = [`Atlas page eval, nightly on develop (${results.commit.slice(0, 7)}): ${found.length ? `${found.length} regression${found.length === 1 ? '' : 's'}` : 'no regressions'}`]
  for (const question of results.questions) {
    const all = rows(question, eChecks, rList, names)
    const passed = all.filter(row => row.new === 'pass').length
    const ran = all.filter(row => row.new !== 'not run').length
    const mine = found.filter(r => r.code === question.code).map(r => r.id)
    const state = question.new ? `${passed}/${ran} checks pass` : 'no page'
    lines.push(`• ${question.code} ${question.example}: ${state}${mine.length ? `; regressed ${mine.join(', ')}` : ''}`)
  }
  const skipped = skippedLine(results.skipped)
  if (skipped) lines.push(`• ${skipped}`)
  if (runUrl) lines.push(runUrl)
  return lines.join('\n')
}
