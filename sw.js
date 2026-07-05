const CACHE = 'pomp-v1';

const PRECACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/output.css',
  '/lib/utils.js',
  '/lib/cache.js',
  '/lib/icons.js',
  '/lib/toast.js',
  '/lib/image-viewer.js',
  '/routes/properties.js',
  '/routes/finances.js',
  '/routes/contacts.js',
  '/routes/maintenance.js',
  '/routes/petty-cash.js',
  '/routes/debrief.js',
  '/routes/tasks.js',
  '/routes/portals.js',
  '/routes/activity.js',
  '/routes/tenants.js',
  '/routes/settings.js',
  '/public/favicon.ico',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  if (request.url.includes('/api/')) {
    e.respondWith(networkFirst(request));
  } else {
    e.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    const cache = await caches.open(CACHE);
    cache.put(request, res.clone());
    return res;
  } catch {
    return caches.match(request);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch {
    return new Response('Offline', { status: 503 });
  }
}
