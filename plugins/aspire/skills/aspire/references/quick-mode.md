# Quick mode and run limits

How deep a run goes and when it stops. **Quick mode** is a short answer in chat, from what Atlas
already holds, for the eleven agents in the table below. **Run limits** cap every other run, so a
run that goes long returns what it has instead of running on. The launch block's `depth` and
`budget` (**Orchestration contract** **5**) carry both; the packet's `budget` (**6**) reports them.

A bold section name with no file beside it (**Running agents**, **Creator card**) is another part
of this skill; `SKILL.md`'s **Sections** index names its file.

## Contents

- [1. The agents with a quick mode](#1-the-agents-with-a-quick-mode)
- [2. Quick mode (the agent)](#2-quick-mode-the-agent)
- [3. Run limits (every full run)](#3-run-limits-every-full-run)
- [4. Launching and stopping (the main thread)](#4-launching-and-stopping-the-main-thread)
- [5. Credits before every call that uses them](#5-credits-before-every-call-that-uses-them)
- [6. Personas](#6-personas)

## 1. The agents with a quick mode

Each row says what the quick answer holds, what the full run adds, and the setup items that would
help most, in order. The agent names the first one the brand does not have yet, and none when it
has them all. A quick run never needs that setup: with none saved, it works from the brand's
summary and brand red lines (`get_brand_context`; **Atlas tools**, Calibration kinds) and says so in one line.

| Agent | The quick answer | The full run adds | Setup that helps most |
| ----- | ---------------- | ----------------- | --------------------- |
| `atlas-creator-discovery` | Up to 12 creators Atlas holds who fit the brand, each with one reason | A scored shortlist page for a named campaign, new candidates from the marketplace, saved decisions | A saved campaign brief; vetting criteria |
| `atlas-creator-vetting` | Approve, Maybe, or Reject for up to 12 named handles Atlas holds, one reason each; handles it does not hold are listed as not checked | Every handle fetched and vetted, a full brand safety review, a page, saved recommendations | Saved vetting criteria; brand red lines |
| `atlas-creator-profile` | One creator: the fit call, followers, median views and engagement, the top post, any safety flag, and the fee when a rate card is saved | The full profile page: audience, top and lowest posts, sentiment, peers, fees per format | A fee rate card; a linked brand account |
| `atlas-creator-brief` | An outline: three content pushes (format, angle, a target from the account's medians) and up to 6 held creators who could make them | The full brief page with deliverables, guardrails, priced creators, and a timeline | A linked brand account; a saved brand voice |
| `atlas-ad-reuse` | Up to 12 held posts ranked on the hook signals Atlas already has, each with its format and why | Every post scored and tagged, a cut list with timestamps and rights status, a page | A linked Meta ad account; rights on record |
| `atlas-content-review` | Go or no-go on one held post against the brand's red lines and the brief named, with up to 5 issues | Every check with evidence, creator-ready edit notes, a page, saved review lessons | A saved content brief; review lessons |
| `atlas-post-analysis` | One held post: reach and engagement against the account's median, brands on screen, and brand safety, from Atlas's analysis | A refetch, frame-by-frame timings, every profanity instance, reuse clearance, a page | Brand red lines; a linked brand account |
| `atlas-content-library` | Up to 12 held posts cleared for ads, from the rights and deal usage on record, with their expiry | The whole library page with filters, the expiring and worth-requesting lists, alerts | Rights on record; a saved influencer program |
| `atlas-market-signal` | Share of voice against up to 3 saved competitors over the last 30 days, and up to 6 comparison posts | Feature parity, friction, framing, the strongest openings, a page, delivery to Slack or email | Saved competitors; market signal setup |
| `atlas-profile-analyst` | An account review: cadence, engagement against followers, the top 3 posts and what they share, one push for next week | Competitor benchmarks on rates, three dated pushes with targets, a page, saved insights | A linked Instagram or TikTok account; saved competitors |
| `atlas-ppa-pitch` | An outline only: up to 3 persona lanes per product and up to 4 held creators per lane, with hook rate and median views | The 16:9 casting deck, variants, schedule, rights package, investment, and exports | The PPA questionnaire's products and budget; a linked Meta ad account |

An agent with no row here has no quick mode. A quick launch of one runs in full.

## 2. Quick mode (the agent)

When the launch block's `depth` is `quick`, this section is the whole brief. It replaces every
"read before starting" line in your file, your flow reference, the page standard, and every
instruction to publish, save, or ask.

1. **Read only your row above and this section.** Not your flow reference, not the page standard,
   not the lens or search references. The fields to ask for are in step 3.
2. **Atlas tools you may call:** `get_brand_context`, `search_calibrations`, `search_creators`,
   `search_posts`, `search_insights`, `list_hashtag_posts`, `get_fee_rate_card`, and
   `calculate_creator_fee`. Never `lookup_creators`, `lookup_posts`, `search_creator_marketplace`,
   `start_business_discovery`, `get_job_status`, any `append_`, `set_`, `supersede_`, or
   `retract_` tool, `show_ads`, `show_partnership_content`, the Artifact tool, or another agent.
   Never set `forceRefresh`. A handle or post Atlas does not hold is listed as "not in Atlas yet",
   never fetched.
3. **Fields.** Creators: `fields: ["username"]` (the card fields come back on every hit). Posts:
   `["externalId", "url", "postedAt", "mediaKind", "text", "likeCount", "commentCount",
   "viewCount", "author.username"]`, plus `analysis.brandSafety` or
   `analysis.commercialAnalysis.featuredBrands` only when the row's answer needs it. `limit` 12 or
   less, never 0 without `aggs`, and never a cursor: one page is the quick answer.
4. **Budget.** At most `budget.calls` tool calls (8) and `budget.minutes` minutes (3). Every tool
   call counts except `ToolSearch`, `report_checkpoint`, reading this file, and `date -u +%s` to
   read the clock, which you do once at the start and once before each call after the fifth. At the
   limit, make no more calls and answer from what you hold.
5. **Answer in chat.** No page, no file, no saves. Open with the answer in one sentence, then up to
   12 compact cards, one per creator or post, in the order that matters for the ask:

   ```markdown
   **@{handle}** · {network} {followers} · {median views or engagement} · {one reason}
   ```

   For a post, the post link and its author replace the handle. Leave out a figure Atlas does not
   hold; never estimate one. When any account read is behind (its `freshness` says so), say the
   date Atlas last refreshed it in one line; never refresh it. For creators, end the cards with a
   `creator-cards` block (**Creator card**, Agent hand-off) of up to 12 entries.
6. **End with the full-version offer**, one line: "The full version adds {the row's "full run
   adds"} and takes about {`budget.fullMinutes`}. {The first missing setup item, as "It helps most
   to save a campaign brief first."}" With no setup item missing, leave the second sentence out.
7. **The packet** (**Orchestration contract** **6**): `page` `null`, `proposals` `[]`,
   `storyline.pass` `none`, `openItems` `[]`, `cost.used` 0, `next` `null`, and `budget` with
   `depth` `quick`, the calls used, and `stopped` (`null`, `calls`, or `minutes`).
   Then your audit trail block, as always. No `page-check` block.

## 3. Run limits (every full run)

When `depth` is `full` (or left out), each pass of the run (a `propose`, `record`, `draft`,
`build`, or single pass) stops at `budget.calls` tool calls (40) or `budget.minutes` minutes (15),
whichever comes first, counted as in **2**, step 4, with the clock read at the start and every 10
calls after it.

1. **At the limit, stop reading.** Make no new Atlas reads and start no new step. You may still
   make up to 4 more calls to finish what you hold: build and publish the page, or return the
   packet. Never start a fetch, a discovery search, or a save after the limit.
2. **Say it is partial.** A page you publish opens its lead with one sentence: "This is a partial
   result: the run stopped at its {40-call or 15-minute} limit before it read {what is missing}."
   The chat summary starts with the same sentence.
3. **The packet** carries `budget.stopped` (`calls` or `minutes`), what was not read in
   `selfCheck.stillFailing` as `partial: {what is missing}`, and one question: header "Partial",
   "The run stopped at its limit before it read {what}. Run the rest?" Options "Run the rest
   (Recommended)" / "Keep this result".
4. An unattended run stops the same way and says so in its delivery message; it asks nothing.

## 4. Launching and stopping (the main thread)

**When a run is quick.** Launch with `depth` `quick` when the agent has a row in **1** and:

- the person asks for a quick look, a first pass, or a fast answer, or types `/aspire:aspire
  quick {ask}`; or
- it is the first agent run of this session and the flow has no `lastrun:` record, so the
  person has not run it before. The setup reply's Heard line says "a quick first look in chat, about 3
  minutes" and offers "Run the full version instead" as its second option.

Everything else, and every unattended run, is `full`.

**A quick run needs no setup.** It skips the flow's Setup step and its own questions, except what
the agent cannot run without: the handle, the list of handles, or the post link. The setup reply
then asks Heard only: no Scope (the last 90 days on Instagram and TikTok), no Credits (a quick run
spends none), no Save (it saves nothing), and no storyline. Its approvals line is "This run asks
you to approve nothing." `fullMinutes` is the full run's time estimate (**Orchestration
contract** **2**).

**The launch block.** Quick: `"depth": "quick", "budget": {"calls": 8, "minutes": 3,
"fullMinutes": "{estimate}"}`. Full: `"depth": "full", "budget": {"calls": 40, "minutes": 15,
"fullMinutes": null}`. Never raise a limit; a person who wants more answers the packet's "Run
the rest" question, which launches a new pass with the same limits and what is missing as its
scope.

**After a quick run** relay its answer and its full-version offer as written, then ask with
`AskUserQuestion`, header "Full run": "Run the full version?" Options "Run the full version
(Recommended)" / "This is enough". The full version goes through the normal setup reply (Credits
and Save when they apply). A quick run proposes nothing, so there is nothing to confirm.

**Stopping a run.** When the person says stop, cancel, or "never mind" about a running agent,
stop its background task with the task stop tool (the Agent tool's task id), so the subagent stops
too, not only the chat. Then write a Runs row with `status` `cancelled`, carry out nothing it
returned, and say in one line what stopped and what it had already saved, if anything (an earlier
`record` pass). Stopping one run leaves the others running.

## 5. Credits before every call that uses them

Each of these calls uses Atlas credits: `search_creator_marketplace`, `start_business_discovery`,
and `lookup_creators` or `lookup_posts` for a handle or post Atlas does not hold, or with
`forceRefresh` (the refresh is free; the new posts it collects use credits). Before the first one
of a kind in a run, the person has heard what it costs and said yes:

- **In a launch,** the Credits question (**Orchestration contract** **2**) is that yes, and the
  agent never goes past its cap. A flow question whose answer leads to one of these calls (the PPA
  questionnaire's marketplace option, a freshness refresh offer) says "uses Atlas credits" in that
  option's description.
- **In the main thread,** before calling one yourself and with no Credits answer that covers it,
  say one line and ask, header "Credits": "This {marketplace search, lookup of @handle, or
  discovery search} uses Atlas credits ({balance} left). Run it?" Options "Run it (Recommended)" /
  "Use what Atlas holds". The balance comes from `get_status`; never state a price it does not
  report. Checking a handle with `search_creators` first, as **Cards in chat** does, costs
  nothing and needs no question.

**Credits used.** Every full run's close-out (**Orchestration contract** **10**) ends with one
line from its packet's `cost`: "Credits used: {used} {fetches or new candidates}, with {balance}
left before the run." With `cost.credits` reported, use that number. With nothing spent: "Credits
used: none." A quick run spends nothing and has no such line.

## 6. Personas

Which of the three personas (**Orchestration contract** **1**, step 1: `influencer` is `influencer-manager`, `paid` is
`paid-social-manager`, `organic` is `organic-social-manager`) each agent serves, and whether it
has a quick mode (section 1). **List agents** shows the asker's agents first, and
a first run offers a quick look from one of them. A persona never limits who may run an agent.

| Agent | Personas | Quick mode |
| ----- | -------- | ---------- |
| `atlas-ad-reuse` | paid, organic | yes |
| `atlas-affiliate-manager` | influencer | no |
| `atlas-camera-screen` | paid, influencer | no |
| `atlas-campaign-orchestrator` | influencer, paid | no |
| `atlas-cas-creative-review` | paid | no |
| `atlas-content-library` | influencer, paid | yes |
| `atlas-content-review` | influencer, organic | yes |
| `atlas-content-sourcing` | influencer, paid | no |
| `atlas-creator-brief` | influencer, organic | yes |
| `atlas-creator-discovery` | influencer, paid | yes |
| `atlas-creator-negotiation` | influencer | no |
| `atlas-creator-outreach` | influencer | no |
| `atlas-creator-profile` | influencer, paid | yes |
| `atlas-creator-vetting` | influencer, paid | yes |
| `atlas-daily-insights-report` | organic | no |
| `atlas-deliverable-tracker` | influencer | no |
| `atlas-market-signal` | organic, paid | yes |
| `atlas-post-analysis` | organic, paid, influencer | yes |
| `atlas-ppa-pitch` | paid | yes |
| `atlas-product-fulfillment` | influencer | no |
| `atlas-profile-analyst` | organic | yes |
| `atlas-program-dashboard` | influencer | no |
| `atlas-program-ledger` | influencer | no |
| `atlas-quality-review` | influencer, paid, organic | no |
| `atlas-quarterly-signal` | influencer, organic, paid | no |
| `atlas-roster-manager` | influencer | no |
| `atlas-shops` | organic, influencer | no |
| `atlas-weekly-insights-report` | organic, paid | no |
