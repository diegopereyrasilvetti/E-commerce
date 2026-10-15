// "Mother ASUS ROG STRIX B850-F GAMING WIFI" -> "mother-asus-rog-strix-b850-f-gaming-wifi"
// (sin tildes ni símbolos y de hasta 60 caracteres, cortado en una palabra entera)
export function slugDe(texto) {
  const completo = texto
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (completo.length <= 60) return completo
  const corte = completo.slice(0, 60)
  const ultimo = corte.lastIndexOf('-')
  return ultimo > 30 ? corte.slice(0, ultimo) : corte
}
