import { useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import { getPackPrice, hasCustomPrice, formatRub } from '../lib/pricing.js'
import './ProductPriceRow.css'

export default function ProductPriceRow({ product }) {
  const { customPrices, setCustomPrice, resetCustomPrice } = useAppData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const price = getPackPrice(product, customPrices)
  const isCustom = hasCustomPrice(product.id, customPrices)

  function startEdit() {
    setDraft(String(price))
    setEditing(true)
  }

  function commit() {
    const num = Number(draft.replace(',', '.'))
    if (Number.isFinite(num) && num > 0) setCustomPrice(product.id, num)
    setEditing(false)
  }

  return (
    <li className="product-row">
      <div className="product-row__main">
        <span className="product-row__name">{product.name}</span>
        <span className="product-row__pack">
          упаковка {product.packSize} {product.unit}
        </span>
      </div>
      <div className="product-row__price">
        {editing ? (
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            className="product-row__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <button type="button" className="product-row__price-btn" onClick={startEdit}>
            {formatRub(price)} ₽
          </button>
        )}
        {isCustom && !editing && (
          <button
            type="button"
            className="product-row__reset"
            onClick={() => resetCustomPrice(product.id)}
          >
            сбросить к средней
          </button>
        )}
      </div>
    </li>
  )
}
