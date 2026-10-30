// The progress bar's drawings, as SVG text: no $ and no state. Adapted from savvy-progress in claude-kit (MIT; the
// notice is at the top of register.tsx).

import { BRAND, DOC, NEUTRAL, pairCss, SEMANTIC, THIRD_PARTY } from './palette'
import { ASPIRE } from './characters'
import { fitText, textWidth, xml } from './format'
import { percentOf } from './progress'
import type { Shown } from './progress'

// ---------------------------------------------------------------------------
// The progress bar (from savvy-progress): title, bar, percent, and the crab.

export const DONE = SEMANTIC.done

// The classes each drawing's <style> block switches between light and dark, all from the palette.
const METER_CSS = pairCss({ k: ['fill', NEUTRAL.track], tk: ['fill', NEUTRAL.tick] })
export const BAR_ROW_CSS = pairCss({ t: ['fill', NEUTRAL.ink], m: ['fill', NEUTRAL.soft], k: ['fill', NEUTRAL.track], tk: ['fill', NEUTRAL.tick] })
export const BAND_CSS = pairCss({
  t: ['fill', NEUTRAL.ink],
  m: ['fill', NEUTRAL.soft],
  k: ['fill', NEUTRAL.track],
  tk: ['fill', NEUTRAL.tick],
  pk: ['stroke', NEUTRAL.soft],
  pf: ['fill', NEUTRAL.soft],
})
export const PANE_THEME_CSS = pairCss({
  t: ['fill', NEUTRAL.ink],
  s: ['fill', NEUTRAL.subtle],
  m: ['fill', NEUTRAL.muted],
  k: ['fill', NEUTRAL.track],
  tk: ['fill', NEUTRAL.tick],
  ln: ['stroke', NEUTRAL.track],
  cv: ['stroke', NEUTRAL.muted],
  sw: ['fill', NEUTRAL.swatch],
  tile: ['fill', NEUTRAL.surface],
  er: ['stroke', SEMANTIC.error],
  ef: ['fill', SEMANTIC.error],
})
// The whole row is one SVG: the desktop wraps sibling elements onto new lines,
// so title, bar, percent, and the agent counter with its crab live in one
// drawing, with blank Buttons laid over it to take the presses.
export const BAR_ROW_H = 22
/** The Artifact card's document icon, after the Claude Docs artifact icon: a page whose lines, letter and check draw in one after another, then rest, then repeat. */
export const DOC_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="46" viewBox="0 0 40 46">
<style>
.pg{fill:${DOC.page.light};stroke:${DOC.pageEdge.light}}.ln{fill:${DOC.line.light}}.ls{fill:${DOC.faint.light}}.ab{fill:${DOC.accent.light}}.ck{fill:${DOC.check.light}}.cm{stroke:${DOC.checkMark.light}}
@media (prefers-color-scheme: dark){.pg{fill:${DOC.page.dark};stroke:${DOC.pageEdge.dark}}.ln{fill:${DOC.line.dark}}.ls{fill:${DOC.faint.dark}}.ab{fill:${DOC.accent.dark}}.ck{fill:${DOC.check.dark}}.cm{stroke:${DOC.checkMark.dark}}}
.d{transform-box:fill-box;transform-origin:0 50%;animation:dr 3.6s ease-out infinite both}
.d2{animation-delay:.25s}.d3{animation-delay:.5s}.d4{animation-delay:.75s}.d5{animation-delay:1s}
.pp{transform-box:fill-box;transform-origin:50% 50%;animation:pp 3.6s ease-out infinite both;animation-delay:.6s}
.fa{animation:fa 3.6s ease-out infinite both;animation-delay:.3s}
@keyframes dr{0%,4%{transform:scaleX(0)}22%,86%{transform:scaleX(1)}96%,100%{transform:scaleX(1);opacity:0}}
@keyframes pp{0%,10%{transform:scale(0)}26%{transform:scale(1.25)}34%,86%{transform:scale(1)}96%,100%{transform:scale(1);opacity:0}}
@keyframes fa{0%,6%{opacity:0}22%,86%{opacity:1}96%,100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.d,.pp,.fa{animation:none}}
</style>
<rect class="pg" x="2" y="1" width="36" height="44" rx="7" stroke-width="0.6"/>
<rect class="ln d" x="9" y="7" width="14" height="3.4" rx="1.7"/>
<text class="ab fa" x="8.5" y="26" font-family="Georgia,serif" font-size="15" font-weight="600">A</text>
<rect class="ls d d2" x="19" y="15" width="13" height="2.6" rx="1.3"/>
<rect class="ls d d3" x="19" y="20.5" width="11" height="2.6" rx="1.3"/>
<rect class="ls d d3" x="9" y="28" width="23" height="2.6" rx="1.3"/>
<g class="pp"><circle class="ck" cx="11" cy="35.5" r="2.8"/><path class="cm" d="M9.6 35.6l1.1 1.1 2-2.2" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></g>
<rect class="ls d d4" x="15.5" y="34.2" width="12" height="2.6" rx="1.3"/>
</svg>`
/** The Slack mark (four coloured pill pairs), its own brand colours in light and dark. */
export const SLACK_MARK = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="60 60 150 150"><path fill="${THIRD_PARTY.slackRed}" d="M99.4,151.2c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9c0-7.1,5.8-12.9,12.9-12.9h12.9V151.2z"/><path fill="${THIRD_PARTY.slackRed}" d="M105.9,151.2c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9v32.3c0,7.1-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V151.2z"/><path fill="${THIRD_PARTY.slackBlue}" d="M118.8,99.4c-7.1,0-12.9-5.8-12.9-12.9c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9v12.9H118.8z"/><path fill="${THIRD_PARTY.slackBlue}" d="M118.8,105.9c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H86.5c-7.1,0-12.9-5.8-12.9-12.9s5.8-12.9,12.9-12.9H118.8z"/><path fill="${THIRD_PARTY.slackGreen}" d="M170.6,118.8c0-7.1,5.8-12.9,12.9-12.9c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9h-12.9V118.8z"/><path fill="${THIRD_PARTY.slackGreen}" d="M164.1,118.8c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9V86.5c0-7.1,5.8-12.9,12.9-12.9c7.1,0,12.9,5.8,12.9,12.9V118.8z"/><path fill="${THIRD_PARTY.slackYellow}" d="M151.2,170.6c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9c-7.1,0-12.9-5.8-12.9-12.9v-12.9H151.2z"/><path fill="${THIRD_PARTY.slackYellow}" d="M151.2,164.1c-7.1,0-12.9-5.8-12.9-12.9c0-7.1,5.8-12.9,12.9-12.9h32.3c7.1,0,12.9,5.8,12.9,12.9c0,7.1-5.8,12.9-12.9,12.9H151.2z"/></svg>`
const BAR_H = 16
const CRAB_W = 0
const CELL = 3

