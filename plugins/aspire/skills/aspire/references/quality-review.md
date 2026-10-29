# Quality review (is this page or deck ready to send?)

Rubric version 2.0.

The **Quality review** section of SKILL.md launches the `atlas-quality-review` agent with the inputs
below. The agent reads one finished piece of work, runs the rubric in **4**, and publishes a review
page with a verdict, the evidence for every finding, and the fix for each. It reviews:

- every page, deck, card grid, and audit page this plugin publishes (a brief, a shortlist, a vetting
  run, a profile, a readout, a signal, a pitch deck, a dashboard, a program page, a CAS campaign page);
- work the brand made elsewhere and wants checked before it goes out: a pitch, a proposal, an
  agency's deck, a brief, a report.

It never changes the work it reviews, never writes to Atlas, and never starts discovery work. Its
only writes are its own review page and, when `log` is set, one row in the organization's own review
log (**10**). It records what it saw and what to fix; the person decides what to change.

## 1. Inputs

| Input | What it is |
| ----- | ---------- |
| `mode` | `review` (default), `grade` (**9**, for another skill grading a draft), or `sample` |
| `target` | What to review: a Claude artifact link, a Google Slides or Docs link, a Drive file, or a local path (.pptx, .pdf, .docx, .html, .md) |
| `kind` | `plugin` when the target is a page this plugin published (the main thread knows from the flow that made it), else `external` |
| `flow` | For `plugin`: the flow and agent that made it ("Creator brief", `atlas-creator-brief`) |
| `brief` | Optional: what the work was asked to answer (an RFP, a brief, the user's request in their words). Turns on check **4.1** |
| `recipient` | The lens of whoever acts on the work (`recipient-lens.md`) |
| `audience` | Who will see the work, which sets **4.11**, the audience line checked in **4.12**, and the severity of **R11**: `team` (the brand's own team, leadership included), `client` (a brand or agency outside the team), `creator`, or `public`. Default `team` |
| `evidence_dir` | Optional: a folder with the raw output of the run that made the work, for **R7** |
| `media_dir` | Optional: a folder with the videos or a frame index (JSON with `t` and a description per frame) the work's timecodes refer to, for **4.15** |
| `profile_id`, `profile_slug`, tool prefix | Optional. The brand profile sets the page's theme and the category in **4.9** |
| `recheck` | `true` when the user asked to re-check the Atlas figures the work cites (**4.3**), read only. Needs a profile |
| `earlier_review` | The link, or a local file, of an earlier review of the same work, when this is a re-review. A link is republished in place |
| `publish` | `artifact` (default): publish with the Artifact tool. `file:{path}`: write the same page as a full HTML document (doctype, head, body) to that path. `none`: build no page |
| `log` | `file:{path}`, `docs:{Claude Docs link}`, or `none` (default): the organization's own review log (**10**) |
| `checks` | Grade mode only: `reader-standard` (default) or `all` |
| `run` | Always `interactive`. The review has no unattended mode |

## 2. Reading the target

Read all of it before judging anything, and keep a coverage note for **4.0**.

| Target | How to read it |
| ------ | -------------- |
| Claude artifact | The Artifact tool, `action: "read"`. Also list its files (`scope: "files"`) and read any page data or script the page loads, so **4.11** can see what it fetches and **4.15** which images resolve. A Docs artifact: the docs connector's read. For an artifact the user does not own, `read` returns a summary, not the page: say so in the coverage note, mark every quote "(from the summary)", skip the recomputed sums in **4.4**, and recommend asking the owner for edit access or an export for a full review |
| Google Slides or Docs | The Drive connector's read of the file's content, with comments |
| .pptx, .pdf, .docx in Drive | The Drive connector's read. When it returns no text (an upload with no index, or a file over the connector's size limit) and the session has a browser the user is signed in to, open `https://docs.google.com/presentation/d/{id}/htmlpresent` for a deck and read the page text. The connector's read and download tools are both fine; never edit, move, share, or comment on the file |
| Local file | The session's pptx, pdf, or docx skill to extract the text; read .html and .md directly |

Nothing readable: say what was tried, publish nothing, write no log row, and stop (**8**). Speaker
notes, sticky notes, and presenter labels that come through with the text are reported as "check
whether these show on the slide", never as certain on-slide text.

## 3. Which checks apply

Every check runs on every target unless this table marks it `n/a`. A check marked `n/a` is listed
on the page as not applicable, with the reason, never silently skipped.

| Target | 4.x n/a | R checks n/a (`reader-standard.md`) |
| ------ | ------- | ------------ |
| A proposal, pitch, or RFP response | none | R2 unless it cites social data; R12 |
| A plugin report or signal (readout, market signal, quarterly signal, profile, post analysis, ad reuse) | 4.6 Commercial, 4.8 People (unless it names a team) | none |
| A plugin brief, shortlist, or vetting page | 4.8 People | none |
| A plugin dashboard or program page (org dashboard, program dashboard, ledger, CAS campaign, orchestrator, order form) | 4.7 Proof | R3 when the page is a tracker with no single question; R4's three-insight cap |
| A plugin working page (content review, outreach, negotiation, fulfillment, deliverable tracker, affiliate, roster health, content sourcing, content library, shops plan) | 4.7 Proof, 4.8 People | R3 when the page is a tracker with no single question; R4's three-insight cap |
| Any other plugin page | 4.6 Commercial, 4.7 Proof, and 4.8 People, unless the page shows prices, case studies, or a team | none |
| A plugin deck (PPA pitch) | none | none |
| A decision audit page | 4.5 to 4.10 | R3 to R6, R10, R12 |
| A quality review's own page | not reviewed | not reviewed |

On any plugin page, **R2** is n/a only when the page shows no social data. **4.12 Artifact
standard** runs on every page this plugin published, and on external work only when it carries the
Aspire Atlas mark. **4.15** checks timecodes only when the work claims one.

## 4. The rubric

Run the checks in this order. Every check that runs produces one result line:
`{id} {name}: PASS|FAIL|N/A, {one-line reason}`. N/A always gives its reason. Each FAIL is one or
more findings that quote the work (**6**), name their place (slide, section, tab), and carry a
severity (**5**). There are no scores: a yes or no forces a clear decision, and different reviewers
apply it more consistently.

### 4.0 Coverage

Say what was read and what was not: text only or rendered, which slides or tabs, speaker notes or
not, images and charts judged or not. The page opens with this line and the footer repeats it. Never
judge what was not seen.

### 4.1 Brief fit

With a `brief`: list each question or requirement it asks, in its own order and numbering. Find
where the work answers it and mark it **PASS** (it answers exactly what was asked, specifically,
with evidence) or **FAIL**, with a one-line reason. Every FAIL records why:

- `missing`: no answer anywhere, a dodge, or a deferral ("pricing follows"). Critical when
  `audience` is `client` or `public`, High otherwise.
- `thin`: answered in general terms with no specifics or evidence. Medium.

Without a brief, judge against the work's own stated purpose (its title, its "what this page is
for" line, or the flow's job in SKILL.md) and say so.

### 4.2 Structure

- One version: no duplicated or superseded slides, no "V2" beside "V1", no archive or index section
  that repeats the main content with other numbers.
- Nothing missing: every section the work promises (a table of contents, a "see slide 20", a
  "contacts on the next slide") exists and is where it says.
- Page numbers, slide maps, and cross-references match positions.
- Length fits the use: presented live, read alone, or skimmed on a phone.
- For a plugin page: every section its flow's reference lists is present, or left out with the
  reference's leave-out rule and named under data gaps.

### 4.3 Evidence

- Every number has a source, and the source line next to it is the right one (a study's figure under
  "Source: Aspire Atlas" fails).
- Atlas figures carry an as-of date and a window.
- Outside statistics go on the page's verify list; the review does not vouch for them.
- Quotes, pull quotes, and headlines claim no more than the case or data behind them.
- **Atlas re-check** (only when `recheck` is `true`): for up to 10 Atlas figures the work cites (post
  counts, follower counts, view counts, shares), read the same thing with `search_posts` or
  `search_creators` under the same window and say whether it still holds. Never call
  `lookup_creators` or `lookup_posts`. Differences go on the page as "Atlas now shows {x}; the work
  says {y}", with the read's time.

### 4.4 Consistency

The same thing has the same number, name, and term everywhere: creator counts, followers, views,
competitor sets, deal terms, dates, totals. Every sum, share, and percentage is recomputed from the
work's own figures, and a total that does not add up is a finding with the arithmetic shown.

### 4.5 Feasibility

- Budget against what it promises: per-unit math from the work's own numbers (budget over moments
  over creators; slots over campaigns; fee over posts).
