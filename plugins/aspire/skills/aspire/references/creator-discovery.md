# Creator discovery reference

Shared by the `atlas-creator-discovery` agent and the **Creator discovery** section of SKILL.md.
Holds the setup interview, the campaign calibrations, the tier model, scoring, the pool state
machine, the page structure, delivery, and the rules for scheduled (unattended) runs.

## Why the discovery agent exists

The creator brief plans one week and sources creators for it. Creator discovery is the layer under
that: a standing pool of candidates for a named campaign, kept full over time. Each run adds
creators nobody has seen yet, re-scores the ones already in the pool, and publishes one
living shortlist. The user works through it in chat; decisions free slots; the next run
refills them. Nothing about the pool lives in a session, so a teammate or a scheduled run
picks up exactly where the last one left off.

One discovery configuration per campaign. A profile may run several campaigns at once; every key,
`runKey`, and page is namespaced by the campaign slug.

## Setup: the interview is generated, not fixed

Only the spine below is fixed. The refinement questions are written at setup time from the
user's campaign description plus the brand's existing calibrations, so the discovery agent asks about
this campaign rather than a generic creator search.

Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the end,
`includeSuperseded: true`) and skip any question whose key is already occupied.

| # | Question (via `AskUserQuestion`) | Options | kind | key | detail |
| - | -------------------------------- | ------- | ---- | --- | ------ |
| S1 | What is the campaign? Describe it in your own words. | Three starters drawn from `brand:summary` and `brand:business-context` (for example "Awareness push for {product}", "Customer proof and case studies", "Launch moment for {product}"); the free text field carries the real answer | `brand_fact` | `campaign:{slug}-brief` | `{section: "business_context", body: "<the user's description, verbatim, plus the campaign window if given>"}` |
| S2-S6 | **Generated.** 3 to 5 refinement questions, written from the S1 answer and the brand's calibrations. | Each carries 2 to 4 prepared options inferred from the brief and the brand context | `guideline` | `campaign:{slug}-criteria` | `{concern: "requirement", appliesTo: ["creator-discovery", "{slug}"], body: "<one line per answered dimension>"}` |
| S7 | How many candidates should the shortlist hold? | 1) 50 (Recommended); 2) 25; 3) 100 | `guideline` | `campaign:{slug}-pool` | `{concern: "ceiling", appliesTo: ["creator-discovery", "{slug}"], body: "pool target <n> undecided candidates"}` |
| S8 | Where should each run land? (multiSelect) | 1) Published page + chat summary (always on); 2) Slack channel (type the channel); 3) Email (type the recipients) | `policy` | `campaign:{slug}-routing` | `{area: "routing", body: "page; slack:#channel; email:a@x.com,b@x.com"}` |
| S9 | How often should the discovery agent run? | 1) Discovery weekly, shortlist weekly (Recommended); 2) Discovery daily, shortlist daily; 3) Discovery daily, shortlist weekly; 4) I'll set them (type them) | `policy` | `campaign:{slug}-cadence` | `{area: "cadence", cadence: "<discovery>+<shortlist>", body: "discovery <daily\|weekly HH:MM>, shortlist <daily\|weekly DAY HH:MM>, <IANA timezone>"}` |

**Writing the generated questions (S2 to S6).** Cover these dimensions, in this order, and
skip any the S1 answer already settles. Never ask more than five.

1. **Who the creators are** — the archetype and the audience they reach, expressed in the
   campaign's own terms. Options come from the brief and `brand:summary`.
2. **Networks** — Instagram, TikTok, or both. Only those two are searchable in Atlas.
   Always ask; never infer it from which channels the brand has linked, because discovery is
   not limited to linked channels.
3. **Size band** — follower range, framed as a trade-off (reach vs. engagement rate vs.
   cost), with bands that suit the archetype rather than fixed numbers.
4. **Geography and language** — market fit, when the brief implies a market at all.
5. **Content and hard exclusions** — formats the campaign needs, and who is disqualified.
   Always fold in the brand's existing `competitor` and `red_line` records (except `review:`
   keys, which are content review only) as a stated default ("competitors already recorded are excluded"), so the user only has to add to it.

Rules:

- One `AskUserQuestion` per question, in order, never plain text. The tool adds its own free
  text field; never add "Other" or "Skip".
