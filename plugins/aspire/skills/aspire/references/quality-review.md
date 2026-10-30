# Quality review (is this page or deck ready to send?)

Rubric version 2.1.

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
| `audience` | Who will see the work, which sets **4.11** (item 5, platform disclosures, applies outside the team), the audience line checked in **4.12**, the scope of **R2** and **R9**, and the severity of **R11**: `team` (the brand's own team, leadership included), `client` (a brand or agency outside the team), `creator`, or `public`. Default `team` |
| `page_check` | Optional, for `plugin`: the `page-check` block the agent returned with the page (`skills/page-standard/SKILL.md`, section 7). Used in **4.14** |
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

Nothing readable: say what was tried, publish nothing, write the not-run log row (**10**), and
stop (**8**). Speaker notes, sticky notes, and presenter labels that come through with the text are
reported as "check whether these show on the slide", never as certain on-slide text.

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

On any plugin page, **R2** is n/a when the page shows no social data, or when it covers one post,
one creator, or one account on one network (a post analysis, a content review, a creator profile). **4.12 Artifact
standard** runs on every page this plugin published, and on external work only when it carries the
Aspire Atlas mark. **4.15** checks timecodes only when the work claims one. Outside the team, **R9** is n/a and **4.11**, item 5
runs; on a team page it is the reverse.

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
  reference's leave-out rule and named under data gaps. Outside the team (`audience` `client`,
  `creator`, or `public`), a section left out is left out without comment, and the gap goes to the
  requester only (**4.11**, item 5).

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
   be shared by public link; say so when the audience is outside the team. Outside the team, the
   fallback is the dated snapshot with its "as of" date and nothing else: no error, connection, or
   "couldn't load" message.
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
5. **Platform disclosures.** When `audience` is `client`, `creator`, or `public`, the work says
   nothing about Atlas's own performance, errors, or missing data. These are for the requester, not
   the reader. Flag every statement, note, footnote, chart label, or empty state that:
   - says a read failed, timed out, was partial, or was retried, or that Atlas, a tool, or a
     connection had an error (**Critical**);
   - names data Atlas does not hold or could not collect (a platform, posts, a date range, ad or
     audience data), calls data stale, delayed, or incomplete, or carries a "data gaps",
     "limitations", or "not available" section about the tool (**High**);
   - explains a fallback or snapshot by a failure ("showing cached data because…") (**High**).

   The fix removes the sentence or section from the work and gives it to the requester in the chat
   summary; a section with nothing to show is left out, not explained. Not a disclosure: the source
   line and its "as of" date, a dated snapshot label, figures the reader's own systems hold named as
   theirs (**4.10**), and a next step asking the reader to share their own data, as long as it does
   not say Atlas lacks it. With `audience` `team` this item is N/A: gaps on a team page are expected
   (**R9**).

### 4.12 Artifact standard

For pages this plugin published, and external work that carries the mark, run the checklist in
`artifact-standard.md`, section 4 (**Before publishing**), against the variant section 3 sets for
that kind of page (sample, review, no Atlas data, inline widget, deck, order form). A page that uses
its variant correctly passes. The audience line must match `audience`: a page whose footer says
"Internal use only" while `audience` is `client`, `creator`, or `public` is a Critical finding.
Also check the saved theme is applied when one exists, with semantic colors left alone.

### 4.13 Polish

Typos, stray characters, leftover placeholders or design notes, presenter labels on slides,
inconsistent naming or capitalization. Broken links are not judged here: they are **4.15** or
**R7** (**Broken links**, in **4.15**).

### 4.14 Reader standard

Run every R check in `reader-standard.md`, in ID order, by the rules there: **R7** against
`evidence_dir` when it is given, **R10** on a 1280×800 first screen, each FAIL a finding at its
default severity or higher, and one defect filed once under its most specific check with both IDs
listed in **Failed checks**.

