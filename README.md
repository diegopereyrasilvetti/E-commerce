# Kodex Tech Store

Proyecto de e-commerce de productos de computación, desarrollado con HTML, CSS y Tailwind CSS. Es un sitio estático: no necesita servidor ni instalación.

## Páginas

- **Inicio (`index.html`)**: carrusel de promociones, beneficios (envío gratis, cuotas, compra segura, productos originales), acceso por categoría y banner de cuotas y envíos.
- **Productos (`productos.html`)**: catálogo agrupado en 10 categorías. Al elegir una categoría en el botón "Categorías" se muestran solo sus productos.

## Características

- Diseño responsive para celular, tablet y escritorio.
- Menú hamburguesa en pantallas chicas, accesible con teclado.
- Carrusel con cambio automático cada 4 segundos, flechas, pausa al pasar el mouse y respeto por "reducir movimiento".
- Tarjetas de producto en grilla: dos por fila en celular, más columnas en pantallas grandes.
- Paleta de colores definida una sola vez y compartida entre CSS y Tailwind.

## Categorías

Procesadores, Mothers, Placas de Video, Memorias RAM, Almacenamiento, Refrigeración, Gabinetes, Fuentes, Monitores y Periféricos.

## Estructura

```
├── index.html            Página de inicio
├── productos.html        Catálogo de productos
├── style/
│   ├── index.css         Estilos generales, header, footer e inicio
│   └── producto.css      Estilos de categorías y tarjetas de producto
├── images/
│   ├── marketing/        Banners del carrusel y de promociones
│   └── Productos/        Imágenes de productos, una carpeta por categoría
├── data/productos.json   Ejemplos de productos (no se usa todavía en las páginas)
└── tailwind.config.js
```

## Paleta de colores

Se define en el bloque `@theme` de `index.html` y se usa tanto en CSS (`var(--color-primary)`) como en Tailwind (`bg-primary`, `text-secondary`, etc.).

| Variable | Color | Uso |
|---|---|---|
| `--color-primary` | `#4F46E5` | Azul índigo: botones, precios, acentos |
| `--color-secondary` | `#0F172A` | Azul noche: texto y footer |
| `--color-background` | `#06B6D4` | Cian: detalles y foco |
| `--color-surface` | `#F1F5F9` | Fondo de la página |
| `--color-success` | `#16A34A` | Éxito |
| `--color-warning` | `#F59E0B` | Advertencia |
| `--color-error` | `#DC2626` | Error |

## Cómo agregar un producto

1. Guardá la imagen en la carpeta de su categoría, dentro de `images/Productos/`.
2. En `productos.html`, buscá la sección de la categoría, por ejemplo `<section class="categoria" id="fuentes">`.
3. Pegá la tarjeta dentro del `<div class="card">` de esa sección, después de la última:

```html
<article class="article">
    <img class="productimage" src="./images/Productos/Fuente/imagen.jpg" alt="">
    <h2><strong>Nombre del producto</strong></h2>
    <span class="precio">$ 100.000</span>
    <p class="textbuy">Incluye 10% de descuento
        por pago con depósito o transferencia.
        Precio s/imp. nac. $ 90.000</p>
    <span>Garantía - 12 meses</span>
    <input class="butoncard" type="button" value="Agregar al carrito">
</article>
```

Todas las tarjetas de una categoría van dentro de un mismo `<div class="card">`. Si se abre otro, quedan una debajo de la otra.

## Cómo ejecutarlo

Abrí `index.html` en el navegador. Tailwind, la fuente y los íconos se cargan desde internet, así que hace falta conexión.

## Tecnologías

- HTML5 y CSS3
- [Tailwind CSS v4](https://tailwindcss.com/) (versión CDN)
- [Font Awesome](https://fontawesome.com/) para los íconos
- Google Fonts (Nata Sans)
