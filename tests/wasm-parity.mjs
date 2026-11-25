import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createWasmG2P} from '../docs/wasm-runtime.js';
const cases=['Tôi yêu tiếng Việt','Xin chào Việt Nam','Giá 4.200,5 đồng.','Hôm nay là 25/11/2026.','Hãy gửi email đến support@example.com.','Tôi dùng AI và ROS 2.','Müller ở Hà Nội.'];
const native=execFileSync('cargo',['run','--quiet','--release','--locked','--no-default-features','--example','bila_parity','--',...cases],{encoding:'utf8'}).trimEnd().split(/\r?\n/);
const engine=await createWasmG2P(readFileSync('target/wasm32-unknown-unknown/release/sea_g2p_rs.wasm'),readFileSync('python/sea_g2p/sea_g2p.bin'));
for(let i=0;i<cases.length;i++){const actual=engine.phonemize(cases[i]);assert.ok(actual.trim());assert.equal(actual,native[i],cases[i]);console.log('PASS',cases[i]);}
