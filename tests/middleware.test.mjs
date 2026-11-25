import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare,BilaG2P,selfTest} from '../docs/sdk/index.js';
test('converter self test',()=>assert.equal(selfTest().ok,true));
test('preserves original Unicode',()=>assert.equal(prepare('Tôi yêu tiếng Việt').cqn,'Tôi yêu tiếng Việt'));
test('explicit phoneme adapter',async()=>{const g=new BilaG2P({phonemize:async t=>{assert.equal(t,'tôi');return 'mock';}});assert.equal((await g.process('tôi')).phonemes,'mock');});
test('no fabricated phonemes',async()=>assert.rejects(new BilaG2P().process('tôi')));
test('invalid format',()=>assert.throws(()=>prepare('tôi',{input:'auto'})));
