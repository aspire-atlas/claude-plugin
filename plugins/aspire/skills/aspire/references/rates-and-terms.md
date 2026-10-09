# Rates and terms reference

Used by the **Rates and terms** section of SKILL.md. Step 13 and Gate 3 of a CAS campaign
(`cas-campaign.md`): an opening offer and terms for every creator the client approved at Gate 2,
the email drafts the CM sends, the replies the CM pastes back, and the Fees tab the client
approves on the campaign page. Main thread only; no agent runs this, and an unattended run never
does. Nothing here sends email or reads a mailbox: the CM sends from their own mail and pastes
the replies.

## What each creator gets

For every creator whose newest `roster` finding is `approved`:

| Part | Where it comes from |
| ---- | ------------------- |
| Opening offer | The fee calculator (`fees.md`, **Applying the rates**): open, target and max, priced on the creator's own view counts for the deliverables below. The saved `fees:rate-card`, or the Aspire recommended rates without one, said on the page. |
| Deliverables | The package in `campaign:{slug}-cas`: one creator's share is the variants count, each a clip on the lane's networks. |
| Usage rights window | The term in `campaign:{slug}-cas` (start, end, usage days). |
| Organic posting terms | `campaign:{slug}-terms`, asked once below. |
| Whitelisting uplift | `campaign:{slug}-terms`, asked once below, added on top of each fee and shown apart from it. |
| Exclusivity | `exclusivity` in `campaign:{slug}-terms` when saved, else "None". A creator's own ask goes in `termNotes`. |
| Timeline and reply window | The creator's tier, from followers: nano (under 10K) and micro (10K to 100K) about two days; mid (100K to 500K) and top (500K and up) one to two weeks, through managers. |

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

When the campaign's concepts came from a saved pitch (`cas-campaign.md`, **Carrying the pitch
forward**), T1's first option is the pitch's organic posts, marked "(from the pitch,
Recommended)", and "Nothing organic, ads only" follows without the Recommended mark.

The terms object:

```json
{"schema": 1, "organic": "none", "whitelistingUpliftPct": 20, "exclusivity": "none"}
```

A change later goes through `supersede_calibration` with its own Destructive tools confirmation.

## Drafting the rates

1. Read the roster and the setup records (`cas-campaign.md`, **State model**). Read
   `fees:rate-card` from the same calibration read.
2. For each approved creator, `search_posts` on the creator's handle for the last 10 posts per
   channel the deliverables cover, projecting `viewCount`, `likeCount`, `commentCount`,
   `mediaKind` and `instagram.mediaProductType`. Price per **What each creator gets**, with the
   rate per deliverable (UGC video, Reel collab, 90 day usage) and the expected cost.
3. Show the Fees tab (below) for the agency, and the offer drafts (**Drafts**) in chat.
4. One `AskUserQuestion`: "Save opening offers for {n} creators to the campaign? Totals at
   target: {total}. An offer email draft goes on each creator's row." Options: "Save the offers
   (Recommended)", "Change something". On save, write a `roster` finding per creator with `rate`
   `offered` and `offer` `{open, target, max}`, an `offer` draft per creator, then republish the
   campaign page.

## Drafts

For every creator approved at Gate 2, after the opening offer is saved, the Campaign Manager
keeps one email draft on the creator's row: the next one to send. The CM sends it from their
own mail; the page shows it to the agency ready to copy, and the chat shows it when it is
written. No draft is ever sent by the flow.

**Each draft** is a `draft` finding (`cas-campaign.md`, **Working state**). It pulls these
fields from the roster and the setup records: handle, name (first name only in the greeting),
concept, what they make, usage, exclusivity, the fee, and the campaign dates. Write it in the
brand's voice when the `voice_and_content_ops` brand fact is saved; otherwise plain and warm.
To a creator with a manager, address the manager and name the creator. Never name the client's
approver, the maximum, or another creator's fee.

