# Creator brief reference

Used by the `atlas-creator-brief` agent. Page structure, campaign mode, fit rubric, pricing method (from the fee
calculator), and Atlas quirks learned on 2026-09-16 against the live server.

## Page structure

One self-contained HTML page, published with the Artifact tool. Sections in order:

1. **Header.** Eyebrow with handle, network, "Content creation brief", target week (or the
   campaign name and window). Headline that names the strategy in one line. Meta row: owner,
   channel and follower count, creator count, prepared date, and the "Prepared for" chip
   (`recipient-lens.md`). Standing-rule banner (red) when a red line makes the brief strategy
   only.
2. **Objective and audience.** KPI strip: 90 day goal from calibrations, engaged audience age
   band, top country share, gender split (from `instagram.account.audienceDemographics` on any
   brand post, projected via the `instagram.account` container). Two boxes: who we are talking
   to (primary, secondary), what the data says to do (4 bullets with numbers). A "Built on"
   line names the saved findings the plan leads with (market signal, weekly readout, ad reuse),
   each with its run date. Flag-for-review
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

## Campaign mode

For a dated campaign or launch (`brief_mode` `campaign`), the brief is time-bound in three
phases instead of one week of three posts.

- **Phases.** **Before:** outreach, contracts, brief calls, drafts, and content review of every
  draft. **During:** the post days, from the first post date to the campaign end (the launch
  week when no end is given). **After:** the recap against goals, 7 and 14 days after the last
  post.
- **Deliverables.** Sized to the window, not fixed at three: at least one launch-day
  deliverable per first-pick creator, optional teasers before the first post only when the
  brand's history shows teasers working, and sustain posts through the window. Cadence cap and
  repost cooldown still apply to the brand's own account.
- **Timeline**, worked back from the first post date (T): outreach by T-21, confirmations by
  T-14, brief calls by T-12, drafts due T-7, content review T-6 to T-3, final approvals T-2, go
  live T, daily pulse T to the campaign end, recap T+7 and T+14. When T is closer than 21 days,
  compress the steps before it proportionally and flag the risk on the page; never schedule a
  step in the past.
- **Creators.** First picks from the campaign's discovery pool (accepted first, then the top
  undecided by fit score), each carrying its discovery tier and fit ring on the card. Source
  beyond the pool only when fewer than five fit, and only within the chosen sourcing scope.
- **Measurement.** Two tables: during (the daily pulse metrics: creator posts live, engagement
  against each creator's own median, mentions, sentiment) and after (the campaign goal from
  `campaign:{slug}-brief` against the recap).
- **Page.** Section 3 groups deliverables by phase, section 6 is the phase timeline, and a
  closing "Next steps" box offers content review for drafts and the daily launch pulse.
  Title "<Brand> Campaign Brief: <Campaign>", republished to the same path for that campaign.

## Creator-ads mode (the CAS master brief)

For a CAS campaign (`brief_mode` `creator-ads`, `cas-campaign.md`), the brief is one master brief
per lane for the current round, not a weekly plan and not campaign phases. Editors cut the ads
from it, so it must be complete enough to edit from.

