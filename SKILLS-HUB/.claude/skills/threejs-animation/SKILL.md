---
name: threejs-animation
description: Skeletal, morph and procedural animation. Use when: Playing, blending or authoring character motion.
---

# Skeletal, morph and procedural animation

Full guide: SHADDAI Game Forge → guides/12-animation.md

## Steps
1. Create an AnimationMixer per animated root; call mixer.update(dt) every tick
2. Cross-fade between clips (0.15–0.3 s) instead of switching
3. Drive locomotion weights from speed; fire events from named clip times
4. Use sin(time)+phase for procedural bobs and idles

## Tip
Animation continuing during pause means you used wall-clock time instead of simulation time.
