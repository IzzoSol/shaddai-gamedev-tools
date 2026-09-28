# Game Genre Templates — Start Here

Pick your game type, copy the scaffold, and start building.

## 🎮 Which game are you making?

### 📊 2D Platformer
**What it is:** Side-scrolling game with jumping, platforms, gravity  
**Examples:** Mario, Celeste, Hollow Knight  
**Time to playable:** 4-6 hours  
**Difficulty:** Medium  

**Start here:**
```bash
cp -r 2d-platformer/ my-platformer-game
cd my-platformer-game
npm install
npm run dev
```

**Key files to customize:**
- `systems/movement.js` — Player controls
- `systems/physics.js` — Gravity and collisions
- `scenes/level-1.js` — Your level layout
- `assets/sprites/` — Player, enemies, tiles

**What you'll use:**
- Three.js (Orthographic camera)
- Physics: Cannon.js for rigidbody or custom grid-based
- ECS: MovementSystem, PhysicsSystem, RenderSystem
- Skills: `/threejs-scene-setup`, `/threejs-physics`, `/ecs-framework`

---

### 🎯 3D Action
**What it is:** Third-person action game with combat, movement, camera control  
**Examples:** Dark Souls, Devil May Cry, Elden Ring  
**Time to playable:** 8-12 hours  
**Difficulty:** Hard  

**Start here:**
```bash
cp -r 3d-action/ my-action-game
cd my-action-game
npm install
npm run dev
```

**Key files to customize:**
- `systems/player-controller.js` — Movement input
- `systems/combat.js` — Attack patterns, damage
- `systems/camera-follow.js` — Third-person camera
- `assets/models/` — Player rig, enemies, weapons

**What you'll use:**
- Three.js (Perspective camera with offset)
- Physics: Cannon.js for hit detection
- Rigging: Skeletal animation (GLTF with armature)
- Skills: `/threejs-animation`, `/threejs-physics`, `/threejs-camera-systems`

---

### 🧩 Puzzle Game
**What it is:** Grid-based or spatial puzzle solving  
**Examples:** Tetris, Portal, The Witness  
**Time to playable:** 6-10 hours  
**Difficulty:** Medium-Hard  

**Start here:**
```bash
cp -r puzzle-game/ my-puzzle-game
cd my-puzzle-game
npm install
npm run dev
```

**Key files to customize:**
- `systems/grid.js` — Puzzle board/grid
- `systems/solver.js` — Hint system, validation
- `scenes/level.js` — Puzzle layout
- `ui/` — HUD, level select

**What you'll use:**
- Three.js (Isometric or top-down view)
- ECS: GridSystem, SolverSystem, AudioSystem
- No physics needed (or minimal)
- Skills: `/threejs-scene-setup`, `/ecs-framework`, `/game-qa-performance`

---

### 🥽 VR Experience
**What it is:** Immersive VR for headsets (Meta Quest, PlayStation VR, etc.)  
**Examples:** Beat Saber, Half-Life: Alyx, Gorilla Tag  
**Time to playable:** 10-14 hours  
**Difficulty:** Very Hard  

**Start here:**
```bash
cp -r vr-experience/ my-vr-game
cd my-vr-game
npm install
npm run dev
# Test with: https://localhost:5173 + VR headset
```

**Key files to customize:**
- `systems/vr-controller.js` — Hand tracking + grip input
- `systems/locomotion.js` — Movement (teleport or smooth)
- `scenes/environment.js` — Your 3D world
- `assets/ui/` — VR-optimized UI (no small text!)

**What you'll use:**
- Three.js + WebXR API
- Physics: Rapier WASM (higher performance)
- Controller input: WebXR GamePad API
- Skills: `/threejs-camera-systems`, `/threejs-physics`, `/game-qa-performance`

**⚠️ VR-Specific:**
- Test on real headsets (emulation is not reliable)
- 90+ FPS is critical (performance over graphics)
- Comfort = avoiding motion sickness

---

### 🏰 Isometric RPG
**What it is:** Top-down or isometric RPG with exploration, inventory, NPCs  
**Examples:** Diablo, Baldur's Gate 3, Divinity: Original Sin  
**Time to playable:** 12-16 hours  
**Difficulty:** Very Hard  

**Start here:**
```bash
cp -r isometric-rpg/ my-rpg
cd my-rpg
npm install
npm run dev
```

**Key files to customize:**
- `systems/player.js` — Movement, inventory
- `systems/npc.js` — NPC behavior, dialogue
- `systems/world.js` — Tile loading, persistence
- `data/quests.json` — Quest definitions

**What you'll use:**
- Three.js (Isometric camera angle)
- Physics: Simple for pathfinding
- ECS: PlayerSystem, NPCSystem, WorldSystem, DialogueSystem
- State: LocalStorage or backend for save/load
- Skills: `/ecs-framework`, `/threejs-camera-systems`, `/game-qa-performance`

