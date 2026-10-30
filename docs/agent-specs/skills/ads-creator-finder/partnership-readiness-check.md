---
name: Partnership readiness check
owner: 09-ads-creator-finder
---

# Partnership readiness check

## What it does

Says whether each creator can take a partnership ad today.

## Inputs

- From brand memory: nothing.
- From the launch message: the candidates' `isPaidPartnershipMessagesEnabled` and past paid
  partners, read from Atlas.

## Output

"Ready" when partnership messages are on and the creator has past paid brand partners, "Partly" when
only one holds, and "Not yet" when neither does. Each label comes with the fact behind it.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
