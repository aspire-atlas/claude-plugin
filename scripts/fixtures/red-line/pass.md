# Blocks the red-line check passes

Read every brand red line and apply it.

Read every `red_line` (never a `review:` or `applicant-review:` key).

Drop `vetting:`, `review:`, `library:` (content library only), `applicant-review:`, and `lastrun:` keys, then read every `red_line`.

Fold in every `competitor` and `red_line` record (not `review:` or `applicant-review:` keys).

Records whose keys start `applicant-review:` don't count, and a `red_line` alone does not make a profile onboarded.

Write the answer as kind `red_line`, key `review:rule-{slug}`. <!-- red-line-check: writes content review's own record -->

Prose that only mentions red lines without reading calibrations passes.

Read every `red_line` (never a flow-owned key, e.g. `review:` or `applicant-review:`).

Read every `red_line` and drop flow-owned keys, for example `review:` and `applicant-review:` keys.
