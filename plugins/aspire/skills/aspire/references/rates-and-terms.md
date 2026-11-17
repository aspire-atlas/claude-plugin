# Rates and terms reference

Used by the **Rates and terms** section of SKILL.md. Step 13 and Gate 3 of a CAS campaign
(**CAS campaign**): an opening offer and terms for every creator the client approved at Gate 2,
the email drafts the CM sends, the replies the CM pastes back, and the contract and rates the
client approves on the campaign page's Selected Creators tab. Main thread only; no agent runs
this, and an unattended run never does. Nothing here sends email or reads a mailbox: the CM sends
from their own mail and pastes the replies.

The main thread's part of this flow, moved from `SKILL.md` (only pointers changed). A bold section name
in it (**Readouts**, **Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Rates and terms (CAS step 13 and Gate 3)](#rates-and-terms-cas-step-13-and-gate-3)
- [What each creator gets](#what-each-creator-gets)
- [Expected cost](#expected-cost)
- [Target rate](#target-rate)
- [Terms, asked once per campaign](#terms-asked-once-per-campaign)
- [Drafting the rates](#drafting-the-rates)
- [Drafts](#drafts)
- [Replies](#replies)
- [Contract and rates](#contract-and-rates)
- [Closing Gate 3](#closing-gate-3)

## Rates and terms (CAS step 13 and Gate 3)

Reached from the **CAS campaign** dispatch table once creators are approved, or when the user
asks to draft fees, record a reply, or record the client's fee approval on a creator ad campaign.
Full detail lives in this file.

1. If `campaign:{slug}-terms` is missing, ask T1 and T2, confirm the pair once, and write it.
2. Draft an opening offer for every approved creator, from the fee calculator (**Fee
   calculator**). Say on the page when the Aspire recommended rates were used.
3. Show contract and rates (Selected Creators) and the offer drafts, then confirm saving the
   offers in one picker.
4. Keep one email draft on each creator's row per the reference's **Drafts** (offer, counter,
   accept, chase). The CM sends them from their own mail; mark them sent when the CM says so.
5. Record each pasted reply per the reference's **Replies**: one picker for the record and the
   next move. A fee above the maximum, a different deliverable, usage or product, or a creator
   dropping out goes to the client as "your call needed". A creator past their reply window gets
   a chase draft.
6. Record the client's fee approval per the reference's **Closing Gate 3**, read back from the
   client's own approval on the page and checked per **CAS campaign**, **Pulling
   decisions**, **The fee approval**. Then the details emails start; contracts and shipping run in the core Aspire platform.

When the fees used the Aspire recommended rates, make the fee calculator offer from **Fee
calculator**, Offers, after the reply.

## What each creator gets

For every creator whose newest `roster` finding is `approved`:

| Part | Where it comes from |
| ---- | ------------------- |
| Opening offer | The fee calculator (**Fee calculator**, **Applying the rates**): open, target and max, priced on the creator's own view counts for the deliverables below. The saved `fees:rate-card`, or the Aspire recommended rates without one, said on the page. |
| Deliverables | The package in `campaign:{slug}-cas`: one creator's share is the variants count, each a clip on the lane's networks. |
| Usage rights window | The term in `campaign:{slug}-cas` (start, end, usage days). |
| Organic posting terms | `campaign:{slug}-terms`, asked once below. |
| Whitelisting uplift | `campaign:{slug}-terms`, asked once below, added on top of each fee and shown apart from it, unless `allowlisting` is false there. |
| Exclusivity | `exclusivity` in `campaign:{slug}-terms` when saved, else "None". A creator's own ask goes in `termNotes`. |
| Timeline and reply window | From the creator's followers, the larger of Instagram and TikTok: under 100K about two days; 100K and up one to two weeks, through managers. These bands are the reply window's own, apart from the tier the campaign page shows (**CAS campaign**, **Creator Selection**, **Tiers**). |

A creator the calculator cannot price shows no offer and names what is missing, per **Fee calculator**,
**No data, no price**. Never price any other way.

## Expected cost

What a creator is expected to cost the campaign for one round, for the agency only. The campaign
page's Creator Selection sorts on it and its budget **Summary** counts approved creators at it
(**CAS campaign**, **Creator Selection**). The first of these that holds:

1. **Agreed**: the agreed fee.
2. **Counter**: the creator's open counter.
3. **Offer**: the offer's target.
4. **Calculator**: the fee calculator's target (**Fee calculator**, **Applying the rates**) for the package
   above, priced on the creator's own view counts.

Each adds the whitelisting uplift unless `allowlisting` is false, the figure **Totals** gives as the
fee plus its uplift line. A creator the
calculator cannot price has no expected cost and shows as unpriced; never fill one in. Claude works
it out at each publish of the campaign page for every creator in the pool, from the posts read for
the creator cards, and writes it with its basis to the creator's agency data (`expectedCost:`,
`expectedFrom:`). The match score's Budget vs target sets it against the **Target rate** below
(**CAS campaign**, **Creator Selection**, **The match score**). **Cost per 1K reach** is the expected cost divided by the creator's Meta reach
(`instagram.creatorMarketplaceReach`), times 1,000, and is blank without a reach. Both are
estimates for planning and are never shown to the client or sent to a creator.

## Target rate

What the campaign means to pay one creator for one round, on the same footing as the expected
cost, the whitelisting uplift included. The match score's Budget vs target compares each
creator's expected cost with it. The first of these that holds:

1. **Saved**: `targetRateUsd` in `campaign:{slug}-terms`, when the CM set one.
2. **From the budget**: the budget total divided by the creators the campaign plans:
   `package.creators` in `campaign:{slug}-cas` for each round the term holds, one round per
   calendar month from `term.start` to `term.end`, both months counted. The budget total is
   `budgetUsd` there. The campaign page uses its own total (`agency/budget` `total`) and term dates
   (`program/details` `termStart`, `termEnd`) when they are newer than the last pull, and
   **Pulling decisions** writes them into `budgetUsd` and `term`, so discovery and
   vetting reach the same target after the pull. Starting a round doesn't move it.

With neither, there is no target rate: the factor is 0.5 for everyone and the score's reasons say
"No target rate set" to the agency. Like the expected cost, it is agency only and never shown to
the client or sent to a creator, and it is never a figure written into this plugin.

## Terms, asked once per campaign

Before the first rate sheet, read `campaign:{slug}-terms`. When it is missing, ask two
questions, one `AskUserQuestion` each, then confirm the pair once and write the record with
`append_calibration`, `provenance: "interview"`.

| # | Question | Options |
| - | -------- | ------- |
| T1 | What do creators post organically on their own accounts? | 1) Nothing organic, ads only (Recommended); 2) One organic post of one clip; 3) I'll set the terms (type them) |
| T2 | What uplift does whitelisting add to a creator's fee? | 1) 20% of the fee (Recommended); 2) 30% of the fee; 3) No uplift, included in the fee |

When the campaign's concepts came from a saved pitch (**CAS campaign**, **Carrying the pitch
forward**), T1's first option is the pitch's organic posts, marked "(from the pitch,
Recommended)", and "Nothing organic, ads only" follows without the Recommended mark.

The terms object:

```json
{"schema": 1, "organic": "none", "whitelistingUpliftPct": 20, "exclusivity": "none",
 "allowlisting": true, "partnershipAds": true, "targetRateUsd": 2500}
```

`targetRateUsd` is optional and asked by no question: the **Target rate** for one creator for one
round, uplift included. It reaches the record when the CM says it in the chat, through the
supersede rule below.

`allowlisting` and `partnershipAds` are optional and asked by no question: whether the SOW
includes allowlisting and partnership ads. With `allowlisting` false, no uplift is added to any
fee and no uplift line is drafted, whatever `whitelistingUpliftPct` says; missing or true, the
uplift applies as above. They reach the record from an editor's edit on the
campaign page's Home, **Program terms**, or from the program files there (**CAS campaign** **1d**,
**Home**), and Home hides each until it is saved.

A change later goes through `supersede_calibration` with its own Destructive tools confirmation.

## Drafting the rates

1. Read the roster and the setup records (**CAS campaign**, **State model**). Read
   `fees:rate-card` from the same calibration read.
2. For each approved creator, `search_posts` on the creator's handle for the last 10 posts per
   channel the deliverables cover, projecting `viewCount`, `likeCount`, `commentCount`,
   `mediaKind` and `instagram.mediaProductType`. Price per **What each creator gets**, with the
   rate per deliverable (UGC video, Reel collab, 90 day usage) and the expected cost.
3. Show **Contract and rates** (below) for the agency, and the offer drafts (**Drafts**) in chat.
   Where the host draws the rates widget (`get_cas_rates`, **CAS campaign**, **Widgets**), it is
   the Contract and rates screen: show the drafts only. Its row buttons ("Draft a counter for
   @marco", "Record @marco's reply") come back as chat messages and run here with their own
   confirmation.
4. One `AskUserQuestion`: "Save opening offers for {n} creators to the campaign? Totals at
   target: {total}. An offer email draft goes on each creator's row." Options: "Save the offers
   (Recommended)", "Change something". On save, write a `roster` finding per creator with `rate`
   `offered`, `offer` `{open, target, max}`, `currency` (the ISO code the offer is in, USD unless
   the fee calculator or the CM priced it in another) and `replyWindow` (**Reply window**, in
   words: "about two days" or "one to two weeks, through a manager"), an `offer` draft per
   creator, then republish the campaign page. The rates widget (`get_cas_rates`) shows its reply
   window column only once a row carries `replyWindow`, and shows each row's amounts in that row's
   `currency`. Every later roster finding for the creator carries both forward.

## Drafts

For every creator approved at Gate 2, after the opening offer is saved, the Campaign Manager
keeps one email draft on the creator's row: the next one to send. The CM sends it from their
own mail; the page shows it to the agency ready to copy, and the chat shows it when it is
written. No draft is ever sent by the flow.

**Each draft** is a `draft` finding (**CAS campaign**, **Working state**). It pulls these
fields from the roster and the setup records: handle, name (first name only in the greeting),
concept, what they make, usage, exclusivity, the fee, and the campaign dates. Write it in the
brand's voice when the `voice_and_content_ops` brand fact is saved; otherwise plain and warm.
To a creator with a manager, address the manager and name the creator. Never name the client's
approver, the maximum, or another creator's fee.

**Sent.** When the CM says a draft went ("sent Marco's offer", "sent them all"), one picker
names the drafts and the date: "Mark the offer to @a and the chase to @b as sent today?"
Options: "Mark sent (Recommended)", "Change something". The confirm writes each draft again with
`sentAt` and the roster's `lastContactAt` and `waitingOn` creator.

**Reply window**, by followers, shown per creator to the agency: under 100K about two days, 100K
and up one to two weeks through a manager.

### The templates

Placeholders in braces come from the records; anything the records do not hold is a bracketed
blank for the CM to fill, never invented. When exclusivity is none, drop "and {exclusivity}".

**Offer** (the opening offer):

```
Subject: {Brand} creator ads: {concept}

Hi {name},

We're running creator ads for {Brand} from {start} to {end}, and your content fits our
{concept} idea. We'd love you to make {what they make}.

Our offer is {fee at open} for that, with {usage} usage and {exclusivity}. Product ships to
you before filming.

Does that work for you? Happy to talk it through.
```

**Counter** (our answer to their counter, at or under the maximum):

```
Subject: Re: {Brand} creator ads: {concept}

Hi {name},

Thanks for coming back on this. We can go to {fee} for {what they make}, with {usage} usage
and {exclusivity}. If that works, we'll send the agreement and ship the product.
```

**Accept** (they named a fee inside the bounds):

```
Subject: Re: {Brand} creator ads: {concept}

Hi {name},

Great, {fee} for {what they make} with {usage} usage works for us. Next we'll ask for your
shipping details and send the agreement.
```

**Chase** (no reply past the reply window):

```
Subject: Re: {Brand} creator ads: {concept}

Hi {name},

Checking in on our offer from {sent date}: {fee} for {what they make}, {usage} usage. Happy
to walk through it on a quick call. We're confirming creators by {next due date}.
```

**Details** (after the fees are approved, **CAS campaign**, **1f**):

```
Subject: {Brand} creator ads: your details

Hi {name},

Welcome aboard. To get the product to you, please reply with:
1. Your shipping address, or the pickup you prefer
2. Your product and options: {product}, size and color
3. When you're free to film between {start} and {brief date}

Your brief arrives on {brief date}.
```

For a creator whose profile already holds an address (a returning creator, **CAS campaign**,
**1f**), line 1 reads "1. Are we still shipping to you in {city}? Reply yes, or send the new
address", naming the city only. The draft never carries the street.

**Brief** (after the briefs are approved, **CAS campaign**, **1g**):

```
Subject: {Brand} creator ads: your brief for {concept}

Hi {name},

Here's your brief for {concept}:

{brief text}

Reply "looks good" to go ahead as is, or reply with anything you'd change and we'll take it
to {Brand}.
```

**Brief notes** (the client sent notes on a changed brief): one short paragraph that names
what the client approved, then each note as one line, then "Can you confirm?".

## Replies

The CM brings a reply into the chat, pasted or in one line ("Marco agreed at 1,700, net 14").
For each reply:

1. **Resolve the creator** on the roster. A reply that names no creator the roster holds is
   asked about once.
2. **Propose the record and the next move** in one picker. The question states the record in
   plain words and where it sits on the ladder (under target, between target and max, or above
   the walk-away line): "@marco agreed at $1,700, net 14. That's between target and max. Record
   it and draft the accept email?" Options, best first:

   | Reply | Record | Next move |
   | ----- | ------ | --------- |
   | A counter at or under the max | countered at {X} | Counter draft (Recommended), Accept draft, Nothing yet |
   | A fee inside the bounds, or yes to the offer | agreed at {Y}, with terms | Accept draft (Recommended), Nothing |
   | No | declined | Nothing (Recommended); the status screen names the concept's count |
   | A question | asked a question, the question in one line | A reply the CM types, Nothing yet |
   | Details or a brief reply | see **CAS campaign**, **1f** and **1g** | The step's own next move |

   "Change something" is always the last option. Several replies at once are one batch picker
   naming each creator, record and next move.
3. **One confirm writes**: the `roster` finding (`countered` with `counter`, `agreed` with
   `agreed`, or `declined`, with the row's `currency` and `replyWindow`; a term the creator wants
   changed goes in `termNotes` in the CM's words and never changes the campaign's saved terms), a
   `reply` finding with its date for the reply log, and the next `draft` on the row. Then
   republish the campaign page.

### Your call needed

A reply that changes what the client approved goes to the client instead of being settled by the
CM. That is:

- a fee above the saved maximum,
- a different deliverable or usage,
- a different product,
- a creator dropping out.

The confirm then writes the roster with `yourCall` (the question, with the change spelled out:
"Countered at $3,600, above the $3,200 maximum you approved. Accept, hold at $3,200, or
drop?") and `waitingOn` client, so the creator shows "Your call needed" and the question joins
the client's attention list. No draft goes on the row until the client answers on the page and
the answer is pulled (**CAS campaign**, **Pulling decisions**). Anything inside the approved
bounds the CM handles alone.

### No reply yet

A creator whose newest sent draft is older than their reply window, with no reply since, shows
"No reply yet" in the agency's attention list and on their row, with a chase draft waiting. The
chase draft is written the first time the status screen sees it, after the same save picker as
any other draft.

## Contract and rates

The rate sheet is the **Contract and rates** section of the campaign page's Selected Creators tab
(**CAS campaign**, **1d**). It is the step 3 approval, sent with the packet rules there.

- **Intro line.** Client: "What each approved creator will be paid. Approve to move to step 4 and
  let contracts go out." plus a line when someone is still talking. Agency: "Opening offers from
  the brand's rate card, counters and agreements as recorded. The client sees agreed fees only."
- **One row per approved creator**: creator, concept, what they make, how long you can use it,
  exclusivity, the fee, if we drop them, and where it is (Offer sent, Countered, Agreed,
  Declined, with "your call" when one is open).
  - The fee for the client: the agreed fee, or "in negotiation".
  - The fee for the agency (page data, `agency`): offer, counter and agreed, with the rate per
    deliverable under it.
- **Totals**, agency only: the campaign at open, target and max, and at what is agreed so far,
  with the whitelisting uplift as its own line unless `allowlisting` is false. The **Summary** on
  Creator Selection shows the agreed figure as Committed against the campaign budget, beside the
  approved creators not yet contracted at their **Expected cost**.
- **Terms**: usage window, organic posting terms, whitelisting uplift (or "No allowlisting" when
  `allowlisting` is false), in plain words.
- **One approval for the whole sheet**, once per round: **Approve fees** or **Request changes**,
  for the client only, while step 3 is open. It is saved under the client's own id with a copy of
  the fees they saw, so no one at Aspire can approve for them and a fee changed afterwards is
  never recorded as approved (**CAS campaign**, **Selected Creators**, **Contract and
  rates**).
- The fee rate label once ("Aspire recommended rates" when no rate card is saved), "fees are
  estimates from public view counts, not quotes".
- **The contract and payment**, on the agency's rows once the fees are sent: the contract status and
  signed date, the round's rate per deliverable (UGC video, Reel collab, 90 day usage), the
  contracted total (the agreed fee plus its uplift) and the payment status (Invoice sent; 50%
  paid, the rest on final cut sign off; Paid in full; On hold) with the amount paid so far. The
  client reads the contract status, its signed date and the payment status beside their agreed
  fee, never a rate, the total or an amount. Each value carries its source
  tag (**CAS campaign**, **Selected Creators**, **Creator records**).

**Rates are recorded per round.** When the CM records a creator's rates per deliverable in the
chat, with the offer or a reply, the confirm writes them to the roster finding for the round being
negotiated, as `rates` `{ugc, reel, usage90}`, and the next publish copies them to the page's
`agency/creator-{net}-{handle}-r{round}`, stamped `claude`, so a
returning creator's new rates never overwrite what an earlier round contracted. Each round starts
with no rates: starting the next round clears `rates`, and a carried creator's are recorded again
with that round's offer. A contract signed
or a payment made outside the page (in the core Aspire platform) is recorded on the card by the
agency, or typed in the chat: "@a signed on the 3rd", "@b paid half". The chat proposes the
record in one picker, like a reply, and writes it to the roster's `contract` or `payment` for the
round. Claude never assumes a contract is signed or a payment made.

**If we drop them** is three facts in one line: the saving at their current figure (agreed,
else counter, else target), the concept's count after the drop against what it needs, and the
next creator who could step in (the concept's top Maybe from the slate, or "none on the
slate"). It is never a recommendation to drop anyone.

## Closing Gate 3

The client's approval comes back on the page and is read with **Pulling decisions**
(**CAS campaign**), checked as **The fee approval** there says: written by an account on the
client's side and confirmed by the CM as step 3's approver, newer than the send, and for the fees
as they are now. One that fails is named with why and never recorded. A client who can't write on
the page approves outside it, and the CM records their word in the chat (**CAS campaign**,
**Gate 3: the fees**). One batch
picker names each creator's approved fee: "Record the client's approval of fees for @a
($1,200), @b ($900) and @c ($2,100)? This completes step 3." Options: "Record it
(Recommended)", "Change something". On confirm:

1. Write a `roster` finding per creator with `rate` `agreed`, then Gate 3 `cleared` with
   `clearedBy` the approver's name and `approval`, the `page-sides` finding when it changed, a
   ledger line when it was late, and remove the reminder.
2. Say in two lines what it unblocks: the creator details emails (**CAS campaign**, **1f**),
   and contracts, which run in the core Aspire platform.
3. Republish the campaign page with the fees and the Shipping section shown to the client,
   and post the step line.

A ship date the CM types still writes `shipDate` to the creator's roster finding; the answer is
its own confirmation when the question says the dates are saved.
