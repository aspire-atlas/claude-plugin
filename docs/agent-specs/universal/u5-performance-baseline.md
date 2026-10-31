---
name: Performance baseline
owner: universal
code: U5
---

# U5 Performance baseline

## What it does

Answers whether a result is good against the brand's own baseline, its peers, or its goal.

## Inputs

- From Atlas: the account's own posts over the window with follower counts (90 days by default), competitor accounts Atlas already holds, or a peer set of three or more accounts.
- From brand memory: the goals and term, the readout's lead metric and threshold, and the weekly health target.
- From the launch message: the post, account, or creator being judged, and a brief's success target when there is one.

## Output

Rates rather than raw counts (engagement against followers, posts per week, format mix, median views); medians by format and theme; best weekdays; rank against the account's own posts, its peers, or its tier (top third, bottom third, or not judged); deltas against the 28-day median, the prior week, the 8-week median, or the prior quarter; anomalies past the threshold; and pace against each goal. It never starts discovery to build a peer set.

## Callable

Never user-callable. Agents that list U5 under **Universal skills used** run it, and it is never
counted in an agent's own skills.
