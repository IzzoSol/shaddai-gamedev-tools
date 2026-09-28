/**
 * SHADDAI Three.js Gamedev Master MCP Bridge
 *
 * Exposes all game-dev skills and templates to:
 * - TURTLE agent (UI/UX, design, prototyping)
 * - NEXUS agent (architecture, performance)
 * - Direct Claude Code sessions
 *
 * Port: 3001 (separate from main SHADDAI MCP on 3000)
 */

const fs = require('fs')
const path = require('path')

const REPO_ROOT = path.resolve(__dirname, '..')
const SKILLS_DIR = path.join(REPO_ROOT, 'SKILLS-HUB', '.claude', 'skills')
const GENRES_DIR = path.join(REPO_ROOT, 'GENRE-TEMPLATES')
const FLAT_LIBRARY_DIR = path.join(REPO_ROOT, 'FLAT-LIBRARY')

/**
 * List all invokable skills
 */
function listSkills() {
  const skills = fs.readdirSync(SKILLS_DIR)
    .filter(dir => fs.statSync(path.join(SKILLS_DIR, dir)).isDirectory())
    .map(skillName => {
      const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md')
      if (!fs.existsSync(skillPath)) return null

      const content = fs.readFileSync(skillPath, 'utf8')
      const descMatch = content.match(/description:\s*(.+?)$/m)
      const description = descMatch ? descMatch[1] : ''

      return {
        name: skillName,
        description: description.trim(),
        path: skillPath
      }
    })
    .filter(Boolean)

  return skills
}

/**
 * Invoke a skill (return SKILL.md + example)
 */
function invokeSkill(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md')
  if (!fs.existsSync(skillPath)) {
    return { error: `Skill "${skillName}" not found` }
  }

  const content = fs.readFileSync(skillPath, 'utf8')
  return {
    skill: skillName,
    documentation: content,
    files: fs.readdirSync(path.join(SKILLS_DIR, skillName))
  }
}

/**
 * List all genre templates
 */
function listGenres() {
  const genres = fs.readdirSync(GENRES_DIR)
    .filter(dir => {
      const fullPath = path.join(GENRES_DIR, dir)
      return fs.statSync(fullPath).isDirectory() &&
             fs.existsSync(path.join(fullPath, 'scaffold'))
    })
    .map(genreName => ({
      name: genreName,
      hasDocs: fs.existsSync(path.join(GENRES_DIR, genreName, 'docs')),
      hasExamples: fs.existsSync(path.join(GENRES_DIR, genreName, 'examples')),
      scaffoldPath: path.join(GENRES_DIR, genreName, 'scaffold')
    }))

  return genres
}

/**
 * Get genre scaffold (starter project structure)
 */
function getGenreScaffold(genreName) {
  const scaffoldPath = path.join(GENRES_DIR, genreName, 'scaffold')
  if (!fs.existsSync(scaffoldPath)) {
    return { error: `Genre "${genreName}" scaffold not found` }
  }

  return {
    genre: genreName,
    scaffoldPath: scaffoldPath,
    files: listDirRecursive(scaffoldPath),
    instructions: `Copy ${scaffoldPath} to your project and follow docs/`
  }
}

/**
 * Search flat library by keyword
 */
function searchFlatLibrary(query) {
  const results = []
  const dirs = fs.readdirSync(FLAT_LIBRARY_DIR)

  for (const category of dirs) {
    const categoryPath = path.join(FLAT_LIBRARY_DIR, category)
    if (!fs.statSync(categoryPath).isDirectory()) continue

    const mdFiles = findMdFiles(categoryPath)
    mdFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      if (content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          category: category,
          file: path.relative(FLAT_LIBRARY_DIR, file),
          path: file
        })
      }
    })
  }

  return results.slice(0, 10)  // Limit results
}

/**
 * Helper: Recursively find .md files
 */
function findMdFiles(dir) {
  let results = []
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(findMdFiles(fullPath))
    } else if (file.endsWith('.md')) {
      results.push(fullPath)
    }
  })

  return results
}

/**
 * Helper: List directory recursively
 */
function listDirRecursive(dir, prefix = '') {
  const items = []
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      items.push(`${prefix}${file}/`)
      items.push(...listDirRecursive(fullPath, `${prefix}  `))
    } else {
      items.push(`${prefix}${file}`)
    }
  })

  return items
}

/**
 * MCP Resource Endpoints
 */
const resources = {
  '/skills/list': listSkills,
  '/skills/invoke/:skillName': invokeSkill,
  '/genres/list': listGenres,
  '/genres/scaffold/:genreName': getGenreScaffold,
  '/search/:query': (query) => searchFlatLibrary(query),
  '/registry': () => ({
    skills: listSkills(),
    genres: listGenres(),
    repoPath: REPO_ROOT
  })
}

/**
 * Express-like routing (for manual HTTP server)
 */
function handleRequest(method, path, params) {
  if (method !== 'GET') return { error: 'Only GET supported' }

  // Handle dynamic routes
  if (path.startsWith('/skills/invoke/')) {
    const skillName = path.split('/').pop()
    return invokeSkill(skillName)
  }

  if (path.startsWith('/genres/scaffold/')) {
    const genreName = path.split('/').pop()
    return getGenreScaffold(genreName)
  }

  if (path.startsWith('/search/')) {
    const query = path.split('/').pop()
    return searchFlatLibrary(query)
  }

  // Static routes
  const handler = resources[path]
  if (handler) return handler()

  return { error: `Route not found: ${path}` }
}

module.exports = {
  listSkills,
  invokeSkill,
  listGenres,
  getGenreScaffold,
  searchFlatLibrary,
  handleRequest,
  REPO_ROOT,
  SKILLS_DIR,
  GENRES_DIR,
  FLAT_LIBRARY_DIR
}
