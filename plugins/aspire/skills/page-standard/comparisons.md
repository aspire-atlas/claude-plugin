# Like for like: the four checks on every comparison

Step 3 of the build loop in `SKILL.md` (section 4) and the storyline's bullets (`storyline.md`)
point here. A comparison is any place a page or a bullet sets two groups, two periods, or two
brands side by side, or states a share ("87% of revenue"). Each of these flipped a real finding
when it was skipped: a brand's posts looked weaker than a competitor's until its TikTok Shop posts
were taken out; a brand had 20 posts about it, not 2, once posts naming it without the "@" were
counted; and a share of revenue came from the same share of affiliates.

## Contents

- [The four checks](#the-four-checks)
- [Markup the script reads (R15)](#markup-the-script-reads-r15)
- [What is judged](#what-is-judged)

## The four checks

Run them as you write each comparison, before the sentence goes on the page or into a bullet.

<!-- directional-max: 20; in-line-points: 5 -->
| Check | Id | Passes when | When it fails |
| ----- | -- | ----------- | ------------- |
| Same kind | `same-kind` | Every post on both sides is one kind: posts with a paid label, TikTok Shop selling posts, or posts with no paid label. The two sides hold different kinds only when the kinds are what the sentence compares ("TikTok Shop posts against the rest") | Split the mixed side by kind and compare one kind with the same kind, or drop the comparison |
| Every mention counted | `mentions` | A count of posts about a brand or creator includes the posts that name it without the "@": search the post text for the name and its spellings, as well as tags, "@" mentions, and hashtags. The method section says in one sentence how the mentions were found | Count again with the name search. When the run cannot, the comparison says so |
| Enough posts | `enough-posts` | Each side has more than 20 posts | At 20 or fewer, the figure stays and is marked "directional" beside the number, with the post count: "3.6 engagements per 1,000 views (18 posts, directional)" |
| Share against size | `share-size` | A share is shown next to its group's share of the whole: "87% of revenue from 88% of affiliates". When the two are within 5 points, the page says the share is in line with the group's size and draws no finding from it | Work out the group's share of the whole and show it. When the run does not know the whole, the share says so |

- **The kind of a post** comes from what Atlas returned for it: the partnership marker for a paid
  label, a TikTok Shop product link or tag for Shop selling. A post with neither has no paid label;
  never call it organic or unpaid. When the fields Atlas returns cannot tell Shop posts apart, the
  side is mixed.
- **20 posts is the one line.** A flow's reference points here and sets no post minimum of its own
  for a comparison. The minimum pool for a whole page is a different number
  (`${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/orchestration.md`, **2**, **The minimum pool**).
- **A comparison that fails and stays says which check it fails, in one plain line** beside it:
  "Not like for like: the {competitor} posts mix TikTok Shop selling with other posts, which Atlas
  could not tell apart." A side of 20 posts or fewer is never excused this way: it carries
  "directional" and its count. On a page shared outside the team the line stays and says only what
  the sides hold ("Not like for like: the {competitor} figure includes TikTok Shop selling
  posts"); why Atlas could not split them goes in the page check's `gaps` (`SKILL.md`, section 1).
- **Explain "directional" once,** where the page first uses it: "Directional: from 20 posts or
  fewer, so it shows a direction, not a settled result."
- **The first three checks are about posts.** A comparison whose sides are not posts (two months
  of revenue, two creators' fees) carries no markup and is judged by reading; a share is always
  marked, whatever it is a share of.
- **In a storyline bullet and in chat,** the same four checks hold, in words: the bullet names the
  kind and the post count of each side, and says "directional" for a side of 20 or fewer.

## Markup the script reads (R15)

```html
<section data-page="insights">
  <!-- Two sides: data-compare is groups, periods, brands, or kinds. Each side carries its post
       count and its kind (paid-label, shop, no-paid-label, or mixed). -->
  <p data-compare="kinds">TikTok Shop posts drew
    <span data-side="TikTok Shop posts" data-kind="shop" data-posts="18">3.6 engagements per 1,000
      views (18 posts, directional)</span>, against
    <span data-side="Posts with no paid label" data-kind="no-paid-label" data-posts="212">14.7 across
      the 212 posts with no paid label</span>.</p>

  <!-- A side counted from mentions carries data-mentions: the sentence the method section shows. -->
  <p data-compare="brands">Creators posted about
    <span data-side="Brightside Toys" data-kind="no-paid-label" data-posts="64"
          data-mentions="Mentions were found by tag, by @handle, and by the brand's name written without the @.">Brightside
      Toys in 64 posts with no paid label</span> and about
    <span data-side="Maple and Pine" data-kind="no-paid-label" data-posts="41"
          data-mentions="Mentions were found by tag, by @handle, and by the brand's name written without the @.">Maple
      and Pine in 41</span>.</p>

  <!-- A share: its percent and the group's share of the whole, both shown. data-posts only when
       the group is a group of posts. -->
  <p data-compare="share" data-share="87" data-group-share="88">87% of revenue came from 88% of
    affiliates, so the share is in line with the group's size.</p>

  <!-- A comparison that fails a check and stays: data-fails="{check id}: {the line shown}". -->
  <p data-compare="brands" data-fails="same-kind: Not like for like: the Maple and Pine posts mix TikTok Shop selling with other posts, which Atlas could not tell apart.">
    <span data-side="Brightside Toys" data-kind="no-paid-label" data-posts="64">Brightside Toys drew
      14.7 engagements per 1,000 views over 64 posts</span>, against
    <span data-side="Maple and Pine" data-kind="mixed" data-posts="41">9.2 for Maple and Pine over
      41</span>. Not like for like: the Maple and Pine posts mix TikTok Shop selling with other
    posts, which Atlas could not tell apart.</p>
</section>
<section data-page="method">
  <p>Mentions were found by tag, by @handle, and by the brand's name written without the @.</p>
</section>
```

- Mark every comparison of posts and every share the page makes: in the headline, an insight, a
  table row, a chart's caption. `data-compare` goes on the smallest element that holds the whole comparison, and each
  `data-side` on the element that shows that side's number. In a table, the row or the table is
  the comparison and each compared cell a side.
- `data-fails` takes `same-kind`, `mentions`, or `share-size`, entries joined by `;`, so a line
  holds no `;`. The line is shown inside the comparison, word for word.
- The script fails R15 when a side has 20 posts or fewer and no "directional" with its count, a
  side has no kind or is `mixed` with no `same-kind` line, the kinds differ outside a `kinds`
  comparison, a mention count's sentence is not in the method section, or a share has no group
  share shown, or sits within 5 points of it without "in line with".
- The script's R15 line lists what it read as `comparisons`. Copy that list into the page check
  block's `comparisons` (`SKILL.md`, section 7), so the result names each comparison with its post
  counts, its kinds, and its group share.

## What is judged

The script counts only what is marked. Judge the rest by reading, and the English read checks the
same from the page's words alone (**English rules**, rule 8):

- A comparison the markup missed. Read the headline, every insight, and every chart caption for
  "more than", "against", "compared with", "times", "up from", and any percent of a whole.
- Whether each side really is the kind its `data-kind` says, and whether a share's group size is
  the right whole (affiliates who sold, not everyone invited).
- Whether a share in line with its group's size is still written up as a finding.

On a page with no markup, or one drawn in script, judge all four by reading.
