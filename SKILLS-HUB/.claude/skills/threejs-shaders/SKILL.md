---
name: threejs-shaders
description: Custom GLSL effects. Use when: Rim light, dissolve, water or any look the built-ins cannot do.
---

# Custom GLSL effects

Full guide: SHADDAI Game Forge → guides/05-shaders.md

## Steps
1. Create a ShaderMaterial with uniforms; update uTime from the simulation clock
2. Write vertex (position) and fragment (colour) shaders; debug by outputting values as colour
3. Use smoothstep for soft edges, discard only for hard cut-outs
4. Keep per-pixel maths cheap; test on a low-end device

## Tip
Start from the three recipes in the guide and adapt.
