# Cross-Links: How All 3 Systems Connect

This document maps how FLAT-LIBRARY, SKILLS-HUB, and GENRE-TEMPLATES reference each other.

Use this to navigate the repository and understand how systems connect.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│  FLAT-LIBRARY (Reference)                                   │
│  Raw docs, research, patterns by discipline                 │
│  ├─ three-core/                                             │
│  ├─ physics-engines/                                        │
│  ├─ shaders-advanced/                                       │
│  ├─ ecs-architecture/                                       │
│  └─ game-qa-audit/                                          │
└─────────────────────────────────────────────────────────────┘
                    ↑         ↑         ↑
                    │ links  │ uses    │ profiles
                    │        │         │
┌─────────────────────────────────────────────────────────────┐
│  SKILLS-HUB (Invokable)                                     │
│  Claude-invoked skills from flat-library patterns           │
│  ├─ threejs-scene-setup/      → three-core/01              │
│  ├─ threejs-physics/          → physics-engines/           │
│  ├─ threejs-shaders/          → shaders-advanced/          │
│  ├─ ecs-framework/            → ecs-architecture/          │
│  └─ game-qa-performance/      → game-qa-audit/             │
└─────────────────────────────────────────────────────────────┘
                    ↑
                    │ scaffold uses
                    │
┌─────────────────────────────────────────────────────────────┐
│  GENRE-TEMPLATES (Scaffolds)                                │
│  Complete games using skills from SKILLS-HUB               │
│  ├─ 2d-platformer/            (physics + ecs + qa)         │
│  ├─ 3d-action/                (physics + animation + qa)   │
│  ├─ puzzle-game/              (ecs + qa)                   │
│  ├─ vr-experience/            (scene-setup + physics + qa) │
│  ├─ isometric-rpg/            (ecs + animation + qa)       │
│  └─ arcade-game/              (scene-setup + ecs + qa)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Connections

### FLAT-LIBRARY → SKILLS-HUB

Each skill is built FROM flat-library patterns.

#### Three.js Core → threejs-* Skills

```
FLAT-LIBRARY/three-core/
├── 01-fundamentals/
│   └─ → SKILLS-HUB/.claude/skills/threejs-scene-setup/
│       Sets up scene, camera, renderer, lights
│
├── 02-geometry-materials/
│   └─ → (Used by all game scaffolds)
│       Meshes, materials, textures
│
├── 03-loaders/
│   └─ → SKILLS-HUB/.claude/skills/threejs-loaders/
│       Load GLTF, FBX, images
│
├── 04-animation/
│   └─ → SKILLS-HUB/.claude/skills/threejs-animation/
│       Skeletal, morph, blending
│
├── 05-advanced-shaders/
│   └─ → SKILLS-HUB/.claude/skills/threejs-shaders/
│       Custom GLSL, post-processing
│
├── 06-performance/
│   └─ → SKILLS-HUB/.claude/skills/game-qa-performance/
│       LOD, instancing, culling
│
├── 07-lighting-advanced/
│   └─ → SKILLS-HUB/.claude/skills/threejs-scene-setup/
│       Baked, dynamic, volumetric
│
├── 08-camera-systems/
│   └─ → SKILLS-HUB/.claude/skills/threejs-camera-systems/
│       Orbit, FPS, third-person
│
└── 09-post-processing/
    └─ → SKILLS-HUB/.claude/skills/threejs-shaders/
        Bloom, motion blur, color grading
```

#### Physics Engines → threejs-physics Skill

```
FLAT-LIBRARY/physics-engines/
├── cannon-js/
│   └─ → SKILLS-HUB/.claude/skills/threejs-physics/
│       Rigidbody, constraints, vehicles
│
├── rapier-wasm/
│   └─ → SKILLS-HUB/.claude/skills/threejs-physics/
│       High-performance alternative
│
└── custom-collision/
    └─ → (Game-specific implementations)
        Raycasting, grid-based detection
```

#### ECS Architecture → ecs-framework Skill

```
FLAT-LIBRARY/ecs-architecture/
├── entity-component-patterns/
│   └─ → SKILLS-HUB/.claude/skills/ecs-framework/
│       Entity manager, component registry
│
├── system-design/
│   └─ → SKILLS-HUB/.claude/skills/ecs-framework/
│       System patterns, queries, updates
│
└── networking-state/
    └─ → (Advanced: multiplayer sync)
        State replication, interpolation
```

#### QA/Audit → game-qa-* Skills

