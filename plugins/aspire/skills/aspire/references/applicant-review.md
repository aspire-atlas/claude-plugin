# Applicant review reference

Used by the **Applicant review** section of SKILL.md, and read by **Creator vetting** when it
screens a campaign's applicants. Holds the setup interview for one campaign's applicant review,
the records it saves, the review Sheet it creates, and how a screening run reads it all back.

The main thread's part of this flow. A bold section name in it (**Creator vetting**,
**Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Applicant review (set up once per campaign)](#applicant-review-set-up-once-per-campaign)
- [The records](#the-records)
- [Setup interview](#setup-interview)
- [The review Sheet](#the-review-sheet)
- [When setup is done](#when-setup-is-done)
- [Reading the setup back (screening)](#reading-the-setup-back-screening)

## Applicant review (set up once per campaign)

Trigger when the user wants to screen a campaign's applicants and the campaign has no applicant
review yet ("set up the applicant review for {campaign}", "we have applicants coming in for
{campaign}", "set up screening"), or asks to change one ("change the {campaign} review"). An
applicant review is the setup for screening one campaign's applicants: what fit means, the red
lines and checks, the rules for form answers, the visual checks, what the client sees, and the
review Sheet where the team works the list. It is saved once, so every screening run reads it and
never asks again.

Requires a brand profile. Interactive only: setup asks questions and creates the Sheet, so a
scheduled run never runs it. Without `AskUserQuestion`, say in one line that the applicant review
needs a person to set it up, and stop. Getting the applicants in and screening them is
**Creator vetting**, with the review as its criteria source.

One agency organization can hold many brands and many campaigns, and calibrations are
organization-wide. Every review is keyed by its own slug and names its brand profile in its
`-campaign` record, so two brands' reviews never mix.

## The records

A review is exactly the nine keys in the table below, each `applicant-review:{slug}-{part}`. Keys
starting `applicant-review:` belong to the applicant review and to **Creator vetting** when it
screens for that review; every other flow drops them (**Atlas tools**, Calibration kinds).

**Read a review by its nine exact keys, never by prefix.** One slug can start another
(`acme-holiday` and `acme-holiday-seeding`, or `acme-holiday-seeding` and
`acme-holiday-seeding-2`), so an `applicant-review:{slug}-` prefix read can pick up another review's
records. Keep only the nine keys of the review in hand and drop every other `applicant-review:` key.

`{slug}` comes from the brand and the campaign name: lowercase, hyphenated, no dates (for example
`acme-holiday-seeding`). Show it once so the user can recognize it later; never ask them to invent
it. When `applicant-review:{slug}-campaign` already exists for a different campaign, add `-2`,
`-3`, and so on.

| Key | kind | detail | Holds |
| --- | ---- | ------ | ----- |
| `-campaign` | `brand_fact` | `{section: "business_context", body}`; body lines `campaign: <name>`, `campaign key: <the slug of the saved campaign:{campaign-slug}-brief this review is for, or none>`, `profile: <brand profile id>`, `brand: <brand name>`, `aspire campaign: <Aspire campaign id, or none>`, `window: <dates, or none>` | Which campaign, for which brand profile |
| `-criteria` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body is `source: campaign:{campaign-slug}` (that campaign's `-brief` and `-criteria`), `source: vetting:criteria`, or one line per dimension (archetype and audience, networks, size band, market, content) | What makes an applicant a fit |
| `-checks` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body two lines: `run: brand-safety, fit, competitor-deals, disclosure, language-on-camera` (always all five) and `reject: <the checks that reject on their own, from competitor-deals, disclosure, language-on-camera; or none>` | The checks screening runs, and which reject on their own |
| `-red-lines` | `red_line` | `{action: "block", appliesTo: ["applicant-review", "{slug}"], body}`; body one red line per line | Red lines for this campaign only, on top of the brand's saved `red_line` records |
| `-thresholds` | `guideline` | `{concern: "ceiling", appliesTo: ["applicant-review", "{slug}"], body}`; body is `source: vetting:thresholds` or `approve >= <n>; maybe >= <m>` | Where Approve, Maybe, and Reject sit |
| `-form-rules` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body one rule per line: `required: <form question>`, `stop: <form question> = <answer>`, `boost: <form question> = <answer>`, or `prompt: <instruction for the screening agent>` | How form answers change a call |
| `-visual-checks` | `guideline` | `{concern: "requirement", appliesTo: ["applicant-review", "{slug}"], body}`; body one check per line: `named: <name> = <what counts as a pass>`, or `free: <what to look for>` | What to look for in each applicant's videos |
| `-client-view` | `guideline` | `{concern: "ceiling", appliesTo: ["applicant-review", "{slug}"], body}`; body `client sees: <final-list, content \| final-list \| none>` and `hidden: scores, notes, maybes, team calls` | What the client contributor role sees |
| `-sheet` | `policy` | `{area: "routing", body}`; body `sheet: <link>` or `sheet: none (<reason>)` | The campaign's review Sheet |

`-red-lines`, `-form-rules`, and `-visual-checks` may be declined: a declined question is written
as kind `decline` with the same key (`{topic: "<the question>"}`), so it is never asked again and
screening reads it as "none for this campaign".

## Setup interview

Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the
end, `includeSuperseded: true`) and `get_brand_instruction` with `agentType: "brand_safety"`.
Find the review: a `-campaign` record whose body names this profile and the campaign the user
named. Skip every question whose key is already occupied for that slug. Write answers with
`append_calibration`, `provenance: "interview"`, `statement` under 280 characters, prose in
`detail`.

Ask AR1 to AR8, one `AskUserQuestion` per question, in order, exactly as worded, never as plain
text (**Question format rule**). The tool adds its own free text field; never add "Other" or
"Skip". `{campaign}` is the campaign's name and `{brand}` the profile's brand name.

| # | Question | Options | Key |
| - | -------- | ------- | --- |
| AR1 | Which campaign is this applicant review for? Type its name, and its Aspire campaign id if you have it. | Up to two campaigns already saved for this profile (`campaign:*-brief`), by name; then campaign names drawn from `brand:summary` and `brand:business-context` (for example "{product} seeding") until there are two to four options | `-campaign` |
| AR2 | What makes an applicant a fit for {campaign}? | 1) Use the saved {campaign} campaign brief and criteria (Recommended) (only when AR1 picked a saved campaign); 2) Use {brand}'s vetting criteria (only when `vetting:criteria` exists); then starters drawn from `brand:summary` and `brand:business-context` (for example "Dog owners who post daily walks, 10K to 250K followers, US") until there are two to four options | `-criteria` |
| AR3 | Screening checks every applicant for brand safety, fit, competitor deals, disclosure, and language on camera, and flags what it finds. Which of these should reject an applicant on their own? (multiSelect) | 1) A paid partnership with a saved competitor in the last 90 days; 2) Paid posts without a disclosure; 3) Swearing or words {brand} won't run, said on camera or shown on screen; 4) None: flag them for the team to decide | `-checks` |
| AR4 | {brand}'s saved red lines and competitors apply to every applicant: {red lines and competitors}. Any red lines for {campaign} only? With none saved: {brand} has no saved red lines yet. Any red lines for {campaign}? | 1) Only the saved red lines (Recommended) (with none saved: "No red lines for this campaign"); 2) Add red lines for this campaign (type them, one per line) | `-red-lines` |
| AR5 | Where should the lines sit between Approve, Maybe, and Reject? | 1) {brand}'s vetting thresholds: Approve at {n}, Maybe from {m} (Recommended) (only when `vetting:thresholds` exists); 2) Approve at 70 and up, Maybe from 50 to 69 (Recommended when there are no vetting thresholds; left out when they are 70 and 50); 3) Stricter: Approve at 80, Maybe from 60; 4) Looser: Approve at 60, Maybe from 40 | `-thresholds` |
| AR6 | Should any application form answer change a call? Type one rule per line: required (a missing answer makes a Maybe), hard stop (an answer that rejects), priority boost (an answer that moves an applicant up), or a note for the screening agent. | 1) No form rules for {campaign} (Recommended when the form asks only for handles); 2) Required: every form question is answered; then up to two rules drafted from the form's questions when the form is known (for example "Required: How many pounds overweight is your dog?") | `-form-rules` |
| AR7 | Should screening look for something in each applicant's videos? Name each check and what counts as a pass. | 1) No visual checks (Recommended when the criteria name nothing visual); 2) Face on camera: the creator appears and speaks to camera; then up to two named checks drafted from the criteria (for example "Product on screen: the {product} is visible and in use") | `-visual-checks` |
| AR8 | What should the client see once the review is shared with them? | 1) The final list and the content behind it, with no scores or notes (Recommended); 2) The final list only; 3) Nothing: no client access for {campaign} | `-client-view` |

