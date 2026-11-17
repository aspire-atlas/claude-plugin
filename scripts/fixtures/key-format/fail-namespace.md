# Keys whose namespace Atlas refuses or the list does not hold

A review is nine keys, each `applicant-review:{slug}-{part}`.

Drop `review:`, `ad-reuse:` and `lastrun:` keys.

Save it as `market-signal:scope`.

Save it as `quality_review:log`.

A capital fails: `Brand:summary`.

A quoted key fails too: `append_calibration(key: "applicant-review:acme-holiday-campaign")`.

A JSON example fails too: `{key: "ad-reuse:account-map"}`.

A key under a namespace the list does not hold fails: save it under the key `newflow:setup`.
