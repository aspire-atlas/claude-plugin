---
name: Sample flow
owner: 21-tiktok-shop-campaigns
---

# Sample flow

## What it does

Reviews sample requests in Partner Center against the creator's fit, their sample history, and stock, and recommends approve or decline.

## Inputs

- From brand memory: earlier `shop-campaign` sample findings.
- From the launch message: the open sample requests, and stock from the Shopify catalog.

## Output

A recommendation per request with its reason. Approvals go out one by one after confirmation and are recorded as `shop-campaign` sample findings.

## Callable

Never user-callable. Only TikTok Shop Campaigns runs it.
