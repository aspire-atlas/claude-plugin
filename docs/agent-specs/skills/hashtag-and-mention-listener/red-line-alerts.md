---
name: Red-line alerts
owner: 28-hashtag-and-mention-listener
---

# Red-line alerts

## What it does

Flags a post that hits a red line or a brand safety category before it spreads.

## Inputs

- From brand memory: `red_line` calibrations and the saved alert routing.
- From the launch message: the new posts.

## Output

An alert for brand and legal with the post link, what it hit, the evidence and timecode, reach so far, and a next step. It goes to chat and the saved Slack channel at once.

## Callable

Never user-callable. Only Hashtag and Mention Listener runs it.
