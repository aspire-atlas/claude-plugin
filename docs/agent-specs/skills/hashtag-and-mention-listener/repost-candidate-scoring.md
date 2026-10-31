---
name: Repost candidate scoring
owner: 28-hashtag-and-mention-listener
---

# Repost candidate scoring

## What it does

Scores each new post as a repost: on brand, quality, performance against the median, brand safety, and people on screen.

## Inputs

- From brand memory: `theme:brand`, `red_line` calibrations, and `brand:summary`.
- From the launch message: the new posts.

## Output

Ranked candidates, each with a score and the reasons behind it.

## Callable

Never user-callable. Only Hashtag and Mention Listener runs it.
