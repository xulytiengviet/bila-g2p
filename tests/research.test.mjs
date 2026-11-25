import {test} from 'node:test';import assert from 'node:assert/strict';import {trits,spectrum,irV2,taskDemo} from '../docs/sdk/research.js';
test('27 unique trit tuples',()=>assert.equal(new Set(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ_',s=>trits(s).join(','))).size,27));
test('FFT detects known bin',()=>{const a=spectrum(Array.from({length:1024},(_,i)=>Math.sin(2*Math.PI*32*i/1024)));assert.equal(a.indexOf(Math.max(...a)),32)});
test('IR preserves v1 and unknowns',()=>{const v={schema:'bila.phoneme.v1',cqn:'ma',cvss:'ma',phonemes:'ma'};assert.equal(irV2(v).legacy,v);assert.equal(irV2(v).phoneme.alignment,null);assert.throws(()=>irV2({}))});
test('action fails closed and never executes',()=>{assert.equal(taskDemo('move',true,false).decision,'BLOCKED');assert.equal(taskDemo('pick',true,true).executed,false);assert.throws(()=>taskDemo('unknown',true,true))});
