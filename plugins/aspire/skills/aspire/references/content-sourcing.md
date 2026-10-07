# Content sourcing reference

Used by the `atlas-content-sourcing` agent and the **Content sourcing** section of SKILL.md.
The job: get the rights to the creator content the brand wants, and commission the content it
is missing. Holds the modes, the questions the main thread asks, how terms are proposed, fees,
the drafts, recording replies, the records, the ledger hand-off, and the sourcing page.

Read `program.md` first: the state model, connected tools (**4**), drafts and sending (**5**),
and pages (**7**) apply as written. The library is this flow's input and reads its output:

| What | Defined in |
| ---- | ---------- |
| Worth requesting, expiring rights, the rights join, "from the deal" | `content-library.md`, **Rights**, **Expiring rights**, **Worth requesting** |
| Ad readiness score, hook patterns | `ad-reuse.md`, **Hook score**, **Hook patterns**, via the library's `asset` findings |
| Channels, voice, the manager rule, follow-up timing | `outreach.md`, **Channels**, **Follow-up timing** |
| A creator's deal | `program.md`, **Who owns a deal** |
| Fees on the calculator | `fees.md`, **How a fee is calculated**, **Applying the rates** |

## Why content sourcing exists

A strong creator post is worth little to an ad team until the brand may use it. Asking late,
asking for the wrong usage, or running a post after its rights end all cost money or trust.
Sourcing turns the library's lists into clear, fair requests, keeps every grant on record with
its proof, warns before rights run out, and asks program creators for the assets the library
is missing. People send. Sourcing drafts, records, and proposes.

## Modes

| Mode | What it does | Writes (with approval) |
| ---- | ------------ | ---------------------- |
| `rights` | Proposes terms and drafts a request for existing posts: the library's worth-requesting list, or links the user names | `rights` (wanted or requested), `draft`, the `page` finding |
| `renewal` | Grants and deal usage ending within 30, 60, or 90 days: renew or let lapse, with renewal drafts | `rights` (renewal requested), `draft`, the `page` finding |
| `ugc` | Finds gaps in the library, picks program creators who fit, and drafts short asset requests | `rights` (`requestKind` `new-ugc`, requested), `draft`, the `page` finding |
| `record` | Records a creator's answer to a rights, renewal, or asset request: granted, declined, or countered | `rights`, `reply` (when pasted straight in), `roster` (only `waitingOn` and `yourCall`), `draft`, the `page` finding |
| `sample` | The page from invented data (`agents/sample-artifact.md`) | Nothing |

Every mode runs in two passes. **`propose`** reads, works out terms, drafts, publishes the page
with every item marked "Proposed", writes nothing, and returns the `sourcing-packet`. The main
thread asks S1 to S4 and launches **`record`** with the packet and the answers; `record` writes
only what was approved. `sample` is one pass.

Sourcing is interactive. Unattended runs are not part of it: the library's scheduled refresh
posts the expiring-rights alert. A launch marked unattended writes nothing, publishes nothing,
and returns "Content sourcing needs a person to approve each request."

## The questions (main thread)

The agent never shows a picker. The main thread asks these with `AskUserQuestion` and passes
the answers in.

| # | When | Question | Options |
| - | ---- | -------- | ------- |
| S0 | Before a `renewal` launch, unless the user named the window | header "Horizon": "Which rights should we look at for {program}?" | "Ending in the next 30 days (Recommended)", "Next 60 days", "Next 90 days" |
| S1 | After `propose` in `rights`, `renewal`, or `ugc` | header "Requests": "Save these {rights requests, renewals, or asset requests} for {program}? {n} drafts go on the creators' rows." Then one line per creator: "@a: 2 Reels, paid usage on Meta ads for 90 days, $300" or "@b: let lapse, pull from ads by Nov 3" | "Save the requests (Recommended)", "Change something", "Page only" |
| S2 | One per your-call item | Worded as in **Your call** | The recommended answer (Recommended), the alternatives, "Decide later" |
| S3 | After `propose` in `record` | header "Record": "Record these {n} replies for {program}?" Then one line per reply: "@a: granted paid usage on Meta ads for 90 days from Oct 7, $250, proof: email reply Oct 7" | "Record them (Recommended)", "Change something" |
| S4 | When drafts go by email, `connections.mail.canDraft` is true, and `outreach.mail` names that mailbox | header "Mailbox": "Create {n} drafts in your {Gmail or Outlook} for @a, @b and {n-2} more? Nothing is sent." | "Create the drafts (Recommended)", "I'll copy them myself" |

