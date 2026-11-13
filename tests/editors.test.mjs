import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generate } from '../generators/editors.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const palettes=JSON.parse(readFileSync(join(root,'data/palettes.json'),'utf8'));
const results=generate(palettes);
const get=target=>results.find(r=>r.repo.endsWith(`-${target}`));

test('all editor variants are independently installable and contain valid literal colors',()=>{
  assert.equal(results.length,7);
  assert.equal(new Set(results.map(r=>r.repo)).size,results.length);
  for(const repo of results) {
    assert.ok(repo.install.length>250);
    assert.ok(repo.sources.every(s=>s.startsWith('https://')));
    for(const [path,text] of Object.entries(repo.files)) {
      assert.ok(!path.startsWith('/')&&!path.includes('..'));
      assert.equal(typeof text,'string');
      assert.ok(!text.includes('undefined'),`${repo.repo}/${path} contains undefined`);
      assert.ok(!text.startsWith('\ufeff'),`${path} has a BOM`);
    }
    for(const p of palettes) assert.ok(Object.keys(repo.files).some(path=>path.toLowerCase().includes(p.id)),`${repo.repo}: missing ${p.id}`);
  }
});

test('Sublime native UI inheritance, Python picker and syntax styles stay consistent',()=>{
  const r=get('sublime');
  for(const p of palettes) {
    const scheme=JSON.parse(r.files[`Kokedera ${p.name}.sublime-color-scheme`]);
    const ui=JSON.parse(r.files[`Kokedera ${p.name}.sublime-theme`]);
    assert.equal(scheme.globals.background,p.terminal.background);
    assert.equal(scheme.globals.foreground,p.terminal.foreground);
    assert.equal(scheme.globals.selection_foreground,p.terminal.selectionForeground);
    assert.ok(scheme.rules.some(r=>r.scope.includes('entity.name.function')));
    assert.ok(scheme.rules.every(r=>r.font_style===undefined||r.font_style.split(/\s+/).every(s=>['','bold','italic','underline','glow','stippled_underline','squiggly_underline'].includes(s))));
    assert.equal(ui.extends,'Adaptive.sublime-theme');
    for(const c of ['sidebar_tree','tab_control','quick_panel','auto_complete']) assert.ok(ui.rules.some(rule=>rule.class===c));
  }
  const commands=JSON.parse(r.files['Kokedera.sublime-commands']);
  assert.equal(commands.length,palettes.length);
  assert.ok(commands.every(c=>c.command==='kokedera_select'&&palettes.some(p=>p.name===c.args.variant)));
});

function withFiles(run) {
  const dir=mkdtempSync(join(tmpdir(),'kokedera-editor-test-'));
  try {
    for(const r of results)for(const [path,text] of Object.entries(r.files)) {
      const dest=join(dir,r.repo,path);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,text);
    }
    return run(dir);
  } finally {
    assert.equal(dirname(resolve(dir)),resolve(tmpdir()));
    assert.ok(basename(dir).startsWith('kokedera-editor-test-'));
    rmSync(dir,{recursive:true,force:true});
  }
}

