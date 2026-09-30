# Customer QBR reference (Aspire staff review a customer's quarter)

Shared by the `atlas-customer-qbr` agent and the **Customer QBR** section of `../SKILL.md`.
Aspire staff only. The reader is the customer's program owner, with the Aspire account team
presenting. It answers one question: did we reach the goals we agreed, and what should we do
next quarter.

## Why this exists

A QBR that lists metrics is a report. A QBR that scores agreed goals and explains why is a
review. This flow builds the review. It differs from the quarterly signal
(`../../aspire/references/quarterly-signal.md`): that one is the brand's own story for its
leadership, from Atlas alone. This one is Aspire's review of a customer against a goal
contract, using the program's system of record and the customer's questions as well as Atlas.
It reads the quarterly signal's saved findings when they exist, and never re-runs it.

## Contents

1. Inputs and window
2. The goal contract
3. Evidence: three sources, one job each
4. The four performance sections
5. Scoring
6. The story
7. The two pages
8. Findings (what may be saved, and what never is)
9. Verify before publishing
10. Unattended runs
11. Writing style
12. Slack draft

## 1. Inputs and window

- **Customer:** one organization and one brand profile, resolved by the staff skill.
- **Quarter:** default the last completed calendar quarter, from the shell clock in the
  `policy:readout-cadence` timezone (UTC when absent). The caller may pass quarter to date,
  explicit dates, or a fiscal quarter. The prior quarter is always the comparison.
- **Program types:** any of influencer or gifting, affiliate, UGC or paid ads, TikTok Shop,
  managed paid. They decide which sections appear. No offers means no affiliate section, said
  in one line.
