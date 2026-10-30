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
blank. It skips a post with an open request (a `draft` for that post and usage, or a `rights`
finding requested under 14 days ago) and shows that request again instead. Sending goes through 13
Outreach and Brief, one question per creator.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
