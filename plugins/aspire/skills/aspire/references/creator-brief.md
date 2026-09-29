# Creator brief reference

Used by the `atlas-creator-brief` agent. Page structure, fit rubric, pricing method (from the fee calculator), and
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
8. **Footer.** Sources, date, the rate label, "costs are estimates from public view counts, not quotes", contact email note.

Design: token palette on `:root` with dark redefinitions under both the media query and
`[data-theme="dark"]`. Fonts from Google Fonts with fallbacks (Instrument Sans display, IBM
Plex Sans body, IBM Plex Mono data). Bullets use a positioned marker with left padding,
never a grid per list item (a grid splits inline bold labels into their own cells).
Categorical chart palette from the dataviz reference, validated. One axis per chart.
With a saved brand theme, its tokens, fonts, header, logo, and chart series replace these
defaults: apply `theme:brand` per `theme.md`, **Applying the theme**.

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

Every engagement cost comes from the fee calculator (`fees.md`), never from benchmarks
fetched during the run.

1. Read `fees:rate-card` from the calibration read in step 1; without one, use the Aspire
   recommended rates. Label the costs as `fees.md` says.
2. Per creator: price the deliverables the brief assigns them as one bundle, per **How a fee
   is calculated** (median views of the last 10 posts per channel, bundled, times the CPM
   ladder). The creator row shows target; the rationale gives open to max and the bundled
   median views.
3. A creator or deliverable the calculator cannot price (too few posts with views, a platform
   outside the brand's rates, on-site event work) shows no cost: say which input is missing,
   and leave it out of the scenario totals with a note.
4. Scenarios: practitioners only; one reach creator swapped in; mega reach. Sum the first
   picks at target.
5. Name the rate label and the view window in the "how the costs were set" box.

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
- Published pages cannot load `cdn.aspire.io` images. Embed as data URIs with the snippet in
  `creator-card.md`, **Images**, page profile.
