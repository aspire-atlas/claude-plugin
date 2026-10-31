---
name: Signal strength and recency ranking
owner: 04-competitor-roster
---

# Signal strength and recency ranking

## What it does

Ranks the net-new creators so the strongest and most recent partnerships come first.

## Inputs

- From brand memory: the brand's creator criteria from its campaign or vetting calibrations, where saved.
- From the launch message: the net-new list with its signals.

## Output

The net-new creators in order, each with a score built from signal strength (paid label above tag above mention), how many partnership posts and how many competitors, how recent the last one is, and how the partnership posts did against the creator's own median. When Atlas holds fewer than five of the creator's other posts, that part is left out of the score and the row says not enough data; it never fetches more. Each row shows the parts of the score, so the order can be checked. Fit against the brand's criteria is shown beside it and not mixed into it.

## Callable

Never user-callable. Only Competitor Roster runs it.
