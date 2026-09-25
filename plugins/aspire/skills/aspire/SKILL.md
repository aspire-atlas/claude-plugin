---
name: aspire
description: >
  This skill should be used when the user types "/aspire:aspire" or "/aspire" (with or
  without an argument such as "agents", which lists the plugin's subagents and runs the one
  the user picks), says "get started with Atlas", "connect Aspire Atlas", "set up Atlas",
  "connect Atlas", "onboard my brand", "connect my Instagram/TikTok/YouTube
  to Atlas", asks how to start using the atlas.aspire.io platform, or asks for a daily or
  weekly readout ("what happened yesterday", "how did last week go", "schedule the weekly
  readout"), or asks to find or shortlist creators for a campaign ("creator discovery", "refill
  the shortlist", "find creators for the campaign"), or asks to review a post or a creator's
  draft against a brief ("review this post", "content review", "check this draft against the
  brief", "brand safety check on this post"), or asks to see a specific creator ("show me
  @handle", "who is @handle"), or sends a creator card action ("Draft outreach to @handle on
  Instagram", "Add @handle on TikTok to a campaign shortlist", "Save @handle on Instagram to the
  watch list", "show my watch list"). It verifies the Atlas data connection,
  authenticates and selects an organization, scopes the brand, connects social accounts,
  captures brand context for future sessions, delivers first insights, and routes recurring
  readouts, creator briefs, creator discovery, and content reviews.
metadata:
  author: Aspire
---

# /aspire: Atlas onboarding

Guide a new or returning user from zero to first insights on Atlas. Run the phases in order.
Never skip Phase 1 when running the phases. Stop and resolve any phase that fails before moving on.

Tone for all user-facing messages: brief, plain language, no jargon about tools or servers.
Refer to the connection as "Aspire Atlas" and the platform as "Atlas". Never expose internal
tool names. The slash command is `/aspire:aspire` (plugin namespace), so use that form in
any instruction that tells the user to re-run the skill.

The `agents` argument (`/aspire:aspire agents`) lists the plugin's subagents and offers to
run one; it starts no phase until an agent is picked.

## Arguments

Text after the command is the argument. Route on it before anything else:

| Argument | Action |
| -------- | ------ |
| `agents` (also `list agents`, `show agents`) | Run **List agents** below. Skip the phases unless the user picks an agent to run. |
| empty, or anything else | Run the phases in order, starting at Phase 1. Treat the text as context. |

### List agents

Report every subagent the plugin ships, then let the user run one. Read the list from disk each
time so it never goes stale; never recite it from memory.

1. Resolve the plugin's `agents/` folder from this skill's base directory: it is two levels
   up, at `<base>/../../agents/`. Use `Glob` for `agents/*.md` there.
2. For each file, read the frontmatter with `Read`. Take `name`, the first sentence of
   `description` (stop at the first period; ignore any `<example>` blocks), and the quoted
   "Trigger on ..." phrases when the description has them.
3. Reply with one bullet per agent, sorted by name, in this shape:
   `**aspire:{name}**: {first sentence}` followed on the same line by "Trigger: {phrases}".
   Skip the trigger part when the description has none.
4. Then ask with `AskUserQuestion`, one question, header "Agent": "Which one do you want to
   run?" One option per agent, in the same order as the bullets. Label is the agent name
   without the `aspire:` prefix; description is what it produces in one line plus what it
   needs (for example "needs a linked channel with indexed posts"). The tool takes 2 to 4
   options and adds its own free text field, so never add a "None" or "Not now" option: if
   the answer names no agent on the list, say nothing further and stop. With more than four
   agents on disk, offer the first four and say in the question text that any other name from
   the bullets can be typed into the free text field.
5. On a selection, hand off to that agent's section of this skill rather than launching the
   agent straight from here. Those sections own the connection check, the profile, and the
   confirmations each agent needs:

   | Chosen agent | Hand off to |
   | ------------ | ----------- |
   | `atlas-account-analyst` | Phase 1, then Phase 2 + 3 for the profile and handles, then Phase 6 (its target question first) |
   | `atlas-creator-brief` | Phase 1, then Phase 2 + 3, then **Creator brief** (its three questions first) |
   | `atlas-creator-discovery` | Phase 1, then Phase 2 + 3, then **Creator discovery**, Setup if the campaign is new, then Run |
   | `atlas-content-review` | Phase 1, then Phase 2 + 3, then **Content review**, Setup if it has never run, then Review |
   | `atlas-daily-readout` | Phase 1, then Phase 2 + 3, then **Readouts**, Run with the daily cadence |
   | `atlas-weekly-readout` | Phase 1, then Phase 2 + 3, then **Readouts**, Run with the weekly cadence |

   An agent on disk that is not in that table: run Phase 1 and Phase 2 + 3, then launch it
   with the tool prefix, `profile_slug`, and the linked handles and networks, and relay
   whatever it asks the main thread to confirm.

Listing needs no Atlas connection, so do not run Phase 1 and do not render a connector card
before the question; run Phase 1 only once an agent is picked. If the `agents/` folder is
missing or empty, say so in one line and stop; never invent an agent and never offer one that
is not on disk.

---

## Phase overview

| Phase | Goal | Status |
| ----- | ---- | ------ |
| 1 | Confirm the Atlas connection is live | Implemented |
| 2 | Authenticate and select organization | Implemented |
| 3 | Read current org status (new vs existing) | Implemented |
| 4 | New org: create profile, connect social accounts | Implemented |
| 5 | Capture brand context into shared brand memory | Implemented |
| 6 | Subagent evaluates connected accounts and produces first insights | Implemented |

Two standing rules apply across phases: brand-facing calibration questions offer a web
research option whose findings are shown before anything is written (Phase 5), and any
request to show posts or creators is answered visually with the post media and profile
pictures (Visual output, after Phase 6). Every creator is shown with the creator card
(`references/creator-card.md`), in chat or on a page.

After onboarding, four recurring flows hang off the same connection: the **Creator brief**
(weekly content plan with creators), the **Creator discovery** (a standing creator shortlist per
campaign, schedulable), the **Content review** (one post or draft checked against its brief,
interactive only), and the **Readouts** (daily and weekly performance digests, schedulable).
Each is routed from its own section below.

---

## Phase 1: Confirm the Atlas connection

### 1.1 Detect

Check whether Atlas tools are available in this session before doing anything else.

1. Call `ToolSearch` with query `+Aspire_Atlas get_status` and `max_results: 20`.
2. Treat the connection as **live** when at least one returned tool name contains
   `aspire_atlas` or `atlas__` (case-insensitive). Typical patterns: `mcp__Aspire_Atlas__*`
   (bundled with this plugin or org-installed, the normal case), `mcp__plugin_aspire_Aspire_Atlas__*`
   on clients that namespace plugin servers, or `mcp__atlas__*` from Claude Code. A bare `atlas`
   substring is not enough: it also matches Atlassian tools.
3. If ToolSearch returns nothing, also scan the deferred tool list in context for the same
   patterns.
4. If still nothing and `ListConnectors` is available, call it **exactly once** with
   keywords `["aspire"]` only. Never include `atlas` as a keyword: it substring-matches
   Atlassian and puts an unrelated row on the card. This single call both returns the
   connector state and renders the "Connectors that could help" card with a Connect
   button. Do not call `SuggestConnectors` or `ListConnectors` again afterwards; every
   extra call renders a duplicate card.
   Safety filter: if the result still contains more than one entry, keep only the one whose
   lowercased, space-stripped name equals `aspireatlas` or `atlas`, and never mention the
   others. Classify the surviving entry:
   - `enabledInChat: true` but no tools found: treat as a load glitch; call
     `RefreshMcpTools` once and retry step 1.
   - `enabledInChat: false`: state is **installed, not active here**. Go to 1.3b.
   - `connected: false`, `installState: needs_reconnect`, or `installState: unknown`:
     state is **needs sign in**. If `enabledInChat` is also false, 1.3b covers both steps.
     Otherwise go to 1.3c.
   - No surviving entry: state is **not installed**. Go to 1.3.
5. Only conclude **not installed** when every check above comes up empty.

**One card rule:** exactly one connector card per run, and always one. Every invocation of
`/aspire:aspire` or every "connected" reply that still fails detection renders a fresh card
via the single `ListConnectors` call, so the Connect button is always right above the
prompt. Never point the user at a card from an earlier message. The only thing to avoid is
a second call within the same run.

Always call the connector by its product name, **Aspire Atlas**, in every user-facing
message. Never surface raw field names, flags, or other connectors' names.

**Prefer the card over instructions.** When a connector card is on screen, the whole
user-facing message is one line pointing at it. Give the manual Settings steps only when no
card rendered (for example, `ListConnectors` is unavailable).

Do not attempt to reach `https://atlas.aspire.io/mcp` with curl, fetch, or any HTTP client.
The connection must come through the Claude connector, not an ad hoc request.

### 1.2 If live

- Load the core Atlas tools in one `ToolSearch` call (see `references/atlas-tools.md`
  for the tool list and load order).
- Tell the user in one line that Atlas is connected, then proceed to Phase 2.

### 1.3 If not connected: guided add

The Aspire Atlas connector ships inside this plugin, so a missing connection almost always
means it is not signed in or not enabled in this chat (1.3b and 1.3c). Only when the plugin's
own connector is absent from the connector list (uninstalled or blocked by an admin) send the
manual steps below with `SendUserMessage` (or in the reply), then wait. Never suggest adding a
second connector when an "Aspire Atlas" entry already exists; that creates a duplicate.

```
Aspire Atlas isn't connected yet. Two minute fix:

1. Open Settings in the Claude app, then Connectors.
2. If Aspire Atlas is listed, click Connect and sign in with your Atlas account.
   If it is not listed, choose Add custom connector:
   Name: Aspire Atlas
   URL: https://atlas.aspire.io/mcp
   Save, then click Connect and sign in.
3. Come back here and reply "connected" (or run /aspire:aspire again).
```

Adapt step 1 when the user is in Claude Code: give
`claude mcp add --transport http atlas https://atlas.aspire.io/mcp` and tell them to run
`/mcp` to authenticate.

### 1.3b If installed but not enabled in this chat

With a card on screen (the normal case):

```
Click Connect on the Aspire Atlas card above, sign in if asked, then reply "connected".
```

Fallback, no card rendered:

```
Aspire Atlas is installed but not active in this chat.

1. Open the connectors menu in the message composer and turn on Aspire Atlas.
2. If it asks you to sign in, go to Settings, then Connectors, then Aspire Atlas,
   and click Connect.
3. Reply "connected". If the toggle isn't offered, start a new chat with
   Aspire Atlas enabled and run /aspire:aspire again.
```

### 1.3c If installed but needs sign in

With a card on screen:

```
Click Connect on the Aspire Atlas card above and sign in with your Atlas account,
then reply "connected".
```

Fallback, no card rendered:

```
Aspire Atlas is installed but not signed in.

1. Open Settings, then Connectors, then Aspire Atlas.
2. Click Connect (or Reconnect) and sign in with your Atlas account.
3. Reply "connected" when done.
```

### 1.4 Re-check

When the user replies, or on the next `/aspire:aspire`, repeat 1.1.

- Live: continue to Phase 2.
- Still missing after the user says they added it: ask them to confirm the connector shows a
  green or "Connected" state in Settings, and to start a new chat if it was added mid session
  (some clients only load new connectors on a fresh conversation). Do not loop more than twice;
  after that, point them to Atlas support and stop.

### 1.5 Record outcome

Note the result for later phases: `atlas_connected = true|false`, and the tool name prefix
actually observed (used to resolve tool names in `references/atlas-tools.md`).

---

## Phase 2 + 3: Status, organization, and routing

Tool prefix: the one observed in 1.5 (for the org-installed connector it is `mcp__Aspire_Atlas__`).
Every Atlas tool requires a `context` argument: 15 to 25 words, third person, describing why the
call is being made. Write a fresh one per call.

1. Call `get_status` once. It returns organizations, the selected org, its profiles, and each
   profile's connected channels (including expired authorizations).
2. **Auth check.** An unauthorized error means the connector token lapsed: render one connector
   card (Phase 1 rules) with "Aspire Atlas needs a fresh sign in. Click Connect above."
3. **Organization.** One org: use it, name it once in the summary. Several: `AskUserQuestion`
   with the org names, then call `get_status` again with `asOrg` set to the chosen slug.
4. **Route.**
   - `profiles` empty → **new org**. Go to Phase 4.
   - Profiles exist, none with a connected channel → **profile only**. Skip 4.1, go to 4.2
     with the existing profile (ask which one if several).
   - Profiles with channels → **existing**. Give a 3 to 5 bullet summary (profile, channels,
     any expired auth), then run Phase 5 gap check and offer Phase 6, the weekly creator
     brief (see **Creator brief** below), or a re-connect for expired channels.

Speak in handles and brand names. Never surface slugs, ids, or tool names.

## Phase 4: New organization setup

### 4.1 Create the brand profile

1. Ask for the brand name with `AskUserQuestion` (see the question format rule below). Offer
   the organization's name and the user's company as options; the built-in free text field
   covers everything else.
2. Confirm with `AskUserQuestion`: "Create a profile for **{name}** in {org name}?" with
   options Yes / Change the name. Only proceed on Yes.
3. Call `create_profile` with `name` and `asOrg`. Keep the returned `slug` in working state as
   `profile_slug`; pass it as `asProfile` on every later call. Never re-derive it.
4. Re-sending the same name to the same org returns the existing profile rather than a
   duplicate, so a retry after a timeout is safe. If the returned slug carries a numeric suffix
   (`brand-2`), a different profile already owned the plain slug. Tell the user in one line; the
   display name is unaffected.
5. Renames (`update_profile`) change the display name only; the slug never changes. Say so
   before renaming and offer a fresh profile instead when the user wants a clean identifier.
6. **Deleting a profile** (`delete_profile`) is irreversible and removes its hashtags, brand
   instruction, and every calibration. Do it only when the user asks in this session, never
   during onboarding to "clean up", and only after the `AskUserQuestion` confirmation in
   `references/atlas-tools.md`, Destructive tools. A profile with linked accounts is refused by
   the server; do not unlink accounts to force a delete unless the user separately confirms
   that too.

### 4.2 Connect a social account

1. `AskUserQuestion`, multiSelect: which accounts to connect. Options: Instagram (channel
   `meta`), TikTok (channel `tiktok`), YouTube (channel `youtube`). Recommend Instagram or
   TikTok first: those two are what search and hashtag tracking read today.
2. For each chosen channel, call `connect_channel` with `channel` and `profileSlug`.
   Show the returned `connectUrl` as the **account connection card**: an inline HTML card that
   explains the sign-in steps and carries one button that opens the link in the browser. Build
   and render it exactly per `references/connection-card.md` (widget tool, template, one-line
   follow-up text). Never paste the raw link into the reply when the card rendered. If the widget
   tool is unavailable, fall back to a plain clickable link with the same one-line instruction.
3. Immediately call `connect_channel` again with only `elicitationId`. Each call long-polls
   about 30 seconds. Keep calling until the response reports a terminal status or its own
   `message` says to stop and check with the user. Never stop on a fixed call count. Never
   restart with `channel` + `profileSlug` on a timeout; that issues a second link.
4. If status is awaiting-selection, render the follow-up variant of the connection card with
   `resultUrl` and the "Finish picking accounts" button (the original link cannot be reopened).
5. Terminal statuses:
   - `complete`: confirm each entry in `linkedAccounts` by handle, and list any discovered
     but unselected accounts as available to add later.
   - `denied-at-provider`: the link is dead. Say the provider declined, then start over with
     `channel` + `profileSlug` to issue a fresh link. This is the one case where a new start
     is correct.
   - `already-linked`: the account is connected to another profile in Atlas. Call
     `list_channels` on that profile (if the response names it) to show the user which profile
     holds it, then `AskUserQuestion`: "Keep **@{handle}** on {other profile} (Recommended)" /
     "Move it to {brand}". Only on "Move it", confirm again per the Destructive tools table,
     call `unlink_channel` with the `platform` and `platformAccountId` from `list_channels`,
     then start `connect_channel` fresh. Never unlink without both steps; another team may be
     relying on that connection.
   - Any other failure: report the network's reason and offer to retry or continue with the
     other channels.
6. **Do not ask any brand context questions until at least one channel reports `complete`.**
   While polling, the only user-facing output is the connection card (once per link) and, if a poll times out,
   one short line such as "Still waiting on the {network} sign in." Never fill the wait with
   questions: the user is in another tab finishing the sign in.
7. When every requested channel has reached a terminal status, proceed to Phase 5.

### 4.3 Seed the watch-list (optional, quick)

If the user names hashtags they care about during Phase 5, call `add_hashtags` with
`networks` for the connected channels. TikTok caps at 50 active tags and gates eligibility;
Instagram accepts any string. Report per-tag results, not a blanket success.

## Phase 5: Build brand context (shared brand memory)

Entry condition: Phase 4.2 finished with at least one `complete` channel (or Phase 3 routed an
existing org here). Never start before that.

Brand context lives in Atlas's calibration layer, not in local notes, so every future session
and every teammate inherits it. Ask each question with `AskUserQuestion`, one at a time, in the
order given in `references/onboarding-questions.md`. That file maps each answer to a
calibration `kind`, `key`, and `detail` shape, and supplies the option set for each question.

**Question format rule (applies to every question in this skill):** every question goes
through `AskUserQuestion`, never as plain text in a reply. The tool requires 2 to 4 options, so
each question ships with a prepared option set from the reference file; the tool adds its own
free text field, so never add an "Other" or "Skip" option. Offer "Skip" only as a normal
option where the reference file lists it. Open questions (brand summary, competitors) still
get options: the options are starting points, and the free text field carries the real answer.
If a question truly has one path, state it and continue; do not ask.

**Web research option (brand-facing questions):** every question marked `web: yes` in the
reference file carries a "Research it on the web" option in its option set. When the user
picks it:

1. Run `WebSearch` / `WebFetch` on the brand's public footprint (its website, G2 or similar
   review sites, press, the linked social profiles). Keep it to 2 to 4 searches per question.
2. Share the findings with the user **before writing anything**: a 3 to 6 bullet summary with
   the source for each claim. Never write a calibration straight from search results.
3. Ask with `AskUserQuestion` whether to record the findings as stated, edit them (free text),
   or discard them. Only "record" or an edited version gets written.
4. Write with `provenance: "web"` and `sourceRef` set to the primary URL. If the user edited
   the findings, use `provenance: "interview"` instead, since the user now vouches for them.

Questions about the user or their team (role, team members, cadence, red lines) never offer
the web option; only the person can answer those.

Rules:

- Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the end) for
  `profile_slug`. Skip any question whose key is already occupied. Pass
  `includeSuperseded: true` so moved facts are not re-asked as new.
