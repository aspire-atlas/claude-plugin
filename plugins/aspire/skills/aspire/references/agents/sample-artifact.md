# Sample artifacts (what an agent makes, shown before it runs)

Every Atlas agent has a `sample` mode. It builds the same page the agent builds for real, from
invented data, themed to the most recent US holiday, so a person can see what the agent produces
before connecting anything or running it on their brand. The **Sample artifacts** section of
SKILL.md offers it and launches it. In a session where plugin agents do not load, the main thread
launches a general-purpose subagent with "Read and follow the agent file
`${CLAUDE_PLUGIN_ROOT}/agents/{agent}.md`, mode `sample`, and this file", or follows both itself.

## Rules

1. **No Atlas, no writes.** A sample calls no Atlas tool, starts no discovery, saves nothing,
   reads no calibrations, and delivers nowhere (no Slack, no email, no schedule). It needs no Atlas
   connection. The only tools are the shell clock, the holiday snippet below, the `artifact-design`
   skill (and `dataviz` when the page has a chart), and the Artifact tool.
2. **Invented, and visibly so.**
   - The brand is the holiday's sample brand from the table below, always written with
     "(sample brand)" the first time it appears.
   - Creator handles contain a hyphen (`@sample-maya-cooks`, `@sample-dev-grills`). Instagram and
     TikTok handles cannot contain a hyphen, so a sample handle can never be a real person. Never
     use a real person's name, handle, or face, a real brand other than the sample brand, or a
     real competitor.
   - Numbers are plausible for the format (a micro creator has tens of thousands of followers, a
     hook rate sits between 35% and 65%) and round enough to read as illustrative.
   - No fetched images. Profile pictures are initials on a tinted circle; post media are flat
     tiles in the holiday colors with a one-line caption and the format chip.
   - A banner at the top of the page, and the footer, say: "Sample · invented data for
     {holiday} {year}. Not from Atlas."
3. **The real page, smaller.** Follow the agent's own reference for page structure, section
   order, chrome, and wording rules, with every section present, at the smallest size that still
   shows how it works: three creators where the real page has ten, five posts where it has
   fifty, one deliverable per phase. Fees use the Aspire recommended rates from `fees.md` on the
   sample's view counts and are labelled as forecasts. A section the agent leaves out when data is
   missing appears in the sample with sample data, so the reader sees it.
4. **Holiday theme.** The sample's campaign is set around the holiday (the angle in the table).
   Colors come from the holiday's palette: `primary` for header bands, chart series one, and
   group or tier tints; `secondary` for the second emphasis and chart series two; `ink` for
   eyebrows, links, and accent text on light backgrounds. Status colors (pass, fail, warn, up,
   down) keep their meaning. Dark mode keeps the same roles with the page's own dark tokens.
   No clip art and no emoji; the holiday shows through the campaign, the copy, and the colors.
5. **Quick.** One pass, no layout loop: build, take at most one look, publish. A sample never
   offers the decision audit and keeps no decision log.
6. **Publish.** Title "Sample {Agent page name}" ("Sample PPA Pitch", "Sample Creator Brief",
   "Sample Weekly Insights"), private, icon `sample`. Republishing the same agent's sample in one
   session reuses its file path.

## Which holiday

The most recent holiday on this list, on or before today's date read from the shell clock. The
list holds US holidays brands market around; days of remembrance (Martin Luther King Jr. Day,
Memorial Day, Juneteenth, Veterans Day) are left out, so a sample campaign never borrows one.

| Holiday | Date | Sample brand | Campaign angle | primary | secondary | ink |
| ------- | ---- | ------------ | -------------- | ------- | --------- | --- |
| New Year's Day | 1 January | Brightside Fitness | New year, new routine | `#B8912F` | `#1E2A44` | `#1E2A44` |
| Valentine's Day | 14 February | Petal & Post | Gifts for the people you love | `#C2185B` | `#F4C6D7` | `#9C1048` |
| Mother's Day | Second Sunday of May | Petal & Post | Thank you, Mom | `#7B5EA7` | `#E9DDF2` | `#5E4387` |
| Father's Day | Third Sunday of June | Ridgeline Outfitters | Gear for Dad's weekend | `#2F5D7C` | `#D6E4EC` | `#244A63` |
| Independence Day | 4 July | Kettle & Crumb | The Fourth of July cookout | `#B22234` | `#3C3B6E` | `#3C3B6E` |
| Labor Day | First Monday of September | Kettle & Crumb | The last cookout of summer | `#2E5E8C` | `#E07A1F` | `#24486B` |
| Halloween | 31 October | Hollow Lane Treats | Treats for the trick-or-treat crowd | `#E8701A` | `#2B2233` | `#2B2233` |
| Thanksgiving | Fourth Thursday of November | Kettle & Crumb | Hosting the Thanksgiving table | `#B5651D` | `#6B3E26` | `#6B3E26` |
| Christmas | 25 December | Ridgeline Outfitters | Gifts under the tree | `#1F6B45` | `#B3232E` | `#1F5A3B` |

