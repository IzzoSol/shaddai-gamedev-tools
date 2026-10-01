---
name: threejs-geometry
description: Building and optimising meshes. Use when: Creating shapes, procedural terrain, or reducing draw calls.
---

# Building and optimising meshes

Full guide: SHADDAI Game Forge → guides/13-geometry-and-textures.md

## Steps
1. Start from built-in geometries; use BufferGeometry for custom shapes (position, uv, index)
2. Call computeVertexNormals / computeBoundingSphere after editing vertices
3. Merge static meshes; use InstancedMesh for repeats
4. Chunk terrain so regions can be built and disposed independently

## Tip
Recentre with geometry.center() when rotation pivots look wrong.
