# Screenshots

Regenerates the PNGs in [`screenshots/`](../../screenshots) from a real Obsidian, using the [demo vault](../../demo-vault) and the repo's current `theme.css`.

```sh
cd scripts/screenshots && npm install && npm run capture
```

Linux x64 only (it uses the official Obsidian Linux build). Needs Node 20+ and `curl`.

What it does:

1. Downloads Obsidian (`OBSIDIAN_VERSION`, default 1.15.1) once into `~/.cache/lynx-kiro-screenshots/`.
2. Copies `demo-vault/` to a temp dir and installs `theme.css` + `manifest.json` into it as the "Lynx Kiro" theme.
3. Starts Obsidian offscreen (`--ozone-platform=headless`) with `HOME` and `XDG_CONFIG_HOME` pointing at that temp dir, so your own Obsidian config is never read or changed.
4. Drives the app over the Chrome DevTools Protocol with `playwright-core`, captures each view at 1600×1000 (2× pixel density), and writes palette-compressed PNGs.

Options (environment variables):

- `SCALE=1` captures at 1× instead of 2×.
- `HEADLESS=0` opens a real window instead (needs a display, e.g. WSLg or X11).
- `OBSIDIAN_VERSION=1.x.y` pins a different Obsidian release.

To browse the demo vault by hand, copy `theme.css` and `manifest.json` into `demo-vault/.obsidian/themes/Lynx Kiro/` (gitignored) and open the folder as a vault.
