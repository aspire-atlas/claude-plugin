# Reader standard

Reader standard v1.0, Oct 28, 2026.

The reader checks the quality review runs as check **4.14** (`quality-review.md`), after the
accuracy checks. They ask whether the reader can act on the work: does it answer first, give
numbers context, keep decisions apart, and fit the person who will read it. Each check returns
PASS, FAIL, or N/A with a one-line reason; which ones are N/A for a kind of target is in
`quality-review.md`, **3**.

| ID | Check | Passes when | Fails when, for example | Default severity on FAIL |
| --- | --- | --- | --- | --- |
| R1 | Reader and scope | The top of the page names the reader, the brand, and the date range | "Q3 overview", with no reader named | High |
| R2 | Platforms covered | Every platform is listed with its number of posts; on a team page, any missing platform is named | "Social" with no breakdown; on a team page, TikTok missing and not mentioned | High |
| R3 | Answer first | The headline is the conclusion and answers the question | "Creator performance overview" | High |
| R4 | Numbers have context | Every number in the summary and insights is compared with something (last period, peers, a goal), and there are no more than three insights | "48K views" with nothing beside it | High |
| R5 | Clear next steps | Every next step says what to do, who does it, and by when | "Consider optimizing content" | High |
| R6 | Decisions kept separate | What the reader must approve sits in its own section, or the page says nothing needs approval | Approvals buried in the to-do list | High |
| R7 | Real evidence | Every creator, post, and number comes from the run's data, and every evidence link (a post or profile URL) opens what it claims | A handle or number that isn't in the data | **Critical** |
| R8 | Shows its working | Scores and recommendations explain how they were reached | A score with no explanation | High |
| R9 | Names what's missing | On a team page, missing data is named, with what connecting it would add | Says nothing about missing ad data | Medium; High when the gap would change the decision |
| R10 | Fits the reader | A VP or budget owner sees the answer, decisions, and next steps on one screen, with detail below | A VP brief that opens with the method | High when `recipient` is `leadership` or the page names a VP or budget owner; else Medium |
| R11 | Plain language | No agent, skill, tool, or system names in the body, and no jargon. The Aspire Atlas mark and the source line `artifact-standard.md` requires are exempt | "The atlas-market-signal agent found" | Medium when `audience` is `team`; High otherwise |
| R12 | Built for this question | The page's sections and visuals come from what this question and reader need | A launch timeline on a one-creator profile | High |

## How to judge them

- Run them in ID order. Each FAIL becomes a finding at its default severity. The reviewer may raise
  a severity, giving the reason in the finding, but never lowers one below its default.
- **R7** with `evidence_dir`: every handle, post, and number on the page must appear in, or be
  computable from, the files in `evidence_dir`. Without it, judge R7 on links and internal
  consistency only, and add "R7 checked without the run's raw data" to **Not verified**.
- **R2** is n/a on a page that covers one post, one creator, or one account on one network
  (`quality-review.md`, **3**).
- **Links.** R7 covers evidence links only; every other broken link is filed as the table in
  `quality-review.md`, **4.15**, **Broken links**, says.
- **R2 and R9 outside the team.** When `audience` is `client`, `creator`, or `public`, gaps go to
  the requester, never onto the page. R9 is N/A ("gaps go to the requester"). R2 passes when the
  page lists the platforms it covers with their post counts and claims no others; a page that names
  a platform Atlas could not collect fails **4.11**, item 5, not R2.
- **R10** is judged on a 1280×800 first screen: the answer, the decisions, and the next steps all
  start above y=800 in the rendered order. With a text-only read, judge by source order and say so
  in the coverage line.
- One defect is one finding. A defect that fails an R check and a 4.x check (a headline count that
  disagrees with the table fails R7 and 4.4) is filed under the more specific check, here 4.4, and
  both IDs go in **Failed checks**.
