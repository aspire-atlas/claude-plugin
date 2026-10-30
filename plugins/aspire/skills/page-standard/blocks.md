# Page blocks

The parts every agent page is built from. Each block holds one part of the skeleton in
`SKILL.md`, section 1, with the fields that part needs and the markup the self-check reads. Every
page that uses them reaches the same standard. No two pages need to look alike, because the
blocks set what each part holds and the order of its evidence, never the page's layout. The flow's
reference and this question's reader decide which blocks the page uses, where they sit, and what
goes between them.

Read this file with `SKILL.md`. That file says what each part must say. This file says how to
build it.

## 1. Rules for every block

- **Tokens only.** A block takes its colors, type, and corners from the page tokens in
  `skills/aspire/references/theme.md` (**Page tokens**): `--bg`, `--surface`, `--text`, `--muted`,
  `--border`, `--brand`, `--on-brand`, `--brand-ink`, `--accent`, `--accent-ink`, `--chart-1` to
  `--chart-6`, `--font-display`, `--font-body`, `--font-mono`, and `--radius`. The style block
  (section 2) opens with the Aspire Atlas default tokens. The page's own tokens come after it, and a
  saved brand theme comes after those, so each later set wins and the defaults fill only what the
  others leave out. That is how a page for the brand takes the brand's own colors and type, with
  no change to any block.
- **Status keeps its own color.** Verdicts, pass and fail chips, above and below baseline, and
  alerts use the `--pb-ok`, `--pb-warn`, `--pb-bad`, and `--pb-flat` tokens from section 2. The
  brand theme never changes them (`theme.md`, **What the theme changes**).
- **Light and dark.** The default tokens and the theme both set a dark mode. Blocks never set a
  color outside the tokens, so they follow the mode with nothing extra.
- **Phone width.** Every block works at 360px with no sideways page scroll. Grids wrap, tables turn
  into one card per row under 640px (put `data-label` on every cell), and only the storyboard strip
  scrolls sideways, inside its own box.
- **The look is the flow's.** Blocks carry no page frame, no max width, and no section spacing.
  The page sets those. A block's own class names start with `pb-`; restyle a block for one page by
  adding a class of the page's own, never by editing the style block.
- **The shared style block goes in once.** Paste the style block (section 2) as the first style
  in the page `<head>`, before the page's own tokens and the theme block. Paste only the blocks the
  page uses; the style for a block the page does not use is harmless.
- **Atlas design system.** The default tokens are the Aspire Atlas palette and type (the same as
  the Atlas Starter Guide, `skills/aspire/references/first-run.md`). The names follow the shadcn
  roles (`--bg` background, `--surface` card, `--text` foreground, `--muted` muted foreground,
  `--border` border, `--brand` primary). A page built with Tailwind keeps its own utility classes
  for layout. The blocks need no Tailwind of their own, so they also work in a page without it.
- **Plain markup.** No script in any block. Charts are inline SVG. Images are data URIs made by
  the creator card's **Images** snippet (`skills/aspire/references/creator-card.md`), never remote
  URLs. The page source stays ASCII.
- **One part, one block.** Never split a part across two blocks or put two parts in one. The
  self-check reads `data-page` on the scope, the decisions, the next steps, and the method; every
  block also carries `data-block` with its name, which the check ignores.

| Block | Skeleton part | `data-block` | Section |
| ----- | ------------- | ------------ | ------- |
| Reader and scope header | 1 | `scope` | 3.1 |
| Coverage strip | 1 (inside the header) and 7 | `coverage` | 3.2 |
| Answer headline | 2 | `answer` | 3.3 |
| Insight card | 3 | `insight` | 3.4 |
| Decisions block | 5 | `decisions` | 3.5 |
| Ranked next steps table | 4 | `next-steps` | 3.6 |
| Creator evidence | 6 | `creator` | 3.7 |
| Post evidence card | 6 | `post` | 3.8 |
| Storyboard strip | 6 | `storyboard` | 3.9 |
| Rights row | 6 | `rights` | 3.10 |
| Method panel | 7 | `method` | 3.11 |
| What's missing panel | 8 | `missing` | 3.12 |
| "Atlas can draft next" footer | 9 | `draft-next` | 3.13 |
| Leadership split wrapper | Reader rule | `split` | 3.14 |
| Test plan block | Evidence standard | `test-plan` | 3.15 |
| Score row | 6 | `score-row` | 3.16 |
| Timeline | 4 | `timeline` | 3.17 |
| Quote | 6 | `quote` | 3.18 |

A page also has sections of its own that no block covers: a comparison table, a 2x2 map, a scatter
chart, a calculator, a section menu. They belong to this question, so the flow builds them. Use
the same tokens and the `pb-card`, `pb-chip`, `pb-label`, and `pb-table` classes, so they sit with
the blocks in one look (section 6).

## 2. Default tokens and the style block

Paste it first, then the page's own tokens, then the theme block (`theme.md`, **Page tokens**).
The status tokens (`--pb-*`) are set only here, so they stay the same whatever comes after.

