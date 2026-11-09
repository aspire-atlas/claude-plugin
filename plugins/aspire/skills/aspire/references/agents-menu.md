# List agents (the agents and run arguments)

Used by SKILL.md's **Arguments** for `agents` and `run {agent}`. The hand-off table step 5
names lives in SKILL.md (**Agent hand-off**), because the router owns where each agent goes.

## List agents

Report every subagent the plugin ships, then let the user run one. Read the list from disk each
time so it never goes stale; never recite it from memory.

1. Resolve the plugin's `agents/` folder from this skill's base directory: it is two levels
   up, at `<base>/../../agents/`. Use `Glob` for `agents/*.md` there.
2. For each file, read the frontmatter with `Read`. Take `name`, the first sentence of
   `description` (stop at the first period; ignore any `<example>` blocks), and the quoted
   "Trigger on ..." phrases when the description has them.
3. Reply with one bullet per agent, sorted by name, in this shape:
   `**aspire:{name}**: {first sentence}` followed on the same line by "Trigger: {phrases}".
   Skip the trigger part when the description has none.
4. Then ask with `AskUserQuestion`, one question, header "Agent": "Which one do you want to
   run?" One option per agent, in the same order as the bullets. Label is the agent name
   without the `aspire:` prefix; description is what it produces in one line plus what it
   needs (for example "needs a linked channel with indexed posts"). The tool takes 2 to 4
   options and adds its own free text field, so never add a "None" or "Not now" option: if
   the answer names no agent on the list, say nothing further and stop. With more than four
   agents on disk, offer the first four and say in the question text that any other name from
   the bullets can be typed into the free text field.
5. On a selection, first ask with `AskUserQuestion`, header "Sample": "Want to see a sample of
   what {agent} makes before running it?" Options: "Show me a sample first (Recommended)" / "Run
   it now". A sample runs **Sample artifacts** and then asks once more whether to run it for real.
   Then hand off to that agent's section of this skill rather than launching the
   agent straight from here. Those sections own the connection check, the profile, and the
   confirmations each agent needs, per the table in SKILL.md's **Agent hand-off**.

   Answers the **Prompt coach** already collected carry into the hand-off row (**Prompt coach**,
   Carry-over).

   Older agent names resolve per **Running agents** (`references/running-agents.md`).

   An agent on disk that is not in that table: run Phase 1 and Phase 2 + 3, then launch it
   with the tool prefix, `profile_id`, `profile_slug`, the linked handles and networks, and `recipient`
   (**Reading the ask**), and relay
   whatever it asks the main thread to confirm.

Listing needs no Atlas connection, so do not run Phase 1 and do not render a connector card
before the question; run Phase 1 only once an agent is picked. If the `agents/` folder is
missing or empty, say so in one line and stop; never invent an agent and never offer one that
is not on disk.
