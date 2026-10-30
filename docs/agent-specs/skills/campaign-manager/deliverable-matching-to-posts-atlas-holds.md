---
name: Deliverable matching to posts Atlas holds
owner: 15-campaign-manager
---

# Deliverable matching to posts Atlas holds

## What it does

Builds the posts each creator owes from their deal and matches each one to a post Atlas already holds, never forcing a match it is unsure of.

## Inputs

- From brand memory: the agreed `terms` per creator (deliverables, due dates, `mustInclude`, the creator's code), the program's terms for each type, the `fulfillment` post due dates, the roster's network and account, and the brand's handles and catalog products as brand signals.
- From the launch message: the post links the person pasted, with the creator and deliverable when they said, the approval to look those links up, the matches the person confirmed, and any changes they made after an earlier check.

## Output

The owed list, one row per deliverable with a stable key, its format and due date, and gifted posts that were only hoped for kept apart. Each row carries its match: strong, confirmed, or open, with the post link and the brand signals found. Open matches come back as options for the person to confirm, and count for nothing until they do.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
