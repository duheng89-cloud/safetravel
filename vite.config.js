import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 开启自动更新：当检测到新版本时，自动在后台更新并接管
      registerType: 'autoUpdate',
      
      // 把我们需要独立缓存的静态图标写在这里
      includeAssets: ['safe192.png', 'safe512.png'],
      
      // 这里就是你之前 manifest.json 的内容，插件会自动帮你生成
      manifest: {
        name: 'SafeTravel Locator',
        short_name: 'SafeTravel',
        description: 'Record your location periodically for travel safety.',
        theme_color: '#007aff',
        background_color: '#f0f2f5',
        display: 'standalone',
        icons: [
          {
            src: 'safe192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'safe512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      
      // Workbox 配置：这就是接管"动态缓存"的核心！
      // 它会自动匹配并缓存所有编译出来的 js, css, html 和图片
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})