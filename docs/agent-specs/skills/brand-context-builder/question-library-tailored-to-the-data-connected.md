---
name: Question library, tailored to the data connected
owner: 01-brand-context-builder
---

# Question library, tailored to the data connected

## What it does

Asks the brand context questions one at a time, skipping any already answered, and only after a social account is linked.

## Inputs

- From brand memory: every calibration on the profile, including replaced and declined ones, so no saved or declined question is asked again.
- From the launch message: the profile, the organization name, the brand's display name, and the linked handles, which fill the question wording and the options.

## Output

The answers to the core set (what the brand sells and to whom, the person's role, competitors, the 90-day goal, red lines, current partners, what to track) and, if the person continues, the optional set (cadence, voice, the weekly target, teammates). Each answer is one record to save, with a short statement and its detail. Options are inferred from the saved memory, earlier answers and the brand's own site, and the person can always type their own.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
