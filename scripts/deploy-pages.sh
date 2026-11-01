#!/bin/bash
# Build the static site and publish it to the gh-pages branch.
#
# Pages for this repo is served from the gh-pages branch (the Actions workflow in
# ci/deploy-pages.workflow.yml needs a token with the `workflow` scope).
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

if [ ! -d .pages-build ]; then
  git worktree add -B gh-pages .pages-build
fi

(
  cd .pages-build
  git rm -rf . -q || true
  cp -R ../dist/. .
  touch .nojekyll
  git add -A
  if git diff --cached --quiet; then
    echo "deploy: nothing changed"
  else
    git commit -q -m "deploy: static build $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    git push origin gh-pages
    echo "deploy: pushed gh-pages"
  fi
)

echo "site: https://romain.is-a.dev/seance/"
