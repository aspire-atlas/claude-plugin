# Agent launch examples

Reference copies of the `<example>` blocks that lived in each `agents/atlas-*.md` description until the descriptions were trimmed to clear Claude Code's 15k-token agent-description limit. Each block shows a sample user request, the main thread's one-line launch announcement, and a note on what the main thread settled before launching. They document how `/aspire:aspire` hands off to each agent; nothing in the plugin reads this file, and the agents' bodies and trigger phrases are unchanged.

Text is verbatim from `develop` at 1d46556, grouped by agent.

## atlas-ad-reuse

```text
Context: Atlas connected, the ask reads as performance marketing handing off to creative
user: "pull the best hooks from last month's creator posts about us"
assistant: "Launching the atlas-ad-reuse agent for the last 30 days; it will rank licensing candidates for performance and build a cut list with timestamps for creative."
<commentary>
The main thread confirmed the window, the sources, the readers, and the write. The agent reads only what Atlas holds and publishes the cut list page.
</commentary>
```

```text
Context: The market signal listed comparison videos with strong openings
user: "get creative a cut list from those comparison videos"
assistant: "Running the atlas-ad-reuse agent on creators' posts about the brand for the same window, with creative as the primary reader."
<commentary>
A hand-off from the market signal's reuse candidates. The cut list is this agent's job, not the market signal's.
</commentary>
```

## atlas-affiliate-manager

```text
Context: An affiliate program is saved; negotiation recorded five affiliate deals and one hybrid; a Shopify store is connected that can create percentage codes
user: "set up codes for the new affiliates"
assistant: "Launching the atlas-affiliate-manager agent in codes mode; it will plan a code for each of the six creators from your pattern, check them against codes already in use, and propose which to create in Shopify."
<commentary>
The Program manager's "Set up codes" row. The propose pass writes nothing and creates nothing; the main thread asks A1 to A3, then relaunches with the record pass to create the codes in the store and save them.
</commentary>
```

```text
Context: September closed; the brand runs its affiliate links through an affiliate platform and attaches the export
user: "here's September's Refersion export, who drove sales and what do we owe?"
assistant: "Running the atlas-affiliate-manager agent in report mode for September on the export; it will show the column mapping for you to confirm, then sales, commission, and a timeline against each creator's posts."
<commentary>
Report mode from a CSV. The mapping, the save, and the hand-off of commission lines to the ledger are confirmed in the main thread before the record pass.
</commentary>
```

## atlas-campaign-orchestrator

```text
Context: Atlas connected, two programs and one creator ad campaign are running, the orchestrator is set up
user: "what should we do next?"
assistant: "Launching the atlas-campaign-orchestrator agent to plan across both programs, the creator ad campaign, and your reports; I'll show the top action and run it through its own flow."
<commentary>
Interactive `/aspire:aspire next`: the main thread runs the cycle. The agent plans; the main thread asks the Next picker and launches the flow the person picks.
</commentary>
```

```text
Context: Scheduled task "Atlas next actions: Acme Cookware" fires at 10:00 on a weekday
user: "Run /aspire:aspire next for Acme Cookware as the unattended hourly run. Do not ask questions."
assistant: "Running the hourly cycle: carrying out the two approvals on the page, then launching the atlas-campaign-orchestrator agent to plan and republish the Next actions page."
<commentary>
Unattended: the main thread carries out approved items through each flow's record pass, then launches this agent twice, `mode: plan` and `mode: publish`. The agent itself only reads and publishes.
</commentary>
```

## atlas-content-library

```text
Context: Atlas connected, a program "Summer ambassadors" is saved, its creators have been posting
user: "find me unboxing videos of the trail shoe we're cleared to run as paid ads"
assistant: "Running the atlas-content-library agent in query mode on the Summer ambassadors library; it will return the matching videos ranked by ad readiness, with their rights and end dates."
<commentary>
A question about content the brand holds and may use. The main thread confirmed the scope; query mode reads the saved catalog and writes nothing.
</commentary>
```