Rules:

- Up to four questions fit in one call. More: ask the S2 items first, then S1 or S3 and S4.
- "Change something" relaunches `propose` with the user's words as overrides. An override that
  lands on a your-call item is still asked as S2.
- S1 and S3 are the Atlas write confirmations, and they cover the sourcing page's `page`
  finding on its first publish. S4 is the mailbox confirmation. "Page only" writes nothing.
- Sending follows `program.md` **5**: only when the user asks in this session, after the picker
  that names every recipient. Marking sent uses the main thread's picker. A rights draft marked
  sent leaves its `rights` finding at requested; nothing more is written.

## Inputs, per post or creator

Read with the agent's own calls, every pass:

- **Setup**: `program:{slug}-program`, `-terms`, `-catalog`, `-outreach`, `-routing`;
  `brand:summary`, `brand:business-context`, `competitor`, `red_line`, `theme:brand`,
  `fees:rate-card` (only for a USD reference on the team data), and `creator:*` notes. Drop every other flow's keys.
- **Working state** on the prefix `program-{profile}-{slug}`, newest per identity: `roster`,
  `terms`, `deliverable`, `asset`, `rights`, `draft`, `reply`, and the `page` findings with keys
  `sourcing` and `library`.
- **The library's catalog**: the `asset` findings (on the program prefix, and on
  `content-library-{profile}` for posts the brand-wide library cataloged). They give each post's
  format, products, themes, hook pattern, ad readiness and its basis, people on screen, reuse
  needs, and safety. Sourcing never re-scores a post.
- **Posts the user names**: `search_posts` on the link (the `url` field), projecting the author,
  `postedAt`, `mediaKind`, `instagram.mediaProductType`, and the metrics. A post Atlas does not
  hold is listed under "Needs the main thread" ("Atlas doesn't hold this post: run the content
  library or a post analysis on it first"). Sourcing never fetches a post.
- **Creators**: `search_creators` once per creator for the account id, followers, profile
  picture, and a business email when the field census lists one.

## Who gets a request

A post or creator is skipped, and listed with the reason, when:

- the author is the brand, or a saved `competitor`;
- a `creator:*` calibration has stance `reject`;
- the asset's safety is `block`, or a `red_line` names the creator;
- a `rights` finding for the same post and usage is requested and under 14 days old (show it
  again, never draft a second request), or was declined in the last 90 days;
- the roster row has `yourCall` open;
- there is no channel with a route (**Drafts**, Channels).

**Creators off the roster.** The library catalogs posts that tag or mention the brand from
creators who are not on any roster. A rights request to them is the one message any program flow
drafts to a creator off the roster (`program.md`, **State model**, Creators off the roster):
never an asset request, an offer, or a program invitation. Their findings are anchored to their
own account like any other, and they are never added to the roster.

## Proposing rights terms

Per post, four things: usage, channels, duration, and fee. Each comes from the records first;
anything the records do not hold is a proposal the user approves in S1, or a blank.

**1. What the deal already grants.** Work out the deal's usage per post with the library's
rule (`content-library.md`, **Rights**, "From the deal"): the creator's newest agreed `terms`,
else the program's terms for their type, applied only to posts matched to their deliverables.
Gifting deals grant no usage. Never request what the deal already grants:

- A usage the deal covers, on its channels, inside its window, is left out of the request and
  shown as "from the deal, until {date}".
- When the deal's window ends sooner than the proposed duration, the request is for the extra
  time only, starting the day after the deal's end. Say so in the draft.
- A deal that covers the usage on fewer channels asks only for the missing channels.
- A roster creator's post the tracker has not matched ("May be covered by the deal") is your
  call (**Your call**), never assumed either way.

**2. Usage.** One of organic repost (the brand's own feeds), paid usage (the brand runs it as
an ad from the brand's accounts), or whitelisting (the brand runs ads from the creator's
handle: Meta partnership ads, TikTok Spark Ads). Propose by what the asset is for:

| The asset | Propose |
| --------- | ------- |
| Ad readiness 60 or more, from the library's worth-requesting list | Paid usage. Add whitelisting when the program's terms use it (`whitelisting` true) or the user asked for partnership ads |
| Ad readiness under 60, or an image or carousel | Organic repost |
| Organic repost already granted, ad readiness 60 or more | Paid usage, as an upgrade |
| The user named the usage | What the user named |

**3. Channels.** From the program's `usageChannels` for organic repost. For paid usage and
whitelisting, the ad channels on the brand's networks ("Meta ads", "TikTok ads"); the user's
words win. Never a channel the user or the records did not name beyond those two defaults.

**4. Duration.** The program's `usageDays` (or `whitelistingDays` for whitelisting) when set;
otherwise 90 days, shown as a proposal in S1. Counted from the date the creator grants it.
"In perpetuity" is only ever the user's own word.

**One request per creator.** Several posts by the same creator go in one draft, with the posts
listed. Different usages for the same posts go in the same draft.

## Fees

A rights or asset fee comes from one of these, in order, and nowhere else:

1. **The program's usage fees**, when `program:{slug}-terms` carries the optional `rights`
   block (`{organicRepost30, paidUsage30, whitelisting30}`, the brand's own fee per post per 30
   days, typed in P5). Fee = the usage's rate × (duration ÷ 30), per post, rounded to the
   nearest 10 in the budget's currency, labelled "your usage fees". A usage the block leaves
   out has no fee from it.
2. **The user's number**, typed at launch or in "Change something". Labelled "your number".
3. **Nothing**: for paid usage, whitelisting, and asset requests, a bracketed blank `[fee]` in
   the draft, and the fee becomes an S2 your call.

Rules:

- Without the `rights` block every rights or UGC fee is the user's number (`program.md`, **State
  model**). Never estimate a usage fee any other way: never from the fee calculator's CPM, a
  benchmark, a follower count, or memory.
