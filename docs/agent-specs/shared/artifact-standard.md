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

The reviewer side is `plugins/aspire/agents/atlas-quality-review.md`, which checks a finished page or deck against the same
standard and gives a verdict of Ready, Ready with fixes, or Not ready. It belongs to the shared
tier, not to the 31 agents, and runs only through `/aspire` (the quality review shortcut or the
review offer after a page is published). Its rubric reads the R1 to R12 checks from
`reader-standard.md` rather than keeping a second copy.
