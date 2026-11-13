# Cursor compatibility

Cursor's editor supports VS Code color themes and file icon themes. Use the existing Kokedera extensions rather than a duplicate palette port:

- [Kokedera Theme](https://github.com/cappuccinotogo/kokedera-themes/tree/main/extensions/vscode-theme)
- [Kokedera Icons](https://github.com/cappuccinotogo/kokedera-themes/tree/main/extensions/vscode-icons)

In Cursor's Agents Window, run **Open IDE** first. Search for Kokedera in the editor's Extensions view. If the extensions are not listed in its registry, download the verified packages from this collection's release:

- [Kokedera Theme 2.0.0 VSIX](https://github.com/cappuccinotogo/kokedera-themes/releases/download/v1.0.0/kokedera-theme-2.0.0.vsix)
- [Kokedera Icons 2.0.0 VSIX](https://github.com/cappuccinotogo/kokedera-themes/releases/download/v1.0.0/kokedera-icons-2.0.0.vsix)

Use **Extensions: Install from VSIX…**, then **Preferences: Color Theme** or **Preferences: File Icon Theme** and the desired Kokedera variant. These packages are built from the unchanged existing extension repositories using Microsoft's `@vscode/vsce` 3.9.2. The package contents were compared byte-for-byte with their source files.

Cursor's registry availability may differ from the VS Code Marketplace. Installing a color theme in the editor does not imply that Cursor's separate agent interface exposes the same theming controls.

The existing theme manifest is declarative (`contributes.themes`), with nine color-theme JSON files and no executable extension entrypoint. The matching icon manifest is declarative as well. A Cursor runtime is not installed in the build environment, so live compatibility has not been asserted.

References: [Cursor themes](https://cursor.com/help/customization/themes), [Cursor extensions](https://cursor.com/help/customization/extensions).
