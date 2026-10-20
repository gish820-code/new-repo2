#!/usr/bin/env node
// Rainy Day — series bible v3 character lineup sheet (v1).
// Draws every character that already has art (rig v3: drizzle / mags / gord / tess, and the rig `extra` looks used on
// screen in Episodes 2–3) on labeled cards — name, role, scale position at the start of the season → by Episode 8,
// signature item — plus empty silhouette slots with a visual brief for characters that have no art yet.
// No new character art: the figures are the rig exactly as the episodes use it.
//   node tools/make-bible-v3-lineup-v1.mjs   →  review/bible-v3/character-lineup-v1.png
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "review/bible-v3/character-lineup-v1.png");

// scale marks: ▲ helpful · ● indifferent · ▼ hostile · ◆ wildcard
const C = [
  { name: "DRIZZLE", role: "main character · comic relief", scale: "core", item: "yellow slicker, hood up (never off)", fig: { character: "drizzle" }, from: "Ep 1" },
  { name: "MAGS", role: "core · the voice of wisdom", scale: "core", item: "hand-crank radio", fig: { character: "mags" }, from: "Ep 1" },
  { name: "GORD PIKE", role: "self-appointed leader", scale: "▲ helpful → ▼ hostile", item: "clipboard", fig: { character: "gord" }, from: "Ep 2" },
  { name: "TESS VARGA", role: "guarded single mom", scale: "● guarded → ▲ helpful", item: "padlocked duffel", fig: { character: "tess", duffelAt: "side" }, from: "Ep 2" },
  { name: "MILO VARGA", role: "Tess's son, 8", scale: "▲ helpful", item: "small flashlight on a lanyard*", fig: { character: "extra", kid: true, coat: "mist", hat: "beanie", hatColor: "steel", seed: 323 }, from: "Ep 2" },
  { name: "CAL PRUITT", role: "ferry deckhand (Ep 2's PRUITT)", scale: "▲ helpful", item: "cap; ankle splint after Ep 4*", fig: { character: "extra", coat: "mist", hat: "cap", hatColor: "slate", hair: "short", hairColor: "storm", seed: 61 }, from: "Ep 2" },
  { name: "WES PRUITT", role: "Cal's twin", scale: "▲ helpful → ▲ loyal", item: "identical cap; coil of rope*", fig: { character: "extra", coat: "mist", hat: "cap", hatColor: "slate", hair: "short", hairColor: "storm", seed: 62 }, from: "Ep 3" },
  { name: "DANA REYES", role: "volunteer → camp first aid", scale: "▲ helpful → ▲ burned out", item: "gauze-wrapped forearm*", fig: { character: "extra", coat: "slate", hat: "beanie", hatColor: "steel", hair: "long", hairColor: "night", seed: 67 }, from: "Ep 2" },
  { name: "LYLE KEMPER", role: "Gord's follower → enforcer", scale: "● indifferent → ▼ hostile", item: "long metal flashlight (baton)*", fig: { character: "extra", coat: "steel", hat: "cap", hatColor: "slate", hair: "short", seed: 217 }, from: "Ep 2" },
  { name: "HANK DORSEY", role: "the driver · walks inland Ep 5", scale: "● self-first → ▲ Ep 8", item: "big ring of car keys*", fig: { character: "extra", coat: "slate", hat: "beanie", hatColor: "night", seed: 317 }, from: "Ep 1–2" },
  { name: "BENNY OCHOA", role: "stove dad → boiling station", scale: "● his kid first → ▲ helpful", item: "two-burner camp stove*", fig: { character: "extra", coat: "slate", hat: "beanie", hatColor: "storm", hair: "short", seed: 811 }, from: "Ep 2" },
  { name: "DARLA FINCH", role: "frightened neighbor · rumors", scale: "● scared → ▼ → ▲ Ep 7", item: "dead smartphone*", fig: { character: "extra", coat: "mist", hair: "long", hairColor: "slate", seed: 311 }, from: "Ep 2" },
  { name: "MS. ORTEGA", role: "teacher · got every kid up the hill", scale: "▲ helpful", item: "coach's whistle on a lanyard", brief: "Adult, upright, short gray bob, steel rain shell, whistle at the chest; always with 2–3 kids beside her. Only a background figure in Ep 1.", from: "Ep 1 (bg)" },
  { name: "RENNER", role: "outsider skipper from up the coast", scale: "◆ wildcard (arrives Ep 6)", item: "handheld marine radio, long antenna", brief: "Lean, weathered, long dark oilskin coat to the shins, knit watch cap, radio clipped at the shoulder. Arrives by small fishing boat.", from: "new · Ep 6" },
];

const W = 1920, CARD_W = 262, CARD_H = 560, GAP = 6, COLS = 7, TOP = 132;
const H = TOP + 2 * CARD_H + GAP + 70;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const cards = C.map((c, i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  const x = 14 + col * (CARD_W + GAP), y = TOP + row * (CARD_H + GAP);
  return `<div class="card" style="left:${x}px;top:${y}px">
    <svg class="stage" id="st${i}" viewBox="0 0 ${CARD_W} 360" width="${CARD_W}" height="360"></svg>
    ${c.brief ? `<div class="brief"><b>NO ART YET</b>${esc(c.brief)}</div>` : ""}
    <div class="name${c.name === "DRIZZLE" ? " yel" : ""}">${esc(c.name)}</div>
    <div class="role">${esc(c.role)}</div>
    <div class="scale">${esc(c.scale)}</div>
    <div class="item"><span>ITEM</span>${esc(c.item)}</div>
    <div class="from">${esc(c.from)}</div>
  </div>`;
}).join("\n");