- **Goals:** the ones the staff member typed, the ones saved from the last QBR, or none (then
  review against last quarter and draft next quarter's goals).
- **Connectors:** the Atlas prefix, and when present the warehouse prefix and the Slack
  prefix. A missing connector is a data gap, never a reason to stop.
- **Write answer:** whether the staff member confirmed saving customer-safe results.

## 2. The goal contract

Write every goal's contract before pulling any data, so the data cannot shape the goal.

| Field | Rule |
| ----- | ---- |
| Objective | One plain sentence in the customer's words |
| Primary metric | One metric only. Two metrics that matter are two goals |
| Baseline | Value at the start of the quarter from a system of record, with its date range |
| Target | A number and a date. Agreed before the quarter, or labeled Proposed |
| Data source | Warehouse, Atlas, or Slack, with the table or query |
| Scoring rule | Hit at 100% of target or more, Near at 80% to 99%, Missed under 80%. Invert the ratio for lower-is-better metrics |
| Owner | One named person at Aspire and one at the customer, as the staff member gave them |

Where goals come from, in order: typed by the staff member in this run; `action_item`
findings saved by the last QBR under `customer-qbr-{profile}-*` (those were agreed at the last
review, so they count as agreed); a saved `alignment_target` with a 90-day horizon. A goal the
customer already stated beats one you draft.

**No agreed goals.** Never draft a goal for a quarter that has already run and then score it.
A target written after seeing the result is not a goal, and a Missed pill on it tells the
customer they failed a test they never took. Instead:

- The scorecard opens with one line: "No goals were agreed for this quarter." Then one card
  per primary metric the program type suggests, showing the result against last quarter, with
  no Hit, Near, or Missed pill.
- The goal contracts you draft are next quarter's, tagged Proposed until the customer agrees.
  Their baseline is this quarter's result.

Goals the staff member types as agreed but that were set after the quarter began keep the
Proposed tag and are scored, with the date they were set shown on the card.

Bad goal: grow the creator program. Good goal: deliver 40 posts a month by Dec 31, up from 22
in Q3.

Metric ideas by program type:

- **Affiliate or sales:** sales from creators, conversion rate, cost per sale, members with at
  least one sale, return on commission.
- **Influencer or gifting:** earned media value (EMV), posts delivered, reach, engagement
  rate, share of posts in the top format.
- **UGC or paid ads:** ad-ready assets delivered, days from brief to first cut, cost per
  asset, paid usage rights covered.
- **TikTok Shop:** shop orders from creators, products with a creator video, active creators.
- **Program health:** days from outreach to signed creator, share of approvals under 48 hours,
  budget used against plan.
- **Support:** questions Atlas could have answered that a person answered, share answered
  within one business day, open questions older than 7 days.

Score on the primary metric only. Secondary metrics are context, never a rescue for a missed
goal. A missing baseline makes the goal Not scorable: say why, and set a baseline for next
quarter. Flag any rate that rests on fewer than 10 posts or 30 conversions.

**Posts still maturing.** Posts less than 7 days old at the run date are still collecting
views. When the window ends within 7 days of the run date, say so under the headline numbers,
name how many posts it affects, and leave those posts out of rate comparisons.

## 3. Evidence: three sources, one job each

Never take sales or EMV from Atlas, and never take program cost from Slack.

### Warehouse (system of record for the program)

Use whichever SQL or BI connector the caller detected (Superset, Metabase, or similar).

1. List databases, then tables. Never guess a table name. Look for offers or affiliate links,
   conversions and orders, program members or creators, posts or content with media value,
   payments, and campaigns.
2. Run `SELECT * FROM <table> LIMIT 5` on each candidate to learn the columns and how the
   customer is keyed (by id, not name). A customer can have more than one record (a brand and
   an agency account, say). Find every record for the customer, count each post once by its
   post id, and list the records used on the prep page.
3. Search the connector's saved dashboards for the same metric and match its definition, so
   the QBR agrees with what the customer already sees in Aspire.
4. Filter out test brands and internal users. Use explicit time zones. State the date range.
5. Pull this quarter and the prior quarter for every number, so each has a comparison.

Keep the final SQL for the prep page.

### Atlas (indexed creator posts and the customer's own accounts)

Read only, no discovery. `search_calibrations` (every page) for goals, `brand:summary`,
`competitor`, `red_line`, and `theme:brand`; drop every `review:`, `fees:` key.
`list_post_search_fields` once, then `search_posts` for post metrics and analysis fields.
`search_insights` with a `prefix` filter on `detail.account_review.runKey` and the quarter's
dates for saved work in the quarter, and reuse it instead of re-deriving. Never call it
without a prefix: an unfiltered read returns every finding the organization holds.

| Prefix | Use |
| ------ | --- |
| `customer-qbr-{profile}` | Last QBR's goals and results |
| `quarterly-signal-{profile}` | The brand's own quarter story |
| `readout-weekly-{profile}` | Week patterns and closed action items |
| `content-review-{profile}` | Brand safety verdicts |
| `ad-reuse-{profile}` | Hook scores and licensing candidates |

### Slack (what the customer asked)

Window: the 90 days ending at quarter end. Search the customer's shared channel. Keep only the
customer's people. Skip join messages and thanks. For each question record date, asker,
question, the pain point in one sentence, pain area, whether Atlas could answer it (yes,
partly, no), whether it was answered, and the link.

Pain areas: Creator sourcing, Creator vetting, Content and briefs, Performance and reporting,
Paid usage and ads, Billing and contracts, Integrations and data, Platform how-to, Other.
Questions that keep coming back on one issue are a product gap to raise.

A source that cannot be reached goes under data gaps, and the run continues. Never fill a gap
with an estimate that looks like a measurement.

## 4. The four performance sections

These carry most of the QBR. Build each one fully.

### Social performance (warehouse, with Atlas for format tags)

EMV is the headline, so it leads and takes the first tile.

- Tiles, each with the change against last quarter: EMV, posts completed, impressions,
  engagements, engagement rate, saves, shares, EMV per post.
- EMV by network (Instagram Reels, Stories, Feed, TikTok, YouTube) and EMV per post by format
  (how-to, routine or recipe, unboxing, product only, story frame). The per-post view shows
  where each post earns the most.
- One headline sentence with EMV and its change. One line on how Aspire calculates EMV, and
  that it estimates paid-equivalent value, not sales.

### Top and bottom posts (Atlas analysis)

Program posts are creator posts made for the program, from the warehouse. Rank them by EMV,
then check engagement rate so one large account does not dominate. Show the top 3 and bottom
3. Match each one to Atlas by its permalink, or by network, handle, and posted date, to add
the analysis fields. A post Atlas does not hold keeps its warehouse numbers and link, and its
card says the deeper read is not available. Never swap in the brand's own posts for creator
posts; when Atlas holds only the brand's own account, say so on the prep page. For each: creator handle, network, format, date,
link, views, engagement rate, EMV, saves, the hook (first transcript line, overlay text, or
caption opening), and 3 or 4 reasons.

Reasons come from Atlas fields the census lists, never guesses: when the product first
appears, pacing and camera technique from the production analysis, retention (2-second and
6-second view rates, completion rate, average watch time), saves against the program median,
comment sentiment label and themes, call to action and promo code from the commercial
analysis, and brand safety. Go deepest on the top posts, because they tell the customer what
to repeat. Above the cards, one sentence on the pattern that separates top from bottom.

### Affiliate performance (warehouse)

Skip only when the customer has no offers.

- Headline sentence with sales and the change against last quarter.
- Tiles: sales, conversions, clicks, conversion rate, average order, commissions paid,
  members with a sale, return on commission (sales per dollar of commission).
- A funnel: members active, then members with clicks, then members with a sale.
- Top members by sales, with clicks, sales, conversion rate, and what drove it (link
  placement, code said out loud, channel). The rest in one row.
- Results by offer or code: conversions, sales, average order.
- Three plain findings, such as concentration in the top 3 members, the offer with the best
  average order, and active members with no sale.
- Member rows and offer rows each add up to total sales.

### Paid recommendations (Atlas)

Which posts to turn into paid ads, based on the hook.

- Candidates: brand safety clear and positive comments. Start from saved `ad-reuse-{profile}`
  findings in the quarter; otherwise rank by hook strength using the signals in
  `../../aspire/references/ad-reuse.md` (share past 2 seconds, share past 6 seconds,
  completion rate, average watch time; the account's reels hook rate when post retention is
  missing).
- Verdict per candidate: Run as paid (strong hook, retention above the program median), Test a
  recut (good hook, product late or weak middle), Not yet, or Can't score yet (no retention
  and no transcript, so the hook cannot be judged; name what is missing).
