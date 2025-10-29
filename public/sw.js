// Enhanced Service Worker for SportsInn PWA
const CACHE_NAME = 'sportshub-v2';
const STATIC_CACHE = 'sportshub-static-v2';
const DYNAMIC_CACHE = 'sportshub-dynamic-v2';
const IMAGE_CACHE = 'sportshub-images-v2';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE)
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Enhanced fetch event with multiple cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.destination === 'document') {
    // HTML pages - network first
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'image') {
    // Images - cache first
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (url.pathname.startsWith('/api/')) {
    // API requests - network first with fallback
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // Static assets - cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // Default - stale while revalidate
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache first failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network first failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    return new Response('Offline content not available', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Enhanced activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('sportshub-v2')) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Background sync function
function doBackgroundSync() {
  // Handle offline actions when connection is restored
  return Promise.resolve();
}

// Enhanced push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'SportsInn',
    body: 'New notification from SportsInn',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'sportshub-notification',
    requireInteraction: false,
    silent: false,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: Date.now(),
      url: '/'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        title: pushData.title || notificationData.title,
        body: pushData.body || notificationData.body,
        icon: pushData.icon || notificationData.icon,
        data: {
          ...notificationData.data,
          ...pushData.data,
          url: pushData.url || '/'
        }
      };
    } catch (error) {
      console.log('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  // Add action buttons based on notification type
  const actions = [
    {
      action: 'view',
      title: 'View',
      icon: '/icon-192x192.png'
    },
    {
      action: 'dismiss',
      title: 'Dismiss',
      icon: '/icon-192x192.png'
    }
  ];

  const options = {
    ...notificationData,
    actions
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetUrl = notificationData.url || '/';

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Open new window if app is not open
        return clients.openWindow(targetUrl);
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click behavior
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].focus();
          clientList[0].navigate(targetUrl);
        } else {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // Track notification dismissal if needed
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
