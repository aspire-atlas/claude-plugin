# Organization dashboard

Used on a bare `/aspire:aspire` for a configured organization and on the `dashboard` argument.

## Organization dashboard (where the organization stands, and what to do next)

Trigger on a bare `/aspire:aspire` for a configured organization (the **existing** route of
Phase 2 + 3, right after the organization pick in its step 3, never in the same reply as the
selector), on `/aspire:aspire dashboard`, and when the user asks to see the dashboard, where
they stand, or what to do next in Atlas. It runs in the main thread with no agent, shows and
recommends only, and writes nothing: no spend, no members, nothing moved, drafted, or sent.

1. **Show it.** Call `get_dashboard` with `asOrganizationId` (and `asProfileId` when the user
   named a brand). Where the host renders the tool's widget, it draws the dashboard and reads the
   rest itself: an Overview (credits, the next step, things of interest, the saved goals with their
   evidence, the brand questions and the Atlas setup checklist, brand profiles, programs and
   campaigns, the newest saved work) and a tab per brand profile (its setup, posts per week against
   the 28 days before, things of interest, its tracked hashtags, and, once the tab is opened, its own
   accounts as creator cards and its newest posts). The caller's role and stated relationship set what leads and what starts
   open. Build no page or card beside it and repeat none of its numbers; say one line with the
   next step, then ask step 3 in the same reply.
   - When that line or the fallback below cites an account's data, it carries the freshness line,
     read from `freshness` on the profile's `list_channels` connections, and a period Atlas has not
     fetched reads "Atlas has no data for {period}" (**Page standard**, section 9). The dashboard
     refreshes nothing and offers no refresh; the reports that read the account do (section 9.5).
2. **Fallback.** When `get_dashboard` is not among the Atlas tools (an older server), or the host
   shows no widget, use the `get_status` result already in hand (its status card draws where
   widgets render) and give a 3 to 5 bullet readout: channels and any lapsed one, credits left,
   setup done of total, programs and campaigns. Posts and creators, when asked for, come from
   `search_posts` and `search_creators` and are answered in text per **Visual output**.
3. **Next.** One `AskUserQuestion`, header "Next": the widget's next step (Recommended), then one
   or two more from this order, first that applies: reconnect a lapsed channel, connect a profile
   with no channel, answer the brand questions (fewer than 3 answered), the orchestrator's open
   action, first insights (no account review yet), an overdue report, set up reports, a program's
   open action item, the rest of the brand questions, the theme or creator rates, then plan next
   week's content. Each runs through its own section with its own confirmations.

A dashboard page published by an earlier version (the `brand:dashboard` calibration, or
`dashboardUrl` in `get_status`) is no longer rebuilt; open it only when someone asks for it.
Unattended runs never show the dashboard.
