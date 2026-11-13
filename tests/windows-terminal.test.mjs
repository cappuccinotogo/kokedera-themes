import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { generate } from '../generators/terminals.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const palettes = JSON.parse(readFileSync(resolve(root, 'data/palettes.json'), 'utf8'));
const [{ files }] = generate(palettes);
const schema = JSON.parse(readFileSync(resolve(root, 'tests/fixtures/terminal/windows-terminal-scheme.schema.json'), 'utf8'));
const pythonEnv = resolve(root, '.tools/validate-env', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const python = process.env.KOKEDERA_TEST_PYTHON || (existsSync(pythonEnv) ? pythonEnv : 'python');

test('Windows Terminal schemes match the pinned Microsoft schema, including its purple ANSI names', () => {
  const schemes = palettes.map(p => JSON.parse(files[`windows-terminal/schemes/kokedera-${p.id}.json`]));
  const fragment = JSON.parse(files['windows-terminal/kokedera.json']);
  assert.deepEqual(fragment.schemes, schemes);
  const script = String.raw`
import copy, json, sys, jsonschema
data=json.load(sys.stdin); schema=data['schema']
validator=jsonschema.validators.validator_for(schema)(schema)
ansi=set(schema['properties'])-{'name','background','foreground','cursorColor','selectionBackground'}
assert len(ansi)==16 and {'purple','brightPurple'}<=ansi
assert 'magenta' not in ansi and 'brightMagenta' not in ansi
assert len(data['schemes'])==9
for scheme in data['schemes']:
    errors=list(validator.iter_errors(scheme))
    assert not errors, (scheme['name'],[e.message for e in errors])
    assert set(scheme)==set(schema['properties']), scheme['name']
    # Regression checks prove the independent schema rejects the former bug,
    # rather than silently allowing unknown application-specific keys.
    for wrong,correct in [('magenta','purple'),('brightMagenta','brightPurple')]:
        broken=copy.deepcopy(scheme); broken[wrong]=broken.pop(correct)
        assert list(validator.iter_errors(broken)), wrong
    broken=copy.deepcopy(scheme); broken['purple']='not-a-color'
    assert list(validator.iter_errors(broken))
print('All nine schemes accepted; phantom ANSI keys and invalid colors rejected')
`;
  const result = spawnSync(python, ['-c', script], { input: JSON.stringify({ schema, schemes }), encoding: 'utf8', timeout: 30000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /phantom ANSI keys and invalid colors rejected/);
});
