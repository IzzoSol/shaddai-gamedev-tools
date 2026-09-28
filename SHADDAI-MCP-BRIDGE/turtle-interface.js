/**
 * TURTLE Agent Interface
 *
 * TURTLE is SHADDAI's UI/UX + Design + Frontend specialist.
 * This interface gives TURTLE direct access to all game-dev skills & templates.
 *
 * TURTLE commands:
 * - "Build me a 2D platformer scaffold"
 * - "Show me how to use advanced shaders"
 * - "Create a 3D action game from scratch"
 */

const mcp = require('./mcp')
const fs = require('fs')
const path = require('path')

/**
 * Parse natural language commands from TURTLE
 */
function parseCommand(input) {
  const lowerInput = input.toLowerCase()

  // Pattern: "build me a [genre] scaffold"
  const buildMatch = input.match(/build.*(?:me\s+)?a\s+([a-z0-9\-\s]+)\s+(?:scaffold|game|project)/i)
  if (buildMatch) {
    return {
      action: 'build-scaffold',
      genre: buildMatch[1].trim().replace(/\s+/g, '-'),
      confidence: 0.95
    }
  }

  // Pattern: "show me [skill]" or "how do I [skill]"
  const skillMatch = input.match(/(?:show|teach|explain).*?(?:how to|the)\s+([a-z0-9\-\s]+)/i)
  if (skillMatch) {
    const skillName = skillMatch[1].trim().replace(/\s+/g, '-').replace(/^the-/, '')
    return {
      action: 'explain-skill',
      skill: `threejs-${skillName}`,
      confidence: 0.85
    }
  }

  // Pattern: "search for [pattern]"
  const searchMatch = input.match(/search.*?(?:for|patterns?)\s+(.+?)(?:\?|$)/i)
  if (searchMatch) {
    return {
      action: 'search-pattern',
      query: searchMatch[1].trim(),
      confidence: 0.9
    }
  }

  return {
    action: 'unknown',
    confidence: 0
  }
}

/**
 * Execute TURTLE command
 */
function executeTurtleCommand(command) {
  switch (command.action) {
    case 'build-scaffold':
      return buildScaffold(command.genre)

    case 'explain-skill':
      return explainSkill(command.skill)

    case 'search-pattern':
      return searchPatterns(command.query)

    default:
      return {
        error: 'Command not understood',
        hint: 'Try: "Build me a 3D action game", "Show me shaders", "Search for physics"'
      }
  }
}

/**
 * Build a game scaffold from a genre template
 */
function buildScaffold(genre) {
  const genres = mcp.listGenres()
  const genreMatch = genres.find(g => g.name.includes(genre.replace(/-/g, '')))

  if (!genreMatch) {
    return {
      error: `Genre not found: ${genre}`,
      available: genres.map(g => g.name)
    }
  }

  const scaffold = mcp.getGenreScaffold(genreMatch.name)
  if (scaffold.error) return scaffold

  // Add TURTLE-specific metadata
  return {
    genre: genreMatch.name,
    scaffold: scaffold,
    turtleInstructions: `
# ${genreMatch.name.toUpperCase()} Game Scaffold

1. **Copy scaffold structure**: \`${scaffold.scaffoldPath}\` → your project folder
2. **Follow architecture docs**: Read \`docs/architecture.md\`
3. **Run example**: Check \`examples/\` for reference implementation
4. **Customize systems**: Edit \`systems/\` for your game logic
5. **Test performance**: Use \`/game-qa-performance\` skill

## Key files to modify:
- \`main.js\` - Entry point
- \`systems/\` - Game logic
- \`scenes/\` - Level/scene management
- \`assets/\` - Models, textures, audio

## Quick start:
\`\`\`bash
cd ${genreMatch.name}-game
npm install
npm run dev
\`\`\`
    `,
    designTips: getTurtleDesignTips(genreMatch.name),
    estimatedTime: '2-4 hours to customize'
  }
}

/**
 * Explain a Three.js skill in TURTLE's style
 */
function explainSkill(skillName) {
  const skills = mcp.listSkills()
  const skillMatch = skills.find(s => s.name.toLowerCase().includes(skillName.toLowerCase()))

  if (!skillMatch) {
    return {
      error: `Skill not found: ${skillName}`,
      available: skills.map(s => s.name)
    }
  }

  const skillPath = path.join(mcp.SKILLS_DIR, skillMatch.name, 'SKILL.md')
  const content = fs.readFileSync(skillPath, 'utf8')

  return {
    skill: skillMatch.name,
    documentation: content,
    turtleContext: `
This is a ${skillMatch.description}.

**For your designs:**
- Use this when building interactive 3D scenes
- Great for prototyping game mechanics visually
- Works in real-time browser, perfect for iteration

**Time to learn:** 30 min - 1 hour
**Complexity:** Medium
**Dependencies:** Three.js, basic JavaScript
    `,
    relatedSkills: getRelatedSkills(skillMatch.name),
    examples: findSkillExamples(skillMatch.name)
  }
}

