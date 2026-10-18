#!/usr/bin/env python3
"""Rainy Day: Cascadia — Episode 1 remake (v6), Phase A: script + shot list from ONE shot table.

Writes episodes/ep01/script-v6.md and episodes/ep01/shotlist-v6.md (refuses to overwrite either) and checks the rules
the brief sets: every shot <= 6 s, total 4:30-5:30, 4 TikTok parts each >= 65 s ending on a hook, narration fits its
shot at a calm pace (<= 2.7 words/s), at most 3 character speech bubbles in the whole episode.
Usage: python3 tools/make-ep01-v6-docs-v1.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------------------------------------- backgrounds
# Painted, character-free plates, all muted/desaturated so the yellow slicker is the strongest color in frame.
# "Crops" = the same plate re-used at a different crop / push-in / pan, so new shots don't need new paintings.
BG = {
    "KIT":  ("Kitchen — morning", "Drizzle's small coastal-cottage kitchen, gray rainy morning: big rain-streaked window over the sink (sea and firs outside), "
             "open floor center, small wooden table + 2 chairs with a white coffee mug, round wall clock, unlit pendant lamp, front door at right with a "
             "slate-gray go-bag on a hook. (= the Phase A style-test plate.)", "wide · table close-up · window · door + go-bag"),
    "KITW": ("Kitchen — wrecked", "The SAME kitchen and camera angle after the quake: cabinets open, broken plates and a tipped plant on the floor, the table "
             "shoved askew but standing, picture frame crooked, dust in the gray window light, clock stopped, go-bag still on its hook.", "wide · floor close-up · door"),
    "UNDER": ("Under the table", "Low, floor-level view from under the kitchen table: the underside of the tabletop filling the top of frame, two table legs "
              "framing the shot, the kitchen floor stretching away toward the window light; empty space under the table for two figures.", "medium · tight on legs"),
    "MAIN": ("Main Street — before", "Gull Harbor's main street, intact, light rain: wet road, small wooden storefronts (diner, hardware store, post office), "
             "the harbor and a little island ferry at the dock at left, the forested hill rising at right/east, gray sky.", "wide establishing · sidewalk medium"),
    "MAIND": ("Main Street — after the quake", "The same street right after the quake: cracked asphalt, leaning power poles, a fallen sign, broken windows, a "
              "tall silent tsunami-siren pole; the harbor at left still visible; no people.", "wide · siren pole (tilt up) · street level medium"),
    "HARB": ("Harbor draining", "The harbor seen from the dock with the water pulled far out: exposed mud flats, the ferry and small boats settled and "
             "tilted on the bottom, pilings and buoys high and dry, the gray sea far beyond the harbor mouth.", "wide · mud close-up"),
    "SEA":  ("Open sea horizon", "Looking straight out past the harbor mouth to the open Pacific under low gray cloud: a flat, very wide horizon with "
             "empty sea; minimal detail so a vector wave-line can rise on it.", "wide · slow push-in"),
    "GAS":  ("East end of Main Street", "The east end of Main Street at Dale's Gas & Grocery: a fuel canopy, a small store, the road buckled and cracked "
             "with a jam of empty cars, the evacuation trail sign pointing uphill at the edge of frame.", "wide · road-level medium"),
    "TRAIL": ("Evacuation trail", "A steep, muddy switchback trail climbing through tall Douglas firs in the rain, a blue-and-white TSUNAMI EVACUATION "
              "ROUTE sign on a post, a flat rock beside the trail (Mags sits here).", "wide · medium on the rock · sign"),
    "VIEW": ("Switchback viewpoint", "From a bend high on the trail: a wide view down over the town, the harbor and the bay to the horizon, fir trunks "
             "framing the edges, the trail continuing up at right. Water at normal level (vector water/wave overlays animate on it).", "wide · push-in on harbor · horizon"),
    "VIEWX": ("Lower town after the waves", "The SAME viewpoint and framing as VIEW after the tsunami: the lower town flattened into a debris field, "
              "water still filling the low streets, the ferry carried up Main Street, broken roofs in the water, no people.", "wide · push-in"),
    "HILL": ("Hilltop assembly area", "The flat hilltop: a pop-up CERT canopy, a water tank, a picnic table, an ASSEMBLY AREA sign, fir trees; at right a "
             "view down over the flooded lowland. Space for a muted gray crowd (vector).", "wide · two-shot medium · canopy"),
    "EDGE": ("Hilltop edge at dusk", "The edge of the hilltop at dusk, darker and bluer: wet grass lip, a broken fence, the whole flooded lowland and bay "
             "below, a few fires far off, the sea going dark to the horizon.", "wide · over-the-shoulder · push-in to the water"),
    "RADIO": ("Radio close-up plate", "A close-up surface for prop shots: a wet, mossy trail rock and fir needles in soft focus (the vector hand-crank radio "
              "and its bubbles sit on top; reused for the hilltop radio shot with a darker grade).", "close-up (shared by 2 radio shots)"),
}
CARD = "CARD"  # plain dark-gray resource / day card, no background plate

# ---------------------------------------------------------------------------------------------- shots
# (dur s, bg, framing/camera, narration, Drizzle (pose/action), insert)
# Insert kinds: CARD (resource card: one icon + big hand-lettered text), DAY (day/time card), BUBBLE(<who>) (comic speech
# bubble — max 3 in the episode), RADIO (radio speech bubble on the hand-crank radio), PROP (prop close-up with a bubble).
PARTS = [
 ("PART 1 — The Ordinary Morning", "And it kept going.", [
  (3.0, "KIT", "cold open: wide, hard shake, vector plates/plant falling (flash-forward)", "This is Drizzle's kitchen at ten forty-three.", "under the table in holdOn, scared", ""),
  (3.0, "VIEW", "cold open: wave breaking over the harbor (flash-forward)", "This is his town at eleven-oh-four.", "— (no figure)", ""),
  (2.5, CARD, "title card", "Let's back up.", "—", "CARD: RAINY DAY: CASCADIA — DAY 0 · THE SHAKING (title)"),
  (5.0, "MAIN", "wide establishing, slow push-in", "Gull Harbor, Washington. Population two thousand one hundred forty.", "— (empty street)", ""),
  (4.0, CARD, "card", "It rains here two hundred days a year.", "—", "CARD: 200 RAINY DAYS A YEAR (icon: rain cloud)"),
  (5.5, "MAIN", "sidewalk medium, pan right", "Drizzle owns one raincoat. Nobody has ever seen him take it off. Indoors included.", "walks in left→right with a paper grocery bag, hood up", ""),
  (4.0, "KIT", "wide (the Phase A opening still)", "Tuesday. Ten forty-two in the morning.", "idle by the table, smiling, mug nearby", "DAY: DAY 0 · 10:42 AM"),
  (5.0, "KIT", "crop: door + go-bag", "By the door hangs his go-bag. He calls it his snack bag.", "points proudly at the bag (edge of frame)", ""),
  (5.0, "KIT", "crop: door", "Next door lives Mags. Retired harbor clerk. One hand-crank radio. Zero patience.", "waves at Mags as she leans in the doorway, radio in hand", ""),
  (3.5, "KIT", "crop: table close-up", "Then the coffee mug started to move.", "leans in, staring at the mug (vector mug rattles)", ""),
  (5.0, "KIT", "wide, shake ramps in, lamp swings", "Out at sea, seven hundred miles of fault had just let go.", "arms out for balance, scared", ""),
  (4.0, CARD, "card", "Magnitude nine. The Cascadia Subduction Zone.", "—", "CARD: MAGNITUDE 9 (icon: seismograph squiggle)"),
  (5.0, "KIT", "wide, hard shake", "Drizzle did what the movies taught him. He ran for the doorway.", "runs toward the front door", ""),
  (3.0, "KIT", "crop: door, Mags pointing back at the table", "", "skids to a stop, turns", "BUBBLE(MAGS): Not the doorway. UNDER THE TABLE."),
  (4.0, CARD, "card", "Doorways won't save you. A sturdy table might.", "—", "CARD: DROP · COVER · HOLD ON (icon: table)"),
  (4.5, "UNDER", "medium, shaking", "Drop. Cover. Grab a leg, and don't let go.", "under the table, holdOn, gripping a leg (Mags beside him)", ""),
  (4.0, "UNDER", "tight on the legs; plates shatter in front (vector)", "Ten seconds. Thirty. A minute.", "holdOn, eyes squeezed shut", ""),
  (4.5, CARD, "card", "Big Cascadia quakes don't last seconds. They last minutes.", "—", "CARD: 4 MINUTES OF SHAKING (icon: stopwatch)"),
  (5.0, "UNDER", "medium, shaking", "Drizzle had never held a table leg this long. Or this sincerely.", "peeks out, worried, still holding on", ""),
  (3.5, "UNDER", "medium; lamp light flickers twice, goes out", "Then the power went out.", "holdOn, looks up at the dying light", ""),
  (3.0, "UNDER", "near-black, faint outlines, still shaking", "And it kept going.", "only his eyes + a dim yellow edge", ""),
 ]),
 ("PART 2 — The Harbor Leaves", "Out past the harbor mouth, the horizon began to rise.", [
  (3.5, "UNDER", "dark → gray daylight returns, dust in the air", "Then, nothing.", "holdOn, frozen, then lets go", ""),
  (3.0, CARD, "day card", "Ten forty-six.", "—", "DAY: DAY 0 · 10:46 AM"),
  (5.5, "KITW", "wide", "The kitchen was mostly on the floor. The table had done its job.", "crawls out, stands, pats the table", ""),
  (5.5, "KITW", "medium", "Drizzle grabbed the things that mattered. The laptop. The photo album. The plant.", "arms full: a teetering stack of laptop, album, potted plant", ""),
  (4.0, "KITW", "crop: door + go-bag", "Mags pointed at the only thing that did.", "looks from his stack to the go-bag", ""),
  (5.5, CARD, "card", "Water. Flashlight. Radio. Meds. A warm layer. The rest can be replaced.", "—", "CARD: GO-BAG, NOT BELONGINGS (icon: backpack)"),
  (3.0, "KITW", "crop: door", "", "go-bag on his back, glancing back at the plant", "BUBBLE(MAGS): The plant can swim."),
  (5.0, "MAIND", "wide", "Outside, Gull Harbor looked almost normal. Cracked. Crooked. But normal.", "steps out with Mags, go-bag on", ""),
  (4.0, "HARB", "wide; vector water line sliding out", "Except the harbor was leaving.", "small at the dock edge, pointing", ""),
  (5.5, "HARB", "mud close-up: boats tipped, fish flopping", "The water pulled back past the docks. Past the buoys. Past anything anyone remembered.", "— (prop/environment shot)", ""),
  (5.0, CARD, "card", "When the sea drains away like that, it is coming back. Fast.", "—", "CARD: SEA DRAINING = TSUNAMI COMING (icon: wave)"),
  (4.0, "MAIND", "prop close-up: a neighbor's phone (vector), street blurred behind", "Nobody's phone said a thing.", "—", "PROP: phone screen bubble — \"NO NEW ALERTS\""),
  (4.0, "MAIND", "tilt up the silent siren pole", "The tsunami siren didn't either. No power.", "small at the pole's base, looking up", ""),
  (5.5, CARD, "card", "On this coast, the shaking is the warning. You don't wait for another one.", "—", "CARD: THE SHAKING IS THE WARNING (icon: house shaking)"),
  (3.5, "MAIND", "medium", "So Drizzle became the siren.", "cups hands to his mouth, yelling; neighbors turn", ""),
  (3.5, "MAIND", "wide, people streaming right/uphill", "Uphill. Everyone. Right now.", "waving people on, then walking with Mags", ""),
  (4.0, "SEA", "wide, still", "Out past the harbor mouth...", "— (no figure)", ""),
  (4.5, "SEA", "slow push-in; a thin dark line rises on the horizon", "the horizon began to rise.", "—", ""),
 ]),
 ("PART 3 — Uphill", "It was not a cloud. And it was moving fast.", [
  (3.0, CARD, "day card", "Ten forty-nine.", "—", "DAY: DAY 0 · 10:49 AM"),
  (5.5, "GAS", "wide", "At the east end of Main Street, everyone had the same idea. Drive.", "walks in with Mags past the stalled cars", ""),
  (3.5, "GAS", "road-level medium: cracked asphalt", "The road had other ideas.", "steps over a crack", ""),
  (4.5, CARD, "card", "Roads crack. Bridges drop. Cars jam. Feet keep going.", "—", "CARD: WALK, DON'T DRIVE (icon: walking feet)"),
  (4.5, "GAS", "medium", "Drizzle talked one driver out of his car. Good call.", "waves a gray driver out; the driver follows on foot", ""),
  (4.5, CARD, "card", "The evacuation trail. Zero point four miles. Straight up.", "—", "CARD: 0.4 MILES UPHILL (icon: up arrow + hill)"),
  (4.5, "TRAIL", "wide", "Steep. Muddy. Mags at seventy-one. Drizzle in rubber boots.", "climbing (walk cycle), Mags just ahead", ""),
  (3.5, "TRAIL", "wide; firs sway, pebbles roll (shake)", "Halfway up, the ground moved again.", "stumbles", ""),
  (4.5, "TRAIL", "medium", "Aftershock. No table here. Get low. Cover your head and neck.", "crouched low, arms over head and neck (cover pose)", ""),
  (4.0, CARD, "card", "Away from the tree trunks, if you can.", "—", "CARD: NO TABLE? GET LOW. COVER YOUR HEAD. (icon: crouching figure)"),
  (4.5, "TRAIL", "medium on the rock", "Mags needed a minute. She took thirty seconds.", "offers his arm; Mags sits on the rock, winded", ""),
  (3.5, "RADIO", "close-up; crank spins", "She cranked the radio.", "—", "RADIO: KRRSHHH—"),
  (5.0, "RADIO", "close-up; static squiggles become clean sound arcs", "", "—", "RADIO: ...TSUNAMI WARNING... WASHINGTON COAST... MOVE TO HIGH GROUND IMMEDIATELY..."),
  (4.5, CARD, "card", "The official warning. Sixteen minutes after the shaking started.", "—", "CARD: OFFICIAL WARNING: +16 MINUTES (icon: radio)"),
  (3.5, "VIEW", "wide; both small at the bend", "At the switchback, Drizzle looked back.", "stops, turns to face the view", ""),
  (4.5, "VIEW", "push-in toward the horizon; vector gray line appears", "A gray line stretched across the whole horizon.", "tiny, back to camera", ""),
  (4.5, "VIEW", "push-in continues; the line thickens", "It was not a cloud. And it was moving fast.", "tiny, frozen", ""),
 ]),
 ("PART 4 — The Hilltop", "NEXT: DAY 1 · NO ONE IS COMING", [
  (3.0, CARD, "day card", "Eleven-oh-four.", "—", "DAY: DAY 0 · 11:04 AM"),
  (5.0, "VIEW", "wide; vector surge fills the harbor", "Twenty-two minutes after the shaking started, the first wave came in.", "running up the trail, pulling Mags by the hand", ""),
  (3.0, CARD, "card", "Twenty-two minutes.", "—", "CARD: 22 MINUTES TO THE WAVE (icon: wave + clock)"),
  (4.5, "VIEW", "push-in on the harbor; dock + ferry go under", "It took the dock. The ferry. The first row of houses.", "— (environment)", ""),
  (4.0, CARD, "card", "And the first wave is often not the biggest.", "—", "CARD: THE FIRST WAVE IS OFTEN NOT THE BIGGEST (icon: three waves)"),
  (4.5, "VIEW", "wide; the second, taller wall hits the lower town; hard shake", "The second one was bigger.", "small at the bend, hands to his hood", ""),
  (5.5, "VIEWX", "same framing, crossfade to the aftermath; slow push-in", "When it pulled back, the lower town was gone. Drizzle's kitchen with it.", "small, still", ""),
  (3.5, "VIEWX", "medium two-shot at the bend", "Mags didn't look back. Houses get rebuilt.", "Mags's hand on his shoulder; they turn uphill", ""),
  (4.5, "HILL", "wide", "The hilltop assembly area. Two hundred ten feet above the sea.", "staggers in with Mags, drops to sit", ""),
  (3.5, CARD, "card", "Higher than any wave that day.", "—", "CARD: 210 FEET ABOVE THE SEA (icon: flag on a hill)"),
  (5.0, "HILL", "crop: canopy", "The school got every kid up the hill. They practiced. Every year.", "waves back at a gray kid under the canopy", ""),
  (3.5, "HILL", "two-shot medium", "Drizzle had learned three things.", "sitting, counting on his fingers", ""),
  (4.0, CARD, "card", "One. Drop, cover, hold on. Not the doorway.", "—", "CARD: 1 · DROP, COVER, HOLD ON (icon: table)"),
  (5.0, CARD, "card", "Two. On the coast, the shaking is the warning. Walk uphill, now.", "—", "CARD: 2 · COAST + SHAKING = WALK UPHILL NOW (icon: up arrow)"),
  (3.5, CARD, "card", "Three. Grab the go-bag, not your stuff.", "—", "CARD: 3 · GO-BAG, NOT BELONGINGS (icon: backpack)"),
  (3.5, "HILL", "two-shot medium", "Four, according to Drizzle: snacks.", "hands Mags a granola bar; she takes it, deadpan", ""),
  (3.0, CARD, "day card", "Four fifty-eight p.m.", "—", "DAY: DAY 0 · 4:58 PM"),
  (5.0, "RADIO", "close-up, dusk grade; crank spins", "", "—", "RADIO: ...HIGHWAY 101 BRIDGE AT GULL CREEK HAS COLLAPSED... NO ROAD ACCESS TO GULL HARBOR..."),
  (3.5, "EDGE", "over-the-shoulder at the edge", "", "standing at the edge, looking out", "BUBBLE(DRIZZLE): So... nobody's coming?"),
  (4.0, "EDGE", "wide", "Not today. Not by road. Not for a while.", "small silhouette at the edge, yellow still bright", ""),
  (4.0, "EDGE", "push-in; a pulsing white light appears on the dark water (vector)", "Then, out on the dark water... a light.", "leans forward", ""),
  (3.0, CARD, "end card", "", "—", "CARD: NEXT: DAY 1 · NO ONE IS COMING (end card)"),
 ]),
]

WPS_MAX = 2.7  # calm narration: words per second of shot (minus a 0.3 s breath)


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def main():
    errs = []
    t = 0.0
    n = 0
    bubbles = 0
    parts = []
    for title, hook, shots in PARTS:
        p0 = t
        rows = []
        for dur, bg, cam, narr, driz, ins in shots:
            n += 1
            if dur > 6.0:
                errs.append(f"shot {n}: {dur}s > 6s")
            words = len(re.findall(r"[\w'-]+", narr))
            if words and words / (dur - 0.3) > WPS_MAX:
                errs.append(f"shot {n}: {words} words in {dur}s ({words / (dur - 0.3):.2f} w/s)")
            if bg != CARD and bg not in BG:
                errs.append(f"shot {n}: unknown bg {bg}")
            if ins.startswith("BUBBLE("):
                bubbles += 1
            rows.append((n, t, dur, bg, cam, narr, driz, ins))
            t += dur
        if t - p0 < 65:
            errs.append(f"{title}: {t - p0:.1f}s < 65s")
        parts.append((title, hook, p0, t, rows))
    if not (270 <= t <= 330):
        errs.append(f"total {t:.1f}s outside 4:30-5:30")
    if bubbles > 3:
        errs.append(f"{bubbles} character bubbles > 3")
    used = sorted({r[3] for p in parts for r in p[4] if r[3] != CARD})
    if errs:
        sys.exit("\n".join(errs))

    # ------------------------------------------------------------------ script
    L = [f'# RAINY DAY: CASCADIA — Episode 1 remake: "DAY 0: THE SHAKING" — Script (v6)', "",
         "Narration-led remake of Episode 1 in the new look: a simple vector Drizzle (yellow slicker) on painted, muted, character-free "
         "backgrounds; the narrator carries the story; exposition through resource cards, day/time cards and prop close-ups with bubbles. "
         "Same story beats and survival lessons as v5. Generated with the shot list from one table by `tools/make-ep01-v6-docs-v1.py` "
         "(timings below = shot list timings).", "",
         f"**Runtime:** {fmt(t)} ({t:.1f} s) · {n} shots · 4 TikTok parts of " + " / ".join(f"{p[3] - p[2]:.1f} s" for p in parts) +
         f" · average shot {t / n:.1f} s, none over 6 s", "",
         "**Narrator:** third person, calm and tense, short punchy sentences, dry humor now and then. Numbers become cards.", "",
         "**Lessons:** 1. Drop, cover, hold on (not the doorway). 2. On the coast the shaking is the warning: walk uphill right away, "
         "don't wait for an alert, don't drive. 3. Go-bag, not belongings. Supporting facts on cards: M9 shaking lasts minutes; the sea "
         "draining is a tsunami sign; aftershock with no table = get low, cover head and neck; the first wave is often not the biggest.", "",
         "**Markers:** `[CARD: …]` resource card (dark-gray card, one icon, big hand-lettered text) · `[DAY: …]` day/time card · "
         "`[RADIO: …]` speech bubble from Mags's hand-crank radio · `[PROP: …]` prop close-up with a bubble · `[BUBBLE(WHO): …]` comic "
         f"speech bubble from a character ({bubbles} in the whole episode, no spoken character dialogue).", "",
         "**Facts check:** M9 Cascadia shaking 3–5 min (we use 4); first wave 15–30 min on this coast (we use 22, i.e. 11:04 after a "
         "10:42 start); sirens and phone alerts may fail with the power out; the official warning arriving after people should already "
         "be moving is the point of lesson 2; tsunamis are wave trains and the first is often not the largest (NOAA/WA EMD). "
         "0.4 mi uphill ≈ 12–15 min on foot for a 71-year-old; the 210 ft hilltop matches the Episode 2 ASSEMBLY AREA sign.", ""]
    for i, (title, hook, p0, p1, rows) in enumerate(parts, 1):
        L += ["---", "", f"## {title}  ·  episode {fmt(p0)}–{fmt(p1)}  ·  {p1 - p0:.1f} s", ""]
        for (k, st, dur, bg, cam, narr, driz, ins) in rows:
            parts_txt = []
            if narr:
                parts_txt.append(narr)
            if ins:
                kind, _, body = ins.partition(": ")
                parts_txt.append(f"**[{kind}: {body}]**")
            if not parts_txt:
                continue
            L.append(f"`{fmt(st)}` " + " ".join(parts_txt) + "  ")
        L += ["", f"> **⟂ TIKTOK PART {i} BREAK** at {fmt(p1)} — ends on: *\"{hook}\"*", ""]
    L += ["---", "", "## Bubble count", "",
          "Character speech bubbles: MAGS ×2 (\"Not the doorway. UNDER THE TABLE.\", \"The plant can swim.\"), DRIZZLE ×1 (\"So... nobody's coming?\"). "
          "Radio bubbles: 3. Prop bubble: 1 (phone). Everything else is narration.", ""]
    write("episodes/ep01/script-v6.md", "\n".join(L))

    # ------------------------------------------------------------------ shot list
    S = ["# RAINY DAY: CASCADIA — Episode 1 remake — Shot list (v6)", "",
         f"{n} shots · {fmt(t)} · generated with `episodes/ep01/script-v6.md` by `tools/make-ep01-v6-docs-v1.py`. Every shot ≤ 6 s "
         "(cards and inserts included); camera moves (push-in, pan, shake) keep even the 5–6 s shots alive.", "",
         "Drizzle = the series rig vector figure (white round head, dot eyes, yellow slicker, hood up) composited in HyperFrames; Mags and "
         "townspeople = the same rig in muted grays. Cards = plain dark-gray card, one simple icon, big hand-lettered text, no background.", "",
         f"## Backgrounds ({len(used)} unique painted plates)", "", "| ID | Name | Used in shots | Crops / angles | Generation description |", "|---|---|---|---|---|"]
    for b in used:
        name, desc, crops = BG[b]
        ids = [str(r[0]) for p in parts for r in p[4] if r[3] == b]
        S.append(f"| `{b}` | {name} | {', '.join(ids)} | {crops} | {desc} |")
    S += ["", "Every plate: 16:9, NO people or characters, muted desaturated cool blues and grays, no yellow, rain where outdoors; "
          "the style follows the Phase A pick.", ""]
    for i, (title, hook, p0, p1, rows) in enumerate(parts, 1):
        S += [f"## {title} — {fmt(p0)}–{fmt(p1)} ({p1 - p0:.1f} s) · ends on \"{hook}\"", "",
              "| # | Time | Dur | Narration | Background · framing | Drizzle | Card / bubble |", "|---|---|---|---|---|---|---|"]
        for (k, st, dur, bg, cam, narr, driz, ins) in rows:
            bgtxt = "— (card)" if bg == CARD else f"`{bg}` · {cam}"
            S.append(f"| {k} | {fmt(st)} | {dur:.1f}s | {narr or '—'} | {bgtxt} | {driz} | {ins or '—'} |")
        S += ["", f"**⟂ TikTok part {i} break at {fmt(p1)}.**", ""]
    write("episodes/ep01/shotlist-v6.md", "\n".join(S))
    print(f"{n} shots, {t:.1f}s; parts " + " / ".join(f"{p[3] - p[2]:.1f}" for p in parts) + f"; {len(used)} backgrounds; {bubbles} bubbles")


def write(rel, text):
    p = os.path.join(ROOT, rel)
    if os.path.exists(p):
        sys.exit(f"refusing to overwrite {rel}")
    open(p, "w").write(text)
    print("wrote", rel)


if __name__ == "__main__":
    main()
