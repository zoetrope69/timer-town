// uses workbox for precaching and installing

workbox.routing.registerRoute(
  '/',
  new workbox.strategies.CacheFirst()
);

self.__precacheManifest.forEach(item => {
  workbox.routing.registerRoute(
    item.url,
    new workbox.strategies.CacheFirst()
  );
})

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
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
    (async function () {
      sendMessageToClient(event, {
        close: true
      });
    })()
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  event.waitUntil(
    (async function () {
      sendMessageToClient(event, {
        dataSentToNotification: event.notification.data,
        action: event.action
      });
    })()
  );
});