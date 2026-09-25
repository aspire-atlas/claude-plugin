# Creator card

The one way this plugin shows a creator. Any flow that identifies, lists, ranks, compares, or
recommends a creator renders it with this card: a single lookup, search and marketplace
results, the discovery shortlist, the creator brief, and any creator named in a review or an
account analysis. The layout is the compact Aspire creator card; only the placeholders change.

## Where it renders

| Surface | How | Actions row |
| ------- | --- | ----------- |
| Main thread, 1 to 6 creators | Inline widget, one `show_widget` call holding all the cards in a grid | Shown |
| Main thread, 7 or more creators | Published page (Visual output in SKILL.md); more than 12 leads with a chart | Hidden |
| Agents (brief, discovery, account analyst, content review) | Inside the agent's published page | Hidden |
| No widget tool, or the call fails | The Markdown fallback below | n/a |

Agents never call `show_widget`; the main thread can. When an agent returns a creator the user
should see in chat, the main thread renders the card from the agent's numbers.

**Agent hand-off.** An agent whose creators the main thread shows inline ends its summary
with a fenced JSON block labelled `creator-cards`: an array, at most six entries, one per
person, holding the values already worked out under the rules below, with omitted sections
left out as keys rather than set to null.

```json
[{"handle":"…","network":"instagram","name":"…","descriptor":"…","avatarUrl":"…",
  "topics":["…","…"],"topicsMore":2,"audience":"…","fit":92,
  "channels":[{"network":"instagram","followers":"3.1K","primary":true,
    "stats":[{"value":"3.1K","label":"Followers"}],
    "posts":[{"url":"…","thumbUrl":"…","video":true,"alt":"…"}]}],
  "flowChips":["#1","Tier 3"],"badges":["…"],"safety":{"title":"Brand safe","note":"No flags","tone":"ok"},
  "sentiment":{"pct":88,"tone":"ok"}}]
```

The main thread renders from this block and does not query Atlas again for these creators.

## Inline rendering

1. Load the widget tool once per session: `ToolSearch` with query
   `select:mcp__visualize__read_me,mcp__visualize__show_widget`.
2. Call `mcp__visualize__read_me` with `modules: ["mockup"]` silently before the first card,
   unless this session already did for the connection card. Never mention it.
3. Call `mcp__visualize__show_widget` with:
   - `title`: `atlas_creator_card_{handle}` for one creator, `atlas_creator_cards` for several.
   - `loading_messages`: one short neutral message, for example `["Loading creator profile"]`.
   - `widget_code`: the style block once, then one card per creator inside
     `<div class="ac-grid">`.
4. Reply after the card with at most three bullets the card cannot show (why this creator, what
   is missing, the next step). Never repeat the card's numbers in text.

If `read_me` documents a different way for a widget to send a message back to the chat than
`sendPrompt(text)`, use that one in the action buttons. If it documents none, leave the
actions row out.

## Page rendering

Put the style block in the page `<head>` once and the cards wherever the page structure calls
for them, inside `<div class="ac-grid">`. The page's own tokens are not used by the card; the
card carries Aspire's. Page mechanics are the readouts' (`readout.md`, **Page mechanics**):
download the profile picture and thumbnails, resize (profile picture 112px, thumbnails 240px),
embed as JPEG data URIs, because published pages cannot load `cdn.aspire.io`. Leave out the
actions row. Flow-specific detail goes in the `{DETAILS}` slot, never in extra markup around
the card.

## Data: what fills each section

Pull the account with `search_creators` (`terms` on `username`, `fields: ["username",
"followersCount","verified","country","instagram","tiktok","youtube"]`, `exclude:
["instagram.audienceDemographics","instagram.followerDemographics"]`). A hit is one person;
`channels` holds one entry per network Atlas has linked for them. Pull the last 12 posts per
channel with `search_posts` (`terms` on `author.username`, `exists mediaKind` to drop stories,
sort `postedAt` desc) projecting `url`, `postedAt`, `mediaKind`, `likeCount`, `commentCount`,
`viewCount`, `media`, `instagram.mediaProductType`, `instagram.permalink`, `analysis.brandSafety`,
`analysis.commentSentimentBreakdown`, `analysis.aestheticTags`.

**A section with no data behind it is left out.** Never estimate, never show a dash, never
fill in from web copy. The one exception is the header row, which always shows.

