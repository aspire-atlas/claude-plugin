---
name: Invite plan by tier and commission
owner: 21-tiktok-shop-campaigns
---

# Invite plan by tier and commission

## What it does

Turns the invite list into targeted and open invites, with the commission for each tier from the program's saved affiliate terms.

## Inputs

- From brand memory: `program:{slug}-terms` for commission by tier.
- From the launch message: the `invite-list` block from TikTok Shop Creator Search (10), and the products to include.

## Output

Invite rows with the creator, invite type, products, commission and its source, and a message draft. Nothing is sent without its own confirmation.

## Callable

Never user-callable. Only TikTok Shop Campaigns runs it.