- Timeline against the real calendar (holidays, launch dates, a "Q1" moment that falls in May) and
  against what each step depends on.
- Capacity: people, hours, or time shares against the work promised.
An assumption the review adds to make the math work (for example how often an anchor posts) is
labelled as the review's assumption, never as the work's.

### 4.6 Commercial clarity

Fees, what is included and what is extra, minimums, and the terms the price assumes (usage,
exclusivity, allowlisting, commission). A claim that contradicts the work's own caveats ("all-in, no
hidden fees" beside "do the budgets include platform?") is a finding. Price lines shown as both paid
and free are a finding.

### 4.7 Proof

Case studies fit the reader's category and the job being pitched (a launch for a launch), give
results with a baseline (not only "5x"), say what was learned when the brief asks, and carry no
placeholder ("And more...").

### 4.8 People and ownership

Who does the work, in what role, with how much time; who leads day to day; who owns each decision;
what response times are promised. A promise ("named lead", "SLAs") with nothing behind it is a
finding.

### 4.9 Risk and compliance

For every brand: creator disclosure (FTC and platform labels), usage rights and their terms, brand
safety. For a regulated category (health, OTC, supplements, alcohol, finance, children), add: claims
review, expert credential checks, adverse-event routing, and age gating. Read the category from the
brand's saved calibrations when there is a profile, else from the work. A risk the category carries
and the work never addresses is a finding.

