# Shared helpers for the checks and workflows that loop over the plugins this
# marketplace lists. Source it from the repository root:
#
#   . scripts/plugins.sh
#   for p in $(plugin_names); do src=$(plugin_src "$p"); ...; done
#
# Conventions every plugin follows (scripts/check-channel.sh enforces them):
#   - it lives in plugins/<name>/ and its entry's source is "./plugins/<name>"
#   - on main its entry carries the version; nothing else does
#   - it is released under the tag <name>--vX.Y.Z with notes from its own
#     changelog, plugins/<name>/CHANGELOG.md
# The first plugin, aspire, predates the others and keeps its history: its
# changelog is the root CHANGELOG.md and its releases are tagged vX.Y.Z (the
# release workflow also adds aspire--vX.Y.Z for dependency version ranges).

PLUGINS_MARKETPLACE=.claude-plugin/marketplace.json

# Plugin names in marketplace order. $1: another marketplace.json (default: this one).
plugin_names() { jq -r '.plugins[].name' "${1:-$PLUGINS_MARKETPLACE}"; }

# The plugin's folder, without the leading "./".
plugin_src() {
  jq -r --arg n "$1" '.plugins[] | select(.name == $n) | .source | if type == "string" then . else empty end' \
    "$PLUGINS_MARKETPLACE" | sed 's#^\./##'
}

# The version on the plugin's entry, or nothing. $2: another marketplace.json.
plugin_version() {
  jq -r --arg n "$1" '.plugins[] | select(.name == $n) | .version // empty' "${2:-$PLUGINS_MARKETPLACE}"
}

plugin_changelog() {
  if [ "$1" = aspire ]; then echo CHANGELOG.md; else echo "plugins/$1/CHANGELOG.md"; fi
}

# The release tag for plugin $1 at version $2.
plugin_tag() {
  if [ "$1" = aspire ]; then echo "v$2"; else echo "$1--v$2"; fi
}

# The highest version of plugin $1 that has a release tag, or nothing.
plugin_latest_tagged() {
  local prefix
  prefix=$(plugin_tag "$1" "")
  git tag -l "$prefix*" 2>/dev/null | sed "s/^$prefix//" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1 || true
}
