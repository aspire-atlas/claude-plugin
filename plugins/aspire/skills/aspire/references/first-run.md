# First-run guide (the /aspire starter page)

Used by **Phase 2 + 3** of SKILL.md when `/aspire:aspire` runs on an organization that has not
finished onboarding, and by **Sample artifacts** when someone asks what /aspire can do. It is
one published page that explains /aspire, how setup works, the jobs it does and who each is
for, what stays safe, and what to try first. Onboarding then carries on exactly as before:
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
3. The header carries the full animated Aspire Atlas mark (pasted from `assets/aspire-animated.svg`
   into the template, 40px, with its `role` and `aria-label`, a 1px `var(--border)` outline, never
   recolored). **Deliberate variant:** on this page the mark sits at the upper left, at the start of
   the header, because the page has no brand logo to take that corner and was asked for this
   placement; [`artifact-standard.md`](artifact-standard.md) puts it at the top right on every other
   page, and nothing else should copy this. The footer keeps its two existing lines and adds the
   "No Atlas data on this page." source line for pages with no Atlas data (section 3 there). When
   the logo asset is regenerated, paste the new file into the template in the same change.
4. The page always uses the Aspire default look in the template, never `theme:brand`: it
   describes Atlas itself, and a first run has no theme yet.
5. Write the file to the session's scratch folder as `atlas-starter-guide.html` and publish it
   with the Artifact tool: private, `icon` `guide`, description "What /aspire does, the five
   setup steps, and who each agent is for." Republishing in the same session reuses the path.
   One pass: no preview, no layout loop. The user is waiting to start setup.
6. No Artifact tool: send the HTML with `SendUserFile` when the session has it. Otherwise, or
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
  artifacts** offer for Atlas as a whole. The arguments `getting started` and `help` show it the
  same way.
- Never in the middle of a running flow's questions, and never in an unattended run.
- Never blocks onboarding: whatever happens to the page, the next phase still starts.

**The dashboard.** On a configured organization a bare `/aspire:aspire` opens the organization
dashboard instead (`org-dashboard.md`), and this page is not shown. An unconfigured one gets this
page first, and the dashboard is offered once brand context is saved.

## 8. The page

Sections, in order: header (the mark at upper left, what /aspire is, and a sample chat and
dashboard), how to get started (the five real phases as a stepper, at most three cards per row,
each with a small sample screen and what /aspire asks), what you can do (job cards grouped by who
they are for, each with a thumbnail of the page it makes), what stays safe (a confirm-before-write
flow, then icon rows, true to `SECURITY.md`), and try these first (five prompts). Every figure is
drawn from invented data and carries a "Sample" tag; illustrations are CSS and inline SVG, marked
`aria-hidden`, with no images and no script beyond the copy buttons. The page never names Claude, a
model, or an assistant: the copy says "/aspire". Copy is fixed: keep it plain and change only the
placeholders. If an agent is renamed or a flow changes, update the copy and its thumbnail here in
the same change.

Never add a support-only connector or skill, prices, customer names, or internal tools to this
page.

