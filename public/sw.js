// Service worker simples: abre rápido e funciona sem sinal para a casca do app (dados vêm sempre do servidor)
const C="bolao-v3"; const SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","firebase.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url); if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.endsWith("seed.json")) return;
  e.respondWith(fetch(e.request,{cache:"no-cache"}).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));});
