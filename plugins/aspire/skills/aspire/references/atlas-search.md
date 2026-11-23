# Atlas search: ids, fields and paging

Read this before the first `search_creators`, `search_posts` or `search_insights` call. Every field
below was accepted by the live server. For a field not listed, read the census
(`list_creator_search_fields`, `list_post_search_fields`, `list_insight_search_fields`); never guess.

## Ids

- `asOrganizationId` and `asProfileId` come only from this run's `get_status`,
  `list_my_organizations`, `list_my_profiles` or `create_profile` result, or the launch message.
  Never from memory, an earlier session or a summary.
- `forbidden` or `not-found` on an id: call `list_my_profiles` once, match the brand by name, and
  retry with the id it lists. Never resend the refused id.

## Fields

Ask only for the fields the answer or page shows.

**Creators.** Every hit carries the card fields (handle, name, verified, followers, country,
typical views, rate, badges, past partners, category, picture) and `freshness`, whatever
`fields` says, under `document.channels[]`.

- Card or list: `fields: ["username"]`.
- More: `instagram.biography`, `instagram.email`, `instagram.reelsHookRate`,
  `instagram.creatorMarketplaceReach`, `tiktok.bioDescription`, `tiktok.medianViews`,
  `tiktok.engagementRate`, `youtube.displayName`, `youtube.viewCount`, `snapshotAt`.
- Audience (project only, never filter): `instagram.creatorEngagedAccountsBreakdowns`,
  `instagram.audienceDemographics`, `instagram.followerDemographics`, `tiktok.audienceGenders`,
  `tiktok.audienceAges`.

**Posts.**

- List: `["externalId", "url", "postedAt", "mediaKind", "text", "likeCount", "commentCount",
  "viewCount", "author.username"]`.
- Page cards add `media.mediaUrl`, `media.thumbnailUrl`, `instagram.mediaProductType`,
  `instagram.account.profilePictureUrl`, `tiktok.account.profileImage`. `media` comes back as an
  array.
- Analysis: `analysis.brandSafety`, `analysis.commentSentimentBreakdown`,
  `analysis.aestheticTags`, `analysis.commercialAnalysis.featuredBrands`. `analysis.transcript`
  only to quote it.
- Also: `saveCount`, `shareCount`, `author.followersCount`, `instagram.permalink`.

**Insights.** `role`, `summary`, `entityKind`, `entityId`, `schema`, `createdAt`,
`detail.account_review`. A run's findings: `prefix` on `detail.account_review.runKey`.

Names that do not exist:

| Not a field | Use |
| ----------- | --- |
| `permalink` | Posts: `url` or `instagram.permalink` |
| `name`, `displayName`, `author.name` | Creators: `instagram.name`, `tiktok.displayName`, `youtube.displayName`. Posts: `instagram.account.name`, `tiktok.account.displayName` |
| `instagram.igUserId` on creators | `externalId` |
| `instagram.engagedAudienceDemographics` | `instagram.creatorEngagedAccountsBreakdowns` |
| `embedding`, any `attribution.*` | Nothing: never readable |

"Invalid projection" names the field: drop it and run the call once more.

## limit, aggs and cursor

- `limit` is 1 to 100. `limit: 0` only together with `aggs`, which needs no `queryText`.
- A count needs no hits: every filter-only response carries `totalHits`, so send `limit: 1`. Distinct
  creators: `aggs: {"creators": {"cardinality": {"field": "author.username"}}}` with `limit: 0`.
- `aggs` never goes with `cursor` or `queryText`.
- `cursor` is only the `nextCursor` of the previous page of the same call, unchanged. Re-send the
  same `esFilter`, `queryText`, `sort`, `asProfileId` and `partnership`, and `fields` again. Any
  change starts over without a cursor. Never pass a link, page text, an id or another call's cursor.
- No `nextCursor` means the last page. `invalid-input` about the cursor: start again from page one.
