# Explanations: look at all the evidence first, link it, and save what can disappear

`SKILL.md`, section 3 and step 3b of section 4, point here. This file applies wherever a page says
why something happened: a sales spike, a top seller, a drop, a post that broke out, a creator who
went quiet. The flow's reference still sets what its page shows. This file sets what an
explanation must rest on, and it holds over a flow reference that is silent on it.

Each flow reads its own window and its own networks, which is right for the figures and wrong for
a cause. A creator's code can sell because of a TikTok from last spring, a code in a YouTube
description, or the brand's own site. A run that reads only this month's Instagram posts finds
none of them and puts the sales down to whatever outside source it saw last.

## Contents

- [1. Search everything before explaining](#1-search-everything-before-explaining)
- [2. Write the explanation from the evidence](#2-write-the-explanation-from-the-evidence)
- [3. Save evidence that can disappear](#3-save-evidence-that-can-disappear)
- [4. The next run](#4-the-next-run)
- [5. What the result reports](#5-what-the-result-reports)

## 1. Search everything before explaining

Before writing any cause, search what Atlas holds about each person involved (the creator, the
brand, the account that moved). The flow's window and networks do not limit this search.

1. **Every network.** Each of the person's handles on Instagram, TikTok, and YouTube that Atlas
   holds: `search_creators` on the name or handle finds the other networks' accounts.
2. **No date limit.** `search_posts` on each handle's `author.username` and network, with no
   `postedAt` filter, newest first. An older post that still carries the code or the link counts.
3. **The words, not just the posts.** Search the captions, transcripts, and descriptions for what
   ties the post to the result: the code, the product, the brand's name, the link. Use
   `queryText` with those words, and project the caption, transcript, and description paths that
   `list_post_search_fields` returns. A YouTube description that carries the code is evidence even
   when the video never says it.
4. **The brand's own site,** where the run can read it (a browsing or fetch tool, or a connected
   store's pages): a product page, a creator page, or a banner that names the creator or the code.
5. **Outside sources last.** Coupon sites, deal forums, and other stores come only after steps 1
   to 4. When one is read, save it as section 3 says before anything else.

Stay inside the flow's own rules: a flow that rules out lookups searches only what Atlas already
holds, and none of these steps starts discovery (`lookup_creators` and `lookup_posts` stay out of
it unless the flow already allows them). Write down each search as you make it, in plain words
("TikTok and YouTube posts by @makerjune at any date, captions and descriptions"), for the page's
`data-searched` line and the result (section 5).

## 2. Write the explanation from the evidence

- **Name the evidence the explanation rests on,** Atlas first and oldest first, then outside
  evidence. The block is `explanation` (`blocks.md`, 3.21).
- **Every post cited is a link to the post.** In the explanation each piece of evidence is a link
  (`data-evidence`), and each cited post also has its post card (`blocks.md`, 3.8), whose
  `data-post` element holds an `<a href>` to the same link.
- **No evidence in Atlas, no cause.** Write "Not explained yet" on a `data-unexplained` line, with
  what was searched on a `data-searched` line. Never fill the gap with the likeliest-sounding
  cause, and never name an outside source as the cause when Atlas holds no evidence for it either.
- **Correlation stays correlation.** A post near a sale is shown beside it, never as its cause.
  Where a flow fixes the wording (the affiliate timeline's correlation line), keep it word for word.
- **A page shared outside the team** keeps the explanation and its links. A "Not explained yet"
  line stays: it is a finding about the result, not a gap in what Atlas could read.

The page check's R7 fails a cited post with no link, an explanation with neither linked evidence nor
a "Not explained yet" line, and a "Not explained yet" line with nothing searched (`SKILL.md`,
section 5).

## 3. Save evidence that can disappear

Evidence from outside Atlas that the page relies on can change or vanish: a coupon-site listing, a
store page, a post that expires. Coupon sites also start blocking checks. So save it the moment it
is read, never later in the run.

1. **What to save:** the link, the date and time from the shell clock (`date -u`), the exact words
   that matter (the code, the discount, the creator's name, as the page shows them), and a
   screenshot where the host can take one.
2. **On the page:** the `saved-evidence` block (`blocks.md`, 3.22), with the screenshot as a data
   URI, its link, its date and time, and the words in a `blockquote`. The explanation links to it.
3. **A host that cannot browse or take a screenshot** saves the link, the date and time, and the
   quoted words, and the block says "Screenshot not taken". A source the run could not read at all
   is not evidence; name it in what was searched as "{site}: could not be read".
4. **In Atlas, for the next run:** the flow's own finding for that person carries the capture in
   its detail as `saved`: one entry per capture, `{"url", "capturedAt", "quote", "screenshot":
   true|false, "page"}`, where `page` is this run's page link. An Atlas finding holds text, not
   images; the screenshot lives on the published page, which keeps it. Write it with the flow's
   other findings, under the same confirmation. A flow that writes nothing to Atlas keeps the
   capture on its page only, and says so in the method.

## 4. The next run

When the flow reads its earlier findings, it reads their `saved` entries too, and for each capture
the new page still relies on:

- **Read the source again.** Still there: show the capture with its first date, and the new read's
  date beside it ("first saved Oct 30, still visible Nov 6"), with a new screenshot when the words
  changed.
- **Blocked or gone:** show last time's capture with its first date, its quoted words, and its
  screenshot when the earlier page can be read (`page`), marked `data-gone` with "No longer visible
  on {today}". Carry the entry forward unchanged in this run's finding, so the capture outlives the
  site.
- A capture the new page no longer relies on is left out of the page and kept in the finding.

## 5. What the result reports

The page check's `explanations` (`SKILL.md`, section 7) has one entry per explanation block: its
claim in a few words, the count of linked evidence, every search made as section 1 lists it, and
the captures saved or carried. The audit trail's data gaps list each outside source that could not
be read and each "Screenshot not taken". An example of a good and a bad explanation is in
`docs/STANDARD.md`, **Explanations**.
