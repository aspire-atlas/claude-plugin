---
name: aspire
description: >
  Creative Intelligence for your brand on Aspire Atlas. Connect Instagram, TikTok, and
  YouTube, see what's working, benchmark competitors, and check brand safety. Find and brief
  creators, keep a campaign shortlist, review posts, track what creators say about you vs.
  competitors, and get daily, weekly, and quarterly reports shaped for whoever will act on
  them. Use for "/aspire", "/aspire agents", "get started with Atlas", "connect Atlas",
  "onboard my brand", "connect my Instagram", "what happened yesterday", "how did last week
  go", "schedule the weekly readout", "find creators for the campaign", "refill the
  shortlist", "vet these creators", "which of these creators should we approve", "we launch on the 14th and need creators", "review this post", "check this
  draft against the brief", "brand safety check on this post", "show @handle's full
  profile", "what are creators saying about us vs {competitor}", "best hooks to reuse as
  ads", "build a PPA pitch", "casting deck for partnership ads", "how did influencer do this
  quarter", "start the CAS campaign for {brand}", "where is the {brand} campaign", "pull the
  client's decisions", "record a reply", or "/aspire fee calculator".
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
| `sample` (also `sample {agent}`, `show me a sample`, `example`) | Run **Sample artifacts** below. No Atlas connection is needed, so skip the phases. |
| `fee calculator` (also `fees`, `pricing`, `rate card`, `creator rates`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **Fee calculator** below. Skip the other phases. |
| `cas campaign` (also `creator ad campaign`, `campaign manager`) | Run Phase 1 and Phase 2 + 3 only to confirm the connection and pick the brand profile, then run **CAS campaign** below. Skip the other phases. |
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
5. On a selection, first ask with `AskUserQuestion`, header "Sample": "Want to see a sample of
   what {agent} makes before running it?" Options: "Show me a sample first (Recommended)" / "Run
   it now". A sample runs **Sample artifacts** and then asks once more whether to run it for real.
   Then hand off to that agent's section of this skill rather than launching the
   agent straight from here. Those sections own the connection check, the profile, and the
   confirmations each agent needs:

   | Chosen agent | Hand off to |
   | ------------ | ----------- |
   | `atlas-profile-analyst` | Phase 1, then Phase 2 + 3 for the profile and handles, then Phase 6 (its target question first) |
   | `atlas-ad-reuse` | Phase 1, then Phase 2 + 3, then **Ad reuse** (its window, sources, and save questions first) |
   | `atlas-creator-profile` | Phase 1, then Phase 2 + 3, then **Creator profile** (it asks for the handle and network first) |
   | `atlas-creator-brief` | Phase 1, then Phase 2 + 3, then **Creator brief** (its three questions first) |
   | `atlas-creator-discovery` | Phase 1, then Phase 2 + 3, then **Creator discovery**, Setup if the campaign is new, then Run |
   | `atlas-creator-vetting` | Phase 1, then Phase 2 + 3, then **Creator vetting**, Setup if it has never run, then Run (it asks for the list first) |
   | `atlas-content-review` | Phase 1, then Phase 2 + 3, then **Content review**, Setup if it has never run, then Review |
   | `atlas-daily-insights-report` | Phase 1, then Phase 2 + 3, then **Readouts**, Run with the daily cadence |
   | `atlas-weekly-insights-report` | Phase 1, then Phase 2 + 3, then **Readouts**, Run with the weekly cadence |
   | `atlas-market-signal` | Phase 1, then Phase 2 + 3, then **Market signal**, Setup if it has never run, then Run |
   | `atlas-quarterly-signal` | Phase 1, then Phase 2 + 3, then **Quarterly signal** |
   | `atlas-ppa-pitch` | Phase 1, then Phase 2 + 3, then **PPA pitch** (its questionnaire first) |

   Older names still reach the renamed agents: `atlas-account-analyst` is `atlas-profile-analyst`,
   `atlas-daily-readout` is `atlas-daily-insights-report`, and `atlas-weekly-readout` is
   `atlas-weekly-insights-report`. A launch that names `atlas-profile-analyst` with `target_mode`
   `reuse` means `atlas-ad-reuse`, which took over reuse mode. A scheduled task or message that
   names an old agent launches the new one; offer once, in an interactive session, to update the
   task's prompt and name.

   An agent on disk that is not in that table: run Phase 1 and Phase 2 + 3, then launch it
   with the tool prefix, `profile_id`, `profile_slug`, the linked handles and networks, and `recipient`
   (**Reading the ask**), and relay
   whatever it asks the main thread to confirm.

Listing needs no Atlas connection, so do not run Phase 1 and do not render a connector card
before the question; run Phase 1 only once an agent is picked. If the `agents/` folder is
missing or empty, say so in one line and stop; never invent an agent and never offer one that
is not on disk.

---

## Reading the ask (every request has two users)

The person typing is the **requester**. The person who acts on the output is the
**recipient**, often on another team. Before launching any agent, read who the output is for,
what they decide with it, and when, and pass that to the agent as `recipient`. Full rules, the
team catalog, and how agents render for a lens are in `references/recipient-lens.md`.

1. **Infer.** Match the ask's words against the catalog's cues, and take any reader, meeting,
   or date the user names ("for Thursday's product review"). Pick a primary lens and, when a
   hand-off applies (Performance then Creative; Campaign then Brand), a second one.
2. **Confirm in one line.** One `AskUserQuestion`, header "For", in the same call as the
   flow's first question when there is one. Word it as the guess ("This reads like it's for
   the product review. Should I track it weekly and add a messaging view for PMM?"). Options:
   the guess (Recommended), one or two other lenses from the cues, "Just for our team". Skip
   it when the user named the reader and the decision, when this conversation already
   confirmed a lens for the same kind of ask, or when the ask is the team's own routine ("run
   the daily"). Never ask in plain text, never twice for one request, never in an unattended
   run (saved lenses or `team`).
3. **Route by lens** when the ask names no flow:

   | Primary lens | Ask shape | Flow |
   | ------------ | --------- | ---- |
   | `product`, `pmm` | What creators say about the brand vs. competitors | **Market signal**, then offer to schedule it weekly and add the lens to the weekly readout |
   | `product`, `pmm` | How our own accounts compare | Phase 6, mode `own` |
   | `leadership` | This quarter, QBR | **Quarterly signal** |
   | `leadership` | This week | **Readouts**, weekly, with the lens |
   | `growth` | Which creators drive results, where to spend | **Readouts**, weekly, with the `growth` lens, then offer lookalikes in **Creator discovery** |
   | `campaign` | A launch or dated campaign that needs creators | **Campaign plan** below |
   | `brand` | Is this post safe or on brand | **Content review** |
   | `brand`, `campaign` | Which creators on a list to approve | **Creator vetting** |
   | `performance`, `creative` | Hooks, ads, licensing, a cut list | **Ad reuse**; for one post, **Content review** with the ad reuse check |
   | `leadership`, `performance` | A pitch or casting deck for partnership ads, whitelisting, creators to license | **PPA pitch** |
   | `team` | Anything | The flow the ask names |

4. **Pass it on.** Every agent launch below includes `recipient` (the confirmed lens or lenses,
   primary first). Relay the agent's forward note as-is, so the requester can paste it to the
   reader.
5. **Keep the record.** From the first question of any flow that launches an Atlas agent, keep
   the running decision log and ask every agent for its audit trail block, per **Decision
   audit**.

**Campaign plan.** A launch ask ("we launch on the 14th and need creators") spans four agents.
Propose the sequence in the confirmation line ("I'll start a shortlist and brief for the
launch, then check drafts and run a daily pulse through launch week. Sound right?"), then run
it in order, each step through its own section and its own write confirmations: **Creator
discovery** (Setup for the campaign if new, then Run), **Creator brief** in campaign mode,
the pulse offer (**Readouts**, **Launch pulse**), and **Content review** as drafts arrive.

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

Three standing rules apply across phases: brand-facing calibration questions offer a web
research option whose findings are shown before anything is written (Phase 5), any
request to show posts or creators is answered visually with the post media and profile
pictures (Visual output, after Phase 6), and every page, creator card, and chart uses the
brand's saved theme when there is one (**Theme**). Every creator is shown with the creator
card (`references/creator-card.md`), in chat or on a page.

After onboarding, these flows hang off the same connection: the **Creator brief** (a weekly or
campaign content plan with creators), the **Creator discovery** (a standing creator shortlist
per campaign, schedulable), the **Creator vetting** (approve, maybe, or reject a list of
creators from an Aspire export or pasted handles, interactive only), the **CAS campaign** (a
creator ad campaign conducted through the slate, rates, and brief gates, with **Rates and
terms** for step 13), the **Content review** (one post or draft checked against its
brief, interactive only), the **Readouts** (daily and weekly performance digests with a launch
pulse and a section per reader, schedulable), the **Market signal** (what creators say about
the brand vs. competitors, schedulable), and the **Quarterly signal** (the quarter's story for
leadership). The **Creator profile** gives one creator's full page on request, **Ad reuse**
ranks hooks and builds a cut list, and the **PPA pitch** builds a casting deck for paid
partnership ads. Every request is read for who will act on it first
(**Reading the ask**). Each is routed from its own
section below. The **Theme** section brands all of their pages,
and the **Fee calculator** sets the creator rates behind every fee they show.

---

## Phase 1: Confirm the Atlas connection

### 1.1 Detect

Check whether Atlas tools are available in this session before doing anything else.

1. Call `ToolSearch` with query `+Aspire_Atlas get_status` and `max_results: 20`.
2. Treat the connection as **live** when at least one returned tool name contains
   `aspire_atlas` or `atlas__` (case-insensitive). Typical patterns: `mcp__Aspire_Atlas__*`
   (bundled with this plugin or org-installed, the normal case), `mcp__plugin_aspire_Aspire_Atlas__*`
   on clients that namespace plugin servers, `mcp__claude_ai_Aspire_Atlas__*` for a connector
   added in claude.ai settings, or `mcp__atlas__*` from Claude Code. A bare `atlas` substring
   is not enough: it also matches Atlassian tools. Ignore any name containing
   `organization_admin`: that is the bundled admin connector, whose name also contains
   `aspire_atlas`, never the Atlas data connection. A match whose only tools are `authenticate`
   and `complete_authentication` is a copy that is not signed in. When several prefixes match,
   use the one that has `get_status`; if none has it, go to 1.3c.
3. If ToolSearch returns nothing, also scan the deferred tool list in context for the same
   patterns.
4. If still nothing and `ListConnectors` is available, call it **exactly once** with
   keywords `["aspire"]` only. Never include `atlas` as a keyword: it substring-matches
   Atlassian and puts an unrelated row on the card. This single call both returns the
   connector state and renders the "Connectors that could help" card with a Connect
   button. Do not call `SuggestConnectors` or `ListConnectors` again afterwards; every
   extra call renders a duplicate card.
   Safety filter: if the result still contains more than one entry, keep only the one whose
   lowercased, space-stripped name equals `aspireatlas` or `atlas` (so never
   `aspireatlasorganizationadmin`), and never mention the others. Classify the surviving entry:
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

Do not attempt to reach `https://atlas.aspire.io/mcp` with an HTTP client or a web fetch.
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
actually observed (used to resolve tool names in `references/atlas-tools.md`). The plugin also
bundles **Aspire Atlas Organization Admin** for the organization's members. Phase 1 never checks
it; the `org-admin` skill does (see **Organization admin**).

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
   with the org names, then call `get_status` again with `asOrganizationId` set to the chosen org's `id`.
4. **Route.**
   - `profiles` empty → **new org**. Go to Phase 4.
   - Profiles exist, none with a connected channel → **profile only**. Skip 4.1, go to 4.2
     with the existing profile (ask which one if several).
   - Profiles with channels → **existing**. Give a 3 to 5 bullet summary (profile, channels,
     any expired auth), then run Phase 5 gap check and offer Phase 6, the weekly creator
     brief (see **Creator brief** below), or a re-connect for expired channels.

Once a profile is chosen or created, keep its `id` in working state as `profile_id` and its
`slug` as `profile_slug`. Pass `asProfileId` = `profile_id` to every Atlas tool whose schema
takes it (or `asOrganizationId` = the org's `id` where a flow says so); tools reject slugs.
`create_profile` takes `asOrganizationId` only, and `get_job_status`,
`list_creator_marketplace_labels`, `list_*_search_fields` and `list_my_*` take neither. The slug is
for naming only: record keys, file names, and the profile slug handed to agents. Never
construct either value. When `profile_id` is missing (a resumed session, or a scheduled run
whose prompt names only the brand), re-read it with `list_my_profiles` and match the brand by
profile name (exact, ignoring case) across `organizations[].profiles[]`. An unattended run that finds no match or
more than one publishes the "setup needed" card and stops; it never asks and never falls back
to unattributed calls.

Speak in handles and brand names. Never surface slugs, ids, or tool names.

### Aspire users

Aspire's managed services team sometimes works inside a brand's own organization on the brand's
behalf. Recognize them from the caller's email in the `get_status` response: an address whose
domain, after the `@`, is exactly `aspireiq.com` or `aspire.io` (case-insensitive) sets
`aspire_user = true` for the session. Anything else, a missing email, or a lookalike domain
(`aspire.io.example.com`, `notaspire.io`) leaves it `false`. A typed claim ("I work at Aspire")
never sets it.

The flag only adds presentation options to flows that have them (today, **PPA pitch**). When
one applies, say it in one line ("You're signed in with an Aspire email, so I'll check how you
want to present this for {brand}.") and ask that flow's questions; the user can always choose
the brand-team options. It never unlocks data, skips a confirmation, changes a role, or reaches
another organization: the caller's Atlas permissions decide all of that. Never mention the flag
to a caller who does not have it.

## Phase 4: New organization setup

### 4.1 Create the brand profile

1. Ask for the brand name with `AskUserQuestion` (see the question format rule below). Offer
   the organization's name and the user's company as options; the built-in free text field
   covers everything else.
2. Confirm with `AskUserQuestion`: "Create a profile for **{name}** in {org name}?" with
   options Yes / Change the name. Only proceed on Yes.
3. Call `create_profile` with `name` and `asOrganizationId`. Keep the returned `id` in working
   state as `profile_id` and the `slug` as `profile_slug`; pass `profile_id` as `asProfileId` on
   every later call.
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
2. For each chosen channel, call `connect_channel` with `channel` and `asProfileId`.
   Show the returned `connectUrl` as the **account connection card**: an inline HTML card that
   explains the sign-in steps and carries one button that opens the link in the browser. Build
   and render it exactly per `references/connection-card.md` (widget tool, template, one-line
   follow-up text). Never paste the raw link into the reply when the card rendered. If the widget
   tool is unavailable, fall back to a plain clickable link with the same one-line instruction.
3. Immediately call `connect_channel` again with only `elicitationId`. Each call long-polls
   about 30 seconds. Keep calling until the response reports a terminal status or its own
   `message` says to stop and check with the user. Never stop on a fixed call count. Never
   restart with `channel` + `asProfileId` on a timeout; that issues a second link.
4. If status is awaiting-selection, render the follow-up variant of the connection card with
   `resultUrl` and the "Finish picking accounts" button (the original link cannot be reopened).
5. Terminal statuses:
   - `complete`: read `outcome`. Confirm each entry in `linkedAccounts` by handle, and list
     any discovered but unselected accounts as available to add later. With `outcome`
     `none-linked`, say plainly that nothing was connected; with `partially-linked`, name the
     accounts in `failedAccounts` and their `error`. A `failedAccounts` entry with `error`
     `already-linked` follows the already-linked steps below.
   - `denied-at-provider`: the link is dead. Say the provider declined, then start over with
     `channel` + `asProfileId` to issue a fresh link. This is the one case where a new start
     is correct.
   - Already linked (a `failedAccounts` entry with `error` `already-linked`, not a status): the
     account is connected to another profile in Atlas. Find the same `platformAccountId` in
     `discoveredAccounts[].accounts[]`: its `alreadyLinkedTo` names that profile (show this name)
     and `alreadyLinkedToProfileId` is its id. Call `list_channels` with `asProfileId` = that id to show the
     user which profile holds it, then `AskUserQuestion`: "Keep **@{handle}** on {other profile} (Recommended)" /
     "Move it to {brand}". Only on "Move it", confirm again per the Destructive tools table,
     call `unlink_channel` with `asProfileId` = `alreadyLinkedToProfileId` and the `platform`
     and `platformAccountId` from `list_channels`. Never pass `alreadyLinkedToSlug`.
     Then start `connect_channel` fresh. Never unlink without both steps; another team may be
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

- Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the end) with
  `asProfileId` = `profile_id`. Skip any question whose key is already occupied. Pass
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
- When the questions are done, and before Phase 6, make the theme offer from **Theme**, Offers,
  then the fee calculator offer from **Fee calculator**, Offers.

## Phase 6: First insights

Trigger once at least one channel reports linked, or whenever the user asks for an account
review. A request for one creator's full profile, portfolio, or deep dive ("full profile for
@handle") is not an account review: route it to **Creator profile** below. A request about
hooks, ads, licensing, or a cut list goes to **Ad reuse**; what creators say about the brand
against competitors goes to **Market signal**.

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
4. Launch the `atlas-profile-analyst` subagent with: `profile_id`, `profile_slug`, the tool prefix,
   `target_mode`, the handles and networks for that mode, `recipient` (**Reading the ask**;
   `team` during onboarding), and a digest of the Phase 5 calibrations. In mode `handle`, state that the user approved the fetch so the agent does not
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
6. Present the subagent's executive summary: headline, 3 to 5 insights with numbers, next
   week's three content pushes (mode `own`), 2 to 3 ranked next steps, data gaps. Offer the
   creator brief in one line when a push needs creators. In mode `handle`, lead the data gaps with the freshness the
   agent reports (indexed through {timestamp}, refreshed or not). Offer to go deeper on any
   item, and mention the findings are saved in Atlas and searchable later.
7. Deliver the summary visually per the **Visual output** rule below: a card view of the top
   and bottom posts with their media, and one chart of the engagement pattern the headline
   rests on. In mode `handle`, lead with the account's creator card inline, before the
   summary, rendered from the agent's `creator-cards` block. When the reviewed account is a
   creator, offer its full profile in one line after the summary (**Creator profile**).
8. Unattended run with no `AskUserQuestion` available: default to `own` mode and never start a
   lookup.

---

## Creator profile (full page for one creator)

Trigger when the user asks for one creator's full profile, portfolio, or deep dive, or what a
named creator would cost ("full profile for @handle", "show me @handle's portfolio"). Requires
a brand profile. The page is described in `references/creator-profile.md`, and its fees come
from the **Fee calculator**.

1. Read the target: one network and one handle with the `@` stripped. If the network is
   missing, ask with `AskUserQuestion` (Instagram / TikTok). Only those two are searchable in
   Atlas today; for YouTube, say so and offer the other two. A handle that is one of the
   profile's own linked handles is an account review (Phase 6, mode `own`), not a profile.
2. Naming the handle **is** the approval for fetching it from Atlas when the held data is
   missing or over a day old, as in Phase 6; neither the skill nor the agent asks again.
3. Launch the `atlas-creator-profile` subagent with the tool prefix, `profile_id`, `profile_slug`, the
   network and handle, any comparison accounts the user named, `recipient` (**Reading the
   ask**), and a note that the user approved the fetch. It writes nothing to Atlas, so it needs no write confirmation.
4. Show the creator card inline from the agent's `creator-cards` block, then the page link,
   then the agent's summary bullets and fee line. Never repeat the card's numbers in text.
5. If the agent reports a brand account, say so and offer an account review (Phase 6, mode
   `handle`). If it reports the handle could not be resolved, relay what was tried.
6. When the fees used the Aspire recommended rates, make the fee calculator offer from **Fee
   calculator**, Offers, after the reply.

---

## Ad reuse (hooks and cut lists)

Trigger when the user asks for the best hooks, which creator content to reuse or license as
ads, or clips and a cut list for editors ("pull the best hooks from last month's creator
posts", "send creative the good stuff to cut down"). Requires a brand profile with a linked
channel. Serves the `performance` and `creative` lenses, which hand off to each other, so
both are passed by default. Detail lives in `references/ad-reuse.md`. For one post, use
**Content review**, whose ad reuse check covers the same ground.

1. Ask once with `AskUserQuestion`, skipping what the user already said, in the same call as
   the **Reading the ask** confirmation: the window (last 30 days (Recommended), last 90 days,
   or typed), and the sources ("The brand's and creators' posts (Recommended)", "Only our own
   posts", "Only creators' posts about us"). Add the write confirmation as the last question:
   "Save the ranked candidates to Atlas?" (Save (Recommended) / Page only).
2. Launch `atlas-ad-reuse` with the tool prefix, `profile_id`, `profile_slug`,
   the linked handles and networks, `reuse_scope`, the window, any placements named,
   `recipient`, a digest of the brand's calibrations (competitors, red lines, partners), and
   whether the user approved the write. It reads only what Atlas holds.
3. Relay the page link, the top patterns, the top candidates as post cards per **Visual
   output**, and the rights line. Say plainly that usage rights for creator posts are not held
   in Atlas unless a brief or record says otherwise.

---

## Creator brief (weekly content plan with creators)

Trigger when the user asks for a content brief, a creator brief, what to post next week, a
plan for next week's content, creators to make it, or creators for a dated launch or campaign
(campaign mode). Requires at least one linked channel with indexed posts. Before launching,
settle three things with `AskUserQuestion` (skip any the user already answered), plus, in
campaign mode, the campaign (a saved `campaign:*-brief`, or "a new campaign", which runs
**Creator discovery** Setup first unless the user declines) and the first post date:

1. **Scope.** If a `red_line` calibration blocks AI generated content (ignore `review:` keys,
   which are content review only), offer "Strategy brief
   only (Recommended)" vs "Include draft copy (overrides the red line; record the exception
   first)". Never produce copy without the override.
2. **Creator sourcing.** "Already in Atlas", "Atlas creator marketplace (searches beyond
   your connected accounts)", or "Both". The marketplace path needs this explicit choice.
3. **Lookback and roles.** Default 90 days. Roles: collab posts, expert POV clips, customer
   features, event coverage (multiSelect).

Then launch the `atlas-creator-brief` agent with: tool prefix, `profile_id`, `profile_slug`, linked handles
and networks, `brief_mode` (`campaign` when the ask names a launch, date, or campaign;
otherwise `week`), target week (next Monday to Friday unless given) or the campaign slug, first
post date, and end date, `recipient` (**Reading the ask**), lookback, and the three answers. Relay its summary, the published page, and any decisions it needs (guideline
conflicts, budget tier). Show the first-pick creators inline as creator cards from the agent's `creator-cards` block. The agent writes action items back to Atlas as insights.

In campaign mode, after the brief, offer the launch pulse (**Readouts**, **Launch pulse**) and
say that each draft can go through **Content review** as it arrives.

---

## PPA pitch (casting deck for paid partnership ads)

Trigger when the user asks for a PPA pitch, a partnership ads or whitelisting pitch, a casting
deck, or creators cast against persona lanes for licensed ads ("build the pitch for round
two"). Works best with the brand's own profile; a linked channel helps the lanes but is not
required. Full
detail lives in `references/ppa-pitch.md`: the deck, the questionnaire (ids A to I), what Atlas
pre-fills, the build, export, and the state saved.

0. **Profile.** Use the brand's profile from Phase 2 + 3. When the organization has no profile
   for this brand, ask: "Create a {brand} profile so the pitch can be saved (Recommended)" (Phase
   4.1) or "Build it without one" (nothing is pre-filled or saved, and the agent gets `profile:
   none`). Never borrow another brand's profile.
1. **Read first.** Load the pre-fill digest the reference lists (calibrations, paged, and the
   insight prefixes) before the first question, so every recommended option comes from what
   Atlas holds and says so.
2. **Presentation.** With `aspire_user` (**Aspire users**), flag it in one line and ask A1 to
   A4 in one call. Otherwise use the brand-team defaults without asking.
3. **Frame, shape, casting.** Ask B (with the **Reading the ask** confirmation as B2), then C,
   then D, one `AskUserQuestion` call each, skipping what the user already said. B4 with no
   products held offers web research of the brand's own site; show what it finds before using
   it. A follow-up with nothing saved collects round {n}'s lanes with the reference's template.
4. **Plan.** Launch `atlas-ppa-pitch` in mode `plan` with the tool prefix, `profile_id`, `profile_slug` (or
   `profile: none` with `organization_id`, the `get_status` `organizations.selected.id`), the
   linked handles and networks, `presentation`, `recipient`, and the answers. Relay its lanes
   as a table and ask E per product, then F per lane, four per call. Changes go back to the
   agent in mode `plan` for that product or lane only. Ask its **Decisions needed** (names,
   product spelling, a term conflict) in the same calls.
5. **Production and commercials.** Ask G, then H (H2's figures in one plain message from the
   template, echoed back and confirmed), and end the last call with I, the save confirmation.
6. **Build.** Launch the agent in mode `build` with every answer and whether I approved the
   save. Show the link, three bullets (shape, cast, cost), and up to six cast creators as
   creator cards from its `creator-cards` block.
7. **Review, then export.** Ask the reference's Review question; changes run mode `revise` and
   ask again. Then ask the Export question. PowerPoint and Google Slides run mode `export`;
   Google Slides is the .pptx opened in Google Drive, or, with a Google Slides connector, a
   native build after its own confirmation. If the agent returns the PowerPoint step, invoke
   the session's PowerPoint skill yourself from the model it returns. No PowerPoint skill: say
   so in one line and offer what is possible.

Package prices (H2) are asked every run and never saved. Never offer the Aspire look, service
packages, or the agency voice without `aspire_user`.

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
   `review:` keys, which are content review only, nor `theme:` keys, which style pages), and from
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
Then launch `atlas-creator-discovery` with: tool prefix, `profile_id`, `profile_slug`, the campaign slug, the
brand handles and networks, run mode `interactive`, and `recipient` (**Reading the ask**;
`growth` when the ask is for more creators like the ones working). Relay its summary, the page link, and
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
name the brand by its exact Atlas profile `name` and the campaign slug, and state no date.

Unattended runs never ask questions and never record a verdict; if setup is incomplete they
publish a "setup needed" card and stop.

---

## Creator vetting (approve, maybe, or reject a list of creators)

Trigger when the user has a list of creators to decide on: a CSV export from Aspire, handles
pasted from an agency or an application form, or "the creators in our Aspire program" ("vet
these creators", "which of these should we approve", "screen these applicants"). Requires a
brand profile. Full detail - the setup interview, getting the list, the per-run questions, the
checks, the recommendation rule, the feedback loop, and the page - lives in
`references/creator-vetting.md`.

Vetting is interactive only. Never schedule it; if `AskUserQuestion` is unavailable, say in
one line that vetting needs a person to supply the list and make the call, and stop. For one
creator in depth, use **Creator profile**; to find new creators, **Creator discovery**.

### Setup: define what fit means, once, for everyone

1. Call `search_calibrations` (no filter, limit 100 per page, paged to the end,
   `includeSuperseded: true`). Setup is done when `vetting:criteria` and `vetting:thresholds`
   exist and `vetting:safety-scope` and `vetting:hard-rejects` are each saved or recorded as
   a `decline`. Then skip to **Run**. A run against a campaign's criteria needs only
   `vetting:thresholds`; ask it alone.
2. Otherwise ask the missing questions V1 to V4 from the reference, one `AskUserQuestion`
   each, in order, then confirm the batch once and write the records with
   `append_calibration`, `provenance: "interview"`. A `key-exists` follows the Phase 5
   supersede rule with its own confirmation.

### Run

1. **Get the list** per the reference, **Getting the list**, from the R1 answer (skip R1 when
   the user already attached a file or pasted handles). Pulling it from the Aspire app needs a
   browser tool in this session: the user signs in themselves, and the flow only reads. Show
   what was found (rows, handles per network, rows without a handle, the columns used) and
   the list name.
2. **Check what Atlas holds**: `search_creators` with a `terms` filter on the username field,
   one call per network.
3. Ask R2 to R4 in one `AskUserQuestion` call with the **Reading the ask** confirmation when
   it applies (`team` by default; `brand` for "are these safe"; `campaign` when the list is a
   launch lineup). Skip R3 when Atlas holds every creator. R3 "Fetch them" approves
   `lookup_creators` for exactly the missing handles; R4 is the write confirmation.
4. Launch `atlas-creator-vetting` with: tool prefix, `profile_id`, `profile_slug`, brand handles and
   networks, the normalized list, the list name, slug and source, the criteria source, the
   approved fetches, the R4 answer, and `recipient`. A list over 100 creators runs in batches
   of 100; say how many and launch them one at a time.
5. Relay the page link, the counts, and the approved creators and top maybes inline as
   creator cards from the agent's `creator-cards` block, badged with their page numbers. When
   R2 named a campaign, offer to add the approved creators to its shortlist per **Creator card
   actions**, "Add @handle on {network} to a campaign shortlist", with one confirmation for
   the batch.

### Feedback: save the team's call on each creator

Every run ends with feedback. When the agent reports "asked", relay what the user decided and
what was saved. When it returns a feedback packet, run F1 to F3 from the reference yourself,
before anything else in the conversation: F1 the team's call (saved as findings), F2 the notes
about particular creators (each saved as a `creator:*` calibration, worded in full before it
is saved), F3 a lesson for every future vetting. Offer each "Needs the main thread" change
through its own Destructive tools confirmation (`supersede_calibration` or
`retract_calibration`), one per call.

Feedback about a creator outside a run ("never use @handle again", "@handle was great to work
with") is saved the same way: word the note, confirm it with `AskUserQuestion` ("Save this
about @handle for future vetting and discovery?"), then write the `creator:*` record, or offer
the supersede when one exists.

---

## CAS campaign (creator ad campaign manager)

Trigger when the user asks to start, check, or move a creator ad campaign ("start the CAS
campaign for {brand}", "where is the {brand} campaign", "what's next on {campaign}", "send the
creators for approval", "pull the client's decisions", "record a reply", "send the details
emails", "send the briefs to creators", "log a delay"). Requires a brand profile with a linked
Instagram or TikTok channel. Full detail lives in `references/cas-campaign.md`: the page
vocabulary, the state model, the setup interview, the dispatch table, the gate packets, the
campaign page and its page data, creator details and shipping, the creator's turn on the brief,
and the unattended rules. Hook and CTA recommendations, and the hook review between rounds, live
in `references/hooks-and-ctas.md`.

The Campaign Manager conducts the campaign from approved concepts through sourcing, negotiation,
product shipping, and briefing. It reads where the campaign is, offers the single next step,
launches the agent or section that does the work, records the outcome, and sets the reminder.
It never does the heavy lifting itself. Several campaigns may be saved; ask which one with
`AskUserQuestion` when more than one is active.

Everything a person sees uses the reference's **Page vocabulary**: concepts, not lanes; the four
steps (Concepts approved, Creators approved, Fees approved, Briefs approved), not gates. The flow
never sends email and never connects to a mailbox, a sheet, or a slides file: the CM sends from
their own mail and pastes the replies.

### Setup

1. Call `search_calibrations` (no filter, limit 100 per page, paged to the end,
   `includeSuperseded: true`). If the campaign's setup records exist, skip to **Status**.
2. Otherwise start with C0 from the reference: "Where are the approved concepts for {brand}?"
   (the pitch saved in Atlas first when one exists, a Claude artifact link, a Google Slides link,
   or pasted text). Show each concept found in its own picker with "Keep (Recommended)" or
   "Change", then ask who approved them and when. C2, one concept per turn by hand, runs only
   when nothing was found. No approved concepts anywhere: say so in one line and ask the CM to
   confirm with the client first.
3. Ask C1 and C3 to C6, one `AskUserQuestion` each, in order. On C5 and C6, say plainly what each
   one approves: delivery without asking, and scheduled tasks for this campaign.
4. C7 confirms the batch once, then write every record with `append_calibration` and the Gate 1
   finding with `append_insights`. A `key-exists` follows the Phase 5 supersede rule with its own
   confirmation.

### Status

Read the setup records and the working state (`search_insights` on the campaign's prefix, paged).
Find the row in the reference's dispatch table, reading from the bottom up. Show one screen: the
row's status line, the four steps (1 Concepts approved, 2 Creators approved, 3 Fees approved, 4
Briefs approved) each with done and its date, now and its due date, or its planned date, the
creator counts by concept, anything marked your call needed, and the campaign page link. Then one
`AskUserQuestion`, header "Next": the row's next step first (Recommended), plus "Log a delay" and
"Change setup". Never offer more than one next step.

### Run

Launch what the row names, then record what came back. Every agent launch here also carries
the tool prefix, `profile_id`, and `profile_slug`:

- **Discovery** (rows 2 and 3): `atlas-creator-discovery` with the campaign slug, run mode
  `interactive`, `campaign_type` `creator-ads`, the lane to fill, and `recipient` (`campaign`).
- **Vetting** (row 4): `atlas-creator-vetting` with the lane's pool as the list (the lane's
  undecided candidates from discovery), the lane as the criteria source, and `recipient`
  (`campaign`, then `brand`). The Run picker is the write confirmation: "Screen the {concept}
  creators and save the results to Atlas?" If `vetting:thresholds` is missing, ask V2 from
  `references/creator-vetting.md` first and write it with its own confirmation.
- **Sending a step for approval** (rows 4, 7, 11): per the reference's **Gate packets**. The
  campaign page is the approval page; the CM shares it with the client as Contributor.
- **Pull the client's decisions** (rows 5, 8, 12, 15, and whenever the CM asks "what did they
  approve"): read the page data per the reference's **Pulling decisions**, show every approve,
  maybe and reject named with its reason, plus shipping, status and ad permission edits, and
  record them with one picker. A Maybe stays open on the page with a question back to the client.
- **Record a reply** (rows 7, 10, 14, or whenever the CM pastes one): per
  `references/rates-and-terms.md`, **Replies**. One picker proposes the record and the next move;
  a reply that changes what the client approved becomes "your call needed" for the client.
- **Rates** (row 6): **Rates and terms** below.
- **Send the details emails** (row 9): per the reference's **1f**. One draft per contracted
  creator, shown ready to copy; the CM sends them and says when they went.
- **Brief** (row 10): `atlas-creator-brief` with `brief_mode` `creator-ads`, the campaign slug,
  the round, the lanes, and `recipient` (`campaign`, then `creative`). Confirm the write first:
  "Write the round {n} briefs for {concepts} and save them to the campaign?"
- **Send the briefs to creators** (row 13): per the reference's **1g**. A changed brief from a
  creator goes back to `atlas-creator-brief` with `revision` for the differences in plain words,
  then to the client on the Briefs tab.
- **Production** (row 16): **Content review** for each draft. Once creators have posted, the
  hook review from `references/hooks-and-ctas.md`, run here in the main thread: it matches the
  creators' posts to the briefed hooks, shows which led, and saves the results after one
  confirmation, so the next round's briefs lead with what worked.

After each step, write the outcome per the reference, republish the campaign page with its page
data, post the step line when a step moved, and show the new status in one line.

### Schedule

Follow **Readouts**, Schedule, for the mechanics. After setup, offer the weekly call once with
`AskUserQuestion` ("Set up the weekly call agenda for {campaign} at {slot}?" Options: "Yes
(Recommended)" / "Not now"). Approval reminders need no offer: C6 approved them, so sending a
step creates its reminder and closing it removes it. Name tasks and write prompts as the
reference says. If the scheduled-task tools are missing, say so and stop; never fake a schedule.

Unattended runs never ask, never decide, never pull the page data, and never launch an agent.
They publish and post only, and publish a "setup needed" card when the records are missing.

---

## Rates and terms (CAS step 13 and Gate 3)

Reached from the **CAS campaign** dispatch table once creators are approved, or when the user
asks to draft fees, record a reply, or record the client's fee approval on a creator ad campaign.
Full detail lives in `references/rates-and-terms.md`.

1. If `campaign:{slug}-terms` is missing, ask T1 and T2, confirm the pair once, and write it.
2. Draft an opening offer for every approved creator, from the fee calculator (**Fee
   calculator**). Say on the page when the Aspire recommended rates were used.
3. Show the Fees tab and the offer drafts, then confirm saving the offers in one picker.
4. Keep one email draft on each creator's row per the reference's **Drafts** (offer, counter,
   accept, chase). The CM sends them from their own mail; mark them sent when the CM says so.
5. Record each pasted reply per the reference's **Replies**: one picker for the record and the
   next move. A fee above the maximum, a different deliverable, usage or product, or a creator
   dropping out goes to the client as "your call needed". A creator past their reply window gets
   a chase draft.
6. Record the client's fee approval per the reference's **Closing Gate 3**, read back from the
   page. Then the details emails start; contracts and shipping run in the core Aspire platform.

When the fees used the Aspire recommended rates, make the fee calculator offer from **Fee
calculator**, Offers, after the reply.

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
3. Launch `atlas-content-review` with: tool prefix, `profile_id`, `profile_slug`, brand handles and
   networks, `stage`, the normalized deliverable, the brief source, the post inputs, and
   `recipient` (**Reading the ask**: `brand` for "is this safe" or "approve"; `performance` or
   `creative` when the user asks whether it can run as an ad, which adds the ad reuse check). For a
   published post, state that the user approved fetching it.
4. Relay the verdict with its go or no-go, the required edits, the page link, and anything it
   could not check.
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

1. Call `search_calibrations` (no filter, limit 100 per page, paged to the end, `includeSuperseded: true`) with
   `asProfileId` = `profile_id`. If all six readout keys are present (`policy:readout-cadence`,
   `policy:readout-routing`, `guideline:readout-thresholds`, `guideline:readout-focus`,
   `policy:readout-escalation`, `guideline:readout-audience`), skip to **Run**. Tell the user
   in one line that the saved setup is being used and offer "Change setup" as an option on the
   run question.
2. Otherwise ask the missing questions R1 to R6 from `references/readout.md`, one
   `AskUserQuestion` each, in order. Daily and weekly are configured together in this one pass;
   the only per-cadence answer is the time in R1 and the readers in R6 (multiSelect: the
   first picked leads, each other gets its own section, and any may carry its own
   destination). Never ask in plain text. Never skip a question the user has not answered or declined.
3. On R2, state plainly that scheduled runs will post to the named Slack channel and email the
   named recipients without asking each time. That confirmation is the standing approval, and
   it covers any destination named on an R6 reader too; say so in the batch confirmation.
4. Confirm the batch once with `AskUserQuestion` ("Save these readout preferences for
   {brand}? Everyone on the team and every scheduled run will use them."), then write all
   answers with `append_calibration`, `provenance: "interview"`. A `key-exists` follows the
   Phase 5 supersede rule with its own confirmation.
5. If a teammate wants to change a saved answer, show current vs new and use
   `supersede_calibration` with the Destructive tools confirmation. One confirmation per key.

### Run

Ask once with `AskUserQuestion`: "Which insights report?" Options: "Weekly (last week)",
"Daily (yesterday)", "Both now", "Change setup". Then launch `atlas-weekly-insights-report` and/or
`atlas-daily-insights-report` with: tool prefix, `profile_id`, `profile_slug`, linked handles and networks, run mode
`interactive`, `recipient` (the lens **Reading the ask** confirmed, or the saved R6 lenses
when it found none), and the target window only if the user named one. Never pass "today" or any
date the main thread assumed: session headers can be a day stale, and a wrong "today" shifts
the whole readout by a day (or a week). The agents resolve the date themselves from the
shell clock in the brand's saved timezone and refuse a repeat window. Relay each agent's
summary and page link, including the resolved window it reports. When an agent asks the main
thread to confirm delivery, ask with
`AskUserQuestion` ("Post to {channel} and email {recipients}?" Options: Send (Recommended) /
Page only this time) and relay the answer.

### Launch pulse

While a campaign window is open, the daily readout adds a launch pulse: the campaign creators'
posts, mentions and tracked hashtags, how the launch is landing, and draft verdicts
(`references/readout.md`, **Daily launch pulse**). Offer it after a campaign brief, or when
the user asks how a launch is landing:

1. Ask in one `AskUserQuestion` call: the window (from the brief's first post date to its end
   (Recommended), or typed), the launch terms creators would use (options inferred from the
   campaign brief; free text for the rest), and who reads it (Campaign team (Recommended) /
   Product team / Both), with an optional destination typed per reader.
2. Confirm the write with `AskUserQuestion` ("Save a launch pulse for {campaign} from {start}
   to {end}? The daily readout, scheduled runs included, will add it and deliver to {destinations}
   without asking each time."), then write `campaign:{slug}-pulse` with `append_calibration`.
3. If the daily readout is not scheduled, offer **Schedule** below; the pulse rides on it.
   Readout setup must exist first.

### Schedule (two schedules, one pass)

After the first successful run, or whenever the user asks to schedule, offer with
`AskUserQuestion`: "Set up the recurring schedules now?" Options: "Yes, daily and weekly
(Recommended)", "Weekly only", "Daily only", "Not now". On yes:

1. Read the times and timezone from `policy:readout-cadence`. Convert to UTC cron. Daily
   `M H * * *`; weekly `M H * * D` (0 = Sunday). If the UTC conversion crosses midnight, shift
   the weekday too.
2. Create the scheduled tasks with the session's scheduled-task tools (Cowork: the
   `create_trigger` tool on the Claude Code Remote server; load it with `ToolSearch` first).
   Never use local cron tools; they die with the session. First list the existing scheduled
   tasks and look for ones named "Atlas daily readout: {brand}" or "Atlas weekly readout:
   {brand}" (the names before the rename). Offer to replace each in the step 3 confirmation:
   update its name and prompt in place when the tools allow, otherwise create the new task and
   delete the old one only after the new one exists. Never leave both running, which would
   deliver twice. One task per cadence:
   - Name: "Atlas daily insights report: {brand}" / "Atlas weekly insights report: {brand}".
   - Prompt: the standalone templates in the README under **Scheduling the readouts**, with
     `{brand}` filled with the profile's exact Atlas `name` (from `get_status`), and the handles
     and networks filled in. Runs find the profile by that name. The prompt must say "do not ask
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

## Market signal (what creators say about the brand vs. competitors)

Trigger when the user asks what creators are saying about the brand compared with
competitors, how the brand is talked about, share of voice, whether the brand is behind on a
feature, or to track any of that. Requires a brand profile; linked channels are not required,
because the conversation is other creators' posts. Full detail lives in
`references/market-signal.md`. It is not an account review: Phase 6 looks at accounts, the
market signal looks at the conversation.

### Setup: define the tracking once, for everyone

1. Call `search_calibrations` (no filter, limit 100 per page, paged to the end,
   `includeSuperseded: true`). If `market-signal:scope`, `-topics`, `-lenses`, `-routing`, and
   `-cadence` all exist, skip to **Run** and offer "Change setup" on the run question.
2. Otherwise ask the missing questions M1 to M5 from the reference, one `AskUserQuestion`
   each, in order. When **Reading the ask** already confirmed readers, preselect them as M3's
   recommended option. M1 offers the saved competitors; a competitor typed in is also
   offered as a new `competitor` record in the batch.
3. On M3 and M4, state that scheduled runs will post to the named destinations and save their
   findings to Atlas without asking each time. That is the standing approval for both.
4. Confirm the batch once ("Save this market signal setup for {brand}? Everyone on the team and
   every scheduled run will use it."), then write the records with `append_calibration`,
   `provenance: "interview"`. A `key-exists` follows the Phase 5 supersede rule.
5. Offer once to add the tracked hashtags to the watch list (`add_hashtags`, its own
   confirmation). Never required.

### Run

Launch `atlas-market-signal` with: tool prefix, `profile_id`, `profile_slug`, the brand handles and
networks, run mode `interactive`, `recipient` (the lenses from **Reading the ask**, else the
saved M3 lenses), and a window only if the user named one. Confirm the write before launching
in the same `AskUserQuestion` call as the lens ("Save the findings to Atlas?" Save
(Recommended) / Page only) and pass the answer. Relay the headline, the page link, and the
forward note. When the agent asks to confirm delivery, ask as in **Readouts**, Run. When it
names competitors Atlas does not index, offer an account review of each (Phase 6, mode
`handle`), which is the approved way to fetch one.

### Schedule

After the first successful run, if M5 is weekly, offer with `AskUserQuestion`: "Track this
weekly?" Options: "Yes, weekly (Recommended)" / "Not now". Follow **Readouts**, Schedule, for
the mechanics: UTC cron from `market-signal:cadence`, one task named "Atlas market signal:
{brand}", the prompt from the README under **Scheduling the market signal**, confirmed before
creating. When the weekly readout is set up, offer to add the `product` and `pmm` lenses to R6
so its page carries the parity and messaging sections from this run.

Unattended runs never ask, never start discovery, and publish a "setup needed" card when setup
is incomplete.

---

## Quarterly signal (the quarter's story for leadership)

Trigger when the user asks how the creator or influencer program did this quarter, for a
QBR, a quarter in review, or whether the program is working. Requires a brand profile. Full
detail lives in `references/quarterly-signal.md`.

1. Ask in one `AskUserQuestion` call, together with the **Reading the ask** confirmation
   (default `leadership`): which quarter (last completed quarter (Recommended), quarter to
   date, or typed dates or a fiscal quarter), and "Save the quarter's findings to Atlas?"
   (Save (Recommended) / Page only). If the user mentions spend, take the number as typed;
   never ask for it, and never estimate it.
2. Launch `atlas-quarterly-signal` with: tool prefix, `profile_id`, `profile_slug`, linked handles and
   networks, run mode `interactive`, `recipient`, the quarter, any spend given, and the write
   answer.
3. Relay the page link, the outcome line, the KPIs, and the forward note. When the data gaps
   name missing readouts, offer readout setup or scheduling so next quarter has them.

---

## Theme (brand colors, fonts, and logo on every page)

Trigger when the user asks to brand Atlas's pages, set up or change the theme, use the brand's
colors, fonts, or logo, or says the pages don't look like their brand. Requires a brand
profile. Full detail lives in `references/theme.md`: the interview, web discovery, the four
palettes, the preview widget, the record, and how every flow applies it.

The theme is brand memory, not session state. It is one `theme:brand` calibration, and every
page, creator card, and chart uses it, for every teammate and every scheduled run. Without
one, pages keep the Aspire default.

### Setup

1. Ask T0 to T4 from the reference, one `AskUserQuestion` each, in order, skipping any the user
   already answered (a named domain answers T1; typed hex codes skip discovery). T1's research
   option follows the Phase 5 web research rule. The findings go to the user as bullets with
   sources before any palette is shown, and nothing is written from them directly. Sources rank
   in this order: a design-token file the user pastes, then the site's own design tokens (the
   palette the site shows, or the one named after the brand), then colors ranked by how often
   the site uses them. The ranking is a last resort, because it blends every theme a site ships.
2. T2 compares the brand's own palette, as found, with three variations on it: Brand-forward,
   Quiet, and Complement. Each is shown in light and dark with the comparison widget, or on
   a published page when the widget tool is missing. Presets replace the four when there is no
   website. Never offer a palette that fails its contrast checks.
3. T5 is the write confirmation. Save with `append_calibration`, per the reference. A
   `key-exists` response follows the Phase 5 supersede rule with its own confirmation. Going
   back to the Aspire default is `retract_calibration`, with its own confirmation.

### Offers

Offer the theme at most once per session. Never offer it when `theme:brand` or
`decline:theme` exists, when the user is already running the theme, or in an unattended run.
Agents never offer it.

- At the end of Phase 5, before Phase 6.
- Before the first page-producing flow the user starts in a session: the creator brief,
  creator discovery, a content review, a readout, or a Visual output page.

Ask with `AskUserQuestion`: "Put Atlas's pages in {brand}'s colors? It takes about two
minutes." Options: "Set it up now (Recommended)", "Not now", "Don't ask again". "Not now" goes
on with the Aspire default. "Don't ask again" writes the `decline:theme` record, and the
answer counts as its confirmation, as with Phase 5 declines.

### Applying

Agents read `theme:brand` with their own calibration read and apply it. The main thread passes
nothing extra. The main thread applies it too, to every page and inline creator card it builds
itself, per **Applying the theme** in the reference. Semantic colors (verdicts, pass and fail,
ok and warn, above and below the baseline) never take brand colors.

---

## Fee calculator (creator rates for every fee)

Trigger on `/aspire:aspire fee calculator` (see **Arguments**), or when the user asks to set,
change, or check the brand's creator rates, CPM, or what the plugin offers creators. Requires a
brand profile. Full detail lives in `references/fees.md`: the calculation, the Aspire
recommended rates, the questionnaire, the record, and how every flow applies it.

The rates are brand memory, not session state. They are one `fees:rate-card` calibration, and
every creator fee the plugin shows uses them: the creator profile page, the creator brief, the
discovery shortlist, Draft Outreach, and any flow added later. Without one, flows use the
Aspire recommended rates and say so.

### Setup

1. Ask F0 to F4 from the reference, one `AskUserQuestion` each, in order, skipping any the user
   already answered (typed CPMs answer F3 and go straight to F4's result). F2's benchmark check
   follows the Phase 5 web research rule: findings go to the user as bullets with sources, and
   they are context only; they never change the rates by themselves.
2. F3 offers Aspire's recommended rates or the brand's own, built by adjusting Aspire's.
3. F5 is the write confirmation. Save with `append_calibration`, per the reference. A
   `key-exists` response follows the Phase 5 supersede rule with its own confirmation. Going
   back to Aspire's rates is `retract_calibration`, with its own confirmation.

Rates are refreshed only when someone runs the fee calculator again.

### Offers

Offer the fee calculator at most once per session. Never offer it when `fees:rate-card` or
`decline:fees` exists, when the user is already running it, or in an unattended run. Agents
never offer it.

- At the end of Phase 5, after the theme offer, before Phase 6.
- The first time in a session a flow shows the user a creator fee from the Aspire recommended
  rates: after that flow's reply, not before it.

Ask with `AskUserQuestion`: "Set {brand}'s creator rates? Fees on creator profiles, briefs,
shortlists and outreach will use them. It takes about two minutes." Options: "Set them up now
(Recommended)", "Later", "Don't ask again". "Later" goes on with Aspire's recommended rates.
"Don't ask again" writes the `decline:fees` record, and the answer counts as its confirmation,
as with Phase 5 declines.

### Applying

Agents read `fees:rate-card` with their own calibration read and apply it per **Applying the
rates** in the reference. The main thread passes nothing extra, and applies it the same way to
any fee it shows itself. No flow prices a creator any other way, and a fee the calculator
cannot compute is left out, never estimated.

---

## Sample artifacts (what an agent makes)

People decide whether to use an agent by seeing what it makes, not by reading its description.
Every Atlas agent has a `sample` mode that builds its real page from invented data, themed to the
most recent US holiday. Full rules are in `references/agents/sample-artifact.md`.

**When to offer.** Whenever someone asks what an agent does, what Atlas can do, or about a flow by
name ("what does the vetting agent do?", "what's a PPA pitch?"), answer in two or three plain
sentences, then ask with `AskUserQuestion`, header "Sample": "Would you like a sample
{page name} to see what it makes?" Options: "Show me a sample (Recommended)" / "Not now". For a
question about Atlas as a whole, ask which agent's sample to show instead, up to four agents as
options with the rest named in the question text. Ask at most once per agent per session, never
in the middle of a running flow, and never in an unattended run.

**Running it.** No Atlas connection, profile, or Phase 1 is needed, and nothing is confirmed,
because nothing is written. Launch the agent with `mode: sample` and the line "Follow
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/sample-artifact.md`." Where plugin agents do
not load, launch a general-purpose subagent with "Read and follow
`${CLAUDE_PLUGIN_ROOT}/agents/{agent}.md` in mode `sample`, and
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/sample-artifact.md`", or follow both
yourself. Relay the link, the holiday used, and the line on what the real run adds, then ask once:
"Run {agent} for your brand?" Options: "Run it now (Recommended)" / "Not now". "Run it now" hands
off to that agent's section, starting at Phase 1.

Samples never offer the decision audit and keep no decision log.

---

## Decision audit (how a piece of work was decided)

Any Atlas agent's work can be audited: a page that records every step, question and answer, tool
call, judgement, and open decision behind it. The instructions live in
`references/agents/decision-audit.md`; they are not a registered agent.

**While a flow runs (interactive sessions):**

- Keep `decision-log.md` in the session's scratch folder from the moment the request arrives in
  any flow that launches an Atlas agent, one line per step in the format in the reference, each
  starting with a UTC timestamp read from the shell clock (`date -u +%Y-%m-%dT%H:%M:%SZ`), never
  guessed: the request (`[start]`), every `AskUserQuestion` when asked and when answered, every
  tool call the main thread makes, every agent launch and return, every page published, every
  decision raised, and the finish (`[end]`).
- End every agent launch message with: "Finish with the audit trail block in
  `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/decision-audit.md`." Keep each block the
  agent returns; never show it to the user.

**The offer.** When an agent's real work (never a sample) ends in a published page (a deck, a brief, a shortlist, a
review, a readout, a profile), and after the flow's own follow-up questions, ask once with
`AskUserQuestion`, header "Audit": "Would you like an audit of the decisions and tools behind
{page title}?" Options: "Build the audit page (Recommended)" / "Not now". Ask again after a later
revision or export of the same work only if the user built an audit for it; then the update
option is "Update the audit page". Never ask in an unattended run; scheduled runs keep no log.

**Building it.** Launch a general-purpose subagent with: "Read and follow
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/decision-audit.md`.", then the inputs the
reference lists (`flow`, `brand`, `request`, the decision log path, every audit trail block in
order, the published pages, the run's scratch folder, the open decisions, and an earlier audit
page for the same work when updating). In a session without a subagent tool, follow the reference
yourself. Relay the page link and the gaps it reports. The audit writes nothing to Atlas and needs
no write confirmation.

---

## Organization admin (members)

Questions about who is in the organization, pending invitations, or inviting a teammate
belong to the `org-admin` skill (`/aspire:org-admin`). Hand off by invoking it with the
`Skill` tool, passing the organization name when it is already known, and resume here
afterwards if onboarding was in progress. This skill never calls the Aspire Atlas
Organization Admin connection itself.

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
  pull, the sections, and the leave-out rules. The one exception is a single creator's full
  profile page (`references/creator-profile.md`), which carries the same card at full width.

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
- A single creator's full profile or portfolio ("full profile for @handle") → the creator
  profile page (`references/creator-profile.md`), built by the `atlas-creator-profile` agent
  (**Creator profile**). It is the only other creator layout, and it is a page only.

**Mechanics:**

- Build a single self-contained HTML page and publish it with the Artifact tool when the
  session has it (load `artifact-design`, and `dataviz` for any chart, first). Apply the saved
  theme to the page, its charts, and its creator cards per `references/theme.md`, **Applying
  the theme**. Inline creator cards take the card override from the same section. Fall back to
  `SendUserFile` with the rendered HTML, or inline image links in the reply, when Artifact is
  absent.
- Media URLs come from `cdn.aspire.io`, which neither inline widgets nor published pages can
  load. Embed every image as a data URI with the snippet in `references/creator-card.md`,
  **Images** (inline profile for widgets, page profile for pages), which sizes each image to its
  rendered box at 2x from the full-size source and sets its `width` and `height`. Give every image an `alt` of
  the caption excerpt, and keep an `onerror` placeholder tile with the format chip for images
  the snippet could not fetch. Note once in the page footer that images are a snapshot.
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
   naming one specific post of theirs from Atlas and the campaign when there is one. A fee is
   only the open offer from the fee calculator (`references/fees.md`) for the campaign's
   platforms, or the channel the card shows; when it cannot be computed, write `[fee]`. Never
   state a date or a product the calibrations do not hold; leave a bracketed blank.
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
  The exceptions: Phase 6 named-handle mode, where the user named the account; content
  review, where pasting a post link approves `lookup_posts` for that one post; creator
  vetting, where R3 approves `lookup_creators` for the listed handles Atlas does not hold; the
  PPA pitch, where D4's marketplace option approves it for the handles the marketplace returns
  and the handles the user types; and creator discovery, whose saved cadence record approves it
  on every run including scheduled ones.
- **Inside a CAS campaign**, one picker confirms a whole gate batch: every accept and every
  reject is named in the question, and that one answer covers all the writes the close makes.
  The campaign's saved sync cadence (C6) is the standing approval for paid discovery on that
  campaign: the creator marketplace and paid lookups for its lanes, without asking again. The
  defaults for brand users everywhere else are unchanged.
- Keep every user-facing message short. Use bullets for anything with more than two points.
- Web research is a proposal, never a write: findings are always shown and confirmed before
  any calibration is recorded from them.
- Posts and creators are shown, not just described: see **Visual output**.
- Every agent launch carries `recipient` (**Reading the ask**). A lens changes what is
  selected, the order, and the wording, never a number, and never adds a claim the data does
  not support. What a reader needs that Atlas does not hold (spend, conversions, usage rights)
  is named as a gap, never inferred.
- The market signal, quarterly signal, ad reuse, and launch pulse read only what Atlas holds.
  They never start discovery work, interactive or unattended.
- Creator fees come only from the fee calculator (**Fee calculator**). No price is shown when
  the data behind it is missing.
- After an agent's work ends in a published page, offer the decision audit (**Decision audit**).
  The audit records what happened; it never re-decides, re-runs, or writes to Atlas.
