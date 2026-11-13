## Why

<!-- One or two sentences on why this change is needed, then what changed. Refs ASP-NNNN. -->

## The standard

<!--
Tick each item this change meets. For an item it touches but does not meet, or one that does not
apply, leave it unticked and say why in one line under it. The items, their checks and examples
are in docs/STANDARD.md. A change to docs, CI or scripts only can write "Not an agent, skill or
flow change" here and skip the list.
-->

**Chat**
- [ ] C1 The chat reply is the answer: up to three points, the next step, one link
- [ ] C2 No inline images in chat
- [ ] C3 Cards only on request, through the lookup or show tools
- [ ] C4 After a widget: name the control and stop, or say it is for reference and carry on

**Load**
- [ ] L1 One router entry: one **Sections** row and one `references/<flow>.md`; no flow steps in `SKILL.md`
- [ ] L2 References one level deep
- [ ] L3 A `## Contents` section in every skill file over 100 lines
- [ ] L4 `SKILL.md` at most 500 lines, description at most 1,024 characters

**Metrics**
- [ ] M1 Every question code the agent answers has a row in page-standard's required-metrics table
- [ ] M2 The agent requests that row's fields and keeps no field list of its own
- [ ] M3 A missing metric is a note with its reason, never a 0

**Freshness**
- [ ] F1 Pages and replies that cite data point at page-standard's one freshness rule
- [ ] F2 An unfetched period reads "Atlas has no data", never "no posts"

**Storyline and saved answers**
- [ ] S1 A new page goes through the storyline step before it is built
- [ ] S2 A scheduled run states its storyline on the page and in the delivery message
- [ ] S3 Saved answers go to the person's record or the flow's record, never another person's

**Reviews**
- [ ] V1 Pages publish only through the page-standard build loop, with the English read and the UX review
- [ ] V2 No agent labels or system words in page copy

**Questions**
- [ ] Q1 Every question is an `AskUserQuestion` picker with a (Recommended) option and the free text field; none in chat text
- [ ] Q2 A new flow's questions and their options live in its own reference file
- [ ] Q3 The setup reply opens with the need, the decision and the result, then the missing connections and the approvals to come; no question code

**Proof**
- [ ] P1 A new agent ships with its spec, roster rows and orchestration block (`scripts/new-agent.sh` writes them; no `TODO(new-agent)` left)
- [ ] P2 Each question code it answers has an eval question, and its approved page once it has one
- [ ] P3 A new or changed rule carries the before-and-after table below

## Question rerun

<!--
The question codes rerun with `bun run eval:pages --only <code>`, and the table from
scripts/eval/.runs/<time>/table.md, with `--compare` output when a result moved. "None: no agent,
flow or rule changed" when nothing here changes what a page says.
-->

## The gap it proves

<!--
For a new or changed rule: the check that failed on the page built without the rule, and passes
with it. "No new rule" when the change adds none. See "How to write a rule" in docs/STANDARD.md.
-->

## Checks that cover it

<!--
The scripts, page checks or reviews that catch a regression of this change, for example
`check-skill-layout.sh` (chain), page check R11, or "reviewer only" with the reason no script can count it.
-->