- S8 doubles as the **standing approval to deliver**. Say so in the confirmation: "Scheduled
  runs will post to {channel} and email {recipients} without asking each time." The page and
  chat summary always ship and need no destination.
- S9 doubles as the **standing approval to run discovery unattended**. Say so plainly:
  "Scheduled runs will search Atlas and the creator marketplace on their own to keep the
  shortlist full." A campaign with no cadence record never runs discovery unattended.
- Confirm the batch once before writing, then write all five records.
- Derive `{slug}` from the campaign name: lowercase, hyphenated, no dates. Show it once so the
  user can recognize it later; never ask them to invent it.
- A teammate re-running setup sees the saved answers and is offered "Keep as saved
  (Recommended)" / "Change" per item. Changes go through `supersede_calibration` with its own
  confirmation.

## The pool

The pool is the set of candidates **awaiting a decision**. Its target size is S7 (default 50).

| State | Meaning | Occupies a slot? |
| ----- | ------- | ---------------- |
| `undecided` | Surfaced, scored, on the shortlist page, nobody has ruled on it | Yes |
| `accepted` | The user kept it; it moves to the active list at the top of the page | No |
| `rejected` | The user dropped it; it never appears again | No |

Any decision frees a slot, so a run fills back to the target with candidates nobody has seen.
A rejected creator is never re-surfaced, on any later run, by any source — the dedupe set is
every entity id ever written for this campaign, not just the current pool. Only a person can
bring one back, and only straight onto the active list (**Added by the team** below).

**Added by the team.** A person can add a creator from a creator card (SKILL.md, **Creator card
actions**). These carry `tier` `manual` and `source` `creator card`.

- Accepted from the card: a `went_well` verdict, shown in the active list like any other.
- Added as a candidate (`action_item`, undecided): the shortlist shows them in their own
  group, **Added by the team**, before tier 1, because a person chose them. The next run
  scores them like any other undecided candidate and never drops them for being unscored.
  Until then they have no `fitScore`: no fit ring, a "Not scored yet" note in `{DETAILS}`, and
  they sort after the scored ones in their group. They are numbered with everyone else.
- A candidate the campaign already rejected cannot be added as a candidate, only accepted.

## Tiers: where candidates come from, and in what order

The shortlist is sorted by tier first, then by fit score inside the tier. Tier is provenance,
not quality: a tier 4 creator can outscore a tier 1 one and still sort below it, because the
brand's own history is the stronger signal.

| Tier | Who | How to find them |
| ---- | --- | ---------------- |
| 1 | Creators the brand has worked with | `search_posts` for posts whose text or `instagram.hashtags` mention the brand's handles, plus the brand's own posts that tag another account, keeping only those carrying a partnership marker the field census exposes (branded-content / paid-partnership). Union with every `partner` calibration. |
| 2 | Creators who have posted about the brand | The same mention query, minus everything already in tier 1. Recency-weighted: a mention in the campaign window outranks a two-year-old one. |
| 3 | Lookalikes of what's working | Creators who resemble the brand's best-performing creators, per **Lookalike seeds** below. |
| 4 | New creators already indexed in Atlas | `search_creators` filtered on the saved criteria (network, follower range, country, verification), then `search_posts` per shortlisted handle for topic evidence. |
| 5 | New creators from outside the index | `search_creator_marketplace` against the criteria (one call per keyword, `networks` = the campaign's Networks answer, each network's filters mapped from the size band and countries, TikTok topic labels from `list_creator_marketplace_labels`; see **Marketplace search** below), and `WebSearch` / `WebFetch` for creators covering the campaign's topic. Resolve every web-sourced handle with `lookup_creators` before scoring it; an unresolvable handle is dropped, never scored from web copy alone. |

In creator-ads mode only, the **Recommendation passes** (under **Creator-ads mode** below) run
after tier 3 and before tier 4's own search. They add no tier: each creator they return is
credited to tier 4 or tier 5 by the rule there. A regular campaign never runs them.

**Lookalike seeds.** Tier 3 answers the growth question "where should the next dollar go?" by
refilling the shortlist with creators like the ones already delivering.

