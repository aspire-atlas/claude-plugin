# Aspire Atlas mod

Optional. The [Aspire Atlas plugin](../aspire/README.md) works fully without it; this plugin only draws `/aspire`'s progress and agents in Claude Code.

## Install

On the beta channel, in Claude Code, next to `aspire`:

```shell
/plugin marketplace add https://github.com/aspire-atlas/claude-plugin.git#develop
/plugin install aspire-mod@aspire-atlas-beta
```

Install it from the same channel as `aspire`, which it needs and does not install for you:

- **Beta `aspire`**: install `aspire-mod` from the beta marketplace as above.
- **Official `aspire` 4.2.x and earlier**: do not install `aspire-mod`. Those versions already include this mod, so adding it would draw the bar and panel twice. Official `aspire` drops its built-in mod in its next major version.

`aspire-mod` lists no dependency on purpose. A declared dependency is installed from the add-on's own marketplace, so on the beta channel it would add the beta `aspire` next to an official one, and the root README warns against having both. Without `aspire`, the mod loads and stays inert. It is not on the official channel yet.

## What it does

A Claude Code mod built on function hooks, an early-access Claude Code API (tested on Claude Code 2.1.295 and 2.1.299). It does nothing until an Aspire event in the session: a prompt typed as `/aspire` or `/aspire:aspire`, the aspire skill running (or reporting progress), an Aspire Atlas connector tool answering, or an `aspire:*` agent starting. It goes back to sleep after `/clear`. Several events count because one is not enough everywhere: in sessions the Claude desktop app starts, Claude Code passes the skill's own prompt event over installed plugins, so there a typed `/aspire` is seen as the prompt itself. Then:

- **Progress bar above the prompt**: `Aspire: {organization}`, a bar with the step in progress, the percent complete, and the Aspire crab, adapted from savvy-progress. On the desktop the title's dot and the crab are small drawings (the dot in Aspire teal, green once finished; the crab animated, drawn at random from the agents' crabs once per run) and the percent and `×N` are buttons: press either to show or hide the agents panel. A button holds only text, so the terminal shows the plain ● and 🦀 glyphs instead. The organization is the selected one in the latest Atlas `get_status` result; with several organizations and none picked yet, the label is just `Aspire`. The `/aspire` skill moves the bar through the mod's `aspire_progress` tool (`mcp__aspire-mod__aspire_progress`, main session only; a subagent's call is ignored), one step per onboarding phase, and for any other flow its own steps (`tasks`), so the bar never shows onboarding's steps for a different flow. The same tool takes one optional field, `coach` (`{ verdict, step? }`: a one-line verdict of at most 140 characters and an optional round label of at most 30), which draws the prompt coach card above the bar, above the queued notice when both show: on the desktop a branded row with the Aspire crab in Aspire teal (light and dark, motion off under reduced motion), on the terminal one line, `Prompt coach: {verdict}`. `coach: null` or `finished: true` clears it, a new title or `/clear` clears it, and it clears itself after five minutes without a new report. Text is stripped of control characters and clipped, and a call from a subagent is ignored. A task whose title equals an `aspire:*` agent's description is marked done when that agent finishes. With no report at all, the agents that ran are the steps (done out of started). Until it reports, the bar shows a baseline from `get_status`: onboarding checkpoints done out of 6, where 1 is Atlas answered, 2 an organization picked, 3 a brand profile exists, 4 a channel is linked, and 5 (brand context) and 6 (first insights) come only from the skill's reports. Once the skill reports, its count wins.
  When the agent keeps its own task list (`TaskCreate`/`TaskUpdate`, `TodoWrite`, or the desktop app's own plan tool), the bar follows those steps instead, as in plain-view: `Step 2 of 4`, filled by the done steps plus an estimate for the one in flight (its tool calls against the average of the finished steps, 4 before any, never past 95%), and `All done` at the end. The skill's own report still wins while it runs and carries tasks of its own; a bare report (a title and a count) gives way to the agent's steps. The panel's **Progress** section shows the whole view: the request and the time, the step bar, a row and a bar for each step (`Done`, `~40%` with what the call is doing, `Next`, `Up next`; a long plan shows the five around the current one), and, once the turn ends, `All done`, `took 1:47`, and the files changed and read. An agent that keeps its own list (`TaskCreate`/`TaskUpdate` or `TodoWrite`) gets its steps and a bar on its row in the panel the same way, and that list wins over `aspire_step`. The mod only reads these calls; it never asks for a list or changes a prompt, so a session whose agent keeps none shows the baseline or the skill's report.
- **Band above the prompt**, the bar's second row: the turn number since `/aspire`, the speed of the last response, Atlas token costs (`Atlas tokens: used / limit`), and the context fill. The Atlas figure comes only from the latest Atlas `get_status` result. Without one the Credits card stays blank, never an estimate and never Claude's own usage. `✕` hides the bar and the band for the session; `/aspire-agents-info band` brings them back.
- **Aspire agents panel**, a stack of collapsible cards in the style of Claude's own sidebar; each header opens and closes its card. **Progress** is the bar from above (it follows what Atlas shows, an organization, a profile, a channel, until the skill reports its own steps). **Credits** is the organization's balance. **Running** and **Finished** list every `aspire:*` agent, plus any other subagent started after the mod switched on, with model and effort, context fill, and time. One card per group of agent types (collapsed at first) shows a crab row for each type the plugin ships, with a costume per group and a marker for the ones that ran or are running this session; pressing one drafts its start in the prompt. The roster lives in `hooks/roster.ts`, kept by hand beside the `aspire` plugin's `agents/`, because the mod makes no file calls. It opens by itself once, when the first `aspire:*` agent starts. `/aspire-agents-info` shows or hides it, and `/aspire-agents-info open` brings it forward. An agent that calls `aspire_step` (`mcp__aspire-mod__aspire_step`, agents only) shows its own steps, such as `2/5 reading posts`, and a bar of them; one that does not shows its context fill in grey, and its open row says what its latest tool call is doing and how many calls it made (a count and a few words from calls that already pass through the session). An agent only draws steps when it keeps a task list or calls `aspire_step`; the agent files ask for one, but the mod never makes an agent report. It shows no cost, because Atlas does not report token costs per agent. The command is not `/aspire agents`, which lists the plugin's agents and starts one.
- **Branded sites**: once `/aspire` runs, the mod puts the Aspire mark on the sites Claude Code draws itself. An Atlas tool call's row and a collapsed run of Atlas calls show the mark (the twin-comet spinner while a call runs; a small cell mark in the terminal). The question dialog shows the mark and the flow's current step above Claude Code's own dialog. The spinner adds "Aspire Atlas" and the step after its word, the line that closes a turn says where the flow stands, the hint under an idle prompt adds `/aspire help`, and `/aspire-agents-info` output carries the mark. Each is display only and leaves Claude Code's drawing in place. The spinner in the `aspire` plugin's `assets/` (twin comet) take `--spinner-bg`, `--spinner-color`, `--spinner-glyph` (and `-light` forms), or the page's `--brand`.
- **Characters**: the panel's pixel crabs. Each `aspire:*` agent wears its own influencer-marketing costume (a selfie phone, a megaphone, a clapperboard, a crown, and so on, 24 in all), and a second concurrent run of the same agent wears one of 7 variants (podcast mic, camera, unboxing, hashtag, like, sunglasses, trophy), so two runs are told apart. Other subagents keep the model and effort costumes from the mod this is adapted from. The costumes are in `hooks/costumes.ts` (cells in a small palette, plus a motion each); the rest of the cast is the `CHARACTERS` table in `hooks/characters.ts`.

- **Checking it**: `/aspire-agents-info status` prints whether the mod is on, what switched it on and when, how many Aspire events it has seen (typed `/aspire` prompts, Skill tool calls, progress reports, Atlas results, agents), the last `get_status` reading, what the bar shows, whether the band has been drawn on this surface, and the Claude Code version and surface. It works before `/aspire` too, so it shows whether the mod loaded at all.

The mod reads only what already passes through the session and makes no network, file, or process calls; see [SECURITY.md](SECURITY.md). Its tests run with `claude plugin test plugins/aspire-mod`.

### What each hook does

- **Credentials.** The mod reads no token, API key, or other credential, and makes no network, file, or process calls.
- **Tools the mod answers itself.** The mod registers two tools of its own, `aspire_progress` (the `/aspire` skill's progress, main session only) and `aspire_step` (an agent's own steps, agents only), and its `tool.call` hooks on those two names return the answer, because no other tool stands behind them. The answer is a short status line (`ok: …; band: visible on …`, or `ignored: …` for a call from the wrong place). No other tool is answered by the mod: every other `tool.call` hook passes the call on and returns what Claude Code gives back.
- **Prompt hooks.** `prompt.submit` reads whether the submitted prompt starts with `/aspire` or `/aspire:aspire` and, if it does, switches the mod on and counts it. `session.receive` reads a subagent's or peer session's hand-back text for claude.ai artifact links and logs each new one as a dim line. Both pass the prompt or message on unchanged; neither edits, adds to, or drops it.
- **Agent hook.** `agent.spawn` lets the agent start first, then reads its type, description, and model to add a row to the agents panel (and switches the mod on for an `aspire:*` agent). It changes nothing about the agent: its prompt, instructions, tools, settings, and model are passed on as they came, and a denied start is left denied.

### Where progress shows

The bar and band draw only where the host renders the slot above the prompt. The `aspire_progress` result ends with `band: visible on {surface}`, `not-drawn`, `hidden-by-user` or `unknown`, and the skill picks its channel from that, once per run. Where the bar is not drawn (and not hidden by you), the mod shows the same progress as one line under the prompt (`Connecting: step 2 of 4, Get organizations ▰▰▱▱ 50%`) and clears it when the run finishes or the bar appears. When an `aspire:*` agent's hand-back mentions a claude.ai artifact link (a subagent's publish draws no card in the main transcript), the mod logs one dim line per new link, `◆ Aspire · Artifact published: {link}`.

