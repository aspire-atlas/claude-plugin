# Aspire Atlas plugin: development and lifecycle runbook

How the Claude plugins in this repository (today `aspire`; the marketplace can list several) are developed, tested, shipped to beta, released to customers, mirrored to Aspire staff, and rolled back. This is the authoritative operating document; `CONTRIBUTING.md` summarizes it.

## 1. The three repositories and what each one is for

| Repository | Visibility | Purpose | Who writes to it |
| --- | --- | --- | --- |
| [`aspire-atlas/claude-plugin`](https://github.com/aspire-atlas/claude-plugin) | Public | Source of truth. Two branches, two channels (below). What customers install and what the Anthropic plugin directory mirrors. | Engineers, via pull requests only |
| [`aspire-atlas/claude-plugin-internal`](https://github.com/aspire-atlas/claude-plugin-internal) | Private | Read-only copy of `develop`, force-pushed by CI on every merge. Exists only because claude.ai org marketplaces accept private repos. Feeds the Aspire org plugin catalog. | Nobody. CI only. |
| Anthropic plugin directory (claude.com/plugins) | Public | Mirrors `main` of the public repo after one-time approval. Runs automated screening on each update. | Nobody. Anthropic's CI. |

Never open a PR, push a commit, or change a setting on `claude-plugin-internal`. Anything you do there is destroyed on the next push to `develop`.

## 2. Branches and channels

| Branch | Marketplace name | Plugin version | Audience | How it updates |
| --- | --- | --- | --- | --- |
| `develop` | `aspire-atlas-beta` | none in the files; Claude uses the commit SHA | Beta customers (Claude Code, `...claude-plugin.git#develop`) and all Aspire staff (via the mirror) | Every merged PR |
| `main` | `aspire-atlas` | `X.Y.Z` pinned in `.claude-plugin/marketplace.json` | Customers (Cowork and Claude Code, `aspire-atlas/claude-plugin`) and the Anthropic directory | Only when the version string changes |

Both channels list the same plugins under the same names, for example `aspire` with the `/aspire:aspire` and `/aspire:org-admin` skills and the `aspire:atlas-*` agents. A user should be on one channel at a time; two installs of the same plugin name make Claude load one and warn about the other.

### The single-version rule

Each plugin's version lives in exactly one place: its own entry's `version` in `.claude-plugin/marketplace.json`, and only on `main`. Plugins are versioned independently: a release bumps only the plugins whose content changed.

- No `plugins/<name>/.claude-plugin/plugin.json` has a `version` field.
- No `skills/*/SKILL.md` frontmatter has a `version` field.
- `develop`'s `marketplace.json` never has any `version` field.
- The top-level `version` on `main` is optional. While it is there it must equal `aspire`'s version; a release may drop it.

CI (`scripts/check-channel.sh`) fails the build if any of these are violated. The reason: Claude resolves a plugin's version as `plugin.json`, then marketplace entry, then commit SHA. Keeping the field out of shared files is what lets `develop` track commits while `main` stays pinned, and what keeps merges between the branches conflict-free.

### One plugin per folder, one changelog and tag series per plugin

`scripts/plugins.sh` holds these conventions for every check and workflow, and `scripts/check-channel.sh` enforces the first two:

| What | Rule | `aspire` (kept from before there were several plugins) |
| --- | --- | --- |
| Folder | `plugins/<name>/`, listed with `"source": "./plugins/<name>"`. On `develop` every folder under `plugins/` has an entry; on `main` a folder without one is held back (below). Org sync needs relative paths for private plugins, so plugins live in this repository. | `plugins/aspire/` |
| Changelog | `plugins/<name>/CHANGELOG.md`, shipped with the plugin. Editing it alone is not a content change, so it needs no version bump. | the root `CHANGELOG.md` |
| Release tag | `<name>--vX.Y.Z`, the form Claude Code resolves dependency version ranges against | `vX.Y.Z`, plus `aspire--vX.Y.Z` from the next release on |
| Release asset | `<name>-X.Y.Z.zip` and its `.sha256` | `aspire-X.Y.Z.zip` |

### Files that differ between the branches

Only `.claude-plugin/marketplace.json` and the changelogs: the marketplace's top-level `name` and `description`, each plugin entry's `displayName` (the beta adds "(beta)"), and the `version` lines. Everything else is identical or flows from `develop` to `main` unchanged, including the plugin entry's `description`, which is what the plugin page shows on both channels. Rules that follow:

- On `develop`, never edit the lines that differ by channel.
- Keep the plugin entry's `description` the same on both branches. Change it on `develop` like any other shared file, so the beta listing shows it right away and the next release carries it to `main`.
- On `develop`, never edit a plugin's changelog (`CHANGELOG.md` for `aspire`, `plugins/<name>/CHANGELOG.md` for the others), and never create one. Release branches own them. CI fails a `develop` push whose changelog differs from both the merge base and `main`.

## 3. Local setup

```bash
git clone https://github.com/aspire-atlas/claude-plugin.git
cd claude-plugin
git checkout develop
npm install -g @anthropic-ai/claude-code     # for `claude plugin validate`
```

Try your working copy in Claude Code without pushing anything:

```shell
/plugin marketplace add ./path/to/claude-plugin
/plugin install aspire@aspire-atlas-beta
```

After edits: `SKILL.md` changes are picked up live; agents and manifests need `/reload-plugins`. Remove the local marketplace when done so it does not shadow the real channel: `/plugin marketplace remove aspire-atlas-beta`.

Do not develop from a folder that is mounted read-only or delete-restricted (some Cowork-connected folders are). Git needs to delete lock files.

## 4. Day-to-day development (ships to beta)

1. Branch from `develop`: `git checkout -b feat/short-name develop`.
2. Make the change. Keep the plugin rules in section 9.
3. Run locally before pushing:
   ```bash
   claude plugin validate .
   claude plugin validate plugins/<name>    # each plugin you touched
   claude plugin test plugins/<name>        # a plugin with a Claude Code mod: its tests
   bash scripts/check-channel.sh develop
   bash scripts/check-tool-contract.sh
   bash scripts/check-agent-roster.sh
   bash scripts/check-artifact-standard.sh
   bash scripts/check-palette.sh
   bash scripts/check-skill-args.sh
   ```
4. Open a PR into `develop`. Required: one approval, the `validate` check green, conversations resolved.
5. Merge. Within about a minute:
   - `Validate` runs on `develop`.
   - `Mirror to internal` force-pushes `develop` to `claude-plugin-internal/main`.
   - Beta customers see the new commit on their next `/plugin marketplace update aspire-atlas-beta`.
   - Aspire staff see it after the org marketplace's next sync (claude.ai admin console, Plugins, the marketplace's **Sync** or **Update** action).

There is no version to bump and no changelog to write for beta work. Commit messages are the beta release notes; keep them descriptive.

## 5. Releasing to customers (main)

Release branches are cut **from `main`** and pull `develop` in. That direction is what keeps the merge clean, because `main` owns the channel lines in `marketplace.json` and the changelogs, and `develop` never touches either.

The branch is named for what it ships: `release/X.Y.Z` when it releases `aspire` (alone or with others), `release/<name>-X.Y.Z` when it releases one other plugin.

```bash
git fetch origin
git checkout -b release/1.2.0 origin/main
git merge origin/develop                  # expect: no conflicts, except the one below
git log origin/main..origin/develop --oneline   # what you are shipping
```

If `develop` changed a plugin entry's `description` since the last release, or added a plugin, `marketplace.json` conflicts, because on `main` the `version` lines sit next to them. Resolve by keeping `main`'s channel lines (top-level `name` and `description`, each `displayName`, the `version` fields), `develop`'s plugin `description`s, and any new entry from `develop` with a `version` and a `displayName` added for `main`, then `git add .claude-plugin/marketplace.json` and finish the merge. `bash scripts/check-channel.sh main` confirms the channel lines.

Then, for every plugin whose folder differs from `main` (`git diff --stat origin/main -- plugins/` lists them) and every plugin new on `main`:

1. `.claude-plugin/marketplace.json`: set that plugin entry's `version` to its new version. For `aspire`, set the top-level `version` to the same number while it is still there.
2. Its changelog: add `## [1.2.0] - YYYY-MM-DD` under `## [Unreleased]` with Added / Changed / Fixed subsections, and update the compare links at the bottom (`v1.2.0` for `aspire`, `<name>--v1.2.0` for the others). A plugin's first release creates `plugins/<name>/CHANGELOG.md` in the root file's format.

Leave every other plugin's version alone.

**Holding a plugin back.** A plugin that is on `develop` but not ready for the official channel arrives on the release branch with a versionless entry, which the gate refuses. Remove that entry from `marketplace.json` on the release branch (keep its folder). On `main` the folder then sits unlisted, so nobody can install it, and `check-channel.sh main` reports it as held. Later merges from `develop` keep the entry out, because `main` removed it and `develop` did not change it; if `develop` edits the entry meanwhile, resolve the conflict by leaving it out again. The release that ships the plugin adds the entry back with its `version`.

```bash
bash scripts/check-channel.sh main        # must print OK
git commit -am "Release 1.2.0"
git push -u origin release/1.2.0
gh pr create --base main --label release --title "Release 1.2.0"
```

The `Release gate` check blocks the merge unless all of these hold:

- Source branch is `release/*`, `develop`, or `hotfix/*`.
- Every listed plugin has a version (hold back an unready one as above).
- For each plugin: if anything in its folder other than its changelog changed, or it is new on `main`, its version is higher than `main`'s (no plugin's version goes down).
- For each plugin being released: its changelog has a dated entry for that version and nothing is left under Unreleased.

