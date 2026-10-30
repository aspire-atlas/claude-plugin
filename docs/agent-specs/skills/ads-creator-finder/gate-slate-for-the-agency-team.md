---
name: Gate slate for the agency team
owner: 09-ads-creator-finder
---

# Gate slate for the agency team

## What it does

Builds the per-lane slate the agency reviews before the client sees it at Gate 2.

## Inputs

- From brand memory: the newest lane vetting run per lane for the campaign (06 Creator Vetting
  run on the lane, with the paid screens), `vetting:thresholds`, and
  the lane records.
- From the launch message: the campaign, and the agency's one-line pick note per creator.

## Output

One row per creator per lane with the slate call (Approve, Maybe or Reject), the four figures (hook
rate, Reels interaction rate, past paid partners, partnership readiness), and the reason in plain
words, never price. The recommendation is shown to the agency only; the client starts at
"Unreviewed".

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
