// chamadas ao proxy (/api) + validação da resposta
import { sanitizar } from '../utils/sanitizar'
import { validarAcoes } from '../utils/acoes'

async function post(url, corpo, signal) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
    signal
  })
  if (!resp.ok) throw new Error('A IA não respondeu.')
  return resp.json()
}

export async function pedirPassos(tarefa, signal) {
  const dados = await post('/api/quebrar', { tarefa }, signal)
  return sanitizar(dados.passos)
}

// proxy usa id string, o app usa number
function idDoProxy(acao) {
  if (acao && typeof acao === 'object' && typeof acao.id === 'string' && /^\d+$/.test(acao.id)) {
    return { ...acao, id: Number(acao.id) }
  }
  return acao
}

// manda só o necessário (id, titulo, concluida)
export async function pedirAcoes(texto, tarefas, signal) {
  const resumo = tarefas
    .slice(0, 30)
    .map(({ id, titulo, concluida }) => ({ id: String(id), titulo, concluida }))
  const dados = await post('/api/agir', { texto, tarefas: resumo }, signal)
  const acoes = Array.isArray(dados.acoes) ? dados.acoes.map(idDoProxy) : dados.acoes
  return validarAcoes(acoes, tarefas)
}
