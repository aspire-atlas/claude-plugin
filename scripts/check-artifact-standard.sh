#!/usr/bin/env bash
# Checks the artifact standard (plugins/aspire/skills/aspire/references/artifact-standard.md):
#   - the standard and both logo files exist
#   - every agent in every plugin carries the standard's agent block verbatim, and a plugin with
#     agents holds the standard and the logos at the paths that block and the standard name
#     (another plugin links to aspire's files rather than copying them)
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
    for f in skills/aspire/references/artifact-standard.md assets/aspire-animated.svg assets/aspire-animated-small.svg; do
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

[ "$fail" -eq 0 ] && echo "OK   artifact standard is linked from every agent and page reference"
exit "$fail"
