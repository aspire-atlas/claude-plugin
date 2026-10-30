# Ad reuse reference (hooks and cut lists)

Shared by the `atlas-ad-reuse` agent and by `atlas-content-review`'s
optional **Ad reuse** check. Serves the `performance` and `creative` lenses
(`recipient-lens.md`): Performance decides what to license and put spend behind; Creative
needs exactly which moments to cut, at what length, for which placement.

## Candidate pool (ad reuse agent)

- **Window:** the one the user named ("last month"), default the last 30 days.
- **Sources**, per the `reuse_scope` input:
  - `own`: the brand's linked handles.
  - `creators`: posts by other accounts that mention or tag the brand's handles, or carry a
    tracked hashtag (`list_hashtag_posts`), excluding the brand's own handles and every
    `competitor`. Posts with the partnership marker the census exposes rank first, because
    usage rights are likelier to be negotiable.
  - `both` (default).
- **Formats:** video only (Reels, TikTok videos). Carousels and images are left out with a
  one-line note: they carry no hook timing.
- **Prefilter:** rank the pool by the lead reuse signal and take the top 12 into frame work.
  The signal follows the retention level order in **Hook score**, **Retention levels**:
  measured retention on the post when held, then the author's creator average, then views per
  follower against the author's own median (saves plus shares per view when views are
  missing). Rank within a level by its percentile in the pool, and rank level 1 ahead of level
  2 ahead of level 3 at the same percentile. Name how many were considered and how many had
  measured data.
- Read only what Atlas holds. Never call `lookup_posts`, `lookup_creators`, or any discovery
  tool for this mode.

## What to read per candidate

Project `postedAt`, `text`, `url`, `author.username`, `author.followersCount`, the metrics,
`mediaKind`, `media` (container), `instagram.mediaProductType`, the partnership marker, and
`analysis.transcript`, `analysis.overlayText`, `analysis.brandSafety` when the census lists
them. Duration comes from the census when it exposes one; otherwise from the downloaded file.

Also project the retention fields below, each only when the census lists it. This list is what
to look for, not a licence to skip the census.

| Network | Fields |
| ------- | ------ |
| Instagram, per post | `instagram.organicIgReelsAvgWatchTime`, `instagram.organicIgReelsVideoViewTotalTime`, `instagram.organicViewCount`, `instagram.totalViewCount`, `instagram.organicSaveCount`, `instagram.organicShareCount` |
| TikTok, per post | `tiktok.videoCompletionRate`, `tiktok.sixSecondViewRate`, `tiktok.twoSecondViewRate`, `tiktok.averageViewTimeSeconds`, `tiktok.viewRetentionRates`, `tiktok.cumulativePlayTimeSeconds` |
| YouTube, per post | `youtube.totalYoutubeAvgViewPercentage`, `youtube.totalYoutubeAvgViewDurationSecs` |
| Instagram, per author | `instagram.account` (container): `reelsHookRate`, `reelsInteractionRate`, `totalViews`, `accountInteractions`, `creatorMarketplaceReach`. On `search_creators` the same figures sit under `instagram.*` |

How to read them:

- **Instagram watch time** comes from the account owner's insights, so it is held for the
  brand's own Reels and rarely for creator posts. Meta reports it in milliseconds. Confirm the
  unit from the values before dividing: a value more than 100 times the video's length in
  seconds is in milliseconds. Reels loop, so the average can pass the video's length; cap the
  ratio at 100 percent.
- **Organic or total views.** Use organic counts for the brand's own Reels. Use total counts
  for creator posts where organic is not held, and say which one the number is. Never add
  paid to organic.
- **Rates.** A rate at or below 1 is a fraction: multiply by 100. A rate of 0 counts as
  missing.
- **Creator figures** come from the Instagram creator marketplace, so they are held only for
  creators Atlas has seen there. They describe the creator's Reels on average, never this post.