```html
<title>Atlas Starter Guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Sans:wght@500;600;700&display=swap">
<style>
/* Layout: header with the mark at upper left and a sample chat + dashboard; a five-card stepper, at most three per row; job cards each with a sample thumbnail; a confirm-before-write flow; copyable prompts. */
:root{
  --bg:#F5F7F7;--surface:#FFFFFF;--text:#152022;--muted:#56656A;--border:#D8E0E1;
  --brand:#1E5C58;--on-brand:#FFFFFF;--brand-ink:#1B5652;--tint:#E6F0EE;--code-bg:#EEF2F2;
  --tile:#1C2B2A;--teal:#3B8A82;
  --thumb:#EEF4F3;--line:#C9D6D7;--c1:#2E766F;--c2:#6B8A86;--c3:#A86B12;
  --font-display:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;
  --font-body:"IBM Plex Sans",ui-sans-serif,system-ui,sans-serif;
  --font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --radius:10px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#0E1415;--surface:#162022;--text:#E6EDEE;--muted:#9BAAAD;--border:#2A3739;
  --brand:#5DB3A9;--on-brand:#0B1A19;--brand-ink:#7FCBC1;--tint:#18302E;--code-bg:#1C2729;
  --thumb:#101A1B;--line:#2F4143;--c1:#5DB3A9;--c2:#6B8A86;--c3:#E0A94F;color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#0E1415;--surface:#162022;--text:#E6EDEE;--muted:#9BAAAD;--border:#2A3739;
  --brand:#5DB3A9;--on-brand:#0B1A19;--brand-ink:#7FCBC1;--tint:#18302E;--code-bg:#1C2729;
  --thumb:#101A1B;--line:#2F4143;--c1:#5DB3A9;--c2:#6B8A86;--c3:#E0A94F;color-scheme:dark}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 var(--font-body)}
.wrap{max-width:68rem;margin:0 auto;padding-inline:clamp(16px,4vw,40px);padding-block:32px 56px;display:grid;gap:56px}
h1,h2,h3,h4{font-family:var(--font-display);text-wrap:balance;margin:0;line-height:1.2}
p{margin:0}
code{font-family:var(--font-mono)}
svg{display:block}
.eyebrow{font-family:var(--font-mono);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-ink)}
/* The mark: upper left on this page (a deliberate variant of artifact-standard.md), 40px, never recolored. */
.hero{display:grid;gap:24px}
.top{display:flex;align-items:center;gap:14px}
.mark{flex:none;width:40px;height:40px;border:1px solid var(--border);border-radius:9px}
.hero-grid{display:grid;gap:28px}
.hero-copy{display:grid;gap:16px;align-content:center;max-width:40rem}
.hero h1{font-size:clamp(2rem,5vw,3.1rem);font-weight:700;letter-spacing:-.01em}
.lede{font-size:1.12rem;max-width:40em}
.status{justify-self:start;background:var(--tint);border-radius:8px;padding:6px 14px;font-size:.92rem}
@media (min-width:860px){.hero-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center}}
/* Sample figures: an invented tag on every one. */
.sample{font:500 .6rem var(--font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:1px 6px;white-space:nowrap}
.stage{position:relative;isolation:isolate;background:var(--tile);border:1px solid var(--border);border-radius:14px;padding:18px;display:grid;gap:12px;overflow:hidden}
.stage::before{content:"";position:absolute;inset:0;z-index:-1;background-color:rgba(59,138,130,.22);background-image:linear-gradient(90deg,var(--tile) 4px,transparent 4px),linear-gradient(var(--tile) 4px,transparent 4px);background-size:25.6px 25.6px}
.win{margin:0;background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;font-size:.86rem}
.win-bar{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--border);font:600 .78rem var(--font-display);color:var(--muted)}
.win-bar .sample{margin-left:auto}
.dots{display:flex;gap:4px}
.dots i{width:8px;height:8px;border-radius:50%;background:var(--line)}
.bub{margin:10px;padding:8px 10px;border-radius:10px;display:grid;gap:8px}
.you{background:var(--code-bg);width:max-content;max-width:calc(100% - 20px);margin-left:auto}
.bot{background:var(--tint);max-width:92%}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chips span{border:1px solid var(--brand-ink);color:var(--brand-ink);background:var(--surface);border-radius:999px;padding:2px 10px;font-size:.78rem}
.caret{display:inline-block;width:2px;height:1em;background:var(--text);margin-left:2px;vertical-align:-.15em;animation:blink 1.1s steps(2,start) infinite}
@keyframes blink{to{visibility:hidden}}
@media (prefers-reduced-motion:reduce){.caret{animation:none}}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px 10px 4px}
.kpis div{background:var(--code-bg);border-radius:8px;padding:6px 8px;display:grid}
.kpis small{color:var(--muted);font-size:.7rem}
.kpis b{font:700 1.1rem var(--font-display)}
.kpis em{font-style:normal;font-size:.7rem;color:var(--brand-ink)}
.win svg{width:100%;height:auto;padding:0 10px 10px;box-sizing:border-box}
/* Thumbnail drawing classes: a/b/c = brand teal, soft teal, amber; l = quiet fill; s = card surface. */
.a{fill:var(--c1)}.b{fill:var(--c2)}.c{fill:var(--c3)}.l{fill:var(--line)}.sf{fill:var(--surface)}
.s{fill:var(--surface);stroke:var(--line)}.ar{fill:var(--c1);opacity:.18}
.k,.kc,.kw,.ln,.rg{fill:none;stroke-linecap:round;stroke-linejoin:round}
.k{stroke:var(--c1);stroke-width:2}.kc{stroke:var(--c3);stroke-width:2}.kw{stroke:var(--surface);stroke-width:1.8}
.ln{stroke:var(--c2);stroke-width:1}.d{stroke-dasharray:3 3}.rg{stroke:var(--line);stroke-width:3}
section{display:grid;gap:20px}
.sec-head{display:grid;gap:6px;max-width:44rem}
.sec-head h2{font-size:1.6rem;font-weight:600}
.sec-head p,.muted{color:var(--muted)}
.group{display:grid;gap:12px}
.group-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}
.group-head h3{font-size:1.1rem;font-weight:600}
.group-head p{color:var(--muted);font-size:.95rem}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(15.5rem,1fr));gap:12px}
.case{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 12px 16px;display:flex;flex-direction:column;gap:8px;min-width:0}
.thumb{position:relative;margin:0 0 4px;background:var(--thumb);border:1px solid var(--border);border-radius:8px;overflow:hidden}
.thumb svg{width:100%;height:auto}
.thumb rect{rx:3px}
.thumb .sample{position:absolute;top:5px;right:5px}
.case h4{font-size:1.02rem;font-weight:600;padding-inline:4px}
.case .job{font-size:.95rem;padding-inline:4px}
.say{font-family:var(--font-mono);font-size:.84rem;background:var(--code-bg);border-radius:6px;padding:6px 8px;overflow-wrap:anywhere;margin-inline:4px}
.agent{margin:auto 4px 0;padding-top:4px;font-size:.82rem;color:var(--muted);overflow-wrap:anywhere}
.agent code{font-size:.78rem}
.steps{list-style:none;margin:0;padding:0;display:grid;gap:12px}
@media (min-width:640px){.steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1000px){.steps{grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
  .step:not(:last-child):not(:nth-child(3n))::after{content:"\2192";position:absolute;right:-18px;top:18px;color:var(--muted)}}
.step{position:relative;display:flex;flex-direction:column;gap:10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px;min-width:0}
.step:has(.next:not([hidden])){border-color:var(--brand);box-shadow:0 0 0 1px var(--brand)}
.step-head{display:flex;align-items:center;gap:10px}
.num{flex:none;width:28px;height:28px;border-radius:50%;background:var(--brand);color:var(--on-brand);display:grid;place-items:center;font:600 .95rem var(--font-display);font-variant-numeric:tabular-nums}
.step h3{font-size:1.02rem;font-weight:600}
.step p{font-size:.92rem}
.asked{font-size:.88rem;color:var(--muted)}
.asked strong{color:var(--text);font-weight:600}
.next{display:inline-block;margin-left:8px;vertical-align:middle;background:var(--brand);color:var(--on-brand);font-family:var(--font-mono);font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;border-radius:999px;padding:2px 8px;white-space:nowrap}
.next[hidden]{display:none}
.screen{position:relative;margin:0;background:var(--thumb);border:1px solid var(--border);border-radius:8px;padding:24px 10px 10px;display:grid;gap:6px;align-content:start;font-size:.8rem;min-height:7.4rem}
.screen .sample{position:absolute;top:5px;right:5px}
.screen small{color:var(--muted);font-size:.72rem}
.field{background:var(--surface);border:1px solid var(--brand-ink);border-radius:6px;padding:4px 8px}
.btn{justify-self:start;background:var(--brand);color:var(--on-brand);border-radius:6px;padding:3px 10px;font-weight:600;font-size:.78rem}
.pick{display:flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:3px 8px}
.pick i{flex:none;width:12px;height:12px;border:1.5px solid var(--muted);border-radius:3px;box-sizing:border-box}
.pick.on i{background:var(--brand);border-color:var(--brand);position:relative}
.pick.on i::after{content:"";position:absolute;left:3px;top:0;width:3px;height:6px;border:solid var(--on-brand);border-width:0 1.5px 1.5px 0;transform:rotate(45deg)}
.pushes{margin:0;padding-left:1.2em;display:grid;gap:3px}
.flow{list-style:none;margin:0;padding:0;display:grid;gap:22px;max-width:56rem}
@media (min-width:720px){.flow{grid-template-columns:repeat(3,minmax(0,1fr));gap:34px}}
.node{position:relative;display:grid;gap:4px;justify-items:start;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px}
.node b{font:600 1.02rem var(--font-display)}
.node span{font-size:.9rem;color:var(--muted)}
.node:not(:last-child)::after{content:"\2193";position:absolute;left:50%;bottom:-22px;transform:translateX(-50%);color:var(--brand-ink);font-size:1.1rem;line-height:22px}
@media (min-width:720px){.node:not(:last-child)::after{content:"\2192";left:auto;right:-26px;bottom:auto;top:50%;transform:translateY(-50%);width:18px;text-align:center}}
.ic{flex:none;width:28px;height:28px;fill:none;stroke:var(--brand-ink);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.node .ic{width:32px;height:32px;margin-bottom:4px}
.safe{list-style:none;margin:0;padding:0;display:grid;gap:12px;max-width:48rem}
.safe li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:14px;align-items:start}
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
  <div class="top">
<svg xmlns="http://www.w3.org/2000/svg" class="mark" width="40" height="40" viewBox="0 0 512 512" role="img" aria-label="Aspire Atlas"><style>
.lgk{fill:#1c2b2a}.lgg{fill:#3B8A82}
.lgg path{animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-fill-mode:both}
.lgp0{animation-name:lga}.lgp1{animation-name:lgb}.lgp2{animation-name:lgc}.lgp3{animation-name:lgd}
.lgt0{animation-duration:7s}.lgt1{animation-duration:11s}.lgt2{animation-duration:13s}.lgt3{animation-duration:17s}.lgt4{animation-duration:19s}.lgt5{animation-duration:23s}
.lgw0{animation-delay:-0.0s}.lgw1{animation-delay:-2.9s}.lgw2{animation-delay:-5.8s}.lgw3{animation-delay:-8.7s}.lgw4{animation-delay:-11.6s}.lgw5{animation-delay:-14.5s}.lgw6{animation-delay:-17.4s}.lgw7{animation-delay:-20.3s}
@keyframes lga{0%{opacity:0}18%{opacity:.9}34%{opacity:.15}58%{opacity:.7}76%{opacity:.05}100%{opacity:0}}
@keyframes lgb{0%{opacity:.1}22%{opacity:.6}40%{opacity:0}66%{opacity:1}84%{opacity:.2}100%{opacity:.1}}
@keyframes lgc{0%,40%{opacity:0}48%{opacity:1}56%{opacity:.1}64%,100%{opacity:0}}
@keyframes lgd{0%,100%{opacity:0}50%{opacity:.8}}
@media (prefers-reduced-motion: reduce){.lgg path{animation:none}.lgp0{opacity:.55}.lgp1{opacity:.3}.lgp2{opacity:.12}.lgp3{opacity:.42}}
</style>
<defs><clipPath id="lgsq"><rect width="512" height="512" rx="96"/></clipPath></defs>
<g clip-path="url(#lgsq)"><rect class="lgk" width="512" height="512"/><g class="lgg"><path class="lgp0 lgt1 lgw4" d="M2.6 2.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw1" d="M2.6 28.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw7" d="M2.6 53.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw0" d="M2.6 79.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw1" d="M2.6 105.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw6" d="M2.6 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M2.6 156.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw3" d="M2.6 181.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw3" d="M2.6 207.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw6" d="M2.6 233.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw3" d="M2.6 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw0" d="M2.6 284.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw3" d="M2.6 309.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw6" d="M2.6 335.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw3" d="M2.6 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw0" d="M2.6 386.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw7" d="M2.6 412.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw0" d="M2.6 437.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw7" d="M2.6 463.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw1" d="M2.6 489.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw2" d="M28.2 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw7" d="M28.2 28.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw2" d="M28.2 53.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw5" d="M28.2 79.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw6" d="M28.2 105.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw0" d="M28.2 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw5" d="M28.2 156.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw5" d="M28.2 181.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw3" d="M28.2 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw5" d="M28.2 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw0" d="M28.2 258.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw0" d="M28.2 284.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw6" d="M28.2 309.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw4" d="M28.2 335.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw7" d="M28.2 361.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw1" d="M28.2 386.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw2" d="M28.2 412.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw1" d="M28.2 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw2" d="M28.2 463.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw6" d="M28.2 489.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw4" d="M53.8 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw0" d="M53.8 28.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw0" d="M53.8 53.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw3" d="M53.8 79.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw7" d="M53.8 105.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw5" d="M53.8 130.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw5" d="M53.8 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw2" d="M53.8 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw6" d="M53.8 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw6" d="M53.8 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw1" d="M53.8 258.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw4" d="M53.8 284.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw4" d="M53.8 309.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw6" d="M53.8 335.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw1" d="M53.8 361.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw2" d="M53.8 386.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw6" d="M53.8 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw0" d="M53.8 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw7" d="M53.8 463.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw3" d="M53.8 489.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw0" d="M79.4 2.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw4" d="M79.4 28.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw1" d="M79.4 53.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw4" d="M79.4 79.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw2" d="M79.4 105.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw6" d="M79.4 130.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw2" d="M79.4 156.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw1" d="M79.4 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw3" d="M79.4 207.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw6" d="M79.4 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw7" d="M79.4 258.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw7" d="M79.4 284.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw6" d="M79.4 309.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw7" d="M79.4 335.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw3" d="M79.4 361.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw1" d="M79.4 386.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw4" d="M79.4 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw5" d="M79.4 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw6" d="M79.4 463.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw5" d="M79.4 489.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw1" d="M105.0 2.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw7" d="M105.0 28.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw4" d="M105.0 53.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw1" d="M105.0 79.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw6" d="M105.0 105.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw3" d="M105.0 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw1" d="M105.0 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw1" d="M105.0 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw3" d="M105.0 207.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw3" d="M105.0 233.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw0" d="M105.0 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw5" d="M105.0 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw1" d="M105.0 309.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw3" d="M105.0 335.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw6" d="M105.0 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw7" d="M105.0 386.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw2" d="M105.0 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw7" d="M105.0 437.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw1" d="M105.0 463.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw2" d="M105.0 489.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw1" d="M130.6 2.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw7" d="M130.6 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw3" d="M130.6 53.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M130.6 79.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw6" d="M130.6 105.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw1" d="M130.6 130.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw0" d="M130.6 156.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw3" d="M130.6 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw3" d="M130.6 207.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw6" d="M130.6 233.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw0" d="M130.6 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw6" d="M130.6 284.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw4" d="M130.6 309.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw7" d="M130.6 335.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw6" d="M130.6 361.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw0" d="M130.6 386.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw2" d="M130.6 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw5" d="M130.6 437.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw6" d="M130.6 463.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw4" d="M130.6 489.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw2" d="M156.2 2.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw4" d="M156.2 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw6" d="M156.2 53.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw2" d="M156.2 79.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw6" d="M156.2 105.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw1" d="M156.2 130.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw1" d="M156.2 156.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw1" d="M156.2 181.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw3" d="M156.2 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw4" d="M156.2 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw6" d="M156.2 258.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw5" d="M156.2 284.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw3" d="M156.2 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw7" d="M156.2 335.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw2" d="M156.2 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw0" d="M156.2 386.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw5" d="M156.2 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw5" d="M156.2 437.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw6" d="M156.2 463.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw1" d="M156.2 489.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw1" d="M181.8 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw1" d="M181.8 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw3" d="M181.8 53.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw5" d="M181.8 79.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw4" d="M181.8 105.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw1" d="M181.8 130.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw2" d="M181.8 156.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw6" d="M181.8 181.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw2" d="M181.8 207.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw2" d="M181.8 233.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw2" d="M181.8 258.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw5" d="M181.8 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw4" d="M181.8 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw2" d="M181.8 335.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw3" d="M181.8 361.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw7" d="M181.8 386.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw0" d="M181.8 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw0" d="M181.8 437.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw6" d="M181.8 463.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw0" d="M181.8 489.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw5" d="M207.4 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw2" d="M207.4 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw3" d="M207.4 53.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw3" d="M207.4 79.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw0" d="M207.4 105.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw7" d="M207.4 130.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw0" d="M207.4 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw2" d="M207.4 181.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw5" d="M207.4 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw7" d="M207.4 233.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw2" d="M207.4 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw3" d="M207.4 284.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw5" d="M207.4 309.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw0" d="M207.4 335.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw6" d="M207.4 361.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw7" d="M207.4 386.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw7" d="M207.4 412.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw7" d="M207.4 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw1" d="M207.4 463.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw2" d="M207.4 489.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw2" d="M233.0 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw4" d="M233.0 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw1" d="M233.0 53.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw1" d="M233.0 79.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw6" d="M233.0 105.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw0" d="M233.0 130.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw5" d="M233.0 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw5" d="M233.0 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw4" d="M233.0 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw4" d="M233.0 233.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw7" d="M233.0 258.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw1" d="M233.0 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw3" d="M233.0 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw1" d="M233.0 335.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw2" d="M233.0 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw4" d="M233.0 386.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw6" d="M233.0 412.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw4" d="M233.0 437.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw1" d="M233.0 463.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw0" d="M233.0 489.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw1" d="M258.6 2.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw0" d="M258.6 28.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw1" d="M258.6 53.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw5" d="M258.6 79.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw0" d="M258.6 105.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw1" d="M258.6 130.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw4" d="M258.6 156.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw3" d="M258.6 181.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw6" d="M258.6 207.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw5" d="M258.6 233.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw0" d="M258.6 258.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw2" d="M258.6 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw3" d="M258.6 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw5" d="M258.6 335.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw3" d="M258.6 361.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw3" d="M258.6 386.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw7" d="M258.6 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M258.6 437.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw1" d="M258.6 463.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw7" d="M258.6 489.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw2" d="M284.2 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw1" d="M284.2 28.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw5" d="M284.2 53.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw1" d="M284.2 79.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw6" d="M284.2 105.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw5" d="M284.2 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw1" d="M284.2 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw1" d="M284.2 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw4" d="M284.2 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw3" d="M284.2 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw3" d="M284.2 258.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw7" d="M284.2 284.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw4" d="M284.2 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw3" d="M284.2 335.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw7" d="M284.2 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw6" d="M284.2 386.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw1" d="M284.2 412.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw4" d="M284.2 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw1" d="M284.2 463.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw0" d="M284.2 489.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw6" d="M309.8 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw0" d="M309.8 28.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw7" d="M309.8 53.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw3" d="M309.8 79.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw6" d="M309.8 105.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw4" d="M309.8 130.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw2" d="M309.8 156.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw2" d="M309.8 181.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw0" d="M309.8 207.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw2" d="M309.8 233.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw3" d="M309.8 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw3" d="M309.8 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw4" d="M309.8 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw4" d="M309.8 335.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw4" d="M309.8 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw2" d="M309.8 386.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw3" d="M309.8 412.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw0" d="M309.8 437.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw1" d="M309.8 463.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw6" d="M309.8 489.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw4" d="M335.4 2.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw4" d="M335.4 28.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw4" d="M335.4 53.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw7" d="M335.4 79.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw6" d="M335.4 105.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw4" d="M335.4 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw1" d="M335.4 156.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw1" d="M335.4 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw5" d="M335.4 207.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw1" d="M335.4 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw0" d="M335.4 258.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw6" d="M335.4 284.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw5" d="M335.4 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw6" d="M335.4 335.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw4" d="M335.4 361.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw3" d="M335.4 386.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw5" d="M335.4 412.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw6" d="M335.4 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw7" d="M335.4 463.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw1" d="M335.4 489.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw5" d="M361.0 2.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw4" d="M361.0 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw6" d="M361.0 53.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw6" d="M361.0 79.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw5" d="M361.0 105.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw4" d="M361.0 130.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw0" d="M361.0 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw7" d="M361.0 181.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw5" d="M361.0 207.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw1" d="M361.0 233.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw1" d="M361.0 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw6" d="M361.0 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw4" d="M361.0 309.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw4" d="M361.0 335.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw3" d="M361.0 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw5" d="M361.0 386.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw4" d="M361.0 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw5" d="M361.0 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw0" d="M361.0 463.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw6" d="M361.0 489.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw7" d="M386.6 2.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw0" d="M386.6 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw7" d="M386.6 53.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw6" d="M386.6 79.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw5" d="M386.6 105.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw3" d="M386.6 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw6" d="M386.6 156.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw1" d="M386.6 181.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw1" d="M386.6 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw1" d="M386.6 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw2" d="M386.6 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw5" d="M386.6 284.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw4" d="M386.6 309.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw3" d="M386.6 335.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw3" d="M386.6 361.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M386.6 386.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw0" d="M386.6 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw7" d="M386.6 437.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M386.6 463.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw0" d="M386.6 489.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw0" d="M412.2 2.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw1" d="M412.2 28.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw5" d="M412.2 53.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw3" d="M412.2 79.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw4" d="M412.2 105.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw7" d="M412.2 130.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw2" d="M412.2 156.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw0" d="M412.2 181.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw4" d="M412.2 207.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw4" d="M412.2 233.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M412.2 258.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw1" d="M412.2 284.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw3" d="M412.2 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw5" d="M412.2 335.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw1" d="M412.2 361.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M412.2 386.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw5" d="M412.2 412.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt0 lgw6" d="M412.2 437.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw2" d="M412.2 463.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw3" d="M412.2 489.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt3 lgw1" d="M437.8 2.6h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw6" d="M437.8 28.2h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw3" d="M437.8 53.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt4 lgw7" d="M437.8 79.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw3" d="M437.8 105.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw2" d="M437.8 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw1" d="M437.8 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw4" d="M437.8 181.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw1" d="M437.8 207.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw1" d="M437.8 233.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt1 lgw4" d="M437.8 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw3" d="M437.8 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw7" d="M437.8 309.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw2" d="M437.8 335.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw1" d="M437.8 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw1" d="M437.8 386.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw5" d="M437.8 412.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw1" d="M437.8 437.8h20.5v20.5h-20.5z"/><path class="lgp1 lgt2 lgw0" d="M437.8 463.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw2" d="M437.8 489.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw3" d="M463.4 2.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw4" d="M463.4 28.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw1" d="M463.4 53.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw1" d="M463.4 79.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw3" d="M463.4 105.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw2" d="M463.4 130.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw4" d="M463.4 156.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt4 lgw7" d="M463.4 181.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw7" d="M463.4 207.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw5" d="M463.4 233.0h20.5v20.5h-20.5z"/><path class="lgp0 lgt2 lgw4" d="M463.4 258.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw7" d="M463.4 284.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw1" d="M463.4 309.8h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw0" d="M463.4 335.4h20.5v20.5h-20.5z"/><path class="lgp1 lgt1 lgw3" d="M463.4 361.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw5" d="M463.4 386.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt1 lgw3" d="M463.4 412.2h20.5v20.5h-20.5z"/><path class="lgp0 lgt3 lgw2" d="M463.4 437.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt5 lgw0" d="M463.4 463.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw7" d="M463.4 489.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt0 lgw1" d="M489.0 2.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt2 lgw5" d="M489.0 28.2h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw1" d="M489.0 53.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw3" d="M489.0 79.4h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw1" d="M489.0 105.0h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw5" d="M489.0 130.6h20.5v20.5h-20.5z"/><path class="lgp3 lgt0 lgw7" d="M489.0 156.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt4 lgw2" d="M489.0 181.8h20.5v20.5h-20.5z"/><path class="lgp3 lgt2 lgw1" d="M489.0 207.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw2" d="M489.0 233.0h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw1" d="M489.0 258.6h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw5" d="M489.0 284.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt3 lgw5" d="M489.0 309.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt1 lgw5" d="M489.0 335.4h20.5v20.5h-20.5z"/><path class="lgp0 lgt4 lgw1" d="M489.0 361.0h20.5v20.5h-20.5z"/><path class="lgp2 lgt3 lgw4" d="M489.0 386.6h20.5v20.5h-20.5z"/><path class="lgp1 lgt5 lgw5" d="M489.0 412.2h20.5v20.5h-20.5z"/><path class="lgp3 lgt5 lgw3" d="M489.0 437.8h20.5v20.5h-20.5z"/><path class="lgp0 lgt0 lgw7" d="M489.0 463.4h20.5v20.5h-20.5z"/><path class="lgp2 lgt5 lgw4" d="M489.0 489.0h20.5v20.5h-20.5z"/></g></g>
<g fill="#fff" fill-rule="evenodd"><path d="M62 413 L183 98 L236 98 L356 413 L296 413 L275 354 C235 392 190 413 130 413 Z M212 185 L257 296 C225 330 185 354 145 358 Z"/><rect x="365" y="98" width="64" height="316"/></g></svg>
    <p class="eyebrow">Aspire Atlas &middot; /aspire</p>
  </div>
  <div class="hero-grid">
    <div class="hero-copy">
      <h1>Creative Intelligence for your brand</h1>
      <p class="lede">/aspire connects this chat to your brand's Instagram, TikTok, and YouTube on Aspire Atlas, so you can see what's working, find and brief creators, and run your influencer program from one place. Ask in plain words: /aspire picks the right agent, checks with you before it saves anything, and publishes the results as pages you can share.</p>
      <p class="status">{STATUS}</p>
    </div>
    <div class="stage" aria-hidden="true">
      <figure class="win">
        <div class="win-bar"><span class="dots"><i></i><i></i><i></i></span>Chat<span class="sample">Sample</span></div>
        <div class="bub you"><code>/aspire:aspire</code><span class="caret"></span></div>
        <div class="bub bot"><p>What would you like to do?</p><div class="chips"><span>See how last week went</span><span>Find creators</span><span>Plan a launch</span></div></div>
      </figure>
      <figure class="win">
        <div class="win-bar">Weekly insights<span class="sample">Sample</span></div>
        <div class="kpis"><div><small>Reach</small><b>128K</b><em>+12%</em></div><div><small>Engagement</small><b>4.8%</b><em>+0.6 pts</em></div><div><small>Posts</small><b>9</b><em>1 breakout</em></div></div>
        <svg viewBox="0 0 240 64"><path class="ln d" d="M6 40H234"/><path class="ar" d="M6 54L44 46 82 50 120 32 158 38 196 14 234 20V60H6z"/><path class="k" d="M6 54L44 46 82 50 120 32 158 38 196 14 234 20"/><circle class="a" cx="196" cy="14" r="3.5"/></svg>
      </figure>
    </div>
  </div>
</header>

<section aria-labelledby="h-start">
  <div class="sec-head">
    <h2 id="h-start">How to get started</h2>
    <p>Type /aspire (or /aspire:aspire). It walks through these steps in order and picks up where you left off. Every question comes with options to pick from. Each small screen below is a sample of what you will see.</p>
  </div>
  <ol class="steps">
    <li class="step" id="step-connect"><div class="step-head"><span class="num">1</span><h3>Connect Aspire Atlas<span class="next" hidden>Next up</span></h3></div><figure class="screen" aria-hidden="true"><span class="sample">Sample</span><small>Aspire Atlas</small><b>Not connected yet</b><span class="btn">Connect</span></figure><p>/aspire checks the connection. If it isn't on, you get a Connect button.</p><p class="asked"><strong>You'll be asked:</strong> to sign in with your Atlas account, and which organization to use if you belong to more than one.</p></li>
    <li class="step" id="step-profile"><div class="step-head"><span class="num">2</span><h3>Set up your brand profile<span class="next" hidden>Next up</span></h3></div><figure class="screen" aria-hidden="true"><span class="sample">Sample</span><small>Brand name</small><span class="field">Northwind Coffee<span class="caret"></span></span><span class="btn">Create profile</span></figure><p>The profile holds your accounts and everything Atlas learns about the brand, for your whole team.</p><p class="asked"><strong>You'll be asked:</strong> the brand name as customers know it, then to confirm creating the profile.</p></li>
    <li class="step" id="step-accounts"><div class="step-head"><span class="num">3</span><h3>Link Instagram, TikTok, or YouTube<span class="next" hidden>Next up</span></h3></div><figure class="screen" aria-hidden="true"><span class="sample">Sample</span><small>Accounts to link</small><span class="pick on"><i></i>Instagram</span><span class="pick on"><i></i>TikTok</span><span class="pick"><i></i>YouTube</span></figure><p>You sign in to each network in your browser, and Atlas starts reading your posts. Instagram and TikTok feed search and hashtag tracking.</p><p class="asked"><strong>You'll be asked:</strong> which accounts to connect.</p></li>
    <li class="step" id="step-context"><div class="step-head"><span class="num">4</span><h3>Tell Atlas about the brand<span class="next" hidden>Next up</span></h3></div><figure class="screen" aria-hidden="true"><span class="sample">Sample</span><small>Your goal for the next 90 days</small><span class="chips"><span>Grow reach</span><span>Drive sales</span><span>Skip</span></span></figure><p>About seven short questions, saved to the brand's Atlas memory so teammates and later runs never ask again. Some offer to research the answer on the web; you see what it found before anything is saved. Then two optional offers: your brand's colors on Atlas pages, and your creator rates.</p><p class="asked"><strong>You'll be asked:</strong> what you sell and to whom, your role, competitors to watch, your goal for the next 90 days, any hard no's, creators you already work with, and hashtags to track. Most have a Skip option.</p></li>
    <li class="step" id="step-insights"><div class="step-head"><span class="num">5</span><h3>Get first insights<span class="next" hidden>Next up</span></h3></div><figure class="screen" aria-hidden="true"><span class="sample">Sample</span><small>Three pushes for next week</small><ol class="pushes"><li>Reel: behind the scenes</li><li>Carousel: top five picks</li><li>Story: a poll</li></ol></figure><p>/aspire reviews your linked accounts and shows what's working, with three content pushes for next week. The findings are saved in Atlas for your team.</p><p class="asked"><strong>You'll be asked:</strong> which account to review: your own, or another handle you name.</p></li>
  </ol>
</section>

<section aria-labelledby="h-do">
  <div class="sec-head">
    <h2 id="h-do">What you can do</h2>
    <p>Grouped by who usually asks. Anyone can type any of these. Each picture shows the kind of page you get, drawn with invented sample data.</p>
  </div>

  <div class="group">
    <div class="group-head"><h3>Social team</h3><p>Your own accounts, week to week</p></div>
    <div class="cards">
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="l" x="10" y="72" width="180" height="1.5"/><path class="ln d" d="M10 44H190"/><rect class="b" x="18" y="52" width="16" height="20"/><rect class="b" x="44" y="46" width="16" height="26"/><rect class="b" x="70" y="54" width="16" height="18"/><rect class="a" x="96" y="16" width="16" height="56"/><rect class="b" x="122" y="42" width="16" height="30"/><rect class="b" x="148" y="48" width="16" height="24"/><rect class="b" x="174" y="40" width="16" height="32"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>See how yesterday and last week went</h4><p class="job">Your posts against your own baseline, what broke out and why, and next steps. Can arrive in Slack or email on a schedule.</p><p class="say">how did last week go</p><p class="agent">Daily and weekly insights reports &middot; <code>atlas-daily-insights-report</code>, <code>atlas-weekly-insights-report</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="l" x="12" y="10" width="22" height="22"/><rect class="a" x="38" y="10" width="22" height="22"/><rect class="l" x="64" y="10" width="22" height="22"/><rect class="a" x="90" y="10" width="22" height="22"/><rect class="l" x="116" y="10" width="22" height="22"/><rect class="a" x="142" y="10" width="22" height="22"/><rect class="l" x="168" y="10" width="22" height="22"/><circle class="a" cx="18" cy="48" r="4"/><rect class="l" x="28" y="45" width="108" height="6"/><rect class="b" x="150" y="45" width="40" height="6"/><circle class="a" cx="18" cy="60" r="4"/><rect class="l" x="28" y="57" width="92" height="6"/><rect class="b" x="150" y="57" width="40" height="6"/><circle class="a" cx="18" cy="72" r="4"/><rect class="l" x="28" y="69" width="100" height="6"/><rect class="b" x="150" y="69" width="40" height="6"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Plan next week's posts</h4><p class="job">A review of your accounts and three content pushes, each with a format, a day, and a target.</p><p class="say">what should we push next week</p><p class="agent">Profile analyst &middot; <code>atlas-profile-analyst</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="s" x="10" y="8" width="180" height="68"/><rect class="a" x="20" y="16" width="70" height="7"/><rect class="a" x="20" y="31" width="9" height="9"/><rect class="l" x="36" y="33" width="90" height="5"/><rect class="b" x="148" y="31" width="32" height="9"/><rect class="a" x="20" y="45" width="9" height="9"/><rect class="l" x="36" y="47" width="76" height="5"/><rect class="b" x="148" y="45" width="32" height="9"/><rect class="l" x="20" y="59" width="9" height="9"/><rect class="l" x="36" y="61" width="98" height="5"/><rect class="b" x="148" y="59" width="32" height="9"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Brief creators for a week or a launch</h4><p class="job">Deliverables, guardrails, the creators to make them, and what each would cost, on one page.</p><p class="say">create a content brief for next week</p><p class="agent">Creator brief &middot; <code>atlas-creator-brief</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="b" x="14" y="10" width="46" height="64"/><path class="sf" d="M30 34l14 8-14 8z"/><circle class="a" cx="80" cy="22" r="7"/><path class="kw" d="M76.5 22l2.5 2.5 4.5-5"/><rect class="l" x="94" y="19" width="84" height="6"/><circle class="a" cx="80" cy="42" r="7"/><path class="kw" d="M76.5 42l2.5 2.5 4.5-5"/><rect class="l" x="94" y="39" width="64" height="6"/><circle class="c" cx="80" cy="62" r="7"/><path class="kw" d="M80 58v5M80 66v.5"/><rect class="l" x="94" y="59" width="76" height="6"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Check a post before it goes live</h4><p class="job">A draft or live post against its brief, your guidelines, and brand safety, with edit notes for the creator.</p><p class="say">check this draft against the brief</p><p class="agent">Content review &middot; <code>atlas-content-review</code></p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Creator and influencer team</h3><p>Finding creators and running programs</p></div>
    <div class="cards">
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="s" x="8" y="8" width="88" height="68"/><circle class="b" cx="28" cy="30" r="11"/><rect class="l" x="44" y="22" width="40" height="5"/><rect class="l" x="44" y="32" width="28" height="5"/><circle class="rg" cx="28" cy="58" r="8"/><circle class="k" stroke-width="3" cx="28" cy="58" r="8" stroke-dasharray="42 50" transform="rotate(-90 28 58)"/><rect class="l" x="44" y="52" width="40" height="5"/><rect class="l" x="44" y="62" width="30" height="5"/><rect class="s" x="104" y="8" width="88" height="68"/><circle class="b" cx="124" cy="30" r="11"/><rect class="l" x="140" y="22" width="40" height="5"/><rect class="l" x="140" y="32" width="28" height="5"/><circle class="rg" cx="124" cy="58" r="8"/><circle class="k" stroke-width="3" cx="124" cy="58" r="8" stroke-dasharray="30 50" transform="rotate(-90 124 58)"/><rect class="l" x="140" y="52" width="40" height="5"/><rect class="l" x="140" y="62" width="30" height="5"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Keep a campaign shortlist full</h4><p class="job">Scored candidates for each campaign, starting with creators who already know your brand. Decisions stay put between sessions.</p><p class="say">find creators for the campaign</p><p class="agent">Creator discovery &middot; <code>atlas-creator-discovery</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="s" x="10" y="8" width="180" height="20"/><circle class="b" cx="24" cy="18" r="6"/><rect class="l" x="36" y="15" width="90" height="6"/><circle class="a" cx="170" cy="18" r="7"/><path class="kw" d="M166.500 18l2.500 2.500 4.500-5"/><rect class="s" x="10" y="32" width="180" height="20"/><circle class="b" cx="24" cy="42" r="6"/><rect class="l" x="36" y="39" width="72" height="6"/><circle class="c" cx="170" cy="42" r="7"/><path class="kw" d="M166 42h8"/><rect class="s" x="10" y="56" width="180" height="20"/><circle class="b" cx="24" cy="66" r="6"/><rect class="l" x="36" y="63" width="100" height="6"/><circle class="b" cx="170" cy="66" r="7"/><path class="kw" d="M167 63l6 6M173 63l-6 6"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Vet a list of creators</h4><p class="job">Approve, maybe, or reject for each creator on a list or export, with the fit and brand safety evidence.</p><p class="say">vet these creators</p><p class="agent">Creator vetting &middot; <code>atlas-creator-vetting</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><circle class="b" cx="32" cy="30" r="18"/><rect class="l" x="14" y="56" width="36" height="5"/><rect class="l" x="19" y="66" width="26" height="5"/><rect class="l" x="76" y="14" width="108" height="8"/><rect class="a" x="76" y="14" width="80" height="8"/><rect class="l" x="76" y="30" width="108" height="8"/><rect class="a" x="76" y="30" width="56" height="8"/><rect class="l" x="76" y="46" width="108" height="8"/><rect class="c" x="76" y="46" width="94" height="8"/><rect class="b" x="76" y="62" width="22" height="14"/><rect class="a" x="102" y="62" width="22" height="14"/><rect class="b" x="128" y="62" width="22" height="14"/><rect class="b" x="154" y="62" width="22" height="14"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Look at one creator in depth</h4><p class="job">Audience, top posts, brand safety, past partnerships, and what they would cost.</p><p class="say">full profile for @handle</p><p class="agent">Creator profile &middot; <code>atlas-creator-profile</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="l" x="8" y="8" width="40" height="68"/><rect class="l" x="56" y="8" width="40" height="68"/><rect class="l" x="104" y="8" width="40" height="68"/><rect class="l" x="152" y="8" width="40" height="68"/><rect class="b" x="14" y="13" width="26" height="4"/><rect class="b" x="62" y="13" width="26" height="4"/><rect class="b" x="110" y="13" width="26" height="4"/><rect class="b" x="158" y="13" width="26" height="4"/><rect class="s" x="13" y="23" width="30" height="13"/><rect class="s" x="13" y="40" width="30" height="13"/><rect class="a" x="13" y="57" width="30" height="13"/><rect class="s" x="61" y="23" width="30" height="13"/><rect class="a" x="61" y="40" width="30" height="13"/><rect class="a" x="109" y="23" width="30" height="13"/><rect class="s" x="109" y="40" width="30" height="13"/><rect class="a" x="157" y="23" width="30" height="13"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Run an influencer program</h4><p class="job">Gifting, paid posts, ambassadors, or affiliates: outreach drafts, offers and counters, product shipping, posting checks, discount codes, and what you owe creators.</p><p class="say">set up our influencer program</p><p class="agent">Creator outreach, negotiation, product fulfillment, deliverable tracker, affiliate manager, program ledger &middot; <code>atlas-creator-outreach</code> and the rest</p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Performance and creative</h3><p>Ads, reuse, and selling through social</p></div>
    <div class="cards">
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="l" x="10" y="10" width="180" height="22"/><rect class="a" x="28" y="10" width="38" height="22"/><rect class="a" x="104" y="10" width="30" height="22"/><rect class="a" x="150" y="10" width="24" height="22"/><path class="kc" d="M28 6v30M66 6v30M104 6v30M134 6v30"/><rect class="a" x="10" y="44" width="22" height="7"/><rect class="l" x="38" y="45" width="90" height="5"/><rect class="b" x="146" y="44" width="44" height="7"/><rect class="a" x="10" y="56" width="22" height="7"/><rect class="l" x="38" y="57" width="74" height="5"/><rect class="b" x="146" y="56" width="44" height="7"/><rect class="a" x="10" y="68" width="22" height="7"/><rect class="l" x="38" y="69" width="98" height="5"/><rect class="b" x="146" y="68" width="44" height="7"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Find the hooks worth running as ads</h4><p class="job">Ranks videos on how they open and builds a cut list with timestamps for editors.</p><p class="say">best hooks to reuse as ads</p><p class="agent">Ad reuse &middot; <code>atlas-ad-reuse</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="b" x="10" y="8" width="62" height="64"/><path class="sf" d="M35 30l15 10-15 10z"/><circle class="a" cx="86" cy="18" r="4"/><rect class="l" x="96" y="14" width="94" height="8"/><rect class="a" x="110" y="14" width="30" height="8"/><circle class="c" cx="86" cy="40" r="4"/><rect class="l" x="96" y="36" width="94" height="8"/><rect class="c" x="146" y="36" width="26" height="8"/><circle class="b" cx="86" cy="62" r="4"/><rect class="l" x="96" y="58" width="94" height="8"/><rect class="b" x="100" y="58" width="22" height="8"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Break down one post</h4><p class="job">Reach, every brand on screen, brand safety, and disclosure, for deciding whether to sponsor, partner, or reuse.</p><p class="say">analyze this post</p><p class="agent">Post analysis &middot; <code>atlas-post-analysis</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="l" x="60" y="16" width="118" height="62"/><rect class="s" x="14" y="8" width="118" height="66"/><rect class="a" x="24" y="18" width="56" height="7"/><rect class="l" x="24" y="30" width="40" height="4"/><circle class="b" cx="38" cy="54" r="8"/><circle class="b" cx="68" cy="54" r="8"/><circle class="b" cx="98" cy="54" r="8"/><circle class="rg" cx="38" cy="54" r="11"/><circle class="k" cx="38" cy="54" r="11" stroke-dasharray="58 70" transform="rotate(-90 38 54)"/><circle class="rg" cx="68" cy="54" r="11"/><circle class="k" cx="68" cy="54" r="11" stroke-dasharray="50 70" transform="rotate(-90 68 54)"/><circle class="rg" cx="98" cy="54" r="11"/><circle class="k" cx="98" cy="54" r="11" stroke-dasharray="62 70" transform="rotate(-90 98 54)"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Pitch partnership ads</h4><p class="job">A casting deck of creators for paid partnership ads, ready to export to PowerPoint.</p><p class="say">build a PPA pitch</p><p class="agent">PPA pitch &middot; <code>atlas-ppa-pitch</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="b" x="10" y="8" width="40" height="32"/><rect class="b" x="56" y="8" width="40" height="32"/><rect class="b" x="102" y="8" width="40" height="32"/><rect class="b" x="148" y="8" width="40" height="32"/><rect class="b" x="10" y="46" width="40" height="32"/><rect class="b" x="56" y="46" width="40" height="32"/><rect class="b" x="102" y="46" width="40" height="32"/><rect class="b" x="148" y="46" width="40" height="32"/><circle class="a" cx="42" cy="16" r="6"/><path class="kw" d="M39 16l2 2 3.500-4"/><circle class="a" cx="134" cy="16" r="6"/><path class="kw" d="M131 16l2 2 3.500-4"/><circle class="c" cx="180" cy="16" r="6"/><path class="kw" d="M180 13v3.500l2 1.5"/><circle class="a" cx="88" cy="54" r="6"/><path class="kw" d="M85 54l2 2 3.500-4"/><circle class="c" cx="180" cy="54" r="6"/><path class="kw" d="M180 51v3.500l2 1.5"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Know what content you can use</h4><p class="job">A searchable library of creator content about your brand, with the rights on record and what expires soon.</p><p class="say">what's cleared for ads</p><p class="agent">Content library &middot; <code>atlas-content-library</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="s" x="10" y="8" width="56" height="32"/><rect class="b" x="16" y="13" width="44" height="14"/><rect class="l" x="16" y="31" width="24" height="5"/><circle class="a" cx="58" cy="33" r="3.5"/><rect class="s" x="72" y="8" width="56" height="32"/><rect class="b" x="78" y="13" width="44" height="14"/><rect class="l" x="78" y="31" width="24" height="5"/><rect class="s" x="134" y="8" width="56" height="32"/><rect class="b" x="140" y="13" width="44" height="14"/><rect class="l" x="140" y="31" width="24" height="5"/><circle class="a" cx="182" cy="33" r="3.5"/><rect class="s" x="10" y="46" width="56" height="32"/><rect class="b" x="16" y="51" width="44" height="14"/><rect class="l" x="16" y="69" width="24" height="5"/><rect class="s" x="72" y="46" width="56" height="32"/><rect class="b" x="78" y="51" width="44" height="14"/><rect class="l" x="78" y="69" width="24" height="5"/><circle class="a" cx="120" cy="71" r="3.5"/><rect class="s" x="134" y="46" width="56" height="32"/><rect class="b" x="140" y="51" width="44" height="14"/><rect class="l" x="140" y="69" width="24" height="5"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Plan an Instagram Shop or TikTok Shop</h4><p class="job">What's ready, the steps in order, the posts to tag, and creators for the shop. Your team does each step in the platforms.</p><p class="say">set up Instagram Shop</p><p class="agent">Shops &middot; <code>atlas-shops</code></p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Leadership</h3><p>Outcomes and decisions</p></div>
    <div class="cards">
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><path class="ar" d="M10 66L40 56 70 60 100 36 130 28V72H10z"/><path class="k" d="M10 66L40 56 70 60 100 36 130 28"/><circle class="a" cx="130" cy="28" r="3.5"/><circle class="a" cx="156" cy="18" r="7"/><circle class="sf" cx="156" cy="18" r="2"/><rect class="l" x="168" y="15" width="22" height="5"/><circle class="a" cx="156" cy="42" r="7"/><circle class="sf" cx="156" cy="42" r="2"/><rect class="l" x="168" y="39" width="22" height="5"/><circle class="a" cx="156" cy="66" r="7"/><circle class="sf" cx="156" cy="66" r="2"/><rect class="l" x="168" y="63" width="22" height="5"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Tell the quarter's story</h4><p class="job">The outcome first, the trend against last quarter, and three recommendations for next quarter.</p><p class="say">how did influencer do this quarter</p><p class="agent">Quarterly signal &middot; <code>atlas-quarterly-signal</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="a" x="15" y="8" width="170" height="11"/><rect class="a" x="31" y="22" width="138" height="11"/><rect class="a" x="47" y="36" width="106" height="11"/><rect class="a" x="61" y="50" width="78" height="11"/><rect class="c" x="75" y="64" width="50" height="11"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>See how a program is doing</h4><p class="job">Goals and pace, the creator funnel, spend, and what needs attention next.</p><p class="say">how is the program doing</p><p class="agent">Program dashboard &middot; <code>atlas-program-dashboard</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="s" x="10" y="6" width="180" height="16"/><circle class="a" cx="22" cy="14" r="5.5"/><rect class="l" x="34" y="11" width="100" height="6"/><rect class="a" x="148" y="10.5" width="34" height="7"/><rect class="s" x="10" y="26" width="180" height="16"/><circle class="b" cx="22" cy="34" r="5.5"/><rect class="l" x="34" y="31" width="84" height="6"/><rect class="b" x="148" y="30.5" width="34" height="7"/><rect class="s" x="10" y="46" width="180" height="16"/><circle class="b" cx="22" cy="54" r="5.5"/><rect class="l" x="34" y="51" width="94" height="6"/><rect class="b" x="148" y="50.5" width="34" height="7"/><rect class="s" x="10" y="66" width="180" height="16"/><circle class="b" cx="22" cy="74" r="5.5"/><rect class="l" x="34" y="71" width="70" height="6"/><rect class="b" x="148" y="70.5" width="34" height="7"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Know what to do next</h4><p class="job">One ranked list of next actions across programs, campaigns, and reports. Editors can approve on the page.</p><p class="say">what's next</p><p class="agent">Campaign orchestrator &middot; <code>atlas-campaign-orchestrator</code></p></article>
    </div>
  </div>

  <div class="group">
    <div class="group-head"><h3>Product and product marketing</h3><p>How you compare</p></div>
    <div class="cards">
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="a" x="10" y="12" width="84" height="14"/><rect class="b" x="94" y="12" width="48" height="14"/><rect class="c" x="142" y="12" width="48" height="14"/><rect class="l" x="10" y="42" width="44" height="5"/><rect class="a" x="62" y="40" width="90" height="4"/><rect class="b" x="62" y="46" width="60" height="4"/><rect class="l" x="10" y="56" width="44" height="5"/><rect class="a" x="62" y="54" width="40" height="4"/><rect class="b" x="62" y="60" width="100" height="4"/><rect class="l" x="10" y="70" width="44" height="5"/><rect class="a" x="62" y="68" width="70" height="4"/><rect class="b" x="62" y="74" width="64" height="4"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Hear what creators say about you and competitors</h4><p class="job">Share of voice, the features creators compare, friction they mention, and the language that's spreading.</p><p class="say">what are creators saying about us vs our competitors</p><p class="agent">Market signal &middot; <code>atlas-market-signal</code></p></article>
      <article class="case"><figure class="thumb" aria-hidden="true"><svg viewBox="0 0 200 84"><rect class="l" x="10" y="72" width="180" height="1.5"/><rect class="a" x="20" y="32" width="14" height="40"/><rect class="b" x="38" y="42" width="14" height="30"/><rect class="a" x="66" y="46" width="14" height="26"/><rect class="b" x="84" y="28" width="14" height="44"/><rect class="a" x="112" y="22" width="14" height="50"/><rect class="b" x="130" y="36" width="14" height="36"/><rect class="a" x="158" y="38" width="14" height="34"/><rect class="b" x="176" y="44" width="14" height="28"/></svg><figcaption class="sample">Sample</figcaption></figure><h4>Compare your accounts with competitors'</h4><p class="job">Engagement and format benchmarks against the competitor accounts Atlas indexes.</p><p class="say">review our account against competitors</p><p class="agent">Profile analyst &middot; <code>atlas-profile-analyst</code></p></article>
    </div>
  </div>
</section>

<section aria-labelledby="h-safe">
  <div class="sec-head"><h2 id="h-safe">What stays safe</h2><p>Nothing is saved to Atlas until you say yes.</p></div>
  <ol class="flow">
    <li class="node"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H10l-4 4v-4H5z"/></svg><b>It asks</b><span>A multiple-choice question before any change in Atlas.</span></li>
    <li class="node"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M8.500 12.500l2.500 2.500 4.500-5"/></svg><b>You confirm</b><span>Deleting or replacing something gets a question of its own.</span></li>
    <li class="node"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.700 3 3 7 3s7-1.300 7-3V6M5 12c0 1.700 3 3 7 3s7-1.300 7-3"/></svg><b>Then it saves</b><span>To your Atlas organization, where your team can find it.</span></li>
  </ol>
  <ul class="safe">
    <li><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg><p>Nothing goes to a creator or anyone else unless you ask in that session and confirm who gets it. Messages are drafted for you to review.</p></li>
    <li><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/></svg><p>A mailbox or store is used only through a connection you added yourself, after a confirmation each time.</p></li>
    <li><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg><p>Scheduled runs do only what you approved when you set them up. They never ask questions or delete anything, and deliver only to the Slack channels and email recipients you saved. If you turn on the hourly next-actions run, it carries out only what an Editor approved on its page, and only Atlas records and mailbox drafts. It never sends or orders.</p></li>
    <li><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><p>Pages /aspire publishes start private. You decide who to share them with.</p></li>
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

<footer class="atlas-footnote">
  <p>Ask "what can /aspire do" any time to open this page again.</p>
  <p>Aspire Atlas &middot; atlas.aspire.io</p>
  <p>Figures marked Sample are invented for illustration.</p>
  <p>No Atlas data on this page.</p>
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
