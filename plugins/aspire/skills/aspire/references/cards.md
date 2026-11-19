# Cards after a search reply

Loaded from **Cards after a search reply** in `SKILL.md` (**Orchestration contract** **12** points
here), before a main-thread reply that lists creators, posts, or ads, and when the person asks for
cards or says how they want them. A bold section name with no file beside it is another part of
this skill; `SKILL.md`'s **Sections** index names its file. Bold numbers are sections of the
**Orchestration contract**.

Applies to every main-thread reply that lists creators, posts, or ads, whichever flow made it.
The reply answers in text (**Visual output**); this section says whether cards follow it. Agents
never apply it: the main thread does, after it relays what they found. **Creator card** and
**Theme** point here rather than restate it.

**The saved choice.** `preferences.cards` on the person's own `user_fact` record, keyed
`user:usr-{id}` (`get_status` names it as `firstRun.role.key`), read in the same
`search_calibrations` call that loads the role (**1**, step 2). `always`, `ask`, or `never`; no
record, or a record without `cards`, means `ask`. Only that key holds the choice: an older
`user:primary-contact` or `user:{slug}` record names a role but never a cards choice.

**`ask`: one offer line, once per session.** The first such reply in the session ends with:

> Want these as cards? Say "show cards". Say "always show cards" and I'll remember.

Keep `cards_offered` in working state and never add the line to a later reply in the session.
On a host that draws no widget (**Creator card**, **Cards in chat**), the line is instead
"This host can't draw cards; the page has them.", once per session, and only when the reply
links a page; with no page, add nothing. Never in an unattended or scheduled run.

**"Show cards".** Draw the host's own widget for the results the reply named, in the reply's
order, up to 12 per call:

| Results | Call |
| ------- | ---- |
| Creators | `lookup_creators`, one item per handle the reply named |
| Posts | `lookup_posts`, one item per post link |
| Ads from `search_ads` | `show_ads` with their ad ids and the search's `dateFrom` and `dateTo` |
| Posts from `search_partnership_content` | `show_partnership_content` with their `igMediaId`s |

Creators and posts follow **Creator card**, **Cards in chat** (only what Atlas holds; nothing is
discovered to draw a card). Then say their line from **Atlas tools**, **After a widget**, and the
readout, and stop. No image data enters the
conversation, and no plugin card is built beside the host's. More than 12: show the first 12
and say "Say 'show more' for the next 12."; "show more" (or "show cards" again) draws the next 12
of the same reply. On a host that draws no widget, give the
**Markdown fallback** instead.

**`always`.** Every such reply is followed by that call for the results it names, unasked, and
the offer line is dropped. Never in an unattended run, and never on a host that draws no widget:
there it acts as `ask`, with the no-widget line. **`never`.** The offer line is dropped;
"show cards" still works when the person asks.

**Saving the choice.** "always show cards" saves `always`, "never show cards" saves `never`, and
"ask me about cards" saves `ask`. Confirm it with one `AskUserQuestion` (header "Cards", "Save
this for you in {organization}?", options "Save (Recommended)", "Just this chat"), as every Atlas
write is. "Just this chat" applies the choice for the session and saves nothing.

- A record exists: `supersede_calibration` with kind `user_fact`, the person's key, `ifVersion`
  set to the version read, the record's `statement`, `provenance: "interview"`, and a `detail`
  that carries the record's whole current detail (`role`, `roleOther` when present, and every
  other preference) with only `preferences.cards` replaced. A detail that sends only `cards`
  drops the rest. This supersede changes only the person's own choice, so the save question is
  its confirmation (**Guardrails**).
- No record: the record needs a role. Ask it in the same `AskUserQuestion` call (header "Role",
  options "Influencer manager", "Paid social manager", "Organic social manager", and the free
  text field for anything else), map the answer to `influencer_manager`, `paid_social_manager`,
  `organic_social_manager`, or `other` with the typed words as `roleOther` (at most 80
  characters), then `append_calibration` with kind `user_fact`, the person's key, statement
  "Role: {role label}", `provenance: "interview"`, and `{role, roleOther?, preferences: {cards}}`.
- `key-exists` or a version conflict: read the record again and retry once with its current
  detail.

Confirm the save in five words: "Saved: cards show every time.", "Saved: no more card
offers.", or "Saved: I'll ask about cards." With `always`, draw the cards for the reply just
given, if it listed results.
