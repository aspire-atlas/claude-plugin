# Content library reference

Used by the **Content library** section of SKILL.md and by the `atlas-content-library` agent.
One searchable place for every piece of creator content about the brand, and what the brand is
allowed to do with each piece. The agent catalogs posts Atlas already holds, tags them, joins
the rights the brand has on record, answers questions about them, and publishes one library
page.

It reads the program contract in `program.md` (state model, pages, unattended runs) and reuses
the tagging and scoring of other flows rather than defining its own:

| What | Defined in |
| ---- | ---------- |
| Ad readiness score and its six components | `ad-reuse.md`, **Hook score** |
| Hook patterns | `ad-reuse.md`, **Hook patterns** (the list `hooks-and-ctas.md` also uses) |
| Retention proxy and the author's own median | `ad-reuse.md`, **Hook score** and **Candidate pool** |
| Frames, when the agent reads them | `content-review.md`, **Media: what the agent can and cannot see**, with the ad reuse sampling in `ad-reuse.md`, **What to read per candidate** |
| People on screen and what reuse would need cleared | `post-analysis.md`, **The page**, section 11, and its **Rules** |
| Brand safety categories | `post-analysis.md`, **The page**, section 8 (the 12 categories) |
| Topics creators talk about | `market-signal.md`, the `market-signal:topics` record, when saved |
| Rights records | `program.md`, the `rights` record type, written by `atlas-content-sourcing` |

## Scope: one program, or the whole brand

The program is optional.

- **With a program**, the library holds the program's creators' posts plus everything else
  about the brand (tagged, mentioned, tracked hashtags), and rights come from that program's
  records first.
- **Without a program**, the library covers the whole brand. Rights come from every program's
  records. A post that no program holds a rights record or a deal for shows **No rights**.

Say the scope on the page header and in the summary: "{Program} content library" or "{Brand}
content library, all programs".

## Modes

| Mode | What it does | Writes to Atlas | Publishes |
| ---- | ------------ | --------------- | --------- |
| `build` | Collects, tags, joins rights, and republishes the library | `asset` findings, new or changed only, and the `page` finding on first publish, when L2 says save | The library page |
| `query` | Answers one question from the catalog with ranked result cards | Nothing | Nothing; returns cards and a filtered page link |
| `expiring` | Lists rights expiring within 30, 60, or 90 days and those expired in the last 30 | Nothing | Nothing; posts the alert when L3 says so |
| `build` with `run: unattended` | A scheduled refresh: build, republish, and the expiring-rights alert to saved routing | `asset` findings only when the program's cadence, or `library:cadence` for the whole brand, names the library (**Unattended runs**) | The library page |
| `sample` | The page from invented data (`agents/sample-artifact.md`) | Nothing | A sample page |

`run` is `interactive` (the default) or `unattended`. Older launch wording (`readout.md`, **Run
flag**) means `mode: build`, `run: unattended`.

`query` and `expiring` read the saved catalog. When no `asset` finding exists for the scope, or
the newest is more than 14 days old, say so in one line and recommend a `build` first; still
answer from what is saved.

## Approvals (main thread)

The agent asks nothing. The main thread asks these in one `AskUserQuestion` call, with the
**Reading the ask** confirmation, skipping what the user already said, and passes the answers in.

| # | Question | Options | Modes |
| - | -------- | ------- | ----- |
| L1 | Which content? | One option per active program, "All our programs and everything about {brand}" (Recommended when there is no program or several), and for `build` the window: "Last 180 days (Recommended)", "Everything Atlas holds", or typed. For `expiring`: "Next 30 days (Recommended)", "Next 60 days", "Next 90 days". | all but `sample` |
| L2 | Save the catalog to Atlas, so the team and scheduled runs can search it? | "Save (Recommended)", "Page only" | `build` |
| L3 | Post the expiring-rights alert to {channel} and email {recipients}? Only when routing is saved. | "Post (Recommended)", "Page only this time" | `build`, `expiring` |

The library's link is a `page` finding (key `library`, `program.md`, **Working state**). The
agent writes it itself on first publish under the same L2 approval as the catalog. On "Page
only" it writes nothing, so the next run publishes a new page; say so in the summary.

## Collecting assets

Read only what Atlas holds. Never call `lookup_posts`, `lookup_creators`,
`search_creator_marketplace`, `start_business_discovery`, or `add_hashtags`. Call
`list_post_search_fields` once and use only the paths it returns.

