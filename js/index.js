/* JavaScript de todo el sitio. Cada bloque se ejecuta solo si los elementos que usa existen en la página. */

// ============================================================
// Todas las páginas: botón "Subir" del footer
// ============================================================
// Botón del footer: vuelve al header sin cambiar la dirección de la página
document.querySelectorAll('.footer-top').forEach(function (b) {
    b.addEventListener('click', function () {
        var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
    });
});

// ============================================================
// Todas las páginas: el carrito y "Agregar al carrito" piden iniciar sesión
// ============================================================
// La sesión se guarda en localStorage con la clave "kodex-usuario" (cuando el login esté
// conectado a un servidor, tiene que guardar ahí el usuario al iniciar sesión).
function haySesion() {
    try { return !!localStorage.getItem('kodex-usuario'); } catch (e) { return false; } // navegación privada: sin sesión
}

// Ícono del carrito del header: sin usuario lleva a login.html
document.querySelectorAll('[data-carrito]').forEach(function (link) {
    link.href = haySesion() ? '#' : './login.html?desde=carrito'; // todavía no hay página del carrito
});

function agregarAlCarrito() {
    if (!haySesion()) {
        window.location.href = './login.html?desde=agregar';
        return;
    }
    // Con sesión iniciada: acá va la lógica para agregar el producto al carrito (todavía no existe)
}

// Botones "Agregar al carrito" de cualquier producto (también los que se agreguen después)
document.addEventListener('click', function (e) {
    if (e.target.closest('article input[type="button"]')) agregarAlCarrito();
});

// ============================================================
// Todas las páginas: ventana con el detalle de un producto
// ============================================================
// abrirDetalle(producto) recibe { nombre, precio, precioSinImpuestos, descuento, garantia, categoria, src }
// (en "src" va la ruta de la imagen; si falta se arma con "imagen", como viene en js/productos.js).
var ventanaDetalle = null;

function crear(tag, clases, texto) {
    var e = document.createElement(tag);
    if (clases) e.className = clases;
    if (texto !== undefined) e.textContent = texto;
    return e;
}

function armarVentanaDetalle() {
    var d = crear('dialog', 'm-auto w-[min(860px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-auto p-0 rounded-2xl bg-white text-secondary shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop:bg-[rgba(15,23,42,0.65)]');
    d.setAttribute('aria-labelledby', 'detalle-titulo');

    var cerrar = crear('button', 'absolute top-3 right-3 z-10 grid place-items-center size-9 rounded-full bg-[rgba(15,23,42,0.08)] text-secondary text-[1.1rem] cursor-pointer hover:bg-[rgba(15,23,42,0.16)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2', '\u2715');
    cerrar.type = 'button';
    cerrar.setAttribute('aria-label', 'Cerrar');
    cerrar.addEventListener('click', function () { d.close(); });

    var cuerpo = crear('div', 'relative grid grid-cols-1 min-[700px]:grid-cols-2');
    var zonaImg = crear('div', 'flex items-center justify-center p-6 bg-white');
    var img = crear('img', 'w-full max-w-[360px] aspect-square object-contain');
    img.alt = '';
    zonaImg.appendChild(img);

    var info = crear('div', 'flex flex-col gap-3 p-6 min-[700px]:pr-14');
    var cat = crear('span', 'text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-primary');
    var titulo = crear('h2', 'text-[1.25rem] min-[700px]:text-[1.4rem] font-bold leading-[1.3]');
    titulo.id = 'detalle-titulo';
    var precio = crear('span', 'text-[2rem] font-bold text-primary');
    var descuento = crear('p', 'p-3 rounded-xl bg-[rgba(22,163,74,0.1)] text-[#166534] text-[0.9rem] font-semibold');
    var sinImp = crear('p', 'text-[0.9rem] text-[#475569]');
    var garantia = crear('p', 'flex items-center gap-2 text-[0.9rem]');
    var agregar = crear('button', 'mt-auto w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2', 'Agregar al carrito');
    agregar.type = 'button';
    agregar.addEventListener('click', agregarAlCarrito);
    info.append(cat, titulo, precio, descuento, sinImp, garantia, agregar);

    cuerpo.append(zonaImg, info);
    d.append(cerrar, cuerpo);
    // clic fuera de la ventana (en el fondo oscuro) = cerrar
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    document.body.appendChild(d);
    d._ref = { img: img, cat: cat, titulo: titulo, precio: precio, descuento: descuento, sinImp: sinImp, garantia: garantia };
    return d;
}

