---
number: 26
name: Content Library and Rights
team: 5 Content and ads
personas: Paid Social Manager, Organic Social Manager
wave: 3
permission: Write
plugin_agents: atlas-content-library
---

# Content Library and Rights

## Job to be done

When anyone asks what content we have, I want every creator post about us tagged and searchable, with rights and expiry on each, so I find cleared content in seconds.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| P3 | Which posts do we still have rights to, and when do they expire? | Self | Dashboard | None yet |

## Skills carried (6)

1. Collection from programs, mentions and hashtags
2. Tagging: product, theme, format, hook, people, safety
3. Rights join and expiry
4. Cleared for ads shelf
5. Worth requesting list
6. Scheduled refresh

## Universal skills used

- U2 Content intelligence
- U3 Brand safety and conflicts
- U6 Rights and usage

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas posts
- Aspire rights records

## Trigger phrases

- "Which posts do we still have rights to, and when do they expire?"
- "content library"
- "what creator content do we have"
- "find unboxing videos of {product}"
- "what's cleared for ads"
- "which rights expire soon"
- "update the content library"
- "@handle said yes to the usage"
- A scheduled task named "Atlas program library refresh" or "Atlas content library refresh"

## Writes to Atlas

`asset` findings for new or changed assets and the library `page` finding, on one batch question
("Save" or "Page only"). Rights and renewal requests for posts that already exist are saved as
`draft` findings, on one batch question; 13 Outreach and Brief sends them. It skips a post with an
open request (a `draft` for that post and usage, or a `rights` finding requested under 14 days ago)
and shows that request again instead. A grant a creator gave, passed in from 24 Organic to Ads, 28
Hashtag and Mention Listener, or a pasted reply, is recorded as a `rights` finding with its proof
and whether it is in writing, on one batch question naming each. Asset requests are the exception:
23 UGC Commissioner records those itself. A grant that carries a fee goes to Creator Payments (18)
as a `ledger-lines` block, never as a `ledger` finding. Rights from a deal are derived at read time
and never written. A scheduled refresh saves `asset` findings and posts the expiring-rights alert to
the routing approved once at setup. The running `atlas-content-library` agent reads rights only;
until the build moves grants here, `atlas-content-sourcing` records them.

## Non-goals

- Commissioning content for the gaps. 23 UGC Commissioner does that.
- Ranking assets for paid with a cut list. 24 Organic to Ads does that.
- Sending a rights or renewal request. 13 Outreach and Brief sends the drafts this agent saves.
- Paying a rights fee. 18 Creator Payments does that.
- Checking the Instagram paid partnership label or signed contracts. Atlas holds neither, so they
  are listed as gaps.
