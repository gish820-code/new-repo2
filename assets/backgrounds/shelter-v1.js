/* Rainy Day background — `shelter` v1. Episode 2, DAY 1: Drizzle and Mags' makeshift shelter at the edge of the
 * hilltop camp. A close, intimate set seen from a little above eye level: a blue-gray tarp strung between two parked
 * cars seen from behind (a small HATCHBACK at left, an old PICKUP at right), its front edge sagging in the middle
 * where the rain pools and drips into a bucket. Under it: two sleeping bags on a pad, the go-bag's spot and a crate
 * used as a table. OUTSIDE the tarp, front right in the open: a stone fire ring with a pot on a grate, and a small
 * two-burner camp stove on a flat rock. Far left: a small dome tent with its door flap half unzipped (the carbon-
 * monoxide beat: the stove stays OUT here). Behind at right: the back of a small hilltop cabin with an open utility-
 * shed door revealing a WATER HEATER (tall tank, drain valve near the bottom). Firs, fog, mud and puddles.
 * Flat, cold, gray dawn; everything wet.
 *
 * Paste VERBATIM after assets/characters/rainy-day-rig-v3.js (v1/v2 work too — uses only palette, LINE, el, sk,
 * hash). Deterministic, static; scenes own all motion (drips, flames, smoke).
 *
 *   const bg = window.RainyDayBG.shelter(layerG, {});
 *
 * OPTS (all optional):
 *   fog: 0.6         opacity of the fog layer (fogG), 0..1
 *
 * HANDLES returned (screen px in the 1920x1080 viewBox):
 *   g                 root <g>
 *   groundY = 860     ground where character feet stand (figure y = 860 - 116*scale, e.g. 697.6 at 1.4). The open
 *                     strip y 845–900 is clear of props from x 300 to 1360 (in front of / under the tarp).
 *   tarp:      { g, x0: 575, x1: 1305, sagX: 930, sagY: 548, frontY: 454, backY: 393 }
 *                     x0/x1 = the two front tie poles (front corners at y ≈ 454; back ridge on tall poles at y ≈ 393,
 *                     x 722–1204 — a lean-to seen from below). sagX/sagY = the low point of
 *                     the sagging front edge (a water pocket bulges just behind it).
 *   rainCatch: { bucketX: 930, bucketY: 790, dripX: 930, dripTopY: 556, bucketBaseY: 836, bucketR: 30, g }
 *                     the drip falls from (dripX, dripTopY) to the bucket rim (bucketX, bucketY). bucketR = rim
 *                     half-width; g = the bucket group (scenes may add a water level inside: rim ellipse is
 *                     cx 930, cy 790, rx 30, ry 7).
 *   firePit:   { g, x: 1690, y: 900 }   center of the fuel bed inside the stone ring (flames/smoke start here).
 *                     The pot sits on the grate above: pot { x: 1696, y: 832 } (its rim center).
 *   stove:     { g, x: 1450, y: 878 }   two-burner camp stove on a flat rock (in front of the pickup); x,y = between the burners (burner top).
 *   tent:      { g, x: 150, y: 892, doorX: 156, doorY: 832, w: 270, h: 178 }
 *                     dome tent at far left. x = center, y = ground line, w/h = its size; doorX/doorY = center of the
 *                     door opening (flap half unzipped, hanging open on its left side).
 *   cars:      [ { g, x: 440, y: 842, kind: "hatchback", w: 300 }, { g, x: 1460, y: 842, kind: "pickup", w: 340 } ]
 *                     x = center of the rear face, y = rear tire ground line.
 *   waterHeater: { g, x: 1745, y: 616, valveX: 1764, valveY: 750, baseY: 772, shed: { g, doorX: 1748, doorY: 690 } }
 *                     x = tank center, y = tank top. valveX/valveY = the drain valve spout near the bottom.
 *   bagSpot:   { x: 1010, y: 842 }   ground spot under the tarp where the go-bag sits (RD.goBag at x, y - 6).
 *   crateTop:  { x: 1124, y: 770, x0: 1068, x1: 1180 }  top of the crate table (props stand at y = 770).
 *   bags:      { g }  the sleeping bags + pad
 *   cabin:     { g }, fogG (fog layer, opacity = opts.fog), sky: { g }
 */
