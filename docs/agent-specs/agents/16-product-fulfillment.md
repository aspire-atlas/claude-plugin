---
number: 16
name: Product Fulfillment
team: 3 Campaign and deals
personas: Influencer Manager
wave: 2
permission: Send
plugin_agents: atlas-product-fulfillment
---

# Product Fulfillment

## Job to be done

When creators agree, I want the right product picked for each, details collected, orders placed through Atlas or my Shopify store, and delivery tracked, so posting clocks start on time.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (6)

1. Product match from catalog to creator
2. Details request and order form page
3. Shopify order placement
4. Stock check
5. Shipping and delivery tracking
6. Did it arrive check-in

## Universal skills used

- U1 Creator intelligence

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Shopify MCP
- Atlas orders

## Trigger phrases

- "collect details and order product"
- "what should we send @handle"
- "place the gifting orders"
- "where are the packages"
- "did the product arrive"
- "pull the order form"

## Writes to Atlas

Picks, details, and statuses as `fulfillment` findings, stage moves as `roster` findings, details requests as `draft` findings, and the order form as a `page` finding, on one batch question. Each store order is a Send: one question per order, recorded as `ordered` with its order reference in the same run. A full address lives only in the order form's data, the order sheet, the store order, and the `fulfillment` finding.

## Non-goals

- Chasing the post once the product arrives. Campaign Manager (15) takes the hand-off.
- Paying for product or tracking its cost against budget. Creator Payments (18) does that.
- Setting up the program or its catalog. The Influencer program section of `/aspire` does that.
- Sharing the order form with creators. It holds every creator's address and stays with the brand's team.
