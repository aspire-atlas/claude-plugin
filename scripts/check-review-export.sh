#!/usr/bin/env bash
# Runs the commands plugins/aspire/skills/aspire/references/review-export.md tells Claude to run (the
# setup run, then `plan` and each `part n`) on each fixture folder in scripts/fixtures/review-export/,
# and compares the output with the folder's .expected file. Two more cases are built here, since their
# rows would be megabytes in the repo: 5,000 small rows (split on the row limit) and 3,000 rows with
# long comments (split on the 2 MB limit); only their plans are compared. --update rewrites the
# .expected files.
#
#   scripts/check-review-export.sh [--update]
set -euo pipefail
cd "$(dirname "$0")/.."

SN=plugins/aspire/skills/aspire/references/review-export.md
FX=scripts/fixtures/review-export
command -v python3 >/dev/null || { echo "FAIL python3 is needed"; exit 1; }

# The documented setup command, between the review-export-run markers, without its fence.
cmd=$(awk '/^<!-- review-export-run -->$/{f=1;next} /^<!-- \/review-export-run -->$/{f=0} f' "$SN" | sed '1d;$d')
[ -n "$cmd" ] || { echo "FAIL $SN has no <!-- review-export-run --> command"; exit 1; }

# Shows a part's bytes with its byte order mark and line ends visible.
show() { python3 -I -c 'import sys; b = sys.stdin.buffer.read(); t = b.decode("utf-8"); print(t.replace(chr(0xfeff), "<BOM>").replace("\r\n", "<CRLF>\n"), end="")'; }

# Every run for one case: setup, copy (or build) the rows, plan, then each part when $2 is "parts".
runs() {
  local src=$1 what=$2 dir plan n k
  dir=$(CLAUDE_PLUGIN_ROOT="$PWD/plugins/aspire" bash -c "$cmd")
  case "$dir" in /*) ;; *) echo "no folder printed"; return ;; esac
  if [ -d "$src" ]; then cp "$src"/rows-*.jsonl "$src"/vetting-column.txt "$dir"/ 2>/dev/null || true; else python3 -I -c "$src" "$dir"; fi
  plan=$(python3 -I "$dir/review_export.py" "$dir" plan)
  printf '%s\n' "$plan"
  if [ "$what" = parts ]; then
    n=$(python3 -I -c 'import json, sys; print(len(json.loads(sys.argv[1]).get("parts", [])))' "$plan")
    k=1
    while [ "$k" -le "$n" ]; do
      echo "== part $k"
      python3 -I "$dir/review_export.py" "$dir" part "$k" | show
      k=$((k + 1))
    done
  fi
  rm -rf "$dir"
}

ROWS_LIMIT='import json, sys
with open(sys.argv[1] + "/rows-1.jsonl", "w") as f:
    for i in range(5000):
        f.write(json.dumps({"Instagram": f"creator{i}", "Tags": ["Atlas", "Brand Safe"],
                            "Decision": "Approve"}) + "\n")'
BYTES_LIMIT='import json, sys
with open(sys.argv[1] + "/rows-1.jsonl", "w") as f:
    for i in range(3000):
        f.write(json.dumps({"Instagram": f"creator{i}", "Owners": "x" * 900, "Decision": "Maybe"}) + "\n")'

fail=0 n=0
check() {
  local name=$1 src=$2 what=$3 exp="$FX/$1.expected" d
  n=$((n + 1))
  if [ "${UPDATE:-}" = 1 ]; then runs "$src" "$what" > "$exp"; return; fi
  [ -f "$exp" ] || { echo "FAIL $name has no $(basename "$exp")"; fail=1; return; }
  if ! d=$(runs "$src" "$what" | diff -u "$exp" -); then
    echo "FAIL $name: the output differs from $(basename "$exp")"; head -20 <<< "$d"; fail=1
  fi
}

[ "${1:-}" = --update ] && UPDATE=1
for src in "$FX"/*/; do
  src=${src%/}
  check "$(basename "$src")" "$src" parts
done
check generated-row-limit "$ROWS_LIMIT" plan
check generated-size-limit "$BYTES_LIMIT" plan
[ "$n" -gt 2 ] || { echo "FAIL no fixtures in $FX"; exit 1; }
[ "$fail" -eq 0 ] && echo "OK review export snippet: $n cases"
exit "$fail"
