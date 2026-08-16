import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.jsx'
import './MorePage.css'

const ITEMS = [
  { to: '/products', icon: '💰', title: 'Цены', desc: 'Свои цены на продукты' },
  { to: '/stats', icon: '📊', title: 'Статистика', desc: 'Экономия, топ блюд, расходы по неделям' },
  { to: '/settings', icon: '⚙️', title: 'Настройки', desc: 'Напоминание «Что сегодня готовим?»' },
]

export default function MorePage() {
  return (
    <div className="page">
      <div className="home-header">
        <h1 className="page-title">Ещё</h1>
        <ThemeToggle />
      </div>
      <div className="more-list">
        {ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className="more-item card">
            <span className="more-item__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="more-item__text">
              <span className="more-item__title">{item.title}</span>
              <span className="more-item__desc">{item.desc}</span>
            </span>
            <span className="more-item__arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
