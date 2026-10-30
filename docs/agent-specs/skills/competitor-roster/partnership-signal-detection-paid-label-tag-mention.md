---
name: Partnership signal detection (paid label, tag, mention)
owner: 04-competitor-roster
---

# Partnership signal detection (paid label, tag, mention)

## What it does

Finds the creators who partner with each saved competitor, and the proof of each partnership.

## Inputs

- From brand memory: the saved `competitor` records with their handles and spelling variants.
- From the launch message: the profile, the window (default the last 90 days), the networks, and the competitors to include (default every saved competitor, up to six).

## Output

Per competitor: each creator with partnership posts, and per post the strongest signal it carries, ranked paid partnership label, then a tag of the competitor's account, then a mention or branded hashtag in the caption or transcript. Posts are found with `search_posts` on each competitor's handle, spelling variants, and branded hashtags. `search_partnership_content` is never used: it covers only the brand's own partnerships. Atlas does not hold the paid partnership label for other brands' posts today, so the label rank applies only where a caption or transcript discloses it (#ad, #sponsored, "paid partnership with"), and the page says the label itself is not read. A tag is read only on Instagram, from the post's mentions. On TikTok, Atlas records only tags of the brand's own accounts, so a TikTok partnership comes from the caption or transcript, and the page says so. A mention alone is labelled as a possible partnership, never as a confirmed one. Each post has its link, date, and the line or label that shows the signal.

## Callable

Never user-callable. Only Competitor Roster runs it.
