# CAS campaign page: Master Brief and Creator Selection

Part of the CAS campaign reference. `cas-campaign.md` holds the state model, setup interview,
dispatch table, gate packets and flows, and its **1d** maps every part of the campaign page to
its file. A section named here without a file, such as **Gate 2** or **1e**, is in the file
that map gives.

### Master Brief

The round's master brief: one brief per round, made of one concept per lane, in the modular shape
the brief agent writes (`creator-brief.md`, **Creator-ads mode**). The agency writes and edits it
here; the client reads it, comments, and signs off the round's brief as a whole or asks for
changes. Signing off is the step 4 approval. A round started from an earlier one opens with that round's locked brief for each
concept, for the agency to change (**Rounds**, **The new round's brief**). Once the round is done
its brief, sign offs and comments are read only.

Sections, in order (ids, summaries and defaults in **Collapsing sections**, **Sections per tab**):

1. **Brief status** (`brief-status`), the status bar.
2. **Tone of voice and don'ts** (`brief-voice`).
3. One section per concept (`brief-{lane}`), in concept order.
4. **Needs a concept** (`brief-needs`), only while a product in scope has no concept, or, for
   the agency only, while a concept is removed this round.
5. **Frameworks** (`brief-frameworks`), agency only.
6. The creator changes: one section per changed brief (`brief-changes-{net}-{handle}`), then
   **Accepted as is** (`brief-accepted`).

#### The brief and its parts

A brief has these parts. The page words are on the left; the page data keys are in **1e**, **What
the page keeps**, and where each comes from in **Loading the brief** below.

- **The brief**, once per round: status, title, version, source doc, summary, tone of voice, the
  don'ts (and the do's the brief agent writes beside them), disclosure, delivered file naming,
  and the standing rule notice when a red line blocks written copy.
- **A concept**: product, name, positioning line, personas, conversion trigger, framework,
  story, selling points, the hero beats (problem, agitate, solve), the beats with their seconds,
  hooks H1 to H3, CTAs C1 to C2, the body and its length, runtime per platform, numbered
  B-roll, and the editing coverage result. A concept has 3 hooks and 2 CTAs, the number the brief
  agent writes (`hooks-and-ctas.md`).
- **A hook**: its number, type (a hook pattern from `ad-reuse.md`, **Hook patterns**), the line
  (what is said, or "no voice"), what is shown, the overlay text, and why it was recommended.
- **A CTA**: its number, type (Direct or Soft, `hooks-and-ctas.md`, **Writing the CTAs**), the
  line, where it sends people, the moment it lands, and why.
- **A B-roll shot**: its number (B01, B02, …), what is filmed, and the beat it serves. A number is
  never reused in the round: removing B04 leaves B03 and B05, so a variant that names B05 still
  means the same shot.
- **The variant plan** (agency only): V1 up to the program terms' variants per creator
  (**Selected Creators**, **Variants per creator**), at most 5. A
  variant has its number, framework, length, hook number, CTA number, VO, the B-roll shot
  numbers it uses, and a note.
- **Frameworks**, per campaign (agency only), one per variant slot, each a code, a name and what
  it is for. The defaults:

  | Variant | Code | Name | What it is for |
  | ------- | ---- | ---- | -------------- |
  | V1 | PAS | Problem, agitate, solve | The hero, primary spend |
  | V2 | BAB | Before, after, bridge | A short transformation cut |
  | V3 | 4Ps | Promise, picture, proof, push | Proof for the spec buyer |
  | V4 | HSO | Hook, story, offer | Top of funnel, native |
  | V5 | SSS | Star, story, solution | The creator as hero, a skeptic arc |

  A concept's own framework is the one its hero (V1) is cut to. The hero beats are written for
  it, so a concept whose framework is not PAS still writes its problem, agitate and solve as the
  hero's three beats, named as that framework names them where it differs ("before, after,
  bridge").

#### Brief status

A Card with a Collapsible header like every section. Its title is "Round {n} brief", with the
brief's status Badge beside the trigger: **Draft** (soft) until it is sent for sign off, **In review with
client** (processing) while it waits, which the client reads as "Waiting for your sign off", **Changes
requested** (warning) when the client asked for changes, and **Signed off** (success) once the client
signed it off. The status is worked out from the sends, sign offs, change requests, reopens and imports
on the page and from step 4, never typed (**Comments and sign off**, **The status, worked out**). An import newer than the
newest send (`importedAt` on `brief-rounds/r{round}`) shows **Draft** until it is sent again
(**Importing a brief**).

Inside:

- **The brief.** Its title, the summary as long text, the standing rule notice when there is one
  (a warning Badge and its line), and the source doc as a link: "Written by Claude {date}" for
  the brief agent's page, "Imported from {label} {date}" for an import (a pasted text has no
  link), or "Started from round {m}'s signed off brief" for a round started from an earlier one. The brief agent's page holds the
  variant plan, so its link renders for the agency only; an imported doc's link shows to both.
- **The meter.** A Progress bar with the line "{w} of {t} concepts written" above it, and its
  accessible name the same. A concept counts as written when every part above has a value: name,
  line, at least one persona, trigger, framework, story, product, problem, agitate, solve, every
  hook's type and line, every CTA's type and line, the body, its length, and at least 10 B-roll
  shots. For the agency it also needs every variant's framework, length, hook and CTA. The
  client's meter leaves the variant plan out, so it never counts what they can't see.
- **The counts**, one soft Badge each, in a row that wraps: "Hooks {h} of {H}", "CTAs {c} of
  {C}" ({H} being 3 and {C} 2 for each concept in the round), "Creators briefed {b} of {m}" (the round's contracted creators whose brief state is
  sent, accepted, changed, approved or locked), "{k} open comments" (unresolved comments on the
  round's brief, the agency's own agency only comments counted for the agency only, opening
  **Comments**), and "Version {v}" (the highest `version` among the round's concept `brief` findings,
  since each concept's goes up only when it changes; each concept's own shows in its section,
  and "edited since" shows when a page edit is newer than the version). A count at zero still shows.
- **Overview chips.** One chip per concept, in concept order, in its concept color (**Concept
  colors**) with its name and a soft Badge "Needs work" until it counts as written. Each chip is
  a link to `#brief/r{n}/{lane}`: it opens and scrolls to the concept, as any hash does.
- **The overview.** One row per concept: the chip, product, trigger, personas, the hook types
  ("H1 Question · H2 Demo first · H3 Result first"), the CTA types, the creators on it as
  Avatars with their handles, and its open comments. A Table from 640px, a stack of Cards on
  phone (**Responsive**). A row opens its concept. This is the scan of every concept.
