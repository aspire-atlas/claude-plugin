# CAS campaign reference

Used by the **CAS campaign** and **Rates and terms** sections of SKILL.md, and read by the
`atlas-creator-discovery`, `atlas-creator-vetting` and `atlas-creator-brief` agents when they run
in creator-ads mode. Holds the state model, the setup interview, the dispatch table, the gate
packets, the campaign page, reminders, and the rules for unattended runs.

CAS is Creator Ad Services: creators make ads for a brand, run as partnership ads. This
reference covers sourcing, negotiation and briefing: recruit creators (step 12), the client
approves the slate (Gate 2), negotiate rates and terms (step 13), the client approves the rates
(Gate 3), contract and ship (step 14, kept only as ship dates), the master brief (step 15), and
the client approves the brief (Gate 4).

Two names to keep apart. The **Campaign Manager** is this flow. The **CM** is the person running
the campaign on the agency side, who types the client's decisions, counters, and ship dates.

## Why it is a section, not an agent

The Campaign Manager conducts. It reads where the campaign is, shows one status screen, offers
the single next step, launches the agent or section that does the work, records the outcome,
and sets the reminder. It never does the heavy lifting itself. Agents cannot launch other
agents, and every gate decision needs a picker, which only the main thread can show.

## 1a. State model

Two kinds of record, both keyed by the campaign slug, so a teammate or a scheduled run reads the
same campaign.

- **Setup records** are calibrations. They change rarely, and a change goes through the
  supersede rule with its own confirmation.
- **Working state** is findings, written with `append_insights` under one runKey prefix. A
  change is a new finding, never an edit, so gate moves, slate calls and rate changes need no
  destructive tool.

### Setup records (calibrations)

The first five are discovery's own campaign records, so discovery and vetting run with no second
setup.

| Key | kind | What it holds | detail |
| --- | ---- | ------------- | ------ |
| `campaign:{slug}-brief` | `brand_fact` | The campaign in the user's words, plus the type line | `{section: "business_context", body: "type: creator-ads; <campaign description>; term <YYYY-MM-DD>..<YYYY-MM-DD>"}` |
| `campaign:{slug}-criteria` | `guideline` | What every lane shares: networks, market, hard exclusions | `{concern: "requirement", appliesTo: ["creator-discovery", "{slug}"], body: "<one line per dimension>"}` |
| `campaign:{slug}-pool` | `guideline` | The target per lane: three times the creators each lane needs | `{concern: "ceiling", appliesTo: ["creator-discovery", "{slug}"], body: "per lane: <lane>=<target>, ..."}` |
| `campaign:{slug}-routing` | `policy` | Where the page, gate lines and the sync agenda go (C5) | `{area: "routing", body: "page; slack:#channel; email:a@x.com,b@x.com"}` |
| `campaign:{slug}-cadence` | `policy` | The weekly sync slot and timezone (C6) | `{area: "cadence", cadence: "sync", body: "sync weekly <DAY HH:MM>, <IANA timezone>"}` |
| `campaign:{slug}-cas` | `guideline` | Package, term, approvers and backups per gate, turnaround per gate, round | `{concern: "requirement", appliesTo: ["cas-campaign", "{slug}"], body: "<the campaign object, serialized with json.dumps>"}` |
| `campaign:{slug}-lane-{lane}` | `guideline` | One lane: concept, framework and trigger, persona, casting filter, creators needed | `{concern: "requirement", appliesTo: ["cas-campaign", "creator-discovery", "creator-vetting", "creator-brief", "{slug}"], body: "<the lane object, serialized with json.dumps>"}` |
| `campaign:{slug}-decision-defaults` | `guideline` | The rules later performance reads will use | `{concern: "preference", appliesTo: ["cas-campaign", "{slug}"], body: "<the defaults object, serialized with json.dumps>"}` |
| `campaign:{slug}-terms` | `guideline` | Organic posting terms and the whitelisting uplift (Rates and terms) | `{concern: "requirement", appliesTo: ["cas-campaign", "{slug}"], body: "<the terms object, serialized with json.dumps>"}` |

