import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppData } from '../context/AppDataContext.jsx'
import { aggregateShoppingList, formatRub } from '../lib/pricing.js'
import './ShoppingListPage.css'

export default function ShoppingListPage() {
  const {
    recipes,
    productMap,
    customPrices,
    haveAtHome,
    shoppingList,
    removeRecipeFromShoppingList,
    togglePurchased,
    clearShoppingList,
  } = useAppData()

  const addedRecipes = recipes.filter((r) => shoppingList.recipeIds.includes(r.id))

  const rows = useMemo(
    () =>
      aggregateShoppingList(
        recipes,
        shoppingList.recipeIds,
        productMap,
        customPrices,
        haveAtHome,
      ),
    [recipes, shoppingList.recipeIds, productMap, customPrices, haveAtHome],
  )

  const total = rows.reduce((sum, row) => sum + row.cost, 0)

  if (addedRecipes.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Список покупок</h1>
        <p className="empty-state">
          Пока пусто. Откройте рецепт и нажмите «Добавить в список покупок».
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Список покупок</h1>

      <div className="shopping-recipes">
        {addedRecipes.map((r) => (
          <div key={r.id} className="shopping-recipe-chip">
            <Link to={`/recipe/${r.id}`}>{r.name}</Link>
            <button
              type="button"
              onClick={() => removeRecipeFromShoppingList(r.id)}
              aria-label={`Убрать ${r.name} из списка`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="empty-state">
          Все нужные продукты уже отмечены как «есть дома» — докупать нечего.
        </p>
      ) : (
        <ul className="shopping-list card">
          {rows.map((row) => {
            const purchased = Boolean(shoppingList.purchased[row.productId])
            return (
              <li
                key={row.productId}
                className={'shopping-row' + (purchased ? ' shopping-row--purchased' : '')}
              >
                <label className="shopping-row__label">
                  <input
                    type="checkbox"
                    checked={purchased}
                    onChange={() => togglePurchased(row.productId)}
                  />
                  <span className="shopping-row__name">
                    {row.product.name}
                    <span className="shopping-row__amount">
                      {' '}
                      · {row.amount} {row.product.unit} ({row.packs} уп.)
                    </span>
                  </span>
                </label>
                <span className="shopping-row__cost">{formatRub(row.cost)} ₽</span>
              </li>
            )
          })}
        </ul>
      )}

      <div className="shopping-total">
        <span>Итого</span>
        <span className="shopping-total__value">{formatRub(total)} ₽</span>
      </div>

      <button type="button" className="clear-btn" onClick={clearShoppingList}>
        Очистить список
      </button>
    </div>
  )
}
