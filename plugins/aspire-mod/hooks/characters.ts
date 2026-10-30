// The agents panel's characters: pixel crabs, one costume per kind of run.
//
// Copied from savvy-progress (hooks/register.tsx) in claude-kit,
// https://github.com/johnnyvizz/claude-kit, under the MIT License:
//
//   MIT License
//
//   Copyright (c) 2026 johnnyvizz
//
//   Permission is hereby granted, free of charge, to any person obtaining a copy
//   of this software and associated documentation files (the "Software"), to deal
//   in the Software without restriction, including without limitation the rights
//   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.
//
// Pixel Clawd from DockCrab (Clawdy), as the kit credits it: a 24×18 crab on a
// 30×28 grid. Changes from the kit: the costumes are picked by the run's model
// and effort instead of by savvy-flow tier names, the right-to-left mirroring
// is gone, and every costume lives in the one CHARACTERS table below.

import { BRAND, ILLUSTRATION as I } from './palette'
import { AGENT_CHARACTERS, COSTUME_KEYFRAMES, VARIANT_CHARACTERS } from './costumes'

/** What picks a character: the agent type and what the run is on. */
type CharacterRun = {
  type: string
  model: string
  effort?: string
  /** Which concurrent run of the same agent this is; from the second, an Aspire agent wears a variant costume. */
  round?: number
}

/** Puts one pixel rect in a named group: `bd` (default) is the body, `la`/`lb` the legs, anything else a prop. */
export type Fill = (x: number, y: number, w: number, h: number, c: string, cls?: string) => void

export type Character = {
  /** CSS class suffix (`c-<key>`) and the character's name. */
  key: string
  /** Accent: the costume's color, the agent type label and the status dot. */
  color: string
  /** Whether this character stands for the run; the first match in CHARACTERS wins. */
  matches: (run: CharacterRun) => boolean
  /** Draws the character on the 30×28 grid; `accent` is `color`. */
  draw: (f: Fill, accent: string) => void
  /** The character's own motion while its agent runs, scoped to `.c-<key>.run`. */
  css: string
}

// Aspire teal: the mark's brand color, mid-tone so it reads on both light and dark.
export const ASPIRE = BRAND.teal
const INK = I.ink

const stamp = (f: Fill, x: number, y: number, rows: string[], map: Record<string, string>, cls?: string): void =>
  rows.forEach((row, dy) => [...row].forEach((ch, dx) => map[ch] && f(x + dx, y + dy, 1, 1, map[ch] ?? '', cls)))

// `armCls` lets a raised claw travel with the prop it holds.
const crabBody = (f: Fill, armFront = 0, armCls?: string): void => {
  f(7, 10, 16, 12, ASPIRE)
  f(3, 14, 4, 4, ASPIRE)
  f(23, 14 + armFront, 4, 4, ASPIRE, armCls)
  f(9, 12, 2, 2, INK)
  f(19, 12, 2, 2, INK)
  f(7, 22, 2, 4, ASPIRE, 'la')
  f(17, 22, 2, 4, ASPIRE, 'la')
  f(11, 22, 2, 4, ASPIRE, 'lb')
  f(21, 22, 2, 4, ASPIRE, 'lb')
}

const isFamily = (run: CharacterRun, re: RegExp): boolean => re.test(run.model)
const isOpusAt = (run: CharacterRun, efforts: readonly string[]): boolean =>
  isFamily(run, /opus/i) && run.effort !== undefined && efforts.includes(run.effort)

/**
 * THE CAST. To swap the panel's characters, edit this table and nothing else:
 * each entry says which runs it stands for (`matches`, first match wins, keep a
 * catch-all last), how it is drawn (`draw`, on a 30×28 pixel grid), its accent
 * color, and its motion while the agent runs (`css`).
 */
