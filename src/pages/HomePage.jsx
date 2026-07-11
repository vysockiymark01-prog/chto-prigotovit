import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.jsx'
import RecipeCard from '../components/RecipeCard.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { calcPortionCost, calcShoppingCost, caloriesPerRuble } from '../lib/pricing.js'
import './HomePage.css'

const MEAL_TYPES = ['Все', 'Завтрак', 'Обед', 'Ужин', 'Перекус']
const TIME_OPTIONS = [
  { value: 0, label: 'Любое' },
  { value: 20, label: 'До 20 мин' },
  { value: 40, label: 'До 40 мин' },
  { value: 60, label: 'До 60 мин' },
]
const SORT_OPTIONS = [
  { value: 'satiety', label: 'Сытнее за эти деньги' },
  { value: 'closest', label: 'Ближе к бюджету' },
  { value: 'fastest', label: 'Быстрее приготовить' },
  { value: 'cheapest', label: 'Дешевле' },
]

export default function HomePage() {
  const { recipes, productMap, customPrices, haveAtHome, budgetMode, setBudgetMode } =
    useAppData()
  const navigate = useNavigate()

  const [budget, setBudget] = useState('')
  const [mealType, setMealType] = useState('Все')
  const [timeLimit, setTimeLimit] = useState(0)
  const [sortMode, setSortMode] = useState('satiety')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const budgetNumber = budget === '' ? null : Number(budget)

  const costOf = (recipe) =>
    budgetMode === 'shopping'
      ? calcShoppingCost(recipe, productMap, customPrices, haveAtHome)
      : calcPortionCost(recipe, productMap, customPrices)

  const baseFiltered = useMemo(() => {
    return recipes.filter((r) => {
      if (mealType !== 'Все' && !r.mealType.includes(mealType.toLowerCase())) return false
      if (timeLimit > 0 && r.timeMinutes > timeLimit) return false
      return true
    })
  }, [recipes, mealType, timeLimit])

  const withinBudget = useMemo(() => {
    if (budgetNumber === null || budgetNumber <= 0) return baseFiltered
    return baseFiltered.filter((r) => costOf(r) <= budgetNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFiltered, budgetNumber, budgetMode, productMap, customPrices, haveAtHome])

  const sorted = useMemo(() => {
    const list = [...withinBudget]
    list.sort((a, b) => {
      switch (sortMode) {
        case 'fastest':
          return a.timeMinutes - b.timeMinutes
        case 'cheapest':
          return costOf(a) - costOf(b)
        case 'closest': {
          if (budgetNumber === null) return costOf(a) - costOf(b)
          return Math.abs(costOf(a) - budgetNumber) - Math.abs(costOf(b) - budgetNumber)
        }
        case 'satiety':
        default:
          return caloriesPerRuble(b, costOf(b)) - caloriesPerRuble(a, costOf(a))
      }
    })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withinBudget, sortMode, budgetNumber, budgetMode, productMap, customPrices, haveAtHome])

  const nearestSuggestion = useMemo(() => {
    if (sorted.length > 0 || baseFiltered.length === 0 || budgetNumber === null) return null
    return [...baseFiltered].sort(
      (a, b) => Math.abs(costOf(a) - budgetNumber) - Math.abs(costOf(b) - budgetNumber),
    )[0]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, baseFiltered, budgetNumber, budgetMode, productMap, customPrices, haveAtHome])

  function handleInventDish() {
    const pool = sorted.length > 0 ? sorted : baseFiltered.length > 0 ? baseFiltered : recipes
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (pick) navigate(`/recipe/${pick.id}`)
  }

  return (
    <div className="page">
      <div className="home-header">
        <h1 className="page-title">Что приготовить?</h1>
        <ThemeToggle />
      </div>

      <label className="budget-field">
        <span className="budget-field__label">Ваш бюджет, ₽</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Например, 500"
          value={budget}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d]/g, '')
            setBudget(v)
          }}
          className="budget-field__input"
        />
      </label>

      <div className="meal-type-row" role="tablist" aria-label="Тип приёма пищи">
        {MEAL_TYPES.map((mt) => (
          <button
            key={mt}
            type="button"
            role="tab"
            aria-selected={mealType === mt}
            className={'meal-type-btn' + (mealType === mt ? ' meal-type-btn--active' : '')}
            onClick={() => setMealType(mt)}
          >
            {mt}
          </button>
        ))}
      </div>

      <button type="button" className="invent-dish-btn" onClick={handleInventDish}>
        🎲 Придумать блюдо
      </button>

      <button
        type="button"
        className="filters-toggle"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
      >
        Фильтры {filtersOpen ? '▲' : '▼'}
      </button>

      {filtersOpen && (
        <div className="filters-panel card">
          <div className="filters-group">
            <span className="filters-group__label">Время готовки</span>
            <div className="filters-chip-row">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={'chip' + (timeLimit === opt.value ? ' chip--active' : '')}
                  onClick={() => setTimeLimit(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters-group">
            <span className="filters-group__label">Режим расчёта</span>
            <div className="filters-chip-row">
              <button
                type="button"
                className={'chip' + (budgetMode === 'portion' ? ' chip--active' : '')}
                onClick={() => setBudgetMode('portion')}
              >
                Порция
              </button>
              <button
                type="button"
                className={'chip' + (budgetMode === 'shopping' ? ' chip--active' : '')}
                onClick={() => setBudgetMode('shopping')}
              >
                Закупка с нуля
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sort-row">
        <label className="sort-row__label" htmlFor="sort-select">
          Сортировка
        </label>
        <select
          id="sort-select"
          className="sort-row__select"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <p className="price-disclaimer">
        Цены средние по сетевым магазинам и могут отличаться от вашего магазина. Вы можете
        указать свои цены.
      </p>

      {sorted.length > 0 ? (
        <div className="recipe-feed">
          {sorted.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : nearestSuggestion ? (
        <div className="empty-state">
          <p>Под такой бюджет ничего не нашлось. Вот ближайший по цене вариант:</p>
          <div className="recipe-feed">
            <RecipeCard recipe={nearestSuggestion} />
          </div>
        </div>
      ) : (
        <p className="empty-state">Рецептов по заданным фильтрам не найдено.</p>
      )}
    </div>
  )
}
