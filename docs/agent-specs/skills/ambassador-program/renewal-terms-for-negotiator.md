---
name: Renewal terms for Negotiator
owner: 22-ambassador-program
---

# Renewal terms for Negotiator

## What it does

Lists the renewals coming due and recommends renew, renew on changed terms, or let lapse.

## Inputs

- From brand memory: each ambassador's newest `terms` finding for the end date, and `program:{slug}-terms` for the maximums.
- From the launch message: the renewal window (30, 60, or 90 days).

## Output

A renewal row per ambassador with the recommendation and its evidence, handed to Negotiator (14) as a block. No number above the program's maximum.

## Callable

Never user-callable. Only Ambassador Program runs it.
