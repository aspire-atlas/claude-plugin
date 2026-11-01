# Organization dashboard: design notes

What a bare `/aspire:aspire` shows on a configured organization. The working steps are the
**Organization dashboard** section of `plugins/aspire/skills/aspire/SKILL.md`; this note records
the decisions and what is still open.

## Decisions

| Question | Decision |
| -------- | -------- |
| What draws it? | The Atlas server's dashboard widget (an MCP App), on its read-only `get_dashboard` tool. The plugin no longer builds a page: the `atlas-org-dashboard` agent and its reference are gone. |
| How is it live? | `get_dashboard` returns the `get_status` view; the widget then reads each brand profile's posts, accounts, hashtags and saved work itself, through the viewer's own Aspire Atlas connection, every time it is shown. There is no snapshot to go stale. |
| Posts and creators | Drawn by the server's own social posts and creator cards views, embedded in the dashboard, so they look and act exactly as they do on their own. |
| Where is it kept? | Nowhere: nothing is published and no link is saved. A `brand:dashboard` record from an earlier version is left as history and opened only on request. |
| Content | Overview: credits ring and stat tiles, the next step, things of interest (top post against the median, pace, a quiet stretch, the busiest hashtag, a lapsed channel), the saved goals with their evidence, the brand questions and the ten-item Atlas setup checklist, brand profiles, programs and campaigns, the newest saved work, credits. A tab per profile: channels, its setup strip, stat tiles, posts per day over 28 days against the 28 before, things of interest, its accounts, its newest posts, posts per tracked hashtag. |
| Next step | The earlier page's rules, first that applies: reconnect, connect, the first brand questions, the orchestrator's open action, first insights, an overdue report, set up reports, a program's open item, the rest of the brand questions, theme and rates, then plan next week's content. Offered by `/aspire` as one picker; every step runs through its own section with its usual confirmations. |
| Role and goals | Owners and admins see setup and programs open, members see them closed. An agency (from the relationship onboarding saved) sees programs above the profiles; a brand owner sees goals first. Goals are `brand:business-context` and `target:*`; a posting target shows the posts counted, others the latest report or the flow that would measure them. A lens never changes a number. |
| Fallback | Without the tool (an older server) or a widget-capable host, `/aspire` uses the `get_status` result and gives a short readout. The server's text result is always a full fallback on its own. |
| First-run guide | Unchanged: unconfigured organizations get the guide on a bare run; configured ones get the dashboard. |

## Consequences to know

- No spend, budget, sales, or members appear on the dashboard; each program's own dashboard keeps
  money, and member questions stay in the support skill.
- The mod (`plugins/aspire-mod`) loses the agent's roster and costume entries.
- The server feature ships and works without the plugin; this plugin change only routes to it.

## Open

- Posts per day counts the newest 100 posts across both windows and says so when it hits the cap.
- The next step and setup checklist read the newest 60 findings; an account review older than that
  is not claimed missing, so "first insights" is only offered when the read was complete.
