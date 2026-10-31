---
name: Licence request drafts
owner: 24-organic-to-ads
---

# Licence request drafts

## What it does

Drafts a short paid-usage request for each top candidate the brand does not yet have rights to.

## Inputs

- From brand memory: the post's `rights` and `draft` findings and the creator's deal, so
  nothing already granted or already asked is asked for, and the program's usage fees.
- From the launch message: the candidates the person chose and any usage they asked for.

## Output

One draft per creator, covering several posts when there are several, with the usage, channels,
duration and fee. Fees come from the program's usage fees or the person's number, else a `[fee]`
blank. It skips a post by the brand or a competitor, a creator with a saved reject or an open
your-call question, an asset blocked on brand safety, and a creator with no route. A request under
14 days old is shown again, never drafted twice; one declined in the last 90 days is skipped; after
14 days with no answer, the new draft is a follow-up on the same terms. Sending goes through 13
Outreach and Brief, one question per creator.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
