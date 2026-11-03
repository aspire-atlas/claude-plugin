---
name: Organic fans worth asking
owner: 24-organic-to-ads
---

# Organic fans worth asking

## What it does

Finds unpaid posts about the brand where commenters ask how to buy, as people worth asking for rights.

## Inputs

- From Atlas: the brand's posts in the window with promotional intent 1 or 2 that already carry comment analysis.
- From brand memory: the post's `rights` and `draft` findings, so no one already asked is listed.

## Output

A short list, separate from the ranked candidates: creator, post, views, and the buying questions in plain words. Buying questions are matched on whole words and exclude refund, return, regret, scam and overpriced. A post without comment analysis is never listed as having no demand. Each entry can become a licence request draft on the person's choice.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