- **Changes from round {m}.** Once lines from Ad Performance are applied to this round (**Ad
  Performance**, **Changes for round {t}**, where this round is {t} and the results' round {m}),
  anchored `#brief/r{n}/overview/changes`: one row per applied line, in the lines' order, grouped
  by the round {m} they came from, each with a soft Badge "From round {m} results", the line, its figures, and for a line that wrote a part a link Button
  "Go to {part}". The client reads the concept lines only, from `brief-rounds/r{round}`. The agency
  reads every line, the others under an "Agency only" rule from `agency/brief-round-r{round}`, and
  for the agency only each part a line wrote carries the same soft Badge beside its label, with the
  line and its figures in the Tooltip, until someone edits that part by hand. The client sees those
  parts as any agency edit, with no mark of where they came from. The rows are notes, not parts of
  the brief: nobody edits them here, and the creator copy never holds them. A brief run or an
  import leaves them as they are; a reset or a restore to a version from before the apply removes
  them with the parts they wrote, and their lines read as accepted, not applied, again.
- **Sign off and comments.** At the start of the header row: **Comments** for everyone, then
  **Send for sign off** or **Reopen** for the agency, or **Sign off** and **Request changes** for
  the client, each as **Comments and sign off** says. Under the Badge, the sign off line ("Signed
  off by {name} {date}") or the client's change request.
- **For the agency**, at the end of the header row: **Add a concept** (outline Button, Lucide
  `plus`), **Import** (outline Button, Lucide `file-input`, **Importing a brief**), **Start from
  round {m}** (outline Button, Lucide `copy`, **Starting from the last round**), **Versions**
  (ghost Button, Lucide `history`) and **Reset to original** (outline Button, Lucide
  `rotate-ccw`). The row wraps on phone. None of them render for the client, in **Preview as
  client** or in a done round.

#### Tone of voice and don'ts

The brief's voice, which every creator follows in every concept: the tone of voice as long text,
then "Don't" and "Do" as two lists, one line per item, then the disclosure and the delivered file
naming. The agency edits each in place and adds or removes list items ("Add a don't"); the
client reads them. A section with nothing written yet shows "No tone of voice set yet." for the
agency and is hidden for the client.

#### A concept

Each concept is a section anchored `#brief/r{n}/{lane}`, titled "{Concept} brief · round {n}",
with the brief's status Badge beside the trigger. The concept is signed off with the round's brief
(**Comments and sign off**), so it has no sign off controls of its own. Closed, its summary line is the concept at a
glance (**Sections per tab**). Open, it is the editor, in this order:

1. **Product.** The product's photo, name and SKU. The agency picks it from the products in
   scope (a Select); a product the brief names that is not in scope shows as text with a warning
   Badge "Not in products in scope".
2. **The concept.** Name, positioning line, conversion trigger, framework (a Select of the
   campaign's frameworks for the agency, its name as text for the client), personas (one line
   each, "Add a persona"), the story, and the selling points (one line each).
   **Casting**, under it: up to 4 casting keywords (one line each, "Add a keyword") and the target
   cities, when the brief names any (one line each, "Add a city"). They are what the match score's
   Brief fit reads (**Creator Selection**, **The match score**). The agency edits them and the
   client reads them. Claude seeds them at the round's first publish from `casting` in the
   concept's `campaign:{slug}-lane-{lane}` record (**1a**), stamped `claude`, so they exist before
   the creators are sent at step 2, and **Pulling decisions** writes an edit back to that record.
   A lane with no `casting` saved yet gets keywords derived from its persona and casting filter, as
   discovery and vetting derive them, stamped `claude` with "Derived, not saved yet" for the agency
   until the pull saves them (**1a**). The brief agent's data block doesn't carry them, so a brief
   run or an import never touches them.
3. **The hero (V1).** Problem, agitate and solve, one long text each, labelled by the concept's
   framework.
4. **Hooks.** H1 to H3, one block each: the number, the type as a soft Badge, the line in quotes,
   "Shown:" and "Overlay:" lines, and the reason in `text-xs text-muted-foreground`.
5. **CTAs.** C1 and C2, each with its type, the line, "Sends to:" (a bracketed blank stays a
   bracketed blank until someone fills it), "Lands at:" and the reason.
6. **Body.** The body as long text, its length ("30 seconds"), the beats with their seconds,
   and the runtime per platform.
7. **B-roll.** The numbered shot list, "B01 {what is filmed} · {beat}", with "Add a shot".
8. **Creators.** The round's approved creators on this concept, as small creator rows with their
   brief state, each linking to their card on Selected Creators.
9. **Coverage.** The editing coverage result Claude wrote ("Coverage: 3 of 3 checks pass"), and
   "Edited since the check" when a page edit is newer than it. The variant plan's own check shows
   with the plan, for the agency only. The page doesn't check coverage
   itself; the next brief run does.
10. **Variant plan**, agency only, under an "Agency only" rule (**The variant plan** below).
11. **Comments**: a ghost Button, size sm, "{k} comments" that opens **Comments** narrowed to the
    concept, and the comment Button beside every part (**Comments and sign off** below).
12. **Copy creator brief**, for everyone (**Comments and sign off**), then for the agency:
    **Remove concept** (ghost Button, Lucide `trash-2`), last.

Every part is edited in place (**Editing in place**). Short parts (name, line, trigger, a list
item, a hook's line, a length) are one line Inputs. The story, problem, agitate, solve, the body, the tone of voice, the summary and each variant's VO are long text with the
rich text toolbar. Personas, selling points, do's, don'ts and B-roll shots are lists of one line
items. Fixed choices (product, framework, hook type, CTA type, a variant's hook and
CTA) are Selects.

Two people can work on the brief at once. Each concept is its own document and every part its own
key (**1e**, **Every editable value**), so two people editing two concepts, or two parts of one
concept, both keep their work. A hook, a CTA, a beat, a B-roll shot, the runtime and the product
are each one part, saved whole, so two people changing the same hook at the same moment keep the
later save. Two people saving the same part at the same moment: the later save wins for that
part only, and the other sees "{name} changed this {time}. Saving keeps yours." while
the part is open.

#### Rich text

Long text gets a toolbar above the field while it is being edited: Bold, Italic, Underline,
Bulleted list, Numbered list, Indent, Outdent, Link and Clear formatting. Each is a ghost icon
Button, size sm, with a Tooltip and an `aria-label` naming it, and `aria-pressed` on the three
marks while the selection carries them. The toolbar is one row that scrolls sideways on phone,
each Button 44px there (**Responsive**, **Touch**). Ctrl or Cmd with B, I, U and K, Tab and Shift
Tab in a list, and Enter on an empty list item work as in any editor, and each has its Button.

- **How it edits.** The field is a `contenteditable` region the page drives itself. It keeps the
  text as a small list of blocks (paragraph, bulleted item, numbered item, each with an indent
  level from 0 to 4) holding runs of text with marks (bold, italic, underline, link). Each
  toolbar action and each `beforeinput` event (`formatBold`, `formatItalic`, `formatUnderline`,
  `insertParagraph`, `insertFromPaste`, `deleteContentBackward` and the rest) changes that list
  through the Selection and Range APIs, then the page draws the field again from the list and
  puts the caret back. It never calls `document.execCommand`, which is deprecated. While an input
  method is composing (`isComposing`, between `compositionstart` and `compositionend`, as with a
  phone keyboard's suggestions or Chinese, Japanese or Korean input), the page leaves the field to
  the browser and redraws nothing; on `compositionend` it reads the composed text into the list
  once. So typing on a phone never doubles or drops letters.
- **Link.** Link opens a small Dialog with the address and the text, and Remove link when the
  selection is on one. Only `https:`, `http:` and `mailto:` addresses are kept. A saved link opens
  in a new tab with `rel="noopener noreferrer"`.
- **Indent and Outdent.** In a list, Indent nests the item under the one above and Outdent lifts
  it. In a paragraph they move the whole paragraph in or out one step. Four steps at most.
- **Clear formatting** removes the marks from the selection and turns the blocks it touches into
  plain paragraphs at indent 0.
- **Pasting.** A paste reads the clipboard's `text/html`, else `text/plain`. HTML is parsed with
  `DOMParser` into a document that is never attached to the page, so nothing in it loads or runs.
  The page walks that document and keeps only text, line breaks, paragraphs, headings (as bold
  paragraphs), bulleted and numbered lists with their nesting, bold, italic and underline (from
  their tags or a `font-weight`, `font-style` or `text-decoration` on a span), and links with the
  addresses above. Everything else goes: scripts, styles, images, tables (their cells become
  paragraphs), comments, every attribute but a kept link's address, and every class, color and
  font. A paste past the length limit is cut and says so.
- **What is saved.** The field saves when the person leaves it, as one value: HTML with only
  `p`, `br`, `strong`, `em`, `u`, `ul`, `ol`, `li` and `a href`, and a `data-indent` from 1 to 4
  on a paragraph. Every value is run through the same filter as a paste when it is read back,
  from page data or from the page itself, because page data is untrusted. The page draws it by
  building nodes from the filtered blocks, never by setting `innerHTML` from a stored value.
  Indented paragraphs take `pl-6`, `pl-12`, `pl-16` or `pl-24` for steps 1 to 4, from a fixed
  lookup, all on Tailwind's default scale.
- **Size.** A long text value holds up to 20,000 characters of saved HTML; the field shows "{n}
  characters left" once under 2,000 remain, and refuses more. That keeps a concept well inside
  one document (**1e**, **Brief versions and Reset to original**).
- **Everywhere else** (the summary line, the overview, the export, a creator changes diff, a
  History row) long text shows as plain text, lists as "• " lines and numbered lines.

#### The variant plan

For the agency only, at the end of each concept under an "Agency only" rule, and never in the page
itself (**Who sees what**): a Table of V1 to V{v}, {v} being the program terms' variants per creator
(**Selected Creators**, **Variants per creator**), at most 5. Columns: Variant, Framework (a Select of the campaign's frameworks; it starts on the
framework for that slot), Length, Hook (a Select of the concept's hooks, "H1 Question"), CTA (a
Select of its CTAs), VO (long text, opened below the row with the toolbar), B-roll (the shot
numbers, picked from the concept's numbered list, shown "B02, B05, B09"), and Note. The Table keeps
its first column and header pinned (**Responsive**, **Tables**) and is a stack of Cards on phone. A
variant that names a hook, CTA or shot that was removed shows it struck through with a warning
Badge "Removed", so nobody cuts from a part that is gone; a creator's card, Content Review and Ad
Performance show the same thing as "Broken", since there it is a cut's plan that is broken. Under the
Table, one line names the creators on the concept who override it, linking to each card
(**Selected Creators**, **Concept and variant plan**, **Under the brief's own plan**): a change
here reaches every other creator on the concept. Changing a variant's framework, hook or CTA here
when any creator following it already has a cut for that variant first opens a Dialog: "{k}
creators following V{n} already have a cut made with {old}. Change the plan anyway?"

#### Frameworks

Agency only. One row per variant slot with its code, name and what it is for, each edited in
place. They start from the defaults above, or from the campaign's saved frameworks
(`campaign:{slug}-cas`, `frameworks`), and are the campaign's, not the round's: a change shows in
every round's Selects. Changing one changes no variant already planned, which keeps the name it
was given; "Use for V{n} in every concept" (ghost Button) sets that slot in this round's plans,
after a Dialog confirm naming how many it changes.

#### Adding and removing a concept

- **Add a concept** opens a Dialog: title "Add a concept to round {n}", a Select of the products in
  scope (those with no concept first, each marked "needs a concept"), an Input for the name, an
  optional Input for the positioning line, and Cancel (outline) and Add concept (default). The
  page slugs the name by **1a**'s rule (unique on the campaign, never a name the page uses for
  itself), creates the concept's document (**1e**), with `added` set, opens it, and scrolls to it.
  It takes the next concept color. It reaches Atlas as a new concept only through **Pulling
  decisions**, with its own confirmation.
- **Needs a concept.** The products in scope (`products` in `campaign:{slug}-cas` with the page's
  `product-{id}` edits, not removed, any status) that no concept in the round names, each as a
  List row with its photo, name, status pill and a warning Badge "Needs a concept", and for the
  agency an "Add a concept" Button that opens the Dialog with that product picked. It is worked
  out live, so adding a concept for a product takes its row away for everyone. A deferred
  concept counts as naming no product in its round. Under them, the concepts deferred to the next
  round (**Deferring a concept**), for both sides.
- **Remove concept** opens a Dialog: "Remove {concept} from round {n}'s brief?", with the line
  "It stays on the campaign. Creators can't be on a concept that isn't in the brief, so it can't
  be removed while {k} creators are on it." and Remove concept (destructive), disabled while any
  approved creator in the round is on it. The page writes `removed` on the concept's document; it
  leaves the overview and the meter and is listed under **Needs a concept** as "Removed from this
  round", with **Bring back** for the agency.

#### Reset to original and versions

The original is the brief Claude last wrote for the round: the brief agent's run, or an import
that replaced it. **Reset to original** opens a Dialog: title "Reset the round {n} brief?", a
Select of what to reset ("The whole brief" first, then each concept), the line "Every edit made
since {date} goes back to the brief Claude wrote, for everyone. The brief as it is now is saved
first, so you can bring it back from Versions.", the concepts added since, named as staying, and
Cancel (outline) and Reset (destructive). **Versions** opens a Sheet: "Brief versions", newest
first, one row per saved version ("Before a reset by {name}, {time}", "Before a restore by
{name}, {time}", "Original, written by Claude {date}"), each with what it covers and a Restore
Button that confirms in a Dialog the same way. Restoring a version saves the brief as it is now
first too, so every reset and restore can itself be undone. How versions are kept, and their
limits, are in **1e**, **Brief versions and Reset to original**.

#### Importing a brief

When the client or the agency wrote the master brief as a document, the agency imports it into
these parts rather than typing it in again. **Import** (outline Button, Lucide `file-input`) sits
in the **Brief status** header row for the agency. It renders while the round is not done and no
concept in it is signed off, because a signed off concept is the text the client approved and an
import never replaces it ("Signed off concepts can't be replaced. Start the next round from this
one instead."). Only the agency imports: the read and the mapping spend the usage of the person who
runs them, and the import writes `briefs`, `brief-rounds` and `agency` documents, which only Editors
write (**1e**, **Program files and the scan**, **Who adds and scans**).

1. **Pick the brief.** A Dialog, "Import a brief into round {n}", with Tabs:
   - **From Files**: a Select of the files in **Files**, the Master brief files tagged with this
     round or "All rounds" first, newest date first, then every other file the page can read
     (**1e**, **What the page can read**), each shown as its label, category and date.
   - **Docs link**: an Input for one `https` link. A link that isn't a Google Docs link shows
     "Paste a Google Docs link." On Replace, a link not yet in **Files** is added there as a
     Master brief for this round, `kind` `drive`, the next version in that category and round, so
     the brief's source doc is kept with the program files; a link already there is reused.
   - **Paste text**: a Textarea for the brief's text, for a doc the page can't read.

   Then Cancel (outline) and Read the brief (default).
2. **Read it.** By the scan's rules (**1e**, **The scan**, step 2), with nothing new: an upload is
   read as it is for a scan; a Google Docs link through the declared Drive tools, which read with
   the Editor's own Google Drive connector, only when the page declares `mcp` and the Editor has
   that connector and allows it. Otherwise the Dialog says "This page can't read Google Drive for
   you. Paste the brief's text, or ask Claude in the chat to import it." and moves to **Paste
   text**; a link is never an error. A link outside Google Docs, a Drive folder, a Slides deck or
   a Sheet is not read: "This link isn't a brief the page can read. Paste the brief's text." A
   file the page can only see as pictures (an image, or a PDF with almost no text) is not
   imported either, because nothing can be checked word for word against a picture: "This file
   has no text to import. Paste the brief's text." Text
   longer than `sample.limits()` allows after the instruction is not imported, and the Dialog
   says "This brief is longer than the page can read at once. Ask Claude in the chat to import
   it."; a brief is never mapped from its first part only.
3. **Map it** (**Repeatable mapping** below).
4. **Preview.** A Sheet, "Import preview", over the tab. Nothing is written while it is open. It
   shows:
   - The source: the file's label and date, or "Pasted text", and "Mapped {time}" or "Same
     document as the import on {date}, so the same mapping" when the stored mapping was used.
   - The brief: title, summary, tone, do's, don'ts, disclosure and file naming as found.
   - One Card per concept found, in the document's order, with its concept chip when it matches a
     concept in the round, else a soft Badge "New concept". Inside, every part the document has,
     as plain text, then **Not in the document** (the parts it has no text for, which stay as they
     are), **Couldn't use** (each with why: "Not word for word in the document", "Not one of the
     hook types", "Not Direct or Soft", "Not one of the campaign's frameworks"), and a warning
     Badge "Not in products in scope" where a product is. A hook or CTA the hook log holds for
     another round, or for another concept in this round, goes to **Couldn't use**, "Used in round
     {r}", because every hook and CTA in the log is refused in every round (**Rounds**, **The new
     round's brief**). One the log holds for this concept in this round is the brief's own, not a
     reuse, and is kept. A refused hook or CTA leaves its slot as it is now, never empty, so the
     agency or the next brief run decides what goes there.
   - **Will change**: per concept, "{k} parts will change", and every edit not yet pulled that the
     import replaces, by name ("{name}'s edit to Story on {date}"), with the line "The brief as it
     is now is saved first, so you can bring it back from Versions."
   - **Not in the document**: the round's concepts the document doesn't name, "Stays as it is".
   - For a round whose step 4 is out: "{approver} is reviewing this brief. Importing takes it back
     to Draft, so it goes to the client again when you send it."

   When no part would change, the Sheet says "Nothing to import: round {n}'s brief already
   matches {label}." and Replace is disabled, so a second import of the same document writes
   nothing at all: no version, no `importedAt`, no Files row and no change to step 4.

   Then Cancel (outline), Map again (ghost, Lucide `refresh-cw`, only when the stored mapping was
   used; it says under it "Claude reads the document again. The result can differ from the stored
   one.") and Replace round {n}'s brief (default). The Sheet follows **Responsive**, **Side
   panels**; on phone each concept Card stacks its parts.
5. **Replace.** First the page checks again, from the page data as it is at that moment, that
   the round is not done and no concept in it is signed off; if it was signed off while the
   preview was open, nothing is imported and the Sheet says "Round {n}'s brief was just signed off, so
   it can't be replaced." Then it saves the brief as it is now, `kind` before import, for every
   document the import touches (**1e**, **Brief versions and Reset to original**, **Saving before a
   change**); if one is refused, nothing is imported. Then it writes the mapped parts through the
   **Loading the brief** table, one key at a time, each a stamp with `source` `file`, the Editor as
   `by`, the source's label as `byName` ("Pasted text" for a paste), and `file` the file's id when
   it came from **Files**. A value equal to the current one is not written. A part the document
   has no section for at all keeps its value and is listed under **Not in the document**. A list
   part the document does have (personas, selling points, beats, hooks, CTAs, do's, don'ts,
   B-roll shots) is replaced whole: every higher numbered key the document doesn't carry gets a
   stamp with `value` `null`, as **Loading the brief** does, so the concept never mixes the
   document's items with older ones. The variant plan is never imported: it is the agency's own
   build, kept as it is, and a variant that names a hook, CTA or shot the import removed shows it
   as **Removed** (**The variant plan**). A concept the document names that the round doesn't have is added as **Add a concept**
   adds one (`added`, the slug rule in **1a**). Then `sourceDoc`, `importedAt:` and `importKey:` on
   `brief-rounds/r{round}`, the original version (`kind` original, `source` `file`), so **Reset to
   original** goes back to the import, and one activity entry per concept, "Imported from {label}".
6. **Status.** An import is a new draft: the status Badge shows **Draft** while `importedAt` is newer
   than step 4's `sentAt`, even when step 4 is open, until step 4 is sent again (**Brief status**).
   The import reaches Atlas through **Pulling decisions**, which takes step 4 back to planned.
   While the Badge shows Draft this way, the client's Sign off and Request changes render as a label,
   "Aspire is updating this brief. It comes back to you to sign off.", so nobody signs off text
   that is about to go back to Draft. A sign off stamped before `importedAt` is dropped by the
   pull and named ("{name}'s sign off from before the brief was sent again, not recorded").

**Repeatable mapping.** A model can put the same passage in a different part on two runs, so the
page doesn't trust one run to be the same as the next. Importing the same document twice gives the
same brief because:

- **The mapping is stored and reused.** Each mapping is saved under the document's key in
  `agency/brief-imports/{key}` (**1e**), as Claude's answer before any check: which passage goes
  to which part. Every check below (word for word, order and numbers, fixed choices, concept and
  product matches, the hook log) runs again at each preview against the round and the campaign
  as they are then, so a stored mapping never carries a framework, a product or a concept match
  that has since changed, and the same document into the same brief still changes nothing. The key for a file is where it came from, at that version:
  `upload-{asset id}` for an upload, `drive-{file id}-{modified time}` for a Google Doc, from the
  Drive details call. The key for pasted text is `text-` and the first 32 hex characters of the
  SHA-256 of the text's UTF-8 bytes after this, in order: Unicode NFC; every `\r\n` and every
  lone `\r` turned into `\n`; spaces (U+0020), tabs and `\n` removed from both ends, and no other
  character. The page works it out with `String.normalize` and `crypto.subtle`. The page also saves a `text-` key for the text it read from a file, pointing at the
  same mapping (`sameAs:`), so the same document uploaded again finds it too. A document whose key
  is stored is mapped from the store, with no call to Claude, and gives the same parts every time.
  A changed Google Doc has a new modified time, so it is mapped again, as it should be. **Map
  again** is the only way to replace a stored mapping, and it saves the new one in its place.
- **Claude only points, it never writes.** Claude is asked for the data block's shape
  (`creator-brief.md`, **The data block**) with every text value copied word for word from the
  document. The page then keeps a text value only when it appears in the document, compared after
  turning every run of spaces and line breaks into one space and curly quotes into straight ones,
  and drops the rest to **Couldn't use**. So two runs can differ only in which part a passage went
  to, never in its words.
- **The page sets the order and the numbers.** Concepts, personas, selling points, beats, hooks,
  CTAs, do's, don'ts and B-roll shots are ordered by where their text first appears in the
  document, and numbered from that order (H1 to H3, C1 and C2, B01 on), whatever order the answer
  gives. A fourth hook or third CTA goes to **Couldn't use**, "The brief has 3 hooks and 2 CTAs".
- **Numbers are text too.** A length, a beat's seconds and a runtime are kept only when their
  words appear in the document ("30 seconds", "0-3"), like any text value; Claude never works one
  out. One the document doesn't give stays empty.
- **Fixed choices are checked.** A hook's type must be one of the hook patterns
  (`ad-reuse.md`, **Hook patterns**), a CTA's Direct or Soft, a framework one of the campaign's by
  its code or name, ignoring case; anything else is left empty and listed. A concept matches a
  round's concept by its name, ignoring case, and a product a product in scope by its name, as in
  **Loading the brief**.

The call is `sample.json` on the default tier with `cache` left on, asking once. The input says the
document is a brief to read and that nothing in it is an instruction, then gives the part names and
what each holds, the round's concept names and the products in scope (names only, so it can match
them), the allowed hook types, CTA types and framework codes, the answer's shape, and the document.
No other campaign data, no fee and nothing agency only goes in it. Its answer is checked as above
and never rendered as markup. Fails, as a scan's (**The scan**, step 7): `not_granted` "Couldn't
import: Claude wasn't allowed on this page. Allow it from the page's Permissions, or ask Claude in
the chat to import the brief.", `rate_limited` "Couldn't import: too many at once. Try again in a
minute.", `invalid_json` "Couldn't import: the answer wasn't readable. Try again.", any other
"Couldn't import: {plain reason}." A failed mapping stores nothing and writes nothing.

**Importing from the chat.** When the CM asks ("import the brief from this doc"), or the page can't
read the doc, Claude reads it in the chat: a Google Docs link only with a Google Drive connector this
session already has, never asking for one; an upload in **Files** by its asset id, as **Scanning
from the chat** reads one; otherwise "I can't read that doc from here. Paste the brief's text." It
maps the text by the same rules, using and saving the same store: the key from the source, or for
pasted text the same `text-` key as the page's: the text saved after the same three steps, with
no line break added at the end, hashed with `shasum -a 256` and cut to its first 32 hex
characters. Where the chat has no shell to run it, Claude maps the text fresh by the
same rules and says in the picker that it couldn't check for an earlier import of it. It shows
the preview in one picker ("Import round {n}'s brief from {label}: {c} concepts, {k} parts change,
{e} unpulled edits replaced (saved in Versions). Not in the document: {names}.") with "Import
(Recommended)", "Change something", then writes the page data as the page would, with no `by`,
saves the versions with `claude` in place of the editor's id, records the brief findings in the same answer (**Pulling decisions**, **An
import**), and republishes.

#### Starting from the last round

A round's brief is never seeded with a made-up or sample brief. It is empty until it is started
from an earlier round, imported, or written by the brief run.

- **When.** Whenever a round is started (**Rounds**, **Starting the next round**), in the chat or
  with **Start round {n+1}** on the page, its brief starts from the last signed off brief in the
  same step. For the agency, a round with an earlier signed off brief also gets **Start from round
  {m}** (outline Button, Lucide `copy`) in the **Brief status** header row, {m} being the newest
  earlier round whose step 4 is cleared. It renders while the round is not done, its step 4 is
  not sent, and no concept in it is signed off, so a brief the client is reviewing is never
  replaced with one whose hooks are empty. It opens a Dialog: "Start round {n}'s brief from round {m}?", the concepts it
  brings, the deferred ones marked "Carried forward", the edits it replaces by name, the line
  "Round {m}'s brief doesn't change. The brief as it is now is saved first, so you can bring it
  back from Versions.", and Cancel (outline) and Start from round {m} (default). On Start the
  page checks the three conditions again from the page data as it is then, and refuses with the
  reason if one no longer holds.
- **What it copies.** Never round {m}'s own change notes (`change-r{k}-{id}`), which belong to round {m}'s
  brief; a locked version holds only the parts a sign off copies, so it has none. For each concept covered by round {m}'s sign off, its locked version
  (`agency/brief-versions/concept-{lane}-r{m}/locked-v{version}`) and the round's
  (`round-r{m}/locked-v{version}`), which hold the text the client approved, never the edits made
  since. The parts carried and the parts that start empty are the ones **Rounds**, **The new
  round's brief**, names: hooks and CTAs start empty, and the variant plan, read from round {m}'s
  `agency/brief-{lane}-r{m}`, keeps its frameworks, lengths and shots. A concept removed in round
  {m} is not copied.
- **Deferred concepts.** Every concept deferred to this round (**Deferring a concept**) is copied
  too, from its round's document as it stood when it was deferred (it was never signed off), with
  `carriedForward:` naming the round it came from. Its section and overview row carry a soft Badge
  "Carried forward from round {m}" until the round's brief is signed off.
- **Order.** The copied concepts in round {m}'s order, then the carried forward ones in their own
  round's order, then any concept added since.
- **Needs a concept.** A product in scope that no copied or carried concept names shows under
  **Needs a concept** with its "Add a concept" Button, worked out live as always, so a product
  added to scope since round {m} asks for a concept at once.
- **Writes.** Saving first, as for an import (`kind` before start, when the round already has
  brief documents). Then each part as a stamp with `source` `claude` when Claude starts it from the
  chat, or `manual` and the Editor as `by` on the page, each carrying `startedFrom` {m}, never
  `restored`, so History reads "Started from round {m}'s signed off brief" and the pull skips it. `startedFrom:` {m} on
  `brief-rounds/r{n}`, and the original version for round {n} (`kind` original), so **Reset to
  original** goes back to the copy. The status stays **Draft**, since step 4 is not sent.
- **From Ad Performance.** **Apply to round {t} brief** (**Ad Performance**, **Changes for round
  {t}**), with {t} this round, runs this copy first, with the same writes, when the round has no
  brief yet, then applies its lines on top.
- **Round {m} doesn't change.** Every write goes to round {n}'s documents. Nothing is written to
  round {m}'s `briefs`, `brief-rounds` or `agency/brief-*` documents, its versions are only read,
  and its brief findings and step 4 stay as they were, so it stays signed off.

#### Deferring a concept

The client sometimes keeps a concept for later. The agency records that with **Defer to next round**
(ghost Button, Lucide `calendar-arrow-up`), beside **Remove concept** at the end of the concept. It
opens a Dialog: "Defer {concept} to round {n+1}?", the line "It leaves round {n}'s brief and
starts round {n+1}'s as carried forward. It can't be deferred while {k} creators are on it.", and
Cancel (outline) and Defer (default), disabled while any approved creator in the round is on it,
as for removing. A signed off concept can't be deferred.

The page writes `deferred` (true) on the concept's document. The concept leaves the overview, the
meter, the counts and step 4 (**Gate 4**), and shows under **Needs a concept** as "Deferred to round
{n+1}", with **Bring back** for the agency, which writes `deferred` false. The client sees it there
too, as a line without the Button, since they asked for it. When round {n+1} already exists, its
brief must still be open for the concept: when round {n+1}'s step 4 is not sent and no concept in
it is signed off, the deferred concept is copied into it at once, as **Starting from the last
round** copies one. Otherwise **Defer** is disabled with "Round {n+1}'s brief is already with the
client. Remove the concept, or bring it into a later round.", so a deferred concept always reaches
a round. **Bring back** is offered only while round {n+1} doesn't hold the concept, or holds it as
copied with no edit since, no sign off and no approved creator on it in round {n+1}; with
creators on it there, it is disabled with "{k} creators are on {concept} in round {n+1}." When
round {n+1} holds the copy, **Bring back** also writes `removed` true and `carriedForward` `null`
on it there, so the concept is live in one round only. Once it has been edited
or signed off in round {n+1}, **Bring back** is disabled with "{concept} is being worked on in
round {n+1}. Remove it there first to bring it back here."

#### Comments and sign off

Both sides comment on any part of the round's brief and reply back and forth. The agency sends
the brief for sign off, the client signs it off or asks for changes, and a signed off brief is
locked for the round. Anyone can copy one concept as the brief a creator gets.

**Where a comment can go.** Every anchor is a part of the brief, named by `on:` and `part:` on
the comment (**1e**, **What the page keeps**) and opened by its hash (**Header and tabs**):

| Anchor | `on:` | `part:` |
| ------ | ----- | ------- |
| The header: the brief as a whole, its title, its summary | `brief-overview-r{round}` | `status`, `title`, `summary` |
| Tone of voice and don'ts: the section, the tone, each do and don't, disclosure, file naming | `brief-overview-r{round}` | `voice`, `tone`, `do-{id}`, `dont-{id}`, `disclosure`, `fileNaming` |
| A concept as a whole | `brief-{lane}-r{round}` | empty |
| A field in a concept: product, name, line, trigger, framework, personas or one persona, story, selling points or one, problem, agitate, solve, each beat, each hook, each CTA, body, length, runtime, the B-roll list or one shot | `brief-{lane}-r{round}` | `product`, `name`, `line`, `trigger`, `framework`, `personas`, `persona-{id}`, `story`, `points`, `point-{id}`, `problem`, `agitate`, `solve`, `beat-{n}`, `hook-{n}`, `cta-{n}`, `body`, `length`, `runtime`, `broll`, `broll-{n}` |
| A variant in the variant plan, agency only | `brief-{lane}-r{round}` | `variant-{n}` |

A comment on a variant is always agency only, since the variant plan is (**Who sees what**): its
box has no choice and reads "Agency only".

**Commenting on a part.** Beside every anchor's label sits a ghost icon Button, size sm, with the
Lucide `message-square-plus` icon, labelled "Comment on {part}" ("Comment on H1",
"Comment on Concept 2"). It shows on hover and focus, and always on touch screens. Once the part
has open threads, the Button carries a soft Badge with their count and shows at every width. It
opens **Comments** with a new comment box anchored there and the part's threads under it.

**The Comments panel.** An outline Button "Comments" with the Lucide `message-square` icon in the
**Brief status** header row, for everyone who reads page data, with a processing Badge of the
round's open threads the viewer can read. `#brief/r{n}/comments` opens it too. It is a Sheet
(**Responsive**, **Side panels**): title "Comments", description "Round {n} brief. Newest first."

- **Filters.** A Tabs list: All, Open, Client, Aspire, Resolved, kept in memory and opening on
  Open. Open and Resolved go by the thread's first comment. Client and Aspire go by who started
  the thread: Aspire when the writer has an `editors/{id}` marker or an `activity-editors/{id}`
  document, as the tag picker reads sides (**1e**, **Tags and the inbox**, **Who is on which
  side**), and for every agency only thread; Client otherwise. Under the Tabs a Select narrows to
  one part of the brief: All parts, the header, Tone of voice and don'ts, then each concept. Each
  filter's empty state: "No comments yet.", "No open comments.", "Nothing from {brand} yet.",
  "Nothing from Aspire yet.", "Nothing resolved yet."
- **A thread.** A Card per thread, newest activity first. At its top, a link Button "Go to
  {part}" naming the anchor ("Concept 2 · H1", "Tone of voice · Don't 3"); it closes the Sheet on
  phone, opens and scrolls to the part, and rings it with `ring-2 ring-ring` for two seconds. A
  part removed since reads "{part}, removed" and goes to its concept. Then the first comment and
  its replies in time order, replies under a `border-l border-border pl-4` rule. Each comment:
  an Avatar with initials, the name from the id (**Every editable value**), an outline Badge with
  the side ("{brand}" or "Aspire"), the time, and the text with its tags. An agency only thread
  carries a soft Badge "Agency only" and sits under the "Agency only" rule.
- **Replying.** A Textarea "Reply" and a default Button, size sm, "Reply", under each thread,
  with the tag picker (**Tagging**). A reply to an agency only thread is agency only too.
- **Resolve and Reopen.** A ghost Button, size sm, on the first comment: "Resolve" while open,
  "Reopen" once resolved. It renders only where the viewer can write it: the thread's author, or
  an Editor on any thread (**1e**, **What the rules enforce, and what they can't**). A resolved
  thread folds to its first line and "Resolved by {name} {time}", and opens on tap.
- **Editing your own.** A comment's author sees "Edit" and "Delete" as ghost Buttons, size sm. An
  edit shows "edited". Delete keeps the comment's place with "Comment deleted" and its replies,
  after a Dialog confirm. It clears the words everywhere the page put them: the comment's `text`,
  the `text`, `from` and `to` of its own activity entries, and the `text` of each tag it wrote,
  with `withdrawn` set, all under the author's own paths. An entry or tag the author can't write
  (a client's comment that an Editor edited) keeps its words, and the Dialog says so.
- **A new comment.** The box an anchor opens shows "On {part}" above a Textarea, and for the
  agency an "Agency only" Switch (on for a variant, and fixed), then Cancel (outline) and Comment
  (default). From the panel's own header, a ghost Button "New comment" asks for the part first
  with a Select of the anchors above.
- **Tags and the inbox.** Every comment and reply box tags as **Tagging** says, and an agency only
  box tags only Aspire. Each comment, reply, resolve and reopen logs as kind `comment` (**1e**,
  **The activity log**), so it reaches the inbox of everyone who can read it, opening
  `#brief/r{n}/{lane}/c{comment}` (`overview` in place of the lane on the header and the voice).

Comments stay open on a signed off brief and in a round in market, because questions keep
coming; in a done round they are read only. They never reach Atlas and never go into the creator
copy.

**Sending for sign off.** One round's brief is signed off as a whole: every concept in it but a
removed or deferred one. For the agency, a default Button "Send for sign off" with the Lucide
`send` icon sits first in the **Brief status** header row while the status is Draft or Changes
requested. It is disabled, with a Tooltip naming what is missing, until every concept counts as
written by the client's meter ("Still to write: {concepts}"). It opens a Dialog: title "Send
round {n}'s brief for sign off?", the line "{approver} gets it in their inbox and in Waiting on
you. The page doesn't email or post anything. The next time you run the campaign in the chat,
Claude records it and offers the step update for {channel}.", and Cancel (outline) and Send for
sign off (default). Send writes a `send-{id}` stamp on `brief-events/r{round}` with the Editor as
`by` and logs one entry (kind `brief`, verb `sent`, "Sent the round {n} brief for sign off"), on
the agency's client readable log. That entry is the client's inbox item, and the brief joins
their **Waiting on you** ("Sign off the round {n} brief"). The status moves to In review with
client. Sending from the chat (**Gate packets**, **Gate 4**) writes the same stamp with `source`
`claude`.

**Signing off.** For the client (a Contributor), while the status is In review with client, the
header row holds a default Button "Sign off" with the Lucide `check` icon and an outline Button
"Request changes". Neither renders for the agency, in **Preview as client**, for a read only
client, in a done round, or while an import holds the brief at Draft (**Importing a brief**).

- **Sign off** opens a Dialog: title "Sign off round {n}'s brief?", the concepts it covers by
  name, the line "Signing off locks the brief for round {n}. Aspire sends each creator their
  concept's brief from it.", an optional Textarea "A note for Aspire", and Cancel (outline) and
  Sign off (default).
- **Request changes** opens a Dialog: title "What should change?", a required Textarea, a
  checkbox per concept ("Which concepts is this about?", optional), and Cancel (outline) and
  Request changes (default). The status moves to Changes requested, and the note shows under the
  status Badge for both sides until the brief is sent again.
- **What a sign off writes.** First the item's id goes in the client's own
  `data/users/{id}/signoffs`, which nobody else can read or write, the page's owner included. Then the
  copies, and only once every one is saved does the page write the item, last, under the client's
  own `signoffs/{id}` (**1e**), never under `client`, so no reader ever finds an item without its
  copies. A refused write shows "Not saved" and keeps **Sign off** there to try again. The item holds
  `kind` signoff or changes, the round, the `send-{id}` it answers, the time,
  the note, the concepts a change request names, and for a sign off a copy of what the client
  signed, in `signoffs/{id}/copies`, one document for the round's brief and one per concept. The
  copy holds the brief's parts only, the stamped keys **Loading the brief** fills, each as the value
  the client saw (the newer of the page itself and the page data, **1e**, **Every editable
  value**), and never a publish time field, a send or a reopen. The copy is what the client signed:
  the pull records it as the locked version (**1e**, **Brief versions and Reset to original**), so
  an edit made after the sign off never becomes what the client approved. If the client's page
  ever finds a sign off under their id that their private list doesn't hold, it shows a warning
  Badge on it, "This isn't a sign off you made", and the line "Tell {CM name}." Each logs one entry
  (kind `decision`, verb `approved` or `requested changes`, "Signed off the round {n} brief" or
  "Asked for changes to the round {n} brief: {first words}"), so it shows in **History** and in the
  agency's inbox. The change request's note shows under the status Badge with the concepts it
  names ("About: {concepts}").
- **Which items count.** The page reads `sides` (**1e**), which Claude keeps from the campaign's
  `page-sides` finding at every publish and pull: the ids seen on Aspire's side, the accounts the
  CM confirmed as an approver, and the items the CM refused. A sign off or a change request counts
  when its writer has no `editors/{id}` marker and isn't in `sides` `editors:`, the CM didn't
  refuse it, it answers the newest send, nothing newer reopened or replaced the brief, and, for a
  sign off, the brief's parts still equal its copy, compared the way the pull compares them.
  Anything else renders as "Not counted" with the reason in a Tooltip ("The brief changed after
  this sign off", "Made from an Aspire account", "Aspire couldn't confirm this account", "From
  before the brief was sent again"), so a sign off the pull would drop never looks like one on
  screen. A sign off that counts from an account not yet in `sides` `approvers:` reads "Signed
  off, Aspire to confirm" (processing): the brief locks, so nothing changes under it, but step 4
  doesn't tick until the pull confirms the account. A sign off the pull already recorded (its id is
  step 4's `signoff.item`) counts without these checks, until a reopen or an import newer than it.

**The locked brief.** The round's brief is signed off, and locked, once a sign off counts or the
published step 4 was cleared after the newest send, which covers a sign off the CM recorded from
the chat, and only while no `reopen-` stamp or import is newer than that sign off or clear. A
reopen unlocks it the moment its stamp is written. Then every part of the round's brief renders as a label for everyone, Claude's own
republishes write nothing to it, and the status is Signed off, with "Signed off by {name} {date}"
under the Badge, or "Signed off by {name} {by email, on a call, in a message}, recorded by {CM
name}". **Add a concept**, **Import**, **Start from round {m}**, **Reset to original**, **Remove
concept** and **Defer to next round** don't render (**Brief status**). The variant plan stays
editable for the agency: it is Aspire's cut plan, the client never sees it, and the client didn't
sign it. On Home, step 4 ticks at once for a sign off from a confirmed account (**Home**,
**Round steps**): the client reads "Approved {date}". For the agency the same row adds a soft Badge, and **Waiting on you** and **Needs
attention** add an item, until **Pulling decisions** records it: the page builds both from the
`signoff-unrecorded` template Claude keeps in `agency/attention` (its title "Record {brand}'s brief
sign off" and its Badge "Not recorded yet"), shown only when that read returns, so the client's
page holds neither. A concept is signed off when the round's signed off brief covers it.

**Reopening.** For the agency only, on a signed off brief in a round that is not in market or
done, and while no creator in the round has their brief yet (`briefState` sent or later, **1g**),
an outline Button "Reopen" with the Lucide `lock-open` icon in the header row. It opens a Dialog:
title "Reopen round {n}'s brief?", the line "{name}'s sign off from {date} stops counting. The
brief goes back to Draft, and you send it for sign off again.", a required Textarea "Why are you
reopening it?" that the client reads too, and Cancel (outline) and Reopen (destructive). It writes
a `reopen-{id}` stamp on `brief-events/r{round}` with the reason and the sign off it undoes
(`{writer}/{item}`, or `chat` for one recorded from the chat), and logs one entry (kind `brief`,
verb `reopened`, "Reopened the round {n} brief: {reason}") on the client readable log, so the client
gets it in their inbox and History shows it. A round in market keeps its brief: the Button is
replaced by "Ads are live from this brief. Changes go into round {n+1}'s brief." Once creators have
their briefs, it is replaced by "{k} creators have this brief. Changes go into round {n+1}'s brief,
or each creator's own changes (**Creator changes**)."

**The status, worked out.** From the round's events, newest first, the published step 4 counting
as an event at its `sentAt` and `clearedAt`: a `reopen-` or an import (`importedAt`) newer than every
send reads **Draft**; a send (a `send-` stamp, or step 4 sent) with nothing newer reads **In review
with client**; a change request that counts, newer than the send, reads **Changes requested**
(warning); a sign off that counts, or step 4 cleared, newer than the send reads **Signed off**
("Signed off, Aspire to confirm" while its account isn't confirmed).
With no event at all, **Draft**.

**Copy creator brief.** At the end of each concept, an outline Button, size sm, "Copy creator
brief" with the Lucide `clipboard-copy` icon, for the agency and the client. It copies one plain
text brief for that concept, ready to paste into an email or a message: **the creator copy**. The
same text goes in each creator's brief draft (**1g**), built there from the locked version.

```text
{Concept name} · {product}
{positioning line}

The idea
{story}
Who it's for: {personas, joined with ", "}
What moves them: {trigger}

Beats
{n}. {beat name} ({seconds}): {what happens}
Problem: {problem}
Agitate: {agitate}
Solve: {solve}

Selling points
• {selling point}

Hooks
H{n} ({type}): "{line}"
   Shown: {shown}
   Overlay: {overlay}

CTAs
C{n} ({type}): "{line}"
   Sends to: {destination}
   Lands at: {moment}

Body ({length})
{body}
Runtime: Instagram {instagram}, TikTok {tiktok}

B-roll
B{nn} {shot} ({beat})

Tone of voice
{tone}
Do
• {do}
Don't
• {don't}
Disclosure: {disclosure}
File naming: {file naming}
```

Long text goes in as plain text (**Rich text**, **Everywhere else**). A part with no value
leaves out its line, and a list with none leaves out its heading. The problem, agitate and solve
lines take the concept's framework's own names where they differ. It never holds the variant plan,
the frameworks list, a hook's or CTA's reason, the coverage check, the creators on the concept,
comments of either kind, a version, or any id. Before the round is signed off, its first line is
"Draft: {brand} hasn't signed this off yet." The Button reads "Copied" for two seconds. Where the
browser refuses the clipboard, a Dialog "Copy creator brief" opens with the text in a read only
Textarea, already selected, the line "Press Ctrl+C or Cmd+C to copy.", and Close (outline), as
**History**'s **Copy as table** does. Copying writes nothing and logs nothing.

#### Creator changes

Then, for each creator whose brief changed, a section "@{handle} changed the {concept} brief",
anchored `#brief/r{n}/changes-{net}-{handle}`, with a "your call" pill, the line "Only the
differences against the brief you approved.", the differences only, and Approve the changes and
Send notes for the client; the agency sees the draft reply to the creator instead. This is the
creator changes approval. A difference shows the part's name, the removed text struck through
(`line-through text-muted-foreground`, in a `del`) and the added text highlighted (`bg-primary/10
text-foreground`, in an `ins`), so it reads without color too. Long text is compared as plain
text. Every part above can differ, the variant plan aside: a creator never sees it. Then
**Accepted as is**: the creators who accepted without changes.

#### Loading the brief

The brief agent publishes the round's brief page with a data block (`creator-brief.md`,
**Creator-ads mode**, **The data block**). Before a brief run, when the page has edits not yet pulled, Claude
offers **Pulling decisions** first, then passes the brief as the page holds it to the run as
`current_brief`, so the run starts from the agency's text, not the lane record. After the run, Claude reads the
block with the Artifact tool's `read`, writes it to the page data as stamps with `source`
`claude` (the variant plan and the brief page link to `agency`) under **Claude's writes** (**1e**,
**Every editable value**), so a part someone edited on the page since the last pull is kept and
named. Every numbered or listed key the block no longer carries (a B-roll shot, a beat, a
persona, a selling point, a do, a don't, a variant's parts) gets a stamp with `value` `null`, as a
reset does, so a shorter re-run leaves nothing stale. The **Casting** part's `keyword-{n}` and
`city-{id}`, and the `change-r{n}-{id}` notes from Ad Performance (**Brief status**, **Changes from
round {n}**), are never in the block and never nulled this way; `current_brief` carries the
change notes, agency lines included, so the run follows them (`hooks-and-ctas.md`, **Where
recommendations come from**). Then Claude writes the original version (**1e**, **Brief versions and Reset to original**) and
republishes. A part the agent left as a bracketed blank stays one, so the page
shows what is missing. Nothing the agent writes is dropped:

| The brief agent writes | Master Brief part | Page data key |
| ---------------------- | ----------------- | ------------- |
| Page title | Brief title | `title` in `brief-rounds/r{round}` |
| The brief page's link | Source doc, for the agency only | `briefPage:` in `agency/brief-round-r{round}` |
| The round's summary line | Summary | `summary` |
| Tone of voice | Tone of voice | `tone` |
| Do's and don'ts | Do, Don't | `do-{id}`, `dont-{id}` |
| Disclosure treatment | Disclosure | `disclosure` |
| Delivered file naming | Delivered file naming | `fileNaming` |
| Standing rule banner | Notice | `notice` |
| The run's `version`, the same for every lane it wrote | Each concept's version | `version:` in each `briefs/{lane}-r{round}`; the round's Version is the highest of them |
| Concept, from the lane, and its place in concept order | Name, positioning line, order | `name`, `line`, `order:` in `briefs/{lane}-r{round}` |
| Persona, from the lane | Personas | `persona-{id}` |
| Trigger and framework, from the lane | Trigger, framework | `trigger`, `framework` |
| Story | Story | `story` |
| Selling points | Selling points | `point-{id}` |
| Hero beats | Problem, agitate, solve | `problem`, `agitate`, `solve` |
| Beat structure, with seconds | Beats | `beat-{n}` |
| 3 hooks: pattern, said, shown, overlay, reason | H1 to H3: type (the pattern), line (what is said), shown, overlay, why | `hook-{n}` |
| 2 CTAs: type, action, destination, moment, reason | C1 to C2: type (Direct or Soft), line (the action), sends to, lands at, why | `cta-{n}` |
| 1 body, and its length | Body, length | `body`, `length` |
| Runtime per platform | Runtime | `runtime` |
| 10 to 15 B-roll shots, each with its beat | B-roll | `broll-{n}` |
| Product and SKU | Product: matched by name, ignoring case, to a product in scope, whose id it takes; no match keeps the name with an empty id and shows "Not in products in scope" | `product` |
| Editing coverage result (the three checks) | Coverage | `coverage:` |
| The variant plan's check | Variant check, for the agency only | `variantCheck:` in `agency/brief-{lane}-r{round}` |
| Creators, from the roster | Creators | Not stored: read from the roster at publish |
| Variant plan, V1 to V{v}: framework code, length, hook and CTA numbers, VO, shot numbers, note | Variant plan, the framework matched by its code to the campaign's frameworks | `v{n}-*` in `agency/brief-{lane}-r{round}` |
| Frameworks used | Frameworks | `framework-{slot}` in `agency/frameworks` |

A brief written before the agent wrote the data block is read from its page by its section
headings into the same parts. A part it doesn't have (story, selling points, the hero beats, the
variant plan, tone of voice) starts empty, and the status bar counts the concept as needing work
until the agency fills it or the next brief run writes it.

Importing a brief fills the same parts through this table, with `source` `file` and the doc as
`sourceDoc`, and becomes the new original (**Importing a brief**).

### Creator Selection

Casting for every round, from one shared pool. The pool is what `atlas-creator-discovery` and
`atlas-creator-vetting` write in creator-ads mode, unchanged: one discovery finding per creator
for the campaign (`creator-discovery-{profile}-{slug}` prefix, `detail.lane`), the newest vetting
finding for that creator and lane when the lane was screened, and the creator's newest `roster`
finding per round once they have one. Nobody adds a creator from a sheet. Each creator shows once,
with a chip per round they are in.

**Who the client sees.** The client sees the creators sent to them: those with a `roster` finding
in any round, which the Gate 2 send writes for every creator on the slate (**Gate packets**,
**Gate 2**). Only those go into the page itself, and only they have the decision control, count
toward "{m}", and wait on the client. The rest of the pool, not screened or not sent yet, is
agency data (`agency/pool`), renders for the agency only with a soft Badge "Not sent yet" and no
decision control, and is left out of every client figure. The pool median for the hook rate tile
is over the creators the viewer sees. The **Round switcher** opens on **All rounds** here, and a
round segment narrows the pool to that round's creators.

**Decisions land in the open round** (**Rounds**, **The open round**). A Priority Yes or Yes adds
the creator to that round, and the call is saved for it, in the deciding person's own decisions
(**1e**, **What the page keeps**, Creator decisions). The control names the round: "Your decision
for round {n}". A creator already in an earlier round shows their earlier calls as labels with
the round. With no open round, decisions wait: the control is a label reading "Decisions open
when round {n+1} starts".

In order: **Summary**, the toolbar, the pool in **Table** or **Cards**, then **Match score
tuning** for the agency. Every figure is worked out from the records and the page data the viewer
can read, live, and every value shows the same way whatever its source. A figure that is an
estimate (an expected cost) carries no special styling; its "Edited by" line (**Editing in
place**) says where it came from.

#### Summary

One Card, `selection-summary`, in a grid, `grid grid-cols-1 gap-4 lg:grid-cols-3` for the agency
and `grid grid-cols-1 gap-4 sm:grid-cols-2` for the client. **Budget** always covers the whole
campaign, every round. **Decisions** and **Hook rate** cover the open round, also on **All
rounds**, and the round in view when a round segment is picked.

- **Budget**, agency only. Read from `agency/budget` and each creator's `agency/creator-*`
  document, so it never renders for the client or in **Preview as client**, and is worked out
  again the moment a decision arrives.
  - **Committed**: every agreed fee on the campaign, in every round, with the allowlisting uplift
    on each unless allowlisting is off: the agreed figure plus its uplift line in **Contract and
    rates**' **Totals** (`rates-and-terms.md`, **Contract and rates**). It never comes from a typed number. Shown with
    "{k} creators agreed".
  - **Approved, not contracted**: every creator with Priority Yes or Yes in a live round, from
    the page or recorded, whose fee is not agreed and who has not declined, at their expected cost
    (`rates-and-terms.md`, **Expected cost**). Shown with "{a} creators".
  - **Unpriced**: the approved, not contracted creators with no expected cost, counted apart and
    left out of the figures above: "{u} approved creators aren't priced yet", with a soft Badge
    "Unpriced". Each name opens its row.
  - **Budget left**: the total less committed and approved, not contracted, in `text-2xl
    font-semibold`, with "of {total}" in `text-sm text-muted-foreground`. The total is edited in
    place (**Editing in place**).
  - **The meter**: the two part Meter from **Component classes**, committed then approved, not
    contracted, each part as wide as its share of the total (a `width` in `style`, the one
    inline style it takes). A legend under it repeats both with the Meter's dot in the part's
    class, the label and the amount, so the meter never reads by color alone.
    `role="meter"` with `aria-valuenow` the two together and `aria-valuemax` the total.
  - **Over budget**: when committed and approved, not contracted come to more than the total, the
    meter is full, a warning Badge "Over budget" sits beside the headline, and one line reads
    "Committed and approved come to {sum}, {x} over the {total} budget."
  - **No total saved**: the headline reads "No budget set" with its edit pencil, the meter is
    hidden, and the figures show as amounts.
- **Decisions**, for both sides: "{d} of {m} decided" for the round, where {m} is every creator
  sent to the client and not decided in an earlier round. With no open round, Decisions and Hook
  rate cover the newest round, read only, and the legend's line reads "Decisions open when round
  {n+1} starts". Under it the legend, one Badge per value in its
  **Status pills** variant with its icon and count: Priority Yes, Yes, Maybe, No, Unreviewed. Each
  Badge is a button that sets the Decision filter. Then one line per concept: its chip, its
  persona and "need {n}, {a} approved".
- **Hook rate**, for both sides: "Approved average {x}%" against "Pool median {y}%", and "{d}
  points above the pool" or "below". The average is over the creators with Priority Yes or Yes in
  the round who have a hook rate; the median over every pool creator who has one. Creators with
  none (every TikTok creator) are left out and named: "{k} without a hook rate left out". With
  nothing approved yet: "No approved creators yet", and the pool median alone.

#### The toolbar

One row above the pool that wraps on a phone, built from Input, Select and Button:

- **Search**, an Input "Search creators": name, handle, notes, city, concept, persona and tier,
  ignoring case and accents. Notes are every note in the Notes thread, and for the agency also
  the Aspire notes (**The creator viewer**, **Notes**).
- **Decision**, a Select: All, Priority Yes, Yes, Maybe, No, Unreviewed, each with its count in
  the pool as the other filters leave it.
- **Products**, one chip per product in scope, in their saved order, then "No product": Buttons
  size sm, `secondary` with `aria-pressed="true"` when pressed and `outline` with
  `aria-pressed="false"` when not, several at once, each with its count. A product link on
  Home (`#selection/product-{id}`) opens with that chip alone pressed.
- **City**, **Tier**, **Concept** and **Status**, a Select each, "All" first, then each value
  the pool holds with its count. Tiers list in size order (**Tiers** below), concepts in concept
  order. The agency also gets **Waiting on** (client, agency, creator).
- **Sort**, a Select, with a ghost icon Button beside it (Lucide `arrow-up-down`, labelled
  "Ascending" or "Descending") that flips the order. The keys and the order each starts in: name
  (A to Z), latest post (newest), hook rate, engagement on Reels, reach, engaged accounts,
  Instagram followers, TikTok followers and match (highest), tier (Mega first), concept (concept
  order), persona (A to Z), product (saved order), decision (Priority Yes, Yes, Maybe, No,
  Unreviewed), and for the agency expected cost and cost per 1K reach (lowest). A creator with no
  value for the key sorts last either way. The pool opens sorted by match.
- **View**, a Tabs list, Table and Cards, from 640px, opening on Table. Under 640px the pool is
  Cards only and the list doesn't render; a view kept as Table still opens there as Cards.
- **Start review**, a default Button size sm, which opens the creator viewer (**The creator
  viewer**).
- **Copy decisions** (below), an outline Button size sm.
- The count line in `text-xs text-muted-foreground`: "{n} of {m} creators in the pool · Round 1:
  {a} approved · Round 2: {b} approved, {r} returning", with a ghost Button "Clear filters" while
  any filter or search is set. Nothing matches: "No creators match." with "Clear filters".

The client's toolbar is built from what the client reads, so it never offers a sort, filter or
search on an agency only field: no expected cost, cost per 1K reach, Waiting on or Aspire notes.
Filters, search and sort are kept in memory while the page is open, never in page data or browser
storage. The view is kept in the browser (**1e**, **Where things are kept**).

#### Table

From 640px. One table of the pool as the toolbar leaves it, with the Table classes, inside
`overflow-auto max-h-[70vh]`. The header row is pinned (`sticky top-0 z-10 bg-card`), the
Creator column pinned at the start (`sticky left-0 z-10 bg-card`) and the Decision column at the
end (`sticky right-0 z-10 bg-card`), their header cells `z-20`, so a creator and their decision
stay in view while the columns between them scroll. Each row is anchored
`#selection/r{n}/{net}-{handle}`.

| Column | Shows | Sorts by |
| ------ | ----- | -------- |
| Creator | Avatar, handle, name, tier Badge (outline), socials (Instagram and TikTok icons with followers, each a link to the profile), city, status Badge, and the round chips | Name |
| Campaign match | The Score ring with the match score, a button "Why {score}?" that opens its reasons, the band Badge, the competitor lines, or "Not scored yet" for a creator Claude hasn't scored (**The match score**), then the paid signals in `text-xs text-muted-foreground`: hook rate, engagement on Reels, reach and engaged accounts, and "Scored without hook rate, which TikTok doesn't report" on a TikTok creator | Match |
| Concept | The concept chip, the persona under it, and the product; for the agency, the Concept and Persona Selects (**The match score**, **Concept and persona**) | Concept |
| Latest posts | Up to three thumbnails, the evidence posts first, each a button with the play glyph on video and the **Hook post** and **Paid partnership** marks (**The creator viewer**, **Posts**), then "Latest post {date}" | Latest post |
| Notes | Why we picked them, the newest note with "{n} notes" and "Add note" (**The creator viewer**, **What the list shows of notes**), and for the agency, under a dashed rule headed "Agency only": the newest Aspire note, the recommendation, expected cost and cost per 1K reach | None |
| Decision | **Deciding** below | Decision |

A column header that sorts is a `button` in the head cell: a click sorts by it in its starting
order and a second click flips it, the head cell carries `aria-sort`, and the sorted column shows
the Lucide `arrow-up` or `arrow-down` beside its label. The **Sort** Select follows the headers
and the headers follow the Select. A thumbnail opens the creator viewer at that post, the handle at the
creator's first post, and the Notes cell at **Notes** (**The creator viewer**).

#### Cards

The creator card from `creator-card.md`, page profile, one per creator, in `grid grid-cols-1
gap-4 sm:grid-cols-2 lg:grid-cols-3`, anchored `#selection/r{n}/{net}-{handle}`. Flow chips: the
concept, filled with the theme's chart series in concept order, then the tier, the status labels,
the band, a "Competitor conflict" or "Past competitor deal" Badge when there is one, the round
chips, then "Near category" when it applies. The fit ring shows the match score and opens its
reasons (**The match score**); a creator with none shows no ring and a "Not scored yet" note, as
discovery's own page does.
Thumbnails show the evidence posts first, with the **Hook post** and **Paid partnership** marks
and the play glyph on video, embedded as **The creator viewer**, **How the media reaches the
viewer**, says; a thumbnail opens the viewer at that post and the handle at the first post. The `{DETAILS}` block: Hook
rate (watched past 3s), Engagement on Reels, Reach, Engaged accounts, Paid work before, Ad
permissions, Status, Product, City, Instagram and TikTok followers, Why we picked them, any
question for the client, and the newest note with "{n} notes" and "Add note". For the agency only, under a dashed rule headed
"Agency only": the recommendation, the newest Aspire note, expected cost and cost per 1K reach, vetting
evidence and safety detail, email, phone and manager, and the reply window. Deciding sits at the
foot of the card.

#### Deciding

- **The control**, for the client: a `role="group"` labelled "Your decision for round {n}" of four
  Buttons, size sm: Priority Yes (Lucide `star`), Yes (`check`), Maybe (`circle-help`) and No
  (`x`). The chosen one is `secondary` with `aria-pressed="true"`, the others `outline` with
  `aria-pressed="false"`. The Buttons show the viewer's own call, and a call older than the
  round's newest **Reset decisions** counts as none, so the next tap writes its value; beside the group sits the
  row's call (**What the row shows**) as a Badge in its **Status pills** variant, or a soft
  "Unreviewed" Badge when there is none. One tap saves. **Clicking the chosen value again clears
  it**: it takes back the viewer's own call, never another approver's. The icons keep Priority Yes apart from Yes without
  color.
- **One at a time.** **Start review** opens the creator viewer on the first Unreviewed creator,
  one creator at a time with their posts and profile (**The creator viewer**). In the list, after a
  save, a ghost Button "Next unreviewed" under the control scrolls to
  the next Unreviewed creator in the current sort and moves focus to their control. As extras
  (**Responsive**, **Keyboard shortcuts**), for the client only, never for the agency or in
  **Preview as client**: with a creator's row or card focused, `1` to `4` pick the four values in
  order and `n` moves to the next unreviewed creator.
- **A reason on the call.** Every Priority Yes, Yes and No offers "What made the call?" with
  one tap reasons: Performance, Brief fit, Paid history, Price, Reach, and Other with a short
  text field. A reason is never required; skipping it leaves the decision as it is. Maybe opens
  an optional note in the same place. The page never holds the agency's recommendation where the
  client reads, so the offer is the same on every creator. A decision that goes against the
  recommendation (Priority Yes or Yes on a creator recommended Reject, or No on one recommended
  Approve) is marked "Against the recommendation" by **Pulling decisions** from the agency's
  data, and the picker names its reason, or "no reason given".
- **A surprise asks why.** A call that goes against the match score the decider saw asks one
  question in place of "What made the call?", and its answer stands as the call's reason wherever
  a reason is read (the pull's "Against the recommendation" line, `clientReason` and
  `rejectReason`, and Export's What made the call), so a surprise is never recorded with an empty
  reason when the client gave one:
  - **No on a score of 75 or more** (a Strong match; a Competitor conflict is halved, so it never
    reaches 75) asks "Why pass?": Not our look, Too
    expensive, Wrong audience, Content quality, Already worked with them, and Other with a short
    text field.
  - **Priority Yes or Yes on a score under 60** (Possible or Weak, or a Competitor conflict under
    60) asks "What made them a yes?": Love their content, Right look for the brand, Great price,
    Know them already, Fits the audience, and Other with a short text field.

  Maybe never asks, and neither does a creator with no score ("Not scored yet"). The score that
  triggers it is the client's own match score, the one on the creator's ring when they tapped,
  which is the `score` the call saves. That score has no price in it (**The match score**, **Two
  sides, one number each**), and the client already reads it, so the question tells them nothing
  they can't see: it fires on a number on their screen, never on the agency's score, the
  recommendation, the expected cost or anything else in `agency`. "Too expensive" and "Great
  price" are the client's own words about the creator, not a price: they are saved as the label
  the client picked and are never compared with, or shown beside, an expected cost on any view the
  client reads.

  It is a prompt, not a gate, and the decider can change it later: the row's and the card's call
  line shows the surprise reason with a link Button "Change", which opens the prompt again with
  one more Button, "Remove reason". Removing writes `surprise` with `reason` `null` and a new `at`,
  so the pull clears it in Atlas too. It opens where "What made the call?" would: a `role="group"`
  labelled with its question, in a Card under the control (`rounded-xl border bg-card p-4`), the
  question in `text-sm font-medium`, then one outline Button size sm per reason, and a ghost icon
  Button with the Lucide `x` icon labelled "No reason", as the viewer's reason line has. One tap on a reason saves it; Other opens an
  Input (up to 140 characters) with a Button "Save". Closing it, deciding on another creator,
  leaving the page or doing nothing leaves the call saved as it is, with no reason, and the
  prompt doesn't open again on its own for that call. In the creator viewer it is carried to the next creator
  as one line, as "What made the call?" is (**The creator viewer**, **Deciding in the viewer**).
  A call changed again drops its surprise reason, and asks again only when the new call is a
  surprise too.
- **What a call saves.** `{approval, at, by, byName, score, band, reason, surprise}`: the value (`null` once
  cleared), the time, the decider's id and name, a snapshot of the match score the decider saw and its band (`null` when the creator had none),
  the reason, and the surprise reason when one was picked: `{kind, reason, text, at}`, `kind`
  `pass` or `pick`, `reason` the label's id (`not-our-look`, `too-expensive`, `wrong-audience`,
  `content-quality`, `worked-before`, `love-content`, `right-look`, `great-price`, `know-them`,
  `fits-audience`, `other`), `text` the Other text, and `at` when it was picked. The decider is the
  path's id and `byName`, as for the call. A surprise reason picked after the call rewrites the
  whole document with the call's own `approval`, `at` and `score` unchanged. It goes under the decider's own id (**1e**, **What the page keeps**, Creator
  decisions), so the record of who decided is the path, not what the page wrote. The page first
  adds the call's id to the client's private `data/users/{id}/decisions`, then writes the call,
  then its writer document's `lastAt`. The field shows
  "Saving", "Saved" and "Not saved" as **Editing in place** does, and the call logs one `decision`
  entry (**1e**, **The activity log**). A surprise reason logs one more: "Why pass on @{handle}:
  Too expensive".
- **What the row shows** is the newest call for the creator and round across the client's
  writers that isn't cleared, skipping any made before the round's newest **Reset decisions**,
  any from an account on Aspire's side (an `editors/{id}` marker, or `sides` `editors`) and any
  from an account the CM refused (`sides` `refused`), with "{name}, {time}" under it (**1e**,
  **Creator decisions: what holds and what doesn't**). With every call cleared, the row is
  Unreviewed, unless the call recorded in Atlas (the roster's `slate`, published into the page
  itself) says otherwise: with no counted call on the page newer than the recorded one, the row
  shows the recorded call with "Recorded by Aspire {time}", which covers a call the CM recorded
  from the chat. A recorded call older than the round's newest **Reset decisions** is hidden the
  same way, so a reset shows every row Unreviewed until someone decides again. The Summary, the filters, Copy decisions and Home's lists count the same calls. A
  skipped call shows to the agency only, as a line with a warning Badge "Not counted". A counted
  call from an account not in `sides` `deciders` or `approvers` carries, for the agency only, a
  processing Badge "Aspire to confirm" until the CM confirms it. When another approver's newest call differs, one line names it:
  "{name} said Maybe {time}". The agency sees all of this as labels, never the Buttons, and so
  does **Preview as client**. A client's call reaches every open view within seconds on the live
  stream, and the Summary's counts, the meter and the hook rate tile move with it (**1e**, **Live
  updates**).
- Status and Ad permissions are Selects for the agency and labels for the client. A TikTok
  creator's hook rate shows "n/a (not on TikTok)".

#### The creator viewer

One creator at a time, full screen, over Creator Selection: their posts to watch, their whole
profile, their notes and the decision, so a person can go through the pool without going back to
the list. It is not a section and never collapses. Both sides open it; what each reads and
writes in it follows **Who sees what** and **What the client can write**, as on the row and card.

**Opening it.**

- **Start review**, a default Button size sm with the Lucide `play` icon, first in the toolbar's
  last row, before **Copy decisions**. It opens the viewer on the first creator in the pool, as
  the toolbar leaves it, whose row reads Unreviewed (**Deciding**, **What the row shows**). With
  none left it reads "Review again" and opens on the first creator. With no creator in view it is
  disabled, with "No creators match." beside it.
- A thumbnail on a row or card opens the viewer at that post; the handle opens it at the
  creator's first post. The notes on a row or card open it at **Notes**.
- **Which creators it steps through.** The creators the pool showed when it opened, in that
  order, held while the viewer is open, so a decision that moves a creator out of a filter never
  reshuffles it. A creator who joins the pool live goes at the end. The top bar shows "{i} of {n}"
  and "{u} unreviewed".
- **Hash links.** `#selection/r{n}/{net}-{handle}/view` opens the viewer on that creator at their
  first post, `#selection/r{n}/{net}-{handle}/view/{post}` at one post (`{post}` being the post's
  Atlas id), `#selection/r{n}/{net}-{handle}/notes` at **Notes**, and
  `#selection/r{n}/{net}-{handle}/notes/{note}` at one note, open and in view (`{note}` being the
  note's own id, the `{id}` in its `note-{id}` key, or `notes` for a note kept by a page from before). A link opened from
  outside steps through the pool as the toolbar leaves it. Opening the viewer adds one entry to
  the browser's history; moving between creators and posts replaces it, so Back closes the viewer.
- **Closing.** The top bar's ghost icon Button with the Lucide `x` icon, labelled "Close viewer",
  Escape, or Back. Close and Escape go back through the history entry the viewer added, so a later
  Back never reopens it; a viewer opened from an outside link added none, so they replace its hash
  with the tab's. The list is where it was, scrolled to the last creator viewed, with focus on
  their row or card.

**Layout.** Built from the Viewer classes in **Component classes**: full screen at every width,
`role="dialog"` with `aria-modal="true"` and `aria-label` "Creator viewer: @{handle}", the page
under it not scrolling, focus kept inside while it is open and returned on close.

- **Top bar**, at every width: Close, the creator's Avatar, handle and name (`min-w-0`,
  truncated), "{i} of {n} · {u} unreviewed" in `text-xs text-muted-foreground`, then ghost icon
  Buttons "Previous creator" (Lucide `chevron-up`) and "Next creator" (`chevron-down`), and from
  1024px a ghost icon Button "Keyboard shortcuts" (Lucide `keyboard`).
- **From 768px**: two columns. The post strip on the left and the side panel on the right, 360px
  wide from 768px and 420px from 1024px, each scrolling on its own.
- **Under 768px**: the post fills the screen, one at a time. Swiping left or right moves between
  posts, and swiping up or down between creators, on the post only, never inside the bottom
  sheet. Every swipe has a Button that does the same: the post arrows over the media and the
  creator arrows in the top bar. The side panel is a bottom sheet over the lower part of the
  screen. It opens peeked, holding only its handle, one row with the score ring, the band and the
  concept chip, the four decision Buttons and Skip, so a creator can be decided without opening it.
  Its handle is a `button`, "Show profile" or "Hide profile" with `aria-expanded`, that opens it to
  85% of the screen's height, where its body scrolls, and closes it again; dragging the handle does
  the same. Opening the viewer at **Notes**, or with "Add note", opens the sheet. The media is
  capped at the screen's height less the top bar and the peeked sheet, so the sheet never covers
  it; the post's line and the row of posts under it scroll up from behind the sheet.
- **Layering.** The bottom sheet sits above the post strip inside the viewer. A Dialog, a Select's
  list, a tooltip or the tag list opened from the viewer is added after it in the page, so it opens
  above the sheet.
- **Touch.** Every control keeps its 44px tap area under 640px and on touch screens (**Tokens**),
  the post and creator arrows included.

**Deciding in the viewer.** At the top of the side panel, held in view while the panel scrolls
from 768px, and in the peeked sheet under 768px.

- **The control** is **Deciding**'s, with nothing changed: "Your decision for round {n}", the
  four Buttons for the client, the row's call as a Badge beside them, a second tap on the chosen
  value clearing the viewer's own call, the same save, the same `decisions/{id}` write, the same
  activity entry and the same "Saving", "Saved" and "Not saved". The agency, **Preview as client**
  and a read only client see the call as labels, as on the row. With no open round it is the label
  "Decisions open when round {n+1} starts". For the agency, the Status and Ad permissions Selects
  and the Concept and Persona Selects sit under it, as on the row; under 768px they are in the open
  sheet, not the peek.
- **Auto advance**, a Switch with its visible label, for the client only, on at first. It sits
  with **Next** on the decision block's second row, which under 768px shows only in the open sheet. Each
  person's choice is kept in their own `data/users/{id}/viewer` (**1e**). On, a confirmed save of
  any of the four values moves to the next creator in the viewer who reads Unreviewed, half a
  second after "Saved" shows. A clear never moves on. Off, the viewer stays on the creator.
- **The reason.** **Deciding**'s "What made the call?" offer opens under the control after a
  Priority Yes, Yes or No, and the optional note after a Maybe. With Auto advance on, the offer
  moves to the next creator as one line, "Add a reason for @{handle}" (after a Maybe, "Add a note
  for @{handle}" with its text field), with the one tap reasons and a ghost icon Button with the
  Lucide `x` icon, labelled "No reason". From 768px the line sits at the top of the side panel;
  under 768px it sits over the foot of the post strip, just above the sheet, so the peek keeps its
  size. Picking one saves it to that earlier call as **Deciding** says; the line goes when a reason
  is picked, when it is closed, or when the next decision is made. A surprise (**Deciding**, **A
  surprise asks why**) carries the same way, as "Why pass on @{handle}?" or "What made @{handle} a
  yes?" with its six reasons and the "No reason" Button, and never holds back Auto advance.
- **Skip** (outline Button size sm) moves to the next creator in the viewer who reads Unreviewed,
  leaving this one as it is; a skipped creator comes round again after the last. **Next** (ghost
  Button size sm, Lucide `chevron-right`) moves to the next creator in order, decided or not.
  The agency gets Next only.
- **The end.** When a save leaves no creator in the viewer reading Unreviewed, the client's panel
  shows "You've decided all {n} creators in this view." with "Back to the list" (default) and
  "Review from the start" (outline). When every creator still Unreviewed has been skipped since it
  last came round, Skip shows the same panel with "{u} still unreviewed" in place of the first
  line, so skipping never loops. The agency's Next is disabled on the last creator.
- **Live.** Another approver's call, an edit and a note made elsewhere show in the open viewer as
  they arrive (**1e**, **Live updates**), and the counts in the top bar move with them.

**Keyboard shortcuts.** From 1024px, with a fine pointer, as extras only: every one has a
visible control above. None works while focus is in a text field, a Select or the tag list, or
while a Dialog is open.

| Key | Does | Visible control |
| --- | ---- | --------------- |
| Left, Right | Previous post, next post | The post arrows |
| J, K | Next creator, previous creator | The creator arrows |
| 1 to 4 | Priority Yes, Yes, Maybe, No, for the client only | The decision Buttons |
| N | Moves focus to the note box: the client's, or for the agency the Aspire notes box | The note box |
| Space | Plays or pauses the post's video, when focus is not on a control | The player's own control |
| M | Turns the sound on or off | The player's own control |
| Escape | Closes the viewer | Close |

The **Keyboard shortcuts** Button opens a Dialog with this table in plain words. In the list
(**Deciding**, **One at a time**), `n` still moves to the next unreviewed creator; in the viewer,
N is the note.

**Posts.** The post strip shows the current post large, the post's line under it, and a row of
the creator's posts to pick from, the current one marked with `aria-current="true"`.

- **Which posts.** The posts the page embeds for the creator, the same ones the Table and card
  show (the evidence posts first, then the most recent, with the **Hook post** among them on
  Instagram), then up to nine more of their posts from the last 90 days in Atlas, newest first, as
  link tiles with no image: the network icon, the format, the date and the views. Each
  creator's posts are worked out at publish from the posts read for the card (`creator-card.md`,
  **Data: what fills each section**), adding `text` (the caption) to the fields read. A creator
  not sent yet shows the posts and profile kept for them in `agency/pool-{net}-{handle}`, one
  document each (**1e**), never in the one `agency/pool` document, which holds only their row.
- **The media**, in a box that keeps the post's shape, centred on `bg-muted`, capped in height
  on the image or video itself (the Viewer classes' media cap), never larger than
  its embedded size (`creator-card.md`, **Images**, **Placing it**):
  - **A video with a stored copy**: a `video` element with `controls`, `playsinline`,
    `preload="metadata"` and the post's image as `poster`, from the page's asset store at
    `/_blob/{asset}`. It plays when the person presses play or Space, never on its own. Moving to
    another post or creator pauses it. Sound follows M across posts and creators for the visit,
    on at first, kept in memory only.
  - **A video with no stored copy**: the post's image with the play glyph, and under it an outline
    Button with the Lucide `external-link` icon, "Play on Instagram" or "Play on TikTok", a link to
    the post's permalink that opens in a new tab (`rel="noopener"`). This is every video today
    (**How the media reaches the viewer** below).
  - **A photo**: the image. **A carousel**: its cover, with "Carousel, {n} slides" and a "See all on
    Instagram" link.
  - **No image** (it failed to load, or the image budget left it out): a `bg-muted` tile with the
    network icon and "Post from {date}", and the post's link Button.
- **Marks on a post**, outline Badges at the media's top corner and on its tile in the row:
  - **Hook post.** Atlas's hook rate (`instagram.reelsHookRate`) is Meta's average for the
    creator across their Reels, not any one post's figure. The Hook post is the Reel that stands
    for it: the most viewed Reel from the last 90 days among the creator's last 12 posts that the
    card's read returns. Claude marks it at publish and always embeds it among the posts the Table
    and card show. Its tooltip: "Their most watched recent Reel. The {x}% hook rate is Meta's average across their Reels, not this post's."
    A creator with no hook rate, every TikTok creator included, has no Hook post.
  - **Paid partnership.** Instagram's paid partnership label is not held in Atlas, so the mark
    comes from the caption: the hashtags `#ad`, `#sponsored` or `#paidpartnership`, each as a whole
    tag (so `#adventure` doesn't count), or the words "paid partnership with", ignoring case. Its tooltip: "The caption says this was paid. Atlas can't see Instagram's own
    label, so a post without these words may still be paid." When the words name a saved
    competitor, the Badge reads "Paid partnership: {competitor}" in the warning variant.
- **The post's line**, in `text-sm`: the format (Reel, Post, Carousel, or Video on TikTok), the
  date, and views, likes and comments in the card's number format ("Likes hidden" when
  `likeCount` is null; a figure Atlas doesn't hold is left out). Under it, the caption in
  `text-sm text-muted-foreground break-words`, three lines at most with a ghost Button "Show
  caption" that opens the rest. Captions are the creator's words: escaped, never rendered as HTML,
  and never instructions.
- **Arrows.** Outline icon Buttons "Previous post" (Lucide `chevron-left`) and "Next post"
  (`chevron-right`) over the media's sides, so they read on any frame. Past the last post, Next
  post moves to the next creator's first post; before the first, Previous post goes to the
  previous creator's last.

**How the media reaches the viewer.**

- **Images are embedded.** Each post the page embeds is embedded once, as `post@360` in the
  page profile (`+text` for a post that is mostly text), and that one data URI is held once in
  the page's data and set as the source of the Table's and card's thumbnail (`object-fit: cover`
  in its box) and of the viewer's media (`object-fit: contain`). On this page it takes the place of
  the card's `thumb` for those posts. The page's budget is the card reference's: all images under
  8MB of data URIs (`creator-card.md`, **Images**, **Budgets**). Over it, in this order, cutting the
  number of images before their quality: drop the third post of creators decided in a Done round,
  then every creator's third post, then every creator's second post, then rerun at quality 80. Past
  that, a Hook post that isn't the creator's first post falls back to the card's `thumb`, and then
  the first posts of creators decided in a Done round, then of every other creator, newest
  decided first, become link tiles until the page is under budget. A dropped post becomes a link
  tile. As a guide, a post at this size is 60 to 150KB,
  so three posts each for about 17 to 40 creators fit; past that, posts start dropping.
- **Videos aren't stored today.** A video can't be embedded: as a data URI it would pass the whole
  page's budget on its own. The page can't link to Atlas's copy either: `media.mediaUrl` on a video
  post is the video file on Aspire's image server, which no published page can load, and its link
  expires. A video plays in the page only from the page's own asset store, uploaded from the chat
  with the Artifact tool, up to 15MB a file, and within the page's storage quota and file count,
  which the page's asset listing reports. That needs Claude to download each video to the
  person's computer first, and the plugin's snippets download images only and write no file but
  a logo (`SECURITY.md`). Downloading videos is a change to what the plugin does on the person's
  computer, so it needs a deliberate decision recorded there first. Until then Claude stores no
  video, and every video shows its image with "Play on Instagram" or "Play on TikTok".
- **If storing videos is turned on**, the viewer plays them with no other change: a post's `video`
  is the asset's id, in the page itself for a creator sent to the client and in `agency/pool-{net}-{handle}` for
  one not sent yet, and Claude keeps a list of what it uploaded in `agency/media` so a republish
  never uploads one twice. The size to plan for: three videos for each of 40 creators, at 3 to
  10MB a video, is about 360MB to 1.2GB. Uploads would go in order of the creators still
  Unreviewed in the open round, by match, and stop before the quota the listing reports, with the
  rest on "Play on Instagram". Unattended runs would upload nothing.

**Profile**, in the side panel under **Deciding in the viewer**, top to bottom:

1. **Match.** The Score ring and band Badge with the competitor lines, and a Collapsible "Why
   {score}?", closed at first, holding the score's reasons exactly as the Dialog does (**The match
   score**, **How it shows**). Each side reads its own stored score; a creator with none shows "Not
   scored yet".
2. **Concept and persona**: the concept chip and the persona, labels for the client, the Selects
   for the agency (**The match score**, **Concept and persona**).
3. **The creator card**, page profile, from `creator-card.md`, at the panel's width, with the
   Cards view's flow chips and `{DETAILS}`. Its thumbnails are left out, because the post strip
   shows the same posts. The card takes the theme override in `theme.md`, **The CAS campaign
   page**.
4. **About**, the parts the card doesn't show in full, each left out when Atlas holds nothing for
   it:
   - **Bio**: `instagram.biography`, or `tiktok.bioDescription`, as plain text.
   - **Category**: `instagram.category`, as a chip.
   - **Verified**: "Verified" when the creator's `verified` is true. Atlas holds it per creator,
     not per network, so the viewer never names a network for it.
   - **Badges**: every one in `instagram.badges`, in words, as outline Badges, not only the
     card's two.
5. **Audience**, per network, labelled with the network and with what it counts (engaged accounts
   or followers): the gender split, the age bands (up to five), the top countries (up to four) and
   the top cities (up to four), from the creator's demographics fields the way
   `creator-profile.md`, **Profile & audience: audience panel**, reads them, at publish. A column
   whose breakdown has no results is left out; with none: "Atlas holds no audience breakdown for
   @{handle}." Shares are text with a bar beside each, so none reads by its bar alone.
6. **Rates and terms**, for the agency only, under a dashed rule headed "Agency only", read from
   `agency/creator-{net}-{handle}`: expected cost and where it came from, cost per 1K reach, the
   rate per deliverable (from the round in view's `agency/creator-{net}-{handle}-r{round}`, else
   the old keys on `agency/creator-{net}-{handle}`), the offer (open, target, max), counters, the agreed fee, what they make,
   usage and exclusivity, the reply window, last contact, email, phone and manager. Read only
   here, with a link Button "Edit in Contract and rates" for a creator on Selected Creators. The
   client never gets this part, in the page itself or in what they can read; they see their
   agreed fees on Selected Creators once the fees are sent.
7. **Notes** (below).

**Notes.** Two threads, anchored `/notes`. Each note is its own entry, with who wrote it and
when, so the thread is its history.

- **Notes**, which both sides read: the client's notes on the creator for the round, and
  Aspire's notes for {brand}, together, newest first. Description: "{brand} and Aspire both see
  these." The client writes theirs to `client/creator-{net}-{handle}-r{round}` and the agency
  theirs to `edits/creator-{net}-{handle}-r{round}`, one `note-{id}` key each (**1e**). Each note
  shows the writer's Avatar, name and side ("{brand}" or "Aspire", from where it is kept, never from
  the note), the time, its text with any tags, and "Edited {time}" once changed. The box under the
  thread is a Textarea, "Add a note for Aspire" for the client and "Add a note for {brand}" for the
  agency, with the tag picker (**Tagging**) and a default Button size sm "Add note". On **All
  rounds** the thread is the open round's, and earlier rounds' notes for the creator sit under a
  Collapsible "Earlier rounds", read only.
- **A creator not sent yet** has no Notes thread and no box for it: anything written there would
  sit in `edits`, which the client reads, and name a creator they were never sent. The agency sees
  only the Aspire notes, with the line "Send @{handle} to {brand} to write a note they'll see."
- **Aspire notes**, for the agency only, under a dashed rule headed "Agency only": the agency's
  notes on the creator, every round, newest first, with each note's round as a soft Badge.
  Description: "Only Aspire sees these." Kept in `agency/creator-{net}-{handle}` as `note-{id}`
  keys. Its box is "Add a note for Aspire" and lists only "Aspire" and the people at Aspire to tag,
  as **Tagging** says for agency only boxes. Never rendered for the client or in **Preview as
  client**.
- **Editing.** A note's writer gets two ghost Buttons on it, Edit and Remove. Edit turns it into
  the Textarea with Save and Cancel; saving writes the same `note-{id}` with the new text, keeping its `kind` when it has one
  (a status update, **Selected Creators**, **Status updates**), and logs
  a `note` entry with the old and new text. Remove asks in a Dialog, "Remove this note?", then
  writes the note's stamp with `value` `{text: null, createdAt}`, plus its `kind` when it has one, keeping when it was first written, and the thread shows "{name} removed a note
  {time}" in its place. Every tag whose `on` is that note gets `withdrawn: true` and its `text`
  emptied, as a deleted comment's do, so no inbox opens a removed note and the chat never posts its
  words. Nobody else gets either Button. The rules can't stop another person on the
  same side writing a note, so this is the page's rule (**1e**, **Creator decisions: what holds
  and what doesn't**, **Notes stay shared**).
- **History.** An edited or removed note has a ghost Button "Show history" that opens, under it,
  each earlier version from the activity log, newest first: who, when, and the text as it was
  ("First 200 characters" when the log cut it). The page reads the log back to the note's
  `createdAt`, 14 days at a time as **History** does. **History** itself lists every note entry
  too, and its search finds them by the creator's handle.
- **Saving** works as **Editing in place** does, with "Saving", "Saved" and "Not saved". A note
  and its tags save as **Tagging** says. Notes are never pulled into Atlas.
- **Read only.** **Preview as client** and a done round show the threads as text with no box or
  Buttons. A read only client reads no page data: "Notes aren't available from this account."

**What the list shows of notes.** The Table's Notes cell and the card's `{DETAILS}` show the
newest note in the Notes thread, cut to two lines, with "{n} notes"; for the agency, under its
"Agency only" rule, the newest Aspire note the same way. Each opens the viewer at **Notes**, and a
ghost Button "Add note" opens it with the box in focus. Search covers every note the viewer can
read. **Copy decisions** and **Export** put the client's notes in their client notes column ("Client
notes", "Your notes"), Aspire's notes for {brand} in "Aspire notes for {brand}", and for the agency
the Aspire notes in "Aspire notes", each note as "{name}, {date}: {text}", newest first, one per
line.

**Where the viewer's fields come from.** Read by Claude at publish, with the card's pulls
(`creator-card.md`, **Data: what fills each section**) widened as below, and written into the page
itself for a creator sent to the client, or `agency/pool-{net}-{handle}` for one not sent yet. Every field path is
checked against the live census (`list_creator_search_fields`, `list_post_search_fields`) first; one
the census doesn't list leaves its part out, never guessed.

| In the viewer | From |
| ------------- | ---- |
| Bio | `instagram.biography`, `tiktok.bioDescription` |
| Category | `instagram.category`, as discovery reads it in creator-ads mode |
| Verified | The creator's `verified`, one value per creator, which the card's `search_creators` call already projects |
| Badges | `instagram.badges` |
| Audience | The demographics fields `creator-profile.md` reads (`instagram.creatorEngagedAccountsBreakdowns`, `instagram.audienceDemographics`, `instagram.followerDemographics`; `tiktok.audienceGenders`, `tiktok.audienceAges` and the TikTok location breakdown), pulled without the card's `exclude` for each creator the page shows. Countries and cities are each a column only when the breakdown holds that kind of location. Atlas often holds countries alone: then the cities column is left out with "No city breakdown in Atlas", and the viewer never shows the creator's own City (**Where each field comes from**) as an audience figure |
| Posts: media, format, date, figures, permalink | `search_posts` per creator, as for the card: `media`, `instagram.mediaProductType`, `postedAt`, `viewCount`, `likeCount`, `commentCount`, `instagram.permalink` or `url` |
| Captions | `text` on the same posts |
| Link tiles (up to nine more posts in 90 days) | The same call, which reads the creator's last 12 posts per channel; the posts it returns past the embedded ones, from the last 90 days |
| Hook post | The Reels (`instagram.mediaProductType` REELS) from the last 90 days among that call's last 12 posts, by `viewCount`; none with views, no Hook post |
| Paid partnership | The caption words above, on the same posts, and the brand's saved `competitor` records |
| Rates and terms | `agency/creator-{net}-{handle}` (**1e**) |

**Who reads what in the viewer.** Everything in it comes from the page itself and the page data
the viewer can read, as on the row and card: the posts, profile, audience and the client's score
are in the page itself for a creator sent to the client; the rates and terms, the Aspire notes,
the agency's score and a creator not sent yet are agency data, which the client can't read. The
viewer adds no data of its own beyond the notes above and each person's Auto advance choice.

#### Copy decisions

Copies every creator the pool shows now, with the round, filters, search and sort applied, as a
table: Decision ("Unreviewed" when there is none), Name, Handle, Product, Client notes, Aspire notes
for {brand}, and for the agency Aspire notes and Expected cost. It works like **History**'s **Copy as table**: an HTML table and tab
separated text on the clipboard, the tab separated text with the CSV's `'` guard on typed text,
"Copied {n} rows" on the Button for two seconds, and a Dialog "Copy decisions" with the text
selected in a read only Textarea when the browser refuses the clipboard. **Preview as client** and
the client copy without Aspire notes and Expected cost. A read only client copies the page as published, with the
calls recorded at the last publish. Copying writes nothing and logs nothing.

#### Tiers

From the larger of the creator's Instagram and TikTok followers: **Nano** under 10K, **Micro**
10K to under 50K, **Mid** 50K to under 500K, **Macro** 500K to under 2M, **Mega** 2M and up. The
roster's `tier` field is where discovery found the creator, a different thing, and is never shown
as this tier. Worked out at publish
from the follower counts Atlas holds and shown to both sides. The reply window keeps its own
bands (`rates-and-terms.md`, **What each creator gets**), and other flows' tier words (a PPA
pitch's casting bands, an influencer program's outreach) are their own: this page shows only
these five.

#### Where each field comes from

What discovery and vetting write in creator-ads mode, and where it shows here. The page reads
these when Claude publishes; nothing on the page calls Atlas.

| On the page | Where it shows | From |
| ----------- | -------------- | ---- |
| Handle, network, avatar | Creator | Discovery's finding (`entityId`, `schema`) and the search hit's username; the picture from `instagram.profilePictureUrl`, embedded per `creator-card.md` |
| Name | Creator, search, sort | The search hit, or the agency's edit (`creators/{net}-{handle}`) |
| Instagram and TikTok followers | Creator, sort, tier | `followersCount` per network, read for the card |
| Tier | Creator, Tier filter, sort, search | Worked out from the followers (**Tiers**) |
| City | Creator, City filter, search | Not written by discovery or vetting: Atlas holds a `country`, unset on about half the index, and no city. Shows the agency's `location` edit, else the country, else "No city yet". **No city data yet** |
| Status, round chips | Creator | The `roster` findings per round, and the page's `edits` |
| Campaign match, band, factors, competitor lines | Campaign match, sort, the fit ring, the score's reasons | Stored per creator per round by Claude at publish (**The match score**), from the inputs that section lists |
| Hook rate | Campaign match, Hook rate tile, sort | `detail.adFigures`, from `instagram.reelsHookRate` |
| Engagement on Reels | Campaign match, sort | `instagram.reelsInteractionRate` |
| Reach | Campaign match, sort, cost per 1K reach | `instagram.creatorMarketplaceReach` |
| Engaged accounts | Campaign match, sort | `instagram.creatorEngagedAccounts`, which discovery writes in its ad figures |
| Paid work before, ad permissions | Card details | `instagram.pastBrandPartnershipPartners`; partnership readiness, then the roster's `adPermissions` |
| Concept, persona | Concept, Concept filter, sort, search | The agency's `concept` and `persona` edits, else the roster's `lane` and `persona`, else `detail.lane` and Claude's persona pick, named from the round's live Master Brief (**The match score**, **Concept and persona**) |
| Bio | The match score's Brief fit and competitor lines | `instagram.biography`, `tiktok.bioDescription` |
| Badges | The match score's Paid history and Content reach | `instagram.badges` |
| Product | Concept, Products chips, sort | The roster's `details.product` or the agency's `product` edit. Neither agent assigns one, so a creator shows "No product" until the agency sets it on the page or the CM does in the chat. **No product per creator until someone sets it** |
| Latest posts, latest post date | Latest posts, sort | Discovery's `evidence` permalinks and the posts read for the card (`search_posts` per creator) |
| Why we picked them | Notes | The CM's note at Gate 2, else vetting's reason in plain words |
| Recommendation, vetting evidence, safety detail | Notes, agency only | The vetting finding |
| Expected cost, cost per 1K reach | Notes, sort, Budget, agency only | `rates-and-terms.md`, **Expected cost**, and the reach above |

A TikTok creator's hook rate shows "n/a (not on TikTok)" and their match score carries
"Scored without hook rate, which TikTok doesn't report". Reach and engaged accounts, which Atlas
holds for Instagram only, show "Not in Atlas". All three sort last.

#### The match score

The Campaign match is a number out of 100 for a creator in a round: how well they fit the concept
they are cast on, from their paid signals, the round's Master Brief and the brand's saved records.

**Two sides, one number each.** The agency's score counts all five factors below. The client's
score is the same procedure with Budget vs target left out and the other four weights scaled up to
fill its place, because Budget vs target is worked out from the expected cost, which the client
must never be able to work out (**What the client sees** below). Each side sees one number for a
creator on every view of the campaign page: the Table, the card's fit ring, the score's reasons,
the creator viewer, the sort, **Export**, and the snapshot a decision saves. The agency's reasons
also name the client's number: "The client sees {n}, without price".

**Where it is computed.** Once, by the one procedure below. Claude runs it at each publish of the
campaign page for every creator in the pool and every round they are in that isn't Done, and
stores both results (**1e**, **What the page keeps**, Match scores): the client's in `scores` and
in the page itself, the agency's in `agency`. A Done round's scores stay as they were stored.
Every view reads the stored result and none works it out again; where the page itself and
`scores` differ, the newer `scoredAt` wins, as for every value.

Between publishes a score changes only when an Editor changes one of its inputs on the page, and
the Editor's page then runs the same procedure on the stored inputs, with no Atlas read and no new
judgement, for the creators the change touches. When the change moves a factor's values, it also
ranks that factor again across the ranked set (the whole pool for the agency, the creators sent
for the client) and re-scores every creator whose level or Watch line changed. It writes each
creator's `scores` document first, and only when the client's result changed, so an edit that
moves only price never touches what the client reads; then the agency's result, with
`clientScoredAt` set to the `scoredAt` of the `scores` document as it now stands. A page that
finds a creator's `clientScoredAt` different from their `scores` `scoredAt` (a write that stopped
half way) runs the re-score for that creator again from the stored inputs. The inputs the page can change:

- a creator's concept or persona, or their `location` (City), since a city match needs nothing
  but the location;
- a concept removed, deferred or brought back, which can leave a creator with "Needs a concept",
  or a concept added on the page: a creator moved to a concept the last publish didn't hold has
  no keyword matches or persona pick for it, so Brief fit is left out with "Scores update at the
  next publish" and the persona is the concept's first;
- a concept's target cities;
- a fee, offer or counter edited on the page, which changes that creator's expected cost
  (`rates-and-terms.md`, **Expected cost**);
- allowlisting or the allowlisting uplift in Home's **Program terms**, which changes every
  creator's expected cost from its stored basis;
- the budget total or the term dates on Home, which can change the target rate
  (`rates-and-terms.md`, **Target rate**), and with it every creator's Budget vs target;
- a weight (**Match score tuning**).

A casting keyword added or changed on the page needs a read of the creators' posts, which only
Claude does: until the next publish the score keeps the old Brief fit, and the concept's
**Casting** part shows "Scores update at the next publish" to the agency. The Editor's page reads
the weights, the creators' edits and `agency/scores-r{round}` again just before it writes, and
starts over when one of them changed since it began, so two Editors saving at once never leave a
mix of both. Only Editors and Claude write scores: `scores` sits under the page data's root rule,
which no Contributor can write (**1e**).

**Discovery's and vetting's pages.** Discovery and vetting run the same procedure in creator-ads
mode, with the agency's five factors (`creator-discovery.md`, **Creator-ads mode**;
`creator-vetting.md`, **Creator-ads lanes**). Their pages show the score as of their run, dated.
It matches the campaign page's when the inputs are the same. The inputs that can differ are named
on their pages: a fee, offer or counter recorded since the run, weights tuned on the page and not
yet pulled, a budget total, term dates, allowlisting, the uplift or casting edited on the page and
not yet pulled,
keywords derived because the lane has no `casting` saved yet, a city the agency
set on the page, a concept change, and, on discovery's page before
vetting screened the lane, the plain count of past paid partners. Their strong and weak signals
rank their own lane's pool.

**The formula.** Each input is turned into a value from 0 to 1 and held there (clamped); nothing is
rounded until the end. Factor values are weighted sums of their parts, and the full score is
100 × the weighted sum of the factors. The score shown is the full score rounded to a whole
number; with a competitor conflict it is half the full score, rounded. The weights are, per factor,
the newer of the page's stamp and the campaign's saved one (**Match score tuning**; `match` in
`campaign:{slug}-cas`, **1a**), else these defaults. Claude's publish and the Editor's page apply
the same rule:

| Factor | Default weight | Parts |
| ------ | -------------- | ----- |
| Performance | 0.30 | 0.6 × hook rate: (rate − 30%) ÷ 40%. 0.2 × engagement on Reels: (rate − 2%) ÷ 8%. 0.2 × engaged accounts: log10(accounts ÷ 1,000) ÷ 3, so 1,000 is 0 and 1,000,000 is 1 |
| Brief fit | 0.25 | Keyword share: the concept's casting keywords the creator matches ÷ the concept's keywords (up to 4). When the concept names target cities and the creator's city is known: 0.75 × the keyword share, plus 0.25 when the creator is in one of them |
| Paid history | 0.15 | 0.5 × past paid partners: log10(1 + partners) ÷ log10(11), so none is 0 and 10 or more is 1. 0.25 × a partnership ads or branded content badge (1 or 0). 0.25 × worked with the brand before (1 or 0) |
| Budget vs target | 0.15 | (1.5 − ratio) ÷ 0.7, where ratio is expected cost ÷ target rate, so 0.8 or under is 1 and 1.5 or over is 0. 0.5 when the creator is unpriced or there is no target rate. Agency only |
| Content reach | 0.15 | 0.8 × median views ÷ followers ÷ 0.5, so 50% or more is 1. 0.2 × the strong hooks badge (1 or 0) |

Weights that don't add up to 1 are scaled so they do; the client's four are scaled to 1 the same
way. The client's decision is never an input: a call, its reason, a note or a Priority Yes never
moves a score.

**What each input reads.**

- **Hook rate, engagement on Reels, engaged accounts**: `instagram.reelsHookRate`,
  `instagram.reelsInteractionRate` and `instagram.creatorEngagedAccounts`, as **Where each field
  comes from** reads them. On TikTok, engagement is `tiktok.engagementRate` on the same scale,
  labelled "Engagement (TikTok)".
- **Casting keywords and target cities**: the concept's **Casting** part for the round (**Master
  Brief**, **A concept**), seeded from and pulled back to `casting` in the lane's
  `campaign:{slug}-lane-{lane}` record (**1a**), which discovery and vetting read. A keyword matches when the creator's bio (`instagram.biography`,
  `tiktok.bioDescription`), or a caption, transcript or on screen text of one of their posts from
  the last 90 days in Atlas, says it or plainly means it. Claude judges each match and keeps where
  it found it, the bio or the post's link, so every match can be shown. At publish Claude judges
  every creator against every live concept in the round, so moving a creator to another concept
  re-scores them on the page with no new read.
- **The creator's city**: the agency's `location` edit only. Atlas holds no city.
- **The concept and persona**: **Concept and persona** below.
- **Past paid partners**: the names in `instagram.pastBrandPartnershipPartners`. When vetting
  screened the creator's lane, this part is vetting's paid track record read instead, taken from
  the vetting finding's `detail.match.paidPartners`, which weighs partners in or near the brand's category
  (`creator-vetting.md`, **Creator-ads lanes**): 1 for two or more in the category, 0.6 for one in
  it or two or more near it, 0.3 for partners outside it, 0 for none. So vetting's score and this
  one never disagree.
- **Badges**: `instagram.badges`. Atlas passes them as Meta names them, so a badge counts when its
  words name partnership ads or branded content, or strong hooks (`high_hook`).
- **Worked with the brand before**: the brand's name or handle in the past paid partners, a
  partnership marked post in Atlas that tags the brand's own handle, the brand's `partner` record
  for the creator, or an agreed fee for the creator in an earlier campaign of the brand's.
- **Expected cost**: `rates-and-terms.md`, **Expected cost**.
- **Target rate**: `rates-and-terms.md`, **Target rate**.
- **Median views**: the median `viewCount` of the creator's last 10 Reels, as the fee calculator
  reads it (`fees.md`, **Applying the rates**), over their Instagram followers; on TikTok,
  `tiktok.medianViews` over TikTok followers.
- **Competitors**: the brand's saved `competitor` records, with their handles, names and spelling
  variants.

Keywords, cities, the target rate and the competitors always come from the brief and the brand's
saved records. None of them is ever a list in this reference or in the page's code.

**When an input has no data.** A part with no data is left out, and the rest of its factor is
scaled up to fill its place. A factor with no part left is left out of the score, and the other
factors' weights are scaled up to fill its place. The score never counts a missing value as zero
and never guesses one, except that Budget vs target is 0.5 when unpriced, as the formula says. The
score's reasons name every input left out, under "Scored without". The inputs with no data today:

| Input | When it has no data | What the score does |
| ----- | ------------------- | ------------------- |
| Hook rate, engaged accounts | Every TikTok creator; an Instagram creator Meta hasn't ranked | Performance from the parts it has; "Scored without hook rate, which TikTok doesn't report" on TikTok |
| The creator's city | Every creator until the agency sets their location, since Atlas holds no city | Brief fit from the keywords alone; "City not known" when the concept names target cities |
| Casting keywords | A concept with no casting keywords for the round, none in its lane record, and none Claude could derive from its persona and casting filter | Brief fit is left out; "This concept has no casting keywords yet" |
| Past paid partners, badges | Every TikTok creator, and an Instagram creator Meta hasn't ranked | Paid history is left out, unless vetting's paid track record read holds for the creator, which then stands for the partners part; "Scored without past paid partners, which Atlas doesn't hold for them". Worked with the brand before still shows as a line, unscored, so one yes or no never stands for the whole factor |
| Median views | Fewer than 3 Reels with views in Atlas, or no TikTok median | Content reach from the badge alone, or left out when there is no badge data either |
| Expected cost, target rate | An unpriced creator, or a campaign with no target rate | Budget vs target is 0.5, and the agency's reasons say which is missing |

A creator Claude hasn't scored yet (new in the pool since the last publish) shows "Not scored yet"
with no ring, as on discovery's page, and sorts last.

**Recent posting.** A creator with posts in Atlas but none from the last 30 days is capped at 50 on
both sides, as discovery's rubric caps a dormant account, before any competitor halving, and the
Watch line says "No posts in the
last 30 days". A creator Atlas holds no posts for in the last 90 days isn't capped, since that is a
gap in Atlas, and "Scored without recent posts" says so.

**Competitors.**

- **Competitor conflict.** When the creator's bio names a saved competitor, the score is halved as
  the formula says, and the band reads "Competitor conflict" with "Bio names {competitor}".
- **Past competitor deal.** When the past paid partners, or a partnership marked post in Atlas,
  name a saved competitor, the score is unchanged and a line reads "Past competitor deal:
  {brand}", one per competitor, the newest first, up to two and then "and {n} more".

Both show to both sides, since the competitors are the brand's own. Vetting's competitor checks
still decide its recommendation (`creator-vetting.md`, **The recommendation**); these two lines
show what Atlas holds and change nothing else.

**Bands.** 75 and up **Strong**, 60 and up **Good**, 45 and up **Possible**, under 45 **Weak**. A
competitor conflict reads **Competitor conflict** whatever the number. Each side's band is from
its own score.

**Strong and weak signals.** For each factor, the creators with a value for it are ranked. The top
third is a strong signal and the bottom third a weak one, with ties kept together on the stronger
side. With fewer than 6 creators holding a value, nothing is marked, and the reasons say "Too few
creators to compare". The agency's levels rank the round's whole pool; the client's rank only the
creators sent to the client, so a level never says anything about a creator the client hasn't
seen. Claude ranks both at publish and stores each creator's levels. A concept change on the page
re-ranks Brief fit for the round; a weight change re-ranks nothing, since no factor value moves.
The **Watch:** line lists the creator's weak signals in plain words with their values, weakest
first: "Watch: hook rate 31%, in the bottom third of the pool; no past paid partners". With none,
there is no Watch line.

**How it shows.**

- **In the Table**, the Campaign match cell holds the Score ring with the number, the band Badge
  beside it, the competitor lines under it, then the paid signals as above. The ring and number
  are a button, "Why {score}?", that opens the score's reasons.
- **On the card**, the fit ring shows the score and is the same button. The band and a
  "Competitor conflict" or "Past competitor deal" Badge are flow chips after the concept.
- **The score's reasons** open in a Dialog titled "Why {score}?", and as a section of the creator
  viewer once it is built. Top to bottom:
  1. The Score ring, large, the band Badge, and the concept and persona it was scored for.
  2. The competitor lines, when there are any.
  3. One row per factor, in the formula's order: the factor's name, its value out of 100, the
     Factor bar, and a success Badge "Strong" or a warning Badge "Weak" on a strong or weak
     signal. Under it, its inputs in `text-xs text-muted-foreground`: "Hook rate 52% · Engagement
     on Reels 4.1% · Engaged accounts 38K", or "Matches 3 of 4 keywords: {keyword} (bio),
     {keyword} (post), {keyword} (post)", each post a link.
  4. The Watch line, then "Scored without" and the inputs left out.
  5. **About this data**, a Collapsible, closed at first.
- **About this data** says in plain words where each input comes from (Meta's creator figures
  through Aspire Atlas, the creator's posts in Atlas, the round's Master Brief and the brand's
  saved competitors, and for the agency the expected cost and the target rate); that the score is
  100 times the weighted sum of the factors, each from 0 to 1, and how each is worked out; for the
  agency only, the price factor and the weights in use, "default" or "tuned {date} from {n} client
  decisions"; that a missing
  input is left out, never guessed; how the bands and the strong and weak thirds are set; that the
  client's decisions never change a score; and when the score was last worked out.

**What the client sees.** Their score, its band, the ring, the competitor lines, and four factor
rows: Performance, Brief fit, Paid history and Content reach, each with its inputs, bar and level.
There is no Budget vs target row, no line saying price is counted, and no weight shown. Because the
client's score never contains price, nothing on it, inputs included, lets the client work out an
expected cost, a target rate, how a creator is priced or the Budget vs target weight, whatever the
weights. The four other weights are not secret in that sense: a client who fits their score
against the four factor values over enough creators can recover how the four are weighted
against each other, which tells them nothing about price. The Watch line and
"Scored without" never name price, expected cost or the target rate. `scores` holds only the
client's result, and its `cause` says "publish" or "updated by Aspire", never which input moved.

**Concept and persona.** Each creator is cast on one concept and one persona in each round, from
the round's live Master Brief: a concept in the round that isn't removed or deferred, and one of
that concept's personas. At publish, Claude takes the agency's `concept` edit for the round, else
the roster's `lane`, else discovery's `detail.lane`, skipping any that isn't live in the round.
With none left, the creator shows a warning Badge "Needs a concept" to the agency and Brief fit is
left out. The persona is the first of the agency's `persona` edit, the roster's `persona` and
Claude's pick that belongs to the chosen concept; one from another concept is skipped, the same
rule the page uses. Claude picks, at publish, for every live concept in the round, the concept persona whose
words the creator best matches in their bio and recent posts, else the concept's first persona,
and stores the picks in `agency/scores-r{round}` (`personas`), so a concept change on the page
takes Claude's pick for the new concept with no new judgement. Neither ever comes from a fixed list
or from the notes. For the agency, the Table's Concept cell and the card's concept chip hold two
Selects, Concept and Persona, from the round's brief; the client sees them as labels. A change
saves to `edits/creator-{net}-{handle}-r{round}` (**Editing in place**); a concept change also
writes the `persona` stamp with `value` `null`, so a persona of the old concept never stays, and
clears the creator's variant plan overrides after a Dialog when they have any (**Selected
Creators**, **Concept and variant plan**). It
re-scores the creator on the page as above, and is pulled into the roster as `lane` and `persona`,
the persona as its name in the round's brief; a `null` persona stamp is pulled as the persona the
page's own rule resolves to, the roster's when it belongs to the concept, else Claude's pick, else
the concept's first, and writes nothing when that is already the roster's (**Pulling
decisions**).

#### Match score tuning

Agency only: one section, `selection-tuning`, after the pool, that checks the match score against
the client's calls and retunes its weights. It answers four questions: does our score agree with
what {brand} picks, where did it miss and why, did higher scores sell cheaper, and should the
weights change.

**Who it is for.** It renders only when `canEdit()` is true and the `agency` reads return, never
for a Contributor, a Viewer, a Commenter or an outside visitor, and never in **Preview as client**,
where the section isn't in the list at all. Nothing it shows is written into the page itself:
every figure is worked out on the Editor's page from data the client can't read (`agency/scores-r{round}`,
`agency/match-score`, `agency/creator-*`) together with the client's own calls, and what it saves
goes to `agency/match-score` only (**1e**, **What the page keeps**). The client's surprise reasons
are the client's own words on their own calls and stay readable to the client side, as every call
is; the counts, patterns, figures and weights built from them are not. **Checking the roles** checks
this at the client's level.

**Which calls count.** The counted calls, the same ones **What the row shows** counts: the newest
call per creator per round from the client's side, skipping calls from Aspire accounts, refused
accounts and calls before the round's newest **Reset decisions**, plus a call recorded in Atlas from the chat for a creator and round the page has no counted call for. Each creator and round counts once: a page call that was pulled into Atlas is the same call, and the page's own wins. A recorded call is read from the roster's `slate` and `decidedBy` `{at, score, band}`, which Claude publishes into the page itself beside `slate` (the client's own score and band, nothing else of the roster's). A **pick** is Priority Yes or Yes, a **pass** is No, and **decided**
is the two together. Maybe is neither and is named apart: "{m} Maybe, not counted". **Agreement**,
**Surprises** and the bands use the score and band the client saw when they decided (the call's `score` and `band`, or `decidedBy`'s), so a Competitor conflict lands in its own row, shown as "{brand} saw {n}", since that is the number they decided against; the
factor gaps, **Did it sell** and **Retune** use the agency's stored score and factor values, as each
says. A call with no score is left out and named: "{k} calls on creators with no score left out". The
rounds follow the **Round switcher**: **All rounds** uses every round's calls, and a round segment
that round's. A creator decided in two rounds counts once per round.

In order, each part a block in the section's Card content with its title in `text-sm
font-semibold`, separated by a Separator:

1. **Agreement.**
   - **By match level.** A Table, one row per band in band order (Strong, Good, Possible, Weak,
     Competitor conflict), from the band of the score at decision time: the band Badge, "{p}
     picked of {d} decided", the share in `text-sm font-medium`, and a Factor bar at that share in
     its middle class, so the bar never reads as good or bad. A band with no decided creators shows
     "None decided".
   - **Our top 10.** Of the decided creators, the 10 with the highest score at decision time (ties by handle): "{k} of our top 10 were picked". With fewer than
     10 decided, it is the top {n}: "{k} of our top {n} were picked". Each name in the top 10 is a
     link to its row, with a success Badge "Picked" or an error Badge "Passed".
   - **Agreement score.** Over every pair of one pick and one pass in the same round, the share of
     pairs where the pick had the higher score, a tie counting as half: "{x}% of picks scored
     above passes". In `text-2xl font-semibold`, with its verdict Badge: success "Holding up" at
     75% and up, warning "Partly matching" at 60% and up, error "Choosing differently" under 60%.
     One plain line under it: "When {brand} picked one creator and passed on another, our score
     ranked the pick higher {x}% of the time." Unless at least one round in view has 3 or more picks and 3 or more passes, it reads "Too few decisions to judge yet: {p} picks and {q} passes" with a soft Badge, and the
     verdict, **Retune** and the patterns wait.
2. **Surprises.** Every counted pass on a score of 75 or more and every counted pick on a score
   under 60, newest first, as List rows: the Avatar and handle (a link to the row), the round, the call's Badge, "{brand} saw {n}" with its band Badge,
   the surprise reason in `text-sm` ("Why pass: Too expensive", "What made them a yes: Love their
   content", the Other text in quotes), or "No reason given" in `text-muted-foreground`, and "{name},
   {time}". Above the list, the reason counts: one soft Badge per reason that has one, "{reason}
   {n}", passes first then picks, most used first, and "No reason given {n}". With none: "No
   surprises yet: every pass scored under 75 and every pick 60 or more."
3. **What {brand} seems to value.** Up to five plain lines, from the decided creators, each with the
   numbers behind it, then "From {n} decisions. A few more calls can change these." A line shows
   only when its groups each hold 3 or more decided creators:
   - **Follower size.** The pick rate per tier (**Tiers**) against the overall pick rate, for each
     tier 15 points or more away from it, up to two: "Picks 70% of Micro creators, against 45%
     overall".
   - **Products.** The same per product in scope: "Picks 80% of the creators cast on {product}".
   - **Factor gaps.** For each factor, the average value of the picks less the average of the
     passes, out of 100, from the agency's stored factor values (`exact`, read now, so a factor
     re-scored since the call reads as it stands). Up to two with a gap of 10 points or more, the
     largest first: "Picks average 72 on Brief fit, passes 51" or "Picks score lower on Paid
     history than passes: 38 against 55". Budget vs target is one of the five, since the panel is
     agency only.
   - **Reasons.** The most used surprise reason, when it was used 3 or more times: "The most common
     reason to pass on a strong match: Not our look (4)".
   With no line to show: "No clear pattern yet in {n} decisions."
4. **Did it sell.** Hidden, with no empty state, until a round has ad results (**Home**, **Last
   round result**). Once one does: the newest round with ad results ("Round {n}"), its creators
   with spend on their matched variants in the page's results (**Ad Performance**, **Reading the
   results**), ranked by the agency's stored score for that
   round (a Done round's scores don't move), split into a higher half and a lower half, the higher
   half taking the middle creator of an odd count. For each half, its creators' spend added up over
   their purchases added up: "Higher scored half ({k} creators, scores {a} to {b}): {x} per sale"
   and "Lower half: {y} per sale". A half with no purchases reads "No sales yet". The verdict line:
   "Higher scored creators sold {d} cheaper per sale", "cost {d} more per sale", or "About the
   same" within 5%. With fewer than 4 creators with spend: "Too few creators with ad results to
   compare." Under it: "This compares the two halves; it doesn't prove the score caused the
   difference." Money is in the round's results currency, and spend in another currency is left
   out.
5. **Retune.** A Table of the five factors, one row each: the factor, the weight in use with
   "default" or "tuned {date}" under it, the suggested weight, and the change ("+0.06", "−0.03",
   or "no change"). Under it, two agreement figures on the decided creators in every round, the suggestion's own basis, each worked out
   with the agency's score: labelled "Agreement on Aspire's score": "With today's weights {b}%", "With the suggested weights {c}%", each over pairs in the same round as the Agreement score is, and
   "These are the same decisions the suggestion learned from, so the second figure flatters it."
   Then two Buttons for an Editor: **Apply tuned score** (default size sm) and **Back to default**
   (outline size sm). Apply is disabled while the suggestion equals the weights in use, while no counted call has arrived since the last Apply or Back to default (`stats:` `at`), or while no round has 3 or more picks and 3 or more passes, counted over every round as the suggestion is, whatever the **Round switcher** shows; Back to default is disabled while
   every weight is the default.

**How the suggestion is worked out.** The default weights come from `defaults:` on
`agency/match-score`, never from the page's code (**1e**, **What the page keeps**). On the
Editor's page, from the decided creators in every round, whatever the **Round switcher** shows,
since **Apply tuned score** re-scores every round that isn't Done; the Retune block says "Learned
from {n} decisions across {r} rounds". It is worked out again every time a counted call arrives:

1. For each factor, the **gap**: the average value (0 to 1) of the picks less the average of the
   passes, from the agency's stored `exact` values. A creator the factor left out is left out of
   that factor's averages; with fewer than 3 picks or 3 passes holding a value, the gap is 0.
2. The **fit**: the default weight plus 0.25 × the gap, so a factor that fully separates picks from
   passes (a gap of 1) gains 0.25, and one the client ignores keeps its default.
3. **Pulled toward the default by how few decisions there are**: the default plus {n} ÷ ({n} + 20)
   of the way to the fit, {n} being the number decided. At 20 decisions the suggestion goes half
   way; at 5, a fifth of the way.
4. **Capped and floored from the default**: each weight sits at most 0.08 from its default, up or
   down, and never under 0.03, so no factor is ever dropped. The cap is measured from the default,
   not from the weights in use, so applying the same decisions twice gives the same weights.
5. **Normalised, price apart.** Budget vs target is settled first, on its own: its capped and
   floored value is its weight. The other four are then normalised among themselves, as shares
   of 1 measured against their defaults scaled to 1 (Performance 0.30 of 0.85, and so on): scaled
   to add up to 1, and any share that then breaks its limits is set to that limit and held while
   the others are scaled again, repeated until none does (at most four passes, since each holds
   one more). Their final weights are those shares times 1 less the Budget vs target weight. So the
   client's four weights, which are those shares, never depend on anything about price.
6. **Shown** to two decimals and kept to three.

The suggestion is worked out again on every view, so it follows new calls; it is saved only when an
Editor applies it.

**Apply tuned score** opens a Dialog, "Apply the tuned score?", that lists each changed weight
("Brief fit 0.25 to 0.31") and says "Every creator's match score changes for both sides. Aspire's
side sees the weights; {brand} sees only the new scores." with **Apply** (default) and **Cancel**
(outline). **Back to default** opens the same Dialog, "Go back to the default score?", listing the
weights it resets. On **Apply** the page, in this order:

1. writes the five `weight-*` stamps on `agency/match-score` in one write, `source` `manual` with
   the Editor as `by`: the suggested weights, or `null` for each on **Back to default**, which reads
   as the default;
2. writes `stats:` on the same document: `{action, at, by, byName, decisions, before, after,
   agreement}`, `action` `tuned` or `default`, `decisions` the number decided, `before` and `after`
   the five weights, and `agreement` the agreement on Aspire's score before and after;
3. re-scores every creator in every round that isn't Done and writes the results, as **The match
   score**, **Where it is computed**, says for a weight change, so the Table, the cards, the viewer,
   the sort and the client's open views all move within seconds on the live stream. A weight
   change moves no factor value, so no level or Watch line changes;
4. logs one `edit` entry in its agency log, "Applied the tuned match score from {n} decisions:
   Brief fit 0.25 to 0.31, Paid history 0.15 to 0.12" or "Set the match score back to the default
   weights", and, only when at least one `scores` document changed, one entry in its client readable log, "Updated the match scores", which names no weight, factor or number (**1e**, **The activity log**). A retune that moves only Budget vs target changes no client score once the client's four are scaled to 1, so it writes no client entry and tells the client nothing.

While it runs, both Buttons are disabled and show "Applying"; a refused write shows "Not saved" and
leaves the weights as they were. Two Editors applying at once follow the re-score's own rule: the
page reads the weights again just before it writes and starts over when they changed.

**From the page to Atlas.** Applying changes the score on the page only. Discovery and vetting score
from `match` in `campaign:{slug}-cas`, so the next **Pulling decisions** offers, after the batch
picker and in a picker of its own, to save the weights there (**Pulling decisions**, **Match score
weights**). The page never writes to Atlas.

**The weights' stamps**: `agency/match-score`, one stamp per factor: `weight-performance`,
`weight-brief-fit`, `weight-paid-history`, `weight-budget` and `weight-content-reach`. For each
factor the newer of the stamp's `at` and that factor's `tuned` time in `match` in
`campaign:{slug}-cas` wins, so a weight the CM changed in the chat after a pull is the one in use,
and a change to one factor never decides another; a missing key reads as `match`, else the
default. A `null` stamp means "back to the default": it reads as the default, and **Pulling
decisions** removes that factor's weight from `match`. Claude never writes these stamps, so an
Editor's tuning stays `manual` until it is pulled.

**What a person sees, by role.** The agency sees the whole section. The client, in their own view and
in **Preview as client**, sees no section, no summary line, no figure, no
weight and no Badge from it; the only change they see is their scores moving, and `scores` says
`cause` "updated by Aspire".

This is the step 2 approval.