The default tokens name the Atlas fonts. A page that keeps them loads them before the style block
(a saved theme loads its own `fonts.href` instead):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Sans:wght@500;600;700&display=swap">
```

<!-- block-style -->
```html
<style>
/* Aspire Atlas default page tokens. The page's own tokens and a saved brand theme (theme.md, Page tokens) come after this block and win. */
:root{--bg:#F5F7F7;--surface:#FFFFFF;--text:#152022;--muted:#56656A;--border:#D8E0E1;
  --brand:#1E5C58;--on-brand:#FFFFFF;--brand-ink:#1B5652;--accent:#C8E36B;--on-accent:#152022;--accent-ink:#4F6B12;
  --chart-1:#2E766F;--chart-2:#6B8A86;--chart-3:#A86B12;--chart-4:#4F6B12;--chart-5:#7A5C9E;--chart-6:#9AA8AB;
  --font-display:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;--font-body:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif;
  --font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;--radius:10px;
  --pb-ok:#1F7A4D;--pb-ok-bg:#E3F2EA;--pb-warn:#8A5A00;--pb-warn-bg:#FBF0D9;--pb-bad:#B42318;--pb-bad-bg:#FCE8E6;--pb-flat:#56656A;--pb-flat-bg:#EEF2F2}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0E1415;--surface:#162022;--text:#E6EDEE;--muted:#9BAAAD;--border:#2A3739;
  --brand:#5DB3A9;--on-brand:#0B1A19;--brand-ink:#7FCBC1;--accent:#C8E36B;--on-accent:#152022;--accent-ink:#C8E36B;
  --chart-1:#5DB3A9;--chart-2:#8FA8A4;--chart-3:#E0A94F;--chart-4:#C8E36B;--chart-5:#B79AD8;--chart-6:#6B7B7E;
  --pb-ok:#6FCF97;--pb-ok-bg:#14301F;--pb-warn:#E0A94F;--pb-warn-bg:#33270F;--pb-bad:#F28B82;--pb-bad-bg:#3A1A18;--pb-flat:#9BAAAD;--pb-flat-bg:#1C2729;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0E1415;--surface:#162022;--text:#E6EDEE;--muted:#9BAAAD;--border:#2A3739;
  --brand:#5DB3A9;--on-brand:#0B1A19;--brand-ink:#7FCBC1;--accent:#C8E36B;--on-accent:#152022;--accent-ink:#C8E36B;
  --chart-1:#5DB3A9;--chart-2:#8FA8A4;--chart-3:#E0A94F;--chart-4:#C8E36B;--chart-5:#B79AD8;--chart-6:#6B7B7E;
  --pb-ok:#6FCF97;--pb-ok-bg:#14301F;--pb-warn:#E0A94F;--pb-warn-bg:#33270F;--pb-bad:#F28B82;--pb-bad-bg:#3A1A18;--pb-flat:#9BAAAD;--pb-flat-bg:#1C2729;color-scheme:dark}
/* Page blocks (skills/page-standard/blocks.md). Colors come only from the tokens above. */
[data-block]{box-sizing:border-box;min-width:0}
[data-block] *,[data-block] *::before,[data-block] *::after{box-sizing:inherit}
.pb-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius,10px);padding:16px 18px}
.pb-h{font-family:var(--font-display);font-stretch:var(--font-display-stretch,100%);font-weight:600;line-height:1.25;margin:0 0 10px;text-wrap:balance}
.pb-label{font:500 .72rem/1.3 var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.pb-muted{color:var(--muted)}
.pb-num{font-family:var(--font-mono);font-variant-numeric:tabular-nums}
.pb-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))}
.pb-chip{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:2px 9px;font:500 .78rem/1.5 var(--font-body);border:1px solid var(--border);background:var(--bg);color:var(--text);white-space:nowrap;max-width:100%}
@media (max-width:640px){.pb-chip{white-space:normal}}
.pb-ok{background:var(--pb-ok-bg);color:var(--pb-ok);border-color:transparent}
.pb-warn{background:var(--pb-warn-bg);color:var(--pb-warn);border-color:transparent}
.pb-bad{background:var(--pb-bad-bg);color:var(--pb-bad);border-color:transparent}
.pb-flat{background:var(--pb-flat-bg);color:var(--pb-flat);border-color:transparent}
/* 3.1 scope and 3.2 coverage */
.pb-scope{display:grid;gap:8px;font-size:.92rem}
.pb-scope-line{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline}
.pb-scope-line b{font-weight:600}
.pb-coverage{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.pb-coverage .pb-chip b{font-family:var(--font-mono);font-weight:500}
.pb-coverage .pb-gap{border-style:dashed;color:var(--muted);background:transparent;white-space:normal}
/* 3.3 answer */
.pb-answer{display:grid;gap:8px;margin:0}
.pb-answer h1{font-family:var(--font-display);font-stretch:var(--font-display-stretch,100%);font-size:clamp(1.6rem,4.2vw,2.4rem);line-height:1.15;font-weight:700;margin:0;text-wrap:balance}
.pb-answer p{margin:0;font-size:1.06rem;color:var(--muted);max-width:46em}
/* 3.4 insight */
.pb-insight{display:grid;gap:10px;align-content:start}
.pb-insight .pb-claim{font-family:var(--font-display);font-weight:600;font-size:1.08rem;line-height:1.3;margin:0}
.pb-insight dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:0;font-size:.92rem}
.pb-insight dt{color:var(--muted)}
.pb-insight dd{margin:0}
.pb-insight .pb-so{margin:0;padding:8px 12px;border-left:3px solid var(--brand-ink);background:var(--bg);border-radius:0 calc(var(--radius,10px) - 4px) calc(var(--radius,10px) - 4px) 0}
.pb-insight svg{display:block;width:100%;max-width:440px;height:auto}
.pb-verdict{display:grid;gap:6px;font-size:.9rem}
.pb-verdict p{margin:0}
/* 3.5 decisions */
.pb-decisions ol{margin:0;padding:0;list-style:none;display:grid;gap:8px}
.pb-decisions li{display:grid;grid-template-columns:1fr auto;gap:4px 12px;align-items:start;padding:10px 12px;border:1px solid var(--border);border-radius:calc(var(--radius,10px) - 2px);background:var(--bg)}
.pb-decisions .pb-meta{grid-column:1/-1;font-size:.86rem;color:var(--muted)}
.pb-decisions .pb-due{font:500 .82rem var(--font-mono);color:var(--brand-ink);white-space:nowrap}
/* 3.6 and 3.15 tables */
.pb-table{width:100%;border-collapse:collapse;font-size:.92rem}
.pb-table th{text-align:left;font:500 .72rem/1.3 var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:8px 10px;border-bottom:1px solid var(--border)}
.pb-table td{padding:10px;border-bottom:1px solid var(--border);vertical-align:top}
.pb-table tr:last-child td{border-bottom:0}
.pb-rank{font:600 .9rem var(--font-mono);color:var(--brand-ink)}
@media (max-width:640px){.pb-table thead{display:none}.pb-table,.pb-table tbody,.pb-table tr,.pb-table td{display:block;width:100%}
  .pb-table tr{border:1px solid var(--border);border-radius:calc(var(--radius,10px) - 2px);padding:6px 10px;margin-bottom:8px}
  .pb-table td{border:0;padding:4px 0}.pb-table td[data-label]::before{content:attr(data-label);display:block;font:500 .68rem var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}}
