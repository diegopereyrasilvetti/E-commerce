import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las imágenes están en public/images y se sirven en /images/...
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
