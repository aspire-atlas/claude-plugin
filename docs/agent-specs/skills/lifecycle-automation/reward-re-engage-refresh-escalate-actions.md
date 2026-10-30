---
name: Reward, re-engage, refresh, escalate actions
owner: 30-lifecycle-automation
---

# Reward, re-engage, refresh, escalate actions

## What it does

Carries out a matched rule's action by handing it to the agent that owns the work.

## Inputs

- From brand memory: the rule, its guardrails, and the records the action needs.
- From the launch message: the matches from the run.

## Output

Per match, one of four actions, each done by the agent that owns it: reward (a thank-you or a gift: Outreach and Brief (13) or Product Fulfillment (16); a cash bonus is money, so it is refused like any Spend), re-engage (a note to a dormant or slipping creator: Ambassador Program (22) or Outreach and Brief (13)), refresh (rebuild a page or rerun a report: the owning report agent), or escalate (an alert to the approver on the rule's routing, which a scheduled run posts to Slack and the next session repeats in chat). A Read or Write action runs under the rule's standing approval. A Send action is drafted and queued; nothing reaches anyone until a person confirms it.

**Sends wait for a person.** Every Send a rule triggers is confirmed one item at a time, the same as any other Send. A rule finds the matches and writes the drafts while nobody is watching, so the person's work drops to reading a queue and answering one question per item. It does not send on its own, even inside limits the person set.

Why:

- `orchestration.md` section 7 confirms every Send item by item. Its exceptions are the Orchestrator's page approvals, discovery's saved cadence, and unattended runs acting on the standing approvals their setup saved. None of them sends anything.
- `orchestrator.md` section 12 lists sending under limits as a later level that needs a deliberate decision, a SECURITY.md update, and a major version.
- A rule is read from plain language and can be misread. A message sent to a creator cannot be taken back.

Sending under limits could be built later as its own change. It would need everything in that design note (approval per recipient, a daily send cap, and an undo window before each send), plus a rule that has run in test mode with no conflicts and no declined items first.

## Callable

Never user-callable. Only Lifecycle Automation runs it.
