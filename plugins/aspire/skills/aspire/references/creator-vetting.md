# Creator vetting reference

Shared by the `atlas-creator-vetting` agent and the **Creator vetting** section of SKILL.md.
Holds the setup interview, getting the list, the per-run questions, the checks, the
recommendation rule, the feedback loop that saves what the team says about each creator, the
state written to Atlas, and the page.

The main thread's part of this flow, moved from `SKILL.md` (only pointers changed). A bold section name
in it (**Readouts**, **Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Creator vetting (approve, maybe, or reject a list of creators)](#creator-vetting-approve-maybe-or-reject-a-list-of-creators)
- [Why the vetting agent exists](#why-the-vetting-agent-exists)
- [Setup: define what fit means, once, for everyone](#setup-define-what-fit-means-once-for-everyone)
- [Getting the list](#getting-the-list)
- [Per-run questions](#per-run-questions)
- [Main thread: the run](#main-thread-the-run)
- [The checks](#the-checks)
- [The findings behind the checks](#the-findings-behind-the-checks)
- [The recommendation](#the-recommendation)
- [The feedback loop](#the-feedback-loop)
- [State written to Atlas](#state-written-to-atlas)
- [The page](#the-page)
- [Creator-ads lanes (CAS campaigns)](#creator-ads-lanes-cas-campaigns)
- [Atlas quirks that apply here](#atlas-quirks-that-apply-here)

## Creator vetting (approve, maybe, or reject a list of creators)

Trigger when the user has a list of creators to decide on: a CSV export from Aspire, pasted
handles, or "the creators in our Aspire program" ("vet these creators", "which of these should we
approve", "screen these applicants"). Requires a brand profile. Interactive only: never schedule
it; without `AskUserQuestion`, say vetting needs a person to supply the list and make the call,
and stop. One creator in depth is **Creator profile**; new creators, **Creator discovery**.
Before anything, read this file (**Setup**, **Getting the list**,
**Per-run questions**, **Main thread: the run**, **The feedback loop**) and follow it.

### Setup

V1 to V4, one at a time, one batch confirmation. A campaign's criteria need no setup. Every
question is asked exactly as worded in the reference, at most four per call (**Guardrails**). An
interactive run's reader and save choice go on `lastrun:creator-vetting`, or
`lastrun:creator-vetting-{slug}` for a campaign (**Orchestration contract**, **2**, Saved
answers).

### Run

Get the list (R1; the Aspire app only with a browser tool, the user signs in, read only), check
what Atlas holds, ask R2 to R5 at most four per call (R3 approves the fetches, R4 the write, R5
picks the visual check), then launch `atlas-creator-vetting` with the list, criteria source,
approved fetches, R4 answer, visual check, and `recipient`, in batches of 100 (25 with a visual
check). Relay the page and counts in text (cards only on request); offer the shortlist add.

### Feedback: save the team's call on each creator

Every run ends with F1 to F3, and F4 after a free-text visual check's last batch (the agent's or yours, before anything else). F1 confirms its own
write; notes are shown worded before saving. Supersedes and retractions are the main thread's,
one Destructive tools confirmation each. Feedback outside a run: "Save this about @handle for
future vetting and discovery?"

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
Never schedule it; if `AskUserQuestion` is unavailable, say in one line that vetting needs a
person to supply the list and make the call, and stop. For one creator in depth, use
**Creator profile** in SKILL.md; to find new creators, **Creator discovery**.

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

**When setup is done.** Setup is done when `vetting:criteria` and `vetting:thresholds` exist
and `vetting:safety-scope` and `vetting:hard-rejects` are each saved or recorded as a `decline`;
the main thread then skips to the run. A run against a campaign's criteria needs no setup: it
uses `vetting:thresholds` when saved, else the defaults (70 and 50), labelled as defaults. The
main thread may offer V2 alone; it is not required. Otherwise it asks the missing questions V1
to V4, one `AskUserQuestion` each, in order, then confirms the batch once and writes the records.

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
- At most 100 creators per run, the Atlas lookup cap, and 25 when a visual check runs. A longer
  list is split into runs of that size in file order, each with its own page; say how many runs
  it will take, and run one at a time.
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
| R5 | Run a visual check on each creator's videos? Type what to look for, or pick a saved check. (Over 25 creators, the question adds: "A visual check splits this list into {k} runs of 25, each with its own page.") | 1) No visual check (Recommended); 2) Product on screen: {product}; 3) and 4) the two newest active `vetting:visual-*` checks, each labelled with its name and described with its "look for" line |

R3 is asked only after the main thread has checked which handles Atlas holds
(`search_creators` filtered on the username field, one call per network with a `terms`
filter on the whole list), and only when some are missing. R3 option 1 is the approval for
`lookup_creators` on exactly those handles, and the agent does not ask again. R4 is the write
confirmation for the recommendation findings; the feedback answers carry their own.

R5 picks the visual check (**4. Visual check**). An option picked is a **named** check; words typed
in the tool's free text field are a **free-text** check, unless they match a saved check's name,
which then runs as that named check. When the user's ask already names something to look for
("which of these have an overweight dog"), skip R5 and use that, matched the same way and held to
the same limits as a typed check (**What a visual check may look for**). R5 is never
asked for a creator-ads lane run, which runs no visual check.

**What a visual check may look for.** Things on screen (a product, a pet, a setting, a prop), and a
person's appearance only when the brief's casting needs it (grey hair for a campaign cast for
older adults). Never a person's race or ethnicity, religion, health or disability, pregnancy,
sexuality, or body size or weight. When the typed check asks for one of these, say in one line that
vetting doesn't screen people on it, and run no visual check unless the user picks another. A check
about a person's appearance has its per-creator results shown on the page and never written to
Atlas: its findings leave out `visualCheck`, and the run summary names the check but leaves out its
counts. Its definition may still be saved as a named check (F4), since that describes what to look
for, not anyone's result.

## Main thread: the run

What the **Creator vetting** section of SKILL.md does around the agent.

1. **Get the list** per **Getting the list**, from the R1 answer (skip R1 when the user already
   attached a file or pasted handles). Show what was found and the list name.
2. **Check what Atlas holds**: `search_creators` with a `terms` filter on the username field,
   one call per network.
3. Ask R2 to R5 in `AskUserQuestion` calls of at most four questions, with the **Reading the ask**
   confirmation (SKILL.md) in the first. R2, R3, and R5 change what the agent reads, so they go
   with that confirmation, before the storyline draft. On a new page, R4 is answered by the storyline call's
   Save (**Orchestration contract**, **2**); on a rerun to a page already published, it joins this
   call when there is room. The confirmation applies (`team` by default; `brand` for "are these safe"; `campaign` when the list is
   a launch lineup). Skip R3 when Atlas holds every creator.
4. Launch `atlas-creator-vetting` with: tool prefix, `profile_id`, `profile_slug`, brand handles
   and networks, the normalized list, the list name, slug and source, the criteria source, the
   approved fetches, the R4 answer, `visual_check` (from R5: `none`, or `{name, kind: "named" |
   "free-text", key, definition}`, with `key` and `definition` from the saved record (`key` null for
   Product on screen and for a free-text check), the built-in
   definition for Product on screen, or, for a free-text check, the definition the main thread
   words once from the user's words before the first launch: what to look for, what counts, what
   does not), and `recipient`. A list over 100 creators runs in batches of 100, and a run with a
   visual check in batches of 25, since each creator's frames take room in the agent's context;
   say how many and launch them one at a time, every batch with the same `visual_check`. When the
   run log's last run of the agent had no visual check, the time estimate adds "a few minutes" for
   it, or the visual check's time from the last run that had one.
5. Answer in text: the counts, up to three points naming the approved creators and top maybes
   with their page numbers, the next step, and the page link. Keep the agent's `creator-cards`
   block; the cards appear only when the user asks to see them (**Creator card**, **Cards in
   chat**). When R2 named a
   campaign, offer to add the approved creators to its shortlist per SKILL.md **Creator card
   actions**, "Add @handle on {network} to a campaign shortlist", with one confirmation for the
   batch.

## The checks

Every check returns **Pass**, **Flag**, **Fail**, or **Can't check**, with the evidence it
rests on: a permalink with a quoted caption line, a transcript line, or a field and its
value. "Can't check" says what would make it checkable. Never guess from a bio alone what a
creator's posts show.

Run brand fit before brand safety for every creator, so the page shows how close a creator came
on fit before what safety found. Infer a trait from what the posts show, never from a number or
label the creator states: "mom of three" or "70% women" in a bio is a lead to check against the
posts, not evidence. A niche fandom or subculture the criteria name (a show, a game, a team) is a
theme, not a keyword: count the posts that are about it, whatever words they use, not only the
posts that contain its name.

**What to read per creator.** `search_creators` for the account (followers, bio, country,
verification, contact fields, `analysis` fields the creator census lists).
`search_posts` filtered on the author username field, the last 90 days, sorted by posted
date desc, limit 50, projecting `postedAt`, `text`, `url`, `mediaKind`,
`instagram.mediaProductType`, the metrics, the partnership marker, `media` (container), the
network's `account` container, and `analysis.brandSafety`,
`analysis.commentSentimentBreakdown`, `analysis.transcript`, `analysis.overlayText` when the
census lists them, and `analysis.narration` too when a visual check runs. Fewer than 5 indexed posts in 90 days: widen to 180 days once.

**The creator's usual views.** The median `viewCount` of the 90-day posts read above that carry
one. It needs at least 5 such posts; with fewer, the usual is "not available: {n} posts with a view
count in 90 days" and the creator's lifts are not measured. A post's **lift** is its views divided
by its author's usual ("3.6× usual views"). Work both out from the posts already read, never from a
new search. A creator whose read was widened to 180 days had too few posts for a usual, so has none.
The read stops at 50 posts, so for a creator who posts more than that in 90 days the usual covers
their newest 50; the page's key says so.

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

A component with no data scores zero and is listed as missing; the page shows it as "not
available: {reason}", never as 0 (**Page standard**, section 8). Also report, unscored: posts
that mention the brand (a warm lead), the estimated fee per **Fee calculator**, **Applying the rates**,
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

### 4. Visual check (when R5 names one)

A look at each creator's videos for one thing the brief cares about that captions and transcripts
don't show reliably: a product on screen, an overweight dog, grey hair. The run has one check. It
runs on every creator the run vets (the Approve, Maybe, and Reject cards and rows), and not on a
creator rejected as a saved competitor without further checks or one that is Can't vet; those show
"Not checked" on the page. A creator it runs on is **screened** once at least one video, or a cover
when no frame extractor is installed, was read; every screened creator gets a result, a confidence
word, and an evidence frame. These reads are approximate, and the page says so.

**Named and free-text checks.**

- A **named** check has a written definition, so two runs judge it the same way: what to look for,
  what counts as seen, and what does not. **Product on screen** is built in: {product} visible
  in frame, as packaging, its logo, or in use, where {product} is the product the criteria name,
  or, when they name none, any product carrying the brand's name or logo. A competitor's product,
  or the product only named in on-screen text, does not count. Every other named check is a saved `vetting:visual-{slug}` record (**Visual check
  records**).
- A **free-text** check is what the user typed at R5, with no saved definition. The main thread
  words one from the words before the first launch (what to look for, what counts, what does not)
  and passes it to every batch, so every creator is judged the same way. It is the fallback: its confidence is never above Medium, and the page
  marks it "Free-text check: less reliable". F4 offers to save it as a named check.

**Which videos.** Up to three video posts per creator, from the posts already read (**What to read
per creator**): a `mediaKind` of video, or an Instagram Reel. Rank them by how likely each is to
show the subject: a caption, transcript, overlay text, or `analysis.narration` that mentions it
first (narration only picks videos here; it never decides the result), then the most viewed, then
the newest. A creator with no video posts is **Can't check (no videos in the posts read)**.

**Frames.** Follow **Content review**, **Media: what the agent can and cannot see**, for getting
each video, the frame extractor (ffmpeg, then AVFoundation, then OpenCV; never install one), and
resizing, with these changes:

- **Sampling.** Per video, start at 0.5 seconds and take one frame every 3 seconds, at most 10
  frames (a longer clip widens the step to duration ÷ 10).
- **Contact sheets.** Tile each video's frames into one sheet of at most 10, with the post
  number and timestamps, as **Post analysis**, **Video: frames, shots, and audio**, does, and
  view every sheet. With no tiling tool, view the frames one by one.
- **Confirming.** Where the sheet shows a possible match, take full-size frames at ±1 second and
  view them. A Seen rests only on a full-size frame the agent viewed.
- **No extractor.** Read the three cover images only (`frame.at` is `"cover"`). The result's confidence is Low at most, it
  says "covers only", and the run's summary names the tool that would fix it.
- A video that won't download is skipped and named; the next ranked video takes its place.

Keep every file in the run's working folder, in a subfolder per creator, so batches never share
files.

**The result.** One per creator: **Seen**, **Not seen**, or **Can't check**, with a confidence
word, an evidence frame, and what was read ("3 videos, 28 frames").

| Result | High | Medium | Low |
| ------ | ---- | ------ | --- |
| Seen | Clearly in frame, matching the definition, in 2 or more of the videos | Clearly in one video only, or in 2 or more but small, partly covered, or at a distance | Possibly: blurred, mostly covered, or matches only part of the definition |
| Not seen | Three videos read, frames across each whole clip, no match, and the frames where the subject would most likely be viewed full size | Fewer than three videos, a clip longer than 30 seconds sampled at a widened step, or a miss read from contact sheets alone | Covers only, or every frame dark or blurred |

A free-text check takes one step down from High to Medium. **Can't check** names its reason (no
videos, no video would download) and carries no confidence word or frame: the creator was not
screened, and the page and the run summary count them apart from the screened creators.

**The evidence frame.** For Seen, the clearest full-size frame that shows it. For Not seen, the
frame that shows the most of the scene the subject would be in (for a dog, the room or walk where
pets appear), so the reader can judge the miss. Each carries the post's permalink and the timestamp
("Reel of 14 Oct, 0:07"). The page embeds it once, in the visual check section, in a 160 px wide
box, so the file is 320 px wide (twice the box, as **Creator card**, **Images**, sizes page
images); the card and the table link to it. Atlas keeps only the link and the time, never the
image.

**It never decides the call.** The visual check adds no points to the fit score and changes no
recommendation. It shows in the checks table, on each card, and in its own section of the page,
and a Seen or Not seen at Low confidence is listed in Decisions for a person to confirm. When no
frame extractor ran, Decisions carries one line instead ("No video frames were read, only covers;
install ffmpeg to read them") rather than one entry per creator. When the
brief makes the subject a must, say so in the Maybe's "what would settle it", never as a Reject.

## The findings behind the checks

The reader needs to see why the checks matter for this product before the list. So the run works
out what people are doing well with the brand's product, where they get stuck, and what that
means for picking creators, then ties every check to one of those findings. All of it comes from
the posts and comments already read for the list; it adds no search.

**The product posts.** The posts read for the list that mention the brand or the product the
criteria name, in the caption, hashtags, transcript, or overlay text. A topic evidence post counts
only when it does: a post about the campaign's broader subject ("home cooking" for a cookware
brand) is not about the product. The
comparisons of views use only the product posts whose author has a usual (**What to read per
creator**) and that have 5,000 or more views, so one small account's swing doesn't lead. The page
states that floor and how many posts passed it. With fewer than 5 posts that pass, What's working
and the reach part of item 3 say so in one line ("No pattern this run: 3 posts about {product} is
too few to compare"), and the checks they would feed are tagged "Brief". Where people get stuck and
the supply part of item 3 use every product post and need no floor; with no product posts at all,
all three say so and every check is tagged "Brief".

1. **What's working.** Sort each product post by what it does, one label per post, read from the
   caption, transcript, and overlay text: built something real with the product, a tutorial or
   tips, a prototype to sell or test an idea, a head-to-head comparison, career or workflow
   advice, feature news or an event recap. The labels come from the posts, so a run may name
   others. For each label: the median lift, "{n} of {m} measured", and up to three example posts,
   named and linked. A label with fewer than 2 measured posts is listed but not charted. Add any
   comment pattern that recurs across the measured posts with the posts it comes from, for example
   most comments asking for the link to try what was built.
2. **Where people get stuck.** The comment sentiment counts across the product posts that carry
   `analysis.commentSentimentBreakdown` ("28 positive, 7 neutral, 6 mixed and 2 negative across 43
   posts"). Then up to four challenges, numbered Challenge 1 to 4, each read from the mixed and
   negative threads and from creators' own captions and transcripts: what goes wrong, quoted and
   linked to the post it comes from. Count the other brands each product post names (the brand
   itself left out) and mark the saved `competitor` handles apart from the other tools named. No
   analyzed comments: the counts line says "Atlas holds no comment analysis for these posts" and
   the challenges come from the posts alone.
3. **What this means for picking.** Two numbers. **Reach:** how concentrated the views of the
   product posts are: the total, the top post's share of it, how many are paid partner posts (paid as
   **Disclosure habits** reads it), and the average of the rest without
   the top post ("One TikTok has 8.3M of the 10.8M views; the other 54 average 46K"). **Supply:**
   when the criteria name a market, how many product posts and authors have that market on record
   against the total ("4 of 55 posts come from US accounts"). When the list came up short of the
   number asked or the campaign's target, this finding says why with these numbers; the page
   never pads the list.

**The checks tied to the findings ("What we look for").** One check per component of the fit
score, worded in the brand's terms from the saved criteria ("Builds with {product} on camera",
not "Topic evidence"). Each names the finding it comes from as a tag: "Doing well", "Challenge
{n}", "Reach", "{market} supply", or "Brief" when the saved criteria alone set it, and gives that
finding's number in one line. Per creator, each check is a pass, a partial pass, or a miss, scored
1, ½, or 0 from the component's points: a pass at 70% or more of its weight, a partial pass at 35%
or more, a miss below that. A component with no data carries no mark, shows "not available:
{reason}" as the fit score does, and stays listed as missing. The bar for Approve is stated in plain words from `vetting:thresholds` and the
hard stops ("Approve at a fit score of 70 or more with no safety cap").

**The saved criteria still decide.** The fit score, its weights, and the recommendation come from
the saved criteria only, exactly as **The checks** and **The recommendation** say. The findings
explain the criteria; they never change a score. When a finding suggests a criterion the brand has
not saved (a lift bar on product posts, fluency in a tool people compare the product with, a
market the supply numbers point to), it is a **proposed change to the criteria**: it goes in the
page's Decisions as a question with the finding behind it, and in the result's "Needs the main
thread" under the criteria record the run used (`vetting:criteria`, or the campaign's
`campaign:{slug}-criteria`), with that record's current wording. It is never applied in the run,
and the agent never writes it.

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
   the approve line, **Maybe** at or above the maybe line, **Reject** under it. In a creator-ads
   lane this is the score without Budget vs target (**Creator-ads lanes**).

A visual check (**4. Visual check**) is not one of these rules: it never changes a
recommendation. A `vetting:lesson-*` record can change how a check is judged; mark every call a lesson
changed ("Passed under saved lesson: …"). A lesson never relaxes a red line, a competitor, a
hard reject, or a saved team call on another creator. Every recommendation carries its top
two reasons in plain words, and every Maybe says what would settle it ("check their last 3
Reels for alcohol before approving").

**Near-misses when the rules loosen.** When a `vetting:thresholds` or `vetting:criteria` record
(or the campaign's `-criteria`) was superseded by a looser one since an earlier vetting run (a
lower line, a wider size band, a market or format added), list the creators whose earlier call
came from the fit score alone (rule 5, not a saved call, hard stop, missing data, or safety cap):
a Reject within 10 points under the old maybe line, a Maybe within 10 points under the old approve
line, or one that missed only on the criterion that changed. They go in
**Next steps** as "Re-screen under the new rules", each with the earlier score and what changed.
Re-vet them only when the user adds them to a list; never change an earlier call yourself.

## The feedback loop

Asked straight after the run, while the page is in view. The agent asks when
`AskUserQuestion` is available to it; otherwise it returns the feedback packet and the main
thread asks, before anything else happens in the conversation.

| # | Question | Options |
| - | -------- | ------- |
| F1 | What's your call on these {n} recommendations? Your answers are saved to Atlas. | 1) Agree with all of them (Recommended); 2) Change some (type them, for example "approve 4, reject 9: too much alcohol, maybe 12"); 3) Decide later (nothing is saved as the team's call) |
| F2 | Save these notes about creators for future vetting and discovery? (multiSelect; up to four per call, repeated until every note is covered) | One option per note, labelled "@handle: {stance}", the description giving the full note as it will be saved. |
| F3 | Save this for every future vetting: *"{lesson}"*? (only when a change generalizes) | 1) Save as a vetting lesson (Recommended); 2) Just these creators |
| F4 | Save "{check}" as a named visual check for future runs? (only after a free-text check) | 1) Save it as worded (Recommended) (description: the definition as it will be saved); 2) Not now |

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
- **F4** is asked once after a free-text check, by the main thread after the last batch (never by the agent), whatever F1 was, and is its
  own write confirmation.
  The definition saved is the one the run used, worded per **Visual check records**, with any
  correction the user typed. A saved check of the same name goes under "Needs the main thread" as
  a supersede instead.
- **Changes to saved records belong to the main thread.** A note for a creator who already has
  a `creator:*` record, a lesson that contradicts a saved `vetting:lesson-*`, and any change to
  a red line, competitor, or setup answer go through `supersede_calibration` or
  `retract_calibration`, each with its own Destructive tools confirmation. The agent never
  calls either; it lists each under "Needs the main thread" (`key | current wording | proposed
  wording or "retract" | why`).

**In the main thread.** When the agent reports "asked", relay what the user decided and what
was saved. When it returns a feedback packet, run F1 to F4 yourself, before anything else in the
conversation. Either way, offer each "Needs the main thread" change, the proposed changes to the
criteria among them, through its own Destructive tools confirmation (`supersede_calibration` or
`retract_calibration`), one per call. A proposal the user declines stays unsaved.

**Feedback outside a run.** Feedback about a creator outside a run ("never use @handle again",
"@handle was great to work with") is saved the same way: word the note, confirm it with
`AskUserQuestion` ("Save this about @handle for future vetting and discovery?"), then write the
`creator:*` record, or offer the supersede when one exists.

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

### Visual check records

One record per named visual check, organization-wide, read only by creator vetting.

- kind `guideline`, key `vetting:visual-{slug}`, the slug from the check's name (lowercase,
  hyphenated, 40 characters at most).
- `statement`: "Visual check: {name}. Look for {what}", under 280 characters.
- `detail`: `{concern: "preference", appliesTo: ["creator-vetting"], body: "name: {name}; look for:
  <what>; counts as seen: <what counts>; not seen when: <what does not count>; runKey: <originating
  runKey>; saved: <YYYY-MM-DD>"}`.
- `provenance: "interview"`.

Saved through F4, or outside a run when the user asks ("add a visual check for grey hair"): word
the definition, confirm it with `AskUserQuestion` ("Save this visual check for {brand}'s vetting?"
with the definition in the description), then write the record. Changing or removing one is a
supersede or retraction with its own Destructive tools confirmation.

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
be resolved or were not vetted, the visual check run (name, kind, and the count per result and
confidence) when there was one, and the page link, so a run with unresolvable handles is
still on record. It also carries `detail.findings` (**The findings behind the checks**):
`{viewFloor, measured, working: [{label, medianLift, measured, total, examples[]}], sentiment:
{positive, neutral, mixed, negative, posts}, challenges: [{n, title, evidence[]}], brandsNamed:
[{brand, posts, competitor}], reach: {totalViews, topPostShare, paidPosts, restAverage}, supply:
{market, posts, authors, total}, checks: [{component, label, finding}], proposedCriteria[]}`.

`detail` carries `findingType`, `vettedAt` (full UTC timestamp from the shell clock, the same
on every finding of one run), `handle`, `network`, `name` (from the list, when given),
`recommendation`, `rule` (which rule of **The recommendation** decided it), `fitScore`, the
component breakdown, `safety` (`{category: result}` plus red line, scope, competitor,
disclosure, and audience checks), `redLineHits[]`, `hardRejectHits[]`, `riskFlags[]`,
`calibrationsApplied[]` (the keys that shaped the call), `lessonsApplied[]`, `evidence[]`,
`estFee` when the calculator gives one, `visualCheck` when R5 named one (`{name, kind: "named" |
"free-text", key, result: "seen" | "not-seen" | "cant-check", confidence: "high" | "medium" |
"low" | null, frame: {postUrl, at}, videosRead, framesViewed, coversOnly, reason}`, `frame` and
`confidence` null for Can't check), `usualViews` (or the reason it is not available),
`checks` (`{component: 1 | 0.5 | 0 | null}`, `null` for a component with no data; the
finding each check comes from is on the run summary),
`listName`, `listSource` (`csv`, `pasted`,
`aspire-app`, or `cas-lane`), `campaign` when R2 named one, `reviewPage`, and `recipient`
(**Recipient lens**). A `feedback` finding adds `userVerdict`, `agentVerdict`, and the user's
words verbatim. Supply an `idempotencyKey` per finding (`vet-{list-slug}-{entityId}-{findingType}`).

**Reading it back.** `search_insights` with a `prefix` filter on
`detail.account_review.runKey` = `creator-vetting-{profile}`, newest first, paged; the newest
record per `entityId` wins, and a `feedback` finding outranks a `recommendation` from the same
run.

## The page

When the launch block's `question` is **I1** ("Which creators should we contact for this launch,
and why?"), the page must match the evidence of its approved example
(`skills/page-standard/examples.md`, I1). Every vetting page has the sections below; the ones
that need a campaign (audience groups, the launch clock) appear only when the criteria give what
they need. Build it from the page blocks
(`skills/page-standard/blocks.md`); the block numbers below are that file's.

One page per list, published to a new path per run; a re-run of the same list republishes to
the same path. Title "<Brand> Creator Vetting: {list name}". Sections:

1. **Header** (3.1, 3.2) with the "Prepared for" chip, the animated mark at the top right, the
   list name and source, the criteria used (brand or campaign) with the launch, its audiences,
   and its goal when the criteria name them, and the creators and posts read per platform.
2. **Answer** (3.3), written last: how many were reviewed and how many to contact, and by when
   ("49 creators reviewed. Contact 11 this week."), and the one thing that decided the most
   rejects. Its takeaway gives the strongest finding behind the checks in one sentence each: what
   works and where people get stuck ("Builds ran at 3.6× the creator's usual views, feature
   recaps at 1.2×"). Under it, the verdict tally: a bar of Approve, Maybe, Reject, and Can't vet,
   then a column per verdict with its count and the reasons behind it as chips. When the user
   asked for a number and the list came up short, the answer says so ("11 of the 20 asked for")
   with the reason in a few words (the supply finding in section 5 when it explains it, otherwise
   what removed the most creators), and the page never pads it.
3. **What people are doing well with {product}** (3.4, the headline insight), from **The
   findings behind the checks**, item 1: the claim, then a bar chart of the median lift by what
   the post does, one bar per label with "{n} of {m} measured" and a dashed line at 1× (the
   creator's usual), then each pattern with its named example posts, linked. The "So:" line says
   which check it feeds.
4. **Where people are having challenges** (3.4), item 2: the comment sentiment counts, then each
   challenge as "Challenge {n}" with its quoted, linked posts (3.18 for a quote), then a bar chart
   of the other brands named in the product posts, saved competitors marked apart.
5. **What this means for picking creators** (3.4), item 3: the reach finding with a table of the
   top product posts (post, what it does, views, against the creator's usual, paid partner or
   not) and the supply finding. When the list is short of what was asked, this section is the
   explanation, with the numbers.
6. **What we look for in a {product} creator**: one row per check, each with the finding tag it
   comes from and that finding's number in one line, the 1, ½, and 0 scoring, and the bar for
   Approve in plain words. Below it, any proposed change to the criteria, marked as proposed and
   pointing to Decisions. A check whose finding had too few posts is tagged "Brief", as **The
   findings behind the checks** says, and the section says why.
7. **Decisions** (3.5): approving the creators to contact, with the date outreach should start,
   any brand rule the team must settle before a verdict holds (for example, a red line a creator
   sits on the edge of), each proposed change to the criteria with the finding behind it, and,
   after a visual check, the creators whose read is Low confidence, to confirm by eye.
   Questions that settle one creator stay on that creator's card.
8. **Next steps** (3.6): in order, each with its week, the creators it covers by number, and
   what it should change: contact the approvals, settle the Maybes, line up the backups, and,
   when the list came up short, where a second search should look given the findings.
9. **Approve**, **Maybe**, **Reject**, **Can't vet**, in that order. First a table of every
   vetted creator against the checks (a pass, partial, or miss mark per check, or "not
   available" with no mark for a check without data, the fit score, and the recommendation, plus
   a column for the visual check when one ran: the result and its confidence word, which is never
   a mark and never counts toward the score),
   numbered as the cards, with a key under it saying the usual is the creator's median views over
   their newest posts in 90 days, at most 50. In a creator-ads lane the score column is the score
   without Budget vs target (**Creator-ads lanes**). Then each verdict is a grid of creator
   cards (3.7; **Creator card**, page mode) ranked by fit score, numbered from 1
   across the whole page in the order shown, because those numbers are what the user replies
   with. When the
   criteria name audiences, the Approve grid is grouped by audience with a subtotal per group;
   when they also set how many creators each audience needs, a group short of it names the open
   slot. On each card: the fit score in the ring; flow chips `#{number}` and
   the recommendation; safety results in the brand safety tile per the card's **Brand safety**
   rule; three proof posts in the thumbnails; when a visual check ran, a line under the
   thumbnails with the check's name, the result, the confidence word, and the post and timestamp,
   linked to the creator's still in the visual check section (the still itself is not repeated); `{DETAILS}` with the two reasons, each check's mark
   with the post or number behind it (a lift as "3.0× usual views"), a watch line
   (the one thing to keep an eye on), what would settle a Maybe (a Maybe that only fills a gap
   says "Backup: take if {creator} declines" instead; it stays a Maybe in the findings), the calibrations and lessons applied, an earlier vetting or discovery state, the
   contact route, "Est. fee {open} to {max}, target {target}" when the calculator gives one
   with where the rates came from, and the expected return when the fee has one: the bundled
   median views the fee is priced on (**Fee calculator**, **How a fee is calculated**). Never show a
   return the run did not work out.
   Reject and Can't vet are grouped by reason (3.16), one row per creator with its `#{number}`
   and why not, rather than full cards. A Reject row carries its score; a Can't vet row carries
   no score, only what would make it checkable. In a creator-ads lane each row
   also carries the four ad figures.
10. **Visual check: {name}**, when R5 named one. It opens with one line, in the section's own
   text and not a footnote: "These reads are approximate: the agent looked at frames from up to
   three videos per creator. Confirm by eye before you rely on one." Then the definition used, and
   for a free-text check the chip "Free-text check: less reliable" with one line saying why (no
   saved definition, so the agent worked one out from the words typed). Then a tally by result and
   confidence, and a grid of every creator vetted, numbered as the cards: the evidence frame (the
   still, per **4. Visual check**), the result, the confidence word, the post and timestamp linked, and what
   was read ("3 videos, 28 frames"). Can't check rows sit at the end with their reason, then the
   "Not checked" creators. Seen,
   Not seen, and Can't check use the page's neutral colors, never the Approve, Maybe, and Reject
   status colors, so a visual read never looks like a verdict.
11. **Safety summary**: a table of creators by category, only the rows with a Flag or Fail.
12. **Launch clock** (3.17), when the criteria name a launch date: the weeks from today to that
   date, with each next step placed in its week and the launch marked. No stage gets a date the
   next steps did not set.
13. **How the verdict was made** (3.11): the fit score's components and weights, the safety
   results, the recommendation order and the thresholds, the hard rejects, every saved call or
   lesson that changed a verdict, which posts the findings used, how a lift is worked out (the
   post's views divided by the creator's 90-day median) and the view floor, the platform counts
   again, and, when a visual check ran, how the videos were picked, the frames per video, the
   frame extractor that ran, and the confidence rule.
14. **What's missing** (3.12): creators Atlas could not read, networks not covered, data a
    verdict would firm up with (for example, audience demographics), creators with no usual
    views, how small each finding's groups are ("lifts rest on 2 to 9 posts each"), and, after a
    visual check, the creators it couldn't check and why, and "covers only" when no frame
    extractor was installed, with the tool that would fix it.
15. **Not vetted**: handles on other networks and the brand's own handles, with the reason for
    each. A handle that could not be resolved is listed once, under Can't vet.
16. **Atlas can draft next** (3.13): first messages to the approvals, offers at the fee
    calculator's open rate, and the questions to the Maybes.
17. **Footer**: sources, the fee rate label once, a note that images are a snapshot, and
    "numbers come from Atlas as of {timestamp}", then the artifact-standard footnote. The mark and the footnote follow **Artifact standard**.

Sections 3 and 4 each carry their own chart; this reference sets that, so the page standard's
one chart for the headline insight does not cap it. {product} is the product the criteria name,
or the brand when they name none.

More than 12 creators: a chart sits under the verdict tally (fit score against the recommendation lines, in a
creator-ads lane the score without Budget vs target, which is what the lines decide,
or follower count against engagement rate, colored by recommendation). Images follow
**Creator card**, **Images**, page profile, cutting thumbnails per card before quality on a
large list. Visual check stills count toward the same image budget: past it, drop the Not seen
stills first (keeping their links and timestamps), then the card thumbnails as that section says;
a Seen still is never dropped. Load `artifact-design`, and `dataviz` for any chart, and apply `theme:brand` per
**Theme**, **Applying the theme**. Approve, Maybe, and Reject keep their status colors under
any theme.

## Creator-ads lanes (CAS campaigns)

Inside a CAS campaign (**CAS campaign**), the main thread launches vetting on one lane's
discovery pool, with the lane as the criteria source. This is step 12's two paid screens:
persona fit, and paid track record. Everything above applies, with these changes.

**Criteria source.** `campaign:{slug}-lane-{lane}` plus `campaign:{slug}-criteria`. The list
is the lane's undecided candidates from discovery (`creator-discovery-{profile}-{slug}` prefix,
`detail.lane`); the list name is "{campaign}: {lane}" and its slug `{slug}-{lane}`. R1 and R2
are answered by the launch. R3 is skipped: the campaign's saved cadence approves lookups for its
lanes (SKILL.md, **Guardrails**). R4 is answered by the CAS Run picker. R5 is skipped, and no
visual check runs.

**Fit score for a creator-ads lane** is the campaign's match score, out of 100: the one procedure
in **CAS campaign**, **Creator Selection**, **The match score**, with the lane's concept,
the round's casting keywords and target cities, and the weights saved in `match` in
`campaign:{slug}-cas` (the defaults there without it). Vetting runs it so its page and the
campaign page show the same number for the same inputs. When `match` has a `basis`, the page says
"Weights tuned {date} from {n} client decisions" in its About this data, else "Default weights". The two paid screens are two of its
factors:

- **Persona fit is Brief fit.** Read the concept's casting keywords and target cities from
  `casting` in the lane record, which the campaign page's edits are pulled into. Only when it
  holds none, derive them from the lane's persona and casting
  filter, and say on the page that they are derived, not saved. Judge each keyword
  against the bio, recent post topics and who appears on camera and in what setting, and cite the
  bio or the post for every match.
- **Paid track record is Paid history**, with the partners part read by category:
  `instagram.pastBrandPartnershipPartners` and partnership marked posts give 1 for two or more
  partners in the brand's category, 0.6 for one in it or two or more near it, 0.3 for paid
  partners outside it, and 0 for none. The campaign page uses this read in place of the plain
  count for every creator vetting screened, so the two never disagree.
- The category comes from `brand:summary` and `brand:business-context`, as in the creator
  brief's **Fit rubric**. "Near" means a category the same buyer shops in.
- Performance, Budget vs target and Content reach are worked out exactly as that section says,
  Budget vs target from **Rates and terms**, **Expected cost** (before step 3, the calculator's
  target plus the uplift, unless a roster finding holds an offer, counter or agreed fee) and
  **Target rate**, which reads `-cas` and `-terms`.
- **The recommendation uses the score without Budget vs target**, the client's score in that
  section, against `vetting:thresholds`, so price never decides Approve, Maybe or Reject, and no
  reason ever cites price, cost or the target rate. The thresholds decide the recommendation and
  the bands (75, 60, 45) only label the score; the two are separate.
- An input Atlas holds no data for is left out and named, as that section says, never scored as
  zero. On TikTok that is hook rate, engaged accounts, past paid partners and badges; say so on the
  card ("Scored without hook rate, which TikTok doesn't report").
- A bio that names a saved competitor halves the score, as that section says. It is also a hard
  stop below when it is a saved competitor's own handle.
- Partnership readiness isn't scored. It stays one of the figures on every row.
- For the paid track record, read the discovery finding's `detail.recommendationTypes` when
  present. It is supporting evidence, never points: cite it in plain words, for example "Meta
  ranks this creator under high ad performance".
- Write the result in `detail.match`: `{score, client, band, factors, paidPartners, without, conflict,
  pastDeals, weights, scoredAt}`, `paidPartners` being the partners part by category
  (`{value, partners: [{name, category}]}`, `category` in, near or outside), which the campaign page
  takes as it is, `score` being the five factor score and `client` the one without
  Budget vs target, with `fitScore` equal to `score`. The page shows the date of the run, and names
  the inputs that can differ from the campaign page's as that section lists them.
- Brand safety runs exactly as today, and every hard stop still decides first.
- **The checks in "What we look for"** are the client score's factors, Budget vs target left
  out, so no check ever shows price. The score shown beside them, in the checks table and on the
  cards, is `client`, the score without Budget vs target, never `score`. A factor is a pass at 0.7 or more, a partial pass at 0.35 or
  more, and a miss below that; a factor left out for missing data carries no mark, as above.

**The recommendation is the slate call.** Approve, Maybe, or Reject, by **The recommendation**
above against `vetting:thresholds`. A creator who would be Can't vet appears on the slate as
Maybe, with "not enough data to judge" as what would settle it. Every Reject carries its reason
in plain words, never price, because the CM may pass it on to the client; the Gate 2 packet itself
shows the recommendation to the agency only (**CAS campaign**, **Gate 2**).

**Output rows carry the four figures**: hook rate, Reels interaction rate, past paid partners,
and partnership readiness, in each finding's `detail.adFigures` (with the key names
**Creator discovery**, **Ad figures on every card**, pins) and on each card, beside the
recommendation. Findings also carry `detail.campaign` and `detail.lane`. The CAS campaign
composes the Gate 2 packet from them.

**The feedback loop still runs**, but the client's slate decisions are not F1: they come back
at Gate 2 and are written by the main thread. F1 here is the agency team's own call before the
packet goes out.

## Atlas quirks that apply here

`search_creators` carries no post-level fields, so every creator needs its own `search_posts`
call. `lookup_creators` takes up to 100 items per call, has no status-check tool (re-call with
the same items to re-read `fetching` ones, about every 15 seconds, up to roughly 3 minutes),
and is attributed with `asProfileId`. Search indexing lags a lookup; re-run
the searches for fetched creators after it settles. `account-not-discoverable` is cached for 7
days: report it, never retry it. Project the `media` and `instagram.account` containers, not
leaf URLs; published pages cannot load `cdn.aspire.io` images, so embed them.
