import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import staticProducts from '../data/products.json'
import recipes from '../data/recipes.json'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../lib/storageKeys.js'
import { buildProductMap, getDefaultPantryState } from '../lib/pricing.js'

const AppDataContext = createContext(null)

function makeCustomProductId(name) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
  return `custom-${slug || 'product'}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function AppDataProvider({ children }) {
  const [customProducts, setCustomProducts] = useLocalStorage(STORAGE_KEYS.customProducts, [])

  const products = useMemo(() => [...staticProducts, ...customProducts], [customProducts])
  const productMap = useMemo(() => buildProductMap(products), [products])

  const [customPrices, setCustomPrices] = useLocalStorage(STORAGE_KEYS.customPrices, {})
  const [haveAtHome, setHaveAtHome] = useLocalStorage(STORAGE_KEYS.haveAtHome, null)
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, [])
  const [shoppingList, setShoppingList] = useLocalStorage(STORAGE_KEYS.shoppingList, {
    recipeIds: [],
    purchased: {},
  })
  const [budgetMode, setBudgetMode] = useLocalStorage(STORAGE_KEYS.budgetMode, 'portion')

  function addCustomProduct({ name, unit, packSize, packPrice }) {
    const id = makeCustomProductId(name)
    const product = {
      id,
      name: name.trim(),
      unit,
      packSize: Number(packSize) || 1,
      packPrice: Number(packPrice) || 0,
      category: 'Свои продукты',
      custom: true,
    }
    setCustomProducts((prev) => [...prev, product])
    return id
  }

  function removeCustomProduct(id) {
    setCustomProducts((prev) => prev.filter((p) => p.id !== id))
    setCustomPrices((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function importCustomProducts(list) {
    if (!Array.isArray(list)) return 0
    let added = 0
    setCustomProducts((prev) => {
      const existingNames = new Set(products.map((p) => p.name.toLowerCase()))
      const next = [...prev]
      for (const item of list) {
        if (!item || typeof item.name !== 'string' || !item.name.trim()) continue
        if (existingNames.has(item.name.toLowerCase())) continue
        const unit = ['г', 'мл', 'шт'].includes(item.unit) ? item.unit : 'шт'
        next.push({
          id: makeCustomProductId(item.name),
          name: item.name.trim(),
          unit,
          packSize: Number(item.packSize) || 1,
          packPrice: Number(item.packPrice) || 0,
          category: 'Свои продукты',
          custom: true,
        })
        existingNames.add(item.name.toLowerCase())
        added += 1
      }
      return next
    })
    return added
  }

  // Первый запуск: заполняем «есть дома» дефолтом (соль/специи/масло).
  const seeded = useRef(false)
  useEffect(() => {
    if (haveAtHome === null && !seeded.current) {
      seeded.current = true
      setHaveAtHome(getDefaultPantryState(products))
    }
  }, [haveAtHome, setHaveAtHome])

  function setCustomPrice(productId, price) {
    setCustomPrices((prev) => ({ ...prev, [productId]: price }))
  }

  function resetCustomPrice(productId) {
    setCustomPrices((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  function setHaveAtHomeValue(productId, value) {
    setHaveAtHome((prev) => ({ ...(prev || {}), [productId]: value }))
  }

  function toggleFavorite(recipeId) {
    setFavorites((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId],
    )
  }

  function addRecipeToShoppingList(recipeId) {
    setShoppingList((prev) =>
      prev.recipeIds.includes(recipeId)
        ? prev
        : { ...prev, recipeIds: [...prev.recipeIds, recipeId] },
    )
  }

  function removeRecipeFromShoppingList(recipeId) {
    setShoppingList((prev) => ({
      ...prev,
      recipeIds: prev.recipeIds.filter((id) => id !== recipeId),
    }))
  }

  function togglePurchased(productId) {
    setShoppingList((prev) => ({
      ...prev,
      purchased: { ...prev.purchased, [productId]: !prev.purchased[productId] },
    }))
  }

  function clearShoppingList() {
    setShoppingList({ recipeIds: [], purchased: {} })
  }

  const value = {
    products,
    recipes,
    productMap,
    addCustomProduct,
    removeCustomProduct,
    importCustomProducts,
    customPrices,
    setCustomPrice,
    resetCustomPrice,
    haveAtHome: haveAtHome || {},
    setHaveAtHomeValue,
    favorites,
    toggleFavorite,
    shoppingList,
    addRecipeToShoppingList,
    removeRecipeFromShoppingList,
    togglePurchased,
    clearShoppingList,
    budgetMode,
    setBudgetMode,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
