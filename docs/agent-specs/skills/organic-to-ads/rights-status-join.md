---
name: Rights status join
owner: 24-organic-to-ads
---

# Rights status join

## What it does

Shows, beside every candidate, what the brand may already do with it.

## Inputs

- From brand memory: the program's `rights`, `terms` and `deliverable` findings, creator brief
  deliverables that asked for rights, and the creator's CAS campaign `roster` usage and ad
  permissions.
- From the launch message: nothing.

## Output

A rights badge per candidate: brand-owned, cleared for paid (from a grant or the deal), cleared for
organic, requested, declined, expired, or "Not held in Atlas: confirm usage rights before paid use",
as the P1 example shows. The running `atlas-ad-reuse` agent shows brand-owned, cleared from a
record, and not held; the other badges come with the build. A creator post is never shown as cleared
without a record or a matched deal behind it.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
