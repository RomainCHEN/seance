# CI assets kept out of `.github/workflows`

`deploy-pages.workflow.yml` is the GitHub Pages deploy pipeline. It is stored here because the
GitHub token used for the first push did not have the `workflow` scope, and GitHub refuses a push
that creates a file under `.github/workflows/` from an app token without it.

To enable it:

```bash
gh auth refresh -s workflow      # one-time, interactive
mkdir -p .github/workflows
cp ci/deploy-pages.workflow.yml .github/workflows/deploy.yml
git add .github/workflows/deploy.yml && git commit -m "ci: enable Pages deploy" && git push
```

Until then the site is published from the `gh-pages` branch (see the repo settings → Pages).