// Deterministic noise so the dither does not shimmer between redraws.
const noise = (x: number, y: number): number => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/** Pixels twinkle in four out-of-phase groups; a finished bar settles to a slow glow. */
export const twinkleCss = (shown: Shown): string => `.t0,.t1,.t2,.t3{animation:tw ${shown.isFinished ? 3.2 : 2.2}s ease-in-out infinite}
.t1{animation-duration:${shown.isFinished ? 3.8 : 2.8}s;animation-delay:-.7s}.t2{animation-duration:${shown.isFinished ? 4.4 : 1.9}s;animation-delay:-1.3s}.t3{animation-duration:${shown.isFinished ? 3.5 : 3.3}s;animation-delay:-.4s}
@keyframes tw{0%,100%{opacity:1}50%{opacity:${shown.isFinished ? 0.8 : 0.3}}}
@media (prefers-reduced-motion: reduce){.t0,.t1,.t2,.t3{animation:none}}`

/** The dithered bar and its step pill at (0,0): BAR_W wide, BAR_H tall. */
const meterGroup = (shown: Shown, BAR_W: number): string => {
  const color = shown.isFinished ? DONE : ASPIRE
  const fillW = Math.round(BAR_W * shown.ratio)

  // Dithered fill: sparse at the start, dense toward the head.
  const dots: string[] = []
  const cols = Math.floor(fillW / CELL)
  const rows = Math.floor(BAR_H / CELL)
  for (let c = 0; c < cols; c++) {
    const density = 0.35 + 0.6 * Math.pow(c / Math.max(1, cols), 1.2)
    for (let r = 0; r < rows; r++) {
      if (noise(c, r) < density) dots.push(`<rect class="t${Math.floor(noise(r, c) * 4)}" x="${c * CELL + 1}" y="${r * CELL + 1}" width="2" height="2"/>`)
    }
  }
  const ticks: string[] = []
  for (let i = 1; i < shown.total; i++) {
    const x = Math.round((BAR_W * i) / shown.total)
    if (x > fillW + 4) ticks.push(`<rect x="${x}" y="${BAR_H / 2 - 4}" width="1.5" height="8" rx="0.75"/>`)
  }

  const pill = fitText(shown.label, 11, Math.max(20, BAR_W - 18))
  const pillW = Math.min(BAR_W, Math.round(18 + textWidth(pill, 11)))
  const pillX = Math.max(0, Math.min(BAR_W - pillW, fillW - pillW))

  return `<defs><clipPath id="aspire-bar-clip"><rect x="0" y="0" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath><clipPath id="aspire-fill-clip"><rect x="0" y="0" width="${Math.max(fillW, BAR_H)}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath></defs>
<rect class="k" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/>
<g clip-path="url(#aspire-bar-clip)">
<g clip-path="url(#aspire-fill-clip)"><g fill="${color}">${dots.join('')}</g></g>
<g class="tk">${ticks.join('')}</g>
</g>
<rect x="${pillX}" width="${pillW}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${color}"/>
<text x="${pillX + pillW / 2}" y="${BAR_H / 2 + 4}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="600" fill="${BRAND.white}">${xml(pill)}</text>`
}

