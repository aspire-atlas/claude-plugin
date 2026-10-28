#!/usr/bin/env bash
# Checks that no skill or command body holds an unescaped `$` followed by a digit.
# Claude Code replaces `$0`, `$1`, ... in a SKILL.md or commands/*.md body with the
# command's arguments, so "$2,000" turns into "{third argument},000" when the
# command runs with arguments. Write a literal amount as `\$2,000`. Frontmatter is
# not substituted and is skipped; agents and references are not substituted either.
#
#   scripts/check-skill-args.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

fail=0
checked=0
for p in $(plugin_names); do
  src=$(plugin_src "$p")
  for f in "$src"/skills/*/SKILL.md "$src"/commands/*.md; do
    [ -f "$f" ] || continue
    checked=$((checked + 1))
    # Body only: skip the frontmatter between the first two --- lines.
    hits=$(awk 'NR == 1 && /^---$/ { fm = 1; next } fm && /^---$/ { fm = 0; next } !fm { print FNR ": " $0 }' "$f" |
      grep -E '(^|[^\\])\$[0-9]' || true)
    if [ -n "$hits" ]; then
      while IFS= read -r line; do
        echo "FAIL $f:$line"
      done <<< "$hits"
      fail=1
    fi
  done
done

[ "$fail" -eq 0 ] && echo "OK   no unescaped \$<digit> in the $checked skill and command bodies" ||
  echo "     Escape literal amounts as \\\$2,000: Claude Code swaps \$0, \$1, ... for the command's arguments."
exit "$fail"
