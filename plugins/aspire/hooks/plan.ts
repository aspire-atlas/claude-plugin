// The steps behind the progress bar and the panel's Progress section: the agent's own task
// list (from its task tool calls), the estimate for the step in flight, what the request
// touched, and the view that is drawn. Pure functions; register.tsx keeps the state and draws.
//
// Adapted from plain-view (hooks/plan.ts) in claude-code-mods,
// https://github.com/ice-lfernandes/claude-code-mods, MIT License,
// Copyright (c) 2026 Lucas Fernandes. The full notice is in ./register.tsx.
//
// What changed from plain-view: English only; the list also comes from the desktop app's
// update_plan; no checklist read from the agent's text, no agents row, no request unfolding,
// no tool-row hiding and no prompt line (the mod changes no prompt).

import type { End, Item, Turn } from '../types'
import { clip, fmtTime } from './format'

/** The tools that write the agent's task list. */
export const TASK_TOOLS: readonly string[] = ['TaskCreate', 'TaskUpdate', 'TodoWrite']
/** The desktop app's task list, and the call that ends a turn and checks it off. */
const PLAN_TOOL = /^mcp__ccd_turn__update_plan$/
const WRAP_TOOL = /^mcp__ccd_turn__wrap_up$/
export const isTaskTool = (tool: string): boolean => TASK_TOOLS.includes(tool) || PLAN_TOOL.test(tool) || WRAP_TOOL.test(tool)

/** Tool calls a step is guessed to take before any step has finished. */
export const DEFAULT_CALLS = 4
/** The highest estimate a step shows before its task is marked done. */
export const MAX_ESTIMATE = 0.95
/** A plan of more than WINDOW + 1 tasks shows WINDOW of them around the current one. */
export const WINDOW = 5

type Input = Readonly<Record<string, unknown>>
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
const isStatus = (s: unknown): s is Item['status'] => s === 'pending' || s === 'in_progress' || s === 'completed'

/** The index of the task being worked on: the first in progress, else the first pending; -1 when all are done. */
export const currentOf = (items: readonly Item[]): number => {
  const busy = items.findIndex(i => i.status === 'in_progress')
  return busy >= 0 ? busy : items.findIndex(i => i.status === 'pending')
}

/** A new list that keeps the tool calls the old one counted, matched by subject, else by place. */
const keepCalls = (old: readonly Item[], next: Item[]): Item[] =>
  next.map((it, i) => {
    const kept = old.find(o => o.subject === it.subject) ?? old[i]
    return kept ? { ...it, calls: kept.calls } : it
  })

/** The task list after a task tool's call: TaskCreate adds, TaskUpdate changes, TodoWrite and update_plan replace or move it. */
export const applyTask = (from: Item[], tool: string, input: Input, result?: unknown): Item[] => {
  if (tool === 'TaskCreate') {
    const task = (result as { task?: { id?: unknown } } | undefined)?.task
    const subject = str(input.subject)
    if (!subject) return from
    const item: Item = { subject, status: 'pending', calls: 0 }
    if (typeof task?.id === 'string') item.id = task.id
    return [...from, item]
  }
  if (tool === 'TaskUpdate') {
    const id = str(input.taskId)
    const at = from.findIndex(i => i.id === id)
    if (at < 0) return from
    if (input.status === 'deleted') return from.filter((_, i) => i !== at)
    const next: Item = { ...from[at]! }
    if (isStatus(input.status)) next.status = input.status
    if (str(input.subject)) next.subject = str(input.subject)
    return from.map((it, i) => (i === at ? next : it))
  }
  if (tool === 'TodoWrite' || PLAN_TOOL.test(tool)) {
    const raw = Array.isArray(input.todos) ? input.todos : Array.isArray(input.items) ? input.items : null
    if (raw) {
      const list = raw
        .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null && str((t as Record<string, unknown>).content) !== '')
        .map((t): Item => ({ subject: str(t.content), status: isStatus(t.status) ? t.status : 'pending', calls: 0 }))
      return keepCalls(from, list)
    }
    // update_plan's other calls move the list: advance, done (1-based), start (1-based).
    const next = from.map(i => ({ ...i }))
    if (input.advance === true) {
      const busy = next.findIndex(i => i.status === 'in_progress')
      if (busy >= 0) next[busy]!.status = 'completed'
      const upcoming = next.findIndex(i => i.status === 'pending')
      if (upcoming >= 0) next[upcoming]!.status = 'in_progress'
    }
    if (Array.isArray(input.done)) for (const n of input.done) if (typeof n === 'number' && next[n - 1]) next[n - 1]!.status = 'completed'
    if (typeof input.start === 'number' && next[input.start - 1]) next[input.start - 1]!.status = 'in_progress'
    return next
  }
  // wrap_up checks off the task list.
  if (WRAP_TOOL.test(tool)) return from.map(i => ({ ...i, status: 'completed' }))
  return from
}

