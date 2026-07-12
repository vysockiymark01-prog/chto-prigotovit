import { useMemo, useState } from 'react'
import { useAppData } from '../context/AppDataContext.jsx'
import ProductPriceRow from '../components/ProductPriceRow.jsx'
import './ProductsPage.css'

function AddProductForm({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('г')
  const [packSize, setPackSize] = useState('100')
  const [packPrice, setPackPrice] = useState('')

  function handleUnitChange(nextUnit) {
    setUnit(nextUnit)
    setPackSize(nextUnit === 'шт' ? '1' : '100')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const priceNum = Number(String(packPrice).replace(',', '.'))
    if (!name.trim() || !Number.isFinite(priceNum) || priceNum <= 0) return
    onAdd({ name, unit, packSize, packPrice: priceNum })
    setName('')
    setPackPrice('')
  }

  return (
    <form className="add-product-form card" onSubmit={handleSubmit}>
      <input
        type="text"
        className="add-product-form__name"
        placeholder="Название продукта"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="add-product-form__row">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          className="add-product-form__price"
          placeholder="Цена, ₽"
          value={packPrice}
          onChange={(e) => setPackPrice(e.target.value)}
        />
        <span className="add-product-form__za">за</span>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          className="add-product-form__packsize"
          value={packSize}
          onChange={(e) => setPackSize(e.target.value)}
        />
        <select
          className="add-product-form__unit"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value)}
        >
          <option value="г">г</option>
          <option value="мл">мл</option>
          <option value="шт">шт</option>
        </select>
      </div>
      <div className="add-product-form__actions">
        <button type="submit" className="add-product-form__submit">
          Добавить продукт
        </button>
        <button type="button" className="add-product-form__cancel" onClick={onClose}>
          Отмена
        </button>
      </div>
    </form>
  )
}

function ImportForm({ onImport, onClose }) {
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Пользователь может вставить весь текст сообщения, а не только JSON —
    // вырезаем массив между первой [ и последней ].
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']')
    const jsonSlice = start !== -1 && end !== -1 ? text.slice(start, end + 1) : text
    try {
      const parsed = JSON.parse(jsonSlice)
      const added = onImport(parsed)
      setMessage(added > 0 ? `Добавлено продуктов: ${added}` : 'Новых продуктов не найдено')
    } catch {
      setMessage('Не получилось прочитать текст — проверьте, что это скопированный список продуктов')
    }
  }

  return (
    <form className="add-product-form card" onSubmit={handleSubmit}>
      <textarea
        className="import-form__textarea"
        placeholder="Вставьте сюда список продуктов, полученный от того, кто им поделился"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        autoFocus
      />
      {message && <p className="import-form__message">{message}</p>}
      <div className="add-product-form__actions">
        <button type="submit" className="add-product-form__submit">
          Импортировать
        </button>
        <button type="button" className="add-product-form__cancel" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </form>
  )
}

export default function ProductsPage() {
  const { products, addCustomProduct, importCustomProducts } = useAppData()
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [shareMessage, setShareMessage] = useState('')

  const customProducts = useMemo(() => products.filter((p) => p.custom), [products])

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

  async function handleShare() {
    const payload = JSON.stringify(
      customProducts.map(({ name, unit, packSize, packPrice }) => ({
        name,
        unit,
        packSize,
        packPrice,
      })),
    )
    const shareText = `Мои продукты из «Что приготовить?»:\n${payload}`
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
        return
      } catch {
        // пользователь закрыл окно «Поделиться» — попробуем скопировать вместо этого
      }
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setShareMessage('Скопировано в буфер обмена — отправьте текст тому, с кем хотите поделиться')
    } catch {
      setShareMessage('Не получилось скопировать автоматически — выделите и скопируйте текст сами')
    }
  }

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

      <div className="products-actions">
        <button
          type="button"
          className="products-actions__btn"
          onClick={() => {
            setAddOpen((v) => !v)
            setImportOpen(false)
          }}
        >
          + Добавить свой продукт
        </button>
        <button
          type="button"
          className="products-actions__btn"
          onClick={() => {
            setImportOpen((v) => !v)
            setAddOpen(false)
          }}
        >
          Импортировать
        </button>
        {customProducts.length > 0 && (
          <button type="button" className="products-actions__btn" onClick={handleShare}>
            Поделиться своими продуктами
          </button>
        )}
      </div>
      {shareMessage && <p className="share-message">{shareMessage}</p>}

      {addOpen && (
        <AddProductForm
          onAdd={(data) => {
            addCustomProduct(data)
            setAddOpen(false)
          }}
          onClose={() => setAddOpen(false)}
        />
      )}
      {importOpen && (
        <ImportForm onImport={(list) => importCustomProducts(list)} onClose={() => setImportOpen(false)} />
      )}

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
