import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Las imágenes viven una sola vez, en ../images (la misma carpeta que usa el sitio original).
// Este plugin las sirve en /images/... mientras desarrollás y las copia a dist/images al compilar.
const carpetaImagenes = fileURLToPath(new URL('../images', import.meta.url))
const tipos = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.jfif': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }

function imagenesDelSitio() {
  let salida = 'dist'
  return {
    name: 'imagenes-del-sitio',
    configResolved(config) {
      salida = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use('/images', (req, res, next) => {
        const ruta = path.join(carpetaImagenes, decodeURIComponent(req.url.split('?')[0]))
        if (!ruta.startsWith(carpetaImagenes) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) return next()
        res.setHeader('Content-Type', tipos[path.extname(ruta).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(ruta).pipe(res)
      })
    },
    closeBundle() {
      if (fs.existsSync(carpetaImagenes)) fs.cpSync(carpetaImagenes, path.join(salida, 'images'), { recursive: true })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), imagenesDelSitio()],
})
