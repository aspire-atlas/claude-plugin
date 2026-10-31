---
name: Stock check
owner: 16-product-fulfillment
---

# Stock check

## What it does

Reads stock for each picked product and option from the connected store before a pick or an order.

## Inputs

- From brand memory: `program:{slug}-catalog`.
- From the launch message: the picks and the store connection.

## Output

In stock, low, or out per pick, with the time it was read. An out-of-stock pick is flagged with an alternative from the catalog.

## Callable

Never user-callable. Only Product Fulfillment runs it.
