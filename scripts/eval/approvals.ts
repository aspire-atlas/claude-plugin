// Whether every approval a rerun asked for was named in its setup reply (docs/STANDARD.md, Q3). Pure: no
// process, network or file calls, so `bun test scripts/eval` covers it without running Claude.

import type { Asked, Result, Turn } from './lib'

/** The approvals the setup reply's "This run will ask you to approve" line names (orchestration.md, section 2). */
export type ApprovalKind = 'storyline' | 'credits' | 'refresh' | 'save' | 'drafts' | 'delivery' | 'send'

/**
 * How each approval is known, one row per kind. `named` reads an item of the setup reply's line, by the
 * wording of the table in orchestration.md, section 2. `header` and `question` read a picker as the flows
 * write it: the Storyline, Credits and Save headers (orchestration.md, section 2), the refresh offer (page
 * standard, 9.5), a mailbox draft, sending the page to Slack or email, and a question that opens with "Send"
 * (but not "Send me", which asks for something and sends nothing). A picker takes the first row it fits, by
 * its header before its wording, so the order of the rows is the precedence: a Save header is a save even
 * when its question mentions a mailbox.
 */
const KINDS: { kind: ApprovalKind; named?: RegExp; header?: RegExp; question?: RegExp }[] = [
  { kind: 'storyline', named: /\bmain points\b/i, header: /storyline/i },
  { kind: 'credits', named: /\bcredits?\b/i, header: /credit/i, question: /\bcap it at\b/i },
  { kind: 'refresh', named: /\brefresh/i, header: /refresh/i, question: /\brefresh (?:it|them|@\S+) first\b/i },
  { kind: 'save', named: /\bsav(?:e|ing)\b/i, header: /^save$/i },
  { kind: 'drafts', named: /\bmailbox\b/i, header: /mailbox/i, question: /\bdrafts?\b[^.?]*\bmailbox\b|\bmailbox\b[^.?]*\bdrafts?\b/i },
  { kind: 'delivery', named: /\bsending the page\b|\bto (?:slack|email)\b/i, header: /deliver/i, question: /\b(?:send|post|share|email)\b[^.?]*\b(?:page|report|readout)\b[^.?]*\b(?:slack|email)\b/i },
  { kind: 'send', named: /\bone at a time\b/i, header: /^send$/i, question: /^\W*send\b(?! (?:me|us)\b)/i },
  // No `named`: the save row above reads the line. This one only ranks the wording test below a send.
  { kind: 'save', question: /\bsave\b[^.?]*\bto atlas\b/i },
]

/**
 * The approvals the setup reply named. Null when the text holds no such line, and an empty list for "This run
 * asks you to approve nothing." The line ends at the end of its paragraph. Its items are split at semicolons
 * and list markers, a line that wraps inside an item is joined first, and an item names every kind its
 * wording fits, so a line that lists its approvals with commas reads the same. A parenthesis explains its item
 * and names nothing: the refresh item's "(… the new posts it collects use credits)" is not the credits approval.
 */
export function namedApprovals(reply: string): ApprovalKind[] | null {
  if (/This run asks you to approve nothing/i.test(reply)) return []
  const line = reply.match(/This run will ask you to approve:?\s*([\s\S]*?)(?:\n\s*\n|$)/i)?.[1]
  if (line === undefined) return null
  const items = line
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\n\s*(?:[-*•]|\d+[.)])\s+/g, ';')
    .replace(/\s*\n\s*/g, ' ')
    .split(';')
  const kinds = new Set<ApprovalKind>()
  for (const item of items) for (const row of KINDS) if (row.named?.test(item)) kinds.add(row.kind)
  return [...kinds]
}

/** The approval one asked question is, or null for a question that approves nothing (Heard, Scope, a role). */
export function approvalKind(asked: Pick<Asked, 'header' | 'question'>): ApprovalKind | null {
  return (KINDS.find(row => row.header?.test(asked.header)) ?? KINDS.find(row => row.question?.test(asked.question)))?.kind ?? null
}

/** Kinds only, so the result can be stored in a baseline and shown in a PR comment. */
export type ApprovalChecks = {
  /** `not run` when the run asked no picker, so there was no setup reply to read. */
  result: Result
  /** False when the setup reply held no "This run will ask you to approve" line. */
  line: boolean
  named: ApprovalKind[]
  asked: ApprovalKind[]
  /** Asked, and neither named in the line nor called out as one more approval above its own question. */
  unnamed: ApprovalKind[]
}

export const noApprovals = (): ApprovalChecks => ({ result: 'not run', line: false, named: [], asked: [], unnamed: [] })

const EXTRA_APPROVAL = /one more approval than I listed/i

/**
 * The approval check of one rerun. The setup reply is what the main thread wrote above its first picker. An
 * approval asked later passes when the line named its kind, or when the text above its own question, written
 * by whoever asked it, says "One more approval than I listed" (orchestration.md, section 2). The picker the
 * harness left unanswered because the run had finished is not counted: it is the flow's offer of more work
 * after the page, which the line, written for what the run reaches, does not cover.
 */
export function checkApprovals(turns: Turn[]): ApprovalChecks {
  const asks = turns.flatMap(turn => turn.asks)
  if (!asks.length) return noApprovals()
  const named = namedApprovals(asks.find(ask => ask.main)?.before ?? '')
  const asked = new Set<ApprovalKind>()
  const unnamed = new Set<ApprovalKind>()
  for (const ask of asks) {
    if (ask.declined === 'finished') continue
    for (const question of ask.questions) {
      const kind = approvalKind(question)
      if (!kind) continue
      asked.add(kind)
      if (!named?.includes(kind) && !EXTRA_APPROVAL.test(ask.before)) unnamed.add(kind)
    }
  }
  return { result: unnamed.size ? 'fail' : 'pass', line: named !== null, named: named ?? [], asked: [...asked], unnamed: [...unnamed] }
}

/** The item of docs/STANDARD.md the approval check proves. It is a row of the table, with no approved result. */
export const APPROVALS_CHECK = { id: 'Q3', name: 'Approvals named in the setup reply' }

/** One line under a question's table when the check fails: which approvals, by kind. No quoted text. */
export function approvalsLine(approvals: ApprovalChecks): string | null {
  if (approvals.result !== 'fail') return null
  const where = approvals.line ? 'the setup reply did not name' : 'the setup reply has no "This run will ask you to approve" line, so it did not name'
  return `${APPROVALS_CHECK.name} (${APPROVALS_CHECK.id}): fail. The run asked for ${approvals.unnamed.join(', ')}, which ${where}.`
}