Merge with a **merge commit** (not squash), so `main` records that it contains `develop`. On merge, the `Release` workflow, for each plugin whose version has no tag yet:

- tags the merge commit (`v1.2.0` and `aspire--v1.2.0` for `aspire`, `<name>--v1.2.0` for the others; a missing `aspire--vX.Y.Z` for the current version is added on any later run),
- packages `plugins/<name>` as `<name>-1.2.0.zip` with a `.sha256`,
- publishes a GitHub Release using that plugin's changelog section as notes. The repository's Latest release stays on `aspire`.

Customers on the official channel receive 1.2.0 on their next marketplace update. The Anthropic directory picks it up on its own schedule after screening. Delete the release branch. Do not merge `main` back into `develop`; nothing on `main` is needed there.

### Version bump guide

| Bump | When |
| --- | --- |
| Patch `1.2.x` | Copy, reference docs, tool-list refresh, bug fix with no behavior change users must learn |
| Minor `1.x.0` | New agent, new skill section, new tool used, new question in a flow |
| Major `x.0.0` | Renamed skill or agent, changed command, removed capability, changed connector |

### Docs-only changes to main

README, CONTRIBUTING, CI, and this runbook may change on `main` without a version bump. The gate only demands a bump for a plugin whose folder differs from `main`. Route such changes through `develop` first when possible so the branches stay aligned; a direct `release/*` PR is acceptable for urgent doc fixes.