/** The bar row's shapes, without a style block: the band wraps them in their own, the panel's progress card in the panel's. */
export const barShapes = (title: string, shown: Shown, W: number): string => {
  // The title takes what it needs, up to 40% of the row; the bar takes the rest.
  const label = fitText(title, 13, Math.max(60, W * 0.4))
  const BAR_X = Math.round(16 + textWidth(label, 13) + 12)
  const BAR_W = Math.max(60, W - BAR_X - 46 - CRAB_W)
  const color = shown.isFinished ? DONE : ASPIRE
  const y0 = (BAR_ROW_H - BAR_H) / 2

  return `<circle cx="5" cy="${BAR_ROW_H / 2}" r="4" fill="${color}"/>
<text class="t" x="16" y="${BAR_ROW_H / 2 + 4.5}" font-family="${FONT}" font-size="13" font-weight="500">${xml(label)}</text>
<g transform="translate(${BAR_X},${y0})">
${meterGroup(shown, BAR_W)}
</g>
<text class="m" x="${W - CRAB_W - 6}" y="${BAR_ROW_H / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-variant-numeric="tabular-nums">${percentOf(shown)}</text>
`
}

/** Wide enough that the host always clamps the drawing to the room the row leaves it, never grows it past that. */
const METER_SLOT_MAX = 4000
/** The widest layout the band's bar is drawn for: its dots stay well under the host's cap on an Svg's source. */
export const METER_LAYOUT_MAX = 1000
/** How much of the estimated room the bar is laid out for: a little under 1, so a small misjudgement shrinks the bar a hair instead of leaving a visible gap. */
export const METER_FIT = 0.95

/**
 * Only the dithered bar and its step pill, for the band's row, where Buttons carry the text either side of it.
 *
 * The host takes a drawing's own width up to its slot, and the band cannot know that room in pixels (a column's width differs by
 * font and screen). So the markup is laid out at `W`, the room estimated from the column count (METER_FIT), and declares a width past
 * any slot with `preserveAspectRatio="xMinYMid meet"`: the host clamps it to the room the row leaves and fits the whole drawing
 * inside it at one scale. `meet` never magnifies: a bar wider than the room shrinks a little, and one that falls short stays at its
 * natural size, so the pill's text is always 11px. (`slice` scaled the drawing up to cover the room, which enlarged the text and
 * cropped the pill's top and bottom whenever the guess ran low.)
 */
export const meterSvg = (shown: Shown, W: number): string => `<svg xmlns="http://www.w3.org/2000/svg" width="${METER_SLOT_MAX}" height="${BAR_ROW_H}" viewBox="0 0 ${W} ${BAR_ROW_H}" preserveAspectRatio="xMinYMid meet">
<style>
${METER_CSS}
${twinkleCss(shown)}
</style>
<g transform="translate(0,${(BAR_ROW_H - BAR_H) / 2})">
${meterGroup(shown, W)}
</g>
</svg>`

/** The system font every drawing in the bar, the band and the panel uses. */
export const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif"
