---
name: Hashtag and mention tracking
owner: 28-hashtag-and-mention-listener
---

# Hashtag and mention tracking

## What it does

Reads new posts on the brand's tracked hashtags and posts that tag or mention the brand, from Atlas, since the last run.

## Inputs

- From brand memory: the tracked hashtags, the brand's linked handles, and `brand:summary`.
- From the launch message: the window, default since the last run.

## Output

New posts, each with how it was found (hashtag, mention, or tag), its creator, and its reach so far.

## Callable

Never user-callable. Only Hashtag and Mention Listener runs it.
