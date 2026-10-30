---
name: Hand-off to Creator Payments
owner: 19-affiliate-program
---

# Hand-off to Creator Payments

## What it does

Packages each closed month's commission into lines Creator Payments (18) can record.

## Inputs

- From brand memory: the program's `ledger` findings, matched by `lineId`, so a line is never sent twice.
- From the launch message: the commission math.

## Output

A `ledger-lines` block with a stable line id per creator, month, and currency.

## Callable

Never user-callable. Only Affiliate Program runs it.
