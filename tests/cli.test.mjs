import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { generate } from '../generators/cli.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const palettes = JSON.parse(readFileSync(resolve(root, 'data/palettes.json'), 'utf8'));
const [{ files }] = generate(palettes);
const envPython = resolve(root, '.tools/validate-env', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const python = process.env.KOKEDERA_TEST_PYTHON || (existsSync(envPython) ? envPython : 'python');
const textFiles = Object.fromEntries(Object.entries(files).filter(([,v]) => typeof v === 'string'));
function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024, ...options });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${executable}: ${result.stderr}\n${result.stdout}`);
  return result;
}

test('CLI contains all eight targets, complete independent Yazi flavors and valid palette PNGs', () => {
  const license = readFileSync(resolve(root, 'LICENSE'), 'utf8');
  for (const p of palettes) {
    for (const file of [`starship/kokedera-${p.id}.toml`, `tmux/kokedera-${p.id}.conf`,
      `zellij/kokedera-${p.id}.kdl`, `lazygit/kokedera-${p.id}.yml`, `fzf/kokedera-${p.id}.sh`,
      `btop/kokedera-${p.id}.theme`, `yazi/kokedera-${p.id}.yazi/flavor.toml`, `bat/Kokedera ${p.name}.tmTheme`]) assert.ok(files[file], file);
    const dir = `yazi/kokedera-${p.id}.yazi`;
    for (const filename of ['flavor.toml', 'tmtheme.xml', 'README.md', 'preview.png', 'LICENSE', 'LICENSE-tmtheme']) assert.ok(files[`${dir}/${filename}`]);
    assert.equal(files[`${dir}/LICENSE`], license);
    assert.equal(files[`${dir}/LICENSE-tmtheme`], license);
  }
  const script = String.raw`