| Section | Placeholder | Source | Rule |
| ------- | ----------- | ------ | ---- |
| Profile picture | `{AVATAR}` | `instagram.profilePictureUrl`, `tiktok.profileImage`, `youtube.profileImageUrl` of the primary channel | Missing or failed load: `{INITIALS}` on a muted circle |
| Network badge on the picture | `{NET_ICON}` | Primary channel's `network` | Icon from the icon table |
| Handle | `{HANDLE}` | `username` | No `@` in the card; escape HTML |
| Subtitle | `{SUBTITLE}` | Name · descriptor, per **Subtitle** below | No name and no descriptor: leave the line out |
| Topics | `{TOPICS}`, `{TOPICS_MORE}` | Top two `analysis.aestheticTags` by post count across the 12 posts, or `youtube.youtubeTopicCategories` | Count tags case-insensitively and show each in its most common spelling. A tag must appear on 3 or more posts. `+N` counts the other tags that pass; omit when zero |
| Audience | `{AUDIENCE}` | Instagram: `instagram.creatorEngagedAccountsBreakdowns` (engaged accounts, top gender share, top age band). TikTok: `tiktok.audienceGenders` and `tiktok.audienceAges` with the follower count | Only when a gender or age breakdown has results; they are often empty. Format `33.4K, Female 79%, 25-34` |
| Fit ring | `{FIT}` | The fit score the current flow computed or read from Atlas (discovery `fitScore`) | Only a 0 to 100 score from a stated rubric. Flows without one leave the ring out; the brief shows its Strong or Partial read as a badge instead |
| Network chips | `{CHIPS}` | One chip per entry in `channels` with its `followersCount` | Only when there are two or more channels. The primary one is `aria-selected="true"` |
| Badges | `{BADGES}` | See **Badges** below | Flow chips, then up to two card badges, then an outline `+N` chip |
| Brand safety tile | `{SAFETY}` | `analysis.brandSafety` on the posts, plus the flow's **safety** risk flags only | Needs 3 or more analyzed posts, or a safety flag. See **Brand safety** below |
| Sentiment tile | `{SENTIMENT}` | Sum of `commentSentimentBreakdown.positive.count` over the sum of positive, neutral, and negative counts, across the posts | Needs 20 or more classified comments. Label "{pct}% positive" / "Comments". Success tone at 70% and up, neutral from 40% to 69%, warning below 40% |
| Stats | `{STATS}` | Per network, below | Two or three cells; drop a cell with no data |
| Thumbnails | `{THUMBS}` | Three posts: the flow's evidence posts first, then the most recent | `media.thumbnailUrl`, falling back to `media.mediaUrl`. Play glyph on video. Each links to its permalink |
| Details | `{DETAILS}` | The calling flow | Pages only. Empty by default |
| Actions | `{ACTIONS}` | Fixed | Inline only |

**Badges.** Two kinds, in this order:

1. **Flow chips**, which never count toward the limit: the discovery shortlist number (`#12`)
   and tier (`Tier 3`, or `Added by team`), the brief's `Strong fit` / `Partial fit`, or
   `Accepted`. Source goes in `{DETAILS}`, not a chip.
2. **Card badges**, at most two shown: "Competitor" (only when the user asked about a
   `competitor` handle; one is never carded as a candidate), "Repeat partner" (a `partner`
   calibration names the handle, or discovery tier 1), "Verified", then `instagram.badges`.
   Atlas spells some badges two ways (`high_hook` and "Strong hooks"): turn snake_case into
   words, then drop case-insensitive duplicates. The rest go into the `+N` chip, whose
   `title` lists them.

**Brand safety.** The tile answers one question: is this creator's content safe for the brand?

- Count **n** = the Atlas categories rated anything but `Low Risk` on any of the posts, plus the
  flow's safety flags: a `red_line` match, a competitor mention, and on a content review
  page only, a hard-rule hit (`review:` keys never count anywhere else).
- n = 0 with 3 or more analyzed posts: "Brand safe" / "No flags", success tone.
- n ≥ 1: "{n} flag" or "{n} flags" / the first one's short name (≤ 4 words, e.g. "Profanity",
  "Competitor mention"), warning tone. All of them go in `{DETAILS}` under "Flags".
- Fewer than 3 analyzed posts and no safety flag: leave the tile out.
- Every other risk flag (dormant, no contact route, near the follower ceiling, an engagement
  pattern) is not a safety question. It goes in `{DETAILS}` under "Notes" and never in the tile.

**Subtitle.** `{name} · {descriptor}`, both taken from Atlas text, never written fresh.

