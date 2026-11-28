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
- [7. Fitting a flow's page into the data](#7-fitting-a-flows-page-into-the-data)
- [8. Live parts](#8-live-parts)

## 1. Making a page from data

1. Do the build loop in `SKILL.md`, section 4, up to the draft. Instead of drafting HTML, write the
   page data (section 2) to a file named `page.json` in a new temporary folder.
2. Run the fill script with the command in `page-fill.md`. Fix every problem it prints and run it
   again.
3. Run the page check (`SKILL.md`, section 5) on the page it printed, and the English read and the
   UX review on the same page. A fix goes in the data, never in the printed HTML.
4. Publish the printed page as `SKILL.md`, section 4, step 5 says. A page with live parts
   (section 8) is published with the declaration the fill script prints with `--capabilities`.

`page-data.schema.json` is the shape as JSON Schema. `page-templates.json` holds the templates,
the page order, and the length budgets. The fill script reads both, and the page check measures
each page against its length budget (R10).

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
| `groups` | Optional, Shortlist only. Its own names for the yes, maybe, and no groups, shown in the group headings and the tally |
| `theme` | Optional. A saved brand theme's token rules (`css`) and its fonts link (`fontsHref`), from `theme.md` |
| `live` | Optional, Dashboard and Plan only. The page's live parts and the capability declaration they need (section 8) |
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
| `creators` | Each creator's account, profile link, `verdict` (`yes`, `maybe`, `no`), `reason`, the checks reached, up to twelve `stats`, an optional `group` (shown as a chip on the card), for a Maybe the question that would `settle` it, and its filter values (`tags`, section 8). The creator card's own parts are optional: the profile picture (`image`, embedded per `creator-card.md`, **Images**), the `score` ring (a fit or match score out of 100), up to twelve labelled `details` (brand safety, notes, points per criterion, contact route, fee), and up to three post `thumbs` | 3.7 |
| `posts` | Each post's link, account, time, `metrics` it shows, `missing` metrics with the reason, its views against the usual, a `why` line, an optional quote, and its filter values (`tags`, section 8) | 3.8 |
| `verdict` | The `call`, its `status`, the `reason`, and the `checks` behind it | 3.25 |
| `steps` | Dated plan steps: `when`, `what`, and `who` | 3.17 |

The repository keeps one complete example data file per template in
`scripts/fixtures/page-templates/`.

## 3. Rules beyond the shape

The fill script checks these after the shape. Each problem it prints names its rule.

- `template-sections`: the typed sections the template needs are there, and none it does not allow.
- `length`: a Readout sets `length`; no other template does.
- `groups`: only a Shortlist names its verdict groups.
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
- `banned-phrase`: no phrase on the banned-phrase list (`glossary.md`, section 2) in any field the reader sees.
- `no-internal-names`: no Atlas tool name (the page check's list, alone or inside a prefixed name) or record id in any field the reader sees, `scope.tools` included.
- `page-size`: the page's images are at most 8,000,000 characters of data URIs and the printed page at most
  10,000,000, the budgets in `creator-card.md`, **Images**, **Budgets**; the message gives that section's cut order.
- `theme`: the theme holds token rules only: custom-property declarations in plain or `@media` rules, with no `<`, backslash, `url(` or `image-set(`.
- `live-parts`: `live` holds at least one part, and only parts the template allows (section 8).
- `live-capabilities`: `live.capabilities` declares what each part needs, and a `team` part's `db` rules let only Editors read `team`.
- `live-team`: the team part has a tile or a table, each reads a document under `team`, and none of its words shows an amount.
- `live-form`: field keys and row ids are unique, a select field has options and its values are among them, and a date is a real date.
- `live-filters`: only the filtered cards carry `tags`, each on a facet the filters name, and the page has those cards.
- `live-approvals`: item ids are unique, question ids are unique within an item, and a held item asks no questions.

## 4. The six templates

Every template keeps one order: the question and the answer, the insights, the actions, the
decisions, the evidence, how it was worked out, the gaps and confidence, and what Atlas can draft
next, then the source line. The mark sits at the top right, as `artifact-standard.md`, section 1,
sets it. A typed section takes its place in that order: KPI tiles and the verdict badge go under the
answer, plan steps follow the actions, and creators and posts are the evidence.

| Template | For | Needs | Also allows | Live parts |
| -------- | --- | ----- | ----------- | ---------- |
| Readout | What happened in a period and what to do about it | Nothing beyond the parts | `kpis`, `posts` | None |
| Shortlist | Ranked creators or posts, each with a verdict and its reason | `creators` or `posts` | `kpis` | None |
| Verdict | One piece of work or one post, judged | `verdict` | `posts` | None |
| Profile | One creator in full | Exactly one of `creators` | `kpis`, `posts` | None |
| Plan | Dated steps toward one goal | `steps` | `creators`, `kpis` | `team` |
| Dashboard | A standing page that tracks a program, its money, or its content | `kpis` | `creators`, `posts`, `steps` | `team`, `form`, `filters`, `approvals` |

A Shortlist groups its creators by verdict and shows the tally under the answer. The tally counts
the cards on the page; `figures` give any counts that include creators folded into `evidence`. The groups are
named To contact, Maybes, and Left out; a page whose groups mean something else (a standing pool,
for example) names them in `groups`.

## 5. Length budgets

A screen is 1280 by 800 pixels. `page-templates.json` holds each budget as data. A budget covers
the argument: the page from the top to the end of its decisions. The evidence and everything after
it sit below and are not counted. The page check estimates the height and fails a page over its
budget (R10; `rubric.md`, section 4). The budget caps the page; it does not loosen R10's first
screen. A page or section for a VP or budget owner, and a flow whose reference sets one screen (the
Readout's Leadership lens, the competitive brief), still fits its argument on the first screen.

| Template | Budget |
| -------- | ------ |
| Readout | Two screens, daily or weekly. The head, the scope and the first insight take most of a screen, so a daily readout cannot fit one |
| Profile | Two screens |
| Verdict | Two screens |
| Shortlist | As long as its creators and posts |
| Plan | As long as its actions and steps |
| Dashboard | As long as its tiles, creators, posts, and steps |

## 6. Which agent uses which template

| Template | Agents |
| -------- | ------ |
| Readout | daily-insights-report, weekly-insights-report, market-signal, quarterly-signal, profile-analyst |
| Shortlist | creator-discovery, creator-vetting, ad-reuse, camera-screen |
| Verdict | content-review, post-analysis, quality-review |
| Profile | creator-profile |
| Plan | creator-brief, shops, creator-outreach, creator-negotiation, cas-creative-review |
| Dashboard | program-dashboard, program-ledger, deliverable-tracker, roster-manager, affiliate-manager, campaign-orchestrator, content-library, content-sourcing, product-fulfillment |

The PPA pitch uses no template: its page is a deck with a fixed set of eleven slides
(`ppa-pitch.md`). An agent's own reference still wins where it sets a layout the template does not
cover, as `SKILL.md`, section 1, says.

## 7. Fitting a flow's page into the data

A flow that renders through a template keeps its own rules for what to read, what to compute, and
what each part says. Its reference maps those onto the fields in section 2 and sets no layout: the
template sets the order, the blocks, the mark, and the source line. Where a flow has more than the
fields hold, it fits the content in this way and never adds HTML to the printed page.

- **The answer states the finding.** `answer` is the conclusion with its number and its
  comparison ("Engagement rate was 4.1%, up 38% on the 28-day median"), never a topic title.
  `title` is the reader's question. A banner a flow used to draw (a repeat window, a sample, a
  stale read) is the first `footer.notes` line and, when it changes the answer, `takeaway`.
- **The question code.** `scope.question` is the launch block's `question`, or the code the flow
  answers for this reader (`orchestration.md`, **3**). A page that cites posts must carry one.
- **Every number has a comparison and a source.** A figure, KPI tile, or stat with no baseline,
  prior period, peer, goal, or own usual to set against it stays off the page. Each insight,
  action, figure, and evidence line carries one of the source labels in section 2.
- **Rank, then cut.** The three strongest findings for the reader are the `insights`. A finding
  that ranks fourth or lower becomes an evidence line, a KPI tile, or a post's `why`, or it goes;
  it is never a fourth insight.
- **One chart.** Only the first insight carries a chart, a stacked bar. A line, scatter,
  timeline, or second chart a flow used to draw becomes that insight's evidence in words ("9
  weeks, the last the highest") or a KPI tile with its comparison.
- **Tables become tiles or lines.** A short table of figures (share of voice per brand, rates per
  metric, verdict counts) becomes `sections.kpis` where the template allows them, or `figures`.
  A table of items (open action items, reviews, competitors, findings) becomes evidence lines,
  one per row, each up to 200 characters with its link. Past ten rows, show nine and count the rest
  in the tenth line.
- **Lenses.** The page renders for the primary lens (`recipient-lens.md`): it picks the answer,
  the insights, and their order. Each other saved lens gets at most one evidence line on the page
  and its bullets in the chat summary and the delivery message. A lens that needs a page of its
  own gets one from its own run.
- **At least one action.** `actions` is never empty. When nothing else is due, the one action is
  the flow's standing next step (the next run, the next review, or publishing the approved work),
  with its owner and date.
- **Flags and red-line hits** that need someone to act are actions, ranked first. Ones that need
  approval are decisions. The rest are evidence lines.
- **Posts and media.** A post the page cites goes in `sections.posts` where the template allows
  it (up to 20), with its metrics, the missing ones and their reason, its `usual`, a one-line
  `why`, and an exact `quote` when the flow quotes it. Embed its image with the **Images** snippet
  in `creator-card.md`, page profile, kind `thumb@96x171` (the post card's box), into `image`. A
  frame still, timeline, or strip a flow used to draw goes; name the timestamps it showed in the
  post's `why` or an evidence line. On a template that allows no posts, link the post from an
  evidence line.
- **Paid label wording.** Follow `post-kinds.md`. The template has no `data-own` mark, so on a
  page its check reads (O1, O2, O3, I6, or with mention evidence) no field says "organic" or
  "unpaid" of posts beside a handle, the brand's own included: say "{brand}'s own posts", and
  "paid label" or "no paid label" for anyone else's.
- **Gaps.** The three that most change what the reader can conclude go in `gaps`, each "{gap}:
  {what connecting it would add}". The rest go in the chat summary.
- **Lists past their limit.** The fill refuses a list over its cap, so a flow never relies on
  spilling into another list:
  - `actions` (12): past twelve, the twelfth counts the rest ("Fix the other 6 findings, listed in
    the chat summary").
  - `sections.verdict.checks` (12): past twelve, keep the eleven worst rows and count the rest
    by status in the twelfth ("8 more: 5 pass, 3 not checked").
  - `method.notes` (6): the method's own notes come first; anything past six is counted in the
    sixth ("and 7 more brands on screen, listed in the chat summary").
  - Long text: `effect`, `decision.text`, and `then` hold 140 characters. A list (a cut list, a set
    of tiers) goes in evidence lines, one item each, and the field keeps a short summary.
- **Theme.** A saved theme goes in `theme`: the `:root` and `@media` token rules from `theme.md`,
  **Page tokens**, without the `<style>` tags, as `css`, and `fonts.href` as `fontsHref`.
- **The footer.** `updated` is the shell clock's UTC time; one `freshness` entry per cited
  account; `notes` holds the images-are-a-snapshot line when the page embeds images; `source` is
  the source line word for word.

**In chat,** each insight in the summary ends with "Based on: {its source labels}", the same
labels its page data carries ("Based on: Atlas, Brand memory").

## 8. Live parts

A standing page sometimes does more than show: it keeps amounts from everyone but Editors, takes
the team's entries, filters its cards, or takes an Editor's approval. Those are live parts. The
fill script prints each one with a fallback that reads right with no runtime, plus one script that
lights the parts up when the page's capabilities answer (`artifact-capabilities`). The agent writes
no script and no HTML for them.

`live` holds the parts and `capabilities`, the declaration the page is published with, exactly as
passed to the Artifact tool. The fill checks that each part's needs are declared, and
`--capabilities` prints the declaration back. Write the page data documents the parts read right
after the publish, in one batch, as the flow's reference says.

| Part | What it does | Needs | Placed | Fallback |
| ---- | ------------ | ----- | ------ | -------- |
| `team` | Values only Editors read: `tiles` (a `label`, the `doc` under `team` and the `field` in it, a `comparison` in words, optionally a `vsField` shown after it, and a `source`) and `tables` (a `title`, the `doc` and the `field` holding a list of rows, and up to six `columns`, each a `label` and a `field`) | `db`, with a rule that lets only Editors (`admin` or `owner`) read `team` | Under the answer | "Team view", or `team.fallback`, in place of each value |
| `form` | A form the team fills in: `fields` (`text`, `select` with `options`, or `date`) and one row per item (`id`, `label`, and its current `values`). Each change saves to `{collection}/{row id}` with `updatedBy` and `updatedAt` | `db` and `user` | After the decisions | The values as labels. Viewers who cannot write keep the labels |
| `filters` | Filters over the `creators` or `posts` cards (`target`): one select per facet, and a text box when `search` is true. Each card's values are its `tags`. The address hash keeps the filters | Nothing: it runs on the page's own data | Above the cards | Every card shows |
| `approvals` | Items an Editor decides: Approve, Not now, Do this in a session, or Ask for changes (with the typed changes), with the item's `questions` answered. Each decision saves to `{collection}/{their id}/actions/{item id}` with `verdict`, `fingerprint`, `answers`, `changes` for Ask for changes, and `updatedAt`. A `held` item shows why it needs a session and has no controls | `db` and `user` | After the decisions | The items, their questions and controls switched off |

- **Amounts stay in page data.** Every viewer sees a team part's words, so a label, comparison or
  column carries no amount; the fill refuses one (`live-team`). The amounts go in the `team`
  documents.
- **A decision's place says who made it.** Approvals save under the deciding Editor's own id, so
  the declaration gives each Editor write access only to their own `{collection}/{self}` (as
  `orchestrator.md` does), and a later run reads who decided from the path.
- **A page with no runtime still reads.** Opened outside Claude, signed out, or by a viewer the
  rules refuse, the page shows the fallbacks and says how to make changes. Values from page data
  are set as text, never as markup.

