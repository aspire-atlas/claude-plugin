#!/usr/bin/env bash
# One-time GitHub setup for aspire-atlas/claude-plugins.
# Requires: gh (authenticated with admin rights on the aspire-atlas org).
#
#   bash scripts/bootstrap-github.sh            # create repo, push both branches, protect
#   SKIP_CREATE=1 bash scripts/bootstrap-github.sh   # repo already exists
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="${REPO:-aspire-atlas/claude-plugins}"

if [[ "${SKIP_CREATE:-0}" != "1" ]]; then
  gh repo create "$REPO" --public \
    --description "Claude plugins for the Aspire Atlas platform (atlas.aspire.io)" \
    --homepage "https://atlas.aspire.io"
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
fi

git push -u origin develop
git push -u origin main

# main is the default branch: it is what owner/repo resolves to in Cowork and
# Claude Code, and what the Anthropic directory mirrors.
gh repo edit "$REPO" --default-branch main --enable-issues --delete-branch-on-merge

# Actions permissions: Release workflow creates tags and releases.
gh api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=write -F can_approve_pull_request_reviews=false

protect() {
  local branch="$1"; shift
  local checks_json="$1"
  gh api -X PUT "repos/$REPO/branches/$branch/protection" \
    --input - <<EOF
{
  "required_status_checks": { "strict": true, "contexts": $checks_json },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1, "dismiss_stale_reviews": true },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": true
}
EOF
  echo "protected $branch"
}

# Check names are "<workflow job name>" as GitHub reports them.
protect main    '["validate", "gate"]'
protect develop '["validate"]'

gh label create beta --color FBCA04 --description "Reported against the develop channel" --force
gh label create release --color 0E8A16 --description "Release PR into main" --force

echo
echo "Done. Next:"
echo "  1. Watch the Release workflow tag v\$(jq -r '.plugins[0].version' .claude-plugin/marketplace.json) on main."
echo "  2. Submit https://github.com/$REPO at https://claude.ai/admin-settings/directory/submissions/plugins/new"
