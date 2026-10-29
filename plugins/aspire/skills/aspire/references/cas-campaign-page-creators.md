# CAS campaign page: Selected Creators and Content Review

Part of the CAS campaign reference. `cas-campaign.md` holds the state model, setup interview,
dispatch table, gate packets and flows, and its **1d** maps every part of the campaign page to
its file. A section named here without a file, such as **Gate 2** or **1e**, is in the file
that map gives.

### Selected Creators

Everyone under contract for the round in view, one card each, with the step they are on, what's
next or what we're waiting on, and what's still missing. Every figure is worked out live from the
records published into the page and the page data the viewer can read, and nobody sets a step by
hand. A step reached from page data (the shipping, footage, contract and payment records,
cuts and their calls) moves the moment it changes, in every open view. One reached from a roster
field (brief state, details, the fee) moves at the next publish, which follows every pull and
reply Claude records.

**Who's here.** A creator is on the tab for round {n} when both hold:

- **Approved for the round.** Priority Yes or Yes for round {n}: the call **What the row shows**
  counts on Creator Selection, else the roster's `slate` approved, or carried into the round
  (`returning`, **Rounds**, **Starting the next round**).
- **Fee agreed.** Their round {n} Status is Agreed (roster `rate` agreed). Whether a fee is
  agreed is a status both sides read; the amount follows **Who sees what**.

A creator approved but not agreed yet, or who declined, has no card: they stay in **Contract and
rates**, and one line under the cards names them, "{k} more approved, fees not agreed yet", with
a link Button "Contract and rates" to `#creators/r{n}/fees`. A creator who drops out after
agreeing (`rate` declined, or `slate` rejected on a newer roster finding) leaves the tab at the
next publish, which follows the pull or reply that recorded it.

In order: **Round totals**, the toolbar, the cards, then **Contract and rates**, **Shipping** and
**Brief and content**. The first three sit in the roster section (`creators-roster`).

#### Steps

Every card has one step out of 8. A creator's step is the highest step whose rule holds, so a
record that skips ahead (a package marked shipped before the contract record says signed) never
holds the card back. A creator with no step's rule holding is at step 0, "Not started". The
expanded list marks each step by its own rule, never as done because a later one holds, so it
never contradicts a cell. The rules read only records
and page data, never a field a person sets:

| # | Step | Reached when | With no record yet |
| - | ---- | ------------ | ------------------ |
| 1 | Contract signed | The creator's contract record for the round says signed (**Creator records**, Contract) | Step 3 (Fees approved) is cleared for the round and the round's **Contracts signed** step is done (**Rounds**, **Round steps**: ticked, or done once step 4 is sent), so every creator with an agreed fee reaches it together. A contract record set to Not sent or Sent wins over this |
| 2 | Product shipped | Product status is Shipped, Delivered or Kept last round's product, from the newer of the client's and the agency's `productStatus` by `at` (**Who sees what**), else the roster's `shipping.status` shipped, delivered or kept, else a `shipDate` on or before today. A product status of Not shipped, set later than the `shipDate`, wins over it. A pickup counts once its visit date is today or past. This is consistent with the calendar's shipping events (**Home**, **Calendar**, **Where every date comes from**), which read the shipping record's dates, else the same changes from the activity log: the step reads a field's current value, so a status set back to Shipped moves the step back while the calendar still shows the day it was marked delivered | Always has its record |
| 3 | Product delivered | Product status is Delivered or Kept last round's product, by the same reads, else a pickup whose visit date has passed | Always has its record |
| 4 | Shooting | Product delivered, and the creator's brief accepted or locked: roster `briefState` accepted, approved or locked, or their changed brief approved (**1g**) | Always has its record |
| 5 | Footage in and editing | At least one raw file in: the creator's footage record for the round (**Creator records**, Footage) counts 1 or more | Not reached on its own. A creator whose footage nobody records moves from Shooting to Cuts in review when their first cut arrives |
| 6 | Cuts in review | The creator has at least one cut in the round with a version (`reviews/cut-{net}-{handle}-r{round}-{variant}` with a version under `versions`, **1e**), the same cuts **Where we stand** counts as in | Not reached until the creator's first cut is added on Content Review (**Content Review**, **Adding a cut**) |
| 7 | Cuts approved | Every one of the creator's {v} variants for the round has a cut whose newest version is approved (**Variants per creator** below). Approved is read as the calendar reads it (**Home**, **Calendar**, **Where every date comes from**, Approved): the client's call that counts on that version (**Content Review**, **The status flow**, **The call that counts**). Step 7 ticks only when each of those approvals is from an account the CM confirmed as {brand}'s, so one showing "Aspire to confirm" holds it | Not reached while any of the {v} slots has no cut |
| 8 | Ads live | One of the creator's variants has a live post with matched spend in the page's results for the round (**Ad Performance**, **Reading the results**) | The round's **Ads live** step is done (the round is in market, **Rounds**, **Round steps**) and at least one of the creator's cuts is approved by an account the CM confirmed (step 7's rule), so a creator whose last variant is still in review isn't held back |

Product status Returned holds the creator at step 2 with the line "Package returned" and an
error Badge "returned" on the Shipping cell, until a new shipment is marked.

**Steps follow the records.** When a record that moved a creator on changes back (a delivery
marked by mistake and set back to Shipped), the step goes back with it, so the card always
matches what the records say now. Done rounds are read only (**Round switcher**),
so their steps no longer move.

**Variants per creator.** {v} is the program terms' variants per creator (`program/terms`
`variants`, else `package.variants` in `campaign:{slug}-cas`), at most 5, the same number **Where
we stand** plans with. **Files per creator.** {f} is the sum of the `count` of every deliverable
in the program terms' **What each creator makes** (`program/terms` `deliverable-{id}`, else
`sow.deliverables` in `campaign:{slug}-cas`), so a SOW of 3 hooks, 1 body, 2 CTAs and 15 B-roll
shots gives 21. Neither number is ever written into the page as a constant: an edit to the program
terms on Home changes every card at once. With no deliverables saved, the Footage cell reads "{x}
files in" with no total.

#### What we're waiting on

Under the step, one line in `text-sm`, worked out from the same records. The first that applies:

| When | Agency reads | Client reads |
| ---- | ------------ | ------------ |
| A question to the client is open (`yourCall`) | "Waiting on {brand}: {question}" | "Your call: {question}" |
| Step 0, the client asked for changes to the fees | "Waiting on Aspire to revise the fees" | the same |
| Step 0, fees approval (step 3 of the round) open | "Waiting on {brand} to approve fees" | "Waiting on your fee approval" |
| Step 0, fees approved | "Next: contract signed" | the same |
| Step 1, no address on the creator's profile and no pickup for the round | "Waiting on @{handle}'s shipping details" | the same |
| Step 1, an address saved but not confirmed for the round (a returning creator) | "Waiting on @{handle} to confirm their address" | the same |
| Step 1 | "Next: ship {product}" | the same |
| Step 2 | "On the way: {carrier} {tracking} · ETA {eta}" (with "estimated" after a Mark shipped estimate), leaving out what isn't recorded, or "On the way" | the same |
| Step 3 (Product delivered), a changed brief waiting on the client (Gate 4b open) | "Waiting on {brand}'s call on @{handle}'s brief changes" | "Your call on @{handle}'s brief changes" |
| Step 3 (Product delivered), step 4 of the round (briefs approved) not cleared | "Waiting on {brand}'s brief sign off" | "Waiting on your brief sign off" |
| Step 3 (Product delivered), briefs approved, brief not sent to the creator yet (no `briefState`) | "Next: send @{handle} the brief" | the same |
| Step 3 (Product delivered), brief sent, not accepted | "Waiting on @{handle} to accept the brief" | the same |
| Step 4 | "Shooting · shoot by {date}", or "Shoot by date passed {d} days ago" | the same |
| Step 5 | "Editing · {x} of {f} files in" | the same |
| Step 6, cuts waiting on the client | "{n} variants waiting on {brand}" | "{n} variants waiting on you" |
| Step 6, otherwise | "{c} variants getting changes · {k} of {v} in" | the same |
| Step 7 | "Next: ads go live {launch}" | the same |
| Step 8 | "Ads live" | the same |

A cut waits on the client when its status is Needs client review: its newest version was sent to
{brand}, with no call on it or its approval undone (**Content Review**, **Statuses**). The agency also sees, in
`text-xs text-muted-foreground` under the line, the roster's `waitingOn` and last contact from
`agency/creator-*`, and "Final 50% due: final cuts signed off" for a creator at 50% paid who has
reached step 7 (every variant's cut approved, the final cut sign off the payment label means), never shown to the client.

#### Round totals

Tiles in `grid grid-cols-2 gap-4 lg:grid-cols-5` for the agency and `grid grid-cols-2 gap-4
lg:grid-cols-4` for the client, each a value in `text-2xl font-semibold` and one line in `text-sm
text-muted-foreground`. They cover the round in view and the creators on the tab:

- **Creators**: "{n}", with "{r} returning · {w} new".
- **Fees**, agency only, read from `agency/budget` and each creator's `agency/creator-*`
  document, so it never renders for the client or in **Preview as client**: the round's agreed
  fees with their allowlisting uplift, "{x} agreed this round", then the campaign's Committed
  against the budget total, "{committed} of {total} committed across every round", the same
  figures as Creator Selection's **Summary**, with a Progress bar of committed over the total and
  the warning Badge "Over budget" when it is over. With no total saved: "No budget set".
- **Shipping confirmed**: "{d} of {n}" delivered, picked up or keeping last round's product,
  with "{s} on the way · {k} not shipped".
- **Variants delivered**: "{x} of {y}", {y} being the creators on the tab times {v}, {x} their
  cuts with a first version (the calendar's **Cut delivered**), with a Progress bar.
- **Variants approved**: "{a} of {y}", with "{x} delivered", a variant counting as approved by the
  step 7 rule.

A round with no creators on the tab shows the tiles at 0 with
"Creators show here once {brand} approves them and their fees are agreed."

#### The toolbar

One row above the cards that wraps on a phone:

- **Search**, an Input "Search creators": name, handle, concept, persona, product and city,
  ignoring case and accents.
- **Stage**, a Tabs list with a count on each: All, Needs info, Before the shoot, Content in,
  Live. Needs info is a creator with at least one detail to add as this viewer counts them (below),
  or whose details from creator aren't received. Before the shoot is steps 0 to 4, up to and
including Shooting, since no footage is in yet, Content in steps
  5 to 7, and Live step 8. All holds every card and Needs info overlaps the rest; Before the shoot, Content in and Live
  don't overlap and add up to All. On a
  phone the list scrolls sideways like the tabs.
- **Products**, one chip per product in scope, then "No product", as Creator Selection's toolbar
  builds them (`secondary` with `aria-pressed="true"` when pressed, several at once, each with its
  count).
- **Expand all cards** and **Collapse all cards**, ghost Buttons size sm with the Lucide
  `chevrons-up-down` and `chevrons-down-up` icons. They open or close every card in view and
  nothing else, and are not the tab's **Expand all**, which opens sections.
- The count line in `text-xs text-muted-foreground`: "{n} of {m} creators", with a ghost Button
  "Clear filters" while a filter or search is set. Nothing matches: "No creators match." with
  "Clear filters".

The cards open sorted by step, lowest first, then by name, so the creators furthest behind come
first. Filters, search and which cards are open are kept in memory while the page is open, never
in page data or browser storage. The client's toolbar never searches or filters on an agency only
field.

#### The card

One Card per creator in `grid grid-cols-1 gap-4`, anchored `#creators/r{n}/{net}-{handle}`. A link
to that hash opens the card expanded and scrolls to it.

- **Header**: Avatar, handle, name, the concept chip in its chart series, the persona and the
  product, then the chips: a soft Badge "Returning" or "New", the missing details chip (below)
  when there are any, and the Status Badge. A creator carried in names the round they came from:
  "Returning from round {m}".
- **Step**: "Step {n} of 8 · {step}" in `text-sm font-medium`, a Progress bar of {n} over 8 with
  `role="progressbar"`, `aria-valuenow` {n}, `aria-valuemax` 8 and `aria-label` "Step {n} of 8,
  {step}", then the waiting on line. Step 0 reads "Step 0 of 8 · Not started". Under it, the
  newest status update's line, and for the agency the outline Button **Update {brand}**
  (**Status updates** below), both on the closed card too.
- **Cells**, in `grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:grid-cols-7`, each a label in
  `text-xs text-muted-foreground` over its value in `text-sm`:

  | Cell | Shows | From |
  | ---- | ----- | ---- |
  | Contract | Not sent, Sent, or Signed {date}, for the client once the fees are sent | The contract record (**Creator records**); with none, "Contracts signed for the round", with no date, once step 1 holds by its fallback, else "Not recorded yet" |
  | Payment | Invoice sent, 50% paid, Paid in full or On hold, with its date, for both sides once the fees are sent; for the agency only, the amount paid so far of the contracted total ("{paid} of {total} paid") | The payment record (**Creator records**); with none, "Not recorded yet" for the agency and "Not due" for the client |
  | Shipping | Product status Badge, and the carrier and tracking as a link when there is one, with the ETA while on the way | **Shipping** |
  | Ship to | City and region, or "Pickup {visit date}", with "Confirmed" or "Not confirmed for round {n}"; "Not received"; for a creator whose product status is Kept, "Kept last round's product", with no confirmation Badge | The creator's profile and the round's ship to (**Creator records**) |
  | Footage | "{x} of {f} files" | The footage record (**Creator records**); with none, "Not recorded yet" |
  | Variants | "{k} of {v} in · {a} approved" | The round's cuts (**Content Review**) |
  | Shoot by | The creator's shoot by date, with "{d} days left" or "{d} days late" from step 4 until step 5 | `shootBy` on `edits/creator-{net}-{handle}-r{round}`, an agency edit; else the round's **First cut review** step date, labelled "First cut review"; else "Not set" |

  Each cell's value carries its source tag (**Creator records**, **Where each value came from**).
  A value worked out from something else (the contract's fallback, a shoot by date from the round's
  steps) has no tag, and its Tooltip names what it was worked out from.
  On a phone the cells are two columns, never one row that scrolls.
- **Expand**: a ghost Button size sm, "Details" with the Lucide `chevron-down` that turns up while
  open, on a `button` with `aria-expanded` and `aria-controls`. It is the card's own control, not a
  Collapsible section (**Collapsing sections**, **No nesting**). Open, the card adds:
  - **The 8 steps** as a list: each with a soft Badge "Done" when its own rule holds, a processing
    Badge "Now" on the card's step, a soft "Up next" on the one after it, and a soft "Not done" on
    an earlier step whose own rule doesn't hold (a contract still out while the package ships), the date it was reached where its record holds one (signed,
    shipped, delivered, first file in, first cut, all approved, live), and a Tooltip on the date
    saying which record it came from ("From the shipping status, marked by {name} {time}"). A step
    whose record has nothing in it yet shows "Not recorded yet" under it.
  - **Details to add**: each missing detail as a row with its fix (below).
  - **Concept and variant plan**: the concept and persona Selects, the product, the brief's hooks,
    CTAs and selling points for the concept, and, for the agency only, the variant plan with its
    overrides (**Concept and variant plan** below); then the brief state, content state and
    content folder.
  - **Shipping**: the three step timeline, the shipping record and its controls, as in
    **Shipping** below, for this creator.
  - **Footage**: one row per deliverable in the program terms, "{label}: {x} of {count}", each
    count edited in place by the agency, and the shoot by date (**Creator records**, Footage).
  - **Contract and payment**: the contract status and signed date, and the payment status with its
    date, edited in place by the agency (Selects); the client reads both as labels once the fees
    are sent.
  - **Variants this round**: "{k} of {max} variants this round", {max} being {v}, then one cut
    tile per variant V1 to V{v}, each playing the latest cut of its variant in place, with its
    status, open comments and **Open in review** (**Cut tiles** below). A creator at {max} shows
    no way to plan or add another variant for the round.
  - **Updates to {brand}**: the round's status updates on the creator, newest first (**Status
    updates** below).
  - For the agency only, under a dashed rule headed "Agency only": the offer (open, target, max),
    counters and agreed, the round's rate per deliverable (UGC video, Reel collab, 90 day usage),
    the contracted total and the amount paid so far, expected cost, cost per 1K reach, waiting on,
    last contact; the creator's profile (**Creator records**, Profile): email, phone, manager,
    the full address and the delivery note, each edited in place, with an outline Button size sm
    **Copy email** and one **Copy shipping label** (**Copy buttons**); the reply log, newest
    first, one line each with its date and summary; and the email drafts for the creator (offer,
    counter, accept, chase, details, brief), each with its template, subject, whether and when it
    was sent, and a ghost Button "Copy draft". Drafts are written and sent from the chat
    (`rates-and-terms.md`, **Drafts**, **1f**), never from the card.

