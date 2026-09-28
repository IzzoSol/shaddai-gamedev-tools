# 🎮 SHADDAI Game Dev Tools
### Three.js Gamedev Master Repository

**The ultimate Three.js master repository that turns concepts into playable experiences at warp speed.**

![License](https://img.shields.io/badge/license-MIT-6C3CE9?style=flat-square) ![Three.js](https://img.shields.io/badge/Three.js-r160%2B-049EF4?style=flat-square) ![MCP](https://img.shields.io/badge/SHADDAI-MCP--powered-FF6B35?style=flat-square) ![Scaffolds](https://img.shields.io/badge/scaffolds-6%20genres-22C55E?style=flat-square)

A meticulously organized discipline-by-discipline library, instant AI-driven scaffolding, and plug-and-play genre templates — then let the MCP bridge empower autonomous agents to assemble, iterate, and ship games you can publish tomorrow. All under a permissive MIT license — no strings, just pure creation power.

---

## ⚡ Highlights

- **FLAT-LIBRARY** — Deep reference material organized by discipline: Three.js core, physics, shaders, ECS, QA
- **SKILLS-HUB** — Invoke AI skills (scene setup, level layout, shaders, QA) with a single call
- **GENRE-TEMPLATES** — Six battle-tested scaffolds (2D platformer, 3D action, puzzle, VR, isometric RPG, arcade) that run out-of-the-box
- **SHADDAI-MCP-BRIDGE** — Connect TURTLE and NEXUS agents to auto-generate full game projects
- **MIT-Licensed & Zero-Cost** — Use, remix, and commercialize without restrictions
- **Premium-Grade Performance** — Latest Three.js, optimized for desktop, mobile, and WebXR

---

## 🚀 Quick Start (Pick Your Path)

### Path 1: "Just Build Me a Game" → GENRE-TEMPLATES

```bash
cp -r GENRE-TEMPLATES/3d-action/ my-game
cd my-game
npm install
npm run dev
# That's it — you have a playable game framework
```

**Start here:** [GENRE-TEMPLATES/START-HERE.md](./GENRE-TEMPLATES/START-HERE.md)

---

### Path 2: "I Want to Learn Patterns" → FLAT-LIBRARY

```bash
grep -r "physics" FLAT-LIBRARY/
grep -r "shader" FLAT-LIBRARY/
```

**Start here:** [FLAT-LIBRARY/](./FLAT-LIBRARY/)

---

### Path 3: "Invoke Skills Directly" → SKILLS-HUB

```
TURTLE, use /threejs-scene-setup to bootstrap a scene
NEXUS, invoke /ecs-framework for architecture
```

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
│   ├── game-qa-audit/               (Performance, testing, mobile)
│   └── FLAT-LIBRARY-README.md
│
├── SKILLS-HUB/                      ← Path 3: Invokable Skills
│   ├── .claude/skills/              (All skills here)
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
│   └── registry.json                (Skill + genre index)
│
├── CROSS-LINKS.md                   ← How all 3 systems connect
├── README-MASTER.md                 ← Full documentation
├── SESSION-STATUS.md                ← Development progress
└── LICENSE                          ← MIT © SHADDAI Empire
```

---

## 📦 What's Included

- **24+ Three.js skills** (camera, physics, shaders, animation, etc.)
- **6 game-type scaffolds** (platformer, action, puzzle, VR, RPG, arcade)
- **1 ECS framework** (entity-component-system architecture)
- **5 QA/performance tools** (profiling, mobile, accessibility, testing)
- **3D asset library** (models, textures, palettes)
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

## 📄 License

**MIT License © 2026 SHADDAI Empire.** Free to use, fork, and build with — just keep the copyright notice. Bundled 3D assets carry their own permissive licenses — see [ATTRIBUTION.md](./GENRE-TEMPLATES/3d-action/examples/3d-asset-test/public/assets/models/ATTRIBUTION.md).

---

## 🔗 Related Projects

- **[SHADDAI](https://shaddai.ai)** — Main AI agent marketplace
- **[SHADDAI-Arcade](https://github.com/IzzoSol/Shaddai-Arcade)** — Hall casino engine
- **[shaddai-aura](https://github.com/IzzoSol/aura)** — Memory/research system

---

**Let's make games.** 🎮✨
