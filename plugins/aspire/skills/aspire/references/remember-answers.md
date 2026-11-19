# Remembering answers (the "Remember" question and its writes)

Loaded from **Remembering answers** in `SKILL.md`, when a run is due to ask "Remember"
(**Orchestration contract**, **2**, Saved answers, says when). It holds where the question goes,
its options, and the writes each answer makes. A bold section name with no file beside it is
another part of this skill; `SKILL.md`'s **Sections** index names its file. Bold numbers are
sections of the **Orchestration contract**; the records it writes are the two that Saved answers
there describes.

## The question

Ask once per request, header "Remember", "Keep these answers for next
time?", only when the person changed a pre-filled answer (a saved one or a default), when the
Scope or Save question was asked because no saved record supplied it, or when the person picked a
persona in Heard while their own record has no role. A run whose answers all came from saved
records and stayed as they were is never asked. When the setup reply asks Scope or Save and has
room for one more question (the tool takes four, so not when Credits is also asked), Remember goes
in that same call, after Save; a first run then takes one round of questions, not two. Otherwise
ask it in the call after the setup reply, before the launch: a change typed in the setup reply,
or a persona picked in Heard, is not known until it returns. Options, with the flow named in
words, never its key ("the weekly report", "ad reuse"):

- "For everyone running {the flow} (Recommended)": writes the flow's saved answers, and nothing
  to the person's `defaultReader`.
- "Just for me": writes the reader to the person's `defaultReader` for this question code and
  nothing else; the flow's saved answers and any setup record stay as they are, and the scope and
  save choice stay unsaved, which its description says. Offer it only when the run has a question
  code.
- "Just this run": writes nothing, not even a role.

When the person's own record has no role, the first two options also save their role, and each
says so in its description ("and your role, paid social manager"; in the setup reply's call, "and
the role you pick in Heard"). Take the role from the persona the Heard question settled; with
none, ask it in the call after (header "Role", options "Influencer manager", "Paid social
manager", "Organic social manager", and the free text field for anything else). A `user_fact`
record also needs the person's `relationship` (`in_house`, `agency`, or `owner`). Take it from
their own record, else from their **Onboarding questions** record (question 2 or 11) when it is
theirs; with neither, ask it in that same call, header "Relationship", with question 2's options
("In-house marketer or social lead", "Agency working on the brand's behalf", "Founder or owner").
Never guess it.

## The writes

Write once, after the answers and before the launch:

- "For everyone", an answer a flow's own setup record holds: a changed reader supersedes that
  record (`supersede_calibration`, `ifVersion` set to the version read) in its own body format,
  with only the primary reader changed and every other lens and destination kept; the option's
  description names it ("updates the weekly report's saved readers"). The readouts share
  `guideline:readout-audience`, so for either report say "updates the readers of the daily and
  weekly reports", in the option and in the reply. A changed scope that a setup record holds is
  not saved from here: say so in the option's description, and point to the flow's own setup
  ("Change setup") in the reply. "Just for me" never touches a setup record.
- "For everyone", every other part: the flow's `lastrun:` record. `append_calibration` with kind
  `guideline`, the key, statement "{flow}: {reader}, {scope}, {save}" (under 280 characters),
  `provenance: "interview"`, and the detail above. When the key exists, `supersede_calibration`
  with `ifVersion` set to the version read and a body that keeps every part the person did not
  change.
- The person's record, for "Just for me", and for a role saved with either of the first two
  options. When it exists, `supersede_calibration` with kind `user_fact`, their key, `ifVersion`
  set to the version read, the record's `statement`, `provenance: "interview"`, and a `detail`
  that carries the record's whole current detail (`role`, `roleOther` when present, and every preference) with only these
  changed: for "Just for me", `preferences.defaultReader.{code}` added or replaced; for a role
  saved, `role` set (and `roleOther` for `other`), with the statement "Role: {role label}". A record
  without `relationship` gets it too. A detail that sends only the changed field drops the rest. With no record, `append_calibration` with kind
  `user_fact`, the person's key, statement "Role: {role label}", `provenance: "interview"`, and
  `{role, relationship, roleOther?, preferences?: {defaultReader: {"{code}": "{lens}"}}}`, with `preferences`
  only for "Just for me". Map the role to
  `influencer_manager`, `paid_social_manager`, `organic_social_manager`, or `other` with the
  person's words as `roleOther` (at most 80 characters).
- `key-exists` or a version conflict: read the record again and retry once with its current
  detail.

## Saying where it went

Say where it went in one line, naming the record that changed: "Saved for everyone: the daily and
weekly reports' readers now lead with growth." or "Saved for you: ad reuse questions go to growth." A run that
keeps the saved answers writes nothing to the body's first line, so it holds the answers as last
saved, and `at` is when they were saved. The last-run lines are written at close-out
(**Repeat run**, **Keeping the record**). Never ask "Remember" in an unattended run, and an unattended run
writes neither record.