The campaign object:

```json
{"schema": 1, "name": "Spring launch", "package": {"creators": 9, "variants": 3},
 "term": {"start": "2026-11-02", "end": "2027-01-31", "usageDays": 90},
 "gates": {"2": {"approver": "Name", "backup": "Name", "turnaroundHours": 48},
           "3": {"approver": "Name", "backup": "Name", "turnaroundHours": 48},
           "4": {"approver": "Name", "backup": "Name", "turnaroundHours": 48}},
 "round": 1}
```

The lane object:

```json
{"schema": 1, "lane": "busy-parent", "name": "Busy parent", "concept": "…",
 "framework": "Problem then fix", "trigger": "…", "persona": "…",
 "castingFilter": "…", "creatorsNeeded": 3}
```

The decision defaults, saved at setup and read by later performance reads:

```json
{"schema": 1, "winnerMarginPct": 20, "winnerMetric": "cost per result",
 "tieBreak": "3-second hold", "switchOffFloor": {"spendUsd": 30, "impressions": 1000},
 "neverSwitchOffLastAd": true}
```

Rules:

- Derive `{slug}` from the campaign name and `{lane}` from the lane name: lowercase,
  hyphenated, no dates. Show the campaign name, never the slug.
- Parse every JSON body with a JSON parser. A body that does not parse counts as missing, and
  the status screen says setup needs fixing.
- **Keys `campaign:{slug}-cas`, `-lane-*`, `-decision-defaults` and `-terms` belong to the CAS
  campaign** and the three agents in creator-ads mode. Every other flow drops them, as it drops
  `review:` and `vetting:` keys. They are never brand guidelines.

### Working state (findings)

`append_insights`, role `account_review`, runKey `cas-campaign-{profile}-{slug}-{YYYY-MM-DD}`
(the shell date in the cadence timezone), an `idempotencyKey` on every finding. Each finding
carries `detail.recordType`, `detail.campaign`, `detail.round`, and `detail.recordedAt` (full UTC
time from the shell clock).

Read it back with `search_insights` on the prefix `cas-campaign-{profile}-{slug}`, newest first,
paged to the end. `search_insights` is tenant-wide, so always filter on the prefix. For each
record type the newest finding per identity wins, by `detail.recordedAt`.

| recordType | Identity | Anchor | kind | detail adds |
| ---------- | -------- | ------ | ---- | ----------- |
| `gate` | gate + round | The brand's own account on its first linked network | `action_item` `high` while planned, open or slipped; `went_well` when cleared | `gate` (2, 3, 4), `status` (planned, open, cleared, slipped), `plannedAt`, `sentAt`, `dueAt`, `clearedAt`, `clearedBy`, `daysSlipped`, `reminderTask` (the task name) |
| `roster` | the creator's account | The creator's account, `entityId` = the network's own account id | `action_item` `medium` while a candidate; `went_well` approved; `needs_improvement` rejected | `handle`, `network`, `lane`, `slate` (candidate, approved, rejected), `rejectReason`, `rate` (offered, countered, agreed), `offer` `{open, target, max}`, `counter`, `agreed`, `deliverables`, `shipDate`, `vetting` (the four figures and the recommendation) |
| `brief` | lane + round | The brand's account | `action_item` `medium` while a draft; `went_well` when locked | `lane`, `locked`, `briefPage`, `version` |
| `hook` | one per hook or CTA, never replaced | The brand's account | `went_well` `low` | `lane`, `type` (hook, cta), `text`, `pattern`, `firstBriefed` (round and date) |
| `hook-review` | hook + round | The brand's account | `went_well` when it led; `needs_improvement` when it lagged or was not used; `action_item` `low` when held or not measurable | `lane`, `hook` (the text), `pattern`, `postsMatched`, `vsMedian`, `result` (led, held, lagged, not used, not measurable yet) |
| `ledger` | one per line, never replaced | The brand's account | `needs_improvement` | `gate`, `daysSlipped`, `reason`, `shifted` (the gates and dates it moved) |

