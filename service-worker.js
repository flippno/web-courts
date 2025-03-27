self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('planet-detection-cache-v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/main.js',
                '/tf-helper.js',
                '/ar-handler.js',
                '/models/planets_model.tflite'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});