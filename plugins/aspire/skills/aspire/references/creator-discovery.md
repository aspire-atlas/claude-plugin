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
every entity id ever written for this campaign, not just the current pool.

## Tiers: where candidates come from, and in what order

The shortlist is sorted by tier first, then by fit score inside the tier. Tier is provenance,
not quality: a tier 4 creator can outscore a tier 1 one and still sort below it, because the
brand's own history is the stronger signal.

| Tier | Who | How to find them |
| ---- | --- | ---------------- |
| 1 | Creators the brand has worked with | `search_posts` for posts whose text or `instagram.hashtags` mention the brand's handles, plus the brand's own posts that tag another account, keeping only those carrying a partnership marker the field census exposes (branded-content / paid-partnership). Union with every `partner` calibration. |
| 2 | Creators who have posted about the brand | The same mention query, minus everything already in tier 1. Recency-weighted: a mention in the campaign window outranks a two-year-old one. |
| 3 | New creators already indexed in Atlas | `search_creators` filtered on the saved criteria (network, follower range, country, verification), then `search_posts` per shortlisted handle for topic evidence. |
| 4 | New creators from outside the index | `search_creator_marketplace` against the criteria, and `WebSearch` / `WebFetch` for creators covering the campaign's topic. Resolve every web-sourced handle with `lookup_creators` before scoring it; an unresolvable handle is dropped, never scored from web copy alone. |

Rules:

- Work the tiers in order and stop as soon as the pool is at target. A run that fills from
  tiers 1 and 2 alone is a good run, not a shallow one.
- Record the tier and the exact source on every candidate; the page shows it.
- Never surface the brand's own handles, any `competitor` handle, or any handle already
  decided for this campaign.
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
`evidence` (permalinks and the profile URL), `riskFlags`, `verdict`, and `verdictAt` when
decided. Reading state back: `search_insights` filtered on the `runKey` prefix
`creator-discovery-{profile}-{campaign}`, newest first, paged; the newest record per `entityId`
wins. `search_insights` returns findings tenant-wide, so always filter on the prefix.

## The living page

One page per campaign, republished to the same path every run so the link stays stable.
Sections in order:

1. **Header** — brand, campaign name, network chips, pool counts (undecided / accepted /
   rejected against target), run timestamp.
2. **Since last run** — added, re-scored up or down, went dormant, decided. One line each;
   "no change" is a valid line.
3. **Active list** — accepted creators as creator cards, so the working set is visible first.
4. **Shortlist** — the undecided pool, grouped by tier, ranked by fit score inside it.
   Numbered from 1 across the whole shortlist, stable for the run, because those numbers are
   what the user replies with. Each candidate is a creator card (`creator-card.md`): the fit
   score in the ring; badges in order `#{number}`, tier, source, then the card's own; risk
   flags in the brand safety tile; evidence posts first in the thumbnails. `{DETAILS}` holds
   the two strongest fit components with their points and the contact route if known.
5. **Rejected this cycle** — collapsed list of handles with the reason recorded, so a
   decision is auditable.
6. **Criteria** — the saved criteria in plain words, so a reader can see what "fit" meant.
7. **Footer** — sources, the CDN expiry note, "numbers come from Atlas as of {timestamp}".

More than 12 candidates means a chart leads the shortlist: fit score by tier, or follower
count against engagement rate with the pool plotted. Page mechanics are the readouts':
download media and profile pictures from `cdn.aspire.io` with `curl`, resize with Pillow
(thumbnails 240px wide, profile pictures 112px), embed as JPEG data URIs, keep the page under 2MB,
fall back to the base media URL on a `/thumbnail` 404. Load `artifact-design`, and `dataviz`
for any chart, before building. Title: "<Brand> Creator Discovery: <Campaign>".

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

## Scheduled (unattended) runs

A scheduled run starts a fresh session with nobody to answer questions.

- Never ask a question. If `campaign:{slug}-brief`, `-criteria`, `-pool`, or `-cadence` is
  missing, publish a one-card page titled "<Brand> Creator Discovery: setup needed" listing what
  is missing, write nothing to Atlas, and end with "Run /aspire:aspire and ask for creator
  discovery setup."
- **Discovery is allowed unattended for this agent**, and only this agent: the S9 cadence
  record is the standing approval, and it covers `search_creators`, `search_creator_marketplace`,
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

## Atlas quirks that apply here

Inherited from `creator-brief.md` and `readout.md`: project the `media` and
`instagram.account` containers, not leaf URLs; exclude stories with `exists mediaKind`; some
`/thumbnail` routes 404; published pages cannot load `cdn.aspire.io` images, so embed them.
New for creator discovery: `search_creators` carries no post-level fields, so topic evidence always
needs a second `search_posts` call per candidate; `lookup_creators` has no status-check tool
(re-call it with the same item to re-read a `fetching` result) and rejects `profileSlug`,
so attribute with `asProfile`.
