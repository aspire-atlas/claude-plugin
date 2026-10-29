---
name: Evidence and confidence labels
owner: shared
---

# Evidence and confidence labels

## What it does

Labels every finding as an observation, an inference, or a recommendation, with its evidence and a confidence.

## Inputs

- The posts, numbers, and records the run used.

## Output

Findings with `kind`, `confidence`, and evidence, for the result packet and the page.

## Callable

Never user-callable. Every agent links it, and it is never counted in an agent's own skills.

## Lives in today

`plugins/aspire/skills/aspire/references/orchestration.md` (section 6)
