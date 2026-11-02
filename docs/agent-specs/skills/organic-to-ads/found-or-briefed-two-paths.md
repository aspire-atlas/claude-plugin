---
name: Found or briefed (two paths)
owner: 24-organic-to-ads
---

# Found or briefed (two paths)

## What it does

Sorts every candidate into one of two paths before scoring, and ranks each path on its own: posts
creators made unprompted (found), and content the brand briefed and paid or gifted for (briefed).
Briefed content was vetted when the brand chose the creator and set the brief, so the two paths
check and weigh different things, and their lists are never merged into one ranking. What one
path learns about hooks, formats and creators carries to the other.

## Inputs

- From brand memory: the program's deals and the posts each creator owes, saved content review
  findings, the brand's partner hashtags, partners and competitors, and the
  `ad-reuse:account-map` calibration.
- From Atlas: each post's caption hashtags and its partnership-ads permission, when held, and past
  `ad-learning` findings for the brand, each tagged with its path.
- From the launch message: which path or paths to run (default both).

## Output

Each candidate labelled `found` or `briefed`, with the rule that placed it. In order: a deliverable
on a deal or a program's posts owed; a partnership-ads permission on the post; a partnership
hashtag (#ad, #sponsored, #partner, #ambassador, or the brand's partner tag) together with a tag
for this brand. A post with a partnership hashtag but no tag for this brand is another brand's
sponsored post: it is set aside on both paths and counted. A post whose path can't be told goes to
found, the stricter path, labelled "path unclear". Gifted-only posts are found, labelled "seeded".

What each path weighs:

| Check | Found | Briefed |
| --- | --- | --- |
| Subject (share of the brand's products, only this brand on screen) | Screen and main ranker | Shown, not weighted: nearly every briefed post passes |
| Competitor and multi-brand screen | Full | Competitor on screen against the brief only |
| Product focus | Weighted | Not weighted: nearly every briefed post is product-focused |
| Brief compliance | None | Weighted, from saved content review findings |
| Hook, brand by 3 seconds, works muted, how well it's made, the creator's usual reach | Weighted | Weighted |
| Engagement per view | Weighted against found posts only | Weighted against briefed posts only |
| Buying comments | A factor | Shown only |
| Brand safety | Strict: the creator is unvetted | Standard |
| Rights | Always asked for, with U6's range for an existing post | The deal is read first; ask only for usage it doesn't grant, priced as an extension |

Shared learning: hook pattern, format, how well it's made, works muted and the creator's usual reach
are learned from results on either path and used by both. A path with fewer than 10 results of its
own uses the other path's learning at half weight. Product focus, subject share, brief compliance
and engagement thresholds are learned per path. A found creator whose ad beats the brand's median
is suggested for a brief; a briefed creator whose deliverables keep losing is flagged for the roster
review. The page says which path the brand's best results came from in the last 90 days.

## Callable

Never user-callable. Only the agent that owns it, or every agent for a shared or universal skill,
runs it.
