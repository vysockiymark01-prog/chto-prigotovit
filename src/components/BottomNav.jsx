import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const TABS = [
  { to: '/', label: 'Подбор', icon: '🍽️', end: true },
  { to: '/voting', label: 'Голосуем', icon: '🗳️' },
  { to: '/favorites', label: 'Избранное', icon: '❤️' },
  { to: '/shopping-list', label: 'Покупки', icon: '🛒' },
  { to: '/pantry', label: 'Есть дома', icon: '🏠' },
  { to: '/more', label: 'Ещё', icon: '⋯' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => 'bottom-nav__item' + (isActive ? ' bottom-nav__item--active' : '')}
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
