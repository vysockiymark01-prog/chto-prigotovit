// Чистые функции расчёта стоимости рецептов. Ничего не читают из localStorage —
// вызывающий код передаёт productMap/customPrices/haveAtHome явно.

const PANTRY_DEFAULT_CATEGORIES = new Set(['специи'])
const PANTRY_DEFAULT_IDS = new Set(['sol', 'maslo-rast', 'maslo-slivochnoe'])

export function buildProductMap(products) {
  return Object.fromEntries(products.map((p) => [p.id, p]))
}

// Цена упаковки: пользовательская, если задана, иначе средняя из базы.
export function getPackPrice(product, customPrices) {
  const custom = customPrices[product.id]
  return typeof custom === 'number' ? custom : product.packPrice
}

export function hasCustomPrice(productId, customPrices) {
  return typeof customPrices[productId] === 'number'
}

// Стоимость порции: для каждого ингредиента берём долю от цены упаковки
// пропорционально использованному количеству, суммируем и делим на число порций.
export function calcPortionCost(recipe, productMap, customPrices) {
  const total = recipe.ingredients.reduce((sum, ing) => {
    const product = productMap[ing.productId]
    if (!product) return sum
    const packPrice = getPackPrice(product, customPrices)
    return sum + (ing.amount / product.packSize) * packPrice
  }, 0)
  return total / recipe.servings
}

// Стоимость закупки с нуля: только недостающие ингредиенты, целыми упаковками.
export function calcShoppingCost(recipe, productMap, customPrices, haveAtHome) {
  return getMissingIngredients(recipe, haveAtHome).reduce((sum, ing) => {
    const product = productMap[ing.productId]
    if (!product) return sum
    const packPrice = getPackPrice(product, customPrices)
    const packsNeeded = Math.ceil(ing.amount / product.packSize)
    return sum + packsNeeded * packPrice
  }, 0)
}

export function getMissingIngredients(recipe, haveAtHome) {
  return recipe.ingredients.filter((ing) => !haveAtHome[ing.productId])
}

// «По вашим ценам», если пользователь задал цену для каждого ингредиента рецепта.
export function isAllCustomPriced(recipe, customPrices) {
  return recipe.ingredients.every((ing) => hasCustomPrice(ing.productId, customPrices))
}

export function caloriesPerRuble(recipe, portionCost) {
  if (portionCost <= 0) return recipe.calories
  return recipe.calories / portionCost
}

// Начальное состояние «Есть дома»: соль/специи/масло — обычно копеечные и уже есть на кухне.
export function getDefaultPantryState(products) {
  const state = {}
  for (const product of products) {
    state[product.id] =
      PANTRY_DEFAULT_CATEGORIES.has(product.category) || PANTRY_DEFAULT_IDS.has(product.id)
  }
  return state
}

export function formatRub(amount) {
  return Math.round(amount).toLocaleString('ru-RU')
}

// Список покупок: суммирует недостающие ингредиенты выбранных рецептов по продукту
// (один продукт из двух рецептов = одна строка) и переводит сумму в целые упаковки.
export function aggregateShoppingList(recipes, recipeIds, productMap, customPrices, haveAtHome) {
  const totals = {}
  for (const recipe of recipes) {
    if (!recipeIds.includes(recipe.id)) continue
    for (const ing of recipe.ingredients) {
      if (haveAtHome[ing.productId]) continue
      totals[ing.productId] = (totals[ing.productId] || 0) + ing.amount
    }
  }
  return Object.entries(totals)
    .map(([productId, amount]) => {
      const product = productMap[productId]
      if (!product) return null
      const packPrice = getPackPrice(product, customPrices)
      const packs = Math.ceil(amount / product.packSize)
      return { productId, product, amount, packs, cost: packs * packPrice }
    })
    .filter(Boolean)
}
