/* Rainy Day background — `hilltop` v1. The hilltop assembly area (exterior, late-afternoon gloom), with a view
 * at RIGHT over the ocean and the flooded lowland where Gull Harbor was (water to the eaves, roofs poking out).
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v1.js. Deterministic, static; scenes own all motion.
 *
 *   const bg = window.RainyDayBG.hilltop(layerG, { crowd: true });
 *
 * OPTS (all optional):
 *   crowd: true      draw the muted-gray townspeople silhouettes (crowd.g); false = empty assembly area
 *   level: 540       initial flood level (screen y of the flood surface in the distant view)
 *
 * HANDLES returned:
 *   g                 root <g> of the whole background
 *   groundY = 860     summit grass line where character feet stand (figure y = 860 - 116*scale, e.g. 697.6 at 1.4)
 *                     Flat & walkable for x 0–1920 in the foreground (the crest lip is behind, y ≈ 645–735).
 *   canopy: { g, x: 690, y: 835, x0: 500, x1: 880, eaveY: 548, peakY: 452 }
 *                     pop-up canopy (CERT tent) + tarp lean-to at left. x = center, y = front-leg ground line.
 *   table:  { g, x: 1215, y: 742, x0: 1085, x1: 1345, seatY: 786, groundY: 818 }
 *                     picnic table, mid-ground right of center. y = tabletop, seatY = front bench top.
 *   sign:   { g, x: 1015, y: 520, w: 200, h: 180 }   "ASSEMBLY AREA" sign (steel/paper). x = center, y = panel top.
 *   tank:   { g, x: 252, y: 600 }                   water tank (top-center of the drum).
 *   crowd:  { g, members: [ { g, x, y, scale, pose } ] }  optional muted townspeople (opts.crowd, default true).
 *   view:   { g, waterG, levelY: 540, horizonY: 420, setLevel(y) }
 *                     the distant flooded lowland. waterG = the flood-water group. setLevel(y) redraws the flood
 *                     surface at screen y (smaller y = higher water): ~600 receded (houses show), 540 normal
 *                     (roofs poking out), ~500 surge (roofs gone). Each roof/steeple/tree is clipped to its own
 *                     waterline and gets a ripple ring, so call it freely from a tween onUpdate.
 *   sky: { g }, far: { g }  sky/clouds and the far hills + ocean (for parallax / dimming).
 */
