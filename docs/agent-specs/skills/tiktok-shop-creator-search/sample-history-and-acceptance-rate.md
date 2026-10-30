---
name: Sample history and acceptance rate
owner: 10-tiktok-shop-creator-search
---

# Sample history and acceptance rate

## What it does

Reads how often a creator took samples from other sellers and how often they posted after receiving one.

## Inputs

- From brand memory: earlier `shop-campaign` sample findings for this brand.
- From the launch message: the handles in this run. Their sample records come from Partner Center.

## Output

Per creator: samples received, posts made after a sample, the rate, and the median days to post. Under three samples the rate is "not judged".

## Callable

Never user-callable. Only TikTok Shop Creator Search runs it.
