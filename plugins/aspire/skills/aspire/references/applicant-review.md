# Applicant review reference

Used by the **Applicant review** section of SKILL.md, and read by **Creator vetting** when it
screens a campaign's applicants. Holds the setup interview for one campaign's applicant review,
the records it saves, the review Sheet it creates, how a campaign's applicant export is imported
into Atlas and the Sheet, the schedule that screens new applicants with nobody present, and how a
screening run reads it all back.

The main thread's part of this flow, except **How screening applies a review** and **Applying
the form rules**, which the `atlas-creator-vetting` agent reads too. A bold section name in it (**Creator vetting**,
**Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Applicant review (set up once per campaign)](#applicant-review-set-up-once-per-campaign)
- [The records](#the-records)
- [Setup interview](#setup-interview)
- [The review Sheet](#the-review-sheet)
- [Importing applicants](#importing-applicants)
- [Applicant status](#applicant-status)
- [Writing the review Sheet](#writing-the-review-sheet)
- [When setup is done](#when-setup-is-done)
- [Scheduled screening setup](#scheduled-screening-setup)
- [Reading the setup back (screening)](#reading-the-setup-back-screening)
- [How screening applies a review](#how-screening-applies-a-review)
- [Applying the form rules](#applying-the-form-rules)

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

A review is exactly the ten keys in the table below, each `applicantreview:{slug}-{part}`. Keys
starting `applicantreview:` belong to the applicant review and to **Creator vetting** when it
screens for that review; every other flow drops them (**Atlas tools**, Calibration kinds).

**Read a review by its ten exact keys, never by prefix.** One slug can start another
(`acme-holiday` and `acme-holiday-seeding`, or `acme-holiday-seeding` and
`acme-holiday-seeding-2`), so an `applicantreview:{slug}-` prefix read can pick up another review's
records. Keep only the ten keys of the review in hand and drop every other `applicantreview:` key.
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
| `-form-rules` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body one rule per line: `required: <form question>`, `required: <form question> = <answer>`, `required: every form question`, `stop: <form question> <test>`, `boost: <form question> <test>`, or `prompt: <instruction for the screening agent>`, where `<test>` is `= <answer>`, or `>`, `>=`, `<`, or `<=` and a number (`> 10`; **Applying the form rules**, step 2) | How form answers change a call |
| `-visuals` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body one check per line: `named: <name> = <what counts as a pass>`, or `free: <what to look for>` | What to look for in each applicant's videos |
| `-client-view` | `guideline` | `{concern: "ceiling", appliesTo: ["applicant-review", "{slug}"], body}`; body `client sees: <final-list, content \| final-list \| none>` and `hidden: scores, notes, maybes, team calls` | What the client contributor role sees |
| `-sheet` | `policy` | `{area: "routing", body}`; body `sheet: <link>` or `sheet: none (<reason>)` | The campaign's review Sheet |
| `-schedule` | `policy` | `{area: "cadence", body}`, with no `cadence` field (`append_calibration` refuses `"hourly"`; the body holds the schedule); body lines `screen: hourly` or `screen: daily <HH:MM> <IANA timezone>`, `fetch: instagram, tiktok`, `save: recommendations, statuses, sheet calls, brand-safety rejects`, and `sheet: write` or `sheet: none` | The standing approval for scheduled screening (**Scheduled screening setup**) |

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
| AR6 | Should any application form answer change a call? Type one rule per line: required (a missing answer makes a Maybe), hard stop (an answer that rejects), priority boost (an answer that moves an applicant up), or a note for the screening agent. Screening applies them to every applicant and reads every answer as evidence beside Atlas's own analysis. | 1) No form rules for {campaign} (Recommended when the form asks only for handles); 2) Required: every form question is answered (Recommended when the form asks more than handles); then up to two rules drafted from the form's questions when the form is known (for example "Required: How many pounds overweight is your dog?") | `-form-rules` |
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
- **AR6** option 2 writes `required: every form question`.
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
saves its link; **Importing applicants** adds one row per applicant, after Atlas holds them; after
each vetting run, **Writing the review Sheet** fills in Recommendation, Fit score, Evidence, Maybe
question, and Status from Atlas. **Creator vetting** reads the Team call column back and saves new
calls to Atlas through its feedback questions (**Reading the review Sheet**); Atlas stays the
record, and no flow writes a call back to the Sheet. Vetting owns the five vetting columns; the
team owns Team call and any column it adds. The Sheet's .xlsx download is not an Aspire import: to take
applicants into Aspire, **Creator CSV**, **A review's applicants**, writes the file from Atlas.

1. **Create it** after the confirmation's option 1, through the Claude Docs connector as a Sheet
   (load the connector's guide first and follow it). Name it "{brand} · {campaign} applicant
   review". Never create it as a page, a Doc, or a Google Sheet.
2. **Write the header row only**, in this order, most important first (the Sheet pane shows about
   six): Name, Instagram, TikTok, Recommendation, Fit score, Evidence, Maybe question, Status, Team
   call, then one column per other contact detail and form question when the form is known, then Source,
   Applied, Aspire applicant id. Team call is a dropdown of Approve, Maybe, and Reject, left blank
   until the team overrides Atlas. Rows come from **Importing applicants**.

   A Sheet made before a column joined this order gets the column in its place when an import
   next adds rows or vetting next writes its columns (**Writing the review Sheet**); a `formAnswers` key the header lacks (other than the name columns) gets a column
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
it as that file says.

Then sort each kept column into one of these, by header, case-insensitive:

| Column | Headers | Goes to |
| ------ | ------- | ------- |
| Applicant id | `applicant id`, `aspire applicant id`, `member id`, `creator id`, `id` | `aspireApplicantId` |
| Handles | The handle headers and profile URL values in **Creator vetting**, **Getting the list**, read to a network the same way | `instagramHandle`, `tiktokHandle`, normalized per **Getting the list** |
| Email | The first header naming `email` (`email`, `email address`, `e-mail`) | `formAnswers`, and the applicant's email in step 2 |
| Name | `name`, `full name`, `creator`; else `first name` and `last name`, joined | The Sheet's Name column; the name columns stay in `formAnswers` but get no Sheet column of their own |
| Applied date | `date applied`, `applied`, `applied date`, `applied at`, `date added` | `appliedAt`, as an ISO date |
| Everything else | Contact details (phone, address, city, state, country, zip or postal code), the application form's questions, and Aspire's own columns (followers, engagement, YouTube, campaigns) | `formAnswers`, one key per column |

A `formAnswers` key is the key the snippet printed, and values are kept as text, as written.

**2. One applicant per person.** Dedupe before anything is written. Two rows, or a row and an Atlas
record (step 3), are the same applicant when they share the applicant id, or, with no id column,
the id this step builds, an Instagram handle, a TikTok handle, or the email (step 1's Email row; on a record, the
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
The report counts them and names any whose answers changed, and any matched by a `name-` id alone,
since a name is the only thing tying that applicant to the record. From here on, "this file's ids" means
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
{Not in this file: {questions}, which the review's form rules check; screening asks each new
applicant.}
Kept: {n} columns as answers ({the first five headers}, ...); {applied date column} as the applied
date{; no applied date on {d} rows, using today}.
Left out: {payment and tax columns, and {c} card- or account-shaped answers, or "nothing"}.
```

"Not in this file" names each question a `required:`, `stop:`, or `boost:` rule of the review checks
(**Applying the form rules**, step 2) that no header of the file normalizes to, so the person knows
before the import that every new applicant will be asked it (step 2's flag).

Then, when there is anything to write, ask once with `AskUserQuestion`, built from the counts:
"Add {new} applicants to the {campaign} review in {brand}'s Atlas{ and its review Sheet}{, and
Sheet rows for {missing} it already holds}? Their
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
Recommendation, Fit score, Evidence, Maybe question and Team call stay blank. In the same update,
give the new rows' Team call cells the column's Approve, Maybe, and Reject dropdown (the
connector's dropdown guide says how), so the team can make a call on every row. Never change a row
already there, a Team call, or a column the team added: rows are matched on Aspire applicant id,
since the team sorts and filters the Sheet. When the connector refuses, say so in one line: Atlas
holds the applicants, and the next import adds the rows.

**8. Summarize** in one line: "{new} applicants added to the {campaign} review ({existing} were
already there), {rows} rows added to the review Sheet."

However the import ends (after step 8, with nothing to write at step 4, on "Not now", or on a
stop), the list the run goes on with (this file's applicants, or the list as it was) then loses
every applicant already `screened` in this review, before the launch (**Applicant status**,
Screened once).

## Applicant status

Atlas holds each applicant's status in its newest `applicant_screening` record: `new` until one is
written, then `screened`, `waiting_on_data`, or `cant_vet`. `list_applicants` returns it with that
record's recommendation, fit score, evidence, and Maybe question, and the review Sheet's Status
column shows it (**Writing the review Sheet**). Records are only ever added, so a status changes by
adding a newer one.

Every vetting run on a review writes them, under its own `runKey`:

- **An interactive run** with R4 "Save" writes one for each applicant on its list that has an
  `aspireApplicantId` and a call, in the same `append_insights` call as that applicant's
  recommendation finding, so Atlas never holds one without the other. It leaves to the schedule
  every applicant whose newest record is a scheduled run's claim (its summary starts "Claimed for
  screening by run") less than 12 hours old: that applicant is kept off the list, and the run says
  "{n} applicants are being screened by the schedule right now". "Page only" writes none, and
  an applicant the run did not finish gets none: both stay `new`, so a scheduled run screens them.
- **A scheduled run** writes them as **Applicant screening**, **Scheduled screening** says, which also
  claims each batch first.

**Screened once.** An applicant whose status is `screened` is not screened again in its review
unless the team asks: its recommendation stands, and the team's call goes in the Sheet's Team call
or in F1. Two asks put it back on the list, and its new result is a newer `applicant_screening`
record (records are only ever added):

- **A cleared Team call.** A row the team cleared in the review Sheet is reopened (**Applicant
  screening**, **Reopened rows**) and vetted again by the next interactive run, screened or not. A
  scheduled run saves the Sheet's calls and screens only `new` and stale `waiting_on_data`
  applicants (**Scheduled screening**, steps 2 and 3), so it leaves a reopened screened row to the
  next interactive run.
- **Changed criteria.** When the criteria or thresholds the review uses (its `-criteria` and
  `-thresholds` records, or the records they point to) were saved after an applicant's
  `screenedAt`, the check asks once, in its own `AskUserQuestion`: "{campaign}'s criteria changed
  after {n} of these applicants were screened. Vet them again?", with "Keep their results
  (Recommended)" (description: "They keep the recommendation from the old criteria") and "Vet
  them again" (description: "Each gets a new recommendation under the current criteria"). It is
  asked in the check's place in the run, before any later question, and at most once a run: the
  answer holds for the rest of it, so the check that follows a CSV import (below) applies it
  without asking again, and asks only when the first check did not.

Every
interactive run on a review checks as soon as it knows the review, before any later question, the
storyline, or the page is built on its list (**Applicant screening**, **Reading the review Sheet**
and **Before the launch**):

- **A review Sheet**: as soon as **Applicant screening**, **Reading the review Sheet** finishes
  the list, before R2.
- **A CSV or pasted handles**: right after R2 picks the review and it is read back (step 3b),
  before R5 (step 3c), the import, and the storyline draft. R2 to R4 come first, in one call on the
  whole list, since the review is not known until R2 answers: R3's count can include screened
  applicants, and its approval then covers only the creators still on the list, so no screened
  applicant is looked up. It needs no import: a CSV entry carries its id or handles from the file.
  For a CSV, it runs again on the list the run goes on with once **Importing applicants** (step 3d)
  ends, whatever it wrote (new applicants, nothing new, "Not now", or a stop).

When a long list is split into runs (**Getting the list**, or R5's runs of 25), the parts are cut
from the list as it was read, in file order, and keep their names and slugs ("{list name} (part
{n} of {k})", `{slug}-part-{n}`), so a rerun after some parts were screened updates the same part
pages. Each part loses its screened applicants, and a part left empty is not run: its page, when an
earlier run published one, stays as last published with those applicants' results, and the count
line below names the parts left empty, whose applicants' results are in Atlas. A part that is run lists the applicants it
kept off in a short "Screened earlier" section on its page, each with the recommendation and date
from `list_applicants`, passed in the launch as `screened_earlier` (**Applicant screening**,
**Before the launch**),
so the republished page still shows everyone in the part. When that
changes the number of runs said earlier (in **Getting the list**, at R5, or after the check that
follows the import), the run says the new count once, in the line before the launch:
"{n} of the {k} runs still have applicants to vet; part {p} has no one left, its results are
in Atlas" (for two or more, "parts {p1} and {p2} have no one left, their results are in Atlas").
R5's split note (a list read over 25) counts its runs of 25 the same way, with that line when
a part is left empty, else the plain run count.

It reads the statuses with `list_applicants` (`asProfileId` the brand profile,
`reviewId` the review's slug, `statuses` `["screened"]`, `limit` 1000, paged to the end) and keeps
off the list every entry that matches a screened applicant, except a reopened Sheet row and the
applicants a "Vet them again" answer covers, which stay on it to be vetted again: by `aspireApplicantId` when the entry
has one, otherwise by its handle, normalized per **Creator vetting**, **Getting the list**, and
only on the same network: an Instagram handle against the record's `instagramHandle`, a TikTok
handle against its `tiktokHandle` (as **Applying the form rules**, step 1, matches). It says "{n} {campaign} applicants were already screened, so they keep
their results", counting only the applicants it kept off (no line when that is none). On a CSV run the first pass holds its line, said
once after the import's check, counting each matched applicant record once across both passes
(kept off by handle, then by id, is one); a first pass that leaves no one says it then. When that leaves no one to vet, it skips every question still to come, the
storyline, the launch, and the page: for a review Sheet R2 to R5 (a Sheet with new calls still
asks its Sheet-only F1), for a CSV or pasted handles R5 and the import. Without `list_applicants` in the
session, it skips the check and says once that applicants already screened may be screened again.
An applicant that is `new`, `waiting_on_data`, or `cant_vet` stays on the list, since Atlas may
hold its posts by now. A scheduled run screens only `new` and stale `waiting_on_data` applicants
already (**Applicant screening**, **Scheduled screening**, step 3).

One record:

- `role: "applicant_screening"`, `schema` and `entityKind` `profile`, `entityId` the brand
  profile's id;
- `idempotencyKey` `{slug}:{aspireApplicantId}:screen-{run}`, where `{run}` is the run's id: a
  scheduled run's own, and for an interactive run its `vettedAt` in compact form
  (`20261119t190512`);
- `summary` "{@handle} screened for {campaign}: {Approve | Maybe | Reject}", or "{@handle, or the
  name} can't be vetted for {campaign}: {reason}";
- `detail` `{reviewId, aspireApplicantId, status, recommendation?, fitScore?, evidence?,
  maybeQuestion?}`:

| The applicant's result | `status` | Also |
| ---------------------- | -------- | ---- |
| Approve, Maybe, or Reject | `screened` | `recommendation` (`approve`, `maybe`, `reject`); `fitScore` when the score was worked out; `evidence`, the lines that decided the call (**Applying the form rules**, step 6, quoting rule included); on a Maybe, `maybeQuestion`, what would settle it, with any missing answers after it |
| Can't vet (**Creator vetting**, **The recommendation**, rule 3), or the account can't be found | `cant_vet` | `evidence`, the reason |
| An account Atlas is still fetching when the lookup's wait ends | `waiting_on_data` | Scheduled runs only, per **Scheduled screening**. An interactive run writes no record for it, so it stays `new` |

An applicant gets one record, with the call on its row's account id (**Applicant screening**,
**Reading the review Sheet**: the account an earlier team call was saved on, else Instagram when
Atlas holds it, else TikTok). A row with only a TikTok handle, or whose account id is its TikTok
account, records the TikTok call. An applicant vetted on both networks adds the other network's
call as an evidence line when it differs.

## Writing the review Sheet

How vetting fills in the five columns it owns in the review Sheet (Recommendation, Fit score,
Evidence, Maybe question, Status) from what Atlas holds. One step, written so every vetting run
calls it unchanged: an interactive run once, after its last batch's feedback (**Creator vetting**,
**Main thread: the run**, step 6), and a scheduled run after each batch (**Applicant screening**,
**Scheduled screening**). The main thread runs it, never the agent, through the Claude Docs
connector (load its guide first and follow it).

**When it runs.** The review's `-sheet` holds a link and the connector is in the session.
Otherwise it writes nothing and the run says why in one line ("the {campaign} review has no
Sheet", "Claude Docs isn't connected, so the review Sheet wasn't updated"). Atlas holds every
result either way, and never ask the user to add a connector.

**Approval.**

- **Interactive:** after steps 1 to 3 have counted the rows to change, ask once with
  `AskUserQuestion`: "Write Atlas's results for {n} applicants to the {campaign} review Sheet? Only
  Recommendation, Fit score, Evidence, Maybe question, and Status change{, and the {columns}
  column(s) are added}; Team call and your own columns stay as they are." Options: 1) Write them
  (Recommended); 2) Not now. With nothing to change, ask nothing. "Not now" writes nothing, not
  even a missing column; a later run's write catches up, since it writes whatever differs.
- **Scheduled:** the `-schedule` record's `sheet: write` is the standing approval, so it never
  asks; `sheet: none` writes nothing.

**1. Read Atlas.** `list_applicants` with `asProfileId`, `reviewId` = the review's slug, no
`statuses`, `limit` 1000, paged with `cursor` to the end. The values come from here only, never
from the agent's output or the page, so a run also fills the rows a stopped run or a "Not now"
left. For each applicant:

| Column | Value |
| ------ | ----- |
| Recommendation | `Approve`, `Maybe`, or `Reject` when the status is `screened`; else blank |
| Fit score | The fit score as a whole number when the record has one; else blank |
| Evidence | The record's evidence lines joined with "; " on one line, cut at a word at 300 characters with "…"; else blank. The lines already follow the quoting rule (**Applying the form rules**, step 6): never add a contact detail |
| Maybe question | The record's `maybeQuestion` on a Maybe; else blank |
| Status | The status: `new`, `screened`, `waiting_on_data`, or `cant_vet` |

**2. Read the Sheet**, fresh every time, since the team sorts and edits it: its header row, the
Aspire applicant id column, and the five columns above, found by header, case-insensitive. Page a
partial read to the end. Note each of the five the Sheet lacks: step 4 adds it after the approval,
never before. With no Aspire applicant id column, write nothing and say so in one line.

**3. Match and compare.** Match each row on its Aspire applicant id, trimmed, never on its
position. A cell changes only when its value differs from step 1's, compared trimmed. Rows that
share an id all get that applicant's values. A row whose id Atlas doesn't hold is left as it is.
An applicant Atlas holds with no row gets no row here, since rows come from **Importing
applicants** with the applicant's details: count them for the report.

**4. Write the changed cells only**, by the row and column the step 2 read found them in, at most
200 rows per call. First add each column step 2 found missing, in its place (**The review Sheet**,
step 2), with its cells filled from step 1. Every call takes the revision of the read it rests on
as its `base` (the revision a write of yours returned, for the call after it), and the connector
refuses a call whose `base` is not the Sheet's current revision (`baseIsNotTheRevision`), so a
sort or edit by anyone since the read stops the call before any cell is written. Never write Team
call, Name, the handles, the answers, Source, Applied, the id, or a column the team added, and
never add, remove, move, or sort rows. On that refusal, read the Sheet again and redo steps 3 and 4
from that read for the cells not yet written; a second such refusal in a row stops the write. Any other refusal stops it too. The next run's write fills in
what a stopped write left.

Vetting owns the five columns: a value the team types into one is replaced by Atlas's on the next
write that changes that row. The team's call goes in Team call, a note in a column of its own.

**5. Report** in one line: "{c} rows updated in the {campaign} review Sheet{; {k} applicants have
no row yet: the next import adds them}{; stopped: {reason}}". A scheduled run carries the same
counts in its run summary.

## When setup is done

A review is set up when `-campaign`, `-criteria`, `-checks`, and `-thresholds` exist for its slug,
and `-red-lines`, `-form-rules`, and `-visuals` are each saved or recorded as a `decline`. Until
then, setup asks only the missing questions, in order, then confirms the batch once.

`-client-view`, `-sheet`, and `-schedule` are optional: the client contributor role comes later,
an import with no Sheet writes Atlas only, and a review without a schedule is screened only when a
person runs it, so a review without them still counts as set up and screening never stops for them. An
interactive setup run still offers a missing one: AR8 for `-client-view`, and for `-sheet` the
"Create the review Sheet for {campaign} now?" question (**The review Sheet**, step 4), which appends
the record when none exists. Screening reads a missing `-sheet` as `sheet: none`. A missing
`-schedule` is offered only as **Scheduled screening setup** says, never in the setup interview.

## Scheduled screening setup

How a person sets up the schedule that screens a review's new applicants with nobody present
(**Applicant screening**, **Scheduled screening**). Interactive only: it asks questions and creates the
scheduled task. Its confirmation is the **standing approval** for every Atlas write, lookup, and
Sheet write a scheduled run makes, the way a discovery campaign's cadence or the readouts' routing
is, so a scheduled run never asks.

**When it is offered.** Once, with `AskUserQuestion`, after the last batch of an interactive
screening run on a review with no `-schedule` (after its F1 to F4), and whenever the user asks
("screen {campaign}'s applicants on a schedule", "keep screening new applicants"). Never during the
setup interview, never in an unattended run, and only for a review that is set up (**When setup is
done**). Offer: "Screen new {campaign} applicants on a schedule?" Options: 1) Set up the schedule
(Recommended); 2) Not now. "Not now" saves nothing and is not offered again this session.

| # | Question | Options |
| - | -------- | ------- |
| AR9 | How often should new {campaign} applicants be screened? Each run screens up to 500 new applicants, in batches of 100, and stops when none are left. | 1) Every hour (Recommended); 2) Once a day at 07:00 {timezone} (type another time to change it) |
| AR10 | Should scheduled runs also write each applicant's results to the {campaign} review Sheet? (only when `-sheet` holds a link) | 1) Yes: Recommendation, Fit score, Evidence, Maybe question, and Status (Recommended); 2) No: Atlas only |

`{timezone}` is the IANA timezone saved in `policy:readout-cadence`, else UTC, named in the option.

**Confirm once, then write and create.** Show the always-allow block in SKILL.md **1.6**, then ask:
"Screen new {campaign} applicants {every hour | every day at HH:MM timezone} with nobody present?
Each run fetches the Instagram and TikTok accounts Atlas doesn't hold yet or holds with no recent
posts (a TikTok account costs one paid lookup), saves each applicant's recommendation and status and the team's new calls from
the review Sheet to {brand}'s Atlas{, and writes the results to the review Sheet}, without asking
each time. A creator it rejects for brand safety is also rejected across {brand}'s other campaigns
and kept out of creator discovery, marked not confirmed and listed in the run's summary until
someone confirms or lifts it in /aspire:aspire. It never sends anything, never saves any other
creator note or a lesson, and never changes the review.{ It runs none of the review's visual checks: run one from /aspire:aspire on the applicants
it approves or marks maybe.}" The last sentence is there only when `-visuals` holds a check. Options: 1) Save and create it (Atlas tools are set to Always allow) (Recommended); 2) Not
now. On option 1:

1. Write `-schedule` with `append_calibration` (`provenance: "interview"`), its body from AR9 and
   AR10 (`sheet: none` when AR10 was not asked or answered No). A `key-exists` is a change: below.
2. Create the scheduled task per **Readouts**, **Scheduling (main thread)**, steps 1, 2, 4, and 5
   (this confirmation stands in for its step 3). Name it "Atlas applicant screening: {brand} -
   {campaign}", repeating hourly (`0 * * * *`) or daily at the saved time converted to UTC cron,
   with the prompt in the README under **Scheduling applicant screening**, filled with the
   profile's exact Atlas `name`, the campaign's name, and the review's slug. It must say "do not
   ask questions" and state no date.
3. Answer in one line: the task's name, when it runs, and that pausing the task stops it.

**Changing or stopping it.** A person re-running this setup sees the saved schedule, offered "Keep
as saved (Recommended)" or "Change"; a change goes through `supersede_calibration` with its own
Destructive tools confirmation, then updates the task in place. Pausing or deleting the task stops
the runs; retracting `-schedule` (its own Destructive tools confirmation) withdraws the approval,
so a task left running stops at its next run with "setup needed".

## Reading the setup back (screening)

How **Creator vetting** reads a review when its criteria source is `applicantreview:{slug}`.
Screening asks no setup question of a complete review, and none of vetting's V1 to V4; a gap or
a missing pointer is asked per steps 3 and 4.

1. **Find the review.** List the active `applicantreview:*-campaign` records whose body names
   this profile. R2 offers them (**Creator vetting**, Per-run questions); with more than R2 has room
   for, R2 offers "An applicant review (pick which next)" and a second `AskUserQuestion` lists the
   three newest reviews by campaign name plus "Another review (type its campaign name)". When R2's
   reviews option covers exactly one review, picking it uses that review without a second question.
   R2 is always asked, except when the list is the review's own Sheet (**Applicant screening**,
   **Reading the review Sheet**), where picking that Sheet picks the review: a saved review is never
   used without being picked.
2. **Read it** per **The records**.
3. **Check it is complete** per **When setup is done**. A gap runs setup for the missing questions
   first, then goes on.
4. **Resolve pointers.** `source: campaign:{campaign-slug}` reads `campaign:{campaign-slug}-brief`
   and `-criteria`; `source: vetting:criteria` and `source: vetting:thresholds` read that record's
   body. A pointer to a record that no longer exists names it in words ("the saved {campaign} brief",
   "{brand}'s vetting criteria"), asks AR2 or AR5 again, and replaces the pointer through the
   Phase 5 supersede rule.
5. **Unattended (scheduled screening).** Steps 1, 3, and 4 ask nothing. The review is the one the
   task's prompt names by its slug, and its `-schedule` record is the pick. A gap in the review, a
   missing `-schedule`, or a pointer to a record that no longer exists stops the run with "setup
   needed: the {campaign} applicant review" and writes nothing (**Applicant screening**, **Scheduled
   screening**, step 1).
6. **Hand it over.** The resolved review goes in the vetting launch as the criteria source: the
   slug, the campaign's name and `campaign key`, criteria, thresholds, the `reject:`
   checks, the review's red lines, form rules, visual checks, the client view, and the Sheet link.
   **How screening applies a review** says how screening applies each. For a CSV or pasted
   handles, once the review is read back, before R5, and again after any import (**Creator
   vetting**, step 3d), the list loses every applicant already screened in the review
   (**Applicant status**, Screened once); a review Sheet's list was checked before R2.

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
| Form answer rules and responses | Applied to every applicant per **Applying the form rules** below, whose step 3 table says what each rule does to the call; every response is read as evidence beside Atlas's own analysis |
| Priority order | Within each recommendation, applicants are ordered by their priority keys once every call is made (**Applying the form rules**, **5. Priority**), not by fit score alone; the card numbers follow that order |
| Visual checks | The review's saved checks feed R5 (**Creator vetting**, **4. Visual check**): R5 is still asked, with up to two of the review's `-visuals` checks as its options after "No visual check", the first marked (Recommended). A `named:` check runs as a named check with its saved definition; a `free:` check runs as a free-text check. One check per run, held to **Creator vetting**'s **What a visual check may look for**; it never changes a call. A saved check not run this time is listed under what is missing. A scheduled run runs none (**Applicant screening**, **Scheduled screening**, step 5) |
| The page | Shows the campaign's name, the review's checks and form rules in words, and the Sheet link when the review holds one. Each card's `{DETAILS}` shows the applicant's form rule results and the responses that shaped the call; a rule not checked for an applicant (no record, or the form had no such question) is listed under what is missing |

Everything else (brand safety and fit, competitor deals and disclosure, `vetting:safety-scope` and
the `brand_safety` instruction, the creator calibrations, lessons, the recommendation rule, the feedback loop,
and the state written to Atlas) runs as in a `vetting` run. Every finding carries
`detail.applicantReview` set to the review's slug; `detail.campaign` is set only when the review's
`campaign key` names a saved campaign, to that campaign's slug. `calibrationsApplied[]` names the
`applicantreview:` keys that shaped the call, `-form-rules` included when a rule or response did.
Each finding also carries `aspireApplicantId` when the applicant has a record, and the
`formRules[]`, `responsesUsed[]`, and `priorityKeys` that **Applying the form rules** returns.

## Applying the form rules

One step, run per applicant by the `atlas-creator-vetting` agent after it has read the applicant's
posts and run every check, and before the recommendation. It is written so any screening run can
call it unchanged, the scheduled one included: it asks no question, writes nothing, and changes
nothing on its own; it hands back a result that **Creator vetting**'s **The recommendation** and
the finding use.

**In:** the review's form rules (the `-form-rules` body, one rule per line, or "none" for a
`decline`), the applicant's `formAnswers` (or none), the form's questions (step 2), the resolved
criteria and thresholds, and the applicant's results from the checks (fit components, brand
safety, red lines, hard stops). **Out:** `formRules[]`, `responsesUsed[]`, the fit adjustments,
the call change, `priorityKeys` (step 5), the Maybe question, and the evidence lines. The same in
gives the same out: nothing here depends on another applicant's result.

### 1. Get the answers

Read them from Atlas, never from the list the launch passed, with the same `list_applicants` call
**Importing applicants**, step 3, makes, once per launch (not once per batch of ten inside it).
Every record read sets the form's questions (step 2); only the list's own applicants are screened.
Match each list entry by its `aspireApplicantId` when the launch gives one, otherwise by its
Instagram or TikTok handle (normalized as **Creator vetting**, **Getting the list** says) against
the record's `instagramHandle` or `tiktokHandle`. Keep each applicant's newest record. An applicant
with no record (pasted handles, a list that was not imported, or an import that stopped) has no
answers: every rule is `not-checked` with the reason "no application on record", and the call comes
from the checks alone. Without `list_applicants` in the session, say so once and treat every
applicant that way.

Every key in `formAnswers` is a response, whatever its header: the contact detail columns carry
the answers to the application page's own questions, so none is skipped for looking like contact
data. The import keeps no key for a blank cell, so a question the applicant left blank is simply
absent from their `formAnswers`: an absent key, an empty value, or one of only spaces is no answer.
Payment and tax data was left out at import (**Importing applicants**, by the **Applicant CSV
snippet**) and is never brought back: a `[left out]` value counts as answered but is never read or
quoted, and a column whose header matches the snippet's `PAY` list is never read even if a record
still holds one.

### 2. Match each rule to a question

**Normalizing.** Text is compared after it is lowercased, trimmed, with space runs made single and
a final `?`, `:`, `.`, or `!` dropped. Questions and answers use this one rule.

**The form's questions** are every `formAnswers` key held by any of the review's applicants read in
step 1 (all of them, not only this launch's). A question no applicant answered at all is not on
the form, since nothing shows it was.

**Reading a rule.** After its type (`required:`, `stop:`, `boost:`), a rule's line starts with its
question: the longest start of the line that normalizes to one of the form's questions. What
follows is its test: nothing, ` = <answer>`, or ` >`, ` >=`, ` <`, or ` <=` and a number with an
optional unit (`> 10`, `<= 5 kg`). So a question that itself holds `=` or `>` ("Is your dog > 2
years old?") is read whole, and "Pick one = A = B" tests the answer "A = B" when "Pick one" is the
question. `required:` takes no test or ` = <answer>`; `stop:` and `boost:` need a test.
`required: every form question` (AR6 option 2) is its own form, below. No question matches, two
match equally, or the rest is not a test the type takes: the rule is `not-checked` for every
applicant, with the reason ("the form has no question '{question}'", "two questions match", "not a
test"), and the page lists it under what is missing. Once a rule's question matches, an applicant
without that key left it blank.

That holds when an applicant lacks the key because their export had no column for the question at
all (an export from another campaign, or one made before the question was added): each answer is
`missing`, never `not-checked`, so the applicant is asked it. Flag it once, so the team knows
before it reads the Maybes: when no applicant of a list, an import, or a batch has a key that a
rule's question matched, say "None of these {n} applicants answered '{question}', so their export
may not include it; each one is asked it as a Maybe question." An interactive run says it in chat
with its results and lists it on the page under what is missing; a scheduled run puts it in its
run summary under "Needs the main thread".

`required: every form question` covers every question except the name and email columns, the
contact detail columns, and Aspire's own columns, each as **Importing applicants**, step 1, lists
them: a creator who leaves a phone number blank answered the form. An application question that
sits under a contact header is required only by naming it in its own `required:` rule.

**`= <answer>`** matches when the answer and `<answer>` are the same once normalized ("YES" and
"Yes." match `Yes`). A multi-choice answer (choices split by `;`, `|`, or a line break) matches
when any one choice does. A comma never splits an answer: "Yes, last month" and "Yes, I agree" do
not match `Yes`. No synonyms, no translations, no typos read through ("si", "I agree", and "Yws" do
not match `Yes`).

**A number test** compares the one figure the answer gives:

- A figure is a number ("~15", "about 10 pounds", "Like 20", "10ish", "Vet wants him to lose 20
  pounds" read as 15, 10, 20, 10, 20), or a range ("10-15", "15 to 20", "between 10 and 15").
- Units: both sides are read in the rule's unit, pounds unless the rule says `kg`. An answer's
  figure followed by `kg`, `kgs`, `kilo`, or `kilos`, or by `lb`, `lbs`, `pound`, or `pounds`, is
  turned into the rule's unit (1 kg = 2.2 lb, one decimal); a figure with no unit is read in the
  rule's unit.
- A range passes or fails only when both its ends do: "10-15" is `matched` for `>= 10`,
  `not-matched` for `> 20`, and `unclear` for `> 10`, where its ends fall on either side of the
  line. So a range never rejects or boosts on the reading that suits the rule.
- An answer with no figure reads as 0 when it says there is none ("none", "no", "0", "not
  overweight", "he is not overweight"), and otherwise gives no figure ("idk", "a few", "several
  pounds").
- An answer with more than one figure ("Dixie 8-10, Sky 10-15", "should be 13-15 lbs, 5-7 lbs
  overweight") gives no figure.

No figure is `unclear`, and `unclear` never matches; the evidence quotes it for the team. Anything
looser (reading an answer's meaning, several dogs, a written-out number) belongs in a `prompt:`
rule, which never rejects on its own.

### 3. Apply each rule

Rules apply in the order saved; each gives one `formRules[]` entry, `{rule, type: "required" |
"stop" | "boost" | "prompt", result, answer?, reason?}`, where `rule` is the line as saved and
`answer` the applicant's words, cut to 200 characters and held to step 6's quoting rule. This
table is the one place that says what a form rule does to the call; **The recommendation** and the
agent point here.

| Rule | `result` | What it does to the call |
| ---- | -------- | ------------------------ |
| `required: <question>`, or `required: every form question` | `met`, or `missing` when an answer is empty | A `missing` caps the call at Maybe (**The recommendation**, rule 4): an Approve becomes a Maybe, a Maybe stays one, and a fit score Reject stays a Reject with the missing answer noted. The Maybe question is "Ask them: {question}", one per missing question |
| `required: <question> = <answer>` | `met`, `missing`, or `not-matched` when the answer is not `<answer>` | `missing` as above. `not-matched` caps the call the same way, with the Maybe question "Confirm with them: {question} They said '{answer}'". Use it for an answer the brand needs, and a `stop:` for the answer that rules an applicant out: an answer in between goes to the team, never to a reject |
| `stop: <question> <test>` | `matched`, `not-matched`, `unclear`, or `missing` when blank | `matched` rejects (**The recommendation**, rule 2) naming the rule: "Rejected by form hard stop: '{question}' = '{answer}'". A blank or `unclear` answer never rejects |
| `boost: <question> <test>` | `matched`, `not-matched`, `unclear`, or `missing` when blank | `matched` counts toward priority (step 5) and lifts a fit score Maybe within 10 points of the approve line to Approve (**The recommendation**, rule 5), naming the boost. It never lifts a Maybe that a cap made |
| `prompt: <instruction>` | `applied`, or `not-applied` with the reason | Steers how the responses and posts are read (step 4) and may name a priority signal (step 5). It never rejects, never approves, never relaxes a red line, a competitor, a hard stop, a team call, or another form rule, and never reads an appearance or another trait **What a visual check may look for** rules out. A prompt that asks for one of those is `not-applied`, changes nothing, and goes under "Needs the main thread" as a proposed `stop:` or `required:` rule in its own words |

A rule that is `not-checked` (step 1 or 2) changes nothing and is listed under what is missing.

### 4. Every response as evidence

Read every response, with or without a rule, against the criteria, beside Atlas's own analysis of
the account and its posts (brand fit, brand safety, audience, performance), never in place of it.
A response is the creator's own claim, so it counts the way **Creator vetting**'s **The checks**
counts a bio line: a lead that the posts confirm or contradict.

- **Audience and archetype fit** and **Market fit** can use a response that speaks to a criterion
  ("How many pounds overweight is your dog? 15" against criteria for overweight dogs, or a
  country): confirmed by the posts, it counts like any other evidence; not shown either way, it
  earns at most half of what that evidence would give the component; contradicted by the posts,
  it earns nothing and the contradiction is a reason on the card.
- A response that says the applicant does **not** meet a criterion ("he is not overweight", "we
  don't live in the US") is a miss on that component: it earns nothing. When the criteria word
  that criterion as a must ("must", "has to", "only", or a "not" the creator has to meet, such as
  "the dog must be overweight"), the applicant's own word decides it:
  - **A clear no rejects** (**The recommendation**, rule 2): the answer plainly says the must is
    not met, with no hedge, no condition, and nothing else in it that meets the must ("he is not
    overweight", "Not overweight.", "none", "0", "Her weight is pretty good right now", "Hes thick
    - so not overweight but can still show the food in a fun way"). The
    evidence names it: "Rejected: says the dog is not overweight ('he is not overweight'); the
    campaign needs an overweight dog". A strong account or posts never outweigh it.
  - **An unclear answer is a Maybe** (rule 4), never a reject: it hedges, guesses, or doesn't say
    ("idk", "not sure", "he's a bit chunky maybe"), or part of it meets the must ("snorkie none,
    husky 10lbs overweight"). An answer that says the must is met without a clear figure ("a few",
    "several pounds", "5-7 lbs overweight") meets it: only a number test reads it as `unclear`. Its Maybe question asks them to settle it ("Confirm the dog is
    overweight: they said 'not sure'"). When in doubt whether an answer is clear, it is unclear.
- **Topic evidence**, **Engagement quality**, **Cadence and recency**, and **Format match** stay
  from the posts and Atlas's figures only; a stated follower or engagement figure never replaces
  Atlas's.
- A response that sets off a check (a competitor named as a current partner, a red line's words)
  is evidence for that check, quoted; the check's own rule decides what it does.
- A response that touches no criterion and no check changes nothing, and is not listed.

`responsesUsed[]` lists `{question, answer, use: "fit" | "check" | "rule" | "prompt", effect}` for
each response that shaped a score, a check, or the call, with `effect` in a few words ("+8
audience fit, confirmed by 3 Reels") and `answer` held to step 6's quoting rule.

### 5. Priority

The step gives each applicant its `priorityKeys`, `{signal, boosts, fitScore}`: `signal` is the
value of the priority signal a `prompt:` rule names (for example "use the dog weight answer as the
first priority signal" gives the pounds, read as step 2 reads a figure; `null` when the applicant
gave none; a range gives its low end, so "10-15" gives 10, the reading that never ranks an
applicant above what they are sure of), `boosts` the number of `boost:` rules `matched`, and
`fitScore` the fit score. They
are the applicant's own, so they never change with who else is on the list.

The order comes after every call is made, from the keys, never from a rank worked out per
applicant: inside each recommendation, by `signal` first when the `prompt:` rule says it comes
first (more first, or as the rule says), then `boosts`, most first, then `signal` when the rule
does not put it first, then `fitScore`, highest first; a `null` signal ranks after every value.
The page numbers its cards in that order. A list screened in several launches is ordered the same
way across them, because each finding carries its keys: the run summary of the last launch sorts
every finding of the review by them, so the heaviest dog of the third launch comes before a
lighter one from the first. The review Sheet keeps the team's own sort: vetting never reorders it.

### 6. Evidence and the Maybe question

The card's reasons, the finding's `evidence[]`, the applicant's status record (**Applicant
status**), and the review Sheet's Evidence column name what decided the call, one line each:

- the rule, when a form rule decided it ("Rejected by form hard stop: 'Do you live in the US?' =
  'No'"; "Maybe: did not answer 'How many pounds overweight is your dog?'"; "Approved on form
  boost: 'Has your vet recommended weight loss?' = 'Yes'");
- otherwise the responses and the Atlas evidence together, both cited when both shaped the call,
  for example "Says the dog is 15 lb overweight; 3 recent Reels show the dog on camera; no brand
  safety flags".

**Quoting rule.** A response is quoted as the creator's words, short. What it says decides, not
its header: an application answer under an Address header ("Dog is a 6 yo lab, 2 walks a day") is
quoted like any other, while an email address, a phone number, a street address, or a `[left out]`
value is never quoted, in the evidence, the card, `formRules[].answer`, or `responsesUsed[].answer`,
whatever the rule that read it: it is written `[contact detail]` instead. A Maybe from a missing
required answer carries the Maybe question "Ask them: {question}"; with several, one line naming
each. A Maybe for another reason keeps its own question and adds the missing answers after it.

### Worked examples

A pet-food brand's review, approve at 70 and Maybe from 50, with these form rules:

```
required: How many pounds overweight is your dog?
stop: Do you live in the US? = No
boost: Has your vet recommended weight loss? = Yes
prompt: use the dog weight answer as the first priority signal
```

Answers are given in the order of the rules' questions: weight, US, vet.

| Applicant | Answers | Checks | Call and why |
| --------- | ------- | ------ | ------------ |
| A | 15; Yes; Yes | Fit 82, no flags; 3 Reels show the dog | **Approve**, first among the Approves (most pounds): "Says the dog is 15 lb overweight; 3 recent Reels show the dog on camera; no brand safety flags" |
| B | 8; Yes; Yes | Fit 64, no flags | **Approve** on the boost (Maybe within 10 of 70): "Approved on form boost: 'Has your vet recommended weight loss?' = 'Yes'"; after A |
| C | (blank); Yes; No | Fit 77, no flags | **Maybe** (rule 4): "Maybe: did not answer 'How many pounds overweight is your dog?'"; Maybe question "Ask them: How many pounds overweight is your dog?" |
| D | 20; No; Yes | Fit 88 | **Reject** (rule 2): "Rejected by form hard stop: 'Do you live in the US?' = 'No'" |
| E | (blank); Yes; Yes | Fit 41 | **Reject** on fit score (rule 5); the missing answer is noted, and the boost lifts nothing |
| F | no record (pasted handle) | Fit 75 | **Approve** on the checks alone; every form rule listed as not checked: no application on record |

The same brand with number and expected-answer rules:

```
required: Do you agree to the usage in perpetuity? = Yes
stop: Do you agree to the usage in perpetuity? = No
boost: How many pounds overweight is your dog? > 10
stop: How many pounds overweight is your dog? < 3
```

| Applicant | Answers (usage, weight) | Checks | Call and why |
| --------- | ----------------------- | ------ | ------------ |
| G | Yes; "Like 20" | Fit 63 | **Approve** on the boost (20 > 10; a Maybe within 10 of 70): "Approved on form boost: 'How many pounds overweight is your dog?' > 10 ('Like 20')" |
| H | "If paid"; 15 | Fit 81 | **Maybe** (rule 4): "Confirm with them: Do you agree to the usage in perpetuity? They said 'If paid'" |
| I | no; 25 | Fit 85 | **Reject** (rule 2): "Rejected by form hard stop: 'Do you agree to the usage in perpetuity?' = 'no'" |
| J | Yes; "10-15" | Fit 66 | **Maybe** on fit: the boost is `unclear` (10 is not over 10, 15 is), so it boosts nothing |
| K | Yes; "Dixie 8-10, Sky 10-15" | Fit 66 | **Maybe** on fit: the weight is `unclear` (two figures), quoted in the evidence for the team |
| L | Yes; "Not overweight." | Fit 41 once audience fit counts the answer as a miss | **Reject** on fit: "Says the dog is not overweight; no recent post shows otherwise" |
| L2 | Yes; "he is not overweight" | Fit 74, the dog in most posts | **Reject** (rule 2): "the dog must be overweight" is a must, and their own answer plainly says it is not met: "Rejected: says the dog is not overweight ('he is not overweight'); the campaign needs an overweight dog" |
| L3 | Yes; "not sure, he's a bit chunky" | Fit 74 | **Maybe** (rule 4): the answer doesn't settle the must. Maybe question "Confirm the dog is overweight: they said 'not sure, he's a bit chunky'" |
| M | Yes; "2-8" | Fit 74 | **Approve**: the `< 3` stop is `unclear` (2 is under 3, 8 is not), so it never rejects |
| N | Yes; "4 kg" | Fit 72 | **Approve** on fit: 4 kg is 8.8 lb, not over 10, so no boost; the `< 3` stop is `not-matched` |
