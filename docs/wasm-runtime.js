// Raw Rust WASM ABI; no server or synthetic phonemes.
export async function createWasmG2P(wasmBytes,dictBytes){
 const {instance}=await WebAssembly.instantiate(wasmBytes,{});
 const e=instance.exports;
 function withBytes(bytes,fn){const p=e.bila_alloc(bytes.length);try{new Uint8Array(e.memory.buffer,p,bytes.length).set(bytes);return fn(p,bytes.length);}finally{e.bila_free(p,bytes.length);}}
 if(!withBytes(new Uint8Array(dictBytes),e.bila_init))throw Error('Không thể khởi tạo từ điển SEAP');
 return {phonemize(text){const bytes=new TextEncoder().encode(text);if(bytes.length>16384)throw Error('Giới hạn 16 KB mỗi lượt');if(!withBytes(bytes,e.bila_phonemize))throw Error('WASM G2P thất bại');return new TextDecoder().decode(new Uint8Array(e.memory.buffer,e.bila_result_ptr(),e.bila_result_len()));}};
}
const base='https://raw.githubusercontent.com/xulytiengviet/bila-g2p/wasm-runtime/';
const cacheName='bila-g2p-runtime-v1';
async function verified(url,hash,cache){let r=await cache.match(url);if(!r){r=await fetch(url);if(!r.ok)throw Error('HTTP '+r.status);}
 const bytes=await r.arrayBuffer();const actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 if(actual!==hash){await cache.delete(url);throw Error('SHA-256 không khớp');}
 await cache.put(url,new Response(bytes));return bytes;
}
export async function loadOfflineRuntime(){
 const cache=await caches.open(cacheName);
 let r;try{r=await fetch(base+'manifest.json',{cache:'no-store'});if(!r.ok)throw Error('Manifest HTTP '+r.status);}catch(e){r=await cache.match(base+'manifest.json');if(!r)throw e;}
 const m=await r.json();if(!/^[a-f0-9]{40}$/.test(m.source)||!/^([a-f0-9]{64})$/.test(m.wasm)||!/^([a-f0-9]{64})$/.test(m.dictionary))throw Error('Manifest không hợp lệ');
 const wasm=await verified(base+'sea_g2p_rs.wasm',m.wasm,cache);
 const dict=await verified('https://raw.githubusercontent.com/xulytiengviet/bila-g2p/'+m.source+'/python/sea_g2p/sea_g2p.bin',m.dictionary,cache);
 const engine=await createWasmG2P(wasm,dict);await cache.put(base+'manifest.json',new Response(JSON.stringify(m)));return engine;
}
