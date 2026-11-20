// Capture README screenshots of the Lynx Kiro theme in a real Obsidian.
//
// Downloads the official Obsidian Linux build into a cache dir, opens a copy
// of demo-vault/ with the repo's theme.css, drives the app over the Chrome
// DevTools Protocol and writes PNGs to screenshots/.
// Your own Obsidian config is never touched: HOME and XDG_CONFIG_HOME point at
// a throwaway dir for the whole run.

import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const OBSIDIAN_VERSION = process.env.OBSIDIAN_VERSION ?? "1.15.1";
const WIDTH = 1600;
const HEIGHT = 1000;
const SCALE = Number(process.env.SCALE ?? 2);
const PORT = 9333;

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(repo, "screenshots");
const cacheDir = path.join(process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache"), "lynx-kiro-screenshots");
const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "lynx-kiro-"));
const vault = path.join(runDir, "Lynx Kiro Demo");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureObsidian() {
  const dir = path.join(cacheDir, `obsidian-${OBSIDIAN_VERSION}`);
  const bin = path.join(dir, "obsidian");
  if (fs.existsSync(bin)) return bin;
  fs.mkdirSync(cacheDir, { recursive: true });
  const tgz = path.join(cacheDir, `obsidian-${OBSIDIAN_VERSION}.tar.gz`);
  const url = `https://github.com/obsidianmd/obsidian-releases/releases/download/v${OBSIDIAN_VERSION}/obsidian-${OBSIDIAN_VERSION}.tar.gz`;
  console.log(`Downloading ${url}`);
  execFileSync("curl", ["-fsSL", "-o", tgz, url], { stdio: "inherit" });
  execFileSync("tar", ["xzf", tgz, "-C", cacheDir], { stdio: "inherit" });
  fs.rmSync(tgz);
  return bin;
}

function prepareVault() {
  fs.cpSync(path.join(repo, "demo-vault"), vault, { recursive: true });
  const themeDir = path.join(vault, ".obsidian/themes/Lynx Kiro");
  fs.mkdirSync(themeDir, { recursive: true });
  for (const f of ["theme.css", "manifest.json"]) fs.copyFileSync(path.join(repo, f), path.join(themeDir, f));

  // Register the vault so Obsidian opens it straight away, skipping the vault picker.
  const config = path.join(runDir, "config/obsidian");
  fs.mkdirSync(config, { recursive: true });
  fs.writeFileSync(
    path.join(config, "obsidian.json"),
    JSON.stringify({ vaults: { lynxkirodemo0001: { path: vault, ts: Date.now(), open: true } } }),
  );
}

async function launch(bin) {
  const env = {
    ...process.env,
    HOME: runDir,
    XDG_CONFIG_HOME: path.join(runDir, "config"),
  };
  // Obsidian's default font stack starts with system UI fonts (Segoe UI on Windows).
  // Linux usually lacks them and falls back to DejaVu, which doesn't look like what
  // most users see. Use Windows fonts when available (WSL), or FONT_DIR if set.
  const fontDir = process.env.FONT_DIR ?? "/mnt/c/Windows/Fonts";
  if (fs.existsSync(fontDir)) {
    const conf = path.join(runDir, "fonts.conf");
    fs.writeFileSync(
      conf,
      `<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n` +
        `  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>\n` +
        `  <dir>${fontDir}</dir>\n  <cachedir>${path.join(runDir, "fontcache")}</cachedir>\n` +
        `  <alias binding="strong"><family>sans-serif</family><prefer><family>Segoe UI</family></prefer></alias>\n` +
        `  <alias binding="strong"><family>system-ui</family><prefer><family>Segoe UI</family></prefer></alias>\n` +
        `</fontconfig>\n`,
    );
    env.FONTCONFIG_FILE = conf;
  }
  const args = [
    `--remote-debugging-port=${PORT}`,
    "--no-sandbox",
    `--window-size=${WIDTH},${HEIGHT}`,
  ];
  // Without a display, render offscreen. With one (X11/WSLg), a window opens briefly.
  if (process.env.HEADLESS !== "0") args.push("--ozone-platform=headless", "--use-angle=swiftshader", "--enable-unsafe-swiftshader");
  const proc = spawn(bin, args, { env, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  proc.stderr.on("data", (d) => (stderr += d));

  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) break;
    } catch {}
    if (proc.exitCode !== null) throw new Error(`Obsidian exited early:\n${stderr}`);
    await sleep(500);
  }
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
  let page;
  for (let i = 0; i < 60 && !page; i++) {
    page = browser.contexts().flatMap((c) => c.pages()).find((p) => !p.url().startsWith("devtools"));
    if (!page) await sleep(500);
  }
  if (!page) throw new Error("No Obsidian window found");
  return { proc, browser, page };
}

// ---------- Obsidian helpers (run inside the app via page.evaluate) ----------

const SHOWCASE = "Lynx Kiro Showcase.md";

async function openNote(page, file, mode) {
  await page.evaluate(
    async ([file, mode]) => {
      app.setting.close();
      const leaf = app.workspace.getLeaf(false);
      await leaf.setViewState({
        type: "markdown",
        active: true,
        state: { file, mode: mode === "reading" ? "preview" : "source", source: false },
      });
      leaf.view.currentMode.applyScroll(0);
    },
    [file, mode],
  );
  await sleep(800);
}

// Scroll the open note so the line containing `text` is at the top.
async function scrollTo(page, text) {
  await page.evaluate(async (text) => {
    const view = app.workspace.activeLeaf.view;
    const line = view.data.split("\n").findIndex((l) => l.startsWith(text));
    view.currentMode.applyScroll(line);
  }, text);
  await sleep(800);
}

