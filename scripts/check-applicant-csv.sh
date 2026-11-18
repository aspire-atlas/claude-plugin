#!/usr/bin/env bash
# Runs the command plugins/aspire/skills/aspire/references/applicant-csv.md tells Claude to run on each
# fixture in scripts/fixtures/applicant-csv/, and compares its output with the fixture's .expected file.
#
#   scripts/check-applicant-csv.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SN=plugins/aspire/skills/aspire/references/applicant-csv.md
FX=scripts/fixtures/applicant-csv
command -v python3 >/dev/null || { echo "FAIL python3 is needed"; exit 1; }

# The documented first-run command, between the applicant-csv-run markers, without its fence.
cmd=$(awk '/^<!-- applicant-csv-run -->$/{f=1;next} /^<!-- \/applicant-csv-run -->$/{f=0} f' "$SN" | sed '1d;$d')
[ -n "$cmd" ] || { echo "FAIL $SN has no <!-- applicant-csv-run --> command"; exit 1; }
grep -qF '<!-- applicant-csv -->' "$SN" || { echo "FAIL $SN has no <!-- applicant-csv --> snippet"; exit 1; }

fail=0 n=0
for csv in "$FX"/*.csv; do
  exp=${csv%.csv}.expected
  [ -f "$exp" ] || { echo "FAIL $csv has no $(basename "$exp")"; fail=1; continue; }
  n=$((n + 1))
  run=${cmd//\{csv path\}/$PWD/$csv}
  got=$(CLAUDE_PLUGIN_ROOT="$PWD/plugins/aspire" bash -c "$run" || true)
  dir=$(head -1 <<< "$got")
  case "$dir" in /*) rm -rf "$dir" ;; *) echo "FAIL $csv: the command printed no folder first"; fail=1; continue ;; esac
  if ! tail -n +2 <<< "$got" | diff -u "$exp" - > /tmp/applicant-csv-diff.$$; then
    echo "FAIL $csv: the output differs from $(basename "$exp")"; head -20 /tmp/applicant-csv-diff.$$; fail=1
  fi
  rm -f /tmp/applicant-csv-diff.$$
done
[ "$n" -gt 0 ] || { echo "FAIL no fixtures in $FX"; exit 1; }
[ "$fail" -eq 0 ] && echo "OK applicant CSV snippet: $n fixtures"
exit "$fail"
