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
- From the launch message: the objective, the total budget and currency (or, for P5, the budgets
  to compare), the network, and the audiences.

## Output

One variable per test (hook pattern, opening line, cut length, creator, or audience), a hypothesis,
the audience and objective, the budget per test, the spend floor before judging, and a Scale, Fix or
Stop rule. The total never passes the stated budget. Without a cost per sale target it asks for one
before launch. A stated budget in a currency other than the ad account's is never converted: it asks
for the budget in the account's currency first.

A "what would it buy" question (P5) gets the same plan at each budget the person names: how many
tests, creators and variants each budget covers above the spend floor. It promises no reach or
results and quotes no benchmark. For YouTube it says Atlas holds no YouTube ad results and there is
no YouTube launch path, so the plan is the creator and variant side only.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
