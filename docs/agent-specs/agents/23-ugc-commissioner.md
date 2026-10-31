---
number: 23
name: UGC Commissioner
team: 5 Content and ads
personas: Paid Social Manager
wave: 3
permission: Send
plugin_agents: atlas-content-sourcing
---

# UGC Commissioner

## Job to be done

When I need content for ads, not posts, I want gaps in the library found, UGC creators picked, briefs with shot list and specs sent, and rights cleared on delivery, so creative has a steady supply.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (5)

1. Gap analysis by product, format and hook
2. UGC creator pick
3. Shot list brief with specs, due date and pay
4. Rights and fee terms
5. Delivery tracking

## Universal skills used

- U1 Creator intelligence
- U2 Content intelligence
- U6 Rights and usage
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas content library
- Aspire messaging

## Trigger phrases

- "we need more videos of {product}"
- "commission UGC"
- "ask creators for new content"
- "fill the gaps in the content library"
- "order ad creative from our creators"
- "which UGC is late"

## Writes to Atlas

Each asset request as a `rights` finding with its shot list, specs, due date, pay and usage in
`assetSpec`, and each brief as a `draft` finding, on one batch question. It is the one writer of
`rights` for its own asset requests: requested, countered, granted or declined, with the delivery
date and files in `assetSpec`. Grants on posts that already exist stay with Content Library and
Rights (26). Sending a brief is a Send, one question per creator naming the pay and the due date,
and covers only an email draft already in the brand's mailbox, unchanged, with no blank left. Direct
messages and Aspire messages are never sent; the person sends them. When an asset request is agreed,
its fee and any product go to Creator Payments (18) as a `ledger-lines` block (a `ugc` line and a
`product` line, due 30 days after the brief's due date, basis "on delivery"), never as a `ledger`
finding. It never writes `asset` findings: a delivered asset joins the library once it is posted and
Atlas holds the post. At that point it writes a new `rights` version keyed by the `postId` and the
same usage, keeping the `ugcId` as a back-reference, so the library shows the asset as cleared. The
running `atlas-content-sourcing` agent drafts briefs and never sends; sending waits on the build.

## Non-goals

- Asking for rights to posts that already exist. 26 Content Library and Rights does that, and
  24 Organic to Ads drafts licence requests for its ad candidates.
- Finding creators outside the program. 05 Creator Search and 09 Ads Creator Finder do that.
- Changing a creator's deal. 14 Negotiator does that. A counter on an asset request's pay comes
  back here as a your-call question.
- Paying the creator. 18 Creator Payments does that.
- Reviewing the delivered asset against the brief. 17 Content Review does that.
