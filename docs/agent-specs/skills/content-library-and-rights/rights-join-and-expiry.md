---
name: Rights join and expiry
owner: 26-content-library-and-rights
---

# Rights join and expiry

## What it does

Joins the rights on record and the usage in each creator's deal to every asset, with end dates.

## Inputs

- From brand memory: `rights`, `terms`, `deliverable` and `roster` findings, and creator brief
  deliverables that asked for rights.
- From the launch message: the expiry horizon (30, 60 or 90 days).

## Output

A rights status per asset and usage: a grant, from the deal, may be covered by the deal, requested,
countered, wanted, declined, expired, or no rights, with channels and the end date. Where a grant
and a deal disagree, both show and the asset is marked "Records disagree". The expiring list sorts
by end date and ends each row with "Renew with @{handle}" or "Pull from ads by {date}". For each row
the person chooses to renew, it drafts a short renewal request with the usage, channels, new end
date and fee (the program's usage fees or the person's number, else `[fee]`). It skips a post by the
brand or a competitor, a creator with a saved reject or an open your-call question, an asset blocked
on brand safety, and a creator with no route. A request under 14 days old is shown again, never
drafted twice; one declined in the last 90 days is skipped; after 14 days with no answer, the new
draft is a follow-up on the same terms.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
