---
name: GARM default safety standard with brand red lines
owner: 01-brand-context-builder
---

# GARM default safety standard with brand red lines

## What it does

Records the brand's hard no's (topics, creators or content types to block or escalate) as red lines on top of a standard safety baseline.

## Inputs

- From brand memory: the red lines and any declined red-line question already saved.
- From the launch message: the profile and the person's answer to the red-line question.

## Output

One red line per rule, each with its action (block or escalate), what it applies to, and the rule in the person's words. The question offers "Standard brand safety only" and saves only the brand's own rules; a GARM tier default saved as its own record is not built yet.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
