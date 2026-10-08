# Post analysis reference

Used by the **Post analysis** section of SKILL.md and by the `atlas-post-analysis` agent. One
published Instagram or TikTok post, read in depth for a brand deciding whether to sponsor,
partner with, or reuse it: how it performed, everything a viewer sees and hears in it (brands,
people, language), how brand-safe it is, how the sponsorship is disclosed, and what it means
for the brand asking.

## Why the post analysis agent exists

Content review checks a post against a brief the brand wrote. Post analysis needs no brief: the
post can be anyone's, a creator the brand is considering, a competitor's sponsored clip, or a
show the brand might buy into. The question is not "is this on brief" but "what is in this
post, what did it do, and should we put our name next to it".

The agent never invents a timestamp, a brand, a person, or a metric. Every row on the page
comes from an Atlas field, the post's own caption, the video frames the agent viewed, the
transcript, or the audio, and the page says which.

## Inputs

| Input | From |
| ----- | ---- |
| The post | A permalink (`instagram.com/p/…`, `/reel/…`, or `tiktok.com/@handle/video/{id}`). Pasting it is the approval to fetch it. Instagram and TikTok only: for a YouTube link say in one line that post analysis covers Instagram and TikTok, and for a TikTok short link (`vm.tiktok.com`, `vt.tiktok.com`) ask for the full URL. |
| `recipient` | **Reading the ask**. Default `brand`; `performance` and `creative` when the ask is about reuse as an ad. |
| `baseline` | Q2 below: `held`, `refresh`, or `skip` |
| `save` | Q3 below: whether to save the findings |
| Brand digest | The requesting brand's `brand:summary`, `brand:business-context`, competitors, partners, red lines, and any `campaign:*-brief` records. Drop `review:`, `vetting:`, `program:`, `library:`, `creator:`, `theme:` and `fees:` keys, and a creator ad campaign's `campaign:{slug}-cas`, `-lane-*`, `-terms` and `-decision-defaults` (the theme still styles the page). |

## Questions (main thread)

Ask in one `AskUserQuestion` call, together with the **Reading the ask** confirmation, and skip
any the user already answered.

| # | Question | Options |
| - | -------- | ------- |
| Q1 | Which post? (only when no link was given) | Free text carries the link; two options for the most recent posts the user named, when there are any |
| Q2 | Compare it with the account's own recent posts? | 1) Use what Atlas holds (Recommended); 2) Refresh the account first (description: "Atlas fetches the account's recent posts. Takes a minute or two."); 3) Skip the baseline |
| Q3 | Save the findings to Atlas, so they show up in later reports and searches? | 1) Save findings (Recommended); 2) Page only |

## Fetching the post

1. `search_posts` on `url` or the network's shortcode (`instagram.shortcode`,
   `tiktok.tiktokVideoId`), projecting the containers listed below.
2. Held and analyzed within 24 hours: use it. Otherwise call `lookup_posts` once for that post
   (leave `creatorDeepAnalysis` at its default), re-call it with the same item to read a
   `fetching` result, then read it back with `search_posts`. Record the `snapshotAt` the page
   reports.
3. `search_creators` for the author (followers, posts, bio, verification). With Q2 "Refresh",
   `lookup_creators` for that one author only.

Project the `media`, `author`, `analysis`, and network containers (`instagram` or `tiktok`),
never leaf URLs alone. The fields this flow reads, as the live census names them (call
`list_post_search_fields` first and use only paths it returns):

| Area | Fields |
| ---- | ------ |
| Totals | `viewCount`, `likeCount`, `commentCount`, `shareCount`, `saveCount`; Instagram `instagram.total*` |
| Organic vs. paid | Instagram `instagram.organicLikeCount`, `organicCommentCount`, `organicRepostCount`, `organicViewCount`, `organicReach`, `organicSaveCount`, `organicShareCount`, `organicIgReelsAvgWatchTime`; TikTok `tiktok.organic*` and `tiktok.paid*` |
| Content scores | `analysis.productionAnalysis.*`, `analysis.emotionalAnalysis.*`, `analysis.commercialAnalysis.promotionalIntent` |
| Brands named by Atlas | `analysis.commercialAnalysis.featuredBrands`, `featuredProducts`, `callToActions`, `promoCodes` |
| Words | `analysis.transcript`, `analysis.overlayText`, `analysis.narration` (context only), the caption, `instagram.hashtags`, `instagram.mentions.*` |
| Safety | `analysis.brandSafety.*` (12 categories) |
| Comments | `analysis.commentSentiment*` |
| Audio | `instagram.mediaAudioType`, `analysis.productionAnalysis.audioStyle` |
| Partnership signals | `instagram.account.pastBrandPartnershipPartners`, `hasBrandPartnershipExperience` |