**Sent.** When the CM says a draft went ("sent Marco's offer", "sent them all"), one picker
names the drafts and the date: "Mark the offer to @a and the chase to @b as sent today?"
Options: "Mark sent (Recommended)", "Change something". The confirm writes each draft again with
`sentAt` and the roster's `lastContactAt` and `waitingOn` creator.

**Reply window**, by tier, shown per creator to the agency: nano and micro about two days, mid
and top one to two weeks through a manager.

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

**Chase** (no reply past the tier window):

```
Subject: Re: {Brand} creator ads: {concept}

Hi {name},

Checking in on our offer from {sent date}: {fee} for {what they make}, {usage} usage. Happy
to walk through it on a quick call. We're confirming creators by {next due date}.
```

**Details** (after the fees are approved, `cas-campaign.md`, **1f**):

```
Subject: {Brand} creator ads: your details

Hi {name},

Welcome aboard. To get the product to you, please reply with:
1. Your shipping address, or the pickup you prefer
2. Your product and options: {product}, size and color
3. When you're free to film between {start} and {brief date}

Your brief arrives on {brief date}.
```

**Brief** (after the briefs are approved, `cas-campaign.md`, **1g**):

```
Subject: {Brand} creator ads: your brief for {concept}

Hi {name},

Here's your brief for {concept}: {brief link}.
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
   | Details or a brief reply | see `cas-campaign.md`, **1f** and **1g** | The step's own next move |

   "Change something" is always the last option. Several replies at once are one batch picker
   naming each creator, record and next move.
3. **One confirm writes**: the `roster` finding (`countered` with `counter`, `agreed` with
   `agreed`, or `declined`; a term the creator wants changed goes in `termNotes` and never
   changes the campaign's saved terms), a `reply` finding with its date for the reply log, and
   the next `draft` on the row. Then republish the campaign page.

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
the answer is pulled (`cas-campaign.md`, **Pulling decisions**). Anything inside the approved
bounds the CM handles alone.

### No reply yet

A creator whose newest sent draft is older than their tier window, with no reply since, shows
"No reply yet" in the agency's attention list and on their row, with a chase draft waiting. The
chase draft is written the first time the status screen sees it, after the same save picker as
any other draft.

## The Fees tab

The rate sheet is the Fees tab of the campaign page (`cas-campaign.md`, **1d**). It is the step 3
approval, sent with the packet rules there.

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
  with the whitelisting uplift as its own line. The Budget tab carries the same totals against
  the campaign budget.
- **Terms**: usage window, organic posting terms, whitelisting uplift, in plain words.
- **One approve control** for the whole sheet, for the client, while step 3 is open.
- The fee rate label once ("Aspire recommended rates" when no rate card is saved), "fees are
  estimates from public view counts, not quotes".

**If we drop them** is three facts in one line: the saving at their current figure (agreed,
else counter, else target), the concept's count after the drop against what it needs, and the
next creator who could step in (the concept's top Maybe from the slate, or "none on the
slate"). It is never a recommendation to drop anyone.

## Closing Gate 3

The client's approval comes back on the page and is read with **Pulling decisions**
(`cas-campaign.md`). The CM may also report it in chat; resolve it the same way. One batch
picker names each creator's approved fee: "Record the client's approval of fees for @a
($1,200), @b ($900) and @c ($2,100)? This completes step 3." Options: "Record it
(Recommended)", "Change something". On confirm:

1. Write a `roster` finding per creator with `rate` `agreed`, then Gate 3 `cleared`, a ledger
   line when it was late, and remove the reminder.
2. Say in two lines what it unblocks: the creator details emails (`cas-campaign.md`, **1f**),
   and contracts, which run in the core Aspire platform.
3. Republish the campaign page with the fees and the Product shipping tab shown to the client,
   and post the step line.

A ship date the CM types still writes `shipDate` to the creator's roster finding; the answer is
its own confirmation when the question says the dates are saved.
