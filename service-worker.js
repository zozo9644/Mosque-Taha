const CACHE_NAME = "mosquee-taha-v5";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./prieres.html",
    "./style.css",
    "./prieres.css",
    "./script.js",
    "./prieres.js",
    "./manifest.json",

    "./images/logo.png",
    "./images/mosque1.jpg",
    "./images/mosque2.jpg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", event => {

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).catch(() => {

                // إلا كانت صفحة HTML وما كاينش Internet
                if (event.request.mode === "navigate") {
                    return caches.match("./prieres.html");
                }

            });

        })
    );

});
