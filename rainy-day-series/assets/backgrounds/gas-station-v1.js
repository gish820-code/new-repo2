/* Rainy Day background — gasStation (Dale's Gas & Grocery, in the flood zone), v1 (Episode 2, DAY 1).
 *
 * Paste VERBATIM after the rig (assets/characters/rainy-day-rig-v3.js for Episode 2; only palette / LINE / el /
 * sk / hash are used, so v1/v2 work too). Guarded; registers window.RainyDayBG.gasStation.
 *
 *   const bg = window.RainyDayBG.gasStation(bgLayer, {});   // bgLayer = <g> in a 1920x1080 SVG
 *
 * View: ground level on Dale's lot at the east end of Main Street, the morning after the tsunami. LEFT: the small
 * grocery — "DALE'S GAS & GROCERY" fascia sign hanging askew, shattered storefront windows with a mud line ~1 m up
 * the walls, shelves and a pallet of bottled-water cases visible inside, the door jammed half open on a mud heap.
 * RIGHT: the fuel canopy tilted on a buckled column, one pump standing, one knocked flat, a car nosed into the
 * buckled column. Between them an overturned boat hull and a power pole leaning over the lot; its downed line
 * drapes to the ground and lies across the lot to end in a puddle. Standing muddy water with a sheen across the
 * lot, planks and junk everywhere. Through the gaps: the east hill, the coast highway, the stranded ferry far off.
 * Flat cold gray morning light, fog. Static and deterministic; scenes own all motion. No rain (add RainyDay.rain).
 *
 * OPTS (all optional)
 *   fog   0..1   (default 0.6) strength of the fog / haze in the distance.
 *   seed  number wobble seed (default 9).
 *
 * HANDLES (return value)
 *   g            root <g>.
 *   groundY      870   where feet stand on the lot (ankle-deep in the standing water; figure hip y = 870 - 116*scale,
 *                scale 1.4 -> hip y 707.6). Flat for x 0..1920. y >= 940 is plain water/asphalt (caption zone).
 *   store        { g, doorX: 556, doorY: 800, windowRect: { x: 124, y: 452, w: 336, h: 304 },
 *                  door: { g, x0: 500, x1: 612, topY: 446 }, sign: { g }, mudLineY: 620 }
 *                doorX/doorY = centre of the jammed doorway at the threshold (inside is dark). windowRect = the big
 *                shattered window (shelves + the water pallet behind it) — scenes may clip effects into it.
 *                sign.g = the "DALE'S GAS & GROCERY" fascia (hangs askew; scenes may swing it a little about its
 *                left bracket at 116,360).
 *   canopy       { g, pivotX: 1182, pivotY: 300, tilt: 4 }  the tilted canopy roof (+ lights). Rotate g about
 *                (pivotX, pivotY) for creaks/sway, e.g. gsap.to(g, { rotation: 1.5, svgOrigin: "1182 300" }).
 *                Its columns stay put (the right one is the buckled one at x 1700).
 *   pumps        [ { g, x: 1330, y: 832, down: false }, { g, x: 1560, y: 832, down: true } ]  x/y = pump base
 *                centre on the island. pumps[1] is knocked over (lying to the right, hose in the water).
 *   powerLine    { g, x0: 804.7, y0: 163.1, x1: 432, y1: 930, pole: { g, x: 978, baseY: 796 } }  the leaning pole
 *                and its downed line: (x0,y0) = where the line leaves the pole top, (x1,y1) = its loose end lying in
 *                the puddle (spark/flash origin for the "stay away from downed lines" beat).
 *   water        { g, y: 846 }  the standing muddy water over the lot (surface / back edge at y 846).
 *   smokeOrigin  { x: 713, y: 290 }  rooftop vent stack on the store (thin smoke / steam origin).
 *   pallet       { x: 372, y: 754 }  bottom-centre of the pallet of bottled-water cases inside the big window.
 *   boat         { g, x: 980, y: 836 }  the overturned hull.   car { g, x: 1790, y: 862 }  car against the column.
 *   layers       { sky, far, store, canopy, lot, water, front }  draw-order groups.
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.gasStation) return;
  let instance = 0;

  window.RainyDayBG.gasStation = function (parent, opts) {
    opts = opts || {};
    const RD = window.RainyDay, P = RD.palette, LINE = RD.LINE, sk = RD.sk, el = RD.el, H = RD.hash;
    const INK = P.ink;
    const FOG = opts.fog !== undefined ? Math.max(0, Math.min(1, +opts.fog)) : 0.6;
    const seed0 = opts.seed || 9;
    instance++;
    const uid = "rdgs" + instance + "_" + Math.round(Math.abs(H(seed0 * 3.1 + 0.4)) * 1e6);
    let sN = seed0 * 1000 + 23;
    const S = () => (sN += 7);
    const rnd = (i) => (H(i * 1.731 + 91.3) + 1) / 2;

    const GROUND = 870, WATER = 846, LOTY = 792, BASE = 800, MUD = 620;
    const FONT_SIGN = "'League Gothic', Oswald, Impact, 'Arial Narrow', sans-serif";
    const FONT_HAND = "Kalam, 'Comic Sans MS', cursive";
    const f1 = (v) => (+v).toFixed(1);
    const D = (pts, close) => "M" + pts.map((p) => f1(p[0]) + " " + f1(p[1])).join(" L") + (close ? " Z" : "");

    const g = el("g", { class: "rdbg-gas-station" }, parent);
    const defs = el("defs", {}, g);
    const layer = (name, par) => el("g", { class: "gs-" + name }, par || g);

    // ------------------------------------------------------------------ helpers
    function txt(par, x, y, s, o) {
      o = o || {};
      const a = { x: f1(x), y: f1(y), "font-family": o.font || FONT_SIGN, "font-size": o.size || 24, fill: o.fill || INK, "text-anchor": o.anchor || "middle" };
      if (o.ls) a["letter-spacing"] = o.ls;
      if (o.weight) a["font-weight"] = o.weight;
      if (o.len) { a.textLength = o.len; a.lengthAdjust = "spacingAndGlyphs"; }
      if (o.opacity !== undefined) a.opacity = o.opacity;
      if (o.rot) a.transform = `rotate(${o.rot} ${f1(x)} ${f1(y)})`;
      const t = el("text", a, par);
      t.textContent = s;
      return t;
    }
    function lines(par, segs, o) {
      o = o || {};
      const d = segs.map((s) => `M${f1(s[0])} ${f1(s[1])} L${f1(s[2])} ${f1(s[3])}`).join(" ");
      return el("path", { d, stroke: o.stroke || P.storm, "stroke-width": o.width || 1.6, fill: "none", opacity: o.opacity !== undefined ? o.opacity : 0.35, "stroke-linecap": "round" }, par);
    }
    const ellPts = (cx, cy, rx, ry, n) => {
      const a = []; n = n || 20;
      for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; a.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); }
      return a;
    };
    const rotPt = (p, cx, cy, deg) => {
      const r = (deg * Math.PI) / 180, dx = p[0] - cx, dy = p[1] - cy;
      return [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)];
    };
    const rotArr = (arr, cx, cy, a) => arr.map((p) => rotPt(p, cx, cy, a));
    let clipN = 0;
    function clipTo(par, pts) {
      const id = uid + "c" + clipN++;
      const cp = el("clipPath", { id }, defs);
      el("path", { d: D(pts, true) }, cp);
      return el("g", { "clip-path": `url(#${id})` }, par);
    }
    function fir(par, x, base, h, o) {
      o = o || {};
      const tg = el("g", {}, par);
      const fill = o.fill || P.storm, stroke = o.stroke || P.night, wd = o.width || 2, w = h * (o.wide || 0.34);
      sk.line(tg, x, base, x, base - h * 0.2, { stroke, width: Math.max(1.5, h / 40), seed: S(), double: false });
      const tiers = o.tiers || 4;
      for (let i = 0; i < tiers; i++) {
        const tb = base - h * 0.1 - i * h * (0.68 / tiers);
        const tt = i === tiers - 1 ? base - h : tb - h * 0.42;
        const tw = w * (1 - i * (0.7 / tiers));
        sk.poly(tg, [[x - tw, tb], [x - tw * 0.45, tb - (tb - tt) * 0.35], [x, tt], [x + tw * 0.45, tb - (tb - tt) * 0.35], [x + tw, tb], [x + tw * 0.3, tb - h * 0.035], [x - tw * 0.3, tb - h * 0.035]], { fill, stroke, width: wd, seed: S(), wobble: Math.max(0.5, h / 110), double: h > 120 });
      }
      return tg;
    }
    function glassStar(par, cx, cy, r, seed, col) {
      const cg = el("g", {}, par);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + H(seed + i) * 0.4, rr = r * (0.55 + 0.45 * Math.abs(H(seed + i * 3)));
        const mid = [cx + Math.cos(a) * rr * 0.5 + H(seed + i * 5) * 3, cy + Math.sin(a) * rr * 0.5 + H(seed + i * 7) * 3];
        sk.path(cg, [[cx, cy], mid, [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]], { stroke: col || P.paper, width: 1.8, seed: seed + i, double: false, wobble: 0.6 });
      }
      sk.path(cg, ellPts(cx, cy, r * 0.3, r * 0.26, 9), { closed: true, stroke: col || P.paper, width: 1.5, seed: seed + 40, double: false, opacity: 0.8 });
      sk.path(cg, ellPts(cx, cy, r * 0.62, r * 0.55, 11), { closed: true, stroke: col || P.paper, width: 1.2, seed: seed + 41, double: false, opacity: 0.5 });
      return cg;
    }
    function plank(par, x, y, l, a, w, o) {
      o = o || {};
      const p = rotArr([[x, y], [x + l, y], [x + l, y + w], [x, y + w]], x, y, a);
      sk.poly(par, p, { fill: o.fill || P.steel, stroke: o.stroke || P.storm, width: o.width || 3, seed: S(), wobble: 0.6 });
      const q = rotArr([[x + l * 0.08, y + w * 0.5], [x + l * 0.85, y + w * 0.5]], x, y, a);
      lines(par, [[q[0][0], q[0][1], q[1][0], q[1][1]]], { stroke: o.stroke || P.storm, width: 1.4, opacity: 0.5 });
      if (o.nail) el("circle", { cx: f1(rotPt([x + l * 0.92, y + w * 0.5], x, y, a)[0]), cy: f1(rotPt([x + l * 0.92, y + w * 0.5], x, y, a)[1]), r: 2, fill: P.night }, par);
    }

    // ------------------------------------------------------------------ SKY
    const skyL = layer("sky");
    const sg = el("linearGradient", { id: uid + "sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, P.slate], [0.4, P.steel], [0.8, P.mist], [1, P.fog]].forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, sg));
    el("rect", { x: -40, y: -40, width: 2000, height: 860, fill: `url(#${uid}sky)` }, skyL);
    function cloud(par, x0, x1, cy, h, fill, op, sd) {
      const pts = [], n = Math.max(6, Math.round((x1 - x0) / 60));
      for (let i = 0; i <= n; i++) {
        const t = i / n, x = x0 + (x1 - x0) * t;
        const bump = Math.pow(Math.sin(t * Math.PI), 0.7) * h * (0.65 + 0.35 * rnd(sd + i));
        pts.push([x, cy - bump + (i % 2 ? h * 0.1 : 0)]);
      }
      pts.push([x1 - 30, cy + h * 0.16], [x0 + (x1 - x0) * 0.6, cy + h * 0.24], [x0 + 40, cy + h * 0.14]);
      sk.path(par, pts, { closed: true, fill, stroke: P.slate, width: LINE.detail, seed: sd, wobble: 3, opacity: op, double: false });
      sk.hatch(par, x0 + 40, cy - h * 0.05, x1 - x0 - 80, h * 0.28, { gap: 12, angle: 16, stroke: P.slate, width: 1.4, opacity: 0.14 * op, seed: sd + 2 });
    }
    cloud(skyL, -80, 700, 60, 70, P.slate, 0.8, S());
    cloud(skyL, 600, 1400, 30, 60, P.steel, 0.7, S());
    cloud(skyL, 1250, 2000, 80, 80, P.slate, 0.75, S());
    cloud(skyL, 300, 1100, 170, 44, P.mist, 0.5, S());
    cloud(skyL, 1300, 1980, 190, 40, P.mist, 0.45, S());
    [[1040, 150, 1], [1080, 166, 0.8], [1500, 120, 0.9]].forEach(([x, y, s]) =>
      el("path", { d: `M${f1(x - 9 * s)} ${f1(y)} Q${f1(x - 4 * s)} ${f1(y - 6 * s)} ${f1(x)} ${f1(y)} Q${f1(x + 4 * s)} ${f1(y - 6 * s)} ${f1(x + 9 * s)} ${f1(y)}`, stroke: P.storm, "stroke-width": 2, fill: "none", "stroke-linecap": "round", opacity: 0.6 }, skyL));

    // ------------------------------------------------------------------ FAR: east hill, highway, distant wreckage, the ferry far off
    const farL = layer("far");
    const hill2 = [[860, 560], [1000, 500], [1200, 430], [1400, 360], [1600, 300], [1800, 250], [1960, 226], [1960, 800], [860, 800]];
    sk.path(farL, hill2, { closed: true, fill: P.mist, stroke: P.steel, width: LINE.detail, seed: S(), wobble: 2, double: false });
    const hill = [[1000, 600], [1150, 540], [1320, 470], [1500, 410], [1700, 352], [1860, 318], [1960, 306], [1960, 800], [1000, 800]];
    sk.path(farL, hill, { closed: true, fill: P.steel, stroke: P.slate, width: LINE.detail, seed: S(), wobble: 2 });
    sk.hatch(clipTo(farL, hill), 1000, 300, 960, 500, { gap: 14, angle: 62, stroke: P.slate, width: 1.4, opacity: 0.25, seed: S() });
    const hy = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) return pts[i][1] + ((pts[i + 1][1] - pts[i][1]) * (x - pts[i][0])) / (pts[i + 1][0] - pts[i][0]); return pts[pts.length - 3][1]; };
    for (let i = 0; i < 34; i++) { const x = 880 + i * 32 + rnd(i) * 12; fir(farL, x, hy(hill2, x) + 12, 30 + rnd(i + 9) * 22, { fill: P.steel, stroke: P.steel, width: 1.4, tiers: 3 }); }
    for (let i = 0; i < 26; i++) { const x = 1010 + i * 36 + rnd(i + 30) * 14; fir(farL, x, hy(hill, x) + 18, 44 + rnd(i + 3) * 34, { fill: P.slate, stroke: P.storm, width: 1.8, tiers: 4 }); }
    // the evacuation trail scar down the hill (where everyone climbed)
    sk.path(farL, [[1180, 640], [1290, 600], [1230, 560], [1380, 520], [1320, 480], [1500, 430]], { stroke: P.fog, width: 3, seed: S(), double: false, opacity: 0.55 });
    // distant flat: muddy ground to the hill foot, the coast highway leaving east, a broken bridge far off
    sk.path(farL, [[-20, 700], [600, 690], [1000, 700], [1400, 690], [1960, 676], [1960, 800], [-20, 800]], { closed: true, fill: P.steel, stroke: P.slate, width: 2, seed: S(), double: false });
    sk.path(farL, [[1180, 740], [1400, 712], [1600, 694], [1800, 684], [1960, 680]], { stroke: P.slate, width: 10, seed: S(), double: false });
    sk.path(farL, [[1180, 740], [1400, 712], [1600, 694], [1800, 684], [1960, 680]], { stroke: P.mist, width: 1.6, seed: S(), double: false, opacity: 0.6 });
    lines(farL, [[1640, 690, 1680, 700], [1690, 698, 1694, 712], [1716, 684, 1712, 700]], { stroke: P.slate, width: 3, opacity: 0.8 });
    // wrecked houses down the street to the west (seen past the store's right corner and under the canopy)
    const farHouse = (x, by, w, rot, o) => {
      o = o || {};
      const hg = el("g", { transform: `rotate(${rot} ${x} ${by})` }, farL);
      sk.rect(hg, x - w / 2, by - w * 0.55, w, w * 0.55, { fill: o.fill || P.mist, stroke: P.slate, width: 2, seed: S(), double: false, wobble: 0.6 });
      sk.poly(hg, [[x - w / 2 - 4, by - w * 0.55], [x, by - w * 0.9], [x + w / 2 + 4, by - w * 0.55]], { fill: P.slate, stroke: P.slate, width: 2, seed: S(), double: false });
      sk.rect(hg, x - w * 0.3, by - w * 0.4, w * 0.18, w * 0.16, { fill: P.storm, stroke: P.slate, width: 1.2, seed: S(), double: false });
      sk.path(hg, [[x - w / 2, by - w * 0.22], [x + w / 2, by - w * 0.24]], { stroke: P.steel, width: 2, seed: S(), double: false });
      return hg;
    };
    farHouse(1100, 742, 64, -9); farHouse(1250, 734, 54, 6, { fill: P.fog }); farHouse(1460, 716, 48, -4); farHouse(1840, 700, 44, 12, { fill: P.fog });
    sk.path(farL, [[1350, 728], [1400, 708], [1440, 722], [1420, 730]], { closed: true, fill: P.slate, stroke: P.slate, width: 1.6, seed: S(), double: false });
    // the ferry, stranded across Main Street, far off between the store and the canopy
    const fy = el("g", { transform: "rotate(-5 960 640)" }, farL);
    sk.poly(fy, [[870, 640], [1060, 640], [1054, 660], [880, 662]], { fill: P.fog, stroke: P.slate, width: 2, seed: S(), double: false });
    sk.rect(fy, 890, 612, 150, 28, { fill: P.paper, stroke: P.slate, width: 2, seed: S(), double: false });
    for (let i = 0; i < 7; i++) sk.rect(fy, 898 + i * 20, 620, 11, 9, { fill: P.slate, stroke: P.slate, width: 1, seed: S(), double: false });
    sk.rect(fy, 930, 592, 70, 20, { fill: P.fog, stroke: P.slate, width: 2, seed: S(), double: false });
    sk.line(fy, 965, 592, 965, 560, { stroke: P.slate, width: 2, seed: S(), double: false });
    sk.poly(fy, [[1006, 612], [1008, 590], [1022, 590], [1024, 612]], { fill: P.steel, stroke: P.slate, width: 1.6, seed: S(), double: false });
    sk.path(farL, [[860, 668], [920, 650], [1000, 652], [1080, 660], [1040, 672], [900, 676]], { closed: true, fill: P.slate, stroke: "none", seed: S(), double: false, opacity: 0.85 });
    // fog / haze over the distance
    const hz = el("linearGradient", { id: uid + "haze", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, 0.1], [0.5, 0.3], [1, 0.12]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": P.fog, "stop-opacity": a * (0.5 + FOG) }, hz));
    el("rect", { x: -40, y: 260, width: 2000, height: 540, fill: `url(#${uid}haze)` }, farL);
    const fb = el("filter", { id: uid + "fogblur", x: "-10%", y: "-60%", width: "120%", height: "220%" }, defs);
    el("feGaussianBlur", { stdDeviation: 8 }, fb);
    const fogG = el("g", { filter: `url(#${uid}fogblur)` }, farL);
    [[820, 1500, 600, 30, 0.5], [1300, 2000, 470, 36, 0.45], [880, 1960, 690, 22, 0.4]].forEach(([x0, x1, cy, h, op], k) => {
      const pts = [], n = 10;
      for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t, cy - Math.sin(t * Math.PI) * h * (0.6 + 0.4 * rnd(k * 20 + i))]); }
      for (let i = n; i >= 0; i--) { const t = i / n; pts.push([x0 + (x1 - x0) * t, cy + Math.sin(t * Math.PI) * h * 0.3]); }
      sk.path(fogG, pts, { closed: true, fill: P.paper, stroke: "none", seed: S(), double: false, opacity: op * FOG });
    });

    // ------------------------------------------------------------------ LOT ground (behind the water)
    const lotL = layer("lot");
    sk.path(lotL, [[-20, LOTY], [1960, LOTY - 6], [1960, 1100], [-20, 1100]], { closed: true, fill: P.slate, stroke: P.storm, width: 3, seed: S(), wobble: 0.8 });
    sk.hatch(lotL, -20, LOTY, 1980, 120, { gap: 10, angle: 3, stroke: P.storm, width: 1.6, opacity: 0.35, seed: S() });
    // the store's raised concrete apron + curb
    sk.path(lotL, [[60, BASE - 4], [900, BASE - 4], [912, BASE + 18], [48, BASE + 18]], { closed: true, fill: P.mist, stroke: P.storm, width: 3, seed: S(), wobble: 0.5 });
    lines(lotL, [[200, BASE - 2, 196, BASE + 16], [380, BASE - 2, 376, BASE + 16], [560, BASE - 2, 556, BASE + 16], [740, BASE - 2, 736, BASE + 16]], { stroke: P.storm, width: 1.6, opacity: 0.5 });
    sk.path(lotL, [[60, BASE + 4], [300, BASE + 6], [520, BASE + 2], [700, BASE + 8], [900, BASE + 4]], { stroke: P.steel, width: 6, seed: S(), double: false, opacity: 0.7 }); // silt on the apron

    // ------------------------------------------------------------------ STORE
    const storeL = layer("store");
    const SX0 = 90, SX1 = 860, STOP = 330;
    const ST = P.storm;
    // roof edge + vent stack (smoke origin)
    sk.rect(storeL, 700, 300, 26, 34, { fill: P.steel, stroke: ST, width: 3, seed: S(), wobble: 0.4 });
    sk.rect(storeL, 694, 292, 38, 10, { fill: P.slate, stroke: ST, width: 2.5, seed: S(), double: false });
    sk.rect(storeL, 240, 312, 70, 22, { fill: P.slate, stroke: ST, width: 2.5, seed: S(), wobble: 0.4 }); // rooftop AC unit
    lines(storeL, [[250, 318, 250, 330], [262, 318, 262, 330], [274, 318, 274, 330], [286, 318, 286, 330], [298, 318, 298, 330]], { stroke: P.mist, width: 1.6, opacity: 0.6 });
    // wall
    sk.rect(storeL, SX0, STOP, SX1 - SX0, BASE - STOP, { fill: P.fog, stroke: ST, width: LINE.main, seed: S(), wobble: 1 });
    const blocks = [];
    for (let r = 0, y = STOP + 96; y < BASE - 4; r++, y += 22) {
      blocks.push([SX0 + 3, y, SX1 - 3, y + 0.5]);
      for (let x = SX0 + 20 + (r % 2) * 22; x < SX1 - 6; x += 44) blocks.push([x, y, x, y + 22]);
    }
    lines(storeL, blocks, { stroke: P.mist, width: 1.4, opacity: 0.55 });
    // MUD LINE ~1 m up: everything below is stained, streaked and silted
    const mudTop = [];
    for (let x = SX0; x <= SX1; x += 30) mudTop.push([x, MUD + Math.sin(x * 0.05) * 3 + rnd(x) * 3]);
    sk.path(storeL, mudTop.concat([[SX1, BASE], [SX0, BASE]]), { closed: true, fill: P.steel, stroke: "none", seed: S(), double: false, opacity: 0.72 });
    sk.path(storeL, mudTop, { stroke: P.slate, width: 4, seed: S(), double: false, opacity: 0.95 });
    sk.path(storeL, mudTop.map((p) => [p[0], p[1] + 7]), { stroke: P.steel, width: 2, seed: S(), double: false, opacity: 0.6 });
    const streaks = [];
    for (let i = 0; i < 40; i++) { const x = SX0 + 10 + ((i * 53) % (SX1 - SX0 - 20)), y = MUD + 6 + (i % 4) * 4; streaks.push([x, y, x + 1, y + 20 + (i % 5) * 9]); }
    lines(storeL, streaks, { stroke: P.slate, width: 2, opacity: 0.45 });

    // big left window (shattered) — interior: shelves + pallet of bottled water
    const WR = { x: 124, y: 452, w: 336, h: 304 };
    const intr = clipTo(storeL, [[WR.x, WR.y], [WR.x + WR.w, WR.y], [WR.x + WR.w, WR.y + WR.h], [WR.x, WR.y + WR.h]]);
    sk.rect(intr, WR.x - 10, WR.y - 10, WR.w + 20, WR.h + 20, { fill: P.slate, stroke: "none", seed: S(), double: false });
    // back wall + ceiling strip light (dead)
    sk.rect(intr, WR.x + 20, WR.y + 14, 120, 8, { fill: P.mist, stroke: P.storm, width: 1.6, seed: S(), double: false, opacity: 0.8 });
    sk.path(intr, [[WR.x + 180, WR.y + 18], [WR.x + 214, WR.y + 60]], { stroke: P.storm, width: 2, seed: S(), double: false }); // dangling light
    sk.rect(intr, WR.x + 200, WR.y + 58, 40, 7, { fill: P.mist, stroke: P.storm, width: 1.4, seed: S(), double: false });
    // shelving unit (back), some goods still on it, the bottom shelf swept clean
    const shelfG = el("g", {}, intr);
    sk.rect(shelfG, WR.x + 14, WR.y + 40, 170, 230, { fill: P.steel, stroke: P.storm, width: 2.5, seed: S(), wobble: 0.6 });
    [0, 1, 2, 3].forEach((r) => {
      const y = WR.y + 92 + r * 52;
      sk.line(shelfG, WR.x + 14, y, WR.x + 184, y, { stroke: P.storm, width: 3, seed: S(), double: false });
      if (r < 3) {
        for (let i = 0; i < 9; i++) {
          if (rnd(r * 17 + i) < (r === 2 ? 0.55 : 0.2)) continue;
          const bx = WR.x + 20 + i * 18, bh = 14 + rnd(r * 9 + i * 3) * 18, tilt = r === 1 && i > 5 ? 18 : 0;
          const b = rotArr([[bx, y], [bx + 13, y], [bx + 13, y - bh], [bx, y - bh]], bx + 13, y, tilt);
          sk.poly(shelfG, b, { fill: i % 3 === 0 ? P.fog : i % 3 === 1 ? P.mist : P.paper, stroke: P.storm, width: 1.4, seed: S(), double: false, wobble: 0.3 });
        }
      }
    });
    sk.hatch(shelfG, WR.x + 14, WR.y + 40, 170, 230, { gap: 9, angle: 60, stroke: P.storm, width: 1.2, opacity: 0.25, seed: S() });
    // a second shelf toppled diagonally
    sk.poly(intr, [[WR.x + 196, WR.y + 268], [WR.x + 300, WR.y + 150], [WR.x + 318, WR.y + 162], [WR.x + 214, WR.y + 282]], { fill: P.steel, stroke: P.storm, width: 2.5, seed: S() });
    lines(intr, [[WR.x + 226, WR.y + 238, WR.x + 240, WR.y + 252], [WR.x + 256, WR.y + 202, WR.x + 270, WR.y + 216], [WR.x + 284, WR.y + 170, WR.x + 298, WR.y + 184]], { stroke: P.storm, width: 2.5, opacity: 0.9 });
    // PALLET of bottled water: shrink-wrapped cases stacked on a wooden pallet
    const PX = 372, PY = 754;
    const palG = el("g", { class: "gs-pallet" }, intr);
    sk.rect(palG, PX - 76, PY - 14, 152, 14, { fill: P.mist, stroke: P.storm, width: 2.5, seed: S(), wobble: 0.4 });
    lines(palG, [[PX - 56, PY - 13, PX - 56, PY - 1], [PX, PY - 13, PX, PY - 1], [PX + 56, PY - 13, PX + 56, PY - 1]], { stroke: P.storm, width: 3, opacity: 0.9 });
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (r === 3 && c === 3) continue; // a case already taken
        const cx = PX - 72 + c * 36 + (r % 2) * 3, cy = PY - 14 - (r + 1) * 30;
        sk.rect(palG, cx, cy, 34, 29, { fill: P.fog, stroke: P.storm, width: 2, seed: S(), wobble: 0.4, double: false });
        [7, 17, 27].forEach((bx) => sk.circle(palG, cx + bx, cy + 7, 3.2, { fill: P.paper, stroke: P.steel, width: 1.2, seed: S(), double: false }));
        lines(palG, [[cx + 3, cy + 16, cx + 31, cy + 16], [cx + 8, cy + 12, cx + 8, cy + 27], [cx + 26, cy + 12, cx + 26, cy + 27]], { stroke: P.mist, width: 1.4, opacity: 0.8 });
      }
    }
    sk.rect(palG, PX - 64, PY - 104, 62, 18, { fill: P.paper, stroke: P.storm, width: 1.6, seed: S(), double: false, wobble: 0.3 });
    txt(palG, PX - 33, PY - 90, "WATER", { size: 13, fill: P.storm, len: 44, ls: 1 });
    // mud on the floor inside + silt on the goods
    sk.path(intr, [[WR.x, WR.y + 278], [WR.x + 120, WR.y + 268], [WR.x + 240, WR.y + 284], [WR.x + 340, WR.y + 272], [WR.x + 340, WR.y + 310], [WR.x, WR.y + 310]], { closed: true, fill: P.storm, stroke: "none", seed: S(), double: false, opacity: 0.6 });
    // what is left of the glass: jagged shards around the frame + a crack star
    const shards = [
      [[WR.x, WR.y], [WR.x + 120, WR.y], [WR.x + 70, WR.y + 30], [WR.x + 40, WR.y + 22], [WR.x + 18, WR.y + 70], [WR.x, WR.y + 60]],
      [[WR.x + WR.w, WR.y], [WR.x + WR.w - 90, WR.y], [WR.x + WR.w - 50, WR.y + 40], [WR.x + WR.w - 30, WR.y + 26], [WR.x + WR.w - 10, WR.y + 110], [WR.x + WR.w, WR.y + 120]],
      [[WR.x, WR.y + WR.h], [WR.x, WR.y + WR.h - 90], [WR.x + 20, WR.y + WR.h - 60], [WR.x + 34, WR.y + WR.h - 80], [WR.x + 60, WR.y + WR.h]],
    ];
    shards.forEach((sh) => sk.poly(storeL, sh, { fill: P.mist, stroke: P.paper, width: 1.6, seed: S(), double: false, opacity: 0.55 }));
    glassStar(storeL, WR.x + WR.w - 40, WR.y + 60, 50, S());
    // window frame (mullions)
    sk.rect(storeL, WR.x, WR.y, WR.w, WR.h, { fill: "none", stroke: ST, width: LINE.main, seed: S(), wobble: 0.6 });
    sk.line(storeL, WR.x + WR.w / 2, WR.y, WR.x + WR.w / 2 + 6, WR.y + 70, { stroke: ST, width: 5, seed: S(), double: false }); // mullion snapped, hanging
    sk.line(storeL, WR.x + WR.w / 2 + 2, WR.y + WR.h, WR.x + WR.w / 2 - 4, WR.y + WR.h - 60, { stroke: ST, width: 5, seed: S(), double: false });
    sk.line(storeL, WR.x - 8, WR.y + WR.h + 6, WR.x + WR.w + 8, WR.y + WR.h + 6, { stroke: ST, width: LINE.main, seed: S() });

    // DOOR: doorway (dark interior) + glass door leaf jammed half open on a mud heap
    const DX0 = 500, DX1 = 612, DTOP = 446;
    const doorG = el("g", { class: "gs-door" }, storeL);
    sk.rect(doorG, DX0, DTOP, DX1 - DX0, BASE - DTOP, { fill: P.storm, stroke: ST, width: LINE.main, seed: S(), wobble: 0.6 });
    sk.hatch(doorG, DX0 + 4, DTOP + 4, DX1 - DX0 - 8, BASE - DTOP - 8, { gap: 10, angle: 70, stroke: P.night, width: 1.6, opacity: 0.4, seed: S() });
    // the leaf, swung inward ~60 deg (foreshortened), hinge on the left
    sk.poly(doorG, [[DX0 + 4, DTOP + 4], [DX0 + 54, DTOP + 22], [DX0 + 54, BASE - 26], [DX0 + 4, BASE - 4]], { fill: P.slate, stroke: ST, width: 3, seed: S(), wobble: 0.5 });
    sk.poly(doorG, [[DX0 + 12, DTOP + 18], [DX0 + 46, DTOP + 32], [DX0 + 46, BASE - 64], [DX0 + 12, BASE - 54]], { fill: P.steel, stroke: ST, width: 2, seed: S(), double: false });
    glassStar(doorG, DX0 + 30, DTOP + 120, 22, S(), P.fog);
    sk.line(doorG, DX0 + 44, DTOP + 170, DX0 + 52, DTOP + 172, { stroke: P.fog, width: 4, seed: S(), double: false }); // push bar
    // mud heap + a plank wedged against the leaf (why it is jammed)
    sk.path(doorG, [[DX0 - 6, BASE], [DX0 + 20, BASE - 30], [DX0 + 60, BASE - 44], [DX0 + 96, BASE - 22], [DX1 + 8, BASE]], { closed: true, fill: P.slate, stroke: ST, width: 3, seed: S(), wobble: 1 });
    lines(doorG, [[DX0 + 26, BASE - 20, DX0 + 50, BASE - 24], [DX0 + 64, BASE - 30, DX0 + 84, BASE - 22]], { stroke: P.steel, width: 2, opacity: 0.8 });
    plank(doorG, DX0 + 50, BASE - 70, 96, 28, 12, { nail: true });
    // "open" sign upside down + hours card on the jamb
    sk.rect(doorG, DX1 - 34, DTOP + 40, 28, 40, { fill: P.paper, stroke: ST, width: 1.6, seed: S(), double: false, wobble: 0.3 });
    txt(doorG, DX1 - 20, DTOP + 56, "OPEN", { size: 9, fill: P.storm, len: 22, rot: 180 });
    txt(doorG, DX1 - 20, DTOP + 72, "6-10", { size: 9, font: FONT_HAND, fill: P.storm, len: 20 });
    // door frame + transom
    sk.rect(storeL, DX0 - 6, DTOP - 26, DX1 - DX0 + 12, 22, { fill: P.mist, stroke: ST, width: 3, seed: S(), wobble: 0.4 });
    txt(storeL, (DX0 + DX1) / 2, DTOP - 10, "PUSH", { size: 12, fill: P.slate, len: 34, ls: 2 });

    // right window (cracked, mostly whole) with taped notices, shelves faint behind
    const RW = { x: 652, y: 452, w: 190, h: 304 };
    sk.rect(storeL, RW.x, RW.y, RW.w, RW.h, { fill: P.slate, stroke: ST, width: LINE.main, seed: S(), wobble: 0.6 });
    const rin = clipTo(storeL, [[RW.x, RW.y], [RW.x + RW.w, RW.y], [RW.x + RW.w, RW.y + RW.h], [RW.x, RW.y + RW.h]]);
    sk.rect(rin, RW.x + 20, RW.y + 60, 110, 220, { fill: P.steel, stroke: P.storm, width: 2, seed: S(), double: false, opacity: 0.7 });
    lines(rin, [[RW.x + 20, RW.y + 120, RW.x + 130, RW.y + 120], [RW.x + 20, RW.y + 180, RW.x + 130, RW.y + 180], [RW.x + 20, RW.y + 240, RW.x + 130, RW.y + 240]], { stroke: P.storm, width: 3, opacity: 0.8 });
    sk.path(rin, [[RW.x + 150, RW.y + 40], [RW.x + 170, RW.y + 30], [RW.x + 186, RW.y + 60]], { stroke: P.mist, width: 2, seed: S(), double: false, opacity: 0.6 });
    sk.line(rin, RW.x + 24, RW.y + 200, RW.x + 84, RW.y + 120, { stroke: P.fog, width: 2.2, seed: S(), double: false, opacity: 0.5 }); // reflection
    sk.line(rin, RW.x + 54, RW.y + 220, RW.x + 110, RW.y + 146, { stroke: P.fog, width: 2.2, seed: S(), double: false, opacity: 0.35 });
    sk.path(rin, [[RW.x, RW.y + 176], [RW.x + 60, RW.y + 170], [RW.x + 120, RW.y + 178], [RW.x + RW.w, RW.y + 172], [RW.x + RW.w, RW.y + RW.h], [RW.x, RW.y + RW.h]], { closed: true, fill: P.steel, stroke: "none", seed: S(), double: false, opacity: 0.55 }); // silt film below the water mark
    glassStar(storeL, RW.x + 120, RW.y + 200, 70, S());
    sk.line(storeL, RW.x - 8, RW.y + RW.h + 6, RW.x + RW.w + 8, RW.y + RW.h + 6, { stroke: ST, width: LINE.main, seed: S() });
    [["ICE", RW.x + 30, RW.y + 16, -4], ["BAIT", RW.x + 92, RW.y + 18, 3]].forEach(([s, x, y, r]) => {
      const pg = el("g", { transform: `rotate(${r} ${x + 24} ${y + 16})` }, storeL);
      sk.rect(pg, x, y, 48, 30, { fill: P.paper, stroke: ST, width: 1.6, seed: S(), double: false, wobble: 0.3 });
      txt(pg, x + 24, y + 22, s, { size: 18, fill: P.storm, len: s.length * 9 });
    });
    const note = el("g", { transform: `rotate(-3 ${RW.x + 140} ${RW.y + 30})` }, storeL);
    sk.rect(note, RW.x + 140, RW.y + 14, 42, 52, { fill: P.paper, stroke: ST, width: 1.4, seed: S(), double: false, wobble: 0.3 });
    txt(note, RW.x + 161, RW.y + 32, "DRILL", { size: 10, font: FONT_HAND, fill: P.storm, len: 28 });
    txt(note, RW.x + 161, RW.y + 46, "SAT 10", { size: 9, font: FONT_HAND, fill: P.storm, len: 30 });

    // mud over the bulkheads below the windows + wall cracks
    lines(storeL, [[SX0 + 6, 770, SX0 + 26, 790], [SX0 + 40, 772, SX0 + 70, 794], [790, 776, 820, 792]], { stroke: P.slate, width: 2, opacity: 0.6 });
    sk.path(storeL, [[470, 420], [480, 460], [474, 500], [488, 540]], { stroke: P.storm, width: 2.5, seed: S(), double: false });
    sk.path(storeL, [[860, 360], [840, 400], [848, 430]], { stroke: P.storm, width: 2.5, seed: S(), double: false });
    // propane cage (left) knocked crooked, and an ice chest tipped over at the right corner
    const cage = el("g", { transform: "rotate(-6 60 800)" }, storeL);
    sk.rect(cage, 18, 650, 80, 150, { fill: "none", stroke: ST, width: 3, seed: S(), wobble: 0.5 });
    lines(cage, [[26, 650, 26, 800], [42, 650, 42, 800], [58, 650, 58, 800], [74, 650, 74, 800], [90, 650, 90, 800], [18, 700, 98, 700], [18, 750, 98, 750]], { stroke: ST, width: 1.8, opacity: 0.8 });
    [[38, 742], [76, 742]].forEach(([x, y]) => sk.rect(cage, x - 12, y - 40, 24, 54, { fill: P.mist, stroke: ST, width: 2, seed: S(), double: false, wobble: 0.4 }));
    txt(cage, 58, 676, "PROPANE", { size: 12, fill: P.storm, len: 60 });
    const ice = el("g", { transform: "rotate(-11 800 800)" }, storeL);
    sk.rect(ice, 790, 730, 110, 70, { fill: P.paper, stroke: ST, width: 3, seed: S(), wobble: 0.5 });
    txt(ice, 845, 776, "ICE", { size: 30, fill: P.steel, len: 50, ls: 2 });
    // FASCIA SIGN "DALE'S GAS & GROCERY" — left bracket holds, right bracket gave way so it hangs askew
    const signG = el("g", { class: "gs-sign", transform: "rotate(3.2 116 360)" }, storeL);
    sk.rect(signG, 104, 344, 742, 84, { fill: P.paper, stroke: ST, width: LINE.main, seed: S(), wobble: 0.8 });
    sk.rect(signG, 116, 354, 718, 64, { fill: "none", stroke: P.steel, width: 2.5, seed: S(), double: false, wobble: 0.5 });
    txt(signG, 475, 406, "DALE'S GAS & GROCERY", { size: 62, fill: P.storm, len: 660, ls: 3 });
    sk.hatch(signG, 106, 346, 738, 80, { gap: 34, angle: 75, stroke: P.mist, width: 3, opacity: 0.18, seed: S() });
    sk.path(signG, [[104, 410], [300, 414], [520, 408], [846, 412]], { stroke: P.steel, width: 3, seed: S(), double: false, opacity: 0.55 }); // grime
    lines(storeL, [[116, 340, 116, 360], [834, 336, 846, 348]], { stroke: ST, width: 5, opacity: 1 });
    sk.path(storeL, [[834, 340], [846, 352], [852, 344]], { stroke: ST, width: 3, seed: S(), double: false }); // snapped bracket
    sk.line(storeL, SX0 - 8, STOP, SX1 + 8, STOP, { stroke: ST, width: LINE.main + 2, seed: S() });

    // ------------------------------------------------------------------ CANOPY (tilted on a buckled column) + pumps
    const canL = layer("canopy");
    const CPX = 1182, CPY = 300, TILT = 4;
    // columns (left straight, right buckled) — drawn first, the canopy sits on them
    sk.rect(canL, CPX - 14, CPY, 28, 832 - CPY, { fill: P.fog, stroke: ST, width: 3.5, seed: S(), wobble: 0.5 });
    lines(canL, [[CPX - 6, CPY + 20, CPX - 6, 820]], { stroke: P.paper, width: 2, opacity: 0.6 });
    const rTop = rotPt([1700, CPY], CPX, CPY, TILT);
    const buck = [[1698, 834], [1702, 700], [1690, 640], [1716, 560], [1708, 480], [rTop[0], rTop[1]]];
    sk.path(canL, buck, { stroke: INK, width: 32, seed: S(), double: false, wobble: 0.6 });
    sk.path(canL, buck, { stroke: P.fog, width: 24, seed: S(), double: false, wobble: 0.6 });
    lines(canL, [[1688, 640, 1712, 634], [1694, 646, 1716, 652], [1712, 560, 1694, 566]], { stroke: ST, width: 2.5, opacity: 0.9 }); // crumple folds
    [[CPX, MUD - 6], [1700, MUD + 10]].forEach(([x, y]) => sk.path(canL, [[x - 14, y], [x + 14, y + 1]], { stroke: P.slate, width: 3, seed: S(), double: false, opacity: 0.9 }));
    // the canopy roof
    const canopyG = el("g", { class: "gs-canopy", transform: `rotate(${TILT} ${CPX} ${CPY})` }, canL);
    sk.poly(canopyG, [[1000, 226], [1890, 226], [1890, 300], [1000, 300]], { fill: P.mist, stroke: INK, width: LINE.main, seed: S(), wobble: 0.8 });
    sk.rect(canopyG, 1000, 226, 890, 18, { fill: P.slate, stroke: INK, width: 2.5, seed: S(), double: false });
    sk.rect(canopyG, 1000, 282, 890, 18, { fill: P.steel, stroke: INK, width: 2.5, seed: S(), double: false });
    txt(canopyG, 1445, 276, "DALE'S  ·  GAS  ·  DIESEL  ·  PROPANE", { size: 30, fill: P.storm, len: 560, ls: 2 });
    sk.hatch(canopyG, 1002, 244, 886, 38, { gap: 13, angle: 70, stroke: P.storm, width: 1.4, opacity: 0.15, seed: S() });
    // underside lights (one hanging by its wire)
    for (let i = 0; i < 6; i++) if (i !== 4) sk.rect(canopyG, 1050 + i * 140, 300, 60, 9, { fill: P.paper, stroke: INK, width: 1.6, seed: S(), double: false });
    sk.path(canopyG, [[1620, 300], [1626, 330], [1622, 352]], { stroke: INK, width: 1.6, seed: S(), double: false });
    sk.poly(canopyG, rotArr([[1594, 352], [1652, 352], [1652, 361], [1594, 361]], 1622, 352, 24), { fill: P.paper, stroke: INK, width: 1.6, seed: S(), double: false });
    // a torn panel flapping at the dropped end
    sk.poly(canopyG, [[1820, 300], [1890, 300], [1880, 340], [1836, 326]], { fill: P.steel, stroke: INK, width: 2.5, seed: S() });
    // pump island
    sk.path(canL, [[1150, 818], [1760, 818], [1768, 842], [1142, 842]], { closed: true, fill: P.mist, stroke: ST, width: 3, seed: S(), wobble: 0.5 });
    lines(canL, [[1300, 820, 1298, 840], [1450, 820, 1448, 840], [1600, 820, 1598, 840]], { stroke: ST, width: 1.6, opacity: 0.5 });
    // pump 0 — standing, tilted a little, mud line on it
    const pumpBody = (pg, x, y, o) => {
      sk.rect(pg, x - 30, y - 230, 60, 230, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
      sk.rect(pg, x - 34, y - 244, 68, 18, { fill: P.slate, stroke: INK, width: 2.5, seed: S(), double: false });
      sk.rect(pg, x - 20, y - 214, 40, 34, { fill: P.paper, stroke: INK, width: 2, seed: S(), double: false });
      lines(pg, [[x - 14, y - 202, x + 14, y - 202], [x - 14, y - 191, x + 8, y - 191]], { stroke: INK, width: 1.8, opacity: 0.6 });
      sk.rect(pg, x - 16, y - 166, 32, 50, { fill: P.slate, stroke: INK, width: 2, seed: S(), double: false });
      lines(pg, [[x - 9, y - 154, x + 9, y - 154], [x - 9, y - 142, x + 9, y - 142], [x - 9, y - 130, x + 9, y - 130]], { stroke: P.mist, width: 2, opacity: 0.6 });
      sk.rect(pg, x + 24, y - 160, 12, 26, { fill: INK, stroke: INK, width: 2, seed: S(), double: false });
      txt(pg, x, y - 60, "UNLEADED", { size: 11, fill: P.paper, len: 46 });
      sk.path(pg, [[x - 30, y - (BASE - MUD) + 20], [x + 30, y - (BASE - MUD) + 22]], { stroke: P.slate, width: 3, seed: S(), double: false });
      if (o && o.hose) sk.path(pg, [[x + 30, y - 148], [x + 50, y - 110], [x + 46, y - 40], [x + 36, y - 6]], { stroke: INK, width: 4, seed: S(), double: false });
    };
    const p0 = el("g", { class: "gs-pump", transform: "rotate(-4 1330 832)" }, canL);
    pumpBody(p0, 1330, 832, { hose: true });
    // pump 1 — knocked flat, lying to the right of its stub, hose trailing into the water
    const p1 = el("g", { class: "gs-pump gs-pump-down" }, canL);
    sk.rect(p1, 1536, 812, 48, 22, { fill: P.slate, stroke: INK, width: 3, seed: S(), wobble: 0.4 }); // sheared stub
    lines(p1, [[1544, 812, 1548, 800], [1560, 812, 1556, 798], [1574, 812, 1580, 802]], { stroke: INK, width: 2.5, opacity: 0.9 }); // torn pipes
    const pd = el("g", { transform: "rotate(80 1596 816)" }, p1);
    pumpBody(pd, 1596, 816, {});
    sk.path(p1, [[1800, 790], [1836, 812], [1846, 850], [1800, 884], [1730, 896], [1680, 888]], { stroke: INK, width: 4, seed: S(), double: false });
    sk.rect(p1, 1660, 880, 22, 10, { fill: INK, stroke: INK, width: 2, seed: S(), double: false }); // nozzle in the water

    // ------------------------------------------------------------------ BOAT HULL, POLE + DOWNED LINE, CAR (mid, between/around)
    const midL = layer("mid");
    // power pole leaning over the lot (behind the boat)
    const PX0 = 978, PBY = 796, LEAN = -10;
    const poleG = el("g", { class: "gs-pole" }, midL);
    const pTop = rotPt([PX0, 120], PX0, PBY, LEAN);
    sk.poly(poleG, rotArr([[PX0 - 9, 120], [PX0 + 9, 120], [PX0 + 13, PBY], [PX0 - 13, PBY]], PX0, PBY, LEAN), { fill: P.storm, stroke: INK, width: 3, seed: S(), wobble: 0.6 });
    const gr = [];
    for (let y = 170; y < PBY - 20; y += 40) { const a = rotPt([PX0 - 2, y], PX0, PBY, LEAN), b = rotPt([PX0 - 1, y + 20], PX0, PBY, LEAN); gr.push([a[0], a[1], b[0], b[1]]); }
    lines(poleG, gr, { stroke: P.mist, width: 1.4, opacity: 0.35 });
    const armA = rotPt([PX0 - 64, 138], PX0, PBY, LEAN), armB = rotPt([PX0 + 64, 138], PX0, PBY, LEAN);
    sk.path(poleG, [armA, armB], { stroke: INK, width: 9, seed: S(), double: false });
    sk.path(poleG, [armA, armB], { stroke: P.storm, width: 5, seed: S(), double: false });
    const tx = rotPt([PX0 + 14, 210], PX0, PBY, LEAN);
    sk.rect(poleG, tx[0], tx[1], 32, 48, { fill: P.steel, stroke: INK, width: 3, seed: S(), wobble: 0.5 });
    // mud heaped at its base (the ground gave way)
    sk.path(poleG, [[PX0 - 60, PBY + 6], [PX0 - 20, PBY - 18], [PX0 + 30, PBY - 12], [PX0 + 70, PBY + 6]], { closed: true, fill: P.slate, stroke: INK, width: 2.5, seed: S() });
    // wires: two still strung (sagging steeply), one down
    const wire = (a, b, sag, w) => {
      const pts = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)]); }
      sk.path(midL, pts, { stroke: INK, width: w || 2.4, seed: S(), double: false, wobble: 0.4, step: 60 });
    };
    wire(armA, [-30, 230], 70);
    wire(armB, [1960, 120], 110);
    wire([armB[0] - 30, armB[1]], [1960, 160], 130, 2);
    // the downed line: from the arm's left insulator, hanging to the ground behind the boat, then lying across
    // the lot (in front of the store) and ending in the puddle
    const LX0 = armA[0] + 4, LY0 = armA[1] + 4, LX1 = 432, LY1 = 930;
    const lineG = el("g", { class: "gs-downed-line" }, null); // appended to the front layer later
    sk.path(lineG, [[LX0, LY0], [LX0 + 6, LY0 + 140], [LX0 + 20, LY0 + 360], [LX0 + 44, 690], [LX0 + 40, 820], [LX0 + 6, 862], [800, 876], [700, 880], [620, 896], [540, 900], [480, 916], [452, 926], [LX1, LY1]],
      { stroke: INK, width: 3.4, seed: S(), double: false, wobble: 1.2, step: 18 });
    // the boat hull: an overturned skiff, keel up, washed against the store corner
    const BX = 980, BY = 836;
    const boatG = el("g", { class: "gs-boat", transform: `rotate(-7 ${BX} ${BY})` }, midL);
    sk.path(boatG, [[BX - 170, BY], [BX - 150, BY - 64], [BX - 60, BY - 92], [BX + 80, BY - 92], [BX + 170, BY - 70], [BX + 196, BY - 30], [BX + 180, BY]], { closed: true, fill: P.fog, stroke: INK, width: LINE.main, seed: S(), wobble: 0.8 });
    sk.path(boatG, [[BX - 150, BY - 64], [BX - 50, BY - 84], [BX + 90, BY - 84], [BX + 176, BY - 62]], { stroke: P.mist, width: 3, seed: S(), double: false });
    sk.path(boatG, [[BX - 160, BY - 30], [BX - 60, BY - 46], [BX + 80, BY - 46], [BX + 188, BY - 34]], { stroke: P.steel, width: 6, seed: S(), double: false, opacity: 0.8 }); // rub strake
    sk.path(boatG, [[BX - 60, BY - 92], [BX - 50, BY - 102], [BX + 70, BY - 102], [BX + 80, BY - 92]], { closed: true, fill: P.steel, stroke: INK, width: 2.5, seed: S(), double: false }); // keel
    sk.hatch(boatG, BX - 160, BY - 40, 350, 40, { gap: 9, angle: 30, stroke: P.slate, width: 1.4, opacity: 0.35, seed: S() });
    [[BX - 90, BY - 60], [BX - 70, BY - 54], [BX + 40, BY - 66], [BX + 110, BY - 58], [BX + 124, BY - 50]].forEach(([x, y]) => sk.circle(boatG, x, y, 3, { fill: P.mist, stroke: P.slate, width: 1.2, seed: S(), double: false })); // barnacles
    sk.path(boatG, [[BX - 120, BY - 70], [BX - 110, BY - 40], [BX - 96, BY - 52]], { stroke: INK, width: 2.5, seed: S(), double: false }); // hole stove in
    sk.path(boatG, [[BX - 132, BY - 66], [BX - 112, BY - 76], [BX - 96, BY - 60], [BX - 108, BY - 40], [BX - 126, BY - 46]], { closed: true, fill: P.night, stroke: INK, width: 2, seed: S(), double: false });
    txt(boatG, BX + 70, BY - 16, "WA 4417 GH", { size: 16, fill: P.slate, len: 86, ls: 1 });
    // the car, nosed into the buckled column (front crumpled), sitting in the water
    const CX = 1790, CY = 862;
    const carG = el("g", { class: "gs-car" }, midL);
    sk.path(carG, [[1712, CY - 20], [1708, CY - 74], [1736, CY - 86], [1790, CY - 92], [1830, CY - 150], [1960, CY - 156], [1960, CY - 10], [1712, CY - 6]], { closed: true, fill: P.mist, stroke: INK, width: LINE.main, seed: S(), wobble: 0.8 });
    sk.path(carG, [[1842, CY - 140], [1960, CY - 146], [1960, CY - 98], [1824, CY - 96]], { closed: true, fill: P.slate, stroke: INK, width: 3, seed: S(), double: false });
    glassStar(carG, 1866, CY - 120, 26, S());
    sk.path(carG, [[1712, CY - 74], [1726, CY - 62], [1716, CY - 50], [1730, CY - 38], [1714, CY - 24]], { stroke: INK, width: 3, seed: S(), double: false }); // crumpled nose
    sk.path(carG, [[1736, CY - 86], [1760, CY - 112], [1790, CY - 96]], { stroke: INK, width: 3, seed: S(), double: false }); // hood buckled up
    sk.rect(carG, 1716, CY - 66, 20, 12, { fill: P.paper, stroke: INK, width: 2, seed: S(), double: false }); // headlight
    sk.circle(carG, 1800, CY - 10, 34, { fill: P.night, stroke: INK, width: 3, seed: S() });
    sk.circle(carG, 1800, CY - 10, 14, { fill: P.steel, stroke: INK, width: 2, seed: S(), double: false });
    sk.path(carG, [[1712, CY - 44], [1960, CY - 50]], { stroke: P.slate, width: 3, seed: S(), double: false, opacity: 0.9 }); // mud line on the car
    lines(carG, [[1870, CY - 90, 1872, CY - 20], [1930, CY - 92, 1932, CY - 22]], { stroke: INK, width: 2, opacity: 0.7 });

    // ------------------------------------------------------------------ WATER: standing muddy water across the lot
    const waterL = layer("water");
    const waterG = el("g", { class: "gs-water" }, waterL);
    const wTop = [];
    for (let x = -20; x <= 1960; x += 40) wTop.push([x, WATER + Math.sin(x * 0.013) * 3 + (rnd(x) - 0.5) * 2]);
    const wPoly = wTop.concat([[1960, 1100], [-20, 1100]]);
    sk.path(waterG, wPoly, { closed: true, fill: P.steel, stroke: "none", seed: S(), double: false, wobble: 0.6 });
    sk.path(waterG, wTop, { stroke: P.storm, width: 2.5, seed: S(), double: false, opacity: 0.9 });
    // the oily sheen: a few long soft bands (lighter, wavy) across the surface
    [[300, 880, 260, 0.3], [1150, 900, 340, 0.28], [760, 960, 220, 0.22], [1560, 990, 300, 0.2]].forEach(([cx, cy, w, op], i) => {
      const pts = [];
      for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push([cx - w / 2 + w * t, cy + Math.sin(t * Math.PI * 2 + i) * 4 - Math.sin(t * Math.PI) * 6]); }
      for (let k = 10; k >= 0; k--) { const t = k / 10; pts.push([cx - w / 2 + w * t, cy + Math.sin(t * Math.PI * 2 + i + 0.6) * 4 + Math.sin(t * Math.PI) * 5]); }
      sk.path(waterG, pts, { closed: true, fill: P.fog, stroke: "none", seed: S(), double: false, opacity: op });
      sk.path(waterG, pts.slice(0, 11), { stroke: P.paper, width: 1.6, seed: S(), double: false, opacity: op * 1.6 });
    });
    // reflections of the store + canopy (broken vertical streaks), ripples
    const refl = [];
    for (let x = 100; x < 860; x += 13) refl.push([x, WATER + 8 + (x % 3) * 3, x + 1, WATER + 26 + ((x * 7) % 30)]);
    for (let x = 1010; x < 1880; x += 17) refl.push([x, WATER + 6, x + 1, WATER + 18 + ((x * 11) % 22)]);
    lines(waterG, refl, { stroke: P.fog, width: 2, opacity: 0.25 });
    // soft mirrored blocks under the big shapes (store windows, door, boat, canopy columns, car)
    const reflG = el("g", { opacity: 0.32 }, waterG);
    [[124, 460, P.slate, 70], [500, 612, P.storm, 90], [652, 842, P.slate, 60], [1168, 1196, P.fog, 120], [1684, 1716, P.fog, 110], [800, 1150, P.fog, 40], [1712, 1960, P.mist, 50]].forEach(([x0, x1, c, h], i) => {
      const pts = [[x0, WATER + 2], [x1, WATER + 2]];
      for (let k = 0; k <= 6; k++) { const t = k / 6; pts.push([x1 - (x1 - x0) * t + Math.sin(k * 2.1 + i) * 6, WATER + h * (0.75 + 0.25 * rnd(i * 9 + k))]); }
      sk.path(reflG, pts, { closed: true, fill: c, stroke: "none", seed: S(), double: false });
    });
    const breaks = [];
    for (let y = WATER + 10; y < WATER + 120; y += 9) breaks.push([0, y, 1920, y]);
    lines(reflG, breaks, { stroke: P.steel, width: 3, opacity: 1 });
    // oil sheen: thin contour rings drifting on the surface
    [[640, 900, 150, 16], [1240, 922, 190, 16]].forEach(([cx, cy, rx, ry], i) => {
      [1, 0.72, 0.45].forEach((k, j) => sk.path(waterG, ellPts(cx + j * 8, cy + j * 2, rx * k, ry * k, 20).map((p, m) => [p[0] + Math.sin(m * 1.3 + i) * 6 * k, p[1]]), { closed: true, stroke: j === 1 ? P.paper : P.fog, width: 1.6, seed: S(), double: false, opacity: 0.45 - j * 0.08 }));
    });
    const rip = [];
    for (let i = 0; i < 46; i++) { const x = (i * 211) % 1900, y = WATER + 10 + ((i * 37) % 80); rip.push([x, y, x + 26 + (i % 4) * 10, y + 0.5]); }
    lines(waterG, rip, { stroke: P.mist, width: 2, opacity: 0.45 });
    // the puddle where the downed line ends: a deeper, glassier patch
    sk.path(waterG, ellPts(LX1 + 10, LY1 + 4, 120, 18, 22), { closed: true, fill: P.mist, stroke: P.storm, width: 2, seed: S(), double: false, opacity: 0.6 });
    lines(waterG, [[LX1 - 70, LY1 - 2, LX1 - 20, LY1 - 2], [LX1 + 30, LY1 + 8, LX1 + 90, LY1 + 8], [LX1 - 40, LY1 + 12, LX1, LY1 + 12]], { stroke: P.paper, width: 1.8, opacity: 0.6 });
    // waterlines lapping the island, boat, car, columns (things stand IN the water)
    [[1142, 1768, 842], [790, 1180, 840], [1712, 1960, 852], [-20, 120, 818]].forEach(([x0, x1, y]) => sk.path(waterG, [[x0, y], [(x0 + x1) / 2, y + 2], [x1, y]], { stroke: P.fog, width: 2, seed: S(), double: false, opacity: 0.55 }));
    // mud islands breaking the sheet (sit higher, darker)
    [[200, 868, 120, 10], [1290, 878, 150, 12], [1000, 930, 90, 8]].forEach(([cx, cy, rx, ry]) => {
      sk.path(waterG, ellPts(cx, cy, rx, ry, 18).map((p, k) => [p[0] + (rnd(k + cx) - 0.5) * 12, p[1] + (rnd(k + cy) - 0.5) * 4]), { closed: true, fill: P.slate, stroke: P.storm, width: 2, seed: S(), double: false });
      lines(waterG, [[cx - rx * 0.5, cy - 2, cx - rx * 0.1, cy - 3], [cx + rx * 0.1, cy + 1, cx + rx * 0.5, cy]], { stroke: P.steel, width: 2, opacity: 0.8 });
    });
    // bottom (caption zone): calm, low detail
    lines(waterG, [[80, 990, 300, 991], [620, 1030, 900, 1031], [1260, 1010, 1500, 1011], [1640, 1050, 1860, 1051]], { stroke: P.mist, width: 2, opacity: 0.35 });

    // ------------------------------------------------------------------ FRONT: debris, the downed line, a leaning post
    const frontL = layer("front");
    // planks + junk floating / grounded (kept to the sides and low; the centre stays clear for the figures)
    plank(frontL, 10, 890, 200, -6, 16, { nail: true });
    plank(frontL, 210, 892, 140, 10, 14);
    plank(frontL, 1400, 888, 180, 8, 16, { nail: true });
    plank(frontL, 1640, 906, 220, -4, 18);
    plank(frontL, 820, 832, 120, -18, 12);
    plank(frontL, 1080, 846, 140, 6, 12);
    // a floating cooler lid, a tire, a crab pot, a bobbing bottle (story junk)
    sk.path(frontL, ellPts(1560, 922, 32, 10, 16), { closed: true, fill: P.night, stroke: INK, width: 3, seed: S(), double: false });
    sk.path(frontL, ellPts(1560, 920, 14, 5, 12), { closed: true, fill: P.slate, stroke: INK, width: 2, seed: S(), double: false });
    sk.rect(frontL, 70, 840, 60, 34, { fill: P.slate, stroke: INK, width: 2.5, seed: S(), wobble: 0.4 });
    lines(frontL, [[80, 842, 80, 872], [94, 842, 94, 872], [108, 842, 108, 872], [120, 842, 120, 872], [72, 857, 128, 857]], { stroke: P.mist, width: 1.4, opacity: 0.7 });
    sk.rect(frontL, 1188, 902, 26, 10, { fill: P.fog, stroke: INK, width: 1.6, seed: S(), double: false, wobble: 0.3 });
    // the downed line on top of everything on the ground
    frontL.appendChild(lineG);
    // its frayed end in the puddle
    lines(frontL, [[LX1, LY1, LX1 - 12, LY1 - 8], [LX1, LY1, LX1 - 14, LY1 + 2], [LX1, LY1, LX1 - 8, LY1 + 8]], { stroke: INK, width: 2, opacity: 0.9 });
    sk.path(frontL, ellPts(LX1 - 4, LY1 + 2, 20, 4, 12), { closed: true, stroke: P.fog, width: 1.6, seed: S(), double: false, opacity: 0.7 });

    // vignette (moody edges, daylight-gentle)
    const vg = el("radialGradient", { id: uid + "vig", cx: 0.5, cy: 0.5, r: 0.75 }, defs);
    [[0.6, 0], [1, 0.42]].forEach(([o, a]) => el("stop", { offset: o, "stop-color": P.night, "stop-opacity": a }, vg));
    el("rect", { x: -40, y: -40, width: 2000, height: 1160, fill: `url(#${uid}vig)`, "pointer-events": "none" }, g);

    // layer order: sky, far, lot, store, canopy, mid, water, front (the water laps over the bases)
    g.insertBefore(lotL, storeL);

    return {
      g,
      groundY: GROUND,
      store: { g: storeL, doorX: (DX0 + DX1) / 2, doorY: BASE, windowRect: WR, door: { g: doorG, x0: DX0, x1: DX1, topY: DTOP }, sign: { g: signG }, mudLineY: MUD },
      canopy: { g: canopyG, pivotX: CPX, pivotY: CPY, tilt: TILT },
      pumps: [{ g: p0, x: 1330, y: 832, down: false }, { g: p1, x: 1560, y: 832, down: true }],
      powerLine: { g: lineG, x0: +LX0.toFixed(1), y0: +LY0.toFixed(1), x1: LX1, y1: LY1, pole: { g: poleG, x: PX0, baseY: PBY } },
      water: { g: waterG, y: WATER },
      smokeOrigin: { x: 713, y: 290 },
      pallet: { x: PX, y: PY },
      boat: { g: boatG, x: BX, y: BY },
      car: { g: carG, x: CX, y: CY },
      layers: { sky: skyL, far: farL, store: storeL, canopy: canL, lot: lotL, water: waterL, front: frontL, mid: midL },
    };
  };
})();
