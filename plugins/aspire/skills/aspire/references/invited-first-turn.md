# Invited first turn

Used by **Phase 2 + 3** of SKILL.md, step 3, for a person who was invited to an organization.
Their role, organization, brand and social accounts were confirmed on atlas.aspire.io, and Atlas
built the brand snapshot report on the server. So this turn asks nothing that is on file: it says
back what Atlas holds, opens the report, and offers the next step. It writes to Atlas only when
the person corrects something (**5**).

A bold section name with no file beside it (**Creator brief**, **Atlas tools**) is another part of
this skill; `SKILL.md`'s **Sections** index names its file.

## Contents

- [1. When it applies](#1-when-it-applies)
- [2. The organization](#2-the-organization)
- [3. The message](#3-the-message)
- [4. The report](#4-the-report)
- [5. Next steps, with the report open](#5-next-steps-with-the-report-open)
- [6. Not ready yet](#6-not-ready-yet)
- [7. No report is coming](#7-no-report-is-coming)

## 1. When it applies

Settle the organization first (**2**). Then the turn applies when all of these hold, read from
that organization's `get_status` result:

1. The phases run from the top (an empty argument or onboarding context, never a named flow), and
   someone is present. Never in an unattended run.
2. `firstRun.organization.invited` is true.
3. `firstRun.brand.profileCount` is 1, so `firstRun.brand.profile` names the brand.
4. Nothing is saved yet: `work.programs` and `work.campaigns` are both empty.
5. Not finished yet for this organization in this session. Keep `invited_turn_shown` in working
   state, keyed by the organization `id`. Set it in two cases only: the report opened (`kind`
   `report`) and **5**'s question was asked, or **7**'s question was asked, whatever the answer.
   A turn that stopped at **6**, or whose report could not be read, leaves it unset, so the next
   bare run comes back here.

When all hold, this turn replaces the rest of step 3, the first-run guide, the route's first
question, and the dashboard for this reply. When any fails and **2** settled on an invited
organization, the organization is already chosen: skip the selector and carry on at step 4 there.
Otherwise carry on with step 3 as written.

Atlas keeps no record that this turn ran, so a bare run shows it again in a later session until a
program or campaign is saved. That is why the message says what is on file, and never that the
person set it up themselves: a teammate invited later sees the same true lines.

**On request** (the `brand report` argument, "show my brand report", "my brand snapshot"), at
any time: run **4** alone, then **5**'s question, with no starter guide and no onboarding
question. Conditions 2, 4 and 5 do not apply, nor does the "from the top" part of condition 1,
and it neither reads nor sets `invited_turn_shown`.

- **3** is skipped, so its lines were never shown: leave out **5**'s "If anything above is wrong"
  line, and read **6**'s "after the message" as "after the report call".
- Someone must still be present. In an unattended run, open the report and stop: ask nothing.
- No brand profile (`firstRun.brand.profileCount` is 0): do not call the report tool. Say "{org}
  has no brand yet." and offer to add one (Phase 4.1).
- Several brand profiles: there is no single newest report. Say so in one line and offer an
  account review of one brand (Phase 6) instead.

## 2. The organization

An invited person also owns the personal organization made at sign-up, and `get_status` may select
that one. `firstRun` describes only the selected organization. This section applies to every run
with someone present, named flows included, so the work never lands in the empty personal one.

Skip it when the person already chose an organization in this session (the picker, the `org`
argument, or a name in their message).

- `firstRun.organization.invited` is true for the selected organization: use it.
- The selected organization has no brand profile and the caller belongs to exactly two
  organizations: call `get_status` once more with the other one's `id` as `asOrganizationId`. If
  its `firstRun.organization.invited` is true, use it for this run and keep passing its `id`. If
  not, stay with the selected one.
- Anything else: step 3 as written.

That one call is the only tool call step 3 allows beside the organization picker, and its status
card gets no line of its own. When it finds no invitation on a bare run, the reply is still the
picker and its one line, nothing else.

When this section settled on an invited organization, whether it was already selected or this
section switched to it, never ask which one, and skip step 3's selector. Where the first call
drew the organization picker, it needs no click: open the reply with "I've opened {org}, the
organization you were invited to. Say /aspire:aspire org to switch."

## 3. The message

One short message, then the report. Greet by the first name in `caller.name` (with no name,
drop the greeting and start at "Here's"), then four lines, each a bold label and what is on file:

> Hi {first name}. Here's what's on file for {org}, so nothing is asked twice:
>
> - **Role** {role}
> - **Organization** {org}
> - **Brand** {domain}, read on {date}
> - **Instagram** {@handle}

| Line | Read from | When it is missing |
| ---- | --------- | ------------------ |
| Role | `firstRun.role`: the value in plain words, or its `other` text | "Not set yet". Do not ask it here; the flow they pick asks it in its setup reply (**Orchestration contract** **1**). |
| Organization | `firstRun.organization.name`. With one other organization add "plus {its name}"; with more, "plus {n} others". | Always present |
| Brand | `firstRun.brand.website.domain`; the date is `firstRun.snapshot.builtAt`, as a day and month | `website` absent (not known): the profile name alone. `website` null (none on file): the profile name, then "no website on file". No `snapshot`: drop "read on". |
| Instagram | The `instagram` entries in `firstRun.social.channels`: each handle, or "Connected" for one with no handle | No `instagram` entry: "Not connected" |

Say an account is connected and nothing more. Never say who connected it or that it came from
Aspire.

**Instagram connected**, in the rest of this file, means `channels.instagram` on the report
result when the result carries it. When it does not (a `building` result, or a read that could
not tell), it means an `instagram` entry in `firstRun.social.channels`.

## 4. The report

Call `get_onboarding_report` with `asOrganizationId`. Where the host draws its widget, say the
line from **Atlas tools**, **After a widget**, with "one question about what to do next" as the
next step. Where it draws none, give the report's `answer` in one line and link `reportUrl`, or
`firstRun.snapshot.url` when the result has no link. Repeat none of the report's findings in chat.

| Result | Then |
| ------ | ---- |
| `kind` `report` | **5** |
| `kind` `building`, and `steps.snapshot` is `failed`, `skipped` or `done` | **7**: the build ended without a report, and the server does not retry a build that ended |
| `kind` `building`, any other steps (`running`, or all `not-started`, which also covers a build that has not started and a read that could not tell) | **6** |
| `kind` `not-found` (no report and no build for this organization), or a tool error | One line: "I couldn't open your brand report just now." Then **5**'s question from the standing options only. |

## 5. Next steps, with the report open

First one line, a statement and not a question: "If anything above is wrong, tell me and I'll fix
it." A correction is a calibration write, confirmed per **Questions and writes**:

- The role: the person's own record, as **Orchestration contract** **2**, Saved answers, writes
  it, on the key `firstRun.role.key` gives (never one you build).
- The website: on `brand:website`. No record yet (`website` null or absent): append it. A record
  exists: the Phase 5 supersede rule.
- The account: Phase 4.2.

Then one `AskUserQuestion`, header "Next step": "What should we do next?" Build its options from
the report's `actions` in `rank` order, at most four in all. Label: the action's `title` (an
older report has none: the first sentence of its `text`), with "(~{minutes} min)" only when the
action carries `minutes`. Description: its `text`. The first option carries "(Recommended)".

- **Instagram connected:** leave out any `connect-channels` action. A report built before the
  account was linked still lists it; when it does, add one line: "This report was built before
  Instagram was linked. Atlas rebuilds it once after a link, so a newer one will replace it."
  (Linking Instagram starts that rebuild on the server; **7**'s "does not retry" is about a build
  that failed.)
- **Not connected:** option 1 is "Connect Instagram (Recommended)", with the `connect-channels`
  action's `text` as its description when the report has one. The report's own panel shows what
  connecting adds, so do not restate it. Then only the actions whose flow runs without a linked
  account (the table's last column).
- **Standing options**, when fewer than two are left or the report could not be read: "Find
  creators" (**Creator discovery**), then "Review your account" (Phase 6) when Instagram is
  connected, or "Connect Instagram" when it is not. Add one only when no option already in the
  question goes to the same flow.

Route the answer by the action's `job`:

| `job` | Flow | Runs without a linked account |
| ----- | ---- | ----------------------------- |
| `connect-channels` | Phase 4.2 from step 2, with channel `meta` already chosen | Yes |
| `creator-discovery` | **Creator discovery** | Yes |
| `creator-vetting` | **Creator vetting** | Yes |
| `creator-outreach` | **Influencer program**, then **Creator outreach** | Yes |
| `content-sourcing` | **Influencer program**, then **Content sourcing** | Yes |
| `account-review` | Phase 6 | No |
| `creator-brief` | **Creator brief** | No |
| `ad-reuse` | **Ad reuse** | No |
| `brand-safety` | Phase 5, the hard no's question | No |
| `weekly-report` | **Readouts**: Setup if it has never run, then Run with the weekly cadence, then its Schedule | No |
| Any other | Treat the action's title as the ask and route it by **Routing by reader** | No |

The flow then runs as it always does, with its own questions and confirmations.

## 6. Not ready yet

After the message, say one line: "Your brand report isn't ready yet." Where the widget is drawn it
shows the build steps and checks again by itself. Either way add: "Say 'show my brand report' in
a few minutes to open it." Never offer a build on credits here.

Then offer one step to take meanwhile, as an `AskUserQuestion` with "Wait for the report" as the
second option: "Connect Instagram" when not connected, else "Answer the brand questions" (Phase
5) when `setup.done` is below `setup.total`. With neither open, ask nothing.

## 7. No report is coming

Say it plainly: "Your brand snapshot didn't finish on Atlas." Then ask with `AskUserQuestion`
whether to build first insights here instead, and say the cost in the question: it reads
{brand}'s posts and uses {org}'s credits. Options: "Build it now (Recommended)" / "Not now".

- Build it now, Instagram connected: Phase 6, the brand's connected accounts.
- Build it now, not connected: there is nothing of the brand's to read yet, so offer Phase 4.2
  first. Once Instagram is linked, stop there: the link makes Atlas rebuild the report by itself,
  at no cost to the brand, so do not go on to Phase 6. Say "Atlas is building your report now.
  Say 'show my brand report' in a few minutes."
- Not now: one line, "Say 'show my brand report' when you want it.", and stop. That ask comes
  back to this offer while there is still no report; a bare run no longer does.

Never start the build without that yes.
