# PPA pitch reference

Used by the **PPA pitch** section of SKILL.md, which runs the questionnaire, and by the
`atlas-ppa-pitch` agent, which researches, casts, renders, and exports the deck. A PPA pitch is a
casting deck for **paid partnership ads**: creator videos licensed to run as Meta partnership
ads (dark posts from the creator's handle, often called whitelisting) plus an organic post on
the creator's own feed. The deck tells the brand which persona lanes the ads will speak to, the
creator cast against each lane, what each creator will make, the rights the brand licenses, and
what it costs.

The output is always a slide deck in this order: a Claude artifact first (a page of 16:9
slides), reviewed in chat, and only then, on request, a PowerPoint file, a Google Slides deck, or
both, built from the same slide model.

## Who presents it

The pitch serves the brand. Two kinds of people build it:

- **The brand's own team** (in-house or its agency), pitching the plan to its leadership or
  client. Default for everyone.
- **Aspire's managed services team**, operating inside the brand's Atlas organization on its
  behalf. Only offered when SKILL.md, **Aspire users**, recognized the caller. The skill flags
  this and asks A1 to A4 below; the answers set `presentation`. An Aspire user can choose the
  brand-team options, and the deck must work fully either way.

`presentation` carries:

| Field | Values | Brand-team default |
| ----- | ------ | ------------------ |
| `presenter` | `aspire` (managed service) or `brand` | `brand` |
| `look` | `aspire` (the default design below with the Aspire wordmark), `theme` (the saved `theme:brand`; only when one is saved), `neutral` (the default design with no presenter mark) | `theme` when saved, else `neutral` |
| `investment` | `packages` (service packages plus creator fees), `creator_fees` (creator fees and budget scenarios only), `none` | `creator_fees` |
| `voice` | `agency` ("we" are the presenter, "you" are the brand), `brand_team` ("we" are the brand team, written to its approver) | `brand_team` |

The `aspire` look, `packages`, and `agency` voice exist for the managed-service case, and they are
never offered to a caller the skill has not recognized as an Aspire user. Nothing here changes what
data the caller can read or skips any confirmation. `look: theme` without a saved `theme:brand`
falls back to `neutral`; the agent never runs the theme interview or brand scan itself (that is
**Theme** in SKILL.md, main thread only).

## The deck

Eleven slide types, always in this order. The deck is modular: groups, lanes, and creators set the
counts, and the optional slides drop out when their inputs are skipped. A typical deck is 15 to 25
slides. No other slide type is ever added: readers beyond the primary lens are served in the
forward note and the speaker notes, never with a slide.

| # | Slide | Canvas | Repeats | Optional |
| - | ----- | ------ | ------- | -------- |
| 1 | Cover | Dark | Once | No |
| 2 | The shape | Light | Once | No |
| 3 | The schedule | Light | Once | When every group starts together and none is earned |
| 4 | The lanes | Light | Once (split by product past 12 rows) | No |
| 5 | Casting | Light | Once | No |
| 6 | Product divider | Dark | Per group with a confirmed product | No |
| 7 | Talent | Dark | Per cast creator, after its product divider | No |
| 8 | What's included | Light | Once | No |
| 9 | The rights package | Light | Once | When `investment` is `none` and the user skipped G3 and G4 |
| 10 | Investment | Light | Once | When `investment` is `none` |
| 11 | Thank you | Dark | Once | No |

### Chrome on every slide

- **Round word:** `TWO`, `THREE`, … in eyebrows; "round two" in prose.
- **Light slides:** eyebrow top left in small caps, `--gold-text`: `ROUND {WORD} · {SECTION}`
  (first pitch: `PARTNERSHIP ADS · {SECTION}`). Footer left, small: the program label. Footer
  right: the slide type's section name in sentence case ("The shape", "Casting"), never a lane or
  creator name.
- **Dark slides:** wordmark bottom left, domain bottom right. `aspire` look: "Aspire" and
  "aspire.io". `theme` look: the brand's logo per `theme.md`, **Logo**, and the brand's domain.
  `neutral`: the brand name and domain.
- **Program label:** `aspire` presenter: "Aspire · Creator Ad Services". `brand` presenter:
  "Partnership ads · Round {word}" (first pitch: "Partnership ads"); the brand name is never
  repeated in the footer.
- **Recipient chip:** this deck has none. The cover eyebrow names who it is for in the `agency`
  voice; the `brand_team` voice needs no chip. This overrides the page header chip in
  `recipient-lens.md`.

### Voice

Every fixed headline and box title has a version per voice. Use these; write new copy only for
slots marked "write".

| Slot | `agency` | `brand_team` |
| ---- | -------- | ------------ |
| Cover eyebrow | `PREPARED FOR {BRAND} · ROUND {WORD}` (first: `PREPARED FOR {BRAND} · PARTNERSHIP ADS`) | `{BRAND} · PARTNERSHIP ADS · ROUND {WORD}` (first: `{BRAND} · PARTNERSHIP ADS`) |
| Cover headline | "The cast for round {word}." (first: "The first cast.") | Same |
| Constraint banner (C4) | "No {moment}. You told us it's {reason}, so …" | "No {moment}. It's {reason} for us, so …" |
| Casting, honesty box | "Being straight with you" | "Where the pool is thin" |
| Casting, done box | "Already done" | "Already in this deck" |
| What's included | "What we produce, per creator, every month." | "What each creator makes, every month." |
| Master brief card | "Written by us, approved by you, before a frame is filmed." | "Written by the team, approved by {approver from B2}, before a frame is filmed." |
| Rights headline | "What you license, and what it costs." | "What we license, and what it costs." |
| Investment, `packages` | "Same programme. {N} volumes." | (not offered) |
| Investment, `creator_fees` | "What the cast costs." | Same |
| Thank you | "Thank you." | Same |

### 1. Cover

- Eyebrow per **Voice**.
- Headline per **Voice**, display serif.
- Sub, two sentences, write: the count ("Ten persona lanes across two products, and the creator we
  would put against each one.") and the casting brief D3 in plain words.
- A strategy-only banner under the sub when a red line requires it (**Design**, Writing).

### 2. The shape

Headline, write, a short declarative naming the structure ("Three products. The third group is
earned."). Sub: one sentence on how the groups relate. One card per group (1 to 3), side by
side, each tinted with its group color:

- Eyebrow: `GROUP {A|B|C} · {WINDOW}`, where the window runs from the month the group's build
  starts to the month its last in-market week starts ("OCTOBER", "MID-OCT TO NOV", "DEC BUILD, JAN
  LIVE"). The same window appears on every slide that names the group.
- Title: the product's canonical name (**Products**); an earned group without a product reads
  "Product to be confirmed".
- Three bullets, each under 60 characters: why this product now, what is already behind it
  (only what Atlas or the user's answers show), how it is sourced or sequenced.
- Closing line, bold, five words or fewer: what the group is for ("The volume group.").

An earned group always says how it is earned: the best performers from the live groups graduate
into it, and the product is picked at the read. Optional dark banner under the cards for C4's
constraint, per **Voice**.

### 3. The schedule

Headline, write, a contrast ("Staggered, not stacked."). Sub: how the groups overlap.

**Week arithmetic** (weeks start Monday; week 1 is the C2 start Monday):

| Event | Rule |
| ----- | ---- |
| Group A build | Weeks 1 to 3; in market from week 4 to the term end |
| Group B build (staggered) | Weeks 2 to 4; in market from week 5. "All start together": weeks 1 to 3 |
| Read + select | Three weeks starting when Group B has been in market two weeks (weeks 7 to 9 by default) |
| Group C cast | The Monday after the read (week 10) |
| Group C build | Two weeks from the cast; live the Monday after. When C4 aims the earned group at a later month, the build moves so it goes live on the first Monday of that month |
| Term end | The day before C2 start plus C3 months (5 Oct for 3 months ends 4 Jan) |

When the earned group would have fewer than four weeks in market inside the term (the term end
date counts as inside), the agent returns a decision
("extend the term by one month" / "pull Group C inside the term" / "keep it and say it goes live
after the term") and the footnote states the chosen outcome, using the exact term end date. Never
call a date the term's last day unless it is, and never schedule anything in the past.

Layout: a month grid across every month the schedule touches, month labels in small caps, a
vertical rule per month. One row per group: label and product. Bars: "Build + deliver" in the
group tint, then "In market" outlined; an earned group has one bar, "Build + deliver, live in
{month}". Bar labels must fit inside their bar; shorten to "Build" or "Live {month}" when the bar
is narrow. With an earned group, a dashed accent box spanning the read weeks across the live
groups' rows, labeled "Read + select" underneath. A "Term ends" marker, when shown, sits on the
grid's month axis, never on the milestone row.

Three milestone cards under the grid, fixed: `WEEK 2` (Group B starts while A is in edit; when
all start together, `WEEK 4`, the first group in market), `WEEKS 7–9` (the first read worth
acting on: how long each live group has been in market), and `WEEK 10` (Group C is cast; no
earned group: the term's last read). Italic footnote: the term in one sentence.

### 4. The lanes

Headline, write ("Keep what worked. Build around it." on a follow-up; "{N} lanes. One voice
each." on a first pitch). A table with a tinted band row per product (`{PRODUCT} · {WINDOW}`),
then one row per lane:

| Column | Content |
| ------ | ------- |
| Lane | The lane name, bold, title case, two to four words |
| The tension it is written around | One sentence, under 80 characters, present tense, third person: the feeling or moment the ad opens on, never the product |
| Status (follow-up only) | `NEW`, `RAN`, or `NEVER CAST`, small caps, accent |
| Creator | **Names** below |
| Creator type | **Creator type** below |

Footnote, italic: "Rates and availability are confirmed at shortlist." (add "None of these
creators has been approached yet." only when the user said so), then the metric sources from
**Creator metrics**.

### 5. Casting

Headline, write ("Screened, not scrolled."). Sub: what changed in the casting profile and why,
from D1 and the round's lessons. Four numbered cards, one per D2 screen, each a bold title and
two lines on why the screen matters. Then two boxes, titles per **Voice**:

- **Honesty box** (light tint): the pool from the agent's own counts, worded as accounts Atlas
  holds, never as the size of a market ("Of the UK accounts Atlas holds in this category, three of
  the ten clear 100k."). Name any cast creator who misses a screen (for example a hook rate under
  the threshold) and why they are cast anyway, and any creator in an authority lane whose bio
  states no credential. Never claim a credential for a lane or a creator.
- **Done box** (dark): what the deck already contains.

### 6. Product divider

Left: eyebrow `GROUP {X} · {WINDOW}`, the product name large, a line ("Five persona lanes, one
creator against each."), then a row of the group's lanes, each lane name bold over the creator's
name. Right: the product image (**Assets**) on the dark canvas. No image: leave the right side
empty; never a stock or generated picture. An earned group with no product has no divider.

### 7. Talent

One slide per cast creator, two columns, always on the dark canvas. Fill the slide height: photos
about 11cqw square, body about 1.05cqw, variant table rows about 1.6cqw, and the bottom of the
variant table sits on the footer line. No creator fee on this slide; fees appear only on the
rights and investment slides.

Left column:

- Eyebrow, `--gold-soft`: `SAMPLE TALENT · {LANE} · LANE {NN}` (`NN` counts within the group).
- Name (**Names**), display serif, `--sage`, with a thin rule under it.
- A bordered row: the linked handle (to the profile URL), followers, and the top audience age band
  when Atlas has one. No age band: handle · followers only; never substitute the size band, the
  network, or `instagram.ageBucket` (the creator's own age).
- Five stats in a row, label in small caps over the value: Hook rate, Interaction, Median views,
  Reach ratio, Engagement. A missing value is an em dash, and the right column carries one italic
  note: "{Stats} not shown: {plain reason}." ("Engagement not shown: likes are hidden on most of
  Sam's posts.").
- Photos (**Assets**): up to four in a row, cropped square, thin accent border; with two or three,
  the row keeps the same photo size and ends early; with none, the profile picture alone at its
  own size, at 11cqw, with the rationale growing to fill the column.
- Rationale, two or three sentences, under 320 characters, never mentioning Atlas, data, or tool
  limits (those go only in the italic note): who they are, the evidence from their
  numbers or posts, and why that fits this lane. Name a weakness when the data has one. Facts
  only per **Design**, Writing.
- `SAMPLE VARIANT SET · ONE SHOOT, {N} ADS` and the variant table (**Variant sets**).

Right column:

- A product band with the product name (**Design** sets its colors).
- The lane's tension line as an italic pull quote, right aligned, in curly quotes.
- Three stacked cards with an accent edge: Persona (the lane), Creator type, Product window (the
  group's window exactly as on the shape slide's eyebrow, sentence case, no status).
- `PREVIOUSLY WORKED WITH` and the partners from Atlas, joined with " · ", or "No brand
  partnerships on record". A partner that is a saved `competitor` is marked "(competitor)".
- `{POSSESSIVE} WORK · CLICK A THUMBNAIL TO WATCH ON {NETWORK}` and four thumbnails (**Creator
  metrics**, Work), each linked to its permalink with the view count under it ("4.5k views"; no
  views: "Recent reel").

Pronouns: use the pronoun the creator's bio states, or the one the casting brief D3 states for
the whole cast ("UK women who …"). Otherwise the possessive is "{FIRST NAME}'S" and prose uses the
name and "their"; with no name held, "THEIR WORK".

### 8. What's included

Headline per **Voice**. Sub: before filming, and delivered. Two rows of three cards:

- Before filming (neutral cards): the master brief (per **Voice**), the full claim list (captured
  in discovery and printed at the top of every creator brief), the b-roll setups ("{N} b-roll
  setups", N from G5, default 12, specified in advance).
- Delivered (tinted cards): one shoot, {G1} ad-ready variants (each testing a single variable),
  aspect ratios (G2, cut in tandem and delivered together).

Dark banner: follow-up rounds turn the lessons (G6) into the reason for each step; first pitches
say why this order prevents rework. Drop any card the user removed in G5. The numbered b-roll
setup list lives in this slide's speaker notes and in the model.

### 9. The rights package

Headline per **Voice**. Sub: what is agreed per creator before contracting.

- Two cards: **{N}-day whitelisting** (G3: every variant runs as a dark post from the creator's
  handle with paid partnership usage, for N days from delivery, and whether that covers the
  term) and **{N} organic post(s)** (G4: guaranteed on the creator's own feed, the brand picks the
  cut, built for organic rather than repurposed).
- `FORECAST CREATOR FEE · PER CREATOR, PER MONTH` and one card per size band
  among the cast (**Commercials**), each with the band name and follower range, and Low / Average
  / High with Average highlighted. A band outside D1 is labelled "Outside the brief". One line
  under the cards: "A views-based forecast for the posts; whitelisting terms are agreed at
  contract." Never say the forecast includes the rights.
- Two boxes: **What moves the fee** (first pitch; on a follow-up with H3, "Why these differ from
  round {prev}") and **A rate card for everything else** (dark: what is priced separately, from G3's
  extras).

Both boxes and the band cards must end above the footer; shorten copy before shrinking type.

### 10. Investment

`packages`: headline per **Voice**, sub (all packages share the term and the ladder; the only
variable is volume). One card per package (H2), tinted header:

- Package name, monthly fee large, "per month · Aspire fee", term total bold.
- Rows: videos per month, creators in market, editors on the account (each only when typed).
- Tinted box: `ESTIMATED CREATOR FEES` with the monthly range from **Commercials**.

`creator_fees`: headline per **Voice**. Three numbers for the full priced cast per month (Low =
sum of open fees, Average = sum of target, High = sum of max), the term figure (monthly × C3),
then three scenarios at target: the full cast, the top half by hook rate, and one per live
product group.

Footnote (both): creator fees are a forecast, not a quote; how they are paid and when they are
firmed; ad spend is the brand's; unpriced creators named; the previous round's cost when H3 gave
it, as the user worded it.

### 11. Thank you

"Thank you." and one line recapping the count ("Ten lanes, ten creators, and a third product
earned at the read.").

## Design

Default design (the `aspire` and `neutral` looks), taken from the reference deck:

| Token | Value | Use |
| ----- | ----- | --- |
| `--ink` | `#1E2F2C` | Dark canvas, dark boxes, headline text on light |
| `--paper` | `#F3EFE9` | Light canvas |
| `--card` | `#F9F7F2` | Cards on light |
| `--line` | `#DDD7CC` | Card borders, table rules |
| `--muted` | `#5C6461` | Body text on light |
| `--gold` | `#A8862F` | Accent edges and rules only |
| `--gold-text` | `#7A5F1C` | Eyebrows and small accent text on light |
| `--gold-soft` | `#C9A961` | Eyebrows and partners on dark |
| `--sage` | `#8FB0A3` | Talent names on dark |
| `--on-ink` | `#EEEAE2` | Text on dark |
| `--group-a` | `#E7F1DA` | Group A tint |
| `--group-b` | `#FCF4E8` | Group B tint |
| `--group-c` | `#DCE8E8` | Group C tint |
| `--brand-band` | `#2D5240` | Product band on talent slides |

Fonts: Playfair Display (display: headlines, names, prices, the pull quote in italic) and Inter
(everything else), from Google Fonts with Georgia and system-ui fallbacks.

**The `theme` look** maps the saved theme onto the same roles per `theme.md`, **Applying the
theme**:

| Default token | Theme role |
| ------------- | ---------- |
| `--paper`, `--muted`, `--line` | `bg`, `muted`, `border` (light values); the page background around the slides follows the theme's light and dark `bg` |
| `--card` | `surface`; when `surface` equals `bg`, `bg` mixed with 3% `text`, plus `border` |
| `--ink` (dark canvas) | Talent slides: the theme's dark `bg` value. Cover, product dividers, and thank you: `brand` with `on-brand` |
| `--on-ink`, `--sage`, `--gold-soft` | Dark `text`, dark `brand-ink`, dark `accent-ink` |
| `--gold`, `--gold-text` | `brand-ink` (light) |
| `--group-a`, `-b`, `-c` | `brand`, `accent`, and `chart-3` at 10% on `bg`; also the schedule's build bars. The read box border is `brand-ink` |
| `--brand-band` | `brand` with `on-brand`; when that fails 3:1 against the dark canvas, `surface` with `brand-ink` |
| Fonts | The theme's display and body fonts |

Every text and background pair passes 4.5:1 (3:1 for text 24px and up), checked with the
contrast function in `theme.md`, **Theme build**. A pair that fails switches its text to `text`
(light) or `on-brand` (dark). Small text on a dark canvas is never at reduced opacity. Status
colors stay semantic.

**Writing.** Plain, specific, no hype. All written copy, including rationales, banners, and the
forward note, follows the voice: `brand_team` never addresses the brand as "you". Headlines are short declaratives that end with a period,
often a contrast. Numbers are exact and sourced.

- Creator type, names, and rationale facts come only from the creator's Atlas name, bio, or a
  cited post caption (the permalink goes in the speaker notes). Nothing from memory or the
  open web: no publication dates, credentials, or results the bio or a caption does not state.
- Brand-history statements ("new", "nothing exists yet", "first time") are checked against the
  brand's own posts and the posts that mention it in Atlas; when Atlas shows activity, say what it
  shows ("new to partnership ads; two creator collabs ran in August and September").
- Product claims are quoted as the brand words them on its own site, never paraphrased into a
  stronger claim.
- A `red_line` that blocks AI-written copy makes the deck strategy only: lane names, screens, and
  structure stay; tension lines, variant names, and rationales are bracketed blanks for the team
  to write, and a banner on the cover says so.

## Names, creator types, and products

- **Names.** The creator's full name as Atlas holds it (display name or bio). A partial name
  ("Sam") is extended only from another Atlas field of the same account (its website or email
  field), and the source goes in the speaker notes. No personal name held: the handle, and the
  agent lists it under Decisions needed.
- **Creator type.** "{credential or role} · {one distinction}": the credential or role is the first
  one the name field or bio states, the distinction the next bio phrase, both in the bio's own
  words and casing ("Registered Dietitian · author"). Never a credential the bio does not state.
- **Products.** The canonical name is the product page's main heading on the brand's own site,
  extended with any range name and mark the same page's copy uses for that product ("Everyday
  Omega-3®"). A user's spelling that differs is listed under Decisions needed, and the user's
  answer wins.

## Creator metrics

From what Atlas holds, never estimated, computed with the **Metrics snippet** below so no number
is retyped.

**Pulls.**

- Accounts: `search_creators`, `terms` on `username`, `fields: ["username","followersCount",
  "country","instagram","tiktok"]`, `exclude: ["instagram.audienceDemographics",
  "instagram.followerDemographics"]`.
- Posts for metrics: `search_posts`, `terms` on `author.username` for up to four creators, `exists
  mediaKind`, sort `postedAt` desc, limit 100 (no paging); a creator with fewer than 25 posts in
  the batch is fetched alone with `term` and limit 25. `fields: ["author.username","postedAt","mediaKind","viewCount","likeCount",
  "commentCount","saveCount","shareCount","instagram.permalink","url"]`, and `exclude:
  ["media","instagram.account"]` (Atlas returns both even when `fields` leaves them out). Save each
  response to its own file in the scratch folder. A response that came back inline is written to
  a file exactly as returned (copy the JSON whole, never edit or reorder a value) before running
  the snippet; the same goes for the accounts response.
- Captions and media: fetch `text` and `media` only for the posts that will show as thumbnails or
  photos, and for the four **Work** posts the hero framework reads (`terms` on their permalinks or
  ids).

**Freshness.** When a creator returns fewer than 25 posts, wait a minute and fetch that creator
again once; keep whichever response has more posts. The build's fetch is the one rendered;
record `metricsAt` and the post counts per creator in the model, and list every number that
differs from the one approved in F under Data gaps ("changed since the plan: median views 2.4k →
2.6k").

| Stat | Rule | Format |
| ---- | ---- | ------ |
| Followers | `followersCount` | `14.4k`, `102.9k` |
| Age band | Top age band in `instagram.creatorEngagedAccountsBreakdowns`; TikTok `tiktok.audienceAges`; often empty | `35-44` |
| Hook rate | `instagram.reelsHookRate` (Meta); a value at or below 1 is a fraction, × 100; 0 counts as missing | Percent, one decimal |
| Interaction | `instagram.reelsInteractionRate` (Meta), same rule | Percent, one decimal |
| Median views | Median `viewCount` over the last 25 posts that carry one; needs 5 | `2.5k` |
| Reach ratio | Median views ÷ followers | Percent, one decimal |
| Engagement | Median of (likes + comments, plus saves and shares when present) over the last 25 posts that carry a `likeCount`, ÷ followers. Needs 10 such posts; a null `likeCount` is left out, never counted as 0 | Percent, two decimals |
| Previously worked with | `instagram.pastBrandPartnershipPartners` | Up to four, as Atlas spells them |
| Work | The four videos with the most views among the last 25 posts; with fewer than four carrying views, the most recent videos fill the rest | Thumbnail, permalink, views |
| Fee basis | Median `viewCount` of the last 10 videos; needs 3 with views (`fees.md`) | Speaker notes only |

The lanes footnote states the sources: follower count, hook rate, and interaction rate from Meta;
median views and engagement over each creator's 25 most recent posts; reach ratio as median views
against following.

TikTok creators: hook rate and interaction are Meta-only, so they show an em dash and the note.
Partnership ads are a Meta product, so a TikTok-only creator is cast only when the user asks, and
the talent slide says the rights package differs.

### Metrics snippet

Save as `pitch_metrics.py` in the scratch folder and run it with the accounts file and every posts
file. It uses only the Python standard library, reads only the files it is given, and prints one
JSON line per creator.

```bash
python3 pitch_metrics.py --accounts accounts.json posts_1.json posts_2.json > metrics.jsonl
```

```python
import argparse, json, statistics

def hits(path):
    data = json.load(open(path))
    for h in data.get("hits", []):
        doc = dict(h.get("document", h))
        doc.setdefault("id", h.get("id"))
        yield doc

def get(d, path):
    for k in path.split("."):
        d = d.get(k) if isinstance(d, dict) else None
    return d

def pct(v):
    if not v:  # null, or 0 from an account Meta does not report on
        return None
    return v * 100 if v <= 1 else v

ap = argparse.ArgumentParser()
ap.add_argument("--accounts", required=True)
ap.add_argument("posts", nargs="+")
a = ap.parse_args()

accounts = {}
for doc in hits(a.accounts):
    for ch in doc.get("channels") or [doc]:
        if ch.get("username"):
            accounts[ch["username"].lower()] = ch

posts = {}
for path in a.posts:
    for doc in hits(path):
        user = (get(doc, "author.username") or "").lower()
        if user and doc.get("postedAt"):
            posts.setdefault(user, {})[doc.get("id") or get(doc, "instagram.permalink") or doc.get("url")] = doc

for user in sorted(set(accounts) | set(posts)):
    acct = accounts.get(user, {})
    ig = acct.get("instagram") or {}
    followers = acct.get("followersCount")
    last = sorted(posts.get(user, {}).values(), key=lambda p: p["postedAt"], reverse=True)[:25]
    views = [p["viewCount"] for p in last if p.get("viewCount") is not None]
    liked = [p for p in last if p.get("likeCount") is not None]
    eng = [sum(p.get(k) or 0 for k in ("likeCount", "commentCount", "saveCount", "shareCount")) for p in liked]
    videos = [p for p in last if p.get("mediaKind") == "video"]
    fee_views = [p["viewCount"] for p in videos[:10] if p.get("viewCount") is not None]
    ranked = sorted([p for p in videos if p.get("viewCount") is not None], key=lambda p: -p["viewCount"])[:4]
    ranked += [p for p in videos if p not in ranked][: 4 - len(ranked)]
    median_views = statistics.median(views) if len(views) >= 5 else None
    print(json.dumps({
        "username": user,
        "followers": followers,
        "hookRate": pct(ig.get("reelsHookRate")),
        "interaction": pct(ig.get("reelsInteractionRate")),
        "posts": len(last),
        "postsWithViews": len(views),
        "medianViews": median_views,
        "reachRatio": median_views / followers * 100 if median_views and followers else None,
        "postsWithLikes": len(liked),
        "engagement": statistics.median(eng) / followers * 100 if len(eng) >= 10 and followers else None,
        "feeBasisViews": statistics.median(fee_views) if len(fee_views) >= 3 else None,
        "feeBasisPosts": len(fee_views),
        "partners": ig.get("pastBrandPartnershipPartners") or [],
        "work": [{"permalink": get(p, "instagram.permalink") or p.get("url"), "views": p.get("viewCount")} for p in ranked],
        "newestPost": last[0]["postedAt"] if last else None,
    }))
```

## Variant sets

Every talent slide carries one shoot cut into G1 variants (default five). Each row: variant,
framework, name, shot recipe, length.

| Framework | Stands for | Fits a post that |
| --------- | ---------- | ---------------- |
| HSO | Hook, story, offer | Explains one idea or busts a myth to camera |
| PAS | Problem, agitate, solution | Opens on a symptom or "if you feel this" |
| BAB | Before, after, bridge | Shows a change over time ("week one vs week six") |
| SSS | Star, story, solution | Tells a personal story or a day in the life |
| 4Ps | Promise, picture, proof, push | Shows a routine, a shelf or bag tour, a short demo |

- **V1 is the hero.** Classify the creator's four **Work** posts by their captions (the `text`
  field of the metrics pull) into the five frameworks; the most frequent wins, ties go in table
  order. With no captions, use table order and say so in the speaker notes only. Record the four permalinks behind
  the choice in the model. V2 to V5 take the remaining frameworks in table order, or in the order
  of the hook patterns saved by ad reuse (`ad-reuse-*`) when they exist.
- **Lengths:** V1 0:45, V2 1:00, V3 0:30, V4 0:30, V5 0:15. Three variants keep V1 to V3.
- **Shot recipe:** `Hook {A|B|C} · Body · CTA {1|2} · B-roll {numbers}`, drawing on the shared
  b-roll setups numbered `01` to the G5 count (default 12). Use the same five recipes for every
  creator so one edit template serves the cast: V1 `Hook A · Body · CTA 1 · B-roll 01,04,07,08`,
  V2 `Hook B · Body · CTA 1,2 · B-roll 02,03,05,09,11`, V3 `Hook C · Body · CTA 2 · B-roll 03,06,10`,
  V4 `Hook A · Body · CTA 2 · B-roll 07,11,12`, V5 `Hook B · CTA 1 · B-roll 04,08`.
- **Name:** three to six words, title case, in the creator's register, built from the lane's
  tension. Name the moment, never the outcome: "The Three O'Clock Drop" and "Two Weeks Out" are
  fine; "Get The Afternoon Back", "Sleep Better", and "Firmer Skin" are not.

## Assets

- **Creator photos.** A photo qualifies when the creator is clearly the subject (face or upper
  body, in focus) and any text overlay covers less than a quarter of the frame; Reel posters
  usually qualify. Shortlist from the profile picture and the image posts and
  video posters among the last 25 posts (use `analysis.subjectAnalysis` when present), then look at
  a contact sheet and pick up to four. Embed with the **Images** snippet in `creator-card.md`, page
  profile, kind `thumb@150`.
- **Work thumbnails:** `post@128x180` from `media` (mediaUrl first, thumbnailUrl after).
- **Product images:** from the brand's own website only, including the image host its product
  pages load their photos from (for example a commerce image CDN). Take the product page's main image
  (`og:image` or the largest product photo); prefer a cut-out on a plain or transparent ground over
  a packshot with badges. Embed as `detail@420x560`. A user-supplied image wins. None found: say so
  in the review step, never a stock or generated image.
- **Brand logo:** the `theme` look follows `theme.md`, **Logo**.
- **No Pillow.** The **Images** snippet needs Pillow. When `python3 -c "import PIL"` fails, build
  the deck without images (initials, empty photo rows, no thumbnails), say so under Data gaps, and
  tell the user Pillow is needed for images. Never install anything.
- Budgets: images under 8MB and the page under 10MB, per **Images**. A deck with 15 creators drops
  to three photos per creator before cutting quality.

## The questionnaire

All questions use `AskUserQuestion`, at most four per call, two to four options each, the
recommended option first and marked "(Recommended)". Skip any question the user already
answered or that the inputs settle. Every recommendation is built from what Atlas holds (the
**Pre-fill** column); say where it came from in the option's description. Free text always
works, because the tool adds it.

### A. Presentation (Aspire users only)

Opened by one line: "You're signed in with an Aspire email, so I'll check how you want to
present this for {brand}." Then one call:

| ID | Header | Question | Options |
| -- | ------ | -------- | ------- |
| A1 | Presenter | Who is presenting this pitch? | Aspire, as {brand}'s managed service (Recommended) / {brand}'s own team |
| A2 | Look | Which look should the deck use? | Aspire design (Recommended for Aspire) / {brand}'s saved theme (only when `theme:brand` exists) / Neutral, no presenter mark |
| A3 | Investment | What should the investment slide show? | Service packages and creator fees (Recommended for Aspire) / Creator fees only / No investment slide |
| A4 | Voice | How should the deck speak? | Aspire to {brand}: "we" and "you" (Recommended for Aspire) / As {brand}'s team to its approver |

A1 "{brand}'s own team" sets the brand-team defaults and skips A2 to A4.

### B. The frame

| ID | Header | Question | Options | Pre-fill |
| -- | ------ | -------- | ------- | -------- |
| B1 | Round | Is this a first pitch or a follow-up? | Round {n+1}, building on {date} (Recommended when a saved pitch exists) / First pitch / Follow-up with nothing saved | Newest `ppa-pitch-{profile}` summary |
| B2 | For | The **Reading the ask** confirmation: who approves it and when | The guess / one or two others / Just for our team | The ask |
| B3 | Market | Where should the creators be based? | {country}, nationwide (Recommended) / {region} only / Several markets | `brand:business-context`, the linked channels' audience top country |
| B4 | Products | Which products is this pitch for? (multiSelect) | Up to four products / "Find them on {brand}'s website" | `brand:summary`, `brand:business-context`, campaign briefs, earlier pitches; web research when none is held |

**Follow-up with a saved pitch:** one more question, "Which creators from round {n} actually
ran?" Options: All of them (Recommended when content reviews or readouts show their posts) / None
/ Some of them (name them).

**Follow-up with nothing saved:** ask for round {n}'s lanes in one plain message with a template,
then echo them back as a table and confirm with `AskUserQuestion` (Use these (Recommended) /
Change them):

```text
Product | Lane | Tension line | Creator handle | Ran? (yes / no)
Omega-3 | The Desk Lunch | Eats at the screen and knows it is not enough. | @handle | yes
```

Statuses follow from the answers: the creator ran, `RAN`; cast but never ran, `NEVER CAST`; any
lane added now, `NEW`. `RAN` lanes keep their tension line word for word and default to the same
creator; a rewrite is marked in the lanes table and needs the user's say-so.

### C. Shape and schedule

| ID | Header | Question | Options |
| -- | ------ | -------- | ------- |
| C1 | Groups | How should the products be grouped? | Two live groups and one earned group (Recommended for 2+ products) / One group per product, all live / One product, one group |
| C2 | Start | When does the first group start building? | {first Monday of next month} (Recommended) / In two weeks / A date I'll type. Follow-up: "Second group starts in week 2 (Recommended)" / "All start together" |
| C3 | Term | How long is the term? | Three months on one signature (Recommended) / One month / Six months |
| C4 | Constraints | Any dates to avoid or aim at? (multiSelect) | None / A peak season the brand pulls back on / A launch or seasonal moment to aim at / Something I'll type |

C1 with an earned group asks which live-group product leads (Group A) when two are chosen, and how
many creators graduate (default four to six). The earned group's product stays "to be confirmed"
unless the user names one.

### D. Casting profile

| ID | Header | Question | Options | Pre-fill |
| -- | ------ | -------- | ------- | -------- |
| D1 | Size | Which creator sizes? (multiSelect) | Nano, 5k to 50k / Micro, 50k to 150k / Mid, 150k to 500k / Macro, 500k+ | Earlier pitch bands, fee calculator posture |
| D2 | Screens | What do we screen on before a name reaches the brand? (multiSelect, four kept) | Market (B3) / Meta hook rate first, 45% and up / Willing to post and to whitelist / Authority where the lane needs it | Fit rubric in `creator-brief.md`, saved vetting criteria |
| D3 | Cast | Who are the creators, in one line? | The derived line (Recommended), for example "UK home cooks who film weeknight recipes to camera" / a broader line / type my own | `brand:summary` buyer, campaign criteria, vetting criteria |
| D4 | Sourcing | Where can creators come from? | Already in Atlas, shortlist first (Recommended) / Atlas plus the creator marketplace / Both, and web research for credentials | The campaign's discovery pool, vetting approvals |

D4's marketplace option is the approval for `search_creator_marketplace` and `lookup_creators`
on the handles that search returns and the handles the user types; without it the agent stays
inside Atlas. The marketplace searches the networks the pitch is cast on, Instagram and/or TikTok, in one
call per keyword (per `creator-brief.md`, **Atlas quirks**, Marketplace search). Each search
adds accounts to Atlas's shared index, so say how many searches will run in the option. With
`profile: none`, pass `asOrganizationId` on each call; Atlas may still attribute it to the
organization's default profile, so name that in the summary. "Willing to post and to whitelist" has no Atlas field: it is confirmed at outreach,
before a creator reaches the shortlist, and never counted in the pool numbers.

### E. Lanes (after the plan pass)

The agent proposes lanes per product (four to six each, default five; `RAN` lanes carried over).
Show them in chat as a table (lane, tension, status, the evidence behind it), then one question
per product:

| ID | Header | Question | Options |
| -- | ------ | -------- | ------- |
| E1 | {Product} | Keep these {n} lanes for {product}? (preview: lane and tension only, in monospace) | Keep all (Recommended) / Swap some (say which in the notes) / Rewrite them with my direction |

"Swap" and "Rewrite" go back to the agent with the user's words, and the question repeats for that
product only.

### F. Cast (after the plan pass)

One question per lane, four per call, header = the lane name cut to 12 characters:

| ID | Question | Options |
| -- | -------- | ------- |
| F{n} | Who should carry "{lane}"? | Up to three candidates, best first, "(Recommended)" on the first. Label: name or @handle. Description: followers, hook rate, median views, one-line fit. Preview: the five stats, the creator type, partners, and the evidence post |

A typed handle is resolved by the agent (Atlas first; `lookup_creators` only within D4's scope).
A lane with no candidate that passes the screens is kept with "Creator to be confirmed" and the
gap is named on the casting slide. A creator the user casts outside D1 or below a D2 threshold is
kept and named in the honesty box.

### G. Production and rights

| ID | Header | Question | Options |
| -- | ------ | -------- | ------- |
| G1 | Variants | How many ad variants per creator from one shoot? | Five (Recommended) / Three |
| G2 | Ratios | Which aspect ratios? | 9:16 and 4:5 cut together (Recommended) / 9:16 only / 9:16, 4:5 and 1:1 |
| G3 | Rights | Whitelisting term per creator? | {term in days} days, covers the term (Recommended) / 30 days / 60 days |
| G4 | Organic | Organic posts per creator, per month? | One guaranteed Reel (Recommended) / None / Two Reels |

A second call when needed: G5 (multiSelect) "What happens before anyone films?": master brief,
full claim list, b-roll setups (12 by default), one shoot against an approved concept; and G6 on
a follow-up, "What did round {n} teach us?", with up to three lessons drafted from saved content
reviews, readouts, and the user's notes as options (multiSelect) plus free text. G3's "rate card
for everything else" uses these defaults unless the user types others: running a cut as a branded
ad from the brand's handle, extending whitelisting past the term, extra organic posts, other
channels.

### H. Commercials

| ID | Header | Question | Options |
| -- | ------ | -------- | ------- |
| H1 | Fees | How should creator fees show? | From {brand}'s rate card, by size band (Recommended; "Aspire recommended rates" when none is saved) / Size bands I'll type / Leave fees out |
| H2 | Packages | Service packages (`investment` `packages` only, every run, never saved) | Three packages, I'll type them (Recommended) / One package / Skip packages |
| H3 | Last round | What did round {n} cost? (follow-up only) | Leave it out (Recommended) / I'll type it, with what it covered |
| H4 | Currency | Which currency? | {rate card currency} (Recommended) / one other, with a rate I'll type |

H2 asks for the figures in one plain message with a template, then echoes them back in a table
and confirms with `AskUserQuestion` (Use these (Recommended) / Change them):

```text
Package name, monthly fee, videos per month, creators in market, editors on the account
Twenty-five a month, 4000, 25, 5, 1
```

The term total is the monthly fee times C3. Package prices are never written to Atlas or to any
plugin file; they live only in the deck.

### I. Save

Last question of the final call before the build: "Save the pitch to Atlas so the next round
builds on it?" Save (Recommended) / Deck only. Saving writes the findings in **State written to
Atlas** after the build. Without a brand profile, I is not asked and nothing is saved.

## Pre-fill: what Atlas already knows

With a brand profile, read every calibration (paged, `includeSuperseded: true`) and these
insights before asking B, passing the profile's id on every call. Drop `review:` and `vetting:`
keys, and `theme:` and `fees:` keys, from anything treated as a brand rule.

**No brand profile for this brand:** read no calibrations and no insights at all (the tools would
fall back to another profile), say so in one line, use D3 as the buyer line in place of
`brand:summary` (it satisfies the Fit rubric's buyer requirement), price with the Aspire
recommended rates, and use the `neutral` look unless the presenter picked `aspire`.

| Source | Drives |
| ------ | ------ |
| `brand:summary`, `brand:business-context` | Buyer, category, products, market (B3, B4, D3) |
| `guideline:voice`, `brand_fact` voice section | Tension lines, rationales, headline tone |
| `red_line`, `guideline` | Claim cautions, off-limits lanes, the strategy-only rule |
| `competitor` | Never cast; marked among a creator's partners |
| `partner`, and any creator whose `pastBrandPartnershipPartners` names the brand | Offered first in F, labelled "worked with {brand}" |
| `creator:*` | `reject` never cast; `approve` ranked first |
| `campaign:*-brief`, `-criteria` and the discovery pool (`creator-discovery-{profile}-{campaign}`) | Products, windows, D1 to D3, first candidates |
| `creator-vetting-{profile}` | Approved creators first, rejected never |
| `ad-reuse-{profile}` | V2 to V5 order, hook patterns |
| `market-signal-{profile}` | Language to borrow in tension lines, friction lanes |
| `readout-weekly-{profile}` | Formats that work for the brand |
| `content-review-{profile}`, `review:lesson-*` | Round lessons (G6), claim issues |
| `creator-brief-{profile}` | Windows and deliverables already planned |
| `ppa-pitch-{profile}` | The previous round: lanes, cast, groups, screens |
| `fees:rate-card` | Creator fees (H1) |
| `theme:brand` | The `theme` look |
| `decline:*` | Questions not to ask again |

## The plan pass

Before E and F, the agent runs in mode `plan` and returns a proposal; it writes nothing and
publishes nothing.

1. **Products.** For each B4 product: the canonical name (**Names, creator types, and
   products**), the product page URL, the main image URL, what it is for in the brand's words, and
   its audience. Check the brand's own posts and the posts that mention it in Atlas for prior
   activity on the product, and report it. Web research reads only the brand's own site.
2. **Lanes.** Four to six per product. Each lane is a persona at a moment: a name, a tension line,
   the evidence (a market-signal phrase, a top-performing brand or creator post, a review lesson),
   and whether it needs authority (a credential in the bio). Follow-ups keep `RAN` lanes word for
   word and replace `NEVER CAST` lanes only when saved evidence says so.
3. **Candidates.** Three per lane at most, ranked, inside D1 to D4: the discovery pool and vetting
   approvals first, then creators who have worked with the brand, then the Atlas index
   (`search_creators` with `match` on the bio for the lane's and D3's keywords, the size band, and
   the market; accounts with no `country` are kept when the bio or location names the market, and
   counted separately). When the user already named the cast, compute metrics for the named
   creators only. Compute each candidate's **Creator metrics** with the snippet, add the
   creator type, the fit line, and the evidence permalink. A creator is cast once across the deck.
   Never a competitor, a `reject`, or a brand account. Scan every cast creator's 25 captions for
   profanity and for paid or reviewed products that compete in the pitch's category. Note any
   brand-safety flag seen in captions
   (profanity, paid work for a competing product) in the fit line and under Decisions needed, so
   the user keeps or drops the creator; a kept creator's flag is named in the rationale.
4. **Pool counts** for the casting slide: accounts after each screen that has an Atlas field, by
   size band, with the no-country accounts counted apart. The bio keyword list is D3's nouns plus
   each lane's keywords, fixed once and recorded in the model with the counts.
5. **Schedule** per **The schedule** arithmetic, with any term conflict as a decision.

## The build

Mode `build` renders the deck from the confirmed answers.

1. Fetch every metric and asset fresh per **Creator metrics** (with **Freshness**) and **Assets**,
   and price per **Commercials**.
2. Write the slide model to `ppa-pitch-{brand-slug}-r{round}.json` in the scratch folder, one
   entry per slide, in deck order:

   ```text
   {deck: {title, brand, round, presentation, recipient, currency, rateLabel, metricsAt},
    slides: [{n, type, canvas, eyebrow, footer: {left, right}, fields: {…}, notes, sources: {field: source}}],
    creators: [{handle, network, name, metrics…, postsCounted, metricsAt, heroEvidence: [permalinks]}],
    brollSetups: [{n, setup}]}
   ```

   Images are file paths in the scratch folder (write each data URI's bytes to a file) plus the
   data URI's `bytes`. The page and every export read this model, so they never disagree.
3. Render the page per the `artifact-design` contract (load it first): each slide a `<section
   class="slide">` with `aspect-ratio: 16/9; overflow: hidden; box-sizing: border-box;
   container-type: inline-size`, `*, *::before, *::after { box-sizing: border-box }`, every size
   inside a slide in `cqw`, and the footer absolutely positioned. Slides stack with a 24px gap on a
   page background that follows the page's light and dark tokens; slides keep their own canvas
   colors. Add `@page { size: 13.333in 7.5in; margin: 0 }` and `break-after: page` on each slide
   (it works when the page is opened outside the viewer; never add a print button). A small sticky
   slide index links to each slide.
4. **Check before publishing.** When a headless browser is available (Chrome or Chromium), render
   every slide at 1333×750 and check that each slide box is 750px tall, that no element's box
   crosses the footer band or the slide edge, that each slide's canvas matches the deck table, and
   that print gives exactly one page per slide. Fix and re-render until clean, then look at the
   screenshots. No headless browser: check the same rules by reading the CSS, and say the check was
   not rendered.
5. Publish with the Artifact tool, title "{Brand} PPA Pitch" (follow-up "{Brand} PPA Pitch, round
   {N}"; never a colon), the same as the model's `deck.title` and the page `<title>`, icon
   `slides`, and republish to the same path on revisions.

## Commercials

- **Per creator, per month:** the fee calculator (`fees.md`) at open, target, and max, with
  bundled views = (G4 + 1) × the fee basis views: G4 organic Reels plus the hero variant, each
  priced as one Instagram Reel. A creator with no fee basis shows no fee and is left out of every
  range and total, named in the footnotes.
- **Size-band cards:** one per size band among the cast. Low = the band's lowest open fee, Average
  = the median target fee, High = the highest max fee. A band outside D1 gets its own card labelled
  "Outside the brief". H1 "Size bands I'll type" replaces them with the user's numbers, labelled as
  theirs.
- **Package creator-fee range** (`packages`): creators in market × the mean open fee of the priced
  cast inside D1, to creators in market × the mean max fee.
- **`creator_fees` totals and scenarios:** per **10. Investment**.
- Labels: "forecast, not a quote", the rate label from `fees.md`, and the currency (H4, with the
  user's rate when converted).

## Review and export

After the build, the skill shows the link, a three-bullet summary, and asks one question:

| Header | Question | Options |
| ------ | -------- | ------- |
| Review | How does the deck look? | Ready to export (Recommended) / Change something (type it) / Re-cast a lane |

Changes go to the agent in mode `revise` with the user's words and republish to the same path.
Then:

| Header | Question | Options |
| ------ | -------- | ------- |
| Export | What should I make from it? | PowerPoint and Google Slides (Recommended when Google Drive is connected) / PowerPoint only / Google Slides only / Keep the page only |

- **PowerPoint**: the agent, mode `export`, invokes the session's PowerPoint skill (`pptx`; in
  some clients `anthropic-skills:pptx`) with the slide model, the image files, and the design
  tokens: 13.333 × 7.5 in, one slide per model entry, the same layout, fonts, and colors, live
  hyperlinks on handles and thumbnails, and speaker notes holding each slide's `notes` and
  `sources`. No PowerPoint skill in the session: say so. Never write the file another way.
- **Google Slides**: Drive converts a .pptx to Slides on upload, but connector upload tools take
  the file inline in the call, which is too large for a deck with photos. Hand the user the .pptx
  with one line: "Drag it into Google Drive, then Open with > Google Slides." When the session has
  a Google Slides connector that can create a presentation and add slides, text, and images by
  URL, the agent may build the deck there instead, after confirming ("Create {Brand} PPA Pitch in
  your Google Slides?" Create (Recommended) / Cancel), and says which slides differ from the
  .pptx.
- Hand the .pptx to the user with `SendUserFile` when the session has it, otherwise give its path.

## State written to Atlas

Only on I "Save". `append_insights`, `runKey` `ppa-pitch-{profile}-r{round}-{YYYY-MM-DD}`, role
`account_review`.

| Finding | Anchor | Kind | `detail.findingType` |
| ------- | ------ | ---- | -------------------- |
| One per cast creator | The creator's account (`schema` = network, `entityKind` `account`, `entityId` = the network's account id from the search hit) | `action_item`, `priority` `medium` | `cast` |
| Pitch summary | The brand's own account on its first linked network | `action_item`, `priority` `low` | `summary` |

`cast` detail: `round`, `group`, `product`, `window`, `lane`, `tension`, `status`, `laneNumber`,
`handle`, `network`, `name`, `creatorType`, the five metrics with `metricsAt`, `estFee` (open,
target, max) when priced, and `pitchPage`. `summary` detail: `round`, `presentation` (without
prices), groups with products and windows, the term, C4, D1 to D3, every lane with its tension
and status (unfilled ones too), G1 to G5, G6's lessons, `pitchPage`, and the PowerPoint and
Slides links when made. Never package prices. `idempotencyKey`:
`ppa-r{round}-{entityId}-{lane-slug}` and `ppa-r{round}-summary`.

**Reading it back**: `search_insights` with a `prefix` filter on `detail.account_review.runKey` =
`ppa-pitch-{profile}`, newest first; the newest `summary` is the previous round, and its `cast`
findings share its `runKey`.

## Atlas quirks that apply here

- `search_posts` returns `media` and `instagram.account` even when `fields` leaves them out, and
  a 25-post page with media runs 30 to 300KB per creator. Exclude both for metric pulls.
- On `search_creators`, project the `instagram` container, not leaf paths; leaf paths come back
  null (`creator-brief.md`, **Atlas quirks**).
- `instagram.creatorEngagedAccountsBreakdowns` is often empty, even for Meta-connected creators.
  `instagram.ageBucket` is the creator's own age, never the audience's.
- `reelsHookRate` and `reelsInteractionRate` are often empty for accounts not connected to Meta
  insights; the em dash and note cover it.
- `likeCount` is null on posts where the creator hides likes, and `saveCount` and `shareCount`
  are null on most creator posts.
- `country` is unset on about half the index; a country filter alone drops real local creators.
- The index refreshes while you read it: a creator just fetched can come back with fewer posts
  for a few minutes (**Freshness**).
- Published pages cannot load `cdn.aspire.io`; embed every image per **Images**.
