# Readout reference (daily and weekly)

Shared by the `atlas-daily-readout` and `atlas-weekly-readout` agents and by the **Readouts**
section of SKILL.md. Holds the calibration set, metric definitions, page structures, delivery
mechanics, and the rules for scheduled (unattended) runs.

## Why readouts exist

Onboarding asks every brand how findings should reach them (`policy:cadence`) and what a good
week looks like (`target:weekly-health`). Readouts are the consumers of those answers. They
turn Atlas data into a short, recurring account of what changed, whether it matters, and what
to do, and they save what they find so the next run can say what changed since the last one.

## Readout calibrations (shared brand memory)

Readout preferences live in Atlas calibrations, never in local notes, so a scheduled run,
a teammate, or a new session picks them up without asking again. All are written with
`append_calibration`, `provenance: "interview"`, `statement` under 280 characters, prose in
`detail`. `key-exists` on write follows the supersede rule in SKILL.md Phase 5.

Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the end,
`includeSuperseded: true`) and skip any question whose key is already occupied.

| # | Question (via `AskUserQuestion`) | Options | kind | key | detail |
| - | -------------------------------- | ------- | ---- | --- | ------ |
| R1 | When should readouts arrive? Give the daily time, the weekly day and time, and your timezone. | 1) Daily 8:00, weekly Monday 8:00, my timezone (Recommended); 2) Daily 7:00, weekly Friday 16:00; 3) I'll set the times (type them) | `policy` | `policy:readout-cadence` | `{area: "cadence", cadence: "daily+weekly", body: "<daily HH:MM>, <weekly DAY HH:MM>, <IANA timezone>"}` |
| R2 | Where should each readout land? (multiSelect) | 1) Published page + chat summary (always on); 2) Slack channel (type the channel); 3) Email (type the recipients) | `policy` | `policy:readout-routing` | `{area: "routing", body: "page; slack:#channel; email:a@x.com,b@x.com"}` |
| R3 | What counts as worth flagging? | 1) 25% above or below the 28-day median (Recommended); 2) 50% swing only; 3) I'll set thresholds (type them) | `guideline` | `guideline:readout-thresholds` | `{concern: "preference", appliesTo: ["readout"], body: "<threshold rule>"}` |
| R4 | Which metric should lead every readout? | 1) Engagement per post; 2) Reach and views; 3) Saves and shares; 4) Follower growth | `guideline` | `guideline:readout-focus` | `{concern: "preference", appliesTo: ["readout"], body: "<metric>"}` |
| R5 | What should interrupt you between scheduled readouts? | 1) Red-line hits only (Recommended); 2) Red-line hits and a 50%+ drop in the lead metric; 3) Nothing, wait for the schedule | `policy` | `policy:readout-escalation` | `{area: "escalation", body: "<rule>"}` |
| R6 | Who reads the weekly readout? The first one picked leads; each other gets its own section. (multiSelect) | 1) Our social team (tactical) (Recommended); 2) Leadership (outcome first); 3) Product and product marketing (parity and messaging); 4) Growth (creator and channel efficiency). A reader may carry its own destination in the free text field, for example "product > slack:#product-feedback" | `guideline` | `guideline:readout-audience` | `{concern: "preference", appliesTo: ["readout-weekly"], body: "primary: <lens>; lenses: <lens>[><destination>], ..."}` |

Rules:

- One `AskUserQuestion` per question, in order. The tool adds its own free text field; never add
  "Other" or "Skip".
- R2 doubles as the **standing approval to deliver**. Say so in the confirmation: "Scheduled
  runs will post to {channel} and email {recipients} without asking each time." Only on that
  confirmation may an unattended run send anything.
- Confirm the batch once before writing (Guardrails: one confirmation may cover a batch of the
  same kind). Then write all six.
