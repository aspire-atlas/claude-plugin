# Applicant review reference

Used by the **Applicant review** section of SKILL.md, and read by **Creator vetting** when it
screens a campaign's applicants. Holds the setup interview for one campaign's applicant review,
the records it saves, the review Sheet it creates, how a campaign's applicant export is imported
into Atlas and the Sheet, and how a screening run reads it all back.

The main thread's part of this flow, except **How screening applies a review**, which the
`atlas-creator-vetting` agent reads too. A bold section name in it (**Creator vetting**,
**Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Applicant review (set up once per campaign)](#applicant-review-set-up-once-per-campaign)
- [The records](#the-records)
- [Setup interview](#setup-interview)
- [The review Sheet](#the-review-sheet)
- [Importing applicants](#importing-applicants)
- [When setup is done](#when-setup-is-done)
- [Reading the setup back (screening)](#reading-the-setup-back-screening)
- [How screening applies a review](#how-screening-applies-a-review)

## Applicant review (set up once per campaign)

Trigger when the user wants to screen a campaign's applicants and the campaign has no applicant
review yet ("set up the applicant review for {campaign}", "we have applicants coming in for
{campaign}", "set up screening"), or asks to change one ("change the {campaign} review"). An
applicant review is the setup for screening one campaign's applicants: what fit means, the red
lines and checks, the rules for form answers, the visual checks, what the client sees, and the
review Sheet set aside for the list (created empty: see **The review Sheet**). It is saved once, so every screening run reads it and
never asks again.

Requires a brand profile. Interactive only: setup asks questions and creates the Sheet, so a
scheduled run never runs it. Without `AskUserQuestion`, say in one line that the applicant review
needs a person to set it up, and stop. Getting the applicants in and screening them is
**Creator vetting**, with the review as its criteria source.

One agency organization can hold many brands and many campaigns, and calibrations are
organization-wide. Every review is keyed by its own slug and names its brand profile in its
`-campaign` record, so two brands' reviews never mix.

## The records

A review is exactly the nine keys in the table below, each `applicantreview:{slug}-{part}`. Keys
starting `applicantreview:` belong to the applicant review and to **Creator vetting** when it
screens for that review; every other flow drops them (**Atlas tools**, Calibration kinds).

**Read a review by its nine exact keys, never by prefix.** One slug can start another
(`acme-holiday` and `acme-holiday-seeding`, or `acme-holiday-seeding` and
`acme-holiday-seeding-2`), so an `applicantreview:{slug}-` prefix read can pick up another review's
records. Keep only the nine keys of the review in hand and drop every other `applicantreview:` key.
No part name ends with another part name (that is why visual checks are `-visuals`), so two slugs
never build the same key. The separator stays `-` because keys follow **Atlas tools**' `<namespace>:<slug>` form, one
colon and a lowercase hyphenated slug, so no other character can mark where the part starts. The
namespace takes no hyphen at all, which is why it is `applicantreview`: Atlas refuses a key whose
namespace has one.

**Read active records only.** A changed review supersedes its records, so a read with
`includeSuperseded: true` returns old versions too: those are history, never the review.

`{slug}` comes from the brand and the campaign name: lowercase, hyphenated, no dates (for example
`acme-holiday-seeding`). Never show the slug or ask the user to invent it; refer to the review by its campaign name
and brand. When `applicantreview:{slug}-campaign` already exists for a different campaign or a different brand profile, add `-2`,
`-3`, and so on.

**The slug keeps to Atlas tools' slug cap, any `-2` suffix included** (**Atlas tools**, Calibration
kinds), which also says how to shorten a long brand and campaign name. Then even the longest
part, `-client-view`, stays within the length Atlas allows after the colon.

| Key | kind | detail | Holds |
| --- | ---- | ------ | ----- |
| `-campaign` | `brand_fact` | `{section: "business_context", body}`; body lines `campaign: <name>`, `campaign key: <the slug of the saved campaign:{campaign-slug}-brief this review is for, or none>`, `profile: <brand profile id>`, `aspire campaign: <Aspire campaign id, or none>` | Which campaign, for which brand profile |
| `-criteria` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body is `source: campaign:{campaign-slug}` (that campaign's `-brief` and `-criteria`), `source: vetting:criteria`, or one line per dimension (archetype and audience, networks, size band, market, content) | What makes an applicant a fit |
| `-checks` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body `reject: <the checks that reject on their own, from competitor-deals, disclosure, language-on-camera; or none>` | Which checks reject on their own (all of them always run: **How screening applies a review**) |
| `-red-lines` | `red_line` | `{action: "block", appliesTo: ["applicant-review", "{slug}"], body}`; body one red line per line | Red lines for this campaign only, on top of the brand red lines <!-- red-line-check: defines the review's own red-line record --> |
| `-thresholds` | `guideline` | `{concern: "ceiling", appliesTo: ["applicant-review", "{slug}"], body}`; body is `source: vetting:thresholds` or `approve >= <n>; maybe >= <m>` | Where Approve, Maybe, and Reject sit |
| `-form-rules` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body one rule per line: `required: <form question>`, `stop: <form question> = <answer>`, `boost: <form question> = <answer>`, or `prompt: <instruction for the screening agent>` | How form answers change a call |
| `-visuals` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body one check per line: `named: <name> = <what counts as a pass>`, or `free: <what to look for>` | What to look for in each applicant's videos |
| `-client-view` | `guideline` | `{concern: "ceiling", appliesTo: ["applicant-review", "{slug}"], body}`; body `client sees: <final-list, content \| final-list \| none>` and `hidden: scores, notes, maybes, team calls` | What the client contributor role sees |
| `-sheet` | `policy` | `{area: "routing", body}`; body `sheet: <link>` or `sheet: none (<reason>)` | The campaign's review Sheet |

`-red-lines`, `-form-rules`, and `-visuals` may be declined: a declined question is written
as kind `decline` with the same key (`{topic: "<the question>"}`), so it is never asked again and
screening reads it as "none for this campaign".

## Setup interview

Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the
end, `includeSuperseded: true`) and `get_brand_instruction` with `agentType: "brand_safety"`.
Find the review: a `-campaign` record whose body names this profile and the campaign the user
named. Skip every question whose key is already occupied for that slug by an active record (not
superseded, not retracted), unless the user asked to change the review: then every active saved
answer is shown with "Keep as saved" or "Change" (**Changing a saved review** below). Write answers with
`append_calibration`, `provenance: "interview"`, `statement` under 280 characters, prose in
`detail`.

Ask AR1 to AR8, one `AskUserQuestion` per question, in order, exactly as worded, never as plain
text (**Question format rule**). The tool adds its own free text field; never add "Other" or
"Skip". `{campaign}` is the campaign's name and `{brand}` the profile's brand name.

| # | Question | Options | Key |
| - | -------- | ------- | --- |
| AR1 | Which campaign is this applicant review for? Type its name, and its Aspire campaign id if you have it. | Up to two campaigns already saved (`campaign:*-brief`) whose brief names this profile's brand, by name; then campaign names drawn from `brand:summary` and `brand:business-context` (for example "{product} seeding") until there are two to four options | `-campaign` |
| AR2 | What makes an applicant a fit for {campaign}? | 1) Use the saved {campaign} campaign brief and criteria (Recommended) (only when AR1 picked a saved campaign whose `-brief` and `-criteria` are still active); 2) Use {brand}'s vetting criteria (only when `vetting:criteria` exists); then starters drawn from `brand:summary` and `brand:business-context` (for example "Dog owners who post daily walks, 10K to 250K followers, US") until there are two to four options | `-criteria` |
| AR3 | Screening checks every applicant for brand safety, fit, competitor deals, disclosure, and language on camera, and flags what it finds. Which of these should reject an applicant on their own? (multiSelect) | 1) A paid partnership with a saved competitor in the last 90 days (Recommended); 2) Paid posts without a disclosure; 3) Swearing, or a red line's words, said on camera or shown on screen (the review's own red lines always reject; {brand}'s saved red lines keep their own action); 4) None: flag them for the team to decide (picked with others, the others count) | `-checks` |
| AR4 | {brand}'s saved red lines and competitors apply to every applicant: {red lines and competitors}{, and the brand safety instruction: "<its first line>"}. Any red lines for {campaign} only? With none saved: {brand} has no saved red lines yet. Any red lines for {campaign}? | 1) Only the saved red lines (Recommended) (with none saved: "No red lines for this campaign"); 2) Add red lines for this campaign (type them, one per line) | `-red-lines` |
| AR5 | Where should the lines sit between Approve, Maybe, and Reject? | 1) {brand}'s vetting thresholds: Approve at {n}, Maybe from {m} (Recommended) (only when `vetting:thresholds` exists); 2) Approve at 70 and up, Maybe from 50 to 69 (Recommended when there are no vetting thresholds); options 2 to 4 each left out when the vetting thresholds already match it; 3) Stricter: Approve at 80, Maybe from 60; 4) Looser: Approve at 60, Maybe from 40 | `-thresholds` |
| AR6 | Should any application form answer change a call? Type one rule per line: required (a missing answer makes a Maybe), hard stop (an answer that rejects), priority boost (an answer that moves an applicant up), or a note for the screening agent. Screening does not apply these yet: they are saved, named on the screening page as not checked, and the team applies them by hand. | 1) No form rules for {campaign} (Recommended when the form asks only for handles); 2) Required: every form question is answered (Recommended when the form asks more than handles); then up to two rules drafted from the form's questions when the form is known (for example "Required: How many pounds overweight is your dog?") | `-form-rules` |
| AR7 | Should screening look for something in each applicant's videos? Name each check and what counts as a pass. Screening runs one of these per run, picked when the run starts; it never changes a call on its own, and the page marks its reads as approximate. | 1) No visual checks (Recommended when the criteria name nothing visual); 2) Face on camera: the creator appears and speaks to camera (Recommended when the criteria name something visual and no check is drafted; otherwise the first drafted check is Recommended); then up to two named checks drafted from the criteria (for example "Product on screen: the {product} is visible and in use") | `-visuals` |
| AR8 | What should the client see once the review is shared with them? | 1) The final list and the content behind it, with no scores or notes (Recommended); 2) The final list only; 3) Nothing: no client access for {campaign} | `-client-view` |

