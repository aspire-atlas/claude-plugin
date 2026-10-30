---
name: Policy risk notes
owner: 21-tiktok-shop-campaigns
---

# Policy risk notes

## What it does

Flags videos and product claims likely to break TikTok Shop policy, citing a policy page read in this run.

## Inputs

- From brand memory: `red_line` calibrations.
- From the launch message: the creators' videos in Atlas and the products' claims.

## Output

A note per video or claim with the policy page's link and the date it was read. With no policy page read, the item is marked "not checked", never judged from memory.

## Callable

Never user-callable. Only TikTok Shop Campaigns runs it.
