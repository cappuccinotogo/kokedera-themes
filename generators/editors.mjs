// Native editor ports. All colors are generated from the shared Kokedera palettes.
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const lua = value => {
  if (Array.isArray(value)) return `{ ${value.map(lua).join(', ')} }`;
  if (value && typeof value === 'object') return `{ ${Object.entries(value).map(([k,v]) => `[${JSON.stringify(k)}] = ${lua(v)}`).join(', ')} }`;
  return JSON.stringify(value);
};
const toml = value => {
  if (Array.isArray(value)) return `[${value.map(toml).join(', ')}]`;
  if (value && typeof value === 'object') return `{ ${Object.entries(value).map(([k,v]) => `${k} = ${toml(v)}`).join(', ')} }`;
  return JSON.stringify(value);
};
const spec = (target,title,description,files,install,sources) => ({repo:`kokedera-theme-extension-${target}`,title,description,files,install,sources});
const variants = palettes => palettes.map(p => `\`${p.id}\``).join(', ');
const colors = p => ({...p.tokens,...p.syntax,...p.terminal});

function coreHighlights(p) {
  const c=colors(p), h={};
  const set=(names,style)=>names.split(' ').forEach(n=>{h[n]={...style};});
  set('Normal NormalNC', {fg:c.foreground,bg:c.background});
  set('NormalFloat Pmenu', {fg:c.foreground,bg:c.bgElevated});
  set('FloatBorder WinSeparator VertSplit', {fg:c.borderMain,bg:c.bgElevated});
  set('FloatTitle Title', {fg:c.accentLime,bold:true});
  set('Cursor lCursor', {fg:c.background,bg:c.cursor});
  set('CursorLine CursorColumn ColorColumn', {bg:c.bgSurface});
  set('Visual VisualNOS', {fg:c.selectionForeground,bg:c.selectionBackground});
  set('Search', {fg:c.foreground,bg:c.bgActive});
  set('IncSearch CurSearch', {fg:c.background,bg:c.lantern,bold:true});
  set('Substitute', {fg:c.background,bg:c.torii});
  set('MatchParen', {fg:c.lantern,bg:c.bgActive,bold:true});
  set('LineNr LineNrAbove LineNrBelow', {fg:c.textDim,bg:c.background});
  set('CursorLineNr', {fg:c.accentLime,bg:c.bgSurface,bold:true});
  set('SignColumn FoldColumn', {fg:c.textMuted,bg:c.background});
  set('Folded', {fg:c.textMuted,bg:c.bgSurface});
  set('NonText EndOfBuffer Whitespace SpecialKey', {fg:c.borderMain});
  set('Conceal', {fg:c.textMuted});
  set('StatusLine TabLineSel', {fg:c.foreground,bg:c.bgActive,bold:true});
  set('StatusLineNC TabLine TabLineFill WinBarNC', {fg:c.textMuted,bg:c.bgSurface});
  set('WinBar', {fg:c.foreground,bg:c.bgSurface});
  set('PmenuSel', {fg:c.foreground,bg:c.bgActive,bold:true});
  set('PmenuSbar', {bg:c.bgSurface});
  set('PmenuThumb', {bg:c.borderMain});
  set('PmenuMatch', {fg:c.accentLime,bold:true});
  set('PmenuMatchSel', {fg:c.accentLime,bg:c.bgActive,bold:true});
  set('WildMenu', {fg:c.background,bg:c.accentLime});
  set('Directory', {fg:c.bamboo});
  set('Question MoreMsg ModeMsg', {fg:c.accentLime});
  set('WarningMsg', {fg:c.bronze});
  set('Error ErrorMsg', {fg:c.torii});
  set('Comment', {fg:c.comment,italic:true});
  set('Constant', {fg:c.constant}); set('String Character', {fg:c.string});
  set('Number Float', {fg:c.number}); set('Boolean', {fg:c.boolean});
  set('Identifier', {fg:c.variable}); set('Function', {fg:c.function});
  set('Statement Conditional Repeat Label Keyword Exception', {fg:c.keyword});
  set('Operator Delimiter', {fg:c.operator});
  set('PreProc Include Define Macro PreCondit', {fg:c.keyword});
  set('Type StorageClass Structure Typedef', {fg:c.type});
  set('Special SpecialChar Tag Debug', {fg:c.property});
  set('SpecialComment', {fg:c.comment,bold:true});
  set('Underlined', {fg:c.stream,underline:true});
  set('Ignore', {fg:c.textDim}); set('Todo', {fg:c.lantern,bg:c.bgSurface,bold:true});
  set('DiffAdd', {fg:c.bamboo,bg:c.bgSurface});
  set('DiffChange', {fg:c.bronze,bg:c.bgSurface});
  set('DiffDelete', {fg:c.torii,bg:c.bgSurface});
  set('DiffText', {fg:c.foreground,bg:c.bgActive,bold:true});
  set('diffAdded', {fg:c.bamboo}); set('diffRemoved', {fg:c.torii});
  set('diffChanged', {fg:c.bronze});
  for(const [name,color] of Object.entries({Error:c.torii,Warn:c.bronze,Info:c.stream,Hint:c.sage,Ok:c.bamboo})) {
    set(`Diagnostic${name} DiagnosticSign${name} DiagnosticFloating${name}`, {fg:color});
    set(`DiagnosticVirtualText${name}`, {fg:color,bg:c.bgSurface});
    set(`DiagnosticUnderline${name}`, {sp:color,undercurl:true});
  }
  set('DiagnosticUnnecessary', {fg:c.comment,italic:true});
  set('DiagnosticDeprecated', {strikethrough:true});
  set('SpellBad', {sp:c.torii,undercurl:true}); set('SpellCap', {sp:c.bronze,undercurl:true});
  set('SpellLocal', {sp:c.stream,undercurl:true}); set('SpellRare', {sp:c.wisteria,undercurl:true});
  set('LspReferenceText LspReferenceRead LspReferenceWrite', {bg:c.bgActive});
  set('LspInlayHint', {fg:c.textMuted,bg:c.bgSurface});
  set('LspCodeLens', {fg:c.textMuted,italic:true});
  set('LspSignatureActiveParameter', {fg:c.parameter,bold:true,underline:true});
  return h;
}

function neovim(palettes) {
  const files={};
  const captures={
    'variable':'Identifier','variable.builtin':'Keyword','variable.parameter':'KokederaParameter','variable.member':'KokederaProperty',
    'constant':'Constant','constant.builtin':'Constant','constant.macro':'Macro','module':'Type','module.builtin':'Type',
    'label':'Label','string':'String','string.documentation':'String','string.regexp':'KokederaRegexp','string.escape':'SpecialChar',
    'string.special':'Special','string.special.url':'Underlined','character':'Character','character.special':'SpecialChar',
    'boolean':'Boolean','number':'Number','number.float':'Float','type':'Type','type.builtin':'Type','type.definition':'Typedef',
    'type.qualifier':'Keyword','attribute':'KokederaProperty','property':'KokederaProperty','function':'Function','function.builtin':'Function',
    'function.call':'Function','function.macro':'Macro','function.method':'Function','function.method.call':'Function','constructor':'Type',
    'operator':'Operator','keyword':'Keyword','keyword.function':'Keyword','keyword.operator':'Operator','keyword.import':'Include',
    'keyword.type':'Type','keyword.return':'Keyword','keyword.conditional':'Conditional','keyword.repeat':'Repeat','keyword.exception':'Exception',
    'punctuation':'Delimiter','punctuation.delimiter':'Delimiter','punctuation.bracket':'Delimiter','punctuation.special':'Special',
    'comment':'Comment','comment.documentation':'Comment','comment.todo':'Todo','comment.note':'DiagnosticInfo',
    'comment.warning':'DiagnosticWarn','comment.error':'DiagnosticError','markup.heading':'Title','markup.raw':'String',
    'markup.link':'Underlined','markup.link.url':'Underlined','markup.link.label':'String','markup.list':'Special',
    'markup.quote':'Comment','markup.math':'Number','markup.environment':'Type','tag':'Tag','tag.attribute':'KokederaProperty',
    'tag.delimiter':'Delimiter','diff.plus':'diffAdded','diff.minus':'diffRemoved','diff.delta':'diffChanged'
  };
  const links={
    TelescopeNormal:'NormalFloat',TelescopeBorder:'FloatBorder',TelescopePromptNormal:'NormalFloat',TelescopePromptBorder:'FloatBorder',
    TelescopeTitle:'Title',TelescopeSelection:'PmenuSel',TelescopeSelectionCaret:'Keyword',TelescopeMatching:'PmenuMatch',
    NvimTreeNormal:'NormalFloat',NvimTreeNormalNC:'NormalFloat',NvimTreeFolderName:'Directory',NvimTreeOpenedFolderName:'Directory',
    NvimTreeRootFolder:'Title',NvimTreeIndentMarker:'NonText',NvimTreeGitDirty:'diffChanged',NvimTreeGitNew:'diffAdded',
    NeoTreeNormal:'NormalFloat',NeoTreeNormalNC:'NormalFloat',NeoTreeDirectoryName:'Directory',NeoTreeRootName:'Title',
    NeoTreeGitAdded:'diffAdded',NeoTreeGitModified:'diffChanged',NeoTreeGitDeleted:'diffRemoved',NeoTreeIndentMarker:'NonText',
    GitSignsAdd:'diffAdded',GitSignsChange:'diffChanged',GitSignsDelete:'diffRemoved',GitSignsCurrentLineBlame:'Comment',
    WhichKey:'Keyword',WhichKeyGroup:'Type',WhichKeyDesc:'Normal',WhichKeySeparator:'Comment',WhichKeyFloat:'NormalFloat',
    LazyNormal:'NormalFloat',LazyH1:'Title',LazySpecial:'Keyword',MasonNormal:'NormalFloat',MasonHeader:'Title',
    CmpItemAbbr:'Normal',CmpItemAbbrMatch:'PmenuMatch',CmpItemAbbrMatchFuzzy:'PmenuMatch',CmpItemAbbrDeprecated:'DiagnosticDeprecated',
    CmpItemKindFunction:'Function',CmpItemKindMethod:'Function',CmpItemKindVariable:'Identifier',CmpItemKindClass:'Type',
    CmpItemKindKeyword:'Keyword',CmpItemKindText:'String',CmpItemMenu:'Comment',BlinkCmpMenu:'Pmenu',BlinkCmpMenuSelection:'PmenuSel',
    BlinkCmpLabelMatch:'PmenuMatch',BlinkCmpDoc:'NormalFloat',BlinkCmpDocBorder:'FloatBorder',IblIndent:'NonText',IblScope:'Comment'
  };
  for(const p of palettes) {
    const h=coreHighlights(p), c=colors(p);
    h.KokederaParameter={fg:c.parameter}; h.KokederaProperty={fg:c.property}; h.KokederaRegexp={fg:c.regexp};
    for(const [capture,target] of Object.entries(captures)) h[`@${capture}`]={link:target};
    for(const [group,target] of Object.entries(links)) h[group]={link:target};
    h['@markup.strong']={bold:true};h['@markup.italic']={italic:true};h['@markup.strikethrough']={strikethrough:true};
    for(const [semantic,target] of Object.entries({class:'Type',enum:'Type',interface:'Type',struct:'Structure',type:'Type',typeParameter:'Type',
      namespace:'Type',parameter:'KokederaParameter',property:'KokederaProperty',variable:'Identifier',function:'Function',method:'Function',
      enumMember:'Constant',keyword:'Keyword',string:'String',number:'Number',operator:'Operator',comment:'Comment',decorator:'Special'})) h[`@lsp.type.${semantic}`]={link:target};
    h['@lsp.mod.deprecated']={strikethrough:true}; h['@lsp.mod.readonly']={fg:c.constant};
    files[`lua/kokedera/palettes/${p.id}.lua`]=`-- Generated Kokedera ${p.name}.\nreturn ${lua({scheme:p.scheme,terminal:p.terminal.ansi,colors:c,highlights:h})}\n`;
    files[`colors/kokedera-${p.id}.lua`]=`require('kokedera').load('${p.id}')\n`;
  }
  files['colors/kokedera.lua']="require('kokedera').load()\n";
  files['lua/kokedera/init.lua']=`local M = {}
local options = { variant = 'dusk', transparent = false, terminal_colors = true, overrides = {} }
local valid = ${lua(Object.fromEntries(palettes.map(p=>[p.id,true])))}

function M.setup(opts)
  options = vim.tbl_deep_extend('force', options, opts or {})
  assert(valid[options.variant], 'Kokedera: unknown variant ' .. tostring(options.variant))
end

function M.palette(variant)
  variant = variant or vim.g.kokedera_variant or options.variant
  assert(valid[variant], 'Kokedera: unknown variant ' .. tostring(variant))
  return vim.deepcopy(require('kokedera.palettes.' .. variant))
end

function M.load(variant)
  variant = variant or vim.g.kokedera_variant or options.variant
  local p = M.palette(variant)
  vim.o.termguicolors = true
  vim.o.background = p.scheme
  vim.cmd('highlight clear')
  if vim.fn.exists('syntax_on') == 1 then vim.cmd('syntax reset') end
  vim.g.colors_name = 'kokedera-' .. variant
  if options.transparent then
    for _, group in ipairs({ 'Normal', 'NormalNC', 'SignColumn', 'LineNr', 'EndOfBuffer' }) do
      p.highlights[group].bg = 'NONE'
    end
  end
  for group, attributes in pairs(options.overrides) do p.highlights[group] = attributes end
  for group, attributes in pairs(p.highlights) do vim.api.nvim_set_hl(0, group, attributes) end
  if options.terminal_colors then
    for index, color in ipairs(p.terminal) do vim.g['terminal_color_' .. (index - 1)] = color end
  end
  M.current = variant
end

return M
`;
  files['lua/lualine/themes/kokedera.lua']=`local k = require('kokedera')
local c = k.palette(k.current).colors
local function mode(accent)
  return { a = { fg = c.background, bg = accent, gui = 'bold' },
    b = { fg = c.foreground, bg = c.bgActive }, c = { fg = c.textMuted, bg = c.bgSurface } }
end
return { normal = mode(c.bamboo), insert = mode(c.stream), visual = mode(c.wisteria),
  replace = mode(c.torii), command = mode(c.lantern), inactive = mode(c.textMuted) }
`;
  return spec('neovim','Kokedera for Neovim','Nine moss temple palettes for Neovim, Treesitter, LSP, completion and popular plugins.',files,
`Requires Neovim 0.9 or newer and a true-color terminal. The theme lives in the \`ports/kokedera-theme-extension-neovim\` folder of [kokedera-themes](https://github.com/cappuccinotogo/kokedera-themes). Copy that folder to \`stdpath('data')/site/pack/themes/start/kokedera\`, or let your plugin manager clone the repository and add the folder to the runtime path. With lazy.nvim:

\`\`\`lua
{
  'cappuccinotogo/kokedera-themes',
  lazy = false,
  priority = 1000,
  config = function(plugin)
    vim.opt.rtp:append(plugin.dir .. '/ports/kokedera-theme-extension-neovim')
    require('kokedera').setup({ variant = 'dusk' })
    vim.cmd.colorscheme('kokedera')
  end,
}
\`\`\`

Without a plugin manager, add to \`init.lua\`:

\`\`\`lua
require('kokedera').setup({ variant = 'dusk' })
vim.cmd.colorscheme('kokedera')
\`\`\`

Choose any of ${variants(palettes)}. Switch at runtime with \`:colorscheme kokedera-morning\`. The setup call configures the theme; the colorscheme command applies it. Optional setup keys: \`transparent = true\`, \`terminal_colors = false\`, and \`overrides = { Comment = { fg = '#94aa87', italic = false } }\`.

For lualine, use \`options = { theme = 'kokedera' }\` after loading the colorscheme. The theme includes core UI, diagnostics, Treesitter/LSP, Telescope, nvim-tree, Neo-tree, gitsigns, WhichKey, Lazy, Mason, nvim-cmp and blink.cmp highlights. Plugins are optional and are not installed by this package.`,
['https://neovim.io/doc/user/api.html#nvim_set_hl()','https://neovim.io/doc/user/treesitter.html','https://neovim.io/doc/user/lsp.html']);
}

