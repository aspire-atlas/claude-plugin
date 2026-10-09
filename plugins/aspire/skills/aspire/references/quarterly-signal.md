# Quarterly signal reference (the quarter's story for leadership)

Shared by the `atlas-quarterly-signal` agent and the **Quarterly signal** section of SKILL.md.
Serves the `leadership` lens (`recipient-lens.md`): is this worth the investment, and what is
the story for the quarter? The decision it feeds is budget, headcount, and where influencer
sits in the channel mix. It lands in a quarterly business review.

## Why the quarterly signal exists

Without it, the quarter is a scramble to rebuild numbers from scattered reports. With it, the
weekly readouts, briefs, reviews, shortlists, and market signal runs already saved in Atlas
roll up into one page. The agent reads what was saved and adds a few fresh aggregates. It
never re-runs another agent.

## Inputs and window

- **Quarter:** default the most recent completed calendar quarter, resolved from the shell
  clock in the `policy:readout-cadence` timezone (UTC when there is none). The caller may pass
  "quarter to date" or explicit dates, and the fiscal quarter the user names. The prior quarter
  is the comparison.
- **Spend** (optional): the program's spend for the quarter, as the user typed it. Without it,
  spend comes only from program snapshots that carry ledger figures (**Program dashboards**
  below), labelled with that source, and only when `ledger_spend` is `show`: this page has no
  Editor-only view, so everyone it is shared with sees what it shows, and the program keeps its
  money for Editors. With `ledger_spend` `omit` (the default), no ledger amount and no ratio
  built on one appears; the program row keeps pace words only. With neither, cost efficiency is a data gap, never an
  estimate presented as spend. Typed spend wins for the cost tiles; a snapshot figure shows
  beside it, labelled.
- **Recipient:** `leadership` by default; the reader and venue when the user names them ("for
  the board deck").

## What it reads

All reads, no discovery, no destruction. `search_insights` with a `prefix` filter on
`detail.account_review.runKey`, paged, keeping findings whose run date falls in the quarter or
the prior quarter:

| Source | Prefix | What it gives |
| ------ | ------ | ------------- |
| Weekly readouts | `readout-weekly-{profile}` | Week-level patterns, follower counts, action items and when they closed |
| Daily readouts | `readout-daily-{profile}` | Red-line hits, anomalies, launch pulses |
| Creator briefs | `creator-brief-{profile}` | Deliverables planned, campaign briefs |
| Content reviews | `content-review-{profile}` | Verdicts, hard-rule hits, edits opened and closed |
| Creator discovery | `creator-discovery-{profile}` | Candidates surfaced, accepted, rejected per campaign |
| Market signal | `market-signal-{profile}` | Share of voice by week, features won and lost |
| Ad reuse | `ad-reuse-{profile}` | Licensing candidates |
| Account reviews | `onboarding-{profile}-` and `account-review-{profile}-own-` | Account health findings, content pushes (`detail.push: true`) and whether a weekly readout closed them |
| Post analyses | `post-analysis-{profile}` | Posts analyzed for sponsorship or reuse, and their verdicts |
| Program dashboards | `program-{profile}-` (every program), `detail.recordType` `snapshot` only | Per program: posts, creators, engagement, deliverables on time, assets cleared for ads, ledger figures and sales per currency, goals with pace |

Fresh aggregates, filter path:

- The brand's own posts in the quarter and the prior quarter, per linked handle: posts,
  engagement, views, engagement rate, format mix. Page with the cursor.
- Creator posts about the brand (the mention set in `market-signal.md`, **Data method**, step
  3) in both quarters: posts, distinct creators, engagement, paid vs organic.
- Current follower counts from `search_creators`, against the first saved follower count in
  the quarter's readout findings.

A source with no findings in the quarter is named under data gaps, never filled.

**Program dashboards.** Read the `program-{profile}-` prefix and keep only `snapshot` findings;
every other program record type belongs to the program flows. Group by `detail.program`. Per
program, take the newest snapshot in the quarter and the newest before the quarter began. The
quarter's figure for a running count (posts, engagement, assets, paid) is the first minus the
second; a program whose first snapshot falls inside the quarter counts from its term start. A
program with no snapshot in the quarter is a gap: "{program}: no dashboard saved this quarter".
Spend from a snapshot is used only when its `basis` is `ledger` and `ledger_spend` is `show`: the
quarter's paid amount, per currency, labelled "paid, from the program ledger". Currencies are never added or converted.
Calibration reads still drop `program:*`, `library:*`, and `orchestrator:*` keys; the program is named from its dashboard's page
title.

## The page: one page, outcome first

Title "<Brand> Quarterly Signal: {Qn YYYY}", a new path per quarter so earlier quarters stay
linkable. Sections:

1. **Header:** brand, quarter, the "Prepared for" chip, prepared date.
2. **The outcome:** one sentence answering "is this working?", with the number it rests on.
3. **Three KPI tiles:** quarter against the prior quarter, chosen from creator posts about the
   brand, distinct creators, engagement, share of voice, and the saved lead metric (R4). With
   spend: cost per 1,000 engagements and cost per creator post, the spend labelled as typed or
   as from the program ledger. Program posts and creators delivering, from the dashboards, may
   be tiles.
4. **Trend:** one line chart of the lead metric by week across both quarters, from the weekly
   findings when they cover the quarter, from the fresh aggregates otherwise.
5. **Two or three headline insights:** each one sentence with a number, drawn from the saved
   findings (a feature won, a creator format that outperformed, a safety record).
6. **The program at work:** one row per influencer program from its dashboards: posts,
   creators, posts on time, assets cleared for ads, and each goal's pace in words only ("on
   pace", "behind", "met"). Never a target, a percent of one, or an amount other than the
   typed spend. Then a compact row of counts: readouts delivered, briefs published,
   creators reviewed and approved, candidates accepted, action items closed.
7. **Next quarter:** three ranked recommendations tied to the numbers above.
8. **Appendix:** links to the quarter's readout, brief, shortlist, and market signal pages,
   and each program's dashboard (`pageUrl` on its newest snapshot),
   where the findings carry them, then sources and data gaps.

Keep it to one screen before the appendix. Load `artifact-design` and `dataviz` first; apply
`theme:brand` per `theme.md`, **Applying the theme**.

## Findings

`append_insights`, `runKey` `quarterly-signal-{profile}-{YYYY}-Q{n}`, role `account_review`,
anchored to the brand's own account per network. At most six: `went_well` per headline win,
`needs_improvement` per headline miss, `action_item` with `priority` per next-quarter
recommendation (3 max). `detail` carries `recipient`, `quarter`, the KPI values with their
prior-quarter values, and `sources[]` (the runKeys read). `idempotencyKey` per finding.
Findings are written only after the main thread's confirmation in an interactive run.
Unattended runs publish the page and write nothing, because no setup step approves quarterly
findings; they deliver nowhere.

## Unattended runs

No setup step or scheduled task creates one today. A run is unattended only when a scheduled
task launches the agent with `run: unattended`; every other run is interactive.

Never ask, never write findings, never deliver. Default to the last completed calendar quarter. No spend means the cost tiles are
left out and named as a gap. No discovery, no destruction. An unauthorized error publishes a
"setup needed" card with "Aspire Atlas needs a fresh sign in".
