# Page eval: rerun the example questions and grade each new page

`bun run eval:pages` asks the five example questions through the plugin in this checkout, keeps the page each
one publishes, and prints one table per question: every check as pass or fail for the new page, beside the same
check run on the approved page. It is how a change to a rule is tested (see `CONTRIBUTING.md`).

It runs on a developer's machine, and in CI on every pull request that changes an agent or a flow file
(see [In CI](#in-ci)).

## Contents

- [What it needs](#what-it-needs)
- [Commands](#commands)
- [What one run does](#what-one-run-does)
- [The table](#the-table)
- [What is committed and what is not](#what-is-committed-and-what-is-not)
- [What a rerun may and may not do](#what-a-rerun-may-and-may-not-do)
- [In CI](#in-ci)
- [Files](#files)
- [Limits](#limits)

## What it needs

- `bun`, `python3`, and the `claude` CLI signed in (the same account that can open the approved pages).
  A Claude Code with the Artifact tool (a session on the web) publishes each page and reads the approved
  pages from their links. One without it (a local terminal) still works: the flow saves its page as a
  file, the table shows no link, and each approved page must be given as a file, either `approvedFile`
  in `local.json` or a copy at `scripts/eval/.cache/approved/<code>.html`.
- A test organization on the dev Atlas server, with a brand profile for each of the four brands behind the
  five questions (one brand has two questions). Each profile needs enough data for its question: either the
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

## Commands

```bash
bun run eval:pages                         # all five questions
bun run eval:pages --only O3               # one question (I4, I11, O1, O3, I1)
bun run eval:pages --baseline              # run, then store the results under baselines/<today>/
bun run eval:pages --baseline 2026-11-12 --from latest   # store an earlier run without running again
bun run eval:pages --compare 2026-11-10 latest           # what changed between two runs
bun run eval:pages --only I4 --page page.html            # grade a page file, without a rerun
bun run eval:pages --dry-run               # print what would run
bun run eval:pages --only O3 --approved-from newest   # take the approved column from the newest baseline
bun run eval:test                          # the harness's own tests (no Claude, no Atlas)
```

A run is named by its folder under `scripts/eval/.runs/`, a baseline by its date, the newest run by `latest`.
`--model` sets the model for the reruns and `--judge-model` the model for the grading.
`--approved-from <date|newest>` takes the approved page's results from a stored baseline instead of reading and
grading the approved page again; E8 then judges the new page on its own. `--title-prefix <text>` asks the flow to
start the page's title with that text, `--cleanup` deletes every page the run published once it is graded, and
`--out <dir>` keeps the run in that folder.

## What one run does

For each question:

1. **Asks it.** `claude -p` with the plugin loaded from `plugins/aspire` in this checkout, the dev Atlas
   connector in place of the bundled ones, and the question from `questions.json` as `/aspire:aspire ...`,
   worded as the person who asked it. When the connector is not connected at the start, the run stops there:
   a page built without Atlas is never graded.
2. **Answers what the flow asks back.** While no page is published, the harness resumes the session with one
   fixed reply (`defaultReply` in `questions.json`: yes to what was proposed, save nothing, send nothing).
   Each reply is one confirmation round. It stops at `--max-rounds`. It also stops as soon as an agent
   returns its result, page or no page: another "go ahead" would start the flow's next offer.
3. **Keeps the page.** The HTML file the run published and its link.
4. **Reads the approved page.** From `approvedFile`, or by reading the link once and keeping a copy on this
   machine (`--refresh-approved` reads it again).
5. **Runs the same checks on both pages**, each from a copy with embedded images removed:
   - the page-check script, cut from `skills/page-standard/page-check.md` on every run (R1, R2, R6, R11);
   - the quality review in grade mode, as a separate session that gets the page and the question and nothing
     from the run that built it (every R check);
   - a judge for the E-checks in `e-checks.json`, as another separate session with the same inputs. For E8
     the judge also reads the approved page, only to list the evidence it shows.

The approved page is never taken as passing. When a check fails on it, the check has drifted or the page
predates the rule; the table shows that, and `--compare` marks a changed approved result as drift.

## The table

| Column | What it holds |
| ------ | ------------- |
| Check | E1 to E8 from the Evals tab, then every R check the reader standard has |
| New page, Approved page | `pass`, `fail`, `n/a`, or `–` when the check did not run |
| Sets the bar | `yes` when the approved page was named as the example for a change this check covers |

An R check that the script covers passes only when the script and the grade both pass it; a note under the
table names any check where the two disagree. Under each table: the size of the main conversation in tokens
at its last message (and how many times it compacted), the number of confirmation rounds, and the link to
the new page.

The example pages are tied to the doc's change numbers (3 metrics, 4 data freshness, 5 storyline, 6 reviews).
`questions.json` maps each change to the checks that show it; change that map when a check is added.

E6 and E7 show `–` until the English read (ASP-5300) and the UX review (ASP-5301) exist. To wire one in,
set its `judgedBy` in `e-checks.json` and add its call beside `judge` in `run.ts`.

## What is committed and what is not

| Path | Committed | Holds |
| ---- | --------- | ----- |
| `baselines/<date>/results.json`, `table.md` | Yes | Results, token counts, rounds, the plugin commit, the models. No page, link, brand, or reason text |
| `.runs/<time>/` | No | Each turn's transcript, both pages, each check's reasons, `results.json`, `table.md` |
| `.cache/approved/` | No | The copy of each approved page |
| `local.json` | No | Brands, links, the dev server address |

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
  `/` covers its folder) reruns all five. Anything else reruns nothing, and the job passes; when the PR
  already has an eval comment, it is edited to say nothing was rerun.
- It runs `bun run eval:pages --only <codes> --approved-from newest --title-prefix "CI eval" --cleanup`. The
  title prefix is removed from the new page before it is graded, so it cannot fail a check.
- It posts the table as one PR comment, edited in place on later pushes, and in the job summary. The comment
  opens with the regressions, then the table for each question, with the transcript size, the confirmation
  rounds and the page link (none when the run saved the page as a file).
- It fails when a check the approved page passes now fails on the new page (a **regression**), and only
  then. A question that published no page regresses on every check its approved page passes. A check that
  did not run, or one the approved page fails too, never fails the job. It also fails when the run stopped
  before any question finished, since nothing was checked, and the comment says so.
- The `skip-eval` label skips the rerun. The PR body says why on a line `skip-eval: <reason>`; the job posts
  "skipped: <reason>", and fails when the line is missing. Use it for a docs-only or allowlisted change.
  Adding the label does not start a run: push again, or use **Re-run jobs** on the eval job, which reads the
  labels and body as they are then. A push cancels the eval still running for the PR.

**Nightly** at 07:17 UTC it reruns all five questions on `develop` and posts one line per question to the Atlas
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
| `questions.json` | The five questions: code, reader, the ask, and the changes each example sets the bar for |
| `e-checks.json` | The eight E-checks, copied from the Evals tab, with who judges each |
| `local.example.json` | The shape of `local.json` |
| `run.ts` | The command |
| `ci.ts` | CI: which questions a change reruns, the PR comment, the nightly Slack message |
| `post-comment.sh` | CI: posts the comment, or edits the one already on the PR |
| `lib.ts`, `lib.test.ts` | Reading a transcript, the table, baselines, compare, and their tests |
| `baselines/` | One folder per stored run |

## Limits

- The judge and the grade read the page as text. Nothing here renders it, so anything that needs a screen
  (E7, the first-screen part of R10) waits for the UX review.
- E3 and R7 are judged on the page alone: the harness does not hand the run's raw data to the graders.
- The judge's calls are Claude's judgment. They earn trust as they match the reviewers' own calls on the
  same pages; until then a pass here is evidence, not a sign-off.
- One run of five questions is five full flows and twenty grading sessions. Use `--only` while iterating.
  CI reruns only the questions a change touches, and with `--approved-from` grades only the new page.
