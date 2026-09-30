---
name: staff
description: >
  Aspire staff tools for working on a customer's account in Atlas. Only for Aspire employees
  signed in to Atlas with an Aspire staff account; it checks this first and stops for anyone
  else. Today it builds the customer QBR: a goal-scored quarterly business review for one
  Aspire customer, with earned media value, top and bottom posts, affiliate results, paid ad
  picks, a customer page, and a CSM prep page. Use for "/aspire:staff", "customer QBR",
  "build the QBR for {customer}", "QBR prep for my account", or "quarterly review for a
  customer". A brand asking about its own quarter
  belongs to the quarterly signal in /aspire:aspire, not here. Never suggest it unprompted.
metadata:
  author: Aspire
---

# /aspire:staff: tools for Aspire staff

Work that Aspire staff do on a customer's account. Each flow checks the staff account first,
asks its questions here, and hands the heavy work to an agent.

Tone: brief, plain language. Call the connection "Aspire Atlas". Show customers by name and
creators by handle. Never show a tool name, a slug, or an internal id.

Every ask to the user goes through `AskUserQuestion`, never a question in plain text.

Atlas tools, prefixes, and the attribution model: `../aspire/references/atlas-tools.md`.

## 1. Connection and staff check

1. Confirm the Atlas connection with Phase 1 of `../aspire/SKILL.md`, then come back here.
2. Call `get_status` once.
3. **Staff check.** The caller is Aspire staff only when the organizations in `get_status`
   include the one with slug `aspire`: the Aspire staff organization. Only Aspire creates
   organizations, so a customer cannot make one with that slug. Keep the result as
   `staff_check: passed`.
4. **Not staff.** The person is most likely asking about their own brand. Invoke the `aspire`
   skill with the `Skill` tool, passing their message as it is, so its **Quarterly signal**
   flow picks it up and they do not have to ask again. Say nothing about staff tools. Never
   run a staff flow, never launch a staff agent, and never describe what the staff flows do.

The check keeps the flow for staff. What data anyone can read is still enforced by Atlas
itself, by the caller's own memberships.

## 2. Pick the customer

1. Take the customer from the message. Match it against the organization names in
   `get_status`, ignoring case and punctuation. Leave out the `aspire` organization and any
   organization that is plainly a personal or test one.
2. One match: use it. Several, or none named: ask with `AskUserQuestion`, header
   "Customer": "Which customer is this for?" Up to four matching names as options; say in
   the question that any other customer name can be typed in the free text field.
3. Call `get_status` again for that organization. One brand profile: use it. Several: ask
   which one, by name. None: say the customer has no brand profile in Atlas yet, and that the
   QBR can still run from the warehouse and Slack, with the Atlas sections named as gaps.
4. Keep the linked handles and networks for the agent.

## 3. Customer QBR

Full detail: `references/customer-qbr.md`. Agent: `atlas-customer-qbr`.

### 3.1 Look before asking

Ask only what Atlas and the connectors do not already say.

1. `search_calibrations` (every page) on the customer's profile for 90-day
   `alignment_target` records and `target:*` keys.
2. `search_insights` with prefix `customer-qbr-{profile}` for the last QBR's next quarter
   goals. Those were agreed at the last review, so they count as agreed goals.
3. **Connectors.** Find a data warehouse connector with `ToolSearch` (`superset`, then
   `metabase`, then `clickhouse`, `max_results: 10` each) and a Slack connector (`slack`,
   `max_results: 10`). Keep each prefix. A missing one is not a blocker; tell the user in the
   intake which sections it thins out (the warehouse carries EMV, affiliate, and program
   health; Slack carries customer questions).

### 3.2 Intake (one call)

One `AskUserQuestion` call with up to four questions. Leave out any question the message
already answers ("Q3", "influencer and affiliate", "draft the goals", "don't save anything"),
and skip the call when nothing is left to ask.

1. **Quarter** (header "Quarter"): Last completed quarter (Recommended) / Quarter to date. The
   free text field takes explicit dates or a fiscal quarter. When today is in the last two
   weeks of a quarter, recommend Quarter to date instead, since that is the quarter the
   meeting will be about.
2. **Program** (header "Program", multiSelect): Influencer or gifting / Affiliate / UGC or
   paid ads / TikTok Shop. Managed paid goes in the free text field. The answer decides
   which sections appear.
3. **Goals** (header "Goals"): when 3.1 found goals, "Use the {n} saved goals (Recommended)"
   listing them in the description, and "Draft next quarter's goals". When none were found,
   "Review against last quarter and draft next quarter's goals (Recommended)" and
   "Performance only". The question says the staff member can type the goals the customer
   agreed in the free text field, one per line, with a target and a date. Goals drafted now
   are never scored against this quarter; see the reference, section 2.
4. **Save** (header "Save"): "Save customer-safe results to Atlas? The customer's team can
   read them, so only what is on the customer page is saved." Options: Save (Recommended) /
   Pages only.

Take the presenter as the signed-in staff member unless the message names someone else.

### 3.3 Launch

Launch `atlas-customer-qbr` with: the Atlas prefix, the customer's organization and profile,
the linked handles and networks, run mode `interactive`, `staff_check: passed`, the quarter,
the program types, the goals (typed text, `saved`, or `draft`), the presenter, the warehouse
and Slack prefixes when found, and the save answer.

### 3.4 Hand over

1. Relay both links, the customer page first, each labeled.
2. Show a small bar chart of each goal's result as a percent of target, with the chart tool
   when one is available, then three bullets: the biggest surprise, the post to show first,
   and the paid pick.
3. List the data gaps in one short block and what would close each.
4. Offer the next quarter's rebuild with one `AskUserQuestion`, header "Schedule": "Rebuild
   this QBR automatically a week after each quarter ends?" Options: Schedule it
   (Recommended) / Not now. On yes, create a scheduled task named "Aspire staff customer
   QBR" for the 7th of January, April, July, and October at 9:00 in the user's timezone, with
   this prompt: "Run the Aspire staff customer QBR for {customer}, brand profile {profile
   name}, using the goals saved at the last review. Do not ask questions." Say in one line
   whether its runs will ask for approval.

## Unattended runs

A scheduled run never asks. It still runs the staff check and stops on a fail. It resolves
the customer and profile by the names in the prompt, uses saved goals, launches the agent with
run mode `unattended` and save `Pages only`, and relays the two links. It never writes to
Atlas.

## Guardrails

- The staff check runs first in every flow, interactive or scheduled.
- Every Atlas write is confirmed through `AskUserQuestion` first, never on a "yes" from an
  earlier message. Destructive tools are never called from this skill.
- No discovery: never call `lookup_*`, `search_creator_marketplace`, or
  `start_business_discovery` from a staff flow.
- Never post to Slack from a staff flow. Slack is read only here.
- The customer page is safe to forward. Anything internal goes on the prep page, and never
  into Atlas.
- Never fabricate customer, goal, or metric data. If a tool call fails, say so, name the gap,
  and continue where the reference allows.
