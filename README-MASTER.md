# SHADDAI Game Dev Tools — Three.js Gamedev Master

**The complete, comprehensive, masterfully-organized game development system for Three.js.**

Everything you need to build browser-based 3D games using Three.js, from architecture patterns to playable scaffolds.

---

## 🎮 What Is This?

A unified game development system from **SHADDAI** organized into **3 coexisting organizational systems:**

1. **FLAT-LIBRARY** — Raw reference material organized by discipline
2. **SKILLS-HUB** — Invokable Claude skills for automated scaffolding
3. **GENRE-TEMPLATES** — Copy-paste game scaffolds for 6 game types

All wired into **SHADDAI's MCP** so agents (TURTLE, NEXUS) can build games for you.

---

## 🚀 Quick Start (Pick Your Path)

### Path 1: "Just Build Me a Game" → GAME FORGE

```bash
node game-forge/ecs/world.test.mjs      # ECS, fixed-step loop, collision, clips, input — all tested
```

Use the building blocks in `game-forge/` and the 15 guides; ask TURTLE: *use shaddai_turtle_build to make a [genre] game*.

**Start here:** [GENRE-TEMPLATES/START-HERE.md](./GENRE-TEMPLATES/START-HERE.md)

---

### Path 2: "I Want to Learn Patterns" → FLAT-LIBRARY

```bash
# Search for a specific pattern
grep -r "physics" FLAT-LIBRARY/physics-engines/
grep -r "shader" FLAT-LIBRARY/shaders-advanced/
```

**Best for:** Deep understanding, solving specific problems, reference

**Start here:** [FLAT-LIBRARY/ → Category README files](./FLAT-LIBRARY/)

---

### Path 3: "Invoke Skills Directly" → SKILLS-HUB

```javascript
// Use Three.js skills in your Claude Code sessions
// TURTLE, use /threejs-physics to add rigidbody dynamics
// NEXUS, invoke /ecs-framework for architecture
```

**Best for:** Working with Claude agents, automated scaffolding, CI/CD

**Start here:** [SKILLS-HUB/SKILL-REGISTRY.md](./SKILLS-HUB/SKILL-REGISTRY.md)

---

## 📂 Repository Structure

```
shaddai-threejs-gamedev-master/
│
├── FLAT-LIBRARY/                    ← Path 2: Reference Material
│   ├── three-core/                  (10 Three.js skill references)
│   ├── physics-engines/             (Cannon.js, Rapier patterns)
│   ├── shaders-advanced/            (GLSL, PBR, post-processing)
│   ├── ecs-architecture/            (Entity-Component-System patterns)
│   ├── game-qa-audit/              (Performance, testing, mobile)
│   └── FLAT-LIBRARY-README.md
│
├── SKILLS-HUB/                      ← Path 3: Invokable Skills
│   ├── .claude/skills/              (All skills here)
│   │   ├── threejs-scene-setup/
│   │   ├── threejs-physics/
│   │   ├── threejs-shaders/
│   │   ├── threejs-animation/
│   │   ├── threejs-camera-systems/
│   │   ├── ecs-framework/
│   │   ├── game-qa-performance/
│   │   └── game-qa-mobile/
│   ├── lib/                         (Reusable JS patterns)
│   ├── package.json                 (npm: shaddai-gamedev)
│   └── SKILL-REGISTRY.md
│
├── GENRE-TEMPLATES/                 ← Path 1: Ready-to-Use Scaffolds
│   ├── 2d-platformer/               (Mario-style games)
│   ├── 3d-action/                   (Combat, third-person)
│   ├── puzzle-game/                 (Grid-based, spatial)
│   ├── vr-experience/               (WebXR, headsets)
│   ├── isometric-rpg/               (Diablo-style)
│   ├── arcade-game/                 (Asteroids, Pac-Man style)
│   └── START-HERE.md                ← Entry point
│
├── SHADDAI-MCP-BRIDGE/              ← Integration Layer
│   ├── mcp.js                       (Resource server)
│   ├── turtle-interface.js          (TURTLE agent commands)
│   ├── registry.json                (Skill + genre index)
│   └── INTEGRATION-README.md
│
├── CROSS-LINKS.md                   ← How all 3 systems connect
├── README-MASTER.md                 ← You are here
└── SESSION-STATUS.md                ← Development progress
```

---

## 🎯 Three Ways to Use This Repo

### 1️⃣ Use Game Forge (Fastest)

Pick the building blocks you need from `game-forge/` and follow the matching guides.

```bash
node game-forge/runtime/runtime.test.mjs   # fixed-step loop, collision, clips, input
```

**Result:** Playable game framework in 5 minutes  
**Customization:** Replace assets, tune physics, modify systems

---

### 2️⃣ Reference Patterns (Learning)

Dive into FLAT-LIBRARY to understand specific techniques.

**Want to know about:**
- Skeletal animation? → `FLAT-LIBRARY/three-core/04-animation/`
- Physics? → `FLAT-LIBRARY/physics-engines/`
- Game architecture? → `FLAT-LIBRARY/ecs-architecture/`

Read the docs, understand the concepts, apply to your project.

---

### 3️⃣ Invoke Skills (Agentic)

Have TURTLE or NEXUS agents build game scaffolds for you.

```
TURTLE, build me a 2D platformer scaffold
→ TURTLE uses /threejs-scene-setup + /ecs-framework + genre-template
→ Returns playable game structure

NEXUS, show me how to optimize this for 60 FPS
→ NEXUS uses /game-qa-performance + profiler
→ Returns optimization report + code changes
```

---

## 📦 What's Included

### Systems

