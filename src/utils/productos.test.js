import { describe, expect, it } from 'vitest'
import { buscarProductos, idDe, normalizar, productoPorId, rutaDe } from './productos.js'

const productos = [
  { slug: 'procesador-amd-ryzen-5-5500', nombre: 'Procesador AMD Ryzen 5 5500', categoria: 'Procesadores', categoriaId: 'procesadores' },
  { slug: 'procesador-amd-ryzen-7-5800x3d', nombre: 'Procesador AMD Ryzen 7 5800X3D', categoria: 'Procesadores', categoriaId: 'procesadores' },
  { slug: 'cooler-fan-asus-tuf-120mm', nombre: 'Cooler Fan ASUS TUF 120mm', categoria: 'Refrigeración', categoriaId: 'refrigeracion' },
  { slug: 'mother-asus-rog-strix', nombre: 'Mother ASUS ROG STRIX', categoria: 'Mothers', categoriaId: 'mothers' },
]

describe('normalizar', () => {
  it('quita tildes y mayúsculas', () => {
    expect(normalizar('Refrigeración')).toBe('refrigeracion')
    expect(normalizar('ÑANDÚ')).toBe('nandu')
  })
})

describe('buscarProductos', () => {
  it('encuentra por el nombre sin importar mayúsculas', () => {
    expect(buscarProductos(productos, 'RYZEN').map((p) => p.slug)).toEqual(['procesador-amd-ryzen-5-5500', 'procesador-amd-ryzen-7-5800x3d'])
  })

  it('todas las palabras tienen que coincidir', () => {
    expect(buscarProductos(productos, 'ryzen 7').map((p) => p.slug)).toEqual(['procesador-amd-ryzen-7-5800x3d'])
    expect(buscarProductos(productos, 'ryzen rog')).toEqual([])
  })

  it('también busca por categoría, sin importar las tildes', () => {
    expect(buscarProductos(productos, 'refrigeracion').map((p) => p.slug)).toEqual(['cooler-fan-asus-tuf-120mm'])
  })

  it('los que coinciden por el nombre van antes que los que coinciden solo por la categoría', () => {
    const lista = [{ slug: 'a', nombre: 'Placa', categoria: 'Mothers' }, { slug: 'b', nombre: 'Mother ASUS', categoria: 'Otra' }]
    expect(buscarProductos(lista, 'mother').map((p) => p.slug)).toEqual(['b', 'a'])
  })

  it('respeta el límite de resultados', () => {
    expect(buscarProductos(productos, 'a', 2)).toHaveLength(2)
  })

  it('una búsqueda vacía o de solo espacios no devuelve nada', () => {
    expect(buscarProductos(productos, '')).toEqual([])
    expect(buscarProductos(productos, '   ')).toEqual([])
  })
})

describe('enlaces a un producto', () => {
  it('el identificador es el slug', () => {
    expect(idDe(productos[3])).toBe('mother-asus-rog-strix')
  })

  it('la ruta lleva a la página del producto', () => {
    expect(rutaDe(productos[3])).toBe('/producto/mother-asus-rog-strix')
  })

  it('productoPorId lo encuentra, y devuelve undefined si no existe o no hay id', () => {
    expect(productoPorId(productos, 'cooler-fan-asus-tuf-120mm')).toBe(productos[2])
    expect(productoPorId(productos, 'no-existe')).toBeUndefined()
    expect(productoPorId(productos, null)).toBeUndefined()
  })
})