test('Helix TOML, Notepad++ XML, Xcode plists and Sublime Python parse with native parsers',()=>withFiles(dir=>{
  const script=String.raw`
import sys,pathlib,tomllib,plistlib,xml.etree.ElementTree as E,ast,json,re
root=pathlib.Path(sys.argv[1]); palettes=json.loads(pathlib.Path(sys.argv[2]).read_text(encoding='utf-8'))
for p in palettes:
    h=tomllib.loads((root/'kokedera-theme-extension-helix'/'themes'/('kokedera_'+p['id']+'.toml')).read_text())
    assert h['ui.background']['bg']==p['terminal']['background']
    for scope in ['ui.cursor.primary','ui.selection.primary','ui.menu.selected','ui.statusline.insert','diagnostic.error','markup.heading.6','variable.parameter','diff.plus']:
        assert scope in h,scope
    assert len(h)>110
    def validate_style(v):
        if isinstance(v,str): assert re.fullmatch(r'#[0-9a-fA-F]{6}',v),v
        else:
            for key in ['fg','bg']:
                if key in v: assert re.fullmatch(r'#[0-9a-fA-F]{6}',v[key]),v
            if 'underline' in v: assert v['underline']['style'] in ['line','curl','dashed','dotted','double_line']
    for value in h.values(): validate_style(value)
    x=plistlib.loads((root/'kokedera-theme-extension-xcode'/'themes'/('Kokedera '+p['name']+'.xccolortheme')).read_bytes())
    assert x['DVTFontAndColorVersion']==1
    assert len(x['DVTSourceTextSyntaxColors'])>=25
    assert x['DVTSourceTextSyntaxColors'].keys()==x['DVTSourceTextSyntaxFonts'].keys()
    def validate_rgba(value):
        parts=value.split(); assert len(parts)==4,value
        assert all(0<=float(v)<=1 for v in parts),value
    for key,value in x.items():
        if isinstance(value,str) and ('Color' in key or key=='DVTSourceTextBackground'): validate_rgba(value)
    for value in x['DVTSourceTextSyntaxColors'].values(): validate_rgba(value)
    n=E.fromstring((root/'kokedera-theme-extension-notepadpp'/'themes'/('Kokedera '+p['name']+'.xml')).read_bytes())
    assert n.tag=='NotepadPlus'
    lexers=n.find('LexerStyles'); assert len(lexers)>=90
    names={l.get('name') for l in lexers}
    assert {'cpp','python','html','xml','json','css','bash','powershell','yaml','rust','go'}.issubset(names),names
    for lexer in lexers:
        ids=[w.get('styleID') for w in lexer]; assert len(ids)==len(set(ids)),lexer.get('name')
    for w in n.iter():
        if w.tag in ['WordsStyle','WidgetStyle']:
            assert w.get('styleID').isdigit(),w.attrib
            for k in ['fgColor','bgColor']: assert re.fullmatch(r'[A-F0-9]{6}',w.get(k)),w.attrib
    default=next(w for w in n.find('GlobalStyles') if w.get('name')=='Default Style')
    assert default.get('bgColor')==p['terminal']['background'][1:].upper()
    assert default.get('fgColor')==p['terminal']['foreground'][1:].upper()
ast.parse((root/'kokedera-theme-extension-sublime'/'kokedera.py').read_text())
print('validated 9 Helix themes, 9 native Notepad++ themes, 9 Xcode plists, and Sublime picker')
`;
  const p=spawnSync(process.env.PYTHON??'python',['-c',script,dir,join(root,'data/palettes.json')],{encoding:'utf8'});
  assert.equal(p.status,0,p.stderr||p.error?.message||p.stdout);
}));

const nvim=process.env.KOKEDERA_NVIM_BIN??join(root,'.tools','nvim-win64','bin','nvim.exe');
test('Neovim loads all variants and resolves UI, Treesitter, LSP and plugin highlights', {skip:!existsSync(nvim)},()=>withFiles(dir=>{
  const plugin=join(dir,get('neovim').repo).replace(/\\/g,'/');
  const script=`vim.opt.runtimepath:prepend(${JSON.stringify(plugin)})
local k = require('kokedera')
local expected = vim.json.decode([==[${JSON.stringify(palettes)}]==])
for _, p in ipairs(expected) do
  k.setup({ variant = p.id })
  vim.cmd.colorscheme('kokedera')
  assert(vim.g.colors_name == 'kokedera-' .. p.id)
  assert(vim.o.background == p.scheme)
  local normal = vim.api.nvim_get_hl(0, { name = 'Normal', link = false })
  assert(normal.bg == tonumber(p.terminal.background:sub(2),16), 'background ' .. p.id)
  assert(normal.fg == tonumber(p.terminal.foreground:sub(2),16), 'foreground ' .. p.id)
  for _, pair in ipairs({ {'@function', p.syntax['function']}, {'@variable.parameter', p.syntax.parameter},
      {'@lsp.type.class', p.syntax.type}, {'DiagnosticError', p.tokens.torii}, {'GitSignsAdd', p.tokens.bamboo},
      {'TelescopeMatching', p.tokens.accentLime} }) do
    local hl=vim.api.nvim_get_hl(0,{name=pair[1],link=false})
    assert(hl.fg==tonumber(pair[2]:sub(2),16),pair[1] .. ' ' .. p.id)
  end
  for i=0,15 do assert(vim.g['terminal_color_' .. i]==p.terminal.ansi[i+1]) end
  package.loaded['lualine.themes.kokedera']=nil
  local line=require('lualine.themes.kokedera')
  assert(line.normal.a.bg==p.tokens.bamboo)
  assert(line.normal.c.bg==p.tokens.bgSurface)
end
k.setup({variant='morning',transparent=true,overrides={Comment={fg='#112233',italic=false}}})
k.load()
assert(vim.api.nvim_get_hl(0,{name='Normal',link=false}).bg==nil)
assert(vim.api.nvim_get_hl(0,{name='Comment',link=false}).fg==0x112233)
assert(not pcall(k.load,'invalid'), 'invalid variants must fail')
vim.cmd('qa!')
`;
  const path=join(dir,'native-nvim.lua');writeFileSync(path,script);
  const run=spawnSync(nvim,['--headless','-u','NONE','-i','NONE','-l',path],{encoding:'utf8',timeout:30000});
  assert.equal(run.status,0,run.stderr||run.error?.message||run.stdout);
}));

