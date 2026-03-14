import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Rhythm',
        short_name: 'Rhythm',
        description: 'A gentle daily wellness journal',
        theme_color: '#7D9E7A',
        background_color: '#F7F4EF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      }
    })
  ]
})
