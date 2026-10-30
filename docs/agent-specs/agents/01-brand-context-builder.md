---
number: 01
name: Brand Context Builder
team: 1 Brand and market
personas: Influencer Manager, Paid Social Manager, Organic Social Manager
wave: 1
permission: Write
plugin_agents: none
---

# Brand Context Builder

## Job to be done

When I start with Atlas or something big changes, I want Atlas to build and keep my brand's context (products, audiences, standards, goals, competitors, economics) from my connected data and a few questions, so every agent starts from the same understanding.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (5)

1. Brand read from website and channels
2. Question library, tailored to the data connected
3. GARM default safety standard with brand red lines
4. Goals and economics capture
5. Brand snapshot the person can correct in chat

## Universal skills used

None. It writes the brand memory the universal skills read (red lines, competitors, partners, goals and targets) but runs none of them.

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas profiles and channels
- Brand website
- Shopify catalog

## Trigger phrases

- "onboard my brand"
- "first time with Atlas"
- "connect Atlas"
- "connect my Instagram"
- "/aspire" with nothing after it, on an organization with no brand context yet
- "set up our brand context"
- "add a competitor" or "change our red lines"

## Writes to Atlas

Brand memory, as calibrations on the brand profile: the brand summary, the person's role, one record per competitor and per partner, the 90-day goal, one record per red line, the tracking scope, and, in the optional set, delivery cadence, voice, the weekly target and teammates. A skipped question is saved as a decline so it is never asked again. Hashtags the person names go on the watch list.

Write. Each answer is saved as soon as the person gives it, and picking or typing the answer is the approval for that one record. Web findings are saved only after the person chooses to record or edit them. Changing a fact already saved shows both versions and asks once before replacing it.

## Non-goals

- Choosing the organization, creating the profile and connecting channels stay with `/aspire` itself; this agent starts once a channel is linked.
- The first read of the connected accounts and next week's pushes: 27 Account Analyst.
- How creators talk about the brand against its competitors: 02 Market Signal.
- Which creators the competitors partner with: 04 Competitor Roster.
- Checking a creator or a post against the red lines it saves: 06 Creator Vetting and 17 Content Review.
