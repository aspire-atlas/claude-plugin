---
number: 02
name: Market Signal
team: 1 Brand and market
personas: Influencer Manager, Paid Social Manager, Organic Social Manager
wave: 1
permission: Read
plugin_agents: atlas-market-signal
---

# Market Signal

## Job to be done

When I plan or report, I want to know how creators talk about us against competitors: share of voice, features compared, friction, the language spreading, so I can adjust messaging and briefs.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| O2 | What are creators saying about us vs. our biggest competitors? | Self | Readout | None yet |
| O3 | Leadership wants to know where we stand against competitors, and what to do. | VP of marketing | Readout | Validated (ASP-4527) |

## Skills carried (5)

1. Share of voice by competitor
2. Feature parity read
3. Language and framing tracker
4. Comparison video finder
5. Scheduled delivery to Slack and email

## Universal skills used

- U4 Market and competitor signal
- U2 Content intelligence

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas posts and creators
- Slack
- Gmail

## Trigger phrases

- "what are creators saying about us vs {competitor}"
- "how are we talked about compared with {competitor}"
- "where do we stand against competitors, and what should we do"
- "competitive signal"
- "share of voice"
- "market signal"
- "are we behind on features"
- A scheduled task named "Atlas market signal: {brand}"

## Writes to Atlas

Up to 12 findings per run with `append_insights`. An interactive run saves only when the person picked Save at launch, which is the one batch confirmation. A scheduled run saves under the standing approval given at setup. A leadership (O3) page saves nothing. The proposal page lists this agent as Read; the agent that runs is at Write level in `orchestration.md` section 7, which is the level `/aspire` confirms.

## Non-goals

- Setting up what it tracks (competitors, topics, readers, destinations, cadence) stays with `/aspire`'s market signal setup; the agent never interviews anyone.
- Saving new competitor records: 01 Brand Context Builder.
- Fetching a competitor Atlas does not index: 27 Account Analyst, as a review of that handle.
- The cut list for the comparison videos it ranks: 24 Organic to Ads.
- Which creators the competitors partner with: 04 Competitor Roster.
- Formats and sounds rising in the category: 03 Trend Scout.
- Writing the brief its campaign lens feeds: 13 Outreach and Brief.
- The weekly readout that can carry its parity and messaging sections: 29 Reports.
