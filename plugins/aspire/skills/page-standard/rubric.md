# Page check rubric: what each check means and how to fix a failure

The page check (`page-check.md`, run as `SKILL.md`, section 5 says) prints one line per check:
`pass`, `fail`, `n/a`, or `unmarked` (no markup for the script to read, so judge it by reading).
A `fail` holds an interactive publish, and a scheduled run publishes and reports it (`SKILL.md`,
section 4, step 5): fix it and run the check again. This
file says how each check is judged, what each scripted check fails on, and the fix.

What each check asks is defined once, in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/reader-standard.md`. Never restate it here or in a
flow. Every check is pass, fail, or N/A, never a score.

## Contents

- [1. How each check is judged](#1-how-each-check-is-judged)
- [2. What the script fails on, and the fix](#2-what-the-script-fails-on-and-the-fix)
- [3. A page built from a template](#3-a-page-built-from-a-template)
- [4. The length budget](#4-the-length-budget)

## 1. How each check is judged

| Check | How |
| ----- | --- |
| R1 Reader and scope, R2 Platforms covered, R6 Decisions kept separate, R11 Plain language, R13 Required metrics, R14 Data freshness, R15 Like for like | Script, or by reading when the page is drawn in script or carries no markup. R14's wording beyond the entry itself is judged: the period wording ("Atlas has no data for {period}", `SKILL.md`, section 9.3), behind-pace notes, and refreshes skipped as recently refreshed. R15 is also judged: a comparison the markup missed, and whether a share's group size is the right whole (`comparisons.md`, **What is judged**) |
| R3 Answer first, R4 Numbers have context, R10 Fits the reader | Script for the one headline, at most three insights, a comparison on every KPI tile and insight, and a template page's length budget; judgment for the rest (an insight that is not surprising, a comparison that is not like for like), and on a page with no such marks. The script fails R10 over the budget but never passes it: within the budget it is `unmarked`, and the first screen is judged as `reader-standard.md` says |
| R5 Clear next steps | Script for each recommendation's cost line, each trend to watch (`recommendations.md`) and each marked step's owner; judgment for who on an unmarked step, by when, what it should change, the arithmetic, and a recommendation or two-sided finding the markup missed |
| R7 Real evidence | Script for the links (every cited post, every explanation's evidence, every saved capture) and the source labels; judgment for each figure, checked against what the run read |
| R8, R12 | Judgment |
| R9 Names what's missing | Judgment on a team page; N/A on a page shared outside the team |

When the reader standard changes, this table and the script change in the same commit.

- **Sample pages** follow `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/sample-artifact.md`:
  no self-check and no page check.
- **A review page** (a quality review) runs the check with the words of the work under review
  marked as quoted.
- The scripted checks look only at the markup in `SKILL.md`, section 5, and the `data-own` mark
  (section 8 there). A page can pass the script and still fail the check in substance (a scope that
  names "the team" as the reader, an approval worded as a next step); judge that too.

## 2. What the script fails on, and the fix

On a page built from a template, make every fix in the page data and fill the page again
(section 3). On a hand-written page, fix the page and its marks (`SKILL.md`, section 5; `blocks.md`).

| Check | Fails when | Fix |
| ----- | ---------- | --- |
| R1 | The scope is missing, comes after the first `h2`, or does not show its reader, brand and range | One `data-page="scope"` at the top whose words show each of its attributes |
| R2 | A platform has no exact post count, a team page leaves one out, or the method's counts differ from the scope's | List Instagram, TikTok and YouTube with exact counts, or "not covered"; repeat the counts in the method |
| R3 | There is no headline (no `h1`), more than one, a one-word headline, one made only of label words, the brand and a period ("Creator performance overview", "Q3 results"), a headline that asks a question, or on a template page a headline outside the answer | Write the answer as the one `h1`: a sentence that states the finding ("Short how-to videos carried the week: post three more before Friday"). The question goes in the title above it |
| R4 | More than three insights, or a KPI tile or insight with no comparison (no `data-vs`, or one that says "none" or "n/a") | Keep the three insights that matter most and move the rest into the evidence. Put each number against something: the last period, the account's usual, peers of the same size, or a goal ("1.4 times the 8-week median of 291,000") |
| R5 | A recommendation with no cost line, a trend to watch with one reading, or a next step with no owner, a placeholder owner ("TBD", "someone"), or an owner in `data-owner` the step does not show | Price it as `recommendations.md` says. Name the person or role who does the step ("Social lead"), on the step and in `data-owner` |
| R6 | Decisions sit inside the next steps, a decision's date is not shown, or no decisions section says "Nothing needs approval" | One decisions section, apart from the steps, each decision with its shown date |
| R7 | A cited post with no link to itself, an explanation with no linked evidence, a saved capture missing its parts, or a claim with no source label, a label that is neither one of the five nor a connected tool the scope lists, or a label the reader cannot see | Link each post and each piece of evidence. End each insight, each next step and each evidence line with where it came from: Atlas, Brand memory, Web, You, Our read, or a connected tool by name (listed in the scope's `data-tools`, the page data's `scope.tools`) |
| R10 | A template page runs past its length budget (section 4) | Cut words from the answer, the insights, the steps and the decisions, or move detail into the evidence |
| R11 | An agent, tool or system name, a report label, "organic" or "unpaid" said of another account's posts, or a phrase on the banned-phrase list (`glossary.md`, section 2), outside quoted words | Say what the thing is in the reader's words; use the replacement the glossary gives. Never change a creator's own words: mark them quoted |
| R13 | A cited post lacks a metric its question requires and does not say why | Show the metric, or name it in `data-missing` with the reason beside it. Never show a missing metric as 0 |
| R14 | A cited account has no freshness entry, or an entry lacks its dates | One `data-fresh` entry per account in the source line (`SKILL.md`, section 9) |
| R15 | A comparison fails one of the four like-for-like checks and does not say so | Fix the comparison or say which check it fails, in one line (`comparisons.md`) |

## 3. A page built from a template

The fill script (`page-fill.md`) already refuses most of these in the data: a source that is not a
label (`source-label`), a banned phrase (`banned-phrase`), more than three insights, an action with
no owner, a figure with no comparison. What reaches the page check is what the data allowed: a
headline that is only a label, a comparison that says nothing, a page past its budget. Fix it in
`page.json` and fill the page again; a fix made in the printed HTML is lost on the next fill.

| Problem | Where it is fixed in the data |
| ------- | ----------------------------- |
| Headline | `answer`, one sentence that states the finding; the question is `title` |
| Insights | `insights`, at most three, each with its `comparison` |
| Figure with no comparison | Each entry of `figures` and `sections.kpis`, its `comparison` |
| Owner | Each action's `owner` |
| Source label | Each insight's, action's and evidence line's `source`; a connected tool also goes in `scope.tools` |
| Banned phrase | Wherever the fill script's problem line points (its `path`) |
| Length | `answer`, `takeaway`, `insights`, `actions` and `decisions`: fewer words, or detail moved into `evidence` and `sections` |

## 4. The length budget

`page-templates.json` holds each template's budget, in screens of 1280 by 800 pixels, and
`templates.md`, section 5, lists them. The budget covers the argument: the page from the top to the
end of the decisions. The evidence, the method, what is missing and what Atlas can draft next sit
below it and are not counted, so a page can be as long as its evidence needs.

The script estimates the height from the page's words and blocks at the default theme, without a
browser, and prints it in the R10 line (`length`: the height in pixels, the screens rounded up to a
tenth, and the budget). The estimate is within a few percent of the page as a browser draws it. A
template whose budget grows with its items (Shortlist, Plan, Dashboard) prints its height and is
never over. Within its budget, and on a hand-written page, R10 is `unmarked`: judge the first screen by reading, as R10 asks. A page for a VP or budget owner still puts the answer, the decisions and the next steps on the first screen, whatever its budget.