- Each shows the hook line, the retention numbers, one sentence on why, and a suggested cut
  (seconds to keep, end card, Spark Ad or partnership ad). Usage rights status goes on the
  prep page only.
- State the rule used on the page, so the customer can see why a post was picked.

## 5. Scoring

For each goal compute the result, percent of target, change against baseline, and change
against last quarter. Apply the scoring rule. Write one sentence on why, tied to evidence from
section 4 (a creator, a format, a hook, a process change). When no cause can be named, say it
is not yet known and name the check that would find it.

## 6. The story

Order: outcome (goals hit, in one sentence), goal scorecards, social performance, top and
bottom posts, affiliate performance, paid recommendations, program health, what drove the
result, customer questions, next quarter goals.

- Lead each section with the finding, then the number that proves it.
- Compare every number to something: baseline, target, last quarter, the program median, or a
  sourced benchmark. Leave out benchmarks you cannot source.
- Bad news sits in the same place and at the same size as good news.
- Every next-quarter goal is a full goal contract: metric, target, date, and owner. This
  quarter's result is next quarter's baseline. Set the target from what drove the result, not
  a round number, and link it to the posts and hooks that proved it.

## 7. The two pages

Publish two pages, never one page with a hidden toggle. A hidden block is still in the page,
and a shared link would carry it to the customer.

**Customer page**, title "{Customer} QBR {Qn YYYY}". Safe to present or forward.

- Header: customer, quarter, period, Aspire presenter, data as of.
- Outcome panel: the headline, three points, and a large count such as "2 of 3 goals hit".
- Goal cards: status pill (Hit, Near, Missed, Not scorable), Proposed tag where it applies,
  result against target, a progress track with start and target markers, the why sentence,
  and the source.
- Social section: EMV tiles and the two EMV bar charts.
- Post cards: a green top edge for top posts, a red one for bottom posts; stats row, hook
  line, reasons, sentiment, link.
- Affiliate section: tiles, funnel, members table, offers table.
- Paid cards: verdict pill, hook, retention stats, reason, suggested cut.
- Program health table, what drove the result, customer questions as counts by pain area and
  themes (no names, no quotes), next quarter goals.

