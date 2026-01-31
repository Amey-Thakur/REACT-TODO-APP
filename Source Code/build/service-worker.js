/**
 * ----------------------------------------------------------------------------
 * File: service-worker.js
 * Authors:
 *      Amey Thakur
 *      GitHub: https://github.com/ameythakur
 *
 *      Mega Satish
 *      GitHub: https://github.com/msatmod
 *
 * Repository: https://github.com/Amey-Thakur/REACT-TODO-APP
 * License: MIT License
 * Release Date: June 25, 2022
 * ----------------------------------------------------------------------------
 *
 * File Overview:
 * This script runs in the background, separate from the main web page.
 * It acts as a network proxy, intercepting network requests to provide
 * offline capabilities by serving cached assets.
 *
 * Strategy: Cache-First
 * 1. Serve content from cache (instant loading).
 * 2. If not in cache, fetch from network.
 *
 */

// Cache Versioning: usage of a unique name guarantees updates when the version changes.
const CACHE_NAME = 'react-todo-app-v1';

// Assets to cache immediately on installation
const urlsToCache = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/manifest.json',
    '/favicon.ico',
    '/logo192.png'
];

/**
 * Event: Install
 * Triggered when the browser sees this service worker for the first time.
 * We use this opportunity to open the cache and store core assets.
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

/**
 * Event: Fetch
 * Intercepts every network request initiated by the application.
 * Returns cached response if available, otherwise falls back to network.
 */
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Cache miss - fetch from network
                return fetch(event.request);
            }
            )
    );
});