const rig = readFileSync(join(ROOT, "assets/characters/rainy-day-rig-v3.js"), "utf8");
const page = `<!doctype html><html><head><meta charset="utf-8"><base href="${pathToFileURL(ROOT + "/").href}">
<style>
@font-face { font-family: "Kalam"; src: url("assets/fonts/Kalam-Bold.woff2") format("woff2"); font-weight: 700; }
html,body{margin:0;width:${W}px;height:${H}px;background:#141B26;font-family:"Kalam",sans-serif;color:#E6EAEE}
h1{position:absolute;left:24px;top:14px;margin:0;font-size:46px;letter-spacing:.02em;color:#E6EAEE}
h1 span{color:#F2C230}
.sub{position:absolute;left:26px;top:76px;font-size:20px;color:#8FA0B4}
.card{position:absolute;width:${CARD_W}px;height:${CARD_H}px;background:#24303F;border:3px solid #10161F;border-radius:10px;overflow:hidden}
.stage{position:absolute;left:0;top:0;background:linear-gradient(#3A4A5E,#24303F)}
.brief{position:absolute;left:14px;right:14px;top:210px;font-size:15px;line-height:1.18;color:#C3CDD8;text-align:center}
.brief b{display:block;font-size:16px;color:#8FA0B4;letter-spacing:.08em;margin-bottom:2px}
.name{position:absolute;left:12px;top:368px;font-size:27px;line-height:1;color:#E6EAEE;letter-spacing:.02em}
.name.yel{color:#F2C230}
.role{position:absolute;left:12px;top:400px;right:10px;font-size:16px;color:#8FA0B4;line-height:1.1}
.scale{position:absolute;left:12px;top:446px;right:10px;font-size:18px;color:#E6EAEE;background:#3A4A5E;border-radius:6px;padding:3px 8px;line-height:1.15}
.item{position:absolute;left:12px;top:494px;right:10px;font-size:15.5px;color:#C3CDD8;line-height:1.12}
.item span{display:block;font-size:12px;color:#8FA0B4;letter-spacing:.12em}
.from{position:absolute;right:10px;top:12px;font-size:14px;color:#C3CDD8;background:#141B26;border-radius:5px;padding:1px 7px}
.legend{position:absolute;left:26px;top:${H - 56}px;font-size:19px;color:#8FA0B4}
</style></head><body>
<h1><span>RAINY DAY</span> · Series bible v3 — character lineup</h1>
<div class="sub">Existing art only (rig v3 + the extra looks used on screen in Eps 2–3). Scale = start of season → by Episode 8.</div>
${cards}
<div class="legend">▲ helpful · ● indifferent / self-focused · ▼ hostile · ◆ wildcard &nbsp;&nbsp; * signature item new in v3, not drawn yet &nbsp;&nbsp; Yellow belongs to Drizzle alone.</div>
<script>${rig}</script>
<script>
(function(){
  const RD = window.RainyDay, NS = "http://www.w3.org/2000/svg";
  const C = ${JSON.stringify(C)};
  C.forEach((c, i) => {
    const st = document.getElementById("st" + i);
    const ground = 330;
    const sh = document.createElementNS(NS, "ellipse");
    Object.entries({ cx: ${CARD_W / 2}, cy: ground + 2, rx: 70, ry: 9, fill: "#141B26", opacity: 0.5 }).forEach(([k, v]) => sh.setAttribute(k, v));
    st.appendChild(sh);
    if (c.fig) {
      const sc = c.fig.character === "gord" ? 1.02 : 1.08;
      const f = RD.figure(st, Object.assign({ x: ${CARD_W / 2}, y: ground - 116 * sc, scale: sc, facing: 1, face: "neutral" }, c.fig));
      if (f && f.draw) f.draw(0);
    } else {
      // empty silhouette slot: dashed outline of a standing stick figure
      const g = document.createElementNS(NS, "g");
      g.setAttribute("fill", "none"); g.setAttribute("stroke", "#8FA0B4"); g.setAttribute("stroke-width", "4");
      g.setAttribute("stroke-dasharray", "10 8"); g.setAttribute("stroke-linecap", "round");
      const cx = ${CARD_W / 2};
      [["circle", { cx, cy: 70, r: 34 }], ["path", { d: "M" + cx + " 106 L" + cx + " 200" }], ["path", { d: "M" + cx + " 120 L" + (cx - 46) + " 182 M" + cx + " 120 L" + (cx + 46) + " 182" }]]
        .forEach(([t, a]) => { const e = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); g.appendChild(e); });
      st.appendChild(g);
    }
  });
})();
</script></body></html>`;

const tmp = join(ROOT, "review/bible-v3/.lineup-page.html");
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(tmp, page);
const browser = await chromium.launch(process.env.PLAYWRIGHT_BROWSERS_PATH ? {} : { executablePath: "/opt/pw-browsers/chromium" });
const pg = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
pg.on("pageerror", (e) => errors.push(String(e)));
await pg.goto(pathToFileURL(tmp).href);
await pg.waitForTimeout(800);
await pg.screenshot({ path: OUT });
await browser.close();
const { unlinkSync } = await import("node:fs");
unlinkSync(tmp);
if (errors.length) console.log("PAGE ERRORS:\n" + errors.join("\n"));
console.log("wrote", OUT);
