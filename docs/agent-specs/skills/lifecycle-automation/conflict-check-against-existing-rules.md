---
name: Conflict check against existing rules
owner: 30-lifecycle-automation
---

# Conflict check against existing rules

## What it does

Checks a new or changed rule against every live rule and the program's saved cadences.

## Inputs

- From brand memory: every `automation:{slug}` rule, and each program's cadence and outreach setup (follow-up days, channels).
- From the launch message: the rule draft.

## Output

Per conflict: the other rule or cadence, the creators or records both would touch, and what would happen (two messages to one creator on one day, a follow-up the outreach cadence already sends, a re-engage on a creator another rule retires). Each conflict has a fix to pick: narrow the condition, add a gap between the two, or keep one rule. A rule with an unresolved conflict cannot be turned on.

## Callable

Never user-callable. Only Lifecycle Automation runs it.