| Surface | Progress shows as |
| --- | --- |
| Claude Code, terminal | The bar |
| Claude Code, desktop app | The bar |
| Cowork, desktop app | The Cowork task list |
| Cowork, phone or web (untested) | The Cowork task list |
| claude.ai chat (skill only, no plugin hooks) | One progress line per phase |

Dismissing the bar with `✕` starts no fallback. `/aspire-agents-info status` adds a `Band:` line: how many times the slot has been drawn and on which surface, or that it never was.

### Atlas token costs

The band's `Atlas tokens: used / limit` figure shows what your organization has used in the current period, read from the latest answer Atlas gives to `get_status`. When Atlas doesn't report token costs for your organization, the figure stays blank: the mod never estimates it and never shows Claude's own usage in its place. The fields the mod reads are documented in `types/index.d.ts`.

### Third-party code

The progress bar, the band, and the panel are adapted from the savvy-progress and session-band mods in [claude-kit](https://github.com/johnnyvizz/claude-kit), Copyright (c) 2026 johnnyvizz, under the MIT License. The MIT notice is kept at the top of `hooks/register.tsx` and `hooks/characters.ts`; `hooks/format.ts` and `hooks/progress.ts` point to it. The steps behind the bar (`hooks/plan.ts`) and the Progress section's view are adapted from [plain-view](https://github.com/ice-lfernandes/claude-code-mods/tree/main/plain-view) in claude-code-mods, Copyright (c) 2026 Lucas Fernandes, under the MIT License; that notice is also at the top of `hooks/register.tsx`. MIT code can ship inside this Apache-2.0 plugin as long as that notice stays with it.

## License

[Apache-2.0](LICENSE). Copyright Aspire. Third-party notices are listed above.
