# Deliverable tracker reference

Used by the `atlas-deliverable-tracker` agent and the **Deliverable tracker** section of
SKILL.md. Holds the modes, the approvals the main thread collects, how the owed list is built,
how posts are matched, the checks on each post (disclosure first), the status rules, the drafts,
the records the tracker writes, the daily posting check, and the tracker page. Read `program.md`
first: the state model, **Who owns a deal**, connected tools (**4**), drafts and sending
(**5**), pages (**7**), and unattended runs (**9**) apply here as written.

## Why the tracker exists

The question every program owner asks: did every creator post what they agreed, on time, with
proper disclosure? The deal says what is owed and by when. Atlas holds the posts. The tracker
lines the two up, checks each post, and says plainly who has posted, who is late, who is
missing, and whose post needs a fix. People decide what to waive and what to send. The tracker
matches, checks, drafts, and reports.

It reuses the checks of other flows rather than defining its own:

| What | Defined in |
| ---- | ---------- |
| Disclosure: present, visible without tapping "more", buried in a hashtag block is not enough | `content-review.md`, **3. Brand safety** (Disclosure) and **Verdict** (a paid post with no disclosure is always the worst outcome) |
| The paid partnership label is not held in Atlas: a gap, never "absent"; trackers treat it as unclear, never missing | `post-analysis.md`, **The page**, section 9; `program.md`, the terms object |
| Spoken and on-screen words: `analysis.transcript` and `analysis.overlayText`, never inferred from visuals | `content-review.md`, **Media**, Atlas analysis fields |
| The partnership marker the field census exposes | `creator-vetting.md` (Disclosure habits) and `outreach.md` (Pick the post) |
| Templates, channels, voice, and what never goes in a draft | `outreach.md`, **Channels** and **Templates**; `program.md` **5** |
| The deal for each creator | `program.md`, **Who owns a deal**; `negotiation.md`, **Records written** |
| The posting date after product arrives | `fulfillment.md`, **Tracking**, On delivery (`postDueAt`) |

## Modes

| Mode | Who runs it | Reads | Writes (with approval) |
| ---- | ----------- | ----- | ---------------------- |
| `check` | The user, or the Program manager's "Check posts" | Setup records, working state, Atlas posts, posts the user pasted | `propose`: nothing. `record`: `deliverable`, `roster`, `draft`, and the tracker `page` finding, only what T1 and T3 approved |
| `run: unattended` | The scheduled "Atlas program posting check" (P9 "Daily posting check") | The same, Atlas only | `deliverable` findings from strong matches and from the date alone (late, missing), and the tracker `page` finding when missing. Publishes the page and posts to the saved routing |
| `sample` | Anyone, before running it for real | Nothing | Nothing. Publishes the sample page |

`check` runs in two passes. **Pass `propose`** reads, builds the owed list, matches, checks,
drafts, and publishes the page with every change marked proposed; it writes nothing to Atlas and
returns the `tracker-packet`. The main thread asks T1 to T5. **Pass `record`** writes what was
approved and republishes. An unattended launch (`run: unattended`, or older wording per `readout.md`, **Run flag**) runs the
unattended row whatever mode it names.

## Approvals (asked by the main thread)

The agent never shows a picker. The main thread asks with `AskUserQuestion` and passes the
answers in. Up to four questions fit in one call.

| # | When | Question | Options | Approves |
| - | ---- | -------- | ------- | -------- |
| T0 | Before `propose`, only when the user pasted post links | "Look up these {n} posts in Atlas, and fetch any it doesn't hold yet? It can take a minute." | Look them up (Recommended); Skip them | `lookup_posts` for exactly those links, in `check` only |
| T1 | After `propose` | "Save the posting check for {program}? {p} posted, {l} late, {m} missing, {f} need a fix. {moves}" where `{moves}` names the stage moves ("@a and @b move to Posted.") | Save the check (Recommended); Change something; Page only | Every `deliverable` finding in the packet, the named `roster` moves, and the tracker `page` finding on first publish |
| T2 | After `propose`, only when matches need confirming (multiSelect) | "Which of these posts count for the deal?" One option per open match: "@a: {format} {date}, as {deliverable}". The description quotes the caption's first words and names why it is unsure | Each picked match is confirmed; the rest stay unmatched | Matching those posts. An unpicked match is never written as posted |
| T3 | After `propose`, only when there are drafts | "Save {n} drafts for {program}? Chases to @a and @b, a fix request to @c, thanks to @d." | Save the drafts (Recommended); Show them here only | The `draft` findings for the named creators |
| T4 | With T3, only when email is a program channel, `connections.mail.canDraft` is true, and `outreach.mail` names that mailbox | "Create {n} email drafts in your {Gmail or Outlook} for @a, @b and {n-2} more? Nothing is sent." | Create the drafts (Recommended); I'll copy them myself | Creating mailbox drafts for exactly the named creators' email drafts |
| T5 | One per open item (**Your call**) | Worded by the agent, recommended answer first | The answers listed in **Your call**, plus "Decide later" | The status or draft each answer names |

