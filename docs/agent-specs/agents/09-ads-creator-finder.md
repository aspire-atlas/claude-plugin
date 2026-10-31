---
number: 09
name: Ads Creator Finder
team: 2 Creator supply
personas: Paid Social Manager
wave: 3
permission: Write
plugin_agents: atlas-creator-discovery, atlas-ppa-pitch
---

# Ads Creator Finder

## Job to be done

When I plan partnership ads, I want creators with proven paid performance (hook rate, interaction rate, partnership readiness) cast by persona lane, so I cast ads, not just posts.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| P4 | Cast creators into a partnership ads plan. | Budget owner | Plan (deck) | None yet |

## Skills carried (5)

1. Meta high ad performance and most ads experience rankings
2. Lane casting per product or audience
3. Ad figures on every card
4. Partnership readiness check
5. Gate slate for the agency team

## Universal skills used

- U1 Creator intelligence
- U3 Brand safety and conflicts
- U5 Performance baseline
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas ad search
- Meta partnership ads

## Trigger phrases

- "Cast creators into a partnership ads plan."
- "cast creators for partnership ads"
- "find creators for the creator ad campaign"
- "fill the lanes"
- "who has run ads well for brands like us"
- "casting deck"
- "PPA pitch"
- "build the pitch for round two"

## Writes to Atlas

Each creator it adds to a lane is saved as an undecided candidate with the lane, the rankings that
found them, and the ad figures, under the campaign's saved cadence: the standing approval set once
at setup, in interactive and scheduled runs alike. When the person saves the deck, one `cast`
finding per cast creator and one pitch `summary`, on one batch question. When the agency sends the
Gate 2 slate, one `roster` candidate per slate creator with the agency's pick note, confirmed by the
send itself. Today the CAS campaign section of `/aspire` writes those `roster` candidates; the build
moves them here. The ranking passes start creator marketplace searches, which use credits; `/aspire`
states the cost before the run, as it does for discovery. It never writes a client's decision on the
slate: those come back through the CAS campaign section of `/aspire`.

## Non-goals

- Ranking creators on TikTok ad performance. At launch it casts from Meta's rankings only: Atlas
  holds Meta's ad rankings and ad figures for Instagram, and Atlas has no TikTok equivalent.
  TikTok creators can still be cast from what Atlas holds, and their cards say "Hook rate is not
  available on TikTok." Revisit when Atlas holds TikTok ad results.
- Finding creators for organic posts or a gifting program. That is 05 Creator Search.
- Screening each lane's pool for brand safety, persona fit and paid track record. That is 06
  Creator Vetting run on the lane; this agent builds the Gate 2 slate from its newest run.
- Pricing and agreeing each creator's fee. That is 14 Negotiator.
- Pulling the client's decisions on the slate. The CAS campaign section of `/aspire` does that.
- Launching the ads. That is 25 Partnership Ads Launcher.
