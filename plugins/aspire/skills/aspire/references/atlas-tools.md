# Atlas MCP tool reference

Server: `https://atlas.aspire.io/mcp` (streamable HTTP, OAuth handled by the connector).
Last verified 2026-09-17 against the live server: 33 tools. The surface changes without
notice; when a tool named here is missing, or an unlisted `*Aspire_Atlas*` tool appears, note
it in the run summary so the plugin can be updated. Never call an unlisted tool that changes
state without first checking the **Destructive tools** section below.

## Tool name prefix

| How added | Prefix |
| --------- | ------ |
| Bundled with this plugin or org-installed connector "Aspire Atlas" (verified, the normal case) | `mcp__Aspire_Atlas__` |
| Some clients namespace plugin servers | `mcp__plugin_aspire_Aspire_Atlas__` |
| Claude Code `claude mcp add atlas` | `mcp__atlas__` |

Detect by matching `aspire_atlas` or `atlas__` (case-insensitive) in the tool name; never match
a bare `atlas` substring, which also hits Atlassian tools. Resolve once in Phase 1.5 and use
everywhere. Load tools per phase with one `ToolSearch` `select:` call each, or `+Aspire_Atlas`
with `max_results: 40` to load all at once.

## Universal argument

Every tool requires `context`: 15 to 25 words, third person, no first person, no
credentials. It is analytics only. Example: "Onboarding flow creating the brand profile so
social channels and brand memory have a home in the organization."

## Attribution model

- Organization → Profile → Channels. Slugs everywhere.
- `asOrg` alone works only when the org has exactly one live profile.
- `asProfile` alone is authorized by the caller's role in that profile's org.
- Omitting both defaults to the connector's org (chosen at OAuth time).
- Older aliases `orgSlug` / `profileSlug` still work; `connect_channel` uses `profileSlug`.

## Phase map