Rules:

- Ask T2 and T5 first: their answers change the counts in T1. When the answers change a status,
  the main thread relaunches `propose` with the answers as overrides, then asks T1, T3 and T4
  with the new counts. When they change nothing, ask T1, T3 and T4 in the next call.
- T1 "Change something": the user's words become overrides on a new `propose`. "Page only"
  writes nothing; the page stays as proposed and the link is saved on the next approved run.
- Without T1, write no `deliverable` or `roster` finding. Without T3, write no `draft`. Without
  T4, create no mailbox draft. Nothing is ever sent by this agent: sending follows `program.md`
  **5** in the main thread.
- A waiver is the user's alone (**Waived**). The tracker never proposes one as a default.

## The owed list

Read the program state per `program.md` **1**: the newest finding per identity by
`detail.recordedAt`. For each creator on the roster at stage Agreed or later (not Declined,
Dropped, or No reply), take the deal: the newest `terms` finding with `status` agreed when one
exists, and otherwise the program's terms for the creator's `type` (**Who owns a deal**).
Affiliate-only deals owe no posts unless their terms list deliverables. Then build one row per
deliverable:

| Type | Deliverables | Due |
| ---- | ------------ | --- |
| `paid` | The agreed `terms.deliverables` list (what, count, due), one row per unit ("Reel 1", "Reel 2", "Story 1"). Without the list, parse the program's `terms.paid.deliverables` text ("1 Reel + 3 Stories") into the same rows | The row's own `due` when the deal dates it. Else the creator's newest `fulfillment` `postDueAt`. Else `agreedAt` plus `postWithinDays` when the deal ships no product. Else no due date: the row shows "no date set" and is never late |
| `ambassador` | The monthly quota (`terms.monthly` from negotiation, else the program's `terms.ambassador.monthly`) for every month of the term that has started, one set of rows per month | The first day of that month plus `postWithinDays` (`program.md`: it counts from the start of each month), and never past the month's last day. The month's `fulfillment` `postDueAt` when it is later, because the product arrived late |
| `gifting`, `postExpected` `owed` | One post, or the rows the terms list | The `fulfillment` `postDueAt`, else `deliveredAt` plus `postWithinDays`. No delivery yet: not due |
| `gifting`, `postExpected` `loose` | One **expected** post (`owed` false) | As above. Shown in its own section and never chased |
| `gifting`, `postExpected` `none` | Nothing | |
| Hybrid (`paid` or `ambassador` with `commissionPct`) | As its base type | As its base type |

Rules:

- **Deliverable key.** Each row has a `deliverableKey` that stays the same across runs:
  `v{terms version}-{format}-{n}` for paid (`std` for the version when the deal is the
  program's), `{YYYY-MM}-{format}-{n}` for ambassadors, `gift-{orderKey}-post-{n}` for gifting.
  `{format}` is lowercase: `reel`, `story`, `post`, `carousel`, `tiktok`, `video`.
- **Rows already recorded win.** When a `deliverable` finding exists for the key, start from
  its newest finding: a `waived`, a confirmed match, and a user's change are kept.
- **A changed deal.** When a newer agreed `terms` version changes the deliverables, rows of the
  old version that are not posted are replaced; posted rows stay. Name the change on the page.
- **Grace days.** `missing` comes `graceDays` after the due date: the deal's `graceDays` when it
  holds one, else the program terms' `graceDays` for the type, else 3 (`program.md`, the terms
  object). The page says which.
- **Required items.** `mustInclude` from the deal, else from the program's terms block for the
  type (a tag, a link, the code), plus the creator's `code` on an affiliate or hybrid deal.
  Absent everywhere: nothing beyond the disclosure is required.
- **Window.** Posts count from the start of the deal: `agreedAt` for paid, the first day of the
  month for an ambassador's month, `shippedAt` for gifting (a creator may post on arrival).
  Never a post from before the deal.
- Never invent a deliverable, a date, or a count. A deal with no deliverables at all is listed
  under "Needs the main thread" ("@a's deal lists no posts").

## Matching posts

Read only what Atlas holds. `list_post_search_fields` once; use only the paths it returns.

**Find the candidates.** For each creator with rows due or past due, one `search_posts` filtered
on the creator's author username on their roster network, from the window start to today,
newest first, limit 50, projecting `postedAt`, `url`, `instagram.permalink`, `text`,
`mediaKind`, `instagram.mediaProductType`, `instagram.hashtags`, `instagram.mentions` (the
container), the partnership marker, `analysis.transcript`, `analysis.overlayText`,
`analysis.commercialAnalysis.featuredBrands`, `analysis.commercialAnalysis.promoCodes`, and the
`media` container, when the census lists them.

**Brand signals** a post can carry, strongest first:

1. It tags or mentions one of the brand's handles (mentions field, or `@handle` in the caption).
2. It carries the creator's code from the deal (`terms.code`), in the caption, on screen, or in
   `promoCodes`.
3. It carries a hashtag or tag in the deal's `mustInclude`, or the disclosure the deal names
   together with the brand's name.
4. The caption, transcript, or on-screen text names the brand, or `featuredBrands` lists it.
5. It names a catalog product, or the product the creator was sent.

A post with no brand signal is not a candidate. The creator's other posts never count.

**Format.** The post's format comes from `mediaKind` and `instagram.mediaProductType` (Reel,
feed post, carousel, Story) or the network (a TikTok video). It is compared with the row's
format.

