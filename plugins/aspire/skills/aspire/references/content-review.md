# Content review reference

Shared by the `atlas-content-review` agent and the **Content review** section of SKILL.md.
Holds the setup interview, the per-review questions, the checks, the verdict rule, the
feedback loop that teaches future reviews, the state written to Atlas, and the page.

## Why the content review agent exists

The creator brief says what a piece of content must do. Content review checks one post
against that: does it follow the brief, does it follow the brand's guidelines, and is it safe
for the brand to be next to. It works on a creator's draft before it goes live or on a post
that is already published.

A review is only as good as its calibration, and every brand draws the lines differently. So
each review ends by asking the user whether the calls were right. Those answers are saved in
Atlas and the next review reads them, which means the agent gets closer to the team's own
judgment over time. Every teammate works from the same lessons.

Content review is interactive only. It has no scheduled mode: a person supplies the post and
a person makes the final call. Its findings do reach the scheduled readouts, though: the
daily and weekly readouts read every review saved since their last run (see **Feeding the
readouts**).

## Setup: calibrate the reviewer once, for everyone

Before asking anything, call `search_calibrations` (no filter, limit 100 per page, paged to the end,
`includeSuperseded: true`) and skip any question whose key is already occupied. All answers
are written with `append_calibration`, `provenance: "interview"` (or `"web"` per the SKILL.md
web research option), `statement` under 280 characters, prose in `detail`.

| # | Question (via `AskUserQuestion`) | Options | kind | key | detail |
| - | -------------------------------- | ------- | ---- | --- | ------ |
| C1 | When should a review stop a post? | 1) A red line or a missed must-include blocks it (Recommended); 2) Only red lines block; everything else is advice; 3) Never block; flag everything and I decide | `guideline` | `review:verdict-rule` | `{concern: "requirement", appliesTo: ["content-review"], body: "<rule>"}` |
| C2 | How must paid content be disclosed? | 1) Platform paid-partnership label plus #ad in the first line of the caption (Recommended); 2) Platform paid-partnership label only; 3) Our own wording (type it) | `guideline` | `review:disclosure` | `{concern: "requirement", appliesTo: ["content-review"], body: "<rule>"}` |
| C3 | Beyond what's already saved, what brand rules should every review check? `web: yes` | 1) Use the saved guidelines only (Recommended); 2) Research our public brand guidelines on the web; 3) I'll list them (type them) | `guideline` | `review:brand-rules` | `{concern: "requirement", appliesTo: ["content-review"], body: "<one rule per line: voice, visuals, product naming, claims, logo use>"}` |
| C4 | How strict is the brand safety screen? | 1) Standard: flag the industry brand-safety categories, block only on our red lines (Recommended); 2) Family-safe: also flag alcohol, mild profanity, and risky stunts; 3) Our own list (type it) | `guideline` | `review:safety-scope` | `{concern: "requirement", appliesTo: ["content-review"], body: "<scope>"}` |

Rules:

- One `AskUserQuestion` per question, in order, never plain text. The tool adds its own free
  text field; never add "Other" or "Skip".
- C3 and C4 may be declined. A declined question is written as kind `decline` with the same
  key, so setup counts it as answered and never asks it again. C1 and C2 cannot be declined:
  the agent needs both to reach a verdict. To answer a declined question later, retract the
  `decline` record through its Destructive tools confirmation, then ask the question again as
  a fresh setup item.
- Write C1's options from the brand's context. If no `red_line` is saved, say so in C1's
  question text ("No red lines are saved yet, so option 2 blocks nothing").
- C3's option list starts from what exists: when `guideline` records or the
  `voice_and_content_ops` brand fact are saved, summarize them in one line in the question
  text so the user sees what "saved guidelines" means.
- C4: call `get_brand_instruction` with `agentType: "brand_safety"` first. If an instruction
  exists, quote its first line in the question text and make option 1 "Use the saved brand
  safety instruction (Recommended)". Never call `set_brand_instruction` from this flow.
