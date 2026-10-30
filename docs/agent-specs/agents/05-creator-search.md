---
number: 05
name: Creator Search
team: 2 Creator supply
personas: Influencer Manager
wave: 1
permission: Write
plugin_agents: atlas-creator-discovery
---

# Creator Search

## Job to be done

When I have a brief, I want a ranked shortlist from Atlas, my own pipeline, lookalikes of creators that work, and the marketplace, with a fit reason for each creator, so I can start outreach the same day.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| I1 | Which creators should we contact for this launch, and why? | Self | Shortlist | Validated (ASP-4527) |

## Skills carried (5)

1. Brief parsing into criteria
2. Tiered sourcing (worked with us, posted about us, lookalikes, Atlas index, marketplace, web)
3. Fit scoring with evidence
4. Lookalike expansion from seeds
5. Living shortlist page with keep and drop

## Universal skills used

- U1 Creator intelligence
- U3 Brand safety and conflicts
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas creator search
- Creator marketplace
- Aspire pipeline

## Trigger phrases

- "find creators for the campaign"
- "creator discovery"
- "run discovery"
- "refill the shortlist"
- "who should we add to the shortlist"
- "find more creators like the ones that are working"
- "Which creators should we contact for this launch, and why?"
- A scheduled task named "Atlas creator discovery" or "Atlas creator shortlist"

## Writes to Atlas

Each run saves one insight per candidate it adds or re-scores, as an undecided candidate for the
campaign with its tier, source, fit score and evidence. The keep and drop calls a person makes on
the shortlist are saved as verdicts after one batch confirmation that names the handles being
dropped. Starting discovery work for creators Atlas does not hold uses credits, which `/aspire`
states before the run. A scheduled run works under the campaign's saved cadence and routing, which
the person approved once at setup. The campaign's brief, criteria, pool size, routing and cadence
are saved by `/aspire` during setup, with one batch confirmation, never by this agent.

## Non-goals

- Checking each candidate for brand safety, competitor deals and disclosure, and the final
  approve, maybe or reject call. That is 06 Creator Vetting, which builds the slate from this pool.
- Reviewing a list the team already has. That is 07 Creator List Review.
- One creator in depth, with what they would cost. That is 08 Creator Profile.
- Casting creators by their paid track record for partnership ads. That is 09 Ads Creator Finder.
- TikTok Shop affiliates. That is 10 TikTok Shop Creator Search.
- Contacting the creators who were kept. That is 13 Outreach and Brief.
