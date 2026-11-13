import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('registers all variants and loads the correct foundation without leaking selections', async () => {
  const source = (await readFile('lib/index.js', 'utf8')).replace(/^import .*;$/gm, '').replace('export default plugin;', 'globalThis.plugin = plugin;');
  const context = { IThemeManager: {}, document: { documentElement: { dataset: {} } } };
  vm.runInNewContext(source, context);
  const registered = [];
  const styles = [];
  context.plugin.activate({}, { register: theme => registered.push(theme), loadCSS: async path => styles.push(path) });
  assert.equal(registered.length, 9);
  assert.equal(new Set(registered.map(t => t.name)).size, 9);
  for (const theme of registered) {
    styles.length = 0;
    await theme.load();
    assert.equal(styles[0], '@jupyterlab/theme-' + (theme.isLight ? 'light' : 'dark') + '-extension/index.css');
    assert.equal(styles[1], '@kokedera/jupyterlab-theme/index.css');
    assert.equal(context.document.documentElement.dataset.kokederaTheme, theme.name.split(' ')[1].toLowerCase());
    await theme.unload();
    assert.equal(context.document.documentElement.dataset.kokederaTheme, undefined);
  }
});