import base64, binascii, json, struct, sys, zlib
for p in json.load(sys.stdin):
    image=base64.b64decode(p['image']); assert image[:8]==b'\x89PNG\r\n\x1a\n'
    at, data=8, b''
    while at < len(image):
        size=struct.unpack('>I',image[at:at+4])[0]; chunk=image[at+4:at+8]; payload=image[at+8:at+8+size]
        assert binascii.crc32(chunk+payload)==struct.unpack('>I',image[at+8+size:at+12+size])[0]
        if chunk==b'IHDR': w,h,depth,kind,_,_,_=struct.unpack('>IIBBBBB',payload); assert depth==8 and kind==2
        if chunk==b'IDAT': data+=payload
        at+=12+size
    pixels=zlib.decompress(data); assert len(pixels)==h*(1+w*3)
    for i,color in enumerate(p['colors']):
        x,y=24+(i%10)*60,40+(i//10)*80
        pos=y*(1+w*3)+1+x*3
        assert '#'+pixels[pos:pos+3].hex()==color
`;
  run(python, ['-c', script], { input: JSON.stringify(palettes.map(p => ({ image: files[`yazi/kokedera-${p.id}.yazi/preview.png`].toString('base64'), colors: [p.terminal.background,p.terminal.foreground,p.terminal.cursor,p.terminal.selectionBackground,...p.terminal.ansi] }))) });
});

test('all nine variants conform to pinned official Starship, lazygit and Yazi schemas', () => {
  const script = String.raw`
import json, pathlib, sys, tomllib, yaml, jsonschema
payload=json.load(sys.stdin); files=payload['files']; folder=pathlib.Path(payload['fixtures'])
for app,suffix,schema_name in [('starship','.toml','starship-config'),('lazygit','.yml','lazygit-config'),('yazi','/flavor.toml','yazi-theme')]:
    schema=json.loads((folder/(schema_name+'.schema.json')).read_text(encoding='utf-8'))
    validator=jsonschema.validators.validator_for(schema)(schema)
    count=0
    for path,content in files.items():
        if not path.startswith(app+'/') or not path.endswith(suffix): continue
        count+=1; data=yaml.safe_load(content) if suffix=='.yml' else tomllib.loads(content)
        errors=list(validator.iter_errors(data)); assert not errors, (path,[e.message for e in errors])
        if app=='yazi':
            assert data['app']['overall'].keys()=={'bg'}
            assert data['filetype']['rules'][0]['url']=='*/'
            assert data['filetype']['rules'][-1]['url']=='*'
        if app=='starship':
            palette=data['palettes'][data['palette']]
            for name in ['directory','git_branch','git_status','cmd_duration']:
                for token in data[name]['style'].split(): assert token=='bold' or token in palette
    assert count==9, (app,count)
print('27 configurations conform to their official schemas')
`;
  const result = run(python, ['-c', script], { input: JSON.stringify({ files: textFiles, fixtures: resolve(root, 'tests/fixtures/cli') }) });
  assert.match(result.stdout, /27 configurations conform/);
});

test('Zellij components use valid RGB values and visibly distinguish focused and unfocused frames', () => {
  // Component names from the official theme specification, not generator internals.
  const allowed = new Set(['text_unselected','text_selected','ribbon_unselected','ribbon_selected','table_title','table_cell_unselected','table_cell_selected','list_unselected','list_selected','frame_unselected','frame_selected','frame_highlight','exit_code_success','exit_code_error','multiplayer_user_colors']);
  for (const p of palettes) {
    const kdl=files[`zellij/kokedera-${p.id}.kdl`];
    const blocks=[...kdl.matchAll(/^ {8}(\w+) \{\n([\s\S]*?)^ {8}\}/gm)];
    assert.equal(blocks.length, allowed.size);
    for (const [,name,content] of blocks) {
      assert.ok(allowed.has(name), name);
      const lines=content.trim().split('\n');
      assert.equal(lines.length, name==='multiplayer_user_colors'?10:6);
      for (const line of lines) {
        const match=line.trim().match(/^(base|background|emphasis_[0-3]|player_(?:[1-9]|10)) (\d+) (\d+) (\d+)$/);
        assert.ok(match, line);
        match.slice(2).forEach(n=>assert.ok(Number(n)>=0&&Number(n)<=255));
      }
    }
    const block=name=>blocks.find(b=>b[1]===name)[2];
    assert.notEqual(block('frame_selected').match(/base (.*)/)[1],block('frame_unselected').match(/base (.*)/)[1]);
    assert.equal((kdl.match(/{/g)||[]).length,(kdl.match(/}/g)||[]).length);
  }
});

const native=resolve(root,'.tools/cli-native');
const executables={starship:resolve(native,'starship/starship.exe'),fzf:resolve(native,'fzf/fzf.exe'),bat:resolve(native,'bat/bat-v0.26.1-x86_64-pc-windows-msvc/bat.exe')};
const probes=resolve(native,'probes');
function materialize() {
  for (const [path,content] of Object.entries(files)) { const target=resolve(probes,path); mkdirSync(dirname(target),{recursive:true}); writeFileSync(target,content); }
}

test('native Starship renders success and error prompts for all nine palettes without warnings', {skip:process.platform!=='win32'||!existsSync(executables.starship)}, () => {
  materialize();
  for(const p of palettes) for(const status of ['0','1']) {
    const result=run(executables.starship,['prompt','--status',status,'--path',probes,'--cmd-duration','2000'],{cwd:probes,env:{...process.env,STARSHIP_CONFIG:resolve(probes,`starship/kokedera-${p.id}.toml`),STARSHIP_CACHE:resolve(probes,'starship-cache'),STARSHIP_LOG:'warn',TERM:'xterm-256color'}});
    assert.equal(result.stderr.trim(),'');
    assert.ok(result.stdout.includes('>'));
    assert.ok(result.stdout.includes('\u001b['));
  }
});

test('native fzf validates colors and PowerShell snippets preserve existing options', {skip:process.platform!=='win32'||!existsSync(executables.fzf)}, () => {
  materialize();
  const sentinel='--height=40% --bind=ctrl-j:down';
  for(const p of palettes) {
    const script=resolve(probes,`fzf/kokedera-${p.id}.ps1`);
    const result=run('powershell.exe',['-NoProfile','-NonInteractive','-Command',`. '${script.replaceAll("'","''")}'; [Console]::Write($env:FZF_DEFAULT_OPTS)`],{env:{...process.env,FZF_DEFAULT_OPTS:sentinel}});
    assert.ok(result.stdout.startsWith(sentinel+' --color='));
    const fzf=run(executables.fzf,['--filter','moss'],{input:'stone\nmoss\nlantern\n',env:{...process.env,FZF_DEFAULT_OPTS:result.stdout}});
    assert.equal(fzf.stdout.trim(),'moss'); assert.equal(fzf.stderr.trim(),'');
  }
});

test('native bat compiles and renders all nine TextMate themes in an isolated cache', {skip:process.platform!=='win32'||!existsSync(executables.bat)}, () => {
  materialize();
  const source=resolve(probes,'bat-config'),cache=resolve(probes,'bat-cache');
  mkdirSync(resolve(source,'themes'),{recursive:true}); mkdirSync(cache,{recursive:true});
  for(const p of palettes) writeFileSync(resolve(source,`themes/Kokedera ${p.name}.tmTheme`),files[`bat/Kokedera ${p.name}.tmTheme`]);
  const env={...process.env,BAT_CONFIG_DIR:source,BAT_CACHE_PATH:cache,BAT_CONFIG_PATH:resolve(source,'config')};
  writeFileSync(env.BAT_CONFIG_PATH,'');
  run(executables.bat,['cache','--build','--source',source,'--target',cache],{env});
  for(const p of palettes) {
    const result=run(executables.bat,['--no-config','--theme',`Kokedera ${p.name}`,'--color','always','--paging','never',resolve(probes,'demo/example.py')],{env});
    assert.equal(result.stderr.trim(),'');
    assert.ok(result.stdout.includes('Lantern'));
    assert.ok(result.stdout.includes('\u001b['));
  }
});
