# Kodex Tech Store

Proyecto de e-commerce de productos de computación, desarrollado con HTML, JavaScript y Tailwind CSS. Todos los estilos están escritos como clases de Tailwind dentro del HTML, sin archivos CSS propios. Es un sitio estático: no necesita servidor ni instalación.

## Páginas

- **Inicio (`index.html`)**: carrusel de promociones, productos destacados que rotan solos, beneficios (envío gratis, cuotas, compra segura, productos originales), acceso por categoría y banner de cuotas y envíos.
- **Productos (`productos.html`)**: botón de categorías, productos destacados que rotan solos, tarjeta de bienvenida, acceso a las 10 categorías y catálogo agrupado por categoría. Al elegir una categoría se muestran solo sus productos, y cada categoría se puede ordenar por precio.
- **Calculadora de cuello de botella (`calculate.html`)**: estima qué tan equilibrados están un procesador y una placa de video según la resolución en la que se juega.
- **Login (`login.html`)**: formulario de inicio de sesión con el mismo header (solo el logo, centrado) y footer del resto del sitio.

## Características

- Diseño responsive para celular, tablet y escritorio.
- Header fijo arriba al hacer scroll, con menú en línea en escritorio y menú hamburguesa en pantallas chicas, accesible con teclado.
- Carrusel con cambio automático cada 4 segundos, flechas y pausa al pasar el mouse. Cada imagen lleva a la página de productos.
- **Productos destacados** (en el inicio y en la página de productos): productos al azar que cambian cada 8 segundos y llenan una fila (de 3 a 8 tarjetas según el ancho de la pantalla; en celular, 4 en dos filas), con pausa al pasar el mouse o enfocar con teclado. Cada tarjeta lleva a su categoría.
- **Ordenar por precio**: cada categoría tiene un selector "Más relevantes", "Menor precio" y "Mayor precio".
- **Categorías de tres formas** en la página de productos, todas llevan a la misma categoría:
  - botón "Categorías" arriba y centrado, que al abrirse muestra tarjetas grandes (de a 2 por fila en celular, de a 5 desde tablet) y se cierra solo al elegir una;
  - tarjetas más chicas con ícono y nombre, debajo de la tarjeta de bienvenida;
  - el catálogo agrupado por categoría (solo se ve la elegida).
- Tarjetas de producto en grilla a todo el ancho: dos por fila en celular, más columnas en pantallas grandes.
- **Detalle de producto**: al tocar una tarjeta de producto (o una de los destacados, o su botón "Ver producto") se abre una ventana con la imagen grande, el nombre, el precio, el descuento, el precio sin impuestos nacionales y la garantía, más un botón "Agregar al carrito". Se cierra con la X, con `Esc` o tocando afuera. Funciona también con el teclado (`Tab` y `Enter` sobre la tarjeta).
- **Carrito**: el ícono del carrito y los botones "Agregar al carrito" de cualquier producto llevan a `login.html` (con un aviso) si no hay un usuario con sesión iniciada. La sesión se guarda en `localStorage` con la clave `kodex-usuario`; cuando el login se conecte a un servidor, tiene que guardar ahí el usuario al iniciar sesión. Con sesión, el ícono del carrito queda en `#` y los botones no hacen nada todavía: falta la lógica del carrito (está marcado en `js/index.js`). Los botones nuevos que agregues funcionan solos, sin configurar nada.
- **Login**: usuario o email, contraseña con botón "Mostrar" / "Ocultar", "Recordarme", y validación de campos obligatorios. Todavía no hay servidor: al enviar solo se muestra un aviso y no se inicia sesión.
- Botón "Subir" en el footer para volver al header.
- Respeta la opción del sistema "reducir movimiento": no hay cambios automáticos ni animaciones.
- Paleta de colores definida una sola vez en el tema de Tailwind y usada con clases como `bg-primary` o `text-secondary`.

## Categorías

Procesadores, Mothers, Placas de Video, Memorias RAM, Almacenamiento, Refrigeración, Gabinetes, Fuentes, Monitores y Periféricos.

## Estructura

