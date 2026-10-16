import { describe, expect, it } from 'vitest'
import { formatoPesos, porcentajeDe, precioANumero, precioConDescuento, valorCuota } from './dinero.js'

describe('precioANumero', () => {
  it('convierte un precio con formato en un número', () => {
    expect(precioANumero('$ 723.042')).toBe(723042)
    expect(precioANumero('$ 1.056.650')).toBe(1056650)
  })
  it('un texto sin números da 0', () => {
    expect(precioANumero('')).toBe(0)
    expect(precioANumero('gratis')).toBe(0)
  })
})

describe('formatoPesos', () => {
  it('formatea con puntos de miles y el signo $', () => {
    expect(formatoPesos(723042)).toBe('$ 723.042')
    expect(formatoPesos(999)).toBe('$ 999')
    expect(formatoPesos(1056650)).toBe('$ 1.056.650')
  })
  it('redondea al peso', () => {
    expect(formatoPesos(19444.4)).toBe('$ 19.444')
  })
  it('ida y vuelta: formatear y volver a convertir da el mismo número', () => {
    expect(precioANumero(formatoPesos(1234567))).toBe(1234567)
  })
})

describe('descuentos y cuotas', () => {
  it('precioConDescuento aplica el porcentaje y redondea al peso', () => {
    expect(precioConDescuento(100000, 10)).toBe(90000)
    expect(precioConDescuento(723042, 10)).toBe(650738) // 650737,8
    expect(precioConDescuento(5000, 0)).toBe(5000)
  })

  it('valorCuota redondea hacia arriba: las cuotas nunca suman menos que el total', () => {
    expect(valorCuota(233333, 12)).toBe(19445)
    expect(valorCuota(233333, 12) * 12).toBeGreaterThanOrEqual(233333)
    expect(valorCuota(1200, 12)).toBe(100)
  })

  it('porcentajeDe lee un "10%"', () => {
    expect(porcentajeDe('10%')).toBe(10)
    expect(porcentajeDe('')).toBe(0)
    expect(porcentajeDe(undefined)).toBe(0)
  })
})
