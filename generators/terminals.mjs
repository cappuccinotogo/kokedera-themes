import { Buffer } from 'node:buffer';

const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const json = (v) => JSON.stringify(v, null, 2) + '\n';
const xmlEscape = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const rgb = (hex) => hex.replace('#', '').match(/../g).map((v) => parseInt(v, 16));
const normalized = (hex) => rgb(hex).map((v) => v / 255);
const label = (p) => p.name.startsWith('Kokedera ') ? p.name : `Kokedera ${p.name}`;
const plist = (body) => `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n${body}\n</dict>\n</plist>\n`;
const entry = (key, value) => `  <key>${xmlEscape(key)}</key>\n  ${value}`;
const string = (v) => `<string>${xmlEscape(v)}</string>`;

// A deliberately small binary-plist encoder for NSKeyedArchiver's NSColor graph.
// Apple Terminal stores each color as archived NSData, not an RGB dictionary.
// ASCII, NSData, nonnegative integers, UID, arrays and dictionaries suffice here.
function binaryPlist(value) {
  const objects = [];
  function add(v) {
    const index = objects.length;
    objects.push(null);
    if (Array.isArray(v)) objects[index] = { type: 'array', refs: v.map(add) };
    else if (Buffer.isBuffer(v)) objects[index] = { type: 'data', value: v };
    else if (v && typeof v === 'object' && Object.hasOwn(v, '__uid')) objects[index] = { type: 'uid', value: v.__uid };
    else if (v && typeof v === 'object') objects[index] = { type: 'dict', keys: Object.keys(v).map(add), refs: Object.values(v).map(add) };
    else objects[index] = { type: typeof v, value: v };
    return index;
  }
  const root = add(value);
  const width = (n) => n <= 0xff ? 1 : n <= 0xffff ? 2 : n <= 0xffffffff ? 4 : 8;
  const uint = (n, bytes) => {
    const b = Buffer.alloc(bytes);
    if (bytes === 8) b.writeBigUInt64BE(BigInt(n));
    else b.writeUIntBE(n, 0, bytes);
    return b;
  };
  const integer = (n) => { const w = width(n); return Buffer.concat([Buffer.from([0x10 + Math.log2(w)]), uint(n, w)]); };
  const header = (tag, length) => length < 15 ? Buffer.from([tag + length]) : Buffer.concat([Buffer.from([tag + 15]), integer(length)]);
  const refWidth = width(objects.length - 1);
  const refs = (list) => Buffer.concat(list.map((n) => uint(n, refWidth)));
  const encoded = objects.map((o) => {
    switch (o.type) {
      case 'string': {
        if (!/^[\x00-\x7f]*$/.test(o.value)) throw new Error('NSColor archive only accepts ASCII strings');
        const b = Buffer.from(o.value, 'ascii');
        return Buffer.concat([header(0x50, b.length), b]);
      }
      case 'data': return Buffer.concat([header(0x40, o.value.length), o.value]);
      case 'number': return integer(o.value);
      case 'uid': { const w = width(o.value); return Buffer.concat([Buffer.from([0x80 + w - 1]), uint(o.value, w)]); }
      case 'array': return Buffer.concat([header(0xa0, o.refs.length), refs(o.refs)]);
      case 'dict': return Buffer.concat([header(0xd0, o.keys.length), refs(o.keys), refs(o.refs)]);
      default: throw new Error(`Unsupported binary plist value: ${o.type}`);
    }
  });
  let offset = 8;
  const offsets = encoded.map((b) => { const n = offset; offset += b.length; return n; });
  const offsetWidth = width(offset);
  const trailer = Buffer.concat([Buffer.alloc(6), Buffer.from([offsetWidth, refWidth]), uint(objects.length, 8), uint(root, 8), uint(offset, 8)]);
  return Buffer.concat([Buffer.from('bplist00'), ...encoded, ...offsets.map((n) => uint(n, offsetWidth)), trailer]);
}

function archivedColor(hex) {
  return binaryPlist({
    $version: 100000,
    $archiver: 'NSKeyedArchiver',
    $top: { root: { __uid: 1 } },
    $objects: ['$null', {
      NSRGB: Buffer.from(normalized(hex).map((v) => v.toFixed(10)).join(' ') + '\0', 'ascii'),
      NSColorSpace: 2,
      $class: { __uid: 2 },
    }, { $classes: ['NSColor', 'NSObject'], $classname: 'NSColor' }],
  }).toString('base64');
}

