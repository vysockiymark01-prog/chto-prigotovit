import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import ReminderManager from './components/ReminderManager.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'
import HomePage from './pages/HomePage.jsx'
import RecipePage from './pages/RecipePage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ShoppingListPage from './pages/ShoppingListPage.jsx'
import PantryPage from './pages/PantryPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import VotingPage from './pages/VotingPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import MorePage from './pages/MorePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <HashRouter>
          <ReminderManager />
          <OfflineBanner />
          <div className="app-shell">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/recipe/:id" element={<RecipePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/shopping-list" element={<ShoppingListPage />} />
              <Route path="/pantry" element={<PantryPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/voting" element={<VotingPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
          <BottomNav />
        </HashRouter>
      </AppDataProvider>
    </ThemeProvider>
  )
}
