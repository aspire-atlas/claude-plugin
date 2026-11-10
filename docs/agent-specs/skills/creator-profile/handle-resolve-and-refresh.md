---
name: Handle resolve and refresh
owner: 08-creator-profile
---

# Handle resolve and refresh

## What it does

Finds the creator's account in Atlas, checks that Atlas last fetched it under 24 hours ago, and refreshes it once when it is stale.

## Inputs

- From brand memory: nothing. Resolving a handle reads no saved records.
- From the launch message: the network (Instagram or TikTok), the handle, whether the person approved the fetch (naming the handle is the approval), and whether the run is interactive or unattended. An unattended run never refreshes.

## Output

The resolved account and its recent posts, and a freshness line from the account's `freshness` field: when Atlas last fetched it (`lastFetchedAt`), the newest post it holds (`newestPostAt`), how many posts it holds, and whether a refresh ran. A handle that cannot be resolved stops the run with what was tried. A brand, shop or publisher account also stops it, with a pointer to an account review.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
