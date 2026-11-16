# Creator CSV (a creator search result as an Aspire member import)

Whenever a flow returns a list of creators from a search (a discovery shortlist, a vetting run, the
creators on a creator brief, a creator-ads lane, or a search the main thread ran) and the user asks
for it as a CSV, the file is an Aspire member import in this format. It is the only CSV format for
a list of creators; never invent other columns or reorder these. Files that are not a list of
creators (the order sheet, the code sheet, the finance CSV, the CAS page's **Export**) keep their
own formats.

The main thread's part of this flow, moved from `SKILL.md` (only pointers changed). A bold section name
in it (**Readouts**, **Guardrails**, Phase 5) is found through `SKILL.md`'s **Sections** index.

## Contents

- [Creator CSV (a list of creators as an Aspire member import)](#creator-csv-a-list-of-creators-as-an-aspire-member-import)
- [Which creators](#which-creators)
- [Columns](#columns)
- [Tags](#tags)
- [File](#file)
- [Hand-off](#hand-off)

## Creator CSV (a list of creators as an Aspire member import)

Trigger when the user asks for a CSV of creators from a search: a discovery shortlist, a vetting
run, the creators on a creator brief, a creator-ads lane, or a search you ran ("export these as a
CSV", "give me a CSV of the shortlist", "a CSV I can import into Aspire"). Every such file uses
the format in this file, whatever flow found the creators; read it and follow
it.

- **Asked with the run**: pass `csv: aspire-member` to `atlas-creator-discovery`,
  `atlas-creator-vetting` or `atlas-creator-brief`, and relay the path and row count it returns.
  For a vetting list in batches, pass the first batch's path as `csv_path` to every later batch,
  and say when the user asked for every creator, rejects included.
- **Asked after a run, or for a search you ran**: write the file yourself from the rows the
  reference's **Which creators** names. Take each creator's brand safety from the creator card
  the run showed. For the rest, read them in batches, not one call per creator: one
  `search_creators` query per network with every handle in a `terms` filter (email, names,
  channels), and one `search_posts` query per network on those handles over the last 90 days for
  their posts' `analysis.brandSafety`, plus the brand's `red_line` calibrations and competitors
  for the card's other safety flags. Run each at `limit` 100 and page with `cursor` to the end;
  one page is not the whole answer. Never start discovery or lookups for it.
- When the user names Aspire groups, projects, owners or extra tags, they go in those columns as
  given. No question is needed: writing the file is not an Atlas write.

## Which creators

| Result | Rows |
|---|---|
| Discovery shortlist | The undecided pool as the shortlist page shows it, in page order; for a creator-ads campaign, the named lane's pool, or every lane's in lane order |
| Vetting run | Approve and Maybe, in list order. Reject is left out unless the user asked for every creator |
| Creator brief | The creators the brief recommends, in the order the page shows them |
| A search the main thread ran | The creators the result showed, in its order |

A creator someone already rejected (a `creator:*` call, or a discovery decision) is left out the
same way. Say how many were left out in the hand-off.

## Columns

The header row, exactly as written here, in this order:

`email,First Name,Last Name,Instagram,YouTube,TikTok,Pinterest,Groups,Projects,Owners,Birthday,phone,Address1,Address2,City,State,PostalCode,Country,Comments,Tags`

One row per creator. No example row and no blank rows. A column Atlas does not hold is left
empty; never fill one from a guess, a web search, or another connector.

| Column | What goes in it |
|---|---|
| `email` | The contact email Atlas holds for the creator (`instagram.email`, or `contact.email` on a program roster row). Empty when none is held |
| `First Name`, `Last Name` | From the creator's display name, the same name the creator card's subtitle uses (`instagram.name`, `tiktok.displayName`, `youtube.displayName`, the part before `\|`, `•` or `·`). Two or more words: the first word is the first name and the rest the last name. One word: first name only. No name, or a name that is only the handle or a brand: both empty. Never split a handle into a name |
| `Instagram`, `TikTok` | The handle on that network, without the `@`. Empty when the creator has no channel there |
| `YouTube` | The channel's link: `https://www.youtube.com/{custom URL}` when the YouTube custom URL Atlas holds starts with `@`, else `https://www.youtube.com/channel/{channel id}`. Empty when the creator has no YouTube channel in Atlas |
| `Pinterest` | Empty. Atlas holds no Pinterest accounts |
| `Groups`, `Projects` | Empty, unless the user named them in this session. They must be the exact group or project names in Aspire, joined with `\|` |
| `Owners` | Empty, unless the user gave the owner's Aspire login email in this session |
| `Birthday`, `phone`, `Address1`, `Address2`, `City`, `State`, `PostalCode`, `Country` | Empty. A creator list from a search never carries personal details. Shipping addresses stay on the program's order form |
| `Comments` | Empty, unless the user asked for a comment on each row |
| `Tags` | Always `Atlas`, then the creator's brand safety tag, then the vetting tag on a vetting run, then any tags the user asked for, joined with `\|` (see **Tags**) |

## Tags

Every row carries two tags, in this order, before any other:

1. `Atlas`.
2. The creator's brand safety result, from the same count **n** as the creator card's brand
   safety tile (**Brand safety** in **Creator card**), red-line matches and
   competitor mentions included:
   - n = 0 with 3 or more analyzed posts: `Brand Safe`.
   - n = 1: `Brand Safety: 1 Flag ({short name})`. n ≥ 2: `Brand Safety: {n} Flags ({short name})`.
     The short name is the first flag's, as on the tile ("Profanity", "Competitor mention"), in
     title case.
   - Fewer than 3 analyzed posts and no safety flag: `Brand Safety: Not Checked`.

   When the run drew a creator card for the creator, the tag matches that card's tile; a vetting
   run's own brand safety review is the source for its creators. A creator with neither is
   counted over their posts from the last 90 days.

A vetting run adds `Vetting: Approve`, `Vetting: Maybe`, or (only when the user asked for every
creator) `Vetting: Reject` after the brand safety tag.

Remove any `|` or `,` from a tag's text so it stays one tag. Example:
`Atlas|Brand Safety: 2 Flags (Profanity)|Vetting: Maybe|Spring Launch`.

## File

- UTF-8 with a byte order mark (so Excel reads accents), comma separated, quoted per RFC 4180,
  CRLF line ends.
- Any cell holding text from Atlas or the user (a name, an email, a group, a project, an owner, a
  comment, a tag the user typed) that starts with `=`, `+`, `-`, `@`, a tab or a carriage return
  gets a leading `'`, so no spreadsheet runs it as a formula. Handles (written without the `@`),
  links, and the plugin's own tags never need one.
- Named `{slug}-aspire-members-{YYYY-MM-DD}.csv`, where the slug is the vetting list's slug, the
  campaign slug, or the brand slug, in that order. When that name is already taken by another
  list, add `-2`, `-3` and so on. Saved in the session's scratchpad folder (the working directory
  when there is none), as the finance CSV is.
- A vetting list that runs in batches makes one file. The first batch writes it, header row
  included even when it has no rows; the main thread passes that path as `csv_path` to every
  later batch, which appends its rows with no header row and no second byte order mark, each row
  ending in CRLF.
- No mark, source line, or footnote: its columns are an import format. The date goes in the file
  name and the source in the hand-off message.

## Hand-off

Give the file path and the row count, then one line on what is empty or left out and why, for
example "12 of 40 rows have no email; Atlas holds none for them. 8 rejected creators are left
out." Say once that the file imports into Aspire as members, and offer to write it again with
Aspire groups, projects, owners or more tags. Writing the file is not an Atlas write and needs no
confirmation.
