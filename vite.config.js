import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Замените на подпапку вашего репозитория GitHub Pages, например '/chto-prigotovit/'.
const BASE_PATH = '/chto-prigotovit/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Что приготовить?',
        short_name: 'Что приготовить',
        description: 'Подбор рецептов по бюджету',
        lang: 'ru',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#15803d',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        globIgnores: ['privacy.html'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/chto-prigotovit\/privacy\.html$/],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