function helix(palettes) {
  const files={};
  for(const p of palettes) {
    const c=colors(p), h={};
    const set=(names,value)=>names.split(' ').forEach(n=>h[n]=value);
    set('attribute variable.other.member',c.property);set('type type.builtin type.parameter type.enum namespace constructor',c.type);
    set('type.enum.variant constant constant.builtin',c.constant);set('constant.builtin.boolean',c.boolean);
    set('constant.numeric constant.numeric.integer constant.numeric.float',c.number);
    set('constant.character string string.special string.special.path',c.string);
    set('string.regexp',c.regexp);set('constant.character.escape punctuation.special',c.property);
    set('string.special.url',{fg:c.stream,underline:{style:'line'}});
    set('comment comment.line comment.block',{fg:c.comment,modifiers:['italic']});
    set('comment.line.documentation comment.block.documentation',{fg:c.comment,modifiers:['italic']});
    set('variable',c.variable);set('variable.builtin',c.keyword);set('variable.parameter',c.parameter);
    set('label',c.property);set('punctuation punctuation.delimiter punctuation.bracket operator keyword.operator',c.operator);
    set('keyword keyword.control keyword.control.conditional keyword.control.repeat keyword.control.import keyword.control.return keyword.control.exception keyword.directive keyword.function keyword.storage',c.keyword);
    set('function function.builtin function.method function.macro function.special',c.function);
    set('tag tag.builtin special',c.property);
    set('markup.heading markup.heading.marker',{fg:c.bamboo,modifiers:['bold']});
    for(let i=1;i<=6;i++) h[`markup.heading.${i}`]={fg:[c.bamboo,c.lantern,c.stream,c.wisteria,c.bronze,c.sage][i-1],modifiers:['bold']};
    set('markup.list markup.list.unnumbered markup.list.numbered',c.property);set('markup.list.checked',c.bamboo);set('markup.list.unchecked',c.textMuted);
    set('markup.bold',{modifiers:['bold']});set('markup.italic',{modifiers:['italic']});set('markup.strikethrough',{modifiers:['crossed_out']});
    set('markup.link.url',{fg:c.stream,underline:{style:'line'}});set('markup.link.label markup.link.text',c.lantern);
    set('markup.quote',{fg:c.comment,modifiers:['italic']});set('markup.raw markup.raw.inline markup.raw.block',c.string);
    set('diff.plus diff.plus.gutter',c.bamboo);set('diff.minus diff.minus.gutter',c.torii);set('diff.delta diff.delta.gutter',c.bronze);set('diff.delta.moved',c.stream);set('diff.delta.conflict',c.wisteria);
    set('ui.background',{bg:c.background,fg:c.foreground});set('ui.background.separator ui.window',{fg:c.borderMain});
    set('ui.cursor ui.cursor.primary ui.cursor.normal ui.cursor.primary.normal',{fg:c.background,bg:c.cursor});
    set('ui.cursor.insert ui.cursor.primary.insert',{fg:c.background,bg:c.stream});
    set('ui.cursor.select ui.cursor.primary.select',{fg:c.background,bg:c.wisteria});
    set('ui.cursor.match',{fg:c.lantern,bg:c.bgActive,modifiers:['bold']});
    set('ui.debug.breakpoint',c.torii);set('ui.debug.active',c.lantern);
    set('ui.gutter',{bg:c.background});set('ui.gutter.selected',{bg:c.bgSurface});
    set('ui.linenr',{fg:c.textDim});set('ui.linenr.selected',{fg:c.accentLime,modifiers:['bold']});
    set('ui.statusline',{fg:c.foreground,bg:c.bgActive});set('ui.statusline.inactive',{fg:c.textMuted,bg:c.bgSurface});
    for(const [mode,accent] of Object.entries({normal:c.bamboo,insert:c.stream,select:c.wisteria})) set(`ui.statusline.${mode}`,{fg:c.background,bg:accent,modifiers:['bold']});
    set('ui.statusline.separator',c.borderMain);set('ui.bufferline',{fg:c.textMuted,bg:c.bgSurface});
    set('ui.bufferline.active',{fg:c.foreground,bg:c.bgActive,modifiers:['bold']});set('ui.bufferline.background',{bg:c.bgSurface});
    set('ui.popup ui.popup.info ui.help ui.menu',{fg:c.foreground,bg:c.bgElevated});
    set('ui.picker.header',{fg:c.textMuted,bg:c.bgSurface});set('ui.picker.header.column',c.textMuted);
    set('ui.picker.header.column.active',{fg:c.accentLime,modifiers:['bold']});
    set('ui.text ui.text.info',c.foreground);set('ui.text.focus',{fg:c.accentLime,modifiers:['bold']});
    set('ui.text.inactive',c.textMuted);set('ui.text.directory',c.bamboo);
    set('ui.virtual.ruler ui.virtual.whitespace ui.virtual.indent-guide',c.borderSubtle);
    set('ui.virtual.inlay-hint ui.virtual.inlay-hint.parameter ui.virtual.inlay-hint.type',{fg:c.textMuted,bg:c.bgSurface});
    set('ui.virtual.wrap',c.textDim);set('ui.virtual.jump-label',{fg:c.torii,modifiers:['bold']});
    set('ui.menu.selected',{fg:c.foreground,bg:c.bgActive,modifiers:['bold']});set('ui.menu.scroll',{fg:c.borderMain,bg:c.bgSurface});
    set('ui.selection ui.selection.primary',{bg:c.selectionBackground});
    set('ui.highlight ui.cursorline.primary ui.cursorline.secondary ui.cursorcolumn.primary ui.cursorcolumn.secondary',{bg:c.bgSurface});
    set('ui.highlight.frameline',{bg:c.bgActive});set('tabstop',{bg:c.bgActive});
    for(const [level,color] of Object.entries({error:c.torii,warning:c.bronze,info:c.stream,hint:c.sage})) {h[level]=color;h[`diagnostic.${level}`]={underline:{color,style:'curl'}};}
    h.diagnostic={underline:{color:c.bronze,style:'curl'}};h['diagnostic.unnecessary']={fg:c.comment,modifiers:['italic']};
    h['diagnostic.deprecated']={modifiers:['crossed_out']};
    files[`themes/kokedera_${p.id}.toml`]=`# Kokedera ${p.name} - ${p.scheme}\n${Object.entries(h).map(([key,value])=>`${JSON.stringify(key)} = ${toml(value)}`).join('\n')}\n`;
  }
  return spec('helix','Kokedera for Helix','Nine Kokedera palettes with native Helix syntax, UI, diagnostic and markup scopes.',files,
`Copy the files from \`themes/\` to \`~/.config/helix/themes/\` (Windows: \`%AppData%\\helix\\themes\\\`). Create that folder if needed. Set the following at the top of Helix's \`config.toml\`:

\`\`\`toml
theme = "kokedera_dusk"
\`\`\`

Use \`:theme kokedera_morning\` to switch immediately. Available suffixes: ${variants(palettes)}. A true-color terminal is recommended; when terminal detection needs help, set \`true-color = true\` under \`[editor]\`. Optional \`color-modes = true\` enables the insert/select status-line accents.`,
['https://docs.helix-editor.com/themes.html','https://docs.helix-editor.com/configuration.html']);
}

function sublime(palettes) {
  const files={};
  for(const p of palettes) {
    const c=colors(p);
    const rules=(p.textmate??[]).filter(r=>r.scope&&r.settings).map(r=>({
      ...(r.name?{name:r.name}:{}),scope:Array.isArray(r.scope)?r.scope.join(', '):r.scope,
      ...(r.settings.foreground?{foreground:r.settings.foreground}:{}),...(r.settings.background?{background:r.settings.background}:{}),
      ...(r.settings.fontStyle!==undefined?{font_style:r.settings.fontStyle.split(/\s+/).filter(s=>['bold','italic','underline','glow','stippled_underline','squiggly_underline'].includes(s)).join(' ')}:{}),
    }));
    // Broad native fallbacks precede the precise existing TextMate rules.
    const base=[['comment',c.comment,'italic'],['string',c.string],['constant.numeric',c.number],['constant.language',c.boolean],
      ['keyword, storage',c.keyword],['variable',c.variable],['variable.parameter',c.parameter],['entity.name.function, support.function',c.function],
      ['entity.name.type, support.type, support.class',c.type],['entity.other.attribute-name',c.property],['keyword.operator, punctuation',c.operator],
      ['string.regexp',c.regexp],['markup.heading',c.bamboo,'bold'],['markup.bold',c.foreground,'bold'],['markup.italic',c.foreground,'italic'],
      ['markup.inserted',c.bamboo],['markup.deleted',c.torii],['markup.changed',c.bronze],['invalid',c.torii]]
      .map(([scope,foreground,font_style])=>({scope,foreground,...(font_style?{font_style}:{})}));
    files[`Kokedera ${p.name}.sublime-color-scheme`]=json({name:`Kokedera ${p.name}`,author:'Kokedera',
      globals:{background:c.background,foreground:c.foreground,caret:c.cursor,accent:c.accentLime,selection:c.selectionBackground,
        selection_foreground:c.selectionForeground,inactive_selection:c.bgSurface,line_highlight:c.bgSurface,gutter:c.background,gutter_foreground:c.textDim,
        guide:c.borderSubtle,active_guide:c.borderMain,stack_guide:c.borderMain,find_highlight:c.bgActive,find_highlight_foreground:c.foreground,
        brackets_foreground:c.lantern,bracket_contents_foreground:c.lantern,tags_foreground:c.accentLime,misspelling:c.torii,
        shadow:c.bgOverlay,shadow_width:0,line_diff_added:c.bamboo,line_diff_modified:c.bronze,line_diff_deleted:c.torii},rules:[...base,...rules]});
    const fill=(className,color,extra={})=>({'class':className,'layer0.tint':color,'layer0.opacity':1,...extra});
    const ui=[
      fill('window',c.background),fill('sidebar_container',c.bgSurface),fill('sidebar_tree',c.bgSurface),
      {'class':'sidebar_heading',fg:c.accentLime},
      {'class':'sidebar_label',fg:c.textMuted},{'class':'sidebar_label',parents:[{'class':'tree_row',attributes:['selected']}],fg:c.foreground},
      fill('tree_row',c.bgActive,{attributes:['selected']}),fill('tabset_control',c.bgSurface),fill('tab_control',c.bgSurface),
      fill('tab_control',c.background,{attributes:['selected']}),{'class':'tab_label',fg:c.textMuted},
      {'class':'tab_label',parents:[{'class':'tab_control',attributes:['selected']}],fg:c.foreground},
      fill('status_bar',c.bgSurface),{'class':'label_control',parents:[{'class':'status_bar'}],fg:c.textMuted},
      fill('panel_control',c.bgElevated),fill('overlay_control',c.bgElevated),fill('quick_panel',c.bgElevated),
      fill('quick_panel_row',c.bgActive,{attributes:['selected']}),fill('mini_quick_panel_row',c.bgActive,{attributes:['selected']}),
      {'class':'quick_panel_label',fg:c.foreground,'match_fg':c.accentLime,'selected_fg':c.foreground,'selected_match_fg':c.accentLime},
      {'class':'quick_panel_path_label',fg:c.textMuted,'match_fg':c.accentLime,'selected_fg':c.textMuted,'selected_match_fg':c.accentLime},
      fill('scroll_bar',c.bgSurface),fill('puck_control',c.borderMain),fill('auto_complete',c.bgElevated),
      {'class':'auto_complete_label',fg:c.foreground,'match_fg':c.accentLime,'selected_fg':c.foreground,'selected_match_fg':c.accentLime},
      {'class':'input_area','layer0.tint':c.background,'layer0.opacity':1}
    ];
    files[`Kokedera ${p.name}.sublime-theme`]=json({extends:'Adaptive.sublime-theme',rules:ui});
  }
  files['Kokedera.sublime-commands']=json(palettes.map(p=>({caption:`Kokedera: ${p.name}`,command:'kokedera_select',args:{variant:p.name}})));
  files['kokedera.py']=`"""Apply the matching Kokedera editor and interface palette."""
import sublime
import sublime_plugin

VARIANTS = ${JSON.stringify(palettes.map(p=>p.name))}

class KokederaSelectCommand(sublime_plugin.ApplicationCommand):
    def run(self, variant="Dusk"):
        if variant not in VARIANTS:
            raise ValueError("Unknown Kokedera variant: " + variant)
        settings = sublime.load_settings("Preferences.sublime-settings")
        settings.set("color_scheme", "Kokedera " + variant + ".sublime-color-scheme")
        settings.set("theme", "Kokedera " + variant + ".sublime-theme")
        sublime.save_settings("Preferences.sublime-settings")
`;
  return spec('sublime','Kokedera for Sublime Text','Nine native Sublime Text 4 color schemes with matching sidebar, tab and panel themes.',files,
`Requires Sublime Text 4. Choose **Preferences → Browse Packages**, create a \`Kokedera\` folder there, and copy the files of this folder into it. Open the Command Palette and choose **Kokedera: Dusk**, or any other variant. This applies both the code colors and matching UI theme.

Manual settings are also supported:

\`\`\`json
{
  "color_scheme": "Kokedera Dusk.sublime-color-scheme",
  "theme": "Kokedera Dusk.sublime-theme"
}
\`\`\`

The UI themes inherit Sublime's built-in Adaptive theme and keep its native controls and icons. No third-party theme dependency is required.`,
['https://www.sublimetext.com/docs/color_schemes.html','https://www.sublimetext.com/docs/themes.html','https://www.sublimetext.com/docs/api_reference.html']);
}

