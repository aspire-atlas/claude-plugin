# Connecting Aspire Atlas (Phase 1 connection and tool permissions)

Used by SKILL.md's Phase 1 when steps 1 to 3 of 1.1 find no Atlas tools, by Phase 2 + 3's
auth check for the connector card, and by the first-run guide and every schedule setup for 1.6.
Section numbers are Phase 1's.

## Contents

- [1.1 Detect (continued)](#11-detect-continued)
- [1.3 If not connected: guided add](#13-if-not-connected-guided-add)
- [1.3b If installed but not enabled in this chat](#13b-if-installed-but-not-enabled-in-this-chat)
- [1.3c If installed but needs sign in](#13c-if-installed-but-needs-sign-in)
- [1.4 Re-check](#14-re-check)
- [1.6 Always allow Atlas tools](#16-always-allow-atlas-tools)

## 1.1 Detect (continued)

4. If still nothing and `ListConnectors` is available, call it **exactly once** with
   keywords `["aspire"]` only. Never include `atlas` as a keyword: it substring-matches
   Atlassian and puts an unrelated row on the card. This single call both returns the
   connector state and renders the "Connectors that could help" card with a Connect
   button. Do not call `SuggestConnectors` or `ListConnectors` again afterwards; every
   extra call renders a duplicate card.
   Safety filter: if the result still contains more than one entry, keep only the one whose
   lowercased, space-stripped name equals `aspireatlas` or `atlas` (so never
   `aspireatlasorganizationadmin`), and never mention the others. Classify the surviving entry:
   - `enabledInChat: true` but no tools found: treat as a load glitch; call
     `RefreshMcpTools` once and retry step 1.
   - `enabledInChat: false`: state is **installed, not active here**. Go to 1.3b.
   - `connected: false`, `installState: needs_reconnect`, or `installState: unknown`:
     state is **needs sign in**. If `enabledInChat` is also false, 1.3b covers both steps.
     Otherwise go to 1.3c.
   - No surviving entry: state is **not installed**. Go to 1.3.
5. Only conclude **not installed** when every check above comes up empty.

**One card rule:** exactly one connector card per run, and always one. Every invocation of
`/aspire:aspire` or every "connected" reply that still fails detection renders a fresh card
via the single `ListConnectors` call, so the Connect button is always right above the
prompt. Never point the user at a card from an earlier message. The only thing to avoid is
a second call within the same run.

Always call the connector by its product name, **Aspire Atlas**, in every user-facing
message. Never surface raw field names, flags, or other connectors' names.

**Prefer the card over instructions.** When a connector card is on screen, the whole
user-facing message is one line pointing at it. Give the manual Settings steps only when no
card rendered (for example, `ListConnectors` is unavailable).

Do not attempt to reach `https://atlas.aspire.io/mcp` with an HTTP client or a web fetch.
The connection must come through the Claude connector, not an ad hoc request.

## 1.3 If not connected: guided add

The Aspire Atlas connector ships inside this plugin, so a missing connection almost always
means it is not signed in or not enabled in this chat (1.3b and 1.3c). Only when the plugin's
own connector is absent from the connector list (uninstalled or blocked by an admin) send the
manual steps below with `SendUserMessage` (or in the reply), then wait. Never suggest adding a
second connector when an "Aspire Atlas" entry already exists; that creates a duplicate.

```
Aspire Atlas isn't connected yet. Two minute fix:

1. Open Settings in the Claude app, then Connectors.
2. If Aspire Atlas is listed, click Connect and sign in with your Atlas account.
   If it is not listed, choose Add custom connector:
   Name: Aspire Atlas
   URL: https://atlas.aspire.io/mcp
   Save, then click Connect and sign in.
3. Come back here and reply "connected" (or run /aspire:aspire again).
```

Adapt step 1 when the user is in Claude Code: give
`claude mcp add --transport http atlas https://atlas.aspire.io/mcp` and tell them to run
`/mcp` to authenticate.

## 1.3b If installed but not enabled in this chat

With a card on screen (the normal case):

```
Click Connect on the Aspire Atlas card above, sign in if asked, then reply "connected".
```

Fallback, no card rendered:

```
Aspire Atlas is installed but not active in this chat.

1. Open the connectors menu in the message composer and turn on Aspire Atlas.
2. If it asks you to sign in, go to Settings, then Connectors, then Aspire Atlas,
   and click Connect.
3. Reply "connected". If the toggle isn't offered, start a new chat with
   Aspire Atlas enabled and run /aspire:aspire again.
```

## 1.3c If installed but needs sign in

With a card on screen:

```
Click Connect on the Aspire Atlas card above and sign in with your Atlas account,
then reply "connected".
```

Fallback, no card rendered:

```
Aspire Atlas is installed but not signed in.

1. Open Settings, then Connectors, then Aspire Atlas.
2. Click Connect (or Reconnect) and sign in with your Atlas account.
3. Reply "connected" when done.
```

## 1.4 Re-check

When the user replies, or on the next `/aspire:aspire`, repeat 1.1.

- Live: continue to Phase 2.
- Still missing after the user says they added it: ask them to confirm the connector shows a
  green or "Connected" state in Settings, and to start a new chat if it was added mid session
  (some clients only load new connectors on a fresh conversation). Do not loop more than twice;
  after that, point them to Atlas support and stop.

## 1.6 Always allow Atlas tools

(1.5, recording the outcome and the tool prefix, is in SKILL.md.)

A scheduled task runs in a fresh session with nobody there to approve a tool call. When an Aspire
Atlas tool is still set to ask for permission, the run stops at its first Atlas call and waits,
so a list build, a screening run, or a report never finishes. The task's own "Automatically
approve" setting does not cover this: the connector's tool permissions are a separate setting.
The plugin can't read or change that setting, so the user sets it once.

**Held back.** This is the one list of Aspire Atlas tools that stay on Needs approval; every other
mention points here. It is every tool in the Destructive tools table of the Atlas tools
reference, plus the two other tools that change a profile or its billing. Scheduled runs never
call any of them.

| Tool | What the user sees it do |
| ---- | ------------------------ |
| `delete_profile` | Delete a brand profile |
| `update_profile` | Change a brand profile |
| `unlink_channel` | Unlink a social account |
| `remove_hashtags` | Stop tracking hashtags |
| `supersede_calibration` | Replace a saved fact in brand memory |
| `retract_calibration` | Withdraw a saved fact from brand memory |
| `set_brand_instruction` | Change the brand instruction |
| `switch_billing_account` | Switch billing |

Organization and member tools are on the separate Aspire Atlas Organization Admin connector,
which scheduled runs never use: leave its permissions as they are.

**When to show it.** The plugin can't tell whether the user has already set it, so show it only
where it matters, never as a standing reminder:

- **First run.** With the starter page, when Phase 2 + 3 step 5 publishes it (an unconfigured
  organization, someone present). Show the block below after the page's link and carry on; it is
  not a question and never blocks a phase.
- **Before a scheduled task is created.** With the question that approves it: a flow's own
  schedule confirmation (readouts, market signal, creator discovery, the orchestrator's hourly
  task), or the setup answer that is the standing approval for the tasks a flow creates later
  (the program's P9, the content library's P9, a CAS campaign's C6, the orchestrator's X6). The
  approving option names the setting, for example "Create it (Atlas tools are set to Always
  allow)", or "Create them (…)" for more than one task. Keep the flow's own decline option
  ("Not now"); the block already shows the steps, so no extra option repeats them.
- Never in an unattended or scheduled run. An unattended run never asks.

**What to say** (the Claude app and Cowork). Describe the held-back tools by the second column of
**Held back**, never by tool name:

```
One setting so scheduled runs finish on their own: Aspire Atlas's tools on Always allow.

1. Open Settings, then Connectors, then Aspire Atlas.
2. Under tool permissions, choose Always allow, then set these back to Needs approval:
   delete a brand profile, change a brand profile, unlink a social account, stop tracking
   hashtags, replace or withdraw a saved fact, change the brand instruction, and switch
   billing. Scheduled runs never use them.

If you can't change it (on a Team or Enterprise plan your workspace admin may set connector
permissions), ask your Claude workspace admin. Without it, a scheduled run stops at its first
Atlas step and waits for an approval nobody is there to give. Saves to Atlas still follow the
plugin's rules: you confirm them in chat, or in the setup you approved for a scheduled run.
```

**Other connectors a scheduled run uses.** Allow only what the run calls, never the whole
connector, and add these lines to the block for each connector the schedule routes to:

- **Slack:** Always allow posting a message and reading channels. Everything else stays on Needs
  approval.
- **Email (Gmail or Outlook):** Always allow reading and creating drafts. Sending stays on Needs
  approval, with one exception: a readout routed to email sends it, so that schedule needs
  sending allowed. When a program also reads creator replies in the same mailbox (outreach, the
  orchestrator), offer Slack for the readout instead, so sending can stay held back. Delete
  always stays on Needs approval.
- **Meta Ads:** Always allow its read tools only. Anything that creates, changes, pauses, or
  spends on ads stays on Needs approval.

**In Claude Code**, replace the steps with: run `/permissions`, then add an Allow rule for the
Atlas server under the prefix recorded in 1.5 without its trailing `__` (most installs show
`mcp__Aspire_Atlas`; clients that namespace plugin servers show
`mcp__plugin_aspire_Aspire_Atlas`), and an Ask rule for each tool in **Held back** under that
same prefix (for example `mcp__Aspire_Atlas__delete_profile`). Ask rules win over the Allow rule.
Tell the user to copy the prefix their own Atlas tools show in `/permissions` or `/mcp`, never to
guess it. Save the rules to user settings so every project gets them. For another connector,
add Allow rules for the individual tools above, never a server-wide rule.

Allowing the tools doesn't change what this plugin may write. The skill and every agent still
confirm each Atlas write with `AskUserQuestion` when someone is present, and unattended runs
write only what their setup or an Editor already approved.
