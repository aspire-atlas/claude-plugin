---
name: Eligibility and auto-screen rules
owner: 12-marketplace-listing
---

# Eligibility and auto-screen rules

## What it does

Turns the campaign's criteria into rules applied when someone applies: network, follower range, market, category, and knock-outs from the brand's red lines and competitors.

## Inputs

- From brand memory: the campaign's saved criteria, `red_line`, and `competitor` calibrations.
- From the launch message: the campaign to list.

## Output

A rule list. Each rule is marked auto (the marketplace applies it) or review (List Review checks it).

## Callable

Never user-callable. Only Marketplace Listing runs it.