```text
Context: Scheduled task "Atlas program library refresh: Acme Cookware - Summer ambassadors" fires Monday morning
user: "Run the Atlas content library for Acme Cookware, program summer-ambassadors, using the saved program records. Do not ask questions."
assistant: "Launching the atlas-content-library agent in unattended mode; it will refresh the catalog, republish the library page, and post the expiring-rights alert to the saved routing."
<commentary>
Unattended run: no questions, no rights records written, and catalog findings saved only because the program's saved schedule names the library.
</commentary>
```

## atlas-content-review

```text
Context: Atlas connected, review calibrations saved, a creator brief for this week exists in Atlas
user: "here's @creatorhandle's draft for Thursday's Reel, check it against the brief"
assistant: "Launching the atlas-content-review agent on the draft against Thursday's deliverable; it will check the brief, the brand guidelines, and brand safety."
<commentary>
Draft review: the main thread has already settled the brief, the deliverable, and the media, and confirmed the write. The agent only analyzes.
</commentary>
```

```text
Context: A creator posted yesterday; the user pastes the link
user: "did this one follow the brief? https://www.instagram.com/p/SHORTCODE/"
assistant: "Running the atlas-content-review agent on the published post; it will fetch the post from Atlas and review it against the brief."
<commentary>
Published review: pasting the link is the approval to fetch the post if Atlas does not hold it.
</commentary>
```

## atlas-content-sourcing

```text
Context: The content library just listed five posts worth requesting for the Summer ambassadors program
user: "request rights for those"
assistant: "Launching the atlas-content-sourcing agent in rights mode on the five posts; it will propose usage, channels, duration and fee per post, leave out anything the creators' deals already cover, and draft one request per creator."
<commentary>
The library hands off its worth-requesting list. The propose pass writes nothing; the main thread asks S1 to S4 and relaunches the agent with pass record to save the requests.
</commentary>
```

```text
Context: A rights request went to a creator last week; the user pastes the reply, which came by Instagram DM
user: "@creatorhandle said yes in DMs, go ahead and record it"
assistant: "Running the atlas-content-sourcing agent in replies mode on the DM; it will propose the grant with the DM as its proof, flag it to get in writing before paid use, and draft the confirmation email."
<commentary>
Replies mode never invents a grant: the proof line says where the yes was given, and a DM-only grant is recorded as not in writing.
</commentary>
```

## atlas-creator-brief

```text
Context: Atlas connected, brand profile has a linked Instagram channel with indexed posts
user: "review @brandhandle's recent posts and create a content brief for next week. help me find creators to get it done."
assistant: "Launching the atlas-creator-brief agent to review the last 90 days, draft the week's deliverables, and source creators through Aspire discovery."
<commentary>
The request combines a performance review, a forward plan, and creator sourcing. The agent owns all three so the main thread only relays decisions.
</commentary>
```

```text
Context: Existing brief published last week
user: "run the creator brief again for the week of Oct 5"
assistant: "Running the atlas-creator-brief agent for the week of Oct 5 with the same profile."
<commentary>
Recurring use: same profile, new week. The agent reuses stored calibrations and re-pulls posts.
</commentary>
```

```text
Context: A discovery campaign "feature-launch" is set up; the launch is three weeks out
user: "we launch on the 14th and need creators in it"
assistant: "Launching the atlas-creator-brief agent in campaign mode for the launch on the 14th; it will take first picks from the campaign shortlist and work the timeline back from the first post."
<commentary>
Campaign lens: the main thread confirmed the plan (shortlist, brief, draft reviews, daily pulse) in one line. The brief is one part of it.
</commentary>
```

## atlas-creator-discovery

```text
Context: Atlas connected, campaign calibrations saved, shortlist has 38 undecided candidates against a target of 50
user: "refill the shortlist for the Atlas launch campaign"
assistant: "Running the atlas-creator-discovery agent to add 12 candidates in tier order and republish the shortlist."
<commentary>
The pool is below target and the campaign is already defined, so the discovery agent tops it up rather than starting over.
</commentary>
```

```text
Context: Scheduled task "Atlas creator discovery" fires in a fresh session
user: "Run the Atlas creator discovery for Acme Cookware, campaign spring-launch, using the saved campaign calibrations. Do not ask questions."
assistant: "Launching the atlas-creator-discovery agent in unattended mode; it will discover, re-score, and publish per the saved routing."
<commentary>
Unattended run: no questions, saved calibrations only, discovery allowed by the saved cadence approval, no verdicts recorded.
</commentary>
```

