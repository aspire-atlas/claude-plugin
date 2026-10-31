---
name: Shopify order placement
owner: 16-product-fulfillment
---

# Shopify order placement

## What it does

Places each confirmed order in the connected store, one at a time, or writes an order sheet when the store cannot take it.

## Inputs

- From brand memory: each creator's newest `fulfillment` finding for the order, so an order already placed is never placed again.
- From the launch message: the confirmed order rows and the store connection.

## Output

An order reference per order placed, recorded as `ordered` in the same run. Refused orders go on the order sheet.

## Callable

Never user-callable. Only Product Fulfillment runs it.
