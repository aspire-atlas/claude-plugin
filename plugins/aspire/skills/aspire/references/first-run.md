# First-run guide (the /aspire starter page)

Used by **Phase 2 + 3** of SKILL.md when `/aspire:aspire` runs on an organization that has not
finished onboarding, and by **Sample artifacts** when someone asks what /aspire can do. It is
one published page that explains /aspire, the jobs it does and who each is for, how setup
works, what stays safe, and what to try first. Onboarding then carries on exactly as before:
the page leads the phases, it never replaces or skips one.

The page is about Atlas, not the brand, so it holds no Atlas data beyond the organization and
profile names, writes nothing, and needs no confirmation.

## 1. When to show it

Show the page when all of these hold:

1. **The phases are running from the top.** The argument is empty, or it is onboarding context
   ("get started with Atlas", "onboard my brand", "connect Atlas", "connect my Instagram",
   "first time with Atlas"), or the user replied "connected" to resume Phase 1. Never when the
   argument routes elsewhere (`agents`, `sample`, `fee calculator`, `program`, `next`,
   `cas campaign`, `shops`), and never when the ask names a flow ("vet these creators"): that
   flow runs as it does today.
2. **Atlas answered.** Phase 1 found the connection live and `get_status` returned without an
   auth error (**2**).
3. **The organization is unconfigured** (**3**).
4. **Not shown yet for this organization in this session.** Keep `first_run_shown` in working
   state, keyed by the organization `id`.
5. **Someone is present.** Never in an unattended or scheduled run.

There is no separate "first /aspire" record. Plugin content keeps no local state, and the
organization's Atlas state stands in for it: a first run on a new or half set up organization
always meets **3**. A teammate whose first /aspire is on an organization someone else already
set up gets the status summary, as today, and sees the page when they ask what /aspire can do
(**7**).

## 2. Order with Phase 1 and Phase 2 + 3

1. Phase 1 runs first and unchanged. When Atlas is not connected, not enabled, or not signed
   in, show only the existing guided add (1.3, 1.3b, 1.3c) and its one connector card. No page:
   it would delay the one thing the user has to do.
2. Phase 1 live: the one line that Atlas is connected, then `get_status` (Phase 2 + 3 step 1).
   An auth error renders the connector card per step 2, and no page.
3. Settle the organization (step 3). With several, the org picker comes first, so the page
   names the right one.
4. Route (step 4), and run the check in **3**. Unconfigured: publish the page (**5**), say the
   one line (**6**), then continue at the phase the route names. Configured: no page; the
   status summary as today.
5. A "connected" reply that resumes Phase 1 follows the same order from the top.

## 3. Unconfigured: the existing route, plus the Phase 5 read

Use the Phase 2 + 3 route as it stands; add no new store or record.

| Route (Phase 2 + 3 step 4) | Unconfigured when | Continue at |
| -------------------------- | ----------------- | ----------- |
| `profiles` empty (new org) | Always | Phase 4.1, question P1 |
| Profiles, none with a connected channel (profile only) | Always | Phase 4.2 (the profile question first when there are several) |
| Profiles with channels (existing) | The Phase 5 calibration read finds no brand context on any profile that has a connected channel | The status summary, then Phase 5's first question |

For the existing route, run the read Phase 5 already makes (`search_calibrations`, no filter,
limit 100 per page, paged to the end, `includeSuperseded: true`, `asProfileId` = that profile)
for each profile with a connected channel, in `get_status` order, and stop at the first
profile with brand context. A profile has brand context when the read holds any record of kind
`brand_fact`, `user_fact`, `competitor`, `red_line`, `partner`, or `decline`: those are the kinds
the Phase 5 core set writes, including its skips and "not sure yet" answers. Keep the result,
so the Phase 5 gap check reuses it and never reads twice.

## 4. What the page may use from `get_status`

Only names, and none is required:

- The organization's name.
- The brand profile names, and whether each has a connected channel.

Never an id, a slug, an email, a role, a channel handle, or a number from Atlas. HTML-escape
every name (`&`, `<`, `>`, `"`) before it goes into the page. When the page is shown on request
without a connection (**7**), use none of them.

