---
name: Organization dashboard for a bare /aspire
owner: 29-reports
---

# Organization dashboard for a bare /aspire

## What it does

Shows the organization dashboard a bare `/aspire` opens, by calling the Atlas server's `get_dashboard` tool: its widget draws the organization's profiles and channels, credits, setup gaps, the saved goals with their evidence, things of interest, each profile's posts per day, own accounts, newest posts and tracked hashtags, every program and campaign, the newest saved work, and the one next step to take, shaped by the viewer's role.

## Inputs

- The organization and, when named, the brand profile, from Phase 2 + 3 of `/aspire`.

## Output

The server's dashboard widget, which reads Atlas live through the viewer's own connection, or a short readout from `get_status` where no widget renders. Nothing is published, saved, moved, drafted or sent, and no spend or members are shown.

## Callable

Runs in the `/aspire` main thread, on a bare run for a configured organization or on `/aspire dashboard`. No agent owns it.