A creator ad campaign needs at least one linked Instagram or TikTok channel on the brand
profile, because every state finding is anchored to an account. Without one, say so in one line
and offer to connect a channel (Phase 4.2).

**Done when** a reader can say where any campaign is from these records alone: the setup records
give the plan, and the newest gate, roster and brief findings give the position.

## 1b. Setup interview

Main thread only. Before asking anything, call `search_calibrations` (no filter, limit 100 per
page, paged to the end, `includeSuperseded: true`) and skip any question whose answer is saved.
One `AskUserQuestion` per question, in order, never plain text. The tool adds its own free text
field; never add "Other" or "Skip".

A second run shows each saved answer with "Keep as saved (Recommended)" and "Change". A change
goes through `supersede_calibration` with its own Destructive tools confirmation.

| # | Question | Options | Writes |
| - | -------- | ------- | ------ |
| C1 | What is the campaign? Give its name, the package (creators times variants) and the usage term dates. | Starters drawn from `brand:summary`, for example "{Brand} spring launch, 9 creators x 3 variants, 90-day term"; the free text carries the real answer | `campaign:{slug}-brief`, `campaign:{slug}-cas` (name, package, term) |
| C2 | Paste a lane from the Gate 1 deck: concept, framework and trigger, persona, casting filter, and how many creators it needs. | 1) Add this lane; 2) That's all the lanes. A pasted lane goes in the free text. Repeat until the user picks option 2. | `campaign:{slug}-lane-{lane}` per lane, `campaign:{slug}-pool` (3 times each lane's need) |
| C3 | Who approves Gates 2, 3 and 4 on the client side, and who is the backup? | 1) The same approver and backup for every gate (type them); 2) A different approver per gate (type them) | `campaign:{slug}-cas` (gates) |
| C4 | How long does the client get at each gate? | 1) 48 hours each (Recommended); 2) 24 hours each; 3) I'll set them per gate (type them). Planned send dates per gate may go in the free text too. | `campaign:{slug}-cas` (turnaround); a `planned` gate finding per gate with a date |
| C5 | Where should the campaign page and gate updates go? (multiSelect) | 1) Published page + chat summary (always on); 2) The shared Slack channel (type it); 3) Email (type the recipients) | `campaign:{slug}-routing` |
| C6 | When is the weekly sync with the client? Give the day, time and timezone. | 1) Monday 10:00, my timezone (Recommended); 2) Thursday 15:00; 3) I'll set it (type it) | `campaign:{slug}-cadence` |
| C7 | Save this campaign setup for {brand}? Everyone on the team and every scheduled run will use it. | 1) Save the campaign (Recommended); 2) Change something | Every record above, plus `campaign:{slug}-criteria` and `campaign:{slug}-decision-defaults` |

Rules:

- **C1** derives the slug and shows the campaign name back. When `campaign:{slug}-brief` exists
  without the `type: creator-ads` line, it is a discovery campaign: offer to add the line
  through the supersede rule, or to start a new campaign name.
- **C2** reads the pasted text into the lane object and shows it back in one line before the
  next turn. A missing part is asked once in the next picker's text. Lanes stop at "That's all
  the lanes".
- **The shared criteria** come from the lanes and the brand's records, not a new question:
  networks are Instagram and TikTok unless a casting filter names one, market comes from
  `brand:business-context`, and exclusions fold in every `competitor` and `red_line` record
  (not `review:` keys). Show them in the C7 summary so the user can correct them.
- **C5 is the standing approval to deliver.** Say so plainly: "Gate updates, reminders and the
  weekly sync will post to {channel} and email {recipients} without asking each time." The page
  and chat summary always ship.
- **C6 is the standing approval to run scheduled tasks for this campaign.** Say so plainly:
  "This sets a weekly sync task and a reminder for each open gate. They run on their own,
  without asking each time." It is also the standing approval for paid discovery on this
  campaign (SKILL.md, **Guardrails**): discovery may use the creator marketplace and paid
  lookups for this campaign's lanes without asking again.
