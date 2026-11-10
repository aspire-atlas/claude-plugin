#!/usr/bin/env bash
# Checks the layout of every skill, so a skill stays cheap to load (Anthropic's skill guidance:
# a SKILL.md of at most 500 lines, references one level deep, a table of contents in a long file):
#   - lines:       no skills/*/SKILL.md is over 500 lines
#   - description: no SKILL.md frontmatter description is over 1,024 characters
#   - chain:       no file under skills/*/references/ cites another file under references/, as
#                  references/<name>.md or as a bare <name>.md that exists there. Citing SKILL.md
#                  or anything under page-standard is fine; any other exception is a line in
#                  ALLOW below
#   - contents:    every Markdown file over 100 lines under skills/ has a "## Contents" section
#                  with at least one link, and each of its links resolves to a heading in the file
# The fixtures in scripts/fixtures/skill-layout/ hold one skills/ tree each: a pass*/ tree fails
# nothing, and a fail-<rule>*/ tree fails that rule and no other.
#
#   scripts/check-skill-layout.sh             # the fixtures, then every plugin's skills
#   scripts/check-skill-layout.sh --fixtures  # only the fixtures
#   scripts/check-skill-layout.sh --tree      # only the plugins' skills
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

MAX_LINES=500
MAX_DESC=1024
TOC_OVER=100
FX=scripts/fixtures/skill-layout

# Reference citations allowed besides SKILL.md and page-standard. Shrink-only: never add a line to
# make a new citation pass (move what the file needs into it, or route through SKILL.md), and
# remove a line once its citation is gone; a line that matches no citation fails the check.
# One per line: <citing file, from the repository root>|<cited file, from its references/>|<reason>
ALLOW='plugins/aspire/skills/aspire/references/running-agents.md|agents/decision-audit.md|the launch message gives a general-purpose subagent the path of its brief; a subagent cannot resolve a section name
plugins/aspire/skills/aspire/references/samples.md|agents/sample-artifact.md|the launch message gives a general-purpose subagent the path of its brief; a subagent cannot resolve a section name'

mode=${1:-all}
case $mode in all|--fixtures|--tree) ;; *) echo "usage: $0 [--fixtures|--tree]" >&2; exit 2 ;; esac

# The description as YAML folds it; the same reading as scripts/check-directory.sh.
description() {
  awk '
    { sub(/\r$/, "") }
    NR == 1 && /^---[[:space:]]*$/ { fm = 1; next }
    fm && /^---[[:space:]]*$/ { exit }
    fm && /^description:/ {
      found = 1; cont = 1
      v = $0; sub(/^description:[[:space:]]*/, "", v)
      if (v ~ /^[>|]/) blk = 1; else d = v
      next
    }
    fm && cont && /^[[:space:]]*$/ { d = d "\n"; next }
    fm && cont && /^[[:space:]]+/ {
      v = $0; sub(/^[[:space:]]+/, "", v)
      d = (d == "" || d ~ /\n$/ ? d v : d " " v); next
    }
    fm && cont { cont = 0 }
    END {
      if (!found) exit 1
      sub(/\n+$/, "", d)
      if (!blk && d ~ /^"/) { sub(/^"/, "", d); sub(/"[[:space:]]*$/, "", d); gsub(/\\"/, "\"", d) }
      else if (!blk && d ~ /^'\''/) { sub(/^'\''/, "", d); sub(/'\''[[:space:]]*$/, "", d); gsub(/'\'\''/, "'\''", d) }
      else if (!blk) sub(/[[:space:]]+#.*$/, "", d)
      printf "%s", d
    }' "$1"
}