```
FLAT-LIBRARY/game-qa-audit/
├── performance-profiling/
│   └─ → SKILLS-HUB/.claude/skills/game-qa-performance/
│       FPS, memory, GPU monitoring
│
├── testing-strategies/
│   └─ → (Test suites in each genre)
│       Unit, integration, E2E tests
│
├── accessibility/
│   └─ → SKILLS-HUB/.claude/skills/game-qa-mobile/
│       Colorblind, motor, audio
│
└── mobile-optimization/
    └─ → SKILLS-HUB/.claude/skills/game-qa-mobile/
        Touch input, battery, network
```

---

### SKILLS-HUB → GENRE-TEMPLATES

Each genre scaffold USES skills from the hub.

#### 2D Platformer

```
GENRE-TEMPLATES/2d-platformer/
├── systems/
│   ├── movement.js
│   │   └─ Uses: /threejs-scene-setup (orthographic camera)
│   │
│   ├── physics.js
│   │   └─ Uses: /threejs-physics (rigidbody)
│   │
│   └── render.js
│       └─ Uses: /game-qa-performance (FPS monitoring)
│
└── architecture
    └─ ECS: MovementSystem → PhysicsSystem → RenderSystem
       Uses: /ecs-framework
```

**Cross-links to FLAT-LIBRARY:**
- Camera: `FLAT-LIBRARY/three-core/08-camera-systems/` (orthographic)
- Physics: `FLAT-LIBRARY/physics-engines/cannon-js/` (2D rigidbody)
- ECS: `FLAT-LIBRARY/ecs-architecture/system-design/`

#### 3D Action

```
GENRE-TEMPLATES/3d-action/
├── systems/
│   ├── player-controller.js
│   │   └─ Uses: /threejs-camera-systems (third-person)
│   │
│   ├── combat.js
│   │   └─ Uses: /threejs-animation (weapon trails, hit reactions)
│   │
│   ├── physics.js
│   │   └─ Uses: /threejs-physics (hit detection, ragdoll)
│   │
│   └── performance.js
│       └─ Uses: /game-qa-performance (profile CPU + GPU)
│
└── architecture
    └─ ECS: PlayerSystem → CombatSystem → PhysicsSystem
       Uses: /ecs-framework
```

**Cross-links to FLAT-LIBRARY:**
- Camera: `FLAT-LIBRARY/three-core/08-camera-systems/` (third-person)
- Animation: `FLAT-LIBRARY/three-core/04-animation/` (skeletal)
- Physics: `FLAT-LIBRARY/physics-engines/cannon-js/` (rigidbody)

#### Puzzle Game

```
GENRE-TEMPLATES/puzzle-game/
├── systems/
│   ├── grid.js
│   │   └─ Uses: /ecs-framework (entity queries)
│   │
│   ├── solver.js
│   │   └─ Uses: /ecs-framework (state tracking)
│   │
│   └── ui.js
│       └─ Uses: /game-qa-performance (UI responsiveness)
│
└── architecture
    └─ ECS: GridSystem → SolverSystem → AudioSystem
       Uses: /ecs-framework
```

**Cross-links to FLAT-LIBRARY:**
- ECS: `FLAT-LIBRARY/ecs-architecture/` (all patterns)
- Camera: `FLAT-LIBRARY/three-core/08-camera-systems/` (isometric/top-down)

#### VR Experience

```
GENRE-TEMPLATES/vr-experience/
├── systems/
│   ├── vr-controller.js
│   │   └─ Uses: WebXR GamePad API
│   │
│   ├── locomotion.js
│   │   └─ Uses: /threejs-physics (teleport collisions)
│   │
│   └── performance.js
│       └─ Uses: /game-qa-performance (90+ FPS target)
│
└── architecture
    └─ ECS: ControllerSystem → LocomotionSystem → RenderSystem
       Uses: /ecs-framework
```

**Cross-links to FLAT-LIBRARY:**
- Performance: `FLAT-LIBRARY/three-core/06-performance/` (LOD, instancing)
- Mobile: `FLAT-LIBRARY/game-qa-audit/mobile-optimization/` (battery, network)

#### Isometric RPG

```
GENRE-TEMPLATES/isometric-rpg/
├── systems/
│   ├── player.js
│   │   └─ Uses: /threejs-camera-systems (fixed isometric angle)
│   │
│   ├── npc.js
│   │   └─ Uses: /ecs-framework (AI state machine)
│   │
│   ├── world.js
│   │   └─ Uses: /threejs-loaders (tile streaming)
│   │
│   └── dialogue.js
│       └─ Uses: /ecs-framework (dialogue state)
│
└── architecture
    └─ ECS: PlayerSystem → NPCSystem → WorldSystem → DialogueSystem
       Uses: /ecs-framework
```

**Cross-links to FLAT-LIBRARY:**
- Camera: `FLAT-LIBRARY/three-core/08-camera-systems/` (isometric projection)
- ECS: `FLAT-LIBRARY/ecs-architecture/` (all patterns)

