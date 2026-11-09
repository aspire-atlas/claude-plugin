---
name: Ledger lines from deals, orders and commission
owner: 18-creator-payments
---

# Ledger lines from deals, orders and commission

## What it does

Builds one ledger line for everything the brand owes or spends on the program, with a stable id so a rebuild never adds a line twice.

## Inputs

- From brand memory: the program setup records (term, budget, types, payment timing, usage fees, affiliate payout, product values), and the program's `terms`, `deliverable`, `fulfillment`, `affiliate`, `rights` and `ledger` findings.
- From Atlas, for a UGC deal paid by ad share: the brand's paid results (`search_ads`, the
  creator's posts by `igMediaIds`, `paidPurchaseValue` and `paidSpend`) in the brand's linked ad
  account, one row per currency and attribution window.
- From the launch message: the program slug, `mode` (`build`), `pass`, any ledger lines handed in from other agents this session, named creators, and the approval that saves the lines.

## Output

One line per thing owed or spent: fees per deal or per ambassador month, product cost per order,
commission per closed period, rights or UGC fees, and ad share per closed month for a UGC deal that
pays a share of ad revenue (kind `ad-share`: the Meta-reported purchase value of the creator's ads
times the agreed share, up to the deal's cap, labelled "Meta-reported"). A share of ad spend is used
only when the deal names it and the return bar above which it applies. Ad share is worked out per
currency, never converted and never added to organic figures, and no rate is suggested: the share
and the cap are the brand's own. It uses the attribution window the deal names (else the ad
account's own) and never sums across windows. An ad-share line is due 30 days after the month closes
unless the deal's payment timing says otherwise, with basis "Meta-reported, closed month". Each line
has its kind, amount, currency, due date or "due on posting", status and basis. New, revised and
void lines come back for one batch approval, and changes to a line past accrued come back as a "your
call" item.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
