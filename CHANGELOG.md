# Changelog

Official releases of the plugins in this repository. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org).

The version lives in exactly one place: `plugins[].version` in `.claude-plugin/marketplace.json` on `main`. The beta channel (`develop`) carries no version and tracks commits. This file is edited only on `release/*` branches.

## [Unreleased]

## [3.0.0] - 2026-09-29

Major release. Three agents are renamed, and every agent now shapes its output for the person who will act on it. Old agent names and scheduled task names keep working, but update them when you can (see **Migrating from 2.x**).

### Added
- Output shaped for the reader. Every request has two users: the person asking and the person who acts on the result. The skill reads who the output is for, what they decide, and when, confirms it in one line, and each agent shapes its page and summary for that reader: product, product marketing, leadership, growth, campaign, brand, creative, performance, or the team itself. The numbers never change between readers; only what leads and how it is worded. Each summary ends with a short note the requester can forward.
- `atlas-market-signal` agent: what creators say about the brand compared with its saved competitors. Share of voice (organic and paid kept apart), the features creators compare and where the brand won or lost (only on an explicit statement), friction, spreading language, and the comparison videos with the strongest openings. One run renders a parity read, a messaging read, reuse candidates, and a brief update. Weekly schedulable; never starts discovery.
- `atlas-quarterly-signal` agent: the quarter's one-page story for leadership, outcome first, rolled up from the findings already saved in Atlas. Cost efficiency appears only when the user gives the spend.
- `atlas-creator-profile` agent: a full-page profile of one Instagram or TikTok creator with audience, top and lowest posts, engagement, comment sentiment, brand safety by category, paid partnerships kept apart from organic mentions, recommended fees, peers, next steps, and data gaps. Read only.
- Fee calculator (`/aspire:aspire fee calculator`): sets the brand's creator rates from Aspire's recommended CPM ladder ($40 open, $80 target, $120 max per 1,000 views), saved to Atlas. Every fee the plugin shows is priced from it. Carousels and images without view counts are priced from engagement and marked as estimated. No data, no price.
- Next week's content pushes: `atlas-profile-analyst` turns an account's patterns into three pushes with day, format, angle, and a target from the account's own medians.
- Ad reuse: `atlas-profile-analyst` ranks videos on the hook patterns that work as ads and publishes a cut list with timestamps, cut lengths, placements, and rights status. Content review adds the same check for one post when the reader is a performance or creative team.
- Campaign mode for the creator brief: a timeline worked back from the launch date in three phases, first picks from the campaign shortlist, led by the latest saved findings.
- Lookalike tier in creator discovery: finds creators like the ones already delivering results.
- Launch pulse in the daily insights report while a campaign window is open: creators live, mentions and tracked hashtags, how the launch is landing, and draft verdicts.
- Weekly insights report readers: the setup question now takes several readers (team, leadership, product, product marketing, growth), each with its own section and optional Slack or email destination.

### Changed
- **Renamed** `atlas-account-analyst` to `atlas-profile-analyst`, `atlas-daily-readout` to `atlas-daily-insights-report`, and `atlas-weekly-readout` to `atlas-weekly-insights-report`. Report pages are titled "Daily Insights Report" and "Weekly Insights Report".
- Content review gives a go or no-go and a severity on every issue.
- The account review benchmarks the brand's own accounts on rates against competitors Atlas already indexes.
- Images on every page and card are embedded at twice their rendered size, from the full-size source, so they look sharp on high-density screens. Page budgets rise to 8MB of images and a 10MB page.
- The creator card follows the full brand theme, not only its accent color.
- The theme snippets take a stylesheet (`--css`) or a palette (`--palette`) instead of a "token file". Behavior is unchanged.

### Migrating from 2.x
- Scheduled tasks and messages that name the old agents still launch the renamed ones. Running `/aspire:aspire` and scheduling the readouts again offers to replace old-named tasks, so nothing is delivered twice.
- Saved Atlas data is unchanged: run keys (`readout-daily-*`, `readout-weekly-*`) and readout calibrations carry over. A weekly audience saved in the old wording maps to the new readers.
- Discovery shortlist records written before this release use the old tier numbers and are read correctly.

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