/* 3.7 to 3.10 evidence */
.pb-post{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:start}
.pb-post img,.pb-frame img{display:block;width:100%;height:auto;border-radius:calc(var(--radius,10px) - 4px);background:var(--bg);object-fit:cover}
.pb-post img{aspect-ratio:9/16}
.pb-post-body{display:grid;gap:6px;font-size:.9rem;min-width:0}
.pb-post>.pb-post-body:first-child{grid-column:1/-1}
.pb-post-body a{color:var(--brand-ink);overflow-wrap:anywhere}
.pb-stats{display:flex;flex-wrap:wrap;gap:4px 12px;font:.84rem var(--font-mono);color:var(--muted)}
.pb-stats b{color:var(--text);font-weight:600}
.pb-board{display:grid;gap:10px}
.pb-board>.pb-h{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}
.pb-beats{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(120px,150px);gap:10px;overflow-x:auto;padding-bottom:4px;margin:0;list-style:none;padding-left:0}
.pb-frame{display:grid;gap:4px;font-size:.82rem;align-content:start}
.pb-frame img{aspect-ratio:9/16}
.pb-frame .pb-tc{font:500 .78rem var(--font-mono);color:var(--brand-ink)}
.pb-bar{display:flex;height:10px;border-radius:999px;overflow:hidden;background:var(--bg);border:1px solid var(--border)}
.pb-bar span{display:block;height:100%;background:var(--chart-1)}
.pb-bar span:nth-child(2n){background:var(--chart-2)}
.pb-bar span.pb-end{background:var(--muted)}
.pb-notes{margin:0;padding-left:18px;font-size:.88rem}
.pb-rights{display:grid;grid-template-columns:minmax(0,2fr) repeat(3,minmax(0,1fr)) auto;gap:6px 12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:.9rem}
@media (max-width:640px){.pb-rights{grid-template-columns:1fr auto}.pb-rights>*:first-child{grid-column:1;grid-row:1}.pb-rights>.pb-chip{grid-column:2;grid-row:1}.pb-rights>*:not(:first-child):not(.pb-chip){grid-column:1/-1}}
/* 3.11 method, 3.12 missing, 3.13 draft next */
.pb-method details{border-top:1px solid var(--border);padding:10px 0}
.pb-method summary{cursor:pointer;font-weight:600}
.pb-weights{display:grid;gap:6px;margin:8px 0 0;padding:0;list-style:none}
.pb-weights li{display:grid;grid-template-columns:minmax(0,1fr) 3.2em;gap:10px;align-items:center;font-size:.9rem}
.pb-weights li>span:first-child{display:grid;gap:4px}
.pb-weights .pb-bar span{background:var(--brand-ink)}
.pb-missing ul,.pb-draft ul{margin:0;padding:0;list-style:none;display:grid;gap:8px}
.pb-missing li{display:grid;gap:2px;padding-left:12px;border-left:3px solid var(--pb-warn)}
.pb-draft li{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline;justify-content:space-between;padding:10px 12px;border:1px dashed var(--border);border-radius:calc(var(--radius,10px) - 2px)}
/* 3.14 leadership split */
.pb-split{display:grid;gap:28px}
.pb-split-top{display:grid;gap:16px}
.pb-split-top .pb-two{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}
.pb-split-rule{display:flex;align-items:center;gap:12px;color:var(--muted);font:500 .72rem var(--font-mono);letter-spacing:.06em;text-transform:uppercase}
.pb-split-rule::before,.pb-split-rule::after{content:"";flex:1;border-top:1px solid var(--border)}
.pb-split-detail{display:grid;gap:28px}
/* tallies, groups, structure strips */
.pb-bar span.pb-ok{background:var(--pb-ok)}.pb-bar span.pb-warn{background:var(--pb-warn)}.pb-bar span.pb-bad{background:var(--pb-bad)}.pb-bar span.pb-flat{background:var(--pb-flat)}
.pb-tally{display:grid;gap:8px;margin-top:6px}
.pb-tally ul{display:flex;flex-wrap:wrap;gap:4px 18px;margin:0;padding:0;list-style:none;font-size:.92rem}
.pb-tally a{color:var(--text)}
.pb-stat{display:flex;gap:10px;align-items:baseline;margin:0}
.pb-stat b{font:700 1.5rem/1 var(--font-display);color:var(--brand-ink)}
.pb-insight-summary ul{margin:0;padding-left:18px;font-size:.92rem}
.pb-insight-summary a{color:var(--brand-ink);font-size:.9rem}
.pb-group{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline;margin:18px 0 10px;font-size:.92rem;color:var(--muted)}
.pb-insert{display:grid;place-items:center;aspect-ratio:9/16;border-radius:calc(var(--radius,10px) - 4px);border:1px dashed var(--border);background:repeating-linear-gradient(45deg,var(--bg) 0 8px,var(--surface) 8px 16px);color:var(--muted);font-size:.78rem;text-align:center;padding:6px}
.pb-bar.pb-bar-tall{height:auto;gap:2px;background:transparent;border:0;border-radius:calc(var(--radius,10px) - 4px)}
.pb-bar.pb-bar-tall span{padding:6px 8px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-top:4px solid var(--chart-1);font-size:.78rem;line-height:1.3;min-width:0;overflow-wrap:anywhere}
.pb-bar.pb-bar-tall span:nth-child(2n){border-top-color:var(--chart-2)}
.pb-bar.pb-bar-tall span.pb-end{border-top-color:var(--muted)}
.pb-sources{margin:0;padding-left:20px;font-size:.86rem;color:var(--muted)}
/* 3.16 score row, 3.17 timeline, 3.18 quote */
.pb-score{display:grid;grid-template-columns:40px minmax(0,1.4fr) minmax(60px,1fr) 2.2em auto;gap:6px 12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:.9rem}
.pb-score img{width:40px;height:auto;aspect-ratio:9/16;object-fit:cover;border-radius:4px;background:var(--bg)}
.pb-score a{color:var(--brand-ink)}
.pb-score>p{grid-column:2/-1;margin:0}
.pb-score>div:first-child{grid-column:1/3}
.pb-score>div:first-child~p{grid-column:1/-1}
@media (max-width:640px){.pb-score{grid-template-columns:40px minmax(0,1fr) auto}.pb-score>.pb-bar{grid-column:2}.pb-score>p{grid-column:1/-1}}
.pb-timeline{display:grid;gap:0;margin:0;padding:0;list-style:none}
.pb-timeline li{display:grid;grid-template-columns:minmax(7em,auto) 1fr;gap:4px 14px;padding:8px 0 8px 14px;border-left:2px solid var(--border);position:relative}
.pb-timeline li::before{content:"";position:absolute;left:-6px;top:13px;width:10px;height:10px;border-radius:50%;background:var(--brand-ink)}
.pb-timeline .pb-tc{font:500 .82rem var(--font-mono);color:var(--brand-ink)}
@media (max-width:480px){.pb-timeline li{grid-template-columns:1fr}}
.pb-quote{margin:0;display:grid;gap:6px;padding:12px 14px;border-left:3px solid var(--accent-ink);background:var(--surface);border-radius:0 var(--radius,10px) var(--radius,10px) 0}
.pb-quote blockquote{margin:0;font-size:.98rem}
.pb-quote figcaption{font-size:.82rem;color:var(--muted)}
.pb-quote a{color:inherit}
@media print{.pb-beats{grid-auto-flow:row;grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}}
</style>
```
<!-- /block-style -->

## 3. The blocks

Each block below gives what it holds, the rules it keeps, and its markup with invented example
values. Replace every value. Keep the `data-page`, `data-block`, and `data-*` attributes.

### 3.1 Reader and scope header

**Holds:** who the page is for, the brand, the date range, and the coverage strip (3.2). On a page
for a VP or budget owner it also holds "Prepared by {preparedBy}" (`SKILL.md`, section 2). It sits
before the first `h2`, under the page header that carries the mark and the "Prepared for" chip
(`artifact-standard.md`, `recipient-lens.md`).

- `data-reader`, `data-brand`, and `data-range` are the exact words the line shows.
- A check that is N/A for this page goes in `data-na` (`SKILL.md`, section 5).
- Leave "Prepared by" out when the reader is not a VP or budget owner.

<!-- block:scope -->
```html
<div class="pb-scope" data-page="scope" data-block="scope" data-reader="the VP of marketing" data-brand="Brightside Toys" data-range="Aug 1 to Oct 28, 2026">
  <p class="pb-scope-line"><span>For <b>the VP of marketing</b></span><span><b>Brightside Toys</b></span><span>Aug 1 to Oct 28, 2026</span><span class="pb-muted">Prepared by Jordan Lee, social lead</span></p>
  <!-- the coverage strip (3.2) goes here -->
