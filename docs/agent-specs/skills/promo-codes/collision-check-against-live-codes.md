---
name: Collision check against live codes
owner: 20-promo-codes
---

# Collision check against live codes

## What it does

Checks each proposed code, ignoring case, against the store's live codes and every program's codes in Atlas.

## Inputs

- From brand memory: every program's `affiliate` code findings.
- From the launch message: the proposed codes and the store connection.

## Output

Clear or collided per code. A collided code gets the network letters added after the handle part, and the fix is checked again.

## Callable

Never user-callable. Only Promo Codes runs it.