function iterm(p) {
  const t = p.terminal;
  const colors = {
    'Background Color': t.background, 'Foreground Color': t.foreground,
    'Bold Color': t.foreground, 'Cursor Color': t.cursor, 'Cursor Text Color': t.background,
    'Selection Color': t.selectionBackground, 'Selected Text Color': t.selectionForeground,
    ...Object.fromEntries(t.ansi.map((v, i) => [`Ansi ${i} Color`, v])),
  };
  return plist(Object.entries(colors).map(([k, v]) => {
    const [r, g, b] = normalized(v);
    return entry(k, `<dict>\n${entry('Color Space', string('sRGB'))}\n${entry('Red Component', `<real>${r}</real>`)}\n${entry('Green Component', `<real>${g}</real>`)}\n${entry('Blue Component', `<real>${b}</real>`)}\n</dict>`);
  }).join('\n') + '\n' + entry('Use Selected Text Color', '<true/>'));
}

function appleTerminal(p) {
  const t = p.terminal;
  const colors = {
    BackgroundColor: t.background, TextColor: t.foreground, TextBoldColor: t.foreground,
    CursorColor: t.cursor, SelectionColor: t.selectionBackground,
    ...Object.fromEntries(t.ansi.map((v, i) => [`ANSI${i > 7 ? 'Bright' : ''}${cap(names[i % 8])}Color`, v])),
  };
  return plist([
    entry('name', string(label(p))), entry('type', string('Window Settings')),
    entry('ProfileCurrentVersion', '<real>2.04</real>'),
    ...Object.entries(colors).map(([k, v]) => entry(k, `<data>${archivedColor(v)}</data>`)),
  ].join('\n'));
}

function windowsScheme(p) {
  const t = p.terminal;
  const windowsNames = ['black','red','green','yellow','blue','purple','cyan','white'];
  return {
    name: label(p), background: t.background, foreground: t.foreground,
    cursorColor: t.cursor, selectionBackground: t.selectionBackground,
    ...Object.fromEntries(t.ansi.map((v, i) => [i > 7 ? `bright${cap(windowsNames[i % 8])}` : windowsNames[i], v])),
  };
}

