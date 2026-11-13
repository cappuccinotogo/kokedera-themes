import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const palettes = JSON.parse(await readFile(new URL('../data/palettes.json',import.meta.url)));
const expected=['dusk','morning','night','spring','summer','autumn','winter','rain','mist'];
test('all nine established palettes retain light/dark identity and complete colors',()=>{
  assert.deepEqual(palettes.map(p=>p.id),expected);
  assert.deepEqual(palettes.filter(p=>p.scheme==='light').map(p=>p.id),['morning','winter']);
  for (const p of palettes) {
    for (const colors of [p.tokens,p.syntax]) {
      for (const [key,value] of Object.entries(colors)) assert.match(value,/^#[\da-f]{6}$/i,`${p.id}.${key}`);
    }
    assert.equal(p.terminal.ansi.length,16);
    for (const color of p.terminal.ansi) assert.match(color,/^#[\da-f]{6}$/i);
    assert.equal(p.terminal.background,p.tokens.bgPage);
    assert.equal(p.terminal.foreground,p.tokens.textPrimary);
    assert.equal(p.syntax.function,p.tokens.bamboo);
    assert.equal(p.syntax.string,p.tokens.lantern);
    assert.equal(p.syntax.type,p.tokens.cedar);
    assert.ok(p.textmate.length>20);
  }
});
test('normal foregrounds remain readable on base and selection backgrounds',()=>{
  const lum=hex=>hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[0.2126,0.7152,0.0722][i],0);
  const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  for(const p of palettes) {
    assert.ok(contrast(p.tokens.textPrimary,p.tokens.bgPage)>=4.5,p.id);
    assert.ok(contrast(p.terminal.selectionForeground,p.terminal.selectionBackground)>=4.5,`${p.id} selection`);
  }
});