</div>
```
<!-- /block:scope -->

### 3.2 Coverage strip

**Holds:** each platform with its exact post count. On a team page, every platform with no data
is named as not covered, with what connecting it would add. It sits inside the scope header, and
the method panel (3.11) repeats it with the same counts.

- Show the exact count ("1,412 posts"), never a rounded one.
- A team page lists Instagram, TikTok, and YouTube every time. A page shared outside the team lists
  only the platforms with posts and adds no gap chip (`SKILL.md`, section 1).
- The gap chip says what connecting the platform would add in one short phrase.

<!-- block:coverage -->
```html
<ul class="pb-coverage" data-block="coverage">
  <li><span class="pb-chip" data-platform="instagram" data-posts="412">Instagram <b>412</b> posts</span></li>
  <li><span class="pb-chip" data-platform="tiktok" data-posts="96">TikTok <b>96</b> posts</span></li>
  <li><span class="pb-chip pb-gap" data-platform="youtube" data-posts="0">YouTube not covered. Connecting it would add long-form reviews.</span></li>
</ul>
```
<!-- /block:coverage -->

### 3.3 Answer headline

**Holds:** the decision as one sentence, in the page's only `h1`, and one key takeaway line
beneath it. Write it last, from the decision the page supports (`SKILL.md`, section 4).

- The headline is the conclusion, never a topic title. "Contact 11 creators this week" passes;
  "Creator performance overview" fails.
- It is the page's first heading. A `band` header (`theme.md`, **Header**) shows the logo or brand
  name and the kind of page as plain text, never as a second `h1`.
- The takeaway gives the one number or reason that backs the headline, compared with something.
- A page that sorts items into verdicts (a slate, a ranked list) may add the tally under the
  takeaway: a bar with one span per verdict, `flex` set to its count, and one line per verdict
  that links to its section. Each verdict's color is its status token.

<!-- block:answer -->
```html
<header class="pb-answer" data-block="answer">
  <h1>Contact 11 creators this week, before the holiday launch on Nov 18</h1>
  <p>11 of 49 creators reviewed fit the brief and are safe to work with. Their posts get 2.1 times the brand's usual views.</p>
  <div class="pb-tally">
    <div class="pb-bar" role="img" aria-label="11 yes, 6 maybe, 32 no"><span class="pb-ok" style="flex:11"></span><span class="pb-warn" style="flex:6"></span><span class="pb-bad" style="flex:32"></span></div>
    <ul><li><a href="#yes"><b class="pb-num">11</b> to contact</a></li><li><a href="#maybe"><b class="pb-num">6</b> maybes, each with what would make it a yes</a></li><li><a href="#no"><b class="pb-num">32</b> left out, by reason</a></li></ul>
  </div>
</header>
```
<!-- /block:answer -->

### 3.4 Insight card

**Holds:** one insight, in this order: the claim, the evidence, the comparison, and the "So:" line
with the action. A page has up to three. Only the headline insight carries a chart, and at most
one.

- The claim is a full sentence with no hedge. Hedges go in the "So:" line.
- The comparison names what the number is compared with: last period, peers, a goal, or the
  account's own usual.
- The chart is inline SVG on the `--chart-*` tokens, with a `<title>` and an `aria-label`.
  A chart that shows above or below baseline uses the status tokens.
- Put several cards in `<div class="pb-grid">`, headline insight first.
- A big number that backs the evidence goes in a `pb-stat` line: the figure, then one sentence.
- **Summary variant.** On a long readout, the top of the page can carry one short card per
  insight: the claim, up to three bullets, and a link to the section that holds the full card. Add
  `pb-insight-summary` to the card and leave out the `dl` and the chart. The full insight card
  still sits in its section, with its "So:" line.

<!-- block:insight -->
```html
<article class="pb-card pb-insight" data-block="insight">
  <p class="pb-label">Insight 1</p>
  <p class="pb-claim">Unboxing videos drive most of the brand's views.</p>
  <dl>
    <dt>Evidence</dt><dd>14 unboxing videos had 61% of views from 412 Instagram posts.</dd>
    <dt>Compared with</dt><dd>38% in the 13 weeks before.</dd>
  </dl>
  <svg viewBox="0 0 320 96" role="img" aria-label="Share of views from unboxing videos: 38% before, 61% now">
    <title>Share of views from unboxing videos</title>
    <rect x="0" y="12" width="122" height="28" rx="4" fill="var(--chart-2)"/><text x="130" y="31" font-size="12" fill="var(--text)">38% before</text>
    <rect x="0" y="56" width="195" height="28" rx="4" fill="var(--chart-1)"/><text x="203" y="75" font-size="12" fill="var(--text)">61% now</text>
  </svg>
  <p class="pb-so"><b>So:</b> brief the 11 creators on unboxing first. The lift may ease after the holidays.</p>
</article>
```
<!-- /block:insight -->

### 3.5 Decisions block

**Holds:** what the reader must approve, each with its deadline and the person who approves it.
When nothing does, it says "Nothing needs approval." It is its own section, never inside or
around the next steps.

- One `data-decision` item per decision. `data-by` is the deadline as `YYYY-MM-DD`, and the same
  date shows in the text. Leave `data-by` out when there is no deadline.
- Each decision says what happens once it is approved, in the `pb-meta` line.

<!-- block:decisions -->
```html
<section class="pb-card pb-decisions" data-page="decisions" data-block="decisions">
  <h2 class="pb-h">Decisions for you</h2>
  <ol>
    <li data-decision data-by="2026-11-04"><span>Approve the 11 creators for outreach</span><span class="pb-due">by Nov 4</span>
      <span class="pb-meta">Approves: the VP of marketing. Then Atlas drafts the 11 first messages.</span></li>
    <li data-decision data-by="2026-11-06"><span>Approve a USD 18,400 creator budget</span><span class="pb-due">by Nov 6</span>
      <span class="pb-meta">Approves: the VP of marketing. Fees come from the brand's fee calculator.</span></li>
  </ol>