```
├── index.html            Página de inicio (estilos con clases de Tailwind)
├── productos.html        Catálogo de productos (estilos con clases de Tailwind)
├── login.html            Inicio de sesión (formulario sin servidor todavía)
├── js/
│   ├── index.js          Todo el JavaScript del sitio (carrusel, destacados, orden, login, botón Subir)
│   ├── hardware.js       Procesadores, placas de video y resoluciones de la calculadora
│   └── productos.js      Copia de los productos para "Productos destacados" (se usa en el inicio y en productos)
├── data/
│   └── productos.json    Ejemplos de productos (no se usa en las páginas)
├── images/
│   ├── marketing/        Banners del carrusel y de promociones
│   └── Productos/        Imágenes de productos, una carpeta por categoría
└── tailwind.config.js    Vacío: no se usa (Tailwind se carga por CDN y se configura en el <head>)
```

## Paleta de colores

Se define en el bloque `@theme` que está en el `<head>` de `index.html`, `productos.html` y `login.html`, y se usa con clases de Tailwind (`bg-primary`, `text-secondary`, `border-background`, etc.). Si cambiás un color, cambialo en las tres páginas.

| Variable | Color | Uso |
|---|---|---|
| `--color-primary` | `#4F46E5` | Azul índigo: botones, precios, acentos |
| `--color-secondary` | `#0F172A` | Azul noche: texto y footer |
| `--color-background` | `#06B6D4` | Cian: detalles y foco |
| `--color-surface` | `#F1F5F9` | Fondo de la página |
| `--color-success` | `#16A34A` | Éxito |
| `--color-warning` | `#F59E0B` | Advertencia |
| `--color-error` | `#DC2626` | Error |

## Estilos con Tailwind

- Todo el diseño está en las clases de cada elemento. Para cambiar cómo se ve algo, editá sus clases en el HTML.
- En el bloque `<style type="text/tailwindcss">` del `<head>` hay tres configuraciones: la variante `hover` (para que funcione también en pantallas táctiles), los cortes de pantalla `max-400`, `max-599`, `max-767` y `max-1099` (equivalentes a `max-width`), y el tema con la paleta. Los cortes hacia arriba usan los de Tailwind, por ejemplo `min-[768px]:` y `min-[1100px]:`.
- Algunas clases no tienen estilo y se mantienen porque el JavaScript las usa para encontrar elementos: `carousel`, `carousel-track`, `carousel-slide`, `carousel-prev`, `carousel-next`, `footer-top`, `categoria`, `card`, `article`, `precio` y `orden-select`. También se usan por `id`: `destacados-grid`, `login-form`, `password`, `login-mostrar`, `login-estado` y `login-aviso`, y el atributo `data-carrito` del ícono del carrito. No los borres.
- Las tarjetas de "Productos destacados" se crean desde JavaScript (en `js/index.js`), con sus clases de Tailwind escritas ahí.

## Cómo agregar un producto

1. Guardá la imagen en la carpeta de su categoría, dentro de `images/Productos/`.
2. En `productos.html`, buscá la sección de la categoría, por ejemplo `<section class="categoria" id="fuentes">`.
3. Pegá la tarjeta dentro del `<div class="card">` de esa sección, después de la última:

```html
<article class="article flex flex-col gap-2.5 max-599:gap-2 w-full p-5 max-599:p-2.5 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl max-599:rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.12)] [transition:transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-4px)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.2)]">
    <img class="w-full max-w-[250px] aspect-square object-contain self-center" src="./images/Productos/Fuente/imagen.jpg" alt="">
    <h2 class="text-[1rem] leading-[1.4] max-599:text-[0.8rem] max-599:leading-[1.3] max-599:[overflow-wrap:anywhere]"><strong class="font-semibold">Nombre del producto</strong></h2>
    <span class="precio text-[1.6rem] max-599:text-[1.1rem] font-bold text-primary">$ 100.000</span>
    <p class="text-[12px] leading-[1.5] max-599:text-[10px] max-599:leading-[1.4] text-[#475569]">Incluye 10% de descuento
        por pago con depósito o transferencia.
        Precio s/imp. nac. $ 90.000</p>
    <span class="text-[0.85rem] max-599:text-[0.7rem] text-[#475569]">Garantía - 12 meses</span>
    <input class="cursor-pointer w-full h-[42px] max-599:h-[34px] mt-auto rounded-[50px] bg-primary text-white text-[0.95rem] max-599:text-[0.78rem] font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2" type="button" value="Agregar al carrito">
</article>
```

