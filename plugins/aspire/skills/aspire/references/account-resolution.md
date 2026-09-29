# Account resolution reference

Shared by the agents that work on one named account: `atlas-account-analyst` (mode `handle`)
and `atlas-creator-profile`. **Resolve** finds the account in Atlas and makes sure the data is
current before any analysis. **Peer set** builds the accounts it is compared against. Each
agent's own file says what it does with the result.

## Resolve

Do this before any analysis. Call `list_creator_search_fields` first and look for a
last-indexed or last-updated field on the account record. The user approved the fetch below by
naming the handle.

- Read what Atlas holds: `search_creators` filtered on the username field for that handle and
  network, and `search_posts` filtered on the author username field, sorted by posted date desc,
  `limit: 1`.
- **Current** means Atlas holds the account *and* its record was last indexed under 24 hours ago,
  measured against the real clock (`date -u` in the shell, never an assumed "today"). If the creator
  field census exposes no last-indexed or last-updated field, fall back to the newest indexed post
  being under 24 hours old. Anything else is stale: no account record, no posts, or a timestamp 24
  hours or older. The fallback will mark an account that posts less than daily as stale and trigger a
  refresh; that is the intended direction.
- Stale → refresh with `lookup_creators`: one item, `schema` = the network, `entityKind` = `account`,
  `identifier` = the handle, and `creatorDeepAnalysis` left at its default `true` so the account's
  recent posts are ingested with it. The user approved this fetch by naming the handle, so do not ask
  again, and run it at most once per handle per run.
- A `fetching` result means discovery started. There is no status-check tool for it: re-call
  `lookup_creators` with the same item to re-read, about every 15 seconds, up to roughly 3 minutes.
  The `found` response carries the account document and its 10 most recent posts; read freshness from
  that. Search indexing lags the lookup by a short interval, so re-run the searches from the first
  bullet after it settles, and retry once after ~30 seconds if they come back empty.
- `unresolvable` (including `account-not-discoverable`, cached for 7 days) or still nothing after the
  refresh: report the handle as not found or not yet indexed, say what was tried, and stop without
  writing anything. Never analyze a handle you could not resolve, and never substitute a similar one.
- Keep the resolved freshness — the newest indexed post's timestamp, the account's last-indexed
  timestamp if the census has one, and whether a refresh ran — and report it in the summary.

## Peer set

Compare the account against its own peers, never against the brand. A number with no peer set
behind it is unanchored, so build one, but the peer set belongs to the account's world, not the
brand's. Never compare a named account to the brand's own handles, and never to the brand's
competitors unless the account is itself one of them.

- Peer set, in this order. Stop at the first that yields 3 or more accounts:
  1. Accounts the user named in the request.
  2. If the handle matches a saved `competitor` record, the other `competitor` records of the same
     tier — it belongs to that set, so the set is the right one.
  3. "Like" accounts from Atlas: `search_creators` on the same network, a follower band of roughly
     0.4x to 2x the reviewed account's, and `match` clauses on `instagram.biography` /
     `tiktok.bioDescription` for the category words the account's own bio and captions use. Read
     their category from their bios and keep only genuine matches; drop brands when reviewing a
     creator, and creators when reviewing a brand.
- Compare on rates, never raw counts: median engagement and median views as a share of followers, so
  a 600K account and a 2M one sit on the same axis. Pull each peer's posts with one `search_posts`
  over the same window and compute the medians yourself.
- Report what makes the comparison uneven — differing windows, post counts, missing view counts, an
  account with suspiciously sparse data — next to the numbers, not in a footnote. Drop a peer with no
  posts indexed and say you dropped it.
- Never start discovery to build a peer set. Use what Atlas holds; if fewer than 3 usable peers are
  indexed, say so, report the account on its own terms, and name the peer set as a gap.
