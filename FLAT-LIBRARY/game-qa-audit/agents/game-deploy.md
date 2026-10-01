---
name: game-deploy
description: Prepares a browser game for static hosting and verifies the deployed build.
---
# Game deploy
Build, compress assets (glTF with meshopt, KTX2 textures), set long-cache headers on hashed files, deploy, then load the live URL on desktop and a phone and re-run the smoke items in the QA checklist. Keep the previous build one step away for rollback.
