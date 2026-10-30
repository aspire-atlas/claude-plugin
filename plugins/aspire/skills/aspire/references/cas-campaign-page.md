# CAS campaign page: layout and Home

Part of the CAS campaign reference. `cas-campaign.md` holds the state model, setup interview,
dispatch table, gate packets and flows, and its **1d** maps every part of the campaign page to
its file. A section named here without a file, such as **Gate 2** or **1e**, is in the file
that map gives.

## 1d. The campaign page

One page per campaign, one link, republished to the same path on every change. The link is saved
in `campaign:{slug}-cas` as `pageUrl` after the first publish. The page's structure, order,
labels and controls are fixed below; data comes from the records and the page data.

### Who sees what

The page knows who opened it and gives each person one of three roles. The CM shares it from its
share menu: the client's approvers as **Contributor**, the agency team as **Editor**. The page reads
the role from the `user` capability, never from anything a person typed:

| Role | Who | The page's test | What they get |
| ---- | --- | --------------- | ------------- |
| **Agency** | Editors and the owner | `canEdit()` is true | Every field, every control, and **Preview as client** |
| **Client** | Contributors | `canEdit()` is false and `can("data.write")` is true | The client's view, with the client's controls (**What the client can write**) |
| **Read only client** | Viewers, Commenters, and anyone from outside the organization | Neither | The client's view with every control shown as a label |

When `can("data.write")` returns null, the platform has not said, so the page treats the person
as **Client**. If a write is then refused, the page keeps the choice they made on screen, marked
"Not saved", shows the read only line below, and treats them as **Read only client** for the rest
of the visit. A choice never disappears silently.

Say once, when the page is first published: "Share it with the client as Contributor, so their
decisions save on the page." The page's data rules give write access by share level, and a person
from outside the organization that publishes the page holds the lowest level whatever the share
menu says. A client approver outside it reads the page itself but nothing from the page data, and
nothing they do saves. Their read only view says so in one line: "Your choices can't save from
this account. Tell {CM name} your decisions." The CM then records them in the chat, the way a
decision typed in chat is recorded (**Gate 2: the creators**). Cut approvals are the exception:
a cut call has no campaign record and a call from Aspire's side never counts, so they can't be
recorded from the chat (**Content Review**, **The status flow**). Such an approver approves cuts
through a teammate at {brand} who can open the page as Contributor, or once the CM shares the page
with them from inside the organization. Say this to the CM in the same first-publish message when
the client's approvers are outside the organization.

Fields marked agency only never render for the client. They are never written into the page
itself, only into the agency's page data, which the client cannot read (**1e**). Hiding them
with styling is not enough: the check in **1e**, **Checking the roles**, reads the data at the
client's level before the link goes out.

