# Roster manager reference

Used by the `atlas-roster-manager` agent and the **Roster review** section of SKILL.md. Holds
who is reviewed, the signals and how each is called, the segment rules, renewals, the drafts,
lookalike seeds, the decision packet, the records the agent writes, and the roster health page.
Read `program.md` first. Its state model, page vocabulary, **4** (connected tools), **5**
(drafts and sending) and **7** (pages) apply here unchanged.

## What the agent does

The job: keep the roster healthy. For every creator on an active or recent deal it reads what
they delivered, how their program posts did, what they cost, what they sold, how their audience
reacted, how fast they answer, and whether anything is unsafe. It puts each creator in one
segment with the evidence behind it, lists the ambassador renewals coming due with a
recommendation, drafts a re-engagement note or a thank-you, and offers the stars as lookalike
seeds for discovery.

It covers every program type. Ambassadors are the focus: they have a quota, a term, and a
renewal. Paid, gifting, and affiliate creators are reviewed the same way with the signals their
deal has.

A segment is advice. It never moves a creator's stage. Retiring or pausing a creator is the
user's call, which the **Roster review** section asks and records.

Interactive only. No schedule runs it, and an unattended run writes nothing.

## Modes

| Mode | What it does |
| ---- | ------------ |
| `review` | The roster review, in two passes (below) |
| `sample` | No creators. A sample page from invented data (**Sample artifacts**) |

- **`propose`** (the default): read, compute, segment, draft, publish the page with every call
  marked proposed, and return the decision packet. Writes nothing to Atlas.
- **`record`**: the main thread passes the packet back with the user's answers. Check nothing
  moved, write the approved records, create approved mailbox drafts, and republish the page.

Optional launch inputs: `creators` (handles, to review only these), `types` (limit to some
deal types), `windowDays` (the review window, default 90), and `dormantDays` (default 45).

## Who is reviewed

Read the roster per `program.md` **1**: the newest `roster` finding per creator wins.

A creator is reviewed when their newest row is at Agreed or any later stage on the main line
(Details requested through Complete), or at Paused, and:

- the stage is not Complete or Paused, or
- it is Complete or Paused and the row's `recordedAt` falls inside the review window.

Declined, No reply, Dropped, and every stage before Agreed are left out. A handle in `creators`
that is not on the roster, or not reviewable, is listed and skipped.

**The review window** is the last `windowDays` days to today (the shell date in the cadence
timezone, else the user's). For an ambassador whose term started inside the window, it starts
at `termStart`.

**The deal** is the newest `terms` finding with status agreed, else the program's terms for the
creator's type (`program.md`, **Who owns a deal**).

## Reads, per creator

From the program's working state (`search_insights` on the prefix `program-{profile}-{slug}`,
newest first, paged to the end), the newest finding per identity:

- `roster`: stage, type, tier, contact, `lastContactAt`, `yourCall`, notes.
- `terms`: the agreed deal, `termStart`, `termEnd`, `version`.
- `deliverable`: every deliverable, its `due`, `status`, `postId`, `postedAt`, `disclosure`,
  `owed`.
- `fulfillment`: `deliveredAt` and `value` (gifting cost).
- `affiliate`: every period, `orders`, `revenue`, `commission`, `currency`, `codeStatus`.
- `ledger`: every line for the creator (`kind`, `amount`, `currency`, `status`, `dueAt`).
- `draft` and `reply`: `sentAt`, `receivedAt`, `channel`, `class`.
- The newest `roster-health` (the last review, for "changed since").

From Atlas (`list_post_search_fields` and `list_creator_search_fields` once each; use only
paths they return):

- `search_creators` for the account: followers (for the tier and the band), bio.
- `search_posts` on the creator's author username, the review window plus the 90 days before
  it, newest first, projecting `postedAt`, `url`, `instagram.permalink`, `text`, `mediaKind`,
  `instagram.mediaProductType`, `likeCount`, `commentCount`, `viewCount`, the partnership
  marker, `analysis.brandSafety`, `analysis.commentSentimentBreakdown`, `analysis.transcript`
  when the census lists them.