- The fee calculator prices posts, not usage. Its figure for a post may show only as a reference
  on the page's team data, in USD, never in a draft.
- Organic repost asks for no fee by default ("credit and a tag"), unless the user sets one.
- An asset request (UGC) has no calculator fee: it is not a post on the creator's handle
  (`fees.md`, work the calculator does not price). Its fee is the user's number, product from
  the catalog, or both; the `rights` block prices only the usage it grants. Never a number the user did not give.
- No fee, budget, or maximum of another creator ever appears in a draft (`program.md` **5**).

## Renewal

**Who is up.** From the library's join (`content-library.md`, **Expiring rights**): every grant
and every deal usage whose end date falls within the S0 horizon, plus those that ended in the
last 30 days. Per item: the asset, the creator, the usage and channels, the end date, days left,
the ad readiness score and its basis, and whether it is cleared for ads.

**The call**, per item:

| When | Recommend |
| ---- | --------- |
| Paid usage or whitelisting, and ad readiness 60 or more, or in the library's top quarter | Renew, same usage and channels, same duration |
| The user said the post is running in ads | Renew, and flag "running in ads: renew before {end date}" |
| Organic repost only, ad readiness under 60 | Let lapse |
| Everything else | Let lapse |

Atlas does not hold which ads use which post. "Running in ads" is only what the user said, or a
whitelisting grant or deal; otherwise it is listed as a gap.

**Let lapse** writes nothing. The page and the summary show "Pull from ads by {end date}" for
paid usage and whitelisting, and "Remove from {channels} by {end date}" for organic repost when
the grant asked for removal at expiry.

**Renew** drafts the renewal (template `rights-renewal`) and, on S1, writes a `rights` finding
with `requestKind` `renewal`, status `renewal requested`, `renews` (the grant's identity, or
`deal` with the `terms` version), and the proposed new end date. Deal usage stays "from the
deal" and is never written as a grant (`program.md`, **Deal usage**); an agreed renewal of it
is, and the library then shows the grant.

A renewal fee follows **Fees**. A creator whose deal included the usage at no extra fee is
still asked for a fee only when the user sets one.

## UGC: commissioning what the library is missing