function abrirDetalle(p) {
    if (!ventanaDetalle) ventanaDetalle = armarVentanaDetalle();
    var r = ventanaDetalle._ref;
    r.img.src = p.src || ('./' + p.imagen);
    r.img.alt = p.nombre;
    r.cat.textContent = p.categoria || '';
    r.cat.hidden = !p.categoria;
    r.titulo.textContent = p.nombre;
    r.precio.textContent = p.precio;
    r.descuento.textContent = 'Incluye ' + p.descuento + ' de descuento por pago con depósito o transferencia.';
    r.descuento.hidden = !p.descuento;
    r.sinImp.textContent = 'Precio s/imp. nac. ' + p.precioSinImpuestos;
    r.sinImp.hidden = !p.precioSinImpuestos;
    r.garantia.textContent = 'Garantía - ' + p.garantia;
    r.garantia.hidden = !p.garantia;
    ventanaDetalle.showModal();
}

// Tarjetas de producto de productos.html: al tocar la tarjeta (menos su botón) se abre el detalle
function productoDesdeTarjeta(tarjeta) {
    function texto(sel) { var e = tarjeta.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }
    var nota = texto('p');
    var gar = '';
    tarjeta.querySelectorAll('span').forEach(function (sp) {
        var m = sp.textContent.match(/Garant[ií]a\s*-\s*(.+)/);
        if (m) gar = m[1].trim();
    });
    var seccion = tarjeta.closest('section');
    var tituloSeccion = seccion ? seccion.querySelector('h2') : null;
    return {
        nombre: texto('h2'),
        precio: texto('.precio'),
        precioSinImpuestos: (nota.match(/Precio s\/imp\. nac\.\s*(\$\s*[\d.]+)/) || [])[1] || '',
        descuento: (nota.match(/(\d+%)/) || [])[1] || '',
        garantia: gar,
        categoria: tituloSeccion ? tituloSeccion.textContent.trim() : '',
        src: tarjeta.querySelector('img').getAttribute('src')
    };
}

document.querySelectorAll('article').forEach(function (tarjeta) {
    tarjeta.tabIndex = 0;
    tarjeta.classList.add('cursor-pointer', 'focus-visible:outline-3', 'focus-visible:outline-background', 'focus-visible:outline-offset-2');
    tarjeta.setAttribute('aria-haspopup', 'dialog');
});
document.addEventListener('click', function (e) {
    var tarjeta = e.target.closest('article');
    if (!tarjeta || e.target.closest('input[type="button"]')) return;
    abrirDetalle(productoDesdeTarjeta(tarjeta));
});
document.addEventListener('keydown', function (e) {
    if ((e.key !== 'Enter' && e.key !== ' ') || !e.target.matches('article')) return;
    e.preventDefault();
    abrirDetalle(productoDesdeTarjeta(e.target));
});

