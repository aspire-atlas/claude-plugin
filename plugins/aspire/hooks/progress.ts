// The progress bar's reading: what the aspire skill reports through the
// aspire_progress tool, or, before it reports, a baseline from the latest Atlas
// get_status result. Pure functions; register.tsx keeps the state and draws.
//
// The reporting model (title, total, done, phase, tasks, finished; fields left
// out keep their value; a finished run or a new title starts over) is adapted
// from savvy-progress (hooks/register.tsx) in claude-kit,
// https://github.com/johnnyvizz/claude-kit, MIT License,
// Copyright (c) 2026 johnnyvizz. The full notice is in ./register.tsx.

import type { OrgState, Progress, ProgressTask } from '../types'
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
  /** True once the skill reported; false while the bar shows the get_status baseline. */
  isReported: boolean
}

/** The skill's report wins; before one, the get_status baseline out of STEPS. */
export const shownOf = (p: Progress | null, o: OrgState): Shown => {
  if (p) {
    if (p.isFinished) return { ratio: 1, label: 'Done', total: p.total, isFinished: true, isReported: true }
    const counted = p.total ? `${p.done}/${p.total}` : ''
    return {
      ratio: p.total ? Math.min(1, p.done / p.total) : 0,
      label: [p.phase || (p.total ? 'Step' : 'Started'), counted].filter(Boolean).join(' '),
      total: p.total,
      isFinished: false,
      isReported: true,
    }
  }
  return { ratio: o.checkpoints / STEPS, label: `Onboarding ${o.checkpoints}/${STEPS}`, total: STEPS, isFinished: false, isReported: false }
}

export const percentOf = (s: Shown): string => `${Math.round(s.ratio * 100)}%`

/** `Aspire: {organization}`, or `Aspire` until one is known. */
export const titleOf = (o: OrgState): string => (o.name ? `Aspire: ${o.name}` : 'Aspire')

/** The terminal's bar: filled and empty cells. */
export const barText = (ratio: number, width: number): string => {
  const filled = Math.round(width * Math.min(1, Math.max(0, ratio)))
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}
