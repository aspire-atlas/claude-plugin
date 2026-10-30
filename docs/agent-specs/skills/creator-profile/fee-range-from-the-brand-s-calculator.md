---
name: Fee range from the brand's calculator
owner: 08-creator-profile
---

# Fee range from the brand's calculator

## What it does

Prices a bundle of one post on each of the creator's channels from the brand's own rate card and the creator's median views.

## Inputs

- From brand memory: the saved rate card (`fees:rate-card`). Without one, it uses the Aspire recommended rates and says so.
- From the launch message: the network and handle.

## Output

Open, target and max fees with the rate label, each channel's median views, the single-channel target for the main channel, and "est. from engagement" where views were estimated. When the calculator gives no price, it returns "No price" and the missing input.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
