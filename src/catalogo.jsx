/* Catálogo de productos, traído de la API.

   - CatalogoProvider ... carga los productos una vez al abrir el sitio. Va envolviendo la app (ver main.jsx).
   - useCatalogo() ...... { productos, cargando, error, recargar } para usarlo desde cualquier componente. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { listarProductos } from './lib/api.js'

const CatalogoContext = createContext(null)

export function CatalogoProvider({ children }) {
  const [estado, setEstado] = useState({ productos: [], cargando: true, error: '' })

  const cargar = useCallback(async () => {
    setEstado((e) => ({ ...e, cargando: true, error: '' }))
    try {
      setEstado({ productos: await listarProductos(), cargando: false, error: '' })
    } catch (error) {
      setEstado({ productos: [], cargando: false, error: error.message })
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const valor = useMemo(() => ({ ...estado, recargar: cargar }), [estado, cargar])
  return <CatalogoContext.Provider value={valor}>{children}</CatalogoContext.Provider>
}

export function useCatalogo() {
  const contexto = useContext(CatalogoContext)
  if (!contexto) throw new Error('useCatalogo tiene que usarse dentro de <CatalogoProvider>')
  return contexto
}
