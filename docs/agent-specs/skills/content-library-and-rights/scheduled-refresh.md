---
name: Scheduled refresh
owner: 26-content-library-and-rights
---

# Scheduled refresh

## What it does

Rebuilds the library every week and alerts the team to rights about to end.

## Inputs

- From brand memory: the program's cadence and routing, or `library:cadence` for the whole brand.
- From the launch message: `run: unattended`.

## Output

The same page link republished, `asset` findings saved for what changed, and the expiring-rights
alert posted to the saved routing. It runs only after one interactive build has saved the page,
never asks a question, and never writes rights.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