window.RainyDayBG = window.RainyDayBG || {};
if (!window.RainyDayBG.hilltop) window.RainyDayBG.hilltop = function (parent, opts) {
  opts = opts || {};
  const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
  const showCrowd = opts.crowd !== false;
  const L0 = 540, HORIZON = 420, GROUND = 860;
  let SEED = 7300;
  const sd = () => (SEED += 7);
  const rnd = (i) => (H(i * 1.731 + 91.3) + 1) / 2; // deterministic 0..1
  const D = (o) => Object.assign({ seed: sd() }, o);
  const DET = (o) => Object.assign({ seed: sd(), width: LINE.detail }, o);
  const txt = (g, x, y, s, a, fit) => {
    const t = el("text", Object.assign({ x, y, "text-anchor": "middle" }, fit ? { textLength: fit, lengthAdjust: "spacingAndGlyphs" } : {}, a), g);
    t.textContent = s;
    return t;
  };
  const GOTHIC = '"League Gothic", "Oswald", "Arial Narrow", sans-serif';
  const HAND = '"Kalam", "Comic Sans MS", cursive';

  const root = el("g", { class: "rd-bg rd-bg-hilltop" }, parent);

  // ------------------------------------------------------------------ helpers
  function fir(g, x, base, h, w, o) {
    o = o || {};
    const tg = el("g", { opacity: o.opacity !== undefined ? o.opacity : 1 }, g);
    const fill = o.fill || P.slate, stroke = o.stroke || P.ink, lw = o.width || LINE.main;
    const tiers = o.tiers || Math.max(5, Math.round(h / 42));
    sk.line(tg, x, base, x, base - h * 0.15, { seed: sd(), stroke, width: Math.max(lw, w * 0.07) });
    const pts = [[x, base - h]];
    for (let i = 1; i <= tiers; i++) {
      const t = i / tiers, yy = base - h + h * 0.88 * t, ww = (w / 2) * (0.25 + 0.75 * t);
      pts.push([x + ww, yy + 4], [x + ww * 0.55, yy - h * 0.03]);
    }
    const right = pts.slice(1);
    const left = right.map(([px, py]) => [2 * x - px + H(px + py) * 3, py + H(py) * 3]).reverse();
    const shape = [pts[0]].concat(right.slice(0, -1), [[x + w * 0.12, base - h * 0.12], [x - w * 0.12, base - h * 0.12]], left.slice(1));
    sk.poly(tg, shape, { seed: sd(), fill, stroke, width: lw, step: 200, wobble: o.wobble !== undefined ? o.wobble : 1.4 });
    if (o.boughs !== false) {
      for (let i = 1; i < tiers; i++) {
        const t = i / tiers, yy = base - h + h * 0.88 * t, ww = (w / 2) * (0.25 + 0.75 * t);
        sk.path(tg, [[x - ww * 0.15, yy - h * 0.06], [x + ww * 0.55, yy - h * 0.005]], { seed: sd(), stroke, width: Math.max(1, lw * 0.5), opacity: 0.55, double: false });
        sk.path(tg, [[x - ww * 0.1, yy - h * 0.05], [x - ww * 0.6, yy]], { seed: sd(), stroke, width: Math.max(1, lw * 0.5), opacity: 0.35, double: false });
      }
    }
    return tg;
  }
  function cloud(g, x, y, w, h, fill, o) {
    o = o || {};
    const pts = [];
    const n = Math.max(6, Math.round(w / 70));
    pts.push([x, y + h]);
    for (let i = 0; i <= n; i++) {
      const t = i / n, bump = Math.sin(t * Math.PI) * h * (0.6 + 0.4 * rnd(x + i * 3.1));
      pts.push([x + w * t, y + h - bump - (i % 2 ? h * 0.18 : 0)]);
    }
    pts.push([x + w, y + h]);
    for (let i = n; i >= 0; i--) pts.push([x + (w * i) / n, y + h + 6 * H(x + i)]);
    return sk.poly(g, pts, { seed: sd(), fill, stroke: o.stroke || P.ink, width: o.width || LINE.detail, opacity: o.opacity !== undefined ? o.opacity : 1, step: 40, wobble: 2.5 });
  }
  // little muted stick person (crowd + silhouettes). pose = RD.POSES name or object
  function person(g, x, gy, s, pose, o) {
    o = o || {};
    const pz = typeof pose === "string" ? RD.POSES[pose] : pose;
    const f = o.facing === -1 ? -1 : 1;
    const stroke = o.stroke || P.storm, lw = (o.width || 9) * s;
    const pg = el("g", { class: "rd-crowd-person", opacity: o.opacity !== undefined ? o.opacity : 0.95 }, g);
    const rad = (a) => (a * Math.PI) / 180;
    const dir = (a) => [Math.sin(rad(a)) * f, Math.cos(rad(a))];
    const hip = [x, gy - 116 * s + pz.dy * s];
    const td = [Math.sin(rad(pz.torso)) * f, -Math.cos(rad(pz.torso))];
    const sh = [hip[0] + td[0] * 88 * s, hip[1] + td[1] * 88 * s];
    const hc = [hip[0] + td[0] * 135 * s + Math.sin(rad(pz.head)) * f * 4 * s, hip[1] + td[1] * 135 * s];
    const limb = (r, a1, a2, l1, l2) => {
      const d1 = dir(a1), m = [r[0] + d1[0] * l1 * s, r[1] + d1[1] * l1 * s];
      const d2 = dir(a1 + a2);
      return [r, m, [m[0] + d2[0] * l2 * s, m[1] + d2[1] * l2 * s]];
    };
    const LS = { seed: sd(), stroke, width: lw, wobble: 0.8, double: false };
    sk.path(pg, limb(hip, pz.lhip, pz.lkn, 60, 58), Object.assign({}, LS, { seed: sd(), opacity: 0.8 }));
    sk.path(pg, limb(sh, pz.lsh + pz.torso, pz.lel, 52, 50), Object.assign({}, LS, { seed: sd(), opacity: 0.8 }));
    if (o.coat) sk.poly(pg, [[sh[0] - 14 * s, sh[1] + 2 * s], [sh[0] + 14 * s, sh[1] + 2 * s], [hip[0] + 20 * s, hip[1] + 18 * s], [hip[0] - 20 * s, hip[1] + 18 * s]], { seed: sd(), fill: o.coat, stroke, width: lw * 0.5, wobble: 0.8, double: false, step: 400 });
    sk.path(pg, [hip, sh, [hc[0], hc[1] + 20 * s]], Object.assign({}, LS, { seed: sd() }));
    sk.path(pg, limb(hip, pz.rhip, pz.rkn, 60, 58), Object.assign({}, LS, { seed: sd() }));
    const ra = limb(sh, pz.rsh + pz.torso, pz.rel, 52, 50);
    sk.path(pg, ra, Object.assign({}, LS, { seed: sd() }));
    sk.circle(pg, hc[0], hc[1], 25 * s, { seed: sd(), fill: o.head || P.mist, stroke, width: lw * 0.75, wobble: 0.6, double: false });
    if (o.hood) sk.path(pg, [[hc[0] - 27 * s, hc[1] + 6 * s], [hc[0] - 22 * s, hc[1] - 20 * s], [hc[0], hc[1] - 29 * s], [hc[0] + 22 * s, hc[1] - 20 * s], [hc[0] + 27 * s, hc[1] + 6 * s]], { seed: sd(), stroke, width: lw * 0.9, wobble: 0.6, double: false, step: 400 });
    return { g: pg, x, y: hip[1], scale: s, hand: ra[2], hip, head: hc };
  }
  function campChair(g, x, gy, s, o) {
    o = o || {};
    const cg = el("g", {}, g);
    const seatY = gy - 70 * s, w = 70 * s;
    // X legs
    sk.line(cg, x - w / 2, gy, x + w / 2, seatY, DET({ width: 3, stroke: P.ink }));
    sk.line(cg, x + w / 2, gy, x - w / 2, seatY, DET({ width: 3, stroke: P.ink }));
    // seat sling
    sk.path(cg, [[x - w / 2 - 4 * s, seatY], [x, seatY + 10 * s], [x + w / 2 + 4 * s, seatY]], DET({ width: 5 * s + 1, stroke: P.ink }));
    // back
    sk.poly(cg, [[x - w / 2 - 2 * s, seatY - 4 * s], [x - w / 2 + 4 * s, seatY - 72 * s], [x + w / 2 - 4 * s, seatY - 72 * s], [x + w / 2 + 2 * s, seatY - 4 * s]], D({ fill: o.fill || P.slate, width: 3, step: 400, wobble: 1 }));
    sk.line(cg, x - w / 2, seatY - 40 * s, x + w / 2, seatY - 40 * s, DET({ stroke: P.mist, opacity: 0.6, double: false }));
    // arm rests + cup holder
    sk.line(cg, x - w / 2 - 8 * s, seatY - 26 * s, x - w / 2 + 6 * s, seatY - 26 * s, DET({ width: 3 }));
    sk.line(cg, x + w / 2 - 6 * s, seatY - 26 * s, x + w / 2 + 8 * s, seatY - 26 * s, DET({ width: 3 }));
    sk.circle(cg, x + w / 2 + 10 * s, seatY - 24 * s, 6 * s, DET({ fill: P.steel }));
    return { g: cg, seatY };
  }

  // ------------------------------------------------------------------ SKY
  const skyG = el("g", { class: "rd-hilltop-sky" }, root);
  const defs = el("defs", {}, skyG);
  const gid = "rdHilltopSky" + Math.round(Math.abs(H(SEED)) * 1e6);
  const grad = el("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [[0, P.night], [0.35, P.storm], [0.62, P.slate], [0.78, P.steel], [1, P.slate]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, grad));
  el("rect", { x: -20, y: -20, width: 1960, height: 760, fill: `url(#${gid})` }, skyG);
  // low late-afternoon glow behind the cloud deck, over the sea
  const rg = el("radialGradient", { id: gid + "g" }, defs);
  [[0, P.paper, 0.55], [0.45, P.fog, 0.25], [1, P.fog, 0]].forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a }, rg));
  el("ellipse", { cx: 1540, cy: 410, rx: 700, ry: 150, fill: `url(#${gid}g)` }, skyG);
  // faint rays from a break in the clouds
  [[1380, 0.06], [1500, 0.08], [1640, 0.07], [1760, 0.05]].forEach(([bx, op], i) => {
    sk.poly(skyG, [[1560 + i * 20, 250], [1580 + i * 20, 250], [bx + 60, 418], [bx - 20, 418]], D({ fill: P.paper, stroke: P.paper, width: 1, opacity: op, double: false }));
  });
  // cloud deck (back to front)
  cloud(skyG, -60, 210, 760, 120, P.steel, { opacity: 0.55 });
  cloud(skyG, 600, 240, 700, 90, P.steel, { opacity: 0.5 });
  cloud(skyG, 1180, 300, 520, 70, P.mist, { opacity: 0.35 });
  cloud(skyG, 1650, 290, 360, 70, P.mist, { opacity: 0.3 });
  cloud(skyG, -80, 100, 900, 150, P.slate, { opacity: 0.9 });
  cloud(skyG, 700, 60, 900, 170, P.slate, { opacity: 0.9 });
  cloud(skyG, 1450, 120, 560, 130, P.slate, { opacity: 0.85 });
  cloud(skyG, -60, -30, 1100, 150, P.storm, { opacity: 1 });
  cloud(skyG, 900, -40, 1100, 160, P.storm, { opacity: 1 });
  // underside streaks / pen texture
  for (let i = 0; i < 26; i++) {
    const cx = 40 + rnd(i) * 1840, cy = 70 + rnd(i + 40) * 210, w = 60 + rnd(i + 80) * 160;
    sk.line(skyG, cx, cy, cx + w, cy + 4 * H(i), DET({ stroke: i % 3 ? P.night : P.mist, opacity: i % 3 ? 0.35 : 0.25, double: false, wobble: 1 }));
  }
  // far rain curtain over the sea (scenery, not weather)
  for (let i = 0; i < 18; i++) {
    const x = 1180 + i * 14 + rnd(i + 7) * 10;
    sk.line(skyG, x, 330 + rnd(i) * 20, x - 18, 418, DET({ stroke: P.mist, opacity: 0.18, double: false, width: 2 }));
  }

  // ------------------------------------------------------------------ FAR: ocean, far hills
  const farG = el("g", { class: "rd-hilltop-far" }, root);
  sk.poly(farG, [[900, HORIZON], [1940, HORIZON], [1940, 600], [900, 600]], D({ fill: P.steel, stroke: P.steel, width: 1, double: false, wobble: 0.5 }));
  sk.line(farG, 1000, HORIZON, 1940, HORIZON, DET({ stroke: P.ink, opacity: 0.6, wobble: 0.6 }));
  el("ellipse", { cx: 1560, cy: HORIZON + 22, rx: 330, ry: 16, fill: P.fog, opacity: 0.28 }, farG);
  for (let i = 0; i < 22; i++) {
    const y = HORIZON + 8 + Math.pow(rnd(i + 3), 1.4) * 110, x = 900 + rnd(i + 11) * 1000, w = 30 + rnd(i + 5) * 90 * (1 + (y - HORIZON) / 80);
    sk.line(farG, x, y, x + w, y, DET({ stroke: i % 4 ? P.mist : P.paper, opacity: 0.4, double: false, wobble: 0.5 }));
  }
  // a long cape running out to the horizon (hides the ocean's left edge)
  sk.poly(farG, [[560, 520], [700, 462], [820, 440], [930, 428], [1010, 422], [1060, 421], [1090, 424], [1060, 436], [1000, 452], [930, 474], [880, 500], [860, 560], [560, 560]], D({ fill: P.mist, stroke: P.steel, width: LINE.detail, opacity: 1 }));
  sk.poly(farG, [[560, 520], [700, 462], [820, 440], [930, 428], [1010, 422], [1060, 421], [1090, 424], [1060, 436], [1000, 452], [930, 474], [880, 500], [860, 560], [560, 560]], { seed: sd(), fill: P.steel, stroke: "none", opacity: 0.35, double: false, wobble: 0 }); // haze
  for (let i = 0; i < 12; i++) { const x = 720 + i * 28, base = 466 - (x - 720) * 0.12 + 8; fir(farG, x, base, 16 + rnd(i + 44) * 10, 8, { fill: P.steel, stroke: P.steel, width: 1.5, opacity: 0.45, boughs: false, tiers: 3, wobble: 0.4 }); }
  // far mainland hills (left, behind the summit)
  sk.poly(farG, [[-20, 520], [120, 470], [260, 450], [420, 470], [560, 440], [700, 462], [860, 492], [980, 520], [1060, 560], [1060, 700], [-20, 700]], D({ fill: P.mist, stroke: P.steel, width: LINE.detail, opacity: 0.55 }));
  for (let i = 0; i < 30; i++) {
    const x = -10 + i * 36 + rnd(i) * 14, base = 520 - Math.sin((x + 60) / 340) * 50 + 28;
    fir(farG, x, base, 34 + rnd(i + 9) * 22, 16 + rnd(i) * 6, { fill: P.steel, stroke: P.steel, width: 2, opacity: 0.5, boughs: false, tiers: 4, wobble: 0.6 });
  }
  sk.poly(farG, [[-20, 590], [160, 560], [330, 548], [520, 566], [700, 552], [880, 572], [1020, 600], [1100, 640], [1100, 720], [-20, 720]], D({ fill: P.steel, stroke: P.slate, width: LINE.detail, opacity: 0.85 }));
  // far shore ridge across the valley (right)
  sk.poly(farG, [[980, 500], [1080, 478], [1180, 470], [1290, 486], [1380, 500], [1460, 514], [1540, 524], [1600, 530], [1600, 560], [980, 560]], D({ fill: P.mist, stroke: P.steel, width: LINE.detail, opacity: 0.7 }));
  for (let i = 0; i < 16; i++) {
    const x = 1000 + i * 34 + rnd(i + 30) * 10, base = 504 + (x - 1000) * 0.05 - Math.sin((x - 980) / 200) * 18;
    fir(farG, x, base, 18 + rnd(i + 2) * 12, 9, { fill: P.steel, stroke: P.steel, width: 1.5, opacity: 0.55, boughs: false, tiers: 3, wobble: 0.4 });
  }
  // lighthouse on the far point
  sk.rect(farG, 1572, 500, 8, 26, DET({ fill: P.fog, stroke: P.slate, double: false }));
  sk.poly(farG, [[1570, 500], [1576, 492], [1582, 500]], DET({ fill: P.slate, stroke: P.slate, double: false }));

  // ------------------------------------------------------------------ VIEW: the flooded lowland
  const viewG = el("g", { class: "rd-hilltop-view" }, root);
  // drowned lowland (fields, roads) under the water
  sk.poly(viewG, [[900, 528], [1940, 528], [1940, 800], [900, 800]], D({ fill: P.slate, stroke: P.slate, width: 1, double: false }));
  for (let i = 0; i < 9; i++) {
    const y = 545 + i * 26;
    sk.line(viewG, 900, y, 1940, y + 6, DET({ stroke: P.steel, opacity: 0.5, double: false }));
  }
  for (let i = 0; i < 7; i++) sk.line(viewG, 1150 + i * 110, 530, 1100 + i * 150, 790, DET({ stroke: P.steel, opacity: 0.45, double: false }));
  const waterG = el("g", { class: "rd-hilltop-water" }, viewG);
  const emergG = el("g", { class: "rd-hilltop-emergents" }, viewG);
  const ripG = el("g", { class: "rd-hilltop-ripples" }, viewG);
  // things standing in the flood: houses, steeple, water tower, trees, poles. Each clipped at its waterline.
  const emergents = [];
  const clipBase = "rdHtWl" + Math.round(Math.abs(H(SEED + 3)) * 1e6) + "_";
  function emergent(x, yb, w, total, roofH, drawFn) {
    const id = clipBase + emergents.length;
    const cp = el("clipPath", { id }, emergG);
    const r = el("rect", { x: x - w * 3, y: yb - total - 400, width: w * 6, height: 400 + total }, cp);
    const g = el("g", { "clip-path": `url(#${id})` }, emergG);
    drawFn(g);
    const sc = w / 30;
    // normal depth so the roof pokes out at L0
    const base = total - roofH * (0.55 + 0.35 * rnd(x + yb));
    emergents.push({ x, yb, w, total, rect: r, base, sc });
  }
  function house(x, yb, w, i) {
    const bh = w * 0.75, rh = w * 0.55, lw = Math.max(1.2, w / 18);
    emergent(x, yb, w, bh + rh, rh, (g) => {
      const wall = i % 3 === 0 ? P.fog : i % 3 === 1 ? P.mist : P.steel;
      sk.rect(g, x - w / 2, yb - bh, w, bh, { seed: sd(), fill: wall, stroke: P.ink, width: lw, wobble: 0.5, double: false });
      const hip = i % 4 === 2;
      sk.poly(g, hip ? [[x - w / 2 - w * 0.08, yb - bh], [x - w * 0.2, yb - bh - rh], [x + w * 0.2, yb - bh - rh], [x + w / 2 + w * 0.08, yb - bh]] : [[x - w / 2 - w * 0.08, yb - bh], [x, yb - bh - rh], [x + w / 2 + w * 0.08, yb - bh]], { seed: sd(), fill: i % 2 ? P.storm : P.slate, stroke: P.ink, width: lw, wobble: 0.5, double: false, step: 400 });
      if (w > 22) {
        sk.rect(g, x - w * 0.3, yb - bh * 0.75, w * 0.2, w * 0.2, { seed: sd(), fill: P.night, stroke: P.ink, width: 1, wobble: 0.3, double: false });
        sk.rect(g, x + w * 0.1, yb - bh * 0.75, w * 0.2, w * 0.2, { seed: sd(), fill: P.night, stroke: P.ink, width: 1, wobble: 0.3, double: false });
        if (i % 3 === 1) sk.rect(g, x + w * 0.18, yb - bh - rh * 0.9, w * 0.12, rh * 0.5, { seed: sd(), fill: P.slate, stroke: P.ink, width: 1, wobble: 0.3, double: false });
      }
    });
  }
  // rows (far → near), screen y of each row's foundation
  const rows = [[566, 13, [1250, 1300, 1345, 1420, 1470, 1530]], [590, 17, [1205, 1265, 1330, 1395, 1480, 1560, 1640]],
    [622, 22, [1180, 1250, 1335, 1420, 1515, 1600, 1700, 1790]], [660, 28, [1230, 1330, 1450, 1560, 1680, 1800, 1890]],
    [700, 36, [1390, 1530, 1660, 1790, 1905]]];
  let hi = 0;
  rows.forEach(([yb, w, xs], r) => xs.forEach((x, k) => house(x + 8 * H(r * 10 + k), yb + 4 * H(k + r), w * 1.35 * (0.85 + 0.3 * rnd(r * 9 + k)), hi++)));
  // church steeple
  emergent(1372, 640, 30, 120, 70, (g) => {
    sk.rect(g, 1360, 590, 24, 50, D({ fill: P.fog, width: 2, wobble: 0.5, double: false }));
    sk.poly(g, [[1356, 592], [1372, 520], [1388, 592]], D({ fill: P.slate, width: 2, wobble: 0.5, double: false, step: 400 }));
    sk.line(g, 1372, 520, 1372, 506, DET({ double: false }));
    sk.line(g, 1366, 512, 1378, 512, DET({ double: false }));
    sk.rect(g, 1367, 600, 10, 14, DET({ fill: P.night, width: 1, double: false }));
  });
  // water tower
  emergent(1745, 640, 34, 110, 60, (g) => {
    [1730, 1760].forEach((lx) => sk.line(g, lx, 640, lx + (lx < 1745 ? 4 : -4), 570, DET({ double: false })));
    sk.line(g, 1732, 610, 1758, 580, DET({ double: false, width: 1.5 }));
    sk.rect(g, 1722, 545, 46, 28, D({ fill: P.mist, width: 2, wobble: 0.5, double: false }));
    sk.poly(g, [[1720, 546], [1745, 532], [1770, 546]], D({ fill: P.slate, width: 2, wobble: 0.4, double: false, step: 400 }));
    const t = txt(g, 1745, 566, "GH", { "font-family": GOTHIC, "font-size": 14, fill: P.ink, opacity: 0.8 });
  });
  // fir tops standing in the water
  [[1185, 700, 70], [1290, 690, 60], [1610, 712, 80], [1860, 700, 66], [1130, 640, 50]].forEach(([x, yb, h]) =>
    emergent(x, yb, 22, h, h * 0.55, (g) => fir(g, x, yb, h, h * 0.42, { fill: P.storm, stroke: P.ink, width: 2, tiers: 5, boughs: false, wobble: 0.6 })));
  // power poles
  [1225, 1460, 1700].forEach((x, i) => emergent(x, 680 - i * 6, 10, 80, 30, (g) => {
    sk.line(g, x, 680 - i * 6, x, 600 - i * 6, DET({ width: 2.5, double: false }));
    sk.line(g, x - 12, 608 - i * 6, x + 12, 608 - i * 6, DET({ double: false }));
  }));
  // sagging line between the poles (above water, always visible)
  sk.path(ripG, [[1225, 608], [1340, 620], [1460, 602], [1580, 612], [1700, 596]], DET({ stroke: P.ink, width: 1.5, opacity: 0.6, double: false }));

  let curLevel = L0;
  function setLevel(y) {
    curLevel = y;
    while (waterG.firstChild) waterG.removeChild(waterG.firstChild);
    while (ripG.childNodes.length > 1) ripG.removeChild(ripG.lastChild);
    // flood surface (top edge = y), with a slight swell
    const top = [];
    for (let x = 900; x <= 1940; x += 52) top.push([x, y + 2.5 * Math.sin(x / 61) + 1.5 * H(x)]);
    sk.poly(waterG, top.concat([[1940, 820], [900, 820]]), { seed: 9001, fill: P.steel, stroke: P.ink, width: LINE.detail, wobble: 0.6, opacity: 1, step: 60 });
    el("rect", { x: 900, y: y + 2, width: 1040, height: 26, fill: P.mist, opacity: 0.22 }, waterG);
    // sheen streaks + floating debris
    for (let i = 0; i < 34; i++) {
      const sy = y + 6 + Math.pow(rnd(i + 200), 1.3) * (820 - y - 10), sx = 930 + rnd(i + 300) * 980, w = 14 + rnd(i + 400) * 60 * (1 + (sy - 520) / 160);
      if (sy > 800) continue;
      sk.line(waterG, sx, sy, sx + w, sy + H(i) * 1.5, { seed: 9100 + i, stroke: i % 5 ? P.mist : P.paper, width: 1.6, opacity: 0.55, wobble: 0.4, double: false });
    }
    for (let i = 0; i < 9; i++) {
      const dy2 = y + 18 + rnd(i + 500) * 140, dx = 1100 + rnd(i + 600) * 780, w = 8 + rnd(i + 700) * 14;
      sk.line(waterG, dx, dy2, dx + w, dy2 - 2 + H(i) * 3, { seed: 9200 + i, stroke: P.ink, width: 2.5, opacity: 0.7, wobble: 0.4, double: false });
    }
    // per-object waterlines
    emergents.forEach((e, i) => {
      const under = e.yb > y;
      const depth = under ? Math.max(0, Math.min(e.yb - y, e.base + (L0 - y) * 0.55 * e.sc)) : 0;
      const wl = e.yb - depth;
      e.rect.setAttribute("height", Math.max(0, wl - (e.yb - e.total - 400)).toFixed(1));
      if (depth > 0.5) {
        el("ellipse", { cx: e.x, cy: wl, rx: e.w * 0.75, ry: Math.max(1.2, e.w * 0.08), fill: "none", stroke: P.fog, "stroke-width": 1.4, opacity: 0.7 }, ripG);
        el("line", { x1: e.x - e.w * 0.6, y1: wl, x2: e.x + e.w * 0.6, y2: wl, stroke: P.ink, "stroke-width": 1.2, opacity: 0.6 }, ripG);
      }
    });
  }
  setLevel(opts.level !== undefined ? opts.level : L0);
  // our hill's own forested flank, dropping to the flood (bounds the view at left)
  const flankG = el("g", {}, viewG);
  sk.poly(flankG, [[860, 590], [960, 600], [1060, 625], [1150, 662], [1240, 700], [1320, 740], [1320, 820], [860, 820]], D({ fill: P.slate, stroke: P.ink, width: LINE.detail }));
  for (let i = 0; i < 14; i++) {
    const x = 880 + i * 30 + rnd(i + 70) * 12, base = 610 + Math.max(0, x - 960) * 0.33 + 10;
    fir(flankG, x, base, 50 + rnd(i + 3) * 26, 24, { fill: P.storm, stroke: P.ink, width: 2, tiers: 4, boughs: false, wobble: 0.6, opacity: 0.9 });
  }

  // ------------------------------------------------------------------ SUMMIT GROUND
  const groundG = el("g", { class: "rd-hilltop-ground" }, root);
  const crest = [[-20, 662], [200, 646], [420, 652], [640, 642], [860, 648], [1020, 660], [1140, 680], [1260, 704], [1450, 720], [1700, 730], [1940, 738]];
  sk.poly(groundG, crest.concat([[1940, 1100], [-20, 1100]]), D({ fill: P.steel, width: LINE.main, step: 40 }));
  // mid-ground grass shading and tufts
  sk.hatch(groundG, 0, 668, 1100, 60, { seed: sd(), gap: 18, angle: 70, stroke: P.slate, opacity: 0.22 });
  // the crest lip at right: rocks + a drop shadow
  sk.path(groundG, [[1150, 690], [1300, 716], [1500, 730], [1700, 740], [1940, 748]], DET({ stroke: P.slate, width: 6, opacity: 0.6, double: false }));
  [[1180, 692, 26], [1340, 722, 18], [1540, 734, 30], [1760, 744, 22], [1880, 748, 16]].forEach(([x, y, r]) =>
    sk.poly(groundG, [[x - r, y + 6], [x - r * 0.6, y - r * 0.5], [x + r * 0.3, y - r * 0.6], [x + r, y + 6]], D({ fill: P.mist, width: 3, wobble: 1, step: 400 })));
  // foreground band (darker, low detail; the caption bar sits at y >= 940)
  sk.poly(groundG, [[-20, 905], [300, 898], [700, 908], [1100, 900], [1500, 910], [1940, 902], [1940, 1100], [-20, 1100]], D({ fill: P.slate, stroke: P.slate, width: 2, double: false, step: 60 }));
  sk.hatch(groundG, 0, 900, 1920, 40, { seed: sd(), gap: 22, angle: 75, stroke: P.storm, opacity: 0.35 });
  // worn dirt path from the trail head (left) into the assembly area
  sk.poly(groundG, [[-20, 940], [140, 905], [300, 868], [430, 842], [560, 830], [700, 836], [640, 860], [460, 880], [320, 912], [200, 960], [80, 1010], [-20, 1040]], D({ fill: P.mist, stroke: P.slate, width: LINE.detail, opacity: 0.45, step: 40 }));
  for (let i = 0; i < 6; i++) sk.line(groundG, 60 + i * 70, 960 - i * 22, 110 + i * 70, 948 - i * 22, DET({ stroke: P.slate, opacity: 0.5, double: false }));
  // grass tufts (mid-ground: light; near: a few)
  for (let i = 0; i < 70; i++) {
    const x = rnd(i + 800) * 1920, y = 680 + Math.pow(rnd(i + 900), 0.8) * 220;
    if (y < 650 + (x > 1100 ? (x - 1100) * 0.06 + 30 : 0)) continue;
    const h = 8 + (y - 660) * 0.05, c = y > 820 ? P.slate : P.slate;
    sk.path(groundG, [[x - h * 0.5, y - h], [x, y], [x + h * 0.15, y - h * 1.2], [x + 2, y], [x + h * 0.7, y - h * 0.8]], DET({ stroke: c, opacity: 0.55, double: false, wobble: 0.5, step: 400 }));
  }
  // puddles
  [[300, 878, 70, 9], [1170, 892, 90, 10], [1580, 820, 60, 7]].forEach(([x, y, rx, ry], i) => {
    el("ellipse", { cx: x, cy: y, rx, ry, fill: P.fog, opacity: 0.4 }, groundG);
    sk.path(groundG, [[x - rx, y], [x - rx * 0.6, y - ry], [x + rx * 0.5, y - ry * 0.9], [x + rx, y], [x + rx * 0.4, y + ry], [x - rx * 0.6, y + ry * 0.9], [x - rx, y]], DET({ stroke: P.slate, opacity: 0.7, double: false }));
    sk.line(groundG, x - rx * 0.4, y - 2, x + rx * 0.2, y - 2, DET({ stroke: P.paper, opacity: 0.6, double: false }));
  });

  // ------------------------------------------------------------------ MID: trees behind the summit (left)
  const treesG = el("g", { class: "rd-hilltop-trees" }, root);
  [[250, 660, 230, 96], [330, 655, 290, 120], [420, 664, 200, 84], [930, 664, 210, 86], [990, 672, 170, 70], [800, 655, 160, 64]].forEach(([x, b, h, w]) =>
    fir(treesG, x, b, h, w, { fill: P.slate, stroke: P.storm, width: 3, opacity: 0.95 }));

  // ------------------------------------------------------------------ ROPE BARRIER along the lip (right)
  const ropeG = el("g", { class: "rd-hilltop-rope" }, root);
  const posts = [[1300, 742], [1460, 752], [1620, 760], [1780, 766], [1925, 770]];
  posts.forEach(([x, y]) => {
    sk.line(ropeG, x, y, x + 2, y - 62, D({ width: 6 }));
    sk.line(ropeG, x - 6, y - 52, x + 8, y - 54, DET({ stroke: P.mist, opacity: 0.6, double: false }));
  });
  for (let i = 0; i < posts.length - 1; i++) {
    const [ax, ay] = posts[i], [bx, by] = posts[i + 1];
    sk.path(ropeG, [[ax, ay - 56], [(ax + bx) / 2, (ay + by) / 2 - 40], [bx, by - 56]], DET({ width: 2.5, step: 12 }));
    // flagging tape
    const mx = (ax + bx) / 2, my = (ay + by) / 2 - 40;
    sk.path(ropeG, [[mx, my], [mx + 3, my + 16]], DET({ stroke: P.fog, width: 4, double: false }));
  }
  const stay = el("g", {}, ropeG);
  sk.rect(stay, 1500, 700, 66, 30, D({ fill: P.paper, width: 2.5, wobble: 0.8 }));
  txt(stay, 1533, 721, "STAY BACK", { "font-family": GOTHIC, "font-size": 18, fill: P.ink }, 54);

  // ------------------------------------------------------------------ WATER TANK (left)
  const tankG = el("g", { class: "rd-hilltop-tank" }, root);
  const TX = 252;
  [[200, 818], [304, 818], [214, 806], [292, 806]].forEach(([x, y]) => sk.line(tankG, x, y, x + (x < TX ? 8 : -8), 760, D({ width: 5 })));
  sk.line(tankG, 208, 790, 296, 770, DET({}));
  sk.line(tankG, 208, 770, 296, 790, DET({}));
  sk.rect(tankG, 188, 752, 128, 14, D({ fill: P.slate, width: 3 }));
  sk.poly(tankG, [[196, 752], [194, 616], [310, 616], [308, 752]], D({ fill: P.fog, width: LINE.main }));
  el("ellipse", { cx: TX, cy: 616, rx: 58, ry: 12, fill: P.paper, stroke: P.ink, "stroke-width": 3 }, tankG);
  el("ellipse", { cx: TX, cy: 615, rx: 16, ry: 5, fill: P.mist, stroke: P.ink, "stroke-width": 2 }, tankG);
  for (let i = 0; i < 5; i++) sk.path(tankG, [[196, 640 + i * 24], [TX, 646 + i * 24], [308, 640 + i * 24]], DET({ stroke: P.steel, opacity: 0.8, double: false }));
  sk.hatch(tankG, 276, 620, 32, 130, { seed: sd(), gap: 9, angle: 60, stroke: P.steel, opacity: 0.5 });
  txt(tankG, TX - 8, 700, "POTABLE", { "font-family": GOTHIC, "font-size": 22, fill: P.slate }, 70);
  txt(tankG, TX - 8, 724, "WATER", { "font-family": GOTHIC, "font-size": 22, fill: P.slate }, 56);
  // spigot + jugs + drip puddle
  sk.path(tankG, [[300, 738], [318, 738], [318, 748]], D({ width: 4 }));
  sk.rect(tankG, 312, 784, 22, 30, D({ fill: P.mist, width: 2.5, wobble: 0.6 }));
  sk.rect(tankG, 168, 788, 24, 30, D({ fill: P.mist, width: 2.5, wobble: 0.6 }));
  sk.rect(tankG, 148, 794, 22, 26, D({ fill: P.fog, width: 2.5, wobble: 0.6 }));

  // ------------------------------------------------------------------ CANOPY + TARP LEAN-TO
  const canopyG = el("g", { class: "rd-hilltop-canopy" }, root);
  const C = { x0: 500, x1: 880, cx: 690, eave: 548, peak: 452, base: 835 };
  // tarp lean-to off the canopy's left side
  sk.poly(canopyG, [[512, 556], [540, 532], [392, 760], [356, 790]], D({ fill: P.slate, width: LINE.main }));
  for (let i = 1; i < 4; i++) sk.line(canopyG, 512 + i * 7, 556 - i * 6, 356 + i * 9, 790 - i * 7.5, DET({ stroke: P.storm, opacity: 0.7, double: false }));
  sk.hatch(canopyG, 380, 600, 140, 180, { seed: sd(), gap: 11, angle: -30, stroke: P.ink, opacity: 0.2 });
  [[356, 790], [392, 760]].forEach(([x, y]) => { sk.line(canopyG, x, y, x - 34, y + 38, DET({})); sk.line(canopyG, x - 38, y + 34, x - 30, y + 44, DET({ width: 3 })); });
  sk.line(canopyG, 410, 735, 410, 800, D({ width: 4 })); // tarp pole
  // under the tarp: supply crates and a cot with a sleeper
  sk.rect(canopyG, 430, 772, 56, 40, D({ fill: P.steel, width: 3 }));
  sk.rect(canopyG, 440, 740, 44, 32, D({ fill: P.mist, width: 3 }));
  txt(canopyG, 458, 798, "SUPPLIES", { "font-family": GOTHIC, "font-size": 12, fill: P.ink }, 44);
  sk.line(canopyG, 450, 756, 474, 756, DET({ stroke: P.ink }));
  // back legs (thinner, behind)
  sk.line(canopyG, 540, 800, 540, 560, D({ width: 3, opacity: 0.7 }));
  sk.line(canopyG, 840, 800, 840, 560, D({ width: 3, opacity: 0.7 }));
  // folding table under the canopy (back), with jugs, radio, first-aid box, sign-in clipboard
  sk.poly(canopyG, [[570, 722], [810, 722], [816, 734], [566, 734]], D({ fill: P.mist, width: 3 }));
  [[584, 734], [800, 734]].forEach(([x, y]) => sk.line(canopyG, x, y, x + (x < 690 ? -6 : 6), 805, D({ width: 3 })));
  sk.rect(canopyG, 586, 688, 26, 34, D({ fill: P.fog, width: 2.5, wobble: 0.6 }));
  sk.rect(canopyG, 616, 694, 22, 28, D({ fill: P.fog, width: 2.5, wobble: 0.6 }));
  sk.rect(canopyG, 650, 700, 44, 22, D({ fill: P.steel, width: 2.5 }));
  sk.circle(canopyG, 662, 711, 6, DET({ fill: P.fog }));
  sk.line(canopyG, 684, 700, 690, 676, DET({}));
  const aid = el("g", {}, canopyG);
  sk.rect(aid, 710, 694, 44, 28, D({ fill: P.slate, width: 2.5 }));
  sk.rect(aid, 727, 698, 10, 20, { seed: sd(), fill: P.paper, stroke: P.paper, width: 1, double: false, wobble: 0.3 });
  sk.rect(aid, 722, 703, 20, 10, { seed: sd(), fill: P.paper, stroke: P.paper, width: 1, double: false, wobble: 0.3 });
  sk.poly(canopyG, [[770, 716], [800, 712], [802, 721], [772, 724]], DET({ fill: P.paper }));
  // paper sign taped to the table front
  sk.rect(canopyG, 650, 738, 74, 34, D({ fill: P.paper, width: 2.5, wobble: 0.6 }));
  txt(canopyG, 687, 761, "CHECK IN", { "font-family": HAND, "font-weight": 700, "font-size": 16, fill: P.ink }, 60);
  // scissor truss under the valance
  [[C.x0, C.x0 + 190], [C.x0 + 190, C.x1]].forEach(([a, b]) => {
    sk.line(canopyG, a, 586, b, 614, DET({ width: 3, opacity: 0.85 }));
    sk.line(canopyG, a, 614, b, 586, DET({ width: 3, opacity: 0.85 }));
  });
  // front legs (+ sandbag weights)
  [C.x0, C.x1].forEach((x) => {
    sk.line(canopyG, x, 570, x, C.base, D({ width: 7 }));
    sk.poly(canopyG, [[x - 22, C.base + 2], [x - 18, C.base - 16], [x + 18, C.base - 16], [x + 22, C.base + 2]], D({ fill: P.slate, width: 3, wobble: 1 }));
  });
  // a notice stapled to the right leg
  sk.rect(canopyG, C.x1 + 6, 640, 40, 52, D({ fill: P.paper, width: 2, wobble: 0.7 }));
  for (let i = 0; i < 5; i++) sk.line(canopyG, C.x1 + 12, 652 + i * 8, C.x1 + 38 - (i % 2) * 8, 652 + i * 8, DET({ width: 1.5, opacity: 0.7, double: false }));
  // roof
  sk.poly(canopyG, [[C.x0 - 34, C.eave], [C.cx, C.peak], [C.x1 + 34, C.eave]], D({ fill: P.steel, width: LINE.main }));
  [[C.x0 + 80, C.eave], [C.cx, C.eave], [C.x1 - 80, C.eave]].forEach(([x, y]) => sk.line(canopyG, C.cx, C.peak + 4, x, y, DET({ stroke: P.ink, opacity: 0.55, double: false })));
  sk.hatch(canopyG, C.cx, C.peak, 230, 96, { seed: sd(), gap: 10, angle: 120, stroke: P.storm, opacity: 0.28 });
  // valance with scallops + lettering
  const val = [[C.x0 - 34, C.eave], [C.x1 + 34, C.eave]];
  for (let i = 0; i <= 10; i++) { const x = C.x1 + 34 - (i * (C.x1 - C.x0 + 68)) / 10; val.push([x, 584 + (i % 2) * 8]); }
  sk.poly(canopyG, val, D({ fill: P.slate, width: 3, step: 60 }));
  txt(canopyG, C.cx, 576, "GULL HARBOR  CERT  RELIEF", { "font-family": GOTHIC, "font-size": 24, fill: P.paper }, 330);
  // lantern hanging from the peak (paper glow, no yellow)
  sk.line(canopyG, C.cx + 60, 592, C.cx + 60, 620, DET({}));
  el("circle", { cx: C.cx + 60, cy: 634, r: 34, fill: P.paper, opacity: 0.16 }, canopyG);
  sk.rect(canopyG, C.cx + 50, 620, 20, 26, D({ fill: P.fog, width: 2.5, wobble: 0.5 }));
  // guy lines to stakes
  sk.line(canopyG, C.x1 + 34, C.eave, C.x1 + 96, C.base - 6, DET({ opacity: 0.8 }));
  sk.line(canopyG, C.x1 + 90, C.base - 12, C.x1 + 100, C.base, DET({ width: 3 }));
  // camp chairs by the canopy
  const chairA = campChair(canopyG, 812, 840, 0.62, { fill: P.slate });
  const chairB = campChair(canopyG, 556, 846, 0.6, { fill: P.storm });
  sk.poly(canopyG, [[536, chairB.seatY - 6], [576, chairB.seatY - 8], [574, chairB.seatY + 2], [538, chairB.seatY + 4]], DET({ fill: P.mist })); // folded blanket

  // ------------------------------------------------------------------ ASSEMBLY AREA SIGN
  const signG = el("g", { class: "rd-hilltop-sign" }, root);
  const SX = 1015, SY = 520, SW = 200, SH = 180;
  [SX - 70, SX + 70].forEach((x) => sk.line(signG, x, SY + 20, x + H(x) * 2, 818, D({ width: 8 })));
  [SX - 70, SX + 70].forEach((x) => sk.line(signG, x - 2, 760, x + 2, 812, DET({ stroke: P.mist, opacity: 0.5, double: false })));
  sk.rect(signG, SX - SW / 2, SY, SW, SH, D({ fill: P.steel, width: LINE.main }));
  sk.rect(signG, SX - SW / 2 + 9, SY + 9, SW - 18, SH - 18, DET({ stroke: P.paper, width: 3, double: false }));
  // pictogram: a family group inside a ring
  const pic = el("g", {}, signG);
  sk.circle(pic, SX, SY + 50, 30, DET({ stroke: P.paper, width: 3, fill: P.storm }));
  [[SX - 14, 1], [SX, 1.2], [SX + 13, 0.8]].forEach(([x, k]) => {
    sk.circle(pic, x, SY + 42 - k * 3, 4 * k, { seed: sd(), fill: P.paper, stroke: P.paper, width: 1, double: false, wobble: 0.2 });
    sk.line(pic, x, SY + 48 - k * 2, x, SY + 64, { seed: sd(), stroke: P.paper, width: 5 * k, double: false, wobble: 0.2 });
  });
  txt(signG, SX, SY + 120, "ASSEMBLY", { "font-family": GOTHIC, "font-size": 44, fill: P.paper }, 150);
  txt(signG, SX, SY + 152, "AREA", { "font-family": GOTHIC, "font-size": 36, fill: P.paper }, 80);
  txt(signG, SX, SY + 168, "TSUNAMI SAFE ZONE · ELEV 210 FT", { "font-family": GOTHIC, "font-size": 12, fill: P.fog }, 160);
  sk.hatch(signG, SX + 40, SY + 4, 58, SH - 8, { seed: sd(), gap: 9, angle: 60, stroke: P.ink, opacity: 0.15 });
  // rain-streak weathering + bolt heads
  [[SX - 88, SY + 12], [SX + 86, SY + 12], [SX - 88, SY + 166], [SX + 86, SY + 166]].forEach(([x, y]) => sk.circle(signG, x, y, 3, DET({ fill: P.mist, width: 1, double: false })));

  // ------------------------------------------------------------------ PICNIC TABLE
  const tableG = el("g", { class: "rd-hilltop-table" }, root);
  const T = { x0: 1085, x1: 1345, top: 742, ground: 818 };
  // back bench
  sk.poly(tableG, [[T.x0 + 18, 752], [T.x1 + 6, 752], [T.x1 + 10, 760], [T.x0 + 14, 760]], D({ fill: P.slate, width: 3 }));
  // A-frame legs
  [T.x0 + 40, T.x1 - 40].forEach((x) => {
    sk.line(tableG, x - 26, T.ground, x + 10, T.top + 10, D({ width: 5 }));
    sk.line(tableG, x + 34, T.ground, x - 4, T.top + 10, D({ width: 5 }));
    sk.line(tableG, x - 36, 786, x + 44, 786, D({ width: 4 }));
  });
  // top (planks, grain)
  sk.poly(tableG, [[T.x0, T.top - 8], [T.x1 - 10, T.top - 8], [T.x1, T.top + 8], [T.x0 + 12, T.top + 8]], D({ fill: P.mist, width: LINE.main }));
  sk.line(tableG, T.x0 + 6, T.top, T.x1 - 4, T.top, DET({ opacity: 0.6, double: false }));
  for (let i = 0; i < 8; i++) sk.line(tableG, T.x0 + 20 + i * 30, T.top - 4 + (i % 2) * 8, T.x0 + 40 + i * 30, T.top - 4 + (i % 2) * 8, DET({ stroke: P.steel, opacity: 0.8, double: false }));
  sk.rect(tableG, T.x0 + 6, T.top + 8, T.x1 - T.x0 - 4, 9, D({ fill: P.steel, width: 3 }));
  // front bench
  sk.poly(tableG, [[T.x0 - 4, 780], [T.x1 + 18, 780], [T.x1 + 22, 792], [T.x0, 792]], D({ fill: P.mist, width: 3 }));
  for (let i = 0; i < 6; i++) sk.line(tableG, T.x0 + 20 + i * 44, 785, T.x0 + 44 + i * 44, 785, DET({ stroke: P.steel, opacity: 0.8, double: false }));
  // things on the table: a map, thermos, folded blankets, a hand radio
  sk.poly(tableG, [[1120, 730], [1188, 728], [1192, 744], [1116, 746]], DET({ fill: P.paper }));
  sk.path(tableG, [[1128, 738], [1150, 734], [1166, 740], [1182, 735]], DET({ stroke: P.steel, double: false }));
  sk.rect(tableG, 1216, 704, 16, 32, D({ fill: P.slate, width: 2.5, wobble: 0.5 }));
  sk.rect(tableG, 1250, 716, 60, 12, D({ fill: P.steel, width: 2.5 }));
  sk.rect(tableG, 1254, 704, 52, 12, D({ fill: P.fog, width: 2.5 }));

  // ------------------------------------------------------------------ CHAIR AT THE LIP (looking at the view)
  const lipG = el("g", { class: "rd-hilltop-lip" }, root);
  const chairC = campChair(lipG, 1440, 770, 0.5, { fill: P.slate });

  // ------------------------------------------------------------------ CROWD (optional townspeople)
  const crowdG = el("g", { class: "rd-hilltop-crowd" }, root);
  const members = [];
  if (showCrowd) {
    const add = (m, pose) => { m.pose = pose; members.push(m); return m; };
    // volunteer at the check-in table, clipboard in hand
    const vol = add(person(crowdG, 620, 832, 0.62, RD.mix("talk", { rsh: 50, rel: 70 }), { facing: 1, coat: P.steel, hood: true }), "talk");
    sk.rect(crowdG, vol.hand[0] - 6, vol.hand[1] - 20, 16, 22, DET({ fill: P.paper, width: 1.5 }));
    // neighbor resting in the camp chair, arms folded
    add(person(crowdG, 812, 840 - 50 * 0.62, 0.6, RD.mix("sit", { lsh: 40, lel: 110, rsh: 50, rel: 100 }), { facing: -1, coat: P.slate }), "sit");
    // someone filling a jug at the tank
    const filler = add(person(crowdG, 352, 822, 0.58, RD.mix("reach", { rsh: 70, rel: 30 }), { facing: -1, coat: P.slate, hood: true }), "reach");
    // two at the rope: adult pointing at the flood, a kid holding on
    add(person(crowdG, 1560, 764, 0.5, RD.mix("point", { rsh: 70 }), { facing: 1, coat: P.slate, opacity: 0.9 }), "point");
    add(person(crowdG, 1530, 766, 0.34, RD.mix("idle", { rsh: 40, rel: 0 }), { facing: 1, opacity: 0.9 }), "idle");
    // watcher wrapped in a blanket in the lip chair
    const w = add(person(crowdG, 1440, 770 - 50 * 0.5, 0.48, RD.mix("sit", { lsh: 30, lel: 90, rsh: 30, rel: 90 }), { facing: 1, opacity: 0.9 }), "sit");
    sk.poly(crowdG, [[w.head[0] - 16, w.head[1] + 8], [w.head[0] + 16, w.head[1] + 8], [w.hip[0] + 28, w.hip[1] + 6], [w.hip[0] - 22, w.hip[1] + 10]], D({ fill: P.mist, stroke: P.slate, width: 3, step: 400, wobble: 1 }));
    // a pair talking by the far trees (smallest, furthest)
    add(person(crowdG, 1150, 712, 0.36, "think", { facing: 1, coat: P.steel, opacity: 0.8 }), "think");
    add(person(crowdG, 1186, 714, 0.36, "shrug", { facing: -1, opacity: 0.8 }), "shrug");
  }

  // ------------------------------------------------------------------ FOREGROUND FRAMING
  const fgG = el("g", { class: "rd-hilltop-fg" }, root);
  // big dark fir at far left
  fir(fgG, 40, 960, 980, 300, { fill: P.storm, stroke: P.ink, width: LINE.main, tiers: 13 });
  sk.hatch(fgG, -20, 200, 120, 760, { seed: sd(), gap: 12, angle: 60, stroke: P.ink, opacity: 0.3 });
  // dead snag at the right edge
  sk.poly(fgG, [[1888, 960], [1896, 300], [1904, 240], [1912, 300], [1924, 960]], D({ fill: P.storm, width: LINE.main }));
  [[1898, 420, 1840, 380], [1904, 520, 1950, 470], [1898, 620, 1846, 600], [1902, 360, 1940, 330]].forEach(([a, b, c, d]) => sk.line(fgG, a, b, c, d, D({ width: 4 })));
  // foreground grass + a couple of stones (kept quiet near the caption bar)
  for (let i = 0; i < 24; i++) {
    const x = 120 + i * 78 + rnd(i + 1200) * 30, y = 915 + rnd(i + 1300) * 20, h = 16 + rnd(i) * 14;
    sk.path(fgG, [[x - h * 0.4, y - h], [x, y], [x + h * 0.2, y - h * 1.2], [x + 4, y], [x + h * 0.6, y - h * 0.7]], DET({ stroke: P.storm, opacity: 0.7, double: false, wobble: 0.6, step: 400 }));
  }
  sk.poly(fgG, [[200, 960], [214, 936], [250, 932], [268, 962]], D({ fill: P.steel, width: 3 }));
  sk.poly(fgG, [[1680, 958], [1694, 940], [1722, 938], [1734, 960]], D({ fill: P.steel, width: 3 }));

  return {
    g: root,
    groundY: GROUND,
    canopy: { g: canopyG, x: C.cx, y: C.base, x0: C.x0, x1: C.x1, eaveY: C.eave, peakY: C.peak },
    table: { g: tableG, x: (T.x0 + T.x1) / 2, y: T.top, x0: T.x0, x1: T.x1, seatY: 786, groundY: T.ground },
    sign: { g: signG, x: SX, y: SY, w: SW, h: SH },
    tank: { g: tankG, x: TX, y: 600 },
    crowd: { g: crowdG, members },
    view: { g: viewG, waterG, levelY: L0, horizonY: HORIZON, setLevel, get level() { return curLevel; } },
    sky: { g: skyG },
    far: { g: farG },
  };
};
