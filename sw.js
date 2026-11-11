const CACHE = 'climb-202611112242';
const FILES = ['./', './index.html', './app.js', './style.css', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './ma.png', './sol.png', './muntanya.png', './lliri.png', './torii.png', './nuvol.png', './columna.png', './escalfament/dits.png', './escalfament/banda.png', './escalfament/penjada.png', './escalfament/regleta.png', './escalfament/avantbracos.png', './art/lluna.png', './art/puny.png', './art/meditacio.png', './art/mans-roca.png', './art/catedral.png', './art/espina.png', './art/eclipsi.png', './art/forat.png', './art/mussol.png', './art/mans-pinca.png', './exercicis/4x4.png', './exercicis/abdominals.png', './exercicis/autos.png', './exercicis/bloc-limit.png', './exercicis/campus.png', './exercicis/curl-biceps.png', './exercicis/curl-canell-invers.png', './exercicis/curl-canell.png', './exercicis/curl-goma.png', './exercicis/curl-martell.png', './exercicis/dits-5x10.png', './exercicis/dominades-excentriques.png', './exercicis/dominades-llast.png', './exercicis/dominades.png', './exercicis/elevacions-cames.png', './exercicis/extensions-triceps-goma.png', './exercicis/face-pull-goma.png', './exercicis/foam-roller.png', './exercicis/fons-triceps.png', './exercicis/hollow-body.png', './exercicis/kilter-board.png', './exercicis/lliure.png', './exercicis/lock-off.png', './exercicis/massilla.png', './exercicis/penjades-ma-oberta.png', './exercicis/penjades-regleta-20.png', './exercicis/pinca-disc.png', './exercicis/pistol-squats.png', './exercicis/planxa-lateral.png', './exercicis/planxa.png', './exercicis/press-banca.png', './exercicis/remada-invertida.png', './exercicis/remada-manuelles.png', './exercicis/repeaters.png', './exercicis/resistencia.png', './exercicis/series-dominades.png', './exercicis/suspensions-maximes.png', './exercicis/tecnica-peus.png', './exercicis/volum-facil.png', './exercicis/wrist-roller.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// En tocar una notificaciÃ³, obre (o porta al davant) l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});

// Xarxa primer, cau si no hi ha connexiÃ³ (aixÃ­ les actualitzacions arriben)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
