# Kodex Tech Store

Tienda online de hardware de PC (procesadores, placas de video, memorias, almacenamiento y más) hecha con **React, Vite y Tailwind CSS**. Es una aplicación de una sola página (SPA): un único `index.html` y las pantallas como componentes.

![Inicio](docs/inicio.png)

## Qué se puede hacer

- **Inicio:** carrusel de promociones que cambia solo cada 4 segundos, banner de la calculadora, productos destacados al azar que se renuevan cada 8 segundos y acceso por categoría.
- **Productos:** las 10 categorías, cada una con su lista y orden por menor o mayor precio. Al tocar un producto se abre una ventana con la imagen, los precios, el descuento y la garantía.
- **Carrito:** agregar, cambiar cantidades, quitar y vaciar. Muestra subtotal, descuento por transferencia, total y cuotas sin interés (1, 6, 12 o 18). Se guarda en el navegador y sigue ahí al recargar.
- **Calculadora de cuello de botella:** compara un procesador y una placa de video según la resolución, con un gráfico circular del porcentaje de compatibilidad.
- **Sesión:** sin usuario, "Agregar al carrito" y el ícono del carrito llevan a iniciar sesión.
- **Responsive y accesible:** pensado para celular, tablet y escritorio; navegable con teclado y con respeto a `prefers-reduced-motion`.

| Categoría | Calculadora | Celular |
|---|---|---|
| ![Categoría](docs/categoria.png) | ![Calculadora](docs/calculadora.png) | ![Celular](docs/movil.png) |

## Tecnologías

- [React 19](https://react.dev) con hooks (`useState`, `useEffect`, `useReducer`, `useContext`, `useMemo`)
- [React Router 7](https://reactrouter.com) para las rutas
- [Vite 8](https://vite.dev) como herramienta de desarrollo y compilación
- [Tailwind CSS 4](https://tailwindcss.com) con la paleta del sitio definida en `src/index.css`
- Font Awesome para los íconos

## Cómo correrlo

Requiere [Node.js](https://nodejs.org) 20 o más nuevo.

```bash
npm install     # una sola vez
npm run dev     # desarrollo en http://localhost:5173
npm run build   # genera la carpeta dist/ para publicar
npm run preview # prueba el build local
```

Para publicarlo en un hosting estático hay que redirigir todas las direcciones a `index.html` (así funcionan `/productos/mothers` o `/carrito` al recargar).

## Estructura

```
index.html              Único HTML de la aplicación
public/images/          Imágenes de productos y promociones (se sirven en /images/...)
src/
  main.jsx              Punto de entrada: Router y CartProvider
  App.jsx               Rutas
  index.css             Tailwind, paleta de colores y cortes de pantalla
  cart.jsx              Carrito: estado, hook useCart, botón, globito y página /carrito
  layouts/Layout.jsx    Header + página + footer
  pages/                Inicio, Productos, Calculadora, Login, NoEncontrada
  components/           Header, Footer, Carrusel, Destacados, ProductoCard, ProductoDetalle
  data/                 Productos, categorías y datos de la calculadora
  utils/                Sesión y título de la pestaña
```

## Decisiones de diseño

- **Un solo estado del carrito para toda la app.** `CartProvider` usa `useReducer` y comparte el carrito por contexto; cualquier componente lo lee con `useCart()`. Los totales se calculan a partir de los productos, no se guardan.
- **Los productos son datos, no HTML.** Para agregar uno se suma un objeto en `src/data/productos.js` y aparece solo en su categoría, en los destacados y en el detalle.
- **Rutas con la categoría en la dirección** (`/productos/:categoria`): se puede compartir el enlace de una categoría y funcionan los botones de atrás y adelante.
- **Sin dependencias de más:** el carrusel, la ventana de detalle (`<dialog>`), el gráfico circular (SVG) y el cálculo son código propio.

## Qué falta (a propósito)

- **No hay servidor.** El inicio de sesión valida el formulario pero no autentica, y "Finalizar compra" muestra un aviso en vez de cobrar. Para probar el flujo con sesión: `localStorage.setItem('kodex-usuario', 'demo')` en la consola del navegador.
- **Los productos están en un archivo.** El paso siguiente sería leerlos de una API.
- El índice de rendimiento de la calculadora es una estimación orientativa, no mediciones reales.

## Datos del carrito

El carrito se guarda en `localStorage` con la clave `kodex-carrito` y la sesión con `kodex-usuario`. Un producto se identifica por su `imagen` porque el nombre se puede repetir.
