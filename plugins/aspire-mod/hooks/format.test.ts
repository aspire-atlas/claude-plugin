// Run with: claude plugin test plugins/aspire-mod
import { expect, test } from 'claude-code/testing'

import { CHARACTERS, COACH_CRAB, CRAB_CSS, PLAIN_CRAB, characterOf, crab } from './characters'
import { AGENT_CHARACTERS, COSTUMES, VARIANT_CHARACTERS } from './costumes'
import { ROSTER } from './roster'
import { fitText, fmtTime, fmtTokens, modelName, windowOf, xml } from './format'

test('fmtTime, fmtTokens', () => {
  expect([0, 42_000, 725_000, 3_729_000].map(fmtTime)).toEqual(['0:00', '0:42', '12:05', '1:02:09'])
  expect([950, 12_400, 1_200_000].map(fmtTokens)).toEqual(['950', '12k', '1.2M'])
})

test('modelName and windowOf', () => {
  expect(modelName('claude-opus-5-5')).toBe('Opus 5.5')
  expect(modelName('claude-sonnet-4-6[1m]')).toBe('Sonnet 4.6')
  expect(modelName('claude-fable-5')).toBe('Fable 5')
  expect(modelName('some-other-model')).toBe('some-other-model')
  expect(windowOf('claude-haiku-4-5')).toBe(200_000)
  expect(windowOf('claude-opus-5-5')).toBe(1_000_000)
})

test('xml and fitText', () => {
  expect(xml('<a & "b">')).toBe('&lt;a &amp; &quot;b&quot;&gt;')
  expect(fitText('short', 13, 500)).toBe('short')
  const cut = fitText('a description far too long for a narrow slot', 13, 80)
  expect(cut.endsWith('…')).toBe(true)
  expect(cut.length).toBeLessThan(20)
})

test('characters: one table, first match wins, a catch-all last', () => {
  expect(characterOf({ type: 'Explore', model: 'claude-opus-5-5', effort: 'high' }).key).toBe('explore')
  expect(characterOf({ type: 'general-purpose', model: 'claude-fable-5' }).key).toBe('fable')
  expect(characterOf({ type: 'general-purpose', model: 'claude-opus-5-5', effort: 'xhigh' }).key).toBe('heavy')
  expect(characterOf({ type: 'general-purpose', model: 'claude-opus-5-5', effort: 'high' }).key).toBe('careful')
  expect(characterOf({ type: 'general-purpose', model: 'claude-opus-5-5', effort: 'medium' }).key).toBe('medium')
  expect(characterOf({ type: 'general-purpose', model: 'claude-opus-5-5', effort: 'low' }).key).toBe('light')
  expect(characterOf({ type: 'general-purpose', model: 'claude-opus-5-5' }).key).toBe('other')
  expect(characterOf({ type: 'general-purpose', model: 'claude-sonnet-5' }).key).toBe('other')
  expect(CHARACTERS[CHARACTERS.length - 1]?.matches({ type: 'x', model: 'y' })).toBe(true)
  expect(new Set(CHARACTERS.map(c => c.key)).size).toBe(CHARACTERS.length)
})

test('characters: each draws, and a running one walks', () => {
  for (const c of CHARACTERS) {
    const idle = crab(0, 0, c)
    expect(idle).toContain(`class="c-${c.key}"`)
    expect(idle).not.toContain('undefined')
    expect(crab(0, 0, c, false, true)).toContain(`class="c-${c.key} run"`)
  }
  expect(CRAB_CSS).toContain('@keyframes blink')
})

test('coach crab: drawn with its class, its props and its motion, outside the agent cast', () => {
  const svg = crab(0, 0, COACH_CRAB, false, true)
  expect(svg).toContain('class="c-coach run"')
  for (const g of ['hd', 'wh', 'it', 'pn']) expect(svg).toContain(`<g class="${g}">`)
  expect(svg).not.toContain('undefined')
  expect(svg).not.toBe(crab(0, 0, PLAIN_CRAB, false, true))
  expect(CRAB_CSS).toContain('.c-coach.run .pn{animation:tap')
  expect(CRAB_CSS).toContain('prefers-reduced-motion')
  expect(CHARACTERS).not.toContain(COACH_CRAB)
  expect(characterOf({ type: 'aspire:aspire', model: '' })).not.toBe(COACH_CRAB)
})

test('costumes: every Aspire agent has its own influencer costume, and a second run wears a variant', () => {
  expect(COSTUMES).toHaveLength(34)
  expect(AGENT_CHARACTERS).toHaveLength(27)
  expect(VARIANT_CHARACTERS).toHaveLength(7)
  for (const entry of ROSTER) expect(characterOf({ type: entry.type, model: '' }).key).toMatch(/^inf-/)
  expect(new Set(ROSTER.map(r => characterOf({ type: r.type, model: '' }).key)).size).toBe(ROSTER.length)
  // The model no longer decides an Aspire agent's costume.
  expect(characterOf({ type: 'aspire:atlas-creator-brief', model: 'claude-opus-5-5', effort: 'xhigh' }).key).toBe('inf-clapper')
  const second = characterOf({ type: 'aspire:atlas-creator-brief', model: '', round: 2 })
  expect(second.key).toMatch(/^inf-/)
  expect(second.key).not.toBe('inf-clapper')
  // Not an Aspire agent: round changes nothing.
  expect(characterOf({ type: 'general-purpose', model: 'claude-opus-5-5', effort: 'low', round: 3 }).key).toBe('light')
  // Every costume's props draw inside the grid.
  for (const c of COSTUMES) {
    for (const rows of [c.held, c.head]) {
      for (const r of rows ?? []) expect(r).toMatch(/^[kwgdyarbltponv.]+$/)
    }
    expect((c.held ?? []).length === 0 || (c.held ?? []).length === 9).toBe(true)
  }
})
