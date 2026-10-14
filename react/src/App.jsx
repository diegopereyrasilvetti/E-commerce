import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout.jsx'
import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import Login from './pages/Login.jsx'
import Calculadora from './pages/Calculadora.jsx'

export default function App() {
  return (
    <Routes>
      {/* Páginas con el header completo */}
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="productos" element={<Productos />} />
      </Route>

      {/* Páginas con el header solo con el logo, centrado */}
      <Route element={<Layout soloLogo />}>
        <Route path="login" element={<Login />} />
        <Route path="calculadora" element={<Calculadora />} />
      </Route>
    </Routes>
  )
}
