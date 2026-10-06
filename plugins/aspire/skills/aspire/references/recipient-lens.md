# Recipient lens reference (every request has two users)

Shared by every agent and by **Reading the ask** in SKILL.md. Holds the lens shape, the team
catalog, how the main thread infers and confirms a lens, and how an agent renders for one.

## Why lenses exist

Every request has two users. The **requester** types the ask. The **recipient** is the person
who will act on the output, and is often on another team: "what are creators saying about us
vs. the competition?" usually comes from a product team asking "are we behind on a
feature, and how is this new competitor landing?" If Atlas builds a generic report, the
requester reworks it before forwarding it. If Atlas reads who is waiting, what they decide,
and when, it builds the output they act on.

The analysis runs once. The lens changes what is selected, the order, the vocabulary, and the
length. It never changes a number.

## The lens

The main thread passes `recipient` to every agent it launches. Several lenses are allowed; the
first is primary.

```
recipient: {
  team:      product | pmm | leadership | growth | campaign | brand | creative | performance | team,
  reader:    the people in the user's own words ("the mobile app team"), or "not stated",
  decision:  one line: what the reader decides with this,
  lands:     where it will be read (product review, launch plan, QBR, edit brief, a channel),
  when:      a date, a cadence, or "not stated",
  shape:     the output shape from the catalog below, adjusted to what the user said,
  confirmed: true when the user confirmed it; false when it is a default
}
```

`team` means the requester's own team is also the reader: the day-to-day work (readouts, the
shortlist, reviews, the week's brief). Its output does not need to persuade anyone. It needs
to be fast and complete, and end in a next step.

## Team catalog

| Team | Cues in the ask | What they usually mean | Decision it feeds | Lands | Output shape | Agents |
| ---- | --------------- | ---------------------- | ----------------- | ----- | ------------ | ------ |
| `product` | "vs. {competitor}", "compared with", "parity", "feature", "what are people saying about us", "friction", "bugs" | Are we behind on a capability, and is there friction users hit that we haven't seen? | Roadmap priorities, where to defend parity | Cross-functional product review, the team's feedback channel | Dense signal with receipts: features compared, clips as evidence, what changed since the last review. No marketing gloss. | `atlas-market-signal`, `atlas-weekly-insights-report` (product lens) |
| `pmm` | "how are we being talked about", "messaging", "positioning", "framing", "narrative", "share of voice", "launch messaging" | Whose framing is winning, and which words do buyers actually use? | Launch narrative, positioning, message testing | Launch planning, messaging reviews | Creators' own language, recurring themes, share of voice by message, gaps in the brand's positioning | `atlas-market-signal`, `atlas-weekly-insights-report` (pmm lens) |
| `leadership` | "how is influencer doing", "this quarter", "QBR", "ROI", "worth it", "for the exec update" | Is this worth the investment, and what is the story for the quarter? | Budget, headcount, channel mix | Quarterly business review, exec updates | One page: business outcome, trend, two or three headline insights | `atlas-quarterly-signal`, `atlas-weekly-insights-report` (leadership lens), `atlas-ppa-pitch` |
| `growth` | "which creators drive results", "where should we spend", "budget", "best performing creators", "efficiency" | Where should the next dollar go? | Creator and channel budget allocation | Growth metrics reviews | Performance by creator and format, efficiency against benchmarks, one clear recommendation | `atlas-weekly-insights-report` (growth lens), `atlas-creator-discovery` (lookalikes) |
| `campaign` | "we launch on {date}", "need creators for {event}", "campaign", "launch plan", "recap" | Who do we activate, what does the brief say, and how will we know it worked? | Creator lineup, the brief, the post-launch read | The launch plan, then the recap | Time-bound in three phases: brief and shortlist before, a live pulse during, a recap against goals after | `atlas-creator-discovery`, `atlas-creator-vetting`, `atlas-creator-brief` (campaign mode), `atlas-content-review`, `atlas-daily-insights-report` (launch pulse) |
| `brand` | "is this safe", "OK to post", "approve", "put our name next to", "on brand" | Does this match how the brand shows up, and what is the risk if it doesn't? | Approve, revise, or pass | Brand review before anything goes live | Safety checks with severity, tone notes, a clear go or no-go with the reason | `atlas-content-review`, `atlas-creator-vetting`, `atlas-post-analysis` |
| `creative` | "send us the good stuff", "clips", "cut down", "edit", "moments", "b-roll" | Exactly which moments, at what length, for which placement? | The cut list | The edit brief | Edit-ready: timestamps, hook moments, suggested cut lengths, platform specs, rights status | `atlas-ad-reuse` |
| `performance` | "reuse as ads", "whitelist", "spark ads", "license", "paid", "best hooks", "what will convert" | Which hooks and openings will work as paid media? | What to license and put spend behind | Paid creative planning | Hook patterns, first-three-second breakdowns, ad practice applied to organic posts, ranked licensing candidates | `atlas-ad-reuse`, `atlas-content-review` (ad reuse check), `atlas-post-analysis` (reuse order), `atlas-ppa-pitch` |
| `team` | No other reader named; "for us", "our", day-to-day asks | Fast, complete, a next step | The team's own next move | Chat, the team's page | The flow's default shape | Every agent |

