# CAS campaign page: Ad Performance to Design standards

Part of the CAS campaign reference. `cas-campaign.md` holds the state model, setup interview,
dispatch table, gate packets and flows, and its **1d** maps every part of the campaign page to
its file. A section named here without a file, such as **Gate 2** or **1e**, is in the file
that map gives.

### Ad Performance

How the round in view's partnership ads sold against {brand}'s cost per sale target, read from
{brand}'s own Meta ad account through Aspire Atlas at each publish. It covers only the ads that ran
a variant's live post, so other ads in the account never count. The client writes nothing on this
tab. In order: **Cost per sale against target**, **Headline numbers**, **Weekly spend and
return**, **Variants ranked**, **Compare**, **Who watched** and **Changes for round {t}**. **Who
watched** stays hidden until `search_ads` offers an audience breakdown (**Who watched**, below).

#### Where the results come from

Claude reads the results at every publish, interactive or scheduled (**Reading the results**), and
writes them into the page itself as the round's results. The page never calls Atlas. A result is
as old as the last publish, and the tab says so: "As of {time}", the read's time in the viewer's
own time zone, under the tab's header. Results are never saved to Atlas: Meta's figures are the
record, and each publish reads them again.

**No Meta ad account linked.** Every `search_ads` reply names the ad accounts linked to the
brand's Profile that it read (`adAccountIds`), whoever runs it. When the first read's list is
empty, no ad account is linked, and every section on the tab is replaced by one Card for both sides:
"Connect your Meta ad account to see results", with "Results show here once {brand}'s Meta ad
account is linked to Aspire Atlas." under it. The agency also sees, under an "Agency only" rule,
"Link it from the chat: /aspire:aspire, then connect Meta." Home's **Last round result**, the
calendar's spend and return, **Did it sell** and the Ads live step read as they do with no results.
No section shows a zero or an empty chart in its place.

**The live post on each variant.** Each ad maps to its creator and variant through the post it ran.
Each variant in a creator's variant plan (**Selected Creators**, **Concept and variant plan**) has
a **Live post** field: the link to the Instagram post the partnership ad runs, filled when the ad
goes live. It is kept with the creator's plan for the round, `v{n}-post` on
`agency/creator-{net}-{handle}-r{round}`, a stamp whose `value` is `{lane, url, igMediaId}`, `lane`
being the concept the variant was cut for and `igMediaId` filled by Claude once a read finds the
post (**1e**). An Editor sets it in the variant plan Table's **Live post** column (an Input that
takes an Instagram post link), or from **Ads not matched** below, or the CM says it in the chat. A
link that isn't an Instagram post link is refused in place: "Paste the link to the Instagram post
the ad runs." **Pulling decisions** saves it to the creator's `roster` finding with the plan's
overrides (`variantPlan`, field `post`), so it holds after the page is rebuilt. Claude never sets
a live post by guessing: it proposes nothing from ad names, which people type, and a post two
variants name counts for neither until an Editor fixes one ("Two variants name this post").

#### Reading the results

For each round that is in market or was (**Rounds**: its launch date has passed, and step 4 is
cleared), at every publish:

1. **Dates.** From the round's launch date to the earlier of today and its in-market end (or
   `closedAt`), in the campaign's saved time zone. Days are each ad account's own days, as
   `search_ads` reads them. Spend after the round's in-market end isn't counted in the round.
2. **The round's ads.** `search_ads` with `groupBy` `ad`, `isPartnershipAd` true, `creatorHandles`
   the round's creators on Selected Creators (Instagram handles), the dates above, and
   `actionTypes` `["video_view"]`, paged to the end. Each row names the post it ran
   (`post.igMediaId`, `post.permalink`) and its creator (`creator.handle`).
3. **Matching.** A row belongs to a variant when its post is that variant's live post: the same
   `igMediaId`, or before one is stored the same post code in the link (the part after `/p/`,
   `/reel/`, `/reels/` or `/tv/`, up to the next `/` or `?`), compared exactly, since post codes
   are case sensitive. Claude then stores the `igMediaId` on the stamp. Every other
   row is **not matched**: it isn't in any figure on the tab and is listed for the agency only.
4. **Weeks.** `search_ads` with `groupBy` `day`, `igMediaIds` the matched posts, the same
   `isPartnershipAd` and `creatorHandles` as step 2, the same dates and `actionTypes`, paged to the
   end, and summed into weeks, so the weeks hold exactly the ads step 2 matched: week 1 is the launch date and the six
   days after it, and so on, the last week cut at the read's last day.
5. **Days live and the last 7 days.** Two more reads with step 4's filters and `groupBy` `ad`,
   both running to today even after the round's in-market end, because a winning ad often keeps
   running: one from the launch date, whose rows' `firstDate` and `lastDate` give each variant's
   Days live, and one over the last 7 days, for **Fatigued** below. Neither changes a total: the
   tab's figures stay inside step 1's dates.

`creatorHandles` and `igMediaIds` take at most 100 values each, so a longer list is read in
batches of 100 with the same other arguments, and the batches' rows are put together before
anything is summed. A row comes back in one batch only, since each ad has one creator and one post.

The `search_ads` rules hold everywhere (`atlas-tools.md`, **Paid ads**, and
`list_ad_search_fields`, which Claude calls before the first read in a session):

- **One figure per currency.** Every row carries its `currency`. Money is added only within one
  currency and never converted. The tab's figures are in the **results currency**: the target's
  currency when a target is saved and the ads ran in it, else the currency with the most spend.
  Spend in any other currency shows as one line under **Headline numbers**, "Also {spend} spent in
  {currency}, {p} purchases", never added in. A variant whose ads ran only in another currency is
  kept out of the ranking, the statuses, the hit rate and the totals: it is listed under the table
  in "In other currencies", with its figures in its own currency and no status.
- **Attribution windows.** Rows also split by attribution window. Within one currency they add up
  the way Meta's own totals do, and when more than one window is in play, **Headline numbers**
  says "Purchases are counted under each ad set's own attribution window: {windows}."
- **Ratios from sums.** Every rate is worked out again from the summed counts, never averaged
  from rows or days.
- **No value is not zero.** A metric Meta reports as null is left out of its sum. A figure whose
  every part is null shows "No data", and a figure with no denominator (no impressions, no
  purchases) shows "None yet" for purchases-based figures and "No data" otherwise, never 0.
- **Purchases decide revenue.** A row with a purchase count of 0 counts revenue 0, even when Meta
  leaves its purchase value null, so its ROAS is a real 0.00. Only a row whose purchase count is
  null too has no purchases reported. This holds for the headline numbers, the weeks and the
  variant rows alike.
- **Paid only.** Nothing here adds organic figures from `search_posts`.
- **No ad code.** `search_ads` rows carry no ad code, and the page never holds one, from any tool,
  in any part of the page or page data (`atlas-tools.md`, **Ad codes**).

The figures, each worked out from sums over the matched ads in the results currency:

| Figure | Worked out as |
| ------ | ------------- |
| Spend | `paidSpend` |
| Impressions | `paidImpressionCount` |
| CPM | spend over impressions, times 1,000 |
| Hook rate (3 second plays) | the `video_view` action's `count` over impressions |
| Hold rate (15 second plays) | `paidVideoThruplayCount` (plays to 15 seconds, or to the end of a shorter video) over 3 second plays |
| Link CTR | `paidInlineLinkClickCount` over impressions. `search_ads`'s own `paidCtr` counts every click, not link clicks, so it isn't used |
| Purchases | `paidPurchaseCount` |
| Revenue | `paidPurchaseValue` |
| ROAS | revenue over spend |
| Cost per sale | spend over purchases |
| Days live | from the first day the variant's ads spent to the last, both counted, from the launch date to today (step 5) |

**Done when the totals match Meta.** The tab's Spend, Impressions, Purchases and Revenue equal
Meta Ads Manager's totals for the same ads (the variants' live posts), the same dates and the same
currency. Before handing over a first publish with results, Claude says so and asks the CM to check
one round against Ads Manager.

**What the page itself holds.** For each round with results: the read's time and dates, the
results currency, the totals, the weeks, and one row per matched variant: the creator, concept,
variant number, currency and every figure above, the product, persona and tier **Compare** groups
it by (**Compare**, **Groups**), plus the round's target, floor, status and compare settings, the
client's insight cards, and the audience when **Who watched** is shown. All of it is {brand}'s
own ad account's figures, so the client sees every one of them,
spend and cost per sale included (**Who sees what**). The rows hold no ad name, ad or campaign id,
ad account, hook, CTA or framework. The not matched rows (each ad's name, its creator, its post
link, spend and dates) go only to `agency/performance-r{round}` (**1e**).

#### The target and the floor

Read from `campaign:{slug}-decision-defaults` (**1a**), never from a number in the page's code:

- **Cost per sale target**: `costPerSaleTarget` `{amount, currency}`, asked at setup (C6a) or
  later from the status screen (**1c**, row 17).
- **Spend floor**: `spendFloor` `{amount, currency}`, else `switchOffFloor.spendUsd` when the results
  currency is USD. A variant under it hasn't spent enough to judge.
- **Watch band**: `watchRatio`, the multiple of the target up to which a variant is Watch, 1.3 when
  the record has none.
- **Fatigue**: `fatigueDays`, the days live after which a winning variant can be Fatigued, 36 when
  the record has none.
- **Stuck**: `stuckDays`, the days live after which a variant still under the floor is flagged, 7
  when the record has none.
- **Enough to compare**: `compareMinVariants`, the variants past the floor a group needs before
  **Compare** names it best, 2 when the record has none, and `compareMinPurchases`, the purchases
  it needs before its cost per sale is called best, 3 when the record has none.
- **Margin**: `winnerMarginPct`, already in the record, how far ahead of the next group a group
  must be before **Compare** names it best, 20 when the record has none.

With no target saved, or one in another currency than the results, the tab shows every figure with
no target line, no hit rate and no Winning, Watch, Fatigued or Retire status, only Testing; the
agency sees one line, "No cost per sale target saved for {brand}" or "The target is in {currency},
the ads report in {currency}", with how to set it in the chat. With no floor, no variant is
Testing.

#### Status

Each matched variant in the results currency takes one status, the first rule that holds:

| # | Status | When |
| - | ------ | ---- |
| 1 | Testing | Spend under the floor |
| 2 | Retire | No purchase reported (a count of zero, or none from Meta), and spend above the Watch band (`watchRatio` times the target) |
| 3 | Watch | No purchase reported, and spend within the Watch band |
| 4 | Fatigued | Cost per sale at or under the target, live past `fatigueDays`, and slipping: its cost per sale over the last 7 days is above its cost per sale from the launch date to today (both from step 5's reads), or it spent in the last 7 days with no purchase |
| 5 | Winning | Cost per sale at or under the target |
| 6 | Watch | Cost per sale up to the Watch band |
| 7 | Retire | Cost per sale above the Watch band |

The statuses are Winning, Testing, Watch, Fatigued and Retire, and their Badges follow **Status
pills**: Winning success, Testing processing, Watch and Fatigued warning, Retire error. They are
semantic, so no brand theme colors them.

**Won** means Winning or Fatigued: at or under the target. **Hit rate** is the variants won over
the variants past the floor ("{w} of {a} ads won", {a} counting every variant not Testing). Home's
**Last round result** and **Tab summaries** use these same counts.

**To retire or refresh**, the variants Aspire acts on:

- **Retire**: over the Watch band, or past it with no purchase ("over the cost per sale bar").
- **Refresh**: Fatigued ("live past {fatigueDays} days and slipping").
- **Not spending**: Testing, with `stuckDays` days or more from its first day of spend to today
  ("under the spend floor after {d} days"). It counts to today, not to its last day of spend, so
  an ad that spent once and stopped is caught.

Each one is a row in Home's **Needs attention**, "Retire or refresh @{handle}'s V{variant}", with
its reason and its cost per sale against the target, waiting on Aspire, opening
`#performance/r{n}/variants` (**Home**, **The Everything view**). Only a round in market, or
in its 14 days after the in-market end (**Reminders and the weekly call**, **Results refresh**),
flags them, since its ads often still run; an older round's statuses are history.

#### Cost per sale against target

`performance-result`, open, for both sides. A Card with two parts side by side from 640px,
stacked on a phone:

- **The number.** The blended cost per sale (all matched spend over all matched purchases) as a
  hero figure, `text-5xl font-semibold`, in the results currency. Under it, "against a {t} target",
  and a Badge: success "{d}% under target" at or under the target, warning "{d}% over target"
  above it, {d} rounded to a whole number. Under that, in `text-sm text-muted-foreground`,
  "{p} purchases from {s} spent · {w} of {a} ads won".
- **The hit rate ring.** The **Score ring** from **Component classes** at `size-16`, its value the
  hit rate out of 100 and its number "{h}%", `aria-label="Hit rate {h} percent, {w} of {a} ads at
  or under target"`, with "Hit rate" under it. It is one part of a whole, so a ring fits it, and
  like the match score's ring it is never colored by result: the Badge beside the number carries
  that. With no variant past the floor yet, the ring isn't drawn and the part reads "No ad has
  spent past the floor yet."

With no target, the number shows alone with no target line, Badge or ring (**The target and the
floor**). With no purchase yet, the number reads "No sales yet" and "{s} spent" under it.

**Not live yet.** For a round whose launch hasn't come, or whose step 4 isn't cleared, this
section is the tab's only section, for both sides:

- "Round {n} goes live {launch date}", the date in `text-2xl font-semibold`, with "in {d} days"
  from the viewer's clock, or "Launch at risk" (warning) while step 4 is open past the launch, as
  **Round steps** says.
- "{x} of {y} cuts in · {a} approved", the counts **Where we stand** and Content Review use for
  the round.
- Link Buttons: "Open Content Review" to `#review/r{n}`, and, when an earlier round has results,
  "See round {m}'s results" to `#performance/r{m}/result`, {m} being the newest such round.

A round in market with no matched ad yet shows the same Card with "Round {n} went live {date}. No
ad has run a variant's live post yet." For the agency only, under an "Agency only" rule: "{k}
variants have no live post", linking to the first card's variant plan, and **Ads not matched**
when there are any.

#### Headline numbers

`performance-headline`. A KPI row of stat tiles, each a Card with the label in `text-sm
text-muted-foreground` and the value in `text-2xl font-semibold`, in a `grid grid-cols-2 gap-4
sm:grid-cols-3 lg:grid-cols-5` grid: Spend, Impressions, CPM, Hook rate, Hold rate, Link CTR,
Purchases, Revenue, ROAS and Cost per sale. Money is in the results currency, with its code once
in the section's description ("In {currency}"). Rates show one decimal ("31.4%"), ROAS two ("2.41").

- ROAS adds "Peak week {w}: {r}" under its value, the week with the highest ROAS among weeks with
  a purchase.
- Hook rate and Hold rate each carry a Tooltip saying what they count: "Plays of 3 seconds or more,
  over impressions" and "Plays of 15 seconds or to the end, over plays of 3 seconds or more".
- No tile has a sparkline or a target of its own: the weeks are in **Weekly spend and return**,
  and the target in the section above.

Under the tiles, the other currency line and the attribution window line when they apply.

#### Weekly spend and return

`performance-weekly`. Two charts, one above the other, sharing one week axis (Week 1 to Week {w},
each with its dates in the Tooltip), never one chart with two scales:

- **Spend by week**, a bar chart in `--chart-1`, its y axis in the results currency from zero.
- **ROAS by week**, a line in `--chart-2` with a marker on each week, its y axis from zero.

Each chart is titled, has one series and so no legend, and labels only its highest week directly.
Colors are read from the CSS variables at run time (**Banned on the page**), so the brand's chart
colors apply and the contrast check in **Brand theme on the page** has already passed them. Hover,
focus or tap on a week shows one Tooltip for both charts: "Week {w}, {dates}: spend {s} · ROAS
{r} · {p} purchases". A week with spend and a purchase count of 0 shows ROAS 0.00 (**Purchases
decide revenue**); a week whose purchase count Meta left null draws no point, and its Tooltip says
"No purchases reported". A
week with no spend draws no bar and no point. Under the charts a Table, "Show as
table", lists each week's Spend, Purchases, Revenue and ROAS, so nothing reads by the chart
alone. The charts draw at their container's width and redraw when it changes (**Responsive**,
**Media**). The calendar's in-market days read the same weeks (**Home**, **Calendar**).

#### Variants ranked

`performance-variants`. The every variant table, one row per matched variant, sorted by cost per
sale, cheapest first; variants with no purchase next, by spend, most first; Testing variants last.
The first 10 rows show, then a ghost Button "Show all {n}"; "Show fewer" after.

| Column | Shows | Who |
| ------ | ----- | --- |
| Variant | "V{n}" with the concept chip (**Concept colors**) | Both |
| Creator | Avatar and @handle, opening their card on Selected Creators | Both |
| Hook | "H2 Demo first", by **Reading a creator's variant**, with "Broken" when removed | Agency only |
| CTA | "C1 Direct", the same way | Agency only |
| Spend | The amount; under the floor, a **Progress** bar under it at spend over the floor, with "{x} of {floor} floor" in `text-xs text-muted-foreground` | Both |
| Days live | "{d} days" | Both |
| Hook rate | "31.4%" | Both |
| Cost per sale | The amount, or "None yet" | Both |
| Status | Its Badge (**Status**), with the flag's reason in a Tooltip when it is to retire or refresh | Both |

The Hook and CTA columns are read on the Editor's page only (**Reading a creator's variant**), so
the client's table, the page itself and **Preview as client** never have them. A row whose cut was
made for another concept shows the agency "Cut for {concept}" as Content Review does.

**Top ads.** Above the table, a Tabs list, "Cost per sale", "Hook rate" and "Spend", opening on
Cost per sale and kept in memory only, picks the order of a strip of the 3 top variants as small
Cards (variant, creator, the picked figure in `text-2xl font-semibold`, status Badge), each
opening its row. Cost per sale takes the cheapest with a purchase, past the floor; Hook rate the
highest past the floor; Spend the most. The table's own order doesn't change.

On a phone the table is a stack of Cards, one per variant, its title "V{n} · @{handle}" and the
other columns as label and value pairs (**Responsive**, **Tables**).

**Ads not matched**, agency only, under a dashed rule headed "Agency only", only when any exist:
one row per not matched ad from `agency/performance-r{round}`, with its creator, its post as a
link, its spend and dates, and a Select "Link to variant" of that creator's V1 to V{v} with no
live post. Picking one writes that variant's `v{n}-post` stamp, logs an agency entry, and the
next publish counts the ad. "{k} ads by the round's creators aren't counted because their post
isn't a variant's live post." sits above the list.

#### Compare

