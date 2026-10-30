---
name: Category fit
owner: 10-tiktok-shop-creator-search
---

# Category fit

## What it does

Checks whether a creator's Shop sales and their posts in Atlas sit in the brand's product categories.

## Inputs

- From brand memory: `brand:summary`, and `program:{slug}-catalog` or the connected store's catalog.
- From the launch message: the handles in this run. Their posts are read from Atlas with `search_posts`.

## Output

Fit as high, medium, or low per creator, with the categories they sell and two example posts.

## Callable

Never user-callable. Only TikTok Shop Creator Search runs it.
