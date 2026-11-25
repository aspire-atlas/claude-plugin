# Page eval: rerun the example questions and grade each new page

`bun run eval:pages` asks the questions in `questions.json` through the plugin in this checkout, keeps the page each
one publishes, and prints one table per question: every check as pass or fail for the new page, beside the same
check run on the approved page. It is how a change to a rule is tested (see `CONTRIBUTING.md`).

It runs on a developer's machine, and in CI on every pull request that changes an agent or a flow file
(see [In CI](#in-ci)).

## Contents

- [What it needs](#what-it-needs)
- [Commands](#commands)
- [What one run does](#what-one-run-does)
- [The table](#the-table)
- [Client cases and their assertions](#client-cases-and-their-assertions)
- [What is committed and what is not](#what-is-committed-and-what-is-not)
- [What a rerun may and may not do](#what-a-rerun-may-and-may-not-do)
- [In CI](#in-ci)
- [Files](#files)
- [Limits](#limits)

## What it needs

- `bun`, `python3`, and the `claude` CLI signed in (the same account that can open the approved pages).
  Run `bun install` once: the reruns are driven through the Agent SDK (`session.ts`), which is the
  repository's one development dependency.
  A Claude Code with the Artifact tool (a session on the web) publishes each page and reads the approved
  pages from their links. One without it (a local terminal) still works: the flow saves its page as a
  file, the table shows no link, and each approved page must be given as a file, either `approvedFile`
  in `local.json` or a copy at `scripts/eval/.cache/approved/<code>.html`.
- A test organization on the dev Atlas server, with a brand profile for each brand behind the
  questions (a brand may answer more than one). Each profile needs enough data for its question: either the
  brand's own data held in the organization, or its public handles and its competitors indexed. Write which
  one each brand has in the `data` field of `local.json`, so a thin page can be told from a thin data set.
- A sign-in to the dev Atlas connector, held by Claude Code. The connector takes a person's sign-in, not a
  service account's token (those work on the REST API only). Once per machine, with the same connector name
  `local.json` uses:

  ```bash
  claude mcp add --scope user --transport http Aspire_Atlas_Dev https://{the dev Atlas host}/mcp
  ```

  The name takes letters, digits, hyphens and underscores only, and must contain `Aspire_Atlas` so the
  skill recognizes its tools. Then run `claude`, type `/mcp`, pick the connector, and authenticate. The signed-in person must belong to
  the test organization. `--scope user` matters: the harness runs Claude in its own folders, and a
  connector added without it is seen only in the folder it was added from. The plugin's bundled
  connectors point at production, so their tools are refused during a rerun, along with the tools of
  every other connector the machine has. A server that does
  take a bearer token can use `mcp.tokenEnv` instead.
- `scripts/eval/local.json`, copied from `local.example.json`. It holds the dev server address, the test
  organization's name (added to each ask, since a person can belong to several), each question's brand
  name, and the link to its approved page. It is ignored by git: brand names and page links
  are customer details and this repository is public. Take the brands and links from the examples library.
  A question with no brand in `local.json` is skipped while no baseline holds its approved results, so
  a newly added question runs nowhere, CI included, until its brand and approved page are added to
  `local.json` and the `EVAL_LOCAL_JSON` secret. The run's `results.json`, the table, the PR comment
  and the nightly Slack post all name it as skipped, and a run with nothing left to run posts a skip
  and passes. Once a baseline holds a question's approved results, or one of its assertions has landed,
  a missing brand stops the run instead, so a lost or mistyped entry cannot quietly drop a question that gates pull requests.
  A run also stops before its first turn while a value it reads from `local.json` still holds a
  `{placeholder}` from the example file, and names each key: the connector, the organization, the
  `chatAllow` names, and the entry of every question it is about to run. A flow asked about "{brand}"
  picks a brand on its own. The entry of a question that is not running is not checked, and grading a
  page file (`--page`) checks only that question's entry.

## Commands

```bash
bun run eval:pages                         # every question in questions.json
bun run eval:pages --only O3               # one question, by its code in questions.json
bun run eval:pages --fixtures              # the client cases' assertions on their fixture pages (no Atlas, no local.json)
bun run eval:pages --baseline              # run, then store the results under baselines/<today>/
bun run eval:pages --baseline 2026-11-12 --from latest   # store an earlier run without running again
bun run eval:pages --compare 2026-11-10 latest           # what changed between two runs
bun run eval:pages --only I4 --page page.html            # grade a page file, without a rerun
bun run eval:pages --dry-run               # print what would run
bun run eval:pages --only O3 --approved-from newest   # take the approved column from the newest baseline
bun run eval:pages --only I4 --repeat      # ask it twice, and check that the second run follows up on the first
bun run eval:test                          # the harness's own tests (no Claude, no Atlas)
```

A run is named by its folder under `scripts/eval/.runs/`, a baseline by its date, the newest run by `latest`.
`--model` sets the model for the reruns and `--judge-model` the model for the grading. `--max-asks` is how
many pickers the harness answers for one question (12) and `--max-rounds` how many text replies it sends (6).
`--approved-from <date|newest>` takes the approved page's results from a stored baseline instead of reading and
grading the approved page again; E8 then judges the new page on its own. `--title-prefix <text>` asks the flow to
start the page's title with that text, `--cleanup` deletes every page the run published once it is graded, and
`--out <dir>` keeps the run in that folder.

## What one run does

For each question:

1. **Asks it.** A session through the Agent SDK (`session.ts`), with the plugin loaded from `plugins/aspire`
   in this checkout, the dev Atlas connector in place of the bundled ones, and the question from
   `questions.json` as `/aspire:aspire ...`, worded as the person who asked it. When the connector is not
   connected at the start, the run stops there: a page built without Atlas is never graded.

   The SDK is used because a headless `claude -p` session has no `AskUserQuestion` tool: the flow sees
   that, skips its setup picker and its storyline question, and runs on defaults. Through the SDK the flow
   gets the same tool a person's session has, with Claude Code's own system prompt, and the harness
   answers each call. A stand-in question tool
   was the other option; it would have needed a line in the prompt telling the flow to use it, so the run
   would no longer be the one a person gets.
2. **Answers what the flow asks.** Each picker is answered from the answer list: `answers` in
   `questions.json`, with a question's own `answers` tried first. An entry names the picker by its `header`
   or by a pattern over its `question`, and gives a `pick` (a pattern over the option labels) or a `text`
   for the free text field. With no entry that fits, the answer is the option marked (Recommended), and
   with none marked, the first option. The shared list builds the storyline as drafted and saves nothing.
   Whatever is answered, every Atlas tool that changes a record is refused (see
   [What a rerun may and may not do](#what-a-rerun-may-and-may-not-do)).

   The harness stops answering once a page is published, or an agent returns its result with a page
   file: the next picker is the flow's offer of more work, so the turn ends there. A result with no page
   (a refresh to approve, a storyline draft) is not the end, and the picker that follows it is answered.
   It also stops after `--max-asks` pickers. When a turn ends with no picker and no page (the flow asked in text), the harness
   resumes the session with one fixed reply (`defaultReply` in `questions.json`), up to `--max-rounds` times.

   The run folder keeps `asks.json` for each question: for every picker, the text its thread wrote above
   it (`before`), the message the picker sits in (`message`, the part of `before` written after that
   thread's last tool result), each question with its options, the answer given and how it was chosen
   (`list`, `recommended` or `first`), and `declined` (`finished` or `limit`) when the harness left it
   unanswered. The first picker's `before` is the setup reply.
3. **Keeps the page.** The HTML file the run published and its link.
4. **Reads the approved page.** From `approvedFile`, or by reading the link once and keeping a copy on this
   machine (`--refresh-approved` reads it again).
5. **Runs the same checks on both pages**, each from a copy with embedded images removed:
   - the page-check script, cut from `skills/page-standard/page-check.md` on every run (R1, R2, R5's cost lines, R6, R7's links, R11, R13, R14 and R15);
   - the quality review in grade mode, as a separate session that gets the page and the question and nothing
     from the run that built it (every R check);
   - a judge for the E-checks in `e-checks.json`, as another separate session with the same inputs. For E8
     the judge also reads the approved page, only to list the evidence it shows.
   - the English read for E6, as a third separate session that gets the page, its reader and its question code.

The approved page is never taken as passing. When a check fails on it, the check has drifted or the page
predates the rule; the table shows that, and `--compare` marks a changed approved result as drift.

## The table

| Column | What it holds |
| ------ | ------------- |
| Check | A client case's own assertions, each with its ticket, then E1 to E8 from the Evals tab, then Q3 (below), then every R check the reader standard has |
| New page, Approved page | `pass`, `fail`, `n/a`, or `–` when the check did not run |
| Sets the bar | `yes` when the approved page was named as the example for a change this check covers, and on every assertion |

An R check that the script covers passes only when the script and the grade both pass it; a note under the
table names any check where the two disagree. Under each table: the size of the main conversation in tokens
at its last message (and how many times it compacted), the number of confirmation rounds (the pickers the
harness answered plus the text replies it sent), and the link to the new page.

Q3 is the run's approvals, not the page's, so its approved column is always `–`: it passes when every
approval the run asked for was named in the setup reply's "This run will ask you to approve" line
(`orchestration.md`, section 2, **Before the questions**). An approval is a question for the page's main
points (the storyline), credits, a refresh, a save, mailbox drafts, sending the page to Slack or email, or
a send (a question that opens with "Send", or a Send header). Each is known by its picker's header or its
wording, and each item of the line by the wording of the table in that section; the one table of kinds is in
`approvals.ts`. A flow's own confirmation that fits none of them is not counted. A subagent's question
counts. The picker the harness left unanswered because the run had finished does not: it is the flow's
offer of more work after the page. An approval the line did not name still passes when the text above its
own question, written by whoever asked it, says "One more approval than I listed". When it fails, a line
under the table names the approvals by kind. It is `–` for a run that asked
no picker. Q3 never fails a pull request: a reviewer reads the row and `asks.json`
(`docs/STANDARD.md`, Q3).

C5, the chat wording, is a line under the table and not a row, because it is the run's chat and has no approved
page to compare with. It is read from the transcript:

| Message | What is read |
| ------- | ------------ |
| Setup reply | What the main thread wrote above its first picker, the first turn's questions up to its storyline check-in, their option labels and descriptions, and the reply the turn ended on. None when the first picker is the storyline check-in |
| Storyline check-in | Every question headed "Storyline" with the message it sits in, and every turn a storyline draft came back in, so a redraft after Change or Widen is counted too |
| Close-out | The last turn's reply, only when the run published a page or its agent finished. When the harness ended the run at the picker that follows the page, the message that picker sits in. A run that stopped earlier shows "close-out not sent" |
| Question the run stopped on | Only for a run that stopped without closing out, on a question after the setup reply that is not a storyline check-in: that turn's questions and its reply. A run that stopped on the setup reply or on a storyline check-in has its last reply counted there |

Each is counted for arrows, "vs" in any case, and codes. The codes are read from the files that define them,
so a new one is counted without a change here: the question codes in the question-code map
(`orchestration.md`, such as I2), the reader standard's R checks, the E checks, the questions in
`questions.json`, and any finding id shaped like EN2 or UX104. A flow's own question ids (F1, M1, S3, X5 and
about eighty more) are not counted: they read as product names, and a false count would block a merge. The
reviewer and the judgment review hold those to rule 7.

Left out of the count:

- links, file paths and backticked spans;
- handles and hashtags, which the rules leave as written;
- words inside quotation marks, when the line's quotes balance. An odd quote is read as an inch mark after a
  number, and otherwise nothing on that line is left out;
- "VS Code", which is a product;
- the names in `chatAllow` in `local.json`, for the test brand's own products. A product name that is also a
  counted code ("Canon R5", "O2") counts until it is listed there. An empty entry is skipped.

C5 passes with every count at zero. The messages and the words each count matched are kept in the run's
`chat.json`, never in a baseline or a comment. The other English rules (full sentences, one idea per
sentence, terms explained) need judgment and are not counted here. `--compare` shows a chat change only when
both runs graded the chat, so a baseline stored before C5 adds nothing to the count of changes.

The example pages are tied to the doc's change numbers (3 metrics, 4 data freshness, 5 storyline, 6 reviews).
`questions.json` maps each change to the checks that show it; change that map when a check is added.

E1 also judges the reader's result: the headline's figure and the top item of each ranked list use what that
reader is judged on (`recipient-lens.md`, **Rendering for a lens**), or one line says which metric the page
used and why. The harness hands the judge that reader's row of the result table in `recipient-lens.md`, and
E1's `judgeNote` in `e-checks.json` says how to apply it. O3 shows it for a leadership reader and P1 for
a paid-social reader. P1 has no approved page yet, so it runs once `local.json` names a brand for it, and its
results cannot count as a regression until a baseline holds an approved page.

E6 is the English read every page gets before it publishes (`quality-review.md`, **9.1**), run as its own
session with the page, its reader and its question code: it passes with no Must fix, and its reason lists each
Must with its replacement. E7 is the UX review (`quality-review.md`, **9.2**), run the same way: the
reviewer renders the page on desktop, on a phone in the dark theme and with no apps connected, it passes with
no Must fix, and its reason lists each Must with its row and how deep the first task sits on the phone. The
harness renders the page with `scripts/render-page.ts` and passes the reviewer that folder, so it needs
Playwright with Chromium on the machine; without it the review judges by source order and says so in the reason.

## Client cases and their assertions

A client case is a question whose first reviewed page drew a wrong conclusion. It is in `questions.json` like
any other question, with a list of `assertions`: each names one behaviour that page got wrong, in words a
judge can check on any brand's page, and the ticket that fixes it. `docs/STANDARD.md`, "Adding a client
example", says how a new example joins a case.

| Code | The page | Asked as | Assertions |
| ---- | -------- | -------- | ---------- |
| CR1 | A competitive read where shop posts and untagged mentions changed the finding | The plugin's O3 question | A1 to A3 |
| AR1 | An affiliate report | A question with no code of its own | A1 to A5 |
| P7 | A creator ad pitch deck, written before its agents exist | Its own code | A1 to A11 |
| P8 | A creative packet (package doc, master brief, a concept doc per creator), written before its agents exist | Its own code | A1 to A12 |
| I13 | A camera screen of a creator slate, written before its agent exists | Its own code | A1 to A4 |

P7, P8 and I13 come from reference outputs of a live creator ad campaign rather than from a reviewed page: they set what a good result looks like for agents that are still to be built, so each agent is held to them from the pull request that builds it. Their assertions carry no `fix`, since they come from a project plan and not from the plugin update doc. Their `paths` are empty until each agent's pull request names its own files, since no flow answers them yet; I13's name the camera screen's agent and flow. P9 (starting a creator ad campaign) has a question code but no entry here yet; its assertions are written with its flow.

**How an assertion is judged.** A separate session reads the page and each assertion's `passesWhen` and
`failsWhen`, and nothing from the run that built it. Its `examples` are the client examples it covers, with
brands as placeholders. `whenNamed` adds an expected figure ("the count for {competitor} is at least
{competitorPosts} posts") only when `local.json` gives every name in it under the question's `values`, since
those names are customer details.

**How an assertion gates.** `landed` is `false` until the assertion's ticket merges:

| `landed` | A failure on the new page |
| -------- | ------------------------- |
| `false` | Expected. The table lists it under "Waiting on a ticket", and it blocks nothing |
| `true` | A regression: the wrong reading came back. It fails the job with no approved page needed |

A landed assertion must pass. The judge answers PASS or FAIL for an assertion and has no N/A, so a page that
drops the part an assertion is about fails it. An assertion the judge returned no row for, or answered N/A
for anyway, also counts as a regression once it has landed: either would let the wrong reading back unseen.

The pull request that makes an assertion pass sets its `landed` to `true`, so the case goes green one ticket
at a time. An assertion that passes while still `false` is named under the table, so the flag is not forgotten.

**The fixture pages.** A rerun on the dev server can only show what the test profile's data holds, and a
profile with no shop posts cannot show a shop-post finding. So each case also has two short pages in
`scripts/fixtures/eval-cases/`: one with the wrong reading and one with the corrected one, with invented
brands. `bun run eval:pages --fixtures` judges the assertions on both and fails unless every assertion fails
on the first and passes on the second. Run it after changing an assertion's wording or adding an example.
CI runs it on every pull request that changes a file listed in `fixturePaths` in `questions.json` (the
question set, the fixture pages and the harness files that judge them), and nightly; the `skip-eval` label
does not skip it. A new file the fixture check depends on goes in that list. A case's `fixtures.values` stands in for `local.json`'s
`values` there, with invented names, so a `whenNamed` figure is judged on the fixture pages too.

**What a case needs to rerun.** A brand in `local.json` whose profile holds the kind of data the case is
about: for CR1, competitors with creator posts that sell through TikTok Shop and posts that name a brand
without tagging it; for AR1, a saved influencer program with affiliate terms. AR1 also needs a sales export,
because the dev server has no store connected. Name it under the question's `files` in `local.json`, by
`path` on a developer's machine or as `text` inside the `EVAL_LOCAL_JSON` secret. A relative `path` is read
from `scripts/eval/`, like `approvedFile`, whichever folder the command runs from. The harness checks every
question's files before the first question runs, and stops there when one has no name, has no text and no path to a
file that exists (a folder does not count), or when two would be saved under the same name, ignoring case. It then writes each into the run's own folder and
tells the flow it is there. Until `local.json` names a brand, a case is skipped like
any new question. Once one of its assertions has landed, a missing brand stops the run instead, as it does for
a question with approved results: the case gates pull requests from then on.

## What is committed and what is not

| Path | Committed | Holds |
| ---- | --------- | ----- |
| `baselines/<date>/results.json`, `table.md` | Yes | Results, each assertion's name and ticket, the chat counts, the approvals by kind, token counts, rounds, the plugin commit, the models. No page, link, brand, reason text, or chat text |
| `.runs/<time>/` | No | Each turn's transcript, both pages, each check's reasons, the chat messages (`chat.json`), every picker with its answer (`asks.json`), `results.json`, `table.md` |
| `.cache/approved/` | No | The copy of each approved page |
| `local.json` | No | Brands, links, the dev server address, a case's competitor names and its input files |
| `scripts/fixtures/eval-cases/` | Yes | The cases' fixture pages, with invented brands and no customer data |

Paste `.runs/<time>/table.md` into the pull request. Its page links open only for people in the organization.

## What a rerun may and may not do

- It reads Atlas and may refresh what Atlas holds for a creator or post (the lookup tools), as the page
  standard asks. Every Atlas tool that changes a record is refused; the lists are in `lib.ts`, and
  `bun run eval:test` fails when the tool contract gains a tool that is in neither.
- It publishes each new page as a private artifact on the signed-in account.
- It runs the plugin's shell snippets without asking. Posts and captions from Atlas are untrusted text, so
  run it on a development machine or in a container, never beside production credentials.
- With `mcp.tokenEnv`, the token is written to a file in the system's temporary folder for the length of
  the run and removed after it. It is never written under the checkout.

## In CI

The `eval` job in `.github/workflows/validate.yml` runs after the static checks pass.

**On a pull request** it works out which questions the change touches and reruns only those:

- It watches `plugins/aspire/agents/`, `plugins/aspire/skills/aspire/references/`, the router
  `plugins/aspire/skills/aspire/SKILL.md` and `plugins/aspire/skills/page-standard/`. A changed file that a
  question lists in its `paths` (`questions.json`) reruns that question. A changed file in `sharedPaths`
  (one every flow reads, such as the reader standard or anything under the page standard; an entry ending in
  `/` covers its folder) reruns every question. Anything else reruns nothing, and the job passes; when the PR
  already has an eval comment, it is edited to say nothing was rerun.
- It runs `bun run eval:pages --only <codes> --approved-from newest --title-prefix "CI eval" --cleanup`. The
  title prefix is removed from the new page before it is graded, so it cannot fail a check.
- It posts the table as one PR comment, edited in place on later pushes, and in the job summary. The comment
  opens with the regressions, then the table for each question, with the transcript size, the confirmation
  rounds and the page link (none when the run saved the page as a file).
- It fails when a check the approved page passes now fails on the new page (a **regression**), when an
  assertion does not pass after its ticket landed, or when C5 fails (the setup reply, the storyline check-in or the
  close-out has an arrow, a "vs" or a code), and only then. A question that published no page regresses on every check its approved page passes. A check that
  did not run, or one the approved page fails too, never fails the job. It also fails when the run stopped
  before any question finished, since nothing was checked, and the comment says so.
- The `skip-eval` label skips the rerun. The PR body says why on a line `skip-eval: <reason>`; the job posts
  "skipped: <reason>", and fails when the line is missing. Use it for a docs-only or allowlisted change.
  Adding the label does not start a run: push again, or use **Re-run jobs** on the eval job, which reads the
  labels and body as they are then. A push cancels the eval still running for the PR.

**Nightly** at 07:17 UTC it reruns every question on `develop` and posts one line per question to the Atlas
engineering Slack channel, with any regression named. A schedule runs from `main`'s copy of the workflow, so
the nightly run starts once this job is released to `main`. `workflow_dispatch` runs the same thing by hand.

**What gates a pull request** is the approved column, and in CI it comes from the newest committed baseline
(`baselines/<date>/results.json`): a run with the API key has no Artifact tool, so it cannot read the approved
pages, and the pages are customer data that this public repository never holds. Until a baseline holds a
question's approved results, that question's table shows `–` in the approved column and nothing about it can
fail the job. Store a baseline after a developer's run that read the approved pages (see
[Commands](#commands)).

The run, its transcripts and its pages are never uploaded: this repository is public.

Secrets, set on the repository:

| Secret | What it is |
| ------ | ---------- |
| `ANTHROPIC_API_KEY` | The key the `claude` CLI runs the questions and the grading with |
| `ATLAS_EVAL_TOKEN` | A service-account token for the dev Atlas server, scoped to the test organization, issued with the admin connector's `create_api_token`. The dev server's `/mcp` must take it as a bearer token |
| `EVAL_LOCAL_JSON` | The whole of `local.json`, with `"tokenEnv": "ATLAS_EVAL_TOKEN"` under `mcp` |
| `EVAL_SLACK_WEBHOOK_URL` | The Slack incoming webhook for the nightly message. Without it the nightly run skips Slack with a warning |

A pull request from a fork gets no secrets, so the job warns and passes without a rerun; a maintainer
pushes the branch here to run it. Pages a CI run publishes start their title with "CI eval" and are deleted
when the run ends, so the comment's link stops opening after the job finishes.

## Files

| File | What it is |
| ---- | ---------- |
| `questions.json` | The questions: code, reader, the ask, the changes each example sets the bar for, and a client case's assertions; and the answer list for the pickers |
| `e-checks.json` | The eight E-checks, copied from the Evals tab, with who judges each |
| `local.example.json` | The shape of `local.json` |
| `run.ts` | The command |
| `session.ts` | One turn of a rerun through the Agent SDK, and the handler that answers its pickers |
| `answers.ts`, `answers.test.ts` | How a picker is answered from the answer list, and what `asks.json` keeps |
| `approvals.ts`, `approvals.test.ts` | The Q3 check: the kinds of approval, how the setup line and each question are read |
| `fixtures/` | Transcripts for the harness's tests: a run that named every approval it asked for, and one that did not |
| `ci.ts` | CI: which questions a change reruns, whether it calls for the fixture check, the PR comment, the nightly Slack message |
| `post-comment.sh` | CI: posts the comment, or edits the one already on the PR |
| `lib.ts`, `lib.test.ts` | Reading a transcript, the table, baselines, compare, and their tests |
| `baselines/` | One folder per stored run |
| `first-run/` | The first-run eval: seven new-person scenarios and the time, questions, calls, tokens and credits to a first result (its own README) |
| `../fixtures/eval-cases/` | Each client case's two fixture pages |

## Limits

- The judge and the grade read the page as text. Nothing here renders it, so anything that needs a screen
  (E7, the first-screen part of R10) waits for the UX review.
- E3 and R7 are judged on the page alone: the harness does not hand the run's raw data to the graders.
- The judge's calls are Claude's judgment. They earn trust as they match the reviewers' own calls on the
  same pages; until then a pass here is evidence, not a sign-off.
- A run is one full flow per question and four grading sessions per page, five for a client case. Use `--only` while iterating.
- An assertion is judged on the page alone, like E3: the judge cannot see a post the page left out. `whenNamed`
  is the one place a case can state a figure the page must reach.
  CI reruns only the questions a change touches, and with `--approved-from` grades only the new page.
