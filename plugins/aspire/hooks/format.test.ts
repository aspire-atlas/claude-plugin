// Run with: claude plugin test plugins/aspire
import { expect, test } from 'claude-code/testing'

import { CHARACTERS, CRAB_CSS, characterOf, crab } from './characters'
import { fitText, fmtCountdown, fmtTime, fmtTokens, modelName, windowOf, xml } from './format'

test('fmtTime, fmtCountdown, fmtTokens', () => {
  expect([0, 42_000, 725_000, 3_729_000].map(fmtTime)).toEqual(['0:00', '0:42', '12:05', '1:02:09'])
  expect([3600, 59 * 60 + 12, 5, 0].map(fmtCountdown)).toEqual(['60:00', '59:12', '00:05', 'expired'])
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
  expect(characterOf({ type: 'aspire:atlas-market-signal', model: 'claude-fable-5' }).key).toBe('fable')
  expect(characterOf({ type: 'aspire:atlas-creator-brief', model: 'claude-opus-5-5', effort: 'xhigh' }).key).toBe('heavy')
  expect(characterOf({ type: 'aspire:atlas-creator-brief', model: 'claude-opus-5-5', effort: 'high' }).key).toBe('careful')
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