window.RainyDayBG = window.RainyDayBG || {};
if (!window.RainyDayBG.shelter) window.RainyDayBG.shelter = function (parent, opts) {
  opts = opts || {};
  const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
  const FOG = Math.max(0, Math.min(1, opts.fog !== undefined ? +opts.fog : 0.6));
  const GROUND = 860, VPX = 960, VPY = 430;
  let SEED = 9300;
  const sd = () => (SEED += 7);
  const rnd = (i) => (H(i * 1.917 + 47.3) + 1) / 2;
  const D = (o) => Object.assign({ seed: sd() }, o);
  const DET = (o) => Object.assign({ seed: sd(), width: LINE.detail }, o);
  const pv = (x, y, s) => [VPX + (x - VPX) * s, VPY + (y - VPY) * s]; // push a front-plane point back in depth
  const txt = (g, x, y, s, a, fit) => {
    const t = el("text", Object.assign({ x, y, "text-anchor": "middle" }, fit ? { textLength: fit, lengthAdjust: "spacingAndGlyphs" } : {}, a), g);
    t.textContent = s;
    return t;
  };
  const GOTHIC = '"League Gothic", "Oswald", "Arial Narrow", sans-serif';
  const HAND = '"Kalam", "Comic Sans MS", cursive';
  const uid = "rdSh" + Math.round(Math.abs(H(SEED + (window.__rdShN = (window.__rdShN || 0) + 1))) * 1e6) + "_";

  const root = el("g", { class: "rd-bg rd-bg-shelter" }, parent);
  const defs = el("defs", {}, root);
  function lgrad(name, stops, x2, y2) {
    const lg = el("linearGradient", { id: uid + name, x1: 0, y1: 0, x2: x2 || 0, y2: y2 === undefined ? 1 : y2 }, defs);
    stops.forEach(([o, c, a]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": a === undefined ? 1 : a }, lg));
    return `url(#${uid}${name})`;
  }
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
  function stratus(g, x, y, w, h, fill, o) {
    o = o || {};
    const n = Math.max(6, Math.round(w / 90));
    const pts = [[x, y + h]];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x + w * t, y + h - Math.sin(t * Math.PI) * h * (0.5 + 0.5 * rnd(x + i * 3.7))]); }
    pts.push([x + w, y + h]);
    for (let i = n; i >= 0; i--) pts.push([x + (w * i) / n, y + h + 4 * H(x + i)]);
    return sk.poly(g, pts, { seed: sd(), fill, stroke: o.stroke || P.steel, width: LINE.detail, opacity: o.opacity !== undefined ? o.opacity : 1, step: 50, wobble: 2 });
  }
  function puddle(g, x, y, rx, ry) {
    el("ellipse", { cx: x, cy: y, rx, ry, fill: P.fog, opacity: 0.45 }, g);
    sk.path(g, [[x - rx, y], [x - rx * 0.6, y - ry], [x + rx * 0.5, y - ry * 0.9], [x + rx, y], [x + rx * 0.4, y + ry], [x - rx * 0.6, y + ry * 0.9], [x - rx, y]], DET({ stroke: P.slate, opacity: 0.7, double: false }));
    sk.line(g, x - rx * 0.45, y - 1, x + rx * 0.15, y - 1, DET({ stroke: P.paper, opacity: 0.6, double: false }));
  }

  // ------------------------------------------------------------------ SKY
  const skyG = el("g", { class: "rd-shelter-sky" }, root);
  el("rect", { x: -20, y: -20, width: 1960, height: 640, fill: lgrad("sky", [[0, P.steel], [0.4, P.mist], [0.7, P.fog], [0.8, P.paper], [1, P.fog]]) }, skyG);
  stratus(skyG, 300, 300, 1000, 60, P.fog, { opacity: 0.7, stroke: P.mist });
  stratus(skyG, 1100, 250, 900, 70, P.mist, { opacity: 0.7 });
  stratus(skyG, -60, 180, 1100, 90, P.mist, { opacity: 0.75 });
  stratus(skyG, 700, 90, 1300, 110, P.steel, { opacity: 0.8, stroke: P.slate });
  stratus(skyG, -80, 0, 1200, 110, P.steel, { opacity: 0.85, stroke: P.slate });
  stratus(skyG, -80, -70, 2100, 100, P.slate, { opacity: 0.8, stroke: P.slate });
  for (let i = 0; i < 24; i++) {
    const cx = rnd(i) * 1880, cy = 40 + rnd(i + 40) * 300, w = 80 + rnd(i + 80) * 200;
    sk.line(skyG, cx, cy, cx + w, cy + 3 * H(i), DET({ stroke: cy > 200 ? P.paper : P.slate, opacity: 0.35, double: false, wobble: 1 }));
  }

  // ------------------------------------------------------------------ FAR: foggy ridge + fir lines
  const farG = el("g", { class: "rd-shelter-far" }, root);
  sk.poly(farG, [[-20, 470], [160, 430], [380, 418], [600, 440], [820, 424], [1040, 436], [1300, 414], [1560, 430], [1780, 420], [1940, 436], [1940, 640], [-20, 640]], D({ fill: P.fog, stroke: P.mist, width: LINE.detail }));
  for (let i = 0; i < 44; i++) {
    const x = -10 + i * 45 + rnd(i) * 16, base = 470 + rnd(i + 3) * 20;
    fir(farG, x, base, 50 + rnd(i + 9) * 40, 22 + rnd(i) * 8, { fill: P.mist, stroke: P.mist, width: 2, opacity: 0.7, boughs: false, tiers: 4, wobble: 0.6 });
  }
  for (let i = 0; i < 26; i++) {
    const x = -20 + i * 78 + rnd(i + 20) * 30, base = 560 + rnd(i + 23) * 20;
    fir(farG, x, base, 110 + rnd(i + 29) * 70, 46 + rnd(i) * 14, { fill: P.mist, stroke: P.steel, width: 2, opacity: 0.85, boughs: false, tiers: 5, wobble: 0.8 });
  }

  // ------------------------------------------------------------------ GROUND (mud + wet grass, receding to the camp edge)
  const groundG = el("g", { class: "rd-shelter-ground" }, root);
  sk.poly(groundG, [[-20, 560], [400, 552], [900, 556], [1400, 548], [1940, 556], [1940, 1100], [-20, 1100]], D({ fill: P.steel, width: 3, step: 60 }));
  el("rect", { x: -20, y: 556, width: 1960, height: 160, fill: lgrad("gfade", [[0, P.mist, 0.8], [1, P.mist, 0]]) }, groundG);
  // trodden mud between the cars and out to the fire
  sk.poly(groundG, [[560, 860], [640, 720], [760, 640], [1060, 636], [1180, 700], [1320, 860], [1640, 900], [1700, 960], [380, 960], [420, 900]], D({ fill: P.slate, stroke: P.slate, width: 2, opacity: 0.55, double: false, step: 50 }));
  sk.hatch(groundG, 380, 720, 1300, 240, { seed: sd(), gap: 20, angle: 12, stroke: P.storm, opacity: 0.18 });
  // ruts the cars made pulling in
  [[352, 528], [1340, 1580]].forEach(([a, b], k) => [a, b].forEach((x) => {
    const p0 = pv(x, 860, 1), p1 = pv(x, 860, 0.35);
    sk.line(groundG, p0[0], p0[1] + 10, p1[0], p1[1], DET({ stroke: P.slate, width: 5, opacity: 0.4, double: false }));
  }));
  for (let i = 0; i < 60; i++) {
    const x = rnd(i + 500) * 1920, y = 600 + Math.pow(rnd(i + 600), 0.9) * 300, h = 6 + (y - 580) * 0.05;
    if (x > 560 && x < 1320 && y > 640) continue;
    sk.path(groundG, [[x - h * 0.5, y - h], [x, y], [x + h * 0.15, y - h * 1.2], [x + 2, y], [x + h * 0.7, y - h * 0.8]], DET({ stroke: P.slate, opacity: 0.5, double: false, wobble: 0.5, step: 400 }));
  }
  [[700, 655, 40, 4], [1030, 668, 56, 5], [1250, 900, 70, 8], [470, 905, 50, 6], [1880, 900, 60, 7], [1200, 640, 30, 3]].forEach(([x, y, rx, ry]) => puddle(groundG, x, y, rx, ry));
  // boot prints in the mud
  for (let i = 0; i < 8; i++) { const x = 1020 + i * 52, y = 880 + (i % 2) * 14; sk.path(groundG, [[x, y], [x + 10, y - 5], [x + 22, y - 2]], DET({ stroke: P.storm, opacity: 0.5, double: false })); }

  // foreground band (darker, low detail; the caption bar sits at y >= 940)
  sk.poly(groundG, [[-20, 912], [300, 904], [800, 912], [1300, 906], [1940, 914], [1940, 1100], [-20, 1100]], D({ fill: P.slate, stroke: P.slate, width: 2, double: false, step: 60 }));
  sk.hatch(groundG, 0, 906, 1920, 40, { seed: sd(), gap: 22, angle: 75, stroke: P.storm, opacity: 0.35 });
  for (let i = 0; i < 22; i++) {
    const x = 60 + i * 86 + rnd(i + 1200) * 30, y = 922 + rnd(i + 1300) * 16, h = 14 + rnd(i) * 12;
    sk.path(groundG, [[x - h * 0.4, y - h], [x, y], [x + h * 0.2, y - h * 1.2], [x + 4, y], [x + h * 0.6, y - h * 0.7]], DET({ stroke: P.storm, opacity: 0.65, double: false, wobble: 0.6, step: 400 }));
  }

  // ------------------------------------------------------------------ BACK: distant camp through the gap (quiet)
  const backG = el("g", { class: "rd-shelter-back" }, root);
  // a far dome tent and a tarp, small, in the fog
  const ft = [];
  for (let i = 0; i <= 10; i++) { const a = Math.PI * (1 - i / 10); ft.push([890 + Math.cos(a) * 44, 610 - Math.sin(a) * 34]); }
  sk.poly(backG, ft, D({ fill: P.mist, stroke: P.steel, width: 2, step: 30 }));
  sk.poly(backG, [[1010, 612], [1040, 574], [1110, 572], [1120, 610]], D({ fill: P.mist, stroke: P.steel, width: 2 }));
  sk.line(backG, 1040, 574, 1040, 612, DET({ stroke: P.steel, double: false }));
  // woodpile
  for (let i = 0; i < 6; i++) sk.circle(backG, 780 + (i % 3) * 14 + (i > 2 ? 7 : 0), 618 - (i > 2 ? 12 : 0), 7, DET({ fill: P.fog, stroke: P.steel, double: false }));

  // ------------------------------------------------------------------ FOG
  const fogG = el("g", { class: "rd-shelter-fog", opacity: FOG }, root);
  const fb = lgrad("fogband", [[0, P.paper, 0], [0.5, P.paper, 0.8], [1, P.paper, 0]]);
  el("rect", { x: -20, y: 470, width: 1960, height: 110, fill: fb }, fogG);
  el("rect", { x: -20, y: 540, width: 1960, height: 120, fill: fb, opacity: 0.8 }, fogG);
  el("rect", { x: -20, y: 380, width: 1960, height: 90, fill: fb, opacity: 0.6 }, fogG);
  [[40, 530, 400], [700, 560, 360], [1200, 520, 420], [380, 600, 300], [980, 612, 260]].forEach(([x, y, w]) => {
    sk.path(fogG, [[x, y], [x + w * 0.3, y - 6], [x + w * 0.6, y + 3], [x + w, y - 4]], DET({ stroke: P.paper, width: 3, opacity: 0.6, double: false, step: 30 }));
    sk.path(fogG, [[x + w * 0.2, y + 12], [x + w * 0.55, y + 8], [x + w * 0.9, y + 13]], DET({ stroke: P.paper, width: 2, opacity: 0.4, double: false, step: 30 }));
  });

  // ------------------------------------------------------------------ CABIN BACK + UTILITY SHED with the WATER HEATER (right)
  const cabinG = el("g", { class: "rd-shelter-cabin" }, root);
  // big roof (seen from the back, rising away) + back wall with board-and-batten siding
  sk.poly(cabinG, [[1610, 452], [1740, 372], [1960, 372], [1960, 452]], D({ fill: P.slate, width: LINE.main }));
  for (let i = 0; i < 8; i++) sk.line(cabinG, 1640 + i * 40, 452, 1740 + i * 30, 374, DET({ stroke: P.storm, opacity: 0.5, double: false }));
  for (let i = 0; i < 5; i++) sk.line(cabinG, 1660 - i * 0 + i * 18, 438 - i * 14, 1960, 438 - i * 14, DET({ stroke: P.storm, opacity: 0.35, double: false }));
  sk.rect(cabinG, 1600, 448, 360, 14, D({ fill: P.storm, width: 3 })); // fascia + gutter
  sk.line(cabinG, 1930, 462, 1934, 700, D({ width: 4 })); // downspout
  sk.poly(cabinG, [[1924, 700], [1946, 700], [1958, 716], [1932, 716]], DET({ fill: P.steel }));
  sk.rect(cabinG, 1620, 462, 340, 312, D({ fill: P.mist, width: LINE.main }));
  for (let i = 0; i < 12; i++) sk.line(cabinG, 1640 + i * 28, 466, 1640 + i * 28, 770, DET({ stroke: P.steel, opacity: 0.55, double: false, width: 1.5 }));
  sk.hatch(cabinG, 1620, 462, 340, 40, { seed: sd(), gap: 9, angle: 30, stroke: P.slate, opacity: 0.35 }); // eave shadow
  // small back window (curtain), up right
  sk.rect(cabinG, 1860, 520, 64, 70, D({ fill: P.slate, width: 3 }));
  sk.line(cabinG, 1892, 522, 1892, 588, DET({}));
  sk.poly(cabinG, [[1864, 524], [1886, 524], [1878, 586], [1864, 586]], DET({ fill: P.fog, opacity: 0.7, double: false }));
  sk.rect(cabinG, 1854, 590, 76, 8, DET({ fill: P.steel }));
  // the lean-to utility shed against the back wall
  const SH = { x0: 1660, x1: 1840, top: 540, base: 776 };
  sk.poly(cabinG, [[SH.x0 - 14, SH.top + 26], [SH.x1 + 12, SH.top - 10], [SH.x1 + 12, SH.top + 2], [SH.x0 - 14, SH.top + 38]], D({ fill: P.slate, width: 3 })); // shed roof (corrugated)
  for (let i = 0; i < 9; i++) sk.line(cabinG, SH.x0 - 6 + i * 22, SH.top + 30 - i * 4.4, SH.x0 - 2 + i * 22, SH.top + 36 - i * 4.4, DET({ stroke: P.storm, opacity: 0.7, double: false }));
  sk.poly(cabinG, [[SH.x0, SH.top + 36], [SH.x1, SH.top + 2], [SH.x1, SH.base], [SH.x0, SH.base]], D({ fill: P.steel, width: LINE.main }));
  for (let i = 1; i < 7; i++) sk.line(cabinG, SH.x0 + i * 26, SH.top + 36 - i * 4.9, SH.x0 + i * 26, SH.base - 2, DET({ stroke: P.slate, opacity: 0.5, double: false, width: 1.5 }));
  // door opening (dark interior) + the door leaf swung open toward us
  const DX0 = 1696, DX1 = 1800, DY0 = 584;
  sk.poly(cabinG, [[DX0, DY0 + 4], [DX1, DY0 - 6], [DX1, SH.base], [DX0, SH.base]], D({ fill: P.night, width: 3 }));
  el("rect", { x: DX0 + 4, y: DY0, width: DX1 - DX0 - 8, height: SH.base - DY0, fill: lgrad("shedin", [[0, P.storm, 0.9], [1, P.night, 0]], 1, 0) }, cabinG);
  // inside: shelf with cans, a coiled hose, a shovel, pipes on the back wall
  sk.line(cabinG, DX0 + 2, 616, DX0 + 22, 614, DET({ stroke: P.steel }));
  sk.rect(cabinG, DX0 + 4, 600, 10, 14, DET({ fill: P.slate, stroke: P.steel, double: false }));
  sk.circle(cabinG, DX0 + 14, 712, 11, DET({ stroke: P.steel, double: false }));
  sk.circle(cabinG, DX0 + 14, 712, 6, DET({ stroke: P.steel, double: false }));
  sk.line(cabinG, DX1 - 6, 600, DX1 - 14, 770, DET({ stroke: P.steel, width: 3 }));
  // THE WATER HEATER: tall cylinder, pipes + shutoff valve on top, T&P valve and pipe on the side, label,
  // gas-control box, and the DRAIN VALVE (spout) near the bottom
  const WH = { x: 1745, top: 616, base: 772, r: 30 };
  const whG = el("g", { class: "rd-shelter-water-heater" }, cabinG);
  sk.line(whG, WH.x - 12, DY0 + 2, WH.x - 12, WH.top - 4, DET({ width: 4 }));
  sk.line(whG, WH.x + 12, DY0 + 2, WH.x + 12, WH.top - 4, DET({ width: 4 }));
  sk.rect(whG, WH.x - 18, WH.top - 18, 12, 6, DET({ fill: P.steel, width: 1.5 })); // shutoff handle
  sk.line(whG, WH.x, WH.top - 10, WH.x, DY0 - 2, DET({ width: 5, stroke: P.slate }));  // flue
  sk.poly(whG, [[WH.x - WH.r, WH.top + 6], [WH.x - WH.r + 2, WH.base - 6], [WH.x + WH.r - 2, WH.base - 6], [WH.x + WH.r, WH.top + 6]], D({ fill: P.fog, width: 3.5 }));
  el("ellipse", { cx: WH.x, cy: WH.top + 6, rx: WH.r, ry: 7, fill: P.paper, stroke: P.ink, "stroke-width": 2.5 }, whG);
  el("ellipse", { cx: WH.x, cy: WH.base - 6, rx: WH.r - 2, ry: 5, fill: "none", stroke: P.ink, "stroke-width": 2 }, whG);
  sk.hatch(whG, WH.x + 10, WH.top + 10, WH.r - 10, WH.base - WH.top - 20, { seed: sd(), gap: 7, angle: 70, stroke: P.steel, opacity: 0.6 });
  sk.line(whG, WH.x - WH.r + 6, WH.top + 18, WH.x - WH.r + 6, WH.base - 16, DET({ stroke: P.paper, opacity: 0.8, double: false })); // sheen
  sk.rect(whG, WH.x - 14, WH.top + 30, 26, 32, DET({ fill: P.paper, width: 1.5 })); // label
  for (let k = 0; k < 4; k++) sk.line(whG, WH.x - 10, WH.top + 38 + k * 6, WH.x + 8 - (k % 2) * 6, WH.top + 38 + k * 6, DET({ width: 1, opacity: 0.6, double: false }));
  sk.line(whG, WH.x + WH.r - 2, WH.top + 26, WH.x + WH.r + 10, WH.top + 26, DET({ width: 3 })); // T&P valve
  sk.line(whG, WH.x + WH.r + 8, WH.top + 26, WH.x + WH.r + 8, WH.base - 20, DET({ width: 3 })); // discharge pipe
  sk.rect(whG, WH.x - 12, WH.base - 52, 22, 16, DET({ fill: P.slate, width: 1.5 })); // gas control
  sk.circle(whG, WH.x - 1, WH.base - 44, 4, DET({ fill: P.steel, width: 1, double: false }));
  // drain valve: short spout pointing out + down near the base, with its handle
  const VX = WH.x + 19, VY = WH.base - 22;
  sk.path(whG, [[WH.x + 6, VY - 2], [VX, VY - 2], [VX + 4, VY + 4]], DET({ width: 4 }));
  sk.circle(whG, WH.x + 10, VY - 4, 4.5, DET({ fill: P.steel, width: 1.5 }));
  sk.line(whG, WH.x + 4, VY - 10, WH.x + 16, VY + 2, DET({ width: 2.5 }));
  // the open door leaf (hinged on the left, swung toward us), with a hand-lettered sign
  sk.poly(cabinG, [[DX0, DY0 + 4], [DX0 - 52, DY0 + 18], [DX0 - 52, SH.base + 16], [DX0, SH.base]], D({ fill: P.steel, width: 3.5 }));
  sk.line(cabinG, DX0 - 46, DY0 + 26, DX0 - 6, DY0 + 14, DET({ stroke: P.slate, double: false }));
  sk.line(cabinG, DX0 - 46, SH.base + 6, DX0 - 6, SH.base - 6, DET({ stroke: P.slate, double: false }));
  sk.line(cabinG, DX0 - 46, DY0 + 26, DX0 - 6, SH.base - 6, DET({ stroke: P.slate, double: false })); // Z brace
  sk.circle(cabinG, DX0 - 42, 690, 3.5, DET({ fill: P.slate, double: false }));
  // step stone + puddle at the shed door
  sk.poly(cabinG, [[DX0 - 6, 788], [DX0 + 4, 776], [DX1 + 2, 776], [DX1 + 12, 788]], D({ fill: P.mist, width: 2.5 }));
  puddle(cabinG, 1700, 806, 46, 6);

  // ------------------------------------------------------------------ BIG FIRS framing left + behind the cars
  const treesG = el("g", { class: "rd-shelter-trees" }, root);
  fir(treesG, 190, 700, 640, 230, { fill: P.slate, stroke: P.storm, width: 3, opacity: 0.95 });
  fir(treesG, 1500, 610, 420, 150, { fill: P.slate, stroke: P.storm, width: 3, opacity: 0.85 });
  fir(treesG, 690, 620, 330, 120, { fill: P.steel, stroke: P.slate, width: 2.5, opacity: 0.8, boughs: false });

  // ------------------------------------------------------------------ CARS (seen from behind)
  const carsG = el("g", { class: "rd-shelter-cars" }, root);
  // ---- HATCHBACK (left). Rear face x 290–590, roof 596, tires on 842.
  const hatchG = el("g", { class: "rd-shelter-hatchback" }, carsG);
  {
    const g = hatchG, s1 = 0.66;
    el("ellipse", { cx: 520, cy: 846, rx: 250, ry: 14, fill: P.storm, opacity: 0.45 }, g);
    // inner (right) side, receding toward the VP
    const rtTop = [584, 610], rtBot = [584, 812];
    const fTop = pv(rtTop[0], rtTop[1] - 10, s1), fBot = pv(rtBot[0], rtBot[1], s1);
    sk.poly(g, [rtTop, fTop, [fTop[0] + 8, fTop[1] + 40], fBot, rtBot], D({ fill: P.mist, width: 3.5, step: 40 }));
    const sw1 = pv(586, 616, 0.96), sw2 = pv(586, 616, 0.7), sw3 = pv(586, 690, 0.7), sw4 = pv(586, 692, 0.96);
    sk.poly(g, [sw1, sw2, sw3, sw4], D({ fill: P.slate, width: 2.5, step: 400, wobble: 0.6 }));
    const pl = pv(586, 616, 0.83), pl2 = pv(586, 692, 0.83);
    sk.line(g, pl[0], pl[1], pl2[0], pl2[1], DET({ width: 3 }));
    sk.line(g, (sw1[0] + sw2[0]) / 2 - 10, sw1[1] + 6, (sw1[0] + sw2[0]) / 2 + 12, sw1[1], DET({ stroke: P.fog, opacity: 0.6, double: false }));
    const mr = pv(586, 690, 0.68);
    sk.poly(g, [mr, [mr[0] + 14, mr[1] - 4], [mr[0] + 14, mr[1] + 10], [mr[0], mr[1] + 10]], DET({ fill: P.steel })); // mirror
    const dl1 = pv(586, 740, 0.94), dl2 = pv(586, 740, 0.7);
    sk.line(g, dl1[0], dl1[1], dl2[0], dl2[1], DET({ stroke: P.steel, opacity: 0.8, double: false })); // body line
    [[0.9, 34, 14], [0.71, 26, 10]].forEach(([s, ry, rx]) => {
      const c = pv(586, 812, s);
      el("ellipse", { cx: c[0], cy: c[1] - ry * 0.55, rx, ry, fill: P.night, stroke: P.ink, "stroke-width": 3 }, g);
      el("ellipse", { cx: c[0] + 2, cy: c[1] - ry * 0.55, rx: rx * 0.45, ry: ry * 0.45, fill: P.steel, stroke: P.ink, "stroke-width": 1.5 }, g);
    });
    // roof slab (seen from above, wet) + rack rails
    const rl = pv(330, 596, s1), rr = pv(552, 596, s1);
    sk.poly(g, [[330, 598], [552, 598], rr, rl], D({ fill: P.fog, width: 3 }));
    [[360, 594], [524, 594]].forEach(([x, y]) => { const f = pv(x, y, s1 + 0.04); sk.line(g, x, y - 6, f[0], f[1] - 6, DET({ width: 3.5 })); });
    sk.line(g, 380, 592, rr[0] - 30, rr[1] + 2, DET({ stroke: P.paper, opacity: 0.6, double: false }));
    // rear face
    sk.poly(g, [[298, 806], [294, 704], [306, 640], [326, 600], [556, 600], [574, 640], [586, 704], [582, 806]], D({ fill: P.mist, width: LINE.main }));
    sk.poly(g, [[322, 616], [558, 616], [572, 694], [308, 694]], D({ fill: P.slate, width: 3, step: 400 }));                           // rear glass (fogged)
    sk.hatch(g, 312, 618, 256, 74, { seed: sd(), gap: 12, angle: 30, stroke: P.fog, opacity: 0.25 });
    sk.path(g, [[440, 690], [392, 646], [350, 640]], DET({ stroke: P.fog, width: 2.5, opacity: 0.8, double: false }));                 // wiper arc
    for (let i = 0; i < 9; i++) el("circle", { cx: 330 + rnd(i + 30) * 220, cy: 626 + rnd(i + 40) * 60, r: 2, fill: P.paper, opacity: 0.7 }, g);
    sk.rect(g, 300, 708, 22, 44, D({ fill: P.storm, width: 2.5 }));
    sk.rect(g, 558, 708, 22, 44, D({ fill: P.storm, width: 2.5 }));
    sk.line(g, 306, 716, 316, 716, DET({ stroke: P.fog, double: false, opacity: 0.7 }));
    sk.line(g, 564, 716, 574, 716, DET({ stroke: P.fog, double: false, opacity: 0.7 }));
    sk.rect(g, 404, 724, 72, 34, D({ fill: P.paper, width: 2.5 }));                                                                      // plate
    txt(g, 440, 748, "GHB 2041", { "font-family": GOTHIC, "font-size": 18, fill: P.slate }, 58);
    sk.rect(g, 330, 712, 56, 18, DET({ fill: P.fog, width: 1.5 }));                                                                      // bumper sticker
    txt(g, 358, 725, "GO-BAG? ✓", { "font-family": HAND, "font-weight": 700, "font-size": 10, fill: P.ink }, 48);
    sk.line(g, 420, 706, 460, 706, DET({ width: 3 }));                                                                                   // hatch handle
    sk.rect(g, 286, 796, 308, 30, D({ fill: P.slate, width: 3 }));                                                                       // bumper
    [[296, 822], [530, 822]].forEach(([x, y]) => sk.rect(g, x, y, 54, 22, D({ fill: P.night, width: 3 })));                               // tires
    // drips off the bumper + roof edge
    for (let i = 0; i < 5; i++) el("ellipse", { cx: 310 + i * 66, cy: 834 + (i % 2) * 4, rx: 1.5, ry: 3, fill: P.fog, opacity: 0.8 }, g);
  }
  // ---- PICKUP (right). Tailgate x 1300–1620, rails 685, tires 842.
  const pickG = el("g", { class: "rd-shelter-pickup" }, carsG);
  {
    const g = pickG;
    el("ellipse", { cx: 1420, cy: 846, rx: 250, ry: 14, fill: P.storm, opacity: 0.45 }, g);
    // inner (left) side: bed side, cab side, hood
    const bt0 = [1300, 686], bb0 = [1300, 830], bt1 = pv(1300, 686, 0.8), bb1 = pv(1300, 830, 0.8);
    const ct = pv(1300, 556, 0.8), ct2 = pv(1300, 556, 0.66), cb2 = pv(1300, 830, 0.66);
    const ht = pv(1300, 660, 0.66), ht2 = pv(1300, 676, 0.54), hb2 = pv(1300, 820, 0.54);
    sk.poly(g, [ht, ht2, hb2, cb2], D({ fill: P.steel, width: 3 }));                                    // hood side (far)
    sk.poly(g, [ct, ct2, [ct2[0] - 4, ht[1]], cb2, bb1, bt1], D({ fill: P.steel, width: 3.5 }));         // cab side
    const cw1 = pv(1300, 566, 0.79), cw2 = pv(1300, 568, 0.68), cw3 = pv(1300, 626, 0.67), cw4 = pv(1300, 626, 0.79);
    sk.poly(g, [cw1, cw2, cw3, cw4], D({ fill: P.slate, width: 2.5, step: 400 }));                     // side window
    sk.poly(g, [bt0, bt1, bb1, bb0], D({ fill: P.steel, width: 3.5 }));                                   // bed side
    sk.hatch(g, 1236, 640, 64, 190, { seed: sd(), gap: 9, angle: 60, stroke: P.slate, opacity: 0.45 });
    // rust blotches + dent on the bed side
    sk.poly(g, [[1262, 770], [1280, 760], [1292, 780], [1270, 792]], DET({ fill: P.slate, width: 1.5, opacity: 0.8 }));
    [[0.88, 36, 13], [0.6, 24, 9]].forEach(([s, ry, rx]) => {
      const c = pv(1300, 840, s);
      el("ellipse", { cx: c[0], cy: c[1] - ry * 0.55, rx, ry, fill: P.night, stroke: P.ink, "stroke-width": 3 }, g);
      el("ellipse", { cx: c[0] - 2, cy: c[1] - ry * 0.55, rx: rx * 0.45, ry: ry * 0.45, fill: P.steel, stroke: P.ink, "stroke-width": 1.5 }, g);
    });
    const wa = pv(1300, 840, 0.88);
    sk.path(g, [[wa[0] + 16, wa[1] - 50], [wa[0], wa[1] - 64], [wa[0] - 16, wa[1] - 50]], DET({ width: 3 }));         // wheel arch
    // cab: roof (from above) + rear face with window
    const cr0 = pv(1310, 556, 0.8), cr1 = pv(1610, 556, 0.8), cr2 = pv(1610, 556, 0.68), cr3 = pv(1310, 556, 0.68);
    sk.poly(g, [cr0, cr1, cr2, cr3], D({ fill: P.fog, width: 3 }));
    const cb0 = pv(1310, 690, 0.8), cb1 = pv(1610, 690, 0.8);
    sk.poly(g, [cr0, cr1, cb1, cb0], D({ fill: P.steel, width: 3.5 }));
    const rw0 = pv(1340, 574, 0.8), rw1 = pv(1580, 574, 0.8), rw2 = pv(1580, 636, 0.8), rw3 = pv(1340, 636, 0.8);
    sk.poly(g, [rw0, rw1, rw2, rw3], D({ fill: P.slate, width: 2.5, step: 400 }));
    sk.line(g, (rw0[0] + rw1[0]) / 2, rw0[1], (rw0[0] + rw1[0]) / 2, rw2[1], DET({ width: 2 }));                            // slider
    // bed interior (seen from above): floor + stuff (cooler, gas can, tarp bundle)
    const fi0 = pv(1310, 760, 0.8), fi1 = pv(1610, 760, 0.8);
    sk.poly(g, [[1306, 690], [1614, 690], fi1, fi0], D({ fill: P.slate, width: 3 }));
    sk.poly(g, [[1306, 690], fi0, cb0], { seed: sd(), fill: P.storm, stroke: "none", double: false, wobble: 0.5 });
    sk.rect(g, 1470, 636, 80, 46, D({ fill: P.fog, width: 3 }));                                                              // cooler
    sk.rect(g, 1470, 628, 80, 12, D({ fill: P.mist, width: 2.5 }));
    sk.poly(g, [[1360, 682], [1364, 640], [1388, 632], [1404, 640], [1404, 682]], D({ fill: P.steel, width: 3 }));          // gas can
    sk.line(g, 1372, 634, 1360, 622, DET({ width: 3 }));
    sk.poly(g, [[1420, 684], [1426, 660], [1462, 656], [1470, 684]], D({ fill: P.mist, width: 2.5, wobble: 1 }));          // bundle
    // tailgate + bumper + lights + plate
    sk.poly(g, [[1300, 686], [1620, 686], [1618, 806], [1302, 806]], D({ fill: P.steel, width: LINE.main }));
    for (let i = 0; i < 3; i++) sk.line(g, 1318, 712 + i * 26, 1602, 712 + i * 26, DET({ stroke: P.slate, opacity: 0.6, double: false }));
    sk.rect(g, 1430, 694, 60, 14, DET({ fill: P.slate, width: 1.5 }));                                                       // handle
    sk.poly(g, [[1330, 760], [1360, 752], [1376, 770], [1350, 786], [1326, 778]], DET({ fill: P.slate, opacity: 0.7, width: 1.5 })); // rust
    sk.path(g, [[1520, 740], [1548, 748], [1572, 738]], DET({ stroke: P.slate, opacity: 0.8, double: false }));              // dent
    sk.rect(g, 1288, 690, 16, 74, D({ fill: P.storm, width: 2.5 }));
    sk.rect(g, 1616, 690, 16, 74, D({ fill: P.storm, width: 2.5 }));
    sk.rect(g, 1284, 800, 352, 28, D({ fill: P.mist, width: 3 }));                                                           // bumper
    sk.rect(g, 1426, 806, 68, 20, D({ fill: P.paper, width: 2 }));
    txt(g, 1460, 822, "OLD BLUE", { "font-family": GOTHIC, "font-size": 15, fill: P.slate }, 52);
    sk.rect(g, 1530, 714, 58, 18, DET({ fill: P.fog, width: 1.5 }));
    txt(g, 1559, 727, "CERT", { "font-family": GOTHIC, "font-size": 13, fill: P.ink }, 30);
    [[1296, 822], [1568, 822]].forEach(([x, y]) => sk.rect(g, x, y, 58, 22, D({ fill: P.night, width: 3 })));
    for (let i = 0; i < 5; i++) el("ellipse", { cx: 1310 + i * 74, cy: 836 + (i % 2) * 4, rx: 1.5, ry: 3, fill: P.fog, opacity: 0.8 }, g);
  }

  // ------------------------------------------------------------------ UNDER THE TARP: pad + sleeping bags, bucket, crate
  const underG = el("g", { class: "rd-shelter-under" }, root);
  // ground pad, receding between the cars
  sk.poly(underG, [[606, 850], [904, 850], [884, 744], [700, 744]], D({ fill: P.storm, width: 3, step: 60 }));
  const bagsG = el("g", { class: "rd-shelter-bags" }, underG);
  // two mummy bags lying side by side across the pad: hood (with a rolled-jacket pillow) at left, foot at right
  function mummy(x0, x1, yc, hh, fill, k) {
    const pts = [];
    const n = 14;
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, w = hh * (1 - 0.35 * t) * (t < 0.08 ? 0.8 + t * 2.5 : 1); pts.push([x, yc - w / 2 - 2 * Math.sin(t * 9)]); }
    pts.push([x1 + hh * 0.18, yc]);
    for (let i = n; i >= 0; i--) { const t = i / n, x = x0 + (x1 - x0) * t, w = hh * (1 - 0.35 * t) * (t < 0.08 ? 0.8 + t * 2.5 : 1); pts.push([x, yc + w / 2]); }
    pts.push([x0 - hh * 0.2, yc]);
    sk.poly(bagsG, pts, D({ fill, width: 3, step: 30, wobble: 1 }));
    for (let j = 1; j < 7; j++) { const x = x0 + ((x1 - x0) * j) / 7, w = hh * (1 - 0.35 * (j / 7)); sk.path(bagsG, [[x - 3, yc - w / 2 + 2], [x + 3, yc], [x - 3, yc + w / 2 - 2]], DET({ stroke: P.slate, opacity: 0.75, double: false, width: 1.6 })); }
    sk.line(bagsG, x0 + 20, yc - hh * 0.12, x1 - 20, yc - hh * 0.08, DET({ stroke: P.slate, opacity: 0.5, double: false, width: 1.5 })); // zip
    el("ellipse", { cx: x0 + hh * 0.28, cy: yc, rx: hh * 0.28, ry: hh * 0.26, fill: P.night, opacity: 0.85 }, bagsG); // hood opening
    sk.poly(bagsG, [[x0 - hh * 0.6, yc - hh * 0.3], [x0 - hh * 0.1, yc - hh * 0.46], [x0 + hh * 0.05, yc + hh * 0.3], [x0 - hh * 0.55, yc + hh * 0.4]], D({ fill: k ? P.fog : P.mist, width: 2.5, wobble: 1, step: 400 })); // pillow
  }
  mummy(712, 870, 774, 34, P.steel, 1);
  mummy(660, 878, 816, 46, P.mist, 0);
  // wet sock + mug at the foot
  sk.path(bagsG, [[884, 838], [896, 840], [900, 830]], DET({ width: 3, stroke: P.slate }));
  // a headlamp and a paperback on the pad
  sk.circle(underG, 712, 752, 6, DET({ fill: P.fog }));
  sk.path(underG, [[706, 752], [744, 756]], DET({ width: 1.5, double: false }));
  // the BUCKET under the sag (rim ellipse cx 930, cy 790)
  const bucketG = el("g", { class: "rd-shelter-bucket" }, underG);
  const BX = 930, BY = 790, BR = 30, BB = 836;
  el("ellipse", { cx: BX, cy: BB + 2, rx: 34, ry: 6, fill: P.storm, opacity: 0.5 }, bucketG);
  sk.poly(bucketG, [[BX - BR, BY], [BX - BR + 6, BB], [BX + BR - 6, BB], [BX + BR, BY]], D({ fill: P.steel, width: 3.5, step: 400 }));
  sk.line(bucketG, BX - BR + 3, BY + 14, BX + BR - 3, BY + 14, DET({ stroke: P.slate, opacity: 0.7, double: false }));
  sk.line(bucketG, BX - BR + 6, BY + 34, BX + BR - 6, BY + 34, DET({ stroke: P.slate, opacity: 0.7, double: false }));
  el("ellipse", { cx: BX, cy: BY, rx: BR, ry: 7, fill: P.slate, stroke: P.ink, "stroke-width": 3 }, bucketG);
  el("ellipse", { cx: BX, cy: BY + 1.5, rx: BR - 6, ry: 4, fill: P.mist, opacity: 0.8 }, bucketG); // water already in it
  sk.path(bucketG, [[BX - BR, BY], [BX - 12, BY - 22], [BX + 12, BY - 22], [BX + BR, BY]], DET({ width: 1.8, step: 10, opacity: 0.8 })); // bail
  sk.line(bucketG, BX - 6, BY + 22, BX + 8, BY + 30, DET({ stroke: P.fog, opacity: 0.6, double: false }));
  // the CRATE table (wooden fruit crate on end) with a tin mug and a candle stub
  const CR = { x0: 1068, x1: 1180, top: 770, base: 842 };
  sk.poly(underG, [[CR.x0, CR.top], [CR.x0 + 14, CR.top - 12], [CR.x1 + 14, CR.top - 12], [CR.x1, CR.top]], D({ fill: P.mist, width: 3 }));
  sk.rect(underG, CR.x0, CR.top, CR.x1 - CR.x0, CR.base - CR.top, D({ fill: P.steel, width: 3.5 }));
  sk.poly(underG, [[CR.x1, CR.top], [CR.x1 + 14, CR.top - 12], [CR.x1 + 14, CR.base - 12], [CR.x1, CR.base]], D({ fill: P.slate, width: 3 }));
  for (let i = 1; i < 3; i++) sk.line(underG, CR.x0 + 4, CR.top + (i * (CR.base - CR.top)) / 3, CR.x1 - 4, CR.top + (i * (CR.base - CR.top)) / 3, DET({ width: 2.5 }));
  sk.rect(underG, CR.x0 + 30, CR.top + 30, 52, 14, DET({ fill: P.night, width: 1.5 })); // hand hole
  txt(underG, (CR.x0 + CR.x1) / 2, CR.top + 22, "WA APPLES", { "font-family": GOTHIC, "font-size": 13, fill: P.fog }, 70);
  sk.rect(underG, CR.x1 - 30, CR.top - 22, 18, 20, DET({ fill: P.mist, width: 2 }));
  sk.path(underG, [[CR.x1 - 12, CR.top - 18], [CR.x1 - 4, CR.top - 14], [CR.x1 - 12, CR.top - 8]], DET({ width: 2 }));
  sk.rect(underG, CR.x0 + 8, CR.top - 14, 10, 12, DET({ fill: P.paper, width: 1.5 }));

  // ------------------------------------------------------------------ THE TARP + poles + ties
  const tarpG = el("g", { class: "rd-shelter-tarp" }, root);
  const TP = { x0: 575, x1: 1305, fy0: 458, fy1: 450, sagX: 930, sagY: 548 };
  const BK = [[722, 398], [1204, 388]]; // back ridge corners, on tall poles from the car roofs
  // back poles (behind the sheet): from the hatchback's front roof rack / the pickup cab roof
  sk.line(tarpG, 712, 540, BK[0][0], BK[0][1] - 6, D({ width: 5, opacity: 0.9 }));
  sk.line(tarpG, 1236, 524, BK[1][0], BK[1][1] - 6, D({ width: 5, opacity: 0.9 }));
  // front poles: one lashed to the hatchback's rear roof rack, one standing in the pickup bed
  sk.line(tarpG, 560, 600, TP.x0, TP.fy0 - 8, D({ width: 6 }));
  sk.line(tarpG, 1312, 690, TP.x1, TP.fy1 - 8, D({ width: 6 }));
  [[556, 586], [1310, 668]].forEach(([x, y]) => { for (let k = 0; k < 3; k++) sk.line(tarpG, x - 7, y + k * 5, x + 9, y + k * 5 - 3, DET({ width: 1.8, double: false })); });
  // guy lines from the pole tops out to stakes
  sk.line(tarpG, TP.x0, TP.fy0 - 6, 452, 610, DET({ width: 1.6, opacity: 0.8 }));
  sk.line(tarpG, TP.x1, TP.fy1 - 6, 1440, 640, DET({ width: 1.6, opacity: 0.8 }));
  sk.line(tarpG, BK[0][0], BK[0][1] - 4, 640, 360, DET({ width: 1.4, opacity: 0.6 }));
  sk.line(tarpG, BK[1][0], BK[1][1] - 4, 1290, 352, DET({ width: 1.4, opacity: 0.6 }));
  const fe = (t) => { // front edge: corners → sag (smooth)
    const xL = TP.x0, xR = TP.x1, x = xL + (xR - xL) * t;
    const tl = (TP.sagX - xL) / (xR - xL);
    const k = t < tl ? t / tl : (1 - t) / (1 - tl);
    const yEnd = t < tl ? TP.fy0 : TP.fy1;
    return [x, yEnd + (TP.sagY - yEnd) * Math.pow(Math.sin((k * Math.PI) / 2), 1.6)];
  };
  const front = []; for (let i = 0; i <= 20; i++) front.push(fe(i / 20));
  const back = []; for (let i = 0; i <= 8; i++) { const t = i / 8; back.push([BK[1][0] + (BK[0][0] - BK[1][0]) * t, BK[1][1] + (BK[0][1] - BK[1][1]) * t + Math.sin(t * Math.PI) * 26]); }
  // the sheet, seen from below (underside, shadowed)
  sk.poly(tarpG, front.concat(back), D({ fill: P.steel, width: LINE.main, step: 24, wobble: 1.2 }));
  const tcp = el("clipPath", { id: uid + "tarp" }, defs);
  el("path", { d: "M" + front.concat(back).map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join(" L") + " Z" }, tcp);
  sk.hatch(el("g", { "clip-path": `url(#${uid}tarp)` }, tarpG), 560, 380, 760, 180, { seed: sd(), gap: 11, angle: 160, stroke: P.slate, opacity: 0.3 });
  // the water pocket: a heavy belly bulging down behind the sag, with stress creases fanning out to the ties
  const bel = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); bel.push([TP.sagX + Math.cos(a) * 92, TP.sagY - 18 - Math.sin(a) * 30]); }
  sk.path(tarpG, bel, DET({ stroke: P.slate, width: 3, opacity: 0.9, double: false, step: 20 }));
  sk.path(tarpG, bel.map(([x, y]) => [TP.sagX + (x - TP.sagX) * 0.6, y + 8]), DET({ stroke: P.slate, width: 2, opacity: 0.7, double: false, step: 20 }));
  el("ellipse", { cx: TP.sagX, cy: TP.sagY - 14, rx: 50, ry: 12, fill: P.slate, opacity: 0.55 }, tarpG);
  [[TP.x0 + 20, TP.fy0 + 4], [BK[0][0] + 10, BK[0][1] + 8], [BK[1][0] - 10, BK[1][1] + 8], [TP.x1 - 20, TP.fy1 + 4], [960, 418]].forEach(([x, y]) =>
    sk.path(tarpG, [[x, y], [(x + TP.sagX) / 2 + 6, (y + TP.sagY - 30) / 2 + 6], [TP.sagX + (x < TP.sagX ? -30 : 30), TP.sagY - 30]], DET({ stroke: P.slate, opacity: 0.6, double: false, width: 1.6, step: 30 })));
  // pale sky light through the wet sheet along the ridge
  sk.path(tarpG, back.map(([x, y]) => [x, y + 9]), DET({ stroke: P.mist, width: 3, opacity: 0.6, double: false, step: 30 }));
  // reinforced hem + grommets along the front edge
  sk.path(tarpG, front.map(([x, y]) => [x, y - 7]), DET({ stroke: P.slate, width: 2, opacity: 0.8, double: false, step: 24 }));
  for (let i = 1; i < 10; i++) { const [x, y] = fe(i / 10); el("circle", { cx: x, cy: y - 3, r: 3.2, fill: P.fog, stroke: P.ink, "stroke-width": 1.5 }, tarpG); }
  // ties at the four corners
  [[TP.x0, TP.fy0], [TP.x1, TP.fy1], BK[0], BK[1]].forEach(([x, y]) => sk.path(tarpG, [[x - 6, y + 4], [x, y - 2], [x + 6, y + 4]], DET({ width: 2 })));
  // run-off: water spilling over the sag lip + the hanging drip
  sk.path(tarpG, [[TP.sagX - 14, TP.sagY - 2], [TP.sagX - 4, TP.sagY + 2], [TP.sagX + 6, TP.sagY + 1]], DET({ stroke: P.fog, width: 3, opacity: 0.9, double: false }));
  el("path", { d: `M${TP.sagX} ${TP.sagY + 1} q -3.5 7 0 9 q 3.5 -2 0 -9 z`, fill: P.fog, stroke: P.slate, "stroke-width": 1 }, tarpG);
  [0.15, 0.3, 0.72, 0.86].forEach((t, i) => { const [x, y] = fe(t); el("ellipse", { cx: x + 2, cy: y + 7 + (i % 2) * 4, rx: 1.4, ry: 2.6, fill: P.fog, opacity: 0.85 }, tarpG); });
  // a lantern hung from the ridge line (cold, unlit)
  sk.line(tarpG, 1080, 406, 1080, 470, DET({ width: 1.5 }));
  sk.rect(tarpG, 1070, 470, 20, 26, D({ fill: P.fog, width: 2.5, wobble: 0.5 }));
  sk.line(tarpG, 1068, 470, 1092, 470, DET({ width: 3 }));
  sk.line(tarpG, 1080, 496, 1080, 502, DET({ width: 2 }));

  // ------------------------------------------------------------------ DOME TENT (far left)
  const tentG = el("g", { class: "rd-shelter-tent" }, root);
  const TN = { x: 150, gy: 892, w: 270, h: 178 };
  {
    const g = tentG, { x, gy, w, h } = TN;
    el("ellipse", { cx: x + 10, cy: gy + 4, rx: w * 0.62, ry: 12, fill: P.storm, opacity: 0.5 }, g);
    const dome = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 - i / 16); dome.push([x + Math.cos(a) * w / 2, gy - Math.sin(a) * h]); }
    sk.poly(g, dome, D({ fill: P.mist, width: LINE.main, step: 30 }));
    // rain fly (darker) over the top, vestibule hem
    const fly = [];
    for (let i = 0; i <= 14; i++) { const t = 0.1 + 0.8 * (i / 14), a = Math.PI * (1 - t); fly.push([x + Math.cos(a) * w / 2 * 1.03, gy - Math.sin(a) * h * 1.03]); }
    for (let i = 14; i >= 0; i--) { const t = 0.1 + 0.8 * (i / 14); fly.push([x + (t - 0.5) * w * 0.94, gy - h * 0.5 + Math.sin(i * 1.3) * 5]); }
    sk.poly(g, fly, D({ fill: P.steel, width: 3.5, step: 30 }));
    [[-0.5, 0.36], [0.5, -0.36]].forEach(([a, b]) => {
      const pts = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([x + (a + (b - a) * t) * w, gy - Math.sin(Math.PI * t) * h * 0.99]); }
      sk.path(g, pts, DET({ stroke: P.ink, opacity: 0.5, double: false, width: 2.5 }));
    });
    for (let i = 0; i < 4; i++) sk.line(g, x - 70 + i * 22, gy - h * 0.86 + i * 8, x - 50 + i * 22, gy - h * 0.6 + i * 8, DET({ stroke: P.fog, opacity: 0.5, double: false, width: 2.5 }));
    // vent flap at the top
    sk.poly(g, [[x - 26, gy - h * 0.95], [x + 26, gy - h * 0.95], [x + 18, gy - h * 0.86], [x - 18, gy - h * 0.86]], D({ fill: P.slate, width: 2.5, step: 400 }));
    // door: D-shaped, half unzipped — flap hanging open to the left
    const dw = 116, dh = 128, dx = x + 6;
    const door = [[dx - dw / 2, gy - 2], [dx - dw / 2, gy - dh * 0.55], [dx - dw * 0.3, gy - dh * 0.9], [dx, gy - dh], [dx + dw * 0.3, gy - dh * 0.9], [dx + dw / 2, gy - dh * 0.55], [dx + dw / 2, gy - 2]];
    sk.poly(g, door, D({ fill: P.night, width: 3, step: 400 }));
    // a pillow + bag corner just visible inside
    sk.poly(g, [[dx - 6, gy - 4], [dx + 4, gy - 30], [dx + 50, gy - 32], [dx + 54, gy - 4]], D({ fill: P.slate, width: 2, step: 400 }));
    sk.poly(g, [[dx - dw / 2, gy - dh * 0.55], [dx - dw * 0.3, gy - dh * 0.9], [dx, gy - dh], [dx + 6, gy - dh * 0.7], [dx - 10, gy - dh * 0.3], [dx - 30, gy - 2], [dx - dw / 2, gy - 2]], D({ fill: P.mist, width: 3, step: 400 })); // hanging flap
    sk.path(g, [[dx, gy - dh], [dx + 6, gy - dh * 0.7], [dx - 10, gy - dh * 0.3], [dx - 30, gy - 2]], DET({ stroke: P.slate, width: 2, double: false })); // zip edge
    sk.circle(g, dx + 6, gy - dh * 0.7, 3.5, DET({ fill: P.fog, width: 1.5, double: false })); // zip pull
    sk.line(g, dx - 40, gy - dh * 0.6, dx - 30, gy - dh * 0.2, DET({ stroke: P.slate, opacity: 0.6, double: false }));
    // guy lines + stakes, a pair of boots by the door
    [[-1, 0.62], [1, 0.62]].forEach(([sg, k]) => {
      const ax = x + sg * w * 0.44, ay = gy - h * k;
      sk.line(g, ax, ay, x + sg * w * 0.72, gy + 6, DET({ width: 1.5, opacity: 0.8, double: false }));
      sk.line(g, x + sg * w * 0.72, gy - 4, x + sg * w * 0.74, gy + 10, DET({ width: 3 }));
    });
    sk.poly(g, [[dx + 64, gy + 2], [dx + 68, gy - 22], [dx + 82, gy - 22], [dx + 92, gy + 2]], DET({ fill: P.slate, width: 2 }));
    sk.poly(g, [[dx + 86, gy + 6], [dx + 90, gy - 18], [dx + 104, gy - 18], [dx + 114, gy + 6]], DET({ fill: P.slate, width: 2 }));
  }

  // ------------------------------------------------------------------ OUTSIDE, FRONT RIGHT: stone fire ring + pot, camp stove
  const fireG = el("g", { class: "rd-shelter-fire" }, root);
  const FX = 1690, FY = 900;
  el("ellipse", { cx: FX, cy: FY + 4, rx: 74, ry: 18, fill: P.night, opacity: 0.8 }, fireG);
  // charred logs + ash in the bed
  sk.line(fireG, FX - 40, FY + 6, FX + 24, FY - 6, D({ width: 8, stroke: P.night }));
  sk.line(fireG, FX - 16, FY - 6, FX + 44, FY + 8, D({ width: 7, stroke: P.night }));
  sk.line(fireG, FX - 30, FY - 2, FX - 10, FY + 2, DET({ stroke: P.mist, opacity: 0.6, double: false }));
  // back half of the stones, grate on legs, the pot, front stones
  const stone = (i, n, front) => {
    const a = (i / n) * Math.PI * 2, sx = FX + Math.cos(a) * 80, sy = FY + Math.sin(a) * 20, r = 12 + rnd(i + 310) * 6;
    if ((Math.sin(a) > 0) !== front) return;
    sk.poly(fireG, [[sx - r, sy + r * 0.45], [sx - r * 0.75, sy - r * 0.55], [sx + r * 0.35, sy - r * 0.7], [sx + r, sy + r * 0.2], [sx + r * 0.3, sy + r * 0.7]], D({ fill: i % 3 ? P.mist : P.steel, width: 3, wobble: 0.7, step: 400 }));
  };
  for (let i = 0; i < 13; i++) stone(i, 13, false);
  sk.line(fireG, FX - 54, FY - 2, FX - 50, FY - 40, DET({ width: 3 }));
  sk.line(fireG, FX + 56, FY - 2, FX + 52, FY - 40, DET({ width: 3 }));
  sk.poly(fireG, [[FX - 62, FY - 42], [FX + 62, FY - 44], [FX + 66, FY - 36], [FX - 66, FY - 34]], D({ fill: P.storm, width: 3 }));
  for (let i = 0; i < 9; i++) sk.line(fireG, FX - 56 + i * 14, FY - 43, FX - 58 + i * 14, FY - 35, DET({ stroke: P.mist, width: 1.5, double: false }));
  // dented pot with bail handle
  const PX = FX + 6, PY = FY - 68;
  sk.poly(fireG, [[PX - 34, PY], [PX - 30, PY + 36], [PX + 30, PY + 36], [PX + 34, PY]], D({ fill: P.slate, width: 3.5, step: 400 }));
  el("ellipse", { cx: PX, cy: PY, rx: 34, ry: 7, fill: P.storm, stroke: P.ink, "stroke-width": 3 }, fireG);
  sk.path(fireG, [[PX - 34, PY + 2], [PX - 20, PY - 30], [PX + 20, PY - 30], [PX + 34, PY + 2]], DET({ width: 2, step: 10 }));
  sk.path(fireG, [[PX + 4, PY + 14], [PX + 14, PY + 18], [PX + 20, PY + 12]], DET({ stroke: P.mist, opacity: 0.7, double: false })); // dent
  sk.hatch(fireG, PX - 30, PY + 22, 60, 14, { seed: sd(), gap: 6, angle: 60, stroke: P.night, opacity: 0.6 }); // soot
  sk.line(fireG, PX - 20, PY + 6, PX - 14, PY + 30, DET({ stroke: P.mist, opacity: 0.6, double: false }));
  for (let i = 0; i < 13; i++) stone(i, 13, true);
  // kindling + a split log waiting under a scrap of plastic
  sk.poly(fireG, [[FX + 96, FY + 26], [FX + 100, FY + 4], [FX + 150, FY], [FX + 156, FY + 24]], D({ fill: P.mist, width: 2.5, wobble: 1 }));
  sk.line(fireG, FX + 106, FY + 14, FX + 146, FY + 10, DET({ stroke: P.steel, opacity: 0.7, double: false }));
  // camp stove on a flat rock
  const stoveG = el("g", { class: "rd-shelter-stove" }, root);
  const SVX = 1450, SVY = 878;
  sk.poly(stoveG, [[SVX - 86, 916], [SVX - 76, 890], [SVX + 80, 886], [SVX + 92, 916]], D({ fill: P.mist, width: 3, wobble: 1 }));
  sk.rect(stoveG, SVX - 62, SVY, 124, 22, D({ fill: P.slate, width: 3.5 }));                                           // body
  sk.poly(stoveG, [[SVX - 62, SVY], [SVX - 58, SVY - 52], [SVX + 58, SVY - 52], [SVX + 62, SVY]], D({ fill: P.steel, width: 3 })); // lid up
  [[-1, -62], [1, 62]].forEach(([sg, ox]) => sk.poly(stoveG, [[SVX + ox, SVY], [SVX + ox + sg * 14, SVY - 40], [SVX + ox + sg * 14, SVY - 8]], DET({ fill: P.steel, width: 2 }))); // wind wings
  sk.line(stoveG, SVX - 50, SVY - 44, SVX + 50, SVY - 44, DET({ stroke: P.slate, opacity: 0.6, double: false }));
  [SVX - 30, SVX + 30].forEach((bx) => { el("ellipse", { cx: bx, cy: SVY - 2, rx: 20, ry: 5, fill: P.storm, stroke: P.ink, "stroke-width": 2 }, stoveG); sk.line(stoveG, bx - 18, SVY - 4, bx + 18, SVY - 4, DET({ width: 1.5, double: false })); });
  [SVX - 40, SVX + 40].forEach((kx) => sk.circle(stoveG, kx, SVY + 12, 4.5, DET({ fill: P.fog, width: 1.5 })));
  sk.path(stoveG, [[SVX + 62, SVY + 12], [SVX + 80, SVY + 14], [SVX + 92, SVY + 4]], DET({ width: 3 }));                // regulator
  sk.rect(stoveG, SVX + 88, SVY - 36, 22, 44, D({ fill: P.fog, width: 3 }));                                           // propane canister
  sk.rect(stoveG, SVX + 94, SVY - 44, 10, 8, DET({ fill: P.steel }));
  txt(stoveG, SVX + 99, SVY - 6, "LP", { "font-family": GOTHIC, "font-size": 12, fill: P.slate }, 12);
  // a paper note taped to the lid
  sk.rect(stoveG, SVX - 30, SVY - 44, 60, 28, DET({ fill: P.paper, width: 1.5 }));
  txt(stoveG, SVX, SVY - 25, "OUTSIDE ONLY", { "font-family": HAND, "font-weight": 700, "font-size": 9.5, fill: P.ink }, 52);

  // ------------------------------------------------------------------ FOREGROUND (quiet near the caption bar)
  const fgG = el("g", { class: "rd-shelter-fg" }, root);
  // dark fir boughs dipping in from the top-left corner, dripping
  sk.poly(fgG, [[-20, -20], [380, -20], [330, 30], [360, 40], [250, 80], [280, 96], [150, 130], [170, 150], [40, 180], [60, 196], [-20, 220]], D({ fill: P.storm, width: LINE.main, step: 40 }));
  for (let i = 0; i < 8; i++) sk.line(fgG, 10 + i * 40, 10 + i * 8, 60 + i * 38, 60 + i * 2, DET({ stroke: P.ink, opacity: 0.4, double: false }));
  [[340, 52], [262, 108], [160, 160], [52, 206]].forEach(([x, y]) => el("ellipse", { cx: x, cy: y, rx: 1.8, ry: 3.4, fill: P.fog, opacity: 0.85 }, fgG));

  return {
    g: root,
    groundY: GROUND,
    tarp: { g: tarpG, x0: TP.x0, x1: TP.x1, sagX: TP.sagX, sagY: TP.sagY, frontY: Math.round((TP.fy0 + TP.fy1) / 2), backY: Math.round((BK[0][1] + BK[1][1]) / 2) },
    rainCatch: { g: bucketG, bucketX: BX, bucketY: BY, dripX: TP.sagX, dripTopY: TP.sagY + 8, bucketBaseY: BB, bucketR: BR },
    firePit: { g: fireG, x: FX, y: FY, pot: { x: PX, y: PY } },
    stove: { g: stoveG, x: SVX, y: SVY },
    tent: { g: tentG, x: TN.x, y: TN.gy, doorX: TN.x + 6, doorY: TN.gy - 60, w: TN.w, h: TN.h },
    cars: [{ g: hatchG, x: 440, y: 842, kind: "hatchback", w: 300 }, { g: pickG, x: 1460, y: 842, kind: "pickup", w: 340 }],
    waterHeater: { g: whG, x: WH.x, y: WH.top, valveX: VX, valveY: VY, baseY: WH.base, shed: { g: cabinG, doorX: (DX0 + DX1) / 2, doorY: 690 } },
    bagSpot: { x: 1010, y: 842 },
    crateTop: { x: (CR.x0 + CR.x1) / 2, y: CR.top, x0: CR.x0, x1: CR.x1 },
    bags: { g: bagsG },
    cabin: { g: cabinG },
    fogG,
    sky: { g: skyG },
  };
};
