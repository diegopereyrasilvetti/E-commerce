import { useState } from 'react'

/* Maneja los valores de un formulario y sus errores.
   - inicial: { campo: valorInicial }
   - reglas:  { campo: (valor, todosLosValores) => mensajeDeError | '' }  (ver utils/validaciones.js)

   Un error se muestra cuando el usuario sale del campo o intenta enviar el formulario,
   así no se le marca un error mientras todavía está escribiendo por primera vez. */
export function useFormulario(inicial, reglas) {
  const [valores, setValores] = useState(inicial)
  const [tocados, setTocados] = useState({})

  const errores = {}
  for (const campo of Object.keys(reglas)) errores[campo] = reglas[campo](valores[campo], valores)
  const valido = Object.values(errores).every((e) => !e)

  // Propiedades para un campo: <input {...campo('email')} />
  function campo(nombre) {
    return {
      name: nombre,
      value: valores[nombre],
      error: tocados[nombre] ? errores[nombre] : '',
      onChange: (e) => {
        const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setValores((v) => ({ ...v, [nombre]: valor }))
      },
      onBlur: () => setTocados((t) => ({ ...t, [nombre]: true })),
    }
  }

  // Devuelve el manejador del submit: si hay errores los muestra todos, si no llama a `alEnviar(valores)`
  function enviar(alEnviar) {
    return (e) => {
      e.preventDefault()
      setTocados(Object.fromEntries(Object.keys(reglas).map((k) => [k, true])))
      if (valido) alEnviar(valores)
    }
  }

  return { campo, enviar }
}
