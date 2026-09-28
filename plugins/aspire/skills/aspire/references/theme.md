# Brand theme reference

Used by the **Theme** section of SKILL.md, which runs the interview, and by every flow that
publishes a page or renders a creator card, which applies the saved theme. The theme covers
color, chart series, header style, fonts, and the logo. It is one Atlas calibration, so every
teammate, every agent, and every scheduled run draws the same brand.

## What the theme changes, and what it never touches

The theme changes:

- The page's surfaces, text, borders, links, highlights, primary buttons, and selected chips,
  in light and dark mode.
- The page header: a brand-colored band, a brand rule, or plain, with the logo or the brand name.
- Categorical chart series, in order.
- Display and body fonts.
- The creator card's brand color (the fit ring, the main button, selected chips) and its font.

The theme never changes:

- **Semantic colors.** Pass, Flag, Fail, and Can't check chips, ok and warn tiles, above and
  below baseline, red-line hits, and verdict banners keep the colors the page or card already
  gives them. A brand whose color is red still shows a Fail in the page's own red, never in
  its brand color.
- Slack and email messages, which are plain text.
- The account connection card, which follows the host app.
- Anything about content. `theme:` keys describe how Atlas's own pages look. They are never a
  brand guideline for a post, a brief, or a review (see `atlas-tools.md`, Calibration kinds).

## The record

One active record per profile.

| Field | Value |
| ----- | ----- |
| kind | `guideline` |
| key | `theme:brand` |
| statement | Under 280 characters, for example "Brand theme: Brand-forward, from example.com. Brand #0600ff, accent #8101a9, band header, Playfair Display and Inter, site logo." |
| provenance | `web`, with `sourceRef` set to the site URL, when the user picks the palette exactly as found on their site. `interview` for everything else: a variation, a preset, typed values, or any edit. |

A `guideline` detail takes only `concern`, `appliesTo`, and `body`, and the server refuses
any other field. The theme itself goes in `body` as one JSON string, so that no flow has to
derive anything again:

```json
{"concern": "preference", "appliesTo": ["pages", "creator-cards", "charts"],
 "body": "<the theme object below, serialized with json.dumps>"}
```

The theme object:

```json
{"schema": 1, "summary": "<one plain line: which palette, from where, what was adjusted>",
 "name": "Brand-forward", "variant": "forward", "source": "https://example.com",
 "palette": "aspire-green", "header": "band", "radius": "0.75rem",
 "light": {"bg": "#…", "surface": "#…", "text": "#…", "muted": "#…", "border": "#…",
           "brand": "#…", "onBrand": "#…", "brandInk": "#…",
           "accent": "#…", "onAccent": "#…", "accentInk": "#…", "chart": ["#…", "#…"]},
 "dark": {"…": "same keys as light"},
 "fonts": {"display": "Archivo", "displayStretch": "125%", "body": "Inter", "mono": "JetBrains Mono", "source": "match",
           "href": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"},
 "logo": {"url": "https://…", "format": "svg", "tone": "mono", "alt": "<Brand> logo"}}
```

Readers parse `body` with a JSON parser. A `body` that does not parse, or has no `light`,
counts as no theme, and the flow's own design applies.

- `variant` is `found`, `forward`, `quiet`, `complement`, or `preset`. `palette` names the
  site theme the colors came from (**Design tokens first**), or is `null`. `radius` is the
  site's corner radius token when it has one, else `null`.
- `brand` and `accent` are fills: the page's text on them uses `onBrand` and `onAccent`.
  `brandInk` and `accentInk` are the same hues adjusted to read as text, links, and thin
  lines on `bg` and `surface`. `chart` holds up to six series colors, each at least 3:1
  against `surface`.
- `fonts` is `null` when the user keeps the Aspire default. `href` is the Google Fonts URL the
  interview checked. Pages load it as it is. `source` is `tokens`, `site`, `match` (a Google
  Fonts stand-in for a paid site font), or `pairing`. `displayStretch` is the display face's
  width (`125%` for an expanded cut), else `null`; the `href` must request that width
  (`family=Archivo:wdth,wght@125,500;125,600;125,700`).
- `logo` is `null` for no logo. A logo from an image carries `url`. A logo that was inline
  SVG on the site carries `svg` (the sanitized markup, under 12KB) instead of `url`. `tone` is
  `mono`, `dark`, `light`, or `mixed`, from **Logo embed** below. A `mono` logo draws in
  `currentColor`, so it takes the text color of whatever it sits on.
- A user who declines the theme gets a `decline` record, key `decline:theme`, detail
  `{topic: "brand theme", askedAt}`. It stops the offers. It never blocks an explicit request.

## The interview

Main thread only. Agents never run it, and an unattended session never runs it. Every question
goes through `AskUserQuestion`, per the question format rule in SKILL.md Phase 5.

**T0. Read first.** `search_calibrations` (no filter, limit 100 per page, paged to the end,
`includeSuperseded: true`). If `theme:brand` exists, render it with the comparison widget
(one option) and ask "Keep {brand}'s current theme?" Options: "Keep it (Recommended)", "Change
it", "Go back to the Aspire default". "Change it" continues at T1. "Go back to the Aspire
default" is `retract_calibration` behind its own Destructive tools confirmation.

**T1. Source.** "Where should {brand}'s look come from?"

| Option | When shown | Leads to |
| ------ | ---------- | -------- |
| Research {domain} (Recommended) | A domain is known: the `sourceRef` of a `web` calibration, or a site the user named this session | Web discovery |
| Paste our design tokens | Always | **Design tokens first**, on the pasted file |
| I'll type the website | Not when this is an offer (the free text field takes a domain) | Web discovery on the typed domain |
| Start from preset directions | Always | Presets |
| Skip for now | Only when this is an offer, not a request | `decline:theme`, stop |

The free text field also takes a domain, a pasted CSS or JSON token file, or hex codes. For
hex codes, the first is the brand color and a second is the accent. Typed colors skip
discovery and go straight to **Building the options**, with source `typed`. A pasted token
file is the most faithful source: prefer it over a scan whenever the user has one.

**Web discovery.** Tell the user in one line that scanning the site takes up to a minute.
Then:

1. Run **Brand scan** below on the domain. It reads the home page and up to eight stylesheets.
   It returns `tokenPalettes` (the site's design tokens, one entry per theme it defines),
   then ranked colors with where each was found, the site's neutrals, its fonts (with whether
   each is on Google Fonts), and logo candidates.
2. **Design tokens first.** When `tokenPalettes` is not empty, the brand comes from the tokens
   and the ranked colors are ignored. The frequency ranking cannot tell one theme from
   another: a site that ships several palettes blends them all together.
   - Pick the palette the site shows: the one marked `active` (an attribute on `<html>`, or the
     default its boot script sets). Otherwise, pick the one named after the brand (its name
     contains a word from the brand name or domain). Otherwise, pick the only one.
   - Several candidates and no clear pick: **T1b. Which theme?** "Which of {domain}'s themes is
     {brand}'s?" Offer up to four palettes, labeled by name, each described with its primary
     and background hex in light and dark. Put the one named after the brand first.
   - Save the chosen entry to `palette.json` and build with `--tokens=palette.json`. Its
     `primary` token is the brand color even when it is nearly black or white. Its `accent`
     token counts as an accent only when it is a real color: shadcn's `--accent` is a hover
     tint, and the builder drops it.
   - Say in the findings that the colors come from the site's design tokens, and name the
     palette.
