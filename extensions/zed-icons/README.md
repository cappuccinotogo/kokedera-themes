# Kokedera Icons

<img src="icon.png" alt="The Kokedera golem's moss-covered face" width="128" height="128">

Bring the quiet of a moss-covered temple into your project tree. Kokedera Icons offers file and folder icons inspired by forest greens, weathered stone, and warm lantern light — nine sets matching Kokedera Theme.

> **[kokedera.style](https://kokedera.style)** — walk through the temple, explore its nine palettes, and find the matching file icons.

---

## About

Kokedera is a quiet temple among the roots of the World Tree, where moss covers the stone paths and a small golem tends the lanterns.

**Kokedera Icons** brings nine matching file icon sets to [Zed](https://zed.dev), designed to pair with [Kokedera Theme](https://zed.dev/extensions/kokedera-theme). Clear shapes help you find files and folders at a glance.

- **File & folder icons** covering languages, frameworks, configs, DevOps, docs, and media
- **Named folder icons** with collapsed/expanded variants (src, lib, tests, components, api, database, docker, and more)
- **Hundreds of file name & extension mappings** — from `.rs` to `.prisma` to `kustomization.yaml`

## Icon sets

One set per Kokedera color theme variant — pick the one matching your theme in **Select Icon Theme**: Morning, Dusk, Night, Spring, Summer, Autumn, Winter, Rain, Mist. Morning and Winter are tuned for light sidebars.

## Installation

Zed's extension registry still lists an older version of Kokedera Icons. Updates there depend on Zed's maintainers merging pull requests, and ours went unanswered for about two months, so new versions are published only in [kokedera-themes](https://github.com/cappuccinotogo/kokedera-themes). Install the current version from there as a dev extension:

1. Clone the repository: `git clone https://github.com/cappuccinotogo/kokedera-themes.git`
2. If you installed Kokedera Icons from Zed's extension list before, uninstall it there first.
3. Open the command palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Linux and Windows) and run **`zed: install dev extension`**.
4. Select the folder `extensions/zed-icons` in your clone.
5. Run **`icon theme selector: toggle`** and pick the variant matching your theme, such as **Kokedera Icons Dusk**.

To update, run `git pull` in your clone, open **`zed: extensions`** and rebuild the Kokedera Icons dev extension, or install it again.

If you prefer the registry version, search for **"Kokedera Icons"** under **`zed: extensions`** and click **Install**. It works, but it won't get updates.

## Pair with the color theme

For the full experience, install the matching color theme:

- **[Kokedera Theme](https://zed.dev/extensions/kokedera-theme)**

## Local development

This extension contains only icon theme data and SVG assets; this repository has no compilation or packaging step. In Zed, run **`zed: install dev extension`** and select this folder. See [Developing Extensions](https://zed.dev/docs/extensions/developing-extensions) for the development workflow.

The golem logo appears in this README. Zed's [extension manifest](https://github.com/zed-industries/zed/blob/main/crates/extension/src/extension_manifest.rs) has no extension logo field.

## License

[MIT](LICENSE)
