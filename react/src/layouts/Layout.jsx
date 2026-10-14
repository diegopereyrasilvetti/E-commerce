import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

// Estructura común: header arriba, la página en el medio y el footer abajo
export default function Layout({ soloLogo = false }) {
  return (
    <>
      <Header soloLogo={soloLogo} />
      <Outlet />
      <Footer />
    </>
  )
}
