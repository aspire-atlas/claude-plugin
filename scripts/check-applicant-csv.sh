#!/usr/bin/env bash
# Runs the applicant CSV snippet (plugins/aspire/skills/aspire/references/applicant-csv.md) on every
# fixture in scripts/fixtures/applicant-csv/ and compares its output with the fixture's .expected file:
# payment and tax columns left out, account-shaped values cut, handles, ids and places kept, repeated
# headers, multi-line quoted cells, row numbers past a blank row, and Windows-encoded files.
#
#   scripts/check-applicant-csv.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SN=plugins/aspire/skills/aspire/references/applicant-csv.md
FX=scripts/fixtures/applicant-csv
command -v python3 >/dev/null || { echo "SKIP applicant CSV fixtures (no python3)"; exit 0; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
awk '/^<!-- applicant-csv -->$/{f=1;next} /^<!-- \/applicant-csv -->$/{f=0} f' "$SN" | sed '1d;$d' > "$tmp/applicant_csv.py"
[ -s "$tmp/applicant_csv.py" ] || { echo "FAIL $SN has no <!-- applicant-csv --> snippet"; exit 1; }

fail=0 n=0
for csv in "$FX"/*.csv; do
  exp=${csv%.csv}.expected
  [ -f "$exp" ] || { echo "FAIL $csv has no $(basename "$exp")"; fail=1; continue; }
  n=$((n + 1))
  if ! python3 -I "$tmp/applicant_csv.py" "$csv" 0 1000 | diff -u "$exp" - > "$tmp/diff"; then
    echo "FAIL $csv: the snippet's output differs from $(basename "$exp")"; head -20 "$tmp/diff"; fail=1
  fi
done
[ "$n" -gt 0 ] || { echo "FAIL no fixtures in $FX"; exit 1; }
[ "$fail" -eq 0 ] && echo "OK applicant CSV snippet: $n fixtures"
exit "$fail"
