import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { approvalKind, approvalsLine, checkApprovals, namedApprovals, noApprovals } from './approvals'
import { parseStream, summarizeTurn } from './lib'

const FIXTURES = join(import.meta.dir, 'fixtures')
const fixtureTurn = (name: string) => summarizeTurn(parseStream(readFileSync(join(FIXTURES, name), 'utf8')))

const line = (event: unknown) => JSON.stringify(event)

// One turn: what the main thread asked with AskUserQuestion, and the reply the turn ended on.
function chatTurn(reply: string, asks: { header: string; question: string }[] = []): ReturnType<typeof summarizeTurn> {
  return summarizeTurn(parseStream([
    ...asks.map((ask, i) => line({ type: 'assistant', message: { content: [{ type: 'tool_use', id: `q${i}`, name: 'AskUserQuestion', input: { questions: [{ ...ask, options: [{ label: 'Yes, run it (Recommended)', description: '' }] }] } }] } })),
    line({ type: 'result', session_id: 's1', result: reply, is_error: false }),
  ].join('\n')))
}

test('the approvals line is read by kind, and a question is an approval by its header or its wording', () => {
  const line = 'This run will ask you to approve: the page\'s three main points, before I build it; the Atlas credits this run uses, capped in the question below; ' +
    'a refresh of @acme, which is out of date (the refresh is free and the new posts it collects use credits); saving the ranked posts to Atlas; ' +
    'drafts in your mailbox, which send nothing; sending the page to Slack; each message, one at a time, after the run.\nClaude itself may also ask to let Atlas\'s tools run.'
  expect(namedApprovals(`You need a shortlist.\n${line}\n\nAnother paragraph about saving.`)).toEqual(['storyline', 'credits', 'refresh', 'save', 'drafts', 'delivery', 'send'])
  expect(namedApprovals('This run will ask you to approve: saving the message drafts to Atlas.')).toEqual(['save'])
  expect(namedApprovals('This run asks you to approve nothing.')).toEqual([])
  expect(namedApprovals('I heard P1. Before I start, please answer the questions below.')).toBeNull()
  const kind = (header: string, question: string) => approvalKind({ header, question })
  expect(kind('Storyline', 'Three points. Build?')).toBe('storyline')
  expect(kind('Credits', 'Cap it at 12?')).toBe('credits')
  expect(kind('Account', 'Atlas\'s newest post for @acme is Nov 2. Refresh it first? About 2 minutes.')).toBe('refresh')
  expect(kind('Save', 'Save the shops plan to Atlas?')).toBe('save')
  expect(kind('Record', 'Save the 12 recommendations to Atlas, so later runs start from them?')).toBe('save')
  expect(kind('Mailbox', 'Create 8 drafts in your mailbox? Nothing is sent.')).toBe('drafts')
  expect(kind('Routing', 'Send the page to Slack, in #social?')).toBe('delivery')
  expect(kind('Requests', 'Send the rights request to @acme now?')).toBe('send')
  // Questions that approve nothing, among them a metric check-in that only offers a refresh as an option.
  expect(kind('Heard', 'You asked who to contact. Is that right?')).toBeNull()
  expect(kind('Scope', 'Which channels and dates?')).toBeNull()
  expect(kind('Metrics', 'Saves and shares are missing for 4 posts. How should I go on?')).toBeNull()
})