- Once per `red_line` (not `review:` keys): one semantic `search_posts` with `queryText` the
  red line's wording, filtered to the reviewed creators' usernames and the window.

Work in batches of ten creators.

**Program posts** are the posts named by `postId` or `postUrl` on the creator's posted
`deliverable` findings. With no deliverable tracker records yet, add posts in the window that
carry the partnership marker with the brand, or tag or mention the brand's handles, and label
them "matched by mention". **Own posts** are the creator's other posts in the 90 days before
the window's end.

## The signals

Each signal is strong, typical, weak, or not judged, with the number behind it and where it
came from. A signal without its data is "not judged", never weak.

**Engagement** is likes plus comments on one post. Views are shown beside it, never added. A
post with hidden likes is left out of every engagement figure.

| Signal | Number | Strong | Weak | Judged only when |
| ------ | ------ | ------ | ---- | ---------------- |
| Quota | Posted ÷ owed: deliverables with `owed` true and `due` on or before today, waived left out. A late deliverable that was posted counts as posted and as late | Everything posted, at most one late | Any missing, or under 75% posted | At least one owed deliverable is due. Gifting with `postExpected` loose or none: "expected, not owed", never judged |
| Trend | Median engagement per program post in the window ÷ the creator's median engagement per own post | 1.2 or more | Under 0.8 | Two or more program posts and five or more own posts |
| Against the roster | Median engagement rate (engagement ÷ followers) on the creator's program posts, against every reviewed creator in the same tier | Top third | Bottom third | Three or more reviewed creators in the tier with two or more program posts |
| Cost per engagement | Cost in the window ÷ engagement on program posts in the window (**Cost**) | At or under 0.75 times the roster median | Over 1.5 times the roster median | A cost and at least one program post. The roster comparison needs three creators with the number; with fewer, show it and mark it not judged |
| Revenue | Affiliate revenue over the last three closed periods, against the creator's cost in the same periods | Revenue at or above cost, or top third of the program's affiliate creators | Zero orders in the last two closed periods with the code live | At least one closed `affiliate` period |
| Sentiment | Positive and negative share of comments on program posts (`analysis.commentSentimentBreakdown`) | 60% positive or more and 10% negative or less | Over 25% negative | A breakdown on two or more program posts |
| Responsiveness | Median days from our sent draft to their next reply, over the last three exchanges. Auto-replies never count | Within the tier's reply window | Beyond the window twice running, or a sent draft still unanswered past the window | At least one sent draft |
| Safety | Flags, below | None found | Any flag | Always checked on the posts Atlas holds; with no posts, not judged |

Reply windows by tier follow `program.md` **5**: nano and micro two days, mid and top 14 days.

**Safety flags** (each one cites the post or the record):

- A `block` red line the red-line search matched on one of their posts in the window.
- A brand safety category above low risk on a program post, or high risk on any post in the
  window.
- A paid partnership with a saved `competitor` in the window, or inside the exclusivity days
  of their deal.
- Two or more program posts with disclosure missing (`deliverable.disclosure`).
- A `creator:*` record with stance reject saved after the deal.

A `warn` red line match is shown as a note, never a flag.

### Cost

Cost is what the brand spent on the creator in the window, in the program's currency, and is
always labelled with where it came from:

- **From the ledger**, when the creator has `ledger` lines dated in the window: the sum of
  `fee`, `product`, `rights`, and `ugc` lines, any status but void.
- **From the deal**, otherwise: paid, the fee for each deliverable posted in the window plus
  its product value; ambassador, `monthlyFee` plus `productAllowance` for each month of the
  term inside the window; gifting, the `value` on delivered `fulfillment` findings; affiliate,
  product value only.

Commission is never in the cost. It shows beside it as "plus {commission} commission". The fee
calculator is never a cost: a creator with neither ledger lines nor an agreed fee has no cost,
and cost per engagement is not judged.