With `page_check`, treat it as the agent's claim, not evidence: judge every R check again. When an
R check the page check marked `pass` or `fixed` fails here, say so in the finding ("the page check
passed R5").

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

**Broken links.** Each broken link is one finding, filed in exactly one place:

| The link | Filed under | Severity |
| --- | --- | --- |
| An in-page `#id` link with no matching id | 4.15, item 3 | Medium |
| A link given as evidence for a creator, post, or number (a post or profile URL) that does not open or opens something else | R7 | Critical |
| Any other public link that does not open | 4.15, item 4 | High when the reader needs it to act, else Medium |
| A private link the reader cannot open | 4.11, item 3 | High |

## 5. Severity and verdict

| Level | Means |
| ----- | ----- |
| Critical | Could lose the decision, misleads the reader, or is a legal or compliance gap (an unanswered brief requirement in client or public work (**4.1**), two prices, a private note on a client slide, a handle or number not in the run's data (**R7**), an Atlas error or failed read shown to a reader outside the team (**4.11**), a figure, image, or section the reader will see empty or broken) |
| High | Hurts credibility with a careful reader (numbers that disagree, a promise with nothing behind it, proof off-category, a link inside the work the reader cannot open, a timecode more than a second off, an Atlas data gap or limitation shown to a reader outside the team, most reader standard failures) |
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

A flow in `/aspire:aspire` can launch the agent with `mode: grade` to grade a draft it made, inside
an interactive session, so the draft is not graded by the same run that wrote it. The launch carries
the `launch` block (`orchestration.md` **5**) like any other; grade mode returns no result packet.

- Inputs: `target` (required), `checks` (`reader-standard`, the default, or `all`), and optionally
  `evidence_dir`, `brief`, `recipient`, and `audience`.
- It builds no page (`publish` is `none`) and writes no log row.
- `checks: reader-standard` returns all 12 R rows, each PASS, FAIL, or N/A; `all` adds 4.0 to 4.15.
- The output is only this JSON block, then the audit trail. No summary lines.

```json
{
  "quality_review_grade": {
    "rubric_version": "2.1",
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
  "docs:{link}"}`), set from SKILL.md's **Quality review**, Review log. The main thread reads it
  before each launch and passes it as `log`; without it, `log` is `none`. A `file:{path}` log is
  never saved for the organization; it is passed for one review when the user names a local file.
- **One row per review.** After publishing, the agent appends one row. Columns, in order (the CSV
  header, or the Doc table's columns):
  `review_id,rubric_version,date,target,kind,flow,audience,verdict,failed_checks,critical,high,medium,expert_verdict,agreement,critique`.
  `review_id` is `QR-{YYYYMMDD}-{HHMMSS}` from the shell clock (UTC), with `-2`, `-3` added when the
  log already has that id; `failed_checks` is
  semicolon-separated `{id} {name}`; `expert_verdict`, `agreement`, and `critique` are always left
  empty for the organization's reviewers to fill in. A file that doesn't exist yet is created with
  the header. Grade mode and sample mode write no row. A review that ran but published no page
  logs its verdict as usual. A review that could not run (an unreadable target) still writes a
  row, with `verdict` set to `Not run: {why, in a few words}` and the check columns and counts left
  empty, so the log holds every review that was asked for. `rubric_version` names the version of the checks that made the
  call; it goes up whenever a check is added, split, or dropped, so agreement is counted per
  version.
- **Adjustments.** When the user disputes a finding or names one the review missed, and confirms
  it, the main thread adds a row beside the log (a second table in the Doc, or `{name}-adjustments.csv` next to the
  file): `review_id,date,by,what_changed,why,check,lesson`, with `check` set to the check id or
  `new`. Feedback given later, with the reviewed work's link, adds a row the same way (SKILL.md,
  **Quality review**, Feedback later), matched to the newest row whose `target` is that link.
- **Calibrating the checks.** Every 20 rows that have a reviewer's verdict, work out how often the
  review and the reviewers agree on each check. A check below 80% agreement gets rewritten or split.
  This is the organization's own process; the plugin does not run it.

## 11. The main thread: run, offer, and review log

What the **Quality review** section of SKILL.md does around the agent: the questions, the launch,
the follow-ups, the review log setting, and the offer after other flows' pages. SKILL.md names
(**Running agents**, **Reading the ask**, **Visual output**, **Decision audit**, Phase 1 to 3,
the Phase 5 supersede rule, the vetting and content review feedback sections) are sections of
SKILL.md. The review needs no write confirmation: it never edits the work, never writes to Atlas,
and never starts discovery work. It is interactive only: never schedule it, and never run it in an
unattended session.

### 11.1 Run

1. **The work.** Use the link or file the user gave. Without one, ask with `AskUserQuestion`,
   header "Review": "What should I review?" Options: "{the newest page published in this session}
   (Recommended)" when there is one, "A Google Slides, Docs, or Drive link (paste it in the box)",
   "A file or a Claude artifact link (attach or paste it)". Naming or pasting a
   link is the approval to read that one file. A Drive file is read through the Drive connector;
   when the connector returns no text and the session has a browser the user is signed in to, the
   agent reads the deck's HTML view, read only (**2**).
2. **Who reads it, and against what.** One `AskUserQuestion` call, skipping what the user already
   said, with the **Reading the ask** confirmation folded into the first question:
   - header "For": "Who will see it?" Options: the reader the ask names (Recommended), "A client",
     "A creator", "Our team or leadership"; the free text takes "the public". The answer sets
     `audience` (**1**) and, with the ask, `recipient`.
   - header "Brief": "Should it answer a brief or RFP?" Options: "Yes (paste or link it in the
     box)", "No, judge it on its own purpose". A plugin page gets the original request and the
     flow's answers as its brief without asking.
   - header "Atlas", only when Atlas is connected in this session or the work is a plugin page:
     "If it cites Atlas figures, re-check them? Read only." Options: "Re-check them
     (Recommended)", "Skip". The agent skips the re-check when the work cites none. "Re-check them"
     runs Phase 1 and Phase 2 + 3 first, when they have not run this session, only to confirm the
     connection and pick the brand profile: skip the other phases and every offer.
