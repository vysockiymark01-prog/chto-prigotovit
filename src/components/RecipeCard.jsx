import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'
import { calcPortionCost, calcShoppingCost, isAllCustomPriced, formatRub } from '../lib/pricing.js'
import { getRecipeEmoji } from '../lib/emoji.js'
import './RecipeCard.css'

export default function RecipeCard({ recipe }) {
  const { productMap, customPrices, haveAtHome, favorites, toggleFavorite } = useAppData()

  const portionCost = calcPortionCost(recipe, productMap, customPrices)
  const shoppingCost = calcShoppingCost(recipe, productMap, customPrices, haveAtHome)
  const accurate = isAllCustomPriced(recipe, customPrices)
  const isFavorite = favorites.includes(recipe.id)

  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card card">
      <div className="recipe-card__emoji" aria-hidden="true">
        {getRecipeEmoji(recipe)}
      </div>
      <div className="recipe-card__body">
        <div className="recipe-card__header">
          <h3 className="recipe-card__title">{recipe.name}</h3>
          <button
            type="button"
            className={'recipe-card__heart' + (isFavorite ? ' recipe-card__heart--active' : '')}
            onClick={(e) => {
              e.preventDefault()
              toggleFavorite(recipe.id)
            }}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        </div>
        <div className="recipe-card__price-row">
          <span>
            порция ~{formatRub(portionCost)} ₽ · закупка ~{formatRub(shoppingCost)} ₽
          </span>
          <span className={'badge ' + (accurate ? 'badge--accurate' : 'badge--approx')}>
            {accurate ? 'по вашим ценам' : 'цены примерные'}
          </span>
        </div>
        <div className="recipe-card__meta">
          <span>⏱ {recipe.timeMinutes} мин</span>
          <span>🔥 {recipe.calories} ккал</span>
        </div>
      </div>
    </Link>
  )
}