// ============================================================
// Inicio y Productos (index.html y productos.html): productos destacados que rotan cada 8 segundos
// ============================================================
(function () {
    var grid = document.getElementById('destacados-grid');
    var productos = window.PRODUCTOS || [];
    if (!grid || !productos.length) { if (grid) grid.parentNode.hidden = true; return; }

    var INTERVALO = 8000;  // cambia cada 8 segundos
    var actuales = [];
    var timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cuántas tarjetas mostrar: las que entran en una fila (en celular, 2 filas de 2 columnas)
    function cantidad() {
        var columnas = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
        return columnas > 2 ? columnas : 4;
    }

    // Mezcla la lista y toma N, evitando repetir los que ya se ven si alcanzan los demás
    function elegir() {
        var n = cantidad();
        var pool = productos.filter(function (p) { return actuales.indexOf(p) === -1; });
        if (pool.length < n) pool = productos.slice();
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
        }
        return pool.slice(0, Math.min(n, pool.length));
    }

    function tarjeta(p) {
        var a = document.createElement('a');
        a.className = 'flex flex-col gap-1.5 p-2.5 min-[768px]:gap-2 min-[768px]:p-3.5 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-xl shadow-[0_2px_6px_rgba(15,23,42,0.08)] [transition:transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-3px)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.18)] focus-visible:[transform:translateY(-3px)] focus-visible:shadow-[0_8px_18px_rgba(15,23,42,0.18)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2';
        a.href = './productos.html#' + p.categoriaId; // sin JavaScript lleva a la categoría
        a.addEventListener('click', function (e) {
            e.preventDefault();
            abrirDetalle(p);
        });

        var img = document.createElement('img');
        img.src = './' + p.imagen;
        img.className = 'w-full aspect-square object-contain bg-white rounded-lg';
        img.alt = '';
        img.loading = 'lazy';

        var cat = document.createElement('span');
        cat.className = 'text-[0.7rem] font-semibold uppercase tracking-[0.04em] text-primary';
        cat.textContent = p.categoria;

        var nombre = document.createElement('h3');
        nombre.className = 'line-clamp-3 text-[0.8rem] min-[768px]:text-[0.9rem] font-semibold leading-[1.3]';
        nombre.textContent = p.nombre;

        var precio = document.createElement('span');
        precio.className = 'mt-auto text-[1.1rem] min-[768px]:text-[1.3rem] font-bold text-primary';
        precio.textContent = p.precio;

        var cta = document.createElement('span');
        cta.className = 'p-2 rounded-[50px] bg-primary text-white text-center text-[0.78rem] min-[768px]:text-[0.85rem] font-semibold';
        cta.textContent = 'Ver producto';

        a.append(img, cat, nombre, precio, cta);
        return a;
    }

    function render() {
        actuales = elegir();
        grid.replaceChildren.apply(grid, actuales.map(tarjeta));
    }

    function cambiar() {
        grid.style.opacity = '0';
        setTimeout(function () {
            render();
            grid.style.opacity = '';
        }, reduceMotion ? 0 : 300);
    }

    function start() {
        if (reduceMotion) return;
        stop();
        timer = setInterval(cambiar, INTERVALO);
    }

    function stop() { clearInterval(timer); }

    // Se pausa mientras el mouse o el foco del teclado están sobre las tarjetas
    grid.addEventListener('mouseenter', stop);
    grid.addEventListener('mouseleave', start);
    grid.addEventListener('focusin', stop);
    grid.addEventListener('focusout', start);

    render();
    start();

    var ajuste = null;
    window.addEventListener('resize', function () {
        clearTimeout(ajuste);
        ajuste = setTimeout(function () {
            if (cantidad() !== actuales.length) render();
        }, 150);
    });
})();

// ============================================================
// Inicio (index.html): carrusel de promociones
// ============================================================
(function () {
    var track = document.querySelector('.carousel-track');
    if (!track) return;
    var slides = track.querySelectorAll('.carousel-slide');
    var current = 0;

    function show(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + current * 100 + '%)';
        slides.forEach(function (slide, i) {
            // Las imágenes fuera de vista no reciben foco con el teclado
            slide.inert = i !== current;
            slide.setAttribute('aria-hidden', i !== current);
        });
    }

    var carousel = document.querySelector('.carousel');
    var timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cambio automático cada 4 segundos
    function start() {
        if (reduceMotion) return;
        stop();
        timer = setInterval(function () { show(current + 1); }, 4000);
    }

    function stop() {
        clearInterval(timer);
    }

    document.querySelector('.carousel-prev').addEventListener('click', function () { show(current - 1); start(); });
    document.querySelector('.carousel-next').addEventListener('click', function () { show(current + 1); start(); });

    // Se pausa mientras el mouse o el foco del teclado están sobre el carrusel
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    show(0);
    start();
})();