## atlas-creator-negotiation

```text
Context: Atlas connected, a paid program saved, the reply check classed @creatorhandle's reply as a counter
user: "@creatorhandle came back asking $2,800 for the Reel, what do we do?"
assistant: "Launching the atlas-creator-negotiation agent in counter mode for @creatorhandle; it will price the Reel on the fee calculator, check it against your max and their numbers in Atlas, and draft the reply."
<commentary>
The main thread passed the program, the roster row, the reply and the connections. The agent proposes and writes nothing; the main thread asks the move and any your-call question, then relaunches it in the record pass.
</commentary>
```

```text
Context: The roster manager flagged three ambassadors whose terms end next month
user: "sort out renewals for the three ambassadors"
assistant: "Running the atlas-creator-negotiation agent in renewal mode on the three ambassadors from the roster review; it will price next term on their current numbers and draft each renewal."
<commentary>
A hand-off from the roster manager. A raise above the maximum, or a new quota or term length, comes back as the user's call.
</commentary>
```

## atlas-creator-outreach

```text
Context: Atlas connected, the "Summer ambassadors" program is set up, eight creators sit at Approved, Gmail is connected and the program's outreach record says drafts go to Gmail
user: "write first messages to the creators we approved"
assistant: "Launching the atlas-creator-outreach agent in first-touch mode for the eight approved creators; it will draft email, DM, and Aspire messages for each, save them to the program, and create the email drafts in your Gmail as you confirmed."
<commentary>
The main thread read the roster, asked O1 (save the drafts) and O2 (create Gmail drafts for the named creators) in one picker, and passed both. The agent personalizes, drafts, writes, and publishes the pipeline page. Nothing is sent.
</commentary>
```

```text
Context: Scheduled task "Atlas program reply check: Acme Cookware - Summer ambassadors" fires in a fresh session
user: "Run the Atlas program reply check for Acme Cookware, program Summer ambassadors. Do not ask questions."
assistant: "Launching the atlas-creator-outreach agent in reply-check mode; it will read roster creators' replies from the connected mailbox, list follow-ups due, republish the outreach page, and post to the saved routing."
<commentary>
Unattended run: read only. It summarizes and classes each reply and proposes the record, but records nothing, drafts nothing in the mailbox, and sends nothing. The next interactive session records the replies with one picker.
</commentary>
```

## atlas-creator-profile

```text
Context: Atlas connected, brand profile exists, user names a creator
user: "pull up the full profile for @creatorhandle on Instagram"
assistant: "Launching the atlas-creator-profile agent on @creatorhandle (Instagram); it will refresh the account in Atlas if needed and publish the profile page with recommended fees."
<commentary>
A full-profile request for one creator: the agent owns resolution, the reads, pricing, and the page. The main thread shows the compact card inline and links the page.
</commentary>
```

```text
Context: A discovery shortlist is published; the user wants depth on one candidate
user: "deep dive on #4 from the shortlist, @creatorhandle on TikTok"
assistant: "Running the atlas-creator-profile agent on @creatorhandle (TikTok) for the full profile."
<commentary>
Another flow's creator, looked at in depth. The profile is read-only, so it never changes the shortlist.
</commentary>
```

## atlas-creator-vetting

```text
Context: Atlas connected, vetting calibrations saved, the user attached a CSV exported from Aspire
user: "here's the applicant export from Aspire, who should we approve?"
assistant: "Launching the atlas-creator-vetting agent on the 64 creators in the export; it will check each for fit and brand safety and recommend approve, maybe, or reject."
<commentary>
The main thread read the file, normalized the handles, confirmed the lookups for creators Atlas doesn't hold, and confirmed saving the recommendations. The agent only vets.
</commentary>
```

```text
Context: A campaign is saved; the user pastes handles an agency sent
user: "vet @creatorone, @creatortwo and @creatorthree for the spring launch"
assistant: "Running the atlas-creator-vetting agent on the three handles against the spring launch campaign's criteria."
<commentary>
Campaign criteria replace the brand's vetting criteria for fit; safety, red lines, and saved creator calls apply the same way.
</commentary>
```

