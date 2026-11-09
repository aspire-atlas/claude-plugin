# Onboarding (Phases 4 and 5)

Used when Phase 2 + 3 routes to Phase 4 (a new organization, or a profile with no linked
account) or to Phase 5 (brand context). Phase 6 is `references/account-review.md`; SKILL.md's
**Sections** index routes to it.

## Contents

- [Phase overview](#phase-overview)
- [Progress bar: the onboarding groups](#progress-bar-the-onboarding-groups)
- [Phase 4: New organization setup](#phase-4-new-organization-setup)
- [Phase 5: Build brand context (shared brand memory)](#phase-5-build-brand-context-shared-brand-memory)

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

## Progress bar: the onboarding groups

When running the phases, report them as three groups,
one run each. A new `title` starts a new run, so each group's bar starts over at 0%. Send the
group's `tasks` in order when it starts, then call again as each task finishes with `done` and
`phase` naming the task in progress:

| Group | `title` | `tasks` | Runs |
| ----- | ------- | ------- | ---- |
| 1 | `Connecting` | `Verify Aspire Atlas` (Phase 1), `Get organizations`, `Pick the organization`, `Get status` (Phase 2 + 3) | Every run. Mark `Pick the organization` done at once when no question is asked; on a bare run it stays in progress while the selector waits. |
| 2 | `Onboarding` | `Create the brand profile` (4.1), `Connect a social account` (4.2), `Confirm the account` (4.2 terminal status) | Only when Phase 3 routed to Phase 4. Drop `Create the brand profile` when the profile exists. Skip the group for an existing org with a connected channel. |
| 3 | `Brand questions` | One task per Phase 5 question still to ask (skip keys already saved), then `Theme and rates offers` and `First insights` (Phase 6) | Optional. Start it only when Phase 5 runs. A declined question is marked done, not left open. |

Finish each group with `finished: true` before starting the next. A group that does not run is
never reported, so the bar never shows steps the run skips. Call it once more with
`finished: true` when onboarding closes, or when a routed flow takes over after Phase 2 + 3.

## Phase 4: New organization setup

### 4.1 Create the brand profile

1. Ask for the brand name with `AskUserQuestion` (see the **Question format rule** in SKILL.md). Offer
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
   TikTok first: those two are what search and hashtag tracking read today. For partnership
   ads, the `meta` sign-in should also link the brand's Meta Business: tell the user to pick it
   in the **Meta businesses** group. Partnership content needs it and the brand's Instagram on
   the same profile (`references/atlas-tools.md`, **Partnership content**).
2. For each chosen channel, call `connect_channel` with `channel` and `asProfileId`.
   When the host renders the tool's own connect widget (the result shows it), do not build a
   second card: say one line ("Use the button above to sign in to {network}.") and go to step 3.
   Otherwise show the returned `connectUrl` as the **account connection card**, built and
   rendered exactly per `references/connection-card.md`; never paste the raw link when the card
   rendered. If the widget tool is unavailable or fails, use its **Fallback** (plain text, never
   a Markdown link).
3. Immediately call `connect_channel` again with only `elicitationId`. Each call long-polls
   about 30 seconds. Keep calling until the response reports a terminal status or its own
   `message` says to stop and check with the user. Never stop on a fixed call count. Never
   restart with `channel` + `asProfileId` on a timeout; that issues a second link. When the
   `message` says to stop, follow the card's **Expired links** rule: say the link may have
   expired and offer a fresh one.
4. If status is awaiting-selection, show the card's follow-up variant (or its text fallback)
   with `resultUrl`; the original link cannot be reopened.
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
6. **Do not ask any brand context questions until at least one channel reports `complete`
   with at least one entry in `linkedAccounts`** (`outcome` `all-linked` or `partially-linked`).
   A `none-linked` result does not count.
   While polling, the only user-facing output is the connection card (once per link) and, if a poll times out,
   one short line such as "Still waiting on the {network} sign in." Never fill the wait with
   questions: the user is in another tab finishing the sign in. The one exception is the card's
   **Expired links** question, asked only when a poll's `message` says to stop.
7. When every requested channel has reached a terminal status, or the user chose to skip it
   (**Expired links** in the card's reference), proceed to Phase 5 if at least one channel is
   `complete` with a linked account. If none is, say nothing was connected and ask with
   `AskUserQuestion`: "Try connecting again (Recommended)" / "Connect later". "Connect later"
   ends onboarding here with one line: "Run /aspire:aspire when you're ready to connect an
   account." Never move on to Phase 5 without a linked account.

### 4.3 Seed the watch-list (optional, quick)

If the user names hashtags they care about during Phase 5, call `add_hashtags` with
`networks` for the connected channels. TikTok caps at 50 active tags and gates eligibility;
Instagram accepts any string. Report per-tag results, not a blanket success.

## Phase 5: Build brand context (shared brand memory)

Entry condition: Phase 4.2 finished with at least one `complete` channel that linked an account
(`linkedAccounts` not empty; `none-linked` does not count), or Phase 3 routed an existing org here. Never start before that.

Brand context lives in Atlas's calibration layer, not in local notes, so every future session
and every teammate inherits it. Ask each question with `AskUserQuestion`, one at a time, in the
order given in `references/onboarding-questions.md`. That file maps each answer to a
calibration `kind`, `key`, and `detail` shape, and supplies the option set for each question.

Ask every question per SKILL.md's **Questions and writes** (the question format rule and
follow-ups). The web research option below is the Phase 5 web research rule other flows cite.

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

- Before asking anything, call `get_brand_context` with `asProfileId` = `profile_id` and
  `includeSuperseded: true` (all applied records in one call; `truncated` true means page the
  rest with `search_calibrations`). When the tool is absent, call `search_calibrations` (no
  filter, limit 100 per page, paged to the end) with the same arguments. Skip any question
  whose key is already occupied; `includeSuperseded` keeps moved facts from being re-asked as
  new. `get_onboarding_form` is an optional read of which of the seven core questions are
  answered, declined, or open; never use its form to save: ask each open question with
  `AskUserQuestion` and write with `append_calibration` as below.
- Write each answer with `append_calibration` right after it is given, `provenance:
  "interview"` (or `"web"` per the web research option above), `statement` under 280
  characters, supporting prose in `detail`.
- Stop after the core set (about 7 questions) unless the user wants to keep going.
- When the questions are done, and before Phase 6, make the theme offer from **Theme**, Offers,
  then the fee calculator offer from **Fee calculator**, Offers.
