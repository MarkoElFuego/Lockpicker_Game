// ============================================================
// SERVICE WORKER - Offline Support
// Caches all game assets for offline play.
// ============================================================

const CACHE_NAME = "lockpicker-v1";
const ASSETS = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/utils/save.js",
    "./js/utils/audio.js",
    "./js/utils/haptics.js",
    "./js/utils/particles.js",
    "./js/utils/animations.js",
    "./js/utils/tutorial.js",
    "./js/data/items.js",
    "./js/data/dialogue.js",
    "./js/data/levels.js",
    "./js/puzzles/slider.js",
    "./js/puzzles/rotation.js",
    "./js/puzzles/memory.js",
    "./js/puzzles/pattern.js",
    "./js/puzzles/cracker.js",
    "./js/screens/briefing.js",
    "./js/screens/map.js",
    "./js/screens/heist.js",
    "./js/screens/reward.js",
    "./js/screens/shop.js",
    "./js/screens/sidequest.js",
    "./js/screens/fail.js",
    "./js/screens/settings.js",
    "./js/screens/stats.js",
    "./js/game.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// Install - cache all assets
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                // Cache new resources
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(() => {
                // Offline fallback
                if (event.request.destination === "document") {
                    return caches.match("./index.html");
                }
            });
        })
    );
});