/** One more tool call for the task being worked on. */
export const countCall = (items: Item[]): Item[] => {
  const at = currentOf(items)
  return at < 0 ? items : items.map((it, i) => (i === at ? { ...it, calls: it.calls + 1 } : it))
}

const base = (path: string): string => path.split('/').filter(Boolean).pop() ?? path
const words = (s: string): string => s.replace(/[_-]+/g, ' ')

/** What a call is doing, in a few words: a Bash call by its own description, a skill by name, a file by its name. */
export const doingOf = (tool: string, input: Input): string => {
  const file = str(input.file_path) || str(input.notebook_path)
  if (tool === 'Bash') return clip(str(input.description) || 'running a command', 50)
  if (tool === 'Skill' && str(input.skill)) return `using the ${clip(str(input.skill), 30)} skill`
  if (tool === 'Read') return file ? `reading ${base(file)}` : 'reading files'
  if (tool === 'Edit' || tool === 'MultiEdit' || tool === 'NotebookEdit') return file ? `editing ${base(file)}` : 'editing files'
  if (tool === 'Write') return file ? `writing ${base(file)}` : 'writing a file'
  if (tool === 'Grep' || tool === 'Glob') return 'searching the code'
  if (tool === 'WebSearch' || tool === 'WebFetch') return 'searching the web'
  if (tool === 'Agent' || tool === 'Task') return 'starting an agent'
  return `using ${clip(words(tool.startsWith('mcp__') ? (tool.split('__').pop() ?? tool) : tool), 30)}`
}

const CHANGES = ['Edit', 'MultiEdit', 'Write', 'NotebookEdit']
const withFile = (list: readonly string[], file: string): string[] => (list.includes(file) ? [...list] : [...list, file])

/** The turn after one more call: counted and named while it runs (`ok` null), then the files it changed or read once it worked. */
export const touch = (turn: Turn, tool: string, input: Input, ok: boolean | null): Turn => {
  const file = str(input.file_path) || str(input.notebook_path)
  if (ok === null) return { ...turn, calls: turn.calls + 1, doing: doingOf(tool, input) }
  if (!ok) return turn
  const next: Turn = { ...turn }
  if (file && CHANGES.includes(tool)) next.changed = withFile(turn.changed, file)
  if (file && tool === 'Read') next.read = withFile(turn.read, file)
  return next
}

// A harness notification's opening tag, such as `<task-notification>`.
const NOTICE = /^<([a-zA-Z][\w-]*)[\s>]/
const requestOf = (text: string): string => {
  let rest = text.trimStart()
  for (let m = NOTICE.exec(rest); m; m = NOTICE.exec(rest)) {
    const close = rest.indexOf(`</${m[1]}>`)
    const end = rest.indexOf('\n')
    rest = (close >= 0 ? rest.slice(close + m[1]!.length + 3) : end >= 0 ? rest.slice(end + 1) : '').trimStart()
  }
  return rest
}
/** The request's first line, for the title; none when the turn holds only a notification. */
export const titleOf = (text: string): string => clip(requestOf(text).split('\n').map(l => l.trim()).find(l => l !== '') ?? '', 80)

/** A new turn: a fresh request, and the task list kept only while some task is still open. */
export const startTurn = (prev: Turn | null, items: Item[], text: string, now: number): { turn: Turn; items: Item[] } => {
  // A notification, or a continuation with no text, keeps the last request's title.
  const title = titleOf(text) || prev?.title || 'Working'
  return { turn: { title, startedAt: now, calls: 0, changed: [], read: [] }, items: items.some(i => i.status !== 'completed') ? items : [] }
}

/** The turn once it ended. */
export const endTurn = (turn: Turn, reason: string, now: number): Turn => {
  const end: End = reason === 'answer' ? 'answer' : reason === 'aborted' ? 'aborted' : 'error'
  const { doing: _, ...rest } = turn
  return { ...rest, endedAt: now, end }
}

