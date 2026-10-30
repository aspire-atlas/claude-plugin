---
name: Personal hook from a real recent post
owner: 13-outreach-and-brief
---

# Personal hook from a real recent post

## What it does

Writes the two lines in a first message that only fit this creator: one about a real recent post of theirs, and one on why they fit the brand.

## Inputs

- From brand memory: `brand:summary`, the program's product catalog, red lines, competitors, the creator's team notes, and the newest vetting and discovery findings for the creator.
- From the launch message: the program, the mode, and the creators to write to.

## Output

For each creator, a post line and a fit line plus the cited post's link. The post is the first that exists of: one that tags the brand, one on the program's subject, or their strongest recent post. Posts above low brand-safety risk, red-line hits, and competitor paid posts are never picked. With no post that qualifies, the line is the blank `[a recent post of theirs]`, listed so the draft is never sent with it.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
