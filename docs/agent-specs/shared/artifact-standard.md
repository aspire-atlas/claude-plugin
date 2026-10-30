---
name: Artifact standard and self-check
owner: shared
---

# Artifact standard and self-check

## What it does

Builds every page on the nine-part skeleton and runs the self-check (E1 to E12 on the proposal, R1 to R12 in the plugin) before it publishes.

## Inputs

- From the launch message: the question code and the reader.

## Output

A page that passes the self-check, and the result for the result packet's `selfCheck` field.

## Callable

Never user-callable. Every agent links it, and it is never counted in an agent's own skills.

## Lives in today

`plugins/aspire/skills/page-standard/SKILL.md` and `plugins/aspire/skills/aspire/references/reader-standard.md` (ASP-4525)
