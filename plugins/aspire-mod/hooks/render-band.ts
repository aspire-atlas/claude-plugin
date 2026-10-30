// The band's drawings (the agent count, the notice, the prompt coach, the crab and the dot) as SVG text: no $ and
// no state. Adapted from session-band and savvy-progress in claude-kit (MIT; the notice is at the top of register.tsx).

import { ACCENT, NEUTRAL, pairCss } from './palette'
import { COACH_CRAB, crab, CRAB_CSS } from './characters'
import type { Character } from './characters'
import { fitText, xml } from './format'
import type { Shown } from './progress'
import { BAR_ROW_H, DONE, FONT } from './render-bar'

// The band's right edge: the agent counter (a walking crab and the count) after the percent.
const BAND_CRAB_SCALE = 0.6
export const BAND_CRAB_W = 36 * BAND_CRAB_SCALE

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

// ---------------------------------------------------------------------------
// The band above the prompt (from session-band), now the bar's second row.

// Responses shorter than this are mostly tool-call stubs: their timing is noise.
export const MIN_TOKENS = 20
// A response that arrived in one burst cannot be timed; such readings are dropped.
export const MIN_SECONDS = 0.5
export const MAX_SPEED = 1000
