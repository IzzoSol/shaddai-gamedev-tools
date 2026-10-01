---
name: threejs-loaders
description: Loading models, textures and audio. Use when: Bringing assets in without freezing the game.
---

# Loading models, textures and audio

Full guide: SHADDAI Game Forge → guides/04-assets-and-materials.md

## Steps
1. Prefer glTF/GLB with Draco or meshopt; KTX2 for textures
2. Use one LoadingManager for a real progress bar
3. Cache by URL so duplicate requests share one promise
4. Load in tiers: boot, level, stream; pre-warm shaders by rendering new objects once off-screen

## Tip
Hitch when something first appears = shader compile or texture upload; pre-warm it.
