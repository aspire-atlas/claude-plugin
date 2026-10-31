---
name: Stage tracking from approved to complete
owner: 15-campaign-manager
---

# Stage tracking from approved to complete

## What it does

Moves each creator forward on the program roster as their posts come in, from Agreed through Posting due and Posted to Complete.

## Inputs

- From brand memory: the program setup records (`program:{slug}-program` and `program:{slug}-terms`), and the newest `roster`, `terms`, `fulfillment` and `deliverable` findings per creator, which give the stage, the deal type and the term end.
- From the launch message: the profile id, the program slug, `pass` (`propose` or `record`), the creators to limit the run to, and the batch approval that saves the moves.

## Output

A list of proposed moves, one per creator: the stage now, the stage proposed, and why (an owed post is due, every owed post due so far is up, or every post in the deal is up and the term has ended). Moves only go forward. On the record pass each approved move becomes one `roster` finding.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