## Segments

One segment per creator. The first rule that applies decides. Each rule fires only on signals
that were judged; a missing number never puts a creator in a segment.

| # | Segment | Rule |
| - | ------- | ---- |
| 1 | `retire` | Any safety flag. Or repeated misses: two or more missing deliverables in the window, or quota weak in each of the last two months of an ambassador term. Or poor value: cost per engagement over twice the roster median, trend weak, and revenue not strong |
| 2 | `dormant` | Past Agreed and owed or expected a post, with no program post and no reply in the last `dormantDays` days. Or no post on their account at all in `dormantDays` days |
| 3 | `insufficient` (shown "Not enough data") | Quota not judged, and fewer than two of trend, against the roster, cost per engagement, and revenue judged |
| 4 | `star` | Quota strong, or not owed. Two or more of trend, against the roster, cost per engagement, and revenue strong, none of them weak. Responsiveness not weak. No safety note |
| 5 | `slipping` | Quota weak, or two or more weak signals |
| 6 | `steady` | Everything else |

Every segment carries its two main reasons in plain words and the evidence lines behind it:
"Posted 5 of 6 owed since August; the September Reel is missing." "Program posts average 2.1
times their own posts' engagement." "Cost per engagement $0.09 from the ledger, against a
roster median of $0.21."

A creator new to the deal (fewer than 30 days since `agreedAt`, nothing due) is
`insufficient`, with "too early to judge".

**What each segment recommends:**

| Segment | Recommendation | Draft |
| ------- | -------------- | ----- |
| `star` | Rebook (paid, gifting), upgrade or renew with a raise (ambassador), or promote to a paid or hybrid deal (affiliate, gifting). A change of type is the user's call | `roster-thanks-rebook`, unless a renewal is due (the renewal draft is negotiation's) |
| `steady` | Renew as is | None |
| `slipping` | Re-engage with a note that names the specific gap | `roster-check-in` |
| `dormant` | Re-engage; if there is no reply inside the reply window, it becomes your call | `roster-reengage` |
| `retire` | Your call: drop, pause, or keep | None |
| `insufficient` | Review again when there is data; say what is missing | None |

**Changed since the last review.** When a newer `roster-health` exists from an earlier run,
show the old segment beside the new one and say what moved.

## Your call

The agent never decides these. Each comes back as a K2 question with the recommended answer
first:

- Every `retire`: "Drop @x from {program}, pause them, or keep them on?" Recommended: drop for
  a safety flag; pause (ambassador) or keep and re-engage (other types) for misses or poor
  value.
- A `dormant` creator whose re-engagement note was sent and went unanswered past the reply
  window: "Pause @x, drop them, or keep waiting?" Recommended: pause (ambassador), drop (other
  types).
- A `star` whose recommendation changes the deal type (affiliate or gifting to paid or hybrid).
- A renewal recommended `lower`, or any renewal for an `insufficient` creator.

Word it as one question with two or three answers, best first, and the deciding evidence in a
clause: "@marco missed 3 of 4 posts since July and hasn't replied in 40 days. Pause him
(Recommended), drop him from Summer ambassadors, or keep him on?"

The **Roster review** section writes the answer (`program.md`, **3**): a pause or a drop is a
new `roster` finding at Paused or Dropped, copied from the newest row with `yourCall` cleared. The packet carries that row ready
to write (`rosterChange`). "Keep" writes nothing on the roster. "Decide later" follows
`program.md`, **3**, Decide later: the section writes the creator's newest `roster` row again
with `yourCall` set to the question and `yourCallDeferredAt`, so the call stays on the status
screen and the page without leading the next step for 7 days.

## Renewals

Ambassadors whose `termEnd` is within `terms.ambassador.renewalNoticeDays` of today, or already
past with no newer agreed `terms`, and who are not at Dropped. Paid, gifting and affiliate deals
have no term to renew; their stars get the rebook invite instead.

