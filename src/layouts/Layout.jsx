import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

// Estructura común: header arriba, la página en el medio y el footer abajo
export default function Layout({ soloLogo = false }) {
  // Al pasar a otra página se vuelve arriba (dentro de /productos/... cada categoría se encarga de su scroll)
  const seccion = useLocation().pathname.split('/')[1]
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [seccion])

  return (
    <>
      <Header soloLogo={soloLogo} />
      <Outlet />
      <Footer />
    </>
  )
}
