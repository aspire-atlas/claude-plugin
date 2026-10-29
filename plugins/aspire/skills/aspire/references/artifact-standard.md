# Artifact standard (the mark and the source line on every page)

Every page, deck, and card the plugin publishes carries the animated Aspire Atlas mark at the top
right and one source line at the end. This file is the one place that defines both. A flow's
reference names where its header and footer go; this file says what goes in them. Never restate the
source sentence anywhere else: point here.

The two pieces say everything the page needs to say about itself:

- **Who prepared it:** the mark, which is Aspire Atlas. A page never names Claude, a model, or an
  assistant, and names the person who asked for it only in the "Prepared by" line a page for a
  VP or budget owner carries (`skills/page-standard/SKILL.md`, section 2). Creators, approvers,
  and other people a flow shows stay as that flow sets them.
- **For whom:** the header's "Prepared for" chip (recipient-lens.md), and, on a page shared outside
  the team, the audience in the source line.
- **When:** the "as of" time in the source line, which changes every time the page is republished or
  its data is refreshed. There is no separate prepared date.

What a page says, part by part, and the E1 to E12 checks it passes before it is published are set
by the shared skill `${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md`. This file sets only the
mark and the source line.

Applies to: pages published with the Artifact tool, the PPA deck (HTML and exports), the inline
creator card widget, the decision audit page, sample pages, and any page the main thread builds.
Does not apply to: Slack posts, email and mailbox drafts, chat replies, the account connection
card, the theme options preview, and files made for import (CSV order sheet, code sheet, finance
export). A CSV keeps its columns exactly; carry the date and the source in the file name and say the
source in the hand-off message instead.

## 1. The mark

- Full pages: paste `${CLAUDE_PLUGIN_ROOT}/assets/aspire-animated.svg` inline (read the file; about
  27KB, ASCII) as an inline `<svg>`, 40px square, in the header's right-hand group, with
  `role="img"` and `aria-label="Aspire Atlas"` kept as the file has them. One copy per page.
- Widgets, slides, and anything with several copies or a 300KB budget (the inline creator card):
  paste `${CLAUDE_PLUGIN_ROOT}/assets/aspire-animated-small.svg` (about 8KB), 28px.
- Never load it from a URL: published pages and widgets cannot load outside images. Never recolor,
  restyle, or replace it, and never let the brand theme recolor it; it keeps its own dark tile. Give
  it a 1px `var(--border)` outline so its edge shows on a dark page.
- It sits at the opposite end from the brand's own logo (theme.md puts that at the start of the
  header). When a header already has a right-hand item (a freshness chip, a "Saved to Atlas" chip),
  put the mark at the far right and the chip to its left.
- Its squares shuffle slowly, each on its own cycle of 7 to 23 seconds, so the pattern keeps changing
  and takes minutes to repeat. It honors `prefers-reduced-motion` already (the squares hold still).
  Do not add script, and do not edit the file: it is generated from `hooks/logo.ts`.
- A deck exported to PowerPoint or Google Slides cannot play the animation: the pptx skill draws the
  small mark as a static image in the top right of each slide; if it cannot, it leaves the mark off
  the export and says so in the hand-off. The HTML deck always carries it.

## 2. The source line

One statement at the end of the page, in the muted text color, after the flow's own footer notes
(images are a snapshot, rights, fee labels, and the like stay as they are; the source line is
added, it does not replace them). Markup:

```html
<footer class="atlas-footnote" data-updated="{asOfIso}">
  <p>Source: Aspire Atlas cross-platform indexing ({networks}). Data compiled via proprietary AI brand memory as of {asOfDate}. {audienceLine}</p>
</footer>
```

- **{asOfDate}**: when the numbers were read from Atlas, from the shell clock (`date -u`), never from
  the prompt or a session header, with a time for any page that can refresh within a day. It is the
  same moment the flow's "numbers come from Atlas as of" footer line gives. A page republished or
  refreshed gets the new time; nothing keeps an earlier one. Live pages that re-read Atlas on open
  show the time of that read.
- **{networks}**: the networks the page's data came from, in this order, joined with "and" or commas:
  Instagram, TikTok, YouTube. Atlas searches Instagram and TikTok today, so a page says
  "Instagram and TikTok" unless the data it shows includes YouTube. Never list a network the page
  holds no data for.