**1. Find the gaps.** From the library's `asset` findings in scope, count cleared assets
(current paid usage, whitelisting, or organic repost, from a grant or the deal) in each cell:

| Dimension | Values |
| --------- | ------ |
| Product | Every product in `program:{slug}-catalog`, in catalog order |
| Format | Reel or TikTok video, image or carousel |
| Theme | The library's theme list |
| Hook pattern | The patterns with the best median ad readiness in the library |
| Persona | The audiences `brand:summary` names. Checked only when the library or the creators' Atlas data tags an audience; otherwise "not checked" |

A gap is a product with fewer than two cleared videos, or a product and theme or hook pattern
the brand's own best posts use with none cleared. Rank gaps by catalog order, then by how much
better that pattern does in the library. At most five gaps per run; the user's focus wins.

**2. Pick creators.** Program creators only: roster stage Agreed or later, not Dropped,
Declined, or Paused, not a `creator:*` reject. Per gap, rank them by:

1. **Their own content fits**: `search_posts` filtered to the creator, `queryText` the product
   and theme, last 180 days. A post in the gap's format and theme counts; cite it.
2. **Delivery**: `deliverable` findings with no late or missing in the last 90 days count for
   them; any missing counts against.
3. **Ad readiness**: their library assets' median score.

At most two creators per gap, one asset request per creator per run. An ambassador whose
monthly deliverables could include the asset is flagged "could be part of their monthly posts"
as an S2 your call: ask inside the deal, or as a paid extra.

**3. Write the asset request.** Per creator, in `assetSpec`:

| Field | Holds |
| ----- | ----- |
| `what` | One line: "One 20 to 30 second vertical video unboxing the trail shoe" |
| `shotList` | Three to five shots, the hook first: "Open on the box in hand, say the problem it solves in the first 3 seconds" |
| `specs` | Aspect ratio (9:16 by default for video), length, raw files plus the edit, no licensed music (original audio or none), no text burned in unless asked, captions as a separate file when they have them |
| `due` | The user's date, else 14 days from the send, proposed in S1 |
| `comp` | The fee (**Fees**) and, or, the product from the catalog |
| `usage` | Usage, channels, and duration per **Proposing rights terms**, for the delivered assets |
| `gap` | The gap it fills |
| `hookPattern` | The pattern to use, from the library's best performers |

Shot lists and hooks draw on the library's best posts in the gap (their hook patterns and
openings), never on a competitor's post. Never ask for a claim the brand has not made
(`brand:summary`), a before-and-after a `red_line` rules out, or a minor on screen.

## Recording replies

**Where replies come from.** Pasted by the user, or handed over by outreach triage (a `reply`
finding classed `rights`). Triage keeps only a one-line summary, so the launch carries the reply
text when the main thread has it. Otherwise, with `outreach.watchReplies` on and
`connections.mail.canReadThreads` true, read only that creator's thread since the request's
`sentAt`. Without either, list the creator under "Needs the main thread": "Paste @a's reply to
record it."

**Match** each reply to the open `rights` findings for that creator (requested, renewal
requested, countered). A reply that does not say which posts it covers applies to every post
in the request it answers; say so in the proposal.

**Class**, the first that applies:

| Outcome | What the reply says | Proposed record |
| ------- | ------------------- | --------------- |
| Granted | Yes to the usage, channels, and duration asked, or a clear subset | `rights` status `granted` per post and usage, with `startsAt`, `expiresAt`, `usage`, `channels`, `fee`, and `proof`. A subset grants only what was said yes to |
| Agreed (UGC) | Will make the asset on the terms asked | `rights` status `granted`, `requestKind` `new-ugc`, `assetSpec` with the agreed due date |
| Countered | Asks a different fee, shorter time, fewer channels, or no paid use | `rights` status `countered`, their ask in `counter`. A fee counter, or any ask outside what was requested, is an S2 your call; never decided by the agent |
| Declined | No | `rights` status `declined` |
| Question | Asks something before deciding | No `rights` change; a draft answer only when the records hold the answer, else your call |

**Proof.** Every grant carries `proof`: where and when the creator said yes, in one line
("email reply 2026-10-07", "Instagram DM 2026-10-06", "comment on the post 2026-10-05"), and
`inWriting` (true for email or an Aspire message, false for a DM or a comment).