## 6. Hotfixes

A bug in the released version that cannot wait for the next planned release:

1. Fix it on `develop` first through the normal PR. Beta gets it immediately.
2. `git checkout -b hotfix/1.2.1 origin/main`, `git cherry-pick <fix-commit>`.
3. Bump the version of the plugin the fix touches to `1.2.1` (and the top-level `version` for `aspire`), add the `## [1.2.1]` entry to that plugin's changelog, commit.
4. PR into `main`. Same gate, same automatic release.

If the fix cannot be cherry-picked cleanly, cut a normal release branch instead and ship everything on `develop`.

## 7. Rolling back

The official channel is pinned by version, so a rollback is a forward release that restores the previous content:

```bash
git checkout -b hotfix/1.2.2 origin/main
git checkout v1.2.0 -- plugins/aspire       # restore the last good plugin tree (<name>--v1.2.0 -- plugins/<name> for the others)
# bump that plugin to 1.2.2, its changelog: "Reverts 1.2.1; restores 1.2.0 behavior"
```

Never delete or move a published tag, and never force-push `main`. Customers who already fetched a version keep it until a higher version appears.

For beta, revert the offending commit on `develop` (`git revert`, PR, merge). The mirror follows automatically.

## 8. The internal mirror

- Workflow: `.github/workflows/mirror.yml` on the public repo. Trigger: push to `develop`, or manual **Run workflow**.
- Auth: a write deploy key on `claude-plugin-internal`; the private half is the `MIRROR_DEPLOY_KEY` Actions secret on the public repo.
- Behavior: `git push --force` of `develop` to the mirror's `main`.

