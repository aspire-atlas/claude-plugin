// The animated Aspire mark: the AI letters over a field of squares that shuffle slowly. Every square fades in and out on its own
// cycle (7 to 23 seconds, in one of four shapes, from its own starting point), so the pattern keeps changing and takes minutes
// to repeat. The two files in assets/ are this output, written at 20 and 10 squares across:
//   bun -e "import {logoSvg} from './plugins/aspire/hooks/logo.ts'; await Bun.write('plugins/aspire/assets/aspire-animated.svg', logoSvg(512, true, 20)); await Bun.write('plugins/aspire/assets/aspire-animated-small.svg', logoSvg(512, true, 10))"
// Change the mark here, rewrite both files, and keep them in step.

/** Squares across in the small mark, the size the tool row and the panel use. */
export const SMALL_GRID = 10
/** Squares across in the full mark pasted into pages. */
export const FULL_GRID = 20

// Deterministic noise, so a redraw gives the same pattern.
const noise = (x: number, y: number): number => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

const SHAPES = 4
const SECONDS = [7, 11, 13, 17, 19, 23]
const PHASES = 8

const dots = (grid: number): string => {
  const cell = 512 / grid
  const size = (cell * 0.8).toFixed(1)
  const out: string[] = []
  for (let c = 0; c < grid; c++) {
    for (let r = 0; r < grid; r++) {
      const p = Math.floor(noise(c, r) * SHAPES)
      const t = Math.floor(noise(r + 31, c + 7) * SECONDS.length)
      const w = Math.floor(noise(c + 91, r + 53) * PHASES)
      out.push(`<path class="lgp${p} lgt${t} lgw${w}" d="M${(c * cell + cell * 0.1).toFixed(1)} ${(r * cell + cell * 0.1).toFixed(1)}h${size}v${size}h-${size}z"/>`)
    }
  }
  return out.join('')
}

// Four shapes of fade, each with a different rhythm: two soft waves, one long dark with a sharp flash, one slow breath.
const FADES = `@keyframes lga{0%{opacity:0}18%{opacity:.9}34%{opacity:.15}58%{opacity:.7}76%{opacity:.05}100%{opacity:0}}
@keyframes lgb{0%{opacity:.1}22%{opacity:.6}40%{opacity:0}66%{opacity:1}84%{opacity:.2}100%{opacity:.1}}
@keyframes lgc{0%,40%{opacity:0}48%{opacity:1}56%{opacity:.1}64%,100%{opacity:0}}
@keyframes lgd{0%,100%{opacity:0}50%{opacity:.8}}`
const ANIMATED = `.lgg path{animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-fill-mode:both}
.lgp0{animation-name:lga}.lgp1{animation-name:lgb}.lgp2{animation-name:lgc}.lgp3{animation-name:lgd}
${SECONDS.map((s, i) => `.lgt${i}{animation-duration:${s}s}`).join('')}
${Array.from({ length: PHASES }, (_, i) => `.lgw${i}{animation-delay:-${(i * 2.9).toFixed(1)}s}`).join('')}
${FADES}`
// A still mark, and the mark for people who ask for less motion: each square holds one of four levels.
const STILL = `.lgp0{opacity:.55}.lgp1{opacity:.3}.lgp2{opacity:.12}.lgp3{opacity:.42}`
const REDUCED = `@media (prefers-reduced-motion: reduce){.lgg path{animation:none}${STILL}}`

/** The mark's shapes in a 512 box, with the style that colors them (and animates them unless `animated` is false): for a group inside another Svg. */
export const logoMarkup = (animated = true, grid = SMALL_GRID): string => `<style>
.lgk{fill:#1c2b2a}.lgg{fill:#3B8A82}
${animated ? `${ANIMATED}\n${REDUCED}` : STILL}
</style>
<defs><clipPath id="lgsq"><rect width="512" height="512" rx="96"/></clipPath></defs>
<g clip-path="url(#lgsq)"><rect class="lgk" width="512" height="512"/><g class="lgg">${dots(grid)}</g></g>
<g fill="#fff" fill-rule="evenodd"><path d="M62 413 L183 98 L236 98 L356 413 L296 413 L275 354 C235 392 190 413 130 413 Z M212 185 L257 296 C225 330 185 354 145 358 Z"/><rect x="365" y="98" width="64" height="316"/></g>`

/** The logo as a square Svg document, `size` CSS pixels a side. */
export const logoSvg = (size: number, animated = true, grid = SMALL_GRID): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512" role="img" aria-label="Aspire Atlas">${logoMarkup(animated, grid)}</svg>`
