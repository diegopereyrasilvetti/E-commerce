import { useEffect } from 'react'

// Pone el título de la pestaña del navegador: "Productos | Kodex Tech Store"
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | Kodex Tech Store` : 'Kodex Tech Store'
  }, [titulo])
}
