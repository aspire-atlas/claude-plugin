# Working in this repository

This repo is the Aspire Atlas plugin for Claude and its marketplace catalog. Full operating rules: `docs/PLUGIN-LIFECYCLE.md`. The short version:

- `develop` is the beta channel (marketplace `aspire-atlas-beta`, version = commit SHA). `main` is the official channel (marketplace `aspire-atlas`, version pinned in `.claude-plugin/marketplace.json`).
- Feature work: branch from `develop`, PR into `develop`. Never edit `CHANGELOG.md` or the `name` / `description` / `displayName` / `version` lines of `.claude-plugin/marketplace.json` on `develop`.
- Releases: `git checkout -b release/X.Y.Z origin/main && git merge origin/develop`, bump both version fields in `marketplace.json`, write the changelog entry, PR into `main` with a merge commit. CI tags and publishes.
- `plugins/aspire/.claude-plugin/plugin.json` and `SKILL.md` frontmatter never carry a `version`.
- Never touch `aspire-atlas/claude-plugin-internal`; CI overwrites it from `develop`.
- Plugin content is markdown and JSON only. No hooks, scripts, or binaries without a deliberate decision and a major version.
- Every Atlas write in a skill or agent is confirmed with `AskUserQuestion` first; destructive tools each get their own confirmation; unattended runs never ask and never destroy; only `atlas-creator-discovery` may start discovery work unattended, under a cadence the user saved for that campaign.
- Before pushing: `claude plugin validate .`, `claude plugin validate plugins/aspire`, `bash scripts/check-channel.sh <develop|main>`.
- No secrets, customer names, or internal URLs in any file.
