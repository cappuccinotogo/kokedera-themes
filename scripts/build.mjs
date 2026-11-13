import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate as terminals } from '../generators/terminals.mjs';
import { generate as editors } from '../generators/editors.mjs';
import { generate as apps } from '../generators/apps.mjs';
import { generate as cli } from '../generators/cli.mjs';
import { owner, monorepo, monorepoUrl, portPath } from '../generators/repositories.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const hash = content => createHash('sha256').update(content).digest('hex');
export function safePath(base, path) {
  if (path.includes('\\') || path.includes(':') || isAbsolute(path) || path.split('/').some(p=>p==='..'||p==='.git')) throw new Error(`Unsafe path ${path}`);
  const target = resolve(base,path), rel = relative(base,target);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Unsafe path ${path}`);
  return target;
}
export async function outputs() {
  const palettesRaw = await readFile(resolve(root,'data/palettes.json'));
  const palettes = JSON.parse(palettesRaw);
  const brand = await readFile(resolve(root,'brand/golem.svg'));
  const icon = await readFile(resolve(root,'brand/icon.png'));
  const license = await readFile(resolve(root,'LICENSE'));
  const code = [];
  for (const folder of ['generators','scripts']) {
    for (const name of (await readdir(resolve(root,folder))).filter(n=>/\.(mjs|py)$/.test(n)).sort()) {
      code.push(`${folder}/${name}\n`, (await readFile(resolve(root,folder,name),'utf8')).replaceAll('\r\n','\n'));
    }
  }
  const generatorHash = hash(Buffer.concat(code.map(v=>Buffer.isBuffer(v)?v:Buffer.from(v))));
  const repos = [...await terminals(palettes), ...await editors(palettes), ...await apps(palettes), ...await cli(palettes)];
  if (new Set(repos.map(r=>r.repo)).size !== repos.length) throw new Error('Duplicate repository');
  for (const repo of repos) {
    if (!/^kokedera-theme-[a-z0-9-]+$/.test(repo.repo)) throw new Error(`Invalid repo: ${repo.repo}`);
    repo.files['README.md'] = readme(repo, palettes);
    repo.files['LICENSE'] = license;
    repo.files['assets/golem.svg'] = brand;
    repo.files['assets/icon.png'] = icon;
    repo.files['assets/palettes.svg'] = preview(palettes);
    repo.files['.gitattributes'] = '* text=auto eol=lf\n*.png binary\n*.woff2 binary\n*.reg -text\n';
    repo.files['.gitignore'] ??= 'node_modules/\ndist/\nbuild/\n__pycache__/\n*.pyc\n';
    repo.files['.github/workflows/validate.yml'] ??= `name: Validate generated theme\non: [push, pull_request, workflow_dispatch]\npermissions:\n  contents: read\njobs:\n  validate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.12'\n      - run: python scripts/verify.py\n`;
    repo.files['scripts/verify.py'] = await readFile(resolve(root,'scripts/verify-release.py'),'utf8');
    // Git normalizes text to LF. Hash exactly the bytes a clean checkout receives.
    // Registry imports retain CRLF and are explicitly excluded from Git conversion.
    for(const [path,content] of Object.entries(repo.files)) {
      if(typeof content==='string' || (Buffer.isBuffer(content) && !content.includes(0) && Buffer.from(content.toString('utf8')).equals(content))) {
        const text=content.toString().replaceAll('\r\n','\n');
        repo.files[path]=path.endsWith('.reg')?text.replaceAll('\n','\r\n'):text;
      }
    }
    repo.files['kokedera.json'] = JSON.stringify({schemaVersion:1, version:'1.0.0',
      repository:`${owner}/${monorepo}`, path:portPath(repo.repo),
      generator:monorepoUrl,generatorHash,
      paletteHash:hash(palettesRaw), variants:palettes.map(p=>({id:p.id,name:`Kokedera ${p.name}`,scheme:p.scheme})),
      files:Object.fromEntries(Object.entries(repo.files).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([path,content])=>[path,hash(content)])),
    },null,2)+'\n';
  }
  return repos;
}
function readme(repo,palettes) {
  return `<p align="center"><img src="assets/golem.svg" width="80" alt="Kokedera's stone golem"></p>\n\n# ${repo.title}\n\n${repo.description}\n\nNine palettes inspired by forest greens, weathered stone, and warm lantern light. Seven dark variants and two light variants, matching the Kokedera themes for VS Code, JetBrains, and Zed.\n\n[Explore Kokedera](https://kokedera.style) · [All ports](${monorepoUrl})\n\n![The nine Kokedera palettes](assets/palettes.svg)\n\n## Variants\n\n| Name | Appearance |\n| --- | --- |\n${palettes.map(p=>`| Kokedera ${p.name} | ${p.scheme} |`).join('\n')}\n\n## Installation\n\n${repo.install.trim()}\n\n## Consistency and maintenance\n\n${maintenance(repo)} The same palette snapshot supplies every port; terminal ANSI colors and syntax roles come from the existing VS Code themes. Application-specific UI roles are mapped in the central generators.\n\nTo change colors or fix a mapping, edit the central source in [kokedera-themes](${monorepoUrl}) and regenerate. Avoid hand-editing generated files here. \`kokedera.json\` records the palette and generator hashes, all nine variants, and file checksums. Run \`python scripts/verify.py\` to check this checkout.\n\nThese are direct-install ports. A GitHub release does not imply approval or inclusion in an application's theme store. See the installation notes for application-specific limits.\n\n## Format references\n\n${repo.sources.map(s=>`- ${s}`).join('\n')}\n\n## License\n\n[MIT](LICENSE). Kokedera by Florian Mühlhans.\n`;
}
function maintenance(repo) {
  return `This folder contains ready-to-use files generated by [kokedera-themes](${monorepoUrl}). Please open issues and pull requests there.`;
}
function preview(palettes) {
  const rows = palettes.map((p,i)=>`<g transform="translate(0 ${i*62})"><rect width="900" height="62" fill="${p.tokens.bgPage}"/><text x="20" y="37" fill="${p.tokens.textPrimary}" font-size="18">Kokedera ${p.name}</text>${[p.syntax.keyword,p.syntax.function,p.syntax.type,p.syntax.string,p.syntax.number,p.tokens.torii,p.tokens.wisteria,p.tokens.stream].map((c,j)=>`<rect x="${240+j*78}" y="17" width="58" height="28" rx="5" fill="${c}"/>`).join('')}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 ${palettes.length*62}" role="img" aria-label="Nine Kokedera palettes" font-family="system-ui, sans-serif">${rows}</svg>\n`;
}
async function main() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  const target = outIndex >= 0 ? resolve(args[outIndex+1]) : resolve(root,'.build');
  const check = args.includes('--check');
  const repos = await outputs();
  // Refuse stale generated paths instead of silently shipping obsolete themes.
  // Only files recorded in the previous manifest are considered; user files stay alone.
  for (const repo of repos) {
    const base = safePath(target,repo.repo);
    await rejectSymlinks(target,base);
    const previous = await readFile(resolve(base,'kokedera.json'),'utf8').catch(e=>{
      if(e.code==='ENOENT') return null;
      throw e;
    });
    if(previous) {
      const obsolete=[];
      for(const path of Object.keys(JSON.parse(previous).files)) {
        if(Object.hasOwn(repo.files,path)) continue;
        const old=safePath(base,path);
        if(await lstat(old).catch(()=>null)) obsolete.push(path);
      }
      if(obsolete.length) throw new Error(`Obsolete generated files in ${repo.repo}: ${obsolete.join(', ')}. Review and remove these exact files before rebuilding.`);
    }
  }
  let count = 0;
  for (const repo of repos) {
    const base = safePath(target,repo.repo);
    for (const [path,content] of Object.entries(repo.files)) {
      const file = safePath(base,path);
      await rejectSymlinks(target,file);
      if (check) {
        const actual = await readFile(file).catch(()=>null);
        if (!actual || !actual.equals(Buffer.from(content))) throw new Error(`Generated file differs: ${repo.repo}/${path}`);
      } else {
        await mkdir(dirname(file),{recursive:true});
        await writeFile(file,content);
      }
      count++;
    }
  }
  console.log(`${check?'Verified':'Generated'} ${count} files in ${repos.length} repositories (${target}).`);
}
async function rejectSymlinks(base,target) {
  let current=target;
  while(current!==base) {
    const info=await lstat(current).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
    if(info?.isSymbolicLink()) throw new Error(`Refusing a symlink or junction in generated output: ${current}`);
    const parent=dirname(current);
    if(parent===current) throw new Error(`Output escaped base: ${target}`);
    current=parent;
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