Check the `ink` value against the page background with the contrast function in `theme.md`,
**Theme build**; text that fails 4.5:1 switches to the page's own text color.

### Holiday snippet

Standard library only; prints the holiday as JSON.

```bash
python3 us_holiday.py            # today, from the shell clock
python3 us_holiday.py 2026-10-01 # a given date
```

```python
import datetime as dt, json, sys

def nth(year, month, weekday, n):  # weekday: Monday 0 … Sunday 6
    d = dt.date(year, month, 1)
    d += dt.timedelta(days=(weekday - d.weekday()) % 7)
    return d + dt.timedelta(weeks=n - 1)

def holidays(year):
    return [
        ("New Year's Day", dt.date(year, 1, 1)),
        ("Valentine's Day", dt.date(year, 2, 14)),
        ("Mother's Day", nth(year, 5, 6, 2)),
        ("Father's Day", nth(year, 6, 6, 3)),
        ("Independence Day", dt.date(year, 7, 4)),
        ("Labor Day", nth(year, 9, 0, 1)),
        ("Halloween", dt.date(year, 10, 31)),
        ("Thanksgiving", nth(year, 11, 3, 4)),
        ("Christmas", dt.date(year, 12, 25)),
    ]

today = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.datetime.now(dt.timezone.utc).date()
past = [(name, day) for y in (today.year - 1, today.year) for name, day in holidays(y) if day <= today]
name, day = max(past, key=lambda h: h[1])
print(json.dumps({"holiday": name, "date": day.isoformat(), "year": day.year, "daysAgo": (today - day).days}))
```

## What each agent's sample shows

| Agent | Sample page | Scale |
| ----- | ----------- | ----- |
| `atlas-profile-analyst` | Account review of the sample brand's Instagram, with three content pushes for next week | 30 posts, 3 pushes |
| `atlas-ad-reuse` | Hook scores and a cut list for the holiday campaign's videos | 6 videos, 3 cuts |
| `atlas-creator-profile` | Full profile of one sample creator | 1 creator, 12 posts |
| `atlas-creator-brief` | Campaign brief worked back from the holiday | 3 deliverables, 3 creators |
| `atlas-creator-discovery` | A living shortlist for the holiday campaign | 6 candidates, 2 decided |
| `atlas-creator-vetting` | Approve, maybe, or reject for a short list | 5 creators |
| `atlas-content-review` | One draft reviewed against the brief | 1 draft |
| `atlas-post-analysis` | One sample creator's holiday Reel analyzed in depth: brands on screen, safety, disclosure | 1 post, 4 brands |
| `atlas-daily-insights-report` | Yesterday's insights on the holiday's launch pulse | 4 posts |
| `atlas-weekly-insights-report` | The week of the holiday against the 8-week median | 12 posts, 2 readers |
| `atlas-market-signal` | What creators said about the sample brand against one sample competitor ("Copper Pot Co. (sample)") | 8 posts |
| `atlas-quarterly-signal` | The quarter that held the holiday, for leadership | 3 KPIs |
| `atlas-ppa-pitch` | A first-pitch casting deck for the holiday campaign | 2 groups, 3 lanes each |
| `atlas-creator-outreach` | The holiday program's outreach pipeline: drafts on each channel, replies to record, reply rate | 4 creators, one per program type, 2 replies |
| `atlas-creator-negotiation` | The holiday program's negotiation page: offer, counter and recommended move per creator, with the terms summary | 3 creators, 1 your call |
| `atlas-product-fulfillment` | A program's order form for the holiday gifting push, with an order sheet | 4 creators, 2 sheet rows |
| `atlas-content-library` | A content library for the holiday campaign: cleared-for-ads shelf, expiring rights, worth requesting, filterable grid | 12 assets, 3 expiring |
| `atlas-affiliate-manager` | A month of affiliate sales for the holiday campaign: leaderboard, codes, sales and posts timeline, commission lines | 4 creators, 2 sheet rows |
| `atlas-content-sourcing` | A sourcing tracker for the holiday campaign: rights requests by status, expiring rights, an asset request, grants this month | 5 creators, 1 asset request |
| `atlas-deliverable-tracker` | The holiday gifting and paid push's posting tracker: owed vs posted, a late Reel, a disclosure fix, a gifted post expected | 4 creators, 6 deliverables |
| `atlas-roster-manager` | The holiday program's roster review: segment board, quota bars, renewals due, re-engage list | 6 creators, 2 renewals |

An agent not in this table builds its own page at the smallest scale that shows every section.

## Output to the main thread (under 80 words)

- The page link and title.
- The holiday and date used.
- One line on what the real run adds (the brand's own data, the questions it asks first, what it
  saves to Atlas).
