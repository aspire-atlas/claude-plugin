---
name: Invite list by tier
owner: 10-tiktok-shop-creator-search
---

# Invite list by tier

## What it does

Groups the ranked creators into tiers and suggests a targeted or open invite for each.

## Inputs

- From brand memory: `program:{slug}-terms` for commission by tier, when saved.
- From the launch message: how many creators to invite.

## Output

The Shortlist page's tier table, with each creator's score, fit, and sample rate. It is handed to TikTok Shop Campaigns (21) as the `invite-list` block. It proposes no commission of its own.

## Callable

Never user-callable. Only TikTok Shop Creator Search runs it.
