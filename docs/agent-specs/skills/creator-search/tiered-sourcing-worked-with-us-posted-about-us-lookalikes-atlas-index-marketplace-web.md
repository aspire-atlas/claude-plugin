---
name: Tiered sourcing (worked with us, posted about us, lookalikes, Atlas index, marketplace, web)
owner: 05-creator-search
---

# Tiered sourcing (worked with us, posted about us, lookalikes, Atlas index, marketplace, web)

## What it does

Fills the pool to its target with new candidates, working through the sources in a fixed order and stopping once the pool is full.

## Inputs

- From brand memory: the campaign criteria, the pool target, saved partners and competitors, the
  team's saved calls on single creators, and every candidate already written for this campaign,
  kept or dropped, so no decided creator comes back.
- From the launch message: the brand profile, the campaign, the brand's handles, the run mode
  (interactive or unattended), and for a creator ad campaign the lane.

## Output

New candidates, each tagged with its tier (worked with us, posted about us, lookalike, Atlas
index, marketplace and web), the exact source, and the seed for a lookalike. A web-found handle
is resolved in Atlas before it counts, and dropped if it cannot be. The run summary lists any
tier that came back empty and any network that was skipped.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
