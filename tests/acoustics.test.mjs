import {test} from 'node:test';import assert from 'node:assert/strict';import {atlas,fftFrame,frames,stats,sampleSignal} from '../docs/sdk/acoustics.js';
test('calibrated FFT sine',()=>{for(const n of [512,1024,2048]){const a=Float32Array.from({length:n},(_,i)=>Math.sin(2*Math.PI*32*i/n));const d=fftFrame(a,0,n);assert.equal(d.indexOf(Math.max(...d)),32);assert.ok(Math.abs(d[32])<.01)}});
test('bounded frames and short audio',()=>{assert.equal(frames(new Float32Array(3),1024).frames.length,1);assert.ok(frames(new Float32Array(1000000),512).frames.length<=420)});
test('stats and atlas',()=>{assert.deepEqual(stats([1,-1]),{peak:1,rms:1});assert.equal(sampleSignal().length,32000);assert.equal(atlas.m.nasal,true);assert.equal(atlas.t.voiced,false)});
