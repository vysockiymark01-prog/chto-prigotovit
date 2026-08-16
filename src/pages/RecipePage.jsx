import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import {
  calcPortionCost,
  calcShoppingCost,
  isAllCustomPriced,
  formatRub,
} from '../lib/pricing.js'
import { getRecipeEmoji } from '../lib/emoji.js'
import IngredientRow from '../components/IngredientRow.jsx'
import './RecipePage.css'

export default function RecipePage() {
  const { id } = useParams()
  const {
    recipes,
    productMap,
    customPrices,
    haveAtHome,
    favorites,
    toggleFavorite,
    shoppingList,
    addRecipeToShoppingList,
    removeRecipeFromShoppingList,
    logCooked,
  } = useAppData()
  const [cookedJustNow, setCookedJustNow] = useState(false)

  useEffect(() => {
    setCookedJustNow(false)
  }, [id])

  const recipe = recipes.find((r) => r.id === id)

  if (!recipe) {
    return (
      <div className="page">
        <Link to="/">&larr; Назад</Link>
        <p className="empty-state">Рецепт не найден.</p>
      </div>
    )
  }

  const portionCost = calcPortionCost(recipe, productMap, customPrices)
  const shoppingCost = calcShoppingCost(recipe, productMap, customPrices, haveAtHome)
  const accurate = isAllCustomPriced(recipe, customPrices)
  const isFavorite = favorites.includes(recipe.id)
  const inShoppingList = shoppingList.recipeIds.includes(recipe.id)

  return (
    <div className="page">
      <Link to="/" className="back-link">
        &larr; Назад
      </Link>

      <div className="recipe-header">
        <div className="recipe-header__emoji" aria-hidden="true">
          {getRecipeEmoji(recipe)}
        </div>
        <h1 className="page-title recipe-header__title">{recipe.name}</h1>
      </div>

      <div className="recipe-meta-row">
        <span>⏱ {recipe.timeMinutes} мин</span>
        <span>🍽 {recipe.servings} порц.</span>
        <span>🔥 {recipe.calories} ккал/порция</span>
      </div>

      <div className="recipe-price-card card">
        <div className="recipe-price-card__row">
          <div>
            <div className="recipe-price-card__label">Порция</div>
            <div className="recipe-price-card__value">~{formatRub(portionCost)} ₽</div>
          </div>
          <div>
            <div className="recipe-price-card__label">Закупка с нуля</div>
            <div className="recipe-price-card__value">~{formatRub(shoppingCost)} ₽</div>
          </div>
        </div>
        <span className={'badge ' + (accurate ? 'badge--accurate' : 'badge--approx')}>
          {accurate ? 'по вашим ценам' : 'цены примерные'}
        </span>
      </div>

      <div className="recipe-actions">
        <button
          type="button"
          className={'action-btn' + (isFavorite ? ' action-btn--active' : '')}
          onClick={() => toggleFavorite(recipe.id)}
        >
          {isFavorite ? '♥ В избранном' : '♡ В избранное'}
        </button>
        <button
          type="button"
          className={'action-btn' + (inShoppingList ? ' action-btn--active' : '')}
          onClick={() =>
            inShoppingList
              ? removeRecipeFromShoppingList(recipe.id)
              : addRecipeToShoppingList(recipe.id)
          }
        >
          {inShoppingList ? '🛒 В списке покупок' : '🛒 Добавить в список покупок'}
        </button>
        <button
          type="button"
          className={'action-btn' + (cookedJustNow ? ' action-btn--active' : '')}
          onClick={() => {
            logCooked(recipe.id)
            setCookedJustNow(true)
          }}
          disabled={cookedJustNow}
        >
          {cookedJustNow ? '✅ Записали в статистику' : '👩‍🍳 Готовили это'}
        </button>
      </div>

      <h2 className="section-title">Ингредиенты</h2>
      <ul className="ingredient-list card">
        {recipe.ingredients.map((ing) => {
          const product = productMap[ing.productId]
          if (!product) return null
          return (
            <IngredientRow
              key={ing.productId}
              ingredient={ing}
              product={product}
              isMissing={!haveAtHome[ing.productId]}
            />
          )
        })}
      </ul>

      <h2 className="section-title">Шаги приготовления</h2>
      <ol className="steps-list">
        {recipe.steps.map((step, i) => (
          <li key={i} className="steps-list__item">
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}
