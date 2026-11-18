# Follow-up: a page that repeats a question leads with what changed

Section 1 of `SKILL.md` points here. The main thread's side (when a run is a repeat, the one
question it asks, and the record it keeps) is in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/repeat-run.md`.

The launch block's `since` (`orchestration.md`, **5**) is the last run of the same question: the
date it ran, its page, and each decision and next step that page left open, with the status the
person gave it. When `since` is `null` or absent, the page is a first run: nothing below changes
it, and its result still lists its `openItems` as `SKILL.md`, section 1, says for every run.

## What the page does with it

1. **Lead with what changed.** The answer block (part 2) is about the change since `since.ran`.
   The headline is still the conclusion, written from the decision, and it says what moved
   ("Saves are up by half since 12 Nov. Keep the gift posts and drop the deal posts."). Under it,
   before the first insight, a short "Since {date}" list:
   - what moved in the figures the last page led with, each against its figure then, read from
     the last page when its link opens, and from Atlas otherwise. A figure that cannot be read
     again is left out, never estimated;
   - each `since` item, in one line, with its status: "Done", "Still open", "Dropped", or "Not
     confirmed". Use the person's `note` when it has one. A done step says what it changed when
     the data shows it, and says that it does not when it does not.
   Link the last page once, as "the {date} page", when `since.page` is a link.
2. **Then the items carried over.** Every item that is `open` or `not confirmed` goes back into
   the part it came from, ahead of this run's new items: a decision in part 5, a next step in
   part 4. Keep its wording, owner, and due date, and add "open since {its `opened` date}". A due
   date that has passed says so ("was due 4 Nov"). A `not confirmed` item sits under "Not
   confirmed since {date}": nobody was asked, so never show it as done or as dropped.
3. **Drop what is done or dropped** from parts 4 and 5. It appears once, in the "Since {date}"
   list, and nowhere else.
4. **Do not repeat the last page.** An insight that says what the last page said, with nothing
   new behind it, is one line in the "Since {date}" list ("Still true: screen-free posts lead."),
   not an insight. The up to three insights are what is new or what moved.
5. **When nothing changed, say so.** "Nothing has moved since 12 Nov: the two steps are still
   open and the figures are within a tenth of last time's." is a complete lead.

Where the flow's reference already leads with change from its own records (a readout's action
items, the market signal's tracking, the program dashboard's snapshot), follow the reference and
add the `since` items to it. Never show the same item twice.

## What a repeat run adds to the result

`SKILL.md`, section 1, sets what `openItems` lists on every run. On a repeat run, a carried item
keeps its `id` and its `opened` date, and a new one takes the next free id and today's date.
Include each `since` item the page reports as `done` or `dropped`, with that status, so the main
thread can tell a finished item from one the page lost.

## Checks

- R3 passes only when the headline is a conclusion: "What changed since 12 Nov" is a topic title
  and fails.
- R5 and R6 hold for carried items as for new ones: each keeps its owner and date, and decisions
  stay apart from next steps.
- A page shared outside the team (`artifact-standard.md`, section 2) still leads with what
  changed in the results, as a conclusion. It leaves out the "Since {date}" list, the last
  page's figures, the link to the last page, and every item whose owner is on the team that
  prepared it: a client version carries no revision history (`SKILL.md`, section 2). An item the
  client owns stays in part 5 or part 4 with "open since {date}".