Operations:

| Task | How |
| --- | --- |
| Confirm the mirror is current | Compare `claude-plugin-internal/main` HEAD with `claude-plugin/develop` HEAD. They must match. |
| Force a re-sync | Actions, **Mirror to internal**, **Run workflow** on `develop`. |
| Rotate the deploy key | `ssh-keygen -t ed25519 -N "" -f mirror_key`; `gh repo deploy-key add mirror_key.pub -R aspire-atlas/claude-plugin-internal --allow-write --title "mirror"`; `gh secret set MIRROR_DEPLOY_KEY -R aspire-atlas/claude-plugin < mirror_key`; delete the old key from the mirror's Settings, Deploy keys; shred the local key files. |
| Point staff at official instead of beta | Change `branches: [develop]` to `branches: [main]` in `mirror.yml` (on both branches) and run the workflow once. |
| Add the mirror to the org catalog | claude.ai admin console, Plugins, **Sync from GitHub**, choose `aspire-atlas/claude-plugin-internal`. The Claude GitHub App must be installed on that repo. Set the install preference (Available, Installed by default, or Required). |

Because the mirror is overwritten wholesale, it carries the `develop` copy of every file, including this runbook and a `marketplace.json` named `aspire-atlas-beta`. That is expected.

## 9. Rules for the plugin's content

These are product and safety commitments. A PR that breaks one is blocked in review regardless of CI.

- Every Atlas write is confirmed through `AskUserQuestion` before it runs, except in the orchestrator's hourly run, where an Editor's approval on the Next actions page stands in for it, for Atlas records and mailbox drafts only (`references/orchestrator.md` **4**), and where its own bookkeeping findings on the `orchestrator-` prefix (run, plan, packet, execution, page) are written under the standing approval its setup (X6) gave, as a cadence record is. Widening that list (sends, orders, store changes) is a security posture change: a deliberate decision, a SECURITY.md update, and a major version. Destructive tools (`delete_profile`, `unlink_channel`, superseding or retracting a calibration, removing hashtags, changing the brand instruction) each get their own confirmation with the safe option listed first, and never run during onboarding on the skill's own initiative.
- Scheduled (unattended) runs never ask questions, never run destructive tools, and deliver only to destinations saved during setup. The one exception to the no-discovery rule is `atlas-creator-discovery`: its saved cadence record is the standing approval to search Atlas and the creator marketplace on every run, including scheduled ones. Every other scheduled run starts no discovery work.
- Never show internal ids, slugs, field names, or tool names to users. Handles (`@name`) are the anchor.
- Re-verify the tool surface against the live Atlas server before each official release; `scripts/check-tool-contract.sh` checks the markdown of every plugin. Update `plugins/aspire/skills/aspire/references/atlas-tools.md` (and `plugins/aspire/skills/org-admin/references/org-admin-tools.md` for the admin connector) and treat any unlisted state-changing tool as destructive until documented.
- No secrets, customer names, customer handles, or internal URLs in any file. CI scans for credential patterns; a hit is a blocker.
- The plugin is markdown and JSON, plus one Claude Code mod added by deliberate decision in 4.0.0: the TypeScript function-hooks module in `plugins/aspire/hooks/` (with its `*.test.ts` and `*.test.tsx` tests) and its state contract in `plugins/aspire/types/index.d.ts`. The mod stays as `SECURITY.md` describes it: inert until an Aspire event (`/aspire` typed or run, an Atlas tool result, or an `aspire:*` agent starting), reading only what already passes through the session, registering no tool but `aspire_progress` (which only moves its progress bar), changing no tool call, result, prompt, or agent, and making no network, file, or process calls. A PR that touches it is reviewed against the hooks and calls `claude plugin validate plugins/aspire` lists, and runs `claude plugin test plugins/aspire`. Function hooks are an early-access Claude Code API; re-test the mod on the current Claude Code before each official release and update the tested version in `SECURITY.md` and the plugin README. No script files and no binaries. Python snippets written out inside markdown are allowed when they follow the snippet rules in `SECURITY.md`: standard library and Pillow only, no other programs started, nothing installed, network reads limited to what the flow names, and no files written beyond what those rules list. A new snippet is reviewed against those rules in its PR. Widening what the mod does, any other hook, a script file, a binary, or a snippet that breaks the rules changes the security posture of every install and needs a deliberate decision, a SECURITY.md update, and a major version.
- Keep each plugin's `name`. Renaming `aspire` breaks `/aspire:aspire` for every existing user; if a rename is ever unavoidable, add the old name to a `renames` map in `marketplace.json` and ship it as a major version.
- The mod rules above are written for `aspire`'s mod. Another plugin ships no hooks, mod, or script files unless a deliberate decision adds them, with its own `SECURITY.md` section and the same review.