function emacs(palettes) {
  const files={};
  const elisp=v=>typeof v==='boolean'?(v?'t':'nil'):typeof v==='string'?JSON.stringify(v):String(v);
  for(const p of palettes) {
    const c=colors(p), faces={};
    const set=(names,attrs)=>names.split(' ').forEach(n=>faces[n]=attrs);
    set('default', {foreground:c.foreground,background:c.background});set('cursor',{background:c.cursor});
    set('fringe',{foreground:c.textMuted,background:c.background});set('region',{foreground:c.selectionForeground,background:c.selectionBackground});
    set('highlight hl-line',{background:c.bgSurface});set('secondary-selection lazy-highlight',{background:c.bgActive});
    set('isearch',{foreground:c.background,background:c.lantern});set('isearch-fail',{foreground:c.torii,background:c.bgSurface});
    set('minibuffer-prompt',{foreground:c.accentLime,weight:'bold'});set('vertical-border',{foreground:c.borderMain});
    set('window-divider window-divider-first-pixel window-divider-last-pixel',{foreground:c.borderMain});
    set('line-number',{foreground:c.textDim,background:c.background});set('line-number-current-line',{foreground:c.accentLime,background:c.bgSurface,weight:'bold'});
    set('mode-line',{foreground:c.foreground,background:c.bgActive,box:false});
    set('mode-line-inactive',{foreground:c.textMuted,background:c.bgSurface,box:false});set('mode-line-buffer-id',{weight:'bold'});
    set('header-line tab-bar',{foreground:c.foreground,background:c.bgSurface,box:false});
    set('tab-bar-tab tab-line-tab-current',{foreground:c.foreground,background:c.bgActive,box:false,weight:'bold'});
    set('tab-bar-tab-inactive tab-line-tab-inactive',{foreground:c.textMuted,background:c.bgSurface,box:false});
    set('link',{foreground:c.stream,underline:true});set('link-visited',{foreground:c.wisteria,underline:true});set('shadow',{foreground:c.textMuted});
    set('success',{foreground:c.bamboo});set('warning',{foreground:c.bronze});set('error',{foreground:c.torii});
    set('font-lock-comment-face font-lock-comment-delimiter-face',{foreground:c.comment,slant:'italic'});
    set('font-lock-doc-face font-lock-doc-markup-face',{foreground:c.sage});set('font-lock-string-face',{foreground:c.string});
    set('font-lock-keyword-face font-lock-preprocessor-face',{foreground:c.keyword});set('font-lock-builtin-face',{foreground:c.function});
    set('font-lock-function-name-face font-lock-function-call-face',{foreground:c.function});
    set('font-lock-variable-name-face font-lock-variable-use-face',{foreground:c.variable});set('font-lock-property-name-face font-lock-property-use-face',{foreground:c.property});
    set('font-lock-type-face',{foreground:c.type});set('font-lock-constant-face',{foreground:c.constant});
    set('font-lock-number-face',{foreground:c.number});set('font-lock-operator-face font-lock-punctuation-face font-lock-bracket-face',{foreground:c.operator});
    set('font-lock-regexp-grouping-backslash font-lock-regexp-grouping-construct',{foreground:c.regexp});
    set('font-lock-warning-face',{foreground:c.torii,weight:'bold'});set('show-paren-match',{foreground:c.lantern,background:c.bgActive,weight:'bold'});
    set('show-paren-mismatch trailing-whitespace',{background:c.torii});
    set('completions-common-part orderless-match-face-0 orderless-match-face-1',{foreground:c.accentLime,weight:'bold'});
    set('completions-first-difference',{foreground:c.lantern});set('vertico-current selectrum-current-candidate',{background:c.bgActive});
    set('corfu-default company-tooltip',{foreground:c.foreground,background:c.bgElevated});
    set('corfu-current company-tooltip-selection',{foreground:c.foreground,background:c.bgActive});
    set('company-tooltip-common',{foreground:c.accentLime,weight:'bold'});set('company-tooltip-annotation',{foreground:c.textMuted});
    set('company-preview-common',{foreground:c.textMuted});
    set('diff-added magit-diff-added',{foreground:c.bamboo,background:c.bgSurface});
    set('diff-removed magit-diff-removed',{foreground:c.torii,background:c.bgSurface});
    set('diff-changed',{foreground:c.bronze,background:c.bgSurface});
    set('diff-refine-added magit-diff-added-highlight',{foreground:c.bamboo,background:c.bgActive});
    set('diff-refine-removed magit-diff-removed-highlight',{foreground:c.torii,background:c.bgActive});
    set('diff-context magit-diff-context',{foreground:c.textMuted});set('magit-diff-context-highlight',{foreground:c.foreground,background:c.bgSurface});
    set('diff-header diff-file-header magit-diff-file-heading magit-section-heading',{foreground:c.lantern,weight:'bold'});
    set('magit-section-highlight',{background:c.bgSurface});set('magit-branch-local',{foreground:c.bamboo,weight:'bold'});
    set('magit-branch-remote',{foreground:c.stream});set('magit-hash',{foreground:c.textMuted});set('magit-tag',{foreground:c.bronze});
    set('org-document-title',{foreground:c.bamboo,weight:'bold',height:1.3});
    for(let i=1;i<=8;i++) set(`org-level-${i}`,{foreground:[c.bamboo,c.lantern,c.stream,c.wisteria,c.bronze,c.sage,c.property,c.constant][i-1],weight:'bold'});
    set('org-block org-block-begin-line org-block-end-line',{foreground:c.textMuted,background:c.bgSurface});
    set('org-code org-verbatim',{foreground:c.string});set('org-table',{foreground:c.stream});set('org-link',{foreground:c.stream,underline:true});
    set('org-quote',{foreground:c.comment,slant:'italic'});set('org-date',{foreground:c.property});set('org-todo',{foreground:c.torii,weight:'bold'});
    set('org-done',{foreground:c.bamboo,weight:'bold'});set('org-headline-done',{foreground:c.textMuted});
    set('org-checkbox',{foreground:c.lantern});set('org-special-keyword org-meta-line',{foreground:c.comment});
    set('dired-directory',{foreground:c.bamboo,weight:'bold'});set('dired-symlink',{foreground:c.stream});set('dired-marked',{foreground:c.lantern,weight:'bold'});
    set('dired-flagged',{foreground:c.torii});set('dired-header',{foreground:c.lantern,weight:'bold'});
    for(const [level,col] of Object.entries({error:c.torii,warning:c.bronze,note:c.stream})) {
      set(`flycheck-${level} flymake-${level==='note'?'note':level}`,{underline:{color:col,style:'wave'}});
    }
    const faceValue=(key,value)=> typeof value==='object'?`(${Object.entries(value).map(([k,v])=>`:${k} ${['style'].includes(k)?v:elisp(v)}`).join(' ')})`:
      ['weight','slant'].includes(key)?value:elisp(value);
    const name=`kokedera-${p.id}`;
    files[`${name}-theme.el`]=`;;; ${name}-theme.el --- Kokedera ${p.name} -*- lexical-binding: t; -*-\n;; Author: Kokedera\n;; URL: https://kokedera.style\n;; Package-Requires: ((emacs "27.1"))\n;; Version: 1.0.0\n\n(deftheme ${name} "Kokedera ${p.name}: a ${p.scheme} moss temple palette.")\n\n(custom-theme-set-faces\n '${name}\n${Object.entries(faces).map(([face,attrs])=>` '(${face} ((t (${Object.entries(attrs).map(([k,v])=>`:${k} ${faceValue(k,v)}`).join(' ')}))))`).join('\n')})\n\n(custom-theme-set-variables\n '${name}\n '(frame-background-mode '${p.scheme})\n '(ansi-color-names-vector [${p.terminal.ansi.slice(0,8).map(elisp).join(' ')}]))\n\n(provide-theme '${name})\n;;; ${name}-theme.el ends here\n`;
  }
  files['kokedera-themes.el']=`;;; kokedera-themes.el --- Kokedera theme discovery -*- lexical-binding: t; -*-
;; Package-Requires: ((emacs "27.1"))
;; Version: 1.0.0
;; Author: Kokedera
;; URL: https://kokedera.style

;;;###autoload
(when load-file-name
  (add-to-list 'custom-theme-load-path
               (file-name-as-directory (file-name-directory load-file-name))))

(provide 'kokedera-themes)
;;; kokedera-themes.el ends here
`;
  return spec('emacs','Kokedera for Emacs','Nine Emacs themes with core UI, Org, Magit, diagnostics and completion faces.',files,
`Requires Emacs 27.1 or newer. Copy the \`*-theme.el\` files to \`~/.emacs.d/themes/\`, then add to your init file:

\`\`\`elisp
(add-to-list 'custom-theme-load-path (expand-file-name "themes" user-emacs-directory))
(load-theme 'kokedera-dusk t)
\`\`\`

Alternatively add this folder to \`load-path\` and \`(require 'kokedera-themes)\` before loading the theme. Available names: ${palettes.map(p=>`\`kokedera-${p.id}\``).join(', ')}.

Use \`M-x disable-theme\` before changing variants so earlier theme faces do not stack. Themes style Org, Magit, Dired, Flycheck/Flymake, Vertico, Corfu, company and standard font-lock faces without requiring those optional packages. GUI Emacs or a true-color terminal gives the closest palette.`,
['https://www.gnu.org/software/emacs/manual/html_node/emacs/Custom-Themes.html','https://www.gnu.org/software/emacs/manual/html_node/elisp/Custom-Themes.html']);
}

function xcode(palettes) {
  const files={};
  const rgba=hex=>`${hex.slice(1).match(/../g).map(v=>(parseInt(v,16)/255).toFixed(6)).join(' ')} 1`;
  const plist=value=>{
    if (Number.isInteger(value)) return `<integer>${value}</integer>`;
    if (typeof value==='number') return `<real>${value}</real>`;
    if (typeof value==='boolean') return value?'<true/>':'<false/>';
    if(value&&typeof value==='object')return `<dict>\n${Object.entries(value).map(([k,v])=>`<key>${xml(k)}</key>\n${plist(v)}`).join('\n')}\n</dict>`;
    return `<string>${xml(value)}</string>`;
  };
  for(const p of palettes) {
    const c=colors(p), syntax={};
    const mapping={plain:c.foreground,comment:c.comment,'comment.doc':c.comment,'comment.doc.keyword':c.property,
      keyword:c.keyword,number:c.number,string:c.string,character:c.string,url:c.stream,attribute:c.property,
      'preprocessor':c.keyword,'identifier.class':c.type,'identifier.class.system':c.type,'identifier.constant':c.constant,
      'identifier.constant.system':c.constant,'identifier.function':c.function,'identifier.function.system':c.function,
      'identifier.macro':c.keyword,'identifier.macro.system':c.keyword,'identifier.type':c.type,'identifier.type.system':c.type,
      'identifier.variable':c.variable,'identifier.variable.system':c.property,'identifier.instanceVariable':c.property,
      'identifier.instanceVariable.system':c.property,'mark':c.lantern};
    for(const [key,color] of Object.entries(mapping)) syntax[`xcode.syntax.${key}`]=rgba(color);
    const theme={DVTFontAndColorVersion:1,DVTLineSpacing:1.1,DVTSourceTextBackground:rgba(c.background),
      DVTSourceTextSelectionColor:rgba(c.selectionBackground),DVTSourceTextInsertionPointColor:rgba(c.cursor),
      DVTSourceTextCurrentLineHighlightColor:rgba(c.bgSurface),DVTSourceTextInvisiblesColor:rgba(c.borderMain),
      DVTSourceTextBlockDimBackgroundColor:rgba(c.bgSurface),DVTSourceTextSyntaxColors:syntax,
      DVTSourceTextSyntaxFonts:Object.fromEntries(Object.keys(syntax).map(k=>[k,`${k.includes('comment')?'Menlo-Italic':'Menlo-Regular'} - 13.0`])),
      DVTConsoleTextBackgroundColor:rgba(c.background),DVTConsoleTextSelectionColor:rgba(c.selectionBackground),
      DVTConsoleTextInsertionPointColor:rgba(c.cursor),DVTConsoleDebuggerInputTextColor:rgba(c.foreground),
      DVTConsoleDebuggerOutputTextColor:rgba(c.foreground),DVTConsoleDebuggerPromptTextColor:rgba(c.accentLime),
      DVTConsoleExecutableInputTextColor:rgba(c.foreground),DVTConsoleExecutableOutputTextColor:rgba(c.foreground),
      DVTScrollbarMarkerErrorColor:rgba(c.torii),DVTScrollbarMarkerWarningColor:rgba(c.bronze),DVTScrollbarMarkerAnalyzerColor:rgba(c.stream),
      DVTScrollbarMarkerBreakpointColor:rgba(c.stream),DVTScrollbarMarkerDiffColor:rgba(c.bronze),DVTScrollbarMarkerDiffConflictColor:rgba(c.torii),
      DVTMarkupTextBackgroundColor:rgba(c.bgSurface),DVTMarkupTextBorderColor:rgba(c.borderMain),DVTMarkupTextNormalColor:rgba(c.foreground),
      DVTMarkupTextInlineCodeColor:rgba(c.string),DVTMarkupTextLinkColor:rgba(c.stream),DVTMarkupTextEmphasisColor:rgba(c.foreground),
      DVTMarkupTextStrongColor:rgba(c.foreground),DVTMarkupTextPrimaryHeadingColor:rgba(c.bamboo),
      DVTMarkupTextSecondaryHeadingColor:rgba(c.lantern),DVTMarkupTextOtherHeadingColor:rgba(c.sage)};
    for(const role of ['DebuggerInput','DebuggerOutput','DebuggerPrompt','ExecutableInput','ExecutableOutput']) theme[`DVTConsole${role}TextFont`]='Menlo-Regular - 13.0';
    files[`themes/Kokedera ${p.name}.xccolortheme`]=`<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n${plist(theme)}\n</plist>\n`;
  }
  return spec('xcode','Kokedera for Xcode','Nine native .xccolortheme files for Xcode source, markup and debug console colors.',files,
`These files target Xcode's established \`.xccolortheme\` format used through Xcode 26. Quit Xcode, copy the files from \`themes/\` into \`~/Library/Developer/Xcode/UserData/FontAndColorThemes/\` (create the folder if needed), then reopen Xcode and choose **Settings → Themes → Kokedera Dusk**. Earlier versions call Settings **Preferences** or the pane **Fonts & Colors**.

The themes use Menlo at 13 pt; adjust the font size in Xcode after selecting a theme. They cover source text, syntax categories, selection, current line, markup and console. They do not replace Xcode's native interface chrome.

**Xcode 27 boundary:** Apple introduced a new Appearance theme system in Xcode 27. Import and migration of these legacy files have not been verified against Xcode 27; this package does not claim compatibility with its new full-workspace theme format. No macOS/Xcode runtime verification was available during generation.`,
['https://developer.apple.com/library/archive/documentation/IDEs/Reference/xcode_help-collection/Chapter/Chapter.html','https://developer.apple.com/videos/play/wwdc2026/258/','https://github.com/cocopon/xcode-iceberg']);
}