</section>
<!-- With no decision: <section class="pb-card pb-decisions" data-page="decisions" data-block="decisions"><h2 class="pb-h">Decisions</h2><p>Nothing needs approval.</p></section> -->
```
<!-- /block:decisions -->

### 3.6 Ranked next steps table

**Holds:** the next steps, ranked, each with what to do, who does it, by when, and what it should
change. Approvals never go here; they go in the decisions block.

- Rank by impact on the page's answer, highest first. Five rows at most on a split page's top.
- "Who" is a role or a named person the run knows, never "the team".
- "What it should change" is a measurable result with a number where the run has one.

<!-- block:next-steps -->
```html
<section class="pb-card" data-page="next-steps" data-block="next-steps">
  <h2 class="pb-h">Next steps</h2>
  <table class="pb-table">
    <thead><tr><th>#</th><th>What</th><th>Who</th><th>By when</th><th>What it should change</th></tr></thead>
    <tbody>
      <tr><td data-label="Rank" class="pb-rank">1</td><td data-label="What">Send first messages to the 11 approved creators</td><td data-label="Who">Influencer manager</td><td data-label="By when">Nov 5</td><td data-label="What it should change">8 or more replies by Nov 12</td></tr>
      <tr><td data-label="Rank" class="pb-rank">2</td><td data-label="What">Ship product to creators who say yes</td><td data-label="Who">Operations lead</td><td data-label="By when">Nov 10</td><td data-label="What it should change">Posts live before the Nov 18 launch</td></tr>
    </tbody>
  </table>
</section>
```
<!-- /block:next-steps -->

### 3.7 Creator evidence

**Holds:** one creator, with a thumbnail and the verdict. It is the creator card from
`skills/aspire/references/creator-card.md`, unchanged, with its style block and (with a saved
theme) the theme override. Never draw a second creator card.

The verdict, its reason, and the slate fields go in the card's `{DETAILS}` slot with the markup
below. A creator slate (`SKILL.md`, section 3) fills every field:

- **Verdict:** Yes, Maybe, or No, as a status chip (`pb-ok`, `pb-warn`, `pb-bad`).
- **Reason:** one sentence, with the evidence that decided it.
- **Checks reached:** which checks the creator reached, in the order they ran (fit before safety).
- **Fee and return:** the fee only when the fee calculator gives one, and the expected return only
  when the run worked one out, each labelled with its source.
- **Settle question:** every Maybe carries the one question that would settle it.
- A page for a client leaves out named rejects (`SKILL.md`, section 2).
- **Groups.** When the slate is split into groups (audiences, lanes, tiers), each group opens with a
  `pb-group` heading: its name as a chip, then its count and subtotals (fees at target, views per
  round) and any open slot ("sixth slot waits on a maybe").
- The creators left out are score rows (3.16), grouped under one `h3` per reason with its count.

<!-- block:creator -->
```html
<!-- A group heading, once per group: <p class="pb-group"><span class="pb-chip">Parents</span>6 creators, USD 7,200 at target, 210,000 views per round</p> -->
<div class="pb-verdict" data-block="creator" data-verdict="maybe">
  <p><span class="pb-chip pb-warn">Maybe</span> Strong fit and safe, but 2 of her last 30 posts were paid posts for a competitor.</p>
  <p class="pb-muted">Checks reached: fit, audience, brand safety, competitor deals.</p>
  <p class="pb-stats"><span>Fee <b>USD 1,200</b> (fee calculator)</span><span>Expected return <b>3.4x</b> (this run)</span></p>
  <p><b>To settle it:</b> is her competitor deal still active after November?</p>
</div>
```
<!-- /block:creator -->

### 3.8 Post evidence card

**Holds:** one real post from this run: its thumbnail, a link to it, the creator, the date and
time it went live, and the numbers the argument uses, each next to its comparison.

- The link opens the post itself. The thumbnail is a data URI (the creator card's **Images**
  snippet); without one, leave the `img` out and keep the card. The body then takes the full
  width.
- The time is the post's own timestamp with its time zone. When the card points at a moment in a
  video, add the timecode ("at 0:04").
- A caption or quote is marked `data-quoted`.

<!-- block:post -->
```html
<article class="pb-card pb-post" data-block="post">
  <img src="data:image/jpeg;base64,..." alt="Unboxing of the holiday playset, child opening the box" width="96" height="171">
  <div class="pb-post-body">
    <p><a href="https://www.instagram.com/reel/EXAMPLE/">@makerjune on Instagram</a> <span class="pb-muted">Oct 12, 2026, 6:40 PM ET</span></p>
    <p class="pb-stats"><span>Views <b>48,200</b> (3.1x her usual)</span><span>Saves <b>1,940</b></span></p>
    <p data-quoted>"We waited all week for this one"</p>
  </div>
</article>
```
<!-- /block:post -->

### 3.9 Storyboard strip

**Holds:** one ad cut from one post: a real still for every beat, each beat's timecode and a
one-line description, a duration bar, and the edit notes (`SKILL.md`, section 3, **Ad
cut-downs**).

- Use the flow's own cut length when it sets one (`ad-reuse.md`). Otherwise use the five beats:
  hook 0 to 3s, brand 3 to 6s, build 6 to 9s, reveal 9 to 12s, end card +2s.
- Every still is a real frame from the post at that timecode. A beat with no frame keeps its slot
  and says "No frame at this time".
- The duration bar has one span per beat, each `flex` set to the beat's seconds. The end card uses
  `pb-end`.
- Timecodes are drafts until a 1-second frame scan confirms them (`quality-review.md`, 4.15).
  Until then, set `data-scanned="no"` and put a `<span class="pb-chip pb-warn">Draft timecodes</span>`
  in the cut's heading. Remove both once the scan confirms every timecode.
- A beat whose footage is not in the post (a brand insert, an end card the brand supplies) keeps its
  slot with a `pb-insert` tile that says where the footage comes from.
- **The structure strip.** A page with several cuts shows the beat structure once, above them: the
  duration bar with `pb-bar-tall`, each span holding the beat's name and time range. The specs every
  cut shares (format, captions, timecode tolerance) go in a `pb-grid` of `pb-card`s beside it.

<!-- block:storyboard -->
```html
<article class="pb-card pb-board" data-block="storyboard" data-scanned="yes">
  <h3 class="pb-h">Cut 1: 14 seconds from @makerjune's unboxing</h3>
  <ol class="pb-beats">
    <li class="pb-frame"><img src="data:image/jpeg;base64,..." alt="Child gasps as the lid opens" width="132" height="235"><span class="pb-tc">0:00 to 0:03</span><span><b>Hook.</b> The lid opens and the child gasps.</span></li>
    <li class="pb-frame"><img src="data:image/jpeg;base64,..." alt="Logo on the box side" width="132" height="235"><span class="pb-tc">0:03 to 0:06</span><span><b>Brand.</b> The logo turns to camera.</span></li>
    <li class="pb-frame"><img src="data:image/jpeg;base64,..." alt="Pieces laid out on the floor" width="132" height="235"><span class="pb-tc">0:06 to 0:09</span><span><b>Build.</b> The pieces go together.</span></li>
    <li class="pb-frame"><img src="data:image/jpeg;base64,..." alt="Finished playset lit up" width="132" height="235"><span class="pb-tc">0:09 to 0:12</span><span><b>Reveal.</b> The playset lights up.</span></li>
    <li class="pb-frame"><img src="data:image/jpeg;base64,..." alt="End card with the product name" width="132" height="235"><span class="pb-tc">+2s</span><span><b>End card.</b> Product name and offer.</span></li>
  </ol>
  <div class="pb-bar" role="img" aria-label="Beats: 3, 3, 3, 3 and 2 seconds"><span style="flex:3"></span><span style="flex:3"></span><span style="flex:3"></span><span style="flex:3"></span><span class="pb-end" style="flex:2"></span></div>
  <ul class="pb-notes"><li>Cut the first 1.5 seconds of the original, before the lid moves.</li><li>Add captions; 70% of views play without sound.</li></ul>
