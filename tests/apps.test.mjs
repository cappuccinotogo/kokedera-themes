import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { generate } from '../generators/apps.mjs';

const palettes = JSON.parse(await readFile(new URL('../data/palettes.json', import.meta.url), 'utf8'));
const ports = generate(palettes);
const get = suffix => ports.find(port => port.repo.endsWith(`-${suffix}`));
const luminance = hex => hex.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16) / 255)
  .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

test('each native app has all nine variants, with no missing color interpolation', () => {
  assert.equal(ports.length, 5);
  for (const p of palettes) {
    assert.ok(get('obsidian').files[`snippets/kokedera-${p.id}.css`].includes(`body.theme-${p.scheme}`));
    assert.ok(get('typora').files[`themes/kokedera-${p.id}.css`].includes(`color-scheme: ${p.scheme}`));
    assert.ok(get('kde').files[`color-schemes/Kokedera${p.name}.colors`]);
    assert.ok(get('jupyterlab').files['style/index.css'].includes(`data-kokedera-theme="${p.id}"`));
  }
  for (const port of ports) for (const [file, body] of Object.entries(port.files)) {
    if (file.endsWith('.css') || file.endsWith('.colors')) assert.doesNotMatch(body, /undefined|null/);
  }
});

test('Firefox uses unique static-theme IDs, readable UI pairs and no executable payload or data access', () => {
  const ids = new Set();
  for (const p of palettes) {
    const manifest = JSON.parse(get('firefox').files[`themes/${p.id}/manifest.json`]);
    ids.add(manifest.browser_specific_settings.gecko.id);
    assert.equal(manifest.permissions, undefined);
    assert.equal(manifest.background, undefined);
    assert.equal(manifest.content_scripts, undefined);
    assert.deepEqual(manifest.browser_specific_settings.gecko.data_collection_permissions.required, ['none']);
    const icon = get('firefox').files[`themes/${p.id}/${manifest.icons['512']}`];
    assert.ok(Buffer.isBuffer(icon), 'the packaged Firefox icon must be present');
    assert.equal(icon.readUInt32BE(16), 512);
    assert.equal(icon.readUInt32BE(20), 512);
    assert.equal(manifest.theme.properties.color_scheme, p.scheme);
    for (const [foreground, background] of [
      ['tab_text', 'tab_selected'], ['tab_background_text', 'frame'], ['toolbar_text', 'toolbar'],
      ['toolbar_field_text', 'toolbar_field'], ['toolbar_field_highlight_text', 'toolbar_field_highlight'],
      ['popup_text', 'popup'], ['popup_highlight_text', 'popup_highlight'],
      ['sidebar_text', 'sidebar'], ['sidebar_highlight_text', 'sidebar_highlight'], ['ntp_text', 'ntp_background'],
    ]) {
      assert.ok(contrast(manifest.theme.colors[foreground], manifest.theme.colors[background]) >= 4.5,
        `${p.name}: ${foreground} on ${background}`);
    }
  }
  assert.equal(ids.size, 9);
});

test('KDE writes every required color set and readable selection text', () => {
  for (const p of palettes) {
    const content = get('kde').files[`color-schemes/Kokedera${p.name}.colors`];
    for (const group of ['View', 'Window', 'Button', 'Selection', 'Tooltip', 'Complementary', 'Header']) {
      assert.ok(content.includes(`[Colors:${group}]`));
    }
    const selection = content.split('[Colors:Selection]\n')[1].split('\n\n')[0];
    const colors = Object.fromEntries(selection.split('\n').filter(Boolean).map(line => line.split('=')));
    const hex = rgb => '#' + rgb.split(',').map(value => Number(value).toString(16).padStart(2, '0')).join('');
    assert.ok(contrast(hex(colors.ForegroundNormal), hex(colors.BackgroundNormal)) >= 4.5, p.name);
  }
});
