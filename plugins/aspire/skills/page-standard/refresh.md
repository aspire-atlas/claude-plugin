# How to refresh an account

Section 9.6 of `SKILL.md` points here. Section 9.5 there says when to refresh and how many accounts
one run may refresh.

Call `lookup_creators` with `forceRefresh: true`, `entityKind: "account"`,
the network as `schema`, the handle as `identifier`, and the run's own `asOrganizationId` and
`asProfileId`, up to 100 handles per call. Refresh only accounts Atlas already holds, so the call
starts no discovery; a named handle Atlas does not hold is the flow's to resolve (`SKILL.md` 9.5, first row).

- The first response carries what Atlas already held. Re-read the same items with `lookup_creators`
  without `forceRefresh` about every 15 seconds, up to roughly 3 minutes.
- An account counts as refreshed when its `refresh` result is `skipped` with reason
  `recently-refreshed` (make no second call), or when a re-read after a `started` result shows a
  `lastFetchedAt` later than the call. With `freshness` absent on the re-read, a `snapshotAt` later
  than the call, or a newer newest post than before, counts instead. One still `fetching` at the
  limit, or whose refresh `failed`, keeps the data Atlas held and its freshness line says so.
- Re-run the flow's searches. Search indexing lags the lookup: when a refreshed account's searches
  come back empty, or their newest post is older than the re-read's `newestPostAt`, retry once
  after about 30 seconds. Once they catch up, the page shows the new newest post; an account whose
  searches still lag is reported like an unrefreshed one, with the refresh's time.
- A team page names every refresh that was skipped as recently refreshed, and every one that
  failed; a shared page puts them in `gaps` (`SKILL.md` 9.2).
- Never refresh with `start_business_discovery`: every call starts a new billable job.
