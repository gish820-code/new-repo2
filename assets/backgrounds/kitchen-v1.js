/* Rainy Day background — `kitchen` v1: Drizzle's kitchen (interior, gray morning, rain outside).
 *
 * Paste VERBATIM into a scene's <template><script> right AFTER assets/characters/rainy-day-rig-v1.js.
 *   const bg = window.RainyDayBG.kitchen(bgLayer, { mess: 0 });   // bgLayer: a <g> in <svg viewBox="0 0 1920 1080">
 *
 * OPTS
 *   mess: 0 | 1   0 = tidy morning (default). 1 = after the quake: plates smashed on the floor, cabinet doors
 *                 hanging open, right chair tipped over, plaster cracks, picture askew, plant/pot/jar knocked over.
 *
 * LAYOUT (left → right): fridge (doodle magnets, cabinet above) · framed picture · WINDOW over the TABLE (gray
 * harbor + rain sky) with the pendant LAMP · calendar · counter run (open shelf of plates/jars/mugs, upper
 * cabinet, stove + kettle + pot, range hood) · wall CLOCK · coat hooks + BENCH · FRONT DOOR at right.
 * Floor: perspective planks; the bottom 140px (y ≥ 940) is kept plain for the caption bar.
 *
 * HANDLES (all coordinates in canvas px)
 *   g                 the whole background <g>
 *   groundY  = 880    floor line where standing feet go (figure y = groundY - 116*scale; scale 1.4 → y 717.6)
 *   wall              <g> back wall (plaster, wainscot, window, wall decor) — static
 *   windowRect        { x: 470, y: 200, w: 360, h: 270 } glass area; clip a RainyDay.rain layer into it
 *   window            { g, glassG }  glassG = the outside view (sky/harbor) group, under the mullions
 *   table             { x0: 340, x1: 1000, topY: 528, legXs: [376, 418, 922, 964], g, frontLegsG, underY: 560,
 *                       floorY: 880 }
 *                     topY = front edge of the tabletop; underY = underside of the apron (clear height 320px).
 *                     Under-table clear span between the front legs: x 392 – 948. Two crouched/cover figures at
 *                     scale 1.4 fit, e.g. x 480 (facing 1) and x 760 (facing 1) with y 717.6.
 *                     frontLegsG = the two front legs as their own <g>: re-append it ABOVE the figure layer to
 *                     make figures read as "under" the table (optional).
 *   lamp              { g, pivotX: 670, pivotY: 0 } pendant lamp + glow; rotate about the pivot
 *                     (gsap: { rotation, svgOrigin: "670 0" }).
 *   door              { x: 1650, y: 360, w: 210, h: 422, g, knob: { x: 1676, y: 590 } }
 *   bench             { x: 1520, y: 690, g }  seat-top center; RainyDay.goBag(parent, bench.x, bench.y, 1.2) sits on it
 *   hook              { x: 1560, y: 462 }  coat-hook peg tip (empty peg for the slicker/bag strap)
 *   clock             { g, cx: 1530, cy: 232, r: 46, hands: { hourG, minuteG } } hands rotate about (cx, cy)
 *   fallables         [ { g, x, y, kind } ] separate groups the scene can drop/topple, each drawn in place
 *                     (x, y = base/pivot point). kinds: "plates" (shelf stack), "jar" (shelf), "mug" (shelf),
 *                     "kettle" (stove), "pot" (stove), "plant" (window sill), "picture" (wall, hangs from its nail).
 *                     With mess: 1 they are drawn already fallen / askew (same handles, same x/y anchors).
 *   chairs            [ { g, x, y } ] left + right chair (right one tipped over when mess: 1)
 *   stove             { g, x: 1180, w: 180, topY: 606 },  counter: { g, x0: 1010, x1: 1430, topY: 606 }
 *   fridge            { g, x: 20, y: 290, w: 210, h: 492 }
 *   cracks            <g> plaster cracks (present only with mess: 1; null otherwise)
 *
 * Deterministic and static: no randomness, no time, no timeline. Uses only RainyDay.el + RainyDay.sk + palette.
 */
