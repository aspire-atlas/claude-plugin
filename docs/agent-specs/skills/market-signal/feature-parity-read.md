---
name: Feature parity read
owner: 02-market-signal
---

# Feature parity read

## What it does

Decides, for each tracked product or topic, whether creators say the brand won, lost or came out even against each competitor.

## Inputs

- From brand memory: the market signal topics (with the words creators use for each) and scope.
- From the launch message: the profile, the window, and the lenses (the product lens leads with it).

## Output

Per topic and competitor: won, lost, even or unclear, the number of creators behind it, and one quoted caption or transcript line with its timestamp and link. Tone alone is unclear. It also groups friction: complaints about the brand by issue, with quotes, two or more creators to make an issue. Changes since the last run are flagged.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
