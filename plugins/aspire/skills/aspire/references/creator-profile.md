# Creator profile (large creator card)

The full-page view of one creator: the creator card at full width, then the evidence behind
it (audience, best and weakest posts, engagement, sentiment, brand safety, partnerships, fees,
peers, next steps). Use it for a portfolio or profile view of a single creator. Everywhere else
a creator is shown, the compact card in `creator-card.md` stays the only layout.

## When it renders

| Trigger | Built by | Surface |
| ------- | -------- | ------- |
| "Full profile for @handle", "creator profile", "portfolio", "deep dive on @handle", "what would @handle cost" | `atlas-creator-profile`, launched from SKILL.md, **Creator profile** | Published page |
| An account review of a creator, when the user takes up the offer of the full profile | The same agent, on the same handle | Published page |

The profile is a page only. It is too large for an inline widget: in chat, the main thread
shows the compact card inline (from the agent's `creator-cards` block) and links the page.
Brand accounts never get a creator profile; they get an account review. The agent writes
nothing to Atlas: Next steps are recommendations on the page, not saved action items.

## Page layout

One published page per creator. Title: "{Name or @handle} Creator Profile". Republish to the
same file path on a later run for the same handle, so the link stays the same. Load
`artifact-design`, and `dataviz` for the charts, before building. Apply the saved theme per
`theme.md`, **Applying the theme**, including the **Creator profile** override there.

The page body is the page header (the theme's `header` rule when a theme is saved), then one
`<main class="acp">` holding, in order:

1. **Creator card**, full width. Build it exactly as `creator-card.md` describes (fields,
   leave-out rules, badges, tiles, stats, network chips), with its style block, and with two
   changes: leave out the thumbnails row (Top posts replaces it) and the actions row (pages
   never carry actions). The profile's style block widens it.
2. **Summary**
3. **Profile & audience**
4. **Top posts**
5. **Lowest posts**
6. **Engagement by post**
7. **What the numbers say**
8. **Comment sentiment**
9. **Brand safety**
10. **Brand partnerships**
11. **Recommended fees**
12. **How {name} compares**
13. **Next steps**
14. **Data gaps & freshness**

Every section after the card is optional: when its rule below says so, leave out the whole
`<section>`, heading included. Never show an empty section or a "no data" placeholder in place
of one; say what was missing in **Data gaps & freshness** instead.

## Data behind each section

The agent (`atlas-creator-profile`) reads the creator record and up to 100 recent posts. The
profile needs these as well:

- The creator record with its demographics: project the `instagram` or `tiktok` container
  **without** excluding the demographics blobs this time.
- On each post: `likeCount`, `commentCount`, `viewCount`, `media`, the permalink, the product
  type, `postedAt`, `analysis.brandSafety`, `analysis.commentSentimentBreakdown`, and any
  paid-partnership or brand-tag field the post field census lists.

Use only field paths the live census returns (`list_creator_search_fields`,
`list_post_search_fields`). A field the census does not list leaves its part out.

**Usable post**: a post with a non-null `likeCount`. **Engagement rate** for a post: (likes +
comments) / followers. **View rate**: views / followers, on posts with a `viewCount`. Medians,
not means, everywhere on this page except where the creator card's own rules say otherwise.
Number format follows `creator-card.md`.

| Section | Content and source | Leave out when |
| ------- | ------------------ | -------------- |
| Summary | Eyebrow: "Creator profile · {Network}", or "Creator profile · Multi-platform" with 2+ channels. `h1`: one-line verdict, "Strong fit for {goal}" style when the brand's goal makes relevance clear, else a plain description of the account ("Pacific Northwest forager and home cook"). Paragraph: 2 to 4 sentences built from the bio and the numbers below; bold the handle and each number. Meta row: combined followers (2+ channels), connected profiles, "{n} posts, {k} analyzed", "Updated {date}" (the freshness date) | Never; the verdict and the meta row always render |
| Profile & audience: facts | Up to 10 tiles, label / value / note: country, language, contact email or site listed in the bio, linked accounts, account-level reach or engaged-accounts figures, first indexed post year ("Creating since"). Each only when Atlas holds it | Fewer than 3 facts |
| Profile & audience: audience panel | Gender split, age bands (up to 5), top locations (up to 4), from the demographics fields. Each column only when its breakdown has results. Label the panel with the network it came from | No breakdown has results |
| Profile & audience: KPI strip | Median eng. rate ("of followers, per post"), median view rate ("of followers, per Reel" or "per video"), posting cadence ("~3/wk", with the change when the last 4 weeks differ from the window by 1/wk or more), engagement rank among peers ("2nd of 4") | Fewer than 3 usable posts. Drop the view cell without views and the rank cell without a peer set |
| Top posts | Top 5 usable posts by engagement rate: image, rank, rate, "Mon D · Format", caption excerpt (80 characters), stats line ("298 likes · 41 comments · 3.8K views") | Fewer than 3 usable posts. With 3 to 7, show them all here and leave out Lowest posts |
| Lowest posts | Bottom 3 usable posts by engagement rate, same fields, compact row | Fewer than 8 usable posts |
| Engagement by post | Bar per usable post, the 16 most recent in date order, height = engagement rate on an axis from 0 to the next round number above the maximum. Posts at 1.5x the median or more take `--ac-chart-1` and a value label; the rest take `--ac-chart-2`. Lede names what the highlighted posts share, from the analysis | Fewer than 5 usable posts |
| What the numbers say | 3 to 5 rows, label / sentence: Cadence, Engagement, Reach, Content driver, Fit. Each sentence carries a number. Fit only when the brand's goal or brief makes relevance clear. These are the agent's insights, not new analysis | Fewer than 3 usable posts |
| Comment sentiment | Stacked bar and legend: positive, neutral, negative shares of `commentSentimentBreakdown` counts summed over the posts. Lede: "Based on {n} comments across {k} analyzed posts." Top themes as badges only when the census exposes a comment-theme field; a safety-adjacent theme takes the warning badge | Fewer than 20 classified comments |
| Brand safety | One cell per category `analysis.brandSafety` rates, named as Atlas names them. A category rated anything but `Low Risk` on any post is flagged (warning tone); the rest are low risk. One sentence below: how many categories were low risk on every post, then each flagged category with the post count and the context in plain words | Fewer than 3 analyzed posts |
| Brand partnerships | Two groups. **Paid partnerships (confirmed)**: brands on posts marked as paid partnerships, or with a clear disclosure (#ad, #sponsored, "paid partnership with"), plus `pastBrandPartnershipPartners`, as success badges, with one line on how many paid posts and how they were disclosed. **Organic mentions (not confirmed as paid)**: other brands tagged or named without a disclosure, as outline badges, with the line "Spotted in captions or on screen. Treat these as organic visibility, not partnership history." A brand that matches a saved `competitor` record carries "(competitor)" | Neither group has an entry. Leave out an empty group |
| Recommended fees | The fee calculator (`fees.md`): a bundle of one post on each of the creator's channels that the brand's rates cover, priced from the median views of each channel's last 10 posts. Open, target, and max from the saved `fees:rate-card`, or the Aspire recommended rates. Target takes `--ac-brand`. The note lists each channel's median views and the single-channel target for the primary channel. Lede carries the rate label | The calculator gives no price for any channel (`fees.md`, **No data, no price**). A channel priced from estimated views carries "est. from engagement" and its working in the note |
| How {name} compares | Grouped bars per account: median engagement rate and median view rate, the reviewed account first and in bold, then the peer set (`account-resolution.md`, **Peer set**). Lede names the peer set and its follower band. View rate bars only when every account has views | Fewer than 3 usable peers |
| Next steps | The agent's 2 or 3 ranked recommendations, each with a priority badge: High (brand fill), Medium (secondary), Monitor (outline), a bold lead sentence and one line of reason | The agent has no recommendation |
| Data gaps & freshness | Bullets: the freshness line first ("Profiles were refreshed on {date}" or "indexed through {date}"), then the analyzed window, missing counts (saves, shares, views), how the peers were chosen, and which sections cover only one network. Also every section left out for lack of data, in one bullet | Never |

Write about the creator by name, or with "they". Never infer pronouns from a name, a photo, or
a gender breakdown. Section 12's title uses the display name, or the handle when there is none.

## Images

Embed every image as a data URI with the **Images** snippet in `creator-card.md`, page profile:
the card's avatar as `avatar`, each top post and lowest post image as `post`. An image with
`ok: false` leaves its media box empty (the tile background shows) with the format as its
`alt`; never substitute another image. Keep the page under 2MB; over that, drop Lowest posts
images first, then top posts 4 and 5. Note once in the page footer that images are a snapshot.

## Style block

Once per page, in the `<head>`, after the creator card's style block. The profile carries the
same `--ac-*` tokens as the card, so it follows the host and the saved theme the same way.

```html
<style>
.acp{--ac-card:var(--surface-2,#fff);--ac-fg:var(--text-primary,#09090b);--ac-muted:var(--text-secondary,#52525c);--ac-border:var(--border,#e4e4e7);--ac-soft:var(--secondary,#f4f4f5);--ac-brand:#1e4945;--ac-on-brand:#fff;--ac-ok-bg:#dcfce7;--ac-ok-fg:#166534;--ac-warn-bg:#fef9c3;--ac-warn-fg:#854d0e;--ac-ok-dot:#15803d;--ac-warn-dot:#ca8a04;--ac-neg:#b91c1c;--ac-neu:#d4d4d8;--ac-chart-1:#1e4945;--ac-chart-2:#7ab19f;
  max-width:800px;margin:0 auto;display:flex;flex-direction:column;gap:40px;color:var(--ac-fg);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:13px;line-height:18px}
@media (prefers-color-scheme:dark){.acp{--ac-card:var(--surface-2,hsl(222 47% 9%));--ac-fg:var(--text-primary,hsl(210 40% 98%));--ac-muted:var(--text-secondary,hsl(215 20% 65%));--ac-border:var(--border,hsl(217 33% 20%));--ac-soft:hsl(217 33% 17%);--ac-brand:#7ab19f;--ac-on-brand:#0b1f1d;--ac-ok-bg:hsl(143 64% 24%);--ac-ok-fg:hsl(142 77% 73%);--ac-warn-bg:hsl(40 70% 20%);--ac-warn-fg:hsl(48 96% 70%);--ac-ok-dot:#4ade80;--ac-warn-dot:#facc15;--ac-neg:#f87171;--ac-neu:hsl(217 20% 40%);--ac-chart-1:#a8d5c4;--ac-chart-2:#4e8e81}}
:root[data-theme="dark"] .acp,.dark .acp{--ac-card:var(--surface-2,hsl(222 47% 9%));--ac-fg:var(--text-primary,hsl(210 40% 98%));--ac-muted:var(--text-secondary,hsl(215 20% 65%));--ac-border:var(--border,hsl(217 33% 20%));--ac-soft:hsl(217 33% 17%);--ac-brand:#7ab19f;--ac-on-brand:#0b1f1d;--ac-ok-bg:hsl(143 64% 24%);--ac-ok-fg:hsl(142 77% 73%);--ac-warn-bg:hsl(40 70% 20%);--ac-warn-fg:hsl(48 96% 70%);--ac-ok-dot:#4ade80;--ac-warn-dot:#facc15;--ac-neg:#f87171;--ac-neu:hsl(217 20% 40%);--ac-chart-1:#a8d5c4;--ac-chart-2:#4e8e81}
:root[data-theme="light"] .acp{--ac-card:var(--surface-2,#fff);--ac-fg:var(--text-primary,#09090b);--ac-muted:var(--text-secondary,#52525c);--ac-border:var(--border,#e4e4e7);--ac-soft:#f4f4f5;--ac-brand:#1e4945;--ac-on-brand:#fff;--ac-ok-bg:#dcfce7;--ac-ok-fg:#166534;--ac-warn-bg:#fef9c3;--ac-warn-fg:#854d0e;--ac-ok-dot:#15803d;--ac-warn-dot:#ca8a04;--ac-neg:#b91c1c;--ac-neu:#d4d4d8;--ac-chart-1:#1e4945;--ac-chart-2:#7ab19f}
.acp *{box-sizing:border-box}
.acp .ac-card{max-width:none}
.acp h1{font-size:24px;font-weight:600;line-height:30px;letter-spacing:-.015em;margin:0;text-wrap:balance}
.acp h2{font-size:18px;font-weight:600;line-height:24px;letter-spacing:-.01em;margin:0}
.acp-sec{display:flex;flex-direction:column;gap:12px;min-width:0}
.acp-sec>header{display:flex;flex-direction:column;gap:4px}
.acp-lede{margin:0;max-width:560px;font-size:13px;line-height:19px;color:var(--ac-muted);text-wrap:pretty}
.acp-eyebrow{font-size:11px;font-weight:500;line-height:14px;color:var(--ac-muted);text-transform:uppercase;letter-spacing:.04em}
.acp-panel{background:var(--ac-card);border:1px solid var(--ac-border);border-radius:12px;box-shadow:0 1px 2px 0 rgb(0 0 0/.05);min-width:0}
.acp-note{background:var(--ac-soft);border:1px dashed var(--ac-border);border-radius:12px;padding:12px 16px;font-size:13px;line-height:19px;text-wrap:pretty}
.acp-note ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px}
.acp-summary{gap:16px}
.acp-summary>div:first-child{display:flex;flex-direction:column;gap:2px}
.acp-summary p{margin:0;font-size:16px;line-height:26px;text-wrap:pretty}
.acp b,.acp strong{font-weight:600}
.acp-meta{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:12px;line-height:16px;color:var(--ac-muted)}
.acp-meta b{color:var(--ac-fg)}
.acp-facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.acp-fact{padding:12px;display:flex;flex-direction:column;gap:4px}
.acp-fact b{font-size:14px;line-height:20px;overflow-wrap:anywhere}
.acp-fact span:last-child{font-size:12px;line-height:16px;color:var(--ac-muted)}
.acp-demo{padding:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px}
.acp-demo>div{display:flex;flex-direction:column;gap:8px;min-width:0}
.acp-kv{display:flex;justify-content:space-between;gap:8px}
.acp-kv span:last-child{color:var(--ac-muted);font-variant-numeric:tabular-nums}
.acp-track{display:flex;height:6px;border-radius:999px;overflow:hidden;background:var(--ac-soft)}
.acp-track i{display:block;height:100%}
.acp-age{display:grid;grid-template-columns:40px minmax(0,1fr) 32px;align-items:center;gap:8px}
.acp-age span:first-child{color:var(--ac-muted)}
.acp-age span:last-child{text-align:right;font-variant-numeric:tabular-nums}
.acp-cells{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));overflow:hidden}
.acp-cell{padding:16px;display:flex;flex-direction:column;gap:4px;min-width:0;box-shadow:-1px -1px 0 var(--ac-border)}
.acp-cell span:last-child{font-size:12px;line-height:16px;color:var(--ac-muted)}
.acp-big{font-size:24px;font-weight:600;line-height:30px;letter-spacing:-.015em;font-variant-numeric:tabular-nums}
.acp-fees .acp-big{font-size:28px;line-height:34px;letter-spacing:-.02em}
.acp-fees .acp-target .acp-big{color:var(--ac-brand)}
.acp-posts{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
.acp-post{overflow:hidden;display:flex;flex-direction:column;color:inherit;text-decoration:none}
.acp-media{position:relative;aspect-ratio:4/5;background:var(--ac-soft);overflow:hidden}
.acp-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.acp-rank,.acp-er{position:absolute;background:rgb(0 0 0/.55);color:#fff;font-size:11px;font-weight:600;line-height:16px;font-variant-numeric:tabular-nums}
.acp-rank{left:8px;top:8px;width:20px;height:20px;border-radius:999px;display:grid;place-content:center}
.acp-er{right:8px;bottom:8px;padding:2px 6px;border-radius:999px}
.acp-pbody{padding:10px;display:flex;flex-direction:column;gap:6px;min-width:0}
.acp-cap{font-size:12px;line-height:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.acp-pstats{font-size:11px;line-height:15px;color:var(--ac-muted);font-variant-numeric:tabular-nums}
.acp-lows{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px}
.acp-low{display:grid;grid-template-columns:72px minmax(0,1fr);overflow:hidden;color:inherit;text-decoration:none}
.acp-low .acp-media{aspect-ratio:auto;min-height:88px}
.acp-low .acp-er{left:6px;right:auto;bottom:6px;padding:1px 5px;font-size:10px}
.acp-chart{padding:20px 20px 12px}
.acp-plot{display:grid;grid-template-columns:32px minmax(0,1fr);gap:8px}
.acp-yaxis{display:flex;flex-direction:column;justify-content:space-between;height:180px;font-size:11px;line-height:12px;color:var(--ac-muted);text-align:right;font-variant-numeric:tabular-nums}
.acp-area{position:relative;height:180px;border-bottom:1px solid var(--ac-border);background:linear-gradient(var(--ac-soft),var(--ac-soft)) 0 0/100% 1px no-repeat,linear-gradient(var(--ac-soft),var(--ac-soft)) 0 50%/100% 1px no-repeat}
.acp-bars{display:flex;align-items:flex-end;gap:8px;height:100%;padding:0 4px}
.acp-bar{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;min-width:0}
.acp-bar i{display:block;width:100%;border-radius:4px 4px 0 0;background:var(--ac-chart-2)}
.acp-bar.acp-hi i{background:var(--ac-chart-1)}
.acp-bar b{font-size:11px;line-height:12px;color:var(--ac-chart-1);font-variant-numeric:tabular-nums;visibility:hidden}
.acp-bar.acp-hi b{visibility:visible}
.acp-xaxis{display:flex;gap:8px;padding:6px 4px 0}
.acp-xaxis span{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;font-size:10px;line-height:13px;color:var(--ac-muted);font-variant-numeric:tabular-nums}
.acp-rows{padding:0 20px}
.acp-rows>div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:16px;padding:14px 0}
.acp-rows>div+div{border-top:1px solid var(--ac-border)}
.acp-rows .acp-eyebrow{color:var(--ac-brand);padding-top:3px}
.acp-rows p{margin:0;font-size:14px;line-height:21px;text-wrap:pretty}
.acp-pad{padding:16px 20px;display:flex;flex-direction:column;gap:14px}
.acp-split{display:flex;height:10px;border-radius:999px;overflow:hidden;gap:2px}
.acp-split i{display:block;height:100%}
.acp-legend{display:flex;flex-wrap:wrap;gap:8px 24px}
.acp-legend span{display:flex;align-items:center;gap:6px}
.acp-legend i{width:8px;height:8px;border-radius:999px;display:block;flex-shrink:0}
.acp-group{display:flex;flex-direction:column;gap:8px}
.acp-group+.acp-group{border-top:1px solid var(--ac-border);padding-top:12px}
.acp-group p,.acp-pad>p{margin:0;font-size:12px;line-height:18px;color:var(--ac-muted);text-wrap:pretty}
.acp-group p b,.acp-pad>p b{color:var(--ac-fg)}
.acp-badges{display:flex;flex-wrap:wrap;gap:6px}
.acp .ac-badge.acp-ok{background:var(--ac-ok-bg);color:var(--ac-ok-fg)}
.acp .ac-badge.acp-warn{background:var(--ac-warn-bg);color:var(--ac-warn-fg)}
.acp .ac-badge.acp-hi{background:var(--ac-brand);color:var(--ac-on-brand)}
.acp-garm{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.acp-garm span{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;background:var(--ac-soft);font-size:12px;line-height:16px;min-width:0}
.acp-garm i{width:6px;height:6px;border-radius:999px;background:var(--ac-ok-dot);flex-shrink:0}
.acp-garm .acp-flag{background:var(--ac-warn-bg);color:var(--ac-warn-fg)}
.acp-garm .acp-flag i{background:var(--ac-warn-dot)}
.acp-peers{padding:20px}
.acp-peers .acp-legend{font-size:12px;line-height:16px;margin-bottom:16px}
.acp-peers .acp-legend i{border-radius:2px;width:10px;height:10px}
.acp-pgrid{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:16px}
.acp-pbars{height:180px;align-items:end;border-bottom:1px solid var(--ac-border)}
.acp-pbars>div{display:flex;justify-content:center;align-items:flex-end;gap:6px;height:100%}
.acp-pbars>div>div{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%;width:32px;font-size:11px;font-weight:500;font-variant-numeric:tabular-nums}
.acp-pbars i{display:block;width:100%;border-radius:4px 4px 0 0}
.acp-pnames{padding-top:8px}
.acp-pnames span{text-align:center;font-size:12px;line-height:16px;color:var(--ac-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.acp-pnames .acp-me{font-weight:600;color:var(--ac-fg)}
.acp-steps{display:flex;flex-direction:column;gap:8px}
.acp-step{padding:14px 16px;display:grid;grid-template-columns:20px auto minmax(0,1fr);gap:12px;align-items:start}
.acp-step>span:first-child{font-size:14px;font-weight:600;line-height:21px;color:var(--ac-muted);font-variant-numeric:tabular-nums}
.acp-step p{margin:0;font-size:14px;line-height:21px;text-wrap:pretty}
.acp-gaps{display:flex;flex-direction:column;gap:8px;padding:16px 20px}
@media (max-width:560px){.acp{gap:32px}.acp-rows>div{grid-template-columns:minmax(0,1fr);gap:4px}.acp-step{grid-template-columns:20px minmax(0,1fr)}.acp-step p{grid-column:2}.acp-pbars>div>div{width:20px}}
</style>
```

## Page template

Sections and repeated rows are marked with `<!-- … -->` comments, each repeated row on its own line; drop a section with its
comment when its rule says so, and drop the comments themselves. `{CARD}` is the creator card
from `creator-card.md`, filled as described in **Page layout**. Heights and widths are
percentages of the axis or the largest value, written inline.

```html
<main class="acp" aria-label="Creator profile: {HANDLE}">
  {CARD}

  <section class="acp-sec acp-summary">
    <div><span class="acp-eyebrow">Creator profile · {NETWORKS}</span><h1>{VERDICT}</h1></div>
    <p>{SUMMARY}</p>
    <div class="acp-meta"><span><b>{COMBINED}</b> combined followers</span><span>{PROFILES} connected profiles</span><span><b>{POSTS}</b> posts, {ANALYZED} analyzed</span><span>Updated {UPDATED}</span></div>
  </section>

  <section class="acp-sec">
    <header><h2>Profile &amp; audience</h2><p class="acp-lede">Account-level details, plus who follows {NAME} on {AUDIENCE_NETWORK}.</p></header>
    <div class="acp-facts">
      <!-- one per fact --><div class="acp-panel acp-fact"><span class="acp-eyebrow">{LABEL}</span><b>{VALUE}</b><span>{NOTE}</span></div>
    </div>
    <div class="acp-panel acp-demo">
      <div><span class="acp-eyebrow">Gender</span><div class="acp-kv"><span>Female {F}%</span><span>Male {M}%</span></div><div class="acp-track" role="img" aria-label="Female {F}%, male {M}%"><i style="width:{F}%;background:var(--ac-chart-1)"></i><i style="flex:1;background:var(--ac-chart-2)"></i></div></div>
      <div><span class="acp-eyebrow">Age</span>
        <!-- one per band; width relative to the largest band --><div class="acp-age"><span>{BAND}</span><div class="acp-track"><i style="width:{W}%;background:var(--ac-chart-1);border-radius:999px"></i></div><span>{PCT}%</span></div>
      </div>
      <div><span class="acp-eyebrow">Top locations</span>
        <!-- one per location --><div class="acp-kv"><span>{PLACE}</span><span>{PCT}%</span></div>
      </div>
    </div>
    <div class="acp-panel acp-cells">
      <!-- one per KPI --><div class="acp-cell"><span class="acp-eyebrow">{LABEL}</span><span class="acp-big">{VALUE}</span><span>{NOTE}</span></div>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Top posts</h2><p class="acp-lede">Ranked by engagement rate across analyzed {NETWORK} posts.</p></header>
    <div class="acp-posts">
      <!-- one per post --><a class="acp-panel acp-post" href="{PERMALINK}" target="_blank" rel="noopener"><div class="acp-media"><img src="{IMAGE}" alt="{CAPTION_EXCERPT}" loading="lazy"><span class="acp-rank">{RANK}</span><span class="acp-er">{ER}</span></div><div class="acp-pbody"><span class="acp-eyebrow">{DATE} · {FORMAT}</span><span class="acp-cap">{CAPTION_EXCERPT}</span><span class="acp-pstats">{STATS}</span></div></a>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Lowest posts</h2></header>
    <div class="acp-lows">
      <!-- one per post --><a class="acp-panel acp-low" href="{PERMALINK}" target="_blank" rel="noopener"><div class="acp-media"><img src="{IMAGE}" alt="{CAPTION_EXCERPT}" loading="lazy"><span class="acp-er">{ER}</span></div><div class="acp-pbody"><span class="acp-eyebrow">{DATE} · {FORMAT}</span><span class="acp-cap">{CAPTION_EXCERPT}</span><span class="acp-pstats">{STATS}</span></div></a>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Engagement by post</h2><p class="acp-lede">Likes plus comments as a share of followers, for each analyzed {NETWORK} post. {WHAT_STANDS_OUT}</p></header>
    <div class="acp-panel acp-chart">
      <div class="acp-plot" role="img" aria-label="{CHART_SUMMARY}">
        <div class="acp-yaxis"><span>{AXIS_MAX}%</span><span>{AXIS_MID}%</span><span>0%</span></div>
        <div class="acp-area"><div class="acp-bars">
          <!-- one per post, date order; add acp-hi at 1.5x the median or more --><div class="acp-bar" title="{DATE}: {ER}"><b>{ER}</b><i style="height:{H}%"></i></div>
        </div></div>
        <span></span>
        <div class="acp-xaxis">
          <!-- one per post, same order --><span><span>{MON}</span><span>{DAY}</span></span>
        </div>
      </div>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>What the numbers say</h2></header>
    <div class="acp-panel acp-rows">
      <!-- one per insight --><div><span class="acp-eyebrow">{LABEL}</span><p>{TEXT}</p></div>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Comment sentiment</h2><p class="acp-lede">Based on {COMMENTS} comments across {ANALYZED} analyzed posts.</p></header>
    <div class="acp-panel acp-pad">
      <div class="acp-split" role="img" aria-label="{POS}% positive, {NEU}% neutral, {NEG}% negative"><i style="width:{POS}%;background:var(--ac-chart-1)"></i><i style="width:{NEU}%;background:var(--ac-neu)"></i><i style="width:{NEG}%;background:var(--ac-neg)"></i></div>
      <div class="acp-legend"><span><i style="background:var(--ac-chart-1)"></i><b>{POS}%</b> positive</span><span><i style="background:var(--ac-neu)"></i><b>{NEU}%</b> neutral</span><span><i style="background:var(--ac-neg)"></i><b>{NEG}%</b> negative</span></div>
      <!-- if themes -->
      <div class="acp-group" style="border-top:1px solid var(--ac-border);padding-top:12px">
        <span class="acp-eyebrow">Top themes</span>
        <div class="acp-badges">
          <!-- one per theme; a safety-adjacent theme takes class="ac-badge acp-warn" --><span class="ac-badge">{THEME} · {PCT}%</span>
        </div>
      </div>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Brand safety</h2><p class="acp-lede">Every category Atlas checks, across {ANALYZED} analyzed posts.</p></header>
    <div class="acp-panel acp-pad">
      <div class="acp-garm">
        <!-- one per category; flagged ones take class="acp-flag" --><span><i></i>{CATEGORY}</span>
      </div>
      <p>{SAFETY_SENTENCE}</p>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Brand partnerships</h2><p class="acp-lede">Paid brand work on record, kept separate from brands {NAME} mentions organically.</p></header>
    <div class="acp-panel acp-pad">
      <div class="acp-group">
        <span class="acp-eyebrow">Paid partnerships (confirmed)</span>
        <div class="acp-badges">
          <!-- one per brand --><span class="ac-badge acp-ok">{BRAND}</span>
        </div>
        <p>{PAID_LINE}</p>
      </div>
      <div class="acp-group">
        <span class="acp-eyebrow">Organic mentions (not confirmed as paid)</span>
        <div class="acp-badges">
          <!-- one per brand --><span class="ac-badge ac-outline">{BRAND}</span>
        </div>
        <p>Spotted in captions or on screen. Treat these as organic visibility, not partnership history.</p>
      </div>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Recommended fees</h2><p class="acp-lede">{RATE_LABEL}: median views of the last 10 posts, bundled across {CHANNEL_COUNT} platforms, priced at ${OPEN_CPM} (open), ${TARGET_CPM} (target) and ${MAX_CPM} (max) per 1,000 views.</p></header>
    <div class="acp-panel acp-cells acp-fees">
      <div class="acp-cell"><span class="acp-eyebrow">Open</span><span class="acp-big">{OPEN}</span><span>first offer, {BUNDLE_LABEL}</span></div>
      <div class="acp-cell acp-target"><span class="acp-eyebrow">Target</span><span class="acp-big">{TARGET}</span><span>where to land</span></div>
      <div class="acp-cell"><span class="acp-eyebrow">Max</span><span class="acp-big">{MAX}</span><span>walk away above this</span></div>
    </div>
    <div class="acp-note">{FEE_NOTE}</div>
  </section>

  <section class="acp-sec">
    <header><h2>How {NAME} compares</h2><p class="acp-lede">{PEER_LEDE}</p></header>
    <div class="acp-panel acp-peers" role="img" aria-label="{PEER_SUMMARY}">
      <div class="acp-legend"><span><i style="background:var(--ac-chart-1)"></i>Engagement rate</span><span><i style="background:var(--ac-chart-2)"></i>View rate</span></div>
      <div class="acp-pgrid acp-pbars">
        <!-- one per account, reviewed account first; heights relative to the axis max --><div><div>{ER}<i style="height:{ER_H}%;background:var(--ac-chart-1)"></i></div><div>{VR}<i style="height:{VR_H}%;background:var(--ac-chart-2)"></i></div></div>
      </div>
      <div class="acp-pgrid acp-pnames">
        <!-- one per account, same order; the reviewed account takes class="acp-me" --><span>{PEER}</span>
      </div>
    </div>
  </section>

  <section class="acp-sec">
    <header><h2>Next steps</h2></header>
    <div class="acp-steps">
      <!-- one per step; badge classes: High "ac-badge acp-hi", Medium "ac-badge", Monitor "ac-badge ac-outline" --><div class="acp-panel acp-step"><span>{N}</span><span class="ac-badge acp-hi">{PRIORITY}</span><p><b>{LEAD}</b> {TEXT}</p></div>
    </div>
  </section>

  <section class="acp-note acp-gaps">
    <span class="acp-eyebrow">Data gaps &amp; freshness</span>
    <ul><!-- one per gap, freshness first --><li>{GAP}</li></ul>
  </section>
</main>
```

The "Top themes" group sits inside the sentiment panel, so its top rule is written inline.
Leave out the view rate half of each peer group when view rate is left out, and the view rate
legend entry with it.

## Rules

- Every rule in `creator-card.md`, **Rules**, applies here: no fabricated numbers, badges, or
  images; no internal ids, slugs, field names, or tool names; escape every value from Atlas or
  the web.
- Every number on the page comes from the reads above or from the agent's analysis of them.
  A section whose number cannot be computed is left out, never estimated.
- Fees come only from the fee calculator (`fees.md`), with its rate label. They are an
  estimate from public view counts; never present them as the creator's rate card.
- Charts keep the page's semantic colors for sentiment (negative stays red) and brand safety
  (flags stay warning). The theme recolors the chart series only.
