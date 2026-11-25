const CACHE='bila-studio-v3';
const assets=['./','./index.html','./studio.css','./studio.js','./i18n.js','./assets/flag-vi.svg','./assets/flag-en.svg','./LICENSE-MIT.txt','./wasm-runtime.js','./sdk/index.js','./sdk/converter.js','./assets/icon.svg','./assets/bila-g2p.svg','./assets/grapheme-to-phoneme.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(assets))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||Response.error())));});