test('the approval check passes when the setup reply named every approval asked, and fails on one it did not name', () => {
  const named = checkApprovals([fixtureTurn('approvals-named.jsonl')])
  expect(named).toEqual({ result: 'pass', line: true, named: ['credits', 'storyline', 'save'], asked: ['credits', 'storyline', 'save'], unnamed: [] })
  expect(approvalsLine(named)).toBeNull()
  // The fixture run names the storyline only, then asks to save, to refresh and, from its agent, to create mailbox
  // drafts. The refresh is called out above its own question as one more approval, so it passes; the others fail.
  const unnamed = checkApprovals([fixtureTurn('approvals-unnamed.jsonl')])
  expect(unnamed).toEqual({ result: 'fail', line: true, named: ['storyline'], asked: ['storyline', 'save', 'refresh', 'drafts'], unnamed: ['save', 'drafts'] })
  expect(approvalsLine(unnamed)).toBe('Approvals named in the setup reply (Q3): fail. The run asked for save, drafts, which the setup reply did not name.')
  // A setup reply with no line names nothing, and a run that asked no picker has no setup reply to read.
  const noLine = checkApprovals([chatTurn('', [{ header: 'Heard', question: 'Right?' }, { header: 'Save', question: 'Save the findings to Atlas?' }])])
  expect(noLine).toEqual({ result: 'fail', line: false, named: [], asked: ['save'], unnamed: ['save'] })
  expect(approvalsLine(noLine)).toContain('has no "This run will ask you to approve" line')
  expect(checkApprovals([chatTurn('', [{ header: 'Heard', question: 'Right?' }])]).result).toBe('pass')
  expect(checkApprovals([chatTurn('Here is the page.')])).toEqual(noApprovals())
  // The picker the harness left unanswered after the page is the flow's offer of more work, not an approval of this run.
  const offer = (declined: string) => summarizeTurn(parseStream([
    line({ type: 'assistant', message: { content: [{ type: 'text', text: 'This run asks you to approve nothing.' }, { type: 'tool_use', id: 'q1', name: 'AskUserQuestion', input: { questions: [{ header: 'Heard', question: 'Right?' }] } }] } }),
    line({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 'q2', name: 'AskUserQuestion', input: { questions: [{ header: 'Routing', question: 'Send the page to Slack, in #social?' }] } }] } }),
    line({ type: 'eval_answer', tool_use_id: 'q2', declined }),
  ].join('\n')))
  expect(checkApprovals([offer('finished')])).toEqual({ result: 'pass', line: true, named: [], asked: [], unnamed: [] })
  expect(checkApprovals([offer('limit')]).unnamed).toEqual(['delivery'])
  // An agent that asks for one more approval says so in its own text, above its own question.
  const agent = (note: string) => summarizeTurn(parseStream([
    line({ type: 'assistant', message: { content: [{ type: 'text', text: 'This run asks you to approve nothing.' }, { type: 'tool_use', id: 'q1', name: 'AskUserQuestion', input: { questions: [{ header: 'Heard', question: 'Right?' }] } }] } }),
    line({ type: 'assistant', parent_tool_use_id: 't1', message: { content: [{ type: 'text', text: note }] } }),
    line({ type: 'assistant', parent_tool_use_id: 't1', message: { content: [{ type: 'tool_use', id: 'q2', name: 'AskUserQuestion', input: { questions: [{ header: 'Mailbox', question: 'Create 8 drafts in your mailbox?' }] } }] } }),
  ].join('\n')))
  expect(agent('One more approval than I listed: drafts in your mailbox.').asks[1].before).toContain('One more approval')
  expect(checkApprovals([agent('One more approval than I listed: drafts in your mailbox.')]).result).toBe('pass')
  expect(checkApprovals([agent('Drafting now.')]).unnamed).toEqual(['drafts'])
})

test('a send is a question that opens with the word or a Send header, and the approvals line is read however it is laid out', () => {
  expect(approvalKind({ header: 'Next', question: 'What next? I can draft outreach, or send nothing more.' })).toBeNull()
  expect(approvalKind({ header: 'Heard', question: 'You asked who to contact. I will send nothing. Is that right?' })).toBeNull()
  expect(approvalKind({ header: 'Tags', question: 'Send these 6 drafts now?' })).toBe('send')
  expect(approvalKind({ header: 'Send', question: 'Go ahead?' })).toBe('send')
  expect(approvalKind({ header: 'Sender', question: 'Which address should replies come from?' })).toBeNull()
  expect(approvalKind({ header: 'Format', question: 'Send me the shortlist too?' })).toBeNull()
  // A line that lists its approvals with commas names each one, and a line that wraps inside an item is one item.
  expect(namedApprovals("This run will ask you to approve: the page's main points, the credits, and saving the findings to Atlas.")).toEqual(['storyline', 'credits', 'save'])
  expect(namedApprovals("This run will ask you to approve: the page's three main points, before I build it; saving\nthe ranked posts to Atlas.")).toEqual(['storyline', 'save'])
  // The refresh item's own note about credits is not the credits approval.
  expect(namedApprovals('This run will ask you to approve: a refresh of @acme, which is out of date (the refresh is free and the new posts it collects use credits).')).toEqual(['refresh'])
  expect(namedApprovals('You need a shortlist.\nThis run will ask you to approve:\n- the page\'s three main points, before I build it\n- the Atlas credits this run uses\n- saving the ranked creators to Atlas\n\nMore below.'))
    .toEqual(['storyline', 'credits', 'save'])
  expect(namedApprovals('This run will ask you to approve: saving the findings to Atlas.\nClaude itself may also ask to let Atlas\'s tools run.')).toEqual(['save'])
})
