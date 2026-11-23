#!/usr/bin/env bash
# Checks the page templates (plugins/aspire/skills/page-standard/templates.md):
#   - the fill script in page-fill.md renders every template from its example data in
#     scripts/fixtures/page-templates/<template>.json, each example carries the Example label, and
#     the page check (page-check.md) fails nothing on any rendered page
#   - the fill script refuses each fail-<rule>*.json fixture there, on that rule and no other
#   - page-templates.json gives every template a length budget and only typed sections the data
#     shape (page-data.schema.json) defines
#   - every agent has one template or a reason it has none, the mapping table in templates.md says
#     the same, and every agent is a job an action can name. A scaffold from new-agent.sh still holding
#     TODO(new-agent) lines is reported as waiting until it is filled in
#
#   scripts/check-page-templates.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PS=plugins/aspire/skills/page-standard
FX=scripts/fixtures/page-templates
fail=0
err() { echo "FAIL $*"; fail=1; }

for f in "$PS/templates.md" "$PS/page-fill.md" "$PS/page-data.schema.json" "$PS/page-templates.json"; do
  [ -f "$f" ] || { echo "FAIL $f is missing"; exit 1; }
done
grep -qF 'templates.md' "$PS/SKILL.md" || err "$PS/SKILL.md does not point to templates.md"
command -v python3 >/dev/null || { echo "SKIP page templates (no python3)"; exit 0; }

# The templates, the data shape, the agents, and the mapping table agree.
out=$(python3 -I - "$PS" plugins/aspire/agents <<'PY'
import json, re, sys
from pathlib import Path
ps, agents_dir = Path(sys.argv[1]), Path(sys.argv[2])
tpl = json.loads((ps / "page-templates.json").read_text())
schema = json.loads((ps / "page-data.schema.json").read_text())
problems = []
sections = set(schema["$defs"]["sections"]["properties"])
names = set(schema["properties"]["template"]["enum"])
if set(tpl["templates"]) != names:
    problems.append("page-templates.json's templates differ from the schema's template names")
mapped = {}
for name, t in tpl["templates"].items():
    for key in t.get("needs", []) + t.get("needsOne", []) + t.get("exactlyOne", []) + t["allows"]:
        if key not in sections:
            problems.append("%s names a section the data shape does not define: %s" % (name, key))
    for key in t.get("needs", []) + t.get("exactlyOne", []):
        if key not in t["allows"]:
            problems.append("%s needs %s but does not allow it" % (name, key))
    budgets = t.get("length") or {}
    if not budgets:
        problems.append("%s has no length budget" % name)
    for key, b in budgets.items():
        if not (isinstance(b.get("screens"), int) or (b.get("screens") is None and b.get("growsWith"))):
            problems.append("%s's %s budget is neither a number of screens nor grows with its items" % (name, key))
    for a in t["agents"]:
        mapped.setdefault(a, []).append(name)
for a in tpl.get("notTemplated", {}):
    mapped.setdefault(a, []).append("none")
agents = {p.stem[len("atlas-"):] for p in agents_dir.glob("atlas-*.md")}
# A scaffold still holding TODO(new-agent) lines picks its template when it is filled in.
waiting = {a for a in agents if "TODO(new-agent)" in (agents_dir / ("atlas-%s.md" % a)).read_text()}
for a in sorted(waiting - set(mapped)):
    print("wait agent %s is a scaffold not yet filled in; give it a template in page-templates.json and templates.md" % a)
agents -= waiting - set(mapped)
for a in sorted(agents - set(mapped)):
    problems.append("agent %s has no template in page-templates.json (or a reason in notTemplated)" % a)
for a in sorted(set(mapped) - agents):
    problems.append("page-templates.json names %s, which is not an agent" % a)
for a, where in sorted(mapped.items()):
    if len(where) > 1:
        problems.append("agent %s is under more than one template: %s" % (a, ", ".join(where)))
jobs = set(schema["$defs"]["action"]["properties"]["job"]["enum"])
for a in sorted(agents - jobs - waiting):
    problems.append("agent %s is not a job in page-data.schema.json" % a)
doc = (ps / "templates.md").read_text()
table = re.search(r"^## 6\. .*?\n\| Template \| Agents \|\n\|[- |]+\|\n(.*?)\n\n", doc, re.S | re.M)
if not table:
    problems.append("templates.md has no mapping table in section 6")
else:
    rows = {}
    for line in table.group(1).splitlines():
        cells = [c.strip() for c in line.strip("|").split("|")]
        rows[cells[0].lower()] = {a.strip() for a in cells[1].split(",")}
    for name, t in tpl["templates"].items():
        if rows.get(name) != set(t["agents"]):
            problems.append("templates.md's mapping row for %s differs from page-templates.json" % t["name"])
print("\n".join(problems))
PY
) || err "could not read the templates: $out"
while IFS= read -r line; do
  case $line in "") ;; wait\ *) echo "$line" ;; *) err "$line" ;; esac
