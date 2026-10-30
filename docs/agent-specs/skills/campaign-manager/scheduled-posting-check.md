---
name: Scheduled posting check
owner: 15-campaign-manager
---

# Scheduled posting check

## What it does

Runs the posting check on a schedule without asking anything, and tells the team only when something changed.

## Inputs

- From brand memory: the program setup records, the routing record (`program:{slug}-routing`) for the Slack channel and email recipients, the cadence, and the tracker page link saved on the first publish.
- From the launch message: the scheduled run flag (`run: unattended`) and the profile and program it covers.

## Output

Saved statuses only where a clear match or the date alone settled them, never a match to confirm, a waiver or a stage move. The tracker page is republished in place. When a row is late, missing, needs a fix, or a new post was matched, one message goes to the saved routing with counts, handles and the page link, never a caption or an amount.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
