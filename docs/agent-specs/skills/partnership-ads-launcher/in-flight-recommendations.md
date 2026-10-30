---
name: In-flight recommendations
owner: 25-partnership-ads-launcher
---

# In-flight recommendations

## What it does

Reads live results and calls each ad scale, hold, or stop.

## Inputs

- From brand memory: the decision defaults and the test plan.
- From the launch message: the window. Results come from `search_ads`, one row per currency.

## Output

Per ad: spend, cost per sale against the target, hook rate, hold rate and click-through, a status
(Winning, Testing, Watch, Fatigued, Retire, or Not spending), and one move with its reason. It says
whether a soft result points at the creative or the setup, with the figures behind it. Paid and
organic figures are never added together, and currencies are never converted.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
