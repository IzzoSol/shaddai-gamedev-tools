# SHADDAI Atelier 3D

Turn one image into a verified 3D model (`.glb`) — with a provenance record that says what made it, under which licence, and proves the file hasn't been swapped.

SHADDAI-original code. Pure Python standard library; no GPU or heavy packages required to run the pipeline itself.

## Why
Image-to-3D services and local models all have different licences, and outputs get renamed and passed around. Atelier 3D keeps a small `.provenance.json` next to every model so you always know where it came from and whether you may use it commercially.

## Quick start
```bash
cd shaddai-3d-atelier
python -m pytest -q                                  # 24 tests, no network
python -m atelier3d backends --config backends.example.json
python -m atelier3d image hero.png --config backends.json --backend local-gpu --out out --faces 5000 --commercial
python -m atelier3d text "a stone lantern" --config backends.json --backend text-gen --out out
python -m atelier3d image hero.png --config backends.json --backend cloud-gen --cloud   # stop at the point-cloud stage
python -m atelier3d cloud out/hero-ab12cd34ef.ply --config backends.json --backend mesher   # point cloud -> mesh, lineage recorded
python -m atelier3d manifest run.json --config backends.json      # repeat a recorded run
python -m atelier3d compare out/a.glb out/b.glb
python -m atelier3d verify out/hero-1a2b3c4d5e.glb   # OK, or exactly what changed
```

## What it does
1. Takes an **image**, a **text prompt**, or a **point cloud** (`.ply`) as input and validates it (type, size, prompt length, finite coordinates).
2. Runs a **backend** — any local program, or a hosted service that works as submit → poll → download. Backends live in a JSON config, so adding one needs no code.
3. Rejects broken output (truncated, empty, zero triangles) with a clear reason.
4. Optionally **decimates** to a face budget (`--faces N`; needs `trimesh` + `fast_simplification`).
5. Writes `<model>.glb.provenance.json`: input hash, output hash, backend + version, licence, warnings for your declared use, timings. The record is itself hashed, so hand edits are detected.

## Backends
```json
{"backends": {
  "local-gpu": {"kind": "command", "command": ["python", "run.py", "{image}", "{out}"],
                 "license": "hunyuan-community", "version": "2.1", "timeout": 1800},
  "hosted":    {"kind": "job", "submit_url": "https://api.example/v1/jobs",
                 "status_url": "https://api.example/v1/jobs/{id}", "token_env": "MY_API_KEY",
                 "license": "service-terms"}}}
```
Commands run without a shell, so image paths can't inject anything. API keys come from environment variables, never the config.

## Licences
`atelier3d/licenses.py` carries short reminders for common weights (Hunyuan community, Stability community, hosted-service terms, permissive, your own). They are **reminders, not legal advice** — terms change, so read the source before shipping.

## Layout
| File | Role |
|---|---|
| `atelier3d/pipeline.py` | `run()` — the whole flow |
| `atelier3d/backends.py` | command and job backends, JSON config loader |
| `atelier3d/glbcheck.py` | stdlib GLB inspector (triangle/mesh/material counts) |
| `atelier3d/ply.py` | stdlib point-cloud reader/validator/writer (binary + ASCII PLY) |
| `atelier3d/compare.py` | side-by-side model comparison (size, geometry, backend, licence) |
| `atelier3d/provenance.py` | build / write / verify records |
| `atelier3d/licenses.py` | licence registry and warnings |
| `atelier3d/finish.py` | optional decimation |
| `atelier3d/cli.py` | `image`, `text`, `cloud`, `manifest`, `compare`, `verify`, `backends` |

## Use from TURTLE
Point a backend at your preferred generator, run the CLI from the design studio, then hand the verified `.glb` to the game's loader (see `game-forge/guides/04-assets-and-materials.md`).