---

### 🕹️ Arcade Game
**What it is:** Fast-paced, high-score arcade action  
**Examples:** Asteroids, Pac-Man, Space Invaders, Flappy Bird  
**Time to playable:** 3-5 hours  
**Difficulty:** Easy-Medium  

**Start here:**
```bash
cp -r arcade-game/ my-arcade-game
cd my-arcade-game
npm install
npm run dev
```

**Key files to customize:**
- `systems/player.js` — Simple movement + shooting
- `systems/spawner.js` — Enemy waves
- `systems/score.js` — Points, combo, leaderboard
- `ui/hud.js` — Score display, lives

**What you'll use:**
- Three.js (Orthographic, top-down, or side view)
- Physics: Simple (optional — mostly collision math)
- ECS: PlayerSystem, SpawnerSystem, ScoreSystem
- Skills: `/threejs-scene-setup`, `/ecs-framework`, `/game-qa-performance`

**✨ Arcade Tips:**
- Leaderboards make it addictive
- Particle effects sell every action
- Simple color palettes are timeless

---

## 🚀 Quick Start Checklist

For any genre:

1. **Copy scaffold:**
   ```bash
   cp -r [genre-name]/ my-game
   cd my-game
   ```

2. **Install deps:**
   ```bash
   npm install
   ```

3. **Run locally:**
   ```bash
   npm run dev
   # Opens http://localhost:5173
   ```

4. **Read architecture docs:**
   ```bash
   cat docs/architecture.md
   ```

5. **Look at examples:**
   ```bash
   # Check examples/ folder for reference game
   ```

6. **Customize:**
   - Edit `systems/` for game logic
   - Replace `assets/` with your art
   - Modify scenes/levels
   - Tune physics/performance

7. **Test performance:**
   ```bash
   # Use /game-qa-performance skill
   npm run profile
   ```

8. **Deploy:**
   ```bash
   npm run build
   # Upload dist/ to hosting (Vercel, Netlify, etc.)
   ```

---

## 🎨 Design Tips by Genre

**2D Platformer:**
- Orthographic camera keeps everything readable
- Pixel art or clean vector art (no photo-realism)
- Responsive input is critical — test early and often

**3D Action:**
- Real-time shadows make combat readable
- Camera angles matter (over-shoulder, centered, top-down?)
- Weapon trails and hit feedback are your visual language

**Puzzle:**
- Clear visual hierarchy — make the puzzle "readable" at a glance
- Satisfying feedback for solving (particles, UI pop, sound)
- Colorblind-friendly color palettes

**VR:**
- Comfort is everything (avoid nausea-inducing motion)
- Hands are the UI (no menus, everything hand-reachable)
- Performance > Graphics (90 FPS minimum)

**Isometric RPG:**
- Fixed camera angle keeps perspective consistent
- Layer sprites for depth
- Grid-based movement feels intuitive

**Arcade:**
- Simple colors (Pac-Man's palette still works in 2024)
- Visual feedback everywhere (screen shake, particle bursts)
- Leaderboards = replayability

---

## 📚 Skill Reference

Each scaffold is built with these core skills:

- **`/threejs-scene-setup`** — Lights, camera, renderer
- **`/threejs-physics`** — Rigidbody physics (when needed)
- **`/threejs-animation`** — Skeletal or morph animations
- **`/threejs-shaders`** — Custom visual effects
- **`/threejs-camera-systems`** — Different camera styles
- **`/ecs-framework`** — Game logic architecture
- **`/game-qa-performance`** — FPS profiling and optimization

Learn them at: `SKILLS-HUB/SKILL-REGISTRY.md`

---

## 🐛 Troubleshooting

**Game won't load?**
- Check browser console for errors
- Ensure Three.js version matches (r150+)
- Try clearing browser cache

**Slow FPS?**
- Run `/game-qa-performance` to profile
- Reduce draw call count (batch materials, use LOD)
- Optimize textures (compress to WebP)

**Physics feels wrong?**
- Tune gravity, friction, restitution in `physics.js`
- Check collision shapes match your visuals
- Use `/threejs-physics` skill for tuning guide

**Mobile too slow?**
- Use `/game-qa-mobile` skill
- Reduce geometry complexity
- Compress textures aggressively

---

## 🎯 Next Steps

1. **Pick a genre above** ☝️
2. **Copy its scaffold** → your project
3. **Run it locally** → `npm run dev`
4. **Read the docs** → `docs/architecture.md`
5. **Customize** → make it yours
6. **Ship it** → `npm run build`

**Questions?** See `FLAT-LIBRARY/` for deeper reference or search with `/search [keyword]` skill.

**Good luck, game designer!** 🚀