**Assign.** One post fills one deliverable, and a post already on any `deliverable` finding
with status posted or needs fix is taken. For each creator, take the rows oldest due first, and
give each the earliest unassigned candidate that matches its format, then any remaining
candidate. Each match is one of:

| Match | When | Counts as |
| ----- | ---- | --------- |
| `strong` | A brand signal from 1 to 3, the format matches, and no other row or post competes for it | Matched |
| `confirmed` | The user picked it in T2, or a recorded finding already holds it | Matched |
| `open` | Only a signal from 4 or 5; or the format differs; or two candidates fit one row, or one candidate fits two rows; or the post was published before the row's month or window | Not matched until T2 confirms it. Listed under "Matches to confirm" |

Never force a match. An open match never makes a row posted, and while one is open the row is
never marked `missing`: it stays `late` with "a possible post to confirm".

**Formats Atlas may not hold.** Stories are often not held. A Story row is matched only when
Atlas holds the Story. Otherwise it shows "confirm by hand" and never becomes `missing` from
silence: the user marks it posted or missing (T5).

**Atlas has not seen the creator lately.** When the newest post Atlas holds from the creator is
older than the row's due date, a row past due carries the note "Atlas has no posts from @a since
{date}" and stays `late` past the grace days, never `missing`: Atlas may not have indexed them
yet. In `check`, ask for the post's link (T0 on the next run). Never call
`lookup_creators`.

**Posts the user pasted.** Only in `check`, with T0. For each link: `search_posts` on the URL or
the network's shortcode first. Not held: `lookup_posts` with one item (`schema` = network,
`entityKind` `post`, `identifier` = the URL, `creatorDeepAnalysis` `false`). On `fetching`,
wait 30 seconds and re-call with the same item, up to 4 times; still fetching, say so and carry
on. A TikTok short link: ask for the full URL. A pasted post by a creator not on the roster is
listed and skipped. A pasted post is matched like any other, and its match is `confirmed` only
when the user said which deliverable it is; otherwise it goes to T2. Never fetch anything the
user did not paste, and never fetch in an unattended run.

## Checks on each matched post

