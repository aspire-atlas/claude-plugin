// The agents panel's frame, section headers, and Progress section, as SVG text: no $ and no state. Adapted from
// savvy-progress in claude-kit and plain-view in claude-code-mods (MIT; the notices are at the top of register.tsx).

import type { AgentRun } from '../types'
import { SEMANTIC } from './palette'
import { ASPIRE, CRAB_CSS } from './characters'
import { fitText, modelName, textWidth, xml } from './format'
import type { PlanView } from './plan'
import type { Shown } from './progress'
import { BAR_ROW_H, barShapes, DONE, FONT, PANE_THEME_CSS, twinkleCss } from './render-bar'

// ---------------------------------------------------------------------------
// The agents panel (from savvy-progress), English only.

export const fmtCount = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export const elapsed = (a: AgentRun, at: number): number => (a.endedAt ?? Math.max(at, a.startedAt)) - a.startedAt

export const spanOf = (list: AgentRun[], at: number): number => {
  if (!list.length) return 0
  const start = Math.min(...list.map(a => a.startedAt))
  const end = Math.max(...list.map(a => a.endedAt ?? Math.max(at, a.startedAt)))
  return end - start
}

export const runModel = (a: AgentRun): string => (a.effort ? `${modelName(a.model)} · ${a.effort}` : modelName(a.model))

export const ctxOf = (a: AgentRun): number => (a.contextMax ? Math.min(100, Math.round((a.contextTokens / a.contextMax) * 100)) : 0)

export const norm = (s: string): string => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

// The panel is one accordion, in the look of Claude's own sidebar: sections that show
// only their top edge (a thin line that curves down at both ends), a small title with a
// light chevron after it, a muted value on the right, and sub-accordions inside.
export const ROW_H = 62
export const HEADER_H = 40
export const SUB_H = 28
const CARD_R = 12
export const TAIL = 8

const PANE_CSS = `<style>
${PANE_THEME_CSS}
.live{animation:p 1.6s ease-in-out infinite}@keyframes p{50%{opacity:.3}}
@media (prefers-reduced-motion: reduce){.live{animation:none}}
</style>`

export const svg = (W: number, H: number, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${PANE_CSS}${CRAB_CSS}${body}</svg>`

export const statusMark = (x: number, y: number, status: string, color: string): string => {
  if (status === 'running') return `<circle class="live" cx="${x}" cy="${y}" r="3.5" fill="${color}"/>`
  if (status === 'done') return `<path d="M${x - 5} ${y}l3.5 3.5 6.5-7" fill="none" stroke="${DONE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
  return `<path d="M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8" class="er" stroke-width="1.8" stroke-linecap="round"/>`
}

/** One drawn row of the accordion; `edge` draws a section's top edge, `tail` is the space left under a section's last row. */
export const rowSvg = (W: number, H: number, edge: boolean, tail: number, body: string): string =>
  svg(
    W,
    H + tail,
    `${edge ? `<path class="ln" fill="none" stroke-width="1" d="M0.5 ${CARD_R}A${CARD_R} ${CARD_R} 0 0 1 ${CARD_R} 0.5H${W - CARD_R}A${CARD_R} ${CARD_R} 0 0 1 ${W - 0.5} ${CARD_R}"/>` : ''}${body}`,
  )

/** A thin chevron: down when open, right when collapsed, with its tip near (x, y). */
const chevron = (x: number, y: number, isOpen: boolean): string =>
  `<path class="cv" fill="none" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" d="${isOpen ? `M${x} ${y - 2}l3.5 3.5 3.5-3.5` : `M${x + 1.5} ${y - 4}l3.5 3.5-3.5 3.5`}"/>`