#### Arcade Game

```
GENRE-TEMPLATES/arcade-game/
├── systems/
│   ├── player.js
│   │   └─ Uses: /threejs-scene-setup (simple 2D/3D)
│   │
│   ├── spawner.js
│   │   └─ Uses: /ecs-framework (entity pooling)
│   │
│   ├── score.js
│   │   └─ Uses: /ecs-framework (score tracking)
│   │
│   └── particles.js
│       └─ Uses: /threejs-shaders (visual effects)
│
└── architecture
    └─ ECS: PlayerSystem → SpawnerSystem → ScoreSystem → ParticleSystem
       Uses: /ecs-framework
```

**Cross-links to FLAT-LIBRARY:**
- Scene: `FLAT-LIBRARY/three-core/01-fundamentals/` (renderer setup)
- Shaders: `FLAT-LIBRARY/shaders-advanced/vfx-particles/` (particle systems)
- ECS: `FLAT-LIBRARY/ecs-architecture/` (pooling patterns)

---

## Navigation Guide

### I want to build a [GAME TYPE]

1. Go to: `GENRE-TEMPLATES/[game-type]/START-HERE.md`
2. It tells you which skills it uses
3. Link back to: `SKILLS-HUB/SKILL-REGISTRY.md` for skill details
4. Deep dive: `FLAT-LIBRARY/` for reference material

### I want to understand [PATTERN]

1. Search: `grep -r "[pattern]" FLAT-LIBRARY/`
2. Read: The matched file in FLAT-LIBRARY
3. Find it used in: Which skills reference it?
4. See example: Which genre templates use it?

### I want to use a specific [SKILL]

1. Go to: `SKILLS-HUB/SKILL-REGISTRY.md`
2. Find the skill entry
3. Read: `SKILLS-HUB/.claude/skills/[skill-name]/SKILL.md`
4. It links to FLAT-LIBRARY source material
5. It shows which genres use it

### I want to optimize performance

1. Use skill: `/game-qa-performance`
2. Reference: `FLAT-LIBRARY/three-core/06-performance/`
3. Reference: `FLAT-LIBRARY/game-qa-audit/performance-profiling/`
4. Apply to: Your genre scaffold's `systems/performance.js`

---

## Cross-Link Matrix

**Which systems use which FLAT-LIBRARY categories:**

| FLAT-LIBRARY | Scene Setup | Platformer | Action | Puzzle | VR | RPG | Arcade |
|---|---|---|---|---|---|---|---|
| three-core/01 (fundamentals) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| three-core/02 (geometry) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| three-core/03 (loaders) | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ |
| three-core/04 (animation) | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ |
| three-core/05 (shaders) | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| three-core/06 (performance) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| three-core/07 (lighting) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| three-core/08 (camera) | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| three-core/09 (post-proc) | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| physics-engines/ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| shaders-advanced/ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ecs-architecture/ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| game-qa-audit/ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Legend: ✅ = Core | ⚠️ = Optional | (blank) = Not typically used

---

## Key Insights

### The Three Paths Serve Different Needs

- **FLAT-LIBRARY** = Deep understanding, research, reference
- **SKILLS-HUB** = Automated scaffolding, agent-driven, CI/CD
- **GENRE-TEMPLATES** = Fastest path to playable games

### All 3 Are Actually 1 System

They're organized differently but describe the same knowledge:

```
FLAT-LIBRARY/three-core/08-camera-systems/
  ↓ (packaged as)
SKILLS-HUB/.claude/skills/threejs-camera-systems/
  ↓ (used by)
GENRE-TEMPLATES/3d-action/systems/camera-follow.js
  ↓ (references back to)
FLAT-LIBRARY/three-core/08-camera-systems/THIRD-PERSON.md
```

### Start Anywhere, Go Everywhere

No matter which path you start on, you can navigate to the others:

- Reading FLAT-LIBRARY? → See which skill references it
- Using a skill? → See example in genre templates
- Building a game? → Deep dive into FLAT-LIBRARY for details

---

## Search Tips

Find exactly what you need:

```bash
# Find all camera systems
grep -r "camera" FLAT-LIBRARY/three-core/08-camera-systems/

# Find physics patterns in scaffolds
find GENRE-TEMPLATES -name "*physics*"

# Find which genres use ECS
grep -r "ecs-framework" GENRE-TEMPLATES/*/

# Find shader examples
ls FLAT-LIBRARY/shaders-advanced/*/
```

---

## Next Steps

1. **Pick a path** (FLAT-LIBRARY, SKILLS-HUB, or GENRE-TEMPLATES)
2. **Navigate using this guide** to find related material
3. **Jump between systems** using cross-links
4. **Build your game** with everything at your fingertips

**Happy building!** 🎮
