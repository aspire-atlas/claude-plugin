# Creator CSV (a creator search result as an Aspire member import)

Whenever a flow returns a list of creators from a search (a discovery shortlist, a vetting run, the
creators on a creator brief, a creator-ads lane, or a search the main thread ran) and the user asks
for it as a CSV, the file is an Aspire member import in this format. It is the only CSV format for
a list of creators; never invent other columns or reorder these (a review's applicants leave out
the personal detail columns and add a `{Campaign} Vetting` column: **A review's applicants**). Files that are not a list of creators (the order sheet, the code sheet, the finance CSV, the CAS page's **Export**) keep their
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
- [A review's applicants](#a-reviews-applicants)

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
  their posts' `analysis.brandSafety`, plus the brand red lines (**Atlas tools**, Calibration kinds) and competitors
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
| `email` | The contact email Atlas holds for the creator (`instagram.email`, or `contact.email` on a program roster row). Empty when none is held, though Aspire's import fails a row with no email |
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
example "12 of 40 rows have no email, so Aspire's import will fail them; Atlas holds none for
them. 8 rejected creators are left out." Say once that the file imports into Aspire as members, and offer to write it again with
Aspire groups, projects, owners or more tags. Writing the file is not an Atlas write and needs no
confirmation.

## A review's applicants

How the team takes a campaign's applicants, or any group of them, from an applicant review
(**Applicant review**) into Aspire. Trigger when the user asks for it ("export the {campaign}
review for Aspire", "a CSV of everyone Atlas approved", "every Team call of Approve", "export what
we filtered in the Sheet"). The review Sheet's own .xlsx download is not an Aspire import: its
columns are the team's working view, so this file is written from Atlas instead. It follows every
rule above except where this section says otherwise: it leaves out the columns it never fills and
adds a `{Campaign} Vetting` column.

Interactive only, and never in an unattended run. Writing the file is not an Atlas write and needs
no confirmation; a question below only picks the rows.

**1. Pick the review and the group.** The review is the one the user named, matched against the
profile's active `applicantreview:*-campaign` records as **Applicant review**, **Reading the setup
back (screening)**, step 1, finds them; with more than one and none named, ask which by campaign
name. When the user's words name the group, use it without asking; otherwise ask "Which {campaign}
applicants should go in the Aspire file?" with 1) Decision: Approve (Recommended); 2) Decision:
Approve and Maybe; 3) Every applicant. The tool's free text takes any other group below.

| Group | Rows |
|---|---|
| Decision {calls} | Applicants whose **Decision** (step 3) is one of the calls named |
| Atlas recommended {calls} | Applicants whose Atlas recommendation is one of them, whatever the team said |
| Team call {calls} | Applicants whose Team call (step 3) is one of them |
| Every applicant | Every applicant of the review, those with no Decision included |
| A Sheet filter | The rows of the review Sheet that meet the conditions the user gives in words, on the Sheet's columns ("Status screened and Team call blank", "Fit score 80 and up"), read fresh and matched on Aspire applicant id. The connector can't see a filter someone set on screen, so "what I filtered" is asked back once: "Which columns and values did you filter on?" |

A group may combine these ("Decision Approve, fit score 80 and up"). Repeat the group in words in
the hand-off.

**2. Read Atlas.** `list_applicants` with `asProfileId`, `reviewId` = the slug, no `statuses`,
`limit` 1000, paged with `cursor` to the end: each applicant's id, handles, `formAnswers`,
status, and recommendation. The review's Team calls per **Applicant screening**, **Team calls on a
review**. For the brand safety tag, the review's `recommendation` findings
(`search_insights` on the `creator-vetting-{profile}` prefix, as that section reads it, paged to the
end, keeping the hits with `findingType` `recommendation` and `applicantReview` the slug, grouped by
`aspireApplicantId`). When `-sheet` holds a link and the Claude Docs connector is in the session
(load its guide first), read the Sheet's Aspire applicant id and Team call columns too, plus the
columns a Sheet filter names. Never start discovery or lookups for the file.

**3. Decision.** The Team call when the applicant has one, otherwise Atlas's recommendation when the
status is `screened`, otherwise blank. The Team call is the Sheet's when its Team call cell reads as
a call (**Applicant screening**, **Reading the review Sheet**, What each row becomes), so a call
typed since the last run counts; otherwise the review's saved Team call, unless the row is
reopened there. Count the Sheet calls Atlas doesn't hold yet for the hand-off.

**4. Rows.** One per applicant in the group, ordered by Decision (Approve, Maybe, Reject, blank),
then fit score, highest first, then applicant id. The columns, in this order:

| Column | What goes in it |
|---|---|
| `email` | The applicant's email answer (**Applicant review**, **Importing applicants**, step 1's Email row); empty when there is none |
| `First Name`, `Last Name` | The application's first and last name answers, or its name answer split as **Columns** splits a display name; with neither, as **Columns** says |
| `Instagram`, `TikTok` | The record's `instagramHandle` and `tiktokHandle`, without the `@` |
| `YouTube` | Empty |
| `Pinterest`, `Groups`, `Projects`, `Owners` | As **Columns** says |
| `Tags` | `Atlas`, the brand safety tag, then any tags the user asked for. No vetting tag: tags add up on a member across campaigns, so the call goes only in the campaign's own `{Campaign} Vetting` column. The brand safety tag comes from the applicant's `recommendation` findings of its newest vetting run (one per network): n counts their `safety` results that start with `Flag` or `Fail` (the competitor check among them) and their `redLineHits`, plus 1 when its `rule` rejected a saved competitor's own handle and no competitor result already counts. The short name is `Competitor` for that added 1, else the first `riskFlags` entry, else the first category its `categories` result names (the word after `Flag:` or `Fail:`, as in `Flag: obscenity_profanity Medium on 1 post`), else the first flagged result's name, with underscores as spaces, a run-together name split into its words (`criteriaExclusion` is `Criteria Exclusion`), and in title case. n = 0 is `Brand Safe` only when the finding's `categories` result starts with `Pass`, which needs 3 or more analyzed posts, as **Tags** asks; with fewer the category screen is Can't check (**Creator vetting**, **2. Brand safety**), so n = 0 with that, a missing `categories` result (a call made before the checks ran), a Can't vet finding, or no finding at all (not screened) is `Brand Safety: Not Checked` |
| `{Campaign} Vetting` | The Decision (step 3): `Approve`, `Maybe`, `Reject`, or empty |

