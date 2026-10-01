# 04 · Assets, lighting and materials

## Formats
| Need | Use | Notes |
|---|---|---|
| 3D models | **glTF / GLB** | The web standard; carries meshes, materials, skeletons, animations |
| Small downloads | Draco or meshopt compression | Compress geometry once at build time |
| GPU-friendly textures | **KTX2 (Basis)** | Stays compressed in video memory; JPG/PNG expand to full size |
| Sprites | PNG sheets or WebP | Keep power-of-two atlas dimensions for mipmaps |
| Audio | OGG/AAC for music, short WAV/OGG for effects | Decode effects once, keep buffers |

## Loading without a stall
- Show a loading screen driven by a real progress counter (`LoadingManager`).
- Load in tiers: **boot** (menu, player), **level** (current area), **stream** (next area, decorative props).
- Cache by URL. Two requests for the same file should share one promise.
- Decode off the main thread where possible (`ImageBitmapLoader`, worker-based KTX2/Draco decoders).

```js
const cache = new Map();
export const load = (url, loader) =>
  cache.get(url) ?? cache.set(url, loader.loadAsync(url)).get(url);
```

## Materials: pick the cheapest that looks right
1. **MeshBasicMaterial** — unlit. Free. Great for UI planes, skyboxes, stylised flat looks.
2. **MeshLambertMaterial** — cheap diffuse lighting.
3. **MeshStandardMaterial** — physically based; use for hero assets.
4. **ShaderMaterial** — custom look (guide 05) when the built-ins can't do it.

Share material instances between meshes. Fifty crates with fifty identical materials cost fifty draw states; one shared material is one.

## Lighting for games
- **One key light** (directional) + **a hemisphere or ambient fill**. More lights = more shader cost per pixel.
- Bake what never moves: lightmaps and baked AO beat dynamic lights for static scenery.
- Environment maps (a small HDR) make Standard materials look right with almost no extra lights.
- Cheap fake shadows (a dark blob decal under characters) are fine for crowds.

## Colour discipline
Colour textures (albedo/emissive) are sRGB; data textures (normal, roughness, metalness, AO) are linear. Mixing them up is the number-one reason "the colours look wrong".

## Instancing
Many copies of one mesh? `InstancedMesh` draws thousands in a single call. Update per-instance transforms with `setMatrixAt` and flag `instanceMatrix.needsUpdate = true` once per frame, not per instance.
