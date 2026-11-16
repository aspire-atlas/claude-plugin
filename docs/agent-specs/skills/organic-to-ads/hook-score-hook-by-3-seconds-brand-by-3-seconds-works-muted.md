---
name: Hook score (hook by 3 seconds, brand by 3 seconds, works muted)
owner: 24-organic-to-ads
---

# Hook score (hook by 3 seconds, brand by 3 seconds, works muted)

## What it does

Scores each candidate video on how well its opening works as an ad.

## Inputs

- From brand memory: competitors (for the competitor and multi-brand screen, which keeps brand-led
  posts), red lines, and the brand theme.
- From the launch message: the scope (the brand's own posts, creators' posts, or both), the window,
  and any placements named.

## Output

Per video: the hook score from six components (hook by 3 seconds, brand by 3 seconds, works without
sound, retention, a standalone segment, ready for paid), each with its evidence, and the hook
pattern. Retention is labelled "Measured", "Creator average, not this post", or "Proxy". A component
with no data scores zero and is listed as missing. A cover alone never stands in for the opening.
The brand's own partnership disclosure never costs "ready for paid" points. A post that has already
run as an ad is labelled so, and its counts are not used for retention or reach, because they
include the ad's own delivery. Every candidate carries a snapshot of its components and counts at
the run. Candidates are ranked within their path (found or briefed). For a post already run as an
ad, Retention never uses the post's own counts (level 3), which include the ad's delivery, in the
score or in the prefilter: it uses the measured value or the creator average, and with neither it
is missing. A briefed post that never ran keeps level 3, since both paths share the verdict bands;
when whether it ran is unknown, the proxy is labelled "may include paid delivery", as it is in 17
Content Review's single-post ad reuse check. Detecting a post that
has run as an ad reads only whether it ran and whether it has an ad code, never the code itself. A brand-led post with a competitor in frame is
not forced to "leave" and keeps its "ready for paid" points for that competitor. The post's own views and
engagement are shown as "organic traction" and never compared across paths.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