// ============================================================
// Productos (productos.html): ordenar cada categoría por precio
// ============================================================
(function () {
    // Convierte "$ 198.500" en 198500
    function precio(card) {
        var el = card.querySelector('.precio');
        return el ? parseInt(el.textContent.replace(/[^0-9]/g, ''), 10) || 0 : 0;
    }

    document.querySelectorAll('.orden-select').forEach(function (select) {
        var grilla = select.closest('.categoria').querySelector('.card');
        var tarjetas = Array.prototype.slice.call(grilla.querySelectorAll(':scope > .article'));
        var original = tarjetas.slice();

        select.addEventListener('change', function () {
            var lista = original.slice();
            if (select.value === 'menor') lista.sort(function (a, b) { return precio(a) - precio(b); });
            if (select.value === 'mayor') lista.sort(function (a, b) { return precio(b) - precio(a); });
            lista.forEach(function (t) { grilla.appendChild(t); });
        });
    });
})();

// ============================================================
// Productos (productos.html): el desplegable "Categorías" se cierra al elegir una
// ============================================================
document.querySelectorAll('details a').forEach(function (link) {
    link.addEventListener('click', function () {
        link.closest('details').open = false;
    });
});

// ============================================================
// Productos (productos.html): "Ver todos" abre el desplegable de categorías
// ============================================================
document.querySelectorAll('[data-abrir-categorias]').forEach(function (link) {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        var detalle = document.querySelector('details');
        if (!detalle) return;
        detalle.open = true;
        var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        detalle.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
    });
});

