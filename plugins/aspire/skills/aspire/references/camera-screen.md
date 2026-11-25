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
| CS1 | Which creators should I read? Type the handles in the free text field, or pick a campaign. | "Type the handles in the box below (Recommended)" / "A creator ad campaign's pool" (then CS3 and CS4) / "A discovery campaign's shortlist" (then CS3) |
| CS2 | Which network are the handles on? Asked only when pasted handles name none. | "Instagram (Recommended)" / "TikTok" / "YouTube" / "Pinterest" |
| CS3 | Which campaign? | The saved campaigns of the kind CS1 named, newest first, up to four, the newest "(Recommended)" |
| CS4 | Which concept? | The campaign's saved lanes by name, up to four, the one with the most undecided creators "(Recommended)" |

A campaign's pool reads the newest undecided candidates of that campaign's discovery findings
(**Which handle** below), shows them on the page and writes nothing. Inside a CAS campaign the main thread asks nothing of its own: row 4's Run picker covers
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
   newest record per `entityId` wins (**Creator discovery**, **State written to Atlas**). Then
   keep only the creators whose newest record is an `action_item` (undecided): one accepted or
   rejected since an older undecided record drops out.
   **Which handle.** A finding holds the network's account id, not the handle: take the handle
   from the profile URL in the finding's `detail.evidence`, else `search_creators` filtered on
   `externalId` = the finding's `entityId` with `fields: ["username"]`. With neither, return the
   creator as "no handle found", never a guess. Good: "Creator 1784…: no handle found, so not
   read." Bad: a handle made up from the creator's display name.
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
- Sort `postedAt` descending. Project only the three analysis fields page-standard's Camera
  screen row names (audio style, camera techniques, tone), and exclude `media` and the account
  objects (**Atlas search**).
- Read up to `maxPosts` videos: one call of `limit: 100`, then the `nextCursor` for each further
  100, stopping at `maxPosts` or when no `nextCursor` comes back. Count only the first `maxPosts`
  hits.
- The videos read are the read's `analysedPosts`. Keep the first page's `totalHits` as
  `totalAnalysed`, the number of analysed videos Atlas holds.

Never use `aggs` for this read: the labels are free text, a terms aggregation caps at 100
distinct labels and a large account has hundreds, so label totals undercount. Good: "@handle:
speech 62% (31 of the newest 50 videos read)". Bad: "@handle: speech 18%", from an aggregation
that counted only the 100 most common audio labels.

Classify each post. A label matches when, lowercased, it contains any word on its list:

| Share | Read from | Matches | Never counts |
| ----- | --------- | ------- | ------------ |
| Speech | The post's audio style | spoken, speaking, voiceover, voice-over, narration, narrative, dialogue, speech, talking, commentary, direct address | A label containing "text overlay" or "overlay text" |
| To camera | Any of the post's camera techniques | talking head, direct address, to camera, to-camera, selfie, vlog | A label containing "mirror" |
| Explainer | Any of the post's tones | informative, helpful, conversational, educational, explanatory, instructional | Nothing |

A field that comes back as one string is one label; a list is several. A post with no label for a
share counts as not matching it only when that field was read. When Atlas rejects one of the
three projections, that share is unavailable (`null`, with the data gap named), never 0%, and the
creator gets no score until all three shares can be read. Each share is the number of posts that match over the posts read,
as a whole percentage (half rounds up). All three shares are exact: each counts every video
read, and none is estimated. Good: "spoken voiceover" counts as speech. Bad: an audio label of
"text overlay with music" counted as speech. A post can count toward more
than one share.

Instagram, TikTok, YouTube and Pinterest are all read. In a campaign the network is the
finding's `schema` (Instagram for a CAS campaign).

## Score and settings

Score = speech × 45% + to camera × 35% + explainer × 20%, rounded (half up), out of 100, using
the weights in force. The score is worked out from the whole-percent shares, so a re-score from
stored shares gives the same number.