done <<< "$out"

# Render each example, then run the page check on it; and refuse each bad example.
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
awk '/^<!-- page-fill -->$/{f=1;next} /^<!-- \/page-fill -->$/{f=0} f' "$PS/page-fill.md" | sed '1d;$d' > "$tmp/page_fill.py"
awk '/^<!-- page-check -->$/{f=1;next} /^<!-- \/page-check -->$/{f=0} f' "$PS/page-check.md" | sed '1d;$d' > "$tmp/page_check.py"
[ -s "$tmp/page_fill.py" ] || err "$PS/page-fill.md has no <!-- page-fill --> script"
cp "$PS/page-data.schema.json" "$PS/page-templates.json" "$PS/blocks.md" "$PS/page-check.md" \
  plugins/aspire/skills/aspire/references/artifact-standard.md plugins/aspire/assets/aspire-animated.svg.md "$tmp/"
rendered=0
for t in $(python3 -I -c 'import json,sys; print(" ".join(json.load(open(sys.argv[1]))["templates"]))' "$PS/page-templates.json"); do
  f=$FX/$t.json
  [ -f "$f" ] || { err "$f is missing (each template has an example)"; continue; }
  python3 -I -c 'import json,sys; sys.exit(0 if json.load(open(sys.argv[1])).get("example") is True else 1)' "$f" ||
    err "$f does not set \"example\": true, so its page would not carry the Example label"
  cp "$f" "$tmp/page.json"
  page=$(python3 -I "$tmp/page_fill.py" "$tmp/page.json" 2>&1) && code=0 || code=$?
  [ "$code" -eq 0 ] || { err "the fill script did not render $f (exit $code): $page"; continue; }
  printf '%s\n' "$page" > "$tmp/$t.html"
  grep -q '>Example<' "$tmp/$t.html" || err "the page rendered from $f carries no Example label"
  out=$(python3 -I "$tmp/page_check.py" "$tmp/$t.html" 2>&1) && code=0 || code=$?
  failed=$(grep -o '"check": "R[0-9]*", "name": "[^"]*", "result": "fail"' <<< "$out" | sed -E 's/^"check": "(R[0-9]+)".*/\1/' | tr '\n' ' ' || true)
  [ "$code" -eq 0 ] && [ -z "$failed" ] || err "the page rendered from $f fails the page check (${failed:-exit $code}): $out"
  rendered=$((rendered + 1))
done
# Figures print in fixed point with no float noise: the fill script's num() on known values.
nums=$(python3 -I - "$tmp/page_fill.py" <<'PY' 2>&1
import sys
src = open(sys.argv[1], encoding="utf-8").read().replace("sys.exit(main(sys.argv[1:]))", "")
ns = {}
exec(src, ns)
cases = {0.00004: "0.00004", 0.004: "0.004", 0.125: "0.125", 0.1 + 0.2: "0.3", 1234567.89: "1,234,567.89",
         12345678901234.5: "12,345,678,901,234.5", 1234.5: "1,234.5", 12: "12", 2.0: "2"}
bad = ["%r printed %r, not %r" % (v, ns["num"](v), want) for v, want in cases.items() if ns["num"](v) != want]
print("; ".join(bad))
PY
) || nums="num() could not be loaded: $nums"
[ -z "$nums" ] || err "the fill script prints figures wrong: $nums"
for f in "$FX"/fail-*.json; do
  [ -f "$f" ] || continue
  want=$(basename "$f" .json | sed -E 's/^fail-//')
  cp "$f" "$tmp/page.json"
  out=$(python3 -I "$tmp/page_fill.py" --check "$tmp/page.json" 2>&1) && code=0 || code=$?
  rules=$(grep -o '"rule": "[a-z-]*"' <<< "$out" | sed -E 's/"rule": "(.*)"/\1/' | sort -u | tr '\n' ' ' || true)
  [ "$code" -eq 1 ] && case "$want" in "${rules% }"*) true ;; *) false ;; esac && [ "$(wc -w <<< "$rules")" -eq 1 ] ||
    err "the fill script should refuse $f on '$want' alone (exit $code): $out"
done

[ "$fail" -eq 0 ] && echo "OK   page templates: $rendered pages rendered from their examples pass the page check, bad data is refused, and every agent has its template"
exit "$fail"