**Window.** Default the last 180 days, from the shell clock. On the first build for a scope (no
`asset` finding saved for it), read everything Atlas holds. A window the user typed wins. Cap a
run at 1,000 posts, newest first; when the cap is hit, say how many were left for the next run.

**Sources.** A post can come from several; keep them all in `sources`, listed in this order:

| Source | How it is found |
| ------ | --------------- |
| `program` | The author is on a program roster (the newest `roster` finding per creator, any stage from Agreed on, or a `deliverable` finding with this `postId`), and the post is a matched deliverable, tags or mentions the brand, carries a tracked hashtag, or names a catalog product. A roster creator's unrelated posts stay out. |
| `tagged` | `search_posts` where the mentions field names one of the brand's handles. |
| `mention` | `search_posts` where the caption or transcript matches the brand's name, a handle, or a catalog product name (`match_phrase`). |
| `hashtag` | `list_hashtags` for the watch list, then `list_hashtag_posts` for every tracked hashtag on each network, paged with the cursor, `since` and `until` set to the window. `hashtag-not-tracked` and `no-linked-channel` are normal states. |

Every `search_posts` call keeps `exists mediaKind` (no stories), excludes the brand's own
handles and every saved `competitor` handle, and pages with the cursor. Dedupe on the
network's post id. `search_creators` reads each author's followers and profile picture once
per run.

Project `postedAt`, `text`, `url`, `author.username`, `author.followersCount`, the metrics,
`mediaKind`, `media` (container), `instagram.mediaProductType`, `instagram.mediaAudioType`,
the mentions and hashtags, the partnership marker, and, when the census lists them,
`analysis.transcript`, `analysis.overlayText`, `analysis.brandSafety`,
`analysis.commercialAnalysis.featuredProducts` and `featuredBrands`.

## Tagging each asset

Tag from fields Atlas holds and from frames the agent viewed. A tag with no evidence is left
empty and counted under gaps, never guessed.

| Tag | Rule |
| --- | ---- |
| Format | Reel, TikTok video, feed video, image, or carousel, from `instagram.mediaProductType` and `mediaKind`. |
| Products | Match each product name from every `program:{slug}-catalog` in scope, and the products named in `brand:summary` and `brand:business-context`, against the caption, `analysis.transcript`, `analysis.overlayText`, and `featuredProducts`. Keep which field matched. A product seen only in frames counts when the agent viewed the frame, with its time. |
| Themes | One or two from: unboxing, review, tutorial or how-to, get ready with me, day in the life, haul, comparison, in use (recipe, workout, routine), before and after, lifestyle, testimonial. Add the brand's `market-signal:topics` names when saved. From the caption, transcript, and overlay text. |
| Hook pattern | One pattern from `ad-reuse.md`, **Hook patterns**, read from the first three seconds of the transcript and overlay text, or from frames when read. Video only. No transcript, overlay text, or frames: untagged. |
| Ad readiness score | The `ad-reuse.md` **Hook score**, out of 100, with its six components and their evidence. Video only; images and carousels show "Not scored: no hook timing". See **Scoring at library scale**. |
| People on screen | Per `post-analysis.md`, section 11: how many people, their roles (the creator, others, possible minors), and names only when the caption, on-screen text, transcript, or the account names them. Never identify a person from a face alone. From frames when read; otherwise from the caption and transcript, marked "not checked on screen". |
| Reuse needs | What a reuse cut would need cleared: others' likeness, trademarks on screen, and the audio (`instagram.mediaAudioType` original or licensed, or "unconfirmed"; "music rights unknown" when music is present). A checklist for the brand's legal team, not legal advice. |
| Brand safety | Atlas's `analysis.brandSafety` categories at medium or higher, one semantic `search_posts` per `red_line` (its body as `queryText`, filtered to the catalog's post ids, skipping `review:` keys), and any saved competitor named or in frame. `clear`, `flag` (named flags), or `block` (a `block` red line hit or a competitor). |
| Source | Per **Collecting assets**. |

### Scoring at library scale

The full hook score needs frames. A library holds hundreds of posts, so:

1. **Every video** is scored from fields: hook by 3 seconds and brand by 3 seconds from timed
   transcript lines and overlay text, works without sound from overlay text, the retention
   proxy from views per follower against the author's own median (or saves plus shares per
   view), the standalone segment from transcript timing, ready for paid from disclosure,
   competitors, red lines, and music. A component with no data scores zero and is listed as
   missing. Basis `fields`.
2. **The top 12 new or changed videos by field score** in each build are then read with frames
   per `ad-reuse.md`, **What to read per candidate**, and rescored. Basis `frames`. View every
   frame extracted. People on screen come from these frames too.
3. **Older posts keep their score.** A post more than 30 days old whose saved `asset` finding
   has a score keeps it, unless its tags changed. Metrics settle after about a month.

The page shows the basis next to each score ("from frames" or "from transcript and fields").

## Rights

The library reads rights. It never writes them: `rights` findings belong to
`atlas-content-sourcing` (`program.md`, **Working state**).

**Read**, with `search_insights` on the prefix `program-{profile}-{slug}` (or `program-{profile}-`
for the whole brand), paged to the end, newest first, filtered on `detail.recordType`:

- `rights`: the newest finding per post and grant (by `detail.recordedAt`).
- `terms`: the newest agreed deal per creator (`status` agreed).
- `deliverable`: posts matched to a creator's deal (`postId`, `postUrl`, `status` posted).
- `roster`: who is on each program and at what stage.

Also read `search_insights` on the prefix `creator-brief-{profile}` for deliverables that asked
for rights, as `ad-reuse.md` does.

**The rights status per asset**, first match wins per usage:

| Status | When | Badge |
| ------ | ---- | ----- |
| Paid usage, Whitelisting, Organic repost | A `rights` finding with `status` granted for that usage and `expiresAt` in the future (or none set) | The usage, the channels, and "until {date}"; "Get this in writing" when `inWriting` is false |
| From the deal | No grant for that usage, but the creator's deal includes it and the post is one of their matched deliverables. The deal is the newest agreed `terms` finding, or the program's terms for the creator's type when none exists (`program.md`, **Who owns a deal**). `usage` with `usageDays` and `usageChannels`; whitelisting when `whitelisting` is true, with `whitelistingDays` | The usage, the channels, "from the deal", and the end date: the post date plus `usageDays` (or `whitelistingDays`), or "no end date in the deal" |
| May be covered by the deal | A roster creator's post in the deal's term that the tracker has not matched to a deliverable | "Check the deal": never shown as cleared |
| Requested | A `rights` finding with `status` requested or renewal requested, or a creator brief deliverable that asked for rights | "Requested {date}" |
| Countered | `status` countered: the creator answered with different terms or a fee | "Creator countered {date}" |
| Wanted | `status` wanted | "Wanted" |
| Declined | `status` declined | "Declined {date}" |
| Expired | `status` expired, or a grant or deal end date in the past | "Expired {date}" |
| No rights | None of the above | "No rights" |

Rules:

- **Rights are never assumed.** Only a record or a matched deliverable clears an asset. A
  `paid` or `ambassador` program type alone clears nothing.
- **Cleared for ads** means a current Paid usage or Whitelisting, from a grant or from the
  deal. Organic repost alone is "cleared for organic", shown apart.
- **The deal is derived, not recorded.** Rights from the deal show "from the deal" and are never
  written as `rights` findings. When the brand wants deal rights tracked like grants (renewals,
  expiry alerts in sourcing), say so under "Needs the main thread" as a proposal for
  `atlas-content-sourcing`; never write them.
- **Disagreement is shown.** When a grant and the deal disagree (a declined request for a post
  the deal covers, different channels, different end dates), show both and mark the asset
  "Records disagree" for the team to settle.
- **Channels** come from the grant, or from the deal's `usageChannels`. A deal without them
  shows "channels not stated in the deal".
- Show usage, channels, and end dates only. Never show a fee, the budget, or a maximum
  (`program.md`, **7**).
- Instagram's paid partnership label and signed contracts are not held in Atlas: list them under
  gaps, never as absent.

## Expiring rights

From the joined rights, every grant or deal end date within the horizon from today (the shell
clock, in the cadence timezone when there is one): 30 days, 60 days, or 90 days, plus the ones
expired in the last 30 days. Per row: the asset, the creator, the usage and channels, the end
date, days left, whether it is cleared for ads, and its ad readiness score. Sort by end date.

