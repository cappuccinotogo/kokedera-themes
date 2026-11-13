// Single source for the Kokedera file icons.
//
// icons/ holds every SVG once: the Dusk set at the root, the other eight
// variants in icons/<variant>/. Each editor extension receives its own copy:
//
//   vscode     extensions/vscode-icons/icons                       copied as is   (git-ignored, made by vscode:prepublish)
//   zed        extensions/zed-icons/icons                          copied as is   (committed: the Zed registry reads the repository directly)
//   jetbrains  extensions/jetbrains-icons/src/main/resources/icons  16x16 sized    (git-ignored, made by the Gradle build)
//
// Usage:
//   node tools/icons.mjs [vscode|zed|jetbrains ...]          write the copies (default: all)
//   node tools/icons.mjs --check [vscode|zed|jetbrains ...]  fail if a copy differs from the source
//   node tools/icons.mjs --compare <target> <dir>            compare the output for <target> with an existing folder
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'icons');

// JetBrains renders SVG icons at their declared size, so its copy declares the
// 16px tree size. The drawing and viewBox stay identical to the shared source.
const jetbrains = svg => {
  const sized = svg.replace('<svg viewBox=', '<svg width="16" height="16" viewBox=');
  if (sized === svg) throw new Error('Expected `<svg viewBox=` in every source icon');
  return sized;
};

export const targets = {
  vscode: { dir: 'extensions/vscode-icons/icons', transform: svg => svg },
  zed: { dir: 'extensions/zed-icons/icons', transform: svg => svg },
  jetbrains: { dir: 'extensions/jetbrains-icons/src/main/resources/icons', transform: jetbrains },
};

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await files(path));
    else if (entry.name.endsWith('.svg')) out.push(path);
  }
  return out.sort();
}

export async function render(name) {
  const target = targets[name];
  if (!target) throw new Error(`Unknown target ${name}; use ${Object.keys(targets).join(', ')}`);
  const result = new Map();
  for (const file of await files(source)) {
    const rel = relative(source, file).split(sep).join('/');
    const svg = (await readFile(file, 'utf8')).replaceAll('\r\n', '\n');
    result.set(rel, target.transform(svg));
  }
  return result;
}

async function compare(rendered, dir) {
  const problems = [];
  const existing = await files(dir).catch(() => []);
  const seen = new Set(existing.map(f => relative(dir, f).split(sep).join('/')));
  for (const [rel, svg] of rendered) {
    if (!seen.has(rel)) { problems.push(`missing ${rel}`); continue; }
    const actual = (await readFile(join(dir, rel), 'utf8')).replaceAll('\r\n', '\n');
    if (actual !== svg) problems.push(`differs ${rel}`);
  }
  for (const rel of seen) if (!rendered.has(rel)) problems.push(`extra ${rel}`);
  return problems;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--compare') {
    const [, name, dir] = args;
    const problems = await compare(await render(name), resolve(dir));
    if (problems.length) throw new Error(`${problems.length} differences for ${name}:\n${problems.slice(0, 20).join('\n')}`);
    console.log(`${name}: output matches ${dir}`);
    return;
  }
  const check = args.includes('--check');
  const names = args.filter(a => !a.startsWith('--'));
  for (const name of names.length ? names : Object.keys(targets)) {
    const rendered = await render(name);
    const dir = join(root, targets[name].dir);
    if (check) {
      const problems = await compare(rendered, dir);
      if (problems.length) throw new Error(`${name} icons are out of date (${problems.length} differences); run node tools/icons.mjs ${name}\n${problems.slice(0, 20).join('\n')}`);
      console.log(`${name}: ${rendered.size} icons up to date`);
    } else {
      await rm(dir, { recursive: true, force: true });
      for (const [rel, svg] of rendered) {
        const file = join(dir, rel);
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, svg);
      }
      console.log(`${name}: wrote ${rendered.size} icons to ${targets[name].dir}`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}