Rules:

- **AR1** derives `{slug}` and writes `-campaign` with the selected profile's id. A saved campaign
  picked here sets `campaign key:` to its `{campaign-slug}`; a new one sets it to `none` and gets
  no `campaign:` records, which belong to **Creator discovery**. When the request already named the
  campaign, skip AR1, match the name against the saved `campaign:*-brief` records the same way,
  and show the name in the batch confirmation instead.
- **AR2** writes `source: campaign:{campaign-slug}` or `source: vetting:criteria` for options 1
  and 2, never a copy of the criteria, so a later change to the campaign or vetting criteria
  reaches the review. A starter or typed answer is written as criteria lines. AR2 carries the web
  research option (Phase 5 rules) when the brand has no `brand:summary`. AR2 cannot be declined.
- **AR3** writes a `reject:` line with the checks picked (`none` for option 4).
- **AR4** names every brand red line and saved `competitor` in the question text (another
  campaign's review red lines never apply here), so the user only adds to them; with none saved it asks the second wording. Option 1 writes a `decline` record.
- **AR5** option 1 writes `source: vetting:thresholds`. AR5 cannot be declined.
- **AR6** and **AR7**: option 1 writes a `decline` record. A rule or check typed without one of
  the forms in **The records** is asked back once with it reworded into that form; never guess
  the form. A visual check the user describes but cannot name is saved as `free:`, and the
  question says free-text checks are less reliable than named ones.
- **AR8** is the setting the client contributor role reads. The review Sheet is never shared with
  the client whatever AR8 says: it holds scores and notes.
- **Confirm once, then write.** After AR8, show the setup in one short list and ask: "Save this
  applicant review for {campaign} and create its review Sheet? Every teammate's screening will use
  it." Options: 1) Save and create the Sheet (Recommended); 2) Save without a Sheet; 3) Not now.
  When the review's `-sheet` already holds a link, the question drops "and create its review
  Sheet", the options are "Save (Recommended)" and "Not now", and the saved link is kept as it is.
  Calibrations are organization-wide; say so in the question when the organization has more than
  one profile. A `key-exists` follows the Phase 5 supersede rule with its own confirmation.
- **Saved answers are shown in words**, here and in a supersede's two versions: a pointer reads
  "{brand}'s vetting criteria" or "the saved {campaign} brief and criteria", a review reads as its
  campaign and brand, and a record's raw body (its `source:`, `campaign key:` and `profile:` lines)
  is never shown.
- **Changing a saved review.** A teammate re-running setup sees each saved answer and is offered
  "Keep as saved (Recommended)" or "Change" per item. A change within one kind goes through
  `supersede_calibration`; a change between a `decline` and an answer retracts the old record with
  `retract_calibration`, then appends the new kind. Each supersede or retraction gets its own
  Destructive tools confirmation.
- After the records are written, create the Sheet (**The review Sheet**) and write `-sheet`, only
  when `-sheet` holds no link; an existing link is never replaced, not even by "Save without a
  Sheet".
  Then answer in text: the review's name, what screening will check, the Sheet link, and the next
  step (bring the applicants in with **Creator vetting**).

## The review Sheet

One Sheet per review, where the team sees every applicant, filters them, and records its calls.
Atlas holds the record; the Sheet is the team's working view of it. Setup creates the Sheet and
saves its link; **Importing applicants** adds one row per applicant, after Atlas holds them.
Screening does not write vetting columns yet: until it does, those columns stay blank and the team
reads the calls on the vetting page. No flow reads the Sheet as the record.

1. **Create it** after the confirmation's option 1, through the Claude Docs connector as a Sheet
   (load the connector's guide first and follow it). Name it "{brand} · {campaign} applicant
   review". Never create it as a page, a Doc, or a Google Sheet.
2. **Write the header row only**, in this order, most important first (the Sheet pane shows about
   six): Name, Instagram, TikTok, Recommendation, Fit score, Evidence, Maybe question, Status, Team
   call, then one column per other contact detail and form question when the form is known, then Source,
   Applied, Aspire applicant id. Team call is a dropdown of Approve, Maybe, and Reject, left blank
   until the team overrides Atlas. Rows come from **Importing applicants**.

   A Sheet made before a column joined this order gets the column in its place when an import
   next adds rows; a `formAnswers` key the header lacks (other than the name columns) gets a column
   before Source. Columns are always matched by header, never by position.
3. **Save the link** as `-sheet` with `sheet: <link>`.
4. **When it can't be created** (the connector is not connected, has no Sheets, or refuses), or
   the user picked "Save without a Sheet": write `sheet: none (<reason in a few words>)` and say in
   one line that screening will work from the review page instead. A later setup run on a review
   whose `-sheet` says `none` asks "Create the review Sheet for {campaign} now?" with "Create it
   (Recommended)" and "Keep working without a Sheet". On the first it supersedes the `sheet: none`
   record with the link, through the Phase 5 supersede rule. When `-sheet` is missing altogether,
   the same question appends the record instead (`append_calibration`): the link, or
   `sheet: none (not created)` on the second option.

Share the Sheet only with the people the user names, and never with a client contributor, since it
holds applicants' contact details and answers.

## Importing applicants

How a campaign's applicant export from Aspire becomes one Atlas applicant record per applicant and
one row each in the review Sheet. The main thread runs it inside **Creator vetting** (**Main
thread: the run**, step 3d), once the review is picked and read back, and before any screening. It
runs for a CSV (uploaded, or exported from the Aspire app at R1), never for pasted handles, which
carry no form answers. Interactive only. The whole export is imported once, even when screening
then splits it into runs of 100.

**1. Read every column.** Read the file with the **Applicant CSV snippet**, never with the `Read` tool, which cuts lines over 2000
characters. When **Getting the list** already ran it on this file, use those rows; otherwise run
it as that file says. It leaves out payment and tax columns, and card- or IBAN-shaped values,
before any row is printed, and the report names what it left out.

Then sort each kept column into one of these, by header, case-insensitive:

| Column | Headers | Goes to |
| ------ | ------- | ------- |
| Applicant id | `applicant id`, `aspire applicant id`, `member id`, `creator id`, `id` | `aspireApplicantId` |
| Handles | The handle headers and profile URL values in **Creator vetting**, **Getting the list**, read to a network the same way | `instagramHandle`, `tiktokHandle`, normalized per **Getting the list** |
| Email | The first header naming `email` (`email`, `email address`, `e-mail`) | `formAnswers`, and the applicant's email in step 2 |
| Name | `name`, `full name`, `creator`; else `first name` and `last name`, joined | The Sheet's Name column; the name columns stay in `formAnswers` but get no Sheet column of their own |
| Applied date | `date applied`, `applied`, `applied date`, `applied at`, `date added` | `appliedAt`, as an ISO date |
| Everything else | Contact details (phone, address, city, state, country), the application form's questions, and Aspire's own columns (followers, engagement, YouTube, campaigns) | `formAnswers`, one key per column |

A `formAnswers` key is the key the snippet printed, and values are kept as text, as written.

**2. One applicant per person.** Dedupe before anything is written. Two rows, or a row and an Atlas
record (step 3), are the same applicant when they share the applicant id, or, with no id column, an
Instagram handle, a TikTok handle, or the email (step 1's Email row; on a record, the
`formAnswers` value under a header naming email).

- With an applicant id column, that is the id.
- Without one (Aspire's applicant exports usually have none), the id comes from what the applicant
  has, not from what the rows happen to share, so the next export gives the same id: `ig-<instagram
  handle>` when any of its rows has one, else `tt-<tiktok handle>`, else `email-<email,
  lowercased>`, else `name-<the name, lowercased, spaces as hyphens>`. When its rows hold two
  different handles on one network, the kept row's wins. A row with no handle, email, or name is
  not imported, and the report names its row number.
- An id has no `:` and at most 120 characters: replace `:` with `-` and cut a longer one to 120.
- **Two different applicants with the same id** (two people of the same name with no handle or
  email, or two ids the same after the cut): only the first is imported, and the report names both
  rows.
- Duplicate rows keep the row with the newest applied date (the lower one in the file on a tie).
  The report counts duplicates and names any whose answers differ.
- Drop rows whose handle is one of the brand's own (the brand handles **Creator vetting** holds
  for the run) and say how many.
- A saved `competitor` handle is still imported: screening rejects it.

A row with no applied date gets the import date (shell clock), and the report says how many did.

**3. Check what Atlas and the Sheet hold.** Call `list_applicants` with `asProfileId` (the same
Profile step 5 writes to), `reviewId` = the review's slug, no `statuses`, `limit` 1000, paged with
`cursor` to the end. When the server has no `list_applicants`, say the import can't be checked yet
and stop before writing: the run goes on vetting the list as a plain list. An applicant that is the
same as a record (step 2) is already imported: it takes that record's `aspireApplicantId` from then
on, so its key and Sheet row stay the same, and is not written again, whatever its answers say now.
The report counts them and names any whose answers changed. From here on, "this file's ids" means
the ids after this step. When `-sheet` holds a link and the Claude Docs connector is in the session
(load its guide first), also read the Sheet's Aspire applicant id column, to count this file's
applicants it has no row for.

**4. Show the found-and-missing report, then confirm.** In text, before any write:

```
{file name}: {rows} rows, {unique} applicants ({duplicates} duplicate rows merged{, k with
different answers: @a, @b}).
Handles: {i} Instagram, {t} TikTok, {none} with neither (imported; screening marks them can't vet).
Not imported: {own} of {brand}'s own handles{; rows {n, m} with nothing to tell the applicant by}{;
row {n} shares an id with row {m}}.
Already in Atlas for this review: {existing}. New: {new}.{ Not in the review Sheet yet: {missing}.}
Kept: {n} columns as answers ({the first five headers}, ...); {applied date column} as the applied
date{; no applied date on {d} rows, using today}.
Left out: {payment and tax columns, and {c} card- or account-shaped answers, or "nothing"}.
```

Then, when there is anything to write, ask once with `AskUserQuestion`, built from the counts:
"Add {new} applicants to the {campaign} review in {brand}'s Atlas{ and its review Sheet}? Their
contact details and answers are kept with them, for the team only." With no new applicants, "Add
{missing} applicants Atlas already holds to the {campaign} review Sheet?" The Sheet part is there
only when step 3 read the Sheet. Options: 1) Add them (Recommended); 2) Not now. "Not now" writes
nothing, and the run goes on vetting the list as a plain list. With nothing new and nothing
missing, ask nothing and say every applicant is already imported.