- **{audienceLine}**:
  - Team pages (the default): `Internal use only. Not for public publishing.`
  - Pages meant to be seen outside the brand's team: `Shared with {audience} for this purpose only.
    Not for public publishing.` These are the negotiation terms summary (the creator), the CAS campaign
    page (the client's approvers), the PPA pitch deck (the client or presenter's audience), and any other
    page the user says will be shared. The order form stays "Internal use only" (its team contributors
    are the audience) and keeps its own "For your team only" notice, which this line does not replace.
- **No platform disclosures.** A page with the shared audience line says nothing about Atlas's
  own performance, errors, or missing data: no data gaps or limitations section; no failed,
  partial, or retried read; no stale, delayed, or "not available in Atlas" note; no platform or
  posts Atlas could not collect; and no fallback or snapshot explained by a failure. Those go to
  the requester in the chat summary. The page shows what was found, and a section with nothing to
  show is left out without comment. The source line, its as-of time, and a dated snapshot label
  stay. Team pages keep their data gaps.
- Data from a connector other than Atlas (a store, ad account, mailbox, or Drive file) is added to the
  source sentence: "Source: Aspire Atlas cross-platform indexing (...), and {source label} data for
  {what it fills}. Data compiled ..." Never present the other connector's figures as Atlas's.
- Never name Claude, a model, or an assistant, and never add the requester's name, email, id, slug,
  or role. "AI brand memory" is the fixed name of the data layer, not a statement about who wrote
  the page.

The source sentence's fixed wording is: `Source: Aspire Atlas cross-platform indexing ({networks}).
Data compiled via proprietary AI brand memory as of {asOfDate}.` Keep it as one sentence pair; the
check script finds it in this file only.

## 3. Variants

- **Sample pages** (mode `sample`): carry the mark, and replace the source line with "Sample.
  Invented data for {holiday} {year}. Not from Atlas. Not for any decision." Keep the sample banner.
- **Review pages** (a quality review's page): carry the mark, and replace the source line with
  "Reviewed from {the work's title}, read from {where: an artifact, Google Drive, a file} as of
  {asOfDate}." When the review re-checked Atlas figures, add the standard source sentence after it;
  when it did not, add nothing about Atlas. Then "Rubric version {n}." from `quality-review.md`, then
  the team audience line.
- **Pages with no Atlas data** (the first-run starter page, the setup-needed cards): carry the mark,
  and replace the source line with "No Atlas data on this page."
- **The order form**: Contributors edit it, so its header shows "Last edited {time}" from the page
  data `updatedAt` beside the freshness chip; its source line is the standard one with the team audience line.
- **Inline widgets** (the creator card): the small mark, 28px, in the corner that is free (the card's
  fit ring keeps its place), and one line under the cards: "Source: Aspire Atlas cross-platform
  indexing ({networks}), as of {asOfDate}. Internal use only." The full sentence is on the page when
  a card grid becomes one.
- **Decks**: the small mark top right of every slide, and the source line on the last slide
  ("Thank you"), unless a slide's footer band can carry it without crossing the render checks. A deck
  for a client uses the shared-page audience line.
- **No page** (a flow that ends in chat only): no source line is added.

## 4. Before publishing

1. The mark is inline, once, at the top right; nothing recolors it; the header still fits at phone
   width.
2. The source line has the as-of time from the shell clock and a networks list that matches the data;
   the page names no Claude, model, assistant, email, or id, and names the requester only in a
   "Prepared by" line (page-standard, section 2).
3. The header carries the "Prepared for" chip (recipient-lens.md) so the page says who it is for.
4. The audience line matches who will see the page, and a page with the shared line carries no
   platform disclosures (section 2).
5. The page source stays ASCII and keeps its size budget (the full mark is about 27KB of the page's
   budget).

## 5. For new agents and new kinds of page

This file is the only place the mark, the source sentence, and the audience lines are written. Every
other file points here and never copies them.

A new agent, or a flow that publishes a page:

1. Copy the block below into the agent file, unchanged, just above its `## Audit trail` section.
   `scripts/check-artifact-standard.sh` fails when an agent lacks it or its copy differs.
2. In the flow's reference, put one sentence in the page's Header item (the mark at the top right and
   the "Prepared for" chip from recipient-lens.md) and one in the Footer item (the source line), each
   linking this file. Keep the flow's own footer notes. Add the reference to the check script's list.
3. Use the variants in section 3 for sample pages, pages with no Atlas data, widgets, decks, and
   import files. A new kind of surface gets its variant added to section 3, not described in the flow.
4. Change the wording of the source line, an audience line, or the mark only in this file and the two
   assets in `plugins/aspire/assets/`. Then run the check.

<!-- agent-block -->
## Artifact standard

Every page, deck, or card you publish carries the animated Aspire Atlas mark at the top right and
one source line at the end, as
`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/artifact-standard.md` sets out: the mark and the
variants in sections 1 and 3, the source line in section 2. Take the as-of time from the shell clock
and change it on every republish. Never name Claude or a model on a page, and name the requester
only in the "Prepared by" line the page standard sets. A sample page follows the sample variant. Files for import (CSV) and chat or mail text carry neither.

Before you publish a page, read `${CLAUDE_PLUGIN_ROOT}/skills/page-standard/SKILL.md` and
follow it: the nine parts every page holds, the reader and evidence rules, and checks E1 to E12.
Run its script for E1, E2, E6, and E11, judge the rest, and fix every fail before publishing.
Put its page check, one per page published, at the end of your output, just before the audit
trail block.
<!-- /agent-block -->
