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

## Skills carried (4)

1. Hook score (hook by 3 seconds, brand by 3 seconds, works muted)
2. Cut list with timestamps
3. Rights status join
4. Licence request drafts

## Universal skills used

- U2 Content intelligence
- U5 Performance baseline
- U6 Rights and usage

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
retention source and rights status. Licence requests are saved as `draft` findings on the same
question. It skips a post with an open request (a `draft` for that post and usage, or a `rights`
finding requested under 14 days ago) and shows that request again instead. Sending one is a Send
that 13 Outreach and Brief does, one question per creator. It never writes `rights`: a creator's yes
goes to 26 Content Library and Rights to record. On "Page only" it publishes and saves nothing, and
an unattended run saves nothing. The running `atlas-ad-reuse` agent drafts nothing; until the build,
licence requests go through `atlas-content-sourcing`.

## Non-goals

- Scoring the one post under a brief. 17 Content Review does that.
- A second-by-second breakdown of one post. 31 Post Analysis does that.
- Recording grants and tracking when they expire. 26 Content Library and Rights does that.
- Launching a post as a partnership ad. 25 Partnership Ads Launcher does that.
- Commissioning new content when nothing fits. 23 UGC Commissioner does that.
