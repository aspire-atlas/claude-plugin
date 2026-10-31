---
name: Lane casting per product or audience
owner: 09-ads-creator-finder
---

# Lane casting per product or audience

## What it does

Splits the campaign into persona lanes per product or audience and keeps one pool per lane at three times that lane's need.

## Inputs

- From brand memory: `brand:summary`, the campaign's lane records, and the products in scope.
- From the launch message: the products, the audiences, and how many creators each lane needs.

## Output

The lanes in saved order, each with its persona, tension, casting filter and target, and every
candidate scored with the campaign's match score. One creator is cast once per deck. Competitors,
brand accounts and creators with a saved reject are never cast.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
