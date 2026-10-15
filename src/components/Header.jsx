import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { primerNombre, useAuth } from '../auth.jsx'
import MenuUsuario, { Avatar } from './MenuUsuario.jsx'
import { CartBadge } from '../cart.jsx'

// Header del sitio. Con `soloLogo` muestra solo el logo centrado (login y calculadora).
export default function Header({ soloLogo = false }) {
  // Menú hamburguesa: se cierra al cambiar de página (el HTML ya no se recarga)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const { usuario, cerrarSesion } = useAuth()
  const rutaCarrito = usuario ? '/carrito' : '/login?desde=carrito'
  useEffect(() => {
    setMenuAbierto(false)
  }, [pathname])

  if (soloLogo) {
    return (
      <header className="sticky top-0 z-20 h-[70px] px-5 max-400:px-3 min-[768px]:px-10 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] shrink-0 border-b border-[rgba(120,150,255,0.12)]">
          <nav className="flex justify-center items-center h-full">
              <h1 className="text-[20px] font-bold">
                  <Link className="text-white text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]!" to="/">
                      <span className="sr-only m-0!">Kodex</span>
                      <picture>
                          <source media="(min-width: 768px)" srcSet="/images/Logotipo%20Kodex%20con%20circuito%20azul.png" />
                          <img className="w-[60px] min-[768px]:w-auto min-[768px]:h-[60px]" src="/images/Imagen_de_ChatGPT_2_oct_2026_12_39_50_p.m.png" alt="" />
                      </picture>
                  </Link>
              </h1>
          </nav>
      </header>
    )
  }

  return (
      <header className="sticky top-0 z-20 h-[70px] px-5 max-400:px-3 min-[768px]:px-10 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] shrink-0 border-b border-[rgba(120,150,255,0.12)]">
          <nav className="flex justify-between items-center h-full">
              <h1 className="text-[20px] font-bold">
                  <Link className="text-white text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]!" to="/">
                      <span className="sr-only m-0!">Kodex</span>
                      <picture>
                          <source media="(min-width: 768px)" srcSet="/images/Logotipo%20Kodex%20con%20circuito%20azul.png" />
                          <img className="w-[60px] min-[768px]:w-auto min-[768px]:h-[60px] min-[768px]:ml-5" src="/images/Imagen_de_ChatGPT_2_oct_2026_12_39_50_p.m.png" alt="" />
                      </picture>
                  </Link>
              </h1>
              <input type="search" className="bg-white text-secondary border border-[rgba(15,23,42,0.2)] rounded-[999px] px-[14px] w-[180px] h-9 text-[0.9rem] shadow-[0_1px_3px_rgba(15,23,42,0.1)] [transition:border-color_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! placeholder:text-[#64748B] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.3)] max-1099:absolute max-1099:top-1/2 max-1099:left-1/2 max-1099:[transform:translate(-50%,-50%)] max-400:w-[110px] min-[768px]:w-[240px] min-[1100px]:w-[200px] min-[1100px]:mx-auto min-[1280px]:w-[340px]" placeholder="Buscar..." aria-label="Buscar productos" />
              <Link className="relative text-text max-1099:ml-auto max-1099:mr-4 min-[1100px]:order-1 min-[1100px]:ml-6 min-[1100px]:mr-0 min-[1100px]:hover:text-primary text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]!" to={rutaCarrito} aria-label="Carrito"><i className="fa-solid fa-cart-shopping" aria-hidden="true"></i><CartBadge /></Link>
              <label className="text-2xl cursor-pointer opacity-80 text-black hover:opacity-100 has-[+#menu:focus-visible]:opacity-100 has-[+#menu:focus-visible]:outline-3 has-[+#menu:focus-visible]:outline-primary has-[+#menu:focus-visible]:outline-offset-4 has-[+#menu:focus-visible]:rounded-[4px] min-[1100px]:hidden" htmlFor="menu">
                  <i className="fa-solid fa-bars"></i>
              </label>
              <input type="checkbox" name="menu" id="menu" checked={menuAbierto} onChange={(e) => setMenuAbierto(e.target.checked)} className="peer absolute w-px h-px opacity-0 overflow-hidden [clip-path:inset(50%)] min-[1100px]:hidden" aria-label="Abrir menú de navegación" />
              <ul className="absolute top-full left-0 z-10 w-full max-h-0 overflow-hidden flex flex-col items-center gap-[25px] bg-secondary invisible [transition:max-height_0.4s,visibility_0s_0.4s] peer-checked:max-h-[400px] peer-checked:visible peer-checked:[transition:max-height_0.4s,visibility_0s] peer-checked:border-b peer-checked:border-[rgba(24,52,155,0.12)] min-[1100px]:visible min-[1100px]:static min-[1100px]:w-auto min-[1100px]:max-h-none min-[1100px]:overflow-visible min-[1100px]:flex-row min-[1100px]:gap-[20px] min-[1280px]:gap-[30px] min-[1100px]:bg-transparent min-[1100px]:[transition:none] min-[1100px]:peer-checked:border-b-0 motion-reduce:[transition:none]!">
                  {usuario && (
                    <li className="min-[1100px]:hidden mt-[25px] flex items-center gap-3 text-white">
                      <Avatar usuario={usuario} className="size-9" />
                      <span className="text-[20px] font-semibold">Hola, {primerNombre(usuario)}</span>
                    </li>
                  )}
                  <li className="first:mt-[25px] last:mb-[25px] min-[1100px]:first:mt-0 min-[1100px]:last:mb-0"><Link className="text-white text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]! min-[1100px]:hover:text-primary min-[1100px]:focus-visible:text-primary" to="/">Inicio</Link></li>
                  <li className="first:mt-[25px] last:mb-[25px] min-[1100px]:first:mt-0 min-[1100px]:last:mb-0"><Link className="text-white text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]! min-[1100px]:hover:text-primary min-[1100px]:focus-visible:text-primary" to="/productos">Productos</Link></li>
                  <li className="first:mt-[25px] last:mb-[25px] min-[1100px]:first:mt-0 min-[1100px]:last:mb-0"><Link className="text-white text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]! min-[1100px]:hover:text-primary min-[1100px]:focus-visible:text-primary" to="/calculadora">Calculadora</Link></li>
                  {usuario ? (
                    <>
                      <li className="max-1099:hidden"><MenuUsuario usuario={usuario} onCerrarSesion={cerrarSesion} /></li>
                      <li className="min-[1100px]:hidden last:mb-[25px]"><button type="button" onClick={cerrarSesion} className="cursor-pointer text-white text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]! min-[1100px]:hover:text-primary min-[1100px]:focus-visible:text-primary">Cerrar sesión</button></li>
                    </>
                  ) : (
                  <li className="first:mt-[25px] last:mb-[25px] min-[1100px]:first:mt-0 min-[1100px]:last:mb-0"><Link className="text-white text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]! min-[1100px]:hover:text-primary min-[1100px]:focus-visible:text-primary" to="/login">Iniciar sesión</Link></li>
                  )}
            
              </ul>
          </nav>
      </header>
  )
}
