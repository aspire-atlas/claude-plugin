---
name: Product match from catalog to creator
owner: 16-product-fulfillment
---

# Product match from catalog to creator

## What it does

Picks one product per creator owed product, from the program's catalog, matched to their content and audience and inside the program's value limits.

## Inputs

- From brand memory: `program:{slug}-terms` and `program:{slug}-catalog`.
- From brand memory: each creator's newest `roster` and `terms` findings.
- From the launch message: named creators, or every creator at Agreed.

## Output

A proposed pick per creator with the reason, the value, and the options when known, plus the creators skipped and why.

## Callable

Never user-callable. Only Product Fulfillment runs it.
