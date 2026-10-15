/* Productos de la tienda. Para agregar uno, sumá un objeto a la lista:
   - categoriaId: uno de los ids de src/data/categorias.js (define en qué categoría aparece)
   - imagen: ruta dentro de public/ (por ejemplo "images/Productos/Cooler/coolerx3.jpg"); se usa también como identificador en el carrito
   - precio, precioSinImpuestos: texto con el formato "$ 723.042"; descuento: por pago con transferencia ("10%") */
export const PRODUCTOS = [
    {
        "nombre": "Procesador AMD Ryzen 7 5800X3D 4.5GHz Turbo AM4 10th Anniversary Edition",
        "precio": "$ 723.042",
        "precioSinImpuestos": "$ 654.337",
        "imagen": "images/Productos/Procesadores/compragamer_Imganen_general_55494_Procesador_AMD_Ryzen_7_5800X3D_4.5GHz_Turbo_AM4_10th_Anniversary_Edition_c4f9572a-grn.jpg",
        "categoria": "Procesadores",
        "categoriaId": "procesadores",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Procesador AMD Ryzen 3 3200G 4.0GHz Turbo + Radeon Vega 8 AM4 + Wraith Stealth Cooler",
        "precio": "$ 114.712",
        "precioSinImpuestos": "$ 103.812",
        "imagen": "images/Productos/Procesadores/compragamer_Imganen_general_16752_Procesador_AMD_Ryzen_3_3200G_4.0GHz_Turbo___Radeon_Vega_8_AM4___Wraith_Stealth_Cooler_f414a507-grn.jpg",
        "categoria": "Procesadores",
        "categoriaId": "procesadores",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Procesador AMD Ryzen 5 3400G 4.2GHz Turbo Radeon Vega 11 AM4 Wraith Spire Cooler",
        "precio": "$ 151.950",
        "precioSinImpuestos": "$ 137.511",
        "imagen": "images/Productos/Procesadores/ryzen 5 3400g.jpg",
        "categoria": "Procesadores",
        "categoriaId": "procesadores",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Procesador AMD Ryzen 5 5500 4.2GHz Turbo AM4 + Wraith Stealth Cooler",
        "precio": "$ 183.700",
        "precioSinImpuestos": "$ 166.244",
        "imagen": "images/Productos/Procesadores/ryzen 5 5500.jpg",
        "categoria": "Procesadores",
        "categoriaId": "procesadores",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Memoria Corsair DDR5 16GB 6000MHz Vengeance CL38 Grey Intel XMP 3.0 / AMD EXPO",
        "precio": "$ 473.525",
        "precioSinImpuestos": "$ 428.529",
        "imagen": "images/Productos/Memorias Ram/memoria vengance.jpg",
        "categoria": "Memorias RAM",
        "categoriaId": "memorias-ram",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Memoria Corsair DDR5 16GB 6000MHz Vengeance RGB CL38 Grey Intel XMP 3.0 / AMD EXPO",
        "precio": "$ 493.176",
        "precioSinImpuestos": "$ 446.313",
        "imagen": "images/Productos/Memorias Ram/memoria vengance rgb.jpg",
        "categoria": "Memorias RAM",
        "categoriaId": "memorias-ram",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Memoria Patriot Viper DDR4 16GB (2x8GB) 3200MHz Steel",
        "precio": "$ 261.700",
        "precioSinImpuestos": "$ 236.833",
        "imagen": "images/Productos/Memorias Ram/memoria patriot 2x1.jpg",
        "categoria": "Memorias RAM",
        "categoriaId": "memorias-ram",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Mother ASUS ROG STRIX B850-F GAMING WIFI AM5 DDR5",
        "precio": "$ 525.058",
        "precioSinImpuestos": "$ 475.166",
        "imagen": "images/Productos/Mothers/mother asus rog.jpg",
        "categoria": "Mothers",
        "categoriaId": "mothers",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Mother ASUS ROG STRIX X870E-E GAMING WIFI7 NEO AM5",
        "precio": "$ 1.056.650",
        "precioSinImpuestos": "$ 956.244",
        "imagen": "images/Productos/Mothers/ASUS ROG STRIX X870E-E GAMING WIFI7 NEO AM5.jpg",
        "categoria": "Mothers",
        "categoriaId": "mothers",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Mother Gigabyte B850I AORUS PRO WIFI7 AM5",
        "precio": "$ 447.900",
        "precioSinImpuestos": "$ 405.339",
        "imagen": "images/Productos/Mothers/Gigabyte B850I AORUS.jpg",
        "categoria": "Mothers",
        "categoriaId": "mothers",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Mother ASUS TUF GAMING A620AM-PLUS WIFI AM5 DDR5",
        "precio": "$ 202.072",
        "precioSinImpuestos": "$ 182.871",
        "imagen": "images/Productos/Mothers/tuf a620am.jpg",
        "categoria": "Mothers",
        "categoriaId": "mothers",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Placa de Video MSI GeForce RTX 5060 TI 8GB SHADOW X2 OC PLUS",
        "precio": "$ 910.814",
        "precioSinImpuestos": "$ 824.266",
        "imagen": "images/Productos/Placa de video/compragamer_Imganen_general_52710_Placa_de_Video_MSI_GeForce_RTX_5060_TI_8GB_SHADOW_X2_OC_PLUS_76dfe3fb-grn.jpg",
        "categoria": "Placas de Video",
        "categoriaId": "placas-de-video",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Disco Sólido SSD Kingston 960GB A400 SATA 500MB/s",
        "precio": "$ 230.750",
        "precioSinImpuestos": "$ 208.824",
        "imagen": "images/Productos/Almacenamiento/Disco_S__lido_SSD_Kingston 960GB.jpg",
        "categoria": "Almacenamiento",
        "categoriaId": "almacenamiento",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Disco Sólido SSD M.2 Kingston 500GB NV3 5000MB/s NVMe PCI-E Gen4 x4",
        "precio": "$ 178.850",
        "precioSinImpuestos": "$ 161.855",
        "imagen": "images/Productos/Almacenamiento/Disco Sólido SSD M.2 Kingston 500GB NV3.jpg",
        "categoria": "Almacenamiento",
        "categoriaId": "almacenamiento",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Disco Solido SSD M.2 ADATA 1TB Legend 900 PRO 7400MB/s NVMe PCIe Gen4 x4",
        "precio": "$ 383.750",
        "precioSinImpuestos": "$ 347.285",
        "imagen": "images/Productos/Almacenamiento/Disco Solido SSD M.2 ADATA 1TB.jpg",
        "categoria": "Almacenamiento",
        "categoriaId": "almacenamiento",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Disco Sólido SSD Sandisk 1TB Plus SATA 545MB/s",
        "precio": "$ 268.750",
        "precioSinImpuestos": "$ 243.213",
        "imagen": "images/Productos/Almacenamiento/Disco Sólido SSD Sandisk 1TB.jpg",
        "categoria": "Almacenamiento",
        "categoriaId": "almacenamiento",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Cooler Fan ASUS TUF 120mm TF120 ARGB KIT x3",
        "precio": "$ 89.990",
        "precioSinImpuestos": "$ 81.439",
        "imagen": "images/Productos/Cooler/coolerx3.jpg",
        "categoria": "Refrigeración",
        "categoriaId": "refrigeracion",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Coolers Fan Antec Vision Connect 120 Reverse ARGB PWM Fan KIT X3",
        "precio": "$ 46.800",
        "precioSinImpuestos": "$ 38.678",
        "imagen": "images/Productos/Cooler/Coolers_Fan_Antec_Connect_120_ARGB_PWM_Fan_KIT_X3_814bca8e-grn.jpg",
        "categoria": "Refrigeración",
        "categoriaId": "refrigeracion",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Gabinete Antec VX310 RGB Black 4x120mm Vidrio Templado",
        "precio": "$ 59.990",
        "precioSinImpuestos": "$ 54.290",
        "imagen": "images/Productos/Gabinetes/gabinete antec.jpg",
        "categoria": "Gabinetes",
        "categoriaId": "gabinetes",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Gabinete Antec C5 ARGB Black 7x120mm ARGB Fans Vidrio Templado 270° Inc Controladora",
        "precio": "$ 198.500",
        "precioSinImpuestos": "$ 179.638",
        "imagen": "images/Productos/Gabinetes/antec c5.jpg",
        "categoria": "Gabinetes",
        "categoriaId": "gabinetes",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Fuente Cooler Master 750W 80 Plus Gold Full Modular MWE V3 ATX 3.1 PCIe 5.1",
        "precio": "$ 150.950",
        "precioSinImpuestos": "$ 136.606",
        "imagen": "images/Productos/Fuente/fuentecoolermaster.jpg",
        "categoria": "Fuentes",
        "categoriaId": "fuentes",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Fuente Corsair SFX 850W 80 Plus Platinum Full Modular SF850 ITX ATX 3.1 PCIe 5.1",
        "precio": "$ 333.800",
        "precioSinImpuestos": "$ 275.868",
        "imagen": "images/Productos/Fuente/fuente corsair 850 plus platinum.jpg",
        "categoria": "Fuentes",
        "categoriaId": "fuentes",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Monitor Gamer ASUS TUF VG279Q3A-J 27\" FHD IPS 180Hz Freesync Premium G-SYNC Compatible",
        "precio": "$ 304.650",
        "precioSinImpuestos": "$ 231.673",
        "imagen": "images/Productos/Monitores/monitor tuf.jpg",
        "categoria": "Monitores",
        "categoriaId": "monitores",
        "descuento": "10%",
        "garantia": "12 meses"
    },
    {
        "nombre": "Teclado Mecanico Corsair GALLEON 100 Stream Deck 12 Botones Pantalla LCD 8000Hz Hyper Polling Switch MLX Pulse",
        "precio": "$ 603.900",
        "precioSinImpuestos": "$ 546.516",
        "imagen": "images/Productos/Perifericos/teclado corsair.jpg",
        "categoria": "Periféricos",
        "categoriaId": "perifericos",
        "descuento": "10%",
        "garantia": "12 meses"
    }
];