// ============================================================
// Calculadora (calculate.html): cuello de botella entre procesador y placa de video
// ============================================================
// Compara el rendimiento estimado de cada componente (índices en js/hardware.js) según la resolución.
(function () {
    var form = document.getElementById('calc-form');
    var datos = window.HARDWARE;
    if (!form || !datos) return;

    var selCpu = document.getElementById('calc-cpu');
    var selGpu = document.getElementById('calc-gpu');
    var selRes = document.getElementById('calc-res');

    function llenar(select, lista) {
        lista.forEach(function (c, i) {
            var op = document.createElement('option');
            op.value = String(i);
            op.textContent = c.nombre;
            select.appendChild(op);
        });
    }
    llenar(selCpu, datos.procesadores);
    llenar(selGpu, datos.placas);
    llenar(selRes, datos.resoluciones);

    function pct(n) { return Math.round(n * 100); }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var cpu = datos.procesadores[Number(selCpu.value)];
        var gpu = datos.placas[Number(selGpu.value)];
        var res = datos.resoluciones[Number(selRes.value)];

        // Con el mismo índice, procesador y placa están equilibrados a 1080p.
        // A mayor resolución la placa de video trabaja más, así que "rinde menos" para la misma exigencia.
        var cpuRel = cpu.rendimiento / 100;
        var gpuRel = (gpu.rendimiento / 100) / res.exigencia;

        // Diferencia entre ambos, respecto del que más rinde (0 = equilibrados)
        var limite = cpuRel < gpuRel ? 'cpu' : 'gpu';
        var cuello = Math.abs(cpuRel - gpuRel) / Math.max(cpuRel, gpuRel);
        var compat = 1 - cuello;

        var veredicto, clases, detalle, trazo;
        if (cuello <= 0.1) {
            veredicto = 'Muy equilibrado'; clases = 'bg-[rgba(22,163,74,0.12)] text-[#166534]'; trazo = 'stroke-success';
            detalle = 'El procesador y la placa de video rinden parecido: ninguno desperdicia al otro.';
        } else if (cuello <= 0.2) {
            veredicto = 'Bueno'; clases = 'bg-[rgba(22,163,74,0.12)] text-[#166534]'; trazo = 'stroke-success';
            detalle = limite === 'cpu'
                ? 'El procesador queda un poco por debajo de la placa de video, pero la diferencia es chica.'
                : 'La placa de video queda un poco por debajo del procesador. En juegos es la situación más común y no es un problema.';
        } else if (cuello <= 0.35) {
            veredicto = 'Aceptable'; clases = 'bg-[rgba(245,158,11,0.15)] text-[#92400E]'; trazo = 'stroke-warning';
            detalle = limite === 'cpu'
                ? 'El procesador limita a la placa de video: puede que no aproveches toda su potencia, sobre todo a resoluciones bajas.'
                : 'La placa de video limita al conjunto. Para jugar es aceptable; el procesador te queda de sobra.';
        } else {
            veredicto = 'Desbalanceado'; clases = 'bg-[rgba(220,38,38,0.1)] text-[#991B1B]'; trazo = 'stroke-error';
            detalle = limite === 'cpu'
                ? 'Hay un cuello de botella fuerte en el procesador: la placa de video queda muy desaprovechada. Conviene un procesador más potente.'
                : 'Hay un cuello de botella fuerte en la placa de video: el procesador rinde mucho más de lo que la placa puede aprovechar.';
        }

        document.getElementById('calc-compat').textContent = pct(compat) + '%';
        var v = document.getElementById('calc-veredicto');
        v.textContent = veredicto;
        v.className = 'px-3 py-1 rounded-full text-[0.85rem] font-bold ' + clases;
        document.getElementById('calc-detalle').textContent =
            cpu.nombre + ' + ' + gpu.nombre + ' a ' + res.nombre + ': ' + detalle +
            (cuello > 0.1 ? ' Cuello de botella estimado: ' + pct(cuello) + '% en ' + (limite === 'cpu' ? 'el procesador' : 'la placa de video') + '.' : '');
        document.getElementById('calc-cpu-valor').textContent = pct(Math.min(cpuRel, 1)) + '%';
        document.getElementById('calc-gpu-valor').textContent = pct(Math.min(gpuRel, 1)) + '%';
        document.getElementById('calc-res-texto').textContent = 'a ' + res.nombre;
        document.getElementById('calc-cpu-barra').style.width = pct(Math.min(cpuRel, 1)) + '%';
        document.getElementById('calc-gpu-barra').style.width = pct(Math.min(gpuRel, 1)) + '%';

        var caja = document.getElementById('calc-resultado');
        caja.classList.remove('hidden');

        // Círculo: el arco llena la parte que corresponde al porcentaje de compatibilidad
        var arco = document.getElementById('calc-donut-arco');
        var largo = 2 * Math.PI * 52; // circunferencia del círculo (radio 52)
        arco.setAttribute('class', '[transition:stroke-dashoffset_0.6s_ease,stroke_0.3s] motion-reduce:[transition:none]! ' + trazo);
        document.getElementById('calc-donut').setAttribute('aria-label', 'Compatibilidad: ' + pct(compat) + '%');
        requestAnimationFrame(function () {
            arco.style.strokeDashoffset = String(largo * (1 - compat));
        });
        caja.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    });
})();

// ============================================================
// Login (login.html): formulario de inicio de sesión
// ============================================================
(function () {
    var form = document.getElementById('login-form');
    var pass = document.getElementById('password');
    var boton = document.getElementById('login-mostrar');
    var estado = document.getElementById('login-estado');
    if (!form) return;

    // Si se llegó desde el carrito o desde "Agregar al carrito", se avisa por qué se pide iniciar sesión
    var avisos = {
        carrito: 'Iniciá sesión para ver tu carrito.',
        agregar: 'Iniciá sesión para agregar productos al carrito.'
    };
    var motivo = new URLSearchParams(window.location.search).get('desde');
    if (avisos[motivo]) {
        var aviso = document.getElementById('login-aviso');
        aviso.textContent = avisos[motivo];
        aviso.classList.remove('hidden');
    }

    // Mostrar / ocultar la contraseña
    boton.addEventListener('click', function () {
        var visible = pass.type === 'text';
        pass.type = visible ? 'password' : 'text';
        boton.textContent = visible ? 'Mostrar' : 'Ocultar';
        boton.setAttribute('aria-pressed', String(!visible));
    });

    // Todavía no hay servidor: se valida el formulario pero no se envía a ningún lado
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        estado.textContent = 'Formulario completo. El inicio de sesión todavía no está conectado a un servidor.';
        estado.classList.remove('hidden');
    });
})();
