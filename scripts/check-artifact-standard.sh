#!/usr/bin/env bash
# Checks the artifact standard (skills/aspire/references/artifact-standard.md):
#   - the standard and both logo files exist
#   - every agent in plugins/aspire/agents/ links the standard
#   - the standard's source sentence is written in that one file only, so the wording cannot drift
#   - the references that define a published page link the standard
# What an agent actually publishes is not checked here; this keeps the instructions in step.
#
#   scripts/check-artifact-standard.sh
set -euo pipefail
cd "$(dirname "$0")/.."

P=plugins/aspire
R=$P/skills/aspire/references
STD=$R/artifact-standard.md
fail=0
err() { echo "FAIL $*"; fail=1; }

[ -f "$STD" ] || { echo "FAIL $STD is missing"; exit 1; }
for f in "$P/assets/aspire-animated.svg" "$P/assets/aspire-animated-small.svg"; do
  [ -f "$f" ] || err "$f is missing (the standard pastes it into pages)"
done

for f in "$P"/agents/*.md; do
  grep -q 'references/artifact-standard.md' "$f" || err "$(basename "$f" .md) does not link artifact-standard.md"
done

# The wording lives in the standard only.
while IFS= read -r f; do
  [ "$f" = "$STD" ] || err "$f restates the standard's source sentence; link artifact-standard.md instead"
done < <(grep -rlF 'Data compiled via proprietary AI brand memory' "$P" --include='*.md' || true)
grep -qF 'Data compiled via proprietary AI brand memory as of' "$STD" || err "the standard lost its source sentence"
grep -qF 'Not for public publishing.' "$STD" || err "the standard lost its audience line"

# References that define a published page or deck.
for f in ad-reuse affiliate cas-campaign content-library content-review content-sourcing creator-brief creator-card \
  creator-discovery creator-profile creator-vetting deliverable-tracker fulfillment market-signal negotiation org-dashboard \
  orchestrator outreach post-analysis ppa-pitch program program-dashboard program-ledger quarterly-signal readout \
  roster-manager shops first-run agents/decision-audit agents/sample-artifact; do
  [ -f "$R/$f.md" ] || { err "$R/$f.md is missing"; continue; }
  grep -q 'artifact-standard' "$R/$f.md" || err "$f.md does not link artifact-standard.md"
done

[ "$fail" -eq 0 ] && echo "OK   artifact standard is linked from every agent and page reference"
exit "$fail"
