---
name: Fit against saved criteria
owner: 06-creator-vetting
---

# Fit against saved criteria

## What it does

Scores each creator out of 100 against the brand's vetting criteria or a chosen campaign's criteria.

## Inputs

- From brand memory: the vetting criteria and thresholds, or the chosen campaign's brief and
  criteria, and for a creator ad lane the lane record, cadence, campaign settings and terms; the
  saved rate card for the fee estimate.
- From the launch message: the brand profile, the list, and the criteria source (vetting, a
  campaign, or a campaign lane).

## Output

Per creator: a fit score split into audience fit, topic evidence, engagement quality, cadence,
format match and market fit, with the same weights creator search uses so a creator scores the
same in both. A component with no data scores zero and is listed as missing. Unscored notes ride
along: posts that mention the brand, the estimated fee, and the contact route.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