- Calibrations are organization-wide: every brand profile in the organization shares one set.
  Say so in the batch confirmation when the organization has more than one profile.
- Confirm the batch once with `AskUserQuestion` ("Save this review setup for {brand}? Every
  teammate's reviews will use it."), then write all four records. A `key-exists` follows the
  Phase 5 supersede rule with its own confirmation.
- A teammate re-running setup sees the saved answers, offered as "Keep as saved
  (Recommended)" / "Change" per item. Changes go through `supersede_calibration` with its own
  confirmation.

## Per-review questions

Asked by the main thread for every review. Skip any the user already answered.

| # | Question | Options |
| - | -------- | ------- |
| P1 | Which brief should the post be checked against? | 1) The latest creator brief for {brand} (only when one exists in Atlas); 2) A campaign saved in Atlas (only when a `campaign:*-brief` exists); 3) Paste or attach the brief |
| P2 | Which deliverable is this post for? | One option per deliverable in the chosen brief, up to four, labelled by day and format. Skip when the brief has one. |
| P3 | What are we reviewing? | 1) A creator's draft (attach the media and paste the caption); 2) A published post (paste the link). The description of option 2 says: "If Atlas doesn't hold the post yet, it fetches it. A TikTok post Atlas doesn't hold costs one paid lookup." |
| P4 | Review {post} against {deliverable}? Findings are saved to {brand}'s Atlas memory. | 1) Run the review (Recommended); 2) Change the brief or the post |

P4 is the write confirmation for the agent's findings. Pasting the link on P3 is the approval
to fetch a post Atlas does not hold, including a paid TikTok lookup, because P3's option text
says so; the agent does not ask again.

**Normalizing the brief.** The main thread hands the agent one deliverable as structured
text, whatever the source:

- **Creator brief in Atlas:** `search_insights` on the `runKey` prefix
  `creator-brief-{profile}`, newest first, `kind` `action_item`. Each deliverable is one
  finding. If the user has the brief's page link, read it with the Artifact tool's `read`
  action for the full spec grid.
- **Campaign brief:** `campaign:{slug}-brief` plus `campaign:{slug}-criteria`.
- **Pasted or attached:** read it as given.

Fields: `format` (and length), `angle`, `mustInclude[]`, `avoid[]`, `hashtags[]`,
`mentions[]`, `cta`, `link`, `postWindow`, `rights`, `successTarget`, `disclosure`. Any field
the brief does not specify is passed as `not specified`. Never fill a gap from memory or from
another deliverable.

## The checks

Every check returns one of **Pass**, **Flag**, **Fail**, or **Can't check**. Each check also
carries the evidence it rests on: a quoted caption line, a described frame with its
timestamp, or a field and its value. Every Flag and Fail also carries one suggested fix.
"Can't check" is a first-class result: say what would make the check possible (a
transcript, the video file, the posting date).

### 1. Brief adherence

One check per brief field that is specified:

| Check | Pass means |
| ----- | ---------- |
| Format and length | `mediaKind` / `instagram.mediaProductType` and duration match the brief |
| Angle | The post's main idea is the brief's angle, stated in the first 3 seconds or first caption line |
| Must include | Each item appears, visually, spoken, or in the caption; one check per item |
| Avoid | No item appears; one check per item |
| Hashtags and mentions | Each required tag and handle is present and spelled correctly |
| CTA and link | Present and matching; a link in the caption of an Instagram feed post is a Flag (not clickable) |
| Post window | Published posts only: `postedAt` inside the window |
| Rights | Always "Can't check" from the post itself; list what the brief requested |
| Success target | Published posts at least 72 hours old: the metric against the target. Otherwise "Can't check yet" |

### 2. Brand guidelines

- Every `guideline` calibration whose `appliesTo` is empty or names content, a network the
  post is on, or `content-review`. One check per guideline. Leave out `review:` keys here:
  the setup answers already shape the verdict, disclosure, brand rules and safety screen, and
  lessons are applied on their own below.