## 10. Anthropic plugin directory

- Submission (one time): https://claude.ai/admin-settings/directory/submissions/plugins/new with the public repo URL. Requires an Owner on the Aspire Team or Enterprise org. Track status at https://claude.ai/admin-settings/directory/submissions.
- After approval, the directory mirrors `main` and screens each update automatically. No re-submission for new versions.
- Governing documents: the Anthropic Software Directory Terms and Policy. Practical implications: keep the description narrow and accurate, keep the connector list to what the plugin uses (three: Aspire Atlas for data and Aspire Atlas Organization Admin for organization members, both on atlas.aspire.io, and the optional Meta Ads connector at mcp.facebook.com/ads), and respond to Anthropic within a reasonable time if they flag something.
- Optional but worth doing: submit the Atlas MCP server to the Connectors Directory. A plugin that bundles a directory-listed connector shows fewer install warnings and has a better chance at the Anthropic Verified badge.

## 11. Access and permissions

| What | Where | Minimum role |
| --- | --- | --- |
| Merge to `develop` | Public repo | Write, plus one approving review |
| Merge to `main` | Public repo | Write, plus one approving review, `validate` and `gate` green |
| Change branch protection, secrets, deploy keys | Public repo Settings | Admin |
| Org marketplace settings | claude.ai admin console | Org Owner or Primary Owner |
| Directory submission | claude.ai admin console | Org Owner (or delegated directory role) |

Branch protection on both branches: PRs required, 1 approval, stale reviews dismissed, conversations resolved, no force pushes, no deletions. Admins are not exempt by policy; they can technically bypass, and should not.

## 12. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Validate` fails on `develop` with "marketplace name is 'aspire-atlas'" | Someone merged `main` into `develop`, or copied `main`'s `marketplace.json`. | Restore the develop copy: `git checkout origin/develop~N -- .claude-plugin/marketplace.json` from before the bad commit; commit. |
| `Validate` fails on `develop` with "<changelog> changed on develop" | Changelog edited (or created) outside a release branch. | Revert the changelog change on `develop`, or make it identical to `main`'s copy. Write notes on the release branch. |
| `Release gate` fails: "plugins/<name> changed but its version is still X" | Forgot that plugin's bump. | Bump that plugin's entry in `marketplace.json` and write its changelog entry, push to the release branch. |
| `Validate` fails on `main`: "changed since tag <tag> but version is still X" | Plugin content reached `main` without a version bump (usually a direct push). | Cut `hotfix/X.Y.Z+1`, bump that plugin, changelog, PR. |
| `Validate` fails: "plugins/<name> has no entry" or "source must be ./plugins/<name>" | A plugin folder without a marketplace entry, or an entry pointing elsewhere. | Add the entry with `"source": "./plugins/<name>"`, or move the folder. |
| Merge conflict on `marketplace.json` when merging `develop` into a release branch | The release branch was cut from `develop` instead of `main`, or `develop` edited channel lines. | Recreate the branch from `origin/main` and merge `develop` into it. |
| Beta users do not see a new commit | Their marketplace cache is stale. | `/plugin marketplace update aspire-atlas-beta`, or enable auto-update for that marketplace. |
| Customers do not see a new release | Version string unchanged, or the `Release` workflow did not run. | Check the Actions tab on `main`; confirm the tag exists; confirm the version differs from the prior release. |
| Staff do not see a new commit in the org catalog | Mirror lag or org sync not run. | Check `Mirror to internal` run; then trigger the marketplace sync in the claude.ai admin console. |
| "Repository missing" in claude.ai Sync from GitHub | Claude GitHub App not installed on the mirror, or the repo is public. | Install the app on `claude-plugin-internal`; keep it private. |
| Two copies of one plugin loaded, one with a warning | User installed from both channels. | Uninstall one; keep a single channel per user. |

