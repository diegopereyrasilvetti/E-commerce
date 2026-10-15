/* Datos de la calculadora de cuello de botella (página /calculadora).

   "rendimiento" es un índice ORIENTATIVO de rendimiento en juegos a 1080p (no son mediciones exactas):
   - Procesadores: 100 equivale a un procesador de gama media (por ejemplo un Ryzen 5 5600).
   - Placas de video: 100 equivale a una placa de gama media (por ejemplo una RTX 4060).
   - Un procesador y una placa con el mismo índice se consideran equilibrados a 1080p.
   Para agregar un componente, sumá una línea con su nombre y su índice (más alto = más potente).
   Conviene revisar estos valores con reseñas o benchmarks antes de publicar la página. */
export const HARDWARE = {
    procesadores: [
        { nombre: "AMD Ryzen 3 3200G", rendimiento: 45 },
        { nombre: "AMD Ryzen 5 3400G", rendimiento: 55 },
        { nombre: "AMD Ryzen 5 5500", rendimiento: 90 },
        { nombre: "AMD Ryzen 5 5600", rendimiento: 100 },
        { nombre: "Intel Core i5-12400F", rendimiento: 100 },
        { nombre: "Intel Core i5-13400F", rendimiento: 110 },
        { nombre: "AMD Ryzen 7 5800X3D", rendimiento: 125 },
        { nombre: "Intel Core i7-13700K", rendimiento: 150 },
        { nombre: "AMD Ryzen 7 7800X3D", rendimiento: 170 }
    ],
    placas: [
        { nombre: "NVIDIA GeForce GTX 1650", rendimiento: 45 },
        { nombre: "NVIDIA GeForce RTX 3060", rendimiento: 85 },
        { nombre: "AMD Radeon RX 6600", rendimiento: 90 },
        { nombre: "NVIDIA GeForce RTX 4060", rendimiento: 100 },
        { nombre: "NVIDIA GeForce RTX 4060 Ti", rendimiento: 118 },
        { nombre: "MSI GeForce RTX 5060 Ti 8GB", rendimiento: 130 },
        { nombre: "NVIDIA GeForce RTX 4070 Super", rendimiento: 175 },
        { nombre: "NVIDIA GeForce RTX 4080", rendimiento: 260 }
    ],
    // Cuánta placa de video "exige" cada resolución respecto de 1080p. Es un valor estimado: se puede ajustar.
    resoluciones: [
        { nombre: "1080p (Full HD)", exigencia: 1 },
        { nombre: "1440p (2K)", exigencia: 1.3 },
        { nombre: "2160p (4K)", exigencia: 2 }
    ]
};
