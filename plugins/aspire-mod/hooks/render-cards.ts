// The agents panel's cards (credits, an agent's row and its steps, a roster card), as SVG text: no $ and no state.
// Adapted from savvy-progress in claude-kit (MIT; the notice is at the top of register.tsx).

import type { AgentRun } from '../types'
import type { CreditsView } from './atlas-usage'
import { pairCss, SEMANTIC } from './palette'
import { ASPIRE, breathOf, characterOf, crab } from './characters'
import { logoMarkup } from './logo'
import type { RosterEntry } from './roster'
import { fitText, fmtTime, fmtTokens, textWidth, xml } from './format'
import { DONE, FONT } from './render-bar'
import { ctxOf, elapsed, ROW_H, rowSvg, runModel, statusMark, svg } from './render-pane'

/** The credits bar's amber and red, with dark-mode variants (teal is ASPIRE above 25% left, amber at 25% or less, red at 10% or less or when out). */
const BAR_CSS = pairCss({ 'cb-low': ['fill', SEMANTIC.warn], 'cb-critical': ['fill', SEMANTIC.error] })

/** The credits card, fixed at the top and not collapsible: the Aspire mark and the organization's credits from the latest get_status. */
export const CREDIT_H = 78

/** The Aspire mark, animated: the A and the I in white over the progress bar's twinkling dither, in a 512 box. */
const LOGO = logoMarkup()
const LOGO_SIZE = 56
const LOGO_GAP = 10

export const creditsCardSvg = (W: number, v: CreditsView): string => {
  const pad = 10
  const x0 = LOGO_SIZE + LOGO_GAP
  const cardW = W - x0
  const barW = cardW - pad * 2
  const fill = Math.round(barW * v.ratio)
  const left = x0 + pad
  const right = W - pad
  const text = (x: number, y: number, cls: string, size: number, body: string, extra = '') =>
    `<text class="${cls}" x="${x}" y="${y}" ${extra} font-family="${FONT}" font-size="${size}" font-variant-numeric="tabular-nums">${xml(body)}</text>`
  const bigW = textWidth(v.big, 22) + 6
  return svg(
    W,
    CREDIT_H + 4,
    `<style>${BAR_CSS}</style><g transform="translate(0,${Math.round((CREDIT_H - 4 - LOGO_SIZE) / 2)}) scale(${LOGO_SIZE / 512})"><title>Aspire</title>${LOGO}</g>
<rect class="tile" x="${x0}" y="0" width="${cardW}" height="${CREDIT_H - 4}" rx="8"/>
${text(left, 17, 's', 11, v.title)}
${v.tag ? text(right, 17, 's', 11, v.tag, 'text-anchor="end"') : ''}
<text class="${v.isOver ? 'ef' : 't'}" x="${left}" y="42" font-family="${FONT}" font-size="22" font-weight="600" font-variant-numeric="tabular-nums">${xml(v.big)}</text>
${v.sub ? text(left + bigW, 42, 's', 12, v.sub) : ''}
<rect class="k" x="${left}" y="50" width="${barW}" height="4" rx="2"/>
${v.ratio > 0 ? `<rect ${v.tone === 'ok' ? `fill="${ASPIRE}"` : `class="cb-${v.tone}"`} x="${left}" y="50" width="${Math.max(3, fill)}" height="4" rx="2"/>` : ''}
${v.metaLeft ? text(left, 68, 's', 11, v.metaLeft) : ''}
${v.metaRight ? text(right, 68, 's', 11, v.metaRight, 'text-anchor="end"') : ''}`,
  )
}

/** One line of muted text, for a section with nothing in it yet. */
export const NOTE_H = 28
export const noteSvg = (W: number, note: string, tail: number): string =>
  rowSvg(W, NOTE_H, false, tail, `<text class="s" x="16" y="18" font-family="${FONT}" font-size="12">${xml(fitText(note, 12, W - 32))}</text>`)

/** What an agent reported through aspire_step: `2/5 reading posts`, and the fraction. */
export const stepsOf = (a: AgentRun): { text: string; ratio: number } | null =>
  a.stepTotal ? { text: `${a.stepDone ?? 0}/${a.stepTotal}${a.stepNote ? ` ${a.stepNote}` : ''}`, ratio: Math.min(1, (a.stepDone ?? 0) / a.stepTotal) } : null

/** An agent's task list for its open row: its own task list when it keeps one, else the steps it reported, else nothing yet. */
type AgentTask = { text: string; kind: 'done' | 'now' | 'todo' }
export const agentTasks = (a: AgentRun): AgentTask[] => {
  if (a.items?.length) return a.items.map(i => ({ text: i.subject, kind: i.status === 'completed' ? 'done' : i.status === 'in_progress' ? 'now' : 'todo' }))
  if (!a.stepTotal) return []
  const done = Math.min(a.stepDone ?? 0, a.stepTotal)
  return Array.from({ length: a.stepTotal }, (_, n): AgentTask => {
    const kind = n < done ? 'done' : n === done && a.status === 'running' ? 'now' : 'todo'
    return { text: kind === 'now' && a.stepNote ? a.stepNote : `Step ${n + 1}`, kind }
  })
}
/** The line under an open row that has no task list: what it is doing now while it runs, else that it reported none. */
export const noTasksText = (a: AgentRun): string =>
  a.status === 'running' && a.doing ? `No task list from this agent. Working: ${a.doing} · ${a.calls ?? 0} calls` : 'No tasks reported yet.'
