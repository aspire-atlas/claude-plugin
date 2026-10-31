---
name: Brand safety screen on GARM tiers and the ban list
owner: 06-creator-vetting
---

# Brand safety screen on GARM tiers and the ban list

## What it does

Checks each creator's recent posts against the industry brand safety categories and the brand's own red lines.

## Inputs

- From brand memory: every red line with its action (block, flag or escalate), the safety scope
  from vetting setup, the hard rejects, the saved brand safety instruction, the primary contact
  for escalations, and earlier brand safety and content review findings on the creator.
- From the launch message: the brand profile, the normalized list of handles and networks, and
  the handles approved for fetching.

## Output

Per creator: a Pass, Flag, Fail or Can't check line for each industry category, each red line,
and each scope rule, every one citing a post with a quoted line, a transcript line, or a field
and its value. A category flagged on three or more posts is a Fail. Fewer than three analyzed
posts makes the category screen Can't check. An escalation names who to tell.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
