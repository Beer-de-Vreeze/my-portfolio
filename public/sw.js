// Service Worker for offline capability and caching
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";
const IMAGE_CACHE = "images-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/about",
  "/projects",
  "/contact",
  "/favicon/favicon.ico",
  "/favicon/apple-touch-icon.png",
  "/favicon/android-chrome-192x192.png",
  "/favicon/android-chrome-512x512.png",
  "/_next/static/css/",
  "/_next/static/js/",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(
          STATIC_ASSETS.filter((url) => typeof url === "string")
        );
      }),

      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all pages
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extensions and other protocols
  if (!request.url.startsWith("http")) {
    return;
  }

  // Determine caching strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImage(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isAPI(url)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (isPage(url)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache strategies implementation

// Cache First - good for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache first strategy failed:", error);
    return new Response("Offline - Content not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Network First - good for API calls
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    console.log("[SW] Network failed, trying cache:", request.url);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return (
        caches.match("/offline.html") ||
        new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        })
      );
    }

    return new Response("Offline - Content not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Stale While Revalidate - good for pages
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, but we might have cache
      return null;
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    networkResponsePromise.catch(() => {
      // Ignore network errors when we have cache
    });
    return cachedResponse;
  }

  // No cache, wait for network
  try {
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {
    console.error("[SW] Network failed and no cache:", error);
  }

  return new Response("Offline - Content not available", {
    status: 503,
    statusText: "Service Unavailable",
  });
}

// Helper functions to determine request types
function isStaticAsset(url) {
  return (
    url.pathname.includes("/_next/static/") ||
    url.pathname.includes("/favicon/") ||
    url.pathname.includes("/public/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  );
}

function isImage(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

function isAPI(url) {
  return url.pathname.startsWith("/api/") || url.hostname !== location.hostname;
}

function isPage(url) {
  return (
    url.hostname === location.hostname &&
    !url.pathname.startsWith("/api/") &&
    !isStaticAsset(url) &&
    !isImage(url)
  );
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log("[SW] Performing background sync");
  // Implement background sync logic here
  // For example, retry failed API calls
}

// Push notifications (if needed)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/favicon/android-chrome-192x192.png",
      badge: "/favicon/favicon-32x32.png",
      data: data.data,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});

console.log("[SW] Service worker script loaded");
