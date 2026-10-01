# 13 · Geometry and textures

## Geometry
A mesh is a list of vertices plus triangles (indices). Built-ins (`BoxGeometry`, `SphereGeometry`, `PlaneGeometry`, `CylinderGeometry`) cover prototypes. Build your own with `BufferGeometry`:

```js
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0,  1,0,0,  0,1,0], 3));
geo.setAttribute('uv',       new THREE.Float32BufferAttribute([0,0,  1,0,  0,1], 2));
geo.setIndex([0, 1, 2]);
geo.computeVertexNormals();
```

### Rules of thumb
- Segment counts: spheres rarely need more than 32×16; flat planes need 1×1 unless you displace them.
- **Merge** static scenery into few meshes; **instance** repeated props.
- Update vertex data sparingly: set `attribute.needsUpdate = true` once per frame at most, and prefer doing motion in a vertex shader.
- Recentre geometry (`geo.center()`) so rotation pivots where you expect.
- Bounding volumes drive culling; after changing vertices call `geo.computeBoundingSphere()`.

## Procedural worlds
Heightmap terrain: a subdivided plane whose vertex `y` comes from layered noise (`sum of noise(x·f)·a` for a few octaves). Chunk it (e.g. 64×64 tiles) so you can build, hide and dispose by region.

## Textures
| Kind | Colour space | Notes |
|---|---|---|
| Albedo / emissive | sRGB | what you see |
| Normal, roughness, metalness, AO | Linear | raw data — never colour-managed |

- **Mipmaps** on (default) for anything that shrinks with distance; off for UI and pixel art.
- **Anisotropy** (`texture.anisotropy = 4`) sharpens textures seen at grazing angles, like floors.
- Pixel art: `magFilter = minFilter = NearestFilter`, no mipmaps.
- Tiling: `wrapS = wrapT = RepeatWrapping`, then set `repeat`.
- Pack channels: store roughness, metalness and AO in one texture's R/G/B to cut texture reads.

## Atlases
One big texture with many sub-images means one material and one draw call. Offset UVs per sprite or tile; leave 1–2 px padding between cells to prevent bleeding when filtered.

## Generated textures
Draw to a small `<canvas>` and wrap it in `CanvasTexture` for dynamic labels, minimaps or procedural patterns; call `texture.needsUpdate = true` after each redraw, and keep them small.

## Memory
Texture memory is width × height × 4 bytes × ~1.33 (mips). A 2048² texture is ~22 MB on the GPU, no matter how small its file. Budget by that number, and compress (KTX2) for anything large.
