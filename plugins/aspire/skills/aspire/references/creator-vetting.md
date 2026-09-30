# Creator vetting reference

Shared by the `atlas-creator-vetting` agent and the **Creator vetting** section of SKILL.md.
Holds the setup interview, getting the list, the per-run questions, the checks, the
recommendation rule, the feedback loop that saves what the team says about each creator, the
state written to Atlas, and the page.

## Why the vetting agent exists

Creator discovery finds creators. Vetting starts from a list the team already has: applicants
to a program, creators a teammate exported from the Aspire app, a list an agency sent over.
Each creator on it needs a call, fast: approve, reject, or look closer. The agent checks every
handle for brand fit and brand safety against the brand's saved calibrations, recommends
**Approve**, **Maybe**, or **Reject** with the evidence behind it, and asks the team for its
own call. What the team says about a creator is saved as a calibration, so the next vetting
run, creator discovery, and every teammate start from it. The recommendations are saved as
insights, so a creator vetted once is never vetted blind again.

Vetting is interactive only. A person supplies the list and a person makes the final call.

## Setup: define what fit means, once, for everyone

Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the
end, `includeSuperseded: true`) and skip any question whose key is already occupied. Write
answers with `append_calibration`, `provenance: "interview"`, `statement` under 280 characters,
prose in `detail`.

| # | Question (via `AskUserQuestion`) | Options | kind | key | detail |
| - | -------------------------------- | ------- | ---- | --- | ------ |
| V1 | What makes a creator a fit for {brand}? | Three starters drawn from `brand:summary`, `brand:business-context`, and any `campaign:*-criteria` already saved (for example "Home cooks who teach, 10K to 250K followers, US"); the free text field carries the real answer | `guideline` | `vetting:criteria` | `{concern: "requirement", appliesTo: ["creator-vetting"], body: "<one line per dimension: archetype and audience, networks, size band, market, content>"}` |
| V2 | Where should the lines sit between Approve, Maybe, and Reject? | 1) Approve at 70 and up, Maybe from 50 to 69, Reject under 50 (Recommended); 2) Stricter: Approve at 80, Maybe from 60; 3) Looser: Approve at 60, Maybe from 40 | `guideline` | `vetting:thresholds` | `{concern: "ceiling", appliesTo: ["creator-vetting"], body: "approve >= <n>; maybe >= <m>"}` |
| V3 | How strict is the brand safety screen for creators? | 1) Standard: flag the industry brand-safety categories, reject only on our red lines (Recommended); 2) Family-safe: also flag alcohol, mild profanity, and risky stunts; 3) Our own list (type it) | `guideline` | `vetting:safety-scope` | `{concern: "requirement", appliesTo: ["creator-vetting"], body: "<scope>"}` |
| V4 | Which of these should reject a creator on their own? (multiSelect) | 1) A paid partnership with a saved competitor in the last 90 days; 2) Paid posts without a disclosure; 3) Engagement that looks bought; 4) No posts in the last 60 days | `guideline` | `vetting:hard-rejects` | `{concern: "requirement", appliesTo: ["creator-vetting"], body: "<one rule per line>"}` |

Rules:

- One `AskUserQuestion` per question, in order, never plain text. The tool adds its own free
  text field; never add "Other" or "Skip".
- V1 carries the web research option (SKILL.md Phase 5 rules) when the brand has no
  `brand:summary`. V3 and V4 may be declined; a declined question is written as kind
  `decline` with the same key, so it is never asked again. V1 and V2 cannot be declined.
- V3: call `get_brand_instruction` with `agentType: "brand_safety"` first. If an instruction
  exists, quote its first line in the question text and make option 1 "Use the saved brand
  safety instruction (Recommended)". Never call `set_brand_instruction` from this flow.
- Name the saved `red_line` and `competitor` records in V3's and V4's question text, so the
  user sees they already apply and only adds to them.
