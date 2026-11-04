# Ads launcher reference (partnership ads: test, launch paused, read in flight, learn)

The rules for `atlas-ads-launcher` and the **Ads launch** section of `SKILL.md`. It takes posts
the brand has cleared (from `atlas-ad-reuse`, the content library's cleared-for-ads shelf, or a link
the person names), designs a test, plans each ad through the Meta Ads connector, reads results in
flight, and writes back what each test taught. This is a first version: it plans, creates ads
paused after the person's yes, and reads results. It never turns an ad on, never changes a budget,
and never runs a TikTok or YouTube launch.

## Passes

| Pass | What the agent does | What the main thread does after |
| ---- | ------------------- | ------------------------------- |
| `plan` | Checks each post's ad code status, designs the test, and plans each ad with `ads_boost_ig_post` `confirmed=false` | States the total budget and cap per test, then asks once per ad with `AskUserQuestion`; on yes it calls `ads_boost_ig_post` `confirmed=true` itself (ad created paused) |
| `monitor` | Reads live results with `search_ads` and calls each ad (**In flight**) | Relays the calls; any budget or status change is the person's step in Meta Ads Manager |
| `record` | Saves the approved test plan, in-flight calls and learnings to Atlas | Nothing more |

A pass runs only when its launch says so. `plan` and `monitor` write nothing to Atlas.

## Inputs

- The posts: each with its post id, network, path (`found` or `briefed`, from the ad reuse
  findings), the score `snapshot` when it came from ad reuse, and its rights status.
- The objective (sales by default), the total budget and its currency, the audiences, and the
  campaign's decision defaults when a creator ad campaign is saved (`campaign:{slug}-decision-defaults`:
  cost per sale target, spend floor).
- The Meta Ads connector state: connected or not, the ad account, and the Instagram account.

## Rights and ad codes

- **Rights first.** A post runs only when its rights status says paid usage is granted: a
  `rights` finding at `granted` with paid usage, a deal that grants it, or partnership-ads
  permission on the post. Anything else is "rights not cleared" and goes to
  `atlas-content-sourcing` in `next`; it is never planned.
- **Ad code status.** Check each post with `search_partnership_content`. Read only `adEligibility`,
  `permissionStatus` and `hasAdCode`. A post is ready when it is `AD_READY` and `AUTHORIZED`, or a
  code exists. A code works like a password: never copy an `adCode` into a page, finding, packet,
  draft or audit trail, and never repeat one back; say "has an ad code".
- **Not ready.** Propose a short `send` draft asking the creator to grant partnership ad
  permission in the app. It never asks for a code in a message.

## Test design

- **One variable per test**: hook pattern, opening line, cut length, creator, audience, or path
  (found against briefed for the same product). Each test has a hypothesis, the audience and
  objective, the budget per test, the spend floor before judging, and a rule: **Scale** when
  the ad is Winning (cost per sale 20% or more under the target at twice the floor, per
  **Confirm before scaling**); **Fix** when, past the floor, click-through is at or above the
  account's median but cost per sale misses; **Stop** when both miss after the floor. These
  match the statuses in **In flight**: Scale is Winning, Fix is Watch with "fix the setup", Stop
  is Retire.
- **Spend floor.** Return is judged per ad only after USD 1,000 of spend (or the decision
  defaults' spend floor, in the account's currency; ask for it when the account is not in USD).
  Click-through settles much sooner (by about USD 100) but does not tell you which ads will
  return: use it only to say whether a soft result points at the creative or the setup, never to
  call an ad Winning or to scale it. Budget each ad in a test to reach the floor, plus one more
  floor to take the leading ad to twice the floor, so a test with four ads needs at least five
  floors; with less, test fewer ads.
- **Confirm before scaling.** An ad that is Winning at the floor is "Winning (early)"; call it
  Winning only once it still beats the target at twice the floor.
