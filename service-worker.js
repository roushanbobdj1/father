const CACHE_NAME = "cuet-notes-v2";

// Files to cache
const ASSETS = [
  "./",
  "./index.html",
  "./1.html",
  "./2.html",
  "./3.html",
  "./4.html",
  "./5.html",
  "./6.html",
  "./7.html",
  "./8.html",
  "./9.html",
  "./manifest.json"
];

// 🔽 INSTALL
self.addEventListener("install", (event) => {
  console.log("Service Worker Installing...");
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Caching App Shell...");
        return cache.addAll(ASSETS);
      })
  );

  self.skipWaiting(); // activate immediately
});

// 🔽 ACTIVATE (cleanup old cache)
self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// 🔽 FETCH (Offline + Speed)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cache if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // Optional fallback
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      })
  );
});
