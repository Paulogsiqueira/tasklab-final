// trata saída da IA: tipo, trim, limite e sem duplicados
export function sanitizar(lista, maximo = 5) {
  if (!Array.isArray(lista)) return []
  const vistos = new Set()
  const saida = []
  for (const item of lista) {
    if (typeof item !== 'string') continue
    const texto = item.trim().slice(0, 80)
    const chave = texto.toLowerCase()
    if (!texto || vistos.has(chave)) continue
    vistos.add(chave)
    saida.push(texto)
    if (saida.length === maximo) break
  }
  return saida
}
