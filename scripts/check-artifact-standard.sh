#!/usr/bin/env bash
# Checks the artifact standard (plugins/aspire/skills/aspire/references/artifact-standard.md):
#   - the standard and both logo files exist
#   - every agent in every plugin carries the standard's agent block verbatim, and a plugin with
#     agents holds the standard, the page standard, the reader standard and the logos at the paths
#     that block and the standards name (another plugin links to aspire's files rather than copying)
#   - the page standard stays a non-command skill, its tool list matches the Atlas tool contract,
#     and its self-check script gives every fixture in scripts/fixtures/page-standard/ its result
#   - the page blocks (skills/page-standard/blocks.md) have a snippet per block, take colors only
#     from the tokens, keep the Starter Guide palette, and a page built from all of them passes the self-check
#   - the standard's source sentence is written in that one file only, so the wording cannot drift
#   - the references that define a published page point to the standard, by its section name
#   - the standard's print block (section 6) holds the page footer and the print rules, the page
#     blocks' style carries the same rules, and no page CSS in a skill turns on dark mode in print
# What an agent actually publishes is not checked here; this keeps the instructions in step.
#
#   scripts/check-artifact-standard.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

P=plugins/aspire
R=$P/skills/aspire/references
STD=$R/artifact-standard.md
fail=0
err() { echo "FAIL $*"; fail=1; }

[ -f "$STD" ] || { echo "FAIL $STD is missing"; exit 1; }
for f in "$P/assets/aspire-animated.svg.md" "$P/assets/aspire-animated-small.svg.md"; do
  [ -f "$f" ] || err "$f is missing (the standard pastes it into pages)"
done

