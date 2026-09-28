# Aspire Atlas Organization Admin tool reference

Last verified 2026-09-28 against the live server, signed in: 10 tools plus `get_more_tools`,
of which the plugin uses three. Re-check before each official release.

Server: `https://atlas.aspire.io/mcp/admin-organization` (streamable HTTP, OAuth), bundled as
**Aspire Atlas Organization Admin**. Its own OAuth scope is `mcp:admin-organization`, separate
from Atlas's `mcp`, so it needs its own sign in. Every tool on it requires `context`: 15 to
25 words, third person, no first person, no credentials. It is analytics only.

**Use the bundled connector only.** These are the only prefixes the plugin uses:

| How added | Prefix |
| --------- | ------ |
| Bundled with this plugin (the normal case) | `mcp__Aspire_Atlas_Organization_Admin__` |
| Some clients namespace plugin servers | `mcp__plugin_aspire_Aspire_Atlas_Organization_Admin__` |

Match the prefix exactly (case-insensitive), not a substring. A copy of the same server added
by hand under another name (for example `mcp__aspire-org-admin__*` or
`mcp__claude_ai_Atlas_Admin__*`) is not the bundled connector: never call its tools and never
mention it. Load the admin tools only when the user asks about the organization's members.
Onboarding never needs them.

When the bundled tools are not loaded, the connector needs a sign in or needs turning on in
this chat: handle that with **Connection** in `../SKILL.md`. When it is missing from the
connector list altogether, the plugin install is out of date: ask the user to update or
reinstall the plugin. Never suggest adding the URL as a custom connector, even
when the server's own instructions say to; a second copy duplicates the bundled one.

**Supported tools.** Only these three, the ones Atlas's `get_status` links to under
`_links.members`, `_links.invitations` and `_links.invite-member`. The plugin uses no other
tool on this server.

| Tool | Purpose | Arguments | Confirmation |
| ---- | ------- | --------- | ------------ |
| `list_members` | Direct members of an organization: name, email, role, joined date, plus `pendingInvitationCount` and `yourRole` | `asOrg` | None: read only |
| `list_invitations` | Pending invitations: email, role, who sent it, expiry | `asOrg` | None: read only |
| `invite_member` | Invite someone by email; they join only when they accept the emailed link | `email` (required), `role` (`owner`, `admin` or `member`; default `member`), `asOrg` | `AskUserQuestion` naming the email address, the role, and the organization |

Pass the `arguments` from the `get_status` link as given. Never guess an argument name; if the
live schema differs from this table, stop and note the difference in the run summary.

Reading the results:

- **The caller's role** comes from `get_status` (or `yourRole` in `list_members`), never from
  the caller's own row in the member list. That row shows direct membership only, so an owner
  through a parent organization can appear there as a member.
- **Only direct members are listed.** A short list does not mean nobody else can reach the
  organization; say so when the user asks who has access.
- **Service accounts** (emails ending `@service-accounts.invalid`) are not people. Leave them
  out of the member list and mention their count in one line if any exist.

Invite rules:

- The caller's role must be owner or admin. Only an owner may invite someone as an owner, so
  never offer the owner role to an admin.
- Before the confirmation, call `list_members` and `list_invitations`. If the email is already
  a member or has a pending invitation, say so and do not invite; the server refuses both.
- The invitation lasts 48 hours. Say so after sending.
- `emailSent: false` means the invitation exists but its email did not go out. Tell the user
  so and point them to Aspire support; do not invite again, which is refused.
- Never invite in an unattended session, during onboarding on the skill's own initiative, or
  on a "yes" from an earlier message.

Any other tool this server lists (removing a member, changing a role, cancelling an
invitation, leaving, renaming, creating or deleting an organization) is not supported yet. Do
not call it, even for a read. Tell the user in one line that Atlas can't do that from here
yet, and note the tool's name in the run summary. Each new tool is added to this table with
its arguments and its confirmation, after checking it against the live server, before any
flow uses it.

