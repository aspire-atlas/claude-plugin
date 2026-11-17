---
number: {{NUMBER}}
name: {{NAME}}
team: {{TEAM}}
personas: {{PERSONAS}}
wave: {{WAVE}}
permission: {{PERMISSION_CAP}}
plugin_agents: {{AGENT}}
---

# {{NAME}}

## Job to be done

When I TODO(new-agent): the moment it starts, I want TODO(new-agent): what the agent hands me, so
TODO(new-agent): what that lets me do.

## Questions answered

| Code | Question | Primary reader | Eval reader | Kind of page | Approved example | Eval question |
| ---- | -------- | -------------- | ----------- | ------------ | ---------------- | ------------- |
{{QUESTION_ROWS}}

## Skills carried (1)

1. TODO(new-agent): first skill name

## Universal skills used

- TODO(new-agent): the universal skills it uses (U1 to U7)

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas

## Trigger phrases

- "{{NAME_LOWER}}"
- "TODO(new-agent): what a person says that should route here"

## Writes to Atlas

{{SPEC_WRITES}}

## Non-goals

- TODO(new-agent): what it leaves to another agent, and which one.