# Prints "contents|<file>: <what is wrong>" for a file over TOC_OVER lines. Headings and the
# Contents section are read outside code fences. A heading's anchor is built the way GitHub builds
# it: lower case, ASCII punctuation other than - and _ dropped, each space a hyphen, and -1, -2, ...
# on a repeat. An <a id="..."> or name="..." also counts as a link target.
contents() {
  awk -v f="$1" -v over="$TOC_OVER" '
    function slug(s) {
      s = tolower(s)
      gsub(/[!-,.\/:-@\[-^`{-~]/, "", s)
      gsub(/ /, "-", s)
      return s
    }
    { sub(/\r$/, "") }
    /^ ? ? ?(```|~~~)/ { fence = !fence; next }
    fence { next }
    /^#+ / && !/^#######/ {
      level = index($0, " ") - 1
      t = $0; sub(/^#+ +/, "", t); sub(/ +#+ *$/, "", t); sub(/ +$/, "", t)
      if (level == 2 && t == "Contents" && !seen) { seen = 1; toc = 1; next }
      if (level <= 2) toc = 0
      s = slug(t)
      if (s in n) { ids[s "-" n[s]] = 1; n[s]++ } else { ids[s] = 1; n[s] = 1 }
      next
    }
    {
      r = $0
      while (match(r, /(id|name)="[^"]+"/)) {
        a = substr(r, RSTART, RLENGTH); sub(/^[a-z]+="/, "", a); sub(/"$/, "", a)
        ids[a] = 1; r = substr(r, RSTART + RLENGTH)
      }
    }
    toc {
      r = $0
      while (match(r, /\]\(#[^)]*\)/)) {
        links[++nl] = substr(r, RSTART + 3, RLENGTH - 4); at[nl] = NR
        r = substr(r, RSTART + RLENGTH)
      }
    }
    END {
      if (NR <= over) exit
      if (!seen) { print "contents|" f ": " NR " lines and no \"## Contents\" section"; exit }
      if (!nl) print "contents|" f ": its \"## Contents\" section has no link to a heading"
      for (i = 1; i <= nl; i++)
        if (!(links[i] in ids)) print "contents|" f ":" at[i] ": Contents links to #" links[i] ", which is no heading in the file"
    }' "$1"
}

# Prints "chain|<file>:<line>: ..." for each reference file another reference file cites, once per
# cited file. $1: the skills/ folder, $2: the citing file, $3: its references/ folder.
chain() {
  local S=$1 f=$2 R=$3 hit line tok rel target seen='|' other
  while IFS= read -r hit; do
    [ -n "$hit" ] || continue
    line=${hit%%:*}; tok=${hit#*:}
    tok=$(sed -E 's/\.md.$/.md/; s#^(\./)+##' <<< "$tok")
    case $tok in SKILL.md|*/SKILL.md|*page-standard*) continue ;; esac
    target=
    case $tok in
      *references/*)
        rel=${tok##*references/}
        other=$(sed -nE 's#^(.*/)?skills/([^/]+)/references/.*#\2#p' <<< "$tok")
        if [ -n "$other" ] && [ -f "$S/$other/references/$rel" ]; then target=$S/$other/references/$rel
        elif [ -f "$R/$rel" ]; then target=$R/$rel; fi ;;
      */*)
        if [ -f "$(dirname "$f")/$tok" ]; then target=$(dirname "$f")/$tok
        elif [ -f "$R/$tok" ]; then target=$R/$tok; fi ;;
      *) target=$(find "$R" -type f -name "$tok" | sort | head -1) ;;
    esac
    [ -n "$target" ] || continue
    # Only a file under a references/ folder counts, and a file may name itself.
    target=$(cd "$(dirname "$target")" && pwd -P)/${target##*/}
    case $target in */references/*) ;; *) continue ;; esac
    [ "$target" != "$(cd "$(dirname "$f")" && pwd -P)/${f##*/}" ] || continue
    rel=${target##*/references/}
    case $seen in *"|$rel|"*) continue ;; esac
    seen="$seen$rel|"
    echo "chain|$f:$line: cites references/$rel; a reference file is read from SKILL.md, never from another reference|$f|$rel"
  done < <(grep -noE '[A-Za-z0-9_./-]*[A-Za-z0-9_-]\.md([^A-Za-z0-9_-]|$)' "$f" || true)
}

# Every finding in one skills/ folder, one per line: <rule>|<message>[|<citing file>|<cited file>].
check_tree() {
  local S=$1 f desc len lines R
  while IFS= read -r f; do
    lines=$(awk 'END { print NR }' "$f")
    [ "$lines" -le "$MAX_LINES" ] || echo "lines|$f: $lines lines, over $MAX_LINES; move detail into a reference file"
    if desc=$(description "$f"); then
      len=$(printf '%s' "$desc" | LC_ALL=C.UTF-8 wc -m | tr -d ' ')
      [ "$len" -le "$MAX_DESC" ] || echo "description|$f: description is $len characters, over the $MAX_DESC the skill spec allows"
    else
      echo "description|$f: no description in its frontmatter"
    fi
  done < <(find "$S" -mindepth 2 -maxdepth 2 -name SKILL.md | sort)
  while IFS= read -r f; do
    R=${f%"${f#"$S"/*/references/}"}
    chain "$S" "$f" "${R%/}"
  done < <(find "$S" -path "$S/*/references/*" -name '*.md' -type f | sort)
  while IFS= read -r f; do contents "$f"; done < <(find "$S" -name '*.md' -type f | sort)
}

fail=0
err() { echo "FAIL $*"; fail=1; }
ran=

if [ "$mode" != --tree ]; then
  cases=0
  for d in "$FX"/*/; do
    [ -d "$d" ] || continue
    d=${d%/}; name=${d##*/}; cases=$((cases + 1))
    [ -d "$d/skills" ] || { err "$d has no skills/ folder"; continue; }
    out=$(check_tree "$d/skills")
    got=$(cut -d'|' -f1 <<< "$out" | sort -u | tr '\n' ' ' | sed 's/^ *//; s/ *$//')
    case $name in
      pass*) [ -z "$got" ] || err "fixture $d should pass and fails '$got': $out" ;;
      fail-lines*|fail-description*|fail-chain*|fail-contents*)
        want=$(sed -E 's/^fail-([a-z]+).*/\1/' <<< "$name")
        [ "$got" = "$want" ] || err "fixture $d should fail only '$want' and fails '${got:-nothing}': $out" ;;
      *) err "$d is named neither pass* nor fail-<lines|description|chain|contents>*" ;;
    esac
  done
  [ "$cases" -gt 0 ] || err "no fixtures in $FX"
  ran="$cases fixtures give their result"
