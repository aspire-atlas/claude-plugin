---
name: Enrichment from Atlas
owner: 07-creator-list-review
---

# Enrichment from Atlas

## What it does

Resolves every handle on the list in Atlas and reads its account and recent posts.

## Inputs

- From brand memory: nothing beyond the brand profile.
- From the launch message: the list and the handles the person approved fetching.

## Output

Per creator: the account (followers, bio, country, contact fields) and up to 50 posts from the
last 90 days, widened to 180 days when there are fewer than five. Handles Atlas does not hold are
fetched only when approved, in one batch per network. Every handle that stays unresolved is
recorded with the reason.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
