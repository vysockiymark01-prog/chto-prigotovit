import { useAppData } from '../context/AppDataContext.jsx'
import RecipeCard from '../components/RecipeCard.jsx'

export default function FavoritesPage() {
  const { recipes, favorites } = useAppData()
  const favoriteRecipes = recipes.filter((r) => favorites.includes(r.id))

  return (
    <div className="page">
      <h1 className="page-title">Избранное</h1>
      {favoriteRecipes.length === 0 ? (
        <p className="empty-state">
          Пока пусто. Нажмите ♡ на карточке рецепта, чтобы добавить его сюда.
        </p>
      ) : (
        <div className="recipe-feed">
          {favoriteRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  )
}
