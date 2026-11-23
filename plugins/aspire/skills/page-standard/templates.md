# Page templates

An agent that renders through a template writes no HTML. It returns its page as data in one
shape, names one of six templates, and the fill script (`page-fill.md` in this folder) checks the
data and prints the page. Every page made this way has the same order, the same blocks
(`blocks.md`), the mark, and the source line.

Read this file only when the flow's reference says its page uses a template. It sets the shape
and the order. What each part says, the reader rules, and the R1 to R15 checks still come from
`SKILL.md`.

## Contents

- [1. Making a page from data](#1-making-a-page-from-data)
- [2. The page data](#2-the-page-data)
- [3. Rules beyond the shape](#3-rules-beyond-the-shape)
- [4. The six templates](#4-the-six-templates)
- [5. Length budgets](#5-length-budgets)
- [6. Which agent uses which template](#6-which-agent-uses-which-template)

## 1. Making a page from data

1. Do the build loop in `SKILL.md`, section 4, up to the draft. Instead of drafting HTML, write the
   page data (section 2) to a file named `page.json` in a new temporary folder.
2. Run the fill script with the command in `page-fill.md`. Fix every problem it prints and run it
   again.
3. Run the page check (`SKILL.md`, section 5) on the page it printed, and the English read and the
   UX review on the same page. A fix goes in the data, never in the printed HTML.
4. Publish the printed page as `SKILL.md`, section 4, step 5 says.

`page-data.schema.json` is the shape as JSON Schema. `page-templates.json` holds the templates,
the page order, and the length budgets. The fill script reads both, and the length budgets are
there as data for a check of page length to read.

## 2. The page data

One JSON object. Text fields are plain words, never HTML. The field names and limits match the
brand snapshot report where the two overlap: `title`, `answer`, `figures` with a `comparison`,
`actions` with a `rank` and a `job`, `gaps`, and `sources`.

| Field | What it holds |
| ----- | ------------- |
| `version` | `1` |
| `template` | `readout`, `shortlist`, `verdict`, `profile`, `plan`, or `dashboard` |
| `length` | A Readout's length budget: `daily` or `weekly`. No other template sets it |
| `example` | `true` on a page of invented brands and numbers. The page then carries an Example label |
| `title` | The question the page answers, up to 90 characters. It heads the page above the answer |
| `answer` | The answer in one sentence, up to 280 characters. It is the page's only `h1` |
| `takeaway` | Optional. The one number or reason behind the answer, against a comparison |
| `scope` | The reader, the brand, the date range, the question code, every subject account, each platform with its post count, `preparedBy` for a VP or budget owner, the checks that are N/A (`na`), and the connected `tools` the figures came from |
| `figures` | Up to three headline figures, each a `label`, a `value`, a `comparison`, and optionally a `status` and a `source`. They show as KPI tiles under the answer. Every number in the data is finite and under 10<sup>15</sup> |
| `insights` | Up to three, each a claim (`text`), its `evidence`, its `comparison`, the `so` line, and its `source`. Only the first may carry a `chart`, which is a stacked bar with bar labels of up to 16 characters and up to six segment labels |
| `actions` | The ranked next steps. Each has a `rank`, a `verb` and an `object` ("Send" "first messages to the 3"), an `owner`, a `due` date, the `effect` it should have, the `job` that does it, its `cost`, and its `source` |
| `decisions` | What the reader must approve, kept apart from the actions. Each has its `text`, the `approver`, a `by` date when there is a deadline, what happens `then`, and its `cost`. Empty when nothing needs approval |
| `evidence` | Other evidence lines, each with its `source` and a link when there is one. Posts and creators go in `sections` |
| `gaps` | Up to three lines of what is missing, each "{gap}: {what connecting it would add}". Empty on a page shared outside the team |
| `confidence` | How sure the page is: `level` (`high`, `medium`, or `low`) and `why`, in one line |
| `sources` | The numbered sources the method lists |
| `method` | Optional. The scoring `weights`, adding up to 100, and short `notes` on how it was worked out |
| `drafts` | Optional. What Atlas can draft next, each with what it `waitsOn` |
| `sections` | The typed sections a template adds (below) |
| `theme` | Optional. A saved brand theme's token rules (`css`) and its fonts link (`fontsHref`), from `theme.md` |
| `footer` | When the numbers were read (`updated`), one `freshness` entry per cited account, any `notes`, and the `source` line word for word as `artifact-standard.md` sets it for this page |

**Source labels.** Every figure, insight, action, and evidence line names where it came from:
`Atlas`, `Brand memory`, `Web`, `You` (what the person said in this session), `Our read` (a
judgment the page makes from the evidence), or a connected tool by the name the reader knows, which
must also be in `scope.tools`.

**Costs.** A cost has a `kind` (`money`, `none`, `unpriced`, `team`, or `reader`) and the `line`
the page shows, written as `recommendations.md` sets it. A monthly cost adds `period: "month"`. A
cost that cannot be priced adds the `missing` figure and its `holder`, both shown in the line.

**Jobs.** `job` names the /aspire job that does the step: one of the brand snapshot report's jobs
(`connect-channels`, `account-review`, `creator-discovery`, `creator-vetting`, `creator-brief`,
`creator-outreach`, `content-sourcing`, `ad-reuse`, `brand-safety`, `weekly-report`), or an agent
by its name without the `atlas-` prefix. The page shows it in plain words.

**Typed sections.** Each template needs some and allows others (section 4).

| Section | What it holds | Block |
| ------- | ------------- | ----- |
| `kpis` | Up to twelve more KPI tiles, shape as `figures` | 3.24 |
| `creators` | Each creator's account, profile link, `verdict` (`yes`, `maybe`, `no`), `reason`, the checks reached, up to three stats, an optional `group` (shown as a chip on the card), and for a Maybe the question that would `settle` it | 3.7 |
| `posts` | Each post's link, account, time, `metrics` it shows, `missing` metrics with the reason, its views against the usual, a `why` line, and an optional quote | 3.8 |
| `verdict` | The `call`, its `status`, the `reason`, and the `checks` behind it | 3.25 |
| `steps` | Dated plan steps: `when`, `what`, and `who` | 3.17 |

The repository keeps one complete example data file per template in
`scripts/fixtures/page-templates/`.

## 3. Rules beyond the shape

The fill script checks these after the shape. Each problem it prints names its rule.

- `template-sections`: the typed sections the template needs are there, and none it does not allow.
- `length`: a Readout sets `length`; no other template does.
- `action-ranks`: ranks are unique and ascending.
- `source-label`: every source is one of the labels above.
- `dates`: every date is a real date, `footer.updated` a real date and time.
- `maybe-settle`: every Maybe carries its settle question.
- `post-metrics`: a metric is shown or missing, never both.
- `one-chart`: only the first insight carries a chart.
- `chart-series`: a chart has at most six segment labels, so each keeps its own color.
- `method-weights`: the weights add up to 100.
- `scope-accounts`: every creator and post account is in `scope.accounts`.
- `question`: a page that cites posts gives its question code, which sets the metrics each post needs (`SKILL.md`, section 8).
- `cost`: a cost that cannot be priced names the missing figure and who has it, both in its line.
- `freshness`: one entry for every cited account and none for any other, each with a fetch or a change date.
- `shared-page`: a page whose source line says "Shared with" lists no gaps and no freshness notes. It still shows its confidence.
- `no-internal-names`: no Atlas tool name (the page check's list, alone or inside a prefixed name) or record id in any field the reader sees, `scope.tools` included.
- `theme`: the theme holds token rules only: custom-property declarations in plain or `@media` rules, with no `<`, backslash, `url(` or `image-set(`.

## 4. The six templates

Every template keeps one order: the question and the answer, the insights, the actions, the
decisions, the evidence, how it was worked out, the gaps and confidence, and what Atlas can draft
next, then the source line. The mark sits at the top right, as `artifact-standard.md`, section 1,
sets it. A typed section takes its place in that order: KPI tiles and the verdict badge go under the
answer, plan steps follow the actions, and creators and posts are the evidence.

| Template | For | Needs | Also allows |
| -------- | --- | ----- | ----------- |
| Readout | What happened in a period and what to do about it | Nothing beyond the parts | `kpis`, `posts` |
| Shortlist | Ranked creators or posts, each with a verdict and its reason | `creators` or `posts` | `kpis` |
| Verdict | One piece of work or one post, judged | `verdict` | `posts` |
| Profile | One creator in full | Exactly one of `creators` | `kpis`, `posts` |
| Plan | Dated steps toward one goal | `steps` | `creators`, `kpis` |
| Dashboard | A standing page that tracks a program, its money, or its content | `kpis` | `creators`, `posts`, `steps` |

A Shortlist groups its creators by verdict and shows the tally under the answer.

## 5. Length budgets

A screen is 1280 by 800 pixels. `page-templates.json` holds each budget as data.

| Template | Budget |
| -------- | ------ |
| Readout | One screen for a daily readout, two for a weekly one |
| Profile | Two screens |
| Verdict | Two screens |
| Shortlist | As long as its creators and posts |
| Plan | As long as its actions and steps |
| Dashboard | As long as its tiles, creators, posts, and steps |

## 6. Which agent uses which template

| Template | Agents |
| -------- | ------ |
| Readout | daily-insights-report, weekly-insights-report, market-signal, quarterly-signal, profile-analyst |
| Shortlist | creator-discovery, creator-vetting, ad-reuse |
| Verdict | content-review, post-analysis, quality-review |
| Profile | creator-profile |
| Plan | creator-brief, shops, creator-outreach, creator-negotiation |
| Dashboard | program-dashboard, program-ledger, deliverable-tracker, roster-manager, affiliate-manager, campaign-orchestrator, content-library, content-sourcing, product-fulfillment |

The PPA pitch uses no template: its page is a deck with a fixed set of eleven slides
(`ppa-pitch.md`). An agent's own reference still wins where it sets a layout the template does not
cover, as `SKILL.md`, section 1, says.
