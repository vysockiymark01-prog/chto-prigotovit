import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../lib/storageKeys.js'

const ThemeContext = createContext(null)

// theme: 'system' | 'light' | 'dark'
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, 'system')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
