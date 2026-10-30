---
name: Net-new filter against my roster
owner: 04-competitor-roster
---

# Net-new filter against my roster

## What it does

Splits the competitors' partners into creators the brand already knows and creators it does not.

## Inputs

- From brand memory: every program's `roster` findings, the campaign pools, and the creators' past verdicts and `red_line` notes from vetting.
- From the launch message: the partners from partnership signal detection.

## Output

Two lists. Net-new: creators on no roster, in no pool, and with no reject verdict. Already known: each with where the brand knows them from (on a roster at a stage, in a pool, or rejected, with the date and reason). A creator partnering with both the brand and a competitor is marked shared, and a live exclusivity signal (a disclosed paid post for a competitor in the last 30 days) is flagged for vetting.

## Callable

Never user-callable. Only Competitor Roster runs it.