`renewalDueAt` is `termEnd` minus `renewalNoticeDays`.

| Segment | Recommend |
| ------- | --------- |
| `star` | `raise` |
| `steady` | `same` |
| `slipping` | `same`, with a check-in line. `lower` when cost per engagement is weak, as your call |
| `dormant`, `retire` | `end` |
| `insufficient` | `same`, as your call |

The agent never prices a renewal. It hands the recommendation to `atlas-creator-negotiation`
(`mode: renewal`), which prices next term on the fee calculator and the program's terms and
drafts the renewal.

**The `renewals` block.** A fenced JSON block in the output, one entry per renewal:

```json
{"program": "{slug}", "reviewedAt": "2026-10-07T15:02:11Z",
 "creators": [
  {"handle": "marco.makes", "network": "instagram", "entityId": "…", "type": "ambassador",
   "segment": "star", "recommend": "raise", "yourCall": null,
   "reasons": ["Posted 12 of 12 owed, none late", "Program posts at 1.6 times his own"],
   "termStart": "2026-05-01", "termEnd": "2026-10-31", "renewalDueAt": "2026-10-01",
   "currentTerms": {"version": 2, "monthly": "2 Reels + 4 Stories", "monthlyFee": 800,
                    "termMonths": 6, "productAllowance": 200, "currency": "USD"},
   "signals": {"quotaMet": 1.0, "trend": 1.6, "costPerEngagement": 0.09,
               "costBasis": "ledger", "revenue": null}}
 ]}
```

Negotiation reads the newest `roster-health` finding for each renewal, so the hand-off works
best after K1 saved the review. With "Page only", the main thread passes this block to
negotiation instead.

## Drafts

Every note to a creator is a `draft` finding (`program.md`, **5**): shown ready to copy in chat
and on the page, created in the mailbox only after K4, never sent by the agent. A draft's
identity is the creator, the template, and the channel.

Voice and channel follow `outreach.md` exactly: **Channels** (routes, word limits, a DM has no
subject and no link), **Voice**, and the manager rule. The channel is the creator's last reply
channel, else the first channel in `outreach.channels` with a route.

**Never in a draft**: the segment, a score, a rank, a trend figure, cost per engagement, revenue
against cost, another creator's name or numbers, the budget, the maximum, a team note, a safety
flag, or the approver's name. A draft names what the creator made and what comes next.

Every draft names one real post from Atlas: the strongest program post in the window for a
thank-you, the newest program post for a check-in. No post qualifies: the bracketed blank
`[a recent post of theirs]`, listed under `blanks`. A draft with a blank is never sent.