- Name: the display name (`instagram.name`, `tiktok.displayName`, `youtube.displayName`). When
  it contains `|`, `•` or `·`, the part before is the name and the part after is the
  descriptor. A display name that is only the handle counts as no name.
- Descriptor, when the display name gave none: the bio's first phrase if it is 2 to 4 words
  that describe the person ("Forager & cook", "UGC Creator"); otherwise none.
- Drop the descriptor when the name already contains it, case-insensitively, so the line never
  repeats itself.

Stats per network, in order:

| Network | Cell 1 | Cell 2 | Cell 3 |
| ------- | ------ | ------ | ------ |
| Instagram | Followers (`followersCount`) | Eng. rate: mean of (likes + comments) / followers over the 12 posts; with fewer than 3 usable posts, `instagram.reelsInteractionRate` labeled "Reel eng." | Avg. eng.: mean of likes + comments over the 12 posts |
| TikTok | Followers | Eng. rate (`tiktok.engagementRate`) | Median views (`tiktok.medianViews`) |
| YouTube | Subscribers | Avg. views over the 12 posts | Eng. rate: mean of (likes + comments) / views |

A post with a null `likeCount` (hidden likes) is not usable for engagement: leave it out of
the means rather than counting it as 0. Cell 3 needs 3 usable posts too, or it is dropped.

Number format: whole numbers under 1,000 (`43`, `143`); one decimal from 1K to under 100K
(`3.1K`, `33.4K`); none from 100K (`134K`); millions the same way (`1.2M`, `12M`). Rates one
decimal (`4.6%`).

**Several networks.** Render one `.ac-net` block per channel, each with its own stats and
thumbnails; the header, badges, and tiles are the person's and show once. The primary channel
is the one the user asked about or the flow searched; its block is shown and the others carry
`hidden`. The chip script switches blocks. With one channel, leave the chips out and render
one `.ac-net` block with no `hidden`.

## Actions (inline only)

Each button sends a chat message; the message is a request, not an approval. Whatever it
leads to follows the normal confirmation rules in SKILL.md.

| Button | Message sent | Handled by |
| ------ | ------------ | ---------- |
| Draft Outreach | `Draft outreach to @{HANDLE} on {NETWORK}` | **Creator card actions** in SKILL.md |
| Add to list (user-plus) | `Add @{HANDLE} on {NETWORK} to a campaign shortlist` | **Creator card actions** in SKILL.md |
| Save (heart) | `Save @{HANDLE} on {NETWORK} to the watch list` | **Creator card actions** in SKILL.md |

Escape `'` in the handle as `\'` inside the `onclick` string.

## Style block

Once per widget or page. Colors follow the host theme in light and dark mode where the host
defines the variable, and fall back to the Aspire tokens where it does not.

