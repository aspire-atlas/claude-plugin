---
name: Applicants handed to List Review
owner: 12-marketplace-listing
---

# Applicants handed to List Review

## What it does

Collects applicants from the live listing and hands them to Creator List Review (07) with their answers and the rules each one passed.

## Inputs

- From brand memory: the newest `listing` finding, for the link and the rules.
- From the launch message: the campaign to read.

## Output

An `applicants` block for List Review's launch, and the counts by rule on the page.

## Callable

Never user-callable. Only Marketplace Listing runs it.
