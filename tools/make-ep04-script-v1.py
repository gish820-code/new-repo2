#!/usr/bin/env python3
"""Rainy Day — Episode 4 ("DAY 4: THE CAMP") script data, v1 draft (authored cue times; the audio builder retimes them
to the recorded lines). Writes episodes/ep04/ep04-scenes-v1-draft.json. Source: docs/series-bible-v3.md §2 Ep 4, §3, §9."""
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


DAY = "DAY (Episode 4 is the series' first daylight episode since Episode 2: flat gray overcast, light rain, no night grade)."
parts = [
 {"part": 1, "title": "First Light", "hook": "Gord: And what you've got goes on my list too.", "scenes": [
  sc("h1", "Cold Open", "hilltopCamp", {"crowd": False, "fog": 0.4}, 2.6,
     "COLD OPEN (flash-forward to s18, NIGHT): extreme close on the sign-up board under the canopy, lit by one flashlight. Gord's big hand (steel vest sleeve) peels the sheet headed 'WHO HAS WHAT' off the board; the drawing pin pops. Mags' radio static rides under it.",
     "The board, the sheet pinned.", "The sheet gone; a bare pin.",
     [D(0.2, 2.4, "RADIO", "...population centers first...")]),
  sc("s01", "Previously", "townView", {"fog": 0.4}, 7,
     "RECAP of Episode 3 (fast, slight film-flicker/vignette like Ep 3 s01): NIGHT town view; the hardware store far below; THREE pale blinks of a flashlight on its roof (hard white dots at 0.8, 1.2 and 1.6 s); at ~3 s a flash-cut to the inside of Gord's tent (the go-bag in a beam). 'PREVIOUSLY' sign.",
     "Dark town, the roof.", "The bag in Gord's tent.",
     [S(0.2, 1.6, "PREVIOUSLY: DAY 1 · NIGHT"), N(1.7, 6.8, "A fire. A missing man. Three blinks from a roof.")]),
  sc("s02", "First Light", "hillsideTrail", {}, 5,
     DAY + " Title open: 0–3 s the 'RAINY DAY' title sting (yellow League Gothic, hand-drawn underline, exactly like Ep 3 s02) over the trail at grey first light; under it Wes, Drizzle and Benny walk DOWN the trail (right→left), roped together at the waist, Wes in front with a coil of rope on his shoulder.",
     "Title over the empty trail.", "Three roped figures heading down.",
     [N(1.0, 4.8, "First light, Day 2. Three buddies. One rope.")]),
  sc("s03", "The Roof", "mainStreet", {"damage": 1}, 20,
     DAY + " Main Street after the water: mud, debris, the harbor low (harbor.setLevel near lowY/drainedY). The hardware store (buildings.hardware, GULL HARBOR wall sign). CAL PRUITT sits on the edge of the flat roof/parapet, one leg out stiff (ankle), waving his cap. Wes runs in below and shouts up; Drizzle and Benny follow, still roped. Wes climbs a fallen ladder/debris pile; they pass a rope up; Cal ties on; Wes and Benny take his weight and Drizzle braces at the back of the line (comic strain). Cal is lowered down onto Wes' shoulder. Ends with Cal standing on one foot between Wes and Benny, arms over their shoulders; Drizzle flops back in the mud.",
     "Cal on the roof edge.", "Cal down, propped between Wes and Benny; Drizzle sitting in the mud.",
     [D(0.4, 2.0, "WES", "Cal! CAL!", "WES PRUITT"),
      D(2.6, 4.6, "CAL", "Took you long enough.", "CAL PRUITT · Wes's twin"),
      D(5.0, 7.6, "CAL", "Ankle's gone. Rest of me's fine."),
      D(8.6, 10.8, "WES", "Rope on. Nobody unclips."),
      D(15.2, 19.4, "DRIZZLE", "Good news: he's alive. Bad news: he's heavy.")]),
  sc("s04", "Day Four", "hilltopCamp", {"crowd": True, "fog": 0.3}, 9,
     DAY + " 0–2.6 s: the big DAY card — 'DAY 4' in League Gothic slicker yellow with the hand-drawn underline and a small subtitle 'THE CAMP' (same treatment as Ep 2's DAY 1 card) over the camp. Then the 'since last time' MONTAGE: 5 hard cuts of ~1.25 s, each a tight framing on ONE concrete change in the camp: (1) the BOILING STATION — Benny's two-burner stove on a flat rock outside, a big pot with steam; (2) a LATRINE SCREEN (tarp on poles) far downhill with a hand-lettered sign 'LATRINE →'; (3) a FIRST-AID corner — a crate with a hand-lettered paper cross sign 'FIRST AID' under the canopy; (4) the SIGN-UP BOARD — a sheet 'SHIFTS: WATER / WOOD / LATRINE / WATCH' with names; (5) two kids carrying a water jug between them. No dialogue.",
     "DAY 4 card.", "Kids with the jug.",
     [N(2.8, 8.6, "Three days. No helicopter. But the camp had a toilet.")]),
  sc("s05", "The Count", "hilltopCamp", {"crowd": True, "fog": 0.3}, 6,
     DAY + " The three TRACKER CARDS (bible §3.2) slide in stacked at left over the busy camp (paper cards on a dark panel, League Gothic numbers, ink labels): WATER LEFT 6 DAYS · FOOD LEFT 10 DAYS · PEOPLE IN CAMP 212. Each card lands with a small bounce, 0.4 s apart. Behind, the camp works (extras carrying wood, water).",
     "Camp at work.", "Three cards up.",
     [N(1.2, 5.8, "Two hundred twelve people. Every one of them with a job.")]),
  sc("s06", "By Twos", "hilltopCamp", {"crowd": False, "fog": 0.3}, 14,
     DAY + " Under/in front of the canopy. MS. ORTEGA (new: the teacher; steel rain shell, short fog-gray hair, a coach's whistle on a lanyard at her chest) blows the whistle at 0.1–0.6 s (two short blasts; draw small puff lines) and a line of kids and a few adults forms in pairs in front of her. Drizzle hops into line, looks around for a partner, grabs Mags' arm; Mags looks at him over her glasses.",
     "Ortega with the whistle; people milling.", "A neat double line; Drizzle arm-in-arm with Mags.",
     [D(1.0, 2.8, "MS. ORTEGA", "Line up by twos!", "MS. ORTEGA · the teacher"),
      D(2.8, 5.8, "MS. ORTEGA", "Buddy's name, out loud. Adults too."),
      D(6.4, 10.0, "DRIZZLE", "Drizzle! My buddy is... Mags."),
      D(10.6, 12.6, "MAGS", "Lucky me.")]),
  sc("s07", "The Board", "hilltopCamp", {"crowd": True, "fog": 0.3}, 15,
     DAY + " Gord at his BEST: standing by the sign-up board in the canopy (canopy.board = the old missing-persons whiteboard, now with a paper SHIFTS sheet and a second sheet 'WHO HAS WHAT' pinned beside it), clipboard in hand, upbeat, pointing people to the sheets; extras queue and write their names. Drizzle signs up (big flourish). Last line: Gord taps the WHO HAS WHAT sheet with his pen and smiles a little too long (hold on him).",
     "Gord at the board.", "Gord tapping the WHO HAS WHAT sheet, smiling.",
     [D(0.4, 2.6, "GORD", "Folks! Shifts are on the board.", "GORD PIKE"),
      D(3.0, 6.0, "GORD", "Water, wood, latrine, watch. Sign up."),
      D(6.6, 9.0, "DRIZZLE", "Latrine. Somebody has to."),
      D(9.8, 14.4, "GORD", "And what you've got goes on my list too.")]),
 ]},
 {"part": 2, "title": "Clean Water", "hook": "Tess: Come with me. Alone.", "scenes": [
  sc("s08", "Boiling Station", "shelter", {"fog": 0.3}, 18,
     DAY + " Shelter set: BENNY OCHOA's boiling station OUTSIDE in the open on the flat rock (front right): the two-burner camp stove (pale flame), a big pot with a rolling boil (bubbles + steam), a row of jugs. Benny stands proudly by it with a wind-up kitchen timer; his son LEO (kid extra) beside him. Drizzle arrives with two jugs. Benny turns the timer; the boil keeps rolling through the sign.",
     "Benny by the stove.", "Pot at a rolling boil, timer ticking.",
     [D(0.4, 3.0, "BENNY", "Stove stays outside. Learned that one.", "BENNY OCHOA"),
      D(3.6, 7.0, "BENNY", "Rolling boil. One full minute."),
      D(7.6, 9.6, "DRIZZLE", "And the timer?"),
      D(10.0, 12.6, "BENNY", "Nothing else to do up here."),
      S(13.2, 17.6, "BOIL: A ROLLING BOIL FOR 1 FULL MINUTE")]),
  sc("s09", "Bleach", "shelter", {"fog": 0.3}, 18,
     DAY + " Under the tarp: Mags at the crate with the rain-catch BUCKET (clear water) and a white jug of household bleach with a hand-drawn label 'BLEACH · UNSCENTED' (no brand). She holds up the jug and taps the label, counts drops (tiny drops from the cap), stirs with a stick, then holds up a hand: wait. Drizzle crouches by the bucket, staring at it.",
     "Mags with the jug.", "Drizzle staring at the bucket, waiting.",
     [D(0.4, 3.0, "MAGS", "Clear water, no fuel? Bleach.", ),
      D(3.4, 6.6, "MAGS", "Unscented. The label tells you how many drops."),
      D(7.2, 8.8, "DRIZZLE", "Then we drink?"),
      D(9.2, 11.8, "MAGS", "Stir. Then wait thirty minutes."),
      S(12.4, 17.6, "BLEACH: UNSCENTED ONLY · DROPS PER LABEL · WAIT 30 MIN")]),
  sc("s10", "First Aid", "hilltopCamp", {"crowd": False, "fog": 0.3}, 21,
     DAY + " The FIRST-AID corner in the left bay of the canopy: a crate table with a paper cross sign 'FIRST AID'. DANA REYES (forearm in white gauze) kneels by CAL, who sits on a cooler with his ankle splinted (two boards + strips of cloth), leg up on a crate. Drizzle walks in carrying HIS first-aid kit (his go-bag is back — Gord handed it over this morning, empty of nothing but the water; the 'found' is said with air quotes: Drizzle does finger quotes) (the red-cross pouch from his go-bag, drawn in muted gray/paper with an ink cross — no red) and sets it on the crate. Dana raises an eyebrow; Drizzle pats it.",
     "Dana and Cal at the crate.", "The kit open on the crate; Drizzle proud.",
     [D(0.4, 2.8, "DANA", "Sit. Foot up. Don't look.", "DANA REYES · first aid"),
      D(3.2, 5.2, "CAL", "Wasn't gonna look."),
      D(6.0, 8.2, "DRIZZLE", "Here. The whole kit."),
      D(8.8, 11.0, "DANA", "Gord gave your bag back?"),
      D(11.4, 13.0, "DRIZZLE", "He \"found\" it."),
      D(13.8, 19.6, "DRIZZLE", "It's not a snack bag anymore. It's the camp's.")]),
  sc("s11", "Not Here", "hilltopCamp", {"crowd": False, "fog": 0.3}, 15,
     DAY + " By the tents (tents[0..1] area). TESS (padlocked duffel on her shoulder) has been watching Drizzle from her tent; MILO (with a small flashlight on a lanyard round his neck) tugs her coat. Tess walks over to Drizzle, glances at the crowd near the canopy, keeps her voice low; she nods toward the back of the shelter/cabin (off left). Drizzle looks back at Mags, then follows.",
     "Tess watching, Milo tugging.", "Tess walking off; Drizzle following.",
     [D(0.6, 2.6, "MILO", "Mom. Tell him.", "MILO VARGA"),
      D(4.2, 6.4, "TESS", "Drizzle. Not here.", "TESS VARGA"),
      D(7.6, 11.0, "TESS", "Come with me. Alone.")]),
 ]},
 {"part": 3, "title": "Downhill", "hook": "Radio: ...this is the emergency... ", "scenes": [
  sc("s12", "The Duffel", "shelter", {"fog": 0.4}, 22,
     DAY + " Behind the cabin by the utility shed (shelter set, right side), out of sight of the camp. Tess kneels, unlocks the padlock with a small key on a cord, unzips the duffel: inside, neatly packed, a small insulated pouch; she opens it — small vials and pens (draw as paper/fog rounded shapes with ink caps). Close insert panel on the vials. Drizzle crouches, serious for once. On his promise he draws an X over his heart. Milo watches from the corner.",
     "Tess kneeling at the duffel.", "Duffel zipped again; Drizzle's hand on his heart.",
     [D(0.6, 2.8, "TESS", "Insulin. Milo's."),
      D(4.6, 6.6, "DRIZZLE", "Does it need a fridge?"),
      D(7.2, 10.6, "TESS", "It lasts a few weeks out of one."),
      D(11.4, 14.4, "TESS", "If they know, they'll want it."),
      D(15.4, 20.6, "DRIZZLE", "Then nobody knows. Promise.")]),
  sc("s13", "Two Hundred Feet", "hillsideTrail", {}, 20,
     DAY + " Below the camp on the slope (the hillside trail, the water tank / creek NOT on this side — keep the bay far left). Mags (radio on her hip) and Drizzle walk DOWNHILL (right→left along trailY), Drizzle counting giant steps out loud with a shovel over his shoulder; Mags points back uphill (toward the camp and its water) and then down at a spot well below. Drizzle drives the shovel in. A small hand-lettered stake 'LATRINE' goes in.",
     "Mags and Drizzle leaving the camp edge.", "The shovel in the ground, the LATRINE stake.",
     [D(0.4, 3.2, "MAGS", "Downhill. Well away from the water."),
      D(4.0, 6.4, "DRIZZLE", "Seventy-one. Seventy-two."),
      D(7.0, 10.0, "MAGS", "Two hundred feet. Then dig."),
      S(11.0, 19.4, "LATRINE: 200 FT / 60 M FROM WATER AND CAMP, DOWNHILL")]),
  sc("s14", "Soap", "hillsideTrail", {}, 16,
     DAY + " Same place, an hour later: a tarp LATRINE SCREEN on three poles; beside it a HAND-WASH station — a jug hung on a post with a stick tap, a bar of soap on a string, a basin below. Drizzle steps out from behind the screen, proud, and gives a thumbs up; Mags points at the soap without a word; Drizzle washes his hands (water stream from the jug), then shakes them dry.",
     "Screen up; Drizzle stepping out.", "Drizzle washing his hands.",
     [D(0.4, 5.0, "DRIZZLE", "Good news: I'm still waterproof. Bad news: so is the latrine."),
      D(5.8, 8.6, "MAGS", "Soap after. Every time. Everyone."),
      S(9.2, 15.6, "WASH HANDS WITH SOAP AFTER EVERY USE")]),
  sc("s15", "Protect It", "hilltopCamp", {"crowd": True, "fog": 0.3}, 18,
     DAY + " The water tank (far left, the taped crack) and a rain-catch tarp funneling into barrels beside it. WES strings a rope barrier on stakes around it; CAL (one foot, a crutch made of a branch) hangs a hand-lettered sign 'DRINKING WATER ONLY · NO WASHING'. A kid starts to rinse a muddy boot in a barrel — Wes gently steers him away. At ~15 s Mags' radio (she is passing by) crackles: she stops, lifts it (static squiggles).",
     "Wes with rope and stakes.", "Rope + sign up; Mags lifting the crackling radio.",
     [D(0.4, 3.0, "WES", "Rope it off. Nobody washes here."),
      D(3.6, 5.6, "CAL", "Drinking only. Sign says so."),
      S(6.4, 12.0, "MARK AND PROTECT THE WATER SOURCE"),
      D(14.8, 17.6, "RADIO", "...this is the emergency...")]),
 ]},
 {"part": 4, "title": "The List", "hook": "NEXT: DAY 9", "scenes": [
  sc("s16", "Population Centers", "hilltopCamp", {"crowd": True, "fog": 0.3}, 22,
     DAY + " (late afternoon, a little darker). Under the canopy the crowd presses around Mags, who sits cranking the radio (crank circling, static squiggles). Faces lean in. DARLA (dead phone in her hand, checking it) turns to the crowd, scared. Gord climbs onto the picnic table with his clipboard and raises both hands, steady and calm (he is good at this).",
     "Crowd around the radio.", "Gord on the table, hands up; the crowd settling.",
     [D(0.4, 4.4, "RADIO", "...relief prioritized... for population centers..."),
      D(5.0, 8.4, "RADIO", "...smaller coastal communities... to follow..."),
      D(9.2, 12.0, "DARLA", "To follow? Follow when?", "DARLA FINCH"),
      D(13.0, 15.6, "GORD", "Folks. We're fine."),
      D(16.0, 18.6, "GORD", "We have a plan. We have a list.")]),
  sc("s17", "Everybody Gets a Job", "hilltopCamp", {"crowd": False, "fog": 0.4}, 22,
     "EVENING (dusk grade like Ep 3 s02): the fire ring (firePit) with small pale flames; Drizzle, Mags and Milo sit around it, Milo playing his lanyard flashlight over the ground. In-character recap of the lessons. On 'Head of flashlights' Milo clicks the light on under his chin and grins.",
     "Three at the fire.", "Milo grinning, light under his chin.",
     [N(0.4, 4.6, "In most disasters, people help each other first."),
      D(5.2, 8.4, "DRIZZLE", "Boil one minute. Latrine downhill."),
      D(9.0, 11.8, "MAGS", "Soap. And everybody gets a job."),
      D(12.6, 14.0, "MILO", "Even me?"),
      D(14.6, 18.2, "DRIZZLE", "Especially you. Head of flashlights.")]),
  sc("s18", "The List", "hilltopCamp", {"crowd": False, "fog": 0.4}, 24,
     "NIGHT (night grade like Ep 3, figures lit by one flashlight). The empty canopy; the sign-up board with the SHIFTS sheet and the WHO HAS WHAT sheet. Gord comes in with a flashlight, looks over his shoulder at the dark camp, and peels the WHO HAS WHAT sheet off the board (pin pops; same framing as the cold open), folds it, tucks it into his clipboard, and walks to his tent (tents[1] with the G. PIKE sign and clipboard from Ep 3 v2), ducks inside; the tent glows, then goes dark. Across the camp, Drizzle (by the fire ring, small) looks up. At 20.4 s the NEXT sting: 'NEXT: DAY 9' (same card treatment as Ep 3 v2 s17: big title once, no caption copy) over the dark camp.",
     "The empty board at night.", "Gord's tent dark; NEXT: DAY 9.",
     [N(0.6, 4.6, "That night, the list of who had what..."),
      N(9.0, 12.6, "...went into Gord's tent.")]),
 ]},
]
ep = {
 "episode": 4, "title": "DAY 4: THE CAMP", "version": 1,
 "lessons": [
  "Sanitation: put the latrine at least ~200 ft (60 m) from water and from camp, downhill; wash hands with soap (or sanitizer) after every use.",
  "Safe drinking water: bring clear water to a rolling boil for 1 minute; or disinfect clear water with UNSCENTED household bleach — the number of drops is on the label (about 8 drops per gallon for 6% bleach), stir, wait 30 minutes.",
  "Disaster communities: in the first days people usually cooperate — organize shifts and give everyone a job, including kids.",
  "Mark and protect the water source: rope it off, label it, no washing or rinsing near it.",
 ],
 "cast_notes": "First lines: MS. ORTEGA (new look: rig extra — steel coat, short fog hair, coach's whistle on a lanyard drawn as a prop), CAL PRUITT (same look as Wes — identical cap — plus an ankle splint and a branch crutch from s10 on), BENNY OCHOA (Ep 3 v2 look), DARLA FINCH (Ep 3 v2 look), LEO (Benny's son, kid extra, silent). Drizzle has NO go-bag on his back (the bag came back from Gord's tent empty-handed off screen; its first-aid kit goes to Dana in s10). Voices: docs/voice-cast-v1.md.",
 "parts": parts,
}
open(os.path.join(ROOT, "episodes/ep04/ep04-scenes-v1-draft.json"), "w").write(json.dumps(ep, indent=1, ensure_ascii=False))
n = sum(1 for p in parts for s in p["scenes"] for c in s["captions"] if c["kind"] != "sign")
print("lines:", n, "| parts:", [sum(s["duration"] for s in p["scenes"]) for p in parts], "| total", sum(s["duration"] for p in parts for s in p["scenes"]))