- Confirm the batch once with `AskUserQuestion` ("Save this vetting setup for {brand}? Every
  teammate's vetting will use it."), then write the records. A `key-exists` follows the
  Phase 5 supersede rule with its own confirmation. Calibrations are organization-wide; say so
  in the confirmation when the organization has more than one profile.

**Keys starting `vetting:` belong to creator vetting only**, like `review:` keys belong to
content review. Every other flow drops them.

## Getting the list

The main thread gets the list; the agent never asks for it. Three sources, offered in R1:

1. **Upload a CSV export from Aspire** (Recommended). The user attaches the file, or gives its
   path. Read it with the `Read` tool. Find the handle columns by header, case-insensitive:
   `instagram`, `instagram handle`, `instagram username`, `tiktok`, `tiktok handle`,
   `tiktok username`, `handle`, `username`, `social`, `profile url`, or a column whose values
   are profile URLs. Take the name column (`name`, `creator`, `full name`) for display only.
   An Excel file: ask for it saved as CSV. Show what was found before going on ("42 rows:
   38 Instagram handles, 11 TikTok handles, 3 rows with no handle") and which columns were
   used.
2. **Paste handles.** One per line or comma separated, `@handle`, a bare handle, or a profile
   URL. A bare handle with no network asks the network once for the whole list (Instagram /
   TikTok / Both).
3. **Pull the current list from the Aspire app.** Only when a browser tool is available in
   the session. Ask the user which list (a program, a campaign, a group), open the Aspire app
   in the browser, and let the user sign in themselves: never type, read, or store a password
   or a one-time code, and never sign in on their behalf. Once signed in, go to the list the
   user named and use the app's own CSV export when it offers one; otherwise read the handles
   off the table, page by page. Read only: never change a creator's status, send a message, or
   click anything that writes. No browser tool, or the sign in fails: say so in one line and
   offer options 1 and 2, with the steps to export the list as CSV from the Aspire app.

Normalizing, for every source:

- Strip `@`, whitespace, and URL parts (`instagram.com/{handle}`, `tiktok.com/@{handle}`);
  lowercase. Instagram and TikTok only; YouTube and other networks are listed as not vetted
  ("Atlas can't vet YouTube creators yet").
- One entry per network and handle. A creator with both handles is one row with two
  channels, vetted on each and recommended once (the weaker channel's safety counts).
- Drop the brand's own handles and say so. A saved `competitor` handle is recommended Reject
  without further checks.
- At most 100 creators per run, the Atlas lookup cap. A longer list is split into runs of
  100 in file order; say how many runs it will take, and run one at a time.
- Give the list a short name for the run and the page (the file name, the Aspire list name,
  or "pasted list"), and a slug from it, lowercase and hyphenated.

## Per-run questions

Asked by the main thread for every run, in one `AskUserQuestion` call when they fit (the tool
takes up to four questions), skipping any the user already answered.

| # | Question | Options |
| - | -------- | ------- |
| R1 | Where's the list of creators? | 1) Upload a CSV export from Aspire (Recommended); 2) Paste the handles; 3) Pull it from the Aspire app (you'll sign in yourself) (only when a browser tool is available) |
| R2 | Vet them against what? | 1) {brand}'s vetting criteria (Recommended); 2) The {campaign} campaign's criteria (one option per saved `campaign:*-criteria`, up to two) |
| R3 | {n} of these creators aren't in Atlas yet. Fetch them? | 1) Fetch them (Recommended) (description: "Atlas looks up each account and its recent posts. A TikTok account Atlas doesn't hold costs one paid lookup; {t} are TikTok."); 2) Only vet the creators Atlas already holds |
| R4 | Save the recommendations to {brand}'s Atlas insights? | 1) Save (Recommended); 2) Page only |

R3 is asked only after the main thread has checked which handles Atlas holds
(`search_creators` filtered on the username field, one call per network with a `terms`
filter on the whole list), and only when some are missing. R3 option 1 is the approval for
`lookup_creators` on exactly those handles, and the agent does not ask again. R4 is the write
confirmation for the recommendation findings; the feedback answers carry their own.

## The checks

Every check returns **Pass**, **Flag**, **Fail**, or **Can't check**, with the evidence it
rests on: a permalink with a quoted caption line, a transcript line, or a field and its
value. "Can't check" says what would make it checkable. Never guess from a bio alone what a
creator's posts show.

**What to read per creator.** `search_creators` for the account (followers, bio, country,
verification, contact fields, `analysis` fields the creator census lists).
`search_posts` filtered on the author username field, the last 90 days, sorted by posted
date desc, limit 50, projecting `postedAt`, `text`, `url`, `mediaKind`,
`instagram.mediaProductType`, the metrics, the partnership marker, `media` (container), the
network's `account` container, and `analysis.brandSafety`,
`analysis.commentSentimentBreakdown`, `analysis.transcript`, `analysis.overlayText` when the
census lists them. Fewer than 5 indexed posts in 90 days: widen to 180 days once.

### 1. Brand fit (the fit score, out of 100)

Scored against `vetting:criteria`, or the chosen campaign's `campaign:{slug}-brief` and
`-criteria` when R2 named one. Weights follow creator discovery's **Scoring** so a creator
scores the same in both flows:

| Component | Weight | Source |
| --------- | ------ | ------ |
| Audience and archetype fit | 30 | Bio, recent post topics, the criteria |
| Topic evidence | 25 | Posts matching the brand's or campaign's subject, cited by permalink |
| Engagement quality | 20 | Engagement rate against the creator's own size band, not a global average |
| Cadence and recency | 10 | Posts in the last 30 days; a dormant account is capped at 50 overall |
| Format match | 10 | `mediaKind` / `instagram.mediaProductType` mix vs. the formats the criteria name |
| Market fit | 5 | Country and language against the criteria |

A component with no data scores zero and is listed as missing. Also report, unscored: posts
that mention the brand (a warm lead), the estimated fee per `fees.md`, **Applying the rates**,
and the contact route Atlas holds.

### 2. Brand safety (every creator, every run)

- **Industry categories**, one line each: adult and explicit content; arms and ammunition;
  crime and harmful acts; death, injury, and military conflict; online piracy; hate speech
  and aggression; obscenity and profanity; drugs, tobacco, vaping, and alcohol; spam and
  harmful content; terrorism; debated sensitive social issues; misinformation. Use
  `analysis.brandSafety` as Atlas names the categories: a category rated anything but low risk
  on one post is a Flag, on three or more posts a Fail. Add your own read of captions and
  transcripts; cite the post. Fewer than 3 analyzed posts: the category screen is "Can't
  check" and says so.
- **Red lines.** Every `red_line` calibration, except `review:` keys, with its `action`:
  `block` fails the creator, `flag` flags it, `escalate` flags it and names the primary
  contact (`user:primary-contact`). One `search_posts` over the 90 days with `queryText` set
  to each `block` or `escalate` red line's body, limit 5, filtered to the creator. Each red
  line is its own check, and the page names the rule.
- **Scope.** `vetting:safety-scope` and the saved `brand_safety` brand instruction, when
  present, each line its own check.
- **Competitors.** Every `competitor` handle and its `spellingVariants` in captions and
  mentions. A paid partnership with a competitor in the last 90 days is a Fail when
  `vetting:hard-rejects` lists it, a Flag otherwise; an organic mention is a note.
- **Disclosure habits.** Posts with the partnership marker, or that tag a brand with
  `#ad`, `#sponsored`, or "paid partnership", against posts that read as paid without one. A
  paid post without disclosure is a Flag (a Fail when `vetting:hard-rejects` lists it).
- **Audience signals.** A negative comment share over 30% across analyzed posts is a Flag.
  A follower-to-engagement pattern that looks bought (a large account with engagement far
  under its size band, or sudden follower jumps the census shows) is a Flag, a Fail when
  `vetting:hard-rejects` lists it.
- **Earlier verdicts.** `search_insights` for `brand_safety` role findings on the creator's
  posts, and earlier content reviews of the creator (`content-review-{profile}` prefix,
  `detail.creator`). Cite them; never contradict one silently.

### 3. What the team already said

- `creator:{network}-{handle}` for the creator (see **Creator calibrations**), and the
  `partner` record when the creator is a saved partner.
- Every `vetting:lesson-*` record.
- The creator's newest earlier vetting (`creator-vetting-{profile}` prefix, newest record per
  `entityId`), with the team's call when a `feedback` finding holds one, and the creator's
  newest state in any discovery campaign (`creator-discovery-{profile}` prefix).

