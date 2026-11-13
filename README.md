<p align="center"><img src="brand/golem.svg" width="88" alt="Kokedera's stone golem"></p>

<h1 align="center">Kokedera</h1>

<p align="center">
  Nine color themes and matching file icons, inspired by forest greens, weathered stone and warm lantern light.<br>
  <a href="https://kokedera.style"><strong>kokedera.style</strong></a>
</p>

<p align="center"><img src="brand/palettes.svg" width="100%" alt="The nine Kokedera palettes: Dusk, Morning, Night, Spring, Summer, Autumn, Winter, Rain and Mist"></p>

## Install

| | Color theme | File icons |
| --- | --- | --- |
| **VS Code** · Cursor | [Marketplace](https://marketplace.visualstudio.com/items?itemName=7th-Layer.kokedera-theme) | [Marketplace](https://marketplace.visualstudio.com/items?itemName=7th-Layer.kokedera-icons) |
| **JetBrains IDEs** | [Marketplace](https://plugins.jetbrains.com/plugin/30629-kokedera-moss-temple-theme) | [Marketplace](https://plugins.jetbrains.com/plugin/30777-kokedera-icons-moss-temple-icons) |
| **Zed** | [Dev extension](#zed) | [Dev extension](#zed) |

Then pick a variant in your editor's theme selector. Cursor uses the VS Code extensions ([notes](docs/cursor.md)).

### Zed

Zed's extension list still has older versions (Theme 2.0.0, Icons 1.1.0). Updates there depend on Zed merging pull requests, and ours sat unanswered for about two months, so new versions are only published here. Installing them takes a minute:

1. `git clone https://github.com/cappuccinotogo/kokedera-themes.git`
2. If you installed Kokedera from Zed's extension list, uninstall it first.
3. In Zed, run **`zed: install dev extension`** and select `extensions/zed-theme`. Do the same for `extensions/zed-icons`.

To update, `git pull` and rebuild both dev extensions under **`zed: extensions`**. No Rust or other tools needed.

## More apps

Every folder has its own short install guide. Or grab all of them at once from the [latest release](https://github.com/cappuccinotogo/kokedera-themes/releases/latest) (`kokedera-all-ports-<version>.zip`).

| Group | Apps |
| --- | --- |
| **Editors** | [Neovim](ports/kokedera-theme-extension-neovim) · [Vim](ports/kokedera-theme-extension-vim) · [Helix](ports/kokedera-theme-extension-helix) · [Sublime Text](ports/kokedera-theme-extension-sublime) · [Emacs](ports/kokedera-theme-extension-emacs) · [Notepad++](ports/kokedera-theme-extension-notepadpp) · [Xcode](ports/kokedera-theme-extension-xcode) |
| **[Terminals](ports/kokedera-theme-terminals)** | Ghostty · Windows Terminal · iTerm2 · Apple Terminal · kitty · Alacritty · WezTerm · Warp · foot · Konsole · XFCE Terminal · Terminator · PuTTY · MobaXterm · Termux |
| **[Command line](ports/kokedera-theme-cli)** | Starship · tmux · Zellij · lazygit · fzf · btop · Yazi · bat |
| **Notes & desktop** | [Obsidian](ports/kokedera-theme-extension-obsidian) · [Typora](ports/kokedera-theme-extension-typora) · [JupyterLab](ports/kokedera-theme-extension-jupyterlab) · [Firefox](ports/kokedera-theme-extension-firefox) · [KDE Plasma](ports/kokedera-theme-extension-kde) |

## Palettes

| | Mode | Background | Text | Accent | Mood |
| --- | --- | --- | --- | --- | --- |
| **Dusk** | dark | `#121a11` | `#c8d8b8` | `#4ca64c` | Forest greens, weathered stone, soft lantern light |
| **Morning** | light | `#f4f2e6` | `#333f2c` | `#2e7d32` | Warm paper and greens like ink |
| **Night** | dark | `#0a0e09` | `#e5eedc` | `#5abf5a` | Near-black, bright greens, lantern contrast |
| **Spring** | dark | `#1b2317` | `#e7ead6` | `#7ac93e` | Fresh greens and cherry blossom |
| **Summer** | dark | `#0c1a0b` | `#d2e7bd` | `#2ec75a` | Dense greens and a teal stream |
| **Autumn** | dark | `#1a1511` | `#d8c1b8` | `#b57e55` | Rust, amber and ember |
| **Winter** | light | `#eef0ee` | `#323c36` | `#25708f` | Pale grounds, steel blue, a quiet red |
| **Rain** | dark | `#111a19` | `#b8d8c8` | `#4ca6a6` | Wet teal and reflected lantern light |
| **Mist** | dark | `#191e19` | `#aab69e` | `#6ba263` | Soft grey-greens and blue-grey distance |

All colors live in [`data/palettes.json`](data/palettes.json).

## Feedback

A color that's hard to read, a missing icon, an app you'd like to see? [Open an issue](https://github.com/cappuccinotogo/kokedera-themes/issues). Pull requests are welcome.

<details>
<summary><strong>Development</strong></summary>

<br>

You need Node.js 24+ and Python 3.12+. The JetBrains plugins also need Java 21.

```sh
python -m pip install -r requirements-validation.txt
npm test
npm run build      # regenerate ports/, the icon copies and brand/palettes.svg
npm run check      # fail if anything generated is out of date
npm run validate
npm run validate:formats
npm run package    # reproducible ZIP archives in dist/
```

| Path | Contents |
| --- | --- |
| `data/palettes.json` | The nine palettes. Refresh with `npm run sync` from the private website checkout (`../kokedera` or `KOKEDERA_SITE`). |
| `icons/` | Every file icon once. `tools/icons.mjs` writes the per-editor copies. |
| `extensions/` | VS Code, JetBrains and Zed extensions, with their full history |
| `generators/`, `scripts/` | Port generators, sync, validation and packaging |
| `ports/` | The generated ports. Don't edit by hand, regenerate. |
| `brand/` | Golem, app icon and the palette overview (`tools/palettes.mjs`) |

Each port has a `kokedera.json` manifest with palette and generator hashes and per-file checksums. `python scripts/verify.py` inside a port folder checks it.

</details>

## License

[MIT](LICENSE) · Kokedera by Florian Mühlhans
