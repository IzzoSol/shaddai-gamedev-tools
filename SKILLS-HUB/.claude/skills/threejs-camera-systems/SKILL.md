---
name: threejs-camera-systems
description: Orbit, first-person, third-person and side-scroller cameras. Use when: choosing or tuning how the camera follows and is controlled.
---

# threejs-camera-systems

Full guide: SHADDAI Game Forge → guides/03-cameras-and-feel.md and guides/14-interaction-and-controls.md

## Steps
1. Pick the camera for the game type (orbit for strategy, follow for third-person, pointer-lock for first-person, dead-zone follow for side-scrollers)
2. Smooth with exponential damping, not a fixed lerp, so it feels the same at any frame rate
3. Add look-ahead from velocity; ease the vertical axis more slowly
4. Ray-cast from the player to the camera and pull it in front of any wall
5. Shake with trauma squared and smooth noise; give players a reduce-motion option

## Tip
If the camera feels floaty, raise the damping rate; if it feels jittery, add a dead zone.
