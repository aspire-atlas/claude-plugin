---
name: Shop creator metrics read
owner: 10-tiktok-shop-creator-search
---

# Shop creator metrics read

## What it does

Reads each candidate's TikTok Shop figures from Partner Center: GMV, items sold, video GMV, LIVE GMV, followers, and the categories they sell.

## Inputs

- From brand memory: `brand:summary` for the brand's categories and markets.
- From brand memory: the Shop connection in `connections` (Creator Collaborations app).
- From the launch message: the product or category, the market, and any named handles.

## Output

One row per creator with each figure, its time window, and its source ("Partner Center, read {date}"). Creators Partner Center cannot see are listed apart as "no Shop data", never scored.

## Callable

Never user-callable. Only TikTok Shop Creator Search runs it.
