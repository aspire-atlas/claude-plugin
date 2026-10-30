---
name: Frame and audio read with timecodes
owner: 31-post-analysis
---

# Frame and audio read with timecodes

## What it does

Pulls the post's video, samples a frame every second, finds the shot changes, and reads the audio for bleeps and speech.

## Inputs

- From brand memory: nothing.
- From the launch message: the post's link (Instagram, or a full TikTok video link).

## Output

A shot list with cut times, contact sheets the agent viewed, the transcript and on-screen text, and the frame extractor used. Without a frame extractor, the on-screen checks are marked "Can't check". It feeds the content breakdown: the hook, body, turn and close by time, with Atlas's content scores.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
