# Fee calculator reference

Used by the **Fee calculator** section of SKILL.md, which runs the questionnaire, and by every
flow that shows what a brand should pay a creator: the creator profile page, the creator brief,
the discovery shortlist, Draft Outreach, and any flow added later. The rates are one Atlas
calibration, so every teammate, every agent, and every scheduled run prices the same way.

A creator fee is always a calculation from the brand's CPM ladder and the creator's own view
counts. No flow prices a creator any other way: never from memory, a follower count, or a
benchmark fetched mid-run.

## How a fee is calculated

The calculator prices on CPM: what the brand pays per 1,000 views, applied to the views the
creator typically gets. One CPM ladder covers every platform.

1. **Channels.** The platforms the offer covers, each with its format: YouTube video, YouTube
   Short, Instagram Reel, Instagram feed post, TikTok video. A bundle is one post on each
   channel. The flow knows what it is pricing: the brief's deliverables, the campaign's
   platforms, or, on a profile page, every channel the creator has.
2. **Views per channel.** The median `viewCount` of the creator's last 10 posts of that format
   on that channel. It needs at least 3 of those 10 to have a view count. The median, never the
   mean: one viral post must not set the price.
3. **Bundled views** = the sum of the channels' medians. A single-channel offer uses that
   channel's median alone.
4. **Fee** = bundled views ÷ 1,000 × CPM, at each of the ladder's open, target, and max,
   rounded to the nearest $10.

Worked example: YouTube median 150,000, Instagram Reel median 80,000, TikTok median 20,000.
Bundled views 250,000. At $40 / $80 / $120: open $10,000, target $20,000, max $30,000.

**No data, no price.** Leave the fee out, and name the gap in plain words, when:

- The offer includes a channel the brand's saved platforms leave out ("{brand}'s rates don't
  include YouTube Shorts").
