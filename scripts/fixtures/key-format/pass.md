# Keys the check passes

A review is nine keys, each `applicantreview:{slug}-{part}`, read back as `applicantreview:*-campaign`.

Save the confirmed map as `adreuse:account-map`; the scope lives in `marketsignal:scope`.

Keys starting `applicantreview:` belong to the applicant review.

The key `creator:{ig|tt}-{handle}` holds one creator's note, and `qualityreview:log` holds the log.

A key at the limit passes: `brand:abcdefghijklmnopqrstuvwxyz0123456789abcdefghijkl`.

The longest keys built from a slug still fit: `campaign:{slug}-decision-defaults`, `lastrun:creator-discovery-{slug}`.

A quoted key passes: `append_calibration(key: "applicantreview:acme-holiday-campaign")`.

Names that are not keys pass: `object-fit:cover`, `font-size:14px`, `allowed-tools:`, `anthropic-skills:pptx`, `aspire:aspire`, `mode:week`, `https://example.com`.
