import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'Work Profiles',
        short_name: 'Profiles',
        description: 'Skills and capacity profiles for agile teams',
        theme_color: '#ca8a04',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/work-profiles/',
        scope: '/work-profiles/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: '/work-profiles/',
  build: { outDir: 'dist', sourcemap: true },
})
