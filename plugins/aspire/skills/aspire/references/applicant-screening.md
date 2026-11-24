# Applicant screening reference

Shared by the `atlas-creator-vetting` agent and the **Creator vetting** section of SKILL.md, for a
campaign's applicants: how a vetting run reads an applicant review's Sheet, how a run changes for a
review, and the scheduled screening that runs with nobody present. A bold section name it cites that
is not here (**Getting the list**, **Main thread: the run**, **Check what Atlas holds**, **What to
read per creator**, **State written to Atlas**, **Copy decisions**, **Atlas quirks that apply
here**, F1, R2 to R5) is in **Creator vetting**; any other is found through `SKILL.md`'s
**Sections** index.

## Contents

- [Reading the review Sheet](#reading-the-review-sheet)
- [Team calls on a review](#team-calls-on-a-review)
- [Applicant reviews](#applicant-reviews)
- [Scheduled screening](#scheduled-screening)
- [Brand-wide brand-safety rejects](#brand-wide-brand-safety-rejects)

## Reading the review Sheet

How vetting reads an applicant review's Sheet (**Applicant review**, The review Sheet) as source 4
of **Getting the list**, and how the team's calls in it reach Atlas.

**When it is offered.** Only when the profile has an applicant review whose
`applicantreview:{slug}-sheet` record holds a link (`sheet: <link>`) and the Sheet has applicant
rows. Before asking R1, the main thread reads the profile's active `applicantreview:*-sheet`
records and opens each linked Sheet to check it has rows. With more than one such review, picking source 4 asks which, as **Applicant review** lists
them. The review picked answers R2 with its applicant review option (criteria source
`applicantreview:{slug}`), so R2 is not asked.

**Reading it.** Through the Claude Docs connector, loading the connector's guide first. Use the
columns **The review Sheet** writes, found by header, case-insensitive, and a Note column when the
team added one. When the connector is not in the session or can't open the Sheet, say so in one
line and offer sources 1 and 2; never ask the user to add a connector. Match rows on the Aspire
applicant id, never on position, because people sort and filter the Sheet. Read each handle like a
CSV's handle column and normalize it per **Getting the list**, so a row with both handles is
vetted on each. A row's **account id** is fixed in step 2 of **Main thread: the run**, before any
R3 fetch: the `entityId` of the row's Team call (**Team calls on a review**), when there is one,
else its Instagram account's when Atlas holds it, else its TikTok account's; when
Atlas holds neither, it is set after R3's fetch, Instagram first. Every list entry from the Sheet
carries it. Every
`feedback` finding for the row is written under it and every lookup below matches on it, so a call
stays on one id even after Atlas starts holding the row's other account.

**What each row becomes**, by its Team call, trimmed and with case ignored:

- **Starts with Approve, Maybe, or Reject** ("Approved", "reject"): **decided**. The matched word,
  lowercased (`approve`, `maybe`, or `reject`), is the row's **Sheet call**, and the row is not
  vetted again.
- **Blank**: undecided, so it goes on the list, unless the review holds a Team call for the row's
  applicant id and the row is not reopened (below): the team decided this application in F1, so
  it is not vetted again and its call stands. A call on the creator from another review, list, or
  campaign does not keep the row off the list.
- **Anything else** ("Yes", "?"): undecided too, read like a blank, and the value is listed in
  **Rows to fix**.
- **No applicant id or no handle**: skipped, and listed in **Rows to fix**.

**Rows to fix** is one list, given in chat and on the page under What's missing: unreadable Team
calls (read like a blank), skipped rows, duplicate rows left to decide in the Sheet,
Sheet calls on creators Atlas doesn't hold yet, and, in a run with nobody present, Sheet calls that
conflict with Atlas (below).

**Duplicate rows.** Counted after the skipped rows are set aside. Rows that repeat one applicant id
with the same Team call (as read under **What each row becomes**) count as one row; with different
Team calls, they are duplicates. A creator (network and handle) with two or more rows is settled
this way:

- Its decided rows all hold the same Sheet call (one row or several): the creator is one decided
  row with that call. Its applicant id is the one carried by the newest Team call on any of these
  rows' ids, else the first of their ids in sort order, so a row added
  later does not change the id a saved call is matched on. Its undecided rows are listed as duplicates and add nothing.
- Its decided rows hold different calls, or it has no decided row: the creator is left for the
  team to settle in the Sheet. It is not vetted, no call is offered or saved, and its rows go in
  **Rows to fix** as "duplicate rows: decide in the Sheet". Each run reads the rows again, so once
  the team fixes them, the rules above apply.

Every list entry from the Sheet carries its row's applicant id, so an F1 answer on it records it. Decided
rows go through **Check what Atlas holds** with the list, so each Sheet call has its account id.
A decided row never goes on the list: it is not fetched, vetted, or counted in R3. When Atlas
doesn't hold its creator, its call is not offered, and it is listed in **Rows to fix** as "not in
Atlas yet: vet this creator from a CSV or pasted list (sources 1 or 2) to add them; the next Sheet
run offers the call". A creator is either a list entry or a Sheet call in a run, never both, so it
gets at most one `feedback` finding per run.

**Which Sheet calls are new.** Take the row's Team call (**Team calls on a review**), saved from the
Sheet or from F1. A decided row's Sheet call is **new** only when it differs from both of its
values:

- the current call: its `userVerdict`
- the last Sheet value seen: its `sheetValue`, or none when it has no `sheetValue` (an F1 answer on
  an undecided row)

A call that matches either is not offered, so a call the team made since in F1 stands, and a call
typed into the Sheet to match it is not asked again. With no Team call, the call is new.

**A Sheet call that conflicts with Atlas.** A new Sheet call conflicts when that same Team call's
`userVerdict` was set outside the Sheet (it has no `sheetValue`, or its `userVerdict` differs from
its `sheetValue`: an F1 answer) and the Sheet now holds a different call. An interactive run offers
it in F1, naming the call Atlas holds, and the person decides. A run with nobody present never
saves it: it is listed in **Rows to fix** as "conflicts with Atlas: {call} saved {date}; settle it
in an interactive run", and the run reports it.

**Reopened rows.** An undecided row (blank or unreadable) is **reopened** only when its Team call
carries a `sheetValue`: the team took back in the Sheet a call saved from there (as it stood or
changed in F1), and no newer call on the applicant was saved since in this review. It is vetted
like any undecided row, and the team's F1 answer on it replaces the old call.

**Offered this run.** At most 50 new Sheet calls, in applicant id order; F1 says how many more
wait for the next run, and the next run offers them, since nothing was saved for them.

**`sheet_calls`** go to the agent: for each new call offered this run, the handle, network,
account id, applicant id, Sheet call, Note, and `agentVerdict` (**State written to Atlas**); for
each reopened row, the handle, network, account id, and applicant id, marked reopened; and
**Rows to fix**, for the page's What's missing. A decided row whose call is not new needs no
entry: Atlas already holds a call for it. Only the first batch of a split list gets the new calls
and Rows to fix, and offers the calls in F1; later batches get only the reopened rows.

**F1 with Sheet calls.** F1's question adds "and save the {k} new calls from the review Sheet" and
lists them numbered `s1`, `s2`, …, each as a call line with its note, naming any whose Team call
differs ("Atlas has Approve from {date}"). Options 1 and 2 save them too;
option 3 saves none. In option 2 the user changes or drops one by its number ("reject s2, drop
s3"); a dropped call is asked again on the next run. Each Note is the user's reason for its call,
for F2 and F3.

**When the list is empty** (every row decided in the Sheet or in Atlas, a duplicate, or skipped), after **Check what Atlas
holds** (**Main thread: the run**, step 2), skip R2 to R5, the launch, and the page. With no new
Sheet calls, say so in one line with **Rows to fix** under it, and stop. Otherwise ask a Sheet-only F1: "Save the {k}
new calls from the review Sheet to {brand}'s Atlas?" with 1) Save them (Recommended); 2) Change
some (type them, for example "reject s2, drop s3"); 3) Decide later (nothing is saved). Read
`vettedAt` from the shell clock once, write what it saves as Team calls (**Team calls on a
review**) with no `reviewPage` and no run summary, then give **Copy decisions**.

**A call line** is `@handle (network): {call}`, with ` | {note}` after it in F1 and the feedback
packet when the row has a Note.

## Team calls on a review

A creator can fit one campaign and not another, so the team's call on an applicant belongs to its
review. Every run on a review (F1, the Sheet-only F1, a scheduled run's step 2, and the override
questions in **Brand-wide brand-safety rejects**) saves and reads the team's calls this way, never
across the brand profile.

- **The row.** One `feedback` finding per call (**State written to Atlas**: role `account_review`
  on the creator's account id, its kind from the call), never edited: a changed call is a new row,
  and the newest row wins. Its `runKey` is `applicant-calls-{slug}` whichever run saves it, so one
  review's calls are one exact filter. `idempotencyKey` `{slug}:{aspireApplicantId}:call-{run}`,
  `{run}` the saving run's id (a scheduled run's own; an interactive run's `vettedAt` in compact
  form, `20261119t190512`). `detail` is a `feedback` finding's, plus `applicantReview` (the slug),
  `aspireApplicantId`, `sourceRunKey` (the `runKey` of the run that saved it), and, when an
  override question kept a brand-wide reject for this review, `brandWideKept` (`{key, version}`:
  the record's key and the `createdAt` of the version kept).
- **Reading them.** `search_insights` with a `term` filter on `detail.account_review.runKey` =
  `applicant-calls-{slug}` (exact, never a prefix: one review's slug can start another's), newest
  first, paged to the end. Per applicant id (`aspireApplicantId`, or `applicantId` on a row saved
  before the rename), the newest row is that applicant's **Team call**. Calls saved before Team
  calls had their own `runKey` count too: also read the `creator-vetting-{profile}` prefix
  (`{profile}` the brand profile's slug, as in every vetting `runKey`), paged. `detailBody` can't be
  filtered, so keep the hits whose `detailBody` has `findingType` `feedback`, `applicantReview` the
  review's slug, and an applicant id, and take the newest row per applicant id across both reads. Rows are never
  copied over: the next call saved for that applicant goes under `applicant-calls-{slug}` and wins
  by being newer. A call saved in another
  review, list, or campaign is never this review's call: it does not keep an applicant off the list,
  show as its call, or count in **Copy decisions**.
- **What it decides.** The Team call is the applicant's call in this review, whatever the
  recommendation, another review, or a brand-wide record says. It reaches no other review and no
  discovery campaign; the only call that does is a brand-safety reject (**Brand-wide brand-safety
  rejects**). So in a review run F2 (**The feedback loop**, Creator notes) offers a note only for
  words the user says reach past this campaign ("never again, they deleted our post"), always with
  stance `note`, never `approve` or `reject`; an overturn or a reason about this campaign is the
  Team call's words. A brand-safety reject reaches the brand through B1 instead.
- **Reading it back and Copy decisions** (**State written to Atlas**; **The feedback loop**) use
  the review's Team calls in a review run, never the profile-wide read: a review's calls are not
  under the `creator-vetting-{profile}` prefix, and a call from outside the review never stands for
  it.

## Applicant reviews

A campaign's applicants are screened against its applicant review: the setup saved once under
`applicantreview:{slug}-*` (**Applicant review**, **The records**). The criteria source is
`applicantreview:{slug}`. The main thread reads the review back per **Applicant review**,
**Reading the setup back (screening)**, and passes it resolved in the launch. Neither asks V1 to
V4, and the main thread asks no setup question of a complete review: a gap or a missing pointer is
asked there, before the launch, and the agent asks none.

**A campaign's applicants.** A list counts as a campaign's applicants when the user's ask says so
(applicants, applications, or screening for a named campaign), or when the export carries an Aspire
campaign id or applicant columns (form answers, an applied date). Nothing else does: without one of
these, R2 keeps {brand}'s vetting criteria as option 1. The campaign is the one the ask names, or the
one whose `-campaign` record carries the export's Aspire campaign id. When neither names one (an
export with applicant columns and no campaign id), ask which campaign with **Applicant review**'s
AR1 before R2. In this use its options are the profile's active reviews by campaign name (up to
three, newest first; with none saved, AR1's own campaign options, up to three), then "Not for a
campaign: use {brand}'s vetting criteria". The answer writes nothing: it only picks the campaign.
Picking a review's campaign makes that review R2's first option; picking "Not for a campaign"
means the list is not counted as a campaign's applicants.

**Before the launch** (**Main thread: the run**, steps 3b and 3d):

- **Read the review back (step 3b).** An applicant review named in R2 is read back per
  **Applicant review**, **Reading the setup back (screening)**, before the launch: any missing setup question asked first, and its pointers
  resolved. Then find the review's saved criteria map as **Scheduled screening**, step 1, does,
  and leave out of the list every applicant whose newest `applicant_screening` record is a
  scheduled run's claim less than 12 hours old (**Scheduled screening**, step 3), saying in one
  line "{n} applicants are being screened by the schedule right now". The schedule finishes them.
  This run writes no claims, so a scheduled run that starts while it is open can screen an
  applicant it is screening too; the newer result then decides the applicant's status.
- **Import the applicant export (step 3d)** when R2 named an applicant review and the list came
  from a CSV: per **Applicant review**, **Importing applicants**, with its own found-and-missing
  report and confirmation, before the launch. From then on the run's list is this file's
  applicants as read back (the ids after **Check what Atlas and the Sheet hold**), never the
  review's other applicants, so the handles R3 approved are the ones looked up. Each list entry
  carries its `aspireApplicantId`, so the agent finds the applicant's answers (**Applicant
  review**, **Applying the form rules**, step 1). "Not now", or an import that stops, leaves the
  list as it was.

How the run changes for a review (criteria, thresholds, hard stops, red lines, language on camera,
form rules, visual checks, the page, and what each finding records) is set out once, in
**Applicant review**, **How screening applies a review**. Read it for every run whose criteria
source is `applicantreview:{slug}`.

## Scheduled screening

How a scheduled task screens an applicant review's new applicants with nobody present. A person
sets it up once per review (**Applicant review**, **Scheduled screening setup**), and its saved
`applicantreview:{slug}-schedule` record is the standing approval for every write, lookup, and Sheet
write below. It is the only vetting that runs unattended. A run screens every applicant whose status
is `new`, 100 at a time, against the review's criteria, the brand safety checks, and each
applicant's form answers, exactly as an interactive applicant review run does (**Applicant
reviews**), and records every applicant's status. Nothing in it asks a question, offers anything,
publishes a page, delivers anything, or runs a destructive tool.

**Statuses.** Atlas holds each applicant's status in its newest `applicant_screening` record: `new`
until one is written, then `screened` (with the recommendation), `waiting_on_data`, or `cant_vet`.
Records are only ever added, so a status changes by adding a newer one. A run claims each batch
before screening it (step 4), so two runs never screen the same applicant, and writes a result only
for an applicant it finished, so a stopped run leaves the rest `new` for the next run to pick up.

**How it starts.** The task runs `/aspire:aspire vet` with the prompt in the README under
**Scheduling applicant screening**, which names the brand's profile, the campaign, and the review's
slug, and says not to ask questions (**Orchestration contract**, **1**, Unattended runs). The main
thread runs Phase 1 and Phase 2 + 3, then these steps. Read the time once from the shell clock
(`date -u +%FT%TZ`), never from the prompt; its date part is `{date}` below, and its compact form
(`date -u +%Y%m%dt%H%M%S`, read at the same moment) is `{run}`, this run's id in the keys below.
Each batch's launch gets its own `runId` per **Running agents**.

1. **Read the review** per **Applicant review**, **Reading the setup back (screening)**, step 5, and
   its `-schedule` record. When any of it is missing, or Atlas returns an unauthorized error,
   publish a one-card page titled "<Brand> Applicant Screening: setup needed" listing what is
   missing (or "Aspire Atlas needs a fresh sign in"), with the mark and the footnote in the "No Atlas
   data on this page" variant of **Artifact standard**, write nothing to Atlas, and end with "Run
   /aspire:aspire and ask to set up the {campaign} applicant review." Without `list_applicants` in
   the session, do the same with "Atlas can't list this review's applicants yet".

   Then find the review's **criteria map**, so every run scores on the same one (**How criteria
   become points**): `search_insights` with a `prefix` filter on `detail.account_review.runKey` =
   `creator-vetting-{profile}` (`{profile}` is the brand profile's slug, as in every vetting
   `runKey`) and `term` filters `detail.account_review.kind` `action_item` and
   `detail.account_review.priority` `low`, newest first, paged, for the newest hit whose
   `detailBody` has `findingType` `summary`, `applicantReview` the review's slug, and a
   `criteriaMap`. Those three are stored but not filterable, so check them on each hit. An
   interactive run on the review counts, so a schedule set up right after one scores as it did.
   Reuse that map when its `source` is the review's criteria record, the active record's
   `createdAt` is before that summary's `vettedAt` (a change to the record saves a new version
   with its own `createdAt`), and each criterion's quoted words, scored and unscored, still appear
   in the record. Otherwise there is no map to reuse: the first batch builds one, and when an
   earlier map was set aside because the criteria changed, step 9 says so.
2. **Save the team's new calls from the review Sheet**, when `-sheet` holds a link. Read it per
   **Reading the review Sheet** (its rows, Team calls, duplicates, Rows to fix, which calls are new,
   and reopened rows), with the reads **Main thread: the run**, step 2, makes for a Sheet. Save each
   new Sheet call offered this run (at most 50) exactly as F1's option 1 saves it (**Reading the
   review Sheet**, F1 with Sheet calls): one Team call row (**Team calls on a review**) with
   `sheetValue` and the row's Note as its words, `sourceRunKey`
   `creator-vetting-{profile}-{date}-{slug}-sheet`, and no `reviewPage`. The schedule's approval
   stands in for F1. Nothing else from the feedback loop runs: no creator note, no lesson, and no
   change to a saved record; the one creator calibration a scheduled run writes is a brand-wide
   brand-safety reject (step 6b). A Team call of Approve or Maybe on a creator with a brand-wide
   brand-safety reject is saved like any other and wins in this review; the record stays as it is,
   and step 9 lists the creator (**Brand-wide brand-safety rejects**, Overriding one). When the Claude Docs connector is not in the session or can't open the
   Sheet, skip this step and note why for step 9. The Sheet never picks who is screened: an
   applicant the team already called in the Sheet is still screened in its turn, so its status
   moves on, and its finding and the review's records keep the team's call apart from the
   recommendation.
3. **Pick the batch.** Call `list_applicants` with `asProfileId`, `reviewId` = the review's slug,
   `statuses` `["new", "waiting_on_data"]`, `limit` 1000, paged with `cursor` to the end; `total`
   is exact. A **claim** is an `applicant_screening` record whose `screeningSummary` starts
   "Claimed for screening by run" (step 4). In the order returned, an applicant is **due** when:
   - it is `new` with no screening record yet (no `screenedAt`);
   - it is `new` and its newest record is a claim more than 12 hours old: the run that claimed it
     stopped, so it is screened again from the start;
   - it is `waiting_on_data` and its newest record is more than 1 hour old.

   A `new` applicant claimed less than 12 hours ago is not due: another run is screening it. The
   batch is the first 100 due applicants. With none due, go to step 9, except on the run's first
   read when step 2 saved no Sheet call: then write nothing and end with "No new {campaign}
   applicants to screen.", so a quiet review adds no record each hour.
4. **Claim the batch.** One `append_insights` call, `runKey` `applicant-screening-{slug}-{date}`,
   one `applicant_screening` finding per applicant in the batch: `schema` and `entityKind`
   `profile`, `entityId` the brand profile's id, `idempotencyKey`
   `{slug}:{aspireApplicantId}:claim-{run}`. For an applicant with an Instagram or TikTok handle,
   `summary` "Claimed for screening by run {run}" and `detail` `{reviewId, aspireApplicantId,
   status: "new"}`, adding `evidence` with the "Waiting on Atlas since" line when its newest record
   holds one (a `waiting_on_data` result, or a stale claim that carried it), so the 48-hour clock
   (step 6) keeps its first time after a stopped run. An applicant with neither handle is
   not claimed: its finding is the final one, `status: "cant_vet"`, `summary` "Applicant {name}
   can't be vetted: no Instagram or TikTok handle", and that reason as its `evidence`. Then read
   every claim on the batch, since `list_applicants` shows only each applicant's newest record:
   `search_insights` with `term` filters `role` `applicant_screening` and
   `detail.applicant_screening.reviewId` the review's slug, a `range` filter `createdAt` from 12
   hours before `{run}`'s time, and a `bool` `should` of `prefix` filters on `idempotencyKey`
   `{slug}:{aspireApplicantId}:claim-`, one per applicant in the batch, paged to the end. Keep in
   the batch only the applicants for which this run's claim is the earliest of those (by
   `createdAt`; on a tie, the lower run id, the key's part after `claim-`): one an overlapping run
   claimed first is that run's, and both runs reach the same answer, whichever reads first. Note
   each one dropped, with the run whose claim was earlier, for step 9's `claimedElsewhere`. When
   none is left, launch nothing and go back to step 3: this run's own claims keep those applicants
   from being due again. A call that fails is resent once as it is; failing again, stop the run
   here (step 9).
5. **Launch `atlas-creator-vetting`** per **Main thread: the run**, step 4, with `run: unattended`
   and `job: screen`, and:
   - the list: the batch, one entry per network and handle as **Getting the list** normalizes it,
     each with its `aspireApplicantId` and name; list name "{campaign} applicants, {date} batch
     {n}", slug `{slug}-{date}-{n}` with `{n}` counting the batches of this run, source `schedule`;
   - the criteria source: the review, resolved as step 1 read it;
   - approved fetches: every handle on the list, Instagram and TikTok alike, under the schedule's
     approval (`fetch:` in `-schedule`), with no separate approval for a TikTok lookup. A handle
     Atlas holds with no posts in the read window (**What to read per creator**) counts as missing
     and is looked up once too, so an empty account is not called can't vet before it is fetched.
     `approved.spend.cap` is the number of handles on the list, in `fetches`: the schedule's
     approval stands in for the Credits question;
   - `schedule_run`: `{run}`, for the keys in step 6;
   - `fit_map`: the map step 1 found, for every batch, the first included; with none, the first
     batch builds it and every later batch gets the one it returned;
   - the R4 answer: Save; `visual_check`: none (a scheduled run runs no visual check, not even the
     review's saved `-visuals` checks, so its batches stay at 100); `sheet_calls`: none; `recipient`: `team`;
   - every input **Main thread: the run**, step 4, gives a later batch of a split list, for the
     second batch on.
6. **What the agent writes**, under `job: screen`:
   for every ten applicants of the batch (not list entries: an applicant with both handles counts
   once), once their calls are made, one `append_insights` call holding each
   applicant's findings per **State written to Atlas** and its `applicant_screening` record, so a
   stopped run never leaves an applicant with one and not the other. The record is anchored like the
   claim, as **Applicant review**, **Applicant status**, says (its key, `summary`, `detail`, and the
   result table), with one rule of its own: an account Atlas is still fetching when the lookup's
   wait ends (**Atlas quirks that apply here**) is `waiting_on_data`, its `evidence` starting
   "Waiting on Atlas since {the first time it waited, as an ISO timestamp}", and a later run
   screens it again. After 48 hours of waiting it is `cant_vet`: "Atlas could not fetch @handle in
   48 hours".

   **Never asks.** Anything an interactive run would put to a person becomes the applicant's Maybe,
   with the question as its `maybeQuestion`: a brand rule the team must settle before the call
   holds, an answer too unclear to judge, a `prompt:` rule the run could not apply. A Maybe from the
   checks keeps its own question. A rule caps an Approve at Maybe this way; it never lifts a call.
   What the run would ask about the review itself (each "Needs the main thread" item, each proposed
   change to the criteria) is never applied: it goes in the batch's run summary for the next person
   who runs vetting on the review.
6b. **Save the batch's brand-wide brand-safety rejects**, after the batch's findings are written.
   Read them back: `search_insights` with a `term` filter on `detail.account_review.runKey` = the
   batch's `runKey`, paged, and keep the `recommendation` findings whose `detailBody` carries
   `brandSafetyReject`. Save each per **Brand-wide brand-safety rejects**, Saving one, Scheduled.
7. **Write the review Sheet** per **Applicant review**, **Writing the review Sheet**, after each
   batch, when `-schedule` says `sheet: write` (its standing approval, so it never asks); with
   `sheet: none`, or a missing `-schedule` line, it writes nothing. Its report line's counts go in
   step 9's summary. Atlas holds every result either way.
8. **Next batch.** Repeat steps 3 to 7 (6b included) until no applicant is due or this run has launched 5
   batches (500 applicants); the next run carries on from there.
9. **Run summary.** One `append_insights` call, `runKey` `creator-vetting-{profile}-{date}-{slug}-schedule`,
   one `summary` finding (`action_item`, `low`), anchored as **State written to Atlas** anchors a run
   summary (the brand's own account, else the account of the first creator on the list Atlas
   holds), `idempotencyKey`
   `vet-{slug}-schedule-{run}-summary`. `detail` carries `findingType: "summary"`, `vettedAt`,
   `applicantReview`, `run`, the batches and their `runKey`s, the counts per status and
   recommendation (from a last `list_applicants` read of this run's applicants, never from the
   agent's packets: a packet that counts differently is named in the summary), the applicants still due (from the last step 3 read), the claims made that were
   not screened (claims this run kept but did not finish), `claimedElsewhere` (each applicant step 4
   dropped because an overlapping run claimed it first, with that run's id), the team calls saved and **Rows to fix** (step 2, or why the Sheet wasn't read),
   the rows the Sheet writes updated (or why none were), `visualChecksNotRun` (the review's
   saved visual checks by name, when it has any), and `criteriaMap` with `mapFrom`: the `run` or `runKey` of the
   summary it was reused from, or `built` with why ("first run on the review", or "criteria changed
   on {date}; scores before and after are on different maps"), and `brandSafety`
   (**Brand-wide brand-safety rejects**, What every run's summary lists). With no account to anchor it, the applicant records are the
   run's record. Then one line, the run's last: "{n} applicants screened for {campaign} ({a}
   approve, {m} maybe, {r} reject, {c} can't vet, {w} waiting on Atlas); {d} still new.{ Visual
   checks not run: {names}.}{ Brand-wide: {b} rejected for brand safety across {brand}, not
   confirmed yet; {o} to confirm in the next interactive run.}" The visual checks sentence is
   there only when the review has saved checks; the brand-wide one only when `brandSafety` lists
   any, `{o}` counting its overturned, disputed, and not-saved creators.

   A run that wrote nothing but claims another run kept (no applicant screened or marked can't vet,
   no Sheet call saved, no Sheet row written, no brand-wide reject saved) adds no summary: like a quiet review, it ends with
   "{k} {campaign} applicants are being screened by run {other run}; nothing left for this run."

**A run that stops** (the session ends, a call fails twice, the task is paused) leaves every
applicant it finished `screened`, `cant_vet`, or `waiting_on_data`, and every applicant it claimed
but did not finish still `new`. The next run screens the unclaimed ones first, and the claimed ones
once their claim is 12 hours old. Claims keep scheduled runs from screening the same applicant
twice, and none is skipped. An interactive run writes no claims, so a scheduled run that overlaps
it can screen an applicant both runs reach; the newer result decides its status.

## Brand-wide brand-safety rejects

A creator who is unsafe for a brand is unsafe for every campaign of it, so a brand-safety reject in
one review also applies across the brand. Every other reject (campaign fit, form answers, a must
criterion, anything but brand safety) stays in its own review, and no creator calibration is
written for it.

**What counts.** In an applicant review run, an applicant's recommendation is a **brand-safety
reject** when it is Reject and **The recommendation**'s rule 2 decided it on a brand safety check
(**2. Brand safety**): a failing `block` red line, the brand's or the review's (a language-on-camera
hit on one included), or a failing check the review's `reject:` line lists (`competitor-deals`,
`disclosure`, `language-on-camera`). A saved competitor's own handle, a form `stop:` rule, an answer
that fails a must criterion, the fit score, and Can't vet never count, and nor does rule 1 applying
a record already saved. The agent marks each on its `recommendation` finding as
`brandSafetyReject: {check, evidence}` (the check by name, and the cited line that failed) and lists
them in its packet.

**The record.** A creator calibration (**Creator calibrations**) on each network the applicant was
vetted on, with stance `reject` and reason `brand-safety`:

- key `creator:{ig|tt}-{handle}`, built as **Creator calibrations** builds it;
- `statement`: "@{handle} ({network}): reject for brand safety across {brand}. {check} (from the
  {campaign} review)", under 280 characters;
- `detail`: `{concern: "requirement", appliesTo: ["creator-vetting", "creator-discovery"], body:
  "stance: reject; reason: brand-safety; handle: @{handle}; network: {network}; profile: <brand
  profile id>; review: <slug>; campaign: <campaign name>; aspire applicant: <id>; check: <check>;
  evidence: <permalink and quoted line>; runKey: <the run's runKey>; saved: <YYYY-MM-DD>; saved by:
  person | schedule {run}; confirmed: yes | no"}`;
- `provenance: "interview"` (the person's answer, or the schedule's setup).

**Which brand.** Calibrations are organization-wide, but this record belongs to the brand profile
its `profile:` names: only that brand's vetting runs and discovery campaigns apply it, and every
other brand's flows read it as absent. When the creator's key already holds another brand's
brand-safety reject, the record takes `-2` (and on).

A creator record with no `profile:` line applies across the organization, as before.

**Saving one.**

- **Interactive (B1).** Asked by the main thread after the last batch's F1 to F4, only
  when R4 was Save, for this run's brand-safety rejects whose call F1 did not turn into Approve or
  Maybe, plus any of the review's earlier ones a scheduled run could not save (its run summary's
  `brandSafety.notSaved`), each with no record of this brand yet and no Team call of Approve or
  Maybe in the review: "Reject these {k} creators for
  brand safety in every {brand} campaign, and keep them out of creator discovery?", listing each as
  `@handle (network): {check}`. Options: 1) Save for every campaign (Recommended); 2) Change some
  (type the ones to keep in this review only); 3) Only this review (nothing is saved). It is its own
  write confirmation. Records are saved with `saved by: person` and `confirmed: yes`. A creator whose
  key already holds any other record (a note, or another flow's call) gets a supersede offer
  instead, with its own Destructive tools confirmation showing both statements. Its gate id is
  `approve-brand-safety`.
- **Scheduled (step 6b).** Saved with nobody present when the review's `-schedule` `save:` line names
  `brand-safety rejects`, under that standing approval, with `saved by: schedule {run}` and
  `confirmed: no`. When the review's Team call on the applicant is already Approve or Maybe (the
  team called it in the Sheet before the run screened it), nothing is written: the team overturned
  the reject first, and a record saved after their call would never count as overturned, so never
  be offered for a lift. It is listed in `brandSafety.notSaved` as "team approved first". When
  the key already holds a brand-safety reject of this brand, nothing is written (it already
  applies). When it holds any other record, nothing is written
  either: an unattended run never supersedes. That creator, and every one when `save:` does not name
  `brand-safety rejects`, is listed in `brandSafety.notSaved` with why, and the next interactive run
  offers it in B1 unless the team approved it first.