## The recommendation

In this order; the first rule that applies decides, and the page names it:

1. **Saved team call.** A `creator:*` record with stance `reject` → **Reject** ("Rejected
   under the team's saved call: …"). Stance `approve` → **Approve**, unless a check below
   fails that the saved call predates: then **Maybe**, naming what is new since.
2. **Hard stops.** A saved `competitor` handle, a `block` red line that fails, or a
   `vetting:hard-rejects` rule that fails → **Reject**.
3. **Not enough to go on.** The handle could not be resolved, or fewer than 5 posts in 180
   days → **Can't vet**, with the reason. Never reject a creator for missing data.
4. **Safety caps.** Any other Fail, a `flag` or `escalate` red line, or two or more Flags →
   at most **Maybe**.
5. **Fit score** against `vetting:thresholds` (default 70 and 50): **Approve** at or above
   the approve line, **Maybe** at or above the maybe line, **Reject** under it.

A `vetting:lesson-*` record can change how a check is judged; mark every call a lesson
changed ("Passed under saved lesson: …"). A lesson never relaxes a red line, a competitor, a
hard reject, or a saved team call on another creator. Every recommendation carries its top
two reasons in plain words, and every Maybe says what would settle it ("check their last 3
Reels for alcohol before approving").

## The feedback loop

Asked straight after the run, while the page is in view. The agent asks when
`AskUserQuestion` is available to it; otherwise it returns the feedback packet and the main
thread asks, before anything else happens in the conversation.

| # | Question | Options |
| - | -------- | ------- |
| F1 | What's your call on these {n} recommendations? Your answers are saved to Atlas. | 1) Agree with all of them (Recommended); 2) Change some (type them, for example "approve 4, reject 9: too much alcohol, maybe 12"); 3) Decide later (nothing is saved as the team's call) |
| F2 | Save these notes about creators for future vetting and discovery? (multiSelect; up to four per call, repeated until every note is covered) | One option per note, labelled "@handle: {stance}", the description giving the full note as it will be saved. |
| F3 | Save this for every future vetting: *"{lesson}"*? (only when a change generalizes) | 1) Save as a vetting lesson (Recommended); 2) Just these creators |

