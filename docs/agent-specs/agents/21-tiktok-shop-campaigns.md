---
number: 21
name: TikTok Shop Campaigns
team: 4 Commerce and always-on
personas: Influencer Manager
wave: 2
permission: Send
plugin_agents: atlas-shops
---

# TikTok Shop Campaigns

## Job to be done

When I run Shop campaigns, I want target invites sent, sample requests handled, open and targeted collabs tracked, and GMV by creator reported with next moves, so Shop becomes a steady channel instead of a side project.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (6)

1. Invite plan by tier and commission
2. Sample flow
3. Collab tracking
4. GMV and conversion report
5. LIVE plan
6. Policy risk notes

## Universal skills used

- U1 Creator intelligence
- U3 Brand safety and conflicts
- U5 Performance baseline
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- TikTok Shop Partner Center (both apps)
- Shopify catalog

## Trigger phrases

- "invite creators to our TikTok Shop"
- "handle the sample requests"
- "how is TikTok Shop doing"
- "TikTok Shop GMV by creator"
- "plan a TikTok LIVE"
- "which collabs are stuck"

## Writes to Atlas

Invites, samples, collabs, and the period's report as `shop-campaign` findings (a new record type the build adds to `program.md`), invite messages and collab chases as `draft` findings, and the page as a `page` finding, on one batch question. Each invite sent and each sample approved in Partner Center is a Send: one question per creator, recorded in the same run.

## Non-goals

- Finding and ranking Shop creators. TikTok Shop Creator Search (10) does that.
- Opening the Shop or planning its setup. That stays the setup plan in `atlas-shops`; this agent is its running side.
- Choosing a commission rate. It comes from the program's saved affiliate terms, or Negotiator (14).
- Paying creators. Creator Payments (18) does that.
