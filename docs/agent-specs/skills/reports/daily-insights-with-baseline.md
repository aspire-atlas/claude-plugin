---
name: Daily insights with baseline
owner: 29-reports
---

# Daily insights with baseline

## What it does

Reports what yesterday's posts on the brand's accounts mean against the 28-day baseline, and turns each insight into a next step.

## Inputs

- From brand memory: the readout setup (`policy:readout-cadence`, `policy:readout-routing`, `guideline:readout-thresholds`, `guideline:readout-focus`, `policy:readout-escalation`), `brand:summary`, the brand's red lines, `theme:brand`, and the last daily report's findings.
- From the launch message: the profile id, the run mode, an optional target date, and the reader the run is for.

## Output

A compact page with the lead metric against the 28-day median, yesterday's posts and best post, anomalies past the threshold, red-line hits, and what changed since the last report. It is delivered to the saved Slack channel and email, and up to five insights are saved. The chat summary stays under 150 words.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
