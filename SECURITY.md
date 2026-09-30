# Security

## Reporting a vulnerability

Email **security@aspire.io** with a description, reproduction steps, and impact. Do not open a public issue for security reports. We acknowledge reports within 3 business days.

## What this plugin can and cannot do

- **Data access.** The bundled connectors talk only to `https://atlas.aspire.io/mcp` (Atlas data) and `https://atlas.aspire.io/mcp/admin-organization` (organization members) over HTTPS with OAuth. They read and write data for the organizations the signed-in user belongs to, within that user's role. They do not read Claude memory, chat history, or uploaded files beyond what the user hands it in the task. The Aspire staff flow (`/aspire:staff`) also reads a data warehouse connector and a Slack connector when the staff member has added them to Claude; the plugin bundles neither, and it never posts to Slack.
- **What ships.** The plugin is markdown and JSON only: skills, agents, and an MCP definition. It ships no script files, hooks, or binaries, installs nothing, and needs no environment variables or API keys.
- **Snippets that run on your computer.** A few reference files include short Python snippets. Claude saves one to a temporary file and runs it to embed images on a page or card, read a brand's website colors, fonts, and logo, or work out a color palette. Every snippet:
  - is written out in full in the plugin, where anyone can read it, and is never downloaded;
  - uses only the Python standard library and Pillow, and runs only when Python is already installed;
  - starts no other programs and installs nothing;
  - only reads public web pages and images the flow names (Aspire's image server, the brand's website and its logo, Google Fonts);
  - writes nothing except up to three logo files in the folder where it runs, and prints its results;
  - runs through the same permission checks as any command Claude runs.

  Content review may also use a video tool already on your computer (ffmpeg, OpenCV, or Swift on a Mac) to pull still frames from a post. It never installs one.
- **State changes need consent.** Every Atlas and organization admin write is confirmed through a multiple-choice question. Destructive actions each get their own confirmation. Invites to an organization never run in unattended sessions.
- **Unattended runs are constrained.** Scheduled runs never ask questions, never run destructive tools, and deliver only to Slack channels and email recipients the user saved during setup. Scheduled readouts start no discovery work at all; creator discovery is the sole agent permitted to run discovery unattended, and only under a cadence the user saved explicitly for that campaign.

## Supply chain

- Releases are tagged and pinned by version; installs update only when a new version is published.
- CI validates manifests, checks version sync, and scans for credential patterns on every push and pull request.
- Only maintainers in the `aspire-atlas` GitHub organization can publish releases.
