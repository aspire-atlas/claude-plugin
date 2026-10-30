---
name: Release through Aspire payments after confirmation
owner: 18-creator-payments
---

# Release through Aspire payments after confirmation

## What it does

Is meant to release a creator's payment through Aspire once the person confirms that one payment.

## Inputs

- From brand memory: the line to pay, with its amount, currency and status, from the program's `ledger` findings.
- From the launch message: the confirmation for that one payment.

## Output

Not built yet. The agent that runs today never pays and never moves money. It records a payment made in the core Aspire platform or the brand's finance tool, from that tool's export, and marks the line paid with the date and the payment reference.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
