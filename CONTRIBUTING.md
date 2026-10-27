# Contributing

Authoritative runbook: [docs/PLUGIN-LIFECYCLE.md](docs/PLUGIN-LIFECYCLE.md). This file is the short version.

## Branches and channels

| Branch | Marketplace name | Version | Who gets it |
| ------ | ---------------- | ------- | ----------- |
| `develop` | `aspire-atlas-beta` | none; Claude uses the commit SHA, so every commit ships | Beta users who added `...claude-plugin.git#develop` |
| `main` | `aspire-atlas` | each plugin pinned to its own `X.Y.Z` in `marketplace.json` | Everyone who added `aspire-atlas/claude-plugin`; the Anthropic plugin directory mirrors this branch |

Rules that make this work:

- All work lands on `develop` through pull requests. `main` only receives PRs from `release/*`, `develop`, or `hotfix/*`.
- `plugin.json` and `SKILL.md` never carry a version. Each plugin's one version field is its own `plugins[].version` entry in `.claude-plugin/marketplace.json`, and only on `main`. Plugins are versioned and released independently.
- `develop` never edits the marketplace lines that differ by channel (the top-level `name` and `description`, each plugin's `displayName`, and `version`), and never edits a changelog (`CHANGELOG.md` for `aspire`, `plugins/<name>/CHANGELOG.md` for the others). The plugin entry's `description` is shared: keep it identical on both branches. CI fails a develop PR that touches the changelog. Release branches own both. That is what keeps merges conflict-free.
- Do not merge `main` back into `develop`. Hotfixes go to `develop` first, then to `main` via `hotfix/*` (cut from `main`, cherry-pick the fix, bump the patch version) if they cannot wait for the next release.

## Layout

```
.claude-plugin/marketplace.json   Catalog. Differs per branch (see above).
plugins/<name>/                   One plugin per folder; every folder has a marketplace entry with "source": "./plugins/<name>".
  .claude-plugin/plugin.json      Manifest. `name` must match the marketplace entry. No version.
  CHANGELOG.md                    Official releases of this plugin (aspire's is the root CHANGELOG.md).
  .mcp.json                       Bundled connectors.
  skills/<skill>/SKILL.md         Skills. Namespaced as /<plugin>:<skill>.
  agents/*.md                     Subagents. Namespaced as <plugin>:<agent>.
scripts/plugins.sh                The per-plugin conventions (folder, changelog, tag) the checks and workflows share.
scripts/check-*.sh                Channel contract and content checks; each loops over every plugin. CI runs them on every push and PR.
CHANGELOG.md                      Official releases of aspire only.
```

## Local testing

```bash
claude plugin validate .
for d in plugins/*/; do claude plugin validate "$d"; done
bash scripts/check-channel.sh develop   # or: main
bash scripts/check-tool-contract.sh
bash scripts/check-agent-roster.sh
bash scripts/check-artifact-standard.sh
bash scripts/check-palette.sh
```

Try the plugin from a checkout in Claude Code:

```shell
/plugin marketplace add ./path/to/claude-plugin
/plugin install aspire@aspire-atlas-beta
```

## Shipping to beta

Merge a PR into `develop`. That is the whole step. CI validates the manifests and the channel contract; beta users pick it up on their next marketplace update.

## Releasing to the official channel

The release branch is cut from `main` and pulls `develop` in. That direction matters: `main` owns the channel lines in `marketplace.json` and the changelogs, `develop` never touches either, so the merge is always clean. A release bumps only the plugins whose folder changed (`git diff --stat main -- plugins/`), each in its own entry and its own changelog.

```bash
git checkout -b release/1.1.0 main
git merge develop                       # clean: develop never edits marketplace.json channel lines or CHANGELOG
# for each changed plugin: bump its entry's version in .claude-plugin/marketplace.json (aspire: the top-level version too)
# and write its ## [1.1.0] - YYYY-MM-DD changelog section from: git log main..develop --oneline -- plugins/<name>
git commit -am "Release 1.1.0"
git push -u origin release/1.1.0
gh pr create --base main --label release --title "Release 1.1.0"
```

1. The **Release gate** workflow blocks the merge unless: the source is `release/*`, `develop`, or `hotfix/*`; each plugin whose folder changed, or that is new on `main`, has a version higher than `main`'s (docs and CI-only PRs may skip the bump); and each released plugin's changelog has a dated entry with nothing left under Unreleased.
2. Merge with a merge commit (not squash, so `main` records that it contains `develop`). For each plugin whose version is not tagged yet, the **Release** workflow tags it (`v1.1.0` and `aspire--v1.1.0` for aspire, `<name>--v1.1.0` for the others), packages a zip with a SHA-256, and publishes a GitHub Release with that plugin's changelog section as notes. Delete the release branch.
3. Do not merge `main` back into `develop`. Nothing on `main` is needed there.

Version bumps: **patch** for copy and reference fixes, **minor** for a new agent, skill section, or tool, **major** for a change that alters how existing users invoke or configure the plugin.

## Adding a plugin

Follow section 14 of [docs/PLUGIN-LIFECYCLE.md](docs/PLUGIN-LIFECYCLE.md). Only plugins for customers go in this repository; a plugin meant only for Aspire's own team gets its own private repository. A plugin not ready for the official channel is held back on release branches by removing its marketplace entry there (section 5 of the runbook).

## Branch protection

Run once after the repo exists (requires `gh` with admin rights):

```bash
bash scripts/bootstrap-github.sh
```

It sets `main` as default, requires PRs plus the `validate` and `gate` checks on `main`, requires PRs plus `validate` on `develop`, and blocks force pushes.

## Rules for skills and agents

- Every Atlas write is confirmed through `AskUserQuestion` first. Destructive tools each get their own confirmation with the safe option listed first.
- Unattended runs never ask and never destroy. Only `atlas-creator-discovery` may start discovery work on a schedule, under a saved cadence record.
- Never show internal ids, slugs, or tool names to the user. Handles (`@name`) are the anchor.
- Re-verify the tool surface against the live server before each official release and update `skills/aspire/references/atlas-tools.md` and `skills/org-admin/references/org-admin-tools.md`. Run `bash scripts/check-tool-contract.sh --golden <path to the server's tools-list.golden.json>`: it fails when `contract/atlas-mcp-tools.json` has drifted from the server. Refresh it with `--update` and fix what `bash scripts/check-tool-contract.sh` then flags. CI runs the offline check on every push.
- No secrets, customer names, or internal URLs in any file. CI scans for credential patterns; treat a hit as a blocker.

## Internal mirror (Aspire staff)

Org-managed plugin marketplaces in claude.ai accept private repositories only, and this repo is public for the Anthropic directory. The **Mirror to internal** workflow force-pushes `develop` to the private repo `aspire-atlas/claude-plugin-internal` on every push, and the org marketplace syncs from there. Staff therefore run the beta channel. Never commit to the mirror; it is overwritten on the next push. Auth is a write deploy key on the mirror, stored as the `MIRROR_DEPLOY_KEY` secret here.
