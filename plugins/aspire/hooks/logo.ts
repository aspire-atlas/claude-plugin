// The animated Aspire mark: the AI letters over the progress bar's twinkling dither (assets/aspire-animated.svg, at a grid
// that stays legible at row height).

const GRID = 10
const CELL = 512 / GRID

// Deterministic noise, the bar's own, so the dither does not shimmer between redraws.
const noise = (x: number, y: number): number => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

const DOTS = (() => {
  const out: string[] = []
  for (let c = 0; c < GRID; c++) {
    for (let r = 0; r < GRID; r++) {
      if (noise(c, r) >= 0.55) continue
      const base = (0.45 + 0.55 * noise(c + 57, r + 13)).toFixed(2)
      out.push(`<rect class="lg${Math.floor(noise(r, c) * 4)}" fill-opacity="${base}" x="${(c * CELL + CELL * 0.1).toFixed(1)}" y="${(r * CELL + CELL * 0.1).toFixed(1)}" width="${(CELL * 0.8).toFixed(1)}" height="${(CELL * 0.8).toFixed(1)}"/>`)
    }
  }
  return out.join('')
})()

/** The mark's shapes in a 512 box, with the style that animates them: for a group inside another Svg. */
export const logoMarkup = (): string => `<style>
.lgk{fill:#1c2b2a}.lgd{fill:#3B8A82}
.lg0,.lg1,.lg2,.lg3{animation:lgtw 2.2s ease-in-out infinite}
.lg1{animation-duration:2.8s;animation-delay:-.7s}.lg2{animation-duration:1.9s;animation-delay:-1.3s}.lg3{animation-duration:3.3s;animation-delay:-.4s}
@keyframes lgtw{0%,100%{opacity:1}50%{opacity:.3}}
@media (prefers-reduced-motion: reduce){.lg0,.lg1,.lg2,.lg3{animation:none}}
</style>
<defs><clipPath id="lgsq"><rect width="512" height="512" rx="96"/></clipPath></defs>
<g clip-path="url(#lgsq)"><rect class="lgk" width="512" height="512"/><g class="lgd">${DOTS}</g></g>
<g fill="#fff" fill-rule="evenodd"><path d="M62 413 L183 98 L236 98 L356 413 L296 413 L275 354 C235 392 190 413 130 413 Z M212 185 L257 296 C225 330 185 354 145 358 Z"/><rect x="365" y="98" width="64" height="316"/></g>`

/** The logo as a square Svg document, `size` CSS pixels a side. */
export const logoSvg = (size: number): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${logoMarkup()}</svg>`
