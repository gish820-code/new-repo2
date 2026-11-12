#!/usr/bin/env python3
"""Rainy Day — Episode 5 ("DAY 9: THE LONG WAIT") script data, v1 draft (authored cue times; the audio builder retimes them
to the recorded lines). Writes episodes/ep05/ep05-scenes-v1-draft.json. Source: docs/series-bible-v3.md §2 Ep 5 + the Episode 5 task brief (location table), §3, §9."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def N(t0, t1, text):
    return {"t0": t0, "t1": t1, "kind": "narration", "text": text}


def D(t0, t1, who, text, tag=None):
    c = {"t0": t0, "t1": t1, "kind": "dialogue", "speaker": who, "text": text}
    if tag:
        c["tag"] = tag
    return c


def S(t0, t1, text):
    return {"t0": t0, "t1": t1, "kind": "sign", "text": text}


def sc(id, title, bg, bgOpts, dur, action, start, end, caps):
    return {"id": id, "title": title, "bg": bg, "bgOpts": bgOpts, "duration": dur, "action": action, "start": start, "end": end, "captions": caps}


SUN = "FIRST SUNNY DAY of the series: clear pale-blue sky, hard sun from the upper LEFT, short hard ink-dark shadows under every figure and prop (skewed ellipse/polygon shadows toward lower right), dry cracked mud, dust kicked up by feet. No rain."
parts = [
 {"part": 1, "title": "Dry", "hook": "Mags: The creek. Now.", "scenes": [
  sc("h1", "Cold Open", "camp9", {"light": "sun"}, 3.0,
     SUN + " COLD OPEN (flash-forward to s05): extreme close-up of the camp's LAST water jug held upside down by Drizzle's yellow-sleeved hands in hard sun; ONE drop falls from the spout and hits the dust (tiny dust puff). Low angle, the sun flaring behind the jug.",
     "Jug upside down.", "The drop lands in the dust.",
     [D(0.3, 2.8, "DRIZZLE", "That's... the last jug?")]),
  sc("s01", "Previously", "camp9", {"light": "night", "day4": True}, 6.5,
     "RECAP of Episode 4 (flicker/vignette like Ep 4 s01), NIGHT: the board under the canopy, the WHO HAS WHAT sheet ripped off (bare pin); flash-cut at ~2.8 s to Gord's tent glowing with his silhouette, then dark. PREVIOUSLY sign.",
     "The bare pin on the board.", "Gord's tent dark.",
     [S(0.2, 1.6, "PREVIOUSLY: DAY 4"), N(1.8, 6.3, "A working camp. A secret. A list in Gord's tent.")]),
  sc("s02", "Day Nine", "camp9", {"light": "morning"}, 6,
     "MORNING, the camp visibly changed since Day 4 (more tents, faded and torn tarps, a half-bare supply table, the rain-catch tarp dry). 0–2.6 s the RAINY DAY title sting (exactly like Ep 4 s02); 2.6–6 s the big DAY card 'DAY 9' with subtitle 'THE LONG WAIT' (exactly like Ep 4 s04's DAY 4 card). Slow push over the camp. No dialogue.",
     "Title over the morning camp.", "DAY 9 card.",
     []),
  sc("s03", "Since Last Time", "camp9", {"light": "morning"}, 8,
     "MORNING. 'Since last time' MONTAGE: 5 hard cuts of ~1.5 s, each a tight framing of ONE change since Day 4: (1) the rain-catch tarp sagging DRY over an empty barrel (a spider web across it); (2) the water-heater tap open, nothing coming out, one drip; (3) the bleach jug, almost empty, tipped to show the last inch; (4) the supply table half bare, the FOOD label beside two cans; (5) a wide of the camp with MORE tents crowded in and laundry stiff in the sun.",
     "Dry rain catch.", "The crowded camp.",
     [N(0.6, 7.6, "Five days. No rain. The sky forgot how.")]),
  sc("s04", "The Count", "camp9", {"light": "morning"}, 6,
     "MORNING. The three TRACKER CARDS slide in stacked at left exactly like Ep 4 s05 (same card design), now reading WATER LEFT · 2 DAYS, FOOD LEFT · 6 DAYS, PEOPLE IN CAMP · 205; the WATER number lands with a small red-free shake (it dropped from 6). Behind, a line of people with empty jugs at the tank.",
     "Camp, a jug line.", "Three cards up.",
     [N(1.0, 5.7, "Two days of water. Two hundred five people.")]),
  sc("s05", "Rations", "camp9", {"light": "sun"}, 24,
     SUN + " The supply table (picnic table) in hard sun. GORD stands behind it with his clipboard; a hand-lettered sign taped to the table: 'WORKERS: FULL RATIONS'. A short line of people. DARLA (dead phone in hand) with her two kids (kid extras) argues; Gord taps the sign. MAGS steps in between, takes the water jug off the RATIONS side and sets it in the middle, apart from the food. Drizzle beside her with the near-empty jug (the h1 jug). Cuts: low angle on Gord behind the table (sun behind him), over-the-shoulder from Darla onto Gord, close-up of the RATIONS sign under Gord's tapping pen, wide.",
     "Gord behind the table.", "Mags' hand flat on the table between the water and the food.",
     [D(0.4, 3.4, "GORD", "Workers get full rations. That's fair.", "GORD PIKE"),
      D(4.0, 6.4, "DARLA", "My kids can't haul water!", "DARLA FINCH"),
      D(7.0, 8.8, "GORD", "Then they get half."),
      D(9.8, 12.0, "MAGS", "Ration food. Never water."),
      D(12.6, 15.8, "MAGS", "Drink what you need. Then go find more."),
      S(16.6, 23.4, "RATION FOOD, NOT WATER. DRINK WHAT YOU NEED.")]),
  sc("s06", "Dried Out", "camp9", {"light": "sun"}, 24,
     SUN + " By the boiling station in the glare. BENNY (silent) staggers in carrying two jugs, sways, sets them down and sits hard, a hand on his head; Drizzle catches his arm. Mags kneels, checks him (hand on his forehead, looks at his face), then mixes a cup: safe water from a boiled jug, a pinch of salt, a spoon of sugar from small labeled tins ('SALT', 'SUGAR'), stirs, hands it to him. Drizzle fans Benny with a clipboard. Close-up of the cup and the two tins. Last beat: Mags stands, picks up two empty jugs and looks off toward the woods.",
     "Benny staggering with jugs.", "Mags with the empty jugs, looking off.",
     [D(0.6, 2.6, "DRIZZLE", "Benny? Whoa, sit."),
      D(3.2, 6.4, "MAGS", "Dizzy. Headache. He's dried out."),
      S(7.0, 12.4, "DEHYDRATION: THIRST, DARK URINE, DIZZINESS, HEADACHE"),
      D(13.0, 15.4, "MAGS", "Safe water. Salt and sugar."),
      D(16.0, 19.2, "MAGS", "Mixed by a trusted recipe. Not a guess."),
      D(21.0, 23.4, "MAGS", "The creek. Now.")]),
 ]},
 {"part": 2, "title": "Upstream", "hook": "Drizzle: Mags... the tide's out.", "scenes": [
  sc("s07", "The Creek", "ravineCreek", {}, 24,
     "MIDDAY in a forested RAVINE: dappled light through the canopy (moving light patches), ferns, mossy boulders, a wide rocky creek bed with only a thin trickle down the middle. No rain. Mags and Drizzle climb down with four empty jugs. Drizzle cups his hands under the trickle and raises them to drink; Mags catches his wrist. Wide establishing with them tiny among the boulders; medium two-shot; close-up of the trickle over a mossy lip; close-up of the cupped hands.",
     "Two tiny figures at the top of the ravine.", "Mags holding Drizzle's wrist, the water running out of his hands.",
     [D(0.6, 3.6, "DRIZZLE", "That's not a creek. That's a leak."),
      D(4.2, 6.8, "MAGS", "It's water. That's what matters."),
      D(9.4, 12.0, "MAGS", "Not yet. It looks clean. It isn't."),
      D(12.6, 15.6, "MAGS", "Boil it or treat it. Every time."),
      S(16.4, 23.4, "CREEK WATER: BOIL OR TREAT IT, EVEN IF IT LOOKS CLEAN")]),
  sc("s08", "One Jug", "ravineCreek", {}, 12,
     "Same ravine, a little later. Close-up: a jug mouth under the trickle, filling drip by drip (water line rising slowly). Drizzle holds it, bored, then sits on a mossy rock. Over-the-shoulder from Drizzle down the ravine. At ~9 s, distant shouting from the ridge above: Mags looks up the slope (we hear it, the figure is tiny and silhouetted on the ridge road).",
     "Jug under the trickle.", "Mags looking up at the ridge.",
     [N(0.6, 4.6, "Twenty minutes. One jug."),
      D(8.4, 11.6, "DARLA", "The Army's at the bridge! Buses!")]),
  sc("s09", "The Bridge", "gullCreekBridge", {}, 26,
     "AFTERNOON, flat bright haze, wind in the gorge. The collapsed Highway 101 bridge over Gull Creek: the concrete deck snapped in the middle, the far half fallen into the gorge, rebar sticking out, a bent guardrail, a 'HWY 101' shield sign. On the near approach ~20 people wait with bags and suitcases at a hand-lettered cardboard sign 'BUS →'. Darla in front, phone up. Mags (with her radio) and Drizzle arrive with full jugs. Shots: wide with the crowd tiny at the broken edge; low angle up at the crowd; close-up of the cracked deck edge and dangling rebar over the drop; over-the-shoulder Mags→Darla.",
     "Crowd waiting at the broken edge.", "Mags lifting her radio.",
     [D(0.6, 3.4, "DARLA", "Buses at noon. Everyone's going!"),
      D(5.0, 6.6, "MAGS", "Who said?"),
      D(7.2, 10.2, "DARLA", "Somebody heard it on the radio."),
      D(11.0, 13.8, "MAGS", "Then we wait for the radio."),
      N(15.0, 20.4, "Twenty people waited for a bus that was never coming."),
      D(21.4, 24.6, "DRIZZLE", "There's no road for a bus.")]),
  sc("s10", "The Real Broadcast", "gullCreekBridge", {}, 18,
     "Same place. Mags sits on the guardrail stub and cranks the radio (crank circling, static squiggles); the crowd leans in. On the RADIO lines faces fall; people sit down on their suitcases; Darla lowers her phone. Last beat: Drizzle at the broken edge looks down the gorge toward the sea: far below, the tide is OUT (mud flats shining). Close-up: the radio in Mags' hands; wide from below the bridge with the crowd tiny on the deck.",
     "Mags cranking.", "Drizzle at the edge looking down the gorge.",
     [D(0.6, 4.4, "RADIO", "...no evacuation is scheduled... for Gull Harbor..."),
      D(5.0, 8.2, "RADIO", "...remain where you are... await instructions..."),
      S(9.0, 14.4, "RUMORS: WAIT FOR AN OFFICIAL SOURCE BEFORE YOU ACT"),
      D(15.0, 17.6, "DRIZZLE", "Mags... the tide's out.")]),
 ]},
 {"part": 3, "title": "Low Tide", "hook": "Drizzle: Is that... Hank? With a pack?", "scenes": [
  sc("s11", "Mud Flats", "tideFlats", {}, 24,
     "LATE AFTERNOON, long low sun from the RIGHT, long shadows. The edge of the flooded town at LOW TIDE: wide shining mud flats, a fishing boat sitting on a house ROOF, the debris line (planks, a tire, a chair), houses with mud lines, the receding water far out. Drizzle sinks to the shins in mud (close-up of the boot stuck, sucking free); he finds a split crate of cans half buried and holds one up, delighted; Mags shakes her head and taps a dented, swollen can; she sets aside two undamaged ones. Wide with the two tiny on the flats; low angle across the mud; close-up of the cans.",
     "Two tiny figures at the edge of the flats.", "Two clean cans set apart on a plank.",
     [D(0.6, 3.4, "DRIZZLE", "Soup! Beans! Dinner!"),
      D(4.0, 6.4, "MAGS", "Floodwater touched those."),
      D(7.0, 10.6, "MAGS", "Only sealed cans. No dents. Wash them first."),
      S(11.4, 18.4, "FLOODWATER FOOD: THROW IT OUT. ONLY UNDAMAGED CANS CAN BE CLEANED."),
      D(19.2, 22.6, "DRIZZLE", "Goodbye, beans. I barely knew you.")]),
  sc("s12", "The Boat", "tideFlats", {}, 14,
     "Same place. Drizzle climbs the debris pile to the boat on the roof and looks into the wheelhouse; he comes out holding a plastic WHISTLE on a lanyard (close-up of the whistle in his hand, the lanyard swinging). Mags below, shading her eyes against the low sun.",
     "Drizzle climbing.", "Drizzle holding the whistle up.",
     [D(0.6, 2.6, "DRIZZLE", "Found a whistle!"),
      D(3.4, 6.4, "MAGS", "Keep it. Somebody'll need it."),
      N(7.6, 13.0, "It was a long walk home. Uphill. With all of it.")]),
  sc("s13", "The Knee", "loggingRoad", {}, 26,
     "GOLDEN HOUR: low warm-gray sun (pale amber light, never slicker yellow), long shadows, dust in the light shafts. A steep old logging road climbing back toward camp: gravel, ruts, stumps, slash piles, a rusted gate. Mags insists on carrying two full jugs; Drizzle carries two. Mid-stride her knee buckles (implied only: she drops to one knee, jugs down, a hand on the knee, wincing); Drizzle drops his jugs and kneels. He sits her on a stump, props the leg straight on a jug, then pulls her arm over his shoulders. Shots: low angle up the steep road; close-up of the jug hitting the gravel; two-shot; close on Mags' face (pain, fury).",
     "Climbing the road.", "Drizzle lifting Mags, her arm over his shoulders.",
     [D(0.8, 3.2, "MAGS", "I'm fine. Keep walking."),
      D(6.0, 7.4, "DRIZZLE", "Mags!"),
      D(8.0, 10.4, "MAGS", "Knee. It's the knee."),
      D(11.0, 13.6, "DRIZZLE", "Stop. Don't stand on it."),
      S(14.2, 19.6, "INJURED KNEE: STOP. SUPPORT IT. SHARE THE LOAD."),
      D(20.2, 22.4, "DRIZZLE", "Arm over me. I've got the water.")]),
  sc("s14", "Up the Road", "loggingRoad", {}, 16,
     "Same golden hour, later. Wide shot, the two TINY on the long steep road: Drizzle half-carrying Mags, a jug in his free hand, the others roped on his back. Then a medium from behind (over Drizzle's shoulder) as they reach the top: ahead, a figure with a big pack walks AWAY along a side road into the trees. Drizzle squints.",
     "Two tiny figures on the long road.", "The pack-carrying figure in the distance.",
     [N(0.6, 6.2, "For nine days Mags had carried everyone. Now somebody carried her."),
      D(11.8, 15.4, "DRIZZLE", "Is that... Hank? With a pack?")]),
 ]},
 {"part": 4, "title": "Three Blasts", "hook": "NEXT: DAY 16", "scenes": [
  sc("s15", "Hank", "forestRoad", {}, 28,
     "DUSK: mauve-gray sky with a pale glow low in the west, the forest road narrowing as it disappears into dark hills; silhouetted firs; a rusted road sign 'HWY 4 →'. HANK DORSEY (big pack, a ring of car keys he jangles) stops when Drizzle catches up (Drizzle has left Mags sitting on a log at the junction, small in the background). Drizzle tears a page from a notebook, makes Hank write on it, then presses the WHISTLE into his hand and closes Hank's fingers over it. Shots: wide with both small on the road; over-the-shoulder Hank→Drizzle; close-up of the note being written; close-up of the whistle in Hank's hand.",
     "Hank walking away.", "Hank holding the whistle.",
     [D(0.6, 4.4, "HANK", "No offense. I'm not dying on a hill for a clipboard.", "HANK DORSEY"),
      D(5.0, 7.2, "DRIZZLE", "Then don't go alone."),
      D(7.8, 9.8, "HANK", "Nobody's coming with me."),
      D(10.6, 14.0, "DRIZZLE", "Then write your route. And when you'll be back."),
      D(15.2, 17.8, "HANK", "Highway 4. East. Three days."),
      D(18.6, 21.0, "DRIZZLE", "Three blasts if you're in trouble."),
      S(21.8, 27.4, "NEVER TRAVEL ALONE. LEAVE YOUR ROUTE AND RETURN TIME.")]),
  sc("s16", "Into the Hills", "forestRoad", {}, 12,
     "DUSK deepening. Wide: Hank tiny, walking up the road into the dark hills, keys glinting once. Close-up: the note in Drizzle's hand — 'HANK · HWY 4 EAST · BACK DAY 12'. Drizzle looks up the road; Hank is gone.",
     "Hank tiny on the road.", "The empty road.",
     [N(0.8, 6.0, "He walked into the hills with a whistle and a promise."),
      D(7.6, 10.4, "DRIZZLE", "Day twelve, Hank. I'm counting.")]),
  sc("s17", "Three Blasts", "nightWoods", {}, 32,
     "NIGHT at the edge of the woods below the camp: a clear sky full of STARS for the first time, black fir trunks, two flashlight beams (Drizzle's and WES's — Wes silent, rope coil on his shoulder) sweeping through the trees, breath fog. Drizzle stops dead; far off in the trees, three thin whistle blasts (show as three tiny pale sound arcs far away). Both beams swing toward the sound. Drizzle shouts; silence; the beams search; nothing. Hold on the dark trees. At 28.4 s the NEXT sting 'NEXT: DAY 16' (same card as Ep 4 s18). Shots: wide with the two tiny beams in the black woods; low angle up through trunks to the stars; close-up of Drizzle's face lit by his beam; over-the-shoulder into the dark.",
     "Two beams in the woods.", "Dark trees; NEXT: DAY 16.",
     [D(3.6, 5.2, "DRIZZLE", "Wes. Listen."),
      S(9.0, 13.4, "THREE BLASTS = DISTRESS"),
      D(14.2, 15.8, "DRIZZLE", "HANK?!"),
      N(19.2, 23.0, "Three blasts. Then nothing.")]),
 ]},
]
ep = {
 "episode": 5, "title": "DAY 9: THE LONG WAIT", "version": 1,
 "lessons": [
  "Ration food, not water: drink what you need today and look for more; people last far longer without food than without water.",
  "Creek water must be boiled or treated even when it looks clean.",
  "Dehydration: thirst, dark urine, dizziness, headache. Give safe water; an oral rehydration drink (safe water + salt + sugar) only mixed by a trusted recipe.",
  "Food that touched floodwater goes in the trash; only undamaged, sealed commercial cans can be washed and sanitized.",
  "Rumors: wait for an official source before acting.",
  "Never travel alone; leave your route and return time; three of anything (whistle blasts) = distress.",
  "An injured knee: stop, support it, share the load (no procedure shown).",
 ],
 "cast_notes": "Speaking: DRIZZLE, MAGS, GORD (tag on first line), DARLA (tag), HANK (tag; first time named on screen), plus NARRATOR and RADIO. Silent: BENNY (dehydrated), WES (night search), Darla's two kids, crowd. Voices: docs/voice-cast-v1.md (no new characters).",
 "parts": parts,
}
open(os.path.join(ROOT, "episodes/ep05/ep05-scenes-v1-draft.json"), "w").write(json.dumps(ep, indent=1, ensure_ascii=False))
n = sum(1 for p in parts for s in p["scenes"] for c in s["captions"] if c["kind"] != "sign")
print("lines:", n, "| parts:", [round(sum(s["duration"] for s in p["scenes"]), 1) for p in parts], "| total", sum(s["duration"] for p in parts for s in p["scenes"]))
