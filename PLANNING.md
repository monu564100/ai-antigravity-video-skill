# Phase 0: Plan Before You Build Framework

> **MANDATORY**: This phase runs **BEFORE** executing `new_video.sh`, `voice.py`, `words.py`, or writing any code. Never jump directly into generation on a vague prompt.

When a user provides a video idea—whether detailed or vague (e.g., *"make a video about sharks"* or *"what happens if you swallow a seed"*):
1. **Analyze the user's prompt** against the **Brief Checklist**.
2. **Ask ONE concise round of questions** (maximum 5 questions) for any critical missing parameters, providing clear multiple-choice options with smart defaults marked `(Recommended)`.
3. If the user replies *"you decide"*, *"idk"*, or leaves fields blank, immediately populate them with smart defaults. **Never block on a missing answer.**
4. **Persist the brief** to `projects/<name>/brief.json` (or `<project-dir>/brief.json`).
5. **Present a clean, one-screen PLAN SUMMARY** and wait for user approval (**"go"**) before building.

---

## 1. Brief Checklist

| Field | Question | Smart Default (Fallback) |
| :--- | :--- | :--- |
| **topic** | What is the exact topic or question? | *(Required from user; if vague, propose 3 punchy angles)* |
| **goal** | Teach, entertain, myth-bust, or scare? | **Entertain + teach (myth-bust)** |
| **audience** | Who is watching? | **General, ages 12+, family-friendly** |
| **style** | Which visual style? | **Auto-recommended from topic** (see Style Recommender below) |
| **length** | What length? (30s / 45s / 55s / 60s / 90s) | **55s** (optimal for YouTube Shorts / Reels retention) |
| **hook** | Opening line type: shocking claim, question, countdown, or "what if"? | **Shocking claim / visual gag in first 3 seconds** |
| **tone** | Funny, serious, spooky, or calm? | **Fast & funny with a deadpan/curious narrator** |
| **character** | Recurring character featured? | **Justine (cowlick kid)** with animated skeletal arms via rig |
| **ending** | Open loop to Part 2, punchline loop, or clear takeaway? | **Open loop teaser to Part 2** |
| **language** | Narration language & voice? | **English** (`am_michael` Kokoro voice, 1.10–1.12x speed) |
| **facts** | Any mandatory facts, statistics, or sources? | **2–3 verified medical/scientific sources** cited in `script.json` |
| **extras** | Music mood, HUD labels, sound palette? | **Upbeat quirky music bed (ducked)** + procedural SFX on highlights |

---

## 2. Style Auto-Recommender

When the user doesn't specify a style, select automatically based on topic keywords:

| Topic Keywords / Category | Recommended Style | Key Visual Style & Camera |
| :--- | :--- | :--- |
| *"what happens if / inside the body / science / biology / medicine / space"* | **Deep Dive 3D** (`deep-dive`) | Sculpted clay 3D people, glowing cyan X-ray bodies, organ cutaways, first-person macro camera rides |
| *Funny true stories / folklore / quirky history / crazy character feats* | **Tall Tale 3D** (`tall-tale`) | Chunky 3D sunny small-town world, expressive cartoon characters, dramatic exaggeration, moving camera |
| *Fast anatomical cutaways / bite-sized 2D explainers / mechanical breakdowns* | **Inside Out** (`inside-out`) | Flat bold 2D graphics, cyan/red X-ray cuts, bold 1–3 word captions, snappy transitions |
| *Survival guides / life hacks / emergency steps / "what would you do if"* | **Stick Story** (`stick-story`) | Stylized stick heroes with expressive acting eyes, flat environments, gold tactical step cards |
| *Military history / battles / trade routes / geography / voyages* | **Paper Atlas** (`paper-atlas`) | Cut-paper textured parchment maps, crimson movement routes, gold ribbon dates, period figure silhouettes |
| *Unsolved mysteries / true crime / paranormal / eerie historical events* | **Night File 3D** (`night-file`) | Dark 3D environments, single harsh spotlight, red glowing silhouette subjects, typewriter text, case folders |

---

## 3. The Intake Protocol: ONE Round (Max 5 Questions)

If the prompt lacks essential details, ask **ONE** combined question block formatted with clear options:

### Example Intake Question Block:
```markdown
Got it! To tailor your short, please choose your preferences (or reply "default" to use recommended options):

1. Style:
   - [A] Deep Dive 3D (Zack D. Films-like 3D body/science explainer) (Recommended)
   - [B] Inside Out (Snappy 2D x-ray cutaway)
   - [C] Tall Tale 3D (Funny stylized cartoon story)

2. Length:
   - [A] 55 seconds (Recommended for Shorts/Reels algorithm)
   - [B] 30 seconds (Brisk & punchy)
   - [C] 45 seconds

3. Tone & Narrator:
   - [A] Funny & curious with deadpan narrator (Recommended)
   - [B] Pure science / serious documentary
   - [C] High-energy hype

4. Lead Character:
   - [A] Justine (boy with giant cowlick & animated reaction arms) (Recommended)
   - [B] Neutral test subject
   - [C] No character (prop/anatomy focus only)

5. Ending:
   - [A] Open loop teaser to Part 2 (Recommended)
   - [B] Punchline loop back to the start
   - [C] Direct summary takeaway

Reply with letters (e.g., "A, A, A, A, A" or "default") to proceed!
```

If the user says *"idk"*, *"you decide"*, or answers only a few, fill in all remaining fields with the `(Recommended)` defaults immediately.

---

## 4. `brief.json` Schema

Write the resolved configuration into `<project-dir>/brief.json`:
```json
{
  "topic": "What happens when you swallow a watermelon seed",
  "goal": "entertain + teach",
  "audience": "general, 12+, family-friendly",
  "style": "deep-dive",
  "length_target_s": 55,
  "hook_type": "shocking claim in first 3 seconds",
  "tone": "fast, funny, deadpan narrator",
  "character": {
    "name": "Justine",
    "type": "puppet",
    "features": ["giant cowlick", "articulated arms"],
    "required_reactions": ["panic", "point", "sigh", "celebrate", "shrug"]
  },
  "ending": "open loop",
  "language": "en",
  "voice": "am_michael",
  "speed": 1.12,
  "sources": [
    "Mayo Clinic (digestive tract seed transit & germination myths)",
    "Cleveland Clinic (cellulose outer coat resistance)"
  ],
  "music": "bed",
  "quality_gate_passed": false
}
```

---

## 5. One-Screen Plan Summary (Before Building)

Present this summary to the user and pause for confirmation (**"Build it?"**):

```markdown
### 📋 Production Plan: [Title]
* **Topic**: [Brief 1-line description]
* **Style**: [e.g., Deep Dive 3D (`deep-dive`)] · **Target Duration**: [e.g., ~55s (1,850 frames @ 30fps)]
* **Narrator & Tone**: [Voice, speed, delivery tone]
* **Character**: [Character name, rig, key arm reactions]
* **Hook (0:00–0:03)**: [Opening spoken line + visual action]
* **Key Visual Gags**:
  1. [Gag 1]
  2. [Gag 2]
  3. [Gag 3]
* **Shot Outline**:
  - Shots 1–5: Hook & Setup (Kitchen / real world)
  - Shots 6–10: Throat & Esophagus (First-person ride)
  - Shots 11–18: Stomach & Acid Bath (Shield HUD & wilted sprout gag)
  - Shots 19–23: Intestines & Villi (Roller coaster & crowd-surfing)
  - Shots 24–27: Exit & Open Loop Outro
* **Sound & Music**: Procedural ducked music bed + [N] highlight sound cues
* **Sources**: [Verified citations]

👉 Reply **"Go"** or **"Proceed"** to generate, or tell me any changes in plain English!
```

---

## 6. Phase 0 Quality Gate (Mandatory Pre-Render Check)

Before launching the final video capture (`capture.mjs video`), you must pass this 5-point quality gate:

1. **Deterministic Test Execution**:
   Run `node tools/capture.mjs check`. It must print `CHECK OK` across all frames with zero errors.
2. **Pacing Rule Verification**:
   Ensure a visual shot change, camera shift, snap zoom, or gag cut occurs every **2–3 seconds**. Flag any shot longer than 3.5s or any static frame longer than 1.5s.
3. **Rigged Arm Movement Audit**:
   Verify the character's arms are actively articulated and moving across at least 5 distinct poses. **Flag any shot where arms remain frozen in T-pose or rigid at sides.**
4. **Contact Sheet Inspection**:
   Run `node tools/capture.mjs sheet review/all.jpg 0.5 10` (or `0.6 10`). Inspect the generated contact sheet image. Verify lighting, framing, lack of blowout/overexposure, and caption visibility.
5. **Transparent Pre-Render Presentation**:
   Show the contact sheet to the user and report all findings before triggering `capture.mjs video`.
