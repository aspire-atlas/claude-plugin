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
- An organic count Atlas holds for the brand's own post (the part ads did not bring) keeps its
  name as a figure. For another account's post, show the total and say it is the total.
- Ad reuse's "organic traction" keeps its name. It is a video's own views and engagement before
  any ad ran it, on an ads page, and it says nothing about whether the creator was paid.
- A saved finding keeps its key (`sov.organic` in the market signal). Only the words a reader
  sees change.

## What the page check reads

On a page that answers O1, O2, O3, or I6 (the account review, the competitive reads, and the
quarter), and on any page with `data-mention` evidence, R11 fails on "organic" or "unpaid" said of
posts:

- before a word for posts ("40 organic posts", "unpaid mentions", "organic reach");
- paired with "paid" ("paid vs organic");
- closing a clause or alone in a table cell ("the buzz is organic.");
- "organically" beside a posting verb ("posted organically").

It reads three places:

- a sentence that names a handle, in body text or in a label (alt text, a chart's `aria-label`);
- a table that names a handle, column headings included;
- a `data-mention` block, with or without a handle.

The word said of anything else beside a handle passes ("organic cotton", "organic, fair-trade and
safe", "2 unpaid invoices"). So do a handle or hashtag that holds the word (`@organic.mom`,
`#organic`), a link, and someone else's words marked as quoted.

**The brand's own figures.** These pages often give the brand's own organic results ("@{brand}
reached 31,000 organic views"). Mark that block, or one that gives what the brand's own records
say a creator was paid, with `data-own`; the check skips it. Never put `data-own` on another
account's posts to pass the check.

On every other page, and wherever no handle sits beside the word (a card with the handle in its
heading and the word on another line, a total with no creator named), the wording is judged by
reading.