#### Details to add

A warning Badge "{n} details to add" in the card's header counts what is missing out of five:

| Detail | Missing when | Counts for | Its fix opens |
| ------ | ------------ | ---------- | ------------- |
| Name | No name on the creator's profile (`creators/{net}-{handle}` `name`, else the roster's `name`) | Both sides | The name, edited in place by the agency |
| Email | No email on the creator's profile | Agency only | The email, edited in place under "Agency only" |
| Phone | No phone on the creator's profile | Agency only | The phone, edited in place under "Agency only" |
| Address | No address on the creator's profile (its `shipArea` for the client, which the same save writes) and no pickup with a visit date for the round | Both sides | The address under "Agency only" for the agency; for the client, the creator's row in **Shipping**, which says the address comes from the creator's reply |
| Rates | Any of the round's three rates per deliverable (UGC video, Reel collab, 90 day usage) missing | Agency only | The creator's row in **Contract and rates** |

Email, phone and rates are agency only (**Who sees what**), so the client's chip counts name and
address only, and a client never learns that an agency only detail is missing. The chip is a
button that opens the card at **Details to add**. With nothing missing, there is no chip. The
roster's summary line counts creators with any detail to add, as the viewer counts them.

Contact details and the address saved on the card are stamps on the creator's profile (**Creator
records**), pulled into the roster's `contact` and `details` by **Pulling decisions**. Rates are
recorded in the chat (**Rates and terms**), never typed on the card, because they set the offers.
An address confirmed for an earlier round still counts, so a returning creator never shows
Address as missing; whether it is confirmed for this round shows on Ship to and in the waiting on
line instead.

#### Creator records

What the cards, **Shipping** and **Contract and rates** read and edit for each creator. Every field
is a stamp (**1e**, **Every editable value**), saved on its own, and none is ever filled in by
guessing: a field nobody recorded stays empty and shows "Not recorded yet" (or "Not received" for
an address), never a value that looks real. Claude writes one only from a record it read or a
reply the CM pasted, and the page only from what a person typed or clicked.

**Profile, one per creator, kept once and reused every round.** It sits on documents with no round
in their path, so a creator carried into round {n+1} shows the same profile with nothing retyped:

| Field | Kept in | Who reads it |
| ----- | ------- | ------------ |
| Name | `creators/{net}-{handle}` `name` | Both sides |
| Email, phone | `agency/creator-{net}-{handle}` `email`, `phone` | Agency only |
| Address | `agency/creator-{net}-{handle}` `address`, `{line1, line2, city, region, postal, country}`, written whole | Agency only |
| Delivery note | `agency/creator-{net}-{handle}` `deliveryNote` | Agency only |
| Where it ships | `creators/{net}-{handle}` `shipArea`, `{city, region, country}`, copied from `address` with the address stamp's `at` | Both sides |

Page data has no transactions, so an address save writes `address` first, then `shipArea` with
the same `at`. Whenever the Editor's page or a publish finds the two with different `at`s (a
write that failed between them, or two Editors saving at once), it rewrites `shipArea` from
`address`, so the city the client reads always follows the street the agency saved.

In Atlas the profile is the roster's `contact` and `details` (**1a**), which **Starting the next
round** carries into the new round's roster, so the page and Atlas agree in every round.

**Per round**, on `edits/creator-{net}-{handle}-r{round}` unless named otherwise:

| Record | Fields | Who edits |
| ------ | ------ | --------- |
| Contract | `contract`, `{status, signedAt}`: `status` not-sent, sent or signed, read as Not sent, Sent and Signed; `signedAt` the signed date | Agency, a Select and a date Input |
| Rates | `rate-ugc`, `rate-reel`, `rate-usage90` on `agency/creator-{net}-{handle}-r{round}`, the round's three rates per deliverable, copied by Claude at each publish from the round's roster `rates`, which the chat writes when they are recorded (**Rates and terms**). A page from before kept them on `agency/creator-{net}-{handle}`: they read as the newest round's when its own document has none, and the next publish writes them there | The chat only |
| Contracted total | Not stored: the agreed fee plus its allowlisting uplift, as **Totals** gives it (`rates-and-terms.md`, **Contract and rates**) | Nobody; worked out |
| Payment | `payment`, `{status, at, paidPct}`: `status` invoice-sent, half-paid, paid or on-hold, read as Invoice sent, "50% paid, the rest on final cut sign off", Paid in full and On hold; `at` its date; `paidPct` 0, 50 or 100, set with the status (an On hold keeps the one before it). The amount paid so far is `paidPct` of the contracted total, worked out on the Editor's page, so no amount is stored. `paidPct` is client readable and tells the client only whether half was paid before an On hold, never an amount | Agency, a Select; shown and saved only once the fees are sent |
| Ship to | `shipTo`, `{kind, confirmed, visitDate}`: `kind` home or pickup; `confirmed` true once the address is confirmed for this round; `visitDate` for a pickup. Never any part of the address | Agency; Claude from the details reply |
| Shipping | `productStatus` (not-shipped, shipped, delivered, returned or kept), `item` (what was sent: the round's product and its options, from the details reply), `shipping` (the carrier), `tracking`, `shippedAt`, `deliveredAt`, `eta` (typed only), `etaEstimate` (from **Mark shipped**), each its own stamp, on both `client/creator-{net}-{handle}-r{round}` and this document | Both sides; the newer `at` wins per field (**Who sees what**) |
| Footage | `footage`, `{counts, at}`: `counts` the raw files received per deliverable, keyed by the program terms' deliverable ids (`{"hooks": 2, "broll": 9}`), `at` the newest file's date. {x} sums the counts, each capped at its deliverable's own count, so {x} never passes {f} | Agency, one number Input per deliverable |
| Shoot by | `shootBy`, a date | Agency |

At each publish Claude writes the profile and the round's records from the roster's `contact`,
`details`, `contract`, `payment`, `footage` and `shipping`, stamped `atlas`, and leaves a newer
edit made on the page as it is (**1e**, **Claude's writes**). For the shipping record, which
both sides write, Claude compares with the newer of the client's and the agency's stamps for each
field and skips the write when that one already holds the value, so a client's tracking number
pulled into Atlas keeps reading "Edited by {name}". A roster field with no value writes nothing.

A footage count past its deliverable's count is saved as typed and shows a warning Badge "More
than planned", so a creator who sent extra B-roll is never cut back on the page. Until each record
is written, its cell reads as **The card** says.

**Mark shipped and Mark delivered.** On each creator's row in **Shipping** and on the open card,
for both sides while the round isn't done or closed early (**Rounds**):

- **Mark shipped**, an outline Button size sm, while the product status is Not shipped or empty
  and the creator isn't picking up. One click saves product status Shipped, `shippedAt` today and
  `etaEstimate` four days after today in one `update` of the three keys on the viewer's own
  document, and logs one `status` entry (**The activity log**). The estimate is its own key and
  never touches `eta`, which holds only a date someone typed (the carrier's own ETA). The page
  shows `eta` from either side when there is one, else the estimate as "ETA {date}, estimated".
  It is the one date the page works out on its own, and it always says so.
- **Mark delivered**, an outline Button size sm, while the status is Shipped; for a pickup it
  reads **Mark picked up** and shows from the visit date. One click saves Delivered and
  `deliveredAt` today, and logs one `status` entry.
- **Kept last round's product**, a ghost Button size sm, only for a returning creator with
  nothing shipped this round. It saves product status Kept, with no dates, and logs. The steps
  read it as delivered (**Steps**), and the round's shipping tile counts it as confirmed.

"Today" is the viewer's own date. Either side can change a date or the status afterwards, in
place; a mistake is fixed by editing it, which logs too.

**The shipping timeline.** Three steps, in a row from `sm` and stacked on a phone: Address
confirmed, Shipped, Delivered (for a pickup: Pickup set, Picked up). Each is done (a success
Badge with its date and source tag), now (processing), or not yet (soft). Address confirmed is
done when `shipTo` `confirmed` is true for the round; Shipped and Delivered follow the product
status and their dates. Kept shows one line, "Kept last round's product", and Returned shows the
error Badge "returned" on Shipped.

**Copy buttons.** On the card's agency only block, for the agency only:

- **Copy email** copies the creator's email address. With none it is disabled, with "No email
  yet".
- **Copy shipping label** copies the label as plain lines, leaving out any empty one: name,
  address line 1, address line 2, city, region and ZIP or postal code, country, phone, delivery
  note. With no address it is disabled, with "No address yet". It is agency only because the label
  holds the street and phone, which the client never reads (**Who sees what**, **Addresses**), and
  the client needs neither to update shipping.

Both copy to the clipboard and show "Copied" for two seconds. Neither writes page data or the
activity log, so no address or email ever lands in a log line.

**Where each value came from.** Every value on a card, in **Shipping** and in **Contract and
rates** shows a source tag after it: a soft Badge in `text-xs`, from its stamp's `source`, one
list for the whole page:

| `source` | Tag |
| -------- | --- |
| `manual` | Edited by {name} |
| `atlas` | Synced from Atlas |
| `sheet` | Sheet |
| `claude` | Claude |
| `file` | From {file label} |

Hovering or tapping it shows the full line with the time (**Editing in place**). There is no Demo
tag: the page ships no sample data, so no value is ever one. A value from a page from before with
no `source` shows no tag. Claude stamps a value `atlas` whenever it comes from an Atlas record or
from a details reply the CM pasted, which Claude records in Atlas first (**1f**), so an address,
pickup or option from the reply reads "Synced from Atlas". A tag on an agency only value is agency
only with it.

#### Concept and variant plan

What a creator shoots and how it becomes {v} variants this round, tied to the round's Master
Brief. Nothing here is typed as free text: the concept, persona, hooks, CTAs and selling points
are read from the brief, and each variant's framework, length, hook and CTA come from the
concept's variant plan unless an Editor overrides them for this creator. On the open card it sits
after **Details to add**, as a block headed "Concept and variant plan".

**Concept and persona.** The Concept and Persona Selects from **Creator Selection** (**The match
score**, **Concept and persona**), the same two Selects on the same stamps (`concept` and `persona`
on `edits/creator-{net}-{handle}-r{round}`), never a second mapping. So the match score, the
card's header chip, this block and the variant plan always name the same concept and persona, and
a change in either tab shows in the other at once. The concept's choices are the round's live
concepts (not removed, not deferred); the persona's are that concept's personas. The client reads
both as labels. The product sits beside them, as the card already edits it.

**From the brief, by reference.** Under the Selects, read live from `briefs/{lane}-r{round}` for the
creator's concept, never copied onto the creator:

- the positioning line;
- the hooks, H1 to H3, each with its type as a soft Badge and its line in quotes;
- the CTAs, C1 and C2, each with its type and line;
- the selling points, one line each.

A link Button "Open in the brief" goes to `#brief/r{n}/{lane}`. Both sides read this part, since
the client reads the brief. An edit to a hook, a CTA or a selling point in the brief shows on
every card on that concept the moment it is saved, with nothing to republish. A part the brief
has removed doesn't show here; a part still blank in the brief shows as its bracketed blank. A
creator with no live concept shows the agency the warning Badge "Needs a concept"; the client sees
no part of the brief for them.

**The variant plan, agency only.** Under a dashed rule headed "Agency only", a Table of V1 to
V{v}, {v} being the program terms' variants per creator (**Variants per creator**), at most 5.
Columns: Variant, Framework, Length, Hook, CTA, Live post, and From. On a phone it is a stack of Cards, one
per variant, with the same fields (**Responsive**, **Tables**).

| Column | Shows | Editor's control |
| ------ | ----- | ---------------- |
| Framework | Code and name, "BAB Before, after, bridge" | A Select of the campaign's frameworks |
| Length | "15 seconds" | A one line Input |
| Hook | Number and type, "H2 Demo first", with the line in `text-xs text-muted-foreground` under it, read from the brief | A Select of the concept's hooks |
| CTA | Number and type, "C1 Direct", with its line under it, read from the brief | A Select of the concept's CTAs |
| Live post | The Instagram post the variant's partnership ad runs, as a link, with "No ad found for this post yet" in `text-xs text-muted-foreground` when the last read matched nothing to it, or "Not live yet" | An Input for the post's link (**Ad Performance**, **Where the results come from**) |
| From | A soft Badge "Brief" when every field in the row follows the concept's plan, else a warning Badge "Override". The live post isn't part of the plan and never makes a row an override | None |

How each field is read, the same rule everywhere the variant is shown (**Reading a creator's
variant**, below):

1. The creator's own override for that field and variant, when it was made for the creator's
   current concept.
2. Else the concept's variant plan in `agency/brief-{lane}-r{round}` (`v{n}-framework`,
   `v{n}-length`, `v{n}-hook`, `v{n}-cta`).
3. Else empty: "Not planned", with a ghost Button "Plan it in the brief" to the concept's variant
   plan.

So a creator's card follows the brief until an Editor overrides it, and only that field of that
variant stops following. A hook is referenced by its number, so an override that picks H3 still
shows H3's current line: editing H3 in the brief updates that card too. What an override stops is
the brief's choice of which hook, CTA, framework or length the variant uses.

**Overriding.** Framework, Hook and CTA are Selects whose first option is the brief's own value,
"Brief: H1 Question". Picking anything else saves an override; picking the brief's option clears
it. Length is an Input whose placeholder is the brief's length: typing other text saves an
override, and emptying it, or typing the brief's own text, clears it. The ghost Button "Use the
brief's" beside an overridden cell clears it too. Clearing writes the stamp with `value` `null`. An overridden cell shows the warning Badge "Override" with
a Tooltip "The brief says {value}. Changed by {name} {time}." and its source tag (**Where each
value came from**). VO, B-roll and the note aren't overridden per creator: they follow the brief's
V{n}, shown read only under the row ("VO and B-roll follow the brief's V{n}") with "Open in the
brief". Overrides are agency edits and log to the agency log (**The activity log**).

Overrides are kept on `agency/creator-{net}-{handle}-r{round}`, one stamp per field per variant:
`v{n}-framework` (`{lane, code, name}`), `v{n}-length` (`{lane, text}`), `v{n}-hook` and `v{n}-cta`
(`{lane, n}`). The `lane` is the concept the override was made for. A key with no stamp, or a
stamp whose `value` is `null`, means the field follows the brief. The live post is kept beside them
as `v{n}-post` (`{lane, url, igMediaId}`), `lane` the concept the variant was cut for; it is a fact
about the variant, not an override, so a concept change doesn't clear it and it never carries to
another round.

**At most 5 variants.** The Table has exactly {v} rows and no way to add one. A brief plan longer
than {v} applies only its first {v} variants to the creator. An override for a variant past {v}
or past 5 is never shown or read, and **Pulling decisions** drops it and names it (**Creator
profiles and per round edits**).

**When something changes under the plan:**

| Change | What the card does |
| ------ | ------------------ |
| A hook's or CTA's text, or a selling point, edited in the brief | Shows the new text on every card on the concept, overridden or not, since every card reads it by number |
| The concept's variant plan changed (V2's hook moved from H1 to H2) | Every creator without an override on that field follows it. One with an override keeps theirs, and its Tooltip adds "The brief now says H2 Demo first", so the Editor can choose "Use the brief's" |
| A hook or CTA removed from the brief (its stamp `null`), while an override or the brief's plan names it | The cell shows the number struck through with a warning Badge "Broken", "H3 was removed from the brief", and the row's From reads "Broken". It never falls back to another hook or CTA, and Content Review and Ad Performance show the same Badge. For the agency the card's header adds a warning Badge "Plan broken" until it is fixed |
| A framework renamed or changed in **Frameworks** | Nothing: a variant keeps the code and name it was given, as the brief's plan does (**Frameworks**) |
| The creator's concept changed (here or on **Creator Selection**) | The Select first opens a Dialog when the creator has overrides: "Change @{handle} to {concept}? Their {k} variant overrides were made for {old concept} and are cleared." Confirming writes the concept, the persona stamp as `null` (as **The match score** says), and a `null` stamp for each override. The plan then follows the new concept's brief. An override whose `lane` isn't the current concept (a concept moved by a pull, say) is never applied: it shows under the Table as "Made for {concept}", with "Clear", until cleared |
| The concept removed or deferred | Can't happen while the creator is on it: **Remove concept** and **Defer to next round** are disabled while any approved creator in the round is on it. A concept that leaves the round another way (a reset, a restored version) moves the creator to the next live concept **The match score**'s rule finds, else to "Needs a concept", where the plan shows no rows. Either way the overrides are kept and listed as "Made for {concept}", and nothing is read from them until the creator is on that concept again or they are cleared |
| The brief reset, restored, imported or rewritten by a brief run | The concept's plan changes as any brief edit does. Creator overrides are not part of the brief and are never reset, restored or nulled with it |
| The round's brief signed off and locked (**Comments and sign off**, **The locked brief**) | The brief's text is a label for everyone, so no hook, CTA or selling point changes under a card. The variant plan stays editable for the agency, as the brief's own plan does, and so do the overrides: they are Aspire's cut plan, which the client didn't sign. The concept and persona stay editable on the live concepts |
| A cut already in for the variant (**Content Review**) | Changing that variant's framework, hook or CTA here first opens a Dialog: "V{n}'s cut was made with {old}. Change the plan anyway?" (Master Brief asks the same for the brief's own plan, **The variant plan**.) When a version is added, the page saves the plan it was made with, `plan-v{version}` in `agency/cut-{cut}` (**1e**). Whenever the plan read now differs from the newest version's record, from a card, a brief edit or a pull, the cut shows the agency a warning Badge "Plan changed since this cut", until a newer version is added. A version from before has no record and shows no Badge |
| The round done | The whole block is a label (**Round switcher**) |
| A new round | Overrides are per round and never carry. A returning creator starts round {n+1} on the new brief's plan for their concept, with no overrides |

**Under the brief's own plan.** Below each concept's variant plan on Master Brief, for the agency,
one line: "{k} creators have their own plan for this concept", counting creators on the concept
with an override made for it ("Made for" overrides held for another concept don't count), each
handle a link to their card's block, so an Editor changing the brief's plan sees who won't follow it.

**What the client sees.** The concept and persona as labels, the product, and the brief's
positioning line, hooks, CTAs and selling points, all of which they read in the brief already.
Not the variant plan: no framework, length, hook or CTA per variant, no override, and no "Broken"
Badge. Their **Variants this round** shows V1 to V{v} with each cut's status only. The plan and
the overrides live only in `agency`, so neither the page itself nor any client readable document
holds them (**Who sees what**; **1e**, **Checking the roles**).

**Reading a creator's variant.** Content Review and Ad Performance name a variant's framework, hook
and CTA by reading them through this block's rule, never from a copy, so all three tabs agree:

1. Take the concept the cut was made for, its `lane:` in `reviews/cut-{cut}`; on Ad Performance,
   the live post's `lane`, else the cut's. A cut with no
   `lane:` takes the creator's concept for the round, as **The match score**'s **Concept and
   persona** resolves it.
2. For variant {n} (from the cut's `variant:`), read each field by the three steps above for that
   concept: an override counts only when its `lane` is that concept, else the concept's plan.
3. Show a hook or CTA as its number and type with its line from `briefs/{lane}-r{round}`, and a
   removed one as "Broken". Show the framework by its code and name.
4. When the cut's `lane:` isn't the creator's current concept, show the agency a warning Badge
   "Cut for {concept}" beside the labels, so an old cut keeps the hooks it was made with and is
   never counted under the new concept's.

The read needs `agency`, so it runs only on an Editor's page. A client view of either tab shows no
per variant hook, CTA or framework. Showing one would need a client readable copy Claude writes at
publish and a new **Who sees what** row; the page never copies agency data into client readable
data on its own. Ad Performance's ranked variants and its
**Compare** by framework, hook and CTA group by these same read values.

**In Atlas.** **Pulling decisions** writes the creator's overrides to their round's `roster`
finding as `variantPlan` (**1a**), one entry per overridden field with that stamp's own writer and time, and names them in the picker
("@{handle}: V2 hook H3 in place of the brief's H1, by {name}"). At each publish Claude writes them
back from `variantPlan` stamped `atlas`, leaving a newer page edit as it is (**1e**, **Claude's
writes**), and never nulls a page stamp `variantPlan` doesn't hold, so a "Made for {concept}"
override stays until an Editor clears it. A concept change recorded in the chat follows the
page's rule: when the creator has overrides made for the old concept, the picker names them
("@{handle}'s 2 variant overrides were made for {old concept} and are cleared"), and the next
publish writes a `null` stamp for each. Only the page and that confirmed change clear an override;
no other chat flow writes one. The brief agent writes the concept's plan, never a creator's override.

#### Cut tiles

The open card's **Variants this round** shows the latest cut of each of the creator's variants
side by side, so anyone can watch all of them in one place and jump into review. The card is
anchored `#creators/r{n}/{net}-{handle}/cuts` at this block.

**How many tiles.** One per slot in the creator's variant plan, V1 to V{v}, {v} being the program
terms' variants per creator (**Variants per creator**), at most 5: the same slots Content Review
shows for the creator (**Content Review**, **Whose cuts are here**, **Slots**). An edit to the
program terms on Home changes the tiles at once. A cut "Past the plan" shows after the slots with
that warning Badge, as on Content Review.

**Which version a tile plays.** Exactly the version Content Review's row shows the same viewer as
the cut's latest (**Content Review**, **The queue**, **What the client sees**), read the same way
and never copied:

| Viewer | The tile plays | Read from |
| ------ | -------------- | --------- |
| Agency, and Preview as client is off | The cut's newest version, in whatever status | `latest:` on `reviews/cut-{cut}` (its `version` and `file`) |
| Client, and **Preview as client** | The newest version sent to {brand}. A version still in Aspire QA never plays on a client's tile: the tile shows the version sent before it, with "Version {s} · Aspire is checking version {k}" under it, and a cut with no version sent reads "Aspire is checking this cut" and doesn't play | `latest:` when its `sentAt` is set; otherwise the cut's `versions`, read once when the card opens and again whenever `latest:` changes, taking the highest version with `sentAt:` |

`latest:` arrives through the `reviews` subscription the page already holds (**1e**, **Live
updates**), so a new version, a send or a swapped file changes the tile in every open view with
no reload. When `latest:` and the versions disagree, the versions win, as on Content Review. When
the version a tile should play changes while it plays, the tile stops, loads the new version at
0:00 and updates its version Badge, so no tile ever plays a version Content Review doesn't show as
latest for that viewer.

**What each tile shows**, top to bottom:

- **The video**, in a 9:16 box (**Component classes**, Cut tiles). For an uploaded cut, a `video`
  element from `"/_blob/" + asset`, with `playsinline` and `preload="metadata"`, showing its frame
  at 0.5 seconds (`#t=0.5`) until played. A Play Button over it plays it in place. The first
  play, and a play after the cut ended, starts from 0:00 (the page sets the time to 0 first, since
  the frame shown sits at 0.5 seconds); a play after Pause goes on from where it paused. While it
  plays the tile adds Pause and a Sound toggle (Lucide `volume-2` or `volume-x`), each a ghost
  icon Button with its `aria-label` and Tooltip. Sound comes from one tile at a time: turning it on
  for one turns it off on the others, as **Compare** does. The tile has no scrubber, frame steps,
  speed, safe zone or drawing; those are the review panel's (**The player**).
- **V{n}** in `text-sm font-medium`, the version as a soft Badge "Version {k}" (for the client,
  the newest sent), and the stage as text ("Second cut").
- **The status Badge**, by **Content Review**, **Statuses**, for that viewer: the same Badge the
  creator's dot and row show. For the agency, "Aspire to confirm" beside it when the cut's
  approval is waiting on the CM (**The status flow**, **The call that counts**).
- **Open comments**: the Lucide `message-square` and "{k} open", or "None": the open threads on
  the tile's version the viewer can read, the same count as Content Review's Comments cell (the
  agency's includes agency only threads).
- **Open in review**, a link Button to `#review/r{n}/{cut}/v{k}`, {k} being the tile's version,
  opening it pauses the tile first, then builds the link from the tile's time, adding
  `/t{seconds}` once the viewer has played the tile past 0.5 seconds, whether it was playing or
  paused. So the review panel opens on the same frame (**Header and tabs**), and a tile never
  played opens it at 0:00. For the client on a cut with no version sent to
  them, it goes to `#review/r{n}/{net}-{handle}` instead, the creator's tab, since that cut doesn't
  open for them (**Content Review**, **What the client sees**).

**An empty slot** shows the dashed box with the Lucide `clapperboard` icon and the soft Badge "Not
cut yet", as Content Review names it. For the agency in the current round, a link Button "Add cut"
goes to `#review/r{n}/{net}-{handle}`, where **Add cut** is (**Content Review**, **Adding a cut**).
The client sees "Not cut yet" only.

**A linked cut** (Google Drive, Frame.io or another link) can't play in the page (**Content
Review**, **Adding a cut**, **Who can play what**). Its tile shows the box with the Lucide `film`
icon and "Plays in Google Drive", "Plays in Frame.io" or "Plays outside this page", an outline
Button "Open in Google Drive", "Open in Frame.io" or "Open link" that opens the link in a new tab
(`rel="noopener"`), and **Open in review** under it as on any tile. It has no Play, Pause or Sound.

**Who can play an upload.** Only people in the organization that published the page can open its
uploads. So:

- **The agency and a client inside the organization** shared as Contributor play every uploaded
  tile their side may see.
- **A client approver from outside the organization**, or anyone the page treats as a read only
  client, reads no page data, and cuts live only there (**What the client sees** under Content
  Review). For them the block shows one line in place of the tiles: "Cuts show here for people who
  can open this page's data. Ask {CM name} for access." No tile, poster or count renders.
- **An upload that can't load** (removed, or the browser refuses it) shows the `film` icon and
  "This cut can't play right now. Ask {CM name} for a link.", with **Open in review** still there.

**Loading.** A card's tiles get their `video` elements, all of them at once, when the card is
open and its row of tiles comes within one screen of the window (an `IntersectionObserver` on the
row, against the window, with a margin of one screen), with `preload="metadata"`; until then each
box shows a Skeleton. The row is watched as a whole, so tiles scrolled out of sight inside the
phone's sideways row load with the rest and **Play all** reaches every one. So **Expand all
cards** on a round of 20 creators loads the cards in view, not a hundred videos at once. Once
added, a tile's element stays. A playing tile stops when its whole row leaves the window, never
for scrolling sideways inside the row.

**Phone and desktop.** Under 640px the tiles are one row that scrolls sideways, each tile 10rem
wide and snapping into place, with the next tile's edge showing so the row reads as one that
scrolls. The row is a focusable region labelled "Cuts for @{handle}, V1 to V{v}", so the keyboard
scrolls it too. From 640px the tiles wrap in a grid, three across, and five across from 1024px.
The page itself never scrolls sideways (**Responsive**).

**Play all.** Above the tiles, while two or more tiles can play, an outline Button size sm "Play
all" with the Lucide `play` icon sets every playable tile to 0:00 and plays them at once, with no sound, and
turns into "Pause all". A tile's own Sound toggle then picks the one to hear.

Nothing a tile does writes page data or logs: playing, pausing and sound are the viewer's own,
kept in memory for the visit, so tiles work the same in a done round and in **Preview as client**.
The calls, sends and comments are made in the review panel, never on a tile.

#### Status updates

The agency tells {brand} where a creator stands without leaving the card. An update is a note for
{brand} on the creator, tagged to the client side, so it lands in the client's inbox on the page
and goes no further unless the CM sends it on from the chat.

**The Button.** **Update {brand}**, an outline Button size sm with the Lucide `send` icon, on every
card, for the agency only, in the round in view while it is the current round. It never renders
for the client, in **Preview as client** or in a done round. It opens a Dialog "Update {brand} on
@{handle}":

- **Who**, a Select: "Client" first ("Everyone approving for {brand}"), then the people on
  {brand}'s side the page knows (**Tagging**, **Which people are listed**). It sets the tag at the
  start of the text. Changing it replaces that leading tag only while it is still the one the
  Select put there; once the Editor has changed or removed it, the Select leaves the text alone and
  says "Edit the tag in the text." under it, so no second tag is added and nothing typed is lost.
  Who gets the update is always the tags in the text when it posts.
- **Update**, a Textarea with the tag picker (**Tagging**), filled with "@Client Round {n} update on
  @{handle}: {step and next}", where {step and next} is the card's step and its waiting on line
  as the client reads it: "Step 5 of 8, Footage in and editing. Editing · 12 of 21 files in." Once
  the creator has cuts in, it adds "{k} of {v} variants in, {a} approved." The Editor can change
  any of it before posting. The fill is built only from what the client reads on the card, never
  from an agency only field (the `waitingOn`, a fee total, a rate, a contact detail), so nothing
  the client can't see is in the text unless the Editor types it.
- Under the box, in `text-xs text-muted-foreground`: "{brand} reads this on the page. {names} will
  see it in their inbox." The words are the Editor's to check: the page can't tell an agency only
  fact typed by hand.
- Cancel (outline) and **Post update** (default), which needs some text.

**What Post update writes.** A note for {brand}, `note-{id}` on `edits/creator-{net}-{handle}-r{round}`,
whose `value` is `{text, createdAt, kind}` with `kind` `update` (**1e**, Notes), so it is the same
note the creator viewer's Notes thread shows as Aspire's notes for {brand} (**Creator Selection**,
**The creator viewer**, **Notes**), where the client can reply. Then each tag in the text, the way
any tag is written (**1e**, **Tags and the inbox**): under the Editor's `tags-client/{id}/items` for
Client or a person on {brand}'s side, `on:` the note's document and field, `anchor`
`#creators/r{n}/{net}-{handle}/update`. Then one `note` entry, verb added, tab `creators`, the
same anchor, "Round {n} update on @{handle}: {first words}", in the Editor's client readable log (**1e**, **The
activity log**). A tag for Aspire typed into the update goes to `tags-agency` as any tag does. A
refused save keeps the Dialog open with the text and "Not saved", as **Editing in place** does.

**Where it shows.**

- **On the card**, under the step, for both sides: the newest update's line, "Update from {name},
  2 hours ago" for the client and "Updated {brand} 2 hours ago, by {name}" for the agency, with
  its first words. The open card's **Updates to {brand}** lists the round's updates newest first,
  each with who, when and the full text, and for the client a link Button "Reply in notes" to
  `#selection/r{n}/{net}-{handle}/notes`. With none: "No updates sent to {brand} this round."
- **In the client's inbox**: a "Tagged Client" (or "Tagged you") item from the tag, and a Note
  item from the log entry, as any tagged note gives (**Tags and the inbox**). Both open the card at
  **Updates to {brand}**.
- **In History**, as the note entry above.

Its author edits or removes an update with Edit and Remove on it, in **Updates to {brand}** or in
the creator viewer's Notes, the way a note is edited or removed (**Creator Selection**, **The
creator viewer**, **Notes**), which updates or withdraws its tags (**Tagging**, **Saving**). Both
keep `kind` `update`: an edit writes `{text, createdAt, kind}` with the new text, and a removal
`{text: null, createdAt, kind}`, so an edited update stays an update. A removed update leaves the
card's line, **Updates to {brand}** and the export's Last update to {brand}, which read the newest
update whose `text` isn't `null`.

A read only client reads no page data, and the updates live there, so the card shows them no line
and the open card shows "Updates aren't available from this account." in place of the list.

**It never leaves the page on its own.** The page never posts to Slack or sends email (**Tagging**,
**Nothing is sent from the page**). The next interactive run in the chat lists the update with the
other new tags and offers to post it to the campaign's saved destinations after a confirm
(**Delivering tags**). Nothing about an update reaches Atlas.

#### Contract and rates

One row per approved creator: concept, what they make, how long you can use it, exclusivity, the
agreed fee (or "in negotiation"), if we drop them, and where it is. The client sees agreed fees,
and only once the fees are sent; the agency also sees the rate per deliverable, the offer, the
counter and the agreed fee. Before the fees are sent, the client sees the creators and "Fees show
here once they are sent for your approval." **Totals**, agency only, close the section: the
campaign at open, target and max, and at what is agreed so far, with the allowlisting uplift as its
own line unless allowlisting is off. Full detail: `rates-and-terms.md`, **Contract and rates**.

Once the fees are sent, each agency row also carries the creator's contract record (status and signed
date), the round's rates per deliverable, the contracted total, and the payment status with the
amount paid so far, each with its source tag (**Creator records**). The agency edits the contract
and payment status here or on the card; the rates come from the chat. Once the fees are sent, the
client's row shows the agreed fee, the contract status and signed date, and the payment status,
never a rate, a total or an amount. The contracted total is the agreed fee plus its uplift, both
of which the client already reads, so it is kept to the agency's row for layout, not as a secret.

