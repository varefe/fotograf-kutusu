import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mime-type-fix',
      configureServer(server) {
        // Vite'ın tüm middleware'lerinden sonra çalışacak
        return () => {
          server.middlewares.use((req, res, next) => {
            const url = req.url || ''
            
            // Response gönderilmeden önce MIME type'ı düzelt
            const originalEnd = res.end.bind(res)
            res.end = function(chunk, encoding) {
              // JSX/JS/MJS dosyaları için
              if (url.match(/\.(jsx?|mjs)$/i) || 
                  url.includes('/src/') || 
                  url.includes('?import') || 
                  url.includes('?t=') ||
                  url.includes('main.jsx')) {
                if (!res.headersSent) {
                  res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
                }
              }
              // SVG dosyaları için
              else if (url.endsWith('.svg') || url === '/vite.svg' || url.includes('vite.svg')) {
                if (!res.headersSent) {
                  res.setHeader('Content-Type', 'image/svg+xml')
                }
              }
              
              return originalEnd(chunk, encoding)
            }
            
            next()
          })
        }
      }
    }
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
