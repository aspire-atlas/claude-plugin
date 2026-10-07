# Atlas MCP tool reference

Server: `https://atlas.aspire.io/mcp` (streamable HTTP, OAuth handled by the connector).
Last verified 2026-10-05 against the live server: 35 tools. The surface changes without
notice; when a tool named here is missing, or an unlisted `*Aspire_Atlas*` tool appears (other than the admin connector's `*Organization_Admin*` tools), note
it in the run summary so the plugin can be updated. Never call an unlisted tool that changes
state without first checking the **Destructive tools** section below.

## Tool name prefix

| How added | Prefix |
| --------- | ------ |
| Bundled with this plugin or org-installed connector "Aspire Atlas" (verified, the normal case) | `mcp__Aspire_Atlas__` |
| Some clients namespace plugin servers | `mcp__plugin_aspire_Aspire_Atlas__` |
| Connector added in claude.ai settings, seen from Claude Code | `mcp__claude_ai_Aspire_Atlas__` |
| Claude Code `claude mcp add atlas` | `mcp__atlas__` |

Detect by matching `aspire_atlas` or `atlas__` (case-insensitive) in the tool name; never match
a bare `atlas` substring, which also hits Atlassian tools. Exclude any name containing
`organization_admin`: the bundled **Aspire Atlas Organization Admin** connector also contains
`aspire_atlas` and is never the data connection. More than one prefix can match in
one session, for example a signed-out plugin copy next to a signed-in claude.ai copy. A copy
whose only tools are `authenticate` and `complete_authentication` is not signed in: use the
prefix whose tools include `get_status`, and treat the connection as needing a sign in only
when no prefix has it. Resolve once in Phase 1.5 and use everywhere. Load tools per phase
with one `ToolSearch` `select:` call each, or `+Aspire_Atlas` with `max_results: 50` to load
all at once and drop the `organization_admin` results.

## Organization admin connector

The bundled **Aspire Atlas Organization Admin** connector (organization members and
invitations) belongs to the `org-admin` skill. Its tools and rules are in
`../../org-admin/references/org-admin-tools.md`. No flow in this skill calls it.

## Universal argument

Every tool requires `context`: 15 to 25 words, third person, no first person, no
credentials. It is analytics only. Example: "Onboarding flow creating the brand profile so
social channels and brand memory have a home in the organization."

## Attribution model

- Organization → Profile → Channels. Tools take ids, never slugs: `asOrganizationId`
  (`org_…`, from `get_status` `organizations.selected.id` / `organizations.all[].id`) and
  `asProfileId` (a uuid, from `get_status` `profiles[].id`, `list_my_profiles`, or
  `create_profile`'s `id`). Slugs can change; keep them for display and for naming your
  own records and files only.
- `asProfileId` alone locates its own organization and is authorized by the caller's role
  there.
- With only `asOrganizationId`, a call is attributed to the organization; it reaches a
  profile only when the organization has exactly one live profile. Profile-scoped reads and
  writes need `asProfileId`.
- Omitting both defaults to the connector's org (chosen at OAuth time).
- The old slug-era argument names (anything containing `slug`, and the short `as…` names
  that took slugs) are rejected with `invalid-input`, and so is a slug passed where an id
  belongs.

## Phase map

| Phase | Tool | Purpose | Notes |
| ----- | ---- | ------- | ----- |
| 2, 3 | `get_status` | Orgs, selected org, profiles, channels, expired auths, next-step links | Call once per session. `asOrganizationId` to switch org. Keep the organization and profile `id`s it returns. |
| 2 | `list_my_organizations` | Cheap org re-check | |
| 3 | `list_my_profiles` | Cheap profile re-check | Every organization the caller can act on, each with its live profiles (`id`, `slug`, `name`) in one call |
| 3 | `get_profile` | One profile's detail | `{found:false}` is normal |
| 4.1 | `create_profile` | Create brand profile | `name` + `asOrganizationId`. Returns the profile's `id` (for `asProfileId`) and `slug` (display). Re-sending the same name to the same org returns the existing profile, not a duplicate. |
| 4.1 | `update_profile` | Rename | Slug never changes |
| 4.1 | `delete_profile` | Remove a profile | **Destructive, irreversible.** Refused while channels are linked. See Destructive tools. |
| 4.2 | `connect_channel` | Start / resume social connection | Start: `channel` + `asProfileId` → `connectUrl`, `elicitationId` (show `connectUrl` via the card in `connection-card.md`). Resume: `elicitationId` only, long-polls ~30s. Channels: `meta`, `tiktok`, `tiktok_one`, `youtube`. A `complete` status carries `outcome` (`all-linked`, `partially-linked`, `none-linked`); an account another profile holds is a `failedAccounts[].error` `already-linked`, with that profile's id in `discoveredAccounts[].accounts[].alreadyLinkedToProfileId` (matched by `platformAccountId`) → see `unlink_channel`. |
| 4.2 | `list_channels` | Live connections on a profile | Returns `platform` + `platformAccountId`; empty list is a normal first-run state. Read before `unlink_channel`. |
| 4.2 | `unlink_channel` | Disconnect an account from a profile | **Destructive.** Needs `platform` (`instagram`, `facebook`, `tiktok`, `tiktok_one`, `youtube`) + `platformAccountId` from `list_channels`. Collected data is kept. See Destructive tools. |
| 4.3 | `add_hashtags` / `remove_hashtags` / `list_hashtags` / `list_available_hashtags` | Watch-list | Networks: `instagram`, `tiktok`. Per-row results. TikTok: 50 cap, eligibility gate, 7-day removal lock. |
| 4.3 | `list_hashtag_posts` | Posts carrying one tracked hashtag on one network, newest first | Read only. `hashtag` + `network` (`instagram`, `tiktok`), optional `since` / `until` (default last 90 days), `sort` (`postedAt` or a metric, descending). Page with `nextCursor` → `cursor`, keeping hashtag, network and sort unchanged. `hashtag-not-tracked` and `no-linked-channel` are normal states, not failures. With a metric sort, dedupe on `externalId`. |
| 5 | `search_calibrations` | Read brand memory | `q`, `kinds`, `keyPrefix`, `includeSuperseded`, `includeProposed`. If `unavailable`: stop, do not guess. |
| 5 | `append_calibration` | Write one fact | One active record per (kind, key). `key-exists` → supersede. `proposed` = recorded, not applied. |
| 5 | `supersede_calibration` | Replace a fact | Compare-and-set on `ifVersion` |
| 5 | `retract_calibration` | Withdraw a fact | Same standing as set |
| 5 | `get_brand_instruction` / `set_brand_instruction` | Brand's standing instruction to an agent type (e.g. `brand_safety`) | Prose, versioned, deduped |
| 6 | `list_post_search_fields` | Live field census for posts | Call before any `esFilter` on posts |
| 6 | `list_creator_search_fields` | Live field census for accounts | |
| 6 | `search_posts` | Posts by filter, optional semantic `queryText` | Filter-only is sub-100ms; semantic takes seconds. `aggs` on filter path only. |
| 6 | `search_creators` | Accounts by filter | No per-post fields here |
| Discovery | `search_creator_marketplace` | Start a creator-marketplace search on Instagram and/or TikTok | `{ keyword (required, 1 to 100 chars), networks (default both), instagram: { filters }, tiktok: { filters } }`. Each network takes its own filters; a filter block for a network not in `networks`, or any old top-level `filters`, is rejected. Returns `jobs.instagram` / `jobs.tiktok`: `{ jobId, runId }` when started (poll `get_job_status` with **each** `jobId`) or `{ skipped: true, reason }` (`no-seat`, `unavailable`, `rate-limited`, `internal-error`). Fails only when every requested network was skipped. TikTok: `countryCodes` defaults to `["US"]` (echoed in `jobs.tiktok.appliedDefaults`), only 26 supported countries (an unsupported one fails the whole call), one region per search, `stateProvinces` only with `["US"]`; `jobs.tiktok.seat` says whose TikTok One seat ran it (keyword results are personalized per seat). `instagram.filters.similarToCreators` cannot be combined with the required `keyword`, so never send it. Starts discovery work: see **Avoid in onboarding**. |
| Discovery | `list_creator_marketplace_labels` | TikTok content and industry labels | Read only. `{ network: "tiktok" }` → `contentLabels` / `industryLabels` with `id` and `name`; pass ids as `tiktok.filters.contentLabelIds` / `industryLabelIds`. An unknown id fails the search. A search that names label ids is skipped `no-seat` when Aspire has no default TikTok One seat: retry without them. `unavailable` with `retryable: false` means no default seat is configured; search without labels, which runs only on the profile's own TikTok One seat, and if TikTok is then skipped, report it as not searched. |
| 6 | `append_insights` | Write analyst findings | `runKey` per session; roles `account_review` (went_well / needs_improvement / action_item) |
| 6 | `search_insights` / `list_insight_search_fields` | Read back findings | Tenant-private |
| Content review | `search_calibrations`, `get_brand_instruction` (read only), `search_posts`, `search_creators`, `search_insights`, `append_insights`, `append_calibration` (lessons and hard rules the user saved), `lookup_posts` (one named post) | Reviews one post against a brief; reads prior reviews and feedback by `runKey` prefix `content-review-*` | Setup and lessons in `content-review.md`; interactive only |
| Post analysis | `search_calibrations`, `list_post_search_fields`, `search_posts`, `search_creators`, `search_insights`, `lookup_posts` (the linked post), `lookup_creators` (its author, on Q2 "Refresh"), `append_insights` | `atlas-post-analysis`: one published post in depth, `runKey` prefix `post-analysis-*` | `post-analysis.md`; interactive only; no discovery |
| Theme | `search_calibrations`, `append_calibration`, `supersede_calibration` and `retract_calibration` (Destructive tools confirmation each) | Brand colors, fonts, and logo for every page, in one `theme:brand` record | Interview and application rules in `theme.md`; main thread only, never unattended |
| Fee calculator | `search_calibrations`, `append_calibration`, `supersede_calibration` and `retract_calibration` (Destructive tools confirmation each) | Creator rates for every fee the plugin shows, in one `fees:rate-card` record | Questionnaire, calculation, and application rules in `fees.md`; main thread only, never unattended |
| Readouts | `search_calibrations`, `search_posts` (+ `aggs`), `search_creators`, `search_insights`, `list_hashtag_posts` (launch pulse), `append_insights` | Daily and weekly readouts read prior runs by `runKey` prefix (`readout-daily-*`, `readout-weekly-*`), and the weekly's product and PMM lenses read `market-signal-*`; they write new findings | Setup calibrations and the launch pulse in `readout.md`; unattended runs never ask or destroy |
| Market signal | `search_calibrations`, `list_post_search_fields`, `search_posts` (+ `aggs`, + semantic), `search_creators`, `list_hashtag_posts`, `search_insights`, `append_insights` | What creators say about the brand vs. its competitors; reads prior runs by `runKey` prefix `market-signal-*` | Setup calibrations in `market-signal.md`; no discovery in any mode; unattended runs never ask or destroy |
| Quarterly signal | `search_calibrations`, `search_posts`, `search_creators`, `search_insights`, `list_insight_search_fields`, `append_insights` | Rolls up every saved `runKey` prefix for the quarter into one page | `quarterly-signal.md`; no discovery |
| Creator vetting | `search_calibrations`, `get_brand_instruction` (read only), `search_creators`, `search_posts`, `search_insights`, `append_insights`, `append_calibration` (creator notes and lessons the user saved), `lookup_creators` (listed handles, after R3) | Approve, Maybe, or Reject for a list of creators; `runKey` prefix `creator-vetting-*`; team calls on a creator in `creator:*` records | `creator-vetting.md`; interactive only |
| PPA pitch | `search_calibrations`, `list_creator_search_fields`, `search_creators`, `list_post_search_fields`, `search_posts`, `search_insights`, `append_insights`, and with D4's marketplace option `search_creator_marketplace`, `get_job_status`, `list_creator_marketplace_labels`, `lookup_creators` | `atlas-ppa-pitch`: a casting deck for paid partnership ads; `runKey` prefix `ppa-pitch-*`; reads every other prefix for pre-fill | `ppa-pitch.md`; interactive only; package prices never written
| Ad reuse | `search_calibrations`, `list_post_search_fields`, `search_posts`, `search_creators`, `list_hashtag_posts`, `search_insights`, `append_insights` | `atlas-ad-reuse`: hook scores and cut lists, `runKey` prefix `ad-reuse-*` | `ad-reuse.md`; reads only what Atlas holds |
| CAS campaign | `search_calibrations`, `append_calibration`, `supersede_calibration` (its own confirmation), `search_insights`, `append_insights`, `search_posts` (rates and terms) | Conducts a creator ad campaign through Gates 2 to 4; setup in `campaign:{slug}-*` records, working state on `runKey` prefix `cas-campaign-*`; launches discovery, vetting, and the brief in creator-ads mode | `cas-campaign.md`, `rates-and-terms.md`, `hooks-and-ctas.md`; main thread only; unattended runs publish and post only |
| Influencer program | `search_calibrations`, `append_calibration`, `supersede_calibration` (its own confirmation), `search_insights`, `append_insights`, plus each program agent's reads | Program setup and status; setup in `program:{slug}-*` records, working state on `runKey` prefix `program-*`; launches the program agents | `program.md`; main thread for setup and decisions; unattended runs follow its **9** |
| Creator outreach | `search_calibrations`, `search_insights`, `list_insight_search_fields`, `list_post_search_fields`, `list_creator_search_fields`, `search_creators`, `search_posts`, `append_insights` | `atlas-creator-outreach`: first messages, follow-ups, and reply triage for an influencer program; writes `draft`, `reply`, and `roster` findings on `runKey` prefix `program-*`; reads `creator-vetting-*` and `creator-discovery-*` for the fit line | `outreach.md`, `program.md`; no discovery; mailbox drafts and sends only after their own confirmations; unattended `reply-check` reads and publishes only |
| Creator negotiation | `search_calibrations`, `list_creator_search_fields`, `list_post_search_fields`, `list_insight_search_fields`, `search_creators`, `search_posts`, `search_insights`, `append_insights` (record pass, after N1 and N3) | `atlas-creator-negotiation`: offers, counters and renewals for a program; writes `terms`, `roster`, `draft`, `reply` and its `page` finding on `runKey` prefix `program-*` | `negotiation.md`; interactive only; reads only what Atlas holds; prices only from the fee calculator and the program's terms |
| Product fulfillment | `search_calibrations`, `search_insights`, `list_insight_search_fields`, `list_post_search_fields`, `search_posts`, `search_creators`, `append_insights` | `atlas-product-fulfillment`: product picks, details requests, the order form, orders, shipping and arrival; writes `fulfillment`, `draft`, `roster`, and its `page` finding on `runKey` prefix `program-*` | `fulfillment.md`, `program.md` **4** to **6**; interactive, plus the read-only `status` mode for the scheduled shipping check (writes `page` only); no discovery; store orders only after F4 |
| Content library | `search_calibrations`, `list_post_search_fields`, `list_insight_search_fields`, `search_posts` (+ semantic for query words no tag holds, + one per `red_line`), `search_creators`, `list_hashtags`, `list_hashtag_posts`, `search_insights`, `append_insights` | `atlas-content-library`: catalogs creator posts about the brand as `asset` findings (and its link as a `page` finding) on the program prefix (`content-library-*` without a program), joins `rights`, `terms`, and `deliverable` findings, publishes the library page | `content-library.md`; no lookups or discovery in any mode; never writes `rights`; unattended writes `asset` and `page` only when the program cadence names the library |
| Avoid in onboarding | `lookup_creators`, `lookup_posts`, `start_business_discovery`, `search_creator_marketplace`, `get_job_status` | Start discovery work beyond the accounts Atlas already holds | Only on explicit user request. The one routine use is `atlas-profile-analyst` in named-handle mode: the user typing a network and handle in Phase 6 is the approval, and the agent calls `lookup_creators` only when Atlas holds nothing for that handle or the record is over 24 hours old. `lookup_creators` has no status-check tool; re-call it with the same item to re-read a `fetching` result, and `creatorDeepAnalysis` defaults to `true` there, so recent posts come with the account. Attribute it with `asProfileId`. Creator vetting is another: R3 "Fetch them" approves `lookup_creators` for exactly the listed handles Atlas does not hold, batched up to 100 per call. `atlas-post-analysis` is another: pasting the post's link approves `lookup_posts` for that post, and Q2 "Refresh the account first" approves `lookup_creators` for its author only. The other routine use is `atlas-content-review` on a published post: pasting the link is the approval, and the agent calls `lookup_posts` once for that post only when Atlas does not hold it, with `creatorDeepAnalysis` left at its default `false`. A TikTok miss is a paid vendor call. |
| Utility | `get_more_tools` | Server-side tool discovery | Do not call during onboarding; the phase map above is the supported surface. |

## Destructive tools: confirmation is mandatory

Every call in this table changes or removes platform state that other teammates and future
sessions depend on. Before any of them, ask with `AskUserQuestion` (never plain text), name the
exact object in the question (handle, brand name, or the fact's statement), make the safe
option the first one, and proceed only on the explicit confirming option. A free-text "yes"
or "ok" from an earlier message does not count. Never chain two destructive calls on one
confirmation.

| Tool | Reversible? | Confirmation question (fill in the object) |
| ---- | ----------- | ------------------------------------------- |
| `delete_profile` | No. Hashtags, brand instruction, and all calibrations go with it. | "Permanently delete the **{brand}** profile and everything saved under it? This cannot be undone." Options: Keep it (Recommended) / Delete permanently. Run `list_channels` first; refuse to unlink accounts just to make a delete possible unless the user asks for that separately. |
| `unlink_channel` | Partly. Data is kept; the connection must be re-authorized. | "Disconnect **@{handle}** ({network}) from {brand}? Collected posts stay, but Atlas stops reading new ones until it is reconnected." Options: Keep connected (Recommended) / Disconnect. |
| `supersede_calibration` | Old record is kept as superseded. | Show current vs. new statement. "Replace the saved fact?" Options: Keep current (Recommended) / Replace. |
| `retract_calibration` | Record is withdrawn. | "Withdraw this saved fact from brand memory: *{statement}*?" Options: Keep it (Recommended) / Withdraw. |
| `remove_hashtags` | Re-add later; TikTok has a 7-day removal lock. | "Stop tracking {tags} on {network}?" Options: Keep tracking (Recommended) / Stop tracking. |
| `set_brand_instruction` | Versioned. | Show current vs. new text. Options: Keep current (Recommended) / Update. |

State-creating calls (`create_profile`, `connect_channel` start, `append_calibration`,
`add_hashtags`, `append_insights`) also need a confirmation, per the Guardrails in SKILL.md,
but a single confirmation may cover a batch of the same kind (for example, all Phase 5
answers the user just gave).

## Visual fields (for Visual output)

Project these in `fields` whenever posts or creators will be shown to the user. They are
opaque or `exists`-only in the census, so they cannot be filtered on, but they project fine.

| Entity | Field | Use |
| ------ | ----- | --- |
| Post | `media.mediaUrl` | Full-size post image; on video posts, the video file |
| Post | `media.thumbnailUrl` | On video posts, the full-size poster frame; often 404 on image posts |
| Post | `instagram.permalink` / `url` | Link target |
| Post | `instagram.mediaProductType` | FEED / REELS chip (null on older posts) |
| Post author | `instagram.account.profilePictureUrl` | Profile picture, Instagram |
| Post author | `tiktok.account.profileImage` | Profile picture, TikTok |
| Creator | `instagram.profilePictureUrl`, `tiktok.profileImage`, `youtube.profileImageUrl` | Profile picture in `search_creators` (project the network container; on posts the same fields sit under `*.account`) |

CDN URLs expire. Render with `onerror` placeholders and note the expiry on the page.

Creators are always drawn with the creator card; its field list, including the post
`analysis` fields behind the brand safety and sentiment tiles, is in `creator-card.md`.

## Calibration kinds (for Phase 5)

| kind | Standing | detail shape (required fields) |
| ---- | -------- | ------------------------------ |
| `brand_fact` | member+ | `{section, body}` sections: brand_summary, brand_context, business_context, voice_and_content_ops, limits_and_gaps, what_this_unlocks |
| `user_fact` | member+ | `{role, relationship: in_house\|agency\|owner, owns?, firstAsk?}` |
| `competitor` | member+ | `{handle, tier: a\|b, body?, spellingVariants?}` |
| `partner` | member+ | `{handle, platform: instagram\|tiktok, themes?, safetyVerdict?, readClosely?, notes?}` |
| `red_line` | member+ | `{action: block\|flag\|escalate, appliesTo[], body?}` hard limit |
| `guideline` | member+ | `{concern: ceiling\|requirement\|preference, appliesTo[], body?}` soft rule |
| `policy` | member+ | `{area: escalation\|cadence\|routing, cadence?, body?}` |
| `decline` | member+ | `{topic, body?, askedAt?}` question the user declined |
| `alignment_target` | admin+ | `{horizon: 90d\|2y, confidence, cadence, observable, notCovered, dependsOn?}` |
| `coverage_stamp` | platform only | not writable from a session |

**Keys starting `review:` belong to content review only.** That covers the review setup
answers, lessons (`review:lesson-*`), and hard rules (`review:rule-*`), whatever their kind.
Only content review applies them. Every other flow (onboarding, the readouts, the creator
brief, creator discovery, the account analyst) drops them when it reads `red_line`,
`guideline`, or any other calibration. A rule the brand wants everywhere is saved under its
normal key (`redline:*`, `guideline:*`) instead.

**Keys starting `vetting:` belong to creator vetting only**: its setup answers and lessons
(`vetting:lesson-*`). Every other flow drops them, as it drops `review:` keys.

**Keys starting `creator:` are the team's call on one creator** (`creator:ig-{handle}`,
`creator:tt-{handle}`), saved from creator vetting feedback (`creator-vetting.md`, **Creator
calibrations**). Vetting and creator discovery read them; a `reject` stance keeps the creator
out of every discovery campaign. They are never brand guidelines: brief conflicts, content
review checks, and red-line scans leave them out.

**Keys starting `theme:` are page styling only.** `theme:brand` is a `guideline` record that
holds the brand's colors, fonts, and logo for Atlas's own pages (`theme.md`). Flows that
publish a page apply it. No flow treats it as a brand guideline: brief conflicts, content
review checks, discovery criteria, and red-line scans all leave it out.

**Keys starting `fees:` are pricing only.** `fees:rate-card` is a `guideline` record that
holds the brand's CPM ladder for creator fees (`fees.md`). Flows that show a creator fee apply
it. No flow treats it as a brand guideline: brief conflicts, content review checks, discovery
criteria, and red-line scans all leave it out.

**CAS campaign records** (`cas-campaign.md`, **State model**). A creator ad campaign keeps two
record families under its campaign slug:

| Family | Where | Keys or prefix | Read by |
| ------ | ----- | -------------- | ------- |
| Setup | Calibrations | `campaign:{slug}-brief` (with `type: creator-ads`), `-criteria`, `-pool`, `-routing`, `-cadence` (shared with creator discovery), plus `-cas`, `-lane-{lane}`, `-decision-defaults`, `-terms` | The CAS campaign, and discovery, vetting, and the brief in creator-ads mode |
| Working state | Insights | `runKey` prefix `cas-campaign-{profile}-{slug}`, `detail.recordType` `gate` (Gates 1 to 4, and 4b per creator), `roster`, `draft`, `reply`, `brief`, `brief-revision`, `hook`, `hook-review`, or `ledger` | The CAS campaign, and the brief in creator-ads mode (roster, hook log, and a creator's brief revision) |
| Page data | The campaign page, not Atlas | `client/*` (the client's decisions, notes, approvals, shipping edits), `edits/*` (the agency's status and ad permission edits), `agency/*` (agency-only fields), `data/users/{id}/done` (done marks per person) | The CAS campaign, through **Pulling decisions**; done marks stay on the page |

The new record types: a `brief-revision` is one creator's version of the brief, per creator per
round; a `reply` is one line in the reply log, never replaced; a `draft` is the email waiting on
the creator's row; an agency edit from the page lands as a `roster` finding with `source`
`page`. Done marks are never written to Atlas.

The keys `-cas`, `-lane-*`, `-decision-defaults`, and `-terms` belong to the CAS campaign only.
Every other flow drops them, as it drops `review:` and `vetting:` keys. They are never brand
guidelines: brief conflicts, content review checks, and red-line scans leave them out.

**Read every page.** `limit 100` on `search_calibrations` is the page size, not a cap. Pass
each response's `nextCursor` back as `cursor` until none is returned, then filter. Lessons,
hard rules and superseded versions keep growing, so a single page can miss the records a
flow needs. A flow that finds its setup records missing only after reading every page may
report "setup needed".

Keys are `<namespace>:<slug>`, lowercase, e.g. `brand:summary`, `competitor:acme`,
`user:primary-contact`, `target:q4-awareness`.
