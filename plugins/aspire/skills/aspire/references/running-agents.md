# Running agents

Read with every flow that launches an Atlas agent, and with onboarding and every setup section
for **Checkpoints**: how a launch runs and what it waits for, the checkpoints,
how the ask is read for who acts on it, the examples library, and the decision audit. The
orchestration contract (**Orchestration contract**) is what goes into a launch and what
comes back; this file is how the main thread runs one.

## Contents

- [Running agents (always in a subagent)](#running-agents-always-in-a-subagent)
- [Checkpoints](#checkpoints)
- [Examples library](#examples-library)
- [Reading the ask (every request has two users)](#reading-the-ask-every-request-has-two-users)
- [Decision audit (how a piece of work was decided)](#decision-audit-how-a-piece-of-work-was-decided)
- [Guardrails for launches](#guardrails-for-launches)

## Running agents (always in a subagent)

Every Atlas agent runs in a subagent, never in the main thread, so the user can start another
agent, or ask anything else, while one works. This holds for every launch in this skill: a
direct ask, `/aspire:aspire run {agent}`, a hand-off from **List agents**, a second pass
(`propose` then `record`, `plan` then `build`), a relaunch, and a scheduled run.

Every launch follows the orchestration contract in **Orchestration contract**: routing with
the persona and reader, memory loaded first, one setup reply, the `launch` block, the result
packet, and the permission levels. This section is how a launch runs; that file is what goes in
and what comes back. Agents refuse a launch without the `launch` block, so a person reaches an
agent only through this skill or a shortcut.

1. **Launch.** Mint the run id first, once per launch, as **Orchestration contract** **5** says
   (`mint_run_id` with the agent's own name, never made up; a relaunch of the same run keeps it),
   and put it in the launch block's `runId`; with no shell, the packet's `runId` is the one feedback uses. Use the Agent
   tool with `subagent_type` `aspire:{agent}` (the name without the
   prefix gets it added), a `description` equal to the task it runs (**Progress bar**), a prompt
   that starts with the `launch` block (**Orchestration contract** **5**) followed by the
   inputs the flow lists, `run_in_background: true`, and the `model` from **Model tiers**
   (`sonnet` or `haiku`; for a tier of `inherit` pass none) unless the user named a model for
   this launch, which wins (pass it as `sonnet`, `opus`, `haiku`, or `fable`). Never pass
   `effort` from the table; set it only when the user asks for one. Where plugin agents do
   not load, launch a general-purpose subagent told to read and follow `agents/{agent}.md`
   from the plugin, as **Sample artifacts** does, and pass it the same `model`. Never do an agent's work in the main thread, and never
   call the Atlas tools an agent owns to stand in for one. Only a session with no subagent tool
   at all may follow the agent's file itself, and says so in one line. It then has no one to give
   the English read or the UX review to, so it builds with `englishRead: {"status": "not-run", "why": "no subagent
   in this session"}` among the inputs and publishes in one pass (`skills/page-standard/SKILL.md`,
   section 4, step 4b).
2. **Say it started.** One line after the launch: which agent, what it is doing, and that the
   user can keep going, and the model when the table gave one, with how to change it
   ("Profile analyst is running in the background on Sonnet to save tokens. Say 'use Opus' to
   run it again on a bigger model. Ask for anything else meanwhile."). An agent on `inherit`
   names no model and offers no override. An override ("use Opus") applies to that launch
   only: launch again with the model named; the next launch goes back to the table. Then end
   the turn. Never wait on it, poll it, or sleep.
3. **Ask before, never during.** Every question, write confirmation, and picker the flow lists
   for the launch is asked first, in the main thread, because agents never ask: in one setup
   reply (**Orchestration contract** **2**) that repeats the question in its wording, names the
   reader, and gives the time estimate. Questions an agent raises come back in its result packet
   and are asked when it arrives. Write the launch's Runs row (**9** there).
4. **When it finishes.** Its result arrives as a task notification.
   - **First, the English read and the UX review.** When a `page-check` block says
     `"englishRead": {"status": "pending"}`, the page is a draft (`skills/page-standard/SKILL.md`,
     section 4, steps 4b and 4c). Relay nothing from it, ask nothing, and confirm nothing yet.
     Launch `atlas-quality-review` twice, at once (as in step 1, each with its own run id, `model`
     from **Model tiers**), with only `mode: grade`, `checks: english` for one and `checks: ux` for
     the other, `target` (the draft path), `reader` (the launch's reader, in words), `question`, and
     `run` as the builder's launch had it: never the brief, the ask, or anything from the builder's
     result (**Quality review**, the English read and the UX review). When both return, relaunch the
     builder with the same `launch` block, the same inputs, and four more: `englishRead` (the
     `english_read` block), `uxReview` (the `ux_review` block), `draft` (the path), and `packet`
     (the draft pass's `result-packet`). Act on that publish pass's result as below. Say nothing in
     between unless the person asks; in an unattended run, wait for each. A reviewer that returns no
     block counts as no fixes: relaunch with that entry set to `{"error": "{what came back}"}`. The
     builder reports `not-run` as a failing check, and in a scheduled run also in `gaps` and its
     delivery message; name it in the close-out like any check still failing.
   - **A page held by the UX review.** When the publish pass returns `"uxReview": {"status":
     "blocked"}`, the page was saved as a file, not published, because a Must is still open
     (`skills/page-standard/ux-review.md`). Name each open Must in one line and ask with
     `AskUserQuestion`: "Fix it first (Recommended)" or "Publish it as it is". Relaunch the publish
     pass with the person's words added to `uxReview` as `personFix`, or with `uxReview.publishOpen`
     set to `true`.
   - A page you build yourself (**Visual output**, a deck you export) gets the same read and review
     before you publish it, and you apply their Musts yourself.
   - Act on the `result-packet` block: relay the summary, the page link ("Saved as a file: {path}"
   for a file path), and the decisions it needs; confirm `proposals` by level (**Orchestration
   contract** **7**; a Read freshness refresh relaunches with `approved.refresh` set); ask its
   `questions`; log the return and every change after it (**9** there). After each `AskUserQuestion` that approves,
   edits, or rejects a proposal, send the feedback checkpoint (**Checkpoints**) with that
   proposal's `gate`; creator vetting and content review send it themselves when they asked
   their own feedback questions, so never send it twice. Then run the flow's next step (the `record`
   launch after a `propose` pass, which is another subagent). A result without a packet
   (other than a sample, a `mode: grade` run, or the agent's "Not started" line) is treated as
   having proposed nothing: carry out nothing from it and say so. Check the result
   before telling the user it is done, close out each page (**Orchestration contract** **10**) from
   its `page-check` block (`skills/page-standard/SKILL.md`), and tell the requester its `gaps`. To fix a check still
   failing, offer **Apply the fixes** (**Quality review**, Run step 5), with one fix per `fail`
   in `stillFailing` written as `{check}, page: make it pass ({reason})`; leave out `n/a` lines
   and a fail the user would have to fix (a connection to add). Never edit an agent's page here. Unattended runs relay the line and offer
   nothing; samples return no page check.
5. **Several at once.** Different agents, and a second run of the same agent for another brand,
   handle, or campaign, may run together, up to three for one request (**Orchestration contract**
   **8**); a fourth waits until one returns. Keep one decision log line per launch and return, and
   the audit trail blocks per run (**Decision audit**). When several results arrive close
   together, relay them one at a time, oldest first, and ask each one's questions in its own
   call. Two runs never write the same record: for the same profile and the same agent, say
   one is already running and ask whether to wait or run the other anyway.
6. **Unattended runs** (scheduled tasks) are already a session of their own: they launch the
   agent as a subagent and wait for it, since nothing else is happening there. They apply the
   table's model silently, never ask about it, and never set effort.
7. **Schedules.** Every scheduled task this skill creates runs `/aspire:aspire` (**Readouts**,
   Scheduling (main thread)). When an agent answers "Not started: run the aspire:aspire skill",
   run this skill with that request, in a scheduled run too.

An older agent name in a launch, message, or scheduled task resolves per **Older agent names**.

## Checkpoints

`report_checkpoint` records a run's progress and the person's verdicts for Atlas product
analytics. It changes no Atlas data: no confirmation, unattended runs too, and if it is absent or
refused, skip it silently. Send only ids, numbers, and the fixed words below; never names,
handles, or other text. After each `AskUserQuestion` that approves, edits, or rejects proposals,
call it with `kind: "feedback"`, the run's `runId` and `agent`, the `pass` the agent sent for the
pass that returned the proposals (its `pass` input such as `propose`, else the launch block's
`mode` with everything but its letters removed, or `single` for `run`), its `gate`,
`feedback: {"verdict": "approved"}` (or `edited`, `rejected`, `skipped`), and
`counts: {"proposed": n, "approved": k}`. This skill's own flows (onboarding, each setup
section, and **Product feedback**) are runs too, as `agent: "aspire"` with their own id minted the same way
(`aspire-20261029t140312-a3f9`; with no shell, send `started` without one and use the one it
returns): `kind: "checkpoint"` with `status` `started` when the flow starts and `finished` when
it ends, `pass` `onboarding` or `setup` (**Product feedback** sends `feedback`, with the gate
`approve-feedback`), no step numbers, and a feedback event at each of their
confirmations, with a `gate` named for what it approves (`approve-profile`,
`approve-calibrations`). Verdicts Editors give on the orchestrator's Next actions page send no
feedback event yet.

## Examples library

Off unless someone names a Claude Doc of approved examples for a brand profile; one "Examples"
confirmation writes `examples:library`, and the main thread fills the launch block's `examples`
from it before launching the agent that builds the page (`skills/page-standard/examples.md`,
**The examples library**). Never suggest one.

## Reading the ask (every request has two users)

The person typing is the **requester**. The person who acts on the output is the
**recipient**, often on another team. Before launching any agent, read who the output is for,
what they decide with it, and when, and pass that to the agent as `recipient`. Full rules, the
team catalog, and how agents render for a lens are in **Recipient lens**.

1. **Infer.** Match the ask's words against the catalog's cues, and take any reader, meeting,
   or date the user names ("for Thursday's product review"). Pick a primary lens and, when a
   hand-off applies (Performance then Creative; Campaign then Brand), a second one.
2. **Confirm in one line.** With a setup reply, the reader goes in its Heard question
   (**Orchestration contract** **2**). Otherwise one `AskUserQuestion`, header "For", with the
   flow's first question when there is one, worded as the guess ("This reads like it's for the
   product review. Should I track it weekly and add a messaging view for PMM?"). Options: the guess
   (Recommended), one or two other lenses from the cues, "Just for our team". Skip it when the user
   named the reader and the decision, this conversation already confirmed a lens for the same kind
   of ask, or the ask is a routine ("run the daily"). Never twice for one request, and never
   unattended (saved lenses or `team`).
3. **Route by lens** when the ask names no flow, per SKILL.md's **Routing by reader**.

4. **Pass it on.** Every agent launch below includes the persona and primary reader in its
   `launch` block (**Orchestration contract** **1** and **5**), and `recipient` (the confirmed lens or lenses,
   primary first). With a `leadership` primary lens, also pass `preparedBy`: the name the user
   gave for whoever sends the page on, or nothing (the page then says "{organization} team").
   Relay the agent's forward note as-is, so the requester can paste it to the reader.
5. **Keep the record.** From the first question of any flow that launches an Atlas agent, keep
   the running decision log and ask every agent for its audit trail block, per **Decision
   audit**.
6. **Run the coach on a weak ask.** When the ask maps to a flow and misses 2 or more of that
   flow's critical inputs, run **Prompt coach** before launching, without being asked and
   without the `polish` argument: no offer question first, the coach card and its gap questions
   are the first thing the user sees. Once per request; after "Run it now" or "Copy it and stop"
   the same ask is not coached again. Skip it, and run the flow, in an unattended run, for a
   routine ask ("run the daily"), when 0 or 1 inputs are missing, and when the user says to just
   run it.

## Decision audit (how a piece of work was decided)

Any Atlas agent's work can be audited: a page that records every step, question and answer, tool
call, judgement, and open decision behind it. The instructions live in the decision audit brief
(`SKILL.md` **Sections**, **Decision audit**); they are not a registered agent.

**While a flow runs (interactive sessions):**

- Keep `decision-log.md` in the session's scratch folder from the moment the request arrives in
  any flow that launches an Atlas agent, one line per step in the format in the reference, each
  starting with a UTC timestamp read from the shell clock (`date -u +%Y-%m-%dT%H:%M:%SZ`), never
  guessed: the request (`[start]`), every `AskUserQuestion` when asked and when answered, every
  tool call the main thread makes, every agent launch and return, every page published, every
  decision raised, and the finish (`[end]`).
- End every agent launch message with: "Finish with the audit trail block in
  `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/decision-audit.md`." Keep each block the
  agent returns; never show it to the user.

**The offer** goes in the quality review offer's call: **Offers** (**Decision audit**, The offer).

**Building it.** On a yes, launch a general-purpose subagent with: "Read and follow
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/decision-audit.md`.", then the inputs the
reference lists (`flow`, `brand`, `request`, the decision log path, every audit trail block in
order, the published pages, the run's scratch folder, the open decisions, and an earlier audit
page for the same work when updating). In a session without a subagent tool, follow the reference
yourself. Relay the page link and the gaps it reports. The audit writes nothing to Atlas and needs
no write confirmation. The audit page carries the mark and the footnote per
**Artifact standard**.

## Guardrails for launches

From SKILL.md's **Guardrails**:

- Every agent launch carries `recipient` (**Reading the ask**). A lens changes what is
  selected, the order, and the wording, never a number, and never adds a claim the data does
  not support. What a reader needs that Atlas does not hold (spend, conversions, usage rights)
  is named as a gap, never inferred.
- The market signal, quarterly signal, ad reuse, and launch pulse read only what Atlas holds.
  They never start discovery work, interactive or unattended.
- The quality review and the decision audit (offered per SKILL.md's **Offers**) read and report:
  neither edits the work, re-decides, re-runs, or writes to Atlas.
