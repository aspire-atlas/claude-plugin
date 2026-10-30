---
number: 07
name: Creator List Review
team: 2 Creator supply
personas: Influencer Manager
wave: 1
permission: Write
plugin_agents: atlas-creator-vetting
---

# Creator List Review

## Job to be done

When I already have a list (an export, a sheet, pasted handles, applicants), I want it cleaned, enriched, de-duplicated against my roster, and ranked against my criteria, so I can decide in one sitting.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| None | Vet a list | Self | Verdict | None yet |

## Skills carried (5)

1. List import from CSV, sheet or paste
2. Enrichment from Atlas
3. Dedupe against roster and past outreach
4. Rank and group by criteria
5. Applicant triage

## Universal skills used

- U1 Creator intelligence
- U3 Brand safety and conflicts
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas lookup
- Aspire exports
- Google Sheets

## Trigger phrases

- "vet this list"
- "review this list"
- "screen these applicants"
- "go through this Aspire export"
- The `list review` shortcut, also `review list`

## Writes to Atlas

The same saves as 06 Creator Vetting, since the same agent runs both. When the person picks
"Save" before the run, one batch confirmation covers one recommendation insight per creator on the
list and a run summary that records the list's name and source and the handles that could not be
read. The team's call on each creator is saved as a feedback insight under its own question. Notes
about single creators and lessons are saved as calibrations only after the person sees the
wording and chooses to save it. Fetching creators Atlas does not hold uses paid lookups, approved
for the named handles before the run.

## Non-goals

- The brand safety, competitor and disclosure checks and the recommendation rule themselves. That
  is 06 Creator Vetting.
- Finding creators who are not on the list. That is 05 Creator Search.
- One creator in depth, with what they would cost. That is 08 Creator Profile.
- Contacting the creators it ranks first. That is 13 Outreach and Brief.
- Changing a creator's status in the Aspire app. It reads the list and writes nothing there.
