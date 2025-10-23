function clickerInit(){const key='susenka-clicker-guest';const el=id=>document.getElementById(id);let state={cookies:0};
function load(){try{const raw=localStorage.getItem(key);if(raw){state={...state,...JSON.parse(raw)};}}catch(e){}render();}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch(e){}}
function render(){if(el('count'))el('count').textContent=Math.floor(state.cookies);}
const cookieBtn=document.getElementById('cookieBtn');if(cookieBtn){cookieBtn.addEventListener('click',()=>{state.cookies+=1;render();});}
const saveBtn=document.getElementById('saveBtn');if(saveBtn){saveBtn.addEventListener('click',save);}
const resetBtn=document.getElementById('resetBtn');if(resetBtn){resetBtn.addEventListener('click',()=>{if(confirm('Resetovat hru?')){state={cookies:0};save();render();}});}
const exportBtn=document.getElementById('exportBtn');if(exportBtn){exportBtn.addEventListener('click',()=>{const data=btoa(unescape(encodeURIComponent(JSON.stringify(state))));prompt('Skopíruj si svůj save:',data);});}
const importBtn=document.getElementById('importBtn');if(importBtn){importBtn.addEventListener('click',()=>{const data=prompt('Vlož svůj save:');if(!data)return;try{const obj=JSON.parse(decodeURIComponent(escape(atob(data))));state={...state,...obj};save();render();alert('Načteno!');}catch(e){alert('Neplatný save.');}});}
load();}