const appDocs = {
  ghostty: {
    title: 'Ghostty', sources: ['https://ghostty.org/docs/features/theme'],
    install: 'Copy the desired theme (for example `Kokedera Dusk`) into `~/.config/ghostty/themes/` (or `$XDG_CONFIG_HOME/ghostty/themes/`). In your existing Ghostty configuration, set:\n\n```ini\ntheme = Kokedera Dusk\n```\n\nReload the configuration. You can also give `theme` the absolute path of a theme in this folder. To follow system appearance, use `theme = dark:Kokedera Dusk,light:Kokedera Morning`.',
  },
  'windows-terminal': {
    title: 'Windows Terminal', sources: ['https://learn.microsoft.com/en-us/windows/terminal/json-fragment-extensions', 'https://learn.microsoft.com/en-us/windows/terminal/customize-settings/color-schemes'],
    install: 'Create `%LOCALAPPDATA%\\Microsoft\\Windows Terminal\\Fragments\\Kokedera\\` and copy `kokedera.json` there. Restart Windows Terminal, then select a Kokedera scheme under **Settings → your profile → Appearance → Color scheme**. The fragment adds nine schemes without changing existing profiles.\n\nAlternatively, merge individual objects from `schemes/` into the `schemes` array of your existing `settings.json`. Set `"colorScheme": "Kokedera Dusk"` on the desired profile. Do not replace your settings file with a scheme or fragment.',
  },
  iterm2: {
    title: 'iTerm2', sources: ['https://iterm2.com/documentation-preferences-profiles-colors.html'],
    install: 'Open **iTerm2 → Settings → Profiles → Colors → Color Presets → Import**, select the desired `.itermcolors` files, then choose **Kokedera Dusk** (or another variant) from Color Presets. This imports color presets; existing profile commands, fonts and key bindings remain yours. Enable the custom selected-text color if your profile overrides it.',
  },
  'apple-terminal': {
    title: 'Apple Terminal', sources: ['https://support.apple.com/guide/terminal/import-and-export-terminal-profiles-trml4299c696/mac', 'https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/terminal'],
    install: 'Open **Terminal → Settings → Profiles**, open the action menu below the profile list, choose **Import**, and select a `.terminal` file. Choose the new Kokedera profile for a window or make it your default. Importing adds a profile.\n\nThe files contain the 16 ANSI colors, text, background, selection and cursor as native archived `NSColor` values. Apple Terminal controls selected-text foreground itself; that field cannot be kept identical to terminals that expose a separate selection foreground. Colors use Terminal’s native device-RGB archive representation, so display color management can differ slightly from sRGB-aware applications.',
  },
  kitty: {
    title: 'kitty', sources: ['https://sw.kovidgoyal.net/kitty/conf/', 'https://sw.kovidgoyal.net/kitty/kittens/themes/'],
    install: 'Copy the desired `.conf` into `~/.config/kitty/themes/`. Add or update the following line in your existing `kitty.conf`:\n\n```conf\ninclude themes/kokedera-dusk.conf\n```\n\nReload kitty’s configuration. Later color settings in your configuration may override the included theme. The files contain colors only.',
  },
  alacritty: {
    title: 'Alacritty', sources: ['https://alacritty.org/config-alacritty.html'],
    install: 'For current TOML-based Alacritty, copy a theme into your Alacritty configuration directory, for example `themes/kokedera-dusk.toml`. Add its path to the existing `[general]` `import` array:\n\n```toml\n[general]\nimport = ["themes/kokedera-dusk.toml"]\n```\n\nKeep any existing imports in the array and use only one `[general]` table. Configuration locations include `~/.config/alacritty/alacritty.toml` on Unix and `%APPDATA%\\alacritty\\alacritty.toml` on Windows. Explicit colors in your main file override imported colors. Older YAML-based releases need an upgrade.',
  },
  wezterm: {
    title: 'WezTerm', sources: ['https://wezterm.org/config/appearance.html'],
    install: 'Copy the desired TOML files into `~/.config/wezterm/colors/`, or add the absolute path to this folder to your existing `config.color_scheme_dirs` list. Then add this before `return config` in your existing `wezterm.lua`:\n\n```lua\nconfig.color_scheme = "Kokedera Dusk"\n```\n\nFor another directory, append it to `config.color_scheme_dirs`; keep your other directories. Local `config.colors` settings can override a scheme. The `metadata.name` in each file defines the selectable name.',
  },
  warp: {
    title: 'Warp', sources: ['https://docs.warp.dev/terminal/appearance/custom-themes'],
    install: 'Copy the `.yaml` files into the themes directory for your platform:\n\n- macOS: `~/.warp/themes/`\n- Linux: `${XDG_DATA_HOME:-$HOME/.local/share}/warp-terminal/themes/`\n- Windows: `%APPDATA%\\warp\\Warp\\data\\themes\\`\n\nRestart Warp if needed, open **Settings → Appearance**, and choose a Kokedera theme. The YAML sets terminal colors plus the UI accent and appropriate lighter/darker UI details. Selection rendering is managed by Warp.',
  },
  foot: {
    title: 'foot', sources: ['https://codeberg.org/dnkl/foot/src/branch/master/doc/foot.ini.5.scd'],
    install: 'These files target **foot 1.26 or newer**, using the current `[colors-dark]` / `[colors-light]` sections. Copy the chosen file to `~/.config/foot/themes/`, then add this in the main section at the top of your existing `foot.ini` (before any section headers):\n\n```ini\ninclude=~/.config/foot/themes/kokedera-dusk.ini\n```\n\nEach theme selects its corresponding `initial-color-theme` and defines that color section. Start a new foot window; if using the server, restart it when convenient. Existing color definitions after the include override the theme. For older foot, upgrade or rename the theme’s color section to `[colors]` and remove `initial-color-theme`; do not use the legacy section on foot 1.28+.',
  },
  konsole: {
    title: 'Konsole', sources: ['https://docs.kde.org/stable5/en/konsole/konsole/tabbar.html', 'https://invent.kde.org/utilities/konsole/-/tree/master/data/color-schemes'],
    install: 'Copy the `.colorscheme` files to `~/.local/share/konsole/` (or `$XDG_DATA_HOME/konsole/`). Open **Settings → Edit Current Profile → Appearance**, select a Kokedera scheme, and apply it. You may duplicate a profile first to keep a separate Kokedera profile. The theme defines normal, intense and faint colors; cursor and selection behavior remain controlled by Konsole’s profile settings.',
  },
  'xfce-terminal': {
    title: 'Xfce Terminal', sources: ['https://docs.xfce.org/apps/xfce4-terminal/preferences', 'https://gitlab.xfce.org/apps/xfce4-terminal/-/blob/master/terminal/terminal-preferences.c'],
    install: 'Copy the `.theme` files to `~/.local/share/xfce4/terminal/colorschemes/` (or `$XDG_DATA_HOME/xfce4/terminal/colorschemes/`). Restart the preferences dialog, then open **Edit → Preferences → Colors → Presets** and choose a Kokedera preset. Cursor and selection use explicit Kokedera colors. Your existing font and shell settings are retained.',
  },
  terminator: {
    title: 'Terminator', sources: ['https://gnome-terminator.readthedocs.io/en/latest/config.html', 'https://github.com/gnome-terminator/terminator/blob/master/terminatorlib/config.py'],
    install: 'Close Terminator before editing `~/.config/terminator/config`. Make a backup, then insert the chosen file’s `[[Kokedera Dusk]]` block inside your existing `[profiles]` section. If no `[profiles]` section exists, create it once. Keep existing profiles and all other sections. Restart Terminator and choose the new profile from its context menu or Preferences.\n\nThese fragments use current `cursor_bg_color` / `cursor_fg_color` keys. They disable inherited system colors for the new profile. Selection colors are controlled by VTE/Terminator.',
  },
  putty: {
    title: 'PuTTY', sources: ['https://www.chiark.greenend.org.uk/~sgtatham/putty/0.83/htmldoc/Chapter4.html#config-colours', 'https://git.tartarus.org/?p=simon/putty.git;a=blob;f=doc/pterm.but;hb=HEAD'],
    install: 'The `.reg` files add color-only sessions named **Kokedera Dusk**, etc., under your own Windows user account. Inspect the file, then import it with Registry Editor (or double-click and accept Windows’ import prompt). Open PuTTY, load the new Kokedera session, enter your host and connection settings, and save it under a connection-specific name.\n\nThe import does not modify **Default Settings** or other named sessions. Reimporting a file updates colors in the matching Kokedera session, so export that key first if you customized it. Foreground/background, cursor and all 16 ANSI colors are mapped to PuTTY’s interleaved normal/bold color indices. Selection is managed by PuTTY.',
  },
  mobaxterm: {
    title: 'MobaXterm', sources: ['https://mobaxterm.mobatek.net/documentation.html', 'https://github.com/mbadolato/iTerm2-Color-Schemes/tree/master/mobaxterm'],
    install: 'Exit MobaXterm so it does not rewrite settings while you edit them. Back up your active `MobaXterm.ini` (the location depends on your portable/installed configuration). In that file, merge the desired theme’s values into the existing `[Colors]` section; create the section if absent. Keep all other sections, connection definitions and settings. Restart MobaXterm. Existing sessions with their own colors may need their color customization reset to the global scheme.\n\nThese are **INI snippets**, not complete MobaXterm configuration files. The key layout follows the established MobaXterm exports in iTerm2-Color-Schemes; MobaXterm’s public documentation describes color configuration but does not formally specify every INI key. Native runtime verification is still required for your release.',
  },
  termux: {
    title: 'Termux', sources: ['https://github.com/termux/termux-app/blob/master/terminal-emulator/src/main/java/com/termux/terminal/TerminalColorScheme.java', 'https://github.com/termux/termux-styling'],
    install: 'In Termux, create `~/.termux/` if needed. Back up your current `~/.termux/colors.properties`, then merge the chosen `.properties` file’s `foreground`, `background`, `cursor` and `color0`–`color15` entries into it, keeping any other settings. If the file does not exist, copy the chosen file there as `colors.properties`. Run:\n\n```sh\ntermux-reload-settings\n```\n\nThe colors are local configuration and do not require the Termux:Styling add-on. The Android UI and selection handles follow Termux/Android settings.',
  },
};