fi

if [ "$mode" != --fixtures ]; then
  used='
'
  files=0
  for p in $(plugin_names); do
    src=$(plugin_src "$p")
    [ -d "$src/skills" ] || continue
    files=$((files + $(find "$src/skills" -name '*.md' -type f | wc -l)))
    while IFS='|' read -r rule msg from to; do
      [ -n "$rule" ] || continue
      if [ "$rule" = chain ] && grep -q "^$from|$to|..*" <<< "$ALLOW"; then
        used="$used$from|$to
"
        continue
      fi
      err "$msg"
    done < <(check_tree "$src/skills")
  done
  while IFS='|' read -r from to reason; do
    [ -n "$from" ] || continue
    [ -n "$reason" ] || err "ALLOW line $from|$to has no reason"
    case $used in *"
$from|$to
"*) ;; *) err "ALLOW line $from|$to matches no citation; remove it" ;; esac
  done <<< "$ALLOW"
  ran="${ran:+$ran; }$files skill files are within the layout"
fi

[ "$fail" -eq 0 ] && echo "OK   $ran" ||
  echo "     Skill layout: SKILL.md at most $MAX_LINES lines, description at most $MAX_DESC characters, no reference citing another reference, a linked \"## Contents\" in every file over $TOC_OVER lines."
exit "$fail"