- Write each answer with `append_calibration` right after it is given, `provenance:
  "interview"` (or `"web"` per the web research option above), `statement` under 280
  characters, supporting prose in `detail`.
- `key-exists` on write: read the current record, show both versions, and call
  `supersede_calibration` with the record's `ifVersion` only if the user confirms the change.
- Outcome `proposed` means the user's role could not apply that kind. Say so in one line and
  move on; the suggestion is recorded for an admin.
- If the user declines a question, record it with kind `decline` so it is not asked again.
- Stop after the core set (about 7 questions) unless the user wants to keep going.

## Phase 6: First insights

Trigger once at least one channel reports linked, or whenever the user asks for an account
review.

1. **Pick the target.** Ask once with `AskUserQuestion`, header "Account": "Which account
   should the review cover?" Two options:
   - "{brand}'s connected accounts (Recommended)" - every handle linked to the profile.
   - "Another account" - description: "Type the network and handle, for example `instagram
     @acme`. Atlas fetches the account if it does not already hold it or the data is over a
     day old."
   Skip the question when the user already named a handle ("review @acme on TikTok"); treat
   that as the answer. Naming a handle, by option or in the message, **is** the approval for
   that fetch, because the option text says so; neither the skill nor the agent asks again.
   A free-text answer that names neither: ask once more, then stop.
2. Read the answer into a target:
   - Connected accounts: `target_mode` `own`, every linked handle and network from Phase 2 + 3.
   - Another account: `target_mode` `handle`, one network and one handle with the `@` stripped.
     If the network is missing or unsupported, ask for it with `AskUserQuestion` (Instagram /
     TikTok). Only those two are searchable in Atlas today; say so if the user names YouTube
     and offer the other two.
   - A typed handle that matches one of the profile's linked handles is `own` mode.
3. Mode `own` only: confirm data has landed with `search_posts`, `esFilter` on
   `author.username` for each linked handle, `limit: 1`. If empty, tell the user indexing is
   still running and offer to check back; do not run the analyst on nothing. Mode `handle`
   skips this check: the agent owns resolution and the freshness check.
4. Launch the `atlas-account-analyst` subagent with: `profile_slug`, the tool prefix,
   `target_mode`, the handles and networks for that mode, and a digest of the Phase 5
   calibrations. In mode `handle`, state that the user approved the fetch so the agent does not
   ask again. State that the calibrations are for classification and relevance only: a named
   account is never benchmarked against the brand's own account or the brand's competitors.
   It is compared against its **own** peers — accounts the user named, or "like" accounts in the
   same category and follower band, on rates rather than raw counts. Pass any comparison
   accounts the user named.
5. The subagent reads with `search_posts` / `search_creators` (calling
   `list_post_search_fields` first for the live field census), resolves and refreshes a named
   handle with `lookup_creators` when Atlas holds nothing or the record is over 24 hours old,
   then writes findings back with `append_insights` under one `runKey` per run (`own`:
   `onboarding-{profile}-{date}`; `handle`: `account-review-{profile}-{handle}-{date}`).
6. Present the subagent's executive summary: headline, 3 to 5 insights with numbers, 2 to 3
   ranked next steps, data gaps. In mode `handle`, lead the data gaps with the freshness the
   agent reports (indexed through {timestamp}, refreshed or not). Offer to go deeper on any
   item, and mention the findings are saved in Atlas and searchable later.
7. Deliver the summary visually per the **Visual output** rule below: a card view of the top
   and bottom posts with their media, and one chart of the engagement pattern the headline
   rests on. In mode `handle`, lead with the account's creator card inline, before the
   summary, rendered from the agent's `creator-cards` block.
8. Unattended run with no `AskUserQuestion` available: default to `own` mode and never start a
   lookup.

---

## Creator brief (weekly content plan with creators)

Trigger when the user asks for a content brief, a creator brief, what to post next week, a
plan for next week's content, or creators to make it. Requires at least one linked channel
with indexed posts. Before launching, settle three things with `AskUserQuestion` (skip any
the user already answered):

1. **Scope.** If a `red_line` calibration blocks AI generated content (ignore `review:` keys,
   which are content review only), offer "Strategy brief
   only (Recommended)" vs "Include draft copy (overrides the red line; record the exception
   first)". Never produce copy without the override.
2. **Creator sourcing.** "Already in Atlas", "Atlas creator marketplace (searches beyond
   your connected accounts)", or "Both". The marketplace path needs this explicit choice.
3. **Lookback and roles.** Default 90 days. Roles: collab posts, expert POV clips, customer
   features, event coverage (multiSelect).

Then launch the `atlas-creator-brief` agent with: tool prefix, `profile_slug`, linked handles
and networks, target week (next Monday to Friday unless given), lookback, and the three
answers. Relay its summary, the published page, and any decisions it needs (guideline
conflicts, budget tier). Show the first-pick creators inline as creator cards from the agent's `creator-cards` block. The agent writes action items back to Atlas as insights.

---

## Creator discovery (standing creator shortlist per campaign)

Trigger when the user asks to find creators for a campaign, refill or review a shortlist, ask
who to add, or schedule any of that. Requires a brand profile; linked channels help but are
not required, because discovery is not limited to them. Full detail - the setup interview, the
tier model, scoring, the pool state machine, the page, and the unattended rules - lives in
`references/creator-discovery.md`.

Creator discovery keeps a pool of undecided candidates at a saved target (default 50) for one named
campaign. It is not the creator brief: the brief plans one week and sources for it, the discovery agent
maintains a pipeline across weeks and teammates.

### Setup: define the campaign once, for everyone

1. Call `search_calibrations` (no filter, limit 100 per page, paged to the end, `includeSuperseded: true`). If the five
   campaign keys exist for the campaign in question (`campaign:{slug}-brief`, `-criteria`,
   `-pool`, `-routing`, `-cadence`), skip to **Run** and offer "Change setup" as an option on
   the run question. Several campaigns may be saved; `AskUserQuestion` which one when more
   than one is active.
2. Otherwise ask S1 from `references/creator-discovery.md`: what the campaign is, in the user's
   own words.
3. **Then write the refinement questions.** Read the S1 answer together with `brand:summary`,
   `brand:business-context`, and the `competitor`, `red_line` and `guideline` records (not
   `review:` keys, which are content review only), and from
   those compose 3 to 5 `AskUserQuestion` questions covering the dimensions the reference
   lists, in its order, skipping anything S1 already settled. The options are inferred from the
   brief and the brand context, never generic. Never ask more than five, never ask in plain
   text.
4. Ask S7 (pool target), S8 (routing) and S9 (cadence). On S8, state that scheduled runs will
   post to the named Slack channel and email the named recipients without asking each time. On
   S9, state that scheduled runs will search Atlas and the creator marketplace on their own to
   keep the shortlist full. Those two confirmations are the standing approvals.
5. Confirm the batch once with `AskUserQuestion` ("Save this campaign setup for {brand}?
   Everyone on the team and every scheduled run will use it."), then write all five records
   with `append_calibration`, `provenance: "interview"`. A `key-exists` follows the Phase 5
   supersede rule with its own confirmation.

### Run

Ask once with `AskUserQuestion`: "What should the discovery agent do?" Options: "Fill the shortlist to
{target}", "Show the current shortlist", "Record decisions on the shortlist", "Change setup".
Then launch `atlas-creator-discovery` with: tool prefix, `profile_slug`, the campaign slug, the
brand handles and networks, and run mode `interactive`. Relay its summary, the page link, and
the numbered range the user can decide against. Show the candidates added this run inline as
creator cards from the agent's `creator-cards` block (top six by fit score, badged with their
shortlist numbers).

**Recording decisions** stays in the main thread, never the agent. The user replies in their
own words against the page numbers ("keep 1, 3 and 4, drop the rest"). Resolve the numbers
against the newest run, confirm the batch once with `AskUserQuestion` naming the handles being
rejected, then write the verdicts with `append_insights` per the reference. Rejected creators
never reappear; accepted ones free their slot for the next run.

### Schedule (two schedules, one pass)

After the first successful run, or whenever the user asks, offer with `AskUserQuestion`: "Set
up the recurring discovery now?" Options: "Yes, discovery and shortlist (Recommended)", "Discovery
only", "Shortlist only", "Not now". On yes, follow the same mechanics as **Readouts**,
Schedule: read the times and timezone from `campaign:{slug}-cadence`, convert to UTC cron,
create one task per job with the session's scheduled-task tools, confirm both in one
`AskUserQuestion` before creating them, and tell the user the tasks run in fresh sessions so
Aspire Atlas must be enabled for scheduled tasks. Prompts must say "do not ask questions",
name the campaign slug, and state no date.

Unattended runs never ask questions and never record a verdict; if setup is incomplete they
publish a "setup needed" card and stop.

---

## Content review (one post against its brief)

Trigger when the user asks to review a post or a creator's draft, check content against a
brief, check whether a post is on brief, run a brand safety check on a post, or approve a
draft. Requires a brand profile. Full detail - the setup questions, the per-review questions,
the checks, the verdict rule, the feedback loop, and the page - lives in
`references/content-review.md`.

Content review is interactive only. Never schedule it, and never run it in an unattended
session: if `AskUserQuestion` is unavailable, say in one line that content review needs a
person to supply the post, and stop. Saved reviews still show up in the scheduled daily and
weekly readouts.

### Setup: calibrate the reviewer once, for everyone

1. Call `search_calibrations` (no filter, limit 100 per page, paged to the end, `includeSuperseded: true`). Setup is
   done when `review:verdict-rule` and `review:disclosure` exist and `review:brand-rules`
   and `review:safety-scope` are each either saved or recorded as a `decline`. Then skip to
   **Review**.
2. Otherwise ask the missing questions C1 to C4 from `references/content-review.md`, one
   `AskUserQuestion` each, in order. C3 carries the web research option (Phase 5 rules). A
   declined C3 or C4 is written as a `decline` record so it is never asked again.
3. Confirm the batch once with `AskUserQuestion` ("Save this review setup for {brand}? Every
   teammate's reviews will use it."), then write the records with `append_calibration`,
   `provenance: "interview"`. A `key-exists` follows the Phase 5 supersede rule with its own
   confirmation.

### Review

1. Ask P1 to P3 from the reference with `AskUserQuestion`, skipping any the user already
   answered (a pasted link answers P3; "Thursday's Reel" answers P2). Normalize the chosen
   deliverable per the reference, **Normalizing the brief**. For a draft, collect the caption
   and the local paths of the attached media. If a video comes without a transcript, say once
   that spoken content can't be checked without one, and accept one if offered.
2. Ask P4, the write confirmation. Run only on "Run the review".
3. Launch `atlas-content-review` with: tool prefix, `profile_slug`, brand handles and
   networks, `stage`, the normalized deliverable, the brief source, and the post inputs. For a
   published post, state that the user approved fetching it.
4. Relay the verdict, the required edits, the page link, and anything it could not check.
   Offer to draft the edit notes as a message to the creator. The notes are the agent's; do
   not add copy the brand's red lines forbid.

### Feedback: teach the next review

Every review ends with feedback. When the agent reports "asked", relay what the user decided
and what was saved, and ask no feedback question again. If its summary has a "Needs the main
thread" line, offer each change there through its own Destructive tools confirmation
(`supersede_calibration` or `retract_calibration`), one per call; the agent never makes
them. When it returns a feedback packet instead, run F1
to F4 from the reference yourself, before anything else in the conversation:

- F1: the user's call on the post. The answer is saved as a finding.
- F2 and F3: which calls were off, and the lesson to save. F2's options come from the
  packet's check lines. F3's "hard rule" option saves nothing itself: it adds the lesson to
  F4.
- F4: the proposed hard rules, one multiSelect. Its question text says hard rules apply to
  every content review in the organization and can block a post. Each selected rule becomes
  a `review:rule-*` red line.

Write each answer exactly as the reference says. If a correction targets a red line, a hard
rule, or the disclosure rule, or contradicts a saved lesson, offer to change that record
through its Destructive tools confirmation instead of saving a new one. Never save a lesson or a hard rule the user has not
seen worded.

---

## Readouts (daily and weekly performance digests)

Trigger when the user asks for a daily or weekly readout, "what happened yesterday", "how
did last week go", a weekly social report, a recurring digest, or to schedule any of these.
Requires at least one linked channel with indexed posts. Full detail, question set, and page
structures live in `references/readout.md`.

### Setup: calibrate expectations once, for everyone

Readout preferences are brand memory, not session state. Every teammate and every scheduled
run reads the same answers, so setup always runs through Atlas calibrations:

1. Call `search_calibrations` (no filter, limit 100 per page, paged to the end, `includeSuperseded: true`) for
   `profile_slug`. If all six readout keys are present (`policy:readout-cadence`,
   `policy:readout-routing`, `guideline:readout-thresholds`, `guideline:readout-focus`,
   `policy:readout-escalation`, `guideline:readout-audience`), skip to **Run**. Tell the user
   in one line that the saved setup is being used and offer "Change setup" as an option on the
   run question.
2. Otherwise ask the missing questions R1 to R6 from `references/readout.md`, one
   `AskUserQuestion` each, in order. Daily and weekly are configured together in this one pass;
   the only per-cadence answer is the time in R1 and the audience in R6. Never ask in plain
   text. Never skip a question the user has not answered or declined.
3. On R2, state plainly that scheduled runs will post to the named Slack channel and email the
   named recipients without asking each time. That confirmation is the standing approval.
4. Confirm the batch once with `AskUserQuestion` ("Save these readout preferences for
   {brand}? Everyone on the team and every scheduled run will use them."), then write all
   answers with `append_calibration`, `provenance: "interview"`. A `key-exists` follows the
   Phase 5 supersede rule with its own confirmation.
5. If a teammate wants to change a saved answer, show current vs new and use
   `supersede_calibration` with the Destructive tools confirmation. One confirmation per key.

### Run

Ask once with `AskUserQuestion`: "Which readout?" Options: "Weekly (last week)",
"Daily (yesterday)", "Both now", "Change setup". Then launch `atlas-weekly-readout` and/or
`atlas-daily-readout` with: tool prefix, `profile_slug`, linked handles and networks, run mode
`interactive`, and the target window only if the user named one. Never pass "today" or any
date the main thread assumed: session headers can be a day stale, and a wrong "today" shifts
the whole readout by a day (or a week). The agents resolve the date themselves from the
shell clock in the brand's saved timezone and refuse a repeat window. Relay each agent's
summary and page link, including the resolved window it reports. When an agent asks the main
thread to confirm delivery, ask with
`AskUserQuestion` ("Post to {channel} and email {recipients}?" Options: Send (Recommended) /
Page only this time) and relay the answer.

### Schedule (two schedules, one pass)

After the first successful run, or whenever the user asks to schedule, offer with
`AskUserQuestion`: "Set up the recurring schedules now?" Options: "Yes, daily and weekly
(Recommended)", "Weekly only", "Daily only", "Not now". On yes:

1. Read the times and timezone from `policy:readout-cadence`. Convert to UTC cron. Daily
   `M H * * *`; weekly `M H * * D` (0 = Sunday). If the UTC conversion crosses midnight, shift
   the weekday too.
2. Create the scheduled tasks with the session's scheduled-task tools (Cowork: the
   `create_trigger` tool on the Claude Code Remote server; load it with `ToolSearch` first).
   Never use local cron tools; they die with the session. One task per cadence:
   - Name: "Atlas daily readout: {brand}" / "Atlas weekly readout: {brand}".
   - Prompt: the standalone templates in the README under **Scheduling the readouts**, with
     the brand name, handles, and networks filled in. The prompt must say "do not ask
     questions" and "use the saved readout calibrations", and must not state a date; the
     templates tell the run to read the date from the shell clock.
   - Notifications: push on.
3. Confirm both tasks in one `AskUserQuestion` before creating them, listing name, local time,
   and destinations. Create only on the confirming option.
4. Tell the user: the tasks run in fresh sessions, so Aspire Atlas (and Slack or email, if
   routed) must be enabled for scheduled tasks in their Claude settings, and the task's
   approval setting should be "Automatically approve" or the run will stall on the first
   permission prompt. Mention the task can be paused or edited from the scheduled tasks list.
5. If the scheduled-task tools are not present in the session, do not fake it: point the user
   to the manual steps in the README and stop.

Unattended runs never ask questions; if setup is incomplete they publish a "setup needed"
card and stop (rules in `references/readout.md`).

---

## Visual output (posts and creators)

Whenever the user asks to see, show, list, rank, compare, or visualize posts, creators, or
performance, default to a visual deliverable. Text-only replies are the fallback, not the
default, and only when the user asks for text or the data has no media at all.

**Always include the visuals the data carries:**

- Posts: the post media (`media.mediaUrl`, falling back to `media.thumbnailUrl`) plus the
  author's profile picture (`instagram.account.profilePictureUrl` or
  `tiktok.account.profileImage`). Project these fields in `search_posts`.
- Creators: always the creator card in `references/creator-card.md`, which sets the fields to
  pull, the sections, and the leave-out rules. No other creator layout is used anywhere in the
  plugin.

**Default shapes:**

- 1 to 12 items → **cards**: media, handle with profile picture, format chip, date, caption
  excerpt, metric row (likes, comments, views or saves and shares), one-line takeaway, link to
  the post. Rank number when the request is a ranking.
- More than 12 items, or any question about trends, cadence, or format mix → **chart** first
  (bar for ranking, line for over time, small multiples for format or theme comparison),
  then cards for the top 3 to 5.
- Creators → creator cards. One to six render inline in chat with the action buttons; seven
  or more go on a published page without them. Comparisons of 3 or more creators add a bar
  chart of the comparison metric above the cards.
- A single creator the user names ("show me @handle", "who is @handle") → one inline creator
  card from what Atlas already holds. If Atlas holds nothing, say so and offer an account
  review (Phase 6, mode `handle`); never call `lookup_creators` just to draw a card.

**Mechanics:**

- Build a single self-contained HTML page and publish it with the Artifact tool when the
  session has it (load `artifact-design`, and `dataviz` for any chart, first). Fall back to
  `SendUserFile` with the rendered HTML, or inline image links in the reply, when Artifact is
  absent.
- Media URLs come from Instagram and TikTok CDNs and expire (Instagram typically within days).
  Reference them as `<img src>` with `loading="lazy"`, give every image an `alt` of the caption
  excerpt, and render a neutral placeholder tile with the format chip when the image fails
  (`onerror`). Note the expiry once on the page footer.
- Never fabricate an image. If a post has no media fields, show the placeholder tile, not a
  stock or generated picture.
- In the chat reply, give a 3 to 5 bullet readout of the numbers alongside the visual so the
  user can scan without opening it. For inline creator cards, the bullets add only what the
  card cannot show.

---

## Creator card actions

The inline card's buttons send these messages; users may also type them. Each message is a
request, never an approval: every write below is confirmed with `AskUserQuestion` first, and
unattended runs never act on them. Resolve the creator with `search_creators` on the handle
and network (never `lookup_creators`); if Atlas does not hold it, say so and stop.

**"Draft outreach to @handle on {network}"**

1. Read `brand:summary`, `brand:business-context`, `guideline:voice`, any `competitor` and
   `red_line` records (not `review:` keys), and any campaign the creator is in
   (`search_insights` on the `creator-discovery-{profile}` prefix, newest record for the
   creator's `entityId`).
2. Draft one message in chat: a subject line and a body under 120 words, in the brand's voice,
   naming one specific post of theirs from Atlas and the campaign when there is one. Never
   state a fee, a date, or a product the calibrations do not hold; leave a bracketed blank.
3. Name the contact route Atlas holds (`instagram.email`, `youtube.youtubeBusinessEmail`,
   Instagram partnership messages when `isPaidPartnershipMessagesEnabled`), or say there is
   none.
4. Never send. If a mail tool is connected and an email is known, offer with
   `AskUserQuestion`: "Keep it here (Recommended)" / "Save as an email draft". Only the second
   option creates the draft.
5. A `red_line` that blocks AI-written copy: give talking points instead of a draft and say
   why. A `competitor` handle: say it is saved as a competitor and ask before drafting.

**"Add @handle on {network} to a campaign shortlist"**

1. Instagram and TikTok only: discovery and the insights store take no other network. For
   YouTube, say so and stop before asking anything.
2. Find the campaigns: `campaign:*-brief` keys in `search_calibrations`. None: offer creator
   discovery setup and stop. Several: ask which one with `AskUserQuestion`.
3. Read the creator's newest record for that campaign (`search_insights` on the
   `creator-discovery-{profile}-{campaign}` prefix, the creator's `entityId`):
   - Already accepted: say so and stop.
   - Already undecided: say it is on the shortlist as #{number} and stop.
   - Rejected before: say when and why, then offer only "Accept onto the active list" and
     "Leave it rejected (Recommended)". A rejected creator cannot come back as a candidate,
     because discovery never re-surfaces one.
   - Not in the campaign: ask how, "Add to the active list (Recommended)" (`went_well`,
     accepted) or "Add as a candidate" (`action_item`, undecided, priority `medium`; the next
     discovery run scores it).
4. Write one finding with `append_insights` under that campaign's runKey for today, following
   `references/creator-discovery.md`, **State written to Atlas** and **Added by the team**,
   with `tier` `manual`, `source` `creator card`, and `idempotencyKey`
   `card-add-{campaign}-{entityId}-{YYYY-MM-DD}`. A new verdict never edits the old one.
   Republishing the shortlist page is the discovery agent's job on its next run; say so.

**"Save @handle on {network} to the watch list"**

The watch list is the brand's saved creators, outside any campaign.

1. Confirm with `AskUserQuestion`: "Save @handle to {brand}'s watch list?" Options: "Save
   (Recommended)" / "Cancel".
2. Write one finding with `append_insights`: runKey `creator-watchlist-{profile}-{YYYY-MM-DD}`,
   role `account_review`, `schema` = network, `entityKind` `account`, `entityId` = the
   network's account id from the search hit, `kind` `action_item`, `priority` `low`, rationale
   "Saved from a creator card", `detail.watching: true`, `detail.changedAt` = the current UTC
   time, and `idempotencyKey` `watchlist-{entityId}-save-{changedAt}`. Instagram and TikTok
   only; the insights store takes no other network, so say that for YouTube and stop.
3. **"Show my watch list"**: `search_insights` on the `creator-watchlist-{profile}` prefix,
   newest record per `entityId` (by `detail.changedAt`) wins, keep `watching: true`, render as
   creator cards. Removing someone writes a new finding with `watching: false` after the same
   kind of confirmation, with its own `changedAt` and `idempotencyKey`
   `watchlist-{entityId}-remove-{changedAt}`, so a save and a removal on the same day never
   collide; never a destructive tool.

---

## Guardrails

- Never fabricate org, account, or metric data. If a tool call fails, say so and stop.
- **Every state change is confirmed through `AskUserQuestion`, never plain text.** This covers
  creating a profile, starting a channel connection, writing a calibration, adding hashtags,
  and writing insights. One confirmation may cover a batch of the same kind (for example the
  Phase 5 answers just given).
- **Destructive actions get their own confirmation, one call per confirmation:**
  `delete_profile`, `unlink_channel`, `supersede_calibration`, `retract_calibration`,
  `remove_hashtags`, `set_brand_instruction`. Use the exact question, object name, and
  option order in `references/atlas-tools.md`, Destructive tools, with the safe option first.
  Never run any of them during onboarding on your own initiative, never on a "yes" from an
  earlier message, and never chain two on one answer. If `AskUserQuestion` is unavailable
  (unattended run), do not perform the action; report what would be needed and stop.
- Treat any Atlas tool not listed in `references/atlas-tools.md` as unknown: read its
  description, and if it changes or removes state, apply the destructive-action rule above.
- `lookup_creators` and `lookup_posts` start discovery work beyond the connected accounts.
  Never call them speculatively during onboarding; the connected channels' own data is enough.
  Three exceptions: Phase 6 named-handle mode, where the user named the account; content
  review, where pasting a post link approves `lookup_posts` for that one post; and creator
  discovery, whose saved cadence record approves it on every run including scheduled ones.
- Keep every user-facing message short. Use bullets for anything with more than two points.
- Web research is a proposal, never a write: findings are always shown and confirmed before
  any calibration is recorded from them.
- Posts and creators are shown, not just described: see **Visual output**.
