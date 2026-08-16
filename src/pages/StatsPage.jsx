import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'
import { getRecipeEmoji } from '../lib/emoji.js'
import { formatRub } from '../lib/pricing.js'
import {
  currentMonthKey,
  topDishes,
  totalSavingsAllTime,
  totalSavingsInMonth,
  weeklySpending,
} from '../lib/stats.js'
import './StatsPage.css'

export default function StatsPage() {
  const { cookHistory, recipes } = useAppData()

  if (cookHistory.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Статистика</h1>
        <p className="empty-state">
          Пока пусто. Откройте рецепт и нажмите «Готовили это» — тогда здесь появится история и
          экономия.
        </p>
      </div>
    )
  }

  const monthSavings = totalSavingsInMonth(cookHistory, currentMonthKey())
  const allTimeSavings = totalSavingsAllTime(cookHistory)
  const top = topDishes(cookHistory, recipes, 5)
  const weeks = weeklySpending(cookHistory, 8)
  const maxWeek = Math.max(1, ...weeks.map((w) => w.total))

  return (
    <div className="page">
      <h1 className="page-title">Статистика</h1>

      <div className="stats-tiles">
        <div className="stats-tile card">
          <div className="stats-tile__label">Экономия в этом месяце</div>
          <div className="stats-tile__value">{formatRub(monthSavings)} ₽</div>
        </div>
        <div className="stats-tile card">
          <div className="stats-tile__label">Экономия за всё время</div>
          <div className="stats-tile__value">{formatRub(allTimeSavings)} ₽</div>
        </div>
      </div>
      <p className="price-disclaimer">
        Экономия — это разница между полной закупкой всех ингредиентов с нуля и тем, что реально
        нужно было докупить, потому что часть продуктов уже была дома.
      </p>

      <h2 className="section-title">Топ блюд</h2>
      <ul className="top-dishes card">
        {top.map((row, i) => (
          <li key={row.recipeId} className="top-dishes__row">
            <span className="top-dishes__rank">{i + 1}</span>
            <span className="top-dishes__emoji" aria-hidden="true">
              {getRecipeEmoji(row.recipe)}
            </span>
            <Link to={`/recipe/${row.recipeId}`} className="top-dishes__name">
              {row.recipe.name}
            </Link>
            <span className="top-dishes__count">
              {row.count} {row.count === 1 ? 'раз' : 'раза(-з)'}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="section-title">Расходы по неделям</h2>
      <div className="week-chart card">
        {weeks.map((w) => (
          <div key={w.label} className="week-chart__col">
            <div
              className="week-chart__bar"
              style={{ height: `${Math.max(4, (w.total / maxWeek) * 100)}%` }}
              title={`${formatRub(w.total)} ₽`}
            />
            <span className="week-chart__value">{w.total > 0 ? formatRub(w.total) : ''}</span>
            <span className="week-chart__label">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
