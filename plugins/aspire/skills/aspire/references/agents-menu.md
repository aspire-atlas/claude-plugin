# List agents (the agents and run arguments)

Used by SKILL.md's **Arguments** for `agents` and `run {agent}`, with the hand-off table step 5
names (**Agents menu hand-off** below).

A bold section name with no file beside it (**Running agents**, **Prompt coach**) is another part of this skill;
`SKILL.md`'s **Sections** index names its file.

## List agents

Report every subagent the plugin ships, then let the user run one. Read the list from disk each
time so it never goes stale; never recite it from memory.

1. Resolve the plugin's `agents/` folder from this skill's base directory: it is two levels
   up, at `<base>/../../agents/`. Use `Glob` for `agents/*.md` there.
2. For each file, read the frontmatter with `Read`. Take `name`, the first sentence of
   `description` (stop at the first period; ignore any `<example>` blocks), and the quoted
   "Trigger on ..." phrases when the description has them.
3. Reply with one bullet per agent, sorted by name, in this shape:
   `**aspire:{name}**: {first sentence}` followed on the same line by "Trigger: {phrases}".
   Skip the trigger part when the description has none.
4. Then ask with `AskUserQuestion`, one question, header "Agent": "Which one do you want to
   run?" One option per agent, in the same order as the bullets. Label is the agent name
   without the `aspire:` prefix; description is what it produces in one line plus what it
   needs (for example "needs a linked channel with indexed posts"). The tool takes 2 to 4
   options and adds its own free text field, so never add a "None" or "Not now" option: if
   the answer names no agent on the list, say nothing further and stop. With more than four
   agents on disk, offer the first four and say in the question text that any other name from
   the bullets can be typed into the free text field.
5. On a selection, first ask with `AskUserQuestion`, header "Sample": "Want to see a sample of
   what {agent} makes before running it?" Options: "Show me a sample first (Recommended)" / "Run
   it now". A sample runs **Sample artifacts** and then asks once more whether to run it for real.
   Then hand off to that agent's section of this skill rather than launching the
   agent straight from here. Those sections own the connection check, the profile, and the
   confirmations each agent needs, per **Agents menu hand-off** below.

   Answers the **Prompt coach** already collected carry into the hand-off row (**Prompt coach**,
   Carry-over).

   Older agent names resolve per **Older agent names** below.

   An agent on disk that is not in that table: run Phase 1 and Phase 2 + 3, then launch it
   with the tool prefix, `profile_id`, `profile_slug`, the linked handles and networks, and `recipient`
   (**Reading the ask**), and relay
   whatever it asks the main thread to confirm.

Listing needs no Atlas connection, so do not run Phase 1 and do not render a connector card
before the question; run Phase 1 only once an agent is picked. If the `agents/` folder is
missing or empty, say so in one line and stop; never invent an agent and never offer one that
is not on disk.

## Agents menu hand-off

Where step 5 above hands each agent off. Each named section owns the connection check, the profile, and the confirmations its agent needs.

| Chosen agent | Hand off to |
| ------------ | ----------- |
| `atlas-profile-analyst` | Phase 1, then Phase 2 + 3 for the profile and handles, then Phase 6 (its target question first) |
| `atlas-ad-reuse` | Phase 1, then Phase 2 + 3, then **Ad reuse** (its window, sources, and save questions first) |
| `atlas-creator-profile` | Phase 1, then Phase 2 + 3, then **Creator profile** (it asks for the handle and network first) |
| `atlas-creator-brief` | Phase 1, then Phase 2 + 3, then **Creator brief** (its three questions first) |
| `atlas-creator-discovery` | Phase 1, then Phase 2 + 3, then **Creator discovery**, Setup if the campaign is new, then Run |
| `atlas-creator-vetting` | Phase 1, then Phase 2 + 3, then **Creator vetting**: the list first (R1), then Setup if it has never run (for a campaign's applicants, **Applicant review** instead), then Run |
| `atlas-content-review` | Phase 1, then Phase 2 + 3, then **Content review**, Setup if it has never run, then Review |
| `atlas-post-analysis` | Phase 1, then Phase 2 + 3, then **Post analysis** (it asks for the post first) |
| `atlas-daily-insights-report` | Phase 1, then Phase 2 + 3, then **Readouts**, Run with the daily cadence |
| `atlas-weekly-insights-report` | Phase 1, then Phase 2 + 3, then **Readouts**, Run with the weekly cadence |
| `atlas-market-signal` | Phase 1, then Phase 2 + 3, then **Market signal**, Setup if it has never run, then Run |
| `atlas-quarterly-signal` | Phase 1, then Phase 2 + 3, then **Quarterly signal** |
| `atlas-ppa-pitch` | Phase 1, then Phase 2 + 3, then **PPA pitch** (its questionnaire first) |
| `atlas-creator-outreach` | Phase 1, then Phase 2 + 3, then **Influencer program**: **Program setup** if no program is saved, then **Creator outreach** (it names the creators and asks the drafts and mailbox questions first) |
| `atlas-creator-negotiation` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Creator negotiation** |
| `atlas-product-fulfillment` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Product fulfillment** |
| `atlas-content-library` | Phase 1, then Phase 2 + 3, then **Content library** (its content, save, and alert questions first) |
| `atlas-affiliate-manager` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Affiliate manager** |
| `atlas-content-sourcing` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Content sourcing** |
| `atlas-deliverable-tracker` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Deliverable tracker** |
| `atlas-roster-manager` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Roster review** |
| `atlas-program-dashboard` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Program dashboard** |
| `atlas-program-ledger` | Phase 1, then Phase 2 + 3, then **Influencer program** (Program setup if no program is saved), then **Program ledger** |
| `atlas-campaign-orchestrator` | Phase 1, then Phase 2 + 3, then **Orchestrator** (Setup if it has never run) |
| `atlas-shops` | Phase 1, then Phase 2 + 3, then **Shops** (its shop and stage questions first) |
| `atlas-quality-review` | **Quality review** (it asks for the work to review first; Phase 1 and Phase 2 + 3 only when the Atlas re-check is wanted) |
| `atlas-camera-screen` | Phase 1, then Phase 2 + 3, then **Camera screen** |
| `atlas-cas-creative-review` | Phase 1, then Phase 2 + 3, then **CAS creative review** |

## Older agent names

Older agent names still reach the renamed agents: `atlas-account-analyst` is `atlas-profile-analyst`,
`atlas-daily-readout` is `atlas-daily-insights-report`, and `atlas-weekly-readout` is
`atlas-weekly-insights-report`. A launch that names `atlas-profile-analyst` with `target_mode`
`reuse` means `atlas-ad-reuse`, which took over reuse mode. A scheduled task or message that
names an old agent launches the new one; offer once, in an interactive session, to update the
task's prompt and name.
