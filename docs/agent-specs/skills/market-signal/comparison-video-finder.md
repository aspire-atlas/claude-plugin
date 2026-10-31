---
name: Comparison video finder
owner: 02-market-signal
---

# Comparison video finder

## What it does

Finds the creator videos that compare the brand with a competitor and ranks them by the strength of their opening.

## Inputs

- From brand memory: the market signal scope and the brand's handles.
- From the launch message: the profile and the window.

## Output

The comparison set (posts matching the brand and a competitor, plus one meaning-based search per competitor, without repeats), and from it the reuse candidates ranked by the retention measure the ad reuse rules use, each with its opening, link and media for the post cards. It lists them only; the cut list is another agent's.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
