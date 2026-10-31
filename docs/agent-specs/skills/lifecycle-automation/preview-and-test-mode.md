---
name: Preview and test mode
owner: 30-lifecycle-automation
---

# Preview and test mode

## What it does

Shows what a rule would have done before it is turned on.

## Inputs

- From brand memory: the rule draft and the records its trigger and condition read.
- From the launch message: the rule and the window to replay (default the last 30 days).

## Output

A dry run over the window: every record that would have matched, the action and the draft it would have made, what the guardrails would have held, and the matches a person should check (a creator matched twice, or one with an open your-call). The person can then keep the rule in test mode, where each scheduled run saves its matches and the action it would have taken as an `automation-run` finding marked `test`, and asks no other agent to draft anything, or turn it on. Test mode is the default for a new rule.

## Callable

Never user-callable. Only Lifecycle Automation runs it.