Rules:

- **F1 is its own write confirmation** for the team's calls, because its question text says
  so. Write one `feedback` finding per creator the user ruled on (option 1 rules on every
  creator with a recommendation; option 2 on the ones typed plus, when the user says so, the
  rest as recommended). Resolve the numbers against this run's page.
- **Creator notes.** Every creator the user overturned, and every reason the user gave about
  a creator ("never again, they deleted our post", "great, but only for Reels"), becomes a
  note. Word it yourself: the stance and the reason in one sentence, with the date. Show it in
  F2 before it is saved. Never save a note the user has not seen.
- **Lessons.** When a correction says "always", "never", "any creator", or the same kind of
  call is overturned for two or more creators in one run, word one lesson that generalizes it
  ("Mild profanity in comedy content is fine; flag it only in family content") and ask F3.
  If the correction targets a red line, a competitor, or a hard reject, write no lesson: say
  the rule itself would have to change, and list it under "Needs the main thread".
- Skip F2 and F3 when F1 is "Agree" with no reasons given, or "Decide later".
- **Changes to saved records belong to the main thread.** A note for a creator who already has
  a `creator:*` record, a lesson that contradicts a saved `vetting:lesson-*`, and any change to
  a red line, competitor, or setup answer go through `supersede_calibration` or
  `retract_calibration`, each with its own Destructive tools confirmation. The agent never
  calls either; it lists each under "Needs the main thread" (`key | current wording | proposed
  wording or "retract" | why`).

### Creator calibrations

One record per creator per network, organization-wide, read by vetting and creator discovery.

- kind `guideline`, key `creator:{ig|tt}-{handle}`: the handle lowercase with every
  character outside `a-z0-9` turned into `-`, the whole slug 48 characters at most. The exact
  handle is always in `statement` and `body`, because two handles can share a slug; on a
  `key-exists` whose body names a different handle, add `-2`.
- `statement`: "@{handle} ({network}): {stance}. {reason}", under 280 characters.
- `detail`: `{concern: "requirement" | "preference", appliesTo: ["creator-vetting",
  "creator-discovery"], body: "stance: approve | reject | maybe | note; handle: @{handle};
  network: {network}; reason: <the user's words>; runKey: <originating runKey>; saved:
  <YYYY-MM-DD>"}`. `requirement` for approve and reject (they decide the call), `preference`
  for maybe and note (they inform it).
- `provenance: "interview"`.

Creator discovery reads these: a creator with stance `reject` is never surfaced, as if the
campaign had rejected them, and any other stance is shown on the creator's card under
"Notes".

Lessons: kind `guideline`, key `vetting:lesson-{slug}`, `concern: "preference"` when it
relaxes a check and `"requirement"` when it tightens one, `appliesTo: ["creator-vetting"]`,
`body` = the lesson plus the originating `runKey` and one evidence line.

## State written to Atlas

`append_insights`, `runKey` `creator-vetting-{profile}-{YYYY-MM-DD}-{list-slug}`, role
`account_review`, `schema` = network, `entityKind` = `account`, `entityId` = the network's own
account id from the search hit (never a handle or uuid). Written only on R4 "Save", except the
F1 feedback findings, which F1 confirms. Instagram and TikTok only.

