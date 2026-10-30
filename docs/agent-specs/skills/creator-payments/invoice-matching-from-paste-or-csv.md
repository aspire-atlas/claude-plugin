---
name: Invoice matching from paste or CSV
owner: 18-creator-payments
---

# Invoice matching from paste or CSV

## What it does

Reads invoices and payments from pasted text or an uploaded CSV and matches each row to exactly one ledger line, never guessing.

## Inputs

- From brand memory: the ledger lines and their statuses, from the program's `ledger` findings and this run's build.
- From the launch message: the source (the pasted text, or the CSV file's path), any change to the column mapping, and the approvals for the mapping and the matches.

## Output

For a CSV, a proposed column mapping. For each row, either a match (the line, the event, the date and the reference) or an unmatched row with its reason and the closest lines. Short or over payments, reversals and backward moves come back as "your call" items. On the record pass the approved matches move each line to invoiced, approved or paid.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
