---
name: Pricing and return
owner: universal
code: U7
---

# U7 Pricing and return

## What it does

Answers what a deal should cost, and what it should return.

## Inputs

- From brand memory: the `fees:rate-card` record, or Aspire's recommended rates when none is saved; the program's budget, term, maximums, and payment timing.
- From Atlas: the creator's median views over their last 10 posts per channel and format, with at least 3 that have views.
- From the agent: the channels and deliverables being priced, and agreed fees, offers out, product values, and commission when it tracks spend.

## Output

Open, target, and max fees rounded to USD 10, with the rate label and the bundled views behind them, capped at the program's maximum; or "No price" with the missing input. For spend it returns, per currency and never converted: paid, owed, committed, product cost, remaining, the forecast to the end of the term, and what remains after offers still out. Planning can ask for 2 or 3 budget scenarios at target.

## Callable

Never user-callable. Agents that list U7 under **Universal skills used** run it, and it is never
counted in an agent's own skills.
