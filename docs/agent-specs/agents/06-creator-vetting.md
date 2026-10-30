---
number: 06
name: Creator Vetting
team: 2 Creator supply
personas: Influencer Manager, Paid Social Manager
wave: 1
permission: Write
plugin_agents: atlas-creator-vetting
---

# Creator Vetting

## Job to be done

When I have candidates, I want each one checked for fit, brand safety, competitor deals and disclosure habits, with a recommendation and the proof, so I only approve creators I can defend.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| I1 | Which creators should we contact for this launch, and why? | Self | Shortlist | Validated (ASP-4527) |
| I3 | A senior leader wants this creator. I need a point of view on why not. | The leader who asked | Verdict | None yet |
| None | Vet a list | Self | Verdict | None yet |

## Skills carried (6)

1. Brand safety screen on GARM tiers and the ban list
2. Fit against saved criteria
3. Competitor conflict check
4. Disclosure habit read
5. Approve, maybe, reject with evidence
6. Feedback saved as calibration

## Universal skills used

- U1 Creator intelligence
- U3 Brand safety and conflicts
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas creators and posts
- Aspire applicant lists

## Trigger phrases

- "vet these creators"
- "creator vetting"
- "which of these creators should we approve"
- "check these creators for brand safety"
- "A senior leader wants this creator. I need a point of view on why not."
- The `vet` shortcut, also `vetting`

## Writes to Atlas

When the person picks "Save" before the run, one batch confirmation covers one recommendation
insight per creator and a run summary. The team's own call on each creator is saved as a feedback
insight, and the question that asks for it says it will be saved, so it is its own confirmation.
Notes about single creators and lessons for every future vetting are saved as calibrations, each
shown in its final wording and chosen by the person before it is saved. A change to a record that
already exists goes back to `/aspire`, with its own confirmation. Fetching creators Atlas does not
hold uses paid lookups, approved for the named handles before the run. Vetting never runs on a
schedule.

## Non-goals

- Finding new creators. That is 05 Creator Search.
- Taking in a raw list, cleaning it and de-duplicating it. That is 07 Creator List Review, which
  runs these checks on the cleaned list.
- One creator in depth, with what they would cost. That is 08 Creator Profile.
- Contacting the approved creators. That is 13 Outreach and Brief.
- Agreeing fees and terms. That is 14 Negotiator.
- Reviewing a post before it goes live. That is 17 Content Review.