**The fee approval.** The client approves the whole fee sheet once per round, here, while step 3
is open. Step 3 is sent only once every creator on the sheet has agreed or declined (**1c**, row
7), so every row it covers has an agreed fee; a declined creator is listed as declined and left
out of the copy. It is a default Button "Approve fees" and an outline Button "Request changes" with an
optional note, for the client only, never for the agency or in **Preview as client**. Approving
saves the client's own approval under their id (`fees/{id}/items/r{round}`, **1e**, **What the
page keeps**, Fee approvals), with a copy of every fee line they saw. The page first adds the
item to the client's private `data/users/{id}/fees`, then writes the item, then its writer
document's `lastAt`, and logs one `decision` entry. While the approval is not recorded, an
outline Button "Undo approval" takes it back (`approval` `null`), as a cut's Undo approval does.
Once **Pulling decisions** records it, step 3 is cleared and the section shows the approval as a
label, with no control.

Step 3 stays open on Home until the pull records it, as **Round steps** says: an approval on the
page never ticks it. From the moment the client's own approval counts on the page, their **Waiting
on you** item for the fees leaves their list, and each card's line reads "Fees approved, Aspire to
record" in place of the waiting line.

What the section's header shows, for both sides:

- **Waiting for your approval** (client) or **With {brand}** (agency), while step 3 is open and no
  approval counts.
- **Fees approved {date}** (success) once an approval counts: written by an account never seen on
  Aspire's side, newer than step 3's `sentAt`, and its copy matching the fees on the page now. From
  an account the CM hasn't confirmed as an approver for step 3 (`sides` `approvers`), it reads
  "Fees approved, Aspire to confirm" with the processing Badge "Aspire to confirm", and step 3
  stays open on Home until the pull records it.
- **Changes requested {date}** (warning), for both sides, when the newest counted item is a
  request for changes newer than any approval and than step 3's `sentAt`, with the client's note
  shown to both: the agency revises the fees and sends them again (**Gate 3: the fees**), and
  every card's line reads "Waiting on Aspire to revise the fees" in place of the step 0 rows. Once
  they are sent again, the request is older than the new `sentAt` and no longer counts, so the
  header goes back to waiting for the client's approval.
- **Fees changed since you approved** (warning), while step 3 is open, when an agreed fee, a
  creator or the uplift differs from the approval's copy: the client approves again.
- **After step 3 is cleared**, the client's header stays "Fees approved {date}", and the page
  compares the fees with the copy in Gate 3's recorded `approval`. A fee, a creator or the uplift
  that changed since shows the agency only a warning Badge "Fees changed after approval" with the
  lines that differ. A change like that goes to the client as a your call (`rates-and-terms.md`,
  **Replies**), recorded in the chat; it never reopens step 3 on its own.
- **Not counted** (warning), for the agency only, on an approval from an account on Aspire's side
  or one the CM refused.

The pull's checks are in **Pulling decisions**, **The fee approval**. A fee approval a page from
before kept in `client/fees-r{round}` is never recorded, since any Editor can write `client`.

#### Shipping

Shown once fees are approved. A one line intro: "Getting the product to each creator. Update
shipping and tracking here. Addresses come from the creator's own reply." One row per creator on
the tab, as a Card on a phone and a table from `md`:

