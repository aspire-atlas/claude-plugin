---
name: Live artifact output
owner: shared
---

# Live artifact output

## What it does

Publishes the agent's page as a live artifact with widgets, and republishes later runs to the same link.

## Inputs

- From brand memory: the saved link of the page this agent published last time, if any.

## Output

The page link, new or republished, for the result packet's `page` field.

## Callable

Never user-callable. Every agent links it, and it is never counted in an agent's own skills.

## Lives in today

`plugins/aspire/skills/aspire/references/artifact-standard.md`
