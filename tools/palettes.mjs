// Writes brand/palettes.svg, the color overview shown in the README, from
// data/palettes.json. Each palette is a card with its background, a short
// code sample in its syntax colors and its main accent colors.
//
// Usage:
//   node tools/palettes.mjs          write brand/palettes.svg
//   node tools/palettes.mjs --check  fail if brand/palettes.svg or the README palette table is out of date
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'brand/palettes.svg');

const CARD_W = 304, CARD_H = 196, GAP = 24, COLUMNS = 3;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SANS = 'system-ui, -apple-system, Segoe UI, sans-serif';

const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

// One line of code as colored runs: [text, color, italic?]
const tspans = runs => runs.map(([text, fill, italic]) =>
  `<tspan fill="${fill}"${italic ? ' font-style="italic"' : ''}>${escape(text)}</tspan>`).join('');

function card(p, index) {
  const x = (index % COLUMNS) * (CARD_W + GAP);
  const y = Math.floor(index / COLUMNS) * (CARD_H + GAP);
  const t = p.tokens, s = p.syntax;
  const code = [
    [[`// ${p.name.toLowerCase()} at the temple`, s.comment, true]],
    [['const ', s.keyword], ['path', s.variable], [' = ', s.operator], ['"moss"', s.string], [';', s.operator]],
    [['new ', s.keyword], ['Lantern', s.type], ['(', s.operator], ['9', s.number], [').', s.operator], ['light', s.function], ['()', s.operator]],
  ];
  const swatches = [s.keyword, s.function, s.type, s.string, s.number, t.torii, t.wisteria, t.stream];
  return `  <g transform="translate(${x} ${y})">
    <rect width="${CARD_W}" height="${CARD_H}" rx="14" fill="${t.bgPage}" stroke="${t.borderMain}"/>
    <text x="20" y="38" font-family="${SANS}" font-size="20" font-weight="600" fill="${t.textPrimary}">${escape(p.name)}</text>
    <text x="${CARD_W - 20}" y="37" text-anchor="end" font-family="${SANS}" font-size="12" letter-spacing="1" fill="${t.textMuted}">${p.scheme.toUpperCase()}</text>
    <rect x="16" y="54" width="${CARD_W - 32}" height="84" rx="8" fill="${t.bgSurface}"/>
${code.map((line, i) => `    <text x="30" y="${80 + i * 22}" font-family="${MONO}" font-size="13" xml:space="preserve">${tspans(line)}</text>`).join('\n')}
${swatches.map((color, i) => `    <circle cx="${29 + i * 35}" cy="166" r="11" fill="${color}"/>`).join('\n')}
  </g>`;
}

export async function render() {
  const palettes = JSON.parse(await readFile(resolve(root, 'data/palettes.json'), 'utf8'));
  const rows = Math.ceil(palettes.length / COLUMNS);
  const width = COLUMNS * CARD_W + (COLUMNS - 1) * GAP;
  const height = rows * CARD_H + (rows - 1) * GAP;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${width + 2} ${height + 2}" width="${width + 2}" height="${height + 2}" role="img" aria-label="The nine Kokedera palettes: ${palettes.map(p => p.name).join(', ')}">
${palettes.map(card).join('\n')}
</svg>
`;
}

// The README's palette table repeats background, text and accent as hex codes.
async function checkReadme() {
  const palettes = JSON.parse(await readFile(resolve(root, 'data/palettes.json'), 'utf8'));
  const readme = await readFile(resolve(root, 'README.md'), 'utf8');
  for (const p of palettes) {
    const t = p.tokens;
    const row = `| **${p.name}** | ${p.scheme} | \`${t.bgPage}\` | \`${t.textPrimary}\` | \`${t.accentPrimary}\` |`;
    if (!readme.includes(row)) throw new Error(`README palette table is out of date for ${p.name}. Expected a row starting with: ${row}`);
  }
}

async function main() {
  const svg = await render();
  if (process.argv.includes('--check')) {
    const current = await readFile(output, 'utf8').catch(() => null);
    if (current?.replaceAll('\r\n', '\n') !== svg) throw new Error('brand/palettes.svg is out of date. Run node tools/palettes.mjs.');
    await checkReadme();
    console.log('brand/palettes.svg and the README palette table are up to date');
  } else {
    await writeFile(output, svg);
    console.log('wrote brand/palettes.svg');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
