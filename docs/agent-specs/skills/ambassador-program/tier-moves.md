---
name: Tier moves
owner: 22-ambassador-program
---

# Tier moves

## What it does

Proposes moving ambassadors up or down the program's tiers from their segment and quota.

## Inputs

- From brand memory: `program:{slug}-terms` for the tiers.
- From the launch message: the segments.

## Output

A proposed move per ambassador with its reason, returned as a `roster` row for the Roster review section of `/aspire` to write.

## Callable

Never user-callable. Only Ambassador Program runs it.