3. **Launch** `atlas-quality-review` (**Running agents**, in a subagent) with `target`, `kind`
   (`plugin` or `external`), `flow` for a plugin page, `brief`, `recipient`, `audience`, the tool
   prefix, `profile_id` and `profile_slug` whenever the session has a profile, `recheck` (`true` on
   "Re-check them"), `run: interactive`, `publish: artifact`, `log`, and
   `earlier_review` (the earlier review's link) when the same work was reviewed before,
   `page_check` (the page's `page-check` block, when the agent returned one), ending with
   the decision-audit line. For `log`: when Atlas is connected and the session has a profile
   (whatever the "Atlas" answer was), find the key `quality-review:log` with `search_calibrations`
   (no filter, limit 100 per page, paged to the end; read only) just before launching and pass its
   `body`; with no record, no
   profile, or no connection, pass `none`. Never ask about the log during a review.
4. **Relay** the page link, the verdict and its reason, the failed checks, each Critical finding in
   one line, the data access line, and the not verified and coverage lines (what the review could
   not check or see). Say once that the review is for the team, and name any private link or file
   the reader will not be able to open until it is shared. Keep the `quality_review_fixes` block for
   step 5; never show the JSON.
5. **Next.** Ask once with `AskUserQuestion`, header "Next": "Review it again after the fixes?"
   Options: "Not now (Recommended)", "Apply the fixes (sends them to {flow})" for a plugin page with
   findings, "Review it again". "Apply the fixes" relaunches the agent that built the page
   (**Running agents**) with the same inputs as its last run, plus a closing paragraph in the launch
   message headed "Review fixes": each fix from the `quality_review_fixes` block in one plain line
   (`{id}, {place}: {fix}`), and "Rebuild the page applying these fixes where your own rules allow,
   publish with `url` set to {page link}, and list any fix you did not apply, with the reason."
   Every question and write confirmation the flow's own run asks is asked again first; a write the
   original run made is not repeated unless a fix changes it. For a page the main thread built
   itself (**Visual output**), the main thread applies the fixes the same way. Relay the fixes the
   agent did not apply, and then this step is asked again. External work gets no apply option; its fixes stay a
   list. "Review it again" relaunches with `earlier_review`, so the page marks each finding fixed,
   still open, or no longer applies.
6. **Adjustments.** When a review log is saved and the user disputes a finding ("that's fine", "not
   a real issue") or names one the review missed, add one row to the log's adjustments
   (**10**) with the user's reason and the check id (or `new`). Only a reply
   that clearly disputes or adds a finding counts. Confirm first with `AskUserQuestion`, header
   "Log": "Add this to {brand}'s review log? {check}: \"{the reason, as the row will read}\""
   Options: "Add it (Recommended)", "Don't log it". It writes nothing to Atlas. Without a saved log,
   nothing is written and nothing is asked.
7. **Feedback later.** Someone may give feedback on reviewed work in a later conversation
   ("feedback on {link}: the headline is wrong", "/aspire:aspire feedback {link}"). Find the
   saved log as in step 3, read it, and find the newest row whose `target` is the same work:
   compare a Claude artifact link by its id (either link form), and any other link without its
   query, fragment, or trailing slash. With a match, word the adjustment, name the check it relates
   to (or `new`), and confirm with the "Log" question in step 6. With no match, feedback on a
   vetting or content review page goes to that flow's own feedback (**Feedback: save the team's
   call on each creator**, **Feedback: teach the next review**); for any other work, say it has no
   review in the log and offer to review it (step 1). Without a saved log, only that hand-off or
   offer runs, and nothing is written.

### 11.2 Setting the review log

An organization can keep a log of its reviews in a Claude Doc of its own, so its reviewers can
grade the review's calls (**10**). It is off unless someone asks for it ("log
our quality reviews to {doc}"). Needs a brand profile. The saved log is always a Doc link everyone
on the team can open: a local file path exists on one computer only, so it is never saved for the
organization. Someone who names a local file gets it for that one review only (passed as
`log: file:{path}`), and is told so in one line. Confirm with `AskUserQuestion`, header "Log": "Add
a row to {doc} after every quality review for {brand}? Each row has the verdict and failed checks,
with columns left for your reviewers." Options: "Log reviews there (Recommended)", "Not now". On
yes, write `quality-review:log` with `append_calibration` (`policy`, `{area: "routing", body:
"docs:{link}"}`, `provenance: "interview"`); a `key-exists` follows the Phase 5 supersede rule. Turning it off is `retract_calibration` with its
own confirmation. Never suggest a log the organization did not name.

### 11.3 The offer

When real work ends in a published page, ask once, after the flow's own follow-up questions: an
agent's page (any agent result that returns the link of a page it published, other than a
sample or a quality review's own page),
or a page the main thread built (**Visual output**, a deck it exported). Ask it in one
`AskUserQuestion` call with the decision audit offer as the second question when that offer
applies (**Decision audit**), so neither waits on the other. The review question: header
"Review", "Run a quality review on {page title} before you share it?" Options: "Review it for
{who the page's audience line names: our team, or the client or creator} (Recommended)", "Review
it for someone else (say who in the box)", "Not now". Either "Review it" runs **Run** from step 3
with `kind: plugin`, the flow, the page link, the flow's `recipient`, `audience` from the answer
(**1**), `brief` set to the user's original request and the flow's answers,
the session's profile, and `recheck: true` when Atlas is connected. The review runs in the
background; its result and its **Next** question come when it finishes.

Ask at most once per page per session, and again after a revision or export of the same page only
if the user reviewed it before ("Review it again"). Never offer it in an unattended run, for a
sample, for the review's own page, the audit page, the starter guide, or a "setup needed" card.
