import { useTheme } from '../context/ThemeContext.jsx'
import './ThemeToggle.css'

const ORDER = ['system', 'light', 'dark']
const ICON = { system: '🌓', light: '☀️', dark: '🌙' }
const LABEL = { system: 'Системная тема', light: 'Светлая тема', dark: 'Тёмная тема' }

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function handleClick() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
    setTheme(next)
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleClick}
      aria-label={`Тема: ${LABEL[theme]}. Нажмите, чтобы переключить.`}
      title={LABEL[theme]}
    >
      {ICON[theme]}
    </button>
  )
}
