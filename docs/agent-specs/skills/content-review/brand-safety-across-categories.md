---
name: Brand safety across categories
owner: 17-content-review
---

# Brand safety across categories

## What it does

Screens the post on the industry brand safety categories, the brand's red lines and its disclosure rule.

## Inputs

- From brand memory: `red_line` records and review hard rules (`review:rule-*`) with their actions, the safety scope (`review:safety-scope`), the disclosure rule (`review:disclosure`), the saved brand safety instruction, the primary contact, and earlier safety verdicts on the post.
- From the launch message: the post, the stage, and the creator's handle.

## Output

One result per category and per red line, a disclosure result (a paid post with no disclosure always fails), and a separate flag on the creator when a blocking red line turns up in their last 30 days of posts. A failed blocking red line sets the verdict to Do not post.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
