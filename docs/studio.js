import {tr} from './i18n.js?v=7';
import {prepare,BilaG2P,httpPhonemizer,audit,selfTest} from './sdk/index.js';
const $=id=>document.getElementById(id);
if(location.protocol==='http:'&&['localhost','127.0.0.1'].includes(location.hostname)) $('endpoint').value=new URL('/phonemize',location.origin).href;
async function verifiedLocal(u){
 const local=['localhost','127.0.0.1'].includes(u.hostname);
 if(!local)return;
 if(u.origin!==location.origin)throw Error(tr("Mở Studio tại "+u.origin+"/ để tránh CORS và xung đột localhost.","Open Studio at "+u.origin+"/ to avoid CORS and localhost conflicts."));
 const r=await fetch(new URL('/health',u),{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(5000)});
 if(!r.ok||!r.headers.get('content-type')?.includes('application/json'))throw Error('Wrong local backend: expected Bila-G2P JSON');
 const data=await r.json();if(data.service!=='bila-g2p'||data.status!=='ok')throw Error('Wrong local backend: expected bila-g2p');
}

let current=null;
let toastTimer;function notify(message){const t=$('toast');t.textContent=message;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,2600)}
function count(){const s=$('source').value;$('count').textContent=Array.from(s).length+' / '+new TextEncoder().encode(s).length+' B';}
let theme='dark';try{theme=localStorage.getItem('bila-theme')==='light'?'light':'dark'}catch{};function applyTheme(){document.documentElement.dataset.theme=theme;$('theme').setAttribute('aria-pressed',String(theme==='light'));try{localStorage.setItem('bila-theme',theme)}catch{}}applyTheme();$('theme').onclick=()=>{theme=theme==='dark'?'light':'dark';applyTheme()};
const opts=()=>({input:$('mode').value,allowAmbiguous:$('confirm').checked});
function convert(){count();try{current=prepare($('source').value,opts());$('cqn').textContent=current.cqn;$('cvss').textContent=current.cvss;$('out').textContent=JSON.stringify(current,null,2);$('state').textContent='OK';return current;}catch(e){current=null;$('cqn').textContent='—';$('cvss').textContent='—';$('state').textContent='CHECK INPUT';$('out').textContent=e.message+'\n'+JSON.stringify(e.ambiguities||[],null,2);$('out').parentElement.open=true;throw e;}}
$('convert').onclick=()=>{try{convert()}catch{}};
$('sample').onclick=()=>{$('source').value=$('mode').value==='cqn'?'Tôi yêu tiếng Việt':'Toiy iwy tizb Vidf';$('convert').click()};
$('swap').onclick=()=>{try{const x=convert(),to=$('mode').value==='cqn'?'cvss':'cqn';$('mode').value=to;$('source').value=to==='cqn'?x.cqn:x.cvss;$('convert').click()}catch{}};
$('speak').onclick=()=>{try{const x=convert();if(!('speechSynthesis'in window))throw Error(tr("Trình duyệt không hỗ trợ","Browser not supported"));const u=new SpeechSynthesisUtterance(x.cqn);u.lang='vi-VN';const v=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('vi'));if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){$('state').textContent=e.message}};
$('stop').onclick=()=>{if('speechSynthesis'in window)speechSynthesis.cancel()};
$('g2p').onclick=async()=>{const b=$('g2p');b.disabled=true;try{convert();const u=new URL($('endpoint').value);if(u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))throw Error(tr("Cần HTTPS hoặc localhost","HTTPS or localhost required"));$('phones').textContent=tr("Đang phân tích...","Phonemizing...");await verifiedLocal(u);const g=new BilaG2P({phonemize:async text=>{const r=await fetch(u.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),redirect:'error',signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('G2P HTTP '+r.status);if(!r.headers.get('content-type')?.includes('application/json'))throw Error('Expected JSON, received another application or HTML');return (await r.json()).phonemes;}});$('phones').textContent=JSON.stringify(await g.process($('source').value,opts()),null,2)}catch(e){$('phones').textContent=e.message}finally{b.disabled=false}};
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText($(b.dataset.copy).textContent);notify(tr("Đã sao chép","Copied"))}catch{notify(tr("Không thể sao chép; chọn văn bản","Copy failed; select text"))}}); 
$('audit').onclick=()=>{$('diagnostics').textContent=JSON.stringify({audit:audit(),tests:selfTest()},null,2)};
$('cdn').onclick=async()=>{const b=$('cdn');b.disabled=true;try{$('diagnostics').textContent=tr("Đang tải CDN...","Loading CDN...");const sdk=await import('https://cdn.jsdelivr.net/npm/@vietflexmap/bila-g2p@1.0.0/docs/sdk/index.js');const tests=sdk.selfTest();$('diagnostics').textContent=JSON.stringify({cdn:tests.ok?'PASS':'FAIL',tests,conversion:sdk.fromCqn('Tôi yêu tiếng Việt')},null,2)}catch(e){$('diagnostics').textContent=tr("CDN chưa xác minh: ","CDN not verified: ")+e.message}finally{b.disabled=false}};
$('convert').click();
import {loadOfflineRuntime} from './wasm-runtime.js';
let offlineEngine;
$('wasmload').onclick=async()=>{const b=$('wasmload');b.disabled=true;try{$('wasmstatus').textContent=tr("Đang tải và xác minh SHA-256...","Downloading and verifying SHA-256...");offlineEngine=await loadOfflineRuntime();$('wasmrun').disabled=false;$('wasmstatus').textContent='READY / WASM + SEAP cache';}catch(e){$('wasmstatus').textContent=tr("WASM chưa sẵn sàng: ","WASM not ready: ")+e.message;}finally{b.disabled=false}};
$('wasmrun').onclick=async()=>{try{const x=convert();const ir=await new BilaG2P({phonemize:t=>offlineEngine.phonemize(t)}).process($('source').value,opts());$('wasmstatus').textContent=JSON.stringify(ir,null,2);}catch(e){$('wasmstatus').textContent=e.message}};
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js?v=7',{updateViaCache:'none'}).catch(console.warn);

$('source').addEventListener('input',()=>{count();current=null;$('state').textContent='EDITING';$('cqn').textContent='—';$('cvss').textContent='—';$('out').textContent='';});$('mode').addEventListener('change',()=>{$('source').dispatchEvent(new Event('input'))});$('confirm').addEventListener('change',()=>{$('source').dispatchEvent(new Event('input'))});$('source').addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('convert').click()}});$('clear').onclick=()=>{$('source').value='';$('source').dispatchEvent(new Event('input'));$('source').focus()};$('download').onclick=()=>{try{const ir=convert();const url=URL.createObjectURL(new Blob([JSON.stringify(ir,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='bila-g2p.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify(tr('Đã tạo JSON','JSON created'))}catch(e){notify(e.message)}};count();