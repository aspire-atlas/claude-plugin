# Aspire Atlas plugin

Onboarding for the Atlas platform (https://atlas.aspire.io). Takes a new or returning user from "not connected" to first insights on their brand's social accounts.

## Install

In Claude Code:

```shell
/plugin marketplace add aspire-atlas/claude-plugin
/plugin install aspire@aspire-atlas
```

The repository [README](https://github.com/aspire-atlas/claude-plugin#readme) covers the Claude app and the beta channel.

## Components

| Component | Name | Purpose |
| --------- | ---- | ------- |
| MCP server | `Aspire Atlas` | Atlas data connection at `https://atlas.aspire.io/mcp` (HTTP, OAuth). Tools appear as `mcp__Aspire_Atlas__*`. |
| MCP server | `Aspire Atlas Organization Admin` | Support only. Organization members at `https://atlas.aspire.io/mcp/admin-organization` (HTTP, OAuth). Tools appear as `mcp__Aspire_Atlas_Organization_Admin__*`. Used only when someone asks; every invite is confirmed. |
| MCP server | `Meta Ads` | Optional. Meta's hosted ads MCP server at `https://mcp.facebook.com/ads` (HTTP, OAuth with Facebook through Aspire's Meta app). Run by Meta, not Aspire. Tools appear as `mcp__Meta_Ads__*`. |
| Skill | `/aspire:aspire` | Six phase onboarding flow: connection check, auth and org selection, org status, profile and social connect, brand context capture, first insights |
| Skill | `page-standard` | Shared by the agents, not a command. The parts every published page holds and the R1 to R12 reader checks it passes before it is published |
| Skill | `/aspire:org-admin` | Support only. Lists organization members and pending invitations and sends confirmed invitations when someone asks. Uses Aspire Atlas Organization Admin |
| Mod | Band above the prompt | Claude Code terminal and desktop app, from 4.0.0; elsewhere the skill shows its progress another way (see the surface table below). Once `/aspire` runs: a progress bar (`Aspire: {organization}`, onboarding progress, percent), then turn, response speed, Atlas token costs from `get_status`, and context fill. See [Band and agents panel](#band-and-agents-panel-claude-code). |
| Mod | `/aspire-agents-info` | Claude Code only, from 4.0.0. Shows or hides the Aspire agents panel: running and finished agents with model, context fill, and time. `/aspire-agents-info status` says whether the mod is on, what switched it on, and what it has seen. |
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
| Agent | `atlas-creator-negotiation` | Offers, counters, renewals, and deal changes for program creators, priced from the fee calculator, the program's standard terms and ceilings, and the creator's own results. Recommends one move per creator with the math, sends anything over the limits to you, records agreed deals, and gives a terms summary for the agreement. Interactive, or on an Editor's approval on the Next actions page for deals within the program's limits. |
| Agent | `atlas-product-fulfillment` | Picks a product per creator from the program's catalog, drafts details requests, keeps a team-only order form for sizes and shipping, places orders in a connected store after a confirmation or gives an order sheet, and tracks shipping and arrival. Interactive, plus an optional daily shipping check that records nothing. |
| Agent | `atlas-affiliate-manager` | Plans one code per affiliate creator and creates them in a connected store after a confirmation or on a code sheet, then reports each month's orders, revenue, and commission from the store or an uploaded export, with sales drawn against each creator's posts. Interactive, or on an Editor's approval on the Next actions page. |
| Agent | `atlas-content-library` | One searchable library of creator content about the brand: program creators' posts, tags, mentions, and tracked hashtags, tagged by product, format, hook, ad readiness, and safety, with the rights on record and the usage from each deal, what's cleared for ads, and what expires soon. Schedulable weekly. |
| Agent | `atlas-content-sourcing` | Requests usage rights on posts worth reusing, renews rights before they expire, and commissions new content from program creators with a shot list, specs, and a due date. Records each grant with where it was given and when it ends. Interactive, or on an Editor's approval on the Next actions page. |
| Agent | `atlas-deliverable-tracker` | Checks every creator's agreed posts against what went live: on time, the right format, disclosure, and the required tags or codes. Drafts chases, fix requests, and thank-yous. Interactive, plus an optional daily posting check. |
| Agent | `atlas-roster-manager` | Reviews the program's roster: quota delivered, results against each creator's own baseline, cost, sales, and responsiveness. Groups creators into rebook, renew, re-engage, or retire, lists renewals due, and hands top creators to discovery as lookalikes. Interactive, or on an Editor's approval on the Next actions page. |
| Agent | `atlas-program-ledger` | Records what the program owes creators (fees, commission, rights, product cost), the invoices and payments you paste or upload, and the budget used and left, per currency. Exports a finance CSV. Record only: it never pays and never keeps bank or tax details. Interactive, or on an Editor's approval on the Next actions page. |
| Agent | `atlas-org-dashboard` | The live page a bare `/aspire:aspire` opens: your organization's profiles and channels, a setup checklist, recent post performance, every program and campaign, your goals, and the one next step, shaped for your role. Reads Atlas through each viewer's own connection with a snapshot fallback. One shared page per brand, or your own copy. Shows and recommends only. |
| Agent | `atlas-program-dashboard` | One page for the whole program: goals and pace, the creator funnel, posts delivered, content and rights, results, spend and return, roster health, and what needs attention next. Money shows only to the team's editors. Schedulable weekly. |
| Agent | `atlas-campaign-orchestrator` | Works out what to do next across every program, creator ad campaign, discovery campaign, and report, ranked on one Next actions page. Editors approve proposals on the page; the hourly run saves the approved records and mailbox drafts and reports in Slack. It never sends, orders, or changes a store. Runs hourly. |
| Agent | `atlas-shops` | A setup and management plan for an Instagram Shop, a TikTok Shop, or both: a readiness checklist, the step order and where each step is done, a catalog and content plan from the brand's best product posts, creators Atlas already holds matched to shop roles (TikTok Shop affiliate invites, LIVE, Instagram product tagging, partnership ads), a running cadence, and the policy and dropshipping risks. Platform rules are hedged and point to Commerce Manager and Seller Center. Reads a connected store's products and stock only and never changes a shop or store. Interactive only. |
| Agent | `atlas-quality-review` | Checks a finished page, deck, or document before it is shared: any page the plugin publishes, or a pitch, proposal, brief, or report made elsewhere (Google Slides or Docs, a Drive file, .pptx, .pdf, or a Claude artifact link). Marks every brief requirement and every check pass or fail, including the reader standard (answer first, numbers with context, owned next steps, decisions kept separate, plain language) and media and links (timecodes, images, in-page links), quotes every finding with the fix, recomputes the work's own sums, checks who can and cannot see each figure (live reads, other connectors, tools a reader can't reach, private links), optionally re-checks cited Atlas figures read only, and gives a verdict: Ready, Ready with fixes, or Not ready. Writes nothing to Atlas and never edits the work. Interactive only. |

**Agent models.** To save tokens, `/aspire` runs the agents that read, tally, draft, or publish on Sonnet: the profile analyst, ad reuse, creator profile, creator discovery, the daily and weekly insights reports, market signal, outreach, product fulfillment, affiliate manager, content library, content sourcing, deliverable tracker, roster manager, program ledger, both dashboards, and shops. The nine that judge brand safety from video frames, price deals, rank next actions, write for leadership, or decide whether work is ready to send run on the model your session uses: post analysis, content review, creator vetting, creator negotiation, creator brief, PPA pitch, quarterly signal, the campaign orchestrator, and quality review. `/aspire` says which model an agent started on in one line; say "use Opus" to run it again on a bigger model. Scheduled runs use the same tiers without asking. The table is in the skill's **Model tiers** section and in each agent's `model:` line.

## Setup

1. Install the plugin. The Aspire Atlas, Aspire Atlas Organization Admin, and Meta Ads connectors are bundled; do not add any of them again as a custom connector.
2. Start a new chat with Aspire Atlas enabled, sign in when prompted, and type `/aspire:aspire`.

No environment variables are required. Authentication is handled by each connector's OAuth flow. Aspire Atlas Organization Admin only needs a sign in when someone lists or invites members; onboarding and every other flow use Aspire Atlas alone. Meta Ads is optional and only needs a Facebook sign in if you want Meta's ads tools; it shows as needing authentication until then.

On a Team or Enterprise plan, a Claude workspace admin adds each bundled connector once for the team: Customize, then Plugins, then Aspire Atlas, then the Connectors tab, then **Add for your team**. Until that's done, `/aspire:org-admin` explains the step instead of listing members. For Meta Ads, read the next paragraph before adding it.

Meta Ads signs in through Aspire's Meta app. Claude Code reads the app's client ID from the plugin. Claude on the web (claude.ai) and Cowork do not. If the workspace already has a custom connector for `https://mcp.facebook.com/ads`, remove it first: the plugin attaches to an existing connector with the same URL and uses that connector's settings. Then, when you add Meta Ads for your team, keep **Use your own OAuth client** selected, enter `2875840562772069` as the OAuth client ID, and leave the client secret blank. Don't choose **Register automatically**: it signs in through Meta's own app instead of Aspire's.

Plugin skills are namespaced, so the canonical command is `/aspire:aspire`. The skill also triggers on `/aspire` and on the phrases below. If Aspire Atlas is installed but off in the current chat, or not signed in, the skill detects it and walks the user through turning it on and connecting.

## Usage

- Every request has two users: the person asking and the person who will act on the output. The skill reads the ask for who that is (a product review, a QBR, an edit brief, a launch plan), confirms it in one line, and every agent shapes its page and summary for that reader, ending with a short note the requester can forward. The numbers never change between readers; only what leads and how it is worded.
- `/aspire:aspire` runs the full onboarding, resuming at the right phase for existing organizations.
- Starter guide: once Atlas is connected, an organization that hasn't finished onboarding (no brand profile, no linked account, or no brand context yet) gets a private page that explains /aspire, the jobs it does and who each is for, the setup steps ahead and what each asks, what stays safe, and five prompts to try. Onboarding then continues as usual. Ask "what can /aspire do" any time to see it again.
- Account review: the first-insights phase asks which account to cover - the brand's connected accounts, or a network and handle the user types. A typed handle that Atlas does not hold, or holds from more than 24 hours ago, is fetched through Aspire discovery first; naming the handle is the approval for that fetch.
- `/aspire:aspire polish` (also "improve my prompt") coaches a weak ask: it names what is missing in a short verdict, asks the two gaps that matter most, and rewrites the prompt with `[placeholders]`. It also runs on its own before a flow launches when an ask is missing key inputs, so a vague ask like "find me people" is tightened first without `polish`. Say "just run it" to skip it. It never runs in scheduled runs or for routine asks, and it writes nothing to Atlas.
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
- Shops: "set up Instagram Shop", "sell on TikTok", "TikTok Shop affiliates". Asks which shop and where the brand is with it, then publishes a plan: what's ready and what to confirm in Commerce Manager or Seller Center, the steps in order, the posts to tag and the videos to make shoppable, the creators to invite, and a weekly and monthly routine. Your team does each step in the platforms; the plan never signs in to them, never asks for business documents or payout details, and never changes your store. It states a platform fee or threshold only from the platform's own page, with the date checked. Saving the plan to Atlas is confirmed first.
- PPA pitch: "build a PPA pitch", "casting deck for partnership ads", "the pitch for round two". A questionnaire pre-filled from what Atlas already knows (products, earlier pitches, the shortlist, vetting calls, hook patterns, rate card) covers the frame, the product groups and schedule, the casting profile, the lanes and the creator for each, production and rights, and cost. The deck is published as an artifact of 16:9 slides to review in chat, then exported to PowerPoint with the session's PowerPoint skill, ready to open in Google Drive as Google Slides (or built natively when a Google Slides connector is connected, after a confirmation). Signed in with an Aspire email, it also asks how Aspire's managed services team wants to present it. Package prices are asked each time and never saved.
- Samples: ask about any agent ("what does the vetting agent do?") or type `/aspire:aspire sample`, and the skill offers a sample of the page that agent makes, built from invented data around the most recent US holiday. Samples need no Atlas connection, use sample brands and sample creator handles that can't belong to real accounts, and save nothing. After a sample, the skill asks whether to run the agent for your brand.
- Quality review: `/aspire:aspire quality review`, "review this deck", or "is this ready to send". Paste a link or attach a file (a Google Slides or Docs link, a Drive file, a .pptx, .pdf, or .docx, or a Claude artifact), say who will read it and whether it should answer a brief or RFP. The review page gives a verdict (Ready, Ready with fixes, Not ready), scores each requirement, lists strengths and findings worst first with the quote, why it matters, and the fix, shows where the work's numbers disagree or don't add up, flags data some readers can't see (live pages, figures from other connectors, private tools and links), and mocks up the biggest fixes. After any agent publishes a page, the skill offers a quality review before the decision audit. It reads only and writes nothing to Atlas.
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

The discovery agent runs on its own two schedules, set from `campaign:{slug}-cadence`: a discovery run that refills the shortlist, and a shortlist run that republishes and delivers it. Same prerequisites as the readouts, plus campaign setup completed once for that campaign. Name the tasks `Atlas creator discovery: {brand} - {campaign}` (discovery) and `Atlas creator shortlist: {brand} - {campaign}` (shortlist). Tasks with the older names `Atlas creator discovery` and `Atlas creator discovery digest: {brand} - {campaign}` still run as discovery and shortlist.

Discovery prompt:

```
Run the Atlas creator discovery for {brand}, campaign {campaign-slug} (handles: {@handle1 on
instagram}). Use the Aspire Atlas connection, find {brand}'s Atlas profile by name, and use the campaign's saved calibrations for the
criteria, pool target, and delivery routing. Launch the atlas-creator-discovery agent in
unattended mode with job discover to fill the shortlist back to target. Do not ask questions. Do not record
any accept or reject verdict; only a person decides. Do not state today's date in the launch
message; the agent reads the current date from the shell clock in the campaign's saved
timezone. If setup is incomplete or Atlas needs a fresh sign in, publish the "setup needed"
card and stop. Deliver only to the destinations saved in the campaign routing.
```

Shortlist prompt: the same text, with "with job discover to fill the shortlist back to target" replaced by "with job shortlist to re-score the current shortlist and republish it without adding candidates".

Unlike the readouts, a scheduled discovery run does start discovery work in Atlas and the creator marketplace. Setting the cadence is what approves that, and it is the only scheduled run in this plugin permitted to do it. Pause the discovery task to stop it.

## Other services this plugin works with

Aspire Atlas works alongside other apps and services you already use. The plugin bundles Aspire's own connectors and, as an optional extra, Meta's ads MCP server (Meta Ads), which Meta runs under its own terms. It reaches everything else through connections, tools, and accounts you set up and control, and each of those services has its own terms and privacy policy.

| Service | What the plugin uses it for | When |
| ------- | --------------------------- | ---- |
| Instagram (Meta), TikTok, YouTube | You sign in to link your brand's accounts, and Atlas reads their posts and stats. | When you connect an account |
| Slack | Posts the readout, market signal, or shortlist headline and a link to the channel you choose. Needs your own Slack connection in Claude. | Readouts, market signal, and creator discovery, only if you add a channel |
| Email (for example Gmail) | Sends the readout, market signal, or shortlist summary to the people you list. Needs your own email connection in Claude. | Readouts, market signal, and creator discovery, only if you add recipients |
| Web search and public websites | Researches your brand's public footprint, finds creators, checks creator fee benchmarks when you set up the fee calculator, reads your website's colors, fonts, and logo, and checks Instagram's and TikTok's own pages for current shop requirements. Findings are shown to you before anything is saved. | Onboarding, creator brief and discovery, brand theme, shops plan |
| Email (Gmail, Outlook, Microsoft 365) for program outreach | Creates outreach, follow-up, and request drafts in your mailbox, and, only if you turn it on, reads replies from creators on the program's roster. Sends a message only when you ask in that session and confirm the recipients. Needs your own mail connection in Claude. | Influencer program flows |
| Your store (Shopify or another commerce connection) | Reads products, stock, orders, and discount codes; creates discount codes and product orders only after a confirmation each time. The shops plan only reads products and stock. Needs your own store connection in Claude. | Product fulfillment, affiliate codes, and the shops plan |
| Instagram Shop (Meta Commerce Manager) and TikTok Shop (Seller Center) | The shops plan tells your team what to set up and check there. The plugin never signs in to them or changes them. | Shops plan |
| Google Fonts | Checks whether your brand's fonts are available and loads them on published pages. | Brand theme |
| Claude pages and scheduled tasks | Publishes briefs, readouts, shortlists, reviews, market signal, ad reuse, and quarterly pages, and runs readouts, the market signal, and discovery on the schedule you set. | Pages and schedules you create |
| Tools on your computer: Python 3 with Pillow, ffmpeg, OpenCV, and on a Mac, Swift and `sips` | Shrinks images so they fit on pages and cards, reads your website's theme, and pulls still frames from videos for content review. The plugin uses whichever of these is already installed and never installs anything. | Pages, creator cards, brand theme, content review |

Nothing goes to Slack or email unless you saved that destination during setup. Anything you send to those services leaves Atlas and falls under that service's policies.

Instagram, Meta, TikTok, YouTube, Slack, Gmail, Google Fonts, and the other names above are trademarks of their owners. They're listed here to explain what the plugin does. Listing a service doesn't mean it endorses Aspire or this plugin.

## Scheduling the orchestrator

`/aspire:aspire next` sets up the orchestrator and offers its hourly task after the first run. The manual path: create a scheduled task named `Atlas next actions: {brand}`, repeating hourly in the hours saved in setup, with the prompt below. Same prerequisites as the readouts, plus Slack enabled for scheduled tasks when a channel is saved.

```
Run /aspire:aspire next for {brand} as the unattended hourly run. Use the Aspire Atlas
connection, find {brand}'s Atlas profile by name, and use the saved orchestrator records. Do
not ask questions. Read the date and time from the shell clock in the saved timezone; do not
trust any date in this prompt. Carry out only what an Editor approved on the Next actions page,
within the saved execution policy. Never send a message, place an order, or change a store.
If setup is incomplete or Atlas needs a fresh sign in, publish the "setup needed" card and stop.
Post only to the Slack channel and people saved in the orchestrator routing.
```

Anyone you share the Next actions page with as an Editor can approve. Approved records and mailbox drafts are written by the hourly run under the account that owns the task, so share the page only with people who should decide. Pause the task to stop it.

## Safety rules

- Every action that changes Atlas state is confirmed through a multiple-choice question first, never plain text. The one exception is the orchestrator's hourly run: an Editor's approval on the Next actions page stands in for the question, and covers only Atlas records and mailbox drafts. Deals over a maximum, over budget, outside the standard terms, or changing the deal type still need you in a session.
- Destructive actions (`delete_profile`, `unlink_channel`, superseding or retracting a calibration, removing hashtags, changing the brand instruction) each get their own confirmation with the safe option first, and never run during onboarding on the skill's own initiative.
- Scheduled (unattended) runs never ask questions, never run destructive tools, and deliver only to destinations saved during setup. The one exception to the no-discovery rule is `atlas-creator-discovery`: its saved cadence record is the standing approval to search Atlas and the creator marketplace on every run, including scheduled ones. Every other scheduled run starts no discovery work. Content review and post analysis never run unattended. Incomplete setup produces a "setup needed" page, not a guess.
- Influencer program flows draft every message and never send one unless you ask in that session and confirm the named recipients. Mailbox drafts, discount codes, and store orders each need their own confirmation, and scheduled runs never send or change your store. They create mailbox drafts only when an Editor approved them on the Next actions page. Creator addresses stay on the team's order form and in Atlas. Everyone the order form is shared with sees every address, so share it only inside your team; creators send their details by reply, never through the form.
- The tool surface is re-verified per release; unlisted tools that change state are treated as destructive until documented. See `skills/aspire/references/atlas-tools.md`.

## Band and agents panel (Claude Code)

From 4.0.0 the plugin includes a Claude Code mod built on function hooks, an early-access Claude Code API (tested on Claude Code 2.1.295 and 2.1.299). It does nothing until an Aspire event in the session: a prompt typed as `/aspire` or `/aspire:aspire`, the aspire skill running (or reporting progress), an Aspire Atlas connector tool answering, or an `aspire:*` agent starting. It goes back to sleep after `/clear`. Several events count because one is not enough everywhere: in sessions the Claude desktop app starts, Claude Code passes the skill's own prompt event over installed plugins, so there a typed `/aspire` is seen as the prompt itself. Then:

- **Progress bar above the prompt**: `Aspire: {organization}`, a bar with the step in progress, the percent complete, and the Aspire crab, adapted from savvy-progress. On the desktop the title's dot and the crab are small drawings (the dot in Aspire teal, green once finished; the crab animated, drawn at random from the agents' crabs once per run) and the percent and `×N` are buttons: press either to show or hide the agents panel. A button holds only text, so the terminal shows the plain ● and 🦀 glyphs instead. The organization is the selected one in the latest Atlas `get_status` result; with several organizations and none picked yet, the label is just `Aspire`. The `/aspire` skill moves the bar through the mod's `aspire_progress` tool (`mcp__aspire__aspire_progress`, main session only; a subagent's call is ignored), one step per onboarding phase, and for any other flow its own steps (`tasks`), so the bar never shows onboarding's steps for a different flow. The same tool takes one optional field, `coach` (`{ verdict, step? }`: a one-line verdict of at most 140 characters and an optional round label of at most 30), which draws the prompt coach card above the bar, above the queued notice when both show: on the desktop a branded row with the Aspire crab in Aspire teal (light and dark, motion off under reduced motion), on the terminal one line, `Prompt coach: {verdict}`. `coach: null` or `finished: true` clears it, a new title or `/clear` clears it, and it clears itself after five minutes without a new report. Text is stripped of control characters and clipped, and a call from a subagent is ignored. A task whose title equals an `aspire:*` agent's description is marked done when that agent finishes. With no report at all, the agents that ran are the steps (done out of started). Until it reports, the bar shows a baseline from `get_status`: onboarding checkpoints done out of 6, where 1 is Atlas answered, 2 an organization picked, 3 a brand profile exists, 4 a channel is linked, and 5 (brand context) and 6 (first insights) come only from the skill's reports. Once the skill reports, its count wins.
  When the agent keeps its own task list (`TaskCreate`/`TaskUpdate`, `TodoWrite`, or the desktop app's own plan tool), the bar follows those steps instead, as in plain-view: `Step 2 of 4`, filled by the done steps plus an estimate for the one in flight (its tool calls against the average of the finished steps, 4 before any, never past 95%), and `All done` at the end. The skill's own report still wins while it runs and carries tasks of its own; a bare report (a title and a count) gives way to the agent's steps. The panel's **Progress** section shows the whole view: the request and the time, the step bar, a row and a bar for each step (`Done`, `~40%` with what the call is doing, `Next`, `Up next`; a long plan shows the five around the current one), and, once the turn ends, `All done`, `took 1:47`, and the files changed and read. An agent that keeps its own list (`TaskCreate`/`TaskUpdate` or `TodoWrite`) gets its steps and a bar on its row in the panel the same way, and that list wins over `aspire_step`. The mod only reads these calls; it never asks for a list or changes a prompt, so a session whose agent keeps none shows the baseline or the skill's report.
- **Band above the prompt**, the bar's second row: the turn number since `/aspire`, the speed of the last response, Atlas token costs (`Atlas tokens: used / limit`), and the context fill. The Atlas figure comes only from the latest Atlas `get_status` result. Without one the Credits card stays blank, never an estimate and never Claude's own usage. `✕` hides the bar and the band for the session; `/aspire-agents-info band` brings them back.
- **Aspire agents panel**, a stack of collapsible cards in the style of Claude's own sidebar; each header opens and closes its card. **Progress** is the bar from above (it follows what Atlas shows, an organization, a profile, a channel, until the skill reports its own steps). **Credits** is the organization's balance. **Running** and **Finished** list every `aspire:*` agent, plus any other subagent started after the mod switched on, with model and effort, context fill, and time. One card per group of agent types (collapsed at first) shows a crab row for each type the plugin ships, with a costume per group and a marker for the ones that ran or are running this session; pressing one drafts its start in the prompt. The roster lives in `hooks/roster.ts`, kept by hand beside `agents/`, because the mod makes no file calls. It opens by itself once, when the first `aspire:*` agent starts. `/aspire-agents-info` shows or hides it, and `/aspire-agents-info open` brings it forward. An agent that calls `aspire_step` (`mcp__aspire__aspire_step`, agents only) shows its own steps, such as `2/5 reading posts`, and a bar of them; one that does not shows its context fill in grey, and its open row says what its latest tool call is doing and how many calls it made (a count and a few words from calls that already pass through the session). An agent only draws steps when it keeps a task list or calls `aspire_step`; the agent files ask for one, but the mod never makes an agent report. It shows no cost, because Atlas does not report token costs per agent. The command is not `/aspire agents`, which lists the plugin's agents and starts one.
- **Branded sites**: once `/aspire` runs, the mod puts the Aspire mark on the sites Claude Code draws itself. An Atlas tool call's row and a collapsed run of Atlas calls show the mark (the twin-comet spinner while a call runs; a small cell mark in the terminal). The question dialog shows the mark and the flow's current step above Claude Code's own dialog. The spinner adds "Aspire Atlas" and the step after its word, the line that closes a turn says where the flow stands, the hint under an idle prompt adds `/aspire help`, and `/aspire-agents-info` output carries the mark. Each is display only and leaves Claude Code's drawing in place. The spinners in `assets/` (comet, twin, wave, snake, ripple) take `--spinner-bg`, `--spinner-color`, `--spinner-glyph` (and `-light` forms), or the page's `--brand`.
- **Characters**: the panel's pixel crabs. Each `aspire:*` agent wears its own influencer-marketing costume (a selfie phone, a megaphone, a clapperboard, a crown, and so on, 24 in all), and a second concurrent run of the same agent wears one of 7 variants (podcast mic, camera, unboxing, hashtag, like, sunglasses, trophy), so two runs are told apart. Other subagents keep the model and effort costumes from the mod this is adapted from. The costumes are in `hooks/costumes.ts` (cells in a small palette, plus a motion each); the rest of the cast is the `CHARACTERS` table in `hooks/characters.ts`.

- **Checking it**: `/aspire-agents-info status` prints whether the mod is on, what switched it on and when, how many Aspire events it has seen (typed `/aspire` prompts, Skill tool calls, progress reports, Atlas results, agents), the last `get_status` reading, what the bar shows, whether the band has been drawn on this surface, and the Claude Code version and surface. It works before `/aspire` too, so it shows whether the mod loaded at all.

The mod reads only what already passes through the session and makes no network, file, or process calls; see [SECURITY.md](../../SECURITY.md). Its tests run with `claude plugin test plugins/aspire`.

### What each hook does

- **Tools the mod answers itself.** The mod registers two tools of its own, `aspire_progress` (the `/aspire` skill's progress, main session only) and `aspire_step` (an agent's own steps, agents only), and its `tool.call` hooks on those two names return the answer, because no other tool stands behind them. The answer is a short status line (`ok: …; band: visible on …`, or `ignored: …` for a call from the wrong place). No other tool is answered by the mod: every other `tool.call` hook passes the call on and returns what Claude Code gives back.
- **Prompt hooks.** `prompt.submit` reads whether the submitted prompt starts with `/aspire` or `/aspire:aspire` and, if it does, switches the mod on and counts it. `session.receive` reads a subagent's or peer session's hand-back text for claude.ai artifact links and logs each new one as a dim line. Both pass the prompt or message on unchanged; neither edits, adds to, or drops it.
- **Agent hook.** `agent.spawn` lets the agent start first, then reads its type, description, and model to add a row to the agents panel (and switches the mod on for an `aspire:*` agent). It changes nothing about the agent: its prompt, instructions, tools, settings, and model are passed on as they came, and a denied start is left denied.
- **Credentials.** No part of the plugin reads a token, API key, or other credential from your machine, its environment, or its files. Each connector signs in with its own vendor through Claude's OAuth flow (Aspire Atlas with `atlas.aspire.io`, Meta Ads with Meta), and Claude holds the result. The Meta Ads client ID in `.mcp.json` is the public ID of Aspire's Meta app, not a secret. The skill's mentions of tokens are Atlas token costs, an expired connector sign-in, and design tokens for page styling.

### Where progress shows

The bar and band draw only where the host renders the slot above the prompt. The `aspire_progress` result ends with `band: visible on {surface}`, `not-drawn`, `hidden-by-user` or `unknown`, and the skill picks its channel from that, once per run. Where the bar is not drawn (and not hidden by you), the mod shows the same progress as one line under the prompt (`Connecting: step 2 of 4, Get organizations ▰▰▱▱ 50%`) and clears it when the run finishes or the bar appears. When an `aspire:*` agent's hand-back mentions a claude.ai artifact link (a subagent's publish draws no card in the main transcript), the mod logs one dim line per new link, `◆ Aspire · Artifact published: {link}`.

