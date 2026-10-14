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
// Inicio (index.html): productos destacados que rotan cada 8 segundos
// ============================================================
(function () {
    var grid = document.getElementById('destacados-grid');
    var productos = window.PRODUCTOS || [];
    if (!grid || !productos.length) { if (grid) grid.parentNode.hidden = true; return; }

    var CANTIDAD = 4;      // tarjetas visibles
    var INTERVALO = 8000;  // cambia cada 8 segundos
    var actuales = [];
    var timer = null;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mezcla la lista y toma N, evitando repetir los que ya se ven si alcanzan los demás
    function elegir() {
        var pool = productos.filter(function (p) { return actuales.indexOf(p) === -1; });
        if (pool.length < CANTIDAD) pool = productos.slice();
        for (var i = pool.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
        }
        return pool.slice(0, Math.min(CANTIDAD, pool.length));
    }

    function tarjeta(p) {
        var a = document.createElement('a');
        a.className = 'flex flex-col gap-1.5 p-2.5 min-[768px]:gap-2 min-[768px]:p-3.5 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-xl shadow-[0_2px_6px_rgba(15,23,42,0.08)] [transition:transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-3px)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.18)] focus-visible:[transform:translateY(-3px)] focus-visible:shadow-[0_8px_18px_rgba(15,23,42,0.18)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2';
        a.href = './productos.html#' + p.categoriaId;

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
// Login (login.html): formulario de inicio de sesión
// ============================================================
(function () {
    var form = document.getElementById('login-form');
    var pass = document.getElementById('password');
    var boton = document.getElementById('login-mostrar');
    var estado = document.getElementById('login-estado');
    if (!form) return;

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
