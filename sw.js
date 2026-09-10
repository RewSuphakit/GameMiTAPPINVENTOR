/**
 * ==============================================================================
 * SERVICE WORKER (sw.js) - App Inventor Code Breaker Mission
 * ==============================================================================
 * รองรับการทำงานออฟไลน์ 100% สำหรับโรงเรียนที่เน็ตช้าหรือหลุดบ่อย
 * Strategy: Cache First with Network Fallback & Background Revalidation
 */

const CACHE_NAME = 'codebreaker-v3.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/tokens.css',
  './css/layout.css',
  './css/components.css',
  './css/animations.css',
  './css/responsive.css',
  './js/main.js',
  './js/config.js',
  './js/state.js',
  './js/levels.data.js',
  './js/blocks.data.js',
  './js/dragEngine.js',
  './js/snapEngine.js',
  './js/validator.js',
  './js/simulator.js',
  './js/gamification.js',
  './js/audio.js',
  './js/effects.js',
  './js/ui.js',
  './js/dataCollector.js',
  './js/sync.js',
  './js/utils.js'
];

// ติดตั้ง Service Worker และแคชทรัพยากรหลักทั้งหมด
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ล้างแคชเวอร์ชันเก่าเมื่อมีการอัปเดต Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// จัดการการดึงทรัพยากร: Cache First โดยถ้ามีในแคชให้ใช้ทันที ถ้าไม่มีให้โหลดเน็ต
self.addEventListener('fetch', (event) => {
  // ข้าม POST request หรือ external google script API (ปล่อยให้ sync.js จัดการ)
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // อัปเดตแคชในเบื้องหลัง (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => { /* ออฟไลน์ ไม่ต้องทำอะไร */ });

        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // กรณีออฟไลน์และค้นหาหน้าเว็บไม่พบ ให้ส่งกลับ index.html สำรอง
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
