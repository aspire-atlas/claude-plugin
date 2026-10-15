# Organization dashboard: design notes

What a bare `/aspire:aspire` shows on a configured organization. The working spec is
`plugins/aspire/skills/aspire/references/org-dashboard.md`; this note records the decisions and
what is still open.

## Decisions

| Question | Decision |
| -------- | -------- |
| How is it live? | The page refreshes on open through the viewer's own Aspire Atlas connection (`mcp` capability, six read tools), with a snapshot embedded at build time as the fallback. |
| Who builds it? | A new agent, `atlas-org-dashboard`, in a subagent like every Atlas agent. |
| Where is it kept? | One calibration per scope: `brand:dashboard` (shared, one per profile) and `user:{slug}-dashboard` (personal). Brand memory, so teammates and later sessions find it. |
| Sharing | One shared page per organization, built from the publisher's role and goals. No view switcher: anyone who wants a different emphasis makes their own copy. |
| Role and goals | Read from what onboarding saved (`user:` record, `brand:business-context`, `target:*`, readout lenses) and the Atlas role. The page asks nothing. |
| Content | Tabs: Overview (next step, credits bar, profile cards, setup strip, programs and campaigns, footnote) and a media-led tab per profile (recent posts, ingestion and hashtag charts, other agents' output, things of interest, goals). Organization and person details only in the footnote. |
| Next step | Shown on the page; `/aspire` also offers it as one picker that launches that flow with its usual confirmations. |
| First-run guide | Unconfigured organizations still get the guide on a bare run; the dashboard is offered after brand context is saved, or on `/aspire:aspire dashboard`. Configured organizations get the dashboard. |
| Empty state | Same layout, sections marked not set up yet, the setup strip first on each tab. |

## Consequences to know

- A page that reads through a viewer's connector cannot be shared by public link.
- Viewers without Aspire Atlas connected see the snapshot, labelled with its age.
- No spend, budget, sales, or members appear on the page; each program's own dashboard keeps
  money, and member questions stay in the support skill.
- The plugin mod is unchanged apart from the agent roster and costume entries.

## Open

- The page's live reads are written from the loaded tool schemas at build time. The first real
  publish needs a check in the desktop app that `watchTool` returns data for all four tools.
- Matching the viewer to their `user:` record uses name or email from `get_status`; if records
  carry neither, the page falls back to the Atlas role and the person picks a view.
- Whether `layout` versioning should force a rebuild prompt when the plugin changes the page.