## 13. Quick reference

```bash
# feature
git checkout -b feat/x develop && ... && gh pr create --base develop

# release
git checkout -b release/X.Y.Z origin/main && git merge origin/develop
git diff --stat origin/main -- plugins/   # which plugins changed
# bump those plugins' versions in .claude-plugin/marketplace.json, write each one's changelog entry
bash scripts/check-channel.sh main && git commit -am "Release X.Y.Z"
gh pr create --base main --label release

# hotfix
git checkout -b hotfix/X.Y.Z origin/main && git cherry-pick <sha>
# bump, changelog, PR to main

# local checks
claude plugin validate . && for d in plugins/*/; do claude plugin validate "$d"; done
bash scripts/check-channel.sh develop   # or main
```

## 14. Adding a plugin

Everything in this repository ships to customers. A plugin meant only for Aspire's own team does not go here: it belongs in a separate private repository with its own marketplace (see `CLAUDE.md`).

1. Branch from `develop` as for any feature.
2. Create `plugins/<name>/` with `.claude-plugin/plugin.json` (`name`, `displayName`, `description`, `author`, `homepage`, `repository`, `license`; no `version`), a `README.md`, and its `skills/`. Agents are named `atlas-<name>.md`; list each in a skill's agent hand-off and Model tiers tables and in the plugin README's agent table, as `aspire` does.
3. Share files with `aspire` by symbolic link, never by copy. Every agent carries the artifact standard's agent block verbatim, and that block names `${CLAUDE_PLUGIN_ROOT}/skills/aspire/references/artifact-standard.md`, so the plugin links that path and the two animated marks in `assets/` to `aspire`'s files:
   ```bash
   mkdir -p plugins/<name>/skills/aspire/references plugins/<name>/assets
   ln -s ../../../../aspire/skills/aspire/references/artifact-standard.md plugins/<name>/skills/aspire/references/
   ln -s ../../aspire/assets/aspire-animated.svg ../../aspire/assets/aspire-animated-small.svg plugins/<name>/assets/
   ```
   The checks require real links to `aspire`'s files; a copy fails. Claude Code copies the target of a link that stays inside the marketplace when it installs the plugin, and the release zip stores the target's contents. Before the plugin's first official release, install it from the org catalog (through the mirror) and from a release zip, and confirm the linked files arrive there too.
4. Add its entry to `.claude-plugin/marketplace.json` on `develop`: `name`, `"source": "./plugins/<name>"`, `displayName` with " (beta)", `description`, and the same metadata fields `aspire`'s entry carries. No `version`, and no changelog yet. Until its first release, every release branch holds it back (section 5).
5. Connectors: a plugin bundles only connectors it uses, in its own `.mcp.json`. Adding an Aspire connector is a deliberate decision (see `CLAUDE.md`).
6. Add a row to the root `README.md` plugin table.
7. Run the checks in section 4. They loop over every plugin, so a new plugin is checked from its first commit.
8. First release: on the release branch, add its `version` and a `displayName` without " (beta)" to `main`'s entry, and create `plugins/<name>/CHANGELOG.md` with its `## [1.0.0] - YYYY-MM-DD` entry. The `Release` workflow tags `<name>--v1.0.0`. If it should be listed in the Anthropic plugin directory, confirm with the directory submission page how a second plugin in this repository is listed before announcing it.
