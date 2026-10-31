---
name: Lookalike expansion from seeds
owner: 05-creator-search
---

# Lookalike expansion from seeds

## What it does

Finds creators who resemble the brand's best-performing creators, using up to five of them as seeds.

## Inputs

- From brand memory: creators kept on this campaign whose brand posts beat their own median,
  stars marked as seeds in the newest roster review of the linked program, creators the weekly
  readout named as seeds, and partners whose collab posts beat the brand's median.
- From the launch message: the brand profile, the campaign and its networks.

## Output

Lookalike candidates found three ways for each seed: posts like the seed's best post, bios with
the seed's wording, and, for an Instagram seed, the marketplace's similar-creator search. Each is
credited to the seed that found it and is then scored like any other candidate. When no seed
qualifies, the tier is skipped and named as a gap.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
