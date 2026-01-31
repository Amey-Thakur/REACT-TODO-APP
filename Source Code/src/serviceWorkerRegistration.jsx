/**
 * ----------------------------------------------------------------------------
 * File: serviceWorkerRegistration.js
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
 * This module handles the registration and lifecycle management of the
 * Service Worker, enabling Progressive Web App (PWA) features such as
 * offline capabilities and faster load times.
 *
 * It distinguishes between localhost and production environments to ensure
 * developers strictly interact with the latest code, while end-users benefit
 * from cache-first serving strategies.
 *
 */

// Environment Detection:
// Checks if the application is running on localhost (IPv4 or IPv6)
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Registers the service worker to allow the app to work offline.
 * 
 * @param {Object} config - Optional configuration object.
 */
export function register(config) {
    // Guard Clause: Only register in production and if the browser supports it
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {

        // Ensure the service worker is served from the same origin to prevent security issues
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            return;
        }

        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            if (isLocalhost) {
                // Localhost: Check if a service worker exists to avoid caching issues during dev
                checkValidServiceWorker(swUrl, config);

                // Add some logging to help developers know that the service worker is running
                navigator.serviceWorker.ready.then(() => {
                    console.log('This web app is being served cache-first by a service worker.');
                });
            } else {
                // Production: Register the valid service worker
                registerValidSW(swUrl, config);
            }
        });
    }
}

/**
 * Performs the actual registration of the Service Worker file.
 * 
 * @param {string} swUrl - The URL of the service worker script.
 * @param {Object} config - Configuration object (e.g., onSuccess, onUpdate callbacks).
 */
function registerValidSW(swUrl, config) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New content is available; please refresh.
                            console.log('New content is available; please refresh.');
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else {
                            // Content is cached for offline use.
                            console.log('Content is cached for offline use.');
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error('Error during service worker registration:', error);
        });
}

/**
 * Verifies that the service worker exists and is valid.
 * If not, it unregisters the rogue worker and reloads.
 */
function checkValidServiceWorker(swUrl, config) {
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then((response) => {
            // Check if the service worker file exists and is a JS file
            const contentType = response.headers.get('content-type');
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                // No service worker found. Probably a different app. Reload the page.
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                // Service worker found. Proceed as normal.
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log('No internet connection found. App is running in offline mode.');
        });
}

/**
 * Unregisters the service worker.
 * Useful if the user opts out of PWA or during debugging.
 */
export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}
