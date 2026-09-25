# Creator brief reference

Used by the `atlas-creator-brief` agent. Page structure, fit rubric, pricing method, and
Atlas quirks learned on 2026-09-16 against the live server.

## Page structure

One self-contained HTML page, published with the Artifact tool. Sections in order:

1. **Header.** Eyebrow with handle, network, "Content creation brief", target week. Headline
   that names the strategy in one line. Meta row: owner, channel and follower count, creator
   count, prepared date. Standing-rule banner (red) when a red line makes the brief strategy
   only.
2. **Objective and audience.** KPI strip: 90 day goal from calibrations, engaged audience age
   band, top country share, gender split (from `instagram.account.audienceDemographics` on any
   brand post, projected via the `instagram.account` container). Two boxes: who we are talking
   to (primary, secondary), what the data says to do (4 bullets with numbers). Flag-for-review
   banner (amber) when a guideline conflicts with the recommendation.
3. **Deliverables.** One card per piece: day and date, format and length, title, one-paragraph
   lede, then a spec grid: angle, must include, avoid, creators (first pick bold), success
   (numeric target bold), rights. Optional product slot in amber.
4. **Guardrails.** Two boxes: required, off limits.
5. **Creator shortlist.** Intro naming the discovery runs. Horizontal bar chart of followers
   colored by tier, bar label with Reel interaction rate. Then a creator card per creator
   (`creator-card.md`): badges in order fit ("Strong fit" or "Partial fit"), tier, then the
   card's own; no fit ring, because the rubric has no score. `{DETAILS}` holds angle, role,
   why, the recommended engagement cost (range and rationale), past partners in the
   category, contact, and the profile link. Then two boxes: budget scenarios, how the costs
   were set. Footnote naming creators considered but not shortlisted.
6. **Timeline.** Working back from the first post: outreach, confirm, brief calls, drafts,
   post days, 7 day readout.
7. **Measurement.** Table: piece, primary metric, target, benchmark from the brand's own
   medians, secondary metric.
8. **Footer.** Sources, date, "costs are opening offers not quotes", contact email note.

Design: token palette on `:root` with dark redefinitions under both the media query and
`[data-theme="dark"]`. Fonts from Google Fonts with fallbacks (Instrument Sans display, IBM
Plex Sans body, IBM Plex Mono data). Bullets use a positioned marker with left padding,
never a grid per list item (a grid splits inline bold labels into their own cells).
Categorical chart palette from the dataviz reference, validated. One axis per chart.

## Fit rubric

**Build the brand targeting first.** Before scoring, derive three inputs from the profile's
calibrations (never from Aspire's own positioning; this plugin serves any brand):

- **Buyer** and **category**: from `brand:summary` (`brand_summary` section) and
  `brand:business-context`. Write one line each, for example buyer "home cooks who buy
  premium cookware", category "consumer kitchen brands".
- **Off-audience signals**: the content types that would not reach that buyer. Infer from the
  buyer line and any `guideline` or `red_line` records (never `review:` keys).
- **Search vocabulary**: 3 to 6 bio keywords a creator serving that buyer would use. Derive
  from the buyer, category, and `brand:tracking-scope` hashtags. When `brand:summary` is
  missing, stop and return one question to the main thread asking for the brand's buyer in a
  sentence; do not fall back to a default audience.

State the derived buyer, category, and vocabulary in the brief's "How the shortlist was built"
box so the team can correct them.

Score each candidate on four checks. Strong = all four. Partial = two or three. Drop below two.

| Check | Strong signal | Weak signal |
| ----- | ------------- | ----------- |
| Audience match | Bio and recent posts speak to the derived **buyer** | Content that matches the off-audience signals, generic UGC portfolio only, quote graphics |
| Format proof | Recent Reels with views at or above the brand's target, hook rate above 45% | No Reels, image-only feed, interaction rate below 2% |
| Partnership proof | `hasBrandPartnershipExperience` true with partners in the derived **category** | No partnerships listed, or only partners outside the category |
| Logistics | Country matches, city near a planned event, `isPaidPartnershipMessagesEnabled` true | Outside the market, no contact route |

Exclude any handle recorded as a `competitor` calibration, and any account that is a brand
rather than a person unless the deliverable calls for a brand collab.

Tiers by role: **Reach** (500K+, one slot at most, fee heavy), **Practitioner** (100K to
500K, the voice of the buyer), **Niche voice** (any size, speaks directly to the buyer's
community), **IRL** (local to an event, lifestyle read). Rename tiers to match the brand's
vocabulary; the names above are placeholders, not a fixed taxonomy.

## Pricing method

1. Search for current-year rate benchmarks on the brand's network by follower tier and format.
   Fetch two sources and record their bands. On 2026-09-16 the Instagram bands were: micro
   (10K to 100K) Reel $300 to $800, carousel $200 to $650; mid (100K to 500K) Reel $800 to
   $5,000, carousel $600 to $3,000; macro (500K to 1M) Reel $5,000 to $15,000; mega (1M+)
   Reel $15,000 and up, bespoke. Rights, whitelisting and exclusivity add 30% to 200%.
   Bundles save 15% to 30%. Niche premiums and discounts vary by category; take them from the
   fetched sources for the brand's category, not from memory. Treat the bands above as a
   sanity check for the fetched figures, never as the source of a price on the page.
2. Per creator: tier band by followers and format, plus 30% to 50% for 90 day reuse and paid
   amplification whitelisting. Adjust up for Reel interaction above 6%, category-relevant past
   partnerships, exact topic fit. Adjust down for partial fit. Express as a range with a
   one-line rationale. Mega tier: label as an estimate, expect an agency rate card.
3. Event on-site work: base rate plus travel plus $500 to $1,500 for mid tier. Not benchmarked;
   label as an opening offer.
4. Scenarios: practitioners only; one reach creator swapped in; mega reach. Sum first picks.
5. Cite the benchmark sources on the page footer and in the chat summary.

## Atlas quirks (verified 2026-09-16)

- `search_posts` returns `media.mediaUrl` and `media.thumbnailUrl` as null when projected as
  leaf paths. Project the `media` container instead; the URLs are present.
- Same for `instagram.account.profilePictureUrl` on posts: project `instagram.account`.
- `search_creators` returns `instagram.profilePictureUrl` null as a leaf; project the
  `instagram` container and exclude the three demographics blobs to keep the payload small.
- Some `/thumbnail` routes on `cdn.aspire.io` return 404. Fall back to the base media URL.
- `search_creator_marketplace` requires `keyword` and rejects it alongside
  `filters.similarToCreators`, so lookalike search is unreachable from the connector.
- Marketplace results land in `search_creators` 1 to 3 minutes after `get_job_status`
  reports `completed`. Filter on `indexedAt` gte now-2h and the country to read them; the
  index is shared, so unrelated accounts appear in the same window.
- Creator co-authored (collab) posts on the brand's account carry the brand as
  `author.username`, `mediaProductType` null, and a mention of the brand handle. They are the
  strongest signal for collab performance.
- Stories appear as posts with `mediaKind` null and only `organicReach`. Exclude with
  `exists mediaKind`.
- Published pages cannot load `cdn.aspire.io` images. Embed as data URIs.