3. No design tokens: pick the brand color from the ranked colors. Use the top-ranked color,
   unless a `theme-color` meta tag or a CSS variable named primary, brand, or accent points at
   another one in the top three. Pick the accent: the next-ranked color whose hue is at least
   30 degrees from the brand. Pick the site background and text: the highest-ranked neutral
   with lightness over 0.94, and the highest-ranked one under 0.32.
   **T1b. Which color is the brand?** Ask only when the choice is unclear: the top two colors
   score within 20% of each other, the top color was found only in inline styles, or no
   chromatic color was found and the brand is black and white. Question: "Which of these is
   {brand}'s main brand color?" Options: up to three candidates, each labeled with its hex
   and a description of where it was found. The free text field takes a hex. For a black and
   white brand, ask for the accent the same way.
   The ranking is a guess. When the user names a design system, a token file, or another site
   ("use the tokens from atlas.example.com", "here's our CSS"), switch to that source.
4. Look at the top logo candidate before offering it. When the session can view images, open
   the raster candidate. For an SVG, check that the markup draws a wordmark or mark, not a
   generic icon. Skip favicons under 64px when a larger candidate exists.
5. **Show the findings before anything else.** Three to six bullets, each with its source: the
   brand color and where it came from, the accent, the fonts, the logo. This is the web
   research rule from SKILL.md Phase 5. The T2 pick and the T5 confirmation take the place of
   its record, edit, or discard question. Nothing is written until T5.

Site blocked or empty (a 403, a script-only page, no colors found): fall back to `WebFetch` on
the home page with the prompt "List the hex colors used for buttons, links, headers, and CSS
variables, the font families, and the URL of the logo image." If that also finds nothing, say
so in one line and ask T1 again without the research option.

No code execution in the session: use the `WebFetch` fallback for discovery, build the four
palettes by hand from the rules in **Building the options**, and say once that contrast was
checked by eye, not computed. The logo is left out, because it cannot be embedded.

**Pasted tokens.** Save the pasted text to `tokens.css` and run **Brand scan** with
`--css=tokens.css`. Handle the returned `tokenPalettes` exactly as in step 2. Fonts come from
the file's font tokens. The logo still needs a site or a URL, so ask T4 without the "found"
option unless a domain is known.

**Presets.** Used when there is no website, or the user picks presets. Read `brand:summary`,
`brand:business-context`, and `guideline:voice`. Propose four base colors, each with a
two-word name and a one-line reason tied to the brand's category and voice (never a
competitor's color when a `competitor` record names one you know). Build each with the
`forward` variant. The four presets are the T2 options, `variant: "preset"`.

**T2. Pick the palette.** Build the four options (**Building the options**), render them side
by side (**Comparison widget**), then ask "Which palette should {brand}'s pages use?" Options,
in this order:

1. "{Brand} as found": description names brand and accent hex and the header style.
2. "Brand-forward": the brand color leads, with a band header and an analogous accent.
3. "Quiet": neutral surfaces, with the brand only on buttons, links, and the first chart series.
4. "Complement": the brand plus a complementary accent, with a rule header.

Put each option's six key hex values in its `preview` (bg, surface, text, brand, accent, the
first chart color, light and dark) so the user can compare them in the question itself.
Presets replace these four with the four preset names. The free text field takes changes
("darker blue", "use #ff6600 as the accent", "no band"). Rebuild, re-render, and re-ask.
After two rounds of changes, go on with the closest option and say what was not possible.

**T3. Fonts.** Skip this question when the site had no usable font and there are no presets.
"Which fonts should {brand}'s pages use?" Options:

1. "{Display} and {Body}, from {domain} (Recommended)", when both are on Google Fonts. Font
   tokens (`--font-sans`, `--font-display`, `--font-mono`) outrank fonts counted from the
   CSS rules. A palette with only a sans token uses it for both roles. The display face is
   the one the site's own `h1` and `h2` rules set, not the face used by the most classes.
   When the product's tokens and the marketing site disagree, show both and say which is
   which. When the site's font
   is proprietary, offer the closest Google Fonts match instead and say so: "{Match}, closest
   to {Site font}". Match the width as well as the style: a wide face (PP Agrandir Wide,
   Druk Wide, Monument Extended) maps to an expanded cut such as Archivo at `wdth` 125.
2. "Aspire default": Instrument Sans display, IBM Plex Sans body.
3. A pairing that fits the brand's voice, named with a reason (presets, or no site fonts).

The free text field takes any Google Fonts family. Check the chosen `href` with a GET request.
A non-200 response means a family name is wrong: say so and ask again. Monospace data uses the
site's mono token when it has one (add it to `href`), else IBM Plex Mono.

**T4. Logo.** "Show {brand}'s logo in page headers?"

- Found: "Use the logo from {domain} (Recommended)", described as "shown in the preview
  above", and "No logo, brand name only".
- Not found: "No logo, brand name only (Recommended)" and "I'll paste a logo URL".

The free text field takes a public `https` URL to an SVG or PNG. A local file cannot be used,
because teammates and scheduled runs cannot reach it; say so if one is offered. Run **Logo
embed** on the choice. A failure (`ok: false`, or an SVG over 12KB) falls back to the brand
name, and the reply says why.

**T5. Preview and save.** Render the chosen theme once more with the comparison widget, as one
option, with the fonts and logo applied. List any `notes` from the build, such as a brand color
darkened slightly so white text reads on it. Then ask: "Save this theme for {brand}? Every page,
creator card, and chart that the team and scheduled runs publish will use it." Options: "Save
the theme (Recommended)", "Change something". "Change something" returns to the question the
free text names, or to T2.

On save, write the record with `append_calibration`. A `key-exists` response means a theme
already exists: show current vs new in one line each, then run the `supersede_calibration`
Destructive tools confirmation. After the write, say in one line that the next page any flow
publishes will use the theme. Offer to republish a living page (the discovery shortlist, a
readout) only when the user asks.

### Building the options

Run **Theme build** below. With design tokens, pass `--tokens=palette.json` and nothing else.
Without them, pass the brand color, the accent if one was found, and the site background and
text if found. It prints one JSON line per variant with every role in `light` and `dark`, the
header style, `source`, `checks`, and `notes`.

| Variant | Brand | Accent | Surfaces | Header |
| ------- | ----- | ------ | -------- | ------ |
| `found`, with tokens | The site's `primary`, light and dark, exactly as set | The site's accent when it is a real color, else the brand | The site's own tokens, light and dark. Dark is derived only when the site sets none | Band if text reads on the brand color, else rule |
| `found`, no tokens | Site's brand color | Site's accent, or the brand when there is none | Site background and text when they are near-white and near-black, else neutrals with a slight brand tint | Band if text reads on the brand color, else rule |
| `forward` | Brand | Analogous hue, 50 degrees round | Brand-tinted | Band |
| `quiet` | Brand | Same as brand | Pure neutrals | Plain |
| `complement` | Brand | Complementary hue, clamped to a readable lightness | Brand-tinted | Rule |

With tokens, every variation keeps the site's surfaces, text, muted, and border tokens in both
modes, and changes only how the brand is used: the accent, the header, and the chart series.
`found` with tokens changes a site value only when it fails its check (text below 7:1, muted
below 4.5:1, a chart color below 3:1 on the surface), moves it just enough, and says so in
`notes`. Chart tokens are used in order. A series that lands too close to another once it is
readable is dropped, never recolored into a different hue. A site with no dark chart tokens
gets its light series mirrored in lightness.

Dark mode for derived roles keeps each hue and moves lightness. Brand and accent fills are lifted to 0.68 to 0.82
in OKLCH lightness and capped in chroma. Backgrounds sit at 0.17 to 0.21 and text at 0.96.

Every build checks: text on bg and on surface at 7:1, muted on surface at 4.5:1, onBrand and
onAccent on their fills at 4.5:1, brandInk and accentInk on bg and surface at 4.5:1, each
chart color on surface at 3:1, and no two chart colors closer than 0.08 in OKLab. The builder
fixes what it can by moving lightness and reports the rest in `checks`. Never offer a palette
whose `checks` is not `["all pass"]`: rebuild with an adjusted input, or drop that option and
say why. When two variants come out identical (a black and white brand without an accent),
show one and say why.

