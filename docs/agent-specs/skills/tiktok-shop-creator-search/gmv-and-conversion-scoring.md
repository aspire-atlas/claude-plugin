---
name: GMV and conversion scoring
owner: 10-tiktok-shop-creator-search
---

# GMV and conversion scoring

## What it does

Scores each creator on GMV per video and per LIVE, and on conversion from views to orders, against the median of the creators in this run.

## Inputs

- From brand memory: `program:{slug}-terms` for the affiliate commission the brand pays, when a program exists.
- From the launch message: the rows from Shop creator metrics read.

## Output

A score from 0 to 100 per creator with the two or three figures behind it, labelled as observations. A creator with too little Shop history is marked "not scored".

## Callable

Never user-callable. Only TikTok Shop Creator Search runs it.
