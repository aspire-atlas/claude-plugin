# Offers other flows make

Read at the moments SKILL.md's **Offers** lists: the theme and fee calculator offers at the end
of Phase 5 and before or after the flows named below, and the quality review offer when a page
is published.

## Theme offer (**Theme**, Offers)

Offer the theme at most once per session. Never offer it when `theme:brand` or
`decline:theme` exists, when the user is already running the theme, or in an unattended run.
Agents never offer it.

- At the end of Phase 5, before Phase 6.
- Before the first page-producing flow the user starts in a session: the creator brief,
  creator discovery, a content review, a readout, or a page the user asked for under **Visual
  output**.

Ask with `AskUserQuestion`: "Put Atlas's pages in {brand}'s colors? It takes about two
minutes." Options: "Set it up now (Recommended)", "Not now", "Don't ask again". "Not now" goes
on with the Aspire default. "Don't ask again" writes the `decline:theme` record, and the
answer counts as its confirmation, as with Phase 5 declines.

## Fee calculator offer (**Fee calculator**, Offers)

Offer the fee calculator at most once per session. Never offer it when `fees:rate-card` or
`decline:fees` exists, when the user is already running it, or in an unattended run. Agents
never offer it.

- At the end of Phase 5, after the theme offer, before Phase 6.
- The first time in a session a flow shows the user a creator fee from the Aspire recommended
  rates: after that flow's reply, not before it.

Ask with `AskUserQuestion`: "Set {brand}'s creator rates? Fees on creator profiles, briefs,
shortlists and outreach will use them. It takes about two minutes." Options: "Set them up now
(Recommended)", "Later", "Don't ask again". "Later" goes on with Aspire's recommended rates.
"Don't ask again" writes the `decline:fees` record, and the answer counts as its confirmation,
as with Phase 5 declines.

## Quality review offer (**Quality review**, The offer)

When an agent's page or a main-thread page (not a sample, review, audit, guide, or "setup needed"
card) is published, ask "Run a quality review on {page title} before you share it?" once per page
per session, after the flow's own questions and with the decision audit offer in the same call
(**11.3**). Never in an unattended run.
