# {{NAME}}

TODO(new-agent): one paragraph on what this flow answers, for whom, and the agent that builds its
page (`{{AGENT}}`). Every page it publishes follows the **Artifact standard** and the
`page-standard` skill (`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`).

## Contents

| Section | What it holds |
| ------- | ------------- |
| [The ask](#the-ask) | The question codes this flow answers, in the persona's words |
| [The reader](#the-reader) | Who reads the page, and what they decide from it |
| [Required metrics](#required-metrics) | The page standard's row for each code, and what this flow adds |
| [The data read](#the-data-read) | What the agent reads from Atlas, and in what order |
| [The storyline](#the-storyline) | The three bullets confirmed before the page is built |
| [The page](#the-page) | The page's parts, in order |
| [Saved answers](#saved-answers) | What is kept on the flow's record between runs |
| [Scheduled path](#scheduled-path) | What an unattended run does instead of asking |

## The ask

{{ASK_ROWS}}

TODO(new-agent): the setup questions the main thread asks before launching `{{AGENT}}`, each as an
`AskUserQuestion` picker with its options and the recommended one first.

## The reader

TODO(new-agent): the default reader (`team` unless a code names another), what they decide from the
page, and how another reader changes the headline and which part leads.

## Required metrics

The page carries every metric in the page standard's required-metrics row
(`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`, section 8) for each code. This flow may add
metrics to a row, never drop one.

| Code | Row | Added by this flow |
| ---- | --- | ------------------ |
{{METRIC_ROWS}}

## The data read

TODO(new-agent): the Atlas reads, in order, with the window (days or post count) each covers.
Freshness follows page-standard's Data freshness rule
(`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`, section 9); this flow sets no age rule of
its own.

## The storyline

TODO(new-agent): what the three storyline bullets argue, and the evidence size each one states.
The agent returns them as one picker (Build, Change, Widen) before the first build of a new page.

## The page

TODO(new-agent): the page's parts in the page standard's skeleton order (who it is for, the answer,
up to three insights, ranked next steps, decisions, evidence, method, what is missing), and the
page title.

## Saved answers

TODO(new-agent): what the flow keeps on its own organization-wide record (reader, scope, save choice,
last run), and what it keeps on a person's own `user_fact` key. Never another person's key.

## Scheduled path

TODO(new-agent): whether this flow runs on a schedule. An unattended run asks nothing, states its
storyline at the top of the page and in the delivery message, and saves only what the setup
approved. With no schedule, say "Interactive only".