</article>
<!-- A beat with no footage in the post: <li class="pb-frame"><span class="pb-insert">The brand supplies this shot</span><span class="pb-tc">Insert</span><span><b>Brand.</b> Logo on white.</span></li> -->
<!-- The structure strip, once above the cuts: <div class="pb-bar pb-bar-tall" role="img" aria-label="Five beats"><span style="flex:3">Hook, 0 to 3s</span><span style="flex:3">Brand, 3 to 6s</span><span style="flex:3">Build, 6 to 9s</span><span style="flex:3">Reveal, 9 to 12s</span><span class="pb-end" style="flex:2">End card, +2s</span></div> -->
```
<!-- /block:storyboard -->

### 3.10 Rights row

**Holds:** one piece of content and what the brand may do with it: the post, the kind of use
(organic repost, paid usage, whitelisting), the channels, the expiry date, and a status chip.

- The expiry is a real date. A status chip shows `Cleared` (`pb-ok`), `Expires in {n} days`
  (`pb-warn` at 30 days or fewer), `Expired` or `Not cleared` (`pb-bad`), or `Not asked` (`pb-flat`).
- `data-expires` is the expiry as `YYYY-MM-DD`; leave it out when there is none.
- Rows stack under a `pb-label` header row the page writes once.

<!-- block:rights -->
```html
<div class="pb-rights" data-block="rights" data-expires="2027-01-31">
  <a href="https://www.instagram.com/reel/EXAMPLE/">@makerjune unboxing, Oct 12</a>
  <span>Paid usage</span><span>Instagram, Facebook</span><span class="pb-num">Jan 31, 2027</span>
  <span class="pb-chip pb-ok">Cleared</span>
</div>
```
<!-- /block:rights -->

### 3.11 Method panel

**Holds:** how the page was worked out: the scoring weights in full, the sources, the checks each
item reached, and the coverage strip again with the same counts. It sits below the evidence.

- List every weight, summing to 100%, each with what it measures. When a score is rated 1 to 5,
  add what 5 and 1 mean for each part, as a `pb-table` under the weights. Score bands ("75 or more:
  test first") go on one line of status chips, with any rule that overrides them.
- Number the sources. A claim elsewhere on the page that rests on one links to it with
  `<sup><a href="#src-2">2</a></sup>`, and the source item carries `id="src-2"`.
- Full data tables go in their own `details` here, never in the argument above.
- Each recommendation's reasoning sits under its own `details`, so the reader opens only what they
  need.
- The repeated coverage strip carries the same `data-platform` and `data-posts` values as the
  scope.

<!-- block:method -->
```html
<section class="pb-card pb-method" data-page="method" data-block="method">
  <h2 class="pb-h">How this was worked out</h2>
  <ul class="pb-coverage">
    <li><span class="pb-chip" data-platform="instagram" data-posts="412">Instagram <b>412</b> posts</span></li>
    <li><span class="pb-chip" data-platform="tiktok" data-posts="96">TikTok <b>96</b> posts</span></li>
    <li><span class="pb-chip pb-gap" data-platform="youtube" data-posts="0">YouTube not covered</span></li>
  </ul>
  <p class="pb-label">Scoring weights</p>
  <ul class="pb-weights">
    <li><span>Fit with the brief (topics, tone, audience)<span class="pb-bar"><span style="width:40%"></span></span></span><span class="pb-num">40%</span></li>
    <li><span>Views against the creator's own usual<span class="pb-bar"><span style="width:30%"></span></span></span><span class="pb-num">30%</span></li>
    <li><span>Brand safety across the 12 categories<span class="pb-bar"><span style="width:30%"></span></span></span><span class="pb-num">30%</span></li>
  </ul>
  <p><span class="pb-chip pb-ok">75 or more: contact</span> <span class="pb-chip pb-warn">60 to 74: maybe</span> <span class="pb-chip pb-bad">Under 60: leave out</span> <span class="pb-muted">Any brand safety fail is a no.</span></p>
  <details><summary>Why @makerjune is a Maybe</summary><p>Fit 92, views 88, safety 70. Two paid posts for a competitor in her last 30 lowered safety.</p></details>
  <p class="pb-label">Sources</p>
  <ol class="pb-sources"><li id="src-1">Posts and creators Atlas holds for Brightside Toys, Aug 1 to Oct 28, 2026</li><li id="src-2">The brand's fee calculator</li></ol>
</section>
```
<!-- /block:method -->

### 3.12 What's missing panel

**Holds:** each piece of missing data and what connecting it would add. Team pages only. A page
shared outside the team leaves this block out and puts its gaps in the page check's `gaps`
(`SKILL.md`, section 1).

- Name the gap, then what it would change, in one line each.
- Say when a gap would change the decision.

<!-- block:missing -->
```html
<section class="pb-card pb-missing" data-block="missing">
  <h2 class="pb-h">What's missing</h2>
  <ul>
    <li><b>Paid results</b><span class="pb-muted">Connecting the Meta ad account would show which posts already work as ads.</span></li>
    <li><b>YouTube</b><span class="pb-muted">Connecting it would add long-form reviews. It would not change this week's shortlist.</span></li>
  </ul>
</section>
```
<!-- /block:missing -->

### 3.13 "Atlas can draft next" footer

**Holds:** the drafts Atlas can make next, each one gated on approval. It sits last, before the
source line (`artifact-standard.md`, section 2).

- Each item names the draft, who it is for, and what approval it waits on.
- Never offer a draft the flow cannot make, and never say a draft is sent.

<!-- block:draft-next -->
```html
<section class="pb-card pb-draft" data-block="draft-next">
  <h2 class="pb-h">What Atlas can draft next</h2>
  <ul>
    <li><span>First messages to the 11 creators</span><span class="pb-chip">After you approve the 11</span></li>
    <li><span>Offers with fees from the fee calculator</span><span class="pb-chip">After you approve the budget</span></li>
  </ul>
  <p class="pb-muted">Nothing is sent without your approval.</p>
