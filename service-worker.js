const version = "1.0.1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(version + "fundamentals").then(cache => {
      return cache.addAll([
        "/images/pizza.png",
        "/sounds/bell.mp3",
        "/sounds/chief-chef.mp3",
        "/sounds/foghorn.mp3",
        "/sounds/gong.mp3",
        "/sounds/music-box.mp3",
        "/style.css",
        "/client.js",
        "/index.html"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
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
            "Content-Type": "text/html"
          })
        });
      }
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => {
            return !key.startsWith(version);
          })
          .map(key => {
            return caches.delete(key);
          })
      );
    })
  );
});

function sendMessageToClient(event, obj) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      if (event.notification.data.url !== client.url) {
        return;
      }

      client.postMessage(obj);
    });
  });
}

self.addEventListener("notificationclose", event => {
  event.waitUntil(
    (async function() {
      sendMessageToClient(event, { close: true });
    })()
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  event.waitUntil(
    (async function() {
      sendMessageToClient(event, {
        dataSentToNotification: event.notification.data,
        action: event.action
      });
    })()
  );
});
