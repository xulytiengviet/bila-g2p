// SPDX-License-Identifier: MIT
import {prepare} from './index.js';
const alphabet=' ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
// Reversible transport of UTF-8 bytes; two base27 digits per byte, not compression.
export function pack27(text){if(typeof text!=='string')throw new TypeError('text');return Array.from(encoder.encode(text),b=>alphabet[Math.floor(b/27)]+alphabet[b%27]).join('')}
export function unpack27(code){if(typeof code!=='string'||code.length%2)throw new TypeError('invalid base27');const bytes=[];for(let i=0;i<code.length;i+=2){const a=alphabet.indexOf(code[i]),b=alphabet.indexOf(code[i+1]),v=a*27+b;if(a<0||b<0||v>255)throw new TypeError('invalid base27 byte');bytes.push(v)}return decoder.decode(Uint8Array.from(bytes))}
export function trits27(code){return Array.from(code,c=>{let n=alphabet.indexOf(c);if(n<0)throw new TypeError('invalid symbol');return [Math.floor(n/9)-1,Math.floor(n/3)%3-1,n%3-1]})}
export async function phoneticIR(text,{phonemize,input='cqn',allowAmbiguous=false,language='vi',dialect='unspecified'}={}){
 if(typeof phonemize!=='function')throw new Error('Real SEA-G2P adapter required');
 if(language!=='vi')throw new Error('CVNSS adapter currently supports vi only');
 const ir=prepare(text,{input,allowAmbiguous});const phones=await phonemize(ir.cqn);
 if(typeof phones!=='string'||!phones.trim())throw new Error('Invalid phoneme result');
 return {...ir,schema:'bila.upi.v1',dialect,phonemes:phones,phonemeSource:'configured-backend',base27:pack27(phones),transport:'utf8-byte-pair-v1'};
}
// P2G is a candidate lookup, never a guaranteed inverse.
export async function p2g(phones,candidates,{phonemize}={}){
 if(typeof phones!=='string'||!Array.isArray(candidates)||candidates.length>1000||typeof phonemize!=='function')throw new TypeError('Invalid P2G request');
 const norm=s=>s.normalize('NFC').trim().replace(/\s+/gu,' ');
 const matches=[];for(const word of new Set(candidates)){if(typeof word!=='string')throw new TypeError('candidate');const p=await phonemize(word);if(typeof p!=='string')throw new Error('Invalid phoneme result');if(norm(p)===norm(phones))matches.push(word)}
 return {matches,status:matches.length===1?'unique-in-candidates':matches.length?'ambiguous':'unknown'};
}
export async function recognize(audio,{asr,phonemize}={}){if(typeof asr!=='function')throw new Error('ASR adapter required');const transcript=await asr(audio);if(typeof transcript!=='string')throw new Error('Invalid transcript');return phoneticIR(transcript,{phonemize})}
export async function speak(ir,{tts,options={}}={}){if(ir?.schema!=='bila.upi.v1'||typeof ir.cqn!=='string'||typeof tts!=='function')throw new TypeError('UPI and TTS adapter required');return tts(ir.cqn,options)}
