import { describe, expect, it } from 'vitest'
import { CUOTAS_PERMITIDAS, calcularPedido } from '../src/pedidos/calculo.js'

const catalogo = new Map([
  ['a', { id: 'id-a', nombre: 'Producto A', precio: 100000, descuento: 10 }],
  ['b', { id: 'id-b', nombre: 'Producto B', precio: 33333, descuento: 0 }],
])
const items = [{ slug: 'a', cantidad: 2 }, { slug: 'b', cantidad: 1 }]

describe('calcularPedido', () => {
  it('suma los renglones (precio de la base x cantidad)', () => {
    const pedido = calcularPedido({ items, productosPorSlug: catalogo, medioPago: 'tarjeta', cuotas: 1 })
    expect(pedido.lineas).toHaveLength(2)
    expect(pedido.lineas[0]).toMatchObject({ productoId: 'id-a', nombre: 'Producto A', precioUnitario: 100000, cantidad: 2, subtotal: 200000 })
    expect(pedido.subtotal).toBe(233333)
  })

  it('con tarjeta no hay descuento y las cuotas se respetan', () => {
    const pedido = calcularPedido({ items, productosPorSlug: catalogo, medioPago: 'tarjeta', cuotas: 12 })
    expect(pedido.descuento).toBe(0)
    expect(pedido.total).toBe(233333)
    expect(pedido.cuotas).toBe(12)
  })

  it('la cuota se redondea hacia arriba para que las cuotas nunca sumen menos que el total', () => {
    const pedido = calcularPedido({ items, productosPorSlug: catalogo, medioPago: 'tarjeta', cuotas: 12 })
    expect(pedido.valorCuota).toBe(19445) // 233333 / 12 = 19444,4...
    expect(pedido.valorCuota * pedido.cuotas).toBeGreaterThanOrEqual(pedido.total)
  })

  it('con transferencia se aplica el descuento de cada producto y es un pago único', () => {
    const pedido = calcularPedido({ items, productosPorSlug: catalogo, medioPago: 'transferencia', cuotas: 12 })
    expect(pedido.descuento).toBe(20000) // 10% de 200000; el producto B no tiene descuento
    expect(pedido.total).toBe(213333)
    expect(pedido.cuotas).toBe(1) // aunque pidan cuotas
    expect(pedido.valorCuota).toBe(213333)
  })

  it('total = subtotal - descuento', () => {
    const pedido = calcularPedido({ items, productosPorSlug: catalogo, medioPago: 'transferencia', cuotas: 1 })
    expect(pedido.total).toBe(pedido.subtotal - pedido.descuento)
  })

  it('redondea el descuento al peso más cercano', () => {
    const chico = new Map([['x', { id: 'x', nombre: 'X', precio: 105, descuento: 10 }]]) // 10,5
    const pedido = calcularPedido({ items: [{ slug: 'x', cantidad: 1 }], productosPorSlug: chico, medioPago: 'transferencia', cuotas: 1 })
    expect(Number.isInteger(pedido.descuento)).toBe(true)
    expect(pedido.descuento).toBe(11)
  })

  it('las cuotas permitidas son las del sitio', () => {
    expect(CUOTAS_PERMITIDAS).toEqual([1, 6, 12, 18])
  })
})
