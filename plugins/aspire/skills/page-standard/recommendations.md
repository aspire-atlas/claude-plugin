# Recommendations: what each one costs, and both readings of a two-sided effect

Step 3c of the build loop in `SKILL.md` (section 4) and the storyline's bullets (`storyline.md`)
point here. Two rules, both from a real affiliate report and a real competitive read. "Raise
commission 5 points" gave the person who holds the budget nothing to budget for. A finding that
could have helped or hurt the brand was written up as a win, which sent the team after the wrong
response.

## Contents

- [What a recommendation costs](#what-a-recommendation-costs)
- [A two-sided effect is a trend to watch](#a-two-sided-effect-is-a-trend-to-watch)
- [Markup the script reads (R5)](#markup-the-script-reads-r5)
- [What is judged](#what-is-judged)
- [In the result](#in-the-result)

## What a recommendation costs

A recommendation is anything the page asks its reader to do or approve: every decision (part 5),
every next step (part 4), and every recommendation a flow lists in a section of its own (a
your-call card, a renewal row, a positioning move). Each one ends with a cost line. Write the cost
line as you write the recommendation, from figures this run read.

| What it costs | `data-cost` | The cost line holds | Example |
| ------------- | ----------- | ------------------- | ------- |
| Money, once | `money` | The amount with its currency, and the arithmetic behind it in the same line | "Cost: about USD 1,320: 11 kits at USD 120 each (estimate, from the catalog's unit cost)." |
| Money, again and again: a promotion, a raise, a recurring deal | `money`, with `data-cost-period="month"` | The cost per month, worked from the last period's figures, the word "estimate", and what it is based on | "Cost: +5 points on USD 3,240 a month is about USD 162 a month (estimate, from October's revenue)." |
| Time only | `none` | "No spend" | "Cost: no spend, time only." |
| Money the run cannot work out | `unpriced` | "Cannot be priced", the figure that is missing, and who has it | "Cannot be priced: the kit's unit cost is missing, and the operations lead has it." |
| Money the flow keeps out of the page (`SKILL.md`, section 1, **Money stays where the flow keeps it**) | `team` | "Cost: in the team view", with the amount and its arithmetic in the team view | "Cost: in the team view." |

- **Every figure in a cost line is one the run read:** a fee from the fee calculator or the
  program's saved terms, revenue from the store or the export, a unit cost from the catalog. Never
  price from a typical rate. With a figure missing, the recommendation is `unpriced`.
- **A recurring cost is an estimate, and says so.** It uses the last closed period ("from
  October's revenue"), never a forecast, and a partial month is named as partial.
- **Costs keep their currency.** Never add amounts across currencies and never convert one. A
  recommendation with costs in two currencies shows one amount for each.
- **A recommendation that covers several creators or items** shows the total and its parts: "about
  USD 293 a month (USD 162 plus USD 131)".
- **A headline that names a recommendation that spends money** carries the cost with it: "Invite
  two affiliates to Tier 3 for about USD 293 a month".
- **A step that only waits or watches** costs no money, and says "No spend" like any other.
- **In a storyline bullet and in chat,** a recommendation carries its cost in the same sentence.

Good: "Move @creator_a from 10% to 15%. Cost: +5 points on USD 3,240 a month is about USD 162 a
month (estimate, from October's revenue)."

Bad: "Raise commission 5 points for the top affiliates." It names no amount, no period, and no
basis, so nobody can approve it against a budget.

## A two-sided effect is a trend to watch

When a finding could plausibly help or hurt the brand, and the run's data cannot tell which, the
page takes no side. Ask of every insight before it is written as a win or a risk: is there a
reading of the same numbers that points the other way? When there is, the insight becomes a trend
to watch (`blocks.md`, 3.23):

1. **The label "Trend to watch"** and the finding with its numbers.
2. **Both readings, one line each:** what it means if it helps, and what it means if it hurts.
3. **One to three signals that would settle it.** Each names what to look for, where Atlas would
   see it (a report, a section of a page, a count the next run makes), and the date it would show
   by.
4. **Its only next step is to watch those signals.** A trend to watch is never a decision, asks
   for no approval, and recommends no spend. When a signal settles it, the next run writes the
   finding as an insight with its "So:" line.

A trend to watch counts as one of the page's three insights. A finding with one plausible reading
is an insight, not a trend: never use the label to avoid a conclusion the data supports.

Good: "Trend to watch: creators call the starter kit 'the cheap one' in 14 of 61 posts. If it
helps: the low price is why new buyers try the kit first. If it hurts: 'cheap' becomes what people
say about the whole brand. Watch: comments that mention quality, in the weekly report's comment
themes, by Nov 25."

Bad: "Creators love the low price: lean into 'the cheap one' in the next brief." One reading,
taken before any signal, with spend behind it.

## Markup the script reads (R5)

```html
<section data-page="decisions">
  <h2>Decisions for you</h2>
  <!-- A decision is a recommendation: data-recommend, its data-cost, and a data-cost-line. -->
  <p data-decision data-by="2026-11-14" data-recommend data-cost="money" data-cost-period="month">Approve
    the move of @creator_a and @creator_b to Tier 3 by Nov 14.
    <span data-cost-line>Cost: about USD 293 a month (USD 162 plus USD 131; estimate, from October's revenue).</span></p>
</section>
<section data-page="next-steps">
  <h2>Next steps</h2>
  <ol>
    <li data-recommend data-cost="none">Hold @creator_c at Tier 2 this month, by Nov 14.
      <span data-cost-line>Cost: no spend.</span></li>
    <li data-recommend data-cost="unpriced" data-cost-missing="the kit's unit cost" data-cost-holder="the operations lead">Send
      the new kit to the five top sellers, by Nov 21.
      <span data-cost-line>Cannot be priced: the kit's unit cost is missing, and the operations lead has it.</span></li>
  </ol>
</section>
<!-- A two-sided effect, outside the decisions. -->
<article data-trend>
  <p>Trend to watch</p>
  <h3>Creators call the starter kit "the cheap one" in 14 of 61 posts</h3>
  <p data-reading="helps">If it helps: the low price is why new buyers try the kit first.</p>
  <p data-reading="hurts">If it hurts: "cheap" becomes what people say about the whole brand.</p>
  <ul>
    <li data-signal data-where="the weekly report's comment themes" data-by="2026-11-25">Comments that
      mention quality, in the weekly report's comment themes, by Nov 25.</li>
  </ul>
  <p>So: watch this signal. Nothing to approve yet.</p>
</article>
```

- `data-recommend` goes on the element that holds the whole recommendation: the decision, the
  list item or table row of a next step, or a flow's own recommendation card. `data-cost-line`
  goes on the element that shows the cost, inside it. In a next steps table the row carries
  `data-recommend` and the Cost cell `data-cost-line`.
- The script fails R5 when a decision or a next step is not marked as a recommendation, when a
  recommendation has no `data-cost` or no cost line, when a `money` line shows no amount with its
  currency ("USD 162", or a currency symbol), when a monthly cost does not say "a month" and
  "estimate", when a `none` line does not say "no spend", when an `unpriced` line does not say
  "cannot be priced" and show its `data-cost-missing` and `data-cost-holder`, and when a `team`
  line does not say "team view".
- It also fails R5 when a `data-trend` block is not labelled "Trend to watch", does not hold one
  `helps` and one `hurts` reading, lists no signal or more than three, has a signal that does not
  show its `data-where` and its `data-by` date, sits in the decisions, or carries a
  `data-recommend` step that is anything but watching.
- A page with no decision, no next step, and nothing marked gets R5 `unmarked`: read it for a
  recommendation. R5 is never N/A through `data-na`.
- The script's R5 line lists what it read as `recommendations` and `trends`. Copy both lists into
  the page check block (`SKILL.md`, section 7).

## What is judged

The script reads only the cost line's shape. Judge the rest by reading, as part of R5:

- Whether the arithmetic is on the line and is right, and whether its figures are ones the run
  read.
- Whether a recommendation marked `none` really spends nothing. A raise, a promotion, a paid
  usage request, a product send, and a move to another kind of deal all change what the brand pays.
- Whether amounts in different currencies were added or converted.
- A recommendation the markup missed: read the headline, each insight's "So:" line, and every
  flow section for "raise", "promote", "pay", "renew", "invite", "boost", and "move to".
- Whether an insight written as a win or a risk has a second plausible reading, and so should be a
  trend to watch; and whether a trend's two readings really point in opposite directions.

## In the result

Each entry of the result's `openItems` (`SKILL.md`, section 1) carries the recommendation's cost
as the page shows it: `cost` is `{"kind": "money", "line": "{the cost line}", "basis": "{the
figures and the period it was worked from}"}`, with `kind` one of `money`, `none`, `unpriced`, or
`team`, and `basis` `null` for `none`. A trend to watch is one `step` item whose `text` is "Watch:
{the signals}", with `cost.kind` `none` and `due` the latest signal date.