- **C7** lists every answer and the derived criteria in one summary, then writes all records
  with `append_calibration`, `provenance: "interview"`. A `key-exists` follows the Phase 5
  supersede rule. The decision defaults are written as saved above; say once that later
  performance reads will use them and that they can be changed.

## 1c. Dispatch table

Read the setup records and the working state, then find the campaign's row. **Read from the
bottom up: the first row whose condition holds is where the campaign is.** Conditions read the
current round only.

| # | Condition | The status screen says | The one next step | Runs it | Writes back | Reminder |
| - | --------- | ---------------------- | ----------------- | ------- | ----------- | -------- |
| 1 | No lanes saved | "No lanes yet." | Set up the campaign | **CAS campaign**, Setup | The setup records | None. After setup, offer the weekly sync. |
| 2 | Lanes saved, pool empty | "{n} lanes ready. No creators yet." | Recruit creators for every lane | `atlas-creator-discovery`, creator-ads mode | Discovery's undecided findings, one pool per lane | None |
| 3 | Pool below target on any lane | "{lane}: {n} of {target} creators." One line per lane. | Fill {lane} to {target} (the emptiest lane first) | `atlas-creator-discovery`, creator-ads mode | Same as row 2 | None |
| 4 | Pool at target, Gate 2 not sent | "Pools are full. The slate is ready to vet." or "Vetted. Ready for the client." | Vet the {lane} pool, until every lane is vetted; then send the Gate 2 packet | `atlas-creator-vetting` with the lane as criteria; then **Gate 2 packet** below | Vetting's findings; then a `roster` candidate per slate creator and Gate 2 `open` | Gate 2 reminder at its due time |
| 5 | Gate 2 open | "Waiting on {approver} since {sent}. Due {due}." Past due: "{n} days late." | Record the client's decisions. Past due: log the delay, or chase the backup. | **CAS campaign**, Run, batch picker | `roster` approved or rejected with reason, discovery verdicts, Gate 2 `cleared`; a `ledger` line when late | Removes the Gate 2 reminder |
| 6 | Gate 2 cleared, no rates | "{n} creators approved. No rates yet." | Draft rates and terms | **Rates and terms** | `roster` rate `offered` with the offer; the rate sheet page | None |
| 7 | Rates drafted, Gate 3 not sent | "Rates drafted for {n} creators. {c} countered." | Send the Gate 3 packet. While a counter is open: record it first. | **Gate 3 packet** below | Gate 3 `open` | Gate 3 reminder at its due time |
| 8 | Gate 3 open | "Rates with {approver}. Due {due}." | Record the client's rate approval | **CAS campaign**, Run, batch picker | `roster` rate `agreed`, ship dates, Gate 3 `cleared`; a `ledger` line when late | Removes the Gate 3 reminder |
| 9 | Gate 3 cleared, no brief | "Rates agreed. Contracts and shipping run in Aspire. No brief yet." | Write the master brief | `atlas-creator-brief`, creator-ads mode | A `brief` draft per lane, `hook` lines | None |
| 10 | Brief drafted, Gate 4 not sent | "{n} lane briefs drafted." | Send the Gate 4 packet | **Gate 4 packet** below | Gate 4 `open` | Gate 4 reminder at its due time |
| 11 | Gate 4 open | "Briefs with {approver}. Due {due}." | Record the client's brief approval | **CAS campaign**, Run, batch picker | `brief` locked per lane, Gate 4 `cleared`; a `ledger` line when late | Removes the Gate 4 reminder |
| 12 | Gate 4 cleared | "In production. Hands to the content review flow." | Review a creator's draft. Once creators have posted: review the round's hooks. | **Content review**; the hook review in `hooks-and-ctas.md` | Content review's own findings; `hook-review` findings | None. Offer once to keep or stop the weekly sync. |

Rules:

- **One next step.** The status screen offers the row's step as the first option, then at most
  two others that always apply: "Log a delay", "Change setup". Never a menu of every step.
- **Slips.** A gate is slipped when it is open past its due time. Logging the delay writes the
  gate as `slipped` with the days, writes one `ledger` line, and writes a new finding for every
  later gate with a planned or due date, moved by the same days. Closing a slipped gate writes
  the final days slipped; any days not yet logged get their own ledger line and move the later
  dates the same way.
