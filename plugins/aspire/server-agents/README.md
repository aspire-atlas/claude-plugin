# Server-runnable agent cores

This folder holds the core prompts the Atlas server runs for agents that start without a person in
the loop. It ships with the plugin so the in-Claude agent that wraps a core can read the same file
(`${CLAUDE_PLUGIN_ROOT}/server-agents/<agent>/core.md`), and the two never drift. Claude Code does
not load anything here as an agent or a skill: only `agents/` and `skills/` are loaded. The server vendors each core from a
tag of this repo (`bun run agent-prompts:sync <agent> <tag>` in the server repo), never fetches it
at run time, and records the tag and the file's sha256 beside its copy.

- `server-runnable.json`: `{ "serverRunnable": ["<agent>", ...] }`, the agents the server may
  vendor. Sync refuses an agent not listed here.
- `<agent>/core.md`: the agent's core prompt, plain Markdown with no frontmatter.

A core reads the run's input, calls only the tools the server's registry entry allows for that
agent, asks nothing, and ends with the JSON envelope its registry entry validates. The server
refuses any other tool call and fails a run whose envelope does not validate.

A core is not under `agents/` because Claude Code loads every Markdown file there as an agent, and
a core is a bare prompt with no frontmatter. The in-Claude agent that wraps a core, when there is
one, lives in `agents/` as usual, reads the core for its method, and adds what a Claude run needs on
top: the connector's tool names, the page and its mark, and any confirmations.

| Agent | Variant | Output |
| ----- | ------- | ------ |
| `atlas-brand-snapshot` | public or connected, chosen by the core from the Profile's linked channels | `{ title, answer, figures, data }`, `data` a `BrandSnapshotReport` version 1 |
