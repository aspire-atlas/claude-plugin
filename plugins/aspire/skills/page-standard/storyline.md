# Storyline: what each pass does, and how to draft it

Step 0b of the build loop in `SKILL.md` (section 4) points here. The main thread's side, the
storyline question and its answers, the minimum pool, and the good and bad examples, are in
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/orchestration.md`, **2**, **The storyline**.
Steps 1, 2, and 2a below are the build loop's steps in `SKILL.md`, section 4.

The launch block's `storyline.pass`
(`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/orchestration.md`, **5**) says what to do with the
page's argument before it is built (**2**, **The storyline**, there):
- `draft`: run `SKILL.md` section 4, steps 1, 2, and 2a, then draft the storyline below, publish
  nothing, and return it in the packet's `storyline`, with its `pass` `draft` and `page` `null`
  (**6** there). Put step 2a's check-in, when it has one, in `questions`; the main thread asks both
  in one call. Never ask yourself, even when your flow asks its own questions: the storyline goes to
  the main thread. A "Storyline change:" line in the launch message is the person's change: draft to
  it, reading what it needs. A "Widen:" line names the wider scope to read, with any accounts or
  handles it adds. A "Refresh:" line names the posts to refresh before step 2a counts, inside the
  launch's `spend.cap`.
- `build`: the person confirmed the `bullets`. The page's insights (part 3) are those bullets, in
  their order and wording, each with its evidence, comparison, and "So:" line; the headline is
  written from them. An "Unchecked:" line in the launch message lists the checks the draft could not
  make: put them in the page's method and in the packet's `storyline.unchecked`. A "Metric gaps:"
  line in the launch message is step 2a's check-in already answered ("Build with the gaps noted"):
  build with the gaps noted, refresh nothing for it, and do not stop at step 2a again. When the data
  no longer supports a bullet, build it with what the data shows and say so in the page check's
  `gaps`; never swap in a storyline the person did not confirm. Fewer than three bullets mean the
  person dropped some: never add one back. Atlas already holds what the draft refreshed, so step 2
  reads it without `forceRefresh` and fetches only what the draft did not, inside the launch's
  `spend.cap`. The draft's frame scans and fact checks stand for the videos and facts it checked.
  When the build's data puts a different most-viewed video behind a bullet, or a bullet comes to
  rest on a fact the draft did not check, run drafting step 3 or 4 on it, and the method says what
  was checked and what was not.
- `state`: draft the storyline below and build in the same pass. The page's insights (part 3) are
  those bullets, in order, each with its comparison and "So:" line; the answer block (part 2) states
  them short under the headline, each with its evidence; and the delivery message (Slack, email, the
  chat summary) carries the same bullets.
- `none`, or no `storyline` in an interactive launch: build as the flow says.

To draft it:
1. **Count the posts that fit the question:** the posts step 2a counts, and how many accounts
   they come from. Compare the count with the row's minimum (`orchestration.md`, **2**, **The
   minimum pool**; none for a question about one named post). Name the wider scope you would read
   next in `widen` (more weeks, more platforms, or more accounts, whichever the launch's `scope`
   leaves room for), or `null` when it has no room left; under the minimum, the main thread
   recommends it.
2. **Write three short bullets** (fewer only per `orchestration.md`, **2**, **Fewer bullets**),
   each a claim the reader can act on, with the posts, accounts,
   and views behind it. Except on a one-post question, a bullet on fewer than 3 posts says how
   few ("from only two posts"). The good and bad examples are in `orchestration.md`, **2**.
3. **Watch the most-viewed video behind each bullet.** With a shell, `ffmpeg`, and the post's
   media from the Atlas read tools, run the 1-second frame scan (`SKILL.md`, section 3; `quality-review.md`,
   4.15) on that video, and check every timecode and on-screen claim the bullet rests on.
   Without them, add "Timecodes and on-screen claims are unverified." to `unchecked`, and the
   page's method says the same.
4. **Check every product fact the story rests on** (a plan, a product name, a launch, a
   price) against the company's own announcement, with a web search or fetch tool. A fact the
   announcement contradicts changes the bullet. Without web access, add "{fact} is not
   checked against the company's announcement." to `unchecked`, and the page's method says the
   same.
