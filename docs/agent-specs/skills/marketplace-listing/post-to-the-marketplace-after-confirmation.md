---
name: Post to the marketplace after confirmation
owner: 12-marketplace-listing
---

# Post to the marketplace after confirmation

## What it does

Posts the approved listing to the Aspire marketplace, or updates or closes a live one, after the person confirms that listing.

## Inputs

- From brand memory: the newest `listing` finding for this campaign.
- From the launch message: the approval for this one listing.

## Output

The marketplace link and status, recorded as a `listing` finding in the same run. Until Atlas can post to the marketplace, a copy-ready listing instead.

## Callable

Never user-callable. Only Marketplace Listing runs it.
