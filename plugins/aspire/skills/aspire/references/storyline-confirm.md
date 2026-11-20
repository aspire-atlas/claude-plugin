# The storyline (confirm a new page's argument before it is built)

Loaded from **The storyline** in `SKILL.md`, when a run will build a page it publishes for the
first time (**Orchestration contract**, **2**, **The storyline**, says when that is). It is the
main thread's side: the draft pass, the one Storyline question, what each answer does, the
minimum pool, and the examples. A bold section name with no file beside it is another part of
this skill; `SKILL.md`'s **Sections** index names its file. Bold numbers (**2**, **5**, **6**,
**9**) are sections of the **Orchestration contract**.

The setup reply confirms the question, the reader, and the scope. The storyline confirms the
page's argument: the three things the page will say, each with the size of the evidence behind
it (fewer only as **Fewer bullets** below allows). A wrong storyline wastes the build and every
review after it, so no new page is built until the person has confirmed one.

## Contents

- [How it runs](#how-it-runs)
- [The minimum pool, by kind of question](#the-minimum-pool-by-kind-of-question)
- [Fewer bullets](#fewer-bullets)
- [Unattended runs and repeat runs](#unattended-runs-and-repeat-runs)
- [A good storyline and a bad one](#a-good-storyline-and-a-bad-one)

## How it runs

1. **Draft.** Launch the agent with `storyline.pass` set to `draft` (**5**), after the setup
   reply. It reads, refreshes, and counts as it would for the build
   (`skills/page-standard/SKILL.md`, section 4, steps 0b to 2a), drafts the storyline, publishes
   nothing, and returns it in the packet's `storyline` (**6**). Log its return as a
   `storyline-drafted` Adjustments row, not a `returned` Runs row (**9**). What it spends counts
   against `approved.spend.cap` in the cap's unit, and its packet reports it in `cost.used`.
2. **Ask once.** One `AskUserQuestion` call, header "Storyline", with the bullets as the
   question, each with its evidence inside its sentence, then any line the packet's `storyline` carries for what was not checked ("Timecodes
   and on-screen claims are unverified.", "The plan names are not checked against the company's
   announcement."). Options: "Build (Recommended)", "Change", and, when the packet's `widen` is not
   `null`, "Widen", with `widen` in its words ("Widen to 26 weeks and TikTok"). When the pool is
   under the row's minimum (below), say so in the question ("Only 6 posts fit; the minimum is 10.",
   "3 of 20 creators have fewer than 5 posts.") and recommend Widen when it is offered; with no
   `widen`, Build stays recommended and the thin bullet says how few posts it rests on. The free
   text field takes the person's change. The same call carries the packet's other `questions` (page
   standard step 2a's metric check-in among them) and any flow question left for it (**2**), up to
   four in all. When they do not fit, a format question takes its default and the Storyline question
   states it ("Built as a one-page plan; say if you want slides."), and a send choice is asked after
   the build, with the page, as the readout's delivery confirmation is.
3. **Act on the answer.** Step 2a's answer comes first, whatever the Storyline answer was. When it
   is "Change the scope", "Refresh the posts first", or "Connect the account first" (once the account
   is connected), the counts behind the bullets no longer hold: no build launches, from Build or
   Change. Launch `draft` again, with the new scope, or with "Refresh: {the posts step 2a named}" in
   the launch message so the redraft refreshes them before it counts, carrying a Change's words as
   "Storyline change: {their words}", and ask again. Only with no check-in, or "Build with the gaps
   noted", does a Build or Change answer go on to the build:
   - **Build:** write the `storyline-confirmed` row (**9**), then launch again with
     `storyline.pass` `build` and the confirmed `bullets`, keeping the `runId` (**5**). The launch
     message carries every answer from the same call, step 2a's check-in as "Metric gaps: {the
     option chosen}", so the build never stops on it again, and the draft's `unchecked` lines as
     "Unchecked: {lines}". The build reads what the drafts refreshed from Atlas and never fetches it
     again.
   - **The spend cap across passes:** every redraft and the build get as `approved.spend.cap` what
     is left of the cap after the `cost.used` of every earlier pass of the same `runId`, never the
     whole cap again. With nothing left, the pass spends nothing in the cap's unit and reads what
     Atlas holds, and its packet says so in `storyline.unchecked`. With no cap (`null`), nothing is counted.
   - **Change:** apply the person's words to the bullets. When the change only rewords, reorders, or
     drops a bullet, log the row and build with the changed bullets as Build does, with the same
     launch-message lines; a dropped bullet is not replaced, and the page states the bullets left.
     When it needs evidence the draft did not read (a new angle, a new claim), launch `draft` again
     with the change in the launch message as "Storyline change: {their words}" and ask again.
   - **Widen:** launch `draft` again with the wider weeks and platforms in the launch block's
     `scope`, the packet's `widen` in the launch message as "Widen: {widen}" (more accounts or
     handles go there and in the flow's own handle inputs), and ask again.
   Each extra round is an Adjustments row (**9**); it never repeats the setup reply.

## The minimum pool, by kind of question

The kinds are section 8's rows of
`skills/page-standard/SKILL.md`, except that a question about one named post (O5, P2) takes its own
row. A pool under its minimum is offered a wider scope in the same question: more weeks, more
platforms, or more accounts, whichever the run has room for.

| Kind of question | Minimum posts that fit the question |
| ---------------- | ----------------------------------- |
| What landed and why | 10 in the window, across the accounts in scope |
| Competitive read | 10 per brand compared |
| Creator picks or vetting | 5 per creator over the flow's window |
| Ads and cut-downs | 5 videos |
| Program tracking | None: the posts owed are the pool, and a thin one is the finding |
| Affiliate sales | None: the period's sales are the pool, and the affiliate flow says in place of a chart when orders or posts are too few |
| One named post (O5, P2) | None: the post is the question; its bullets rest on it and the posts it is compared against, and say so |

For a row counted per brand or per creator, the pool is under its minimum when half or more of them
are, and the packet's `pool.under` names each one under it; a bullet that rests on one of them says
so. Except on a one-post question, each bullet rests on at least 3 posts, or says how few it rests
on ("from only two posts").

## Fewer bullets

A storyline has three bullets. It has fewer only when the person's Change
dropped one, or when a readout's window has no posts: then it has one to three, the empty-window
bullet and up to two the window still supports (**Readouts**, **Scheduled (unattended) runs**,
Storyline). Never make one up to reach three: the packet, the
answer block, and every delivery message carry the bullets there are.

## Unattended runs and repeat runs

Unattended runs and repeat runs never ask. They launch with `storyline.pass` `state`: the agent
drafts the storyline and builds in the same pass. The page opens with it in the answer block, its
bullets with their evidence under the headline, and every delivery message (Slack, email,
the chat summary) carries the same bullets. A pool under its minimum still builds, and the
page says so in the bullet it weakens.

## A good storyline and a bad one

Good, from an approved holiday creator plan for a children's
audio brand, its final "Why this plan":

> - Gift and routine posts beat creators' usual views this fall, and screen-free posts did best:
>   gift and deal posts 1.27 times the usual across 78 creator posts; screen-free 5.37 times, from
>   only 5 posts.
> - Black Friday is crowded; gift guides are still growing: the brand's best holiday posts last
>   year were a stocking list at 13 times the usual and a gift guide at 4.2 times, from 14 posts.
> - The main competitor won the head-to-head comparisons, but not with deals: its Black Friday code
>   post reached 0.67 times its creator's usual views, 1 post.

Each bullet is a claim a reader can act on, with how many posts it rests on, and the thin one says
it is thin. Bad, a storyline sent with no evidence and no checks:

> - Lean into Black Friday with a big discount push.
> - Creators love the new player.
> - The competitor is winning on price.

None says how many posts it rests on; the first is the opposite of what the posts show; the
second rests on a product name nobody checked against the company's announcement; the third has
no post behind it.