A field with no value is a data gap, never a zero.

## Video: frames, shots, and audio

Follow `content-review.md`, **Media: what the agent can and cannot see**, for getting the video
and the frame extractor (ffmpeg, then AVFoundation, then OpenCV; never install one), with these
changes for a full pass:

- **Sampling.** One frame every second for the whole clip, capped at 180 frames (longer clips
  widen the step to duration ÷ 180). Then half-second frames around every change found.
- **Shot changes.** With ffmpeg, use its scene filter; with OpenCV, compare consecutive frames'
  grey histograms. List the cuts with their times; they bound the brand and people ranges.
- **Contact sheets.** Tile the frames into sheets of 20 with their timestamps (ffmpeg's tile
  filter, or Pillow when it imports) and view every sheet. With neither, view the frames one
  by one. A brand or person is placed only from frames the agent viewed.
- **Audio (ffmpeg only).** Read the audio track and scan it for censoring tones (a steady
  tone near 1 kHz) to time bleeps to the tenth of a second. Without ffmpeg, time each censored
  word from the transcript and the on-screen captions, and say the times are accurate to about
  a second.

Keep every downloaded file and frame in the run's own working folder.

## The page

Sections in this order. Each section with no data behind it is left out, and its absence is
listed under **Data gaps**. Sections marked (custom) are the ones a generic report would not
have; never drop them when the data exists.

1. **Header.** Eyebrow: "Post analysis · {network} {format} · Indexed by Atlas {date}". Title: a
   short name for the post. One paragraph: who is in it, what happens, when it was posted (day
   of week checked against the calendar, in the account's time zone when known).
2. **Post card.** The cover or a frame, the author with avatar, followers and posts, format
   and topic chips (including a sponsor lockup chip when one is on screen), the caption, the
   published time, the people on screen, the language, and a link to the post.
3. **KPI strip.** Views (and % of followers), likes (organic beside total), comments (organic
   beside total), reposts or shares, interactions per view.
4. **Executive summary.** A lead sentence that answers the brand's question, then four or five
   numbered findings, each with a number and why it matters.
5. **Organic vs. boosted engagement.** A stacked bar per metric from the organic and total
   counts: the boost lift is total minus organic. Say who paid for the boost only when a record
   says so; Atlas does not.
6. **Content breakdown.** Structure by time range (hook, body, turn, close), the Atlas content
   scores table (production, energy, authenticity, promotional intent) with a one-line read
   each, and the primary emotion and tone.
7. **Brands in the video (custom).** Every brand or mark seen or heard, grouped: paid sponsor,
   wardrobe, show and founder brands, league and team marks, background or unidentified.
   - A timeline chart: one lane per brand across the clip's length, bars for each on-screen
     stretch, hover or focus for the range.
   - One card per brand: a frame still at a stated time, the group pill, total seconds on
     screen and the number of stretches, the ranges, and a one-line read (where it sits, how
     legible it is, whether it is paid or disclosed).
   - Seconds on screen and seconds legible are different: say so when a mark is on screen but
     too small to read.
   - A "not counted" line for marks seen but not identifiable, and for items deliberately left
     out.
   - Cross-check against `featuredBrands`. A brand Atlas lists that no frame shows, or one the
     frames show that Atlas missed, is named.
8. **Brand safety (custom breakouts).**
   - Overall read: a verdict in a few words (Suitable / Suitable with conditions / Not
     suitable as posted), the 12-category rollup bar, and one sentence on why.
   - Stat tiles: spoken expletives, on-screen expletives, in the caption, first occurrence.
   - The 12-category table: Atlas's risk level per category with the evidence from the
     transcript, the on-screen text, and the frames. Where the agent's own read differs from
     Atlas's, show both.
   - **Where the profanity sits:** a timeline over the clip with each instance marked, the
     sponsor lockup's span drawn under it when there is one, and the cleanest trim (the last
     clean line and its time, and what the trim loses).
   - **Instance log:** number, the line as censored, speaker, on screen or not, time. Say how
     speakers were identified (caption colour, framing, the transcript), and count an
     asterisked or bleeped word as profanity. A cut-off word that is neither bleeped nor
     spoken in full is listed but not counted.
   - What lowers the risk and what raises it, as two short lists.
   - **Fit by advertiser risk tolerance:** three tiers (conservative, standard, permissive),
     each with the verticals it suits and whether to use the post as posted or trimmed. Label
     it "Aspire read based on the scores and evidence above. Not an Atlas score."
   - Apply the brand's own `red_line` records as their own rows when they bear on the post.
