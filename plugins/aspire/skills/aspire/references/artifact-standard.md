# Artifact standard (the mark and the footnote on every page)

Every page, deck, and card the plugin publishes carries the animated Aspire Atlas mark at the top
right and a footnote that says who prepared it, when, for whom, and where the data came from. This
file is the one place that defines both. A flow's reference names where its header and footer go;
this file says what goes in them. Never restate the source sentence anywhere else: point here.

Applies to: pages published with the Artifact tool, the PPA deck (HTML and exports), the inline
creator card widget, the decision audit page, sample pages, and any page the main thread builds.
Does not apply to: Slack posts, email and mailbox drafts, chat replies, the account connection
card, the theme options preview, and files made for import (CSV order sheet, code sheet, finance
export). A CSV keeps its columns exactly; carry the date and the source in the file name and say the
source in the hand-off message instead.

## 1. The mark

- Full pages: paste `${CLAUDE_PLUGIN_ROOT}/assets/aspire-animated.svg` inline (read the file; about
  44KB, ASCII) as an inline `<svg>`, 40px square, in the header's right-hand group, with
  `alt`-style `role="img"` and `aria-label="Aspire Atlas"` kept as the file has them. One copy per page.
- Widgets, slides, and anything with several copies or a 300KB budget (the inline creator card):
  paste `${CLAUDE_PLUGIN_ROOT}/assets/aspire-animated-small.svg` (about 6KB), 28px.
- Never load it from a URL: published pages and widgets cannot load outside images. Never recolor,
  restyle, or replace it, and never let the brand theme recolor it; it keeps its own dark tile. Give
  it a 1px `var(--border)` outline so its edge shows on a dark page.
- It sits at the opposite end from the brand's own logo (theme.md puts that at the start of the
  header). When a header already has a right-hand item (a freshness chip, a "Saved to Atlas" chip),
  put the mark at the far right and the chip to its left.
- Its animation honors `prefers-reduced-motion` already. Do not add script.
- A deck exported to PowerPoint or Google Slides cannot play the animation: the pptx skill draws the
  small mark as a static image in the top right of each slide; if it cannot, it leaves the mark off
  the export and says so in the hand-off. The HTML deck always carries it.

## 2. The footnote

One block at the end of the page, set in the muted text color, after the flow's own footer notes
(images are a snapshot, rights, fee labels, and the like stay as they are; the footnote is added, it
does not replace them). Markup:

```html
<footer class="atlas-footnote" data-prepared="{preparedAtIso}" data-updated="{updatedAtIso}">
  <p>Prepared by {preparedBy}. Prepared {preparedDate}; updated {updatedDate}.</p>
  <p>Prepared for {preparedFor}.</p>
  <p>Source: Aspire Atlas cross-platform indexing ({networks}). Data compiled via proprietary AI brand memory as of {asOfDate}. {audienceLine}</p>
</footer>
```

- **{preparedBy}**: "Claude with Aspire Atlas ({agent label})", where the agent label is the agent's
  plain name ("Creator vetting", "Weekly insights report"), followed by " for {requesterName}" when
  `get_status` gave the caller's name. Never an email, an id, a slug, a role, or an internal name.
- **{preparedFor}**: the "Prepared for" chip's words (reader or team, the decision, `when`), per
  recipient-lens.md; with no lens, the brand name and "the team". Never a creator's or a client's
  private details.
- **{preparedDate}** and **{updatedDate}**: both from the shell clock (`date -u`), never from the
  prompt or a session header, written as a date and, for a page that refreshes within a day, a time. A
  first publish prints one line: "Prepared {date}." When a page is republished or its data is
  refreshed, keep the first date and change the update: read `data-prepared` from the page already
  published (or the saved `page` finding's date) and copy it; if neither is found, set both to now.
  Live pages that re-read Atlas on open show "Data as of {time}" from the read, not the build.
- **{asOfDate}**: when the numbers were read from Atlas (the shell clock at the read), the same
  moment the flow's "numbers come from Atlas as of" footer line gives.
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
- Data from a connector other than Atlas (a store, ad account, mailbox, or Drive file) is added to the
  source sentence: "Source: Aspire Atlas cross-platform indexing (...), and {source label} data for
  {what it fills}. Data compiled ..." Never present the other connector's figures as Atlas's.

The source sentence's fixed wording is: `Source: Aspire Atlas cross-platform indexing ({networks}).
Data compiled via proprietary AI brand memory as of {asOfDate}.` Keep it as one sentence pair; the
check script finds it in this file only.

## 3. Variants

- **Sample pages** (mode `sample`): carry the mark and the first, second, and third lines. Replace
  the source line with "Sample. Invented data for {holiday} {year}. Not from Atlas. Not for any
  decision." Keep the sample banner.
- **Pages with no Atlas data** (the first-run starter page, the setup-needed cards): carry the mark
  and the first and second lines, and replace the source line with "No Atlas data on this page."
- **Inline widgets** (the creator card): the small mark, 28px, in the corner that is free (the card's
  fit ring keeps its place), and a one-line footnote under the cards: "Prepared by Claude with Aspire
  Atlas for {preparedFor}, {updatedDate}. Source: Aspire Atlas cross-platform indexing ({networks}),
  as of {asOfDate}. Internal use only." The full wording is on the page when a card grid becomes one.
- **Decks**: the mark top right of every slide (the small one), and the footnote on the last slide
  ("Thank you") as the three lines, unless a slide's footer band can carry it without crossing the
  render checks. A deck for a client uses the shared-page audience line.
- **No page** (a flow that ends in chat only): no footnote is added; the reply names who, when, for
  whom, and the source in one sentence only when the user will paste it elsewhere.

## 4. Before publishing

1. The mark is inline, once, at the top right; nothing recolors it; the header still fits at phone
   width.
2. The footnote has all lines the page's variant calls for, with the dates from the shell clock, a
   preparer name that holds no email or id, and a networks list that matches the data.
3. On a republish the first date is kept and the update changed.
4. The audience line matches who will see the page.
5. The page source stays ASCII and keeps its size budget (the full mark is about 44KB of the page's
   budget).