**The specific note.** A check-in names the gap in the creator's terms, from the records: a
deliverable still to come ("the October Reel"), a post that needs a fix ("the disclosure on
your September Reel"), or what worked ("your Reels that open on the pan did best for us; more
like that would be great"). Never a number, never "slipping".

### Templates

Template names are what `detail.template` holds.

**`roster-thanks-rebook`** (stars):

```
Subject: Thank you from {Brand}

Hi {first name},

{post line} {thanks line}

We'd love to keep working together. {rebook line}

{sender}
```

- The post line names the post as in `outreach.md`, **Write the post line**.
- The thanks line is one sentence on what the post did for the brand in words, never a number:
  "It's one of the posts our team keeps sharing."
- The rebook line, by type: paid and gifting, "Would you be up for another round in
  {next month}?"; ambassador mid-term, "We'd like to talk about doing more together for the
  rest of your term."; affiliate, "Your code has been doing well, and we'd like to talk about
  a bigger partnership." No fee, no number, no terms.

**`roster-check-in`** (slipping):

```
Subject: Checking in on {program}

Hi {first name},

{post line} {specific note}

Anything we can do to help, from product to timing? Just reply here.

{sender}
```

**`roster-reengage`** (dormant):

```
Subject: We miss you on {program}

Hi {first name},

It's been a while since we last heard from you, and we'd love to catch up. {open item line}

Is now still a good time for you? If things have changed, that's fine too, just let us know.

{sender}
```

The open item line names what is still owed, from the records ("The {month} posts are still
open on our side."), or is left out when nothing is owed.

**DMs**, per template: thanks-rebook "Hi {first name}! {post line in words}. Thank you. Up for
another round with {Brand}?"; check-in "Hi {first name}, checking in on {program}: {specific
note, in a few words}. Anything you need from us?"; re-engage "Hi {first name}, it's been a
while! Still keen on {program}? No worries either way."

## Lookalike seeds

Stars become seeds for the program's discovery campaign (`discoveryCampaign` in the program
object), in the form creator discovery picks its lookalike seeds (`creator-discovery.md`,
**Lookalike seeds**): up to five, the stars with the highest trend first.

A star is a seed when it has two or more program posts, no safety note, and Atlas holds its
account. Its `roster-health` finding carries `seedEligible: true` and `creator` (the handle),
the same shape the weekly report's growth findings use.

**The `lookalike-seeds` block**:

```json
{"program": "{slug}", "campaign": "{discoveryCampaign}",
 "seeds": [
  {"handle": "marco.makes", "network": "instagram", "entityId": "…", "followers": 48000,
   "band": {"min": 24000, "max": 96000},
   "bestPost": {"url": "…", "captionExcerpt": "first 160 characters"},
   "vocabulary": ["cast iron", "weeknight dinners"],
   "why": "Program posts at 1.6 times his own; posted 12 of 12"}
 ]}
```

`band` is half to double the seed's followers. `vocabulary` is three to six words or short
phrases that recur in the seed's bio and captions. The agent offers the seeds (K5); it never
runs discovery. With no `discoveryCampaign` saved, the block still returns, and the offer is to
start a discovery shortlist for the program (**Creator discovery**, Setup).

## The decision packet

`propose` ends with a fenced JSON block labelled `roster-packet`. `record` needs nothing else.

```json
{"program": "{slug}", "proposedAt": "2026-10-07T15:02:11Z",
 "runKey": "program-{profile}-{slug}-2026-10-07", "pageUrl": "…",
 "window": {"from": "2026-07-10", "to": "2026-10-07"},
 "creators": [
  {"handle": "marco.makes", "network": "instagram", "entityId": "…", "type": "ambassador",
   "segment": "star", "reasons": ["…", "…"], "yourCall": null,
   "basedOn": {"roster": "<recordedAt>", "deliverable": "<newest recordedAt or null>",
               "reply": "<newest receivedAt or null>"},
   "health": {"…": "the full roster-health detail this review would write"},
   "drafts": [{"template": "roster-thanks-rebook", "channel": "email", "subject": "…",
               "body": "…", "postUrl": "…", "blanks": []}],
   "rosterChange": null}
 ]}
```

A your-call item carries `yourCall` `{question, options: [{label, stage}], recommended}` and
`rosterChange` holds the full `roster` row for the recommended answer, for the main thread to
write after K2.

## The questions (main thread)

After `propose`, the main thread asks. Up to four fit in one `AskUserQuestion` call; ask K1 and
the K2 items first, then K3 to K5.

| # | Header | Question | Options |
| - | ------ | -------- | ------- |
| K1 | Review | "Save the roster review for {program}? {n} creators: {s} stars, {t} steady, {u} slipping, {v} dormant, {w} to retire, {x} not enough data. {d} notes go on the creators' rows." | Save the review (Recommended); Change something (type it); Page only |
| K2 | Your call | One per item, worded as in **Your call** | The recommended answer (Recommended), the alternatives, Decide later |
| K3 | Renewals | "Work out renewals for {creators}? (each: @a raise, @b same terms, @c let it end)" | Start the renewals (Recommended); Not now |
| K4 | Mailbox | "Create {n} drafts in your {mailbox} for {creators}? Nothing is sent." Only when `outreach.mail` names a live mailbox that can draft | Create the drafts (Recommended); I'll copy them myself |
| K5 | Lookalikes | "Find creators like {stars} for {campaign}?" | Refill the shortlist with lookalikes (Recommended); Not now |

- K1 approves the `roster-health` findings, the `draft` findings, and the `page` finding.
  "Change something" relaunches `propose` with the change as an override (a segment the user
  moves, a creator to leave out). "Page only" writes nothing.
- K2 answers are written by the **Roster review** section from `rosterChange` (or, for
  "Decide later", the newest row with `yourCall` and `yourCallDeferredAt`), one `roster`
  finding each, in the same confirmation. The agent never writes a `roster` finding.
- K3 "Start the renewals" launches `atlas-creator-negotiation` with `mode: renewal`, `pass:
  propose`, and the `renewals` block, after the `record` pass when K1 saved.
- K4 creates mailbox drafts in the `record` pass, for exactly the named creators.
- K5 launches `atlas-creator-discovery` for the campaign with the `lookalike-seeds` block and
  `recipient` `growth`. With no campaign saved, it offers **Creator discovery** Setup instead.

## Records written

All on the program's working state (`program.md`, **Working state**): `append_insights`, role
`account_review`, runKey `program-{profile}-{slug}-{YYYY-MM-DD}`, `schema` the network,
`entityKind` `account`, `entityId` the network's own account id. Each finding carries
`detail.recordType`, `detail.program`, `detail.recordedAt` (the shell clock, the same on every
finding of one write), `detail.by` `atlas-roster-manager`, and `detail.recipient`. Batches of up
to 25 findings per call.

| Record | Kind | idempotencyKey |
| ------ | ---- | -------------- |
| `roster-health`, star or steady | `went_well` | `rm-health-{slug}-{net}-{handle}-{YYYY-MM-DD}` |
| `roster-health`, slipping, dormant, retire | `needs_improvement` | same |
| `roster-health`, insufficient | `action_item` `low` | same |
| `draft`, unsent | `action_item` `low` | `rm-draft-{slug}-{net}-{handle}-{template}-{channel}-{recordedAt}` |
| `page` | `went_well` `low` | `rm-page-{slug}-roster` |

`{net}` is `ig` or `tt`.

**`roster-health` detail.** `program.md`'s fields (`handle`, `segment`, `seedEligible`,
`quotaMet`, `trend`, `costPerEngagement`, `revenue`, `renewalDueAt`, `recommendation`), plus the fields this
reference adds: `network`, `type`, `window` `{from, to}`, `signals` (each of quota, trend,
roster, cost, revenue, sentiment, responsiveness, safety as `{value, call, source}`),
`costBasis` (`ledger` or `deal`), `cost`, `currency`, `reasons` (two lines), `evidence` (lines
with links), `flags` (safety flags with the post or record), `renewal` `{termEnd, recommend,
currentVersion}` when one is due, `yourCall` (the open question, when there is one),
`previousSegment`, `creator` (the handle, when `seedEligible`), and `drafts`
(the template names written). `quotaMet` is the posted share (0 to 1) or null; `trend` is the
ratio or null.

