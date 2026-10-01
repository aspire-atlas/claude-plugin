# Rates and terms reference

Used by the **Rates and terms** section of SKILL.md. Step 13 and Gate 3 of a CAS campaign
(`cas-campaign.md`): an opening offer and terms for every creator the client approved at Gate 2,
the negotiation state, and the rate sheet the client approves. Main thread only; no agent runs
this, and an unattended run never does.

## What each creator gets

For every creator whose newest `roster` finding is `approved`:

| Part | Where it comes from |
| ---- | ------------------- |
| Opening offer | The fee calculator (`fees.md`, **Applying the rates**): open, target and max, priced on the creator's own view counts for the deliverables below. The saved `fees:rate-card`, or the Aspire recommended rates without one, said on the page. |
| Deliverables | The package in `campaign:{slug}-cas`: one creator's share is the variants count, each a clip on the lane's networks. |
| Usage rights window | The term in `campaign:{slug}-cas` (start, end, usage days). |
| Organic posting terms | `campaign:{slug}-terms`, asked once below. |
| Whitelisting uplift | `campaign:{slug}-terms`, asked once below, added on top of each fee and shown apart from it. |
| Timeline | The creator's tier, from followers: nano (under 10K) and micro (10K to 100K) about two days; mid (100K to 500K) and top (500K and up) one to two weeks, through managers. |

A creator the calculator cannot price shows no offer and names what is missing, per `fees.md`,
**No data, no price**. Never price any other way.

## Terms, asked once per campaign

Before the first rate sheet, read `campaign:{slug}-terms`. When it is missing, ask two
questions, one `AskUserQuestion` each, then confirm the pair once and write the record with
`append_calibration`, `provenance: "interview"`.

| # | Question | Options |
| - | -------- | ------- |
| T1 | What do creators post organically on their own accounts? | 1) Nothing organic, ads only (Recommended); 2) One organic post of one clip; 3) I'll set the terms (type them) |
| T2 | What uplift does whitelisting add to a creator's fee? | 1) 20% of the fee (Recommended); 2) 30% of the fee; 3) No uplift, included in the fee |

The terms object:

```json
{"schema": 1, "organic": "none", "whitelistingUpliftPct": 20}
```

A change later goes through `supersede_calibration` with its own Destructive tools confirmation.

## Drafting the rates

1. Read the roster and the setup records (`cas-campaign.md`, **State model**). Read
   `fees:rate-card` from the same calibration read.
2. For each approved creator, `search_posts` on the creator's handle for the last 10 posts per
   channel the deliverables cover, projecting `viewCount`, `likeCount`, `commentCount`,
   `mediaKind` and `instagram.mediaProductType`. Price per **What each creator gets**.
3. Build the rate sheet page (below) and show it.
4. One `AskUserQuestion`: "Save opening offers for {n} creators to the campaign? Totals at
   target: {total}." Options: "Save the offers (Recommended)", "Change something". On save, write
   a `roster` finding per creator with `rate` `offered` and `offer` `{open, target, max}`, then
   republish the campaign page.

## Recording the negotiation

The CM reports what a creator or manager said, in their own words ("@a countered at $1,400",
"@b took the target", "@c wants 60-day usage"). For each report:

1. Resolve the creator on the roster. Show the new state in one line, with where it sits on the
   ladder: under target, between target and max, or above max ("above the walk-away line").
2. Confirm with `AskUserQuestion`. Several reports at once are one batch picker naming each
   creator and amount. Options: "Save (Recommended)", "Change something".
3. Write a `roster` finding: `countered` with `counter`, or `agreed` with `agreed`. A term the
   creator wants changed (usage days, organic) goes in `detail.termNotes` and on the rate sheet;
   it never changes the campaign's saved terms.
4. Republish the rate sheet and the campaign page.

## The rate sheet page

One page per campaign, republished to the same path on every change. Title "<Brand> Creator Ad
Rates: <Campaign>". It is the Gate 3 packet, with the gate header added when sent.

1. **Header**: brand, campaign, package, usage term, round, the "Prepared for" chip.
2. **Totals**: the campaign at open, target and max, and at what is agreed so far, with the
   whitelisting uplift shown as its own line.
3. **By lane**: one table per lane. One row per creator: handle, tier, deliverables, offer
   (open, target, max), rate state, counter or agreed fee, whitelisting uplift, the expected
   timeline, and the cost of dropping them.
4. **Terms**: usage window, organic posting terms, whitelisting uplift, in plain words.
5. **Footer**: the fee rate label once ("Aspire recommended rates" when no rate card is saved),
   "fees are estimates from public view counts, not quotes", and "numbers come from Atlas as of
   {timestamp}".

**The cost of dropping a creator** is three facts in one line: the saving at their current
figure (agreed, else counter, else target), the lane's count after the drop against what it
needs, and the next creator who could step in (the lane's top Maybe from the slate, or "none on
the slate"). It is never a recommendation to drop anyone.

Load `artifact-design` before building. Apply `theme:brand` per `theme.md`, **Applying the
theme**. Publish with the Artifact tool.

## Closing Gate 3

The client's approval comes back in chat. One batch picker names each creator's approved fee:
"Approve fees for @a ($1,200), @b ($900) and @c ($2,100)? This closes Gate 3." Options: "Close
Gate 3 (Recommended)", "Change something". On close:

1. Write a `roster` finding per creator with `rate` `agreed`, then Gate 3 `cleared`, a ledger
   line when it was late, and remove the reminder.
2. Say in two lines what it unblocks: contracts and product shipping, both in the core Aspire
   platform.
3. Ask once for ship dates: "When does product ship to each creator? Type them, for example
   '@a Nov 4, @b Nov 6'. They're saved to the campaign." Options: "Type the dates (Recommended)", "Add them later". Typed dates
   are written to each creator's `roster` finding as `shipDate`; the answer is its own
   confirmation, because the question says the dates are saved. "Add them later" leaves the
   dates as an open item on the campaign page.
4. Post the gate line and republish the campaign page.

Ship dates are the only step 14 state this flow keeps.