**5. Write to Atlas**, when there are new applicants and the user picked "Add them".
`append_insights` with `asProfileId`, `runKey` `applicant-import-{slug}-{YYYY-MM-DD}`, at most 100
findings per call, each:

- `role: "applicant"`, `schema: "profile"`, `entityKind: "profile"`, `entityId` = the brand
  profile's id;
- `summary`: `Applicant {@handle, or the name when there is no handle} applied to {campaign}`;
- `idempotencyKey`: `{slug}:{aspireApplicantId}:intake`;
- `detail`: `{reviewId: "{slug}", aspireApplicantId, instagramHandle?, tiktokHandle?,
  formAnswers, source: "csv", appliedAt}`, with handles leaving off a network the applicant didn't
  give.

A new applicant's status is `new`: nothing more is written for it. A call is all or nothing; on an
error, fix the finding it names and resend the same call (the keys make a resend safe). A timeout
is resent once as it is. Never change a key to get a finding through.

**6. Read back**, after step 5. Page `list_applicants` again as in step 3. The import is done when
all of this file's ids are there. Any missing is named in the summary as not imported, and the
Sheet gets no row for it.

**7. Add Sheet rows**, when step 3 read the Sheet, it lacks rows for this file's applicants that
Atlas holds, and the user picked "Add them". Bring its header up to **The review Sheet**'s order
first, then append one row per such applicant: Name (step 1), Instagram and TikTok as `@handle`,
Status `new`, every other answer under its column, Source `csv`, Applied, and Aspire applicant id;
Recommendation, Fit score, Evidence, Maybe question and Team call stay blank. Never change a row
already there, a Team call, or a column the team added: rows are matched on Aspire applicant id,
since the team sorts and filters the Sheet. When the connector refuses, say so in one line: Atlas
holds the applicants, and the next import adds the rows.

