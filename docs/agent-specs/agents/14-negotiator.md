---
number: 14
name: Negotiator
team: 3 Campaign and deals
personas: Influencer Manager
wave: 1
permission: Write
plugin_agents: atlas-creator-negotiation
---

# Negotiator

## Job to be done

When a creator counters or asks about the deal, I want a priced recommendation (accept, counter with a number, add a non-cash lever, or walk) with the math shown, and the reply drafted, so I close fair deals inside budget.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (5)

1. Fee calculator with the creator's own numbers
2. Counter logic against standard terms and maximums
3. Non-cash levers (product, usage, exclusivity)
4. Terms summary for the agreement
5. Committed spend tracker

## Universal skills used

- U1 Creator intelligence
- U3 Brand safety and conflicts
- U5 Performance baseline
- U6 Rights and usage
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas creators
- Aspire agreements

## Trigger phrases

- "negotiate with @handle"
- "answer @handle's counter"
- "she asked for USD 2,000"
- "make offers to the creators who said yes"
- "what should we offer"
- "is this rate fair"
- "renew our ambassadors"
- "raise @handle's commission"
- "move @handle to paid"
- "creator negotiation"

## Writes to Atlas

Nothing on the first pass, which only proposes. After the person approves, one batch confirmation each: the offers, counters, walk-aways, renewals, and changes as offered terms; the agreed deals, with each creator moved to Agreed and a terms summary page published; the email drafts created in the brand's mailbox; and the negotiation page link. A number above the maximum, a change to the standard terms or deal type, or a deal over budget is saved only after the person answers that creator's own question. It never sends.

## Non-goals

- First messages, follow-ups, and sorting replies. That is 13 Outreach and Brief.
- Setting the campaign budget. That is 11 Campaign Planner.
- Shipping the product an agreement opens. That is 16 Product Fulfillment.
- Creating a creator's discount code. That is 20 Promo Codes.
- Recording what is owed and paying it. That is 18 Creator Payments.
- Deciding which ambassadors to renew. That is 22 Ambassador Program; this agent prices the renewal it recommends.
- Changing the program's standard terms or maximums. Program setup in `/aspire` does that; this agent only suggests the change.