Fewer analysed videos read than `minPosts`: no score (`null`). The shares and the count are still
returned, the creator shows "not enough analysed posts", and is never dropped from the slate.
Good: "@handle: not enough analysed posts (newest 12 of 12 analysed videos), speech 58%". Bad:
"@handle: 0/100", or the creator left off the slate.

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
A handle Atlas holds no analysed video for is under the minimum like any other: it returns
`analysedPosts` 0, every share and `score` `null`, and shows "Not enough analysed posts" with the
note "No analysed videos in Atlas", never a 0%. It stays on the slate. Good: "@handle: Not enough
analysed posts (no analysed videos in Atlas, 0 of 0)". Bad: "@handle: speech 0%, to camera 0%, 0/100".

## In a CAS campaign

Launched from row 4 with `job` `cas-screen`, the campaign slug, the lane and `save`.

- **Who is read.** Every undecided candidate in the lane's pool (the newest finding per
  `entityId` is an `action_item` with `detail.lane` the lane) whose finding has no
  `detail.adFigures.talksToCamera` yet. A creator added by a refill (row 3) is read the next time
  row 4 runs. A creator whose stored read gives another score under the current weights or
  minimum is re-scored from it, with no new read. When the newest version has no read but an
  older version of the same `entityId` has one, that read is carried forward (re-scored when the
  settings changed) instead of reading again.
- **What is saved.** For each read, a new version of that discovery finding: `append_insights`
  under the finding's own `runKey`, with its role, kind, priority, `schema`, `entityKind`,
  `entityId` and summary, and its `detail` unchanged except
  `detail.adFigures.talksToCamera = {score, speech, toCamera, explainer, analysedPosts,
  totalAnalysed, weights, scoredAt}`. `idempotencyKey`
  `camera-screen-{entityId}-{writtenAt}`, the UTC time of the save, so a re-score is never
  dropped as a duplicate. The newest version still wins, so the read stays on the finding for the
  campaign page, `get_cas_selection` and the match score to read.
- **A read with an unreadable share** (Atlas rejected one of the three projections) is returned
  with its data gap and never saved, so a saved `score` of `null` always means under the
  minimum. The creator keeps no read and is read again at the next row 4 run.
- **Handles with no discovery finding** are returned in the result, never written. Good: "@handle
  has no discovery finding in this lane, so the read is returned and not saved." Bad: a new
  finding created just to hold the read.
- **The confirmation.** Row 4's Run picker, "Screen the {concept} creators and save the results
  to Atlas?", confirms these saves as it confirms vetting's. The main thread passes that approval
  in the launch block's `approved` and as `save: true`; without both, the agent returns the saves
  as `proposals` and writes nothing.
- **No page.** The result packet carries the reads.

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
   stays on the list; with no analysed video it also says "No analysed videos in Atlas". When the
   weights differ from 45 / 35 / 20, the table says "Weights for this campaign: x / y / z" beside
   the score. On the Shortlist template each creator's `verdict` groups the slate and decides
   nothing (vetting makes the call): `yes` ("Talks to camera") at 60 or more, `maybe` at 40 to
   59, `no` under 40, and `maybe` for a creator with no score, whose `settle` is how many more
   analysed videos it needs, or the share Atlas could not read. A scored `maybe`'s `settle` is
   "watch two of their newest videos for delivery to camera".
5. **Next steps**, ranked: send the top creators on to vetting, and for each creator under the
   minimum, how many more analysed videos it needs to be scored.
6. **How it was worked out**: each share is the share of the videos read whose labels match its
   word list, so all three are exact and a video can count toward more than one; the score's
   weights and the minimum.
7. **What is missing**: handles Atlas does not hold, and any analysis field Atlas could not read.

## Saved answers

None. Asked on its own, the page is the record; inside a CAS campaign the reads live on the
discovery findings (**In a CAS campaign**). It keeps no `user_fact` key.

## Scheduled path

Interactive only: an unattended launch returns one "setup needed" line and stops. Inside a CAS campaign it runs only from row 4's Run picker, never on the weekly
call's schedule.
