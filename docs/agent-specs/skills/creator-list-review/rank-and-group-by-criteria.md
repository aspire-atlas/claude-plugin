---
name: Rank and group by criteria
owner: 07-creator-list-review
---

# Rank and group by criteria

## What it does

Orders the vetted list into Approve, Maybe, Reject and Can't vet groups, ranked by fit score, and numbers the whole page.

## Inputs

- From brand memory: the vetting thresholds, and the criteria's audiences and how many creators
  each needs when the criteria name them.
- From the launch message: the criteria source and the reader lens.

## Output

Groups ranked by fit score and numbered from 1 across the whole page, since those numbers are
what the person replies with. When the criteria name audiences, the Approve group is split by
audience with a subtotal, and a group short of its need names the open slot. Reject and Can't vet
are grouped by reason, one row per creator.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
