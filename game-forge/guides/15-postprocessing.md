# 15 · Post-processing and finishing

Post-processing renders the scene to an off-screen image, then runs full-screen passes over it. It's the cheapest way to give a game a *look* — and the easiest way to wreck performance, because every pass touches every pixel.

## Pipeline shape
```
scene → render target → [bloom] → [colour grade] → [vignette] → [anti-alias / output] → screen
```
Use an effect-composer style chain: one render pass, then your effects, then an output pass that handles tone mapping and colour space once.

## Effects worth having
| Effect | What it sells | Cost | Tip |
|---|---|---|---|
| **Bloom** | glow on lights, magic, UI emissives | medium | Raise the *threshold* so only bright things bloom; low strength, wide radius |
| **Colour grading** | mood and cohesion | cheap | A tiny 3D LUT or three sliders (contrast, saturation, tint) |
| **Vignette** | focus, cinematic frame | cheap | Keep it subtle (≤0.25) |
| **Outline** | readable silhouettes, stylised look | medium | Depth/normal edge detection; skip on mobile |
| **Depth of field** | scale and focus | expensive | Prefer fake blur on backgrounds |
| **Chromatic aberration / film grain** | impact flashes, texture | cheap | Pulse on hits, not constant |
| **FXAA/SMAA** | smooth edges when MSAA is off | cheap | Use when post-processing disables native antialiasing |

## Rules
1. **Budget passes.** Each full-screen pass costs roughly one more screen's worth of pixel work. On low quality, run none or one.
2. **Render at lower resolution** for expensive passes (bloom works fine at half resolution).
3. **Do tone mapping once**, at the end, not in each pass.
4. **Make effects driven by game state:** brief bloom/aberration spikes on explosions, desaturation at low health, tint by biome. Static filters get ignored; reactive ones get noticed.
5. **Always provide a toggle** (accessibility and performance): reduce-motion disables flashes, shake and aberration.

## Cheaper alternatives
- Fake glow: an additive, softly-textured quad behind bright objects.
- Fake fog: scene `Fog` or a gradient to the sky colour — one line, no pass.
- Baked colour: bake grading into textures and lighting for static scenes.

## Check list before shipping a look
- Looks right on both dark and bright scenes.
- Text and UI stay crisp (draw UI after post-processing or in HTML).
- Frame time with effects on stays inside the quality ladder (guide 09).
