# 05 · Shaders for game effects

A shader is a small program the GPU runs per vertex (position) and per pixel (colour). In three.js, `ShaderMaterial` lets you write both. Three recipes you can adapt immediately — each is a self-contained look.

## Plumbing (shared)
```js
const material = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uColor: { value: new THREE.Color('#e8c45c') } },
  vertexShader, fragmentShader, transparent: true,
});
// each frame:  material.uniforms.uTime.value = world.time;
```

## Recipe 1 — Rim light (makes silhouettes pop)
```glsl
// vertex
varying vec3 vNormal; varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
// fragment
uniform vec3 uColor; varying vec3 vNormal; varying vec3 vView;
void main() {
  float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);   // bright where the surface turns away
  gl_FragColor = vec4(uColor * rim, rim);
}
```
Layer it as a slightly larger second mesh with additive blending for a glow outline.

## Recipe 2 — Dissolve (spawn, death, teleport)
```glsl
// fragment — needs a noise texture or the hash below
uniform float uAmount;    // 0 = intact, 1 = gone
uniform vec3  uColor; varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
void main() {
  float n = noise(vUv * 8.0);
  if (n < uAmount) discard;                                  // erased
  float edge = smoothstep(uAmount, uAmount + 0.06, n);       // thin band just past the cut
  vec3 base = vec3(0.1);                                     // replace with your surface colour
  gl_FragColor = vec4(mix(uColor * 3.0, base, edge), 1.0);   // hot glowing edge
}
```
Animate `uAmount` with an ease-out so the first half is dramatic and the tail is quick.

## Recipe 3 — Water ripples (a flat plane that looks alive)
```glsl
// vertex — displace by two crossing waves
uniform float uTime; varying float vHeight;
void main() {
  vec3 p = position;
  float h = sin(p.x * 1.6 + uTime * 1.3) * 0.06 + sin(p.z * 2.3 - uTime * 0.9) * 0.04;
  p.y += h; vHeight = h;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
// fragment — tint by height, add foam on crests
uniform vec3 uColor; varying float vHeight;
void main() {
  float foam = smoothstep(0.07, 0.1, vHeight);
  gl_FragColor = vec4(mix(uColor * (0.7 + vHeight * 3.0), vec3(1.0), foam), 0.85);
}
```

## Habits that save hours
- Debug by outputting values as colours (`gl_FragColor = vec4(vec3(n), 1.0)`).
- Keep per-pixel math cheap: avoid loops with unknown bounds and heavy `pow`/`sin` in hot paths.
- Prefer `smoothstep` over `if` for soft edges; reserve `discard` for hard cut-outs.
- Pass time as a uniform from the **simulation** clock so pausing freezes the effect.