Each row ends with the next move, as a hand-off: "Renew with @{handle}" for the ones worth
keeping (cleared for ads, or ad readiness 60 and up), "Pull from ads by {date}" for the rest.
Renewal requests are `atlas-content-sourcing`'s job; the library only lists them.

## Worth requesting

Assets the brand should ask rights for: video, ad readiness score 60 or more and in the top
quarter of the library's scored videos, brand safety not `block`, no current rights (or organic
repost only), not declined in the last 90 days, and the author not a competitor. At most 12,
by score. Each row: the asset, the score with its two strongest components, the hook pattern,
the products, and what reuse would need cleared. The list hands off to
`atlas-content-sourcing` for rights requests.

## Query mode

The launch carries the user's question in their words. Turn it into filters, show the filters
read back in one line, and answer from the catalog:

| Filter | Values |
| ------ | ------ |
| Product | A catalog or brand product name |
| Format | Reel, TikTok video, feed video, image, carousel, or "video" |
| Theme | From the theme list |
| Creator | A handle |
| Rights | No rights, requested, countered, cleared for organic, cleared for ads, paid usage, whitelisting, from the deal, expired |
| Expiring | Within N days |
| Ad readiness | A minimum score |
| Date | Posted after or before |
| Source, network, safety | As tagged |

A word the filters cannot hold ("with a dog", "outdoors") runs one semantic `search_posts` with
that text as `queryText`, filtered to the catalog's post ids; those results are labelled
"matched by search, not by a tag".

Rank: every filter matched first, then ad readiness, then newest. Return at most 12 result cards
(media, creator, posted date, format, products, theme, hook pattern, score, rights badge, end
date, link). Zero results: say which filter emptied the list and the nearest match without it.
When the library page exists, add its link with the filters in the address
(`#product=…&rights=ads`), so the page opens filtered.

## The library page

Title "<Brand> {Program} Content Library", or "<Brand> Content Library" for the whole brand.
Republish to the same link: the newest `page` finding with key `library` on the program's
prefix, or on `content-library-{profile}` for the whole brand. None yet: publish a new page and
write its `page` finding (**Asset findings**). Load `artifact-design`, and `dataviz`
for the charts; apply `theme:brand` per `theme.md`, **Applying the theme**; render for
`recipient` per `recipient-lens.md`. Rights badges keep their semantic colors under any theme.

Sections, in order:

1. **Header.** The scope, the window, "Prepared for" chip, when the catalog was read.
2. **Counts.** Assets, cleared for ads, cleared for organic, requested, expiring in 30 days, no
   rights. Then small bar charts: assets by product, by format, by rights status.
3. **Cleared for ads.** Cards for current Paid usage and Whitelisting, by ad readiness, with
   the usage, channels, and end date on each.
4. **Expiring soon.** The 30, 60, and 90 day lists from **Expiring rights**, as tabs, with the
   next move per row.
5. **Worth requesting.** The list from **Worth requesting**, with one line: "Ask for rights to
   these from the content sourcing flow."
6. **The library.** A filterable grid of every asset. A filter bar for every filter in **Query
   mode**, a text box over caption excerpts and handles, and sort (newest, ad readiness, end
   date). Filters run in the page on the data embedded in it; the page needs no runtime
   capabilities. The address hash sets filters on load and updates as they change. Each card:
   media, creator with avatar, posted date, format chip, products, themes, hook pattern, ad
   readiness with its basis, safety, people on screen, rights badge and end date, link.
7. **Gaps and method.** Untagged counts per tag, videos scored from fields only, posts over the
   cap, sources not tracked, what Atlas does not hold (contracts, the paid partnership label),
   and where rights come from.
8. **Footer.** "Read from Atlas as of {timestamp}"; images are a snapshot; "Rights shown are
   what your records and agreed deals say. Check the signed agreement before paid use."

**Lens order.** `team` keeps the order above. `performance` and `creative` lead with Cleared
for ads and Worth requesting. `brand` adds a safety filter preset to "flag" and "block" and
moves people on screen and reuse needs up on each card.

**Images.** Embed with `creator-card.md`, **Images**, page profile: `post@240` for the three
shelves and `thumb@120x150` in the grid, `avatar` for creators. Keep images under 8MB and the
page under 10MB. When the grid would pass that, embed the shelves and the 150 highest-scored
grid cards, draw the rest as a flat tile with the format chip and the link, and say so under
gaps.

