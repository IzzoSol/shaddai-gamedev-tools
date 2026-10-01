---
name: threejs-materials
description: Choosing and tuning materials. Use when: Deciding how a surface should look and cost.
---

# Choosing and tuning materials

Full guide: SHADDAI Game Forge → guides/04-assets-and-materials.md

## Steps
1. Pick the cheapest material that works: Basic, Lambert, Standard, then custom shader
2. Share material instances between meshes
3. Colour textures sRGB; data textures (normal, roughness, metalness, AO) linear
4. Add an environment map before adding more lights

## Tip
Washed-out or too dark colours are almost always a colour-space mix-up.