# The canonical agent block lives in the standard; every agent in every plugin carries it verbatim.
canon=$(awk '/<!-- agent-block -->/{f=1;next} /<!-- \/agent-block -->/{f=0} f' "$STD" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
[ -n "$canon" ] || err "the standard has no <!-- agent-block --> section"
for p in $(plugin_names); do
  src=$(plugin_src "$p")
  compgen -G "$src/agents/*.md" >/dev/null || continue
  if [ "$src" != "$P" ]; then
    # The block and the standard name these paths under the plugin's own root.
    for f in skills/aspire/references/artifact-standard.md skills/page-standard/SKILL.md skills/page-standard/page-check.md \
      skills/aspire/references/reader-standard.md assets/aspire-animated.svg.md assets/aspire-animated-small.svg.md; do
      [ -e "$src/$f" ] || { err "$p: $src/$f is missing; link it to $P/$f"; continue; }
      { [ -L "$src/$f" ] && [ "$src/$f" -ef "$P/$f" ]; } || err "$p: $src/$f must be a symbolic link to $P/$f, not a copy"
    done
  fi
  for f in "$src"/agents/*.md; do
    name=$(basename "$f" .md)
    mine=$(awk '/^## Artifact standard$/{f=1;print;next} f&&/^## /{f=0} f' "$f" | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}')
    [ -n "$mine" ] || { err "$p: $name has no '## Artifact standard' block (copy it from artifact-standard.md, section 5)"; continue; }
    [ "$mine" = "$canon" ] || err "$p: $name's Artifact standard block differs from the one in artifact-standard.md"
  done
done

# The wording lives in the standard only; another plugin's link to it is the same file.
while IFS= read -r f; do
  [ "$f" -ef "$STD" ] || err "$f restates the standard's source sentence; link artifact-standard.md instead"
done < <(grep -rlF 'Data compiled via proprietary AI brand memory' plugins --include='*.md' || true)
grep -qF 'Data compiled via proprietary AI brand memory as of' "$STD" || err "the standard lost its source sentence"
grep -qF 'Not for public publishing.' "$STD" || err "the standard lost its audience line"

# References that define a published page or deck, in the aspire plugin.
for f in ad-reuse affiliate cas-campaign content-library content-review content-sourcing creator-brief creator-card \
  creator-discovery creator-profile creator-vetting deliverable-tracker fulfillment market-signal negotiation \
  orchestrator outreach post-analysis ppa-pitch program program-dashboard program-ledger quality-review quarterly-signal \
  readout roster-manager shops first-run agents/decision-audit agents/sample-artifact; do
  [ -f "$R/$f.md" ] || { err "$R/$f.md is missing"; continue; }
  grep -q '\*\*Artifact standard\*\*' "$R/$f.md" || err "$f.md does not point to the artifact standard (cite it as **Artifact standard**, which SKILL.md's Sections index resolves)"
done

# Print (section 6): the print block holds the footer and the print rules, the page blocks' style
# carries the same rules word for word, and every dark-mode rule a skill writes for a page is
# screen only, so a printed page or PDF takes the light tokens.
print_style=$(awk '/^<!-- print-style -->$/{f=1;next} /^<!-- \/print-style -->$/{f=0} f' "$STD")
if [ -z "$print_style" ]; then
  err "the standard has no <!-- print-style --> block (section 6)"
else
  for need in '@page{' '@bottom-left{content:"{pageTitle}"' 'counter(page) " of " counter(pages)' \
    'print-color-adjust:exact' 'thead{display:table-header-group}' 'img[data-print="fit"]'; do
    grep -qF "$need" <<< "$print_style" || err "the standard's print block lost '$need'"
  done
  ! LC_ALL=C grep -q '[^ -~]' <<< "$print_style" || err "the standard's print block holds non-ASCII text; pages stay ASCII"
  grep -qF '/* print-rules */' <<< "$print_style" || err "the standard's print block has no /* print-rules */ section"
fi
for f in "$P/skills/page-standard/blocks.md" "$P/skills/page-standard/SKILL.md"; do
  grep -qF 'artifact-standard.md`, section 6' "$f" || err "$f does not point to the print block (artifact-standard.md, section 6)"
done
# Each dark-mode match is tested on its own: inline code is dropped, then every @media screen block
# (to its closing brace, or to the end of the line), and whatever dark rule is left is a print leak.
while IFS= read -r hit; do
  err "${hit%%:*} turns on dark mode in print (line ${hit#*:}); wrap it in @media screen (artifact-standard.md, section 6)"
done < <(grep -rnE 'prefers-color-scheme: ?dark|data-theme=.?dark|\.dark[ .{,]' plugins/*/skills plugins/*/agents --include='*.md' |
  awk '{
    line = $0; sub(/^[^:]*:[0-9]*:/, "", line); gsub(/`[^`]*`/, "", line)
    while ((i = index(line, "@media screen")) > 0) {
      j = i; depth = 0; opened = 0
      while (j <= length(line)) {
        ch = substr(line, j, 1)
        if (ch == "{") { depth++; opened = 1 } else if (ch == "}") { depth--; if (opened && depth == 0) break }
        j++
      }
      line = substr(line, 1, i - 1) substr(line, j + 1)
    }
    t = line; sub(/^[[:space:]]+/, "", t)
    if (line ~ /prefers-color-scheme: ?dark|data-theme=.?dark|(^|[ ,}])\.dark[ .{,]/ && (line ~ /\{/ || t ~ /^(@media|:root|\[|\.|html)/))
      { split($0, a, ":"); print a[1] ":" a[2] }
  }' || true)

# The page standard: a shared skill no one can call as a command, which the agent block links, and
# whose self-check script passes the good fixture and fails each bad one on the check it names.
PS=$P/skills/page-standard/SKILL.md
PC=$P/skills/page-standard/page-check.md
FX=scripts/fixtures/page-standard
if [ ! -f "$PS" ]; then
  err "$PS is missing"
else
  awk 'NR == 1 && /^---/ { fm = 1; next } fm && /^---/ { exit } fm' "$PS" | grep -qx 'user-invocable: false' ||
    err "$PS must set user-invocable: false in its frontmatter (it is never a command)"
  grep -qF 'skills/page-standard/SKILL.md' <<< "$canon" || err "the agent block does not link skills/page-standard/SKILL.md"
  [ -f "$FX/pass.html" ] || err "$FX/pass.html is missing (the page check needs a page that passes)"
  # The page blocks: linked from the page standard, one snippet per block in the table, colors only
  # from the tokens, and ASCII like the pages they go into.
  BL=$P/skills/page-standard/blocks.md
  blocks=""
  if [ ! -f "$BL" ]; then
    err "$BL is missing"
  else
    grep -qF 'skills/page-standard/blocks.md' "$PS" || err "$PS does not link skills/page-standard/blocks.md"
    blocks=$(awk -F'|' '/^\| Block \| Skeleton part/{f=1;next} f&&/^\|/{print $4} f&&!/^\|/{exit}' "$BL" | grep -o '`[a-z-]*`' | tr -d '`' | tr '\n' ' ' || true)
    [ -n "$blocks" ] || err "$BL has no block table"
    # A fenced snippet between <!-- NAME --> and <!-- /NAME -->, without its fence lines.
    section() { awk -v n="$1" '$0=="<!-- " n " -->"{f=1;next} $0=="<!-- /" n " -->"{f=0} f' "$BL" | sed '1d;$d'; }
    color='(#[0-9A-Fa-f]{3,8}([^0-9A-Za-z_-]|$)|(rgba?|hsla?|oklch)\()'
    for b in $blocks; do
      grep -qx "<!-- block:$b -->" "$BL" || { err "$BL lists the $b block but has no <!-- block:$b --> snippet"; continue; }
      snippet=$(section "block:$b")
      grep -qF "data-block=\"$b\"" <<< "$snippet" || err "$BL's $b snippet does not carry data-block=\"$b\""
      ! grep -qE "(fill|stroke|stop-color|color|background|border|outline|shadow)[a-z-]*(=\"|:)[^;\"]*$color" <<< "$snippet" ||
        err "$BL's $b snippet writes a color; take it from the tokens"
    done
    style=$(section block-style)
    [ -n "$style" ] || err "$BL has no <!-- block-style --> section"
    hexes=$(awk '/^\/\* Page blocks/{f=1} f' <<< "$style" | grep -oE "$color" | sort -u | tr '\n' ' ' || true)
    [ -z "$hexes" ] || err "$BL's block styles write colors ($hexes); take them from the tokens"
    # The default tokens are the Atlas Starter Guide's palette: every token both set in light mode
    # (their first :root rule) has the same value in each.
    # join needs both lists sorted on the token name alone, in one collation: a whole-line sort puts
    # --brand-ink before --brand ('-' < '='), which older joins only warn about and newer ones reject.
    light() { awk '/^:root\{/{f=1} f{print} f&&/\}/{exit}' | tr ';{}' '\n\n\n' | sed -nE 's/^[[:space:]]*(--[a-z0-9-]+):(.*)$/\1=\2/p' | LC_ALL=C sort -t= -k1,1; }
    drift=$(LC_ALL=C join -t= <(light <<< "$style") <(light < "$R/first-run.md") | awk -F= '$2!=$3{print $1" "$2" vs "$3}' | tr '\n' ',' || true)
    [ -z "$drift" ] || err "$BL's default tokens differ from first-run.md's palette: $drift"
    ! LC_ALL=C grep -q '[^ -~]' "$BL" || err "$BL holds non-ASCII text; pages stay ASCII"
  fi
  # The script's tool list matches the Atlas tool contract, so R11 catches every tool name.
  listed=$(awk '/^TOOLS = frozenset\("""/{f=1;next} f&&/^"""/{f=0} f' "$PC" | tr -s ' ' '\n' | sed '/^$/d' | sort -u)
  known=$(jq -r '.surfaces[] | keys[]' contract/atlas-mcp-tools.json | sort -u)
  [ "$listed" = "$known" ] || err "$PC's TOOLS list differs from contract/atlas-mcp-tools.json: $(diff <(echo "$known") <(echo "$listed") | grep '^[<>]' | tr '\n' ' ')"
  if command -v python3 >/dev/null; then
    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    awk '/^<!-- page-check -->$/{f=1;next} /^<!-- \/page-check -->$/{f=0} f' "$PC" | sed '1d;$d' > "$tmp/page_check.py"
    [ -s "$tmp/page_check.py" ] || err "$PC has no <!-- page-check --> script"
    # The page check reads the banned phrases from glossary.md beside it, as the skill's command copies it.
    cp "$P/skills/page-standard/glossary.md" "$tmp/" 2>/dev/null || err "$P/skills/page-standard/glossary.md is missing"
    grep -qF 'skills/page-standard/page-check.md' "$PS" || err "$PS does not link skills/page-standard/page-check.md"
    # Each fixture prints one result per scripted check (as many as pass.html prints) and no error:
    # a pass*.html page fails nothing, and a fail-rN*.html page fails RN and nothing else. Exit 2
    # means the script could not read the page.
    n=$(python3 -I "$tmp/page_check.py" "$FX/pass.html" 2>/dev/null | grep -c '"check": "R' || true)
    [ "$n" -gt 0 ] || err "page check printed no result for $FX/pass.html"
    for f in "$FX"/*.html; do
      [ -f "$f" ] || continue
      name=${f##*/}
      out=$(python3 -I "$tmp/page_check.py" "$f" 2>&1) && code=0 || code=$?
      [ "$code" -ne 2 ] && [ "$(grep -c '"check": "R' <<< "$out")" -eq "$n" ] && ! grep -q Traceback <<< "$out" ||
        { err "page check did not run cleanly on $f (exit $code): $out"; continue; }
      failed=$(grep -o '"check": "R[0-9]*", "name": "[^"]*", "result": "fail"' <<< "$out" | sed -E 's/^"check": "(R[0-9]+)".*/\1/' | tr '\n' ' ' || true)
      case $name in
        pass*) [ -z "$failed" ] || err "page check fails $failed on $f, which should pass: $out" ;;
        fail-r[0-9]*)
          want=$(sed -E 's/^fail-r([0-9]+).*/R\1/' <<< "$name")
          [ "$failed" = "$want " ] || err "page check fails '${failed:-nothing}' on $f, which should fail only $want: $out" ;;
        *) err "$f is named neither pass*.html nor fail-rN*.html" ;;
      esac
    done
    ran="page check gives every fixture its result"

    # The markup example in the page standard's section 5 is what agents copy, so it must pass R14.
    awk '/^## 5\. Markup/{f=1} f&&/^```html$/{g=1;next} g&&/^```$/{exit} g' "$PS" > "$tmp/markup.html"
    out=$(python3 -I "$tmp/page_check.py" "$tmp/markup.html" 2>&1) || true
    grep -q '"check": "R14", "name": "Data freshness", "result": "pass"' <<< "$out" ||
      err "the markup example in $PS (section 5) does not pass R14: $(grep '"R14"' <<< "$out")"

    # The like-for-like check's two numbers are set once, in comparisons.md, and the script holds the same.
    CM=$P/skills/page-standard/comparisons.md
    if [ ! -f "$CM" ]; then
      err "$CM is missing"
    else
      grep -qF 'comparisons.md' "$PS" || err "$PS does not link comparisons.md"
      line=$(sed -nE 's/^<!-- directional-max: ([0-9]+); in-line-points: ([0-9]+) -->$/\1 \2/p' "$CM")
      have="$(sed -nE 's/^DIRECTIONAL_MAX = ([0-9]+)$/\1/p' "$tmp/page_check.py") $(sed -nE 's/^IN_LINE_POINTS = ([0-9]+)$/\1/p' "$tmp/page_check.py")"
      [ -n "$line" ] && [ "$line" = "$have" ] ||
        err "$PC's DIRECTIONAL_MAX and IN_LINE_POINTS ($have) differ from $CM's directional-max line (${line:-none})"
      # comparisons.md is the only file that states either number. Elsewhere, a line about the
      # directional mark or a share in line with its group points there instead of naming a
      # number, and no line gives the directional line's number as a post threshold.
      if [ -n "$line" ]; then
        max=${line% *}
        th='[0-9]+ (posts )?or fewer|[0-9]+ or fewer posts|(fewer than|less than|under|below|more than) [0-9]+ posts|[0-9]+ posts minimum|within [0-9]+ points'
        own="$max (posts )?or fewer|$max or fewer posts|(fewer than|less than|under|below|more than) $max posts|$max posts minimum"
        while IFS= read -r hit; do
          [ -n "$hit" ] && err "${hit%%:*}:$(cut -d: -f2 <<< "$hit") restates a like-for-like number; point to $CM instead"
        done < <(grep -rniE "$th" plugins/*/skills plugins/*/agents docs/STANDARD.md .github/pull_request_template.md --include='*.md' 2>/dev/null |
          grep -v "^$CM:" | grep -iE "directional|in line with|^[^:]+:[0-9]+:.*($own)" || true)
      fi
      # The markup example in comparisons.md is what agents copy, so it must pass R15.
      awk '/^```html$/{g=1;next} g&&/^```$/{exit} g' "$CM" > "$tmp/compare.html"
      out=$(python3 -I "$tmp/page_check.py" "$tmp/compare.html" 2>&1) || true
      grep -q '"check": "R15", "name": "Like for like", "result": "pass"' <<< "$out" ||
        err "the markup example in $CM does not pass R15: $(grep '"R15"' <<< "$out")"
    fi

    # The cost and trend rules live in recommendations.md; their markup is on the blocks, which
    # the page built from every block (below) runs through R5.
    RC=$P/skills/page-standard/recommendations.md
    [ -f "$RC" ] || err "$RC is missing"
    grep -qF 'recommendations.md' "$PS" || err "$PS does not link recommendations.md"

    # R13 checks the metrics the page standard's required-metrics table names, code by code: the
    # table's Codes and On every cited post columns equal the script's REQUIRED_ROWS. The codes are
    # compared on their own too, so a code that requires no metric still needs its line: without it,
    # R13 fails every page that carries the code.
    rows=$(python3 -I -c '
import re, sys
skill, script = (open(p, encoding="utf-8").read() for p in sys.argv[1:3])
def pairs(lines):
    return sorted({(c, m) for codes, ms in lines for c in codes for m in ms})
block = re.search(r"^<!-- required-metrics -->$(.*?)^<!-- /required-metrics -->$", skill, re.S | re.M)
table = [] if not block else [(re.findall(r"\b[A-Z][0-9]+\b", cells[2]), re.findall(r"`([a-z]+)`", cells[3]))
         for cells in (l.split("|") for l in block.group(1).splitlines() if l.startswith("| ") and "---" not in l)
         if re.findall(r"\b[A-Z][0-9]+\b", cells[2])]
rows = re.search(r"^REQUIRED_ROWS = \"\"\"(.*?)^\"\"\"", script, re.S | re.M)
code = [] if not rows else [(l.split(":")[0].split(), l.split(":")[1].split()) for l in rows.group(1).strip().splitlines()]
a, b = pairs(table), pairs(code)
ca, cb = ({c for codes, _ in lines for c in codes} for lines in (table, code))
print("ok" if a and a == b and ca == cb else "table %s; script %s" % (
    sorted(set(a) - set(b)) + sorted(ca - cb), sorted(set(b) - set(a)) + sorted(cb - ca)))
' "$PS" "$PC" 2>&1 || true)
    [ "$rows" = ok ] || err "$PC's REQUIRED_ROWS differ from the required-metrics table in $PS (section 8): $rows"

    # The paid label wording is checked on the question codes post-kinds.md names (R ids aside), and it is the
    # only file that names them: they equal the script's PAID_CODES.
    PK=$P/skills/page-standard/post-kinds.md
    named=$(grep -oE '\b[A-QS-Z][0-9]+\b' "$PK" | sort -u | tr '\n' ' ')
    coded=$(sed -n 's/^PAID_CODES = {\(.*\)}$/\1/p' "$PC" | grep -oE '[A-Z][0-9]+' | sort -u | tr '\n' ' ')
    [ -n "$coded" ] && [ "$named" = "$coded" ] || err "$PC's PAID_CODES ($coded) differ from the question codes $PK names ($named)"

    # The page blocks: a page assembled from every block passes the page check, so a block can't
    # drift from the markup the script reads.
    if [ -n "$blocks" ]; then
      section block:coverage > "$tmp/coverage.html"
      {
        echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page blocks</title>'
        echo "$style"
        echo '</head><body>'
        section block:scope | sed -e "/the coverage strip (3.2) goes here/{r $tmp/coverage.html" -e 'd;}'
        for b in $blocks; do case $b in scope|coverage|freshness) ;; *) section "block:$b" ;; esac; done
        echo '<footer class="atlas-footnote">'
        section block:freshness
        echo '<p>Internal use only. Not for public publishing.</p></footer></body></html>'
      } > "$tmp/blocks.html"
      out=$(python3 -I "$tmp/page_check.py" "$tmp/blocks.html" 2>&1) && code=0 || code=$?
      # R10's length budget is measured on a page built from a template only, so it is unmarked here.
      [ "$code" -eq 0 ] && [ "$(grep -c '"result": "pass"' <<< "$out")" -eq "$((n - 1))" ] &&
        grep -q '"check": "R10", "name": "Fits the reader", "result": "unmarked"' <<< "$out" ||
        err "a page built from every block in $BL does not pass the page check (exit $code): $out"
      ran="$ran, and a page built from every block passes it"
    fi
  else
    echo "SKIP page check fixtures (no python3)"
    ran="page check fixtures not run (no python3)"
  fi
fi

[ "$fail" -eq 0 ] && echo "OK   artifact standard is linked from every agent and page reference, pages print in the light theme; ${ran:-page check not run}"
exit "$fail"