**`draft` detail** follows `program.md` and `outreach.md`: `handle`, `channel`, `template`,
`subject`, `body`, `to`, `postUrl`, `blanks`, and `mailDraftId` after K4.

**The `page` finding.** The first `record` write with K1 adds it when no `page` finding with key
`roster` exists: `key` `roster`, `url`, `title`, anchored to the brand's own account on its
first linked network.

**Freshness in `record`.** Before writing, read the newest `roster`, `deliverable`, and `reply`
for each creator. When any is newer than the packet's `basedOn`, write nothing for that creator
and report "changed since the review; run it again".

**Mailbox drafts.** After K4, create one draft per approved creator in the connected mailbox,
addressed to the roster contact (the manager when there is one). Write the draft id to
`mailDraftId` on the same `draft` finding. A failed draft stays copy-ready and is reported.
Never send.

The agent never writes `roster`, `terms`, `deliverable`, `fulfillment`, `affiliate`, `ledger`,
`asset`, `rights`, `snapshot`, or a calibration.

## The page

One page per program, the roster health page, republished to the same link (its `page` finding,
key `roster`). Title "{Brand} {Program}: Roster Health". Load `artifact-design` and
`artifact-capabilities` before building and `dataviz` for the charts; apply `theme:brand` per
`theme.md`; draw creators with the creator card (`creator-card.md`, page mode, no actions);
render for `recipient` (`recipient-lens.md`).

