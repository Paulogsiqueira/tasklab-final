// server/repositorio.mjs
// "Banco de dados" da demo do MCP: um arquivo JSON com UM único escritor (o proxy).
// O servidor MCP e o app Vue falam com o proxy por HTTP, nunca com o arquivo.

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ARQUIVO = process.env.TASKLAB_DADOS ?? fileURLToPath(new URL('./dados/tarefas.json', import.meta.url))
const MAXIMO_TAREFAS = 200
const MAXIMO_TITULO = 80

// Erro "esperado" (entrada ruim, id inexistente, conflito): vira uma resposta HTTP.
export class ErroDeUso extends Error {
  constructor(status, mensagem, extra = {}) {
    super(mensagem)
    this.status = status
    this.extra = extra
  }
}

function semente() {
  return [
    { id: '1', titulo: 'Ler Vue', concluida: false },
    { id: '2', titulo: 'Praticar CSS', concluida: true },
    { id: '3', titulo: 'Revisar Vue', concluida: true }
  ]
}

const tarefaValida = (t) =>
  t && typeof t.id === 'string' && t.id !== '' && t.id.length <= 64 && typeof t.titulo === 'string' && typeof t.concluida === 'boolean'

let estado = null // { versao, tarefas }: a cópia em memória
let fila = Promise.resolve()

// Uma operação por vez: ler-modificar-gravar nunca se atropelam.
function serializar(operacao) {
  const execucao = fila.then(operacao)
  fila = execucao.catch(() => {})
  return execucao
}

async function gravar() {
  await mkdir(dirname(ARQUIVO), { recursive: true })
  const temporario = `${ARQUIVO}.tmp`
  await writeFile(temporario, JSON.stringify(estado, null, 2), 'utf8')
  await rename(temporario, ARQUIVO) // troca atômica: o arquivo nunca fica pela metade
}

async function garantirEstado() {
  if (estado) return
  try {
    const dados = JSON.parse(await readFile(ARQUIVO, 'utf8'))
    if (!Array.isArray(dados.tarefas) || !Number.isInteger(dados.versao)) throw new Error('formato')
    estado = { versao: dados.versao, tarefas: dados.tarefas.filter(tarefaValida) }
  } catch {
    estado = { versao: 1, tarefas: semente() }
    await gravar()
  }
}

// Se gravar falhar, volta ao estado anterior: memória e arquivo não divergem.
async function confirmar(proximo) {
  const anterior = estado
  estado = proximo
  try {
    await gravar()
  } catch (erro) {
    estado = anterior
    throw erro
  }
}

function limparTitulo(titulo) {
  const limpo = typeof titulo === 'string' ? titulo.trim().slice(0, MAXIMO_TITULO) : ''
  if (!limpo) throw new ErroDeUso(400, 'O título da tarefa é obrigatório.')
  return limpo
}

export const lerTudo = () =>
  serializar(async () => {
    await garantirEstado()
    return structuredClone(estado)
  })

export const adicionarTarefa = (titulo) =>
  serializar(async () => {
    await garantirEstado()
    const limpo = limparTitulo(titulo)
    if (estado.tarefas.length >= MAXIMO_TAREFAS) throw new ErroDeUso(400, 'Limite de tarefas atingido.')
    const id = randomUUID()
    const tarefa = { id, titulo: limpo, concluida: false }
    await confirmar({ versao: estado.versao + 1, tarefas: [...estado.tarefas, tarefa] })
    return { versao: estado.versao, tarefa }
  })

export const alternarTarefa = (id) =>
  serializar(async () => {
    await garantirEstado()
    if (typeof id !== 'string' || id === '') throw new ErroDeUso(400, 'O id deve ser um texto: use o id que aparece em listar_tarefas.')
    const atual = estado.tarefas.find((t) => t.id === id)
    if (!atual) throw new ErroDeUso(404, `Não existe tarefa com o id ${id}.`)
    const tarefa = { ...atual, concluida: !atual.concluida }
    await confirmar({
      versao: estado.versao + 1,
      tarefas: estado.tarefas.map((t) => (t.id === id ? tarefa : t))
    })
    return { versao: estado.versao, tarefa }
  })

// Usada pelo app Vue: troca a lista inteira, mas só se ele partiu da versão atual
// (concorrência otimista). Se outra pessoa ou o MCP mexeu antes, devolve 409 e o estado atual.
export const substituirTudo = (tarefas, versaoBase) =>
  serializar(async () => {
    await garantirEstado()
    if (!Array.isArray(tarefas) || tarefas.length > MAXIMO_TAREFAS || !tarefas.every(tarefaValida)) {
      throw new ErroDeUso(400, 'Lista de tarefas inválida.')
    }
    const ids = new Set(tarefas.map((t) => t.id))
    if (ids.size !== tarefas.length) throw new ErroDeUso(400, 'Há ids repetidos na lista.')
    if (versaoBase !== estado.versao) {
      throw new ErroDeUso(409, 'As tarefas mudaram desde a última leitura.', structuredClone(estado))
    }
    const limpas = tarefas.map((t) => ({ id: t.id, titulo: t.titulo.trim().slice(0, MAXIMO_TITULO), concluida: t.concluida }))
    await confirmar({ versao: estado.versao + 1, tarefas: limpas })
    return structuredClone(estado)
  })
