# Creator profile (large creator card)

The full-page view of one creator: the creator, then the evidence behind the call (audience,
best and weakest posts, engagement, sentiment, brand safety, partnerships, fees, peers, next
steps). Use it for a portfolio or profile view of a single creator. Everywhere else
a creator is shown, the compact card in **Creator card** stays the only layout.

The main thread's part of this flow, moved from `SKILL.md` (only pointers changed). A bold section name
in it (**Readouts**, **Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Creator profile (full page for one creator)](#creator-profile-full-page-for-one-creator)
- [When it renders](#when-it-renders)
- [The page](#the-page)
- [Data behind each part](#data-behind-each-part)
- [Rules](#rules)

## Creator profile (full page for one creator)

Trigger when the user asks for one creator's full profile, portfolio, or deep dive, or what a
named creator would cost ("full profile for @handle", "show me @handle's portfolio"). Requires
a brand profile. The page is described in this file, and its fees come
from the **Fee calculator**.

1. Read the target: one network and one handle with the `@` stripped. If the network is
   missing, ask with `AskUserQuestion` (Instagram / TikTok). Only those two are searchable in
   Atlas today; for YouTube, say so and offer the other two. A handle that is one of the
   profile's own linked handles is an account review (Phase 6, mode `own`), not a profile.
2. Naming the handle **is** the approval for fetching it from Atlas when the held data is
   missing or over a day old, as in Phase 6; neither the skill nor the agent asks again.
3. Launch the `atlas-creator-profile` subagent with the tool prefix, `profile_id`, `profile_slug`, the
   network and handle, any comparison accounts the user named, `recipient` (**Reading the
   ask**), and a note that the user approved the fetch. It writes nothing to Atlas, so it needs no write confirmation.
4. Lead with text: the agent's headline, up to three of its summary bullets, the fee line, the
   next step, and the page link. Draw no card. Keep the agent's `creator-cards` block: when
   the user asks to see the card ("show me the card"), the host draws it from `lookup_creators`
   on that handle, per **Creator card**, **Cards in chat**, and the reply adds only what the
   card cannot show.
5. If the agent reports a brand account, say so and offer an account review (Phase 6, mode
   `handle`). If it reports the handle could not be resolved, relay what was tried.
6. When the fees used the Aspire recommended rates, make the fee calculator offer from **Fee
   calculator**, Offers, after the reply.

## When it renders

| Trigger | Built by | Surface |
| ------- | -------- | ------- |
| "Full profile for @handle", "creator profile", "portfolio", "deep dive on @handle", "what would @handle cost" | `atlas-creator-profile`, launched from SKILL.md, **Creator profile** | Published page |
| An account review of a creator, when the user takes up the offer of the full profile | The same agent, on the same handle | Published page |

The profile is a page only. In chat, the main thread answers in text and links the page; the
compact card appears only when the user asks to see it, drawn by the host from
`lookup_creators` (**Creator card**, **Cards in chat**).
Brand accounts never get a creator profile; they get an account review. The agent writes
nothing to Atlas: Next steps are recommendations on the page, not saved action items.

## The page

One published page per creator. Title: "{Name or @handle} Creator Profile". Republish to the
same file path on a later run for the same handle, so the link stays the same. The page is the
Profile template, filled from data and rendered with the fill script
(`skills/page-standard/templates.md`, sections 1, 2 and 7); it writes no HTML, and the template
sets the layout. Its argument fits two screens. Put the saved theme in the data's `theme`.

Each part below is filled only when its rule in the table says so. A part left out is named in the
method's notes (one note, counting them when there are several), never shown empty.

## Data behind each part

The agent (`atlas-creator-profile`) reads the creator record and up to 100 recent posts. The
profile needs these as well:

- The creator record with its demographics: project the `instagram` or `tiktok` container
  **without** excluding the demographics blobs this time.
- On each post: the fields of the "Creator picks or vetting" row of the required metrics
  (`${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`, section 8), the permalink, the product type,
  `analysis.brandSafety`, `analysis.commentSentimentBreakdown`, and any brand-tag field the post
  field census lists.

Take field paths from **Atlas search**, or the live census for a path it does not list. A field neither
lists leaves its part out.

**Usable post**: a post with a non-null `likeCount`. **Engagement rate** for a post: (likes +
comments) / followers. **View rate**: views / followers, on posts with a `viewCount`. Medians,
not means, everywhere on this page except where the creator card's own rules say otherwise.
Number format follows **Creator card**.

| Field | Content and source | Leave out when |
| ----- | ------------------ | -------------- |
| `title`, `answer` | `title`: "Is @{handle} a fit for {brand}?". `answer`: the one-line verdict, "Strong fit for {goal}" style when the brand's goal makes relevance clear, else a plain description of the account ("Pacific Northwest forager and home cook"), with the number it rests on against the peers | Never |
| `sections.creators` | Exactly one entry: the handle, the profile link, the display name, `verdict` (`yes` a fit, `maybe` with the one question that would `settle` it, `no` not a fit), `reason` from the bio and the numbers, and three `stats`: followers (combined with 2+ channels), median engagement rate, and median view rate | Never |
| `figures` | Median engagement rate ("of followers, per post") and median view rate ("of followers, per Reel" or "per video") against the peer median, and the target fee against the open and max (**Recommended fees** below) | A figure with no comparison or no data. Fewer than 3 usable posts leaves out both rates |
| `sections.kpis` | Posting cadence ("~3/wk", against the window when the last 4 weeks differ by 1/wk or more), engagement rank among peers ("2nd of 4"), each peer's median engagement rate and view rate against this creator's, and each priced channel's target fee | Fewer than 3 usable posts. Drop the rank and the peers without a peer set (fewer than 3 usable peers), and view rates when any account has no views |
| `insights` | 3 from What the numbers say: Cadence, Engagement, Reach, Content driver, and Fit (only when the brand's goal or brief makes relevance clear), each sentence with a number against the peers or the creator's own median. The first may chart the 6 most recent usable posts' engagement as stacked bars of likes and comments per 100 followers; the lede names what the posts at 1.5x the median share, from the analysis | Fewer than 3 usable posts |
| `actions` | The agent's 2 or 3 ranked recommendations, each with its owner, date, effect, job (`creator-outreach`, `creator-negotiation`, `creator-brief`, or `creator-vetting`), and cost | Never: with no recommendation, the one action is to recheck the creator after their next 10 posts (job `creator-profile`) |
| `sections.posts` | Top 5 usable posts by engagement rate, then the bottom 3: each with its metrics, the missing ones and the reason, its views against the creator's usual, and the format and what it shows as `why` | Fewer than 3 usable posts. With 3 to 7, show them all as top posts. Bottom posts need 8 |
| `evidence` | One line each: the facts Atlas holds (country, language, contact email or site in the bio, linked accounts, "Creating since" the first indexed post year); the audience (gender split, up to 5 age bands, up to 4 top locations, naming the network); comment sentiment ("{p}% positive, {n}% negative across {c} comments on {k} analyzed posts", and top themes when the census exposes a comment-theme field); brand safety (how many categories were low risk on every post, then each flagged category with its post count and context in plain words); paid partnerships (confirmed: brands on posts marked as paid partnerships, with a clear disclosure, or in `pastBrandPartnershipPartners`, with how many paid posts and how they were disclosed); organic mentions ("Spotted in captions or on screen. Treat these as organic visibility, not partnership history."), a brand matching a saved `competitor` record carrying "(competitor)" | Each line when its data is missing: facts under 3, no audience breakdown, under 20 classified comments, under 3 analyzed posts, an empty partnership group |
| `method`, `gaps`, `footer` | The method: the analyzed window, how the peers were chosen (**Account resolution**, **Peer set**) and their follower band, each channel's median views behind the fees and the rate label, and the parts left out. `gaps`: missing counts (saves, shares, views) and which parts cover only one network. `footer.freshness`: the creator and each account in `scope.accounts`, per **Page standard**, section 9; `footer.source`: the source line per **Artifact standard** | Never |

**Recommended fees.** The fee calculator (**Fee calculator**): a bundle of one post on each of the
creator's channels that the brand's rates cover, priced from the median views of each channel's
last 10 posts. Open, target, and max from the saved `fees:rate-card` (source `Brand memory`), or
the Aspire recommended rates (source `Atlas`), with the rate label in the comparison. A channel
priced from estimated views carries "est. from engagement". No price for any channel (**Fee
calculator**, **No data, no price**): leave the fee out and name the missing input in `gaps`.

Write about the creator by name, or with "they". Never infer pronouns from a name, a photo, or
a gender breakdown. 

## Rules

- Every rule in **Creator card**, **Rules**, applies here: no fabricated numbers, badges, or
  images; no internal ids, slugs, field names, or tool names; escape every value from Atlas or
  the web.
- Every number on the page comes from the reads above or from the agent's analysis of them.
  A part whose number cannot be computed is left out, never estimated.
- Fees come only from the fee calculator (**Fee calculator**), with its rate label. They are an
  estimate from public view counts; never present them as the creator's rate card.
- Brand safety flags and negative sentiment keep their semantic colors; the theme recolors the
  chart series only.
