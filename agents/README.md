# Server-runnable agent cores

This folder is not a plugin and nothing in it ships to Claude. It holds the core prompts the Atlas
server runs for agents that start without a person in the loop. The server vendors each core from a
tag of this repo (`bun run agent-prompts:sync <agent> <tag>` in the server repo), never fetches it
at run time, and records the tag and the file's sha256 beside its copy.

- `server-runnable.json`: `{ "serverRunnable": ["<agent>", ...] }`, the agents the server may
  vendor. Sync refuses an agent not listed here.
- `<agent>/core.md`: the agent's core prompt, plain Markdown with no frontmatter.

A core reads the run's input, calls only the tools the server's registry entry allows for that
agent, asks nothing, and ends with the JSON envelope its registry entry validates. The server
refuses any other tool call and fails a run whose envelope does not validate.

These files sit at the repository root, not under `plugins/aspire/agents/`, so that Claude Code
never loads a core as one of a plugin's agents. The in-Claude agent that
wraps a core, when there is one, lives in its plugin's `agents/` folder as usual and keeps its
method in step with the core.

| Agent | Variant | Output |
| ----- | ------- | ------ |
| `atlas-brand-snapshot` | public or connected, chosen by the core from the Profile's linked channels | `{ title, answer, figures, data }`, `data` a `BrandSnapshotReport` version 1 |
