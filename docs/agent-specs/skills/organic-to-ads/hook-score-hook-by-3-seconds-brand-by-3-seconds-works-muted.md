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

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
