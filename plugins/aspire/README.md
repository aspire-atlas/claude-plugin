# Aspire Atlas plugin

Onboarding for the Atlas platform (https://atlas.aspire.io). Takes a new or returning user from "not connected" to first insights on their brand's social accounts.

## Components

| Component | Name | Purpose |
| --------- | ---- | ------- |
| MCP server | `Aspire Atlas` | Atlas data connection at `https://atlas.aspire.io/mcp` (HTTP, OAuth). Tools appear as `mcp__Aspire_Atlas__*`. |
| Skill | `/aspire:aspire` | Six phase onboarding flow: connection check, auth and org selection, org status, profile and social connect, brand context capture, first insights |
| Agent | `atlas-account-analyst` | Evaluates accounts and produces first insights (Phase 6). Reviews the brand's connected accounts, or any Instagram or TikTok handle the user names, resolving and refreshing it in Atlas when the held data is over a day old |
| Agent | `atlas-creator-brief` | Weekly content creation brief: reviews recent posts, sets deliverables and guardrails, sources creators through Aspire discovery, prices each engagement, publishes a visual brief |
| Agent | `atlas-daily-readout` | Yesterday's posts against the 28-day baseline: anomalies, red-line hits, follower delta, what changed since the last readout. Compact page, Slack and email delivery, findings saved to Atlas. Schedulable. |
| Agent | `atlas-weekly-readout` | Last week against the prior week and 8-week median: top and bottom posts with the pattern behind them, format and cadence mix, open action items, three ranked next steps. Visual page, Slack and email delivery, findings saved to Atlas. Schedulable. |

## Setup

1. Install the plugin. The Aspire Atlas connector is bundled; do not add it again as a custom connector.
2. Start a new chat with Aspire Atlas enabled, sign in when prompted, and type `/aspire:aspire`.

No environment variables are required. Authentication is handled by the connector's OAuth flow.

Plugin skills are namespaced, so the canonical command is `/aspire:aspire`. The skill also triggers on `/aspire` and on the phrases below. If Aspire Atlas is installed but off in the current chat, or not signed in, the skill detects it and walks the user through turning it on and connecting.

## Usage

- `/aspire:aspire` runs the full onboarding, resuming at the right phase for existing organizations.
- Account review: the first-insights phase asks which account to cover - the brand's connected accounts, or a network and handle the user types. A typed handle that Atlas does not hold, or holds from more than 24 hours ago, is fetched through Aspire discovery first; naming the handle is the approval for that fetch, and TikTok discovery makes paid vendor calls.
- `/aspire:aspire agents` lists every subagent in the plugin with a one-line purpose and its trigger phrases, then asks which one to run and hands off to that agent's flow (connection check, profile, and confirmations included). Read from the `agents/` folder at run time, so it stays current as agents are added. No Atlas connection is needed to see the list; picking an agent starts one.
- Trigger phrases: "get started with Atlas", "connect Atlas", "onboard my brand", "connect my Instagram to Atlas".
- Creator brief: "create a content brief for next week", "find creators to make this", "what should we post next week". Runs the `atlas-creator-brief` agent for a connected brand. Marketplace discovery is only run with the user's explicit choice because it can start paid work.
- Readouts: "what happened yesterday", "how did last week go", "weekly readout", "daily readout", "schedule the readouts". First use runs a six-question setup (delivery times and timezone, Slack channel and email recipients, flag thresholds, lead metric, escalation rule, audience). Answers are saved to the brand's Atlas memory so every teammate and every scheduled run uses the same setup without re-asking.

## Scheduling the readouts

Readouts are designed to run on a schedule. The skill offers to create both schedules after the first successful run; the steps below are the manual path.

**Prerequisites**

- Readout setup completed once for the brand (the skill will not schedule before it).
- Aspire Atlas enabled for scheduled tasks in the Claude app settings. Add Slack and Gmail too if readouts are routed there.
- The scheduled task's approval setting set to "Automatically approve". A scheduled run has nobody present to approve a prompt and will stall otherwise.

**Create the two scheduled tasks (Cowork)**

1. In the Claude desktop app, open Scheduled tasks and choose New.
2. Name the first task `Atlas daily readout: {brand}`. Set it to repeat daily at the time saved in setup, in your timezone. Paste the daily prompt below with the brand, handles, and networks filled in.
3. Name the second task `Atlas weekly readout: {brand}`. Set it to repeat weekly on the saved day and time. Paste the weekly prompt below.
4. Turn on completion notifications so the summary reaches your phone.

Daily prompt:

```
Run the Atlas daily readout for {brand} (handles: {@handle1 on instagram, @handle2 on tiktok}).
Use the Aspire Atlas connection and the brand's saved readout calibrations for the window,
thresholds, lead metric, and delivery routing. Launch the atlas-daily-readout agent in
unattended mode. Do not ask questions. Do not state today's date in the launch message; the
agent reads the current date from the shell clock in the brand's saved timezone and reports
yesterday. If setup is incomplete or Atlas needs a fresh sign in, publish the "setup needed"
card and stop. Deliver only to the destinations saved in the brand's readout routing.
```

Weekly prompt:

```
Run the Atlas weekly readout for {brand} (handles: {@handle1 on instagram, @handle2 on tiktok})
for the previous Monday to Sunday. Use the Aspire Atlas connection and the brand's saved
readout calibrations for thresholds, lead metric, audience, and delivery routing. Launch the
atlas-weekly-readout agent in unattended mode. Do not ask questions. Do not state today's date
in the launch message; the agent reads the current date from the shell clock in the brand's
saved timezone and reports the most recent completed Monday to Sunday. If setup is incomplete
or Atlas needs a fresh sign in, publish the "setup needed" card and stop. Deliver only to the
destinations saved in the brand's readout routing.
```

**Changing the schedule or the setup**

- Times, Slack channel, recipients, thresholds, and audience live in Atlas brand memory. Ask the skill to "change readout setup"; each change is confirmed and versioned, and takes effect on the next scheduled run. Then edit the task's time in the Scheduled tasks list if the delivery time changed.
- Pause or delete either task from the Scheduled tasks list at any time. Saved setup is unaffected.

**Claude Code users**: the same two prompts work as scheduled tasks or as manual runs (`/aspire:aspire` then "run the weekly readout"). Local cron inside a session is not supported; it does not survive the session.

## Safety rules

- Every action that changes Atlas state is confirmed through a multiple-choice question first, never plain text.
- Destructive actions (`delete_profile`, `unlink_channel`, superseding or retracting a calibration, removing hashtags, changing the brand instruction) each get their own confirmation with the safe option first, and never run during onboarding on the skill's own initiative.
- Paid discovery (`lookup_*`, marketplace search) runs only on the user's explicit choice.
- Scheduled (unattended) runs never ask questions, never run destructive or paid tools, and deliver only to destinations saved during readout setup. Incomplete setup produces a "setup needed" page, not a guess.
- The tool surface is re-verified per release; unlisted tools that change state are treated as destructive until documented. See `skills/aspire/references/atlas-tools.md`.

## Changes

See the repository [CHANGELOG](../../CHANGELOG.md). Official releases are tagged `v<version>`; the beta channel tracks the `develop` branch by commit.
