# CAS paid reference

The rules every part of a CAS campaign's paid side shares: which number each paid figure is and
where it is defined, how a figure is read and turned into a call on a named ad, how an ad is tied to
the variant it ran, how a cut is tagged and reviewed, and how a wave's results are diagnosed. The
**CAS campaign** section and its **Ad Performance** tab follow it, and so does every agent that
reviews a CAS campaign's paid creative or results: the creative baseline and draft feedback before
spend, the launch check, the weekly paid review, the wave diagnosis and the wave readout.

Each of those agents reads this file and its own section. None reads another agent's file: a rule
two of them need lives here or in the section this file points to, once.

A bold section name with no file beside it (**CAS campaign**, **Ad Performance**) is another part
of this skill; `SKILL.md`'s **Sections** index names its file.

## Contents

- [Four numbers called hook rate](#four-numbers-called-hook-rate)
- [The paid figures](#the-paid-figures)
- [Figures with no definition yet](#figures-with-no-definition-yet)
- [Enough data to read](#enough-data-to-read)
- [Reading the figures](#reading-the-figures)
- [Calls on a named ad](#calls-on-a-named-ad)
- [Before any figure: data traps](#before-any-figure-data-traps)
- [The campaign profile](#the-campaign-profile)
- [Tying an ad to its variant](#tying-an-ad-to-its-variant)
- [Element tags](#element-tags)
- [Reviewing a cut before spend](#reviewing-a-cut-before-spend)
- [Text placement and safe zones](#text-placement-and-safe-zones)
- [Diagnosing a wave](#diagnosing-a-wave)
- [Watching the ad that ran](#watching-the-ad-that-ran)
- [Writing a note or a call](#writing-a-note-or-a-call)

## Four numbers called hook rate

Four different figures carry the words "hook rate". They measure different things over different
posts, so a page names each one as below, never puts two in one column, and never compares one
with another.

| Name on a page | What it measures | Defined in | Read for |
| -------------- | ---------------- | ---------- | -------- |
| Ad hook rate | Plays of 3 seconds or more over impressions, for the brand's own Meta partnership ads | **Ad Performance**, **Reading the results** | The launch check, the weekly review, the wave diagnosis, the wave readout |
| TikTok 2-second view rate | 2-second views over impressions, TikTok's nearest figure to the ad hook rate. Its 6-second view rate is the nearest to an early hold. Atlas holds no TikTok ad results yet, so both come only from an export the person shares | The export, labelled as such | The weekly review and the diagnosis, when TikTok ran |
| Creator hook rate | Meta's average across the creator's own Reels (`instagram.reelsHookRate`), not one post's and not an ad's | **Creator Selection**, **The match score** | Casting, the creative baseline's context, and the diagnosis's casting check. TikTok has none |
| Hook result | Whether a briefed hook led, held or lagged in the creators' organic posts, from views per follower against each creator's median. It is a result, not a rate | **Hooks and CTAs**, **The hook review** | The next round's brief |

When the ad hook rate and the hook result disagree about a hook, the ad hook rate wins (**Hooks and
CTAs**, **The hook review**). A creator hook rate is never shown as a prediction of an ad hook rate,
and a Meta figure is never compared with a TikTok one: the platforms count views differently.

## The paid figures

Every paid figure has one definition, in **Ad Performance**. This file repeats none of the math:

- **Reading the results**: spend, impressions, CPM, ad hook rate, hold rate, link CTR, purchases,
  revenue, ROAS, cost per sale and days live, and the `search_ads` rules every read follows (one
  figure per currency, attribution windows, ratios from sums, no value is not zero).
- **The target and the floor**: the cost per sale target, the spend floor, the watch band, fatigue
  (`fatigueDays`) and stuck (`stuckDays`), each read from the campaign's saved decision defaults.
- **Status**: Winning, Testing, Watch, Fatigued and Retire, and when each applies.

When `list_ad_search_fields` lists a field that returns one of these figures already worked out,
read that field and don't work the figure out again, so a page and an agent show the same number.

Where each ad wins or loses is read as four stages, each answered by its own figures and each
pointing to a part of the video:

| Stage | The question | Meta figures | Part of the video |
| ----- | ------------ | ------------ | ----------------- |
| Stop | Did the opening stop the scroll? | Ad hook rate, CPM | The first 1 to 3 seconds |
| Hold | Did people keep watching? | Hold rate, the share still watching at 25%, 50%, 75% and 95%, average play time | The middle, where the drop falls |
| Act | Did viewers click? | Link CTR, clicks per viewer, cost per click | The CTA, the offer, the product reveal |
| Convert | Did clicks turn into the campaign's goal? | Results per click, cost per result, ROAS | Mostly the landing page and the offer; the creative only through what it promised |

## Figures with no definition yet

These have no definition in this skill yet: week over week change in cost per result, CPM and
click rate; pacing against budget; frequency for a window, counted once per person; the share still
watching at each point of the video; average play time; clicks per viewer and results per click;
and the thresholds behind fatigue, a spend bleed and a pause. An agent does not invent one, and
never works one out by adding up rows. It shows the figures above for each window it reads and
names, under the page's data gaps, each figure it could not work out. Once `search_ads` returns one,
**The paid figures** rule above applies.

## Enough data to read

Figures settle in funnel order, so a thin read limits its conclusions to the stages it can read and
says so.

| Figure | Readable after about |
| ------ | -------------------- |
| Ad hook rate, TikTok view rates | A few thousand impressions |
| Hold rate, average play time | 1,000 plays of 3 seconds |
| Link CTR | 10,000 impressions or 100 link clicks |
| Cost per result, ROAS | 20 to 30 results; under 10 it is directional only |

An ad in its first 2 to 3 days, or still learning, often looks worse and moves more than it will
once it settles. When single variants have spent too little, pool them (by creator, persona, length
or hook) before reading cost per result, and say which pooling was used. An ad under the campaign's
spend floor (**The target and the floor**) gets no call but Too early.

## Reading the figures

- **Judge each campaign on its own goal.** Read the optimization goal first. A purchase campaign is
  judged on ROAS, cost per purchase and conversion rate; an add to cart campaign on cost per add to
  cart, CTR and adds to cart per click; a traffic campaign on cost per click and CPM. A traffic
  campaign with no purchases is doing its job. Never put one goal's cost per result beside
  another's, and never compare across goals or placements as if they were like for like.
- **Against the account first.** Read an ad's figures against its own campaign's and the account's
  usual before anything else, and judge a winner against the client's own target. Only when the
  account has no baseline, use these ranges, and label them "generic" on the page:

  | Figure | Weak | Typical | Strong |
  | ------ | ---- | ------- | ------ |
  | Meta ad hook rate | Under 20% | 20 to 30% | Over 30% |
  | Meta hold rate | Under 25% | 25 to 40% | Over 40% |
  | TikTok 2-second view rate | Under 35% | 35 to 50% | Over 50% |
  | TikTok 6-second view rate | Under 15% | 15 to 25% | Over 25% |
  | Link CTR, prospecting | Under 0.7% | 0.7 to 1.5% | Over 1.5% |

  There is no generic range for cost per result or ROAS; those are always read against the target.
- **Explain the move, not only the number.** CPM up with CTR flat usually means auction pressure
  or a narrow audience. CTR down with CPM flat usually means the creative is wearing out.
- **Read the funnel together.**
  - Strong hook, weak hold: the opening promises something the body doesn't deliver, or the setup
    is slow.
  - Strong hook, few clicks per viewer: the opening stops people, but the body or the CTA doesn't
    sell. Keep the hook, fix the middle or the end.
  - Lower hook, more clicks per viewer: the opening filters for interested viewers, and can still
    win on cost per result.
  - Strong hold, weak CTR: people enjoy it but get no reason to buy; the product or the CTA is
    late, vague or buried.
  - Strong CTR, few results per click: the gap is after the click (price, the landing page, what
    the ad promised), not the creative. Say so before rewriting the video. Ads that show the price
    and the buy step before the click tend to raise results per click.
  - High CPM with normal engagement: the auction, the audience or fatigue. Check frequency and
    days live.
  - An average play time of 4 to 6 seconds is normal in a feed, so the reason to care, the brand
    and the product must land in the first 5 seconds. An average near 1 second means the opening
    loses people before anything is said.
  - Shares still watching are shares of each video's own length, so a shorter video looks better at
    95%. Convert each drop point to seconds before comparing two ads. The second where the share
    still watching drops hardest is the most useful timestamp in a review.
- **Fatigue** is several signals together, over time, on an ad that used to work: frequency
  climbing, hook rate and CTR falling while CPM rises, cost per result drifting up with no change to
  the targeting, budget or landing page. It is a reason to refresh the hooks on the proven body, not
  to drop the concept. On the **Ad Performance** tab, Fatigued is the status defined there.
- **Learning.** An ad set still learning, or limited in learning, isn't getting enough
  optimization events. Don't judge its cost per result harshly; the fix is the setup (merging ad
  sets, a broader audience), not the creative.
- **TikTok wears out faster.** TikTok creative tires two to three times faster than Meta's, so a
  click rate falling within the week is an early sign to queue a refresh, even while the weekly cost
  per result still looks fine.

## Calls on a named ad

Every call names the ad exactly as the data spells it, a verb, an amount, and one line of
evidence with its numbers. The agent proposes; an Editor approves every scale, cut and budget move,
and nothing changes an ad.

| Call | When |
| ---- | ---- |
| Scale | It wins on its goal's figures and holds over the window. Raise its budget 15 to 20% every 2 to 3 days, so the ad set doesn't go back into learning; a bigger jump goes into a duplicate |
| Pause | It has spent enough to judge, it is clearly worse than its campaign this week, and the period to date confirms it. Name what the video shows as the likely cause (hook rate, average play time). Pause it outright: never lower the budget on an ad with no results |
| Pause to clean up | The platform has nearly stopped delivering it and its cost per result to date is several times the average, so it can't pick up spend when budgets move |
| Watch | It is at or over the spend floor but under the figures in **Enough data to read**. Give the figure and the date that decide it ("pause next week if cost per add to cart stays above USD 150") |
| Re-cut | It has volume and sits somewhat above average, or it has a proven hook with a weak middle or CTA. Write the re-cut as a recipe (**Diagnosing a wave**, **What to make next**) |
| Swap the hook | Proven creative that is fatiguing: keep the body, try new hooks on it |
| Too early | It is under the campaign's spend floor (**The target and the floor**). Say how much spend it needs before it is judged |

A budget shift between campaigns or platforms moves in steps of 10 to 20%, never all at once,
because the cheaper one's cost rises as spend is added and the platforms attribute differently.
Shifts net to zero unless the person asked to change the total budget.

## Before any figure: data traps

- **Reach is not additive.** Reach summed across ads, ad sets, campaigns or weeks counts people
  more than once. Never add reach up or work a total out from parts. `search_ads` gives reach and
  frequency only per ad over a single day, so for any longer window leave both blank and say why.
- **Period to date, differenced.** A week worked out as one period to date minus another is
  directional only, because late conversions move between weeks, and it is never done for reach or
  frequency. Say so beside the figure.
- **Custom conversion events.** A column named like `Event_1` means nothing by its name. Map it from
  the result indicator and its size against a known figure (adds to cart outnumber purchases), and
  say which mapping was used.
- **Mid-week changes.** An ad paused or launched mid-week still counts as live that week; say "as of
  {date}". When the optimization event changed inside the window, say which figures span the change.
- **Changes behind a move.** Tie each week over week move to a dated change where one exists (a new
  creative, a paused ad, an event switch, an audience or budget change), and follow up on last
  week's next steps.

## The campaign profile

Every review starts from what each video was meant to do. Read the campaign's brief, each lane's
concept and the creator records (**CAS campaign**) before watching anything, and keep a short
profile:

1. **Structure.** How the footage was meant to be used (for example, 2 to 3 hooks, a body and 2 to
   3 CTAs, cut into several variants), and the variant scheme. Read the scheme from the campaign,
   never assume one: it decides which comparisons are clean. A variant made for the creator's own
   feed is not judged on paid figures.
2. **Lanes.** For each: the persona or concept, the product, the framework, and why the brief chose
   it. The why is the hypothesis a diagnosis grades.
3. **Claims.** Every approved claim, by product, with the disclaimer it needs. A claim not in the
   list is off brief.
4. **Hooks and CTAs.** Each with a short id (H1, H2, CTA-A, CTA-B), and how many each creator
   recorded: the hooks never used as an opener are the cheapest re-edits.
5. **Guidelines as checks.** Each guideline as a yes or no with a timestamp ("product introduced
   within 10 seconds", "captions in the first 3 seconds"), for the creator's raw footage and for the
   edited cut separately.
6. **Earlier learnings** the brief relies on: the first hypotheses to check with new results.
7. **The usage window.** Every new cut must launch inside it.

When a concept scripts each variant line by line, the script is the design intent, and checking
what the creator said and what the edit used against it (script fidelity) is part of every review.
With no brief, work from the video alone and say so at the top.

## Tying an ad to its variant

An ad belongs to a variant when it ran that variant's live post, matched as **Ad Performance**,
**Where the results come from**, step 3 says. Every other ad is not matched: it is in no figure on a
page the client sees, and is listed for the agency only. A wrong match invalidates every conclusion
built on it, so when a match isn't certain, ask for it rather than guess.

- **One ad name, many ad sets.** The same ad usually runs in several ad sets. Put its rows together
  within its campaign before judging it.
- **Near duplicates.** A name with `(2)`, a misspelling or a rename may be the same creative.
  Confirm before putting two together, and never put an old flight and a new flight of the same
  creative together without saying so.
- **Names before launch.** The planned ad names map one to one to a creator and a variant. When
  they don't, the creative baseline proposes names before launch, because names fixed after launch
  break the match. Atlas matches an ad by the campaign's naming convention, `adNaming` in
  `get_cas_campaign`: fill every template it holds (`ad` for the ad name, `adSet` for the ad set
  name, `{wave}` the wave being read) and name its `marker`, which the campaign or ad set name must
  hold. Only when no `adNaming` is returned, propose
  `{Brand}_{Wave}_{Creator}_{Persona}_{Product}_{Length}s_{HookID}_{CTAID}`, and say ads named that
  way can't be matched until a convention is saved.
- **Records to doubt.** Before trusting the creator records, check for a creator listed twice, notes
  copied from another creator, a variant label that doesn't match its file, and one folder of final
  files shared by several variants. Ask rather than assume.

**The variant row.** Each variant gets one row, which every comparison runs from: the ad name, the
creator, wave, persona, product, variant and length; the opening line; the hook id (or
`improvised`) and the hook text the edit added; when the product is first clearly seen and first
named; each claim with its timestamp (`claim@0:03`) and whether its disclaimer is right; the CTA id;
the edit treatments; the guideline checks; the final file; and the date its usage ends. Edit
treatments are recorded in their final state, as these codes: `hook-text-added`, `hook-swapped`,
`claim-moved-earlier`, `usp-popups-added`, `captions-added`, `product-name-added`, `clip-swapped`,
`section-cut`, `disclaimer-fixed`, `brand-text-style`, `transition-cleaned`, `pacing-slowed`.

## Element tags

Every reviewed cut is tagged with these, so results compare across ads and waves. Something that
fits none is `other: {a few words}`, never a new tag.

| Element | Tags |
| ------- | ---- |
| Hook type, first 3 seconds | `problem-callout`, `bold-claim`, `question`, `pattern-interrupt`, `result-first`, `demo-first`, `relatable-moment`, `social-proof`, `negative/contrarian`, `story-open`, `green-screen / reaction` |
| Hook delivery | `spoken`, `text-only`, `both`; and whether the first frame works muted |
| Format | `talking-head`, `voiceover-b-roll`, `demo/tutorial`, `unboxing`, `get-ready-with-me`, `day-in-the-life`, `before-after`, `review/testimonial`, `listicle`, `skit`, `street-interview`, `comparison/vs`, `reply-to-comment`, `mashup` |
| Talent | Creator type (`micro`, `macro`, `expert/professional`, `customer`, `founder`, `employee`), fit with the target buyer, delivery (`conversational`, `high-energy`, `calm/asmr`, `scripted-feeling`) |
| Proof | `live-demo`, `before-after`, `personal-result`, `stats/claims`, `reviews-on-screen`, `expert-endorsement`, `comparison`, `none` |
| Product moment | The second the product is first clearly seen and first named. A reveal after about 5 to 7 seconds often protects the hook rate but can cost clicks |
| Audio | `trending-sound`, `original-voice`, `voice+music-bed`, `music-only`, `asmr/ambient`; and whether there are captions |
| Text overlay | `none`, `hook-only`, `captions`, `key-points`, `heavy` |
| Pacing | `slow`, `moderate`, `fast`; and any stretch of 3 seconds or more with no visual change |
| CTA | `verbal`, `text`, `both`, `none`; style `direct`, `offer-led`, `soft`, `urgency`; and its timestamp |
| Native-ness | `native` (looks like an organic post), `polished-ugc`, `ad-like`. Ad-like visuals often weaken stop and hold |
| Length | Total seconds, against the average play time |
| Edit layer | What the edit added, tagged apart from the creator's own delivery: `hook-text` (centre or bottom, from the first frame or popped in), `usp-popups`, `captions`, `brand-text-style`, `disclaimer-overlay`, `music-added` |
| Campaign | Persona, product, hook id, claim ids with timestamps, CTA id and the guideline checks (**The campaign profile**) |

The edit layer is tagged apart because it is fixed by a re-edit, while the creator's delivery needs
a reshoot or another creator.

## Reviewing a cut before spend

Before spend there are no results, so a review says what each variant will test, never how it will
do. It starts from **The campaign profile**.

**Breaking a cut down.** A timestamped breakdown in beats: Hook (0 to 3 seconds), Setup, Proof,
Product moment, CTA, each tagged (**Element tags**).

**The checks.**

- **Hook, first 3 seconds.** It works muted, with on-screen text or a visual carrying it. It names
  the pain or the payoff with a concrete detail. It sounds like the creator, not brand copy, and
  works before the brand is named. The first frame isn't black, a logo or a slow fade.
- **Story and pacing.** Where attention will drop: static shots with no voiceover, B-roll held
  longer than the beat needs, a setup past about 5 seconds before anything happens, an opener a
  cold audience can't follow ("Last month I shared…"). The product shown and named as early as the
  brief asks. One clear CTA that matches the brief.
- **Brief and compliance.** Every claim is in the approved claims and carries its disclaimer. The
  brief's must-nots are met. Script fidelity: lines dropped, reordered or improvised against the
  concept.
- **Text placement**, below.

**For a whole variant set (the baseline)**, also: the variant rows (**Tying an ad to its variant**);
a difference map, for each pair that will run side by side, of what really differs, what it will
test, and the one figure that will answer it (a hook swap is answered by ad hook rate, 15 seconds
against 45 by hold rate and cost per result); the pairs that differ in nothing that matters, which
split spend and teach nothing; the tests the brief intended that no variant covers; and the ad names.
The diagnosis starts from this baseline, so it is kept on its page as tables that can be read back,
and as the campaign's `baseline` finding (**CAS campaign**, **Working state (findings)**).

## Text placement and safe zones

Measure where captions, hook text, end cards and disclaimers sit on full-size frames, as a share of
the frame's height, never on contact-sheet thumbnails, which make text look lower than it is. Check
every cut, frame by frame, not only the first frame. Flag text that:

1. **Covers what matters**: the creator's face, the product, or a key demo moment. This comes first.
2. **Is hard to read**: more than 2 lines, low contrast on busy footage (it needs an outline or a
   soft shadow), or too small for a phone.
3. **Sits in a screen zone**, where the app covers a 9:16 video. Keep faces, the product and key
   text out of:

   | Platform | Always covered | Keep clear where the shot allows |
   | -------- | -------------- | -------------------------------- |
   | Instagram and Facebook Reels ads | The bottom 20% (below 1,536 of 1,920 pixels): the ad's caption and button | The bottom 35%, the top 14% and the right 15% |
   | TikTok | The bottom 20% (caption and sound) | The bottom 25%, the right 15% (the like, comment and share buttons) and a thin strip at the top |

   The zones move with app updates, so they are approximate: flag only clear overlaps.

When these conflict, the face and the product win: keep text readable and off them, move it as
close to the safe area as the shot allows, and say which trade-off was made. Report the measured
positions. Only text in the always covered band is a must fix for its position.

## Diagnosing a wave

Once ads have results, a diagnosis finds where each ad wins or loses, ties that to seconds and
elements of the video, and hands back what to make next. A claim that only describes the video
("great energy") or only reads a figure ("CTR is low") is not a finding: every finding points at a
timestamp or an element, and at a figure. It starts from the baseline's variant rows and difference
map, checking what changed since, rather than rebuilding them. Scale, pause and budget calls are the
weekly review's (**Calls on a named ad**); the diagnosis explains why and what to make.

**Read the variants as an experiment, in this order, and name the level of each finding:**

1. **Within a creator** (same footage, same talent): differences come from the hook, the length,
   the claim order and the edit. The cleanest read on editing.
2. **Within a persona or product, across creators**: differences come mostly from talent and how
   each creator carried the same concept.
3. **Across personas or products**: differences come from the concept and the product. The most
   tangled; it needs the most data.

A hook that wins inside one creator's set is strong evidence. A persona that wins on one creator's
back is not.

**Confidence, stated on every finding:**

- **Strong**: the shift lines up with a timestamp, or the element differs between otherwise matched
  variants with a clear gap.
- **Likely**: it fits the funnel figures and known patterns, but isn't isolated.
- **Hypothesis**: plausible, and needs a test.

**Also graded, when the campaign profile has them:** each lane's hypothesis (did the concept work
as the brief intended, did the earlier learnings hold); each recurring edit the team made (did the
variants with it beat those without); which claims appear in winners and losers, and how early;
whether the account supports the framework chosen for each concept; and the casting check, each
creator's ad hook rate beside the creator hook rate they were cast on, each labelled (**Four numbers
called hook rate**). One account is one data point: say "consistent with", not "proves". A live ad
with a claim outside the approved list, or a missing disclaimer, is flagged so nobody builds on it.

**What to make next**, cheapest first, each with its hypothesis, the one figure that would show it
worked, the effort, and the date inside the usage window it must launch by. Change one main thing
per variation where possible.

1. A re-cut from footage already shot: a hook never used as an opener, a trim, the product or
   claim earlier, another length, another CTA, new text on screen. Written as a recipe an editor
   can follow: the source variant, the timestamps to use, the order, the text, the length.
2. A stack of 3 to 5 new openings on the proven body.
3. The same persona with a new creator, when the concept wins but the talent may be carrying it.
4. A new concept, only when the concept itself is the problem.

**Two versions.** The team's version holds everything. The client's version keeps the verdict,
what is working, what to make next and the next wave's changes, and leaves out grades of named
people's notes ("centred hook text did better", never whose note it was), casting flags, comparisons
of a creator with the rest of the pool, and the team's own working terms. Every claim in either
cites the variant and the figure, and marks where the sample is thin.

## Watching the ad that ran

Tie every claim about the creative to a timestamp. Sources, best first:

1. The ad's own video, from `search_ads` with `groupBy` `ad`. An ad with no video says why.
2. The creator's organic post (its transcript in Atlas, or the post). Say that the ad may run a
   different cut.
3. The brief or the concept. These show what was meant, not what ran.

Check the on-screen captions against the transcript; they often differ.

## Writing a note or a call

- Every note names the variant, the timestamp, what is wrong, why it matters, and exactly what to do
  (cut, swap, move, re-time, re-letter). "Tighten the middle" is not a note; "cut the B-roll from
  0:08 to 0:12, it holds on a still product shot with no voiceover" is.
- Order fixes by severity. **Must fix before launch**: a compliance gap or missing disclaimer, text
  over the face or the product, text in the always covered band, no muted hook, a black first
  frame, the wrong product named. **Should fix**: a pacing drop, a late product reveal, a weak or
  improvised hook where a scripted one exists, script drift. **Consider**: lower payoff changes to
  style.
- Prefer fixes from footage that already exists (unused hooks, B-roll, other takes) over a reshoot,
  and say when only a reshoot will do. Never blame the creative for a landing page, offer or
  tracking problem.
- Describe an edit, never the reviewer who asked for it.
- The verdict comes first, in a line the reader gets without scrolling, then the single change most
  likely to move the result.
