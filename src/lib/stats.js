// Чистые функции для раздела «Статистика». Работают с уже накопленной
// историей готовки (cookHistory) — ничего не запрашивают снаружи.

function startOfWeek(date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // понедельник = 0
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatShortDate(date) {
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export function totalSavingsInMonth(cookHistory, monthKey) {
  return cookHistory
    .filter((e) => e.date.slice(0, 7) === monthKey)
    .reduce((sum, e) => sum + (e.savings || 0), 0)
}

export function totalSavingsAllTime(cookHistory) {
  return cookHistory.reduce((sum, e) => sum + (e.savings || 0), 0)
}

export function currentMonthKey() {
  return new Date().toISOString().slice(0, 7)
}

// Топ блюд по количеству готовок, с сортировкой по убыванию.
export function topDishes(cookHistory, recipes, limit = 5) {
  const counts = {}
  for (const entry of cookHistory) {
    counts[entry.recipeId] = (counts[entry.recipeId] || 0) + 1
  }
  return Object.entries(counts)
    .map(([recipeId, count]) => ({
      recipeId,
      count,
      recipe: recipes.find((r) => r.id === recipeId) || null,
    }))
    .filter((row) => row.recipe)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Расходы по неделям (сумма cost) за последние weekCount недель, включая текущую.
export function weeklySpending(cookHistory, weekCount = 8) {
  const now = new Date()
  const thisWeekStart = startOfWeek(now)
  const weeks = []
  for (let i = weekCount - 1; i >= 0; i -= 1) {
    const start = new Date(thisWeekStart)
    start.setDate(start.getDate() - i * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    weeks.push({ start, end, label: formatShortDate(start), total: 0 })
  }
  for (const entry of cookHistory) {
    const entryDate = new Date(entry.date)
    for (const week of weeks) {
      if (entryDate >= week.start && entryDate < week.end) {
        week.total += entry.cost || 0
        break
      }
    }
  }
  return weeks
}
