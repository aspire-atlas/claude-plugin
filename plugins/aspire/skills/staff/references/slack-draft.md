# Slack draft reference (the message staff paste when they share a customer page)

Shared by every `/aspire:staff` flow that publishes a page for a customer, and by the agents
those flows launch. Today that is the **Customer QBR** (`customer-qbr.md`, section 12).

## Why this exists

Staff share every customer page in Slack. When each person writes that message by hand, the
customer gets a different shape every time and the link is easy to bury. The flow writes the
draft, in one fixed shape, so every page lands the same way. The draft is text for the staff
member to paste. It is never posted: staff flows read Slack and never write to it.

## The format

Exactly this, line for line. Fill only the parts in braces. Keep the blank lines.

```text
:question: The question we asked:
"{question}"

:notebook_with_decorative_cover: What we learned:

• {finding}
• {finding}
• {finding}


:link: Link to artifact:
{customer page URL}
```

- **Question.** One sentence, in the customer's words, that the page set out to answer. It
  ends with a question mark and sits inside straight double quotes.
- **What we learned.** Three to five bullets, each starting with `• ` (the bullet character
  and a space, which Slack keeps as a bullet when pasted). The first bullet is the outcome.
  The rest are the findings that explain it, most important first. When the page recommends a
  next step, the last bullet says what it is.
- **Link.** The customer page URL, bare, on its own line. Slack turns it into a link on paste.

## Rules for every bullet

- One sentence, 25 words at most. The finding first, then the number that proves it.
- Every number is compared to something: the target, last quarter, the baseline, or the
  program median. It matches the same figure on the page exactly.
- Bad news is stated as plainly as good news. A missed goal is a bullet, not a footnote.
- Creators by handle with the network, for example "@handle on TikTok". Customers by name.

## Never in the draft

The draft goes to the customer, so it follows the page's never-contains list and adds its own:

- The prep page link, or any link other than the customer page.
- Anything that is only on the prep page: risks, Slack quotes or askers' names, usage rights,
  cost or margin, churn language, queries.
- Another customer's name, a tool name, a slug, or an internal id.
- Slack formatting beyond the shape above: no bold, no headers, no `@` mentions, no channel
  mentions, no extra emoji.
- Em dashes or double hyphens.

## Handing it over

The agent returns the draft in a `text` code block, so the emoji codes and bullets survive the
copy. The skill relays that block exactly as returned, right after the page links, with one
line above it: "Slack draft, ready to paste:". It never posts the draft, never picks a
channel, and never offers to send it.

A rerun that republishes the same page returns a fresh draft. A run that could not publish the
customer page returns no draft and says so.
