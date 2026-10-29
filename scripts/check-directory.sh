#!/usr/bin/env bash
# Checks what the Anthropic plugin directory's scan blocks or holds a version for, before a push
# reaches it (docs/PLUGIN-LIFECYCLE.md, section 10, has the findings and which ones we keep on purpose):
#   - a mod's capability object $ is used only in the plain form the directory reads
#     (MOD_CAPABILITY_USE_NOT_PLAIN, blocking): every helper that takes $ is a function declaration,
#     never a const or let arrow, and $ is never wrapped in parentheses, a cast, "!", "?." or brackets.
#     A helper that takes $ has a name no other binding in the file uses: the directory resolves it by
#     name, and blocked 4.1.0 and 4.1.1 on every call to `count($, ...)` while `count` was also a number
#     parameter elsewhere in register.tsx. As a precaution, not a proven cause, a callback passed with $
#     (update($, atom, s => ...)) uses no bracketed member or key either
#   - every text file in a plugin is small enough for the validator to read (BINARIES_NOT_INSPECTED).
#     The directory publishes no limit. The largest file it has read is 216,907 bytes (SKILL.md in
#     4.0.0) and the smallest it skipped 820,928 (cas-campaign.md), so a file over 256 KiB fails and
#     one past the known-good size gets a note to split it before it grows further
#   - a plugin with a mod says in its README what its hooks do (MOD_ANSWERS_FOR_TOOL,
#     MOD_HOOKS_OPERATION, MOD_HOOKS_POLICY_EVENT): each tool it registers, each prompt, message
#     and agent event it hooks, and the tools it answers itself
# plugin.json carrying no version is check-channel.sh's rule, kept on purpose; it is not checked here.
#
#   scripts/check-directory.sh
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/plugins.sh

MAX_BYTES=262144
KNOWN_READ=216907
fail=0
err() { echo "FAIL $*"; fail=1; }

for p in $(plugin_names); do
  src=$(plugin_src "$p")

  # Text files the validator must read whole.
  while IFS= read -r f; do
    size=$(wc -c < "$f" | tr -d ' ')
    if [ "$size" -gt "$MAX_BYTES" ]; then
      err "$f is $size bytes, over $MAX_BYTES: the directory cannot inspect it; split it by section"
    elif [ "$size" -gt "$KNOWN_READ" ]; then
      echo "note $f is $size bytes, past the largest file the directory is known to read ($KNOWN_READ); split it before it grows"
    fi
  done < <(find "$src" -type f ! -name '*.png' ! -name '*.jpg' ! -name '*.jpeg' ! -name '*.gif' ! -name '*.webp' \
    ! -name '*.ico' ! -name '*.woff' ! -name '*.woff2' ! -name '*.ttf' ! -name '*.otf' | sort)

  H=$src/hooks
  compgen -G "$H/*.ts*" >/dev/null || continue

  # $ in the plain form, in every mod source that is not a test.
  srcs=$(ls "$H"/*.ts "$H"/*.tsx 2>/dev/null | grep -vE '\.test\.tsx?$')
  arrow='^[[:space:]]*(export[[:space:]]+)?(const|let|var)[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*=[[:space:]]*(async[[:space:]]*)?\(\$[,:)]'
  wrapped='(^|[^A-Za-z0-9_$])\(\$\)\.|\(\$[[:space:]]+as[[:space:]]|\$!|\$\?\.|\$\[|\$\.[A-Za-z_]+(\?\.|!|\[)'
  comment=':[0-9]+:[[:space:]]*(//|/\*|\*)'
  bracketed='(update|read)\(\$,[^;]*\[[^]]+\]'
  for f in $srcs; do
    while IFS= read -r hit; do
      [ -n "$hit" ] && err "$f:${hit%%:*}: a helper that takes \$ must be a function declaration, not a const arrow"
    done <<<"$(grep -nE "$arrow" "$f" || true)"
    while IFS= read -r hit; do
      [ -n "$hit" ] && err "$f:${hit%%:*}: write \$ as a plain \$.noun.method(...) call, with nothing wrapped around its parts"
    done <<<"$(grep -HnE "$wrapped" "$f" | grep -vE "$comment" | cut -d: -f2- || true)"
    while IFS= read -r hit; do
      [ -n "$hit" ] && err "$f:${hit%%:*}: a callback passed with \$ uses no brackets; move the work into a function that does not take \$"
    done <<<"$(grep -HnE "$bracketed" "$f" | grep -vE "$comment" | cut -d: -f2- || true)"
    for h in $(grep -oE '^(export[[:space:]]+)?(async[[:space:]]+)?function[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*\(\$' "$f" |
      sed -E 's/.*function[[:space:]]+//; s/[[:space:]]*\(\$$//' | sort -u); do
      while IFS= read -r hit; do
        [ -n "$hit" ] && err "$f:${hit%%:*}: '$h' takes \$ and is also bound here; give the helper a name nothing else in the file uses"
      done <<<"$(grep -nE "(\b(const|let|var)[[:space:]]+$h\b|[(,{][[:space:]]*$h[[:space:]]*[:=,)}?])" "$f" | grep -vE '^[0-9]+:[[:space:]]*(//|/\*|\*)' || true)"
    done
  done

  # The README says what the hooks do.
  R=$src/README.md
  [ -f "$R" ] || { err "$src has a mod but no README.md"; continue; }
  grep -q '^### What each hook does' "$R" || { err "$R has no '### What each hook does' section for the mod"; continue; }
  doc=$(awk '/^### What each hook does/{on=1; next} on && /^#/{exit} on' "$R")
  for ev in prompt.submit session.receive agent.spawn; do
    grep -qE "on\\(['\"]${ev//./\\.}['\"]" $srcs || continue
    grep -qF "\`$ev\`" <<<"$doc" || err "$R, What each hook does: the mod hooks $ev but the section does not name \`$ev\`"
  done
  for tool in $(grep -hA1 -E '\$\.tool\.register\(' $srcs | grep -oE "name: *['\"][A-Za-z0-9_]+['\"]" | sed -E "s/name: *['\"]//; s/['\"]$//" | sort -u); do
    grep -qF "\`$tool\`" <<<"$doc" || err "$R, What each hook does: the mod registers $tool but the section does not name it"
  done
  if grep -qE "on\\(['\"]tool\\.call['\"][^)]*async[[:space:]]*\\(\\\$, *e\\)" $srcs; then
    grep -q 'Tools the mod answers itself' <<<"$doc" || err "$R, What each hook does: a tool.call hook answers without next; say which tools under 'Tools the mod answers itself'"
  fi
done

[ "$fail" -eq 0 ] && echo "OK   plugins pass the directory's mod form, file size, and hook documentation checks"
exit "$fail"
