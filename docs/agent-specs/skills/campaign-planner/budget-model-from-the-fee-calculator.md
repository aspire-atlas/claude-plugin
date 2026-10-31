---
name: Budget model from the fee calculator
owner: 11-campaign-planner
---

# Budget model from the fee calculator

## What it does

Prices the planned deliverables with the brand's fee calculator and splits the budget into two or three scenarios.

## Inputs

- From brand memory: the `fees:rate-card` record, or the Aspire recommended rates when none is saved.
- From the launch message: the deliverables per creator, the channels, the budget posture, and each candidate creator's median views over their last 10 posts per channel.

## Output

Per creator, an open, target, and max fee for their bundle, labelled with the rate source, and scenario totals at target (practitioners only, one reach creator, mega reach). A creator or deliverable the calculator cannot price shows no fee, names the missing input, and stays out of the totals. Amounts are opening offers, never quotes.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
