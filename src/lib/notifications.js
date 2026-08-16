// Локальные напоминания без внешних push-серверов: используем встроенный
// Notification API браузера через уже зарегистрированный service worker.
// Работает надёжно, пока вкладка/приложение открыты в момент проверки —
// это честное ограничение PWA без бэкенда, без иллюзии «доставки» пока
// приложение полностью закрыто.

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
}

export function getPermission() {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestPermission() {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.requestPermission()
}

export async function showReminderNotification() {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const registration = await navigator.serviceWorker.ready
  const iconUrl = `${import.meta.env.BASE_URL}pwa-192x192.png`
  await registration.showNotification('Что приготовить сегодня?', {
    body: 'Загляните в приложение и выберите рецепт — или запустите семейное голосование 🎲',
    icon: iconUrl,
    badge: iconUrl,
    tag: 'daily-reminder',
  })
}