- A channel has fewer than 3 posts of that format with views. This is common for Instagram
  feed posts, which rarely carry a view count ("not enough view data for Instagram feed
  posts").
- The deliverable is work the calculator does not price, such as on-site event work.

For a bundle, a channel with no data leaves the whole bundle unpriced; price the channels that
have data separately and name the missing one. Never fall back to another format's views, to
follower counts, or to another method. A flow that needs a number where there is none leaves a
bracketed blank, `[fee]`.

**Label every fee** with where its rates came from, once per page or message:

| Rate card | Label |
| --------- | ----- |
| No `fees:rate-card` saved, or `source: "aspire"` | "Aspire recommended rates" |
| `source: "adjusted"` | "{Brand}'s rates, set {savedAt}" |

Show fees as three numbers: open, target, max. Draft Outreach uses open only. Fees are
estimates from public view counts; never present one as the creator's own rate card or as a
quote. All amounts are USD.

### Aspire recommended rates

The Aspire CPM ladder, in USD per 1,000 bundled views. Flows use it whenever no
`fees:rate-card` is saved (none, retracted, or unparseable), and the questionnaire offers it
first.

| Rate | CPM | Use |
| ---- | --- | --- |
| Open | $40 | First offer |
| Target | $80 | Where to land |
| Max | $120 | Walk away above this |

The ladder moves in $10 steps. In an interactive main-thread session with no rate card saved,
add one line after the first fee shown: "Set {brand}'s own rates with `/aspire:aspire fee
calculator`." Agents and unattended runs never add it.

## The record

One active record per profile.

| Field | Value |
| ----- | ----- |
| kind | `guideline` |
| key | `fees:rate-card` |
| statement | Under 280 characters, for example "Creator fee rates: {brand}'s rates. CPM $50 open, $80 target, $110 max per 1,000 bundled views, on YouTube, Instagram Reels and TikTok. USD." |
| provenance | `interview` |

The rate card goes in `body` as one JSON string, like the theme:

```json
{"concern": "preference", "appliesTo": ["creator-fees"],
 "body": "<the rate card object below, serialized with json.dumps>"}
```

The rate card object:

```json
{"schema": 1, "currency": "USD", "basis": "cpm-bundled-median-views",
 "source": "adjusted", "savedAt": "2026-09-29",
 "cpm": {"open": 50, "target": 80, "max": 110},
 "channels": ["youtube-video", "instagram-reel", "tiktok-video"],
 "sampleSize": 10, "minPostsWithViews": 3,
 "adjustments": ["Open raised to $50", "Max lowered to $110"],
 "context": {"checkedAt": "2026-09-29", "summary": "<one line on the public benchmarks shown at setup>",
             "sources": [{"title": "…", "url": "https://…"}]}}
```

- `source` is `aspire` when the brand kept the Aspire ladder, else `adjusted`. `cpm` is whole
  dollars with open ≤ target ≤ max.
- `channels` holds the platforms the brand's offers can include. Keys: `youtube-video`,
  `youtube-short`, `instagram-reel`, `instagram-feed`, `tiktok-video`.
- `adjustments` lists what the user changed, trimmed. `context` records the benchmark check
  from F2, or is `null` when it was skipped.
- Readers parse `body` with a JSON parser. A body that does not parse, has no `cpm`, or has a
  `currency` other than `USD` counts as no rate card, and the Aspire ladder applies.
- A user who declines the offer gets a `decline` record, key `decline:fees`, detail
  `{topic: "fee calculator", askedAt}`. It stops the offers. It never blocks an explicit
  request.

`fees:` keys are pricing only. No flow treats `fees:rate-card` as a brand guideline: brief
conflicts, content review checks, discovery criteria, and red-line scans leave it out.

## The questionnaire

Main thread only. Agents never run it, and an unattended session never runs it. Every question
goes through `AskUserQuestion`, per the question format rule in SKILL.md Phase 5.

**F0. Read first.** `search_calibrations` (no filter, limit 100 per page, paged to the end,
`includeSuperseded: true`). If `fees:rate-card` exists, show it (**Showing the rates**) and
ask "Keep {brand}'s current creator rates?" Options: "Keep them (Recommended)", "Change them",
"Go back to Aspire's recommended rates". "Change them" continues at F1 with the saved values
as the defaults. "Go back" is `retract_calibration` behind its own Destructive tools
confirmation. With no record, start at F1.

**F1. Platforms.** multiSelect. "Which platforms can {brand}'s creator offers include?"
Options: "YouTube videos", "Instagram Reels", "TikTok videos", "Short-form extras (YouTube
Shorts, Instagram feed posts)". Describe each in one line; the last one's description says
feed posts often have no view data, so they may show no price. The free text field takes any
other format and says the calculator cannot price it. An offer that includes an unpicked
platform shows no price later.

**F2. Benchmark check (optional).** "Check Aspire's rates against current public benchmarks
first? It takes about a minute." Options: "Show me the rates first (Recommended)", "Check
benchmarks". On "Check benchmarks", follow the Phase 5 web research rule:

1. `WebSearch` for current-year creator CPM figures on the picked platforms, one or two
   searches each ("{year} YouTube sponsored video CPM", "{year} Instagram Reels influencer
   CPM"). `WebFetch` the two or three most specific sources. Skip sources older than 18
   months.
2. Show three to six bullets, each with its figure, source, and date, and one line comparing
   them to Aspire's $40 / $80 / $120. Never change the ladder from the research: it is context
   for the user's choice in F3 and F4, saved as `context` only.

**F3. Aspire's rates or your own.** Show the ladder (**Showing the rates**) with a worked
example on the picked platforms, then ask "Use Aspire's recommended rates for {brand}?"
Options, each with the ladder in its `preview`:

1. "Use Aspire's recommended rates (Recommended)": open $40, target $80, max $120.
2. "Adjust them": goes to F4.

The free text field takes changes directly ("target $90", "10% lower"). Treat it as the first
F4 answer.

**F4. Adjust.** "How should {brand}'s rates differ from Aspire's?" Options:

1. "Set open, target and max": the free text gives the values, "$50 / $80 / $110".
2. "Scale the whole ladder": the free text gives the change, "−15%" or "20% higher".
3. "Narrow the range": open and max move halfway toward target.
4. "Done adjusting".

Round every CPM to a whole dollar. Apply the change, re-show the ladder with what changed
marked, and ask again, until "Done adjusting" or three rounds. Keep open ≤ target ≤ max; when
an edit breaks that, say which rate moved to keep the order.

**F5. Preview and save.** Show the final ladder once more with the worked example. Then ask:
"Save these rates for {brand}? Every creator fee the team and scheduled runs show (profiles,
briefs, shortlists, outreach) will use them." Options: "Save the rates (Recommended)",
"Change something". "Change something" returns to F4, or to F1 when the free text names a
platform.

On save, write the record with `append_calibration`, `provenance: "interview"`. A `key-exists`
response means a rate card already exists: show current vs new in one line each, then run the
`supersede_calibration` Destructive tools confirmation. After the write, say in one line that
the next fee any flow shows will use these rates, and that `/aspire:aspire fee calculator`
changes them.

Refreshing is manual: the rates change only when someone runs the fee calculator again.

### Showing the rates

A Markdown table in the reply, and the same rows in monospace in `AskUserQuestion` previews:

```text
Rate     CPM     At 250,000 bundled views
Open     $40     $10,000
Target   $80     $20,000
Max      $120    $30,000
Platforms: YouTube videos, Instagram Reels, TikTok videos
```

The worked example uses 250,000 bundled views, labeled as an example, never a real creator's.

## Applying the rates (every flow)

Every flow that shows a creator fee already reads all calibrations. Take `fees:rate-card` from
that read, apply **How a fee is calculated**, and label the fees. Agents never ask about the
calculator and never offer to set it up. Unattended runs apply a saved rate card the same way,
and the Aspire ladder without one.

| Flow | What it prices | Shows |
| ---- | -------------- | ----- |
| Creator profile page (`creator-profile.md`) | A bundle of one post on each of the creator's channels in the brand's platforms | Open, target, max; each channel's median views in the note, and a single-channel target for the primary channel |
| Creator brief (`creator-brief.md`) | The deliverables the brief assigns the creator, as one bundle | Target in the creator row, open to max in the rationale, scenario totals at target |
| Discovery shortlist (`creator-discovery.md`) | A bundle on the campaign's platforms, or the creator's primary channel when the campaign names none | "Est. fee {open} to {max}, target {target}" in the card's details |
| Draft Outreach (SKILL.md, **Creator card actions**) | The campaign's platforms, or the channel the card shows | The open fee only, never target or max; else `[fee]` |

Any flow added later that shows a creator fee uses this section too.
