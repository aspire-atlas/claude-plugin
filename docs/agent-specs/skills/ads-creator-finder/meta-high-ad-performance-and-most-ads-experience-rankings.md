---
name: Meta high ad performance and most ads experience rankings
owner: 09-ads-creator-finder
---

# Meta high ad performance and most ads experience rankings

## What it does

Fills each lane from Meta's own creator rankings for the brand (high ad performance, then most ads experience, then similar brands), after the brand's own creators and lookalikes and before the wider index and marketplace keyword passes.

## Inputs

- From brand memory: each lane's size band, countries and language, and the campaign's dedupe set
  of creators already decided.
- From the launch message: the campaign and the lane to fill, and the credit cap.

## Output

New candidates per lane, each with `recommendationTypes` naming every ranking that returned them and
a `source` naming the first ("Meta: high ad performance"). It stops as soon as a lane reaches its
target. A ranking that returns nothing is a valid result, not an error. The rankings add provenance,
never points to the fit score. Instagram only: Atlas has no TikTok ranking.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