`performance-breakdowns`. The round's results split by what went into each ad: the framework,
hook and CTA it was cut with, its concept, persona and product, its creator, and the creator's
tier. It answers which of those sold at the lowest cost per sale and held attention best. Shown
for a round with matched results in the results currency; otherwise the section isn't drawn, as
with the rest of the tab (**Not live yet**, **No Meta ad account linked**).

**What the client sees, and what stays agency only.** The framework, hook and CTA groups are
agency only, whole. The client reads each concept's own framework (its hero's, **A concept**) and
its hooks and CTAs in the brief, but which variant used which is the agency's cut plan
(**Concept and variant plan**, **What the client sees**), and a group's results can't be shown
without it. So the client gets no framework,
hook or CTA group, not even as a bare label like "H1" or "V1 PAS", and no insight card that names
one. Those groups are worked out on the Editor's page by **Reading a creator's variant** and are
never written to the page itself, client readable page data or the client's export. Concept,
persona, product, creator and tier are labels the client already reads on Creator Selection and
Selected Creators, so those groups show to both sides. A concept's results are those of all its
variants, which are cut to several frameworks, hooks and CTAs, so they are shown as they are; when
a concept's variants all happen to share one framework, its row says no more than the brief and
**Variants ranked** already let the client see.

##### Groups

The rows are exactly **Variants ranked**'s matched variants in the results currency: the same set
the headline numbers add up. Each variant falls in exactly one group of each kind, read this way:

| Group | Read from | When it can't be read |
| ----- | --------- | --------------------- |
| Framework (agency only) | **Reading a creator's variant**, its code and name | "Not planned" |
| Hook (agency only) | **Reading a creator's variant** for the row's concept, its number and type within that concept, with its line and type from that concept's brief (`briefs/{lane}-r{round}`) | "Not planned"; a removed hook keeps its number with the "Broken" Badge, as on **Variants ranked** |
| CTA (agency only) | **Reading a creator's variant** for the row's concept, its number (C1 or C2) within the row's product, since a number names a different CTA in each concept | "Not planned"; a removed one as for hooks |
| Concept | The live post's `lane` (**The live post on each variant**), as the row's concept already is | Never empty: the row has one |
| Persona | The creator's persona for the round (**The match score**, **Concept and persona**), when the row's concept is the creator's concept. A persona group is the pair of concept and persona, since personas belong to a concept | "No persona" under the row's concept, also for a cut made for another concept, whose persona was never set |
| Product | The product of the row's concept (the live post's `lane`) in the round's brief, not the creator's current concept. A product the brief names that isn't in scope is its own group under that name, with the warning Badge "Not in products in scope" | "No product" |
| Creator | The row's creator | Never empty |
| Tier | **Creator Selection**, **Tiers**, worked out at publish | "No follower count" |

Every read above is for the row's concept, the live post's `lane`, so an old cut made for another
concept keeps its own concept's product, hooks and CTAs. A group that can't be read is still a
row, shown last in its table, so nothing is left out. At
publish Claude writes each row's product, persona and tier into the page itself with its other
figures, so the client's groups come from the page itself and change only at the next publish.
The agency's framework, hook and CTA are read live, so an Editor's change to a variant plan moves
the row at once.

**What isn't here.** Ads not matched to a variant aren't in the headline numbers, so they are in
no group; for the agency the section's description adds "{k} ads by the round's creators aren't
matched to a variant and aren't compared." when **Ads not matched** has any. Variants in "In
other currencies" aren't compared either, since a group never mixes currencies; the description
adds "Variants in {currency} aren't compared. They're listed under Variants ranked." for each.

**The figures.** A group's figures are worked out from its rows' summed counts, by the same table
as **Reading the results**: Spend, Impressions, Hook rate, Hold rate, Link CTR, Purchases, Revenue,
ROAS and Cost per sale. No group averages its variants' rates. A null stays out of the sum and a
group whose every part is null shows "No data", by the same rules. **Past the floor** means spend
at or above the spend floor, or any spend when no floor is saved, whatever the status, so it is
counted with or without a target. **Won** is the count from **Status**, and a group's **win rate**
is its won over its past the floor ("{w} of {a}"). With no target saved, or one in another
currency, there is no Won or win rate anywhere in the section, in its tables or in its sheets,
the same as the rest of the tab; leaders on cost per sale and hook rate still work.

**Each kind adds up to the headline numbers.** Because every row is in exactly one group of each
kind, the groups' Spend, Impressions, Purchases and Revenue add up to **Headline numbers**.
Persona groups add up the same way, since each is a concept and persona pair, and within a concept
they add up to the concept's row. The page checks it when it draws the section, counting a group
whose figure is "No data" as nothing on both sides, as the totals do, and comparing money in the
currency's smallest unit (cents for USD) after rounding, and counts exactly: a kind whose sums differ from the totals isn't drawn,
and its place reads "These groups don't add up to the round's totals yet. They'll show at the next
update." For the agency it names the kind and the gap. Rates are never checked this way, since a
rate of a whole isn't the sum of its parts' rates.

##### Enough to call a leader

A group is named best on a figure only when the numbers support it:

- **Enough data.** The group has at least `compareMinVariants` variants past the floor (with no
  floor saved, variants with spend). To be named best on cost per sale it also needs at least
  `compareMinPurchases` purchases (**The target and the floor**).
- **A real margin.** Among the groups with enough data for that figure (for cost per sale, the
  purchases too), the best beats the next by at least
  `winnerMarginPct` percent: on cost per sale, the next one's is that much higher; on hook rate,
  the best's is that much higher.
- **Something to beat.** At least two groups of the kind have enough data.
- **A real group.** "Not planned", "No persona", "No product" and "No follower count" are never
  named best and never count as the next group: they hold what couldn't be placed, not a choice
  anyone made. Nor is a hook or CTA with the "Broken" Badge, since the brief no longer has it to
  repeat; it keeps its figures in the table.

Persona leaders are compared across every concept and persona pair in the round; hook and CTA
leaders within each product's block (**The parts**). When no group passes, nothing is named best
and the kind says why in one line:

- Too little data: "Too early to call: {x} of {y} {groups} have {n} ads past the spend floor and
  {p} purchases.", with "{n} ads with spend" when no floor is saved, and without the purchases
  where the kind is compared on hook rate only.
- Enough data but no margin: "No clear leader: {best} is {d}% ahead of {next}, under the {m}%
  needed."

**Small sample** is an outline Badge beside a group's name when it has fewer than
`compareMinVariants` variants past the floor. A group with enough variants but fewer than
`compareMinPurchases` purchases shows its cost per sale with an outline Badge "Few sales" beside
the figure instead. So a low cost per sale from one ad or one sale never reads as a result. Leaders are tagged with a soft Badge, never a status
color, since being best isn't the same as beating the target.

##### Insight cards

At the top of the section, before the tables: up to 3 Cards for the client and, under an "Agency
only" rule, up to 3 for the agency, in a `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`
grid. Claude writes them at every publish, interactive or scheduled, from that publish's
figures. None is fixed copy: each says what this round's numbers show, and a publish whose
numbers changed writes new ones.