```html
<style>
.ac-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;align-items:start}
.ac-card{--ac-card:var(--surface-2,#fff);--ac-fg:var(--text-primary,#09090b);--ac-muted:var(--text-secondary,#52525c);--ac-border:var(--border,#e4e4e7);--ac-soft:var(--secondary,#f9fafb);--ac-tile:#f5f5f5;--ac-brand:#1e4945;--ac-on-brand:#fff;--ac-ok-bg:#dcfce7;--ac-ok-fg:#166534;--ac-warn-bg:#fef9c3;--ac-warn-fg:#854d0e;--ac-neutral-bg:#f3f4f6;--ac-neutral-fg:#1f2937;
  max-width:360px;background:var(--ac-card);color:var(--ac-fg);border:1px solid var(--ac-border);border-radius:12px;box-shadow:0 1px 2px 0 rgb(0 0 0/.05);padding:20px;box-sizing:border-box;display:flex;flex-direction:column;gap:16px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:13px;line-height:18px}
@media (prefers-color-scheme:dark){.ac-card{--ac-card:var(--surface-2,hsl(222 47% 9%));--ac-fg:var(--text-primary,hsl(210 40% 98%));--ac-muted:var(--text-secondary,hsl(215 20% 65%));--ac-border:var(--border,hsl(217 33% 20%));--ac-soft:hsl(217 33% 17%);--ac-tile:hsl(217 33% 17%);--ac-brand:#7ab19f;--ac-on-brand:#0b1f1d;--ac-ok-bg:hsl(143 64% 24%);--ac-ok-fg:hsl(142 77% 73%);--ac-warn-bg:hsl(40 70% 20%);--ac-warn-fg:hsl(48 96% 70%);--ac-neutral-bg:hsl(217 33% 17%);--ac-neutral-fg:hsl(210 40% 80%)}}
:root[data-theme="dark"] .ac-card,.dark .ac-card{--ac-card:var(--surface-2,hsl(222 47% 9%));--ac-fg:var(--text-primary,hsl(210 40% 98%));--ac-muted:var(--text-secondary,hsl(215 20% 65%));--ac-border:var(--border,hsl(217 33% 20%));--ac-soft:hsl(217 33% 17%);--ac-tile:hsl(217 33% 17%);--ac-brand:#7ab19f;--ac-on-brand:#0b1f1d;--ac-ok-bg:hsl(143 64% 24%);--ac-ok-fg:hsl(142 77% 73%);--ac-warn-bg:hsl(40 70% 20%);--ac-warn-fg:hsl(48 96% 70%);--ac-neutral-bg:hsl(217 33% 17%);--ac-neutral-fg:hsl(210 40% 80%)}
:root[data-theme="light"] .ac-card{--ac-card:var(--surface-2,#fff);--ac-fg:var(--text-primary,#09090b);--ac-muted:var(--text-secondary,#52525c);--ac-border:var(--border,#e4e4e7);--ac-soft:#f9fafb;--ac-tile:#f5f5f5;--ac-brand:#1e4945;--ac-on-brand:#fff;--ac-ok-bg:#dcfce7;--ac-ok-fg:#166534;--ac-warn-bg:#fef9c3;--ac-warn-fg:#854d0e;--ac-neutral-bg:#f3f4f6;--ac-neutral-fg:#1f2937}
.ac-card *{box-sizing:border-box}
.ac-card svg{flex-shrink:0}
.ac-head{display:flex;align-items:flex-start;gap:14px}
.ac-av{position:relative;width:56px;height:56px;flex-shrink:0}
.ac-av img,.ac-av .ac-ini{width:56px;height:56px;border-radius:999px;object-fit:cover;display:block;background:var(--ac-tile)}
.ac-ini{place-content:center;font-weight:600;font-size:18px;color:var(--ac-muted)}
.ac-av .ac-ini{display:none}.ac-av.ac-noimg .ac-ini{display:grid}.ac-av.ac-noimg img{display:none}
.ac-netbadge{position:absolute;right:-3px;bottom:-3px;width:22px;height:22px;border-radius:999px;background:var(--ac-card);border:1px solid var(--ac-border);display:grid;place-content:center}
.ac-id{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;padding-top:2px}
.ac-handle{font-size:14px;font-weight:600;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ac-sub{color:var(--ac-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ac-line{display:flex;align-items:center;gap:6px;min-width:0}
.ac-line>svg{color:var(--ac-muted)}
.ac-line .ac-clip{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ac-line .ac-more{color:var(--ac-muted);flex-shrink:0}
.ac-fit{width:44px;height:44px;border-radius:999px;border:2px solid var(--ac-brand);color:var(--ac-brand);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.ac-fit b{font-size:14px;font-weight:600;line-height:16px}
.ac-fit span{font-size:9px;font-weight:500;line-height:10px;text-transform:uppercase;letter-spacing:.02em}
.ac-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ac-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;border:1px solid var(--ac-border);background:var(--ac-card);color:var(--ac-fg);font:inherit;font-size:12px;font-weight:500;cursor:pointer}
.ac-chip[aria-selected="true"]{background:var(--ac-brand);border-color:var(--ac-brand);color:var(--ac-on-brand)}
.ac-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ac-badge{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:6px;background:var(--ac-soft);border:1px solid transparent;font-size:12px;font-weight:600;line-height:16px;white-space:nowrap}
.ac-badge.ac-outline{background:transparent;border-color:var(--ac-border)}
.ac-tiles{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:8px}
.ac-tile{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--ac-border);border-radius:8px;min-width:0}
.ac-tile i{width:28px;height:28px;border-radius:999px;display:grid;place-content:center;flex-shrink:0;background:var(--ac-ok-bg);color:var(--ac-ok-fg)}
.ac-tile.ac-warn i{background:var(--ac-warn-bg);color:var(--ac-warn-fg)}
.ac-tile.ac-neutral i{background:var(--ac-neutral-bg);color:var(--ac-neutral-fg)}
.ac-tile div{display:flex;flex-direction:column;min-width:0}
.ac-tile b{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ac-tile span{font-size:12px;line-height:16px;color:var(--ac-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ac-net{display:flex;flex-direction:column;gap:16px}
.ac-net[hidden]{display:none}
.ac-stats{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);border-top:1px solid var(--ac-border);border-bottom:1px solid var(--ac-border);padding:12px 0}
.ac-stat{display:flex;flex-direction:column;gap:2px;align-items:center;text-align:center;padding:0 8px}
.ac-stat+.ac-stat{border-left:1px solid var(--ac-border)}
.ac-stat b{font-size:18px;font-weight:600;line-height:24px;letter-spacing:-.01em}
.ac-stat span{font-size:12px;line-height:16px;color:var(--ac-muted)}
.ac-thumbs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.ac-thumb{position:relative;display:block;aspect-ratio:1;border-radius:8px;overflow:hidden;background:var(--ac-tile)}
.ac-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ac-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:999px;background:rgb(0 0 0/.45);display:grid;place-content:center;color:#fff;pointer-events:none}
.ac-details{border-top:1px solid var(--ac-border);padding-top:12px;display:flex;flex-direction:column;gap:6px;color:var(--ac-fg)}
.ac-details:empty{display:none}
.ac-details dt{font-size:12px;color:var(--ac-muted)}
.ac-details dd{margin:0 0 4px}
.ac-actions{display:flex;align-items:center;gap:8px}
.ac-btn{height:40px;border-radius:8px;border:1px solid var(--ac-border);background:var(--ac-card);color:var(--ac-fg);font:inherit;font-size:14px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.ac-btn.ac-main{flex:1;min-width:0;background:var(--ac-brand);border-color:var(--ac-brand);color:var(--ac-on-brand)}
.ac-btn.ac-icon{width:40px;flex-shrink:0}
.ac-btn:focus-visible,.ac-chip:focus-visible,.ac-thumb:focus-visible{outline:2px solid var(--ac-brand);outline-offset:2px}
</style>
```

