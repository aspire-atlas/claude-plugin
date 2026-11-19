# Repeat run (follow up on the last run, not setup)

Loaded from **Repeat run** in `SKILL.md`. It is the main thread's part of a repeat run: the
setup reply's other form (**Orchestration contract**, **2**). A bold section name with no file
beside it is another part of this skill; `SKILL.md`'s **Sections** index names its file. Bold
numbers (**5**, **6**, **7**, **9**, **10**) are sections of the **Orchestration contract**.

Saved answers skip the setup. A repeat run follows up on the work: it opens with what was asked
last time, asks what has happened to the decisions and next steps that page left open, and
builds a page that leads with what changed.

## Contents

- [The last run](#the-last-run)
- [When a run is a repeat](#when-a-run-is-a-repeat)
- [The reply](#the-reply)
- [The answers go to the agent](#the-answers-go-to-the-agent)
- [Stopping and restarting the follow-up](#stopping-and-restarting-the-follow-up)
- [A scheduled run](#a-scheduled-run)
- [Keeping the record](#keeping-the-record)
- [A good repeat reply and a bad one](#a-good-repeat-reply-and-a-bad-one)

## The last run

The first source that holds one wins:

1. The last-run lines of the flow's `lastrun:` record (**Keeping the record**).
2. This session's own earlier run, when the record holds none: the newest `returned` Runs row
   (**9**) with a `page` whose `question`, `campaign`, and `subject` are this ask's. A row for
   the same agent with another code, campaign, program, handle, or post link is another
   question, never the last run. It lasts only as long as the session.

There is no last run, and so no repeat run, when the record's first line says `follow: off`,
or when the person stopped the follow-up earlier in this session
(**Stopping and restarting the follow-up**).

## When a run is a repeat

An interactive run is a repeat when the last run answered the same question: the same question
code (with no code, the same flow), the same campaign or program when the flow runs per
campaign or program, and the same subject when the question names one (a handle or a post
link). A different window is still the same question. A different question on the same flow is
not a repeat: it gets the ordinary setup reply, with the saved answers pre-filled as before.

## The reply

One message, in place of the setup reply: up to five plain lines, then one `AskUserQuestion`
call with the Since then question, plus Credits (and, for creator discovery, its run question)
when this run will spend.

1. **"Last time ({date}) you asked {question}."** This is the first line of the message. The
   date is the last run's, as "12 Nov". The question is the last run's `asked` line, in Atlas's
   words, never its code. When the last run was a teammate's (`by` is not this person), say
   "Last time (12 Nov) your team asked …".
2. **One sentence on how this run goes**, from the saved answers and what the ask changed: the
   reader, the scope, and the time estimate. "I will run it the same way: for the performance
   team, across Instagram and TikTok for the last 30 days, in about 15 minutes." Name each
   metric the page is judged on only when the person added one last time.
3. **The connection lines**, only for a connection still missing (**Orchestration contract**,
   **2**, **Before the questions**, 2).
4. **The approvals line** (**Before the questions**, 3). Its storyline row never applies: a
   repeat run asks no storyline question.
5. **The question**, header "Since then": "What has happened since on these?", then the open
   items, numbered, decisions first, each in one line with its owner and date ("1. Approve the
   11 creators (you, by 4 Nov)."), and one sentence saying what is kept: "I will keep your
   answer and the new page's open items for the next run." Leave that sentence out when the
   last run came from this session after the person chose to keep nothing (**Keeping the
   record**). Options, with the safe one first: an item left open is asked about again, and an
   item wrongly marked done is lost.
   - "All still open (Recommended)"
   - "All done"
   - "All dropped": none of them matters any more.
   - "Stop following up": nothing is carried over and the kept items are cleared.

   The free text field takes a mix ("1 and 3 are done, 2 is dropped") and any change to the
   reader or the scope. With more than six open items, list the six that come due first and say
   how many more the page will carry over.

Nothing the first run settled is asked again: no Heard, Scope, Save, Remember, or Storyline
question, and no question of the flow's own that the last run or a saved record answered. The
**Prompt coach** does not run on a repeat run, however short the ask: the last run already
holds what it would ask for. The answer to "Since then" confirms what line 2 said, as "Yes, run
it" does in Heard. What a repeat run still asks is what only this run can settle: the Credits
question, in the same call, when this run will spend, with creator discovery's run question
before it, since its answer sets whether the run spends (**Orchestration contract**, **2**,
**Discovery's count**); a flow question whose answer the last run
could not have held (a new list to vet), in the same call; and each approval the packet brings
afterward (**7**). A saved "save to Atlas" is not taken as this run's approval: the run
publishes the page only, and the close-out offers the save as a proposal (**10**).

**No open items.** When the last run's page left nothing open, the reply still opens with the
"Last time" line and asks one question, header "Since then", "Has anything changed that the new
page should take into account?", with the options "Nothing, run it again (Recommended)" and
"Stop following up", and the free text field.

## The answers go to the agent

The launch block's `since` (**5**) carries the last run's date and page, and every item with
the status the person gave it: `done`, `open`, or `dropped`. An item the answer did not cover
stays `open`. The words the person typed about an item go in its `note`. The run launches with
`storyline.pass` `state` (**Orchestration contract**, **2**, **The storyline**): the page leads
with what changed since the last run, then the items still open (**Page standard**, section 1).
Where the flow's section already leads with change from its own records (**Readouts**,
**Market signal**, **Program dashboard**), its rule stands and the `since` items join it.

## Stopping and restarting the follow-up

**Stop following up.** The run is launched with `since` `null`, as a first run with saved
answers would be. That answer confirms one write: supersede the record with its last-run lines
removed and `follow: off` added to its first line (with no record yet, add one whose first
line holds this run's answers and `follow: off`). "Never for {the flow}" at close-out writes
the same flag (**Keeping the record**).

**Starting again.** `follow: off` holds until the person asks to follow up again ("follow up on
this next time", "start tracking the next steps again"). In a run where they asked, the
close-out asks the "Follow up" question although the flag is set, and "Keep them" confirms one
write that removes `follow: off` from the first line and adds the last-run lines. Without that
ask, the flag is never removed and the question is never asked.

## A scheduled run

An unattended run has nobody to ask. It reads the last run from the record, launches with every
open item's status as `not confirmed`, and asks nothing. Its page carries them over under "Not
confirmed since {date}". It writes nothing to the record (**Orchestration contract**, **2**,
Saved answers), so the next interactive run still asks about the same items, and "Last time"
stays the last time a person asked.

## Keeping the record

At close-out (**10**), after an interactive run that published a page, the main thread writes
the last run to the flow's `lastrun:` record, as lines after the body's first line
(**Orchestration contract**, **2**, Saved answers):

```text
asked: {the question as the person asked it, in one line of at most 200 characters}
run: {question code or none}; subject: {handle, post link, or none}; by: usr-{id}; ran: {UTC date}
page: {the page's link}
item: {id} | {decision or step} | {what, at most 160 characters} | {owner} | {due date or none} | {open, done, dropped, or not confirmed} | {date first opened}
```

One `item:` line per entry of the packet's `openItems` (**6**) that is still `open` or `not
confirmed`, decisions first, then next steps in the page's order, twelve at most; a `|` inside
a field is written as a comma. Items the person marked done or dropped are left out: the page
has already said so. Never write an amount of money, a credential, an address, or a message
body in these lines; an item that needs one points to the page.

It is confirmed once per run, by the first of these that applies:

- **A repeat run:** the "Since then" answer, which names it. Every answer but "Stop following
  up" confirms it. When the last run came from this session and the person had chosen to keep
  nothing for it ("Just for me", "Just this run", or "Not this time"), the question does not
  name it and nothing is kept this time either.
- **The Remember question was asked this run** (Saved answers): "For everyone running {the
  flow}" confirms it, and its description adds "and keeps this page's open decisions and next
  steps, so the next run can follow up". "Just for me" and "Just this run" keep nothing, and
  the close-out does not ask again.
- **Otherwise**, unless the record's first line says `follow: off` and the person did not ask
  to follow up again: one question in the close-out's call, header "Follow up", "Keep this
  page's open decisions and next steps, so the next run of {the flow} can ask what happened?"
  Options: "Keep them (Recommended)", "Not this time", and "Never for {the flow}", which
  confirms one write of `follow: off` to the record's first line and is not asked again unless
  the person asks to follow up (**Stopping and restarting the follow-up**, Starting again).
  When the record holds another question's last run, the question says what it replaces ("This
  replaces the items kept from 12 Nov.").

**The write.** Read the record again right before writing: search for its key and take the
version that read returns. Never reuse the version read at routing, because Remember's "For
everyone" answer already wrote the first line before the launch, and a supersede with the older
version is refused. So that answer confirms two writes of the same record: the saved answers
before the launch, and the last-run lines at close-out. Then:

- With no record, `append_calibration` with the statement "{flow}: {reader}, {scope}, {save}"
  and the first line from this run's answers.
- Otherwise `supersede_calibration` with `ifVersion` set to the version just read, the last-run
  lines replaced whole, and the first line kept as it is, except that `follow: off` is removed
  when the person asked to follow up again.
- `key-exists` or a version conflict: read the record again and retry once.
- When Atlas refuses the record for its size, drop `item:` lines from the end until it is
  accepted and say in the close-out how many were not kept.

On a host that cannot publish, `page` is "none": a file's path means nothing to the next
session.

## A good repeat reply and a bad one

Good:

> Last time (12 Nov) you asked which creator posts to run as ads and how to cut them. I will
> run it the same way: for the performance team, across Instagram and TikTok for the last 30
> days, in about 15 minutes.
> This run asks you to approve nothing.

Then the one question: "What has happened since on these? 1. License the three unboxing videos
(you, by 19 Nov). 2. Send the cut list to creative (Dana, by 21 Nov). I will keep your answer
and the new page's open items for the next run." Bad:

> You asked which creator posts to run as ads. I will write this for the performance team, as
> saved for ad reuse. Is that right?

It confirms settings the person already confirmed, asks nothing about the licences and the cut
list the last page left with them, and the page that follows repeats last time's page with new
numbers.
