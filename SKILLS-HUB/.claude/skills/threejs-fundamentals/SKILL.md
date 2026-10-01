---
name: threejs-fundamentals
description: Scene, camera and renderer basics. Use when: Starting any Three.js project or fixing a blank/black screen.
---

# Scene, camera and renderer basics

Full guide: SHADDAI Game Forge → guides/01-scene-and-renderer.md

## Steps
1. Create renderer (cap pixel ratio at 2), scene, perspective camera
2. Append renderer.domElement; add one resize handler for camera aspect + renderer size
3. Drive rendering with renderer.setAnimationLoop; simulate on a fixed step
4. Name groups per concern (world, actors, fx); keep game state outside the scene
5. Verify: spinning cube, FPS counter, resize, tab-away and back

## Tip
Black screen: check camera position/near-far, that the object is in the scene, lights for lit materials, and the console.