async function openView(page, command) {
  await page.evaluate((command) => {
    app.setting.close();
    app.commands.executeCommandById(command);
  }, command);
}

// Playwright's own viewport emulation can't set the device scale factor on an
// app it didn't launch, so size and capture through a raw CDP session instead.
let cdp;
async function setViewport(width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: SCALE, mobile: false });
  await sleep(800);
}

async function shot(page, name, clip) {
  await sleep(400);
  clip ??= await page.evaluate(() => ({ x: 0, y: 0, width: innerWidth, height: innerHeight }));
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", clip: { ...clip, scale: 1 } });
  const raw = Buffer.from(data, "base64");
  const file = path.join(outDir, `${name}.png`);
  // Palette PNG (libimagequant) keeps files small; the UI has few colors.
  await sharp(raw).png({ palette: true, quality: 100, dither: 0, effort: 10, compressionLevel: 9 }).toFile(file);
  console.log(`${name}.png  ${Math.round(fs.statSync(file).size / 1024)} KB`);
}

// Bounding box (CSS px) around everything from heading `from` up to heading `to` in reading view.
async function sectionClip(page, from, to) {
  return page.evaluate(
    ([from, to]) => {
      const headings = [...document.querySelectorAll(".workspace-leaf.mod-active .markdown-reading-view h2")];
      const a = headings.find((h) => h.textContent.trim() === from).closest(".el-h2");
      const b = headings.find((h) => h.textContent.trim() === to).closest(".el-h2");
      const top = a.getBoundingClientRect().top - 8;
      const bottom = b.getBoundingClientRect().top - 8;
      const pane = document.querySelector(".workspace-leaf.mod-active .view-content").getBoundingClientRect();
      const sizer = document.querySelector(".workspace-leaf.mod-active .markdown-preview-sizer").getBoundingClientRect();
      const y = Math.max(top, pane.top);
      return { x: sizer.left - 72, y, width: sizer.width + 96, height: Math.min(bottom, pane.bottom) - y };
    },
    [from, to],
  );
}

async function main() {
  const bin = ensureObsidian();
  prepareVault();
  fs.mkdirSync(outDir, { recursive: true });
  const { proc, browser, page } = await launch(bin);
  try {
    cdp = await page.context().newCDPSession(page);
    await setViewport(WIDTH, HEIGHT);
    await page.waitForFunction(() => window.app?.workspace?.layoutReady, null, { timeout: 60000 });
    await page.evaluate(async () => {
      // Expand every folder in the file explorer so rainbow folders show.
      const explorer = app.workspace.getLeavesOfType("file-explorer")[0].view;
      for (const item of Object.values(explorer.fileItems)) if (item.setCollapsed) await item.setCollapsed(false);
      app.workspace.rightSplit.collapse();
    });

    // Editor (Live Preview)
    await openNote(page, SHOWCASE, "live");
    await shot(page, "editor-live-preview");

    // Reading view, scrolled to tasks and the table
    await openNote(page, SHOWCASE, "reading");
    await scrollTo(page, "## Lists and tasks");
    await shot(page, "reading-view");

    // Close-ups use a tall window with the left sidebar hidden.
    await page.evaluate(() => void app.workspace.leftSplit.collapse());
    await setViewport(1100, 2400);
    await openNote(page, SHOWCASE, "reading");
    await scrollTo(page, "## Callouts");
    await shot(page, "callouts", await sectionClip(page, "Callouts", "Math and embeds"));
    await scrollTo(page, "## Code");
    await shot(page, "code-blocks", await sectionClip(page, "Code", "Callouts"));
    await scrollTo(page, "## Lists and tasks");
    await shot(page, "checkboxes", await sectionClip(page, "Lists and tasks", "Table"));
    await setViewport(WIDTH, HEIGHT);
    await page.evaluate(() => void app.workspace.leftSplit.expand());

    // Graph view
    await openView(page, "graph:open");
    await sleep(6000); // let the simulation settle
    await shot(page, "graph-view");

    // Canvas
    await page.evaluate(async () => {
      await app.workspace.getLeaf(false).openFile(app.vault.getAbstractFileByPath("Theme Map.canvas"));
    });
    await sleep(1500);
    await page.evaluate(() => void app.workspace.activeLeaf.view.canvas.zoomToFit());
    await sleep(1000);
    await shot(page, "canvas");

    // Command palette over the editor
    await openNote(page, SHOWCASE, "live");
    await openView(page, "command-palette:open");
    await page.keyboard.type("toggle", { delay: 30 });
    await sleep(500);
    await shot(page, "command-palette");
    await page.keyboard.press("Escape");

    // Settings → Appearance
    await sleep(800);
    await page.evaluate(() => {
      // Recent Obsidian opens settings in a popout window; keep it as an in-app modal.
      app.setting.shouldUsePopout = () => false;
      app.setting.open();
    });
    await sleep(800);
    await page.evaluate(() => void app.setting.openTabById("appearance"));
    await sleep(1000);
    await shot(page, "settings");
    await page.keyboard.press("Escape");
    await sleep(500);

    // Light mode (swap the body class; same CSS Obsidian switches on)
    await page.evaluate(() => {
      document.body.classList.replace("theme-dark", "theme-light");
    });
    await openNote(page, SHOWCASE, "live");
    await sleep(800);
    await shot(page, "light-mode");
  } finally {
    await browser.close().catch(() => {});
    proc.kill();
    fs.rmSync(runDir, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
