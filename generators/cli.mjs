import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { homeUrl } from './repositories.mjs';

const header = p => `# Kokedera ${p.name} — generated from the shared Kokedera palette\n`;
const entries = obj => Object.entries(obj).map(([k,v])=>`${k} = ${JSON.stringify(v)}`).join('\n');
const rgb = hex => hex.slice(1).match(/../g).map(x=>parseInt(x,16)).join(' ');
const xml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
// Native PNG palette preview so every independently installable Yazi flavor
// contains its required preview. This is a swatch image, not a fake screenshot.
function palettePreview(p) {
  const width = 640, height = 240;
  const toRgb = hex => hex.slice(1).match(/../g).map(s => parseInt(s, 16));
  const background = toRgb(p.terminal.background);
  const pixels = Buffer.alloc((width * 3 + 1) * height);
  const swatches = [p.terminal.background, p.terminal.foreground, p.terminal.cursor,
    p.terminal.selectionBackground, ...p.terminal.ansi].map(toRgb);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const row = y >= 32 && y < 96 ? 0 : y >= 112 && y < 176 ? 1 : -1;
    const col = Math.floor((x - 20) / 60);
    const color = row >= 0 && col >= 0 && col < 10 && (x - 20) % 60 < 52 ? swatches[row * 10 + col] : background;
    const at = y * (width * 3 + 1) + 1 + x * 3;
    pixels[at] = color[0]; pixels[at + 1] = color[1]; pixels[at + 2] = color[2];
  }
  const crc32 = bytes => {
    let crc = 0xffffffff;
    for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
    return (crc ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, bytes) => {
    const payload = Buffer.concat([Buffer.from(type), bytes]);
    const length = Buffer.alloc(4), crc = Buffer.alloc(4);
    length.writeUInt32BE(bytes.length); crc.writeUInt32BE(crc32(payload));
    return Buffer.concat([length, payload, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr),
    chunk('tEXt', Buffer.from(`Description\0Kokedera ${p.name}: background, foreground, cursor, selection, ANSI 0-15 palette swatches`)),
    chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
function plist(value) {
  if (Array.isArray(value)) return `<array>${value.map(plist).join('')}</array>`;
  if (typeof value === 'object') return `<dict>${Object.entries(value).map(([k,v])=>`<key>${xml(k)}</key>${plist(v)}`).join('')}</dict>`;
  return `<string>${xml(value)}</string>`;
}
function textmate(p) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">${plist({name:`Kokedera ${p.name}`,settings:[{settings:{background:p.tokens.bgPage,foreground:p.tokens.textPrimary,caret:p.terminal.cursor,selection:p.terminal.selectionBackground,lineHighlight:p.tokens.bgSurface}},...p.textmate.map(r=>({...r,scope:Array.isArray(r.scope)?r.scope.join(', '):r.scope}))]})}</plist>\n`;
}
function starship(p) {
  const colors = {moss:p.tokens.accentPrimary,fern:p.tokens.bamboo,lantern:p.tokens.lantern,
    stone:p.tokens.textMuted,error:p.tokens.torii,stream:p.tokens.stream,special:p.tokens.wisteria};
  return header(p)+`"$schema" = "https://starship.rs/config-schema.json"\npalette = "kokedera_${p.id}"\nformat = "$directory$git_branch$git_status$cmd_duration$line_break$character"\n\n[palettes.kokedera_${p.id}]\n${entries(colors)}\n\n[directory]\nstyle = "bold moss"\nread_only_style = "error"\n\n[git_branch]\nstyle = "fern"\nsymbol = "git "\n\n[git_status]\nstyle = "special"\n\n[cmd_duration]\nstyle = "lantern"\n\n[character]\nsuccess_symbol = "[>](bold moss)"\nerror_symbol = "[>](bold error)"\nvimcmd_symbol = "[<](bold stream)"\n`;
}
function tmux(p) {
  const t=p.tokens;
  const opts={
    'status-style':`fg=${t.textPrimary},bg=${t.bgSurface}`,
    'status-left-style':`fg=${t.accentLime},bg=${t.bgSurface},bold`,
    'status-right-style':`fg=${t.textMuted},bg=${t.bgSurface}`,
    'message-style':`fg=${t.textPrimary},bg=${t.bgElevated}`,
    'message-command-style':`fg=${t.lantern},bg=${t.bgElevated}`,
    'pane-border-style':`fg=${t.borderMain}`,
    'pane-active-border-style':`fg=${t.accentPrimary}`,
    'display-panes-colour':t.textMuted,'display-panes-active-colour':t.accentLime,
    'clock-mode-colour':t.accentLime,
    'mode-style':`fg=${t.textPrimary},bg=${t.bgActive}`,
    'window-status-style':`fg=${t.textMuted},bg=${t.bgSurface}`,
    'window-status-current-style':`fg=${t.textPrimary},bg=${t.bgActive},bold`,
    'window-status-activity-style':`fg=${t.lantern},bg=${t.bgSurface}`,
    'window-status-bell-style':`fg=${t.torii},bg=${t.bgSurface},bold`,
  };
  return header(p)+Object.entries(opts).map(([k,v])=>`set-option -g ${k} '${v}'`).join('\n')+'\n';
}
function zellij(p) {
  const t=p.tokens;
  const blocks=['text_unselected','text_selected','ribbon_selected','ribbon_unselected','table_title',
    'table_cell_selected','table_cell_unselected','list_selected','list_unselected','frame_selected',
    'frame_unselected','frame_highlight','exit_code_success','exit_code_error'];
  const body=blocks.map(name=>{
    const selected=name.endsWith('_selected');
    const base=name==='exit_code_error'?t.torii:name==='frame_unselected'?t.borderMain:
      name==='frame_highlight'?t.lantern:name==='exit_code_success'||name==='frame_selected'?t.accentLime:t.textPrimary;
    const fields={base,background:selected?t.bgActive:t.bgPage,emphasis_0:t.lantern,emphasis_1:t.stream,emphasis_2:t.accentLime,emphasis_3:t.wisteria};
    return `        ${name} {\n${Object.entries(fields).map(([k,v])=>`            ${k} ${rgb(v)}`).join('\n')}\n        }`;
  }).join('\n');
  return `// Kokedera ${p.name}\nthemes {\n    kokedera-${p.id} {\n${body}\n        multiplayer_user_colors {\n${[t.accentLime,t.lantern,t.stream,t.wisteria,t.torii,t.bamboo,t.cedar,t.bronze,t.sage,t.gold].map((c,i)=>`            player_${i+1} ${rgb(c)}`).join('\n')}\n        }\n    }\n}\n`;
}
function lazygit(p) {
  const t=p.tokens;
  const styles={activeBorderColor:[t.accentPrimary,'bold'],inactiveBorderColor:[t.borderMain],
    searchingActiveBorderColor:[t.lantern,'bold'],optionsTextColor:[t.stream],
    selectedLineBgColor:[t.bgActive],inactiveViewSelectedLineBgColor:[t.bgSurface],
    cherryPickedCommitFgColor:[t.wisteria],cherryPickedCommitBgColor:[t.bgHover],
    markedBaseCommitFgColor:[t.lantern],markedBaseCommitBgColor:[t.bgHover],
    unstagedChangesColor:[t.torii],defaultFgColor:[t.textPrimary]};
  return header(p)+'# yaml-language-server: $schema=https://raw.githubusercontent.com/jesseduffield/lazygit/master/schema/config.json\ngui:\n  theme:\n'+Object.entries(styles).map(([k,v])=>`    ${k}: ${JSON.stringify(v)}`).join('\n')+'\n';
}
function fzfColors(p) {
  const t=p.tokens;
  return Object.entries({fg:t.textPrimary,bg:t.bgPage,hl:t.accentLime,'fg+':t.textPrimary,'bg+':t.bgActive,'hl+':t.accentFirefly,
    info:t.textMuted,prompt:t.accentPrimary,pointer:t.lantern,marker:t.wisteria,spinner:t.stream,header:t.bamboo,
    border:t.borderMain,separator:t.borderSubtle,scrollbar:t.textDim,label:t.textMuted,query:t.textPrimary,
    'preview-fg':t.textPrimary,'preview-bg':t.bgPage,'preview-border':t.borderMain}).map(([k,v])=>`${k}:${v}`).join(',');
}
function btop(p) {
  const t=p.tokens;
  const colors={main_bg:t.bgPage,main_fg:t.textPrimary,title:t.accentLime,hi_fg:t.lantern,
    selected_bg:t.bgActive,selected_fg:t.textPrimary,inactive_fg:t.textDim,graph_text:t.textPrimary,
    meter_bg:t.bgSurface,proc_misc:t.wisteria,cpu_box:t.accentPrimary,mem_box:t.bamboo,net_box:t.stream,
    proc_box:t.wisteria,div_line:t.borderMain,proc_pause_bg:t.bgSurface,
    proc_banner_fg:t.textPrimary,proc_banner_bg:t.bgSurface,proc_follow_bg:t.bgActive,
    followed_bg:t.bgActive,followed_fg:t.textPrimary};
  for (const [prefix,a,b,c] of [['temp',t.stream,t.gold,t.torii],['cpu',t.bamboo,t.gold,t.torii],
    ['free',t.bgHover,t.cedar,t.accentLime],['cached',t.bgHover,t.wisteria,t.stream],
    ['available',t.bgHover,t.cedar,t.bamboo],['used',t.bamboo,t.gold,t.torii],
    ['download',t.bgHover,t.cedar,t.stream],['upload',t.bgHover,t.bronze,t.lantern],
    ['process',t.bamboo,t.stream,t.wisteria]]) {
    colors[`${prefix}_start`]=a;colors[`${prefix}_mid`]=b;colors[`${prefix}_end`]=c;
  }
  return header(p)+Object.entries(colors).map(([k,v])=>`theme[${k}]="${v}"`).join('\n')+'\n';
}
function yazi(p) {
  const t=p.tokens;
  const sections={app:{overall:{bg:t.bgPage}},mgr:{cwd:{fg:t.accentLime},
    find_keyword:{fg:t.lantern,bold:true,underline:true},find_position:{fg:t.wisteria},
    symlink_target:{fg:t.stream,italic:true},marker_copied:{fg:t.bamboo,bg:t.bamboo},
    marker_cut:{fg:t.torii,bg:t.torii},marker_marked:{fg:t.wisteria,bg:t.wisteria},marker_selected:{fg:t.lantern,bg:t.lantern},
    count_copied:{fg:t.textPrimary,bg:t.bgActive},count_cut:{fg:t.torii,bg:t.bgSurface},count_selected:{fg:t.lantern,bg:t.bgSurface},
    border_style:{fg:t.borderMain}},tabs:{active:{fg:t.textPrimary,bg:t.bgActive,bold:true},inactive:{fg:t.textMuted,bg:t.bgSurface}},
    mode:{normal_main:{fg:t.textPrimary,bg:t.bgActive,bold:true},normal_alt:{fg:t.accentLime,bg:t.bgSurface},
      select_main:{fg:t.lantern,bg:t.bgActive,bold:true},select_alt:{fg:t.lantern,bg:t.bgSurface},
      unset_main:{fg:t.torii,bg:t.bgActive,bold:true},unset_alt:{fg:t.torii,bg:t.bgSurface}},
    indicator:{parent:{fg:t.textPrimary,bg:t.bgHover},current:{fg:t.textPrimary,bg:t.bgActive,bold:true},preview:{fg:t.textPrimary,bg:t.bgHover}},
    status:{overall:{fg:t.textPrimary,bg:t.bgSurface},perm_sep:{fg:t.textDim},perm_type:{fg:t.bamboo},perm_read:{fg:t.lantern},perm_write:{fg:t.torii},perm_exec:{fg:t.stream},
      progress_label:{fg:t.textPrimary,bold:true},progress_normal:{fg:t.accentPrimary,bg:t.bgSurface},progress_error:{fg:t.torii,bg:t.bgSurface}},
    which:{border:{fg:t.borderMain},cand:{fg:t.accentLime},rest:{fg:t.textMuted},desc:{fg:t.lantern},separator_style:{fg:t.borderMain}},
    confirm:{border:{fg:t.borderMain},title:{fg:t.accentLime},body:{fg:t.textPrimary},list:{fg:t.textPrimary},btn_yes:{fg:t.textPrimary,bg:t.bgActive,bold:true},btn_no:{fg:t.textMuted,bg:t.bgSurface}},
    spot:{border:{fg:t.borderMain},title:{fg:t.accentLime},tbl_col:{fg:t.stream},tbl_cell:{fg:t.textPrimary,bg:t.bgActive}},
    notify:{title_info:{fg:t.stream},title_warn:{fg:t.gold},title_error:{fg:t.torii}},
    pick:{border:{fg:t.borderMain},active:{fg:t.accentLime,bold:true},inactive:{fg:t.textPrimary}},
    input:{border:{fg:t.borderMain},title:{fg:t.accentLime},value:{fg:t.textPrimary},selected:{fg:t.textPrimary,bg:t.bgActive}},
    cmp:{border:{fg:t.borderMain},active:{fg:t.textPrimary,bg:t.bgActive},inactive:{fg:t.textPrimary}},
    tasks:{border:{fg:t.borderMain},title:{fg:t.accentLime},hovered:{fg:t.textPrimary,bg:t.bgActive}},
    help:{border:{fg:t.borderMain},chord:{fg:t.accentLime},action:{fg:t.textPrimary},hovered:{fg:t.textPrimary,bg:t.bgActive,bold:true}},
  };
  const inline=obj=>'{ '+Object.entries(obj).map(([k,v])=>`${k} = ${JSON.stringify(v)}`).join(', ')+' }';
  return header(p)+'# :schema https://yazi-rs.github.io/schemas/theme.json\n'+Object.entries(sections).map(([name,values])=>`\n[${name}]\n${Object.entries(values).map(([k,v])=>`${k} = ${inline(v)}`).join('\n')}`).join('\n')+
    `\n\n[filetype]\nrules = [\n  { url = "*/", fg = "${t.bamboo}", bold = true },\n  { mime = "image/*", fg = "${t.lantern}" },\n  { mime = "{audio,video}/*", fg = "${t.wisteria}" },\n  { mime = "application/{zip,gzip,x-tar,x-7z-compressed}", fg = "${t.bronze}" },\n  { url = "*", is = "orphan", fg = "${t.torii}" },\n  { url = "*", is = "exec", fg = "${t.accentLime}" },\n  { url = "*", fg = "${t.textPrimary}" },\n]\n`;
}
export function generate(palettes) {
  const files={};
  const license = readFileSync(new URL('../LICENSE', import.meta.url), 'utf8');
  for (const p of palettes) {
    const base=`kokedera-${p.id}`;
    files[`starship/${base}.toml`]=starship(p);
    files[`tmux/${base}.conf`]=tmux(p);
    files[`zellij/${base}.kdl`]=zellij(p);
    files[`lazygit/${base}.yml`]=lazygit(p);
    const colors=fzfColors(p);
    files[`fzf/${base}.sh`]=header(p)+`export FZF_DEFAULT_OPTS="\${FZF_DEFAULT_OPTS-} --color=${colors}"\n`;
    files[`fzf/${base}.fish`]=header(p)+`set -gx FZF_DEFAULT_OPTS "$FZF_DEFAULT_OPTS --color=${colors}"\n`;
    files[`fzf/${base}.ps1`]=header(p)+`$env:FZF_DEFAULT_OPTS = "$env:FZF_DEFAULT_OPTS --color=${colors}"\n`;
    files[`btop/${base}.theme`]=btop(p);
    files[`bat/Kokedera ${p.name}.tmTheme`]=textmate(p);
    files[`yazi/${base}.yazi/flavor.toml`]=yazi(p);
    files[`yazi/${base}.yazi/tmtheme.xml`]=textmate(p);
    files[`yazi/${base}.yazi/README.md`]=`# Kokedera ${p.name}\n\n${p.scheme === 'light'?'Light':'Dark'} flavor. Copy this folder into your Yazi configuration's \`flavors/\` directory and select \`${base}\` in \`theme.toml\`. See the repository README.\n\n![Kokedera ${p.name} palette preview](preview.png)\n\nPalette preview: background, foreground, cursor, selection, then ANSI colors 0–15, read left to right across two rows. This illustrates the shared colors; it is not an application screenshot.\n\nFlavor and matching TextMate theme: MIT, see [LICENSE](LICENSE) and [LICENSE-tmtheme](LICENSE-tmtheme).\n`;
    files[`yazi/${base}.yazi/LICENSE`] = license;
    files[`yazi/${base}.yazi/LICENSE-tmtheme`] = license;
    files[`yazi/${base}.yazi/preview.png`] = palettePreview(p);
  }
  files['yazi/theme.toml']='[flavor]\ndark = "kokedera-dusk"\nlight = "kokedera-morning"\n';
  files['demo/example.py']='"""A quiet path through the moss temple."""\nfrom dataclasses import dataclass\n\n@dataclass\nclass Lantern:\n    name: str\n    lit: bool = False\n\n    def light(self) -> str:\n        self.lit = True\n        return f"{self.name}: warm light"\n\nlanterns = [Lantern(f"Path {i}") for i in range(3)]\nfor lantern in lanterns:\n    print(lantern.light())\n';
  return [{repo:'kokedera-theme-cli',title:'Kokedera for Command-Line Tools',
    description:'Matching themes for Starship, tmux, Zellij, lazygit, fzf, btop, Yazi, and bat.',files,
    sources:['https://starship.rs/config/','https://man.openbsd.org/tmux','https://zellij.dev/documentation/themes.html',
      'https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md','https://github.com/junegunn/fzf/blob/master/man/man1/fzf.1',
      'https://github.com/aristocratos/btop#themes','https://yazi-rs.github.io/docs/configuration/theme/',
      'https://github.com/sharkdp/bat#adding-new-themes'],
    install:`Download this folder, or the \`kokedera-all-ports\` archive from the latest release of kokedera-themes. Every tool has nine variants; the examples select Dusk. Use the matching terminal palette from [Kokedera for Terminals](${homeUrl('kokedera-theme-terminals')}) for application areas that inherit terminal colors. These files only style the named tools; they do not install or reconfigure your shell.\n\n### Starship\n\nEach \`starship/kokedera-<variant>.toml\` is a complete minimal prompt, with a named palette and styles that actually use it. Try one by pointing \`STARSHIP_CONFIG\` at its absolute path before starting a shell with Starship initialized. To preserve your existing prompt, merge its \`[palettes.kokedera_dusk]\` table, select \`palette = "kokedera_dusk"\` at the top level, and apply the supplied module styles individually.\n\n### tmux\n\nAdd \`source-file "/absolute/path/to/tmux/kokedera-dusk.conf"\` at the end of your \`~/.tmux.conf\`, then reload that file. The theme changes colors only and preserves your status-line content and key bindings. A true-color terminal is recommended.\n\n### Zellij\n\nCopy the KDL files into \`~/.config/zellij/themes/\` (or your configured theme directory), then set \`theme "kokedera-dusk"\` in \`config.kdl\`. Uses the current component-based theme format. Each variant sets its own background.\n\n### lazygit\n\nMerge the \`gui.theme\` mapping from \`lazygit/kokedera-dusk.yml\` into your existing configuration. Do not replace the entire config. To find the directory run \`lazygit --print-config-dir\`; open its \`config.yml\`. Reopen lazygit after editing. Its base background comes from the terminal.\n\n### fzf\n\nSource the variant matching your shell from the \`fzf/\` folder: \`.sh\` for POSIX shells/Bash/Zsh, \`.fish\` for Fish, or dot-source \`.ps1\` for PowerShell. The snippets preserve existing \`FZF_DEFAULT_OPTS\` and append Kokedera's color option. Add the source command to your shell profile for persistence. Source only one variant per shell startup.\n\n### btop\n\nCopy the \`.theme\` files to \`~/.config/btop/themes/\` (respecting \`XDG_CONFIG_HOME\` if set). Select \`kokedera-dusk\` in btop's Options → Color theme, and enable Theme background to use its background color.\n\n### Yazi\n\nCopy the nine \`yazi/kokedera-*.yazi\` directories into \`~/.config/yazi/flavors/\` (Windows: \`%APPDATA%\\yazi\\config\\flavors\\\`). Merge the supplied \`yazi/theme.toml\` flavor selection into your own \`theme.toml\`. The example automatically uses Dusk for dark terminals and Morning for light terminals. Set both \`dark\` and \`light\` to the same flavor to force it. Restart Yazi. Includes a matching TextMate syntax theme for file previews. Targets the current schema with \`mgr\` and \`indicator\` sections.\n\n### bat\n\nRun \`bat --config-dir\` to find your configuration directory. Copy the \`bat/*.tmTheme\` files into its \`themes/\` subdirectory, then run \`bat cache --build\`. Select with \`bat --theme="Kokedera Dusk" demo/example.py\`, set \`BAT_THEME\`, or add \`--theme="Kokedera Dusk"\` to bat's config file.\n`,
  }];
}