**8. Summarize** in one line: "{new} applicants added to the {campaign} review ({existing} were
already there), {rows} rows added to the review Sheet."

## When setup is done

A review is set up when `-campaign`, `-criteria`, `-checks`, and `-thresholds` exist for its slug,
and `-red-lines`, `-form-rules`, and `-visuals` are each saved or recorded as a `decline`. Until
then, setup asks only the missing questions, in order, then confirms the batch once.

`-client-view` and `-sheet` are optional: the client contributor role comes later, and an import
with no Sheet writes Atlas only, so a review without them still counts as set up and screening never stops for them. An
interactive setup run still offers a missing one: AR8 for `-client-view`, and for `-sheet` the
"Create the review Sheet for {campaign} now?" question (**The review Sheet**, step 4), which appends
the record when none exists. Screening reads a missing `-sheet` as `sheet: none`.

## Reading the setup back (screening)

How **Creator vetting** reads a review when its criteria source is `applicantreview:{slug}`.
Screening asks no setup question of a complete review, and none of vetting's V1 to V4; a gap or
a missing pointer is asked per steps 3 and 4.

1. **Find the review.** List the active `applicantreview:*-campaign` records whose body names
   this profile. R2 offers them (**Creator vetting**, Per-run questions); with more than R2 has room
   for, R2 offers "An applicant review (pick which next)" and a second `AskUserQuestion` lists the
   three newest reviews by campaign name plus "Another review (type its campaign name)". When R2's
   reviews option covers exactly one review, picking it uses that review without a second question.
   R2 is always asked: a saved review is never used without being picked.