- A grant given only by DM or comment is recorded with that proof line, `inWriting` false, and
  the advice "Get this in writing before paid use" on the page and in the summary. Propose the
  `rights-in-writing` draft by email when an email route exists.
- **Never invent a grant.** No proof, no grant. A vague "sure, go for it" with no usage named
  grants only what the request asked for, and the summary says so. A reply that is unclear is a
  question, not a grant.
- Dates: `startsAt` is the date of the yes, unless the creator named another. `expiresAt` is
  `startsAt` plus the duration asked, or what the creator stated. Never longer than they said.

**Roster.** For a roster creator, `record` writes the `roster` row only to set `waitingOn` (brand
while a sourcing draft is unsent; `none` when nothing more is owed on the rights) and `yourCall`
(on "Decide later", with the question; cleared when decided). Stage never changes.

**Delivered UGC.** When the user says the assets arrived, `record` writes the `rights` finding
again with `assetSpec.deliveredAt` and `assetSpec.files` (where the user says they are, as
given). A late asset (past `due`, none delivered) shows on the page as "overdue"; the chase is a
`ugc-chase` draft.

## Fees owed: the ledger hand-off

Sourcing never writes `ledger` (`program.md`, **Ledger lines hand-off**). When `record` writes a
grant or an agreed asset request with a fee or product, it returns a fenced JSON block labelled
`ledger-lines`, one line each, with exactly the fields `program.md` lists:

```json
[{"lineId": "rights-creatorhandle-{postId}-paid-usage",
  "handle": "creatorhandle", "kind": "rights", "amount": 250, "currency": "USD",
  "dueAt": "2026-11-06", "from": "rights {postId} paid usage",
  "basis": "Paid usage on Meta ads, 90 days, your usage fees", "revises": null}]
```

- `lineId` is `{kind}-{handle}-{ref}`, stable: `ref` is `{postId}-{usage}` for rights (with
  `-renewal-{n}` for the nth renewal) and the `ugcId` for UGC.
- `kind` is `rights` for a grant or renewal, `ugc` for an asset request. Product given for UGC
  is a `ugc` line with the catalog `value`, `ref` `{ugcId}-product`, and `basis` "product".
- `from` is the record type and its identity. `basis` is one plain line.
- `dueAt`: for rights, 30 days after the grant unless the user set terms; for UGC, 30 days after
  `due`, and `basis` says "on delivery".
- `revises` names the `lineId` it replaces when a fee changed after a counter; otherwise null.
- A grant with no fee returns no line. The ledger can build the same lines from `rights`
  findings, so the block only saves it a read.

## Drafts

Every message is a `draft` finding (`program.md` **5**), shown ready to copy, created in the
mailbox only after S4, never sent by the agent. Identity: creator + template + channel.

**Channels** follow `outreach.md`, **Channels**, with one change of order: for rights, email
first, because a written yes is the proof that matters. Then an Aspire message for roster
creators when the program uses it, then a DM. Email goes to the roster contact or the manager,
else a business email Atlas holds. Creators off the roster get email when Atlas holds one, else
a DM.

**Voice** per `outreach.md`: `outreach.voice`, `outreach.sender`, first name only, no emoji
unless the voice asks, no praise words with nothing behind them. To a creator with a manager,
address the manager and name the creator.

**Lengths.** Email and Aspire: at most 150 words for a rights or renewal request, 180 for an
asset request (the shot list as a short list). DM: at most 60 words, no links, the posts named
in words ("your Reel from Sept 12 with the cast-iron pan").

**Never in a draft:** the program's maximum, the budget, a calculator figure or rate, another
creator's fee or terms, the ad readiness score, a team note, or the approver's name. Placeholders
the records cannot fill are bracketed blanks (`[fee]`, `[due date]`), listed under `blanks`; a
draft with a blank is never sent.

### The templates

`{posts}` is one line per post: the format, the date, and the link (email, Aspire) or a few
words (DM). `{usage line}` is the usage in plain words: "repost on our Instagram and TikTok",
"run as an ad from {Brand}'s accounts on Meta", "run as a partnership ad from your handle on
Meta". `{credit line}` is "We'd always tag you." for organic repost and dropped otherwise.

