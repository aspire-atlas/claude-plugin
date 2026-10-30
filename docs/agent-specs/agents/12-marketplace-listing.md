---
number: 12
name: Marketplace Listing
team: 3 Campaign and deals
personas: Influencer Manager
wave: 2
permission: Send
plugin_agents: none
---

# Marketplace Listing

## Job to be done

When I want creators to apply, I want the campaign page and application page drafted for the Aspire marketplace, with questions, terms and a screening rule, so good creators apply and bad fits select themselves out.

## Questions answered

None. No question in the map routes here yet.

## Skills carried (5)

1. Listing copy from the campaign draft
2. Application questions
3. Eligibility and auto-screen rules
4. Post to the marketplace after confirmation
5. Applicants handed to List Review

## Universal skills used

- U3 Brand safety and conflicts
- U6 Rights and usage
- U7 Pricing and return

## Shared skills

Every shared skill in [`../shared/`](../shared/). Not counted above.

## Connects to

- Aspire marketplace

## Trigger phrases

- "post this campaign to the marketplace"
- "write the marketplace listing"
- "open applications for the campaign"
- "what should we ask applicants"
- "who applied"
- "close the listing"

## Writes to Atlas

The listing draft (copy, questions, and rules) as `listing` findings (a new record type the build adds to `program.md`) and the page as a `page` finding, on one batch question. Posting, updating, or closing a listing on the Aspire marketplace is a Send: one question per listing, and the result is recorded as a `listing` finding with its link in the same run. It never records a decision on an applicant.

## Non-goals

- Deciding which applicants to accept. Creator List Review (07) and Creator Vetting (06) do that.
- Setting the campaign's goal, budget, or timeline. Campaign Planner (11) does that.
- Reaching named creators directly. Outreach and Brief (13) does that.
- Pricing a deal with one creator. Negotiator (14) does that.
