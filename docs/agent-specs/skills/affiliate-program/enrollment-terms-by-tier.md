---
name: Enrollment terms by tier
owner: 19-affiliate-program
---

# Enrollment terms by tier

## What it does

Sets each affiliate's tier, commission, and code discount from the program's saved affiliate terms.

## Inputs

- From brand memory: `program:{slug}-terms` for the tiers.
- From brand memory: each creator's newest `roster` and `terms` findings.
- From the launch message: named creators, or every affiliate and hybrid creator.

## Output

Per creator: the tier, the commission, the discount, and the source ("program terms"). Anything outside the terms comes back as a question for the person.

## Callable

Never user-callable. Only Affiliate Program runs it.
