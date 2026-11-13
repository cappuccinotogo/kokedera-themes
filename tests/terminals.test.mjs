import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { generate } from '../generators/terminals.mjs';

const palettes = JSON.parse(readFileSync(new URL('../data/palettes.json', import.meta.url), 'utf8'));
const [{ files }] = generate(palettes);
const colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
const rgb = (hex) => hex.slice(1).match(/../g).map((s) => parseInt(s, 16)).join(',');

test('all 15 terminal targets contain all nine palettes and individual installation guides', () => {
  const apps = ['ghostty', 'windows-terminal', 'iterm2', 'apple-terminal', 'kitty', 'alacritty', 'wezterm', 'warp', 'foot', 'konsole', 'xfce-terminal', 'terminator', 'putty', 'mobaxterm', 'termux'];
  assert.equal(palettes.length, 9);
  for (const app of apps) {
    assert.ok(files[`${app}/README.md`]?.length > 350, app);
    const themes = Object.keys(files).filter((key) => key.startsWith(`${app}/`) && !key.endsWith('README.md') && key !== 'windows-terminal/kokedera.json');
    assert.equal(themes.length, palettes.length, app);
  }
});

test('every terminal preserves ANSI order; PuTTY interleaves normal and bright slots', () => {
  const fragments = JSON.parse(files['windows-terminal/kokedera.json']);
  assert.equal(fragments.schemes.length, palettes.length);
  for (const p of palettes) {
    const stem = `kokedera-${p.id}`;
    const title = `Kokedera ${p.name}`;
    const scheme = JSON.parse(files[`windows-terminal/schemes/${stem}.json`]);
    assert.equal(scheme.background, p.terminal.background);
    assert.deepEqual(scheme, fragments.schemes.find((s) => s.name === title));
    const putty = files[`putty/${stem}.reg`];
    assert.ok(putty.includes(`Sessions\\${encodeURIComponent(title)}]`));
    assert.ok(!putty.includes('Default%20Settings'));
    assert.ok(putty.includes(`"Colour4"="${rgb(p.terminal.background)}"`));
    assert.ok(putty.includes(`"Colour5"="${rgb(p.terminal.cursor)}"`));
    p.terminal.ansi.forEach((hex, i) => {
      const windowsColor = i % 8 === 5 ? 'purple' : colors[i % 8];
      const key = i > 7 ? `bright${windowsColor[0].toUpperCase()}${windowsColor.slice(1)}` : windowsColor;
      assert.equal(scheme[key], hex);
      assert.ok(files[`ghostty/${title}`].includes(`palette = ${i}=${hex}\n`));
      assert.ok(files[`kitty/${stem}.conf`].includes(`color${i} ${hex}\n`));
      assert.ok(files[`termux/${stem}.properties`].includes(`color${i}=${hex}\n`));
      assert.ok(files[`foot/${stem}.ini`].includes(`${i < 8 ? 'regular' : 'bright'}${i % 8}=${hex.slice(1)}\n`));
      assert.ok(putty.includes(`"Colour${6 + (i % 8) * 2 + (i > 7 ? 1 : 0)}"="${rgb(hex)}"`));
      const mobaKey = `${i > 7 ? 'Bold' : ''}${colors[i % 8][0].toUpperCase()}${colors[i % 8].slice(1)}`;
      assert.ok(files[`mobaxterm/${stem}.ini`].includes(`${mobaKey}=${rgb(hex)}\n`));
    });
    assert.ok(files[`foot/${stem}.ini`].includes(`[colors-${p.scheme}]`));
    assert.ok(!files[`foot/${stem}.ini`].includes('[colors]'));
    assert.equal(scheme.purple,p.terminal.ansi[5]);
    assert.equal(scheme.brightPurple,p.terminal.ansi[13]);
    assert.ok(!('magenta' in scheme) && !('brightMagenta' in scheme));
  }
});

test('independent parsers read TOML and Apple NSKeyedArchiver colors with exact palette values', () => {
  const script = String.raw`
import json, plistlib, sys, tomllib
data = json.load(sys.stdin)
files, palettes = data['files'], data['palettes']
names = ['black','red','green','yellow','blue','magenta','cyan','white']
def hex_color(values):
    return '#' + ''.join(f'{round(float(x)*255):02x}' for x in values)
for p in palettes:
    stem, title, t = 'kokedera-' + p['id'], 'Kokedera ' + p['name'], p['terminal']
    alacritty = tomllib.loads(files[f'alacritty/{stem}.toml'])['colors']
    wezterm = tomllib.loads(files[f'wezterm/{stem}.toml'])
    assert wezterm['metadata']['name'] == title
    assert wezterm['colors']['ansi'] + wezterm['colors']['brights'] == t['ansi']
    assert [alacritty[group][name] for group in ['normal', 'bright'] for name in names] == t['ansi']
    iterm = plistlib.loads(files[f'iterm2/{title}.itermcolors'].encode())
    for i, expected in enumerate(t['ansi']):
        c = iterm[f'Ansi {i} Color']
        assert c['Color Space'] == 'sRGB'
        assert hex_color(c[k + ' Component'] for k in ['Red','Green','Blue']) == expected
    profile = plistlib.loads(files[f'apple-terminal/{title}.terminal'].encode())
    assert profile['name'] == title and profile['type'] == 'Window Settings'
    expected_colors = {'BackgroundColor': t['background'], 'TextColor': t['foreground'], 'TextBoldColor': t['foreground'], 'CursorColor': t['cursor'], 'SelectionColor': t['selectionBackground']}
    expected_colors.update({f'ANSI{"Bright" if i > 7 else ""}{names[i % 8].capitalize()}Color': v for i,v in enumerate(t['ansi'])})
    for key, expected in expected_colors.items():
        archive = plistlib.loads(profile[key])
        assert archive['$archiver'] == 'NSKeyedArchiver'
        assert archive['$version'] == 100000
        obj = archive['$objects'][archive['$top']['root'].data]
        cls = archive['$objects'][obj['$class'].data]
        assert cls['$classname'] == 'NSColor' and obj['NSColorSpace'] == 2
        assert obj['NSRGB'].endswith(b'\0')
        assert hex_color(obj['NSRGB'].rstrip(b'\0').split()) == expected
print('TOML and NSColor archives verified for all nine variants')
`;
  const output = execFileSync('python', ['-c', script], { input: JSON.stringify({ files, palettes }), encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 });
  assert.match(output, /verified for all nine variants/);
});
