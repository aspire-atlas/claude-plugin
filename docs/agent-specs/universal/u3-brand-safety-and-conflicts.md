---
name: Brand safety and conflicts
owner: universal
code: U3
---

# U3 Brand safety and conflicts

## What it does

Answers whether a creator or post is safe, disclosed, and free of rival deals.

## Inputs

- From brand memory: the red lines with their action (block, flag, escalate), the safety scope and hard rejects, the brand safety instruction, competitors and partners with spelling variants, the disclosure rule, `review:rule-*` records, and earlier brand safety and content review findings.
- From Atlas: brand safety ratings across the 12 industry categories for each post, the paid partnership marker, and the post text and transcript.
- From the launch message or deal: the disclosure wording and must-include list a deal requires.

## Output

Pass, Flag, Fail, or Can't check for each category, red line, competitor, and disclosure check, each with a cited post, field, or timecode; profanity instances with times and the cleanest trim when the question is paid use; competitor matches, with paid partnerships kept apart from organic mentions; and the exact fix for a disclosure gap. A failed blocking red line returns a block (do not post, do not contact) and names the record that decided it. A red line on AI-written copy turns drafts into talking points.

## Callable

Never user-callable. Agents that list U3 under **Universal skills used** run it, and it is never
counted in an agent's own skills.