**`rights-request`**

```
Subject: Could we use your {format} in {Brand}'s {channels short}?

Hi {first name},

Your {format} {post detail} is one of the best things anyone's made about {Brand}:
{posts}

We'd love to {usage line} for {duration} days from when you say yes. {fee line} {credit line}

If that works, reply "yes" here and we'll confirm the details in writing. Happy to answer any
questions.

{sender}
```

`{fee line}` is "We'd pay {fee} for that." or, for no fee, left out. `{post detail}` is one
concrete thing in the post from its caption or transcript, never praise without something
behind it. A request that extends deal usage adds: "Your deal covers this until {deal end}; this
would run from {deal end + 1} for {duration} days."

**`rights-renewal`**

```
Subject: Renewing the rights to your {format}

Hi {first name},

Our rights to {posts} run out on {end date}. It's still working well for us, and we'd love to
keep it running: {usage line} for another {duration} days. {fee line}

Could you reply "yes" here by {reply-by date}? Thank you for making it.

{sender}
```

`{reply-by date}` is 7 days before the end date, or `[date]` when that has passed.

**`ugc-request`**

```
Subject: A {Brand} video request, made by you

Hi {first name},

We'd love you to make something new for {Brand}: {what}.

What we're after:
{shot list, one line each}

Specs: {specs}. Due by {due}.

For this we'd {comp line}. We'd use it to {usage line} for {duration} days.

Does that work? Reply here and we'll confirm it in writing.

{sender}
```

`{comp line}` is "pay {fee}", "send you {product}", or both.

