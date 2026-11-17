# Post kinds: paid label or none

The one definition of how a page, a chat reply, or a delivery message describes a post by someone
other than the brand. `SKILL.md`, section 8, points here.

## The rule

Atlas reads public posts. A public post does not reliably show the platform's paid partnership
label, and it never shows a private deal, so a post with no label may still be paid.

- For a creator's or a competitor's post, say "paid label" or "no paid label": "40 posts with no
  paid label", "3 posts with a paid label".
- Say "organic" or "unpaid" only for the brand's own posts from a connected account, or when the
  brand's own records (a program deal, the ledger) say the creator was not paid.
- An organic count Atlas holds for a post (the part ads did not bring) keeps its name as a figure.
  It says nothing about whether the creator was paid.
- A saved finding keeps its key (`sov.organic` in the market signal). Only the words a reader
  sees change.

## What the page check reads

On a page that answers O1, O2, or O3, and on any page with `data-mention` evidence, R11 fails on
"organic", "organically", or "unpaid" said of posts ("40 organic posts", "paid vs organic", "the
buzz is organic"):

- in the same sentence or table row as a handle;
- anywhere inside a `data-mention` block.

"Organic" as a plain word beside a handle ("organic cotton") passes, and so do someone else's
words marked as quoted. Mark a block that gives the brand's own organic results from a connected
account, or what the brand's own records say a creator was paid, with `data-own`; the check skips
it. Never put `data-own` on another account's posts to pass the check.

On every other page, and wherever no handle sits beside the word, the wording is judged by
reading.
