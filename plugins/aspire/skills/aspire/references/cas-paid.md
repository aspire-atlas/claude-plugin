# CAS paid reference

The rules every part of a CAS campaign's paid side shares: which number each paid figure is, where
it is defined, and how an ad is tied to the variant it ran. The **CAS campaign** section and its
**Ad Performance** tab follow it, and so does every agent that reviews a CAS campaign's paid
creative or results: the creative baseline before spend, the launch check, the weekly paid review,
the wave diagnosis and the wave readout.

Each of those agents reads this file and its own section. None reads another agent's file: a rule
two of them need lives here or in the section this file points to, once.

A bold section name with no file beside it (**CAS campaign**, **Ad Performance**) is another part
of this skill; `SKILL.md`'s **Sections** index names its file.

## Contents

- [Three numbers called hook rate](#three-numbers-called-hook-rate)
- [The paid figures](#the-paid-figures)
- [Figures with no definition yet](#figures-with-no-definition-yet)
- [Tying an ad to its variant](#tying-an-ad-to-its-variant)

## Three numbers called hook rate

Three different figures carry the words "hook rate" in this skill. They measure different things
over different posts, so a page names each one as below, never puts two in one column, and never
compares one with another.

| Name on a page | What it measures | Defined in | Read for |
| -------------- | ---------------- | ---------- | -------- |
| Ad hook rate | Plays of 3 seconds or more over impressions, for the brand's own partnership ads | **Ad Performance**, **Reading the results** | The launch check, the weekly review, the wave diagnosis, the wave readout |
| Creator hook rate | Meta's average across the creator's own Reels (`instagram.reelsHookRate`), not one post's and not an ad's | **Creator Selection**, **The match score** | Casting and the creative baseline's context. TikTok has none |
| Hook result | Whether a briefed hook led, held or lagged in the creators' organic posts, from views per follower against each creator's median. It is a result, not a rate | **Hooks and CTAs**, **The hook review** | The next round's brief |

When the ad hook rate and the hook result disagree about a hook, the ad hook rate wins (**Hooks and
CTAs**, **The hook review**). A creator hook rate is never shown as a prediction of an ad hook rate.

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

## Figures with no definition yet

Week over week change in cost per result, CPM and click rate, pacing against budget, the video
funnel checks and the pause rules have no definition in this skill yet. An agent does not invent
one. It shows the figures above for each window it reads and names, under the page's data gaps,
each figure it could not work out.

## Tying an ad to its variant

An ad belongs to a variant when it ran that variant's live post, matched as **Ad Performance**,
**Where the results come from**, step 3 says. Every other ad is not matched: it is in no figure on a
page the client sees, and is listed for the agency only.
