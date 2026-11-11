# The Atlas skill and agent standard

Every new or changed skill, agent and flow in this repository meets this checklist before it
merges. It turns the six changes from the review of real Atlas runs (Linear project "Atlas plugin
update: Sunil's six changes") into one line per item, so a person adding an agent copies the
standard instead of whatever an older agent did.

The pull request template repeats the item ids. A PR ticks each item it touches, or says why one
does not apply.

## Contents

- [How to read an item](#how-to-read-an-item)
- [1. Chat](#1-chat)
- [2. Load](#2-load)
- [3. Metrics](#3-metrics)
- [4. Freshness](#4-freshness)
- [5. Storyline and saved answers](#5-storyline-and-saved-answers)
- [6. Reviews](#6-reviews)
- [7. Questions](#7-questions)
- [8. Proof](#8-proof)
- [How to write a rule](#how-to-write-a-rule)
- [Rules that still apply](#rules-that-still-apply)
- [Changing this standard](#changing-this-standard)

## How to read an item

Each row has an id, the item, the ticket that introduced it, where it is checked, and one good and
one bad example. The examples come from real pages and replies, with brands and handles replaced by
placeholders, because this repository is public and holds no customer names.

**Checked by** says which of three kinds of check catches a miss:

- **script**: a `scripts/check-*.sh` script, or the page check in
  `plugins/aspire/skills/page-standard/page-check.md`, that fails CI or the page's self-check.
- **reviewer**: a person, or the judgment review on the PR, reading the change against the item.
- **eval**: `bun run eval:pages` rerunning the example questions and grading the new page beside
  the approved one (`scripts/eval/README.md`).

"Lands with ASP-NNNN" means the rule or its check is that ticket's work and is not on `develop`
yet. Until it lands, a reviewer checks the item by hand. Three tickets automate the rest of this
file: ASP-5382 (`check-agent-standard`, every countable item), ASP-5385 (the eval rerun on a PR
that changes an agent or flow) and ASP-5386 (a judgment review of changed prose against the items
a script cannot count).

## 1. Chat

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| C1 | The chat reply is the answer: up to three points, each naming the creator or post and the number behind it, then the next step in one line, then one link to the page (its file path when the session cannot publish). | ASP-5290 | reviewer; judgment review (lands with ASP-5386) | "@handle: 4.1% engagement on 38K views, twice her usual. Next: approve her for the gifting wave. Page: {link}" | A reply that repeats the page: twelve bullets, a table of every creator, and the link at the bottom. |
| C2 | No inline images in chat: never a card, chart, or theme preview drawn as embedded image data. | ASP-5290 | script (lands with ASP-5382); reviewer | The reply names three creators in text and offers "Say 'show me the cards' to see them." | A search reply that embeds a base64 card for every creator, which fills the context and gets compacted away. |
| C3 | Cards appear only when the person asks, through `lookup_creators` or `lookup_posts`, or `show_ads` or `show_partnership_content` for ad grids. The search tools draw no card. | ASP-5291, ASP-5380 | reviewer; script (lands with ASP-5382) | "Show me the cards" after a creator search draws them with `lookup_creators` on the creators Atlas already holds. | A flow that calls a search tool for its cards, so every search draws a widget nobody asked for. |

## 2. Load

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| L1 | One router entry: a new flow is one row in `SKILL.md`'s **Sections** index and one file, `references/<flow>.md`, that holds its steps. `SKILL.md` holds no flow's steps. | ASP-4093 | reviewer; script (lands with ASP-5382) | The shops flow: one **Sections** row pointing at `references/shops.md`. | A new flow written as forty lines inside `SKILL.md`, loaded on every `/aspire` call. |
| L2 | References are one level deep: a file under `references/` never cites another file there; it cites a section by its name in the **Sections** index. | ASP-5292 | script: `check-skill-layout.sh` (chain) | "Price it with **Fee calculator**." | "Read `references/fees.md`, then `references/rates-and-terms.md`." |
| L3 | A Markdown file over 100 lines under `skills/` opens with a `## Contents` section whose links resolve to its headings. | ASP-5292 | script: `check-skill-layout.sh` (contents) | `references/creator-card.md`, with its eleven-link Contents. | A 300-line reference with no contents, read top to bottom to find one step. |
| L4 | `SKILL.md` stays at or under 500 lines and its description at or under 1,024 characters. | ASP-4093, ASP-5292 | script: `check-skill-layout.sh` (lines, description), `check-directory.sh` | The `/aspire` router, which connects, settles the brand, and hands each request to one flow file. | A description that lists every trigger phrase of every flow and runs past 1,024 characters. |

## 3. Metrics

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| M1 | Every question code the agent answers (its spec's **Questions answered**) has a row in page-standard's required-metrics table. | ASP-5293 | script (lands with ASP-5382) | An agent answering O1 builds on the "what landed and why" row. | A new agent answering I1 with no row, so nobody can say which numbers its page owes. |
| M2 | The agent requests the fields that row names, and keeps no field list of its own. | ASP-5293 | reviewer; script (lands with ASP-5382) | "Request the fields in page-standard's row for this question." | A flow file with its own list of eight fields, missing shares and saves. |
| M3 | A missing metric is a note beside the number it would sit next to, with the reason, never a 0. | ASP-5293 | script: page check R13 (lands with ASP-5293); eval (E4) | "Saves: not available. Instagram returns saves only for connected accounts." | "0 saves" on a post Atlas never had saves for; 21.6 million paid views shown as a win at 0.06% engagement. |

## 4. Freshness

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| F1 | Every page and every chat reply that cites data points at page-standard's one freshness rule, and states the newest post Atlas holds and when it was fetched or last changed. No flow writes its own age rule. | ASP-5295 | script: page check R14; reviewer | "Newest post Atlas holds for @handle: 7 Nov, last changed 8 Nov." | A flow file with its own "older than three days" rule that disagrees with every other flow. |
| F2 | A period Atlas has not fetched reads "Atlas has no data for {period}", never "no posts". | ASP-5295 | reviewer; eval (E3) | "Atlas has no data for 3 to 9 Nov for @handle. Refresh it? About 2 minutes." | A weekly readout that said "no posts this week" for a week Atlas had not fetched. |

## 5. Storyline and saved answers

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| S1 | A new page goes through the storyline step before it is built: three short bullets, each with the size of its evidence, asked as one `AskUserQuestion` with Build, Change, and Widen. A repeat run of the same page skips it. | ASP-5297 | reviewer; eval (E1, E8) | "Gift framing drives saves (14 posts, 6 creators, 410K views). Build?" | A holiday plan built on the first guess at the argument, which took five rounds to reach an approved page. |
| S2 | A scheduled or unattended run asks nothing and states its storyline at the top of the page and in the delivery message. | ASP-5297 | reviewer; judgment review (lands with ASP-5386) | A daily insights page whose answer block opens with its three storyline bullets and their evidence sizes. | A scheduled run that waits on a question nobody is there to answer. |
| S3 | Saved answers go to the right record: a person's own defaults under their `user:usr-<id>` `user_fact` key, a flow's reader, scope, save choice and last run on the flow's organization-wide `applied_config` record. Never another person's key. | ASP-5298, ASP-5299 | reviewer | "Reader: leadership, as the weekly readout was last run. Right?", saved on the readout's own record. | A teammate's reader choice written to the first person's key, so a scheduled run follows one person's preference. |

## 6. Reviews

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| V1 | A page publishes only through the page-standard build loop: the self-check, then the English read and the UX review by separate reviewers that see the rendered page, not the builder's notes. | ASP-5300, ASP-5301 | script: the `page-check` block's `englishRead` and `uxReview` entries (land with ASP-5300 and ASP-5301); eval (E6, E7) | A monthly program report whose separate review found and fixed four blocking problems before it published. | A plan whose first task sat 3,300px down on a phone, found only when a person opened it. |
| V2 | No agent labels or system words in page copy: R11's list, plus the agents' own labels ("picks", "pulse", "reads", "the run", "reach slot", "practitioners"). | ASP-5300 | script: page check R11 (the label words land with ASP-5300) | "Creators we recommend" | "Gift and routine framing lifts posts" beside "ran at 1.27×", in the agent's own shorthand. |

## 7. Questions

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| Q1 | Every question, routine ones included, is an `AskUserQuestion` picker: the suggested answer first as the (Recommended) option, 2 to 4 options in all, and the tool's free text field as the blank. Never a question in chat text, a `wrap_up` button, or a template to fill in. | ASP-4093 (decided 2026-11-09) | reviewer; script (lands with ASP-5382) | "Which launch is this for?" with "Holiday gift sets (Recommended)" from the brand's site, "Spring refresh", and the free text field for anything else. | "What's the product and launch date? Reply with: Product: [ ] Date: [ ]" |
| Q2 | A new flow's questions live in its own `references/<flow>.md` (L1), with the option set each one ships with. | ASP-4093 | reviewer | Each question in the flow file lists its options and which one is recommended. | A question whose options the flow makes up at run time, different on every run. |

## 8. Proof

| Id | Item | Ticket | Checked by | Good | Bad |
| -- | ---- | ------ | ---------- | ---- | --- |
| P1 | A new agent ships with its spec in `docs/agent-specs/agents/`, its roster rows, and its orchestration block. | ASP-4101, ASP-5381 | script: `check-agent-specs.sh`, `check-agent-roster.sh`, `check-orchestration.sh`; presence of the spec lands with ASP-5382 | A new agent PR with its spec, its hand-off row, and its section 11 block. | An agent file with no spec, so nobody can say which questions it answers or who reads its page. |
| P2 | Each question code the agent answers has an eval question in `scripts/eval/questions.json`, and once it has an approved page, the spec's **Approved example** names the ticket that holds it. | ASP-5302 | reviewer; eval (lands on PRs with ASP-5385) | The I4 question, with its reader and its approved plan named by ticket. | An agent whose page has never been rerun, so a rule change cannot show it helped. |
| P3 | A PR that adds or changes a rule carries the before-and-after table from `bun run eval:pages`, and the gap the rule closes. A PR with no new rule says "no new rule". | ASP-5302 | reviewer; the PR template; eval (posted on the PR with ASP-5385) | The table for the question the rule is about, with the check that failed before and passes after. | A new rule with no rerun, so nobody knows whether the page already got it right. |

## How to write a rule

Claude knows what clear English and the right metrics look like. It does not apply them reliably
across a long run. A rule earns its place when it closes that gap, and only then.

1. **Prove the gap first.** Run the question without the rule. If the page already gets it right,
   do not add the rule.
2. **Name the behavior, not the quality.** "Write clearly" changes nothing. "No arrows, no 'vs',
   one idea per sentence" changes the output, because it can be checked.
3. **Put the rule at the step where it applies,** with one good and one bad example from a real
   page.
4. **Check it before publishing:** with a script when it can be counted (metrics, data age, banned
   words), and with a separate reviewer when it needs judgment (English, UX).

A new item in this file follows the same four steps, and gets a row with its ticket, its check
and its two examples.

## Rules that still apply

The rules in `CONTRIBUTING.md` **Rules for skills and agents** and `CLAUDE.md` still hold: every
Atlas write is confirmed first, unattended runs never ask and never destroy, no internal ids, slugs
or tool names reach the person, the tool surface is re-verified before each release, and no
secrets, customer names, or internal URLs go in any file. This standard adds to them and replaces
none of them.

## Changing this standard

Change this file and `.github/pull_request_template.md` in the same pull request, with the ticket
that introduces the item. Changes need a review from the plugin owners in `.github/CODEOWNERS`.
