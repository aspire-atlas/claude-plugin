---
name: Living shortlist page with keep and drop
owner: 05-creator-search
---

# Living shortlist page with keep and drop

## What it does

Republishes one shortlist page for the campaign, at the same link every run, numbered so the person can keep or drop creators by number.

## Inputs

- From brand memory: the pool state rebuilt from every candidate written for this campaign, the
  campaign's routing record, and the brand theme when saved.
- From the launch message: the brand profile, the campaign, the job, the reader lens, and the run
  mode.

## Output

The published page link and a short summary: pool counts against target, the top additions,
moves, flags and gaps, and the numbered range to decide on. Kept creators lead the page, the
undecided pool follows by tier and score, and dropped creators sit in a collapsed list with their
reason. The agent proposes the candidate saves; a person's keep and drop calls are saved by
`/aspire` after one batch confirmation. The page is delivered to the saved routing.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
