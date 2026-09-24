const CACHE='fv-presentation-v5'
const ROOT=new URL('./',self.location.href)
const CORE=['./','fv-app-qr.png','fv-camera-fallback.mp4'].map(path=>new URL(path,ROOT).href)

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()),
))

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()),
))

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{
      const copy=response.clone()
      void caches.open(CACHE).then(cache=>cache.put(ROOT.href,copy))
      return response
    }).catch(()=>caches.match(ROOT.href)))
    return
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(new URL(event.request.url).origin===self.location.origin){
      const copy=response.clone()
      void caches.open(CACHE).then(cache=>cache.put(event.request,copy))
    }
    return response
  })))
})