export const CHARACTERS: readonly Character[] = [
  ...AGENT_CHARACTERS,
  {
    // Pirate scouting the code (the Explore agent); the cutlass fences.
    key: 'explore',
    color: I.stone,
    matches: run => run.type === 'Explore',
    draw: f => {
      crabBody(f)
      stamp(f, 5, 3, ['.kk..............kk.', '.kkk....kkkk....kkk.', '..kkkkkkkwwkkkkkkk..', '..kkkkkkkkkkkkkkkk..', '.gggggggggggggggggg.'], { k: I.slate, w: I.paper, g: I.gold })
      f(7, 11, 11, 1, INK); f(18, 11, 4, 3, INK)
      f(27, 6, 1, 9, I.steel, 'it'); f(26, 15, 3, 1, I.wood, 'it')
    },
    css: `.c-explore.run .it{transform-origin:50% 100%;animation:fence .5s ease-in-out infinite}
@keyframes fence{50%{transform:rotate(25deg)}}`,
  },
  {
    // Astronaut in a glass dome (Fable); floats instead of walking, the antenna and the star blink.
    key: 'fable',
    color: I.violet,
    matches: run => isFamily(run, /fable|mythos/i),
    draw: (f, t) => {
      crabBody(f)
      f(6, 7, 18, 1, I.frost); f(5, 8, 1, 14, I.frost); f(24, 8, 1, 14, I.frost); f(6, 22, 18, 1, I.steel)
      f(6, 8, 18, 14, I.glass); f(8, 9, 2, 1, I.white); f(8, 10, 1, 2, I.white)
      f(14, 4, 2, 3, I.steel); f(14, 2, 2, 2, t, 'ant'); f(13, 18, 4, 2, t)
      f(27, 3, 1, 3, I.gold, 'star'); f(26, 4, 3, 1, I.gold, 'star')
    },
    css: `.c-fable.run{animation:float 1s ease-in-out infinite}
.c-fable.run .la,.c-fable.run .lb,.c-fable.run .bd{animation:none}
.c-fable.run .ant{animation:blink 1s steps(1) infinite}
.c-fable.run .star{animation:blink .5s steps(1) infinite -.25s}
@keyframes float{50%{transform:translateY(-2px)}}@keyframes blink{50%{opacity:.15}}`,
  },
  {
    // Detective with a deerstalker (Opus at xhigh or max effort); the magnifier sweeps and glints.
    key: 'heavy',
    color: I.orange,
    matches: run => isOpusAt(run, ['xhigh', 'max']),
    draw: (f, t) => {
      crabBody(f, -4, 'it')
      stamp(f, 6, 3, ['......bbbbbb......', '....bbcbbcbbbb....', '...bbbbbbbbbbbb...', '..bcbbcbbcbbcbbb..', '.bbbbbbbbbbbbbbbb.', 'dddddddddddddddddd'], { b: I.wood, c: I.tan, d: I.walnut })
      f(6, 9, 18, 1, t)
      stamp(f, 23, 1, ['.kkk.', 'k...k', 'k...k', 'k...k', '.kkk.'], { k: I.graphite }, 'it')
      f(24, 2, 3, 3, I.lens, 'it'); f(25, 6, 1, 4, I.wood, 'it'); f(24, 2, 1, 1, I.white, 'gl')
    },
    css: `.c-heavy.run .it{animation:scan 1s steps(1) infinite}
.c-heavy.run .gl{animation:blink 1s steps(1) infinite -.5s}
@keyframes blink{50%{opacity:.15}}
@keyframes scan{25%{transform:translate(-1px,1px)}50%{transform:translate(-2px,2px)}75%{transform:translate(-1px,1px)}}`,
  },
  {
    // Engineer in a hard hat (Opus at high effort); the wrench turns a bolt.
    key: 'careful',
    color: I.bronze,
    matches: run => isOpusAt(run, ['high']),
    draw: (f, t) => {
      crabBody(f)
      stamp(f, 6, 4, ['.....yyyyyyyy.....', '...yyyyyhhyyyyy...', '..yyyyyyhhyyyyyy..', '..yyyyyyhhyyyyyy..', '.yyyyyyyhhyyyyyyy.', 'dddddddddddddddddd'], { y: I.gold, h: I.butter, d: I.mustard })
      f(13, 5, 4, 2, t)
      stamp(f, 0, 10, ['.s.s', 'sss.', '.s..', '.s..'], { s: I.silver }, 'it')
    },
    css: `.c-careful.run .it{transform-origin:100% 100%;animation:twist .5s ease-in-out infinite}
@keyframes twist{50%{transform:rotate(-35deg)}}`,
  },
  {
    // Chef (Opus at medium effort), the toque traced from DockCrab's Sprites.chefHat; tosses the omelette.
    key: 'medium',
    color: I.blue,
    matches: run => isOpusAt(run, ['medium']),
    draw: (f, t) => {
      crabBody(f, -4, 'pan')
      stamp(f, 6, 0, ['........lll.......', '.......lllll......', '.wwwwgwwwwwwgwwwww', 'wwwwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwwwww', 'wwwwwgwwwwwggwwwww', '.wwwwgwwwwwggwwwww', '.dddbbbbbbbbbbbbb.', '.dddbbbbbbbbbbbbb.', '.dddbbbbbbbbbbbbb.'], { w: I.cream, l: I.offwhite, g: I.bone, b: t, d: I.terracotta })
      f(22, 8, 7, 2, I.pan, 'pan'); f(26, 10, 1, 1, I.pan, 'pan'); f(24, 7, 3, 1, I.yolk, 'egg')
    },
    css: `.c-medium.run .pan{transform-origin:0 50%;animation:tilt 1s ease-in-out infinite}
.c-medium.run .egg{animation:flip 1s ease-in-out infinite}
@keyframes tilt{20%,40%{transform:rotate(-12deg)}}@keyframes flip{30%{transform:translateY(-5px) scaleY(-1)}60%{transform:translateY(0)}}`,
  },
  {
    // Racer in a helmet (Opus at low effort); runs at double pace, the checkered flag flutters.
    key: 'light',
    color: I.green,
    matches: run => isOpusAt(run, ['low']),
    draw: (f, t) => {
      crabBody(f, -4)
      stamp(f, 6, 5, ['....rrrrrrrrrr....', '..rrrrrrwwrrrrrr..', '.rrrrrrrwwrrrrrrr.', '.rrrrrrrwwrrrrrrr.', '.rrrrrrrwwrrrrrrr.', '.kkkkkkkkkkkkkkkkr'], { r: t, w: I.paper, k: INK })
      f(25, 1, 1, 9, I.silver)
      stamp(f, 26, 1, ['wkwk', 'kwkw', 'wkwk'], { w: I.paper, k: INK }, 'flag')
    },
    css: `.c-light.run .la{animation-duration:.25s}.c-light.run .lb{animation-duration:.25s;animation-delay:-.125s}
.c-light.run .flag{transform-origin:0 50%;animation:wave .25s steps(1) infinite}
@keyframes wave{50%{transform:skewY(-12deg) scaleX(.85)}}`,
  },
  {
    // The plain crab: every other run (Sonnet, Haiku, Opus before its effort is known). Keep it last.
    key: 'other',
    color: I.stone,
    matches: () => true,
    draw: f => crabBody(f),
    css: '',
  },
]

