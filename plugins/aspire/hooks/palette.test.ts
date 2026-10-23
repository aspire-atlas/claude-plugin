// Run with: claude plugin test plugins/aspire
// That every hex in the hooks' sources is in the palette is held by scripts/check-palette.sh: a hooks test cannot read files.
import { expect, test } from 'claude-code/testing'

import { BRAND, DOC, ILLUSTRATION, NEUTRAL, PALETTE_HEX, SEMANTIC, THIRD_PARTY, pairCss } from './palette'

test('the palette holds the Aspire brand colors and a light and dark value for every neutral', () => {
  expect(BRAND.teal).toBe('#3B8A82')
  expect(BRAND.lime).toBe('#C8E36B')
  expect(PALETTE_HEX.has(BRAND.tile.toLowerCase())).toBe(true)
  expect(PALETTE_HEX.has('#ffffff')).toBe(true)
  for (const pair of [...Object.values(NEUTRAL), ...Object.values(DOC)]) {
    expect(pair.light).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(pair.dark).toMatch(/^#[0-9A-Fa-f]{6}$/)
  }
  // No two neutrals share a light value: a near duplicate is a new name for a color that exists.
  const light = Object.values(NEUTRAL).map(p => p.light.toLowerCase())
  expect(new Set(light).size).toBe(light.length)
  expect(SEMANTIC.done).toMatch(/^#/)
  expect(Object.keys(THIRD_PARTY).every(k => k.startsWith('slack'))).toBe(true)
  const art = Object.values(ILLUSTRATION).map(h => h.toLowerCase())
  expect(new Set(art).size).toBe(art.length)
})

test('pairCss writes the light rules, then the dark ones under prefers-color-scheme', () => {
  expect(pairCss({ t: ['fill', NEUTRAL.ink], ln: ['stroke', NEUTRAL.track] })).toBe(
    `.t{fill:${NEUTRAL.ink.light}}.ln{stroke:${NEUTRAL.track.light}}\n@media (prefers-color-scheme: dark){.t{fill:${NEUTRAL.ink.dark}}.ln{stroke:${NEUTRAL.track.dark}}}`,
  )
})