One line each in `checks`, with the evidence: a quoted caption line, a transcript line ("per
Atlas transcript"), on-screen text, or a field and its value. A check that cannot be made says
so and why.

| Check | Pass | Not met |
| ----- | ---- | ------- |
| On time | `postedAt` on or before `due`, in the cadence timezone | Posted after `due`: `onTime` false, `daysLate` counted. Not a fix: a late post is still delivered |
| Format | The post's format is the row's format | A your-call item (**Your call**), never a fix the creator can make to a live post |
| Disclosure | **Disclosure** below says found | Missing: needs a fix. Unclear: a your-call item |
| Required items | Each item in `mustInclude` (**The owed list**, Required items) and the deal's code is present: a tag in the mentions or caption, a hashtag, the code in the caption or on screen. "Link in bio" or a Story link is "can't check from the post" and listed for the user | Needs a fix, naming the item. An item not in `mustInclude` is never required; a missing brand tag it does not ask for is a note |
| On brief | Not run here | Offered as a hand-off to `atlas-content-review` |

### Disclosure

Read the deal's `disclosure` text (the creator's `terms`, else the program's terms for the
type). It names one or more parts:

- **The platform label**: "paid partnership label", "branded content", "paid partnership
  toggle".
- **Disclosure words**: `#ad`, `#sponsored`, `#gifted`, "paid partnership with", "gifted by",
  "sponsored by".
- **Spoken or on-screen**: "said in the video", "on screen", "verbal".
- **The code in the caption**, for affiliate deals ("#ad and code in caption").

Check each part:

- **Label.** Use the partnership marker when the census lists it: true is found. When the
  census does not list it, or it is empty, the label is "not held in Atlas": unclear, never
  missing (`post-analysis.md`; `program.md`, the terms object). The label alone never makes a
  post `missing` or `needs fix`.
- **Words.** Look in the caption and `instagram.hashtags`. Found when they sit before the
  "more" cut (about the first 125 characters, or the first line); words only in a hashtag block
  after the cut are buried (`content-review.md`: a Flag). An equivalent clear word counts
  ("#sponsored" where the deal says "#ad") and the check line names it. Vague words are not a
  disclosure: `#sp`, `#spon`, `#collab`, `#partner`, `#ambassador` alone, "thanks @brand".
- **Spoken or on-screen.** From `analysis.transcript` and `analysis.overlayText`. With neither,
  "can't check (no transcript)". Never infer speech from visuals.
- **Code.** In the caption, as for words.

Then the post's `disclosure`:

| Value | When |
| ----- | ---- |
| `found` | Every part the deal names is found |
| `missing` | The deal names words, spoken, or code, and none of them appears anywhere: caption, hashtags, transcript, on-screen text. The label never decides `missing` |
| `unclear` | Anything else: words found only buried, only vague words, the label not seen (whether or not the words are found), or spoken or on-screen is required and there is no transcript |

When the only unclear part is the label and the deal's words are found, the check line says
"label: check on the post", and these posts go to the user as one T5 question for the run
(**Your call**, Label not seen), not one per post.

With no `disclosure` in the deal: paid and ambassador posts need a clear disclosure word or a
label found by the marker; gifting needs `#gifted`, "gifted by", or a clear equivalent. Say on
the page that the program's terms set no disclosure and the check used the general rule.

Disclosure is checked on every matched post, owed or expected: a gifted post without disclosure
needs a fix too. A missing disclosure on a paid or ambassador post is always the most serious
item on the page, as in content review.

## Status

| Status | When | Kind |
| ------ | ---- | ---- |
| `due` | Not yet due, or due with no date, and not matched | `action_item` `medium` |
| `posted` | Matched, disclosure found, every required item present. `onTime` says whether it was on time | `went_well` when on time; `needs_improvement` when late |
| `late` | Past due, no match yet, and inside the grace days; or past grace with an open match, a "confirm by hand" Story, or no posts from the creator in Atlas since the due date | `needs_improvement` |
| `missing` | Past due plus grace days, no match, no open match, not a "confirm by hand" Story, and Atlas holds posts from the creator dated after the due date | `needs_improvement` |
| `needs fix` | Matched, and disclosure is missing or a required item is missing | `needs_improvement` |
| `waived` | The user waived it (**Waived**) | `went_well` `low` |

Expected posts (`owed` false) use only `due`, `posted`, `needs fix`, and `missing`, never
`late`: an expected post stays `due` until its window plus the grace days has passed, then is
`missing` only when Atlas holds posts from the creator dated after the window (otherwise it stays
`due` with the "Atlas has no posts" note), shown as "No post (not owed)", kind `action_item` `low`, never chased, never in an alert. Fulfillment reads it for
posting odds.

