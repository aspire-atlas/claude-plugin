// Run with: claude plugin test plugins/aspire
import { expect, test } from 'claude-code/testing'

import { barText, mergeProgress, orgStateFrom, percentOf, shownOf, titleOf } from './progress'

const NO_ORG = { name: null, checkpoints: 0 }

test('shownOf: before the skill reports, the get_status baseline out of 6', () => {
  expect(shownOf(null, NO_ORG)).toMatchObject({ ratio: 0, label: 'Onboarding 0/6', isReported: false })
  const two = shownOf(null, { name: 'Sample Brand', checkpoints: 2 })
  expect(percentOf(two)).toBe('33%')
  expect(percentOf(shownOf(null, { name: 'Sample Brand', checkpoints: 4 }))).toBe('67%')
})

test('shownOf: the reported done and total win over the baseline', () => {
  const p = mergeProgress(null, { title: 'Onboarding', total: 6, done: 4, phase: 'Brand context' })
  const s = shownOf(p, { name: 'Sample Brand', checkpoints: 2 })
  expect(s).toMatchObject({ label: 'Brand context 4/6', isReported: true, total: 6 })
  expect(percentOf(s)).toBe('67%')
  expect(shownOf(mergeProgress(p, { finished: true }), NO_ORG)).toMatchObject({ ratio: 1, label: 'Done', isFinished: true })
})

test('mergeProgress: fields left out keep their value; a finished run or a new title starts over', () => {
  const a = mergeProgress(null, { title: 'Onboarding', total: 6, done: 1, phase: 'Connection' })
  const b = mergeProgress(a, { done: 3 })
  expect(b).toMatchObject({ title: 'Onboarding', total: 6, done: 3, phase: 'Connection' })
  // done never passes total; junk is ignored.
  expect(mergeProgress(b, { done: 99, total: 'x', phase: 7 })).toMatchObject({ done: 6, total: 6, phase: 'Connection' })
  const finished = mergeProgress(b, { finished: true })
  expect(finished).toMatchObject({ done: 6, isFinished: true, phase: '' })
  expect(mergeProgress(finished, { total: 3, done: 0 })).toMatchObject({ title: '', total: 3, done: 0, isFinished: false })
  expect(mergeProgress(b, { title: 'Weekly readout', total: 2 })).toMatchObject({ title: 'Weekly readout', total: 2, done: 0, phase: '' })
})

test('mergeProgress: tasks set the total and done when those are left out', () => {
  const p = mergeProgress(null, { tasks: [{ title: 'Connect', done: true }, { title: 'Pick org' }, 'Profile', { nope: 1 }] })
  expect(p).toMatchObject({ total: 3, done: 1 })
  expect(p.tasks).toEqual([
    { title: 'Connect', isDone: true },
    { title: 'Pick org', isDone: false },
    { title: 'Profile', isDone: false },
  ])
})

test('orgStateFrom: the onboarding checkpoints a get_status result shows', () => {
  const one = { name: 'Sample Brand', orgCount: 1, profileCount: 0, hasChannel: false }
  expect(orgStateFrom(NO_ORG, one, false)).toEqual({ name: 'Sample Brand', checkpoints: 2 })
  expect(orgStateFrom(NO_ORG, { ...one, profileCount: 2 }, false)).toEqual({ name: 'Sample Brand', checkpoints: 3 })
  expect(orgStateFrom(NO_ORG, { ...one, profileCount: 2, hasChannel: true }, false)).toEqual({ name: 'Sample Brand', checkpoints: 4 })
  // Several organizations and none named in the call: not picked yet.
  const several = { ...one, orgCount: 3 }
  expect(orgStateFrom(NO_ORG, several, false)).toEqual({ name: null, checkpoints: 1 })
  expect(orgStateFrom(NO_ORG, several, true)).toEqual({ name: 'Sample Brand', checkpoints: 2 })
  // An earlier pick stays when a later call names none.
  const picked = { name: 'Sample Brand', checkpoints: 3 }
  expect(orgStateFrom(picked, { ...several, name: 'Default Org' }, false)).toEqual(picked)
  // Atlas answered without organizations: 1.
  expect(orgStateFrom(NO_ORG, null, false)).toEqual({ name: null, checkpoints: 1 })
})

test('titleOf and barText', () => {
  expect(titleOf(NO_ORG)).toBe('Aspire')
  expect(titleOf({ name: 'Sample Brand', checkpoints: 2 })).toBe('Aspire: Sample Brand')
  expect(barText(0.5, 10)).toBe('█████░░░░░')
  expect(barText(2, 4)).toBe('████')
  expect(barText(-1, 3)).toBe('░░░')
})
