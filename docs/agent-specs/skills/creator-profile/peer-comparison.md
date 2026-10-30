---
name: Peer comparison
owner: 08-creator-profile
---

# Peer comparison

## What it does

Compares the creator with three or more peers on median engagement rate and median view rate.

## Inputs

- From brand memory: saved competitor records, used for the peer set only when the creator is one of them.
- From the launch message: any comparison accounts the person named, which come first in the peer set.

## Output

Grouped rates for the creator and each peer, the creator's rank (for example "2nd of 4"), how the peers were chosen and their follower band, and anything that makes the comparison uneven. Left out with fewer than three usable peers. It never starts discovery to find peers.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
