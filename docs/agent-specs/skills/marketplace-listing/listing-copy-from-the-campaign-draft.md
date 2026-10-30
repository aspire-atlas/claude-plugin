---
name: Listing copy from the campaign draft
owner: 12-marketplace-listing
---

# Listing copy from the campaign draft

## What it does

Writes the marketplace campaign page from the saved campaign draft: what the brand offers, the deliverables, the dates, and the pay.

## Inputs

- From brand memory: the campaign draft Campaign Planner (11) saved.
- From brand memory: `program:{slug}-terms` for what the listing may show about pay and usage.
- From brand memory: `brand:summary` and `theme:brand`.
- From the launch message: the campaign to list.

## Output

A listing draft with a title, a summary, deliverables, dates, a pay line, and a usage line, each shown on the page for review.

## Callable

Never user-callable. Only Marketplace Listing runs it.