4. Para que aparezca en "Productos destacados" del inicio, agregalo también en `js/productos.js`, con el mismo formato que los demás:

```js
{
    "nombre": "Nombre del producto",
    "precio": "$ 100.000",
    "precioSinImpuestos": "$ 90.000",
    "descuento": "10%",
    "garantia": "12 meses",
    "imagen": "images/Productos/Fuente/imagen.jpg",
    "categoria": "Fuentes",
    "categoriaId": "fuentes"
}
```

Reglas a tener en cuenta:
- Conviene copiar una tarjeta completa que ya exista y cambiar solo la imagen y los textos, así se conservan las clases.
- El precio tiene que conservar la clase `precio` (además de sus clases de Tailwind): el selector "Ordenar por" la usa para leer el precio.
- `descuento` y `garantia` de `js/productos.js` se muestran en la ventana de detalle de los destacados. Las tarjetas de `productos.html` leen esos datos de su propio texto, así que ahí hay que mantener el formato `Incluye 10% de descuento…`, `Precio s/imp. nac. $ …` y `Garantía - …`.
- El `categoriaId` de `js/productos.js` es el `id` de la sección en `productos.html`.
- Si cambiás un nombre o un precio en `productos.html`, cambialo también en `js/productos.js`.

## Cómo agregar una categoría

Una categoría nueva se muestra en varios lugares de `productos.html`; hay que agregarla en todos con el mismo `id` (por ejemplo `monitores`):

1. Una `<section class="categoria" id="...">` con su título, su selector "Ordenar por" y su `<div class="card">`. Conviene copiar una existente.
2. Una tarjeta en el desplegable "Categorías" (`<details>`) y otra en las tarjetas chicas de abajo de la bienvenida. Copiá una de cada una y cambiá el `href`, el ícono y el nombre.
3. Una tarjeta en "Comprá por categoría" de `index.html`, con el `href` `./productos.html#id`.
4. Una carpeta con su nombre en `images/Productos/` para las imágenes.

## Calculadora de cuello de botella

La página `calculate.html` compara un procesador y una placa de video según la resolución. Los datos están en `js/hardware.js` y la lógica en `js/index.js`.

- **Qué elige el usuario:** procesador, placa de video y resolución. Nada más.
- **Datos:** cada componente tiene un `rendimiento`, un índice orientativo de rendimiento en juegos a 1080p. 100 es gama media (un Ryzen 5 5600 o una RTX 4060): un procesador y una placa con el mismo índice se consideran equilibrados. **Son valores estimados, no mediciones**: conviene revisarlos con reseñas o benchmarks antes de publicar. Para agregar un componente, sumá una línea con su nombre y su índice.
- **Cálculo:** a la placa de video se le suma exigencia según la resolución (`resoluciones` en el mismo archivo, valores ajustables). El cuello de botella es la diferencia entre los dos, respecto del que más rinde. Hasta 10% se considera muy equilibrado, hasta 20% bueno, hasta 35% aceptable y más que eso desbalanceado.
- **Es una estimación:** no mide FPS reales; depende del juego, de la memoria RAM y de la configuración.

## Cómo ejecutarlo

Abrí `index.html` en el navegador. Tailwind, la fuente y los íconos se cargan desde internet, así que hace falta conexión.

## Tecnologías

- HTML5 y JavaScript sin librerías (todo el JavaScript está en `js/`)
- [Tailwind CSS v4](https://tailwindcss.com/) (versión CDN) para todos los estilos
- [Font Awesome](https://fontawesome.com/) para los íconos
- Google Fonts (Nata Sans)
