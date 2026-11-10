---
name: page-standard
description: >
  Shared skill for Aspire Atlas agents: the skeleton every published page follows (who it is
  for and what it covers, the answer first, up to three insights, ranked next steps, decisions
  kept apart, real evidence, how it was worked out, what is missing, what Atlas can draft next),
  the reader and evidence rules, and the self-check against the reader standard (R1 to R12)
  every page runs before it is published. Agents load it before they build a page. It is not
  a command.
user-invocable: false
metadata:
  author: Aspire
---

# Page standard: the skeleton and the self-check

Every page an Atlas agent publishes holds the nine parts below and is checked against R1 to R12
before it goes out. The checks are defined once, in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/reader-standard.md`; the quality review runs the
same ones on a finished page. Read that file with this one. The parts are fixed. The look is not:
a creator profile, a competitor brief, and a rights log should still look different. Decide what
this question and this reader need first, then fit the nine parts to it.

This skill sets what a page says. `skills/aspire/references/artifact-standard.md` sets the mark
and the source line, `skills/aspire/references/recipient-lens.md` sets the reader, and
`skills/aspire/references/theme.md` sets the colors and type, `blocks.md` in this folder holds
the parts each page is built from, with their markup, `page-check.md` holds the self-check
script, and `examples.md` lists the evidence each
approved example sets, by question code. **The flow's own reference wins**
wherever it sets a rule: its layout, what its page leaves out, who sees money, and the form its
evidence takes. This skill fills in what the reference leaves open.

## Contents

- [1. The skeleton](#1-the-skeleton)
- [2. Reader rules](#2-reader-rules)
- [3. Evidence standards](#3-evidence-standards)
- [4. Build loop](#4-build-loop)
- [5. Markup and the scripted checks (R1, R2, R6, R11)](#5-markup-and-the-scripted-checks-r1-r2-r6-r11)
- [6. How each check is judged](#6-how-each-check-is-judged)
- [7. The page check in the result](#7-the-page-check-in-the-result)

## 1. The skeleton

| # | Part | What it holds | Check |
| - | ---- | ------------- | ----- |
| 1 | Who it is for and what it covers | The reader, the brand, the date range, and each platform with its post count. On a team page, a platform with no data is named as not covered. The method section repeats the platform counts. | R1, R2 |
| 2 | Lead with the answer | The headline is the conclusion, written last, from the decision. Never a topic title ("Creator performance overview" fails; "49 creators reviewed. Contact 11 this week." passes). | R3 |
| 3 | Up to three insights | Each is a claim, the evidence, the comparison (last period, peers, a goal, the account's own baseline), then a "So:" line with the action. Hedges go in the "So:" line, never in the claim. The headline insight gets one chart. | R4 |
| 4 | Ranked next steps | Each says what to do, who does it, by when, and what it should change. | R5 |
| 5 | Decisions kept apart | What the reader must approve, in its own section, each with its deadline when it has one. When nothing does, the section says "Nothing needs approval." | R6 |
| 6 | Real evidence | Real posts and creators from this run, linked, with thumbnails or timestamps, below the argument. | R7 |
| 7 | How it was worked out | The scoring weights and the reasoning behind every score and recommendation, and the platform counts again. | R8, R2 |
| 8 | What is missing | Team pages only. Missing data and what connecting it would add ("Paid results need a connected Meta ad account"). | R9 |
| 9 | What Atlas can draft next | The drafts Atlas can make next, for example outreach to the 11, offers, discount codes. Nothing is sent without approval. | Judged (`draftNext`) |

A part that applies but has nothing to show says so in one line ("Nothing needs approval", "No
insights this run: 3 posts is too few to compare"). A part does not apply, and is reported `n/a`
with its reason, when:

- **The reader standard or the quality review marks its check N/A for this kind of page**
  (`reader-standard.md`; `quality-review.md`, section 3). For example: R2 on a page about one
  post, one creator, or one account on one network, or with no social data at all; R3 and R4's
  three-insight cap on a tracker with no single question.
- **The page is shared outside the team.** A page that carries the shared audience line
  (`artifact-standard.md`, section 2: a client, a creator, or the public) says nothing about what
  Atlas could not read. Leave part 8 out, list only the platforms the page has data for, and name
  no platform as not covered. Put those gaps in the page check's `gaps` for the main thread to
  tell the requester.
- **The flow's reference fixes the layout or leaves the section out.** The PPA deck's slide order,
  the org dashboard's header, the order form, and the creator profile's rule against empty
  sections all stand. Place a part where the reference allows; where it has no place, the part is
  `n/a` with the reason "the {flow} layout".

**Money stays where the flow keeps it.** A flow that keeps amounts out of the page's own HTML (the
program ledger, the program dashboard, negotiation) keeps them there. The headline and insights
state the point without the figure, or point to the team view.

Two checks cover the whole page:

- **Plain language (R11).** No tool, agent, or system names, and none of the words
  `reader-standard.md` lists for R11. Say what was done ("Atlas compared 412 Instagram posts"),
  never who or what did it.
- **Built for this question (R12).** The sections and visuals come from what this question and
  this reader need. A launch timeline on a one-creator profile fails.

## 2. Reader rules

- **A VP or budget owner reads it** (the primary `recipient` is `leadership`, or the page is
  addressed to a VP or budget owner): split the page. The answer, the decisions, and the next
  steps sit on the first screen. The method, all the evidence, and the options left out go below,
  so the person who prepared it can back it up if asked. "Prepared by {preparedBy}" sits at the
  top, with the `preparedBy` the main thread passed, or "{organization} team" when it passed none;
  the person who sends it on can edit the line. A VP page that opens with the method fails R10.
- **A client reads it** (the page carries the shared audience line and its audience is the brand
  as a client of the team that prepared it): build the client version. No revision history, no
  "was 5, now 12", no named rejects, and the brand's own colors and type from `theme.md`. The
  `brand` lens in `recipient-lens.md` (the brand's own safety and approval team) is not a client
  reader. A flow that sets its own client view (the CAS campaign page) keeps it.
- **Any other reader:** the "Prepared for" chip from `recipient-lens.md` and the order the lens
  sets.

## 3. Evidence standards

Where the flow's reference sets the form of its evidence (ad reuse's cut lengths and timing,
creator vetting's verdicts and check order), follow the reference. Otherwise:

- **Ad cut-downs.** A storyboard per ad: a real still for every beat, timecodes, a one-line
  description, a duration strip, and edit notes. When the flow sets no cut length, use five beats:
  hook 0 to 3s, brand 3 to 6s, build 6 to 9s, reveal 9 to 12s, end card +2s. Every timecode the
  page shows is a draft until a 1-second frame scan confirms it (`quality-review.md`, 4.15).
- **Any page that recommends paid spend.** A test plan: one variable per test, a hypothesis, and
  the Scale, Fix, or Stop rule for each.
- **Creator slates.** A reason for every verdict, and which checks each creator reached. A fee
  only when the fee calculator gives one, and an expected return only when the run worked one
  out. Each Maybe carries the one question that would settle it. Screen in the order the user
  ranked the brief's criteria. When the ask comes up short, say so ("3 of the 20 asked for") and
  never pad the list.

## 4. Build loop

1. **List the evidence the approved example sets** for the launch block's `question`, from
   `${CLAUDE_PLUGIN_ROOT}/skills/page-standard/examples.md` (storyboards, test plan, cards with
   thumbnails), when this flow is the one that file's row names as building the page. A flow that
   only feeds another (discovery feeding vetting for I1) skips this step. Read every example the launch block's `examples` lists and list the
   evidence, per `examples.md` steps 1 and 2. Match the evidence, never copy the sections or the
   layout. A code with no example, or a launch with no `question`, skips this
   step.
2. **Refresh the shortlist** when the page shows creators' posts or figures derived from them
   (latest posts, median views, engagement), unless the flow's reference rules out lookups (the
   content library reads only what Atlas holds, in every mode). Call `lookup_creators` with
   `forceRefresh: true`, `entityKind: "account"`, each creator's network as `schema` and handle as
   `identifier`, and the run's own `asOrganizationId` and `asProfileId`, up to 100 items per call.
   Include only the final shortlist the page will show, never a search result or a candidate pool,
   and only creators the run already confirmed Atlas holds (a `found` item from `lookup_creators`, or
   an account `search_creators` returned), so the call starts no discovery. A refresh spends vendor
   budget for every creator in it.
   - The first response carries what Atlas already held. Re-read the same items with
     `lookup_creators` without `forceRefresh` about every 15 seconds, up to roughly 3 minutes.
   - A creator counts as refreshed when its `refresh` result is `skipped` with reason
     `recently-refreshed`, or when a re-read after a `started` result shows the account indexed after
     the refresh call. A creator still `fetching` at the limit, or whose refresh `failed`, keeps the
     data Atlas held: name it with that data's last-indexed time in the page's "what is missing"
     part, or in the page check's `gaps` on a page shared outside the team (section 1).
   - Then re-run the flow's own searches for the refreshed creators. Search indexing lags the
     lookup: if a creator's searches come back empty, or their newest post is older than the newest
     post the re-read carries, retry once after about 30 seconds. A creator whose searches still lag
     the re-read is reported like an unrefreshed one, with the time of the refresh, in "what is
     missing" or the page check's `gaps`. Compute every post-derived figure over the flow's own
     window (its days or post count), never over only the 10 recent posts
     a `lookup_creators` re-read carries.
   - Skip any creator the flow's own reference already refreshed in this run
     (`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/account-resolution.md`). Scheduled runs make
     this refresh too, except in a flow that rules out lookups.
3. **Draft the page** for this question and this reader, from the blocks in
   `${CLAUDE_PLUGIN_ROOT}/skills/page-standard/blocks.md`. They already carry the markup in
   section 5. The blocks set what each part holds and the order of its evidence; the flow's
   reference and this reader set the layout. Add the print block with the page's title as
   `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/artifact-standard.md`, section 6, sets, so the page saves to PDF
   in the light theme with a footer on every page.
4. **Self-check R1 to R12.** Run the script in section 5 for R1, R2, R6, and R11, and judge the
   others against `reader-standard.md`. Fix every fail you can and check again.
5. **Publish**, even when a check still fails, and report it in the page check (section 7).
   - **When the session has no Artifact tool, save the page as a file.** Never skip the page, and
     never return only a summary, because it cannot be published. Write the same page as one
     full HTML document (doctype, head with the title, body) to `{page name}.html` in the
     session's scratchpad or temporary folder, with every style, script, and image inline as a
     published page has them. Send it with `SendUserFile` when the session has that tool.
   - Put the file's absolute path wherever the link would go: `page` in the result packet and
     in the page check, and the summary's page line, as "Saved as a file: {path}". Add "Page
     saved as a file: this session cannot publish pages" to the audit trail's data gaps.
   - A rerun for the same page writes the same file again. Steps 1 to 4 do not change, and
     this rule holds over a flow reference that says to publish with the Artifact tool.

Write the headline last. Draft every other part, then write the headline from the decision the
page supports.

## 5. Markup and the scripted checks (R1, R2, R6, R11)

Mark the parts the script reads. The attributes carry no styling; style the page as the flow and
`theme.md` say.

```html
<!-- Part 1, before the first h2. data-range is the range as the page shows it. -->
<div data-page="scope" data-reader="the influencer manager" data-brand="Brightside Toys"
     data-range="Aug 1 to Oct 28, 2026">
  For the influencer manager | Brightside Toys | Aug 1 to Oct 28, 2026 |
  <span data-platform="instagram" data-posts="412">Instagram 412 posts</span>,
  <span data-platform="tiktok" data-posts="96">TikTok 96 posts</span>,
  <span data-platform="youtube" data-posts="0">YouTube not covered</span>