The header row is exactly
`email,First Name,Last Name,Instagram,YouTube,TikTok,Pinterest,Groups,Projects,Owners,Tags,{Campaign} Vetting`,
with the campaign's name as the review saves it (`Spring Seeding Vetting`). `Birthday`, `phone`,
the address columns, and `Comments` are left out, even when the application gave them: the file
never fills them, and Aspire already holds the applicant's details. The `{Campaign} Vetting` column
goes in a custom field on the member, so each campaign gets its own field and a later campaign's
import never overwrites an earlier campaign's call. The campaign is otherwise named by the file,
not a column. There is no applicant id column: Aspire makes a member's id from the email, and most
applicant ids are made by Atlas at import, which Aspire would not know.

**5. Write the file** with the **Review export snippet**, never by
hand when Python is there: it checks every row, applies **File**'s quoting, formula guard, byte
order mark and line ends, and splits the file into parts that each stay under Aspire's import
limits of 5,000 rows and 2 MB. Name it `{Brand} {Campaign} Applicant Review.csv`, with the brand's
and the campaign's names as the review saves them, any `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, or
`|` removed, and ` part {n}` before `.csv` when there is more than one part. When that name, or
any part's, is taken, pick one base name free for every part by adding ` 2`, ` 3` and so on
before ` part {n}` (`… Applicant Review 2 part 1.csv`). Save it where **File** says.

**6. Hand-off.** Attach each file when the session can send files to the user, and give its full
path and row count either way (several parts are imported one after another). Then the group in
words with its count per Decision, and one line on what is empty or left out: rows with no email
(an application always asks for one, but a row without it fails in Aspire's import), rows sharing
an email (Aspire makes them one member), and any applicant the group named that Atlas
doesn't hold. When the Sheet
holds Team calls Atlas doesn't hold yet, say how many and offer to save them (**Applicant
screening**, **Reading the review Sheet**, with its own confirmation). Offer to write it again for
another group or with Aspire groups, projects, owners, or more tags.

Then how to import it into Aspire, with the campaign's real name in place of `{Campaign}`:

1. Create a custom contact field (first time for this campaign only): Go to **Contacts** →
   **Settings** → **Create New Field**. Name it `{Campaign} Vetting`, exactly as the file's last
   column. Choose **Single Select**, add `Approve`, `Maybe` and `Reject` as options, then **Save**.
2. Go back to **Contacts** and select the upload button in the upper right corner.
3. Check that each column is mapped to an **Import To** field, and that `{Campaign} Vetting` is
   mapped to the field from step 1. If it isn't, pick it from the list.
4. Select **Next** and finish the import.

Then, under the heading **After you upload the file**, how to apply the calls to the campaign's
applicants in Aspire:

1. Go to **Campaign** and select {Campaign}.
2. Under **Applicants**, select **Applied**.
3. Select **Add Filter**, choose **All Data** in the drop-down, and search for the
   `{Campaign} Vetting` field.
4. Choose the operator **is**, type `Approve`, and select **Add**.
5. Select all the applicants shown and select **Approve**.
6. Change the filter to **is** `Maybe`, select those applicants, and select **Maybe**.
7. Change the filter to **is** `Reject`, select those applicants, and select **Reject**.
