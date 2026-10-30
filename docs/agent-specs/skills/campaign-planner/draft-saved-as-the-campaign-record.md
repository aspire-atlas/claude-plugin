---
name: Draft saved as the campaign record
owner: 11-campaign-planner
---

# Draft saved as the campaign record

## What it does

Saves the signed-off plan as the campaign's record so later agents read the same goal, budget, and dates.

## Inputs

- From brand memory: the existing campaign records, so the save adds to them and never overwrites one silently.
- From the launch message: whether the person approved the save, and the plan built by the other skills.

## Output

The records to save, worded for one batch confirmation, then the saved record keys. With "Page only", nothing is saved and the output says so. The agent is not built yet; today the campaign setup in `/aspire` saves the campaign description, and the creator brief saves one action item per deliverable.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
