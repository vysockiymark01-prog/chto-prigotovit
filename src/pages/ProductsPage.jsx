import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import ProductPriceRow from '../components/ProductPriceRow.jsx'
import './ProductsPage.css'

export default function ProductsPage() {
  const { products } = useAppData()
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products
    const map = new Map()
    for (const product of filtered) {
      if (!map.has(product.category)) map.set(product.category, [])
      map.get(product.category).push(product)
    }
    return [...map.entries()]
  }, [products, query])

  return (
    <div className="page">
      <h1 className="page-title">Продукты и цены</h1>
      <input
        type="search"
        className="products-search"
        placeholder="Поиск продукта…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {groups.length === 0 ? (
        <p className="empty-state">Ничего не найдено.</p>
      ) : (
        groups.map(([category, items]) => (
          <div key={category} className="products-group">
            <h2 className="products-group__title">{category}</h2>
            <ul className="products-list card">
              {items.map((product) => (
                <ProductPriceRow key={product.id} product={product} />
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