- `review:brand-rules`, one check per line.
- Voice: the `voice_and_content_ops` brand fact, when saved.
- Competitors: every `competitor` handle and its `spellingVariants`, in the caption, the
  mentions, on-screen text, and visible product. A competitor in frame is a Fail.
- Claims: health, safety, pricing, "best", "#1", and before/after claims are a Flag unless
  the brief supplies the substantiation.
- Lessons: every `review:lesson-*` record (see **The feedback loop**).

### 3. Brand safety

- Every `red_line` calibration, with its `action`: `block` fails the post, `flag` flags it,
  `escalate` flags it and names the primary contact (`user:primary-contact`) in the verdict.
  This includes the review hard rules (`review:rule-*`, see **Hard rules for every review**).
  Each one is its own check, and the page names the rule.
- `review:safety-scope` and the saved `brand_safety` brand instruction, when present.
- The industry brand-safety screen, one line per category: adult and explicit content; arms
  and ammunition; crime and harmful acts; death, injury, and military conflict; online piracy;
  hate speech and aggression; obscenity and profanity; drugs, tobacco, vaping, and alcohol;
  spam and harmful content; terrorism; debated sensitive social issues; misinformation.
- Disclosure against `review:disclosure`: present, and visible without tapping "more". A tag
  buried in a hashtag block is a Flag. A missing disclosure on a paid post is always a Fail,
  whatever C1 says.
- Existing safety verdicts: for a published post, `search_insights` for `brand_safety` role
  findings on that post's id. Cite them; never contradict one silently.
- The creator: one `search_posts` on the author's last 30 days with `queryText` set to each
  `block` red line body, limit 5. A hit is a Flag on the creator, reported separately from
  the post's own verdict.

### Media: what the agent can and cannot see

Visual checks rest on frames the agent has viewed itself. A cover image is one frame, not the
clip. Keep every downloaded file and frame in the review's own working folder, named for the
post, so parallel reviews never share files.

**Getting the video.** Published post: download the `media` container's video URL with
`curl` (fall back to the base media URL on a `/thumbnail` 404). Draft: use the local file the
user attached. Record the duration, resolution, and frame rate.

**Frame extraction, in this order.** Check each tool with `command -v` (or an import test)
and use the first that works. Say which one ran.

1. **`ffmpeg`** on any OS: one `-ss <t> -frames:v 1` grab per timestamp, scaled to 540px wide.
2. **AVFoundation** on macOS, when `swift` is available: write a short Swift script in the
   working folder that opens the file with `AVURLAsset`, and uses `AVAssetImageGenerator`
   with `appliesPreferredTrackTransform = true` and zero time tolerance before and after,
   so each frame is the exact timestamp. Set `maximumSize` 540x960, and write one JPEG per
   timestamp named `f_<seconds>.jpg`. The script runs during the review and is deleted with the
   working folder; it is never added to the plugin.
3. **OpenCV** when `python3 -c "import cv2"` succeeds: seek with `CAP_PROP_POS_MSEC` and
   write one JPEG per timestamp.
4. **None available:** view the cover only. Every visual check past the cover is "Can't
   check (no frame extractor)", and the summary says which tool would fix it. Never pass a
   continuous must-include from the cover alone.

**Resizing, in this order:** Pillow, then `sips` on macOS, then `ffmpeg -vf scale`.

**Which frames.** Start at 0.5 seconds, take one frame every 3 seconds, and add one 1 second
before the end. Stop at 30 frames: for a longer clip, widen the step to duration ÷ 30. Then add
targeted frames:

- **Around every Fail or Flag found in a sampled frame:** at ±1.5 seconds, to confirm the
  moment and its extent.
- **The first 3 seconds:** at 0.5, 1.5, and 2.5 seconds, for the angle and payoff-line check.
- **The closing card:** once located, the first and last seconds it is on screen.

List every timestamp viewed on the page, and mark the targeted ones.

