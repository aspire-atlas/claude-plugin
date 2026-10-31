---
name: Share of voice by competitor
owner: 02-market-signal
---

# Share of voice by competitor

## What it does

Measures how much of the creator conversation in the window is about the brand and each tracked competitor, organic and paid apart.

## Inputs

- From brand memory: the market signal scope (competitors and networks), each competitor record with its spelling variants, the brand's handles and tracked hashtags, and the last run's findings.
- From the launch message: the profile, the brand's handles and networks, the run mode, the reader lenses, and a window if one was named.

## Output

Per entity: posts, distinct creators and engagement, each as a share of the total, organic first with paid beside it, and the change in points against the four weeks before. Sets capped at 500 posts and competitors Atlas does not index are listed as gaps. Shapes the bar chart and the share of voice lines in the summary.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