/**
 * Search the flat library for patterns
 */
function searchPatterns(query) {
  const results = mcp.searchFlatLibrary(query)

  if (results.length === 0) {
    return {
      message: `No patterns found for "${query}"`,
      suggestion: 'Try broader terms: "physics", "camera", "particles", "lighting"'
    }
  }

  return {
    query: query,
    results: results,
    turtleInterpretation: interpretResults(results, query),
    nextSteps: `
Found ${results.length} matching patterns in the library.

**What to do next:**
1. Read the matching files in FLAT-LIBRARY/
2. Use related skills to implement them
3. Check examples/ folders for working code
    `
  }
}

/**
 * TURTLE-specific design tips per genre
 */
function getTurtleDesignTips(genre) {
  const tips = {
    '2d-platformer': [
      'Use pixel art or vector graphics for clean 2D aesthetic',
      'Orthographic camera keeps everything crisp',
      'Physics-based platformers need responsive input feedback',
      'Visual feedback (screen shake, particles) is crucial for feel'
    ],
    '3d-action': [
      'Third-person camera is most player-friendly',
      'Real-time shadows make combat readable',
      'Weapon trails and impact particles sell the action',
      'Performance matters — optimize before gameplay gets heavy'
    ],
    'puzzle-game': [
      'Clear visual hierarchy — let players "read" the puzzle at a glance',
      'Satisfying feedback when solving (particles, sounds, UI animations)',
      'Grid-based layouts are easier to design and debug',
      'Accessibility is critical — colorblind-friendly palettes'
    ],
    'vr-experience': [
      'Comfort first — smooth locomotion, avoid disorienting motion',
      'Hands/controllers are the UI',
      'Scale matters — test with real VR headsets early',
      'Performance is safety — 90 FPS minimum'
    ],
    'isometric-rpg': [
      'Fixed isometric angle keeps a consistent, readable view',
      'Grid-based movement is intuitive for players',
      'Layered sprites create depth without 3D',
      'UI anchors to screen corners, not world space'
    ],
    'arcade-game': [
      'Quick visual readability — score, lives, hazards obvious at a glance',
      'Particle effects and screen shake are your best friends',
      'Simple color palettes are timeless (Pac-Man, Asteroids still hold up)',
      'Leaderboard UI = motivation (big, prominent, satisfying)'
    ]
  }

  return tips[genre] || tips['arcade-game']
}

/**
 * Find related skills for a given skill
 */
function getRelatedSkills(skillName) {
  const skillGroups = {
    'threejs-scene-setup': ['threejs-lighting', 'threejs-camera-systems', 'threejs-materials'],
    'threejs-physics': ['ecs-framework', 'game-qa-performance'],
    'threejs-shaders': ['threejs-materials', 'threejs-postprocessing'],
    'ecs-framework': ['threejs-physics', 'game-qa-performance'],
    'game-qa-performance': ['game-qa-mobile', 'threejs-postprocessing']
  }

  return skillGroups[skillName] || []
}

/**
 * Find example code for a skill
 */
function findSkillExamples(skillName) {
  const genreExamples = mcp.listGenres()
  return genreExamples
    .filter(g => g.hasExamples)
    .map(g => ({
      genre: g.name,
      path: `GENRE-TEMPLATES/${g.name}/examples/`
    }))
}

/**
 * Interpret search results in TURTLE's context
 */
function interpretResults(results, query) {
  const categories = {}
  results.forEach(r => {
    if (!categories[r.category]) categories[r.category] = []
    categories[r.category].push(r.file)
  })

  let interpretation = `**Patterns found in ${Object.keys(categories).length} categories:**\n\n`
  for (const [cat, files] of Object.entries(categories)) {
    interpretation += `**${cat}** (${files.length} files)\n`
    files.forEach(f => {
      interpretation += `  • ${f}\n`
    })
  }

  return interpretation
}

/**
 * Main TURTLE interface handler
 */
function handleTurtleRequest(input) {
  const command = parseCommand(input)

  if (command.confidence < 0.5) {
    return {
      error: 'Could not understand request',
      parsed: command,
      examples: [
        '"Build me a 3D action game scaffold"',
        '"Show me how to use shaders"',
        '"Search for particle effects"'
      ]
    }
  }

  const result = executeTurtleCommand(command)

  // Add metadata
  result.commandParsed = command
  result.isFromTurtle = true

  return result
}

module.exports = {
  parseCommand,
  executeTurtleCommand,
  buildScaffold,
  explainSkill,
  searchPatterns,
  handleTurtleRequest,
  getTurtleDesignTips
}
