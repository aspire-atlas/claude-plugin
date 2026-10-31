---
name: Content intelligence
owner: universal
code: U2
---

# U2 Content intelligence

## What it does

Answers what happens in a post second by second, and why it landed.

## Inputs

- From Atlas: the post or draft media, its transcript, on-screen text, caption, hashtags, format, date, metrics, featured brands, and Atlas's content scores.
- From the agent: the posts that matter for its question (one post, a comparison set, an account's last 100 posts, or a program's posts) and how finely to sample frames (one per second for a single post analysis, one every three seconds plus targeted frames for a review).

## Output

A shot list with cut times; the hook, body, turn, and close by timecode; brands and people on screen, timed; spoken and on-screen disclosure; and, across a set of posts, the pattern the top posts share (format, theme, weekday, hook) with an evidence post for each. When nothing can be seen it returns "Can't check" with what is missing, and it names the frame extractor it used.

## Callable

Never user-callable. Agents that list U2 under **Universal skills used** run it, and it is never
counted in an agent's own skills.
