---
name: Brand memory read and write
owner: shared
---

# Brand memory read and write

## What it does

Reads the brand's memory and the person's own before a run, and writes findings and corrections back once approved.

## Inputs

- From brand memory: calibrations, instructions, and earlier findings for this brand.

## Output

What the run should start from, and proposed saves for the result packet.

## Callable

Never user-callable. Every agent links it, and it is never counted in an agent's own skills.

## Lives in today

`plugins/aspire/skills/aspire/references/atlas-tools.md`