## 5. Building and publishing

1. Load `artifact-design`, as every page requires. The template in **8** already meets its page
   contract (title, tokens with light and dark, phone width, allowed fonts only, no external
   images), so change nothing but the placeholders.
2. Fill the placeholders:
   - `{STATUS}`: one line from the table below, or delete the whole `<p class="status">`
     element when nothing is known.

     | Situation | Line |
     | --------- | ---- |
     | New org | `{org} · No brand profile yet. Step 2 creates one.` |
     | Profile only, one profile | `{org} · {profile} has no social account linked yet.` |
     | Profile only, several | `{org} · {n} brand profiles, none with a linked account yet.` |
     | Existing, no brand context | `{org} · {profile} is linked. Brand context is next.` |
     | On request, connected | `{org} · Brand profiles: {names, comma separated}` |

   - **Next up.** Remove `hidden` from the one `<span class="next" hidden>` in the step the route
     continues at: `step-profile` (new org), `step-accounts` (profile only), `step-context`
     (existing, no brand context). On request, leave every one hidden.
3. The hero carries the animated Aspire Atlas mark at the top right, and the footer keeps its two
   existing lines and adds the footnote's first and second lines with the "No Atlas data on this
   page" variant ([`artifact-standard.md`](artifact-standard.md)).
4. The page always uses the Aspire default look in the template, never `theme:brand`: it
   describes Atlas itself, and a first run has no theme yet.
4. Write the file to the session's scratch folder as `atlas-starter-guide.html` and publish it
   with the Artifact tool: private, `icon` `guide`, description "What /aspire does, who each
   agent is for, and the five setup steps." Republishing in the same session reuses the path.
   One pass: no preview, no layout loop. The user is waiting to start setup.
5. No Artifact tool: send the HTML with `SendUserFile` when the session has it. Otherwise, or
   when the publish fails, skip the page and use the one-line text fallback in **6**. Never
   retry more than once, never ask about it, and never hold up the next phase.

No snippet runs for this page: it embeds no images and fetches nothing.

## 6. What to say in chat

After the page, one line with the link, nothing more. Do not restate the page's content.

> New to Atlas? This page covers what /aspire can do and the setup ahead: {link}

Then continue straight into the next phase, in the same reply: the first question of the phase
**3** names (P1, C1 or the profile question, or the existing summary followed by Phase 5's
first unanswered question), asked with `AskUserQuestion` as that phase says.

Text fallback, when there is no page:

> /aspire sets up Aspire Atlas for your brand in five steps: connect, brand profile, social
> accounts, brand context, first insights. Ask "what can /aspire do" any time for the full list.

## 7. Showing it again

- Once per organization per session as a first-run page. Switching organizations in the same
  session can show it once for the other one, when that one is unconfigured too.
- **On request.** "What can /aspire do", "what can Atlas do", "show me the starter guide", or
  "first time with Atlas" on an organization that is already set up: publish the page again
  (same path), with the `On request` status line when Atlas is connected and no status line
  when it is not. No Atlas connection or Phase 1 is needed for this. Then make the **Sample
  artifacts** offer for Atlas as a whole.
- Never in the middle of a running flow's questions, and never in an unattended run.
- Never blocks onboarding: whatever happens to the page, the next phase still starts.

**The dashboard.** On a configured organization a bare `/aspire:aspire` opens the organization
dashboard instead (`org-dashboard.md`), and this page is not shown. An unconfigured one gets this
page first, and the dashboard is offered once brand context is saved.

## 8. The page

Sections, in order: hero (what /aspire is), what you can do (job cards grouped by who they are
for), how to get started (the five real phases, with what Claude asks at each), what stays safe
(true to `SECURITY.md`), and try these first (five prompts). Copy is fixed: keep it plain and
change only the placeholders. If an agent is renamed or a flow changes, update the copy here in
the same change.

Never add a support-only connector or skill, prices, customer names, or internal tools to this
page.

