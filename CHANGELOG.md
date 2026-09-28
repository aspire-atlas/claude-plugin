# Changelog

Official releases of the plugins in this repository. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org).

The version lives in exactly one place: `plugins[].version` in `.claude-plugin/marketplace.json` on `main`. The beta channel (`develop`) carries no version and tracks commits. This file is edited only on `release/*` branches.

## [Unreleased]

## [2.0.0] - 2026-09-28

Major release. The plugin now bundles a second connector that each user signs in to, and some flows run short Python snippets on the user's computer.

### Added
- `atlas-creator-discovery` agent: keeps a campaign's creator shortlist at a saved target. It sources in tier order (creators the brand worked with, creators who posted about the brand, new creators in Atlas, then the creator marketplace and the web), scores each one with evidence, and republishes one shortlist page. Decisions are made in chat and kept in Atlas. It can run on a schedule, and the saved cadence is the standing approval for unattended discovery. It is the only scheduled run allowed to start discovery.
- `atlas-content-review` agent: checks one creator draft or published post against its brief, the brand's guidelines, and brand safety, with evidence for every check. Returns a verdict, edit notes for the creator, and a review page. Feedback after each review can save lessons and hard rules for later reviews. Interactive only. Saved reviews appear in the daily and weekly readouts.
- `/aspire:org-admin` skill and the bundled **Aspire Atlas Organization Admin** connector (`https://atlas.aspire.io/mcp/admin-organization`, its own OAuth sign in): lists members and pending invitations, and sends invitations after a confirmation. Only owners and admins can invite, and only owners can invite an owner. Invites never run unattended.
- Creator card: one compact card for every creator the plugin shows, in chat and on published pages, with Draft Outreach, Add to list, and Save actions that each ask before writing.
- Brand theme: scans the brand's website for colors, fonts, and logo, compares the palette as found with three contrast-checked variations, and saves the choice to Atlas. Every page, chart, and creator card then uses it, including scheduled readouts.
- An "Other services this plugin works with" section in the plugin README, covering social networks, Slack, email, web research, Google Fonts, Claude pages and schedules, and local image and video tools, with a trademark note.
- `privacyPolicyUrl` in the plugin manifest.
- `list_hashtag_posts` in the Atlas tool reference (34 tools).

### Changed
- Creator cards, the brand theme, and content review run short Python snippets (Python 3, Pillow) and local video tools (ffmpeg, OpenCV, or Swift and `sips` on a Mac) when they are already installed, to embed images, read a website's theme, and pull video frames. Nothing is installed.
- Discovery tools are described by scope, not cost: the creator brief stays inside the sourcing the user chose, and readouts start no discovery.
- Plugin description, keywords, and skill descriptions rewritten for the directory listing.
- Atlas connection check prefers the connection that is signed in when more than one is present.

### Removed
- `curl` download instructions from the skill references.

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

[Unreleased]: https://github.com/aspire-atlas/claude-plugin/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v2.0.0
[1.1.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.1.0
[1.0.1]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.0.1
[1.0.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.0.0