**Who sees what.** The page is for the brand's team, never for creators. Costs in money and the
budget live in page data under `team`, readable by Editors only. Declare on every publish:

```json
{"db": {"rules": [
  {"path": "", "read": "interact", "write": "admin"},
  {"path": "team", "read": "admin", "write": "admin"},
  {"path": "data/users/{self}", "write": "interact"}
 ]},
 "user": {}}
```

| Path | What it holds |
| ---- | ------------- |
| `team/creator-{net}-{handle}` | Cost in the window with its basis, commission, revenue against cost |
| `team/spend` | Roster cost in the window by type, against the user's budget when one is set |
| `data/users/{id}/done` | Each person's done marks on the your-call and re-engage lists |

Write `team` with the page data writes right after each publish. On first publish say once:
"Share this page with your team as Editor to see costs. Never share it with creators."

Sections, in order:

1. **Header**: the program and term, the "Prepared for" chip, the review window, counts per
   segment as chips.
2. **Your call needed**: one card per K2 item: the creator, the question, the answers with the
   recommendation first, and the evidence. Done marks per viewer.
3. **Segment board**: six columns (Star, Steady, Slipping, Dormant, Retire, Not enough data),
   one compact creator card per creator with the two reasons and "was {old segment}" when it
   moved.
4. **Quota delivered**: one horizontal bar per creator with owed deliverables, posted against
   owed, late and missing marked, sorted by share posted. Gifting creators with no owed posts
   are listed under it as "expected, not owed".
5. **Cost and performance**: a scatter, one point per creator with both numbers: cost per
   engagement across, trend up, colored by segment, the roster medians as guide lines, each
   point labelled with the handle. Creators missing either number are listed under it. Fewer
   than three points: a table instead.
6. **Renewals due**: one row per renewal: creator, term end, renewal date, segment, the
   recommendation, and the reasons. "Negotiation prices next term" under the table.
7. **Re-engage**: slipping and dormant creators: the specific note, the last post, the last
   reply, and the draft.
8. **Lookalike seeds**: the stars offered as seeds, with the best post and the campaign they
   would feed.
9. **Creators**: creator cards grouped by type. In `{DETAILS}`: segment, every signal with its
   number, call, and source, the evidence lines, the safety flags, and the recommendation. Team
   view adds cost and revenue against cost.
10. **Drafts waiting**: one copy-ready block per draft: channel, subject, body, blanks
    highlighted, and "in your {mailbox}" when a mailbox draft exists.
11. **Footer**: how each signal is called (one line each), "cost comes from the ledger or the
    agreed deal, never the fee calculator", and "numbers read from Atlas at {timestamp}".

In `propose` every segment and draft shows "Proposed". In `record` the saved ones show "Saved".

## What the roster manager never does

- Move a creator's stage, write a `roster` finding, or drop, pause, or renew anyone on its own.
- Price a renewal or a rebook. Negotiation prices.
- Segment on missing data, or call a missing number weak.
- Put a segment, a score, a cost, or another creator's numbers in a draft.
- Send a message, or create a mailbox draft without K4.
- Start discovery, or call `lookup_creators`, `lookup_posts`, `search_creator_marketplace`, or
  `start_business_discovery`.
- Change a setup record or any calibration. A pattern that keeps coming up ("every mid-tier
  ambassador misses month three") goes to the main thread as a suggested change to the terms.
- Touch a creator ad campaign's records.
