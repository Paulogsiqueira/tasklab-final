export const FILTROS = ['todas', 'pendentes', 'concluidas']
export const ROTULOS = { todas: 'Todas', pendentes: 'Pendentes', concluidas: 'Concluídas' }

// valor inválido (url/IA) vira 'todas'
export function filtroValido(valor) {
  return FILTROS.includes(valor) ? valor : 'todas'
}

export function validarFiltroIA(dados) {
  const busca = typeof dados?.busca === 'string' ? dados.busca.trim().slice(0, 40) : ''
  return { busca, filtro: filtroValido(dados?.filtro) }
}

export function aplicarFiltro(tarefas, busca, filtro) {
  const termo = busca.trim().toLowerCase()
  return tarefas.filter((t) => {
    if (filtro === 'pendentes' && t.concluida) return false
    if (filtro === 'concluidas' && !t.concluida) return false
    return !termo || t.titulo.toLowerCase().includes(termo)
  })
}