const vim=process.env.KOKEDERA_VIM_BIN??'C:/Program Files/Git/usr/bin/vim.exe';
test('classic Vim loads all colorschemes with correct background and ANSI colors',{skip:!existsSync(vim)},()=>withFiles(dir=>{
  const plugin=join(dir,get('vim').repo).replace(/\\/g,'/');
  let script=`set nocompatible\nset nomore\nset rtp^=${plugin.replace(/ /g,'\\ ')}\n`;
  for(const p of palettes)script+=`colorscheme kokedera-${p.id}\ncall assert_equal('${p.scheme}', &background)\ncall assert_equal('kokedera-${p.id}',g:colors_name)\ncall assert_equal('${p.terminal.background}',synIDattr(hlID('Normal'),'bg#','gui'))\ncall assert_equal('${p.syntax.keyword}',synIDattr(hlID('Keyword'),'fg#','gui'))\ncall assert_equal(16,len(g:terminal_ansi_colors))\n`;
  script+=`if len(v:errors)\n  call writefile(v:errors,'${join(dir,'vim-errors.txt').replace(/\\/g,'/')}')\n  cquit\nendif\nqa!\n`;
  const path=join(dir,'native-vim.vim');writeFileSync(path,script);
  const log=join(dir,'vim-log.txt');
  const run=spawnSync(vim,['-Nu','NONE','-i','NONE','-n','-es',`-V1${log.replace(/\\/g,'/')}`,'-S',path.replace(/\\/g,'/')],{encoding:'utf8',timeout:30000});
  const errorPath=join(dir,'vim-errors.txt');
  assert.equal(run.status,0,existsSync(errorPath)?readFileSync(errorPath,'utf8'):(existsSync(log)?readFileSync(log,'utf8'):run.stderr||run.error?.message||run.stdout));
}));

const emacs=process.env.KOKEDERA_EMACS_BIN??join(root,'.tools','emacs','bin','emacs.exe');
test('Emacs loads and byte-compiles every theme with exact core, Org and Magit faces',{skip:!existsSync(emacs)},()=>withFiles(dir=>{
  const plugin=join(dir,get('emacs').repo).replace(/\\/g,'/');
  let script=`(add-to-list 'load-path ${JSON.stringify(plugin)})\n(require 'kokedera-themes)\n(require 'ansi-color)\n`;
  for(const p of palettes) {
    script+=`(load-theme 'kokedera-${p.id} t)\n`;
    for(const [face,attribute,color] of [['default','background',p.terminal.background],['default','foreground',p.terminal.foreground],
      ['font-lock-keyword-face','foreground',p.syntax.keyword],['font-lock-string-face','foreground',p.syntax.string]]) {
      script+=`(unless (equal (face-attribute '${face} :${attribute} nil t) ${JSON.stringify(color)}) (error "Incorrect ${p.id} ${face} ${attribute}"))\n`;
    }
    // Optional package faces are retained in the theme even before those packages load.
    script+=`(unless (assq 'org-level-1 (mapcar (lambda (setting) (cons (nth 1 setting) setting)) (get 'kokedera-${p.id} 'theme-settings))) (error "Missing Org face"))\n`;
    script+=`(unless (assq 'magit-diff-added (mapcar (lambda (setting) (cons (nth 1 setting) setting)) (get 'kokedera-${p.id} 'theme-settings))) (error "Missing Magit face"))\n`;
    script+=`(unless (= (length ansi-color-names-vector) 8) (error "ANSI palette length"))\n`;
    script+=`(unless (eq frame-background-mode '${p.scheme}) (error "Incorrect frame appearance"))\n`;
    script+=`(unless (byte-compile-file ${JSON.stringify(`${plugin}/kokedera-${p.id}-theme.el`)}) (error "Byte compilation failed"))\n`;
    script+=`(disable-theme 'kokedera-${p.id})\n`;
  }
  const path=join(dir,'native-emacs.el');writeFileSync(path,script);
  const run=spawnSync(emacs,['--batch','-Q','--load',path],{encoding:'utf8',timeout:30000});
  assert.equal(run.status,0,run.stderr||run.error?.message||run.stdout);
}));
