let lang='vi';try{lang=localStorage.getItem('bila-lang')==='en'?'en':'vi'}catch{}
export const tr=(vi,en)=>lang==='en'?en:vi;
export function applyLanguage(next){lang=next==='en'?'en':'vi';document.documentElement.lang=lang;document.querySelectorAll('[data-vi][data-en]').forEach(el=>el.textContent=el.dataset[lang]);for(const l of ['vi','en'])document.getElementById('lang-'+l)?.setAttribute('aria-pressed',String(l===lang));try{localStorage.setItem('bila-lang',lang)}catch{}}
document.getElementById('lang-vi').onclick=()=>applyLanguage('vi');document.getElementById('lang-en').onclick=()=>applyLanguage('en');applyLanguage(lang);
