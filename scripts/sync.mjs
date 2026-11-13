import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The website stays a private sibling checkout; KOKEDERA_SITE overrides its location.
// The VS Code theme lives in this monorepo.
const site = resolve(root, process.env.KOKEDERA_SITE ?? '../kokedera');
const siteThemes = 'apps/web/src/lib/themes.ts';
const vscode = resolve(root, 'extensions/vscode-theme');
const { THEMES } = await import(pathToFileURL(resolve(site, siteThemes)));
const ansiKeys = ['Black','Red','Green','Yellow','Blue','Magenta','Cyan','White',
  'BrightBlack','BrightRed','BrightGreen','BrightYellow','BrightBlue','BrightMagenta','BrightCyan','BrightWhite'];
const palettes = [];
const sources = {};
const check = process.argv.includes('--check');
async function save(path, content) {
  if (typeof content === 'string' || /(?:\.svg|LICENSE)$/.test(path)) content = content.toString().replaceAll('\r\n','\n');
  const target = resolve(root,path);
  if (check) {
    if (!(await readFile(target)).equals(Buffer.from(content))) throw new Error(`Upstream drift in ${path}; review and run npm run sync.`);
  } else await writeFile(target,content);
}
for (const p of THEMES) {
  const themePath = `themes/kokedera-${p.id}-color-theme.json`;
  const raw = await readFile(resolve(vscode, themePath), 'utf8');
  const theme = JSON.parse(raw);
  const c = theme.colors;
  const semantic = key => {
    const value = theme.semanticTokenColors[key];
    return typeof value === 'string' ? value : value?.foreground;
  };
  if (c['editor.background'] !== p.tokens.bgPage || c['editor.foreground'] !== p.tokens.textPrimary) {
    throw new Error(`Site and VS Code disagree on core colors for ${p.id}; reconcile before syncing.`);
  }
  const syntax = Object.fromEntries(['keyword','variable','property','function','parameter','type',
    'comment','string','number','operator','regexp','boolean'].map(key => [key, semantic(key)]));
  syntax.constant = semantic('variable.readonly');
  palettes.push({id:p.id, name:p.name, scheme:p.scheme, description:p.description,
    tokens:p.tokens, terminal:{
      background:c['terminal.background'], foreground:c['terminal.foreground'],
      cursor:c['terminalCursor.foreground'], selectionBackground:c['terminal.selectionBackground'],
      selectionForeground:c['terminal.selectionForeground'] ?? c['terminal.foreground'],
      ansi:ansiKeys.map(key => c[`terminal.ansi${key}`]),
    }, syntax, textmate:theme.tokenColors});
  sources[themePath] = createHash('sha256').update(raw.replaceAll('\r\n','\n')).digest('hex');
}
await mkdir(resolve(root, 'data'), {recursive:true});
await mkdir(resolve(root, 'brand'), {recursive:true});
await save('data/palettes.json', JSON.stringify(palettes, null, 2) + '\n');
const revision = (cwd,path) => execFileSync('git', ['log','-1','--format=%H','--',path], {cwd,encoding:'utf8'}).trim();
await save('data/upstream.json', JSON.stringify({
  schemaVersion:1, textHashLineEndings:'LF',
  website:{repository:'cappuccinotogo/kokedera',revision:revision(site,siteThemes),path:siteThemes,
    sha256:createHash('sha256').update((await readFile(resolve(site,siteThemes),'utf8')).replaceAll('\r\n','\n')).digest('hex')},
  vscode:{repository:'cappuccinotogo/kokedera-themes',path:'extensions/vscode-theme',revision:revision(vscode,'themes'),files:sources},
},null,2)+'\n');
await save('brand/golem.svg',await readFile(resolve(site, 'brand/golem.svg')));
await save('brand/icon.png',await readFile(resolve(vscode, 'icon.png')));
await save('LICENSE',await readFile(resolve(vscode, 'LICENSE')));
console.log(`${check?'Verified':'Synchronized'} ${palettes.length} palettes, existing ANSI and syntax colors, and shared branding.`);