Frames follow `content-review.md`, **Media**: the same extractor order and working folder.
Sample the opening densely (0, 0.5, 1, 1.5, 2, 2.5 and 3 seconds), then every 3 seconds. For each
recommended cut, also extract a frame at every storyboard beat's timecode (**Page**, item 7),
measured from the cut's in point.
View every frame extracted. With the cover only, score the hook components "Can't check" and
say so; never infer the opening from a cover.

## Hook score (out of 100)

**Verdict bands.** 70 and up: **run**. 50 to 69: **cut first** (it works only as a cut of its
strongest segment). Under 50: **leave**. One override: a `red_line` hit or a competitor in frame
makes it **leave** at any score, with the reason. The page's method shows these bands as they are
here.

Every component names its evidence: a quoted transcript line with its timestamp, a frame with
its timestamp, or a field and its value. A component with no data scores zero and is listed
as missing.

| Component | Weight | Full marks when |
| --------- | ------ | --------------- |
| Hook by 3 seconds | 30 | A claim, a question, a result, or a visual pattern break is on screen or spoken by 3.0s. Measured early rates adjust the score (**Hook evidence**) |
| Brand or product by 3 seconds | 15 | The product, the logo, or the brand name is visible or spoken by 3.0s |
| Works without sound | 15 | On-screen text or captions carry the point; `analysis.overlayText` or frames show it |
| Retention | 20 | Scored from the first level in **Retention levels** that has data |
| Standalone segment | 10 | A self-contained 6 to 15 second stretch that makes sense without the rest |
| Ready for paid | 10 | Disclosure present where paid, no competitor in frame, no `red_line` hit, no third-party music flagged in the caption |

### Retention levels

Score Retention from the first level that has data for the candidate, in this order. Never
mix levels inside one candidate's score. Label the level on the card and in the finding.

| Level | Source | Label | `retentionSource` |
| ----- | ------ | ----- | ----------------- |
| 1 | Measured on this post | "Measured" | `measured` |
| 2 | The author's creator average from Meta | "Creator average, not this post" | `creator-average` |
| 3 | Engagement proxy | "Proxy" | `proxy` |

Thresholds are starting points. Tune them here, not in the prose.

| Level | Network | Value | Full marks at | Below that |
| ----- | ------- | ----- | ------------- | ---------- |
| 1 | Instagram | Average watch time divided by duration | 50% or more | Linear: 20 × value ÷ 50% |
| 1 | TikTok | `videoCompletionRate` | 30% or more | Linear: 20 × value ÷ 30% |
| 1 | TikTok, no completion rate | `sixSecondViewRate` | 60% or more | Linear: 20 × value ÷ 60% |
| 1 | YouTube | `totalYoutubeAvgViewPercentage` | 50% or more | Linear: 20 × value ÷ 50% |
| 2 | Instagram | The author's `reelsHookRate` | The pool's top quartile of held values | Linear: 20 × value ÷ the top quartile's lower bound |
| 3 | Any | Views per follower against the author's own median | 1.5x the median or more | Linear: 20 × ratio ÷ 1.5 |
| 3 | Any, no views | Saves plus shares per view | The author's top quartile | Linear: 20 × value ÷ the top quartile's lower bound |

Rules:

- Duration for level 1 comes from the census when it exposes one, otherwise from the
  downloaded file. With neither, Instagram level 1 has no data: fall to level 2.
- A level 2 quartile needs held values for 4 or more authors in the pool. With fewer, level 2
  has no data: fall to level 3, and say so.
- With no data at any level, Retention scores zero and is listed as missing.
- The finding states the value and its field in plain words, for example "average watch time
  9.1s of an 18s Reel (51%)" or "creator hook rate 38%, not this post".

### Hook evidence

"Hook by 3 seconds" is scored on the frames and the transcript. Frames decide the hook pattern
tag. When a measured early rate is held, the number decides the score:

| Rate held | Cited as |
| --------- | -------- |
| TikTok `twoSecondViewRate` | "{n} percent still watching at 2 seconds (measured)" |
| TikTok `sixSecondViewRate` | "{n} percent still watching at 6 seconds (measured)" |
| The author's `reelsHookRate` | "{n} percent watched past 3 seconds, creator average, not this post" |