- **Closing a gate removes its reminder.** Delete the gate's scheduled task by the name saved
  in `reminderTask`, after the close is written.
- **Next round.** Before a new round, offer the hook review (`hooks-and-ctas.md`, **The hook
  review**) when the round has no `hook-review` findings yet, so the next briefs lead with what
  worked. After Gate 4, "Start round {n+1}" asks one picker: "New briefs, same
  creators (Recommended)" starts at row 9; "New creators too" starts at row 2. The round change
  supersedes `campaign:{slug}-cas` with its own confirmation. Hooks in the log stay refused in
  every round.

## Gate packets

Every packet is a page, published per **Page mechanics** below, with a gate header: the gate,
the round, the approver and backup, sent at, due at, and what clearing it unblocks.

**Sending a packet.** One `AskUserQuestion`: "Send the Gate {n} packet to {approver}, due
{due}? A reminder will post to {channel} at that time." Options: "Send it (Recommended)",
"Change something". On send: write the gate `open` with `sentAt` (shell clock) and `dueAt`
(sent plus the gate's turnaround), create the reminder (**Reminders**), post the gate line, and
republish the campaign page. The client receives the packet from the CM; the flow never emails
the client unless the client's address is in the routing record.

### Gate 2: the slate

Composed from the newest vetting run per lane (`creator-vetting-{profile}` prefix,
`detail.campaign` = the slug and `detail.lane` = the lane).

- One page section per lane, with the lane's concept and persona at the top.
- One row per creator: the creator card (`creator-card.md`, page mode), lane, hook rate, Reels
  interaction rate, past paid partners, partnership readiness, the recommendation, and the
  reason. Every Reject shows its reason. TikTok rows say "Hook rate not available on TikTok".
- Numbered from 1 across the page, because those numbers are what the client's decisions
  reference.
- On send, also write a `roster` candidate for every creator on the slate.

**Closing Gate 2.** The client's decisions come back in chat in the CM's own words ("approve 1
to 6 and 9, reject 7 for tone, 8 is too close to a competitor"). Resolve the numbers against the
packet, then one batch picker names every accept and every reject with its reason: "Approve @a,
@b, @c and reject @d (tone) and @e (competitor)? This closes Gate 2." Options: "Close Gate 2
(Recommended)", "Change something". On close, write in this order:

1. A `roster` finding per creator: `approved`, or `rejected` with the reason.
2. The discovery verdicts for the same creators (`went_well` or `needs_improvement`), per
   `creator-discovery.md`, **Decisions**, so a rejected creator never comes back.
3. Gate 2 `cleared` with `clearedAt` and `clearedBy`, and a ledger line when it was late.
4. Remove the reminder, post the gate line, republish the page.

A lane with fewer approved creators than it needs is named on the status screen, and the next
step becomes "Fill {lane}" (row 3) before rates.

### Gate 3: the rate sheet

The packet is the rate sheet page from **Rates and terms** (`rates-and-terms.md`) with the gate
header. Closing it: one batch picker naming each creator's agreed fee, then the ship dates
question from that reference. Write the roster findings, Gate 3 `cleared`, remove the reminder,
post, republish.

### Gate 4: the briefs

The packet is the round's brief page from `atlas-creator-brief` in creator-ads mode, with the
gate header. Its hooks and CTAs follow `hooks-and-ctas.md`, each with the reason it was
recommended. Closing it: one picker, "Lock the round {n} briefs for {lanes}? This closes Gate 4
and hands the campaign to content review." On close, write a `brief` finding per lane with
`locked: true`, Gate 4 `cleared`, remove the reminder, post, republish. The status becomes "In
production. Hands to the content review flow."

## 1d. The campaign page, reminders, unattended rules

### The campaign page

One page per campaign, republished to the same path on every change, so the link in the channel
stays stable. Title "<Brand> Creator Ad Campaign: <Campaign>". Sections in order:

1. **Header**: brand, campaign, package (creators times variants), term, round, and the
   "Prepared for" chip (`recipient-lens.md`).
2. **Lanes**: one card per lane with concept, persona, and pool count against target.
3. **Gate strip**: Gates 2, 3 and 4 with status (planned, open, cleared, slipped) and the
   planned, due or cleared date.
4. **Roster**: by lane, one row per creator with slate state, rate state, agreed fee, and ship
   date.
5. **Brief**: the round's brief version per lane, locked or draft, with its link, and the hook
   review table per lane once one is saved (`hooks-and-ctas.md`).
6. **Open items**: the next step, counters awaiting an answer, missing ship dates.
7. **Delay ledger**: every slip with the gate, days, reason and what moved.
8. **Footer**: sources, the fee rate label once, and "numbers come from Atlas as of
   {timestamp}".

### Page mechanics

Load `artifact-design` before building, and `dataviz` for any chart. Apply `theme:brand` per
`theme.md`, **Applying the theme**. Gate and slate status keep their semantic colors under any
theme. Creators are drawn with the creator card, images embedded per `creator-card.md`,
**Images**, page profile. Publish with the Artifact tool.

### Reminders and the weekly sync

Same mechanics as **Readouts**, Schedule, in SKILL.md: the session's scheduled-task tools, never
local cron, list existing tasks first, standalone prompts that say "do not ask questions" and
state no date. C6 is the standing approval, so a gate send or close creates or removes its task
without a second question; the send confirmation names the reminder.

- **Gate reminder.** One task per open gate, named "Atlas CAS reminder: {brand} - {campaign} -
  Gate {n}", firing once at the gate's due time. Use a one-time schedule when the tools offer
  one; otherwise a cron pinned to that date and time, which the close removes.
- **Weekly sync.** One task named "Atlas CAS weekly sync: {brand} - {campaign}" at the C6 slot,
  converted to UTC cron (`M H * * D`, shifting the weekday when the conversion crosses
  midnight). It republishes the page and posts the agenda: gate status, blockers, and the next
  step.
- **Gate lines.** Any gate change or ledger line posts one line to the routing channel when it
  is written: "{Campaign}: Gate {n} {status}. {one fact}. {page link}". Interactive runs confirm
  the send once per session; scheduled runs use the C5 standing approval.

Reminder prompt:

```
Run /aspire:aspire cas campaign for {brand}, campaign {campaign}, as an unattended Gate {n}
reminder. Use the Aspire Atlas connection and the campaign's saved records. Do not ask
questions. Do not record any decision or write anything to Atlas. Read the date from the shell
clock in the campaign's saved timezone; do not trust any date in this prompt. If Gate {n} is
already cleared, stop without posting. Otherwise post the reminder to the destinations saved in
the campaign routing, naming the approver and backup, and republish the campaign page.
```

Weekly sync prompt: the same text, with "as an unattended Gate {n} reminder" replaced by "as
the unattended weekly sync", and the last two sentences replaced by "Republish the campaign
page, then post the agenda (gate status, blockers, the next step) to the destinations saved in
the campaign routing."

### Unattended runs

Follow the readout rules (`readout.md`, **Scheduled (unattended) runs**):

- Never ask a question. Never decide: no gate close, no slate call, no rate change, no ledger
  line. Publish and post only.
- A slip is shown as "{n} days late, not yet logged" until a person logs it.
- Never launch an agent and never start discovery work.
- Resolve the date from the shell clock in the cadence timezone (`TZ=<tz> date +%F`).
- If the campaign records are missing, publish a one-card page titled "<Brand> Creator Ad
  Campaign: setup needed" listing what is missing, write nothing, and end with "Run
  /aspire:aspire cas campaign to finish setup."
- If Atlas returns an unauthorized error, publish the same card with "Aspire Atlas needs a fresh
  sign in" and stop.

## What this flow never does

- Contracts, addresses and shipping. They run in the core Aspire platform; the flow keeps only
  the ship dates the CM types.
- Paid performance data (paid hook rate, cost per result). The decision defaults are saved for
  later reads; nothing here reads ad spend.
- Hero cuts, variants and delivery (steps 16 to 20).