- the creator, the item (the round's product and its options), and details from creator
  (received, or not asked yet);
- Ship to: the city and region, or the pickup and its visit date, and whether the address is
  confirmed for the round (**Creator records**); for the agency, the full address and delivery
  note under it in `text-xs text-muted-foreground`, with **Copy shipping label** and a Checkbox
  **Address confirmed for round {n}** that writes `shipTo` `confirmed` and logs an `edit` entry in
  the agency log. A creator whose product status is Kept needs no confirmation and shows "Kept
  last round's product" instead;
- the three step timeline;
- the carrier, the tracking (a link when it is a carrier's tracking link), shipped, delivered and
  ETA dates, and the product status (Not shipped, Shipped, Delivered, Returned, Kept last round's
  product), each edited in place with its source tag;
- **Mark shipped**, **Mark delivered** or **Mark picked up**, and **Kept last round's product**
  for a returning creator (**Creator records**).

Both sides edit the carrier, tracking, dates and product status (**Who sees what**), and each
change moves the creator's step at once (**Steps**). Only the agency edits the address and ship
to. The agency also sees the next step ("ask once fees are approved", "details received", "confirm
the address for round {n}"). A returning creator's address shows from the first day of the new
round, with "Not confirmed for round {n}" until the round's details reply confirms it or the
agency ticks **Address confirmed for round {n}** on their row.

#### Brief and content

Per creator: brief state, content state, the content folder, footage "{x} of {f} files" with one
line per deliverable ("Hooks {x} of {count}", from the program terms' labels) from the footage
record ("Not recorded yet" until someone records a file), and the shoot by date. The agency edits
the counts and the shoot by date in place.

### Content Review

The variants the editors cut for the round in view, each with its versions, for the client to
comment on and approve. Every cut belongs to one creator in one round: its id is
`{net}-{handle}-r{round}-{variant}`, and the tab lists only that round's creators and their cuts
(**Whose cuts are here**), so a later round's cuts come from that round's creators, returning or
new. A creator has at most 5 variants in a round, and at most the program terms' variants per
creator (**Selected Creators**, **Variants per creator**): the agency's control to add a cut offers
a new variant only below that, and at the limit reads "@{handle} has {max} variants in
round {n}. Add a new version of one of them." New versions are never limited. A done round's cuts
are read only (**Round switcher**). Production hands off to the **Content review** flow (dispatch
row 16).

The roles are set: the client comments on a cut at a timecode or with a drawing, and approves,
requests changes, or undoes an approval (`comments` and their own `cut-calls/{id}`, **1e**).
The agency comments too, and its agency only comments on a cut stay in `agency/comments`, under an
"Agency only" rule in the thread.

A cut's framework, hook and CTA are read from the creator's plan for that variant, by **Selected
Creators**, **Concept and variant plan**, **Reading a creator's variant**, for the agency only, so
the cut, the card and Ad Performance always name the same ones.

The tab is one section, **The queue** (`review-queue`, **Collapsing sections**): the count
tiles, the status filter, one tab per creator, and that creator's variant rows. A cut opens in
**The review panel**, a Sheet over the tab.

#### Whose cuts are here

The creator tabs are the round in view's own creators: everyone on Selected Creators for that
round (**Selected Creators**, **Who's here**), in the order that tab lists them. A cut's id carries
its round, so a returning creator's round 1 cuts stay in round 1 and never show in round 2, and a
creator new in round 2 starts with every slot empty. Nothing on this tab is built from another
round's creators or cuts. A creator who left the round after a cut was added (declined, or
rejected on a newer roster finding) keeps a tab for the cuts they have, with a soft Badge "Not
under contract" and no empty slots, so no cut drops out of sight.

**Slots.** Each creator has one slot per variant in their variant plan: V1 to V{v}, {v} being the
program terms' variants per creator (**Selected Creators**, **Variants per creator**), at most 5,
the same rows **Concept and variant plan** shows. With the default plan that is five slots. The
number is read from the program terms, never written into the page, so an edit on Home changes
every creator's slots at once. A cut whose variant is past {v} (the terms lowered after it was
cut) still shows, after the slots, with a warning Badge "Past the plan", and doesn't count in
{y} below.

So a round 2 creator with no round 1 history shows V1 to V{v}, each "Not cut yet", with **Add
cut** on each for the agency.

#### Statuses

A cut's status is the status of its newest version, worked out live from the page data. Nobody
sets it by hand, and no record stores it. The rows below are read in order, and the first that
holds is the status, so a version with a call never reads as in QA.

**The call on a version** is the client's call that counts on it (**The status flow**, **The call
that counts**): the newest item under `cut-calls` for that version from an account on {brand}'s
side that answers the version's newest send. An undo, or a request for changes, ends an approval,
so Approved and Changes requested can't both hold. Nothing on Aspire's side writes a call, and
neither the activity log nor a stamp from an earlier page counts as one.

| Status | When | Badge | Dot |
| ------ | ---- | ----- | --- |
| Approved | The call on the newest version is approved, the same read **Selected Creators**, **Steps**, step 7 and the calendar's Approved use | success | `bg-green-600 dark:bg-green-500` |
| Changes requested | The call on the newest version is changes requested | warning | `bg-amber-600 dark:bg-amber-500` |
| Needs client review | The newest version was sent (`sentAt:` on it), with no call on it yet, its approval undone, or only calls from before its newest send | processing | `bg-sky-600 dark:bg-sky-500` |
| With Aspire QA | None of the above: the newest version hasn't been sent to {brand} and has no call (**1e**, Review versions) | soft | `bg-muted-foreground` |
| Not cut yet | A slot with no cut. A place, not a status | soft | hollow, `border border-muted-foreground` |

- **A new version starts in QA.** Adding version 2 to a cut that had changes requested moves the
  cut back to With Aspire QA until version 2 is sent.
- **A cut waits on the client** when its status is Needs client review. **Waiting on you**,
  **Needs attention** and Selected Creators' "{n} variants waiting on {brand}" count that, and
  only that.
- **A cut waits on the viewer** when it waits on their side: for the client, Needs client
  review; for the agency, With Aspire QA or Changes requested. The tab's count badge (**Header and
  tabs**) counts those cuts in the round in view, and the creator tabs open on the first creator
  with one.
- **Sending and the calls** are the review panel's status flow (**The status flow**): **Send to
  {brand}** writes `sentAt:` and `sentBy:` on the version, and the client's Approve, Request
  changes and Undo approval write their own call under `cut-calls`. This tab only reads them.

**Stage** comes from the newest version's number: version 1 is "First cut", version 2 "Second
cut", version 3 or later "Final cut". It is shown as text, never as a Badge.

#### The queue

Inside the section, top to bottom:

1. **Count tiles**, in `grid grid-cols-2 gap-4 lg:grid-cols-4`, each a Count tile (**Component
   classes**) with the count in `text-2xl font-semibold`, the status name, and one line in
   `text-sm text-muted-foreground`:

   | Tile | Count | Line |
   | ---- | ----- | ---- |
   | Needs client review | {w} | Client: "Waiting on you"; agency: "Waiting on {brand}" |
   | Changes requested | {c} | "Aspire is making changes" |
   | With Aspire QA | {q} | "Aspire is checking them" |
   | Approved | "{a} of {y}" | "{x} of {y} in", with a Progress bar of {a} over {y} |

   The first three count every cut on the tab in the round in view, whatever the filter, one per
   cut by its newest version. Approved's {y} is the creators on Selected Creators times {v}, and
   {a} and {x} count only their cuts in slots V1 to V{v}, so the tile never passes {y}: a "Not
   under contract" creator's cuts and a cut "Past the plan" are left out of it, as they are of
   Selected Creators' **Round totals**. So the tile equals **Variants delivered** and **Variants
   approved** there, except that **Variants delivered** still counts a cut "Past the plan". **Where we stand** plans with every approved creator whose fee
   isn't declined, agreed or not, so its {y} can be higher until every fee is agreed. A tile is a button
   that sets the filter below to its status (`aria-pressed` true while it is on); pressing it
   again goes back to All.
2. **Filter**, a Tabs list: All, Needs client review, Changes, Aspire QA, Approved, each with its
   count after the label ("Changes 2"). It opens on All and is kept in memory only. On phone it is one row that scrolls sideways, as the tabs do (**Responsive**). A status
   filter narrows the creator tabs to creators with at least one cut in that status and the rows
   to those cuts, and hides empty slots. With nothing left: "No cuts in round {n} with that
   status." and a ghost Button "Show all".
3. **Creator tabs**, a Tabs list, one trigger per creator: "@{handle}" and, after it, one Status
   dot (**Component classes**) per slot, V1 to V{v} in order, each taking its status's color
   above. The trigger carries `aria-label` "@{handle}: V1 approved, V2 needs client review, V3
   not cut yet", and its Tooltip says the same, so no status reads by color alone. On phone the
   list scrolls sideways with the selected creator in view. The tab opens on the creator in the
   hash (`#review/r{n}/{net}-{handle}`), else the first with a cut waiting on the viewer
   (**Statuses**), else the first. Under the list, for the selected creator: their concept chip (**Concept colors**), the
   persona, "{k} of {v} cut · {a} approved", and a link Button "Open card" to
   `#creators/r{n}/{net}-{handle}`.
4. **Variant rows**, one per slot, V1 to V{v}. From 640px a Table, and on phone a stack of Cards,
   one per variant, with the same fields (**Responsive**, **Tables**). The agency's Table has
   seven columns, so it pins its first column and its header as **Tables** says; the client's has
   five.

   | Column | Shows | Who |
   | ------ | ----- | --- |
   | Variant | The poster, "V{n}" as a link Button that opens the cut (`#review/r{n}/{cut}`), and the cut's title under it in `text-xs text-muted-foreground` | Both |
   | Version | "Version {v}", with when it was added under it ("2 days ago") | Both |
   | Hook + CTA | "H2 + C1", with the two types under it in `text-xs text-muted-foreground` ("Demo first · Direct") | Agency only |
   | Framework | Code and name, "BAB Before, after, bridge" | Agency only |
   | Stage | First cut, Second cut or Final cut | Both |
   | Status | The status Badge | Both |
   | Comments | The Lucide `message-square` and "{k} open", open threads on that version the viewer can read (the agency's count includes agency only threads), or "None" | Both |

   Clicking a row, or Enter on it, opens the same cut. Hook, CTA and framework are read by
   **Reading a creator's variant**, never copied, so a brief edit shows here at once, and the
   Badges that read brings ("Broken", "Cut for {concept}", "Plan changed since this cut") sit in
   their cells. A variant with nothing planned reads "Not planned".

   **The poster.** A box `relative w-12 shrink-0 overflow-hidden rounded-md bg-muted aspect-[9/16]`.
   For an uploaded cut, a `video` element with `muted`, `playsinline`, `preload="metadata"`, no
   controls, `class="h-full w-full object-cover"`, `aria-hidden="true"`, from `"/_blob/" + asset +
   "#t=0.5"`: the browser draws that frame, the page stores no separate image, and the poster
   never plays. For a linked cut, the Lucide `film` icon centred, with "Drive", "Frame.io" or
   "Link" under the box in `text-xs text-muted-foreground`. When the video can't load, the
   `film` icon in its place.

   **An empty slot.** The poster box is `border border-dashed` with the Lucide `clapperboard`
   icon, "V{n}", and in place of the other cells a soft Badge "Not cut yet". For the agency the
   Hook + CTA and Framework cells still show the plan, so the editor sees what to cut, and an
   outline Button size sm "Add cut" with the Lucide `upload` icon sits in the Status cell. The
   client sees "Not cut yet" only.

   Under the rows, for the agency, when every slot has a cut: "@{handle} has {v} variants in round
   {n}. Add a new version of one of them."

#### Adding a cut

**Who adds cuts: Editors only.** A cut is added on the page by someone on Aspire's side, from
their own computer: the page's uploads are granted to Editors and up (`assets` without `upload:
"interact"`, **1e**), every upload fills the page's one storage quota and file count, and the client
and the creators never upload. Claude downloads nothing for this and the plugin runs no file
write, so it needs no change to `SECURITY.md`, unlike storing creators' posted videos (**Creator
Selection**, **The creator viewer**, **Videos aren't stored today**).

**Add cut** on an empty slot opens a Dialog, "Add V{n} for @{handle}":

- The plan for the slot, read only: hook, CTA and framework as the row shows them.
- Tabs "Upload" and "Link". Upload holds a file input, also a drop target, that takes MP4, MOV
  and WebM. Link holds an Input for a Google Drive, Frame.io or other link, named from its host:
  Google Drive for `drive.google.com`, Frame.io for `frame.io` and `f.io`, else Link.
- Title, an Input, filled with "@{handle} V{n}". Notes, an optional Textarea. Under both, in
  `text-xs text-muted-foreground`: "{brand} sees the title, the notes and the file's name." They
  are kept in client readable `reviews`, so the plan above never goes in them; an agency only
  remark goes in an agency only comment on the cut.
- Under the file input, in `text-xs text-muted-foreground`: "Up to 20 MB. {used} of {max} of
  this page's storage used.", from the page's asset listing (`usage`), read when the Dialog opens.
- Cancel (outline) and Add (default). While a file uploads, a Progress bar, and Add is disabled.

Add writes `reviews/cut-{cut}` (`creator:`, `round:`, `lane:` the creator's concept now,
`variant:`, `title`, `latest:` `{version: 1, sentAt: null, file}`), then `reviews/cut-{cut}/versions/v1` (**1e**, Review versions), and
`plan-v1` in `agency/cut-{cut}` (**Concept and variant plan**), and logs one `upload` entry in
the agency log (**1e**, **The activity log**), since the client can't open a version in QA. **Send
to {brand}** logs the version again, `upload` with verb `sent`, where the client reads it, so the
client's **Inbox** gets one New item for it, opening the version, when it is theirs to review. The cut shows at once in every open view as With Aspire QA, and
the creator's step on Selected Creators, Home's pace and the calendar's delivery follow it.
Before an upload starts, the Editor's page reads the file's frame rate (**Frame rate**) and its
width, height and length from a `video` element given the local file, and writes them with the
version, so the brief check's runtime and aspect fill themselves (**The brief check**). Adding
version 2 and later is the review panel's (**Versions**).

**Writing it safely.** The upload goes first. Then the page takes a short lease on
`reviews/cut-{cut}` and reads it, as **1e**, **Every editable value**, **Creating a document**
says: when the cut already has a version (another Editor added it a moment ago), it writes
nothing, deletes the upload it just made, and the Dialog says "{name} added V{n} a moment ago."
over the queue's new row. Otherwise it writes the version before the cut's own fields, so a cut
is never left without one. A slot whose `reviews/cut-{cut}` has no version reads as empty,
"Not cut yet", with **Add cut**, which writes over it. Cancel during an upload stops it, and an
upload that finished but whose writes failed is deleted, so no stray file holds the page's
storage. A refused write keeps the Dialog open with "Not saved" and "Try again".

**When a cut won't upload,** the Dialog stays open, keeps the title and notes, writes nothing,
and says why under the file input with an error Badge "Not added":

| Why | It says |
| --- | ------- |
| Over 20 MB, the page's limit for one upload | "This cut is over 20 MB. Add a Google Drive or Frame.io link to it instead.", and switches to Link |
| The page's storage or file count is full | "This page's storage is full. Add a Google Drive or Frame.io link instead.", and switches to Link |
| Not MP4, MOV or WebM | "Upload an MP4, MOV or WebM video, or add a link." |
| Too many uploads at once | "Not added yet. Try again in a minute." |

The 20 MB is the page runtime's limit for one upload, and it isn't raised per file. A 30 second
review copy exported at 720p and about 4 Mbps is about 15 MB, so editors export review copies to
fit and keep the master in Drive or Frame.io.

**Who can play what.**

- **An uploaded cut** plays in the page for everyone who reads the queue: people in the
  organization that published the page, who are the only ones who can open its uploads. A client
  approver from outside it is a read only client (**Who sees what**), who sees neither the queue
  nor the uploads, only the line in **What the client sees**. When the video can't load anyway (an
  upload removed), the poster shows the `film` icon and the review panel says "This cut can't
  play right now. Ask {CM name} for a link."
- **A Google Drive or Frame.io link** never plays in the page. A page can play video only from
  its own asset store, and either service asks the viewer to sign in there. Its row opens the
  review panel, which shows an outline Button "Open in Google Drive" or "Open in Frame.io" that
  opens the link in a new tab (`rel="noopener"`). Comments on it carry no frame or drawing, since
  there is no player to pin them to.

#### What the client sees

The tiles, the filter, the creator tabs and their dots, and per variant the poster, "V{n}", the
version, the stage, the status and the open comments. Not Hook + CTA or Framework: they are the
creator's variant plan, which is agency only (**Concept and variant plan**, **What the client
sees**), so those columns and the plan under an empty slot never render for the client or in
**Preview as client**, and the client's export leaves them out. Showing them would need a client
readable copy Claude writes at publish and a new **Who sees what** row, which this tab doesn't
add.

The client sees that a cut is With Aspire QA, but works on what was sent to them: their row shows
the newest version sent, "Version 1 · Aspire is checking version 2", and a cut with no version
sent yet reads "Aspire is checking this cut" and doesn't open. While a newer version is in QA,
the older one opens read only for them: its comments stay readable, and it takes no new call or
comment, since the cut's status follows the newest version. That is a view, not a secret: a
version in QA is in client readable page data (`reviews`), and nothing in it is agency only.

A read only client reads no page data (**Who sees what**), and cuts live only there, so for them
the queue shows one line in place of its parts: "Cuts show here for people who can open this
page's data. Ask {CM name} for access." Cut calls have no campaign record (**Pulling decisions**),
so such an approver can't approve a cut from the chat either: the CM shares the page with them
from inside the organization, or the client's calls come from an approver who can open it.

#### A done round

A done round's queue shows as it ended, read only (**Round switcher**): no **Add cut**, no send,
no calls. In the review panel the comment box is replaced by one line, "Round {n} is signed
off.", and a link Button "See round {n} results" to `#performance/r{n}/result`. Threads and
drawings stay readable. That is how the client looks back at last round's signed off cuts: the
round's segment in the **Round switcher**, then a cut.

#### The review panel

A Sheet over the tab (**Responsive**, **Side panels**), opened by a row or by
`#review/r{n}/{cut}`, at the newest version (the newest sent one for the client), or at the
version, second or comment the deeper hashes name (**Header and tabs**). It holds the player
(**The player**), frame comments (**Comments on a cut**) and drawing (**Drawing on the frame**),
**Copy link** and **Copy comments** (**Sharing a cut**), and the status block where the versions,
compare, the status flow and the brief check are (**The status block**). It is built from
the Review panel classes in **Component classes**, with `role="dialog"`, `aria-modal="true"` and
`aria-label` "@{handle} V{variant}, version {v}", focus kept inside while it is open and returned
on close.

**Layout.**

- **Header**, at every width: Close (ghost icon Button, Lucide `x`), "@{handle} V{variant}" in
  `font-semibold`, the cut's title under it in `text-xs text-muted-foreground` (`min-w-0`,
  truncated), then **Copy link** and **Copy comments** as ghost icon Buttons with their Tooltips
  (Lucide `link` and `clipboard-copy`), labelled with their full names.
- **From 1024px**, two columns: the player on the left, and on the right a 380px column with the
  status block at its top and the comments under it, each scrolling on its own.
- **From 640px to 1023px**, one column in the right-hand Sheet: the player, then the status block,
  then the comments, the Sheet scrolling as a whole.
- **Under 640px**, the Sheet is full screen. The player is full width at the top, and the status
  block and the comments are a bottom sheet over the lower part of the screen, as the creator
  viewer's is (**Creator Selection**, **The creator viewer**, **Layout**). It opens peeked, holding
  its handle and one row: the status Badge, a default Button "Comment" with the Lucide
  `message-square-plus` icon, and an outline Button "Draw" with the Lucide `pencil` icon. Its handle
  is a `button`, "Show comments ({k})" or "Hide comments" with `aria-expanded`, that opens it to 85%
  of the screen's height, where its body scrolls, and closes it again; dragging the handle does the
  same. Opening the panel at a comment (`/c{comment}`) or tapping **Comment** opens the sheet. The
  player is capped so the peeked sheet never covers the video or its controls.
- **Layering.** A Dialog, a Select's list, a tooltip or the tag list opened from the panel is
  added after the bottom sheet in the page, so it opens above it. While the player is full screen
  (**Full screen**), each is added inside the full screen part instead, since the browser draws
  nothing outside it, and while the player fills the window it takes `z-[70]` in place of `z-50`,
  so it opens above the player.

Closing the panel returns to the same creator tab, filter and row. In a done round the comment box
is replaced by the line in **A done round**, and threads and drawings stay readable.

#### The player

An uploaded cut plays in a `video` element from `"/_blob/" + asset`, with `playsinline` and
`preload="metadata"`, and no browser controls: the page draws its own, so every control looks and
works the same on every browser. It opens paused, at 0:00, or at the time or comment the hash
names. Nothing the player does writes page data or logs, but the one frame rate write in
**Frame rate**: playing, seeking, speed, loop, the safe zone, sound and full screen are the
viewer's own, kept in memory for the visit only.

Under the video, top to bottom:

1. **The scrubber**, with the comment markers in a row just above it (**Comment markers**). The
   markers' row is a sibling of the scrubber, never inside it, so screen readers reach each marker
   and a tap on one never seeks through the scrubber. The scrubber carries `role="slider"`,
   `aria-label` "Position", `aria-valuemin` 0, `aria-valuemax` the duration, `aria-valuenow` the
   current time in seconds and `aria-valuetext` "0:04.4 of 0:30.0". Dragging it, or tapping a point on it, seeks there; the video
   pauses while it is dragged and plays on after if it was playing.
2. **The time**: "0:04.4 / 0:30.0" in `text-xs tabular-nums text-muted-foreground`, and, when the
   frame rate is known, "· frame 132" after it (**Frame rate**). A time is always m:ss with tenths
   of a second.
3. **The controls**, each a Button with its icon, `aria-label` and a Tooltip that names it and its
   key ("Back one frame (Left arrow)"):

   | Control | Icon | Does |
   | ------- | ---- | ---- |
   | Back one second | Lucide `chevrons-left` | Pauses and moves back one second, not past 0:00 |
   | Back one frame | Lucide `step-back` | Pauses and moves back one frame (**Frame rate**) |
   | Play or Pause | Lucide `play` or `pause` | Plays or pauses. Its label follows its state |
   | Forward one frame | Lucide `step-forward` | Pauses and moves forward one frame |
   | Forward one second | Lucide `chevrons-right` | Pauses and moves forward one second, not past the end |
   | Speed | none; a Select showing "1x" | 0.5x, 1x, 1.5x, 2x. Opens on 1x. Sound keeps its pitch |
   | Loop | Lucide `repeat` | On, the cut starts again from 0:00 at its end. `aria-pressed` |
   | Reels safe zone | Lucide `scan` | Shows or hides the safe zone over the frame (**Reels safe zone**). `aria-pressed` |
   | Sound | Lucide `volume-2` or `volume-x` | Turns the sound on or off. Opens with sound on, as the video starts only when someone presses Play |
   | Full screen | Lucide `maximize` or `minimize` | Shows the player alone, filling the screen (**Full screen**) |

   A toggle's Button is ghost, with `aria-pressed` and the pressed classes in **Component
   classes**, Review panel. From 640px the controls are one row: the five moves in the middle, Speed
   and Loop before them, the safe zone, sound and full screen after. Under 640px they are two rows of
   five: the moves, then Speed, Loop, the safe zone, sound and full screen. Every control keeps its
   44px tap area on phone and on touch screens (**Tokens**).
4. **Comment and Draw**, from 640px only: a default Button "Comment at {time}" with the Lucide
   `message-square-plus` icon and an outline Button "Draw" with the Lucide `pencil` icon, after the
   controls. Under 640px they sit in the peeked bottom sheet instead. Neither renders for a version
   the viewer can't comment on (**What the client sees**, **A done round**) or in **Preview as
   client**.

While the video loads, a Skeleton the shape of the box. When it can't play, the box shows the
`film` icon and "This cut can't play right now. Ask {CM name} for a link." (**Adding a cut**), and
the controls are disabled, while comments stay readable and open.

**Frame rate.** A browser plays a video without saying its frame rate, so the page learns it in
one of two ways and stores it on the version (**1e**, Review versions), so every viewer steps the
same frames:

1. **From the file, when it is added.** Before the upload starts, the Editor's page reads the
   file's own header from their computer: for MP4 and MOV, the video track's time scale (`mdhd`)
   and the time each frame takes (`stts`); for WebM, the video track's frame length
   (`DefaultDuration`, in nanoseconds). It reads only the header boxes, with the browser's own file
   reading, so Claude downloads nothing and nothing leaves the Editor's browser that the upload
   doesn't already send. For MP4 and MOV the frame rate is the time scale over the most common frame
   time; for WebM it is one billion over the frame length. Either is rounded to the nearest of
   23.976, 24, 25, 29.97, 30, 48, 50, 59.94 and 60 when it is within 0.01 of one, else kept to three
   decimals. A file is marked variable only when more than 1% of its frames, leaving out the first
   and the last, take a time other than the most common one (a phone recording); it keeps the most
   common rate. A last frame of a different length, which most files have, doesn't make it
   variable. The version gets `fps:`, `fpsFrom:` `file` and `fpsVariable:`.
2. **From playback, when the file didn't say.** A WebM with no frame length, a fragmented MP4
   (its frame times are in the fragments, not the header), a version from before, or a header the
   page couldn't read has no `fps:`. Then, while the cut plays at 1x, the page reads the video time
   of each of the first 20 frames the browser draws (`requestVideoFrameCallback`, its `mediaTime`),
   never the clock time between them, which follows the screen. It keeps the gaps between frames
   that follow each other (`presentedFrames` up by exactly one), takes the middle gap, and turns it
   into a rate rounded the same way. That rate is used at once in the viewer's own player. An
   Editor's page also writes it to the version once, as `fpsFrom:` `playback`, so the next viewer
   doesn't wait; a client's page can't write `reviews`, so for a client it holds for the visit only.

**Stepping a frame.** With a frame rate, one frame is `1 / fps` seconds. The page works out the
frame the video shows (the time times the rate, rounded down) and seeks to the middle of the next or
previous one, so a step never lands on a frame's edge and shows the same frame twice. On a variable
rate file, "frame 132" and each step are the nearest frame at the stored rate, and the time readout
adds "· frame rate varies" in a Tooltip on the frame number.

**When the rate isn't known** (the browser can't time frames, or the cut hasn't been played at 1x
yet): one step is 1/30 of a second. The frame number doesn't show, the frame Buttons' Tooltips say
"Steps 1/30 of a second. This cut's frame rate isn't known yet.", and a comment saves its time with
no `frame:`. Once the rate is learned, the Tooltips and the frame number update without a reload.