**Continuous must-includes** ("legible for most of the runtime", "on screen throughout"):
count only content frames and leave out the end card. "Most" means at least 60% of those
frames. Report the ratio ("legible in 14 of 23 content frames") and the timestamps where it
fails. Something that covers the required item counts against it: burned-in captions,
graphics, a cut-out, a hand, or a crop. Name what covered it.

**Atlas analysis fields.** Project `analysis` on the post and use what the census exposes:

- **`analysis.transcript`: spoken content.** It is Atlas's AI transcript, not a recording
  the user checked. Spoken checks may Pass or Fail on it, and the evidence says "per Atlas
  transcript". A transcript the user supplied wins where they differ. With neither, spoken
  checks are "Can't check (no transcript)". Never infer speech from visuals.
- **`analysis.overlayText`: on-screen text.** Use it to cross-check what the frames show and
  to find timestamps worth a targeted frame. The frames win when they disagree. It is never the
  only evidence for a visual Pass when frames could be extracted.
- **`analysis.narration`: supporting context only.** It is a description, not evidence, and
  never decides a check by itself.
- **`analysis.brandSafety`: Atlas's per-category safety rating.** Cite it beside the agent's
  own call for each category. When they disagree, report both and flag the category.

**Censored words.** A word written with asterisks or bleeped still counts as profanity. The
brief's own rule decides whether it is a Fail or a Flag.

## Verdict

Apply `review:verdict-rule` (C1). With no saved rule, use option 1.

| Verdict | When |
| ------- | ---- |
| **Do not post** | Any `block` red line fails, whatever C1 says |
| **Revise and resubmit** | Anything C1 says blocks has failed, or a paid post is missing its disclosure (whatever C1 says) |
| **Approve with edits** | Flags only, or fails C1 treats as advice |
| **Approve** | Every check passes or is "Can't check" for a stated reason |

Too many "Can't check" results can hide a problem. When more than a third of the checks are
"Can't check", the verdict is at most **Approve with edits**, and the first edit asks for
what was missing.

**Precedence when rules disagree:** red lines, then the disclosure rule, then the brief, then
lessons, then guidelines and brand rules, then general practice. Name the conflict in the
review. Never resolve one silently. A lesson can never relax a red line or the disclosure
rule.

## The feedback loop

Asked straight after the review, while the user has it in view. The agent asks when
`AskUserQuestion` is available to it. When it is not (the usual case for a subagent), the
agent returns the feedback packet and the main thread asks, before anything else happens in
the conversation. Either way, every review ends with F1. A review is not finished until the
user has answered it or declined.

| # | Question | Options |
| - | -------- | ------- |
| F1 | What's your call on this post? Your answer is saved to Atlas so future reviews learn from it. | 1) Agree with the review; 2) Approve it anyway (the review was too strict); 3) It needs more changes (the review was too lenient); 4) The review missed something |
| F2 | Which calls were off? (multiSelect; only after options 2 to 4 of F1) | Up to four Flags or Fails (option 2) or Passes (option 3), each labelled by check and one line of evidence. The free text field carries anything missed. |
| F3 | Save this for future reviews: *"{lesson}"*? | 1) Save as a review rule (Recommended); 2) Just this post; 3) Propose it as a hard rule (description: "Goes to the next question, where hard rules are confirmed. Hard rules apply to every review for every brand in {organization} and can block a post.") |
| F4 | Apply any of these to every content review? (multiSelect; only when there are proposed hard rules, from the agent or from F3 option 3) | Up to four proposed hard rules, each labelled with the rule in a few words; the description gives the full rule, its action (blocks or flags), and where it came from. The free text field carries a rule the user wants added or reworded. |

Rules:

- The F1 answer is its own write confirmation because its question text says so. Write it
  with `append_insights` under the review's `runKey`: kind `went_well` for "Agree",
  `needs_improvement` otherwise. `detail` carries `findingType: "feedback"`, `userVerdict`,
  `agentVerdict`, the checks named in F2, and the user's free text verbatim. This is where
  `userVerdict` lives: the verdict finding is written before F1 is asked and is never
  rewritten.