export function generate(palettes) {
  const files = {};
  for (const p of palettes) {
    const t = p.terminal;
    if (t.ansi.length !== 16 || Object.values(t).flat().some((v) => !/^#[0-9a-f]{6}$/i.test(v))) throw new Error(`Invalid terminal palette: ${p.id}`);
    const filename = `kokedera-${p.id}`;
    const title = label(p);
    const comment = `# ${title} — generated from the shared Kokedera palette.\n`;
    const mapNames = (offset = 0, delimiter = ' = ', prefix = '') => names.map((n, i) => `${prefix}${n}${delimiter}"${t.ansi[i + offset]}"`).join('\n');
    files[`ghostty/${title}`] = comment + `background = ${t.background}\nforeground = ${t.foreground}\ncursor-color = ${t.cursor}\ncursor-text = ${t.background}\nselection-background = ${t.selectionBackground}\nselection-foreground = ${t.selectionForeground}\n` + t.ansi.map((v, i) => `palette = ${i}=${v}`).join('\n') + '\n';
    files[`windows-terminal/schemes/${filename}.json`] = json(windowsScheme(p));
    files[`iterm2/${title}.itermcolors`] = iterm(p);
    files[`apple-terminal/${title}.terminal`] = appleTerminal(p);
    files[`kitty/${filename}.conf`] = comment + `background ${t.background}\nforeground ${t.foreground}\ncursor ${t.cursor}\ncursor_text_color ${t.background}\nselection_background ${t.selectionBackground}\nselection_foreground ${t.selectionForeground}\n` + t.ansi.map((v, i) => `color${i} ${v}`).join('\n') + '\n';
    files[`alacritty/${filename}.toml`] = comment + `[colors.primary]\nbackground = "${t.background}"\nforeground = "${t.foreground}"\n\n[colors.cursor]\ntext = "${t.background}"\ncursor = "${t.cursor}"\n\n[colors.selection]\ntext = "${t.selectionForeground}"\nbackground = "${t.selectionBackground}"\n\n[colors.normal]\n${mapNames()}\n\n[colors.bright]\n${mapNames(8)}\n`;
    files[`wezterm/${filename}.toml`] = comment + `[metadata]\nname = "${title}"\nauthor = "Kokedera"\n\n[colors]\nbackground = "${t.background}"\nforeground = "${t.foreground}"\ncursor_bg = "${t.cursor}"\ncursor_border = "${t.cursor}"\ncursor_fg = "${t.background}"\nselection_bg = "${t.selectionBackground}"\nselection_fg = "${t.selectionForeground}"\nansi = ${JSON.stringify(t.ansi.slice(0, 8))}\nbrights = ${JSON.stringify(t.ansi.slice(8))}\n`;
    files[`warp/${filename}.yaml`] = comment + `name: "${title}"\naccent: "${t.cursor}"\ncursor: "${t.cursor}"\nbackground: "${t.background}"\nforeground: "${t.foreground}"\ndetails: ${p.scheme === 'light' ? 'lighter' : 'darker'}\nterminal_colors:\n  normal:\n${mapNames(0, ': ', '    ')}\n  bright:\n${mapNames(8, ': ', '    ')}\n`;
    files[`foot/${filename}.ini`] = comment + `[main]\ninitial-color-theme=${p.scheme}\n\n[colors-${p.scheme}]\nbackground=${t.background.slice(1)}\nforeground=${t.foreground.slice(1)}\ncursor=${t.background.slice(1)} ${t.cursor.slice(1)}\nselection-background=${t.selectionBackground.slice(1)}\nselection-foreground=${t.selectionForeground.slice(1)}\n` + t.ansi.map((v, i) => `${i < 8 ? 'regular' : 'bright'}${i % 8}=${v.slice(1)}`).join('\n') + '\n';
    files[`konsole/${filename}.colorscheme`] = `[General]\nDescription=${title}\nOpacity=1\nWallpaper=\n\n` + [
      ['Background', t.background], ['BackgroundIntense', t.background], ['BackgroundFaint', t.background],
      ['Foreground', t.foreground], ['ForegroundIntense', t.foreground], ['ForegroundFaint', t.foreground],
      ...t.ansi.map((v, i) => [`Color${i % 8}${i > 7 ? 'Intense' : ''}`, v]),
      ...t.ansi.slice(0, 8).map((v, i) => [`Color${i}Faint`, v]),
    ].map(([k, v]) => `[${k}]\nColor=${rgb(v).join(',')}\n`).join('\n');
    files[`xfce-terminal/${filename}.theme`] = `[Scheme]\nName=${title}\nColorForeground=${t.foreground}\nColorBackground=${t.background}\nColorCursor=${t.cursor}\nColorCursorForeground=${t.background}\nColorCursorUseDefault=FALSE\nColorSelection=${t.selectionForeground}\nColorSelectionBackground=${t.selectionBackground}\nColorSelectionUseDefault=FALSE\nColorPalette=${t.ansi.join(';')}\n`;
    files[`terminator/${filename}.config`] = comment + `[[${title}]]\n  use_theme_colors = False\n  background_color = "${t.background}"\n  foreground_color = "${t.foreground}"\n  cursor_color_default = False\n  cursor_bg_color = "${t.cursor}"\n  cursor_fg_color = "${t.background}"\n  palette = "${t.ansi.join(':')}"\n`;
    const puttyColors = [t.foreground, t.foreground, t.background, t.background, t.background, t.cursor,
      ...names.flatMap((_, i) => [t.ansi[i], t.ansi[i + 8]])];
    files[`putty/${filename}.reg`] = `Windows Registry Editor Version 5.00\r\n\r\n[HKEY_CURRENT_USER\\Software\\SimonTatham\\PuTTY\\Sessions\\${encodeURIComponent(title)}]\r\n` + puttyColors.map((v, i) => `"Colour${i}"="${rgb(v).join(',')}"`).join('\r\n') + '\r\n';
    files[`mobaxterm/${filename}.ini`] = `; ${title} — merge only these values into your existing [Colors] section.\n[Colors]\nDefaultColorScheme=0\nBackgroundColour=${rgb(t.background).join(',')}\nForegroundColour=${rgb(t.foreground).join(',')}\nCursorColour=${rgb(t.cursor).join(',')}\n` + t.ansi.map((v, i) => `${i > 7 ? 'Bold' : ''}${cap(names[i % 8])}=${rgb(v).join(',')}`).join('\n') + '\n';
    files[`termux/${filename}.properties`] = comment + `background=${t.background}\nforeground=${t.foreground}\ncursor=${t.cursor}\n` + t.ansi.map((v, i) => `color${i}=${v}`).join('\n') + '\n';
  }
  files['windows-terminal/kokedera.json'] = json({ schemes: palettes.map(windowsScheme) });
  for (const [dir, doc] of Object.entries(appDocs)) {
    files[`${dir}/README.md`] = `# Kokedera for ${doc.title}\n\n${doc.install}\n\n## Variants\n\n${palettes.map((p) => `${label(p)} (${p.scheme})`).join(', ')}.\n\nAll formats use the same shared 16-color ANSI palette, foreground and background for each variant. Application-specific cursor, selection and UI behavior may differ.\n\n## References\n\n${doc.sources.map((url, i) => `- [${i === 0 ? doc.title + ' documentation' : 'Format reference'}](${url})`).join('\n')}\n`;
  }
  files['preview-ansi.py'] = `#!/usr/bin/env python3\n"""Show the installed terminal palette without changing its configuration."""\nfor row in range(2):\n    for col in range(8):\n        index = row * 8 + col\n        print(f"\\033[48;5;{index}m  {index:2}  \\033[0m", end=" ")\n    print()\nprint("\\nNormal text   \\033[1mBold text\\033[0m   \\033[3mItalic text\\033[0m")\nfor index in range(16):\n    print(f"\\033[38;5;{index}mColor {index:2}: The moss temple rests in quiet light.\\033[0m")\n`;
  return [{
    repo: 'kokedera-theme-terminals', title: 'Kokedera for Terminals',
    description: 'Nine consistent Kokedera palettes for 15 terminal emulators.',
    files,
    install: `Choose your terminal for installation instructions:\n\n${Object.entries(appDocs).map(([dir, doc]) => `- [${doc.title}](${dir}/README.md)`).join('\n')}\n\nImport or include one variant using its app-specific instructions. Run \`python3 preview-ansi.py\` (\`python preview-ansi.py\` on Windows) to inspect all 16 ANSI colors in the terminal. These themes configure colors; applications that emit their own 24-bit RGB colors need their own Kokedera theme.\n\n## Verification scope\n\nThe generator is checked for consistent ANSI order, valid color values, current format keys and parseable JSON, TOML, YAML, INI and plist archives. Native visual verification across macOS, Linux, Android and all terminal releases is not automated. MobaXterm uses established INI export keys without a formally published schema.`,
    sources: [...new Set(Object.values(appDocs).flatMap((doc) => doc.sources))],
  }];
}
