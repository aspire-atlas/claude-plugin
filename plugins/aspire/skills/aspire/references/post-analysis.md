# Post analysis reference

Used by the **Post analysis** section of SKILL.md and by the `atlas-post-analysis` agent. One
published Instagram or TikTok post, read in depth for a brand deciding whether to sponsor,
partner with, or reuse it: how it performed, everything a viewer sees and hears in it (brands,
people, language), how brand-safe it is, how the sponsorship is disclosed, and what it means
for the brand asking.

The main thread's part of this flow, moved from `SKILL.md` (only pointers changed). A bold section name
in it (**Readouts**, **Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Post analysis (one published post, in depth)](#post-analysis-one-published-post-in-depth)
- [Why the post analysis agent exists](#why-the-post-analysis-agent-exists)
- [Inputs](#inputs)
- [Questions (main thread)](#questions-main-thread)
- [Fetching the post](#fetching-the-post)
- [Video: frames, shots, and audio](#video-frames-shots-and-audio)
- [The page](#the-page)
- [State written to Atlas](#state-written-to-atlas)
- [Rules](#rules)

## Post analysis (one published post, in depth)

Trigger when the user asks to analyze, break down, or explain one published post, asks what
brands or people are in a video, or asks whether a post or the account behind it is safe to
sponsor, partner with, or reuse ("analyze this post", "what brands are in this Reel", "should we
sponsor this show"). Requires a brand profile and the post's link; no brief (a brief goes to
**Content review**). Before step 1, read this file (**Inputs**, **Questions
(main thread)**) and follow it. Interactive only: never schedule it.

Ask Q1 to Q3 exactly as worded, with the **Reading the ask** confirmation. Q3 is the write
confirmation; the pasted link and Q2's "Refresh the account first" approve the fetches. Launch
`atlas-post-analysis` with the tool prefix, `profile_id`, `profile_slug`, the link, `recipient`,
`baseline`, the save answer, any earlier analysis, and the brand digest. Relay as the reference
says; offer **Content review** or **Ad reuse**.

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
| Brand digest | The requesting brand's `brand:summary`, `brand:business-context`, competitors, partners, red lines, and any `campaign:*-brief` records. Drop `review:`, `vetting:`, `program:`, `library:`, `orchestrator:`, `adreuse:`, `applicantreview:`, `lastrun:`, `creator:`, `theme:` and `fees:` keys, and a creator ad campaign's `campaign:{slug}-cas`, `-lane-*`, `-terms` and `-decision-defaults` (the theme still styles the page). |

## Questions (main thread)

Ask in one `AskUserQuestion` call, together with the **Reading the ask** confirmation, and skip
any the user already answered.

| # | Question | Options |
| - | -------- | ------- |
| Q1 | Which post? (only when no link was given) | Free text carries the link; two options for the most recent posts the user named, when there are any |
| Q2 | Compare it with the account's own recent posts? | 1) Use what Atlas holds (Recommended); 2) Refresh the account first (description: "Atlas fetches the account's recent posts. Takes a minute or two."); 3) Skip the baseline |
| Q3 | Save the findings to Atlas, so they show up in later reports and searches? | 1) Save findings (Recommended); 2) Page only |

Pasting the link is the approval to fetch that one post; Q2's "Refresh the account first" is the
approval to fetch its author. With no `AskUserQuestion` (a scheduled or headless run), say in one
line that post analysis needs a person to supply the post, and stop.

The main thread then launches `atlas-post-analysis` with the tool prefix, `profile_id`,
`profile_slug`, the link, `recipient`, `baseline`, whether the user approved saving, any earlier
analysis of the same post, and the brand digest (**Inputs**). It relays the page link, the
headline, the brands on screen, the safety read with the cleanest trim, any corrections to an
earlier analysis, and the data gaps, and offers **Content review** when the user has a brief for
the post and **Ad reuse** when they want hooks across many posts.

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
never leaf URLs alone. The fields this flow reads (call `list_post_search_fields` only for a path neither this table nor
**Atlas search** lists):

| Area | Fields |
| ---- | ------ |
| Totals | The fields of the "What landed and why" row of the required metrics (`skills/page-standard/SKILL.md`, section 8); Instagram `instagram.total*` |
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

Follow **Content review**, **Media: what the agent can and cannot see**, for getting the video
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

Title: "Post Analysis: {short name}". The page is the Verdict template, filled from data and
rendered with the fill script (`skills/page-standard/templates.md`, sections 1, 2 and 7); it writes
no HTML, and the template sets the layout. Its argument fits two screens, so the analysis below is
ranked into the fields, never drawn as extra sections. Anything with no data behind it is left
out and named in `gaps` or the chat summary. The brand's question picks the order:

- `title`: the brand's question about the post ("Is @{account}'s {format} safe to sponsor?").
  `answer`: the verdict for that question in one sentence, with the number it rests on.
  `scope.range` is the post's date, checked against the calendar in the account's time zone when
  known.
- `sections.verdict`: `call` is the brand-safety read in a few words (Suitable, Suitable with
  conditions, Not suitable as posted); `reason` is the one sentence on why; `checks` holds, in
  order: each of the 12 brand-safety categories rated above low risk (Atlas's level, with the
  agent's own read beside it where they differ), profanity (spoken, on screen, in the caption,
  first occurrence, and the cleanest trim with its time), sponsor disclosure (named in the
  caption, hashtags, or mentions; a disclosure word; Instagram's "Paid partnership" label as not
  held, never absent), each brand red line (**Atlas tools**, Calibration kinds) that bears on
  the post, and reuse rights (likeness,
  marks on screen, the audio as original, licensed, or unconfirmed: a checklist for legal, not
  legal advice). The categories rated low risk on every reading are counted in one row, and so are the red lines
  the post passes. Past twelve rows, keep the eleven highest-risk rows and count the rest by
  status in the twelfth.
- `figures`: views against followers, interactions per view against the account's median, and
  the boost lift (total minus organic, as a share of likes) when Atlas holds both counts. Say who
  paid for the boost only when a record says so.
- `insights`: the three strongest of the executive summary's findings for the brand's question,
  each with its number and the account's own baseline as the comparison. The first may chart
  organic against total per metric as stacked bars.
- `actions`: what the brand should do: sponsor, partner, reuse as posted or trimmed, or pass, each
  with its owner and cost; for the `performance` or `creative` lens, the ad reuse check from **Ad
  reuse** (the hook score and pattern in the action's `effect`, and each cut of the cut list as
  its own evidence line with its timestamps, length, placement, and rights, per `evidence` below), advice that never
  changes the safety verdict. `decisions`: the call the brand must make, in one short line ("Use
  as posted, trimmed, or pass, for {brand}'s risk tolerance"), with the fit by advertiser risk
  tolerance as three evidence lines (conservative, standard, permissive: the verticals each suits
  and whether to use it as posted or trimmed), each with the source `Our read`; the method's first
  note reads "Aspire read based on the scores and evidence above. Not an Atlas score."
- `sections.posts`: the post itself, with its metrics, the caption as `quote`, and the people on
  screen and its format in `why`.
- `evidence`, ten lines at most. The three risk-tolerance tiers come first, then, for the
  `performance` or `creative` lens, the cuts (up to three; any more are counted in the last cut's
  line). The rest are ranked for the brand's question into what is left: the brands in the video,
  one line per brand or group (paid sponsor, wardrobe, show
  and founder brands, league and team marks, background) with its seconds on screen, its ranges,
  and whether it is legible, paid, or disclosed; the marks not counted; disagreements with
  Atlas's `featuredBrands`; comment sentiment when filled; the content scores (production,
  energy, authenticity, promotional intent) and the primary emotion and tone; and the account
  baseline (this post's rank on views, interaction rate, and comments per 1,000 likes, against
  the account medians, with a warning when the held posts are far from its date). The tenth line
  counts what did not fit, and the chat summary lists it.
- `method.notes`, six at most: the Aspire read label above, how brand and profanity timestamps
  were derived (frames, transcript, audio), how speakers were identified, how rates were computed
  with the counts each uses, and "Not a benchmark for {brand}" when the account is a different
  size or category.
- `footer.notes`: the snapshot time and that images are a snapshot. `footer.source`: the source
  line per **Artifact standard**.

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
