#!/usr/bin/env bash
# Pushes every sub-folder that is already a git repo (with real commits) to a new PRIVATE
# GitHub repo, preserving its original commit history and dates.
# Usage:  cd ~/Projects && bash /path/to/push-real-history.sh
set -euo pipefail
command -v gh >/dev/null || { echo "Install GitHub CLI first: https://cli.github.com"; exit 1; }
gh auth status >/dev/null 2>&1 || gh auth login
ME=$(gh api user -q .login)
for d in */; do
  d=${d%/}
  [ -d "$d/.git" ] || { echo "skip  $d (no git history)"; continue; }
  n=$(git -C "$d" rev-list --all --count 2>/dev/null || echo 0)
  [ "$n" -gt 0 ] || { echo "skip  $d (no commits)"; continue; }
  slug=$(echo "$d" | tr ' A-Z' '-a-z' | tr -cd 'a-z0-9._-')
  if gh repo view "$ME/$slug" >/dev/null 2>&1; then
    echo "exists $ME/$slug — pushing"
    git -C "$d" push --all "https://github.com/$ME/$slug.git"
  else
    echo "create $ME/$slug ($n commits)"
    gh repo create "$ME/$slug" --private --source "$d" --push
  fi
done
echo "Done. Make sure 'Private contributions' is ON in your contribution settings."