**Inputs from Atlas.** The lane records (`campaign:{slug}-lane-{lane}`), the campaign record
(`-cas`: package, term, round), and the roster (`cas-campaign.md`, **Working state**): the
creators approved at Gate 2 with their agreed fees. Creators and fees come from the roster,
never from a new search, and fees are shown as agreed. Also read the hook log
(`recordType` `hook` on the campaign's prefix) and the saved findings this reference already
uses, in the order `hooks-and-ctas.md`, **Where recommendations come from**, gives.

**Per lane, one brief with these fields:**

- **Concept and persona**, from the lane record, in its own words.
- **3 hooks, 2 CTAs, 1 body.** Hooks and CTAs are written and recommended per
  `hooks-and-ctas.md`: its sources, its patterns, its rules, and a reason under each one. The
  body carries the beats between the hook and the CTA.
- **Beat structure**: hook, problem or setup, proof, payoff, CTA, with seconds per beat.
- **10 to 15 B-roll shots**, each one line: what is filmed and which beat it serves.
- **Product and SKU**, from `brand:summary` and the campaign brief. Missing: a bracketed blank.
- **CTA destinations**: where each CTA sends people. Missing: a bracketed blank, never a URL
  invented.
- **Runtime per platform**: the clip lengths per network, from the lane or the campaign brief.
  None saved: a bracketed blank per network, and one line asking the CM to fill it.
- **Disclosure treatment**: the paid partnership label, plus anything `review:disclosure` says
  when it exists (read it for disclosure only).
- **Do's and don'ts**: from saved `red_line` and `guideline` records (never `review:`, `vetting:` or `program:` keys,
  and never the campaign's own `-cas`, `-lane-*`, `-terms` or `-decision-defaults` records).
  When the client's own creator brief guardrails are saved (a `guideline` whose body names
  them), mirror them line for line.
- **Delivered file naming**: `[Brand] - [Creator] - Clip [#]`, stated once per brief.
- **Creators**: the lane's approved creators from the roster, as creator cards, each with the
  agreed fee and ship date.

A `red_line` that blocks AI-written copy still applies: hooks, CTAs and the body become
directions, per `hooks-and-ctas.md`, **Limits**. Say so in the standing-rule banner.

**Editing coverage check**, before the page ships. Every brief must pass all three; fix the
brief, never the check:

1. Every hook has footage asked for: its on-screen action is in the B-roll list or the beats.
2. Every runtime can hold the beats: the beat seconds fit inside the shortest runtime, with the
   hook inside the first three seconds.
3. The B-roll list is complete: 10 to 15 shots, every beat served by at least one.

Show the result per lane on the page ("Coverage: 3 of 3 checks pass").

**The hook log.** Follow `hooks-and-ctas.md`, **Limits**: read every hook and CTA ever briefed
on the campaign, never reuse one, and append every new one as a `hook` finding.

**The page.** One page per round, a section per lane with an anchor (`#lane-{lane}`), the
coverage result at the top of each section. Title "<Brand> Creator Ad Brief: <Campaign>, round
{n}", republished to the same path for that round. It stays the full brief editors cut from; the
client approves the same briefs on the campaign page's Briefs tab (`cas-campaign.md`, **Gate
4**), which the main thread builds from this page. Sections 2, 5 and 6 of **Page structure** drop out: the
lanes set the audience, the roster replaces the shortlist, and the gates replace the timeline.

**Writes**, on the main thread's confirmation: a `brief` finding per lane (`locked: false`,
`briefPage`, `version`), then a `hook` finding per new hook and CTA, all per
`cas-campaign.md`, **Working state**. No `creator-brief-*` findings in this mode.

### A creator's revision

After the briefs are approved, a creator may reply with their own version (`cas-campaign.md`,
**1g**). The main thread launches this mode with `brief_mode` `creator-ads`, the campaign slug,
the round, and `revision`: the creator's handle and network, their concept, and their version as
pasted. Then the agent compares, and does nothing else:

1. Read the concept's newest locked `brief` finding and its page as the approved brief, and the
   creator's newest `brief-revision` when one exists (a second round compares against the
   approved brief, not the last revision).
2. Compare field by field: each hook and CTA, the body, the beats and their seconds, each B-roll
   shot, the product, the runtime per platform, the disclosure, and the do's and don'ts.
3. List each difference as one plain line: what changed, the approved text, the creator's text.
   For example "Hook B: 'Charged once Friday night, back Sunday dark' becomes 'One charge. Friday
   to Sunday.'", "Runtime: V2 45 seconds becomes 60 seconds", "B-roll 07, the trailhead sign:
   dropped". Wording that means the same thing is not a difference. No field names, no record
   words.
4. Check each difference against the rules this mode already applies: a hook or CTA in the hook
   log, a red line, the disclosure, and the editing coverage check. A difference that breaks one
   is marked with the rule in plain words ("drops the spoken paid partnership line").
5. Return the list, any marked differences, and "no changes" when the versions match. Publish
   nothing and write nothing: the main thread writes the `brief-revision` after its own
   confirmation. When the client approves it, the creator's version becomes their locked brief;
   any new hook in it is appended to the hook log then.

## Fit rubric