### 4.10 Measurement

Metrics with a baseline, a target, and the threshold that changes a decision (scale, stop, renew).
A "rule" with no numbers fails. Metrics the reader's own systems hold (sales, iROAS) are named as
the reader's, never as Atlas's.

### 4.11 Data access and live pages

People do not all see the same data. Each viewer reads through their own connections and role, and
nobody outside the publisher's company can reach that company's private tools. Check:

1. **Live reads.** Does the page read data when it opens (an Atlas call through the viewer's own
   connection, page data, a runtime capability)? For each such read, name the role or connection a
   viewer needs, what a viewer without it sees, and whether the page shows a dated snapshot instead
   of an empty or broken section. A live page with no fallback, or one that does not say whether
   the viewer is seeing live data or a snapshot, is a finding. A page that reads Atlas live cannot
   be shared by public link; say so when the audience is outside the team.
2. **Other connectors.** Figures from a connector other than Atlas (Meta Ads, a store, a mailbox,
   Drive, Slack, a calendar) were read through the publisher's own connection. Name each one, say
   who can refresh or check those figures and who cannot, and confirm the source line names the
   connector (`artifact-standard.md`, section 2). A figure from another connector presented as
   Atlas's is a finding.
3. **Outside tools.** Any figure, chart, screenshot, or link that came from a tool outside the
   bundled connectors and the reader's own (a company BI or reporting tool, a private data store, a
   private chat workspace, a private file) cannot be opened or checked by a reader outside the
   publisher's company. Name it, and recommend replacing it with the figure plus a source the reader
   can reach, or removing it. Links to private dashboards, private chat threads, and private files
   in a client-facing piece are a High finding.
