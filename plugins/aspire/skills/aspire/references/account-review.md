# Account review (Phase 6: first insights)

Used at the end of onboarding, for any account review the user asks for, and for the
`atlas-profile-analyst` hand-off.

## Phase 6: First insights

Trigger once at least one channel reports linked, or whenever the user asks for an account
review. A request for one creator's full profile, portfolio, or deep dive ("full profile for
@handle") is not an account review: route it to **Creator profile**. A request about
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
   `team` during onboarding), `onboarding: true` when this is the first run at the end of onboarding, `run: unattended` for a scheduled run, and a digest of the Phase 5 calibrations. In mode `handle`, state that the user approved the fetch so the agent does not
   ask again. State that the calibrations are for classification and relevance only: a named
   account is never benchmarked against the brand's own account or the brand's competitors.
   It is compared against its **own** peers — accounts the user named, or "like" accounts in the
   same category and follower band, on rates rather than raw counts. Pass any comparison
   accounts the user named.
5. The subagent reads with `search_posts` / `search_creators` (calling
   `list_post_search_fields` first for the live field census), resolves and refreshes a named
   handle with `lookup_creators` when Atlas holds nothing or the record is over 24 hours old,
   then writes findings back with `append_insights` under one `runKey` per run (`own`:
   `onboarding-{profile}-{date}` for the onboarding run, else `account-review-{profile}-own-{date}`; `handle`: `account-review-{profile}-{handle}-{date}`).
6. Present the subagent's executive summary: headline, 3 to 5 insights with numbers, next
   week's three content pushes (mode `own`), 2 to 3 ranked next steps, data gaps. Offer the
   creator brief in one line when a push needs creators. In mode `handle`, lead the data gaps with the freshness the
   agent reports (indexed through {timestamp}, refreshed or not). Offer to go deeper on any
   item, and mention the findings are saved in Atlas and searchable later.
7. The reply in step 6 is the answer, in text, per **Visual output**. Draw nothing unasked:
   no card, no post media, no chart. In mode `handle`, cut the reply to the headline, up to
   three insights, the freshness line, the next step, and one link (the account's top post; the
   review has no page), and offer the rest of the summary in one line. Keep the agent's
   `creator-cards` block and `visual-data` block for later. When the user asks to see them: "show me the card" draws the
   account's card per `creator-card.md`, **Cards in chat** (the host draws it from
   `lookup_creators` on the reviewed handle, which Atlas holds after this review); "show the
   posts" does the same with `lookup_posts` on the top and bottom posts; "chart it" builds a
   page with the engagement pattern the headline rests on. When the reviewed account is a
   creator, offer its full profile in one line after the summary (**Creator profile**).
8. Unattended run with no `AskUserQuestion` available: default to `own` mode, never start a
   lookup, and write nothing to Atlas; the agent returns the findings and pushes only.