**How every run reads one.** From the `creator:*` records the run already reads, keep this brand's
records with `reason: brand-safety`, and work out each one's state; no run writes a state.

| State | When | Another review, or any other vetting run for the brand | Creator discovery |
| ----- | ---- | ------------------------------------------------------ | ----------------- |
| Active | Stance `reject`, and `confirmed: yes`, or `confirmed: no` and not disputed | **Reject** under rule 1, its evidence "Rejected for brand safety across {brand} in the {campaign} review: {check}", adding "Saved by a scheduled run, not confirmed yet." when unconfirmed | Never surfaced |
| Disputed | Stance `reject`, `confirmed: no`, and the source review's Team call on its `aspire applicant` (**Team calls on a review**) is Approve or Maybe and newer than the record's current version (`createdAt`) | **Maybe** under rule 1, its `maybeQuestion` "Rejected for brand safety in the {campaign} review, but the team approved them there. Confirm or lift?" | Never surfaced |
| Lifted | Superseded by stance `note` with a `lifted:` line | No effect on the call; its evidence notes the lift | Surfaced as any creator, the lift shown under "Notes" |

Each state is worked as **The recommendation**'s rule 1, naming the check and the source review. In
its source review (the review its `review:` names) the record is never applied as a saved call:
that review's Team call decides, and a reopened row is vetted again by the checks. In every review
the review's own Team call wins over the record (**Team calls on a review**, What it decides).