A `needs fix` post that is fixed later moves to `posted` on the run that sees the fix (its
`onTime` stays from the first post date).

### Waived

Only the user waives, by saying so ("waive @a's second Story", "drop the Reel, she did a TikTok
instead"), as a T5 answer, or with T1's free text. The finding carries `waivedBy` `user` and
the user's reason in their words. The tracker never proposes a waiver as the recommended answer
and never waives in an unattended run.

### Your call

Each is returned as a T5 question, recommended answer first:

| Item | Question | Options |
| ---- | -------- | ------- |
| Format differs | "@a posted a {format} where the deal says {format}. Count it?" | Ask for the agreed format (Recommended); Count it as delivered; Decide later |
| Disclosure unclear | "@a's post {why unclear}. Is the disclosure fine?" | Ask for a clear disclosure (Recommended); It's fine (I checked the post); Decide later |
| Label not seen (multiSelect, one per run) | "Atlas can't see the paid partnership label. Which of these posts carry it? Pick the ones you checked." One option per post, "@a: {format} {date}" | Picked: label found, the post can be `posted`. Not picked: stays unclear, shown on the page as "label: check on the post"; never a fix request unless the user asks for one |
| Confirm by hand | "Did @a post {deliverable}? Atlas doesn't hold Stories." | Not yet (Recommended); Yes, it went up; Waive it |

"It's fine" and "Count it" set the row `posted` with `checks` noting the user's call.

## Drafts

Every draft follows `outreach.md`, **Channels** and **Templates** (voice, sender, greeting,
word limits, the manager rule) and `program.md` **5** (never the budget, a maximum, a fee,
another creator's terms, a team note, or the approver's name). One draft per creator, template,
and channel, naming every deliverable it covers. Placeholders come from the records; anything
missing is a bracketed blank, listed. Never a threat, a payment condition, or a legal claim:
those are the user's to add.

| Template | When | What it says |
| -------- | ---- | ------------ |
| `post-chase` | One or more owed rows `late` with no open match | A light check-in: what is due and when it was due, and an offer to help |
| `post-missing` | One or more owed rows `missing` | Polite and direct: what was agreed, the date, and a request for a new date |
| `post-fix` | A row `needs fix` | The exact fix for each post: what to add and where ("add #ad to the first line of the caption", "turn on the paid partnership label", "add your code SAM20 to the caption"), with the post linked in email and Aspire messages |
| `post-thanks` | Every owed row due so far is `posted`, with no fix open, and no thank-you was drafted for these posts before | Thanks, the post named in one concrete line from its caption or transcript. "on time" only when every post was on time; a late post's thank-you never mentions the date |

Never a draft for an expected (gifting `loose`) post that did not come, and never a chase while
an open match or a "confirm by hand" row is unresolved for that creator. A creator whose
`yourCall` is open, or with a saved reject call, is listed under "Needs the main thread"
instead. An unsent draft of the same template is shown again, not rewritten.

**`post-chase`**

```
Subject: {deliverable short} for {Brand}

Hi {first name},

Just checking in on {deliverables, "your Reel and 2 Stories"} for {program}, which we'd
planned for {due date}. Anything you need from us to get it live?

{sender}
```

**`post-missing`**

```
Subject: {deliverable short} for {Brand}

Hi {first name},

Following up on {deliverables} for {program}. We'd agreed on {due date} and haven't seen it
go up yet. Could you let us know when it will be live?

{sender}
```

**`post-fix`**

```
Subject: A quick fix on your {Brand} post

Hi {first name},

Thanks for posting {post line}. One change so it meets the disclosure rules:
{one line per fix}

Could you update it when you get a moment? Reply here once it's done.

{sender}
```

**`post-thanks`**

```
Subject: Thank you from {Brand}

Hi {first name},

{post line} Thanks for {"getting it up on time" when every post was on time, else "sharing it"}.

{sender}
```

DMs: "Hi {first name}, quick check-in on {deliverables} for {Brand}, planned for {due date}.
Anything you need from us?" (chase); "Hi {first name}, we'd agreed {deliverables} for {due
date} and haven't seen it yet. When can we expect it?" (missing); "Hi {first name}, thanks for
the post! Could you {fix}? It keeps it within the disclosure rules." (fix); "Hi {first name},
thanks for the {format}, it came out great." only when a concrete line follows (thanks; never the date for a late post).

