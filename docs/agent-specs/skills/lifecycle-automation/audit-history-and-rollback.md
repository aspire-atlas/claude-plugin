---
name: Audit history and rollback
owner: 30-lifecycle-automation
---

# Audit history and rollback

## What it does

Keeps a record of everything each rule did and undoes what can be undone.

## Inputs

- From brand memory: the rule and its `automation-run` findings.
- From the launch message: the rule, and for a rollback the runs to undo.

## Output

A history per rule: each run with its matches, the drafts it queued, the items a person confirmed or declined, and what it held. A rollback pauses the rule, hands each draft not yet sent back to the agent that owns it to withdraw (through `/aspire`, as a new action), and lists what cannot be undone (a message sent, an order placed) with who confirmed it and when. Changing or pausing a rule supersedes its calibration, so every earlier version stays readable.

## Callable

Never user-callable. Only Lifecycle Automation runs it.
