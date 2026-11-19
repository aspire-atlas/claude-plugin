# CAS paid reference

The rules every part of a CAS campaign's paid side shares: which number each paid figure is and
where it is defined, how a figure is read and turned into a call on a named ad, how an ad is tied to
the variant it ran, and how a cut is reviewed before spend. The **CAS campaign** section and its
**Ad Performance** tab follow it, and so does every agent that reviews a CAS campaign's paid
creative or results: the creative baseline and draft feedback before spend, the launch check, the
weekly paid review, the wave diagnosis and the wave readout.

Each of those agents reads this file and its own section. None reads another agent's file: a rule
two of them need lives here or in the section this file points to, once.

A bold section name with no file beside it (**CAS campaign**, **Ad Performance**) is another part
of this skill; `SKILL.md`'s **Sections** index names its file.

## Contents

- [Four numbers called hook rate](#four-numbers-called-hook-rate)
- [The paid figures](#the-paid-figures)
- [Figures with no definition yet](#figures-with-no-definition-yet)
- [Reading the figures](#reading-the-figures)
- [Calls on a named ad](#calls-on-a-named-ad)
- [Before any figure: data traps](#before-any-figure-data-traps)
- [Tying an ad to its variant](#tying-an-ad-to-its-variant)
- [Reviewing a cut before spend](#reviewing-a-cut-before-spend)
- [Text placement and safe zones](#text-placement-and-safe-zones)
- [Watching the ad that ran](#watching-the-ad-that-ran)
- [Writing a note or a call](#writing-a-note-or-a-call)

## Four numbers called hook rate

Four different figures carry the words "hook rate". They measure different things over different
posts, so a page names each one as below, never puts two in one column, and never compares one
with another.

| Name on a page | What it measures | Defined in | Read for |
| -------------- | ---------------- | ---------- | -------- |
| Ad hook rate | Plays of 3 seconds or more over impressions, for the brand's own Meta partnership ads | **Ad Performance**, **Reading the results** | The launch check, the weekly review, the wave diagnosis, the wave readout |
| TikTok ad hook rate | 2-second views over impressions, for TikTok ads. Atlas holds no TikTok ad results yet, so it comes only from an export the person shares | The export, labelled as such | The weekly review, when TikTok ran |
| Creator hook rate | Meta's average across the creator's own Reels (`instagram.reelsHookRate`), not one post's and not an ad's | **Creator Selection**, **The match score** | Casting, and the creative baseline's context. TikTok has none |
| Hook result | Whether a briefed hook led, held or lagged in the creators' organic posts, from views per follower against each creator's median. It is a result, not a rate | **Hooks and CTAs**, **The hook review** | The next round's brief |

When the ad hook rate and the hook result disagree about a hook, the ad hook rate wins (**Hooks and
CTAs**, **The hook review**). A creator hook rate is never shown as a prediction of an ad hook rate,
and a Meta rate is never compared with a TikTok one.

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

Where each ad wins or loses is read as four stages, each answered by its own figure:

| Stage | The question | Figure |
| ----- | ------------ | ------ |
| Stop | Did the opening stop the scroll? | Ad hook rate |
| Hold | Did people keep watching? | Hold rate, the share still watching at 25%, 50%, 75% and 95% of the video, average play time |
| Act | Did viewers click? | Clicks per viewer (link clicks over 3 second plays) |
| Convert | Did clicks turn into the campaign's goal? | Results per click |

## Figures with no definition yet

These have no definition in this skill yet: week over week change in cost per result, CPM and
click rate; pacing against budget; frequency for a window, counted once per person; the share still
watching at each point of the video; average play time; clicks per viewer and results per click;
and the thresholds behind fatigue, a spend bleed and a pause. An agent does not invent one, and
never works one out by adding up rows. It shows the figures above for each window it reads and
names, under the page's data gaps, each figure it could not work out. Once `search_ads` returns one,
**The paid figures** rule above applies.

## Reading the figures

- **Judge each campaign on its own goal.** Read the optimization goal first. A purchase campaign is
  judged on ROAS, cost per purchase and conversion rate; an add to cart campaign on cost per add to
  cart, CTR and adds to cart per click; a traffic campaign on cost per click and CPM. A traffic
  campaign with no purchases is doing its job. Never put one goal's cost per result beside
  another's.
- **Against the account first.** Read an ad's figures against its own campaign's and account's
  average before any outside benchmark; there is no reliable benchmark across accounts. As rough
  context only, a Meta ad hook rate near 10% is a scroll past, the low to mid 20s is typical, and
  the upper 30s to 40% is strong.
- **Explain the move, not only the number.** CPM up with CTR flat usually means auction pressure
  or a narrow audience. CTR down with CPM flat usually means the creative is wearing out.
- **Read the funnel together.**
  - A high hook rate with few clicks per viewer: the opening stops people, but the body or the CTA
    doesn't sell. Keep the hook, fix the middle or the end.
  - A lower hook rate with more clicks per viewer: the opening filters for interested viewers, and
    can still win on cost per result.
  - Normal clicks with few results per click: the gap is after the click (price, the landing page,
    what the ad promised), not the hook. Ads that show the price and the buy step before the click
    tend to raise results per click.
  - An average play time of 4 to 6 seconds is normal in a feed, so the reason to care, the brand
    and the product must land in the first 5 seconds. An average near 1 second means the opening
    loses people before anything is said.
  - Shares still watching are shares of each video's own length, so a shorter video looks better at
    95%. Convert each drop point to seconds before comparing two ads.
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
| Watch | It has spent too little to judge. Give the figure and the date that decide it ("pause next week if cost per add to cart stays above USD 150") |
| Re-cut | It has volume and sits somewhat above average, or it has a proven hook with a weak middle or CTA. Write the re-cut as a recipe: what to cut, what to move earlier, what to add on screen |
| Swap the hook | Proven creative that is fatiguing: keep the body, try new hooks on it |
| Too early | New creative with little spend. Say how much spend it needs before it is judged. An ad under the campaign's spend floor (**The target and the floor**) is always too early |

A budget shift between campaigns or platforms moves in steps of 10 to 20%, never all at once,
because the cheaper one's cost rises as spend is added and the platforms attribute differently.
Shifts net to zero unless the person asked to change the total budget.

## Before any figure: data traps

- **Reach is not additive.** Reach summed across ads, ad sets, campaigns or weeks counts people
  more than once. Never add reach up or work a total out from parts; read it for the window, or
  leave it blank and say why. The same holds for frequency.
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

## Tying an ad to its variant

An ad belongs to a variant when it ran that variant's live post, matched as **Ad Performance**,
**Where the results come from**, step 3 says. Every other ad is not matched: it is in no figure on a
page the client sees, and is listed for the agency only.

- **One ad name, many ad sets.** The same ad usually runs in several ad sets. Put its rows together
  within its campaign before judging it.
- **Near duplicates.** A name with `(2)`, a misspelling or a rename may be the same creative.
  Confirm before putting two together, and never put an old flight and a new flight of the same
  creative together without saying so.
- **Names before launch.** The planned ad names map one to one to a creator and a variant. When
  they don't, the creative baseline proposes names before launch, because names fixed after launch
  break the match.

## Reviewing a cut before spend

Before spend there are no results, so a review says what each variant will test, never how it will
do. It reads the brief, each lane's concept and the creator records first: they say what each video
was meant to do. It reads the variant scheme from the campaign, never assumes one. With no brief,
it works from the video alone and says so at the top.

**Breaking a cut down.** A timestamped breakdown in beats: Hook (0 to 3 seconds), Setup, Proof,
Product moment, CTA. The edit layer (text hooks, pop-ups, captions, brand styling) is tagged apart
from the creator's own delivery, because one is fixed by a re-edit and the other by a reshoot.

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

**For a whole variant set (the baseline)**, also: one row per variant (hook, opening line, when the
product is first seen and named, claims with timestamps, CTA, edit treatments); a difference map,
for each pair that will run side by side, of what really differs, what it will test, and the one
figure that will answer it (a hook swap is answered by ad hook rate, 15 seconds against 45 by hold
rate and cost per result); the pairs that differ in nothing that matters, which split spend and
teach nothing; and the ad names (**Tying an ad to its variant**).

## Text placement and safe zones

Measure where captions, hook text, end cards and disclaimers sit on full-size frames, as a share of
the frame's height, never on contact-sheet thumbnails, which make text look lower than it is. Check
every cut, frame by frame, not only the first frame. Flag text that:

1. **Covers what matters**: the creator's face, the product, or a key demo moment. This comes first.
2. **Is hard to read**: more than 2 lines, low contrast on busy footage (it needs an outline or a
   soft shadow), or too small for a phone.
3. **Sits in a screen zone.** On a 9:16 Reels ad the bottom 20% (below 1,536 of 1,920 pixels) is
   always under the ad's caption and button. Keep key text out of the bottom 35%, the top 14% and
   the right 15% where the shot allows.

When these conflict, the face and the product win: keep text readable and off them, move it as
close to the safe area as the shot allows, and say which trade-off was made. Report the measured
positions. Only text in the bottom 20% is a must fix for its position.

## Watching the ad that ran

Tie every claim about the creative to a timestamp. Sources, best first:

1. The ad's own video, from `search_ads` with `groupBy` `ad`. An ad with no video says why.
2. The creator's organic post (its transcript in Atlas, or the post). Say that the ad may run a
   different cut.
3. The brief or the concept. These show what was meant, not what ran.

## Writing a note or a call

- Every note names the variant, the timestamp, what is wrong, why it matters, and exactly what to do
  (cut, swap, move, re-time, re-letter). "Tighten the middle" is not a note; "cut the B-roll from
  0:08 to 0:12, it holds on a still product shot with no voiceover" is.
- Order fixes by severity. **Must fix before launch**: a compliance gap or missing disclaimer, text
  over the face or the product, text in the bottom 20%, no muted hook, a black first frame, the
  wrong product named. **Should fix**: a pacing drop, a late product reveal, a weak or improvised
  hook where a scripted one exists, script drift. **Consider**: lower payoff changes to style.
- Prefer fixes from footage that already exists (unused hooks, B-roll, other takes) over a reshoot,
  and say when only a reshoot will do.
- Describe an edit, never the reviewer who asked for it.
- The verdict comes first, in a line the reader gets without scrolling.
