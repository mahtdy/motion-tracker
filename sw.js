// Service Worker with advanced caching strategies
const VERSION = '1.4.3';
const CACHE_NAME = `motion-tracker-v27`;
const CORE_CACHE = `${CACHE_NAME}-core`;
const CDN_CACHE = `${CACHE_NAME}-cdn`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;

// Core app files - cache first
const CORE_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icon.svg'
];

// CDN resources - stale-while-revalidate
const CDN_PATTERNS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Maximum cache age (7 days)
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Install event - cache core files
 */
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${VERSION}`);
  
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => {
        console.log('[SW] Caching core files');
        return cache.addAll(CORE_FILES);
      })
      .then(() => {
        console.log('[SW] Core files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache core files:', error);
      })
  );
});

/**
 * Activate event - clean old caches and notify clients
 */
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${VERSION}`);
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('motion-tracker-') && name !== CORE_CACHE && name !== CDN_CACHE && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      }),
      // Claim all clients
      self.clients.claim(),
      // Notify clients about update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          console.log('[SW] Notifying client about update');
          client.postMessage({
            type: 'SW_UPDATED',
            version: VERSION
          });
        });
      })
    ])
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignore non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategy 1: Core app files - Cache First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, CORE_CACHE));
    return;
  }
  
  // Strategy 2: CDN resources - Stale While Revalidate
  if (isCDNResource(url)) {
    event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
    return;
  }
  
  // Strategy 3: Everything else - Network First with cache fallback
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

/**
 * Cache First strategy - for core app files
 */
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      // Check if cache is too old
      const cacheTime = await getCacheTime(request, cacheName);
      if (cacheTime && Date.now() - cacheTime > MAX_CACHE_AGE) {
        console.log('[SW] Cache expired, fetching fresh:', request.url);
        return fetchAndCache(request, cacheName);
      }
      
      return cached;
    }
    
    return fetchAndCache(request, cacheName);
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return fetchWithFallback(request);
  }
}

/**
 * Stale While Revalidate strategy - for CDN resources
 */
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Always fetch in background to update cache
    const fetchPromise = fetch(request)
      .then(async (response) => {
        if (response && response.ok) {
          const responseClone = response.clone();
          await cache.put(request, responseClone);
          await setCacheTime(request, cacheName, Date.now());
        }
        return response;
      })
      .catch((error) => {
        console.warn('[SW] Background fetch failed:', error);
      });
    
    // Return cached immediately if available, otherwise wait for network
    return cached || fetchPromise;
  } catch (error) {
    console.error('[SW] Stale while revalidate failed:', error);
    return fetch(request);
  }
}

/**
 * Network First strategy - with cache fallback
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await setCacheTime(request, cacheName, Date.now());
    }
    
    return response;
  } catch (error) {
    console.warn('[SW] Network first failed, trying cache:', error);
    
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return getOfflineFallback();
    }
    
    throw error;
  }
}

/**
 * Fetch and cache helper
 */
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await setCacheTime(request, cacheName, Date.now());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch and cache failed:', error);
    throw error;
  }
}

/**
 * Fetch with offline fallback
 */
async function fetchWithFallback(request) {
  try {
    return await fetch(request);
  } catch (error) {
    if (request.mode === 'navigate') {
      return getOfflineFallback();
    }
    throw error;
  }
}

/**
 * Check if URL is a CDN resource
 */
function isCDNResource(url) {
  return CDN_PATTERNS.some((pattern) => url.hostname.includes(pattern));
}

/**
 * Get cache timestamp
 */
async function getCacheTime(request, cacheName) {
  try {
    const cache = await caches.open(`${cacheName}-meta`);
    const response = await cache.match(request.url);
    if (response) {
      const data = await response.json();
      return data.timestamp;
    }
  } catch (error) {
    console.warn('[SW] Failed to get cache time:', error);
  }
  return null;
}

/**
 * Set cache timestamp
 */
async function setCacheTime(request, cacheName, timestamp) {
  try {
    const cache = await caches.open(`${cacheName}-meta`);
    await cache.put(
      request.url,
      new Response(JSON.stringify({ timestamp }), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } catch (error) {
    console.warn('[SW] Failed to set cache time:', error);
  }
}

/**
 * Generate offline fallback page
 */
function getOfflineFallback() {
  const html = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>آفلاین - حرکت‌سنج</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, "Segoe UI", Tahoma, sans-serif;
          background: #0f172a;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          text-align: center;
        }
        .container {
          max-width: 400px;
        }
        .icon {
          font-size: 80px;
          margin-bottom: 24px;
        }
        h1 {
          font-size: 24px;
          color: #4ade80;
          margin-bottom: 16px;
        }
        p {
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        button {
          background: #22c55e;
          color: #052e16;
          border: none;
          padding: 14px 32px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          min-width: 200px;
        }
        button:hover {
          background: #16a34a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>اتصال اینترنت قطع شده</h1>
        <p>برای استفاده از حرکت‌سنج، به اینترنت متصل شو و دوباره تلاش کن.</p>
        <button onclick="location.reload()">🔄 تلاش مجدد</button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Message event - handle client messages
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

console.log(`[SW] Service Worker ${VERSION} loaded`);