**Hand-offs.** Two chains recur: Performance picks the candidates, then Creative cuts them;
Campaign runs the launch, then Brand approves the drafts. When the primary lens is one end of
a chain, add the other end as a second lens by default and say so in the confirmation.

## Inferring and confirming (main thread)

1. Read the ask for cues from the catalog, plus any reader, meeting, or date the user names
   ("for the product review Thursday", "our head of product asked"). A named reader or venue beats a cue.
2. Pick the primary lens and, where the catalog or a hand-off suggests it, one secondary.
3. Confirm the guess in one line, never a form. One `AskUserQuestion`, header "For", asked in
   the same call as the flow's first question when there is one (the tool takes up to four
   questions). Word it as the guess, for example "This reads like it's for the product
   review. Should I track it weekly and add a messaging view for PMM?" Options: the guess
   (Recommended), one or two alternative lenses from the cues, and "Just for our team". The
   free-text field covers anything else.
4. Skip the question when the user already named the reader and the decision, when the same
   conversation already confirmed a lens for the same kind of ask, or when the ask is plainly
   the team's own routine ("run the daily"). Then pass the lens with `confirmed: true` if the
   user named it, `false` otherwise.
5. Unattended runs never ask. They use the lenses saved for that flow (`guideline:readout-audience`,
   `market-signal:lenses`), or `team`.

Never ask who the output is for in plain text, and never ask more than once per request.

## Rendering for a lens (every agent)

- **Lead with the decision.** The first line of the chat summary and the page headline answer
  the primary lens's `decision` in the reader's terms. The page header carries a "Prepared for"
  chip: the reader (or team), the decision, and `when` when known.
- **Select and order for the reader.** Use the catalog's shape. Leadership gets one screen and
  outcomes first. Product gets receipts and no gloss. Creative gets timestamps and specs.
  Evidence the reader will not use moves to an appendix or is left out; it is never altered.
- **Same numbers everywhere.** Every lens reads the same analysis. A figure never changes
  between lenses, and a lens never adds a claim the data does not support.
- **Extra lenses are extra sections.** After the primary content, one section per additional
  lens ("Also for PMM"), at most five bullets each, built from the same analysis. Pull more
  data only when a lens needs a field the primary did not (a transcript for a cut list).
- **Name what the reader needs but Atlas doesn't hold.** Spend, conversions, usage rights,
  product telemetry: list them under data gaps and never infer them.
- **End with a forward note.** The chat summary closes with two or three lines the requester
  can paste to the reader as they are: what it says, what it means for their decision, and the
  page link. Plain text, Slack-ready, no internal names. Skip it for lens `team`.
- **Save the lens with the findings.** Every finding an agent writes carries
  `detail.recipient` = `{team, decision}` of the primary lens, and `detail.lens` on a finding
  written for a secondary lens. Later runs, the weekly lenses, and the quarterly roll-up read
  findings by lens instead of re-running the analysis.

A lens that does not fit the agent (a cut list asked of the daily readout) is not forced:
render for `team`, and name the agent that serves that lens in one line of the summary.
