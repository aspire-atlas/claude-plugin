---
name: Tiering rules by orders and revenue
owner: 20-promo-codes
---

# Tiering rules by orders and revenue

## What it does

Proposes each code's tier from its orders and revenue over the saved window, against the program's tier thresholds.

## Inputs

- From brand memory: `program:{slug}-terms` for the thresholds.
- From brand memory: Affiliate Program's (19) newest `affiliate` report findings for orders and revenue.
- From the launch message: the window, when the person names one.

## Output

A proposed tier per code with the figures behind it, returned as a `roster` row for the Roster review section of `/aspire` to write. A change outside the program's terms comes back as a question.

## Callable

Never user-callable. Only Promo Codes runs it.
