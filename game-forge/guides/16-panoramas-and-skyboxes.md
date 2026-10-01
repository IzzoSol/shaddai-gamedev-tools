# 16 · Panoramas and skyboxes

A 360° image can be a **skybox** (backdrop for a game), a **reflection source** (environment map), or the whole experience (a panorama viewer). Two formats cover almost everything:

| Format | Shape | Best for |
|---|---|---|
| **Equirectangular** | one 2:1 image (e.g. 2048×1024) | what cameras, AI generators and HDRI sites produce; easy to author and store |
| **Cube map** | six square faces | what GPUs sample fastest; sharper at the same memory; best for skyboxes |

`runtime/panorama.mjs` handles the maths both ways:
```js
import { detectLayout, equirectToCubeFace, FACES } from './runtime/panorama.mjs';
detectLayout(2048, 1024);                          // 'equirect'
const faces = Object.fromEntries(FACES.map((f) => [f, equirectToCubeFace(img, f, 1024)]));
```

## Using one in three.js
```js
const tex = new THREE.TextureLoader().load('sky.jpg');
tex.mapping = THREE.EquirectangularReflectionMapping;
tex.colorSpace = THREE.SRGBColorSpace;
scene.background = tex;          // visible backdrop
scene.environment = tex;         // lights Standard materials
```
For a viewer, put the camera at the centre of an inside-out sphere (`geometry.scale(-1, 1, 1)`) textured with the image, then rotate the camera with drag (yaw/pitch, clamp pitch to ±85°) and zoom by changing field of view (30–100°). `panorama-viewer.html` is a minimal example.

## Making good panoramas
- **Ratio matters:** exactly 2:1 for equirectangular. A wrong ratio stretches everything.
- **Seam:** the left and right edges must match. Generators often leave a visible seam; blend a strip across it, or mirror-wrap-edit before use.
- **Poles:** the top and bottom rows are stretched to a point, so detail there looks smeared. Keep important content near the horizon.
- **Resolution:** a 360° view shows only ~90° at a time, so a 4096×2048 map gives about 1000 px across the screen. 2048×1024 is a floor for quality.
- **HDR:** for lighting, use a high-dynamic-range format (`.hdr`/`.exr`); an 8-bit JPEG can't light a scene realistically.

## Pitfalls
- Flipped image: check handedness — viewing from inside mirrors the texture unless you flip the sphere or the u axis.
- Blurry skybox: texture too small, or mipmaps filtering a skybox that should use linear filtering with no mipmaps.
- Banding in gradients: add 1–2 LSB of noise before saving to 8-bit.