### Comparison widget

Rendered in chat with the widget tool, loaded the way `connection-card.md` loads it
(`read_me` with `modules: ["mockup"]` once, silently). `show_widget` title
`atlas_theme_options` (or `atlas_theme_preview` for T0 and T5), one loading message such as
`["Building theme previews"]`. Every color is written literally from the build output, so the
panes show exactly what a page will look like in each mode whatever the host's own theme is.
Embed the logo from **Logo embed**. Load the fonts with the chosen `href` when the widget
allows Google Fonts; the fallback stack is fine when it does not.

```html
<style>
.tc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;font-family:var(--tc-body,Inter,ui-sans-serif,system-ui,sans-serif);font-size:13px}
.tc-opt{display:flex;flex-direction:column;gap:8px}
.tc-name{font-weight:600;font-size:14px}
.tc-pane{border:1px solid;border-radius:10px;overflow:hidden}
.tc-head{display:flex;align-items:center;gap:8px;padding:10px 12px;font-family:var(--tc-display,inherit);font-weight:600}
.tc-head img,.tc-head svg{height:22px;width:auto;display:block}
.tc-chip-logo{padding:3px 6px;border-radius:6px}
.tc-body{padding:12px;display:flex;flex-direction:column;gap:10px}
.tc-card{border:1px solid;border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:2px}
.tc-card b{font-family:var(--tc-display,inherit);font-size:20px;line-height:24px}
.tc-bars{display:flex;align-items:flex-end;gap:4px;height:44px}
.tc-bars i{flex:1;border-radius:3px 3px 0 0;display:block}
.tc-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.tc-btn{padding:6px 10px;border-radius:6px;font-weight:500}
.tc-pill{padding:3px 8px;border-radius:999px;border:1px solid;font-size:12px}
.tc-hex{font:12px/16px ui-monospace,monospace;opacity:.8}
</style>
<div class="tc-grid">
  <!-- one .tc-opt per option -->
  <div class="tc-opt">
    <div class="tc-name">{N}. {OPTION NAME}</div>
    <!-- PANE: once with the light roles, once with the dark roles -->
    <div class="tc-pane" style="background:{bg};color:{text};border-color:{border}">
      <div class="tc-head" style="{HEADER STYLE}">{LOGO OR BRAND NAME}</div>
      <div class="tc-body">
        <div class="tc-card" style="background:{surface};border-color:{border}">
          <span style="color:{muted}">Engagement per post</span>
          <b>4.2%</b>
          <span style="color:{brandInk}">+18% vs the 28-day median</span>
        </div>
        <div class="tc-bars"><!-- one <i> per chart color: style="background:{chart[n]};height:{90,70,55,40,30,20}%" --></div>
        <div class="tc-row">
          <span class="tc-btn" style="background:{brand};color:{onBrand}">Draft outreach</span>
          <span class="tc-pill" style="border-color:{border};color:{accentInk}">Tier 2</span>
          <a style="color:{brandInk}">View post</a>
        </div>
      </div>
    </div>
    <div class="tc-hex">brand {brand} · accent {accent} · {fonts or "default fonts"}</div>
  </div>
</div>
```

`{HEADER STYLE}`: band is `background:{brand};color:{onBrand}`. Rule is
`border-top:4px solid {brand};background:{surface}`. Plain is `background:{surface}`, with a
`{border}` bottom border. A `mono` logo needs no chip, because it draws in the header's own
text color. Put any other logo on a chip (`class="tc-chip-logo"`,
`background:{surface}` of the other mode) when its `tone` matches what is behind it: a dark
logo on a dark pane or dark band, a light logo on a light pane or light band.

**Artifact.** In Claude Code, or whenever the widget tool is missing or its call fails,
publish the same markup as a page with the Artifact tool (load `artifact-design` first),
titled "<Brand> Theme Options". Open it for the user with the Artifact tool's `open` action,
and link it in the reply, before asking T2. For T0 and T5, republish to the same file path so
the link stays the same. No Artifact tool either: list each option as a short Markdown table of its hex
values, and say that the preview could not be drawn.

## Applying the theme (every flow)

### Reading

Every flow that publishes a page already reads all calibrations. Take `theme:brand` from that
read. A missing or retracted record means the flow's own design rules apply unchanged: that is
the Aspire default, and nothing below applies. Agents never ask about the theme and never
offer to set one up. Unattended runs apply a saved theme the same way.

### Page tokens

Put the theme block in the page `<head>`, after the page's own tokens, so its values win:

```html
<link rel="stylesheet" href="{fonts.href}">  <!-- only when fonts is set -->
<style>
:root{--bg:{light.bg};--surface:{light.surface};--text:{light.text};--muted:{light.muted};--border:{light.border};
  --brand:{light.brand};--on-brand:{light.onBrand};--brand-ink:{light.brandInk};
  --accent:{light.accent};--on-accent:{light.onAccent};--accent-ink:{light.accentInk};
  --chart-1:{light.chart[0]};/* … through --chart-6 */
  --font-display:"{fonts.display}",ui-sans-serif,system-ui,sans-serif;--font-body:"{fonts.body}",ui-sans-serif,system-ui,sans-serif;
  --font-mono:"{fonts.mono}",ui-monospace,monospace;--font-display-stretch:{fonts.displayStretch};--radius:{radius}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){/* the same names with the dark values */}}
:root[data-theme="dark"]{/* the same names with the dark values */}
</style>
```

Leave the font variables out when `fonts` is `null`, `--font-mono` out when `fonts.mono` is
`null`, `--font-display-stretch` out when `fonts.displayStretch` is `null`, and `--radius` out
when `radius` is `null`. The page's layout and structure stay
exactly as its own reference describes. Map the roles onto the page's own tokens:

| Page element | Theme role |
| ------------ | ---------- |
| Page background, cards and panels, body text, secondary text, rules and borders | `bg`, `surface`, `text`, `muted`, `border` |
| Links, highlighted numbers, active tabs, thin accent lines, section markers | `brand-ink` |
| Primary buttons, selected chips, the header band | `brand` with `on-brand` |
| Secondary highlights, tags, a second emphasis | `accent-ink` as text, `accent` with `on-accent` as fill |
| Headings and large numbers / everything else / data and code | `font-display` (with `font-stretch: var(--font-display-stretch)`) / `font-body` / `font-mono` |
| Card and panel corners | `radius`, when set |
| Status chips, verdicts, deltas, and alerts | Unchanged: the page's semantic colors |

### Header

Follow `header`. `band`: a full-width strip in `brand` with `on-brand` text, holding the logo or
brand name and the page title. `rule`: a 4px `brand` top rule on the page's normal header.
`plain`: the page's normal header. The logo sits at the start of the header, 28px high,
`width:auto`, with `alt` from `logo.alt`. Use the chip rule from **Comparison widget** when its
`tone` matches what is behind it.

### Logo

- `logo.svg`: paste the markup inline in the header. It was sanitized when it was saved. A
  `mono` logo draws in `currentColor`, so set the header's `color` and the logo follows it.
- `logo.url`: run **Logo embed** at build time and use the returned `dataUri` in an `<img>`.
  `ok: false`, or no code execution in the session: show the brand name in `font-display`
  instead. Never put a remote logo URL in a page, and never substitute another image.

### Charts

Series take `chart` in order (`--chart-1` first), from the mode's own list. A single-series
chart uses `--chart-1`. "Highlight one, mute the rest" uses `--chart-1` against `muted`.
Charts that encode a status (above or below the baseline, pass or fail) keep their semantic
colors. More series than the theme holds: group the smallest into "Other" before adding any
color from outside the theme.

