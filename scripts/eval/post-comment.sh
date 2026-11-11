#!/usr/bin/env bash
# Post the page eval's comment on a pull request, or edit the one already there, found by its marker.
# Usage: post-comment.sh <pr-number> <body-file>. Needs GH_TOKEN and GITHUB_REPOSITORY.
set -euo pipefail
pr="$1"; body="$2"
marker='<!-- eval:pages -->'
id=$(gh api "repos/$GITHUB_REPOSITORY/issues/$pr/comments" --paginate \
  --jq ".[] | select(.user.type == \"Bot\" and (.body | startswith(\"$marker\"))) | .id" | head -1)
if [ -n "$id" ]; then
  gh api -X PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$id" -F body=@"$body" >/dev/null
  echo "edited comment $id"
else
  gh api -X POST "repos/$GITHUB_REPOSITORY/issues/$pr/comments" -F body=@"$body" >/dev/null
  echo "posted a comment"
fi
