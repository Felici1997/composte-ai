// Service Worker — Composte AI
// Gère le cache hors-ligne pour les agriculteurs avec connexion limitée

const CACHE_NAME = 'composte-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Installation : mise en cache des assets statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : stratégie Network First (réseau prioritaire, cache en fallback)
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET et les APIs externes
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // API Supabase et OpenAI : toujours réseau (pas de cache)
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('openai') ||
      url.hostname.includes('anthropic') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('openweathermap')) {
    return;
  }

  // Assets statiques : cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// Notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Composte AI', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      data: { url: data.url || '/' },
    })
  );
});

// Clic sur notification → ouvrir l'app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
