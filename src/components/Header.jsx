import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { primerNombre, useAuth } from '../auth.jsx'
import BuscadorProductos from './BuscadorProductos.jsx'
import MenuUsuario, { Avatar } from './MenuUsuario.jsx'
import { CartBadge } from '../cart.jsx'

// Enlace del menú. La página actual queda marcada (NavLink le pone aria-current="page"):
// en el menú oscuro del celular se pinta de cian y en la barra de escritorio lleva un subrayado.
const ENLACE_MENU =
  "relative text-white text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold [transition:color_0.2s,opacity_0.2s,background-color_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 aria-[current=page]:opacity-100 aria-[current=page]:text-background aria-[current=page]:font-bold motion-reduce:[transition:none]! max-1099:flex max-1099:items-center max-1099:justify-center max-1099:gap-3 max-1099:w-full max-1099:px-6 max-1099:py-3.5 max-1099:text-center max-1099:hover:bg-[rgba(255,255,255,0.08)] max-1099:aria-[current=page]:bg-[rgba(255,255,255,0.12)] min-[1100px]:hover:text-primary min-[1100px]:focus-visible:text-primary min-[1100px]:aria-[current=page]:text-primary min-[1100px]:after:absolute min-[1100px]:after:-bottom-1.5 min-[1100px]:after:left-0 min-[1100px]:after:h-0.5 min-[1100px]:after:w-full min-[1100px]:after:bg-background min-[1100px]:after:origin-left min-[1100px]:after:scale-x-0 min-[1100px]:after:[transition:transform_0.2s] min-[1100px]:hover:after:scale-x-100 min-[1100px]:aria-[current=page]:after:scale-x-100 motion-reduce:after:[transition:none]!"

// Ícono de cada opción: solo se ve en el menú del celular
function Icono({ nombre }) {
  return <i className={'fa-solid ' + nombre + ' w-5 text-center min-[1100px]:hidden'} aria-hidden="true"></i>
}

function NavItem({ to, end, icono, children }) {
  return (
    <NavLink to={to} end={end} className={ENLACE_MENU}>
      <Icono nombre={icono} />
      {children}
    </NavLink>
  )
}

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
  // Con el menú abierto, Esc lo cierra
  useEffect(() => {
    if (!menuAbierto) return
    const escape = (e) => {
      if (e.key === 'Escape') setMenuAbierto(false)
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [menuAbierto])

  if (soloLogo) {
    return (
      <header className="sticky top-0 z-20 h-[70px] px-6 max-400:px-4 min-[768px]:px-10 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] shrink-0 border-b border-[rgba(120,150,255,0.12)]">
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
      <header className="sticky top-0 z-20 h-[70px] px-6 max-400:px-4 min-[768px]:px-10 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] shrink-0 border-b border-[rgba(120,150,255,0.12)]">
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
              <BuscadorProductos />
              <Link className="relative text-text max-1099:ml-auto max-1099:mr-4 min-[1100px]:order-1 min-[1100px]:ml-6 min-[1100px]:mr-0 min-[1100px]:hover:text-primary text-[22px] max-400:text-[20px] min-[1100px]:text-[18px] min-[1100px]:text-secondary min-[1100px]:font-semibold min-[1100px]:[transition:color_0.2s,opacity_0.2s] whitespace-nowrap no-underline opacity-80 hover:opacity-100 motion-reduce:[transition:none]!" to={rutaCarrito} aria-label="Carrito"><i className="fa-solid fa-cart-shopping" aria-hidden="true"></i><CartBadge /></Link>
              <label className="-m-2 p-2 text-2xl cursor-pointer opacity-80 text-black hover:opacity-100 has-[+#menu:focus-visible]:opacity-100 has-[+#menu:focus-visible]:outline-3 has-[+#menu:focus-visible]:outline-primary has-[+#menu:focus-visible]:outline-offset-4 has-[+#menu:focus-visible]:rounded-[4px] min-[1100px]:hidden" htmlFor="menu">
                  <i key={menuAbierto} className={'fa-solid animate-pop motion-reduce:animate-none ' + (menuAbierto ? 'fa-xmark' : 'fa-bars')} aria-hidden="true"></i>
              </label>
              <input type="checkbox" name="menu" id="menu" checked={menuAbierto} onChange={(e) => setMenuAbierto(e.target.checked)} className="peer absolute w-px h-px opacity-0 overflow-hidden [clip-path:inset(50%)] min-[1100px]:hidden" aria-label={menuAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'} />
              {/* Fondo oscuro detrás del menú: al tocarlo se cierra (solo celular y tablet) */}
              {menuAbierto && (
                <div className="fixed inset-x-0 bottom-0 top-[70px] z-[5] bg-[rgba(15,23,42,0.5)] min-[1100px]:hidden" onClick={() => setMenuAbierto(false)} aria-hidden="true" />
              )}
              <ul className="absolute top-full left-0 z-10 w-full max-h-0 overflow-hidden flex flex-col items-stretch gap-0 bg-[rgba(15,23,42,0.75)] backdrop-blur-md invisible [transition:max-height_0.4s,visibility_0s_0.4s] peer-checked:max-h-[480px] peer-checked:visible peer-checked:[transition:max-height_0.4s,visibility_0s] peer-checked:border-b peer-checked:border-[rgba(24,52,155,0.12)] min-[1100px]:visible min-[1100px]:static min-[1100px]:w-auto min-[1100px]:max-h-none min-[1100px]:overflow-visible min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:gap-[20px] min-[1280px]:gap-[30px] min-[1100px]:bg-transparent min-[1100px]:backdrop-blur-none min-[1100px]:[transition:none] min-[1100px]:peer-checked:border-b-0 motion-reduce:[transition:none]!">
                  {usuario && (
                    <li className="min-[1100px]:hidden flex items-center justify-center gap-3 px-6 py-4 text-white">
                      <Avatar usuario={usuario} className="size-9" />
                      <span className="text-[20px] font-semibold">Hola, {primerNombre(usuario)}</span>
                    </li>
                  )}
                  <li><NavItem to="/" end icono="fa-house">Inicio</NavItem></li>
                  <li><NavItem to="/productos" icono="fa-box-open">Productos</NavItem></li>
                  <li><NavItem to="/calculadora" icono="fa-calculator">Calculadora</NavItem></li>
                  {usuario ? (
                    <>
                      <li className="max-1099:hidden"><MenuUsuario usuario={usuario} onCerrarSesion={cerrarSesion} /></li>
                      <li className="min-[1100px]:hidden"><NavItem to="/cuenta" icono="fa-user">Mi cuenta</NavItem></li>
                      <li className="min-[1100px]:hidden"><button type="button" onClick={cerrarSesion} className={'cursor-pointer ' + ENLACE_MENU}><Icono nombre="fa-right-from-bracket" />Cerrar sesión</button></li>
                    </>
                  ) : (
                  <li><NavItem to="/login" icono="fa-right-to-bracket">Iniciar sesión</NavItem></li>
                  )}
            
              </ul>
          </nav>
      </header>
  )
}