```html
<title>Atlas Starter Guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Sans:wght@500;600;700&display=swap">
<style>
/* Layout: one reading column; hero, five audience bands of job cards, a numbered setup path, a short safety list, copyable first prompts. */
:root{
  --bg:#F5F7F7;--surface:#FFFFFF;--text:#152022;--muted:#56656A;--border:#D8E0E1;
  --brand:#1E5C58;--on-brand:#FFFFFF;--brand-ink:#1B5652;--tint:#E6F0EE;--code-bg:#EEF2F2;
  --font-display:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;
  --font-body:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif;
  --font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --radius:10px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#0E1415;--surface:#162022;--text:#E6EDEE;--muted:#9BAAAD;--border:#2A3739;
  --brand:#5DB3A9;--on-brand:#0B1A19;--brand-ink:#7FCBC1;--tint:#18302E;--code-bg:#1C2729;color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#0E1415;--surface:#162022;--text:#E6EDEE;--muted:#9BAAAD;--border:#2A3739;
  --brand:#5DB3A9;--on-brand:#0B1A19;--brand-ink:#7FCBC1;--tint:#18302E;--code-bg:#1C2729;color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 var(--font-body)}
.wrap{max-width:68rem;margin:0 auto;padding-inline:clamp(16px,4vw,40px);padding-block:40px 56px;display:grid;gap:56px}
h1,h2,h3,h4{font-family:var(--font-display);text-wrap:balance;margin:0;line-height:1.2}
p{margin:0}
code{font-family:var(--font-mono)}
.eyebrow{font-family:var(--font-mono);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-ink)}
.hero{display:grid;gap:16px;max-width:44rem}
.hero h1{font-size:clamp(2rem,5vw,3.1rem);font-weight:700;letter-spacing:-.01em}
.lede{font-size:1.12rem;max-width:40em}
.status{justify-self:start;background:var(--tint);border-radius:8px;padding:6px 14px;font-size:.92rem}
section{display:grid;gap:20px}
.sec-head{display:grid;gap:6px;max-width:44rem}
.sec-head h2{font-size:1.6rem;font-weight:600}
.sec-head p,.muted{color:var(--muted)}
.group{display:grid;gap:12px}
.group-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}
.group-head h3{font-size:1.1rem;font-weight:600}
.group-head p{color:var(--muted);font-size:.95rem}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(15.5rem,1fr));gap:12px}
.case{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;display:flex;flex-direction:column;gap:8px;min-width:0}
.case h4{font-size:1.02rem;font-weight:600}
.case .job{font-size:.95rem}
.say{font-family:var(--font-mono);font-size:.84rem;background:var(--code-bg);border-radius:6px;padding:6px 8px;overflow-wrap:anywhere}
.agent{margin-top:auto;font-size:.82rem;color:var(--muted);overflow-wrap:anywhere}
.agent code{font-size:.78rem}
.steps{list-style:none;margin:0;padding:0;display:grid}
.step{display:grid;grid-template-columns:2.25rem minmax(0,1fr);gap:16px;padding-block:18px;border-top:1px solid var(--border)}
.step:last-child{border-bottom:1px solid var(--border)}
.num{font-family:var(--font-display);font-size:1.4rem;font-weight:600;color:var(--brand-ink);font-variant-numeric:tabular-nums;line-height:1.2}
.step-body{display:grid;gap:6px;max-width:44rem}
.step-body h3{font-size:1.1rem;font-weight:600}
.asked{font-size:.93rem;color:var(--muted)}
.asked strong{color:var(--text);font-weight:600}
.next{display:inline-block;margin-left:8px;vertical-align:middle;background:var(--brand);color:var(--on-brand);font-family:var(--font-mono);font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;border-radius:999px;padding:2px 8px}
.safe{list-style:none;margin:0;padding:0;display:grid;gap:10px;max-width:44rem}
.safe li{position:relative;padding-left:1.25em}
.safe li::before{content:"";position:absolute;left:0;top:.62em;width:.45em;height:.45em;background:var(--brand);border-radius:2px}
.prompts{list-style:none;margin:0;padding:0;display:grid;gap:10px;max-width:44rem}
.prompt{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px}
.prompt code{font-size:.92rem;overflow-wrap:anywhere}
.prompt .why{grid-column:1 / -1;color:var(--muted);font-size:.9rem}
.copy{font:500 .78rem var(--font-mono);color:var(--text);background:transparent;border:1px solid var(--border);border-radius:6px;padding:6px 10px;cursor:pointer}
.copy:hover{border-color:var(--brand-ink)}
.copy:focus-visible{outline:2px solid var(--brand-ink);outline-offset:2px}
footer{border-top:1px solid var(--border);padding-top:20px;color:var(--muted);font-size:.9rem;display:grid;gap:6px}
</style>

<div class="wrap">

<header class="hero">
  <p class="eyebrow">Aspire Atlas · /aspire</p>
  <h1>Creative Intelligence for your brand</h1>
  <p class="lede">/aspire connects Claude to your brand's Instagram, TikTok, and YouTube on Aspire Atlas, so you can see what's working, find and brief creators, and run your influencer program from one chat. Ask in plain words: Claude picks the right agent, checks with you before it saves anything, and publishes the results as pages you can share.</p>
  <p class="status">{STATUS}</p>
</header>

<section aria-labelledby="h-do">
  <div class="sec-head">
    <h2 id="h-do">What you can do</h2>
    <p>Grouped by who usually asks. Anyone can type any of these.</p>
  </div>

  <div class="group">
    <div class="group-head"><h3>Social team</h3><p>Your own accounts, week to week</p></div>
    <div class="cards">
      <article class="case"><h4>See how yesterday and last week went</h4><p class="job">Your posts against your own baseline, what broke out and why, and next steps. Can arrive in Slack or email on a schedule.</p><p class="say">how did last week go</p><p class="agent">Daily and weekly insights reports · <code>atlas-daily-insights-report</code>, <code>atlas-weekly-insights-report</code></p></article>
      <article class="case"><h4>Plan next week's posts</h4><p class="job">A review of your accounts and three content pushes, each with a format, a day, and a target.</p><p class="say">what should we push next week</p><p class="agent">Profile analyst · <code>atlas-profile-analyst</code></p></article>
      <article class="case"><h4>Brief creators for a week or a launch</h4><p class="job">Deliverables, guardrails, the creators to make them, and what each would cost, on one page.</p><p class="say">create a content brief for next week</p><p class="agent">Creator brief · <code>atlas-creator-brief</code></p></article>
      <article class="case"><h4>Check a post before it goes live</h4><p class="job">A draft or live post against its brief, your guidelines, and brand safety, with edit notes for the creator.</p><p class="say">check this draft against the brief</p><p class="agent">Content review · <code>atlas-content-review</code></p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Creator and influencer team</h3><p>Finding creators and running programs</p></div>
    <div class="cards">
      <article class="case"><h4>Keep a campaign shortlist full</h4><p class="job">Scored candidates for each campaign, starting with creators who already know your brand. Decisions stay put between sessions.</p><p class="say">find creators for the campaign</p><p class="agent">Creator discovery · <code>atlas-creator-discovery</code></p></article>
      <article class="case"><h4>Vet a list of creators</h4><p class="job">Approve, maybe, or reject for each creator on a list or export, with the fit and brand safety evidence.</p><p class="say">vet these creators</p><p class="agent">Creator vetting · <code>atlas-creator-vetting</code></p></article>
      <article class="case"><h4>Look at one creator in depth</h4><p class="job">Audience, top posts, brand safety, past partnerships, and what they would cost.</p><p class="say">full profile for @handle</p><p class="agent">Creator profile · <code>atlas-creator-profile</code></p></article>
      <article class="case"><h4>Run an influencer program</h4><p class="job">Gifting, paid posts, ambassadors, or affiliates: outreach drafts, offers and counters, product shipping, posting checks, discount codes, and what you owe creators.</p><p class="say">set up our influencer program</p><p class="agent">Creator outreach, negotiation, product fulfillment, deliverable tracker, affiliate manager, program ledger · <code>atlas-creator-outreach</code> and the rest</p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Performance and creative</h3><p>Ads, reuse, and selling through social</p></div>
    <div class="cards">
      <article class="case"><h4>Find the hooks worth running as ads</h4><p class="job">Ranks videos on how they open and builds a cut list with timestamps for editors.</p><p class="say">best hooks to reuse as ads</p><p class="agent">Ad reuse · <code>atlas-ad-reuse</code></p></article>
      <article class="case"><h4>Break down one post</h4><p class="job">Reach, every brand on screen, brand safety, and disclosure, for deciding whether to sponsor, partner, or reuse.</p><p class="say">analyze this post</p><p class="agent">Post analysis · <code>atlas-post-analysis</code></p></article>
      <article class="case"><h4>Pitch partnership ads</h4><p class="job">A casting deck of creators for paid partnership ads, ready to export to PowerPoint.</p><p class="say">build a PPA pitch</p><p class="agent">PPA pitch · <code>atlas-ppa-pitch</code></p></article>
      <article class="case"><h4>Know what content you can use</h4><p class="job">A searchable library of creator content about your brand, with the rights on record and what expires soon.</p><p class="say">what's cleared for ads</p><p class="agent">Content library · <code>atlas-content-library</code></p></article>
      <article class="case"><h4>Plan an Instagram Shop or TikTok Shop</h4><p class="job">What's ready, the steps in order, the posts to tag, and creators for the shop. Your team does each step in the platforms.</p><p class="say">set up Instagram Shop</p><p class="agent">Shops · <code>atlas-shops</code></p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Leadership</h3><p>Outcomes and decisions</p></div>
    <div class="cards">
      <article class="case"><h4>Tell the quarter's story</h4><p class="job">The outcome first, the trend against last quarter, and three recommendations for next quarter.</p><p class="say">how did influencer do this quarter</p><p class="agent">Quarterly signal · <code>atlas-quarterly-signal</code></p></article>
      <article class="case"><h4>See how a program is doing</h4><p class="job">Goals and pace, the creator funnel, spend, and what needs attention next.</p><p class="say">how is the program doing</p><p class="agent">Program dashboard · <code>atlas-program-dashboard</code></p></article>
      <article class="case"><h4>Know what to do next</h4><p class="job">One ranked list of next actions across programs, campaigns, and reports. Editors can approve on the page.</p><p class="say">what's next</p><p class="agent">Campaign orchestrator · <code>atlas-campaign-orchestrator</code></p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Product and product marketing</h3><p>How you compare</p></div>
    <div class="cards">
      <article class="case"><h4>Hear what creators say about you and competitors</h4><p class="job">Share of voice, the features creators compare, friction they mention, and the language that's spreading.</p><p class="say">what are creators saying about us vs our competitors</p><p class="agent">Market signal · <code>atlas-market-signal</code></p></article>
      <article class="case"><h4>Compare your accounts with competitors'</h4><p class="job">Engagement and format benchmarks against the competitor accounts Atlas indexes.</p><p class="say">review our account against competitors</p><p class="agent">Profile analyst · <code>atlas-profile-analyst</code></p></article>
    </div>
  </div>
</section>

<section aria-labelledby="h-start">
  <div class="sec-head">
    <h2 id="h-start">How to get started</h2>
    <p>Type /aspire (or /aspire:aspire). Claude walks through these steps in order and picks up where you left off. Every question comes with options to pick from.</p>
  </div>
  <ol class="steps">
    <li class="step" id="step-connect"><span class="num">1</span><div class="step-body"><h3>Connect Aspire Atlas<span class="next" hidden>Next up</span></h3><p>Claude checks the connection. If it isn't on, you get a Connect button.</p><p class="asked"><strong>You'll be asked:</strong> to sign in with your Atlas account, and which organization to use if you belong to more than one.</p></div></li>
    <li class="step" id="step-profile"><span class="num">2</span><div class="step-body"><h3>Set up your brand profile<span class="next" hidden>Next up</span></h3><p>The profile holds your accounts and everything Atlas learns about the brand, for your whole team.</p><p class="asked"><strong>You'll be asked:</strong> the brand name as customers know it, then to confirm creating the profile.</p></div></li>
    <li class="step" id="step-accounts"><span class="num">3</span><div class="step-body"><h3>Link Instagram, TikTok, or YouTube<span class="next" hidden>Next up</span></h3><p>You sign in to each network in your browser, and Atlas starts reading your posts. Instagram and TikTok feed search and hashtag tracking.</p><p class="asked"><strong>You'll be asked:</strong> which accounts to connect.</p></div></li>
    <li class="step" id="step-context"><span class="num">4</span><div class="step-body"><h3>Tell Atlas about the brand<span class="next" hidden>Next up</span></h3><p>About seven short questions, saved to the brand's Atlas memory so teammates and later runs never ask again. Some offer to research the answer on the web; you see what it found before anything is saved. Then two optional offers: your brand's colors on Atlas pages, and your creator rates.</p><p class="asked"><strong>You'll be asked:</strong> what you sell and to whom, your role, competitors to watch, your goal for the next 90 days, any hard no's, creators you already work with, and hashtags to track. Most have a Skip option.</p></div></li>
    <li class="step" id="step-insights"><span class="num">5</span><div class="step-body"><h3>Get first insights<span class="next" hidden>Next up</span></h3><p>Claude reviews your linked accounts and shows what's working, with three content pushes for next week. The findings are saved in Atlas for your team.</p><p class="asked"><strong>You'll be asked:</strong> which account to review: your own, or another handle you name.</p></div></li>
  </ol>
</section>

<section aria-labelledby="h-safe">
  <div class="sec-head"><h2 id="h-safe">What stays safe</h2></div>
  <ul class="safe">
    <li>Claude asks before it changes anything in Atlas, with a multiple-choice question. Deleting or replacing something gets a question of its own.</li>
    <li>Nothing goes to a creator or anyone else unless you ask in that session and confirm who gets it. Messages are drafted for you to review.</li>
    <li>A mailbox or store is used only through a connection you added yourself, after a confirmation each time.</li>
    <li>Scheduled runs do only what you approved when you set them up. They never ask questions or delete anything, and deliver only to the Slack channels and email recipients you saved. If you turn on the hourly next-actions run, it carries out only what an Editor approved on its page, and only Atlas records and mailbox drafts. It never sends or orders.</li>
    <li>Pages Claude publishes start private. You decide who to share them with.</li>
  </ul>
</section>

<section aria-labelledby="h-try">
  <div class="sec-head"><h2 id="h-try">Try these first</h2></div>
  <ul class="prompts">
    <li class="prompt"><code>/aspire:aspire sample</code><button class="copy" type="button" data-copy="/aspire:aspire sample">Copy</button><p class="why">See what any agent makes, built from invented data. No setup needed.</p></li>
    <li class="prompt"><code>how is our Instagram doing</code><button class="copy" type="button" data-copy="how is our Instagram doing">Copy</button><p class="why">A review of your account with next week's content pushes.</p></li>
    <li class="prompt"><code>how did last week go</code><button class="copy" type="button" data-copy="how did last week go">Copy</button><p class="why">Last week against the week before and your 8-week median.</p></li>
    <li class="prompt"><code>find creators for the campaign</code><button class="copy" type="button" data-copy="find creators for the campaign">Copy</button><p class="why">Starts a shortlist after a few questions about the campaign.</p></li>
    <li class="prompt"><code>/aspire:aspire agents</code><button class="copy" type="button" data-copy="/aspire:aspire agents">Copy</button><p class="why">Every agent in one list, with the phrases that start each one.</p></li>
  </ul>
</section>

<footer>
  <p>Ask "what can /aspire do" any time to open this page again.</p>
  <p>Aspire Atlas · atlas.aspire.io</p>
</footer>

</div>

<script>
document.querySelectorAll(".copy").forEach(function(b){
  b.addEventListener("click",function(){
    var text=b.getAttribute("data-copy");
    function shown(label){b.textContent=label;setTimeout(function(){b.textContent="Copy";},1600);}
    function select(){
      try{var r=document.createRange();r.selectNodeContents(b.previousElementSibling);var s=window.getSelection();s.removeAllRanges();s.addRange(r);shown("Selected");}catch(e){}
    }
    try{navigator.clipboard.writeText(text).then(function(){shown("Copied");},select);}catch(e){select();}
  });
});
</script>
```
