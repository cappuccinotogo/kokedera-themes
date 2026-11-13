# Validation

Validation performed on Windows on 2026-09-12. Every distribution contains all nine variants. Native applications are listed separately from structural validation so that format checks are not mistaken for a live application test.

## Shared checks

- Stable palette identities: seven dark and two light variants.
- Main foreground and selection text contrast at least 4.5:1 on their respective backgrounds.
- Existing VS Code ANSI order and semantic syntax values preserved.
- Reproducible generators, common palette/generator hashes and per-file SHA-256 checksums.
- Independent JSON, TOML, YAML, XML/plist and CSS parsing.
- All fourteen distribution repositories covered; no missing application group.

## Native runtime checks

| Application | Version | Checks |
| --- | --- | --- |
| Neovim | 0.12.5 | All nine variants load; core, Tree-sitter, LSP and selected plugin highlights, options and overrides checked. |
| Vim | 9.2 | All nine color schemes load; foreground/background, keyword/string and ANSI values checked. |
| Emacs | 30.2 | All nine themes load and byte-compile; default/syntax, Org/Magit faces and ANSI values checked. |
| Starship | 1.26.0 | Eighteen success/error prompts render with no warnings. |
| fzf | 0.74.3 | All nine color arguments accepted; PowerShell snippets preserve existing options. |
| bat | 0.26.1 | All nine TextMate themes compile and render a Python sample. |
| JupyterLab | 4.6.3 | Extension build, lifecycle test, wheel build and install pass; all nine themes selected in the running app, with expected computed colors and no browser JavaScript errors. |
| Firefox packaging | web-ext | All nine static theme packages lint and build; no executable payload, permissions or data collection. Persistent installation still requires Mozilla signing. |

Portable validation executables are downloaded from the upstream projects into ignored `.tools/` directories and are never distributed. Native test cases explicitly skip when their runtime is absent. Set `KOKEDERA_NVIM_BIN`, `KOKEDERA_VIM_BIN` and `KOKEDERA_EMACS_BIN` to absolute executable paths to run editor checks elsewhere.

## Format and schema checks

- All 15 terminal formats retain the shared 16-color ordering. PuTTY's interleaved normal/bright keys are checked. Python `plistlib` decodes Apple Terminal's nested binary NSKeyedArchiver color objects and iTerm2 RGB values.
- All nine Starship, lazygit and Yazi configurations pass pinned upstream JSON schemas. Yazi flavors include their syntax theme, licenses and a palette preview.
- Zellij component names and RGB ranges are checked.
- Helix TOML, Sublime JSON and its palette-picker Python, Notepad++ native lexer/style XML, and Xcode plists are parsed independently.
- Obsidian/Typora/Jupyter CSS parses; Firefox manifests have unique IDs and readable UI color pairs; KDE includes the required color groups and selection contrast.

## Existing extensions and website

The unchanged VS Code color and icon extensions were packaged with Microsoft's `@vscode/vsce` 3.9.2. All nine source themes and 1,341 icon references were checked in the resulting VSIX archives. Cursor is not installed in this environment; these are validated declarative VS Code packages, with explicit Cursor installation instructions, not a claim of a Cursor runtime test.

The website passes ESLint, TypeScript, the production build, and SEO checks. Its new installation catalog has fifteen links (fourteen repositories plus the Cursor guide). Desktop and mobile layout checks across all nine palettes found no overflow or browser JavaScript errors; Dusk and Morning were inspected visually.

## Platform boundaries

Native visual checks remain outstanding for the terminal applications, Helix, Sublime Text, Notepad++, Xcode, Obsidian, Typora, Firefox, and KDE where their runtimes were unavailable. The repository instructions identify version-specific cases: modern foot sections, Xcode 27's changed theme system, and MobaXterm's established but undocumented INI format. None of the direct-install repositories claims theme-store approval or upstream bundling.

The JupyterLab theme uses its native light/dark foundation and inherited terminal foreground/background; JupyterLab retains its own terminal ANSI palette. The full Kokedera ANSI palette is supplied by the standalone terminal ports.
