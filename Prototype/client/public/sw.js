/**
 * sw.js — Yantiq Service Worker
 * Provides offline capability and asset caching
 */

const CACHE_VERSION = 'yantiq-v2';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/src/pages/login.html',
  '/src/pages/app.html',
  '/src/pages/lesson.html',
  '/src/pages/pronunciation.html',
  '/src/pages/quiz.html',
  '/src/pages/result.html',
  '/src/pages/badges.html',
  '/src/pages/dashboard.html',
  '/src/css/main.css',
  '/src/js/app.js',
];

// API endpoints to cache with network-first strategy
const API_CACHE_ROUTES = ['/api/v1/levels', '/api/v1/badges'];

// ── Install ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to precache:', err);
      });
    }).then(() => self.skipWaiting()),
  );
});

// ── Activate ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('yantiq-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

// ── Fetch ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip browser extensions
  if (!url.protocol.startsWith('http')) return;

  // API requests — network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    if (API_CACHE_ROUTES.some(r => url.pathname.startsWith(r))) {
      event.respondWith(networkFirstStrategy(request, API_CACHE, 60 * 60 * 1000)); // 1hr TTL
    }
    return;
  }

  // Static assets — cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // HTML pages — network first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Everything else — stale while revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ── Strategies ────────────────────────────────────────

async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstStrategy(request, cacheName, ttl = null) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const toCache = response.clone();
      if (ttl) {
        // Add TTL header to cached response
        const headers = new Headers(toCache.headers);
        headers.set('sw-cached-at', Date.now().toString());
        headers.set('sw-ttl', ttl.toString());
      }
      cache.put(request, toCache);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }
    return new Response(JSON.stringify({ success: false, message: 'You are offline. Please check your connection.', code: 'OFFLINE' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetchPromise;
}

// ── Helpers ───────────────────────────────────────────
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|webm|mp3)$/.test(pathname);
}

// ── Push notifications (for daily reminders) ──────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title   = data.title   || 'Time to practise Arabic! 🌟';
  const options = {
    body:    data.body    || `${data.childName || 'Your little learner'} has a lesson waiting! 📚`,
    icon:    '/icons/icon-192.png',
    badge:   '/icons/badge-72.png',
    tag:     'daily-reminder',
    renotify: true,
    actions: [
      { action: 'open',  title: 'Start Lesson 🚀' },
      { action: 'snooze', title: 'Remind me later' },
    ],
    data: { url: data.url || '/src/pages/app.html' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'snooze') return;
  const url = event.notification.data?.url || '/src/pages/app.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