Rules:

- **AR1** derives `{slug}` and writes `-campaign` with the selected profile's id. A saved campaign
  picked here sets `campaign key:` to its `{campaign-slug}`; a new one sets it to `none` and gets
  no `campaign:` records, which belong to **Creator discovery**. When the request already named the
  campaign, skip AR1 and show the name in the batch confirmation instead.
- **AR2** writes `source: campaign:{campaign-slug}` or `source: vetting:criteria` for options 1
  and 2, never a copy of the criteria, so a later change to the campaign or vetting criteria
  reaches the review. A starter or typed answer is written as criteria lines. AR2 carries the web
  research option (Phase 5 rules) when the brand has no `brand:summary`. AR2 cannot be declined.
- **AR3** writes the `run:` line with all five checks, and a `reject:` line with the checks picked
  (`none` for option 4). Every check runs and flags whatever its answer; AR3 only decides which
  ones reject on their own, the way vetting's hard rejects do.
- **AR4** names every saved `red_line` and `competitor` in the question text, leaving out records
  whose keys belong to another flow (**Atlas tools**, Calibration kinds), so the user only adds to
  them; with none saved it asks the second wording. Option 1 writes a `decline` record.
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
  Calibrations are organization-wide; say so in the question when the organization has more than
  one profile. A `key-exists` follows the Phase 5 supersede rule with its own confirmation.