## Asset findings

Written only in `build` with L2 "Save", or in an unattended run when the cadence names the library. Never in
`query`, `expiring`, or `sample`.

`append_insights` per `program.md`, **Working state**: role `account_review`, runKey
`program-{profile}-{slug}-{YYYY-MM-DD}`, kind `went_well` `low`, anchored to the creator's
account (`entityKind` `account`, `entityId` the network's own account id, `schema` the network),
in batches of 50. Without a program the runKey is `content-library-{profile}-{YYYY-MM-DD}`
(`program.md`, **Brand-wide library**) and `detail.program` is left out. The Program manager's
dispatch and the program dashboard read these too, so a brand-wide build keeps every program's
library current.

Write a finding only for an asset that is new, or whose tags changed since its newest finding:
products, themes, format, hook pattern, people on screen, safety, or source changed, or the ad
readiness score moved 5 points or more. Unchanged assets are not written again.

`detail` carries the `program.md` fields (`recordType` `asset`, `program`, `recordedAt`, `by`
`atlas-content-library`, `postUrl`, `postId`, `handle`, `network`, `format`, `products`,
`themes`, `hookPattern`, `adScore`, `peopleOnScreen`, `safety`, `sources`) and adds:

| Field | Holds |
| ----- | ----- |
| `postedAt` | The post's date |
| `adScoreParts` | The six components, each with its points and evidence, or "missing" |
| `adScoreBasis` | `frames`, `fields`, or `not scored` |
| `productEvidence` | Per product, the field or frame time that matched |
| `reuseNeeds` | Likeness, trademarks, audio, as short lines |
| `captionExcerpt` | The first 120 characters of the caption |
| `recipient` | `{team, decision}` of the primary lens |

**The `page` finding.** On a first publish (no library `page` finding in scope), write one
`page` finding in the same `append_insights` call: `detail.key` `library`, `url`, `title`,
anchored to the brand's own account on its first linked network, `idempotencyKey`
`page-library-{scope}`.

Rights are never stored on an asset. They are joined at read time, so a new grant shows on the
next run without rewriting the catalog. `idempotencyKey`:
`asset-{network}-{postId}-{YYYY-MM-DD}`.

## Delivery

Read `program:{slug}-routing`. For the whole brand, read only the `routing` saved in
`library:cadence`; with none, or only `page`, the run is page only.
The page and chat summary always ship. Slack and email follow `readout.md`, **Delivery**: one
message with the counts expiring within 30 days, the five soonest (creator, usage, end date),
anything newly cleared for ads since the last run, and the page link. Interactive runs post only
on L3 "Post"; unattended runs post on the P8 standing approval (for the whole brand, the
`library:cadence` confirm). Never post to a destination
that is not saved. No rights expiring and nothing new: unattended runs still republish and skip
the message.

## Unattended runs

Follow `program.md`, **9**, and `readout.md`, **Scheduled (unattended) runs**:

- Never ask, never decide, never write a `rights` finding, never draft or send a message to a
  creator.
- Resolve the date from the shell clock in the cadence timezone.
- Collect, tag, join, republish to the link in the library's `page` finding, and post the
  alert to the saved routing.
- Write `asset` findings only when `program:{slug}-cadence` names the library (`library
  weekly`, the P9 "Weekly content library refresh" answer), or, for the whole brand, when the
  `library:cadence` calibration is saved (**Content library**, Schedule, in SKILL.md). Without
  it, republish and alert, write nothing, and say "Library refresh is not in the saved
  schedule: nothing saved" in the summary.
- No library `page` finding yet: publish nothing new, write nothing, and end with "Run the
  content library once from /aspire:aspire to create the page." Tasks are scheduled only after
  the page exists (`program.md`, **8**).
- Program records missing (a program run only; the whole brand needs none), or Atlas
  unauthorized: the "setup needed" card from `program.md`, **9**.

## What the library never does

- Look up, fetch, or discover posts or creators, or add hashtags to the watch list.
- Write any record type but `asset` and its own `page` finding, or change a `rights`, `terms`,
  `deliverable`, or `roster` finding.
- Show a post as cleared without a record or a matched deal.
- Name a person from their face, or show a fee or another creator's terms.
- Draft a rights request. It lists what is worth requesting and hands off to
  `atlas-content-sourcing`.
- Touch a creator ad campaign's records.
