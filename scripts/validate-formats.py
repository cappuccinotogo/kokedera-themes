"""Parse generated data using libraries independent of the JS generators."""
import json
import configparser
import pathlib
import plistlib
import sys
import tomllib
import xml.etree.ElementTree as ET

import tinycss2
import yaml

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.build').resolve()
count = 0
errors = []
for path in root.rglob('*'):
    if not path.is_file() or any(part in ('node_modules', '.git', 'lib', 'labextension', '__pycache__') for part in path.parts):
        continue
    ext = path.suffix.lower()
    ini = ext in ('.ini','.colorscheme','.colors') or (ext=='.theme' and path.parent.name=='xfce-terminal')
    if not ini and ext not in ('.json','.toml','.yaml','.yml','.css','.xml','.svg','.tmtheme','.itermcolors','.terminal','.xccolortheme','.sublime-theme','.sublime-color-scheme'):
        continue
    try:
        raw = path.read_bytes()
        if ini:
            parser = configparser.ConfigParser(interpolation=None)
            parser.optionxform = str
            parser.read_string(raw.decode('utf-8'))
        elif ext in ('.json','.sublime-theme','.sublime-color-scheme'):
            json.loads(raw)
        elif ext == '.toml':
            tomllib.loads(raw.decode('utf-8'))
        elif ext in ('.yaml','.yml'):
            yaml.safe_load(raw)
        elif ext == '.css':
            def visit(nodes):
                for node in nodes:
                    if node.type == 'error':
                        raise ValueError(node.message)
                    if node.type == 'qualified-rule':
                        visit(tinycss2.parse_declaration_list(node.content, skip_comments=True, skip_whitespace=True))
                    if node.type == 'at-rule' and node.content is not None and node.lower_at_keyword in ('media','supports','layer'):
                        visit(tinycss2.parse_rule_list(node.content, skip_comments=True, skip_whitespace=True))
            visit(tinycss2.parse_stylesheet(raw.decode('utf-8'), skip_comments=True, skip_whitespace=True))
        elif ext in ('.tmtheme','.itermcolors','.terminal','.xccolortheme'):
            plistlib.loads(raw)
        else:
            ET.fromstring(raw)
        count += 1
    except Exception as exc:
        errors.append(f'{path.relative_to(root)}: {exc}')
if errors:
    raise SystemExit('\n'.join(errors))
if not count:
    raise SystemExit('No generated configurations found')
print(f'Independently parsed {count} JSON, TOML, YAML, INI, XML/plist and CSS files.')
