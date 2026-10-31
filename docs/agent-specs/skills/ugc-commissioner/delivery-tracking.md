---
name: Delivery tracking
owner: 23-ugc-commissioner
---

# Delivery tracking

## What it does

Tracks each brief from sent to delivered and flags the late ones.

## Inputs

- From brand memory: the `rights` findings that carry an `assetSpec`, and their drafts.
- From the launch message: a creator's reply or files, when the person pastes them.

## Output

Per brief: sent, due, delivered or late, with days late. A delivered asset is recorded with its
delivery date and files, and the ledger line handed in at agreement is marked earned. A late one
gets a short, polite chase as a draft. It never marks an asset delivered without the files or the
creator's message.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
