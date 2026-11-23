# Lynx Kiro (Obsidian theme)

The whole theme is `theme.css`. Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md).

## Branches and PRs

- Branch from `dev` and open every PR against `dev`.
- Never push to, merge into, or open a PR against `main`. The maintainer promotes `dev` to `main` to cut a release.
- PRs are squash-merged, and the PR title must be a conventional commit (`fix:` / `feat:`). CI checks this.

## Checks

- `npm run lint` (stylelint with Obsidian's theme-review rules) is the only check. Warnings fail CI.
- The lint bans `:has()` and masks. Find another way rather than disabling the rule.

## Testing a visual change

Copy `theme.css` and `manifest.json` into `<vault>/.obsidian/themes/Lynx Kiro/`, then check it in Obsidian. `demo-vault/` has notes that cover most features.