/** A section's header: the title, a light chevron right after it, and a muted value on the right. */
export const headerSvg = (W: number, title: string, summary: string, isOpen: boolean, edge: boolean, tail: number): string => {
  const shownTitle = fitText(title, 13, W - 90)
  const tx = 16 + textWidth(shownTitle, 13) + 7
  const room = Math.max(0, W - 16 - (tx + 12) - 8)
  return rowSvg(
    W,
    HEADER_H,
    edge,
    tail,
    `<text class="t" x="16" y="${edge ? 26 : 24}" font-family="${FONT}" font-size="13" font-weight="500">${xml(shownTitle)}</text>
${chevron(tx, edge ? 24 : 22, isOpen)}
${summary && room > 24 ? `<text class="s" x="${W - 16}" y="${edge ? 26 : 24}" text-anchor="end" font-family="${FONT}" font-size="12" font-variant-numeric="tabular-nums">${xml(fitText(summary, 12, room))}</text>` : ''}`,
  )
}

/** A sub-accordion's header: a chevron on the left, the label, and a count on the right. */
export const subHeaderSvg = (W: number, title: string, count: string, isOpen: boolean, tail: number): string =>
  rowSvg(
    W,
    SUB_H,
    false,
    tail,
    `${chevron(16, 14, isOpen)}
<text class="t" x="36" y="18" font-family="${FONT}" font-size="12">${xml(fitText(title, 12, W - 100))}</text>
<text class="s" x="${W - 16}" y="18" text-anchor="end" font-family="${FONT}" font-size="12" font-variant-numeric="tabular-nums">${xml(count)}</text>`,
  )

/** The progress section's body: the bar the band shows, then one row for each task the skill reported. */
export const PROGRESS_H = 34
export const TASK_H = 22
export const progressBodySvg = (W: number, title: string, shown: Shown, tasks: { title: string; isDone: boolean }[], tail: number): string =>
  rowSvg(
    W,
    PROGRESS_H + tasks.length * TASK_H,
    false,
    tail,
    `<style>${twinkleCss(shown)}</style><g transform="translate(16,${(PROGRESS_H - BAR_ROW_H) / 2 - 2})">${barShapes(title, shown, W - 32)}</g>${tasks
      .map(
        (t, i) =>
          `<rect ${t.isDone ? `fill="${DONE}"` : 'class="sw"'} x="${HEAD_TEXT_X}" y="${PROGRESS_H + i * TASK_H + 6}" width="10" height="10" rx="2.5"/>
<text class="${t.isDone ? 't' : 's'}" x="${HEAD_TEXT_X + 17}" y="${PROGRESS_H + i * TASK_H + 15}" font-family="${FONT}" font-size="12">${xml(fitText(t.title, 12, W - 117))}</text>
<text class="s" x="${W - 16}" y="${PROGRESS_H + i * TASK_H + 15}" text-anchor="end" font-family="${FONT}" font-size="11">${t.isDone ? 'done' : ''}</text>`,
      )
      .join('')}`,
  )

/** The progress section's body for the agent's own plan: the request and its time, the step bar, then a row and a bar for each step. */
const PLAN_HEAD_H = 28
const PLAN_TOP = PLAN_HEAD_H + PROGRESS_H - 12
const PLAN_ROW_H = 24
const PLAN_NOTE_H = 18
const PLAN_DOING_H = 20
// The bar's bullet sits at x 21 with its label at 32; the heading's star shares that centre and the title that
// edge, and a step's bullet is centred under the label's first letter, with the same 7px from bullet to text.
const MARK_X = 21
const HEAD_TEXT_X = 32
const STEP_X = 36
const STEP_TEXT_X = 47
const STOPPED = SEMANTIC.stopped
export const planH = (view: PlanView): number =>
  PLAN_TOP +
  6 +
  (view.before ? PLAN_NOTE_H : 0) +
  view.rows.reduce((n, r) => n + PLAN_ROW_H + (r.kind === 'now' && r.doing ? PLAN_DOING_H : 0), 0) +
  (view.after ? PLAN_NOTE_H : 0) +
  (view.files ? PLAN_NOTE_H : 0)