## Card template

Optional sections are marked with `<!-- if … -->` comments; drop the whole element when its
rule in the data table says so, and drop the comments themselves. Repeat `.ac-net` per channel.

```html
<article class="ac-card" aria-label="Creator {HANDLE} on {NETWORK}">
  <div class="ac-head">
    <div class="ac-av">
      <img src="{AVATAR}" alt="" loading="lazy" onerror="this.parentNode.classList.add('ac-noimg')">
      <span class="ac-ini" aria-hidden="true">{INITIALS}</span>
      <span class="ac-netbadge" title="{NETWORK}">{NET_ICON}</span>
    </div>
    <div class="ac-id">
      <div>
        <div class="ac-handle">{HANDLE}</div>
        <!-- if subtitle --><div class="ac-sub">{SUBTITLE}</div>
      </div>
      <!-- if topics --><div class="ac-line">{ICON_TAG}<span class="ac-clip">{TOPICS}</span><span class="ac-more">{TOPICS_MORE}</span></div>
      <!-- if audience --><div class="ac-line">{ICON_USERS}<span class="ac-clip">{AUDIENCE}</span></div>
    </div>
    <!-- if fit --><div class="ac-fit" title="Fit score"><b>{FIT}</b><span>fit</span></div>
  </div>

  <!-- if 2+ channels -->
  <div class="ac-chips" role="tablist" aria-label="Creator profiles">
    <button type="button" class="ac-chip" role="tab" aria-selected="true" data-net="instagram" onclick="var c=this.closest('.ac-card');c.querySelectorAll('.ac-chip').forEach(function(b){b.setAttribute('aria-selected',b===this)},this);c.querySelectorAll('.ac-net').forEach(function(n){n.hidden=n.dataset.net!==this.dataset.net},this)">{ICON_INSTAGRAM}<span>{FOLLOWERS}</span></button>
    <!-- one button per channel; only the primary has aria-selected="true", the rest "false" -->
  </div>

  <!-- if badges -->
  <div class="ac-badges">
    <span class="ac-badge">{BADGE_1}</span>
    <span class="ac-badge">{BADGE_2}</span>
    <span class="ac-badge ac-outline">+{BADGE_MORE}</span>
  </div>

  <!-- if safety or sentiment -->
  <div class="ac-tiles">
    <div class="ac-tile {SAFETY_TONE}"><i>{ICON_SAFETY}</i><div><b>{SAFETY_TITLE}</b><span>{SAFETY_NOTE}</span></div></div>
    <div class="ac-tile {SENTIMENT_TONE}"><i>{ICON_SMILE}</i><div><b>{SENTIMENT_PCT}% positive</b><span>Comments</span></div></div>
  </div>

  <div class="ac-net" data-net="instagram">
    <!-- if stats -->
    <div class="ac-stats">
      <div class="ac-stat"><b>{STAT_1}</b><span>{STAT_1_LABEL}</span></div>
      <div class="ac-stat"><b>{STAT_2}</b><span>{STAT_2_LABEL}</span></div>
      <div class="ac-stat"><b>{STAT_3}</b><span>{STAT_3_LABEL}</span></div>
    </div>
    <!-- if thumbnails -->
    <div class="ac-thumbs">
      <a class="ac-thumb" href="{POST_URL}" target="_blank" rel="noopener" aria-label="{POST_ALT}"><img src="{THUMB}" alt="" loading="lazy" onerror="this.remove()"><!-- if video --><span class="ac-play">{ICON_PLAY}</span></a>
      <!-- three thumbs; fewer than three posts leaves the empty cells out -->
    </div>
  </div>

  <!-- pages only, when the flow has detail -->
  <dl class="ac-details">{DETAILS}</dl>

  <!-- inline only -->
  <div class="ac-actions">
    <button type="button" class="ac-btn ac-main" onclick="sendPrompt('Draft outreach to @{HANDLE} on {NETWORK}')">Draft Outreach</button>
    <button type="button" class="ac-btn ac-icon" aria-label="Add to list" title="Add to list" onclick="sendPrompt('Add @{HANDLE} on {NETWORK} to a campaign shortlist')">{ICON_USER_PLUS}</button>
    <button type="button" class="ac-btn ac-icon" aria-label="Save" title="Save" onclick="sendPrompt('Save @{HANDLE} on {NETWORK} to the watch list')">{ICON_HEART}</button>
  </div>
</article>
```