## atlas-daily-insights-report

```text
Context: Atlas connected, readout calibrations saved, brand has a linked Instagram channel
user: "what happened on @brandhandle yesterday?"
assistant: "Running the atlas-daily-insights-report agent for @brandhandle against the 28-day baseline."
<commentary>
A yesterday-scoped performance question with calibrations in place maps directly to the daily insights report.
</commentary>
```

```text
Context: Scheduled task "Atlas daily insights report" fires in a fresh session
user: "Run the Atlas daily insights report for Acme Cookware using the saved readout calibrations. Do not ask questions."
assistant: "Launching the atlas-daily-insights-report agent in unattended mode; it will deliver per the saved routing."
<commentary>
Unattended run: the agent must not ask anything and must rely entirely on saved calibrations.
</commentary>
```

## atlas-deliverable-tracker

```text
Context: Atlas connected, the "Summer ambassadors" program is set up, twelve creators are at Posting due or later
user: "did everyone post what they agreed for summer ambassadors?"
assistant: "Launching the atlas-deliverable-tracker agent to propose this month's posting check: what each creator owes, the posts Atlas holds matched to each, and the disclosure on every one. Nothing is saved until you confirm."
<commentary>
Interactive check, pass propose: the agent reads, matches, checks, drafts, and publishes the page, then returns the packet. The main thread asks the match confirmations and the save, then relaunches with pass record.
</commentary>
```

```text
Context: Scheduled task "Atlas program posting check: Acme Cookware - Summer ambassadors" fires in a fresh session
user: "Run the Atlas program posting check for Acme Cookware, program Summer ambassadors. Do not ask questions."
assistant: "Launching the atlas-deliverable-tracker agent in unattended mode; it will match new posts, republish the tracker page, and post the late, missing, and needs-a-fix counts to the saved routing."
<commentary>
Unattended run: it records statuses a clear match settles and late or missing from the date alone, drafts nothing, chases no one, fetches nothing, confirms no unsure match, and moves no creator.
</commentary>
```

## atlas-market-signal

```text
Context: Atlas connected, market signal calibrations saved, the user's ask reads as a product review question
user: "what are creators saying about us vs. the other brands in our category?"
assistant: "Launching the atlas-market-signal agent for the last week, with a parity read for the product review and a messaging view for PMM."
<commentary>
The main thread read the ask, confirmed the readers in one line, and passes the lenses. The agent runs the analysis once and renders a section per lens.
</commentary>
```

```text
Context: Scheduled task "Atlas market signal" fires Monday morning in a fresh session
user: "Run the Atlas market signal for Acme Cookware using the saved market signal calibrations. Do not ask questions."
assistant: "Launching the atlas-market-signal agent in unattended mode; it will lead with what changed since last week and deliver per the saved routing."
<commentary>
Unattended run: no questions, saved calibrations and lenses only, no discovery, standing delivery approval applies.
</commentary>
```

## atlas-post-analysis

```text
Context: Atlas connected, the user pastes a public Reel from a podcast the brand is considering sponsoring
user: "analyze this post for us, we're thinking about sponsoring the show https://www.instagram.com/reel/SHORTCODE/"
assistant: "Launching the atlas-post-analysis agent on the Reel for the brand team; it will refetch the post, time every brand and profanity instance from the video, and check how the current sponsor is disclosed."
<commentary>
The main thread confirmed the reader, the baseline, and the save. Pasting the link is the approval to fetch that one post.
</commentary>
```

```text
Context: A creator the brand works with posted a video; the performance team wants to reuse it
user: "could we run this TikTok as an ad? https://www.tiktok.com/@creatorhandle/video/1234567890"
assistant: "Running the atlas-post-analysis agent with the performance and creative readers; it will add the ad reuse check and a cut list to the analysis."
<commentary>
A reuse question moves performance, people and rights, and the cut list up the page.
</commentary>
```

## atlas-ppa-pitch

