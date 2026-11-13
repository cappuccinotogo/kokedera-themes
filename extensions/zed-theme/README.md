# Kokedera Theme

<img src="icon.png" alt="The Kokedera golem's moss-covered face" width="128" height="128">

Bring the quiet of a moss-covered temple into your editor. Kokedera offers nine hand-tuned color themes inspired by forest greens, weathered stone, and warm lantern light — seven dark palettes and two light palettes.

> **[kokedera.style](https://kokedera.style)** — walk through the temple, explore its nine palettes, and find the matching file icons.

---

## About

Kokedera is a quiet temple among the roots of the World Tree, where moss covers the stone paths and a small golem tends the lanterns.

**Kokedera Theme** brings all nine palettes to [Zed](https://zed.dev). Choose a different hour, season, or weather in the same place.

## Variants

| Theme | Mood |
|---|---|
| **Kokedera Morning** | Light — warm paper grounds, greens that read like ink |
| **Kokedera Dusk** | Dark — deep forest greens, weathered stone and soft lantern light |
| **Kokedera Night** | Dark — near-black grounds, brighter greens and warm lantern contrast |
| **Kokedera Spring** | Dark — fresh greens and cherry blossom |
| **Kokedera Summer** | Dark — dense, saturated greens and a teal stream |
| **Kokedera Autumn** | Dark — rust, amber and ember over dark earth |
| **Kokedera Winter** | Light — cool pale grounds, steel blue and a quiet red |
| **Kokedera Rain** | Dark — wet teal, blue-green shadows and reflected lantern warmth |
| **Kokedera Mist** | Dark — soft, desaturated greens and blue-grey distance |

## Installation

Zed's extension registry still lists an older version of Kokedera Theme. Updates there depend on Zed's maintainers merging pull requests, and ours went unanswered for about two months, so new versions are published only in [kokedera-themes](https://github.com/cappuccinotogo/kokedera-themes). Install the current version from there as a dev extension:

1. Clone the repository: `git clone https://github.com/cappuccinotogo/kokedera-themes.git`
2. If you installed Kokedera Theme from Zed's extension list before, uninstall it there first.
3. Open the command palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Linux and Windows) and run **`zed: install dev extension`**.
4. Select the folder `extensions/zed-theme` in your clone.
5. Run **`theme selector: toggle`** and pick a variant, such as **Kokedera Dusk**.

To update, run `git pull` in your clone, open **`zed: extensions`** and rebuild the Kokedera Theme dev extension, or install it again.

If you prefer the registry version, search for **"Kokedera Theme"** under **`zed: extensions`** and click **Install**. It works, but it won't get updates.

## Pair with the icon theme

- **[Kokedera Icons](https://zed.dev/extensions/kokedera-icons)** — the matching file icon theme

## Also available for

- [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=7th-Layer.kokedera-theme)
- [JetBrains IDEs](https://plugins.jetbrains.com/plugin/30629-kokedera-moss-temple-theme)

## Local development

This extension contains only theme data; this repository has no compilation or packaging step. In Zed, run **`zed: install dev extension`** and select this folder. See [Developing Extensions](https://zed.dev/docs/extensions/developing-extensions) for the development workflow.

The golem logo appears in this README. Zed's [extension manifest](https://github.com/zed-industries/zed/blob/main/crates/extension/src/extension_manifest.rs) has no extension logo field.

## License

[MIT](LICENSE)
