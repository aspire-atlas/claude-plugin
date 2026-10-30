---
name: Details request and order form page
owner: 16-product-fulfillment
---

# Details request and order form page

## What it does

Drafts the request for each creator's size and shipping details and keeps one order form page per program for the team to fill in.

## Inputs

- From brand memory: `program:{slug}-outreach` for the templates and voice.
- From brand memory: `theme:brand`.
- From brand memory: the `page` finding with key `orderForm`, when it exists.
- From the launch message: the confirmed picks.

## Output

A details request draft per creator, and the order form's link with one row per creator.

## Callable

Never user-callable. Only Product Fulfillment runs it.
