---
name: Sales import from Shopify, Impact, Refersion, ShareASale, Awin
owner: 19-affiliate-program
---

# Sales import from Shopify, Impact, Refersion, ShareASale, Awin

## What it does

Reads the period's sales by code or creator from the connected store or an uploaded export, with a column mapping the person can correct.

## Inputs

- From brand memory: the program's `affiliate` code findings, to match codes to creators.
- From the launch message: the period, the source, and the uploaded file's path when there is one.

## Output

One row per code with orders, revenue, currency, and source. Rows that match no code are listed apart. Customer fields are never read or kept.

## Callable

Never user-callable. Only Affiliate Program runs it.
