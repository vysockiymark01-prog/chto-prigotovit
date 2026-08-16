import { useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../lib/storageKeys.js'
import { showReminderNotification } from '../lib/notifications.js'

// Ничего не рендерит — просто раз в минуту проверяет, не пора ли показать
// напоминание «Что сегодня готовим?», пока приложение открыто.
export default function ReminderManager() {
  const [settings] = useLocalStorage(STORAGE_KEYS.reminderSettings, {
    enabled: false,
    time: '17:30',
    lastShownDate: null,
  })

  useEffect(() => {
    function check() {
      if (!settings.enabled) return
      const now = new Date()
      const today = now.toISOString().slice(0, 10)
      if (settings.lastShownDate === today) return
      const [h, m] = (settings.time || '17:30').split(':').map(Number)
      const target = new Date(now)
      target.setHours(h || 0, m || 0, 0, 0)
      if (now >= target) {
        showReminderNotification()
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.reminderSettings)
          const parsed = raw ? JSON.parse(raw) : settings
          localStorage.setItem(
            STORAGE_KEYS.reminderSettings,
            JSON.stringify({ ...parsed, lastShownDate: today }),
          )
        } catch {
          // localStorage недоступен — просто пропускаем сохранение отметки
        }
      }
    }
    check()
    const id = setInterval(check, 60 * 1000)
    return () => clearInterval(id)
  }, [settings])

  return null
}
