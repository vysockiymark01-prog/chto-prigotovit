import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import HomePage from './pages/HomePage.jsx'
import RecipePage from './pages/RecipePage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ShoppingListPage from './pages/ShoppingListPage.jsx'
import PantryPage from './pages/PantryPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <HashRouter>
          <div className="app-shell">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/recipe/:id" element={<RecipePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/shopping-list" element={<ShoppingListPage />} />
              <Route path="/pantry" element={<PantryPage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Routes>
          </div>
          <BottomNav />
        </HashRouter>
      </AppDataProvider>
    </ThemeProvider>
  )
}
