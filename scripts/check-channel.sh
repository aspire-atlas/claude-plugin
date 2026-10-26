#!/usr/bin/env bash
# Enforces the two-channel contract.
#
#   develop  -> marketplace "aspire-atlas-beta", NO version anywhere.
#               Claude resolves the version to the commit SHA, so every commit
#               reaches beta users.
#   main     -> marketplace "aspire-atlas", every plugin entry pinned to its
#               own release semver X.Y.Z (no prerelease), recorded in that
#               plugin's changelog (scripts/plugins.sh says which file).
#
# plugin.json must never carry a version on either branch: each plugin's
# marketplace entry on main is the single source of truth, which keeps
# develop -> main merges conflict-free. Every plugin lives in plugins/<name>/.
# On develop every folder there is listed; on main a folder without an entry is
# a plugin held back from the official channel until its first release.
#
# Usage: scripts/check-channel.sh <develop|main>
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

channel="${1:?usage: check-channel.sh <develop|main>}"
M=.claude-plugin/marketplace.json
fail=0
err() { echo "FAIL $*"; fail=1; }

name=$(jq -r '.name' "$M")
mver=$(jq -r '.version // empty' "$M")
count=$(jq '.plugins | length' "$M")

case "$channel" in
  develop)
    [[ "$name" == "aspire-atlas-beta" ]] || err "marketplace name is '$name', expected 'aspire-atlas-beta' on develop"
    [[ -z "$mver" ]] || err "marketplace.json must not set a top-level version on develop"
    ;;
  main)
    [[ "$name" == "aspire-atlas" ]] || err "marketplace name is '$name', expected 'aspire-atlas' on main"
    # The top-level version is optional; while it is there it follows aspire's.
    aver=$(jq -r '.plugins[] | select(.name == "aspire") | .version // empty' "$M")
    [[ -z "$mver" || "$mver" == "$aver" ]] || err "marketplace.json top-level version '$mver' must equal aspire's version '$aver' on main (or be removed)"
    ;;
  *) echo "unknown channel '$channel'"; exit 2 ;;
esac

for d in plugins/*/; do
  d=${d%/}
  if ! jq -e --arg s "./$d" '.plugins[] | select(.source == $s)' "$M" >/dev/null; then
    if [[ "$channel" == main ]]; then echo "HELD $d has no entry on main, so it is not released yet"
    else err "$d has no entry in $M"; fi
  fi
done

for i in $(seq 0 $((count - 1))); do
  pname=$(jq -r ".plugins[$i].name" "$M")
  src=$(jq -r ".plugins[$i].source" "$M")
  ever=$(jq -r ".plugins[$i].version // empty" "$M")
  pj="$src/.claude-plugin/plugin.json"

  [[ "$src" == "./plugins/$pname" ]] || { err "$pname: source must be \"./plugins/$pname\" (plugins live in this repository), got $src"; continue; }

  [[ -f "$pj" ]] || { err "$pname: $pj missing"; continue; }
  [[ "$(jq -r '.name' "$pj")" == "$pname" ]] || err "$pname: plugin.json name differs from marketplace entry"
  [[ -z "$(jq -r '.version // empty' "$pj")" ]] || err "$pname: plugin.json must not carry a version (marketplace entry on main is the source of truth)"

  while IFS= read -r skill; do
    if awk '/^---$/{c++; next} c==1' "$skill" | grep -qE '^[[:space:]]+version:'; then
      err "$pname: $skill frontmatter carries a version; remove it"
    fi
  done < <(find "$src/skills" -name SKILL.md 2>/dev/null)

  case "$channel" in
    develop)
      [[ -z "$ever" ]] || err "$pname: marketplace entry must not set version on develop (beta tracks commits)"
      ;;
    main)
      [[ "$ever" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || err "$pname: marketplace entry version '$ever' must be release semver X.Y.Z (to hold the plugin back instead, remove its entry on the release branch)"
      cl=$(plugin_changelog "$pname")
      grep -q "^## \[$ever\]" "$cl" 2>/dev/null || err "$pname: $cl has no '## [$ever]' entry"
      latest_tag=$(plugin_latest_tagged "$pname")
      if [[ -n "$latest_tag" && -n "$ever" ]]; then
        highest=$(printf '%s\n%s\n' "$latest_tag" "$ever" | sort -V | tail -1)
        [[ "$highest" == "$ever" ]] || err "$pname: version $ever is lower than its latest tag $(plugin_tag "$pname" "$latest_tag")"
      fi
      # A version may already be tagged only if that tag is this very commit
      # (the release workflow tags main right after the merge lands).
      tag=$(plugin_tag "$pname" "$ever")
      if [[ -n "$ever" ]] && git rev-parse -q --verify "refs/tags/$tag^{commit}" >/dev/null 2>&1; then
        if [[ "$(git rev-parse "$tag^{commit}")" != "$(git rev-parse HEAD)" ]]; then
          # Docs, CI and repo housekeeping may land on main without a bump.
          # Plugin content may not: anything under the plugin folder that
          # differs from the tagged release requires a new version.
          # Plugin paths hold no spaces (check above), so the pathspecs split safely.
          # shellcheck disable=SC2046
          if ! git diff --quiet "$tag" HEAD -- $(plugin_content "$pname"); then
            err "$pname: $src changed since tag $tag but version is still $ever. Bump it."
          fi
        fi
      fi
      ;;
  esac
  [[ $fail -eq 0 ]] && echo "OK   $pname channel=$channel version=${ever:-<commit sha>}"
done
exit $fail