**Reels safe zone.** An overlay on the frame showing where Instagram's Reels screen covers the
video: the top 14%, the bottom 35% and 6% at each side are shaded, and the rest has a dashed
outline, following Meta's guidance for Reels ads. It is drawn over the video's frame, not the
letterbox around it, and scales with it. The overlay ignores taps, so the video and drawing work
through it. A cut whose frame isn't 9:16 still shows it, with the line "This cut isn't 9:16, so the
safe zone is only a guide." under the player while it is on.

**Full screen.** The player (the video, its overlays, the scrubber and the controls) fills the
screen through the browser's full screen mode, where the browser has one for a page element and
lets the page use it. Where it doesn't (an iPhone, or a frame that blocks it), the player fills the window instead, over the panel, with the same
controls, so drawing, the safe zone and the markers work in full screen everywhere. The Full
screen Button or Escape closes it. In the browser's full screen mode the browser keeps Escape for
itself and only leaves full screen, so a drawing in progress stays open, and **Done** or the bar
leaves it. Comments stay in the panel; **Comment** leaves full screen first, and **Draw** works in
full screen.

**Keyboard shortcuts.** From 1024px, with a fine pointer, as extras only: every one has a visible
control above. None works while focus is in a text field, a Select or the tag list, or while a
Dialog is open, and the arrows work on the scrubber when it has focus.

| Key | Does | Visible control |
| --- | ---- | --------------- |
| Space | Play or pause | Play or Pause |
| Left, Right | Back or forward one frame | The frame Buttons |
| Shift with Left, Right | Back or forward one second | The second Buttons |
| C | Comment at the current time: pauses and moves focus to the comment box | **Comment at {time}** |
| D | Draw on the frame, or Done while drawing | **Draw** |
| S | Show or hide the Reels safe zone | Reels safe zone |
| M | Sound on or off | Sound |
| Escape | Leaves drawing, then closes the panel. In the browser's full screen mode it only leaves full screen, since the browser keeps that key | **Done**, Full screen, Close |

A ghost icon Button "Keyboard shortcuts" (Lucide `keyboard`) in the header, from 1024px, opens a
Dialog with this table in plain words.

#### Comments on a cut

Both sides comment on a version of a cut and reply back and forth, as on the brief (**Master
Brief**, **Comments and sign off**), with the same comment shape (**1e**, Brief comments, cut
comments). What differs is the anchor: a time in the video, with a drawing when there is one.

**A new comment.** **Comment at {time}** (or C) pauses the video and opens the comment box at the
foot of the comments, holding:

- A chip with the Lucide `clock` icon, "At 0:04.4", and a ghost icon Button "Make it general"
  (Lucide `x`), which takes the time off, so the comment is about the cut as a whole. A general
  comment shows "General" in place of a time.
- When the comment has a drawing, a chip with the Lucide `pencil` icon, "Drawing, {k} strokes",
  and ghost Buttons "Edit drawing" and "Remove drawing". A drawing always has a time, so "Make it
  general" removes it too, after the line "This removes the drawing." with Cancel and Remove.
- A Textarea "Comment", with the tag picker (**Tagging**). A comment needs words or a drawing;
  with only a drawing it reads "Drawing at 0:04.4" in the list.
- For the agency only, an "Agency only" Switch with its visible label, off at first (**Agency only
  comments on a cut**).
- Cancel (outline) and Comment (default). Under the box, while it has tags, "{names} will see this
  in their inbox."

Comment writes the comment with `on:` `cut-{cut}-v{version}`, `timecode:` (seconds, to three
decimals, or empty when general), `frame:` (when the frame rate is known) and `drawing:`, under the
writer's own `comments/{id}/items` or, for an agency only comment, `agency/comments/items` (**1e**),
and logs one entry, kind `comment`, verb `commented`, tab `review`, asset `cut-{cut}-v{version}`,
anchor `#review/r{n}/{cut}/v{version}/c{comment}`, text "Commented at 0:04.4: {first words}" or
"Commented at 0:04.4 with a drawing: {first words}" (**1e**, **The activity log**). While the version is in
Aspire QA, the entry goes to the writer's agency log, as an upload does (**Adding a cut**), so no
client gets an inbox item for a version they can't open; the comment itself stays in its place.
Typing in the box never changes the time it saved; the player can play on while someone types.

**The list.** Under the status block, for the version open in the player:

- **Filters.** A Tabs list: All, Open, Client, Aspire, Resolved, each with its count, kept in
  memory and opening on Open. The rules are the brief's: Open and Resolved go by the thread's first
  comment, Client and Aspire by who started the thread, and every agency only thread counts as
  Aspire. Each filter's empty state is the brief's ("No comments yet.", "No open comments.",
  "Nothing from {brand} yet.", "Nothing from Aspire yet.", "Nothing resolved yet.").
- **Order.** General comments first, then by time in the video, earliest first, ties by when they
  were written, so the list reads in the order the cut plays.
- **A thread.** A Card per thread, built as the brief's: the first comment and its replies in time
  order, replies under a `border-l border-border pl-4` rule, each with its Avatar, name, side
  Badge, time written, and text with its tags. At the top of the thread, in place of the brief's
  "Go to {part}", a link Button with the time ("0:04.4", or "General") and, when the comment has a
  drawing, the Lucide `pencil` icon and "Drawing".
- **Seeking.** Tapping a thread's time, or the thread itself outside its Buttons and fields, pauses
  the video at that time, shows its drawing, and rings the thread with `ring-2 ring-ring` until
  something else is picked. Under 640px it also lowers the bottom sheet to its peek, so the frame
  shows. A general comment doesn't move the video. The address bar takes the comment's hash.
- **Replying.** A Textarea "Reply" and a default Button, size sm, "Reply", under each thread, with
  the tag picker. One level only: every reply's `replyTo:` is the thread's first comment, and a
  reply carries no time or drawing of its own. A reply logs as verb `replied`.
- **Resolve and Reopen, Edit and Delete** work as on the brief, with the same rights: the thread's
  author or an Editor resolves and reopens, and a comment's author edits and deletes. An edit
  changes the words only; to move a comment to another time or change its drawing, its author
  deletes it and comments again. Deleting a comment removes its drawing with its words.
- **Live.** A comment made in another open view shows in the list and on the scrubber as it
  arrives (**1e**, **Live updates**).

**Comment markers.** Each thread in the list under the filter has a marker on the scrubber at its
time; general comments have none. A marker is a `button` with `aria-label` "Comment at 0:04.4 by
{name}: {first words}" and a Tooltip with the same, and tapping it does what tapping the thread
does. Open threads are filled, resolved threads faded, and agency only threads hollow (the marker
classes in **Component classes**, Review panel). Markers closer together than 44px on screen join
into one marker showing their count, which seeks to the first and sets the list to show those
threads first. Markers sit in their own row above the scrubber, so dragging the scrubber never hits one.

**Which version.** The list and the markers show the version open in the player. A version keeps
its own comments: a new version starts with none, and the earlier version's comments stay on it.
Moving between versions is the picker's (**Versions**), and seeing two at once is **Compare**'s.

**Who can comment, and where.** The agency on any version. The client on the newest version sent
to them, and only while the cut has no newer version in Aspire QA (**What the client sees**): on
an older version the box is replaced by "Aspire is checking version {v}. Comments open again when
it's sent." A done round is read only (**A done round**). In **Preview as client** no comment
box, reply box, Resolve, Edit or Delete renders, as on the brief, since the preview never writes. A
read only client never reaches the panel (**What the client sees**).

#### Drawing on the frame

**Draw** (or D) pauses the video and turns the frame into a drawing surface, over the video and
under the controls:

- **The bar.** Over the top of the frame while drawing: three pens, Red, Yellow and Blue, as
  ghost icon Buttons with a filled dot (`aria-pressed` on the one in use, Red first); two sizes,
  Thin and Thick; Undo (Lucide `undo-2`), which takes off the last stroke; Clear (Lucide
  `trash-2`), which takes off every stroke; and a default Button "Done". Every one has its label
  and Tooltip.
- **Drawing.** A finger, a pen or the mouse draws while pressed. The surface takes every touch
  while drawing, so a finger drawing on a phone never scrolls the panel or moves the bottom sheet;
  two fingers still zoom the page. The controls under the frame stay usable: stepping a frame or
  seeking keeps the drawing open and moves its time to the new frame, so someone can find the exact
  frame before or while drawing.
- **Done** opens the comment box with the drawing attached (**Comments on a cut**) at the frame it
  was drawn on. Escape (outside the browser's full screen mode), Close or leaving the cut with
  strokes drawn asks "Discard this drawing?" with Keep drawing and Discard.

**How a drawing is kept.** The strokes are drawn as `svg` paths over the video's frame (never the
letterbox around it), in a `viewBox` of 0 to 1 each way, so the same data draws in the same place
at any size: in the panel, on a phone, held sideways and in full screen. Each stroke keeps its pen,
its size and its points, each point being how far across and how far down the frame it is, from 0
to 1, to three decimals. Points closer than 0.003 to the one before are left out while drawing, and
a drawing holds at most 50 strokes and 4,000 points, which keeps a comment far under a document's
size limit; past that, the bar says "This drawing is full. Comment, then start another." The line
width is set on screen, not in the data, so it stays the same thickness at any size.

**Showing a drawing.** A comment's drawing shows over the frame while the video is paused within
one frame of its time and the comment is picked in the list or its marker was tapped, and hides
once the video plays. Each stroke draws in its pen's color over a darker, wider line under it, so
it reads on a light or dark frame.

**Linked cuts can't be drawn on.** A Google Drive or Frame.io cut doesn't play in the page, so it
has no frame to draw on (**A linked cut in the panel**).

#### Agency only comments on a cut

An Editor can make a comment agency only, for remarks the client should never read: a note to the
editor, a fix Aspire will make before sending, a question about the plan.

- **Where it is kept.** Under `agency/comments/items` (**1e**), which nobody below Editor can read
  (**1e**, **What the rules enforce, and what they can't**). It isn't hidden on screen; the client's
  page data never holds it, nor its words, its time, its drawing or its count. Its activity entries
  go to the writer's agency log (**1e**, **The activity log**, **Where an entry goes**), and its
  tags reach Aspire only (**Tagging**, **Agency only boxes**).
- **Choosing it.** The "Agency only" Switch in the comment box, when the comment is written. It
  can't be changed after: a comment the client may already have read can't be taken back by moving
  it, and an agency only comment is never moved where the client reads. To take back a visible
  comment, its author deletes it.
- **Replies stay with their thread.** A reply to an agency only thread is agency only: it is written
  to `agency/comments/items` with `replyTo:` the thread's first comment, and its box has no Switch
  and reads "Agency only". A reply to a visible thread is visible, and its box has no Switch either,
  with the line "To say something only Aspire sees, start an agency only comment." A visible thread
  never holds an agency only reply, and an agency only thread never a visible one.
- **How it shows.** For the agency, a soft Badge "Agency only" on the thread, the thread under the
  "Agency only" rule, and a hollow marker on the scrubber. In **Preview as client**, the Client
  filter and the client's counts, none of it shows, as for the client.

#### Sharing a cut

**Copy link.** Copies the page's address with the hash to this cut, the version in the player, and
the time it is paused at: `#review/r{n}/{cut}/v{version}/t{seconds}` (**Header and tabs**), or
without the time at 0:00. Each thread also has a ghost Button, size sm, "Copy link" that copies its
`/c{comment}` hash. The round comes from the cut, so a link works for any round, a done round
included, and opens that round in the **Round switcher**. The Button reads "Copied" for two
seconds; where the browser refuses the clipboard, a Dialog shows the address in a read only Input,
already selected, with "Press Ctrl+C or Cmd+C to copy." and Close. Copying writes nothing and logs
nothing.

A link holds only the hash, never the cut, a file or a comment, so it opens nothing its reader
couldn't already open. The page checks each part of the hash against what the person opening it can
read, as for any hash:

- Someone outside the publishing organization, or without access to the page, can't open the page.
  A read only client reaches Content Review's line in **What the client sees**, not the cut.
- A client opening a version that isn't sent yet gets the newest version sent to them, at the
  same time, or, when none is sent, the creator's tab with "Aspire is checking this cut" (**What
  the client sees**).
