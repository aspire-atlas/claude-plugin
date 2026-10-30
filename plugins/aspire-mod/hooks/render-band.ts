// The band's drawings (the agent count, the notice, the prompt coach, the crab and the dot) as SVG text: no $ and
// no state. Adapted from session-band and savvy-progress in claude-kit (MIT; the notice is at the top of register.tsx).

import { ACCENT, NEUTRAL, pairCss } from './palette'
import { COACH_CRAB, crab, CRAB_CSS } from './characters'
import type { Character } from './characters'
import { fitText, textWidth, xml } from './format'
import type { Shown } from './progress'
import { BAND_CSS, BAR_ROW_CSS, BAR_ROW_H, barShapes, DONE, FONT, twinkleCss } from './render-bar'

// The band's right edge: the agent counter (a walking crab and the count) after the percent.
const BAND_CRAB_SCALE = 0.6
export const BAND_CRAB_W = 36 * BAND_CRAB_SCALE
/** The crab and the count sit together at the row's right edge: this is the room they take, gaps included. */
/** The far right edge: the right-panel icon that opens the side panel. */
const EDGE_W = 30
const panelIcon = (x: number): string => {
  const y = (BAR_ROW_H - 14) / 2
  return `<g transform="translate(${x},${y})"><rect class="pk" x="0.75" y="0.75" width="18.5" height="12.5" rx="2.5" fill="none" stroke-width="1.5"/><path class="pf" d="M12 1.5h5.5a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H12z"/></g>`
}
const countWidth = (count: number): number => Math.ceil(8 + textWidth(`×${count}`, 12.5) + 4 + BAND_CRAB_W + 10)

/**
 * The queued notice: one Svg row with the pressed agent's own animated crab, and the text.
 * Light and dark values come from the media query; the crab's motion stops under prefers-reduced-motion (CRAB_CSS).
 */
export const NOTICE_H = 26
export const noticeText = (name: string): string => `${name} is queued in the prompt box. Press Enter to run it.`
export const noticeSvg = (character: Character, name: string, W: number): string => {
  const scale = 0.7
  const textX = 10 + 36 * scale + 8
  const text = fitText(noticeText(name), 13, Math.max(40, W - textX - 8))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${NOTICE_H}" viewBox="0 0 ${W} ${NOTICE_H}">
<style>
${pairCss({ nt: ['fill', NEUTRAL.ink] })}
</style>
${CRAB_CSS}
${crab(10, (NOTICE_H - 30 * scale) / 2, character, false, true, scale)}
<text class="nt" x="${textX}" y="${NOTICE_H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(text)}</text>
</svg>`
}

/**
 * The prompt coach card: one Svg row like the notice, with the coach crab, the round label (when there is one) and the verdict.
 * Same light and dark teal; the crab's motion stops under prefers-reduced-motion (CRAB_CSS).
 */
export const COACH_H = 26
export const coachLabel = (verdict: string, step: string | null): string => (step ? `${step} · ${verdict}` : verdict)
export const coachSvg = (verdict: string, step: string | null, W: number): string => {
  const scale = 0.7
  const textX = 10 + 36 * scale + 8
  const text = fitText(coachLabel(verdict, step), 13, Math.max(40, W - textX - 8))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${COACH_H}" viewBox="0 0 ${W} ${COACH_H}">
<style>
${pairCss({ ct: ['fill', NEUTRAL.ink] })}
</style>
${CRAB_CSS}
${crab(10, (COACH_H - 30 * scale) / 2, COACH_CRAB, false, true, scale)}
<text class="ct" x="${textX}" y="${COACH_H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(text)}</text>
</svg>`
}

/** The band's whole row in one drawing: title, bar, percent, and the agent counter with its crab. */
const bandSvg = (title: string, shown: Shown, W: number, count: number, character: Character): string => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}">
<style>
${BAND_CSS}
${twinkleCss(shown)}
</style>
${CRAB_CSS}
${barShapes(title, shown, W - EDGE_W - countWidth(count))}
${crab(W - EDGE_W - countWidth(count) + 10, (BAR_ROW_H - 30 * BAND_CRAB_SCALE) / 2, character, false, true, BAND_CRAB_SCALE)}
<text class="m" x="${W - EDGE_W - 8}" y="${BAR_ROW_H / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-variant-numeric="tabular-nums">×${count}</text>
${panelIcon(W - EDGE_W + 4)}
</svg>`

/** The bar's agent counter crab alone, for the band's row between the percent Button and the count Button: an animated, randomly drawn crab. */
export const crabSvg = (character: Character): string => {
  const W = Math.ceil(BAND_CRAB_W + 4)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}">
${CRAB_CSS}
${crab(2, (BAR_ROW_H - 30 * BAND_CRAB_SCALE) / 2, character, false, true, BAND_CRAB_SCALE)}
</svg>`
}

/** The title's bullet as a tiny Svg (a Button holds only text, so its dot would be plain white): Aspire teal, the done green once finished. */
export const dotSvg = (shown: Shown): string => {
  const fill = shown.isFinished ? `fill="${DONE}"` : `class="dt"`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="${BAR_ROW_H}" viewBox="0 0 12 ${BAR_ROW_H}">
<style>${pairCss({ dt: ['fill', ACCENT] })}</style>
<circle ${fill} cx="6" cy="${BAR_ROW_H / 2}" r="4"/>
</svg>`
}

const barSvg = (title: string, shown: Shown, W: number): string => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}">
<style>
${BAR_ROW_CSS}
${twinkleCss(shown)}
</style>
${barShapes(title, shown, W)}
</svg>`

// ---------------------------------------------------------------------------
// The band above the prompt (from session-band), now the bar's second row.

// Responses shorter than this are mostly tool-call stubs: their timing is noise.
export const MIN_TOKENS = 20
// A response that arrived in one burst cannot be timed; such readings are dropped.
export const MIN_SECONDS = 0.5
export const MAX_SPEED = 1000

// Density by the band's width in cells, so the row shrinks instead of wrapping:
// 0 full; 1 no context bar; 2 compact turn/speed, short Atlas label; 3 no turn,
// smaller icons; 4 no speed. Thresholds are minimum bodyColumns for each tier.
const TIER_MIN = [96, 80, 64, 50] as const
const GAPS = [3, 2, 2, 1, 1] as const
const tierFor = (columns: number): number => {
  const i = TIER_MIN.findIndex(min => columns >= min)
  return i === -1 ? TIER_MIN.length : i
}
