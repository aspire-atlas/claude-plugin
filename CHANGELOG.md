# Changelog

Official releases of the plugins in this repository. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org).

The version lives in exactly one place: `plugins[].version` in `.claude-plugin/marketplace.json` on `main`. The beta channel (`develop`) carries no version and tracks commits. This file is edited only on `release/*` branches.

## [Unreleased]

## [1.1.0] - 2026-09-23

### Added
- `/aspire:aspire agents` lists every subagent the plugin ships, with its purpose and trigger phrases, then runs the one the user picks and hands off to that agent's section of the skill so the connection check, profile, and confirmations still happen.
- Account review covers any Instagram or TikTok handle the user names, not only the brand's linked channels. The analyst resolves the handle and refreshes it in Atlas when nothing is held for it or the record is over 24 hours old, and reports the resolved freshness with its findings.

### Changed
- A named account is compared against its own category peers - accounts the user named, or accounts in the same category and follower band - on rates rather than raw counts. It is never measured against the brand's own account or the brand's competitors, and cross-referencing the brand's goal and competitor set is now scoped to reviews of the brand's own accounts.
- Findings from a named-handle review are written under their own run key, so an external review does not mix with the brand's onboarding insights.

## [1.0.1] - 2026-09-22

### Changed
- Repository renamed to `aspire-atlas/claude-plugin`; `repository` URLs updated in the manifest and docs.
- Release gate requires a version bump only when plugin content changes; docs and CI-only changes may land without one.

## [1.0.0] - 2026-09-22

First public release. Versioning restarts at 1.0.0; earlier 0.x builds were internal.

### Added
- `/aspire:aspire` skill: six-phase onboarding from connection check to first insights, brand context capture, and a Readouts section that sets up and schedules recurring reports.
- `atlas-account-analyst` agent: evaluates connected accounts and writes first insights back to Atlas.
- `atlas-creator-brief` agent: weekly content brief with deliverables, guardrails, creators sourced through Aspire discovery, priced engagements, and a published visual brief.
- `atlas-daily-readout` and `atlas-weekly-readout` agents: performance against baseline, anomalies, open action items, ranked next steps; Slack and email delivery; schedulable.
- Bundled Aspire Atlas connector (`https://atlas.aspire.io/mcp`, OAuth).
- Two release channels: `aspire-atlas` (official, pinned) and `aspire-atlas-beta` (tracks `develop`).
- Apache-2.0 license.

[Unreleased]: https://github.com/aspire-atlas/claude-plugin/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.1.0
[1.0.1]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.0.1
[1.0.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.0.0
