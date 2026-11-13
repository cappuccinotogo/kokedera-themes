# Native Notepad++ coverage

Theme XML is generated from the shared Kokedera palette. Native lexer names, numeric style identifiers and keyword-class names were checked against the official Notepad++ stylers model on 2026-09-12. 92 native lexer definitions and 53 global widget styles are included. The factual identifier table is retained by the generator; upstream theme colors and fonts are not copied.

Source: https://github.com/notepad-plus-plus/notepad-plus-plus/blob/master/PowerEditor/src/stylers.model.xml

Language-specific lexer limitations still apply: a theme can only color the token categories that each lexer exposes. User Defined Languages have separate styling. Syntax themes do not fully skin native window chrome; choose Notepad++ Dark Mode separately when using a dark palette.
