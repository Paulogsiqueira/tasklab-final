const CHAVE = 'tasklab:tarefas'

export function semente() {
  return [
    { id: 1, titulo: 'Estudar props e eventos', concluida: true },
    { id: 2, titulo: 'Montar a store do TaskLab', concluida: false },
    { id: 3, titulo: 'Configurar o Vue Router', concluida: false }
  ]
}

export function salvar(tarefas) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(tarefas))
  } catch {
    // storage cheio/bloqueado, segue sem salvar
  }
}

// null se vazio; lança erro se corrompido
export function lerSalvas() {
  let bruto
  try {
    bruto = localStorage.getItem(CHAVE)
  } catch {
    return null
  }
  if (bruto === null) return null
  try {
    const dados = JSON.parse(bruto)
    if (!Array.isArray(dados)) throw new Error('formato')
    return dados.filter(
      (t) => t && Number.isInteger(t.id) && typeof t.titulo === 'string' && typeof t.concluida === 'boolean'
    )
  } catch {
    localStorage.removeItem(CHAVE)
    throw new Error('Os dados salvos estavam corrompidos e foram descartados.')
  }
}
