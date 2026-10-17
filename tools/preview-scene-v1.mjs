#!/usr/bin/env node
// Rainy Day — scene preview harness (v1). Renders stills of ONE scene sub-composition without touching the project
// index (safe to run in parallel). Loads GSAP + the scene's <template>, registers its timeline, seeks with callbacks
// on (like the HyperFrames renderer), and screenshots each requested time.
//
//   node tools/preview-scene-v1.mjs compositions/ep01/scenes/ep01-s03-the-rattle-v1.html 0.5,6,12,18 /tmp/s03
//
// Writes <outdir>/<sceneName>-t<sec>.png and prints any page errors. Not part of the render pipeline.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [scenePath, timesArg = "0.5", outDir = "/tmp/rd-preview"] = process.argv.slice(2);
if (!scenePath) { console.error("usage: preview-scene-v1.mjs <scene.html> <t1,t2,..> <outdir>"); process.exit(1); }
const src = readFileSync(resolve(ROOT, scenePath), "utf8");
const m = src.match(/<template[^>]*>([\s\S]*)<\/template>/);
if (!m) { console.error("no <template> in", scenePath); process.exit(1); }
const idm = m[1].match(/data-composition-id="([^"]+)"/);
const compId = idm ? idm[1] : "scene";
mkdirSync(outDir, { recursive: true });
const page = `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(ROOT + "/").href}">
<script src="assets/vendor/gsap.min.js"></script>
<style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#141B26}
#host{position:relative;width:1920px;height:1080px;overflow:hidden}
/* emulate the runtime: timed clips are visible only inside their window (set by the harness each seek) */</style>
<script>window.__timelines = {};</script></head><body><div id="host"></div>
<template id="tpl">${m[1]}</template>
<script>
const host = document.getElementById("host");
const frag = document.getElementById("tpl").content.cloneNode(true);
const scripts = [...frag.querySelectorAll("script")];
scripts.forEach((s) => s.remove());
host.appendChild(frag);
for (const s of scripts) { const n = document.createElement("script"); n.textContent = s.textContent; document.body.appendChild(n); }
window.__seek = (t) => {
  const tl = window.__timelines["${compId}"];
  document.querySelectorAll("[data-start]").forEach((el) => {
    const st = parseFloat(el.getAttribute("data-start")), du = parseFloat(el.getAttribute("data-duration") || "1e9");
    el.style.visibility = t >= st && t < st + du ? "visible" : "hidden";
  });
  if (tl) tl.seek(t, false);
  return !!tl;
};
</script></body></html>`;
const tmp = join(outDir, "_harness.html");
writeFileSync(tmp, page);
const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--disable-dev-shm-usage"] });
const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
p.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
await p.goto(pathToFileURL(tmp).href);
await p.evaluate(() => document.fonts.ready);
const name = basename(scenePath, ".html");
for (const t of timesArg.split(",").map(Number)) {
  const ok = await p.evaluate((tt) => window.__seek(tt), t);
  if (!ok) errors.push(`timeline "${compId}" not registered`);
  const file = join(outDir, `${name}-t${t}.png`);
  await p.screenshot({ path: file });
  console.log("wrote", file);
}
await browser.close();
if (errors.length) { console.log("PAGE ERRORS:\n" + [...new Set(errors)].join("\n")); process.exitCode = 2; }
