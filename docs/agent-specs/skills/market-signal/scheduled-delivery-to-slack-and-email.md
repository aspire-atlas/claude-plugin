---
name: Scheduled delivery to Slack and email
owner: 02-market-signal
---

# Scheduled delivery to Slack and email

## What it does

Sends each run's page and summary to the Slack channels and email recipients saved at setup, and to each lens's own destination.

## Inputs

- From brand memory: the market signal routing, the per-lens destinations in the saved lenses, and the cadence with its timezone.
- From the launch message: the run mode (interactive or unattended) and whether the person approved saving findings.

## Output

The page link and chat summary every run, plus one message per saved destination; a lens with its own destination gets its three bullets and a link to its section. Interactive runs ask once to confirm the sends; scheduled runs send on the approval given at setup. It reports any send that failed, never sends anywhere else, and a leadership page is returned as a link, not delivered. A missing setup produces a "setup needed" card instead.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
