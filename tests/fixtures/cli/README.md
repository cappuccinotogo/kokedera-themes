# Official CLI schema fixtures

Downloaded unchanged on 2026-09-12 for deterministic, offline schema validation.

| Fixture | Upstream source | Upstream license |
| --- | --- | --- |
| `starship-config.schema.json` | https://starship.rs/config-schema.json | [ISC](starship.LICENSE) |
| `lazygit-config.schema.json` | https://raw.githubusercontent.com/jesseduffield/lazygit/master/schema/config.json | [MIT](lazygit.LICENSE) |
| `yazi-theme.schema.json` | https://yazi-rs.github.io/schemas/theme.json | [MIT](yazi.LICENSE) |

The Yazi schema corresponds to the current 26.9.1 documentation. Zellij component validation follows https://zellij.dev/documentation/themes.html.

Native optional smoke tests use official portable Windows executables under `.tools/cli-native/`; binaries and caches are excluded from Git. They run Starship 1.26.0, fzf 0.74.3 and bat 0.26.1 against generated files without changing user configuration.
