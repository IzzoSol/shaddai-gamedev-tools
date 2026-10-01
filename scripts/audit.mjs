// node scripts/audit.mjs — repo health check. Exit code 1 if anything fails.
// Checks: JS syntax · markdown links · skill registry vs files · stale references · MCP bridge loads ·
//         every skill has valid front-matter · test suites pass.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const SKIP = new Set(['.git', 'node_modules', '__pycache__', '.pytest_cache']);
const problems = [], notes = [];
const fail = (area, msg) => problems.push(`[${area}] ${msg}`);
const rel = (p) => relative(root, p).split(sep).join('/');

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
const files = walk(root);
const byExt = (re) => files.filter((f) => re.test(f));

// 1 ── JS syntax
let jsCount = 0;
for (const f of byExt(/\.(m?js)$/)) {
  jsCount++;
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) fail('syntax', `${rel(f)}: ${(r.stderr || '').split('\n').find((l) => l.includes('Error')) || 'does not parse'}`);
}
notes.push(`${jsCount} JS files parsed`);

// 2 ── markdown links
let linkCount = 0;
for (const f of byExt(/\.md$/)) {
  const text = readFileSync(f, 'utf8').replace(/```[\s\S]*?```/g, '');         // ignore code blocks
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    let target = m[1].split('#')[0];
    if (!target || /^[a-z]+:|^mailto:/i.test(target)) continue;
    linkCount++;
    const abs = resolve(dirname(f), decodeURIComponent(target));
    if (!existsSync(abs)) fail('links', `${rel(f)} → ${m[1]} (missing)`);
  }
}
notes.push(`${linkCount} relative links checked`);

// 3 ── skill registry ↔ skill files, and front-matter
const registry = join(root, 'SKILLS-HUB', 'SKILL-REGISTRY.md');
const skillDir = join(root, 'SKILLS-HUB', '.claude', 'skills');
const onDisk = existsSync(skillDir) ? readdirSync(skillDir).filter((d) => existsSync(join(skillDir, d, 'SKILL.md'))) : [];
if (existsSync(registry)) {
  const listed = [...readFileSync(registry, 'utf8').matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((m) => m[1]);
  for (const name of listed) {
    const inFlat = existsSync(join(root, 'FLAT-LIBRARY', 'three-core', name, 'SKILL.md'));
    if (!onDisk.includes(name) && !inFlat) fail('registry', `skill "${name}" is listed but has no SKILL.md`);
  }
  for (const name of onDisk) if (!listed.includes(name)) notes.push(`skill "${name}" exists but is not in the registry`);
  notes.push(`${listed.length} registry entries checked`);
}
for (const d of onDisk) {
  const t = readFileSync(join(skillDir, d, 'SKILL.md'), 'utf8').replaceAll(String.fromCharCode(13), '');
  const fm = /^---\n([\s\S]*?)\n---/.exec(t);
  if (!fm || !/^name:\s*\S+/m.test(fm[1]) || !/^description:\s*\S+/m.test(fm[1])) fail('skills', `${d}/SKILL.md needs name + description front-matter`);
  else if (fm[1].match(/^name:\s*(\S+)/m)[1] !== d) fail('skills', `${d}/SKILL.md name does not match its folder`);
}

// 3b ── skill folders mirrored in FLAT-LIBRARY must not contradict (just report duplicates)
// 4 ── stale references to things that were removed or never belonged here
const STALE = /nicewolf|impertio|cloudai|playable-game-creator|3d-asset-test|asteroid-dodger|image[-_]to[-_]3dlab|Bingeljell|mike007jd|opencode-game-studio/i;
for (const f of byExt(/\.(md|m?js|json|py|html)$/)) {
  if (rel(f).startsWith('scripts/audit.mjs')) continue;
  const text = readFileSync(f, 'utf8');
  const m = STALE.exec(text);
  if (m) fail('stale', `${rel(f)} mentions "${m[0]}"`);
}

// 5 ── MCP bridge loads
const bridge = join(root, 'SHADDAI-MCP-BRIDGE', 'mcp.js');
if (existsSync(bridge)) {
  const r = spawnSync(process.execPath, ['-e', `try{require(${JSON.stringify(bridge)});console.log('ok')}catch(e){console.log('ERR '+e.message)}`], { encoding: 'utf8', timeout: 20000 });
  if (!/^ok/.test(r.stdout || '')) fail('bridge', `mcp.js does not load: ${(r.stdout || r.stderr).trim().slice(0, 160)}`);
  else notes.push('MCP bridge loads');
}

// 6 ── tests
function tests(label, cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 300000 });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  if (r.status !== 0) fail('tests', `${label} failed:\n${out.trim().split('\n').slice(-8).join('\n')}`);
  else notes.push(`${label}: ${(out.match(/(\d+ passed)|(all [\w ]+ tests passed)/i) || ['ok'])[0]}`);
}
const gf = join(root, 'game-forge');
for (const t of ['ecs/world.test.mjs', 'runtime/runtime.test.mjs', 'runtime/panorama.test.mjs']) if (existsSync(join(gf, t))) tests(t, process.execPath, [t], gf);
const atelier = join(root, 'shaddai-3d-atelier');
if (existsSync(atelier)) tests('atelier pytest', 'python', ['-m', 'pytest', '-q', '-p', 'no:cacheprovider'], atelier);

// 7 ── guides are indexed in the Game Forge README
const guides = readdirSync(join(gf, 'guides')).filter((f) => /^\d\d-/.test(f));
const readme = readFileSync(join(gf, 'README.md'), 'utf8');
if (!new RegExp(`01.${String(guides.length).padStart(2, '0')}`).test(readme)) fail('docs', `game-forge/README.md should say guides 01–${String(guides.length).padStart(2, '0')}`);

console.log(notes.map((n) => '  ✓ ' + n).join('\n'));
if (problems.length) { console.log(`\n${problems.length} problem(s):\n` + problems.map((p) => '  ✗ ' + p).join('\n')); process.exit(1); }
console.log('\nAUDIT PASSED');
