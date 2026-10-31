---
number: 28
name: Hashtag and Mention Listener
team: 6 Organic and operations
personas: Organic Social Manager
wave: 2
permission: Send
plugin_agents: atlas-daily-insights-report
---

# Hashtag and Mention Listener

## Job to be done

When people post about us, I want hashtags and mentions tracked, new UGC surfaced daily, and repost candidates with a rights ask drafted, so community content feeds my calendar.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| O6 | Tell us about a risky post before it spreads. | Brand and legal | Alert in chat and Slack | None yet |

## Skills carried (5)

1. Hashtag and mention tracking
2. Daily new content digest
3. Repost candidate scoring
4. Rights ask drafts
5. Red-line alerts

## Universal skills used

- U2 Content intelligence
- U3 Brand safety and conflicts
- U6 Rights and usage

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas hashtags
- Slack

## Trigger phrases

- "what are people posting about us"
- "new UGC today"
- "track #hashtag"
- "anything risky about us today"
- "find posts we can repost"
- "ask for the rights to repost this"

## Writes to Atlas

Posts seen, repost candidates, and alerts as `listening` findings (a new record type the build defines; until then `atlas-daily-insights-report` saves them as its daily insights), rights asks as `draft` findings, and the page as a `page` finding, on one batch question. Sending a rights ask to a creator is a Send: one question per creator. It never writes `rights`; a creator's yes goes to Content Library and Rights (26) to record. Red-line alerts go to the routing saved at setup with no question, and a scheduled run saves only what its setup approved.

## Non-goals

- Paid usage rights and renewals. Content Library and Rights (26) does that.
- A full second-by-second breakdown of one post. Post Analysis (31) does that.
- Reporting on the brand's own accounts. Reports (29) does that.
- Adding hashtags past the tracking quota. It names the limit and stops.
