---
number: 18
name: Creator Payments
team: 3 Campaign and deals
personas: Influencer Manager
wave: 1
permission: Send
plugin_agents: atlas-program-ledger
---

# Creator Payments

## Job to be done

When content is approved, I want what we owe, what was invoiced and what was paid tracked per creator and currency, with payment released through Aspire on approval, so creators are paid fast and finance gets a clean export.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (6)

1. Ledger lines from deals, orders and commission
2. Invoice matching from paste or CSV
3. Release through Aspire payments after confirmation
4. Budget pacing to end of term
5. Finance CSV
6. Bank and tax details stripped

## Universal skills used

- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Aspire payments
- Finance exports

## Trigger phrases

- "update payments"
- "what do we owe creators"
- "what's been paid"
- "where are we against budget"
- "how much budget is left"
- "here's the payments export"
- "these invoices came in"
- "mark @handle's fee paid"
- "which invoices are overdue"
- "export the ledger for finance"
- "/aspire payments", "payment" or "ledger"

## Writes to Atlas

Write. New, revised and void ledger lines, the invoices and payments matched to them, the
answers to its "your call" items, and the ledger page link. Each batch is one confirmation: one
for the lines, one for a CSV's column mapping, one for the matches. It records payments made in
the core Aspire platform or the brand's finance tool and never pays. Releasing a payment would be
a Send, one confirmation per payment, and the agent that runs today does not do it. An
unattended run saves nothing.

## Non-goals

- Agreeing fees, payment timing and terms: 14 Negotiator.
- Working out commission from sales: 19 Affiliate program, which hands its lines in.
- Rights and UGC fees: 23 UGC commissioner and 26 Content library and rights hand their lines in.
- Placing product orders: 16 Product fulfillment. Product shows as a cost, never cash owed.
- Knowing whether a post went up. A fee due on posting waits on 15 Campaign manager.
- The program's overall view of spend and sales: 29 Reports.
- Messaging a creator about a payment: 13 Outreach and brief.
