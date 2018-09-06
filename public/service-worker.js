/* global clients */

function sendMessageToClient (event, obj) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      if (event.notification.data.url !== client.url) {
        return
      }

      client.postMessage(obj)
    })
  })
}

self.addEventListener('notificationclose', (event) => {
  event.waitUntil(async function() {
    sendMessageToClient(event, { close: true })
  }())
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  console.log('event', event)

  event.waitUntil(async function() {
    sendMessageToClient(event, {
      dataSentToNotification: event.notification.data,
      action: event.action
    })
  }())
})