Marking sent follows `program.md` **5** in the main thread.

## State written to Atlas

`append_insights` per `program.md` **1**: role `account_review`, runKey
`program-{profile}-{slug}-{YYYY-MM-DD}` (the shell date in the cadence timezone), `schema` = the
creator's network, `entityKind` `account`, `entityId` = the network's own account id from the
roster row. Every finding carries `detail.recordType`, `detail.program`, `detail.recordedAt`
(one shell timestamp per run), `detail.by` `atlas-deliverable-tracker`, and `detail.recipient`.
Copy the newest finding's detail for the identity and change what moved. Batches of up to 25
findings per call. Write a `deliverable` only when its status, match, checks, or `due` changed
since the newest finding.

| Record | Kind | idempotencyKey |
| ------ | ---- | -------------- |
| `deliverable` | Per **Status** | `trk-del-{slug}-{entityId}-{deliverableKey}-{status}-{YYYY-MM-DD}` |
| `draft` | `action_item` `low` | `trk-draft-{slug}-{entityId}-{template}-{channel}-{recordedAt}` |
| `roster` | `action_item` `medium`; `went_well` at Complete | `trk-roster-{slug}-{entityId}-{stage}-{YYYY-MM-DD}` |
| `page` | `went_well` `low` | `trk-page-{slug}-tracker` |

