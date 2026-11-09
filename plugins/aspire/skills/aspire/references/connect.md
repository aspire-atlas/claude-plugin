# Connecting Aspire Atlas (Phase 1 when no Atlas tools are found)

Used by SKILL.md's Phase 1 when steps 1 to 3 of 1.1 find no Atlas tools, and by Phase 2 + 3's
auth check for the connector card. Section numbers are Phase 1's.

## Contents

- [1.1 Detect (continued)](#11-detect-continued)
- [1.3 If not connected: guided add](#13-if-not-connected-guided-add)
- [1.3b If installed but not enabled in this chat](#13b-if-installed-but-not-enabled-in-this-chat)
- [1.3c If installed but needs sign in](#13c-if-installed-but-needs-sign-in)
- [1.4 Re-check](#14-re-check)

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
