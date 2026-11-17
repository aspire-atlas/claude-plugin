# English rules (every page and every chat message)

One table for everything a person reads from Atlas. The English read marks a page against it before
the page publishes (**Quality review**, **9.1**), and the main thread checks its own chat messages
against it before it sends them (**In chat** below). A page and the chat that leads to it are held
to the same wording, so a rule changed here changes both.

## The rules

They apply to every line. Text that is someone else's words (a caption, a creator's name, the
person's own message quoted back) is never fixed. Handles, hashtags, links, and emails stay as
written.

| # | Check | Fails on |
| - | ----- | -------- |
| 1 | Full sentences | Body text that is not a sentence. A heading, a label, or an option to pick may be a short phrase, but one a reader can parse, never a stack of nouns ("Gift and routine framing lifts posts") |
| 2 | One tense per section | A section, or one chat message, that moves between past and present for the same events |
| 3 | No arrows, "vs", or shorthand | →, ->, "vs", "vs.", "w/", "&" for "and", "/" for "or", a bare multiplier ("ran at 1.27×") that does not say what it is compared with, and clipped notes ("Top post: unboxing, 2.4x, Tue") |
| 4 | One idea per sentence | A sentence that carries two claims, or a claim and its caveat |
| 5 | Every term explained on first use | A term a reader in this role would not use themselves (hook rate, engagement per 1,000 views, CPM, whitelisting) with no plain explanation where it first appears |
| 6 | Every number in a label matches what it labels | "Top 5" over four rows, "3 creators to contact" beside two, a percent sign on a count, a total that is not the sum shown under it |
| 7 | Nothing in Atlas's own report words | The report labels R11 bans (**Reader standard**), "picks" or "reads" used as a section or list name where R11 lets them pass, and any other wording that only makes sense inside Atlas's own reports: a question pasted in Atlas's shorthand, a section named for the agent that made it, a question code ("I2"), a check id ("R3", "EN2"), or a flow's question id ("R4", "D4") |
| 8 | Every comparison is like for like | A comparison or a share that does not pass the four checks in **Page standard**, `comparisons.md`, as far as the words show: two sides with no word on what kind of posts each holds (paid label, TikTok Shop selling, or no paid label); a figure that rests on 20 posts or fewer with no "directional" and post count beside it; a share ("87% of revenue") with no size of its group beside it ("from 88% of affiliates"); a share within 5 points of its group's size written up as a finding. Good: "TikTok Shop posts drew 3.6 engagements per 1,000 views (18 posts, directional), against 14.7 across the 212 posts with no paid label." Bad: "{brand} drew 6.1 engagements per 1,000 views, behind {competitor} at 9.8." The mark "(18 posts, directional)" and the one line that says which check a comparison fails are required wording: never remove either under rule 3 or rule 4. "Directional" is explained once, where the page first uses it (rule 5) |

## In chat

The main thread applies the table itself, before sending, to the three messages every run sends:

1. **The setup reply** (**Orchestration contract**, **2**): each question's text, its option labels,
   and their descriptions.
2. **The storyline check-in** (**Orchestration contract**, **2**, **The storyline**): the question,
   every bullet with its evidence, the lines for what was not checked, and the option labels.
3. **The close-out** (**Orchestration contract**, **10**), and the chat reply it belongs to.

A page gets a separate reviewer because a builder cannot see its own page. A chat message gets a
self-check instead: a reviewer per message would add a round trip to every turn. So read the
message once as the person will, line by line against the table, fix what fails, and then send it.
Never mention the check.

What the table means in chat:

- **Rule 1.** A question is a full sentence, and so is each storyline bullet and each sentence of
  the close-out. The evidence behind a bullet goes inside its sentence ("across 78 posts from 15
  accounts"), not after it as a note ("78 posts, 15 accounts."). An option label and a header are
  short phrases.
- **Rule 3.** In Atlas's own sentences, write "compared with" or "against", never "vs". When the
  person's question used "vs", either say it again in Atlas's words ("how you compare with your
  biggest competitors") or quote their words exactly, inside quotation marks, which the table
  leaves as written. An echo without quotation marks is Atlas's sentence, and the rule applies.
- **Rule 5.** The first message a person reads is the setup reply, so a term explained later on
  the page is still unexplained here.
- **Rule 7.** Say the question in its own words. Its code, a check's id, and a flow's question id
  belong in the launch block, the result packet, and the run log (**Orchestration contract**, **5**,
  **6**, **9**), and never reach the person. Name a check by what it means for the reader ("the
  answer now comes first"), not by its id or its name in the standard.
- **Rule 8.** A storyline bullet or a close-out point that compares names the kind of posts and
  the post count on each side, and a share comes with its group's size, in the same sentence.

A storyline bullet arrives from the agent's packet and a close-out names what the packet reports.
Reword either to pass the table, keeping every number, name, and claim, and adding none. The
confirmed bullets go to the build exactly as the person saw them.

These two examples are the only copy; other files point here.

Good, a setup question: "You asked whether to work with @handle and what it would cost. I will
write the answer for you, and it should take about 15 minutes. Is that right?"

Bad, the same question as it used to be sent: "I heard I2: should we work with @handle, and what
would it cost? For you, about 15 minutes. Right?" It has a question code and two fragments, and
"For you" does not say what is for them.

Delivery messages from an unattended run (Slack, email) are worded from the published page, which
had its English read, and follow the same table.
