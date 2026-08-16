import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../lib/storageKeys.js'
import {
  getPermission,
  notificationsSupported,
  requestPermission,
} from '../lib/notifications.js'
import './SettingsPage.css'

const PERMISSION_LABEL = {
  granted: 'Разрешены',
  denied: 'Запрещены (включите в настройках браузера)',
  default: 'Не запрошены',
  unsupported: 'Не поддерживаются в этом браузере',
}

export default function SettingsPage() {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.reminderSettings, {
    enabled: false,
    time: '17:30',
    lastShownDate: null,
  })
  const [permission, setPermission] = useState(getPermission())

  useEffect(() => {
    setPermission(getPermission())
  }, [settings.enabled])

  async function handleToggle() {
    if (!settings.enabled && permission !== 'granted') {
      const result = await requestPermission()
      setPermission(result)
      if (result !== 'granted') return
    }
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
  }

  return (
    <div className="page">
      <Link to="/more" className="back-link">
        &larr; Назад
      </Link>
      <h1 className="page-title">Настройки</h1>

      <div className="settings-block card">
        <h2 className="settings-block__title">Напоминание «Что сегодня готовим?»</h2>
        <p className="price-disclaimer">
          Локальное уведомление в браузере, без серверов и подписки на push. Оно сработает, пока
          приложение открыто (в фоне или на экране) в момент проверки — это честное ограничение
          PWA без бэкенда, гарантии доставки при полностью закрытом приложении нет.
        </p>

        {!notificationsSupported() ? (
          <p className="empty-state">Ваш браузер не поддерживает уведомления.</p>
        ) : (
          <>
            <label className="settings-row">
              <span>Включить напоминание</span>
              <input type="checkbox" checked={settings.enabled} onChange={handleToggle} />
            </label>

            <label className="settings-row">
              <span>Время</span>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => setSettings((prev) => ({ ...prev, time: e.target.value }))}
              />
            </label>

            <p className="settings-permission">
              Статус разрешения: <strong>{PERMISSION_LABEL[permission] || permission}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