| Field | Client | Agency | Source | Tab |
| ----- | ------ | ------ | ------ | --- |
| Handle, name, descriptor, location (City), concept, persona, product | yes | yes | Roster, creator card | Creator Selection, Selected Creators |
| Tier (Nano to Mega) | yes | yes | Worked out at publish from followers (**Creator Selection**, **Tiers**) | Creator Selection, Selected Creators |
| Latest posts, reach, engaged accounts, round chips | yes | yes | Discovery, vetting, roster | Creator Selection |
| Campaign match: the client's score, its band, competitor lines, and its Performance, Brief fit, Paid history and Content reach rows with their inputs, levels and Watch line | yes | yes | Stored at publish (**Creator Selection**, **The match score**) | Creator Selection |
| The agency's score, its Budget vs target row, its levels over the whole pool, and the weights in use | no | yes | Stored at publish, `agency` | Creator Selection |
| A creator's concept and persona for the round | yes, labels | yes, editable | The round's Master Brief, agency edits | Creator Selection, Selected Creators |
| The concept's positioning line, hooks, CTAs and selling points on a creator's card | yes | yes, read only there (edited in the brief) | The round's Master Brief, read by reference | Selected Creators |
| A creator's variant plan: each variant's framework, length, hook and CTA, its overrides and who set them, "Plan broken" | no | yes, editable | The concept's variant plan, agency edits (`agency`) | Selected Creators, Content Review and Ad Performance (read) |
| Decision counts and the hook rate tile in **Summary** | yes | yes | Worked out on the page | Creator Selection |
| Hook rate, engagement on Reels, paid work before, ad permissions | yes | yes | Vetting | Creator Selection |
| Instagram and TikTok: handle, followers, engagement rate, average engagement, audience | yes | yes | Creator card data | Creator Selection |
| Why we picked them | yes | yes | The CM's note | Creator Selection |
| Bio, category, verified, every badge, audience (gender, age, top countries, top cities), each post's caption and figures, and the Hook post and Paid partnership marks | yes | yes | Creator data and posts read at publish | Creator Selection, the creator viewer |
| Notes: the client's notes and Aspire's notes for {brand} on a creator, each with who wrote it and when | yes, their own editable | yes, Aspire's editable | Client and agency on the page | Creator Selection, the creator viewer |
| Your decision, reason, and who decided | yes, editable | yes, read only | Client on the page | Creator Selection |
| Status, ad permissions | yes, labels | yes, editable | Campaign state, agency edits | Creator Selection, Selected Creators |
| What they make, usage, exclusivity, agreed fee | after the fees are sent | yes | Rates and terms | Selected Creators |
| Fee approval | yes, editable while step 3 is open | yes, read only | Client on the page, under their own id | Selected Creators |
| A creator's step of 8, its dates, and the waiting on line | yes | yes | Worked out on the page from the records (**Selected Creators**, **Steps**) | Selected Creators |
| Contract status and signed date | after the fees are sent | yes, editable | The creator's contract record for the round (**Selected Creators**, **Creator records**) | Selected Creators |
| Footage received per deliverable | yes | yes, editable | The creator's footage record for the round | Selected Creators |
| Shoot by | yes | yes, editable | Agency edits, else the round's First cut review step | Selected Creators |
| Payment status | after the fees are sent | yes, editable | The creator's payment record for the round | Selected Creators |
| The round's rates per deliverable, the contracted total and the amount paid so far | no (the total and the amount paid aren't secret, since the client reads the agreed fee, the uplift and the payment status, but they are shown to the agency only) | yes; the rates are recorded in the chat, the rest worked out | `agency`, worked out on the Editor's page from the agreed fee, the uplift and the payment status | Selected Creators |
| Details to add: name and address | yes | yes | Worked out on the page | Selected Creators |
| Details to add: email, phone and rates | no | yes | Worked out on the Editor's page from `agency` | Selected Creators |
| Round totals: creators, shipping confirmed, variants delivered and approved | yes | yes | Worked out on the page | Selected Creators |
| Round totals: fees agreed this round and committed against the budget | no | yes | `agency/budget`, agreed fees | Selected Creators |
| Brief state, content state, content folder | yes | yes | Campaign state | Selected Creators |
| Ship to: city, region and country of the address, or pickup and its visit date, and whether the address is confirmed for the round | yes | yes, editable | Details reply, agency edits (`creators`, `edits`) | Selected Creators |
| Street address (lines 1 and 2), ZIP or postal code, delivery note | no | yes, editable | Details reply, agency edits (`agency`) | Selected Creators |
| Shipping: item, carrier, tracking, shipped, delivered and ETA dates, product status, Mark shipped, Mark delivered, Kept last round's product | yes, editable | yes, editable | Client edits, agency edits | Selected Creators |
| Where a value came from (its source tag) | yes, on what they can read | yes | Each value's stamp (**1e**, **Every editable value**) | Every tab |
| The brief: status, title, summary, source doc (the brief agent's page for the agency only), tone of voice, do's and don'ts, disclosure, file naming; each concept's product, name, line, personas, trigger, framework, story, selling points, hero beats, beats, hooks, CTAs, body, length, runtime, B-roll and coverage | yes | yes, editable | `atlas-creator-brief`, agency edits | Master Brief |
| Comments and replies on the brief and on cuts | yes, editable | yes, editable | Client and agency on the page | Master Brief, Content Review |
| Sign off or request changes on the round's brief, the call on a changed brief, cut approvals | yes, editable | yes, read only | Client on the page | Master Brief, Content Review |
| Send for sign off and Reopen, with its reason | yes, labels | yes, editable | Agency on the page | Master Brief |
| Copy creator brief | yes | yes | The brief as the viewer reads it | Master Brief |
| Agency only comments on the brief and on cuts, every comment on a variant included | no | yes | Agency on the page | Master Brief, Content Review |
| Cuts: the count tiles and filter, each creator's tab and status dots, and per variant the poster, version, stage, status and open comments | yes; a version in Aspire QA shows as its status only, and the client works on the newest version sent to them | yes, with **Add cut** on an empty slot | Agency uploads and links, Aspire's sends, the client's calls (`reviews`, `cut-calls`) | Content Review |
| A cut's uploaded video | yes, for people in the organization that published the page | yes | The page's asset store | Content Review, Selected Creators (the cut tiles) |
| Cut tiles on a creator's card: each variant's latest version, its status, open comments and **Open in review** | yes, the newest version sent to them, never one in Aspire QA; a read only client sees one line, no tiles | yes, the newest version | `reviews`, `cut-calls`, `comments` (**Selected Creators**, **Cut tiles**) | Selected Creators |
| Status updates to {brand} on a creator: the text, who sent it and when | yes, but not a read only client | yes, editable | Aspire's notes for {brand} (`edits`), tagged to the client side | Selected Creators, the creator viewer |
| **Update {brand}** | no | yes | Agency on the page | Selected Creators |
| A cut's versions, compare, the status, the last move and who made it | yes, for versions sent to them | yes, every version | `reviews`, `cut-calls` | Content Review |
| Send to {brand}, Send as is, Back to editor, Nudge {brand}, Upload new version | no | yes, editable | Agency on the page | Content Review |
| Approve, Request changes, Undo approval on a cut | yes, editable | yes, read only | Client on the page, under their own id | Content Review |
| The brief check's eight results and the file's runtime and size | yes, read only | yes, editable | `reviews` (the version) | Content Review |
| The variant's hook, CTA, framework and target length beside the brief check, check notes, Claude's suggested ticks, "Back with editor" | no | yes | `agency/brief-*`, `agency/creator-*-r{round}`, `agency/cut-{cut}` | Content Review |
| The round's steps: name, date, owner, done | yes | yes, editable, except an approval's tick | Round records, agency edits | Home |
| Program terms: term dates, what each creator makes, ad ready videos, variants per creator, usage days, allowlisting, partnership ads, exclusivity, organic posting | yes | yes, editable | Campaign records, agency edits, program files | Home |
| The allowlisting uplift on a fee | after the fees are sent | yes, editable | `campaign:{slug}-terms` | Home, Selected Creators |
| Products in scope: photo, name, status, description, creator counts | yes | yes, editable | Campaign record, agency edits | Home |
| The Aspire team: name, role, title, work email, what they own, what to go to them for | yes | yes, editable | Campaign record, agency edits | Home |
| Program files: label, category, version, round, who added it, date, preview, download, and what's still needed | yes | yes, editable: add, upload, edit, remove | Agency on the page, files Claude found in the chat | Home |
| A file's scan state and what each scan found | no | yes | The page's scan | Home |
| The brief's variant plan, the frameworks, **Versions** and **Reset to original** | no | yes | `atlas-creator-brief`, agency edits | Master Brief |
| Aspire notes (agency only), vetting evidence, safety detail, the recommendation | no | yes | Vetting, CM, agency on the page | Creator Selection, the creator viewer |
| A surprise reason (Why pass?, What made them a yes?) on the client's own call | yes, their own editable | yes, read only | Client on the page | Creator Selection, the creator viewer |
| Match score tuning: agreement by match level, our top 10, the agreement score and its verdict, surprises with their reason counts, What {brand} seems to value, Did it sell, the suggested weights, Apply tuned score and Back to default | no | yes | Worked out on the Editor's page; `agency/match-score` | Creator Selection |
| Email, phone, manager, reply window, last contact | no | yes | Creator card, CM | Creator Selection, Selected Creators |
| Rate per deliverable (UGC video, Reel collab, 90 day usage), expected cost, cost per 1K reach, offer open and max, counters, waiting on | no | yes | Rates and terms | Creator Selection (expected cost, cost per 1K reach, waiting on, and every one in the creator viewer's **Rates and terms**), Selected Creators |
| Email drafts and the reply log | no | yes | Campaign Manager | Selected Creators |
| Copy shipping label, Copy email | no | yes | The creator's profile | Selected Creators |
| Budget total, budget left, committed, approved not contracted, unpriced, over budget | no | yes | Campaign record, agreed fees, expected costs | Creator Selection, Selected Creators |
| Offers out | no | yes | Rates and terms | Selected Creators |
| Who else an attention item waits on | no | yes | Campaign state | Home |
| Ad results: cost per sale against the target, the hit rate, every headline number, the weeks, and per variant its creator, concept, spend, days live, hook rate, cost per sale and status | yes, a read only client too | yes | `search_ads` on {brand}'s own ad account, read at publish into the page itself (**Ad Performance**) | Ad Performance, Home, Selected Creators |
| A ranked variant's hook and CTA | no | yes | **Reading a creator's variant** on the Editor's page | Ad Performance |
| Results compared by concept, persona, product, creator and tier, with the client's insight cards, and the audience by age, gender and region once **Who watched** is shown | yes, a read only client too | yes | Claude at publish, into the page itself (**Ad Performance**, **Compare**, **Who watched**) | Ad Performance |
| Results compared by framework, hook and CTA, and the agency's insight cards | no | yes | **Reading a creator's variant** on the Editor's page; the cards from `agency/performance-r{round}` | Ad Performance |
| Changes for round {t}: the accepted concept lines, their figures and where they were applied | yes, read only; a read only client the copy in the page itself, as of the last publish | yes, editable | `changes/r{round}`, written when an Editor accepts a concept line, and copied into the page itself at each publish (**Ad Performance**, **Changes for round {t}**) | Ad Performance, Master Brief (**Changes from round {n}**) |
| Changes for round {t}: every proposed, dropped or not yet accepted line, every hook, CTA, framework and creator line with its figures, the calls, **Apply to round {t} brief**, and the "From round {n} results" marks on the next brief's parts | no | yes, editable | `agency/changes-r{round}`, `agency/brief-round-r{round}` | Ad Performance, Master Brief |
| Live post per variant, and ads not matched to a variant (ad name, post, spend, dates) | no | yes, editable | `agency/creator-{net}-{handle}-r{round}`, `agency/performance-r{round}` | Selected Creators, Ad Performance |
| History entries about agency only data, agency only comments included | no | yes | The activity log | History |
| Tags for Aspire or someone at Aspire, from either side | only the ones they wrote | yes | Tags | Inbox |

**Program terms are the client's own.** Home's **Program terms** are what the brand bought in its
SOW, so the client sees them from the first publish. They are not the per creator rows of
**Contract and rates**: a creator's own deliverables, usage and exclusivity, and every fee, keep
the rule above and reach the client only once the fees are sent. The allowlisting uplift is a fee,
so it follows the fees.

**Files and the scan.** Program files are the client's own documents, so the client sees every
one and can open it. Only the agency adds, uploads, edits, removes and scans them: the page's
uploads are granted to Editors only, a scan spends the usage of the person who runs it, and what a
scan writes is program records the agency owns (**1e**, **Program files and the scan**). A client
who has a file to add sends it to the CM, who adds it. A scan's state and findings stay agency only,
because they can name the budget.

**Contact details.** The agency only row covers the creators' contact details: their email,
phone and manager, which the client never sees. The Aspire team's work emails are a different
thing. They are Aspire's own people, listed so the client can reach them, so each one shows to
everyone the page is shared with, in the page itself. Nothing else about a team member is
private, and no creator's contact detail is ever listed under **Team**.

**Addresses.** A creator's street, ZIP or postal code and delivery note are agency only, with
their email and phone. The client doesn't need them to do their part: the shipment runs in the
core Aspire platform (**1f**), and what the client edits (the carrier, tracking, dates and product
status) never needs the street. So the client reads only where the package goes in broad terms,
the city, region and country, or the pickup and its visit date, plus whether the address is
confirmed for the round. The page itself never holds any part of an address, not even the city:
the client's part is in client readable page data and the rest in `agency` (**1e**), so a Viewer
or someone outside the organization, who can open the page but read no page data, sees none of it.
When {brand} ships the product itself, the CM copies each label from the card (**Copy shipping
label**) and sends it to {brand} directly. Claude never prints a street address in the chat
(**1f**).

#### What the client can write

Per tab, the client writes only these. Everything else on the tab is read only for them and renders
as a label, never as a disabled control. The agency writes everything else on the page.

| Tab | The client writes | Page data (**1e**) |
| --- | ----------------- | ------------------ |
| Home | Done marks on their own items in **Waiting on you** | `data/users/{id}/done` |
| Master Brief | Comments and replies, resolving their own threads; Sign off or Request changes on the round's brief; the call on a creator's changed brief | `comments`, `signoffs/{id}`, `client/changes-{net}-{handle}-r{round}` |
| Creator Selection | Your decision and a reason on the call, or the surprise reason when the call asks one; your notes, one entry each, and only your own edited or removed | `decisions/{id}`; `note-{id}` in `client/creator-{net}-{handle}-r{round}` |
| Selected Creators | Approve fees or Request changes, with a note, once per round; the shipping record: item, carrier, tracking, shipped, delivered and ETA dates, product status, through Mark shipped, Mark delivered and Kept last round's product too | `fees/{id}`, `client/creator-{net}-{handle}-r{round}` |
| Content Review | Comments on a cut, at a timecode or with a drawing; Approve, Request changes, Undo approval on the newest version sent to them | `comments`, `cut-calls/{id}` |
| Ad Performance | Nothing | None |

On every tab the client also marks their own inbox items read or cleared
(`data/users/{id}/inbox-{month}`), opens and closes sections (`data/users/{id}/collapse`,
**Collapsing sections**), and tags people in the notes and comments above (`tags-client`
and `tags-agency`, **Tagging**).

**The client's own calls stay the client's.** Their decision, reason, surprise reason, notes, sign offs, fee approval
and cut approvals render read only for the agency, and their creator decisions, sign offs, fee
approvals and cut calls are kept under their own id, where no Editor but the page's owner can write, so the record of what the client decided is the
client's own. When the client gives a call in the chat or on the weekly sync, the CM records it in
the chat (**Pulling decisions**), not on the page. The shipping record is shared:
the client writes it to `client/creator-{net}-{handle}-r{round}` and the agency to
`edits/creator-{net}-{handle}-r{round}`, and the page and the pull show the newer of the two, by
each field's `at` (**1e**, **Every editable value**).

#### Preview as client

The agency gets one **Preview as client** Switch in the header, on every tab. On, the page renders
exactly what a Contributor on the client's side gets, built the same way the client's page is built,
from the page itself and the client readable page data (`client`, `edits`, `comments` and the shared
documents), never by hiding agency parts of the agency's own view:

- Every agency only field, section, column and "Agency only" rule is gone, and nothing is read from
  `agency`.
- Controls follow **What the client can write**, and every one of them is read only for the
  preview: the preview never writes page data. The agency's own Status and Ad permissions dropdowns
  become labels.
- **Waiting on you**, the count badges and **Needs attention** are worked out for the client side,
  with no done marks, the way a client who has marked nothing sees them.
- The **Inbox** shows what a client approver's would, from the client readable data only: every
  item unread, the tags for Client and for each person on the client's side (each naming its
  person), and no tag for Aspire. Its actions and the tag picker don't render.
- The footer shows the client view's footnote.
- A Badge in its processing variant sits by the Switch: "Previewing as client. Read only."

The preview survives switching tabs and rounds. It is kept in memory only, never in page data or
browser storage, so a reload or the Switch turns it off. The Switch never renders
for the client.

### Header and tabs

The page is six tabs under one header. Each tab is its own screen with its own hash link, so the
attention lists, the inbox, a gate packet and the other tabs can open the page on the right tab
and item. Labels, eyebrows, titles and ledes are in **Page vocabulary**, **Tabs**.

1. **Header.** Brand theme per `theme.md`, **The CAS campaign page** (the band header with the logo
   when the theme says so). The animated Aspire Atlas mark sits at the top right of the header
   (`artifact-standard.md`). The header follows the open tab:
   - **Eyebrow**: "{Brand} · Round {n} · {tab eyebrow}", the round in view in the **Round
     switcher**. On Creator Selection with every round in view it reads "{Brand} · All rounds ·
     Casting".
   - **Title**: the tab's title.
   - **Lede**: the tab's one line lede.
   - **Meta line**: "{campaign name} · Creator ads · {n} creators, {v} ads each · runs {start}
     to {end} · updated {time}".
   - **Preview as client**, for the agency only: the Switch with its visible label, at the end of
     the meta line row (**Who sees what**, **Preview as client**). On phone it moves under the
     meta line.
   - **Reset decisions**, for the agency only: an outline Button beside the Switch that clears the
     round's client decisions for everyone, after a Dialog confirm (**1e**, **Reset decisions**).
     The client and read only viewers never see it.
   - **Inbox**, for everyone, at the end of the same row: on Home it opens the inbox for every tab,
     on any other tab the inbox for that tab, with its unread count (**Inbox**).
2. **Round switcher**, under the header on every tab (**Round switcher** below).
3. **Tabs**, in this order: Home, Master Brief, Creator Selection, Selected Creators, Content
   Review, Ad Performance. A count badge on each tab shows how many items there need the person
   viewing. Each tab carries its tooltip from **Tabs**.
4. **Hash links.** Each tab has one hash: `#home`, `#brief`, `#selection`, `#creators`,
   `#review`, `#performance`. A link to one item adds its round and the item after slashes:
   `#selection/r{n}/{net}-{handle}` and `#creators/r{n}/{net}-{handle}` open that creator's card,
   `#brief/r{n}/{lane}` opens that concept's brief, `#brief/r{n}/changes-{net}-{handle}` opens a
   creator's changed brief, `#review/r{n}/{cut}` opens that cut in the review panel, and
   `#home/{section}` opens a Home section: in the Simple view `stand`, `waiting`, `aspire`,
   `result`, `sync` and `updates`, in the Everything view `steps`, `attention`, `summaries`,
   `program`, `products`, `team`, `calendar` and `files` (**Home**). A tab's hash with only a
   round, `#brief/r{n}`, opens the tab on that round. `#selection/product-{id}` opens Creator
   Selection on **All rounds** with its Product filter set to that product. `#history` opens
   **History** and `#inbox` the **Inbox** over the tab open last. A link can go one step deeper into an item, to the part a note, comment or
   change is on:

   | Hash | Opens |
   | ---- | ----- |
   | `#home/steps/r{n}/{step}` | **Round steps** for round {n}, selected in the **Round switcher**, at that step, `{step}` being its id (`kickoff`, `gate-2`, `custom-{id}`) |
   | `#selection/r{n}/{net}-{handle}/match` | The creator's row or card with the score's reasons open (**Creator Selection**, **The match score**) |
   | `#selection/r{n}/{net}-{handle}/view`, `/view/{post}` | The creator viewer on that creator, at their first post or at one post (**Creator Selection**, **The creator viewer**) |
   | `#selection/r{n}/{net}-{handle}/notes`, `/notes/{note}` | The creator viewer at **Notes**, or at one note: the Notes thread, and for the agency the Aspire notes under the "Agency only" rule |
   | `#creators/r{n}/{net}-{handle}/shipping` | The creator's row in **Shipping** |
   | `#creators/r{n}/{net}-{handle}/cuts` | The creator's card, open at its cut tiles (**Selected Creators**, **Cut tiles**) |
   | `#creators/r{n}/{net}-{handle}/update` | The creator's card, open at **Updates to {brand}** (**Selected Creators**, **Status updates**) |
   | `#creators/r{n}/fees` | **Contract and rates**, with the fee approval and its notes |
   | `#brief/r{n}/{lane}/{part}` | The concept's brief at one part: `product`, `name`, `line`, `trigger`, `framework`, `personas`, `persona-{id}`, `casting`, `keyword-{n}`, `city-{id}`, `story`, `points`, `point-{id}`, `problem`, `agitate`, `solve`, `beat-{n}`, `hook-{n}`, `cta-{n}`, `body`, `length`, `runtime`, `broll`, `broll-{n}`, `variant-{n}` (the agency's variant plan) |
   | `#brief/r{n}/overview/{part}` | The round's **Brief status** or **Tone of voice and don'ts** at one part: `status`, `title`, `summary`, `voice`, `tone`, `do-{id}`, `dont-{id}`, `disclosure`, `fileNaming`, and `changes` for **Changes from round {n}**. A lane is never slugged `overview` (**1a**, **Rules**). |
   | `#brief/r{n}/comments` | The round's brief with **Comments** open (**Master Brief**, **Comments and sign off**) |
   | `#brief/r{n}/{lane}/c{comment}` | **Comments** open at that comment's thread, with the part it is on in view; `overview` in place of the lane for a comment on the header or the voice |
   | `#review/r{n}/{net}-{handle}` | Content Review on that creator's tab, no cut open. A cut's id always ends in `-r{round}-{variant}`, and a handle never holds a hyphen, so the two never collide |
   | `#review/r{n}/{cut}/v{version}` | The cut in the review panel at that version, not the newest |
   | `#review/r{n}/{cut}/v{version}/t{seconds}` | The same, with the player paused at that time, `{seconds}` whole or with up to three decimals (`t4.4`) (**Content Review**, **Sharing a cut**) |
   | `#review/r{n}/{cut}/v{version}/c{comment}` | The same, with that comment open, and the player at its timecode and its drawing shown when it has them |
   | `#review/r{n}/{cut}/v{version}/vs{other}` | The cut at that version, compared side by side with version {other} (**Content Review**, **Compare**). For the client, a version not sent to them opens without the compare |
   | `#performance/r{n}/{section}` | An **Ad Performance** section: `result`, `headline`, `weekly`, `variants`, `breakdowns`, `audience`, `next` (**Collapsing sections**) |

   A deeper part that is gone (a deleted hook, a version that no longer exists) opens the item
   above it. Opening a link
   selects the tab and the item's round, scrolls to the
   item and keeps the hash in the address bar. A link into a closed section opens the section
   first (**Collapsing sections**). A hash with no round opens the round the viewer
   picked last (**Round switcher**), else the current round. Switching tabs or rounds updates the
   hash. A link with no hash opens the tab the person had open last (kept in the browser, and
   ignored when that storage is missing), else Home. An item that is no longer on the tab opens
   the tab at the top.

### Round switcher

Which round a person is looking at is always on screen. Every tab but Creator Selection shows one
round at a time: its steps, creators, brief, cuts and results, and nothing from another round.

- **The control.** A segmented control under the header, built as a Tabs list with one trigger per
  round, oldest first. Each segment shows the label ("Round 2"), the month, the in-market dates
  ("Dec 1 to Dec 31") and the state as a Badge (**Status pills**). The selected segment is the
  round in view, and the eyebrow names it. A campaign with one round shows the control too, so
  the reader always knows which round they are in. On phone it is one row that scrolls sideways,
  like the tabs, with the selected round scrolled into view.
- **Which round opens.** A hash with a round wins. Otherwise the round the viewer picked last,
  kept for them in page data (`data/users/{id}/round`, **1e**), so it follows them to another
  device. Otherwise the current round (**Rounds**, **Which round**). A remembered round that
  no longer exists opens the current round. Picking a round saves it for the viewer, never for
  anyone else.
- **Home.** The switcher sets the round in **Where we stand**, **Round steps**, **Tab
  summaries** and, in **Calendar**, the summary line, the concept rows, the per concept bars and
  the delivery counts; Home's other sections cover every round or the whole campaign, and name the round
  on each item that has one.
- **Creator Selection.** The pool is shared by every round, so the first segment is **All
  rounds**, selected by default there, and each round segment filters the pool to the creators in
  that round. Picking a round here is not remembered.
