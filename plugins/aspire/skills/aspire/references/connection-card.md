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

**Fallback.** If `ToolSearch` finds no `mcp__visualize__show_widget` tool, or the call fails,
relay the link as a plain clickable Markdown link with the same one-line instruction. Never
stall onboarding waiting for the widget.

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
- Never modify the URL. It carries a one-time token.
- Keep the reply after the card to one line. While polling, the only other output allowed is
  the short "Still waiting on the {network} sign in." line from Phase 4.2.
- If the provider declines (`denied-at-provider`), the old card's link is dead: issue a fresh
  start and render a fresh start card.
