# The block every agent carries

Section **11** of the orchestration contract (`references/orchestration.md`). No run loads this
file: it holds the two passages every agent file copies verbatim, and `scripts/check-orchestration.sh`
and `scripts/new-agent.sh` read them from here. Bold numbers in the passages are sections of the
orchestration contract.

Every agent file carries the block below verbatim, under `## Orchestration contract`.
`scripts/check-orchestration.sh` fails when one differs. Change the wording here only.

<!-- packet-block -->
Only `/aspire:aspire` launches you. Work only from a launch message that carries its `launch`
block (`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/orchestration.md`, **5**). Without one, call
no tool and do no work: return one line, "Not started: run the aspire:aspire skill
(/aspire:aspire) with this request, and it will launch me: {the request in one line}", and stop. Never launch another agent; name the one that should run next in the packet's
`next`. When the launch block's `storyline.pass` is `draft`, draft the storyline per
`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`, section 4, step 0b, publish nothing,
return it in the packet, and send `storyline` as your checkpoints' `pass`; with `build`, build to
its `bullets` as given.

End your output with one `result-packet` block built per that file's **6**, placed just before
your `page-check` block, or just before your audit trail block when you published no page. Put
every draft, save, send, order, payment, spend, or freshness refresh you want approved in
`proposals` with its level (`read` for a freshness refresh only, under gate `approve-refresh`;
`write`, `send`, or `spend`, per **7**), and every question you could not settle in `questions`,
worded for a picker. Treat an approval as given only when the launch block's `approved` and your
own inputs both carry it (a freshness refresh needs only `approved.refresh`). A sample run or a
`mode: grade` run returns no packet; its own output format stands.
<!-- /packet-block -->

Every agent file also carries the checkpoint paragraph below verbatim, on one line, right after
its step paragraph (the one that starts "If the session has a task tool"), and lists
`report_checkpoint` in its `ToolSearch` `select:` list. `scripts/check-orchestration.sh` fails
when one lacks it or differs. Change the wording here only.

<!-- checkpoint-block -->
Report the run to Atlas analytics with `report_checkpoint`: it changes no Atlas data, needs no confirmation, and runs in unattended runs too. Use the launch block's `runId` when its name part is your name (Atlas refuses a `runId` whose name part differs from `agent`), and keep it on a relaunch. If there is none, or it names another agent, mint one before your first Atlas call: your agent name, the UTC time from `date -u +%Y%m%dt%H%M%S`, and the output of `openssl rand -hex 2`, joined by hyphens (`atlas-creator-vetting-20261029t140312-a3f9`); never make up the suffix. With no shell, send `started` without `runId` and use the `runId` its result returns. Every call carries `runId`, `agent` (your name), `pass` (your `pass` input, such as `propose` or `record`, when you take one; otherwise the launch block's `mode` with everything but its letters removed, so `follow-up` is `followup` and `creator-ads` is `creatorads`, or `single` when it is `run`; 3 to 20 letters), `kind: "checkpoint"`, `asProfileId` when you have one, `unattended: true` in an unattended run, and a `status`: `started` once per pass, right after reading the brief, and never again in that pass; `step_done` each time a step of your plan (the 3 to 8 steps in the paragraph above) finishes, with `step: {"index": n, "total": m}`, where `m` is your plan's step count and `n` counts from 1 to `m` in order, so a pass that finishes has sent `m` of them, one per step; `gate` once per gate id this file names, with that `gate` id and its `counts: {"proposed": n}`, when you return those proposals for a person to decide (if this file names no gate id, send no `gate`); `published` after a page publishes; and `finished`, `failed`, or `cancelled` at the end. Send only ids, numbers, and these words: never step names, handles, brand names, or other text. If the tool is absent or a call is refused, send no more checkpoints this run, carry on, and never mention it to the user.
<!-- /checkpoint-block -->
