import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las imágenes están en public/images y se sirven en /images/...
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pruebas del frontend: npm test (las del servidor están en server/test)
  test: { environment: 'node', include: ['src/**/*.test.js'] },
  // En desarrollo, las llamadas a /api van al servidor local (carpeta server/)
  server: { proxy: { '/api': 'http://localhost:3001' } },
})
