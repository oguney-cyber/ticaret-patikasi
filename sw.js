/* Çevrimdışı çalışma: uygulama dosyaları önbelleğe alınır. Sürüm değişince eski önbellek silinir.
   Aynı alan adında başka uygulamalar da var; yalnızca bu uygulamanın (ttp-) önbellekleri silinir. */
const PREFIX = 'ttp-';
const VERSION = PREFIX + '2026-11-12a';
const CORE = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'js/stats.js', 'js/gen.js', 'js/parse.js', 'js/app.js', 'js/ink.js', 'js/calc.js', 'js/formulas.js', 'js/figs.js',
  'js/content-u1.js', 'js/content-u2.js', 'js/content-u3.js', 'js/content-u4.js', 'js/content-u5.js', 'js/content-u6.js', 'js/content-u7.js',
  'vendor/katex/katex.min.js', 'vendor/katex/katex.min.css', 'vendor/katex/auto-render.min.js',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const local = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (local && !url.pathname.includes('/vendor/') && !url.pathname.includes('/icons/')) {
    // önce ağ (güncel içerik), yoksa önbellek
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.open(VERSION).then(c => c.match(req, { ignoreSearch: true })).then(r => r || caches.open(VERSION).then(c => c.match('index.html')))));
    return;
  }
  if (local || fonts) {
    // önce önbellek
    e.respondWith(caches.open(VERSION).then(c => c.match(req)).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })));
  }
});
