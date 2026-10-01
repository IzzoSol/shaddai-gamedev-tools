# 01 · Scene and renderer

A browser 3D game is four things: a **renderer** that owns the canvas, a **scene** that holds what exists, a **camera** that decides what's seen, and a **loop** that drives time. Get these four right and everything else bolts on.

## Minimum viable stage
```js
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));   // retina is expensive: cap it
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 4, 8);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

renderer.setAnimationLoop((nowMs) => { /* update, then: */ renderer.render(scene, camera); });
```

## Decisions that matter early
| Decision | Default | Why |
|---|---|---|
| Pixel ratio | `min(dpr, 2)` | Past 2× the cost grows with no visible gain |
| Near / far planes | 0.1 / 500 (tune to your world) | A huge far:near ratio causes depth flicker |
| Colour output | leave renderer on sRGB output | Mark colour textures sRGB, data textures (normal, roughness) linear |
| Tone mapping | `ACESFilmicToneMapping` when using lights + HDR | Keeps bright areas from clipping to flat white |
| Shadows | one directional light, tight shadow camera | Shadow cost scales with area covered; fit the frustum to the play space |

## Scene organisation
- Make a `Group` per concern (`world`, `actors`, `fx`, `ui3d`). Moving or hiding a whole layer is then one line.
- Keep game state **out** of the scene graph. Meshes are a *view* of your ECS or state; never the source of truth.
- Name objects (`mesh.name = 'enemy:17'`). Debugging an unnamed scene is misery.

## Resize and device changes
Handle `resize`, orientation change, and DPR change (moving a window between monitors). Re-run camera aspect and renderer size in one `layout()` function and call it from all three.

## Disposal checklist
The GPU does not garbage-collect for you. When something leaves the game for good:
`geometry.dispose()`, `material.dispose()`, every texture on the material `.dispose()`, and remove it from its parent. Pool anything that spawns and dies often instead (guide 09).

## Smoke test
Spin a cube, show an FPS counter, resize the window, switch tabs and return. If the cube stutters on return, your loop needs the stall clamp from guide 02.