- **Changing a saved review.** A teammate re-running setup sees each saved answer and is offered
  "Keep as saved (Recommended)" or "Change" per item. Each change goes through
  `supersede_calibration`, one Destructive tools confirmation each.
- After the records are written, create the Sheet (**The review Sheet**) and write `-sheet`.
  Then answer in text: the review's name, what screening will check, the Sheet link, and the next
  step (bring the applicants in with **Creator vetting**).

## The review Sheet

One Sheet per review, where the team filters the applicants and records its calls. Atlas holds the
record; the Sheet is the team's working view of it. Setup only creates the Sheet and saves its
link; filling and updating its rows belongs to the flows that bring applicants in and screen them.

1. **Create it** after the confirmation's option 1, through the Claude Docs connector as a Sheet
   (load the connector's guide first and follow it). Name it "{brand} · {campaign} applicant
   review". Never create it as a page, a Doc, or a Google Sheet.
2. **Write the header row only**, in this order: Handle, Network, Recommendation, Maybe question,
   Team call, Fit score, Evidence, Card link, then one column per form question when the form is
   known, then Status, Source, Applied, Aspire applicant id. Team call is a dropdown of Approve,
   Maybe, and Reject, left blank. Write no applicant rows: the import fills them.
3. **Save the link** as `-sheet` with `sheet: <link>`.
4. **When it can't be created** (the connector is not connected, has no Sheets, or refuses), or
   the user picked "Save without a Sheet": write `sheet: none (<reason in a few words>)` and say in
   one line that screening will work from the review page instead. A later setup run on a review
   whose `-sheet` says `none` offers "Create the review Sheet now" and supersedes the record with
   the link, through the Phase 5 supersede rule.

Share the Sheet only with the people the user names, and never with a client contributor.

## When setup is done

A review is set up when `-campaign`, `-criteria`, `-checks`, `-thresholds`, `-client-view`, and
`-sheet` exist for its slug, and `-red-lines`, `-form-rules`, and `-visual-checks` are each saved
or recorded as a `decline`. Until then, setup asks only the missing questions, in order, then
confirms the batch once.

## Reading the setup back (screening)

How **Creator vetting** reads a review when its criteria source is `applicant-review:{slug}`.
Screening asks none of AR1 to AR8 and none of vetting's V1 to V4.

1. **Find the review.** List the `applicant-review:*-campaign` records whose body names this
   profile. R2 offers them (**Creator vetting**, Per-run questions); with more than R2 has room
   for, R2 offers "An applicant review (pick which next)" and a second `AskUserQuestion` lists the
   reviews, four at a time.
2. **Read its nine keys** exactly (**The records**), never by prefix.
3. **Check it is complete** per **When setup is done**. A gap runs setup for the missing questions
   first, then goes on.
4. **Resolve pointers.** `source: campaign:{campaign-slug}` reads `campaign:{campaign-slug}-brief`
   and `-criteria`; `source: vetting:criteria` and `source: vetting:thresholds` read that record's
   body. A pointer to a record that no longer exists stops the run with "setup needed", naming the
   missing record.
5. **Hand it over.** The resolved review goes in the vetting launch as the criteria source: the
   slug, the campaign's name and `campaign key`, criteria, thresholds, the `run:` and `reject:`
   checks, the review's red lines, form rules, visual checks, the client view, and the Sheet link.
   **Creator vetting**, Applicant reviews, says how screening applies each.