- R6 lenses are `team`, `leadership`, `product`, `pmm`, and `growth` (`recipient-lens.md`).
  Option 3 saves both `product` and `pmm`. A destination named on a lens is covered by the R2
  standing approval; say so in the same confirmation. A saved R6 in the older wording maps as:
  "The social team" is `team`, "Marketing leadership" is `leadership`, "Both" is `team` then
  `leadership`.
- If `target:weekly-health` (onboarding question 10) exists, reuse it as the benchmark row on
  the weekly page. Do not re-ask.
- A teammate re-running setup sees the saved answers and is offered "Keep as saved
  (Recommended)" / "Change" per item. Changes go through `supersede_calibration` with its own
  confirmation.

## Data pull (both agents)

Filter-only path, no `queryText`, unless noted. Every call carries a `context` argument
(15 to 25 words, third person).

1. `search_calibrations` as above. Extract: readout calibrations, `red_line`, `guideline`,
   `competitor`, `partner`, `brand:summary`, `target:weekly-health`, `theme:brand`. Drop every
   `review:` key (content review only; see `atlas-tools.md`). `theme:brand` styles the page
   and is never a guideline.
2. `list_post_search_fields` once. Use only paths it returns.
3. `search_posts` per linked handle: `author.username` = handle, `postedAt` gte the window
   start, `exists mediaKind` (drops stories). Sort `postedAt` desc, limit 100, page on the
   cursor. Project `postedAt`, `text`, `url`, `likeCount`, `commentCount`, `viewCount`,
   `saveCount`, `shareCount`, `mediaKind`, `media` (container, never leaf URLs),
   `instagram.mediaProductType`, `instagram.hashtags`, `instagram.account` (container, for the
   profile picture and follower count), `tiktok.account` where present.
4. Baseline: the same query for the 28 days before the window (daily) or the prior week and
   the prior 8 weeks (weekly). One `aggs` call per window: `date_histogram` on `postedAt`
   (day) with sum of likes, comments, saves, shares, views; `terms` on `mediaKind`.
5. `search_creators` filtered on the username for the current follower count. Compare with the
   follower count stored in the last readout's insights, if any.
6. `search_insights` filtered on `runKey` prefix `readout-daily-{profile}` or
   `readout-weekly-{profile}`, sorted newest first, limit 50. This is the "since last time"
   source: open `action_item` findings, last follower count, last flagged posts.
6b. Content reviews: `search_insights` with a `prefix` filter on
   `detail.account_review.runKey` = `content-review-{profile}`, newest first, paged. Group the
   findings by `runKey` (one review each) and keep the reviews whose `detail.reviewedAt` (UTC) falls
   in the window once converted to the R1 timezone; every finding of a review carries the same value. Within a review, read by
   `detail.findingType`: `verdict` carries `verdict`, `creator`, `counts`, `openEdits`,
   `hardRuleHits`, `reviewPage`, `permalink`, and `postedAt`; `feedback` carries the user's
   `userVerdict`; `check` with `result: "Fail"` feeds the most failed check; `edit` is a
   required edit. Open edits span every review, not just the window: an `edit` stays open
   until a `close` finding names its `idempotencyKey` in `detail.closes`. See
   `content-review.md`, **Feeding the readouts**. Read only; never write a review finding.
   A content review edit is closed only by a later review's `close` finding, never by a
   readout: the readout's own resolving `went_well` applies to readout and brief items only.
7. Red-line scan: for each `red_line` with `action: block|flag|escalate`, one semantic
   `search_posts` with `queryText` = the red-line body, filtered to the window and the brand's
   handles, limit 10. Report hits by permalink. Never invent a hit. `review:` keys were
   dropped in step 1; hits on content review hard rules come from step 6b (`hardRuleHits`).

Metric definitions:

- Engagement = likes + comments + saves + shares.
- Engagement rate = engagement ÷ follower count at run time.
- Anomaly = a day or post whose lead metric (R4) sits outside the R3 threshold against the
  baseline median. Report the metric, the baseline median, and the percent delta.
- Cadence = posts per day (daily) or per week (weekly), against the baseline.

