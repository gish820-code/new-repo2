#!/usr/bin/env node
// Rainy Day — Episode 3 builder (v1), a copy of tools/build-ep02-v1.mjs (the v5 / Episode 2 look) for Episode 3.
// Reads episodes/ep03/ep03-scenes-v1.json and generates, deterministically:
//   episodes/ep03/script-v1.md                        human-readable script (scenes, action, dialogue, captions, timings)
//   compositions/ep03/parts/ep03-partN-v1.html        16:9 part sub-compositions (scene hosts + VO / music-SFX slots)
//   ep03-full-16x9-v1.html                            render root: whole episode, 1920x1080, subtitle captions
//   ep03-partN-9x16-v1.html                           render roots: TikTok parts, 1080x1920, header + scene + caption area
// Scenes themselves (compositions/ep03/scenes/ep03-sNN-*-v1.html) are hand-built; this script only mounts them.
// Usage: node tools/build-ep03-v1.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const V = "v1";
const ep = JSON.parse(readFileSync(join(ROOT, "episodes/ep03/ep03-scenes-v1.json"), "utf8"));
const write = (rel, text) => {
  mkdirSync(dirname(join(ROOT, rel)), { recursive: true });
  writeFileSync(join(ROOT, rel), text);
  console.log("wrote", rel);
};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
const r3 = (n) => Math.round(n * 1000) / 1000;

// scene file paths + absolute timing
let epT = 0;
for (const p of ep.parts) {
  let pt = 0;
  p.offset = epT;
  for (const s of p.scenes) {
    s.file = `compositions/ep03/scenes/ep03-${s.id}-${slug(s.title)}-${V}.html`;
    s.compId = `ep03-${s.id}`;
    s.partStart = pt;
    s.epStart = epT + pt;
    pt += s.duration;
  }
  p.duration = pt;
  epT += pt;
}
const EP_DUR = epT;

// ------------------------------------------------------------------ script
{
  const L = [];
  L.push(`# RAINY DAY — Episode 3: "${ep.title}" — Script (v1)`, "");
  L.push(`Generated from \`episodes/ep03/ep03-scenes-v1.json\` by \`tools/build-ep03-v1.mjs\` — edit the JSON, not this file.`, "");
  L.push(`**Runtime:** ${fmt(EP_DUR)} (${EP_DUR}s) · 4 parts of ${ep.parts.map((p) => p.duration + "s").join(" / ")} · ${ep.parts.reduce((n, p) => n + p.scenes.length, 0)} scene entries (incl. the h1 cold open)`, "");
  L.push("**Lessons (woven into the story):**", ...ep.lessons.map((l, i) => `${i + 1}. ${l}`), "");
  L.push("**Audio (v1):** captions only. Each part composition has a reserved NARRATION/VO slot (track 20) and a MUSIC/SFX slot (tracks 21–29); see `audio/README.md`.", "");
  L.push("**Caption kinds:** *narration* (soft gray), *dialogue* (SPEAKER in slicker yellow), *sign* (League Gothic yellow: on-screen lessons and in-world text).", "");
  L.push("## Scene list", "", "| Part | Scene | Title | Background | Episode time | Part time | Length |", "|---|---|---|---|---|---|---|");
  for (const p of ep.parts) for (const s of p.scenes) L.push(`| ${p.part} | ${s.id} | ${s.title} | ${s.bg}${Object.keys(s.bgOpts).length ? " " + JSON.stringify(s.bgOpts) : ""} | ${fmt(s.epStart)}–${fmt(s.epStart + s.duration)} | ${fmt(s.partStart)}–${fmt(s.partStart + s.duration)} | ${s.duration}s |`);
  L.push("");
  for (const p of ep.parts) {
    L.push(`## PART ${p.part} — ${p.title} (${p.duration}s, episode ${fmt(p.offset)}–${fmt(p.offset + p.duration)})`, "", `**Ends on:** ${p.hook}`, "");
    for (const s of p.scenes) {
      L.push(`### ${s.id.toUpperCase()} — ${s.title} · ${s.duration}s · part ${fmt(s.partStart)}–${fmt(s.partStart + s.duration)}`, "");
      L.push(`*Background:* \`${s.bg}\` ${JSON.stringify(s.bgOpts)} · *Opens:* ${s.start} · *Closes:* ${s.end}`, "");
      L.push(`**Action.** ${s.action}`, "");
      L.push("| Scene time | Kind | Caption |", "|---|---|---|");
      for (const c of s.captions) L.push(`| ${c.t0.toFixed(1)}–${c.t1.toFixed(1)}s | ${c.kind} | ${c.speaker ? `**${c.speaker}:** ` : ""}${c.text} |`);
      L.push("");
    }
  }
  write("episodes/ep03/script-v1.md", L.join("\n"));
}