```text
Context: Atlas connected, brand profile with a linked Instagram channel, an Aspire managed services user
user: "build the PPA pitch for round two, both new products"
assistant: "Launching the atlas-ppa-pitch agent in plan mode to research both products, propose five lanes each, and rank three candidates per lane from the shortlist and the Atlas index."
<commentary>
The main thread already asked the presentation, frame, shape, and casting questions. The agent proposes; the main thread confirms lanes and cast before the build.
</commentary>
```

```text
Context: The user approved the deck page and asked for both exports
user: "looks good, make the PowerPoint and put it in Google Slides"
assistant: "Running the atlas-ppa-pitch agent in export mode to build the PowerPoint from the same slide model; you can open it in Google Drive as Slides."
<commentary>
Export only follows a reviewed artifact. A native build through a Google Slides connector has its own confirmation.
</commentary>
```

## atlas-product-fulfillment

```text
Context: A gifting and paid program is saved; four creators agreed and two gifting creators replied yes; a Shopify store is connected and can read products and inventory
user: "collect details and order product for the summer program"
assistant: "Launching the atlas-product-fulfillment agent in plan mode; it will propose a product for each of the six creators from your catalog, checked against stock, and draft the details requests."
<commentary>
The Program manager's dispatch row. The first pass only proposes; the main thread confirms the picks, the save, and the mailbox drafts in one question set, then relaunches the agent to write.
</commentary>
```

```text
Context: Orders went out last week; the user pastes two tracking numbers
user: "here's tracking for Maya and Dev, and did the rest arrive?"
assistant: "Running the atlas-product-fulfillment agent in track mode with the two tracking numbers you confirmed; it will read order status from the store, draft check-ins for anything past the delivery window, and start the posting clock for what arrived."
<commentary>
Track mode. Recording the pasted tracking and the deliveries was confirmed in the main thread; the agent hands delivered creators to the deliverable tracker.
</commentary>
```

## atlas-profile-analyst

```text
Context: /aspire:aspire Phase 6, Instagram linked and posts present in search
user: "Instagram is connected"
assistant: "Launching the atlas-profile-analyst agent to review @brandhandle, draft first insights, and suggest next week's content pushes."
<commentary>
Onboarding reached the insights phase; the agent runs the evaluation so the main thread stays responsive.
</commentary>
```

```text
Context: Atlas connected, the brand's TikTok is linked and indexed
user: "look at @brandhandle on TikTok and tell me what we should push next week"
assistant: "Launching the atlas-profile-analyst agent on @brandhandle; it will analyze the last 90 days and propose three content pushes for next week."
<commentary>
The core job: a handle the user manages, analyzed, then turned into next week's pushes. A plan with creators and fees is the creator brief's job; the agent offers it.
</commentary>
```

```text
Context: Atlas connected, brand profile exists, user names an account that is not theirs
user: "run the account review on @competitorhandle on TikTok"
assistant: "Launching the atlas-profile-analyst agent on @competitorhandle (TikTok); it will resolve and refresh the account in Atlas before analyzing."
<commentary>
Named-handle mode: the agent owns resolution and the freshness check, then reviews the account like any other.
</commentary>
```

## atlas-program-dashboard

```text
Context: Atlas connected, the "Summer ambassadors" program is set up and running for six weeks, outreach, the posting check, and the affiliate report have all run
user: "how is summer ambassadors doing against our goals?"
assistant: "Launching the atlas-program-dashboard agent for Summer ambassadors; it will set posts, sales, and content against your goals with pacing to April, show the funnel and what needs you next, and save today's numbers as you confirmed."
<commentary>
The main thread confirmed the lens (team) and asked B1 (save the snapshot) and B2 (post to the saved Slack channel) in one picker before the launch. The agent reads, computes, publishes, writes the snapshot, and posts. It runs no other agent; the attention list hands each item to the flow that handles it.
</commentary>
```

