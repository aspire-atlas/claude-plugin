---
name: Competitor and multi-brand screen
owner: 24-organic-to-ads
---

# Competitor and multi-brand screen

## What it does

Decides whether a post that also shows other brands is still the brand's video, by which brand is its subject.

## Inputs

- From brand memory: competitors and partners (exact names only, never prefix matches).
- From the launch message: nothing.

## Output

Per post: the brand's share of the products it features and a label. Competitor's video when a single competitor has more products than the brand (left out, with the brand named). Brand is the subject when it has a third or more of the products, or one product and at most two other products in all (kept, at most 2 in the top 12). Multi-brand look otherwise (left out and counted, available when the person asks for more). Captions are matched on whole words. Partners count toward other brands but never make a post a competitor's.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
