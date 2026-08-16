// Простая классификация продуктов по категориям ограничений питания.
// Работает по категории продукта + точечным исключениям для отдельных id —
// без внешних баз данных, всё на основе уже имеющегося products.json.

const CATEGORY_TAGS = {
  мясо: ['meat'],
  рыба: ['fish'],
  яйца: ['eggs'],
  молочка: ['dairy'],
  макароны: ['gluten'],
  мука: ['gluten'],
  хлеб: ['gluten'],
}

// Точечные исключения: продукты, чей состав не следует из общей категории.
const PRODUCT_TAG_OVERRIDES = {
  perlovka: ['gluten'], // перловая крупа — ячмень
  manka: ['gluten'], // манная крупа — пшеница
  bulgur: ['gluten'], // булгур — пшеница
  'suhari-panirovochnye': ['gluten'],
  mayonez: ['eggs'],
  'krabovye-palochki': ['fish', 'gluten'], // сурими часто с пшеничным крахмалом
}

export function getProductTags(product) {
  if (!product) return []
  const override = PRODUCT_TAG_OVERRIDES[product.id]
  if (override) return override
  return CATEGORY_TAGS[product.category] || []
}

export const DIET_FILTERS = [
  { key: 'vegetarian', label: 'Вегетарианское', icon: '🥦', excludeTags: ['meat', 'fish'] },
  {
    key: 'vegan',
    label: 'Веганское',
    icon: '🌱',
    excludeTags: ['meat', 'fish', 'dairy', 'eggs'],
  },
  { key: 'no-lactose', label: 'Без лактозы', icon: '🥛', excludeTags: ['dairy'] },
  { key: 'no-gluten', label: 'Без глютена', icon: '🌾', excludeTags: ['gluten'] },
]

// Множество тегов, которые встречаются среди ингредиентов рецепта.
export function getRecipeTags(recipe, productMap) {
  const tags = new Set()
  for (const ing of recipe.ingredients) {
    for (const tag of getProductTags(productMap[ing.productId])) {
      tags.add(tag)
    }
  }
  return tags
}

// Проверка: подходит ли рецепт под выбранный набор ограничений (по ключам DIET_FILTERS).
export function recipeMatchesDiet(recipe, productMap, activeFilterKeys) {
  if (!activeFilterKeys || activeFilterKeys.length === 0) return true
  const recipeTags = getRecipeTags(recipe, productMap)
  return DIET_FILTERS.filter((f) => activeFilterKeys.includes(f.key)).every((f) =>
    f.excludeTags.every((tag) => !recipeTags.has(tag)),
  )
}
