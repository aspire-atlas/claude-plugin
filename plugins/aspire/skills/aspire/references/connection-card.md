# Account connection card

Inline HTML card shown whenever `connect_channel` returns a link the user must open in their
browser (`connectUrl` on start, `resultUrl` when the status is awaiting-selection). It replaces
the older "relay the link verbatim" behavior. The card describes the connection process and
carries one button that opens the link through the app's link dialog.

## Rendering

1. Load the widget tool once per session: `ToolSearch` with query
   `select:mcp__visualize__read_me,mcp__visualize__show_widget`.
2. Call `mcp__visualize__read_me` with `modules: ["mockup"]` silently before the first card.
   Never mention this call to the user.
3. Call `mcp__visualize__show_widget` with:
   - `title`: `atlas_connect_{network}_card` (for example `atlas_connect_instagram_card`), or
     `atlas_finish_{network}_card` for the awaiting-selection follow-up.
   - `loading_messages`: one short neutral message, for example `["Preparing the connection card"]`.
   - `widget_code`: the template below with the placeholders filled in.
4. Say one line in the reply after the card, nothing more: "Use the button above to sign in to
   {network}. I'll keep watching for it to finish." Do not repeat the steps in text; the card
   already shows them.

**Fallback.** Never stall onboarding waiting for the widget, and never use Markdown link
syntax (`[label](url)`): a terminal shows only the label, so the user never sees the link.

- **No widget tool** (`ToolSearch` finds no `mcp__visualize__show_widget`, as in Claude Code):
  use **Text fallback** below, with the URL in a code block so it can be copied whole.
- **The widget tool exists but the call fails** (a host that renders Markdown): use the same
  text, but put the URL on its own line as plain text instead of in a code block, so it shows as
  a clickable link.

## Text fallback

Use the same title, steps, and wording as the card, in plain text, with the full URL on its own
line in a fenced code block so it can be copied whole:

````
**{TITLE}** (brand profile: {BRAND})

Open this link in your browser:

```
{URL}
```

1. {step 1}
2. {step 2}
3. {step 3}

The person who signs in to this {NETWORK} account should open it. The link works once and
expires if nobody opens it soon; ask me for a fresh one if it stops working.
````

- `{URL}` is `connectUrl` or `resultUrl` exactly as returned, with nothing else on its line and
  no spaces or line breaks added. Never shorten, wrap, or re-encode it. The code block starts at
  the beginning of a line, never indented inside a list, so it copies as one line.
- The steps are the step sets below, as plain text without the `<li>` tags. Text has no button,
  so in the follow-up set step 1 reads "Reopen the connection page with the link above".
- The same text covers the start link, the awaiting-selection follow-up (`resultUrl`), and a
  fresh link issued after one expired or the provider declined.
- After it, say nothing more until a poll reports something, as with the card.

## Placeholders

| Placeholder | Value |
| ----------- | ----- |
| `{URL}` | `connectUrl` or `resultUrl` exactly as returned; never edit, shorten, or re-encode it |
| `{NETWORK}` | Instagram, TikTok, or YouTube (display name, never the channel code) |
| `{ICON}` | `ti-brand-instagram`, `ti-brand-tiktok`, or `ti-brand-youtube` |
| `{BRAND}` | The profile display name from `create_profile` / `get_status` |
| `{TITLE}` | Start: `Connect {NETWORK} to Atlas`. Follow-up: `Finish connecting {NETWORK}` |
| `{STEPS}` | Three `<li>` items from the step sets below |
| `{BUTTON}` | Start: `Open {NETWORK} sign in`. Follow-up: `Finish picking accounts` |

Step set, start (`connectUrl`):

```html
<li>Open the secure sign-in page in your browser</li>
<li>Sign in to {NETWORK} and approve access</li>
<li>Pick the accounts to link, then come back here</li>
```

Step set, follow-up (`resultUrl`, status awaiting-selection):

```html
<li>Reopen the connection page with the button below</li>
<li>Choose the {NETWORK} accounts to link to {BRAND}</li>
<li>Confirm, then come back here</li>
```

## Template

Keep the structure and CSS variables as they are; they follow the host theme in light and dark
mode. Only the placeholders change. The `<a href>` is intercepted by the host and opens the
browser through its link dialog, so no script is needed.

```html
<h2 class="sr-only">Card guiding the user to connect their {NETWORK} account to Aspire Atlas, with a button that opens the sign-in link.</h2>
<div style="max-width: 520px; background: var(--surface-2); border: 0.5px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem;">
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-accent); color: var(--text-accent); display: flex; align-items: center; justify-content: center;" aria-hidden="true"><i class="ti {ICON}" style="font-size: 22px;"></i></div>
    <div>
      <h3 style="margin: 0;">{TITLE}</h3>
      <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">Brand profile: {BRAND}</p>
    </div>
  </div>
  <ol style="margin: 0 0 14px; padding-left: 1.25rem; font-size: 14px; line-height: 1.6; color: var(--text-primary);">
    {STEPS}
  </ol>
  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
    <a href="{URL}" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none; background: var(--fill-primary); color: var(--on-primary, #fff); border-radius: var(--radius); padding: 8px 14px; font-size: 14px; font-weight: 500;">{BUTTON} <i class="ti ti-external-link" aria-hidden="true"></i></a>
    <span style="font-size: 13px; color: var(--text-muted);"><i class="ti ti-clock" aria-hidden="true" style="vertical-align: -2px;"></i> Atlas is waiting for the sign in to finish</span>
  </div>
  <p style="margin: 12px 0 0; font-size: 12px; color: var(--text-muted);">One-time link. If it stops working, ask for a fresh one here.</p>
</div>
```

## Rules

- One card per link. Render the start card once per channel; render the follow-up card only
  when a poll reports awaiting-selection with a `resultUrl`. Never re-render the same link.
- Never put the URL in the reply text when the card rendered; the button is the single path.
  Without the card, the code block in **Text fallback** is the single path.
- Never modify the URL. It carries a one-time token.
- Keep the reply after the card to one line. While polling, the only other output allowed is
  the short "Still waiting on the {network} sign in." line from Phase 4.2, and the **Expired
  links** question below, the one question allowed during the wait.
- If the provider declines (`denied-at-provider`), the old card's link is dead: issue a fresh
  start and render a fresh start card.
- **Expired links.** When a poll's `message` says to stop and check with the user (nobody has
  opened the link), stop polling and say the link may have expired. Ask with `AskUserQuestion`:
  "Send a fresh {NETWORK} link?" Options: "Send a fresh link (Recommended)" / "I opened it, keep
  waiting" / "Skip {NETWORK} for now". A fresh link is a new start with `channel` and
  `asProfileId`, shown as a new start card or text fallback. "Keep waiting" resumes polling the
  same `elicitationId`, and is offered once per link: when the stop message comes back for the
  same link, ask again with only "Send a fresh link (Recommended)" and "Skip {NETWORK} for now".
  "Skip" ends that channel as skipped (Phase 4.2, steps 6 and 7).
