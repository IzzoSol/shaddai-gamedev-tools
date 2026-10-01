---
name: threejs-lighting
description: Lights, shadows and baked lighting. Use when: Making a scene readable without wrecking performance.
---

# Lights, shadows and baked lighting

Full guide: SHADDAI Game Forge → guides/04-assets-and-materials.md

## Steps
1. One directional key light plus hemisphere/ambient fill
2. One shadow-casting light with a tightly fitted shadow camera
3. Bake lighting for static scenery; use blob shadows for crowds
4. Add an environment map for Standard materials

## Tip
More lights means more cost per pixel; remove before adding.
