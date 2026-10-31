---
name: Guideline check
owner: 17-content-review
---

# Guideline check

## What it does

Checks the post against the brand's saved guidelines, brand rules, voice, competitors and claims.

## Inputs

- From brand memory: `guideline` records that apply to content, the setup's brand rules (`review:brand-rules`), the voice brand fact, and `competitor` records with their spelling variants.
- From the launch message: the post and the brand's own handles and networks.

## Output

One result per guideline and per brand rule line, a voice check, a competitor check (a competitor in frame is a Fail), and a Flag on any health, safety, pricing, "best" or before-and-after claim the brief does not back up. Each carries evidence, a fix and a severity.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