</section>
```
<!-- /block:draft-next -->

### 3.14 Leadership split wrapper

**Holds:** a page for a VP or budget owner, in two halves. The top holds the scope, the answer, the
decisions, and the next steps, all starting within the first 800px at 1280px wide
(`reader-standard.md`, R10). The detail below holds the insights, the evidence, the method, the
options left out, and what's missing, so the person who prepared it can back it up if asked.

- The top holds at most three decisions and five next steps. Insights below the split show their
  claim lines first.
- Keep "Prepared by" in the scope header (3.1).
- The split rule's label says what is below it, in plain words.

<!-- block:split -->
```html
<div class="pb-split" data-block="split">
  <div class="pb-split-top">
    <!-- 3.1 scope, 3.3 answer -->
    <div class="pb-two"><!-- 3.5 decisions, 3.6 next steps --></div>
  </div>
  <p class="pb-split-rule">The detail behind it</p>
  <div class="pb-split-detail"><!-- 3.4 insights, evidence, 3.15 test plan, 3.11 method, options left out, 3.12 missing, 3.13 draft next --></div>
</div>
```
<!-- /block:split -->

### 3.15 Test plan block

**Holds:** the test plan any page that recommends paid spend carries. Each test changes one
variable, states its hypothesis, and has a Scale, Fix, or Stop rule with the number that triggers
it.

- One variable per row. Two variables are two tests.
- Each row names the cuts or creators in the test and the measure it is judged on.
- Each rule names the measure, the threshold, and the time it runs before the call.
- Use the status tokens for the rule labels: Scale `pb-ok`, Fix `pb-warn`, Stop `pb-bad`.
- Define each measure once under the table ("Hook rate: the share of people who watch past 3
  seconds"). The weeks the tests run in are a timeline (3.17).

<!-- block:test-plan -->
```html
<section class="pb-card" data-block="test-plan">
  <h2 class="pb-h">How to test it</h2>
  <table class="pb-table">
    <thead><tr><th>Test</th><th>One variable</th><th>Cuts</th><th>Judged on</th><th>Hypothesis</th><th>Rule after 7 days</th></tr></thead>
    <tbody>
      <tr><td data-label="Test" class="pb-rank">A</td><td data-label="One variable">Hook: lid opening vs. finished playset</td><td data-label="Cuts">1 and 2</td><td data-label="Judged on">Hook rate</td><td data-label="Hypothesis">The lid opening holds more people past 3 seconds</td>
        <td data-label="Rule after 7 days"><span class="pb-chip pb-ok">Scale</span> hook rate 30% or more<br><span class="pb-chip pb-warn">Fix</span> 20% to 30%, re-cut the first second<br><span class="pb-chip pb-bad">Stop</span> under 20%</td></tr>
    </tbody>
  </table>
  <p class="pb-muted">Hook rate: the share of people who watch past 3 seconds.</p>
</section>
```
<!-- /block:test-plan -->

### 3.16 Score row

**Holds:** one item in a ranked list: a thumbnail, what it is, a score bar out of 100, a verdict
chip, and one note. Use it for ranked posts, ranked ad candidates, and the creators a slate left
out.

- The score bar's width is the score. The verdict chip uses the status tokens; a verdict that is
  not a status (B-roll, Hook bank) uses `pb-flat`.
- The note says why, in one line, and names the cut or step the item feeds.
- Rows sit in rank order, highest first. Without a thumbnail (an image that failed to embed),
  leave the `img` out; the row keeps its columns.

<!-- block:score-row -->
```html
<div class="pb-score" data-block="score-row" data-score="82">
  <img src="data:image/jpeg;base64,..." alt="Unboxing of the holiday playset" width="40" height="71">
  <div><a href="https://www.instagram.com/reel/EXAMPLE/">@makerjune</a> <span class="pb-muted">Creator post, Oct 12, 0:31</span></div>
  <div class="pb-bar" role="img" aria-label="Score 82 of 100"><span style="width:82%"></span></div><span class="pb-num">82</span>
  <span class="pb-chip pb-ok">Test first</span>
  <p class="pb-muted">Product in frame at 0:02 and works without sound. Feeds cut 1.</p>
</div>
```
<!-- /block:score-row -->

### 3.17 Timeline

**Holds:** what happens when, from the first step to the first result: each step's date or week
and what happens then. Use it for a launch clock, test weeks, or a rollout.

- Dates are real dates or week numbers counted from a named start ("Week 1 starts Nov 4").
- Each step says what happens and, where it has one, who does it.
- It never holds an approval; those go in the decisions block.

<!-- block:timeline -->
```html
<ol class="pb-timeline" data-block="timeline">
  <li><span class="pb-tc">Week 1, Nov 4</span><span>Offers go to the 11. Product ships to each yes.</span></li>
  <li><span class="pb-tc">Week 3, Nov 18</span><span>Launch. All 11 posts live.</span></li>
  <li><span class="pb-tc">Week 5, Dec 2</span><span>First read on sign-ups from each creator.</span></li>
</ol>
```
<!-- /block:timeline -->

### 3.18 Quote

**Holds:** someone else's words from this run: a creator's caption, a comment, a line from a
video. Each quote carries who said it and links to where.

- Quote exactly. Never shorten a quote so it says something else.
- The `blockquote` keeps the words out of the plain-language check (`SKILL.md`, section 5).
- Several quotes sit in a `pb-grid`.

<!-- block:quote -->
```html
<figure class="pb-quote" data-block="quote">
  <blockquote>We waited all week for this one.</blockquote>
  <figcaption><a href="https://www.instagram.com/reel/EXAMPLE/">@makerjune, Instagram, Oct 12</a></figcaption>
