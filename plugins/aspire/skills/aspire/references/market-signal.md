# Market signal reference (what creators say about the brand vs. competitors)

Shared by the `atlas-market-signal` agent and the **Market signal** section of SKILL.md. Holds
the setup questions, the calibrations, the data method, the analysis rules, the page, the
findings, delivery, and the unattended rules.

## Why the market signal agent exists

The account analyst and the readouts look at accounts. The market signal looks at the
conversation: posts by creators about the brand and the competitors it names. The
same run feeds several readers (`recipient-lens.md`):

- **Product** gets a parity read: which capability was compared, where the brand won or lost,
  and what users complained about.
- **PMM** gets a messaging read: the words creators use for each product, and which framing is
  spreading.
- **Performance and Creative** get reuse candidates: the comparison videos with the strongest
  openings, handed to the `atlas-ad-reuse` agent for the cut list.
- **Campaign** gets a brief update: what the brand won on, so the next brief leads with it.
  The `atlas-creator-brief` agent reads these findings when it plans the next brief.

It runs weekly on a schedule, so the tracking leads with what changed since the last run.
The weekly readout's product and PMM lenses read its findings rather than re-running it.

## Setup: define the tracking once, for everyone

Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the
end, `includeSuperseded: true`) and skip any question whose key is already occupied. All writes
use `append_calibration`, `provenance: "interview"`, `statement` under 280 characters.

| # | Question (via `AskUserQuestion`) | Options | kind | key | detail |
| - | -------------------------------- | ------- | ---- | --- | ------ |
| M1 | Which competitors should creators' posts be compared against? (multiSelect) | Every saved `competitor` record, up to four; the free text field adds others | `guideline` | `market-signal:scope` | `{concern: "requirement", appliesTo: ["market-signal"], body: "competitors: <names and handles>; networks: <instagram, tiktok>"}` |
| M2 | Which products, features, or topics should it track? (multiSelect) | Three to four inferred from `brand:summary` and `brand:business-context` (product names, flagship features, the category's recurring comparisons) | `guideline` | `market-signal:topics` | `{concern: "requirement", appliesTo: ["market-signal"], body: "<one topic per line, with the words creators use for it>"}` |
| M3 | Who reads it? (multiSelect) | 1) Product and engineering (parity read) (Recommended); 2) Product marketing (messaging read); 3) Performance and creative (reuse candidates); 4) Campaign planning (brief input) | `guideline` | `market-signal:lenses` | `{concern: "preference", appliesTo: ["market-signal"], body: "primary: <lens>; lenses: <lens>[><destination>], ..."}` |
| M4 | Where should each run land? (multiSelect) | 1) Published page + chat summary (always on); 2) Slack channel (type the channel); 3) Email (type the recipients) | `policy` | `market-signal:routing` | `{area: "routing", body: "page; slack:#channel; email:a@x.com"}` |
| M5 | How often should it run? | 1) Weekly, Monday 7:00, my timezone, before the weekly readout (Recommended); 2) Weekly on another day (type it); 3) On demand only | `policy` | `market-signal:cadence` | `{area: "cadence", cadence: "weekly", body: "weekly <DAY HH:MM>, <IANA timezone>"}` or `body: "on demand"` |

Rules:

- M1: a competitor the user adds by name is also offered as a new `competitor` calibration in
  the same batch confirmation. M1 names the networks too: Instagram and TikTok are the only
  searchable ones.
- M3: a lens may carry its own destination (`product>slack:#product-feedback`), typed in the
  free text field. Those destinations are covered by the same standing approval as M4.
- M4 doubles as the **standing approval to deliver and to save findings**. Say so: "Scheduled
  runs will post to {channel} and email {recipients}, and save their findings to Atlas, without
  asking each time."
- Offer once, after the batch is saved, to add the tracked topics' hashtags and the
  competitors' branded hashtags to the watch list (`add_hashtags`, its own confirmation). The
  watch list widens what Atlas indexes; it is never required.
- Confirm the batch once before writing ("Save this market signal setup for {brand}? Everyone
  on the team and every scheduled run will use it."), then write the five records. A
  `key-exists` follows the Phase 5 supersede rule.

## Data method

Filter path unless noted, `context` on every call, only field paths from the census.

1. **Window.** Default the most recent completed Monday to Sunday in the M5 timezone, from
   the shell clock (`readout.md`, **Resolving "today"**), whatever day the run starts on. That
   keeps scheduled, on-demand, and weekly-readout windows on the same ISO weeks. Baseline: the
   four weeks before. A caller may pass an earlier window of any length.
2. **Entities.** The brand (its name, its handles, its tracked hashtags) and each M1
   competitor (its name, its handles, its `spellingVariants` from the `competitor` record).
3. **Mention sets.** Per entity: `search_posts` where the text matches the name or a spelling
   variant (`match_phrase`), or `instagram.mentions.username` names a handle, or a hashtag
   matches; `must_not` the entity's own handles and the brand's handles; `exists mediaKind`;
   window on `postedAt`. Page with the cursor, up to 500 hits per entity; say when a set is
   capped. `totalHits` gives the post count; `aggs` `cardinality` on `author.username` gives
   distinct creators. Engagement sums come from the paged hits (the `aggs` allowlist has no
   sums).
4. **Paid vs organic.** Split each set on the partnership marker the census exposes. Share of
   voice is reported organic first, paid beside it, never blended without saying so.
5. **Comparison set.** Posts in the brand's set that also match at least one competitor, plus
   one semantic `search_posts` per competitor with `queryText` "{brand} vs {competitor}"
   filtered to the window, limit 25. Dedupe on the post id.
6. **Read the posts that matter.** For the comparison set and the top 20 per entity by
   engagement, project `text`, `analysis.transcript`, `analysis.overlayText`,
   `analysis.emotionalAnalysis.tone`, `analysis.commercialAnalysis.featuredBrands`, the
   metrics, `media` (container), and the author's account container.
7. **Last run.** `search_insights` with a `prefix` filter on `detail.account_review.runKey` =
   `market-signal-{profile}`, newest first, limit 50. Before pulling data, compare the resolved
   window with the newest run's `detail.window` (not its `runKey`, whose form differs between
   weekly and custom windows). If they match, apply the readouts' duplicate-window guard:
   re-check the clock once, then publish with a "Repeat window" banner and write nothing.

