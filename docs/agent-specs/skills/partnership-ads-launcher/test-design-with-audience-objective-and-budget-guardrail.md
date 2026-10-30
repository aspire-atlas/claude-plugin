---
name: Test design with audience, objective and budget guardrail
owner: 25-partnership-ads-launcher
---

# Test design with audience, objective and budget guardrail

## What it does

Designs a test with one variable, a clear rule for reading it, and a spend limit it cannot pass.

## Inputs

- From brand memory: the campaign's decision defaults (cost per sale target, spend floor), the
  lanes and their personas, and past learnings on the creators and posts.
- From the launch message: the objective, the total budget and currency, and the audiences.

## Output

One variable per test (hook pattern, opening line, cut length, creator, or audience), a hypothesis,
the audience and objective, the budget per test, the spend floor before judging, and a Scale, Fix or
Stop rule. The total never passes the stated budget. Without a cost per sale target it asks for one
before launch.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
