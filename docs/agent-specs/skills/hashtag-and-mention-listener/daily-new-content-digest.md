---
name: Daily new content digest
owner: 28-hashtag-and-mention-listener
---

# Daily new content digest

## What it does

Builds the day's digest of new posts: the strongest against the hashtag's median, and creators posting about the brand for the first time.

## Inputs

- From brand memory: the routing saved at setup, and the `page` finding for the digest.
- From the launch message: the new posts.

## Output

The digest page, republished to the same link, and a three-line summary to the saved Slack channel.

## Callable

Never user-callable. Only Hashtag and Mention Listener runs it.