// ------------------------------------------------------------------ shared CSS for render roots
const styleCss = readFileSync(join(ROOT, "assets/style/rainy-day-style-v1.css"), "utf8");
const captionHtml = (c) =>
  c.kind === "dialogue"
    ? `<span class="rd-speaker">${esc(c.speaker)}:</span>${esc(c.text)}`
    : esc(c.text);
const captionClass = (c) => `rd-caption${c.kind === "narration" ? " rd-narration" : ""}${c.kind === "sign" ? " rd-sign" : ""}`;

const slots = (id, dur) => `
    <!-- ═════════════ NARRATION / VO SLOT — ${id} (reserved: track 20) ═════════════
         Captions-only in v1. To add voice later, drop the take in audio/ep03/vo/ and add:
         <audio id="${id}-vo" src="audio/ep03/vo/${id}-vo-${V}.wav" data-start="0" data-duration="${dur}" data-track-index="20"></audio>
         (bump the file version on every new take; keep data-start relative to this part).
         ═══════════════════════════════════════════════════════════════════════════ -->
    <!-- ═════════════ MUSIC / SFX SLOT — ${id} (reserved: tracks 21–29) ═════════════
         Music bed:  <audio id="${id}-music" src="audio/ep03/music/${id}-music-${V}.wav" data-start="0" data-duration="${dur}" data-track-index="21" data-volume="0.35"></audio>
         SFX cues:   <audio id="${id}-sfx-01" src="audio/ep03/sfx/<cue>-${V}.wav" data-start="<s>" data-duration="<s>" data-track-index="22"></audio>
         ═══════════════════════════════════════════════════════════════════════════ -->`;

// ------------------------------------------------------------------ part sub-compositions (16:9, no captions)
for (const p of ep.parts) {
  const id = `ep03-part${p.part}`;
  const hosts = p.scenes
    .map(
      (s) => `    <div id="${id}-${s.id}" data-composition-id="${s.compId}" data-composition-src="${s.file}" data-start="${s.partStart}" data-duration="${s.duration}" data-track-index="0" data-width="1920" data-height="1080"></div>`
    )
    .join("\n");
  write(
    `compositions/ep03/parts/${id}-${V}.html`,
    `<template>
  <!-- Rainy Day · Episode 3 · PART ${p.part} "${p.title}" (${p.duration}s) — generated by tools/build-ep03-v1.mjs -->
  <style>
    #root { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; background: #141B26; }
  </style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-duration="${p.duration}">
${hosts}
${slots(id, p.duration)}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    window.__timelines["${id}"] = tl;
  </script>
</template>
`
  );
}

