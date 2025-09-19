self.addEventListener('push', function (event) {
  try {
    const data = event.data ? event.data.json() : {}
    const title = data.title || 'Notification'
    const body = data.body || ''
    const payloadData = data.data || {}
    const options = {
      body,
      data: payloadData,
      icon: '/placeholder-logo.png',
      badge: '/placeholder-logo.png',
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch (e) {
    // Fallback if payload is not JSON
    const text = event.data ? event.data.text() : ''
    event.waitUntil(self.registration.showNotification('Notification', { body: text }))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const data = event.notification.data || {}
  // Optionally route based on relatedType/relatedId
  let targetUrl = '/'
  if (data.relatedType === 'task' && data.relatedId) {
    targetUrl = `/tasks/${data.relatedId}`
  } else if (data.relatedType === 'project' && data.relatedId) {
    targetUrl = `/projects/${data.relatedId}`
  }
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const url = new URL(client.url)
        if (url.pathname === targetUrl) {
          client.focus()
          return
        }
      }
      return clients.openWindow(targetUrl)
    })
  )
})
