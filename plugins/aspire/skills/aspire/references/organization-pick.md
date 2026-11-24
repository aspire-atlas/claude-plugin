# Organization pick (a bare run's organization selector)

Loaded from **Organization pick** in `SKILL.md`, from Phase 2 + 3 step 3 and the `org` argument.
Phase 2 + 3 is in `SKILL.md`; a bold section name with no file beside it is another part of this
skill, and `SKILL.md`'s **Sections** index names its file.

## A bare run

On a bare `/aspire:aspire` run interactively (nothing after the command,
not unattended) where the caller belongs to more than one organization, the organization
selector comes first and comes alone. The `get_status` call in step 1 draws it where the host
renders the tool's widget. End the turn there: no bullets, no summary, no first-run guide, no
dashboard, and no other tool call or question in that reply; one line only, "Pick the
organization above, then say continue." (**After a widget**: needs a click.) A pick in the widget
does not post a message: it
records `selectedOrganizationId` in the model context, so the user's next message is what
resumes the run. On that message use the `selectedOrganizationId` the widget recorded; with
none, match a typed name to the organizations in that result, ignoring case; with no match
or more than one, ask with `AskUserQuestion`. Then call `get_status` again with that
`asOrganizationId`, and only then go on to step 4. Where the host draws no widget, or you
cannot tell (Claude Code's terminal, plain-text hosts), ask with `AskUserQuestion` instead
(header "Organization", one option per organization, the selected one first) and continue
from the answer the same way. With exactly one organization there is nothing to pick: go
straight to step 4.

## The `org` argument

Call `get_status`, ask which organization with `AskUserQuestion` (header "Organization", one option
per organization, the selected one first; besides a bare run's selector in Phase 2 + 3 step 3, this
explicit argument is the only time the question is asked), then call `get_status` again with
`asOrganizationId` set to the choice (even when it is the organization already selected: the
progress bar and credits follow the named call, not the default), and give the Phase 2 + 3 route
summary. Change nothing in Atlas.
