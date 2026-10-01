# SHADDAI Gamedev Skills Registry

All invokable Claude skills available via MCP. Used by TURTLE agent and other Claude Code sessions.

## Three.js Core Skills

| Skill | Purpose | Invocation |
|-------|---------|-----------|
| `threejs-fundamentals` | Scene, camera, renderer basics | `use /threejs-fundamentals` |
| `threejs-scene-setup` | Bootstrap complete scene with lights & loop | `use /threejs-scene-setup` |
| `threejs-geometry` | Create & manipulate meshes, geometry | `use /threejs-geometry` |
| `threejs-materials` | PBR, standard, custom materials | `use /threejs-materials` |
| `threejs-loaders` | Load GLTF, FBX, images, audio | `use /threejs-loaders` |
| `threejs-animation` | Skeletal, morph target, blending | `use /threejs-animation` |
| `threejs-shaders` | Custom GLSL, vertex/fragment shaders | `use /threejs-shaders` |
| `threejs-camera-systems` | Orbit, FPS, third-person cameras | `use /threejs-camera-systems` |
| `threejs-lighting` | Dynamic lights, baked lighting, shadows | `use /threejs-lighting` |
| `threejs-postprocessing` | Bloom, motion blur, color grading | `use /threejs-postprocessing` |

## Physics Skills

| Skill | Purpose | Invocation |
|-------|---------|-----------|
| `threejs-physics` | Cannon.js / Rapier rigidbody integration | `use /threejs-physics` |

## Architecture Skills

| Skill | Purpose | Invocation |
|-------|---------|-----------|
| `ecs-framework` | Entity-Component-System architecture | `use /ecs-framework` |

## QA Skills

| Skill | Purpose | Invocation |
|-------|---------|-----------|
| `game-qa-performance` | FPS profiling, memory, GPU monitoring | `use /game-qa-performance` |
| `game-qa-mobile` | Mobile optimization, touch input, battery | `use /game-qa-mobile` |

## Invocation via TURTLE

```
TURTLE, use /threejs-scene-setup to bootstrap a new 3D scene
TURTLE, use /ecs-framework to architect a game system
TURTLE, build me a 3d-action scaffold using /threejs-physics
```

## Invocation via MCP (NEXUS/Direct)

```json
{
  "resource": "shaddai-threejs-gamedev-master",
  "action": "invoke_skill",
  "skill": "threejs-scene-setup",
  "params": {
    "width": 1920,
    "height": 1080,
    "cameraType": "perspective"
  }
}
```

## Adding New Skills

1. Create folder: `.claude/skills/skill-name/`
2. Add `SKILL.md` with frontmatter + docs
3. Add implementation files (`.js`)
4. Add to this registry
5. Commit: `feat: add skill-name skill`

## References

- [Game Forge](../game-forge/README.md)
- [Flat Library](../FLAT-LIBRARY/)
- [Genre Templates](../GENRE-TEMPLATES/)
