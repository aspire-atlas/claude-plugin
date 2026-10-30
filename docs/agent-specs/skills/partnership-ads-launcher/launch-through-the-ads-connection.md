---
name: Launch through the ads connection
owner: 25-partnership-ads-launcher
---

# Launch through the ads connection

## What it does

Creates each approved ad, paused, through the brand's own Meta ad account.

## Inputs

- From brand memory: nothing.
- From the launch message: the approved tests, the ad account and Instagram account from the Meta
  Ads connector, and each post's media id or ad code.

## Output

A plan per ad from `ads_boost_ig_post` with `confirmed=false`, shown to the person, then the ad
created paused with `confirmed=true` after their yes. Each ad is its own question. The ad stays
paused: the person turns it on in Meta Ads Manager, and the page lists what is waiting to be turned
on. Without the connector it hands back what to run in Meta Ads Manager.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