| Surface | Progress shows as |
| --- | --- |
| Claude Code, terminal | The bar |
| Claude Code, desktop app | The bar |
| Cowork, desktop app | The Cowork task list |
| Cowork, phone or web (untested) | The Cowork task list |
| claude.ai chat (skill only, no plugin hooks) | One progress line per phase |

Dismissing the bar with `✕` starts no fallback. `/aspire-agents-info status` adds a `Band:` line: how many times the slot has been drawn and on which surface, or that it never was.

### Atlas token costs

The band's `Atlas tokens: used / limit` figure shows what your organization has used in the current period, read from the latest answer Atlas gives to `get_status`. When Atlas doesn't report token costs for your organization, the figure stays blank: the mod never estimates it and never shows Claude's own usage in its place. The fields the mod reads are documented in `types/index.d.ts`.

### Third-party code

The progress bar, the band, and the panel are adapted from the savvy-progress and session-band mods in [claude-kit](https://github.com/johnnyvizz/claude-kit), Copyright (c) 2026 johnnyvizz, under the MIT License. The MIT notice is kept at the top of `hooks/register.tsx` and `hooks/characters.ts`; `hooks/format.ts` and `hooks/progress.ts` point to it. The steps behind the bar (`hooks/plan.ts`) and the Progress section's view are adapted from [plain-view](https://github.com/ice-lfernandes/claude-code-mods/tree/main/plain-view) in claude-code-mods, Copyright (c) 2026 Lucas Fernandes, under the MIT License; that notice is also at the top of `hooks/register.tsx`. MIT code can ship inside this Apache-2.0 plugin as long as that notice stays with it.

## Changes

See the repository [CHANGELOG](../../CHANGELOG.md). Official releases are tagged `v<version>`; the beta channel tracks the `develop` branch by commit.
