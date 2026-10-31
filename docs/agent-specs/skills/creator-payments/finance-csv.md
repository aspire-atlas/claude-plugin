---
name: Finance CSV
owner: 18-creator-payments
---

# Finance CSV

## What it does

Writes the ledger as a CSV that finance can import.

## Inputs

- From brand memory: the ledger lines as recorded, never proposed ones.
- From the launch message: `mode` (`export`), or the record pass of a build or payments run.

## Output

One CSV file, one row per line with its newest status, with the columns lineId, creator, kind, amount, currency, status, dueAt, invoiceRef and paidAt. Product and void lines are included. The chat output gives the file path, the row count, and the totals per currency and status.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
