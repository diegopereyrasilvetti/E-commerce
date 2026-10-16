import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout.jsx'
import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import Producto from './pages/Producto.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import RecuperarPassword from './pages/RecuperarPassword.jsx'
import NuevaPassword from './pages/NuevaPassword.jsx'
import Calculadora from './pages/Calculadora.jsx'
import Cart from './cart.jsx'
import RutaProtegida from './components/RutaProtegida.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'
import Cuenta from './pages/Cuenta.jsx'

export default function App() {
  return (
    <Routes>
      {/* Páginas con el header completo */}
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="productos/:categoria?" element={<Productos />} />
        <Route path="producto/:slug" element={<Producto />} />
        <Route path="carrito" element={<RutaProtegida><Cart /></RutaProtegida>} />
        <Route path="calculadora" element={<Calculadora />} />
        <Route path="cuenta" element={<RutaProtegida motivo="cuenta"><Cuenta /></RutaProtegida>} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>

      {/* Páginas con el header solo con el logo, centrado */}
      <Route element={<Layout soloLogo />}>
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="recuperar" element={<RecuperarPassword />} />
        <Route path="nueva-contrasena" element={<NuevaPassword />} />
      </Route>
    </Routes>
  )
}
