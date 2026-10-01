---
name: threejs-physics
description: Integrate Cannon.js or Rapier WASM physics engine with Three.js
requires: three.js@r150+, cannon.js OR @react-three/rapier
---

# Three.js Physics Integration

Connect a physics engine to your Three.js scene for rigidbody dynamics, collisions, and constraints.

## Supported Engines

### Cannon.js
- Classic, stable, pure JavaScript
- Good for general game physics
- Lighter weight

### Rapier WASM
- High-performance Rust-based
- WebAssembly (near-native speed)
- Better for complex simulations

## Setup Example (Cannon.js)

```javascript
import { PhysicsWorld } from './physics-world.js'

const physics = new PhysicsWorld({
  engine: 'cannon',
  gravity: [0, -9.8, 0],
  defaultFriction: 0.3
})

// Create a rigid body
const bodyDesc = physics.createRigidBody({
  shape: 'sphere',
  mass: 1,
  position: [0, 5, 0]
})

const body = physics.addBody(bodyDesc)
const mesh = physics.createVisualFromBody(body)
scene.add(mesh)
```

## Common Shapes

- Box: `{ shape: 'box', size: [1, 1, 1] }`
- Sphere: `{ shape: 'sphere', radius: 1 }`
- Cylinder: `{ shape: 'cylinder', radius: 1, height: 2 }`
- Plane: `{ shape: 'plane' }`

## Frame Update

```javascript
const animate = () => {
  physics.step(1/60)  // Fixed timestep
  
  // Physics automatically syncs to mesh positions
  
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
```

## References

- [Cannon.js Docs](https://cannon-es.sparkpost.com/)
- [Physics and collision](../../../../game-forge/guides/06-physics.md)
