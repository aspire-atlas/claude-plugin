---
name: Feedback saved as calibration
owner: 06-creator-vetting
---

# Feedback saved as calibration

## What it does

Asks the team for its own call on each recommendation and saves what it says about single creators and the list as a whole.

## Inputs

- From brand memory: existing calibrations on these creators and saved vetting lessons.
- From the launch message: the run key and page, so numbers resolve against this run.

## Output

The team's call on each creator as a feedback insight, each creator note as a calibration that
says the stance and the reason, and a lesson for every future vetting when a correction
generalizes. Nothing is saved before the person sees the wording. A change to a record that
already exists, or to a red line, competitor or setup answer, is handed back for `/aspire` as
the key, its current wording, the proposed wording, and why. When the agent cannot ask the
questions itself, it hands back a feedback packet for `/aspire` to ask.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
