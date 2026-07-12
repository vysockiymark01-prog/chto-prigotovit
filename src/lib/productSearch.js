// Ищет продукт по бытовому названию: сначала точное совпадение, потом
// подстрока в любую сторону, и в конце — общий 4-буквенный корень первого
// слова (чтобы «курица» находила «Куриное филе», «картошка» — «Картофель»).
export function findProductMatch(query, products) {
  const q = query.trim().toLowerCase()
  if (!q) return null

  const exact = products.find((p) => p.name.toLowerCase() === q)
  if (exact) return exact.id

  const contains = products.find((p) => p.name.toLowerCase().includes(q))
  if (contains) return contains.id

  const reverseContains = products.find((p) => q.includes(p.name.toLowerCase()))
  if (reverseContains) return reverseContains.id

  const prefixMatch = products.find((p) => {
    const firstWord = p.name.toLowerCase().split(' ')[0]
    const minLen = Math.min(firstWord.length, q.length)
    if (minLen < 4) return false
    return firstWord.slice(0, 4) === q.slice(0, 4)
  })
  return prefixMatch ? prefixMatch.id : null
}