```text
Context: Scheduled task "Atlas program dashboard: Acme Cookware - Summer ambassadors" fires Monday morning in a fresh session
user: "Run the Atlas program dashboard for Acme Cookware, program Summer ambassadors. Do not ask questions."
assistant: "Launching the atlas-program-dashboard agent in unattended mode; it will republish the dashboard, save the weekly snapshot under the saved schedule, and post three lines and the link to the saved routing."
<commentary>
Unattended run: no questions, no decisions, no drafts. It writes only the snapshot, because the program's saved schedule names the weekly dashboard, and shows missing records as not tracked yet rather than zero.
</commentary>
```

## atlas-program-ledger

```text
Context: An ambassador and paid-posts program is saved; negotiation recorded six deals, fulfillment shipped product, the affiliate manager just saved September's commission
user: "update payments for the summer ambassadors"
assistant: "Launching the atlas-program-ledger agent in build mode; it will build the lines from the deals, orders, and September's commission, show what is overdue, and propose the new lines for you to save."
<commentary>
The Program manager's "Update payments" row. The propose pass writes nothing; the main thread asks G1 and any your-call items, then relaunches with the record pass to save the approved lines.
</commentary>
```

```text
Context: Finance paid a batch of creators and the user attaches the payments export from the core Aspire platform
user: "here's this week's payments export, mark what got paid"
assistant: "Running the atlas-program-ledger agent in payments mode on the export; it will remove any bank details, show the column mapping, match each payment to one ledger line, and list the rows it could not match."
<commentary>
Payments mode from a CSV. The mapping and the matches are confirmed with G3 and G4 in the main thread; an unmatched row is never matched by guesswork.
</commentary>
```

## atlas-quarterly-signal

```text
Context: Atlas connected, a quarter of weekly readouts saved
user: "can you put together how influencer did this quarter?"
assistant: "Launching the atlas-quarterly-signal agent for last quarter; it will roll up the saved readouts into one outcome-first page for the QBR."
<commentary>
The main thread read the ask as leadership, confirmed it in one line, and asked whether to save the quarter's findings. The agent only reads what was saved and adds fresh aggregates.
</commentary>
```

```text
Context: The user has the program's spend
user: "QBR for Q3, we spent $180k on creators"
assistant: "Running the atlas-quarterly-signal agent for Q3 with the spend you gave, so the page can show cost per engagement."
<commentary>
The number the user typed is used and labelled as theirs. A program dashboard's paid figure from the ledger shows beside it, labelled, only when the user chose to show it.
</commentary>
```

## atlas-roster-manager

```text
Context: Atlas connected, the "Summer ambassadors" program is saved with 14 ambassadors and 6 paid creators, three ambassador terms end next month
user: "how are our ambassadors doing? who should we renew?"
assistant: "Launching the atlas-roster-manager agent to review the Summer ambassadors roster; it will segment every creator with the evidence, list the three renewals due with a recommendation, and draft notes for anyone slipping."
<commentary>
The propose pass writes nothing. The main thread relays the page and asks K1 (save the review), a K2 per retire or pause call, then K3 (hand renewals to negotiation), K4 (mailbox drafts) and K5 (lookalikes), and relaunches the agent with pass record.
</commentary>
```

```text
Context: The Program manager's dispatch reached "Ambassador renewals within the notice window"
user: "what's next on Summer ambassadors?"
assistant: "Two ambassador renewals are inside the notice window. Running the atlas-roster-manager agent first so negotiation starts from each creator's segment and numbers."
<commentary>
The roster review comes before renewal pricing. Its renewals block goes to atlas-creator-negotiation in renewal mode for the renewals the user picks.
</commentary>
```

## atlas-weekly-insights-report

```text
Context: Atlas connected, readout calibrations saved, Instagram and TikTok linked
user: "how did last week go for @brandhandle?"
assistant: "Running the atlas-weekly-insights-report agent for last week against the prior week and the 8-week median."
<commentary>
A week-scoped performance question with calibrations in place maps to the weekly insights report.
</commentary>
```

```text
Context: Scheduled task "Atlas weekly insights report" fires Monday morning in a fresh session
user: "Run the Atlas weekly insights report for Acme Cookware using the saved readout calibrations. Do not ask questions."
assistant: "Launching the atlas-weekly-insights-report agent in unattended mode; it will deliver per the saved routing."
<commentary>
Unattended run: no questions, saved calibrations only, standing delivery approval applies.
</commentary>
```
