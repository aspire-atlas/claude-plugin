---
name: Hook score (hook by 3 seconds, brand by 3 seconds, works muted)
owner: 24-organic-to-ads
---

# Hook score (hook by 3 seconds, brand by 3 seconds, works muted)

## What it does

Scores each candidate video on how well its opening works as an ad.

## Inputs

- From brand memory: competitors (excluded from the pool), red lines, and the brand theme.
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
the run. Candidates are ranked within their path (found or briefed). On the briefed path, Retention
never uses the post's own counts (level 3), which may include the brand's paid delivery; it uses the
creator average or the creator's median views on their other posts. The post's own views and
engagement are shown as "organic traction" and never compared across paths.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
