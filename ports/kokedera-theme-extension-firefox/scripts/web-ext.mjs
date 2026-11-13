import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import webExt from 'web-ext';
const command = process.argv[2];
if (!['lint', 'build'].includes(command)) throw new Error('Expected lint or build');
for (const variant of await readdir('themes')) {
  const options = { sourceDir: resolve('themes', variant), artifactsDir: resolve('dist'), overwriteDest: true };
  if (command === 'lint') { options.warningsAsErrors = true; }
  await webExt.cmd[command](options, { shouldExitProgram: false });
}
