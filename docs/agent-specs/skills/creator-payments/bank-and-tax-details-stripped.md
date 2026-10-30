---
name: Bank and tax details stripped
owner: 18-creator-payments
---

# Bank and tax details stripped

## What it does

Removes bank details, tax ids and card numbers from anything pasted or uploaded before a row is shown, matched or kept.

## Inputs

- From brand memory: nothing.
- From the launch message: the pasted text or the uploaded CSV.

## Output

The same rows with each removed detail replaced by "[removed]", and a count by kind (bank, tax, card). The agent says once, in one line, how many were removed and that they were not saved. Nothing removed is shown, masked or logged, not even in the audit trail.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
