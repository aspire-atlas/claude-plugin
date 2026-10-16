#!/usr/bin/env bash
# Checks the mod's palette (plugins/aspire/hooks/palette.ts):
#   - every color literal (#rgb, #rrggbb, 0xrrggbb) in the hooks' sources is a color the palette holds
#   - the drawing sources (register.tsx, characters.ts, costumes.ts) write no color literal at all: they take theirs from the palette
# A color is added to palette.ts with a role, or it is not used.
#
#   scripts/check-palette.sh
set -euo pipefail
cd "$(dirname "$0")/.."

H=plugins/aspire/hooks
PAL=$H/palette.ts
fail=0

# Lower-case #rrggbb for every color literal on stdin; #rgb is expanded, 0xrrggbb becomes #rrggbb.
hexes() {
  grep -oE '#[0-9A-Fa-f]{6}([^0-9A-Za-z_]|$)|#[0-9A-Fa-f]{3}([^0-9A-Za-z_]|$)|0x[0-9A-Fa-f]{6}([^0-9A-Za-z_]|$)' |
    sed -E 's/[^0-9A-Za-z]$//; s/^0x/#/' | tr 'A-F' 'a-f' |
    awk '{ if (length($0) == 4) printf "#%s%s%s%s%s%s\n", substr($0,2,1), substr($0,2,1), substr($0,3,1), substr($0,3,1), substr($0,4,1), substr($0,4,1); else print }'
}

palette=$(hexes < "$PAL" | sort -u)
[ -n "$palette" ] || { echo "FAIL $PAL holds no colors"; exit 1; }

for f in "$H"/*.ts "$H"/*.tsx; do
  case "$f" in "$PAL"|*.test.ts|*.test.tsx) continue ;; esac
  while read -r hex; do
    [ -z "$hex" ] && continue
    echo "$palette" | grep -qx "$hex" || { echo "FAIL $f: $hex is not in the palette"; fail=1; }
  done < <(hexes < "$f" | sort -u)
done

for f in register.tsx characters.ts costumes.ts; do
  if [ -n "$(hexes < "$H/$f")" ]; then echo "FAIL $H/$f writes a color literal; take it from the palette"; fail=1; fi
done

[ "$fail" -eq 0 ] && echo "OK   every color in the hooks is in the palette"
exit "$fail"