// ------------------------------------------------------------------ render roots
const head = (w, h, extraCss) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${w}, height=${h}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
${styleCss.replace(/^/gm, "      ")}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${w}px; height: ${h}px; overflow: hidden; background: #141B26; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #141B26; }
${extraCss}
    </style>
  </head>`;

const capFades = (ids) =>
  ids
    .map(([cid, t0, t1]) => `      tl.fromTo("#${cid} .rd-cap-inner", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, ${r3(t0)});\n      tl.to("#${cid} .rd-cap-inner", { opacity: 0, duration: 0.15, ease: "power1.in" }, ${r3(Math.max(t0 + 0.2, t1 - 0.15))});`)
    .join("\n");

// --- full episode 16:9
{
  const caps = [];
  const capIds = [];
  for (const p of ep.parts)
    for (const s of p.scenes)
      s.captions.forEach((c, i) => {
        const cid = `cap-${s.id}-${String(i + 1).padStart(2, "0")}`;
        const t0 = s.epStart + c.t0, t1 = s.epStart + c.t1;
        capIds.push([cid, t0, t1]);
        caps.push(`      <div id="${cid}" class="clip rd-cap16" data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="5"><div class="rd-cap-inner ${captionClass(c)}">${captionHtml(c)}</div></div>`);
      });
  const parts = ep.parts
    .map((p) => `      <div id="full-part${p.part}" data-composition-id="ep03-part${p.part}" data-composition-src="compositions/ep03/parts/ep03-part${p.part}-${V}.html" data-start="${p.offset}" data-duration="${p.duration}" data-track-index="0" data-width="1920" data-height="1080"></div>`)
    .join("\n");
  const css = `      .rd-cap16 { position: absolute; left: 160px; top: 930px; width: 1600px; height: 120px; display: flex; align-items: flex-end; justify-content: center; }
      .rd-cap16 .rd-cap-inner { display: inline-block; max-width: 1600px; padding: 10px 28px 14px; background: rgba(20, 27, 38, 0.82); border-radius: 6px; font-size: var(--rd-caption-size-16x9); }
      .rd-cap16 .rd-sign { font-size: 52px; letter-spacing: 0.05em; }`;
  const html = `${head(1920, 1080, css)}
  <body>
    <!-- Rainy Day · Episode 3 "${ep.title}" · FULL 16:9 (${EP_DUR}s) — generated by tools/build-ep03-v1.mjs
         Audio: narration/VO and music/SFX slots live in each part composition (compositions/ep03/parts/), so they
         flow into this render and into the 9:16 parts alike. Root-level audio slot (episode-wide music) below. -->
    <div id="root" data-composition-id="ep03-full" data-start="0" data-duration="${EP_DUR}" data-width="1920" data-height="1080">
${parts}
${caps.join("\n")}
${slots("ep03-full", EP_DUR).replace(/^ {4}/gm, "      ")}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${capFades(capIds)}
      window.__timelines["ep03-full"] = tl;
    </script>
  </body>
