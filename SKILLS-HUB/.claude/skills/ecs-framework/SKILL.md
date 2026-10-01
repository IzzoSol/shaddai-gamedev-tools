---
name: ecs-framework
description: Entity-Component-System architecture for scalable game logic
requires: three.js@r150+
---

# ECS Framework

Organize your game logic with Entity-Component-System (ECS) pattern for clean, reusable systems.

## Core Concepts

**Entity** — An ID + collection of components (e.g., a player character)  
**Component** — Data container (e.g., Position, Health, Velocity)  
**System** — Logic that operates on entities with specific components (e.g., MovementSystem)

## Basic Setup

```javascript
import { ECS } from './ecs-engine.js'

const world = new ECS.World()

// Define components
world.registerComponent('Position', { x: 0, y: 0, z: 0 })
world.registerComponent('Velocity', { vx: 0, vy: 0, vz: 0 })
world.registerComponent('Health', { hp: 100 })

// Create entity
const player = world.createEntity()
world.addComponent(player, 'Position', { x: 0, y: 1, z: 0 })
world.addComponent(player, 'Velocity', { vx: 0, vy: 0, vz: 0 })
world.addComponent(player, 'Health', { hp: 100 })
```

## Systems

```javascript
class MovementSystem extends ECS.System {
  query() {
    return this.world.query(['Position', 'Velocity'])
  }
  
  update(delta) {
    for (const entity of this.query()) {
      const pos = this.world.getComponent(entity, 'Position')
      const vel = this.world.getComponent(entity, 'Velocity')
      
      pos.x += vel.vx * delta
      pos.y += vel.vy * delta
      pos.z += vel.vz * delta
    }
  }
}

world.registerSystem(new MovementSystem())
```

## Main Loop

```javascript
const animate = (delta) => {
  world.update(delta)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
```

## References

- [Entities, components and systems](../../../../game-forge/guides/07-ecs-guide.md)
- [Reference implementation](../../../../game-forge/ecs/world.mjs)
