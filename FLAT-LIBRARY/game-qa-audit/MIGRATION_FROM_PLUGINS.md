# Migrating from plugin-oriented packaging to skills-only

Game Superpowers used to carry plugin-oriented wrappers for Claude and Codex.

The repository now treats **skills** as the only source of truth.

## What changed

- The product narrative moved from “plugin distribution” to “skills collection”
- Installation docs now prioritize direct skills installation
- The collection bootstrap is `using-game-superpowers`
- Open-source docs now describe Claude and Codex in terms of native skills support

## What did not change

- The Game Superpowers workflows
- The build track and audit track split
- The individual specialized game skills
- The schemas and shared references

## Recommended mental model

Think of this repository as:
- a skills library
- a routing system
- a reusable game workflow layer

not as:
- a marketplace package
- a GUI integration
- a monolithic plugin product