- **Budget.** The total never passes the stated budget. Without a cost per sale target, ask for one
  in `questions` before any plan. A budget in a currency other than the ad account's is never
  converted: ask for it in the account's currency.
- **Paths stay apart.** A test never mixes found and briefed posts in one variable cell unless the
  path is the variable. The learning keeps the path. When the path is the variable, compare return, never click-through:
  across real ad accounts, briefed posts clicked less than found posts but returned more.
- **No forecasts.** Never promise reach or results or quote a benchmark. A "what would it buy"
  question gets how many tests, creators and variants each budget covers above the spend floor.
  YouTube has no ad results in Atlas and no launch path: the plan is the creator and variant side
  only. TikTok has no launch path yet: give the steps for TikTok Ads Manager.

## Planning each ad

- Call `ads_boost_ig_post` with `confirmed=false` per ad: `ig_media_id` and `sponsor_id` when the
  brand holds ongoing permission, or the code when one exists (the code goes only into this call),
  plus `ad_account_id` and `ig_account_id` from the connector. Return the plan per ad as a `spend`
  proposal: the post, the test it belongs to, the daily budget and cap, and the audience.
- Without the Meta Ads connector, return what to set up in Meta Ads Manager per ad, and nothing
  else.
- Never call it with `confirmed=true`. The main thread does that, one ad per question. The packet
  never carries a code: for an ad planned with a code, the proposal says "has an ad code" with the
  post's `igMediaId`, and the main thread reads the code again itself just before its call.

## In flight

Read the launched ads with `list_ad_search_fields` once, then `search_ads` with `groupBy` ad and
the launched ads' `igMediaIds` three times: for the window (default the last 7 days), for each
ad's life to date (`dateFrom` its first day of spend, which the fatigue rule compares against),
and with `groupBy` day for the last 2 days (for Not spending). One row per ad per currency. Per
ad: spend, cost per sale against the target, hook rate, hold rate and click-through, and one
status:

| Status | When |
| ------ | ---- |
| Testing | Under the spend floor (click-through is shown, but no return call is made) |
| Not spending | Testing with no spend in the last 48 hours |
| Winning (early) | Past the floor and cost per sale at least 20% under the target |
| Winning | Still at least 20% under the target at twice the floor |
| Watch | Past the floor and within 20% of the target either way, or more than 20% over it with click-through at or above the account's median (move: fix the setup) |
| Fatigued | Was Winning, and its return over the last 7 days is under 75% of its own return up to that point (cost per sale about a third higher). Click-through and frequency are shown but never decide it: across real ad accounts, neither gave more warning than the return drop alone, and a click-through drop on its own was no warning at all |
| Retire | Past the floor, cost per sale more than 20% over the target and click-through under the account's median, or rights expire within 7 days |

Each ad gets one move with its reason (scale, hold, refresh the cut, stop) and whether a soft
result points at the creative (hook or hold rate down) or the setup (click-through steady, cost per
sale up). Paid and organic figures are never added together, and currencies are never converted.
Moves are recommendations only: the person makes them in Meta Ads Manager.

## Learning

On `record`, one `went_well` or `needs_improvement` finding per closed test, anchored to the post
and the creator, with `detail.findingType` `ad-learning`, the post's `path`, the ad reuse
`snapshot` it was chosen with, what ran, the result against the target, and the lesson in one line,
labelled observation or inference. The test plan and each in-flight call are `action_item` findings
with `findingType` `ad-test` and `ad-call`. All on one batch question, `runKey` prefix
`ads-launcher-{profile}-`.

## Page

Title "<Brand> Ads Launch: {test name}", republished to the same path. Sections: header; answer
(what is ready, what is waiting on rights or codes, what is paused and waiting to be turned on);
decisions (each ad to approve, the total budget and cap); next steps; the test plan; the in-flight
table when there are live ads; learnings; how it was worked out; what is missing. Amounts show in
the ad account's currency and only to Editors.
