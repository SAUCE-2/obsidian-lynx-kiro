# Contributing

Thanks for helping out. Bug reports, fixes, and plugin support are all welcome.

## Making a change

1. Fork the repo and create a branch.
2. Edit `theme.css`. Colors live as `--kr-*` variables at the top; reuse them instead of adding new hex values.
3. Test it: copy `theme.css` and `manifest.json` into `<vault>/.obsidian/themes/Lynx Kiro/` and check it in Obsidian (dark mode).
4. Open a pull request with before/after screenshots for any visual change.

CI lints `theme.css` and checks `manifest.json`. To run the lint locally:

```sh
npx stylelint@16 theme.css
```

## Releases

Releases are automatic. When a merged PR changes `version` in `manifest.json`, a GitHub release with that version is created with `theme.css` and `manifest.json` attached, which is what Obsidian installs from. Use [semver](https://semver.org): patch for fixes, minor for new styling.

## Conduct

Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
