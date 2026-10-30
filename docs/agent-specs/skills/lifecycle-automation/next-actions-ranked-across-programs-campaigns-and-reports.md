---
name: Next actions ranked across programs, campaigns and reports
owner: 30-lifecycle-automation
---

# Next actions ranked across programs, campaigns and reports

## What it does

Ranks one list of next actions across every influencer program, creator ad campaign, discovery campaign and report, each with its stage, why it is due, the creators it is about and the agent that handles it.

## Inputs

- From brand memory: every setup record and the working state of each program and campaign, the execution policy that sets what the hourly run may carry out, and the routing (the Slack channel and the people it messages).
- From the page: decisions by anyone the page is shared with as Editor.
- From the launch message: publish or read mode, and the reader.

## Output

The Next actions page, where Editors approve proposals, and the ranked list for the result packet. The ranking launches no agent, decides nothing and writes no Atlas record. The hourly run then hands each approved action to its owning agent through `/aspire`, inside the saved execution policy: an approval covers only that agent's Atlas records and mailbox drafts, never a send, an order, or a store code.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
