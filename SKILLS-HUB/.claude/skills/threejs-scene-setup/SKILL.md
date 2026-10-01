---
name: threejs-scene-setup
description: Bootstrap a complete Three.js scene with camera, renderer, lights, and animation loop
requires: three.js@r150+
---

# Three.js Scene Setup

Create a fully-functional Three.js scene with all foundational components ready to extend.

## What You Get

- Renderer (WebGL with antialiasing, device pixel ratio)
- Orthographic or Perspective camera (adjustable FOV, aspect ratio)
- Default lighting (ambient + directional)
- Animation loop (requestAnimationFrame)
- Responsive resize handling
- Clean teardown

## Usage

```javascript
import { initScene } from './scene-setup.js'

const scene = initScene({
  width: window.innerWidth,
  height: window.innerHeight,
  cameraType: 'perspective',  // 'perspective' or 'orthographic'
  fov: 75,
  ambientLight: 0xffffff,
  directionalLight: 0xffffff,
  backgroundColor: 0x1a1a2e,
  onFrame: (delta) => {
    // Your animation code
  }
})
```

## Example: Spinning Cube

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0x00ff9c })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

scene.onFrame = (delta) => {
  cube.rotation.x += delta * 0.5
  cube.rotation.y += delta * 0.5
}
```

## Files

- `scene-setup.js` - Core scene factory
- `camera.js` - Camera utilities
- `lighting.js` - Light presets
- `renderer.js` - Renderer configuration

## References

- [Scene and renderer](../../../../game-forge/guides/01-scene-and-renderer.md)