Use the first rate held, in that order. Cite it beside the opening frame. Compare it with the
same rate across the pool (4 or more held values, as above):

- **Top quartile:** confirms full marks, even when the frames read as weaker.
- **Bottom quartile:** caps the component at 15 of 30, even when the frames look strong. State
  the reason: "Strong opening on screen, but only {n} percent still watching at 2 seconds."
- **Between:** the frame reading stands.

With fewer than 4 held values, cite the rate and let the frame reading stand.

**Hook patterns.** Tag each candidate with one: question, bold claim, result first, demo
first, before and after, POV or relatable moment, comparison or reaction, list or number,
face-to-camera statement. Report each pattern's median hook score and median retention score
when it has 3 or more candidates, with the level mix (for example "3 measured, 2 proxy");
fewer is "not measurable yet".

## Cut list

One row per recommended cut, at most three cuts per candidate:

| Field | Rule |
| ----- | ---- |
| Post | Permalink, author handle, posted date |
| Pattern | From the list above |
| In and out | Timestamps from transcript timing when present; from frames otherwise, marked "±1.5s" |
| Moment | One line naming what happens, in plain words; never write new ad copy when a `red_line` blocks AI-written copy |
| Lengths | The cut lengths the segment supports: 6s bumper, 15s, 30s |
| Placements and specs | 9:16 at 1080x1920 for Reels, Stories and TikTok; 4:5 at 1080x1350 for feed; 1:1 at 1080x1080 where the framing allows. Note when key text sits outside the safe zone |
| Sound | Original audio, voiceover, or music; "music rights unknown" when music is present |
| Rights | From a saved record (below, **Rights sources**); otherwise "Not held in Atlas: confirm usage rights before paid use" |

Brand-owned posts show rights "Brand-owned". Creator posts never show rights as cleared
unless a saved record says so.

**Rights sources**, each read with `search_insights` on its prefix, newest first, paged to the
end, newest finding per identity:

- `creator-brief-{profile}`: a deliverable for that creator that requested rights.
- `program-{profile}-`: the post's `rights` finding (`status` granted, with `usage`, `channels`
  and `expiresAt`), and the creator's agreed `terms` (`usage`, `usageDays`, `usageChannels`,
  `whitelisting`) for a post matched to their deal (`program.md`, **Working state**).
- `cas-campaign-{profile}-`: the creator's `roster` finding with `rate` agreed, its `usage` and
  `adPermissions` (`cas-campaign.md`, **Working state**). Usage counts only for the clips made
  for that campaign; ad permissions "pending" is not cleared.

Show which record the rights came from and the end date when it has one. A grant past its end
date shows as expired.

## Output for each lens

- **Performance** (primary): ranked licensing candidates by hook score, the pattern table,
  and one line per candidate on why it should convert as paid. Then the cut list.
- **Creative** (primary): the storyboards and the cut list first, right after the next steps,
  grouped by post, with frame thumbnails at the in and out points; the ranking follows.
- Both lenses are one hand-off (Performance picks, Creative cuts), so the page always carries
  both sections; the primary lens decides the order.

## Page (ad reuse agent)

The page answers question **P1**, "Which creator posts should we run as ads, and how do we cut
them?", and must match the evidence of its approved example (`skills/page-standard/examples.md`,
P1). Build it from the page blocks (`skills/page-standard/blocks.md`); the block numbers below are
that file's.

Title "<Brand> Ad Reuse: {window}", republished to the same path for the same brand. One page per
brand: a run over two brands publishes two pages. Sections, in this order for the `performance`
lens (**Output for each lens** sets the order for `creative`):

1. **Header** (3.1, 3.2): the "Prepared for" chip, the animated mark at the top right, the brand,
   the window, and the posts considered per platform with the count that had measured data.
