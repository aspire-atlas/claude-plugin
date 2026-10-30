---
name: Next actions ranked across programs, campaigns and reports
owner: 30-lifecycle-automation
---

# Next actions ranked across programs, campaigns and reports

## What it does

Ranks one list of next actions across every influencer program, creator ad campaign, discovery campaign and report, each with its stage, why it is due, the creators it is about and the agent that handles it.

## Inputs

- From brand memory: every setup record and the working state of each program and campaign, the saved limits for the hourly run, and the Editors who approve.
- From the launch message: publish or read mode, and the reader.

## Output

The Next actions page, where Editors approve proposals, and the ranked list for the result packet. The hourly run hands each approved action to its owning agent through `/aspire`, inside the saved limits. It launches no agent, decides nothing and writes nothing to Atlas.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