1. **Pick up to five seeds**, in this order, and stop at five: accepted creators in this
   campaign whose posts about the brand beat their own median engagement per post; stars in
   the newest roster review of the program whose `discoveryCampaign` is this campaign
   (`program-{profile}-{slug}` prefix, `roster-health` findings, newest per creator, with
   `detail.seedEligible: true`); creators named in `went_well` findings of the weekly readout's growth lens (`readout-weekly-{profile}`
   prefix, `detail.creator` set, `detail.seedEligible: true`); `partner` creators whose collab
   posts beat the brand's median. No seed qualifies: skip the tier and say so under Gaps.
2. **Find lookalikes three ways**, each excluding the dedupe set, the brand's handles, and
   every competitor:
   - Semantic `search_posts` with `queryText` = the seed's best post caption (plus the first
     transcript lines when present), filtered to the campaign's networks and a follower band
     from half to double the seed's, limit 25. Collect the authors.
   - `search_creators` with `match_phrase` on the bio for the seed's recurring bio and caption
     vocabulary, in the same band.
   - When the seed is on Instagram: `search_creator_marketplace` with no `keyword`,
     `networks: ["instagram"]`, and `instagram: { filters: { similarToCreators: [the seed's
     handle], creatorMinFollowers, creatorMaxFollowers, excludeMessagedCreators: true } }` for
     the band. One call per seed, never several seeds in one call, so every result is credited to the seed
     that found it. TikTok has no
     lookalike filter, so a TikTok seed gets the first two ways only. Never send `keyword` with
     `similarToCreators`: the server rejects the two together (see `creator-brief.md`, **Atlas
     quirks**). Never add `recommendationType` to this call either, in any mode: the server
     accepts the pair but returns nothing.
