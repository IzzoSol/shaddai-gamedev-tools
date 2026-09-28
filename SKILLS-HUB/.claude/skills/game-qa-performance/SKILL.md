---
name: game-qa-performance
description: Profile, benchmark, and optimize game performance (FPS, memory, GPU)
requires: three.js@r150+
---

# Game QA — Performance Profiling

Monitor and optimize your game's performance metrics.

## Metrics Tracked

- **FPS** — Frames per second (target: 60 or 120)
- **Frame Time** — Per-frame execution time (ms)
- **Memory** — Heap usage, geometry memory, texture memory
- **GPU Load** — Draw calls, triangles, pixels
- **Jank** — Frame time variance (stutters)

## Setup

```javascript
import { PerformanceProfiler } from './profiler.js'

const profiler = new PerformanceProfiler({
  captureInterval: 100,  // ms between samples
  historyLength: 60,     // keep last N samples
  warnings: {
    fpsBelowTarget: 55,
    frameTimeCritical: 20,  // ms
    memoryWarning: 150      // MB
  }
})

profiler.start()
```

## Monitoring Frame

```javascript
const animate = () => {
  profiler.frameStart()
  
  // Your game code
  world.update(delta)
  renderer.render(scene, camera)
  
  profiler.frameEnd()
  
  // Print stats every second
  if (profiler.shouldPrintStats()) {
    console.log(profiler.getStats())
    // → {fps: 59.8, avgFrameTime: 16.7, peakMemory: 148}
  }
  
  requestAnimationFrame(animate)
}
```

## Optimization Checklist

- [ ] Cull off-screen objects
- [ ] Use LOD (Level of Detail) for distant meshes
- [ ] Batch similar materials
- [ ] Use instancing for repeated geometry
- [ ] Compress textures (WebP, ASTC)
- [ ] Profile GPU with WebGL Inspector
- [ ] Monitor draw call count (< 500 for 60 FPS)

## References

- [Performance Optimization](../../../FLAT-LIBRARY/three-core/06-performance/)
- [Mobile Optimization](../../../FLAT-LIBRARY/game-qa-audit/mobile-optimization/)
