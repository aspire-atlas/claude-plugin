// Run with: claude plugin test plugins/aspire-mod
import { expect, test } from 'claude-code/testing'

import type { Item } from '../types'
import { applyTask, countCall, currentOf, doingOf, endTurn, estimate, planOf, startTurn, touch } from './plan'

const item = (subject: string, status: Item['status'], calls = 0): Item => ({ subject, status, calls })

test('applyTask: TaskCreate, TaskUpdate and TodoWrite keep the list; a refused or unknown update changes nothing', () => {
  let list = applyTask([], 'TaskCreate', { subject: 'Read the API' }, { task: { id: '1' } })
  list = applyTask(list, 'TaskCreate', { subject: 'Build the page' }, { task: { id: '2' } })
  expect(list.map(i => [i.id, i.status])).toEqual([['1', 'pending'], ['2', 'pending']])
  list = applyTask(list, 'TaskUpdate', { taskId: '1', status: 'in_progress' })
  expect(currentOf(list)).toBe(0)
  expect(applyTask(list, 'TaskUpdate', { taskId: '9', status: 'completed' })).toBe(list)
  expect(applyTask(list, 'TaskUpdate', { taskId: '2', status: 'deleted' }).map(i => i.subject)).toEqual(['Read the API'])
  const todos = applyTask([], 'TodoWrite', { todos: [{ content: 'A', status: 'completed' }, { content: 'B', status: 'in_progress' }, { content: '', status: 'pending' }] })
  expect(todos.map(i => [i.subject, i.status])).toEqual([['A', 'completed'], ['B', 'in_progress']])
})

test("applyTask: the desktop's update_plan replaces, advances, and wrap_up checks everything off", () => {
  const plan = 'mcp__ccd_turn__update_plan'
  let list = applyTask([], plan, { items: [{ content: 'One', status: 'in_progress' }, { content: 'Two', status: 'pending' }, { content: 'Three', status: 'pending' }] })
  expect(list.map(i => i.status)).toEqual(['in_progress', 'pending', 'pending'])
  list = applyTask(list, plan, { advance: true })
  expect(list.map(i => i.status)).toEqual(['completed', 'in_progress', 'pending'])
  list = applyTask(list, plan, { done: [2], start: 3 })
  expect(list.map(i => i.status)).toEqual(['completed', 'completed', 'in_progress'])
  expect(applyTask(list, 'mcp__ccd_turn__wrap_up', {}).every(i => i.status === 'completed')).toBe(true)
  // A replacement keeps the calls the old list counted for the same step.
  const counted = countCall(list)
  expect(applyTask(counted, plan, { items: [{ content: 'Three', status: 'in_progress' }] })[0]?.calls).toBe(1)
})

test('estimate: calls against the average of the finished steps, 4 before any, never past 95%', () => {
  expect(estimate([item('A', 'in_progress', 2)], 0)).toBe(0.5)
  expect(estimate([item('A', 'completed', 2), item('B', 'in_progress', 1)], 1)).toBe(0.5)
  expect(estimate([item('A', 'in_progress', 40)], 0)).toBe(0.95)
})

test('planOf: step bar, rows and the estimate while it works', () => {
  const { turn, items } = startTurn(null, [], 'Build a weather dashboard for New York City.\nMore detail', 1000)
  const list = [item('Pick the style', 'completed', 3), item('Check live weather', 'in_progress', 1), item('Build it', 'pending'), item('Publish it', 'pending')]
  const t = touch(turn, 'Write', { file_path: '/a/weather.ts' }, null)
  const plan = planOf(t, list, 12_000)
  expect(items).toEqual([])
  expect(plan).toMatchObject({ state: 'work', title: 'Build a weather dashboard for New York City.', label: 'Step 2 of 4', time: '0:11', total: 4 })
  expect(Math.round((plan?.frac ?? 0) * 1000)).toBe(Math.round(((1 + 1 / 3) / 4) * 1000))
  expect(plan?.rows.map(r => [r.kind, r.status])).toEqual([['done', 'Done'], ['now', '~33%'], ['next', 'Next'], ['later', 'Up next']])
  expect(plan?.rows[1]?.doing).toBe('writing weather.ts')
})

test('planOf: a long plan shows a window, and a finished turn says All done with the files it touched', () => {
  const long = Array.from({ length: 9 }, (_, i) => item(`Task ${i + 1}`, i < 4 ? 'completed' : i === 4 ? 'in_progress' : 'pending'))
  const view = planOf({ title: 'T', startedAt: 0, calls: 0, changed: [], read: [] }, long, 5000)
  expect(view?.rows).toHaveLength(5)
  expect(view?.before).toBe('3 more done')
  expect(view?.after).toBe('1 later')
  const done = long.map(i => ({ ...i, status: 'completed' as const }))
  let t = touch({ title: 'T', startedAt: 0, calls: 0, changed: [], read: [] }, 'Edit', { file_path: '/a/b.ts' }, true)
  t = touch(t, 'Read', { file_path: '/a/c.ts' }, true)
  const end = planOf(endTurn(t, 'answer', 107_000), done, 200_000)
  expect(end).toMatchObject({ state: 'done', badge: 'All done', label: '9 of 9 steps', frac: 1, time: 'took 1:47', files: 'changed 1 file · read 1 file' })
  expect(planOf(endTurn(t, 'aborted', 9000), long, 0)).toMatchObject({ state: 'stopped', badge: 'Interrupted', time: 'stopped at 0:09' })
  expect(planOf(null, long, 0)).toBeNull()
  expect(planOf(t, [], 0)).toBeNull()
})

test('startTurn keeps an open list, drops a finished one, and keeps the title for a notification', () => {
  const open = [item('A', 'completed'), item('B', 'pending')]
  expect(startTurn(null, open, 'Next request', 5).items).toBe(open)
  expect(startTurn(null, [item('A', 'completed')], 'Next request', 5).items).toEqual([])
  const first = startTurn(null, [], 'First', 1).turn
  expect(startTurn(first, [], '<task-notification>done</task-notification>', 9).turn.title).toBe('First')
})

test('doingOf names a call in a few words', () => {
  expect(doingOf('Bash', { description: 'Run the tests' })).toBe('Run the tests')
  expect(doingOf('Read', { file_path: '/x/y/z.ts' })).toBe('reading z.ts')
  expect(doingOf('Skill', { skill: 'aspire:aspire' })).toBe('using the aspire:aspire skill')
  expect(doingOf('mcp__Aspire_Atlas__search_posts', {})).toBe('using search posts')
})
