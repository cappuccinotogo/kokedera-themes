import test from 'node:test';
import assert from 'node:assert/strict';
import { outputs, safePath, hash } from '../scripts/build.mjs';
import { resolve } from 'node:path';

test('every promised repository is reproducible and shares exact palette provenance',async()=>{
  const first=await outputs(), second=await outputs();
  assert.deepEqual(first,second);
  const expected=['terminals','cli','extension-neovim','extension-vim','extension-helix','extension-sublime',
    'extension-emacs','extension-notepadpp','extension-xcode','extension-obsidian','extension-typora',
    'extension-firefox','extension-kde','extension-jupyterlab'].map(n=>`kokedera-theme-${n}`);
  assert.deepEqual(first.map(r=>r.repo).sort(),expected.sort());
  const manifests=first.map(r=>JSON.parse(r.files['kokedera.json']));
  assert.equal(new Set(manifests.map(m=>m.paletteHash)).size,1);
  assert.equal(new Set(manifests.map(m=>m.generatorHash)).size,1);
  first.forEach((repo,i)=>{
    const m=manifests[i];
    assert.equal(m.variants.length,9);
    assert.ok(repo.install.length>100);
    for (const [file,digest] of Object.entries(m.files)) assert.equal(hash(repo.files[file]),digest);
    for (const [file,content] of Object.entries(repo.files)) {
      if(typeof content==='string' && !file.endsWith('.reg')) assert.ok(!content.includes('\r'),`${repo.repo}/${file} must match Git LF output`);
    }
    assert.ok(repo.files['README.md'].includes('Kokedera Morning'));
  });
});
test('output paths cannot escape a repository',()=>{
  const root=resolve('test-output');
  for(const path of ['../escape','/absolute','foo/../../escape','foo\\bar','.git/config','C:escape','']) assert.throws(()=>safePath(root,path));
  assert.equal(safePath(root,'themes/dusk.toml'),resolve(root,'themes/dusk.toml'));
});