## Resolving "today" (both readouts)

The date a run starts on comes from the shell clock, never from text. Run
`TZ=<R1 timezone> date +%F` via Bash and derive the window from that. Dates stated in the
scheduled-task prompt, the session header, or the main thread's launch message are
unreliable (a session header can be a day stale) and are ignored, except an explicit target
window that is strictly earlier than the shell date. The page footer and chat summary always
state the shell date, the timezone, and the resolved window. Before writing insights, check
the previous run's `runKey` (filter path `detail.account_review.runKey`): a run that resolves
to a window already written is a stale
clock, not new data (see the duplicate-window guard in each agent).

## Daily readout

Window: the previous calendar day in the R1 timezone (00:00 to 23:59), resolved per
**Resolving "today"** above. If no posts landed,
say so in one line and still report anomalies on older posts still accruing engagement, plus
red-line hits.

Chat summary, under 150 words:

- Headline: one line, lead metric vs 28-day median with the percent delta.
- Yesterday: posts published, engagement, the best post with its number.
- Flags: anomalies and red-line hits, each with a permalink; "none" is a valid line.
- Since last readout: follower delta, any action item that changed state.
- Content reviews: reviews run yesterday by verdict, and every Do not post or hard-rule hit
  with the creator's handle and the review page link (`reviewPage`). Leave the line out when
  there were none.
- One closing line: findings saved, page link.

Page: one compact card. Header (brand, date, network). KPI strip (posts, engagement,
engagement rate, followers with delta). One 28-day sparkline of the lead metric with
yesterday marked. Cards for yesterday's posts (media, metric row, one-line takeaway). Flags
block. A content reviews block when any review ran yesterday: one row per review with
verdict chip, creator, deliverable, open edits, and the review page link. Footer with the CDN
expiry note. Republish to the same path each day.

Insights written (`append_insights`): `runKey` `readout-daily-{profile}-{YYYY-MM-DD}`,
role `account_review`, `schema` = network, `entityKind` account or post, `entityId` the
network's own id. Kinds: `went_well` for the best post, `needs_improvement` for each anomaly
below threshold, `action_item` (with `priority`) only for red-line hits and escalations.
`idempotencyKey` per finding. Keep daily writes to 5 or fewer.

## Daily launch pulse (campaign window)

The campaign lens needs a live read during launch week, and product teams want to know how the
launch is landing. The daily readout adds a pulse while a campaign window is open.

**Pulse calibration** (written by the main thread after a campaign brief, or on request, with
its own `AskUserQuestion` confirmation): kind `policy`, key `campaign:{slug}-pulse`, `detail`
`{area: "pulse", body: "window <YYYY-MM-DD>..<YYYY-MM-DD>; topics: <launch terms creators would use>; hashtags: <#tags>; lenses: <lens>[><destination>], ..."}`, where each lens is `campaign` or
`product` and "Both" saves both, each with its own destination if one was typed. A destination
named there is covered by the R2 standing approval, and the confirmation says so.

On every daily run, read every `campaign:*-pulse` record and keep those whose window covers the
target date. A caller may also pass a campaign slug for an on-demand pulse. For each one:

1. **Campaign creators live.** The campaign's accepted creators (`creator-discovery.md`, **State
   written to Atlas**): their posts on the target date that mention the brand. Engagement per
   post against each creator's own median.
2. **Mentions.** A semantic `search_posts` with `queryText` = the pulse topics, filtered to the
   target date, excluding the brand's handles, limit 50; plus `list_hashtag_posts` for each
   pulse hashtag. Posts and distinct creators, against the day before.
3. **Reception.** From the posts in 1 and 2: tone (`analysis.emotionalAnalysis.tone` when the
   census lists it) as counts, and up to five verbatims with permalinks: the praise and the
   friction creators state. For the `product` lens, group the friction by issue.
4. **Drafts and verdicts.** The campaign creators' content reviews on the target date (step 6b).

