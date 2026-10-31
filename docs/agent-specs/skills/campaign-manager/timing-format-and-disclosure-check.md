---
name: Timing, format and disclosure check
owner: 15-campaign-manager
---

# Timing, format and disclosure check

## What it does

Checks each matched post for timing, format, disclosure and the items the deal requires, and sets each row's status from what it finds.

## Inputs

- From brand memory: the deal's disclosure wording and `mustInclude` list, the grace days for the type, and the cadence timezone. From each post: the caption, hashtags, mentions, the partnership marker, and the transcript and on-screen text where Atlas holds them.
- From the launch message: the answers to the person's "your call" items, such as a different format or a disclosure that is unclear.

## Output

One check line per test, each quoting its evidence, and a disclosure result of found, missing or unclear. The paid partnership label is never shown as missing, because Atlas does not hold it. Each row gets a status: due, posted, late, missing, needs a fix, or waived, with the exact fix in plain words. Anything only the person can decide comes back as a "your call" question.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
