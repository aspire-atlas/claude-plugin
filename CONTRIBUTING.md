# Contributing

## Branches and channels

| Branch | Marketplace name | Version | Who gets it |
| ------ | ---------------- | ------- | ----------- |
| `develop` | `aspire-atlas-beta` | none; Claude uses the commit SHA, so every commit ships | Beta users who added `...claude-plugin.git#develop` |
| `main` | `aspire-atlas` | pinned `X.Y.Z` in `marketplace.json` | Everyone who added `aspire-atlas/claude-plugin`; the Anthropic plugin directory mirrors this branch |

Rules that make this work:

- All work lands on `develop` through pull requests. `main` only receives PRs from `release/*`, `develop`, or `hotfix/*`.
- `plugin.json` and `SKILL.md` never carry a version. The one version field is `plugins[].version` in `.claude-plugin/marketplace.json`, and only on `main`.
- `develop` never edits the marketplace `name`, `description`, `displayName`, or `version` lines, and never edits `CHANGELOG.md`. CI fails a develop PR that touches the changelog. Release branches own both. That is what keeps merges conflict-free.
- Do not merge `main` back into `develop`. Hotfixes go to `develop` first, then to `main` via `hotfix/*` (cut from `main`, cherry-pick the fix, bump the patch version) if they cannot wait for the next release.

## Layout

```
.claude-plugin/marketplace.json   Catalog. Differs per branch (see above).
plugins/<name>/                   One plugin per folder.
  .claude-plugin/plugin.json      Manifest. `name` must match the marketplace entry. No version.
  .mcp.json                       Bundled connectors.
  skills/<skill>/SKILL.md         Skills. Namespaced as /<plugin>:<skill>.
  agents/*.md                     Subagents. Namespaced as <plugin>:<agent>.
scripts/check-channel.sh          Channel contract; CI runs it on every push and PR.
CHANGELOG.md                      Official releases only.
```

## Local testing

```bash
claude plugin validate .
claude plugin validate plugins/aspire
bash scripts/check-channel.sh develop   # or: main
```

Try the plugin from a checkout in Claude Code:

```shell
/plugin marketplace add ./path/to/claude-plugin
/plugin install aspire@aspire-atlas-beta
```

## Shipping to beta

Merge a PR into `develop`. That is the whole step. CI validates the manifests and the channel contract; beta users pick it up on their next marketplace update.

## Releasing to the official channel

The release branch is cut from `main` and pulls `develop` in. That direction matters: `main` owns the channel lines in `marketplace.json` and all of `CHANGELOG.md`, `develop` never touches either, so the merge is always clean.

```bash
git checkout -b release/1.1.0 main
git merge develop                       # clean: develop never edits marketplace.json channel lines or CHANGELOG
# bump the two version fields (top-level and plugins[0]) in .claude-plugin/marketplace.json
# write the ## [1.1.0] - YYYY-MM-DD section in CHANGELOG.md from: git log main..develop --oneline
git commit -am "Release 1.1.0"
git push -u origin release/1.1.0
gh pr create --base main --label release --title "Release 1.1.0"
```

1. The **Release gate** workflow blocks the merge unless: the source is `release/*`, `develop`, or `hotfix/*`; the version is higher than what `main` has whenever anything under `plugins/` changed (docs and CI-only PRs may skip the bump); and CHANGELOG has a dated entry with nothing left under Unreleased.
2. Merge with a merge commit (not squash, so `main` records that it contains `develop`). The **Release** workflow tags `v1.1.0`, packages a zip with a SHA-256, and publishes the GitHub Release with the changelog section as notes. Delete the release branch.
3. Do not merge `main` back into `develop`. Nothing on `main` is needed there.

Version bumps: **patch** for copy and reference fixes, **minor** for a new agent, skill section, or tool, **major** for a change that alters how existing users invoke or configure the plugin.

## Branch protection

Run once after the repo exists (requires `gh` with admin rights):

```bash
bash scripts/bootstrap-github.sh
```

It sets `main` as default, requires PRs plus the `validate` and `gate` checks on `main`, requires PRs plus `validate` on `develop`, and blocks force pushes.

## Rules for skills and agents

- Every Atlas write is confirmed through `AskUserQuestion` first. Destructive tools each get their own confirmation with the safe option listed first.
- Paid discovery tools run only on the user's explicit choice.
- Never show internal ids, slugs, or tool names to the user. Handles (`@name`) are the anchor.
- Re-verify the tool surface against the live server before each official release and update `skills/aspire/references/atlas-tools.md`.
- No secrets, customer names, or internal URLs in any file. CI scans for credential patterns; treat a hit as a blocker.
