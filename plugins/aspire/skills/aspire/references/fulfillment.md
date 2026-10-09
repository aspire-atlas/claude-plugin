# Product fulfillment reference

Shared by the `atlas-product-fulfillment` agent and the **Product fulfillment** section of
SKILL.md. Holds who is owed product, the pick rule, the details requests, recording, the order
form page, ordering, tracking, the posting odds for gifting, the fields this agent adds to the
state model, and the read-only status mode (the shipping check). The state model, connected tools, drafts and
sending, and the order form's data rules are in `program.md`; this file only adds to them.

## Why the agent exists

Product is where a creator program goes quiet. Sizes go missing in email threads, parcels
arrive and nobody notices, and the posting clock never starts. The agent picks a product that
suits each creator, asks for the details, keeps one order form the team works from, places or
lists the orders, and watches each parcel until it arrives. Arrival starts the posting window,
so the deliverable tracker knows when a post is due.

It is interactive. A person confirms every pick, every record, every draft in the mailbox, and
every order. The status mode, which the scheduled shipping check runs, only reads and reports.

## Who is owed product

Read the newest `roster`, `terms`, and `fulfillment` per creator. A creator's deal is their
newest `terms` finding, or the program's terms for their type when there is none (`program.md`,
**Who owns a deal**). A creator is owed product when:

| Type | Stage | And |
| ---- | ----- | --- |
| `paid` | Agreed or later | The deal has `productValue` above 0, or names a product in `deliverables` |
| `ambassador` | Agreed or later, not Paused | The deal has `productAllowance` above 0. One order per month of the term (`orderKey` `YYYY-MM`), worth no more than the allowance |
| `gifting` | Agreed or later (outreach records a gifting yes as `accepted` and moves the creator to Agreed) | Always; the deal is the program's `terms.gifting` |
| `affiliate` | Agreed or later | Only when the deal has `productValue` above 0 |

Skip, and list with the reason: a creator who is Declined, No reply, Dropped, or Paused; one
whose `fulfillment` for this `orderKey` is already ordered, shipped, or delivered; affiliate
deals without product; and anyone when the program ships no product (`catalog` missing and
P6 was "Not shipping product").

Gifting creators at Approved, Contacted, or Replied belong to outreach until they accept.

## Picking the product

1. **The catalog.** Start from `program:{slug}-catalog`. When `connections.store.canReadProducts`
   is true, re-read the products from the store (a read, no confirmation) and use the store's
   names, variants, and prices for this run. When the store's list differs from the saved
   catalog (a product gone, a new one, a price change), use the store's and put the difference
   under "Needs the main thread" for a supersede; never write the catalog yourself.
2. **The cap.** Gifting: `terms.gifting.productValueMax`. Paid and affiliate: the creator's
   `productValue`. Ambassador: the month's `productAllowance`. A product above the cap is never picked; when nothing fits under it, the creator goes
   under "Needs confirmation" with the closest product and its value.
3. **Stock.** When `connections.store.canReadInventory` is true, read the stock for each
   candidate. Drop a product with nothing in stock. With the options known, check that variant;
   without them, say "in stock in {n} of {m} sizes".