function vim(palettes) {
  const files={};
  // Xterm 256-color nearest match keeps a useful fallback when true-color is off.
  const cube=[0,95,135,175,215,255], indexed=[];
  for(let r=0;r<6;r++)for(let g=0;g<6;g++)for(let b=0;b<6;b++)indexed.push([16+36*r+6*g+b,[cube[r],cube[g],cube[b]]]);
  for(let i=0;i<24;i++)indexed.push([232+i,[8+10*i,8+10*i,8+10*i]]);
  const index=color=>{const rgb=color.slice(1).match(/../g).map(x=>parseInt(x,16));let best=0,distance=Infinity;
    for(const [i,triplet] of indexed){const d=triplet.reduce((sum,v,k)=>sum+(v-rgb[k])**2,0);if(d<distance){best=i;distance=d;}}return best;};
  for(const p of palettes) {
    const h=coreHighlights(p);
    let out=`" Kokedera ${p.name} - Vim 8+\nset background=${p.scheme}\nhighlight clear\nif exists('syntax_on')\n  syntax reset\nendif\nlet g:colors_name = 'kokedera-${p.id}'\n\n`;
    for(const [group,style] of Object.entries(h)) {
      const gui=['bold','italic','underline','undercurl','strikethrough'].filter(k=>style[k]);
      const term=gui.filter(k=>k!=='undercurl'&&k!=='strikethrough');if(style.undercurl)term.push('underline');
      out+=`highlight ${group} guifg=${style.fg??'NONE'} guibg=${style.bg??'NONE'} guisp=${style.sp??'NONE'} gui=${gui.join(',')||'NONE'} ctermfg=${style.fg?index(style.fg):'NONE'} ctermbg=${style.bg?index(style.bg):'NONE'} cterm=${term.join(',')||'NONE'}\n`;
    }
    out+=`\nlet g:terminal_ansi_colors = [${p.terminal.ansi.map(c=>`'${c}'`).join(', ')}]\n`;
    files[`colors/kokedera-${p.id}.vim`]=out;
  }
  files['colors/kokedera.vim']=`" The short name selects the Dusk palette.\nruntime colors/kokedera-dusk.vim\n`;
  return spec('vim','Kokedera for Vim','Nine classic Vim color schemes with GUI colors, 256-color fallbacks and terminal palettes.',files,
`Requires Vim 8 or newer. The theme lives in the \`ports/kokedera-theme-extension-vim\` folder of [kokedera-themes](https://github.com/cappuccinotogo/kokedera-themes). With vim-plug, load that folder with \`Plug 'cappuccinotogo/kokedera-themes', { 'rtp': 'ports/kokedera-theme-extension-vim' }\`. Without a plugin manager, copy the folder into \`~/.vim/pack/themes/start/kokedera/\` (Windows: \`~/vimfiles/pack/themes/start/kokedera/\`). Add to \`vimrc\`:

\`\`\`vim
if has('termguicolors')
  set termguicolors
endif
colorscheme kokedera-dusk
\`\`\`

Use \`:colorscheme kokedera-morning\` to switch; available suffixes: ${variants(palettes)}. \`kokedera\` is an alias for Dusk. Core syntax/UI, diff and spell groups are included. The 256-color fallback approximates the palette; use a true-color terminal or GUI Vim for exact colors. For Treesitter/LSP plugin coverage use the separate Neovim package.`,
['https://vimhelp.org/syntax.txt.html#%3Acolorscheme','https://vimhelp.org/options.txt.html#%27termguicolors%27']);
}

// Notepad++ selector data is appended below. Only native identifier facts are
// retained from the upstream model; colors, font choices and XML are generated.
function notepadpp(palettes) {
  const files={};
  const strip=c=>c.slice(1).toUpperCase();
  for(const p of palettes) {
    const c=colors(p);
    const role=name=>{
      if(/error|illegal|wrong/i.test(name))return c.torii;
      if(/comment|\bPOD\b|documentation/i.test(name))return c.comment;
      if(/regex/i.test(name))return c.regexp;
      if(/string|character|\bCHAR\b|backtick|heredoc|here |verbatim|triple|CDATA/i.test(name))return c.string;
      if(/number|numeric|\bBINNUMBER\b|\bMONEY\b|\bDATE\b|\bTIME\b/i.test(name))return c.number;
      if(/\bBOOL\b|\bNIL\b|constant/i.test(name))return c.constant;
      if(/function|func\b|func\d|method|cmdlet|callable|\bDEF NAME\b/i.test(name))return c.function;
      if(/\bTYPE\b|\bTYPES\b|class name|\bCLASS\b|typedef|namespace|\bMODULE\b/i.test(name))return c.type;
      if(/keyword|instruction|preproc|directive|\bCONTROL\b|\bCOMMAND\b|reserved|\bSTATEMENT\b|\bIMPORT\b|\bRETURN\b/i.test(name))return c.keyword;
      if(/operator|delimiter|braces|\bASSIGN/i.test(name))return c.operator;
      if(/attribute|property|\bKEY\b|\bTAG\b|tagname|\bLABEL\b|\bID\b/i.test(name))return c.property;
      if(/parameter|\bPARAM\b/i.test(name))return c.parameter;
      if(/variable|\bVAR\b|scalar|identifier/i.test(name))return c.variable;
      if(/added|addition/i.test(name))return c.bamboo;if(/deleted|deletion|removed/i.test(name))return c.torii;
      if(/changed/i.test(name))return c.bronze;if(/^H[1-6]$|heading|header|strong/i.test(name))return c.lantern;
      if(/link|\bURL\b|\bURI\b/i.test(name))return c.stream;
      return c.foreground;
    };
    const attrs=obj=>Object.entries(obj).map(([k,v])=>`${k}="${xml(v)}"`).join(' ');
    const ansiNames=['BLACK','RED','GREEN','YELLOW','BLUE','MAGENTA','CYAN','WHITE'];
    const word=(entry)=>{
      const [styleID,name,keywordClass]=entry;
      let fg=role(name),bg=c.background;
      if(name.startsWith('ANSI COLOR ')) {
        const number={BLACK:0,RED:1,GREEN:2,BROWN:3,BLUE:4,MAGENTA:5,CYAN:6,GRAY:7,'DARK GRAY':8,
          'BRIGHT RED':9,'BRIGHT GREEN':10,YELLOW:11,'BRIGHT BLUE':12,'BRIGHT MAGENTA':13,'BRIGHT CYAN':14,WHITE:15}[name.slice(11)];
        if(number!==undefined)fg=c.ansi[number];
      }
      const ansi=name.match(/^(BOLD )?(DEFAULT|BLACK|RED|GREEN|YELLOW|BLUE|MAGENTA|CYAN|WHITE) on (DEFAULT|BLACK|RED|GREEN|YELLOW|BLUE|MAGENTA|CYAN|WHITE)$/);
      if(ansi){fg=ansi[2]==='DEFAULT'?c.foreground:c.ansi[ansiNames.indexOf(ansi[2])+(ansi[1]?8:0)];bg=ansi[3]==='DEFAULT'?c.background:c.ansi[ansiNames.indexOf(ansi[3])];}
      const info={name,styleID,fgColor:strip(fg),bgColor:strip(bg),fontName:'',fontStyle:/comment/i.test(name)?'2':/^(H[1-6]|STRONG|BOLD )/.test(name)?'1':'0',fontSize:''};
      if(keywordClass)info.keywordClass=keywordClass;
      return `      <WordsStyle ${attrs(info)} />`;
    };
    const lexers=NPP_LEXERS.map(([name,desc,styles])=>`    <LexerType ${attrs({name,desc,ext:''})}>\n${styles.map(word).join('\n')}\n    </LexerType>`).join('\n');
    const widget=([styleID,name])=>{
      let fg=c.foreground,bg=c.background;
      if(/margin|fold/i.test(name)){fg=c.textMuted;bg=c.bgSurface;}
      if(/line number/i.test(name))fg=c.textDim;
      if(/indent|edge|white space|non-printing/i.test(name))fg=c.borderMain;
      if(/current line/i.test(name))bg=c.bgSurface;
      if(/selected text|highlight|mark style|tags match|tags attribute/i.test(name)){fg=c.selectionForeground;bg=c.selectionBackground;}
      if(/caret/i.test(name))fg=c.cursor;
      if(/bad brace|not found/i.test(name))fg=c.torii;
      if(name==='Brace highlight style'){fg=c.lantern;bg=c.bgActive;}
      if(/change history.*modified/i.test(name)){fg=c.bronze;bg=c.bronze;}
      if(/change history.*saved/i.test(name)){fg=c.bamboo;bg=c.bamboo;}
      if(/change history.*origin/i.test(name)){fg=c.stream;bg=c.stream;}
      if(/inactive tab/i.test(name)){fg=c.textMuted;bg=c.bgSurface;}
      if(/active tab.*indicator/i.test(name)){fg=c.accentLime;bg=c.accentLime;}
      if(/tab color/i.test(name)){fg=c.foreground;bg=[c.bgActive,c.bgSurface,c.bgElevated,c.borderSubtle,c.borderMain][(parseInt(name.slice(-1))-1)||0];}
      if(/URL hovered/i.test(name))fg=c.stream;
      return `    <WidgetStyle ${attrs({name,styleID,fgColor:strip(fg),bgColor:strip(bg),fontName:'',fontStyle:'0',fontSize:''})} />`;
    };
    files[`themes/Kokedera ${p.name}.xml`]=`<?xml version="1.0" encoding="UTF-8"?>\n<!-- Kokedera ${p.name}. Native lexer/style identifiers follow the Notepad++ model. -->\n<NotepadPlus>\n  <LexerStyles>\n${lexers}\n  </LexerStyles>\n  <GlobalStyles>\n${NPP_WIDGETS.map(widget).join('\n')}\n  </GlobalStyles>\n</NotepadPlus>\n`;
  }
  files['FORMAT-NOTES.md']=`# Native Notepad++ coverage\n\nTheme XML is generated from the shared Kokedera palette. Native lexer names, numeric style identifiers and keyword-class names were checked against the official Notepad++ stylers model on 2026-09-12. ${NPP_LEXERS.length} native lexer definitions and ${NPP_WIDGETS.length} global widget styles are included. The factual identifier table is retained by the generator; upstream theme colors and fonts are not copied.\n\nSource: https://github.com/notepad-plus-plus/notepad-plus-plus/blob/master/PowerEditor/src/stylers.model.xml\n\nLanguage-specific lexer limitations still apply: a theme can only color the token categories that each lexer exposes. User Defined Languages have separate styling. Syntax themes do not fully skin native window chrome; choose Notepad++ Dark Mode separately when using a dark palette.\n`;
  return spec('notepadpp','Kokedera for Notepad++','Nine native Notepad++ XML themes covering built-in lexers, selections, gutters and tabs.',files,
`Close every Notepad++ window. Copy the XML files from \`themes/\` to \`%AppData%\\Notepad++\\themes\\\`. For portable/local configuration, use the \`themes\\\` folder beside \`notepad++.exe\`. Reopen Notepad++, select **Settings → Style Configurator**, and choose **Kokedera Dusk** or another variant.

Notepad++ 8.9 or newer is recommended because new lexer styles are propagated with the active theme's default colors. Choose the application's Dark Mode separately for the dark variants. Files are UTF-8 without a BOM. Do not import these files as User Defined Languages. \`FORMAT-NOTES.md\` records lexer coverage and the format source.`,
['https://npp-user-manual.org/docs/themes/','https://npp-user-manual.org/docs/config-files/','https://github.com/notepad-plus-plus/notepad-plus-plus/blob/master/PowerEditor/src/stylers.model.xml']);
}

export function generate(palettes) {
  if(!Array.isArray(palettes)||palettes.length===0)throw new TypeError('Editor generator requires palettes');
  for(const p of palettes) {
    if(!/^[a-z]+$/.test(p.id)||!['light','dark'].includes(p.scheme))throw new Error('Invalid palette identity');
    if(p.terminal?.ansi?.length!==16)throw new Error(`${p.id}: expected 16 ANSI colors`);
    for(const [key,value] of Object.entries({...p.tokens,...p.syntax,...p.terminal})) {
      if(key!=='ansi' && (typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value)))throw new Error(`${p.id}: invalid ${key}`);
    }
  }
  return [neovim(palettes),helix(palettes),sublime(palettes),emacs(palettes),notepadpp(palettes),xcode(palettes),vim(palettes)];
}

