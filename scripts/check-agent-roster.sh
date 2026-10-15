#!/usr/bin/env bash
# Checks that every agent in plugins/aspire/agents/ is listed where agents are
# listed by hand:
#   - the skill's agent hand-off table (skills/aspire/SKILL.md)
#   - the skill's Model tiers table, whose model must match each agent's
#     frontmatter `model:`
#   - the README's agent table (plugins/aspire/README.md)
#   - the agents panel's roster and costumes (hooks/roster.ts, hooks/costumes.ts)
# and that nothing is listed that has no agent file. The hooks files are only
# checked where they exist.
#
#   scripts/check-agent-roster.sh
set -euo pipefail
cd "$(dirname "$0")/.."

P=plugins/aspire
fail=0
err() { echo "FAIL $*"; fail=1; }

agents=$(for f in "$P"/agents/*.md; do basename "$f" .md; done | sort)
[ -n "$agents" ] || { echo "FAIL no agents found in $P/agents"; exit 1; }

# One list per place: the names it carries, sorted.
# The Model tiers section has its own rows in the same shape; keep them out of the hand-off list.
tiers_section=$(awk '/^## Model tiers/{f=1;next} f&&/^---$/{f=0} f' "$P/skills/aspire/SKILL.md")
skill=$(awk '/^## Model tiers/{f=1} !f{print} f&&/^---$/{f=0}' "$P/skills/aspire/SKILL.md" | grep -oE '^ *\| `atlas-[a-z-]+` \|' | grep -oE 'atlas-[a-z-]+' | sort -u)
readme=$(grep -oE '^\| Agent \| `atlas-[a-z-]+`' "$P/README.md" | grep -oE 'atlas-[a-z-]+' | sort -u)

compare() { # label, names in that place; the skill's table also names retired aliases
  local label=$1 have=$2 allow=${3:-}
  for a in $agents; do
    grep -qxF "$a" <<<"$have" || err "$a is not in $label"
  done
  for h in $have; do
    grep -qxF "$h" <<<"$agents" || { [ -n "$allow" ] && grep -qxF "$h" <<<"$allow"; } || err "$h is in $label but has no file in $P/agents"
  done
}

compare "the skill's agent hand-off table (SKILL.md)" "$skill"

# Model tiers: every agent has a row, and the row's model is the file's `model:`.
[ -n "$tiers_section" ] || err "SKILL.md has no '## Model tiers' section"
tiers=$(grep -oE '^\| `atlas-[a-z-]+` \| [a-z0-9.-]+ \|' <<<"$tiers_section" | sed -E 's/^\| `(atlas-[a-z-]+)` \| ([a-z0-9.-]+) \|$/\1 \2/' || true)
compare "the skill's Model tiers table (SKILL.md)" "$(cut -d' ' -f1 <<<"$tiers")"
for a in $agents; do
  fm=$(awk '/^---$/{n++; next} n==1 && /^model:/{sub(/^model:[ \t]*/,""); print; exit}' "$P/agents/$a.md" | tr -d ' \r')
  [ -n "$fm" ] || { err "$a has no model: in its frontmatter"; continue; }
  want=$(awk -v a="$a" '$1==a{print $2}' <<<"$tiers")
  [ -n "$want" ] && [ "$fm" != "$want" ] && err "$a: frontmatter model '$fm' but the Model tiers table says '$want'"
done
compare "the README agent table" "$readme"

if [ -f "$P/hooks/roster.ts" ]; then
  roster=$(grep -oE "type: 'aspire:atlas-[a-z-]+'" "$P/hooks/roster.ts" | grep -oE 'atlas-[a-z-]+' | sort -u)
  compare "the agents panel roster (hooks/roster.ts)" "$roster"
fi
if [ -f "$P/hooks/costumes.ts" ]; then
  costumes=$(grep -oE "agent: 'aspire:atlas-[a-z-]+'" "$P/hooks/costumes.ts" | grep -oE 'atlas-[a-z-]+' | sort -u)
  compare "the crab costumes (hooks/costumes.ts)" "$costumes"
fi

if [ "$fail" -eq 0 ]; then
  echo "OK   $(wc -l <<<"$agents" | tr -d ' ') agents are listed in the skill, the README, and the agents panel, and their models match the Model tiers table"
fi
exit "$fail"
