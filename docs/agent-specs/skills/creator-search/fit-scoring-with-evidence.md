---
name: Fit scoring with evidence
owner: 05-creator-search
---

# Fit scoring with evidence

## What it does

Scores each candidate out of 100 against the saved criteria, naming the field or post behind every point.

## Inputs

- From brand memory: the campaign criteria, saved competitors and red lines, the team's saved
  calls on single creators, and the saved rate card for the fee estimate.
- From the launch message: the brand profile and the campaign; for a creator ad campaign, the
  lane, scored with the campaign's match score.

## Output

Per candidate: a fit score split into audience fit, topic evidence, engagement quality, cadence,
format match and market fit, with any component that has no data scored zero and listed as
missing. Risk flags (a competitor mention, a red line match, no contact route, engagement that
looks bought) are reported beside the score, never scored. An estimated fee range comes from the
fee calculator when it gives one. Undecided candidates are re-scored every run before new ones
are added.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