</div>

<!-- Part 5: one item per decision; data-by only when the decision has a deadline. -->
<section data-page="decisions">
  <h2>Decisions for you</h2>
  <p data-decision data-by="2026-11-04">Approve the 11 creators by Nov 4</p>
</section>
<!-- ...or: <section data-page="decisions"><h2>Decisions</h2><p>Nothing needs approval.</p></section> -->

<!-- Part 4, never inside the decisions section and never around it. -->
<section data-page="next-steps">...</section>

<!-- Part 7 repeats every data-platform element from the scope, with the same counts. -->
<section data-page="method">...</section>
```

- On a team page, list Instagram, TikTok, and YouTube in the scope every time, with a count of 0
  and words such as "not covered" or "no posts" for one with no data. A day with no posts at all is
  still a team page with three zeros. On a page with the shared audience line, list only the
  platforms with posts; the script knows the page is shared when its `atlas-footnote` says "Shared
  with". Show the exact count ("1,412 posts"), never a rounded one ("1.4K").
- A check that is N/A for this page (section 1) goes in `data-na` on the scope, for example
  `data-na="R2"` on a ledger or a one-creator profile; the script reports it `n/a`. Only R2 and R6
  can be N/A; R1 and R11 apply to every page, and naming them fails the check.
- A decisions section with no decision says "Nothing needs approval" (or "No decision needs
  approval"). A `data-by` date is a real date the page also shows.
- Mark anything in someone else's words with `blockquote`, `q`, or `data-quoted`: a creator's
  caption or name, and on a review page, the words of the work under review. The plain-language
  check skips it, and it skips handles, hashtags, emails, and links. Never change a creator's real
  name or handle to pass a check.
- A page that draws its sections in script from embedded data (the org dashboard) has nothing the
  script can read. Judge R1, R2, R6, and R11 from the data and what the page draws, and report
  `scripted` as `read`.
- A page with no `data-page` markup yet (a flow whose reference does not add it) gets `unmarked`
  for R1, R2, and R6. Judge those three by reading; R11 still runs.

Run the check on every page before you publish it. Copy the page into a new temporary folder,
extract the script there from `page-check.md` in this folder (never retype it), and run it:

```bash
d=$(mktemp -d) && cp {page.html} "$d/" && awk '/^<!-- page-check -->$/{f=1;next} /^<!-- \/page-check -->$/{f=0} f' "${CLAUDE_PLUGIN_ROOT}/skills/page-standard/page-check.md" | sed '1d;$d' > "$d/page_check.py" && python3 -I "$d/page_check.py" "$d/{page file name}"
```

It reads only the pages named, writes nothing, and prints one JSON line per check and page:
`pass`, `fail`, `n/a`, or `unmarked`. It exits 0 when nothing failed, 1 when a check failed, and 2
when it could not read a page. When Python is not installed, judge the four by reading and report
`scripted` as `read`.

The script is in `${CLAUDE_PLUGIN_ROOT}/skills/page-standard/page-check.md`, between its
`<!-- page-check -->` marks.

## 6. How each check is judged

What each check asks, when it passes, and how a defect is judged are in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/reader-standard.md`. Never restate them here or in a
flow. Every check is pass, fail, or N/A, never a score.