- Write the lesson yourself, one sentence that generalizes the correction beyond this post
  ("Product shown in use counts as the must-include demo, even without a spoken mention").
  Show it in F3's question text. Never save a lesson the user has not seen.
- F3 option 1: `append_calibration`, kind `guideline`, key `review:lesson-{slug}` (from the
  lesson, lowercase, hyphenated), `concern: "preference"` when it relaxes a check and
  `"requirement"` when it adds or tightens one, `appliesTo: ["content-review"]`, `body` = the
  lesson plus the originating `runKey` and one evidence line. Option 3 writes nothing yet: it
  adds the lesson, worded as a rule, to F4's proposals, where the scope is stated and
  duplicates are checked. If the rule is already saved, say so and drop it. Option 2 writes
  nothing more.
- Skip F3 when F1 is "Agree" and F2 did not run.
- If F2 marks a red line, a hard rule, or the disclosure rule as wrong, do not write a lesson.
  Say that the rule itself would have to change.
- A lesson that contradicts an existing `review:lesson-*` record replaces it rather than
  sitting beside it.
- **Changes to saved rules belong to the main thread.** Superseding a lesson, changing a
  red line, a hard rule or the disclosure rule, and retracting any of them all go through
  `supersede_calibration` or `retract_calibration`, each with its own Destructive tools
  confirmation. The agent never calls either. When it asked the feedback questions itself,
  it lists each such change under "Needs the main thread" in its summary (the record's key,
  the current wording, the proposed wording or "retract", and why), and the main thread
  offers each one.

## Hard rules for every review

A lesson is a soft rule: it changes how a check is judged. A hard rule is a check that runs on
every future review for every brand in the organization, whatever the brief says, and it can
block a post. Hard rules are `red_line` calibrations scoped to content review.

**Only content review applies them.** A `red_line` whose key starts with `review:` is a hard
rule for reviews. The readouts' red-line scan, creator discovery, the creator brief, and the
account analyst skip it (see `atlas-tools.md`, calibration kinds). A rule the brand wants
everywhere is saved as an ordinary `redline:*` record instead, through onboarding.

**Where proposals come from.** After each review the agent proposes up to four candidate hard
rules, from these sources only:

1. **Brief items that are brand policy, not deliverable spec.** A disclosure format, a
   family-safe standard, a ban on other brands' logos on talent, a competitor exclusion, or a
   claims restriction reads like a standing rule. Formats, lengths, dates, angles, and targets
   never do.
2. **The user's corrections.** An F2 free-text answer or a lesson in F3 that says "always",
   "never", or "any post".
3. **Repeated overturns.** The same check overturned in two or more reviews (the candidate
   lessons from **Reading lessons back**).
4. **F3 option 3.** A lesson the user chose to propose as a hard rule. It goes through the
   same duplicate check as the others.

Never propose a rule already saved: compare against every active `review:rule-*` and
`red_line` record. Never propose a rule that only restates a setup answer (C1 to C4). Word
each rule so it can be checked from a post: what must or must not appear, and where.

**Asking.** F4, one multiSelect, after F1 to F3. The question text says: "Hard rules apply to
every content review in {organization}, for every brand, and can block a post." Each option's
description states the action: `block` for anything a brief would treat as a must-include or
a legal requirement, and `flag` otherwise. The free text field lets the user change an action.

**Writing.** One `append_calibration` per selected rule. The F4 answer is the confirmation for
that batch, because its question text says the rules will be saved.

- kind `red_line`, key `review:rule-{slug}` (from the rule, lowercase, hyphenated, 48
  characters at most)
- `statement`: the rule in one line, under 280 characters
- `detail`: `{action: "block" | "flag", severity: "hard", appliesTo: ["content-review"], body:
  "<the rule, why it was proposed, the originating runKey, and one evidence line>"}`