**`rights-counter`** (after the user's S2 answer)

```
Subject: Re: {request subject}

Hi {first name},

Thanks for coming back on this. {answer line} We can do {usage line} for {duration} days{, for
{fee}}.

If that works, reply "yes" here and we're set.

{sender}
```

**`rights-in-writing`** (a grant by DM or comment)

```
Subject: Confirming the rights to your {format}

Hi {first name},

Thanks for saying yes on {where} on {date}. To keep it on record, could you reply "yes" to this
email to confirm: {usage line} for {duration} days from {start date}{, for {fee}}?
{posts}

{sender}
```

**`ugc-chase`**

```
Subject: Re: {request subject}

Hi {first name},

Checking in on the {what short}, due {due}. How's it coming along? If you need more time, just
say when.

{sender}
```

DM versions keep the same ask in at most 60 words with no links, and say "I'll send the details
by email" when an email route exists.

## Your call

Sourcing never decides these. Each returns as an S2 question with the recommended answer first:

| Item | Question | Recommended |
| ---- | -------- | ----------- |
| No fee source (paid usage, whitelisting, asset requests) | "What should we offer @a for {usage} on {n} posts for {duration} days?" Options: "Type a fee", "Ask with no fee", "Skip these posts" | "Type a fee" |
| A fee counter | "@a asked {their fee} for {usage} on {n} posts. We offered {our fee}." Options: "Accept {their fee}", "Hold at {our fee}", "Type a number", "Let it go" | "Hold at {our fee}" when theirs is more than 50% above ours; "Accept" otherwise |
| A counter on usage, channels, or duration | "@a would grant {what they offered} instead of {what we asked}." Options: "Take what they offered", "Ask again for {ours}", "Let it go" | "Take what they offered" |
| Possibly covered by the deal | "@a's {format} from {date} falls in their deal's term but isn't matched to a deliverable. Request rights anyway?" Options: "Request rights", "Treat it as a deliverable (ask the tracker)", "Skip" | "Treat it as a deliverable" |
| Ambassador UGC | "@a's monthly posts could include this {what short}. Ask inside the deal, or as a paid extra?" | "Inside the deal" |
| Records disagree | "The library shows @a's {format} as {grant} and {deal}. Which is right?" Options: the two, "Check the agreement first" | "Check the agreement first" |

An S2 answer that sets a fee joins S1 or S3 for the write. "Decide later" writes the roster
`yourCall` for roster creators, or `rights` status `wanted` with the question in `notes` for
creators off the roster.

## The decision packet

`propose` ends with a fenced JSON block labelled `sourcing-packet`. It holds everything `record`
needs, so `record` never proposes again:

```json
{"program": "{slug}", "mode": "rights", "proposedAt": "2026-10-07T15:02:11Z",
 "runKey": "program-{profile}-{slug}-2026-10-07", "pageUrl": "…",
 "creators": [
  {"handle": "creatorhandle", "network": "instagram", "entityId": "…", "onRoster": true,
   "basedOn": {"roster": "<recordedAt or null>", "rights": "<newest recordedAt or null>",
               "terms": "<recordedAt or null>"},
   "rights": [{"…": "the full rights detail per post and usage this would write"}],
   "skipped": [{"postUrl": "…", "why": "from the deal until 2026-11-01"}],
   "yourCall": null,
   "reply": {"summary": "…", "receivedAt": "…", "channel": "email", "source": "pasted"},
   "roster": {"…": "the full roster detail, when it changes"},
   "draft": {"template": "rights-request", "channel": "email", "to": "creator",
             "subject": "…", "body": "…", "blanks": []},
   "ledger": [{"…": "the ledger-lines entries this would return, record mode only"}]}
 ]}
```

`reply` is present only for a reply pasted straight in (none recorded yet). A your-call item
carries `yourCall` `{question, options, recommended}`, and its `rights` and `draft` are those of
the recommended answer.

## Records written

`append_insights` per `program.md`, **Working state**: role `account_review`, runKey
`program-{profile}-{slug}-{YYYY-MM-DD}`, `schema` the creator's network, `entityKind` `account`,
`entityId` the network's own account id. Each finding carries `detail.recordType`,
`detail.program`, `detail.recordedAt` (one shell timestamp per write), `detail.by`
`atlas-content-sourcing`, and `detail.recipient`. Copy the newest finding's detail for the same
identity and change what moved. Batches of up to 25.

**`rights` identity**: the post + the usage (`program.md`). One finding per post per usage, so
the library's "for that usage" join holds; the newest wins. `version` counts the findings for one
identity and keeps each idempotencyKey unique. A new UGC request has no post yet: its identity is
`ugc-{net}-{handle}-{n}` in `postUrl`'s place (`ugcId`), until the delivered asset is posted.

| On | `rights` status | kind |
| -- | --------------- | ---- |
| S1, request drafted | `requested` (`renewal requested` for a renewal) | `action_item` `medium` |
| S1, kept for later (Decide later, no route) | `wanted` | `action_item` `medium` |
| S3, granted or agreed | `granted` | `went_well` |
| S3, countered | `countered` | `action_item` `medium` |
| S3, declined | `declined` | `needs_improvement` |

**Fields this agent adds to `rights`** (beyond `program.md`'s list, which holds `proof` and
`inWriting`): `postId`, `network`, `version`, `ugcId`, `durationDays`, `currency`, `feeSource`
(`terms`, `user`, `none`), `counter` (their ask), `renews` (a grant identity, or `deal`
with the `terms` version), `dealCovers` (what the deal already granted, when the request extends
it), `requestedAt`, `grantedAt`, `notes`. `assetSpec` holds `what`, `shotList`, `specs`, `due`,
`comp`, `gap`, `hookPattern`, `deliveredAt`, `files`.

**`draft`**: `program.md` fields plus `to`, `posts` (the post links it covers), `blanks`, and
`step`. **`reply`**: only for a reply pasted straight in; triage's replies are never written
again. Class `rights`, `source` `pasted`.

| Record | idempotencyKey |
| ------ | -------------- |
| `rights` | `src-{slug}-{net}-{handle}-{postId or ugcId}-{usage}-v{version}` |
| `draft` | `src-{slug}-{net}-{handle}-draft-{template}-{channel}-{recordedAt}` |
| `reply` | `src-{slug}-{net}-{handle}-reply-{channel}-{receivedAt}` |
| `roster` | `src-{slug}-{net}-{handle}-roster-{recordedAt}` |
| `page` | `src-{slug}-page` |

`{net}` is `ig` or `tt`.

**Freshness.** Before writing, read the newest `roster` and `rights` per creator. When either is
newer than the packet's `basedOn`, write nothing for that creator and report "changed since the
proposal; run content sourcing again".

**Mailbox drafts.** After S4, create one draft per approved creator in the connected mailbox,
addressed per **Drafts**, with the subject and body as shown. Put the draft id in the `draft`
finding's `mailDraftId`. A failed draft stays copy-ready and is reported. Never send.

**The `page` finding.** When none with key `sourcing` exists, the first approved write (S1 or
S3) adds one: `recordType` `page`, `key` `sourcing`, `url`, `title`, anchored to the brand's
own account on its first linked network, `went_well` `low`.

## The sourcing page

One page per program, the sourcing tracker, title "{Brand} {Program}: Content Sourcing",
republished to the link in the `page` finding with key `sourcing` (read it with the Artifact
tool first). Load `artifact-design` and `artifact-capabilities` before building and `dataviz`
for the charts; apply `theme:brand` per `theme.md`, **Applying the theme**; draw creators with
the creator card (`creator-card.md`, page profile, no actions); post images per
`creator-card.md`, **Images** (`thumb@120x150`); render for `recipient`. Rights badges keep the
library's semantic colors.

**Who sees what.** The page is for the brand's team, never for creators. Fees offered and agreed
show on the page. The budget, rights spend against it, and USD calculator references live only
in page data under `team`, readable by Editors. Declare on every publish:

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
| `team/spend` | Rights and UGC fees granted and requested this term, against the program budget, with the currency |
| `team/creator-{net}-{handle}` | The fee basis per request, and any calculator reference |
| `data/users/{id}/done` | Each person's done marks on the your-call list |

Write `team` with one page data batch right after each publish. On first publish say once:
"Share this page with your team as Editor to see the budget. Never share it with creators."

Sections, in order:

1. **Header**: the program, "Prepared for" chip, when the records were read, counts: wanted,
   requested, countered, granted this month, expiring in 30 days, asset requests open.
2. **Your call needed**: one card per open item, the answers with the recommendation first.
   Done marks per viewer.
3. **Requests by status**: tabs for Wanted, Requested, Countered, Granted, Declined. Each row:
   the post thumbnail, creator, format, usage, channels, duration, fee, requested date, days
   waiting, and the proof line for grants ("email reply Oct 7"). Grants with `inWriting` false
   carry "Get this in writing". In `propose`, new rows show "Proposed".
4. **Expiring**: 30, 60, and 90 day tabs with the call per row: "Renew requested", "Renew"
   (proposed), or "Pull from ads by {date}".
5. **Asset requests**: one card per UGC request: creator, what, the gap it fills, due date with
   days left or "overdue", comp, usage, status, delivered files. A small chart of open requests
   by due week.
6. **Granted this month**: one line per grant (creator, posts, usage, channels, until, proof),
   and how many assets that adds to the cleared-for-ads shelf.
7. **Gaps**: the library gaps found in `ugc` mode, as a small grid of product by format with
   cleared counts. Leave out when `ugc` has not run.
8. **Drafts waiting**: one copy-ready block per creator: channel, subject, body, blanks
   highlighted, "In your {mailbox}" when a mailbox draft exists.
9. **Footer**: "Read from Atlas as of {timestamp}", where fees came from ("your usage fees" or
   "your number"), "Rights shown are what your records say. The signed agreement decides paid use.", and
   a link to the content library page.

**Lens order.** `team` keeps the order above. `performance` and `creative` lead with Expiring
and Granted this month. `brand` moves the proof lines and "Get this in writing" up.

## What content sourcing never does

- Send a message, or create a mailbox draft without S4.
- Record a grant without proof, or longer, wider, or cheaper than the creator said.
- Request what the deal already grants.
- Decide a fee, a counter, or anything in **Your call**.
- Price from anything but the program's usage fees or the user's number.
- Write `ledger`, `terms`, `asset`, `deliverable`, `fulfillment`, or a calibration, or move a
  creator's stage. Fees owed go back as `ledger-lines`.
- Look up or fetch a post or creator, start discovery, or call a destructive tool.
- Put the budget, a maximum, a calculator rate, or another creator's terms in a draft.
- Give legal advice. Rights shown are records; the brand's agreement decides.
- Touch a creator ad campaign's records.
