/**
 * The one palette every drawing in the mod takes its colors from. Nothing else in the hooks writes a hex: a color is added here, with
 * a role, or it is not used (scripts/check-palette.sh, run in CI, reads every hooks source and fails on a color this file does not hold).
 *
 * Sections:
 * - BRAND: the Aspire Atlas look. The mark's dark tile and teal, and the lime accent (the atlas.aspire.io call-to-action color) for
 *   motion and emphasis.
 * - NEUTRAL: text, tracks, lines and surfaces, each a light and a dark value, switched by `prefers-color-scheme`.
 * - SEMANTIC: done, error and warning keep their meaning under any theme, so they never take a brand color.
 * - THIRD_PARTY: another company's mark, drawn as that company draws it.
 * - ILLUSTRATION: the agent crabs' pixel-art props and costumes.
 */

/** A color with its light and dark values. */
type Pair = { readonly light: string; readonly dark: string }

export const BRAND = {
  /** The mark's teal and the accent of every bar, dot and running state; mid-tone, so it reads on light and dark. */
  teal: '#3B8A82',
  /** The teal lifted for dark surfaces, where the mid teal is too dim for text and thin strokes. */
  tealLift: '#5FB5AB',
  /** The mark's dark tile. */
  tile: '#1c2b2a',
  /** The call-to-action lime: the spinner's comets and emphasis. */
  lime: '#C8E36B',
  white: '#FFFFFF',
} as const

/** The teal accent as a light and dark pair: the status dot, the page icon's lines and check. */
export const ACCENT: Pair = { light: BRAND.teal, dark: BRAND.tealLift }

/** The teal tints the artifact page icon is drawn in. */
export const DOC = {
  page: { light: '#E8F4F2', dark: BRAND.tile },
  pageEdge: { light: '#7DB8B1', dark: BRAND.teal },
  line: ACCENT,
  faint: { light: '#A9D3CE', dark: '#3E6B66' },
  accent: { light: '#2E6E67', dark: BRAND.tealLift },
  check: ACCENT,
  checkMark: { light: BRAND.white, dark: BRAND.tile },
} as const satisfies Record<string, Pair>

export const NEUTRAL = {
  /** Text. */
  ink: { light: '#1F1F1F', dark: '#ECECEC' },
  /** Secondary text. */
  subtle: { light: '#6B6B68', dark: '#8F8F8B' },
  /** Tertiary text and thin icons. */
  muted: { light: '#9A9A96', dark: '#7D7D79' },
  /** The band's secondary labels and its small strokes (a shade off `muted`, kept for contrast on both themes). */
  soft: { light: '#8A8A8A', dark: '#9A9A9A' },
  /** A bar's empty track and a section's edge line. */
  track: { light: '#E4E4E1', dark: '#2C2C2B' },
  /** A bar's step ticks and a chevron. */
  tick: { light: '#B4B4B0', dark: '#5A5A5A' },
  /** An empty checkbox. */
  swatch: { light: '#D4D4D0', dark: '#3D3D3B' },
  /** A card's surface. */
  surface: { light: '#F4F3F0', dark: '#262625' },
} as const satisfies Record<string, Pair>

export const SEMANTIC = {
  /** Done, and a finished bar. */
  done: '#4CAF6E',
  /** Stopped, interrupted, or nothing to show. */
  stopped: '#8A8F8C',
  error: { light: '#D0453F', dark: '#F0706A' },
  warn: { light: '#B86E00', dark: '#F2B134' },
} as const

/** The Slack mark, in Slack's own four colors. */
export const THIRD_PARTY = {
  slackRed: '#E01E5A',
  slackBlue: '#36C5F0',
  slackGreen: '#2EB67D',
  slackYellow: '#ECB22E',
} as const

export const ILLUSTRATION = {
  ink: '#1F1E1D',
  paper: '#F8F6F1',
  cream: '#F4F3EE',
  offwhite: '#F7F6F2',
  frost: '#E6E8EE',
  steel: '#C9CCD2',
  silver: '#8E929A',
  stone: '#888780',
  slate: '#55514C',
  charcoal: '#444441',
  pan: '#4A4A48',
  graphite: '#3A3A3C',
  bone: '#D2D1C8',
  gold: '#F5C542',
  butter: '#FBE08A',
  mustard: '#C99A1E',
  yolk: '#F5B731',
  amber: '#EF9F27',
  bronze: '#BA7517',
  orange: '#D85A30',
  terracotta: '#B45F43',
  red: '#E24B4A',
  pink: '#D4537E',
  violet: '#7F77DD',
  indigo: '#534AB7',
  blue: '#378ADD',
  sky: '#85B7EB',
  cyan: '#2A9DA5',
  green: '#1D9E75',
  wood: '#7A4A26',
  tan: '#A0703F',
  walnut: '#5A3519',
  white: '#FFFFFF',
  /** The dome glass and the magnifier lens: pale blue, see-through. */
  glass: 'rgba(169,214,245,.32)',
  lens: 'rgba(169,214,245,.7)',
} as const

/** `prefers-color-scheme` rules for classes that switch between a pair's light and dark values: `{ t: ['fill', NEUTRAL.ink] }` is `.t{fill:…}` and its dark twin. */
export const pairCss = (rules: Readonly<Record<string, readonly [prop: string, color: Pair]>>): string => {
  const entries = Object.entries(rules)
  const light = entries.map(([cls, [prop, c]]) => `.${cls}{${prop}:${c.light}}`).join('')
  const dark = entries.map(([cls, [prop, c]]) => `.${cls}{${prop}:${c.dark}}`).join('')
  return `${light}\n@media (prefers-color-scheme: dark){${dark}}`
}

const values = (o: object): string[] =>
  Object.values(o).flatMap(v => (typeof v === 'string' ? [v] : typeof v === 'object' && v !== null ? values(v) : []))

/** Every hex the palette holds, lower case (the rgba() illustration tints are not hexes). */
export const PALETTE_HEX: ReadonlySet<string> = new Set(
  [BRAND, DOC, NEUTRAL, SEMANTIC, THIRD_PARTY, ILLUSTRATION].flatMap(values).filter(h => h.startsWith('#')).map(h => h.toLowerCase()),
)
