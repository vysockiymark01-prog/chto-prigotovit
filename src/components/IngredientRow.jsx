import { useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import { getPackPrice, hasCustomPrice, formatRub } from '../lib/pricing.js'
import './IngredientRow.css'

export default function IngredientRow({ ingredient, product, isMissing }) {
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
    <li className={'ingredient-row' + (isMissing ? ' ingredient-row--missing' : '')}>
      <div className="ingredient-row__main">
        <span className="ingredient-row__name">{product.name}</span>
        <span className="ingredient-row__amount">
          {ingredient.amount} {product.unit}
        </span>
      </div>
      <div className="ingredient-row__price">
        {editing ? (
          <input
            autoFocus
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            className="ingredient-row__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <button type="button" className="ingredient-row__price-btn" onClick={startEdit}>
            {formatRub(price)} ₽ / {product.packSize} {product.unit}
          </button>
        )}
        {isCustom && !editing && (
          <button
            type="button"
            className="ingredient-row__reset"
            onClick={() => resetCustomPrice(product.id)}
          >
            сбросить
          </button>
        )}
      </div>
      {isMissing && <span className="badge badge--missing">нет дома</span>}
    </li>
  )
}