Each card has a headline of one sentence in `font-semibold`, the figures it rests on in
`text-2xl font-semibold` with what they are compared with ("{x} per sale against {y} for the
round"), a line in `text-xs text-muted-foreground` with the sample ("{a} ads past the floor,
{p} purchases"), and a ghost Button "See the numbers" to the table it comes from.

What a card may say:

- Only what **Enough to call a leader** allows: a leader, the gap to the next group or to the
  round's blended figure or the target, and a group running over the Watch band. A card about a
  group's cost per sale needs that group to have enough purchases.
- Facts, never reasons. "Ads cut for {concept} sold at {x} per sale, 34% under the round" is
  allowed; why it happened isn't, since the numbers don't show it. No forecast, and nothing about
  spend not yet made.
- The client's cards draw only on concept, persona, product, creator and tier. A card that names
  a framework, hook or CTA is the agency's, and is written only to `agency/performance-r{round}`
  (**1e**).
- With nothing that passes, one card per side: "Too early to call a winner. Each group needs {n}
  ads past the spend floor and {p} purchases." and how many have that. Never a card made up to
  fill the row.
- The agency's cards are about framework, hook and CTA only; concept, persona, product, creator
  and tier are the client's cards, which the agency sees too.

The client's cards are in the page itself; the agency's are in `agency/performance-r{round}`
with the figures they quote. Because the agency's groups are read live, an agency card naming a
group whose quoted figures differ from the table's now shows "The plan changed since the last update. This
card updates at the next one." in `text-xs text-muted-foreground`.

##### The parts

In this order. The client's parts first, then, under a dashed rule headed "Agency only", the
agency's. Each part is a sub-heading in the section with its own table; on a phone each table is
a stack of Cards (**Responsive**, **Tables**). Money is in the results currency, rates show one
decimal and ROAS two, as in **Headline numbers**.

1. **Concepts and personas.** One row per concept, in the brief's concept order, with its chip
   (**Concept colors**), then a row per persona under it, indented, "No persona" last when it has
   rows. Columns: Concept or persona,
   Variants, Spend, Hook rate, Cost per sale, and Win rate, shown as a **Progress** bar at the win
   rate with "{w} of {a}" beside it. The bar isn't colored by result; its number carries it. With
   no target, the Win rate column isn't there. A concept or persona named best on cost per sale
   carries the soft Badge "Lowest cost per sale".
2. **Products.** One row per product in **Products in scope** order, then products not in scope
   by name, then "No product" when it has rows: Product, Concepts, Variants,
   Spend, Purchases, Revenue, ROAS, Cost per sale and Win rate, the same way.
3. **By creator.** One row per creator, sorted by cost per sale, cheapest first, then those with
   no purchase by spend: Creator (Avatar and @handle, opening their card), Tier, Concepts (the
   chips of every concept their matched variants were cut for), Variants, Spend, Impressions, Hook rate, Purchases, Cost per sale, ROAS and Won. The first 10
   show, then "Show all {n}", as in **Variants ranked**. A creator's figures are their own ads'
   sums, so a creator with one cheap variant and one dear one shows the two together.
4. **By tier.** One Card per tier with matched ads, in tier order (Nano to Mega, then "No follower
   count"), in a `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` grid. Each shows the tier,
   "{c} creators · {v} variants", and Spend, Impressions, Hook rate and Cost per sale as label and
   value pairs. Up to three soft Badges tag the leaders: "Lowest cost per sale" and "Highest hook
   rate" by **Enough to call a leader**, and "Most impressions" on the tier with the most. Most
   impressions is a count, not a result, so it needs no margin, but it goes only to a real tier
   (never "No follower count") that has enough data itself, and only when two or more real tiers
   have enough data. A tier can carry more than one, and a Badge no tier earns
   isn't shown.
5. **Which framework won**, agency only. One row per framework in the campaign's frameworks
   order (**Frameworks**), then "Not planned": Framework (code and name), Variants, Spend, Hook
   rate, Cost per sale and Won ("{w} of {a}", left out with no target). Above the table, a bar chart of
   cost per sale by framework (**The chart**, below). The framework named best on cost per sale
   carries "Lowest cost per sale".
6. **Hooks and CTAs**, agency only. One block per product, in the same order as **Products**,
   "No product" last when it has rows. Hooks and CTAs are compared within a block only, so each
   block has its own leaders:
   - **Hooks.** One row per hook in use on the block's concepts, then "Not planned" when it has
     rows: the hook ("H2 Demo first") with
     its concept chip, since hook numbers belong to a concept, then Variants, Spend, Hook rate,
     Hold rate and Cost per sale, sorted by hook rate, highest first. The hook named best on hook
     rate carries "Highest hook rate", and on cost per sale "Lowest cost per sale".
   - **CTA 1 against CTA 2.** Two Cards side by side from 640px, stacked on a phone: "C1" and
     "C2", each with the CTA types the product's concepts give it ("Direct, Offer"), Variants,
     Spend, Link CTR and Cost per sale. A third Card "Not planned" shows only when it has rows.
     The one named best on cost per sale carries "Lower cost per sale"; with no leader, a line
     under them says "No clear difference yet" and how much data each has.

The summary line (**Sections per tab**) names the best group on cost per sale among the kinds the
viewer sees, concept first, then persona, product, tier and creator, and for the agency framework
after them (hooks and CTAs lead only within a product, so they aren't in it): "Best concept: {name} at {x} per sale". With no leader, "Too early to
call a winner". The client's line is written into the page itself at publish. The agency's line,
when a framework leads, is worked out on the Editor's page only, and it is never
written to the page itself, client readable data, Home's **Tab summaries** for the client, or a
channel post.

##### The chart

One chart in the section, for the agency: **Cost per sale by framework**, a horizontal bar chart,
one bar per framework with enough data for cost per sale (**Enough to call a leader**), sorted
cheapest first, in `--chart-1`, its axis in the results
currency from zero. It has one series, so no legend, and the title names it. The target is a
dashed reference line labelled "Target {t}", in `--muted-foreground`, never a status color, drawn
only when a target is saved in the results currency. Each bar has its value at its end. A
framework without enough data draws no bar and is named under the chart, "Not enough data yet:
{codes}", with its figures in the table. Hover, focus or tap on a bar shows "{code} {name}: {x} per
sale · {v} variants · {s} spent". The table under it is the same data, so nothing reads by the
chart alone. Colors are read from the CSS variables at run time, and the chart draws at its
container's width (**Responsive**, **Media**). Every other part is a table or Cards: their job is
to read exact figures across a few groups, which a table does better.

#### Who watched

`performance-audience`. Hidden: not drawn, not in **Expand all**, not in the export and not
reached by a link, until `search_ads` can break results down by age and gender. Claude checks
`list_ad_search_fields` at each publish and draws the section only when it lists that breakdown
(**When it shows**, below); region is optional. Nothing stands in for it: no fixed or sample figures, and no audience guessed from
followers or organic posts. A link to `#performance/r{n}/audience` opens the tab at the top, as
for any section that isn't rendered.

What it shows once the tool has it, for both sides, since it is {brand}'s own ad account:

- **When it shows.** `list_ad_search_fields` lists an age and gender breakdown that can be read
  with `groupBy` ad or post. Region is a second breakdown, read on its own, since Meta doesn't
  combine region with age or gender. With age and gender but no region, the section shows without
  **Top regions**; with region alone it stays hidden.
- **Read.** For the matched posts of the results currency's variants only (`igMediaIds`, the same
  filters and dates as **Reading the results**, step 4, in batches of 100 the same way), one read
  per breakdown. Each row is mapped to its variant through its post, and so to the variant's
  product (**Groups**), then summed per product in the results currency, and kept in the page
  itself with the other results. "All products" includes "No product".
- **Per product.** A Select of the round's products, "All products" first. Under it:
  - **Age and gender.** A horizontal bar chart, one row per age band in Meta's order, a bar per
    gender in `--chart-1`, `--chart-2` and `--chart-3` in that order, with a legend and the
    largest bar labelled. Each bar is its share of the product's impressions. Hover shows the
    band, gender, share, impressions and, where Meta reports them, purchases.
  - **Top regions.** The 5 regions with the most impressions as a bar chart in `--chart-1`, then
    "Other regions" as one bar, each its share of impressions.
  - A "Show as table" Table under each chart with the same figures.
- **The top audience.** The summary line, "Top audience: {gender} {age band}", is the age and
  gender cell with the most impressions, over the product in view.
- **What Meta leaves out.** Meta can hide small cells, so a breakdown may not add up to the
  round's impressions. Shares are of the breakdown's own total, and when it differs from the
  impressions of the same variants (**Headline numbers** for "All products", the product's row in
  **Products** for one product) by more than 1%, a line says "Meta reports {x}% of impressions by age and
  gender. Small groups are left out." Money stays per currency, as everywhere on the tab.

#### Changes for round {t}

`performance-next`, the tab's last section, for both sides. It turns what **Compare** found into
the lines that change the next brief: which hooks to keep or replace, which CTA leads, the
framework mix, and where spend moves between concepts and between creators, each with the numbers
behind it. Editors edit, accept or drop each line, then **Apply to round {t} brief** writes the
accepted lines into that round's brief as a draft. The client reads the accepted lines they may
see. It is drawn for a round whose **Compare** is drawn; otherwise it isn't, as the rest of the tab.

##### Which round it changes

{t} is the first round after round {n}, the round in view, whose brief can still change: it isn't
done and its status is Draft or Changes requested (**Master Brief**, **Brief status**). When no
later round's brief can, {t} is the round after the newest round, not started yet. Rounds overlap
(**Rounds**), so round {n+1}'s brief is often signed off before round {n} has results; the lines then
go to round {n+2}, and a line under the section's title says why, for both sides: "Round {n+1}'s
brief was signed off {date}, before these results were in, so these changes go into round {t}'s
brief." {t} is worked out live from the page data, so a send, a sign off or a reopen moves it at
once. A line already applied keeps the round it went to.

##### The lines

Claude writes the proposed lines at every publish, interactive or scheduled, into
`agency/changes-r{n}` (**1e**), from that publish's `leaders:` and `overBand:` in
`agency/performance-r{n}`, the same figures **Compare** shows. Nothing else proposes a line: not
**Variants ranked**, one variant's figures, an insight card's wording, organic posts or a guess. A
kind with no leader and nothing over the band proposes nothing.

| Kind | Line | Proposed when | What Apply writes | Who sees it |
| ---- | ---- | ------------- | ----------------- | ----------- |
| Hook, keep | "Keep {pattern} as {concept}'s lead hook" | The hook is named best in its product's block on cost per sale or on hook rate (**Enough to call a leader**); one line when it leads on both | The round {t} concept's H1 type set to {pattern}, while H1 has no line yet. When two hooks of one concept lead, the cost per sale leader takes H1 and the hook rate leader H2, its line reading "Keep {pattern} as {concept}'s second hook" | Agency only |
| Hook, replace | "Replace {pattern} on {concept}" | The hook is over the Watch band (below) | No part: the change tells the brief run not to use {pattern} on {concept} | Agency only |
| Lead CTA | "Lead {product}'s concepts with C{w}'s ask" | C{w} is named best on cost per sale in the product's block ("Lower cost per sale") | In each round {t} concept on {product}, C1's type set to the type that concept's C{w} had in round {n}, and C2's to the other type, while neither has a line yet. A concept whose two CTAs shared one type gets no part | Agency only |
| Framework, keep | "Keep {code} on V{k}" | The framework is named best on cost per sale | No part: the variant plan already carries its frameworks (**Starting from the last round**) | Agency only |
| Framework, move | "Move V{k} from {code} to {leader}" | The framework is over the Watch band and another framework leads; one line per variant slot that used it in round {n}'s plans | `v{k}-framework` set to {leader} in every round {t} concept plan whose V{k} uses {code} | Agency only |
| Concept, more | "Put more of the next round's ads behind {concept}" | The concept is named best on cost per sale | No part: a note on the brief | Both |
| Concept, less | "Put less of the next round's ads behind {concept}" | The concept is over the Watch band | No part: a note on the brief | Both |
| Creator, more | "Rebook @{handle} and give them more of the spend" | The creator is named best on cost per sale | No part: a note on the brief | Agency only |
| Creator, less | "Move spend away from @{handle}" | The creator is over the Watch band | No part: a note on the brief | Agency only |

`{pattern}` is the hook's type (`ad-reuse.md`, **Hook patterns**), and a hook keeps its concept,
since hook numbers belong to a concept (**Compare**, **Groups**). **Keep a hook means keep its
pattern, never its words.** Every hook and CTA in the log is refused in every round (**Rounds**,
**The new round's brief**), so a kept hook is a new line in the same pattern, written by the next
brief run; Apply sets the type and leaves the line empty, so the concept counts as needing work
until the run writes it. The same holds for a CTA's ask. Apply never writes a creator's own
variant plan: overrides belong to one round and never carry (**Selected Creators**, **Concept and
variant plan**), so a framework line changes the concept's plan, which every returning creator
starts round {t} on.

**Over the Watch band.** A real group (never "Not planned", "No persona", "No product", "No
follower count" or "Broken") with `compareMinVariants` variants past the floor, whose cost per sale
is above the Watch band (`watchRatio` times the target) on at least `compareMinPurchases`
purchases, or which has fewer purchases than that and has spent more than `compareMinPurchases`
times the Watch band, so even that many sales would leave it over. Hooks and CTAs are compared
within their product's block, as their leaders are. It needs a target in the results currency
(**The target and the floor**): with none, nothing is over the band and no replace, move or less
line is proposed, while keep, lead and more lines still are. Claude writes these groups per kind
to `overBand:` at each publish with `leaders:`.

**Only what cleared the bar.** Every line rests on a group in `leaders:`, which passed **Enough to
call a leader**, or in `overBand:`, which passed **Over the Watch band** above. A group that passes
neither is never proposed, not even with a mark: it is left out. For the agency, one line at the
end of the section names the kinds with nothing yet, "Nothing proposed for {kinds} yet: too early
to call.", and with no line at all the section reads "Too early to propose changes. Each group
needs {n} ads past the spend floor and {p} purchases." Both rest on the proposals, which the client
can't read, so the client's side always reads as **What the client sees** says.

**The numbers behind each line.** Under each line, in `text-xs text-muted-foreground`, the figures
it rests on and its sample, from `leaders:` or `overBand:`: "{x} per sale against {y} for {next
group} · {a} ads past the floor, {p} purchases" for a leader on cost per sale, "{h}% hook rate
against {h2}% for {next group}" for one on hook rate, and "{x} per sale against a {target} target, over
the {b} Watch band" for a group over the band ("{s} spent, {p} purchases" when it has too few to
divide). A ghost Button, size sm, "See the numbers" opens **Compare** (`#performance/r{n}/breakdowns`).
Since the agency's framework, hook and CTA groups are read live (**Compare**, **Groups**), a line
about one whose figures now differ from the table's shows "The plan changed since the last update.
This line updates at the next one." and can't be applied until then.

Each line has a stable id, `{kind}-{action}-{group}`, a framework line's group being its slot and
code so two frameworks moved off one slot never share one (`hook-keep-{lane}-h2`, `cta-lead-{product
id}`, `framework-move-v3-pas`, `framework-keep-v1-pas`, `concept-more-{lane}`, `creator-less-{net}-{handle}`), so a publish that
proposes it again keeps its call and wording, with the newest figures. The order is the table's,
then concept order within a kind, so the section and the brief list lines the same way.

##### Edit, accept or drop

For the agency, each line is a row: a soft Badge with its kind, the line, its numbers, and at the
end an outline Button "Accept" (Lucide `check`) and a ghost Button "Drop" (Lucide `x`), each with
`aria-pressed`. The chosen one shows pressed with its Badge, success "Accepted" or soft "Dropped";
clicking it again clears the call, and a line with no call shows soft "Proposed". Dropped lines
fold to the end under "Dropped ({d})". The line's text is edited in place (**Editing in place**),
one line of up to 200 characters; its numbers can't be edited. A concept line's editor adds "{brand}
reads this line once it's accepted." under the Input. On a phone each row stacks its text, numbers
and Buttons (**Responsive**).

- **What a call writes.** A `call-{id}` stamp on `agency/changes-r{n}`, `{state, text}`, `state`
  accepted, dropped or `null`, `text` the Editor's wording or `null` for Claude's. Accepting a
  concept line also writes `line-{id}` on `changes/r{n}`, `{text, figures}`, the only copy the
  client reads; dropping or clearing it writes that stamp `null`, and editing an accepted one
  writes it again. Each call and edit logs one entry (kind `brief`, tab `performance`): a concept
  line's in the Editor's client readable log ("Planned for the next brief: {text}") once accepted, every
  other one in the agency log.
- **Results move.** A line accepted and not applied whose group a later publish no longer proposes
  stays, with its figures as last proposed and a warning Badge "Results changed"; Accept is
  disabled with "The round's numbers no longer support this line.", and Drop clears it. That
  publish writes its `line-{id}` on `changes/r{n}` `null`, `source` `claude`, so the client never
  reads a line the results stopped supporting. A line still proposed shows the newest figures, and
  Claude writes them into its client copy, keeping the Editor's `text` as it is. Those two are the
  only cases where Claude replaces an Editor's stamp unasked (**1e**, **Claude's writes**); when the Editor's wording quotes older ones, its Tooltip says
  "The figures changed since this line was edited."

##### Apply to round {t} brief

A default Button "Apply to round {t} brief" (Lucide `file-check`), for the agency only, at the end
of the section's header row, while at least one accepted line isn't applied. It is disabled, with
the reason in a line under it as well as its Tooltip, when:

- **Round {t} isn't started.** "Round {t} isn't started yet. Start it, then apply.", with a link
  Button "Start round {t}" that opens the **Round switcher**'s Dialog when it is offered; else
  "Round {t} can be started once round {t-1}'s brief is signed off."
- **Nothing can land.** Every accepted line is "Results changed" or waits on the next update.
- **Nothing to start from.** Round {t} has no brief yet and no earlier round has a signed off one:
  "Round {t} has no brief yet, and there's no signed off brief to start it from. Write or import
  it on Master Brief, then apply."

It opens a Dialog: title "Apply {k} changes to round {t}'s brief?"; per concept, the parts that
change ("Concept 2: H1 type Demo first · V3 framework BAB") and the notes it adds; the lines that
land as a note only, each with why ("{concept} isn't in round {t}'s brief", "{concept} wasn't in round {n}", "H1 is already written
in round {t}"); when round {t} has no brief yet, "Round {t}'s brief starts from round {m}'s signed
off brief first, as Start from round {m} does."; the line "The brief as it is now is saved first,
so you can bring it back from Versions. It stays a draft: nothing goes to {brand} until it's sent
for sign off."; and Cancel (outline) and Apply (default). On Apply, in this order:

1. **Check again.** From the page data as it is at that moment: round {t} exists, isn't done, and
   its status is Draft or Changes requested, and each line is still accepted and not applied. A
   brief that is with the client or signed off is refused, never taken back to Draft as an import
   takes it, because the client is reading or has signed that text: "Round {t}'s brief was just
   sent for sign off, so it can't be changed." (or "was just signed off"), then "These changes now
   go to round {t'}'s brief.", {t'} worked out again as above. To change a signed off brief, the
   agency reopens it first, where the round allows it (**Comments and sign off**, **Reopening**). A
   refusal writes nothing.
2. **Start the brief when it is empty.** A round {t} with no brief documents gets **Starting from
   the last round**'s writes first, from round {m}, the newest earlier round whose step 4 is cleared.
3. **Save first.** The version the brief is at now, `kind` before apply, for every document the
   apply touches (**1e**, **Brief versions and Reset to original**). If one is refused, nothing is
   applied.
4. **Write the parts.** Each part in the table above, one stamp with `source` `manual` and the
   Editor as `by`, only when it differs from the current value. A hook or CTA that already has a
   line keeps it; the line lands as a note. A line about a concept that round {t}'s brief doesn't
   have, or has removed or deferred, lands as a note too, and so does a lead CTA line for a
   concept that wasn't in round {n}, which has no C{w} to read a type from.
5. **Write the changes.** One `change-r{n}-{id}` stamp per applied line, `{id}` the line's id,
   so lines from two results rounds that land on one brief never share a key,
   `{kind, text, figures, sample, from, lane, parts}`, `from` round {n} and `parts` the parts it
   wrote: the concept lines on `brief-rounds/r{t}`, every other line on `agency/brief-round-r{t}`.
   Then `applied-{id}:` `{round, at, by}` on `agency/changes-r{n}` per line, and for a concept line
   `applied-{id}:` `{round, at}`, with no Editor id, on `changes/r{n}`.
6. **Log it.** One agency entry, "Applied {k} changes from round {n}'s results to the round {t}
   brief". When concept lines were applied, one in the Editor's client readable log, "Added {c}
   changes from round {n}'s results to the round {t} brief", opening `#brief/r{t}/overview/changes`,
   and for each concept whose client readable parts changed, "Updated the {concept} brief", which
   says nothing about results.
7. **Open the brief.** Master Brief on round {t} at the first change in the lines' order: the
   part it wrote (`#brief/r{t}/{lane}/{part}`, `variant-{n}` for a framework), else
   `#brief/r{t}/overview/changes`.

The status stays Draft, or Changes requested until it is sent again. A line counts as applied only
while its `change-r{n}-{id}` is in round {t}'s brief, whatever its `applied-{id}:` marks say, so restoring the "Before applying changes" version
from **Versions** takes the line back to accepted, not applied. Applying again applies only the lines
not applied yet.

**Done when** applying the changes leaves round {t}'s brief in Draft and its **Changes from round
{n}** (**Master Brief**, **Brief status**) lists exactly the lines that were accepted and applied:
none dropped, none proposed and not accepted, and none twice.

##### What the client sees

The accepted concept lines, read only, for the client and **Preview as client** from
`changes/r{n}`, and for a read only client, who reads no page data, from the copy Claude writes
into the page itself at each publish, with "As of {time}" over it: each line, its figures, and once applied "Applied to round {t}'s brief
{date}", linking to `#brief/r{t}/overview/changes`. Nothing proposed, dropped, or edited before it
was accepted, no "Results changed", and no hook, CTA, framework or creator line, nor a count of
them. With no concept line accepted: "Nothing here yet. Aspire adds what changes in the next brief
once the round's results support it."

- **Hook, CTA and framework lines are agency only, numbers and all.** They rest on which variant
  used which, which is Aspire's cut plan (**Compare**, **What the client sees, and what stays agency
  only**), so they live only in `agency`, and the brief parts they set carry no word of where they
  came from.
- **Creator lines are agency only.** Moving spend toward or away from a creator is a rebooking and
  fee call, which sits with the offers and rates (**Who sees what**).
- **Concept lines show to both sides.** They rest on the concept results the client already reads
  in **Compare**, and name no amount of budget or fee. An Editor's wording on one is what the client
  reads, so it never names a hook, CTA, framework, creator or fee. The page refuses to save or
  accept a concept line whose text holds a hook pattern, a CTA type, one of the campaign's
  framework codes or names, a creator's handle, or an amount of money, with "{brand} reads this
  line. Leave out {what it found}.", and **Checking the roles** step 3 searches for them too.

#### Responsive and roles

Every section follows **Responsive** and **Design standards**. The tab's figures are the same for
the client, a read only client and **Preview as client**, since they are in the page itself; only
the Hook and CTA columns, **Compare**'s framework, hook and CTA parts and the agency's insight
cards, **Ads not matched**, **Changes for round {t}**'s agency lines and controls, and the agency's
lines differ. The page never writes page data on this tab for the client. An Editor writes a live
post, and a change line's call or wording and its apply.

### Inbox

What changed for the person viewing, on every tab and in every round, each item opening the exact
thing it is about. It is built from the activity log and from tags (**1e**, **Tags and the
inbox**); it keeps no copy of its own, only each person's read and cleared marks.

- **One inbox per tab.** The **Inbox** Button in the header (**Header and tabs**) is a ghost
  Button with the Lucide `inbox` icon and the label "Inbox". On Home it opens the inbox for every
  tab; on any other tab it opens that tab's inbox, holding only the items whose tab it is, from
  every round. Its count is a processing Badge with the unread items in that inbox ("99+" past
  99), hidden at none, and the Button's label for screen readers reads "Inbox, {n} unread". The
  count moves as items arrive and as the person reads them, on every device.
- **What each item is.** One row per item, of five types:

  | Type | What makes one | Badge |
  | ---- | -------------- | ----- |
  | Tag | Someone tagged the person, or their side (**Tagging**) | processing: "Tagged you", "Tagged Client" or "Tagged Aspire" |
  | Note | A note, or a new comment on a brief or a cut | outline: "Note" |
  | Reply | A reply to a comment | outline: "Reply" |
  | New | Something added: a creator, a cut or a new version of one, a file, a round started | outline: "New" |
  | Status | Anything else that changed: a decision, an approval, a status, shipping, the brief, program details, a checklist tick | outline: "Status" |

  Every entry in the activity log the person can read becomes an item, except their own writes,
  so the inbox has everything History has, newer than two weeks. Tags show for 90 days.
- **The layout.** A Sheet (**Responsive**, **Side panels**). Title "Inbox" on Home, "{Tab} inbox"
  on a tab; description "Every update across tabs and rounds, newest first." on Home, "Updates
  on {Tab}, every round, newest first." on a tab. In the header, one row of Buttons: ghost
  "History" (**History**), outline size sm "Mark all read", ghost size sm "Clear all". Under it a
  Tabs list: All, Unread, Tags, kept in memory only and opening on All. Rows are grouped by day
  the way **History** groups them.
- **Each row.** The List row from **Component classes**, on a `button`, with `break-words`: an
  Avatar with the writer's initials, then the writer's name and the item's text, then a line in
  `text-xs text-muted-foreground` with the time, the type Badge, the round ("Round 2", or "Whole
  campaign"), the creator's handle when there is one, and on Home the tab's label as an outline
  Badge. An unread row's name and text are `font-medium` and it starts with a `size-2 rounded-full
  bg-primary` dot labelled "Unread" for screen readers, so unread never reads by color alone. Who
  wrote it comes from where the item is kept, as in **History**; Claude reads "Claude". Beside
  the row, never inside its button, sits a ghost icon Button with the Lucide `x` icon, labelled
  "Clear".
- **Open.** Clicking or pressing Enter on a row marks it read, closes the Sheet and opens the
  item's hash (**Header and tabs**): the tab, the item's round in the **Round switcher**, and the
  item itself at its deepest part, scrolled into view. **Opening each type** below says where
  each one lands. An item in a done round opens it read only. An item no longer on the page opens
  its tab at the top, with the line "This was removed since." for five seconds.
- **Clear one.** The row's Clear Button takes it out of this person's inbox on every device and
  every tab inbox. It stays in History.
- **Mark all read.** Marks every item in the open inbox read: every tab on Home, only this tab's
  items on a tab. Unread rows lose their dot, and the counts drop everywhere they are shown.
- **Clear all.** Opens a Dialog: title "Clear {n} items?", description "They leave your inbox on
  every device. History keeps them.", and Cancel (outline) and Clear (default). It clears what the
  open inbox holds, every tab on Home or this tab only.
- **Marks are per person, and everywhere.** Read and cleared are kept in each person's own page
  data (**1e**, **Tags and the inbox**), so clearing an item on a phone clears it on a laptop.
  Nobody else, Claude included, can read them. Preview as client never writes them.
- **Live.** A new item shows at the top as it is written, by anyone, and the counts move, without
  a reload (**1e**, **Tags and the inbox**, **Reading it**). When the person has scrolled down, a
  secondary Button, size sm, "{n} new" shows at the top and scrolls up to them.
- **Empty.** "Nothing new." on Home, "Nothing new on {Tab}." on a tab. With the Unread or Tags
  filter: "No unread items." or "No tags for you."
- **Who has one.** The client and the agency. A read only client reads no page data, so the
  Button opens one line, "Your inbox isn't available from this account.", with the same second
  line **History** gives them, and shows no count.

#### Opening each type

Every item carries the hash of what it is about (**1e**, **The activity log**, `anchor`), at the
deepest part **Header and tabs** names. Where each lands, per tab:

| Tab | Tag, note, reply | New | Status |
| --- | ---------------- | --- | ------ |
| Home | None: Home has no notes or comments | `#home/files` for a file, `#home/calendar` for a round started, `#home/products` for a product, `#home/team` for a person, `#home/steps/r{n}/{step}` for a step | `#home/steps/r{n}/{step}` for a step ticked or edited, `#home/program` for terms, `#home/products` for products, `#home/team`, `#home/calendar` for a round's dates |
| Master Brief | The comment, `#brief/r{n}/{lane}/c{comment}`; a sign off note or a change request `#brief/r{n}/overview/status`; a changed brief note `#brief/r{n}/changes-{net}-{handle}` | The concept's brief, `#brief/r{n}/{lane}` | The part that changed, `#brief/r{n}/{lane}/{part}`; a send for sign off, a sign off, a change request or a reopen `#brief/r{n}/overview/status`; the call on a changed brief `#brief/r{n}/changes-{net}-{handle}` |
| Creator Selection | The creator viewer at the note, `#selection/r{n}/{net}-{handle}/notes/{note}` | The creator's card, `#selection/r{n}/{net}-{handle}` | The same card, at the decision, status or ad permissions |
| Selected Creators | A fee note `#creators/r{n}/fees`; a status update the card at **Updates to {brand}**, `#creators/r{n}/{net}-{handle}/update`; another creator note the creator's card, `#creators/r{n}/{net}-{handle}` | The creator's card | Fee approval `#creators/r{n}/fees`; shipping, tracking and product status `#creators/r{n}/{net}-{handle}/shipping`; the rest the creator's card |
| Content Review | The comment on the cut at its version, `#review/r{n}/{cut}/v{version}/c{comment}`, at its timecode | The cut at the new version, `#review/r{n}/{cut}/v{version}` | The cut at the version the call or tick was on, `#review/r{n}/{cut}/v{version}` |
| Ad Performance | The section, `#performance/r{n}/{section}` | The section | The section |

A tag opens what it was written in: the comment or the note. An Ad Performance section that
isn't rendered (**Who watched** while hidden) opens the tab at the top
(**Header and tabs**).

### Tagging

Anyone who writes a note or a comment can tag the other side, their own side, or one person, and
the tag lands only in the inbox of who it names.

- **Where.** Every note and comment box on every tab: the client's notes on a fee
  approval, a brief sign off or change request, or a changed brief; the agency's reason for reopening a brief; both threads of notes in the creator viewer, Notes and the agency only Aspire notes; comments and
  replies on a brief or a cut, agency only comments included; **Update {brand}** on a Selected
  Creators card, a note for {brand} that opens tagged to Client (**Selected Creators**, **Status
  updates**); and **Nudge {brand}** on a cut waiting on the client, whose Dialog is a tag with no
  note around it (**Content Review**, **The status flow**).
- **Picking.** Typing "@" in the box, or the box's ghost icon Button with the Lucide `at-sign`
  icon labelled "Tag someone", opens a list under the box built from the Select content and item
  classes (**Component classes**). In order: "Client", described "Everyone approving for
  {brand}"; "Aspire", described "Everyone at Aspire on this campaign"; then people under two
  headings, "{brand}" and "Aspire", each with an Avatar and their current name. Typing after the
  "@" narrows the list by name. Arrow keys move, Enter or a tap picks, Escape closes. The pick
  goes into the text as "@Client", "@Aspire" or "@{name}".
- **Which people are listed.** Only people the page knows the side of: everyone who has written
  on the page, from the activity log's writers (**1e**, **Tags and the inbox**). Someone who has
  never written on the page isn't listed yet; tag their side instead. The page never guesses a
  side from a name.
- **Agency only boxes.** An agency only comment and the agency only Aspire notes on a creator list only "Aspire" and the
  people at Aspire, with the line "Agency only. Only Aspire can be tagged here." A tag can't carry
  agency only text to the client. Aspire's notes for {brand} in a creator's Notes thread are not
  agency only: they list both sides, like a comment on the brief.
- **Who gets it.** "@Client" reaches every client approver but the writer; "@Aspire" everyone at
  Aspire but the writer; "@{name}" that person only. Under the box while it has tags: "{names}
  will see this in their inbox." in `text-xs text-muted-foreground`.
- **Saving.** The tag saves with the note or comment, after it is confirmed. A refused save keeps
  the tag in the text and shows "Not saved" the way **Editing in place** does. Editing the note
  or comment and taking a tag out withdraws it from that person's inbox. A tag never moves a step,
  sends anything, or reaches Atlas.
- **Read only.** The client's view of a field they can't write, a done round and **Preview as
  client** show the tags in the text, with no picker.
- **Nothing is sent from the page.** The page never posts to Slack or sends email. The next time
  the CM runs the campaign in the chat, it lists the new tags and offers to post the ones for the
  client to the campaign's saved destinations, after a confirm (**Delivering tags**).

### History

Who did what and when, on every tab and in every round. It reads the activity log (**1e**, **The
activity log**), so it shows every write on every tab, checklist ticks and notes included.

- **Opening it.** From the inbox: a ghost Button "History" with the Lucide `history` icon in the
  inbox's Sheet header, for the client and the agency. This section sets only that Button in the
  inbox; the inbox's items are not part of it. `#history` opens it too, over the tab the person had
  open. It opens as a Sheet (**Responsive**, **Side panels**). Closing it goes back to the inbox,
  where the person was in it.
- **What each person sees.** Only entries about things they can see, because only those are in
  the data they can read. The client: every entry in the client readable logs, theirs, the other
  approvers', the agency's and Claude's. The agency: those, plus the agency's own log, each of its
  entries marked with a soft Badge "Agency only". **Preview as client** shows only the client
  readable logs, with no Agency only entries. A read only client reads no page data, so History
  shows one line: "History isn't available from this account." For a person in the organization
  shared below Contributor it adds "Ask {CM name} to share the page with you as Contributor."; for
  someone outside it, whose access the share menu can't raise (**Who sees what**), it adds "Ask
  {CM name} what changed."
- **The layout.** The Sheet's title is "History", its description "Who did what and when, newest
  first." Under it, one row of controls: a search Input ("Search history"), a Select for the tab
  (All tabs, then the six tabs in order), a Select for the round (All rounds, each round's label,
  then "Whole campaign" for entries about no one round), and an outline Button, size sm, "Copy as
  table". On phone the search takes the full width, the two Selects sit side by side under it, and
  the Button under them. A count line in `text-xs text-muted-foreground` follows: "{n} entries",
  with a ghost Button "Clear filters" while any filter or search is set.
- **Grouped by day.** Newest first, one group per day on the viewer's clock and time zone, headed
  "Today", "Yesterday", then the weekday and date ("Tue, Nov 4"), in `text-xs font-medium
  text-muted-foreground`, pinned at the top of the list while its rows scroll (`sticky top-0
  bg-background`). Each row: an Avatar with the writer's initials, the writer's name, and the
  entry's text; under it, in `text-xs text-muted-foreground`, the time, the tab's label as an
  outline Badge, the round ("Round 2", or "Whole campaign"), and for the agency the "Agency only"
  Badge. A row with an old and new value shows "Show change", which opens "Was: {from}" and "Now:
  {to}" under it. Who wrote it, the "Agency only" Badge and the Side column in **Copy as table**
  come from where the entry is kept, never from its own fields: an entry under `activity/{id}`
  names `{id}` and is the client's side; one under `activity-editors/{id}` names `{id}` and is
  the agency's side; one under `agency/activity-{id}` names `{id}` and is Agency only. `claude`
  reads "Claude". The name comes from the
  id, never the stored copy, per **Every editable value**, with `byName` as the fallback. A row is
  the List row from **Component classes**, with `break-words` on the text.
- **Filters and search work together.** The tab, the round and the search narrow the same list at
  once, and the count line counts what is left. Search matches the entry's text, the creator's
  handle, the writer's current name, the tab's label and the kind in plain words (decision, note,
  comment, checklist), ignoring case and accents. A Select's choice and the search are kept in
  memory while the page is open, never in page data or browser storage, and History opens on All
  tabs and All rounds. Nothing matches: "No history matches." with "Clear filters". An empty log:
  "Nothing has happened on this page yet."
- **Live.** A new entry the viewer may see shows at the top of its day as it is written, by anyone,
  without a reload (**1e**, **The activity log**, **Reading it**). An entry the filters hide only
  changes nothing on screen. When the person has scrolled down, new rows don't move the list: a
  secondary Button, size sm, "{n} new" shows at the top and scrolls up to them.
- **Earlier days.** History opens with the last 14 days. A ghost Button "Show earlier" at the end
  loads 14 more. While a search or filter is set the count line adds "Searching back to {date}", so
  nobody reads an empty result as "never happened".
- **Opening the item.** Clicking or pressing Enter on a row closes the Sheet and opens the row's
  hash: the tab, the round, and the item, scrolled into view (**Header and tabs**). An item no
  longer on the tab opens the tab at the top. A row in a done round opens that round read only.
- **Copy as table.** Copies the rows shown now, with the filters and search applied, over the days
  loaded, as a table: Date, Time, Who, Side (Client or Agency), Tab, Round, What, with a first line
  "Times in {time zone}". It puts both an HTML table and tab separated text on the clipboard, so
  it pastes as a table into a sheet, a doc or an email. Agency only rows are copied only by the
  agency, with "Agency only" in the Side column, and never in **Preview as client**. The Button
  reads "Copied {n} rows" for two seconds. Where the browser refuses the clipboard, a Dialog
  "Copy history" opens with a read only Textarea holding the tab separated text, already selected,
  the line "Press Ctrl+C or Cmd+C to copy.", and Close (outline). The table holds what the rows say,
  never an id, a field name or a tool name.

### Export

Every tab can save what is on screen as a spreadsheet. An export is a read: it writes no page data,
logs nothing and never reaches Atlas.

- **The control.** An outline Button, size sm, "Export" with the Lucide `download` icon, at the
  start of the row that holds **Expand all** and **Collapse all** above the tab's first section
  (**Collapsing sections**). That row never collapses, so Export is always one click from the tab.
  It opens a Dialog.
- **The Dialog.** Title "Export {tab}". Description: "What's on screen now: round {n}, with your
  filters and search." (with **All rounds** on Creator Selection, "every round"). Then two Selects:
  - **Sheet**: "All sheets" first, then each sheet in **Sheets per tab**, in order. A sheet whose
    section shows its empty state is listed disabled with that line ("Shown once fees are
    approved."). A sheet with nothing for this viewer at all, like the agency only Variants sheet
    for the client, isn't listed.
  - **Format**: "Excel (.xlsx)" first, "CSV (.csv)", "Copy as table". CSV and Copy as table hold
    one sheet, so picking either with "All sheets" moves Sheet to the first enabled one.

  Then a count line in `text-xs text-muted-foreground`: "{r} rows, {c} columns" for one sheet, or
  "{s} sheets, {r} rows" for "All sheets". A disabled sheet is left out of the workbook. For the agency it
  adds "Includes agency only columns." with a soft Badge "Agency only". Cancel (outline) and the
  default Button "Download", or "Copy" for Copy as table. On a tab whose every sheet is empty, the
  Export Button has `aria-disabled="true"` and the disabled look but stays focusable: a click, tap
  or Enter does nothing but show its tooltip, the tab's empty state. A `disabled` Button would
  never open that tooltip.
- **What goes in.** Exactly the rows the tab shows now. Home is the one exception: its sheets
  (**Sheets per tab**) come from the Everything view's sections, so Home exports them whichever
  view is on screen. That means the round in the **Round
  switcher**, the tab's filters and search, and its sort. The columns are the sheet's own, from
  **Sheets per tab**, whichever layout is on screen. A closed section
  still exports, because collapsing changes the view and not the data. Home's **Needs attention**
  covers every round, as it does on screen, with a Round column. Values are the newest ones on
  screen (**Every editable value**), and every label is the page's own word from **Page
  vocabulary**. A sheet never holds an id, a slug, a field name, a tool name, a hash link or a
  stamp's source.
- **Roles hold by construction.** A sheet is built from the same data the viewer's view is built
  from, in their browser. For the client, a read only client and **Preview as client**, that is
  the page itself and the client readable page data. The export never reads `agency`, so no agency
  only column can be in it, whatever the code asks for. For the agency, the agency only columns
  marked in **Sheets per tab** come from the `agency` reads the view already made. When those
  reads didn't return, the columns are left out and the count line says "Agency only columns
  didn't load." A read only client exports the page as published, with no page data, and the
  About sheet says so.
- **Preview as client exports the client's sheets.** The agency's browser already holds the
  `agency` reads, so in the preview the export takes its rows from the same client readable data
  the preview renders from (**Preview as client**), never from the agency's view with columns
  dropped. This rests on the page's code, not on the data rules, so a real Contributor's export is
  checked by opening the page (**What the export can't do yet**).
- **The file name.** "{Brand} CAS Round {n} {sheet}", with "All rounds" in place of "Round {n}"
  on Creator Selection's **All rounds**, and the tab's title in place of {sheet} for "All sheets"
  ("{Brand} CAS Round 2 Selected Creators.xlsx"). The page drops `\ / : * ? " < > |` and runs of
  spaces from it. The viewer confirms the final name in the download prompt. Home's Needs attention
  covers every round, so on its own it is named "{Brand} CAS All rounds Needs attention", and the
  Calendar sheet likewise "{Brand} CAS All rounds Calendar". In a
  workbook of all Home's sheets the name keeps the round, and the About sheet notes that Needs
  attention and Calendar cover every round.
- **Excel.** One worksheet per sheet, named as in **Sheets per tab** (all are 31 characters or
  fewer, as Excel needs), plus a last sheet, "About this export". On every data sheet:
  - Row 1 is the header, in bold, frozen, with a filter over the header and every row.
  - Money in US dollars, as the campaign records keep it, as numbers formatted `"$"#,##0.00`, and
    the header names the currency: "Agreed fee (USD)". Ad Performance's sheets are the exception:
    their money is in the ad account's currency, so it is formatted `#,##0.00` with no symbol, each
    row names its currency in the Currency column, and a money header names the currency only when
    every row on the sheet shares it ("Spend (GBP)").
  - Rates as fractions formatted `0.0%`, counts as `#,##0`, and dates as real dates formatted
    `yyyy-mm-dd`. A date with no time is written as midnight UTC of the date the page shows, so it
    never lands a day off. So every column sorts and filters as its type.
  - Times as `yyyy-mm-dd hh:mm` on the viewer's clock, the time the page shows. A spreadsheet
    date has no time zone, so the page shifts each UTC time by the viewer's offset on that date,
    which keeps times on both sides of a daylight saving change right. The header names the
    viewer's time zone, not one offset: "Updated on (Pacific time)".
  - Text that a person typed is always written as text. A note starting with "=" or "+" stays a
    note and never runs as a formula.
  - Columns are sized to their content up to 60 characters wide, and longer text wraps. A cell
    past Excel's 32,767 characters is cut short enough that, with " (continues on the page)"
    added, it stays within that limit.
  - No fill or font color. The **Design standards** keep every color in the page's style blocks.

  "About this export" holds one row per fact: campaign, tab, round, filters and search in plain
  words ("Concept: Busy parent; search: ana"), exported by (the viewer's name), exported at with
  the time zone, and "As the client sees it" or "Includes agency only columns". The page loads
  ExcelJS 4.4.0 from `https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js` (about
  950 KB) on the first Excel export, never at page load. If it doesn't load, the Format Select
  marks Excel "Not available right now" and moves to CSV.
- **CSV.** One sheet as UTF-8 with a byte order mark (so Excel reads accents), comma separated,
  quoted per RFC 4180, CRLF line ends. The header row is the same as the Excel one. Money and
  counts are plain numbers, rates are written "28.4%", dates are `yyyy-mm-dd`, and times are
  `yyyy-mm-dd hh:mm` on the viewer's clock with the zone in the header, as in Excel. So Excel and
  Google Sheets read each one as its type. A Timecode may still read as a time of day there, so
  sort on Seconds. Text a person typed (a note, a comment, a reason, a name, a label) that starts
  with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading `'`, so no spreadsheet runs it
  as a formula. Values the page builds itself get no `'`: the Creator column holds the handle
  without its "@", and dates, numbers and labels never start with those characters. A CSV carries
  no About rows, so it imports cleanly.
- **Copy as table.** Works like **History**'s. It puts an HTML table and tab separated text of the
  one sheet on the clipboard, so it pastes as a table into a sheet, a doc or an email. Only the
  tab separated text gets the CSV's `'` guard, because that is what a spreadsheet reads. The HTML
  table keeps the text as typed, so a doc or an email shows no stray `'`. In the tab separated
  text, a cell holding a tab, a line break or a `"` is wrapped in `"` with each `"` doubled, the
  way Excel and Google Sheets copy, so a multi line cell pastes as one cell. The Button reads "Copied {n} rows" for two seconds. If the browser
  refuses the clipboard, a Dialog "Copy {sheet}" opens with a read only Textarea holding the tab
  separated text, already selected. It shows the line "Press Ctrl+C or Cmd+C to copy." and Close
  (outline).
- **Saving.** Excel and CSV go through the page's `downloads` capability (**1e**). The viewer sees
  a prompt with the name and size and may decline. When `downloads` isn't available in this view,
  the Format Select offers Copy as table only. Each refusal from the save gets one plain line in
  the Dialog, by its code:
  - `declined`: the Dialog closes and nothing else happens.
  - `rate_limited`: "Another download is waiting. Try again in a moment."
  - `rejected_extension` or `extension_not_enabled`: "Excel and CSV files can't be saved here.
    Copy as table instead." The platform turns both formats off together, so the line never
    offers the other one.
  - `too_large`: "This file is too big to save here. Pick one sheet or narrow the filters."
  - Any other code: "Downloads aren't available here. Copy as table instead."

  The page never retries a save on its own.
- **It works everywhere.** Export changes nothing, so it works in a done round, for a read only
  client and in **Preview as client**, where every other control is a label. The Dialog's choices
  are kept in memory only, never in page data or browser storage. It opens on the first format it
  offers, Excel when it can, with "All sheets" for Excel and the first enabled sheet for CSV or Copy as
  table.

#### Sheets per tab

Columns marked "(agency only)" are in the agency's export only. Everything else is in both, the
client's included, and holds what the client may see per **Who sees what** at that moment. So
fees are in the client's export only once they are sent. A column with nothing in it for a row is
left blank, never filled with a dash.

| Tab | Sheet | One row per | Columns |
| --- | ----- | ----------- | ------- |
| Home | Needs attention | Open item in **Needs attention**, every round | Item, Detail, Tab, Round, Waiting on you (Yes or No), Waits on (agency only), Since |
| Home | Steps | Step in **Round steps** for the round in view, in order | Step, Client approval (Yes or No), Owner, State (Done, Now, Up next, Planned, Launch at risk), Due, Done on, Days late |
| Home | Calendar | Day and round in **Calendar**'s span, every round, for each day with a phase change, milestone, step, delivery, approval or shipping event, plus today | Date, Round, Phase (Planned, Build, Build (launch at risk), In market, Done), Events, Delivered that day, New versions, In by then, Needed by then, Approved by then, Pace. The counts and Pace follow the day details for that round, and are left blank where the calendar hides them |
| Home | Program terms | Row in **Program terms** shown to the viewer | Group, Term, Value |
| Home | Products | Product in **Products in scope** | Product, Status, Description, Creators, Approved |
| Home | Team | Person in **Team** | Name, Role, Title, Work email, Owns, Go to them for |
| Home | Files | File in **Files** that the round filter shows | File, Category, Version, Round (or "Whole campaign"), Type, Link, Added by (or "Found by Claude"), Date, Date from, and for the agency Scan |
| Home | Still needed | Required category with no file for the round | Category, Round |
| Master Brief | Concepts | Concept in the round, removed ones left out | Concept, Product, SKU, Positioning line, Personas, Trigger, Framework, Story, Selling points, Problem, Agitate, Solve, Beats, Hooks, CTAs, Body, Length, Runtime, B-roll, Coverage, Creators, Written (Yes or No), State, Signed off by, Signed off on (both from the round's sign off, the same on every row). Personas, Selling points, Beats, Hooks, CTAs and B-roll hold one item per line in their cell ("H1 Question: {line}", "C1 Direct: {line}, sends to {destination}", "B04 {shot} ({beat})"), and long text is plain text |
| Master Brief | Voice | Line of **Tone of voice and don'ts** | Part (Tone of voice, Do, Don't, Disclosure, File naming), Text |
| Master Brief | Variants (agency only) | Variant in each concept's variant plan | Concept, Variant, Framework, Length, Hook ("H2 Demo first"), CTA, VO, B-roll ("B02, B05"), Note |
| Creator Selection | Decisions | Creator with a call in the rounds in view | Creator, Network, Name, Concept, Product, Round, Your decision, What made the call, Your notes, Aspire notes for {brand}, Decided by, Decided on, Campaign match when decided, Why pass or why yes (the surprise reason in the client's words, blank when none), Status, Recommendation (agency only), Against the recommendation (agency only: Yes when the decision goes against the recommendation, as **A reason on the call** defines it, worked out on the page from both), Surprise (agency only: Yes for a pass on 75 or more or a pick under 60, as **Match score tuning** defines it), Expected cost (agency only), Aspire notes (agency only) |
| Creator Selection | Match agreement (agency only) | Band in **Match score tuning**'s **Agreement**, then a row for our top 10 and one for the agreement score | Measure (the band, "Our top 10" or "Agreement score"), Picked, Decided, Share, Verdict (on the agreement score row), Rounds |
| Creator Selection | Weights (agency only) | Factor in **Retune** | Factor, Weight in use, Default or tuned on, Suggested, Change, Decisions it learned from |
| Creator Selection | Creators | Creator the pool shows now, in its sort | Creator, Network, Name, Descriptor, City, Tier, Concept, Persona, Product, Rounds, Campaign match, Match band, Competitor (the conflict or past deals), Watch, Hook rate, Engagement on Reels, Reach, Engaged accounts, Latest post, Paid work before, Ad permissions, Instagram followers, Instagram engagement rate, Instagram average engagement, Instagram audience, the same four for TikTok, Why we picked them, Status, Your decision, Your notes, Aspire notes for {brand}, Expected cost (agency only), Cost per 1K reach (agency only), Aspire notes (agency only), Reply window (agency only), Email (agency only), Phone (agency only), Manager (agency only) |
| Selected Creators | Creator snapshot | Card the tab shows now, in its sort | Creator, Network, Name, Concept, Product, Returning, Step (a number, 0 to 8), Step name, Next or waiting on, Details to add (the count as the viewer counts them, so name and address only for the client), Missing (the details named, one per line, the same ones), Contract, Signed on (blank for the client until the fees are sent), Payment (the same), Payment date (the same), What they make, Usage, Exclusivity, If we drop them, Agreed fee and Fees approved on (each blank for the client until the fees are sent), Ship to (city and region, or pickup), Address confirmed, Footage files in, Footage files planned, one Footage column per deliverable ("Hooks in"), Shoot by, Status, Ad permissions, Brief state, Content state, Variants in, Variants approved, Variants planned, Content folder, Last update to {brand} (when the newest status update was posted), Waiting on (agency only), Last contact (agency only), Email (agency only), Phone (agency only), Manager (agency only), Paid so far (agency only) |
| Selected Creators | Shipping list | Row in **Shipping** | Creator, Name, Item, Details from creator, Ship to (home or pickup), City, Region, Country, Visit date, Address confirmed, Carrier, Tracking, Shipped on, Delivered on, ETA, Product status, Source (the product status's tag), Updated by, Updated on, Address line 1 (agency only), Address line 2 (agency only), ZIP or postal code (agency only), Phone (agency only), Delivery note (agency only), Next step (agency only) |
| Selected Creators | Rates and payments (agency only) | Row in **Contract and rates** | Creator, Concept, What they make, Usage, Exclusivity, Agreed fee (blank until agreed; Where it is says "In negotiation"), If we drop them, Where it is, Fees approved on, Payment status, Payment date, Contract, Signed on, UGC video rate, Reel collab rate, 90 day usage rate, Contracted total, Paid so far, Offer open, target and max (three columns), Counter, Expected cost, Cost per 1K reach |
| Selected Creators | Variant tracker | Variant slot of each creator in view, V1 to V{v}, in the cards' order, then any cut "Past the plan" | Creator, Concept, Variant, Hook (agency only, "H2 Demo first"), CTA (agency only, "C1 Direct"), Framework (agency only, code and name), Version (the cut tile's version: the newest for the agency, the newest sent for the client; blank when not cut yet), Stage, Status (the tile's Badge, "Not cut yet" for an empty slot), Open comments (the tile's count), Due, Due for (the step the date is from), Updated on |
| Selected Creators | Variant plans (agency only) | Variant of each creator in the round, V1 to V{v} | Creator, Concept, Persona, Variant, Framework, Length, Hook ("H2 Demo first"), Hook line, CTA, CTA line, From (Brief, Override or Broken), Overridden fields, Changed by, Changed on |
| Content Review | Variant status | Cut the queue shows now, the filter and creator applied | Creator, Concept, Variant, Title, Version (for the client, the newest sent to them), Stage, Status, Added on, Sent on, Approved by, Approved on, File (Upload, Google Drive, Frame.io or Link), Link (a link's address; blank for an upload), Runtime (m:ss.s, blank for a link), Aspect (9:16, 4:5 or width × height), Brief check (passed of 8, with "{f} failed" when any did), Open comments, Hook ("H2 Demo first", agency only), CTA (agency only), Framework (agency only) |
| Content Review | All comments | Comment or reply on the cuts the queue shows | Creator, Variant, Version, Timecode (text, m:ss.s, or General; a reply leaves it blank), Frame (the frame number, blank when the frame rate isn't known or for a linked cut), Seconds (a number, for sorting), Comment, Reply to (its first words), Who, Side (Client, Agency, or Agency only for the agency), When, Has drawing, Resolved |
| Ad Performance | Every variant | Variant in **Variants ranked**, in its order, every row, not only the first 10 | Creator, Tier, Concept, Persona, Product, Variant, Framework (agency only), Hook (agency only), CTA (agency only), Currency, Spend, Spend floor, Days live, Impressions, Hook rate, Hold rate, Link CTR, Purchases, Revenue, Cost per sale, ROAS, Status (Winning, Testing, Watch, Fatigued, Retire), Retire or refresh (the reason, blank when none) |
| Ad Performance | Weeks | Week in **Weekly spend and return** | Round, Week, From, To, Currency, Spend, Impressions, Purchases, Revenue, ROAS, Cost per sale |
| Ad Performance | Not matched (agency only) | Row in **Ads not matched** | Creator, Ad, Post link, Currency, Spend, First day, Last day |
| Ad Performance | By concept and persona | Concept in **Compare**'s **Concepts and personas**, then a row per persona under it, "No persona" included | Concept, Persona (blank on the concept's own row), Variants, Past the floor, Won, Win rate, Spend, Impressions, Hook rate, Hold rate, Link CTR, Purchases, Revenue, ROAS, Cost per sale, Leader (the soft Badges it carries, blank when none), Small sample (Yes or No) |
| Ad Performance | By product | Product in **Products**, "No product" included | Product, Concepts, Variants, Past the floor, Won, Win rate, Spend, Impressions, Hook rate, Purchases, Revenue, ROAS, Cost per sale, Leader, Small sample |
| Ad Performance | By creator | Creator in **By creator**, every row | Creator, Tier, Concepts, Variants, Past the floor, Won, Spend, Impressions, Hook rate, Hold rate, Link CTR, Purchases, Revenue, ROAS, Cost per sale, Small sample |
| Ad Performance | By tier | Tier in **By tier** | Tier, Creators, Variants, Past the floor, Won, Spend, Impressions, Hook rate, Purchases, Revenue, ROAS, Cost per sale, Leader |
| Ad Performance | By framework (agency only) | Framework in **Which framework won**, "Not planned" included | Framework (code and name), Variants, Past the floor, Won, Spend, Impressions, Hook rate, Hold rate, Purchases, Revenue, ROAS, Cost per sale, Leader, Small sample |
| Ad Performance | By hook (agency only) | Hook in **Hooks and CTAs**, per product, "Not planned" and "No product" included | Product, Concept, Hook ("H2 Demo first"), Hook line, Variants, Spend, Impressions, Hook rate, Hold rate, Purchases, Revenue, Cost per sale, Leader, Small sample |
| Ad Performance | Audience | Cell in **Who watched**, once it is shown: each age band and gender, then each region, per product, "All products" first | Product, Breakdown (Age and gender, or Region), Age band, Gender, Region, Impressions, Share of impressions, Purchases (blank where Meta reports none), Currency |
| Ad Performance | By CTA (agency only) | CTA number per product in **CTA 1 against CTA 2**, "No product" included | Product, CTA (C1, C2 or Not planned), Types, Variants, Spend, Impressions, Link CTR, Purchases, Revenue, Cost per sale, Leader, Small sample |
| Ad Performance | Changes | Line in **Changes for round {t}**, in its order; the client's sheet only the accepted concept lines | Kind, Line, Figures, Sample, State (Proposed, Accepted, Dropped, Results changed or Applied; the client's reads Accepted or Applied), Applied to (the round and date) |

**Selected Creators' sheets.** Three are for both sides, Creator snapshot, Shipping list and
Variant tracker, and two for the agency only, Rates and payments and Variant plans.

- **The toolbar's filters apply to the card sheets.** Search, Stage and Products narrow the cards,
  and Creator snapshot, Shipping list, Variant tracker and Variant plans take only the creators
  those filters leave in view, so a shipping list for "Needs info" holds the same creators as the snapshot. The
  About sheet names the filters. Rates and payments keeps every row of **Contract and rates**,
  creators still in negotiation included, since they have no card for a filter to act on.
- **Rates and payments is agency only, whole.** It is the agency's money sheet, with rates per
  deliverable, offers, counters and amounts paid, so the client's Sheet Select doesn't list it.
  What the client may read about each creator's terms once the fees are sent (what they make,
  usage, exclusivity, if we drop them, the agreed fee, the contract and its signed date, the payment
  status and when the fees were approved) is in their Creator snapshot instead. Before the fees are sent those
  columns are blank for the client, and a creator in negotiation has no card yet.
- **The client's Shipping list holds no street.** It has the city, region and country, or the
  pickup and its visit date, as the page shows them (**Who sees what**, **Addresses**). Address
  lines 1 and 2, the ZIP or postal code, the phone and the delivery note are agency only columns.
- **The Variant tracker reads the cut tiles.** Each row's version, stage, status and open comments
  are what that creator's cut tile shows the same viewer (**Selected Creators**, **Cut tiles**),
  so a client's tracker never names a version still in Aspire QA. Hook, CTA and Framework are read
  by **Reading a creator's variant**, for the agency only, and a client's export leaves those
  three columns out, as the tab does. Due is worked out from the round's steps (**Rounds**,
  **Round steps**) and the row's own version, the one the tile shows that viewer, so a client's
  Due never follows a version in Aspire QA. The first cut of V1 is due at **First cut review**,
  and the first cut of every other variant at **Variants due**, so V1 not cut yet, or at version
  1, takes the First cut review date and V2 to V{v} take the Variants due date. Version 2 takes
  the later of **Final cut review** and **Variants due**, and version 3 or later **Final cut sign
  off**. An Approved variant has no Due. Due for names the step the date came from, and a step
  with no date leaves both blank.

What the export can't do yet, said plainly:

- **Empty cells stay empty.** A record nobody has filled leaves its cells blank, never a guessed
  address, tracking number or date. The street, ZIP, phone and delivery note are in the agency's
  sheet only, so a client's export holds no more of an address than the page shows them.
- **Ad Performance exports the results the page holds.** Every variant and Weeks are for both
  sides, with the figures the page itself holds. Every variant lists the results currency's
  variants first and then those in "In other currencies", each with its Currency, so the totals of
  the results currency's rows, and of Weeks, in Spend, Purchases and Revenue equal **Headline
  numbers**. The client's Every
  variant has no Framework, Hook or CTA column and the client gets no Not matched sheet, as on the
  tab. The By sheets are **Compare**'s
  groups, in the results currency only, with a Currency named once in the About sheet, so each
  sheet's Spend, Impressions, Purchases and Revenue add up to **Headline numbers**, as on the tab.
  With no target, Won and Win rate are left blank on every row.
  By framework, By hook and By CTA are agency only, whole, and aren't listed for the client. A
  kind the page didn't draw because its sums didn't match isn't exported either. **Who watched**
  has no Audience sheet while it is hidden, and its sheet holds no regions when **Top regions**
  isn't shown. By concept and persona holds each concept's row and its
  personas' rows under it, so its concept rows add up to the totals and its persona rows add up
  to their concept. With no results for the round in view, the Export Button is
  disabled.
- **Content Review exports the cuts its queue shows.** With no cut in the round, its Export
  Button is disabled. Hook, CTA and Framework are agency only columns, as on the tab.
- **Opening in Excel and Google Sheets can't be checked from the chat.** Check one export from each
  tab by opening the page, and say so when handing over a first publish. Check one tab's export
  from a real Contributor's account too, since **Preview as client** rests on the page's code.

### Footer

"Page republished on every change. Numbers come from Atlas as of {time}. Post images are
embedded snapshots; creator emails and the agency only Aspire notes never show to the client." Plus the
fee rate label once. Then the artifact-standard footnote (`artifact-standard.md`). The page is
shared with the client's approvers, so its source line uses the standard's shared-page audience
line. The client view and the agency view each carry their own footnote, and the agency-only
notes never appear in the client view's footnote. For editors only, any brand theme fallbacks
from **Design standards**, read from `agency/design` (**1e**), sit above the footnote under an
"Agency only" rule.

### Where each part lives

Every part of the approval flow has one home in the six tabs. Status lines, pickers and links
name the tab, never an older name for the part:

| Part | Tab and section |
| ---- | --------------- |
| Where the round stands, its pace and its launch date | Home, Simple, **Where we stand** |
| What Aspire is working on | Home, Simple, **Aspire is on it** |
| Last round's cost per sale against target | Home, Simple, **Last round result**, and Ad Performance |
| Cost per sale against target, the hit rate, and when a round goes live | Ad Performance, **Cost per sale against target** |
| Spend, impressions, CPM, hook and hold rates, link CTR, purchases, revenue, ROAS | Ad Performance, **Headline numbers** |
| Spend and ROAS by week | Ad Performance, **Weekly spend and return**, and Home, Everything, **Calendar** |
| Every variant ranked with its status, and the ones to retire or refresh | Ad Performance, **Variants ranked**, and Home, Everything, **Needs attention** |
| A variant's live post | Selected Creators, the card's **Concept and variant plan**, and Ad Performance, **Ads not matched** |
| Results by concept, persona, product, creator and tier, and by framework, hook and CTA for the agency, with insight cards | Ad Performance, **Compare** |
| Who watched by age, gender and region | Ad Performance, **Who watched**, once `search_ads` has the breakdown |
| The next weekly sync, its calendar link and the Slack channel | Home, Simple, **Next check in** |
| The round's steps, what's now and up next, with the four approvals (Concepts, Creators, Fees, Briefs approved) | Home, Everything, **Round steps** |
| Needs your attention, per viewer | Home, Simple, **Waiting on you**, and Everything, **Needs attention**, plus the inbox |
| One card per tab for the round in view | Home, Everything, **Tab summaries** |
| The SOW terms: dates, what each creator makes, usage, allowlisting, exclusivity, organic posting | Home, Everything, **Program terms** |
| The products in scope | Home, Everything, **Products in scope** |
| The Aspire team and what to go to each for | Home, Everything, **Team** |
| Program files by round, what's still needed, previews and scans | Home, Everything, **Files** |
| Creators: the summary, table, cards, decisions and copy decisions | Creator Selection |
| Every contracted creator's step, what's next, details to add, and the round's totals | Selected Creators, the roster (`creators-roster`) |
| Fees and the client's single approve | Selected Creators, **Contract and rates**, with **Approve fees** |
| Product shipping | Selected Creators, **Shipping** |
| The latest cut of each of a creator's variants, played in place | Selected Creators, the creator's card, **Cut tiles** |
| Status updates to {brand} on a creator | Selected Creators, the creator's card, **Update {brand}** and **Updates to {brand}** |
| Briefs: status, voice, concepts, the variant plan and frameworks, versions, with each creator's changed brief | Master Brief |
| Pacing by day and by concept, the phases, milestones and today | Home, Everything, **Calendar** |
| Delays and weekly call: timeline, documents, delays, agenda | Home, Everything, **Calendar** and **Files**; the sync in Simple, **Next check in**; the agenda is Simple's **Where we stand**, **Waiting on you** and **Aspire is on it** |
| Budget (agency only) | Creator Selection, **Summary**, and Selected Creators, **Totals** |
| Drafts and the reply log (agency only) | Selected Creators, on the creator's card |
| Who did what and when, filtered by tab and round, searched | **History**, opened from the inbox |
| What changed for you, and tags for you | **Inbox**, from the header on every tab: every tab on Home, the tab's own elsewhere |
| Open or close a section, Expand all, Collapse all | Every section's header, and the row above a tab's first section (**Collapsing sections**) |
| Export what is on screen to Excel, CSV or a copied table | **Export**, at the start of the row above a tab's first section (**Export**) |

### Page mechanics

Load `artifact-design` before building, and `dataviz` for any chart. Build every screen to
**Design standards** below. Apply `theme:brand` per `theme.md`, **The CAS campaign page**. Concept chips use the theme's chart series; status pills and
decisions keep their semantic colors under any theme. Creators are drawn with the creator card,
images embedded per `creator-card.md`, **Images**, page profile. Publish with the Artifact tool
and the page data capabilities in **1e**. The client's view is complete without the agency data,
and the page renders before its data loads.

The page ships with no sample data. Every creator, brief, file, fee and date comes from the
records or the page data, and a campaign with none yet shows each section's empty state, never
placeholder rows.

### Editing in place

Any text a person may change is changed where it shows, and the change is saved for everyone
with who made it (**1e**, **Every editable value**). The agency edits in place:

| What | Where |
| ---- | ----- |
| Program terms | Home, Everything, **Program terms** |
| Products in scope: add, edit, remove, and the photo link | Home, Everything, **Products in scope** |
| Team: add, edit and remove a person | Home, Everything, **Team** |
| Steps: tick, move to the next step, add, remove, and each step's name, date and owner | Home, Everything, **Round steps**, which **Calendar**'s step events link to |
| A round's label, build window, in-market window and launch date (its month follows the launch) | Home, Everything, **Calendar** ("Edit round {n} dates"), and the **Start round** Dialog |
| Budget total | Creator Selection, **Summary** |
| Files | Home, Everything, **Files**: add by link, upload or drop, edit, remove, scan again |
| The brief | Master Brief: every part of **Tone of voice and don'ts** and of each concept, the variant plan and the frameworks; add, remove, defer and bring back a concept; import a brief; start from the last round's; reset and restore versions |
| Creator profile: name, descriptor, location, concept, product | Creator Selection and Selected Creators |
| A creator's persona and variant plan overrides for the round | Selected Creators, the card's **Concept and variant plan** (the persona also on Creator Selection) |
| A creator's email, phone, address and delivery note; the round's contract, payment, ship to, footage counts and shoot by date | Selected Creators, the card (and **Contract and rates**, **Shipping**, **Brief and content**) |
| Status, ad permissions, and the shipping record (item, carrier, tracking, dates, product status) | Creator Selection and Selected Creators (**Agency edits on the page**) |
| A cut's first version (an upload or a link), its title and notes | Content Review, **Add cut** on an empty slot; later versions in the review panel |

The client edits only what **What the client can write** names, the same way. Everyone else, and
the agency on the client's own calls, sees a label. Nobody edits a round that is done.

How it works on screen, with the components from **Design standards**:

- Text shows as text. For a person who can edit it, hover or focus shows a ghost icon Button (a
  pencil, labelled "Edit {part}"); it or a click on the text opens an Input for one line or a
  Textarea for more, in place, with the text selected. Enter in an Input, or leaving the field,
  saves; Escape cancels. A date opens a date Input, and a fixed set of values a Select.
- While a save is on its way the field shows "Saving" in `text-xs text-muted-foreground`, then
  "Saved" for two seconds once the page data confirms it. A refused save keeps what the person
  typed on screen, shows an error Badge "Not saved" with a ghost "Try again" Button, and never
  drops the text.
- **Who edited it.** Hovering a value shows a Tooltip: "Edited by {name} {time}". On a touch
  screen, where there is no hover, tapping the value shows the same line under it in
  `text-xs text-muted-foreground` until the next tap elsewhere. A value Claude wrote reads
  "Written by Claude {time}", one from the records "Synced from Aspire Atlas {time}", one from
  a sheet "From the sheet {time}", and one from a program file "From {file label} {time}". `{time}` is relative under a day ("12 min ago"), then the
  date. Labels show the line too, so the client sees who changed what they read.
- **Someone else's edit** shows as it arrives, with no reload. If the person has that field
  open, their text stays, and a line under it says "{name} changed this {time}. Saving keeps
  yours."
- Agency only values and their lines live in agency data, so a client never sees who edited
  them, or that they exist.

### Design standards

Every screen, tab, panel and dialog on the campaign page follows this section. Other parts of this
reference say what a screen holds; this section says how it is built and how it looks. A screen
that does not meet it does not ship. It covers the campaign page only: other Atlas pages keep their
own design.

**Build.** The page is Tailwind utility classes on shadcn components, on the Atlas design system
tokens below, with the brand theme applied on top (**Brand theme on the page**). Load Tailwind from
`https://cdn.tailwindcss.com/3.4.17` with the config in **Tokens**. The page has no build step, so
each component is plain markup (or a React element) that carries the component's class strings
from **Component classes** exactly as written, plus the `data-state` attributes they key on.
Never invent a class combination for a component listed there.

**Components.** Use these and nothing hand-drawn in their place: Button, Card, Badge, Tabs, Table,
Dialog, Sheet, Select, Input, Textarea, Switch, Progress, Tooltip, Avatar, Separator, Skeleton,
Collapsible. Every section on a tab is a Card with a Collapsible header (**Collapsing sections**).
Skeleton is the loading state of anything that waits for page data. Icons are Lucide, at the
sizes the component gives them (`size-4` in buttons). The creator card keeps its own markup from
`creator-card.md` and takes its colors from these tokens (**Brand theme on the page**).

#### Tokens

Put this block in the page `<head>`, before the theme block. It defines the Atlas tokens for
light and dark, maps the semantic classes onto them, and sets the font, radius and touch targets.
Dark mode follows the viewer's system setting. The page has no theme toggle.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script>
const v = (n) => `var(--${n})`, pair = (n) => ({DEFAULT: v(n), foreground: v(`${n}-foreground`)});
tailwind.config = {darkMode: ["variant", [
  "@media screen and (prefers-color-scheme: dark) { &:not(:where([data-theme=light], [data-theme=light] *)) }",
  "@media screen { &:where([data-theme=dark], [data-theme=dark] *) }"]],
  theme: {extend: {
    colors: {background: v("background"), foreground: v("foreground"), card: pair("card"),
      popover: pair("popover"), primary: pair("primary"), secondary: pair("secondary"),
      muted: pair("muted"), accent: pair("accent"), destructive: pair("destructive"),
      border: v("border"), input: v("input"), ring: v("ring")},
    borderRadius: {xl: "0.75rem", lg: v("radius"), md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)"}}}};
</script>
<style>
:root{--background:#ffffff;--foreground:#09090b;--card:#ffffff;--card-foreground:#09090b;
  --popover:#ffffff;--popover-foreground:#09090b;--primary:#0a0a0a;--primary-foreground:#ffffff;
  --secondary:#f9fafb;--secondary-foreground:#09090b;--muted:#f5f5f5;--muted-foreground:#52525c;
  --accent:#f4f4f5;--accent-foreground:#09090b;--destructive:#e7000b;--destructive-foreground:#ffffff;
  --border:#e4e4e7;--input:#ffffff;--ring:#1e4945;--radius:0.75rem;
  --chart-1:#1e4945;--chart-2:#366c63;--chart-3:#4e8e81;--chart-4:#7ab19f;--chart-5:#e3f1bb;
  --chart-1-foreground:#ffffff;--chart-2-foreground:#ffffff;--chart-3-foreground:#09090b;
  --chart-4-foreground:#09090b;--chart-5-foreground:#09090b}
@media screen and (prefers-color-scheme:dark){:root:not([data-theme="light"]){/* the dark values below */}}
@media screen{:root[data-theme="dark"]{--background:hsl(222.2 84% 4.9%);--foreground:hsl(210 40% 98%);
  --card:hsl(222.2 84% 4.9%);--card-foreground:hsl(210 40% 98%);--popover:hsl(222.2 84% 4.9%);
  --popover-foreground:hsl(210 40% 98%);--primary:hsl(210 40% 98%);--primary-foreground:hsl(222.2 47.4% 11.2%);
  --secondary:hsl(217.2 32.6% 17.5%);--secondary-foreground:hsl(210 40% 98%);--muted:hsl(217.2 32.6% 17.5%);
  --muted-foreground:hsl(215 20.2% 65.1%);--accent:hsl(217.2 32.6% 17.5%);--accent-foreground:hsl(210 40% 98%);
  --destructive:hsl(0 62.8% 30.6%);--destructive-foreground:hsl(210 40% 98%);--border:hsl(217.2 32.6% 17.5%);
  --input:hsl(217.2 32.6% 17.5%);--ring:hsl(212.7 26.8% 83.9%);
  --chart-1:hsl(220 70% 50%);--chart-2:hsl(160 60% 45%);--chart-3:hsl(30 80% 55%);--chart-4:hsl(280 65% 60%);
  --chart-5:hsl(340 75% 55%);--chart-1-foreground:#ffffff;--chart-2-foreground:#09090b;
  --chart-3-foreground:#09090b;--chart-4-foreground:#09090b;--chart-5-foreground:#09090b}}
*,*::before,*::after{border-color:var(--border)}
html,body{max-width:100%;overflow-x:clip}
[hidden]{display:none!important}
[role=switch][data-state=unchecked]{background-color:var(--muted-foreground)!important}
body{background-color:var(--background);color:var(--foreground);font-family:'Inter',ui-sans-serif,system-ui,-apple-system,sans-serif}
.bg-background{background-color:var(--background)!important}.bg-card{background-color:var(--card)!important}
.bg-popover{background-color:var(--popover)!important}.bg-primary{background-color:var(--primary)!important}
.bg-secondary{background-color:var(--secondary)!important}.bg-muted{background-color:var(--muted)!important}
.bg-accent{background-color:var(--accent)!important}.bg-destructive{background-color:var(--destructive)!important}
.bg-input{background-color:var(--input)!important}
.text-foreground{color:var(--foreground)!important}.text-card-foreground{color:var(--card-foreground)!important}
.text-popover-foreground{color:var(--popover-foreground)!important}.text-primary{color:var(--primary)!important}
.text-primary-foreground{color:var(--primary-foreground)!important}.text-secondary-foreground{color:var(--secondary-foreground)!important}
.text-muted-foreground{color:var(--muted-foreground)!important}.text-accent-foreground{color:var(--accent-foreground)!important}
.text-destructive{color:var(--destructive)!important}.text-destructive-foreground{color:var(--destructive-foreground)!important}
.border-border{border-color:var(--border)!important}.border-input{border-color:var(--input)!important}
.ring-ring{--tw-ring-color:var(--ring)!important}.ring-offset-background{--tw-ring-offset-color:var(--background)!important}
.focus-visible\:ring-ring:focus-visible,.focus\:ring-ring:focus{--tw-ring-color:var(--ring)}
.rounded-xl{border-radius:0.75rem!important}.rounded-lg{border-radius:var(--radius)!important}
.rounded-md{border-radius:calc(var(--radius) - 2px)!important}.rounded-sm{border-radius:calc(var(--radius) - 4px)!important}
.bg-primary\/10{background-color:color-mix(in srgb,var(--primary) 10%,transparent)!important}
.bg-primary\/20{background-color:color-mix(in srgb,var(--primary) 20%,transparent)!important}
.bg-muted\/50{background-color:color-mix(in srgb,var(--muted) 50%,transparent)!important}
.border-destructive\/50{border-color:color-mix(in srgb,var(--destructive) 50%,transparent)!important}
.bg-black\/80{background-color:rgba(0,0,0,.8)!important}
.hover\:bg-primary\/90:hover{background-color:color-mix(in srgb,var(--primary) 90%,transparent)!important}
.hover\:bg-primary\/80:hover{background-color:color-mix(in srgb,var(--primary) 80%,transparent)!important}
.hover\:bg-destructive\/90:hover{background-color:color-mix(in srgb,var(--destructive) 90%,transparent)!important}
.hover\:bg-secondary\/80:hover{background-color:color-mix(in srgb,var(--secondary) 80%,transparent)!important}
.hover\:bg-accent:hover{background-color:var(--accent)!important}.hover\:bg-muted:hover{background-color:var(--muted)!important}
.hover\:text-accent-foreground:hover{color:var(--accent-foreground)!important}
.bg-chart-1{background-color:var(--chart-1)!important;color:var(--chart-1-foreground)!important}
.bg-chart-2{background-color:var(--chart-2)!important;color:var(--chart-2-foreground)!important}
.bg-chart-3{background-color:var(--chart-3)!important;color:var(--chart-3-foreground)!important}
.bg-chart-4{background-color:var(--chart-4)!important;color:var(--chart-4-foreground)!important}
.bg-chart-5{background-color:var(--chart-5)!important;color:var(--chart-5-foreground)!important}
.border-chart-1{border-color:var(--chart-1)!important}.border-chart-2{border-color:var(--chart-2)!important}
.border-chart-3{border-color:var(--chart-3)!important}.border-chart-4{border-color:var(--chart-4)!important}
.border-chart-5{border-color:var(--chart-5)!important}
@media (pointer:coarse),(max-width:639px){button:not([role=switch]):not([role=checkbox]),a,select,summary,input:not([type=checkbox]):not([type=radio]),[role=tab],[role=button]{min-height:44px}
  a:not(:is(p,li,dd,td,th,label) a){display:inline-flex;align-items:center}
  [data-size=icon]{min-width:44px}[role=tablist]{height:auto}
  [role=switch],[role=checkbox],input[type=checkbox],input[type=radio]{position:relative}
  [role=switch]::after,[role=checkbox]::after{content:"";position:absolute;left:50%;top:50%;width:44px;height:44px;transform:translate(-50%,-50%)}}
</style>
```

The `@media screen and (prefers-color-scheme:dark)` block repeats the `:root[data-theme="dark"]` values
exactly; it is shortened above only to save space here. Write both in full on the page. The
`[hidden]` rule keeps a closed Sheet, Dialog or tooltip hidden even though its classes set a
`display`. The config's colors and radii let prefixed classes (`data-[state=active]:bg-background`,
`focus:bg-accent`, `placeholder:text-muted-foreground`, `sm:rounded-lg`) and `bg-border` resolve
to the same tokens; the style block covers the opacity forms (`bg-primary/10`), which Tailwind
cannot derive from a `var()` color. A Switch or checkbox keeps its drawn size on touch screens and
gets a 44px tap area from its `::after`. A link that stands on its own (an "open" link, a tab card)
is `inline-flex`, so it takes the 44px height; a link inside a sentence stays inline with its text.

#### Banned on the page

- Generic Tailwind color classes: anything `zinc-`, `slate-`, `gray-`, `neutral-` or `stone-`,
  and `bg-white`, `text-black`, and `text-white` as body text. Use the semantic class instead:
  `bg-background` or `bg-card` for white, `bg-muted` or `bg-accent` for light gray, `text-foreground`,
  `text-muted-foreground`, `border-border`, `hover:bg-accent`.
- A color written in markup: no hex, `rgb()` or `hsl()` in a class, an attribute or an inline
  style, and no `style` attribute that sets a color, border or radius. No theme object in script
  (`const theme = {...}`) applied through inline styles, and no `style="background:var(--card)"`.
  Colors live only in the page's style blocks: **Tokens**, the theme block, and the creator card's own style block with its override. Two exceptions: the Aspire Atlas mark
  is pasted as it is (`artifact-standard.md`), and a chart library that needs color values reads
  them from the CSS variables at run time (`getComputedStyle(document.documentElement)`), never from
  literals in the script.
- Cards with any corner but `rounded-xl`.
- Any font but Inter. A brand theme's fonts are not used on this page (**Brand theme on the page**).
- The Badge variant `solid-black`, which uses a neutral color class.

#### Component classes

Use these strings verbatim. Join the base string with one variant and one size. One change from
the design system: the light mode text of the success, warning, error and processing Badges is
one or two shades darker (`green-800`, `amber-700`, `red-700`, `sky-700` in place of `-600`),
because the `-600` text reads below 4.5:1 on its own tint. And an unchecked Switch's track is
`--muted-foreground` (the `[role=switch]` rule in **Tokens**), because `--input` gives it no
visible edge on a card. A Switch keeps the `role="switch"` and `data-state` attributes.

| Component | Part | Classes |
| --------- | ---- | ------- |
| Button | base | `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` |
| | default | `bg-primary text-primary-foreground shadow hover:bg-primary/90` |
| | destructive | `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90` |
| | outline | `border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground` |
| | secondary | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` |
| | ghost | `hover:bg-accent hover:text-accent-foreground` |
| | link | `text-primary underline-offset-4 hover:underline` |
| | sizes | default `h-9 px-4 py-2`, sm `h-8 rounded-md px-3 text-xs`, lg `h-10 rounded-md px-8`, icon `h-9 w-9` with `data-size="icon"` |
| Card | card | `rounded-xl border bg-card text-card-foreground shadow` |
| | header, title, description | `flex flex-col space-y-1.5 p-6`, `font-semibold leading-none tracking-tight`, `text-sm text-muted-foreground` |
| | content, footer | `p-6 pt-0`, `flex items-center p-6 pt-0` |
| Badge | base | `inline-flex items-center gap-1 h-[22px] px-2 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2` |
| | soft | `rounded-sm bg-muted text-muted-foreground border-transparent` |
| | success | `rounded-full bg-green-600/10 text-green-800 border-transparent dark:bg-green-600/20 dark:text-green-400` |
| | warning | `rounded-full bg-amber-500/10 text-amber-700 border-transparent dark:bg-amber-500/20 dark:text-amber-400` |
| | error | `rounded-full bg-red-600/10 text-red-700 border-transparent dark:bg-red-600/20 dark:text-red-400` |
| | processing | `rounded-full bg-sky-600/10 text-sky-700 border-transparent dark:bg-sky-600/20 dark:text-sky-400` |
| | outline, secondary | `rounded-sm text-foreground`, `rounded-sm border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| Tabs | list | `inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground` |
| | trigger | `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow` |
| | content | `mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Table | table, header, body | `w-full caption-bottom text-sm`, `[&_tr]:border-b`, `[&_tr:last-child]:border-0` |
| | row | `border-b transition-colors hover:bg-muted data-[state=selected]:bg-muted` |
| | head | `h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap [&:has([role=checkbox])]:pr-0` |
| | cell | `p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0` |
| | footer, caption | `border-t bg-muted/50 font-medium [&>tr]:last:border-b-0`, `mt-4 text-sm text-muted-foreground` |
| Dialog | overlay | `fixed inset-0 z-50 bg-black/80` |
| | content | `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg` |
| | header, footer | `flex flex-col space-y-1.5 text-center sm:text-left`, `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2` |
| | title, description | `text-lg font-semibold leading-none tracking-tight`, `text-sm text-muted-foreground` |
| Sheet | overlay | the Dialog overlay |
| | content | `fixed inset-0 z-50 flex h-full w-full flex-col gap-4 overflow-y-auto bg-background p-6 shadow-lg sm:inset-y-0 sm:left-auto sm:right-0 sm:max-w-md sm:border-l lg:max-w-lg` |
| | header, title, description | the Dialog header, title and description |
| Select | trigger | `flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1` |
| | content | `relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md` |
| | item | `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50` |
| Input | | `flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm` |
| Textarea | | `flex min-h-[60px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm` |
| Switch | root | `peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input` |
| | thumb | `pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0` |
| Score ring | svg, track, value, number | an inline `svg` with `viewBox="0 0 36 36"`, `size-10 shrink-0 -rotate-90` (`size-16` in the score's reasons), holding two `circle` elements with `cx="18" cy="18" r="16" fill="none" stroke-width="3"`: the track `stroke-muted`, and the value `stroke-foreground` with `stroke-linecap="round"`, `pathLength="100"` and `stroke-dasharray="{score} 100"`; the number over it, centered, `text-sm font-semibold` (`text-lg` in the reasons). The ring is never colored by band: the band Badge beside it carries that. `role="img"` with `aria-label="Campaign match {score} of 100, {band}"` |
| Factor bar | root, middle, strong, weak | `relative h-1.5 w-full overflow-hidden rounded-full bg-muted`, then one part: `h-full bg-muted-foreground transition-all` for a middle or unmarked signal, `h-full bg-green-600 transition-all dark:bg-green-500` for a strong one, `h-full bg-amber-600 transition-all dark:bg-amber-500` for a weak one, as wide as the value (a `width` in `style`, the one inline style it takes). `role="meter"` with `aria-valuenow` the value out of 100, `aria-valuemax="100"` and `aria-label` the factor's name |
| Progress | root, indicator | `relative h-2 w-full overflow-hidden rounded-full bg-primary/20`, `h-full w-full flex-1 bg-primary transition-all` |
| Meter, two part | root, first part, second part, legend dot | `relative flex h-2 w-full overflow-hidden rounded-full bg-primary/20`, `h-full shrink-0 bg-primary transition-all`, `h-full shrink-0 bg-muted-foreground transition-all`, `size-2 shrink-0 rounded-full` with the part's `bg-` class |
| Tooltip | content | `z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground` |
| Avatar | root, fallback | `relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full`, `flex h-full w-full items-center justify-center rounded-full bg-muted` |
| Separator | | `shrink-0 bg-border` with `h-[1px] w-full` (horizontal) or `h-full w-[1px]` (vertical) |
| Skeleton | | `animate-pulse rounded-md bg-primary/10` |
| Collapsible | header | `flex items-start gap-3 p-6`, holding the trigger and anything beside it |
| | trigger | `flex min-w-0 flex-1 items-start gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-180`, on a `button` with `aria-expanded`, `aria-controls` and `data-state` (`open` or `closed`) |
| | title, summary | `text-xl font-semibold leading-none tracking-tight`, `mt-1.5 text-sm text-muted-foreground break-words`, in a `min-w-0 flex-1` block |
| | chevron | the Lucide `chevron-down`, `mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none`, last in the trigger |
| | content | the Card content, with `data-state` and `hidden` while closed |
| Count tile | | `flex min-w-0 flex-col items-start gap-1 rounded-xl border bg-card p-4 text-left shadow hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-[pressed=true]:ring-2 aria-[pressed=true]:ring-ring`, on a `button` with `aria-pressed` |
| Status dot | | `inline-block size-2 shrink-0 rounded-full`, with the status's dot class from **Content Review**, **Statuses**; `aria-hidden="true"`, since the trigger's label names every status |
| List row | | `flex w-full min-w-0 items-start gap-3 rounded-md p-2 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`, on a `button` |
| Viewer | root, top bar, body | `fixed inset-0 z-50 flex flex-col bg-background`, `flex h-14 shrink-0 items-center gap-2 border-b px-2 sm:px-4`, `relative flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(0,1fr)_360px] lg:grid-cols-[minmax(0,1fr)_420px]` |
| | post strip, media box, media cap | `flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto bg-muted p-2 pb-[min(20rem,50dvh)] md:p-6`, `relative flex w-full items-center justify-center overflow-hidden rounded-xl`, on the `img` or `video` itself: `block h-auto w-auto max-w-full object-contain max-h-[calc(100dvh-3.5rem-min(20rem,50dvh))] md:max-h-[calc(100vh-14rem)]` |
| | post row, post tile, post arrow | `flex w-full max-w-full gap-2 overflow-x-auto pb-1`, `relative size-16 shrink-0 overflow-hidden rounded-md border bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-[current=true]:ring-2 aria-[current=true]:ring-ring` on a `button`, the Button outline icon classes plus `absolute top-1/2 -translate-y-1/2` and `left-2` or `right-2` |
| | side panel, sheet body | `fixed inset-x-0 bottom-0 z-10 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-xl border-t bg-background shadow-lg transition-[max-height] motion-reduce:transition-none data-[state=peek]:max-h-[min(20rem,50dvh)] md:static md:max-h-none md:rounded-none md:border-l md:border-t-0 md:shadow-none md:data-[state=peek]:max-h-none`, with `data-state` `peek` or `open`; its body `min-h-0 flex-1 overflow-y-auto` |
| Review panel | root, header, body | the Sheet content with `p-0 gap-0` in place of `p-6 gap-4` and `sm:max-w-2xl lg:max-w-6xl` in place of `sm:max-w-md lg:max-w-lg`; `flex h-14 shrink-0 items-center gap-2 border-b px-2 sm:px-4`; `relative flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px]` |
| | player column, player, video box | `flex min-w-0 flex-col gap-2 bg-muted p-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-4 lg:overflow-y-auto`; the part that goes full screen, `flex w-full flex-col gap-2 bg-muted`, with `bg-background` in place of `bg-muted` in full screen, and `fixed inset-0 z-[60] justify-center p-2` added while it fills the window; `relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-xl bg-black` |
| | video | `block h-auto w-auto max-w-full object-contain max-h-[calc(100dvh-21rem-env(safe-area-inset-bottom))] sm:max-h-[60vh] lg:max-h-[calc(100vh-13rem)]`, and `max-h-[calc(100dvh-8rem)]` in full screen |
| | frame layer, safe zone, safe zone shades, safe zone outline | `pointer-events-none absolute`, placed over the video's frame with `left`, `top`, `width` and `height` in `style`; `absolute inset-0`; four shades, each `absolute bg-black/40` plus top `inset-x-0 top-0 h-[14%]`, bottom `inset-x-0 bottom-0 h-[35%]`, left `left-0 top-[14%] bottom-[35%] w-[6%]` and right `right-0 top-[14%] bottom-[35%] w-[6%]`; `absolute inset-[14%_6%_35%_6%] border border-dashed border-white/80` |
| | inline styles | The player's only inline styles set position and size, never a color, border or radius, like the Factor bar's width: the frame layer's `left`, `top`, `width` and `height`, the played bar's `width`, and the thumb's and each marker's `left` |
| | drawing surface, stroke, stroke under, pens | an `svg` with `viewBox="0 0 1 1"` and `preserveAspectRatio="none"`, `absolute inset-0 h-full w-full`, plus `pointer-events-auto touch-pinch-zoom cursor-crosshair` while drawing, which stops a finger from scrolling but lets two fingers zoom; each `path` `fill-none [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]` with `stroke-[3px]` (Thin) or `stroke-[6px]` (Thick); under it the same path in `stroke-black/60` with `stroke-[5px]` (Thin) or `stroke-[8px]` (Thick); the pens `stroke-red-500`, `stroke-amber-400`, `stroke-sky-400`, and their dots `bg-red-500`, `bg-amber-400`, `bg-sky-400` |
| | scrubber, track, played, thumb | `relative h-11 w-full cursor-pointer touch-none select-none` on the `role="slider"` element; `absolute inset-x-0 bottom-3 h-1.5 rounded-full bg-primary/20`; `h-full rounded-full bg-primary`, as wide as the time played (a `width` in `style`); `absolute bottom-[0.4375rem] size-4 -translate-x-1/2 rounded-full border-2 border-primary bg-background shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring` |
| | markers row, marker, open, resolved, agency only, count | `relative h-5 w-full [@media(pointer:coarse)]:h-11`, the scrubber's sibling just above it, tall enough on touch for the 44px markers; `absolute bottom-0 flex h-5 w-6 -translate-x-1/2 items-end justify-center rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [@media(pointer:coarse)]:w-11`, holding a dot: `size-2.5 rounded-full bg-primary`; `size-2.5 rounded-full bg-muted-foreground/50`; `size-2.5 rounded-full border-2 border-primary bg-background`; `flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground` |
| | controls, toggle pressed, time | `flex flex-wrap items-center justify-center gap-1`, the Buttons ghost icon, and Speed a Select trigger with `w-[4.5rem]` in place of `w-full`; `aria-[pressed=true]:bg-accent aria-[pressed=true]:text-accent-foreground`; `text-xs tabular-nums text-muted-foreground` |
| | side column | the Viewer side panel classes with `sm:` in place of `md:`, `data-[state=peek]:max-h-[calc(5.5rem+env(safe-area-inset-bottom))]` in place of its peek height, and `lg:border-l lg:overflow-y-auto` added; its body `min-h-0 flex-1 overflow-y-auto`; its handle the Viewer's sheet handle with `sm:hidden` in place of `md:hidden` |
| | sheet handle, decision block | `mx-auto flex min-h-11 w-24 shrink-0 items-center justify-center rounded-md md:hidden` on a `button`, holding `h-1.5 w-12 rounded-full bg-muted-foreground`; `sticky top-0 z-10 flex flex-col gap-2 border-b bg-background p-4` |
| | status block, moves, last move | `flex flex-col gap-3 border-b p-4`; `flex flex-wrap items-center gap-2`, its Buttons size default with `min-h-11` added on touch (`[@media(pointer:coarse)]:min-h-11`); `text-xs text-muted-foreground` |
| | compare pair, compare box, compare label | `grid w-full grid-cols-2 gap-2`; the video box classes with `aspect-[9/16]` added, its `video` `h-full w-full object-contain`; `flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground` |
| | brief check: brief block, row, row name, window | `rounded-md border bg-card p-3 text-sm`, a `dl` with `grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1`; `flex min-w-0 items-start gap-2 border-b py-2 last:border-b-0`; `min-w-0 flex-1 text-sm`; the Button link variant, size sm |
| Cut tiles | row, tile, media box, empty box, play, meta | `flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-md pb-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-5`, on a `div` with `role="region"`, `aria-label` and `tabindex="0"`; `flex w-40 shrink-0 snap-start flex-col gap-2 rounded-xl border bg-card p-2 text-card-foreground sm:w-auto`; `relative w-full overflow-hidden rounded-md bg-black aspect-[9/16]`, its `video` `h-full w-full object-contain`, and for a linked cut or one that can't play `bg-muted` in place of `bg-black` with the icon and line centred in `text-xs text-muted-foreground`; `flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs text-muted-foreground aspect-[9/16]`; the Button secondary variant, size icon, plus `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow`, keeping the base's `rounded-md`, with Pause and Sound the Button ghost icon classes in a `flex items-center gap-1` row under the box; `flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground` |

Text sizes are Tailwind's: `text-xs` for captions, `text-sm` for body and labels, `text-lg` for
card titles, `text-xl` for section titles, `text-2xl` for the page title. Weights 400, 500 and 600.

**Status pills** are Badges. Each status label takes one variant, under any theme:

| Variant | Status labels |
| ------- | ------------- |
| soft | New, Not started, Not received, Edited by {name}, Synced from Atlas, Sheet, Claude, From {file label}, Not sent, Not due, Good, Possible, Not scored yet, Too few decisions to judge yet, Not recorded yet, Resolved, Agency only, Awaiting decision, Unreviewed, Unpriced, Not sent yet, not asked yet, not shipped, Planned, Done, Returning, Up next, Paused, Not done, round closed, Scanned, Not read, Draft, Needs work, New concept, Carried forward, Deferred, With Aspire QA, Not cut yet, Not under contract, Back with editor, Not checked, Can't check, Version {k}, Proposed, Dropped, From round {n} results |
| processing | Testing, Needs client review, Sent, Invoice sent, 50% paid, Offer sent, Details received, Shipped, Brief sent, in negotiation, In production, Now, Coming soon, Scanning, In review with client, Waiting for your sign off, Signed off, Aspire to confirm |
| success | Winning, under target, Signed, Paid in full, Confirmed, Kept last round's product, Fees approved, Strong, Holding up, Picked, Priority Yes, Yes, Approved, Agreed, Delivered, Brief accepted, Granted, In market, Ahead, On track, Active, Updated {n}, Signed off, Pass, Accepted, Applied |
| warning | Watch, Fatigued, details to add, On hold, Not confirmed for round {n}, More than planned, Fees changed since you approved, This isn't an approval you made, Weak, Partly matching, Past competitor deal, Paid partnership: {competitor}, Changes requested, This isn't a sign off you made, This isn't a decision you made, This isn't a call you made, Approved on the earlier page, not recorded, Fail, Not counted, Over budget, Maybe, Countered, Your call needed, No reply yet, Brief changed, Pending, waiting for your approval, Running behind, Launch at risk, over target, days late, Waiting on you, Out of stock, Still needed, Needs a concept, Not in products in scope, Removed, Used in round {r}, Broken, Plan broken, Override, Cut for {concept}, Plan changed since this cut, Past the plan, Results changed |
| error | Retire, Competitor conflict, Choosing differently, Passed, No, Rejected, Declined, returned, Couldn't scan, Not added, Couldn't import |

The decision's Badge takes the variant of its choice (Unreviewed is soft). The match score's
band Badge takes its band's variant, and a factor's "Strong" or "Weak" Badge is success or warning.
Strong and weak are semantic: the Factor bar's and the Badges' green and amber come from
**Component classes**, never from the brand theme, and every colored bar has its Badge or no
mark beside it, so a level never reads by color alone. A pill never uses the
brand color, so a brand whose color is red never makes an Approved look like a Rejected.

**Concept colors** come from the chart series in concept order: Concept 1 takes `--chart-1`,
Concept 2 `--chart-2`, and so on. A concept chip is `bg-chart-{n}` with the Badge base and
`rounded-sm`; anything thinner (a dot, a left rule
on a card) is `border-chart-{n}` and always sits next to the concept's name, because the lighter
Atlas series are fills that do not reach 3:1 as a thin line. A sixth concept or later takes `bg-muted text-foreground` with
its number. Charts on the page use the same series in the same order, read from the CSS variables, and
label each series in text, so no chart reads by color alone.

#### Brand theme on the page

Read `theme:brand` the way `theme.md`, **Applying the theme**, **Reading**, says. No theme, or one
that does not parse: the Atlas tokens above stand. With a theme, it overrides these tokens only,
in each mode from that mode's values. The table is in `theme.md`, **The CAS campaign page**:

- `--primary` and `--primary-foreground`: buttons, switches, progress, tooltips and the header
  band.
- `--ring`: focus rings.
- `--chart-1` to `--chart-5` and their foregrounds: concept colors and charts.
- The header band and the logo, per `theme.md`, **Header** and **Logo**.

Surfaces, text, borders and the font stay Atlas's, so every brand's page reads the same way.
Status pills, decisions, deltas and alerts keep their semantic colors.

**Contrast check.** Before publishing, check every overridden token in each mode with `contrast()`
from `theme.md`, **Theme build**, against the thresholds below. A token that fails takes the
Atlas default for that token in that mode. A fill and its foreground fall back together
(`--primary` with `--primary-foreground`, `--chart-n` with `--chart-n-foreground`), so a brand
fill never meets an Atlas foreground; any other token falls back alone:

| Token | Must reach |
| ----- | ---------- |
| `--primary-foreground` on `--primary` | 4.5:1 (text on buttons and the band); when the pair falls back, a `band` header is drawn as `rule` |
| `--primary` on `--background` | 3:1 (a control's edge, WCAG 1.4.11) |
| `--primary` on `--background`, when the page uses it as text (link buttons) | 4.5:1, else links use `text-foreground` with an underline |
| `--ring` on `--background` | 4.5:1 (it is also the creator card's fit ring, drawn as text) |
| each `--chart-n` on `--card` | 3:1 |
| `--chart-n-foreground` on `--chart-n` | 4.5:1: white or near-black, whichever `on()` in `theme.md` picks; if neither reads, the chip shows a `border-chart-{n}` dot and `text-foreground` instead |

Each fallback is one line in `agency/design` (**1e**): "{mode} mode: the brand's {role} did not
read clearly on {what}, so the page uses the Atlas default." The footer shows these lines under
an "Agency only" rule, to editors only. The client never sees them. A theme with nothing to fall
back on writes no lines and shows nothing.

**The creator card** on this page takes the override in `theme.md`, **The CAS campaign page**,
in place of the one in **Creator card**, so its surfaces and text follow these tokens and its fit
ring follows `--ring`.

#### Responsive

Breakpoints are Tailwind's: phone under 640px (no prefix), tablet 640px to 1024px (`sm:` and
`md:`), desktop over 1024px (`lg:`). Build phone first and add the larger layouts with the
prefixes.

- **No horizontal page scroll at any width.** The page wrapper is `mx-auto w-full max-w-7xl px-4
  sm:px-6 lg:px-8`. Every flex and grid child that holds text gets `min-w-0`, and long handles and
  links get `break-words`. Only a table's own scroll area, and a card's row of cut tiles on a
  phone, may be wider than the screen.
- **Layout.** Phone is one column. Card grids are `grid grid-cols-1 gap-4 sm:grid-cols-2
  lg:grid-cols-3`. The header stacks the eyebrow, title and lede on phone and keeps the
  logo at the start and the mark at the end on one row at every width.
- **Round switcher.** The same as the tabs: a Tabs list from 640px, one row that scrolls
  sideways on phone. A segment's dates and state wrap under its label inside the segment, never
  past it.
- **Tabs.** From 640px the tabs are a Tabs list. On phone they are one row that scrolls sideways
  on its own (`overflow-x-auto` wrapper, the list `w-max`), with the selected tab scrolled into
  view and each count badge kept. Never wrap the tabs onto two lines.
- **Tables.** A table with grouped header bands or more than five columns (Creator Selection's
  Table) keeps its first column pinned (`sticky left-0 z-10 bg-card`) and its header pinned (`sticky top-0 z-10
  bg-card`, the corner cell `z-20`), inside its own `overflow-auto max-h-[70vh]` area, at every
  width. The area scrolls both ways, so the header stays in view. The cut tiles on a Selected
  Creators card are the other own scroll area: one row that scrolls sideways under 640px
  (**Selected Creators**, **Cut tiles**). Creator Selection's Table also
  pins its last column, Decision (`sticky right-0 z-10 bg-card`), and on phone the pool is Cards
  instead. Every other table (Contract and
  rates, Shipping, and the totals) is a table from 640px and a stack
  of Cards on phone, one Card per row, each showing the row's first column as its title and the
  other columns as label and value pairs.
- **Side panels.** The review panel, the inbox, History and comments open as a
  Sheet: full screen on phone, a right-hand panel from 640px. The review panel is wider, with two
  columns from 1024px, and on phone its comments and status are a bottom sheet under the player
  (**Content Review**, **The review panel**). The creator viewer is full screen at
  every width, with its side panel on the right from 768px and as a bottom sheet under it (**Creator
  Selection**, **The creator viewer**). Closing either returns to the same place in
  the list. A confirm or a required reason opens a Dialog.
- **Touch.** Every control is at least 44px tall on phone and on touch screens; the `pointer:coarse`
  rule in **Tokens** enforces it, so a control must not undo it with a fixed height. Every tooltip
  trigger is a button that opens the tooltip on hover, on focus and on tap, and closes it on a
  second tap, a tap outside or Escape. What a tooltip says is never the only place the fact lives.
- **Keyboard shortcuts** are extras. Every action has a visible control, and no shortcut is the
  only way to do anything.
- **Media.** Video players are `w-full` in a box that keeps their aspect ratio and is capped at
  `max-h-[70vh]` on phone; the creator viewer's player takes its own media cap (**Component
  classes**, Viewer), which leaves room for its bottom sheet. Charts draw at the width of their container and redraw when it
  changes (a `ResizeObserver`), never at a fixed pixel width. The calendar's compact strip draws
  at its container's width at every size; its full calendar is a month grid from 640px and a
  list of dated days on phone (**Home**, **Calendar**). Images are `max-w-full h-auto`.

#### Checklist before publishing

1. The **Tokens** block is in the `<head>`, then the theme block, and Inter is the only font.
2. No `zinc`, `slate`, `gray`, `neutral` or `stone` color class anywhere in the page.
3. No hex, `rgb()` or `hsl()` outside the page's style blocks and the pasted mark, and no inline
   style that sets a color, border or radius.
4. Every Card is `rounded-xl`, and every component uses its class strings from **Component classes**.
5. Every status pill uses its variant from **Status pills**, and concepts use the chart series in
   order.
6. Every overridden token passed the contrast check in both modes, or fell back and wrote its line.
7. At 375px, 768px and 1280px, `document.documentElement.scrollWidth` equals the window width in
   light and dark.
8. Every section has a Collapsible header with its summary line, every tab has Expand all and
   Collapse all, and each section starts open or closed as **Sections per tab** says.
9. Every tab has its **Export** Button, ExcelJS loads only on the first Excel export, and the
   client's export of each tab, made in **Preview as client**, has no agency only column.
10. Home opens on its Simple view, every figure there is worked out from the records and the
    viewer's clock, and a part whose record is missing (the sync, the Slack link, ad results, the
    target) is hidden rather than shown with a placeholder.
11. Home's Everything view: **Round steps** shows the round in view with Now and Up next, and
    only the agency sees its controls; every **Program terms** value says where it came from;
    products, terms and team parts with no saved value are hidden for the client; **Needs
    attention** tags every row with its round; there are exactly five **Tab summaries** cards;
    and each team email copies.
12. Home's **Files**: the client sees the list, **Still needed** and previews but no add, edit,
    remove or scan control and no scan state; the Files Card is a drop target for the agency only;
    every file shows its type icon, category, version, round, who added it and its date; and the
    capabilities in **1e** declare `assets`, `sample` and, only when this session has a Google
    Drive connector or the stored declaration already has one, `mcp` for it.
13. Home's **Calendar**: every phase, milestone and step date matches the round records, every
    delivery and approval sits on the day its version or status record says, today's numbers
    and verdict match **Where we stand** exactly, concepts take the chart series in order and
    are always named beside their color, the strip and grid draw at their container's width with
    no sideways scroll at 375px, 768px and 1280px, day details open on hover, focus and tap, and
    nothing about spend shows before the page holds the round's results, after which each
    in-market day's spend and ROAS equal that week's in **Weekly spend and return**.
14. Master Brief: the status Badge follows step 4; the meter and counts match the brief and the
    roster, and the client's meter leaves the variant plan out; every concept chip opens its
    concept; **Needs a concept** lists exactly the products in scope with no concept, then the
    deferred concepts; the variant
    plan, **Frameworks**, **Versions** and **Reset to original** never render for the client or
    in **Preview as client**; the rich text toolbar never calls `execCommand`, and a pasted
    `<script>`, `<img onerror>` or `javascript:` link leaves nothing but its text.
15. Master Brief, import and rounds: **Import**, **Start from round {m}** and **Defer to next
    round** render for the agency only, never on a signed off brief or in a done round; an
    import shows its preview before writing and writes nothing while it is open; importing the
    same document a second time maps from `agency/brief-imports` with no call to Claude and
    writes nothing; every kept text value appears word for word in the document; starting
    round {n} writes nothing to an earlier round's documents, and that round's status Badge
    still reads Signed off afterwards; a deferred concept is missing from its round's meter and
    shows Carried forward in the next round; and no round's brief opens with text it was never
    started, imported or written with.
16. Master Brief, comments and sign off: every anchor in **Comments and sign off** has its comment
    Button and opens **Comments** at its threads; the panel's five filters and the part Select
    narrow the same list; a comment on a variant is agency only with no choice; **Send for sign
    off** and **Reopen** render for the agency only, **Sign off** and **Request changes** for the
    client only, never in **Preview as client**; a sign off writes only under the client's own
    `signoffs/{id}` with the copy of what they read; the locked brief renders every part as a label
    and ticks step 4 on Home; and **Copy creator brief** holds no variant plan, reason, coverage,
    comment or id.
17. Creator Selection: the Summary's budget part, Expected cost, cost per 1K reach, the agency only Aspire notes
    and the Waiting on filter never render for the client or in **Preview as client**, and the
    client's Sort Select lists neither cost; Committed equals the agreed figure plus its uplift
    line in **Contract and rates**' **Totals**; the meter's two parts and its legend add up to what the headline subtracts;
    the decision Buttons render only for the client, a second click on the chosen one clears it,
    and a call writes only under the client's own `decisions/{id}`; Table pins Creator and
    Decision and doesn't render under 640px; every tier, city and product count matches its
    filter's result; pool creators not sent yet are only in `agency/pool`, never in the page itself;
    and **Copy decisions** holds the rows in view with no Expected cost for the client.
18. The match score: on each side, a creator's score reads the same on the Table, the card's
    ring, the score's reasons, **Export**, the sort and the creator viewer, and equals `score` in
    that side's stored result; the client and **Preview as client** show the client's score, with
    four factor rows, levels ranked over the creators sent, and no price, expected cost, target
    rate, weight or agency score anywhere they read, `scores` included; the agency sees five rows
    and "The client sees {n}, without price"; a bio naming a saved competitor halves the score and
    reads Competitor conflict; every input left out is named under "Scored without"; making a
    decision changes no score; each page edit **The match score** lists re-scores on the page and
    the client's open view follows; a Done round's scores don't move; a brief run or import leaves
    the **Casting** part as it was; the Factor bar's colors are green and amber under every brand
    theme, each with its Badge; and no keyword, city, competitor or target rate in the page comes
    from anywhere but the brief and the brand's records.
19. The creator viewer: at 375px a client opens **Start review**, decides every creator in view
    from the peeked bottom sheet with Auto advance on, and reaches "You've decided all {n}
    creators" without closing the viewer; every swipe has a Button that does the same, and every
    control in the viewer is at least 44px tall there; from 768px the post strip and the side panel
    sit side by side, and from 1024px every shortcut in **Keyboard shortcuts** works and none works
    while typing; no shortcut is the only way to do anything; a video player keeps its shape and
    stays inside the media cap above the peeked sheet on a phone and inside its column on a
    desktop, at every window size; every video without a stored copy shows its image and "Play on Instagram" or "Play on
    TikTok"; the Hook post sits only on an Instagram creator with a hook rate, and each Paid
    partnership mark has its words in the caption; each post's image is in the page once, not
    once per place it shows; the client, **Preview as client** and the page itself hold no Aspire
    note, rate, term, contact detail or agency score; a client note shows Edit and Remove only to
    its writer; a creator not sent yet has no Notes thread or box, only the Aspire notes; on a 667
    by 375 phone held sideways the post still shows above the peeked sheet; an edited note's **Show history** lists its earlier text; and Back closes the
    viewer on the list where it was.
20. Match score tuning: the section renders for an Editor only, never for a Contributor, a
    Viewer or in **Preview as client**, and the page itself holds none of its figures or weights; a client's No on a creator their ring shows at 75 or more asks "Why pass?", and a
    Priority Yes or Yes under 60 asks "What made them a yes?", each once, dismissible, with the call
    already saved before it shows; Maybe and an unscored creator never ask; the surprise reason
    saves on the client's own call with `at`, and a changed call drops it; the agreement figures,
    the top 10, the surprises and the patterns count only the calls **What the row shows** counts,
    by the score at decision time; Did it sell doesn't render before a round has ad results; the suggestion keeps every weight within 0.08 of its default and at 0.03 or more, adds up to 1, and gives the client's four the same shares whatever Budget vs target's weight; **Apply tuned score**
    and **Back to default** write the five stamps and `stats:`, re-score every creator in every
    round that isn't Done for both sides, log one agency entry and, only when a client score changed, one "Updated the match scores"
    entry, and write nothing to Atlas; and the cards, Table and sort follow the new scores.
21. Selected Creators: only creators approved for the round with an agreed fee have a card; each
    card's step matches **Steps** for its records, and changing a product status, a brief state
    or a cut moves it at once with no reload, a roster field moves it at the next publish, and there
is no step field anywhere in page data; the Footage
    total and the variants planned equal the program terms' deliverables and variants per
    creator, so an edit to either on Home changes every card; the client's details chip counts
    only name and address, and no email, phone, rate, amount paid, contracted total, fee total or budget renders
    for the client or in **Preview as client**; Before the shoot, Content in and Live add up to All, which counts
    the cards in view; **Expand all cards** opens every card in view and nothing else; **Approve
    fees** renders for the client only, while step 3 is open, and writes only under the client's
    own `fees/{id}` with a copy of the fees they saw; and an approval whose copy no longer matches
    reads "Fees changed since you approved".
22. Creator records: a returning creator's address and contact details show in round {n+1} with
    nothing retyped, and Ship to reads "Not confirmed for round {n+1}" until it is confirmed;
    **Mark shipped** saves Shipped, today and an ETA four days out, **Mark delivered** saves
    Delivered and today, both log a `status` entry, and the step moves at once; **Kept last
    round's product** shows only for a returning creator; every value on a card, in **Shipping**
    and in **Contract and rates** carries its source tag from the one list, and none reads Demo;
    an empty field shows "Not recorded yet" or "Not received", never a made up address, carrier,
    tracking number or date, the ETA estimate always reading "estimated"; the client sees city, region and country but no street, ZIP, phone
    or delivery note anywhere, the export included; **Copy shipping label** and **Copy email**
    render for the agency only and write nothing.
23. Concept and variant plan: the card's Concept and Persona Selects write the same `concept` and
    `persona` stamps as Creator Selection's, so the match score, the header chip and the plan name
    the same concept; the hooks, CTAs and selling points on a card equal the brief's text, and
    editing H2 in the brief changes every card on the concept whose variant uses H2, overridden
    or not, with no republish; changing the brief's plan moves every creator without an override
    on that field and none with one; an override saves only on `agency/creator-{net}-{handle}-r{round}`
    and shows "Override" with the brief's value in its Tooltip; a hook or CTA removed from the
    brief shows "Broken" on the card, in Content Review and in Ad Performance, never another
    part; the Table has exactly {v} rows, at most 5, with no way to add one; a concept change
    asks before clearing overrides; and the client and **Preview as client** show no framework,
    length, hook, CTA or override per variant, the export included.
24. Content Review: the creator tabs are exactly the round in view's creators on Selected Creators
    (plus any who left with a cut, marked "Not under contract"), and no round's tab shows another
    round's cuts; a round 2 creator with no round 1 history shows V1 to V{v}, five with the
    default plan, each "Not cut yet" with **Add cut** for the agency only; the slots follow the
    program terms' variants per creator, so an edit on Home changes them; each cut's status is
    its newest version's by the rules in **Statuses**, read in order, and the tiles' counts, the
    filter's counts and the dots agree, with Approved's {a}, {x} and {y} equal to Selected
    Creators' **Variants approved** and **Variants delivered** while no cut is "Past the plan", and
    never past {y}; every dot's status is in its trigger's label; a tile or a filter
    narrows the tabs and rows and hides empty slots; Hook + CTA and Framework never render for the
    client or in **Preview as client**, the export included; a cut with no version sent reads
    "Aspire is checking this cut" for the client and doesn't open; **Add cut** refuses a file over
    20 MB, a full store and a non video type with its line, writes nothing then, and offers Link;
    a Google Drive or Frame.io cut opens outside the page from the review panel; adding a cut
    moves the creator to step 6 and Home's pace at once with no reload; and a done round shows no
    **Add cut** or send, with "Round {n} is signed off." and its results link in place of the
    comment box.
25. The cut player: at 375px a client opens a sent cut, steps it frame by frame, pins a comment to
    a frame, draws on it with a finger without the panel scrolling, and posts both from the bottom
    sheet, which never covers the video or its controls; the drawing shows in the same place at
    375px, 768px, 1280px and in full screen, and in full screen on a phone that can't make a page
    element full screen; every control has a visible Button with a label and a Tooltip, keeps its
    44px tap area on touch, and every shortcut in **Keyboard shortcuts** works from 1024px and none
    while typing; stepping a frame at the stored `fps:` shows each frame once, and a cut with no
    known rate steps 1/30 of a second and says so; an agency only comment, its replies, its drawing,
    its marker and its count are missing from the client's page data, not only from the screen, and
    from **Preview as client**; a reply takes its thread's side; **Copy link** opened by a client on
    a version in QA lands on the newest sent version, on an agency only comment shows no comment, and
    works for a cut in any round; **Copy comments** for the client and with the agency's Switch off
    holds no agency only comment; and a Google Drive or Frame.io cut shows no player, markers or
    drawing, and takes general or typed time comments only.
26. Versions, compare, the status flow and the brief check: **Upload new version** shows for
    Editors in the current round only, sets the stage by the version's number, and puts the cut
    back in With Aspire QA with the client still on the last version sent; the new version's
    runtime and aspect check fills itself with no tick; **Compare** offers every earlier version,
    not only the one before, plays both in step with Sync on, steps each side at its own frame rate,
    and plays one sound; each move in **The status flow** shows only for its side and status, and
    none in a done round or **Preview as client**; **Send to {brand}** and **Send as is** write
    `sentAt:` and log where the client reads it; **Nudge {brand}** puts one "Tagged you" item in
    the client's inbox that opens the cut; **Request changes** stays disabled with no open comment;
    a cut reads Approved only from a client's own `cut-calls` item that answers the newest send,
    and an Approve written under an Editor's id, a `client/cut-*` stamp or an activity entry
    leaves it Needs client review with "Not counted" or "Approved on the earlier page, not
    recorded" for the agency; and the brief's hook, CTA, framework and target length, the check
    notes and Claude's suggestions are missing from the client's page data, not only from the
    screen, while the eight results show read only to the client.
27. Cut tiles, status updates and Selected Creators' exports: each open card has exactly {v}
    slot tiles, at most 5, the same slots Content Review shows the creator, plus one tile per cut
    "Past the plan"; every tile plays the same
    version Content Review's row shows that viewer as latest, so the agency's tile plays the
    newest version and the client's, and **Preview as client**'s, the newest sent, never one in
    Aspire QA, and adding or sending a version changes the tile in every open view with no reload;
    each tile's version Badge, status Badge and open comment count equal that row's; **Open in
    review** opens the review panel at the tile's version and the time it was paused at, at 0:00
    for a tile never played, and for the client on a cut with no version sent goes to the
    creator's tab; an empty slot reads "Not
    cut yet"; a Google Drive or Frame.io tile has no player and opens the link in a new tab; a read
    only client sees the one line and no tile; at 375px the tiles scroll sideways inside their row
    while `document.documentElement.scrollWidth` still equals the window width; **Update {brand}**
    renders for the agency only, in the current round, prefills from client readable values only,
    lets the Editor change the text, and posts one note for {brand} with `kind` `update` and one
    tag per recipient under `tags-client`, so the client's inbox gets its tag item, opening the
    card at **Updates to {brand}**, and nothing leaves the page; an edited update keeps `kind`
    `update`; Creator snapshot, Shipping list and Variant tracker follow the toolbar's filters
    while Rates and payments keeps every row of **Contract and rates**; Rates and payments isn't offered to the client; and the client's
    Shipping list and Variant tracker have no street, ZIP, phone, delivery note, hook, CTA or
    framework column.
28. Ad Performance: with no Meta ad account linked, every section reads "Connect your Meta ad
    account to see results" and no figure, chart or zero shows anywhere on the page; a round not
    in market shows only **Not live yet**, with its launch date, its cuts in and approved, and its
    links; Spend, Impressions, Purchases and Revenue equal Meta Ads Manager's totals for the
    variants' live posts, the same dates and the same currency, and the Every variant and Weeks
    sheets add up to them; no money is added across currencies, and no figure shows 0 where Meta
    reported nothing; every rate equals its sums divided, never an average; each variant's status
    follows **Status** with the target, floor and settings from `campaign:{slug}-decision-defaults`,
    and changing the target there changes the statuses at the next publish with nothing in the
    page's code; the status Badges keep their semantic colors under every brand theme; the two
    weekly charts share one week axis, each has one scale from zero, take `--chart-1` and
    `--chart-2` from the CSS variables, and have their table; the hit rate ring is never colored
    by result; the table shows 10 rows and then **Show all**, and **Top ads** reorders only its
    strip; Hook and CTA, **Ads not matched** and the agency lines never render for the client or
    in **Preview as client**, and the page itself holds no hook, CTA, framework, ad name, ad,
    campaign or ad account id, and no ad code; the retire or refresh rows on Home match the
    table's flags; and the Ads live step, **Last round result**, the calendar's spend and ROAS,
    the Ad Performance summary card and **Did it sell** read the same results.
29. Ad Performance's **Compare**: each kind's Spend, Impressions, Purchases and Revenue add up to
    **Headline numbers** for the same round and currency, with "Not planned", "No persona", "No
    product" and "No follower count" rows where needed and no unmatched or other currency ad in any
    group; every group's rates are worked out from its sums; no group is tagged best, and no
    insight card names a leader, unless it has `compareMinVariants` variants past the floor (and
    `compareMinPurchases` purchases for cost per sale) and beats the next group by
    `winnerMarginPct` ("Most impressions" needs no margin, only enough data in two or more real
    tiers, the tagged one among them), and no "Not planned", "No persona", "No product", "No
    follower count" or "Broken" row is ever named best or saved as a leader; a group short of the variants shows "Small sample" and one short of
    the purchases "Few sales"; leader Badges are soft, never a
    status color; the client's view, **Preview as client**, the page itself and the client's
    export hold no framework, hook or CTA group, label or insight card; the agency's framework
    chart has one series in `--chart-1` from zero, the target as a dashed line, and its table;
    insight cards change when the round's figures change, with nothing fixed in the page's code;
    and **Who watched** isn't drawn, linked or exported until `list_ad_search_fields` lists an
    age and gender breakdown, and shows **Top regions** only when it lists region too.
30. Ad Performance's **Changes for round {t}**: every line rests on a group in `leaders:` that
    passed **Enough to call a leader** or in `overBand:` that passed **Over the Watch band**, with its figures and
    sample under it, and a kind with no such group proposes nothing; a kept hook sets only H1's
    type, or H2's for a second leading hook in the concept, never a hook or CTA's words, and no creator override is written; {t} skips a round whose
    brief is with the client or signed off and says why; **Apply to round {t} brief** renders for
    the agency only, saves the brief first, refuses a brief that was sent or signed off while the
    Dialog was open and writes nothing then, starts an empty round {t} brief from the last signed
    off one, keeps its status Draft, logs its entries and opens Master Brief at the first change;
    round {t}'s **Changes from round {n}** lists exactly the lines accepted and applied; the client,
    a read only client and **Preview as client** read only the accepted concept lines, from
    `changes/r{round}`, with no control; and no hook, CTA, framework or creator line, nor its
    figures, is in the page itself, client readable page data or the client's export.
