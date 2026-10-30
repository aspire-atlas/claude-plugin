#!/usr/bin/env bash
# Checks the orchestration contract (plugins/aspire/skills/aspire/references/orchestration.md):
#   - every agent in every plugin carries the contract's packet block verbatim, under
#     '## Orchestration contract', and a plugin other than aspire links the contract file
#   - every agent has exactly one row in the permission level table, with a level of
#     read, write, send, or spend, and the table names no agent without a file
#   - every agent the question codes and shortcuts route to has a file
#   - every shortcut in the contract is named in SKILL.md's Arguments table
#   - the result packet and launch block examples parse as JSON and carry every field
#   - every agent carries the checkpoint paragraph (section 11) exactly once, verbatim
# What an agent actually returns at run time is not checked here; this keeps the instructions in step.
#
#   scripts/check-orchestration.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

P=plugins/aspire
REF=$P/skills/aspire/references/orchestration.md
SKILL=$P/skills/aspire/SKILL.md
fail=0
err() { echo "FAIL $*"; fail=1; }

[ -f "$REF" ] || { echo "FAIL $REF is missing"; exit 1; }

# One numbered section of the contract, by its heading number.
section() { awk -v n="$1" '$0 ~ "^## "n"\\. "{f=1;next} f&&/^## /{f=0} f' "$REF"; }

ckpt=$(awk '/<!-- checkpoint-block -->/{f=1;next} /<!-- \/checkpoint-block -->/{f=0} f' "$REF" | sed '/^$/d')
[ "$(wc -l <<<"$ckpt" | tr -d ' ')" = 1 ] && [ -n "$ckpt" ] || err "the contract has no one-line <!-- checkpoint-block --> section"

canon=$(awk '/<!-- packet-block -->/{f=1;next} /<!-- \/packet-block -->/{f=0} f' "$REF" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
[ -n "$canon" ] || err "the contract has no <!-- packet-block --> section"

levels=$(section 7 | grep -oE '^\| `atlas-[a-z-]+` \| [a-z]+ \|' | sed -E 's/^\| `(atlas-[a-z-]+)` \| ([a-z]+) \|$/\1 \2/' || true)
[ -n "$levels" ] || err "the contract's section 7 has no agent level table"

all_agents=""
for p in $(plugin_names); do
  src=$(plugin_src "$p")
  compgen -G "$src/agents/*.md" >/dev/null || continue
  if [ "$src" != "$P" ]; then
    # The block names the contract under the plugin's own root, so another plugin links aspire's.
    f=skills/aspire/references/orchestration.md
    if [ ! -e "$src/$f" ]; then err "$p: $src/$f is missing; link it to $P/$f"
    elif ! { [ -L "$src/$f" ] && [ "$src/$f" -ef "$P/$f" ]; }; then err "$p: $src/$f must be a symbolic link to $P/$f, not a copy"; fi
  fi
  for f in "$src"/agents/*.md; do
    name=$(basename "$f" .md)
    all_agents+="$name"$'\n'
    mine=$(awk '/^## Orchestration contract$/{f=1;next} f&&/^## /{f=0} f' "$f" | sed -e '/./,$!d' -e :a -e '/^\n*$/{$d;N;ba' -e '}')
    [ -n "$mine" ] || { err "$p: $name has no '## Orchestration contract' section (copy the block from orchestration.md, section 11)"; continue; }
    [ "$mine" = "$canon" ] || err "$p: $name's Orchestration contract block differs from the one in orchestration.md"
    n=$(grep -cxF -- "$ckpt" "$f" || true)
    [ "$n" = 1 ] || err "$p: $name carries the checkpoint paragraph $n times; want it once, verbatim from orchestration.md, section 11"
    grep -q '`report_checkpoint`' "$f" || err "$p: $name does not load report_checkpoint"
    n=$(awk -v a="$name" '$1==a' <<<"$levels" | wc -l | tr -d ' ')
    [ "$n" = 1 ] || err "$p: $name has $n rows in the permission level table (orchestration.md, section 7); want 1"
  done
done

while read -r a lvl; do
  [ -n "$a" ] || continue
  case "$lvl" in read | write | send | spend) ;; *) err "$a: level '$lvl' is not read, write, send, or spend" ;; esac
  grep -qxF "$a" <<<"$all_agents" || err "the level table names $a, which has no agent file"
done <<<"$levels"

# Agents the question codes (3) and shortcuts (4) route to.
for s in 3 4; do
  for a in $(section "$s" | grep -oE '`atlas-[a-z-]+`' | tr -d '`' | sort -u); do
    grep -qxF "$a" <<<"$all_agents" || err "orchestration.md section $s routes to $a, which has no agent file"
  done
done

# Every shortcut is named in SKILL.md's Arguments table row for shortcuts.
args_row=$(grep -E '^\| A shortcut:' "$SKILL" || true)
[ -n "$args_row" ] || err "SKILL.md's Arguments table has no 'A shortcut:' row"
for s in $(section 4 | grep -oE '^\| `[a-z ]+` \|' | sed -E 's/^\| `([a-z ]+)` \|$/\1/' | tr ' ' '_'); do
  s=${s//_/ }
  grep -qF "\`$s\`" <<<"$args_row" || err "shortcut '$s' is in orchestration.md section 4 but not in SKILL.md's Arguments row"
done

# The examples parse and carry every field the contract names.
command -v python3 >/dev/null || { echo "FAIL python3 is needed to check the examples"; exit 1; }
python3 -I - "$REF" <<'PY' || fail=1
import json, re, sys
text = open(sys.argv[1]).read()
want = {
    "result-packet": ["runId", "agent", "question", "reader", "page", "findings", "proposals",
                      "questions", "next", "cost", "coverage", "selfCheck"],
    "launch": ["from", "runId", "agent", "mode", "run", "question", "persona", "reader",
               "shortcut", "scope", "approved"],
}
bad = 0
for tag, keys in want.items():
    m = re.search(r"```" + tag + r"\n(.*?)\n```", text, re.S)
    if not m:
        print(f"FAIL orchestration.md has no ```{tag} example"); bad = 1; continue
    try:
        obj = json.loads(m.group(1))
    except ValueError as e:
        print(f"FAIL the {tag} example is not valid JSON: {e}"); bad = 1; continue
    for k in keys:
        if k not in obj:
            print(f"FAIL the {tag} example has no '{k}' field"); bad = 1
sys.exit(bad)
PY

[ "$fail" -eq 0 ] && echo "OK   every agent carries the orchestration contract and has a permission level; routes and shortcuts resolve"
exit "$fail"
