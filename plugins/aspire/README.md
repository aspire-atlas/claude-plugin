# Aspire Atlas plugin

Onboarding for the Atlas platform (https://atlas.aspire.io). Takes a new or returning user from "not connected" to first insights on their brand's social accounts.

## Components

| Component | Name | Purpose |
| --------- | ---- | ------- |
| MCP server | `Aspire Atlas` | Atlas data connection at `https://atlas.aspire.io/mcp` (HTTP, OAuth). Tools appear as `mcp__Aspire_Atlas__*`. |
| MCP server | `Aspire Atlas Organization Admin` | Support only. Organization members at `https://atlas.aspire.io/mcp/admin-organization` (HTTP, OAuth). Tools appear as `mcp__Aspire_Atlas_Organization_Admin__*`. Used only when someone asks; every invite is confirmed. |
| Skill | `/aspire:aspire` | Six phase onboarding flow: connection check, auth and org selection, org status, profile and social connect, brand context capture, first insights |
| Skill | `/aspire:org-admin` | Support only. Lists organization members and pending invitations and sends confirmed invitations when someone asks. Uses Aspire Atlas Organization Admin |
| Agent | `atlas-profile-analyst` | Analyzes an account handle the brand manages and ideates next week's content pushes: cadence, engagement, top posts and what they share, format mix, rate benchmarks against competitors Atlas indexes, then three pushes with day, format, angle, and target. Runs for first insights in Phase 6 and any time after. Also reviews any public Instagram or TikTok handle the user names, resolving and refreshing it in Atlas when the held data is over a day old. |
| Agent | `atlas-ad-reuse` | Ranks the brand's and creators' videos on the hooks that work as ads (hook by 3 seconds, brand by 3 seconds, works without sound, retention, standalone segment, ready for paid) and publishes a cut list with timestamps, lengths, placements, and rights status for performance and creative. Reads only what Atlas holds |
| Agent | `atlas-creator-profile` | Full-page profile of one Instagram or TikTok creator: the creator card at full width, audience, top and lowest posts, engagement, sentiment, brand safety, partnerships, recommended fees from the fee calculator, peers, and next steps. Refreshes the handle in Atlas when the held data is over a day old. Publishes a page and writes nothing to Atlas |
| Agent | `atlas-creator-discovery` | Standing creator shortlist for one campaign: fills a pool of undecided candidates to a saved target in tier order (worked with the brand, posted about the brand, lookalikes of the creators already delivering, indexed in Atlas, marketplace and web), scores each with evidence, republishes one living page, and keeps decisions in Atlas. Schedulable. |
| Agent | `atlas-creator-vetting` | Vets a list of creators from a CSV export from Aspire, pasted handles, or the Aspire app: brand fit against the saved criteria, a brand safety review per creator (industry categories, red lines, competitor partnerships, disclosure, audience signals), and Approve, Maybe, or Reject with evidence. Publishes a page, saves the recommendations as insights, and saves the team's call on each creator so future vetting and discovery use it. Interactive only. |
| Agent | `atlas-content-review` | Reviews one creator draft or published post against its brief: brief adherence, brand guidelines, and brand safety, each check with evidence. Gives a verdict and edit notes the team can forward to the creator, publishes a review page, and learns from the team's feedback on every review. Interactive only. |
| Agent | `atlas-post-analysis` | One published Instagram or TikTok post in depth, for a brand deciding whether to sponsor, partner with, or reuse it: reach with organic and paid boost apart, content scores, every brand on screen timed with frame stills, brand safety with each profanity instance timed and attributed, sponsor disclosure, people on screen and reuse rights, the account's baseline, and what it means for the brand. Refetches the post, publishes a page, and saves findings to Atlas when approved. Interactive only. |
| Agent | `atlas-creator-brief` | Content creation brief for a week or a dated campaign: reviews recent posts and the latest market signal and readout findings, sets deliverables and guardrails, takes first picks from the campaign shortlist or sources creators through Aspire discovery, prices each engagement, publishes a visual brief. Campaign mode works the timeline back from the launch date |
| Agent | `atlas-daily-insights-report` | Daily insights: what yesterday's posts tell the team against the 28-day baseline, the breakouts and misses and why, red-line hits, follower delta, what changed since the last report, each turned into a next step, and a launch pulse while a campaign window is open. Compact page, Slack and email delivery, findings saved to Atlas. Schedulable. |
| Agent | `atlas-weekly-insights-report` | Weekly insights: the patterns behind last week's results against the prior week and 8-week median, why the top and bottom posts landed where they did, format and cadence mix, open action items, three ranked next steps. One section per saved reader: the social team, leadership, product (parity), product marketing (messaging), and growth (creator and format efficiency). Visual page, Slack and email delivery, findings saved to Atlas. Schedulable. |
| Agent | `atlas-market-signal` | What creators say about the brand compared with its saved competitors: share of voice (organic and paid apart), features compared and where the brand won or lost, friction, spreading language, and the comparison videos with the strongest openings. One run renders a parity read, a messaging read, reuse candidates, and a brief update. Page, Slack and email delivery, findings saved to Atlas. Schedulable weekly. |
| Agent | `atlas-ppa-pitch` | Casting deck for paid partnership ads: persona lanes per product, one creator cast against each with Meta hook rate, interaction, median views, reach ratio and engagement, a variant set per creator from one shoot, the groups and schedule, what is produced, the rights package, and the investment. Publishes a slide deck as an artifact first, then exports it to PowerPoint and Google Slides on request. Follow-up rounds build on the previous pitch. Interactive only. |
| Agent | `atlas-quarterly-signal` | The quarter's one-page story for leadership: the outcome first, three KPIs against the prior quarter, the trend, headline insights, what the program delivered, and next quarter's priorities, rolled up from the findings already saved in Atlas. |
| Agent | `atlas-creator-outreach` | First messages, follow-ups, and reply sorting for an influencer program: one personal message per approved creator, naming a real post and the offer for their deal type, drafted for email, Instagram or TikTok DM, and Aspire messages. Creates drafts in a connected Gmail or Outlook after a confirmation and never sends unless you ask. Interactive, plus an optional daily reply check that records nothing. |
| Agent | `atlas-creator-negotiation` | Offers, counters, renewals, and deal changes for program creators, priced from the fee calculator, the program's standard terms and ceilings, and the creator's own results. Recommends one move per creator with the math, sends anything over the limits to you, records agreed deals, and gives a terms summary for the agreement. Interactive only. |
| Agent | `atlas-product-fulfillment` | Picks a product per creator from the program's catalog, drafts details requests, keeps a team-only order form for sizes and shipping, places orders in a connected store after a confirmation or gives an order sheet, and tracks shipping and arrival. Interactive, plus an optional daily shipping check that records nothing. |
| Agent | `atlas-affiliate-manager` | Plans one code per affiliate creator and creates them in a connected store after a confirmation or on a code sheet, then reports each month's orders, revenue, and commission from the store or an uploaded export, with sales drawn against each creator's posts. Interactive only. |
| Agent | `atlas-content-library` | One searchable library of creator content about the brand: program creators' posts, tags, mentions, and tracked hashtags, tagged by product, format, hook, ad readiness, and safety, with the rights on record and the usage from each deal, what's cleared for ads, and what expires soon. Schedulable weekly. |
| Agent | `atlas-content-sourcing` | Requests usage rights on posts worth reusing, renews rights before they expire, and commissions new content from program creators with a shot list, specs, and a due date. Records each grant with where it was given and when it ends. Interactive only. |
| Agent | `atlas-deliverable-tracker` | Checks every creator's agreed posts against what went live: on time, the right format, disclosure, and the required tags or codes. Drafts chases, fix requests, and thank-yous. Interactive, plus an optional daily posting check. |
| Agent | `atlas-roster-manager` | Reviews the program's roster: quota delivered, results against each creator's own baseline, cost, sales, and responsiveness. Groups creators into rebook, renew, re-engage, or retire, lists renewals due, and hands top creators to discovery as lookalikes. Interactive only. |
| Agent | `atlas-program-ledger` | Records what the program owes creators (fees, commission, rights, product cost), the invoices and payments you paste or upload, and the budget used and left, per currency. Exports a finance CSV. Record only: it never pays and never keeps bank or tax details. Interactive only. |
| Agent | `atlas-program-dashboard` | One page for the whole program: goals and pace, the creator funnel, posts delivered, content and rights, results, spend and return, roster health, and what needs attention next. Money shows only to the team's editors. Schedulable weekly. |

## Setup

1. Install the plugin. The Aspire Atlas and Aspire Atlas Organization Admin connectors are bundled; do not add either again as a custom connector.
2. Start a new chat with Aspire Atlas enabled, sign in when prompted, and type `/aspire:aspire`.

No environment variables are required. Authentication is handled by each connector's OAuth flow. Aspire Atlas Organization Admin only needs a sign in when someone lists or invites members; onboarding and every other flow use Aspire Atlas alone.

On a Team or Enterprise plan, a Claude workspace admin adds each bundled connector once for the team: Customize, then Plugins, then Aspire Atlas, then the Connectors tab, then **Add for your team**. Until that's done, `/aspire:org-admin` explains the step instead of listing members.

Plugin skills are namespaced, so the canonical command is `/aspire:aspire`. The skill also triggers on `/aspire` and on the phrases below. If Aspire Atlas is installed but off in the current chat, or not signed in, the skill detects it and walks the user through turning it on and connecting.

## Usage

- Every request has two users: the person asking and the person who will act on the output. The skill reads the ask for who that is (a product review, a QBR, an edit brief, a launch plan), confirms it in one line, and every agent shapes its page and summary for that reader, ending with a short note the requester can forward. The numbers never change between readers; only what leads and how it is worded.
- `/aspire:aspire` runs the full onboarding, resuming at the right phase for existing organizations.
- Account review: the first-insights phase asks which account to cover - the brand's connected accounts, or a network and handle the user types. A typed handle that Atlas does not hold, or holds from more than 24 hours ago, is fetched through Aspire discovery first; naming the handle is the approval for that fetch.
- `/aspire:aspire agents` lists every subagent in the plugin with a one-line purpose and its trigger phrases, then asks which one to run and hands off to that agent's flow (connection check, profile, and confirmations included). Read from the `agents/` folder at run time, so it stays current as agents are added. No Atlas connection is needed to see the list; picking an agent starts one.
- Trigger phrases: "get started with Atlas", "connect Atlas", "onboard my brand", "connect my Instagram to Atlas".
- Creator brief: "create a content brief for next week", "find creators to make this", "what should we post next week". Runs the `atlas-creator-brief` agent for a connected brand. Marketplace discovery is only run with the user's explicit choice.
- Creator discovery: "creator discovery", "find creators for the campaign", "refill the shortlist". First use runs a campaign setup where the discovery agent asks what the campaign is, then writes its own refining questions from that answer and the brand's saved context (archetype, networks, size band, market, exclusions), plus pool target, delivery and cadence. Answers are saved per campaign so every teammate and every scheduled run sources against the same definition. Decisions are made in chat against the numbered shortlist; rejected creators never reappear.
- Content review: "review this post", "check this draft against the brief", "brand safety check on this post". The first review runs a four-question setup: what blocks a post, the disclosure rule, brand rules, and how strict the safety screen is. After that, each review asks for the brief, the deliverable, and the post (a draft with its media, or a published link, which Atlas fetches if it doesn't hold it). It ends by asking whether the calls were right. Corrections the user approves are saved as review rules, and the agent proposes hard rules (for example "paid posts carry #ad in the first line") that the user can apply to every future review in the organization. Saved reviews appear in the daily and weekly readouts: verdicts, hard-rule hits, and open edits.
- Creator cards: every creator the plugin shows ("show me @handle", search results, the discovery shortlist, the brief's creators) is drawn with one compact card: profile picture, network chips, badges, brand safety and comment sentiment tiles, key stats, and three recent posts. Sections with no data behind them are left out. In chat the card carries three buttons: Draft Outreach writes a message for review (never sent), Add to list puts the creator on a campaign shortlist, and Save adds them to the brand's watch list ("show my watch list"). Each one asks before writing anything.
- Fee calculator: `/aspire:aspire fee calculator` sets the brand's creator rates, offered once during onboarding. It starts from Aspire's recommended CPM ladder ($40 open, $80 target, $120 max per 1,000 views), with an optional check against current public benchmarks, and lets the team keep it or adjust it. Every fee the plugin shows (creator profiles, briefs, shortlists, outreach drafts) is the median views of a creator's last 10 posts per channel, bundled, times those rates. Carousels and image posts, which rarely carry view counts, are priced from their engagement using the same creator's own views-per-engagement on Reels, and marked as estimated. Where the data isn't there, no price is shown.
- Post analysis: "analyze this post", "what brands are in this video", "should we sponsor this show". Paste the post's link (that approves fetching it); Claude asks who the analysis is for, whether to compare it with the account's recent posts, and whether to save the findings. The page times every brand and every censored word from the video itself, shows where the cleanest trim would fall, checks how the sponsor is disclosed, and lists what a reuse would need cleared. No brief needed; a post checked against a brief is content review.
- Creator profiles: "full profile for @handle" or "show me @handle's portfolio" runs the `atlas-creator-profile` agent, which publishes one page per creator: the card at full width, then audience, top and lowest posts, engagement by post, comment sentiment, brand safety by category, paid partnerships kept apart from organic mentions, recommended fees from the fee calculator, a peer comparison, next steps, and data gaps. Sections with no data behind them are left out.
- Creator vetting: "vet these creators", "which of these should we approve", "go through this Aspire export". Upload a CSV export from Aspire, paste handles, or pull the list from the Aspire app (you sign in yourself). Each creator is checked for fit and brand safety and recommended Approve, Maybe, or Reject. What you say about a creator is saved, so the next vetting and discovery run start from it.
- Readouts: "what happened yesterday", "how did last week go", "weekly readout", "daily readout", "schedule the readouts". First use runs a six-question setup (delivery times and timezone, Slack channel and email recipients, flag thresholds, lead metric, escalation rule, and who reads the weekly: the social team, leadership, product and product marketing, growth, each optionally with its own destination). During a launch, the daily readout adds a launch pulse on how it is landing. Answers are saved to the brand's Atlas memory so every teammate and every scheduled run uses the same setup without re-asking.
- Market signal: "what are creators saying about us vs {competitor}", "share of voice", "are we behind on features". First use asks which competitors, which products or features to track, who reads it, where it lands, and how often. Runs weekly on a schedule and leads with what changed.
- Ad reuse: "pull the best hooks from last month's creator posts", "what should we license for ads", "send creative a cut list". Runs the `atlas-ad-reuse` agent, which ranks videos on hook patterns and publishes a cut list with timestamps, cut lengths, placements, and rights status. Usage rights for creator posts show as not held unless a brief or record says otherwise.
- PPA pitch: "build a PPA pitch", "casting deck for partnership ads", "the pitch for round two". A questionnaire pre-filled from what Atlas already knows (products, earlier pitches, the shortlist, vetting calls, hook patterns, rate card) covers the frame, the product groups and schedule, the casting profile, the lanes and the creator for each, production and rights, and cost. The deck is published as an artifact of 16:9 slides to review in chat, then exported to PowerPoint with the session's PowerPoint skill, ready to open in Google Drive as Google Slides (or built natively when a Google Slides connector is connected, after a confirmation). Signed in with an Aspire email, it also asks how Aspire's managed services team wants to present it. Package prices are asked each time and never saved.
- Samples: ask about any agent ("what does the vetting agent do?") or type `/aspire:aspire sample`, and the skill offers a sample of the page that agent makes, built from invented data around the most recent US holiday. Samples need no Atlas connection, use sample brands and sample creator handles that can't belong to real accounts, and save nothing. After a sample, the skill asks whether to run the agent for your brand.
- Decision audit: after any agent publishes a page, the skill asks whether you'd like an audit of the decisions and tools behind it. The audit page leads with how long the work took from request to finish, split into time waiting on you, agent work, and the rest, then records every step in order with its time: each question with every option offered and the one chosen, each kind of tool call and what it returned, the agent's own judgements and what it dropped, the pages published and their checks, the final decision set, and anything still open. It writes nothing to Atlas.
- Quarterly signal: "how did influencer do this quarter", "QBR". One outcome-first page rolled up from the readouts, briefs, reviews, shortlists, and market signal runs saved in Atlas. Cost efficiency appears only when you give the spend.
- Influencer program: "set up our influencer program", "start an ambassador program", "where is the {program} program". A short setup covers the program's deal types (gifting, paid posts, ambassador, affiliate), goals, budget, standard terms, products, outreach voice and channels, where updates go, and what runs on its own. After that, the program manager shows where every creator is and offers the next step: write first messages, record replies, make offers, collect details and order product, set up codes, check posts, request rights, update payments, review the roster, or update the dashboard. Every message is a draft. A connected Gmail, Outlook, or store is used only after a confirmation each time, and nothing is sent unless you ask in that session. A creator ad campaign stays in the CAS campaign flow.
- Campaign plans: "we launch on the 14th and need creators" proposes the whole sequence in one line: a campaign shortlist, a campaign brief worked back from the launch date, content review of each draft, and a daily launch pulse.
- Brand theme: "set up our theme", "brand our pages", "use our brand colors". Scans the brand's website for its colors, fonts, and logo, shows the findings with sources, then compares the palette as found against three variations on it (Brand-forward, Quiet, Complement), each in light and dark. Palettes that fail contrast checks are never offered. The chosen theme, with its fonts and logo, is saved to the brand's Atlas memory, and every page, chart, and creator card the plugin publishes uses it, including scheduled readouts. Pass, fail, and other status colors keep their meaning. Offered once after onboarding and once before the first page of a session; "Don't ask again" stops the offers.

## Scheduling the readouts

Readouts are designed to run on a schedule. The skill offers to create both schedules after the first successful run; the steps below are the manual path.

**Prerequisites**

- Readout setup completed once for the brand (the skill will not schedule before it).
- Aspire Atlas enabled for scheduled tasks in the Claude app settings. Add Slack and Gmail too if readouts are routed there.
- The scheduled task's approval setting set to "Automatically approve". A scheduled run has nobody present to approve a prompt and will stall otherwise.

**Create the two scheduled tasks (Cowork)**

1. In the Claude desktop app, open Scheduled tasks and choose New.
2. Name the first task `Atlas daily insights report: {brand}`. Set it to repeat daily at the time saved in setup, in your timezone. Paste the daily prompt below with the brand, handles, and networks filled in.
3. Name the second task `Atlas weekly insights report: {brand}`. Set it to repeat weekly on the saved day and time. Paste the weekly prompt below.
4. Turn on completion notifications so the summary reaches your phone.

Daily prompt:

```
Run the Atlas daily insights report for {brand} (handles: {@handle1 on instagram, @handle2 on tiktok}).
Use the Aspire Atlas connection, find {brand}'s Atlas profile by name, and use the brand's saved readout calibrations for the window,
thresholds, lead metric, and delivery routing. Launch the atlas-daily-insights-report agent in
unattended mode. Do not ask questions. Do not state today's date in the launch message; the
agent reads the current date from the shell clock in the brand's saved timezone and reports
yesterday. If setup is incomplete or Atlas needs a fresh sign in, publish the "setup needed"
card and stop. Deliver only to the destinations saved in the brand's readout routing.
```

Weekly prompt:

```
Run the Atlas weekly insights report for {brand} (handles: {@handle1 on instagram, @handle2 on tiktok})
for the previous Monday to Sunday. Use the Aspire Atlas connection, find {brand}'s Atlas profile by name, and use the brand's saved
readout calibrations for thresholds, lead metric, audience, and delivery routing. Launch the
atlas-weekly-insights-report agent in unattended mode. Do not ask questions. Do not state today's date
in the launch message; the agent reads the current date from the shell clock in the brand's
saved timezone and reports the most recent completed Monday to Sunday. If setup is incomplete
or Atlas needs a fresh sign in, publish the "setup needed" card and stop. Deliver only to the
destinations saved in the brand's readout routing.
```

**Changing the schedule or the setup**

- Times, Slack channel, recipients, thresholds, and audience live in Atlas brand memory. Ask the skill to "change readout setup"; each change is confirmed and versioned, and takes effect on the next scheduled run. Then edit the task's time in the Scheduled tasks list if the delivery time changed.
- Pause or delete either task from the Scheduled tasks list at any time. Saved setup is unaffected.

**Claude Code users**: the same two prompts work as scheduled tasks or as manual runs (`/aspire:aspire` then "run the weekly readout"). Local cron inside a session is not supported; it does not survive the session.

## Scheduling the market signal

The market signal runs weekly, ideally an hour before the weekly readout so the readout's product and marketing sections carry this week's run. Same prerequisites as the readouts, plus market signal setup completed once. Name the task `Atlas market signal: {brand}`.

```
Run the Atlas market signal for {brand} (handles: {@handle1 on instagram}). Use the Aspire
Atlas connection, find {brand}'s Atlas profile by name, and use the brand's saved market signal calibrations for the competitors, topics,
readers, and delivery routing. Launch the atlas-market-signal agent in unattended mode. Do not
ask questions. Do not start any discovery. Do not state today's date in the launch message;
the agent reads the current date from the shell clock in the saved timezone and reports the
most recent completed Monday to Sunday. If setup is incomplete or Atlas needs a fresh sign in, publish the "setup
needed" card and stop. Deliver only to the destinations saved in the market signal routing
and readers.
```

## Scheduling creator discovery

The discovery agent runs on its own two schedules, set from `campaign:{slug}-cadence`: a discovery run that refills the shortlist, and a shortlist run that republishes and delivers it. Same prerequisites as the readouts, plus campaign setup completed once for that campaign. Name the tasks `Atlas creator discovery: {brand} - {campaign}` (discovery) and `Atlas creator discovery digest: {brand} - {campaign}`.

Discovery prompt:

```
Run the Atlas creator discovery for {brand}, campaign {campaign-slug} (handles: {@handle1 on
instagram}). Use the Aspire Atlas connection, find {brand}'s Atlas profile by name, and use the campaign's saved calibrations for the
criteria, pool target, and delivery routing. Launch the atlas-creator-discovery agent in
unattended mode to fill the shortlist back to target. Do not ask questions. Do not record
any accept or reject verdict; only a person decides. Do not state today's date in the launch
message; the agent reads the current date from the shell clock in the campaign's saved
timezone. If setup is incomplete or Atlas needs a fresh sign in, publish the "setup needed"
card and stop. Deliver only to the destinations saved in the campaign routing.
```

Shortlist prompt: the same text, with "to fill the shortlist back to target" replaced by "to re-score the current shortlist and republish it without adding candidates".

Unlike the readouts, a scheduled discovery run does start discovery work in Atlas and the creator marketplace. Setting the cadence is what approves that, and it is the only scheduled run in this plugin permitted to do it. Pause the discovery task to stop it.

## Other services this plugin works with

Aspire Atlas works alongside other apps and services you already use. The plugin bundles only Aspire's own connectors. It reaches everything else through connections, tools, and accounts you set up and control, and each of those services has its own terms and privacy policy.

| Service | What the plugin uses it for | When |
| ------- | --------------------------- | ---- |
| Instagram (Meta), TikTok, YouTube | You sign in to link your brand's accounts, and Atlas reads their posts and stats. | When you connect an account |
| Slack | Posts the readout, market signal, or shortlist headline and a link to the channel you choose. Needs your own Slack connection in Claude. | Readouts, market signal, and creator discovery, only if you add a channel |
| Email (for example Gmail) | Sends the readout, market signal, or shortlist summary to the people you list. Needs your own email connection in Claude. | Readouts, market signal, and creator discovery, only if you add recipients |
| Web search and public websites | Researches your brand's public footprint, finds creators, checks creator fee benchmarks when you set up the fee calculator, and reads your website's colors, fonts, and logo. Findings are shown to you before anything is saved. | Onboarding, creator brief and discovery, brand theme |
| Email (Gmail, Outlook, Microsoft 365) for program outreach | Creates outreach, follow-up, and request drafts in your mailbox, and, only if you turn it on, reads replies from creators on the program's roster. Sends a message only when you ask in that session and confirm the recipients. Needs your own mail connection in Claude. | Influencer program flows |
| Your store (Shopify or another commerce connection) | Reads products, stock, orders, and discount codes; creates discount codes and product orders only after a confirmation each time. Needs your own store connection in Claude. | Product fulfillment and affiliate codes |
| Google Fonts | Checks whether your brand's fonts are available and loads them on published pages. | Brand theme |
| Claude pages and scheduled tasks | Publishes briefs, readouts, shortlists, reviews, market signal, ad reuse, and quarterly pages, and runs readouts, the market signal, and discovery on the schedule you set. | Pages and schedules you create |
| Tools on your computer: Python 3 with Pillow, ffmpeg, OpenCV, and on a Mac, Swift and `sips` | Shrinks images so they fit on pages and cards, reads your website's theme, and pulls still frames from videos for content review. The plugin uses whichever of these is already installed and never installs anything. | Pages, creator cards, brand theme, content review |

Nothing goes to Slack or email unless you saved that destination during setup. Anything you send to those services leaves Atlas and falls under that service's policies.

Instagram, Meta, TikTok, YouTube, Slack, Gmail, Google Fonts, and the other names above are trademarks of their owners. They're listed here to explain what the plugin does. Listing a service doesn't mean it endorses Aspire or this plugin.

## Safety rules

- Every action that changes Atlas state is confirmed through a multiple-choice question first, never plain text.
- Destructive actions (`delete_profile`, `unlink_channel`, superseding or retracting a calibration, removing hashtags, changing the brand instruction) each get their own confirmation with the safe option first, and never run during onboarding on the skill's own initiative.
- Scheduled (unattended) runs never ask questions, never run destructive tools, and deliver only to destinations saved during setup. The one exception to the no-discovery rule is `atlas-creator-discovery`: its saved cadence record is the standing approval to search Atlas and the creator marketplace on every run, including scheduled ones. Every other scheduled run starts no discovery work. Content review and post analysis never run unattended. Incomplete setup produces a "setup needed" page, not a guess.
- Influencer program flows draft every message and never send one unless you ask in that session and confirm the named recipients. Mailbox drafts, discount codes, and store orders each need their own confirmation, and scheduled runs never send, draft, or change your store. Creator addresses stay on the team's order form and in Atlas. Everyone the order form is shared with sees every address, so share it only inside your team; creators send their details by reply, never through the form.
- The tool surface is re-verified per release; unlisted tools that change state are treated as destructive until documented. See `skills/aspire/references/atlas-tools.md`.

## Changes

See the repository [CHANGELOG](../../CHANGELOG.md). Official releases are tagged `v<version>`; the beta channel tracks the `develop` branch by commit.
