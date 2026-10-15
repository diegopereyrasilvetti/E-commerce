import { describe, expect, it } from 'vitest'
import { leerConfig } from '../src/config.js'
import { slugDe } from '../src/slug.js'

describe('slugDe', () => {
  it('convierte un nombre en un identificador para la dirección', () => {
    expect(slugDe('Mother ASUS ROG STRIX B850-F GAMING WIFI')).toBe('mother-asus-rog-strix-b850-f-gaming-wifi')
  })

  it('quita tildes y símbolos', () => {
    expect(slugDe('Memoria Corsair DDR5 16GB (2x8GB) — Refrigeración')).toBe('memoria-corsair-ddr5-16gb-2x8gb-refrigeracion')
  })

  it('no deja guiones al principio ni al final ni repetidos', () => {
    expect(slugDe('  --Hola   Mundo--  ')).toBe('hola-mundo')
  })

  it('limita el largo a 60 caracteres cortando en una palabra entera', () => {
    const slug = slugDe('Procesador AMD Ryzen 7 5800X3D 4.5GHz Turbo AM4 10th Anniversary Edition')
    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug).toBe('procesador-amd-ryzen-7-5800x3d-4-5ghz-turbo-am4-10th')
    expect(slug).not.toMatch(/-$/)
  })

  it('solo genera letras minúsculas, números y guiones (lo que acepta la base)', () => {
    expect(slugDe('Teclado Mecánico "Gamer" Ñandú #1')).toMatch(/^[a-z0-9-]+$/)
  })
})

describe('leerConfig', () => {
  const base = { SUPABASE_URL: 'https://proyecto.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_' + 'x'.repeat(30) }

  it('aplica los valores por defecto', () => {
    const config = leerConfig(base)
    expect(config.PORT).toBe(3001)
    expect(config.NODE_ENV).toBe('development')
    expect(config.CORS_ORIGINS).toEqual(['http://localhost:5173'])
    expect(config.PEDIDOS_HABILITADOS).toBe(false) // el sitio es de demostración
  })

  it('convierte el puerto en número y la lista de sitios permitidos en arreglo', () => {
    const config = leerConfig({ ...base, PORT: '8080', CORS_ORIGINS: 'https://a.com, https://b.com ,' })
    expect(config.PORT).toBe(8080)
    expect(config.CORS_ORIGINS).toEqual(['https://a.com', 'https://b.com'])
  })

  it('PEDIDOS_HABILITADOS solo se activa con "true"', () => {
    expect(leerConfig({ ...base, PEDIDOS_HABILITADOS: 'true' }).PEDIDOS_HABILITADOS).toBe(true)
    expect(() => leerConfig({ ...base, PEDIDOS_HABILITADOS: 'si' })).toThrow(/PEDIDOS_HABILITADOS/)
  })

  it('si falta la clave secret, dice cuál es el problema', () => {
    expect(() => leerConfig({ SUPABASE_URL: base.SUPABASE_URL })).toThrow(/SUPABASE_SECRET_KEY/)
  })

  it('rechaza una URL de Supabase inválida', () => {
    expect(() => leerConfig({ ...base, SUPABASE_URL: 'no-es-una-url' })).toThrow(/SUPABASE_URL/)
  })
})
