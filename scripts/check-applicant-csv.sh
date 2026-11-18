#!/usr/bin/env bash
# Runs the commands plugins/aspire/skills/aspire/references/applicant-csv.md tells Claude to run (the
# first run, then each {"next": n} run) on each fixture in scripts/fixtures/applicant-csv/, and compares
# the joined output with the fixture's .expected file. --update rewrites the .expected files.
#
#   scripts/check-applicant-csv.sh [--update]
set -euo pipefail
cd "$(dirname "$0")/.."

SN=plugins/aspire/skills/aspire/references/applicant-csv.md
FX=scripts/fixtures/applicant-csv
command -v python3 >/dev/null || { echo "FAIL python3 is needed"; exit 1; }

# The documented first-run command, between the applicant-csv-run markers, without its fence.
cmd=$(awk '/^<!-- applicant-csv-run -->$/{f=1;next} /^<!-- \/applicant-csv-run -->$/{f=0} f' "$SN" | sed '1d;$d')
[ -n "$cmd" ] || { echo "FAIL $SN has no <!-- applicant-csv-run --> command"; exit 1; }

# Every run for one file: the first run's output after the folder line, then each next run's, as the doc says.
runs() {
  local got dir next
  got=$(CLAUDE_PLUGIN_ROOT="$PWD/plugins/aspire" bash -c "${cmd//\{csv path\}/$PWD/$1}" || true)
  dir=$(head -1 <<< "$got")
  case "$dir" in /*) ;; *) echo "no folder printed first"; return ;; esac
  got=$(tail -n +2 <<< "$got")
  while :; do
    printf '%s\n' "$got"
    next=$(tail -1 <<< "$got" | sed -n 's/^{"next": "\{0,1\}\(r\{0,1\}[0-9]*\)"\{0,1\}}$/\1/p')
    [ -n "$next" ] && [ -d "$dir" ] || break
    got=$(python3 -I "$dir/applicant_csv.py" "$dir/applicants.csv" "$next")
  done
  rm -rf "$dir"
}

fail=0 n=0
for csv in "$FX"/*.csv; do
  exp=${csv%.csv}.expected
  n=$((n + 1))
  if [ "${1:-}" = --update ]; then runs "$csv" > "$exp"; continue; fi
  [ -f "$exp" ] || { echo "FAIL $csv has no $(basename "$exp")"; fail=1; continue; }
  if ! d=$(runs "$csv" | diff -u "$exp" -); then
    echo "FAIL $csv: the output differs from $(basename "$exp")"; head -20 <<< "$d"; fail=1
  fi
done
[ "$n" -gt 0 ] || { echo "FAIL no fixtures in $FX"; exit 1; }
[ "$fail" -eq 0 ] && echo "OK applicant CSV snippet: $n fixtures"
exit "$fail"