### Creator card

The card carries Aspire's tokens (`creator-card.md`, **Style block**). With a theme saved, add
this block right after the card's style block, on pages and in inline widgets alike. Use
`brandInk` rather than `brand`, because the card draws its fit ring as text on the card
surface. `brandInk` equals `brand` whenever the brand already reads there.

```html
<style>
.ac-card{--ac-brand:{light.brandInk};--ac-on-brand:{light.surface};font-family:var(--font-body,Inter,ui-sans-serif,system-ui,sans-serif)}
:root[data-theme="light"] .ac-card{--ac-brand:{light.brandInk};--ac-on-brand:{light.surface}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .ac-card{--ac-brand:{dark.brandInk};--ac-on-brand:{dark.surface}}}
:root[data-theme="dark"] .ac-card,.dark .ac-card{--ac-brand:{dark.brandInk};--ac-on-brand:{dark.surface}}
</style>
```

The card's ok, warn, and neutral tiles keep their colors. Inline widgets write the font name
into `font-family` directly, since they have no page tokens.

## Snippets

Save each to the session's temp directory and run it with Python 3. Brand scan and Theme build
use the standard library only. Logo embed needs Pillow for raster logos; SVG needs nothing.
Each prints one JSON object per line.

### Brand scan

```bash
python3 brand_scan.py example.com
python3 brand_scan.py --css=tokens.css     # a pasted token file: design tokens only, no fetching
```

Prints `{url, finalUrl, stylesheetsRead, tokenPalettes[], colors[{hex, score, sources}],
neutrals[{hex, score, sources, lightness}], fonts{display[], body[]}, googleFontsLinked[],
logos[]}`, or `{"ok": false, "error"}`. Each `tokenPalettes` entry is `{name, selector,
active, light{role: hex}, dark{role: hex}, chart{light[], dark[]}, fonts{display, body, mono},
radius}`. It groups custom properties by the scope that sets them (`:root`, `[data-palette=x]`,
`.dark`, `[data-theme=dark]`, a dark `prefers-color-scheme` block), resolves `var()`, reads
hex, `rgb()`, `hsl()`, `oklch()`, and bare shadcn HSL channels, and maps token names to roles
(`--background`, `--card`, `--foreground`, `--muted-foreground`, `--border`, `--primary`,
`--primary-foreground`, and common aliases such as `--bg`, `--fg`, `--card-pure`,
`--muted-fg`). Inline SVG logo candidates are written to `logo-inline-N.svg` in the
working directory and listed as `{file, kind}`.

