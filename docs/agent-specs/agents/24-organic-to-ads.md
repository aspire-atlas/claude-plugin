---
number: 24
name: Organic to Ads
team: 5 Content and ads
personas: Paid Social Manager
wave: 3
permission: Write
plugin_agents: atlas-ad-reuse
---

# Organic to Ads

## Job to be done

When I need ad creative, I want the brand's and creators' organic posts ranked on hook, retention and sound-off, with a cut list and rights status, so I license what will work before creative cuts it.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| P1 | Which creator posts should we run as ads, and how do we cut them? | Self and creative team | Plan | Validated (ASP-4527) |

## Skills carried (8)

1. Hook score (hook by 3 seconds, brand by 3 seconds, works muted)
2. Cut list with timestamps
3. Rights status join
4. Licence request drafts
5. Account map
6. Competitor and multi-brand screen
7. Organic fans worth asking
8. Found or briefed (two paths)

## Universal skills used

- U2 Content intelligence
- U3 Brand safety and conflicts
- U5 Performance baseline
- U6 Rights and usage
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas posts and media

## Trigger phrases

- "Which creator posts should we run as ads, and how do we cut them?"
- "best hooks"
- "pull the best hooks from last month's creator posts"
- "can we reuse creator content as ads"
- "what should we license"
- "send creative the good stuff to cut down"
- "cut list"

## Writes to Atlas

The ranked candidates, on one batch question: one `went_well` per leading hook pattern (three at
most) and one `action_item` per licensing candidate (six at most), each with its hook score, cuts,
retention source and rights status. Each licence request is saved as a `draft` finding and a
`rights` finding at `requested`, on the same question, so other agents see the request. It skips a
post by the brand, a competitor's video (one the competitor screen left out; a brand-led co-feature is kept), a creator with a saved reject or an open your-call question, an
asset blocked on brand safety, and a creator with no route. A request under 14 days old is shown
again, never drafted twice; one declined in the last 90 days is skipped; after 14 days with no
answer, the new draft is a follow-up on the same terms. Sending one is a Send that 13 Outreach and
Brief does, one question per creator. It writes no other `rights` status: the creator's answer
(granted, countered or declined) goes to 26 Content Library and Rights to record. On "Page only" it
publishes and saves nothing, and an unattended run saves nothing. The running `atlas-ad-reuse` agent
drafts nothing; until the build, licence requests go through `atlas-content-sourcing`. The account
map is proposed in the result packet (gate `approve-account-map`), and, when the person confirms it, saved by the main thread as the `ad-reuse:account-map` calibration after the same batch
question, or superseded to add new accounts; a saved map is followed, never proposed again. Each `action_item` carries a `snapshot` of the score's components and counts at the run,
so 25 Partnership Ads Launcher's learning compares results with what was known before launch.
Each `action_item` also carries its `path` (`found` or `briefed`) and the rule that placed it; the
page shows the two paths as two lists, never one ranking.

## Non-goals

- Scoring the one post under a brief. 17 Content Review does that.
- A second-by-second breakdown of one post. 31 Post Analysis does that.
- Recording grants and tracking when they expire. 26 Content Library and Rights does that.
- Launching a post as a partnership ad. 25 Partnership Ads Launcher does that.
- Commissioning new content when nothing fits. 23 UGC Commissioner does that.
