---
name: Rotate and retire
owner: 20-promo-codes
---

# Rotate and retire

## What it does

Proposes a replacement for a leaking code, and turns off a retired code in the store after the person confirms it.

## Inputs

- From brand memory: the code's `affiliate` findings and the creator's newest `roster` finding.
- From the launch message: the codes to rotate or retire, and the store connection.

## Output

The new code and the old code's end date, a `code-live` draft telling the creator, and the retired codes marked `retired`. A code the store cannot turn off goes on the code sheet.

## Callable

Never user-callable. Only Promo Codes runs it.
