import { describe, expect, it } from 'vitest'
import {
  aceptado, codigoPostal, email, nombre, obligatorio, passwordIngreso, passwordNueva, repetirPassword, telefonoOpcional,
} from './validaciones.js'

describe('nombre', () => {
  it('pide un nombre de al menos 2 letras', () => {
    expect(nombre('')).toMatch(/nombre/i)
    expect(nombre('  ')).toMatch(/nombre/i)
    expect(nombre('A')).toMatch(/2 letras/)
    expect(nombre('Ana')).toBe('')
  })
})

describe('email', () => {
  it.each(['nombre@correo.com', 'a.b+c@sub.dominio.com.ar', '  espacios@correo.com  '])('acepta %s', (valor) => {
    expect(email(valor)).toBe('')
  })
  it.each(['', 'sin-arroba', 'a@b', 'a@@b.com', 'a b@c.com', '@correo.com'])('rechaza "%s"', (valor) => {
    expect(email(valor)).not.toBe('')
  })
})

describe('contraseñas', () => {
  it('para ingresar solo pide que no esté vacía y que tenga 6 caracteres', () => {
    expect(passwordIngreso('')).not.toBe('')
    expect(passwordIngreso('12345')).not.toBe('')
    expect(passwordIngreso('123456')).toBe('')
  })

  it('una contraseña nueva pide 8 caracteres, con una letra y un número', () => {
    expect(passwordNueva('')).not.toBe('')
    expect(passwordNueva('abc123')).toMatch(/8 caracteres/)
    expect(passwordNueva('abcdefgh')).toMatch(/letra y un número/)
    expect(passwordNueva('12345678')).toMatch(/letra y un número/)
    expect(passwordNueva('clave1234')).toBe('')
  })

  it('repetir la contraseña tiene que coincidir con la elegida', () => {
    expect(repetirPassword('', { password: 'clave1234' })).not.toBe('')
    expect(repetirPassword('otra1234', { password: 'clave1234' })).toMatch(/no coinciden/)
    expect(repetirPassword('clave1234', { password: 'clave1234' })).toBe('')
  })
})

describe('términos', () => {
  it('hay que aceptarlos', () => {
    expect(aceptado(false)).not.toBe('')
    expect(aceptado(true)).toBe('')
  })
})

describe('direcciones y teléfono', () => {
  it('obligatorio crea una regla con su propio mensaje', () => {
    const regla = obligatorio('Ingresá la calle.')
    expect(regla('')).toBe('Ingresá la calle.')
    expect(regla('   ')).toBe('Ingresá la calle.')
    expect(regla('Corrientes')).toBe('')
  })

  it.each(['1425', 'C1425ABC', 'c1425abc', '5000'])('acepta el código postal %s', (valor) => {
    expect(codigoPostal(valor)).toBe('')
  })
  it.each(['', '12', '14255', 'ABCDE', '1425-A'])('rechaza el código postal "%s"', (valor) => {
    expect(codigoPostal(valor)).not.toBe('')
  })

  it('el teléfono es opcional pero, si se escribe, tiene que parecer un teléfono', () => {
    expect(telefonoOpcional('')).toBe('')
    expect(telefonoOpcional('+54 11 5555-1234')).toBe('')
    expect(telefonoOpcional('(011) 5555 1234')).toBe('')
    expect(telefonoOpcional('abc')).not.toBe('')
    expect(telefonoOpcional('123')).not.toBe('')
  })
})