- A client opening an agency only comment's link gets the cut at that version with no comment
  picked, and nothing on screen says a comment was there.
- A cut, version or comment that is gone opens the item above it (**Header and tabs**).

For the agency, when the version in the player isn't sent yet, the Button's Tooltip and the
"Copied" line add "{brand} sees version {s} from this link until version {v} is sent.", or "{brand}
can't open this cut until a version is sent." when none is.

**Copy comments.** Copies the threads the list shows now, with its filter, every reply included,
for the version in the player, as one table: an HTML table and tab separated text of the same rows,
as **History**'s **Copy as table** does, so it pastes as a table into a sheet, a doc or an email.
The columns are the **Export** sheet "All comments" without Creator and Variant, which the first
line names ("@{handle} V{variant}, version {v}, {title}"): Version, Timecode, Frame, Seconds,
Comment, Reply to, Who, Side, When, Has drawing, Resolved, with each tag kept as its text.

- **For the client** it holds only what their page data holds, so never an agency only comment.
- **For the agency** it opens a Dialog "Copy comments" with a Switch "Include agency only
  comments", off at first, and Cancel and Copy. With it off the copy is what the client would get,
  so it can be pasted to {brand}. With it on, agency only comments come with Side "Agency only", and
  the Dialog says "This copy has agency only comments. Don't send it to {brand}."
- In **Preview as client** it copies what the client would get, with no Dialog.

The Button reads "Copied" for two seconds, with the same Dialog fallback as **Copy link**. Copying
writes nothing and logs nothing. A drawing can't go in a table, so Has drawing says Yes, and
whoever reads the copy opens the cut with **Copy link** to see it.

#### A linked cut in the panel

A Google Drive or Frame.io cut opens outside the page (**Adding a cut**, **Who can play what**), so
in the panel it has no player, and so does a cut added as a link from any other host. In the
player's place, the film box with "Plays in Google Drive", "Plays in Frame.io" or "Plays outside
this page", and an outline Button "Open in Google Drive", "Open in Frame.io" or "Open link" that
opens the link in a new tab (`rel="noopener"`).

What still applies: comments, replies, resolve and reopen, the five filters, agency only comments,
tagging, **Copy link** (with no time) and **Copy comments**. A comment on a linked cut can name a
time: the box has an optional Input "At (m:ss)", saved as `timecode:` with no frame or drawing, and
shown as a plain time that doesn't seek. What doesn't apply: frame stepping, speed, loop, the safe
zone, sound, full screen, drawing, markers and keyboard shortcuts. The panel says so in one line
under the Button: "This cut plays in Google Drive, so comments here can name a time but can't pin a
frame or a drawing.", with "Frame.io" or "outside this page" in place of "in Google Drive" as the
host says.

#### The status block

The part of the review panel that moves a cut along: at the top of the right column from 1024px,
under the player from 640px, and in the bottom sheet under 640px, with its status Badge in the
peek. Top to bottom:

1. **Status and stage.** The cut's status Badge (**Statuses**) and its stage as text ("Second
   cut"). For the agency, while the newest version is With Aspire QA and was sent back to the
   editor (**The status flow**, **Back to editor**), a soft Badge "Back with editor" after it.
2. **Versions.** The version picker and, when the cut can be compared, **Compare** beside it
   (**Versions**, **Compare**).
3. **The moves.** The Buttons the viewer's side has for the cut's status (**The status flow**), in
   one row that wraps, each at least 44px tall on touch. For the agency on a version that isn't
   the newest, and for the client on a version older than the newest one sent to them, the row is
   the line "Calls and sends are on version {v}." and a link Button "Open version {v}", {v} being
   the newest the viewer can open. For the client on the newest version sent while a newer one is
   in QA, it is the status flow table's line, "Aspire is checking version {v}". A
   done round, a read only client and **Preview as client** show no moves.
4. **The last move.** One line in `text-xs text-muted-foreground` naming the newest move on the
   version open and who made it: "Sent to {brand} by {name}, 2 days ago", "Changes requested by
   {name}, 1 hour ago", "Approved by {name}, 3 days ago". The name comes from `user.profiles`
   first, as everywhere (**1e**, **Every editable value**).
5. **The brief check** (**The brief check**), a Collapsible whose trigger reads "Brief check, {p}
   of 8 pass" with "{f} failed" after it when any did. It opens on its own for the agency while the
   version is in Aspire QA, and is closed otherwise.

The comments follow under it (**Comments on a cut**).

#### Versions

A cut's versions are `reviews/cut-{cut}/versions/v{k}`, numbered from 1 with no gaps (**1e**,
Review versions). Each version keeps its own file, size and length, frame rate, send, brief check
ticks, comments and markers: the player reads `fps:` and the size from the version it plays, the
list and the markers show the comments whose `on:` is that version, and a comment's `/c{comment}`
hash opens its own version. A new version starts with no comments and no ticks but the one its
file fills (**The brief check**), and the earlier version keeps its own.

**The picker.** A Select whose trigger reads "Version {k} of {v}". Its items, newest first, are
"Version {k}" with a line under it in `text-xs text-muted-foreground`: the stage its number gives,
its own state and when it was added ("Second cut · Changes requested · 3 days ago"). A version's
own state is **Statuses** applied to that version alone, so an earlier version reads as it ended:
Changes requested, Approved before a later version replaced it, or, for the agency, "Not sent" for
one replaced while still in QA. The client's list holds only versions sent to them, and, while a
newer one is in QA, a disabled last item "Aspire is checking version {v}". Picking a version loads
it in the player at 0:00, keeps the comments filter, and puts `#review/r{n}/{cut}/v{k}` in the
address bar. Sends and calls act on the newest version only (**The status flow**).

**Upload new version.** For Editors, in the round in view while it is the current round; never
in a done round, for the client or in **Preview as client**. It is an outline Button with the
Lucide `upload` icon in the moves row while the cut is With Aspire QA, the default Button there
while it is Changes requested, and the
last item of the picker's list, "Upload new version", in every status. On a cut that is Needs
client review or Approved it asks first, in a Dialog "Replace version {v}?":

- Needs client review: "{brand} is reviewing version {v}. A new version goes back to Aspire QA,
  and {brand} reviews the new one once you send it."
- Approved: "{brand} approved version {v}. A new version goes back to Aspire QA and needs
  {brand}'s approval again."

with Cancel (outline) and Continue (default).

It opens a Dialog "Add version {k} of @{handle} V{n}", built as **Add cut**'s (**Adding a cut**):
the plan for the slot, read only; the Upload and Link tabs with the same file types, the 20 MB
limit and the storage line; a Textarea "What changed", optional, saved as the version's `notes`,
with "{brand} sees what changed and the file's name." under it, since it is client readable; and
Cancel and Add. The title is the cut's and isn't asked again. Before the upload starts, the
Editor's page reads the file's frame rate (**Frame rate**) and its width, height and length, by
giving a `video` element the file from their own computer and reading `videoWidth`, `videoHeight`
and `duration` once its metadata loads. Nothing leaves the browser that the upload doesn't send.

**Writing it.** Add uploads first, then takes the short lease on `reviews/cut-{cut}` that **Add
cut** takes (**Writing it safely**), reads the versions, and sets {k} to one past the highest.
When another Editor added that version a moment ago, the page writes nothing, deletes its own
upload, and says "{name} added version {k} a moment ago." Otherwise it writes
`reviews/cut-{cut}/versions/v{k}` with `kind:`, `asset:` or `link`, `name:`, `type:`, `size:`,
`notes`, `addedAt:`, `addedBy:`, the frame rate fields, `width:`, `height:` and `duration:`, then
`latest:` on `reviews/cut-{cut}`, then `plan-v{k}` in `agency/cut-{cut}` (**Concept and variant
plan**). A file that won't upload gets the
lines in **When a cut won't upload**. It logs one `upload` entry, verb uploaded, "Uploaded version
{k} of @{handle} V{n}", in the writer's agency log, since the version is in QA.

Everything else follows from the data, with no other write:

- **The stage is set by the count.** Version 2 is "Second cut", version 3 and later "Final cut"
  (**Statuses**).
- **The status resets to With Aspire QA**, since the newest version has no `sentAt:` and no call
  (**Statuses**). The client's row keeps the last version sent: "Version {v} · Aspire is checking
  version {k}".
- **The brief check's runtime and aspect fill themselves** from the fields just written (**The
  brief check**).
- The panel opens on the new version, in every open view of the agency's.

#### Compare

Two versions of one cut side by side, playing together, to see what changed.

- **Who and when.** Everyone who can open the cut, the client included, when it has at least two
  versions the viewer can open that are both uploads (for the client, two sent versions). A linked
  version can't play in the page, so in the list it is disabled with "Plays outside this page", and
  a linked cut has no **Compare**. Compare writes nothing and logs nothing: it is the viewer's own
  view, kept in memory.
- **Opening it.** An outline Button "Compare" with the Lucide `columns-2` icon beside the picker.
  It opens a Select "Compare with" holding every earlier version the viewer can open, newest first,
  and opens on the one before; any earlier version can be picked, not only the last. The two
  players show at once, and a ghost Button "Close compare" goes back to one. The address bar takes
  `#review/r{n}/{cut}/v{k}/vs{j}`, which opens the same compare (**Header and tabs**). For the
  client, a `vs` naming a version not sent to them opens the cut with no compare.
- **Layout.** Two players, each built as **The player** says, side by side at every width: the
  earlier version on the left, labelled "Version {j}" and its stage above its video, the open
  version on the right, labelled "Version {k}". From 1024px they share the player column; from
  640px to 1023px they sit side by side above the status block; under 640px each is half the
  width, and the bottom sheet works as it does with one player. Each video sits in an equal box
  (`aspect-[9/16]`) and keeps its own shape inside it, so a cut that went from 4:5 to 9:16 shows
  as it is.
- **One set of controls.** Under the pair: back one second, back one frame, Play or Pause,
  forward one frame, forward one second, Speed, Loop, the Reels safe zone (shown on both), Sound
  and Full screen, as in **The player**, and a Switch "Sync" with its visible label, on at first.
- **Synced playback.** With Sync on, Play plays both from the same time, Pause pauses both, a seek
  on either scrubber seeks both, and Speed sets both. The right player leads: while both play,
  the page reads the left one's time on each frame the browser draws (`requestVideoFrameCallback`),
  or every 250 ms where that isn't there, and seeks it to the leader's time when they are more than
  one frame apart at the slower of the two rates. Sound plays from one side only, so two tracks
  never play over each other: a Select "Sound from", "Version {k}" first, then "Version {j}".
- **Frames.** The shared frame Buttons move each side one of its own frames, at its own `fps:`
  (**Frame rate**), so two versions at different rates each show their next frame. Each video has
  its own time readout and frame number under it. With Sync off, each player gets its own full
  controls and plays on its own.
- **Different lengths.** The shorter version holds its last frame with "Ended at 0:28.0" over its
  readout while the other plays on. Loop starts both again at 0:00 when the longer one ends.
- **Markers and comments.** Each scrubber shows its own version's markers, and tapping one picks
  that comment and shows its drawing on its own side. The comments column shows the open
  version's comments, with a Select "Comments on" to switch it to version {j}. **Comment at
  {time}** and **Draw** act on the side the comments column shows, at that side's time, and a
  drawing is drawn on that side only. Who can comment on which version doesn't change (**Comments
  on a cut**, **Who can comment, and where**).
- **Full screen** shows both players and the shared controls.

#### The status flow

A cut moves through With Aspire QA, Needs client review, Changes requested and Approved
(**Statuses**). Each side moves it only with its own Buttons, only on the newest version, and only
in the current round.

| Viewer | Status | The moves | What a move writes |
| ------ | ------ | --------- | ------------------ |
| Agency | With Aspire QA | **Send to {brand}** (default), **Back to editor** (outline), **Upload new version** (outline) | Send: `sentAt:`, `sentBy:` and a `sends:` entry on the version. Back to editor: an agency only comment and a `qa-v{k}-{id}` key in `agency/cut-{cut}` |
| Agency | Changes requested | **Upload new version** (default), **Send to {brand} as is** (outline) | Upload: a new version (**Versions**). Send as is: `sentAt:`, `sentBy:` and a `sends:` entry again, with `resent:` true |
| Agency | Needs client review | **Nudge {brand}** (outline) | A tag for the client side |
| Agency | Approved | None. The last move line says who approved | Nothing |
| Client | Needs client review | **Approve** (default), **Request changes** (outline) | The client's call |
| Client | Approved | **Undo approval** (ghost) | The client's call, set to `null` |
| Client | With Aspire QA or Changes requested | None: "Aspire is checking version {v}" or "Aspire is making changes" | Nothing |

{brand} in a Button is the client's name from the campaign record, as everywhere on the page.

**Send to {brand}.** Opens a Dialog "Send version {k} to {brand}?": "{brand} can watch, comment
and approve it once it's sent." When a brief check failed or isn't checked yet, it adds "{f}
failed and {u} not checked: {check names}." with the names, and when the version has open agency
only comments, "{c} agency only comments are still open.", so nothing is sent by accident; neither
blocks the send. Cancel (outline) and Send (default). Send reads the version first: when another
Editor sent it a moment ago, it writes nothing and says "{name} sent it a moment ago." Otherwise
it merges `sentAt:` (now) and `sentBy:` (the Editor's id) into
`reviews/cut-{cut}/versions/v{k}`, adds `{at, by, side: agency, asIs: false}` to its `sends:`, and
merges `latest:` into `reviews/cut-{cut}` (**1e**, Reviews), and logs one `upload` entry, verb sent, "Sent version {k} of
@{handle} V{n} to {brand}", in the Editor's client readable log, so the client's **Inbox** gets one
New item opening the version. The cut is Needs client review in every open view.

**Back to editor.** For a version in QA that needs a fix before {brand} sees it. A Dialog "Back to
editor" with a Textarea "What to fix", required, whose tag picker lists Aspire's side only
(**Tagging**, **Agency only boxes**), and Cancel and Send back. It saves the words as an agency only
general comment on the version (**Agency only comments on a cut**), with its tags, and writes
`qa-v{k}-{id}:` `{at, by, side: agency, comment}` in `agency/cut-{cut}`, one key per return,
`{id}` a new random id the page makes for each return, never the writer's id. It logs one `upload` entry, verb changed,
"Sent version {k} back to the editor", in the agency log. The status stays With Aspire QA, and the
agency's view shows "Back with editor" until a newer version is added or this one is sent. None of
it is in the client's data.

**Send to {brand} as is.** For a request for changes Aspire answers without a new cut, because
the comments settle it or {brand} asked for something the brief rules out. A Dialog "Send version
{k} again, unchanged?": "{brand}'s request for changes on version {k} closes, and the version goes
back to them for review. Reply to their comments first, so they know why." with Cancel and Send as
is. It merges `sentAt:` (now), `sentBy:` and `resent:` true into the version, adds `{at, by,
side: agency, asIs: true}` to its `sends:`, updates `latest:` on the cut, and logs one `upload`
entry, verb sent, "Sent version {k} of @{handle} V{n} to {brand} again, unchanged", in the client
readable log. A call counts only when it answers the version's newest send (**The call that
counts** below), so the request for changes stops counting and the cut is Needs client review
again. The request stays in **History** and the comments stay on the version.

