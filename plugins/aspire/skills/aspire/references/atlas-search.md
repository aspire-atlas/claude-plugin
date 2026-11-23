# Atlas search: ids, fields and paging

Read this before the first `search_creators`, `search_posts` or `search_insights` call. The live
server accepted every field below. Read a `list_*_search_fields` census only for a path not listed
here; never guess one.

## Ids

- `asOrganizationId` and `asProfileId` come only from this run's `get_status`,
  `list_my_organizations`, `list_my_profiles` or `create_profile` result, or the launch message.
  Never from memory, an earlier session or a summary.
- `forbidden` or `not-found` on an id: call `list_my_profiles` once, match the brand by name, and
  retry with the id it lists. No match, several, or the same id again: stop and say so (an
  unattended run publishes the "setup needed" card). Never resend a refused id.

## Fields to ask for

Ask only for what the answer shows.

**Creators.** Every hit carries the card fields (handle, name, verified, followers, country,
median views, interaction or engagement rate, badges, past partners, category, picture) and
`freshness`, whatever `fields` says, under `document.channels[]`.

- Card or list: `fields: ["username"]`.
- More: `externalId`, `instagram.biography`, `instagram.email`, `instagram.reelsHookRate`,
  `instagram.creatorEngagedAccounts`, `instagram.creatorMarketplaceReach`, `tiktok.bioDescription`,
  `youtube.bioDescription`, `youtube.youtubeTopicCategories`, `snapshotAt`.
- Audience (project only, never filter): `instagram.creatorEngagedAccountsBreakdowns`,
  `instagram.audienceDemographics`, `instagram.followerDemographics`, `tiktok.audienceGenders`,
  `tiktok.audienceAges`.

**Posts.**

- List: `["externalId", "url", "postedAt", "mediaKind", "text", "likeCount", "commentCount",
  "viewCount", "author.username"]`. `media` and the author's picture come back on every hit;
  with no card, `exclude: ["media", "instagram.account", "tiktok.account", "youtube.account"]`.
- Cards add `instagram.mediaProductType`.
- Analysis: `analysis.brandSafety`, `analysis.commentSentimentBreakdown`, `analysis.aestheticTags`,
  `analysis.subjectAnalysis`, `analysis.emotionalAnalysis.tone`,
  `analysis.commercialAnalysis.featuredBrands`; `analysis.transcript` and `analysis.overlayText`
  only to quote them.
- Also: `saveCount`, `shareCount`, `author.followersCount`, `instagram.permalink`.

**Insights.** `role`, `summary`, `entityKind`, `entityId`, `schema`, `createdAt`,
`detail` (or `detail.account_review`).

## Fields to filter on

- Creators: `username`, `network`, `followersCount`, `country`, `verified`, `instagram.category`;
  bio words with `match_phrase` on `instagram.biography` or `tiktok.bioDescription`.
- Posts: `author.username`, `network`, `postedAt`, `mediaKind`, `externalId`, `url`,
  `instagram.hashtags`, `tiktok.hashtags`, `analysis.analyzedAt`; caption words with
  `match_phrase` on `text`. Tags and mentions only inside `nested`: `{"nested": {"path":
  "instagram.mentions", "query": {"terms": {"instagram.mentions.username": ["handle"]}}}}`
  (`tiktok.mentions` the same way).
- Insights: `role`, `entityKind`, `entityId`, `createdAt`; a run's findings with `prefix` on
  `detail.account_review.runKey`.
- Atlas holds no paid-partnership field: never project or filter on one. With an explicit
  `asProfileId`, the `partnership` filter (**Partnership content**) finds the brand's own;
  otherwise the flow names it a gap.

## Names that do not exist

| Not a field | Use |
| ----------- | --- |
| `permalink` | Posts: `url` or `instagram.permalink` |
| `name`, `displayName`, `author.name` | Creators: `instagram.name`, `tiktok.displayName`, `youtube.displayName`. Posts: `instagram.account.name`, `tiktok.account.displayName` |
| `instagram.igUserId` on creators | `externalId` |
| `instagram.engagedAudienceDemographics` | `instagram.creatorEngagedAccountsBreakdowns` |
| `embedding`, any `attribution.*` | Nothing: never readable |

"Invalid projection" names the field: drop it and run the call once more.

## limit, aggs and cursor

- `limit` is 1 to 100. `limit: 0` only together with `aggs`, and never with `queryText`.
- `aggs` takes only `terms` and `cardinality` (approximate); no sums, averages or date
  histograms, so add those up from the paged hits. `aggs` never goes with `cursor` or `queryText`.
- A count needs no hits: every filter-only response carries `totalHits`, so send `limit: 1`. On
  `search_creators` it counts channels, not creators. Distinct creators on posts:
  `aggs: {"creators": {"cardinality": {"field": "author.username"}}}` with `limit: 0`.
- `cursor` is only the `nextCursor` of the previous page of the same call, unchanged. Re-send the
  same `esFilter`, `queryText`, `sort`, `includeDeleted`, `asProfileId` and `partnership`, and
  `fields` or `exclude` again. Any change starts over without a cursor. Never pass a link, page
  text, an id or another call's cursor.
- No `nextCursor` means the last page (with `queryText`, the top 1,000 or so). `invalid-input`
  about the cursor: start again from page one.
