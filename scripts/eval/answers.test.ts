import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { answerFor, answersFor, askRecords, wasAnswered } from './answers'
import { parseStream, summarizeTurn } from './lib'

const FIXTURES = join(import.meta.dir, 'fixtures')
const fixtureTurn = (name: string) => summarizeTurn(parseStream(readFileSync(join(FIXTURES, name), 'utf8')))

test('a picker is answered from the list, then by the recommended option, then by the first one', () => {
  const save = { header: 'Save', question: 'Save the findings to Atlas?', options: [{ label: 'Save to Atlas (Recommended)', description: '' }, { label: 'Page only', description: '' }] }
  const rules = [{ header: 'Storyline', pick: '^Build' }, { header: 'save', pick: '^Page only' }]
  expect(answerFor(save, rules)).toEqual({ answer: 'Page only', by: 'list' })
  expect(answerFor(save, [])).toEqual({ answer: 'Save to Atlas (Recommended)', by: 'recommended' })
  // An entry whose pick matches no option is passed over, and a question's wording can choose the entry.
  expect(answerFor(save, [{ header: 'Save', pick: 'Slides' }, { question: 'findings', text: 'Only the top three.' }])).toEqual({ answer: 'Only the top three.', by: 'list' })
  expect(answerFor({ header: 'Scope', question: 'Which channels?', options: [{ label: 'Instagram only', description: '' }, { label: 'TikTok only', description: '' }] }, rules))
    .toEqual({ answer: 'Instagram only', by: 'first' })
  // An entry with only a pick answers any question that offers it.
  expect(answerFor({ header: 'Metrics', question: 'Saves are missing.', options: [{ label: 'Change the scope', description: '' }, { label: 'Build with the gaps noted', description: '' }] }, [{ pick: '^Build with the gaps' }]))
    .toEqual({ answer: 'Build with the gaps noted', by: 'list' })
  expect(answerFor({ header: 'Heard', question: 'Right?', options: [] }, rules)).toBeNull()
  expect(answersFor({ questions: [save, { header: 'Heard', question: 'Right?', options: [{ label: 'Yes, run it (Recommended)' }] }] }, rules)).toEqual({
    'Save the findings to Atlas?': { answer: 'Page only', by: 'list' }, 'Right?': { answer: 'Yes, run it (Recommended)', by: 'recommended' },
  })
})

test('the answer list in questions.json holds patterns that compile, and answers the storyline and the save as the fixed reply does', () => {
  const config = JSON.parse(readFileSync(join(import.meta.dir, 'questions.json'), 'utf8'))
  const rules = [...config.answers, ...config.questions.flatMap((question: any) => question.answers ?? [])]
  for (const rule of rules) for (const source of [rule.pick, rule.question]) if (source !== undefined) expect(() => new RegExp(source, 'i')).not.toThrow()
  const options = (...labels: string[]) => labels.map(label => ({ label, description: '' }))
  expect(answerFor({ header: 'Storyline', question: 'Only 6 posts fit.', options: options('Widen to 26 weeks (Recommended)', 'Build', 'Change') }, config.answers)?.answer).toBe('Build')
  expect(answerFor({ header: 'Save', question: 'Save?', options: options('Save to Atlas (Recommended)', 'Page only') }, config.answers)?.answer).toBe('Page only')
})

test('a run folder record holds the text above each picker, every question with its options, and the answer given', () => {
  const records = askRecords([fixtureTurn('approvals-named.jsonl')])
  expect(records.map(record => record.questions.map(question => question.header))).toEqual([['Heard', 'Credits'], ['Storyline', 'Save'], ['Next']])
  expect(records[0].turn).toBe(1)
  expect(records[0].before).toContain('You need to know which creators to contact')
  expect(records[0].before).toContain('This run will ask you to approve')
  expect(records[0].questions[1]).toEqual({
    header: 'Credits', question: 'This fetches 12 handles Atlas does not hold. Cap it at 12?', multiSelect: false,
    options: [{ label: 'Cap at 12 fetches (Recommended)', description: 'Fetch up to 12.' }, { label: 'Fetch none, use what Atlas holds', description: '' }],
    answer: 'Cap at 12 fetches (Recommended)', by: 'recommended',
  })
  expect(records[1].questions.map(question => [question.answer, question.by])).toEqual([['Build (Recommended)', 'list'], ['Page only', 'list']])
  // The picker that follows the page is left unanswered, and says why.
  expect(records[2].declined).toBe('finished')
  expect(records[2].questions[0].answer).toBeNull()
  expect(wasAnswered(fixtureTurn('approvals-named.jsonl').asks[2])).toBe(false)
})
