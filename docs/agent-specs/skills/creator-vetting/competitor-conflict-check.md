---
name: Competitor conflict check
owner: 06-creator-vetting
---

# Competitor conflict check

## What it does

Looks for each saved competitor and its spelling variants in the creator's captions and mentions.

## Inputs

- From brand memory: every saved competitor with its spelling variants, and the hard rejects
  from vetting setup.
- From the launch message: the list of handles and networks.

## Output

Per creator: a Pass, Flag or Fail with the post that decided it. A paid partnership with a
competitor in the last 90 days is a Fail when the hard rejects list it, and a Flag otherwise. An
organic mention is a note. A handle saved as a competitor is a Reject without further checks.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