**Overriding one.**

1. **The team overturns it** by putting Approve or Maybe in any review's Team call column, or by
   telling an interactive run the reject was wrong (F1). Any run saves that as the review's Team
   call, so the creator is Approve or Maybe in that review only, at once.
2. **Elsewhere the record stays** until an interactive run lifts it: other reviews still reject the
   creator, and discovery still hides them. An overturn in the source review of a record with
   `confirmed: no` makes it **disputed** (the table above), with nothing written.
3. **The next interactive run asks.** An interactive vetting run on any of the brand's reviews, after
   B1, finds this brand's brand-safety records whose active version has stance `reject` and that
   need a person, reading every review's Team calls
   on their creators (`search_insights` with a `prefix` filter on `detail.account_review.runKey` =
   `applicant-calls-`, paged, kept by handle and network): disputed ones; ones the team overturned
   in a review, where that review's Team call is newer than the record's current version and carries
   no `brandWideKept` naming that version; and, with no overturn, ones with `confirmed: no`. A record
   both disputed and overturned in its source review is asked as disputed only. "Newer" compares the
   Team call row's `createdAt` with the record version's `createdAt`, never `vettedAt`. Each is
   its own question, at most four per call and eight per run (the rest wait for the next run), and
   each answer that changes the record is then carried out by the main thread with its own
   Destructive tools confirmation, showing the current and the new statement:
   - **Overturned in a review:** "@handle is rejected for brand safety across {brand} (from the
     {source campaign} review), and the team approved them in the {campaign} review. Lift that for
     every campaign, or only for this review? Your answer is saved to Atlas." When the overturn is in
     the source review itself, "and the team approved them there" replaces the review's second
     naming. Options: 1) Lift it for
     every campaign; 2) Only for the {campaign} review; 3) Decide later (asked again next run).
   - **Disputed:** "The team approved @handle in the {campaign} review, where the brand-safety reject
     came from. Lift it for every campaign? Your answer is saved to Atlas." Options: 1) Lift it for
     every campaign (Recommended); 2) Keep it for other campaigns; 3) Decide later.
   - **Unconfirmed, not overturned:** "A scheduled run rejected @handle for brand safety across
     {brand} (from the {campaign} review): {check}. Confirm it? Your answer is saved to Atlas."
     Options: 1) Confirm the reject (Recommended); 2) Lift it for every campaign; 3) Decide later.
