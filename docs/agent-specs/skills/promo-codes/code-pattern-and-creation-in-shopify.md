---
name: Code pattern and creation in Shopify
owner: 20-promo-codes
---

# Code pattern and creation in Shopify

## What it does

Makes one code per creator from the program's code pattern and creates each confirmed code in the connected store.

## Inputs

- From brand memory: `program:{slug}-terms` for the pattern (default `{HANDLE}{PCT}`) and the discount.
- From brand memory: each creator's newest `roster` and `terms` findings. An agreed `terms.code` wins over the pattern.
- From the launch message: named creators, the store connection, and the codes the person confirmed.

## Output

A code per creator with its discount and status. A created code is `live`; a refused one stays `planned` and goes on the code sheet.

## Callable

Never user-callable. Only Promo Codes runs it.
