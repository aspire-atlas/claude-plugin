// The Aspire agents, one card each in the agents panel's second tab. Kept by
// hand beside `agents/*.md`: the mod makes no file calls, so it cannot read the
// folder. Add a line here when an agent is added or renamed.

export type RosterGroup = {
  key: string
  title: string
}

export type RosterEntry = {
  /** The agent type as the Agent tool names it. */
  type: string
  /** A few words. */
  name: string
  /** One line on what it makes. */
  blurb: string
  group: string
}

export const GROUPS: readonly RosterGroup[] = [
  { key: 'insights', title: 'Insights and reports' },
  { key: 'discover', title: 'Find and vet creators' },
  { key: 'create', title: 'Plan and review content' },
  { key: 'program', title: 'Run the program' },
  { key: 'measure', title: 'Measure and decide next' },
]

export const ROSTER: readonly RosterEntry[] = [
  { type: 'aspire:atlas-profile-analyst', name: 'Profile analyst', blurb: 'First insights on your account and next week\'s pushes', group: 'insights' },
  { type: 'aspire:atlas-daily-insights-report', name: 'Daily insights', blurb: 'What yesterday\'s posts mean and what to do', group: 'insights' },
  { type: 'aspire:atlas-weekly-insights-report', name: 'Weekly insights', blurb: 'Patterns behind last week and three next steps', group: 'insights' },
  { type: 'aspire:atlas-quarterly-signal', name: 'Quarterly signal', blurb: 'The quarter\'s one-page story for leadership', group: 'insights' },
  { type: 'aspire:atlas-market-signal', name: 'Market signal', blurb: 'What creators say about you vs competitors', group: 'insights' },
  { type: 'aspire:atlas-post-analysis', name: 'Post analysis', blurb: 'One post in depth: reach, brands, brand safety', group: 'insights' },

  { type: 'aspire:atlas-creator-profile', name: 'Creator profile', blurb: 'A full page on one creator, with fees', group: 'discover' },
  { type: 'aspire:atlas-creator-discovery', name: 'Creator discovery', blurb: 'Keeps a campaign shortlist full and scored', group: 'discover' },
  { type: 'aspire:atlas-creator-vetting', name: 'Creator vetting', blurb: 'Approve, maybe or reject a list of creators', group: 'discover' },
  { type: 'aspire:atlas-ad-reuse', name: 'Ad reuse', blurb: 'Best hooks to reuse as ads, with a cut list', group: 'discover' },

  { type: 'aspire:atlas-creator-brief', name: 'Creator brief', blurb: 'A weekly or campaign brief with creators', group: 'create' },
  { type: 'aspire:atlas-ppa-pitch', name: 'PPA pitch', blurb: 'A casting deck for paid partnership ads', group: 'create' },
  { type: 'aspire:atlas-content-review', name: 'Content review', blurb: 'One post or draft checked against its brief', group: 'create' },
  { type: 'aspire:atlas-content-library', name: 'Content library', blurb: 'Creator content and the rights to use it', group: 'create' },

  { type: 'aspire:atlas-creator-outreach', name: 'Creator outreach', blurb: 'First messages, follow-ups and replies', group: 'program' },
  { type: 'aspire:atlas-creator-negotiation', name: 'Creator negotiation', blurb: 'Offers, counters and renewals', group: 'program' },
  { type: 'aspire:atlas-product-fulfillment', name: 'Product fulfillment', blurb: 'Product picks, orders and shipping', group: 'program' },
  { type: 'aspire:atlas-deliverable-tracker', name: 'Deliverable tracker', blurb: 'Who posted what, on time, with disclosure', group: 'program' },
  { type: 'aspire:atlas-affiliate-manager', name: 'Affiliate manager', blurb: 'Codes, sales and commission', group: 'program' },
  { type: 'aspire:atlas-roster-manager', name: 'Roster manager', blurb: 'Who to renew, rebook or retire', group: 'program' },
  { type: 'aspire:atlas-content-sourcing', name: 'Content sourcing', blurb: 'Usage rights and new content from creators', group: 'program' },

  { type: 'aspire:atlas-program-ledger', name: 'Program ledger', blurb: 'What you owe, invoices, payments and budget', group: 'measure' },
  { type: 'aspire:atlas-program-dashboard', name: 'Program dashboard', blurb: 'One page on how the whole program is doing', group: 'measure' },
  { type: 'aspire:atlas-campaign-orchestrator', name: 'Orchestrator', blurb: 'What to do next across everything', group: 'measure' },
]
