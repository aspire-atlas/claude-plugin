# Quality review (is this page or deck ready to send?)

The **Quality review** section of SKILL.md launches the `atlas-quality-review` agent with the inputs
below. The agent reads one finished piece of work, runs the rubric in **4**, and publishes a review
page with a verdict, the evidence for every finding, and the fix for each. It reviews:

- every page, deck, card grid, and audit page this plugin publishes (a brief, a shortlist, a vetting
  run, a profile, a readout, a signal, a pitch deck, a dashboard, a program page, a CAS campaign page);
- work the brand made elsewhere and wants checked before it goes out: a pitch, a proposal, an
  agency's deck, a brief, a report.

It never changes the work it reviews, never writes to Atlas, and never starts discovery work. It
records what it saw and what to fix; the person decides what to change.

## 1. Inputs

| Input | What it is |
| ----- | ---------- |
| `target` | What to review: a Claude artifact link, a Google Slides or Docs link, a Drive file, or a local path (.pptx, .pdf, .docx, .html, .md) |
| `kind` | `plugin` when the target is a page this plugin published (the main thread knows from the flow that made it), else `external` |
| `flow` | For `plugin`: the flow and agent that made it ("Creator brief", `atlas-creator-brief`) |
| `brief` | Optional: what the work was asked to answer (an RFP, a brief, the user's request in their words). Turns on check **4.1** |
| `recipient` | The lens of whoever acts on the work (`recipient-lens.md`) |
| `audience` | Who will see the work, which sets **4.11** and the audience line checked in **4.12**: `team` (the brand's own team, leadership included), `client` (a brand or agency outside the team), `creator`, or `public`. Default `team` |
| `profile_id`, `profile_slug`, tool prefix | Optional. The brand profile sets the page's theme and the category in **4.9** |
| `recheck` | `true` when the user asked to re-check the Atlas figures the work cites (**4.3**), read only. Needs a profile |
| `earlier_review` | The link of an earlier review of the same work, when this is a re-review. The new review republishes to that link |
| `run` | Always `interactive`. The review has no unattended mode |

## 2. Reading the target

Read all of it before judging anything, and keep a coverage note for **4.0**.

| Target | How to read it |
| ------ | -------------- |
| Claude artifact | The Artifact tool, `action: "read"`. Also list its files (`scope: "files"`) and read any page data or script the page loads, so **4.11** can see what it fetches. A Docs artifact: the docs connector's read. For an artifact the user does not own, `read` returns a summary, not the page: say so in the coverage note, mark every quote "(from the summary)", skip the recomputed sums in **4.4**, and recommend asking the owner for edit access or an export for a full review |
| Google Slides or Docs | The Drive connector's read of the file's content, with comments |
| .pptx, .pdf, .docx in Drive | The Drive connector's read. When it returns no text (an upload with no index, or a file over the connector's size limit) and the session has a browser the user is signed in to, open `https://docs.google.com/presentation/d/{id}/htmlpresent` for a deck and read the page text. The connector's read and download tools are both fine; never edit, move, share, or comment on the file |
| Local file | The session's pptx, pdf, or docx skill to extract the text; read .html and .md directly |

Nothing readable: say what was tried, publish nothing, and stop. Speaker notes, sticky notes, and
presenter labels that come through with the text are reported as "check whether these show on the
slide", never as certain on-slide text.

## 3. Which checks apply

Every check runs on every target unless this table marks it `n/a`. A check marked `n/a` is listed
on the page as not applicable, with the reason, never silently skipped.

| Target | n/a |
| ------ | --- |
| A proposal, pitch, or RFP response | none |
| A plugin report or signal (readout, market signal, quarterly signal, profile, post analysis, ad reuse) | 4.6 Commercial, 4.8 People (unless it names a team) |
| A plugin brief, shortlist, or vetting page | 4.8 People |
| A plugin dashboard or program page (org dashboard, program dashboard, ledger, CAS campaign, orchestrator, order form) | 4.7 Proof |
| A plugin working page (content review, outreach, negotiation, fulfillment, deliverable tracker, affiliate, roster health, content sourcing, content library, shops plan) | 4.7 Proof, 4.8 People |
| Any other plugin page | 4.6 Commercial, 4.7 Proof, and 4.8 People, unless the page shows prices, case studies, or a team |
| A plugin deck (PPA pitch) | none |
| A decision audit page | 4.5 to 4.10 |

**4.12 Artifact standard** runs on every page this plugin published, and on external work only when
it carries the Aspire Atlas mark.

## 4. The rubric

Run the checks in this order. Each finding quotes the work (**6**), names its place (slide, section,
tab), and gets a severity (**5**).

### 4.0 Coverage

Say what was read and what was not: text only or rendered, which slides or tabs, speaker notes or
not, images and charts judged or not. The page opens with this line and the footer repeats it. Never
judge what was not seen.

### 4.1 Brief fit

With a `brief`: list each question or requirement it asks, in its own order and numbering. Find
where the work answers it and score the answer 1 to 5: 5 is specific, evidenced, and answers exactly
what was asked; 3 answers in general terms; 1 dodges, defers ("pricing follows"), or leaves it out.
Every requirement scored 1 (no answer anywhere, a dodge, or a deferral) is one finding: Critical
when `audience` is `client` or `public`, High otherwise. A score of 2 is a Medium finding. Without a
brief, score against the work's own stated purpose (its title, its "what this page is for" line, or
the flow's job in SKILL.md) and say so.

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

## 5. Severity and verdict

| Level | Means |
| ----- | ----- |
| Critical | Could lose the decision, misleads the reader, or is a legal or compliance gap (an unanswered brief requirement in client or public work (**4.1**), two prices, a private note on a client slide, a figure or section the reader will see empty or broken) |
| High | Hurts credibility with a careful reader (numbers that disagree, a promise with nothing behind it, proof off-category, a link inside the work the reader cannot open) |
| Medium | Polish (typos, page numbers, wording) |

**Verdict:** any Critical finding means **Not ready**. High findings alone mean **Ready with fixes**.
Otherwise **Ready**. The verdict line gives the one-sentence reason.

**Strengths are judged too.** Quote each one from the work. A strength is evidence a competitor
could not show, wording that mirrors the reader's own brief, a framework people will remember, or
next steps concrete enough to act on. Three to six strengths; never pad.

## 6. Writing rules

- Every finding has three parts: what the work says (quoted), why it matters, and the fix.
- Quote the work word for word and keep quotes short. Never quote personal contact details (emails,
  phone numbers) or anything marked confidential beyond what the finding needs.
- Never invent a figure. Every suggested fee, target, name, date, or SLA in a fix is a highlighted
  placeholder.
- Computed numbers show their math from the work's own figures.
- Say what the review could not see, at the top and in the footer.
- Name people by role, not by name, unless the work's own team slide is the subject of the finding.

## 7. The page

Title "{Work title} Review". One page, published with the Artifact tool. A re-review reads the
`earlier_review` link with the Artifact tool and publishes with `url` set to it, so the team keeps
one link. Load `artifact-design`, and `dataviz` for any chart.
Apply the brand's saved theme when there is a profile (`theme.md`, **Applying the theme**), semantic
colors excepted. Sections, in order:

1. **Header:** the mark at the top right and the "Prepared for" chip per `artifact-standard.md`; the
   work's title and where it lives; the verdict stamp (Ready, Ready with fixes, Not ready) and its
   one-sentence reason; the coverage line (**4.0**).
2. **Brief scorecard:** one tile per requirement (**4.1**) with its 1 to 5 score, a short reason, and
   where it is answered. Without a brief, one tile per check in **4** that applied.
3. **Strengths:** each with its quote.
4. **Findings, worst first:** severity, title, where, the quote, why it matters, the fix.
5. **Consistency table:** item, one place says, another says, fix (**4.4**). Left out when empty.
6. **Feasibility chart:** budget or capacity against what is promised, with the per-unit math
   (**4.5**). Left out when it does not apply.
7. **Data access table** (**4.11**): each live read, connector, outside tool, or private link; who
   can see it; who cannot; the fix. Shown whenever 4.11 found anything.
8. **Suggested fixes:** before-and-after mock-ups of the two to four biggest fixes, drawn in CSS,
   with placeholders highlighted.
9. **Check before sending:** the facts to source or confirm (**4.3**), the Atlas re-check results
   when it ran, and who must share what with the reader before it goes out (**4.11**, item 4).
10. **Top fixes in order:** five to seven, each with its rough effort.
11. **Footer:** the coverage line again, then the source line per `artifact-standard.md`, section
    3, **Review pages**, with the team audience line (a review is for the team, never the work's
    reader).

## 8. Output to the main thread (under 200 words)

- The page link, on its own line.
- The verdict and its reason in one sentence.
- The Critical findings, one line each, then the count of High and Medium findings.
- The three strongest strengths, one line each.
- Data access: one line naming any reader who will not be able to see part of the work, or "None
  found".
- Coverage: one line on what was not seen.

Then the agent's audit trail block, as every agent ends.
