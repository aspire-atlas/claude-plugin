# The English read: two passes around the reviewer

A builder cannot see its own mistakes, so before a page publishes someone who did not build it reads
every word on it (`quality-review.md`, **9.1**). Agents never launch agents, so the main thread
runs the read between two passes of the builder's run (**Running agents**, step 4), on every page,
interactive or scheduled. This is step 4b of `SKILL.md`, section 4, and it holds over a flow
reference that publishes or delivers earlier in its steps.

## Draft pass

Your launch carries no `englishRead` input. After step 4, save the page as a full HTML file, as
step 5 describes for a session with no Artifact tool, named `{page name}.draft.html`.

- Publish nothing, deliver nothing (no Slack, no email), and send no `published` checkpoint.
- Hold every Atlas write whose words or numbers come from the page (findings, insights, summaries,
  snapshots) until the publish pass, so what is saved matches what publishes. A write that records
  a decision the person already made (a `record` pass) runs as your flow says.
- Everything else in the pass runs as your flow says.
- Return as usual, with the packet's `page` set to the draft file's absolute path, the held writes
  listed in its `summary`, and the page check's `englishRead` set to `{"status": "pending",
  "draft": "{path}"}`. The main thread acts on none of the packet until the publish pass returns.

## Publish pass

Your launch carries `englishRead` (the reviewer's `english_read` block), the `draft` path, and the
draft pass's result `packet`. Start from the draft file.

- Do not rebuild the page, and make no Atlas read the draft pass already made. Read only the draft,
  the fixes, the packet, and the parts of your flow's reference that set its held writes and
  deliveries.
- Apply every Must: paste its `replace`, or, when `replace` is `null`, check the fact `why` names
  against the draft and the packet and fix the line. Apply each Should and Nice that fits your
  flow's rules.
- Run step 4 again, then step 5, then the held writes and your flow's deliveries, worded from the
  published page.
- Return the draft pass's packet with `page` set to the published link, `selfCheck` brought up to
  date, and every `findings` and `proposals` line that quotes the page reworded to match it.
- Send this pass's `report_checkpoint` calls with `pass` `publish`, never the draft pass's value,
  so the two passes count as two.

## What is reported

- **A Must you cannot apply** (it breaks your flow's own rule, or the fact cannot be checked) stays
  on the page. Report it in the page check's `englishRead` with `applied: false` and the reason,
  and in `stillFailing` as "English read EN2: {why}". In a scheduled run it also goes in `gaps`,
  and the delivery message names it in one line ("One wording fix was not applied: {why}").
- **No read**: a sample page, and the quality review's own page. A builder never decides on its own
  that the read cannot run: running in a subagent with no Agent tool is the normal draft pass.
  Publish in one pass only when your launch carries `englishRead` with `"status": "not-run"`, which
  the main thread sets when it follows your file itself because the session has no subagent tool
  (**Running agents**, step 1), and report that `englishRead` as given.
- **A read that did not run** (`englishRead` is `not-run`, or carries the main thread's `error`
  because the reviewer returned no fixes) is reported like an unapplied Must: in `stillFailing` as
  "English read not run: {why}", and in a scheduled run also in `gaps` and in one line of the
  delivery message ("This report was not proofread: {why}"), so a broken reviewer never turns the
  read off unseen.

## The `englishRead` entry in the page check

Every published page's `page-check` block (`SKILL.md`, section 7) carries it:

- `status` `pending` in the draft pass, with `draft` the file's path.
- `status` `ran` in the publish pass, with the reviewer's count of Must, Should, and Nice fixes
  (`must`, `should`, `nice`) and one `musts` entry per Must saying whether it was applied
  (`{"id": "EN1", "applied": true}`; `"applied": false` adds `"why"`).
- `status` `not-run`, with `why`.
