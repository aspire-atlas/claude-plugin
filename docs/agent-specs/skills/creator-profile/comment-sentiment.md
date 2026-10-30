---
name: Comment sentiment
owner: 08-creator-profile
---

# Comment sentiment

## What it does

Sums the positive, neutral and negative comment counts across the creator's analyzed posts.

## Inputs

- From brand memory: nothing.
- From the launch message: the network and handle.

## Output

A sentiment split with the comment and post counts behind it, plus top comment themes when Atlas holds them, with any safety-adjacent theme marked. Left out under 20 classified comments.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