4. **What each answer saves.**
   - **Lift it for every campaign:** `supersede_calibration` with `concern: "preference"`, the
     `statement` "@{handle} ({network}): note. Brand-safety reject from the {campaign} review lifted
     for every campaign on {YYYY-MM-DD}: {why}", and the body with stance `note`, the same `reason`,
     `profile`, `review`, `campaign`, `aspire applicant`, and `check` lines, no `confirmed` line,
     and the line `lifted: brand-safety reject from the {campaign} review lifted by {name} on
     {YYYY-MM-DD}: {why}`, `{name}` the person's name as `get_status` gives it, `{why}` the Team
     call's words or the user's. Other reviews then treat the creator as undecided, and discovery may surface them.
     Retracting the record outright is a separate ask with its own Destructive tools confirmation.
   - **Only for the {campaign} review:** the record stays as it is; a Team call row in that review
     repeating its call with `brandWideKept`, so the run stops asking about it for that review.
   - **Keep it for other campaigns** and **Confirm the reject:** `supersede_calibration` with
     `confirmed: yes` and `confirmed by: {name} on {YYYY-MM-DD}`. A source review's Team call stays as
     it is. A record a person confirmed is never disputed: a later overturn in any review, its
     source included, is asked as an overturn.
   - **Decide later**, or the supersede's "Keep current": nothing is saved.

**What every run's summary lists.** The run summary's `detail.brandSafety`: `saved` (each record this
run saved, with `confirmed`), `notSaved` (each with why), `overturned` (each creator the team approved
in a review while the record stays, as "Team approved in {review}, rejected for brand safety across
the brand: confirm in the next interactive run"), `disputed`, and `unconfirmed`. An interactive run's
summary is written by the agent before B1, so it lists `found` (the run's brand-safety rejects) and
the states it read; what B1 and the override questions saved is in the records themselves and in
the chat answer. A scheduled run reads the brand's records
and every review's Team calls on their creators as item 3 of **Overriding one** does, and lists
every record of the brand in each state, not only the ones it touched, so the team sees them soon; an
interactive run's chat answer gives the same lists in a line each.