The customer page never contains another customer's name, raw Slack quotes or askers' names,
internal risk notes, usage rights status or negotiations, Aspire margin or cost data, or
churn language. When in doubt, it goes on the prep page.

**CSM prep page**, title "{Customer} QBR prep {Qn YYYY}". For the Aspire account team only.
Opens with a banner: "Internal to Aspire. Do not share with the customer." Then a link to the
customer page, and:

- Say first: the two or three lines to open the meeting with.
- Watch for: risks and the question the customer is likely to raise.
- Every customer question with date, asker, pain area, Atlas could answer, answered, and link.
- Usage rights status for each paid candidate.
- Data gaps, and the queries used (the final SQL and the Atlas searches, as plain text).

Both pages use a new path per quarter so earlier quarters stay linkable; a rerun for the same
quarter republishes the same two paths. Load `artifact-design` and `dataviz` first. Apply
`theme:brand` per `../../aspire/references/theme.md`, **Applying the theme**, when saved.
Insert every piece of text with `textContent`, never `innerHTML`, because Slack wording,
captions, and creator names come from outside. Light and dark tokens. Readable at phone
width.

## 8. Findings (what may be saved, and what never is)

Findings saved under the customer's profile are readable by the customer's own Atlas users.
Save only what is already on the customer page.

`append_insights`, `runKey` `customer-qbr-{profile}-{YYYY}-Q{n}`, role `account_review`,
anchored to the customer's own account per network. At most eight: `went_well` per goal hit,
`needs_improvement` per goal near or missed, and `action_item` with `priority` per next
quarter goal (3 max). Each `action_item` carries the full goal contract in `detail.goal`
(objective, metric, baseline, target, date, owners, agreed or proposed), so the next QBR reads
it back as the agreed goal. `detail` also carries `recipient` (`{team: "leadership", decision}`),
`quarter`, and each goal's result with its prior-quarter value. `idempotencyKey` per finding.

Never saved to Atlas: prep notes, risks, Slack questions or quotes, askers' names, usage
rights, cost or margin, queries. Write only after the staff skill's confirmation in an
interactive run.

## 9. Verify before publishing

Recompute every headline number from the raw pull. Check that:

- each goal's status matches its scoring rule;
- affiliate member rows and offer rows each sum to total sales;
- EMV by network sums to total EMV;
- every figure on the customer page matches the same figure on the prep page;
- the customer page passes the never-contains list in section 7.

Fix any failure before publishing. A figure that cannot be reconciled is shown with a note,
never adjusted to fit.

## 10. Unattended runs

A scheduled run never asks and never writes to Atlas. It re-runs the staff check, uses the
goals saved by the last QBR (agreed) or drafts Proposed ones, pulls the evidence again,
re-reasons the findings, rewrites the prose, and republishes both pages. It delivers nowhere
beyond the pages. An unauthorized error publishes a "setup needed" card on the prep page path
only.

## 11. Writing style

Plain English. Short sentences, one idea each. No em dashes or double hyphens. Headlines are
one complete phrase, not a label with a colon. No jargon unless the customer uses it. Spell
out earned media value once, then use EMV. Say sales, not GMV.

## 12. Slack draft

After the customer page is published, write the Slack draft staff paste when they share it.
Follow `slack-draft.md` exactly; this section only says what fills it for a QBR.

- **Question:** "Did {Customer}'s {Qn YYYY} creator program reach the goals we agreed, and
  what should we do next quarter?" When the run was performance only, with no goals to
  score: "How did {Customer}'s creator program perform in {Qn YYYY}, and what should we do
  next quarter?"
- **Bullets, in order:** the outcome as the goal count ("2 of 3 goals hit") with the headline
  result against its target; what drove the result, with its number; the post to show first,
  by handle and network; the paid pick or the affiliate result, whichever moved the outcome
  more; and the first next quarter goal with its target and date. Drop a bullet whose
  section the program does not include, but never go below three.
- **Link:** the customer page URL. Never the prep page.

Unattended runs write the draft too. It is text, not a delivery, so it does not break the
rule in section 10 that a scheduled run delivers nowhere beyond the pages.
