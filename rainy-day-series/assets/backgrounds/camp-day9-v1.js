/* Rainy Day background — `camp9` v1. Episode 5, DAY 9 of a dry spell: the hilltop camp (`hilltopCamp` v1) five days
 * after Episode 4's Day 4 — fuller, shabbier, dry. A WRAPPER: it calls
 * window.RainyDayBG.hilltopCamp(root, { crowd: false, fog: 0 }) first, then re-grades and re-dresses it on top.
 *
 * What changed since Day 4 (ep04 s04): five more small tents / tarp lean-tos squeezed into every gap (under the
 * ASSEMBLY AREA sign, behind it, behind the canopy, between the table and Gord's tent, off the hatchback); every
 * tarp faded, patched (stitched squares) and torn (frayed edges); the rain-catch tarp + two barrels by the tank bone
 * DRY (deep sag, empty dark barrels with dried ring marks, a spider web in the spout); the picnic/supply table half
 * bare (two cans, an empty crate, a hand-lettered FOOD card, the LAST water jug); the SHIFTS sheet on the board under
 * the canopy curled in the sun (WHO HAS WHAT torn off — only its pinned corner left) + a tally of nine days; G. PIKE's
 * cardboard sign at tents[1]; laundry hung stiff and dry on the line; a boiling station (two-burner stove on a flat
 * rock, the big pot, a kettle) by the canopy, where Day 4 had it; cracked, dry mud paths worn between the tents; the
 * fire ring's smoke gone. The flood view at right: water lower (level 606) with a wide band of mud above it.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js AND assets/backgrounds/hilltop-camp-v1.js.
 * Uses only RainyDay.{palette, LINE, el, sk, hash} + the Episode 5 light kit below. Deterministic, static.
 *
 *   const bg = window.RainyDayBG.camp9(layerG, { light: "sun" });
 *   RD.figure(chars, { character: "drizzle", x: 820, y: bg.groundY - 116 * 1.4, scale: 1.4 });
 *
 * OPTS (all optional):
 *   light: "sun"     "sun" (default) — first sunny day: blue sky, white cumulus, a hand-drawn sun upper-left, warm
 *                    dry ground, dust haze, hard cast shadows (hardShadow, hatched) toward shadowDir.
 *                    "morning" — pale clear cool morning, low fog wisps (base fogG at 0.45), long soft shadows.
 *                    "night" — the Ep 4 s18 night grade (P.night rect over the background), clear starry sky.
 *   level: 606       flood surface y in the distant view (base default 575; lower water = larger y).
 *
 * HANDLES (screen px in the 1920x1080 viewBox):
 *   g                 root <g> (contains the base camp, the Day 9 dressing, lightG and the night grade)
 *   base              everything hilltopCamp returned, untouched (base.canopy, base.tents, base.cars, base.view, ...)
 *                     — ALSO spread onto this object, so bg.canopy / bg.tents / bg.view / bg.groundY work directly.
 *                     NOTE base.table.g and base.clothesline.g and base.smoke.g are hidden (redrawn for Day 9).
 *   groundY = 860     summit ground (as hilltopCamp). Feet: figure y = 860 - 116*scale.
 *   table:  { g, x: 1215, y: 742, x0: 1085, x1: 1345, seatY: 786, groundY: 818, items: { cans, crate, card } }
 *                     the redrawn, half-bare supply table. Tabletop x 1150–1270 stays CLEAR (Gord can stand there).
 *   board:  { g, x: 568, y: 604, w: 112, h: 92, sheet: { g, x, y } }  the board in the canopy's left bay; sheet =
 *                     the curled SHIFTS sheet (top-left x,y).
 *   rainCatch: { g, x: 348, y: 788, spoutX: 350, spoutY: 770, barrels: [{ x, y, w }], web: { x, y } }
 *                     the dry rain-catch rig by the tank. x,y = top of the first barrel (look-inside spot).
 *   station: { g, x: 981, y: 755, groundY: 880, burners: [{ x, y }], kettle: { x, y } }
 *                     boiling station (rock + two-burner stove + big pot + kettle). x,y = pot rim center (steam
 *                     origin), burners = flame spots under the pot / kettle. Scenes add flames + steam.
 *   gordTent: { g, x: 1530, y: 800, w, h, sign: { g, x, y, set(k, lit) } }   tents[1] (G. PIKE). sign = the
 *                     cardboard name sign (copied gordSign()); set(k) = brightness 0..1 (night default 0.45).
 *   tentsNew: [ { g, x, y, w, kind } ]   the five Day 9 additions (x = center, y = ground line).
 *   paths:  { g, lines: [[[x,y],...], ...] }  the cracked dry mud paths (center lines).
 *   shadowG           group of all hard cast shadows (opacity per light; scenes may fade it).
 *   skyG              the sky group (base sky + the Day 9 sky drawn into it).
 *   lightG            light overlays scenes may animate: sun glare + rays (sun), dust haze band + motes (sun), cool
 *                     wash + fog wisps (morning), stars (night). Children: lightG.sunG / hazeG / starsG (if present).
 *   gradeG            the night grade (empty unless light = "night").
 *   shadowDir         { dx, dy } direction cast shadows fall: sun {0.55, 0.25}; morning {0.95, 0.12}; night {0, 0}.
 *   light             the light name in use.
 *   detail: { g, x: 1124, y: 716 }   the LAST water jug on the table (5-gal, a quarter full, BOILED tape) — hero
 *                     close-up; x,y = jug center. Drawn to hold up at camera scale ~3.
 */
