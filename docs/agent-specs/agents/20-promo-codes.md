---
number: 20
name: Promo Codes
team: 4 Commerce and always-on
personas: Influencer Manager
wave: 2
permission: Send
plugin_agents: atlas-affiliate-manager
---

# Promo Codes

## Job to be done

When I use codes, I want unique codes created in Shopify per creator, leakage checked, and commission tiers set by what each code actually sells, so codes drive sales instead of eating margin.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (5)

1. Code pattern and creation in Shopify
2. Collision check against live codes
3. Leakage scan: coupon sites and unattributed use
4. Tiering rules by orders and revenue
5. Rotate and retire

## Universal skills used

- U5 Performance baseline
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Shopify MCP
- Web search

## Trigger phrases

- "set up codes for the affiliates"
- "create discount codes for the creators"
- "is anyone leaking our codes"
- "check coupon sites for our codes"
- "rotate @handle's code"
- "retire the dead codes"

## Writes to Atlas

Code records (`codeStatus` planned, live, or retired, with a `leakage` field when a scan flags one) as `affiliate` findings, the `code-live` drafts, and the page as a `page` finding, on one batch question. Creating, changing, or turning off a code in the store is a Send: one question per code, recorded in the same run. The coupon-site scan runs only when the person asks for it. Tier changes go back as `roster` rows for the Roster review section of `/aspire` to write.

## Non-goals

- The sales report and commission owed. Affiliate Program (19) does that.
- Changing a creator's commission outside the program's terms. Negotiator (14) does that.
- Sending a new code to a creator. It drafts the message; Outreach and Brief (13) sends.
- Deleting a code. A code is turned off, never deleted.