The pulse is a page section after the flags block, "Launch pulse: {campaign}, day {n} of {N}",
and three bullets in the chat summary. A pulse lens with its own destination gets its own Slack
or email message with the pulse bullets and the page link. Up to three extra findings per
campaign (`detail.campaign`, `detail.recipient`), outside the daily cap of five. A pulse reads
only what Atlas holds: no lookups, no marketplace.

## Weekly readout

Window: Monday to Sunday of the previous week in the R1 timezone, resolved per
**Resolving "today"** above (a Monday run reports the week that ended yesterday). Compare
with the prior week and the 8-week median.

Chat summary, under 250 words, ordered by the primary R6 lens (leadership: outcome bullets
first; team: post-level detail first; product, pmm, growth: that lens's block first), with two
bullets per other saved lens:

- Headline: the week in one line, lead metric vs prior week and vs 8-week median.
- Numbers: posts, engagement, engagement rate, reach or views, followers with delta.
- What worked: top 3 posts with metric and the pattern they share (format, theme, day, hook).
- What did not: bottom 2 posts and the likely reason in one clause each.
- Mix: format split and cadence vs the prior week.
- Open items: action items from prior readouts, briefs, and content reviews still open, with
  age in weeks.
- Content reviews: reviews run by verdict, the most common failed check, and creators
  reviewed more than once. For reviewed published posts, the lead metric against the
  creator's own median when Atlas holds it.
- Next steps: 3 ranked bullets, each tied to a number above.
- Data gaps and one closing line: findings saved, page link.

**Lenses.** The analysis runs once; each saved R6 lens is a section of the same page, the
primary first after the KPI strip, each with an anchor (`#lens-{lens}`). The `team` lens is the
section list below. The others:

- **Leadership:** the outcome in one sentence, the trend, and two or three headline insights.
  One screen.
- **Product:** from the week's market signal findings (`search_insights` on the
  `market-signal-{profile}` prefix, the run covering the week): what changed since the last
  review, features compared with the clips as evidence, friction with quotes. No market signal
  run for the week: one line saying so and offering it, never a substitute analysis.
- **PMM:** from the same findings: creators' own phrases by theme and competitor, share of voice
  by message, and the language the brand's own top posts used this week.
- **Growth:** creator posts about the brand in the week (collab posts on the brand's account,
  partnership-marked posts, and mentions by accounts other than the brand), per creator and per
  format: engagement per post against the creator's own median and the brand's median, and the
  estimated fee from the fee calculator (`fees.md`) per 1,000 engagements, labelled as estimated
  because Atlas holds no spend. End with one recommendation: where the next dollar goes. Each
  creator that beat both medians gets a `went_well` finding with `detail.creator`,
  `detail.lens: "growth"`, and `detail.seedEligible: true`, which feeds discovery's lookalike tier.

Page, sections in order:

1. Header: brand, network, week label, prepared date, and a "Prepared for" chip per lens.
2. KPI strip with week-over-week deltas and the benchmark row from `target:weekly-health`
   when present.
3. Lead-metric line chart, 9 weeks, last week highlighted.
4. Top 3 and bottom 2 post cards with media, metric row, takeaway.
5. Format and theme mix: one small-multiple bar pair (this week vs prior).
6. Open action items table: item, source run (readout, creator brief, or content review), age,
   owner if known.
6b. Content reviews: verdict counts as a small bar, the three most failed checks, and a row
   per review with creator, verdict chip, open edits, and the review page link.
7. Next steps, ranked.
7b. One section per non-`team` lens, per **Lenses** above, in R6 order.
8. Footer: sources, a note that images are a snapshot, "numbers come from Atlas as of {timestamp}".