```python
import colorsys, json, math, re, sys, urllib.parse, urllib.request
from collections import defaultdict

UA = {"User-Agent": "Mozilla/5.0 (compatible; aspire-atlas-plugin)"}
GENERIC = {"inherit", "initial", "unset", "serif", "sans-serif", "monospace", "cursive",
           "system-ui", "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto", "arial",
           "helvetica", "helvetica neue", "ui-sans-serif", "ui-serif", "ui-monospace",
           "apple color emoji", "segoe ui emoji", "noto color emoji", "times new roman",
           "georgia", "courier new", "menlo", "monaco", "consolas", "var", "emoji"}
HOT = re.compile(r"btn|button|cta|primary|brand|accent|header|nav|hero|link|\ba\b", re.I)
HEAD = re.compile(r"\bh[1-3]\b|heading|title|display|hero", re.I)
NOISE = re.compile(r"error|invalid|danger|warning|success|alert|shopify-payment|klaviyo|"
                   r"cookie|onetrust|consent|recaptcha|progress", re.I)
BODY = re.compile(r"^\s*(html|body|p|:root)\b", re.I)


def fetch(url, limit=1_500_000):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=10) as r:
        return r.geturl(), r.read(limit).decode("utf-8", "replace")


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def oklch(hexv):
    r, g, b = (lin(int(hexv[i:i + 2], 16)) for i in (1, 3, 5))
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, A, B, math.hypot(A, B)


def norm(tok):
    tok = tok.strip().lower()
    m = re.fullmatch(r"#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?", tok)
    if m:
        h = m.group(1)
        if m.group(2) and int(m.group(2), 16) < 200:
            return None  # mostly transparent
        return "#" + ("".join(c * 2 for c in h) if len(h) == 3 else h)
    m = re.fullmatch(r"rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)", tok)
    if m:
        a = m.group(4)
        if a and (float(a.rstrip("%")) / (100 if a.endswith("%") else 1)) < 0.8:
            return None
        return "#" + "".join(f"{min(255, int(v)):02x}" for v in m.groups()[:3])
    return None


# ---- design tokens: named custom properties, grouped by the theme scope that sets them ----
ROLES = {  # role -> token names, most specific first (shadcn, Radix-style, and common custom names)
    "bg": ["background", "bg", "color-background", "page", "surface-page", "paper"],
    "surface": ["card", "card-pure", "surface", "color-surface", "panel", "popover"],
    "text": ["foreground", "fg", "color-foreground", "text", "color-text", "ink"],
    "muted": ["muted-foreground", "muted-fg", "text-muted", "color-text-muted", "text-secondary"],
    "border": ["border", "color-border", "line", "rule", "divider"],
    "brand": ["primary", "brand", "color-primary", "brand-primary", "color-brand"],
    "onBrand": ["primary-foreground", "primary-fg", "on-primary", "on-brand", "brand-foreground"],
    "accent": ["brand-accent", "highlight", "color-accent", "accent"],
    "onAccent": ["accent-foreground", "on-accent", "accent-fg"],
}
FONT_ROLES = {"display": ["font-display", "font-heading", "font-serif", "font-title"],
              "body": ["font-sans", "font-body", "font-text", "font-base"],
              "mono": ["font-mono", "font-code"]}
DARK = re.compile(r"\[data-(?:theme|mode|color-scheme)=[\"']?dark[\"']?\]|\.dark\b|\.theme-dark\b", re.I)


def color_value(v):
    """Hex for a CSS color value: hex, rgb(), hsl(), oklch(), or bare shadcn HSL channels."""
    v = v.strip().lower()
    hexv = norm(v)
    if hexv:
        return hexv
    m = re.fullmatch(r"(?:hsla?\()?\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:\s*[,/]\s*[\d.]+%?)?\s*\)?", v)
    if m:
        h, s, l = float(m.group(1)) / 360, float(m.group(2)) / 100, float(m.group(3)) / 100
        return "#" + "".join(f"{round(c * 255):02x}" for c in colorsys.hls_to_rgb(h, l, s))
    m = re.fullmatch(r"oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*/\s*[\d.]+%?)?\s*\)", v)
    if m:
        L = float(m.group(1)) / (100 if m.group(2) else 1)
        C, H = float(m.group(3)), math.radians(float(m.group(4)))
        A, B = C * math.cos(H), C * math.sin(H)
        l, mm, s = ((L + 0.3963377774 * A + 0.2158037573 * B) ** 3, (L - 0.1055613458 * A - 0.0638541728 * B) ** 3,
                    (L - 0.0894841775 * A - 1.2914855480 * B) ** 3)
        rgb = (4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
               -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
               -0.0041960863 * l - 0.7034186147 * mm + 1.7076147010 * s)
        gam = lambda x: 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055
        return "#" + "".join(f"{round(min(max(gam(min(max(x, 0), 1)), 0), 1) * 255):02x}" for x in rgb)
    return None


def css_blocks(css):
    """Yield (at-rule preludes, selector, declarations) for every leaf rule, keeping @media context."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    stack, start = [], 0
    for i, ch in enumerate(css):
        if ch == "{":
            stack.append(css[start:i].strip())
            start = i + 1
        elif ch == "}":
            if stack:
                sel = stack.pop()
                yield [p for p in stack if p.startswith("@")], sel, css[start:i]
            start = i + 1


def scope_of(sel, media):
    """(scope key, is_dark) for one selector, or None when it is not a theme scope."""
    s = re.sub(r"\s+", "", sel).replace("'", "").replace('"', "")
    dark = bool(DARK.search(s)) or any("prefers-color-scheme:dark" in re.sub(r"\s", "", m) for m in media)
    base = DARK.sub("", s)
    base = re.sub(r":not\(\[data-theme=light\]\)|:root|^html|^body|^\*", "", base)
    if not base:
        return "default", dark
    if re.fullmatch(r"(\[data-[\w-]+=[\w-]+\]|\.[\w-]+)+", base):
        return base, dark
    return None


def token_palettes(css, html=""):
    scopes = {}
    for media, sel, decls in css_blocks(css):
        props = dict((k[2:].lower(), v.strip()) for k, v in re.findall(r"(--[\w-]+)\s*:\s*([^;]+)", decls))
        if not props:
            continue
        for one in sel.split(","):
            sc = scope_of(one, media)
            if sc:
                scopes.setdefault(sc[0], [{}, {}])[1 if sc[1] else 0].update(props)
    out = []
    default_light, default_dark = scopes.get("default", [{}, {}])
    role_names = {n for names in ROLES.values() for n in names}
    for key, (light, dark) in scopes.items():
        if key != "default" and not role_names & (light.keys() | dark.keys()):
            continue  # a utility class setting its own variables, not a theme
        name = "default" if key == "default" else re.sub(r"\[data-[\w-]+=|\]|^\.", "", key).replace("][", "/")
        L = {**default_light, **light}
        D = {**default_light, **default_dark, **light, **dark} if (dark or default_dark) else {}

        def resolve(props, v, depth=0):
            m = re.fullmatch(r"var\(\s*--([\w-]+)\s*(?:,\s*(.+))?\)", v.strip())
            if not m or depth > 8:
                return v
            return resolve(props, props.get(m.group(1).lower(), m.group(2) or ""), depth + 1)

        def roles(props):
            r = {}
            for role, names in ROLES.items():
                for n in names:
                    c = color_value(resolve(props, props[n])) if n in props else None
                    if c:
                        r[role] = c
                        break
            chart = [color_value(resolve(props, props[f"chart-{i}"])) for i in range(1, 9) if f"chart-{i}" in props]
            return r, [c for c in chart if c]

        lr, lc = roles(L)
        dr, dc = roles(D) if D else ({}, [])
        if not ({"brand", "bg"} <= lr.keys() or {"bg", "text"} <= lr.keys()):
            continue
        fonts = {}
        for role, names in FONT_ROLES.items():
            for n in names:
                if n in L:
                    fam = resolve(L, L[n]).split(",")[0].strip().strip("'\"")
                    if fam and fam.lower() not in GENERIC and not fam.startswith("var("):
                        fonts[role] = fam
                        break
        # a dark block that sets no chart colours inherits the light ones; report that as missing
        dark_chart = dc if dark and any(k.startswith("chart-") for k in dark) else []
        out.append({"name": name, "selector": key, "light": lr, "dark": dr,
                    "chart": {"light": lc, "dark": dark_chart}, "fonts": fonts,
                    "radius": resolve(L, L["radius"]) if "radius" in L else None, "active": None})
    mark_active(out, html)
    return out


def mark_active(palettes, html):
    """Which palette the page shows by default: an attribute on <html>/<body> in the served
    markup, or else the name a boot script sets most often for that attribute."""
    tags = " ".join(re.findall(r"<(?:html|body)\b[^>]*>", html, re.I))
    scripts = re.findall(r"<script\b[^>]*>(.*?)</script>", html, re.S | re.I)
    counts = []
    for p in palettes:
        m = re.match(r"\[data-([\w-]+)=([\w-]+)\]", p["selector"])
        if not m:
            continue
        attr, val = m.groups()
        if re.search(rf"data-{attr}=[\"']?{re.escape(val)}\b", tags):
            p["active"] = "html attribute"
            return
        n = sum(len(re.findall(rf"[\"']{re.escape(val)}[\"']", t)) for t in scripts
                if f"data-{attr}" in t or f"dataset.{attr}" in t)
        counts.append((n, p))
    counts.sort(key=lambda x: x[0], reverse=True)
    if counts and counts[0][0] and (len(counts) == 1 or counts[0][0] > counts[1][0]):
        counts[0][1]["active"] = "boot script default"


COLOR = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)")


def scan(url):
    if not re.match(r"https?://", url):
        url = "https://" + url
    final, html = fetch(url)
    css_chunks = re.findall(r"<style[^>]*>(.*?)</style>", html, re.S | re.I)
    sheets = re.findall(r"<link[^>]+rel=[\"']?stylesheet[^>]*>", html, re.I)
    gfonts = []
    for tag in sheets[:8]:
        href = re.search(r"href=[\"']([^\"']+)", tag)
        if not href:
            continue
        u = urllib.parse.urljoin(final, href.group(1).replace("&amp;", "&"))
        if "fonts.googleapis.com" in u:
            gfonts += [urllib.parse.unquote_plus(f).split(":")[0]
                       for f in re.findall(r"family=([^&]+)", u)]
            continue
        try:
            css_chunks.append(fetch(u)[1])
        except Exception:
            pass
    css = "\n".join(css_chunks)
    gfonts += [urllib.parse.unquote_plus(f).split(":")[0] for f in
               re.findall(r"fonts\.googleapis\.com/css2?\?family=([^&\"')]+)", css)]

    score, where = defaultdict(float), defaultdict(set)
    fonts = {"display": defaultdict(float), "body": defaultdict(float)}

    def add(hexv, w, src):
        if hexv:
            score[hexv] += w
            where[hexv].add(src)

    for sel, decls in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        sel = sel.strip()[-200:]
        for prop, val in re.findall(r"([\w-]+)\s*:\s*([^;]+)", decls):
            prop = prop.lower()
            if prop.startswith("--"):
                w = 4 if re.search(r"primary|brand|accent|main|theme", prop, re.I) else 0.5
                for c in COLOR.findall(val):
                    add(norm(c), w, f"CSS variable {prop}")
            elif prop in ("color", "background", "background-color", "border-color", "fill",
                          "stroke", "outline-color", "border", "border-bottom", "border-top"):
                w = 0.2 if NOISE.search(sel) else 3 if HOT.search(sel) else 1
                for c in COLOR.findall(val):
                    add(norm(c), w, f"{prop} on {sel.split(',')[0][:60]}")
            elif prop in ("font-family", "font"):
                fam = val.split(",")[0].strip().strip("'\"")
                if prop == "font":
                    fam = re.split(r"\s\d", val.split(",")[0])[-1].strip().strip("'\"") if "," in val else ""
                if fam and fam.lower() not in GENERIC and not fam.lower().startswith("var("):
                    element = re.fullmatch(r"\s*(h[1-2]|body|html)\s*", sel)  # the base rule wins over class counts
                    weight = 1000 if element else 2 if BODY.search(sel) or HEAD.search(sel) else 1
                    fonts["display" if HEAD.search(sel) else "body"][fam] += weight

    for tag in re.findall(r"<meta[^>]+>", html, re.I):
        if re.search(r"name=[\"'](theme-color|msapplication-TileColor)", tag, re.I):
            c = re.search(r"content=[\"']([^\"']+)", tag)
            if c:
                add(norm(c.group(1)), 12, "theme-color meta tag")
    for tag in re.findall(r"<link[^>]+rel=[\"']mask-icon[^>]*>", html, re.I):
        c = re.search(r"color=[\"']([^\"']+)", tag)
        if c:
            add(norm(c.group(1)), 8, "mask-icon color")
    for c in COLOR.findall(" ".join(re.findall(r"style=[\"']([^\"']+)", html))):
        add(norm(c), 0.5, "inline style")

    merged = []  # cluster near-identical colors
    for hexv in sorted(score, key=score.get, reverse=True):
        L, A, B, C = oklch(hexv)
        for m in merged:
            if math.dist((L, A, B), m["lab"]) < 0.035:
                m["score"] += score[hexv]
                m["sources"] |= where[hexv]
                break
        else:
            merged.append({"hex": hexv, "lab": (L, A, B), "chroma": C, "L": L,
                           "score": score[hexv], "sources": set(where[hexv])})
    out = lambda m: {"hex": m["hex"], "score": round(m["score"], 1),
                     "sources": sorted(m["sources"])[:3]}
    merged.sort(key=lambda m: m["score"], reverse=True)
    chromatic = [m for m in merged if m["chroma"] >= 0.04]
    neutrals = [m for m in merged if m["chroma"] < 0.04]

    logos = []
    for tag in re.findall(r"<img[^>]+>", html, re.I):
        if re.search(r"logo", tag, re.I):
            src = re.search(r"\ssrc=[\"']([^\"']+)", tag)
            if src and not src.group(1).startswith("data:"):
                logos.append({"url": urllib.parse.urljoin(final, src.group(1)), "kind": "img"})
    # an inline <svg> counts when its tag, its first child, or the element wrapping it names a logo
    for m in re.finditer(r"(<(?:a|div|span)[^>]{0,300}>\s*)?(<svg\b[^>]*>)(.*?</svg>)", html, re.S | re.I):
        wrap, tag, rest = m.group(1) or "", m.group(2), m.group(3)
        if re.search(r"logo", wrap + tag + rest[:200], re.I) and len(tag + rest) < 20000:
            path = f"logo-inline-{sum('file' in l for l in logos) + 1}.svg"
            open(path, "w").write(tag + rest)
            logos.append({"file": path, "kind": "inline-svg"})
        if sum("file" in l for l in logos) >= 3:
            break
    for rel in ("apple-touch-icon", "icon"):
        for tag in re.findall(rf"<link[^>]+rel=[\"'][^\"']*\b{rel}\b[^>]*>", html, re.I):
            href = re.search(r"href=[\"']([^\"']+)", tag)
            if href:
                logos.append({"url": urllib.parse.urljoin(final, href.group(1)), "kind": rel})
    seen = set()
    logos = [l for l in logos if not (l.get("url", l.get("file")) in seen or seen.add(l.get("url", l.get("file"))))]
    logos.sort(key=lambda x: (x.get("url", "").lower().split("?")[0].endswith(".svg") or "file" in x) * -1
               + {"inline-svg": 0, "img": 0, "apple-touch-icon": 2, "icon": 3}[x["kind"]])

    def gf(fam):
        try:
            q = urllib.parse.quote_plus(fam)
            urllib.request.urlopen(urllib.request.Request(
                f"https://fonts.googleapis.com/css2?family={q}", headers=UA), timeout=10)
            return True
        except Exception:
            return False

    fam_out = {}
    for role in ("display", "body"):
        ranked = sorted(fonts[role], key=fonts[role].get, reverse=True)[:3]
        fam_out[role] = [{"family": f, "googleFonts": f in gfonts or gf(f)} for f in ranked]
    page = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S | re.I)
    return {"url": url, "finalUrl": final, "stylesheetsRead": len(css_chunks),
            "tokenPalettes": token_palettes(css, page),
            "colors": [out(m) for m in chromatic[:8]],
            "neutrals": [dict(out(m), lightness=round(m["L"], 2)) for m in neutrals[:6]],
            "fonts": fam_out, "googleFontsLinked": sorted(set(gfonts)),
            "logos": logos[:5]}


if __name__ == "__main__":
    try:
        if sys.argv[1].startswith("--css="):  # a pasted or downloaded token file, no fetching
            print(json.dumps({"tokenPalettes": token_palettes(open(sys.argv[1][6:]).read())}))
        else:
            print(json.dumps(scan(sys.argv[1])))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
```

