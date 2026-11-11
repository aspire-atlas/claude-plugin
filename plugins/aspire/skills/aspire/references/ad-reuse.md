# Ad reuse reference (hooks and cut lists)

Shared by the `atlas-ad-reuse` agent and by `atlas-content-review`'s
optional **Ad reuse** check. Serves the `performance` and `creative` lenses
(**Recipient lens**): Performance decides what to license and put spend behind; Creative
needs exactly which moments to cut, at what length, for which placement.

The main thread's part of this flow, moved from `SKILL.md` (only pointers changed). A bold section name
in it (**Readouts**, **Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Ad reuse (hooks and cut lists)](#ad-reuse-hooks-and-cut-lists)
- [Partnership content (creator posts the brand can run as partnership ads)](#partnership-content-creator-posts-the-brand-can-run-as-partnership-ads)
- [Candidate pool (ad reuse agent)](#candidate-pool-ad-reuse-agent)
- [What to read per candidate](#what-to-read-per-candidate)
- [Hook score (out of 100)](#hook-score-out-of-100)
- [Cut list](#cut-list)
- [Output for each lens](#output-for-each-lens)
- [Page (ad reuse agent)](#page-ad-reuse-agent)
- [Findings (ad reuse agent)](#findings-ad-reuse-agent)
- [Account map record](#account-map-record)
- [Ad reuse check (content review)](#ad-reuse-check-content-review)
- [Partnership content (main thread)](#partnership-content-main-thread)

## Ad reuse (hooks and cut lists)

Trigger when the user asks for the best hooks, which creator content to reuse or license as
ads, or clips and a cut list for editors ("pull the best hooks from last month's creator
posts", "send creative the good stuff to cut down"). Requires a brand profile with a linked
channel. Serves the `performance` and `creative` lenses, which hand off to each other, so
both are passed by default. Detail lives in this file. For one post, use
**Content review**, whose ad reuse check covers the same ground.

1. Ask once with `AskUserQuestion`, skipping what the user already said, in the same call as
   the **Reading the ask** confirmation: the window (last 30 days (Recommended), last 90 days,
   or typed), and the sources ("The brand's and creators' posts (Recommended)", "Only our own
   posts", "Only creators' posts about us"). Add the write confirmation as the last question:
   "Save the ranked candidates to Atlas?" (Save (Recommended) / Page only).
2. Launch `atlas-ad-reuse` with the tool prefix, `profile_id`, `profile_slug`,
   the linked handles and networks, `reuse_scope`, the window, any placements named,
   `recipient`, a digest of the brand's calibrations (competitors, red lines, partners, and the
   `ad-reuse:account-map` record when saved), and whether the user approved the write. It reads
   only what Atlas holds, and returns the found and briefed paths as two lists.
   When its result packet carries an `approve-account-map` proposal (it returns one only when the
   user chose Save in step 1; never ask it after Page only), ask once with
   `AskUserQuestion` whether to save it (Save the account map (Recommended) / Not now). On yes,
   write it per this file, **Account map record**: `append_calibration` when none
   is saved, or `supersede_calibration` with the saved record's `ifVersion` to add new accounts.
3. Relay the page link, the top patterns, the top candidates by name in text per **Visual
   output** (the posts are drawn only when the user asks to see them), and the rights line. Say plainly that usage rights for creator posts are not held
   in Atlas unless a brief or record says otherwise. When the user asks to see the ads a
   candidate has already run, read `search_ads` with `groupBy` ad and the candidate's
   `igMediaIds`, then call `show_ads` with up to 12 of those rows' `ad.adId` and the same dates;
   it shows the host's ads card (absent on an older server: give the rows as text).

## Partnership content (creator posts the brand can run as partnership ads)

Trigger when the user asks which creator posts the brand can run as partnership ads, which posts
Meta recommends, whether a creator gave permission, what is ad ready, or pastes a partnership ad
code to find its post ("what can we boost from creators", "which tagged posts can we run as
ads"). It runs in the main thread with no agent: a read of `search_partnership_content` (and
`search_posts` with `partnership`) on the brand's profile, plus an optional boost. Before step 1,
read this file (**Partnership content (main thread)**) and **Atlas tools**
(**Partnership content**) and follow them. Pass `asProfileId` explicitly, never show ids, and
never put an ad code on a page, delivery, finding, or creator message. The boost question is the
write confirmation, asked exactly as worded; unattended runs never boost. The boost goes through
the Meta Ads connector, so it also follows **Meta Ads**.

## Candidate pool (ad reuse agent)

- **Window:** the one the user named ("last month"), default the last 30 days.
- **Sources**, per the `reuse_scope` input:
  - `own`: the brand's linked handles.
  - `creators`: posts by other accounts that mention or tag the brand's handles, or carry a
    tracked hashtag (`list_hashtag_posts`), excluding the brand's own handles. The partnership
    marker the census exposes is read for the path (**Two paths**), never as a rank boost.
  - **Who posted (account map).** Before ranking, sort the authors into creators and the rest:
    the brand's own and regional accounts (excluded), retailers and resellers, deal and news
    pages, team or sponsorship accounts (a sports team, league, event or venue account posting
    the brand as its sponsor), and accounts posting another brand's sponsored content. Keep only creators unless the
    person asked otherwise, and name how many of each were set aside. When an
    `ad-reuse:account-map` record is saved (**Account map record**), follow its labels and sort
    only the authors it doesn't list.
  - **Competitors on screen.** Judge a post that also shows a `competitor` by which brand is the
    subject, never by whether one appears: count the brand's products against all products the
    post features. When a single competitor has more products than the brand, leave the post
    out as a competitor's video. When the brand has a third or more of the products, or has one
    product and at most two other products appear in all, keep it as **brand-led**, at most 2 in the prefiltered
    12. Anything else is a multi-brand look: leave it out and count it. Many looks in beauty,
    fashion and home show several brands, and leaving out every one of them empties the pool. A
    brand-led post's competitor in frame is named on its card ("brand-led, {competitor} also
    shown") and never forces **leave** (**Verdict bands**).
  - `both` (default).
- **Two paths: found or briefed.** Before ranking, label each creator post `found` (made
  unprompted) or `briefed` (the brand asked for it). Briefed means a deliverable on a program
  deal, a partnership-ads permission on the post, the brand's own partner tag (from its
  `partner` records or the program's must-include tags) on its own, or a generic partnership
  hashtag (#ad, #sponsored, #partner, #ambassador) together with a tag for this brand. The
  brand's partner tag is itself a tag for this brand. A generic partnership hashtag with no tag
  for this brand is another brand's sponsored post: set it aside and count it. When the path can't be told, use found and say "path unclear". Rank and show the
  two paths separately, never as one list. On the briefed path, product focus and the subject
  screen are shown but not weighted, because nearly every briefed post passes them; read the
  deal's usage before proposing any rights request. On the found path, the subject and
  competitor screens apply in full. Within each path, rank by the hook score. Its openings,
  sound-off and standalone components are known before any ad runs; Retention on a post already
  run as an ad never uses level 3, because its counts include paid delivery (**Retention
  levels**, **Counts that include paid delivery**). Both paths share the verdict bands, so a
  briefed post that never ran keeps level 3 like a found post. Show the post's own views and
  engagement as "organic traction", and never compare them across paths. A program deliverable
  is read from the program's findings with `search_insights`.
- **Formats:** video only (Reels, TikTok videos). Carousels and images are left out with a
  one-line note: they carry no hook timing.
- **Prefilter:** rank the pool by the lead reuse signal and take the top 12 into frame work
  (with both paths, 8 found and 4 briefed; a path with fewer passes its slots to the other).
  The signal follows the retention level order in **Hook score**, **Retention levels**:
  measured retention on the post when held, then the author's creator average, then views per
  follower against the author's own median (saves plus shares per view when views are
  missing). Rank within a level by its percentile in the pool, and rank level 1 ahead of level
  2 ahead of level 3 at the same percentile. A post already run as an ad (**Counts that include
  paid delivery**) never ranks on level 3: it ranks on level 1 or 2 when held, and otherwise after every post
  with a usable signal on its path, newest first, marked "no retention signal before paid".
  Name how many were considered, how many had measured data, and how many ranked with no
  signal.
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

Frames follow **Content review**, **Media**: the same extractor order and working folder.
Sample the opening densely (0, 0.5, 1, 1.5, 2, 2.5 and 3 seconds), then every 3 seconds. For each
recommended cut, also extract a frame at every storyboard beat's timecode (**Page**, item 7),
measured from the cut's in point.
View every frame extracted. With the cover only, score the hook components "Can't check" and
say so; never infer the opening from a cover.

## Hook score (out of 100)

**Verdict bands.** 70 and up: **run**. 50 to 69: **cut first** (it works only as a cut of its
strongest segment). Under 50: **leave**. One override: a `red_line` hit, or a competitor in
frame on a post that isn't brand-led (**Candidate pool**, **Competitors on screen**), makes it
**leave** at any score, with the reason. A brand-led post keeps its band. The page's method shows
these bands as they are here.

Every component names its evidence: a quoted transcript line with its timestamp, a frame with
its timestamp, or a field and its value. A component with no data scores zero and is listed
as missing; the page shows it as "not available: {reason}", never as 0 (**Page standard**,
section 8).

| Component | Weight | Full marks when |
| --------- | ------ | --------------- |
| Hook by 3 seconds | 30 | A claim, a question, a result, or a visual pattern break is on screen or spoken by 3.0s. Measured early rates adjust the score (**Hook evidence**) |
| Brand or product by 3 seconds | 15 | The product, the logo, or the brand name is visible or spoken by 3.0s |
| Works without sound | 15 | On-screen text or captions carry the point; `analysis.overlayText` or frames show it |
| Retention | 20 | Scored from the first level in **Retention levels** that has data |
| Standalone segment | 10 | A self-contained 6 to 15 second stretch that makes sense without the rest |
| Ready for paid | 10 | Disclosure present where paid, no competitor in frame (a brand-led post's co-featured competitor doesn't count against it), no `red_line` hit, no third-party music flagged in the caption. The brand's own partnership disclosure (its partner hashtag, a paid partnership label naming the brand) is what a partnership ad needs, so it never costs points; only another brand's disclosure does |

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
- **Counts that include paid delivery.** A post already run as an ad. A post has run as an ad when its partnership-ads usage shows the brand
  has run it (`search_partnership_content`, or `partnershipAds` on `search_posts`), or when
  `search_ads` with `groupBy` post and the post's `igMediaIds` returns a row for it (call
  `list_ad_search_fields` first; no linked ad account returns no rows, which means "not known",
  never "never ran"). These reads take only `adUsage`, `permissionStatus` and `hasAdCode`. The
  same calls return the brand's `adCode`, which works like a password: never carry it into the
  page, a finding, the visual payload, the result packet or any other output; say "has an ad
  code" where it matters. When the run status is not known (no partnership-ads data and no linked
  ad account), a briefed post keeps level 3, labelled "Proxy, may include paid delivery". For a
  post that has run as an ad, level 3 has no data: score Retention from level 1 or 2,
  and with neither, Retention is missing (zero, listed as missing). There is no other fallback.
  Label an already-run post "already run as an ad: counts include paid delivery". Never rank a
  post higher because an ad inflated its counts.
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
  `whitelisting`) for a post matched to their deal (**Influencer program**, **Working state**).
- `cas-campaign-{profile}-`: the creator's `roster` finding with `rate` agreed, its `usage` and
  `adPermissions` (**CAS campaign**, **Working state**). Usage counts only for the clips made
  for that campaign; ad permissions "pending" is not cleared.

Show which record the rights came from and the end date when it has one. A grant past its end
date shows as expired.

## Output for each lens

- **Performance** (primary): licensing candidates as two lists, found then briefed, each
  ranked by hook score; the pattern table; and one line per candidate on why it should convert
  as paid. Then the cut list.
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
6. **Every post scored** (3.16): two tables, **Found** then **Briefed**, never merged, each with
   one row per candidate on that path considered for frame work, ranked by hook score within its
   table: thumbnail, handle, source (brand or creator), date, length, organic traction, the score
   bar with the
   retention label as a small chip ("Measured", "Creator average, not this post" or "Proxy"),
   the verdict (run, cut first, or leave), and a one-line note. The recommended candidates keep
   their card: media, the first-3-seconds frame strip with any measured early rate cited beside
   the opening frame, and the metric row.
7. **Cut structure and storyboards** (3.9): the five beats every cut shares (hook 0 to 3s,
   brand 3 to 6s, build 6 to 9s, reveal 9 to 12s, then the end card, per the page standard) and
   the specs from **Cut list**. On a 15-second cut the end card runs 12 to 15s. Then one storyboard per recommended ad: the badge (its rank within its path, F1, F2, B1; recommended ads follow the agent's top
   candidates rule: up to five, at most three from a path unless the other path has fewer than
   two),
   the hook line, handle, date, pattern, cut length, and the tests it runs in; a still for every
   beat, taken from the frames read at that beat's timecode, or an insert tile naming what to add
   when the post has no usable frame there; the timecodes, a one-line description per beat, the
   duration strip, and edit notes. A 6-second bumper has two beats: the hook 0 to 3s, then
   the brand with the end card 3 to 6s. A 30-second cut lengthens the build to 6 to 24s, with the
   reveal 24 to 27s and the end card 27 to 30s. The duration strip always adds up to the cut length. Timecodes from frames carry "±1.5s" and every timecode
   stays a draft until a 1-second frame scan confirms it (**Quality review**, 4.15).
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
**Artifact standard**.

When `reuse_scope` includes `creators`, what's missing adds one line: "Creator posts rarely
carry measured watch time, because it comes from the account owner's insights. Most creator
candidates score retention on the creator average or the proxy." Images follow **Creator card**, **Images**, page profile;
frames follow **Content review**, **The page**, page mechanics. Load `artifact-design` and
`dataviz` first, and apply `theme:brand` per **Theme**, **Applying the theme**.

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

On every `action_item` only (a `went_well` pattern can span both paths, so it carries `paths`,
the count per path, `{ "found": 3, "briefed": 1 }`, instead):

- `path`: `found` or `briefed`, with `pathRule`, the rule that placed it.
- `snapshot`: the component scores and the counts the score used (views, likes, comments,
  shares, saves, followers) as they stood at this run, so a later result can be compared with
  what was known before launch rather than with counts the ad itself raised.

`idempotencyKey` per finding.

## Account map record

The account map is brand memory, saved by the main thread only after the person confirms it
(SKILL.md, **Ad reuse**, step 2). The agent never writes it; it returns a proposed map in its
result packet's `proposals` (level `write`, gate `approve-account-map`).

| Field | Value |
| ----- | ----- |
| `kind` | `guideline` |
| `key` | `ad-reuse:account-map` |
| `statement` | "Who counts as a creator for {brand}'s ad reuse: {n} accounts labelled." (under 280 characters) |
| `detail` | `{concern: "preference", appliesTo: ["ad-reuse"], accounts: [{handle, platform: instagram\|tiktok, label, evidence}], includeNonCreators: false, sourceRunKey}` |
| `provenance` | `interview`: the person confirmed it |

`label` is one of `creator`, `brand_owned`, `retailer`, `deal_page`, `team`, or
`other_brand_sponsored`. `evidence` is one plain line (the caption wording or posting mix behind
the label).

**Reading it back.** The launch digest carries it when saved; without a digest, the agent's own
`search_calibrations` read keeps the `ad-reuse:account-map` key. Follow its labels as saved and
sort only authors it doesn't list. When those new authors exist, propose only them, as an update
to the saved record; the main thread then writes the merged map with `supersede_calibration` and
the record's `ifVersion`, never a second `append_calibration`. With nothing new, propose nothing.

## Ad reuse check (content review)

When the review's lens is `performance` or `creative`, or the user asks whether the post can
run as an ad, content review adds a fourth dimension, **Ad reuse**, for the one post under
review: the hook score, the pattern, and the cut list above. It is advice only and never
changes the verdict. A draft is scored the same way from its local media.

One post has no pool. Retention still uses the level order, with two changes: level 2 has no
quartile to score against, so the creator average is shown beside the score and Retention is
scored on level 3; and **Hook evidence** cites any measured rate without confirming or capping.
A draft has no views or watch time yet, so its Retention is listed as missing.

Content review doesn't load `search_ads`, so it can't tell whether the post has run as an ad
(**Counts that include paid delivery**): it scores one post as advice and ranks nothing, so it
keeps the level 3 proxy, labelled "Proxy, may include paid delivery" whenever level 3 is used on a
published post.

## Partnership content (main thread)

The **Partnership content** section of SKILL.md (creator posts the brand can run as Meta
partnership ads) has no agent and no reference of its own; these are its steps. Inputs, output,
the empty reasons, ad code rules, and the boost call are in **Atlas tools**, **Partnership
content**.

1. **Profile.** Use the brand's profile from Phase 2 + 3 and pass `asProfileId` explicitly on
   every call. A defaulted scope hides the ad code, and the `search_posts` overlay and filter
   refuse it.
2. **Read.** Call `search_partnership_content` with the user's filters (creator handles, dates,
   `adEligibility` `AD_READY`, `isRecommended`, `hasAdCode`, or a pasted `adCode`). Use
   `search_posts` with the `partnership` filter when the ask also needs what Atlas holds about the
   posts (transcripts, analysis, an `esFilter`); its hits then carry `partnershipAds`.
3. **Nothing back.** Read `empty.reason` and tell the user which link is missing (the table in
   **Atlas tools**). A missing Meta Business or Instagram link offers the `meta` connection
   (Phase 4.2), with the business picked under **Meta businesses**.
4. **Show it.** One line per post: the creator's `@handle`, the post link, whether it is ad
   ready and permitted in plain words, whether Meta recommends it, whether the brand has run it,
   and organic engagement (never added to paid), with "changed on {asOf}". Never show ids.
   When the user asks to see the posts, call `show_partnership_content` with up to 12 of their
   `igMediaId`s and the same `asProfileId`; it shows the host's partnership content card (absent
   on an older server: the lines above are the answer).
5. **Ad codes.** Give a code only to the person asking, in this conversation, and only when they
   need it to run the ad. Never put a code on a page, in a delivery, in a saved finding, or in a
   message to a creator, and never repeat a pasted one back.
6. **Run it (optional).** When the user wants to run a post, plan it with the Meta Ads
   connector's `ads_boost_ig_post` on one of the brand's own ad accounts (**Meta Ads**,
   **Brand scope**), `confirmed=false` first, using `igMediaId` and
   `brand.igUserId`, or the code. Show the plan, confirm with `AskUserQuestion` ("Create this ad,
   paused, from **@{creator}**'s post?" Options: Not yet (Recommended) / Create it paused), then
   call it with `confirmed=true`. Without the Meta Ads connector, say the post can be run from
   Meta Ads Manager.