- **Start round {n+1}.** For the agency only, an outline Button at the end of the control, shown
  once the newest round's briefs are approved and while no later round exists (**Rounds**,
  **Starting the next round**). It opens a Dialog: title "Start round {n+1}?", the new round's
  label, month, build window, in-market window and launch date filled in from the rules in
  **Rounds** and editable in place, a Select for the creators to carry ("Same creators, new
  briefs" first, "Same creators plus new ones"), the line "Round {n} stays as it is. Its
  creators, brief and cuts don't change.", and Cancel (outline) and Start round (default). On
  confirm the page writes `program/round-r{n+1}`, with a `step-{id}` for each of the later
  rounds' default steps (**Rounds**, **Round steps**), and one `edits/creator-{net}-{handle}-r{n+1}`
  per carried creator with `returning` true (**1e**), writes the new round's brief from the last
  signed off one (**Master Brief**, **Starting from the last round**), selects the new round, and
  shows it as Planned or In production at once. Nothing reaches Atlas until **Pulling decisions**. The
  Button never renders for the client or in **Preview as client**.
- **A done round is read only.** Its tabs show one line under the switcher, "Round {n} is done.
  It's read only.", and every control on them renders as a label: the brief and its sign off, the
  cuts and their calls, comments, decisions, shipping and the agency's edits. Nothing new can be
  added to it. **Reset decisions** does not render for it, nor on Creator Selection with **All
  rounds** selected.
- **Every date is real.** Round states, "now" on a step, due dates, days late, "No reply yet",
  relative times and the next weekly sync are worked out from the viewer's clock when the page
  renders and again every minute while it is open, never from the publish time or a date written
  into the page. The page holds dates, not their results.

Every tab renders for both sides. Content Review and Ad Performance are part of the page from the
first publish. Content Review shows its queue (**Content Review**), and while the round has no
creators on Selected Creators, its lede and one empty state: "Cuts show here once creators start
shooting." Ad Performance shows **Not live yet** until a round is in market, and "Connect your
Meta ad account to see results" while no ad account is linked (**Ad Performance**).

### Collapsing sections

Every section on every tab folds down to its header and a one line summary, and opens again when
the person needs the detail. That covers every Home card, the program details, each concept's
brief, the creator pool, the agency's panels, and the sections of Content Review and Ad
Performance. What is open is remembered for each person.

- **The header.** Each section is a Card whose header is a Collapsible trigger (**Component
  classes**, Collapsible): the section's title, its summary line under it, and a Lucide
  `chevron-down` at the end that turns up while the section is open. The whole title and summary
  area is the trigger, a `button` with `aria-expanded` and `aria-controls` naming the content,
  and its label for screen readers reads "Collapse {section}" or "Expand {section}". Anything
  else a header holds (a state pill, an Approve button, an edit pencil) sits beside the trigger,
  never inside it, and works the same whether the section is open or closed. Enter or Space on
  the trigger toggles it.
- **The summary line.** One line in `text-sm text-muted-foreground`, worked out live from the
  data the viewer can read, shown whether the section is open or closed, so a closed section
  still answers the glance question. It names counts, states and dates in plain words, short
  enough for one line on a desktop, and wraps with `break-words` on a phone rather than running
  past the header. It never holds an agency only value for the client: where the agency's
  summary has one (a budget, a fee), the client's summary leaves that part out. **Sections per
  tab** below gives each section's line. An empty section's summary is its empty state ("No
  files yet.").
- **Closed means hidden.** A closed section's content isn't rendered (`hidden`), so its controls
  leave the tab order and a screen reader skips them. Live data still arrives, so the summary
  line and the tab's count badge stay current, and opening the section shows the latest.
- **No nesting.** A section never holds another collapsible section, so every part of a tab is at
  most one open away. Inside a section, the parts that are already their own controls (a creator
  card's details, a comment thread, the review panel) keep working as they do.
- **Expand all and Collapse all.** At the top of every tab's content, at the end of a row above
  the first section, with only the tab's **Export** Button at its start (**Export**), and on Home
  the **Everything** Switch after it (**Home**): a ghost
  Button, size sm, "Expand all" with the Lucide
  `chevrons-up-down` icon, and a ghost Button, size sm, "Collapse all" with `chevrons-down-up`. Each
  opens or closes every section on the tab in view, and nothing on another tab; on Home, every
  section of the view on screen. Since ids never
  name the round, the change holds in every round of that tab. A Button that would change nothing
  is disabled. On a phone the row keeps all three Buttons on one line, Export at the start and the
  other two aligned to the end, with Home's Switch after Export. Under 400px, Expand all and Collapse all show their icons only,
  keeping their labels for screen readers and as a tooltip, so the row never runs past the
  screen.
- **Which sections start open.** The default follows the level of the jobs a section serves, the
  jobs listed in **Reaching every job**: Simple is one glance and one action, Standard the working
  view, Full every field and control. A section that serves a Simple job starts open. A section
  whose jobs are all Standard or Full starts closed, showing its summary, which is the glance
  those jobs start from. A job the header answers on its own (its summary, or a pill or button
  beside the trigger) doesn't make the section start open. One exception: a section holding an
  item in the viewer's **Waiting on you** starts open for that viewer while the item waits (the
  client's brief sign off, the client's fee approval while step 3 is open, a shipping row waiting
  on the client). Home's **Needs attention** is not one: it lists those items, and **Waiting on
  you** already shows them. **Sections per tab** gives each section's level and default.
- **Remembered per person.** Opening or closing a section, by its trigger, Expand all or Collapse
  all, saves it for the person viewing in their own page data (`data/users/{id}/collapse`,
  **1e**), so it follows them to another device. A saved state wins over the default. Expand all
  and Collapse all save every section on the tab in one write. Ids are stable and name the
  section (`home-steps`, `brief-{lane}`, `selection-summary`), never the round, so a section closed
  in round 1 opens closed in round 2. Nothing about collapsing is ever logged or reaches Atlas,
  and it never touches anyone else's view.
- **Links open what they point at.** Opening a hash that lands in a closed section (from the
  inbox, History, **Waiting on you**, **Needs attention**, a tab summary or a gate packet) opens
  that section first and saves it open for the viewer, then scrolls to the item (**Header and
  tabs**). A Home section's own hash (`#home/calendar`) does the same.
- **Who can save it.** The client and the agency. A read only client reads no page data, and
  **Preview as client** never writes it, so for both the sections start from the client's
  defaults and opening or closing them lasts only while the page is open, kept in memory.
- **It works everywhere.** The triggers, Expand all and Collapse all change only the view, never
  a value, so they work for everyone: in a done round, for a read only client and in **Preview as
  client**, where every other control renders as a label.
- **Waiting for data.** While the page data loads, every section shows its default state with a
  Skeleton in place of its summary line, then takes the saved state without a jump in the
  person's scroll position.

#### Sections per tab

Ids are what `data/users/{id}/collapse` keys on. A Home or Ad Performance section's own hash is
the part of its id after the tab (`#home/steps`, `#performance/r{n}/weekly`); every other section
is reached by the item hashes in **Header and tabs** (`#creators/r{n}/fees` opens
**Contract and rates**). Sections a tab's own build has not added yet still
take these ids, summaries and defaults when it adds them. A section that renders for the agency
only is marked so.

| Tab | Section | Id | Summary line | Level | Starts |
| --- | ------- | -- | ------------ | ----- | ------ |
| Home, Simple | Where we stand | `home-stand` | The hero sentence: "Round {n} is in production. Ads go live {launch}." (**Home**) | Simple | Open |
| Home, Simple | Waiting on you | `home-waiting` | "{n} waiting on you", or "Nothing needs you right now." | Simple | Open |
| Home, Simple | Aspire is on it | `home-aspire` | "{c} cuts in changes or QA · {p} packages on the way · {f} creators filming", leaving out a part at none, or "Nothing in production right now." | Simple | Open |
| Home, Simple | Last round result | `home-result` | "Round {n}: cost per sale {x} against a {t} target · {w} of {a} ads won"; the section isn't rendered until a round has ad results | Simple | Open |
| Home, Simple | Next check in | `home-sync` | "{Day} {time} your time", or "No weekly sync set yet." | Simple | Open |
| Home, Simple | Latest updates | `home-updates` | "{n} unread", or "You're all caught up." | Simple | Open |
| Home, Everything | Round steps | `home-steps` | "Round {n} · {step} now, due {date} · up next: {next} · ads live {launch}", leaving out a part with no value, with "{step} is {d} days late" when it is, or "Round {n} · every step done" | Standard | Open, as the view's first section; a saved state wins |
| Home, Everything | Needs attention | `home-attention` | "{n} items across every tab and round · {w} waiting on you", or "Nothing needs attention right now." | Standard | Closed, even while items wait on the viewer, because **Waiting on you** shows them |
| Home, Everything | Tab summaries | `home-summaries` | One headline per tab for the round in view, joined: "{a} of {m} creators approved · {c} under contract · {w} cuts waiting" | Standard | Closed |
| Home, Everything | Program terms | `home-program` | "Runs {start} to {end} · {deliverables} per creator · usage {d} days", leaving out a part not saved | Standard | Closed |
| Home, Everything | Products in scope | `home-products` | "{p} products · {a} active", or for the agency "No products added yet." | Standard | Closed |
| Home, Everything | Team | `home-team` | "{n} people at Aspire", or for the agency "No team added yet." | Standard | Closed |
| Home, Everything | Calendar | `home-calendar` | For the round in view, parts joined with " · ": "Round {n} {verdict, lower case}" ("Round 2 running behind"), or where **Where we stand** shows no verdict the round's state in its place ("Round 1 in market to Dec 31", "Round 1 done", "Round 3 starts building Jan 4", "Round 2 in production"), then "next: {milestone} {date}" "next" naming the round's next dated milestone or "every milestone passed", and "{Step} is {d} days late" when its current step is late, the step named as **Round steps** names it ("Round 2 running behind · next: Ads live Dec 1 · Briefs approved is 2 days late") | Standard | Closed |
| Home, Everything | Files | `home-files` | "{n} files · still needed: {categories}", or "{n} files · every required file is here", or "No files yet." | Standard | Closed |
| Master Brief | Brief status, "Round {n} brief" | `brief-status` | "{w} of {t} concepts written · {k} open comments · version {v}", with the status Badge beside the trigger, or "No concepts in this round yet." | Simple | Open |
| Master Brief | Tone of voice and don'ts | `brief-voice` | The tone of voice's first line, then "· {d} don'ts", or "No tone of voice set yet." | Standard | Closed |
| Master Brief | One per concept, "{Concept} brief · round {n}" | `brief-{lane}` | "{product} · {trigger} · {personas} · {h} hooks, {c} CTAs · {k} creators", with "needs work" while the concept isn't written, and the status Badge beside the trigger | Full | Closed |
| Master Brief | Needs a concept | `brief-needs` | "{p} products with no concept: {names}", then "· {d} deferred to round {n+1}", then "· {r} removed" for the agency | Standard | Closed; not rendered while every product has a concept, nothing is deferred and, for the agency, nothing was removed |
| Master Brief | Frameworks, agency only | `brief-frameworks` | "V1 {code} · V2 {code} · …", with "edited" when they differ from the defaults | Full | Closed |
| Master Brief | One per changed brief, "@{handle} changed the {concept} brief" | `brief-changes-{net}-{handle}` | "{n} changes against the brief you approved" | Simple | Open |
| Master Brief | Accepted as is | `brief-accepted` | "{n} creators accepted without changes" | Standard | Closed |
| Creator Selection | Summary | `selection-summary` (a state saved under `selection-budget` reads as it) | Agency: "{left} left of {total} · {d} of {m} decided · {u} unpriced", with "over budget by {x}" in place of what's left when it is; client: "{d} of {m} decided · {p} Priority Yes, {y} Yes, {b} Maybe, {o} No" | Simple | Open |
| Creator Selection | The pool, on Table or Cards | `selection-pool` | The count line: "{n} of {m} creators in the pool · Round 1: {a} approved" | Simple | Open |
| Creator Selection | Match score tuning, agency only | `selection-tuning` | "{k} of our top 10 picked · {verdict}, {x}% agreement · weights {default, or tuned {date}}", or "Too few decisions to judge yet · weights {default, or tuned {date}}" | Full | Closed |
| Selected Creators | The roster, one card per creator | `creators-roster` | "{n} creators · {k} missing details · {s} shipping confirmed · {v} of {V} variants in, {a} approved", plus "fees {agreed} of {budget}" for the agency | Simple | Open |
| Selected Creators | Contract and rates | `creators-contract` | Client: "Fees waiting for your approval", "Fees approved {date}", "Fees changed since you approved", or "Fees show here once they are sent"; agency: "{a} of {n} agreed · {total} committed", with "fees with {brand}" or "fees approved {date}" | Full | Closed; open for the client while step 3 waits on them |
| Selected Creators | Shipping | `creators-shipping` | "{s} shipped, {d} delivered of {n}", or "Shown once fees are approved." | Standard | Closed; open for the client while a row waits on them |
| Selected Creators | Brief and content | `creators-content` | "{b} briefs accepted · footage in from {f} of {n}" | Standard | Closed |
| Content Review | The queue: count tiles, filter, creator tabs and variant rows | `review-queue` | Client: "{w} waiting on you · {c} with changes · {q} in Aspire QA · {a} of {y} approved"; agency: "{w} with {brand} · {c} with changes · {q} in Aspire QA · {a} of {y} approved"; "No cuts in round {n} yet." before the first | Simple | Open |
| Ad Performance | Cost per sale against target | `performance-result` | "Cost per sale {x} against a {t} target · {d}% under target, or {d}% over target", or "Round {n} goes live {date}", or "Connect your Meta ad account to see results" | Simple | Open |
| Ad Performance | Headline numbers | `performance-headline` | "Spend {s} · {p} purchases · ROAS {r}" | Standard | Closed |
| Ad Performance | Weekly spend and return | `performance-weekly` | "{w} weeks in market · best week {date}" | Standard | Closed |
| Ad Performance | Variants ranked | `performance-variants` | "{w} winning · {t} testing · {r} to retire or refresh" | Standard | Closed |
| Ad Performance | Compare by framework, hook, CTA (those three for the agency only), concept, persona, product, creator and tier | `performance-breakdowns` | "Best {dimension}: {value} at {x} per sale", or "Too early to call a winner"; for the client never framework, hook or CTA | Full | Closed |
| Ad Performance | Who watched | `performance-audience` | "Top audience: {segment}" | Full | Closed; not rendered until `search_ads` has an audience breakdown (**Ad Performance**, **Who watched**) |
| Ad Performance | Changes for round {t} | `performance-next` | Agency: "{a} of {p} lines accepted for round {t} · {k} applied", or "Too early to propose changes"; client: "{c} changes for round {t}", or "Nothing here yet." | Standard | Closed |

The review panel, the inbox, History and the brief's **Comments** are Sheets, and the creator
viewer is a full screen view (**Creator Selection**, **The creator viewer**); none is a section: they open
over the tab and never collapse.

#### Reaching every job

Every job in the tables below is two clicks or fewer from **Home Simple**: Home as it
first opens, on its Simple view, for someone who has saved no collapse state, with the defaults
above. A click is
anything that changes what is on screen: a tab, a round segment, a section's trigger, a row or
link that opens an item, a Sheet or a Dialog. Typing, hovering, scrolling and the job's own action
(the Approve, the save) are not counted. A job is reached when the view or control it needs is on
screen. Where a job's control is added by its tab's own build, it goes in the section named here,
so the count holds. A new section, tab or control keeps every row of this table at two or fewer;
a change that breaks one updates the table or moves the control.

Across every page:

| Job | Path | Clicks |
| --- | ---- | ------ |
| See every update in one inbox and open the exact item | **Inbox**, then the row | 2 |
| See the full history, filter it by tab and search it | **Inbox**, then **History** | 2 |
| Switch rounds and know which round is in view | A **Round switcher** segment; the eyebrow names it | 1 |
| Edit any text in place, saved for everyone with who made it | Home, **Everything**; the text in **Round steps**, which is open; for the terms, products or team, open **Program terms**, **Products in scope** or **Team** | 1 to 2 |
| Tag the client or Aspire so it lands in their inbox | Creator Selection; a note box on a card, typing "@" | 1 |
| Leave agency only comments the client can't see | Master Brief, then a concept's section; "Agency only" on its comment box | 2 |
| Preview what the client sees | **Preview as client** in the header | 1 |
| Collapse any section and expand it again | The section's trigger, or **Expand all** or **Collapse all** | 1 |
| Export what is in view to a spreadsheet | The tab, then **Export** above its first section | 2 |

Home:

| Job | Path | Clicks |
| --- | ---- | ------ |
| Know in one sentence where the program stands and when ads go live | **Where we stand**, the hero sentence | 0 |
| Know if we're ahead, on track or behind, and why | **Where we stand**, the pace verdict and its why line | 0 |
| See what's waiting on the client and send them to it | **Waiting on you**, then "open" on the item | 0 to 1 |
| See what Aspire is working on | **Aspire is on it** | 0 |
| See last round's headline result against target | **Last round result**, once a round has ad results | 0 |
| Find the next weekly sync, add it to a calendar, open the channel | **Next check in** | 0 |
| See the latest unread updates | **Latest updates** | 0 |
| See where the round is in its steps, what's current and what's next | **Everything**; **Round steps** is open | 1 |
| Move the round to its next step and edit step dates (agency) | **Everything**; **Round steps** is open | 1 |
| See the deliverables, usage and exclusivity terms, and which file each came from | **Everything**, then **Program terms** | 2 |
| Keep the program files in one place by round and see what's missing | **Everything**, then **Files** | 2 |
| Drop in a file and have program details pulled from it | **Everything**, then **Files** | 2 |
| See the products in scope with photo, status and creator count | **Everything**, then **Products in scope** | 2 |
| Check pacing on the calendar: build windows, in-market months, milestones and today | **Everything**, then **Calendar**; the compact strip | 2 |
| Hover a day to see delivered against planned, what's due today or what's scheduled | **Everything**, then **Calendar**, then hover; on a phone a tap on the day is the job's own action, as hovering is | 2 |
| See everything that needs attention across tabs, tagged by round | **Everything**, then **Needs attention** | 2 |
| See a summary card per tab for the round in view | **Everything**, then **Tab summaries** | 2 |
| Show the client the Aspire team, their role and email, and what to go to each for | **Everything**, then **Team** | 2 |

Master Brief:

| Job | Path | Clicks |
| --- | ---- | ------ |
| See the round's brief status and how complete it is | Master Brief; **Brief status**, its Badge and meter | 1 |
| Import the master brief from a Google Doc | Master Brief, then **Import** in **Brief status** (agency) | 2 |
| Start a new round's brief from the last one | **Start round** in the **Round switcher**, or Master Brief, then **Start from round {m}** in **Brief status** (agency) | 1 to 2 |
| Defer a concept to the next round, and see what was deferred | Master Brief, then the concept (agency); **Needs a concept** lists them | 2 |
| Scan every concept as a summary | Master Brief; the overview in **Brief status**, and the closed concept sections | 1 |
| Write or edit a concept | Master Brief, then the concept | 2 |
| Write the hero beats, hooks, CTAs, body and B-roll | Master Brief, then the concept | 2 |
| Format long text | Master Brief, then the concept | 2 |
| Build the variant plan | Master Brief, then the concept (agency) | 2 |
| Add or remove a concept, and see products with no concept | Master Brief, then **Add a concept** in **Brief status** (agency), or **Needs a concept**; removing is in the concept | 2 |
| Set tone of voice and the don'ts | Master Brief, then **Tone of voice and don'ts** | 2 |
| Comment on any part and reply with the client | Master Brief, then **Comments** in **Brief status**, or the concept and the part's comment Button | 2 |
| Send the brief for sign off and record it | Master Brief; **Send for sign off** (agency), or **Sign off** and **Request changes** (client), in **Brief status**, which is open; for the client also **Waiting on you**, "open" | 1 to 2 |
| Reopen a signed off brief with a reason (agency) | Master Brief; **Reopen** in **Brief status** | 1 |
| Copy the creator-facing brief for one concept | Master Brief, then the concept; **Copy creator brief** | 2 |
| Undo all edits back to the original, and bring a version back | Master Brief, then **Reset to original** or **Versions** in **Brief status** (agency) | 2 |
| Edit the frameworks the variants use | Master Brief, then **Frameworks** (agency) | 2 |

Creator Selection:

| Job | Path | Clicks |
| --- | ---- | ------ |
| See budget committed and left, and how many are decided | Creator Selection; **Summary** | 1 |
| Go through creators one at a time and decide | Creator Selection, then **Start review**, deciding in the creator viewer with Auto advance; or the decision Buttons on each row or card, then **Next unreviewed** | 1 to 2 |
| Filter by product, decision, city and tier, search and sort | Creator Selection; the toolbar, or a column header on Table | 1 |
| Switch between Table and Cards | Creator Selection; **View** | 1 |
| See each match score and why | Creator Selection, then the score's ring on a row or card (**The match score**) | 2 |
| See competitor conflicts before deciding | Creator Selection; the band and competitor lines on each row or card | 1 |
| Watch a creator's latest posts | Creator Selection, then a thumbnail or **Start review** (the creator viewer) | 2 |
| See the concept and persona each creator maps to | Creator Selection; the Concept column or the card's chips | 1 |
| Change a creator's concept or persona | Creator Selection; the Concept and Persona Selects, agency only | 1 |
| Read and leave notes, and tag the other side | Creator Selection, then the notes on a row or card, which open the creator viewer's **Notes** | 2 |
| See which rounds a creator is already in | Creator Selection; the round chips | 1 |
| Open a creator's full profile | Creator Selection, then the handle on a row or card (the creator viewer's **Profile**) | 2 |
| Copy all decisions | Creator Selection; **Copy decisions** | 1 |
| Give a one tap reason on a surprise | Creator Selection, then the decision | 2 |
| Check the match score against the client's picks | Creator Selection, then **Match score tuning** | 2 |
| See surprises and patterns in what the client values | Creator Selection, then **Match score tuning** | 2 |
| Check whether last round's higher scores sold cheaper | Creator Selection, then **Match score tuning** | 2 |
| Retune or reset the match score | Creator Selection, then **Match score tuning** | 2 |

Selected Creators:

| Job | Path | Clicks |
| --- | ---- | ------ |
| See every contracted creator's step and what's next | Selected Creators; the roster | 1 |
| See who is missing details | Selected Creators; the roster summary and cards | 1 |
| Track the round's totals | Selected Creators; the roster summary | 1 |
| Filter by stage or product, and search | Selected Creators; the filters | 1 |
| Open or close every creator card | Selected Creators; **Expand all cards** or **Collapse all cards** | 1 |
| Approve the round's fees (client) | Selected Creators; **Contract and rates** is open for the client while step 3 waits on them; or **Waiting on you**, "open" | 1 |
| Record contract date, rates, total and payment | Selected Creators, then **Contract and rates** | 2 |
| Record contact details and address once | Selected Creators; the card's agency only block (agency), reused every round | 1 |
| Track product shipping | Selected Creators, then **Shipping** | 2 |
| Mark a package shipped or delivered | Selected Creators, then **Shipping**, or the open card | 2 |
| Track raw footage and the shoot by date | Selected Creators, then **Brief and content** | 2 |
| Edit a creator's concept, persona, hook and variant plan | Selected Creators; the card | 1 |
| Play the latest cut of every variant and jump into review | Selected Creators, then the card's **Details**; its cut tiles and **Open in review** | 2 |
| See where each value came from | Selected Creators; the source tag beside each value, hover for the time | 1 |
| Send the client a status update on a creator | Selected Creators, then **Update {brand}** on the card (agency) | 2 |
| Export a creator snapshot, shipping list, rates or tracker | Selected Creators, then **Export** | 2 |

Content Review:

| Job | Path | Clicks |
| --- | ---- | ------ |
| See how many cuts wait on the client, have changes, are in QA or approved | Content Review; the queue summary | 1 |
| Pick a creator and see their variants | Content Review, then the creator's tab | 2 |
| Add a creator's first cut of a variant | Content Review, then the creator's tab, then **Add cut** on the empty slot (agency) | 2 |
| Filter the queue by status | Content Review; the queue's filter | 1 |
| Play a cut frame by frame, change speed, loop, show safe zones | Content Review, then the cut | 2 |
| Comment at a timecode, draw, reply, resolve | Content Review, then the cut | 2 |
| Mark a comment agency only | Content Review, then the cut (agency) | 2 |
| Check a cut against the brief | Content Review, then the cut | 2 |
| Compare a version with the one before | Content Review, then the cut | 2 |
| Upload a new version | Content Review, then the cut (agency) | 2 |
| Move a cut through QA, client review, changes and approved | Content Review, then the cut | 2 |
| Copy a link to a cut or all its comments | Content Review, then the cut | 2 |
| Look back at last round's signed off cuts | Content Review, then last round's segment in the **Round switcher**; the queue is open, read only | 2 |

Ad Performance:

| Job | Path | Clicks |
| --- | ---- | ------ |
| See cost per sale against target | Ad Performance; **Cost per sale against target** | 1 |
| See the headline numbers | Ad Performance, then **Headline numbers** | 2 |
| See weekly spend and return | Ad Performance, then **Weekly spend and return** | 2 |
| See every variant ranked with its status | Ad Performance, then **Variants ranked** | 2 |
| Flag variants to retire or refresh | Ad Performance, then **Variants ranked** | 2 |
| Compare by framework, hook, CTA (agency only), concept, persona and product | Ad Performance, then **Compare** | 2 |
| Compare by creator and tier | Ad Performance, then **Compare** | 2 |
| See who watched | Ad Performance, then **Who watched**, once `search_ads` has an audience breakdown; hidden until then | 2 |
| Write what changes in next round's brief: edit, accept or drop each line, then apply them | Ad Performance, then **Changes for round {t}** | 2 |
| See that a round isn't live yet and when it launches | Ad Performance; **Cost per sale against target** shows the launch | 1 |

The client's side:

| Job | Path | Clicks |
| --- | ---- | ------ |
| See where things stand, what's waiting on them and what Aspire is doing; reach the sync and the channel | Home; **Where we stand**, **Waiting on you**, **Aspire is on it** and **Next check in** are open | 0 |
| See who's on the Aspire team | **Everything**, then **Team** | 2 |
| Read the brief, comment, sign it off | **Waiting on you**, "open"; or Master Brief, then the concept | 1 to 2 |
| Approve or pass on creators, leave notes, give a reason | Creator Selection; the decision Buttons, and the reason after them | 1 to 2 |
| See who's under contract and where each creator is | Selected Creators | 1 |
| Watch the latest cut of each of a creator's variants, and read Aspire's updates on them | Selected Creators, then the card's **Details** | 2 |
| Watch cuts, comment on the frame, request changes or approve | Content Review, then the cut | 2 |
| See results against target and what changes next round | Ad Performance, then **Changes for round {t}** | 1 to 2 |

### Home

Everything in the campaign in one place, for every round. Home has two views. **Simple** is one
glance and one action for both sides: where the program stands, what waits on you, what Aspire
is doing, last round's result, the next check in and what changed. **Everything** is the working
view. Home opens on Simple every time.

**The switch.** A Switch with the visible label "Everything", in the row above Home's first
section, between **Export** and **Expand all** (**Collapsing sections**). Off shows Simple, on
shows Everything. It is kept in memory only, never in page data or browser storage, so a reload
opens Simple again. A hash to a section of the other view (`#home/steps` from the inbox or a gate
packet) turns the Switch to that view first, then opens the section. Turning it off sets the
hash to `#home`, so a reload never lands back
in Everything. It changes only the view,
so it works for everyone: in a done round, for a read only client and in **Preview as client**.
**Export** gives Home's sheets in either view (**Export**, **What goes in**).

**Every number and date is from the records.** Each figure below is worked out on the page from
the round records, the roster, the campaign record, the cadence and routing records, the page
data and the viewer's clock (**Round switcher**, **Every date is real**). Nothing is written into
the page as a result. A figure whose record doesn't exist yet hides its part, as each part says,
and never shows a placeholder, a zero standing in for "unknown", or an example value.

**A read only client** reads no page data (**Who sees what**), only the page itself. The page
itself carries what the records said at the last publish: the rounds, the roster and its shipping
and brief states, the client's open items, the sync slot and the Slack channel. So for a read only
client, **Where we stand**, **Waiting on you**, **Aspire is on it** and **Next check in** are built
from those published values, and each shows one line under its title: "As of {publish time}."
Cuts live only in page data, so the pace verdict and the cut rows don't render for them, and no
section ever reads "Nothing" or "No weekly sync set yet." only because page data can't be read.

#### The Simple view

Sections, in order:

1. **Where we stand** (`home-stand`). The round in view in the **Round switcher**, the current
   round unless the viewer picked another. Its summary line, with the summary classes from
   **Component classes**, is the hero sentence, so it reads the same closed or open. The hero
   sentence, by the round's state (**Rounds**):

   | State | Hero sentence |
   | ----- | ------------- |
   | Planned | "Round {n} is planned. Ads go live {launch}." |
   | In production | "Round {n} is in production. Ads go live {launch}." |
   | In production, launch at risk (step 4 planned or due after the launch date, or not cleared by it, **Rounds**) | Before the launch date, "Round {n} is in production. Ads go live {launch}."; from it, "Round {n} is in production. Ads were due to go live {launch}." Either way with a warning Badge "Launch at risk" |
   | In market | "Round {n} is in market. Ads went live {launch} and run to {end}." |
   | Done | "Round {n} is done. Its ads ran {launch} to {end}." |

   `{launch}` and `{end}` are the round's launch date and the end of its in-market window, from
   the newest of the round finding and `program/round-r{n}`, as "Dec 1" (with the year when it
   isn't this year). When another live round exists, one line under it names it: "Round {m} is
   {state}. Ads go live {launch}.", with a link Button "View round {m}" that selects it in the
   **Round switcher**.

   Then the **pace verdict**, while the round is in production (launch at risk included):
   - **The plan.** {y} ad videos: the creators on the round's roster (approved for it in
     Creator Selection, or carried into it) whose fee isn't declined, times the package's
     variants from `campaign:{slug}-cas`, at most 5 (**Rounds**, **Variants per round**). A
     creator who declines leaves the plan at once. They are spread evenly across the build
     window, so {z}, the number needed by today, is {y} times the whole days of the build window
     already passed, today not counted, over its length in days, rounded down to a whole video.
     The build window runs from its start to the day before launch, both counted, so a round
     created 10 days before launch has a 10 day window. On its first day {z} is 0, and after its
     last day {z} is {y}. A window of no days (a round created on its launch day) has {z} equal
     to {y}.
   - **What's in.** {x} is the round's cuts with at least one version (`reviews/cut-{cut}` with a
     version under `versions`, for the round's creators).
   - **The verdict**, a Badge in its **Status pills** variant: **Ahead** when {x} is above {z} by
     at least 10% of {z} and at least one video, **Running behind** when it is below {z} by at
     least 10% of {z} and at least one video, and **On track** otherwise, and always while {z}
     is 0. No record holds a filming lead time, so the spread starts on the build window's first
     day, as the round's own dates set it.
   - **The why line**, in `text-sm text-muted-foreground`: "{x} of {y} ad videos are in. We need
     {z} by today." Once every video is in: "All {y} ad videos are in." A Progress bar under it
     shows {x} of {y}, labelled for screen readers "{x} of {y} ad videos in".
   - **A late step.** When the round's current step is late (**Rounds**, **Round steps**), a
     second line names it: "{Step} is {d} days late." with the step's name as **Round steps**
     shows it ("Briefs approved is 2 days late.", "Kickoff call is 1 day late."), from the same
     dates.
   - **Hidden parts.** With no creators on the round yet, the verdict, why line and bar don't
     render, and one line reads "Pace starts once creators are approved for round {n}." The late
     step line still shows.

   Planned shows "Building starts {build start}." in place of the verdict. In market and Done
   show "{x} of {y} ad videos made this round." with no verdict.
   For a read only client, who can't read cuts, the pace area renders nothing in any state: no
   verdict, why line, bar or count. The late step line still shows.
   A link Button "Round steps" opens `#home/steps`.
2. **Waiting on you** (`home-waiting`). Worked out for the person viewing, across every live
   round, each item naming its round. Each item: a title, one line of detail, when it has waited
   since, an "open" link straight to the item by hash, and a checkbox to mark it done. Done items
   fade and drop out of the count; "Show done" brings them back. Done marks are kept per person
   (`data/users/{id}/done`, **1e**). The list is sorted by how long each item has waited, oldest
   first; items that waited the same time keep the order of the tables below. It shows the first
   five, with a ghost Button "Show all {n}" that lists the rest in place. Empty: "Nothing needs
   you right now."
   - **Client**:

     | Item | Title and detail | Opens |
     | ---- | ---------------- | ----- |
     | A cut waiting on the client | "Review @{handle}'s V{variant}"; "{concept} · version {v}" | `#review/r{n}/{cut}/v{version}` |
     | The round's brief waiting for sign off | "Sign off the round {n} brief"; "{t} concepts · {c} open comments" | `#brief/r{n}/overview/status` |
     | A creator's changed brief | "Your call on @{handle}'s changes"; "{k} changes to the {concept} brief" | `#brief/r{n}/changes-{net}-{handle}` |
     | Creators left to decide | "Decide on {k} creators"; the first three handles, then "and {m} more" | The first one's card, `#selection/r{n}/{net}-{handle}` |
     | A question back to the client | "Your call on @{handle}" or "Your Maybe on @{handle}"; the question | `#selection/r{n}/{net}-{handle}/notes` |
     | Fees waiting for approval | "Approve the fees for round {n}"; "{a} creators · sent {date}" | `#creators/r{n}/fees` |
     | Shipping rows to fill | "Add shipping for {k} creators"; the first three handles | The first one's row, `#creators/r{n}/{net}-{handle}/shipping` |

     Open comments are threads on that brief not marked resolved. A shipping row to fill is one
     whose creator's details are received, once fees are approved, with shipping or tracking
     still empty and product status not shipped. A grouped item ("Decide on {k} creators", "Add
     shipping for {k} creators") has waited since its oldest member did, and its id names the
     round and the count (`decide-r{n}-{k}`, `shipping-r{n}-{k}`), so a done mark lasts until the
     count changes and the item comes back with a new id.
   - **Agency**: what the agency owes, from `agency/attention`: "Record @{handle}'s reply",
     "Send {k} drafts" (the first three handles), "No reply yet: @{handle}" (past their
     reply window), approvals due within a day, a brief sign off on the page not recorded yet
     ("Record {brand}'s brief sign off", built from the `signoff-unrecorded` template while a sign
     off counts and step 4 isn't cleared), anything marked your call
     needed, concepts below their pool target and details emails not sent, in that order for ties.
     These items never
     render for the client, and **Preview as client** shows the client's list.
3. **Aspire is on it** (`home-aspire`). What Aspire is working on, the same for both sides, across
   every live round. One row per kind, hidden at none, each with its count, the first three
   handles ("@a, @b and 2 more"), and an "open" link to the first item:

   | Row | Counts | Opens |
   | --- | ------ | ----- |
   | "{k} cuts getting changes" | Cuts whose newest version has changes requested | The first cut, `#review/r{n}/{cut}` |
   | "{k} cuts in Aspire QA" | Cuts whose newest version is in Aspire QA | The first cut; for the client, that cut's creator on Content Review, `#review/r{n}/{net}-{handle}`, since a cut with no version sent doesn't open for them |
   | "{k} packages on the way" | Shipping rows with product status shipped, not yet delivered | The first row, `#creators/r{n}/{net}-{handle}/shipping` |
   | "{k} creators filming" | Creators at step 4 or 5 on Selected Creators, Shooting or Footage in and editing, so they have no cut in the round yet (**Selected Creators**, **Steps**) | The first card, `#creators/r{n}/{net}-{handle}` |

   Every row is built from what the client can read, so it holds nothing agency only. A cut's
   newest version decides its row (**Content Review**, **Statuses**). The filming row counts only
   rounds in production. Empty: "Nothing in production right now."
4. **Last round result** (`home-result`). Last round's headline result: cost per sale against
   the client's target and "{w} of {a} ads won", where "last round" is the newest round with ad
   results. The cost per sale is in `text-lg font-semibold`, then "against a {t} target" and a
   Badge, the one **Cost per sale against target** shows: success "{d}% under target" at or
   under it, warning "{d}% over target" above it. An ad that "won" is one Ad Performance marks
   Winning or Fatigued, at or under the target, and {a} counts every variant in the results
   currency past the spend floor (**Ad Performance**, **Status**). A link Button "See the results" opens
   `#performance/r{n}/result`. Money is in that round's results currency (**Ad Performance**,
   **Reading the results**).

   **This section doesn't render until a round has ad results**: a matched ad with spend in the
   page's results for the round. Until then there is no empty state and no summary, and with no
   Meta ad account linked it never renders. The target is `costPerSaleTarget` in
   `campaign:{slug}-decision-defaults`. With results but no target, the section shows the cost
   per sale and "{w} of {a} ads won" only, with no target line and no Badge.
5. **Next check in** (`home-sync`). The next weekly sync, the calendar link and the Slack channel.
   - **When.** From `campaign:{slug}-cadence` (C6): the day, time and IANA time zone, and the
     length when saved. The page works out the next sync from the viewer's clock in the saved
     time zone, then shows it in the viewer's: "Tuesday, Nov 4 · 10:00 AM your time", and when
     the viewer's zone differs, "(1:00 PM in New York)", the city from the saved zone. Under it,
     "Every Tuesday". During a sync of saved length it reads "Now" until the sync ends. The
     summary line: "{Day} {time} your time".
   - **Add to calendar.** An outline Button with the Lucide `calendar-plus` icon, "Add to Google
     Calendar", a link that opens Google Calendar's new event page in a new tab
     (`https://calendar.google.com/calendar/render?action=TEMPLATE` with `text` "{Brand} weekly
     sync: {campaign name}", `dates` the next sync's start and end in UTC, `ctz` the saved time
     zone, `recur` `RRULE:FREQ=WEEKLY;BYDAY={code}` with the saved day as its two letter code (`MO`,
     `TU`, `WE`, `TH`, `FR`, `SA`, `SU`), and `details` the page link). With no length
     saved, the end is the start. **No .ics download.** The `downloads` capability saves only
     the types on its list, and `.ics` isn't on it (a save is refused `rejected_extension`), so
     the page doesn't offer one.
   - **Open Slack channel.** From `campaign:{slug}-routing` (C5): `slack:` is the channel's
     name, which posting uses, and `channelLink:` its link, when saved. An outline Button "Open
     Slack channel", opening the channel in a new tab, only when `channelLink:` is a link to a
     Slack channel (`https://{workspace}.slack.com/archives/{channel}` or
     `https://app.slack.com/client/{workspace}/{channel}`). With the name only, the page shows
     "#{name} on Slack" as text with no Button, and for the agency only, the line "Add the
     channel's link in the chat to open it from here." With no Slack channel saved, nothing
     about Slack renders.
   - **Hidden parts.** With no cadence saved, the section reads "No weekly sync set yet.", and
     for the agency, "Set it in the chat." No calendar Button renders. A part that isn't set
     never shows a placeholder: no example channel, no default time.
   - The weekly agenda (where we are, what is blocking, what is next) is this view: **Where we
     stand**, **Waiting on you** and **Aspire is on it**. The weekly sync task posts the same.
6. **Latest updates** (`home-updates`). The three newest unread items in the viewer's Home inbox
   (every tab), not cleared, as **Inbox** rows: the same markup, and opening one marks it read
   and opens its item. Under them, a ghost Button "Open inbox", with the unread count, opens the
   **Inbox** Sheet. The section moves live as the inbox does. Empty: "You're all caught up." A
   read only client reads no page data, so it shows "Updates aren't available from this
   account." **Preview as client** shows the client's three, every item unread.

#### The Everything view

The working view, for both sides. Its sections, in order, are below, each with its own hash
(`#home/steps`). Everything here is worked out from the records, the page data and the viewer's
clock, like the Simple view. A part whose value isn't in any record yet is hidden for the client,
and for the agency shows "Not set" with the control that sets it, never an example value. A read
only client gets each section from the values published into the page, with "As of {publish
time}." under the title of **Round steps**, **Needs attention** and **Tab summaries**, and no cut
rows.

1. **Round steps** (`home-steps`). Every step of the round in view in the **Round switcher**, in
   `order`, from the round's `plan` and its four approvals (**Rounds**, **Round steps**). No part
   of the page uses the word gate.
   - **The list.** An ordered list, one row per step, anchored `#home/steps/r{n}/{step}`. At the
     start
     of the row, a done step shows the Lucide `circle-check` icon, labelled "Done" for screen
     readers, and any other step its position in a `flex size-6 shrink-0 items-center
     justify-center rounded-full border text-xs` circle. Then the name in `text-sm font-medium`
     with `break-words`, and for an approval its detail line where it has one ("Master brief sign
     off"). Under it, in `text-xs text-muted-foreground`: the owner, then the date: "Due {date}",
     "Done {date}" for a ticked step, "Done" with no date for a step counted done by a later one,
     and for an approval that is out "With {approver} since {sent}, due {due}", or "Approved
     {date}" once cleared. Step 4 reads "Approved {date}" as soon as the page counts a sign off from
     a confirmed approver account, with "Signed off by {name}" in its detail line (one from an
     account not yet confirmed reads "Signed off, Aspire to confirm" and stays open), and for the agency the soft Badge from the
     `signoff-unrecorded` template in `agency/attention` ("Not recorded yet") until the pull
     records it; a brief sent on the page and not yet recorded reads "With
     {approver} since {sent}". A step with no date shows no date to the client, and "Not set" with
     its date Input to the agency.
   - **Owner** reads "{brand}" for `client`, "Aspire", "Creators", or the team member's name;
     for an approval, its approver's name. A team member removed since reads "Aspire".
   - **Badges**, beside the name: processing "Now" on the current step, soft "Up next" on the one
     after, warning "{d} days late" on a late current step ("1 day late" for one), warning "Launch
     at risk" on step 4 when the round is at risk (**Rounds**), and an outline "Client approval"
     on the four approvals. In a round closed early, none of these: an open step shows the soft
     Badge "Not done, round closed".
   - **Where each step opens.** An approval has a link Button "Open" to where the client gives it:
     step 1 and step 4 the round's Master Brief (`#brief/r{n}`), step 2 Creator Selection
     (`#selection/r{n}`), step 3 **Contract and rates** (`#creators/r{n}/fees`). Ads live opens
     Ad Performance (`#performance/r{n}/result`). The other steps open nothing.
   - Under the list, a Progress bar of the steps done, labelled for screen readers "{x} of {y}
     steps done", and the line "{x} of {y} steps done" in `text-sm text-muted-foreground`.
   - **Moving the round on (agency).** A default Button, size sm, "Move to next step", with the
     Lucide `arrow-right` icon, in the section header beside the trigger. It ticks the current step
     done (`done` true, `doneAt` now), so up next becomes the current step. On an approval it has
     `aria-disabled="true"` and the disabled look, and its tooltip says "{Step} ticks when the
     client approves it on {Tab}."; on Ads live, "Ads live ticks on the launch date, once the
     briefs are approved."; with every step done, it doesn't render.
   - **Editing (agency).** In place, per **Editing in place**: a checkbox at the start of every
     step but the approvals and Ads live ticks or unticks it (unticking clears `doneAt`). A step
     that counts as done only because a later step went out shows its checkbox checked and
     disabled, with the tooltip "Done once {step} went out."; the name,
     the date (a date Input) and the owner (a Select: "{brand}", "Aspire", "Creators", then each
     team member by name) of the same steps. An approval's date is editable too: its planned date
     before it is sent, its due date after. Ads live's date is the launch date, which changes with
     the round's dates in **Calendar**. A ghost Button, size sm, "Add step" with the Lucide `plus`
     icon under the list opens a Dialog, "Add a step to round {n}": Name (an Input, required), After
     (a Select of the round's steps, the current one first), Date and Owner, then Cancel (outline)
     and Add step (default). A ghost icon Button with the Lucide `trash-2` icon, labelled "Remove
     {step}", sits beside every step but the approvals and Ads live, and opens a Dialog: "Remove
     {step} from round {n}?", "It leaves round {n}'s steps for everyone. History keeps a record.",
     Cancel (outline) and Remove (destructive).
   - The client, a read only client and **Preview as client** see the same list with every
     control as a label. In a done round it is read only for everyone.
2. **Needs attention** (`home-attention`). Every open item across every tab and round that the
   person viewing can see, not only theirs, so both sides see the whole picture. Each row is the
   List row from **Component classes**, with `break-words`: the title, one line of detail, then
   in `text-xs text-muted-foreground` an outline Badge with the round ("Round 2"), an outline
   Badge with the tab's label, and since when it has waited. A row that waits on the person
   viewing adds a warning Badge "Waiting on you". For the agency it adds who it waits on ("Waits
   on {brand}", "Waits on Aspire", "Waits on @{handle}"), read from `agency/attention` and
   rendered only when that read returns, so the client never sees it and the page code holds no
   such label. Clicking
   or pressing Enter opens the item by its hash.

   | Kind | Title and detail | Waits on (in `agency/attention`) | Opens |
   | ---- | ---------------- | -------- | ----- |
   | The brief | "Sign off the round {n} brief"; "{t} concepts · {c} open comments" | The client | `#brief/r{n}/overview/status` |
   | The brief | "Changes asked for on the round {n} brief"; the first words of the note | Aspire | `#brief/r{n}/overview/status` |
   | The brief | "Write the {concept} brief"; "Due by Briefs approved, {date}" (a concept with no brief in a round in production) | Aspire | `#brief/r{n}` |
   | Cuts at the client | "Review @{handle}'s V{variant}"; "{concept} · version {v}" | The client | `#review/r{n}/{cut}/v{version}` |
   | Changes | "@{handle}'s V{variant} is getting changes"; "{k} open comments" | Aspire | `#review/r{n}/{cut}/v{version}` |
   | Changes | "Your call on @{handle}'s changes"; "{k} changes to the {concept} brief" | The client | `#brief/r{n}/changes-{net}-{handle}` |
   | Packages in transit | "@{handle}'s package is on the way"; "{product} · shipped {date}", with the carrier when saved | Aspire | `#creators/r{n}/{net}-{handle}/shipping` |
   | Creators still to shoot | "@{handle} is still to shoot"; "{concept} · brief accepted {date}" | The creator | `#creators/r{n}/{net}-{handle}` |
   | Variants to retire or refresh | "Retire or refresh @{handle}'s V{variant}"; its cost per sale against the target | Aspire | `#performance/r{n}/variants` |
   | Pending decisions | "Decide on {k} creators"; the first three handles | The client | `#selection/r{n}/{net}-{handle}` |
   | Pending decisions | "Your call on @{handle}" or "Your Maybe on @{handle}"; the question | The client | `#selection/r{n}/{net}-{handle}/notes` |
   | Pending decisions | "Approve the fees for round {n}"; "{a} creators · sent {date}" | The client | `#creators/r{n}/fees` |
   | Pending decisions | "Add shipping for {k} creators"; the first three handles | The client | `#creators/r{n}/{net}-{handle}/shipping` |
   | The agency's own (agency only) | The agency's rows in **Waiting on you**: replies to record, drafts to send, No reply yet, approvals due within a day, a brief sign off not recorded yet, your call needed, concepts below their pool target, details emails not sent | Aspire | As in **Waiting on you** |

   The client's rows are the same items as their **Waiting on you**, with the same ids, open
   comments, grouping and "waited since" (**The Simple view**). "Cuts at the client" counts cuts
   that need client review, and the cut "Changes" row cuts with changes requested (**Content
   Review**, **Statuses**). "Variants to retire or refresh" lists the variants to retire or
   refresh of a round in market or in its 14 days after (**Ad Performance**, **Status**), its detail naming the reason ("over
   the cost per sale bar", "live past {d} days and slipping", "under the spend floor after {d}
   days") with the cost per sale against the target, and shows nothing before the round has
   results. The agency's own rows come from `agency/attention`, never from the page itself.

   A Tabs list above the rows, "All" and "Waiting on you", kept in memory and opening on All,
   narrows the list. The rows are sorted oldest first; rows that waited the same time keep the
   order of the table. Done marks from **Waiting on you** don't hide anything here: a row leaves
   this list when the records or page data say it is closed. Empty: "Nothing needs attention
   right now."; with "Waiting on you": "Nothing needs you right now." These lists say what is
   open; the **Inbox** says what changed.
3. **Tab summaries** (`home-summaries`). One Card per other tab, for the round in view, in the tab
   order, in a `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` grid. Each card: the tab's
   title in the Card title classes, an outline Badge with the round ("Round 2"), the tab's count
   Badge of items waiting on the viewer when there are any (**Header and tabs**), a headline in
   `text-2xl font-semibold`, one line in `text-sm text-muted-foreground`, and in the Card footer
   a link Button "Open {Tab}" with the Lucide `arrow-right` icon, to the tab on that round
   (`#brief/r{n}`, `#selection/r{n}`, `#creators/r{n}`, `#review/r{n}`, `#performance/r{n}`). The
   card itself is not a button, so its one link is the only control in it.

   | Card | Headline | Line | Until it has data |
   | ---- | -------- | ---- | ----------------- |
   | Master Brief | The brief's status: "Draft", "Waiting for your sign off" for the client ("In review with client" for the agency), "Changes requested" or "Signed off {date}" | "{w} of {t} concepts written · {k} open comments", with the status Badge | "No briefs written yet." |
   | Creator Selection | "{a} approved" | "of {m} creators in round {n} · {d} to decide" | "No creators in the pool yet." |
   | Selected Creators | "{n} with fees agreed", the creators on the tab (**Selected Creators**, **Who's here**) | "{k} missing details · {s} shipped, {d} delivered", {k} being the creators with any detail to add as the viewer counts them (**Selected Creators**, **Details to add**), plus "{total} committed" for the agency only, from `agency/budget` `committed:` and rendered only when that read returns | "Creators show here once {brand} approves them and their fees are agreed." |
   | Content Review | "{x} of {y} ad videos in" | "{w} waiting on you · {a} approved" | "Cuts show here once creators start shooting." |
   | Ad Performance | "Cost per sale {x}", with the target Badge from **Last round result** | "{w} of {a} ads won · {r} to retire or refresh" | "Round {n} goes live {launch}." before the launch, "No ad has run a variant's live post yet." once it is live, and "Connect your Meta ad account to see results" with no ad account linked |

   Content Review shows its "until" line while the round has no cut, and Ad Performance until the
   page holds the round's results. A read only client reads no cuts, so their Content Review card shows only
   "Cuts show here for people who can open this page's data." in any state. There are five cards, one per tab, and no other: no card for a feature that has
   no tab or isn't built.
4. **Program terms** (`home-program`). What the brand bought in its SOW, from
   `campaign:{slug}-cas` and `campaign:{slug}-terms` and the agency's edits since, for both
   sides from the first publish (**Who sees what**, **Program terms are the client's own**). A
   Table from 640px with the columns Term, Value and From, and a stack of Cards on phone
   (**Responsive**), in groups, each under a `text-sm font-medium` heading:

   | Group | Term | Value | From the record |
   | ----- | ---- | ----- | --------------- |
   | SOW dates | Starts, Ends | "Nov 2, 2026" | `term.start`, `term.end` |
   | Each creator makes | One row per deliverable: "Hooks", "Bodies", "CTAs", "B-roll shots" | The count: "3" | `sow.deliverables` |
   | The campaign | Ad ready videos, per round | "27" | `sow.adReadyVideos`, else `package.creators` times `package.variants` |
   | The campaign | Variants per creator, per round | "3 (at most 5)" | `package.variants` |
   | Usage | Usage | "{d} days" | `term.usageDays` |
   | Usage | Allowlisting | "Yes" or "No", and once the fees are sent, "adds {p}% to each fee" | `allowlisting` and `whitelistingUpliftPct` in the terms |
   | Usage | Partnership ads | "Yes" or "No" | `partnershipAds` in the terms |
   | Exclusivity and organic posting | Exclusivity | "None", or the terms as saved | `exclusivity` in the terms |
   | Exclusivity and organic posting | Organic posting | "Nothing organic, ads only", or the terms as saved | `organic` in the terms |

   - **From** says where the value came from, by its stamp's `source` (**1e**, **Every editable
     value**): "Campaign setup" for `atlas`, "Edited by {name}" for `manual`, "Written by Claude"
     for `claude`, "From the sheet {name}" for `sheet`, and for `file` the file's label and its
     date ("SOW v2, Oct 14") as a link Button that opens the file from **Files**, or as text when
     the file is gone (**1e**, **Program files and the scan**). The
     time is in the value's tooltip, per **Editing in place**. Ad ready videos worked out from the
     package reads "Worked out: {c} creators, {v} each". On phone **From** is a line under the
     value in `text-xs text-muted-foreground`.
   - **Allowlisting with nothing saved** reads "Yes" whenever `campaign:{slug}-terms` is saved,
     because the uplift then applies to every fee (`rates-and-terms.md`, **What each creator
     gets**), with **From** "Campaign setup". So the client never sees an uplift with no
     Allowlisting row to explain it.
   - **The SOW against the plan.** The pace verdict and the Content Review card count the round's
     plan ({y}, **Where we stand**). When `sow.adReadyVideos` is above {y}, the agency sees one
     warning line under Ad ready videos: "The SOW promises {s} a round; round {n}'s plan makes
     {y}." The client sees the SOW's figure only.
   - **Hidden parts.** A row whose record has no value is hidden for the client, and a group with
     no row is hidden with it. The agency sees "Not set" in `text-muted-foreground` with the
     pencil to set it, and the group "Each creator makes" with an "Add deliverable" ghost Button,
     size sm, and the Lucide `plus` icon. The SOW dates and the package are saved at setup (C1),
     so the section always has rows.
   - **Editing (agency).** In place: dates with a date Input, counts with a number Input (a whole
     number, 1 or more), variants with a Select from 1 to 5, Yes or No with a Select, the rest
     with an Input. "Add deliverable" opens a Dialog: Label (an Input, required) and Count,
     Cancel (outline) and Add (default). A ghost icon Button with the Lucide `trash-2` icon removes
     a deliverable after a Dialog confirm, the way a step is removed. Editing the dates, the usage,
     the variants, allowlisting or the uplift shows one line under the field while it is open:
     "This changes what the creators agreed. Agree it with each creator first." Allowlisting and
     the uplift add "It changes every fee, approved ones included."
5. **Products in scope** (`home-products`). The products the campaign is for, from `products` in
   `campaign:{slug}-cas` and the agency's edits, one Card each in a `grid grid-cols-1 gap-4
   sm:grid-cols-2 lg:grid-cols-3` grid:
   - **The photo**, when saved: a `thumb@240x180` image from `creator-card.md`, **Images**, page
     profile, `w-full h-auto rounded-md`, with the product's name as its `alt`. Published pages
     load no outside image, so Claude fetches the photo link at publish and embeds it in the page
     itself. A link the agency set on the page since shows no image, and for the agency the line
     "The photo shows after the next publish." With no photo there is no image area at all.
   - **The name** in `font-semibold`, **the status** as a Badge (**Status pills**: Active,
     Coming soon, Paused, Out of stock), and **the short description** in `text-sm
     text-muted-foreground`.
   - **"{n} creators, {m} approved"**, a link Button that opens Creator Selection filtered to the
     product (`#selection/product-{id}`). {n} counts the creators in the pool whose Product is this
     product, by its id, or by its name ignoring case where a record holds the name; {m} counts
     those approved in any round. With none, it reads "No creators yet" as text.
   - **Editing (agency).** Every part in place, the status with a Select and the photo with an
     Input that takes an `https` link. An outline Button, size sm, "Add product" with the Lucide
     `plus` icon opens a Dialog: Name (required), Status, Short description (a Textarea, 200
     characters at most) and Photo link, then Cancel (outline) and Add product (default). Removing a
     product works as removing a step does.
   - **Hidden parts.** For the client the section doesn't render until the campaign has a product.
     The agency sees "No products added yet." with **Add product**.
6. **Team** (`home-team`). The people at Aspire on the campaign, from `team` in
   `campaign:{slug}-cas` and the agency's edits, one Card each in the same grid:
   - An Avatar with their initials, **the name** in `font-semibold`, **the role** on the
     campaign, and **the title** in `text-sm text-muted-foreground`.
   - **The work email** as a link Button (`mailto:`) with `h-auto min-w-0 whitespace-normal
     break-all` added, so a long address wraps on a phone, and beside it a ghost icon
     Button with the Lucide `copy` icon, labelled "Copy {name}'s email", which copies it and shows
     the Lucide `check` icon for two seconds. Where the browser refuses the clipboard, a Dialog
     "Copy email" opens with a read only Input holding the email, already selected, the line
     "Press Ctrl+C or Cmd+C to copy.", and Close (outline).
   - **"Owns: {owns}"**, and **"Go to {name} for {goTo}."**, each a line in `text-sm`.
   - A part with nothing saved is hidden for the client, and "Not set" with its pencil for the
     agency.
   - **Editing (agency).** In place, and an outline Button, size sm, "Add person" with the Lucide
     `user-plus` icon opens a Dialog: Name (required), Role, Title, Work email (an Input of type
     email; one that doesn't look like an email shows "Enter a work email, like
     name@company.com." and doesn't save), What they own, and Go to them for, then Cancel
     (outline) and Add person (default). Removing a person works as removing a step does.
   - **Hidden parts.** For the client the section doesn't render until the team has someone. The
     agency sees "No team added yet." with **Add person**.
   - Only Aspire's own people go here; a creator's contact details never do (**Who sees what**,
     **Contact details**). The weekly sync is in **Next check in**.
7. **Calendar** (`home-calendar`). Pacing on a calendar that spans the campaign: each round's
   build and in-market phases, its milestones, today, and one row per concept with its pace.
   Hovering a day on a desktop, or tapping it on a phone, shows what was delivered against the
   plan that day, what should be in today, or what should be in by then. It opens as a compact
   strip; **Full calendar** shows every day.
   - **Where every date comes from.** Nothing on the calendar is spread, guessed or drawn from
     an example. Every date is one a record holds:

     | On the calendar | From |
     | --------------- | ---- |
     | The span | The term's start to its end (`program/details` `termStart` and `termEnd`, else `term.start` and `term.end` in `campaign:{slug}-cas`), widened to take in any round's dates that fall outside it |
     | Build phase | The round's build window, from its start to the day before launch (**Rounds**). A day from the launch date to today on which step 4 was not yet cleared stays build, as **Launch at risk** |
     | In-market phase | From the later of the launch date and step 4's `clearedAt`, to the in-market window's end, or to `closedAt` for a round closed early. A round closed before step 4 cleared has no in-market phase. While step 4 is still open, the days after today keep their planned in-market phase, drawn as a `border border-primary` outline bar with no fill, because whether they go live isn't known yet. Each day's phase is the round's state on that day (**Pace uses the Where we stand rule**), so the bars, the day details and the export never disagree with the pace under them |
     | Milestones | **First cut review**, **Variants due** and **Ads live**: the dates of the round's `first-cut` and `variants-due` steps and its launch date, from the newest of the round finding and `program/round-r{n}` (**Rounds**, **Round steps**), named as **Round steps** names them |
     | Steps | Each step's date in the round's `plan` and page data, an approval's from its gate finding, as **Round steps** shows them |
     | Cut delivered | The `addedAt:` (full UTC time) of each cut's first version, `reviews/cut-{cut}/versions/v1` or the lowest version there (**1e**). A later version is a new version, not a delivery |
     | Approved | The client's call that counts on the cut's newest version (**Content Review**, **The status flow**, **The call that counts**): a cut counts as approved from that call's `at` while it is approved. It stops at an undo or a request for changes, a **Send to {brand} as is**, or the `addedAt:` of a newer version of the cut, which starts in Aspire QA (**Content Review**, **Statuses**). Neither the activity log nor a `client/cut-{cut}-v{version}` stamp from an earlier page makes a cut approved |
     | Shipping | The creator's shipping record for the round, `shippedAt` and `deliveredAt` (the newer of the two sides' stamps, **Selected Creators**, **Creator records**), else the activity log's `status` entries for the creator in the round whose `to` is Shipped or Delivered (from either side, so a Mark shipped shows at once), else the roster's `shipDate` for Shipped; and the pickup visit date in `details`. A product kept from last round has no shipping event |
     | Spend and return | The week's spend and ROAS in **Weekly spend and return** for the round, the same weeks from the launch date (**Ad Performance**, **Reading the results**), once the page holds them |
     | Reading the log | The activity log is read only while the section is open, and only the day documents (`days/{day}`) for days inside a round's build or in-market window, up to today,, read once and then kept current by the page's live updates (**Live updates**). Closing the section stops it |
     | Today | The viewer's clock (**Round switcher**, **Every date is real**) |

     A time (`addedAt:`, a log entry's `at`) lands on the viewer's own calendar day. A date with
     no time (a step, a launch) is that date for everyone. A milestone or step with no date isn't
     drawn: the client sees nothing for it, and the agency sees it under the calendar as
     "{Milestone}, round {n}: no date set" with a link Button "Set it" to its step in **Round
     steps** (`#home/steps/r{n}/{step}`).
   - **Pace uses the Where we stand rule.** The plan, what's in, the 10% and one video threshold,
     the verdict and the states it shows in are the ones in **Where we stand** (**The Simple
     view**), never a second rule. The calendar only asks the same question on another day or
     for one concept:
     - **A round's state on a day {d}** is the **Rounds** state test with {d} as today, on the
       dates alone: a stored `state` is ignored, so a finished round keeps its past phases. Planned
       before the build window; In production from its start, and past the launch date for as
       long as step 4 was not cleared by {d} (its gate's `clearedAt`), up to today; In market from
       the launch date once step 4 was cleared; Done after the in-market window, or from
       `closedAt` for a round closed early. A day after today on which step 4 is still open reads
       as planned in market, with the future-day pace line.
     - **While the round is in production on {d}**: what's in by {d} is the round's cuts whose
       first version was added on or before {d}; what's needed by {d} is {z} worked out with {d}
       as today; and the verdict follows. On today that is, by construction, the same round, the
       same {x}, {y}, {z} and verdict as **Where we stand** shows, Launch at risk included.
     - **While it is in market or done on {d}**: "{x} of {y} ad videos made this round." with no
       verdict, as **Where we stand** reads. **Planned**: "Building starts {date}."
     - **For one concept**: the same rule over the round's creators on that concept and their
       cuts. A round's verdict is worked out from the round's own totals, not added up from the
       concept rows, so a concept can run behind while the round is on track.
     - **The plan is today's plan.** No record keeps the roster as it stood on a past day, so a
       creator added or declined since moves the plan on every day. The round's dates are today's
       dates too: a logged slip moves the build window, launch and in-market window (**Rounds**),
       so past days are drawn and paced against the moved window, and a delivery can sit on a day
       that now reads Planned. The delay list says each slip. Delivered and approved counts
       come from the dated version records and the activity log, so they don't change after the
       day.
     - **Hidden as Where we stand is hidden.** With no creators in the round, the pace parts read
       "Pace starts once creators are approved for round {n}." The phases, milestones, steps,
       shipping and today still show. A read only client
       reads no cuts and no log, so for them the calendar has no pace, delivery or approval parts
       in any state.
   - **The compact strip.** The default once the section is open. One timeline across the span,
     drawn at the width of its container and redrawn when that changes (**Responsive**,
     **Media**), so it never scrolls sideways:
     - **The caption** above it, in `text-xs text-muted-foreground`: "{start} to {end}", plus
       "Starts {date}" before the span or "Ended {date}" after it, plus any line this section
       says goes there.
     - **Month labels** along the top in `text-xs text-muted-foreground`, at the first day of each
       month, with a 1px `bg-border` hairline. A label that would overlap the one before is left
       out, and the hairline stays.
     - **One lane per round**, oldest first, labelled "Round {n}" at the start in `text-xs
       font-medium` (`font-semibold` for the round in view). Its build phase is a `bg-primary/20`
       bar and its in-market phase a `bg-primary` bar, each 12px tall with `rounded-sm` ends and a
       2px gap between them, so the two read apart by lightness and by order as well as by the
       legend. Build days past the launch date carry a warning Badge "Launch at risk" at the
       lane's launch point. Overlapping rounds are separate lanes, so one never covers another.
     - **Milestones** on the round's lane as Lucide icons, `size-3`, in `text-foreground`:
       `eye` for First cut review, `layers` for Variants due and `rocket` for Ads live.
     - **Today** as a 2px `bg-foreground` line through every lane, with "Today" above it in
       `text-xs font-medium`. Outside the span the line isn't drawn.
     - **One row per concept** of the round in view, under the round lanes, in concept order: the
       concept chip (**Concept colors**), its pace tag as a Badge (Ahead, On track or Running
       behind, **Status pills**), and "{x} of {y} in · {z} needed by today" in `text-xs
       text-muted-foreground`, or "All {y} in" once they are. On the row's track, a tick on each
       day a cut of that concept was delivered: `border-l-2 border-chart-{n}`, 8px tall, sitting
       beside the concept's chip as **Concept colors** requires of a thin mark. A sixth concept or
       later keeps its chip from **Concept colors** (`bg-muted text-foreground` with its number)
       and takes `border-muted-foreground` ticks, matching its bar in the day details and never
       mistaken for the today line. When a day is narrower than 4px at the
       strip's width, ticks group by week, one tick on the week's first day. In market and Done
       rounds show "{x} of {y} made" and no tag; a Planned round "Building starts {date}".
     - **The legend**, under the strip, in `flex flex-wrap gap-x-4 gap-y-1 text-xs
       text-muted-foreground`: a swatch and "Build", a swatch and "In market", an outline swatch and
       "In market if briefs are approved" while a round shows one, each milestone's
       icon and name, the today line and "Today", and a tick and "A cut delivered". It is always
       there, because identity never rests on color alone.
     - **Delays**, under the legend, in both views: one line per `ledger` entry for the
       campaign, "Round {n}: {Step} slipped {d} days" ("1 day" for one), from its `round`, `gate`
       and `daysSlipped`, the step named as **Round steps** names the approval; a Gate 4b line reads
       "Round {n}: @{handle}'s brief approval slipped {d} days". A line written before `ledger`
       carried `round` takes it from the gates in `shifted`, and leaves the round out when those
       don't say. Newest first, or "No delays."
   - **The full calendar.** While the section is open, a ghost Button, size sm, "Full calendar"
     with the Lucide `calendar-days` icon, at the end of the row above the strip, swaps the strip
     for every day of the span, and "Compact strip" with `calendar-range` swaps it back. The
     choice is kept in memory for the visit, like the **Everything** Switch, and works for
     everyone. The caption, legend and delays stay.
     - **From 640px**, a month grid per month of the span, one under another, so the page scrolls
       down and never sideways. Each month has its name in `text-sm font-medium`, weekday
       headers in `text-xs text-muted-foreground`, and seven equal columns (`grid grid-cols-7`),
       built as one `role="grid"` per month. Each day is a `gridcell` holding a `button`,
       `min-w-0`, with `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`:
       its date number in `text-xs`, a 4px band at its top per round whose phase covers it (the
       same two fills as the strip), its milestone icons, and "{k} in" in `text-xs` on a day with
       deliveries for the round in view. Today's date number sits in a `bg-foreground
       text-background rounded-full` circle with "Today" for screen readers. Days outside the span
       are empty and not focusable. Each button's accessible name reads the whole day: "{date},
       round {n} build day {b} of {B} (or "in market week {w}", "{d} days past launch, launch at
       risk", "planned" or "done"), {k} delivered, First cut review", so no band or icon is the
       only place a fact lives.
     - **On a phone**, a list of dated days grouped by month: every day that has a milestone,
       step, delivery, approval or shipping event, plus today, each a List row (**Component
       classes**) with the date, the round and its phase as outline Badges, and one line naming
       what happened. Above the list sits the strip, and a date Input, "Go to a day", that pins
       any day of the span, so a day with no event is reachable too.
   - **Day details.** For any day of the span:
     - **Opening them.** Hovering a day on the strip or the grid shows them in a floating Card
       (the Card classes, `w-72 max-w-[calc(100vw-2rem)]`) placed beside the day, flipped to stay
       inside the section. On the strip the pointer snaps to the nearest day under it and a 1px
       `bg-border` hairline marks that day across every lane, so the pointer never has to land on
       a mark. The Card stays while the pointer moves onto it, closes when the pointer leaves
       both, and Escape closes it. Clicking or tapping a day, pressing Enter on it, or picking it
       in "Go to a day" pins the same details in a panel under the calendar, `aria-live="polite"`,
       with ghost Buttons "Previous day" and "Next day" (Lucide `chevron-left` and
       `chevron-right`), so on a phone every day is a tap or two from any other, and a ghost icon
       Button with the Lucide `x` icon, labelled "Close", that unpins it. On a phone nothing
       floats: a tap on the strip pins the nearest day.
     - **The keyboard.** The strip is one `role="slider"` labelled "Campaign calendar", with
       `aria-valuetext` the selected date: Left and Right move a day, Page Up and Page Down a
       month, Home and End to the span's ends, each pinning the day. The month grids use one
       roving tab stop: arrows move between days, across months too, and the day in focus shows the
       same floating Card as hovering, which Escape closes; Enter pins.
     - **The heading**: the date ("Tuesday, Nov 4"), then one outline Badge per round whose phase
       holds the day ("Round 2 · build day 12 of 28", "Round 1 · in market week 3"). A build day past
       the launch date reads "Round {n} · {d} days past launch" with a warning Badge "Launch at
       risk".
     - **Pace**, for each round in production on that day (**Pace uses the Where we stand
       rule**):
       - A past day: "{a} delivered that day · {x} of {z} in against the plan for {date}", the
         verdict for that day as a Badge, and "{p} approved by then".
       - Today: "{x} of {y} in. We need {z} by today.", with the verdict, as **Where we stand**
         reads, and "{p} approved so far".
       - A future day: "{z} of {y} should be in by {date}."
       - A round in market or done that day: its "{x} of {y} ad videos made this round." line.
       {a} counts cuts first delivered that day. New versions of earlier cuts are counted apart,
       as "{v} new versions", and never as deliveries.
     - **Per concept bars**: one row per concept of the round in view, the chip, then a track in
       `bg-muted`, 8px tall, `rounded-sm`, filled with `bg-chart-{n}` to what's in by that day
       (`bg-muted-foreground` for a sixth concept or later), with a 2px `bg-foreground` tick at
       what's needed by then, standing 2px above and below the track so it reads over any fill, and "{x_c} of {z_c}" in `text-xs` after it. Future days show the needed
       tick and "{z_c} by then" only. The text carries the value, so a concept color that reads
       faintly on the card never hides a number.
     - **Events** that day, every round, each a line with its Lucide icon, its round as an
       outline Badge, and a link to its item: `film` "Cut delivered: @{handle}'s V{variant}" and
       `file-plus` "New version: @{handle}'s V{variant}, version {v}", opening
       `#review/r{n}/{cut}/v{version}`; `circle-check` "Approved: @{handle}'s V{variant}", opening
       the approved version; the milestone's icon and its name; `list-checks` "{Step} due" or
       "{Step} done", opening `#home/steps/r{n}/{step}`, with a warning Badge "{d} days late" when
       it is; `truck` "Shipped to @{handle}", `package-check` "Delivered to @{handle}" and `store`
       "@{handle} picks up the product", opening `#creators/r{n}/{net}-{handle}/shipping`. More
       than six events show six and "and {m} more", which lists the rest in place.
     - **Shoot**: no record holds a creator's shoot date, so the calendar shows no shoot events.
       When Selected Creators, **Brief and content**, records one per creator, it shows as
       `clapperboard` "@{handle} shoots" with the other events.
     - **An in-market day**: "Week {w} in market" for that round, and once the page holds the
       round's results, that week's spend and ROAS ("Spend {s} · ROAS {r}") with a link
       Button "See the week" to `#performance/r{n}/weekly`. Until then, nothing about spend shows:
       no zero, no placeholder.
   - **Who sees what.** Every part is built from what the viewer can read. The client's shipping
     events show once Shipping shows for them (fees approved). Cut, version and approval events
     show to whoever reads the cuts, the same set **Where we stand** counts, so the events always
     add up to the numbers. A read only client gets the phases, milestones, steps, today, the
     delays and the published shipping dates, with "As of {publish time}." under the title.
   - **Editing (agency).** Each round lane's label, on the strip and in the full calendar's
     month where the round's build starts, carries a ghost icon Button with the Lucide `pencil`
     icon, labelled "Edit round {n} dates". It opens a Dialog "Round {n} dates" with a Label Input
     (required) and date Inputs for Build starts, Launch date and In market ends, then Cancel
     (outline) and Save (default). Saving writes `program/round-r{n}` (`label`, `buildStart`, `launch`, `buildEnd` the day before launch,
     `marketStart` the launch, `marketEnd`, and `month` from the launch), and Ads live moves with
     the launch. A launch before the build start, or an end before the launch, shows "The launch
     can't be before the build starts or after the in-market window ends." and doesn't save. Two
     more refusals, under In market ends: past the term's end, "The term ends {date}. Running
     past it changes the usage the creators agreed to, so it's a setup change. Change it in the
     chat once each creator has agreed." (**Rounds**); on or after the next round's launch, "Round
     {n+1} goes live {date}. End this round before then, or move round {n+1} first." A launch
     before step 4's due date saves, with the warning line "Briefs approved is due {date}, after
     this launch. The round will show Launch at risk."
     The Dialog says "Later rounds keep their dates. To move every later round with this one, log
     the delay in the chat." because only a slip moves them (**Rounds**). A step's date is edited
     in **Round steps**, which each step event links to. In a done round, and for the client,
     nothing here is editable.
8. **Files** (`home-files`). The program files in one place, each tagged with its round, with
   what is still missing. Both sides see the list, **Still needed** and the previews. Only the
   agency adds, edits, removes and scans files (**Who sees what**, **Files and the scan**). When a
   file is added, the page reads it and fills **Program terms**, **Products in scope**, the steps'
   dates and the budget from it, the newest file winning (**1e**, **Program files and the scan**).
   - **Categories.** Every file has one: Kickoff deck, Statement of work, Creative intake form,
     Master brief, Creator brief, Creative packet, Target audience sheet, Creative strategy
     proposal, Shared folder.
   - **Still needed.** First in the section, the required categories with no file yet: every
     category above but Creator brief, which is never required.
     A category counts as there when a file in it is tagged "All rounds" or the round the filter
     shows. The line reads "Still needed for round {n}:" in `text-sm font-medium`, then one
     warning Badge per category ("Still needed", **Status pills**), in the **Categories** order, in a
     `flex flex-wrap gap-2` row. For the agency each Badge is a Button that opens **Add file**
     with its category already set. With nothing missing, the Lucide `circle-check` icon and
     "Every required file is here."
   - **Filter by round.** A Select above the list: "Every round", "Whole campaign", and one item per
     round ("Round 2"). It starts on the round in the **Round switcher** and follows it until the
     viewer picks something else, for this visit only. A round shows that round's files and the
     "All rounds" ones, since those apply to every round; "Whole campaign" shows only the "All
     rounds" ones. **Still needed** checks the round picked, or the round in the switcher when the
     filter shows every round or the whole campaign.
   - **The list.** A Table from 640px and a stack of Cards on phone (**Responsive**), ordered by
     category in the order above, then by date, newest first. Columns:

     | Column | What it shows |
     | ------ | ------------- |
     | File | The type icon, then the label as a link Button with `h-auto min-w-0 whitespace-normal break-words` that opens the preview for an upload or the link in a new tab (`rel="noopener"`) |
     | Category | The category's name |
     | Version | "v{n}" |
     | Round | An outline Badge: "All rounds" or "Round {n}" |
     | Added by | The person's name from `user.profiles`, or "Found by Claude" for a file Claude found in the chat (**1b**, **Files found in setup**) |
     | Date | The file's date, with where it came from in its Tooltip: "Date in the document", "Last changed in Google Drive", "Last changed on the uploader's computer", "Date added" or "Set by {name}" (**1e**, **Which date a file has**) |
     | Scan | Agency only: the scan state (below) |
     | (actions) | Agency only: ghost icon Buttons with the Lucide `pencil` and `trash-2` icons, labelled "Edit {label}" and "Remove {label}" |

     The type icon is a Lucide icon, `size-4 shrink-0 text-muted-foreground`, with its type as a
     screen reader label: `file-text` for a PDF, a Word file, a Google Doc or a text file,
     `file-spreadsheet` for an Excel file, a CSV or a Google Sheet, `presentation` for Google
     Slides, `image` for an image, `folder` for a Drive folder, and `link` for any other link. On
     phone each Card shows the icon and label, then the category, version and round Badge on one
     wrapping line, then "Added by {name} · {date}" in `text-xs text-muted-foreground`, then the
     agency's scan state and actions.
   - **Adding (agency).** An outline Button, size sm, "Add file" with the Lucide `plus` icon opens
     a Dialog "Add files" with Tabs "Upload" and "Link". Upload holds a file input that takes
     several files at once, set to the accepted types (**1e**, **What the page can read**). Link
     holds an Input for one `https` link; anything else shows "Paste a link that starts with
     https://." and doesn't add. Below, one row per file: Label (an Input, from the file's name
     without its extension, or the document's title for a Drive link once read), Category (a
     Select, required, guessed from the name: "sow" or "statement of work" for Statement of work,
     "kickoff", "intake", "master brief", "creator brief", "packet", "audience", "strategy" or
     "proposal" for theirs, a Drive folder link for Shared folder, else empty), Round (a Select:
     "All rounds" and each round; Master brief, Creator brief and Creative packet start on the
     round in view, the rest on "All rounds"), and Version (a number Input, whole and 1 or more,
     starting one past the newest file in that category and round). Then Cancel (outline) and
     "Add {n} files" (default), disabled until every row has a category.
   - **Drop anywhere on the panel.** For the agency the whole Files Card takes dropped files and
     dropped links. While something is dragged over it, the Card shows `ring-2 ring-ring` and one
     centered line, "Drop to add to Files", and dropping opens the same Dialog with the files or
     the link already in it. The section opens if it was closed. For the client the Card is not a
     drop target, and a file dropped on the page anywhere else does nothing.
   - **While it adds.** A row shows at once with the label and a Progress bar until the upload
     finishes. A refused upload keeps the row with an error Badge "Not added" and its reason
     (**1e**, **What the page can read**), a ghost "Try again" Button and a ghost "Dismiss" Button,
     and saves nothing.
   - **The scan state** (agency only). A Badge per file (**Status pills**), and a Button that
     opens a Dialog "Scan of {label}":
     - **Scanning**, with the Lucide `loader-circle` icon in `animate-spin motion-reduce:animate-none`.
     - **Updated {n}**, when the scan changed {n} values.
     - **Scanned**, when it read the file and changed nothing.
     - **Couldn't scan**, with the reason in the Dialog and a ghost "Try again" Button.
     - **Not read**, for a link the page can't read, with the reason in the Dialog: "Saved.
       This page can't read Google Drive for you, so it wasn't scanned. Ask Claude in the chat to
       scan the files." or "Saved. Links outside Google Drive aren't read."

     A category the scan doesn't read from (**1e**, **What each file fills**) shows no Badge. The
     Dialog lists what the scan found in four groups: **Updated** (the term, from and to), **Kept**
     (the term, the file's value, and why: "{other file} is newer, dated {date}", "Edited by
     {name} on {date}; this file isn't newer" or "Edited by {name}; this file has no date of its
     own"), each with a ghost Button "Use this value", **Couldn't use** (the term and why: "Not a
     date", "Over 500 characters", "Not in US dollars"), and **Not in the file**. Then "Scan again" (outline) and Close
     (default). "Use this value" writes
     the file's value stamped from the file, with the person who clicked as its writer (**1e**,
     **Program files and the scan**), so a newer file can still replace it later.
   - **Preview.** The file's label, on an upload, opens a Sheet titled with the label, the
     category, round and date under it, and the file below, read only, sized to the Sheet:
     - A PDF: each page drawn to a canvas, one under another, `w-full h-auto`, the first 50
       pages, with "Showing the first 50 of {n} pages." past that.
     - An image: the image, `w-full h-auto rounded-md`, with the label as its `alt`.
     - A Word file: its headings, paragraphs, lists and tables as page text, built with text
       nodes, never as markup from the file, so nothing in the file runs or styles the page.
     - An Excel file: Tabs per sheet and each sheet as a Table, the first 500 rows.
     - A text file, Markdown or CSV: the text in `whitespace-pre-wrap break-words text-sm`, a CSV as
       a Table, the first 500 rows.

     Under the file, a link Button "Download" with the Lucide `download` icon saves the original
     through the `downloads` capability (**1e**). A link's label opens the link itself, never a
     preview. A preview that can't load (the file is gone, or the viewer's account can't open the
     page's uploads) shows "This file can't open from this account. Ask {CM name} for a copy."
   - **Editing (agency).** The pencil opens the same row in a Dialog: label, category, version,
     round and date. A changed date or category says under the field "Scan the {category} files
     again to apply this." and adds that Button to the Dialog's footer. It scans every file in the
     category one after another, oldest date first, so the newest lands last and a file whose date
     moved back hands its values to the newer one. A changed category also releases the values
     this file filled that its new category doesn't fill, as removing it would (**1e**, **Program
     files and the scan**), and the Button then scans the old category's files and the new one's.
     Nothing changes until then.
   - **Removing (agency).** The `trash-2` Button opens a Dialog "Remove {label}?" with "It leaves
     Files for everyone, and an upload is deleted for good. Values filled from it stay, and show
     its name without a link. Scan the other files again to fill them from what's left." Then Cancel (outline) and Remove (destructive). Removing
     writes the file's stamp as `null` (**1e**) and then deletes the upload.
   - **Empty.** "No files yet." For the agency, under it, "Drop files here or add a link." and
     **Add file**. **Still needed** shows above the empty line.
   - A read only client gets the list and **Still needed** as published: each publish writes them
     into the page itself from `program/files`. "As of {publish time}." shows under the title, and
     there are no previews of uploads.

#### A new campaign

A campaign with no round in market yet reads sensibly in every Simple section: Round 1's hero
sentence with its launch date, "Building starts {date}." or the line that pace starts once
creators are approved, the client's decisions and sign offs in **Waiting on you** (or "Nothing
needs you right now."), "Nothing in production right now.", no **Last round result** at all, the
sync or "No weekly sync set yet.", and "You're all caught up." None of them shows a zero
standing in for a figure that doesn't exist yet.

In the Everything view, Round 1's steps show with Concepts approved done and Intake form now,
**Tab summaries** shows each card's "until" line where the tab has nothing yet, and **Program
terms** shows the SOW dates and the package from setup. For the client, **Products in scope**
and **Team** don't render until the agency adds someone or something.