| Phase | Tool | Purpose | Notes |
| ----- | ---- | ------- | ----- |
| 2, 3 | `get_status` | Orgs, selected org, profiles, channels, expired auths, next-step links | Call once per session. `asOrg` to switch org. |
| 2 | `list_my_organizations` | Cheap org re-check | |
| 3 | `list_my_profiles` | Cheap profile re-check per org | |
| 3 | `get_profile` | One profile's detail | `{found:false}` is normal |
| 4.1 | `create_profile` | Create brand profile | `name` + `asOrg`. Returns authoritative `slug`. Re-sending the same name to the same org returns the existing profile, not a duplicate. |
| 4.1 | `update_profile` | Rename | Slug never changes |
| 4.1 | `delete_profile` | Remove a profile | **Destructive, irreversible.** Refused while channels are linked. See Destructive tools. |
| 4.2 | `connect_channel` | Start / resume social connection | Start: `channel` + `profileSlug` → `connectUrl`, `elicitationId` (show `connectUrl` via the card in `connection-card.md`). Resume: `elicitationId` only, long-polls ~30s. Channels: `meta`, `tiktok`, `tiktok_one`, `youtube`. Status `already-linked` → see `unlink_channel`. |
| 4.2 | `list_channels` | Live connections on a profile | Returns `platform` + `platformAccountId`; empty list is a normal first-run state. Read before `unlink_channel`. |
| 4.2 | `unlink_channel` | Disconnect an account from a profile | **Destructive.** Needs `platform` (`instagram`, `facebook`, `tiktok`, `tiktok_one`) + `platformAccountId` from `list_channels`. Collected data is kept. See Destructive tools. |
| 4.3 | `add_hashtags` / `remove_hashtags` / `list_hashtags` / `list_available_hashtags` | Watch-list | Networks: `instagram`, `tiktok`. Per-row results. TikTok: 50 cap, eligibility gate, 7-day removal lock. |
| 5 | `search_calibrations` | Read brand memory | `q`, `kinds`, `keyPrefix`, `includeSuperseded`, `includeProposed`. If `unavailable`: stop, do not guess. |
| 5 | `append_calibration` | Write one fact | One active record per (kind, key). `key-exists` → supersede. `proposed` = recorded, not applied. |
| 5 | `supersede_calibration` | Replace a fact | Compare-and-set on `ifVersion` |
| 5 | `retract_calibration` | Withdraw a fact | Same standing as set |
| 5 | `get_brand_instruction` / `set_brand_instruction` | Brand's standing instruction to an agent type (e.g. `brand_safety`) | Prose, versioned, deduped |
| 6 | `list_post_search_fields` | Live field census for posts | Call before any `esFilter` on posts |
| 6 | `list_creator_search_fields` | Live field census for accounts | |
| 6 | `search_posts` | Posts by filter, optional semantic `queryText` | Filter-only is sub-100ms; semantic takes seconds. `aggs` on filter path only. |
| 6 | `search_creators` | Accounts by filter | No per-post fields here |
| 6 | `append_insights` | Write analyst findings | `runKey` per session; roles `account_review` (went_well / needs_improvement / action_item) |
| 6 | `search_insights` / `list_insight_search_fields` | Read back findings | Tenant-private |
| Content review | `search_calibrations`, `get_brand_instruction` (read only), `search_posts`, `search_creators`, `search_insights`, `append_insights`, `append_calibration` (lessons and hard rules the user saved), `lookup_posts` (one named post) | Reviews one post against a brief; reads prior reviews and feedback by `runKey` prefix `content-review-*` | Setup and lessons in `content-review.md`; interactive only |
| Readouts | `search_calibrations`, `search_posts` (+ `aggs`), `search_creators`, `search_insights`, `append_insights` | Daily and weekly readouts read prior runs by `runKey` prefix (`readout-daily-*`, `readout-weekly-*`) and write new findings | Setup calibrations in `readout.md`; unattended runs never ask or destroy |
| Avoid in onboarding | `lookup_creators`, `lookup_posts`, `start_business_discovery`, `search_creator_marketplace`, `get_job_status` | Start discovery work beyond the accounts Atlas already holds | Only on explicit user request. The one routine use is `atlas-account-analyst` in named-handle mode: the user typing a network and handle in Phase 6 is the approval, and the agent calls `lookup_creators` only when Atlas holds nothing for that handle or the record is over 24 hours old. `lookup_creators` has no status-check tool; re-call it with the same item to re-read a `fetching` result, and `creatorDeepAnalysis` defaults to `true` there, so recent posts come with the account. It rejects `profileSlug`; attribute with `asProfile`. The other routine use is `atlas-content-review` on a published post: pasting the link is the approval, and the agent calls `lookup_posts` once for that post only when Atlas does not hold it, with `creatorDeepAnalysis` left at its default `false`. A TikTok miss is a paid vendor call. |
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
| Post | `media.mediaUrl` | Full post image or video poster |
| Post | `media.thumbnailUrl` | Fallback thumbnail |
| Post | `instagram.permalink` / `url` | Link target |
| Post | `instagram.mediaProductType` | FEED / REELS chip (null on older posts) |
| Post author | `instagram.account.profilePictureUrl` | Profile picture, Instagram |
| Post author | `tiktok.account.profileImage` | Profile picture, TikTok |
| Creator | `instagram.account.profilePictureUrl`, `tiktok.account.profileImage` | Profile picture in `search_creators` |

CDN URLs expire. Render with `onerror` placeholders and note the expiry on the page.

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

**Read every page.** `limit 100` on `search_calibrations` is the page size, not a cap. Pass
each response's `nextCursor` back as `cursor` until none is returned, then filter. Lessons,
hard rules and superseded versions keep growing, so a single page can miss the records a
flow needs. A flow that finds its setup records missing only after reading every page may
report "setup needed".

Keys are `<namespace>:<slug>`, lowercase, e.g. `brand:summary`, `competitor:acme`,
`user:primary-contact`, `target:q4-awareness`.