2. **Read it** per **The records**.
3. **Check it is complete** per **When setup is done**. A gap runs setup for the missing questions
   first, then goes on.
4. **Resolve pointers.** `source: campaign:{campaign-slug}` reads `campaign:{campaign-slug}-brief`
   and `-criteria`; `source: vetting:criteria` and `source: vetting:thresholds` read that record's
   body. A pointer to a record that no longer exists names it in words ("the saved {campaign} brief",
   "{brand}'s vetting criteria"), asks AR2 or AR5 again, and replaces the pointer through the
   Phase 5 supersede rule.
5. **Hand it over.** The resolved review goes in the vetting launch as the criteria source: the
   slug, the campaign's name and `campaign key`, criteria, thresholds, the `reject:`
   checks, the review's red lines, form rules, visual checks, the client view, and the Sheet link.
   **How screening applies a review** says how screening applies each.

## How screening applies a review

The one place that says how a **Creator vetting** run changes when its criteria source is
`applicantreview:{slug}`. The vetting main thread and the `atlas-creator-vetting` agent both read
it; **Creator vetting**'s own sections point here rather than repeat it.

What changes against a `vetting` run in **Creator vetting**:

| Part of the run | Applicant review |
| --------------- | ---------------- |
| Fit criteria | The review's criteria, resolved: the campaign's `-brief` and `-criteria` or vetting's criteria it points at, or its own lines |
| Approve, Maybe, Reject lines | The review's thresholds, resolved |
| Language on camera | Always run: swearing, or a word any red line rules out (the brand's or the review's, whatever its `action`), in `analysis.transcript` or `analysis.overlayText` is a Flag citing the line. Swearing is a Fail when `reject:` lists `language-on-camera`. A hit on a `block` red line counts as a failing `block` red line under **Creator vetting**'s **The recommendation**, rule 2, so it rejects whatever `reject:` says; every one of the review's own red lines is `block`. A hit on a brand red line with `flag` or `escalate` keeps that action and stays a Flag, even when `reject:` lists `language-on-camera` (AR3 option 3) |
| Red lines | The brand red lines plus the review's red lines, each its own check |
| Hard stops | The checks the review's `reject:` line lists (`competitor-deals`, `disclosure`, `language-on-camera`), in place of `vetting:hard-rejects` (**Creator vetting**, **The recommendation**, rule 2). Every check runs whatever `reject:` says; one it doesn't list stays a Flag |
| `vetting:criteria`, `vetting:thresholds`, `vetting:hard-rejects` | Not read; the review replaces them. Bought engagement and no recent posts are Flags, never rejects on their own |
| Form answer rules | Not applied yet: an imported applicant's answers are on their Atlas record and in the Sheet (**Importing applicants**), but screening does not read them yet. Each saved rule is listed by name on the page under what is missing, and the run summary names them, so a team never reads a recommendation as having passed them. A form hard stop or required answer therefore never changes the call yet; the team applies it by hand |
| Visual checks | The review's saved checks feed R5 (**Creator vetting**, **4. Visual check**): R5 is still asked, with up to two of the review's `-visuals` checks as its options after "No visual check", the first marked (Recommended). A `named:` check runs as a named check with its saved definition; a `free:` check runs as a free-text check. One check per run, held to **Creator vetting**'s **What a visual check may look for**; it never changes a call. A saved check not run this time is listed under what is missing |
| The page | Shows the campaign's name, the review's checks in words, and the Sheet link when the review holds one |

Everything else (brand safety and fit, competitor deals and disclosure, `vetting:safety-scope` and
the `brand_safety` instruction, the creator calibrations, lessons, the recommendation rule, the feedback loop,
and the state written to Atlas) runs as in a `vetting` run. Every finding carries
`detail.applicantReview` set to the review's slug; `detail.campaign` is set only when the review's
`campaign key` names a saved campaign, to that campaign's slug. `calibrationsApplied[]` names the
`applicantreview:` keys that shaped the call.
