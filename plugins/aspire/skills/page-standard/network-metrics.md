# Network metrics: where each metric comes from, and why it is missing

`SKILL.md`, section 8, points here: its required-metrics table names the metrics, and this file
says where each one comes from per network and the reason a page shows when a post lacks it. Step
2a of the build loop (`SKILL.md`, section 4) uses the same table to count the gaps.

The last column is the reason the page shows. Use these words so a gap reads the same on every page.

| Metric | Instagram | TikTok | YouTube | Reason shown when missing |
| ------ | --------- | ------ | ------- | ------------------------- |
| `views` | `viewCount` on Reels and videos. Image and carousel posts carry none, and older videos can lack it | `viewCount` on every post | `viewCount` | "image posts have no view count"; otherwise "Atlas has no view count for this post" |
| `likes` | `likeCount`; empty when the creator hides likes | `likeCount` | `likeCount` | "the creator hides likes"; otherwise "Atlas has no like count for this post" |
| `comments` | `commentCount` | `commentCount` | `commentCount` | "Atlas has no comment count for this post" |
| `shares` | `shareCount` (`instagram.organicShareCount`), only for accounts connected to Atlas | `tiktok.totalShareCount` on every post; the shared `shareCount` is empty for TikTok | `youtube.totalShareCount`, only for channels connected to Atlas | "shown only for accounts connected to Atlas" when the account is not connected; otherwise "Atlas has no share count for this post" |
| `saves` | `saveCount` (`instagram.organicSaveCount`), only for accounts connected to Atlas | `saveCount` on every post | None: YouTube has no saves, Shorts included | On YouTube, "YouTube has no saves". On Instagram, "shown only for accounts connected to Atlas" when the account is not connected; otherwise "Atlas has no save count for this post" |
| `engagement` | Worked out from the rest | Worked out from the rest | Worked out from the rest | The views reason when views are missing |

**Pick the shares and saves reason from the account's connection.** Use "shown only for accounts
connected to Atlas" only when the post's account has no live channel for that network on any of
the organization's profiles (`get_status` lists each profile's channels; `list_channels` reads one
profile). A channel whose authorization `get_status` reports as expired is not live: it gets the
same reason, and step 2a's "Connect the account first" means reconnecting it. A connected
account's post that still has no count gets "Atlas has no share count for this post" or "Atlas has
no save count for this post". Telling the reader to connect an account that is already connected
sends them to a fix that is already done.