Insights written: `runKey` `readout-weekly-{profile}-{ISO week, e.g. 2026-W38}`, role
`account_review`. Kinds: `went_well` per top post pattern, `needs_improvement` per bottom
pattern, `action_item` with `priority` per next step (3 max). Mark an older open action item
from a readout or a creator brief as resolved by writing a new `went_well` that references its
`idempotencyKey` in `detail`. Content review edits are never resolved here; only a later
review closes them (step 6b). Every finding carries `detail.recipient` (the primary lens); lens
findings carry `detail.lens`. Growth creator findings are outside the 3 next-step cap, at most 5.

## Page mechanics

Embed every image as a data URI with the snippet in `creator-card.md`, **Images**, page
profile, which also sets how the `<img>` is sized: `post@{card media width}` for post cards
(the CSS width of the card's media, 360 by default), `detail@{W}x{H}` for a larger media panel
(for example `detail@480x1000` for a tall carousel panel), `+text` on posts that are mostly text
or graphics, and `avatar` for profile pictures. Pass `media.mediaUrl` first and
`media.thumbnailUrl` after it, so each post comes from the full-size image or poster. Keep the
images under 8MB and the page under 10MB, cutting images before quality per **Images**. Load the
`artifact-design` and `dataviz` skills before building. Apply the saved brand theme (`theme:brand`) per `theme.md`, **Applying the theme**; without one, the design here stands. Flags, deltas, and verdict
chips keep their semantic colors. Publish with the Artifact tool,
title "<Brand> Daily Readout" or "<Brand> Weekly Readout", and republish to the same path
each run so the link in Slack or email stays stable. Note once in the footer that images are
a snapshot.

## Delivery (Slack and email)

Read `policy:readout-routing`. The page and chat summary always ship. Then:

- **Slack:** if the routing names a channel and a Slack connection is available in the
  session, send one message: the headline, the 3 to 5 key bullets, the page link. Plain text
  with Slack formatting, no images. If no Slack connection is present, say so in the chat
  summary and continue.
- **Per-lens destinations:** a lens in R6 (or a pulse lens) with its own destination gets its own
  message: that lens's three bullets and the page link with the lens anchor. Same connection
  rules as below.
- **Email:** if the routing names recipients and an email connection is available, send one
  message with subject "<Brand> {Daily|Weekly} Readout, {date}", the chat summary as the body,
  and the page link. If no email connection is present, say so and continue.
- Interactive run: confirm the send once with `AskUserQuestion` ("Post to {channel} and email
  {recipients}?" Options: Send (Recommended) / Page only this time). Unattended run: the R2
  confirmation is the standing approval; send without asking.
- Never send to a channel or address that is not in the routing calibration, a lens destination
  in `guideline:readout-audience`, or an open `campaign:{slug}-pulse` record. If the user
  names a new destination mid-run, update the calibration first (supersede, with confirmation).

## Scheduled (unattended) runs

A scheduled run starts a fresh session with no memory of the setup conversation and nobody
to answer questions. The scheduled task prompt must therefore be standalone (templates in the
README). Rules for the agents:

- Never ask a question. If any of the six readout calibrations or `brand:summary` is missing,
  publish a one-card page titled "<Brand> Readout: setup needed" listing the missing items,
  write nothing to Atlas, and end with "Run /aspire:aspire and ask for readout setup."
- Never run a destructive tool. Never call `lookup_*`, `search_creator_marketplace`, or
  `start_business_discovery`.
- If Atlas returns an unauthorized error, publish the "setup needed" card with "Aspire Atlas
  needs a fresh sign in" and stop.
- If a search returns nothing for the window, report "no posts indexed for {window}" rather
  than inventing numbers, and still deliver the page and summary.

## Atlas quirks that apply here

Inherited from `creator-brief.md`: project the `media` and `instagram.account` containers, not
leaf URLs; exclude stories with `exists mediaKind`; `/thumbnail` routes 404 on image posts; published
pages cannot load `cdn.aspire.io` images. New for readouts: `search_insights` returns findings
tenant-wide, so always filter on the `runKey` prefix; and `aggs` only work on the filter path,
so run the red-line semantic query as a separate call.
