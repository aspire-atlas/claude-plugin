# Camera screen

How much each creator on a slate talks on camera, read from the post analysis Atlas already
holds, for the team casting a creator ad campaign. `atlas-camera-screen` reads each handle's
newest analysed videos post by post and returns, per handle, the speech, to-camera and explainer
shares, how many videos it read, and a talks to camera score out of 100, or "not enough analysed
posts". Asked on its own, it publishes one page. Inside a CAS campaign (**CAS campaign**, dispatch
row 4) it saves each read on the creator's discovery finding and publishes nothing. The method,
the word lists, the score and the output live here, so the word lists can be tuned without
touching the agent. Every page it publishes follows the **Artifact standard** and the
`page-standard` skill (`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`).

## Contents

| Section | What it holds |
| ------- | ------------- |
| [The ask](#the-ask) | The question codes this flow answers, in the persona's words |
| [The reader](#the-reader) | Who reads the page, and what they decide from it |
| [Required metrics](#required-metrics) | The page standard's row for each code, and what this flow adds |
| [The data read](#the-data-read) | What the agent reads from Atlas, and in what order |
| [One read per handle](#one-read-per-handle) | The post-by-post read and the word lists |
| [Score and settings](#score-and-settings) | The score, the minimum, and where the settings come from |
| [The output](#the-output) | What each read returns |
| [In a CAS campaign](#in-a-cas-campaign) | Which creators are read, and the finding each read is saved on |
| [The storyline](#the-storyline) | The three bullets confirmed before the page is built |
| [The page](#the-page) | The page's parts, in order |
| [Saved answers](#saved-answers) | What is kept on the flow's record between runs |
| [Scheduled path](#scheduled-path) | What an unattended run does instead of asking |

## The ask

| Code | Question |
| ---- | -------- |
| I13 | Which creators on this slate talk to camera? |

Asked on its own, the main thread asks these before launching `atlas-camera-screen`, each as an
`AskUserQuestion` picker with the recommended option first:

| Id | Question | Options |
| -- | -------- | ------- |
| CS1 | Which creators should I read? | "The handles I'll paste (Recommended)" / "A creator ad campaign's pool" (then which campaign and concept) / "A discovery campaign's shortlist" (then which campaign) |
| CS2 | Which network are the handles on? Asked only when pasted handles name none. | "Instagram (Recommended)" / "TikTok" / "YouTube" / "Pinterest" |

A campaign's pool reads the newest undecided candidates of that campaign's discovery findings, by
handle. Inside a CAS campaign the main thread asks nothing of its own: row 4's Run picker covers
the read and its saves (**In a CAS campaign**).

## The reader

`team` by default: the agency team casting the campaign, who decide which creators go on to
vetting and to the client's slate. For `leadership` or `campaign` the headline leads with how many
creators score highest and who they are, and the shares move under the table.

## Required metrics

The page carries every metric in the page standard's required-metrics row
(`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`, section 8) for each code. This flow may add
metrics to a row, never drop one.

| Code | Row | Added by this flow |
| ---- | --- | ------------------ |
| I13 | Camera screen | Per creator, "newest {n} of {total} analysed videos", the count Atlas holds beside the count read |

## The data read

1. The settings (**Score and settings**): `get_brand_context` for `campaign:{slug}-cas` when a
   campaign is named; otherwise the defaults.
2. The creators: the pasted handles, or, for a campaign, `search_insights` with `prefix` on
   `detail.account_review.runKey` = `creator-discovery-{profile}-{slug}`, newest first, paged; the
   newest record per `entityId` wins (**Creator discovery**, **State written to Atlas**).
3. One `search_posts` read per handle (**One read per handle**), up to `maxPosts` videos, newest
   first.

Freshness follows page-standard's Data freshness rule
(`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`, section 9); this flow sets no age rule of
its own. The page and the result packet say the date Atlas was read, since Atlas keeps analysing
posts and a later read can move a share.

## One read per handle

Read the creator's newest analysed videos, post by post, with `search_posts`:

- Filter: `author.username` = the handle, `network` = the account's network,
  `analysis.analyzedAt` exists, `mediaKind` = `video`.
- Sort `postedAt` descending. Project only `analysis.productionAnalysis.audioStyle`,
  `analysis.productionAnalysis.cameraTechniques` and `analysis.emotionalAnalysis.tone`, and
  exclude `media` and the account objects (**Atlas search**).
- Read up to `maxPosts` videos: one call of `limit: 100`, then the `nextCursor` for each further
  100, stopping at `maxPosts` or when no `nextCursor` comes back. Count only the first `maxPosts`
  hits.
- The videos read are the read's `analysedPosts`. Keep the first page's `totalHits` as
  `totalAnalysed`, the number of analysed videos Atlas holds.

Never use `aggs` for this read: the labels are free text, a terms aggregation caps at 100
distinct labels and a large account has hundreds, so label totals undercount.

Classify each post. A label matches when, lowercased, it contains any word on its list:

| Share | Read from | Matches | Never counts |
| ----- | --------- | ------- | ------------ |
| Speech | The post's audio style | spoken, speaking, voiceover, voice-over, narration, narrative, dialogue, speech, talking, commentary, direct address | A label containing "text overlay" or "overlay text" |
| To camera | Any of the post's camera techniques | talking head, direct address, to camera, to-camera, selfie, vlog | A label containing "mirror" |
| Explainer | Any of the post's tones | informative, helpful, conversational, educational, explanatory, instructional | Nothing |

A field that comes back as one string is one label; a list is several. A post with no label for a
share counts as not matching it. Each share is the number of posts that match over the posts read,
as a whole percentage (half rounds up). All three shares are exact. A post can count toward more
than one share.

Instagram, TikTok, YouTube and Pinterest are all read. In a CAS campaign the read is of the
creator's Instagram account.

## Score and settings

Score = speech × 45% + to camera × 35% + explainer × 20%, rounded (half up), out of 100, using
the weights in force.

Fewer analysed videos read than `minPosts`: no score (`null`). The shares and the count are still
returned, the creator shows "not enough analysed posts", and is never dropped from the slate.

| Setting | Default | Allowed |
| ------- | ------- | ------- |
| `weights` | speech 45, to camera 35, explainer 20 | Three numbers from 0 to 100 that sum to 100 |
| `minPosts` | 20 | 1 to `maxPosts` |
| `maxPosts` | 100 | 20 to 300 |

With a campaign named, the settings come from `match.talksToCamera {weights, minPosts, maxPosts}`
on `campaign:{slug}-cas`; a missing or out-of-range setting uses its default, and the result says
which defaults it used. With none, the defaults. Changing the weights or the minimum re-scores
from the stored shares and `analysedPosts` with no new read; changing `maxPosts` takes effect at
the next read.

## The output

Per handle: `{handle, network, score | null, speech, toCamera, explainer, analysedPosts,
totalAnalysed, weights, minPosts, maxPosts, scoredAt}`. `scoredAt` is the UTC time of the read.
A handle Atlas holds no analysed video for returns `analysedPosts` 0, every share 0 and `score`
`null`, and says so.

## In a CAS campaign

Launched from row 4 with the campaign slug and the lane.

- **Who is read.** Every undecided candidate in the lane's pool (the newest finding per
  `entityId` is an `action_item` with `detail.lane` the lane) whose finding has no
  `detail.adFigures.talksToCamera` yet. A creator added by a refill (row 3) is read the next time
  row 4 runs. A creator whose stored read gives another score under the current weights or
  minimum is re-scored from it, with no new read.
- **What is saved.** For each read, a new version of that discovery finding: `append_insights`
  under the finding's own `runKey`, with its role, kind, priority, `schema`, `entityKind`,
  `entityId` and summary, and its `detail` unchanged except
  `detail.adFigures.talksToCamera = {score, speech, toCamera, explainer, analysedPosts,
  totalAnalysed, weights, scoredAt}`. `idempotencyKey` `camera-screen-{entityId}-{scoredAt}`.
  The newest version still wins, so vetting, the campaign page and `get_cas_selection` read it.
- **Handles with no discovery finding** are returned in the result, never written.
- **The confirmation.** Row 4's Run picker, "Screen the {concept} creators and save the results
  to Atlas?", confirms these saves as it confirms vetting's. The main thread passes that approval
  in the launch block's `approved`; without it, the agent returns the saves as `proposals` and
  writes nothing.
- **No page.** The result packet carries the reads; vetting's slate and the campaign page show
  them.

## The storyline

Asked on its own, the three bullets argue: who talks to camera most (the creators with the top
scores, and how many videos each read covers); who cannot be scored yet (the creators under the
minimum, with their counts); and what drives the gap between the top and the bottom (the share
that differs most, with the creators behind it). The agent returns them as one picker (Build,
Change, Widen) before the first build of a new page. A CAS campaign run has no storyline, since
it publishes nothing.

## The page

Title "Talks to camera: {slate or campaign}". In the page standard's skeleton order:

1. **Who it is for**: the reader, the slate and its size, and the date Atlas was read.
2. **The answer**: the creators who score highest, and how many stay on the slate with too few
   analysed posts to score.
3. **Up to three insights**, from the storyline.
4. **The slate**: one row per creator with talks to camera /100, the speech, to-camera and
   explainer shares, and "newest {n} of {total} analysed videos". A creator under the minimum
   shows "Not enough analysed posts" in place of the score, keeps the shares and the count, and
   stays on the list. When the weights differ from 45 / 35 / 20, the table says "Weights for this
   campaign: x / y / z" beside the score.
5. **Next steps**, ranked: send the top creators on to vetting, and when Atlas will have analysed
   enough of the others' posts to score them.
6. **How it was worked out**: each share is the share of the videos read whose labels match its
   word list, so all three are exact and a video can count toward more than one; the score's
   weights and the minimum.
7. **What is missing**: handles Atlas does not hold, and handles with no analysed video.

## Saved answers

None. Asked on its own, the page is the record; inside a CAS campaign the reads live on the
discovery findings (**In a CAS campaign**). It keeps no `user_fact` key.

## Scheduled path

Interactive only. Inside a CAS campaign it runs only from row 4's Run picker, never on the weekly
call's schedule.
