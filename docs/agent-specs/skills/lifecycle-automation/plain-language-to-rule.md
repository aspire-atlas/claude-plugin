---
name: Plain language to rule
owner: 30-lifecycle-automation
---

# Plain language to rule

## What it does

Turns a rule the person describes in their own words into a rule with a trigger, a condition, an action, guardrails, an approver, and a stop condition.

## Inputs

- From brand memory: the program's and campaign's setup records the rule refers to, and every saved `automation:{slug}` rule.
- From the launch message: the person's words and the program or campaign the rule is for.

## Output

A rule draft in plain words and as fields: the trigger (an event Atlas records, such as a stage move, a delivered post, a reply, or a date), the condition (filters on the records it reads; a performance condition, such as a creator below their own median, is read through U5 Performance baseline), the action (one of the four in `reward-re-engage-refresh-escalate-actions`, and the agent that does it), the guardrails (a daily item cap, quiet hours, and per-creator limits such as one message a week), the approver and where alerts go (the program's saved routing by default), and the stop condition (an end date, a count, or a state such as the program ending). Anything the words leave open becomes a question with a default, never a guess. A rule that would spend credits or money is refused here.

## Callable

Never user-callable. Only Lifecycle Automation runs it.
