---
name: Account map
owner: 24-organic-to-ads
---

# Account map

## What it does

Sorts the accounts posting about the brand into creators and everyone else, so counts and rankings are about creators.

## Inputs

- From brand memory: the `ad-reuse:account-map` calibration when one is saved, the brand's linked handles, partners, and competitors.
- From the launch message: whether the person wants retailers or other non-creator accounts included.

## Output

Each author labelled creator, brand-owned (own or regional account), retailer or reseller, deal or news page, team or sponsorship account, or another brand's sponsored post, with the evidence for the label (handle, caption wording, posting mix). Brand-owned accounts are excluded; the rest are counted and set aside unless the person includes them. Uncertain labels are flagged, never guessed. A proposed map is returned for one batch question; until it is saved, every count on the page reads "unconfirmed account map".

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