### Theme build

```bash
python3 theme_build.py --tokens=palette.json [found forward quiet complement]
python3 theme_build.py --brand=#1e4945 [--accent=#dcc697] [--bg=#f1ebe4] [--text=#162826] [found forward quiet complement]
```

With no variant names, it prints all four. `palette.json` is one `tokenPalettes` entry from
the scan.

```python
import json, math, sys


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def delin(x):
    return 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055


def to_lch(hexv):
    r, g, b = (lin(int(hexv[i:i + 2], 16) / 255) for i in (1, 3, 5))
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360


def rgb_of(L, C, h):
    A, B = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
    m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
    s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3
    return (4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)


def hexc(L, C, h):
    L = min(max(L, 0), 1)
    while C > 0 and not all(-1e-4 <= v <= 1 + 1e-4 for v in rgb_of(L, C, h)):
        C = max(0, C - 0.002)  # pull into sRGB gamut by dropping chroma
    chan = lambda v: round(min(max(delin(min(max(v, 0), 1)), 0), 1) * 255)
    return "#" + "".join(f"{chan(v):02x}" for v in rgb_of(L, C, h))


def lum(hexv):
    r, g, b = (lin(int(hexv[i:i + 2], 16) / 255) for i in (1, 3, 5))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    x, y = sorted((lum(a), lum(b)), reverse=True)
    return (x + 0.05) / (y + 0.05)


def ink(hexv, against, target, step):
    """Move lightness (step < 0 darkens) until hexv reaches target contrast against `against`."""
    L, C, h = to_lch(hexv)
    for _ in range(60):
        if contrast(hexv, against) >= target:
            return hexv
        L += step
        hexv = hexc(L, C, h)
    return hexv


def on(fill):
    return max(("#ffffff", "#111111"), key=lambda t: contrast(fill, t))


def fill(hexv, notes, name):
    """A fill that carries text: darken it just enough for white text when neither white nor
    near-black reaches 4.5:1."""
    if contrast(hexv, on(hexv)) >= 4.5:
        return hexv
    fixed = ink(hexv, "#ffffff", 4.5, -0.01)
    notes.append(f"{name} {hexv} darkened to {fixed} so text on it reads")
    return fixed


def dist(a, b):
    (L1, C1, h1), (L2, C2, h2) = to_lch(a), to_lch(b)
    p = lambda L, C, h: (L, C * math.cos(math.radians(h)), C * math.sin(math.radians(h)))
    return math.dist(p(L1, C1, h1), p(L2, C2, h2))


def hue_gap(a, b):
    return abs((a - b + 180) % 360 - 180)


BASE_HUES = [255, 65, 160, 345, 295, 200, 120, 25]


def chart(series, surface, dark):
    L0, C0 = (0.74, 0.13) if dark else (0.58, 0.15)
    step = 0.02 if dark else -0.02
    out = []
    for c in series:
        c = ink(c, surface, 3.0, step)
        if all(dist(c, o) >= 0.1 for o in out):
            out.append(c)
    for hue in BASE_HUES:
        if len(out) >= 6:
            break
        c = ink(hexc(L0 - (0.06 if len(out) % 2 and not dark else 0), C0, hue), surface, 3.0, step)
        if all(hue_gap(hue, to_lch(o)[2]) >= 40 and dist(c, o) >= 0.08 for o in out):
            out.append(c)
    return out


def mode(brand, accent, variant, dark, notes, site_bg=None, site_text=None):
    Lb, Cb, hb = to_lch(brand)
    tint = 0 if variant == "quiet" else min(0.012, Cb * 0.15)
    if dark:
        bg, surface = hexc(0.17, tint * 0.8, hb), hexc(0.21, tint * 0.8, hb)
        text, muted, border = hexc(0.96, tint, hb), hexc(0.76, tint, hb), hexc(0.33, tint, hb)
        b = hexc(min(max(Lb, 0.68), 0.80), min(Cb, 0.16), hb)
        La, Ca, ha = to_lch(accent)
        a = hexc(min(max(La, 0.68), 0.82), min(Ca, 0.15), ha)
    else:
        bg = site_bg if variant == "found" and site_bg and to_lch(site_bg)[0] > 0.94 else \
            hexc(0.985, tint, hb)
        surface = "#ffffff" if variant != "forward" else hexc(0.997, tint * 0.3, hb)
        text = site_text if variant == "found" and site_text and to_lch(site_text)[0] < 0.32 else \
            hexc(0.21, tint * 1.5, hb)
        muted, border = hexc(0.47, tint * 1.5, hb), hexc(0.90, tint, hb)
        b, a = fill(brand, notes, "brand"), fill(accent, notes, "accent")
    step = 0.02 if dark else -0.02
    roles = {"bg": bg, "surface": surface, "text": text,
             "muted": ink(muted, surface, 4.5, step), "border": border,
             "brand": b, "onBrand": on(b), "brandInk": ink(ink(b, surface, 4.5, step), bg, 4.5, step),
             "accent": a, "onAccent": on(a), "accentInk": ink(ink(a, surface, 4.5, step), bg, 4.5, step)}
    roles["chart"] = chart([roles["brandInk"] if contrast(b, surface) < 3 else b] +
                           ([] if variant == "quiet" else [a]), surface, dark)
    return roles


def keep_or_fix(roles, key, against, target, step, notes, m):
    """Keep a site token unless it fails its contrast check; then move it just enough, and say so."""
    fixed = ink(roles[key], roles[against], target, step)
    if fixed != roles[key]:
        notes.append(f"{m} {key} {roles[key]} adjusted to {fixed} for contrast")
        roles[key] = fixed


def token_chart(series, surface, dark, notes, m):
    step = 0.02 if dark else -0.02
    out = []
    for c in series:
        f = ink(c, surface, 3.0, step)
        if all(dist(f, o) >= 0.08 for o in out):
            if f != c:
                notes.append(f"{m} chart {c} adjusted to {f} to read on the surface")
            out.append(f)
        else:
            notes.append(f"{m} chart {c} dropped: too close to another series once readable")
    return out


def from_tokens(tok, variant_notes):
    """The site's own palette, exactly as its design tokens set it, with only failing roles fixed."""
    out = {}
    for m in ("light", "dark"):
        dark = m == "dark"
        src = tok.get(m) or {}
        if dark and not src:
            out[m] = None  # no dark tokens: the caller derives dark mode
            continue
        r = dict(src)
        if "accent" in r and (to_lch(r["accent"])[1] < 0.04 or r["accent"] in (r.get("bg"), r.get("surface"))):
            r.pop("accent")  # shadcn's --accent is a hover tint, not a brand accent
            r.pop("onAccent", None)
        if "brand" in r and "accent" not in r:
            r["accent"] = r["brand"]
            if "onBrand" in r:
                r["onAccent"] = r["onBrand"]
        brand = tok["light"]["brand"]  # fills in only the roles the tokens leave out
        base = mode(brand, brand, "found", dark, [], tok["light"].get("bg"), tok["light"].get("text"))
        for k in ("bg", "surface", "text", "muted", "border", "brand", "accent"):
            r.setdefault(k, base[k])
        r.setdefault("onBrand", on(r["brand"]))
        r.setdefault("onAccent", on(r["accent"]))
        step = 0.02 if dark else -0.02
        for key, against, need in (("text", "bg", 7), ("muted", "surface", 4.5)):
            keep_or_fix(r, key, against, need, step, variant_notes, m)
        if contrast(r["onBrand"], r["brand"]) < 4.5:
            r["onBrand"] = on(r["brand"])
        if contrast(r["onAccent"], r["accent"]) < 4.5:
            r["onAccent"] = on(r["accent"])
        r["brandInk"] = ink(ink(r["brand"], r["surface"], 4.5, step), r["bg"], 4.5, step)
        r["accentInk"] = ink(ink(r["accent"], r["surface"], 4.5, step), r["bg"], 4.5, step)
        series = (tok.get("chart") or {}).get(m) or []
        if dark and not series:  # mirror the light series' lightness onto the dark surface
            series = [hexc(min(max(1.02 - to_lch(c)[0], 0.4), 0.95), to_lch(c)[1], to_lch(c)[2])
                      for c in (tok.get("chart") or {}).get("light") or []]
        r["chart"] = token_chart(series, r["surface"], dark, variant_notes, m) if series else \
            chart([r["brandInk"] if contrast(r["brand"], r["surface"]) < 3 else r["brand"]], r["surface"], dark)
        if len(r["chart"]) < 3:
            r["chart"] = chart(r["chart"], r["surface"], dark)
        out[m] = {k: r[k] for k in ("bg", "surface", "text", "muted", "border", "brand", "onBrand", "brandInk",
                                    "accent", "onAccent", "accentInk", "chart")}
    return out


def build(brand, variant, accent=None, site_bg=None, site_text=None, tokens=None):
    Lb, Cb, hb = to_lch(brand)
    neutral = Cb < 0.015  # black, white or grey brand: variants lean on the accent
    if variant == "quiet":
        accent = brand
    elif neutral and not accent:
        accent = brand
    elif neutral:  # shift from the accent instead of the hue-less brand
        La, Ca, ha = to_lch(accent)
        accent = {"forward": hexc(La, Ca * 0.9, (ha + 50) % 360),
                  "complement": hexc(min(max(La, 0.55), 0.75), min(max(Ca, 0.08), 0.15),
                                     (ha + 180) % 360)}.get(variant, accent)
    elif variant == "complement":
        accent = hexc(min(max(Lb, 0.55), 0.75), min(max(Cb, 0.08), 0.15), (hb + 180) % 360)
    elif variant == "forward":  # analogous hue, lifted and saturated enough to read as a second colour
        accent = hexc(min(max(Lb, 0.45), 0.7), max(Cb * 0.9, 0.06), (hb + 50) % 360)
    elif not accent:
        accent = brand  # found, but the site showed no second color
    header = {"found": "band" if contrast(brand, on(brand)) >= 4.5 else "rule",
              "forward": "band", "quiet": "plain", "complement": "rule"}[variant]
    notes = []
    t = {"variant": variant, "header": header,
         "light": mode(brand, accent, variant, False, notes, site_bg, site_text),
         "dark": mode(brand, accent, variant, True, notes)}
    if tokens and variant == "found":
        site = from_tokens(tokens, notes)
        t["source"] = "design tokens" + ("" if site["dark"] else " (dark mode derived: the site sets none)")
        t["light"] = site["light"]
        t["dark"] = site["dark"] or t["dark"]
        t["header"] = "band" if contrast(t["light"]["brand"], t["light"]["onBrand"]) >= 4.5 else "rule"
    elif tokens:  # variations keep the site's own surfaces and text, and change only how the brand is used
        site = from_tokens(tokens, [])
        t["source"] = "design tokens surfaces"
        for m in ("light", "dark"):
            if not site[m]:
                continue
            r = t[m]
            for k in ("bg", "surface", "text", "muted", "border"):
                r[k] = site[m][k]
            step = 0.02 if m == "dark" else -0.02
            r["onBrand"], r["onAccent"] = on(r["brand"]), on(r["accent"])
            r["brandInk"] = ink(ink(r["brand"], r["surface"], 4.5, step), r["bg"], 4.5, step)
            r["accentInk"] = ink(ink(r["accent"], r["surface"], 4.5, step), r["bg"], 4.5, step)
            r["chart"] = chart([r["brandInk"] if contrast(r["brand"], r["surface"]) < 3 else r["brand"]] +
                               ([] if variant == "quiet" else [r["accent"]]), r["surface"], m == "dark")
    checks = []
    for m in ("light", "dark"):
        r = t[m]
        for fg, bgk, need in (("text", "bg", 7), ("text", "surface", 7), ("muted", "surface", 4.5),
                              ("onBrand", "brand", 4.5), ("onAccent", "accent", 4.5),
                              ("brandInk", "surface", 4.5), ("brandInk", "bg", 4.5),
                              ("accentInk", "surface", 4.5)):
            if fg == "onAccent" and r["accent"] == r["brand"]:
                continue
            ratio = contrast(r[fg], r[bgk])
            if ratio < need:
                checks.append(f"{m}: {fg} on {bgk} {ratio:.2f} < {need}")
        for c in r["chart"]:
            if contrast(c, r["surface"]) < 3:
                checks.append(f"{m}: chart {c} on surface < 3")
        pair = min((dist(x, y), x, y) for i, x in enumerate(r["chart"]) for y in r["chart"][i + 1:])
        if pair[0] < 0.08:
            checks.append(f"{m}: chart {pair[1]} and {pair[2]} too close ({pair[0]:.3f})")
    t["checks"] = checks or ["all pass"]
    t["notes"] = sorted(set(notes))
    return t


if __name__ == "__main__":
    args = dict(a.lstrip("-").split("=", 1) for a in sys.argv[1:] if "=" in a)
    variants = [a for a in sys.argv[1:] if "=" not in a] or ["found", "forward", "quiet", "complement"]
    tokens = json.load(open(args["tokens"])) if "tokens" in args else None
    if tokens:  # one entry of the scan's tokenPalettes: its brand, accent and surfaces anchor every variant
        lt = tokens["light"]
        args.setdefault("brand", lt["brand"])
        acc = lt.get("accent")
        if acc and to_lch(acc)[1] >= 0.04 and acc not in (lt.get("bg"), lt.get("surface")):
            args.setdefault("accent", acc)  # a hover or muted token is not a brand accent
        args.setdefault("bg", lt.get("bg", ""))
        args.setdefault("text", lt.get("text", ""))
    for v in variants:
        print(json.dumps(build(args["brand"].lower(), v, args.get("accent", "").lower() or None,
                               args.get("bg", "").lower() or None, args.get("text", "").lower() or None,
                               tokens)))
```