2. **Answer** (3.3): the decision, written last ("12 posts scored. Run 4 as ads, starting with
   @handle's demo."), and a one-line takeaway naming the top pattern.
3. **Decisions** (3.5): what needs approval before any spend, each with its date when the test
   plan sets one: licensing each candidate whose rights are not held, the test budget, and access
   to the ad account or the raw files. With none, "Nothing needs approval."
4. **Next steps** (3.6): up to four recommendations, ranked, each with who does it (performance or
   creative), by when, and what it should change.
5. **What the scores show** (3.4): up to three insights, each with its comparison and a "So:"
   line. The headline insight's chart is seconds to the first product appearance by candidate;
   the pattern table, whose "Retention" column gives the median retention score and the level
   mix per pattern ("3 measured, 2 proxy"), is the second visual.
6. **Every post scored** (3.16): one row per candidate considered for frame work, ranked by hook
   score: thumbnail, handle, source (brand or creator), date, length, the score bar with the
   retention label as a small chip ("Measured", "Creator average, not this post" or "Proxy"),
   the verdict (run, cut first, or leave), and a one-line note. The recommended candidates keep
   their card: media, the first-3-seconds frame strip with any measured early rate cited beside
   the opening frame, and the metric row.
7. **Cut structure and storyboards** (3.9): the five beats every cut shares (hook 0 to 3s,
   brand 3 to 6s, build 6 to 9s, reveal 9 to 12s, then the end card, per the page standard) and
   the specs from **Cut list**. On a 15-second cut the end card runs 12 to 15s. Then one storyboard per recommended ad: the badge (its rank),
   the hook line, handle, date, pattern, cut length, and the tests it runs in; a still for every
   beat, taken from the frames read at that beat's timecode, or an insert tile naming what to add
   when the post has no usable frame there; the timecodes, a one-line description per beat, the
   duration strip, and edit notes. A 6-second bumper has two beats: the hook 0 to 3s, then
   the brand with the end card 3 to 6s. A 30-second cut lengthens the build to 6 to 24s, with the
   reveal 24 to 27s and the end card 27 to 30s. The duration strip always adds up to the cut length. Timecodes from frames carry "±1.5s" and every timecode
   stays a draft until a 1-second frame scan confirms it (`quality-review.md`, 4.15).
8. **Cut list** table, one row per cut (**Cut list**).
9. **Test plan** (3.15): one test per variable (hook pattern, opening line, cut length, or
   placement), each with the ads in it, the metric it is judged on, the hypothesis, and its
   Scale, Fix, and Stop rules. A rule's threshold comes from the brand's saved targets or the
   account's own results; with neither, the rule names the metric and says the threshold is set
   from the first test week. Then the test weeks as a timeline (3.17).
10. **Rights** (3.10): one row per recommended candidate with its source and expiry, from
    **Rights sources**.
11. **How it was scored** (3.11): the six components with their weights, what full marks and
    zero mean for each, the retention levels and thresholds, the hook evidence rule, the verdict
    bands and the override (**Hook score**, **Verdict bands**), then the platform counts again. The ratings
    matrix (every candidate by component) sits in a `details`.
12. **What's missing** (3.12): paid results ("Paid results need a connected Meta ad account: they
    would show which of these cuts already ran and what they cost"), boosted views where organic
    is not held, and candidates scored on cover frames only.
13. **Atlas can draft next** (3.13): the brief for the next creator round, built from the
    patterns that led, and the rights requests for candidates without them.
14. **Footer** with sources and "numbers come from Atlas as of {timestamp}", then the
    artifact-standard footnote.

Labels on the page are plain words only, never a field name. The mark and the footnote follow
[artifact-standard.md](artifact-standard.md).

When `reuse_scope` includes `creators`, what's missing adds one line: "Creator posts rarely
carry measured watch time, because it comes from the account owner's insights. Most creator
candidates score retention on the creator average or the proxy." Images follow `creator-card.md`, **Images**, page profile;
frames follow `content-review.md`, **The page**, page mechanics. Load `artifact-design` and
`dataviz` first, and apply `theme:brand` per `theme.md`, **Applying the theme**.

## Findings (ad reuse agent)

Written only when the main thread's launch says the user chose to save the candidates. On
"Page only", publish the page, write nothing, and say so in the closing line.

`append_insights`, `runKey` `ad-reuse-{profile}-{YYYY-MM-DD}`, role `account_review`,
`schema` = network, `entityKind` `post`, `entityId` = the network's own media id. Kinds:
`went_well` per hook pattern that leads (3 max), `action_item` per licensing candidate with
`priority` `high` for the top three and `medium` after (6 max). `detail` carries
`hookScore`, the component breakdown, `pattern`, `cuts[]`, `rights`, `recipient`, and
`evidence[]`. It also carries, on every finding:

- `retentionSource`: `measured`, `creator-average`, or `proxy`, per **Retention levels**. A
  `went_well` pattern finding carries the level mix instead, as `retentionSources`
  (`{ "measured": 3, "proxy": 2 }`).
- `retentionValue`: the value and what it is, in plain words ("average watch time 51% of the
  Reel"), or `null` when Retention is missing.
- `hookEvidence[]`: one entry per measured rate cited for "Hook by 3 seconds", with the rate,
  what it measures in plain words, its level, and its effect (`confirmed`, `capped`, or
  `none`).

`idempotencyKey` per finding.

## Ad reuse check (content review)

When the review's lens is `performance` or `creative`, or the user asks whether the post can
run as an ad, content review adds a fourth dimension, **Ad reuse**, for the one post under
review: the hook score, the pattern, and the cut list above. It is advice only and never
changes the verdict. A draft is scored the same way from its local media.

One post has no pool. Retention still uses the level order, with two changes: level 2 has no
quartile to score against, so the creator average is shown beside the score and Retention is
scored on level 3; and **Hook evidence** cites any measured rate without confirming or capping.
A draft has no views or watch time yet, so its Retention is listed as missing.

## Partnership content (main thread)

The **Partnership content** section of SKILL.md (creator posts the brand can run as Meta
partnership ads) has no agent and no reference of its own; these are its steps. Inputs, output,
the empty reasons, ad code rules, and the boost call are in `atlas-tools.md`, **Partnership
content**.

1. **Profile.** Use the brand's profile from Phase 2 + 3 and pass `asProfileId` explicitly on
   every call. A defaulted scope hides the ad code, and the `search_posts` overlay and filter
   refuse it.
2. **Read.** Call `search_partnership_content` with the user's filters (creator handles, dates,
   `adEligibility` `AD_READY`, `isRecommended`, `hasAdCode`, or a pasted `adCode`). Use
   `search_posts` with the `partnership` filter when the ask also needs what Atlas holds about the
   posts (transcripts, analysis, an `esFilter`); its hits then carry `partnershipAds`.
3. **Nothing back.** Read `empty.reason` and tell the user which link is missing (the table in
   `atlas-tools.md`). A missing Meta Business or Instagram link offers the `meta` connection
   (Phase 4.2), with the business picked under **Meta businesses**.
4. **Show it.** One line per post: the creator's `@handle`, the post link, whether it is ad
   ready and permitted in plain words, whether Meta recommends it, whether the brand has run it,
   and organic engagement (never added to paid), with "changed on {asOf}". Never show ids.
5. **Ad codes.** Give a code only to the person asking, in this conversation, and only when they
   need it to run the ad. Never put a code on a page, in a delivery, in a saved finding, or in a
   message to a creator, and never repeat a pasted one back.
6. **Run it (optional).** When the user wants to run a post, plan it with the Meta Ads
   connector's `ads_boost_ig_post`, `confirmed=false` first, using `igMediaId` and
   `brand.igUserId`, or the code. Show the plan, confirm with `AskUserQuestion` ("Create this ad,
   paused, from **@{creator}**'s post?" Options: Not yet (Recommended) / Create it paused), then
   call it with `confirmed=true`. Without the Meta Ads connector, say the post can be run from
   Meta Ads Manager.
