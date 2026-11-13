---
name: aspire
description: >
  Creative Intelligence on Aspire Atlas for brand, social, and influencer marketing teams.
  Connect Instagram, TikTok, and YouTube to see what's working, benchmark competitors, and check
  brand safety. Find, vet, and brief creators. Review posts, run influencer programs and creator
  ad campaigns, and get reports for whoever acts on them. Use for "/aspire" (with agents, help,
  getting started, fee calculator, or quality review), "what can /aspire do", "onboard my brand",
  "first time with Atlas", "connect Atlas", "connect my Instagram", "schedule the weekly
  readout", "find creators for the campaign", "vet these creators", "review this post", "which
  creator posts can we run as partnership ads", "build a PPA pitch", "start the CAS campaign for
  {brand}", "where is the {brand} campaign", "pull the client's decisions", "set up our
  influencer program", "where is the {program} program", "what do we owe creators", "what
  should we do next", or a short, vague ask ("find me people"), which the prompt coach tightens
  first.
metadata:
  author: Aspire
---

# /aspire: Atlas onboarding

Guide a new or returning user from zero to first insights on Atlas. Run the phases in order. Never skip Phase 1 when running the phases. Stop and resolve any phase that fails before moving on.

Tone for all user-facing messages: brief, plain language, no jargon about tools or servers. Refer to the connection as "Aspire Atlas" and the platform as "Atlas". Never expose internal tool names. The slash command is `/aspire:aspire` (plugin namespace), so use that form in any instruction that tells the user to re-run the skill.

## Contents

