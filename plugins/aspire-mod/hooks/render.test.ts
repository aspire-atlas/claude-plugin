// Run with: claude plugin test plugins/aspire-mod
// The drawings are plain SVG text, so they are tested here directly; how the hooks place them is in register.test.tsx.
import { expect, test } from 'claude-code/testing'

import { COACH_CRAB, PLAIN_CRAB } from './characters'
import { ROSTER } from './roster'
import { shownOf } from './progress'
import { creditsView, readAtlasCredits } from './atlas-usage'
import { PALETTE_HEX } from './palette'
import { DONE, FONT, meterSvg } from './render-bar'
import { coachSvg, crabSvg, dotSvg, noticeSvg } from './render-band'
import { headerSvg, subHeaderSvg } from './render-pane'
import { agentSvg, cardSvg, creditsCardSvg } from './render-cards'

const HEX = /#[0-9a-fA-F]{6}\b/g
const isSvg = (s: string): boolean => s.startsWith('<svg xmlns="http://www.w3.org/2000/svg"') && s.trimEnd().endsWith('</svg>')
const shown = shownOf(null, { name: 'Sample Brand', checkpoints: 4 })

test('the bar: a meter that grows to its slot, and the dot turns done-green only when finished', () => {
  const meter = meterSvg(shown, 300)
  expect(isSvg(meter)).toBe(true)
  expect(meter).toContain('viewBox="0 0 300 ')
  expect(dotSvg(shown)).toContain('class="dt"')
  expect(dotSvg({ ...shown, isFinished: true })).toContain(`fill="${DONE}"`)
})

test('the band: the notice and the coach escape their text and keep to the width given', () => {
  const notice = noticeSvg(PLAIN_CRAB, 'Brief <draft> & co', 420)
  expect(isSvg(notice)).toBe(true)
  expect(notice).toContain('Brief &lt;draft&gt; &amp; co is queued in the prompt box')
  expect(notice).toContain('width="420"')
  const coach = coachSvg('3 of 6 inputs', 'Round 1 of 3', 420)
  expect(isSvg(coach)).toBe(true)
  expect(coach).toContain('Round 1 of 3 · 3 of 6 inputs')
  expect(coach).toContain(FONT)
  expect(isSvg(crabSvg(COACH_CRAB))).toBe(true)
})

test('the panel: headers say open or closed, and every card draws at the width given', () => {
  const open = headerSvg(360, 'Running', '2 agents', true, false, 8)
  const closed = headerSvg(360, 'Running', '2 agents', false, false, 8)
  expect(isSvg(open) && isSvg(closed)).toBe(true)
  expect(open).not.toBe(closed)
  expect(subHeaderSvg(360, 'Creators', '3', true, 8)).toContain('Creators')
  const run = { id: 'a1', type: 'aspire:atlas-creator-brief', description: 'Brief <week>', model: 'claude-sonnet-5-5', status: 'running', startedAt: 0, contextTokens: 50_000, contextMax: 200_000 }
  const agent = agentSvg(360, run as never, 65_000, 8)
  expect(isSvg(agent)).toBe(true)
  expect(agent).toContain('Brief &lt;week&gt;')
  const entry = ROSTER[0]
  expect(entry).toBeDefined()
  if (entry) expect(isSvg(cardSvg(360, entry, [], 8))).toBe(true)
})

test('the credits card: the balance from get_status, and a blank card when there is none', () => {
  const c = readAtlasCredits({ credits: { balance: { granted: 1000, consumed: 3.8, remaining: 996.2, overage: 0 }, grants: [] } })
  const card = creditsCardSvg(360, creditsView(c, null))
  expect(isSvg(card)).toBe(true)
  expect(card).toContain('996.2')
  expect(isSvg(creditsCardSvg(360, creditsView(null, null)))).toBe(true)
})

test('every color in the drawings is one the palette holds', () => {
  const all = [meterSvg(shown, 300), dotSvg(shown), noticeSvg(PLAIN_CRAB, 'x', 300), coachSvg('x', null, 300), headerSvg(300, 'x', 'y', true, true, 8)].join('\n')
  const used = (all.match(HEX) ?? []).map(h => h.toLowerCase())
  expect(used.length).toBeGreaterThan(0)
  expect(used.filter(h => !PALETTE_HEX.has(h))).toEqual([])
})
