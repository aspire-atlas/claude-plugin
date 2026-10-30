# Approved examples, by question

Aspire's reviewers mark a page Pass and approve it as an example of how to answer one question.
A question aims for two or three examples, each for a different brand: a new example that answers
the question another way teaches more than one that looks like an existing one. This file lists
the question codes that have an approved example and the evidence those examples set. The
examples themselves are customer pages, so this file holds no brand names and no links.

Before you build a page, find the launch block's `question` here (`orchestration.md`, **3** and
**5**). When it has a row:

1. **Read every example the launch block's `examples` lists,** each in full: a Claude artifact
   with the Artifact tool's `read` action, a Claude Doc with the docs connector's `read`. When the
   read saves the page to a file, remove its `data:` URIs from that file before you open it, then
   read its sections and evidence, not its images. When the read returns only a summary (an
   artifact you cannot edit), work from the summary and add "Example read as a summary: {why}" to
   the audit trail's data gaps. One that cannot be read at all (no access, or the link fails) goes
   in the data gaps as "Example not read: {reason}"; read the rest and go on.
2. **List the evidence elements to match:** the ones below for the code, plus any element that two
   or more of the examples you read carry and the list leaves out. An element only one example
   has is one good answer, not a rule. Your page must carry each element on the list, or say in
   one line why this run could not.

Match the evidence, never the sections, the layout, or the wording: a new brand and a new reader
get their own page. Never name another customer's example on a page. With `examples` empty, the
list below is the evidence to match. A code with no row has no approved example yet: build from
the skeleton and the blocks alone.

<!-- examples -->
| Code | Kind of page | Reader | Built by flow |
| ---- | ------------ | ------ | ------------- |
| I1 | Shortlist | The influencer manager | Creator vetting, on a pool from creator discovery |
| O3 | Readout, split | Marketing leadership | Market signal, leadership page |
| P1 | Plan | Paid social, then creative | Ad reuse |
<!-- /examples -->

## What each example sets

Which block holds each element is in `blocks.md`, section 5. Each flow's reference says where
they go on its page.

### I1: which creators to contact for this launch, and why

What makes it work: the headline is the decision ("49 creators reviewed. Contact 11 this week."),
with a reason for every yes, maybe, and no, plus fees and expected return.

1. A headline with how many were reviewed and how many to contact, and by when.
2. A verdict tally: yes, maybe, and no with counts and the reasons behind each column.
3. A card per creator to contact, grouped by the brief's audiences, with subtotals and any open
   slot named. Each card holds the reason, proof posts, metrics, the fee and where it came from,
   the expected return when the run worked one out, and a "watch" line.
4. Every Maybe carries the one question that would settle it, or is marked as a backup.
5. Everyone left out, grouped by reason, with their score and why not.
6. Next steps in order, each with its week and the creators it covers.
7. A clock from offers to the first read of results.
8. How the verdict was made: both scores, the verdict lines, the weights, and every correction.

### O3: where we stand against competitors, and what to do

What makes it work: the answer in three claims, three decisions with a deadline, and an action
plan with owners.

1. "Prepared by" and "Prepared for" at the top; the answer, the decisions, and the next steps on
   the first screen, and the detail below.
2. The answer in at most three claims, each with its evidence, its comparison, and a "So:" line.
3. Up to three decisions, each with who approves it and its deadline where it has one.
4. An action table: action, owner, when, how you will know it worked, and how strong the evidence
   is.
5. A scorecard for next month: today's figure, the target, and the action it belongs to.
6. The competitor comparison, with what is working for the brand and what is working against it,
   by handle and views.
7. Post cards ordered by hook strength, and creators' own words, quoted and linked.
8. Full data, the method, the gaps, and numbered sources below the answer.

### P1: which creator posts to run as ads, and how to cut them

What makes it work: the scoring shown in full and shot-by-shot edit plans with timestamps. Paid
results are still to come: until a Meta ad account is connected, the page names that gap.

1. The answer and the takeaway first, then up to four recommendations as ranked next steps.
2. The scoring method in full: each criterion with its weight, what a high and a low score mean,
   the score bands, and any override.
3. Every post scored, with thumbnail, handle, source, date, length, score, verdict, and a note.
4. What the scores show, each with a "So:" line and a visual that proves it.
5. One cut structure and the specs every cut shares.
6. A storyboard per recommended ad: a still for every beat, timecodes, a one-line description, a
   duration strip, and edit notes.
7. A test plan: one variable per test, a hypothesis, and the Scale, Fix, or Stop rule for each.
8. Approvals and access needed, with when; rights for each candidate, with its expiry.
9. A brief for the next creator round, offered as a draft.
