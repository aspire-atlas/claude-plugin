# Ad reuse reference (hooks and cut lists)

Shared by `atlas-account-analyst` in `target_mode` `reuse` and by `atlas-content-review`'s
optional **Ad reuse** check. Serves the `performance` and `creative` lenses
(`recipient-lens.md`): Performance decides what to license and put spend behind; Creative
needs exactly which moments to cut, at what length, for which placement.

## Candidate pool (reuse mode)

- **Window:** the one the user named ("last month"), default the last 30 days.
- **Sources**, per the `reuse_scope` input:
  - `own`: the brand's linked handles.
  - `creators`: posts by other accounts that mention or tag the brand's handles, or carry a
    tracked hashtag (`list_hashtag_posts`), excluding the brand's own handles and every
    `competitor`. Posts with the partnership marker the census exposes rank first, because
    usage rights are likelier to be negotiable.
  - `both` (default).
- **Formats:** video only (Reels, TikTok videos). Carousels and images are left out with a
  one-line note: they carry no hook timing.
- **Prefilter:** rank the pool by the lead reuse signal (views per follower against the
  author's own median; saves plus shares per view when views are missing) and take the top 12
  into frame work. Name how many were considered.
- Read only what Atlas holds. Never call `lookup_posts`, `lookup_creators`, or any discovery
  tool for this mode.

## What to read per candidate

Project `postedAt`, `text`, `url`, `author.username`, `author.followersCount`, the metrics,
`mediaKind`, `media` (container), `instagram.mediaProductType`, the partnership marker, and
`analysis.transcript`, `analysis.overlayText`, `analysis.brandSafety` when the census lists
them. Duration comes from the census when it exposes one; otherwise from the downloaded file.

Frames follow `content-review.md`, **Media**: the same extractor order and working folder.
Sample the opening densely (0, 0.5, 1, 1.5, 2, 2.5 and 3 seconds), then every 3 seconds.
View every frame extracted. With the cover only, score the hook components "Can't check" and
say so; never infer the opening from a cover.

## Hook score (out of 100)

Every component names its evidence: a quoted transcript line with its timestamp, a frame with
its timestamp, or a field and its value. A component with no data scores zero and is listed
as missing.

| Component | Weight | Full marks when |
| --------- | ------ | --------------- |
| Hook by 3 seconds | 30 | A claim, a question, a result, or a visual pattern break is on screen or spoken by 3.0s |
| Brand or product by 3 seconds | 15 | The product, the logo, or the brand name is visible or spoken by 3.0s |
| Works without sound | 15 | On-screen text or captions carry the point; `analysis.overlayText` or frames show it |
| Retention proxy | 20 | Views per follower at or above 1.5x the author's own median, or saves plus shares per view in the author's top quartile |
| Standalone segment | 10 | A self-contained 6 to 15 second stretch that makes sense without the rest |
| Ready for paid | 10 | Disclosure present where paid, no competitor in frame, no `red_line` hit, no third-party music flagged in the caption |

**Hook patterns.** Tag each candidate with one: question, bold claim, result first, demo
first, before and after, POV or relatable moment, comparison or reaction, list or number,
face-to-camera statement. Report each pattern's median hook score and retention proxy when it
has 3 or more candidates; fewer is "not measurable yet".

## Cut list

One row per recommended cut, at most three cuts per candidate:

| Field | Rule |
| ----- | ---- |
| Post | Permalink, author handle, posted date |
| Pattern | From the list above |
| In and out | Timestamps from transcript timing when present; from frames otherwise, marked "±1.5s" |
| Moment | One line naming what happens, in plain words; never write new ad copy when a `red_line` blocks AI-written copy |
| Lengths | The cut lengths the segment supports: 6s bumper, 15s, 30s |
| Placements and specs | 9:16 at 1080x1920 for Reels, Stories and TikTok; 4:5 at 1080x1350 for feed; 1:1 at 1080x1080 where the framing allows. Note when key text sits outside the safe zone |
| Sound | Original audio, voiceover, or music; "music rights unknown" when music is present |
| Rights | From a saved record or a creator brief deliverable that requested rights (`search_insights` on `creator-brief-{profile}` for that creator); otherwise "Not held in Atlas: confirm usage rights before paid use" |

Brand-owned posts show rights "Brand-owned". Creator posts never show rights as cleared
unless a saved record says so.

## Output for each lens

- **Performance** (primary): ranked licensing candidates by hook score, the pattern table,
  and one line per candidate on why it should convert as paid. Then the cut list.
- **Creative** (primary): the cut list first, grouped by post, with frame thumbnails at the in
  and out points; the ranking follows.
- Both lenses are one hand-off (Performance picks, Creative cuts), so the page always carries
  both sections; the primary lens decides the order.

## Page (reuse mode)

Title "<Brand> Ad Reuse: {window}", republished to the same path for the same brand. Sections:
header with the "Prepared for" chip; headline (the top pattern and the top candidate); the
pattern table; ranked candidate cards (media, author, hook score ring, the first-3-seconds
frame strip, metric row); the cut list table; rights and gaps; footer with sources and "numbers
come from Atlas as of {timestamp}". Images follow `creator-card.md`, **Images**, page profile;
frames follow `content-review.md`, **The page**, page mechanics. Load `artifact-design` and
`dataviz` first, and apply `theme:brand` per `theme.md`, **Applying the theme**.

## Findings (reuse mode)

`append_insights`, `runKey` `ad-reuse-{profile}-{YYYY-MM-DD}`, role `account_review`,
`schema` = network, `entityKind` `post`, `entityId` = the network's own media id. Kinds:
`went_well` per hook pattern that leads (3 max), `action_item` per licensing candidate with
`priority` `high` for the top three and `medium` after (6 max). `detail` carries
`hookScore`, the component breakdown, `pattern`, `cuts[]`, `rights`, `recipient`, and
`evidence[]`. `idempotencyKey` per finding.

## Ad reuse check (content review)

When the review's lens is `performance` or `creative`, or the user asks whether the post can
run as an ad, content review adds a fourth dimension, **Ad reuse**, for the one post under
review: the hook score, the pattern, and the cut list above. It is advice only and never
changes the verdict. A draft is scored the same way from its local media.
