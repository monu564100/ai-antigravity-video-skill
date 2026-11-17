# 🎬 AI Antigravity Video Skill

> **Code-only generative video engine**: narrated vertical shorts, $0 API cost, 100% local, deterministic $f(t)$ rendering.

[![Deterministic Render Check](https://img.shields.io/badge/Render-Deterministic%20f(t)-brightgreen)](#tech-stack)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Assets: CC0](https://img.shields.io/badge/Assets-CC0%20Public%20Domain-orange)](#assets-and-licenses)

```
┌────────────────────────────────────────────────────────────────────────┐
│  [ Demo Preview: 3D Animated Vertical Video (1080x1920) ]              │
│                                                                        │
│   • 3D Skeletal Characters with Working Expressive Arms                │
│   • Rhubarb Phoneme Lip Sync Synced to Voice Audio                     │
│   • Glowing Translucent Cyan X-Ray Shader & Organ Cutaways             │
│   • Word-by-Word Kinetic Captions with Yellow Highlight Pop            │
│   • Dynamic Camera: Speed Ramps, Snap Zooms, POV "Ride the Prop"       │
│   • Procedural Audio Engine (Music Bed + Ducking + Custom SFX Cues)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. What It Does & What It Doesn't Do

### What It Does
* **100% Code-Driven Generation**: Compiles procedural Three.js scenes, Canvas 2D HUD layers, and audio into broadcast-quality vertical shorts (1080x1920 @ 30fps) with zero generative AI video hallucination.
* **$0 Operational Cost**: Runs completely offline on consumer hardware with local text-to-speech (Kokoro-82M ONNX) and local forced alignment (Whisper small.en). Zero subscription fees or API keys.
* **Deterministic Math Rendering $f(t)$**: Evaluates animation strictly as a pure mathematical function of film time $t$. No non-deterministic `Clock.getDelta()` loops, meaning frame 412 is byte-for-byte identical every single render.
* **Rigged Characters & Expressive Movement**: Pre-rigged GLB humanoid models and fallback hierarchical puppet rigs that walk, wave, point, shock/panic, sigh, celebrate, and reach for props.
* **Word-Synced Captions & Procedural Audio**: Generates synchronized yellow-pop subtitles and synthesizes dynamic sound effects (`whoosh`, `pop`, `gulp`, `slam`, `ding`, `sizzle`) that duck beneath speech.

### What It Doesn't Do
* **No Cloud / AI Video Models**: Does not call Sora, Runway, Kling, or Pika. Visuals are constructed from 3D models, SDF math, Canvas 2D graphics, and Three.js shaders.
* **No Photorealism**: Produces stylized clay, 2.5D cutouts, low-poly 3D, and cartoon aesthetics (Pixar-ish / Zack D. Films style), not photorealistic live-action footage.
* **No Real-Time Delta Hacks**: Does not rely on physics simulations that drift between runs. Everything is seeded and mathematically repeatable.

---

## 2. Quick Start (Your First Video in Under 5 Minutes)

### Prerequisites
* **Node.js**: v22.0.0 or higher
* **Python**: v3.10, v3.11, or v3.12
* **FFmpeg**: v6.0+ (with `ffmpeg` and `ffprobe` in PATH)
* **Google Chrome**: Stable desktop Chrome (used for headless frame capture)
* *(Optional)* **Rhubarb Lip Sync**: v1.13+ for phoneme lip-syncing

### Installation & Selftest
```bash
# 1. Clone the repository
git clone https://github.com/JRSstuff/ai-antigravity-video-skill.git
cd ai-antigravity-video-skill

# 2. Run the automated environment setup (builds private Python venv & downloads models)
bash scripts/setup.sh
# Windows PowerShell: powershell -ExecutionPolicy Bypass -File scripts/fetch_assets.ps1

# 3. Fetch CC0 3D characters, animations, and Draco decoders (~11 MB)
bash scripts/fetch_assets.sh

# 4. Verify the character rig and rendering pipeline
bash scripts/selftest.sh
# Expected output: "SELFTEST PASSED"
```

### Render Your First Video in 4 Commands
```bash
# 5. Scaffold a new project from the Deep Dive 3D template
bash scripts/new_video.sh deep-dive my-first-video
cd ~/faceless-shorts/my-first-video

# 6. Generate voice narration and word alignment
python scripts/voice.py .
python scripts/words.py .

# 7. Pre-flight check and audio mix
node tools/capture.mjs check
node tools/capture.mjs cues
python tools/mix.py .

# 8. Render the final MP4 video
node tools/capture.mjs video renders/my-first-video.mp4
```
Output lands at: `renders/my-first-video.mp4` (1080x1920, 30fps).

---

## 3. How to Prompt It

### The 3-Line Minimum Prompt
```text
TOPIC: What happens when you swallow chewing gum
STYLE: Deep Dive 3D
LENGTH: 45s
```

### Fill-in-the-Blank Template
```text
TOPIC: [Scientific question, tall tale, or mystery]
STYLE: [Deep Dive 3D | Tall Tale 3D | Inside Out | Stick Story | Paper Atlas | Night File 3D]
LENGTH: [30s | 45s | 55s | 60s]
HOOK: [Shocking claim | Question | Countdown] in the first 3 seconds
CHARACTER: [Justine (cowlick kid) with animated arms | neutral subject]
TONE: [Fast, funny, deadpan | Serious documentary | Eerie mystery]
ENDING: [Open loop teaser to part 2 | Punchline loop | Takeaway]
FACTS: [1-3 verified sources or facts to include]
```

### Worked Examples

#### Example 1: Deep Dive 3D (Science / Body Explainer)
* **Prompt**:
  ```text
  Create a Deep Dive 3D short about "What happens when you swallow a watermelon seed".
  Length: 55s, vertical 9:16. Justine believes a watermelon will sprout in his belly.
  Include: stomach acid bath, cellulose armor shield, wilting sprout gag ("NO LIGHT, NO AIR, NO SOIL"),
  and first-person ride-the-seed camera down the esophagus. Justine must react with moving arms.
  ```
* **What to Expect**: Sunlit kitchen, clay boy with giant cowlick, cyan glowing X-ray body, forcefield shield deflection with `ding` SFX, instanced waving villi tentacles, and toilet splashdown.

#### Example 2: Tall Tale 3D (Quirky Character Story)
* **Prompt**:
  ```text
  Create a Tall Tale 3D short about "Justine and the Great Rooster Incident".
  Style: Tall Tale 3D, 50s. Justine gets tired of the village rooster crowing late,
  so he glues 40 feather dusters to his arms and climbs the tallest coconut tree to crow at 4:59 AM.
  ```
* **What to Expect**: Exaggerated 3D village, oversized rooster on rooftop, comedic feather-gluing montage, mountains echoing back, roosters signing tiny resignation letters.

#### Example 3: Night File 3D (Unsolved Mystery / True Crime)
* **Prompt**:
  ```text
  Create a Night File 3D short about "The 1977 Wow! Signal".
  Style: Night File 3D, 45s. Dark radio observatory, red-glowing astronomer silhouette,
  72-second countdown timer, dot-matrix paper printout with the famous circled "6EQUJ5".
  ```
* **What to Expect**: Moody chiaroscuro lighting, single spotlight, suspenseful ticking audio, red silhouette character, typewriter date stamps, and open-ended eerie takeaway.

### Handling Vague Prompts: The Phase 0 Intake
If a prompt is vague (e.g. *"make a video about sharks"*), the engine triggers **Phase 0 (Plan Before You Build)** and asks **ONE** short multiple-choice question round:

> **Sample Agent Q&A**:
> 1. **Style**: [A] Deep Dive 3D (Recommended) | [B] Stick Story | [C] Night File
> 2. **Length**: [A] 55s (Recommended) | [B] 30s | [C] 45s
> 3. **Hook**: [A] "Sharks can detect a single drop of blood from 3 miles away" (Recommended) | [B] "What if you fell into shark-infested water?"
>
> *User can reply: `"A, A, A"` or `"default"`. If the user says `"idk"`, smart defaults are applied immediately.*

### Pro Prompting Tips
* **Phonetic Numbers**: Spell numbers as pronounced (`"forty-five"`, `"one to three days"`) so speech models maintain natural rhythm.
* **Mark Cuts & Captions**: Use `|` for caption breaks and `*asterisks*` for elastic yellow highlights: `When Justine *swallowed | a watermelon *seed`.
* **Sync Sound Cues**: Tag highlight words for sound triggering: `cue(Wd('panicked'), 'slam')`.

---

## 4. Style Menu

| Style | Aesthetic & Shading | Camera Behavior | Best Topics | Example Prompt |
| :--- | :--- | :--- | :--- | :--- |
| **Deep Dive 3D** `deep-dive` | Sculpted clay humanoids, cyan X-ray Fresnel shader, translucent pulsing organs, bloom | Macro push-ins, first-person tube rides, snap zooms, orbit sweeps | Human biology, medicine, anatomy, science what-ifs | *"What happens if you swallow a battery?"* |
| **Tall Tale 3D** `tall-tale` | Vibrant sunny sets, chunky character proportions, expressive articulated limbs | Fast dynamic orbits, speed ramps, comedic screen shakes | Silly folklore, funny true stories, absurd bets | *"The boy who challenged the sunrise to a boxing match"* |
| **Inside Out** `inside-out` | Minimalist bold 2D flat graphics, ink outlines, dual-tone cutaways | Snappy 2D pans, sliding card transitions, instant cuts | Quick hygiene facts, myth-busting, bite-sized health | *"What happens if you never brush your tongue?"* |
| **Stick Story** `stick-story` | High-contrast stick heroes with acting eyes, flat environments, tactical cards | 2D horizontal pans, crash zooms on danger, step cards | Survival steps, emergency prep, disaster guides | *"How to survive a quicksand pit"* |
| **Paper Atlas** `paper-atlas` | Cut-paper textures, aged parchment maps, crimson routes, gold ribbon dates | Top-down map flights, compass rotations, ribbon rolls | Historical battles, maritime voyages, discoveries | *"How the Dutch lost New York for nutmeg"* |
| **Night File 3D** `night-file` | Dark noir 3D rooms, single overhead spotlight, red glowing silhouette figures | Slow sinister push-ins, handheld wobble, lens flare | Unsolved mysteries, true crime, historical enigmas | *"The disappearance of the lighthouse keepers of Eilean Mor"* |

---

## 5. What's New in This Version

* **Pre-Rigged GLB Humanoid Characters**: Integrated `GLTFLoader` with local `DRACOLoader`. Characters now feature full skeletons with independently articulating arms, legs, and heads.
* **Deterministic Animation Engine**: Animations are strictly driven by `mixer.setTime(t)`, eliminating real-time delta loops and guaranteeing frame-exact reproducibility.
* **Animation Clip Retargeting**: Utilizes Three.js `SkeletonUtils.retargetClip()` with alias synonym maps (`BONE_SYNONYMS`) to run universal animation libraries across different humanoid rigs.
* **Fallback Pivot-Based Puppet Rig (`Puppet`)**: Hierarchical Object3D joint rig (`hips > spine > neck > head > limbs`) with built-in poses (`walk`, `wave`, `point`, `shock`, `handsOnHips`, `celebrate`, `shrug`, `handstand`) for instant guaranteed movement without external 3D files.
* **CCDIK Inverse Kinematics**: Added `reach(character, limb, targetVector3, t0, t1)` via `CCDIKSolver` for procedural hand-reaching and prop-holding.
* **Rhubarb Lip Sync Integration**: `scripts/lipsync.py` processes voice audio to produce 9 phonetic mouth cues (`A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `X`) for synchronized mouth movement.
* **Phase 0 Intake & Quality Gate**: Added `skills/PLANNING.md` framework requiring pre-flight checks, arm motion auditing, and contact sheet review before final MP4 rendering.
* **Automated Asset Fetchers**: Cross-platform downloaders (`fetch_assets.sh` and `fetch_assets.ps1`) for Kenney, KayKit, and Quaternius CC0 libraries.
* **Automated Rig Selftest**: `capture.mjs check-character` self-verifies bone hierarchies, mixer stepping, and generates a visual diagnostic sheet.

---

## 6. Tech Stack & Dependencies

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **3D Engine** | Three.js (ES Module) | `r170` | WebGL rendering, shaders, post-processing bloom, SkeletonUtils, CCDIKSolver |
| **2D Compositing** | HTML5 Canvas 2D | Native | High-DPI subtitles, HUD leader lines, info pills, rubber stamps |
| **Runtime Host** | Node.js | `>= 22.0.0` | In-memory HTTP server, asset routing, Chrome DevTools Protocol automation |
| **Headless Capture** | Google Chrome / Chromium | `120+` | Headless WebGL frame capture via CDP (no virtual framebuffer required) |
| **Video Encoder** | FFmpeg / Libav | `6.0+` | H.264 video compression (`-crf 18`), AAC stereo audio muxing (`192k`) |
| **Voice Synthesis** | Kokoro-82M ONNX | `0.4.7` | Local text-to-speech with natural cadence and phoneme timing |
| **Speech Alignment** | Faster-Whisper | `1.2.1` | Forced word-level alignment (ctranslate2 int8 small.en model) |
| **Lip Sync** | Rhubarb Lip Sync | `1.14.0` | Speech-to-viseme phonetic analysis for mouth shapes |
| **Procedural Audio** | NumPy / SciPy | `2.x` / `1.18+` | Mathematical sound synthesis (`whoosh`, `gulp`, `ding`) & audio ducking |

---

## 7. Architecture & Pipeline

```
  User Request
       │
       ▼
 ┌─────────────┐
 │   Phase 0   │  Checklist intake (max 5 questions), style auto-recommendation,
 │  Planning   │  write projects/<name>/brief.json, plan summary approval
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │  Narration  │  Kokoro-82M TTS generates data/narration.wav + lines.json
 │  (voice.py) │
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │  Alignment  │  Faster-Whisper aligns word boundaries -> data/words.json;
 │ (words.py & │  Rhubarb Lip Sync generates phonetic cues -> data/visemes.json
 │ lipsync.py) │
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │ Scene Logic │  Three.js procedural scene graph, rigged character poses,
 │ (shots.js)  │  camera paths, 2D Canvas HUD overlays, audio trigger markers
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │ Capturing & │  capture.mjs streams raw JPEGs into ffmpeg stdin;
 │ Audio Mix   │  mix.py generates ducked score + synthesized SFX -> data/mix.wav
 └──────┬──────┘
        │
        ▼
 ┌─────────────┐
 │   Quality   │  Pre-render contact sheet (review/all.jpg), arm motion audit,
 │    Gate     │  zero static frames check -> final video renders/out.mp4
 └─────────────┘
```

---

## 8. Project Structure

```text
ai-antigravity-video-skill/
├── assets/                 # Local 3D assets (No CDN dependencies at runtime)
│   ├── characters/         # CC0 rigged GLB models (Kenney, KayKit, Quaternius)
│   ├── animations/         # CC0 animation clips (Universal Animation Library)
│   ├── draco/              # Draco WASM decoders and wrappers
│   └── props/              # Stylized accessories and items (shields, tools)
├── scripts/                # Pipeline automation scripts
│   ├── setup.sh            # One-time environment setup & dependency verification
│   ├── fetch_assets.sh     # Asset downloader (Bash version)
│   ├── fetch_assets.ps1    # Asset downloader (PowerShell version)
│   ├── lipsync.py          # Rhubarb Lip Sync audio-to-viseme generator
│   ├── voice.py            # Local Kokoro-82M text-to-speech generator
│   ├── words.py            # Faster-Whisper forced word boundary aligner
│   ├── selftest.sh         # Pipeline and character rig verification suite
│   └── new_video.sh        # Project scaffolder from style templates
├── skills/                 # Skill specifications and planning framework
│   └── PLANNING.md         # Phase 0 intake protocol, checklists, quality gate
├── src/                    # Core shared engine modules
│   └── core/
│       ├── character.js    # GLTF SkinnedMesh loader, mixer, retargeting, attachments
│       ├── puppet.js       # Fallback hierarchical Object3D puppet rig
│       ├── engine.js       # WebGL renderer, light rigs, post-processing bloom
│       ├── timing.js       # Mathematical film clock, word & line markers
│       ├── captions.js     # Kinetic word-by-word captions with yellow pop
│       ├── look2d.js       # Canvas 2D labels, leader lines, pills, rubber stamps
│       └── lib.js          # Math easing functions, vectors, canvas context
├── styles/                 # Visual style libraries (Deep Dive, Tall Tale, etc.)
│   ├── deep-dive/          # Zack D. Films-style 3D science & anatomy explainer
│   ├── tall-tale/          # Stylized 3D comedic tall tale stories
│   ├── inside-out/         # Snappy 2D x-ray cutaway explainer
│   ├── stick-story/        # Stick-figure survival steps
│   ├── paper-atlas/        # Cut-paper historical maps & journeys
│   └── night-file/         # Unsolved mysteries & dark noir crime scenes
├── LICENSES.md             # Comprehensive asset licenses & redistribution terms
└── README.md               # Complete project documentation
```

---

## 9. Assets and Licenses

* **Asset Policy**: This project strictly uses **CC0 1.0 Universal (Public Domain)** or permissive open-source licenses for all bundled models, animations, audio, and textures.
* **Redistribution Restrictions**: **Adobe Mixamo files must NOT be redistributed in this repository.** All humanoid clips are sourced from Quaternius's Universal Animation Library or authored in code.
* **Full Attribution Details**: Read [LICENSES.md](LICENSES.md) for individual component source links, authors, and license texts.

---

## 10. Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Character stuck in T-Pose** | Action was scheduled but `setTime(t)` wasn't called | Ensure `character.setTime(t)` or `puppet.setTime(t)` is invoked inside every shot's `draw(lt, d, t)` function. |
| **Arms don't move** | Bone name mismatch between animation clip and skeleton | Run `node tools/capture.mjs check-character`. Check logged unmapped bones. Add missing names to `BONE_SYNONYMS` in `character.js`. |
| **Model facing backwards** | GLTF forward vector is $+Z$ instead of $-Z$ | Add `character.root.rotation.y = Math.PI` or call `character.face(camera)`. |
| **Character appears microscopic or giant** | Rig authored in centimeters or inches | Pass explicit scale parameter: `createCharacter('kenney', { scale: 0.85 })`. |
| **Overexposed / Washed Out 3D** | PointLight intensities too high with Three.js bloom | In Three.js physical lighting with bloom enabled, keep PointLights at `2.0–6.0` (not `30+`). |
| **`capture.mjs check` failed** | Syntax error or undefined variable in `shots.js` | Read the exact error logged by headless Chrome. Check for geometry rotations on BufferGeometry (use `.rotateX()` instead of `.rotation.x`). |
| **Windows: No Git Bash installed** | System shell defaults to PowerShell | Use the native PowerShell commands: `powershell -ExecutionPolicy Bypass -File scripts/fetch_assets.ps1` and execute Python directly via `& "$env:USERPROFILE\.faceless-shorts\venv\Scripts\python.exe"`. |

---

## 11. Roadmap

- [ ] **Tab-Pool Parallel Capture**: Distribute frame rendering across multiple headless Chrome tabs to achieve 5x faster video generation.
- [ ] **Native WebCodecs Video Encoding**: Stream frames directly from browser memory via `VideoEncoder` API, bypassing intermediate JPEG disk writes.
- [ ] **Volumetric SDF Raymarching Shaders**: Real-time organic fluid simulations for stomach acid and blood flow.
- [ ] **Procedural Adaptive Music Engine**: Dynamic multi-track MIDI synth bed that reacts musically to pacing changes in narration.
- [ ] **Native Windows PowerShell Wrappers**: Complete `.ps1` parity for all shell scripts (`new_video.ps1`, `selftest.ps1`, `setup.ps1`).

---

## 12. Contributing & License

Contributions are welcome! Please ensure any submitted 3D assets or animation clips are verified **CC0 / Public Domain** and accompanied by an update to [LICENSES.md](LICENSES.md).

Distributed under the **MIT License**. See `LICENSE` for details.
