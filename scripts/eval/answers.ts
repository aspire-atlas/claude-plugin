// How the harness answers the pickers a rerun asks (scripts/eval/README.md, "What one run does"). Pure: no
// process, network or file calls, so `bun test scripts/eval` covers it without running Claude.

import { askedQuestions, type AnswerSource, type Ask, type Asked, type Turn } from './lib'

/**
 * One entry of the answer list in questions.json. `header` (the picker's header, any case) and `question` (a
 * pattern over its wording) say which questions the entry is for; with neither it is for any question. `pick`
 * is a pattern over the option labels and takes the first option it matches; `text` is typed into the free
 * text field as it stands. An entry whose `pick` matches no option is passed over.
 */
export type AnswerRule = { header?: string; question?: string; pick?: string; text?: string }

const pattern = (source: string) => new RegExp(source, 'i')

/**
 * The answer the harness gives one question: the first entry of the list that fits, else the option marked
 * (Recommended), else the first option. A question with no options gets no answer.
 */
export function answerFor(asked: Pick<Asked, 'header' | 'question' | 'options'>, rules: AnswerRule[]): { answer: string; by: AnswerSource } | null {
  for (const rule of rules) {
    if (rule.header !== undefined && rule.header.toLowerCase() !== asked.header.toLowerCase()) continue
    if (rule.question !== undefined && !pattern(rule.question).test(asked.question)) continue
    if (rule.text !== undefined) return { answer: rule.text, by: 'list' }
    const picked = rule.pick === undefined ? undefined : asked.options.find(option => pattern(rule.pick!).test(option.label))
    if (picked) return { answer: picked.label, by: 'list' }
  }
  const recommended = asked.options.find(option => /\(recommended\)/i.test(option.label))
  if (recommended) return { answer: recommended.label, by: 'recommended' }
  return asked.options.length ? { answer: asked.options[0].label, by: 'first' } : null
}

/** The answers to one AskUserQuestion call, keyed by each question's wording as the tool wants them. */
export function answersFor(input: Record<string, any>, rules: AnswerRule[]): Record<string, { answer: string; by: AnswerSource }> {
  const answers: Record<string, { answer: string; by: AnswerSource }> = {}
  for (const asked of askedQuestions(input)) {
    const given = answerFor(asked, rules)
    if (given) answers[asked.question] = given
  }
  return answers
}

/** A picker the harness answered, rather than one it left at the end of the run. */
export const wasAnswered = (ask: Ask) => ask.questions.some(asked => asked.answer !== null)

/** What the run folder keeps for each picker: the turn it came in, the text above it, the message it sits in, and each question with its options and answer. */
export type AskRecord = { turn: number } & Omit<Ask, 'id'>

export function askRecords(turns: Turn[]): AskRecord[] {
  return turns.flatMap((turn, i) => turn.asks.map(({ id: _id, ...ask }) => ({ turn: i + 1, ...ask })))
}