- [Before anything else: progress](#before-anything-else-progress)
- [Arguments](#arguments)
- [Sections (where each part of this skill lives)](#sections-where-each-part-of-this-skill-lives)
- [Model tiers (which model each agent runs on)](#model-tiers-which-model-each-agent-runs-on)
- [Routing by reader](#routing-by-reader)
- [Progress bar](#progress-bar)
- [Phase 1: Confirm the Atlas connection](#phase-1-confirm-the-atlas-connection)
- [Phase 2 + 3: Status, organization, and routing](#phase-2--3-status-organization-and-routing)
- [Questions and writes (every flow)](#questions-and-writes-every-flow)
- [Offers](#offers)
- [Organization admin (members)](#organization-admin-members)
- [Guardrails](#guardrails)

## Before anything else: progress

Every run that goes past listing agents or showing a sample starts here, before Phase 1 and
before routing the argument. Do both of these in your first tool calls:

1. **Load the progress tool.** Call `ToolSearch` with `select:mcp__aspire-mod__aspire_progress`
   (put it in the same call as any other load). It is a deferred tool, so it cannot be called
   until it is loaded. Skip it silently when ToolSearch does not find it.
2. **Keep the session's task list.** One task per step you report (the steps of the group now
   running, **Progress bar** below), with whichever task tool the session has: `TaskCreate` and
   `TaskUpdate`, `TodoWrite`, or the desktop app's own plan tool. Mark a task in
   progress when it starts and done when it ends, and replace the list when a new group starts or
   the plan changes. The Aspire bar reads that list as its steps, so it moves even when a progress
   report is missed; the progress tool adds the title and the phase.

## Arguments

Text after the command is the argument. Route on it before anything else:

| Argument | Action |
| -------- | ------ |
| `agents` (also `list agents`, `show agents`) | Run **List agents** (`references/agents-menu.md`). Skip the phases unless the user picks an agent to run. |
| `run {agent}` (an agent name from the list, with or without the `aspire:` prefix; the agents panel drafts this when someone presses an agent) | Skip steps 1 to 4 of **List agents** (`references/agents-menu.md`) and start at step 5 for that agent: the sample question, then its hand-off row. The agent itself always starts in a subagent (**Running agents**). An unknown name: run **List agents** from step 1. |
| `org` (also `change organization`, `switch org`; the progress bar's title drafts it) | Run Phase 1, then call `get_status`, ask which organization with `AskUserQuestion` (header "Organization", one option per organization, the selected one first; besides a bare run's selector in Phase 2 + 3 step 3, this explicit argument is the only time the question is asked), then call `get_status` again with `asOrganizationId` set to the choice (even when it is the organization already selected: the progress bar and credits follow the named call, not the default), and give the Phase 2 + 3 route summary. Change nothing in Atlas. |
| `getting started` (also `help`, `get started`, `start`, `guide`, `starter guide`, `what can you do`, `how does this work`) | Show the Atlas Starter Guide: publish the page in `references/first-run.md` (**7**, on request), say its link in one line (the page's "Seeing results" section lists "show cards", "always show cards", and "show the palettes"), then make the **Sample artifacts** offer for Atlas as a whole. It needs no Atlas connection, so skip the phases and Phase 1. When Atlas happens to be connected already, use the `On request` status line; otherwise none. Never answer these with a text summary instead of the page, and never run onboarding unless the user asks to set up. |
| `sample` (also `sample {agent}`, `show me a sample`, `example`) | Run **Sample artifacts** (`references/samples.md`). No Atlas connection is needed, so skip the phases. |
| `fee calculator` (also `fees`, `pricing`, `rate card`, `creator rates`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Fee calculator**. Skip the other phases. |
| `applicant review` (also `set up applicant review`, `applicant review setup`, `screening setup`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Applicant review**. Skip the other phases. |
| `program` (also `influencer program`, `creator program`, `ambassador program`, `affiliate program`, `gifting program`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Influencer program**. Skip the other phases. |
| `next` (also `what's next`, `next actions`, `orchestrator`, and the hourly "Atlas next actions" task) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Orchestrator**. Skip the other phases. |
| `cas campaign` (also `creator ad campaign`, `campaign manager`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **CAS campaign**. Skip the other phases. |
| `dashboard` (also `show the dashboard`, `my dashboard`, `where do we stand`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Organization dashboard**, on any organization. Skip the other phases. |
| `shops` (also `shop`, `instagram shop`, `tiktok shop`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Shops**. Skip the other phases. |
| `quality review` (also `review this deck`, `audit this deck`, `review this page`, `is this ready to send`, `check this before I share it`) | Run **Quality review**. It needs no Atlas connection unless the user wants the work's Atlas figures re-checked, so skip the phases until then. |
| `feedback {link}` (also `feedback on {link}`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Quality review**, Run step 7 (Feedback later). Skip the other phases. |
| `polish` (also `improve my prompt`, `coach`, `tighten this prompt`) | Run **Prompt coach**. It needs no Atlas connection, so skip the phases until "Run it now" hands the rewritten ask to a flow. |
| A shortcut: `vet`, `list review`, `campaign`, `content review`, `payments`, `reports`, `account` (and the aliases in `references/orchestration.md` **4**) | A routing hint only. Run Phase 1 and Phase 2 + 3 to confirm the connection and pick the brand profile, then run that shortcut's section per `references/orchestration.md` **4**, skipping only the "what do you need" step: memory, the setup reply, and every approval still run. Text after the shortcut is context. |
| empty, or anything else | In an unattended run (a scheduled task, whose prompt says not to ask questions), run Phase 1 and Phase 2 + 3, then the flow the text names, per `references/orchestration.md` **1**, Unattended runs. Otherwise run the phases in order, starting at Phase 1. Treat the text as context. On an unconfigured organization, Phase 2 + 3 publishes the first-run guide before the next phase (**First-run guide** there). With nothing after the command, a configured organization ends Phase 2 + 3 at **Organization dashboard**. |

## Sections (where each part of this skill lives)

This file is the router: it connects, settles the organization and brand profile, works out who is asking and for whom, and sends the request to one flow. Read a flow's file only once its job is chosen, and read nothing else from `references/` before that. A flow that launches an agent also reads `references/running-agents.md`, and so do onboarding and every setup section, for **Checkpoints**.

Other files, agents, and launch messages cite these sections as `SKILL.md` **{name}** or just **{name}**; this table says where each one lives, with its heading unchanged. No file under `references/` names another file there (only a launch message gives a subagent its brief's path): each cites a section by its name here. The first three rows are the shared files a flow reads with its own, with **Theme**, **Fee calculator**, **Creator card**, and the `page-standard` skill.

| Section (as cited) | File |
| ------------------ | ---- |
| **Artifact standard** (the mark and the source line on every page) | `references/artifact-standard.md` |
| **Orchestration contract** (the shape of every launch and result) | `references/orchestration.md` |
| **Recipient lens** (who the reader is: the lens catalog and cues) | `references/recipient-lens.md` |
| **List agents** | `references/agents-menu.md` (the hand-off table is **Agent hand-off** below) |
| **Running agents**, **Checkpoints**, **Reading the ask**, **Campaign plan**, **Examples library**, **Decision audit** | `references/running-agents.md` (the decision audit brief a subagent is handed: `references/agents/decision-audit.md`) |
| **Atlas tools** (the tool list and load order, Phase map, **Partnership content**, Destructive tools, Calibration kinds) | `references/atlas-tools.md` |
| Phase 1 guided add (1.1 steps 4 and 5, the one card rule, 1.3 to 1.4); **Connection card** | `references/connect.md`; `references/connection-card.md` |
| **Phase overview**, Phase 4, Phase 5; **Onboarding questions** | `references/onboarding.md`; `references/onboarding-questions.md` |
| Phase 6 (first insights, account review); **Account resolution** | `references/account-review.md`; `references/account-resolution.md` |
| **Organization dashboard** | `references/dashboard.md` |
| **Creator profile** | `references/creator-profile.md` |
| **Ad reuse**, **Partnership content** | `references/ad-reuse.md` |
| **Creator brief** | `references/creator-brief.md` |
| **PPA pitch**, **Aspire users** | `references/ppa-pitch.md` |
| **Meta Ads** | `references/meta-ads-tools.md` |
| **Creator discovery** | `references/creator-discovery.md` |
| **Creator vetting**; **Applicant review** (a campaign's applicant screening setup) | `references/creator-vetting.md`; `references/applicant-review.md` |
| **Creator CSV** | `references/creator-csv.md` |
| **Orchestrator** | `references/orchestrator.md` |
| **Influencer program** (Program setup, Program manager, Drafts) | `references/program.md` |
| **Creator outreach** | `references/outreach.md` |
| **Creator negotiation** | `references/negotiation.md` |
| **Product fulfillment** | `references/fulfillment.md` |
| **Deliverable tracker** | `references/deliverable-tracker.md` |
| **Affiliate manager** | `references/affiliate.md` |
| **Roster review** | `references/roster-manager.md` |
| **Program ledger** | `references/program-ledger.md` |
| **Program dashboard** | `references/program-dashboard.md` |
| **Content library** | `references/content-library.md` |
| **Content sourcing** | `references/content-sourcing.md` |
| **CAS campaign** (state model, setup, **1a** to **1c**, gates, **1f**, **1g**) | `references/cas-campaign.md` |
| **CAS campaign** **1d**, the campaign page: who sees what, header and tabs, round switcher, collapsing sections, **Home** | `references/cas-campaign-page.md` |
| **CAS campaign**, **Master Brief** (with **Loading the brief**) and **Creator Selection** (with **The creator viewer**, **The match score**) | `references/cas-campaign-page-brief.md` |
| **CAS campaign**, **Selected Creators** (with **Creator records**, **Contract and rates**, **The fee approval**) and **Content Review** | `references/cas-campaign-page-creators.md` |
| **CAS campaign**, **Ad Performance** (with **Compare**, **Changes for round {t}**), **Inbox**, **Tagging**, **History**, **Export**, the footer, **Where each part lives**, **Page mechanics**, **Editing in place**, **Design standards** | `references/cas-campaign-page-results.md` |
| **CAS campaign** **1e**, the page data: what the page keeps, program files and the scan, **The activity log**, tags and the inbox, reset decisions, brief versions, the role and edit checks | `references/cas-campaign-data.md` |
| **Hooks and CTAs** (a CAS campaign's recommendations and the hook review) | `references/hooks-and-ctas.md` |
| **Rates and terms** | `references/rates-and-terms.md` |
| **Content review** | `references/content-review.md` |
| **Post analysis** | `references/post-analysis.md` |
| **Shops** | `references/shops.md` |
| **Readouts** (its Schedule is the scheduling steps other flows follow) | `references/readout.md` |
| **Market signal** | `references/market-signal.md` |
| **Quarterly signal** | `references/quarterly-signal.md` |
| **Theme** (Setup, Applying) | `references/theme.md` |
| **Fee calculator** (Setup, Applying) | `references/fees.md` |
| **Theme**, Offers; **Fee calculator**, Offers; **Quality review**, The offer | `references/offers.md` (when: **Offers** below) |
| **Sample artifacts** | `references/samples.md` (the sample brief every agent reads: `references/agents/sample-artifact.md`) |
| **Quality review** (Run, Review log); **Reader standard** (R1 to R14) | `references/quality-review.md`; `references/reader-standard.md` |
| **Prompt coach** (and its Carry-over) | `references/prompt-coach.md` |
| **Creator card** (**Visual output**, **Creator card actions**) | `references/creator-card.md` |
| **Question format rule**, Phase 5 supersede rule | **Questions and writes** below |
| Phase 5 web research rule | `references/onboarding.md` (Phase 5, **Web research option**) |
| The Atlas Starter Guide | `references/first-run.md` |

### Agent hand-off

Where **List agents** step 5 hands each agent off. Each named section owns the connection check, the profile, and the confirmations its agent needs.

| Chosen agent | Hand off to |
| ------------ | ----------- |
| `atlas-profile-analyst` | Phase 1, then Phase 2 + 3 for the profile and handles, then Phase 6 (its target question first) |
| `atlas-ad-reuse` | Phase 1, then Phase 2 + 3, then **Ad reuse** (its window, sources, and save questions first) |
| `atlas-creator-profile` | Phase 1, then Phase 2 + 3, then **Creator profile** (it asks for the handle and network first) |
| `atlas-creator-brief` | Phase 1, then Phase 2 + 3, then **Creator brief** (its three questions first) |
| `atlas-creator-discovery` | Phase 1, then Phase 2 + 3, then **Creator discovery**, Setup if the campaign is new, then Run |
| `atlas-creator-vetting` | Phase 1, then Phase 2 + 3, then **Creator vetting**, Setup if it has never run (for a campaign's applicants, **Applicant review** instead), then Run (it asks for the list first) |
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

## Model tiers (which model each agent runs on)

Basic work (reading what Atlas holds, publishing a page, drafting a message) runs on a smaller model to save tokens. Work that decides money, rights, brand safety, or a creator's fate, reads video frames to judge them, or synthesizes across many saved records runs on the session's model. The same `model:` is in each agent file's frontmatter; this table decides what the main thread passes, and `scripts/check-agent-roster.sh` fails when the two disagree. `inherit` means the session's model: pass no `model`. No agent runs on Haiku: every one reads many records or writes a long page, which Haiku's smaller context window cannot be trusted with. Someone who wants it can still say "use Haiku".

| Agent | Model | Why |
| --- | --- | --- |
| `atlas-post-analysis` | inherit | Reads video frames and audio, times every brand and profanity instance, and judges brand safety |
| `atlas-content-review` | inherit | Brand safety and brief verdict from frames, a go or no-go creators act on |
| `atlas-creator-vetting` | inherit | Approve, Maybe, or Reject on brand safety for a whole list, with evidence on each |
| `atlas-creator-negotiation` | inherit | Prices deals against the program's ceilings and decides what goes to the user |
| `atlas-creator-brief` | inherit | Turns posts, signals, and fee rates into deliverables, creators, and a priced plan |
| `atlas-ppa-pitch` | inherit | Casting, rights package, and investment in a client-facing slide deck |
| `atlas-quarterly-signal` | inherit | Leadership's one-page story rolled up from a quarter of saved findings |
| `atlas-campaign-orchestrator` | inherit | Ranks next actions across every record; its page drives approved actions |
| `atlas-quality-review` | inherit | Its verdict decides whether work reaches a client, a creator, or leadership |
| `atlas-profile-analyst` | sonnet | Reads one account's posts and ranks patterns against stated medians |
| `atlas-ad-reuse` | sonnet | Scores hooks from numbers and frames by a fixed rubric; rights come from saved records |
| `atlas-creator-profile` | sonnet | One creator's page from held data and the fee calculator; writes nothing |
| `atlas-creator-discovery` | sonnet | Scores candidates against saved criteria; the user decides each one |
| `atlas-daily-insights-report` | sonnet | Short templated report against a baseline |
| `atlas-weekly-insights-report` | sonnet | Templated comparison and ranked next steps |
| `atlas-market-signal` | sonnet | Aggregation and a read per team against saved competitors |
| `atlas-creator-outreach` | sonnet | Drafts messages within the saved offer terms; nothing sends unconfirmed |
| `atlas-product-fulfillment` | sonnet | Picks product within saved value limits and tracks orders |
| `atlas-affiliate-manager` | sonnet | Codes and commission from the program's terms and an export; the user confirms writes |
| `atlas-content-library` | sonnet | Tags and joins records by rule; rights are read from saved records only |
| `atlas-content-sourcing` | sonnet | Terms come from the program's saved usage fees or the user's number; the user confirms |
| `atlas-deliverable-tracker` | sonnet | Matches posts to deliverables by rule; never forces an unsure match or waives a post |
| `atlas-roster-manager` | sonnet | Segments creators by saved measures; recommends only |
| `atlas-program-ledger` | sonnet | Records and matches rows exactly, leaves doubtful ones unmatched, never pays |
| `atlas-program-dashboard` | sonnet | Shows saved numbers against goals; acts on nothing |
| `atlas-shops` | sonnet | A plan from held data; platform rules hedged and never stated without a source |

Record the model in the decision log's launch line (**Decision audit**) as one clause ("on
sonnet", "on the session model", "on opus by request").

## Routing by reader

When the ask names no flow, route by the primary lens **Reading the ask** reads
(`references/running-agents.md`; the catalog and cues are in `references/recipient-lens.md`):

| Primary lens | Ask shape | Flow |
| ------------ | --------- | ---- |
| `product`, `pmm` | What creators say about the brand vs. competitors | **Market signal**, then offer to schedule it weekly and add the lens to the weekly readout |
| `product`, `pmm` | How our own accounts compare | Phase 6, mode `own` |
| `leadership` | This quarter, QBR | **Quarterly signal** |
| `leadership` | This week | **Readouts**, weekly, with the lens |
| `growth` | Which creators drive results, where to spend | **Readouts**, weekly, with the `growth` lens, then offer lookalikes in **Creator discovery** |
| `campaign` | A launch or dated campaign that needs creators | **Campaign plan** (**Reading the ask**) |
| `brand` | Is this post safe or on brand | **Content review** |
| `brand`, `performance` | What is in someone's post, how it did, and whether to sponsor, partner with, or reuse it (no brief) | **Post analysis** |
| `brand`, `campaign` | Which creators on a list to approve, or how a campaign's applicants are screened | **Creator vetting** (a campaign's applicants: **Applicant review** first, then vetting with the review) |
| `performance`, `creative` | Hooks, ads, licensing, a cut list | **Ad reuse**; for one post, **Content review** with the ad reuse check |
| `leadership`, `performance` | A pitch or casting deck for partnership ads, whitelisting, creators to license | **PPA pitch** |
| `performance` | Which creator posts the brand can run as partnership ads now, permissions, an ad code | **Partnership content** |
| Any | What to do next across everything, what needs me, where everything stands | **Orchestrator** |
| `team` | Anything | The flow the ask names |

A launch ask that spans several agents follows **Campaign plan** (**Reading the ask**).

## Progress bar

In Claude Code, the optional `aspire-mod` plugin can draw an Aspire progress bar above the prompt. If the tool
`mcp__aspire-mod__aspire_progress` appears among your tools, including as a deferred tool, it is
available: a deferred tool only needs loading first with ToolSearch
(`select:mcp__aspire-mod__aspire_progress`). Onboarding reports its three groups per
`references/onboarding.md` (**Progress bar: the onboarding groups**).

Agents never call it (a subagent's call is ignored); they report their own steps on their panel row with `mcp__aspire-mod__aspire_step`, which the agent files describe.

**Every other flow reports its own steps, never onboarding's.** When a flow starts (the creator
brief, discovery, vetting, a review, a readout, the orchestrator, a program step, and the rest),
call it once with that flow's name as `title` and the steps this run will take as `tasks`, in
order, a few words each ("Read the account", "Find creators", "Publish the brief"). A new
`title` starts a new run, so the onboarding steps are gone. Call it again as each step finishes
with `done` (or `done: true` on finished steps) and `phase` naming the step in progress, re-send
`tasks` when the plan changes, and send `finished: true` when the flow ends.

Launch each agent with an Agent `description` equal to the task it runs. The bar then marks that
task done when the agent finishes and names it while it runs, even if you forget to report. A
session that never reports still shows the agents that ran as its steps.

The bar shows only where the host draws the slot above the prompt, so the tool's result ends
with `band: ...`. Decide the channel once per run, from the first call:

| Result | Channel |
| ------ | ------- |
| `band: visible on ...` | The bar only |
| `band: hidden-by-user` | Nothing extra |
| `band: not-drawn` or `band: unknown` | The task list you already keep. The mod shows a one-line progress under the prompt itself, so write no progress line in chat. |
| Tool missing | The task list you already keep |

- **Task list:** the one kept from the top, one task per step of the group now running, replaced when the next group starts. It shows in the host wherever the bar does not.
- Keep calling the progress tool every phase, even when falling back.
- Subagents never report. Never name the tool or the fallback to the user.
- **Coach card.** The tool's optional `coach` field (`{ verdict, step }`, at most 140 and 30
  characters) draws the **Prompt coach** verdict as a card above the bar; `coach: null` or
  `finished: true` clears it. Only the main session sets it.

## Phase 1: Confirm the Atlas connection

### 1.1 Detect

Check whether Atlas tools are available in this session before doing anything else.

1. Call `ToolSearch` with query `+Aspire_Atlas get_status` and `max_results: 20`.
2. Treat the connection as **live** when at least one returned tool name contains
   `aspire_atlas` or `atlas__` (case-insensitive). Typical patterns: `mcp__Aspire_Atlas__*`
   (bundled with this plugin or org-installed, the normal case), `mcp__plugin_aspire_Aspire_Atlas__*`
   on clients that namespace plugin servers, `mcp__claude_ai_Aspire_Atlas__*` for a connector
   added in claude.ai settings, or `mcp__atlas__*` from Claude Code. A bare `atlas` substring
   is not enough: it also matches Atlassian tools. Ignore any name containing
   `organization_admin`: that is the bundled admin connector, whose name also contains
   `aspire_atlas`, never the Atlas data connection. A match whose only tools are `authenticate`
   and `complete_authentication` is a copy that is not signed in. When several prefixes match,
   use the one that has `get_status`; if none has it, go to 1.3c (`references/connect.md`).
3. If ToolSearch returns nothing, also scan the deferred tool list in context for the same
   patterns.
4. If still nothing, follow `references/connect.md` from 1.1 step 4: the one `ListConnectors`
   call, the one connector card, and the guided add (1.3 to 1.4). Come back here at 1.5.

### 1.2 If live

- Load the core Atlas tools in one `ToolSearch` call (see `references/atlas-tools.md`
  for the tool list and load order), with `report_checkpoint` in the `select:` list.
- Tell the user in one line that Atlas is connected, then proceed to Phase 2.

### 1.5 Record outcome

Note the result for later phases: `atlas_connected = true|false`, and the tool name prefix
actually observed (used to resolve tool names in `references/atlas-tools.md`). The plugin also
bundles **Aspire Atlas Organization Admin** for the organization's members. Phase 1 never checks
it; the `org-admin` skill does (see **Organization admin**).

### 1.6 Always allow Atlas tools

Scheduled runs stall on the first Atlas permission prompt unless the user sets Aspire Atlas's
tools to Always allow. `references/connect.md` **1.6** holds the block, when to show it (the
first-run guide and every question that approves a schedule) and how to word that question.

## Phase 2 + 3: Status, organization, and routing

Tool prefix: the one observed in 1.5 (for the org-installed connector it is `mcp__Aspire_Atlas__`).
Every Atlas tool requires a `context` argument: `[<runId>]` (the current run's id, `aspire-…` for
this skill's own flows), then 15 to 25 words, third person, on why the call is made (the id
prefix does not count). A call outside any run has no prefix; never invent or reuse an id.
Write a fresh `context` per call.

1. Call `get_status` once. It returns organizations, the selected org, its profiles, and each
   profile's connected channels (including expired authorizations).
2. **Auth check.** An unauthorized error means the connector token lapsed: render one connector
   card (Phase 1 rules) with "Aspire Atlas needs a fresh sign in. Click Connect above."
3. **Organization.** On a bare `/aspire:aspire` run interactively (nothing after the command,
   not unattended) where the caller belongs to more than one organization, the organization
   selector comes first and comes alone. The `get_status` call in step 1 draws it where the host
   renders the tool's widget. End the turn there: no bullets, no summary, no first-run guide, no
   dashboard, and no other tool call or question in that reply; one line only, "Pick the
   organization above, then say continue." A pick in the widget does not post a message: it
   records `selectedOrganizationId` in the model context, so the user's next message is what
   resumes the run. On that message use the `selectedOrganizationId` the widget recorded; with
   none, match a typed name to the organizations in that result, ignoring case; with no match
   or more than one, ask with `AskUserQuestion`. Then call `get_status` again with that
   `asOrganizationId`, and only then go on to step 4. Where the host draws no widget, or you
   cannot tell (Claude Code's terminal, plain-text hosts), ask with `AskUserQuestion` instead
   (header "Organization", one option per organization, the selected one first) and continue
   from the answer the same way. With exactly one organization there is nothing to pick: go
   straight to step 4.
   Every other run (an argument, context, or a named flow): when `get_status` already returns a
   selected organization, use it without asking which one: name it once in the summary and add
   "say /aspire:aspire org to switch". Ask only for the explicit `org` argument (the `org` row),
   or when none is selected and several exist (`AskUserQuestion` with the org names).
   Keep passing `asOrganizationId` (that org's `id`) explicitly on every later call, since the
   server is stateless; after an explicit choice call `get_status` again with it, even when it
   is the one already selected: the progress bar and credits follow the named call.
4. **Route.**
   - `profiles` empty → **new org**. Go to Phase 4.
   - Profiles exist, none with a connected channel → **profile only**. Skip 4.1, go to 4.2
     with the existing profile (ask which one if several).
   - Profiles with channels → **existing**. With nothing after the command, go straight to
     **Organization dashboard** with no summary first: it replaces the bullets, the Phase 5 gap
     check, and the offers. With an argument or context, give a 3 to 5 bullet summary (profile,
     channels, any expired auth), then run
     the Phase 5 gap check and offer Phase 6, the weekly creator brief (see **Creator brief**
     below), or a re-connect for expired channels.
5. **First-run guide.** When the phases run from the top (empty argument or onboarding
   context, never a named flow) and the organization is unconfigured (new org, profile only,
   or existing with no brand context on any linked profile, from the Phase 5 calibration
   read), publish the starter page in `references/first-run.md` once per organization per
   session, say one line with the link, add the always-allow block (**1.6**), and continue at
   the route's phase in the same reply.
   On a bare run it waits for the organization pick in step 3, like everything else.
   It runs only after `get_status` answered (Phase 1 finding Atlas not connected gets the guided
   add alone), never blocks or replaces a phase, and never runs unattended. The reference holds
   the trigger and re-run rules.

Once a profile is chosen or created, keep its `id` as `profile_id` and its `slug` as
`profile_slug`. Pass `asProfileId` = `profile_id` to every Atlas tool whose schema takes it (or
`asOrganizationId` = the org's `id` where a flow says so); tools reject slugs.
`create_profile` takes `asOrganizationId` only; `get_job_status`,
`list_creator_marketplace_labels`, `list_*_search_fields`, `list_my_*` and `mint_run_id` take neither. The slug is
for naming only: record keys, file names, and the profile slug handed to agents. Never
construct either value. When `profile_id` is missing (a resumed session, or a scheduled run
whose prompt names only the brand), re-read it with `list_my_profiles` and match the brand by
profile name (exact, ignoring case) across `organizations[].profiles[]`. An unattended run that finds no match or
more than one publishes the "setup needed" card and stops; it never asks and never falls back
to unattributed calls.

Speak in handles and brand names. Never surface slugs, ids, or tool names.

## Questions and writes (every flow)

These were Phase 5's rules; every flow follows them, and flows cite them as the question format
rule and the Phase 5 supersede rule.

**Question format rule (applies to every question in this skill):** every question goes
through `AskUserQuestion`, never as plain text in a reply. The tool requires 2 to 4 options, so
each question ships with a prepared option set from the reference file; the tool adds its own
free text field, so never add an "Other" or "Skip" option. Offer "Skip" only as a normal
option where the reference file lists it. Open questions (brand summary, competitors) still
get options: the options are starting points, and the free text field carries the real answer.
If a question truly has one path, state it and continue; do not ask.

**Follow-ups and missing details use the same tool.** A follow-up, a detail an earlier answer
left open (a product name, a date, a niche, a handle), and an option answered with no typed
detail all stay `AskUserQuestion`s. Never ask them as chat text or through a `wrap_up` reply
button, and never hand the user a template to fill in.
Every such question comes with suggestions and a blank: 2 to 4 options inferred from brand
memory, earlier answers in this session, the saved calibrations, or a quick web check of the
brand's own site, each worded as a complete answer (for example a real product from the site, or
"No date yet"), plus the tool's free text field for anything else. Put what the free text field
is for in the question ("Type the product name and date, or pick the closest option"). When a
reply still holds a `[placeholder]` or an empty field, it is not an answer: ask again with
better suggestions, and never invent the missing value. A question that waits on the user is
asked with the tool, so it stays visible and answerable where the user is looking.

**Calibration writes (the Phase 5 supersede rule):**

- `key-exists` on write: read the current record, show both versions, and call
  `supersede_calibration` with the record's `ifVersion` only if the user confirms the change.
- Outcome `proposed` means the user's role could not apply that kind. Say so in one line and
  move on; the suggestion is recorded for an admin.
- If the user declines a question, record it with kind `decline` so it is not asked again.

## Offers

Offers other flows make, each at most once per session, never in an unattended run, and never by
an agent. Their wording and skip rules are in `references/offers.md`; read it at these moments:

- **Theme**: at the end of Phase 5, and before the first page-producing flow the user starts in a
  session (the creator brief, creator discovery, a content review, a readout, or a page the
  user asked for under **Visual output**).
- **Fee calculator**: at the end of Phase 5, after the theme offer, and the first time in a session
  a flow shows a creator fee from the Aspire recommended rates, after that flow's reply.
- **Quality review**, with the decision audit in the same call: when an agent's page or a
  main-thread page is published.
- **Samples**: whenever someone asks what an agent does, what Atlas can do, or about a flow by
  name, follow **When to offer** in `references/samples.md`.

## Organization admin (members)

Questions about who is in the organization, pending invitations, or inviting a teammate
belong to the `org-admin` skill (`/aspire:org-admin`). Hand off by invoking it with the
`Skill` tool, passing the organization name when it is already known, and resume here
afterwards if onboarding was in progress. This skill never calls the Aspire Atlas
Organization Admin connection itself.

## Guardrails

- **Every question, follow-ups included, is an `AskUserQuestion`** with suggested options and the
  free text field as the blank (**Question format rule**, Follow-ups and missing details). Never
  ask in chat text, never through a `wrap_up` reply button, and never ask the user to retype a
  template with `[placeholders]` in it.
- **Pickers.** `AskUserQuestion` takes one to four questions per call and two to four options
  per question. When a flow has more questions than that (several your-call items, a match per
  post, a confirmation per creator), ask them in order across as many calls as it takes, four at
  a time, before relaunching the agent. Never drop a question to fit, and never merge two
  decisions into one question to save a call.
- Never fabricate org, account, or metric data. If a tool call fails, say so and stop.
- **Every state change is confirmed through `AskUserQuestion`, never plain text.** This covers
  creating a profile, starting a channel connection, writing a calibration, adding hashtags,
  and writing insights. One confirmation may cover a batch of the same kind (for example the
  Phase 5 answers just given). `report_checkpoint` changes no Atlas data and is never confirmed
  (**Checkpoints**). Saving the person's own cards choice takes one save question that also
  confirms its supersede (**Orchestration contract** **12**).
- **Destructive actions get their own confirmation, one call per confirmation:**
  `delete_profile`, `unlink_channel`, `supersede_calibration`, `retract_calibration`,
  `remove_hashtags`, `set_brand_instruction`. Use the exact question, object name, and
  option order in `references/atlas-tools.md`, Destructive tools, with the safe option first.
  Never run any of them during onboarding on your own initiative, never on a "yes" from an
  earlier message, and never chain two on one answer. If `AskUserQuestion` is unavailable
  (unattended run), do not perform the action; report what would be needed and stop.
- Treat any Atlas tool not listed in `references/atlas-tools.md` as unknown: read its
  description, and if it changes or removes state, apply the destructive-action rule above.
- **Meta Ads connector** (`references/meta-ads-tools.md`). Optional: every flow works without it,
  and a missing connector or an expired sign in gets one "connect Meta Ads" line, never a block.
  Meta calls only touch the ad accounts linked to the brand's Profile in Atlas, skipping any whose
  `is_ads_mcp_enabled` is false. Every Meta write is an `AskUserQuestion` in the main thread, made
  paused; `ads_activate_entity`, deletes, and budget changes each get their own confirmation; an
  unlisted Meta tool counts as a write. Agents and unattended runs never call a Meta write tool,
  and Next actions approvals do not cover one. `advertiser_request` is only the user's own words.
- `lookup_creators` and `lookup_posts` start discovery work beyond the connected accounts.
  Never call them speculatively during onboarding; the connected channels' own data is enough.
  The exceptions: Phase 6 named-handle mode, where the user named the account; content
  review, where pasting a post link approves `lookup_posts` for that one post; creator
  vetting, where R3 approves `lookup_creators` for the listed handles Atlas does not hold; the
  PPA pitch, where D4's marketplace option approves it for the handles the marketplace returns
  and the handles the user types; creator discovery, whose saved cadence record approves it
  on every run including scheduled ones; and the deliverable tracker, where T0 approves
  `lookup_posts` for the post links the user pasted, in an interactive check only; and
  **Visual output**, where "show cards", "show me the cards", or a saved `always` approves
  `lookup_creators` or `lookup_posts` for the chosen creators or posts Atlas already holds, which
  starts no discovery; and the page standard's shortlist and freshness refreshes (sections 4 and 9).
- Keep every user-facing message short. Use bullets for anything with more than two points.
- Web research is a proposal, never a write: findings are always shown and confirmed before
  any calibration is recorded from them.
- The chat reply is the answer: up to three points, the freshness line when it cites an account's data (`skills/page-standard/SKILL.md`, section 9), the next step, and one link to the page (its file path when the session cannot publish).
  Text is the default. Cards, images, charts, and theme previews appear in chat only when the
  user asks to see them ("show me the cards", "show the palettes"), and never as embedded image
  data: see **Visual output**. The one cards offer is **Orchestration contract** **12**.
- Creator fees come only from the fee calculator (**Fee calculator**). No price is shown when
  the data behind it is missing.
