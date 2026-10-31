---
name: Did it arrive check-in
owner: 16-product-fulfillment
---

# Did it arrive check-in

## What it does

Drafts a short check-in for each creator past the delivery window. For gifting it shows how likely a post is, from the creator's earlier gifted posts in Atlas.

## Inputs

- From brand memory: `program:{slug}-outreach` for the templates.
- From brand memory: the creator's `fulfillment` findings.
- From the launch message: the creators past their window. Their earlier gifted posts are read from Atlas with `search_posts`.

## Output

A check-in draft per creator, and posting odds labelled as an inference.

## Callable

Never user-callable. Only Product Fulfillment runs it.
