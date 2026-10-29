#!/usr/bin/env bash
# Checks that no skill or command body holds a placeholder Claude Code would fill in.
# Claude Code replaces `$0`, `$1`, ... and `$ARGUMENTS` in a SKILL.md or commands/*.md
# body with the command's arguments, so "$2,000" turns into "{third argument},000" when
# the command runs with arguments. Write an amount so no digit follows the `$`
# ("USD 2,000"). Don't use the `\$` escape: agents read SKILL.md with the Read tool,
# which shows the backslash. Frontmatter is not substituted and is skipped; agents and
# references are not substituted either.
#
#   scripts/check-skill-args.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

fail=0
checked=0
for p in $(plugin_names); do
  src=$(plugin_src "$p")
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    checked=$((checked + 1))
    # Body only: skip the frontmatter between the first two --- lines (CRLF and trailing spaces allowed).
    hits=$(awk '{ sub(/\r$/, "") } NR == 1 && /^---[[:space:]]*$/ { fm = 1; next } fm && /^---[[:space:]]*$/ { fm = 0; next } !fm { print FNR ": " $0 }' "$f" |
      grep -E '\$([0-9]|ARGUMENTS)' || true)
    if [ -n "$hits" ]; then
      while IFS= read -r line; do
        echo "FAIL $f:$line"
      done <<< "$hits"
      fail=1
    fi
  done < <({ find "$src/skills" -name SKILL.md; find "$src/commands" -name '*.md'; } 2>/dev/null | sort)
done

[ "$fail" -eq 0 ] && echo "OK   no \$<digit> or \$ARGUMENTS in the $checked skill and command bodies" ||
  echo "     Write amounts as \"USD 2,000\": Claude Code swaps \$0, \$1, ... and \$ARGUMENTS for the command's arguments."
exit "$fail"
