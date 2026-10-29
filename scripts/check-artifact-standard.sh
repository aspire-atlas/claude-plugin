#!/usr/bin/env bash
# Checks the artifact standard (plugins/aspire/skills/aspire/references/artifact-standard.md):
#   - the standard and both logo files exist
#   - every agent in every plugin carries the standard's agent block verbatim, and a plugin with
#     agents holds the standard, the page standard, the reader standard and the logos at the paths
#     that block and the standards name (another plugin links to aspire's files rather than copying)
#   - the page standard stays a non-command skill, its tool list matches the Atlas tool contract,
#     and its self-check script gives every fixture in scripts/fixtures/page-standard/ its result
#   - the standard's source sentence is written in that one file only, so the wording cannot drift
#   - the references that define a published page link the standard
# What an agent actually publishes is not checked here; this keeps the instructions in step.
#
#   scripts/check-artifact-standard.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

P=plugins/aspire
R=$P/skills/aspire/references
STD=$R/artifact-standard.md
fail=0
err() { echo "FAIL $*"; fail=1; }

[ -f "$STD" ] || { echo "FAIL $STD is missing"; exit 1; }
for f in "$P/assets/aspire-animated.svg" "$P/assets/aspire-animated-small.svg"; do
  [ -f "$f" ] || err "$f is missing (the standard pastes it into pages)"
done

# The canonical agent block lives in the standard; every agent in every plugin carries it verbatim.
canon=$(awk '/<!-- agent-block -->/{f=1;next} /<!-- \/agent-block -->/{f=0} f' "$STD" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
[ -n "$canon" ] || err "the standard has no <!-- agent-block --> section"
for p in $(plugin_names); do
  src=$(plugin_src "$p")
  compgen -G "$src/agents/*.md" >/dev/null || continue
  if [ "$src" != "$P" ]; then
    # The block and the standard name these paths under the plugin's own root.
    for f in skills/aspire/references/artifact-standard.md skills/page-standard/SKILL.md \
      skills/aspire/references/reader-standard.md assets/aspire-animated.svg assets/aspire-animated-small.svg; do
      [ -e "$src/$f" ] || { err "$p: $src/$f is missing; link it to $P/$f"; continue; }
      { [ -L "$src/$f" ] && [ "$src/$f" -ef "$P/$f" ]; } || err "$p: $src/$f must be a symbolic link to $P/$f, not a copy"
    done
  fi
  for f in "$src"/agents/*.md; do
    name=$(basename "$f" .md)
    mine=$(awk '/^## Artifact standard$/{f=1;print;next} f&&/^## /{f=0} f' "$f" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
    [ -n "$mine" ] || { err "$p: $name has no '## Artifact standard' block (copy it from artifact-standard.md, section 5)"; continue; }
    [ "$mine" = "$canon" ] || err "$p: $name's Artifact standard block differs from the one in artifact-standard.md"
  done
done

# The wording lives in the standard only; another plugin's link to it is the same file.
while IFS= read -r f; do
  [ "$f" -ef "$STD" ] || err "$f restates the standard's source sentence; link artifact-standard.md instead"
done < <(grep -rlF 'Data compiled via proprietary AI brand memory' plugins --include='*.md' || true)
grep -qF 'Data compiled via proprietary AI brand memory as of' "$STD" || err "the standard lost its source sentence"
grep -qF 'Not for public publishing.' "$STD" || err "the standard lost its audience line"

# References that define a published page or deck, in the aspire plugin.
for f in ad-reuse affiliate cas-campaign content-library content-review content-sourcing creator-brief creator-card \
  creator-discovery creator-profile creator-vetting deliverable-tracker fulfillment market-signal negotiation org-dashboard \
  orchestrator outreach post-analysis ppa-pitch program program-dashboard program-ledger quality-review quarterly-signal \
  readout roster-manager shops first-run agents/decision-audit agents/sample-artifact; do
  [ -f "$R/$f.md" ] || { err "$R/$f.md is missing"; continue; }
  grep -q 'artifact-standard' "$R/$f.md" || err "$f.md does not link artifact-standard.md"
done

# The page standard: a shared skill no one can call as a command, which the agent block links, and
# whose self-check script passes the good fixture and fails each bad one on the check it names.
PS=$P/skills/page-standard/SKILL.md
FX=scripts/fixtures/page-standard
if [ ! -f "$PS" ]; then
  err "$PS is missing"
else
  awk 'NR == 1 && /^---/ { fm = 1; next } fm && /^---/ { exit } fm' "$PS" | grep -qx 'user-invocable: false' ||
    err "$PS must set user-invocable: false in its frontmatter (it is never a command)"
  grep -qF 'skills/page-standard/SKILL.md' <<< "$canon" || err "the agent block does not link skills/page-standard/SKILL.md"
  [ -f "$FX/pass.html" ] || err "$FX/pass.html is missing (the page check needs a page that passes)"
  # The script's tool list matches the Atlas tool contract, so R11 catches every tool name.
  listed=$(awk '/^TOOLS = frozenset\("""/{f=1;next} f&&/^"""/{f=0} f' "$PS" | tr -s ' ' '\n' | sed '/^$/d' | sort -u)
  known=$(jq -r '.surfaces[] | keys[]' contract/atlas-mcp-tools.json | sort -u)
  [ "$listed" = "$known" ] || err "$PS's TOOLS list differs from contract/atlas-mcp-tools.json: $(diff <(echo "$known") <(echo "$listed") | grep '^[<>]' | tr '\n' ' ')"
  if command -v python3 >/dev/null; then
    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    awk '/^<!-- page-check -->$/{f=1;next} /^<!-- \/page-check -->$/{f=0} f' "$PS" | sed '1d;$d' > "$tmp/page_check.py"
    [ -s "$tmp/page_check.py" ] || err "$PS has no <!-- page-check --> script"
    # Each fixture prints exactly four results and no error: a pass*.html page fails nothing, and a
    # fail-rN*.html page fails RN and nothing else. Exit 2 means the script could not read the page.
    for f in "$FX"/*.html; do
      [ -f "$f" ] || continue
      name=${f##*/}
      out=$(python3 -I "$tmp/page_check.py" "$f" 2>&1) && code=0 || code=$?
      [ "$code" -ne 2 ] && [ "$(grep -c '"check": "R' <<< "$out")" -eq 4 ] && ! grep -q Traceback <<< "$out" ||
        { err "page check did not run cleanly on $f (exit $code): $out"; continue; }
      failed=$(grep -o '"check": "R[0-9]*", "name": "[^"]*", "result": "fail"' <<< "$out" | sed -E 's/^"check": "(R[0-9]+)".*/\1/' | tr '\n' ' ' || true)
      case $name in
        pass*) [ -z "$failed" ] || err "page check fails $failed on $f, which should pass: $out" ;;
        fail-r[0-9]*)
          want=$(sed -E 's/^fail-r([0-9]+).*/R\1/' <<< "$name")
          [ "$failed" = "$want " ] || err "page check fails '${failed:-nothing}' on $f, which should fail only $want: $out" ;;
        *) err "$f is named neither pass*.html nor fail-rN*.html" ;;
      esac
    done
    ran="page check gives every fixture its result"
  else
    echo "SKIP page check fixtures (no python3)"
    ran="page check fixtures not run (no python3)"
  fi
fi

[ "$fail" -eq 0 ] && echo "OK   artifact standard is linked from every agent and page reference; ${ran:-page check not run}"
exit "$fail"