| Finding | Kind | `priority` | `findingType` |
| ------- | ---- | ---------- | ------------- |
| Approve | `went_well` | n/a | `recommendation` |
| Maybe | `action_item` | `medium` | `recommendation` |
| Reject | `needs_improvement` | n/a | `recommendation` |
| Can't vet, account held | `action_item` | `low` | `recommendation` |
| The team's call (F1) | `went_well` for approve, `needs_improvement` for reject, `action_item` `medium` for maybe | as the kind needs | `feedback` |
| Run summary | `action_item` | `low` | `summary` |

The run summary is anchored to the brand's own account on the first linked network and
carries the list name and source, the counts per recommendation, the handles that could not
be resolved or were not vetted, and the page link, so a run with unresolvable handles is
still on record.

`detail` carries `findingType`, `vettedAt` (full UTC timestamp from the shell clock, the same
on every finding of one run), `handle`, `network`, `name` (from the list, when given),
`recommendation`, `rule` (which rule of **The recommendation** decided it), `fitScore`, the
component breakdown, `safety` (`{category: result}` plus red line, scope, competitor,
disclosure, and audience checks), `redLineHits[]`, `hardRejectHits[]`, `riskFlags[]`,
`calibrationsApplied[]` (the keys that shaped the call), `lessonsApplied[]`, `evidence[]`,
`estFee` when the calculator gives one, `listName`, `listSource` (`csv`, `pasted`, or
`aspire-app`), `campaign` when R2 named one, `reviewPage`, and `recipient`
(`recipient-lens.md`). A `feedback` finding adds `userVerdict`, `agentVerdict`, and the user's
words verbatim. Supply an `idempotencyKey` per finding (`vet-{list-slug}-{entityId}-{findingType}`).

**Reading it back.** `search_insights` with a `prefix` filter on
`detail.account_review.runKey` = `creator-vetting-{profile}`, newest first, paged; the newest
record per `entityId` wins, and a `feedback` finding outranks a `recommendation` from the same
run.

## The page

One page per list, published to a new path per run; a re-run of the same list republishes to
the same path. Title "<Brand> Creator Vetting: {list name}". Sections:

1. **Header** with the "Prepared for" chip, the list name and source, the criteria used
   (brand or campaign), network chips, and counts: Approve, Maybe, Reject, Can't vet.
2. **Headline**: how many to approve and the one thing that decided the most rejects.
3. **Approve**, **Maybe**, **Reject**, **Can't vet**, in that order, each a grid of creator
   cards (`creator-card.md`, page mode, no actions) ranked by fit score, numbered from 1
   across the whole page because those numbers are what the user replies with. On each card:
   the fit score in the ring; flow chips `#{number}` and the recommendation; safety results
   in the brand safety tile per the card's **Brand safety** rule; `{DETAILS}` with the two
   reasons, what would settle a Maybe, the calibrations and lessons applied, an earlier
   vetting or discovery state, the contact route, and "Est. fee {open} to {max}, target
   {target}" when the calculator gives one.
4. **Safety summary**: a table of creators by category, only the rows with a Flag or Fail.
5. **Criteria and rules**: the criteria, thresholds, safety scope, and hard rejects in plain
   words, so a reader can see what fit meant.
6. **Not vetted**: handles that could not be resolved, other networks, the brand's own
   handles, with the reason for each.
7. **Footer**: sources, the fee rate label once, a note that images are a snapshot, and
   "numbers come from Atlas as of {timestamp}".

More than 12 creators: a chart leads the page (fit score against the recommendation lines,
or follower count against engagement rate, colored by recommendation). Images follow
`creator-card.md`, **Images**, page profile, cutting thumbnails per card before quality on a
large list. Load `artifact-design`, and `dataviz` for any chart, and apply `theme:brand` per
`theme.md`, **Applying the theme**. Approve, Maybe, and Reject keep their status colors under
any theme.

## Atlas quirks that apply here

`search_creators` carries no post-level fields, so every creator needs its own `search_posts`
call. `lookup_creators` takes up to 100 items per call, has no status-check tool (re-call with
the same items to re-read `fetching` ones, about every 15 seconds, up to roughly 3 minutes),
and rejects `profileSlug`; attribute with `asProfile`. Search indexing lags a lookup; re-run
the searches for fetched creators after it settles. `account-not-discoverable` is cached for 7
days: report it, never retry it. Project the `media` and `instagram.account` containers, not
leaf URLs; published pages cannot load `cdn.aspire.io` images, so embed them.