const AGENT_TASK_H = 22
export const agentTasksH = (tasks: AgentTask[]): number => Math.max(1, tasks.length) * AGENT_TASK_H + 8
/** The task rows under an agent's row, drawn like the Progress section's: a bullet, the task, and done on the right. */
export const agentTasksSvg = (W: number, a: AgentRun, tasks: AgentTask[], tail: number): string => {
  const color = characterOf(a).color
  const font = `font-family="${FONT}"`
  const body = tasks.length
    ? tasks
        .map((t, i) => {
          const y = 4 + i * AGENT_TASK_H
          const mark =
            t.kind === 'done'
              ? `<rect fill="${DONE}" x="50" y="${y + 6}" width="10" height="10" rx="2.5"/>`
              : t.kind === 'now'
                ? `<rect fill="${color}" x="50" y="${y + 6}" width="10" height="10" rx="2.5"/>`
                : `<rect class="sw" x="50" y="${y + 6}" width="10" height="10" rx="2.5"/>`
          return `${mark}<text class="${t.kind === 'todo' ? 's' : 't'}" x="67" y="${y + 15}" ${font} font-size="12"${t.kind === 'now' ? ' font-weight="600"' : ''}>${xml(fitText(t.text, 12, W - 67 - 60))}</text>
<text class="s" x="${W - 16}" y="${y + 15}" text-anchor="end" ${font} font-size="11">${t.kind === 'done' ? 'done' : t.kind === 'now' ? 'now' : ''}</text>`
        })
        .join('')
    : `<text class="s" x="50" y="19" ${font} font-size="12">${xml(fitText(noTasksText(a), 12, W - 50 - 16))}</text>`
  return rowSvg(W, agentTasksH(tasks), false, tail, body)
}

export const agentSvg = (W: number, a: AgentRun, at: number, tail: number): string => {
  const character = characterOf(a)
  const ctx = ctxOf(a)
  const textW = W - 50 - 16 - 24
  const meta = [runModel(a)]
  if (a.round > 1) meta.push(`round ${a.round}`)
  if (a.status === 'failed') meta.push('error')
  const steps = stepsOf(a)
  const stats = `${steps ? `${steps.text} · ` : ''}ctx ${ctx}% · ${fmtTokens(a.contextTokens)}  ${fmtTime(elapsed(a, at))}`
  // A finished run is a full bar; a running one shows its reported steps, else its context fill, grey.
  const progress = a.status === 'done' ? 1 : steps ? steps.ratio : null
  const fillW = Math.round(textW * (progress ?? ctx / 100))
  return rowSvg(
    W,
    ROW_H,
    false,
    tail,
    `${crab(10, 12, character, false, a.status === 'running')}
<text class="t" x="50" y="18" font-family="${FONT}" font-size="12" font-weight="500">${xml(fitText(a.description || a.type, 12, textW))}</text>
<text x="50" y="33" font-family="${FONT}" font-size="11"><tspan fill="${character.color}">${xml(fitText(a.type, 11, textW / 2))}</tspan><tspan class="s">  ${xml(meta.join('  ·  '))}</tspan></text>
<text class="s" x="${50 + textW}" y="47" text-anchor="end" font-family="${FONT}" font-size="11" font-variant-numeric="tabular-nums">${stats}</text>
<rect class="k" x="50" y="52" width="${textW}" height="4" rx="2"/><rect${progress === null ? ' class="m"' : ''} x="50" y="52" width="${fillW}" height="4" rx="2"${progress === null ? '' : ` fill="${character.color}"`}/>
${statusMark(W - 22, 14, a.status, character.color)}`,
  )
}

export const CARD_H = 52

/** A crab row for one agent type, indented under its group: costume, name, what it makes, and whether it ran this session. */
export const cardSvg = (W: number, entry: RosterEntry, list: AgentRun[], tail: number, isLeaving = false): string => {
  const character = characterOf({ type: entry.type, model: '' })
  const runs = list.filter(a => a.type === entry.type)
  const isRunning = runs.some(a => a.status === 'running')
  const state = isRunning ? 'running' : runs.length ? `ran ${runs.length}×` : ''
  const textW = W - 62 - 84
  return rowSvg(
    W,
    CARD_H,
    false,
    tail,
    `${crab(24, 8, character, false, isRunning || isLeaving, undefined, isRunning || isLeaving ? undefined : breathOf(entry.type), isLeaving)}
<text class="t" x="62" y="22" font-family="${FONT}" font-size="12" font-weight="500">${xml(fitText(entry.name, 12, textW))}</text>
<text class="s" x="62" y="38" font-family="${FONT}" font-size="11">${xml(fitText(entry.blurb, 11, textW))}</text>
${isRunning ? `<circle class="live" cx="${W - 76}" cy="20" r="3.5" fill="${character.color}"/>` : runs.length ? `<path d="M${W - 80} 20l3.5 3.5 6.5-7" fill="none" stroke="${DONE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
${state ? `<text class="s" x="${W - 16}" y="24" text-anchor="end" font-family="${FONT}" font-size="11">${state}</text>` : ''}`,
  )
}

export const ctxBar = (pct: number, width: number): string => {
  const filled = Math.round((width * pct) / 100)
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}

export const STATUS_GLYPH: Record<string, string> = { running: '●', done: '✓', failed: '✗' }
