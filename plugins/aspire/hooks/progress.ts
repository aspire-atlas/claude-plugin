// The progress bar's reading: what the aspire skill reports through the
// aspire_progress tool, or, before it reports, a baseline from the latest Atlas
// get_status result. Pure functions; register.tsx keeps the state and draws.
//
// The reporting model (title, total, done, phase, tasks, finished; fields left
// out keep their value; a finished run or a new title starts over) is adapted
// from savvy-progress (hooks/register.tsx) in claude-kit,
// https://github.com/johnnyvizz/claude-kit, MIT License,
// Copyright (c) 2026 johnnyvizz. The full notice is in ./register.tsx.

import type { AgentRun, OrgState, Progress, ProgressTask } from '../types'
import type { AtlasOrgReading } from './atlas-usage'
import { clip } from './format'

/** Onboarding checkpoints: 4 visible in get_status, 2 more only through reported progress. */
export const STEPS = 6

// The tool's schema is advice to the model, not a check: what a call may ask
// the bar to draw is bounded here.
const MAX_TASKS = 50
const MAX_TITLE = 80
const MAX_PHASE = 40

/** An aspire_progress call's arguments, unchecked. */
export type ProgressInput = {
  title?: unknown
  total?: unknown
  done?: unknown
  phase?: unknown
  finished?: unknown
  tasks?: unknown
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const int = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : undefined)
const str = (v: unknown, max: number): string | undefined => (typeof v === 'string' ? clip(v.trim(), max) : undefined)

const cleanTasks = (v: unknown): ProgressTask[] | undefined =>
  Array.isArray(v)
    ? v
        .flatMap((t): ProgressTask[] => {
          const title = isRecord(t) ? str(t.title, MAX_TITLE) : str(t, MAX_TITLE)
          return title ? [{ title, isDone: isRecord(t) && t.done === true }] : []
        })
        .slice(0, MAX_TASKS)
    : undefined

const blank = (): Progress => ({ title: '', total: 0, done: 0, phase: '', isFinished: false, tasks: [] })

// A finished run, or a new title, starts over: counters never carry over.
const isNewRun = (prev: Progress | null, title: string | undefined): boolean =>
  !prev || prev.isFinished || (title !== undefined && title !== '' && title !== prev.title)

/** One report merged into the last: fields left out keep their previous value. */
export const mergeProgress = (prev: Progress | null, input: ProgressInput): Progress => {
  const title = str(input.title, MAX_TITLE)
  const base = isNewRun(prev, title) || !prev ? blank() : prev
  const tasks = cleanTasks(input.tasks) ?? base.tasks
  const hasTasks = input.tasks !== undefined && tasks.length > 0
  const total = Math.min(MAX_TASKS, int(input.total) ?? (hasTasks ? tasks.length : base.total))
  const reported = int(input.done) ?? (hasTasks ? tasks.filter(t => t.isDone).length : base.done)
  const isFinished = input.finished === true
  const done = isFinished && total ? total : total ? Math.min(total, reported) : reported
  return {
    title: title || base.title,
    total,
    done,
    phase: isFinished ? '' : (str(input.phase, MAX_PHASE) ?? base.phase),
    isFinished,
    tasks,
  }
}

/**
 * The organization and onboarding checkpoints from one get_status result:
 * 1 Atlas answered, 2 an organization picked, 3 a brand profile exists, 4 a
 * channel is linked. With several organizations and none named in the call
 * (`asOrganizationId`), get_status's selection is its default, not the
 * person's pick: an earlier pick is kept, else no name and 1.
 */
export const orgStateFrom = (prev: OrgState, reading: AtlasOrgReading | null, isOrgNamed: boolean): OrgState => {
  if (!reading) return prev.name ? prev : { name: null, checkpoints: 1 }
  const isPicked = reading.name !== undefined && (reading.orgCount <= 1 || isOrgNamed)
  if (!isPicked) return prev.name ? prev : { name: null, checkpoints: 1 }
  const checkpoints = reading.profileCount === 0 ? 2 : reading.hasChannel ? 4 : 3
  return { name: reading.name ?? prev.name, checkpoints }
}

/** What the bar draws. */
export type Shown = {
  /** 0 to 1. */
  ratio: number
  /** The pill's text: the phase and the count, or `Done`. */
  label: string
  /** Tick marks: the steps of the run. */
  total: number
  isFinished: boolean
  /** Where the reading comes from: the skill's report, the agents that ran, or the get_status baseline. */
  source: 'skill' | 'agents' | 'baseline'
  /** True once the skill reported. */
  isReported: boolean
}

/** The agents the bar reads: only their type, description and status. */
export type Run = Pick<AgentRun, 'type' | 'description' | 'status'>

const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

/** `aspire:atlas-creator-brief` as a few words: `creator brief`. */
export const agentName = (type: string): string => type.replace(/^aspire:/, '').replace(/^atlas-/, '').replace(/-/g, ' ')

/** What the bar says until the skill reports its first tasks. */
export const INITIALIZING = 'Initializing…'

/** What the bar says when no set of tasks is in process: the last run finished and nothing is running. */
export const AWAITING = 'Awaiting next assignment'

const shown = (ratio: number, label: string, total: number, isFinished: boolean, source: Shown['source']): Shown => ({
  ratio,
  label,
  total,
  isFinished,
  source,
  isReported: source === 'skill',
})

/**
 * The skill's report wins and follows the agents it launched: a task whose
 * title equals a finished agent's description counts as done, and a running
 * agent names the phase when the skill gave none. With no report, the agents
 * that ran are the steps (done out of started). With neither, the bar reads
 * Initializing… at 0% until the first tasks arrive.
 */
export const shownOf = (p: Progress | null, o: OrgState, runs: readonly Run[] = []): Shown => {
  const running = runs.filter(r => r.status === 'running')
  if (p && !p.isFinished) {
    const doneByAgent = (t: ProgressTask): boolean => runs.some(r => r.status === 'done' && norm(r.description) === norm(t.title))
    const doneTasks = p.tasks.filter(t => t.isDone || doneByAgent(t)).length
    const total = Math.max(p.total, p.tasks.length)
    const done = Math.min(total, Math.max(p.done, doneTasks))
    const live = p.tasks.find(t => running.some(r => norm(r.description) === norm(t.title)))?.title ?? (running[0] ? agentName(running[0].type) : '')
    const phase = p.phase || live || (total ? 'Step' : INITIALIZING)
    return shown(total ? Math.min(1, done / total) : 0, [phase, total ? `${done}/${total}` : ''].filter(Boolean).join(' '), total, false, 'skill')
  }
  if (p || runs.length) {
    const isRunsLive = running.length > 0
    if (p && !isRunsLive) return shown(1, AWAITING, p.total, true, 'skill')
    if (runs.length) {
      const total = runs.length
      const done = total - running.length
      if (!isRunsLive) return shown(1, AWAITING, total, true, 'agents')
      return shown(done / total, `${agentName(running[0]!.type)} ${done}/${total}`, total, false, 'agents')
    }
  }
  return shown(0, INITIALIZING, STEPS, false, 'baseline')
}

export const percentOf = (s: Shown): string => `${Math.round(s.ratio * 100)}%`

/** `Aspire: {organization}`, or `Aspire` until one is known. */
export const titleOf = (o: OrgState): string => (o.name ? `Aspire: ${o.name}` : 'Aspire')

/** The terminal's bar: filled and empty cells. */
export const barText = (ratio: number, width: number): string => {
  const filled = Math.round(width * Math.min(1, Math.max(0, ratio)))
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}
