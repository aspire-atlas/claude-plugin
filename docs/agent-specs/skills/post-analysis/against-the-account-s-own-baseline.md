---
name: Against the account's own baseline
owner: 31-post-analysis
---

# Against the account's own baseline

## What it does

Compares the post with the account's own held posts on views, interaction rate and comments.

## Inputs

- From brand memory: nothing.
- From the launch message: the post's link, and the baseline choice: use what Atlas holds, refresh the account first, or skip.

## Output

The post's rank on views, interaction rate and comments per 1,000 likes, the account medians, a scatter with the post marked, the rates table with the counts behind each rate, and the organic against boosted split. It warns when the held posts are far from the post's date. Nothing is returned when the baseline is skipped.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