</figure>
```
<!-- /block:quote -->

## 4. Building a page from the blocks

1. **Pick the blocks for this question and reader.** Every page has the scope header with its
   coverage strip, the answer, the decisions, the next steps, the method, and the draft-next
   footer. Add insight cards when the page has insights, the evidence blocks its question needs,
   the what's missing panel on a team page, the split for a VP or budget owner, and the test plan
   when the page recommends paid spend. A part the flow's reference leaves out stays out
   (`SKILL.md`, section 1).
2. **Order the evidence, then lay out the page.** Evidence sits below the argument, in the order
   the argument uses it. Then place the blocks where the flow's layout puts them: a card grid, a
   two-column readout, a deck slide. The blocks never fix the layout.
3. **Fill them from the run.** Every value comes from what this run read. Leave a field out rather
   than fill it with a guess; a slot the evidence standard requires and the run could not fill says
   so in one line.
4. **Run the self-check** (`SKILL.md`, section 5). The blocks carry the markup it reads.

## 5. The validated examples, block by block

Aspire's reviewers approved one page for each of three questions. Each can be rebuilt from these
blocks with nothing left out. Read the example in full before you build a page for the same
question (`SKILL.md`, section 4). The tables below say which block holds each of its elements, and
which elements stay the flow's own sections (section 6). "Adds" marks what the blocks require and
the example lacked, so the rebuilt page passes a check the example did not.

<!-- examples-map -->
**I1, which creators to contact for a launch** (shortlist; the influencer manager reads it)

| Example element | Block |
| --------------- | ----- |
| Brand, launch, audiences, and goal line; reader, scope, and as-of row | 3.1 |
| Platform counts (one total in the example) | 3.2, adds the count per platform |
| "49 creators reviewed. Contact 11 this week." and its takeaway | 3.3 |
| Verdict tally: the bar, and the yes, maybe, and no columns with counts and reason chips | 3.3, tally |
| Five actions in order, each with its week, creators, and facts | 3.6; the brand rule question in action 4 moves to 3.5, and the two questions in action 3 go on the Maybe cards they settle (3.7) |
| Three things that shaped the verdict | 3.4, three cards |
| The 11 to contact, by audience, with subtotals and the open slot | 3.7 with group headings |
| Each card: avatar, scores, tags, why, proof, metrics, fee and its source, projection, watch line, three post thumbnails, contact route, score breakdown | 3.7: the creator card holds the creator; the verdict, fee, return, and settle question go in its details slot; the score breakdown goes in 3.11 |
| Six maybes, each with "Ask first" or "Backup" | 3.7, a Maybe with its settle question |
| The 32 left out, grouped by reason, with scores and why not | 3.16, one group per reason |
| Fee against fit scatter, with its table toggle | The flow's own chart (section 6) |
| What the 11 should return: the sign-ups calculator | The flow's own calculator (section 6); its default result shows in 3.7's expected return |
| From offers to the first read: the launch clock | 3.17 |
| "You keep" and "Atlas can draft next" | 3.5 and 3.13 |
| How the verdict was made: the two scores, verdicts, weights, reach penalty, fees, brand post detection, corrections | 3.11 |
| What's missing (not in the example) | 3.12, adds |
| Source line | `artifact-standard.md` |

**O3, where we stand against competitors** (readout; marketing leadership reads it, split)

| Example element | Block |
| --------------- | ----- |
| Brand band with logo, eyebrow, title, "Prepared for" and scope chips | Page header (`theme.md`, `recipient-lens.md`) and 3.1 |
| Platform counts (only in the method bullets in the example) | 3.2, adds them to the top |
| "Prepared by" (not in the example) | 3.1, adds |
| The answer and its lede | 3.3 |
| Four verdict cards, one per section, each linking to it | 3.4, summary variant |
| Three decisions (one with a deadline in the text) | 3.5, adds the approver to each, and the deadline as `data-by` where there is one |
| One screen of answer and decisions, then the detail | 3.14 |
| Each section's claim, evidence, big numbers, and "What this means for you" | 3.4, with `pb-stat` lines and the "So:" line |
| Period, share, and growth bar charts | 3.4, the chart in each section's headline insight |
| Organic against paid panel | 3.4, the comparison |
| Competitor table, message ownership table, 2x2 positioning map, pitch anatomy strip, numbered defenses | The flow's own sections (section 6) |
| "What is working" and "working against you", with handles and views | 3.8 |
| The action table: action, owner, when, how you will know, evidence strength | 3.6 |
| Scorecard for next month: today, target, linked to | The flow's own table (section 6), beside 3.6 |
| Ten post cards ordered by hook strength | 3.8 |
| "In their words", eight quotes | 3.18 |
| Full data tables and how creators describe each tool | 3.11, in `details` |
| Method, gaps, and numbered sources with superscript links | 3.11 for the method and sources, 3.12 for the gaps |
| Drafts on offer (not in the example) | 3.13, adds |
| Section menu | Page layout |
| Footer notes and source line | The flow's footer and `artifact-standard.md` |

**P1, which creator posts to run as ads and how to cut them** (plan; paid social and creative read
it)

| Example element | Block |
| --------------- | ----- |
| Brand, platform, and date range eyebrow | 3.1 |
| Post and account counts (in the lede and appendix in the example) | 3.2, adds them to the top |
| Key takeaway and the four recommendations | 3.3 for the answer and takeaway; the four items go in 3.6 |
| Caveat on organic data and boosted views | 3.12 |
| Scoring method: six criteria with weights, what 5 and 1 mean, score bands, the override | 3.11 |
| How the 12 posts scored: thumbnail, handle, source, date, length, score bar, verdict, note | 3.16 |
| What the scores show, each with a "So:" line and a proof visual | 3.4 |
| Seconds to first product appearance chart; hook variant bars | 3.4, the headline insight's chart; the second chart is the flow's own (section 6) |
| What the frames show | 3.4, evidence lines, or the flow's own grid |
| The five beat structure and the specs every cut shares | 3.9, structure strip and specs grid |
| Six storyboards: badge, hook, handle, date, pattern, length, tests, stills or insert tiles, timecodes, duration bar, edit notes | 3.9 |
| Test table: question, ads, judged on, hypothesis; Scale, Fix, and Stop cards; metric definitions | 3.15 |
| Test weeks | 3.17 |
| Approvals and access needed, with when | 3.5 |
| Rights for each candidate (prose in the example) | 3.10, adds a row per candidate with expiry |
| Ratings matrix | 3.11, in `details` |
| Brief for the next creator round | 3.13, a draft on offer |
| Data and scope note | 3.11 |
| Two brand tabs on one page | One page per brand: the scope header names one brand, and the source line and "Prepared for" chip then match the brand on screen |
<!-- /examples-map -->

## 6. Sections the flow builds itself

Some sections answer one question only: a competitor table with threat levels, a message
ownership table, a 2x2 positioning map, a fee against fit scatter, a calculator, a pitch anatomy
strip, a section menu. The flow's reference builds them, and they are not blocks. They
still follow section 1: tokens only, status colors from the status tokens, light and dark, and phone
width. A page never holds two brands: each brand gets its own page (section 5, P1). They reuse `pb-card`, `pb-chip`, `pb-label`, `pb-table`, and `pb-grid`, so the page reads as
one piece. A chart is inline SVG with a table of the same values in a `details` under it. A
calculator needs script; the blocks never do, so the page states the calculator's default result
in plain text where the blocks show it, and the page still reads correctly without script.

When the same section turns up on a second question's validated page, it becomes a block here.
