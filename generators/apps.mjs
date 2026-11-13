// Native application ports generated from the canonical Kokedera palette.
import { readFileSync } from 'node:fs';
import { monorepoUrl, portPath } from './repositories.mjs';

const json = value => JSON.stringify(value, null, 2) + '\n';
const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16));
const rgbString = hex => rgb(hex).join(',');
const luminance = hex => rgb(hex).map(value => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
// Preserve palette colors where readable; choose the closer readable foreground
// only for interactive text on filled accents, never alter the source palette.
const on = background => contrast(background, '#ffffff') >= contrast(background, '#111111') ? '#ffffff' : '#111111';
const readable = (foreground, background, fallback) => contrast(foreground, background) >= 4.5 ? foreground : fallback;
const selectionBackground = tokens => contrast(tokens.textPrimary, tokens.bgActive) >= 4.5 ? tokens.bgActive : tokens.bgHover;
const declarations = values => Object.entries(values).map(([key, value]) => `  --${key}: ${value};`).join('\n');
const descriptor = (platform, title, description, files, install, sources) => ({
  repo: `kokedera-theme-extension-${platform}`, title, description, files, install, sources,
});

function obsidianVariables(palette) {
  const t = palette.tokens;
  const s = palette.syntax;
  return {
    'color-base-00': t.bgPage, 'color-base-05': t.bgDeep, 'color-base-10': t.bgSurface,
    'color-base-20': t.bgElevated, 'color-base-25': t.bgHover, 'color-base-30': t.bgActive,
    'color-base-35': t.borderSubtle, 'color-base-40': t.borderMain,
    'color-base-50': t.textDim, 'color-base-60': t.textMuted,
    'color-base-70': t.textMuted, 'color-base-100': t.textPrimary,
    'background-primary': t.bgPage, 'background-primary-alt': t.bgDeep,
    'background-secondary': t.bgSurface, 'background-secondary-alt': t.bgElevated,
    'background-modifier-hover': t.bgHover, 'background-modifier-active-hover': t.bgActive,
    'background-modifier-border': t.borderSubtle, 'background-modifier-border-hover': t.borderMain,
    'background-modifier-border-focus': t.accentPrimary, 'background-modifier-form-field': t.bgPage,
    'background-modifier-success': t.cedar, 'background-modifier-error': t.torii,
    'background-modifier-error-hover': t.torii, 'background-modifier-box-shadow': `${t.bgOverlay}88`,
    'background-modifier-cover': `${t.bgOverlay}cc`, 'background-modifier-message': t.bgElevated,
    'text-normal': t.textPrimary, 'text-muted': t.textMuted, 'text-faint': t.textDim,
    'text-on-accent': on(t.accentPrimary), 'text-on-accent-inverted': t.bgPage,
    'text-error': t.torii, 'text-success': t.cedar, 'text-warning': t.bronze,
    'text-accent': readable(t.accentLime, t.bgPage, t.textPrimary),
    'text-accent-hover': readable(t.accentFirefly, t.bgPage, t.textPrimary),
    'text-selection': selectionBackground(t), 'text-highlight-bg': `${t.gold}40`,
    'interactive-normal': t.bgElevated, 'interactive-hover': t.bgHover,
    'interactive-accent': t.accentPrimary, 'interactive-accent-hover': t.accentLime,
    'interactive-accent-rgb': rgbString(t.accentPrimary), 'color-accent': t.accentPrimary,
    'color-accent-1': t.accentPrimary, 'color-accent-2': t.accentLime,
    'color-red': t.torii, 'color-orange': t.bronze, 'color-yellow': t.lantern,
    'color-green': t.cedar, 'color-cyan': t.stream, 'color-blue': t.stream,
    'color-purple': t.wisteria, 'color-pink': t.wisteria,
    'color-red-rgb': rgbString(t.torii), 'color-orange-rgb': rgbString(t.bronze),
    'color-yellow-rgb': rgbString(t.lantern), 'color-green-rgb': rgbString(t.cedar),
    'color-cyan-rgb': rgbString(t.stream), 'color-blue-rgb': rgbString(t.stream),
    'color-purple-rgb': rgbString(t.wisteria), 'color-pink-rgb': rgbString(t.wisteria),
    'code-background': t.bgSurface, 'code-normal': t.textPrimary,
    'code-comment': s.comment, 'code-function': s.function, 'code-important': s.constant,
    'code-keyword': s.keyword, 'code-operator': s.operator, 'code-property': s.property,
    'code-punctuation': s.operator, 'code-string': s.string, 'code-tag': s.keyword,
    'code-value': s.number, 'checkbox-color': t.accentPrimary, 'checkbox-color-hover': t.accentLime,
    'checkbox-border-color': t.textDim, 'checkbox-marker-color': on(t.accentPrimary),
    'checklist-done-color': t.textMuted, 'divider-color': t.borderSubtle,
    'nav-item-color': t.textMuted, 'nav-item-color-hover': t.textPrimary,
    'nav-item-color-active': t.textPrimary, 'nav-item-background-hover': t.bgHover,
    'nav-item-background-active': t.bgActive, 'nav-collapse-icon-color': t.textDim,
    'tab-text-color': t.textMuted, 'tab-text-color-active': t.textPrimary,
    'tab-background-active': t.bgPage, 'tab-outline-color': t.borderSubtle,
    'titlebar-background': t.bgSurface, 'titlebar-background-focused': t.bgSurface,
    'titlebar-text-color': t.textMuted, 'titlebar-text-color-focused': t.textPrimary,
    'ribbon-background': t.bgSurface, 'ribbon-background-collapsed': t.bgSurface,
    'status-bar-background': t.bgSurface, 'status-bar-text-color': t.textMuted,
    'scrollbar-bg': `${t.textDim}30`, 'scrollbar-thumb-bg': `${t.textDim}66`,
    'scrollbar-active-thumb-bg': `${t.textMuted}88`, 'table-border-color': t.borderMain,
    'table-header-background': t.bgSurface, 'table-header-color': t.textPrimary,
    'table-row-alt-background': t.bgDeep, 'table-row-background-hover': t.bgHover,
    'blockquote-border-color': t.accentPrimary, 'blockquote-color': t.textMuted,
    'blockquote-background-color': t.bgSurface, 'hr-color': t.borderMain,
    'h1-color': t.lantern, 'h2-color': t.bamboo, 'h3-color': t.sage,
    'h4-color': t.stream, 'h5-color': t.wisteria, 'h6-color': t.textMuted,
    'link-color': readable(t.accentLime, t.bgPage, t.textPrimary),
    'link-color-hover': readable(t.accentFirefly, t.bgPage, t.textPrimary),
    'link-external-color': readable(t.stream, t.bgPage, t.textPrimary),
    'tag-color': readable(t.bamboo, t.bgSurface, t.textPrimary), 'tag-background': t.bgSurface,
    'tag-color-hover': t.textPrimary, 'tag-background-hover': t.bgHover,
    'graph-line': t.borderMain, 'graph-node': t.sage, 'graph-node-focused': t.accentFirefly,
    'graph-node-tag': t.wisteria, 'graph-node-attachment': t.stream,
    'graph-node-unresolved': t.textDim, 'graph-text': t.textPrimary,
    'search-result-background': t.bgSurface, 'search-result-background-hover': t.bgHover,
    'kokedera-selection-foreground': t.textPrimary,
  };
}

function obsidian(palettes) {
  const dusk = palettes.find(p => p.id === 'dusk') ?? palettes.find(p => p.scheme === 'dark');
  const morning = palettes.find(p => p.id === 'morning') ?? palettes.find(p => p.scheme === 'light');
  const files = {
    'manifest.json': json({ name: 'Kokedera', version: '1.0.0', minAppVersion: '1.5.0', author: 'Florian Mühlhans', authorUrl: 'https://kokedera.style' }),
    'theme.css': `/* Kokedera: Dusk in dark mode, Morning in light mode. */\n.theme-dark {\n${declarations(obsidianVariables(dusk))}\n}\n.theme-light {\n${declarations(obsidianVariables(morning))}\n}\n\n/* Use native variables so Live Preview and Reading view share a palette. */\nbody ::selection { color: var(--kokedera-selection-foreground); background: var(--text-selection); }\n.markdown-rendered blockquote { padding: 0.75em 1em; border-radius: 0 6px 6px 0; }\n.markdown-rendered table tr:nth-child(even) { background: var(--table-row-alt-background); }\n.markdown-rendered pre { border: 1px solid var(--background-modifier-border); }\n.callout { border: 1px solid rgba(var(--callout-color), 0.3); border-radius: 6px; }\n.callout[data-callout="note"], .callout[data-callout="info"] { --callout-color: var(--color-blue-rgb); }\n.callout[data-callout="tip"], .callout[data-callout="success"] { --callout-color: var(--color-green-rgb); }\n.callout[data-callout="warning"] { --callout-color: var(--color-orange-rgb); }\n.callout[data-callout="danger"], .callout[data-callout="failure"] { --callout-color: var(--color-red-rgb); }\n.callout[data-callout="quote"] { --callout-color: var(--color-purple-rgb); }\n`,
    'versions.json': json({ '1.0.0': '1.5.0' }),
  };
  for (const p of palettes) files[`snippets/kokedera-${p.id}.css`] = `/* Kokedera ${p.name}. Set Obsidian base color scheme to ${p.scheme}; enable exactly one Kokedera snippet. */\nbody.theme-${p.scheme} {\n${declarations(obsidianVariables(p))}\n}\n`;
  return descriptor('obsidian', 'Kokedera for Obsidian', 'Nine moss temple palettes for Obsidian, including Live Preview, reading, callouts, tables and graph colors.', files,
    '1. Copy `manifest.json` and `theme.css` into `<vault>/.obsidian/themes/Kokedera/`.\n2. Open **Settings → Appearance → Themes**, select **Kokedera**. Dark mode defaults to Dusk; light mode defaults to Morning.\n3. For another variant, copy the matching `snippets/kokedera-<variant>.css` into `<vault>/.obsidian/snippets/`. Set the base color scheme to the variant’s light/dark mode, reload the CSS snippets list, and enable **exactly one** Kokedera snippet. A snippet intentionally only applies in its matching base mode.\n4. To return to automatic Dusk/Morning, disable the Kokedera snippets.\n\nNo community plugin is required. The theme leaves font choices, note widths and layout under Obsidian’s control. Community plugins that use Obsidian’s public color variables inherit these palettes; plugins with hard-coded colors may require their own styling.',
    ['https://docs.obsidian.md/Themes/App%20themes/Build%20a%20theme', 'https://docs.obsidian.md/Reference/CSS%20variables/About%20styling', 'https://help.obsidian.md/snippets']);
}

function typoraCSS(p) {
  const t = p.tokens, s = p.syntax;
  const vars = {
    'bg-color': t.bgPage, 'text-color': t.textPrimary, 'select-text-bg-color': t.bgActive,
    'select-text-font-color': t.textPrimary, 'monospace': '"Cascadia Code", "SFMono-Regular", Consolas, monospace',
    'side-bar-bg-color': t.bgSurface, 'control-text-color': t.textPrimary,
    'active-file-bg-color': t.bgActive, 'active-file-text-color': t.textPrimary,
    'active-file-border-color': t.accentPrimary, 'item-hover-bg-color': t.bgHover,
    'item-hover-text-color': t.textPrimary, 'window-border': `1px solid ${t.borderMain}`,
    'primary-color': t.accentPrimary, 'primary-btn-border-color': t.accentPrimary,
    'primary-btn-text-color': on(t.accentPrimary), 'primary-btn-bg-color': t.accentPrimary,
    'search-select-bg-color': t.bgActive, 'search-select-text-color': t.textPrimary,
    'rawblock-edit-panel-bd': t.bgSurface, 'panel-border-color': t.borderMain,
    'code-block-bg-color': t.bgSurface, 'kokedera-border': t.borderMain,
  };
  return `/* Kokedera ${p.name} — ${p.scheme}. No external fonts or network requests. */\n:root {\n${declarations(vars)}\n  color-scheme: ${p.scheme};\n}\nhtml, body { background: var(--bg-color); color: var(--text-color); }\nbody { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.65; }\n#write { max-width: 900px; margin: 0 auto; padding: 36px 48px 100px; }\n@media (max-width: 600px) { #write { padding: 20px 24px 60px; } }\nh1, h2, h3, h4, h5, h6 { font-weight: 600; line-height: 1.25; margin: 1.7em 0 0.7em; }\nh1 { color: ${t.lantern}; } h2 { color: ${t.bamboo}; border-bottom: 1px solid ${t.borderSubtle}; padding-bottom: 0.35em; }\nh3 { color: ${t.sage}; } h4 { color: ${t.stream}; } h5 { color: ${t.wisteria}; } h6 { color: ${t.textMuted}; }\na { color: ${readable(t.accentLime, t.bgPage, t.textPrimary)}; } a:hover { color: ${readable(t.accentFirefly, t.bgPage, t.textPrimary)}; }\n::selection { color: ${t.textPrimary}; background: ${t.bgActive}; }\nblockquote { background: ${t.bgSurface}; color: ${t.textMuted}; border-left: 3px solid ${t.accentPrimary}; padding: 0.5em 1em; margin: 1em 0; }\nhr { border: 0; border-top: 1px solid ${t.borderMain}; margin: 2em 0; }\ntable { border-collapse: collapse; width: 100%; }\nth, td { border: 1px solid ${t.borderMain}; padding: 0.55em 0.8em; }\nth { background: ${t.bgSurface}; color: ${t.textPrimary}; font-weight: 600; }\ntr:nth-child(even) { background: ${t.bgDeep}; }\ntr:hover { background: ${t.bgHover}; }\ncode, tt { background: ${t.bgSurface}; color: ${t.sage}; padding: 0.15em 0.35em; border-radius: 3px; font-family: var(--monospace); }\npre, .md-fences, .md-code, .md-math-block { background: ${t.bgSurface}; color: ${t.textPrimary}; border-radius: 5px; }\n.md-fences { border: 1px solid ${t.borderSubtle}; padding: 1em; margin: 1.25em 0; }\npre code { color: inherit; padding: 0; }\nmark { background: ${t.gold}40; color: ${t.textPrimary}; }\n.md-meta, .md-before, .md-after, .md-tag, .md-content, .md-image>.md-meta { color: ${t.textMuted}; }\n.md-task-list-item>input { accent-color: ${t.accentPrimary}; }\n.md-task-list-item.task-list-done { color: ${t.textMuted}; }\n.footnotes { border-top: 1px solid ${t.borderMain}; color: ${t.textMuted}; }\n.md-toc-content { background: ${t.bgSurface}; border: 1px solid ${t.borderSubtle}; padding: 1em; }\n#typora-sidebar, #typora-sidebar .outline-content { background: ${t.bgSurface}; color: ${t.textMuted}; }\n.file-list-item.active, .file-node-content.active, .outline-active { color: ${t.textPrimary}; background: ${t.bgActive}; }\n.file-list-item:hover, .file-node-content:hover, .outline-item:hover { background: ${t.bgHover}; }\n#typora-quick-open, .megamenu-content, .dropdown-menu, .modal-content, .popover, .ty-tooltip { background: ${t.bgElevated}; color: ${t.textPrimary}; border-color: ${t.borderMain}; }\n#typora-quick-open input, .form-control { background: ${t.bgPage}; color: ${t.textPrimary}; border-color: ${t.borderMain}; }\n.btn-primary { background: ${t.accentPrimary}; color: ${on(t.accentPrimary)}; border-color: ${t.accentPrimary}; }\n#footer, .typora-sourceview-on #toggle-sourceview-btn { background: ${t.bgSurface}; color: ${t.textMuted}; }\n.CodeMirror { background: ${t.bgSurface}; color: ${t.textPrimary}; }\n.CodeMirror-gutters { background: ${t.bgSurface}; border-right: 1px solid ${t.borderSubtle}; }\n.CodeMirror-linenumber { color: ${t.textDim}; }\n.CodeMirror-cursor { border-left-color: ${t.accentLime}; }\n.CodeMirror-selected, .CodeMirror-focused .CodeMirror-selected { background: ${t.bgActive}; }\n.cm-s-inner .cm-comment { color: ${s.comment}; font-style: italic; }\n.cm-s-inner .cm-keyword, .cm-s-inner .cm-tag { color: ${s.keyword}; }\n.cm-s-inner .cm-atom, .cm-s-inner .cm-number { color: ${s.number}; }\n.cm-s-inner .cm-string, .cm-s-inner .cm-string-2 { color: ${s.string}; }\n.cm-s-inner .cm-variable { color: ${s.variable}; }\n.cm-s-inner .cm-variable-2, .cm-s-inner .cm-attribute { color: ${s.property}; }\n.cm-s-inner .cm-def, .cm-s-inner .cm-builtin { color: ${s.function}; }\n.cm-s-inner .cm-variable-3, .cm-s-inner .cm-type { color: ${s.type}; }\n.cm-s-inner .cm-operator, .cm-s-inner .cm-bracket { color: ${s.operator}; }\n.cm-s-inner .cm-error { color: ${t.torii}; text-decoration: underline; }\n@media print {\n  html, body, #write { background: #fff; color: #222; }\n  #write { max-width: none; padding: 0; }\n  h1, h2, h3, h4, h5, h6, a { color: #264d28; }\n  blockquote, code, pre, .md-fences, th, tr:nth-child(even) { background: #f3f4ee; color: #222; }\n  th, td, .md-fences { border-color: #b8c1b0; }\n}\n`;
}

function typora(palettes) {
  return descriptor('typora', 'Kokedera for Typora', 'Nine standalone Typora themes for writing, source code, tables and the surrounding interface.',
    Object.fromEntries(palettes.map(p => [`themes/kokedera-${p.id}.css`, typoraCSS(p)])),
    'Open **Preferences → Appearance → Open Theme Folder**, copy the nine `.css` files from `themes/` directly into that folder, then restart Typora. Select a variant from the **Themes** menu. You can assign different themes to the system light and dark modes in Appearance.\n\nEach file is standalone; there are no external fonts or supporting folders to install. Existing `base.user.css` or per-theme `.user.css` files still take precedence. Print output uses a paper background to avoid printing the dark canvas.',
    ['https://support.typora.io/About-Themes/', 'https://support.typora.io/Add-Custom-CSS/', 'https://theme.typora.io/doc/']);
}

function firefox(palettes) {
  const files = {};
  const icon = readFileSync(new URL('../brand/icon.png', import.meta.url));
  for (const p of palettes) {
    const t = p.tokens;
    files[`themes/${p.id}/icon.png`] = icon;
    files[`themes/${p.id}/manifest.json`] = json({
      manifest_version: 2, name: `Kokedera ${p.name}`, version: '1.0.0',
      description: `Kokedera ${p.name}: a ${p.scheme} moss temple palette for Firefox.`,
      author: 'Florian Mühlhans', homepage_url: 'https://kokedera.style',
      icons: { '512': 'icon.png' },
      browser_specific_settings: { gecko: { id: `kokedera-${p.id}@cappuccinotogo`, strict_min_version: '128.0', data_collection_permissions: { required: ['none'] } } },
      theme: { colors: {
        frame: t.bgSurface, frame_inactive: t.bgDeep, tab_background_text: t.textPrimary,
        tab_selected: t.bgPage, tab_text: t.textPrimary, tab_line: t.accentLime,
        tab_loading: t.accentLime, tab_background_separator: t.borderSubtle,
        toolbar: t.bgPage, toolbar_text: t.textPrimary, bookmark_text: t.textPrimary,
        toolbar_field: t.bgSurface, toolbar_field_text: t.textPrimary,
        toolbar_field_border: t.borderMain, toolbar_field_border_focus: t.accentPrimary,
        toolbar_field_focus: t.bgElevated, toolbar_field_text_focus: t.textPrimary,
        toolbar_field_highlight: selectionBackground(t), toolbar_field_highlight_text: t.textPrimary,
        toolbar_top_separator: t.borderSubtle, toolbar_bottom_separator: t.borderSubtle,
        toolbar_vertical_separator: t.borderMain, button_background_hover: t.bgHover,
        button_background_active: t.bgActive, icons: t.textPrimary,
        icons_attention: readable(t.accentLime, t.bgPage, t.textPrimary),
        popup: t.bgElevated, popup_text: t.textPrimary, popup_border: t.borderMain,
        popup_highlight: selectionBackground(t), popup_highlight_text: t.textPrimary,
        sidebar: t.bgSurface, sidebar_text: t.textPrimary, sidebar_border: t.borderSubtle,
        sidebar_highlight: selectionBackground(t), sidebar_highlight_text: t.textPrimary,
        ntp_background: t.bgPage, ntp_card_background: t.bgSurface, ntp_text: t.textPrimary,
      }, properties: { color_scheme: p.scheme, content_color_scheme: p.scheme } },
    });
  }
  files['package.json'] = json({ name: 'kokedera-firefox-themes', private: true, version: '1.0.0', scripts: {
    lint: 'node scripts/web-ext.mjs lint', build: 'node scripts/web-ext.mjs build',
  }, devDependencies: { 'web-ext': '^8.9.0' } });
  files['scripts/web-ext.mjs'] = `import { readdir } from 'node:fs/promises';\nimport { resolve } from 'node:path';\nimport webExt from 'web-ext';\nconst command = process.argv[2];\nif (!['lint', 'build'].includes(command)) throw new Error('Expected lint or build');\nfor (const variant of await readdir('themes')) {\n  const options = { sourceDir: resolve('themes', variant), artifactsDir: resolve('dist'), overwriteDest: true };\n  if (command === 'lint') { options.warningsAsErrors = true; }\n  await webExt.cmd[command](options, { shouldExitProgram: false });\n}\n`;
  files['.github/workflows/validate.yml'] = `name: Validate Firefox themes\non: [push, pull_request, workflow_dispatch]\npermissions:\n  contents: read\njobs:\n  validate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.12'\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '22'\n      - run: python scripts/verify.py\n      - run: npm install --no-audit --no-fund\n      - run: npm run lint\n      - run: npm run build\n      - uses: actions/upload-artifact@v4\n        with:\n          name: kokedera-firefox-unsigned\n          path: dist/*.zip\n`;
  return descriptor('firefox', 'Kokedera for Firefox', 'Nine native static Firefox themes for tabs, navigation, address bar, menus, sidebars and New Tab.', files,
    'For a local preview, open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on**, and choose `themes/<variant>/manifest.json`. Select the theme in `about:addons` if it is not activated automatically. Temporary themes disappear after restarting Firefox.\n\nTo validate and package: install Node.js 22+, run `npm install`, `npm run lint`, then `npm run build`. The ZIP files in `dist/` are **unsigned packages**, not installable permanent releases. Firefox Release/Beta requires Mozilla signing for permanent installation. Sign each variant through AMO (listed or unlisted) and install the resulting signed `.xpi` through **Install Add-on From File**. No store upload or signing occurs in these scripts. Every variant has its own stable add-on ID.\n\nRequires Firefox 128+. These are browser interface themes. Their light/dark preference is offered to compatible web pages, but arbitrary website colors are not changed.',
    ['https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme', 'https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/', 'https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/']);
}

function kde(palettes) {
  const files = {};
  for (const p of palettes) {
    const t = p.tokens;
    const colorSet = (background, alternate, foreground = t.textPrimary) => ({
      BackgroundNormal: background, BackgroundAlternate: alternate,
      ForegroundNormal: foreground, ForegroundInactive: t.textMuted,
      ForegroundActive: readable(t.accentLime, background, foreground),
      ForegroundLink: readable(t.stream, background, foreground),
      ForegroundVisited: readable(t.wisteria, background, foreground),
      ForegroundNegative: readable(t.torii, background, foreground),
      ForegroundNeutral: readable(t.bronze, background, foreground),
      ForegroundPositive: readable(t.cedar, background, foreground),
      DecorationFocus: t.accentPrimary, DecorationHover: t.accentLime,
    });
    const groups = {
      'Colors:View': colorSet(t.bgPage, t.bgDeep), 'Colors:Window': colorSet(t.bgSurface, t.bgElevated),
      'Colors:Button': colorSet(t.bgElevated, t.bgHover), 'Colors:Selection': colorSet(selectionBackground(t), t.bgHover),
      'Colors:Tooltip': colorSet(t.bgElevated, t.bgSurface), 'Colors:Complementary': colorSet(t.bgOverlay, t.bgDeep),
      'Colors:Header': colorSet(t.bgSurface, t.bgHover), 'Colors:Header][Inactive': colorSet(t.bgDeep, t.bgSurface),
    };
    let content = `# Kokedera ${p.name} - native KDE Plasma color scheme\n[General]\nName=Kokedera ${p.name}\nColorScheme=Kokedera${p.name}\nshadeSortColumn=true\n\n[KDE]\ncontrast=4\n\n`;
    content += Object.entries(groups).map(([name, colors]) => `[${name}]\n${Object.entries(colors).map(([key, value]) => `${key}=${rgbString(value)}`).join('\n')}\n`).join('\n');
    content += `\n[ColorEffects:Disabled]\nColor=${rgbString(t.bgSurface)}\nColorAmount=0\nColorEffect=0\nContrastAmount=0.55\nContrastEffect=1\nIntensityAmount=0\nIntensityEffect=0\n\n[ColorEffects:Inactive]\nChangeSelectionColor=false\nEnable=false\nColor=${rgbString(t.bgSurface)}\nColorAmount=0\nColorEffect=0\nContrastAmount=0\nContrastEffect=0\nIntensityAmount=0\nIntensityEffect=0\n\n[WM]\nactiveBackground=${rgbString(t.bgSurface)}\nactiveBlend=${rgbString(t.bgSurface)}\nactiveForeground=${rgbString(t.textPrimary)}\ninactiveBackground=${rgbString(t.bgDeep)}\ninactiveBlend=${rgbString(t.bgDeep)}\ninactiveForeground=${rgbString(t.textMuted)}\n`;
    files[`color-schemes/Kokedera${p.name}.colors`] = content;
  }
  return descriptor('kde', 'Kokedera for KDE Plasma', 'Nine native KDE color schemes for application surfaces, headers, selections, buttons and window decorations.', files,
    'Open **System Settings → Colors & Themes → Colors**, use **Install from File**, and choose a `.colors` file from `color-schemes/`. Alternatively, copy the files into `${XDG_DATA_HOME:-~/.local/share}/color-schemes/`, then reopen Colors and select the desired Kokedera variant.\n\nOn systems with the Plasma command-line helper, apply a copied scheme with `plasma-apply-colorscheme KokederaDusk` (replace the suffix for another variant).\n\nThese are native color schemes, not complete Plasma styles: icons, widget shapes, wallpapers and fonts remain user choices. KDE applications following the system scheme inherit the palette; custom application themes may override it.',
    ['https://docs.kde.org/stable_kf6/en/plasma-workspace/kcontrol/colors/index.html', 'https://develop.kde.org/docs/plasma/theme/theme-details/', 'https://develop.kde.org/docs/plasma/theme/theme-colors/']);
}

function jupyterVariables(p) {
  const t = p.tokens, s = p.syntax;
  const values = {
    'jp-layout-color0': t.bgDeep, 'jp-layout-color1': t.bgPage, 'jp-layout-color2': t.bgSurface,
    'jp-layout-color3': t.bgHover, 'jp-layout-color4': t.bgActive,
    'jp-border-color0': t.borderMain, 'jp-border-color1': t.borderMain,
    'jp-border-color2': t.borderSubtle, 'jp-border-color3': t.bgHover,
    'jp-inverse-border-color': t.textDim, 'jp-brand-color0': t.accentLime,
    'jp-brand-color1': t.accentPrimary, 'jp-brand-color2': t.bgActive, 'jp-brand-color3': t.bgHover,
    'jp-accent-color0': t.sage, 'jp-accent-color1': t.cedar,
    'jp-accent-color2': t.bgActive, 'jp-accent-color3': t.bgSurface,
    'jp-accept-color-normal': t.accentPrimary, 'jp-accept-color-hover': t.accentLime,
    'jp-accept-color-active': t.accentPrimary, 'jp-warn-color-normal': t.torii,
    'jp-warn-color-hover': t.bronze, 'jp-warn-color-active': t.torii,
    'jp-reject-color-normal': t.textDim, 'jp-reject-color-hover': t.textMuted,
    'jp-reject-color-active': t.textPrimary, 'jp-focus-outline-color': t.accentPrimary,
    'jp-switch-color': t.textDim, 'jp-switch-true-position-color': t.accentPrimary,
    'jp-ui-font-color0': t.textPrimary, 'jp-ui-font-color1': t.textPrimary,
    'jp-ui-font-color2': t.textMuted, 'jp-ui-font-color3': t.textDim,
    'jp-content-font-color0': t.textPrimary, 'jp-content-font-color1': t.textPrimary,
    'jp-content-font-color2': t.textMuted, 'jp-content-font-color3': t.textDim,
    'jp-ui-inverse-font-color0': on(t.accentPrimary), 'jp-ui-inverse-font-color1': on(t.accentPrimary),
    'jp-ui-inverse-font-color2': on(t.accentPrimary), 'jp-ui-inverse-font-color3': on(t.accentPrimary),
    'jp-content-link-color': readable(t.accentLime, t.bgPage, t.textPrimary),
    'jp-content-link-visited-color': t.wisteria, 'jp-content-link-hover-color': t.accentFirefly,
    'jp-warn-color0': t.lantern, 'jp-warn-color1': t.bronze, 'jp-warn-color2': t.gold, 'jp-warn-color3': `${t.bronze}33`,
    'jp-error-color0': t.torii, 'jp-error-color1': t.torii, 'jp-error-color2': t.torii, 'jp-error-color3': `${t.torii}33`,
    'jp-success-color0': t.accentLime, 'jp-success-color1': t.cedar, 'jp-success-color2': t.sage, 'jp-success-color3': `${t.cedar}33`,
    'jp-info-color0': t.stream, 'jp-info-color1': t.stream, 'jp-info-color2': t.stream, 'jp-info-color3': `${t.stream}33`,
    'jp-cell-editor-background': t.bgSurface, 'jp-cell-editor-border-color': t.borderSubtle,
    'jp-cell-editor-active-background': t.bgPage, 'jp-cell-editor-active-border-color': t.accentPrimary,
    'jp-cell-prompt-not-active-font-color': t.textDim, 'jp-cell-inprompt-font-color': t.accentLime,
    'jp-cell-outprompt-font-color': t.bronze, 'jp-notebook-select-background': t.bgSurface,
    'jp-notebook-multiselected-color': t.bgHover, 'jp-input-background': t.bgSurface,
    'jp-input-active-background': t.bgPage, 'jp-input-border-color': t.borderMain,
    'jp-input-active-border-color': t.accentPrimary, 'jp-toolbar-background': t.bgSurface,
    'jp-toolbar-border-color': t.borderSubtle, 'jp-toolbar-active-background': t.bgActive,
    'jp-toolbar-box-shadow': `0 1px 0 ${t.borderSubtle}`, 'jp-search-selected-match-background-color': t.bgActive,
    'jp-search-selected-match-color': t.textPrimary, 'jp-search-unselected-match-background-color': `${t.gold}44`,
    'jp-search-unselected-match-color': t.textPrimary, 'jp-rendermime-error-background': `${t.torii}22`,
    'jp-rendermime-table-row-background': t.bgSurface, 'jp-rendermime-table-row-hover-background': t.bgHover,
    'jp-dialog-background': `${t.bgOverlay}bb`, 'jp-console-prompt-box-shadow': `0 0 0 1px ${t.borderSubtle}`,
    'jp-mirror-editor-keyword-color': s.keyword, 'jp-mirror-editor-atom-color': s.boolean,
    'jp-mirror-editor-number-color': s.number, 'jp-mirror-editor-def-color': s.function,
    'jp-mirror-editor-variable-color': s.variable, 'jp-mirror-editor-variable-2-color': s.parameter,
    'jp-mirror-editor-variable-3-color': s.type, 'jp-mirror-editor-punctuation-color': s.operator,
    'jp-mirror-editor-property-color': s.property, 'jp-mirror-editor-operator-color': s.operator,
    'jp-mirror-editor-comment-color': s.comment, 'jp-mirror-editor-string-color': s.string,
    'jp-mirror-editor-string-2-color': s.regexp, 'jp-mirror-editor-meta-color': s.constant,
    'jp-mirror-editor-qualifier-color': s.type, 'jp-mirror-editor-builtin-color': s.function,
    'jp-mirror-editor-bracket-color': s.operator, 'jp-mirror-editor-tag-color': s.keyword,
    'jp-mirror-editor-attribute-color': s.property, 'jp-mirror-editor-header-color': s.keyword,
    'jp-mirror-editor-quote-color': s.string, 'jp-mirror-editor-link-color': t.stream,
    'jp-mirror-editor-error-color': t.torii, 'jp-mirror-editor-hr-color': t.borderMain,
    'jp-scrollbar-background-color': t.bgSurface,
    'jp-scrollbar-thumb-color': rgbString(t.textDim), 'jp-scrollbar-thumb-hover-color': rgbString(t.textMuted),
    'jp-scrollbar-thumb-active-color': rgbString(t.textMuted),
    'kokedera-bg': t.bgPage, 'kokedera-text': t.textPrimary, 'kokedera-selection': selectionBackground(t),
  };
  return values;
}

function jupyterlab(palettes) {
  const packageName = '@kokedera/jupyterlab-theme';
  const files = {
    '.gitignore': 'node_modules/\nlib/\ndist/\nbuild/\n.venv/\nvenv/\n__pycache__/\n*.py[cod]\n*.egg-info/\nkokedera_jupyterlab/labextension/\n.DS_Store\nThumbs.db\n',
    'package.json': json({ name: packageName, version: '1.0.0', description: 'Nine Kokedera moss temple themes for JupyterLab 4.',
      license: 'MIT', author: 'Florian Mühlhans', homepage: 'https://kokedera.style',
      repository: { type: 'git', url: `${monorepoUrl}.git`, directory: portPath('kokedera-theme-extension-jupyterlab') },
      keywords: ['jupyter', 'jupyterlab', 'jupyterlab-extension', 'theme', 'kokedera'],
      main: 'lib/index.js', types: 'lib/index.d.ts', files: ['lib/**/*', 'style/**/*', 'src/**/*'],
      scripts: { 'build:lib': 'tsc', 'build:labextension': 'jupyter-builder build .', build: 'npm run build:lib && npm run build:labextension', 'build:prod': 'npm run build', test: 'node --test tests/*.test.mjs' },
      dependencies: { '@jupyterlab/application': '^4.0.0', '@jupyterlab/apputils': '^4.0.0' },
      devDependencies: { '@jupyter/builder': '^1.2.0', typescript: '~5.9.3', '@types/react': '^18.0.26' },
      sideEffects: ['style/*.css'], jupyterlab: { extension: true, themePath: 'style/index.css', outputDir: 'kokedera_jupyterlab/labextension' },
      engines: { node: '>=22' },
    }),
    'tsconfig.json': json({ compilerOptions: { declaration: true, strict: true, target: 'ES2020', module: 'ESNext', moduleResolution: 'node', outDir: 'lib', rootDir: 'src', esModuleInterop: true, skipLibCheck: true, lib: ['ES2020', 'DOM'] }, include: ['src/**/*.ts'] }),
    'src/index.ts': `import type { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';\nimport { IThemeManager } from '@jupyterlab/apputils';\n\nconst variants = ${JSON.stringify(palettes.map(p => ({ id: p.id, name: `Kokedera ${p.name}`, isLight: p.scheme === 'light' })), null, 2)};\n\nconst plugin: JupyterFrontEndPlugin<void> = {\n  id: '${packageName}:plugin',\n  description: 'Nine Kokedera moss temple palettes.',\n  autoStart: true,\n  requires: [IThemeManager],\n  activate: (_app: JupyterFrontEnd, manager: IThemeManager): void => {\n    for (const variant of variants) {\n      manager.register({\n        name: variant.name,\n        displayName: variant.name,\n        isLight: variant.isLight,\n        themeScrollbars: true,\n        load: async () => {\n          document.documentElement.dataset.kokederaTheme = variant.id;\n          // Retain the complete built-in layout, typography and component foundation.\n          const base = variant.isLight ? 'light' : 'dark';\n          await manager.loadCSS('@jupyterlab/theme-' + base + '-extension/index.css');\n          await manager.loadCSS('${packageName}/index.css');\n        },\n        unload: async () => {\n          if (document.documentElement.dataset.kokederaTheme === variant.id) {\n            delete document.documentElement.dataset.kokederaTheme;\n          }\n        }\n      });\n    }\n  }\n};\nexport default plugin;\n`,
    'style/index.css': palettes.map(p => `/* Kokedera ${p.name}. Selectors prevent unused variants from overriding the active one. */\n:root[data-kokedera-theme="${p.id}"] {\n${declarations(jupyterVariables(p))}\n  color-scheme: ${p.scheme};\n}\n`).join('\n') + `\nhtml[data-kokedera-theme] .cm-selectionBackground,\nhtml[data-kokedera-theme] .cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground { background: var(--kokedera-selection); }\nhtml[data-kokedera-theme] ::selection { background: var(--kokedera-selection); color: var(--kokedera-text); }\nhtml[data-kokedera-theme] .jp-RenderedHTMLCommon blockquote { border-left-color: var(--jp-brand-color1); color: var(--jp-content-font-color2); }\n`,
    'pyproject.toml': `[build-system]\nrequires = ["hatchling>=1.20", "hatch-jupyter-builder>=0.9", "jupyter-builder>=1.2,<2"]\nbuild-backend = "hatchling.build"\n\n[project]\nname = "kokedera-jupyterlab"\nversion = "1.0.0"\ndescription = "Nine Kokedera moss temple themes for JupyterLab 4"\nreadme = "README.md"\nlicense = "MIT"\nrequires-python = ">=3.10"\nauthors = [{ name = "Florian Mühlhans" }]\ndependencies = ["jupyterlab>=4.0,<5"]\nclassifiers = ["Framework :: Jupyter :: JupyterLab :: 4", "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt", "Framework :: Jupyter :: JupyterLab :: Extensions :: Themes"]\n\n[project.urls]\nHomepage = "https://kokedera.style"\n\n[tool.hatch.build.targets.wheel]\npackages = ["kokedera_jupyterlab"]\n\n[tool.hatch.build.targets.wheel.shared-data]\n"kokedera_jupyterlab/labextension" = "share/jupyter/labextensions/${packageName}"\n"install.json" = "share/jupyter/labextensions/${packageName}/install.json"\n\n[tool.hatch.build.targets.sdist]\ninclude = ["kokedera_jupyterlab", "src", "style", "package.json", "package-lock.json", "tsconfig.json", "pyproject.toml", "install.json", "README.md", "LICENSE"]\nartifacts = ["kokedera_jupyterlab/labextension"]\n\n[tool.hatch.build.hooks.jupyter-builder]\ndependencies = ["hatch-jupyter-builder>=0.9"]\nbuild-function = "hatch_jupyter_builder.npm_builder"\nensured-targets = ["kokedera_jupyterlab/labextension/package.json", "kokedera_jupyterlab/labextension/themes/${packageName}/index.css"]\nskip-if-exists = ["kokedera_jupyterlab/labextension/package.json"]\n\n[tool.hatch.build.hooks.jupyter-builder.build-kwargs]\nbuild_cmd = "build:prod"\nnpm = ["npm"]\n`,
    'kokedera_jupyterlab/__init__.py': `"""Kokedera's prebuilt JupyterLab theme extension."""\n__version__ = "1.0.0"\n\ndef _jupyter_labextension_paths():\n    return [{"src": "labextension", "dest": "${packageName}"}]\n`,
    'install.json': json({ packageManager: 'python', packageName: 'kokedera-jupyterlab', uninstallInstructions: 'Run: python -m pip uninstall kokedera-jupyterlab' }),
    'tests/themes.test.mjs': `import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { readFile } from 'node:fs/promises';\nimport vm from 'node:vm';\n\ntest('registers all variants and loads the correct foundation without leaking selections', async () => {\n  const source = (await readFile('lib/index.js', 'utf8')).replace(/^import .*;$/gm, '').replace('export default plugin;', 'globalThis.plugin = plugin;');\n  const context = { IThemeManager: {}, document: { documentElement: { dataset: {} } } };\n  vm.runInNewContext(source, context);\n  const registered = [];\n  const styles = [];\n  context.plugin.activate({}, { register: theme => registered.push(theme), loadCSS: async path => styles.push(path) });\n  assert.equal(registered.length, 9);\n  assert.equal(new Set(registered.map(t => t.name)).size, 9);\n  for (const theme of registered) {\n    styles.length = 0;\n    await theme.load();\n    assert.equal(styles[0], '@jupyterlab/theme-' + (theme.isLight ? 'light' : 'dark') + '-extension/index.css');\n    assert.equal(styles[1], '${packageName}/index.css');\n    assert.equal(context.document.documentElement.dataset.kokederaTheme, theme.name.split(' ')[1].toLowerCase());\n    await theme.unload();\n    assert.equal(context.document.documentElement.dataset.kokederaTheme, undefined);\n  }\n});\n`,
  };
  files['.github/workflows/validate.yml'] = `name: Build JupyterLab themes\non: [push, pull_request, workflow_dispatch]\npermissions:\n  contents: read\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.12'\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '22'\n      - run: python scripts/verify.py\n      - run: python -m pip install "jupyterlab>=4,<5" "jupyter-builder>=1.2,<2" build\n      - run: npm install --no-audit --no-fund\n      - run: npm run build\n      - run: npm test\n      - run: python -m build --wheel\n      - run: python -m pip install dist/*.whl\n      - run: jupyter labextension list\n      - uses: actions/upload-artifact@v4\n        with:\n          name: kokedera-jupyterlab-wheel\n          path: dist/*.whl\n`;
  return descriptor('jupyterlab', 'Kokedera for JupyterLab', 'A prebuilt JupyterLab 4 extension registering all nine Kokedera light and dark themes.', files,
    'Requires Python 3.10+ and JupyterLab 4 with its standard JupyterLab Light and Dark theme packages.\n\nBuild a wheel from this repository with Node.js 22+ installed:\n\n```sh\npython -m venv .venv\n# Activate .venv for your platform.\npython -m pip install "jupyterlab>=4,<5" "jupyter-builder>=1.2,<2" build\nnpm install\nnpm run build\nnpm test\npython -m build --wheel\n```\n\nInstall the generated wheel into the environment running JupyterLab with `python -m pip install dist/kokedera_jupyterlab-1.0.0-py3-none-any.whl`, restart JupyterLab, then choose **Settings → Theme → Kokedera <variant>**. Installing a prebuilt wheel requires no Node.js and no `jupyter lab build`.\n\nThe nine registered themes declare their light/dark mode. Each loads the matching built-in JupyterLab foundation followed by Kokedera’s interface, notebook and syntax colors. Set the terminal theme to `inherit` to reuse the surrounding foreground/background; JupyterLab keeps its own terminal ANSI palette. This keeps native fonts and layout consistent as JupyterLab evolves. Remove with `python -m pip uninstall kokedera-jupyterlab`. A repository checkout is source; a successful build produces the prebuilt extension and wheel.',
    ['https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html', 'https://github.com/jupyterlab/extension-template', 'https://github.com/jupyterlab/jupyter-builder', 'https://jupyterlab.readthedocs.io/en/stable/developer/css.html']);
}

export function generate(palettes) {
  if (!Array.isArray(palettes) || palettes.length !== 9) throw new Error('Application ports require all nine Kokedera palettes.');
  return [obsidian(palettes), typora(palettes), firefox(palettes), kde(palettes), jupyterlab(palettes)];
}
