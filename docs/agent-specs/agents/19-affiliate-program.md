---
number: 19
name: Affiliate Program
team: 4 Commerce and always-on
personas: Influencer Manager
wave: 2
permission: Write
plugin_agents: atlas-affiliate-manager
---

# Affiliate Program

## Job to be done

When I run affiliates, I want each creator enrolled with terms, sales by creator read from my store or affiliate platform, commission owed computed, and raises or retirements recommended, so the program grows on evidence.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (6)

1. Enrollment terms by tier
2. Sales import from Shopify, Impact, Refersion, ShareASale, Awin
3. Commission math per currency
4. Sales to post timeline
5. Portfolio moves: raise, hybrid, promote, retire
6. Hand-off to Creator Payments

## Universal skills used

- U1 Creator intelligence
- U5 Performance baseline
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Shopify MCP
- Affiliate platform exports

## Trigger phrases

- "affiliate report"
- "report sales and commission"
- "who's driving sales"
- "what do we owe in commission"
- "here's the Impact export"
- "enroll the affiliates"

## Writes to Atlas

Enrollment and the period's report as `affiliate` findings and the page as a `page` finding, on one batch question. Commission owed goes to Creator Payments (18) as a `ledger-lines` block, never as a `ledger` finding. It never writes `roster` or `terms`.

## Non-goals

- Creating, rotating, or retiring discount codes. Promo Codes (20) does that.
- Changing a creator's deal. Raises, hybrid moves, and promotions go to Negotiator (14).
- Paying commission. Creator Payments (18) does that.
- Setting up the program's affiliate terms. The Influencer program section of `/aspire` does that.
