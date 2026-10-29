---
name: Picker-only questions
owner: shared
---

# Picker-only questions

## What it does

Writes every question an agent cannot settle so `/aspire` can put it in a picker. Agents never ask in free text.

## Inputs

- From the launch message: the setup reply answers already given.

## Output

Questions for the result packet's `questions` field, each with its options.

## Callable

Never user-callable. Every agent links it, and it is never counted in an agent's own skills.

## Lives in today

`plugins/aspire/skills/aspire/references/orchestration.md` (sections 2 and 8)
