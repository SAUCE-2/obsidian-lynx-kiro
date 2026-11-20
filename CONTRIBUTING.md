# Contributing

Thanks for helping out. Bug reports, fixes, and plugin support are all welcome.

## Making a change

1. Fork the repo and create a branch.
2. Edit `theme.css`. Colors live as `--kr-*` variables at the top; reuse them instead of adding new hex values.
3. Test it: copy `theme.css` and `manifest.json` into `<vault>/.obsidian/themes/Lynx Kiro/` and check it in Obsidian (dark and light mode).
4. Open a pull request against `main` with before/after screenshots for any visual change.

`main` is the trunk: keep branches short-lived and PRs small. PRs are squash-merged, so the PR title becomes the commit on `main`.

## PR titles

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org) (CI checks this). The type decides the next release:

| Title | Release |
| --- | --- |
| `fix: callout title contrast` | patch (1.1.0 → 1.1.1) |
| `feat(canvas): style group labels` | minor (1.1.0 → 1.2.0) |
| `feat!: drop the old variable names` | major (1.1.0 → 2.0.0) |
| `docs:`, `style:`, `refactor:`, `ci:`, `chore:`, ... | none |

Commits inside your branch can be named anything.

CI lints `theme.css` and checks `manifest.json`. To run the lint locally:

```sh
npx stylelint@16 theme.css
```

## Releases

Don't bump `version` in `manifest.json` yourself. [release-please](https://github.com/googleapis/release-please) keeps a `chore(main): release X.Y.Z` PR open that bumps `manifest.json` and `CHANGELOG.md` from the PR titles merged since the last release. Merging that PR tags `X.Y.Z` and publishes a GitHub release with `theme.css` and `manifest.json` attached, which is what Obsidian installs from.

Versions follow [semver](https://semver.org) as plain `MAJOR.MINOR.PATCH` (no `v` prefix; Obsidian matches the release tag to the version exactly). Your PR title decides the bump:

- **Patch** (`fix: ...`): fixes to existing styling, like a wrong color or broken contrast.
- **Minor** (`feat: ...`): new styling, like support for a plugin or a new element.
- **Major** (`feat!: ...`, or a `BREAKING CHANGE:` footer): changes that break how people use the theme, like renaming or removing `--kr-*` variables people override in snippets, or raising `minAppVersion`.

CI fails a PR that edits `version` by hand.

## Conduct

Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