/** The current step's estimate, 0 to MAX_ESTIMATE: its tool calls against the average of the finished steps. A guess, so it shows with `~`. */
export const estimate = (items: readonly Item[], at: number): number => {
  const item = items[at]
  if (!item) return 0
  const finished = items.filter(i => i.status === 'completed' && i.calls > 0)
  const average = finished.length ? finished.reduce((n, i) => n + i.calls, 0) / finished.length : DEFAULT_CALLS
  return Math.min(MAX_ESTIMATE, item.calls / Math.max(1, average))
}

/** What a task row shows: done, the one now, the next one, later ones, or the one a stop left. */
export type RowKind = 'done' | 'now' | 'next' | 'later' | 'halted'
export type Row = { kind: RowKind; text: string; frac: number; status: string; doing?: string }

/** The plan as data: the request, its steps and their bars, and how it ended. */
export type PlanView = {
  /** Working, done (the turn answered) or stopped (interrupted or an error). */
  state: 'work' | 'done' | 'stopped'
  title: string
  /** `All done`, `Turn done`, `Interrupted` or `Stopped`; none while it works. */
  badge?: string
  time: string
  /** `Step 2 of 4`, or the badge's words once it ended. */
  label: string
  frac: number
  rows: Row[]
  /** `3 more done` above a long plan's window, `2 later` below it. */
  before?: string
  after?: string
  /** What the request touched, once it ended: `changed 2 files · read 3 files`. */
  files?: string
  total: number
}

const windowAround = (total: number, at: number): { start: number; end: number } => {
  if (total <= WINDOW + 1) return { start: 0, end: total }
  const start = Math.max(0, Math.min(total - WINDOW, at - 1))
  return { start, end: start + WINDOW }
}

const count = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

/** The plan for a turn, or null when there is none to show: no turn, or no task list. */
export const planOf = (turn: Turn | null, items: readonly Item[], now: number): PlanView | null => {
  if (!turn || items.length === 0) return null
  const span = fmtTime((turn.endedAt ?? now) - turn.startedAt)
  const total = items.length
  const completed = items.filter(i => i.status === 'completed').length
  const at = currentOf(items)
  const state = turn.end === undefined ? 'work' : turn.end === 'answer' ? 'done' : 'stopped'
  const est = state === 'work' && at >= 0 ? estimate(items, at) : 0
  const frac = (completed + est) / total
  const { start, end } = windowAround(total, at < 0 ? total - 1 : at)

  const rows: Row[] = items.slice(start, end).map((it, j): Row => {
    const i = start + j
    if (it.status === 'completed') return { kind: 'done', text: it.subject, frac: 1, status: 'Done' }
    if (i === at) {
      if (state === 'stopped') return { kind: 'halted', text: it.subject, frac: Math.max(0.05, estimate(items, i)), status: 'Stopped' }
      // The turn answered with this task open: it waits, nothing stopped it.
      if (state === 'done') return { kind: 'later', text: it.subject, frac: 0, status: 'Left open' }
      return { kind: 'now', text: it.subject, frac: est, status: `~${Math.round(est * 100)}%`, ...(turn.doing ? { doing: turn.doing } : {}) }
    }
    return { kind: i === at + 1 ? 'next' : 'later', text: it.subject, frac: 0, status: i === at + 1 ? 'Next' : 'Up next' }
  })
  const outside = (list: readonly Item[], whenDone: (n: number) => string, other: (n: number) => string): string | undefined =>
    list.length === 0 ? undefined : list.every(i => i.status === 'completed') ? whenDone(list.length) : other(list.length)
  const before = outside(items.slice(0, start), n => `${n} more done`, n => `${n} earlier`)
  const after = outside(items.slice(end), n => `${n} more done`, n => `${n} later`)

  const badge = state === 'done' ? (completed === total ? 'All done' : 'Turn done') : state === 'stopped' ? (turn.end === 'aborted' ? 'Interrupted' : 'Stopped') : undefined
  const touched = turn.changed.length + turn.read.length > 0 ? `changed ${count(turn.changed.length, 'file', 'files')} · read ${count(turn.read.length, 'file', 'files')}` : undefined
  return {
    state,
    title: turn.title,
    ...(badge ? { badge } : {}),
    time: state === 'done' ? `took ${span}` : state === 'stopped' ? `stopped at ${span}` : span,
    label: state === 'done' && completed === total ? `${total} of ${total} steps` : state === 'work' ? `Step ${Math.min(total, (at < 0 ? total - 1 : at) + 1)} of ${total}` : (badge ?? ''),
    frac: state === 'done' && completed === total ? 1 : frac,
    rows,
    ...(before ? { before } : {}),
    ...(after ? { after } : {}),
    ...(state !== 'work' && touched ? { files: touched } : {}),
    total,
  }
}