3. Read marketplace results through `search_creators` once they land (1 to 3 minutes after
   each network's job completes, per `creator-brief.md`, **Atlas quirks**).
   Record `source` `lookalike of @{seed}` and `detail.seed` on each candidate; the card's
   `{DETAILS}` names the seed with the source, per the card's **Badges** rule. A lookalike is scored like any other candidate: resemblance earns
   no points of its own.

**Marketplace search.** Follow `creator-brief.md`, **Atlas quirks**, Marketplace search, for
the call shape, polling, and skips. For tier 5:

- `networks` is the saved Networks answer. A network the brand did not choose is never sent.
- Instagram: `creatorMinFollowers` / `creatorMaxFollowers` snapped outward to the nearest
  allowed values around the size band, `creatorCountries` from the saved countries,
  `creatorInterests` only when the archetype maps cleanly onto one of the enum values, and
  `excludeMessagedCreators: true` so creators the brand has already messaged don't come back.
  A creator ad campaign adds `featuredInPaidAds: true` for the paid track record, and may add
  `recommendationType: "high_ad_performance"` to each keyword call (see **Recommendation
  passes**), and `creatorLanguage` only when the lane or campaign criteria name a language in
  the enum (`creator-brief.md`, **Atlas quirks**). Yes-only filters are sent as `true` or left
  out, never `false`.
- TikTok: `minFollowers` / `maxFollowers` as the exact band, and `countryCodes` from the saved
  countries TikTok supports (per the quirk). When they span regions (US; DE, ES, FR, GB, IT;
  everything else), the first call carries one region and each extra region gets its own call
  with `networks: ["tiktok"]` only, so Instagram is searched once. For topic labels, call `list_creator_marketplace_labels` once per run and
  pass only ids whose name clearly matches the campaign's topic; none match, send none.
- Record which networks ran and which were skipped (with the reason) in the run summary, and
  list a skipped network under Gaps.

Rules:

- Work the tiers in order and stop as soon as the pool is at target. A run that fills from
  tiers 1 and 2 alone is a good run, not a shallow one.
- Record the tier and the exact source on every candidate; the page shows it.
- Never surface the brand's own handles, any `competitor` handle, any handle already
  decided for this campaign, or any creator whose `creator:*` calibration has stance `reject`
  (the team's call from creator vetting, `creator-vetting.md`). Any other stance is shown on
  the card under "Notes".
- Web research is evidence, never a write: a web-sourced candidate still enters the pool
  through `lookup_creators`, with the source URL in its evidence.

## Scoring

A fit score out of 100, computed from the saved criteria only. Every component names the
field or hit it came from; a component with no data scores zero and is listed as missing,
never guessed.

| Component | Weight | Source |
| --------- | ------ | ------ |
| Audience and archetype fit | 30 | Bio, recent post topics, the criteria record |
| Topic evidence | 25 | Posts matching the campaign's subject, cited by permalink |
| Engagement quality | 20 | Engagement rate against the creator's own size band, not a global average |
| Cadence and recency | 10 | Posts in the last 30 days; a dormant account is capped at 50 overall |
| Format match | 10 | `mediaKind` / `instagram.mediaProductType` mix vs. the formats the campaign needs |
| Market fit | 5 | Country and language against the criteria |

Infer a trait from what the posts show, never from a number or label the creator states in a bio.
A niche fandom or subculture the criteria name is a theme, not a keyword: count the posts that
are about it, whatever words they use.

Risk flags are reported, never scored: competitor mention, a `red_line` match in recent
content, no contact route, or a follower-to-engagement pattern that looks bought. A flagged
candidate still appears, with the flag on its card.

## State written to Atlas

`append_insights`, one finding per candidate, `runKey`
`creator-discovery-{profile}-{campaign}-{YYYY-MM-DD}`, role `account_review`, `schema` = network,
`entityKind` = account, `entityId` = the network's own account id from the search hit (never a
handle or uuid), `idempotencyKey` per candidate per run.

| Kind | Means | `priority` |
| ---- | ----- | ---------- |
| `action_item` | Undecided: in the pool, awaiting the user's call | Required; rank by fit score |
| `went_well` | Accepted | n/a |
| `needs_improvement` | Rejected | n/a |

`detail` carries: `campaign`, `tier`, `source`, `fitScore`, the per-component breakdown,
`evidence` (permalinks and the profile URL), `riskFlags`, `verdict`, `verdictAt` when
decided, `seed` for a lookalike, `recommendationTypes` (creator-ads mode, every Meta ranking
that returned the creator, per **Recommendation passes**), and `tierScheme: 2`. Records without `tierScheme` were written
before the lookalike tier: read their tier 3 as tier 4 and their tier 4 as tier 5. Reading state back: `search_insights` with a `prefix` filter on `detail.account_review.runKey` =
`creator-discovery-{profile}-{campaign}`, newest first, paged; the newest record per `entityId`
wins. `search_insights` returns findings tenant-wide, so always filter on the prefix.

## The living page

One page per campaign, republished to the same path every run so the link stays stable. It is
the working list behind question **I1** ("Which creators should we contact for this launch, and
why?"). The page that answers I1 is the vetting slate built from this pool
(`creator-vetting.md`, **The page**), so the result packet's `next` names the vetting agent
whenever undecided candidates are ready to vet. Build this page from the page blocks
(`skills/page-standard/blocks.md`). Sections in order:

1. **Header** (3.1, 3.2): brand, campaign name, network chips with the creators found per
   platform, pool counts (undecided / accepted / rejected against target), run timestamp, a
   "Prepared for" chip fed by `recipient` (`recipient-lens.md`), and the animated mark at the
   top right.
2. **Answer** (3.3), written last: where the pool stands and what to do with it ("50 in the
   pool, 12 new this run. Vet the top 20 next."), then **Decisions** (3.5): the candidates to
   accept or reject, by number, or "Nothing needs approval" when the pool holds no new ones.
   Then **Next steps** (3.6), its own section: which numbers to vet next and by when, and any
   tier that ran dry with what would refill it.
3. **Since last run**: added, re-scored up or down, went dormant, decided. One line each;
   "no change" is a valid line.
4. **Active list**: accepted creators as creator cards, so the working set is visible first.
5. **Shortlist**: the undecided pool, grouped by tier, ranked by fit score inside it.
   Numbered from 1 across the whole shortlist, stable for the run, because those numbers are
   what the user replies with. Each candidate is a creator card (`creator-card.md`): the fit
   score in the ring; flow chips `#{number}` and the tier (`Added by team` for `manual`), then
   the card's own badges; safety flags in the brand safety tile and every other risk flag under
   "Notes" in `{DETAILS}`, per the card's **Brand safety** rule; evidence posts first in the
   thumbnails. `{DETAILS}` also holds the two strongest fit components with their points, the
   source, the contact route if known, and the estimated fee from the fee calculator
   (`fees.md`, **Applying the rates**) on the campaign's platforms: "Est. fee {open} to {max},
   target {target}" (marked "est. from engagement" when the calculator estimated the views), or nothing when it gives no price. The page footer carries the rate
   label once.
6. **Rejected this cycle**: collapsed list of handles with the reason recorded, so a
   decision is auditable.
7. **Criteria and scoring** (3.11): the saved criteria in plain words, the scoring table's
   components and weights, and the platform counts again, so a reader can see what "fit" meant.
8. **Footer**: sources, a note that images are a snapshot, "numbers come from Atlas as of {timestamp}", then the artifact-standard footnote. The mark and the footnote follow [artifact-standard.md](artifact-standard.md).

More than 12 candidates means a chart leads the shortlist: fit score by tier, or follower
count against engagement rate with the pool plotted. Embed every image with the snippet in
`creator-card.md`, **Images**, page profile, and keep the images under 8MB and the page under
10MB. A large pool cuts thumbnails per card (then rejected-list images) before quality, per
**Images**. Load `artifact-design`, and `dataviz`
for any chart, before building. Apply the saved brand theme (`theme:brand`) per `theme.md`, **Applying the theme**; without one, the design here stands. Title: "<Brand> Creator Discovery: <Campaign>".

## Decisions

Decisions happen in chat, in any later session, off the numbers on the page.

- The user replies in their own words ("keep 1, 3 and 4, drop the rest", "drop 7", "all of
  tier 2 in").
- Resolve the numbers against the current run's shortlist. If the page has been republished
  since, resolve against the newest run and say which run was used.
- Confirm the batch once with `AskUserQuestion`, naming the counts and the handles being
  rejected ("Keep @a, @b, @c and reject the other 9?"). One confirmation covers the batch.
- Write the verdicts with `append_insights` under the current run's `runKey`. Never use
  `supersede_calibration` or any destructive tool for a decision; a verdict is a new finding,
  not an edit.
- An undecided candidate is never auto-rejected by age. It stays in the pool until a person
  rules on it.
- Republish the page after writing, so the counts match.

## Delivery

Read `campaign:{slug}-routing`. The page and chat summary always ship. Slack and email follow
the readout rules in `readout.md`, **Delivery**: one message with the headline, the top
bullets, and the page link; interactive runs confirm the send once; the S8 confirmation is the
standing approval for unattended runs; never send to a destination that is not in the routing
record.

## Jobs and task names

Every run does one of three jobs, passed to the agent as `job`:

- `discover` (default): fill the pool to target in tier order, re-score, publish, and deliver.
- `shortlist`: no sourcing. Re-score the undecided candidates already in the pool, republish
  the page, and deliver.
- `view`: read only. Read the newest pool state, republish the page and return the shortlist
  as it stands: no re-score, no Atlas write, no delivery. "Show the current shortlist" runs
  this job. It is never scheduled.

S9 sets a time for each. The scheduled tasks are named "Atlas creator discovery: {brand} -
{campaign}" (`job: discover`) and "Atlas creator shortlist: {brand} - {campaign}" (`job:
shortlist`). A task with the older bare name "Atlas creator discovery" runs `job: discover`,
and one named "Atlas creator discovery digest: {brand} - {campaign}" runs `job: shortlist`.

## Main thread: setup, run, and schedule

What the **Creator discovery** section of SKILL.md does around the agent. The agent never runs
setup, never asks these questions, and never records a decision.

**Setup check.** Call `search_calibrations` (no filter, limit 100 per page, paged to the end,
`includeSuperseded: true`). If the five campaign keys exist for the campaign in question
(`campaign:{slug}-brief`, `-criteria`, `-pool`, `-routing`, `-cadence`), skip to the run and
offer "Change setup" as an option on the run question. Several campaigns may be saved; ask with
`AskUserQuestion` which one when more than one is active. Otherwise run **Setup** above:

1. Ask S1: what the campaign is, in the user's own words.
2. **Then write the refinement questions.** Read the S1 answer together with `brand:summary`,
   `brand:business-context`, and the `competitor`, `red_line` and `guideline` records (not
   `review:` keys, which are content review only, nor `theme:` keys, which style pages), and from
   those compose 3 to 5 `AskUserQuestion` questions covering the dimensions above, in their
   order, skipping anything S1 already settled. The options are inferred from the brief and the
   brand context, never generic. Never ask more than five, never ask in plain text.
3. Ask S7 (pool target), S8 (routing) and S9 (cadence), with the two standing-approval
   statements above. Those two confirmations are the standing approvals.
4. Confirm the batch once with `AskUserQuestion` ("Save this campaign setup for {brand}?
   Everyone on the team and every scheduled run will use it."), then write all five records
   with `append_calibration`, `provenance: "interview"`. A `key-exists` follows the Phase 5
   supersede rule in SKILL.md with its own confirmation.

**The run question.** Ask once with `AskUserQuestion`: "What should the discovery agent do?"
Options: "Fill the shortlist to {target}", "Show the current shortlist", "Record decisions on the
shortlist", "Change setup". Then launch `atlas-creator-discovery` with: tool prefix,
`profile_id`, `profile_slug`, the campaign slug, the brand handles and networks, run mode
`interactive`, `job` (`view` for "Show the current shortlist", else `discover`), and `recipient`
(SKILL.md, **Reading the ask**; `growth` when the ask is for more creators like the ones
working). Relay its summary, the page link, and the numbered range the user can decide against.
Show the candidates added this run inline as creator cards from the agent's `creator-cards`
block (top six by fit score, badged with their shortlist numbers).

**Recording decisions** ("Record decisions on the shortlist", or a reply against the page
numbers) stays in the main thread, never the agent, per **Decisions** above. Rejected creators
never reappear; accepted ones free their slot for the next run.

**Scheduling.** A CAS campaign's discovery runs only from **CAS campaign** (`cas-campaign.md`):
when the campaign's `campaign:{slug}-brief` has the `type: creator-ads` line, never schedule
discovery for it; offer the CAS weekly call instead. Otherwise, after the first successful run,
or whenever the user asks, offer with `AskUserQuestion`: "Set up the recurring discovery now?"
Options: "Yes, discovery and shortlist (Recommended)", "Discovery only", "Shortlist only", "Not
now". On yes, follow the same mechanics as SKILL.md **Readouts**, Schedule (`readout.md`,
**Scheduling (main thread)**): read the times and timezone from `campaign:{slug}-cadence`,
convert to UTC cron, create one task per job with the session's scheduled-task tools, named as in
**Jobs and task names**, confirm both in one `AskUserQuestion` before creating them, and tell the
user the tasks run in fresh sessions so Aspire Atlas must be enabled for scheduled tasks. Prompts
must say "do not ask questions", name the brand by its exact Atlas profile `name` and the
campaign slug, and state no date.

## Scheduled (unattended) runs

A scheduled run starts a fresh session with nobody to answer questions.

- Never ask a question. If `campaign:{slug}-brief`, `-criteria`, `-pool`, `-routing`, or
  `-cadence` is missing, publish a one-card page titled "<Brand> Creator Discovery: setup needed" listing what
  is missing (it still carries the mark and the footnote, with the "No Atlas data on this page" variant in
  [artifact-standard.md](artifact-standard.md)), write nothing to Atlas, and end with "Run /aspire:aspire and ask for creator
  discovery setup."
- **Discovery is allowed unattended for this agent**, and only this agent: the S9 cadence
  record is the standing approval, and it covers `search_creators`, `search_creator_marketplace`
  (including the lookalike tier, with `get_job_status` and `list_creator_marketplace_labels`),
  `lookup_creators`, and web research. Every other scheduled run in this plugin still starts no
  discovery work.
- Never run a destructive tool, and never record a verdict. Only a person decides, so an
  unattended run publishes and writes `action_item` findings, nothing else.
- Resolve the date from the shell clock in the cadence record's timezone (`TZ=<tz> date +%F`),
  never from the task prompt or the session header — the rule in `readout.md`,
  **Resolving "today"**, applies here too.
- If Atlas returns an unauthorized error, publish the "setup needed" card with "Aspire Atlas
  needs a fresh sign in" and stop.
- A discovery pass that finds nothing new publishes the page unchanged with "no new candidates
  this run" and says which tiers were searched. Never pad the pool to hit the target.

## Creator-ads mode (CAS campaigns)

A campaign whose `campaign:{slug}-brief` body starts with `type: creator-ads` is a creator ad
campaign, set up by the **CAS campaign** section of SKILL.md (`cas-campaign.md`), not by S1 to
S9. The main thread passes `campaign_type` `creator-ads` and the lane to fill when there is one.
Everything above applies, with these changes:

- **Lanes replace S1.** Each `campaign:{slug}-lane-{lane}` record is one criteria set: its
  persona and casting filter, plus the shared `campaign:{slug}-criteria`. Score a candidate
  against its own lane only.
- **One pool per lane.** Every finding carries `detail.lane`. The target per lane is in
  `campaign:{slug}-pool`: three times the creators that lane needs. Fill the named lane, or the
  emptiest lane first when none is named, and stop each lane at its target. The dedupe set
  stays campaign-wide, so a creator sits in one lane only.
- **The setup check** reads `-brief`, `-criteria`, `-pool`, `-cadence` and at least one
  `-lane-*` record. Missing any: return the one line telling the main thread to run CAS
  campaign setup.
- **The cadence is the standing approval** for the marketplace and paid lookups on this
  campaign, in interactive runs too (SKILL.md, **Guardrails**). The weekly sync never launches
  discovery; it runs when the CM picks it.
- **The fit score is the campaign's match score.** Score every candidate with the one procedure
  in `cas-campaign-page-brief.md`, **Creator Selection**, **The match score**, against their lane's
  concept, with the weights in `match` in `campaign:{slug}-cas` (read it and `-terms` for this
  campaign only), so the shortlist and the campaign page show the same number for the same
  inputs. When `match` has a `basis`, the page says
  "Weights tuned {date} from {n} client decisions" in its About this data, else "Default weights". The casting keywords and target cities are `casting` in the lane record,
  which the campaign page's edits are pulled into, else derived from the lane's persona and casting filter and named as derived
  on the page. Budget vs target uses `rates-and-terms.md`, **Expected cost** (the
  roster's offer, counter or agreed fee for a creator carried from an earlier round, else the
  calculator's target plus the uplift) and **Target rate**. Read the candidates' `roster` findings
  on the `cas-campaign-{profile}-` prefix, every campaign of the brand's, for those fees and for
  worked with the brand before.
  Past paid partners are a plain count here; the category read is vetting's (`creator-vetting.md`,
  **Creator-ads lanes**), and the campaign page uses it once vetting has screened the lane.
  Write the result in `detail.match` (`{score, band, factors, without, conflict, pastDeals,
  weights, scoredAt}`) with `fitScore` equal to `score`, and show the band and any competitor
  line on the card. The page shows the date of the run, and its strong and weak signals rank the
  lane's own pool. The dormant account cap (50 with no posts in the last 30 days) is part of
  that procedure. A bio naming a saved competitor halves the score, as that section says,
  though risk flags stay unscored elsewhere. The rubric in **Scoring** above is for other
  campaigns.
- **Recommendation passes** fill each lane from Meta's own rankings, per the block below.
- **Ad figures on every card**, in `{DETAILS}` and in `detail.adFigures`, drawn per
  `creator-card.md`, **Creator-ads details**:
  - Hook rate (`instagram.reelsHookRate`)
  - Reels interaction rate (`instagram.reelsInteractionRate`)
  - Past paid partners (`instagram.pastBrandPartnershipPartners`, named, at most five)
  - Partnership readiness: "Ready" when `isPaidPartnershipMessagesEnabled` is true and the
    creator has partnership experience, "Partly" when only one holds, "Not yet" when neither
    does
  - Total views (`instagram.totalViews`), labelled "Views (Meta)"
  - Account interactions (`instagram.accountInteractions`), labelled "Interactions (Meta)"
  - Marketplace reach (`instagram.creatorMarketplaceReach`), labelled "Reach (Meta)"
  - Engaged accounts (`instagram.creatorEngagedAccounts`), labelled "Engaged accounts (Meta)"
  - Category (`instagram.category`), as a chip. When the call that found the creator sent
    `creatorInterests`, say whether the category matched it.
  - Contact route: "Email on profile" when `instagram.email` is held, else "Partnership
    messages on" when `instagram.isPaidPartnershipMessagesEnabled` is true, else "No route in
    Atlas"
  - Meta recommends: `detail.recommendationTypes` as chips in plain words ("High ad
    performance", "Most ads experience", "Similar brands"); left out when empty

  Project the `instagram` container to read them, per `creator-brief.md`, **Atlas quirks**. A
  figure Atlas does not hold shows "Not in Atlas", never a guess. Atlas gives no period for
  views or interactions, so never call them "30-day" or "lifetime". TikTok cards carry one
  plain line: "Hook rate is not available on TikTok."
- **The page groups by lane.** The shortlist section becomes one group per lane, in the order
  the lanes were saved, each headed with the lane name, persona, and "{undecided} of {target}".
  Inside a lane, tiers and fit score sort as above. Numbering still runs from 1 across the whole
  page. Title "<Brand> Creator Discovery: <Campaign>" stays.
- **Decisions come from Gate 2.** The main thread writes the verdicts when the client's slate
  decisions close Gate 2 (`cas-campaign.md`, **Gate 2**). The agent still writes only undecided
  findings.

### Recommendation passes

Creator-ads mode only. Meta ranks marketplace creators for the brand in several ways, and three
of them are the strongest paid signal the marketplace offers: `high_ad_performance`,
`most_ads_experience` and `similar_brands`. Each returns a different set from Meta's default
ranking, so each is its own pass. A regular campaign never runs them and never sends
`recommendationType`.

**When.** Per lane, after tier 3 and before tier 4's own `search_creators` pass, tier 5's
keyword passes, and web research. Run the three in this order: `high_ad_performance`, then
`most_ads_experience`, then `similar_brands`. Stop the moment the lane is at its target, and
skip any pass left once it is. Tier 4's search and tier 5's keyword and web passes still run
after, if the lane is still short.

**The call.** One `search_creator_marketplace` per pass per lane, with no `keyword`:

- `networks: ["instagram"]`; the recommendation type is the keyword-less anchor.
- `instagram.filters`: `recommendationType`, the lane's `creatorCountries`,
  `creatorMinFollowers` / `creatorMaxFollowers` snapped outward from the lane's size band,
  `featuredInPaidAds: true`, `excludeMessagedCreators: true`, and `creatorLanguage` only when
  the lane or campaign criteria name a language in the enum.
- Never `similarToCreators` (the pair returns nothing), never `keyword`, and never `false` for
  a yes-only filter.

Poll each job and read its results through `search_creators` per `creator-brief.md`, **Atlas
quirks** (1 to 3 minutes after the job completes). `excludeMessagedCreators` is best effort, so
the campaign dedupe set is still what keeps decided creators out. `most_ads_experience` can
return nothing for a brand: that is a valid result, not an error.

**Tier and source.** No new tier, and `tierScheme` stays 2. Note the time each pass starts. A
returned creator counts as already indexed when Atlas holds a post by them indexed before that
time (the `search_posts` call for topic evidence answers it); they are tier 4. Anyone else
entered the index through this pass and is tier 5. The `source` names the pass either way:
`Meta: high ad performance`, `Meta: most ads experience`, or `Meta: similar brands`.

**Keyword passes.** A creator-ads tier 5 keyword call may carry
`recommendationType: "high_ad_performance"` beside the keyword; the pair works. Its source is
`Meta: keyword "{kw}" + high ad performance`.

**Provenance, not points.** Record `detail.recommendationTypes` on every candidate any pass
returned, listing each ranking that returned them. A creator two passes return keeps both and is
written once, with the source of the first pass that found them. Recommendation types add
nothing to the fit score.

**In the summary.** Per lane: which passes ran and how many creators each returned. A pass that
returned nothing is named under Gaps as a gap line, never as an error.

## Atlas quirks that apply here

Inherited from `creator-brief.md` and `readout.md`: project the `media` and
`instagram.account` containers, not leaf URLs; exclude stories with `exists mediaKind`; some
`/thumbnail` routes 404 on image posts; published pages cannot load `cdn.aspire.io` images, so embed them.
New for creator discovery: `search_creators` carries no post-level fields, so topic evidence always
needs a second `search_posts` call per candidate; `lookup_creators` has no status-check tool
(re-call it with the same item to re-read a `fetching` result); attribute it with
`asProfileId`.