// NPP_NATIVE_IDENTIFIERS - official lexer API identifiers, checked 2026-09-12.
const NPP_LEXERS = [["actionscript","ActionScript",[["11","DEFAULT",""],["20","FUNCTION","type2"],["9","PREPROCESSOR",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["23","PREPROCESSOR COMMENT",""],["24","PREPROCESSOR COMMENT DOC",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["ada","ADA",[["0","DEFAULT",""],["1","INSTRUCTION WORD","instre1"],["2","IDENTIFIER",""],["3","NUMBER",""],["4","DELIMITER",""],["5","CHARACTER",""],["7","STRING",""],["9","LABEL",""],["10","COMMENT LINE",""],["11","ILLEGAL",""]]],["asn1","ASN.1",[["0","DEFAULT",""],["1","COMMENT",""],["2","IDENTIFIERS",""],["3","DOUBLE QUOTED STRING",""],["4","NUMERIC OID DEFINITION",""],["5","NON OID NUMBERS",""],["6","KEYWORDS","instre1"],["7","ATTRIBUTES","instre2"],["8","DESCRIPTORS","type1"],["9","TYPES","type2"],["10","OPERATORS",""]]],["asp","ASP",[["81","DEFAULT",""],["82","COMMENT LINE",""],["83","NUMBER",""],["84","WORD","instre1"],["85","STRING",""],["86","IDENTIFIER",""],["15","ASP SYMBOL",""],["16","SCRIPT TYPE",""],["216","USER KEYWORDS 1","substyle1"],["217","USER KEYWORDS 2","substyle2"],["218","USER KEYWORDS 3","substyle3"],["219","USER KEYWORDS 4","substyle4"],["220","USER KEYWORDS 5","substyle5"],["221","USER KEYWORDS 6","substyle6"],["222","USER KEYWORDS 7","substyle7"],["223","USER KEYWORDS 8","substyle8"]]],["asm","Assembly",[["0","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","STRING",""],["4","OPERATOR",""],["5","IDENTIFIER",""],["6","CPU INSTRUCTION","instre1"],["7","MATH INSTRUCTION","instre2"],["8","REGISTER","type1"],["9","DIRECTIVE","type2"],["10","DIRECTIVE OPERAND","type3"],["11","COMMENT BLOCK",""],["12","CHARACTER",""],["14","EXT INSTRUCTION","type4"]]],["autoit","AutoIt",[["0","DEFAULT",""],["1","COMMENT LINE",""],["2","COMMENT",""],["3","NUMBER",""],["4","FUNCTION","instre2"],["5","INSTRUCTION WORD","instre1"],["6","MACRO","type1"],["7","STRING",""],["8","OPERATOR",""],["9","VARIABLE",""],["10","SENT","type2"],["11","PREPROCESSOR","type3"],["12","SPECIAL","type4"],["13","EXPAND","type5"],["14","COMOBJ",""]]],["avs","AviSynth",[["32","DEFAULT",""],["0","WHITE SPACE",""],["1","COMMENT: /* */",""],["2","COMMENT: [* *]",""],["3","LINE COMMENT: #",""],["4","NUMBER",""],["5","OPERATORS",""],["6","IDENTIFIERS",""],["7","DOUBLE QUOTED STRING",""],["8","STRING WITH THREE DOUBLE QUOTES",""],["9","KEYWORD","instre1"],["10","FILTER","instre2"],["11","PLUGIN","type1"],["12","FUNCTION","type2"],["13","CLIP PROPERTIES","type3"],["14","USER DEFINED","type4"]]],["baanc","BaanC",[["0","DEFAULT",""],["1","COMMENT",""],["2","COMMENT DOC",""],["3","NUMBER",""],["4","KEYWORDS","instre1"],["5","STRING",""],["6","PREPROCESSOR",""],["7","OPERATOR",""],["8","IDENTIFIER",""],["9","STRING EOL NC",""],["10","FUNCTIONS","instre2"],["11","FUNCTIONS ABRIDGED","type1"],["12","SUB SECTIONS","type2"],["13","MAIN SECTIONS","type3"],["14","PREDEFINED VARIABLE","type4"],["15","PREDEFINED ATTRIBUTES","type5"],["16","ENUM DOMAINS","type6"],["17","USER DEFINED","type7"],["18","TABLE DEFINITIONS",""],["19","TABLE SQL",""],["20","DLL FUNCTIONS",""],["21","DOMAIN DEFINITIONS",""],["22","FUNCTION DEFINITIONS",""],["23","OBJECT DEFINITIONS",""],["24","PREPROC DEFINITIONS",""]]],["bash","Bash",[["0","DEFAULT",""],["1","ERROR",""],["4","INSTRUCTION WORD","instre1"],["3","NUMBER",""],["5","STRING",""],["6","CHARACTER",""],["7","OPERATOR",""],["8","IDENTIFIER",""],["9","SCALAR",""],["2","COMMENT LINE",""],["10","PARAM",""],["11","BACKTICKS",""],["12","HERE DELIM",""],["13","HERE Q",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER SCALAR 1","substyle5"],["133","USER SCALAR 2","substyle6"],["134","USER SCALAR 3","substyle7"],["135","USER SCALAR 4","substyle8"]]],["batch","Batch",[["0","DEFAULT",""],["1","COMMENT",""],["2","KEYWORDS","instre1"],["3","LABEL",""],["4","HIDE SYMBOL",""],["5","COMMAND",""],["6","VARIABLE",""],["7","OPERATOR",""],["8","AFTER LABEL",""]]],["blitzbasic","BlitzBasic",[["0","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","KEYWORD1","instre1"],["4","STRING",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["10","KEYWORD2","instre2"],["11","KEYWORD3","type1"],["12","KEYWORD4","type2"],["15","LABEL",""],["16","ERROR",""],["17","HEXNUMBER",""],["18","BINNUMBER",""]]],["c","C",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["23","PREPROCESSOR COMMENT",""],["24","PREPROCESSOR COMMENT DOC",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["cpp","C++",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["4","NUMBER",""],["6","STRING",""],["20","STRINGRAW",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["23","PREPROCESSOR COMMENT",""],["24","PREPROCESSOR COMMENT DOC",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["cs","C#",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["23","PREPROCESSOR COMMENT",""],["24","PREPROCESSOR COMMENT DOC",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["caml","Caml",[["0","DEFAULT",""],["1","IDENTIFIER",""],["2","TAGNAME",""],["3","INSTRUCTION WORD","instre1"],["4","BUILIN FUNC & TYPE","instre2"],["5","TYPE","type1"],["6","LINENUM",""],["7","OPERATOR",""],["8","NUMBER",""],["9","CHARACTER",""],["11","STRING",""],["12","COMMENT",""],["13","COMMENT LINE",""],["14","COMMENT DOC",""],["15","COMMENT LINE DOC",""]]],["cmake","CMake",[["0","DEFAULT",""],["1","COMMENT",""],["2","STRING D",""],["3","STRING L",""],["4","STRING R",""],["5","COMMAND","instre1"],["6","PARAMETER",""],["7","VARIABLE",""],["8","USER DEFINED","type1"],["9","WHILEDEF",""],["10","FOREACHDEF",""],["11","IFDEF",""],["12","MACRODEF",""],["13","STRING VARIABLE",""],["14","NUMBER",""]]],["cobol","COBOL",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","DECLARATION","instre1"],["16","INSTRUCTION WORD","instre2"],["8","KEYWORD","type1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""]]],["csound","Csound",[["0","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","OPERATOR",""],["4","INSTR",""],["5","IDENTIFIER",""],["6","OPCODE","instre1"],["7","HEADER STATEMENT","instre2"],["8","USER KEYWORDS","type1"],["9","COMMENT BLOCK",""],["10","PARAMETER",""],["11","A-RATE VARIABLE",""],["12","K-RATE VARIABLE",""],["13","I-RATE VARIABLE",""],["14","GLOBAL VARIABLE",""],["15","END OF LINE WHERE STRING IS NOT CLOSED",""]]],["coffeescript","CoffeeScript",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","instre2"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["19","PREDEFINED CONSTANT","type2"],["22","COMMENT BLOCK",""],["23","VERBOSE REGEX",""],["24","VERBOSE REGEX COMMENT",""]]],["css","CSS",[["0","DEFAULT",""],["1","TAG",""],["2","CLASS",""],["3","PSEUDOCLASS","instre2"],["4","UNKNOWN PSEUDOCLASS",""],["5","OPERATOR",""],["6","IDENTIFIER","instre1"],["7","UNKNOWN IDENTIFIER",""],["8","VALUE",""],["9","COMMENT",""],["10","ID",""],["11","IMPORTANT",""],["12","DIRECTIVE",""],["13","DOUBLE STRING",""],["14","SINGLE STRING",""],["16","ATTRIBUTE",""],["18","PSEUDOELEMENT","type3"],["20","LEGACY PSEUDOELEMENT","type5"],["22","MEDIA",""],["23","VARIABLE",""]]],["d","D",[["0","DEFAULT",""],["14","IDENTIFIER",""],["6","INSTRUCTION WORD","instre1"],["7","KEYWORD1","instre2"],["8","KEYWORD2","type1"],["9","KEYWORD3","type2"],["20","KEYWORD4","type3"],["21","KEYWORD5","type4"],["22","KEYWORD6","type5"],["5","NUMBER",""],["10","STRING",""],["12","CHARACTER",""],["13","OPERATOR",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["4","COMMENT NESTED",""],["15","COMMENT LINE DOC",""],["16","COMMENT DOC KEYWORD",""],["17","COMMENT DOC KEYWORD ERROR",""],["18","STRING B",""],["19","STRING R",""]]],["diff","diff file",[["0","DEFAULT",""],["1","COMMENT",""],["2","COMMAND",""],["3","HEADER",""],["4","POSITION",""],["5","DELETED",""],["6","ADDED",""]]],["erlang","Erlang",[["0","DEFAULT STYLE",""],["1","DEFAULT COMMENT",""],["14","FUNCTION COMMENT",""],["15","MODULE COMMENT",""],["16","DOCUMENTATION HELPER IN COMMENT","type3"],["17","DOCUMENTATION MACRO IN COMMENT","type4"],["2","VARIABLE",""],["3","NUMBER",""],["5","STRING",""],["9","CHARACTER",""],["10","MACRO",""],["19","MACRO QUOTED",""],["11","RECORD",""],["20","RECORD QUOTED",""],["7","ATOM",""],["18","ATOM QUOTED",""],["13","NODE NAME",""],["21","NODE NAME QUOTED",""],["4","RESERVED WORDS","instre1"],["22","BUILT-IN FUNCTIONS","instre2"],["8","FUNCTION NAME",""],["23","MODULE NAME",""],["24","MODULE ATTRIBUTES","type2"],["12","PREPROCESSOR","type1"],["6","OPERATORS",""],["31","UNKNOWN: ERROR",""]]],["errorlist","ErrorList",[["0","DEFAULT STYLE",""],["1","PYTHON Error",""],["2","GCC Error",""],["3","MS Error",""],["4","CMD Error",""],["5","BORLAND Error",""],["6","PERL Error",""],["7","NET Error",""],["8","LUA Error",""],["9","CTAG Error",""],["10","DIFF Changed",""],["11","DIFF Addition",""],["12","DIFF Deletion",""],["13","DIFF Message",""],["14","PHP Error",""],["15","ELF Error",""],["16","IFC Error",""],["17","IFORT Error",""],["18","ABSF Error",""],["19","TIDY Error",""],["20","JAVA Stack Error",""],["21","VALUE Error",""],["22","GCC Included-From Error",""],["23","Escape Sequence",""],["24","Unknown Escape Sequence",""],["25","GCC Excerpt Error",""],["26","BASH Error",""],["40","ANSI COLOR BLACK",""],["41","ANSI COLOR RED",""],["42","ANSI COLOR GREEN",""],["43","ANSI COLOR BROWN",""],["44","ANSI COLOR BLUE",""],["45","ANSI COLOR MAGENTA",""],["46","ANSI COLOR CYAN",""],["47","ANSI COLOR GRAY",""],["48","ANSI COLOR DARK GRAY",""],["49","ANSI COLOR BRIGHT RED",""],["50","ANSI COLOR BRIGHT GREEN",""],["51","ANSI COLOR YELLOW",""],["52","ANSI COLOR BRIGHT BLUE",""],["53","ANSI COLOR BRIGHT MAGENTA",""],["54","ANSI COLOR BRIGHT CYAN",""],["55","ANSI COLOR WHITE",""]]],["escseq","Escape Sequence (ANSI)",[["0","DEFAULT on DEFAULT",""],["1","BLACK on DEFAULT",""],["2","RED on DEFAULT",""],["3","GREEN on DEFAULT",""],["4","YELLOW on DEFAULT",""],["5","BLUE on DEFAULT",""],["6","MAGENTA on DEFAULT",""],["7","CYAN on DEFAULT",""],["8","WHITE on DEFAULT",""],["9","DEFAULT on BLACK",""],["10","BLACK on BLACK",""],["11","RED on BLACK",""],["12","GREEN on BLACK",""],["13","YELLOW on BLACK",""],["14","BLUE on BLACK",""],["15","MAGENTA on BLACK",""],["16","CYAN on BLACK",""],["17","WHITE on BLACK",""],["18","DEFAULT on RED",""],["19","BLACK on RED",""],["20","RED on RED",""],["21","GREEN on RED",""],["22","YELLOW on RED",""],["23","BLUE on RED",""],["24","MAGENTA on RED",""],["25","CYAN on RED",""],["26","WHITE on RED",""],["27","DEFAULT on GREEN",""],["28","BLACK on GREEN",""],["29","RED on GREEN",""],["30","GREEN on GREEN",""],["40","YELLOW on GREEN",""],["41","BLUE on GREEN",""],["42","MAGENTA on GREEN",""],["43","CYAN on GREEN",""],["44","WHITE on GREEN",""],["45","DEFAULT on YELLOW",""],["46","BLACK on YELLOW",""],["47","RED on YELLOW",""],["48","GREEN on YELLOW",""],["49","YELLOW on YELLOW",""],["50","BLUE on YELLOW",""],["51","MAGENTA on YELLOW",""],["52","CYAN on YELLOW",""],["53","WHITE on YELLOW",""],["54","DEFAULT on BLUE",""],["55","BLACK on BLUE",""],["56","RED on BLUE",""],["57","GREEN on BLUE",""],["58","YELLOW on BLUE",""],["59","BLUE on BLUE",""],["60","MAGENTA on BLUE",""],["61","CYAN on BLUE",""],["62","WHITE on BLUE",""],["63","DEFAULT on MAGENTA",""],["64","BLACK on MAGENTA",""],["65","RED on MAGENTA",""],["66","GREEN on MAGENTA",""],["67","YELLOW on MAGENTA",""],["68","BLUE on MAGENTA",""],["69","MAGENTA on MAGENTA",""],["70","CYAN on MAGENTA",""],["71","WHITE on MAGENTA",""],["72","DEFAULT on CYAN",""],["73","BLACK on CYAN",""],["74","RED on CYAN",""],["75","GREEN on CYAN",""],["76","YELLOW on CYAN",""],["77","BLUE on CYAN",""],["78","MAGENTA on CYAN",""],["79","CYAN on CYAN",""],["80","WHITE on CYAN",""],["81","DEFAULT on WHITE",""],["82","BLACK on WHITE",""],["83","RED on WHITE",""],["84","GREEN on WHITE",""],["85","YELLOW on WHITE",""],["86","BLUE on WHITE",""],["87","MAGENTA on WHITE",""],["88","CYAN on WHITE",""],["89","WHITE on WHITE",""],["090","BOLD DEFAULT on DEFAULT",""],["091","BOLD BLACK on DEFAULT",""],["092","BOLD RED on DEFAULT",""],["093","BOLD GREEN on DEFAULT",""],["094","BOLD YELLOW on DEFAULT",""],["095","BOLD BLUE on DEFAULT",""],["096","BOLD MAGENTA on DEFAULT",""],["097","BOLD CYAN on DEFAULT",""],["098","BOLD WHITE on DEFAULT",""],["099","BOLD DEFAULT on BLACK",""],["100","BOLD BLACK on BLACK",""],["101","BOLD RED on BLACK",""],["102","BOLD GREEN on BLACK",""],["103","BOLD YELLOW on BLACK",""],["104","BOLD BLUE on BLACK",""],["105","BOLD MAGENTA on BLACK",""],["106","BOLD CYAN on BLACK",""],["107","BOLD WHITE on BLACK",""],["108","BOLD DEFAULT on RED",""],["109","BOLD BLACK on RED",""],["110","BOLD RED on RED",""],["111","BOLD GREEN on RED",""],["112","BOLD YELLOW on RED",""],["113","BOLD BLUE on RED",""],["114","BOLD MAGENTA on RED",""],["115","BOLD CYAN on RED",""],["116","BOLD WHITE on RED",""],["117","BOLD DEFAULT on GREEN",""],["118","BOLD BLACK on GREEN",""],["119","BOLD RED on GREEN",""],["120","BOLD GREEN on GREEN",""],["121","BOLD YELLOW on GREEN",""],["122","BOLD BLUE on GREEN",""],["123","BOLD MAGENTA on GREEN",""],["124","BOLD CYAN on GREEN",""],["125","BOLD WHITE on GREEN",""],["126","BOLD DEFAULT on YELLOW",""],["127","BOLD BLACK on YELLOW",""],["128","BOLD RED on YELLOW",""],["129","BOLD GREEN on YELLOW",""],["130","BOLD YELLOW on YELLOW",""],["131","BOLD BLUE on YELLOW",""],["132","BOLD MAGENTA on YELLOW",""],["133","BOLD CYAN on YELLOW",""],["134","BOLD WHITE on YELLOW",""],["135","BOLD DEFAULT on BLUE",""],["136","BOLD BLACK on BLUE",""],["137","BOLD RED on BLUE",""],["138","BOLD GREEN on BLUE",""],["139","BOLD YELLOW on BLUE",""],["140","BOLD BLUE on BLUE",""],["141","BOLD MAGENTA on BLUE",""],["142","BOLD CYAN on BLUE",""],["143","BOLD WHITE on BLUE",""],["144","BOLD DEFAULT on MAGENTA",""],["145","BOLD BLACK on MAGENTA",""],["146","BOLD RED on MAGENTA",""],["147","BOLD GREEN on MAGENTA",""],["148","BOLD YELLOW on MAGENTA",""],["149","BOLD BLUE on MAGENTA",""],["150","BOLD MAGENTA on MAGENTA",""],["151","BOLD CYAN on MAGENTA",""],["152","BOLD WHITE on MAGENTA",""],["153","BOLD DEFAULT on CYAN",""],["154","BOLD BLACK on CYAN",""],["155","BOLD RED on CYAN",""],["156","BOLD GREEN on CYAN",""],["157","BOLD YELLOW on CYAN",""],["158","BOLD BLUE on CYAN",""],["159","BOLD MAGENTA on CYAN",""],["160","BOLD CYAN on CYAN",""],["161","BOLD WHITE on CYAN",""],["162","BOLD DEFAULT on WHITE",""],["163","BOLD BLACK on WHITE",""],["164","BOLD RED on WHITE",""],["165","BOLD GREEN on WHITE",""],["166","BOLD YELLOW on WHITE",""],["167","BOLD BLUE on WHITE",""],["168","BOLD MAGENTA on WHITE",""],["169","BOLD CYAN on WHITE",""],["170","BOLD WHITE on WHITE",""],["171","Sequence Identifier",""],["172","Sequence Unknown",""]]],["escript","eScript",[["0","DEFAULT",""],["1","COMMENT",""],["2","LINE COMMENT",""],["3","DOC COMMENT",""],["4","NUMBER",""],["5","KEYWORD","instre1"],["6","DOUBLE QUOTED STRING",""],["7","OPERATORS",""],["8","IDENTIFIERS",""],["9","BRACES",""],["10","KEYWORDS2","instre2"],["11","KEYWORDS3","type1"]]],["forth","Forth",[["0","WHITESPACE",""],["1","COMMENT",""],["2","ML COMMENT",""],["3","IDENTIFIER",""],["4","CONTROL","instre1"],["5","KEYWORDS","instre2"],["6","DEFWORDS","type1"],["7","PREWORD1","type2"],["8","PREWORD2","type3"],["9","NUMBER",""],["10","DOUBLE QUOTED STRING","type4"],["11","LOCALE",""]]],["fortran","Fortran (free form)",[["0","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","STRING",""],["4","STRING2",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["8","INSTRUCTION WORD","instre1"],["9","FUNCTION1","instre2"],["10","FUNCTION2","type1"],["11","PREPROCESSOR",""],["12","OPERATOR2",""],["13","LABEL",""],["14","CONTINUATION",""]]],["fortran77","Fortran (fixed form)",[["0","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","STRING",""],["4","STRING2",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["8","INSTRUCTION WORD","instre1"],["9","FUNCTION1","instre2"],["10","FUNCTION2","type1"],["11","PREPROCESSOR",""],["12","OPERATOR2",""],["13","LABEL",""],["14","CONTINUATION",""]]],["freebasic","FreeBASIC",[["0","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","KEYWORD1","instre1"],["4","STRING",""],["5","PREPROCESSOR",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["10","KEYWORD2","instre2"],["11","KEYWORD3","type1"],["12","KEYWORD4","type2"],["15","LABEL",""],["16","ERROR",""],["17","HEXNUMBER",""],["18","BINNUMBER",""]]],["gdscript","GDScript",[["0","DEFAULT",""],["1","COMMENT LINE",""],["2","NUMBER",""],["3","STRING",""],["4","CHARACTER",""],["5","WORD","instre1"],["6","TRIPLE",""],["7","TRIPLE DOUBLE",""],["8","CLASS NAME",""],["9","FUNC NAME",""],["10","OPERATOR",""],["11","IDENTIFIER",""],["12","COMMENT BLOCK",""],["13","STRING EOL",""],["14","WORD2","instre2"],["15","ANNOTATION",""],["16","NODEPATH",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["go","Go",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["19","PREDECLARED IDENTIFIERS","instre2"],["4","NUMBER",""],["6","STRING",""],["20","STRING RAW",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["23","PREPROCESSOR COMMENT",""],["24","PREPROCESSOR COMMENT DOC",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["gui4cli","Gui4Cli",[["0","DEFAULT",""],["1","COMMENT LINE",""],["2","COMMENT",""],["3","GLOBAL","instre1"],["4","EVENT","instre2"],["5","ATTRIBUTE","type1"],["6","CONTROL","type2"],["7","COMMAND","type3"],["8","STRING",""],["9","OPERATOR",""]]],["haskell","Haskell",[["0","DEFAULT",""],["1","IDENTIFIER",""],["2","KEYWORD",""],["3","NUMBER",""],["4","STRING",""],["5","CHARACTER",""],["6","CLASS",""],["7","MODULE",""],["8","CAPITAL",""],["9","DATA",""],["10","IMPORT",""],["11","OPERATOR",""],["12","INSTANCE",""],["13","COMMENT LINE",""],["14","COMMENT BLOCK",""],["15","COMMENT BLOCK2",""],["16","COMMENT BLOCK3",""]]],["hollywood","Hollywood",[["0","DEFAULT",""],["1","COMMENT",""],["2","COMMENT BLOCK",""],["3","NUMBER",""],["4","KEYWORD","instre1"],["5","CORE API","instre2"],["6","PLUGIN API","type1"],["7","PLUGIN METHOD","type2"],["8","STRING",""],["9","STRING BLOCK",""],["10","PREPROCESSOR",""],["11","OPERATOR",""],["12","IDENTIFIER",""],["13","CONSTANT",""],["14","HEXNUMBER",""]]],["html","HTML",[["0","DEFAULT",""],["9","COMMENT",""],["5","NUMBER",""],["6","DOUBLE STRING",""],["7","SINGLE STRING",""],["1","TAG","instre1"],["11","TAG END",""],["2","TAG UNKNOWN",""],["3","ATTRIBUTE",""],["4","ATTRIBUTE UNKNOWN",""],["21","SGML DEFAULT",""],["22","SGML COMMAND","instre2"],["23","SGML 1ST PARAM",""],["24","SGML DOUBLESTRING",""],["25","SGML SIMPLESTRING",""],["31","SGML BLOCK DEFAULT",""],["17","CDATA",""],["19","VALUE",""],["10","ENTITY",""],["192","USER TAGS1","substyle1"],["193","USER TAGS2","substyle2"],["194","USER TAGS3","substyle3"],["195","USER TAGS4","substyle4"],["196","USER ATTRIBUTES1","substyle5"],["197","USER ATTRIBUTES2","substyle6"],["198","USER ATTRIBUTES3","substyle7"],["199","USER ATTRIBUTES4","substyle8"]]],["ihex","Intel HEX",[["0","DEFAULT",""],["1","RECSTART",""],["2","RECTYPE",""],["3","RECTYPE_UNKNOWN",""],["4","BYTECOUNT",""],["5","BYTECOUNT_WRONG",""],["6","NOADDRESS",""],["7","DATAADDRESS",""],["9","STARTADDRESS",""],["10","ADDRESSFIELD_UNKNOWN",""],["11","EXTENDEDADDRESS",""],["12","DATA_ODD",""],["13","DATA_EVEN",""],["14","DATA_UNKNOWN",""],["15","DATA_EMPTY",""],["16","CHECKSUM",""],["17","CHECKSUM_WRONG",""],["18","GARBAGE",""]]],["ini","INI file",[["0","DEFAULT",""],["1","COMMENT",""],["2","SECTION",""],["3","ASSIGNMENT",""],["4","DEFVAL",""],["5","KEY",""]]],["inno","InnoSetup",[["0","DEFAULT",""],["1","COMMENT",""],["2","KEYWORD","instre2"],["3","PARAMETER","type1"],["4","SECTION","instre1"],["5","PREPROCESSOR","type2"],["6","PREPROCESSOR INLINE",""],["7","COMMENT PASCAL",""],["8","KEYWORD PASCAL","type3"],["9","KEYWORD USER","type4"],["10","STRING DOUBLE",""],["11","STRING SINGLE",""],["12","IDENTIFIER",""]]],["java","Java",[["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["javascript","JavaScript (embedded)",[["41","DEFAULT",""],["45","NUMBER",""],["46","WORD",""],["47","KEYWORD","instre1"],["48","DOUBLE STRING",""],["49","SINGLE STRING",""],["53","TEMPLATE LIT. (CLIENT)",""],["68","TEMPLATE LIT. (SERVER)",""],["50","SYMBOLS",""],["52","REGEX",""],["42","COMMENT",""],["43","COMMENT LINE",""],["44","COMMENT DOC",""],["200","USER KEYWORDS 1","substyle1"],["201","USER KEYWORDS 2","substyle2"],["202","USER KEYWORDS 3","substyle3"],["203","USER KEYWORDS 4","substyle4"],["204","USER KEYWORDS 5","substyle5"],["205","USER KEYWORDS 6","substyle6"],["206","USER KEYWORDS 7","substyle7"],["207","USER KEYWORDS 8","substyle8"]]],["javascript.js","JavaScript",[["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["19","WINDOW INSTRUCTION","instre2"],["4","NUMBER",""],["6","STRING",""],["20","STRING RAW",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["json","JSON",[["0","DEFAULT",""],["1","NUMBER",""],["2","STRING",""],["3","STRING EOL",""],["4","PROPERTY NAME",""],["5","ESCAPE SEQUENCE",""],["6","LINE COMMENT",""],["7","BLOCK COMMENT",""],["8","OPERATOR",""],["9","URI",""],["10","COMPACT IRI",""],["11","KEYWORD","instre1"],["12","LD KEYWORD","instre2"],["13","ERROR",""]]],["kix","KiXtart",[["31","DEFAULT",""],["1","COMMENT",""],["2","STRING",""],["3","STRING2",""],["4","NUMBER",""],["5","VAR",""],["6","MACRO","instre2"],["7","INSTRUCTION WORD","instre1"],["8","FUNCTION","type1"],["9","OPERATOR",""]]],["lisp","LISP",[["0","DEFAULT",""],["1","COMMENT LINE",""],["2","NUMBER",""],["3","FUNCTION WORD","instre1"],["4","FUNCTION WORD2","instre2"],["5","SYMBOL",""],["6","STRING",""],["9","IDENTIFIER",""],["10","OPERATOR","type1"],["11","SPECIAL",""],["12","COMMENT",""]]],["latex","LaTeX",[["0","WHITE SPACE",""],["1","COMMAND",""],["2","TAG OPENING",""],["3","MATH INLINE",""],["4","COMMENT",""],["5","TAG CLOSING",""],["6","MATH BLOCK",""],["7","COMMENT BLOCK",""],["8","VERBATIM SEGMENT",""],["9","SHORT COMMAND",""],["10","SPECIAL CHAR",""],["11","COMMAND OPTIONAL ARGUMENT",""],["12","SYNTAX ERROR",""]]],["lua","Lua",[["0","DEFAULT",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["8","LITERAL STRING",""],["9","PREPROCESSOR",""],["5","INSTRUCTION WORD","instre1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","FUNC1","instre2"],["14","FUNC2","type1"],["15","FUNC3","type2"],["16","USER KEYWORDS 1","type3"],["17","USER KEYWORDS 2","type4"],["18","USER KEYWORDS 3","type5"],["19","USER KEYWORDS 4","type6"],["11","IDENTIFIER",""],["20","LABEL",""],["128","USER KEYWORDS 5","substyle1"],["129","USER KEYWORDS 6","substyle2"],["130","USER KEYWORDS 7","substyle3"],["131","USER KEYWORDS 8","substyle4"]]],["makefile","Makefile",[["0","DEFAULT",""],["1","COMMENT",""],["2","PREPROCESSOR",""],["3","IDENTIFIER",""],["4","OPERATOR",""],["5","TARGET",""],["9","IDEOL",""]]],["matlab","Matlab",[["0","DEFAULT",""],["1","COMMENT",""],["2","COMMAND",""],["3","NUMBER",""],["4","INSTRUCTION WORD","instre1"],["5","STRING",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["8","DOUBLE QUOTE STRING",""]]],["mssql","MS T-SQL",[["9","STATEMENT","instre1"],["10","DATA TYPE","instre2"],["11","SYSTEM TABLE","type1"],["12","GLOBAL","type2"],["13","FUNCTION","type3"],["14","SYSTEM STORED PROC","type4"],["1","COMMENT",""],["2","COMMENT LINE",""],["3","NUMBER",""],["4","STRING",""],["5","OPERATOR",""],["6","IDENTIFIER",""],["7","VARIABLE",""],["8","COL NAME",""],["16","COL NAME IN []'s",""]]],["mmixal","MMIXAL",[["0","DIVSION OF LEADING WHITESPACE IN LINE",""],["1","COMMENT",""],["2","LABEL",""],["3","OPCODE",""],["4","DIVISION BETWEEN LABEL AND OPCODE",""],["5","VALID OPCODE","instre1"],["6","UNKNOWN OPCODE",""],["7","DIVISION BETWEEN OPCODE AND OPERANDS",""],["8","DIVISION OF OPERANDS",""],["9","NUMBER",""],["10","REFERENCE (TO A LABEL)",""],["11","CHAR",""],["12","STRING",""],["13","REGISTER","instre2"],["14","HEXADECIMAL NUMBER",""],["15","OPERATOR",""],["16","SYMBOL","type1"],["17","COMMENT OTHERWISE",""]]],["nfo","DOS Style",[["32","DEFAULT",""]]],["nsis","NSIS",[["0","DEFAULT",""],["1","COMMENT LINE",""],["2","STRING DOUBLE QUOTE",""],["3","STRING LEFT QUOTE",""],["4","STRING RIGHT QUOTE",""],["5","FUNCTION","instre1"],["6","VARIABLE","instre2"],["7","LABEL","type1"],["8","USER DEFINED","type2"],["9","SECTION",""],["10","SUBSECTION",""],["11","IF DEFINE",""],["12","MACRO",""],["13","STRING VAR",""],["14","NUMBER",""],["15","SECTION GROUP",""],["16","PAGE EX",""],["17","FUNCTION DEFINITIONS",""],["18","COMMENT",""]]],["nim","Nim",[["0","WHITE SPACE",""],["1","COMMENT",""],["2","NUMBER",""],["3","STRING",""],["4","SINGLE QUOTED STRING",""],["5","KEYWORD","instre1"],["6","TRIPLE QUOTES",""],["7","TRIPLE DOUBLE QUOTES",""],["8","CLASS NAME DEFINITION",""],["9","FUNCTION OR METHOD NAME DEFINITION",""],["10","OPERATORS",""],["11","IDENTIFIERS",""],["12","COMMENT-BLOCKS",""],["13","END OF LINE WHERE STRING IS NOT CLOSED",""],["14","HIGHLIGHTED IDENTIFIERS",""],["15","DECORATORS",""]]],["nncrontab","nnCron",[["0","WHITE SPACE",""],["1","COMMENT",""],["2","TASK START/END",""],["3","SECTION KEYWORDS","instre1"],["4","KEYWORDS","instre2"],["5","MODIFICATORS","type1"],["6","ASTERISK",""],["7","NUMBER",""],["8","DOUBLE QUOTED STRING",""],["9","ENVIRONMENT VARIABLE",""],["10","IDENTIFIER",""]]],["oscript","OScript",[["0","DEFAULT TEXT STYLE",""],["1","SINGLE-LINE COMMENT",""],["2","MULTI-LINE COMMENT",""],["3","#IFDEF DOC AND #ENDIF",""],["4","PREPROCESSOR DIRECTIVE",""],["5","NUMBER",""],["6","STRING SINGLE QUOTES",""],["7","STRING DOUBLE QUOTES",""],["8","CONSTANT LITERAL","instre2"],["9","IDENTIFIER",""],["10","SERVER-GLOBAL VARIABLE (PREFIXED BY $)",""],["11","LANGUAGE NATIVE KEYWORD OR RESERVED WORD","instre1"],["12","OPERATOR; EITHER SYMBOLIC OR LITERAL","type1"],["13","LABEL TO JUMP TO WITH THE GOTO STATEMENT",""],["14","TYPE","type2"],["15","FUNCTION","type3"],["16","STATIC BUILT-IN OBJECT","type4"],["17","OBJECT PROPERTY",""],["18","OBJECT METHOD",""]]],["objc","Objective-C",[["19","DIRECTIVE","instre2"],["11","DEFAULT",""],["20","QUALIFIER","type2"],["9","PREPROCESSOR",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""]]],["pascal","Pascal",[["0","DEFAULT",""],["1","IDENTIFIER",""],["2","COMMENT",""],["3","COMMENT LINE",""],["4","COMMENT DOC",""],["5","PREPROCESSOR",""],["6","PREPROCESSOR2",""],["7","NUMBER",""],["8","HEX NUMBER",""],["9","INSTRUCTION WORD","instre1"],["10","STRING",""],["12","CHARACTER",""],["13","OPERATOR",""],["14","ASM",""],["15","MULTILINESTRING",""]]],["perl","Perl",[["0","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["4","NUMBER",""],["10","OPERATOR",""],["11","IDENTIFIER",""],["12","SCALAR",""],["13","ARRAY",""],["14","HASH",""],["15","SYMBOL TABLE",""],["40","PROTOTYPE",""],["2","COMMENT LINE",""],["7","STRING SINGLEQUOTE",""],["6","STRING DOUBLEQUOTE",""],["20","STRING BACKTICKS",""],["26","STRING Q",""],["27","STRING QQ",""],["28","STRING QX",""],["29","STRING QR",""],["30","STRING QW",""],["17","REGEX MATCH",""],["18","REGEX SUBSTITUTION",""],["44","TRANSLATION",""],["22","HEREDOC DELIMITER",""],["23","HEREDOC SINGLEQUOTE",""],["24","HEREDOC DOUBLEQUOTE",""],["25","HEREDOC BACKTICK",""],["43","VAR IN STRING",""],["54","VAR IN REGEX",""],["55","VAR IN REGEX SUBSTITUTION",""],["57","VAR IN BACKTICKS",""],["61","VAR IN HEREDOC DOUBLEQUOTE",""],["62","VAR IN HEREDOC BACKTICK",""],["64","VAR IN STRING QQ",""],["65","VAR IN STRING QX",""],["66","VAR IN STRING QR",""],["41","FORMAT IDENTIFIER",""],["42","FORMAT BODY",""],["21","DATA SECTION",""],["3","POD",""],["31","POD VERBATIM",""],["1","ERROR",""]]],["php","PHP",[["18","QUESTION MARK",""],["118","DEFAULT",""],["119","STRING",""],["104","COMPLEX VARIABLE",""],["126","STRING VARIABLE",""],["120","SIMPLE STRING",""],["121","KEYWORDS","instre1"],["122","NUMBER",""],["123","VARIABLE",""],["124","COMMENT",""],["125","COMMENT LINE",""],["127","OPERATOR",""],["213","PREDEFINED","substyle6"],["214","FUNCS AND METHODS 1","substyle7"],["215","FUNCS AND METHODS 2","substyle8"],["208","USER KEYWORDS 1","substyle1"],["209","USER KEYWORDS 2","substyle2"],["210","USER KEYWORDS 3","substyle3"],["211","USER KEYWORDS 4","substyle4"],["212","USER KEYWORDS 5","substyle5"]]],["postscript","Postscript",[["0","DEFAULT",""],["1","COMMENT",""],["2","DSC COMMENT",""],["3","DSC VALUE",""],["4","NUMBER",""],["5","Name",""],["6","INSTRUCTION","instre1"],["7","LITERAL",""],["8","IMMEVAL",""],["9","PAREN ARRAY",""],["10","PAREN DICT",""],["11","PAREN PROC",""],["12","TEXT",""],["13","HEX STRING",""],["14","BASE85 STRING",""],["15","BAD STRING CHAR",""]]],["powershell","PowerShell",[["0","DEFAULT",""],["1","COMMENT",""],["2","STRING",""],["3","CHARACTER",""],["4","NUMBER",""],["5","VARIABLE",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["8","INSTRUCTION WORD","instre1"],["9","CMDLET","instre2"],["10","ALIAS","type1"],["11","FUNCTION","type2"],["12","USER KEYWORDS","type3"],["13","COMMENT STREAM",""],["14","HERE STRING",""],["15","HERE CHARACTER",""],["16","COMMENT DOC KEYWORD","type4"]]],["props","Properties file",[["0","DEFAULT",""],["1","COMMENT",""],["2","SECTION",""],["3","ASSIGNMENT",""],["4","DEFVAL",""],["5","KEY",""]]],["purebasic","PureBasic",[["0","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","KEYWORD1","instre1"],["4","STRING",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["10","KEYWORD2","instre2"],["11","KEYWORD3","type1"],["12","KEYWORD4","type2"],["13","CONSTANT",""],["15","LABEL",""],["16","ERROR",""],["17","HEXNUMBER",""],["18","BINNUMBER",""]]],["python","Python",[["0","DEFAULT",""],["1","COMMENT LINE",""],["2","NUMBER",""],["3","STRING",""],["4","CHARACTER",""],["5","KEYWORDS","instre1"],["6","TRIPLE",""],["7","TRIPLE DOUBLE",""],["8","CLASS NAME",""],["9","DEF NAME",""],["10","OPERATOR",""],["11","IDENTIFIER",""],["12","COMMENT BLOCK",""],["14","BUILTINS","instre2"],["15","DECORATOR",""],["20","ATTRIBUTE",""],["16","F STRING",""],["17","F CHARACTER",""],["18","F TRIPLE",""],["19","F TRIPLEDOUBLE",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["r","R",[["0","DEFAULT",""],["1","COMMENT",""],["2","INSTRUCTION WORD","instre1"],["3","BASE WORD","instre2"],["4","KEYWORD","type1"],["5","NUMBER",""],["6","STRING",""],["7","STRING2",""],["8","OPERATOR",""],["9","IDENTIFIER",""],["10","INFIX",""],["11","INFIXEOL",""],["12","BACKTICKS",""],["13","RAWSTRING",""],["14","RAWSTRING2",""],["15","ESCAPESEQUENCE",""]]],["raku","Raku",[["0","DEFAULT",""],["1","ERROR",""],["2","COMMENT LINE",""],["3","COMMENT EMBED",""],["4","POD",""],["5","CHARACTER",""],["6","HEREDOC Q",""],["7","HEREDOC QQ",""],["8","STRING",""],["9","STRING Q",""],["10","STRING QQ",""],["11","STRING Q_LANG",""],["12","STRING VAR",""],["13","REGEX",""],["14","REGEX VAR",""],["15","ADVERB","type5"],["16","NUMBER",""],["17","PREPROCESSOR",""],["18","OPERATOR",""],["19","INSTRUCTION WORD","instre1"],["20","FUNCTION","instre2"],["21","IDENTIFIER",""],["22","TYPEDEF","type1"],["23","MU",""],["24","POSITIONAL",""],["25","ASSOCIATIVE",""],["26","CALLABLE",""],["27","GRAMMAR",""],["28","CLASS",""]]],["rc","Resource file",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD",""],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["23","PREPROCESSOR COMMENT",""],["24","PREPROCESSOR COMMENT DOC",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["rebol","REBOL",[["32","DEFAULT",""],["0","ANY OTHER TEXT",""],["1","LINE COMMENT",""],["2","BLOCK COMMENT",""],["3","PREFACE",""],["4","OPERATORS",""],["5","CHARACTERS",""],["6","STRING WITH QUOTES",""],["7","STRING WITH BRACES",""],["8","NUMBER",""],["9","PAIR ( 800X600 )",""],["10","TUPLE ( 127.0.0.1 )",""],["11","BINARY ( 16#{1A803F59} )",""],["12","MONEY",""],["13","ISSUE { #123-CD-456 }",""],["14","TAG { <TITLE HEIGHT=100> }",""],["15","FILE { %/C/WINNT/SOME.DLL }",""],["16","EMAIL { JOE@MAIL.DOM }",""],["17","URL { FTP://THERE.DOM }",""],["18","DATE { 17-FEB-2004 1/3/99 }",""],["19","TIME { 12:30 11:22:59 01:59:59.123 }",""],["20","IDENTIFIERS",""],["21","KEYWORD (ALL)","instre1"],["22","KEYWORD (TEST FUNCTIONS)","instre2"],["23","KEYWORD (DATATYPES)","type1"],["24","KEYWORD 4","type2"],["25","KEYWORD 5","type3"],["26","KEYWORD 6","type4"],["27","KEYWORD 7","type5"]]],["registry","Registry",[["32","DEFAULT STYLE",""],["0","DEFAULT",""],["1","COMMENT",""],["2","VALUE NAME",""],["3","STRING",""],["4","HEX DIGIT",""],["5","VALUE TYPE",""],["6","ADDED KEY",""],["7","REMOVED KEY",""],["8","ESCAPED CHARACTERS IN STRINGS",""],["9","GUID IN KEY PATH",""],["10","GUID IN STRING",""],["11","PARAMETER",""],["12","OPERATORS",""]]],["ruby","Ruby",[["0","DEFAULT",""],["1","ERROR",""],["2","COMMENT LINE",""],["3","POD",""],["4","NUMBER",""],["5","INSTRUCTION","instre1"],["6","STRING",""],["7","CHARACTER",""],["8","CLASS NAME",""],["9","DEF NAME",""],["10","OPERATOR",""],["11","IDENTIFIER",""],["12","REGEX",""],["13","GLOBAL",""],["14","SYMBOL",""],["15","MODULE NAME",""],["16","INSTANCE VAR",""],["17","CLASS VAR",""],["18","BACKTICKS",""],["19","DATA SECTION",""],["24","STRING Q",""]]],["rust","Rust",[["32","DEFAULT",""],["0","WHITESPACE",""],["1","BLOCK COMMENT",""],["2","LINE COMMENT",""],["3","BLOCK DOC COMMENT",""],["4","LINE DOC COMMENT",""],["5","NUMBER",""],["6","KEYWORDS 1","instre1"],["7","KEYWORDS 2","instre2"],["8","KEYWORDS 3","type1"],["9","KEYWORDS 4","type2"],["10","KEYWORDS 5","type3"],["11","KEYWORDS 6","type4"],["12","KEYWORDS 7","type5"],["13","REGULAR STRING",""],["14","RAW STRING",""],["15","CHARACTER",""],["16","OPERATOR",""],["17","IDENTIFIER",""],["18","LIFETIME",""],["19","MACRO",""],["20","LEXICAL ERROR",""],["21","BYTE STRING",""],["22","RAW BYTE STRING",""],["23","BYTE CHARACTER",""],["24","C STRING",""],["25","RAW C STRING",""]]],["sas","SAS",[["0","DEFAULT",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT BLOCK",""],["4","NUMBER",""],["5","OPERATOR",""],["6","IDENTIFIER",""],["7","STRING",""],["11","MACRO",""],["12","MACRO KEYWORD","instre1"],["14","MACRO FUNCTION","type1"],["13","FUNCTION","instre2"],["15","STATEMENT","type2"]]],["scheme","Scheme",[["0","DEFAULT",""],["1","COMMENT LINE",""],["2","NUMBER",""],["3","FUNCTION WORD","instre1"],["4","FUNCTION WORD2","instre2"],["5","SYMBOL",""],["6","STRING",""],["9","IDENTIFIER",""],["10","OPERATOR","type1"],["11","SPECIAL",""],["12","COMMENT",""]]],["smalltalk","Smalltalk",[["0","DEFAULT",""],["1","STRING",""],["2","NUMBER",""],["3","COMMENT",""],["4","SYMBOL",""],["5","BINARY",""],["6","BOOL",""],["7","SELF",""],["8","SUPER",""],["9","NIL",""],["10","GLOBAL",""],["11","RETURN",""],["12","SPECIAL",""],["13","KWS END",""],["14","ASSIGN",""],["15","CHARACTER",""],["16","SPECIAL SELECTOR",""]]],["spice","SPICE",[["0","DEFAULT",""],["1","IDENTIFIERS",""],["2","KEYWORD","instre1"],["3","KEYWORD2","instre2"],["4","KEYWORD3","type1"],["5","NUMBER",""],["6","OPERATORS (DELIMITERS)",""],["7","VALUE",""],["8","COMMENT",""]]],["sql","SQL",[["5","KEYWORD","instre1"],["16","USER1","instre2"],["19","KEYWORD2","type3"],["4","NUMBER",""],["6","STRING",""],["7","STRING2",""],["10","OPERATOR",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["24","Q OPERATOR",""]]],["srec","S-Record",[["0","DEFAULT",""],["1","RECSTART",""],["2","RECTYPE",""],["3","RECTYPE_UNKNOWN",""],["4","BYTECOUNT",""],["5","BYTECOUNT_WRONG",""],["6","NOADDRESS",""],["7","DATAADDRESS",""],["8","RECCOUNT",""],["9","STARTADDRESS",""],["10","ADDRESSFIELD_UNKNOWN",""],["12","DATA_ODD",""],["13","DATA_EVEN",""],["14","DATA_UNKNOWN",""],["15","DATA_EMPTY",""],["16","CHECKSUM",""],["17","CHECKSUM_WRONG",""],["18","GARBAGE",""]]],["swift","Swift",[["9","PREPROCESSOR",""],["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["4","NUMBER",""],["6","STRING",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["23","PREPROCESSOR COMMENT",""],["24","PREPROCESSOR COMMENT DOC",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["tcl","TCL",[["0","DEFAULT",""],["10","MODIFIER",""],["11","EXPAND","type3"],["12","TCL KEYWORD","instre1"],["13","iTCL KEYWORD","type1"],["14","TK KEYWORD","instre2"],["15","TK COMMAND","type2"],["3","NUMBER",""],["9","SUB BRACE",""],["8","SUBSTITUTION",""],["6","OPERATOR",""],["7","IDENTIFIER",""],["4","WORD IN QUOTE",""],["5","IN QUOTE",""],["1","COMMENT",""],["2","COMMENT LINE",""],["20","COMMENT BOX",""],["21","BLOCK COMMENT",""],["16","USER1","type4"],["17","USER2","type5"],["18","USER3","type6"],["19","USER4","type7"]]],["tehex","Tektronix extended HEX",[["0","DEFAULT",""],["1","RECSTART",""],["2","RECTYPE",""],["3","RECTYPE_UNKNOWN",""],["4","BYTECOUNT",""],["5","BYTECOUNT_WRONG",""],["7","DATAADDRESS",""],["9","STARTADDRESS",""],["10","ADDRESSFIELD_UNKNOWN",""],["12","DATA_ODD",""],["13","DATA_EVEN",""],["16","CHECKSUM",""],["17","CHECKSUM_WRONG",""],["18","GARBAGE",""]]],["tex","TeX",[["0","DEFAULT",""],["1","SPECIAL",""],["2","GROUP",""],["3","SYMBOL",""],["4","COMMAND",""],["5","TEXT",""]]],["toml","TOML",[["0","DEFAULT",""],["1","COMMENT",""],["2","IDENTIFIER",""],["3","KEYWORD","instre1"],["4","NUMBER",""],["5","TABLE",""],["6","KEY",""],["7","ERROR",""],["8","OPERATOR",""],["9","STRING SQ",""],["10","STRING DQ",""],["11","TRIPLE STRING SQ",""],["12","TRIPLE STRING DQ",""],["13","ESCAPE CHAR",""],["14","DATETIME",""]]],["txt2tags","txt2tags",[["0","DEFAULT",""],["1","SPECIAL",""],["2","STRONG",""],["3","STRONG 2 (NOT USED)",""],["4","EM1 (ITALIC)",""],["5","EM2 (UNDERLINE)",""],["6","H1",""],["7","H2",""],["8","H3",""],["9","H4",""],["10","H5",""],["11","H6",""],["12","PRECHAR (NOT USED)",""],["13","ULIST",""],["14","OLIST",""],["15","BLOCKQUOTE",""],["16","STRIKEOUT",""],["17","HRULE",""],["18","LINK",""],["19","CODE",""],["20","CODE2",""],["21","CODEBLOCK",""],["22","COMMENT",""],["23","OPTION",""],["24","PREPROC",""],["25","POSTPROC",""]]],["typescript","TypeScript",[["11","DEFAULT",""],["5","INSTRUCTION WORD","instre1"],["16","TYPE WORD","type1"],["19","WINDOW INSTRUCTION",""],["4","NUMBER",""],["6","STRING",""],["20","STRING RAW",""],["7","CHARACTER",""],["10","OPERATOR",""],["13","VERBATIM",""],["14","REGEX",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT DOC",""],["15","COMMENT LINE DOC",""],["17","COMMENT DOC KEYWORD",""],["18","COMMENT DOC KEYWORD ERROR",""],["128","USER KEYWORDS 1","substyle1"],["129","USER KEYWORDS 2","substyle2"],["130","USER KEYWORDS 3","substyle3"],["131","USER KEYWORDS 4","substyle4"],["132","USER KEYWORDS 5","substyle5"],["133","USER KEYWORDS 6","substyle6"],["134","USER KEYWORDS 7","substyle7"],["135","USER KEYWORDS 8","substyle8"]]],["vb","VB / VBS",[["7","DEFAULT",""],["1","COMMENT",""],["2","NUMBER",""],["3","WORD","instre1"],["4","STRING",""],["5","PREPROCESSOR",""],["6","OPERATOR",""],["8","DATE",""]]],["verilog","Verilog",[["0","DEFAULT",""],["11","IDENTIFIER",""],["5","INSTRUCTION WORD","instre1"],["7","KEYWORD","type1"],["10","OPERATOR",""],["4","NUMBER",""],["9","PREPROCESSOR",""],["6","STRING",""],["1","COMMENT",""],["2","COMMENT LINE",""],["3","COMMENT LINE BANG",""],["19","USER",""]]],["vhdl","VHDL",[["0","DEFAULT",""],["1","COMMENT",""],["2","COMMENT LINE BANG",""],["15","COMMENT BLOCK",""],["3","NUMBER",""],["4","STRING",""],["7","STRING EOL",""],["5","OPERATOR",""],["6","IDENTIFIER",""],["8","INSTRUCTION","instre1"],["9","STD OPERATOR","instre2"],["10","ATTRIBUTE","type1"],["11","STD FUNCTION","type2"],["12","STD PACKAGE","type3"],["13","STD TYPE","type4"],["14","USER DEFINE","type5"]]],["visualprolog","Visual Prolog",[["0","DEFAULT",""],["1","MAJOR","instre1"],["2","MINOR","instre2"],["3","DIRECTIVE","type1"],["4","COMMENT BLOCK",""],["5","COMMENT LINE",""],["6","COMMENT KEY","type2"],["7","COMMENT KEY ERROR",""],["8","IDENTIFIER",""],["9","VARIABLE",""],["10","ANONYMOUS",""],["11","NUMBER",""],["12","OPERATOR",""],["13","CHARACTER",""],["14","CHARACTER TOO MANY",""],["15","CHARACTER ESCAPE ERROR",""],["16","STRING",""],["17","STRING ESCAPE",""],["18","STRING ESCAPE ERROR",""],["19","STRING EOL OPEN",""],["20","STRING VERBATIM",""],["21","STRING VERBATIM SPECIAL",""],["22","STRING VERBATIM EOL",""]]],["xml","XML",[["12","XML START",""],["13","XML END",""],["0","DEFAULT",""],["9","COMMENT",""],["5","NUMBER",""],["6","DOUBLE STRING",""],["7","SINGLE STRING",""],["1","TAG",""],["11","TAG END",""],["2","TAG UNKNOWN",""],["3","ATTRIBUTE",""],["4","ATTRIBUTE UNKNOWN",""],["21","SGML DEFAULT",""],["22","SGML COMMAND","instre1"],["23","SGML 1ST PARAM",""],["24","SGML DOUBLESTRING",""],["25","SGML SIMPLESTRING",""],["31","SGML BLOCK DEFAULT",""],["17","CDATA",""],["10","ENTITY",""],["192","USER ATTRIBUTES 1","substyle1"],["193","USER ATTRIBUTES 2","substyle2"],["194","USER ATTRIBUTES 3","substyle3"],["195","USER ATTRIBUTES 4","substyle4"],["196","USER ATTRIBUTES 5","substyle5"],["197","USER ATTRIBUTES 6","substyle6"],["198","USER ATTRIBUTES 7","substyle7"],["199","USER ATTRIBUTES 8","substyle8"]]],["yaml","YAML",[["0","DEFAULT",""],["2","IDENTIFIER",""],["1","COMMENT",""],["3","INSTRUCTION WORD","instre1"],["4","NUMBER",""],["5","REFERENCE",""],["6","DOCUMENT",""],["7","TEXT",""],["8","ERROR",""]]],["searchResult","Search result",[["1","Search Header",""],["2","File Header",""],["3","Line Number",""],["4","Hit Word",""],["6","Current line background colour",""]]]];
const NPP_WIDGETS = [["32","Default Style"],["37","Indent guideline style"],["34","Brace highlight style"],["35","Bad brace colour"],["0","Current line background colour"],["0","Selected text colour"],["0","Multi-selected text color"],["0","Caret colour"],["0","Multi-edit carets color"],["0","Edge colour"],["33","Line number margin"],["0","Bookmark margin"],["0","Change History margin"],["0","Change History modified"],["0","Change History revert modified"],["0","Change History revert origin"],["0","Change History saved"],["0","Fold"],["0","Fold active"],["0","Fold margin"],["0","White space symbol"],["29","Smart Highlighting"],["31","Find Mark Style"],["0","Find status: Not found"],["0","Find status: Message"],["0","Find status: Search end reached"],["25","Mark Style 1"],["24","Mark Style 2"],["23","Mark Style 3"],["22","Mark Style 4"],["21","Mark Style 5"],["28","Incremental highlight all"],["27","Tags match highlighting"],["26","Tags attribute"],["0","Active tab focused indicator"],["0","Active tab unfocused indicator"],["0","Active tab text"],["0","Inactive tabs"],["0","Tab color 1"],["0","Tab color 2"],["0","Tab color 3"],["0","Tab color 4"],["0","Tab color 5"],["0","Tab color dark mode 1"],["0","Tab color dark mode 2"],["0","Tab color dark mode 3"],["0","Tab color dark mode 4"],["0","Tab color dark mode 5"],["0","URL hovered"],["0","Document map"],["0","EOL custom color"],["0","Non-printing characters custom color"],["0","Global override"]];
