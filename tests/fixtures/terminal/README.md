# Windows Terminal scheme schema

The fixture extracts the unchanged `$defs.SchemeList.items` and `$defs.Color` definitions from Microsoft's official [profiles schema](https://raw.githubusercontent.com/microsoft/terminal/86b31d0a3bf273c73b9e2a48c95b9825a7296189/doc/cascadia/profiles.schema.json), pinned at commit `86b31d0a3bf273c73b9e2a48c95b9825a7296189`. Retrieved 2026-09-12.

SHA-256 of the complete upstream source before extraction: `824d1adf895ab269ef1913da81b41e664c5c67275fa3c224e13bad1c13f2a3f6`.

Microsoft's [MIT license](LICENSE.windows-terminal) is included. The test additionally requires all 16 ANSI fields to be present; Windows Terminal's schema permits partial schemes.
