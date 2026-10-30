---
number: 29
name: Reports
team: 6 Organic and operations
personas: Influencer Manager, Paid Social Manager, Organic Social Manager
wave: 1
permission: Read
plugin_agents: atlas-daily-insights-report, atlas-weekly-insights-report, atlas-quarterly-signal, atlas-program-dashboard, atlas-org-dashboard
---

# Reports

## Job to be done

When I have to report, I want daily, weekly, campaign, creator and quarterly reports shaped for the reader and delivered to Slack or email on a schedule, so I stop building decks.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| I6 | How did the program do this quarter? Keep, grow, or cut? | VP of marketing | Readout | None yet |
| O4 | Could we make a version of this report for leadership? | VP of marketing | Readout | None yet |
| O6 | Tell us about a risky post before it spreads. | Brand and legal | Alert in chat and Slack | None yet |

## Skills carried (7)

1. Daily insights with baseline
2. Weekly insights with next steps
3. Campaign and program report
4. Per-creator report
5. Quarterly one-pager for leadership
6. Reader-shaped sections
7. Organization dashboard for a bare /aspire

## Universal skills used

- U1 Creator intelligence
- U2 Content intelligence
- U3 Brand safety and conflicts
- U4 Market and competitor signal
- U5 Performance baseline

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Atlas insights
- Slack
- Gmail

## Trigger phrases

- "daily insights" or "daily insights report"
- "what happened yesterday on our accounts" or "yesterday's numbers"
- "launch pulse" or "how is the launch landing"
- "weekly insights" or "weekly insights report"
- "how did last week go" or "week in review"
- "could we make a version of this report for leadership?"
- "how did influencer do this quarter", "quarterly review" or "QBR"
- "put together the quarter for leadership" or "is our creator program working"
- "program dashboard" or "how is the program doing"
- "are we on track for our goals"
- "organization dashboard", "show the dashboard", "my dashboard" or "rebuild the dashboard"
- "where do we stand" or "show me where we stand"
- "what should I do next in Atlas" or "make my own dashboard"
- A bare `/aspire:aspire` on a configured organization
- "/aspire dashboard"
- "/aspire reports" or "report", with daily, weekly or quarter after it
- A scheduled task named "Atlas daily insights report", "Atlas weekly insights report" or
  "Atlas program dashboard"

## Writes to Atlas

Findings, under the one batch confirmation at launch or the standing approval a scheduled report got at setup. The daily report saves up to five insights, plus three per open launch pulse. The weekly report saves its patterns and next steps and closes action items that are now met. The quarterly report saves its findings when the person confirms. The program dashboard saves a snapshot after approval. The organization dashboard saves nothing itself; `/aspire` saves its link to brand memory, or a personal link for one person, in the Organization dashboard setup.

## Non-goals

- Running the market signal. It reads the saved findings of 02 Market Signal and never re-runs
  them.
- Reviewing the brand's own accounts and proposing pushes: 27 Account Analyst.
- Breaking down one post: 31 Post Analysis.
- Reviewing a post against the brief: 17 Content Review.
- Acting on what the program dashboard shows. Each open item names its next step and the agent
  that handles it, such as 15 Campaign Manager, 16 Product Fulfillment or 18 Creator Payments.
- Keeping the ledger. Spend comes from 18 Creator Payments and shows only in the team view.
- Saving the readout setup and its schedule. That is the Readouts setup in `/aspire`.