4. **Fit to the creator.** Read the creator's posts in Atlas from the last 90 days with
   `search_posts` (the creator's account, the fields `list_post_search_fields` returns, caption,
   transcript, and themes when present), and the audience fields `search_creators` holds. Pick
   the product whose use shows up most in what they make ("cooks weeknight pasta in 6 of 20
   Reels" picks the pan, not the knife set). Use the audience only to catch a mismatch with a
   product note ("ships US only" against a mostly UK audience goes under "Needs confirmation").
   On a tie, prefer the product fewer creators in this program have received, so the content
   varies. With no posts in Atlas, say "no posts to match", propose the program's most picked
   product, and mark it for the user to check.
5. **The reason.** One plain line per pick, citing what decided it, with a post link when one
   did.

**Creator choice.** When F1 says `creator-choice`, offer up to six products under the cap and in
stock. The order form shows them as a picker on that creator's row, and the details request
lists them by name with their links. **Same for everyone** (`same:{product}`) skips the fit
step but still checks the cap and stock per creator.

## Details requests

One `draft` per creator owed product whose details are not yet received. Channel: email when
the creator has `contact.email` and the program's channels include email; otherwise Instagram
or TikTok DM, then Aspire message. To a creator with a manager, address the manager and name
the creator. First name only. Follow `program.md`, **5**: never the budget, the program's
maximum, the product's value, another creator's terms, or a team note.

The request asks the creator to reply with their details. It never links the order form, which
is for the team only (`program.md`, **6**).

Placeholders in braces come from the records. Anything the records do not hold is a bracketed
blank for the user to fill, never invented. Write in the brand's voice from
`program:{slug}-outreach`.

**Details** (`template` `details`):

```
Subject: {Brand}: getting your {product} to you

Hi {name},

So glad you're on board. To get your {product} to you, could you reply with:
1. Your shipping address (name, street, city, postal code, country), or a pickup if you prefer
2. Your {options, e.g. size and color}
3. Anything we should know for delivery

{Sender}
```

**Details, creator's choice** (`template` `details-choice`): the same, with item 2 replaced by
"Which one you'd like: {product 1} ({link}), {product 2} ({link}), {product 3} ({link}), and
your size or color".

**Gifting details** (`template` `details-gifting`): opens "Thanks for saying yes!" and closes
with one line from the gifting terms: "No obligation to post. If you do share it, please add
{disclosure}." When `postExpected` is `owed`, the line names the post and window from the terms
instead.

**Arrival check-in** (`template` `arrival-check`):

```
Subject: Re: {Brand}: getting your {product} to you

Hi {name},

Your {product} should have reached you by now. Did it arrive okay? If anything's missing or
not right, just reply and we'll sort it.
```

**Issue follow-up** (`template` `issue`): one short paragraph that names the problem the creator
reported and the fix the user chose (a replacement, a different size), and asks them to confirm
the address. Written only once the user has decided the fix.

DM and Aspire message versions are the same content in three short lines, no subject. Every
draft is a `draft` finding. A mailbox draft is created only for F3's creators, after which the
finding carries `mailDraftId`. Nothing is sent (`program.md`, **5**).

## Recording details and status

Every record change comes from F5, line by line, or from F5 `store-status`.

| Source | What it gives | Writes |
| ------ | ------------- | ------ |
| A details reply (outreach triage recorded it and moved the creator to Details received; F5 carries its text) | Address or pickup, options, product choice, delivery notes | `fulfillment` received, and the form row |
| The order form (a row newer than its record) | The same, plus status, carrier, tracking a person typed | The matching status; details typed here also move the roster to Details received when it is not there yet, `waitingOn` brand |
| Pasted tracking | Carrier and tracking number | `fulfillment` shipped, `shippedAt` the date given or today |
| The store, with `canReadOrders` and F5 `store-status` | Order fulfilled with tracking, delivered | `fulfillment` shipped or delivered with the store's dates |
| A creator or the user saying it arrived | Delivery | `fulfillment` delivered |

Rules:

- Copy the newest `fulfillment` detail for the creator's `orderKey`, change what moved, and
  write it whole (`program.md`, **1**). The same for `roster`.
- Marking a details request sent moves the creator to Details requested in the main thread
  (`program.md`, **5**). The next run with F2 `save` writes that creator's `fulfillment`
  `requested`, since the send was already confirmed.
- A reply asking for a different product above the cap, a product out of stock, or a lost or
  damaged parcel is an `issue`: set `fulfillment` `issue` with the problem in one line, and the
  roster `yourCall` with the question ("@a's parcel shows delivered but they say it didn't
  arrive. Send a replacement, or check with the carrier first?").
- A product sent back is `returned`. A replacement reuses the `orderKey` with a new
  `orderRef` and `replacement` true.

## The order form page

One page per program, the **order form**, republished to the link in its `page` finding (key
`orderForm`). It is for the brand's team, never for creators (`program.md`, **6**). Title
"{Brand} {program name}: product orders". It is the only page that holds addresses, and it holds
them only in its page data, never in the page's own HTML.

**Capabilities**, declared in full on every publish (a publish that restates the set replaces
it):

```json
{"db": {"rules": [
  {"path": "", "read": "interact", "write": "admin"},
  {"path": "rows", "read": "interact", "write": "interact"},
  {"path": "data/users/{self}", "write": "interact"}
 ]},
 "user": {},
 "downloads": true}
```

This is `program.md`, **6**, exactly. `downloads` lets the team save the order sheet from the
page. In the share menu's words: the team shared as Contributor or Editor reads and edits
rows; a Viewer or Commenter, and anyone outside the brand's organization, reads no rows at all.

**Rows** at `rows/creator-{net}-{handle}`, fields per `program.md`, **6**: `product`, `options`,
`shipTo` `{name, line1, line2, city, region, postalCode, country}`, `pickup`, `notes`, `status`,
`carrier`, `tracking`, `updatedBy`, `updatedAt`. Done marks at `data/users/{id}/done`, field
`items`. `{net}` is `ig` or `tt`.

**What the HTML holds:** the creators (avatar, handle, name, type), the product picked or the
products offered for a choice, the status labels, and the catalog names. No address, no product
value, no fee, no terms, no contact details.

**Sections, in order:**

1. **Header.** Brand theme per `theme.md`, **Applying the theme**. Title, then "Product orders ·
   {n} creators · updated {time}". Under it, a notice that always shows: "For your team only.
   Don't share this form with creators: everyone who can open it sees every creator's address." A status strip with counts: Waiting on details, Ready to
   order, Ordered, Shipped, Delivered, Issue.
2. **Your to-do.** Per viewer: rows missing details, rows ready to order, parcels past their
   delivery window, issues. Each with a checkbox; done marks save to the viewer's own
   `data/users/{id}/done`. "Show done" brings them back. Empty: "Nothing waiting on you."
3. **Orders.** One row per creator owed product, grouped by status in the strip's order. Each
   row: the creator (avatar per `creator-card.md`, **Images**, page profile, handle and name),
   product (a picker over the offered products when the creator chooses), options, ship to (the
   address fields) or pickup, delivery notes, status (a dropdown: to request, requested,
   received, ordered, shipped, delivered, issue), carrier, tracking. Fields are editable only
   when the viewer can write (`user` capability, `can("data.write")`); otherwise labels. The
   page writes a field only when the person changed it, one write per change, with `updatedBy`
   (the viewer's id) and `updatedAt`.
4. **Order sheet.** Shown when any row is received. The rows ready to order in the sheet's
   columns (below), built in the browser from the rows, with "Download order sheet" (the
   `downloads` capability; hidden when it is not available).
5. **Footer.** "Addresses show to everyone this form is shared with, so share it only inside
   your team. Statuses from Atlas as
   of {time}." Plus "Product from {store}" when a store was read.

The page renders before its data loads and works with no rows. Load `artifact-design` before
building.

**First publish.** Say once: "Share this order form with your team as Contributor, so their
entries save. Only share it inside your team: everyone on it can see every address." Write the
`page` finding (`key` `orderForm`, `url`, `title`) in the same F2 approval as the run's other
writes.

**Seeding the rows**, right after each publish, in one `ArtifactData` batch:

- A creator with no row: create it from the newest `fulfillment` (product, options, ship to or
  pickup, notes, status, carrier, tracking), `updatedBy` `atlas-product-fulfillment`,
  `updatedAt` the record's `recordedAt`.
- A row older than its record: update only `status`, `carrier`, `tracking`, `product` when F1
  set it, and the address fields when F5 recorded them, pinned to the version read in Process
  step 5. A pin that fails means a person edited it since: leave their edit and list it under
  "Needs confirmation".
- Never overwrite a field a person typed with an empty value. Never delete a row.

**The check**, once after the first publish in a session: list `rows`, then list `rows` again
with `as_level` `view`, which must come back empty. Report both in the audit trail.

## Ordering

Ready to order: rows with `fulfillment` received, a product, the options the product needs, and
a ship to or a pickup. Pickups never go to a store; they stay on the form with the visit date.

**Say what the store can do,** once, when ordering starts, in one line: "I can place these
orders in {store} after you confirm." or "I can read your products and orders in {store}. Orders
go on a sheet for you to enter." Never why.

**With `connections.store.canCreateOrder`.** Propose the batch under "Needs confirmation" as
the picker: "Place {n} orders in {store}? @a: {product}, {options}, to {city}; @b: …" Options:
"Not yet (Recommended)", "Place these {n}". Only the rows in F4 are placed: one order per row,
no charge to the creator, the variant matching the options, shipped to the row's ship to, with
the note "{program name}: creator product for @{handle}". Record the store's order number as
`orderRef`, `orderedAt`, `orderMethod` `store`; roster stage Ordered. A row the store refuses
stays received, with the store's message in one line.

**Otherwise, the order sheet.** Write a CSV to the session's scratchpad folder (the working
directory when there is none), named `{program name, hyphenated}-order-sheet-{YYYY-MM-DD}.csv`,
quoted per RFC 4180, one line per ready row:

`order_name, handle, network, recipient_name, address_line1, address_line2, city, region,
postal_code, country, product, sku, options, quantity, retail_value, currency, delivery_notes`

`order_name` is "{program name} @{handle}"; `quantity` is 1. The same sheet is on the page.
It goes to the store, the brand's shipping team, or the core Aspire platform. When the user
says the orders were placed, F6 names them and the date; record each with `orderedAt`,
`orderMethod` `sheet`, and `orderRef` when the user gave one; roster stage Ordered.

## Tracking

**Status sources**, in order: F5 lines (pasted tracking, order form, what a creator said), then
the store with `canReadOrders` and F5 `store-status` (match on `orderRef`), then nothing: a row
with no source keeps its status.

**The delivery window.** The store's expected delivery date when it gives one. Otherwise
`shippedAt` plus 7 days when the row's country is the brand's home market in `brand:summary`,
plus 14 days when it is not or when the market is unknown. A pickup's window ends the day after
the visit date.

**Check-ins.** A row shipped and past its window, not delivered, with no `arrival-check` draft
for this `orderKey`: write one. A row with tracking and no store read says "check the tracking"
on the page next to the link the carrier gives, not a guess.

**On delivery:**

1. `deliveredAt`: the store's date, the date the creator or user gave, or today.
2. `postDueAt`: the earliest `due` in the deal's deliverables when they have dates; otherwise
   `deliveredAt` plus the deal's `postWithinDays`. Ambassador: the first day of the order's
   month plus `postWithinDays` (it counts from the start of each month); when the product
   arrives after that date, say so in the hand-off. Gifting with `postExpected` `none` has no
   `postDueAt`.
3. Roster stage Posting due, `waitingOn` creator, when a post is owed or loosely expected;
   Delivered when none is. `nextFollowUpAt` is left to the deliverable tracker.
4. List the creator in the hand-off to `atlas-deliverable-tracker`: handle, type, `postDueAt`,
   and whether the post is owed (paid, ambassador, gifting `owed`) or expected (gifting
   `loose`).

## Posting odds (gifting)

Every gifting row shows how likely a post is, from what Atlas holds and nothing else:

| Label | When |
| ----- | ---- |
| Likely | The creator posted about an earlier gift from this brand (a `deliverable` finding with `owed` false and status posted), or Atlas holds 3 or more posts in the last 12 months that disclose a gift (#gifted, "gifted by", "PR package", "thanks for sending") across 2 or more brands |
| Possible | Atlas holds 1 or 2 such posts |
| Less likely | An earlier gift from this brand was delivered and its window passed with no post (a `deliverable` finding with status missing) |
| Unknown | None of the above, or too few posts in Atlas to say |

Find the gifted posts with `search_posts` on the creator's account for the last 12 months, a
semantic query for gifting disclosures, and a check of each hit's caption or transcript. The
evidence goes with the label in a few words ("2 gifted posts, Mar and Jul"). Never a percentage,
and never "unlikely" from silence: a creator who never posts about gifts may never have been
sent one.

## State written to Atlas

Under `program.md`, **1**: role `account_review`, `runKey` `program-{profile}-{slug}-{YYYY-MM-DD}`,
`schema` = network, `entityKind` `account`, `entityId` = the creator's account id from their
`roster` finding. Written only with F2 `save`, except that F4, F5, and F6 each approve writing
the `fulfillment` and `roster` records they cover (the agent's rule 2), and a `status` run
writes only its `page` finding.

**`fulfillment` adds** to the fields in `program.md`:

| Field | What it holds |
| ----- | ------------- |
| `orderKey` | The identity with the creator, per `program.md`: `YYYY-MM` for an ambassador's monthly order, `1` otherwise |
| `replacement` | True when this order replaces a lost, damaged, or wrong one |
| `sku` | The catalog or store SKU of the variant |
| `pickedBy` | `agent` (confirmed in F1), `user`, or `creator` |
| `pickReason` | The one line that decided the pick |
| `choices` | The products offered when the creator chooses |
| `orderMethod` | `store` or `sheet` |
| `source` | Where the newest change came from: `reply`, `order-form`, `pasted`, `store`, `user` |
| `windowEndsAt` | The end of the delivery window |
| `issue` | The problem in one line, while status is `issue` |
| `postOdds` | `{label, evidence}`, gifting only |

Kinds: `action_item` `medium` until delivered, `went_well` once delivered, `needs_improvement`
for `returned`. `idempotencyKey` `ful-{slug}-{entityId}-{orderKey}-{status}`.

**`draft`** (identity: the creator, the template, and the channel): templates `details`,
`details-choice`, `details-gifting`, `arrival-check`, `issue`, plus `orderKey`.
`idempotencyKey` `draft-{slug}-{entityId}-{template}-{channel}-{orderKey}`.

**`page`**: one per program for the order form, anchored to the brand's own account on its first
linked network: `key` `orderForm`, `url`, `title`. Written on first publish, and again only if
the link changes. `idempotencyKey` `page-{slug}-orderForm`.

**`roster`**: the whole row, with the stage moves above. `idempotencyKey`
`roster-{slug}-{entityId}-{stage}-{YYYY-MM-DD}`.

## Status mode (the shipping check)

`mode: status` reads and reports; it records nothing. The scheduled task "Atlas program shipping
check: {brand} - {program}" (P9 "Daily shipping check", `program.md`, **8**) runs it unattended;
a person can also run it to see where parcels are without recording anything.

1. Read the setup records, the working state, and the order form's rows. With
   `connections.store.canReadOrders`, read the store's orders for the rows that are ordered or
   shipped, matched on `orderRef`. Without a store read, the counts come from Atlas and the form.
2. Work out, without writing: creators waiting on details, rows ready to order, parcels the store
   shows shipped or delivered that Atlas has not recorded, and parcels past their delivery window.
3. Republish the order form to its `page` link (no row writes). Write a `page` finding only when
   none exists, which a scheduled run should never meet (`program.md`, **8**).
4. Unattended, post to the saved routing in two or three lines: "{n} parcels show delivered in
   {store} and {m} are past their delivery window. {k} creators are waiting on details. Open the
   program to record them." Handles may appear; addresses, product values, and fees never do.
   Interactive, return the same lines to the main thread.

It never asks, records a status, moves a stage, writes `fulfillment` or `roster`, drafts,
orders, or writes page data rows. Unattended runs follow `program.md`, **9**.

## What this agent never does

- Pick a product above the cap, or one out of stock.
- Put an address anywhere but the order form's page data, the order sheet, a confirmed store
  order, and the `fulfillment` finding.
- Link the order form in a message to a creator.
- Send a message, or place, change, or cancel a store order without F4.
- Change products, prices, inventory, or discounts in a store.
- Write the catalog, the program object, or another agent's record type.
- Store payment details, or charge a creator.