`{SAFETY_TONE}` and `{SENTIMENT_TONE}` are empty for success, `ac-warn`, or `ac-neutral`.
`{ICON_SAFETY}` is `{ICON_SHIELD_CHECK}` when brand safe and `{ICON_SHIELD_ALERT}` otherwise.
`{DETAILS}` is `<dt>`/`<dd>` pairs, for example `<dt>Angle</dt><dd>…</dd>`.

## Icons

Paste as-is. 24px viewBox, stroke icons, `currentColor`.

| Placeholder | Size | SVG |
| ----------- | ---- | --- |
| `{ICON_INSTAGRAM}` (also `{NET_ICON}` at 13px) | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>` |
| `{ICON_TIKTOK}` | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3a5 5 0 0 0 5 5"/><path d="M16 3v12a5 5 0 1 1-5-5"/></svg>` |
| `{ICON_YOUTUBE}` | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/></svg>` |
| `{ICON_TAG}` | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></svg>` |
| `{ICON_USERS}` | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` |
| `{ICON_SHIELD_CHECK}` | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>` |
| `{ICON_SHIELD_ALERT}` | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>` |
| `{ICON_SMILE}` | 14 | `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>` |
| `{ICON_PLAY}` | 12 | `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>` |
| `{ICON_USER_PLUS}` | 16 | `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/></svg>` |
| `{ICON_HEART}` | 16 | `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>` |

`{NET_ICON}` is the primary network's icon at `width="13" height="13"` and `stroke-width="2"`.

## Markdown fallback

When the widget cannot render, one block per creator, same leave-out rules:

```markdown
**@{HANDLE}** · {SUBTITLE} · Fit {FIT}
{NETWORK} {FOLLOWERS} · {STAT_2_LABEL} {STAT_2} · {STAT_3_LABEL} {STAT_3}
{SAFETY_TITLE} ({SAFETY_NOTE}) · {SENTIMENT_PCT}% positive comments
{BADGE_1} · {BADGE_2} · Recent: [post 1]({POST_URL}) · [post 2]({POST_URL}) · [post 3]({POST_URL})
```

Then offer the three actions as one line: "Reply 'draft outreach', 'add to a shortlist', or
'save' for any of these."

## Rules

- Never fabricate a number, badge, or image. A missing field removes its section; the rules
  above are the only derivations allowed.
- Never show an internal id, slug, field name, or tool name on a card. Flow text copied into
  `{DETAILS}` (rationale, risk flags) often quotes field names: rewrite them as plain words
  ("past brand partners list", not `instagram.pastBrandPartnershipPartners`).
- CDN images expire. Inline cards use the URL with the `onerror` fallback; pages embed data
  URIs and note the expiry once in the footer.
- One card per person, not per channel. Two hits that are the same person (the same
  `channels` entry) render once.
- Escape every value that comes from Atlas or the web (`&`, `<`, `>`, `"`, `'`) before placing
  it in the template.
