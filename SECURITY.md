# Security

## Reporting a vulnerability

Email **security@aspire.io** with a description, reproduction steps, and impact. Do not open a public issue for security reports. We acknowledge reports within 3 business days.

## What this plugin can and cannot do

- **Data access.** The bundled connector talks only to `https://atlas.aspire.io/mcp` over HTTPS with OAuth. It reads and writes Atlas data for the organizations the signed-in user belongs to. It does not read Claude memory, chat history, or uploaded files beyond what the user hands it in the task.
- **No local code.** The plugin is markdown and JSON only: skills, agents, and an MCP definition. It installs no binaries, runs no hooks, and needs no environment variables or API keys.
- **State changes need consent.** Every Atlas write is confirmed through a multiple-choice question. Destructive actions each get their own confirmation. Paid creator discovery runs only on explicit choice.
- **Unattended runs are constrained.** Scheduled readouts never ask questions, never run destructive or paid tools, and deliver only to Slack channels and email recipients the user saved during setup.

## Supply chain

- Releases are tagged and pinned by version; installs update only when a new version is published.
- CI validates manifests, checks version sync, and scans for credential patterns on every push and pull request.
- Only maintainers in the `aspire-atlas` GitHub organization can publish releases.
