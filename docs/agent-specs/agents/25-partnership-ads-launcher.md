---
number: 25
name: Partnership Ads Launcher
team: 5 Content and ads
personas: Paid Social Manager
wave: 3
permission: Spend
plugin_agents: none
---

# Partnership Ads Launcher

## Job to be done

When I have cleared content, I want ad codes collected, the test designed, launched in Meta or TikTok, and scale, hold or stop calls made in flight, so creator content gets into paid in days.

## Questions answered

| Code | Question | Primary reader | Kind of page | Approved example |
| ---- | -------- | -------------- | ------------ | ---------------- |
| P5 | What would 50K, 100K or 200K buy on YouTube? | VP of marketing | Plan | Waiting on a Meta ad account |
| P6 | The campaign softened. Is it the creative or the setup? | Growth lead | Readout | Waiting on a Meta ad account |

## Skills carried (5)

1. Ad code request
2. Test design with audience, objective and budget guardrail
3. Launch through the ads connection
4. In-flight recommendations
5. Learning written back to creator and content records

## Universal skills used

- U2 Content intelligence
- U5 Performance baseline
- U6 Rights and usage
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Meta partnership ads
- TikTok Spark Ads (steps for TikTok Ads Manager; no connection yet)
- Atlas ad search

## Trigger phrases

- "What would 50K, 100K or 200K buy on YouTube?"
- "The campaign softened. Is it the creative or the setup?"
- "launch the partnership ads"
- "run @handle's post as an ad"
- "set up the test for the creator ads"
- "should we scale, hold or stop"
- "how are the creator ads doing"

## Writes to Atlas

Spend. Before any launch it states the total budget and the cap per test in the ad account's
currency, and each ad is confirmed one by one. Ads go through the Meta Ads connector, planned with
`confirmed=false` first and created paused. Turning an ad on is the person's step in Meta Ads
Manager, and the page says so; the agent never turns an ad on or raises a budget. Sending an ad code
request to a creator is a Send, one question per creator, and covers only an email draft already in
the brand's mailbox, unchanged; direct messages are never sent. A YouTube budget question (P5) is
answered as a plan only: Atlas holds no YouTube ad results and there is no YouTube launch path. The
test plan and each in-flight call are saved as `action_item` findings and each learning as a
`went_well` or `needs_improvement` finding, anchored to the creator's account and the post, with
`detail.findingType` `ad-test`, `ad-call` or `ad-learning` (new types the build defines), on one
batch question. It never saves an ad code: not on a page, in a finding, in a draft, or in a
delivery. Without the Meta Ads connector it says what to run in Meta Ads Manager and launches
nothing. An unattended run never launches and never changes a budget.

## Non-goals

- Choosing which posts to run. 24 Organic to Ads does that.
- Clearing paid usage with the creator. 26 Content Library and Rights does that.
- Casting creators for the campaign. 09 Ads Creator Finder does that.
- Paying creators. 18 Creator Payments does that.
- Launching TikTok Spark Ads. There is no TikTok ads connection yet, so it gives the steps to run
  them in TikTok Ads Manager.
- Raising a budget past its guardrail. It recommends; the person decides.
