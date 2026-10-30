---
name: Brand snapshot the person can correct in chat
owner: 01-brand-context-builder
---

# Brand snapshot the person can correct in chat

## What it does

Shows what Atlas holds about the brand and lets the person change a saved fact in chat.

## Inputs

- From brand memory: every calibration on the profile, with its version, including replaced ones.
- From the launch message: the profile and the correction the person typed or picked.

## Output

For a fact that is already saved: the current version and the new one side by side, and, once the person confirms, the replacement of the old record. A web finding the person edits becomes their own answer. A single snapshot view of the whole brand memory is not built yet. A returning organization gets a three to five line summary of its profile and channels.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
