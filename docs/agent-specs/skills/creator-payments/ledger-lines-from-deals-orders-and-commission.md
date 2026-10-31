---
name: Ledger lines from deals, orders and commission
owner: 18-creator-payments
---

# Ledger lines from deals, orders and commission

## What it does

Builds one ledger line for everything the brand owes or spends on the program, with a stable id so a rebuild never adds a line twice.

## Inputs

- From brand memory: the program setup records (term, budget, types, payment timing, usage fees, affiliate payout, product values), and the program's `terms`, `deliverable`, `fulfillment`, `affiliate`, `rights` and `ledger` findings.
- From the launch message: the program slug, `mode` (`build`), `pass`, any ledger lines handed in from other agents this session, named creators, and the approval that saves the lines.

## Output

One line per thing owed or spent: fees per deal or per ambassador month, product cost per order, commission per closed period, and rights or UGC fees. Each line has its kind, amount, currency, due date or "due on posting", status and basis. New, revised and void lines come back for one batch approval, and changes to a line past accrued come back as a "your call" item.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
