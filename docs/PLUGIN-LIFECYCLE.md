# Aspire Atlas plugin: development and lifecycle runbook

How the `aspire` Claude plugin is developed, tested, shipped to beta, released to customers, mirrored to Aspire staff, and rolled back. This is the authoritative operating document; `CONTRIBUTING.md` summarizes it.

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

Both channels install a plugin named `aspire` with the `/aspire:aspire` skill and the four `aspire:atlas-*` agents. A user should be on one channel at a time; two installs of the same plugin name make Claude load one and warn about the other.

### The single-version rule

The plugin version lives in exactly one place: `plugins[0].version` (and the matching top-level `version`) in `.claude-plugin/marketplace.json`, and only on `main`.

- `plugins/aspire/.claude-plugin/plugin.json` never has a `version` field.
- `skills/aspire/SKILL.md` frontmatter never has a `version` field.
- `develop`'s `marketplace.json` never has any `version` field.

CI (`scripts/check-channel.sh`) fails the build if any of these are violated. The reason: Claude resolves a plugin's version as marketplace entry, then `plugin.json`, then commit SHA. Keeping the field out of shared files is what lets `develop` track commits while `main` stays pinned, and what keeps merges between the branches conflict-free.

### Files that differ between the branches

Only `.claude-plugin/marketplace.json` (the `name`, `description`, `displayName`, and `version` lines). Everything else is identical or flows from `develop` to `main` unchanged. Two rules follow:

- On `develop`, never edit those lines of `marketplace.json`.
- On `develop`, never edit `CHANGELOG.md`. Release branches own it. CI fails a `develop` push whose changelog differs from both the merge base and `main`.

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
   claude plugin validate plugins/aspire
   bash scripts/check-channel.sh develop
   ```
4. Open a PR into `develop`. Required: one approval, the `validate` check green, conversations resolved.
5. Merge. Within about a minute:
   - `Validate` runs on `develop`.
   - `Mirror to internal` force-pushes `develop` to `claude-plugin-internal/main`.
   - Beta customers see the new commit on their next `/plugin marketplace update aspire-atlas-beta`.
   - Aspire staff see it after the org marketplace's next sync (claude.ai admin console, Plugins, the marketplace's **Sync** or **Update** action).

There is no version to bump and no changelog to write for beta work. Commit messages are the beta release notes; keep them descriptive.

## 5. Releasing to customers (main)

Release branches are cut **from `main`** and pull `develop` in. That direction is what keeps the merge clean, because `main` owns the channel lines in `marketplace.json` and all of `CHANGELOG.md`, and `develop` never touches either.

```bash
git fetch origin
git checkout -b release/1.2.0 origin/main
git merge origin/develop                  # expect: no conflicts
git log origin/main..origin/develop --oneline   # what you are shipping
```

Then edit two files:

1. `.claude-plugin/marketplace.json`: set the top-level `version` and `plugins[0].version` to `1.2.0`.
2. `CHANGELOG.md`: add `## [1.2.0] - YYYY-MM-DD` under `## [Unreleased]` with Added / Changed / Fixed subsections, and update the two compare links at the bottom.

```bash
bash scripts/check-channel.sh main        # must print OK
git commit -am "Release 1.2.0"
git push -u origin release/1.2.0
gh pr create --base main --label release --title "Release 1.2.0"
```

The `Release gate` check blocks the merge unless all of these hold:

- Source branch is `release/*`, `develop`, or `hotfix/*`.
- If anything under `plugins/` changed, the version is higher than `main`'s current version.
- `CHANGELOG.md` has a dated entry for that version and nothing is left under Unreleased.

Merge with a **merge commit** (not squash), so `main` records that it contains `develop`. On merge, the `Release` workflow:

- tags `v1.2.0` at the merge commit,
- packages `plugins/aspire` as `aspire-1.2.0.zip` with a `.sha256`,
- publishes the GitHub Release using the changelog section as notes.

Customers on the official channel receive 1.2.0 on their next marketplace update. The Anthropic directory picks it up on its own schedule after screening. Delete the release branch. Do not merge `main` back into `develop`; nothing on `main` is needed there.

### Version bump guide

| Bump | When |
| --- | --- |
| Patch `1.2.x` | Copy, reference docs, tool-list refresh, bug fix with no behavior change users must learn |
| Minor `1.x.0` | New agent, new skill section, new tool used, new question in a flow |
| Major `x.0.0` | Renamed skill or agent, changed command, removed capability, changed connector |

### Docs-only changes to main

README, CONTRIBUTING, CI, and this runbook may change on `main` without a version bump. The gate only demands a bump when files under `plugins/` differ from the last tag. Route such changes through `develop` first when possible so the branches stay aligned; a direct `release/*` PR is acceptable for urgent doc fixes.

## 6. Hotfixes

A bug in the released version that cannot wait for the next planned release:

1. Fix it on `develop` first through the normal PR. Beta gets it immediately.
2. `git checkout -b hotfix/1.2.1 origin/main`, `git cherry-pick <fix-commit>`.
3. Bump both version fields to `1.2.1`, add the `## [1.2.1]` changelog entry, commit.
4. PR into `main`. Same gate, same automatic release.

If the fix cannot be cherry-picked cleanly, cut a normal release branch instead and ship everything on `develop`.

## 7. Rolling back

The official channel is pinned by version, so a rollback is a forward release that restores the previous content:

```bash
git checkout -b hotfix/1.2.2 origin/main
git checkout v1.2.0 -- plugins/aspire       # restore the last good plugin tree
# bump to 1.2.2, changelog: "Reverts 1.2.1; restores 1.2.0 behavior"
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

- Every Atlas write is confirmed through `AskUserQuestion` before it runs. Destructive tools (`delete_profile`, `unlink_channel`, superseding or retracting a calibration, removing hashtags, changing the brand instruction) each get their own confirmation with the safe option listed first, and never run during onboarding on the skill's own initiative.
- Paid discovery (`lookup_*`, marketplace search) runs only on the user's explicit choice.
- Scheduled (unattended) runs never ask questions, never run destructive or paid tools, and deliver only to destinations saved during readout setup.
- Never show internal ids, slugs, field names, or tool names to users. Handles (`@name`) are the anchor.
- Re-verify the tool surface against the live Atlas server before each official release; update `plugins/aspire/skills/aspire/references/atlas-tools.md` and treat any unlisted state-changing tool as destructive until documented.
- No secrets, customer names, customer handles, or internal URLs in any file. CI scans for credential patterns; a hit is a blocker.
- The plugin stays markdown and JSON only: no hooks, no scripts, no binaries. Adding any of these changes the security posture of every install and needs a deliberate decision, a SECURITY.md update, and a major version.
- Keep the plugin `name` as `aspire`. Renaming it breaks `/aspire:aspire` for every existing user.

## 10. Anthropic plugin directory

- Submission (one time): https://claude.ai/admin-settings/directory/submissions/plugins/new with the public repo URL. Requires an Owner on the Aspire Team or Enterprise org. Track status at https://claude.ai/admin-settings/directory/submissions.
- After approval, the directory mirrors `main` and screens each update automatically. No re-submission for new versions.
- Governing documents: the Anthropic Software Directory Terms and Policy. Practical implications: keep the description narrow and accurate, keep the connector list to what the plugin uses (one: Atlas), and respond to Anthropic within a reasonable time if they flag something.
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
| `Validate` fails on `develop` with "CHANGELOG.md changed on develop" | Changelog edited outside a release branch. | Revert the changelog change on `develop`, or make it identical to `main`'s copy. Write notes on the release branch. |
| `Release gate` fails: "Plugin content changed but version is still X" | Forgot the bump. | Edit both version fields in `marketplace.json`, push to the release branch. |
| `Validate` fails on `main`: "changed since tag vX but version is still X" | Plugin content reached `main` without a version bump (usually a direct push). | Cut `hotfix/X.Y.Z+1`, bump, changelog, PR. |
| Merge conflict on `marketplace.json` when merging `develop` into a release branch | The release branch was cut from `develop` instead of `main`, or `develop` edited channel lines. | Recreate the branch from `origin/main` and merge `develop` into it. |
| Beta users do not see a new commit | Their marketplace cache is stale. | `/plugin marketplace update aspire-atlas-beta`, or enable auto-update for that marketplace. |
| Customers do not see a new release | Version string unchanged, or the `Release` workflow did not run. | Check the Actions tab on `main`; confirm the tag exists; confirm the version differs from the prior release. |
| Staff do not see a new commit in the org catalog | Mirror lag or org sync not run. | Check `Mirror to internal` run; then trigger the marketplace sync in the claude.ai admin console. |
| "Repository missing" in claude.ai Sync from GitHub | Claude GitHub App not installed on the mirror, or the repo is public. | Install the app on `claude-plugin-internal`; keep it private. |
| Two `aspire` plugins loaded, one with a warning | User installed from both channels. | Uninstall one; keep a single channel per user. |

## 13. Quick reference

```bash
# feature
git checkout -b feat/x develop && ... && gh pr create --base develop

# release
git checkout -b release/X.Y.Z origin/main && git merge origin/develop
# bump versions in .claude-plugin/marketplace.json, write CHANGELOG entry
bash scripts/check-channel.sh main && git commit -am "Release X.Y.Z"
gh pr create --base main --label release

# hotfix
git checkout -b hotfix/X.Y.Z origin/main && git cherry-pick <sha>
# bump, changelog, PR to main

# local checks
claude plugin validate . && claude plugin validate plugins/aspire
bash scripts/check-channel.sh develop   # or main
```