**Nudge {brand}.** For a cut waiting on {brand}. A Dialog "Nudge {brand}" with a Select "Who",
"Client" first ("Everyone approving for {brand}") and then the people on {brand}'s side the page
knows (**Tagging**, **Which people are listed**), a Textarea filled with "@Client version {k} of
@{handle} V{n} is ready for your review." that the Editor can change, and Cancel and Nudge. It
writes one tag per recipient under `tags-client/{id}/items`, as any tag is written (**1e**,
**Tags and the inbox**): `on:` `nudge-cut-{cut}-v{k}-{at}`, `{at}` the nudge's time, so every
nudge is new, its id `{on}-{recipient}`, `author:` and `byName:` the Editor, `anchor`
`#review/r{n}/{cut}/v{k}`, and `version:` {k} beside them; then it merges `lastAt:` into
`tags-client/{id}`, creating that writer document under the short lease the first time, so the
inbox finds the tag even from an Editor who never tagged anyone. Each person it names gets a
"Tagged you" item in their inbox that opens the cut. Like any tag, the next chat run lists it in
**Delivering tags**, which offers to post it to the campaign's saved destinations after a confirm;
the page itself sends no message. The nudge also logs one entry, kind `status`, verb nudged,
asset `cut-{cut}-v{k}`, "Nudged {brand} on version {k} of @{handle} V{n}", in the Editor's agency
log, so **History** shows it to the agency while the client's inbox holds only the tag. The line
under the Button reads "Nudged by {name}, 2 hours ago", from the newest of those entries.

**Approve, Request changes and Undo approval.** For the client only. They never render for an
Editor, in **Preview as client**, or for a read only client.

- **Approve** saves at once with no Dialog. The last move line reads "Approved by you, just now",
  and **Undo approval** takes its place.
- **Request changes** needs at least one open comment on the version that the client can read: a
  visible thread, not resolved, started by either side. With none it is disabled, with the Tooltip
  "Add a comment on what to change first." With one or more it opens a Dialog "Request changes on
  version {k}?": "Aspire sees your {c} open comments and makes a new version.", the open threads'
  first words as a list, and Cancel and Request changes.
- **Undo approval** saves the call as `null`, and the cut is Needs client review again.

A call is one document under the client's own id, `cut-calls/{id}/items/{cut}-v{k}` (**1e**),
written whole with a `set`: `call:` (approved, changes, or `null` once undone), `version:`
{k}, `send:` the version's `sentAt:` as the page showed it, `file:` the version's `asset:` (or
`link` for a linked version) as the page played it, `at:`, `by:` (the same id as the path's),
`byName:`, `side:` client, and on a request for changes `open:` the ids of the open threads it
rested on. The page also records the call in the client's own
`data/users/{id}/cut-calls` and merges `lastAt:` into `cut-calls/{id}`, then logs one `decision`
entry, verb approved, requested changes or undid, asset `cut-{cut}-v{k}`, in the client's own log.

**What review status holds.** Each move is stored with who made it, their side, the version and
the time. The client's calls are their `cut-calls` items, each with `by`, `side`, `version` and
`at`; an item is rewritten whole on each call, so it holds that person's newest call on the
version. Aspire's sends are on the version they send: `sends:` lists every one (`{at, by, side,
asIs}`), and `sentAt:` and `sentBy:` repeat the newest. Back to editor keeps one `qa-v{k}-{id}`
key per return in `agency/cut-{cut}`, since it is about a version {brand} hasn't seen. A nudge is
its tags. Every move also logs one entry, so **History** lists each one, earlier calls included.

**The call that counts.** The page reads every writer's item for the version and leaves out:

1. **An item from Aspire's side**: its writer has an `editors/{id}` marker, or is in `sides`
   `editors`. The agency sees it with a warning Badge "Not counted" and "Calls from Aspire accounts
   don't count. Only {brand} approves cuts."
2. **An item from a refused account**: `{writer}/cut-calls` is in `sides` `refused` (**Pulling
   decisions**). It shows "Not counted" the same way.
3. **An item that doesn't answer the newest send**: its `send` isn't the version's `sentAt:`.
4. **An item for another file**: its `file` isn't the version's `asset:` (or `link`) now, so a
   file swapped on a sent version never carries an approval the client gave the old one. The agency
   sees it "Not counted" with "The file changed after {name}'s call."

Of the rest, the newest by `at` counts. The version is Approved when its `call` is approved,
Changes requested when it is changes, and Needs client review when the version is sent and no
item counts or the newest is `null`. This is the one read behind every Approved on the page:
**Statuses**, the count tiles, the calendar's Approved, Selected Creators' step 7, Home's counts
and the export.

A counted call from an account in neither `sides` `deciders` nor `approvers` makes the cut read
Approved, with a processing Badge "Aspire to confirm" beside the status for the agency, until the
CM's next pull confirms or refuses the account (**Pulling decisions**, **The cut calls**). Selected
Creators' step 7 waits for it, as step 3 waits for a fee approval to be confirmed: it ticks only
once every approval it rests on is from a confirmed account. The client's own page compares the calls under their id with their private
`data/users/{id}/cut-calls`, by id and `at`, and shows a warning Badge "This isn't a call you
made" on any it doesn't hold.

A call a page from before kept as a `status` stamp in `client/cut-{cut}-v{version}`, which an
Editor could also write, never counts. When its value is approved, it shows to the agency as
"Approved on the earlier page, not recorded", so {brand} approves that cut again on the page; any
other value shows nothing. Such a cut steps back to Needs client review, and the creator's step 7,
the calendar's Approved and step 8's fallback step back with it. So the first publish that
declares `cut-calls` lists those cuts in its message to the CM: "{k} cuts {brand} approved on the
earlier page need approving again, because only an Approve saved under {brand}'s own account
counts now: {cuts}. Steps 7 and 8 step back for {creators} until they do." Counting the old
stamps would let any Editor's write stand as {brand}'s approval, which is what this rule removes.

**Approved needs {brand}'s Approve.** No move on Aspire's side writes a call, and a call from an
Aspire account doesn't count, so a cut reaches Approved only when someone on {brand}'s side
presses Approve. **1e**, **What the rules enforce, and what they can't**, **Cut approvals: what
holds and what doesn't**, says how far that holds and where it doesn't.

#### The brief check

Eight checks of a version against the creator's brief and the basics of a Reels ad. The ticks are
kept on the version in shared page data, so every viewer sees the same ones on every device, and
nothing is seeded: a check reads "Not checked" until an Editor ticks it, or, for the runtime,
until the file fills it.

| # | Check | Id | Checked by |
| --- | ----- | --- | ---------- |
| 1 | The hook lands in the first 2 seconds | `hook` | An Editor |
| 2 | Brand mark in the first 3 seconds | `brand` | An Editor |
| 3 | Product on screen by 0:04 | `product` | An Editor |
| 4 | The CTA matches the brief | `cta` | An Editor |
| 5 | Captions burned in | `captions` | An Editor |
| 6 | Clear of the Reels safe zones | `safezone` | An Editor, with the overlay (**Reels safe zone**) |
| 7 | Paid partnership disclosure in the final 5 seconds | `disclosure` | An Editor |
| 8 | Runtime 15 to 60 seconds at 9:16 | `runtime` | The file |

**Each row.** The result Badge (Pass success, Fail warning, Not checked soft, Can't check soft),
the check's name, and on the right, for the agency in the current round, two ghost Buttons size
sm, "Pass" and "Fail", with `aria-pressed` and the toggle pressed classes (**Component classes**,
Review panel). Checks 1, 2, 3 and 7 add a link Button with their window, "Watch 0:00 to 0:02",
"Watch 0:00 to 0:03", "Watch 0:00 to 0:04" and "Watch the last 5 seconds", which seeks to the
window's start, plays it, and pauses at its end. Check 3 names the creator's product for the round
under it ("Product: {name}", **Selected Creators**). The Badge's Tooltip says who ticked it and
when ("Ticked by {name}, 2 days ago").

**The brief, beside the checks, for the agency only.** Above the rows, in a `rounded-md border p-3`
block titled "This variant's brief": Hook ("H2 · Demo first") with its line in full, CTA ("C1 ·
Direct") with its line, Framework by code and name, and Target length, the variant's length. All
four are read live by **Reading a creator's variant** for this cut, never copied, so an edit to the
brief shows at once, with the Badges that read brings ("Broken", "Cut for {concept}", "Plan
changed since this cut"). Checks 1 and 4 repeat the hook line and the CTA line under their names
in `text-xs text-muted-foreground`, for the agency only.

**Ticking.** Pressing Pass or Fail saves the version's `check-{id}` stamp with `value` pass or
fail, `source` `manual`, merged as its own field (**1e**, **Every editable value**); pressing the
pressed one again saves `null`, back to Not checked. An optional note per check, from a ghost icon
Button "Add a note" (Lucide `sticky-note`), saves as `check-v{k}-{id}` in `agency/cut-{cut}`, since
a note can quote the hook or the CTA. Each tick logs one `checklist` entry, verb ticked or
unticked, "Brief check on version {k} of @{handle} V{n}: Captions burned in, Pass", in the agency
log while the version is in QA and in the client readable log once it is sent, as a comment does
(**Comments on a cut**). Editors can tick any version of the current round, before or after it is
sent; a done round is read only.

**Runtime and aspect, from the file.** Check 8 has no Pass or Fail Buttons on an upload. It is
worked out live from the version's `duration:`, `width:` and `height:`: Pass when the length is 15
to 60 seconds and the width over the height is within 1% of 9:16; else Fail, saying which part
failed ("0:12.4, under 15 seconds", "1080 × 1350 is 4:5, not 9:16"). The line under it shows the
figures for everyone: "0:32.0 · 1080 × 1920 · 9:16". Those fields are written with the version
(**Adding a cut**, **Versions**), so the check fills itself the moment the version is added. An
upload from before with no size or length gets them from the first Editor's page that loads its
video, written once, as the playback frame rate is (**Frame rate**); until then it reads Not
checked. A linked version has no file the page can read, so check 8 reads Can't check with "Plays
outside this page", and an Editor ticks it by hand like the others. Beside it, for the agency only,
"Target {length}" from the variant's plan.

**Suggest ticks, from the frames.** An Editor can ask Claude, through the page's `sample`
capability, to suggest checks 1 to 7 for an uploaded version. Claude only suggests; the Editor
confirms each one.

- **What Claude can be given.** A `sample` call takes text and images, never sound or video, and a
  cut has no transcript on the page: cuts live only in page data, never in Atlas, so there is no
  Atlas transcript of one (**What this flow never does**). So the suggestion reads still frames
  only, and anything only heard (a spoken hook, a spoken CTA, a spoken disclosure) comes back Not
  sure. It can't replace watching the cut with sound on.
- **The Button.** A ghost Button "Suggest ticks" with the Lucide `sparkles` icon above the rows,
  for Editors only, on an uploaded version that plays, in the current round, and only where
  `sample.limits()` reports `images`. Pressing it asks the Editor's own consent the first time and
  uses their own Claude usage.
- **The frames.** The page draws frames of the version's own video onto a canvas: 0.5, 1, 1.5, 2,
  2.5, 3, 3.5 and 4 seconds; one every 3 seconds from there to 5 seconds before the end; each
  second of the final 5 seconds; and 0.2 seconds before the end. It follows **Which frames** in
  `content-review.md`, with more frames in the windows the checks name. Past the count
  `sample.limits()` allows, middle frames are dropped first. Each frame is scaled to 720 pixels tall
  and saved as JPEG at 0.85 quality, under the largest file the limits allow. The upload is served
  from the page's own address, so the canvas can be read; a frame that can't be drawn is left out
  and named.
- **The call.** `sample.json` on the default tier, with `cache` left on, once per press. The input
  holds the instruction, the seven checks with their windows, each frame's time in order, {brand},
  the product's name, the hook line and the CTA line from the plan, the safe zone's shares of the
  frame (**Reels safe zone**), and the shape to answer in: `{checks: {hook, brand, product, cta,
  captions, safezone, disclosure}}`, each `{value: "pass" | "fail" | "unsure", at: seconds or
  null, why: "one sentence"}`. The instruction carries the content review rules: judge only what
  the frames show, never infer speech from pictures, and pass the disclosure only on a visible
  paid partnership label or on screen "Paid partnership" or "#ad" text in the final 5 seconds.
- **While it runs.** "Looking at {f} frames..." and a ghost Button "Stop", which ends the call and
  keeps nothing.
- **The answer.** Under each check, an outline Badge "Suggested: Pass", "Suggested: Fail" or "Not
  sure", the reason in `text-xs text-muted-foreground`, the time as a link Button that seeks there,
  and a ghost Button size sm "Use". "Use all" above the rows takes every Pass and Fail suggestion
  and leaves Not sure alone. Using one writes the same stamp a tick writes, by the Editor, and logs
  the same way. Nothing is ticked until then. The answer is saved as `suggest-v{k}` in
  `agency/cut-{cut}` (`{at, by, frames, results}`), so other Editors see it, and never where the
  client reads, since a reason can quote the hook or the CTA. A suggestion logs nothing.
- **When it fails.** Declined consent hides the Button for the visit with "Claude isn't allowed on
  this page for you. Tick the checks by hand."; a rate limit says "Try again in a minute."; any
  other failure "Couldn't suggest ticks. Tick them by hand." It never retries on its own.

For a full review against the brand's guidelines and brand safety, with sound, the CM runs the
**Content review** flow from the chat (dispatch row 16).

**What the client sees.** On a version sent to them: the eight rows with their result Badges, read
only, the product line under check 3, and check 8's figures. Not the hook, the CTA, the framework
or the target length, no notes, no suggestions, and no Pass or Fail
Buttons. **Preview as client** shows the same. The ticks are in `reviews`, which the client reads;
the check names are the same for every cut and no tick holds hook, CTA or framework text, which
stay in `agency`. A Fail on "The CTA matches the brief" tells {brand} the CTA is off, not what the
brief asked for. A read only client sees none of it (**What the client sees**).