(function () {
  window.RainyDayBG = window.RainyDayBG || {};
  if (window.RainyDayBG.kitchen) return;

  window.RainyDayBG.kitchen = function (parent, opts) {
    opts = opts || {};
    const RD = window.RainyDay;
    const P = RD.palette, LW = RD.LINE, sk = RD.sk, el = RD.el, INK = P.ink;
    const mess = opts.mess ? 1 : 0;
    window.RainyDayBG._kitchenN = (window.RainyDayBG._kitchenN || 0) + 1;
    const uid = "rdk" + window.RainyDayBG._kitchenN;
    let seedN = 7000;
    const S = () => (seedN += 7);
    const MAIN = LW.main, DET = LW.detail;
    const FONT = "Kalam, 'Comic Sans MS', cursive";

    const GROUND = 880, WALL_BASE = 782, VPX = 960, VPY = 360;
    const g = el("g", { class: "rd-bg rd-bg-kitchen" }, parent);
    const defs = el("defs", {}, g);

    // ---------- gradients (palette only)
    const lin = (id, x1, y1, x2, y2, stops) => {
      const gr = el("linearGradient", { id, x1, y1, x2, y2 }, defs);
      stops.forEach(([o, c, op]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": op === undefined ? 1 : op }, gr));
    };
    const rad = (id, cx, cy, r, stops, extra) => {
      const gr = el("radialGradient", Object.assign({ id, cx, cy, r, gradientUnits: "userSpaceOnUse" }, extra || {}), defs);
      stops.forEach(([o, c, op]) => el("stop", { offset: o, "stop-color": c, "stop-opacity": op === undefined ? 1 : op }, gr));
    };
    lin(uid + "sky", 0, 0, 0, 1, [[0, P.slate], [0.55, P.steel], [1, P.mist]]);
    lin(uid + "sea", 0, 0, 0, 1, [[0, P.steel], [1, P.slate]]);
    lin(uid + "floor", 0, 0, 0, 1, [[0, P.slate], [0.35, P.steel], [1, P.slate]]);
    lin(uid + "wall", 0, 0, 0, 1, [[0, P.slate], [0.25, P.steel], [1, P.mist]]);
    rad(uid + "glow", 670, 470, 560, [[0, P.paper, 0.32], [0.45, P.fog, 0.12], [1, P.fog, 0]]);
    rad(uid + "vig", 900, 520, 1250, [[0.55, P.night, 0], [1, P.night, 0.72]]);
    rad(uid + "under", 670, 870, 340, [[0, P.night, 0.42], [1, P.night, 0]], { gradientTransform: "translate(670 870) scale(1 0.32) translate(-670 -870)" });
    rad(uid + "winlight", 650, 560, 520, [[0, P.fog, 0.22], [1, P.fog, 0]]);

    const text = (par, x, y, str, o) => {
      o = o || {};
      const t = el("text", { x, y, "font-family": o.font || FONT, "font-size": o.size || 18, "font-weight": o.weight || 700, fill: o.fill || INK, "text-anchor": o.anchor || "middle", opacity: o.opacity !== undefined ? o.opacity : 1 }, par);
      if (o.rotate) t.setAttribute("transform", `rotate(${o.rotate} ${x} ${y})`);
      t.textContent = str;
      return t;
    };
    const fillRect = (par, x, y, w, h, fill, op) => el("rect", { x, y, width: w, height: h, fill, opacity: op === undefined ? 1 : op }, par);
    const floorX = (xb, y) => VPX + (xb - VPX) * (y - VPY) / (WALL_BASE - VPY); // perspective floor line

    // =====================================================================================================
    // WALL
    const wall = el("g", { class: "rd-k-wall" }, g);
    fillRect(wall, 0, 0, 1920, WALL_BASE + 4, `url(#${uid}wall)`);
    // ceiling band + crown beam
    sk.poly(wall, [[-10, -10], [1930, -10], [1930, 54], [-10, 58]], { fill: P.night, width: MAIN, seed: S(), wobble: 1 });
    sk.line(wall, -10, 64, 1930, 60, { width: DET, seed: S(), opacity: 0.6 });
    for (let x = 30; x < 1920; x += 160) sk.line(wall, x, 6, x + 40, 50, { width: DET, stroke: P.slate, seed: S(), opacity: 0.6, double: false });
    // faint wallpaper: small hand-drawn rain-drop/diamond pattern (low contrast)
    const paperG = el("g", { opacity: 0.16 }, wall);
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 24; col++) {
        const x = 30 + col * 82 + (row % 2) * 41, y = 100 + row * 70;
        el("path", { d: `M${x} ${y - 8} L${x + 5} ${y} L${x} ${y + 8} L${x - 5} ${y} Z`, fill: "none", stroke: P.night, "stroke-width": 1.6 }, paperG);
      }
    }
    // wall shading near the ceiling + right corner
    sk.hatch(wall, 0, 58, 1920, 70, { gap: 12, angle: 60, opacity: 0.12, seed: S() });
    // wainscot (vertical boards) from chair rail down
    const RAIL = 600;
    fillRect(wall, 0, RAIL, 1920, WALL_BASE - RAIL, P.steel);
    for (let x = 0; x < 1920; x += 46) sk.line(wall, x, RAIL + 14, x, WALL_BASE, { width: DET, stroke: P.slate, seed: S(), double: false, opacity: 0.8 });
    sk.hatch(wall, 0, RAIL + 14, 1920, WALL_BASE - RAIL - 14, { gap: 18, angle: 80, opacity: 0.1, seed: S() });
    sk.poly(wall, [[-10, RAIL - 4], [1930, RAIL - 6], [1930, RAIL + 12], [-10, RAIL + 14]], { fill: P.mist, width: DET + 1, seed: S() });
    // baseboard
    sk.poly(wall, [[-10, WALL_BASE - 22], [1930, WALL_BASE - 24], [1930, WALL_BASE + 4], [-10, WALL_BASE + 4]], { fill: P.slate, width: MAIN, seed: S() });

    // =====================================================================================================
    // FLOOR (perspective planks; bottom 140px kept calm)
    const floor = el("g", { class: "rd-k-floor" }, g);
    el("path", { d: `M-10 ${WALL_BASE} L1930 ${WALL_BASE} L1930 1090 L-10 1090 Z`, fill: `url(#${uid}floor)` }, floor);
    for (let xb = -1400; xb <= 3300; xb += 96) {
      const x2 = floorX(xb, 1080);
      sk.line(floor, xb, WALL_BASE + 4, x2, 1080, { width: DET, stroke: P.night, seed: S(), opacity: 0.55, double: false, wobble: 1.2 });
    }
    // staggered plank ends
    [[818, 0], [858, 1], [910, 2]].forEach(([y, r]) => {
      for (let k = -14; k < 34; k++) {
        if ((k + r * 2) % 3 !== 0) continue;
        const xa = floorX(-1400 + k * 96, y), xb2 = floorX(-1400 + (k + 1) * 96, y);
        if (xb2 < 0 || xa > 1920) continue;
        sk.line(floor, xa, y, xb2, y, { width: DET, stroke: P.night, seed: S(), opacity: 0.45, double: false });
      }
    });
    // wood grain flecks in the back half only
    for (let i = 0; i < 46; i++) {
      const xb = -300 + i * 57, y = 796 + ((i * 37) % 70);
      const x = floorX(xb, y);
      if (x < 0 || x > 1920) continue;
      el("path", { d: `M${x.toFixed(1)} ${y} q 10 -2 22 1`, stroke: P.mist, "stroke-width": 1.5, fill: "none", opacity: 0.35 }, floor);
    }
    // window light falling on the floor + under-table pool of shadow
    el("path", { d: `M470 ${WALL_BASE} L830 ${WALL_BASE} L1010 1000 L360 1000 Z`, fill: `url(#${uid}winlight)` }, floor);
    // rug under the table
    const rugG = el("g", {}, floor);
    sk.poly(rugG, [[300, 846], [1040, 846], [1110, 930], [230, 930]], { fill: P.slate, width: MAIN, seed: S(), opacity: 0.9 });
    sk.poly(rugG, [[330, 856], [1012, 856], [1068, 920], [272, 920]], { fill: "none", stroke: P.mist, width: DET, seed: S(), opacity: 0.6 });
    for (let i = 0; i < 12; i++) {
      const x = 250 + i * 76;
      el("path", { d: `M${x} 931 l -4 10 M${x + 18} 931 l -2 10`, stroke: P.slate, "stroke-width": 2, opacity: 0.7 }, rugG);
    }
    el("rect", { x: 200, y: 780, width: 960, height: 160, fill: `url(#${uid}under)` }, floor);
    // doormat at the door
    sk.poly(floor, [[1630, 800], [1880, 800], [1905, 842], [1610, 842]], { fill: P.slate, width: MAIN, seed: S() });
    text(floor, 1758, 832, "HELLO, RAIN", { size: 20, fill: P.fog, opacity: 0.75 });

    // =====================================================================================================
    // FRIDGE (far left) + cabinet above it
    const fridgeG = el("g", { class: "rd-k-fridge" }, g);
    const FX = 20, FY = 290, FW = 210, FH = WALL_BASE - FY;
    sk.rect(fridgeG, FX, FY, FW, FH, { fill: P.fog, width: MAIN, seed: S() });
    sk.hatch(fridgeG, FX + FW - 34, FY + 4, 30, FH - 8, { gap: 9, angle: 70, opacity: 0.25, seed: S() });
    sk.line(fridgeG, FX + 2, FY + 150, FX + FW - 2, FY + 152, { width: MAIN, seed: S() });
    sk.rect(fridgeG, FX + FW - 28, FY + 40, 10, 80, { fill: P.mist, width: DET + 1, seed: S() });
    sk.rect(fridgeG, FX + FW - 28, FY + 180, 10, 120, { fill: P.mist, width: DET + 1, seed: S() });
    sk.rect(fridgeG, FX + 8, WALL_BASE - 16, FW - 16, 12, { fill: P.slate, width: DET, seed: S() });
    // doodle magnets
    const doodle = el("g", {}, fridgeG);
    sk.rect(doodle, 46, 316, 74, 92, { fill: P.paper, width: DET, seed: S() }); // kid drawing: house in rain
    el("path", { d: "M58 384 l 0 -24 l 22 -16 l 22 16 l 0 24 Z M76 384 l0 -12 l 8 0 l0 12", fill: "none", stroke: INK, "stroke-width": 2 }, doodle);
    el("path", { d: "M56 330 q 10 -10 22 -2 q 12 -8 22 2 q 10 6 -2 10 l -40 0 q -10 -4 -2 -10", fill: P.mist, stroke: INK, "stroke-width": 2 }, doodle);
    for (let i = 0; i < 5; i++) el("line", { x1: 62 + i * 9, y1: 344, x2: 58 + i * 9, y2: 352, stroke: P.steel, "stroke-width": 2 }, doodle);
    sk.circle(doodle, 83, 316, 6, { fill: P.slate, width: DET, seed: S() });
    // tide-table note
    sk.rect(doodle, 136, 330, 66, 80, { fill: P.paper, width: DET, seed: S() });
    text(doodle, 169, 350, "TIDES", { size: 15 });
    for (let i = 0; i < 4; i++) sk.line(doodle, 144, 362 + i * 11, 194 - (i % 2) * 12, 362 + i * 11, { width: 1.5, seed: S(), double: false, opacity: 0.7 });
    sk.circle(doodle, 169, 330, 6, { fill: P.steel, width: DET, seed: S() });
    // stick-figure doodle + shopping list on the lower door
    sk.rect(doodle, 42, 470, 80, 100, { fill: P.paper, width: DET, seed: S() });
    el("path", { d: "M82 494 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0 M82 503 l 0 26 M82 529 l -10 18 M82 529 l 10 18 M82 512 l -14 8 M82 512 l 14 -10", fill: "none", stroke: INK, "stroke-width": 2.4, "stroke-linecap": "round" }, doodle);
    text(doodle, 82, 563, "ME + GRAN", { size: 12 });
    sk.rect(doodle, 54, 466, 14, 10, { fill: P.slate, width: DET, seed: S() });
    sk.rect(doodle, 132, 486, 66, 112, { fill: P.fog, width: DET, seed: S() });
    text(doodle, 165, 506, "BUY:", { size: 14 });
    ["batteries", "water", "beans"].forEach((w, i) => text(doodle, 165, 528 + i * 20, w, { size: 13, weight: 400 }));
    sk.circle(doodle, 165, 486, 6, { fill: P.night, width: DET, seed: S() });
    sk.circle(doodle, 72, 640, 9, { fill: P.slate, width: DET, seed: S() });
    sk.circle(doodle, 150, 690, 8, { fill: P.steel, width: DET, seed: S() });
    // cabinet above the fridge
    const fcab = el("g", {}, fridgeG);
    sk.rect(fcab, 14, 140, 222, 130, { fill: P.steel, width: MAIN, seed: S() });
    if (!mess) {
      sk.line(fcab, 125, 144, 125, 266, { width: DET + 1, seed: S() });
      sk.rect(fcab, 30, 154, 84, 102, { fill: "none", width: DET, seed: S(), opacity: 0.7 });
      sk.rect(fcab, 136, 154, 84, 102, { fill: "none", width: DET, seed: S(), opacity: 0.7 });
      sk.circle(fcab, 112, 236, 4, { fill: P.fog, width: DET, seed: S() });
      sk.circle(fcab, 138, 236, 4, { fill: P.fog, width: DET, seed: S() });
    } else {
      // doors swung open: dark interior + two doors flapped out in perspective
      sk.rect(fcab, 22, 148, 206, 114, { fill: P.night, width: DET, seed: S() });
      sk.line(fcab, 22, 205, 228, 205, { width: DET, stroke: P.slate, seed: S() });
      sk.rect(fcab, 50, 182, 30, 22, { fill: P.slate, width: DET, seed: S(), opacity: 0.8 });
      sk.poly(fcab, [[14, 140], [-30, 128], [-30, 284], [14, 270]], { fill: P.steel, width: MAIN, seed: S() });
      sk.poly(fcab, [[236, 140], [286, 122], [286, 290], [236, 270]], { fill: P.mist, width: MAIN, seed: S() });
      sk.hatch(fcab, 240, 130, 44, 150, { gap: 9, angle: 75, opacity: 0.25, seed: S() });
    }

    // =====================================================================================================
    // WINDOW (above the table) — view: storm sky, gray harbor, breakwater, a little boat
    const windowRect = { x: 470, y: 200, w: 360, h: 270 };
    const W = windowRect;
    const windowG = el("g", { class: "rd-k-window" }, wall);
    sk.rect(windowG, W.x - 22, W.y - 22, W.w + 44, W.h + 44, { fill: P.fog, width: MAIN, seed: S() });
    const glassG = el("g", {}, windowG);
    const wclip = el("clipPath", { id: uid + "wclip" }, defs);
    el("rect", { x: W.x, y: W.y, width: W.w, height: W.h }, wclip);
    glassG.setAttribute("clip-path", `url(#${uid}wclip)`);
    fillRect(glassG, W.x, W.y, W.w, W.h, `url(#${uid}sky)`);
    // heavy clouds
    [[500, 236, 70, 22], [600, 222, 90, 26], [730, 240, 80, 22], [810, 226, 60, 20], [660, 262, 120, 16]].forEach(([cx, cy, rx, ry], i) => {
      el("ellipse", { cx, cy, rx, ry, fill: i % 2 ? P.storm : P.slate, opacity: 0.85 }, glassG);
    });
    // far headland + fir silhouettes
    el("path", { d: `M${W.x} 352 Q 540 318 600 334 Q 650 320 700 340 L 760 330 Q 800 322 ${W.x + W.w} 342 L ${W.x + W.w} 380 L ${W.x} 380 Z`, fill: P.slate, opacity: 0.9 }, glassG);
    for (let i = 0; i < 12; i++) {
      const x = 480 + i * 30 + (i % 3) * 5, b = 346 - (i % 2) * 6 + (i > 6 ? 0 : -6), h = 22 + (i % 4) * 5;
      el("path", { d: `M${x - 7} ${b} L${x} ${b - h} L${x + 7} ${b} Z`, fill: P.storm, opacity: 0.9 }, glassG);
    }
    // harbor water
    fillRect(glassG, W.x, 370, W.w, 100, `url(#${uid}sea)`);
    for (let i = 0; i < 9; i++) el("path", { d: `M${480 + (i * 47) % 330} ${384 + i * 9} q 14 -3 28 0`, stroke: P.mist, "stroke-width": 1.6, fill: "none", opacity: 0.6 }, glassG);
    // breakwater + light post
    el("path", { d: "M470 412 L 640 404 L 642 414 L 470 424 Z", fill: P.storm }, glassG);
    el("path", { d: "M628 404 l 0 -30 l 8 0 l 0 30 Z", fill: P.storm }, glassG);
    el("circle", { cx: 632, cy: 370, r: 5, fill: P.fog, opacity: 0.9 }, glassG);
    // little moored boat
    el("path", { d: "M730 400 l 50 0 l -8 10 l -36 0 Z M752 400 l 0 -30 M752 372 l 16 22", fill: P.night, stroke: P.night, "stroke-width": 2.5 }, glassG);
    // misty rain haze on the glass
    sk.hatch(glassG, W.x, W.y, W.w, W.h, { gap: 22, angle: 78, stroke: P.fog, width: 1.5, opacity: 0.16, seed: S() });
    // frame: mullions + sash + sill
    const frameG = el("g", {}, windowG);
    sk.rect(frameG, W.x, W.y, W.w, W.h, { fill: "none", width: MAIN + 2, seed: S() });
    sk.line(frameG, W.x + W.w / 2, W.y, W.x + W.w / 2, W.y + W.h, { width: MAIN + 4, stroke: P.fog, seed: S(), double: false });
    sk.line(frameG, W.x + W.w / 2, W.y, W.x + W.w / 2, W.y + W.h, { width: DET, seed: S() });
    sk.line(frameG, W.x, W.y + 128, W.x + W.w, W.y + 128, { width: MAIN + 2, stroke: P.fog, seed: S(), double: false });
    sk.line(frameG, W.x, W.y + 128, W.x + W.w, W.y + 128, { width: DET, seed: S() });
    sk.poly(frameG, [[W.x - 36, W.y + W.h + 14], [W.x + W.w + 36, W.y + W.h + 14], [W.x + W.w + 30, W.y + W.h + 30], [W.x - 30, W.y + W.h + 30]], { fill: P.paper, width: MAIN, seed: S() });
    // café curtain rod + tied curtains
    sk.line(frameG, W.x - 50, W.y - 34, W.x + W.w + 50, W.y - 34, { width: MAIN, seed: S() });
    sk.circle(frameG, W.x - 54, W.y - 34, 7, { fill: P.slate, width: DET, seed: S() });
    sk.circle(frameG, W.x + W.w + 54, W.y - 34, 7, { fill: P.slate, width: DET, seed: S() });
    sk.poly(frameG, [[W.x - 44, W.y - 30], [W.x + 14, W.y - 30], [W.x - 4, W.y + 150], [W.x + 6, W.y + 300], [W.x - 40, W.y + 300], [W.x - 30, W.y + 150]], { fill: P.mist, width: MAIN, seed: S() });
    sk.poly(frameG, [[W.x + W.w - 14, W.y - 30], [W.x + W.w + 44, W.y - 30], [W.x + W.w + 30, W.y + 150], [W.x + W.w + 40, W.y + 300], [W.x + W.w - 6, W.y + 300], [W.x + W.w + 4, W.y + 150]], { fill: P.mist, width: MAIN, seed: S() });
    [[W.x - 30, W.x - 4], [W.x + W.w + 4, W.x + W.w + 30]].forEach(([a, b]) => {
      for (let k = 1; k < 4; k++) sk.line(frameG, a + (b - a) * k / 4, W.y - 22, a + (b - a) * k / 4 + 2, W.y + 140, { width: DET, seed: S(), opacity: 0.45, double: false });
      sk.line(frameG, a - 4, W.y + 150, b + 4, W.y + 150, { width: MAIN, stroke: P.slate, seed: S() });
    });

    // =====================================================================================================
    // WALL DECOR: picture (fallable), calendar, light switch, outlet, cracks
    const decor = el("g", {}, wall);
    // calendar
    sk.rect(decor, 876, 222, 92, 120, { fill: P.paper, width: DET + 1, seed: S() });
    sk.rect(decor, 876, 222, 92, 34, { fill: P.steel, width: DET + 1, seed: S() });
    text(decor, 922, 247, "OCT", { size: 20, fill: P.paper });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) el("rect", { x: 884 + c * 16, y: 264 + r * 18, width: 12, height: 13, fill: "none", stroke: INK, "stroke-width": 1, opacity: 0.6 }, decor);
    el("path", { d: "M914 300 m -9 0 a 9 7 0 1 0 18 0 a 9 7 0 1 0 -18 0", fill: "none", stroke: INK, "stroke-width": 2.2 }, decor);
    text(decor, 922, 218, "drill day!", { size: 13, weight: 400, rotate: -4 });
    sk.circle(decor, 922, 214, 3, { fill: INK, width: 1, seed: S() });
    // light switch + outlet
    sk.rect(decor, 1612, 540, 22, 34, { fill: P.fog, width: DET, seed: S() });
    sk.line(decor, 1623, 550, 1623, 562, { width: 3, seed: S(), double: false });
    sk.rect(decor, 952, 634, 22, 30, { fill: P.fog, width: DET, seed: S() });

    // =====================================================================================================
    // COUNTER RUN (right-center): upper cabinet, open shelf, range hood, stove, lower cabinets, countertop
    const counterG = el("g", { class: "rd-k-counter" }, g);
    const CX0 = 1010, CX1 = 1430, CTOP = 606;
    // backsplash tiles
    const bs = el("g", {}, counterG);
    fillRect(bs, CX0, 430, CX1 - CX0, CTOP - 430, P.mist);
    for (let y = 430; y < CTOP; y += 28) {
      sk.line(bs, CX0, y, CX1, y, { width: 1.5, stroke: P.steel, seed: S(), double: false, opacity: 0.8 });
      for (let x = CX0 + ((y / 28) % 2) * 20; x < CX1; x += 40) sk.line(bs, x, y, x, y + 28, { width: 1.5, stroke: P.steel, seed: S(), double: false, opacity: 0.8 });
    }
    sk.rect(bs, CX0, 430, CX1 - CX0, CTOP - 430, { fill: "none", width: DET, seed: S(), opacity: 0.6 });
    // upper cabinet above the shelf
    const ucab = el("g", {}, counterG);
    sk.rect(ucab, 1020, 100, 156, 170, { fill: P.steel, width: MAIN, seed: S() });
    if (!mess) {
      sk.line(ucab, 1098, 104, 1098, 266, { width: DET + 1, seed: S() });
      sk.rect(ucab, 1032, 114, 56, 142, { fill: "none", width: DET, seed: S(), opacity: 0.7 });
      sk.rect(ucab, 1108, 114, 56, 142, { fill: "none", width: DET, seed: S(), opacity: 0.7 });
      sk.circle(ucab, 1088, 236, 4, { fill: P.fog, width: DET, seed: S() });
      sk.circle(ucab, 1108, 236, 4, { fill: P.fog, width: DET, seed: S() });
    } else {
      sk.rect(ucab, 1028, 108, 140, 154, { fill: P.night, width: DET, seed: S() });
      sk.line(ucab, 1028, 184, 1168, 184, { width: DET, stroke: P.slate, seed: S() });
      sk.rect(ucab, 1040, 152, 26, 32, { fill: P.slate, width: DET, seed: S() }); // tin left inside
      sk.poly(ucab, [[1020, 100], [976, 88], [976, 284], [1020, 270]], { fill: P.steel, width: MAIN, seed: S() });
      sk.poly(ucab, [[1176, 100], [1222, 86], [1222, 290], [1176, 270]], { fill: P.mist, width: MAIN, seed: S() });
      sk.hatch(ucab, 1180, 96, 40, 186, { gap: 9, angle: 75, opacity: 0.25, seed: S() });
    }
    // open shelf (two boards on brackets)
    const shelfG = el("g", {}, counterG);
    [300, 404].forEach((y) => {
      sk.poly(shelfG, [[1018, y], [1180, y], [1180, y + 12], [1018, y + 12]], { fill: P.slate, width: MAIN, seed: S() });
      sk.path(shelfG, [[1030, y + 12], [1030, y + 34], [1050, y + 12]], { width: DET + 1, seed: S() });
      sk.path(shelfG, [[1168, y + 12], [1168, y + 34], [1148, y + 12]], { width: DET + 1, seed: S() });
    });
    // mug hooks under the lower shelf (mugs are static except the "mug" fallable)
    [1062, 1100].forEach((x) => {
      sk.line(shelfG, x, 416, x, 428, { width: DET, seed: S() });
      const mg = el("g", {}, shelfG);
      sk.rect(mg, x - 12, 428, 24, 26, { fill: x === 1062 ? P.fog : P.mist, width: DET + 1, seed: S() });
      el("path", { d: `M${x + 12} 434 q 9 0 9 8 q 0 7 -9 7`, fill: "none", stroke: INK, "stroke-width": 2 }, mg);
    });
    // range hood + duct
    const hood = el("g", {}, counterG);
    sk.poly(hood, [[1236, 64], [1304, 64], [1304, 300], [1236, 300]], { fill: P.slate, width: MAIN, seed: S() });
    sk.poly(hood, [[1236, 300], [1304, 300], [1366, 392], [1174, 392]], { fill: P.steel, width: MAIN, seed: S() });
    sk.hatch(hood, 1240, 68, 60, 228, { gap: 10, angle: 90, opacity: 0.2, seed: S() });
    sk.rect(hood, 1170, 392, 200, 16, { fill: P.slate, width: MAIN, seed: S() });
    el("ellipse", { cx: 1270, cy: 412, rx: 70, ry: 6, fill: P.fog, opacity: 0.35 }, hood);
    // lower cabinets + stove
    const lower = el("g", {}, counterG);
    sk.rect(lower, CX0 + 6, CTOP + 10, 170 - 6, WALL_BASE - CTOP - 30, { fill: P.steel, width: MAIN, seed: S() });
    sk.rect(lower, 1360, CTOP + 10, 64, WALL_BASE - CTOP - 30, { fill: P.steel, width: MAIN, seed: S() });
    sk.rect(lower, CX0 + 4, WALL_BASE - 22, CX1 - CX0 - 8, 20, { fill: P.night, width: DET, seed: S() }); // toe kick
    sk.hatch(lower, CX0 + 8, CTOP + 12, 410, 140, { gap: 16, angle: 60, opacity: 0.12, seed: S() });
    // drawer + door on left cabinet
    sk.rect(lower, 1024, CTOP + 18, 148, 34, { fill: P.mist, width: DET + 1, seed: S() });
    sk.line(lower, 1080, CTOP + 35, 1116, CTOP + 35, { width: 3, seed: S(), double: false });
    if (!mess) {
      sk.rect(lower, 1024, CTOP + 60, 148, 92, { fill: "none", width: DET + 1, seed: S() });
      sk.line(lower, 1098, CTOP + 60, 1098, CTOP + 152, { width: DET, seed: S() });
      sk.circle(lower, 1088, CTOP + 80, 4, { fill: P.fog, width: DET, seed: S() });
      sk.circle(lower, 1108, CTOP + 80, 4, { fill: P.fog, width: DET, seed: S() });
    } else {
      sk.rect(lower, 1024, CTOP + 60, 148, 92, { fill: P.night, width: DET + 1, seed: S() });
      sk.circle(lower, 1060, CTOP + 128, 16, { fill: P.slate, width: DET, seed: S() }); // a pot lid inside
      sk.poly(lower, [[1024, CTOP + 60], [984, CTOP + 52], [984, CTOP + 164], [1024, CTOP + 152]], { fill: P.steel, width: MAIN, seed: S() });
      sk.poly(lower, [[1172, CTOP + 60], [1214, CTOP + 48], [1214, CTOP + 170], [1172, CTOP + 152]], { fill: P.mist, width: MAIN, seed: S() });
    }
    sk.rect(lower, 1370, CTOP + 18, 46, 134, { fill: "none", width: DET, seed: S() });
    sk.circle(lower, 1380, CTOP + 80, 4, { fill: P.fog, width: DET, seed: S() });
    // stove
    const stoveG = el("g", { class: "rd-k-stove" }, counterG);
    const SX = 1180, SW = 180;
    sk.rect(stoveG, SX, CTOP - 4, SW, WALL_BASE - CTOP - 18, { fill: P.fog, width: MAIN, seed: S() });
    sk.rect(stoveG, SX, CTOP - 4, SW, 30, { fill: P.mist, width: DET + 1, seed: S() });
    for (let i = 0; i < 4; i++) sk.circle(stoveG, SX + 30 + i * 40, CTOP + 11, 8, { fill: P.slate, width: DET, seed: S() });
    sk.rect(stoveG, SX + 16, CTOP + 40, SW - 32, 112, { fill: P.mist, width: DET + 1, seed: S() });
    sk.rect(stoveG, SX + 34, CTOP + 60, SW - 68, 60, { fill: P.slate, width: DET, seed: S() });
    sk.hatch(stoveG, SX + 36, CTOP + 62, SW - 72, 56, { gap: 10, angle: 45, stroke: P.night, opacity: 0.4, seed: S() });
    sk.line(stoveG, SX + 40, CTOP + 48, SX + SW - 40, CTOP + 48, { width: 4, seed: S() });
    sk.rect(stoveG, SX + 16, CTOP + 158, SW - 32, 14, { fill: P.slate, width: DET, seed: S() });
    // countertop slab
    sk.poly(counterG, [[CX0 - 6, CTOP - 12], [CX1 + 6, CTOP - 12], [CX1 + 6, CTOP + 10], [CX0 - 6, CTOP + 10]], { fill: P.slate, width: MAIN, seed: S() });
    sk.rect(counterG, SX - 2, CTOP - 18, SW + 4, 10, { fill: P.night, width: DET + 1, seed: S() }); // cooktop grate
    // counter clutter (static): bread box, cutting board, utensil crock
    const clutter = el("g", {}, counterG);
    sk.poly(clutter, [[1022, CTOP - 12], [1022, CTOP - 60], [1036, CTOP - 74], [1094, CTOP - 74], [1104, CTOP - 60], [1104, CTOP - 12]], { fill: P.steel, width: DET + 1, seed: S() });
    text(clutter, 1063, CTOP - 32, "BREAD", { size: 14, fill: P.paper });
    sk.rect(clutter, 1374, CTOP - 66, 32, 54, { fill: P.fog, width: DET + 1, seed: S() });
    [[1382, 1376, -112], [1390, 1394, -120], [1398, 1410, -106]].forEach(([a, b, t]) => sk.line(clutter, a, CTOP - 66, b, CTOP + t + 40, { width: 3, seed: S(), double: false }));
    el("ellipse", { cx: 1404, cy: CTOP - 80, rx: 9, ry: 5, fill: P.slate, stroke: INK, "stroke-width": 2 }, clutter);
    // radio note on the backsplash
    sk.rect(clutter, 1120, 446, 70, 48, { fill: P.paper, width: DET, seed: S() });
    text(clutter, 1155, 466, "NOAA", { size: 14 });
    text(clutter, 1155, 484, "162.475", { size: 12, weight: 400 });
    el("rect", { x: 1148, y: 440, width: 14, height: 9, fill: P.fog, opacity: 0.8 }, clutter);

    // =====================================================================================================
    // CLOCK, COAT HOOKS, BENCH, DOOR (right)
    const clockG = el("g", { class: "rd-k-clock" }, wall);
    const CKX = 1530, CKY = 232, CKR = 46;
    sk.circle(clockG, CKX, CKY, CKR + 8, { fill: P.slate, width: MAIN, seed: S() });
    sk.circle(clockG, CKX, CKY, CKR, { fill: P.paper, width: DET, seed: S() });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r1 = CKR - (i % 3 === 0 ? 12 : 7), r2 = CKR - 3;
      el("line", { x1: (CKX + Math.sin(a) * r1).toFixed(1), y1: (CKY - Math.cos(a) * r1).toFixed(1), x2: (CKX + Math.sin(a) * r2).toFixed(1), y2: (CKY - Math.cos(a) * r2).toFixed(1), stroke: INK, "stroke-width": i % 3 === 0 ? 3 : 1.6 }, clockG);
    }
    const hourG = el("g", {}, clockG), minuteG = el("g", {}, clockG);
    // 7:42 — hands drawn pointing up, rotated into place (scenes may re-rotate about cx, cy)
    sk.line(hourG, CKX, CKY + 4, CKX, CKY - 24, { width: 5, seed: S(), double: false });
    sk.line(minuteG, CKX, CKY + 6, CKX, CKY - 36, { width: 3, seed: S(), double: false });
    hourG.setAttribute("transform", `rotate(${(7 + 42 / 60) * 30} ${CKX} ${CKY})`);
    minuteG.setAttribute("transform", `rotate(${42 * 6} ${CKX} ${CKY})`);
    sk.circle(clockG, CKX, CKY, 4, { fill: INK, width: 1, seed: S() });
    if (mess) clockG.setAttribute("transform", `rotate(-7 ${CKX} ${CKY - CKR - 8})`);

    // coat hooks: rail with three pegs, a scarf + umbrella hang, the right peg left empty (hook handle)
    const hooksG = el("g", {}, wall);
    sk.poly(hooksG, [[1440, 442], [1600, 442], [1600, 462], [1440, 462]], { fill: P.slate, width: MAIN, seed: S() });
    [1470, 1515, 1560].forEach((x) => sk.path(hooksG, [[x, 452], [x, 470], [x + 10, 466]], { width: MAIN, seed: S() }));
    sk.poly(hooksG, [[1462, 468], [1480, 468], [1486, 560], [1474, 578], [1466, 560]], { fill: P.mist, width: DET + 1, seed: S() }); // scarf
    for (let k = 0; k < 4; k++) sk.line(hooksG, 1468, 520 + k * 12, 1484, 518 + k * 12, { width: 1.5, seed: S(), double: false, opacity: 0.6 });
    sk.path(hooksG, [[1515, 470], [1508, 478], [1508, 488]], { width: DET + 1, seed: S() }); // umbrella crook
    sk.poly(hooksG, [[1508, 488], [1528, 494], [1530, 600], [1514, 608], [1500, 598]], { fill: P.storm, width: DET + 1, seed: S() });
    sk.line(hooksG, 1514, 608, 1514, 624, { width: 3, seed: S(), double: false });

    // bench (go-bag sits on it)
    const benchG = el("g", { class: "rd-k-bench" }, g);
    const BX0 = 1428, BX1 = 1612, BY = 690;
    sk.poly(benchG, [[BX0 - 6, BY], [BX1 + 6, BY], [BX1 + 6, BY + 18], [BX0 - 6, BY + 18]], { fill: P.steel, width: MAIN, seed: S() });
    sk.line(benchG, BX0 + 6, BY + 6, BX1 - 6, BY + 6, { width: DET, stroke: P.slate, seed: S(), double: false });
    sk.rect(benchG, BX0 + 4, BY + 18, 18, WALL_BASE + 20 - BY - 18, { fill: P.slate, width: MAIN, seed: S() });
    sk.rect(benchG, BX1 - 22, BY + 18, 18, WALL_BASE + 20 - BY - 18, { fill: P.slate, width: MAIN, seed: S() });
    sk.line(benchG, BX0 + 22, BY + 60, BX1 - 22, BY + 60, { width: MAIN, seed: S() });
    // boots under the bench
    sk.path(benchG, [[1460, 740], [1462, 790], [1500, 792], [1500, 778], [1478, 772], [1478, 740]], { closed: true, fill: P.night, width: DET + 1, seed: S() });
    sk.path(benchG, [[1508, 744], [1510, 792], [1548, 794], [1548, 780], [1526, 774], [1526, 744]], { closed: true, fill: P.storm, width: DET + 1, seed: S() });
    // door
    const doorG = el("g", { class: "rd-k-door" }, g);
    const DX = 1650, DY = 360, DW = 210, DH = WALL_BASE - DY;
    sk.poly(doorG, [[DX - 22, DY - 24], [DX + DW + 22, DY - 24], [DX + DW + 22, WALL_BASE + 2], [DX - 22, WALL_BASE + 2]], { fill: P.fog, width: MAIN, seed: S() });
    sk.rect(doorG, DX, DY, DW, DH, { fill: P.slate, width: MAIN, seed: S() });
    sk.hatch(doorG, DX + 4, DY + 4, DW - 8, DH - 8, { gap: 14, angle: 82, opacity: 0.18, seed: S() });
    // door glass (rain beyond) + panels
    sk.rect(doorG, DX + 40, DY + 30, DW - 80, 96, { fill: P.mist, width: DET + 1, seed: S() });
    sk.hatch(doorG, DX + 42, DY + 32, DW - 84, 92, { gap: 12, angle: 78, stroke: P.paper, width: 1.5, opacity: 0.45, seed: S() });
    sk.line(doorG, DX + DW / 2, DY + 30, DX + DW / 2, DY + 126, { width: DET + 1, seed: S() });
    sk.rect(doorG, DX + 30, DY + 160, DW - 60, 100, { fill: "none", width: DET + 1, stroke: P.night, seed: S() });
    sk.rect(doorG, DX + 30, DY + 290, DW - 60, 110, { fill: "none", width: DET + 1, stroke: P.night, seed: S() });
    // knob, deadbolt, chain, note
    const KNX = DX + 26, KNY = 590;
    sk.circle(doorG, KNX, KNY, 10, { fill: P.fog, width: DET + 1, seed: S() });
    sk.circle(doorG, KNX, KNY - 40, 7, { fill: P.mist, width: DET + 1, seed: S() });
    sk.path(doorG, [[DX + 12, 512], [DX + 30, 530], [DX + 46, 516]], { width: DET, stroke: P.fog, seed: S(), double: false });
    sk.poly(doorG, [[DX + 116, DY + 176], [DX + 176, DY + 172], [DX + 178, DY + 240], [DX + 118, DY + 244]], { fill: P.paper, width: DET, seed: S() });
    text(doorG, DX + 147, DY + 194, "KEYS", { size: 13, rotate: -3 });
    text(doorG, DX + 147, DY + 212, "BAG", { size: 13, rotate: -3 });
    text(doorG, DX + 147, DY + 230, "RADIO", { size: 13, rotate: -3 });
    el("rect", { x: DX + 138, y: DY + 168, width: 18, height: 8, fill: P.fog, opacity: 0.8 }, doorG);
    // door frame shadow on wall
    sk.hatch(wall, DX - 44, DY - 24, 20, DH + 24, { gap: 7, angle: 70, opacity: 0.25, seed: S() });

    // =====================================================================================================
    // FALLABLES (each its own group, positioned in place)
    const fallables = [];
    const fall = (kind, x, y) => {
      const fg = el("g", { class: "rd-k-fall rd-k-" + kind }, g);
      fallables.push({ g: fg, x, y, kind });
      return fg;
    };
    // picture (hangs from a nail at 380,236) — a drawing of the harbor ferry
    {
      const fg = fall("picture", 380, 236);
      sk.line(fg, 380, 236, 336, 262, { width: DET, seed: S(), double: false });
      sk.line(fg, 380, 236, 424, 262, { width: DET, seed: S(), double: false });
      sk.circle(fg, 380, 236, 3, { fill: INK, width: 1, seed: S() });
      sk.rect(fg, 326, 260, 108, 90, { fill: P.slate, width: MAIN, seed: S() });
      sk.rect(fg, 338, 272, 84, 66, { fill: P.fog, width: DET, seed: S() });
      el("path", { d: "M346 318 q 10 -4 20 0 q 10 4 20 0 q 10 -4 20 0 q 6 3 10 1", fill: "none", stroke: P.steel, "stroke-width": 2 }, fg);
      el("path", { d: "M356 312 l 52 0 l -6 -8 l -8 0 l 0 -10 l -18 0 l 0 10 l -14 0 Z", fill: P.steel, stroke: INK, "stroke-width": 1.8 }, fg);
      el("path", { d: "M394 294 l 0 -8", stroke: INK, "stroke-width": 2 }, fg);
      text(fg, 380, 334, "the ferry", { size: 10, weight: 400 });
      if (mess) fg.setAttribute("transform", "rotate(13 380 236)");
    }
    // plant on the window sill (pivot = pot base)
    {
      const x = 540, y = W.y + W.h + 14;
      const fg = fall("plant", x, y);
      const draw = (par) => {
        [[-4, -64, -30, -80], [2, -70, 12, -98], [8, -60, 36, -82], [0, -48, -26, -54], [4, -50, 30, -52]].forEach(([qx, qy, ex, ey], i) => {
          el("path", { d: `M${x} ${y - 36} Q ${x + qx} ${y + qy} ${x + ex} ${y + ey}`, fill: "none", stroke: INK, "stroke-width": 3, "stroke-linecap": "round" }, par);
          el("ellipse", { cx: x + ex, cy: y + ey, rx: 11, ry: 6, fill: i % 2 ? P.steel : P.slate, stroke: INK, "stroke-width": 2, transform: `rotate(${-30 + i * 18} ${x + ex} ${y + ey})` }, par);
        });
        sk.poly(par, [[x - 22, y - 40], [x + 22, y - 40], [x + 16, y], [x - 16, y]], { fill: P.mist, width: DET + 1, seed: S() });
        sk.line(par, x - 22, y - 32, x + 22, y - 32, { width: DET, seed: S(), double: false });
      };
      if (!mess) draw(fg);
      else {
        // knocked off the sill onto the table: tipped on its side with spilled soil
        const tg = el("g", { transform: `translate(${-x + 820} ${-y + 498}) rotate(-96 ${x} ${y - 20})` }, fg);
        draw(tg);
        el("path", { d: "M700 500 q 20 -10 40 -2 q 18 -8 34 0 l 0 3 l -74 0 Z", fill: P.night, opacity: 0.8 }, fg);
      }
    }
    // plates stacked upright on the top shelf
    {
      const fg = fall("plates", 1060, 300);
      if (!mess) {
        for (let i = 0; i < 3; i++) {
          const cx = 1046 + i * 14;
          el("ellipse", { cx, cy: 268, rx: 9, ry: 32, fill: i === 2 ? P.paper : P.fog, stroke: INK, "stroke-width": 3 }, fg);
          el("ellipse", { cx, cy: 268, rx: 5, ry: 20, fill: "none", stroke: P.steel, "stroke-width": 1.6 }, fg);
        }
        sk.rect(fg, 1028, 286, 66, 14, { fill: P.slate, width: DET, seed: S() }); // plate rack lip
      } else {
        // smashed on the floor in front of the counter
        const shards = [[1090, 846, 0], [1128, 858, 1], [1160, 842, 2], [1060, 866, 3], [1200, 860, 4], [1112, 832, 5], [1236, 846, 6], [1176, 872, 7]];
        shards.forEach(([sx, sy, k]) => {
          const a = k * 0.9;
          const pts = [[sx, sy], [sx + 20 * Math.cos(a), sy + 8 * Math.sin(a) - 6], [sx + 14 + 4 * Math.sin(a), sy + 8], [sx - 4, sy + 7]];
          sk.poly(fg, pts, { fill: k % 3 ? P.fog : P.paper, width: DET + 1, seed: S() });
        });
        el("ellipse", { cx: 1150, cy: 878, rx: 120, ry: 8, fill: INK, opacity: 0.12 }, fg);
        sk.rect(fg, 1028, 286, 66, 14, { fill: P.slate, width: DET, seed: S() });
      }
    }
    // jar on the lower shelf
    {
      const fg = fall("jar", 1140, 404);
      if (!mess) {
        sk.rect(fg, 1124, 350, 34, 54, { fill: P.fog, width: DET + 1, seed: S() });
        sk.rect(fg, 1122, 342, 38, 10, { fill: P.slate, width: DET + 1, seed: S() });
        sk.rect(fg, 1128, 366, 26, 18, { fill: P.paper, width: 1.5, seed: S() });
        text(fg, 1141, 380, "TEA", { size: 11 });
      } else {
        // fell and rolled onto the counter, lid off
        sk.rect(fg, 1290, CTOP - 46, 54, 34, { fill: P.fog, width: DET + 1, seed: S() });
        sk.rect(fg, 1344, CTOP - 48, 10, 38, { fill: P.slate, width: DET + 1, seed: S() });
        el("path", { d: `M1360 ${CTOP - 12} q 20 -6 40 0`, fill: "none", stroke: P.slate, "stroke-width": 4 }, fg);
        text(fg, 1317, CTOP - 24, "TEA", { size: 11 });
      }
    }
    // extra jars + mug on the top shelf (static jars, fallable mug)
    sk.rect(counterG, 1110, 254, 26, 46, { fill: P.mist, width: DET + 1, seed: S() });
    sk.rect(counterG, 1108, 246, 30, 9, { fill: P.slate, width: DET, seed: S() });
    sk.rect(counterG, 1142, 268, 26, 32, { fill: P.fog, width: DET + 1, seed: S() });
    text(counterG, 1123, 284, "rice", { size: 10, weight: 400 });
    sk.rect(counterG, 1032, 370, 30, 34, { fill: P.steel, width: DET + 1, seed: S() });
    sk.rect(counterG, 1068, 360, 40, 44, { fill: P.fog, width: DET + 1, seed: S() });
    text(counterG, 1088, 388, "FLOUR", { size: 9 });
    {
      const fg = fall("mug", 1162, 404);
      if (!mess) {
        sk.rect(fg, 1150, 376, 22, 28, { fill: P.paper, width: DET + 1, seed: S() });
        el("path", { d: "M1172 382 q 8 0 8 7 q 0 7 -8 7", fill: "none", stroke: INK, "stroke-width": 2 }, fg);
      } else {
        sk.rect(fg, 980, 858, 28, 22, { fill: P.paper, width: DET + 1, seed: S() });
        el("path", { d: "M1008 864 q 8 0 8 6 q 0 6 -8 6", fill: "none", stroke: INK, "stroke-width": 2 }, fg);
      }
    }
    // kettle on the stove
    {
      const x = 1222, y = CTOP - 18;
      const fg = fall("kettle", x, y);
      const draw = (par) => {
        sk.path(par, [[x - 30, y], [x - 34, y - 26], [x - 22, y - 46], [x + 22, y - 46], [x + 34, y - 26], [x + 30, y]], { closed: true, fill: P.mist, width: MAIN, seed: S() });
        sk.path(par, [[x + 30, y - 22], [x + 50, y - 40], [x + 58, y - 44]], { width: MAIN + 2, seed: S() });
        sk.path(par, [[x - 20, y - 46], [x - 16, y - 66], [x + 16, y - 66], [x + 20, y - 46]], { width: MAIN, seed: S() });
        sk.circle(par, x, y - 50, 5, { fill: P.slate, width: DET, seed: S() });
        sk.hatch(par, x - 30, y - 30, 20, 28, { gap: 7, angle: 60, opacity: 0.3, seed: S() });
      };
      if (!mess) {
        draw(fg);
        // faint steam
        el("path", { d: `M${x + 60} ${y - 52} q -8 -14 4 -26 q 10 -12 0 -26`, fill: "none", stroke: P.paper, "stroke-width": 3, opacity: 0.45, "stroke-linecap": "round" }, fg);
      } else {
        const tg = el("g", { transform: `rotate(-22 ${x} ${y})` }, fg);
        draw(tg);
      }
    }
    // pot on the stove
    {
      const x = 1318, y = CTOP - 18;
      const fg = fall("pot", x, y);
      if (!mess) {
        sk.rect(fg, x - 30, y - 38, 60, 38, { fill: P.steel, width: MAIN, seed: S() });
        sk.line(fg, x - 40, y - 30, x - 30, y - 30, { width: MAIN, seed: S() });
        sk.line(fg, x + 30, y - 30, x + 40, y - 30, { width: MAIN, seed: S() });
        sk.poly(fg, [[x - 34, y - 38], [x + 34, y - 38], [x + 26, y - 46], [x - 26, y - 46]], { fill: P.slate, width: DET + 1, seed: S() });
        sk.circle(fg, x, y - 50, 4, { fill: INK, width: 1, seed: S() });
      } else {
        // on the floor beside the stove, on its side, lid rolled away
        sk.poly(fg, [[1268, 812], [1306, 812], [1306, 868], [1268, 868]], { fill: P.steel, width: MAIN, seed: S() });
        el("ellipse", { cx: 1306, cy: 840, rx: 9, ry: 28, fill: P.night, stroke: INK, "stroke-width": 3 }, fg);
        el("ellipse", { cx: 1352, cy: 868, rx: 30, ry: 7, fill: P.slate, stroke: INK, "stroke-width": 3 }, fg);
      }
    }

    // =====================================================================================================
    // CHAIRS (behind the table plane, at the table ends)
    const chairs = [];
    const chair = (x, facing, tipped) => {
      const cg = el("g", { class: "rd-k-chair" }, g);
      const f = facing;
      const seatY = 696, seatW = 96, back = x - f * 40;
      const draw = (par) => {
        sk.poly(par, [[back, seatY], [back + f * seatW, seatY], [back + f * seatW, seatY + 14], [back, seatY + 14]], { fill: P.steel, width: MAIN, seed: S() });
        sk.line(par, back, seatY + 14, back - f * 6, GROUND, { width: MAIN + 2, seed: S() });
        sk.line(par, back + f * seatW, seatY + 14, back + f * (seatW + 4), GROUND, { width: MAIN + 2, seed: S() });
        sk.line(par, back + f * 14, seatY + 14, back + f * 16, GROUND - 26, { width: MAIN, seed: S(), opacity: 0.6 });
        sk.line(par, back, seatY + 80, back + f * seatW, seatY + 80, { width: DET + 1, seed: S() });
        sk.line(par, back, seatY, back - f * 14, seatY - 210, { width: MAIN + 2, seed: S() });
        sk.poly(par, [[back - f * 12, seatY - 196], [back - f * 15, seatY - 214], [back + f * 28, seatY - 216], [back + f * 26, seatY - 198]], { fill: P.slate, width: DET + 1, seed: S() });
        sk.line(par, back - f * 6, seatY - 100, back + f * 2, seatY - 100, { width: DET + 1, seed: S() });
        for (let k = 0; k < 2; k++) sk.line(par, back - f * (4 + k * 3), seatY - 120 - k * 40, back + f * 16, seatY - 120 - k * 40, { width: DET, seed: S(), double: false, opacity: 0.6 });
      };
      if (!tipped) draw(cg);
      else {
        // tipped over backwards onto the floor
        const tg = el("g", { transform: `rotate(${f * -92} ${back + f * seatW / 2} ${GROUND}) translate(${f * 30} 6)` }, cg);
        draw(tg);
      }
      chairs.push({ g: cg, x, y: GROUND });
      return cg;
    };
    chair(280, 1, false);
    chair(1070, -1, !!mess);

    // =====================================================================================================
    // TABLE (center-left) — sturdy farmhouse table, top front edge y 528, apron underside y 560
    const tableG = el("g", { class: "rd-k-table" }, g);
    const TX0 = 340, TX1 = 1000, TTOP = 528, TUNDER = 560;
    const legXs = [376, 418, 922, 964];
    // back legs (behind, darker)
    [[405, 431], [909, 935]].forEach(([a, b]) => {
      sk.poly(tableG, [[a, TUNDER - 6], [b, TUNDER - 6], [b - 2, 852], [a + 2, 852]], { fill: P.storm, width: MAIN, seed: S() });
    });
    // back stretcher + shadow under
    sk.poly(tableG, [[431, 780], [909, 780], [909, 792], [431, 792]], { fill: P.storm, width: DET + 1, seed: S(), opacity: 0.8 });
    // top surface in perspective
    sk.poly(tableG, [[TX0 + 34, 494], [TX1 - 34, 494], [TX1, TTOP], [TX0, TTOP]], { fill: P.steel, width: MAIN, seed: S() });
    for (let k = 0; k < 4; k++) {
      const y = 502 + k * 7;
      sk.line(tableG, TX0 + 30 - k * 6, y, TX1 - 30 + k * 6, y, { width: 1.5, stroke: P.slate, seed: S(), double: false, opacity: 0.7 });
    }
    // grain knots
    el("ellipse", { cx: 520, cy: 510, rx: 14, ry: 3.5, fill: "none", stroke: P.slate, "stroke-width": 1.5 }, tableG);
    el("ellipse", { cx: 820, cy: 518, rx: 10, ry: 3, fill: "none", stroke: P.slate, "stroke-width": 1.5 }, tableG);
    // front edge slab + apron
    sk.poly(tableG, [[TX0 - 6, TTOP], [TX1 + 6, TTOP], [TX1 + 6, TTOP + 16], [TX0 - 6, TTOP + 16]], { fill: P.slate, width: MAIN, seed: S() });
    sk.poly(tableG, [[TX0 + 20, TTOP + 16], [TX1 - 20, TTOP + 16], [TX1 - 20, TUNDER], [TX0 + 20, TUNDER]], { fill: P.storm, width: MAIN, seed: S() });
    for (let k = 0; k < 6; k++) sk.line(tableG, TX0 + 60 + k * 100, TTOP + 22, TX0 + 120 + k * 100, TTOP + 22 + (k % 2), { width: 1.5, stroke: P.steel, seed: S(), double: false, opacity: 0.7 });
    // breakfast things on the table (static): bowl, mug, flashlight, folded map
    const tops = el("g", {}, tableG);
    if (!mess) {
      el("path", { d: "M560 506 q 0 18 30 18 q 30 0 30 -18 Z", fill: P.fog, stroke: INK, "stroke-width": 3 }, tops);
      sk.rect(tops, 650, 486, 22, 28, { fill: P.paper, width: DET + 1, seed: S() });
      el("path", { d: "M672 492 q 8 0 8 7 q 0 7 -8 7", fill: "none", stroke: INK, "stroke-width": 2 }, tops);
      el("path", { d: "M661 482 q -6 -8 0 -16", fill: "none", stroke: P.paper, "stroke-width": 2.5, opacity: 0.5 }, tops);
    } else {
      el("path", { d: "M580 520 q 14 -6 28 0 l -4 6 l -22 0 Z", fill: P.fog, stroke: INK, "stroke-width": 2.5 }, tops); // bowl upside-down
      sk.rect(tops, 640, 506, 28, 18, { fill: P.paper, width: DET + 1, seed: S() }); // mug on its side
      el("path", { d: "M600 520 q 40 6 80 0", fill: "none", stroke: P.mist, "stroke-width": 4, opacity: 0.7 }, tops);
    }
    sk.poly(tops, [[730, 512], [800, 506], [806, 520], [736, 524]], { fill: P.paper, width: DET, seed: S() }); // map
    el("path", { d: "M752 509 l 4 13 M776 507 l 4 15", stroke: P.steel, "stroke-width": 1.5 }, tops);
    sk.rect(tops, 840, 498, 46, 16, { fill: P.slate, width: DET + 1, seed: S() }); // flashlight
    el("circle", { cx: 886, cy: 506, r: 8, fill: P.fog, stroke: INK, "stroke-width": 2 }, tops);
    // front legs (own group so scenes can lift it above figures)
    const frontLegsG = el("g", { class: "rd-k-table-frontlegs" }, tableG);
    [[360, 392], [948, 980]].forEach(([a, b]) => {
      sk.poly(frontLegsG, [[a, TUNDER - 4], [b, TUNDER - 4], [b - 2, 900], [a + 2, 900]], { fill: P.slate, width: MAIN, seed: S() });
      sk.line(frontLegsG, a + 10, TUNDER + 20, a + 12, 880, { width: 1.5, stroke: P.steel, seed: S(), double: false, opacity: 0.8 });
      sk.hatch(frontLegsG, b - 12, TUNDER, 10, 336, { gap: 6, angle: 70, opacity: 0.3, seed: S() });
    });
    el("ellipse", { cx: 376, cy: 902, rx: 26, ry: 5, fill: INK, opacity: 0.25 }, frontLegsG);
    el("ellipse", { cx: 964, cy: 902, rx: 26, ry: 5, fill: INK, opacity: 0.25 }, frontLegsG);

    // =====================================================================================================
    // CRACKS (mess only)
    let cracks = null;
    if (mess) {
      cracks = el("g", { class: "rd-k-cracks" }, wall);
      const crack = (pts, w) => sk.path(cracks, pts, { width: w || DET + 1, seed: S(), wobble: 0.6 });
      crack([[W.x + W.w + 22, W.y - 22], [866, 168], [858, 140], [884, 110], [878, 74]], 3);
      crack([[866, 168], [900, 160], [920, 172]]);
      crack([[W.x - 22, W.y + W.h + 30], [430, 530], [404, 560], [412, 596]], 3);
      crack([[DX - 22, DY + 10], [1606, 340], [1588, 300], [1600, 276]], 3);
      crack([[1588, 300], [1566, 296]]);
      crack([[620, 58], [636, 96], [624, 128], [646, 150]], 3);
      crack([[1300, 58], [1312, 84]]);
      // plaster dust chunks on the floor
      [[434, 806], [452, 812], [1618, 796], [1600, 806]].forEach(([x, y]) => sk.poly(cracks, [[x, y], [x + 10, y - 4], [x + 12, y + 4], [x + 2, y + 6]], { fill: P.fog, width: DET, seed: S() }));
    }

    // =====================================================================================================
    // LAMP (pendant over the table) + its glow — rotate about (670, 0)
    const lampG = el("g", { class: "rd-k-lamp" }, g);
    const LPX = 670, LPY = 0;
    el("ellipse", { cx: 670, cy: 560, rx: 520, ry: 420, fill: `url(#${uid}glow)` }, lampG);
    sk.path(lampG, [[LPX, LPY], [LPX + 1, 150], [LPX, 300]], { width: 3, seed: S(), double: false });
    sk.poly(lampG, [[LPX - 12, 296], [LPX + 12, 296], [LPX + 14, 312], [LPX - 14, 312]], { fill: P.slate, width: DET + 1, seed: S() });
    sk.path(lampG, [[LPX - 14, 312], [LPX + 14, 312], [LPX + 66, 360], [LPX + 60, 366], [LPX - 60, 366], [LPX - 66, 360]], { closed: true, fill: P.steel, width: MAIN, seed: S() });
    sk.hatch(lampG, LPX - 60, 318, 50, 44, { gap: 8, angle: 60, opacity: 0.3, seed: S() });
    el("ellipse", { cx: LPX, cy: 366, rx: 58, ry: 8, fill: P.paper, stroke: INK, "stroke-width": 2 }, lampG);
    el("circle", { cx: LPX, cy: 370, r: 10, fill: P.paper, stroke: INK, "stroke-width": 2 }, lampG);
    el("ellipse", { cx: LPX, cy: 6, rx: 22, ry: 6, fill: P.slate, stroke: INK, "stroke-width": 3 }, g); // ceiling canopy (static)

    // =====================================================================================================
    // VIGNETTE (moody corners; kept above everything in the background)
    el("rect", { x: 0, y: 0, width: 1920, height: 1080, fill: `url(#${uid}vig)`, "pointer-events": "none" }, g);

    return {
      g, wall, groundY: GROUND,
      windowRect,
      window: { g: windowG, glassG },
      table: { x0: TX0, x1: TX1, topY: TTOP, underY: TUNDER, floorY: GROUND, legXs, g: tableG, frontLegsG },
      lamp: { g: lampG, pivotX: LPX, pivotY: LPY },
      door: { x: DX, y: DY, w: DW, h: DH, g: doorG, knob: { x: KNX, y: KNY } },
      bench: { x: 1520, y: BY, g: benchG },
      hook: { x: 1560, y: 462 },
      clock: { g: clockG, cx: CKX, cy: CKY, r: CKR, hands: { hourG, minuteG } },
      fallables,
      chairs,
      stove: { g: stoveG, x: SX, w: SW, topY: CTOP },
      counter: { g: counterG, x0: CX0, x1: CX1, topY: CTOP },
      fridge: { g: fridgeG, x: FX, y: FY, w: FW, h: FH },
      cracks,
    };
  };
})();
