# Changelog

Official releases of the plugins in this repository. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org).

The version lives in exactly one place: `plugins[].version` in `.claude-plugin/marketplace.json` on `main`. The beta channel (`develop`) carries no version and tracks commits. This file is edited only on `release/*` branches.

## [Unreleased]

## [3.3.0] - 2026-10-09

Minor release. Adds the influencer program flows, a campaign orchestrator, and an optional Meta Ads connector, and fixes findings from an audit of the agents.

### Added
- Influencer program, from outreach to payments. Program setup and Program manager sections in `/aspire:aspire`, plus ten agents: `atlas-creator-outreach`, `atlas-creator-negotiation`, `atlas-product-fulfillment`, `atlas-affiliate-manager`, `atlas-content-library`, `atlas-content-sourcing`, `atlas-deliverable-tracker`, `atlas-roster-manager`, `atlas-program-ledger`, and `atlas-program-dashboard`. Connected mail and stores are used for drafts only; nothing is sent or ordered without an explicit confirmation. The order form page is for the team only.
- `atlas-campaign-orchestrator` agent and Orchestrator section: one hourly Next actions page across every program, creator ad campaign, discovery campaign, and report. People approve on the page; the next hourly run carries out what an Editor approved, within the limits saved at setup, and reports back in Slack.
- Optional Meta Ads connector for the brand's own paid results, alongside the Aspire Atlas connectors. Connecting it is not required for any flow.
- Atlas tool contract refreshed for `search_ads`, `list_ad_search_fields`, `list_ad_accounts`, and the new creator marketplace filters.

### Changed
- The channel connect link is shown as a plain URL when there is no widget tool, so it can be opened in Claude Code.

### Fixed
- Findings from an audit of the agents across the program, CAS campaign, and reporting flows, and the review findings on the orchestrator.

## [3.2.0] - 2026-10-05

Minor release. Works with the current Atlas server again, adds a post analysis agent, and makes the CAS campaign page the client's approval page.

### Added
- `atlas-post-analysis` agent: one published Instagram or TikTok post analyzed in depth for a brand deciding whether to sponsor, partner with, or reuse it. It covers reach and engagement with organic and paid kept apart, every brand in the video timed to the second with a still, brand safety across the industry categories with a profanity timeline and the cleanest trim, sponsor disclosure, comment sentiment, reuse rights, and the account's own baseline. Pasting the link approves fetching that one post. Findings are saved only when you approve. Interactive only.
- CAS campaign approval page: setup starts from the approved concepts (a saved pitch, a Claude artifact link, a Google Slides link, or pasted text). The client approves creators, fees, and briefs on the campaign page, which shows a four-step progress bar, a "Needs your attention" list, and tabs for creators, fees, product shipping, briefs, delays, and budget (budget is agency only). "Pull the client's decisions" reads the decisions back, and they are recorded in Atlas only after a confirmation.
- Negotiation drafts and replies in Rates and terms: one email draft per approved creator (offer, counter, accept, or chase). You paste replies back and confirm the record and next move. A reply that changes what the client approved goes back to the client.
- Creator details and product shipping after fees are approved, and the creator's turn on the brief: the brief agent lists a creator's changes in plain words for the client to approve.

### Changed
- Atlas calls use organization and profile ids in place of slugs, which the server now requires. Scheduled and resumed runs look up the profile id by its exact name and publish "setup needed" when they can't find it.
- Creator marketplace searches use the unified Instagram and TikTok search. Each network runs its own job, and a skipped network is retried or reported. TikTok searches run one region per call, in the supported countries.
- Connecting a channel already linked to another profile is reported correctly, and a connection that linked no account is no longer reported as success.
- SECURITY.md covers frame and audio extraction for post analysis, which uses a tool only when it is already installed.

### Fixed
- Every attributed Atlas call and every creator marketplace search was rejected by the current Atlas server. Both work again.

## [3.1.0] - 2026-10-02

Minor release. Three new agents, a campaign manager for creator ad campaigns, samples of every agent's page, and an audit of the decisions behind any page.

### Added
- `atlas-creator-vetting` agent: vets a list of creators from a CSV export from Aspire, pasted handles, or the Aspire app list (you sign in yourself). Each creator is checked for brand fit against the saved criteria and gets a brand safety review (industry categories, red lines, competitor partnerships, disclosure, audience signals), then a recommendation of Approve, Maybe, or Reject with evidence. Recommendations are saved as insights, and the team's call on each creator is saved so later vetting and discovery start from it. Interactive only.
- `atlas-ad-reuse` agent: ranks the brand's and creators' videos on the hooks that work as ads and publishes a cut list with timestamps, cut lengths, placements, and rights status. This was reuse mode in `atlas-profile-analyst`; launches that ask for reuse mode now go to the new agent.
- `atlas-ppa-pitch` agent: a casting deck for paid partnership ads. A questionnaire pre-filled from Atlas covers the frame, product groups and schedule, casting profile, lanes and the creator for each, production and rights, and cost. The deck is published as 16:9 slides to review first, then exported to PowerPoint with the session's PowerPoint skill, or built in Google Slides after a confirmation when that connector is connected. Follow-up rounds build on the previous pitch. Package prices are asked each time and never saved.
- CAS campaign section in `/aspire:aspire` (`cas campaign`, also `creator ad campaign` or `campaign manager`): runs a creator ad campaign through sourcing, negotiation, and briefing. It reads the campaign's state from Atlas, offers the single next step, launches the agent or section that does the work, records each client approval gate, and sets the reminder. Discovery, vetting, and the creator brief gain a creator-ads mode, and a Rates and terms section covers negotiation.
- Hook and CTA recommendations for creator ad campaigns, each with the reason behind it, and a hook review between rounds.
- Samples: ask what an agent does, or type `/aspire:aspire sample`, and the skill offers a sample of that agent's page built from invented data and themed on the most recent US holiday. Samples need no Atlas connection and save nothing.
- Decision audit: after an agent publishes a page, the skill offers an audit page with the time from request to finish and every question, option, tool call, and judgement behind the result, in order. It writes nothing to Atlas.
- Aspire users: when the Atlas account uses an Aspire email, the PPA pitch also asks how Aspire's managed services team wants to present the deck. This gives no extra access: it never unlocks data, skips a confirmation, or changes what the account's Atlas role allows.

### Changed
- `atlas-profile-analyst` no longer has a reuse mode; ad reuse is its own agent.
- The image snippet retries image fetches that hit a rate limit.
- SECURITY.md covers the two new snippet uses (creator metrics from saved search results, picking the sample's holiday), reading a vetting list through a connected browser tool, the PowerPoint and Google Slides export, and what Aspire users can and cannot do.

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

[Unreleased]: https://github.com/aspire-atlas/claude-plugin/compare/v3.3.0...HEAD
[3.3.0]: https://github.com/aspire-atlas/claude-plugin/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/aspire-atlas/claude-plugin/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/aspire-atlas/claude-plugin/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/aspire-atlas/claude-plugin/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v2.0.0
[1.1.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.1.0
[1.0.1]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.0.1
[1.0.0]: https://github.com/aspire-atlas/claude-plugin/releases/tag/v1.0.0