**Fields this reference adds to `deliverable`** (beyond `program.md`'s list): `deliverableKey`,
`type`, `format`, `network`, `month` (`YYYY-MM`, ambassadors), `count` (this row's number in the
deliverable, "2 of 3"), `onTime`, `daysLate`, `graceDays`, `graceEndsAt`, `match` (`strong`,
`confirmed`, `open`), `signals` (the brand signals found), `label` (`found`, `not held`,
`none`), `fix` (the exact fix, one line each), `waivedBy`, `reason`, `basedOn` (`terms
v{version}`, `program terms`, or `fulfillment {orderKey}`), and `source` (`atlas` or
`pasted`).

**Fields this reference adds to `draft`**: `deliverableKeys` (the rows it covers), `postUrl`
(the post a fix or thank-you names), `to` (`creator` or `manager`), and `blanks`.

**`roster` moves**, forward only, with T1:

| Move | When |
| ---- | ---- |
| To Posting due | Agreed or Delivered, an owed row is due, and fulfillment did not move them (a paid deal with no product) |
| To Posted | Every owed row due so far is `posted` or `waived` |
| To Complete | Every row in the deal is `posted` or `waived`, no fix is open, and for an ambassador the term has ended |

While a tracker draft is unsent, `waitingOn` is brand; marking it sent sets creator and
`nextFollowUpAt` (`program.md` **5**). The tracker writes no other roster field.

**The page link.** On the tracker page's first publish, one `page` finding: anchored to the
brand's own account on its first linked network, `detail.key` `tracker`, `url`, `title`. It goes
in the same call as the T1 writes, or on its own in an unattended run.

The tracker writes no `terms`, `fulfillment`, `asset`, `rights`, `ledger`, `affiliate`, or
calibration.

## Hand-offs (returned, never run)

- **Content library.** Every row that became `posted` this run, as a `library-handoff` block:
  handle, network, `postId`, `postUrl`, format, `deliverableKey`. The library writes the `asset`
  on its next build.
- **Content review.** Posted rows whose deal came from a creator brief or a campaign brief, or
  any post the user wants checked against a brief: listed as "Check on brief?" with the post
  link. The main thread offers it; the tracker never runs it.
- **Ledger.** Paid and ambassador rows that became `posted`: the creator, the deliverable, and
  the date, as the next step for `atlas-program-ledger`. No amount.
- **Fulfillment.** A creator with an owed gifting or paid post whose product has not arrived:
  "waiting on delivery", never late.

## Daily posting check (unattended)

The scheduled task "Atlas program posting check: {brand} - {program}" (`program.md` **8**)
launches with `run: unattended`. It follows `program.md` **9**:

- Never ask, decide, draft, send, create a mailbox draft, move a stage, confirm an open match,
  waive, or fetch a post. Never call `lookup_posts`.
- Read the setup records and the working state, build the owed list, and match from what Atlas
  holds.
- Write `deliverable` findings for rows that changed by a `strong` match (`posted`, `needs fix`)
  or by the date alone (`due` to `late`, `late` to `missing`, under **Status**: never `missing`
  while a match is open, a Story is to confirm by hand, or Atlas holds no posts from the creator
  since the due date).
  Never write a row an open match, a confirmation, or a waiver would decide. Write the tracker
  `page` finding only when it is missing (`program.md` **9**).
- Republish the tracker page to the link in the newest `page` finding with key `tracker`. The
  task is scheduled only after that finding exists (`program.md` **8**).
- Post to the routing in `program:{slug}-routing` when at least one row is late, missing, or
  needs a fix, or a new post was matched: "{program} posting check: {l} late (@a, @b), {m}
  missing (@c), {f} need a fix (@d), {p} new posts. Review in Claude: 'check posts for
  {program}'. {page link}". Handles and counts only, never a caption, an amount, or an address.
  Report any destination that could not be reached.
- Setup missing or Atlas unauthorized: the setup-needed card from `program.md` **9**.

## The page

One page per program, title "{Brand} {Program}: Posts", republished to the link in the newest
`page` finding with key `tracker`. Program pages are for the brand's team, never for creators.
Load `artifact-design` first and `dataviz` for the charts; apply `theme:brand` per `theme.md`,
**Applying the theme**; draw creators with the creator card (`creator-card.md`, page profile, no
actions); render for the primary `recipient` lens. Sections, in order:

1. **Header**: the "Prepared for" chip, the program name and term, type chips, and "checked
   {date}".
2. **Headline**: one line. "{p} of {o} posts owed so far are up ({rate} on time). {l} late, {m}
   missing, {f} need a fix."
3. **Needs a fix**: one row per post: creator, the post (cover and link), the deliverable, and
   each fix in plain words. Missing disclosure on a paid or ambassador post leads, marked
   critical.
4. **Late and missing**: creator, deliverable, due date, days past due, grace end, and the note
   ("a possible post to confirm", "Atlas has no posts from @a since {date}", "confirm by hand").
5. **Matches to confirm**: the open matches, each with the post, the row it might fill, and why
   it is unsure. Under it: "Nothing counts until you confirm in chat."
6. **Due this week**: a seven-day calendar from today, each day listing the creators and
   deliverables due, and a line for anything due with no date set.
7. **Owed vs posted, per creator**: one row per creator: type, owed so far, posted, on time,
   late, missing, needs fix, waived, as a stacked bar. Ambassadors show the current month and
   the term to date.
8. **Disclosure rate**: matched posts with disclosure found over matched posts checked, by
   type and by network, with missing and unclear counted apart. Under 5 posts checked shows the
   counts and "too few to rate", never a percent.
9. **Expected from gifting**: gifted creators whose post is hoped for, not owed: posted, still
   in the window, and "no post (not owed)". Never shown as late.
10. **Posted**: each matched post with its creator, format, date, on time or days late, the
    disclosure result, and the check lines.
11. **Drafts waiting**: per creator, one block per channel with the subject and body, a copy
    button, bracketed blanks highlighted, and a chip "In your {mailbox}" when a mailbox draft
    exists. Leave out in an unattended run.
12. **Footer**: "posts and numbers come from Atlas as of {timestamp}", the grace days used, that
    the paid partnership label is not held in Atlas, shows as unclear, and is checked on the
    post itself, that
    Stories show only when Atlas holds them, and that images are a snapshot.

When the program has a `posts` goal, its target and progress go only in the Editor-only page
data at path `team` (`program.md` **7**), written after the publish; load `artifact-capabilities`
first. The page never shows the budget, a fee, a maximum, a target, a team note, an email
address, or a street address. More than 12 creators: the headline and section 7 lead.

## What the tracker never does

- Send a message, or create a mailbox draft without T4. Never a draft in an unattended run.
- Force a match, count an open match as posted, or mark a row missing inside its grace days,
  while a match is open, or while Atlas holds no posts from the creator since the due date.
- Call the paid partnership label absent because Atlas does not hold it.
- Waive a deliverable, or propose a waiver as the default.
- Fetch a post the user did not paste, fetch anything in an unattended run, or start discovery
  (`lookup_creators`, `search_creator_marketplace`, `start_business_discovery`).
- Run content review, write an `asset`, or write any record type but `deliverable`, `draft`,
  `roster`, and its own `page` finding.
- Change a setup record or call a destructive tool.