4. **Sharing.** The work itself is often still private when it is reviewed: every plugin page starts
   private. That is not a finding. List it under **Check before sending** as a step ("share {page}
   with {audience} as Viewer"). A finding is only a private link or file *inside* the work that
   the reader will be sent to and cannot open (**3** above).

### 4.12 Artifact standard

For pages this plugin published, and external work that carries the mark, run the checklist in
`artifact-standard.md`, section 4 (**Before publishing**), against the variant section 3 sets for
that kind of page (sample, review, no Atlas data, inline widget, deck, order form). A page that uses
its variant correctly passes. The audience line must match `audience`: a page whose footer says
"Internal use only" while `audience` is `client`, `creator`, or `public` is a Critical finding.
Also check the saved theme is applied when one exists, with semantic colors left alone.

### 4.13 Polish

Typos, stray characters, leftover placeholders or design notes, presenter labels on slides,
inconsistent naming or capitalization, and broken links.

### 4.14 Reader standard

Run every R check in `reader-standard.md`, in ID order, by the rules there: **R7** against
`evidence_dir` when it is given, **R10** on a 1280×800 first screen, each FAIL a finding at its
default severity or higher, and one defect filed once under its most specific check with both IDs
listed in **Failed checks**.

### 4.15 Media and links

1. **Timecodes.** Find every timecode the work claims: storyboard beats, cut lists, "brand at
   0:xx", hook timings.
   - When the media can be reached (a `media_dir` with video files or a frame index, a video file
     beside the target, or post media the Atlas read tools return), check each timecode at 1-second
     resolution, within ±1 second. With a video file and `ffmpeg` on the path, extract frames at 1
     fps from 3 seconds before to 3 seconds after the claimed time and look at them. With a frame
     index or transcript (JSON with `t` and a description), use it directly.
   - Off by more than 1 second: a **High** finding. Quote the work's time, give the observed time
     and what is on screen at the claimed time, and fix the beat and any headline that repeats it.
   - Media that can't be reached is never passed silently. Name the timecodes in the coverage line
     and in **Not verified** ("storyboard timecodes for @handle (no video or frame index
     available)"), and add them to **Check before sending**. Never invent a corrected time.
2. **Images.** Every `<img src>`, CSS `background-image`, and `data:` URI must resolve: a file in
   the artifact's files (`scope: "files"`), a file relative to a local target, or a `data:` URI that
   decodes. An image the reader will see empty is **Critical**. Name each one, and never flag an
   image that resolves.
3. **In-page links.** Every `href="#id"` must match an element id. One that doesn't is **Medium**.
4. **External links.** List them. Fetch one only when WebFetch is available and the domain is
   public; never sign in. Private links stay under **4.11**.

## 5. Severity and verdict

| Level | Means |
| ----- | ----- |
| Critical | Could lose the decision, misleads the reader, or is a legal or compliance gap (an unanswered brief requirement in client or public work (**4.1**), two prices, a private note on a client slide, a handle or number not in the run's data (**R7**), a figure, image, or section the reader will see empty or broken) |
| High | Hurts credibility with a careful reader (numbers that disagree, a promise with nothing behind it, proof off-category, a link inside the work the reader cannot open, a timecode more than a second off, most reader standard failures) |
| Medium | Polish (typos, page numbers, wording, a dead in-page link, a `thin` brief answer) |

Severity sits on findings; checks are PASS, FAIL, or N/A. **Verdict:** any Critical finding means
**Not ready**. High findings without a Critical mean **Ready with fixes**. Otherwise **Ready**, even
with Medium findings. The verdict line gives the one-sentence reason.

**Strengths are judged too.** Quote each one from the work. A strength is evidence a competitor
could not show, wording that mirrors the reader's own brief, a framework people will remember, or
next steps concrete enough to act on. Three to six strengths; never pad.

## 6. Writing rules

- Every finding has three parts: what the work says (quoted), why it matters, and the fix.
- Quote the work word for word and keep quotes short. Never quote personal contact details (emails,
  phone numbers), a private link in full, or anything marked confidential beyond what the finding
  needs.
- Never invent a figure. Every suggested fee, target, name, date, or SLA in a fix is a highlighted
  placeholder (`{budget}`).
- Computed numbers show their math from the work's own figures.
- Say what the review could not see, at the top and in the footer.
- Name people by role, not by name, unless the work's own team slide is the subject of the finding.
- Number findings `F1`, `F2`, … worst first. On a re-review, a finding that persists keeps its
  earlier id, and new ones take the next free number.

## 7. The page

Title "{Work title} Review". One page, published per `publish`: with the Artifact tool (`artifact`),
as a full HTML file (`file:{path}`), or not at all (`none`). A re-review reads `earlier_review`
first; when it is an artifact link and `publish` is `artifact`, publish with `url` set to it, so
the team keeps one link. Load `artifact-design`, and `dataviz` for any chart. Apply the brand's
saved theme when there is a profile (`theme.md`, **Applying the theme**), semantic colors excepted.
Sections, in order, with these exact headings where quoted:

1. **Header:** the mark at the top right and the "Prepared for" chip per `artifact-standard.md`; the
   work's title and where it lives; the verdict stamp (Ready, Ready with fixes, Not ready) and its
   one-sentence reason; the coverage line (**4.0**).
2. **"Before you send"**: each Critical finding in one line, the top three fixes, and the share
   steps from **4.11**, item 4. It fits the first screen at 1280×800, and within two screens at 390px
   wide.
3. **"Scorecard"**: a PASS, FAIL, or N/A tile for each brief requirement (**4.1**), then one for each
   check, each with its one-line reason.
4. **Findings, worst first:** id, severity, check, title, where, the quote, why it matters, the fix.
5. **Strengths:** three to six, each with its quote.
6. Each of these inside a `<details>` element that starts closed, left out under the same rules as
   before: the **consistency table** (item, one place says, another says, fix; **4.4**; left out
   when empty); the **feasibility chart** (budget or capacity against what is promised, with the
   per-unit math; **4.5**; left out when it does not apply); the **data access table** (each live
   read, connector, outside tool, or private link; who can see it; who cannot; the fix; shown
   whenever **4.11** found anything); **suggested fixes** (before-and-after mock-ups of the two to
   four biggest fixes, drawn in CSS, with placeholders highlighted); the full **check before
   sending** list (facts to source or confirm (**4.3**), the Atlas re-check results when it ran,
   timecodes not verified (**4.15**), and who must share what with the reader (**4.11**, item 4));
   and, on a re-review, **earlier findings** (each fixed, still open, or no longer applies).
7. **Footer:** the coverage line again, then the source line per `artifact-standard.md`, section
   3, **Review pages**, with the rubric version and the team audience line (a review is for the
   team, never the work's reader).

The page scrolls vertically only: no horizontal scroll at 390px wide.

## 8. Output to the main thread

The summary is under 200 words; the fixes block and the audit trail are not counted. Line labels
are fixed:

```
Review: {page link | file path | none}
Verdict: {Ready | Ready with fixes | Not ready}
Reason: {one sentence}
Failed checks: {semicolon-separated "{id} {name}" | none}
Critical: {one line per Critical finding, or "none"}
High: {n} · Medium: {n}
Strengths: {three lines, one per strength}
Data access: {one line naming any reader who cannot see part of the work | None found}
Not verified: {what could not be checked, with the reason | none}
Coverage: {one line on what was not seen}
Earlier findings: {F1 fixed; F2 still open; F3 no longer applies}   (re-review only)
```

When the target is unreadable, leave out **Verdict** through **Strengths**, set `Review: none`, and
give `Coverage:` with what was tried.

Then, whenever there are findings, one fenced JSON block:

```json
{
  "quality_review_fixes": [
    {
      "id": "F1",
      "severity": "High",
      "check": "4.4 Consistency",
      "where": "Decisions, item 2; Creators table",
      "quote": "Approve a fee budget of $14,400",
      "why": "The nine fees in the table add to $14,700",
      "fix": "Set the budget to {budget} or change @handle's fee to {fee}",
      "placeholders": ["{budget}", "{fee}"],
      "effort": "S"
    }
  ]
}
```

`effort` is `S` (minutes), `M` (under an hour), or `L` (needs new data or a re-run). The main thread
passes this block to the flow that made a plugin page when the user asks to apply the fixes.

Then the agent's audit trail block, as every agent ends.

## 9. Grade mode (for other skills)

Another skill can call the agent with `mode: grade` to grade a draft it made, inside an interactive
session, so the draft is not graded by the same run that wrote it.

- Inputs: `target` (required), `checks` (`reader-standard`, the default, or `all`), and optionally
  `evidence_dir`, `brief`, `recipient`, and `audience`.
- It builds no page (`publish` is `none`) and writes no log row.
- `checks: reader-standard` returns all 12 R rows, each PASS, FAIL, or N/A; `all` adds 4.0 to 4.15.
- The output is only this JSON block, then the audit trail. No summary lines.

```json
{
  "quality_review_grade": {
    "rubric_version": "2.0",
    "target": "{the target as given}",
    "verdict": "Ready with fixes",
    "checks": [
      {"id": "R1", "name": "Reader and scope", "result": "PASS", "reason": "Names the influencer manager, the brand, Aug 1 to Oct 27", "where": "Header"},
      {"id": "R5", "name": "Clear next steps", "result": "FAIL", "reason": "Three steps with no owner or date", "where": "Next steps"}
    ],
    "findings": ["the same objects as quality_review_fixes"]
  }
}
```

## 10. The review log

An organization can keep its own log of reviews, to compare the review's calls with its own
reviewers' and see which checks they agree on. It is a setting the organization chooses: a file, a
Claude Doc it owns, or none. Nothing goes to Atlas, and nothing goes anywhere the organization did
not name.

- **Where it is saved.** The `quality-review:log` calibration (`policy`, `{area: "routing", body:
  "file:{path}" | "docs:{link}"}`), set from SKILL.md's **Quality review**, Review log. The main
  thread passes it as `log`; without it, `log` is `none`.
- **One row per review.** After publishing, the agent appends one row. Columns, in order (the CSV
  header, or the Doc table's columns):
  `review_id,rubric_version,date,target,kind,flow,audience,verdict,failed_checks,critical,high,medium,expert_verdict,agreement,critique`.
  `review_id` is `QR-{MMDD}-{HHMM}` from the shell clock (UTC); `failed_checks` is
  semicolon-separated `{id} {name}`; `expert_verdict`, `agreement`, and `critique` are always left
  empty for the organization's reviewers to fill in. A file that doesn't exist yet is created with
  the header. Grade mode, sample mode, and an unreadable target write no row.
- **Adjustments.** When the user disputes a finding or names one the review missed, the main thread
  adds a row beside the log (a second table in the Doc, or `{name}-adjustments.csv` next to the
  file): `review_id,date,by,what_changed,why,check,lesson`, with `check` set to the check id or
  `new`.
- **Calibrating the checks.** Every 20 rows that have a reviewer's verdict, work out how often the
  review and the reviewers agree on each check. A check below 80% agreement gets rewritten or split.
  This is the organization's own process; the plugin does not run it.
