# The UX review: rendered before it publishes

The English read checks every word; the UX review checks that the reader can act on the page, in
the right order, on the screen they will open it on (`quality-review.md`, **9.2**). A separate
reviewer renders the draft at 1280 by 800 in the light theme, at 390 wide in the dark theme, and
with no apps connected, presses every button, and returns Must, Should and Nice fixes against the UX
standard's rows. This is step 4c of `SKILL.md`, section 4. It shares the English read's two passes
(`english-read.md`): the main thread launches both reviewers on the same draft, and the builder's
publish pass applies both.

## Draft pass

As `english-read.md` says, with one more entry in the page check: `uxReview` set to `{"status":
"pending", "draft": "{path}"}`.

Before saving the draft, mark what the review reads:

- **The first task**: `data-first-task` on the one step or decision the reader does first. Without
  it the renderer takes the first decision, then the first next step.
- **App controls**: `data-app="{app}"` on every button or link that needs a connected app (Gmail,
  Slack, a store), and `data-app-missing="{app}"` on the one quiet line that replaces it when the
  app is not connected (`blocks.md`, **Apps never assumed**).

## Publish pass

Your launch carries `uxReview` (the reviewer's `ux_review` block) beside `englishRead`. After the
English read's fixes:

- Apply every Must. Apply each Should and Nice that fits your flow's rules.
- A fix that would break your flow's own rule (its fixed layout, where it keeps money) is not
  applied; say why in the entry below.
- Run step 4 again before step 5, as the English read asks.

**Open Musts block an interactive publish.** When a Must is still open after this pass:

- **Interactive run**: do not publish. Save the page as a file (`SKILL.md`, section 4, step 5),
  hold the Atlas writes and deliveries as the draft pass did, and return with `uxReview.status`
  `blocked`. The main thread names each open Must to the person and asks: "Fix it first" or
  "Publish it as it is". "Fix it first" relaunches this pass with the person's words in
  `uxReview.personFix`, applied like a Must. "Publish it as it is" relaunches it with
  `uxReview.publishOpen` `true`, and the pass publishes with the open Musts reported as below.
- **Scheduled run**: publish. Name each open Must in `gaps` and in `stillFailing` as "UX review
  {id} {row}: {problem}", and in one line of the delivery message ("One layout fix was not made:
  {problem}").

## What is reported

- **A review with no render** (`rendered: false`) is a review: its fixes are applied like any
  other, and the page check says so.
- **No review**: a sample page, and the quality review's own page, as for the English read. When the
  launch carries `englishRead` `not-run` because the session has no subagent tool, `uxReview` is
  `not-run` with the same reason.
- **A review that did not run** (`uxReview` is `not-run`, or carries the main thread's `error`
  because the reviewer returned no `ux_review` block) goes in `stillFailing` as "UX review not run:
  {why}", and in a scheduled run also in `gaps` and one line of the delivery message ("This page's
  layout was not reviewed: {why}").

## The `uxReview` entry in the page check

Every published page's `page-check` block (`SKILL.md`, section 7) carries it:

- `status` `pending` in the draft pass, with `draft` the file's path.
- `status` `ran` in the publish pass, with `rendered` (`true` or `false`), `renderer`, `views` (the
  views checked, from `desktop-light`, `phone-dark` and `no-apps`), `firstTask` (the depths in
  pixels the reviewer measured on the draft, or `null`), the reviewer's counts (`must`, `should`, `nice`), and one `musts`
  entry per Must saying whether it was applied (`{"id": "UX1", "applied": true}`; `"applied":
  false` adds `"why"`).
- `status` `blocked` when an interactive publish pass left a Must open; the page is a file, not
  published.
- `status` `not-run`, with `why`.

```json
"uxReview": {"status": "ran", "rendered": true, "renderer": "playwright",
             "views": ["desktop-light", "phone-dark", "no-apps"], "firstTask": {"phone": 1300, "desktop": 610},
             "must": 2, "should": 3, "nice": 1,
             "musts": [{"id": "UX1", "applied": true}, {"id": "UX2", "applied": true}]}
```
