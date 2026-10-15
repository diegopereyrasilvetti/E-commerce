import { describe, expect, it } from 'vitest'
import { formatoPesos, precioANumero } from './dinero.js'

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
