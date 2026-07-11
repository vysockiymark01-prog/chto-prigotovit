import { useMemo } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import './PantryPage.css'

export default function PantryPage() {
  const { products, haveAtHome, setHaveAtHomeValue } = useAppData()

  const groups = useMemo(() => {
    const map = new Map()
    for (const product of products) {
      if (!map.has(product.category)) map.set(product.category, [])
      map.get(product.category).push(product)
    }
    return [...map.entries()]
  }, [products])

  return (
    <div className="page">
      <h1 className="page-title">Есть дома</h1>
      <p className="pantry-hint">
        Отметьте продукты, которые уже есть на кухне — они не войдут в стоимость закупки с
        нуля.
      </p>
      {groups.map(([category, items]) => (
        <div key={category} className="pantry-group">
          <h2 className="pantry-group__title">{category}</h2>
          <ul className="pantry-list card">
            {items.map((product) => (
              <li key={product.id} className="pantry-item">
                <label className="pantry-item__label">
                  <input
                    type="checkbox"
                    checked={Boolean(haveAtHome[product.id])}
                    onChange={(e) => setHaveAtHomeValue(product.id, e.target.checked)}
                  />
                  <span>{product.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