9. **Sponsor disclosure.** Whether the sponsor is named in the caption, hashtags, or
   mentions; whether a disclosure word (#ad, "sponsored", "paid partnership") appears; how
   often the account names sponsors in its other held posts. Instagram's "Paid partnership"
   label is not held in Atlas: list it as a gap, never as absent.
10. **Comment sentiment.** When `analysis.commentSentiment*` is filled: the label, the
    positive / neutral / negative split, the themes, and the summary. When it is empty, say
    so under gaps.
11. **People and reuse rights.** Everyone on screen with their role and total seconds, from
    the frames and the shot list, plus names that appear only as graphics. Then what any reuse
    cut would need: likeness, trademarks on screen, league or team marks, and the audio
    (`mediaAudioType` original or licensed, or "unconfirmed"). This is a checklist for the
    brand's legal team, not legal advice.
12. **Account baseline.** With Q2 not "Skip": a scatter of the account's held posts (views
    against interaction rate), this post marked, its rank on views, interaction rate, and
    comments per 1,000 likes, and the account medians. Warn when the held posts are far from
    the post's own date.
13. **Performance read.** A rates table, each rate with the counts it is computed from:
    views per follower, like rate, comment rate, repost or share rate, interaction rate on
    views and on followers, boost share of likes and comments.
14. **What this means for {brand}.** Three to five takeaways for the requesting brand, from
    its brand memory: what to copy, what to avoid, how it bears on a saved campaign. End with
    "Not a benchmark for {brand}" when the account is a different size or category; compare it
    only with its own peers.
15. **Data gaps.** Everything the page could not show, and why.
16. **Footer.** The snapshot time, which fields came from Atlas, how rates were computed, how
    brand and profanity timestamps were derived (frames, transcript, audio), and that images
    are a snapshot.

Order for a lens: `brand` keeps the order above. `performance` and `creative` move sections 6,
11, and 13 up after the executive summary and add the ad reuse check from `ad-reuse.md`,
**Ad reuse check (content review)**: the hook score, the hook pattern, and the cut list. It is
advice only and never changes the safety verdict.

Load `artifact-design`, and `dataviz` for the charts, before building. Embed every image with
the snippet in `creator-card.md`, **Images**, page profile; frames the agent extracted are
encoded the same way from the local files. Apply `theme:brand` per `theme.md`. Keep the page
under 10MB: cut frame stills for background marks before lowering quality. Title:
"Post Analysis: {short name}".

## State written to Atlas

Only with Q3 "Save findings". `append_insights`, `runKey`
`post-analysis-{profile}-{shortcode or video id}-{YYYY-MM-DD}`, role `account_review`,
`schema` = network, `entityKind` = post, `entityId` = the post's `externalId`. Kinds:
`went_well` for what worked, `needs_improvement` for each risk (profanity, missing disclosure,
an unclear sponsor), `action_item` with `priority` for each recommendation (trim, disclosure
ask, rights to clear). `detail` carries `findingType` (`performance`, `brand`, `safety`,
`disclosure`, `rights`, `recommendation`), the evidence (timestamps, counts, the fields used),
and `recipient`. One `idempotencyKey` per finding.

**Reading it back**: `search_insights` with a `prefix` filter on `detail.account_review.runKey` =
`post-analysis-{profile}-{shortcode or video id}`, newest first; the newest run's findings are
the earlier analysis of this post. A bare `runKey` filter is rejected as unmapped.

## Rules

- **Never fabricate.** No timestamp without a frame, a transcript line, or an audio reading
  behind it. No brand without a frame or an Atlas field. No speaker without the evidence that
  identified them.
- **Never identify a person from their face alone.** Name someone only when the caption, the
  on-screen text, the transcript, a graphic, or the account itself names them.
- **Corrections are shown.** When this run disagrees with an earlier analysis of the same
  post (a count, a time, a claim), show the old and new values and why.
- **Who paid is unknown** unless a record says so. A boost is measured; its funder is not.
- **One post at a time.** Never fetch other posts by the author beyond Q2's "Refresh", and
  never start discovery.
- **Interactive only.** Never schedule it; it needs a person to supply the post.
