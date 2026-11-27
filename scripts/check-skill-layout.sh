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
#   - budget:      a word cap on what each run loads before it starts: the files every run that
#                  launches an agent reads (COMMON, together), each file under references/
#                  (REF_MAX, or its own ceiling in BIG), and the page standard every agent reads
#                  (PAGE_STD). Words are tokens between ASCII whitespace, counted by words()
#                  the same on every machine; at about 1.35 tokens a word, COMMON_MAX words is
#                  the common path's token budget
# The fixtures in scripts/fixtures/skill-layout/ hold one skills/ tree each: a pass*/ tree fails
# nothing, and a fail-<rule>*/ tree fails that rule and no other. A fixture's budget.env, beside
# its skills/ folder, sets lower caps so a small tree can exceed them.
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

# The load budget. COMMON lists, from a plugin's skills/ folder, the files every run that launches an
# agent loads before it starts; their words together stay at most COMMON_MAX (14,800 words, about
# 20,000 tokens). Every other reference a run loads is read only when its flow or step is due, so it
# stays out of COMMON: never add a file there to make room, and move a section out instead of
# raising the cap. COMMON_MAX is the agreed target itself, so its margin comes from the files: keep
# them a section's worth under it (about 150 words), so a small fix does not need a move first.
# PAGE_STD_MAX leaves about 200 words over today's page standard; its 500-line cap binds first.
COMMON='aspire/SKILL.md aspire/references/orchestration.md aspire/references/running-agents.md'
COMMON_MAX=14800
REF_MAX=12000
PAGE_STD=page-standard/SKILL.md
PAGE_STD_MAX=7300
# References over REF_MAX, each with its own ceiling. Shrink-only: lower a ceiling when its file
# shrinks, remove a line once its file is under REF_MAX, and never add one (split the file by
# section instead). One per line: <file, from the skills/ folder>|<most words>
BIG='aspire/references/cas-campaign.md|26440
aspire/references/cas-campaign-data.md|19150
aspire/references/cas-campaign-page.md|21712
aspire/references/cas-campaign-page-brief.md|25560
aspire/references/cas-campaign-page-creators.md|24061
aspire/references/cas-campaign-page-results.md|27356
aspire/references/creator-vetting.md|14689'
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
# Contents section are read outside code fences; a fence closes only on a line of the same
# character at least as long as the one that opened it, so a fence can hold a shorter one. A
# heading's anchor is built the way GitHub builds it from the heading's text: a link counts as its
# text and emphasis underscores are dropped, then lower case, ASCII punctuation other than - and _
# dropped, each space a hyphen, and -1, -2, ... on a repeat. An id or name attribute of an HTML
# tag outside a code span also counts as a link target.
contents() {
  awk -v f="$1" -v over="$TOC_OVER" '
    function runlen(s, c,   i) { i = 1; while (substr(s, i, 1) == c) i++; return i - 1 }
    function plain(t,   a, w, n, i, out) {
      while (match(t, /\[[^]]*\]\([^)]*\)/)) {
        a = substr(t, RSTART + 1, RLENGTH - 1); sub(/\].*$/, "", a)
        t = substr(t, 1, RSTART - 1) a substr(t, RSTART + RLENGTH)
      }
      n = split(t, w, " "); out = ""
      for (i = 1; i <= n; i++) {
        if (w[i] !~ /^`/) { sub(/^_+/, "", w[i]); sub(/_+$/, "", w[i]) }
        out = out (i > 1 ? " " : "") w[i]
      }
      return out
    }
    function slug(s) {
      s = tolower(s)
      gsub(/[!-,.\/:-@\[-^`{-~]/, "", s)
      gsub(/ /, "-", s)
      return s
    }
    { sub(/\r$/, ""); line = $0; sub(/^ ? ? ?/, "", line); c = substr(line, 1, 1) }
    fence {
      k = runlen(line, fc)
      if (k >= fl && substr(line, k + 1) ~ /^[ \t]*$/) fence = 0
      next
    }
    (c == "`" || c == "~") && runlen(line, c) >= 3 {
      k = runlen(line, c)
      if (c == "~" || index(substr(line, k + 1), "`") == 0) { fence = 1; fc = c; fl = k; next }
    }
    /^#+ / && !/^#######/ {
      level = index($0, " ") - 1
      t = $0; sub(/^#+ +/, "", t); sub(/ +#+ *$/, "", t); sub(/ +$/, "", t)
      s = slug(plain(t))
      if (s in n) { ids[s "-" n[s]] = 1; n[s]++ } else { ids[s] = 1; n[s] = 1 }
      if (level == 2 && t == "Contents" && !seen) { seen = 1; toc = 1 } else if (level <= 2) toc = 0
      next
    }
    {
      r = $0; gsub(/`[^`]*`/, "", r)
      while (match(r, /<[A-Za-z][^>]*[ \t](id|name)="[^"]+"/)) {
        a = substr(r, RSTART, RLENGTH); sub(/^.*="/, "", a); sub(/"$/, "", a)
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

# Prints "chain|<file>:<line>: ...|<file>|<cited file>" for each reference file another reference
# file cites, once per cited file. $1: the skills/ folder, $2: its absolute path, $3: the citing
# file, $4: its references/ folder, $5: the .md files under that folder, one per line.
# A citation is a token ending in .md: with references/ in it, the path after references/ in the
# skill named just before it (skills/<name>/references/ or <name>/references/) or in the citing
# file's own skill; with another folder in it, a path from the citing file's folder or from its
# references/ folder; bare, a file of that name anywhere under its references/ folder. SKILL.md
# and a path through a page-standard folder are never citations. A reference file in another
# plugin is not resolved.
chain() {
  local S=$1 Sabs=$2 f=$3 R=$4 refs=$5 hits line tok t2 rel pre other target base self r seen='|'
  hits=$(LC_ALL=C grep -noE '[A-Za-z0-9_./-]*[A-Za-z0-9_-]\.md([^A-Za-z0-9_-]|$)' "$f") || [ $? -eq 1 ] || return 1
  [ -n "$hits" ] || return 0
  # One line per distinct token, at its first line, without the character after .md or a leading ./
  hits=$(LC_ALL=C awk -F: '{ t = $2; sub(/\.md[^A-Za-z0-9_-]*$/, ".md", t); while (t ~ /^\.\//) t = substr(t, 3)
    if (!s[t]++) print $1 ":" t }' <<< "$hits") || return 1
  while IFS=: read -r line tok; do
    [ -n "$tok" ] || continue
    t2=/$tok
    case $t2 in */SKILL.md|*/page-standard/*) continue ;; esac
    target=
    case $t2 in
      */references/*)
        rel=${t2##*/references/}; pre=${t2%/references/*}; other=${pre##*/}
        if [ -n "$other" ] && [ "$other" != .. ] && [ -f "$S/$other/references/$rel" ]; then target=$S/$other/references/$rel
        elif [ -f "$R/$rel" ]; then target=$R/$rel; fi ;;
      /*/*)
        if [ -f "${f%/*}/$tok" ]; then target=${f%/*}/$tok
        elif [ -f "$R/$tok" ]; then target=$R/$tok; fi ;;
      *)
        case "$refs
" in *"/$tok
"*) while IFS= read -r r; do if [ "${r##*/}" = "$tok" ]; then target=$r; break; fi; done <<< "$refs" ;; esac ;;
    esac
    [ -n "$target" ] || continue
    # Only a file under a skill's references/ folder counts, and a file may name itself.
    case $target in
      */../*|*/./*) target=$(cd "${target%/*}" && pwd -P)/${target##*/}; base=$Sabs; self=$Sabs/${f#"$S"/} ;;
      *) base=$S; self=$f ;;
    esac
    [ "$target" != "$self" ] || continue
    case $target in "$base"/*/references/*) ;; *) continue ;; esac
    rel=${target#"$base"/*/references/}
    case $seen in *"|$rel|"*) continue ;; esac
    seen="$seen$rel|"
    echo "chain|$f:$line: cites references/$rel; a reference file is read from SKILL.md, never from another reference|$f|$rel"
  done <<< "$hits"
}

# The words in a file: tokens between ASCII whitespace, a standalone "→" or "·" included. Not wc -w:
# GNU wc skips a token with no printable character in the C locale, and versions disagree on it.
words() { LC_ALL=C awk '{n+=NF} END{print n+0}' "$1"; }

# Prints "budget|<what is over>" for each cap a skills/ folder ($1) exceeds.
budget() {
  local S=$1 f rel n total=0 found= cap
  for rel in $COMMON; do
    [ -f "$S/$rel" ] || continue
    n=$(words "$S/$rel") || return 1; total=$((total + n)); found=1
  done
  [ -z "$found" ] || [ "$total" -le "$COMMON_MAX" ] ||
    echo "budget|$S: the files every run loads ($COMMON) hold $total words, over $COMMON_MAX (about $((COMMON_MAX * 135 / 100)) tokens); move a section a run needs only sometimes into its own reference"
  if [ -f "$S/$PAGE_STD" ]; then
    n=$(words "$S/$PAGE_STD") || return 1
    [ "$n" -le "$PAGE_STD_MAX" ] || echo "budget|$S/$PAGE_STD: $n words, over $PAGE_STD_MAX; every agent loads it, so move detail into a file beside it"
  fi
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    rel=${f#"$S"/}
    cap=$(awk -F'|' -v r="$rel" '$1 == r { print $2 }' <<< "$BIG")
    n=$(words "$f") || return 1
    [ "$n" -le "${cap:-$REF_MAX}" ] || echo "budget|$f: $n words, over ${cap:-$REF_MAX}; split it by section"
  done < <(find "$S" -path "$S/*/references/*" -name '*.md' -type f | sort)
}

# Every finding in one skills/ folder, one per line: <rule>|<message>[|<citing file>|<cited file>].
# Returns 1 when a file could not be read or checked, so a broken run never looks like a pass.
check_tree() {
  local S=$1 Sabs f desc len lines R last= refs= list
  Sabs=$(cd "$S" && pwd -P) || return 1
  list=$(find "$S" -mindepth 2 -maxdepth 2 -name SKILL.md | sort) || return 1
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    lines=$(awk 'END { print NR }' "$f") || return 1
    [ "$lines" -le "$MAX_LINES" ] || echo "lines|$f: $lines lines, over $MAX_LINES; move detail into a reference file"
    if desc=$(description "$f"); then
      len=$(printf '%s' "$desc" | LC_ALL=C.UTF-8 wc -m | tr -d ' ')
      [ "$len" -le "$MAX_DESC" ] || echo "description|$f: description is $len characters, over the $MAX_DESC the skill spec allows"
    else
      echo "description|$f: no description in its frontmatter"
    fi
  done <<< "$list"
  list=$(find "$S" -path "$S/*/references/*" -name '*.md' -type f | sort) || return 1
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    R=${f%"${f#"$S"/*/references/}"}; R=${R%/}
    if [ "$R" != "$last" ]; then refs=$(find "$R" -name '*.md' -type f | sort) || return 1; last=$R; fi
    chain "$S" "$Sabs" "$f" "$R" "$refs" || return 1
  done <<< "$list"
  list=$(find "$S" -name '*.md' -type f | sort) || return 1
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    contents "$f" || return 1
  done <<< "$list"
  budget "$S" || return 1
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
    out=$(if [ -f "$d/budget.env" ]; then . "$d/budget.env"; fi; check_tree "$d/skills") || { err "could not check fixture $d: $out"; continue; }
    got=$(cut -d'|' -f1 <<< "$out" | sort -u | tr '\n' ' ' | sed 's/^ *//; s/ *$//')
    case $name in
      pass*) [ -z "$got" ] || err "fixture $d should pass and fails '$got': $out" ;;
      fail-lines*|fail-description*|fail-chain*|fail-contents*|fail-budget*)
        want=$(sed -E 's/^fail-([a-z]+).*/\1/' <<< "$name")
        [ "$got" = "$want" ] || err "fixture $d should fail only '$want' and fails '${got:-nothing}': $out" ;;
      *) err "$d is named neither pass* nor fail-<lines|description|chain|contents|budget>*" ;;
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
    out=$(check_tree "$src/skills") || { err "could not check $src/skills: $out"; continue; }
    while IFS='|' read -r rule msg from to; do
      [ -n "$rule" ] || continue
      if [ "$rule" = chain ]; then
        case "
$ALLOW" in *"
$from|$to|"?*)
          used="$used$from|$to
"
          continue ;;
        esac
      fi
      err "$msg"
    done <<< "$out"
  done
  while IFS='|' read -r from to reason; do
    [ -n "$from" ] || continue
    [ -n "$reason" ] || err "ALLOW line $from|$to has no reason"
    case $used in *"
$from|$to
"*) ;; *) err "ALLOW line $from|$to matches no citation; remove it" ;; esac
  done <<< "$ALLOW"
  # Every BIG line names a reference still over REF_MAX, so the list only shrinks.
  big_src=$(plugin_src aspire)/skills
  while IFS='|' read -r rel cap; do
    [ -n "$rel" ] || continue
    if [ ! -f "$big_src/$rel" ]; then err "BIG line $rel matches no file; remove it"; continue; fi
    n=$(words "$big_src/$rel")
    [ "$n" -gt "$REF_MAX" ] || err "BIG line $rel: the file is down to $n words, under $REF_MAX; remove its line"
  done <<< "$BIG"
  ran="${ran:+$ran; }$files skill files are within the layout and the load budget"
fi

[ "$fail" -eq 0 ] && echo "OK   $ran" ||
  echo "     Skill layout: SKILL.md at most $MAX_LINES lines, description at most $MAX_DESC characters, no reference citing another reference, a linked \"## Contents\" in every file over $TOC_OVER lines, and the load budget (the files every run loads at most $COMMON_MAX words together, a reference at most $REF_MAX, the page standard at most $PAGE_STD_MAX)."
exit "$fail"