- `provenance: "interview"`

A `key-exists` means a rule with that name is already saved. Write nothing for it, and hand
both versions to the main thread under "Needs the main thread".

**Changing a hard rule.** Retracting or rewording one goes through `retract_calibration` or
`supersede_calibration`, each with its own Destructive tools confirmation, run by the main
thread. A lesson never overrides a hard rule.

**Reading lessons back (agent).** Load every `review:lesson-*`, `review:rule-*`, and other `review:*` record from
`search_calibrations`. Also run `search_insights` with a `prefix` filter on
`detail.account_review.runKey` = `content-review-{profile}` (a bare `runKey` filter is
rejected as unmapped), newest first, limit 50: the `needs_improvement` feedback findings
show the calls users overturned without saving a lesson. When the same check has been
overturned twice or more, report it in the summary as a candidate lesson, but never apply it
as a rule. Every call a saved lesson changed is marked on the page ("Passed under saved rule:
…"), so a reader can see why the reviewer differs from a stock check.

## State written to Atlas

`append_insights`, `runKey` `content-review-{profile}-{handle}-{YYYY-MM-DD}-{ref}`, where
`{ref}` is the post shortcode or video id for a published post and `draft-{HHMM}` for a
draft. Role `account_review`. Anchor:

- Published post: `schema` = network, `entityKind` = `post`, `entityId` = the network's own
  media id from the search hit.
- Draft: `entityKind` = `account`, `entityId` = the creator's account id from
  `search_creators`. If Atlas does not hold the creator, anchor to the brand's own account on
  that network and put the creator's handle in `detail`. Never call `lookup_creators` to
  obtain an anchor.

| Finding | Kind | `priority` | `findingType` |
| ------- | ---- | ---------- | ------------- |
| The verdict | `went_well` for Approve, `needs_improvement` otherwise | n/a | `verdict` |
| Each Fail | `needs_improvement` | n/a | `check` |
| Each Flag | `needs_improvement` | n/a | `check` |
| Each required edit | `action_item` | `high` if it clears a Fail, `medium` for a Flag | `edit` |
| Up to three standout passes | `went_well` | n/a | `check` |
| An earlier edit this post now passes | `went_well` | n/a | `close` |
| The F1 answer (see **The feedback loop**) | `went_well` or `needs_improvement` | n/a | `feedback` |

The verdict is never an `action_item`: the edits are the open work, and the verdict only
summarizes them.

`detail` carries `rationale`, `evidence[]`, `theme: ["content-review", "<dimension>"]`, and
these keys, stored verbatim: `findingType` (from the table), `reviewedAt` (full UTC timestamp
from the shell clock, `date -u +%FT%TZ`, the same value on every finding of one review), `verdict`, `dimension`,
`check`, `result`, `stage` (`draft` or `published`), `creator` (the handle), `deliverable`,
`lessonsApplied[]`. Supply an `idempotencyKey` per finding.

The verdict finding also carries what the readouts need, so they never have to re-derive a
review: `postedAt` and `permalink` (the post's own URL) for a published post, `reviewPage`
(the review page's link from step 9), `briefRef` (the brief and deliverable), `counts`
(`{pass, flag, fail, cantCheck}` per dimension), `openEdits` (the number of required edits),
and `hardRuleHits[]` (the `review:rule-*` and `red_line` keys that failed). The user's own
call is not on it: it is on the `feedback` finding of the same `runKey`.

**Closing edits.** When a resubmitted draft or a corrected post passes a check that an earlier
review failed, write a `went_well` with `findingType: "close"` that references the earlier
edit's `idempotencyKey` in `detail.closes`. The readouts treat that edit as resolved.

## Feeding the readouts

The daily and weekly readouts read content reviews the same way they read prior readouts:
`search_insights` with a `prefix` filter on `detail.account_review.runKey` =
`content-review-{profile}`, newest first, paged. They report reviews as their own block,
separate from the brand's own post performance, because reviewed posts are usually on a
creator's account.

How the readouts put a review back together:

1. **Group by `runKey`.** One `runKey` is one review.
2. **Pick the reviews in the window** by `detail.reviewedAt`. Every finding of a review
   carries the same value, so the fails, flags and edits come along with the verdict.
3. **Read each group by `findingType`:** `verdict` for the verdict, counts, links and
   hard-rule hits; `check` with `result: "Fail"` for the most failed check; `feedback` for
   the user's call (`userVerdict`); `edit` for required edits.
4. **Open edits are counted across all reviews, not just the window.** An `edit` is open
   until a `close` finding in any later review names its `idempotencyKey` in
   `detail.closes`. Its age runs from its own `reviewedAt`.

- **Daily:** reviews run yesterday, by verdict. Every **Do not post** and every hard-rule hit
  is named, with the creator's handle and the review page link (`reviewPage`).
- **Weekly:** reviews run last week, by verdict. The most common failed check, and the
  creators with more than one review. Open required edits go into the open action items table
  with their age, and source "content review". For reviewed published posts, the lead metric
  against the creator's own median when Atlas holds it. "Not measurable yet" is a valid
  answer.
- Readouts only read reviews. They never re-run a review, ask the feedback questions, or write
  a review finding.

Never write the `brand_safety` role. It requires a complete verdict for every category in
the judging pipeline's own schema, and this agent does not produce that.

## The page

One page per review, with a new path each time so earlier reviews stay linkable. Title:
"<Brand> Content Review: @<creator>, <date>". Sections in order:

1. **Verdict banner.** Verdict, one-line reason, counts of Pass / Flag / Fail / Can't check
   per dimension, stage chip (draft or published), brief and deliverable name.
2. **The brief.** The brief's title, brand, creator and deliverable, then a two-column table
   with every field of the normalized deliverable in the brief's own words. Number the
   must-include and avoid items the way the checks refer to them. Say where the brief came
   from.
3. **The post.** Media, caption, handle with profile picture, and the post link when
   published. For video: a strip of every frame viewed, each labelled with its timestamp,
   targeted frames marked. Then one line naming the extraction tool, the sampling step, and
   the frame count.
4. **Required edits.** Numbered, in priority order. Written as notes the team can forward to
   the creator: plain, specific, polite, one fix each. If a `red_line` blocks AI-generated
   copy, describe what to change and never write replacement caption text.
5. **Brief adherence**, **Brand guidelines**, **Brand safety.** One row per check: result
   chip, check name, evidence, fix. Fails first, then Flags, then Can't check, then Passes
   collapsed.
6. **Lessons applied.** Each saved lesson that changed a call, and any candidate lesson from
   repeated overturns.
7. **Footer.** The brief source, "numbers come from Atlas as of {timestamp}", what was not
   checkable and why, and the CDN expiry note.

Page mechanics are the creator brief's: download media and profile pictures with `curl`,
resize in the order under **Media** (frames 320px wide, profile picture 96px), embed as JPEG data URIs, keep
the page under 2MB, fall back to the base media URL on a `/thumbnail` 404. Draft media comes
from the local files the user attached. Load `artifact-design` before building.

## Atlas quirks that apply here

Inherited from `creator-brief.md`: project the `media` and `instagram.account` containers,
not leaf URLs. Published pages cannot load `cdn.aspire.io` images, so embed them. New for content
review:

- `lookup_posts` resolves only the posts named. Leave `creatorDeepAnalysis` at its default
  `false`. It has no status-check tool: re-call it with the same item to re-read a
  `fetching` result.
- It rejects TikTok short links (`vm.tiktok.com`, `vt.tiktok.com`). Ask the main thread for
  the full `tiktok.com/@handle/video/{id}` URL.
- `search_insights` filters on `detail.account_review.runKey`, not a bare `runKey`.
- `append_insights` anchors only to `instagram` and `tiktok`. A YouTube post can be reviewed
  but not saved; say so on the page and in the summary.
