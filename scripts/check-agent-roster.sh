#!/usr/bin/env bash
# Checks, for every plugin with agents (plugins/<name>/agents/), that every agent
# is listed where agents are listed by hand:
#   - the plugin's agent hand-off table, in one of its skills' SKILL.md
#   - the Model tiers table in the same skills, whose model must match each
#     agent's frontmatter `model:`
#   - the plugin README's agent table (plugins/<name>/README.md)
#   - the agents panel's roster and costumes (hooks/roster.ts, hooks/costumes.ts),
#     in the plugin itself or in its companion mod plugin, plugins/<name>-mod
#     (aspire's panel ships in plugins/aspire-mod)
# and that nothing is listed that has no agent file. The hooks files are only
# checked where they exist. Agent names start with `atlas-` in every plugin.
#
#   scripts/check-agent-roster.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

fail=0
err() { echo "FAIL $*"; fail=1; }

check_plugin() { # plugin name
  local p=$1 P
  P=$(plugin_src "$1")
  local agents skills_text tiers_section skill readme tiers roster costumes a fm want
  agents=$(for f in "$P"/agents/*.md; do basename "$f" .md; done | sort)
  for a in $agents; do
    [[ "$a" == atlas-* ]] || err "$p: agent $a must be named atlas-<name>"
  done

  # Every skill in the plugin, as one text; the tables may sit in any of them.
  skills_text=$(cat "$P"/skills/*/SKILL.md 2>/dev/null || true)

  # One list per place: the names it carries, sorted.
  # The Model tiers section has its own rows in the same shape; keep them out of the hand-off list.
  tiers_section=$(awk '/^## Model tiers/{f=1;next} f&&/^---$/{f=0} f' <<<"$skills_text")
  skill=$(awk '/^## Model tiers/{f=1} !f{print} f&&/^---$/{f=0}' <<<"$skills_text" | grep -oE '^ *\| `atlas-[a-z-]+` \|' | grep -oE 'atlas-[a-z-]+' | sort -u || true)
  readme=$(grep -oE '^\| Agent \| `atlas-[a-z-]+`' "$P/README.md" 2>/dev/null | grep -oE 'atlas-[a-z-]+' | sort -u || true)

  compare() { # label, names in that place; the skill's table also names retired aliases
    local label=$1 have=$2 allow=${3:-}
    for a in $agents; do
      grep -qxF "$a" <<<"$have" || err "$p: $a is not in $label"
    done
    for h in $have; do
      grep -qxF "$h" <<<"$agents" || { [ -n "$allow" ] && grep -qxF "$h" <<<"$allow"; } || err "$p: $h is in $label but has no file in $P/agents"
    done
  }

  compare "the skill's agent hand-off table (SKILL.md)" "$skill"

  # Model tiers: every agent has a row, and the row's model is the file's `model:`.
  [ -n "$tiers_section" ] || err "$p: no SKILL.md has a '## Model tiers' section"
  tiers=$(grep -oE '^\| `atlas-[a-z-]+` \| [a-z0-9.-]+ \|' <<<"$tiers_section" | sed -E 's/^\| `(atlas-[a-z-]+)` \| ([a-z0-9.-]+) \|$/\1 \2/' || true)
  compare "the skill's Model tiers table (SKILL.md)" "$(cut -d' ' -f1 <<<"$tiers")"
  for a in $agents; do
    fm=$(awk '/^---$/{n++; next} n==1 && /^model:/{sub(/^model:[ \t]*/,""); print; exit}' "$P/agents/$a.md" | tr -d ' \r')
    [ -n "$fm" ] || { err "$p: $a has no model: in its frontmatter"; continue; }
    want=$(awk -v a="$a" '$1==a{print $2}' <<<"$tiers")
    [ -n "$want" ] && [ "$fm" != "$want" ] && err "$p: $a: frontmatter model '$fm' but the Model tiers table says '$want'"
  done
  compare "the README agent table" "$readme"

  # The panel's files sit in the plugin's own hooks or in its companion mod plugin's.
  # The folder is read directly, so the check still runs on main, where the mod's entry is held back.
  local H=$P/hooks
  [ -d "$H" ] || H=plugins/$p-mod/hooks
  if [ -f "$H/roster.ts" ]; then
    roster=$(grep -oE "type: '$p:atlas-[a-z-]+'" "$H/roster.ts" | grep -oE 'atlas-[a-z-]+' | sort -u)
    compare "the agents panel roster ($H/roster.ts)" "$roster"
  fi
  if [ -f "$H/costumes.ts" ]; then
    costumes=$(grep -oE "agent: '$p:atlas-[a-z-]+'" "$H/costumes.ts" | grep -oE 'atlas-[a-z-]+' | sort -u)
    compare "the crab costumes ($H/costumes.ts)" "$costumes"
  fi

  echo "     $p: $(wc -l <<<"$agents" | tr -d ' ') agents"
}

checked=0
for p in $(plugin_names); do
  src=$(plugin_src "$p")
  compgen -G "$src/agents/*.md" >/dev/null || continue
  check_plugin "$p"
  checked=$((checked + 1))
done

# aspire always ships agents; finding none means a path is wrong, not that all is listed.
[ "$checked" -gt 0 ] || err "no plugin has agents in plugins/<name>/agents/; check the marketplace sources"

if [ "$fail" -eq 0 ]; then
  echo "OK   the agents of $checked plugin(s) are listed in their skill, README, and agents panel, and their models match the Model tiers table"
fi
exit "$fail"