## Analysis rules

- **Share of voice.** Per entity: posts, distinct creators, and engagement, as shares of the
  total across the brand and the M1 competitors. Against the baseline, as percentage points.
- **Features compared (parity).** For each M2 topic that appears in the comparison set, the
  outcome per competitor: `won`, `lost`, `even`, or `unclear`. An outcome needs an explicit
  statement: a quoted caption line, or a transcript line with its timestamp. Tone alone is
  `unclear`. Count the creators behind each outcome, and weight nothing by follower count
  without saying so.
- **Friction.** Complaints about the brand, grouped by issue, each with quotes and links.
  Two or more creators make an issue; one creator is listed as a single report.
- **Framing.** The recurring phrases creators use for each product (two to four words, at
  least 3 creators). A phrase is **spreading** when its creator count is at least double its
  baseline and at least 3.
- **Reuse candidates.** The comparison videos with the strongest openings, ranked by the
  retention proxy in `ad-reuse.md`. List them; the cut list is the `atlas-ad-reuse` agent's job.
- **What changed.** Against the last run: share-of-voice moves of 3 points or more, new or
  flipped feature outcomes, new friction issues, new spreading phrases.
- Competitors not indexed (no posts in the window and none in the baseline): say so and
  suggest the watch list or an account review of the competitor's handle. Never start
  discovery for them.

## Rendering for each lens

The primary M3 lens (or the lens passed in the launch) leads. Every other saved lens gets a
section. Each follows `recipient-lens.md`, **Rendering for a lens**.

- **Product:** what changed on top, then features compared (won, lost, even, with the clips as
  evidence), then friction with quotes. No marketing gloss.
- **PMM:** framing by product with verbatim phrases grouped by theme and competitor, share of
  voice by message, and gaps where the brand's positioning has no creator language behind it.
- **Performance and Creative:** the ranked reuse candidates with their openings, and a line
  offering the `atlas-ad-reuse` agent for the cut list.
- **Campaign:** three bullets: what the brand won on, the language to borrow, and what to
  avoid, for the next brief.

## Page

Title "<Brand> Market Signal", republished to the same path each run. Sections: header with the
window and the "Prepared for" chip; since last run; share of voice (a bar chart of posts and
creators per entity, organic and paid split); the primary lens section; the other lens
sections; comparison post cards with media and the quoted line; a verbatim wall (at most 12
quotes, each linked); method and gaps (sets capped, competitors not indexed, fields missing);
footer with "numbers come from Atlas as of {timestamp}" and a note that images are a snapshot.
Images follow `creator-card.md`, **Images**, page profile. Load `artifact-design` and
`dataviz` first; apply `theme:brand` per `theme.md`, **Applying the theme**.

## Findings

Findings are written only with approval: interactive runs when the user chose to save them in
the launch question, unattended runs on the M3 and M4 setup confirmation, which says scheduled
runs save their findings to Atlas.

`append_insights`, `runKey` `market-signal-{profile}-{ISO week, e.g. 2026-W40}` when the window
is exactly one Monday to Sunday week, `market-signal-{profile}-{start}-{end}` for any other
window. The duplicate-window guard compares the resolved window with the newest run's window,
not its name, so a custom window never blocks a weekly run. Role `account_review`. Summary
findings anchor to the brand's own account on the network (`entityKind` `account`); evidence
findings anchor to the post (`entityKind` `post`, the network's own media id). At most 12:

| Finding | Kind | `priority` |
| ------- | ---- | ---------- |
| A feature the brand won, a positive spreading phrase | `went_well` | n/a |
| A feature the brand lost, a friction issue | `needs_improvement` | n/a |
| A recommendation per lens (3 max) | `action_item` | Required |

`detail` carries `recipient` (primary lens), `lens` (for a secondary-lens finding),
`window` (`{start, end}`), `competitor`, `topic`, `outcome`, `sov` (`{brand, competitors{}, organic, paid}`),
`verbatims[]` (quote, permalink, timestamp), `changedSinceLastRun`, and `evidence[]`.
`idempotencyKey` per finding.

## Delivery

Read `market-signal:routing` and the per-lens destinations in `market-signal:lenses`. The page
and chat summary always ship. Slack and email follow `readout.md`, **Delivery**. A lens with
its own destination gets its own message: that lens's three bullets and the page link with
the lens section's anchor (`#lens-product`). Interactive runs confirm the sends once;
unattended runs send on the M3 and M4 standing approval. Never send anywhere else.

## Scheduled (unattended) runs

- Never ask a question. If `market-signal:scope`, `-topics`, `-lenses`, `-routing`, or
  `-cadence` is missing, publish a one-card page "<Brand> Market Signal: setup needed" listing what is
  missing, write nothing, and end with "Run /aspire:aspire and ask for market signal setup."
- No discovery and no destruction: never call `lookup_*`, `search_creator_marketplace`,
  `start_business_discovery`, `add_hashtags`, or any Destructive tool.
- Date from the shell clock in the M5 timezone.
- An unauthorized error publishes the "setup needed" card with "Aspire Atlas needs a fresh
  sign in" and stops.
- An empty window reports "no creator posts about {brand} or its competitors indexed for
  {window}" and still delivers.
