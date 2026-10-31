---
name: Creator-ready edit notes
owner: 17-content-review
---

# Creator-ready edit notes

## What it does

Turns the checks into a verdict and a short, ordered list of edits the creator can act on.

## Inputs

- From brand memory: the verdict rule (`review:verdict-rule`) and the precedence order: red lines, then disclosure, then the brief, then lessons, then guidelines.
- From the launch message: the recipient lens, which sets how the verdict leads.

## Output

The verdict (Approve, Approve with edits, Revise and resubmit, or Do not post) with its go or no-go and highest severity, and the required edits, numbered, one line each, ready to forward. It also returns which earlier open edits this post now closes. With more than a third of checks unable to run, the verdict is at most Approve with edits and the first edit asks for what was missing.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
