// Run with: claude plugin test plugins/aspire-mod
import { expect, test } from 'claude-code/testing'

import { FULL_GRID, SMALL_GRID, logoSvg, spinnerSvg } from './logo'

const squares = (svg: string): number => (svg.match(/<path class="lgp/g) ?? []).length

test('logoSvg animates by default and draws a still mark when asked', () => {
  expect(logoSvg(18)).toContain('@keyframes')
  expect(logoSvg(18, false)).not.toContain('@keyframes')
  expect(logoSvg(18, false)).not.toContain('animation-name')
  expect(logoSvg(18, false)).toContain('viewBox="0 0 512 512"')
})

test('every square has its own cycle, slow enough to read as a shuffle, and none needs script', () => {
  const svg = logoSvg(40, true, FULL_GRID)
  expect(squares(svg)).toBe(FULL_GRID * FULL_GRID)
  expect(squares(logoSvg(18))).toBe(SMALL_GRID * SMALL_GRID)
  const seconds = [...svg.matchAll(/\.lgt\d\{animation-duration:(\d+)s\}/g)].map(m => Number(m[1]))
  expect(seconds.length).toBeGreaterThanOrEqual(5)
  expect(Math.min(...seconds)).toBeGreaterThanOrEqual(7)
  expect(new Set(svg.match(/lgp\d lgt\d lgw\d/g)).size).toBeGreaterThan(20)
  expect(svg).not.toContain('<script')
})

test('the animation holds still for people who ask for less motion', () => {
  expect(logoSvg(18)).toContain('prefers-reduced-motion: reduce')
})

test('the tool-row spinner has two comets round the edge ring, fixed colors, and no script', () => {
  const svg = spinnerSvg(18)
  expect(svg).toContain('width="18"')
  expect((svg.match(/animation-delay/g) ?? []).length).toBe(36)
  expect(svg).toContain('prefers-reduced-motion: reduce')
  expect(svg).toContain('#C8E36B')
  expect(svg).not.toContain('var(')
  expect(svg).not.toContain('<script')
})
