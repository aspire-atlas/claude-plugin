---
number: 30
name: Lifecycle Automation
team: 6 Organic and operations
personas: Influencer Manager, Paid Social Manager, Organic Social Manager
wave: 4
permission: Send
plugin_agents: none
---

# Lifecycle Automation

## Job to be done

When I describe a rule in plain language, I want it turned into a visible automation with trigger, action, guardrail, approver and stop condition, run through /aspire, so follow-through happens without me.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (5)

1. Plain language to rule
2. Preview and test mode
3. Conflict check against existing rules
4. Audit history and rollback
5. Reward, re-engage, refresh, escalate actions

## Universal skills used

- U5 Performance baseline

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Scheduled tasks
- Every other agent, through /aspire
- Slack, for escalations

## Trigger phrases

- "when a creator posts, thank them"
- "every time {condition}, {action}"
- "automate this"
- "set up a rule"
- "remind creators who haven't posted after 14 days"
- "what automations do we have"
- "pause the {rule} automation"
- "undo what the {rule} rule did"
- A scheduled task named "Atlas automation: {rule}"

## Writes to Atlas

Each rule as an `automation:{slug}` calibration (trigger, condition, action, guardrails, approver, stop condition, and status: draft, testing, live, paused, retired), saved by `/aspire` on one batch question when the person turns the rule on, and superseded, never deleted, when it changes. Each run's matches, what it did, and what it held as `automation-run` findings, and the page as a `page` finding, under the standing approval the rule's setup saved. The `automation:{slug}` calibration and the `automation-run` finding are both new; the build adds them to `program.md`.

An action that reaches someone outside the brand is a Send, confirmed one item at a time, exactly as for any Send agent: the rule queues the draft and the item waits in the run's queue until a person confirms it in a session. A rule never sends unattended; the skill `reward-re-engage-refresh-escalate-actions` says why and what would change that. An action that writes another agent's record type is handed to that agent through `/aspire` as a new action, never written by this agent.

## Non-goals

- Sending, ordering, paying, or creating a code without a person confirming each item. The owning agent does the work and `/aspire` confirms it.
- Writing another agent's records (stages, deals, rights, ledger lines). The rule names the action and the owning agent does it.
- Ranking what to do next across programs and campaigns. The orchestrator in `/aspire` does that.
- Rules that spend credits or money. A Spend action is refused at the rule stage and named as a session step.
- Deciding anything a rule's condition does not settle. A your-call item is held for a person.