window.RainyDayBG = window.RainyDayBG || {};
if (!window.RainyDayBG.camp9) window.RainyDayBG.camp9 = function (parent, opts) {
  opts = opts || {};
  const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
  const EP5 = {
    // FIRST SUNNY DAY (camp, sun)
    sunSkyTop: "#7FA3C2", sunSkyLow: "#B9CFDF", sunLit: "#EEF0EA", sunGround: "#A9A595", dust: "#C8C2B2",
    dryGrass: "#8E8F7C", hardShadow: "#2B3644",
    // MIDDAY DAPPLE (ravine)
    leafDark: "#2F3D3A", leafMid: "#4C5E57", moss: "#6E7F6A", dappleLight: "#DCE3D6",
    // AFTERNOON HAZE (bridge)
    hazeSky: "#C9D2D9", concrete: "#9EA4A6", concreteDark: "#6B7275", rust: "#7A6A5E",
    // LATE AFTERNOON (tide flats)
    lateSky: "#D7CDBF", mud: "#5E5A52", mudWet: "#7C7A72", mudShine: "#D9D3C6",
    // GOLDEN HOUR (logging road) — pale amber, clearly NOT slicker yellow
    goldSky: "#D8BE96", goldLight: "#E6D3B0", goldShadow: "#3E3A42", gravel: "#8C8478",
    // DUSK (forest road)
    duskSkyTop: "#4F5270", duskSkyLow: "#A88E92", duskGlow: "#CDB2A4", duskHill: "#2C2E40",
    // NIGHT (woods)
    nightSky: "#0E131D", star: "#E6EAEE",
  };
  const LIGHT = opts.light === "morning" || opts.light === "night" ? opts.light : "sun";
  const SUN = LIGHT === "sun", MORN = LIGHT === "morning", NIGHT = LIGHT === "night";
  const shadowDir = SUN ? { dx: 0.55, dy: 0.25 } : MORN ? { dx: 0.95, dy: 0.12 } : { dx: 0, dy: 0 };
  const LEVEL = opts.level !== undefined ? +opts.level : 606;
  const GROUND = 860;
  let SEED = 29100;
  const sd = () => (SEED += 7);
  const rnd = (i) => (H(i * 2.137 + 17.9) + 1) / 2;
  const D = (o) => Object.assign({ seed: sd() }, o);
  const DET = (o) => Object.assign({ seed: sd(), width: LINE.detail, double: false, wobble: 0.6 }, o);
  const f1 = (v) => (+v).toFixed(1);
  const HAND = '"Kalam", "Comic Sans MS", cursive';
  const txt = (g, x, y, s, o) => {
    o = o || {};
    const t = el("text", Object.assign({ x, y, "text-anchor": o.anchor || "middle", "font-family": HAND, "font-weight": 700, "font-size": o.size || 12, fill: o.fill || P.ink },
      o.fit ? { textLength: o.fit, lengthAdjust: "spacingAndGlyphs" } : {}, o.rot ? { transform: `rotate(${o.rot} ${x} ${y})` } : {}, o.opacity !== undefined ? { opacity: o.opacity } : {}), g);
    t.textContent = s;
    return t;
  };
  const uid = "rdC9" + Math.round(Math.abs(H(SEED + (window.__rdC9N = (window.__rdC9N || 0) + 1))) * 1e6) + "_";

  const root = el("g", { class: "rd-bg rd-bg-camp9 rd-light-" + LIGHT }, parent);
  const base = window.RainyDayBG.hilltopCamp(root, { crowd: false, fog: 0, level: LEVEL });
  const defs = el("defs", {}, root);
  function lgrad(name, stops, x2, y2) {
    const lg = el("linearGradient", { id: uid + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
    stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
    return `url(#${uid}${name})`;
  }
  const B = base.g;
  const q = (cls) => B.querySelector("." + cls);
  const before = (ref, cls) => { const g = el("g", { class: cls }); ref.parentNode.insertBefore(g, ref); return g; };
  const after = (ref, cls) => { const g = el("g", { class: cls }); ref.parentNode.insertBefore(g, ref.nextSibling); return g; };

  // the base pieces Day 9 replaces
  base.table.g.setAttribute("display", "none");
  base.clothesline.g.setAttribute("display", "none");
  base.smoke.g.setAttribute("display", "none");
  if (MORN) base.fogG.setAttribute("opacity", 0.45);

  // ================================================================== SKY
  const skyG = base.sky.g;
  const sky9 = el("g", { class: "rd-camp9-sky" }, skyG);
  // fair-weather cumulus: flat base, bumpy inked top, a shaded belly
  function cumulus(g, x, y, w, h, o) {
    o = o || {};
    const n = Math.max(3, Math.round(w / 56));
    const lumps = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, sp = w / n, r = sp * (0.5 + 0.28 * Math.sin(t * Math.PI)) * (0.85 + 0.3 * rnd(x + i * 3));
      lumps.push([x + w * (0.04 + 0.92 * t), y - r * 0.15 - Math.sin(t * Math.PI) * h * 0.55 - (i % 2) * h * 0.08, r]);
    }
    const top = [];
    for (let xx = x; xx <= x + w; xx += 6) {
      let yy = y;
      lumps.forEach(([cx, cy, r]) => { const d = xx - cx; if (Math.abs(d) < r) yy = Math.min(yy, cy - Math.sqrt(r * r - d * d)); });
      top.push([xx, yy]);
    }
    const pts = [[x, y]].concat(top, [[x + w, y]]);
    sk.poly(g, pts, { seed: sd(), fill: o.fill || EP5.sunLit, stroke: o.stroke || P.mist, width: o.width || 2.5, step: 10, wobble: 0.9, opacity: o.opacity !== undefined ? o.opacity : 1 });
    // shaded belly
    sk.poly(g, [[x + w * 0.08, y - h * 0.08], [x + w * 0.3, y - h * 0.2], [x + w * 0.62, y - h * 0.16], [x + w * 0.92, y - h * 0.06], [x + w * 0.9, y + 1], [x + w * 0.1, y + 2]], { seed: sd(), fill: o.belly || EP5.sunSkyLow, stroke: "none", double: false, wobble: 1, opacity: 0.8 * (o.opacity !== undefined ? o.opacity : 1) });
    // inner curls
    for (let i = 0; i < n - 1; i++) {
      const cx = x + w * (0.2 + (0.6 * i) / Math.max(1, n - 2)), cy = y - h * (0.35 + 0.2 * rnd(i + x));
      sk.path(g, [[cx - 14, cy + 10], [cx - 12, cy - 2], [cx - 2, cy - 9], [cx + 8, cy - 8]], DET({ stroke: P.mist, width: 1.6, opacity: 0.55 * (o.opacity !== undefined ? o.opacity : 1) }));
    }
    sk.line(g, x + w * 0.1, y + 2, x + w * 0.9, y + 1, DET({ stroke: P.mist, width: 1.6, opacity: 0.6 }));
  }
  const gulls = (g, c) => [[1320, 300, 9], [1352, 288, 7], [1610, 318, 8], [740, 262, 7]].forEach(([x, y, s]) =>
    sk.path(g, [[x - s, y], [x - s * 0.4, y - s * 0.45], [x, y], [x + s * 0.4, y - s * 0.45], [x + s, y]], DET({ stroke: c, width: 1.8, wobble: 0.3 })));
  if (SUN) {
    el("rect", { x: -20, y: -20, width: 1960, height: 760, fill: lgrad("skySun", [[0, EP5.sunSkyTop], [0.42, EP5.sunSkyTop], [0.62, EP5.sunSkyLow], [1, EP5.sunSkyLow]]) }, sky9);
    // pen streaks in the blue
    for (let i = 0; i < 26; i++) {
      const cx = 20 + rnd(i + 5) * 1860, cy = 30 + rnd(i + 45) * 340, w = 60 + rnd(i + 85) * 200;
      sk.line(sky9, cx, cy, cx + w, cy + 2 * H(i), DET({ stroke: cy < 260 ? P.steel : EP5.sunLit, width: 1.6, opacity: cy < 260 ? 0.18 : 0.4, wobble: 1 }));
    }
    // the sun, upper left (shadows fall right/down-front)
    const sun = el("g", { class: "rd-camp9-sun" }, sky9);
    sk.circle(sun, 330, 110, 62, { seed: sd(), fill: EP5.sunLit, stroke: EP5.sunSkyLow, width: 10, double: false, wobble: 0.8, opacity: 0.6 });
    sk.circle(sun, 330, 110, 46, { seed: sd(), fill: P.paper, stroke: P.mist, width: 3, wobble: 0.8 });
    sk.path(sun, [[306, 96], [320, 84], [338, 82]], DET({ stroke: EP5.sunLit, width: 3, opacity: 0.9 }));
    // clouds: few, white, flat-bottomed
    cumulus(sky9, 980, 180, 420, 110);
    cumulus(sky9, 1440, 112, 250, 70);
    cumulus(sky9, 560, 280, 260, 64);
    cumulus(sky9, 1560, 330, 300, 46, { opacity: 0.85 });
    cumulus(sky9, 40, 360, 240, 46, { opacity: 0.8 });
    cumulus(sky9, 1150, 392, 340, 26, { opacity: 0.7 });
    gulls(sky9, P.slate);
  } else if (MORN) {
    el("rect", { x: -20, y: -20, width: 1960, height: 760, fill: lgrad("skyMorn", [[0, EP5.sunSkyLow], [0.45, P.fog], [0.6, P.paper], [1, P.fog]]) }, sky9);
    const rg = el("radialGradient", { id: uid + "mglow" }, defs);
    [[0, EP5.sunLit, 0.9], [0.5, P.paper, 0.4], [1, P.paper, 0]].forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, rg));
    el("ellipse", { cx: 260, cy: 330, rx: 620, ry: 260, fill: `url(#${uid}mglow)` }, sky9);
    // thin high streaks, cool
    [[120, 120, 520], [700, 84, 640], [1300, 150, 560], [420, 210, 460], [1100, 250, 700], [1500, 300, 380]].forEach(([x, y, w], i) => {
      sk.path(sky9, [[x, y + 6], [x + w * 0.3, y], [x + w * 0.7, y + 2], [x + w, y - 4]], DET({ stroke: P.paper, width: 6, opacity: 0.7, step: 30 }));
      sk.path(sky9, [[x + 30, y + 14], [x + w * 0.6, y + 10], [x + w - 40, y + 8]], DET({ stroke: P.mist, width: 1.5, opacity: 0.45, step: 30 }));
    });
    gulls(sky9, P.steel);
  } else {
    el("rect", { x: -20, y: -20, width: 1960, height: 760, fill: lgrad("skyNight", [[0, EP5.nightSky], [0.6, P.night], [1, P.storm]]) }, sky9);
  }

  // ================================================================== FAR: the sea + hills in this light
  const far9 = el("g", { class: "rd-camp9-far" });
  base.far.g.insertBefore(far9, base.far.g.children[2]);
  const farTop = el("g", { class: "rd-camp9-far-haze" }, base.far.g);
  if (SUN) {
    el("rect", { x: 900, y: 420, width: 1040, height: 180, fill: EP5.sunSkyTop, opacity: 0.45 }, far9);
    sk.line(far9, 1000, 420, 1940, 420, DET({ stroke: P.steel, opacity: 0.7 }));
    for (let i = 0; i < 40; i++) {
      const y = 426 + Math.pow(rnd(i + 31), 1.3) * 120, x = 920 + rnd(i + 61) * 1000, w = 8 + rnd(i + 91) * 30;
      sk.line(far9, x, y, x + w, y, DET({ stroke: EP5.sunLit, width: 1.8, opacity: 0.8, wobble: 0.3 }));
    }
    // dust haze on the far hills
    el("rect", { x: -20, y: 430, width: 1960, height: 300, fill: lgrad("farHaze", [[0, EP5.dust, 0], [0.6, EP5.dust, 0.35], [1, EP5.dust, 0.2]]) }, farTop);
  } else if (MORN) {
    el("rect", { x: 900, y: 420, width: 1040, height: 180, fill: P.paper, opacity: 0.25 }, far9);
  }

  // ================================================================== VIEW: water lower, a wide band of mud
  const viewG = base.view.g, waterG = base.view.waterG;
  const mudG = el("g", { class: "rd-camp9-mudband" });
  viewG.insertBefore(mudG, waterG);
  {
    const top = [], low = [];
    for (let x = 900; x <= 1940; x += 40) top.push([x, 556 + 5 * Math.sin(x / 83) + 3 * H(x)]);
    for (let x = 1940; x >= 900; x -= 40) low.push([x, LEVEL + 14]);
    sk.poly(mudG, top.concat(low), { seed: sd(), fill: EP5.mudWet, stroke: EP5.mud, width: LINE.detail, wobble: 0.8, double: false, step: 40 });
    // darker wet strip near the water + cracked drying plates higher up
    const wet = [];
    for (let x = 900; x <= 1940; x += 40) wet.push([x, LEVEL - 12 + 3 * Math.sin(x / 47)]);
    sk.poly(mudG, wet.concat(low), { seed: sd(), fill: EP5.mud, stroke: "none", double: false, wobble: 0.6 });
    for (let i = 0; i < 70; i++) {
      const x = 910 + rnd(i + 300) * 1020, y = 562 + rnd(i + 400) * (LEVEL - 580);
      sk.path(mudG, [[x, y], [x + 6 + rnd(i) * 8, y + 2 * H(i)], [x + 10 + rnd(i + 1) * 10, y - 2]], DET({ stroke: EP5.mud, width: 1.2, opacity: 0.7, wobble: 0.3 }));
    }
    // the old high-water debris line along the top of the band
    const dl = [];
    for (let x = 900; x <= 1940; x += 30) dl.push([x, 559 + 5 * Math.sin(x / 83) + 2 * H(x + 3)]);
    sk.path(mudG, dl, DET({ stroke: P.night, width: 2.4, opacity: 0.6, step: 20, wobble: 1 }));
    if (SUN) for (let i = 0; i < 18; i++) { const x = 930 + rnd(i + 700) * 980, y = LEVEL - 6 + rnd(i + 800) * 8; sk.line(mudG, x, y, x + 10 + rnd(i) * 14, y, DET({ stroke: EP5.mudShine, width: 1.6, opacity: 0.9, wobble: 0.2 })); }
  }
  if (SUN) el("rect", { x: 900, y: 500, width: 1040, height: 330, fill: EP5.dust, opacity: 0.16 }, viewG);

  // ================================================================== GROUND: dry, trampled, cracked paths, shadows
  const groundG = q("rd-hilltop-camp-ground");
  const ground9 = el("g", { class: "rd-camp9-ground" }, groundG);
  const crest = [[-20, 662], [200, 646], [420, 652], [640, 642], [860, 648], [1020, 660], [1140, 680], [1260, 704], [1450, 720], [1700, 730], [1940, 738]];
  sk.poly(ground9, crest.concat([[1940, 1100], [-20, 1100]]), D({ fill: EP5.sunGround, width: LINE.main, step: 40 }));
  // a lighter, bleached top band and darker dry-grass foreground
  sk.hatch(ground9, 0, 668, 1100, 70, { seed: sd(), gap: 16, angle: 70, stroke: EP5.dryGrass, opacity: 0.45 });
  sk.path(ground9, [[1150, 690], [1300, 716], [1500, 730], [1700, 740], [1940, 748]], DET({ stroke: EP5.dryGrass, width: 6, opacity: 0.6 }));
  sk.poly(ground9, [[-20, 905], [300, 898], [700, 908], [1100, 900], [1500, 910], [1940, 902], [1940, 1100], [-20, 1100]], { seed: sd(), fill: EP5.dryGrass, stroke: EP5.dryGrass, width: 2, double: false, step: 60 });
  sk.hatch(ground9, 0, 902, 1920, 40, { seed: sd(), gap: 20, angle: 75, stroke: P.slate, opacity: 0.25 });
  // crest rocks (as base)
  [[1180, 692, 26], [1340, 722, 18], [1760, 744, 14]].forEach(([x, y, r]) =>
    sk.poly(ground9, [[x - r, y + 6], [x - r * 0.6, y - r * 0.5], [x + r * 0.3, y - r * 0.6], [x + r, y + 6]], D({ fill: P.mist, width: 3, wobble: 1, step: 400 })));
  // tire ruts to the cars, dry
  [[0, 0], [16, 10]].forEach(([dx, dy]) => sk.path(ground9, [[1000 + dx, 905 + dy], [1150 + dx, 860 + dy], [1300 + dx, 820 + dy], [1420 + dx, 786 + dy], [1540 + dx, 764 + dy]], DET({ stroke: EP5.dryGrass, width: 6, opacity: 0.8, step: 24 })));

  // cracked, dry mud paths worn between the tents
  const pathsG = el("g", { class: "rd-camp9-paths" }, ground9);
  const pathLines = [
    [[-20, 1000], [130, 930], [290, 878], [450, 852], [620, 846], [800, 852], [990, 860], [1180, 842], [1360, 818], [1500, 808]],
    [[460, 850], [400, 838], [330, 832], [250, 830]],                  // to the tank / rain catch
    [[1170, 842], [1080, 800], [990, 762], [900, 730]],                 // past the sign to the back tents
    [[800, 852], [760, 820], [700, 800]],                               // under the canopy
    [[1360, 818], [1400, 790], [1420, 776]],                            // to the new lean-to
  ];
  function crackedPath(g, pts, k) {
    const wAt = (y) => 12 + Math.max(0, y - 700) * 0.2;
    const L = [], R = [], C = [];
    // densify
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 26));
      for (let j = 0; j < n; j++) C.push([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
    }
    C.push(pts[pts.length - 1]);
    C.forEach((p, i) => {
      const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len, w = wAt(p[1]) * (0.85 + 0.3 * rnd(i + k * 40));
      L.push([p[0] + nx * w, p[1] + ny * w * 0.45]);
      R.push([p[0] - nx * w, p[1] - ny * w * 0.45]);
    });
    sk.poly(g, L.concat(R.slice().reverse()), { seed: sd(), fill: EP5.dust, stroke: EP5.dryGrass, width: 2, wobble: 1.4, double: false, step: 30, opacity: 0.85 });
    // crack lattice
    const rows = 3;
    const lat = C.map((p, i) => {
      const r = [];
      for (let j = 0; j <= rows; j++) {
        const u = j / rows;
        r.push([L[i][0] + (R[i][0] - L[i][0]) * u + H(i * 7 + j + k * 31) * 5, L[i][1] + (R[i][1] - L[i][1]) * u + H(i * 3 + j + k * 17) * 2]);
      }
      return r;
    });
    for (let i = 0; i < lat.length; i++) for (let j = 0; j <= rows; j++) {
      const p = lat[i][j];
      if (j > 0 && j < rows && i + 1 < lat.length && rnd(i * 13 + j + k * 7) > 0.45) sk.line(g, p[0], p[1], lat[i + 1][j][0], lat[i + 1][j][1], DET({ stroke: EP5.mud, width: 1.1, opacity: 0.42, wobble: 1.2 }));
      if (j < rows && rnd(i * 5 + j + k * 3 + 50) > 0.55) sk.line(g, p[0], p[1], lat[i][j + 1][0], lat[i][j + 1][1], DET({ stroke: EP5.mud, width: 1.1, opacity: 0.42, wobble: 1.2 }));
    }
    // a few curled plates catching light + dry boot prints
    for (let i = 2; i < lat.length - 1; i += 3) {
      const p = lat[i][1 + (i % 2)];
      sk.path(g, [[p[0] + 2, p[1] + 1], [p[0] + 10, p[1] - 1], [p[0] + 16, p[1] + 2]], DET({ stroke: EP5.sunLit, width: 1.8, opacity: SUN ? 0.9 : 0.5, wobble: 0.3 }));
      if (i % 2) { const b = lat[i][2]; el("ellipse", { cx: f1(b[0]), cy: f1(b[1]), rx: 6, ry: 2.4, fill: EP5.dryGrass, opacity: 0.55 }, g); }
    }
  }
  pathLines.forEach((pts, k) => crackedPath(pathsG, pts, k));
  // a dried-up puddle by the tank (crazed mud) and one in the middle of camp
  [[290, 826, 46, 8], [1170, 888, 62, 9], [760, 878, 44, 6]].forEach(([x, y, rx, ry], k) => {
    sk.poly(ground9, [[x - rx, y], [x - rx * 0.6, y - ry], [x + rx * 0.5, y - ry * 0.9], [x + rx, y], [x + rx * 0.4, y + ry], [x - rx * 0.6, y + ry * 0.9]], { seed: sd(), fill: EP5.dust, stroke: EP5.mud, width: 1.6, double: false, wobble: 0.8, step: 12 });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; sk.line(ground9, x + Math.cos(a) * rx * 0.2, y + Math.sin(a) * ry * 0.2, x + Math.cos(a + 0.4) * rx * 0.85, y + Math.sin(a + 0.4) * ry * 0.8, DET({ stroke: EP5.mud, width: 1.2, opacity: 0.7, wobble: 0.6 })); }
  });
  // dry grass tufts
  for (let i = 0; i < 90; i++) {
    const x = rnd(i + 1800) * 1920, y = 676 + Math.pow(rnd(i + 1900), 0.8) * 226;
    if (y < 660 + (x > 1100 ? (x - 1100) * 0.06 + 34 : 0)) continue;
    const h = 8 + (y - 660) * 0.05;
    sk.path(ground9, [[x - h * 0.6, y - h * 0.7], [x, y], [x + h * 0.1, y - h * 1.1], [x + 2, y], [x + h * 0.8, y - h * 0.5]], DET({ stroke: i % 3 ? EP5.dryGrass : P.slate, opacity: 0.75, wobble: 0.5, width: 1.8 }));
  }

  // ---------------------------------------------------------------- hard cast shadows (all on the ground layer)
  const SH = SUN ? 0.66 : MORN ? 0.34 : 0;
  const shadowG = el("g", { class: "rd-camp9-shadows", opacity: SH }, ground9);
  const shClip = el("clipPath", { id: uid + "shc" }, defs);
  const shFill = el("g", {}, shadowG);
  const proj = (x, gy, h) => [x + shadowDir.dx * h, gy + shadowDir.dy * h];
  function shadowPoly(pts) {
    if (NIGHT) return;
    sk.poly(shFill, pts, { seed: sd(), fill: EP5.hardShadow, stroke: EP5.hardShadow, width: 1.5, double: false, wobble: 0.6, step: 40 });
    el("path", { d: "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + " Z" }, shClip);
  }
  const shadowOf = (gy, profile) => shadowPoly(profile.map(([x, h]) => proj(x, gy, h)));
  const pole = (x, gy, h, w) => shadowOf(gy, [[x - (w || 3), 0], [x - (w || 3), h], [x + (w || 3), h], [x + (w || 3), 0]]);
  const dome = (x, gy, w, h) => { const pr = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 - i / 12); pr.push([x + Math.cos(a) * w / 2, Math.sin(a) * h]); } shadowOf(gy, pr); };

  // ================================================================== small shared drawers
  // wear and tear on a tarp/tent: stitched patches, a frayed tear, sun-faded streaks
  function wear(g, x, y, w, h, k, o) {
    o = o || {};
    // faded streaks
    for (let i = 0; i < 3; i++) sk.line(g, x - w * 0.3 + i * w * 0.2, y - h * 0.3, x - w * 0.26 + i * w * 0.2, y - h * 0.08, DET({ stroke: EP5.sunLit, width: 4, opacity: SUN ? 0.3 : 0.16 }));
    // stitched patch
    const px = x - w * 0.18 + H(k) * w * 0.1, py = y - h * 0.15, pw = Math.max(10, w * 0.16), ph = Math.max(8, h * 0.18);
    sk.poly(g, [[px, py], [px + pw, py - 2], [px + pw + 1, py + ph], [px - 1, py + ph + 1]], DET({ fill: o.patch || P.fog, width: 1.6, double: false }));
    for (let i = 0; i < 3; i++) sk.line(g, px + 2 + i * pw * 0.3, py - 2, px + 4 + i * pw * 0.3, py + 3, DET({ width: 1, opacity: 0.8 }));
    // the tear: a dark slit with frayed threads
    if (o.tear !== false) {
      const tx = x + w * 0.2, ty = y - h * 0.05;
      sk.path(g, [[tx, ty], [tx + w * 0.06, ty + h * 0.08], [tx + w * 0.03, ty + h * 0.18], [tx + w * 0.09, ty + h * 0.26]], DET({ stroke: P.night, width: 2.6, wobble: 0.4 }));
      for (let i = 0; i < 4; i++) sk.line(g, tx + w * 0.04 + i * 2, ty + h * (0.06 + i * 0.05), tx + w * 0.04 + i * 2 + 5, ty + h * (0.06 + i * 0.05) + 3, DET({ width: 1, opacity: 0.7 }));
    }
  }
  function domeTent(g, x, gy, w, h, o) {
    o = o || {};
    const tg = el("g", { class: "rd-camp9-tent" }, g);
    const lw = o.lw || 2.5, fill = o.fill || P.fog, fly = o.fly || P.mist;
    el("ellipse", { cx: x, cy: gy + 2, rx: w * 0.6, ry: Math.max(3, h * 0.06), fill: P.slate, opacity: 0.35 }, tg);
    const dm = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14, a = Math.PI * (1 - t); dm.push([x + Math.cos(a) * w / 2, gy - Math.sin(a) * h]); }
    sk.poly(tg, dm, D({ fill, width: lw, step: 30, wobble: 1 }));
    const flyPts = [];
    for (let i = 0; i <= 12; i++) { const t = 0.14 + 0.72 * (i / 12), a = Math.PI * (1 - t); flyPts.push([x + Math.cos(a) * w / 2 * 1.02, gy - Math.sin(a) * h * 1.02]); }
    for (let i = 12; i >= 0; i--) { const t = 0.14 + 0.72 * (i / 12); flyPts.push([x + (t - 0.5) * w * 0.9, gy - h * 0.45 + Math.sin(i * 1.3) * h * 0.04]); }
    sk.poly(tg, flyPts, D({ fill: fly, width: Math.max(1.6, lw - 0.6), step: 30, wobble: 1 }));
    // frayed hem threads
    for (let i = 0; i < 5; i++) { const xx = x - w * 0.36 + i * w * 0.18; sk.line(tg, xx, gy - h * 0.45 + 2, xx + 2, gy - h * 0.45 + 8, DET({ width: 1, opacity: 0.7 })); }
    [[-0.5, 0.36], [0.5, -0.36]].forEach(([a, b]) => {
      const pts = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([x + (a + (b - a) * t) * w, gy - Math.sin(Math.PI * t) * h * 0.98]); }
      sk.path(tg, pts, DET({ stroke: P.ink, opacity: 0.5, width: 1.4 }));
    });
    const dw = w * 0.32, dh = h * 0.68;
    sk.path(tg, [[x - dw / 2, gy - 2], [x - dw / 2, gy - dh * 0.55], [x, gy - dh], [x + dw / 2, gy - dh * 0.55], [x + dw / 2, gy - 2]], DET({ stroke: P.ink, opacity: 0.7, width: 1.6 }));
    if (o.open) sk.poly(tg, [[x - dw / 2 + 2, gy - 2], [x - dw / 2 + 2, gy - dh * 0.5], [x, gy - dh * 0.9], [x + 2, gy - 2]], D({ fill: P.night, width: 1.6, step: 400, wobble: 0.6 }));
    wear(tg, x, gy - h * 0.55, w, h, x, { tear: o.tear !== false });
    [[-1], [1]].forEach(([s]) => { sk.line(tg, x + s * w * 0.42, gy - h * 0.5, x + s * w * 0.72, gy + 2, DET({ width: 1.2, opacity: 0.7 })); sk.line(tg, x + s * w * 0.72, gy - 4, x + s * w * 0.74, gy + 5, DET({ width: 2.2 })); });
    return tg;
  }
  // tarp lean-to: a ridge line between two poles (or a car), tarp sloping back to the ground; open front
  function leanTo(g, x0, x1, gy, h, o) {
    o = o || {};
    // a tarp sloping from a ridge line on two poles (left, high) down to stakes on the ground (right), seen from the
    // front-left: the dark triangular opening under it, the tarp plane receding back
    const lg = el("g", { class: "rd-camp9-leanto" }, g);
    const bx = 22, by = -20;                                  // back offset (depth)
    sk.poly(lg, [[x0, gy], [x0, gy - h], [x1, gy]], D({ fill: P.storm, width: 2, step: 60, wobble: 0.8 }));
    sk.poly(lg, [[x0 + 8, gy], [x0 + 10, gy - h * 0.2], [x0 + (x1 - x0) * 0.5, gy - h * 0.16], [x0 + (x1 - x0) * 0.56, gy]], D({ fill: o.bed || P.steel, width: 2, step: 400, wobble: 0.8 }));
    if (o.stuff) sk.rect(lg, x0 + 6, gy - h * 0.48, 18, 16, D({ fill: P.mist, width: 1.8, wobble: 0.6 }));
    const tarp = [[x0 - 4, gy - h - 2], [x0 - 4 + bx, gy - h - 2 + by], [x1 + 8 + bx, gy + 2 + by], [x1 + 8, gy + 2]];
    sk.poly(lg, tarp, D({ fill: o.fill || P.mist, width: 2.6, step: 40, wobble: 1 }));
    for (let i = 1; i < 4; i++) { const u = i / 4; sk.line(lg, x0 - 4 + (x1 + 12 - x0) * u, gy - h - 2 + (h + 4) * u, x0 - 4 + bx + (x1 + 12 - x0) * u, gy - h - 2 + by + (h + 4) * u, DET({ stroke: P.steel, opacity: 0.6, width: 1.2 })); }
    // frayed front hem + a hanging torn strip
    for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6, xx = x0 - 4 + (x1 + 12 - x0) * u, yy = gy - h - 2 + (h + 4) * u; sk.line(lg, xx, yy, xx - 2, yy + 6, DET({ width: 1, opacity: 0.75 })); }
    const mx = x0 + (x1 - x0) * 0.35, my = gy - h * 0.65;
    sk.poly(lg, [[mx, my], [mx + 10, my + 4], [mx + 6, my + 22], [mx + 1, my + 16]], D({ fill: o.fill || P.mist, width: 1.6, step: 400, wobble: 0.5 }));
    wear(lg, x0 + (x1 - x0) * 0.62 + bx * 0.5, gy - h * 0.3 + by * 0.5, (x1 - x0) * 0.7, h * 0.5, x0 + 1, { tear: o.tear !== false, patch: P.paper });
    // poles, ridge guy, ground stakes
    if (!o.noLeftPole) { sk.line(lg, x0 - 4, gy + 1, x0 - 4, gy - h - 6, D({ width: 3.5 })); sk.line(lg, x0 - 4 + bx, gy + by + 1, x0 - 4 + bx, gy - h + by - 6, D({ width: 3, opacity: 0.8 })); }
    sk.line(lg, x0 - 4, gy - h - 4, x0 - 30, gy + 2, DET({ width: 1.2, opacity: 0.7 }));
    [[x1 + 8, gy + 2], [x1 + 8 + bx, gy + 2 + by]].forEach(([sx, sy]) => sk.line(lg, sx - 3, sy - 6, sx + 3, sy + 4, DET({ width: 2.2 })));
    return lg;
  }
  function barrel(g, x, gy, w, h, seed) {
    const bg2 = el("g", {}, g);
    sk.poly(bg2, [[x - w / 2, gy - h], [x + w / 2, gy - h], [x + w / 2 + 3, gy - h / 2], [x + w / 2, gy], [x - w / 2, gy], [x - w / 2 - 3, gy - h / 2]], { seed, fill: P.slate, width: 3.2, step: 400, wobble: 0.8 });
    // empty: dark inside, the far wall visible, a dry ring stain inside
    el("ellipse", { cx: x, cy: gy - h, rx: w / 2, ry: 5.5, fill: P.night, stroke: P.ink, "stroke-width": 2.6 }, bg2);
    sk.path(bg2, [[x - w / 2 + 4, gy - h + 1], [x, gy - h + 4], [x + w / 2 - 4, gy - h + 1]], { seed: seed + 9, stroke: P.steel, width: 1.2, double: false, wobble: 0.3, opacity: 0.8 });
    [0.3, 0.72].forEach((u, k) => sk.line(bg2, x - w / 2 - 2, gy - h * (1 - u), x + w / 2 + 2, gy - h * (1 - u), { seed: seed + 1 + k, stroke: P.ink, width: 2, double: false, wobble: 0.6 }));
    // sun-bleached highlight and dried water-line rings on the outside
    sk.line(bg2, x - w / 2 + 7, gy - h + 10, x - w / 2 + 6, gy - 8, { seed: seed + 4, stroke: SUN ? EP5.sunLit : P.steel, width: 3, double: false, wobble: 0.6, opacity: 0.8 });
    [0.5, 0.62].forEach((u, k) => sk.path(bg2, [[x - w / 2 + 2, gy - h * u], [x, gy - h * u + 2], [x + w / 2 - 2, gy - h * u]], { seed: seed + 6 + k, stroke: P.mist, width: 1.2, double: false, wobble: 0.5, opacity: 0.7 }));
    return bg2;
  }
  function web(g, cx, cy, r, ang0, span) {
    const wg = el("g", { opacity: SUN ? 0.9 : 0.7 }, g);
    const n = 6, c = SUN ? EP5.sunLit : P.paper;
    for (let i = 0; i <= n; i++) { const a = ang0 + (span * i) / n; el("line", { x1: cx, y1: cy, x2: f1(cx + Math.cos(a) * r), y2: f1(cy + Math.sin(a) * r), stroke: c, "stroke-width": 0.8 }, wg); }
    for (let k = 1; k <= 4; k++) {
      const rr = (r * k) / 4.6, pts = [];
      for (let i = 0; i <= n; i++) { const a = ang0 + (span * i) / n; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
      el("path", { d: "M" + pts.map((p, i) => (i ? "Q" + f1((p[0] + pts[i - 1][0]) / 2 + (cx - (p[0] + pts[i - 1][0]) / 2) * 0.12) + " " + f1((p[1] + pts[i - 1][1]) / 2 + (cy - (p[1] + pts[i - 1][1]) / 2) * 0.12) + " " : "") + f1(p[0]) + " " + f1(p[1])).join(" "), fill: "none", stroke: c, "stroke-width": 0.7 }, wg);
    }
    el("circle", { cx: f1(cx + 1), cy: f1(cy + 2), r: 1.6, fill: P.ink }, wg);
    return wg;
  }

  // ================================================================== BACK LAYER: tents squeezed in (behind cars/sign/canopy)
  const carsG = base.cars[0].g.parentNode;
  const backG = before(carsG, "rd-camp9-back");
  const tentsNew = [];
  // (a) on the crest behind the canopy's right bay
  tentsNew.push({ g: domeTent(backG, 772, 694, 104, 50, { fill: P.mist, fly: P.steel }), x: 772, y: 694, w: 104, kind: "dome" });
  // (b) beside the sign, behind its left post
  tentsNew.push({ g: domeTent(backG, 870, 724, 112, 56, { fill: P.fog, fly: P.mist, tear: false }), x: 870, y: 724, w: 112, kind: "dome" });
  // (c) squeezed in UNDER the ASSEMBLY AREA sign, between its posts
  tentsNew.push({ g: domeTent(backG, 1016, 800, 118, 62, { fill: P.mist, fly: P.slate, open: true }), x: 1016, y: 800, w: 118, kind: "dome" });
  dome(772, 694, 104, 50); dome(870, 724, 112, 56); dome(1016, 800, 118, 62);

  // ================================================================== MID LAYER (after cars, before line): lean-tos + the stiff laundry
  const lineRef = base.clothesline.g;
  const midG = before(lineRef, "rd-camp9-mid");
  // (d) between the table and Gord's tent: a tarp on two poles
  tentsNew.push({ g: leanTo(midG, 1366, 1446, 792, 66, { fill: P.fog, bed: P.slate, stuff: true }), x: 1406, y: 792, w: 80, kind: "lean-to" });
  shadowOf(792, [[1362, 0], [1362, 68], [1454, 0]]);
  // (e) off the hatchback at the lip: tarp tied to its roof rack, two poles at the front
  tentsNew.push({ g: leanTo(midG, 1790, 1900, 800, 74, { fill: P.mist, bed: P.steel }), x: 1845, y: 800, w: 110, kind: "lean-to" });
  shadowOf(800, [[1786, 0], [1786, 76], [1908, 0]]);
  // (f) a small dome squeezed between Gord's tent and the lean-to off the hatchback
  tentsNew.push({ g: domeTent(midG, 1690, 792, 96, 50, { fill: P.fog, fly: P.steel }), x: 1690, y: 792, w: 96, kind: "dome" });
  dome(1690, 792, 96, 50);
  // stiff, dry laundry on the line behind the table (posts as base)
  const lineG = el("g", { class: "rd-camp9-line" }, midG);
  const CL = { x0: 1104, x1: 1338, y: 664 };
  sk.line(lineG, CL.x0, 728, CL.x0 + 2, CL.y - 6, D({ width: 4 }));
  sk.line(lineG, CL.x1, 734, CL.x1 - 2, CL.y - 2, D({ width: 4 }));
  const sag = (x) => CL.y + Math.sin(((x - CL.x0) / (CL.x1 - CL.x0)) * Math.PI) * 6;
  const lp = [];
  for (let x = CL.x0; x <= CL.x1; x += 18) lp.push([x, sag(x)]);
  sk.path(lineG, lp, DET({ width: 1.8, step: 12 }));
  {
    // a shirt dried with one sleeve sticking straight out
    const a = 1116, b = 1152, ya = sag(a), yb = sag(b);
    sk.poly(lineG, [[a, ya], [b, yb], [b + 22, yb + 4], [b + 24, yb + 14], [b - 1, yb + 13], [b, yb + 44], [a + 2, ya + 46], [a + 3, ya + 14], [a - 10, ya + 30], [a - 16, ya + 26], [a - 4, ya + 6]], D({ fill: P.fog, width: 2.2, step: 400, wobble: 0.5 }));
    sk.line(lineG, a + 6, ya + 22, b - 6, yb + 20, DET({ stroke: P.mist, width: 1.4 }));       // hard crease
    sk.line(lineG, (a + b) / 2, ya + 2, (a + b) / 2 + 1, ya + 12, DET({ width: 1.2, opacity: 0.6 }));
    // jeans, board-stiff, one leg kinked forward
    const c = 1188, d = 1222, yc = sag(c), yd = sag(d), m = (c + d) / 2;
    sk.poly(lineG, [[c, yc], [d, yd], [d + 2, yd + 30], [d + 10, yd + 50], [m + 6, yd + 54], [m + 1, yc + 16], [m - 3, yc + 56], [c - 2, yc + 54]], D({ fill: P.slate, width: 2.2, step: 400, wobble: 0.5 }));
    sk.line(lineG, c + 3, yc + 8, d - 3, yd + 8, DET({ stroke: P.steel, width: 1.2 }));
    // a towel dried in a bent board, corner flipped up
    const e = 1240, f = 1290, ye = sag(e), yf = sag(f);
    sk.poly(lineG, [[e, ye], [f, yf], [f + 4, yf + 40], [f + 14, yf + 34], [f + 8, yf + 46], [e + 2, ye + 50]], D({ fill: P.mist, width: 2.2, step: 400, wobble: 0.5 }));
    for (let k = 1; k < 4; k++) sk.line(lineG, e + 3, ye + k * 12, f - 2, yf + k * 12, DET({ stroke: P.steel, width: 1.2, opacity: 0.7 }));
    // two socks, stiff as boomerangs
    [[1302, 0], [1318, 1]].forEach(([sx, k]) => { const y0 = sag(sx); sk.poly(lineG, [[sx - 4, y0], [sx + 4, y0], [sx + 5, y0 + 18], [sx + 13, y0 + 24], [sx + 11, y0 + 30], [sx - 3, y0 + 24]], D({ fill: k ? P.fog : P.steel, width: 1.8, step: 400, wobble: 0.4 })); });
    [1118, 1150, 1190, 1220, 1242, 1288, 1302, 1318].forEach((px) => sk.line(lineG, px, sag(px) - 4, px, sag(px) + 6, DET({ width: 2.4 })));
  }
  shadowOf(734, [[1100, 0], [1104, 70], [1116, 70], [1152, 70], [1176, 66], [1222, 70], [1292, 70], [1338, 68], [1340, 0]].map(([x, h]) => [x, h]));

  // ================================================================== TANK: a ration note + chalked low-water marks
  const tankG = base.tank.g;
  const tank9 = el("g", { class: "rd-camp9-tank" }, tankG);
  // chalk gauge on the drum's left shoulder: falling level marks with day numbers
  [[640, "D5"], [672, "D7"], [712, "D9"]].forEach(([y, s], k) => {
    sk.line(tank9, 200, y, 222, y + 1, DET({ stroke: P.paper, width: 2.2, opacity: 0.9 }));
    txt(tank9, 228, y + 4, s, { size: 10, anchor: "start", fit: 14, fill: P.paper });
  });
  sk.path(tank9, [[206, 730], [214, 740], [222, 728]], DET({ stroke: P.paper, width: 2, opacity: 0.8 }));
  const rn = el("g", { transform: "rotate(4 262 772)" }, tank9);
  sk.rect(rn, 232, 758, 62, 30, D({ fill: P.paper, width: 2, wobble: 0.5 }));
  txt(rn, 263, 771, "1 JUG", { size: 11, fit: 34 });
  txt(rn, 263, 783, "PER TENT", { size: 8.5, fit: 46, fill: P.slate });
  shadowOf(818, [[188, 0], [192, 66], [194, 202], [220, 212], [252, 214], [284, 212], [310, 202], [316, 66], [318, 0]]);

  // ================================================================== CANOPY: faded + torn tarp, curled SHIFTS sheet
  const canopyG = base.canopy.g;
  const can9 = el("g", { class: "rd-camp9-canopy" }, canopyG);
  // the side tarp: sun-faded, a big stitched patch, a torn frayed corner flapping loose
  sk.poly(can9, [[430, 690], [470, 640], [494, 652], [458, 704]], DET({ fill: P.steel, width: 1.6 }));
  for (let i = 0; i < 4; i++) sk.line(can9, 438 + i * 12, 680 - i * 12, 446 + i * 12, 688 - i * 12, DET({ width: 1, opacity: 0.8 }));
  sk.poly(can9, [[356, 790], [372, 768], [380, 792], [370, 806], [362, 812]], D({ fill: P.storm, width: 2, step: 400, wobble: 0.6 }));
  for (let i = 0; i < 5; i++) sk.line(can9, 362 + i * 4, 806 - i * 6, 356 + i * 4, 816 - i * 5, DET({ width: 1, opacity: 0.8 }));
  for (let i = 0; i < 3; i++) sk.line(can9, 392 + i * 26, 740 - i * 40, 470 + i * 20, 640 - i * 38, DET({ stroke: EP5.sunLit, width: 4, opacity: SUN ? 0.3 : 0.15 }));
  // canopy roof: bleached streaks + a split seam with daylight through it
  for (let i = 0; i < 4; i++) sk.line(can9, 560 + i * 80, 540 - i * 6 + (i > 1 ? (i - 1) * 14 : 0), 640 + i * 70, 500 + (i > 1 ? 20 : 0), DET({ stroke: EP5.sunLit, width: 3, opacity: SUN ? 0.35 : 0.18 }));
  sk.path(can9, [[760, 500], [776, 512], [770, 522], [790, 534]], DET({ stroke: SUN ? EP5.sunSkyLow : P.fog, width: 3.2, wobble: 0.4 }));
  sk.path(can9, [[760, 500], [776, 512], [770, 522], [790, 534]], DET({ stroke: P.ink, width: 1.2, wobble: 0.4, opacity: 0.8 }));
  // the board
  const BD = base.canopy.board;
  const boardG = el("g", { class: "rd-camp9-board" }, can9);
  const sheetG = el("g", { transform: `rotate(-1.5 ${BD.x + 38} ${BD.y + 46})` }, boardG);
  // SHIFTS sheet: the bottom half curled up and forward in the heat
  sk.poly(sheetG, [[BD.x + 3, BD.y + 3], [BD.x + 75, BD.y + 3], [BD.x + 76, BD.y + 52], [BD.x + 4, BD.y + 54]], DET({ fill: P.paper, width: 1.8, double: false }));
  txt(sheetG, BD.x + 39, BD.y + 18, "SHIFTS", { size: 13, fit: 40 });
  sk.line(sheetG, BD.x + 18, BD.y + 21, BD.x + 60, BD.y + 20, DET({ width: 1.4 }));
  [["WATER", "Benny, Leo"], ["WOOD", "Wes, Hank"]].forEach(([a, b], k) => {
    const y = BD.y + 34 + k * 14;
    txt(sheetG, BD.x + 6, y, a, { size: 8, anchor: "start", fit: a.length * 4.1 });
    txt(sheetG, BD.x + 39, y, b, { size: 8, anchor: "start", fit: b.length * 3.3, fill: P.steel });
    sk.line(sheetG, BD.x + 5, y + 4, BD.x + 72, y + 4, DET({ width: 0.8, stroke: P.mist }));
  });
  // the curl: back of the paper showing (fog), a rolled lip
  sk.poly(sheetG, [[BD.x + 4, BD.y + 54], [BD.x + 76, BD.y + 52], [BD.x + 72, BD.y + 66], [BD.x + 60, BD.y + 74], [BD.x + 30, BD.y + 76], [BD.x + 10, BD.y + 70]], DET({ fill: P.fog, width: 1.8 }));
  sk.path(sheetG, [[BD.x + 10, BD.y + 70], [BD.x + 30, BD.y + 72], [BD.x + 60, BD.y + 70], [BD.x + 72, BD.y + 64]], DET({ stroke: P.mist, width: 3 }));
  sk.path(sheetG, [[BD.x + 12, BD.y + 60], [BD.x + 40, BD.y + 62], [BD.x + 66, BD.y + 58]], DET({ stroke: P.mist, width: 1, opacity: 0.8 }));
  el("ellipse", { cx: BD.x + 40, cy: BD.y + 80, rx: 32, ry: 3, fill: P.storm, opacity: 0.35 }, sheetG);
  // WHO HAS WHAT is gone — only the torn corner under its pin
  sk.poly(boardG, [[BD.x + 96, BD.y + 6], [BD.x + 108, BD.y + 7], [BD.x + 104, BD.y + 15], [BD.x + 99, BD.y + 13]], DET({ fill: P.paper, width: 1.4 }));
  [[BD.x + 8, BD.y + 7], [BD.x + 70, BD.y + 6], [BD.x + 101, BD.y + 10]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 2.4, fill: P.slate, stroke: P.ink, "stroke-width": 1 }, boardG));
  // a tally of nine days in marker on the board's corner
  for (let i = 0; i < 9; i++) {
    const gx = BD.x + 80 + (i < 5 ? i * 4 : (i - 5) * 4), gy = i < 5 ? BD.y + 28 : BD.y + 48;
    if (i === 4) sk.line(boardG, BD.x + 78, BD.y + 36, BD.x + 98, BD.y + 26, DET({ width: 1.4 }));
    else sk.line(boardG, gx, gy, gx + 1, gy + 12, DET({ width: 1.4 }));
  }
  txt(boardG, BD.x + 98, BD.y + 74, "DAY 9", { size: 9, fit: 26, rot: -4 });
  // canopy shadows: roof + legs
  const Cn = base.canopy;
  shadowPoly([proj(Cn.x0 - 34, 835, 287), proj(Cn.x, 835, 383), proj(Cn.x1 + 34, 835, 287), proj(Cn.x1 - 6, 800, 287), proj(Cn.x, 800, 383), proj(Cn.x0 + 6, 800, 287)]);
  [Cn.x0, Cn.x1].forEach((x) => pole(x, 835, 280, 4));
  // side lean-to tarp + canopy table
  shadowPoly([[356, 790], proj(540, 790, 258), proj(512, 800, 244), [392, 800]]);
  shadowOf(805, [[566, 0], [566, 80], [816, 80], [816, 0]]);

  // ================================================================== RAIN CATCH (dry) by the tank — after the canopy, as Day 4
  const signG = base.sign.g;
  const rcG = before(signG, "rd-camp9-raincatch");
  sk.line(rcG, 304, 682, 306, 846, D({ width: 4.5, double: false, wobble: 0.6 }));
  sk.line(rcG, 430, 668, 431, 852, D({ width: 4.5, double: false, wobble: 0.6 }));
  // faded tarp, sagging deeper, one corner torn loose and hanging
  sk.poly(rcG, [[298, 686], [436, 670], [414, 708], [360, 752], [346, 752], [318, 714]], D({ fill: P.fog, width: 3, step: 16, wobble: 1 }));
  sk.path(rcG, [[318, 696], [350, 746]], DET({ stroke: P.mist, width: 2 }));
  sk.path(rcG, [[410, 686], [358, 746]], DET({ stroke: P.mist, width: 2 }));
  sk.poly(rcG, [[330, 700], [354, 696], [356, 716], [332, 720]], DET({ fill: P.paper, width: 1.4 }));            // patch
  for (let i = 0; i < 3; i++) sk.line(rcG, 334 + i * 8, 694, 336 + i * 8, 700, DET({ width: 1 }));
  sk.poly(rcG, [[436, 670], [446, 684], [440, 712], [432, 704], [426, 690]], D({ fill: P.mist, width: 2, step: 400, wobble: 0.6 })); // torn flap
  for (let i = 0; i < 4; i++) sk.line(rcG, 434 + i * 2, 704 + i, 432 + i * 3, 712 + i * 2, DET({ width: 1, opacity: 0.8 }));
  // bone-dry bottom of the sag: a crust of grit + dead leaves
  el("ellipse", { cx: 352, cy: 738, rx: 18, ry: 5, fill: EP5.dust, opacity: 0.9 }, rcG);
  [[344, 737], [356, 739]].forEach(([x, y], k) => sk.path(rcG, [[x - 4, y], [x, y - 3], [x + 4, y]], DET({ stroke: EP5.mud, width: 1.6 })));
  [[300, 686], [434, 671]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 3, fill: P.fog, stroke: P.ink, "stroke-width": 1.5 }, rcG));
  sk.poly(rcG, [[343, 750], [357, 750], [354, 770], [346, 770]], D({ fill: P.steel, width: 2.2, double: false }));  // spout
  barrel(rcG, 348, 846, 50, 58, 29501);
  barrel(rcG, 398, 852, 46, 52, 29511);
  // a dipper cup hung on the first barrel's rim, upside down
  sk.path(rcG, [[364, 788], [370, 792], [372, 806]], DET({ width: 2 }));
  sk.poly(rcG, [[366, 806], [380, 806], [378, 818], [368, 818]], DET({ fill: P.mist, width: 1.8 }));
  // the spider web: across the spout to the barrel rim, and between pole and tarp
  web(rcG, 350, 778, 14, 0.2, Math.PI * 0.8);
  web(rcG, 425, 694, 18, Math.PI * 0.5, Math.PI * 0.7);
  pole(304, 846, 164, 3); pole(430, 852, 182, 3);
  shadowPoly([proj(298, 846, 160), proj(436, 852, 182), proj(360, 846, 100), proj(318, 846, 132)]);
  shadowOf(846, [[323, 0], [322, 58], [374, 58], [373, 0]]);
  shadowOf(852, [[375, 0], [374, 52], [422, 52], [421, 0]]);
  // sign shadow (posts + panel)
  const Sg = base.sign;
  pole(Sg.x - 70, 818, 280, 4); pole(Sg.x + 70, 818, 280, 4);
  shadowPoly([proj(Sg.x - 100, 818, 118), proj(Sg.x - 100, 818, 298), proj(Sg.x + 100, 818, 298), proj(Sg.x + 100, 818, 118)]);

  // ================================================================== STATION + TABLE (before the base table, which is hidden)
  const tableRef = base.table.g;
  const stationG = before(tableRef, "rd-camp9-station");
  // Day 4's boiling station, same place (rock + Benny's two-burner stove + the big pot + kettle), scale 1.3
  const bs = el("g", { transform: "translate(1012 880) scale(1.3) translate(-1012 -880)" }, stationG);
  sk.poly(bs, [[946, 882], [950, 864], [968, 853], [1046, 850], [1070, 858], [1078, 882]], D({ fill: P.slate, width: 3.4, step: 30, wobble: 1.2 }));
  sk.path(bs, [[968, 864], [1010, 862], [1050, 866]], DET({ stroke: P.steel, width: 2 }));
  sk.hatch(bs, 950, 864, 120, 18, { seed: sd(), gap: 7, angle: 60, stroke: P.ink, width: 1.2, opacity: 0.3 });
  sk.rect(bs, 960, 834, 100, 18, D({ fill: P.steel, width: 3 }));
  [971, 1023].forEach((x) => el("circle", { cx: x, cy: 843, r: 3.2, fill: P.fog, stroke: P.ink, "stroke-width": 1.5 }, bs));
  sk.line(bs, 962, 834, 1058, 834, DET({ width: 2.4 }));
  sk.line(bs, 960, 834, 956, 812, DET({ width: 2.6 }));
  sk.line(bs, 1060, 834, 1064, 812, DET({ width: 2.6 }));
  // the pot: sooty bottom, dented, a lid leaning against it
  sk.poly(bs, [[956, 784], [1020, 784], [1016, 834], [960, 834]], D({ fill: P.steel, width: 3.4, step: 400 }));
  sk.poly(bs, [[960, 818], [1016, 818], [1016, 834], [960, 834]], { seed: sd(), fill: P.storm, stroke: "none", double: false, wobble: 0.5, opacity: 0.8 });
  sk.line(bs, 962, 798, 1014, 798, DET({ stroke: P.slate, width: 2 }));
  sk.path(bs, [[996, 804], [1002, 808], [998, 814]], DET({ stroke: P.slate, width: 1.4 }));    // dent
  sk.line(bs, 962, 792, 966, 826, DET({ stroke: SUN ? EP5.sunLit : P.mist, width: 2.6, opacity: 0.8 }));
  sk.path(bs, [[952, 790], [946, 794], [952, 800]], DET({ width: 3 }));
  sk.path(bs, [[1024, 790], [1030, 794], [1024, 800]], DET({ width: 3 }));
  el("ellipse", { cx: 988, cy: 784, rx: 32, ry: 6, fill: P.storm, stroke: P.ink, "stroke-width": 2.6 }, bs);
  el("ellipse", { cx: 984, cy: 785, rx: 22, ry: 3, fill: P.slate, opacity: 0.9 }, bs);
  sk.poly(bs, [[930, 880], [934, 846], [948, 842], [950, 880]], D({ fill: P.mist, width: 2.2, step: 400, wobble: 0.5 }));   // lid on edge
  el("circle", { cx: 941, cy: 860, r: 3, fill: P.steel, stroke: P.ink, "stroke-width": 1.2 }, bs);
  // kettle
  sk.poly(bs, [[1028, 812], [1054, 812], [1058, 834], [1024, 834]], D({ fill: P.mist, width: 2.8, step: 400 }));
  sk.path(bs, [[1028, 822], [1016, 812], [1012, 808]], DET({ width: 3 }));
  sk.path(bs, [[1032, 812], [1041, 800], [1050, 812]], DET({ width: 2.4 }));
  // the fuel: two small green-free canisters (one empty, tipped) + a matchbox
  sk.rect(bs, 1084, 862, 14, 20, D({ fill: P.slate, width: 2, wobble: 0.4 }));
  sk.poly(bs, [[1100, 882], [1104, 870], [1122, 874], [1118, 884]], D({ fill: P.steel, width: 2, step: 400, wobble: 0.4 }));
  sk.rect(bs, 1058, 846, 14, 6, DET({ fill: P.paper, width: 1.2 }));
  // a hand-lettered BOIL 1 MIN card propped on the rock
  sk.poly(bs, [[1040, 868], [1074, 864], [1076, 880], [1042, 882]], DET({ fill: P.paper, width: 1.4 }));
  txt(bs, 1058, 877, "BOIL 1 MIN", { size: 6.5, fit: 30, rot: -6 });
  const st = (x, y) => [1012 + (x - 1012) * 1.3, 880 + (y - 880) * 1.3];
  const station = { g: stationG, x: st(988, 784)[0], y: st(988, 784)[1], groundY: 880, burners: [st(988, 834), st(1041, 834)].map(([x, y]) => ({ x, y })), kettle: (([x, y]) => ({ x, y }))(st(1041, 800)) };
  shadowOf(880, [[st(946, 0)[0], 0], [st(950, 0)[0], 30], [st(956, 784)[0], 125], [st(1020, 784)[0], 125], [st(1058, 0)[0], 70], [st(1078, 0)[0], 0]]);

  // ---------------------------------------------------------------- the supply table: half bare
  const tableG = before(tableRef, "rd-camp9-table");
  const T = { x0: 1085, x1: 1345, top: 742, ground: 818 };
  // shadow (tabletop, legs, benches)
  shadowPoly([proj(T.x0, 818, 76), proj(T.x1, 818, 76), proj(T.x1 - 10, 790, 76), proj(T.x0 + 10, 790, 76)]);
  shadowPoly([proj(T.x0 - 4, 818, 32), proj(T.x1 + 18, 818, 32), proj(T.x1 + 18, 812, 32), proj(T.x0 - 4, 812, 32)]);
  sk.poly(tableG, [[T.x0 + 18, 752], [T.x1 + 6, 752], [T.x1 + 10, 760], [T.x0 + 14, 760]], D({ fill: P.slate, width: 3 }));
  [T.x0 + 40, T.x1 - 40].forEach((x) => {
    sk.line(tableG, x - 26, T.ground, x + 10, T.top + 10, D({ width: 5 }));
    sk.line(tableG, x + 34, T.ground, x - 4, T.top + 10, D({ width: 5 }));
    sk.line(tableG, x - 36, 786, x + 44, 786, D({ width: 4 }));
  });
  // under the table: the plastic sheet folded flat, nothing under it now; an empty water case box flattened
  sk.poly(tableG, [[1160, 818], [1176, 808], [1244, 806], [1262, 818]], D({ fill: P.mist, width: 2.2, step: 400, wobble: 0.8 }));
  sk.poly(tableG, [[1272, 818], [1280, 810], [1316, 810], [1322, 818]], D({ fill: P.fog, width: 2, step: 400, wobble: 0.6 }));
  // tabletop (sun-bleached, split board)
  sk.poly(tableG, [[T.x0, T.top - 8], [T.x1 - 10, T.top - 8], [T.x1, T.top + 8], [T.x0 + 12, T.top + 8]], D({ fill: SUN ? P.fog : P.mist, width: LINE.main }));
  sk.line(tableG, T.x0 + 6, T.top, T.x1 - 4, T.top, DET({ opacity: 0.6 }));
  for (let i = 0; i < 8; i++) sk.line(tableG, T.x0 + 20 + i * 30, T.top - 4 + (i % 2) * 8, T.x0 + 40 + i * 30, T.top - 4 + (i % 2) * 8, DET({ stroke: P.steel, opacity: 0.8 }));
  sk.path(tableG, [[1180, T.top + 2], [1204, T.top + 4], [1230, T.top + 3]], DET({ stroke: P.ink, width: 1.4, opacity: 0.8 }));   // split
  sk.rect(tableG, T.x0 + 6, T.top + 8, T.x1 - T.x0 - 4, 9, D({ fill: P.steel, width: 3 }));
  sk.poly(tableG, [[T.x0 - 4, 780], [T.x1 + 18, 780], [T.x1 + 22, 792], [T.x0, 792]], D({ fill: SUN ? P.fog : P.mist, width: 3 }));
  for (let i = 0; i < 6; i++) sk.line(tableG, T.x0 + 20 + i * 44, 785, T.x0 + 44 + i * 44, 785, DET({ stroke: P.steel, opacity: 0.8 }));
  // right end: the EMPTY crate (open side to us), two cans, and the FOOD card propped on it
  const crate = el("g", {}, tableG);
  sk.rect(crate, 1286, 700, 52, 38, D({ fill: P.mist, width: 2.8, wobble: 0.6 }));
  sk.rect(crate, 1292, 705, 40, 28, D({ fill: P.storm, width: 1.8, wobble: 0.4, double: false }));       // empty inside
  sk.line(crate, 1292, 719, 1332, 719, DET({ stroke: P.slate, width: 1.4 }));
  sk.hatch(crate, 1292, 705, 40, 14, { seed: sd(), gap: 6, angle: 30, stroke: P.ink, width: 1, opacity: 0.35 });
  shadowPoly([proj(1286, 740, 0), proj(1286, 740, 38), proj(1338, 740, 38), proj(1338, 740, 0)]);
  const cans = [];
  [[1252, 0], [1266, 1]].forEach(([x, k]) => {
    const cg = el("g", {}, tableG);
    sk.rect(cg, x - 6, 722, 12, 16, DET({ fill: P.steel, width: 1.8, double: false }));
    el("ellipse", { cx: x, cy: 722, rx: 6, ry: 2, fill: P.mist, stroke: P.ink, "stroke-width": 1.2 }, cg);
    sk.rect(cg, x - 6, 727, 12, 6, DET({ fill: P.paper, width: 1 }));
    sk.line(cg, x - 4, 724, x - 4, 736, DET({ stroke: EP5.sunLit, width: 1.4, opacity: 0.8 }));
    shadowPoly([proj(x - 6, 739, 0), proj(x - 6, 739, 16), proj(x + 6, 739, 16), proj(x + 6, 739, 0)]);
    cans.push({ g: cg, x, y: 722 });
  });
  const card = el("g", { transform: "rotate(-8 1312 704)" }, tableG);
  sk.poly(card, [[1290, 686], [1336, 684], [1338, 712], [1292, 714]], D({ fill: P.paper, width: 2, step: 400, wobble: 0.5 }));
  txt(card, 1314, 704, "FOOD", { size: 15, fit: 36 });
  sk.line(card, 1298, 708, 1330, 707, DET({ width: 1.4 }));
  txt(card, 1314, 694, "ask Gord", { size: 6.5, fit: 26, fill: P.slate });
  // left end: the LAST water jug (hero close-up)
  const JX = 1124, JY = 740;
  const jugG = el("g", { class: "rd-camp9-lastjug" }, tableG);
  shadowPoly([proj(JX - 17, JY, 0), proj(JX - 17, JY, 34), proj(JX - 8, JY, 46), proj(JX + 8, JY, 46), proj(JX + 17, JY, 34), proj(JX + 17, JY, 0)]);
  // body: a 5-gal jug, translucent fog, ribbed
  sk.poly(jugG, [[JX - 17, JY], [JX - 18, JY - 32], [JX - 10, JY - 42], [JX - 5, JY - 44], [JX + 5, JY - 44], [JX + 10, JY - 42], [JX + 18, JY - 32], [JX + 17, JY]], { seed: 29801, fill: P.fog, stroke: P.ink, width: 2.6, wobble: 0.4, step: 400 });
  // the water: a quarter left, its surface line + darker water
  sk.poly(jugG, [[JX - 16.5, JY - 1], [JX - 17, JY - 11], [JX + 17, JY - 12], [JX + 16.5, JY - 1]], { seed: 29802, fill: P.mist, stroke: "none", double: false, wobble: 0.3 });
  sk.line(jugG, JX - 16, JY - 11, JX + 16, JY - 12, { seed: 29803, stroke: P.steel, width: 1.4, double: false, wobble: 0.2 });
  el("ellipse", { cx: JX - 4, cy: JY - 11.5, rx: 8, ry: 1, fill: EP5.sunLit, opacity: 0.9 }, jugG);
  // ribs
  [-8, 0, 8].forEach((dx, k) => sk.line(jugG, JX + dx, JY - 38, JX + dx * 1.1, JY - 3, { seed: 29804 + k, stroke: P.mist, width: 1.1, double: false, wobble: 0.3, opacity: 0.9 }));
  [JY - 30, JY - 20].forEach((y, k) => sk.line(jugG, JX - 17, y, JX + 17, y - 0.5, { seed: 29808 + k, stroke: P.mist, width: 1, double: false, wobble: 0.3 }));
  // handle on the shoulder, neck + cap
  sk.path(jugG, [[JX + 4, JY - 43], [JX + 12, JY - 49], [JX + 16, JY - 40]], { seed: 29811, stroke: P.ink, width: 2.4, double: false, wobble: 0.3 });
  sk.rect(jugG, JX - 5, JY - 50, 10, 6, { seed: 29812, fill: P.mist, stroke: P.ink, width: 1.8, double: false, wobble: 0.2 });
  sk.rect(jugG, JX - 6, JY - 55, 12, 6, { seed: 29813, fill: P.steel, stroke: P.ink, width: 1.8, double: false, wobble: 0.2 });
  [JX - 3, JX, JX + 3].forEach((x) => el("line", { x1: x, y1: JY - 54, x2: x, y2: JY - 50, stroke: P.ink, "stroke-width": 0.7 }, jugG));
  // strip of duct tape label, marker: "BOILED ✓" + a tally of fills
  sk.poly(jugG, [[JX - 14, JY - 28], [JX + 14, JY - 29], [JX + 14, JY - 19], [JX - 14, JY - 18]], { seed: 29814, fill: P.paper, stroke: P.slate, width: 1, double: false, wobble: 0.3 });
  txt(jugG, JX - 2, JY - 21, "BOILED", { size: 6, fit: 19 });
  sk.path(jugG, [[JX + 8, JY - 24], [JX + 10, JY - 21], [JX + 13, JY - 27]], { seed: 29815, stroke: P.ink, width: 1, double: false, wobble: 0.1 });
  [JX - 12, JX - 10, JX - 8].forEach((x) => el("line", { x1: x, y1: JY - 17, x2: x, y2: JY - 14, stroke: P.ink, "stroke-width": 0.8 }, jugG));
  // scratches + a highlight streak in the sun
  sk.line(jugG, JX - 13, JY - 36, JX - 12, JY - 6, { seed: 29816, stroke: SUN ? EP5.sunLit : P.paper, width: 2.6, double: false, wobble: 0.3, opacity: 0.85 });
  [[JX + 4, JY - 10, 5], [JX + 9, JY - 6, 4], [JX - 6, JY - 36, 4]].forEach(([x, y, l], k) => el("line", { x1: x, y1: y, x2: x + l, y2: y - 1.5, stroke: P.steel, "stroke-width": 0.7, opacity: 0.8 }, jugG));
  // a ring stain on the board where the other jugs used to stand
  [[1162, 741], [1196, 742]].forEach(([x, y]) => el("ellipse", { cx: x, cy: y, rx: 15, ry: 3, fill: "none", stroke: P.steel, "stroke-width": 1.2, opacity: 0.7 }, tableG));
  const detail = { g: jugG, x: JX, y: JY - 24 };

  // ================================================================== FRONT TENTS: wear + G. PIKE sign
  const tents2G = base.tents[1].g.parentNode;
  base.tents.forEach((t, i) => {
    const wg = el("g", { class: "rd-camp9-wear" }, t.g);
    wear(wg, t.x, t.y - t.h * 0.55, t.w, t.h, t.x + i, { tear: i !== 1 });
    if (i === 2) { // big front tent: a whole stitched-on patch of a different tarp + mended guy line
      sk.poly(wg, [[t.x + t.w * 0.18, t.y - t.h * 0.8], [t.x + t.w * 0.34, t.y - t.h * 0.74], [t.x + t.w * 0.32, t.y - t.h * 0.56], [t.x + t.w * 0.16, t.y - t.h * 0.6]], D({ fill: P.steel, width: 2, step: 400, wobble: 0.5 }));
      for (let k = 0; k < 4; k++) sk.line(wg, t.x + t.w * (0.19 + k * 0.04), t.y - t.h * 0.8, t.x + t.w * (0.2 + k * 0.04), t.y - t.h * 0.76, DET({ width: 1 }));
    }
    dome(t.x, t.y, t.w, t.h);
  });
  // cars: shadows + dust on their flanks
  base.cars.forEach((c, i) => {
    const hh = c.w * 0.3;
    shadowOf(c.y, [[c.x - c.w / 2, 0], [c.x - c.w / 2, hh * 0.55], [c.x - c.w * 0.2, hh], [c.x + c.w * 0.2, hh], [c.x + c.w / 2, hh * 0.5], [c.x + c.w / 2, 0]]);
    const dg = el("g", { opacity: NIGHT ? 0.3 : 0.75 }, c.g);
    for (let k = 0; k < 5; k++) sk.line(dg, c.x - c.w * 0.45 + k * c.w * 0.2, c.y - hh * 0.18, c.x - c.w * 0.38 + k * c.w * 0.2, c.y - hh * 0.3, DET({ stroke: EP5.dust, width: 3 }));
  });
  // G. PIKE tent (tents[1])
  const gordG = after(tents2G, "rd-camp9-gord");
  // ---------------------------------------------------------------- Gord's name sign by his tent flap (tents[1]) — copied gordSign(), ep04 s18
  // A hand-lettered cardboard sign "G. PIKE" on a short stake just right of the door flap, his spare clipboard hung on
  // the stake under it. Inside its own brightness filter (set(k)) so it can read in the dark.
  function gordSign(layer, tent) {
    const fid = uid + "signDim";
    const f = el("filter", { id: fid, x: "-30%", y: "-30%", width: "160%", height: "160%", "color-interpolation-filters": "sRGB" }, defs);
    const ct = el("feComponentTransfer", {}, f);
    const fs = ["feFuncR", "feFuncG", "feFuncB"].map((n) => el(n, { type: "linear", slope: 1, intercept: 0 }, ct));
    const g = el("g", { class: "rd-camp9-gordsign", filter: `url(#${fid})` }, layer);
    const x = tent.x + 56, gy = tent.y + 12;                  // stake foot just in front of the tent, right of the door
    const W = 72, HH = 38, top = gy - 76;                     // board ~ x 1550–1622, y 736–774
    const halo = el("ellipse", { cx: x, cy: top + HH / 2, rx: 56, ry: 34, fill: P.fog, opacity: 0 }, g);   // light caught on it
    sk.poly(g, [[x - 3, top + 10], [x + 3, top + 10], [x + 3.5, gy - 4], [x, gy + 3], [x - 3.5, gy - 4]], { seed: 1701, fill: P.steel, width: 2.6, step: 400, double: false, wobble: 0.5 });
    sk.poly(g, [[x - W / 2, top + 3], [x + W / 2 - 2, top], [x + W / 2 + 1, top + HH - 1], [x - W / 2 + 2, top + HH + 2]], { seed: 1702, fill: P.paper, width: 3.2, step: 400, wobble: 0.7 });
    sk.line(g, x - W / 2 + 5, top + 6.5, x + W / 2 - 5, top + 4, { seed: 1703, width: 1.4, stroke: P.mist, double: false, wobble: 0.6 });   // corrugated edge
    sk.poly(g, [[x + W / 2 - 13, top + HH], [x + W / 2 + 1, top + HH - 1], [x + W / 2 - 1, top + HH - 9]], { seed: 1704, fill: P.fog, width: 1.6, step: 400, double: false, wobble: 0.4 });   // torn corner
    el("circle", { cx: x, cy: top + 5.5, r: 2.2, fill: P.slate, stroke: P.ink, "stroke-width": 1 }, g);   // nail
    const tx = el("text", { x, y: f1(top + HH * 0.74), "text-anchor": "middle", "font-family": '"Kalam", "Comic Sans MS", cursive', "font-weight": 700, "font-size": 24, fill: P.ink, textLength: W - 12, lengthAdjust: "spacingAndGlyphs", transform: `rotate(-3 ${x} ${top + HH / 2})` }, g);
    tx.textContent = "G. PIKE";
    sk.line(g, x - 25, top + HH - 4, x + 22, top + HH - 6.5, { seed: 1705, width: 2.2, stroke: P.ink, double: false, wobble: 0.5 });   // marker underline
    // the clipboard silhouette hung on the stake
    const cx = x + 3, cy = top + HH + 9;
    sk.line(g, x, top + HH + 2, cx, cy + 1, { seed: 1706, width: 1.4, stroke: P.ink, double: false, wobble: 0.3 });
    sk.rect(g, cx - 9, cy, 18, 24, { seed: 1707, fill: P.slate, width: 2.2, step: 400, double: false, wobble: 0.4 });
    sk.rect(g, cx - 6.5, cy + 5, 13, 16, { seed: 1708, fill: P.fog, width: 1.2, step: 400, double: false, wobble: 0.3 });
    el("rect", { x: cx - 4.5, y: cy - 2, width: 9, height: 5, rx: 1.2, fill: P.ink }, g);
    [9, 13, 17].forEach((dy, i) => el("line", { x1: cx - 4, y1: cy + dy, x2: cx + (i === 2 ? 1 : 4), y2: cy + dy, stroke: P.ink, "stroke-width": 1.1 }, g));
    return {
      g, x, y: top + HH / 2,
      set(k, lit) {
        const v = (Math.round(k * 100) / 100).toFixed(2);
        fs.forEach((e) => e.setAttribute("slope", v));
        halo.setAttribute("opacity", f1(0.26 * (lit || 0)));
      },
    };
  }
  const T1 = base.tents[1];
  pole(T1.x + 56, T1.y + 12, 76, 3);
  shadowPoly([proj(T1.x + 20, T1.y + 12, 40), proj(T1.x + 20, T1.y + 12, 78), proj(T1.x + 92, T1.y + 12, 78), proj(T1.x + 92, T1.y + 12, 40)]);
  // a folding chair + his crate desk by the door (the camp's "office")
  const off = el("g", {}, gordG);
  sk.rect(off, T1.x - 92, T1.y - 26, 34, 26, D({ fill: P.steel, width: 2.4, wobble: 0.5 }));
  sk.rect(off, T1.x - 88, T1.y - 33, 22, 8, DET({ fill: P.paper, width: 1.2 }));
  shadowOf(T1.y, [[T1.x - 92, 0], [T1.x - 92, 30], [T1.x - 58, 30], [T1.x - 58, 0]]);

  // ================================================================== FIRE RING lean-to: faded + torn
  const fire9 = el("g", { class: "rd-camp9-fire" }, base.firePit.g);
  wear(fire9, 236, 850, 90, 80, 236, { patch: P.mist });
  sk.poly(fire9, [[282, 822], [300, 830], [296, 846], [288, 840]], D({ fill: P.steel, width: 1.6, step: 400, wobble: 0.5 }));
  for (let i = 0; i < 3; i++) sk.line(fire9, 292 + i * 3, 838 + i * 2, 300 + i * 3, 846 + i * 2, DET({ width: 1 }));
  // dead, gray ash in the ring (no smoke today) + a grill grate laid across it
  sk.line(fire9, 352, 880, 432, 878, DET({ width: 2.6 }));
  sk.line(fire9, 352, 890, 432, 888, DET({ width: 2.6 }));
  for (let i = 0; i < 5; i++) sk.line(fire9, 360 + i * 16, 876, 358 + i * 16, 892, DET({ width: 1.6 }));
  shadowPoly([[110, 892], proj(204, 892, 102), proj(282, 900, 78), [300, 900]]);

  // ================================================================== LIGHT overlays (scenes may animate)
  const lightG = el("g", { class: "rd-camp9-light" }, root);
  const gradeG = el("g", { class: "rd-camp9-grade" }, root);
  const topG = el("g", { class: "rd-camp9-top" }, root);   // drawn above the grade (Gord's sign at night)
  const gordSignH = gordSign(NIGHT ? topG : gordG, T1);
  gordSignH.set(NIGHT ? 0.45 : 1, 0);

  // hatch inside every cast shadow (pen texture), clipped to their union
  if (!NIGHT) {
    const hg = el("g", { "clip-path": `url(#${uid}shc)` }, shadowG);
    for (let i = -1100; i < 2000; i += 9) el("line", { x1: i, y1: 640, x2: i + 420, y2: 1080, stroke: P.ink, "stroke-width": 1.4, opacity: 0.45 }, hg);
  }
  if (SUN) {
    const sunG = el("g", { class: "rd-camp9-sunglare" }, lightG);
    // rays round the sun
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.1, r0 = 64, r1 = 64 + (i % 2 ? 26 : 44);
      sk.line(sunG, 330 + Math.cos(a) * r0, 110 + Math.sin(a) * r0, 330 + Math.cos(a) * r1, 110 + Math.sin(a) * r1, DET({ stroke: EP5.sunLit, width: 3.5, opacity: 0.9 }));
    }
    // glare: a pale wash fanning down from upper left
    const rg = el("radialGradient", { id: uid + "glare" }, defs);
    [[0, EP5.sunLit, 0.55], [0.35, EP5.sunLit, 0.18], [1, EP5.sunLit, 0]].forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, rg));
    el("ellipse", { cx: 330, cy: 110, rx: 520, ry: 420, fill: `url(#${uid}glare)` }, sunG);
    // dust: a low haze band over the summit + kicked-up motes along the paths and the rut road
    const hazeG = el("g", { class: "rd-camp9-dust" }, lightG);
    el("rect", { x: -20, y: 590, width: 1960, height: 150, fill: lgrad("dustBand", [[0, EP5.dust, 0], [0.6, EP5.dust, 0.26], [1, EP5.dust, 0]]) }, hazeG);
    // drifting dust streaks: over the crest and the distant view only (clear of the props)
    [[60, 628, 300], [1120, 612, 380], [1500, 640, 360], [1300, 560, 420]].forEach(([x, y, w]) => {
      sk.path(hazeG, [[x, y], [x + w * 0.3, y - 5], [x + w * 0.65, y + 2], [x + w, y - 3]], DET({ stroke: EP5.dust, width: 5, opacity: 0.55, step: 30 }));
    });
    // dust kicked off the tire ruts (puffs)
    [[1150, 860], [1300, 822], [1420, 790]].forEach(([x, y], k) => {
      sk.path(hazeG, [[x - 30, y], [x - 20, y - 12], [x, y - 16], [x + 22, y - 10], [x + 34, y - 2]], DET({ stroke: EP5.dust, width: 4, opacity: 0.7 }));
      sk.path(hazeG, [[x - 14, y - 4], [x - 4, y - 22], [x + 12, y - 26], [x + 20, y - 14]], DET({ stroke: EP5.dust, width: 2.4, opacity: 0.5 }));
    });
    for (let i = 0; i < 46; i++) {
      const x = 60 + rnd(i + 3000) * 1820, y = 560 + rnd(i + 3100) * 300;
      el("circle", { cx: f1(x), cy: f1(y), r: f1(1 + rnd(i + 3200) * 1.6), fill: EP5.sunLit, opacity: f1(0.5 + rnd(i) * 0.4) }, hazeG);
    }
    // heat shimmer over the mud flats
    for (let i = 0; i < 6; i++) { const y = 548 + i * 12, x = 1080 + rnd(i + 3300) * 600; sk.path(hazeG, [[x, y], [x + 20, y - 3], [x + 40, y], [x + 60, y - 3], [x + 80, y]], DET({ stroke: EP5.sunLit, width: 1.4, opacity: 0.5, wobble: 0.3 })); }
    lightG.sunG = sunG; lightG.hazeG = hazeG;
  } else if (MORN) {
    const sunG = el("g", { class: "rd-camp9-morning-light" }, lightG);
    // cool wash, warmer on the left where the low sun comes from
    el("rect", { x: -20, y: -20, width: 1960, height: 1120, fill: lgrad("mwash", [[0, EP5.sunLit, 0.2], [0.5, EP5.sunSkyLow, 0.12], [1, EP5.sunSkyLow, 0.2]], 1, 0) }, sunG);
    // low fog wisps lying along the crest and over the lowland
    const fog = el("g", { class: "rd-camp9-wisps" }, lightG);
    [[-20, 640, 520], [380, 668, 420], [820, 654, 380], [1100, 690, 520], [1500, 712, 440], [960, 560, 700], [1300, 600, 600]].forEach(([x, y, w]) => {
      sk.path(fog, [[x, y], [x + w * 0.25, y - 7], [x + w * 0.55, y + 3], [x + w, y - 4]], DET({ stroke: P.paper, width: 9, opacity: 0.45, step: 30 }));
      sk.path(fog, [[x + w * 0.1, y + 13], [x + w * 0.5, y + 9], [x + w * 0.9, y + 14]], DET({ stroke: P.paper, width: 3, opacity: 0.4, step: 30 }));
    });
    lightG.sunG = sunG; lightG.hazeG = fog;
  } else {
    // NIGHT: the Ep 4 s18 grade (P.night rect over the background), clear sky with stars above it
    el("rect", { x: -200, y: -200, width: 2320, height: 1480, fill: P.night, opacity: 0.72 }, gradeG);
    el("rect", { x: -200, y: -200, width: 2320, height: 1480, fill: P.storm, opacity: 0.14, style: "mix-blend-mode:screen" }, gradeG);
    el("rect", { x: -200, y: -200, width: 2320, height: 1000, fill: lgrad("skydark", [[0, P.night, 0.6], [0.7, P.night, 0.35], [1, P.night, 0]]) }, gradeG);
    const starsG = el("g", { class: "rd-camp9-stars" }, lightG);
    for (let i = 0; i < 170; i++) {
      const x = rnd(i + 5000) * 1920, y = rnd(i + 5100) * 400;
      if (x < 200 && y > 0) continue;                  // behind the big fir
      if (x > 900 && y > 395) continue;
      const big = rnd(i + 5200);
      const r = big > 0.94 ? 2.6 : big > 0.75 ? 1.7 : 1.1;
      el("circle", { cx: f1(x), cy: f1(y), r, fill: EP5.star, opacity: f1(0.5 + rnd(i + 5300) * 0.45) }, starsG);
      if (r > 2.5) { el("line", { x1: f1(x - 5), y1: f1(y), x2: f1(x + 5), y2: f1(y), stroke: EP5.star, "stroke-width": 0.8, opacity: 0.5 }, starsG); el("line", { x1: f1(x), y1: f1(y - 5), x2: f1(x), y2: f1(y + 5), stroke: EP5.star, "stroke-width": 0.8, opacity: 0.5 }, starsG); }
    }
    lightG.starsG = starsG;
  }

  const table = { g: tableG, x: (T.x0 + T.x1) / 2, y: T.top, x0: T.x0, x1: T.x1, seatY: 786, groundY: T.ground, items: { cans, crate: { g: crate, x: 1312, y: 700 }, card: { g: card, x: 1314, y: 700 } } };
  return Object.assign({}, base, {
    g: root,
    base,
    light: LIGHT,
    groundY: GROUND,
    table,
    board: { g: boardG, x: BD.x, y: BD.y, w: BD.w, h: BD.h, sheet: { g: sheetG, x: BD.x + 3, y: BD.y + 3 } },
    rainCatch: { g: rcG, x: 348, y: 788, spoutX: 350, spoutY: 770, barrels: [{ x: 348, y: 788, w: 50 }, { x: 398, y: 800, w: 46 }], web: { x: 350, y: 778 } },
    station,
    gordTent: { g: T1.g, x: T1.x, y: T1.y, w: T1.w, h: T1.h, sign: gordSignH },
    tentsNew,
    paths: { g: pathsG, lines: pathLines },
    shadowG,
    skyG,
    lightG,
    gradeG,
    shadowDir,
    detail,
  });
};
