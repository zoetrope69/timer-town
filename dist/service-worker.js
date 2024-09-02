const version = "3.2.7";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(version + "fundamentals").then((cache) => {
      return cache.addAll([
        "/",
        "/web-worker.js",
        "/js/bundle.js",
        "/css/main.css",
        "/images/timer.png",
        "/sounds/beano-yelp.mp3",
        "/sounds/bell.mp3",
        "/sounds/chief-chef.mp3",
        "/sounds/cow-moo.mp3",
        "/sounds/foghorn.mp3",
        "/sounds/gong.mp3",
        "/sounds/marshall-house.mp3",
        "/sounds/music-box.mp3",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      var networked = fetch(event.request)
        .then(fetchedFromNetwork, unableToResolve)
        .catch(unableToResolve);

      return cached || networked;

      function fetchedFromNetwork(response) {
        var cacheCopy = response.clone();

        caches.open(version + "pages").then(function add(cache) {
          cache.put(event.request, cacheCopy);
        });

        return response;
      }

      function unableToResolve() {
        return new Response("<h1>Service Unavailable</h1>", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({
            "Content-Type": "text/html",
          }),
        });
      }
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            return !key.startsWith(version);
          })
          .map((key) => {
            return caches.delete(key);
          })
      );
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  /**
   * if exists open browser tab with matching url just set focus to it,
   * otherwise open new tab/window with sw root scope url
   */
  event.waitUntil(
    clients
      .matchAll({
        includeUncontrolled: true,
        type: "window",
      })
      .then((clients) => {
        const focusableClient = clients.find((client) => {
          return client.url == self.registration.scope && "focus" in client;
        });

        if (focusableClient) {
          focusableClient.focus();
        }
      })
  );
});
