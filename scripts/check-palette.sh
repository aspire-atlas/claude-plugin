#!/usr/bin/env bash
# Checks the palette of every plugin with a mod (plugins/<name>/hooks/palette.ts):
#   - a plugin whose hooks hold TypeScript sources has a palette.ts
#   - every color literal (#rgb, #rrggbb, 0xrrggbb) in the hooks' sources is a color the palette holds
#   - the drawing sources (register.tsx, characters.ts, costumes.ts, where they exist) write no color literal at all (hex or rgba): they take theirs from the palette
# A color is added to palette.ts with a role, or it is not used.
#
#   scripts/check-palette.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

fail=0

# Lower-case #rrggbb (or #rrggbbaa) for every color literal on stdin, comment-only lines skipped; #rgb is expanded, 0xrrggbb becomes #rrggbb.
hexes() {
  grep -vE '^[[:space:]]*(//|/\*|\*)' |
    grep -oE '#[0-9A-Fa-f]{8}([^0-9A-Za-z_]|$)|#[0-9A-Fa-f]{6}([^0-9A-Za-z_]|$)|#[0-9A-Fa-f]{3}([^0-9A-Za-z_]|$)|0x[0-9A-Fa-f]{6}([^0-9A-Za-z_]|$)' |
    sed -E 's/[^0-9A-Za-z]$//; s/^0x/#/' | tr 'A-F' 'a-f' |
    awk '{ if (length($0) == 4) printf "#%s%s%s%s%s%s\n", substr($0,2,1), substr($0,2,1), substr($0,3,1), substr($0,3,1), substr($0,4,1), substr($0,4,1); else print }'
}

checked=0
for p in $(plugin_names); do
  H=$(plugin_src "$p")/hooks
  compgen -G "$H/*.ts*" >/dev/null || continue
  PAL=$H/palette.ts
  [ -f "$PAL" ] || { echo "FAIL $H holds TypeScript sources but no palette.ts"; fail=1; continue; }
  checked=$((checked + 1))

  palette=$(hexes < "$PAL" | sort -u)
  [ -n "$palette" ] || { echo "FAIL $PAL holds no colors"; fail=1; continue; }

  for f in "$H"/*.ts "$H"/*.tsx; do
    [ -f "$f" ] || continue
    case "$f" in "$PAL"|*.test.ts|*.test.tsx) continue ;; esac
    while read -r hex; do
      [ -z "$hex" ] && continue
      echo "$palette" | grep -qx "$hex" || { echo "FAIL $f: $hex is not in the palette"; fail=1; }
    done < <(hexes < "$f" | sort -u)
  done

  for f in register.tsx characters.ts costumes.ts; do
    [ -f "$H/$f" ] || continue
    if [ -n "$(hexes < "$H/$f")" ]; then echo "FAIL $H/$f writes a color literal; take it from the palette"; fail=1; fi
    if grep -vE '^[[:space:]]*(//|/\*|\*)' "$H/$f" | grep -qE 'rgba?\('; then echo "FAIL $H/$f writes an rgb()/rgba() color; take it from the palette"; fail=1; fi
  done
done

[ "$fail" -eq 0 ] && echo "OK   every color in the hooks of $checked plugin(s) is in its palette"
exit "$fail"
