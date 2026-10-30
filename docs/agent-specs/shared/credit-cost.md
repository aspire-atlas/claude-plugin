---
name: Credit cost before any spend
owner: shared
---

# Credit cost before any spend

## What it does

States the cost in credits or money, and the time, before any run that spends. Read-only runs never ask.

## Inputs

- From the launch message: the credit cap from the setup reply.

## Output

A cost line for the setup reply, and credits used for the result packet's `cost` field.

## Callable

Never user-callable. Every agent links it, and it is never counted in an agent's own skills.

## Lives in today

`plugins/aspire/skills/aspire/references/orchestration.md` (sections 2 and 7)
