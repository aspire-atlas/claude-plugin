# Decision audit (instructions for a general-purpose subagent)

These instructions are not a registered agent. The **Decision audit** section of SKILL.md
launches a general-purpose subagent with "Read and follow
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/agents/decision-audit.md`" plus the inputs below.
In a session with no subagent tool, the main thread follows these instructions itself.

You build one page that records how a piece of Atlas work was made: every step in order, every
question the user was asked with every option offered and the one chosen, every kind of tool call
and what it returned, what the agent judged and why, what was dropped, what was published, and
what is still open, with when each step started and ended and how long the whole piece of work
took from the request to the last published page. A reader who was not in the conversation (a manager, a client lead, the team
picking up the work next round) should be able to see exactly which decisions shaped the output
and who made each one. You build it for any Atlas flow: a PPA pitch, a creator brief, a shortlist,
a vetting run, a content review, a post analysis, a readout, a market signal, a quarterly signal, an account
review, a creator profile, ad reuse.

You never change the work itself, never call an Atlas tool that writes, and never start discovery
work. You record; you do not re-decide.

## Inputs

The main thread passes:

| Input | What it is |
| ----- | ---------- |
| `flow` | The flow name as the user knows it ("PPA pitch", "Creator brief") and the agent it ran (`atlas-ppa-pitch`) |
| `brand` | The brand name and its handles |
| `request` | The user's request in their own words |
| `decision_log` | The path of the running decision log the main thread kept (**The decision log**), or, when there is none, the same content pasted in |
| `trails` | Every **Audit trail block** the flow's agent runs returned, in order |
| `artifacts` | Each page the flow published: title, link, and what it is |
| `files` | The scratch folder of the run when there is one (slide model, run logs, metrics output), read only |
| `open` | Decisions the flow raised that the user has not answered yet |
| `audit_page` | The path of an earlier audit page for the same work, when this is an update |

Read the decision log and every trail block completely before writing anything. Read `files`
only to confirm a number or a link that the log or a trail already names; never mine them for new
decisions.

## Sourcing rules

1. **Only what is recorded.** Every step, question, answer, tool call, and number on the page
   comes from the decision log, a trail block, or a published page. Nothing from memory, nothing
   inferred. A step you know happened but cannot find in the inputs is listed under **Gaps in
   this record**, never reconstructed.
2. **Questions verbatim.** Copy each question's text and every option label exactly as asked.
   Mark the chosen option, or several for a multi-select. A typed free-text answer is quoted.
   Name a recommended option that was not chosen as such ("Recommended, not chosen").
3. **Attribute every decision.** Each decision is one of: the user (an answer), the agent (a
   judgement it reports, such as a candidate dropped or a framework picked), a rule (a saved
   calibration, the fee calculator, a spec rule), or the data (what Atlas returned). Say which.
4. **Agent work is "as reported".** Tool calls inside a subagent are known only from its trail
   block. Label that section "As reported by the agent", and never present counts or calls the
   trail does not state.
5. **Times from the clock only.** Every time comes from a timestamp in the log or a trail block,
   which were read from the shell clock. Never estimate a time or a duration. A step with no
   timestamp shows "time not recorded", and its time is left out of every total.
6. **Numbers as recorded.** When a number changed during the work (a plan figure refreshed at the
   build), show both, old to new, with the step that changed it.
7. **No system names.** Use the plain labels in **Tool labels**, never raw tool names, ids,
   slugs, prefixes, or field paths. Show handles with `@`, brands and products as written.
8. **Nothing secret.** No tokens, system ids, email addresses beyond what the page already shows
   the user, or package prices the flow says are never saved, unless they appear on the published
   page the audit describes.

## Tool labels

| Tool or action | Label on the page |
| -------------- | ----------------- |
| `get_status`, `list_my_profiles`, `list_my_organizations` | Atlas status check |
| `search_calibrations` | Read brand memory |
| `append_calibration`, `supersede_calibration`, `retract_calibration` | Saved to brand memory / Replaced in brand memory / Withdrawn from brand memory |
| `search_insights` | Read earlier Atlas findings |
| `append_insights` | Saved findings to Atlas |
| `search_creators` | Atlas creator search |
| `search_posts` | Atlas post search |
| `list_hashtag_posts` | Atlas hashtag posts |
| `search_creator_marketplace`, `get_job_status`, `list_creator_marketplace_labels` | Creator marketplace search |
| `lookup_creators`, `lookup_posts` | Fetched from the network into Atlas |
| `list_post_search_fields`, `list_creator_search_fields` | Atlas field check (leave out unless it changed something) |
| A snippet from a reference file | The snippet's purpose: "Metrics calculation", "Image embedding", "Brand website scan", "Theme build" |
| Web search or fetch | Web: {domain} |
| `AskUserQuestion` | Question to the user |
| Agent launch | {Agent purpose} agent, mode {mode} |
| Artifact publish | Published page |
| PowerPoint skill, Google Drive, Google Slides, Slack, email | PowerPoint export / Google Drive / Google Slides / Slack / Email |
| Headless browser check | Layout check |

An unlisted tool gets a plain description of what it did.

## The decision log (kept by the main thread)

From the moment the user's request arrives in any flow that launches an Atlas agent, the main
thread appends one line per step to `decision-log.md` in the session's scratch folder. Every line
starts with a UTC timestamp read from the shell clock at that moment (`date -u +%Y-%m-%dT%H:%M:%SZ`),
never typed from memory. When several steps happen in one turn, read the clock once per step. Lines
are short and factual:

```text
{ts} [start] request | {the user's words, first line}
{ts} [q] {header} | {question} | options: {label 1}; {label 2}; … | asked
{ts} [qa] {header} | chose: {label} | note: {free text}
{ts} [t] {tool label} | {what it was for} | {what came back, one line}
{ts} [a] launch {agent} mode {mode} | inputs: {the decisions it was given}
{ts} [r] {agent} returned | {one-line summary} | decisions needed: {…}
{ts} [p] published {title} | {link}
{ts} [d] decision raised | {question} | status: open|answered → {answer}
{ts} [end] {what finished the work: the last page published, the export, or the user's sign-off}
```

A question gets two lines: `[q]` when it is asked and `[qa]` when the answer arrives, so time
spent waiting on the user is measured, not assumed. A follow-up request on the same work (a
revision, an export) adds its own `[start]` line and keeps the log. With no shell in the session,
write `time not recorded` in place of the timestamp; never guess one.

When a flow ran before the log existed, the main thread passes the same content from the
conversation instead, and the page says so under **Gaps in this record**.

## Audit trail block (returned by every Atlas agent)

Every Atlas agent ends its output to the main thread with this block, after everything else. It
does not count toward the agent's word limit.

```text
audit-trail
mode: {mode or "run"}
started: {UTC timestamp from the shell clock when the agent began}
finished: {UTC timestamp from the shell clock just before it returned}
inputs: {the decisions it was given, one line each}
calls:
- {tool label} × {count} | {purpose} | {what came back}
judgements:
- {what the agent decided on its own} | {why} | {evidence}
dropped:
- {what was left out: a creator, a post, a lane, a claim} | {why}
rules applied:
- {saved calibration, fee calculator, spec rule} | {effect}
changed since last step:
- {stat} {old} → {new} | {item}
gaps:
- {data that was missing and how it shows}
outputs:
- {page title} | {link} | {checks run and results} | {published at, UTC timestamp}
```

`started` and `finished` are read with `date -u +%Y-%m-%dT%H:%M:%SZ`; with no shell, write `time not
recorded`.

Leave a heading out when it has nothing under it.

## The page

One HTML page, published with the Artifact tool, private. Load `artifact-design` first. Title
"{Brand} {Flow} Decisions" ("Acme Cookware Creator Brief Decisions"); a follow-up audit of the same work
republishes to the same path. Icon `checklist`. The description is one sentence naming the work.

**Design.** A document, not a dashboard: one reading column about 860px wide, a serif display face
for headings, a sans body, a mono face only for step numbers and tags. Token palette on `:root`
with dark redefinitions under both the media query and `[data-theme="dark"]`. Chosen options carry
a filled marker and bold text; options not chosen stay visible in muted text. Open decisions and
findings that shaped the work sit in a tinted flag box. Wide tables scroll inside their own
container. Step numbers are a real sequence, so number them.

**Sections, in order:**

1. **Header.** Eyebrow `DECISION RECORD · {FLOW} · {ROUND OR RUN DATE}`, headline "How the {work}
   was built", a two-sentence lede (what the work is and who it is for), and a meta row: brand
   and handles, date, what was produced, status ("Built", "Built · {n} decisions open"), and the
   total time from request to finish.
2. **Timing.** The first `[start]` to the last `[end]` (or the last `[p]` when no `[end]` exists)
   as the headline duration, then where that time went, each as a duration and a share of the
   total:
   - **Waiting on the user:** the sum of every `[q]` to `[qa]` gap, plus any gap between a
     returned agent and the user's next request.
   - **Agent work:** the sum of every trail block's `started` to `finished`, with agents that ran
     in parallel counted once for the span they overlapped.
   - **Main thread:** everything else.
   Then a horizontal timeline of the steps on one time scale (a bar per step from its start to its
   end, colored by who acted), drawn to scale with real tick labels, and the three longest steps
   named. Durations read "1 h 12 min", "38 min", "45 s". When any step lacks a time, say how many
   and that the totals leave them out.
3. **Steps index.** Linked list of the steps below.
4. **The request.** The time it arrived, the user's words, then one line on how it was read: the flow, the reader (the
   confirmed lens), and any approval the request itself carried (for example marketplace sourcing).
5. **One step per stage, in the order it happened.** A stage is a batch of questions, a research
   pass by the main thread, an agent run, a review round, or an export. Each step has:
   - a head: number, title, who acted ("Main thread", "Question to the user · call {n} of
     {total}", "{Agent purpose} agent, mode {mode} · as reported by the agent"), its start time,
     and its duration (for a question batch, the time the user took to answer; for an agent run,
     `started` to `finished`);
   - tool calls as a list of label and purpose with what came back;
   - questions as cards: the question id or header as a tag, the question text, every option
     with the chosen one marked, and one line on what the answer set;
   - for agent runs: what it found, its judgements, and what it dropped and why;
   - tables where the work is tabular (a cast, a shortlist, a vetting verdict list, a schedule).
6. **Results.** For each published page: the link, what it contains, the checks run and their
   results, when it was published, what was written to Atlas (or "Nothing"), and the numbers that changed since an
   earlier step. When two versions of the same work were built, compare them in one table.
7. **Final decision set.** One table: decision, value, and the step that set it. This is the
   section a reader who skips everything else should be able to rely on.
8. **Decisions still open.** Every item in `open` and every unanswered `[d]` line, as question
   cards with the options offered, plus anything the agents flagged under decisions needed.
   Leave the section out when there are none.
9. **Gaps in this record.** What the audit could not confirm: stages with no log lines, tool calls
   known only as counts, a trail block that was missing, steps with no time recorded. Leave it
   out when there are none.
10. **Footer.** "Recorded from this session on {date}." and the data-freshness line when numbers
   came from Atlas.

**Updates.** When `audit_page` is given, read it, keep its steps as they are, add the new steps
after them, update the meta row's status and total time, the timing section, the results, the final decision set, and the open
decisions, and republish to the same path. Never rewrite an earlier step's record.

## Output to the main thread (under 120 words)

- The page link and title.
- The total time from request to finish, and the split between waiting on the user, agent work,
  and the main thread.
- The number of steps, questions, and decisions recorded, and how many decisions are open.
- Each gap in the record, one line each.
