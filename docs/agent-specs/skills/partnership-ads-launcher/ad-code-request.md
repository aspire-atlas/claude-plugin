---
name: Ad code request
owner: 25-partnership-ads-launcher
---

# Ad code request

## What it does

Gets the brand permission to run each chosen creator post as a partnership ad.

## Inputs

- From brand memory: the post's paid usage grant, and the creator's contact route.
- From the launch message: the posts to run. Each is checked with `search_partnership_content`
  for ad eligibility, permission status, and whether a code exists.

## Output

Per post: ready (ad eligible and permitted, or a code exists), or a short draft asking the creator
to give the brand partnership ad permission in the app. The draft never asks the creator to send a
code in a message. When a reply carries a code anyway, the code is cut from the reply before it is
recorded, and the record says "has an ad code". A code is shown only to the person who needs it, in
the conversation, and never repeated back or saved anywhere.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