const FALLBACK: Character = CHARACTERS[CHARACTERS.length - 1] as Character

export const characterOf = (run: CharacterRun): Character => {
  const own = CHARACTERS.find(c => c.matches(run)) ?? FALLBACK
  // A second run of the same Aspire agent wears a variant, so the two are told apart in the panel.
  if (run.round && run.round > 1 && AGENT_CHARACTERS.includes(own)) return VARIANT_CHARACTERS[(run.round - 2) % VARIANT_CHARACTERS.length] ?? own
  return own
}

/**
 * The prompt coach: a crab in a blue coach cap with a whistle on a red lanyard and a clipboard whose pencil taps.
 * Not an agent and not in CHARACTERS (characterOf never returns it); only the coach card draws it.
 */
export const COACH_CRAB: Character = {
  key: 'coach',
  color: I.blue,
  matches: () => false,
  draw: f => {
    crabBody(f)
    stamp(f, 8, 7, ['..bbbbbbbbbb..', '.bbbbbwwbbbbb.', 'bbbbbbbbbbbbbb'], { b: I.blue, w: I.paper }, 'hd')
    stamp(f, 4, 9, ['wwwww'], { w: I.paper }, 'hd')
    stamp(f, 12, 14, ['r......r', '.r....r.', '..r..r..', '...rr...'], { r: I.red })
    stamp(f, 13, 18, ['yyyyy', 'ykyyy', 'yyyy.'], { y: I.gold, k: INK }, 'wh')
    stamp(f, 22, 5, ['..gggg..', 'nnnnnnnn', 'nwwwwwwn', 'nwkkkkwn', 'nwwwwwwn', 'nwkkkwwn', 'nwwwwwwn', 'nwwwwwwn', 'nnnnnnnn'], { g: I.steel, n: I.wood, w: I.paper, k: I.slate }, 'it')
    stamp(f, 24, 11, ['....p', '...y.', '..y..', '.y...', 'k....'], { p: I.pink, y: I.gold, k: INK }, 'pn')
  },
  css: `.c-coach.run .pn{animation:tap .5s steps(1) infinite}
.c-coach.run .wh{animation:swing .5s ease-in-out infinite}
@keyframes tap{50%{transform:translate(-1px,1px)}}@keyframes swing{50%{transform:translateY(1px)}}`,
}

