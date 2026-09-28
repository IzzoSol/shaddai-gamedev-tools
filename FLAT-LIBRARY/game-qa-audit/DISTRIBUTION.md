# Distribution Model

Game Superpowers is distributed as a **skills collection**.

## Why not plugins?

Plugins are useful packaging, but they are not where this project’s value lives.

The durable core is:
- skill naming
- skill descriptions
- routing logic
- build vs audit separation
- game-native abstractions
- shared checklists, templates, and schemas

By keeping this repository skills-first:
- contributors can reason about the system in Git
- Claude and Codex users can install it without marketplace dependencies
- teams can fork and customize it at the workflow level
- downstream maintainers can still package it as plugins later if they want

## “One import, many skills” strategy

This repository supports that ergonomics in two ways:

### Claude Code
Use the repository as an additional directory:

```bash
claude --add-dir /path/to/repo
```

Because `.claude/skills/` exists inside the repo, Claude can discover the whole collection from one import path.

### Codex
Use one symlink from `~/.agents/skills/game-superpowers` to `repo/skills`.

That exposes the whole collection from one install action.

## Bootstrap skill

`using-game-superpowers` is the collection bootstrap skill.

Its job is to:
- classify the request
- choose build vs audit vs repair vs polish
- route into the right specialized Game Superpowers skills

This is the skills-first equivalent of a collection entrypoint.