</html>
`;
  write(`ep03-full-16x9-${V}.html`, html);
  // (index.html is left alone: it stays the Studio preview copy of an earlier episode)
}

// --- TikTok parts 9:16
for (const p of ep.parts) {
  const id = `ep03-part${p.part}-9x16`;
  const caps = [];
  const capIds = [];
  for (const s of p.scenes)
    s.captions.forEach((c, i) => {
      const cid = `cap9-${s.id}-${String(i + 1).padStart(2, "0")}`;
      const t0 = s.partStart + c.t0, t1 = s.partStart + c.t1;
      capIds.push([cid, t0, t1]);
      caps.push(`      <div id="${cid}" class="clip rd-cap9" data-start="${r3(t0)}" data-duration="${r3(t1 - t0)}" data-track-index="5"><div class="rd-cap-inner ${captionClass(c)}">${captionHtml(c)}</div></div>`);
    });
  // scene frame: 1080 x 607.5 at y=380 (scale 0.5625)
  const css = `      #hdr { position: absolute; left: 0; top: 0; width: 1080px; height: 330px; background: #10161F; border-bottom: 6px solid #F2C230; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
      #hdr .part { font-family: var(--rd-title-font); font-size: 150px; line-height: 0.9; letter-spacing: 0.04em; color: #F2C230; }
      #hdr .series { font-family: var(--rd-caption-font); font-weight: 700; font-size: 44px; color: #C3CDD8; letter-spacing: 0.02em; }
      #frame-wrap { position: absolute; left: 0; top: 380px; width: 1080px; height: 608px; overflow: hidden; background: #000; border-top: 3px solid #3A4A5E; border-bottom: 3px solid #3A4A5E; }
      #frame { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; transform: scale(0.5625); overflow: hidden; }
      #cap-area { position: absolute; left: 0; top: 1000px; width: 1080px; height: 560px; }
      .rd-cap9 { position: absolute; left: 50px; top: 1030px; width: 980px; height: 420px; display: flex; align-items: center; justify-content: center; }
      .rd-cap9 .rd-cap-inner { max-width: 980px; font-size: 60px; line-height: 1.22; }
      .rd-cap9 .rd-speaker { display: block; font-size: 44px; margin: 0 0 8px; letter-spacing: 0.06em; }
      .rd-cap9 .rd-sign { font-size: 86px; line-height: 1.04; letter-spacing: 0.04em; }
      #foot { position: absolute; left: 0; top: 1500px; width: 1080px; height: 60px; text-align: center; font-family: var(--rd-caption-font); font-size: 30px; color: #5B6E85; }`;
  const html = `${head(1080, 1920, css)}
  <body>
    <!-- Rainy Day · Episode 3 · PART ${p.part} of 4 · TikTok 9:16 (${p.duration}s) — generated by tools/build-ep03-v1.mjs
         Layout: header bar (0–330) · the 16:9 scene centered at 1080×608 (y 380–988) · caption area (y 1000–1560).
         Audio: VO + music/SFX slots live in compositions/ep03/parts/ep03-part${p.part}-${V}.html (mounted below). -->
    <div id="root" data-composition-id="${id}" data-start="0" data-duration="${p.duration}" data-width="1080" data-height="1920">
      <div id="hdr" class="clip" data-start="0" data-duration="${p.duration}" data-track-index="2">
        <div class="part">PART ${p.part}</div>
        <div class="series">RAINY DAY · EPISODE 3 (${p.part}/4)</div>
      </div>
      <div id="frame-wrap">
        <div id="frame">
          <div id="${id}-scene" data-composition-id="ep03-part${p.part}" data-composition-src="compositions/ep03/parts/ep03-part${p.part}-${V}.html" data-start="0" data-duration="${p.duration}" data-track-index="0" data-width="1920" data-height="1080"></div>
        </div>
      </div>
      <div id="foot" class="clip" data-start="0" data-duration="${p.duration}" data-track-index="3">${p.part < 4 ? "part " + (p.part + 1) + " next →" : "next episode: DAY 2"}</div>
${caps.join("\n")}
${slots(id, p.duration).replace(/^ {4}/gm, "      ")}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${capFades(capIds)}
      window.__timelines["${id}"] = tl;
    </script>
  </body>
</html>
`;
  write(`ep03-part${p.part}-9x16-${V}.html`, html);
}

// scene manifest for workers / reports
const BG_FILES = { hilltop: "assets/backgrounds/hilltop-v1.js", hilltopCamp: "assets/backgrounds/hilltop-camp-v1.js", shelter: "assets/backgrounds/shelter-v1.js", townView: "assets/backgrounds/town-view-v1.js", gasStation: "assets/backgrounds/gas-station-v1.js" };
write(
  "episodes/ep03/scene-files-v1.json",
  JSON.stringify(ep.parts.flatMap((p) => p.scenes.map((s) => ({ part: p.part, id: s.id, title: s.title, compId: s.compId, file: s.file, duration: s.duration, partStart: s.partStart, epStart: s.epStart, bg: s.bg, bgFile: BG_FILES[s.bg] }))), null, 1)
);
console.log(`episode ${EP_DUR}s; parts ${ep.parts.map((p) => p.duration).join("/")}`);