- **24+ Three.js skills** (camera, physics, shaders, animation, etc.)
- **6 game-type scaffolds** (platformer, action, puzzle, VR, RPG, arcade)
- **1 ECS framework** (entity-component-system architecture)
- **5 QA/performance tools** (profiling, mobile, accessibility, testing)
- **Complete documentation** (architecture, best practices, optimization)

---

## 🛠️ Tech Stack

- **Three.js** r150+ (3D graphics)
- **Cannon.js** or **Rapier WASM** (Physics)
- **Vite** (Build tool)
- **Node.js** (Development server)
- **WebGL** (Graphics API)
- **WebXR** (VR/AR when needed)

---

## 🤖 The Full SHADDAI Agent Council

Every agent in the SHADDAI system is wired into this repo via MCP:

| Agent | Role in Game Dev | Example Invocation |
|-------|------------------|--------------------|
| **SHADDAI** | Orchestrates the whole build, makes final calls | `"SHADDAI, is this game ready to ship?"` |
| **NEXUS** | Architecture, game loops, performance | `"NEXUS, review this for scalability"` |
| **ZEROX** | Monetization, pricing, in-game economy | `"ZEROX, price the battle pass"` |
| **ORACLE** | Player psychology, trends, what people like | `"ORACLE, what genres are trending?"` |
| **TURTLE** | UI/UX, visual polish, game feel | `"TURTLE, design the menu"` |
| **QUILL** | Menu wording, NPC dialogue, item text, docs | `"QUILL, write NPC quest dialogue"` |
| **PIKADON** | Security, anti-cheat, safe saves | `"PIKADON, review for exploits"` |

**Invoke naturally** — every agent has 100+ specialized skills. Just ask.

---

## 📖 Documentation

- **[GENRE-TEMPLATES/START-HERE.md](./GENRE-TEMPLATES/START-HERE.md)** — Pick a game type
- **[SKILLS-HUB/SKILL-REGISTRY.md](./SKILLS-HUB/SKILL-REGISTRY.md)** — All invokable skills
- **[CROSS-LINKS.md](./CROSS-LINKS.md)** — How all 3 systems connect
- **[FLAT-LIBRARY/](./FLAT-LIBRARY/)** — Deep reference material

---

## 🚀 Getting Started

### Option A: Copy a Scaffold (Recommended for Most)

```bash
# 1. Pick a genre
cd GENRE-TEMPLATES/
cat START-HERE.md  # Read the guide

# 2. Take the building blocks
ls ../game-forge/        # ecs/, runtime/, guides/

# 3. Read the guide for your genre, then build
# (ask TURTLE: use shaddai_turtle_build)
```

### Option B: Learn from FLAT-LIBRARY

```bash
# 1. Find what interests you
grep -r "Three.js fundamentals" FLAT-LIBRARY/three-core/

# 2. Read the docs
cat FLAT-LIBRARY/three-core/01-fundamentals/FUNDAMENTALS.md

# 3. Apply to your project
# Copy code patterns, adapt to your needs
```

### Option C: Use Skills with Claude

```
You: TURTLE, build me a 3D action game scaffold
Claude (TURTLE): [Uses /threejs-scene-setup, /threejs-physics, genre-template]
Result: Complete playable game structure with architecture docs
```

---

## 💡 Tips

- **Start with scaffolds** if you want to ship fast
- **Reference FLAT-LIBRARY** when you need to understand something deeply
- **Use skills** when working with Claude agents for automated coding
- **Check examples/** in each genre for reference implementations
- **Profile with /game-qa-performance** before optimizing

---

## 🎮 Example Games to Build

Using this repo, you can build:

- 🎯 **Arcade**: Space Invaders, Asteroids, Flappy Bird clone
- 🏃 **Platformer**: Mario-like side-scroller
- ⚔️ **Action**: Third-person combat game
- 🧩 **Puzzle**: Grid-based puzzle solver
- 🏰 **RPG**: Isometric dungeon crawler
- 🥽 **VR**: Immersive VR experience

Each type has a complete scaffold with physics, animation, and architecture pre-built.

---

## 🔗 Related Projects

- **[SHADDAI](https://shaddai.ai)** — Main AI agent marketplace
- **[SHADDAI-Arcade](https://github.com/IzzoSol/Shaddai-Arcade)** — Hall casino engine
- **[shaddai-aura](https://github.com/IzzoSol/aura)** — Memory/research system

---

## 📄 License

**MIT License © 2026 SHADDAI Empire.** Free to use, fork, and build with — just keep the copyright notice. This repository contains no bundled 3D models or third-party game assets.

---

## 🎯 Quick Links

- 📚 **Learning**: Start with [GENRE-TEMPLATES/START-HERE.md](./GENRE-TEMPLATES/START-HERE.md)
- 🔍 **Reference**: Dive into [FLAT-LIBRARY/](./FLAT-LIBRARY/)
- 🛠️ **Skills**: Check [SKILLS-HUB/SKILL-REGISTRY.md](./SKILLS-HUB/SKILL-REGISTRY.md)
- 🔗 **Map**: See [CROSS-LINKS.md](./CROSS-LINKS.md)
- 📊 **Status**: Progress in [SESSION-STATUS.md](./SESSION-STATUS.md)

---

## 🚀 Ready? Let's Go!

1. **Pick a path** (scaffold, reference, or skills)
2. **Read the relevant docs** (START-HERE or SKILL-REGISTRY)
3. **Follow the examples**
4. **Build something amazing**

**Questions?** Check CROSS-LINKS.md to find exactly what you need.

**Let's make games!** 🎮✨
