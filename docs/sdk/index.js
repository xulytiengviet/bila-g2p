import './converter.js';
export const converter = globalThis.CVNSSConverter;
if (!converter) throw new Error('CVNSS converter unavailable');
export function prepare(text,{input='cqn',allowAmbiguous=false}={}){
 if(typeof text!=='string'||!['cqn','cvss'].includes(input)) throw new TypeError('Invalid input');
 const source=text.normalize('NFC');
 const converted=input==='cqn'?converter.fromCqn(source):converter.fromCvss(source);
 const ambiguities=input==='cvss'?(source.match(/[a-z]+/gi)||[]).map(w=>converter.inspectWord(w,'cvss')).filter(x=>x.ambiguous):[];
 if(ambiguities.length&&!allowAmbiguous) throw Object.assign(new Error('Ambiguous CVNSS input; confirm canonical decoding'),{ambiguities});
 return {schema:'bila.phoneme.v1',language:'vi',input:{format:input,text:source},cqn:input==='cqn'?source:converted.cqn,cvss:input==='cvss'?source:converted.cvss,converter:converter.VERSION,ambiguities};
}
export class BilaG2P {
 constructor({phonemize,synthesize}={}){this.phonemizer=phonemize;this.audioBackend=synthesize;}
 async process(text,options){const ir=prepare(text,options);if(typeof this.phonemizer!=='function')throw new Error('Configure a phoneme backend');const phones=await this.phonemizer(ir.cqn);if(typeof phones!=='string'||!phones.trim())throw new Error('Invalid phoneme result');return {...ir,phonemes:phones};}
 async synthesize(ir,options={}){if(ir?.schema!=='bila.phoneme.v1'||typeof ir.phonemes!=='string')throw new TypeError('Invalid IR');if(typeof this.audioBackend!=='function')throw new Error('Configure an audio backend');return this.audioBackend(ir,options);}
}
export const fromCqn=text=>converter.fromCqn(text);
export const fromCvss=text=>converter.fromCvss(text);
export const audit=()=>converter.audit();
export const selfTest=()=>converter.selfTest();
export function httpPhonemizer(url){return async text=>{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});if(!r.ok)throw new Error('G2P HTTP '+r.status);return (await r.json()).phonemes;};}
