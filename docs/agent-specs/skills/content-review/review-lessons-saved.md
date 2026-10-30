---
name: Review lessons saved
owner: 17-content-review
---

# Review lessons saved

## What it does

Asks the person for their own call on the review and turns their corrections into lessons and hard rules they approve.

## Inputs

- From brand memory: earlier lessons (`review:lesson-*`), hard rules (`review:rule-*`) and red lines, and earlier reviews of this brand with the calls people overturned.
- From the launch message: nothing beyond the review itself. It asks the person directly when it can, and otherwise hands the questions to `/aspire`.

## Output

The person's call saved next to the agent's, at most one lesson worded in full, and up to four proposed hard rules, each saved only when the person picks it. It also names any check overturned twice or more as a candidate lesson, and lists under "Needs the main thread" every change to a saved rule or lesson, which it never makes itself.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
