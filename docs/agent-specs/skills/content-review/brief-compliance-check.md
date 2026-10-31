---
name: Brief compliance check
owner: 17-content-review
---

# Brief compliance check

## What it does

Checks the post against each specified field of the one deliverable it is for.

## Inputs

- From brand memory: the brief, when it comes from Atlas: a creator brief, a saved campaign brief, or a creator ad campaign's locked brief. `/aspire` reads it and hands it over normalized.
- From the launch message: the normalized deliverable (format and length, angle, must include, avoid, hashtags, mentions, call to action, link, post window, rights, success target, disclosure; "not specified" where the brief is silent), the brief source, the stage (draft or published), and the post.

## Output

One result per specified field: Pass, Flag, Fail or Can't check, each with its evidence (a caption line, a frame and its time, or a field and its value), a fix for each Flag and Fail, and a severity. Rights are always "Can't check" from the post. The success target is checked only on a published post at least 72 hours old.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
