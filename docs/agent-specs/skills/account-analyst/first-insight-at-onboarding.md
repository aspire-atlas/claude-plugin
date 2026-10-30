---
name: First insight at onboarding
owner: 27-account-analyst
---

# First insight at onboarding

## What it does

Runs the first account review at the end of onboarding, as soon as a linked account has posts indexed.

## Inputs

- From brand memory: the digest of what onboarding just saved (summary, goals, competitors, red lines, partners).
- From the launch message: the profile, the target mode `own`, every linked handle, the onboarding flag, and the team lens.

## Output

The same summary as any account review (a headline, three to five insights with numbers, next week's three pushes, two or three next steps, data gaps), with its findings proposed under an onboarding run key. If nothing is indexed yet, it says indexing is still running and saves nothing.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
