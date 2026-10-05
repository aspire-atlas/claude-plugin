#!/usr/bin/env bash
# Checks the plugin against the Atlas MCP tool contract.
#
# contract/atlas-mcp-tools.json is a trimmed snapshot of the Atlas server's
# tools list (the public and organization-admin surfaces): each tool's name,
# required inputs and input property paths. The server repo is private, so the
# snapshot is vendored here and refreshed by hand.
#
#   scripts/check-tool-contract.sh
#       Offline (CI). Every tool-shaped name in the plugin's markdown is a
#       tool in the snapshot, no removed argument name appears, and every
#       instagram.filters.* / tiktok.filters.* path the plugin names exists
#       on search_creator_marketplace.
#
#   scripts/check-tool-contract.sh --golden <tools-list.golden.json>
#       Fails when the snapshot differs from the server's golden tools list.
#       Run before each release and whenever the server's tool surface changes.
#
#   scripts/check-tool-contract.sh --update <tools-list.golden.json>
#       Rewrites the snapshot from the golden tools list.
set -euo pipefail
cd "$(dirname "$0")/.."

C=contract/atlas-mcp-tools.json
fail=0
err() { echo "FAIL $*"; fail=1; }

# Snapshot of one golden tools list: name -> { required, paths }. `context`
# is the analytics argument every tool requires, so it is left out. Paths
# walk nested `properties` three levels deep (instagram.filters.creatorCountries).
snapshot() {
  jq --arg date "$(date -u +%F)" '
    def paths3($s; $pre; $d):
      ($s.properties // {}) | to_entries[] | ($pre + .key) as $p
      | $p, (if $d > 1 then paths3(.value; $p + "."; $d - 1) else empty end);
    def surface($tools):
      $tools | map({ key: .name, value: {
        required: ((.inputSchema.required // []) - ["context"] | sort),
        paths: ([paths3(.inputSchema; ""; 3)] - ["context"] | sort)
      }}) | from_entries;
    {
      generated: $date,
      source: "apps/api/lib/mcp/tools-list.golden.json",
      surfaces: {
        "/mcp": surface(.["/mcp"]),
        "/mcp/admin-organization": surface(.["/mcp/admin-organization"])
      }
    }' "$1"
}

case "${1:-}" in
  --update)
    golden="${2:?usage: check-tool-contract.sh --update <tools-list.golden.json>}"
    tmp=$(mktemp)
    snapshot "$golden" > "$tmp"
    mv "$tmp" "$C"
    echo "wrote $C"
    exit 0
    ;;
  --golden)
    golden="${2:?usage: check-tool-contract.sh --golden <tools-list.golden.json>}"
    if ! diff <(jq -S '.surfaces' "$C") <(snapshot "$golden" | jq -S '.surfaces'); then
      echo "FAIL $C differs from $golden (lines marked > are the server). Review the change, update the plugin, then run --update."
      exit 1
    fi
    echo "ok: snapshot matches $golden"
    exit 0
    ;;
  "") ;;
  *) echo "usage: check-tool-contract.sh [--golden|--update <tools-list.golden.json>]"; exit 2 ;;
esac

[[ -f "$C" ]] || { echo "FAIL $C missing"; exit 1; }

# 1. The snapshot is not empty or truncated: the tools the plugin's core flows
#    depend on are present.
for t in get_status list_my_profiles create_profile connect_channel search_creators search_posts \
         lookup_creators search_creator_marketplace get_job_status list_creator_marketplace_labels \
         search_calibrations append_insights; do
  jq -e --arg t "$t" '.surfaces["/mcp"][$t]' "$C" >/dev/null || err "snapshot has no /mcp tool $t"
done

known=$(jq -r '.surfaces[] | keys[]' "$C" | sort -u)

# Tool-shaped names that are not Atlas tools: connector sign-in, other
# connectors' tools, and Python in snippets.
allow="complete_authentication create_trigger create_file add_argument get_flattened_data"

