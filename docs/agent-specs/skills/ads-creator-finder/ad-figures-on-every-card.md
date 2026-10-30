---
name: Ad figures on every card
owner: 09-ads-creator-finder
---

# Ad figures on every card

## What it does

Puts the creator's paid figures from Meta on every card, so a lane is cast on ad performance, not follower count.

## Inputs

- From brand memory: nothing.
- From the launch message: the candidates. Each one's `instagram` container is read from Atlas.

## Output

Per card: hook rate, Reels interaction rate, past paid partners (five at most, named), partnership
readiness, views, interactions, reach and engaged accounts labelled "(Meta)", category, contact
route, and the rankings that found them. A figure Atlas does not hold shows "Not in Atlas". Views
and interactions are never given a period, because Atlas holds none.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