export const planBodySvg = (W: number, title: string, shown: Shown, view: PlanView, tail: number): string => {
  const accent = view.state === 'stopped' ? STOPPED : view.state === 'done' ? DONE : ASPIRE
  const badgeW = view.badge ? textWidth(`✓ ${view.badge}`, 12) + 8 : 0
  const timeW = textWidth(view.time, 11) + 8
  const font = `font-family="${FONT}"`
  let y = PLAN_TOP
  const parts: string[] = [
    `${
      view.badge
        ? `<text x="16" y="18" ${font} font-size="12" font-weight="500"><tspan fill="${accent}" font-weight="600">${view.state === 'done' ? '✓' : '■'} ${xml(view.badge)}</tspan><tspan class="t" dx="8">${xml(fitText(view.title, 12, W - 32 - badgeW - timeW))}</tspan></text>`
        : `<text x="${MARK_X}" y="18" text-anchor="middle" fill="${accent}" ${font} font-size="11">✦</text>
<text class="t" x="${HEAD_TEXT_X}" y="18" ${font} font-size="12" font-weight="500">${xml(fitText(view.title, 12, W - HEAD_TEXT_X - 16 - timeW))}</text>`
    }
<text class="s" x="${W - 16}" y="18" text-anchor="end" ${font} font-size="11" font-variant-numeric="tabular-nums">${xml(view.time)}</text>
<style>${twinkleCss(shown)}</style><g transform="translate(16,${PLAN_HEAD_H - 2})">${barShapes(title, shown, W - 32)}</g>`,
  ]
  const note = (text: string) => {
    parts.push(`<text class="s" x="${STEP_TEXT_X}" y="${y + 13}" ${font} font-size="11">${xml(text)}</text>`)
    y += PLAN_NOTE_H
  }
  if (view.before) note(`✓ ${view.before}`)
  const statusW = 46
  const miniW = 40
  const barX = W - 16 - statusW - 6 - miniW
  for (const r of view.rows) {
    const color = r.kind === 'done' ? DONE : r.kind === 'now' ? ASPIRE : STOPPED
    const cy = y + 12
    const icon =
      r.kind === 'done'
        ? `<path d="M${STEP_X - 4} ${cy}l3 3 5-6" fill="none" stroke="${DONE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
        : r.kind === 'now'
          ? `<circle cx="${STEP_X}" cy="${cy}" r="4" fill="${ASPIRE}"/>`
          : r.kind === 'halted'
            ? `<rect x="${STEP_X - 3.5}" y="${cy - 3.5}" width="7" height="7" rx="1.5" fill="${STOPPED}"/>`
            : `<circle class="cv" cx="${STEP_X}" cy="${cy}" r="3.5" fill="none" stroke-width="1.2"/>`
    parts.push(
      `${icon}<text class="${r.kind === 'now' ? 't' : r.kind === 'done' ? 't' : 's'}" x="${STEP_TEXT_X}" y="${y + 16}" ${font} font-size="12"${r.kind === 'now' ? ' font-weight="600"' : ''}>${xml(fitText(r.text, 12, barX - STEP_TEXT_X - 10))}</text>
<rect class="k" x="${barX}" y="${y + 10}" width="${miniW}" height="4" rx="2"/>${r.frac > 0 ? `<rect x="${barX}" y="${y + 10}" width="${Math.max(3, Math.round(miniW * r.frac))}" height="4" rx="2" fill="${color}"/>` : ''}
<text ${r.kind === 'now' ? `fill="${ASPIRE}" font-weight="600"` : 'class="s"'} x="${W - 16}" y="${y + 15}" text-anchor="end" ${font} font-size="11" font-variant-numeric="tabular-nums">${xml(r.status)}</text>`,
    )
    y += PLAN_ROW_H
    if (r.kind === 'now' && r.doing) {
      parts.push(`<text class="s" x="${STEP_TEXT_X}" y="${y + 6}" ${font} font-size="11">${xml(fitText(r.doing, 11, W - STEP_TEXT_X - 16))}</text>`)
      y += PLAN_DOING_H
    }
  }
  if (view.after) note(`○ ${view.after}`)
  if (view.files) note(view.files)
  return rowSvg(W, planH(view), false, tail, parts.join('\n'))
}
