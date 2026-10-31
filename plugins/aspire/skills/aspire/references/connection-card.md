# Account connection card

Inline HTML card shown whenever `connect_channel` returns a link the user must open in their
browser (`connectUrl` on start, `resultUrl` when the status is awaiting-selection). It replaces
the older "relay the link verbatim" behavior. The card describes the connection process and
shows the network's logo beside the animated Aspire Atlas mark, lists what Atlas will do, and carries one button that opens the link through the app's link dialog.

## When the host renders the connect widget

`connect_channel` ships its own connect widget for hosts that render MCP Apps. When the tool
result shows that widget (the host displays the connect panel with the sign-in button), build
no card: say one line, "Use the button above to sign in to {network}. I'll keep watching for it
to finish.", and keep polling per Phase 4.2 (the same `elicitationId` calls, the same
**Expired links** rule). Do the same for the awaiting-selection `resultUrl`. When the host
shows no widget (Claude Code's terminal, or any host that returns plain text only), or you
cannot tell, use the card and the **Fallback** below exactly as before.

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
- The three steps are always the same plain sign-in steps: start "Open the secure sign-in page in
  your browser", "Sign in to {NETWORK} and approve access", "Pick the accounts to link, then come
  back here". Follow-up: "Reopen the connection page with the link above", "Choose the {NETWORK}
  accounts to link to {BRAND}", "Confirm, then come back here". The card shows what Atlas will do
  instead of steps; the text has no such list.
- The same text covers the start link, the awaiting-selection follow-up (`resultUrl`), and a
  fresh link issued after one expired or the provider declined.
- After it, say nothing more until a poll reports something, as with the card.

## Placeholders

| Placeholder | Value |
| ----------- | ----- |
| `{URL}` | `connectUrl` or `resultUrl` exactly as returned; never edit, shorten, or re-encode it |
| `{NETWORK}` | Instagram, TikTok, or YouTube (display name, never the channel code) |
| `{ICON}` | `ti-brand-instagram`, `ti-brand-tiktok`, or `ti-brand-youtube` |
| `{NETWORK_COLOR}` | The network's logo tile fill: Instagram `#D4537E`, TikTok `#111111`, YouTube `#E24B4A`. The icon on it is always white |
| `{ASPIRE_MARK}` | The whole contents of `${CLAUDE_PLUGIN_ROOT}/assets/aspire-animated-small.svg`, pasted inline unchanged, with `width="84" height="84"` in place of its 512 values (see **The two logos**) |
| `{BRAND}` | The profile display name from `create_profile` / `get_status` |
| `{TITLE}` | Start: `Connect {NETWORK} to Aspire Atlas`. Follow-up: `Finish connecting {NETWORK}` |
| `{WOULD_LIKE}` | Three `<li>` items from the sets below |
| `{BUTTON}` | Start: `Open {NETWORK} sign in`. Follow-up: `Finish picking accounts` |
| `{CANCEL}` | `Skip {NETWORK} for now`, the text the Cancel button sends to the chat |

Set, start (`connectUrl`):

```html
<li style="display: flex; gap: 8px; align-items: baseline;"><i class="ti ti-check" style="color: var(--text-success);" aria-hidden="true"></i>Read the posts and account details you choose</li>
<li style="display: flex; gap: 8px; align-items: baseline;"><i class="ti ti-check" style="color: var(--text-success);" aria-hidden="true"></i>Link them to the {BRAND} brand profile</li>
<li style="display: flex; gap: 8px; align-items: baseline;"><i class="ti ti-check" style="color: var(--text-success);" aria-hidden="true"></i>Keep reading new posts so insights stay current</li>
```

Set, follow-up (`resultUrl`, status awaiting-selection): same markup with "Reopen the connection page", "Choose the {NETWORK} accounts to link to {BRAND}", and "Confirm, then come back here".

## The two logos

The card shows who is connecting to whom, as two logos side by side with a link between them: the
network's logo on the left, the animated Aspire Atlas mark on the right.

- **Network logo.** A rounded tile in the network's own color with the white Tabler brand icon
  (`{ICON}`), as in the template. Never draw a network's logo by hand, never use its gradient, and
  keep the tile's color to the `{NETWORK_COLOR}` values above.
- **Aspire mark.** The small animated mark (**artifact-standard.md**, section 1, widget variant),
  never recolored or edited, shown at 84px to match the network tile. Its squares shuffle on their
  own and hold still under reduced motion. One copy per card.
- **Placement.** The card is a widget, so the mark's usual top-right corner does not apply. It takes
  the right-hand tile of the logo pair. The source line is not added to this card (artifact-standard.md,
  Does not apply to).

## Template

Keep the structure and CSS variables as they are; they follow the host theme in light and dark
mode. Only the placeholders change. The `<a href>` is intercepted by the host and opens the
browser through its link dialog, so no script is needed for the button; Cancel sends a chat message. Cancel and the sign-in button share one row at the same height and never wrap.
The header's faint grid is made from the theme's hairline color, so it works in both modes.

```html
<h2 class="sr-only">Card for connecting {NETWORK} to Aspire Atlas: the two logos linked, what Atlas will do, and a button that opens the sign-in link.</h2>
<div style="max-width: 440px; margin: 0 auto; background: var(--surface-2); border: 0.5px solid var(--border); border-radius: 16px; overflow: hidden;">
  <div style="position: relative; padding: 28px 0 20px; background-color: var(--surface-1); background-image: linear-gradient(var(--border) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--border) 0.5px, transparent 0.5px); background-size: 28px 28px; background-position: center;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 14px;">
      <div style="width: 84px; height: 84px; border-radius: 22px; background: {NETWORK_COLOR}; color: #fff; display: flex; align-items: center; justify-content: center; border: 0.5px solid var(--border);" aria-label="{NETWORK}" role="img"><i class="ti {ICON}" style="font-size: 46px;" aria-hidden="true"></i></div>
      <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--surface-2); border: 0.5px solid var(--border-strong); color: var(--text-secondary); display: flex; align-items: center; justify-content: center;" aria-hidden="true"><i class="ti ti-link" style="font-size: 16px;"></i></div>
      <div style="width: 84px; height: 84px; border-radius: 22px; overflow: hidden; border: 0.5px solid var(--border); line-height: 0;">{ASPIRE_MARK}</div>
    </div>
  </div>
  <div style="padding: 18px 24px 20px;">
    <h3 style="margin: 0 0 14px; text-align: center;">{TITLE}</h3>
    <div style="border-top: 0.5px solid var(--border); padding-top: 14px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 500;">Aspire Atlas would like to</p>
      <ul style="list-style: none; margin: 0 0 14px; padding: 0; display: grid; gap: 6px; font-size: 14px; color: var(--text-primary);">
        {WOULD_LIKE}
      </ul>
      <p style="margin: 0 0 16px; font-size: 12px; color: var(--text-muted);">You sign in on {NETWORK} and pick the accounts to link. Atlas never posts or messages for you.</p>
    </div>
    <div style="display: flex; align-items: stretch; justify-content: flex-end; gap: 10px; flex-wrap: nowrap;">
      <button type="button" onclick="sendPrompt('{CANCEL}')" style="display: inline-flex; align-items: center; justify-content: center; height: 36px; padding: 0 14px; font-size: 14px; white-space: nowrap;">Cancel</button>
      <a href="{URL}" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; box-sizing: border-box; text-decoration: none; background: var(--fill-primary); color: var(--on-primary, #fff); border-radius: var(--radius); padding: 0 14px; font-size: 14px; font-weight: 500; white-space: nowrap;">{BUTTON} <i class="ti ti-external-link" aria-hidden="true"></i></a>
    </div>
  </div>
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
