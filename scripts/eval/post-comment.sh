#!/usr/bin/env bash
# Post the page eval's comment on a pull request, or edit the one already there, found by its marker.
# Usage: post-comment.sh [--if-exists] <pr-number> <body-file>. With --if-exists it only edits, never posts.
# Needs GH_TOKEN and GITHUB_REPOSITORY.
set -euo pipefail
only_edit=false
if [ "${1:-}" = --if-exists ]; then only_edit=true; shift; fi
pr="$1"; body="$2"
[ -s "$body" ] || { echo "post-comment: $body is empty" >&2; exit 1; }
marker='<!-- eval:pages -->'
# awk reads every line, so gh is never cut off mid-write (head would SIGPIPE it under pipefail).
id=$(gh api "repos/$GITHUB_REPOSITORY/issues/$pr/comments" --paginate \
  --jq ".[] | select(.user.type == \"Bot\" and (.body | startswith(\"$marker\"))) | .id" | awk 'NR==1')
if [ -n "$id" ]; then
  gh api -X PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$id" -F body=@"$body" >/dev/null
  echo "edited comment $id"
elif [ "$only_edit" = true ]; then
  echo "no eval comment on the PR; nothing to edit"
else
  gh api -X POST "repos/$GITHUB_REPOSITORY/issues/$pr/comments" -F body=@"$body" >/dev/null
  echo "posted a comment"
fi
