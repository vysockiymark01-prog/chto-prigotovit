import { useEffect, useState } from 'react'
import './OfflineBanner.css'

// Приложение и так работает офлайн (весь код и данные закэшированы service
// worker'ом заранее) — этот баннер просто честно показывает пользователю
// текущее состояние сети, чтобы не было сомнений, что что-то «сломалось».
export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    function goOnline() {
      setOnline(true)
    }
    function goOffline() {
      setOnline(false)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="offline-banner" role="status">
      📡 Нет связи — работает сохранённая версия приложения, все данные на месте
    </div>
  )
}
