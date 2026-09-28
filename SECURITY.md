# Security

## Reporting a vulnerability

Email **security@aspire.io** with a description, reproduction steps, and impact. Do not open a public issue for security reports. We acknowledge reports within 3 business days.

## What this plugin can and cannot do

- **Data access.** The bundled connectors talk only to `https://atlas.aspire.io/mcp` (Atlas data) and `https://atlas.aspire.io/mcp/admin-organization` (organization members) over HTTPS with OAuth. They read and write data for the organizations the signed-in user belongs to, within that user's role. They do not read Claude memory, chat history, or uploaded files beyond what the user hands it in the task.
- **No local code.** The plugin is markdown and JSON only: skills, agents, and an MCP definition. It installs no binaries, runs no hooks, and needs no environment variables or API keys.
- **State changes need consent.** Every Atlas and organization admin write is confirmed through a multiple-choice question. Destructive actions each get their own confirmation. Invites to an organization never run in unattended sessions.
- **Unattended runs are constrained.** Scheduled runs never ask questions, never run destructive tools, and deliver only to Slack channels and email recipients the user saved during setup. Scheduled readouts start no discovery work at all; creator discovery is the sole agent permitted to run discovery unattended, and only under a cadence the user saved explicitly for that campaign.

## Supply chain

- Releases are tagged and pinned by version; installs update only when a new version is published.
- CI validates manifests, checks version sync, and scans for credential patterns on every push and pull request.
- Only maintainers in the `aspire-atlas` GitHub organization can publish releases.
