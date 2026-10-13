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
Sample the opening densely (0, 0.5, 1, 1.5, 2, 2.5 and 3 seconds), then every 3 seconds.
View every frame extracted. With the cover only, score the hook components "Can't check" and
say so; never infer the opening from a cover.

## Hook score (out of 100)

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
- **Creative** (primary): the cut list first, grouped by post, with frame thumbnails at the in
  and out points; the ranking follows.
- Both lenses are one hand-off (Performance picks, Creative cuts), so the page always carries
  both sections; the primary lens decides the order.

## Page (ad reuse agent)

Title "<Brand> Ad Reuse: {window}", republished to the same path for the same brand. Sections:
header with the "Prepared for" chip; headline (the top pattern and the top candidate); the
pattern table, whose "Retention" column gives the median retention score and the level mix
per pattern ("3 measured, 2 proxy"); ranked candidate cards (media, author, hook score ring
with the retention label beside it as a small chip, "Measured", "Creator average, not this
post" or "Proxy", the first-3-seconds frame strip with any measured early rate cited beside
the opening frame, metric row); the cut list table; rights and gaps; footer with sources and
"numbers come from Atlas as of {timestamp}". Labels on the page are plain words only, never a
field name.

When `reuse_scope` includes `creators`, rights and gaps adds one line: "Creator posts rarely
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
