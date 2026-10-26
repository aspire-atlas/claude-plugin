# Shared helpers for the checks and workflows that loop over the plugins this
# marketplace lists. Source it from the repository root:
#
#   . scripts/plugins.sh
#   for p in $(plugin_names); do src=$(plugin_src "$p"); ...; done
#
# Conventions every plugin follows (scripts/check-channel.sh enforces them):
#   - it lives in plugins/<name>/ and its entry's source is "./plugins/<name>"
#   - on main its entry carries the version; nothing else does. A plugin not
#     ready to release is held back on main by leaving its entry out there
#   - it is released under the tag <name>--vX.Y.Z with notes from its own
#     changelog, plugins/<name>/CHANGELOG.md
# The first plugin, aspire, predates the others and keeps its history: its
# changelog is the root CHANGELOG.md and its releases are tagged vX.Y.Z (the
# release workflow also adds aspire--vX.Y.Z for dependency version ranges).

PLUGINS_MARKETPLACE=.claude-plugin/marketplace.json

# Plugin names in marketplace order. $1: another marketplace.json (default: this one).
plugin_names() { jq -r '.plugins[].name' "${1:-$PLUGINS_MARKETPLACE}"; }

# The plugin's folder, without the leading "./". Fails when the entry has no
# relative-path source, so a caller never works on an empty path.
plugin_src() {
  local src
  src=$(jq -r --arg n "$1" '.plugins[] | select(.name == $n) | .source | if type == "string" then . else empty end' \
    "$PLUGINS_MARKETPLACE")
  case "$src" in
    ./?*) echo "${src#./}" ;;
    *) echo "plugin_src: $1 has no ./ source in $PLUGINS_MARKETPLACE" >&2; return 1 ;;
  esac
}

# The version on the plugin's entry, or nothing. $2: another marketplace.json.
plugin_version() {
  jq -r --arg n "$1" '.plugins[] | select(.name == $n) | .version // empty' "${2:-$PLUGINS_MARKETPLACE}"
}

plugin_changelog() {
  local src
  if [ "$1" = aspire ]; then echo CHANGELOG.md; else src=$(plugin_src "$1") && echo "$src/CHANGELOG.md"; fi
}

# Pathspecs for what plugin $1 ships, leaving out its own changelog, so a
# changelog edit alone never counts as a content change.
plugin_content() {
  local src
  src=$(plugin_src "$1") || return 1
  echo "$src"
  echo ":(exclude)$src/CHANGELOG.md"
}

# The release tag for plugin $1 at version $2.
plugin_tag() {
  if [ "$1" = aspire ]; then echo "v$2"; else echo "$1--v$2"; fi
}

# The highest version of plugin $1 that has a release tag, or nothing.
plugin_latest_tagged() {
  local prefix t
  prefix=$(plugin_tag "$1" "")
  for t in $(git tag -l "$prefix*" 2>/dev/null); do echo "${t#"$prefix"}"; done |
    grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1 || true
}