**Build the brand targeting first.** Before scoring, derive three inputs from the profile's
calibrations (never from Aspire's own positioning; this plugin serves any brand):

- **Buyer** and **category**: from `brand:summary` (`brand_summary` section) and
  `brand:business-context`. Write one line each, for example buyer "home cooks who buy
  premium cookware", category "consumer kitchen brands".
- **Off-audience signals**: the content types that would not reach that buyer. Infer from the
  buyer line and any `guideline` or `red_line` records (never `review:`, `vetting:` or `program:`
  keys, and never a creator ad campaign's `campaign:{slug}-cas`, `-lane-*`, `-terms` or
  `-decision-defaults`).
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
- `/thumbnail` routes on `cdn.aspire.io` return 404 on image posts, where the base media URL is
  the full-size image. On video posts the base URL is the video file and `/thumbnail` is the
  full-size poster. Pass both, `mediaUrl` first, to the **Images** snippet in `creator-card.md`.
- **Marketplace search** (re-verified 2026-10-07). One `search_creator_marketplace` call
  searches Instagram and/or TikTok for one keyword, or on filters alone:
  `search_creator_marketplace({ keyword, networks, instagram: { filters }, tiktok: { filters }, asProfileId })`.
  Set `networks` to the networks you want (it defaults to both) and send a filter block only
  for a network in `networks`; a block for any other network, or the old top-level `filters`,
  fails the whole call with `invalid-input`.
  - Instagram filters: `creatorCountries` (a list of country codes), `creatorMinFollowers`
    (0, 10000, 25000, 50000, 75000, 100000, 250000, 1000000) and `creatorMaxFollowers` (the
    same without 0), so round a follower band outward to the nearest allowed values;
    `creatorLatestPostActivity` (`last_7_days`, `last_30_days`, `last_90_days`),
    `creatorInterests` (up to five), `creatorLanguage` (language codes), `recommendationType`
    (`most_relevant_for_me`, `high_ad_performance`, `most_ads_experience`, `similar_brands`,
    `similar_audience`, `interested_in_collaboration`), and the yes-only filters
    `verifiedAccount`, `hasPublicContactEmail`, `hasPortfolio`, `featuredInPaidAds` (creators
    already in partnership ads) and `excludeMessagedCreators` (leave out creators the brand has
    already messaged).
  - `keyword` is optional. Without one, every network in `networks` needs at least one filter
    of its own, so a keyword-less Instagram search sends `networks: ["instagram"]`.
    `instagram.filters.similarToCreators` (one to five handles) finds lookalikes and is sent
    only without a keyword; the server rejects the two together.
  - TikTok filters are ranges and codes: `countryCodes` (defaults to `["US"]`, echoed in
    `jobs.tiktok.appliedDefaults`; all codes from one region: US alone; DE, ES, FR, GB, IT; or
    the rest). TikTok supports only US, DE, ES, FR, GB, IT, AE, AR, AU, BR, CA, CO, EG, ID,
    IL, JP, KR, MX, MY, PH, SA, SG, TH, TR, TW and VN, and any other code fails the whole call,
    Instagram included: send only supported codes, and when none of the brand's countries is
    supported, drop `tiktok` from `networks` and report TikTok as not searched. Never omit
    `countryCodes` to fall back on the US default. When the chosen markets span regions, the
    first call per keyword carries one region and each further region gets its own call with
    `networks: ["tiktok"]` only, so Instagram is searched once; any requested region left
    unsearched is reported as not searched. `stateProvinces` (only with
    `countryCodes` exactly `["US"]`), `minFollowers` / `maxFollowers`, `minEngagementRate` /
    `maxEngagementRate` (0 to 1), `languages`, and `contentLabelIds` / `industryLabelIds`.
    Label ids come only from `list_creator_marketplace_labels({ network: "tiktok" })`, matched
    by label name; an unknown id fails the call. Keyword results are personalized per TikTok
    One seat; `jobs.tiktok.seat` says whether the brand's (`profile`) or Aspire's (`default`)
    ran it.
  - The result has one entry per requested network under `jobs`: `{ jobId, runId }` when it
    started, or `{ skipped: true, reason }`. Poll `get_job_status` with **each** started
    `jobId` until `completed` or `failed`. On a skip: `rate-limited` or `unavailable`, retry
    that network once later in the run with `networks` set to that network only; `no-seat`
    after sending label ids, retry that network without them; anything else, report the network as not searched. The call errors only
    when every requested network was skipped.
- Marketplace results land in `search_creators` 1 to 3 minutes after each network's job
  reports `completed`. Filter on `indexedAt` gte now-2h, the network, and the country to read
  them; the index is shared, so unrelated accounts appear in the same window.
- Creator co-authored (collab) posts on the brand's account carry the brand as
  `author.username`, `mediaProductType` null, and a mention of the brand handle. They are the
  strongest signal for collab performance.
- Stories appear as posts with `mediaKind` null and only `organicReach`. Exclude with
  `exists mediaKind`.
- Published pages cannot load `cdn.aspire.io` images. Embed as data URIs with the snippet in
  `creator-card.md`, **Images**, page profile, sized to each image's rendered box at 2x.