### Logo embed

```bash
python3 logo_embed.py https://example.com/logo.svg     # or a logo-inline-N.svg from the scan
```

Prints `{ok, format, tone, opaqueBg, bytes, dataUri}` (SVG adds `markup`, raster adds `width`
and `height`), or `{"ok": false, "error"}`. It strips scripts, event handlers, and external
references from SVG. An SVG drawn in one color (masks and clip paths aside) is recolored to
`currentColor` and reported as `tone: "mono"`.
Raster logos are scaled to 64px high and saved as PNG, with the alpha channel kept. The cap is
30KB. For an inline SVG, save `markup` to `logo.svg` in the record when it is under 12KB.

```python
import base64, io, json, re, sys, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (compatible; aspire-atlas-plugin)"}
MAX_BYTES = 30_000


def lum(r, g, b):
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r / 255) + 0.7152 * f(g / 255) + 0.0722 * f(b / 255)


def tone(values):
    if not values:
        return "dark"  # SVG with no explicit fill paints black
    avg = sum(values) / len(values)
    return "dark" if avg < 0.3 else "light" if avg > 0.6 else "mixed"


def svg_logo(text):
    text = re.sub(r"<\?xml.*?\?>|<!DOCTYPE.*?>|<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"<(script|foreignObject)\b.*?</\1>", "", text, flags=re.S | re.I)
    text = re.sub(r"\son\w+\s*=\s*(\"[^\"]*\"|'[^']*')", "", text, flags=re.I)
    text = re.sub(r"\s(?:xlink:)?href\s*=\s*([\"'])(?!#).*?\1", "", text, flags=re.I)
    if "xmlns=" not in text[:300]:
        text = text.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    paint = r"(?:fill|stroke|stop-color)\s*[:=]\s*[\"']?\s*(#[0-9a-fA-F]{3,6}|white|black)\b"
    # masks and clip paths paint luminance, not colour: leave them out of the logo's own colours
    drawn = re.sub(r"<(mask|clipPath|defs)\b.*?</\1>", "", text, flags=re.S | re.I)
    colors = {c.lower().replace("white", "#ffffff").replace("black", "#000000")
              for c in re.findall(paint, drawn, re.I)}
    colors = {("#" + "".join(ch * 2 for ch in c[1:])) if len(c) == 4 else c for c in colors}
    fills = [lum(*(int(c[i:i + 2], 16) for i in (1, 3, 5))) for c in colors]
    shade = tone(fills)
    if len(colors) == 1:  # a one-colour wordmark: paint it with the text colour of whatever it sits on
        only = colors.pop()
        spellings = {only, {"#ffffff": "white", "#000000": "black"}.get(only, only)}
        if only[1::2] == only[2::2]:  # #aabbcc is also written #abc
            spellings.add("#" + only[1::2])
        pattern = r"((?:fill|stroke)\s*[:=]\s*[\"']?\s*)(" + "|".join(map(re.escape, spellings)) + r")\b"
        parts = re.split(r"(<(?:mask|clipPath|defs)\b.*?</(?:mask|clipPath|defs)>)", text, flags=re.S | re.I)
        text = "".join(p if re.match(r"<(mask|clipPath|defs)\b", p, re.I) else
                       re.sub(pattern, r"\1currentColor", p, flags=re.I) for p in parts)
        shade = "mono"
    data = text.strip().encode()
    return {"format": "svg", "tone": shade, "opaqueBg": False, "bytes": len(data), "markup": text.strip(),
            "dataUri": "data:image/svg+xml;base64," + base64.b64encode(data).decode()}


def raster_logo(data):
    from PIL import Image
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    if im.height > 64:  # 2x the 32px header height
        im = im.resize((max(1, round(im.width * 64 / im.height)), 64), Image.LANCZOS)
    px = [p for p in (im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()) if p[3] > 128]
    corners = [im.getpixel(xy)[3] for xy in ((0, 0), (im.width - 1, 0), (0, im.height - 1),
                                              (im.width - 1, im.height - 1))]
    sample = px[:: max(1, len(px) // 2000)]
    for img in (im, im.quantize(64).convert("RGBA")):
        buf = io.BytesIO()
        img.save(buf, "PNG", optimize=True)
        if buf.tell() <= MAX_BYTES:
            break
    return {"format": "png", "tone": tone([lum(*p[:3]) for p in sample]),
            "opaqueBg": min(corners) > 250, "bytes": buf.tell(), "width": im.width,
            "height": im.height,
            "dataUri": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()}


def embed(src):
    if re.match(r"https?://", src):
        with urllib.request.urlopen(urllib.request.Request(src, headers=UA), timeout=20) as r:
            data, ctype = r.read(2_000_000), r.headers.get("Content-Type", "")
    else:
        data, ctype = open(src, "rb").read(), ""
    head = data[:500].lstrip().lower()
    if "svg" in ctype or head.startswith(b"<svg") or head.startswith(b"<?xml"):
        out = svg_logo(data.decode("utf-8", "replace"))
    else:
        out = raster_logo(data)
    if out["bytes"] > MAX_BYTES:
        return {"ok": False, "error": f"logo is {out['bytes']} bytes after shrinking"}
    return dict(ok=True, **out)


if __name__ == "__main__":
    try:
        print(json.dumps(embed(sys.argv[1])))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))
```