# 2. Every tool-shaped name resolves. Tool-shaped = starts with a verb an Atlas
#    tool uses, written in backticks or as a call.
verbs='get|list|search|lookup|create|update|delete|connect|unlink|add|remove|append|retract|supersede|set|start|invite|cancel|leave|complete'
while IFS= read -r name; do
  grep -qxF "$name" <<<"$known" && continue
  [[ " $allow " == *" $name "* ]] && continue
  where=$(grep -rlE "\`$name\`|\b$name\(" plugins --include='*.md' | head -3 | tr '\n' ' ')
  err "'$name' is not an Atlas tool (in $where)"
done < <(
  { grep -rhoE '`[a-z][a-z0-9]*(_[a-z0-9]+)+`' plugins --include='*.md' | tr -d '`'
    grep -rhoE '\b[a-z][a-z0-9]*(_[a-z0-9]+)+\(' plugins --include='*.md' | tr -d '('
  } | grep -E "^($verbs)_" | sort -u
)

# 3. Removed argument names. The server rejects them rather than ignoring them.
#    connect_channel still returns a profileSlug output field; the plugin has
#    no reason to name it.
removed='\b(asOrg|asProfile|orgSlugs?|profileSlugs?)\b'
if grep -rnE "$removed" plugins --include='*.md'; then
  err "removed attribution arguments above: use asOrganizationId / asProfileId (ids, never slugs)"
fi
if grep -rnE '(^|[^.a-zA-Z])filters\.similarToCreators' plugins --include='*.md'; then
  err "similarToCreators lives at instagram.filters.similarToCreators"
fi
if grep -rnoE 'search_creator_marketplace\(\{[^`]*' plugins --include='*.md' \
   | sed -E 's/(instagram|tiktok)[[:space:]]*:[[:space:]]*\{[[:space:]]*filters//g' \
   | grep -E '[^A-Za-z.]filters[[:space:]]*:'; then
  err "search_creator_marketplace takes instagram.filters / tiktok.filters, not top-level filters"
fi

# Every backticked as* argument is one some tool takes (asOrganizationId,
# asProfileId), so an invented or renamed attribution argument fails too.
args=$(jq -r '.surfaces[][] | .paths[] | select(test("^as[A-Z]"))' "$C" | sort -u)
while IFS= read -r a; do
  [[ -z "$a" ]] && continue
  grep -qxF "$a" <<<"$args" || err "'$a' is not an argument of any Atlas tool"
done < <(grep -rhoE '`as[A-Z][A-Za-z]*`' plugins --include='*.md' | tr -d '`' | sort -u)

# 4. Every marketplace filter path the plugin names exists on the server.
paths=$(jq -r '.surfaces["/mcp"].search_creator_marketplace.paths[]' "$C")
while IFS= read -r p; do
  grep -qxF "$p" <<<"$paths" || err "'$p' is not a search_creator_marketplace input"
done < <(
  { grep -rhoE '\b(instagram|tiktok)\.filters\.[A-Za-z]+' plugins --include='*.md'
    # Object form: instagram: { filters: { creatorCountries: [...], creatorMinFollowers } }
    grep -rhoE '(instagram|tiktok)[[:space:]]*:[[:space:]]*\{[[:space:]]*filters[[:space:]]*:[[:space:]]*\{[^}]*' plugins --include='*.md' \
      | sed -E 's/^(instagram|tiktok)[^{]*\{[^{]*\{/\1 /' \
      | while read -r net body; do
          # Keys are identifiers at the start of the body or after a comma; values
          # ("[...]", strings, numbers) are dropped with the brackets they sit in.
          sed -E 's/\[[^]]*\]//g; s/"[^"]*"//g' <<<"$body" | tr ',' '\n' \
            | sed -nE 's/^[[:space:]]*([A-Za-z]+).*/\1/p' | sed "s/^/$net.filters./"
        done
  } | sort -u
)

[[ $fail -eq 0 ]] && echo "ok: plugin matches the Atlas tool contract ($(wc -l <<<"$known" | tr -d ' ') tools)"
exit $fail