| Check | How |
| ----- | --- |
| R1 Reader and scope, R2 Platforms covered, R6 Decisions kept separate, R11 Plain language | Script, or by reading when the page is drawn in script or carries no markup |
| R3, R4, R5, R8, R10, R12 | Judgment |
| R7 Real evidence | Judgment, checking each figure against what the run read |
| R9 Names what's missing | Judgment on a team page; N/A on a page shared outside the team |

When the reader standard changes, this table and the script change in the same commit.

- **Sample pages** follow `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/sample-artifact.md`:
  no self-check and no page check.
- **A review page** (a quality review) runs the check with the words of the work under review
  marked as quoted.
- The scripted checks look only at the markup in section 5. A page can pass the script and still
  fail the check in substance (a scope that names "the team" as the reader, an approval worded as
  a next step); judge that too.

## 7. The page check in the result

Return one `page-check` block per page published, at the end of your output, just before the
audit trail block, which stays last. The audit block's `outputs` line names the same result in
words ("page check: 9 pass, 2 fixed, 1 n/a").

```page-check
{"page": "{link, or the file's path}", "reader": "{primary reader}",
 "checks": {"R1": "pass", "R2": "pass", "R3": "fixed", "R4": "pass", "R5": "fixed", "R6": "pass",
            "R7": "pass", "R8": "pass", "R9": "n/a", "R10": "pass", "R11": "pass", "R12": "pass"},
 "draftNext": "pass", "stillFailing": [], "gaps": [], "scripted": "ran"}
```

- `checks`: `pass` (passed the first time), `fixed` (failed, fixed before publishing), `fail`
  (still failing at publish), or `n/a` (does not apply to this page, section 1).
- `draftNext`: part 9, judged the same way.
- `stillFailing`: one entry per `fail`, as "R5 Clear next steps: {why it could not be fixed}".
  Every `n/a` has its reason here too, as "R2 n/a: {reason}".
- `gaps`: on a page shared outside the team, what Atlas could not read, for the main thread to
  tell the requester. Empty on a team page, whose gaps are on the page.
- `scripted`: `ran`, `read` (no Python, or a page drawn in script), or `unmarked`.