/** The plain Aspire-green crab, the one the progress bar carries. */
export const PLAIN_CRAB: Character = FALLBACK

/** The grid is 30 units wide, props included; drawn at this scale. */
const CRAB_SCALE = 1.1

// Pure CSS, run by the compositor: no redraws. Periods divide one second, so the
// once-a-second redraw of a running row restarts them in phase. Every crab walks;
// each character adds its own motion on top.
export const CRAB_CSS = `<style>
.run .la{animation:st .5s steps(1) infinite}.run .lb{animation:st .5s steps(1) infinite -.25s}
.run .bd{animation:bob .5s steps(1) infinite -.125s}
.run g,.idle g,.go{transform-box:fill-box}
.idle .bd{animation:breathe var(--p,2.6s) ease-in-out infinite;animation-delay:var(--d,0s)}
.go{animation:out .9s cubic-bezier(.4,0,1,1) forwards}
@keyframes breathe{50%{transform:translateY(-1px)}}@keyframes out{to{transform:translateX(380px);opacity:0}}
@media (prefers-reduced-motion: reduce){.idle .bd,.go{animation:none}}
@keyframes st{50%{transform:translateY(-1px)}}@keyframes bob{50%{transform:translateY(1px)}}
${COSTUME_KEYFRAMES}
${CHARACTERS.map(c => c.css).filter(Boolean).join('\n')}
${COACH_CRAB.css}
${VARIANT_CHARACTERS.map(c => c.css).join('\n')}
@media (prefers-reduced-motion: reduce){.run,.run g{animation:none!important}}
</style>`

/** One idle crab's breathing: how long a breath takes and where in it the crab starts, in seconds. */
type Breath = { period: number; delay: number }

/** A stable rate and start for an agent type, so the crabs in a list never breathe in step. */
export const breathOf = (type: string): Breath => {
  let h = 2166136261
  for (const c of type) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return { period: 2.2 + (h % 121) / 100, delay: ((h >>> 7) % 300) / 100 }
}

/**
 * One character as SVG markup at (x, y). Body and props nest inside `bd` so a
 * prop rides the bob and adds its own motion; legs stay outside it.
 */
export const crab = (x: number, y: number, character: Character, dim = false, isWalking = false, scale = CRAB_SCALE, breathe?: Breath, isLeaving = false): string => {
  const groups = new Map<string, string[]>([['bd', []]])
  const f: Fill = (cx, cy, w, h, c, cls = 'bd') => {
    if (!groups.has(cls)) groups.set(cls, [])
    groups.get(cls)?.push(`<rect x="${cx}" y="${cy}" width="${w}" height="${h}" fill="${c}"/>`)
  }
  character.draw(f, character.color)
  const group = (cls: string) => `<g class="${cls}">${(groups.get(cls) ?? []).join('')}</g>`
  const props = [...groups.keys()].filter(k => k !== 'bd' && k !== 'la' && k !== 'lb')
  const body = `<g class="bd">${(groups.get('bd') ?? []).join('')}${props.map(group).join('')}</g>`
  return `<g transform="translate(${x},${y}) scale(${scale})" opacity="${dim ? 0.45 : 1}" shape-rendering="crispEdges"><g class="c-${character.key}${isWalking ? ' run' : breathe === undefined ? '' : ' idle'}${isLeaving ? ' go' : ''}"${breathe === undefined ? '' : ` style="--d:-${breathe.delay}s;--p:${breathe.period}s"`}>${body}${group('la')}${group('lb')}</g></g>`
}
