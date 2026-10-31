---
name: Leakage scan: coupon sites and unattributed use
owner: 20-promo-codes
---

# Leakage scan: coupon sites and unattributed use

## What it does

Looks for codes used by people the creator never reached. The default run reads only the store; the coupon-site search on the open web runs only when the person asks for it in this run. It uses no Atlas credits, so it stays within Send.

## Inputs

- From brand memory: every live `affiliate` code finding.
- From the launch message: the period, the store connection, and whether the person asked for the coupon-site search. The creators' posts are read from Atlas with `search_posts`.

## Output

Per code: the in-store signal with its figures (orders on days with no creator post in the 14 days before, and use above three times the code's trailing median with no new post), labelled as an inference. When the web search ran: each coupon site showing the code, with its link and date. Each leaking code gets a recommendation to rotate, recorded as a `leakage` field on the code's `affiliate` finding; its `codeStatus` stays `live`.

## Callable

Never user-callable. Only Promo Codes runs it.
