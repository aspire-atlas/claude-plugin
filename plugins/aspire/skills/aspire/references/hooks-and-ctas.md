# Hooks and CTAs reference

How a CAS campaign recommends hooks and CTAs, and how it learns which ones worked between
rounds. Used by the **CAS campaign** section of SKILL.md (`cas-campaign.md`), and by the
`atlas-creator-brief` agent in creator-ads mode when it writes each lane's hooks and CTAs
(`creator-brief.md`, **Creator-ads mode**). There is no agent for this. The hook review runs
in the main thread, inside the CAS campaign section.

## Where recommendations come from

Read in this order. An earlier source outranks a later one when they disagree.

1. **This campaign's hook reviews.** The newest `hook-review` findings on the campaign's
   prefix (**The hook review** below). Patterns that led in an earlier round go first.
   Patterns that lagged are dropped unless a lane has nothing else.
2. **The brand's saved ad reuse findings.** `search_insights` on the `ad-reuse-{profile}`
   prefix, newest first: the hook patterns that lead, with their median hook score.
3. **The brand's saved market signal findings.** `search_insights` on the
   `market-signal-{profile}` prefix: the phrases creators already use, and the features the
   brand wins on.
4. **The lane itself.** Its concept, framework, trigger, and persona (`campaign:{slug}-lane-{lane}`).

None of the first three saved: say so in one line on the page and write from the lane alone.
Never invent a performance figure to justify a hook.

## Hook patterns

Use the pattern list in `ad-reuse.md`, **Hook patterns**, so every flow tags hooks the same
way: question, bold claim, result first, demo first, before and after, POV or relatable
moment, comparison or reaction, list or number, face-to-camera statement.

## Writing the hooks (3 per lane)

Each hook is the first three seconds of a clip, written as three parts:

- **Said**: the spoken line, or "no voice" for a visual hook.
- **Shown**: what is on screen, which must also appear in the brief's B-roll list or beats.
- **Overlay**: the text on screen, so the hook works without sound.

Rules:

- The three hooks use three different patterns. The first uses the strongest pattern from the
  sources above that fits the lane's framework and trigger.
- The hook lands by 3 seconds. The product or brand appears by 3 seconds when the lane's
  framework allows it; when it does not, say where it first appears.
- Speak in the persona's words. Borrow market signal phrases where they fit, quoted as found.
- No claim the brand's saved records do not support: no prices, results, or comparisons that
  are not in `brand:summary`, a `guideline`, or the campaign brief.

## Writing the CTAs (2 per lane)

Each CTA is three parts: the **action** (one verb phrase), the **destination** (where it sends
people, from the campaign brief; a bracketed blank when none is saved, never an invented
link), and the **moment** (the beat and second it lands).

The two CTAs differ in ask, so the editors can test them: one direct (shop, sign up, download)
and one softer (learn more, see how, follow). When the lane's framework calls for a single ask,
the second CTA varies the wording, not the action, and says so.

## Every recommendation says why

Each hook and CTA carries one line of reasoning: its pattern and the source behind it, with the
figure when there is one ("result first: led round 1 at 1.6x the creators' median views";
"bold claim: the brand's top ad reuse pattern, median hook score 74"; "from the lane's
trigger, no saved results yet"). Show it on the brief page under the hook.

## Limits

- **The hook log.** Read every `hook` finding on the campaign before writing. Never reuse a
  hook or CTA, word for word or in close paraphrase, in any lane or round. After the brief is
  saved, append every new hook and CTA as a `hook` finding with its pattern in `detail.pattern`.
- **Red lines.** A `red_line` that blocks AI-written copy turns each hook and CTA into a
  direction: what the line must do and must not say, with the pattern and the reason, never a
  scripted line.
- **Coverage.** Every hook's "Shown" part needs footage asked for, and the beats must fit the
  shortest runtime with the hook inside the first three seconds (`creator-brief.md`, **Editing
  coverage check**).

## The hook review (between rounds)

Run by the CAS campaign section after Gate 4 is cleared, when the user starts the next round, or
when the user asks how the hooks did. Main thread only, interactive only. It reads only what
Atlas holds: no lookups, no marketplace, no discovery.

1. **Find the posts.** `search_posts` for the round's roster creators (the authors' handles),
   posted since Gate 4 cleared, video only (`exists mediaKind`, Reels and TikTok videos), that
   mention or tag the brand. Project `postedAt`, `text`, `url`, `author.username`, the metrics,
   `media` (container), and `analysis.transcript` and `analysis.overlayText` when the census
   lists them.
2. **Match each post to a briefed hook.** Compare the post's opening (the transcript's first
   three seconds, then the overlay text) with the round's `hook` findings. A semantic
   `search_posts` with `queryText` set to the hook's "Said" line, filtered to the creator, helps
   when the transcript is missing. No match: the post is "off brief" for this review.
3. **Score each hook.** Per hook, the matched posts' views per follower against each creator's
   own median (the ad reuse retention proxy). A hook with 3 or more matched posts gets a
   result: **led** at 1.5x the median or more, **lagged** under 1x, **held** between. Fewer is
   "not measurable yet". A hook no creator used is **not used**.
4. **Show it.** One table per lane on the campaign page, under the brief: hook, pattern,
   posts matched, median against the creators' median, result. Then one line per pattern: the
   patterns that led, and the ones to drop.
5. **Save it.** One `AskUserQuestion`: "Save the round {n} hook results? The next round's
   briefs will lead with what worked." Options: "Save (Recommended)", "Page only". On save,
   write a `hook-review` finding per hook (`cas-campaign.md`, **Working state**).

These are organic results from the creators' own posts. Paid results (paid hook rate, cost per
result) come later with Meta ad data; the saved decision defaults in
`campaign:{slug}-decision-defaults` will judge them then.
